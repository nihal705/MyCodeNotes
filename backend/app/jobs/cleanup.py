"""30-day history cleanup + optional auto-scheduler."""
import asyncio
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import text

from app.database import SessionLocal

logger = logging.getLogger(__name__)

RETENTION_DAYS_FREE = 30


def run_cleanup() -> dict:
    """Delete free-tier users' messages older than the retention window."""
    db = SessionLocal()
    try:
        cutoff = datetime.now(timezone.utc) - timedelta(days=RETENTION_DAYS_FREE)

        res1 = db.execute(text("""
            DELETE FROM ai_messages
            WHERE user_id IN (
                SELECT id FROM users WHERE tier = 'free'
            )
            AND created_at < :cutoff
        """), {"cutoff": cutoff})

        res2 = db.execute(text("""
            DELETE FROM ai_conversations
            WHERE user_id IN (
                SELECT id FROM users WHERE tier = 'free'
            )
            AND updated_at < :cutoff
            AND id NOT IN (
                SELECT DISTINCT conversation_id::text::bigint FROM ai_messages
                WHERE conversation_id ~ '^[0-9]+$'
            )
        """), {"cutoff": cutoff})

        db.commit()
        msgs = res1.rowcount or 0
        convs = res2.rowcount or 0
        logger.info(f"Cleanup: {msgs} messages, {convs} conversations removed")
        return {"messages_deleted": msgs, "conversations_deleted": convs}
    finally:
        db.close()


async def cleanup_loop():
    """Runs once every 24h while the server is alive."""
    while True:
        try:
            await asyncio.to_thread(run_cleanup)
        except Exception as e:
            logger.error(f"Cleanup loop error: {e}")
        await asyncio.sleep(60 * 60 * 24)