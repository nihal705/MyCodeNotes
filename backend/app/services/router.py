"""Decide which tier (1-4) to use for a given query."""
from typing import Dict, List

OFF_TOPIC_KEYWORDS = [
    "weather", "stock price", "bitcoin", "cricket score", "ipl",
    "movie", "recipe", "girlfriend", "boyfriend", "love letter",
    "joke", "politics", "election", "religion", "gossip", "horoscope",
]

CODE_ANALYSIS_KEYWORDS = [
    "optimize", "optimi", "better approach", "another approach",
    "alternative approach", "improve", "refactor", "faster",
    "more efficient", "time complexity of", "space complexity of",
    "explain this code", "explain my code", "review my code",
    "dry run", "debug this", "fix this code",
]

CS_KEYWORDS = [
    "algorithm", "complexity", "array", "string", "tree", "graph",
    "sort", "search", "dynamic programming", "recursion", "loop",
    "function", "class", "java", "python", "javascript", "code",
    "dsa", "leetcode", "pattern", "pointer", "hashmap", "stack",
    "queue", "heap", "linked list", "big o",
]

VALID_MODES = {"normal", "hinglish", "interview", "code_review"}


def classify_query(query: str, top_chunks: List[Dict], mode: str = "normal") -> Dict:
    q_lower = (query or "").lower()
    has_code = (
        "```" in query
        or "\n    " in query
        or "def " in q_lower
        or "class " in q_lower
        or "public " in q_lower
        or "function " in q_lower
    )

    if mode not in VALID_MODES:
        mode = "normal"

    if mode == "code_review":
        return {"tier": 2, "reason": "code_review_mode",
                "top_similarity": 0.0, "has_code": True, "mode": mode}

    if mode == "interview":
        return {"tier": 1 if top_chunks else 3, "reason": "interview_mode",
                "top_similarity": top_chunks[0]["similarity"] if top_chunks else 0.0,
                "has_code": has_code, "mode": mode}

    if any(k in q_lower for k in OFF_TOPIC_KEYWORDS):
        return {"tier": 4, "reason": "off_topic_keyword",
                "top_similarity": 0.0, "has_code": has_code, "mode": mode}

    top_sim = top_chunks[0]["similarity"] if top_chunks else 0.0

    if has_code and any(k in q_lower for k in CODE_ANALYSIS_KEYWORDS):
        return {"tier": 2, "reason": "code_analysis",
                "top_similarity": top_sim, "has_code": True, "mode": mode}

    if top_sim >= 0.55:
        return {"tier": 1, "reason": "strong_match",
                "top_similarity": top_sim, "has_code": has_code, "mode": mode}

    if top_sim >= 0.35:
        return {"tier": 1, "reason": "medium_match",
                "top_similarity": top_sim, "has_code": has_code, "mode": mode}

    if any(k in q_lower for k in CS_KEYWORDS):
        return {"tier": 3, "reason": "general_cs",
                "top_similarity": top_sim, "has_code": has_code, "mode": mode}

    return {"tier": 3, "reason": "weak_match_default",
            "top_similarity": top_sim, "has_code": has_code, "mode": mode}