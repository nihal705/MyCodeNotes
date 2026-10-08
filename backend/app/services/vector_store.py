"""pgvector operations for ai_chunks."""
import json
import logging
from typing import Dict, List, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.services.embedding import embed_query

logger = logging.getLogger(__name__)


def search_similar(
    db: Session,
    query: str,
    top_k: int = 8,
    min_similarity: float = 0.0,
    filters: Optional[Dict] = None,
) -> List[Dict]:
    """
    Vector search on ai_chunks.
    Returns list of {id, content, metadata, similarity}.
    """
    query_vec = embed_query(query)
    if not query_vec or all(v == 0 for v in query_vec):
        return []

    vec_str = "[" + ",".join(f"{v:.8f}" for v in query_vec) + "]"

    where_clauses = []
    params: Dict = {"vec": vec_str, "top_k": top_k}

    if filters:
        for i, (k, v) in enumerate(filters.items()):
            if v is None:
                continue
            where_clauses.append(f"metadata->>'{k}' = :f{i}")
            params[f"f{i}"] = str(v)

    where_sql = ""
    if where_clauses:
        where_sql = "WHERE " + " AND ".join(where_clauses)

    sql = text(f"""
        SELECT
            id,
            content,
            metadata,
            1 - (embedding <=> CAST(:vec AS vector)) AS similarity
        FROM ai_chunks
        {where_sql}
        ORDER BY embedding <=> CAST(:vec AS vector)
        LIMIT :top_k
    """)

    try:
        rows = db.execute(sql, params).fetchall()
    except Exception as e:
        logger.error(f"Vector search failed: {e}")
        return []

    results = []
    for r in rows:
        sim = float(r.similarity) if r.similarity is not None else 0.0
        if sim >= min_similarity:
            results.append({
                "id": r.id,
                "content": r.content,
                "metadata": r.metadata or {},
                "similarity": sim,
            })
    return results


def insert_chunk(
    db: Session,
    content: str,
    embedding: list,
    source_type: str,
    source_id: int,
    metadata: dict,
):
    vec_str = "[" + ",".join(f"{v:.8f}" for v in embedding) + "]"
    sql = text("""
        INSERT INTO ai_chunks (content, embedding, source_type, source_id, metadata)
        VALUES (:content, CAST(:vec AS vector), :stype, :sid, CAST(:meta AS jsonb))
    """)
    db.execute(sql, {
        "content": content,
        "vec": vec_str,
        "stype": source_type,
        "sid": source_id,
        "meta": json.dumps(metadata),
    })
    db.commit()


def delete_chunks_for_source(db: Session, source_type: str, source_id: int):
    sql = text("DELETE FROM ai_chunks WHERE source_type = :s AND source_id = :i")
    db.execute(sql, {"s": source_type, "i": source_id})
    db.commit()