from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas, auth
from app.database import get_db

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("/", response_model=list[schemas.NotificationResponse])
def get_notifications(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.created_at.desc()).limit(50).all()

@router.get("/unread-count")
def get_unread_count(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    count = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.unread == True
    ).count()
    return {"count": count}

@router.patch("/read")
def mark_notifications_read(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.unread == True
    ).update({"unread": False})
    db.commit()
    return {"message": "Notifications marked as read"}
