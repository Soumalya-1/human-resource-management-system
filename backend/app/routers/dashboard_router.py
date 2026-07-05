from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone

from app import models, schemas, auth
from app.database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=schemas.DashboardStats)
def dashboard_stats(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    today = datetime.now(timezone.utc).date()
    total_employees = db.query(models.User).count()
    present_today = db.query(models.Attendance).filter(
        models.Attendance.date == today,
        models.Attendance.status == "Present"
    ).count()
    on_leave_today = db.query(models.Attendance).filter(
        models.Attendance.date == today,
        models.Attendance.status == "Leave"
    ).count()
    open_positions = db.query(models.User.job_title).filter(
        models.User.job_title.isnot(None)
    ).distinct().count()
    return schemas.DashboardStats(
        total_employees=total_employees,
        present_today=present_today,
        on_leave_today=on_leave_today,
        open_positions=open_positions
    )
