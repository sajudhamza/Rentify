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

    model_config = ConfigDict(from_attributes=True)


# --- Item Schemas ---
class ItemBase(BaseModel):
    name: str
    description: str
    price_per_day: float
    category_id: int
    
    # Location fields
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None

    # Availability fields
    available_from: Optional[date] = None
    available_to: Optional[date] = None
    availability_rule: Optional[str] = "all_days"
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


# --- NEW: A simple Item schema for use inside BookingResponse to break the loop ---
class ItemInBookingResponse(BaseModel):
    id: int
    name: str
    image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# --- Booking Schemas ---
class BookingBase(BaseModel):
    start_date: datetime
    end_date: datetime


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
    # --- FIX: Use the simple Item schema here ---
    item: ItemInBookingResponse 

    model_config = ConfigDict(from_attributes=True)


# --- NEW: A simpler Item response for lists (e.g., homepage) ---
class ItemSummaryResponse(ItemBase):
    id: int
    is_available: bool
    owner_id: int
    image_url: Optional[str] = None
    created_at: datetime
    owner: Optional[UserResponse] = None
    category: Optional[CategoryResponse] = None

    model_config = ConfigDict(from_attributes=True)


# --- The full Item response for the detail page ---
class ItemResponse(ItemSummaryResponse): # Inherits from the summary
    bookings: List[BookingResponse] = [] # Only the detail view has bookings

    model_config = ConfigDict(from_attributes=True)


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