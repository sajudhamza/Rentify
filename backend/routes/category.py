# backend/routes/category.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from utilities import crud
from databases.database import get_db
from databases import schemas

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)

@router.post("/", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category_route(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    return crud.create_category(db=db, category=category)

@router.get("/", response_model=List[schemas.CategoryResponse])
def read_categories_route(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_categories(db, skip=skip, limit=limit)