# backend/crud.py

import os
import shutil
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, UploadFile, status
from typing import Optional, Dict, Any

from databases import models, schemas
from . import passwords# Updated import

# --- Helper for saving images ---
def save_upload_file(upload_file: UploadFile) -> Optional[str]:
    if upload_file:
        # Sanitize filename to prevent directory traversal attacks
        filename = os.path.basename(upload_file.filename)
        file_path = os.path.join("uploads", filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        return f"/uploads/{filename}"
    return None

# ===================================================================
# USER
# ===================================================================

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_identifier(db: Session, identifier: str):
    """
    Fetches a user by either their username or their email address.
    """
    return db.query(models.User).filter(
        or_(models.User.username == identifier, models.User.email == identifier)
    ).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    if get_user_by_email(db, email=user.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    if get_user_by_username(db, username=user.username):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")
    
    hashed_password = passwords.get_password_hash(user.password) # Updated function call
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_items(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user.items

# ===================================================================
# CATEGORY
# ===================================================================

def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()

# ===================================================================
# ITEM
# ===================================================================

def create_item(db: Session, owner_id: int, item_data: Dict[str, Any], image: Optional[UploadFile]):
    category = db.query(models.Category).filter(models.Category.id == item_data['category_id']).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    image_url = save_upload_file(image)
    
    db_item = models.Item(
        **item_data,
        owner_id=owner_id,
        image_url=image_url
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_items(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Item).offset(skip).limit(limit).all()

def search_items(db: Session, q: str):
    return db.query(models.Item).filter(
        or_(models.Item.name.ilike(f"%{q}%"), models.Item.description.ilike(f"%{q}%"))
    ).all()

def get_item(db: Session, item_id: int):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item

def update_item(db: Session, item_id: int, current_user_id: int, update_data: Dict[str, Any], image: Optional[UploadFile]):
    db_item = get_item(db, item_id)
    if db_item.owner_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this item")

    for key, value in update_data.items():
        if value is not None:
            setattr(db_item, key, value)
            
    if image:
        db_item.image_url = save_upload_file(image)

    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# ===================================================================
# BOOKING
# ===================================================================

def create_booking(db: Session, item_id: int, renter_id: int, booking: schemas.BookingCreate):
    item = get_item(db, item_id)
    if item.owner_id == renter_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot book your own item")

    days = (booking.end_date - booking.start_date).days
    if days <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="End date must be after start date.")

    db_booking = models.Booking(
        **booking.model_dump(),
        renter_id=renter_id,
        item_id=item_id,
        total_price=item.price_per_day * days,
        status="pending"
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

def get_my_bookings(db: Session, user_id: int):
    return db.query(models.Booking).filter(models.Booking.renter_id == user_id).all()

def get_my_listing_bookings(db: Session, owner_id: int):
    return db.query(models.Booking).join(models.Item).filter(models.Item.owner_id == owner_id).all()

def update_booking_status(db: Session, booking_id: int, new_status: str, current_user_id: int):
    db_booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not db_booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if db_booking.item.owner_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this booking")
    
    db_booking.status = new_status
    db.commit()
    db.refresh(db_booking)
    return db_booking

