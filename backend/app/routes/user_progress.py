"""Per-user progress, streaks, notes, mock tests, study plan, export."""
import logging
from datetime import date, datetime, timedelta, timezone
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.routes.auth import require_user
from app.services.llm import stream_groq, GROQ_MODEL_FREE
import json

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/user", tags=["user"])


# ---------- Schemas ----------
class ToggleProgressRequest(BaseModel):
    problem_type: str
    problem_id: int
    solved: bool
    notes: Optional[str] = None


class NotesUpdate(BaseModel):
    notes: str


class GoalCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    description: Optional[str] = None
    target_count: int = Field(..., ge=1, le=10000)
    target_date: Optional[date] = None


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_count: Optional[int] = None
    target_date: Optional[date] = None
    status: Optional[str] = None


class MockTestStart(BaseModel):
    count: Optional[int] = Field(None, ge=1, le=5)
    specific_ids: Optional[List[int]] = None
    difficulty: Optional[str] = None
    duration_minutes: Optional[int] = Field(None, ge=5, le=180)


class MockTestSubmit(BaseModel):
    solved_ids: List[int]
    duration_seconds: int


class StudyPlanRequest(BaseModel):
    goal_title: str
    target_count: int = Field(..., ge=1, le=100)
    topic: Optional[str] = None
    difficulty_pref: Optional[str] = None


# ---------- Helpers ----------
def _log_activity(db: Session, user_id: int, solved_delta: int = 0, chat_delta: int = 0):
    today = datetime.now(timezone.utc).date()
    row = (
        db.query(models.UserActivity)
        .filter(models.UserActivity.user_id == user_id, models.UserActivity.date == today)
        .first()
    )
    if not row:
        row = models.UserActivity(user_id=user_id, date=today, problems_solved=0, chats_count=0)
        db.add(row)
        db.flush()
    row.problems_solved = max(0, (row.problems_solved or 0) + solved_delta)
    row.chats_count = (row.chats_count or 0) + chat_delta


def _compute_streak(db: Session, user_id: int) -> dict:
    rows = (
        db.query(models.UserActivity)
        .filter(models.UserActivity.user_id == user_id)
        .order_by(models.UserActivity.date.desc())
        .limit(365)
        .all()
    )
    if not rows:
        return {"current": 0, "longest": 0, "active_days": 0, "last_active": None}

    active_dates = sorted(
        {r.date for r in rows if (r.problems_solved or 0) + (r.chats_count or 0) > 0},
        reverse=True,
    )
    if not active_dates:
        return {"current": 0, "longest": 0, "active_days": 0, "last_active": None}

    today = datetime.now(timezone.utc).date()
    current = 0
    if active_dates[0] == today or active_dates[0] == today - timedelta(days=1):
        current = 1
        cursor = active_dates[0]
        for d in active_dates[1:]:
            if d == cursor - timedelta(days=1):
                current += 1
                cursor = d
            else:
                break

    longest = 1
    run = 1
    asc = sorted(active_dates)
    for i in range(1, len(asc)):
        if asc[i] == asc[i - 1] + timedelta(days=1):
            run += 1
            longest = max(longest, run)
        else:
            run = 1

    return {
        "current": current,
        "longest": longest,
        "active_days": len(active_dates),
        "last_active": active_dates[0].isoformat(),
    }


# ---------- Progress ----------
@router.post("/progress/toggle")
def toggle_progress(payload: ToggleProgressRequest, user=Depends(require_user), db: Session = Depends(get_db)):
    if payload.problem_type not in ("leetcode", "practice"):
        raise HTTPException(400, "Invalid problem_type")

    existing = (
        db.query(models.UserProblemProgress)
        .filter(
            models.UserProblemProgress.user_id == user.id,
            models.UserProblemProgress.problem_type == payload.problem_type,
            models.UserProblemProgress.problem_id == payload.problem_id,
        )
        .first()
    )

    if payload.solved:
        if existing:
            if payload.notes is not None:
                existing.notes = payload.notes
        else:
            db.add(models.UserProblemProgress(
                user_id=user.id,
                problem_type=payload.problem_type,
                problem_id=payload.problem_id,
                status="solved",
                notes=payload.notes,
            ))
            _log_activity(db, user.id, solved_delta=1)
    else:
        if existing:
            db.delete(existing)
            _log_activity(db, user.id, solved_delta=-1)

    db.commit()
    return {"ok": True, "solved": payload.solved}


