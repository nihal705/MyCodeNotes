"""RAG orchestrator — ties embedding, search, routing, prompt, LLM."""
import logging
from typing import AsyncGenerator, Dict, List, Optional

from sqlalchemy import text, func
from sqlalchemy.orm import Session

from app.services.vector_store import search_similar
from app.services.router import classify_query
from app.services.llm import stream_llm
from app.prompts import load_prompt

logger = logging.getLogger(__name__)

MODE_PROMPT_MAP = {
    "hinglish": "mode_hinglish",
    "interview": "mode_interview",
    "code_review": "mode_code_review",
}


# ============================================================
# USER PROGRESS CONTEXT
# ============================================================
def _build_user_context(db: Session, user_id: int, query: str) -> str:
    """
    Build a text block summarising the user's progress.
    Injected into the system prompt so NextraAI can answer
    personalised questions like "how many have I solved?".
    """
    from app import models

    q_lower = (query or "").lower()
    wants_list = any(
        k in q_lower
        for k in [
            "how many",
            "list",
            "which problems",
            "what problems",
            "my progress",
            "solved",
            "i solved",
            "i have solved",
            "show me",
            "explain my",
            "explain all",
            "codes i",
            "recently solved",
        ]
    )
    wants_code = any(
        k in q_lower
        for k in ["code", "codes", "solution", "solutions", "explain", "show me the code"]
    )

    # ---- Stats ----
    total_problems = db.query(func.count(models.Problem.id)).scalar() or 0

    solved_rows = (
        db.query(models.Problem)
        .join(
            models.UserProblemProgress,
            (models.UserProblemProgress.problem_id == models.Problem.id)
            & (models.UserProblemProgress.problem_type == "leetcode"),
        )
        .filter(models.UserProblemProgress.user_id == user_id)
        .order_by(models.UserProblemProgress.solved_at.desc())
        .all()
    )
    solved_count = len(solved_rows)

    by_diff = {"Easy": 0, "Medium": 0, "Hard": 0}
    for p in solved_rows:
        k = p.difficulty.value if hasattr(p.difficulty, "value") else str(p.difficulty)
        if k in by_diff:
            by_diff[k] += 1

    lines = [
        "=== USER PROGRESS CONTEXT ===",
        f"The current user is authenticated. This is their own data — treat it as fact.",
        f"LeetCode problems solved: {solved_count} out of {total_problems} on the site.",
        f"Difficulty breakdown: Easy {by_diff['Easy']}, Medium {by_diff['Medium']}, Hard {by_diff['Hard']}.",
    ]

    if solved_count == 0:
        lines.append("The user hasn't marked any problems solved yet.")
    elif wants_list:
        lines.append("")
        lines.append("Solved problems (most recent first):")
        for p in solved_rows[:80]:
            diff = p.difficulty.value if hasattr(p.difficulty, "value") else str(p.difficulty)
            concept = f" · {p.concept}" if p.concept else ""
            lines.append(f"- #{p.leetcode_id} {p.title} ({diff}){concept}")
        if solved_count > 80:
            lines.append(f"... and {solved_count - 80} more")

    # ---- If they want code explanations, add a few recent ones in full ----
    if wants_code and solved_count > 0:
        lines.append("")
        lines.append(
            "The user has asked about the code of their solved problems. "
            "Below are up to 3 recently solved problems with their stored solutions:"
        )
        for p in solved_rows[:3]:
            lines.append("")
            lines.append(f"--- Problem #{p.leetcode_id} — {p.title} ---")
            if p.statement:
                lines.append(f"Statement: {p.statement[:400]}")
            if p.concept:
                lines.append(f"Concept: {p.concept}")
            if p.algorithm:
                lines.append(f"Algorithm: {p.algorithm[:400]}")
            if p.java_solution:
                lines.append(f"Java solution:\n{p.java_solution[:1200]}")
            if p.python_solution:
                lines.append(f"Python solution:\n{p.python_solution[:1200]}")

    lines.append("=== END USER CONTEXT ===")
    return "\n".join(lines)


