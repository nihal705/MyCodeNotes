from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models import Difficulty, PracticeDifficulty, PracticeLanguage


# ============================================================
# Existing schemas (unchanged)
# ============================================================
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


class AdminLogin(BaseModel):
    password: str


class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str


class NoteBase(BaseModel):
    title: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    content: Dict[str, Any]
    tags: Optional[List[str]] = []


class NoteCreate(NoteBase):
    pass


class NoteUpdate(NoteBase):
    pass


class NoteResponse(NoteBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================
# NEW: Auth schemas
# ============================================================
class UserSignup(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    password: str = Field(..., min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    tier: str
    is_verified: bool

    class Config:
        from_attributes = True


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=128)


# ============================================================
# NEW: NextraAI chat schemas
# ============================================================
class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    conversation_id: Optional[str] = None
    page_context: Optional[Dict[str, Any]] = None


class AIFeedbackRequest(BaseModel):
    message_id: int
    feedback: int  # -1 or 1
    note: Optional[str] = None


class AIUsageResponse(BaseModel):
    used: int
    limit: int
    remaining: int
    tier: str


class CitationItem(BaseModel):
    index: int
    id: int
    source_type: Optional[str] = None
    title: Optional[str] = None
    url: Optional[str] = None
    similarity: float


class AIMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    citations: Optional[List[int]] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime