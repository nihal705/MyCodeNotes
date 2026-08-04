from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_admin
from app import models
from pydantic import BaseModel
from typing import Any, Dict, Optional
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/profile", tags=["profile"])

class ProfileUpdate(BaseModel):
    key: str
    value: Any

class BulkProfileUpdateRequest(BaseModel):
    settings: Dict[str, Any]

# ============================================================
# ✅ IMPORTANT: /bulk MUST come BEFORE /{key}
# ============================================================

# ✅ 1. Bulk update route FIRST
@router.put("/bulk")
def update_bulk_profile_settings(
    request: BulkProfileUpdateRequest,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Update multiple profile settings at once (Admin only)"""
    settings = request.settings
    logger.info(f"Received bulk update with {len(settings)} settings")
    
    updated = []
    for key, value in settings.items():
        logger.info(f"Updating {key} = {value}")
        
        setting = db.query(models.ProfileSetting).filter(models.ProfileSetting.key == key).first()
        if not setting:
            logger.warning(f"Setting {key} not found")
            continue
        
        if isinstance(value, (dict, list)):
            setting.value = json.dumps(value)
        else:
            setting.value = str(value)
        
        db.commit()
        db.refresh(setting)
        updated.append(key)
    
    logger.info(f"Updated: {updated}")
    return {"updated": updated}

# ✅ 2. Then the GET all route
@router.get("/")
def get_all_profile_settings(db: Session = Depends(get_db)):
    """Get all profile settings"""
    settings = db.query(models.ProfileSetting).all()
    result = {}
    for setting in settings:
        try:
            result[setting.key] = json.loads(setting.value)
        except (json.JSONDecodeError, TypeError):
            result[setting.key] = setting.value
    return result

# ✅ 3. Then the /{key} routes LAST
@router.get("/{key}")
def get_profile_setting(key: str, db: Session = Depends(get_db)):
    """Get a profile setting by key"""
    setting = db.query(models.ProfileSetting).filter(models.ProfileSetting.key == key).first()
    if not setting:
        return {"key": key, "value": None, "updated_at": None}
    
    try:
        value = json.loads(setting.value)
    except (json.JSONDecodeError, TypeError):
        value = setting.value
    
    return {"key": setting.key, "value": value, "updated_at": setting.updated_at}

@router.put("/{key}")
def update_profile_setting(
    key: str, 
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    """Update a profile setting (Admin only)"""
    setting = db.query(models.ProfileSetting).filter(models.ProfileSetting.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    if isinstance(profile_data.value, (dict, list)):
        setting.value = json.dumps(profile_data.value)
    else:
        setting.value = str(profile_data.value)
    
    db.commit()
    db.refresh(setting)
    
    try:
        value = json.loads(setting.value)
    except (json.JSONDecodeError, TypeError):
        value = setting.value
    
    return {"key": setting.key, "value": value, "updated_at": setting.updated_at}