# ============================================================
# Retrieve explicit chunks (pinned by user via ContextPicker)
# ============================================================
def _fetch_explicit_chunks(db: Session, contexts: List[Dict]) -> List[Dict]:
    if not contexts:
        return []
    out = []
    for c in contexts:
        st = c.get("source_type")
        sid = c.get("source_id")
        if not st or sid is None:
            continue
        rows = db.execute(
            text(
                """
                SELECT id, content, metadata, 1.0 AS similarity
                FROM ai_chunks
                WHERE source_type = :st AND source_id = :si
                ORDER BY id
                LIMIT 6
                """
            ),
            {"st": st, "si": sid},
        ).fetchall()
        for r in rows:
            out.append(
                {
                    "id": r.id,
                    "content": r.content,
                    "metadata": r.metadata or {},
                    "similarity": 1.0,
                }
            )
    return out


def build_context_block(chunks: list) -> str:
    if not chunks:
        return "(no relevant context found)"
    lines = []
    for i, c in enumerate(chunks, 1):
        meta = c.get("metadata", {}) or {}
        src = meta.get("title") or meta.get("name") or "Unknown"
        field = meta.get("field", "")
        lines.append(
            f"[{i}] ({meta.get('source_type', '?')} - {src} - {field})\n{c['content']}"
        )
    return "\n\n".join(lines)


def build_citations(chunks: list) -> list:
    out = []
    for i, c in enumerate(chunks, 1):
        meta = c.get("metadata", {}) or {}
        out.append(
            {
                "index": i,
                "id": c["id"],
                "source_type": meta.get("source_type"),
                "title": meta.get("title") or meta.get("name"),
                "url": meta.get("url"),
                "similarity": round(c["similarity"], 3),
            }
        )
    return out


# ============================================================
# RAG orchestration
# ============================================================
async def run_rag(
    db: Session,
    user_message: str,
    history: list,
    tier: str = "free",
    page_context: Optional[Dict] = None,
    contexts: Optional[List[Dict]] = None,
    mode: str = "normal",
    user_id: Optional[int] = None,
) -> AsyncGenerator[dict, None]:

    # 1. Explicit context from pinned sources
    explicit_chunks = _fetch_explicit_chunks(db, contexts or [])

    # 2. Vector search
    search_chunks = search_similar(db, user_message, top_k=8, min_similarity=0.15)

    # 3. Merge & dedupe
    seen = set()
    all_chunks = []
    for c in explicit_chunks + search_chunks:
        if c["id"] not in seen:
            seen.add(c["id"])
            all_chunks.append(c)

    # 4. Classify tier
    route = classify_query(user_message, all_chunks, mode=mode)
    tier_used = route["tier"]
    logger.info(
        f"[NextraAI] tier={tier_used} mode={mode} reason={route['reason']} "
        f"explicit={len(explicit_chunks)} search={len(search_chunks)}"
    )

    # 5. Build system prompt
    system_parts = [load_prompt("system")]

    mode_prompt_name = MODE_PROMPT_MAP.get(mode)
    if mode_prompt_name:
        system_parts.append(load_prompt(mode_prompt_name))

    # ---- INJECT USER PROGRESS ----
    if user_id:
        try:
            user_ctx = _build_user_context(db, user_id, user_message)
            system_parts.append(user_ctx)
        except Exception as e:
            logger.error(f"Failed to build user context: {e}")

    if contexts:
        titles = ", ".join(
            f"{c.get('source_type', '?')}:{c.get('source_id')}" for c in contexts
        )
        system_parts.append(
            f"The user has explicitly pinned these sources for this chat: {titles}. "
            "Prioritise them."
        )

    if page_context and page_context.get("title"):
        system_parts.append(
            f"The user is currently viewing: {page_context.get('title')} "
            f"({page_context.get('source_type')})."
        )

    system_prompt = "\n\n".join(system_parts)

    # 6. User prompt with retrieved context
    if tier_used in (1, 2) and all_chunks:
        template = load_prompt("rag_template")
        context = build_context_block(all_chunks[:8])
    else:
        template = load_prompt("tier3_template")
        context = ""

    user_prompt = template.format(context=context, question=user_message)

    messages = [{"role": "system", "content": system_prompt}]
    for h in history[-6:]:
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": user_prompt})

    # 7. Stream
    citations = build_citations(all_chunks[:5]) if all_chunks else []
    yield {"type": "citations", "citations": citations}
    yield {"type": "tier", "tier": tier_used, "reason": route["reason"], "mode": mode}

    async for event in stream_llm(messages, tier=tier):
        yield event

    yield {"type": "done"}