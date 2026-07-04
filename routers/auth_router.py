from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import models, schemas, auth
from database import get_db
from utils import generate_next_employee_id

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Auto-generate clean employee_id (REVE######). First user becomes Admin.
    employee_id = generate_next_employee_id(db)
    # If client sent one and no conflict, allow override (for data import), else use generated
    if user.employee_id:
        existing = db.query(models.User).filter(models.User.employee_id == user.employee_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Employee ID already exists")
        employee_id = user.employee_id

    user_count = db.query(models.User).count()
    role = "Admin" if user_count == 0 else user.role

    hashed_pw = auth.get_password_hash(user.password)
    new_user = models.User(
        employee_id=employee_id,
        email=user.email,
        hashed_password=hashed_pw,
        role=role,
        name=user.name,
        verified=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = auth.create_access_token(data={"sub": str(user.id), "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}
