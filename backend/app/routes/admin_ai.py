"""Admin-only NextraAI analytics + maintenance."""
import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.routes.auth import get_current_user
from app.jobs.cleanup import run_cleanup

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin/ai", tags=["admin-ai"])

ADMIN_EMAIL = "nihalmohammad705@gmail.com"


def _require_admin(user):
    if user is None or (user.tier != "admin" and user.email != ADMIN_EMAIL):
        raise HTTPException(403, "Admin only")


@router.get("/stats")
def get_stats(user=Depends(get_current_user), db: Session = Depends(get_db)):
    _require_admin(user)

    since_24h = datetime.now(timezone.utc) - timedelta(hours=24)
    since_7d = datetime.now(timezone.utc) - timedelta(days=7)

    def scalar(q, p=None):
        return db.execute(text(q), p or {}).scalar() or 0

    total_users = scalar("SELECT COUNT(*) FROM users")
    verified_users = scalar("SELECT COUNT(*) FROM users WHERE is_verified = TRUE")
    total_convs = scalar("SELECT COUNT(*) FROM ai_conversations")
    total_msgs = scalar("SELECT COUNT(*) FROM ai_messages WHERE role = 'assistant'")

    msgs_24h = scalar(
        "SELECT COUNT(*) FROM ai_messages WHERE role='assistant' AND created_at >= :c",
        {"c": since_24h},
    )
    msgs_7d = scalar(
        "SELECT COUNT(*) FROM ai_messages WHERE role='assistant' AND created_at >= :c",
        {"c": since_7d},
    )

    thumbs_up = scalar("SELECT COUNT(*) FROM ai_messages WHERE feedback = 1")
    thumbs_down = scalar("SELECT COUNT(*) FROM ai_messages WHERE feedback = -1")

    top_questions = db.execute(text("""
        SELECT content, created_at
        FROM ai_messages
        WHERE role = 'user'
        ORDER BY id DESC
        LIMIT 20
    """)).fetchall()

    recent_negative = db.execute(text("""
        SELECT m.id, m.content, m.feedback_note, m.created_at, u.email
        FROM ai_messages m
        LEFT JOIN users u ON u.id = m.user_id
        WHERE m.feedback = -1
        ORDER BY m.created_at DESC
        LIMIT 25
    """)).fetchall()

    return {
        "users": {
            "total": total_users,
            "verified": verified_users,
        },
        "conversations": {
            "total": total_convs,
            "messages_24h": msgs_24h,
            "messages_7d": msgs_7d,
        },
        "messages": {
            "total_assistant": total_msgs,
            "thumbs_up": thumbs_up,
            "thumbs_down": thumbs_down,
            "satisfaction_ratio": round(
                thumbs_up / max(1, thumbs_up + thumbs_down), 3
            ),
        },
        "top_questions": [
            {"text": r.content[:200], "at": r.created_at} for r in top_questions
        ],
        "recent_negative": [
            {
                "id": r.id,
                "text": r.content[:300],
                "note": r.feedback_note,
                "at": r.created_at,
                "user": r.email,
            }
            for r in recent_negative
        ],
    }


@router.post("/cleanup")
def trigger_cleanup(user=Depends(get_current_user), db: Session = Depends(get_db)):
    _require_admin(user)
    return run_cleanup()