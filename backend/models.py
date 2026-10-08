import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    avatar = Column(String(255), default="🦉")
    streak = Column(Integer, default=3)
    max_streak = Column(Integer, default=5)
    last_streak_date = Column(String(20), default=None)
    xp = Column(Integer, default=420)
    gems = Column(Integer, default=350)
    hearts = Column(Integer, default=5)
    max_hearts = Column(Integer, default=5)
    hearts_updated_at = Column(DateTime, default=datetime.datetime.utcnow)
    streak_freeze = Column(Integer, default=1)
    active_course_id = Column(Integer, default=1)
    league = Column(String(50), default="Bronze")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    lesson_progress = relationship("UserLessonProgress", back_populates="user", cascade="all, delete-orphan")
    skill_progress = relationship("UserSkillProgress", back_populates="user", cascade="all, delete-orphan")
    quests = relationship("Quest", back_populates="user", cascade="all, delete-orphan")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    code = Column(String(10), nullable=False)
    flag = Column(String(20), default="🇪🇸")
    description = Column(String(255), default="Learn Spanish from scratch")
    total_learners = Column(Integer, default=24500000)

    units = relationship("Unit", back_populates="course", cascade="all, delete-orphan")


class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    unit_number = Column(Integer, nullable=False)
    title = Column(String(150), nullable=False)
    subtitle = Column(String(255), nullable=False)
    guide_content = Column(Text, default="")
    color = Column(String(30), default="#58cc02")

    course = relationship("Course", back_populates="units")
    skills = relationship("Skill", back_populates="unit", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    order = Column(Integer, nullable=False)
    title = Column(String(100), nullable=False)
    icon = Column(String(50), default="star")
    total_lessons = Column(Integer, default=3)

    unit = relationship("Unit", back_populates="skills")
    lessons = relationship("Lesson", back_populates="skill", cascade="all, delete-orphan")
    user_skill_progress = relationship("UserSkillProgress", back_populates="skill", cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    order = Column(Integer, nullable=False)
    title = Column(String(100), nullable=False)
    xp_reward = Column(Integer, default=15)

    skill = relationship("Skill", back_populates="lessons")
    exercises = relationship("Exercise", back_populates="lesson", cascade="all, delete-orphan")
    user_lesson_progress = relationship("UserLessonProgress", back_populates="lesson", cascade="all, delete-orphan")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    order = Column(Integer, nullable=False)
    type = Column(String(50), nullable=False)  # multiple_choice, translate_words, match_pairs, fill_blank, type_answer
    prompt = Column(String(255), nullable=False)
    target_text = Column(String(255), nullable=True)
    audio_text = Column(String(255), nullable=True)
    question_data = Column(Text, nullable=False)  # JSON with options, tokens, pairs, etc.
    solution_data = Column(Text, nullable=False)  # JSON with expected answers, explanation

    lesson = relationship("Lesson", back_populates="exercises")


class UserLessonProgress(Base):
    __tablename__ = "user_lesson_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    completed = Column(Boolean, default=False)
    score = Column(Float, default=1.0)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="lesson_progress")
    lesson = relationship("Lesson", back_populates="user_lesson_progress")


class UserSkillProgress(Base):
    __tablename__ = "user_skill_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    completed_lessons = Column(Integer, default=0)
    is_unlocked = Column(Boolean, default=False)
    is_completed = Column(Boolean, default=False)

    user = relationship("User", back_populates="skill_progress")
    skill = relationship("Skill", back_populates="user_skill_progress")


class LeaderboardUser(Base):
    __tablename__ = "leaderboard_users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    username = Column(String(50), nullable=False)
    avatar = Column(String(255), default="👤")
    league = Column(String(50), default="Bronze")
    xp = Column(Integer, default=0)
    is_current_user = Column(Boolean, default=False)


class Quest(Base):
    __tablename__ = "quests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(String(255), nullable=False)
    icon = Column(String(50), default="lightning")
    current_progress = Column(Integer, default=0)
    target_progress = Column(Integer, default=50)
    reward_gems = Column(Integer, default=20)
    is_claimed = Column(Boolean, default=False)

    user = relationship("User", back_populates="quests")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    icon = Column(String(50), default="trophy")
    tier = Column(Integer, default=1)
    max_tier = Column(Integer, default=5)
    progress = Column(Integer, default=3)
    goal = Column(Integer, default=7)
