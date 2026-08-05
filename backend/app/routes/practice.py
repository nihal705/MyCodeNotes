from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app import models, schemas
from app.database import get_db
from app.auth import get_current_admin
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/practice", tags=["practice"])

# GET all practice problems - NO AUTH REQUIRED
@router.get("/", response_model=List[schemas.PracticeProblemResponse])
def get_practice_problems(
    skip: int = 0,
    limit: int = 100,
    language: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db)
):
    logger.info("Fetching practice problems")
    query = db.query(models.PracticeProblem)
    
    if language:
        query = query.filter(models.PracticeProblem.language == language)
    if difficulty:
        query = query.filter(models.PracticeProblem.difficulty == difficulty)
    
    problems = query.offset(skip).limit(limit).all()
    return problems

# GET single practice problem - NO AUTH REQUIRED
@router.get("/{problem_id}", response_model=schemas.PracticeProblemResponse)
def get_practice_problem(
    problem_id: int,
    db: Session = Depends(get_db)
):
    logger.info(f"Fetching practice problem: {problem_id}")
    problem = db.query(models.PracticeProblem).filter(models.PracticeProblem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Practice problem not found")
    return problem

# POST - Create new practice problem - ADMIN ONLY
@router.post("/", response_model=schemas.PracticeProblemResponse, status_code=status.HTTP_201_CREATED)
def create_practice_problem(
    problem: schemas.PracticeProblemCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    logger.info(f"Creating practice problem: {problem.title}")
    logger.info(f"Admin: {admin}")
    
    db_problem = models.PracticeProblem(**problem.model_dump())
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    logger.info(f"Practice problem created with ID: {db_problem.id}")
    return db_problem

# PUT - Update practice problem - ADMIN ONLY
@router.put("/{problem_id}", response_model=schemas.PracticeProblemResponse)
def update_practice_problem(
    problem_id: int,
    problem: schemas.PracticeProblemUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    logger.info(f"Updating practice problem: {problem_id}")
    db_problem = db.query(models.PracticeProblem).filter(models.PracticeProblem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Practice problem not found")
    
    for key, value in problem.model_dump().items():
        setattr(db_problem, key, value)
    
    db.commit()
    db.refresh(db_problem)
    return db_problem