@router.put("/progress/{problem_type}/{problem_id}/notes")
def update_notes(problem_type: str, problem_id: int, payload: NotesUpdate, user=Depends(require_user), db: Session = Depends(get_db)):
    row = (
        db.query(models.UserProblemProgress)
        .filter(
            models.UserProblemProgress.user_id == user.id,
            models.UserProblemProgress.problem_type == problem_type,
            models.UserProblemProgress.problem_id == problem_id,
        )
        .first()
    )
    if not row:
        raise HTTPException(404, "Progress entry not found")
    row.notes = payload.notes
    db.commit()
    return {"ok": True, "notes": row.notes}


@router.get("/progress")
def list_progress(user=Depends(require_user), db: Session = Depends(get_db)):
    rows = db.query(models.UserProblemProgress).filter(models.UserProblemProgress.user_id == user.id).all()
    return [
        {
            "problem_type": r.problem_type,
            "problem_id": r.problem_id,
            "status": r.status,
            "notes": r.notes,
            "solved_at": r.solved_at,
        }
        for r in rows
    ]


@router.get("/progress/stats")
def progress_stats(user=Depends(require_user), db: Session = Depends(get_db)):
    total_lc = db.query(func.count(models.Problem.id)).scalar() or 0
    total_pr = db.query(func.count(models.PracticeProblem.id)).scalar() or 0

    solved_lc = (
        db.query(func.count(func.distinct(models.UserProblemProgress.problem_id)))
        .filter(
            models.UserProblemProgress.user_id == user.id,
            models.UserProblemProgress.problem_type == "leetcode",
        )
        .scalar()
        or 0
    )

    solved_pr = (
        db.query(func.count(func.distinct(models.UserProblemProgress.problem_id)))
        .filter(
            models.UserProblemProgress.user_id == user.id,
            models.UserProblemProgress.problem_type == "practice",
        )
        .scalar()
        or 0
    )

    solved_by = {"Easy": 0, "Medium": 0, "Hard": 0}
    rows = (
        db.query(
            models.Problem.difficulty,
            func.count(func.distinct(models.UserProblemProgress.problem_id)),
        )
        .join(models.UserProblemProgress,
              (models.UserProblemProgress.problem_id == models.Problem.id) &
              (models.UserProblemProgress.problem_type == "leetcode"))
        .filter(models.UserProblemProgress.user_id == user.id)
        .group_by(models.Problem.difficulty)
        .all()
    )
    for diff, c in rows:
        k = diff.value if hasattr(diff, "value") else str(diff)
        if k in solved_by:
            solved_by[k] = c

    total_by = {"Easy": 0, "Medium": 0, "Hard": 0}
    rows = db.query(models.Problem.difficulty, func.count(models.Problem.id)).group_by(models.Problem.difficulty).all()
    for diff, c in rows:
        k = diff.value if hasattr(diff, "value") else str(diff)
        if k in total_by:
            total_by[k] = c

    return {
        "leetcode": {
            "solved": solved_lc, "total": total_lc,
            "percent": round(solved_lc / total_lc * 100, 1) if total_lc else 0,
            "by_difficulty": {d: {"solved": solved_by[d], "total": total_by[d]} for d in total_by},
        },
        "practice": {
            "solved": solved_pr, "total": total_pr,
            "percent": round(solved_pr / total_pr * 100, 1) if total_pr else 0,
        },
        "overall": {
            "solved": solved_lc + solved_pr,
            "total": total_lc + total_pr,
            "percent": round((solved_lc + solved_pr) / max(1, total_lc + total_pr) * 100, 1),
        },
    }


@router.get("/progress/streak")
def get_streak(user=Depends(require_user), db: Session = Depends(get_db)):
    return _compute_streak(db, user.id)


# ---------- Goals ----------
@router.post("/goals")
def create_goal(payload: GoalCreate, user=Depends(require_user), db: Session = Depends(get_db)):
    g = models.UserStudyGoal(
        user_id=user.id,
        title=payload.title,
        description=payload.description,
        target_count=payload.target_count,
        target_date=payload.target_date,
    )
    db.add(g)
    db.commit()
    db.refresh(g)
    return _goal_dict(g, db)


@router.get("/goals")
def list_goals(user=Depends(require_user), db: Session = Depends(get_db)):
    rows = (
        db.query(models.UserStudyGoal)
        .filter(models.UserStudyGoal.user_id == user.id)
        .order_by(models.UserStudyGoal.created_at.desc())
        .all()
    )
    return [_goal_dict(g, db) for g in rows]


