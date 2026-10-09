"""User authentication: signup, verify OTP, login, forgot, reset, profile."""
import os
import uuid
import shutil
import logging
from pathlib import Path
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, Cookie, UploadFile, File
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError

from app.database import get_db
from app import models
from app.services import otp as otp_service
from app.email import send_otp_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("JWT_SECRET") or os.getenv("API_SECRET_KEY", "change-me")
ALGORITHM = "HS256"
ACCESS_TTL_DAYS = 7
COOKIE_NAME = "mc_user_token"

AVATAR_DIR = Path("uploads/avatars")
AVATAR_DIR.mkdir(parents=True, exist_ok=True)


# ---------- Token helpers ----------
def create_user_token(user_id: int, email: str, tier: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "tier": tier,
        "type": "user",
        "exp": datetime.utcnow() + timedelta(days=ACCESS_TTL_DAYS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_user_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "user":
            return None
        return payload
    except JWTError:
        return None


# ---------- Dependencies ----------
def get_current_user(
    token: str = Cookie(default=None, alias=COOKIE_NAME),
    db: Session = Depends(get_db),
):
    if not token:
        return None
    payload = decode_user_token(token)
    if not payload:
        return None
    try:
        uid = int(payload.get("sub"))
    except (TypeError, ValueError):
        return None
    user = db.query(models.User).filter(models.User.id == uid).first()
    return user


def require_user(user=Depends(get_current_user)):
    if user is None:
        raise HTTPException(status_code=401, detail="Login required")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email first")
    return user


# ---------- Schemas ----------
class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    email: EmailStr
    phone: str | None = Field(None, max_length=20)
    password: str = Field(..., min_length=8, max_length=128)


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotRequest(BaseModel):
    email: EmailStr


class ResetRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=128)


class UpdateProfileRequest(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=80)
    phone: str | None = Field(None, max_length=20)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


# ---------- Response helper ----------
def _user_response(user: models.User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "avatar_url": user.avatar_url,
        "tier": user.tier,
        "is_verified": user.is_verified,
    }


def _set_cookie(response: Response, token: str):
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=60 * 60 * 24 * ACCESS_TTL_DAYS,
        path="/",
    )


# ---------- Auth endpoints ----------
@router.post("/signup")
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()

    if existing and existing.is_verified:
        raise HTTPException(400, "Email already registered. Please log in.")

    if existing and not existing.is_verified:
        if not otp_service.can_resend(db, payload.email):
            raise HTTPException(429, "Please wait a minute before requesting a new code")
        otp = otp_service.create_otp(db, payload.email, "signup")
        sent = send_otp_email(payload.email, otp)
        if not sent:
            raise HTTPException(500, "Failed to send OTP email")
        return {"message": "OTP re-sent", "email": payload.email}

    user = models.User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password_hash=pwd_context.hash(payload.password),
        is_verified=False,
        tier="free",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if not otp_service.can_resend(db, payload.email):
        raise HTTPException(429, "Please wait a minute before requesting a new code")
    otp = otp_service.create_otp(db, payload.email, "signup")
    sent = send_otp_email(payload.email, otp)
    if not sent:
        raise HTTPException(500, "Failed to send OTP email")

    return {"message": "OTP sent", "email": payload.email}


@router.post("/verify-otp")
def verify_otp(payload: VerifyOTPRequest, response: Response, db: Session = Depends(get_db)):
    if not otp_service.verify_otp(db, payload.email, payload.otp, "signup"):
        raise HTTPException(400, "Invalid or expired code")

    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(404, "User not found")

    user.is_verified = True
    user.last_login = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    token = create_user_token(user.id, user.email, user.tier)
    _set_cookie(response, token)
    return _user_response(user)


@router.post("/login")
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not pwd_context.verify(payload.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    if not user.is_verified:
        raise HTTPException(403, "Please verify your email first. Check your inbox for the code.")

    user.last_login = datetime.now(timezone.utc)
    db.commit()

    token = create_user_token(user.id, user.email, user.tier)
    _set_cookie(response, token)
    return _user_response(user)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"message": "Logged out"}


@router.get("/me")
def me(user=Depends(get_current_user)):
    if not user:
        return {"authenticated": False}
    return {"authenticated": True, **_user_response(user)}


@router.post("/forgot")
def forgot(payload: ForgotRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if user and otp_service.can_resend(db, payload.email):
        otp = otp_service.create_otp(db, payload.email, "reset")
        send_otp_email(payload.email, otp)
    return {"message": "If your email is registered, a reset code has been sent"}


@router.post("/reset")
def reset(payload: ResetRequest, db: Session = Depends(get_db)):
    if not otp_service.verify_otp(db, payload.email, payload.otp, "reset"):
        raise HTTPException(400, "Invalid or expired code")

    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(404, "User not found")

    user.password_hash = pwd_context.hash(payload.new_password)
    user.is_verified = True
    db.commit()
    return {"message": "Password reset successful"}


# ---------- Profile management ----------
@router.patch("/me")
def update_profile(
    payload: UpdateProfileRequest,
    user=Depends(require_user),
    db: Session = Depends(get_db),
):
    if payload.name is not None:
        user.name = payload.name.strip()
    if payload.phone is not None:
        # Allow clearing phone by sending empty string
        new_phone = payload.phone.strip() or None
        if new_phone and new_phone != user.phone:
            existing = (
                db.query(models.User)
                .filter(models.User.phone == new_phone, models.User.id != user.id)
                .first()
            )
            if existing:
                raise HTTPException(400, "This phone number is already in use")
        user.phone = new_phone
    db.commit()
    db.refresh(user)
    return _user_response(user)


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    user=Depends(require_user),
    db: Session = Depends(get_db),
):
    if not pwd_context.verify(payload.current_password, user.password_hash):
        raise HTTPException(401, "Current password is incorrect")
    user.password_hash = pwd_context.hash(payload.new_password)
    db.commit()
    return {"ok": True}


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    user=Depends(require_user),
    db: Session = Depends(get_db),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "Only image files are allowed")

    ext = (file.filename or "").split(".")[-1].lower()
    if ext not in ("jpg", "jpeg", "png", "webp", "gif"):
        raise HTTPException(400, "Unsupported image format")

    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(400, "Image too large (max 5 MB)")

    # Delete old avatar
    if user.avatar_url:
        old_path = user.avatar_url.lstrip("/")
        try:
            os.remove(old_path)
        except Exception:
            pass

    filename = f"{user.id}_{uuid.uuid4().hex[:10]}.{ext}"
    filepath = AVATAR_DIR / filename
    with open(filepath, "wb") as f:
        f.write(contents)

    user.avatar_url = f"/uploads/avatars/{filename}"
    db.commit()
    db.refresh(user)
    return _user_response(user)