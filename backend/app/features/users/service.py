import datetime

from sqlalchemy.orm import Session

from app.models.entities import (
    MonthlyQuest,
    Quest,
    User,
    UserDailyActivity,
    UserLessonProgress,
    UserSkillProgress,
)
from app.models.schemas import UpdateUserStats


def update_user_stats(user: User, payload: UpdateUserStats, db: Session) -> User:
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


def refill_hearts(user: User, method: str, db: Session) -> dict:
    if method == "gems":
        cost = 350
        if user.gems < cost:
            raise ValueError("Not enough gems! Practice to earn hearts or get gems.")
        user.gems -= cost
        user.hearts = user.max_hearts
        user.hearts_updated_at = datetime.datetime.utcnow()
    elif method in ["practice", "free"]:
        user.hearts = min(
            user.max_hearts,
            user.hearts + 1 if method == "practice" else user.max_hearts,
        )
        user.hearts_updated_at = datetime.datetime.utcnow()

    db.commit()
    return {
        "success": True,
        "hearts": user.hearts,
        "max_hearts": user.max_hearts,
        "gems": user.gems,
        "message": "Hearts successfully replenished!",
    }


def simulate_streak(user: User, action: str, db: Session) -> dict:
    if action == "advance_day":
        yesterday = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
        user.last_streak_date = yesterday
        message = "Simulated day advance: next completed lesson will increment streak!"
    elif action == "miss_day":
        two_days_ago = (datetime.date.today() - datetime.timedelta(days=2)).isoformat()
        user.last_streak_date = two_days_ago
        message = "Simulated missed day: next lesson will check streak freeze or reset to 1."
    elif action == "freeze":
        user.streak_freeze += 1
        message = "Added 1 Streak Freeze protection!"
    elif action == "reset":
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
        "message": message,
    }


def reset_progress(user: User, db: Session) -> None:
    db.query(UserLessonProgress).filter(UserLessonProgress.user_id == user.id).delete()
    db.query(UserSkillProgress).filter(UserSkillProgress.user_id == user.id).delete()
    db.add(
        UserSkillProgress(
            user_id=user.id,
            skill_id=1,
            completed_lessons=0,
            is_unlocked=True,
            is_completed=False,
        )
    )
    user.hearts = 5
    user.xp = 120
    user.streak = 4
    user.gems = 250
    user.league = "Bronze"
    user.streak_freeze = 1
    user.last_streak_date = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
    db.commit()


def sync_daily_quests(user_id: int, db: Session):
    today = datetime.date.today()
    activity = db.query(UserDailyActivity).filter_by(
        user_id=user_id,
        activity_date=today.isoformat(),
    ).first()
    monthly = get_or_create_monthly_quest(user_id, today, db)
    quests = db.query(Quest).filter(Quest.user_id == user_id).all()
    for quest in quests:
        quest_key = quest.quest_key or infer_quest_key(quest.title)
        quest.quest_key = quest_key
        if quest.period_start != today.isoformat():
            quest.period_start = today.isoformat()
            quest.current_progress = 0
            quest.is_claimed = False
            quest.completed_at = None

        if activity:
            progress_by_key = {
                "xp": activity.xp_earned,
                "lessons": activity.lessons_completed,
                "accuracy": activity.high_score_lessons,
                "minutes": activity.learning_seconds // 60,
            }
            quest.current_progress = min(
                quest.target_progress,
                progress_by_key.get(quest_key, quest.current_progress),
            )

        if quest.current_progress >= quest.target_progress and quest.completed_at is None:
            quest.completed_at = datetime.datetime.utcnow()
            monthly.completed_count += 1
            if monthly.completed_count >= monthly.goal and not monthly.completed:
                monthly.completed = True
                monthly.completed_at = datetime.datetime.utcnow()
    db.commit()
    return quests


def infer_quest_key(title: str) -> str:
    lowered = title.lower()
    if "xp" in lowered:
        return "xp"
    if "lesson" in lowered:
        return "lessons"
    if "minute" in lowered or "time" in lowered:
        return "minutes"
    return "accuracy"


def get_or_create_monthly_quest(user_id: int, today: datetime.date, db: Session) -> MonthlyQuest:
    monthly = db.query(MonthlyQuest).filter_by(
        user_id=user_id,
        year=today.year,
        month=today.month,
    ).first()
    if monthly is None:
        monthly = MonthlyQuest(
            user_id=user_id,
            year=today.year,
            month=today.month,
            goal=30,
            completed_count=0,
            badge_name=f"{today.strftime('%B')} Explorer",
            reward_gems=100,
        )
        db.add(monthly)
        db.flush()
    return monthly


def monthly_quest_response(user_id: int, today: datetime.date, db: Session) -> dict:
    monthly = get_or_create_monthly_quest(user_id, today, db)
    next_month = datetime.date(today.year + (today.month == 12), today.month % 12 + 1, 1)
    last_day = next_month - datetime.timedelta(days=1)
    if monthly.completed_count >= monthly.goal and not monthly.completed:
        monthly.completed = True
        monthly.completed_at = datetime.datetime.utcnow()
    return {
        "year": monthly.year,
        "month": monthly.month,
        "month_name": today.strftime("%B"),
        "title": f"{today.strftime('%B')} Quest",
        "goal": monthly.goal,
        "completed_count": monthly.completed_count,
        "completed": monthly.completed,
        "reward_claimed": monthly.reward_claimed,
        "reward_gems": monthly.reward_gems,
        "badge_name": monthly.badge_name,
        "days_remaining": max(0, (last_day - today).days),
    }


def update_passive_hearts(user: User, db: Session):
    if user.hearts < user.max_hearts and user.hearts_updated_at:
        now = datetime.datetime.utcnow()
        elapsed_seconds = (now - user.hearts_updated_at).total_seconds()
        hearts_to_add = int(elapsed_seconds // 1800)
        if hearts_to_add > 0:
            user.hearts = min(user.max_hearts, user.hearts + hearts_to_add)
            user.hearts_updated_at = now
            db.commit()