@router.patch("/goals/{goal_id}")
def update_goal(goal_id: int, payload: GoalUpdate, user=Depends(require_user), db: Session = Depends(get_db)):
    g = db.query(models.UserStudyGoal).filter(models.UserStudyGoal.id == goal_id, models.UserStudyGoal.user_id == user.id).first()
    if not g:
        raise HTTPException(404, "Goal not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(g, k, v)
    db.commit()
    db.refresh(g)
    return _goal_dict(g, db)


@router.delete("/goals/{goal_id}")
def delete_goal(goal_id: int, user=Depends(require_user), db: Session = Depends(get_db)):
    g = db.query(models.UserStudyGoal).filter(models.UserStudyGoal.id == goal_id, models.UserStudyGoal.user_id == user.id).first()
    if not g:
        raise HTTPException(404, "Goal not found")
    db.delete(g)
    db.commit()
    return {"ok": True}
  
@router.get("/goals/{goal_id}")
def get_goal(goal_id: int, user=Depends(require_user), db: Session = Depends(get_db)):
    """Return one goal with its full plan (problems + solved flags)."""
    g = (
        db.query(models.UserStudyGoal)
        .filter(models.UserStudyGoal.id == goal_id, models.UserStudyGoal.user_id == user.id)
        .first()
    )
    if not g:
        raise HTTPException(404, "Goal not found")

    plan = g.plan_data if isinstance(g.plan_data, list) else []

    # Get solved ids for these plan problems
    solved_ids = set()
    if plan:
        plan_ids = [
            item.get("id") for item in plan
            if isinstance(item, dict) and item.get("id") is not None
        ]
        if plan_ids:
            rows = (
                db.query(models.UserProblemProgress.problem_id)
                .filter(
                    models.UserProblemProgress.user_id == user.id,
                    models.UserProblemProgress.problem_type == "leetcode",
                    models.UserProblemProgress.problem_id.in_(plan_ids),
                )
                .all()
            )
            solved_ids = {r[0] for r in rows}

    enriched_plan = []
    for item in plan:
        if isinstance(item, dict):
            enriched_plan.append({**item, "solved": item.get("id") in solved_ids})

    base = _goal_dict(g, db)
    base["plan"] = enriched_plan
    return base

def _goal_dict(g, db):
    """Compute progress. If plan_data exists, count only plan problems."""
    plan = g.plan_data if isinstance(g.plan_data, list) else []

    if plan:
        plan_ids = [
            item.get("id") for item in plan
            if isinstance(item, dict) and item.get("id") is not None
        ]
        if plan_ids:
            solved = (
                db.query(func.count(func.distinct(models.UserProblemProgress.problem_id)))
                .filter(
                    models.UserProblemProgress.user_id == g.user_id,
                    models.UserProblemProgress.problem_type == "leetcode",
                    models.UserProblemProgress.problem_id.in_(plan_ids),
                )
                .scalar()
                or 0
            )
        else:
            solved = 0
    else:
        # Fallback for manually-created goals (no plan)
        solved = (
            db.query(func.count(func.distinct(models.UserProblemProgress.problem_id)))
            .filter(
                models.UserProblemProgress.user_id == g.user_id,
                models.UserProblemProgress.solved_at >= g.created_at,
            )
            .scalar()
            or 0
        )

    target = max(1, g.target_count)
    return {
        "id": g.id,
        "title": g.title,
        "description": g.description,
        "target_count": g.target_count,
        "solved_count": solved,
        "progress_percent": min(100, round(solved / target * 100, 1)),
        "target_date": g.target_date,
        "status": g.status,
        "created_at": g.created_at,
        "has_plan": bool(plan),
    }


# ---------- Mock Test helpers ----------
def _mock_problems(db, ids):
    if not ids:
        return []
    rows = db.query(models.Problem).filter(models.Problem.id.in_(ids)).all()
    order = {pid: i for i, pid in enumerate(ids)}
    rows = sorted(rows, key=lambda p: order.get(p.id, 999))
    return [
        {
            "id": p.id,
            "leetcode_id": p.leetcode_id,
            "title": p.title,
            "difficulty": p.difficulty.value if hasattr(p.difficulty, "value") else str(p.difficulty),
            "statement": p.statement,
            "description": p.description or "",
            "concept": p.concept or "",
            "pattern": p.pattern or "",
        }
        for p in rows
    ]


# ============================================================
# MOCK TEST ROUTES — order matters!
# Literal paths (candidates, list, start) MUST come before {mock_id}
# ============================================================

@router.get("/mock-test/candidates")
def mock_test_candidates(
    difficulty: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = 200,
    user=Depends(require_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.Problem)
    if difficulty in ("Easy", "Medium", "Hard"):
        query = query.filter(models.Problem.difficulty == difficulty)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (models.Problem.title.ilike(like)) |
            (models.Problem.concept.ilike(like))
        )
    rows = query.order_by(models.Problem.leetcode_id).limit(limit).all()
    return [
        {
            "id": p.id,
            "leetcode_id": p.leetcode_id,
            "title": p.title,
            "difficulty": p.difficulty.value if hasattr(p.difficulty, "value") else str(p.difficulty),
            "concept": p.concept or "",
        }
        for p in rows
    ]


@router.get("/mock-test/list")
def list_mock_tests(user=Depends(require_user), db: Session = Depends(get_db)):
    rows = (
        db.query(models.UserMockTest)
        .filter(models.UserMockTest.user_id == user.id)
        .order_by(models.UserMockTest.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": m.id, "title": m.title, "score": m.score, "total": m.total,
            "duration_seconds": m.duration_seconds, "status": m.status,
            "created_at": m.created_at, "completed_at": m.completed_at,
        }
        for m in rows
    ]


@router.post("/mock-test/start")
def start_mock_test(payload: MockTestStart, user=Depends(require_user), db: Session = Depends(get_db)):
    problems = []

    if payload.specific_ids:
        rows = db.query(models.Problem).filter(models.Problem.id.in_(payload.specific_ids)).all()
        order = {pid: i for i, pid in enumerate(payload.specific_ids)}
        problems = sorted(rows, key=lambda p: order.get(p.id, 999))
    else:
        count = payload.count or 2
        q = db.query(models.Problem)
        if payload.difficulty in ("Easy", "Medium", "Hard"):
            q = q.filter(models.Problem.difficulty == payload.difficulty)
        problems = q.order_by(func.random()).limit(count).all()

    if not problems:
        raise HTTPException(404, "No problems found for the given filter")

    mt = models.UserMockTest(
        user_id=user.id,
        title=(
            f"Custom test ({len(problems)} problems)"
            if payload.specific_ids
            else f"Mock Test ({len(problems)} problems)"
        ),
        problem_ids=[p.id for p in problems],
        solved_ids=[],
        total=len(problems),
        status="in_progress",
    )
    db.add(mt)
    db.commit()
    db.refresh(mt)

    return {
        "mock_test_id": mt.id,
        "title": mt.title,
        "status": mt.status,
        "solved_ids": [],
        "duration_minutes": payload.duration_minutes,
        "problems": _mock_problems(db, mt.problem_ids),
    }


# ---------- Parameterized mock test routes — AFTER literals ----------
@router.get("/mock-test/{mock_id}")
def get_mock_test(mock_id: int, user=Depends(require_user), db: Session = Depends(get_db)):
    mt = (
        db.query(models.UserMockTest)
        .filter(models.UserMockTest.id == mock_id, models.UserMockTest.user_id == user.id)
        .first()
    )
    if not mt:
        raise HTTPException(404, "Mock test not found")
    return {
        "mock_test_id": mt.id,
        "title": mt.title,
        "status": mt.status,
        "solved_ids": mt.solved_ids or [],
        "duration_minutes": None,
        "problems": _mock_problems(db, mt.problem_ids or []),
    }


@router.post("/mock-test/{mock_id}/submit")
def submit_mock_test(mock_id: int, payload: MockTestSubmit, user=Depends(require_user), db: Session = Depends(get_db)):
    mt = db.query(models.UserMockTest).filter(models.UserMockTest.id == mock_id, models.UserMockTest.user_id == user.id).first()
    if not mt:
        raise HTTPException(404, "Mock test not found")
    if mt.status == "completed":
        raise HTTPException(400, "Already submitted")

    solved = [int(x) for x in payload.solved_ids if int(x) in (mt.problem_ids or [])]
    mt.solved_ids = solved
    mt.score = len(solved)
    mt.duration_seconds = payload.duration_seconds
    mt.status = "completed"
    mt.completed_at = datetime.now(timezone.utc)

    for pid in solved:
        existing = (
            db.query(models.UserProblemProgress)
            .filter(
                models.UserProblemProgress.user_id == user.id,
                models.UserProblemProgress.problem_type == "leetcode",
                models.UserProblemProgress.problem_id == pid,
            )
            .first()
        )
        if not existing:
            db.add(models.UserProblemProgress(
                user_id=user.id, problem_type="leetcode", problem_id=pid, status="solved"
            ))
            _log_activity(db, user.id, solved_delta=1)

    db.commit()
    return {"ok": True, "score": mt.score, "total": mt.total}


@router.delete("/mock-test/{mock_id}")
def delete_mock_test(mock_id: int, user=Depends(require_user), db: Session = Depends(get_db)):
    mt = db.query(models.UserMockTest).filter(models.UserMockTest.id == mock_id, models.UserMockTest.user_id == user.id).first()
    if not mt:
        raise HTTPException(404, "Mock test not found")
    db.delete(mt)
    db.commit()
    return {"ok": True}


# ---------- Study Plan Generator ----------
@router.post("/study-plan/generate")
async def generate_study_plan(payload: StudyPlanRequest, user=Depends(require_user), db: Session = Depends(get_db)):
    solved_ids = [
        r.problem_id
        for r in db.query(models.UserProblemProgress)
        .filter(models.UserProblemProgress.user_id == user.id, models.UserProblemProgress.problem_type == "leetcode")
        .all()
    ]

    q = db.query(models.Problem)
    if payload.difficulty_pref and payload.difficulty_pref in ("Easy", "Medium", "Hard"):
        q = q.filter(models.Problem.difficulty == payload.difficulty_pref)
    candidates = q.filter(~models.Problem.id.in_(solved_ids)).limit(80).all()

    if not candidates:
        raise HTTPException(404, "No unsolved problems to build a plan from")

    problem_list = [
        {
            "id": p.id,
            "leetcode_id": p.leetcode_id,
            "title": p.title,
            "difficulty": p.difficulty.value if hasattr(p.difficulty, "value") else str(p.difficulty),
            "concept": p.concept or "",
        }
        for p in candidates
    ]

    prompt = (
        f"You are an expert DSA study planner. The user wants to: {payload.goal_title}. "
        f"Pick exactly {payload.target_count} problems from the list below, ordered from easiest/most foundational to hardest. "
        f"{'Focus only on topic: ' + payload.topic + '.' if payload.topic else ''} "
        "Return ONLY a JSON object with this exact schema: "
        '{"plan": [{"id": <problem_id>, "day": <int starting from 1>, "reason": "<short reason>"}]}. '
        "No prose, no markdown, just the JSON. Here are the problems:\n"
        + json.dumps(problem_list)
    )

    raw = ""
    try:
        async for chunk in stream_groq(
            [{"role": "user", "content": prompt}],
            model=GROQ_MODEL_FREE,
            temperature=0.3,
            max_tokens=2000,
        ):
            raw += chunk
    except Exception as e:
        logger.error(f"Study plan LLM failed: {e}")
        raise HTTPException(500, "AI service unavailable")

    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1:
        raise HTTPException(500, "AI returned malformed plan")
    try:
        parsed = json.loads(raw[start:end + 1])
        plan = parsed.get("plan", [])
    except Exception:
        raise HTTPException(500, "AI returned malformed plan")

    problem_map = {p["id"]: p for p in problem_list}
    enriched = []
    for item in plan:
        pid = item.get("id")
        if pid in problem_map:
            enriched.append({
                **problem_map[pid],
                "day": item.get("day", 1),
                "reason": item.get("reason", ""),
            })

    g = models.UserStudyGoal(
        user_id=user.id,
        title=payload.goal_title,
        description=f"AI-generated plan · {len(enriched)} problems · Topic: {payload.topic or 'mixed'}",
        target_count=len(enriched),
        status="active",
        plan_data=enriched,
    )
    db.add(g)
    db.commit()
    db.refresh(g)

    return {"goal": _goal_dict(g, db), "plan": enriched}


# ---------- Export ----------
@router.get("/export/progress")
def export_progress(user=Depends(require_user), db: Session = Depends(get_db)):
    progress_rows = db.query(models.UserProblemProgress).filter(models.UserProblemProgress.user_id == user.id).all()
    stats = progress_stats(user, db)
    streak = _compute_streak(db, user.id)
    goals = db.query(models.UserStudyGoal).filter(models.UserStudyGoal.user_id == user.id).all()
    mock = db.query(models.UserMockTest).filter(models.UserMockTest.user_id == user.id).all()

    return {
        "user": {"name": user.name, "email": user.email},
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "stats": stats,
        "streak": streak,
        "solved": [
            {"type": r.problem_type, "id": r.problem_id, "solved_at": r.solved_at, "notes": r.notes}
            for r in progress_rows
        ],
        "goals": [_goal_dict(g, db) for g in goals],
        "mock_tests": [
            {"title": m.title, "score": m.score, "total": m.total, "status": m.status, "created_at": m.created_at}
            for m in mock
        ],
    }