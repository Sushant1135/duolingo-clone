import datetime
from sqlalchemy import inspect, text

from sqlalchemy.orm import Session

from app.features.courses.service import migrate_german_course
from app.models.entities import (
    Achievement,
    LeaderboardUser,
    Quest,
    User,
    UserLessonProgress,
    UserSkillProgress,
)


DEMO_LEARNER = {
    "username": "learner_alex",
    "email": "alex@duolingo.demo",
    "name": "Alex",
    "avatar": "A",
    "streak": 4,
    "max_streak": 7,
    "xp": 120,
    "gems": 250,
    "hearts": 5,
    "max_hearts": 5,
    "streak_freeze": 1,
    "league": "Bronze",
}

DEMO_LEADERBOARD = [
    ("Sofia", "sofia_demo", "S", 180, False),
    ("Mateo", "mateo_demo", "M", 155, False),
    ("Alex", "learner_alex", "A", 120, True),
    ("Emma", "emma_demo", "E", 95, False),
    ("Liam", "liam_demo", "L", 80, False),
    ("Noah", "noah_demo", "N", 70, False),
    ("Maya", "maya_demo", "M", 62, False),
    ("Owen", "owen_demo", "O", 54, False),
    ("Nina", "nina_demo", "N", 46, False),
    ("Leo", "leo_demo", "L", 38, False),
]


def migrate_demo_account(db: Session):
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        return

    for field, value in DEMO_LEARNER.items():
        setattr(user, field, value)
    user.active_course_id = 1
    if not user.last_streak_date:
        user.last_streak_date = datetime.date.today().isoformat()

    db.query(LeaderboardUser).delete()
    db.add_all([
        LeaderboardUser(
            name=name,
            username=username,
            avatar=avatar,
            league=DEMO_LEARNER["league"],
            xp=xp,
            is_current_user=is_current_user,
        )
        for name, username, avatar, xp, is_current_user in DEMO_LEADERBOARD
    ])

    sage = db.query(Achievement).filter(Achievement.code == "sage").first()
    if sage:
        sage.progress = DEMO_LEARNER["xp"]
        sage.goal = 500

    db.commit()


def seed_database(db: Session):
    ensure_quest_schema(db)
    existing_user = db.query(User).filter(User.id == 1).first()
    if not existing_user:
        db.add(User(
            id=1,
            username="learner_alex",
            email="alex@duolingo.demo",
            name=DEMO_LEARNER["name"],
            avatar=DEMO_LEARNER["avatar"],
            streak=DEMO_LEARNER["streak"],
            max_streak=DEMO_LEARNER["max_streak"],
            last_streak_date=datetime.date.today().isoformat(),
            xp=DEMO_LEARNER["xp"],
            gems=DEMO_LEARNER["gems"],
            hearts=DEMO_LEARNER["hearts"],
            max_hearts=DEMO_LEARNER["max_hearts"],
            hearts_updated_at=datetime.datetime.utcnow(),
            streak_freeze=DEMO_LEARNER["streak_freeze"],
            active_course_id=1,
            league=DEMO_LEARNER["league"],
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=14),
        ))
        db.commit()

    migrate_german_course(db)
    migrate_demo_account(db)

    if not db.query(UserLessonProgress).filter(UserLessonProgress.user_id == 1).first():
        db.add(UserLessonProgress(
            user_id=1,
            lesson_id=1,
            completed=True,
            score=1.0,
            completed_at=datetime.datetime.utcnow() - datetime.timedelta(days=1),
        ))
        db.add(UserSkillProgress(
            user_id=1,
            skill_id=1,
            completed_lessons=1,
            is_unlocked=True,
            is_completed=False,
        ))
        db.add(UserSkillProgress(
            user_id=1,
            skill_id=2,
            completed_lessons=0,
            is_unlocked=False,
            is_completed=False,
        ))
        db.add(UserSkillProgress(
            user_id=1,
            skill_id=3,
            completed_lessons=0,
            is_unlocked=False,
            is_completed=False,
        ))
        db.commit()

    if not db.query(LeaderboardUser).first():
        db.add_all([
            LeaderboardUser(
                name=name,
                username=username,
                avatar=avatar,
                league=DEMO_LEARNER["league"],
                xp=xp,
                is_current_user=is_current_user,
            )
            for name, username, avatar, xp, is_current_user in DEMO_LEADERBOARD
        ])
        db.commit()

    ensure_daily_quests(db, 1)

    if not db.query(Achievement).first():
        db.add_all([
            Achievement(
                code="wildfire",
                title="Wildfire",
                description="Reach a 7 day streak",
                icon="flame",
                tier=1,
                max_tier=5,
                progress=4,
                goal=7,
            ),
            Achievement(
                code="sage",
                title="Sage",
                description="Earn 500 XP in total",
                icon="sparkles",
                tier=1,
                max_tier=5,
                progress=DEMO_LEARNER["xp"],
                goal=500,
            ),
            Achievement(
                code="champion",
                title="Champion",
                description="Advance to the Gold League",
                icon="trophy",
                tier=1,
                max_tier=3,
                progress=2,
                goal=3,
            ),
            Achievement(
                code="scholar",
                title="Scholar",
                description="Learn 50 new words",
                icon="book-open",
                tier=1,
                max_tier=5,
                progress=24,
                goal=50,
            ),
        ])
        db.commit()


def ensure_quest_schema(db: Session):
    """Add quest tracking columns when upgrading an existing SQLite database."""
    if db.bind is None or db.bind.dialect.name != "sqlite":
        return
    columns = {column["name"] for column in inspect(db.bind).get_columns("quests")}
    additions = {
        "quest_key": "VARCHAR(50)",
        "period_start": "VARCHAR(10)",
        "completed_at": "DATETIME",
    }
    for name, column_type in additions.items():
        if name not in columns:
            db.execute(text(f"ALTER TABLE quests ADD COLUMN {name} {column_type}"))
    db.commit()


def ensure_daily_quests(db: Session, user_id: int):
    today = datetime.date.today().isoformat()
    definitions = [
        ("xp", "Earn 50 XP today", "Complete lessons to gain XP", "lightning", 50, 20),
        ("lessons", "Complete 3 lessons", "Advance through your learning path", "book", 3, 30),
        ("accuracy", "Get 90%+ on 2 lessons", "Finish lessons accurately", "target", 2, 25),
    ]
    existing = db.query(Quest).filter(Quest.user_id == user_id).all()
    by_key = {
        quest.quest_key or (
            "xp" if "xp" in quest.title.lower()
            else "lessons" if "lesson" in quest.title.lower()
            else "accuracy"
        ): quest
        for quest in existing
    }

    for key, title, description, icon, target, reward in definitions:
        quest = by_key.get(key)
        if quest is None:
            db.add(Quest(
                user_id=user_id,
                title=title,
                description=description,
                icon=icon,
                current_progress=0,
                target_progress=target,
                reward_gems=reward,
                quest_key=key,
                period_start=today,
            ))
            continue
        if quest.quest_key is None:
            quest.quest_key = key
            quest.current_progress = 0
            quest.is_claimed = False
            quest.completed_at = None
            quest.period_start = today
        quest.title = title
        quest.description = description
        quest.icon = icon
        quest.target_progress = target
        quest.reward_gems = reward
    db.commit()
