import json
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import (
    Lesson, Exercise, User, UserLessonProgress, UserSkillProgress,
    Skill, Unit, Achievement, UserDailyActivity
)
from app.models.schemas import (
    SubmitAnswerRequest, CompleteLessonRequest
)
from app.features.users.service import sync_daily_quests
from app.features.lessons.service import evaluate_answer

router = APIRouter(prefix="/api/lessons", tags=["lessons"])


@router.get("/{lesson_id}")
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    exercises_data = []
    for ex in sorted(lesson.exercises, key=lambda e: e.order):
        exercises_data.append({
            "id": ex.id,
            "lesson_id": ex.lesson_id,
            "order": ex.order,
            "type": ex.type,
            "prompt": ex.prompt,
            "target_text": ex.target_text,
            "audio_text": ex.audio_text,
            "question_data": json.loads(ex.question_data) if ex.question_data else {},
            # Keep solution info safe, or return for client checking
            "solution_data": json.loads(ex.solution_data) if ex.solution_data else {}
        })

    return {
        "id": lesson.id,
        "skill_id": lesson.skill_id,
        "skill_title": lesson.skill.title if lesson.skill else "Skill",
        "order": lesson.order,
        "title": lesson.title,
        "xp_reward": lesson.xp_reward,
        "exercises": exercises_data
    }


@router.post("/exercises/{exercise_id}/submit")
def submit_exercise_answer(
    exercise_id: int,
    payload: SubmitAnswerRequest,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    solution = json.loads(exercise.solution_data) if exercise.solution_data else {}
    evaluation = evaluate_answer(exercise.type, solution, payload.user_answer)

    # Heart logic
    out_of_hearts = False
    if not evaluation.is_correct:
        if user.hearts > 0:
            user.hearts -= 1
            user.hearts_updated_at = datetime.datetime.utcnow()
            db.commit()
        if user.hearts <= 0:
            out_of_hearts = True

    return {
        "is_correct": evaluation.is_correct,
        "correct_solution": evaluation.correct_solution,
        "explanation": evaluation.explanation,
        "hearts_remaining": user.hearts,
        "out_of_hearts": out_of_hearts
    }


@router.post("/{lesson_id}/complete")
def complete_lesson(
    lesson_id: int,
    payload: CompleteLessonRequest,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Record or update user lesson progress
    progress = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == user.id,
        UserLessonProgress.lesson_id == lesson.id
    ).first()
    was_already_completed = bool(progress and progress.completed)

    accuracy = max(0.0, 1.0 - (payload.mistakes_count * 0.1))

    if not progress:
        progress = UserLessonProgress(
            user_id=user.id,
            lesson_id=lesson.id,
            completed=True,
            score=accuracy,
            completed_at=datetime.datetime.utcnow()
        )
        db.add(progress)
    else:
        progress.completed = True
        progress.score = max(progress.score, accuracy)
        progress.completed_at = datetime.datetime.utcnow()

    # Award XP and Gems once per lesson completion to avoid refresh/double-submit duplication.
    xp_earned = 0 if was_already_completed else lesson.xp_reward + (5 if payload.mistakes_count == 0 else 0)
    gems_earned = 0 if was_already_completed else 10 if payload.mistakes_count == 0 else 5
    user.xp += xp_earned
    user.gems += gems_earned
    if not was_already_completed:
        activity_date = datetime.date.today().isoformat()
        activity = db.query(UserDailyActivity).filter_by(
            user_id=user.id,
            activity_date=activity_date,
        ).first()
        if activity is None:
            activity = UserDailyActivity(
                user_id=user.id,
                activity_date=activity_date,
                xp_earned=0,
                lessons_completed=0,
                high_score_lessons=0,
                learning_seconds=0,
            )
            db.add(activity)
        activity.xp_earned += xp_earned
        activity.lessons_completed += 1
        if accuracy >= 0.9:
            activity.high_score_lessons += 1
        activity.learning_seconds += max(0, payload.time_spent_seconds)

    # Daily Streak calculation
    today_str = datetime.date.today().isoformat()
    yesterday_str = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()

    if was_already_completed:
        pass
    elif user.last_streak_date == today_str:
        # Already extended today, maintain streak
        pass
    elif user.last_streak_date == yesterday_str:
        # Continued from yesterday!
        user.streak += 1
        user.last_streak_date = today_str
    elif not user.last_streak_date:
        user.streak = 1
        user.last_streak_date = today_str
    else:
        # Streak was broken unless user had streak freeze
        if user.streak_freeze > 0:
            user.streak_freeze -= 1
            user.streak += 1
            user.last_streak_date = today_str
        else:
            user.streak = 1
            user.last_streak_date = today_str

    if user.streak > user.max_streak:
        user.max_streak = user.streak

    # Update Skill Progress
    skill = lesson.skill
    skill_completed = False
    unlocked_next = False

    if skill:
        skill_lessons = db.query(Lesson).filter(Lesson.skill_id == skill.id).all()
        completed_lessons = db.query(UserLessonProgress).filter(
            UserLessonProgress.user_id == user.id,
            UserLessonProgress.lesson_id.in_([l.id for l in skill_lessons]),
            UserLessonProgress.completed == True
        ).all()

        user_sp = db.query(UserSkillProgress).filter(
            UserSkillProgress.user_id == user.id,
            UserSkillProgress.skill_id == skill.id
        ).first()

        if not user_sp:
            user_sp = UserSkillProgress(
                user_id=user.id,
                skill_id=skill.id,
                completed_lessons=len(completed_lessons),
                is_unlocked=True,
                is_completed=False
            )
            db.add(user_sp)
        else:
            user_sp.completed_lessons = len(completed_lessons)

        if len(completed_lessons) >= len(skill_lessons):
            user_sp.is_completed = True
            skill_completed = True

            # Unlock next skill in unit or next unit
            next_skill = db.query(Skill).filter(
                Skill.unit_id == skill.unit_id,
                Skill.order == skill.order + 1
            ).first()

            if not next_skill:
                # First skill in the next unit by course path order.
                current_unit = skill.unit
                if current_unit:
                    next_unit = db.query(Unit).filter(
                        Unit.course_id == current_unit.course_id,
                        Unit.unit_number == current_unit.unit_number + 1
                    ).first()
                    if next_unit:
                        next_skill = db.query(Skill).filter(
                            Skill.unit_id == next_unit.id
                        ).order_by(Skill.order.asc()).first()

            if next_skill:
                next_sp = db.query(UserSkillProgress).filter(
                    UserSkillProgress.user_id == user.id,
                    UserSkillProgress.skill_id == next_skill.id
                ).first()
                if not next_sp:
                    next_sp = UserSkillProgress(
                        user_id=user.id,
                        skill_id=next_skill.id,
                        completed_lessons=0,
                        is_unlocked=True,
                        is_completed=False
                    )
                    db.add(next_sp)
                else:
                    next_sp.is_unlocked = True
                unlocked_next = True

    # Update quest progress from actual lesson activity for today.
    sync_daily_quests(user.id, db)

    # Update Achievements
    wildfire = db.query(Achievement).filter(Achievement.code == "wildfire").first()
    if wildfire:
        wildfire.progress = user.streak
    sage = db.query(Achievement).filter(Achievement.code == "sage").first()
    if sage:
        sage.progress = user.xp

    db.commit()

    return {
        "success": True,
        "xp_earned": xp_earned,
        "total_xp": user.xp,
        "streak": user.streak,
        "gems_earned": gems_earned,
        "total_gems": user.gems,
        "skill_completed": skill_completed,
        "unlocked_next_skill": unlocked_next
    }
