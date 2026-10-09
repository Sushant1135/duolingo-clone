import datetime

from sqlalchemy.orm import Session

from app.models.entities import User


SHOP_ITEMS = (
    {
        "id": "refill_hearts",
        "title": "Refill Hearts",
        "description": "Full refill so you can keep practicing without stopping.",
        "icon": "❤️",
        "cost": 350,
        "cost_type": "gems",
        "badge": "Popular",
        "category": "Hearts",
    },
    {
        "id": "streak_freeze",
        "title": "Streak Freeze",
        "description": "Allows your streak to remain in place for one full day of inactivity.",
        "icon": "🧊",
        "cost": 200,
        "cost_type": "gems",
        "category": "Power-ups",
    },
    {
        "id": "double_or_nothing",
        "title": "Double or Nothing",
        "description": "Wager 50 gems to double them by maintaining a 7-day streak.",
        "icon": "💎",
        "cost": 50,
        "cost_type": "gems",
        "badge": "Wager",
        "category": "Power-ups",
    },
    {
        "id": "super_duo",
        "title": "Champ Duo Avatar",
        "description": "Exclusive gold-gilded owl avatar icon for high achievers.",
        "icon": "👑",
        "cost": 450,
        "cost_type": "gems",
        "badge": "Cosmetic",
        "category": "Outfits",
    },
)

PURCHASE_MESSAGES = {
    "refill_hearts": "Hearts fully restored!",
    "streak_freeze": "Streak freeze equipped!",
    "double_or_nothing": "Wager placed! Keep your streak for 7 days to win 100 gems.",
    "super_duo": "Super Duo Avatar unlocked and equipped!",
}


def get_shop_items(user: User | None) -> list[dict]:
    gems = user.gems if user else 0
    return [
        {
            **item,
            "can_afford": gems >= item["cost"],
            "badge": (
                f"Equipped: {user.streak_freeze if user else 0}"
                if item["id"] == "streak_freeze"
                else item.get("badge")
            ),
        }
        for item in SHOP_ITEMS
    ]


def purchase_item(user: User, item_id: str, db: Session) -> dict:
    item = next((candidate for candidate in SHOP_ITEMS if candidate["id"] == item_id), None)
    if item is None:
        raise ValueError("Unknown shop item")
    if user.gems < item["cost"]:
        raise ValueError("Not enough gems!")

    user.gems -= item["cost"]
    if item_id == "refill_hearts":
        user.hearts = user.max_hearts
        user.hearts_updated_at = datetime.datetime.utcnow()
    elif item_id == "streak_freeze":
        user.streak_freeze += 1
    elif item_id == "super_duo":
        user.avatar = "👑"

    db.commit()
    return {
        "success": True,
        "message": PURCHASE_MESSAGES[item_id],
        "gems": user.gems,
        "hearts": user.hearts,
        "streak_freeze": user.streak_freeze,
        "avatar": user.avatar,
    }
