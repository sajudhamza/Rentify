from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from decimal import Decimal

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str | None = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    description: str | None = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)

# --- Item Schemas ---
class ItemBase(BaseModel):
    name: str
    description: str | None = None
    price_per_day: Decimal
    image_url: str | None = None

class ItemCreate(ItemBase):
    owner_id: int
    category_id: int

class ItemResponse(ItemBase):
    id: int
    is_available: bool
    owner_id: int
    category_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

