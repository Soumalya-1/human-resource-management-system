from sqlalchemy.orm import Session
from . import models
import re
from datetime import date, timedelta
from typing import Optional

EMPLOYEE_ID_PREFIX = "REVE"
EMPLOYEE_ID_WIDTH = 6

def generate_next_employee_id(db: Session) -> str:
    # Find highest existing numeric suffix
    max_num = 0
    users = db.query(models.User).all()
    for u in users:
        if u.employee_id and u.employee_id.startswith(EMPLOYEE_ID_PREFIX):
            try:
                num = int(u.employee_id[len(EMPLOYEE_ID_PREFIX):])
                if num > max_num:
                    max_num = num
            except ValueError:
                pass
    next_num = max_num + 1
    return f"{EMPLOYEE_ID_PREFIX}{next_num:0{EMPLOYEE_ID_WIDTH}d}"

def is_strong_password(password: str) -> bool:
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    return True

def is_privileged(role: str) -> bool:
    return role in ("Admin", "HR")

def date_range(start: date, end: date):
    d = start
    while d <= end:
        yield d
        d += timedelta(days=1)

def has_overlapping_leave(db: Session, user_id: int, start: date, end: date, exclude_id: Optional[int] = None) -> bool:
    q = db.query(models.Leave).filter(
        models.Leave.user_id == user_id,
        models.Leave.status.in_(["Pending", "Approved"]),
        models.Leave.start_date <= end,
        models.Leave.end_date >= start
    )
    if exclude_id:
        q = q.filter(models.Leave.id != exclude_id)
    return q.first() is not None

def mark_attendance_as_leave(db: Session, user_id: int, start: date, end: date):
    for d in date_range(start, end):
        att = db.query(models.Attendance).filter(
            models.Attendance.user_id == user_id,
            models.Attendance.date == d
        ).first()
        if att:
            att.status = "Leave"
            att.check_in = None
            att.check_out = None
        else:
            att = models.Attendance(
                user_id=user_id,
                date=d,
                status="Leave"
            )
            db.add(att)
    db.commit()
