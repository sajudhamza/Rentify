# backend/routes/user.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from utilities import crud, security
from databases import database, models, schemas

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.post("/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user_route(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    return crud.create_user(db=db, user=user)

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(security.get_current_active_user)):
    return current_user

@router.get("/", response_model=List[schemas.UserResponse])
def read_users_route(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_users(db, skip=skip, limit=limit)

@router.get("/{user_id}/items", response_model=List[schemas.ItemResponse])
def get_user_items_route(user_id: int, db: Session = Depends(database.get_db)):
    return crud.get_user_items(db, user_id=user_id)