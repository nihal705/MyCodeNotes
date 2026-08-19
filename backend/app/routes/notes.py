from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.database import get_db
from app.auth import get_current_admin
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/notes", tags=["notes"])

# GET all notes - NO AUTH REQUIRED
@router.get("/", response_model=List[schemas.NoteResponse])
def get_notes(
    skip: int = 0,
    limit: int = None,
    db: Session = Depends(get_db)
):
    logger.info("Fetching all notes")
    notes = db.query(models.Note).offset(skip).limit(limit).all()
    return notes

# GET single note by slug - NO AUTH REQUIRED
@router.get("/{slug}", response_model=schemas.NoteResponse)
def get_note_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    logger.info(f"Fetching note: {slug}")
    note = db.query(models.Note).filter(models.Note.slug == slug).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

# POST - Create new note - ADMIN ONLY
@router.post("/", response_model=schemas.NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    note: schemas.NoteCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    logger.info(f"Creating note: {note.title}")
    logger.info(f"Admin: {admin}")
    
    # Check if note already exists
    existing = db.query(models.Note).filter(models.Note.slug == note.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Note with this slug already exists"
        )
    
    db_note = models.Note(**note.model_dump())
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    logger.info(f"Note created with ID: {db_note.id}")
    return db_note

# PUT - Update note - ADMIN ONLY
@router.put("/{slug}", response_model=schemas.NoteResponse)
def update_note(
    slug: str,
    note: schemas.NoteUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    logger.info(f"Updating note: {slug}")
    db_note = db.query(models.Note).filter(models.Note.slug == slug).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    for key, value in note.model_dump().items():
        setattr(db_note, key, value)
    
    db.commit()
    db.refresh(db_note)
    return db_note

# DELETE - Delete note - ADMIN ONLY
@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    slug: str,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    logger.info(f"Deleting note: {slug}")
    db_note = db.query(models.Note).filter(models.Note.slug == slug).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(db_note)
    db.commit()
    return {"message": "Note deleted successfully"}