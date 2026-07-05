from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func as sqlfunc
from datetime import date, datetime, timezone

from app import models, schemas, auth
from app.database import get_db
from app.utils import is_privileged, has_overlapping_leave, mark_attendance_as_leave, revert_attendance_from_leave

router = APIRouter(prefix="/api/leaves", tags=["Leave"])

def log_activity(db: Session, user_id: int, type: str, title: str):
    db.add(models.ActivityLog(user_id=user_id, type=type, title=title))

def create_notification(db: Session, user_id: int, title: str, detail: str = None):
    db.add(models.Notification(user_id=user_id, title=title, detail=detail, unread=True))

@router.post("/", response_model=schemas.LeaveResponse)
def apply_leave(leave: schemas.LeaveApply, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if leave.end_date < leave.start_date:
        raise HTTPException(status_code=400, detail="End date must be after or equal to start date")

    if has_overlapping_leave(db, current_user.id, leave.start_date, leave.end_date):
        raise HTTPException(status_code=400, detail="Overlapping leave request already exists")

    new_leave = models.Leave(**leave.model_dump(), user_id=current_user.id)
    db.add(new_leave)
    try:
        db.commit()
        log_activity(db, current_user.id, "leave",
            f"Applied for {leave.leave_type} leave ({leave.start_date}–{leave.end_date})")
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Could not create leave request")
    db.refresh(new_leave)
    return schemas.LeaveResponse(
        **{c.name: getattr(new_leave, c.name) for c in new_leave.__table__.columns},
        user_name=current_user.name
    )

@router.get("/")
def view_leaves(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.Leave, models.User.name).join(models.User, models.Leave.user_id == models.User.id)
    if not is_privileged(current_user.role):
        query = query.filter(models.Leave.user_id == current_user.id)

    results = query.all()
    return [
        schemas.LeaveResponse(
            **{c.name: getattr(leave, c.name) for c in models.Leave.__table__.columns},
            user_name=user_name
        )
        for leave, user_name in results
    ]

@router.get("/balance", response_model=schemas.LeaveBalanceResponse)
def leave_balance(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    today = date.today()
    year_start = date(today.year, 1, 1)

    defaults = {"Paid": 20, "Sick": 10, "Unpaid": 5}

    used_counts = {}
    rows = db.query(models.Leave.leave_type, sqlfunc.count(models.Leave.id)).filter(
        models.Leave.user_id == current_user.id,
        models.Leave.status == "Approved",
        models.Leave.start_date >= year_start
    ).group_by(models.Leave.leave_type).all()
    for lt, cnt in rows:
        used_counts[lt] = cnt

    items = {}
    for lt in ("Paid", "Sick", "Unpaid"):
        total = defaults[lt]
        used = used_counts.get(lt, 0)
        remaining = max(total - used, 0)
        items[lt.lower()] = schemas.LeaveBalanceItem(total=total, used=used, remaining=remaining)

    return schemas.LeaveBalanceResponse(**items)

@router.patch("/admin/{leave_id}/status")
def update_leave_status(leave_id: int, status_data: schemas.LeaveStatusUpdate, db: Session = Depends(get_db), admin: models.User = Depends(auth.get_admin_user)):
    leave = db.query(models.Leave).filter(models.Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")

    employee = db.query(models.User).filter(models.User.id == leave.user_id).first()
    employee_name = employee.name if employee else f"User #{leave.user_id}"

    old_status = leave.status
    leave.status = status_data.status
    leave.admin_comments = status_data.admin_comments

    if status_data.status == "Approved" and old_status != "Approved":
        mark_attendance_as_leave(db, leave.user_id, leave.start_date, leave.end_date)
    elif old_status == "Approved" and status_data.status != "Approved":
        revert_attendance_from_leave(db, leave.user_id, leave.start_date, leave.end_date)

    try:
        if status_data.status in ("Approved", "Rejected") and old_status != status_data.status:
            create_notification(db, leave.user_id,
                f"Leave {status_data.status.lower()}",
                f"Your {leave.leave_type} leave ({leave.start_date}–{leave.end_date}) has been {status_data.status.lower()} by {admin.name or 'Admin'}")
        log_activity(db, admin.id, "leave",
            f"{status_data.status} {leave.leave_type} leave for {employee_name} ({leave.start_date}–{leave.end_date})")
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Could not update leave status")
    return {"message": f"Leave {status_data.status.lower()}"}
