import json
import re
import datetime
import unicodedata
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import (
    Lesson, Exercise, User, UserLessonProgress, UserSkillProgress,
    Skill, Quest, Achievement
)
from schemas import (
    LessonDetail, ExerciseResponse, SubmitAnswerRequest, SubmitAnswerResponse,
    CompleteLessonRequest, CompleteLessonResponse
)

router = APIRouter(prefix="/api/lessons", tags=["lessons"])


def normalize_text(text: str) -> str:
    """Normalizes text for fuzzy match: strips punctuation, lowercase, normalizes accents."""
    if not text:
        return ""
    text = text.strip().lower()
    # Remove punctuation
    text = re.sub(r'[¿?¡!.,;:\"\'()\[\]{}]', '', text)
    # Remove extra spaces
    text = " ".join(text.split())
    return text


def remove_accents(text: str) -> str:
    """Removes diacritics / accents for lenient spelling comparison."""
    return ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    )


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
    user_ans = payload.user_answer

    is_correct = False
    correct_solution = None
    explanation = solution.get("explanation", "")

    # Evaluation based on exercise type
    if exercise.type == "multiple_choice":
        # Can match option id or option text
        correct_opt_id = solution.get("correct_option_id")
        correct_text = solution.get("correct_text")
        correct_solution = correct_text or correct_opt_id
        if str(user_ans).strip().lower() == str(correct_opt_id).strip().lower() or \
           str(user_ans).strip().lower() == str(correct_text).strip().lower():
            is_correct = True

    elif exercise.type == "translate_words":
        # Expecting list of tokens
        correct_tokens = solution.get("correct_tokens", [])
        correct_solution = " ".join(correct_tokens)
        if isinstance(user_ans, list):
            user_tokens = [str(t).strip() for t in user_ans]
            if user_tokens == correct_tokens:
                is_correct = True
            elif " ".join(user_tokens).lower() == " ".join(correct_tokens).lower():
                is_correct = True
        elif isinstance(user_ans, str):
            if normalize_text(user_ans) == normalize_text(" ".join(correct_tokens)):
                is_correct = True

    elif exercise.type == "match_pairs":
        # Expecting dict or list of pairs
        pair_dict = solution.get("pairs", {})
        correct_solution = "All pairs correctly matched"
        # User answer could be dict {left: right} or boolean indicating completed all pairs
        if isinstance(user_ans, dict):
            matched_all = True
            for k, v in pair_dict.items():
                if str(user_ans.get(k, "")).strip().lower() != str(v).strip().lower():
                    matched_all = False
                    break
            is_correct = matched_all
        elif user_ans is True or user_ans == "completed":
            is_correct = True

    elif exercise.type == "fill_blank":
        correct_word = solution.get("correct_word", "")
        correct_solution = correct_word
        if normalize_text(str(user_ans)) == normalize_text(correct_word):
            is_correct = True

    elif exercise.type == "type_answer":
        acceptable = solution.get("acceptable_answers", [])
        primary = solution.get("primary_answer", "")
        correct_solution = primary or (acceptable[0] if acceptable else "")

        norm_user = normalize_text(str(user_ans))
        clean_user = remove_accents(norm_user)

        for ans in acceptable:
            norm_ans = normalize_text(ans)
            clean_ans = remove_accents(norm_ans)
            if norm_user == norm_ans or clean_user == clean_ans:
                is_correct = True
                break

    # Heart logic
    out_of_hearts = False
    if not is_correct:
        if user.hearts > 0:
            user.hearts -= 1
            user.hearts_updated_at = datetime.datetime.utcnow()
            db.commit()
        if user.hearts <= 0:
            out_of_hearts = True

    return {
        "is_correct": is_correct,
        "correct_solution": correct_solution,
        "explanation": explanation,
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

    # Award XP and Gems
    xp_earned = lesson.xp_reward + (5 if payload.mistakes_count == 0 else 0)
    gems_earned = 10 if payload.mistakes_count == 0 else 5
    user.xp += xp_earned
    user.gems += gems_earned

    # Daily Streak calculation
    today_str = datetime.date.today().isoformat()
    yesterday_str = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()

    if user.last_streak_date == today_str:
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
                # Next unit's first skill
                next_unit = db.query(Lesson).filter(Lesson.skill_id > skill.id).first()
                if next_unit:
                    next_skill = next_unit.skill

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

    # Update Quests progress
    quests = db.query(Quest).filter(Quest.user_id == user.id).all()
    for q in quests:
        if "XP" in q.title:
            q.current_progress = min(q.target_progress, q.current_progress + xp_earned)
        elif "lesson" in q.title.lower():
            q.current_progress = min(q.target_progress, q.current_progress + 1)
        elif "90%" in q.title and accuracy >= 0.9:
            q.current_progress = min(q.target_progress, q.current_progress + 1)

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
