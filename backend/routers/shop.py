from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from pydantic import BaseModel
import datetime

router = APIRouter(prefix="/api/shop", tags=["shop"])


class PurchaseRequest(BaseModel):
    item_id: str


@router.get("")
def get_shop_items(user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    gems = user.gems if user else 0

    items = [
        {
            "id": "refill_hearts",
            "title": "Refill Hearts",
            "description": "Full refill so you can keep practicing without stopping.",
            "icon": "❤️",
            "cost": 350,
            "cost_type": "gems",
            "can_afford": gems >= 350,
            "badge": "Popular",
            "category": "Hearts"
        },
        {
            "id": "streak_freeze",
            "title": "Streak Freeze",
            "description": "Allows your streak to remain in place for one full day of inactivity.",
            "icon": "🧊",
            "cost": 200,
            "cost_type": "gems",
            "can_afford": gems >= 200,
            "badge": f"Equipped: {user.streak_freeze if user else 0}",
            "category": "Power-ups"
        },
        {
            "id": "double_or_nothing",
            "title": "Double or Nothing",
            "description": "Wager 50 gems to double them by maintaining a 7-day streak.",
            "icon": "💎",
            "cost": 50,
            "cost_type": "gems",
            "can_afford": gems >= 50,
            "badge": "Wager",
            "category": "Power-ups"
        },
        {
            "id": "super_duo",
            "title": "Champ Duo Avatar",
            "description": "Exclusive gold-gilded owl avatar icon for high achievers.",
            "icon": "👑",
            "cost": 450,
            "cost_type": "gems",
            "can_afford": gems >= 450,
            "badge": "Cosmetic",
            "category": "Outfits"
        }
    ]
    return items


@router.post("/purchase")
def purchase_item(payload: PurchaseRequest, user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    item_id = payload.item_id

    if item_id == "refill_hearts":
        cost = 350
        if user.gems < cost:
            raise HTTPException(status_code=400, detail="Not enough gems!")
        user.gems -= cost
        user.hearts = user.max_hearts
        user.hearts_updated_at = datetime.datetime.utcnow()
        message = "Hearts fully restored!"

    elif item_id == "streak_freeze":
        cost = 200
        if user.gems < cost:
            raise HTTPException(status_code=400, detail="Not enough gems!")
        user.gems -= cost
        user.streak_freeze += 1
        message = "Streak freeze equipped!"

    elif item_id == "double_or_nothing":
        cost = 50
        if user.gems < cost:
            raise HTTPException(status_code=400, detail="Not enough gems!")
        user.gems -= cost
        message = "Wager placed! Keep your streak for 7 days to win 100 gems."

    elif item_id == "super_duo":
        cost = 450
        if user.gems < cost:
            raise HTTPException(status_code=400, detail="Not enough gems!")
        user.gems -= cost
        user.avatar = "👑"
        message = "Super Duo Avatar unlocked and equipped!"

    else:
        raise HTTPException(status_code=400, detail="Unknown shop item")

    db.commit()
    return {
        "success": True,
        "message": message,
        "gems": user.gems,
        "hearts": user.hearts,
        "streak_freeze": user.streak_freeze,
        "avatar": user.avatar
    }
