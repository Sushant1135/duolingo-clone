from fastapi import APIRouter

from app.features.courses.controller import router as courses_router
from app.features.leaderboards.controller import router as leaderboard_router
from app.features.lessons.controller import router as lessons_router
from app.features.shop.controller import router as shop_router
from app.features.users.controller import router as users_router

api_router = APIRouter()
api_router.include_router(courses_router)
api_router.include_router(lessons_router)
api_router.include_router(users_router)
api_router.include_router(leaderboard_router)
api_router.include_router(shop_router)
