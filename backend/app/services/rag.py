"""RAG orchestrator — ties embedding, search, routing, prompt, LLM."""
import logging
import re
from typing import AsyncGenerator, Dict, List, Optional, Tuple

from sqlalchemy import text, func
from sqlalchemy.orm import Session

from app import models
from app.services.vector_store import search_similar
from app.services.router import classify_query
from app.services.llm import stream_llm
from app.prompts import load_prompt
from app.services.chunker import (
    chunk_problem,
    chunk_practice,
    chunk_concept,
    chunk_note,
)

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


# ============================================================
# Dynamic chunk retrieval & On-the-fly chunking fallback
# ============================================================
def _get_entity_chunks(db: Session, source_type: str, source_id: int, row_obj=None) -> List[Dict]:
    """
    Fetch chunks for an entity from ai_chunks.
    If ai_chunks does not have them, chunk the DB row on-the-fly!
    """
    try:
        rows = db.execute(
            text(
                """
                SELECT id, content, metadata, 1.0 AS similarity
                FROM ai_chunks
                WHERE source_type = :st AND source_id = :si
                ORDER BY id
                LIMIT 8
                """
            ),
            {"st": source_type, "si": source_id},
        ).fetchall()
        if rows:
            return [
                {
                    "id": r.id,
                    "content": r.content,
                    "metadata": r.metadata or {},
                    "similarity": 1.0,
                }
                for r in rows
            ]
    except Exception as e:
        logger.warning(f"Failed to query ai_chunks for {source_type}:{source_id}: {e}")

    # Fallback: Dynamic on-the-fly chunking from database row
    if row_obj is None:
        try:
            if source_type == "note":
                row_obj = db.query(models.Note).filter(models.Note.id == source_id).first()
            elif source_type == "leetcode":
                row_obj = db.query(models.Problem).filter(models.Problem.id == source_id).first()
            elif source_type == "concept":
                row_obj = db.query(models.Concept).filter(models.Concept.id == source_id).first()
            elif source_type == "practice":
                row_obj = db.query(models.PracticeProblem).filter(models.PracticeProblem.id == source_id).first()
        except Exception as e:
            logger.error(f"Error fetching row for {source_type}:{source_id}: {e}")

    if not row_obj:
        return []

    dynamic = []
    try:
        if source_type == "note":
            dynamic = chunk_note(row_obj)
        elif source_type == "leetcode":
            dynamic = chunk_problem(row_obj)
        elif source_type == "concept":
            dynamic = chunk_concept(row_obj)
        elif source_type == "practice":
            dynamic = chunk_practice(row_obj)
    except Exception as e:
        logger.error(f"Dynamic chunking failed for {source_type}:{source_id}: {e}")

    return [
        {
            "id": f"dyn-{source_type}-{source_id}-{i}",
            "content": ch["content"],
            "metadata": ch.get("metadata", {}),
            "similarity": 1.0,
        }
        for i, ch in enumerate(dynamic)
    ]


# ============================================================
# Deterministic URL, ID & Entity Resolver
# ============================================================
URL_PATTERNS = [
    (re.compile(r"(?:https?://[^/\s]+)?/notes/([a-zA-Z0-9_\-]+)", re.I), "note"),
    (re.compile(r"(?:https?://[^/\s]+)?/problems/(\d+)", re.I), "leetcode"),
    (re.compile(r"(?:https?://[^/\s]+)?/concepts/(\d+)", re.I), "concept"),
    (re.compile(r"(?:https?://[^/\s]+)?/practice/(\d+)", re.I), "practice"),
    (re.compile(r"\bconcept\s*(?:#|no\.?|id)?\s*(\d+)\b", re.I), "concept"),
    (re.compile(r"\bpractice\s*(?:#|no\.?|id|problem)?\s*(\d+)\b", re.I), "practice"),
    (re.compile(r"(?<!practice\s)\b(?:problem|leetcode)\s*(?:#|no\.?|id)?\s*(\d+)\b", re.I), "leetcode"),
]


