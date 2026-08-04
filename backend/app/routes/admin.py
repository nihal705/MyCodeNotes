from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import verify_admin_password, create_access_token, get_current_admin
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["admin"])

class AdminLogin(BaseModel):
    password: str

class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str

@router.post("/login", response_model=AdminLoginResponse)
def admin_login(login: AdminLogin):
    """Admin login endpoint"""
    logger.info(f"Login attempt received")
    
    if not verify_admin_password(login.password):
        logger.warning("Invalid password attempt")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
    
    logger.info("Password correct, generating token...")
    access_token = create_access_token(data={"sub": "admin"})
    logger.info(f"Token generated successfully: {access_token[:20]}...")
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/verify")
def verify_admin(admin: dict = Depends(get_current_admin)):
    """Verify admin token"""
    return {"status": "valid", "user": "admin"}