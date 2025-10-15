from fastapi import APIRouter, Depends, status, Form, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional

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
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    zip_code: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    item_data = {
        "name": name, "description": description, "price_per_day": price_per_day,
        "category_id": category_id, "address": address, "city": city, "state": state, "zip_code": zip_code,
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
    image: Optional[UploadFile] = File(None)
):
    # ** THE FIX IS HERE **
    # Create a dictionary with the data received from the form.
    # FastAPI gives Form fields with empty strings as None, so we are safe.
    # However, we must filter out the None values so that we only update the fields that were actually sent.
    update_data = {
        "name": name, 
        "description": description, 
        "price_per_day": price_per_day,
        "category_id": category_id, 
        "address": address,
        "city": city, 
        "state": state, 
        "zip_code": zip_code,
        "is_available": is_available
    }
    
    # Filter out keys where the value is None
    update_data_filtered = {k: v for k, v in update_data.items() if v is not None}

    return crud.update_item(
        db=db, 
        item_id=item_id, 
        current_user_id=current_user.id, 
        update_data=update_data_filtered, 
        image=image
    )

