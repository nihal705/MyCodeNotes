from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models import Difficulty, PracticeDifficulty, PracticeLanguage

# ====== Problem Schemas ======
class ProblemBase(BaseModel):
    leetcode_id: int
    title: str
    difficulty: Difficulty
    statement: str
    description: Optional[str] = None
    concept: Optional[str] = None
    pattern: Optional[str] = None
    algorithm: Optional[str] = None
    notebook_concept: Optional[str] = None
    java_solution: Optional[str] = None
    python_solution: Optional[str] = None

class ProblemCreate(ProblemBase):
    pass

class ProblemUpdate(ProblemBase):
    pass

class ProblemResponse(ProblemBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ====== Practice Problem Schemas ======
class PracticeProblemBase(BaseModel):
    title: str
    language: PracticeLanguage
    difficulty: PracticeDifficulty
    question: str
    hints: Optional[List[str]] = []
    solution: str
    tags: Optional[List[str]] = []

class PracticeProblemCreate(PracticeProblemBase):
    pass

class PracticeProblemUpdate(PracticeProblemBase):
    pass

class PracticeProblemResponse(PracticeProblemBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ====== Concept Schemas ======
class ConceptBase(BaseModel):
    name: str
    definition: str
    example: Optional[str] = None

class ConceptCreate(ConceptBase):
    pass

class ConceptUpdate(ConceptBase):
    pass

class ConceptResponse(ConceptBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ====== Admin Auth Schemas ======
class AdminLogin(BaseModel):
    password: str

class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str