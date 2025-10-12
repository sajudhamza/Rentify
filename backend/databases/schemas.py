from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import enum

# ===================================================================
# USER SCHEMAS
# ===================================================================
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# ===================================================================
# TOKEN SCHEMAS
# ===================================================================
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None

# ===================================================================
# CATEGORY SCHEMAS
# ===================================================================
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    
    class Config:
        from_attributes = True

# ===================================================================
# ITEM SCHEMAS
# ===================================================================
class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price_per_day: float
    is_available: bool = True
    image_url: Optional[str] = None

class ItemCreate(ItemBase):
    category_id: int
    # NOTE: owner_id is removed. It will be derived from the auth token.

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_per_day: Optional[float] = None
    is_available: Optional[bool] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None

class ItemResponse(ItemBase):
    id: int
    owner_id: int
    category_id: int
    created_at: datetime
    owner: UserResponse
    
    class Config:
        from_attributes = True

# ===================================================================
# BOOKING SCHEMAS
# ===================================================================
class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class BookingBase(BaseModel):
    start_date: datetime
    end_date: datetime

class BookingCreate(BookingBase):
    pass

class BookingStatusUpdate(BaseModel):
    status: BookingStatus

class BookingResponse(BookingBase):
    id: int
    renter_id: int
    item_id: int
    status: BookingStatus
    created_at: datetime
    item: ItemResponse
    renter: UserResponse

    class Config:
        from_attributes = True


# ===================================================================
# REVIEW SCHEMAS (Placeholder for future use)
# ===================================================================
class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    item_id: int

class ReviewResponse(ReviewBase):
    id: int
    reviewer_id: int
    item_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

