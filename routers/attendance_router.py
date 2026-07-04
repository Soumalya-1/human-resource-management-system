from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date as date_cls
from typing import List

import models
from database import get_db
import auth
from utils import is_privileged

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

def _today():
    return datetime.utcnow().date()

@router.post("/check-in")
def check_in(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    today = _today()
    attendance = db.query(models.Attendance).filter(
        models.Attendance.user_id == current_user.id,
        models.Attendance.date == today
    ).first()

    if attendance:
        raise HTTPException(status_code=400, detail="Already checked in today")

    new_att = models.Attendance(
        user_id=current_user.id,
        date=today,
        check_in=datetime.utcnow(),
        status="Present"
    )
    db.add(new_att)
    db.commit()
    return {"message": "Check-in successful"}

@router.post("/check-out")
def check_out(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    today = _today()
    attendance = db.query(models.Attendance).filter(
        models.Attendance.user_id == current_user.id,
        models.Attendance.date == today
    ).first()

    if not attendance or attendance.check_out:
        raise HTTPException(status_code=400, detail="Not checked in or already checked out")

    attendance.check_out = datetime.utcnow()
    if attendance.status not in ("Half-day", "Leave"):
        attendance.status = "Present"
    db.commit()
    return {"message": "Check-out successful"}

@router.get("/")
def view_attendance(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if is_privileged(current_user.role):
        return db.query(models.Attendance).all()
    return db.query(models.Attendance).filter(models.Attendance.user_id == current_user.id).all()

@router.get("/weekly")
def view_weekly_attendance(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    today = _today()
    start = today - timedelta(days=today.weekday())  # Monday
    end = start + timedelta(days=6)  # Sunday

    q = db.query(models.Attendance).filter(
        models.Attendance.date >= start,
        models.Attendance.date <= end
    )
    if not is_privileged(current_user.role):
        q = q.filter(models.Attendance.user_id == current_user.id)

    rows = q.all()
    return [
        {
            "date": r.date.isoformat(),
            "check_in": r.check_in.isoformat() if r.check_in else None,
            "check_out": r.check_out.isoformat() if r.check_out else None,
            "status": r.status,
            "user_id": r.user_id
        } for r in rows
    ]
