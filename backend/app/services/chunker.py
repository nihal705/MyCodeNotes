"""Turn DB rows into AI-friendly chunks with metadata."""
import json
from typing import Dict, List


def _enum_val(x):
    return x.value if hasattr(x, "value") else (str(x) if x is not None else "")


def chunk_problem(problem) -> List[Dict]:
    """One problem row -> up to 5 chunks."""
    chunks: List[Dict] = []
    base_meta = {
        "source_type": "leetcode",
        "source_id": problem.id,
        "leetcode_id": problem.leetcode_id,
        "title": problem.title,
        "difficulty": _enum_val(problem.difficulty),
        "concept": problem.concept or "",
        "pattern": problem.pattern or "",
        "url": f"/problems/{problem.id}",
    }

    if problem.statement:
        chunks.append({
            "content": (
                f"LeetCode {problem.leetcode_id} - {problem.title} "
                f"({base_meta['difficulty']})\n\n"
                f"Statement: {problem.statement}\n\n"
                f"Description: {problem.description or ''}"
            ),
            "metadata": {**base_meta, "field": "statement"},
        })

    if problem.concept or problem.pattern:
        chunks.append({
            "content": (
                f"LeetCode {problem.leetcode_id} - {problem.title}\n"
                f"Concept: {problem.concept or 'N/A'}\n"
                f"Pattern: {problem.pattern or 'N/A'}"
            ),
            "metadata": {**base_meta, "field": "concept"},
        })

    if problem.algorithm or problem.notebook_concept:
        chunks.append({
            "content": (
                f"LeetCode {problem.leetcode_id} - {problem.title}\n"
                f"Algorithm: {problem.algorithm or ''}\n"
                f"Notes: {problem.notebook_concept or ''}"
            ),
            "metadata": {**base_meta, "field": "algorithm"},
        })

    if problem.java_solution:
        chunks.append({
            "content": (
                f"LeetCode {problem.leetcode_id} - {problem.title}\n"
                f"Java Solution:\n```java\n{problem.java_solution}\n```"
            ),
            "metadata": {**base_meta, "field": "java_solution"},
        })

    if problem.python_solution:
        chunks.append({
            "content": (
                f"LeetCode {problem.leetcode_id} - {problem.title}\n"
                f"Python Solution:\n```python\n{problem.python_solution}\n```"
            ),
            "metadata": {**base_meta, "field": "python_solution"},
        })

    return chunks


def chunk_practice(problem) -> List[Dict]:
    chunks: List[Dict] = []
    base_meta = {
        "source_type": "practice",
        "source_id": problem.id,
        "title": problem.title,
        "difficulty": _enum_val(problem.difficulty),
        "language": _enum_val(problem.language),
        "tags": problem.tags or [],
        "url": f"/practice/{problem.id}",
    }

    if problem.question:
        chunks.append({
            "content": (
                f"Practice Problem - {problem.title}\n"
                f"Difficulty: {base_meta['difficulty']}, "
                f"Language: {base_meta['language']}\n\n"
                f"Question: {problem.question}"
            ),
            "metadata": {**base_meta, "field": "question"},
        })

    if problem.hints:
        hints_str = (
            "\n".join(f"- {h}" for h in problem.hints)
            if isinstance(problem.hints, list)
            else str(problem.hints)
        )
        chunks.append({
            "content": f"Practice Problem - {problem.title}\nHints:\n{hints_str}",
            "metadata": {**base_meta, "field": "hints"},
        })

    if problem.solution:
        chunks.append({
            "content": (
                f"Practice Problem - {problem.title}\n"
                f"{base_meta['language']} Solution:\n```\n{problem.solution}\n```"
            ),
            "metadata": {**base_meta, "field": "solution"},
        })

    return chunks


def chunk_concept(concept) -> List[Dict]:
    content = f"Concept: {concept.name}\n\nDefinition: {concept.definition or ''}"
    if concept.example:
        content += f"\n\nExample:\n```\n{concept.example}\n```"
    return [{
        "content": content,
        "metadata": {
            "source_type": "concept",
            "source_id": concept.id,
            "name": concept.name,
            "url": f"/concepts/{concept.id}",
            "field": "concept",
        },
    }]


def chunk_note(note) -> List[Dict]:
    """Notes -> one chunk per topic + one per project."""
    chunks: List[Dict] = []
    base_meta = {
        "source_type": "note",
        "source_id": note.id,
        "title": note.title,
        "slug": note.slug,
        "tags": note.tags or [],
        "url": f"/notes/{note.slug}",
    }

    content = note.content or {}
    if isinstance(content, str):
        try:
            content = json.loads(content)
        except Exception:
            content = {}
    if not isinstance(content, dict):
        content = {}

    chapters = content.get("chapters", [])
    for ci, chapter in enumerate(chapters):
        chapter_title = chapter.get("title", f"Chapter {ci+1}")
        for ti, topic in enumerate(chapter.get("topics", [])):
            topic_title = topic.get("title", f"Topic {ti+1}")
            topic_content = topic.get("content", "")
            code_str = ""
            for ex in topic.get("code_examples", []) or []:
                lang = ex.get("language", "")
                code = ex.get("code", "")
                code_str += f"\n\n```{lang}\n{code}\n```"
            chunks.append({
                "content": (
                    f"Note: {note.title} -> {chapter_title} -> {topic_title}\n\n"
                    f"{topic_content}{code_str}"
                ),
                "metadata": {
                    **base_meta,
                    "chapter": chapter_title,
                    "topic": topic_title,
                    "field": "note_topic",
                },
            })

    projects = content.get("projects", [])
    for project in projects:
        name = project.get("name", "Project")
        desc = project.get("description", "")
        chunks.append({
            "content": f"Note: {note.title} -> Project: {name}\n\n{desc}",
            "metadata": {**base_meta, "project": name, "field": "note_project"},
        })

    return chunks