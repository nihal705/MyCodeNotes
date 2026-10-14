"""Fire-and-forget reindex after admin CRUD. Uses FastAPI BackgroundTasks."""
import logging
from fastapi import BackgroundTasks

from app.jobs.reindex import reindex_one

logger = logging.getLogger(__name__)


def schedule_reindex(bg: BackgroundTasks, source_type: str, source_id: int):
    """
    Queue a single-item reindex.
    source_type ∈ {'leetcode', 'practice', 'concept', 'note'}
    """
    if bg is None:
        try:
            reindex_one(source_type, source_id)
        except Exception as e:
            logger.error(f"Sync reindex failed for {source_type}:{source_id}: {e}")
        return

    bg.add_task(_safe_reindex, source_type, source_id)


def _safe_reindex(source_type: str, source_id: int):
    try:
        reindex_one(source_type, source_id)
    except Exception as e:
        logger.error(f"Background reindex failed for {source_type}:{source_id}: {e}")