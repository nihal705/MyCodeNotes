from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from jose import jwt, JWTError
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

SECRET_KEY = os.getenv("API_SECRET_KEY", "your-secret-key-here-please-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

security = HTTPBearer(auto_error=False)

def verify_admin_password(password: str) -> bool:
    """Verify admin password from environment"""
    admin_password = os.getenv("ADMIN_PASSWORD")
    logger.info(f"Checking password: provided={password[:5]}..., stored={admin_password[:5] if admin_password else 'None'}...")
    return password == admin_password

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    logger.info(f"Token created: {encoded_jwt[:20]}...")
    return encoded_jwt

def verify_token(token: str):
    try:
        logger.info(f"Verifying token: {token[:20]}...")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        logger.info(f"Token verified successfully for: {payload.get('sub')}")
        return payload
    except JWTError as e:
        logger.error(f"Token verification failed: {str(e)}")
        return None

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials is None:
        logger.warning("No credentials provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    logger.info(f"Received token: {token[:20]}...")
    
    payload = verify_token(token)
    if payload is None:
        logger.warning("Token verification failed - invalid token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if token is expired
    exp = payload.get('exp')
    if exp:
        exp_datetime = datetime.fromtimestamp(exp)
        if exp_datetime < datetime.utcnow():
            logger.warning("Token has expired")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    logger.info(f"Token verified for: {payload.get('sub')}")
    return payload