def resolve_direct_entities(db: Session, user_message: str) -> Tuple[List[Dict], List[str]]:
    """
    Extracts direct URLs, IDs, slugs, or titles referenced in user_message.
    Returns (chunks, matched_titles).
    """
    chunks: List[Dict] = []
    titles: List[str] = []
    seen_entities = set()

    # 1. Regex URL & ID matching
    for pattern, stype in URL_PATTERNS:
        for m in pattern.finditer(user_message):
            val = m.group(1).strip()
            ent_key = (stype, val.lower())
            if ent_key in seen_entities:
                continue
            seen_entities.add(ent_key)

            if stype == "note":
                note = db.query(models.Note).filter(models.Note.slug == val).first()
                if not note and val.isdigit():
                    note = db.query(models.Note).filter(models.Note.id == int(val)).first()
                if note:
                    ch = _get_entity_chunks(db, "note", note.id, note)
                    if ch:
                        chunks.extend(ch)
                        titles.append(f"Note '{val}': {note.title}")

            elif stype == "leetcode":
                if val.isdigit():
                    num = int(val)
                    prob = (
                        db.query(models.Problem)
                        .filter((models.Problem.leetcode_id == num) | (models.Problem.id == num))
                        .first()
                    )
                    if prob:
                        ch = _get_entity_chunks(db, "leetcode", prob.id, prob)
                        if ch:
                            chunks.extend(ch)
                            titles.append(f"Problem at '/problems/{val}' (Site ID {prob.id}, LeetCode #{prob.leetcode_id}: {prob.title})")

            elif stype == "concept":
                if val.isdigit():
                    num = int(val)
                    conc = db.query(models.Concept).filter(models.Concept.id == num).first()
                    if conc:
                        ch = _get_entity_chunks(db, "concept", conc.id, conc)
                        if ch:
                            chunks.extend(ch)
                            titles.append(f"Concept at '/concepts/{val}' (ID {conc.id}: {conc.name})")

            elif stype == "practice":
                if val.isdigit():
                    num = int(val)
                    prac = db.query(models.PracticeProblem).filter(models.PracticeProblem.id == num).first()
                    if prac:
                        ch = _get_entity_chunks(db, "practice", prac.id, prac)
                        if ch:
                            chunks.extend(ch)
                            titles.append(f"Practice Problem at '/practice/{val}' (ID {prac.id}: {prac.title})")

    # 2. Keyword & Title search (if user mentions a section or requests by name)
    q_lower = user_message.lower()

    # A. Notes matching
    try:
        all_notes = db.query(models.Note).all()
        for n in all_notes:
            ent_key = ("note", str(n.id))
            if ent_key in seen_entities:
                continue
            slug_words = [w for w in re.split(r"[^a-zA-Z0-9]+", n.slug.lower()) if len(w) >= 3]
            title_words = [w for w in re.split(r"[^a-zA-Z0-9]+", n.title.lower()) if len(w) >= 3]

            if n.slug.lower() in q_lower or (len(n.title) >= 4 and n.title.lower() in q_lower):
                seen_entities.add(ent_key)
                ch = _get_entity_chunks(db, "note", n.id, n)
                chunks.extend(ch)
                titles.append(f"Note '{n.slug}': {n.title}")
                break
            elif ("note" in q_lower or "guide" in q_lower or "section" in q_lower) and any(
                w in q_lower for w in slug_words + title_words
            ):
                seen_entities.add(ent_key)
                ch = _get_entity_chunks(db, "note", n.id, n)
                chunks.extend(ch)
                titles.append(f"Note '{n.slug}': {n.title}")
                break
    except Exception as e:
        logger.error(f"Error resolving note keywords: {e}")

    # B. Concepts matching
    if "concept" in q_lower or not chunks:
        try:
            all_concepts = db.query(models.Concept).all()
            for c in all_concepts:
                ent_key = ("concept", str(c.id))
                if ent_key in seen_entities:
                    continue
                if len(c.name) >= 4 and c.name.lower() in q_lower:
                    seen_entities.add(ent_key)
                    ch = _get_entity_chunks(db, "concept", c.id, c)
                    chunks.extend(ch)
                    titles.append(f"Concept '{c.name}' (ID {c.id})")
                    break
        except Exception as e:
            logger.error(f"Error resolving concept keywords: {e}")

    # C. Problems matching
    if "problem" in q_lower or not chunks:
        try:
            all_problems = db.query(models.Problem).all()
            for p in all_problems:
                ent_key = ("leetcode", str(p.id))
                if ent_key in seen_entities:
                    continue
                if len(p.title) >= 4 and p.title.lower() in q_lower:
                    seen_entities.add(ent_key)
                    ch = _get_entity_chunks(db, "leetcode", p.id, p)
                    chunks.extend(ch)
                    titles.append(f"Problem '{p.title}' (Site ID {p.id}, LeetCode #{p.leetcode_id})")
                    break
        except Exception as e:
            logger.error(f"Error resolving problem keywords: {e}")

    # D. Practice problems matching
    if "practice" in q_lower or not chunks:
        try:
            all_practice = db.query(models.PracticeProblem).all()
            for pp in all_practice:
                ent_key = ("practice", str(pp.id))
                if ent_key in seen_entities:
                    continue
                if len(pp.title) >= 4 and pp.title.lower() in q_lower:
                    seen_entities.add(ent_key)
                    ch = _get_entity_chunks(db, "practice", pp.id, pp)
                    chunks.extend(ch)
                    titles.append(f"Practice Problem '{pp.title}' (ID {pp.id})")
                    break
        except Exception as e:
            logger.error(f"Error resolving practice keywords: {e}")

    return chunks, titles


