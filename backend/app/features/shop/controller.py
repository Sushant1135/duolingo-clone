from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import User
from app.models.schemas import PurchaseRequest
from app.features.shop.service import get_shop_items as build_shop_items
from app.features.shop.service import purchase_item as process_purchase

router = APIRouter(prefix="/api/shop", tags=["shop"])


@router.get("")
def get_shop_items(user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    return build_shop_items(user)


@router.post("/purchase")
def purchase_item(payload: PurchaseRequest, user_id: int = 1, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        return process_purchase(user, payload.item_id, db)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
