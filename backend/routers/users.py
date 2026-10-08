import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Quest, Achievement, UserLessonProgress, UserSkillProgress, Lesson
from schemas import (
    UserResponse, UpdateUserStats, RefillHeartsRequest,
    SimulateStreakRequest, QuestResponse, AchievementResponse
)

router = APIRouter(prefix="/api/users", tags=["users"])


def update_passive_hearts(user: User, db: Session):
    """Regenerates 1 heart every 30 minutes if hearts < max_hearts."""
    if user.hearts < user.max_hearts and user.hearts_updated_at:
        now = datetime.datetime.utcnow()
        elapsed_seconds = (now - user.hearts_updated_at).total_seconds()
        regen_interval = 1800  # 30 minutes
        hearts_to_add = int(elapsed_seconds // regen_interval)
        if hearts_to_add > 0:
            user.hearts = min(user.max_hearts, user.hearts + hearts_to_add)
            user.hearts_updated_at = now
            db.commit()


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

    if payload.xp is not None:
        user.xp = payload.xp
    if payload.gems is not None:
        user.gems = payload.gems
    if payload.hearts is not None:
        user.hearts = min(user.max_hearts, max(0, payload.hearts))
        user.hearts_updated_at = datetime.datetime.utcnow()
    if payload.streak is not None:
        user.streak = payload.streak
        if user.streak > user.max_streak:
            user.max_streak = user.streak

    db.commit()
    db.refresh(user)
    return user


@router.post("/refill-hearts")
def refill_hearts(payload: RefillHeartsRequest, user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.method == "gems":
        cost = 350
        if user.gems < cost:
            raise HTTPException(status_code=400, detail="Not enough gems! Practice to earn hearts or get gems.")
        user.gems -= cost
        user.hearts = user.max_hearts
        user.hearts_updated_at = datetime.datetime.utcnow()
    elif payload.method in ["practice", "free"]:
        # Practice refills 1 heart or full refill for convenience
        user.hearts = min(user.max_hearts, user.hearts + 1 if payload.method == "practice" else user.max_hearts)
        user.hearts_updated_at = datetime.datetime.utcnow()

    db.commit()
    return {
        "success": True,
        "hearts": user.hearts,
        "max_hearts": user.max_hearts,
        "gems": user.gems,
        "message": "Hearts successfully replenished!"
    }


@router.post("/simulate-streak")
def simulate_streak(payload: SimulateStreakRequest, user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.action == "advance_day":
        # Simulates that the user's last practice was yesterday, so today's lesson will increment the streak!
        yesterday = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
        user.last_streak_date = yesterday
        message = "Simulated day advance: next completed lesson will increment streak!"
    elif payload.action == "miss_day":
        # Simulates user missed 2 days
        two_days_ago = (datetime.date.today() - datetime.timedelta(days=2)).isoformat()
        user.last_streak_date = two_days_ago
        message = "Simulated missed day: next lesson will check streak freeze or reset to 1."
    elif payload.action == "freeze":
        user.streak_freeze += 1
        message = "Added 1 Streak Freeze protection!"
    elif payload.action == "reset":
        user.streak = 0
        user.last_streak_date = None
        message = "Streak reset to 0."
    else:
        message = "No action performed."

    db.commit()
    return {
        "success": True,
        "streak": user.streak,
        "last_streak_date": user.last_streak_date,
        "streak_freeze": user.streak_freeze,
        "message": message
    }


@router.post("/reset-progress")
def reset_progress(user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Clear lesson progress
    db.query(UserLessonProgress).filter(UserLessonProgress.user_id == user.id).delete()
    db.query(UserSkillProgress).filter(UserSkillProgress.user_id == user.id).delete()

    # Re-unlock only skill 1
    sp1 = UserSkillProgress(
        user_id=user.id,
        skill_id=1,
        completed_lessons=0,
        is_unlocked=True,
        is_completed=False
    )
    db.add(sp1)

    user.hearts = 5
    user.xp = 50
    user.streak = 1
    user.gems = 400
    user.last_streak_date = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()

    db.commit()
    return {"success": True, "message": "Learner progress reset to beginning of Course!"}


@router.get("/quests")
def get_user_quests(user_id: int = 1, db: Session = Depends(get_db)):
    quests = db.query(Quest).filter(Quest.user_id == user_id).all()
    return quests


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
    if user:
        user.gems += quest.reward_gems

    db.commit()
    return {"success": True, "reward_gems": quest.reward_gems, "total_gems": user.gems}


@router.get("/achievements")
def get_achievements(db: Session = Depends(get_db)):
    achievements = db.query(Achievement).all()
    return achievements
