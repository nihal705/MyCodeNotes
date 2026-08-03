from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Enum
from sqlalchemy.sql import func
from app.database import Base
import enum

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

# Table 1: LeetCode Problems
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

# Table 2: Practice Problems (Learn & Practice)
class PracticeProblem(Base):
    __tablename__ = "practice_problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    language = Column(Enum(PracticeLanguage), nullable=False)
    difficulty = Column(Enum(PracticeDifficulty), nullable=False)
    question = Column(Text, nullable=False)
    hints = Column(JSON, default=[])  # Array of strings
    solution = Column(Text, nullable=False)
    tags = Column(JSON, default=[])  # Array of strings
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Table 3: Concepts (Pure Theory)
class Concept(Base):
    __tablename__ = "concepts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    definition = Column(Text, nullable=False)
    example = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Table 4: Admin Logs (Audit Trail)
class AdminLog(Base):
    __tablename__ = "admin_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(50), nullable=False)
    table_name = Column(String(50), nullable=False)
    record_id = Column(Integer)
    ip_address = Column(String(50))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

# Table 5: Profile Settings (NEW)
class ProfileSetting(Base):
    __tablename__ = "profile_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(50), unique=True, index=True, nullable=False)
    value = Column(Text)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# Table 6: Notes
class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text)
    icon = Column(String(50))
    content = Column(JSON, nullable=False)  # JSON structure with chapters and topics
    tags = Column(JSON, default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())