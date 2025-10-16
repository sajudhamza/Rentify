# backend/routes/item.py

from fastapi import APIRouter, Depends, status, Form, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import json

from utilities import crud, security
from databases import database, models, schemas

router = APIRouter(
    prefix="/items",
    tags=["Items"]
)

@router.post("/", response_model=schemas.ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item_route(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_active_user),
    name: str = Form(...),
    description: str = Form(...),
    price_per_day: float = Form(...),
    category_id: int = Form(...),
    address: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    zip_code: Optional[str] = Form(None),
    available_from: Optional[date] = Form(None),
    available_to: Optional[date] = Form(None),
    availability_rule: str = Form('all_days'),
    disabled_dates: str = Form("[]"), # Receive as JSON string of dates
    image: Optional[UploadFile] = File(None)
):
    item_data = {
        "name": name, "description": description, "price_per_day": price_per_day,
        "category_id": category_id, "address": address, "city": city,
        "state": state, "zip_code": zip_code,
        "available_from": available_from, "available_to": available_to,
        "availability_rule": availability_rule,
        "disabled_dates": json.loads(disabled_dates), # Parse the JSON string into a list
    }
    return crud.create_item(db=db, owner_id=current_user.id, item_data=item_data, image=image)

@router.get("/", response_model=List[schemas.ItemResponse])
def read_items_route(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_items(db, skip=skip, limit=limit)

@router.get("/search", response_model=List[schemas.ItemResponse])
def search_items_route(q: str = "", db: Session = Depends(database.get_db)):
    return crud.search_items(db=db, q=q)

@router.get("/{item_id}", response_model=schemas.ItemResponse)
def read_item_route(item_id: int, db: Session = Depends(database.get_db)):
    return crud.get_item(db, item_id=item_id)

@router.put("/{item_id}", response_model=schemas.ItemResponse)
def update_item_route(
    item_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_active_user),
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price_per_day: Optional[float] = Form(None),
    category_id: Optional[int] = Form(None),
    address: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    zip_code: Optional[str] = Form(None),
    is_available: Optional[bool] = Form(None),
    available_from: Optional[date] = Form(None),
    available_to: Optional[date] = Form(None),
    availability_rule: Optional[str] = Form(None),
    disabled_dates: Optional[str] = Form(None), # Receive as JSON string
    image: Optional[UploadFile] = File(None)
):
    update_data = {
        "name": name,
        "description": description,
        "price_per_day": price_per_day,
        "category_id": category_id,
        "address": address,
        "city": city,
        "state": state,
        "zip_code": zip_code,
        "is_available": is_available,
        "available_from": available_from,
        "available_to": available_to,
        "availability_rule": availability_rule,
    }
    
    # Parse disabled_dates if it's provided as a string
    if disabled_dates is not None:
        update_data["disabled_dates"] = json.loads(disabled_dates)

    # Filter out keys where the value is None, so we only update provided fields
    update_data_filtered = {k: v for k, v in update_data.items() if v is not None}

    return crud.update_item(
        db=db,
        item_id=item_id,
        current_user_id=current_user.id,
        update_data=update_data_filtered,
        image=image
    )

