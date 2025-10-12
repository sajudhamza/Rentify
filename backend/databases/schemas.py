from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    description: str | None = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Item Schemas ---
class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price_per_day: float
    image_url: Optional[str] = None

class ItemCreate(ItemBase):
    owner_id: int
    category_id: int

class ItemResponse(ItemBase):
    id: int
    is_available: bool
    owner_id: int
    category_id: int
    created_at: datetime

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_per_day: Optional[float] = None
    is_available: Optional[bool] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None


class Item(ItemBase):
    id: int
    owner_id: int
    category_id: int
    is_available: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

