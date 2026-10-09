"""Reindex all content into ai_chunks — batched for speed."""
import logging
import time
from typing import List, Tuple, Dict, Any

from app.database import SessionLocal
from app import models
from app.services.chunker import (
    chunk_problem,
    chunk_practice,
    chunk_concept,
    chunk_note,
)
from app.services.embedding import embed_batch
from app.services.vector_store import insert_chunk, delete_chunks_for_source

logger = logging.getLogger(__name__)

BATCH_SIZE = 50          # texts per API call (Google allows up to 100)
DELAY_BETWEEN = 1.1      # seconds between calls → ~54 RPM, safe under 60 RPM
ZERO_VEC = [0.0] * 768


def _process_source(
    db,
    Model,
    chunker,
    source_type: str,
) -> int:
    """Collect chunks → batch embed → insert. Returns number of chunks written."""
    rows = db.query(Model).all()
    logger.info(f"Reindexing {len(rows)} {source_type} rows...")

    # 1. Collect all chunks first (fast — no API calls)
    all_chunks: List[Tuple[str, int, Dict[str, Any]]] = []
    for row in rows:
        delete_chunks_for_source(db, source_type, row.id)
        for ch in chunker(row):
            all_chunks.append((ch["content"], row.id, ch["metadata"]))

    if not all_chunks:
        logger.info(f"  done {source_type} (0 chunks)")
        return 0

    total_batches = (len(all_chunks) + BATCH_SIZE - 1) // BATCH_SIZE
    logger.info(f"  {len(all_chunks)} chunks → {total_batches} batches")

    written = 0

    # 2. Process in batches
    for batch_num, i in enumerate(range(0, len(all_chunks), BATCH_SIZE), start=1):
        batch = all_chunks[i:i + BATCH_SIZE]
        texts = [c[0] for c in batch]

        vectors = embed_batch(texts)

        for (content, source_id, metadata), vec in zip(batch, vectors):
            try:
                insert_chunk(db, content, vec, source_type, source_id, metadata)
                written += 1
            except Exception as e:
                logger.error(f"Insert failed for {source_type}:{source_id}: {e}")

        logger.info(
            f"  batch {batch_num}/{total_batches} — "
            f"{written}/{len(all_chunks)} chunks written"
        )

        # Rate-limit protection — skip delay after the final batch
        if i + BATCH_SIZE < len(all_chunks):
            time.sleep(DELAY_BETWEEN)

    logger.info(f"  done {source_type} ({written} chunks)")
    return written


def reindex_all():
    db = SessionLocal()
    try:
        total = 0
        for Model, chunker, stype in [
            (models.Problem, chunk_problem, "leetcode"),
            (models.PracticeProblem, chunk_practice, "practice"),
            (models.Concept, chunk_concept, "concept"),
            (models.Note, chunk_note, "note"),
        ]:
            total += _process_source(db, Model, chunker, stype)
        logger.info(f"✅ Total chunks written: {total}")
    finally:
        db.close()


def reindex_one(source_type: str, source_id: int):
    """Single-item reindex — used by admin CRUD hooks."""
    db = SessionLocal()
    try:
        if source_type == "leetcode":
            row = db.query(models.Problem).filter(models.Problem.id == source_id).first()
            chunker = chunk_problem
        elif source_type == "practice":
            row = (
                db.query(models.PracticeProblem)
                .filter(models.PracticeProblem.id == source_id)
                .first()
            )
            chunker = chunk_practice
        elif source_type == "concept":
            row = db.query(models.Concept).filter(models.Concept.id == source_id).first()
            chunker = chunk_concept
        elif source_type == "note":
            row = db.query(models.Note).filter(models.Note.id == source_id).first()
            chunker = chunk_note
        else:
            logger.warning(f"Unknown source_type: {source_type}")
            return

        if not row:
            return

        delete_chunks_for_source(db, source_type, source_id)

        chunks = chunker(row)
        if not chunks:
            return

        texts = [c["content"] for c in chunks]
        vectors = embed_batch(texts)

        for ch, vec in zip(chunks, vectors):
            insert_chunk(db, ch["content"], vec, source_type, source_id, ch["metadata"])

        logger.info(f"Reindexed {source_type}:{source_id} ({len(chunks)} chunks)")
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(levelname)s:%(name)s:%(message)s",
    )
    reindex_all()