def build_context_block(chunks: list) -> str:
    if not chunks:
        return "(no relevant context found)"
    lines = []
    for i, c in enumerate(chunks, 1):
        meta = c.get("metadata", {}) or {}
        src = meta.get("title") or meta.get("name") or "Unknown"
        field = meta.get("field", "")
        url = meta.get("url", "")
        stype = meta.get("source_type", "?")
        lc_id = meta.get("leetcode_id")
        id_info = f"LeetCode #{lc_id} (Site ID: {meta.get('source_id', '')})" if lc_id else f"Site ID: {meta.get('source_id', '')}"
        lines.append(
            f"[{i}] (SOURCE: {stype.upper()} | TITLE: {src} | {id_info} | URL: {url} | FIELD: {field})\n{c['content']}"
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

    # 1. Direct entity & URL resolution (links, slugs, IDs, named entities)
    direct_chunks, direct_titles = resolve_direct_entities(db, user_message)

    # 1b. Conversation continuity: if current user message is a short confirmation
    # (e.g. "yes that is only i asked", "explain it", "tell me more"), inherit entity from history!
    if not direct_chunks and history:
        for prev_msg in reversed(history[-4:]):
            prev_content = prev_msg.get("content", "")
            hist_chunks, hist_titles = resolve_direct_entities(db, prev_content)
            if hist_chunks:
                direct_chunks = hist_chunks
                direct_titles = hist_titles
                logger.info(f"[NextraAI] Inherited entity context from history: {hist_titles}")
                break

    # 2. Explicit context from pinned sources (ContextPicker)
    explicit_chunks = _fetch_explicit_chunks(db, contexts or [])

    # If the user directly requested a specific entity in this prompt,
    # prioritize direct_chunks over old pinned contexts so older pins don't hijack the answer!
    if direct_chunks:
        primary_chunks = direct_chunks
        fallback_chunks = explicit_chunks
    else:
        primary_chunks = explicit_chunks
        fallback_chunks = []

    # 3. Vector search
    search_chunks = search_similar(db, user_message, top_k=8, min_similarity=0.15)

    # 4. Merge & dedupe
    seen = set()
    all_chunks = []
    for c in primary_chunks + search_chunks + fallback_chunks:
        cid = str(c["id"])
        if cid not in seen:
            seen.add(cid)
            all_chunks.append(c)

    # 5. Classify tier
    route = classify_query(user_message, all_chunks, mode=mode)
    if direct_chunks:
        tier_used = 1
        route["reason"] = f"direct_entity_match ({', '.join(direct_titles)})"
    else:
        tier_used = route["tier"]

    logger.info(
        f"[NextraAI] tier={tier_used} mode={mode} reason={route['reason']} "
        f"direct={len(direct_chunks)} explicit={len(explicit_chunks)} search={len(search_chunks)}"
    )

    # 6. Build system prompt
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

    if direct_titles:
        system_parts.append(
            f"The user has directly requested: {', '.join(direct_titles)}.\n"
            "CRITICAL INSTRUCTIONS:\n"
            "- The context provided below IS THE EXACT ITEM the user requested.\n"
            "- Website database IDs in URLs (e.g., /problems/110 or /problems/103) map directly to the item provided in the context "
            "(for example, /problems/110 IS LeetCode 2235: Add Two Integers; /problems/103 IS LeetCode 21: Merge Two Sorted Lists; /practice/244 IS Pair Sum 1).\n"
            "- NEVER say 'I don't have notes for /problems/X, I only have Problem Y'. They are the SAME problem!\n"
            "- Immediately explain the problem statement, intuition, algorithm, time/space complexity, and complete code implementations from the provided context."
        )
    elif contexts:
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

    # 7. User prompt with retrieved context
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

    # 8. Stream
    citations = build_citations(all_chunks[:6]) if all_chunks else []
    yield {"type": "citations", "citations": citations}
    yield {"type": "tier", "tier": tier_used, "reason": route["reason"], "mode": mode}

    async for event in stream_llm(messages, tier=tier):
        yield event

    yield {"type": "done"}
