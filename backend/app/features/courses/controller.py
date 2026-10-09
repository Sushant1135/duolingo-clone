import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.entities import Course, Unit, Skill, Lesson, User, UserSkillProgress, UserLessonProgress
from app.models.schemas import CourseResponse, UnitResponse, SkillResponse, LessonSummary

router = APIRouter(prefix="/api/courses", tags=["courses"])


@router.get("", response_model=List[Dict[str, Any]])
def get_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    return [
        {
            "id": c.id,
            "title": c.title,
            "code": c.code,
            "flag": c.flag,
            "description": c.description,
            "total_learners": c.total_learners
        }
        for c in courses
    ]


@router.get("/{course_id}/tree")
def get_course_learning_tree(course_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch user skill and lesson progress
    skill_progress_records = db.query(UserSkillProgress).filter(UserSkillProgress.user_id == user_id).all()
    skill_progress_map = {sp.skill_id: sp for sp in skill_progress_records}

    lesson_progress_records = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == user_id,
        UserLessonProgress.completed == True
    ).all()
    completed_lesson_ids = {lp.lesson_id for lp in lesson_progress_records}

    units_data = []
    first_incomplete_skill_found = False
    prior_skill_completed = True

    for unit in sorted(course.units, key=lambda u: u.unit_number):
        skills_data = []
        for skill in sorted(unit.skills, key=lambda s: s.order):
            sp = skill_progress_map.get(skill.id)
            completed_lessons_count = sum(1 for l in skill.lessons if l.id in completed_lesson_ids)
            total_lessons = len(skill.lessons) if skill.lessons else skill.total_lessons
            is_completed = completed_lessons_count >= total_lessons

            # Determine lock state from both stored unlocks and the canonical path order.
            # This keeps the path consistent even if progress rows are reset or reseeded.
            is_unlocked = skill.id == 1 or prior_skill_completed or bool(sp and sp.is_unlocked)

            # Crown level calculation (0 to 5)
            crown_level = 1 if is_completed else 0

            # Is current active node on the learning path?
            is_current = False
            if is_unlocked and not is_completed and not first_incomplete_skill_found:
                is_current = True
                first_incomplete_skill_found = True

            # Lessons list
            lessons_data = []
            prior_lesson_completed = True
            for l_idx, lesson in enumerate(sorted(skill.lessons, key=lambda l: l.order)):
                l_completed = lesson.id in completed_lesson_ids
                l_locked = not is_unlocked or (l_idx > 0 and not prior_lesson_completed)
                l_current = is_unlocked and not l_completed and prior_lesson_completed

                lessons_data.append({
                    "id": lesson.id,
                    "skill_id": skill.id,
                    "order": lesson.order,
                    "title": lesson.title,
                    "xp_reward": lesson.xp_reward,
                    "is_completed": l_completed,
                    "is_current": l_current,
                    "is_locked": l_locked
                })
                prior_lesson_completed = l_completed

            skills_data.append({
                "id": skill.id,
                "unit_id": unit.id,
                "order": skill.order,
                "title": skill.title,
                "icon": skill.icon,
                "total_lessons": total_lessons,
                "completed_lessons": completed_lessons_count,
                "is_unlocked": is_unlocked,
                "is_completed": is_completed,
                "is_current": is_current,
                "crown_level": crown_level,
                "lessons": lessons_data
            })
            prior_skill_completed = is_completed

        units_data.append({
            "id": unit.id,
            "course_id": unit.course_id,
            "unit_number": unit.unit_number,
            "title": unit.title,
            "subtitle": unit.subtitle,
            "guide_content": unit.guide_content,
            "color": unit.color,
            "skills": skills_data
        })

    # If all unlocked skills are complete, set the current one to the latest completed
    if not first_incomplete_skill_found and units_data and units_data[0]["skills"]:
        units_data[0]["skills"][0]["is_current"] = True

    return {
        "course": {
            "id": course.id,
            "title": course.title,
            "code": course.code,
            "flag": course.flag,
            "description": course.description
        },
        "units": units_data
    }


@router.get("/units/{unit_id}/guidebook")
def get_unit_guidebook(unit_id: int, db: Session = Depends(get_db)):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    return {
        "unit_id": unit.id,
        "unit_number": unit.unit_number,
        "title": unit.title,
        "subtitle": unit.subtitle,
        "color": unit.color,
        "content": unit.guide_content
    }
