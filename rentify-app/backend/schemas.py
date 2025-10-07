from pydantic import BaseModel, ConfigDict
from typing import Optional
from decimal import Decimal
import datetime

# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str # In a real app, this would be hashed

class UserResponse(UserBase):
    id: int
    is_active: bool
    
    model_config = ConfigDict(from_attributes=True)

# --- Item Schemas ---
class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price_per_day: Decimal
    is_available: bool = True
    image_url: Optional[str] = None

class ItemCreate(ItemBase):
    owner_id: int
    category_id: int

class ItemResponse(ItemBase):
    id: int
    owner_id: int
    category_id: int
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

