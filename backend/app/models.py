from sqlalchemy import (
    Column, Integer, String, Text, DateTime, JSON, Enum,
    Boolean, BigInteger, SmallInteger, Date, ForeignKey, UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.sql import func
from app.database import Base
import enum


# ============================================================
# Existing enums
# ============================================================
class Difficulty(str, enum.Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"


class PracticeDifficulty(str, enum.Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"


class PracticeLanguage(str, enum.Enum):
    JAVA = "Java"
    PYTHON = "Python"


# ============================================================
# Existing tables (unchanged)
# ============================================================
class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    leetcode_id = Column(Integer, unique=True, index=True, nullable=False)
    title = Column(String(255), index=True, nullable=False)
    difficulty = Column(Enum(Difficulty), nullable=False)
    statement = Column(Text, nullable=False)
    description = Column(Text)
    concept = Column(Text)
    pattern = Column(Text)
    algorithm = Column(Text)
    notebook_concept = Column(Text)
    java_solution = Column(Text)
    python_solution = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class PracticeProblem(Base):
    __tablename__ = "practice_problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    language = Column(Enum(PracticeLanguage), nullable=False)
    difficulty = Column(Enum(PracticeDifficulty), nullable=False)
    question = Column(Text, nullable=False)
    hints = Column(JSON, default=[])
    solution = Column(Text, nullable=False)
    tags = Column(JSON, default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Concept(Base):
    __tablename__ = "concepts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    definition = Column(Text, nullable=False)
    example = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class AdminLog(Base):
    __tablename__ = "admin_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(50), nullable=False)
    table_name = Column(String(50), nullable=False)
    record_id = Column(Integer)
    ip_address = Column(String(50))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


class ProfileSetting(Base):
    __tablename__ = "profile_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(50), unique=True, index=True, nullable=False)
    value = Column(Text)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text)
    icon = Column(String(50))
    content = Column(JSON, nullable=False)
    tags = Column(JSON, default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# ============================================================
# NEW: NextraAI tables
# ============================================================
class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    email = Column(Text, unique=True, nullable=False, index=True)
    phone = Column(Text, unique=True, nullable=True)
    avatar_url = Column(Text)
    password_hash = Column(Text, nullable=False)
    is_verified = Column(Boolean, default=False)
    tier = Column(Text, default="free")  # 'free' | 'premium' | 'admin'
    premium_until = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)


class EmailOTP(Base):
    __tablename__ = "email_otps"

    id = Column(BigInteger, primary_key=True, index=True)
    email = Column(Text, nullable=False)
    otp_hash = Column(Text, nullable=False)
    purpose = Column(Text, nullable=False)  # 'signup' | 'reset'
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AIChunk(Base):
    """Vector store. The `embedding` column is intentionally NOT mapped here
    (SQLAlchemy has no native pgvector type without extra dependency).
    All reads/writes go through raw SQL in services/vector_store.py."""
    __tablename__ = "ai_chunks"

    id = Column(BigInteger, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    source_type = Column(Text, nullable=False)
    source_id = Column(BigInteger)
    metadata_json = Column("metadata", JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    conversation_id = Column(Text, nullable=False, unique=True)
    title = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())
    archived = Column(Boolean, default=False)


class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(BigInteger, primary_key=True, index=True)
    conversation_id = Column(Text, nullable=False)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    role = Column(Text, nullable=False)  # 'user' | 'assistant'
    content = Column(Text, nullable=False)
    cited_chunk_ids = Column(ARRAY(BigInteger))
    model_used = Column(Text)
    tokens_in = Column(Integer)
    tokens_out = Column(Integer)
    latency_ms = Column(Integer)
    feedback = Column(SmallInteger, default=0)
    feedback_note = Column(Text)
    metadata_json = Column("metadata", JSONB, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class NextraUsage(Base):
    __tablename__ = "nextra_usage"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    date = Column(Date, nullable=False)
    messages_used = Column(Integer, default=0)
    messages_limit = Column(Integer, default=25)
    tokens_used = Column(Integer, default=0)
    tier = Column(Text, default="free")

    __table_args__ = (
        UniqueConstraint("user_id", "date", name="uq_nextra_usage_user_date"),
    )

class InviteCode(Base):
    __tablename__ = "invite_codes"

    id = Column(BigInteger, primary_key=True, index=True)
    code = Column(Text, unique=True, nullable=False, index=True)
    tier = Column(Text, nullable=False, default="premium")
    duration_days = Column(Integer, nullable=False, default=30)
    created_by = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"))
    used_by = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"))
    used_at = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text)
    
class UserProblemProgress(Base):
    __tablename__ = "user_problem_progress"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    problem_type = Column(Text, nullable=False)
    problem_id = Column(BigInteger, nullable=False)
    status = Column(Text, nullable=False, default="solved")
    notes = Column(Text)
    solved_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "problem_type", "problem_id", name="uq_user_problem"),
    )


class UserStudyGoal(Base):
    __tablename__ = "user_study_goals"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title = Column(Text, nullable=False)
    description = Column(Text)
    target_count = Column(Integer, nullable=False, default=10)
    target_date = Column(Date)
    status = Column(Text, nullable=False, default="active")
    plan_data = Column(JSONB, default=list)    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())
    
class UserActivity(Base):
    __tablename__ = "user_activity"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    date = Column(Date, nullable=False)
    problems_solved = Column(Integer, default=0)
    chats_count = Column(Integer, default=0)

    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_uact_user_date"),)


class UserMockTest(Base):
    __tablename__ = "user_mock_tests"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title = Column(Text)
    problem_ids = Column(JSONB, default=[])
    solved_ids = Column(JSONB, default=[])
    duration_seconds = Column(Integer)
    score = Column(Integer, default=0)
    total = Column(Integer, default=0)
    status = Column(Text, default="in_progress")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))