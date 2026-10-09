"""NextraAI endpoints: chat (streaming), history, feedback, quota, export."""
import os
import json
import logging
from datetime import datetime, timezone
from typing import Optional, List
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text as sql_text

from app.database import get_db
from app import models
from app.routes.auth import require_user
from app.services import rag

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["ai"])

FREE_LIMIT = int(os.getenv("AI_FREE_DAILY_LIMIT", "25"))
PREMIUM_LIMIT = int(os.getenv("AI_PREMIUM_DAILY_LIMIT", "200"))
ADMIN_LIMIT = 999_999

VALID_MODES = {"normal", "hinglish", "interview", "code_review"}


class ContextRef(BaseModel):
    source_type: str
    source_id: int


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    page_context: Optional[dict] = None
    contexts: Optional[List[ContextRef]] = None
    mode: Optional[str] = "normal"


class FeedbackRequest(BaseModel):
    message_id: int
    feedback: int
    note: Optional[str] = None


def _limit_for(user) -> int:
    if user.tier == "admin":
        return ADMIN_LIMIT
    if user.tier == "premium":
        return PREMIUM_LIMIT
    return FREE_LIMIT


def _get_or_create_usage(db: Session, user, day) -> models.NextraUsage:
    usage = (
        db.query(models.NextraUsage)
        .filter(
            models.NextraUsage.user_id == user.id,
            models.NextraUsage.date == day,
        )
        .first()
    )
    if not usage:
        usage = models.NextraUsage(
            user_id=user.id,
            date=day,
            messages_used=0,
            messages_limit=_limit_for(user),
            tier=user.tier,
        )
        db.add(usage)
        db.commit()
        db.refresh(usage)
    else:
        new_limit = _limit_for(user)
        if usage.messages_limit != new_limit:
            usage.messages_limit = new_limit
            usage.tier = user.tier
            db.commit()
    return usage


# ============================================================
# USAGE
# ============================================================
@router.get("/usage")
def get_usage(user=Depends(require_user), db: Session = Depends(get_db)):
    day = datetime.now(timezone.utc).date()
    usage = _get_or_create_usage(db, user, day)
    return {
        "used": usage.messages_used,
        "limit": usage.messages_limit,
        "remaining": max(0, usage.messages_limit - usage.messages_used),
        "tier": usage.tier,
    }


# ============================================================
# CHAT (streaming)
# ============================================================
@router.post("/chat")
async def chat(
    payload: ChatRequest,
    user=Depends(require_user),
    db: Session = Depends(get_db),
):
    day = datetime.now(timezone.utc).date()
    usage = _get_or_create_usage(db, user, day)

    if usage.messages_used >= usage.messages_limit:
        raise HTTPException(
            status_code=429,
            detail=f"Daily limit reached ({usage.messages_limit}/day). Try again tomorrow.",
        )

    mode = payload.mode if payload.mode in VALID_MODES else "normal"
    conv_id = payload.conversation_id or str(uuid4())
    user_id = user.id
    user_tier = user.tier
    llm_tier = "premium" if user_tier in ("premium", "admin") else "free"

    # ---- Read all chat state BEFORE streaming starts ----
    prev = (
        db.query(models.AIMessage)
        .filter(
            models.AIMessage.conversation_id == conv_id,
            models.AIMessage.user_id == user_id,
        )
        .order_by(models.AIMessage.id.asc())
        .all()
    )
    history = [
        {"role": m.role, "content": m.content}
        for m in prev
        if m.role in ("user", "assistant")
    ]

    conv = (
        db.query(models.AIConversation)
        .filter(models.AIConversation.conversation_id == conv_id)
        .first()
    )
    if not conv:
        conv = models.AIConversation(
            user_id=user_id,
            conversation_id=conv_id,
            title=(payload.message or "New chat")[:80],
        )
        db.add(conv)
        db.commit()

    contexts_list = [c.dict() for c in (payload.contexts or [])]

    user_meta = {}
    if payload.page_context:
        user_meta["page"] = payload.page_context
    if contexts_list:
        user_meta["contexts"] = contexts_list
    if mode != "normal":
        user_meta["mode"] = mode

    user_msg = models.AIMessage(
        conversation_id=conv_id,
        user_id=user_id,
        role="user",
        content=payload.message,
        metadata_json=user_meta,
    )
    db.add(user_msg)
    db.commit()

    async def event_stream():
        from app.database import SessionLocal

        collected = []
        citations = []
        model_name = "unknown"
        tier_used = 1

        try:
            async for event in rag.run_rag(
                db=db,
                user_message=payload.message,
                history=history,
                tier=llm_tier,
                page_context=payload.page_context,
                contexts=contexts_list,
                mode=mode,
                user_id=user_id,
            ):
                if event["type"] == "token":
                    collected.append(event["content"])
                elif event["type"] == "citations":
                    citations = event["citations"]
                elif event["type"] == "tier":
                    tier_used = event["tier"]
                elif event["type"] == "model":
                    model_name = event["name"]

                yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            logger.exception("Stream error")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        finally:
            db2 = SessionLocal()
            try:
                full = "".join(collected)
                saved = models.AIMessage(
                    conversation_id=conv_id,
                    user_id=user_id,
                    role="assistant",
                    content=full,
                    cited_chunk_ids=[c["id"] for c in citations] if citations else [],
                    model_used=model_name,
                    metadata_json={"tier": tier_used, "mode": mode},
                )
                db2.add(saved)
                db2.commit()
                db2.refresh(saved)

                # Increment daily quota
                db2.execute(
                    sql_text(
                        "UPDATE nextra_usage "
                        "SET messages_used = messages_used + 1 "
                        "WHERE user_id = :uid AND date = :d"
                    ),
                    {"uid": user_id, "d": day},
                )

                # Log activity for streak tracking
                db2.execute(
                    sql_text(
                        "INSERT INTO user_activity (user_id, date, chats_count) "
                        "VALUES (:uid, :d, 1) "
                        "ON CONFLICT (user_id, date) "
                        "DO UPDATE SET chats_count = user_activity.chats_count + 1"
                    ),
                    {"uid": user_id, "d": day},
                )

                # Touch conversation updated_at
                db2.execute(
                    sql_text(
                        "UPDATE ai_conversations "
                        "SET updated_at = NOW() "
                        "WHERE conversation_id = :cid"
                    ),
                    {"cid": conv_id},
                )
                db2.commit()

                yield f"data: {json.dumps({'type': 'saved', 'message_id': saved.id, 'conversation_id': conv_id})}\n\n"
            except Exception as e:
                logger.error(f"Failed to save AI message: {e}")
            finally:
                db2.close()

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


