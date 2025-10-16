# backend/databases/schemas.py

from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime, date
from .models import BookingStatus


# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# --- Item Schemas ---
# Forward declaration for ItemResponse to be used in BookingResponse
class ItemResponse(BaseModel):
    pass

# --- Booking Schemas ---
class BookingBase(BaseModel):
    start_date: date
    end_date: date


class BookingCreate(BookingBase):
    pass


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingResponse(BookingBase):
    id: int
    total_price: float
    status: BookingStatus
    item_id: int
    renter_id: int
    item: ItemResponse 

    model_config = ConfigDict(from_attributes=True)


# --- Item Schemas (Full Definition) ---
class ItemBase(BaseModel):
    name: str
    description: str
    price_per_day: float
    category_id: int
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    available_from: Optional[date] = None
    available_to: Optional[date] = None
    # ** NEW: Add availability rule and disabled dates **
    availability_rule: Optional[str] = 'all_days'
    disabled_dates: Optional[List[date]] = []


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_per_day: Optional[float] = None
    is_available: Optional[bool] = None
    category_id: Optional[int] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    available_from: Optional[date] = None
    available_to: Optional[date] = None
    availability_rule: Optional[str] = None
    disabled_dates: Optional[List[date]] = None


# Now fully define ItemResponse
class ItemResponse(ItemBase):
    id: int
    is_available: bool
    owner_id: int
    image_url: Optional[str] = None
    created_at: datetime
    owner: UserResponse
    category: CategoryResponse

    model_config = ConfigDict(from_attributes=True)


# Rebuild the models that have forward references
BookingResponse.model_rebuild()
ItemResponse.model_rebuild()


# --- Review Schemas ---
class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    pass


class ReviewResponse(ReviewBase):
    id: int
    item_id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

