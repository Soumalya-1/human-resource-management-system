from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db
import auth

router = APIRouter(prefix="/api", tags=["Profile"])

@router.get("/profile/me", response_model=schemas.UserResponse)
def get_my_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.patch("/profile/me", response_model=schemas.UserResponse)
def update_my_profile(profile_data: schemas.UserUpdateEmployee, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if profile_data.phone is not None:
        current_user.phone = profile_data.phone
    if profile_data.address is not None:
        current_user.address = profile_data.address
    if profile_data.profile_picture is not None:
        current_user.profile_picture = profile_data.profile_picture
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/admin/users", response_model=List[schemas.UserResponse])
def admin_list_users(db: Session = Depends(get_db), admin: models.User = Depends(auth.get_admin_user)):
    return db.query(models.User).all()

@router.patch("/admin/users/{user_id}", response_model=schemas.UserResponse)
def admin_update_user(user_id: int, data: schemas.UserUpdateAdmin, db: Session = Depends(get_db), admin: models.User = Depends(auth.get_admin_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user
