import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import (
    User,
    Quest,
    Achievement,
    MonthlyQuest,
    UserDailyActivity,
)
from app.models.schemas import (
    UserResponse, UpdateUserStats, RefillHeartsRequest,
    SimulateStreakRequest,
)
from app.features.users.service import (
    get_or_create_monthly_quest,
    monthly_quest_response,
    refill_hearts as refill_user_hearts,
    reset_progress as reset_user_progress,
    simulate_streak as simulate_user_streak,
    sync_daily_quests,
    update_user_stats as update_learner_stats,
    update_passive_hearts,
)

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_current_user(user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    update_passive_hearts(user, db)
    return user


@router.patch("/me", response_model=UserResponse)
def update_user_stats(payload: UpdateUserStats, user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return update_learner_stats(user, payload, db)


@router.post("/refill-hearts")
def refill_hearts(payload: RefillHeartsRequest, user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        return refill_user_hearts(user, payload.method, db)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.post("/simulate-streak")
def simulate_streak(payload: SimulateStreakRequest, user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return simulate_user_streak(user, payload.action, db)


@router.post("/reset-progress")
def reset_progress(user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    reset_user_progress(user, db)
    return {"success": True, "message": "Learner progress reset to beginning of Course!"}


@router.get("/quests")
def get_user_quests(user_id: int = 1, db: Session = Depends(get_db)):
    today = datetime.date.today()
    if db.query(User).filter(User.id == user_id).first() is None:
        raise HTTPException(status_code=404, detail="User not found")
    quests = sync_daily_quests(user_id, db)
    monthly = monthly_quest_response(user_id, today, db)
    badges = db.query(MonthlyQuest).filter(
        MonthlyQuest.user_id == user_id,
    ).order_by(MonthlyQuest.year.desc(), MonthlyQuest.month.desc()).all()
    db.commit()
    return {
        "daily": [
            {
                "id": quest.id,
                "title": quest.title,
                "description": quest.description,
                "icon": quest.icon,
                "current_progress": quest.current_progress,
                "target_progress": quest.target_progress,
                "reward_gems": quest.reward_gems,
                "is_claimed": quest.is_claimed,
                "is_completed": quest.completed_at is not None,
            }
            for quest in quests
        ],
        "monthly": monthly,
        "badges": [
            {
                "id": badge.id,
                "year": badge.year,
                "month": badge.month,
                "month_name": datetime.date(badge.year, badge.month, 1).strftime("%B"),
                "title": f"{datetime.date(badge.year, badge.month, 1).strftime('%B')} Quest",
                "badge_name": badge.badge_name,
                "goal": badge.goal,
                "completed_count": badge.completed_count,
                "completed": badge.completed,
                "reward_claimed": badge.reward_claimed,
                "reward_gems": badge.reward_gems,
            }
            for badge in badges
        ],
    }


@router.post("/quests/{quest_id}/claim")
def claim_quest(quest_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    quest = db.query(Quest).filter(Quest.id == quest_id, Quest.user_id == user_id).first()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    if quest.current_progress < quest.target_progress:
        raise HTTPException(status_code=400, detail="Quest goal not reached yet")
    if quest.is_claimed:
        raise HTTPException(status_code=400, detail="Quest reward already claimed")

    quest.is_claimed = True
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.gems += quest.reward_gems

    db.commit()
    return {"success": True, "reward_gems": quest.reward_gems, "total_gems": user.gems}


@router.post("/quests/monthly/claim")
def claim_monthly_quest(user_id: int = 1, db: Session = Depends(get_db)):
    today = datetime.date.today()
    monthly = db.query(MonthlyQuest).filter_by(
        user_id=user_id,
        year=today.year,
        month=today.month,
    ).first()
    if monthly is None or not monthly.completed:
        raise HTTPException(status_code=400, detail="Monthly quest goal not reached yet")
    if monthly.reward_claimed:
        raise HTTPException(status_code=400, detail="Monthly quest reward already claimed")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    monthly.reward_claimed = True
    user.gems += monthly.reward_gems
    db.commit()
    return {
        "success": True,
        "reward_gems": monthly.reward_gems,
        "total_gems": user.gems,
    }


@router.get("/achievements")
def get_achievements(db: Session = Depends(get_db)):
    achievements = db.query(Achievement).all()
    return achievements
