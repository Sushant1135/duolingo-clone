from typing import List, Optional, Any, Dict
from pydantic import BaseModel
from datetime import datetime


# User schemas
class UserBase(BaseModel):
    username: str
    name: str
    email: str
    avatar: str
    streak: int
    max_streak: int
    xp: int
    gems: int
    hearts: int
    max_hearts: int
    league: str
    streak_freeze: int
    active_course_id: int


class UserResponse(UserBase):
    id: int
    last_streak_date: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UpdateUserStats(BaseModel):
    xp: Optional[int] = None
    gems: Optional[int] = None
    hearts: Optional[int] = None
    streak: Optional[int] = None


class PurchaseRequest(BaseModel):
    item_id: str


class RefillHeartsRequest(BaseModel):
    method: str = "gems"  # "gems", "practice", "free"


class SimulateStreakRequest(BaseModel):
    action: str = "advance_day"  # "advance_day", "freeze", "reset"


# Exercise & Lesson schemas
class ExerciseResponse(BaseModel):
    id: int
    lesson_id: int
    order: int
    type: str  # multiple_choice, translate_words, match_pairs, fill_blank, type_answer
    prompt: str
    target_text: Optional[str] = None
    audio_text: Optional[str] = None
    question_data: Any
    solution_data: Any

    class Config:
        from_attributes = True


class LessonSummary(BaseModel):
    id: int
    skill_id: int
    order: int
    title: str
    xp_reward: int
    is_completed: bool = False
    is_current: bool = False
    is_locked: bool = False

    class Config:
        from_attributes = True


class LessonDetail(BaseModel):
    id: int
    skill_id: int
    order: int
    title: str
    xp_reward: int
    exercises: List[ExerciseResponse]

    class Config:
        from_attributes = True


class SkillResponse(BaseModel):
    id: int
    unit_id: int
    order: int
    title: str
    icon: str
    total_lessons: int
    completed_lessons: int = 0
    is_unlocked: bool = True
    is_completed: bool = False
    crown_level: int = 0
    lessons: List[LessonSummary] = []

    class Config:
        from_attributes = True


class UnitResponse(BaseModel):
    id: int
    course_id: int
    unit_number: int
    title: str
    subtitle: str
    guide_content: str
    color: str
    skills: List[SkillResponse] = []

    class Config:
        from_attributes = True


class CourseResponse(BaseModel):
    id: int
    title: str
    code: str
    flag: str
    description: str
    total_learners: int
    units: List[UnitResponse] = []

    class Config:
        from_attributes = True


# Submission schemas
class SubmitAnswerRequest(BaseModel):
    exercise_id: int
    user_answer: Any  # Could be string, list of strings, dict of matched pairs, etc.


class SubmitAnswerResponse(BaseModel):
    is_correct: bool
    correct_solution: Any
    explanation: Optional[str] = None
    hearts_remaining: int
    out_of_hearts: bool = False


class CompleteLessonRequest(BaseModel):
    mistakes_count: int = 0
    time_spent_seconds: int = 60


class CompleteLessonResponse(BaseModel):
    success: bool
    xp_earned: int
    total_xp: int
    streak: int
    gems_earned: int
    total_gems: int
    skill_completed: bool
    unlocked_next_skill: bool


# Leaderboard schemas
class LeaderboardEntry(BaseModel):
    id: int
    rank: int
    name: str
    username: str
    avatar: str
    xp: int
    is_current_user: bool = False


class LeaderboardResponse(BaseModel):
    league: str
    time_left: str
    top_3_promotion_zone: int = 3
    demotion_zone_start: int = 8
    entries: List[LeaderboardEntry]


# Quest & Achievement schemas
class QuestResponse(BaseModel):
    id: int
    title: str
    description: str
    icon: str
    current_progress: int
    target_progress: int
    reward_gems: int
    is_claimed: bool

    class Config:
        from_attributes = True


class AchievementResponse(BaseModel):
    id: int
    code: str
    title: str
    description: str
    icon: str
    tier: int
    max_tier: int
    progress: int
    goal: int

    class Config:
        from_attributes = True


# Shop
class ShopItem(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    cost: int
    cost_type: str  # "gems"
    purchased: bool
    can_afford: bool
