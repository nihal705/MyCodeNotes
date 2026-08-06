from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.database import get_db
from app.auth import get_current_admin
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/concepts", tags=["concepts"])

# GET all concepts - NO AUTH REQUIRED
@router.get("/", response_model=List[schemas.ConceptResponse])
def get_concepts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    logger.info("Fetching all concepts")
    concepts = db.query(models.Concept).offset(skip).limit(limit).all()
    return concepts

# GET single concept - NO AUTH REQUIRED
@router.get("/{concept_id}", response_model=schemas.ConceptResponse)
def get_concept(
    concept_id: int,
    db: Session = Depends(get_db)
):
    logger.info(f"Fetching concept: {concept_id}")
    concept = db.query(models.Concept).filter(models.Concept.id == concept_id).first()
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    return concept

# GET concept by name - NO AUTH REQUIRED
@router.get("/name/{name}", response_model=schemas.ConceptResponse)
def get_concept_by_name(
    name: str,
    db: Session = Depends(get_db)
):
    logger.info(f"Fetching concept by name: {name}")
    concept = db.query(models.Concept).filter(models.Concept.name == name).first()
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    return concept

# POST - Create new concept - ADMIN ONLY
@router.post("/", response_model=schemas.ConceptResponse, status_code=status.HTTP_201_CREATED)
def create_concept(
    concept: schemas.ConceptCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    logger.info(f"Creating concept: {concept.name}")
    logger.info(f"Admin: {admin}")
    
    # Check if concept already exists
    existing = db.query(models.Concept).filter(models.Concept.name == concept.name).first()
    if existing:
        logger.warning(f"Concept already exists: {concept.name}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Concept with this name already exists"
        )
    
    db_concept = models.Concept(**concept.model_dump())
    db.add(db_concept)
    db.commit()
    db.refresh(db_concept)
    logger.info(f"Concept created with ID: {db_concept.id}")
    return db_concept

# PUT - Update concept - ADMIN ONLY
@router.put("/{concept_id}", response_model=schemas.ConceptResponse)
def update_concept(
    concept_id: int,
    concept: schemas.ConceptUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    logger.info(f"Updating concept: {concept_id}")
    db_concept = db.query(models.Concept).filter(models.Concept.id == concept_id).first()
    if not db_concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    
    for key, value in concept.model_dump().items():
        setattr(db_concept, key, value)
    
    db.commit()
    db.refresh(db_concept)
    return db_concept