# ============================================================
# HISTORY
# ============================================================
@router.get("/conversations")
def list_conversations(user=Depends(require_user), db: Session = Depends(get_db)):
    rows = (
        db.query(models.AIConversation)
        .filter(models.AIConversation.user_id == user.id)
        .order_by(models.AIConversation.updated_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": c.id,
            "conversation_id": c.conversation_id,
            "title": c.title,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
        }
        for c in rows
    ]


@router.get("/messages/{conversation_id}")
def list_messages(
    conversation_id: str,
    user=Depends(require_user),
    db: Session = Depends(get_db),
):
    msgs = (
        db.query(models.AIMessage)
        .filter(
            models.AIMessage.conversation_id == conversation_id,
            models.AIMessage.user_id == user.id,
        )
        .order_by(models.AIMessage.id.asc())
        .all()
    )
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "citations": m.cited_chunk_ids,
            "metadata": m.metadata_json,
            "created_at": m.created_at,
        }
        for m in msgs
    ]


@router.delete("/conversation/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    user=Depends(require_user),
    db: Session = Depends(get_db),
):
    db.query(models.AIMessage).filter(
        models.AIMessage.conversation_id == conversation_id,
        models.AIMessage.user_id == user.id,
    ).delete()
    db.query(models.AIConversation).filter(
        models.AIConversation.conversation_id == conversation_id,
        models.AIConversation.user_id == user.id,
    ).delete()
    db.commit()
    return {"ok": True}


# ============================================================
# FEEDBACK
# ============================================================
@router.post("/feedback")
def feedback(
    payload: FeedbackRequest,
    user=Depends(require_user),
    db: Session = Depends(get_db),
):
    msg = (
        db.query(models.AIMessage)
        .filter(
            models.AIMessage.id == payload.message_id,
            models.AIMessage.user_id == user.id,
        )
        .first()
    )
    if not msg:
        raise HTTPException(404, "Message not found")
    msg.feedback = payload.feedback
    msg.feedback_note = payload.note
    db.commit()
    return {"ok": True}


# ============================================================
# EXPORT
# ============================================================
@router.get("/export/{conversation_id}")
def export_conversation(
    conversation_id: str,
    user=Depends(require_user),
    db: Session = Depends(get_db),
):
    conv = (
        db.query(models.AIConversation)
        .filter(
            models.AIConversation.conversation_id == conversation_id,
            models.AIConversation.user_id == user.id,
        )
        .first()
    )
    if not conv:
        raise HTTPException(404, "Conversation not found")

    msgs = (
        db.query(models.AIMessage)
        .filter(
            models.AIMessage.conversation_id == conversation_id,
            models.AIMessage.user_id == user.id,
        )
        .order_by(models.AIMessage.id.asc())
        .all()
    )

    return {
        "title": conv.title,
        "conversation_id": conv.conversation_id,
        "created_at": conv.created_at,
        "user": {"name": user.name, "email": user.email},
        "messages": [
            {
                "role": m.role,
                "content": m.content,
                "citations": m.cited_chunk_ids,
                "created_at": m.created_at,
            }
            for m in msgs
        ],
    }