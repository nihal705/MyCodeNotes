"""OTP generation and verification."""
import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session
from app import models

OTP_TTL_MINUTES = 10
OTP_RESEND_COOLDOWN_SECONDS = 60


def _hash_otp(email: str, otp: str) -> str:
    return hashlib.sha256(f"{email}:{otp}".encode("utf-8")).hexdigest()


def generate_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def can_resend(db: Session, email: str) -> bool:
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=OTP_RESEND_COOLDOWN_SECONDS)
    recent = (
        db.query(models.EmailOTP)
        .filter(models.EmailOTP.email == email, models.EmailOTP.created_at >= cutoff)
        .first()
    )
    return recent is None


def create_otp(db: Session, email: str, purpose: str) -> str:
    otp = generate_otp()
    record = models.EmailOTP(
        email=email,
        otp_hash=_hash_otp(email, otp),
        purpose=purpose,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=OTP_TTL_MINUTES),
    )
    db.add(record)
    db.commit()
    return otp


def verify_otp(db: Session, email: str, otp: str, purpose: str) -> bool:
    record = (
        db.query(models.EmailOTP)
        .filter(
            models.EmailOTP.email == email,
            models.EmailOTP.purpose == purpose,
            models.EmailOTP.used == False,  # noqa: E712
        )
        .order_by(models.EmailOTP.id.desc())
        .first()
    )
    if not record:
        return False
    exp = record.expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < datetime.now(timezone.utc):
        return False
    if record.otp_hash != _hash_otp(email, otp):
        return False
    record.used = True
    db.commit()
    return True