from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.database import get_db
from app.auth import get_current_admin
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/problems", tags=["problems"])

# GET all problems - NO AUTH REQUIRED
@router.get("/", response_model=List[schemas.ProblemResponse])
def get_problems(
    skip: int = 0,
    limit: int = None,
    db: Session = Depends(get_db)
):
    logger.info("Fetching all problems")
    problems = db.query(models.Problem).offset(skip).limit(limit).all()
    return problems

# GET single problem by ID - NO AUTH REQUIRED
@router.get("/{problem_id}", response_model=schemas.ProblemResponse)
def get_problem(
    problem_id: int,
    db: Session = Depends(get_db)
):
    logger.info(f"Fetching problem: {problem_id}")
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem

# GET problem by LeetCode ID - NO AUTH REQUIRED
@router.get("/leetcode/{leetcode_id}", response_model=schemas.ProblemResponse)
def get_problem_by_leetcode_id(
    leetcode_id: int,
    db: Session = Depends(get_db)
):
    logger.info(f"Fetching problem by LeetCode ID: {leetcode_id}")
    problem = db.query(models.Problem).filter(models.Problem.leetcode_id == leetcode_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem

# POST - Create new problem - ADMIN ONLY
@router.post("/", response_model=schemas.ProblemResponse, status_code=status.HTTP_201_CREATED)
def create_problem(
    problem: schemas.ProblemCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    logger.info(f"Creating problem: {problem.title}")
    logger.info(f"Admin: {admin}")
    
    # Check if problem already exists
    existing = db.query(models.Problem).filter(
        models.Problem.leetcode_id == problem.leetcode_id
    ).first()
    if existing:
        logger.warning(f"Problem already exists: {problem.leetcode_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Problem with this LeetCode ID already exists"
        )
    
    db_problem = models.Problem(**problem.model_dump())
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    logger.info(f"Problem created with ID: {db_problem.id}")
    return db_problem

# PUT - Update problem - ADMIN ONLY
@router.put("/{problem_id}", response_model=schemas.ProblemResponse)
def update_problem(
    problem_id: int,
    problem: schemas.ProblemUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    logger.info(f"Updating problem: {problem_id}")
    db_problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    for key, value in problem.model_dump().items():
        setattr(db_problem, key, value)
    
    db.commit()
    db.refresh(db_problem)
    return db_problem