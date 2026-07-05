from pydantic import BaseModel, EmailStr, field_validator, Field, ConfigDict
from typing import Optional, Literal
from datetime import date, datetime
from .utils import validate_password_strength

# --- Auth ---
class UserCreate(BaseModel):
    employee_id: Optional[str] = None
    email: EmailStr
    password: str
    role: Literal["Admin", "HR", "Employee"] = "Employee"
    name: str = Field(..., max_length=100)

    @field_validator('password')
    @classmethod
    def password_strong(cls, v: str) -> str:
        errors = validate_password_strength(v)
        if errors:
            raise ValueError(f"Password must contain: {', '.join(errors)}")
        return v

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Profile ---
class UserUpdateEmployee(BaseModel):
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=200)
    profile_picture: Optional[str] = Field(None, max_length=500)

class UserUpdateAdmin(UserUpdateEmployee):
    job_title: Optional[str] = Field(None, max_length=100)
    role: Optional[Literal["Admin", "HR", "Employee"]] = None
    documents: Optional[str] = Field(None, max_length=5000)

class UserResponse(BaseModel):
    id: int
    employee_id: str
    email: str
    name: Optional[str]
    role: str
    verified: bool
    phone: Optional[str]
    address: Optional[str]
    job_title: Optional[str]
    profile_picture: Optional[str]
    documents: Optional[str]

    model_config = ConfigDict(from_attributes=True)

# --- Leave ---
class LeaveApply(BaseModel):
    leave_type: Literal["Paid", "Sick", "Unpaid"]
    start_date: date
    end_date: date
    remarks: Optional[str] = Field(None, max_length=500)

    @field_validator('start_date')
    @classmethod
    def not_in_past(cls, v: date) -> date:
        if v < date.today():
            raise ValueError('Start date cannot be in the past')
        return v

class LeaveStatusUpdate(BaseModel):
    status: Literal["Pending", "Approved", "Rejected"]
    admin_comments: Optional[str] = Field(None, max_length=500)

class LeaveResponse(LeaveApply):
    id: int
    user_id: int
    status: str
    admin_comments: Optional[str]
    user_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# --- Payroll ---
class PayrollUpdate(BaseModel):
    basic_salary: float = Field(..., ge=0)
    allowances: float = Field(..., ge=0)
    deductions: float = Field(..., ge=0)

    @field_validator('deductions')
    @classmethod
    def deductions_not_exceed(cls, v: float, info) -> float:
        data = info.data
        if 'basic_salary' in data and 'allowances' in data and v > data['basic_salary'] + data['allowances']:
            raise ValueError('Deductions cannot exceed basic salary + allowances')
        return v

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    detail: Optional[str] = None
    unread: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    time: datetime

    model_config = ConfigDict(from_attributes=True)

class DashboardStats(BaseModel):
    total_employees: int
    present_today: int
    on_leave_today: int
    open_positions: int

class LeaveBalanceItem(BaseModel):
    total: int
    used: int
    remaining: int

class LeaveBalanceResponse(BaseModel):
    paid: LeaveBalanceItem
    sick: LeaveBalanceItem
    unpaid: LeaveBalanceItem
