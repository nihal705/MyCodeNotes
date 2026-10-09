"""Invite code management + redemption."""
import secrets
import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.routes.auth import get_current_user, require_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/invite", tags=["invite"])

ADMIN_EMAIL = "nihalmohammad705@gmail.com"


# ---------- Schemas ----------
class RedeemRequest(BaseModel):
    code: str


class CreateRequest(BaseModel):
    tier: str = "premium"
    duration_days: int = 30
    count: int = 1
    notes: str | None = None


# ---------- Helpers ----------
def _is_admin(user) -> bool:
    return user is not None and (user.tier == "admin" or user.email == ADMIN_EMAIL)


def _gen_code() -> str:
    # 3 groups of 4 uppercase alphanumerics, e.g. NXTA-4K2P-9WQZ
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    def block():
        return "".join(secrets.choice(alphabet) for _ in range(4))
    return f"NXTA-{block()}-{block()}"


# ---------- User: redeem ----------
@router.post("/redeem")
def redeem(payload: RedeemRequest, user=Depends(require_user), db: Session = Depends(get_db)):
    code = payload.code.strip().upper()
    row = db.query(models.InviteCode).filter(models.InviteCode.code == code).first()

    if not row:
        raise HTTPException(404, "Invalid code")
    if row.used_by is not None:
        raise HTTPException(400, "Code already used")
    if row.expires_at:
        exp = row.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp < datetime.now(timezone.utc):
            raise HTTPException(400, "Code expired")

    user.tier = row.tier
    user.premium_until = datetime.now(timezone.utc) + timedelta(days=row.duration_days)
    row.used_by = user.id
    row.used_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "ok": True,
        "tier": user.tier,
        "premium_until": user.premium_until,
        "message": f"Upgraded to {row.tier} for {row.duration_days} days",
    }


# ---------- Admin: create / list ----------
@router.post("/create")
def create_codes(payload: CreateRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    if not _is_admin(user):
        raise HTTPException(403, "Admin only")

    created = []
    for _ in range(max(1, min(payload.count, 50))):
        for _attempt in range(5):
            code = _gen_code()
            if not db.query(models.InviteCode).filter(models.InviteCode.code == code).first():
                break
        else:
            continue

        row = models.InviteCode(
            code=code,
            tier=payload.tier,
            duration_days=payload.duration_days,
            created_by=user.id,
            expires_at=datetime.now(timezone.utc) + timedelta(days=90),
            notes=payload.notes,
        )
        db.add(row)
        created.append(code)
    db.commit()
    return {"created": created}


@router.get("/list")
def list_codes(user=Depends(get_current_user), db: Session = Depends(get_db)):
    if not _is_admin(user):
        raise HTTPException(403, "Admin only")

    rows = (
        db.query(models.InviteCode)
        .order_by(models.InviteCode.id.desc())
        .limit(200)
        .all()
    )
    return [
        {
            "id": r.id,
            "code": r.code,
            "tier": r.tier,
            "duration_days": r.duration_days,
            "used": r.used_by is not None,
            "used_at": r.used_at,
            "expires_at": r.expires_at,
            "created_at": r.created_at,
            "notes": r.notes,
        }
        for r in rows
    ]