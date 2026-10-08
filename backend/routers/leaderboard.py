from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import LeaderboardUser, User
from schemas import LeaderboardResponse, LeaderboardEntry

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


@router.get("", response_model=LeaderboardResponse)
def get_leaderboard(user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    league = user.league if user else "Silver"

    # Synchronize current user XP in leaderboard table
    current_in_lb = db.query(LeaderboardUser).filter(LeaderboardUser.is_current_user == True).first()
    if current_in_lb and user:
        current_in_lb.xp = user.xp
        current_in_lb.name = user.name
        current_in_lb.avatar = user.avatar
        current_in_lb.league = user.league
        db.commit()

    # Query all users in this league
    users = db.query(LeaderboardUser).filter(LeaderboardUser.league == league).order_by(LeaderboardUser.xp.desc()).all()

    entries = []
    for rank, u in enumerate(users, start=1):
        entries.append(LeaderboardEntry(
            id=u.id,
            rank=rank,
            name=u.name,
            username=u.username,
            avatar=u.avatar,
            xp=u.xp,
            is_current_user=u.is_current_user
        ))

    return LeaderboardResponse(
        league=league,
        time_left="2 days left",
        top_3_promotion_zone=3,
        demotion_zone_start=8,
        entries=entries
    )
