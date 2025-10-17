from datetime import date
from sqlalchemy import (
    Boolean,
    ForeignKey,
    Integer,
    String,
    Float,
    DateTime,
    Date,
    Enum as SQLAlchemyEnum,
    JSON,
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
import enum
from .database import Base


class BookingStatus(enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String, unique=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    full_name: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[DateTime] = mapped_column(
        DateTime, default=func.now()
    )

    items: Mapped[list["Item"]] = relationship("Item", back_populates="owner")
    bookings: Mapped[list["Booking"]] = relationship(
        "Booking", back_populates="renter"
    )
    reviews: Mapped[list["Review"]] = relationship(
        "Review", back_populates="user"
    )


class Category(Base):
    __tablename__ = "categories"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[str | None] = mapped_column(String, nullable=True)

    items: Mapped[list["Item"]] = relationship(
        "Item", back_populates="category"
    )


class Item(Base):
    __tablename__ = "items"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str] = mapped_column(String)
    price_per_day: Mapped[float] = mapped_column(Float)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    
    # Location Fields
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    city: Mapped[str | None] = mapped_column(String, nullable=True)
    state: Mapped[str | None] = mapped_column(String, nullable=True)
    zip_code: Mapped[str | None] = mapped_column(String, nullable=True)

    # Availability Date Fields
    available_from: Mapped[date | None] = mapped_column(Date, nullable=True)
    available_to: Mapped[date | None] = mapped_column(Date, nullable=True)
    
    # Granular availability fields
    availability_rule: Mapped[str] = mapped_column(String, default="all_days")
    disabled_dates: Mapped[list[date] | None] = mapped_column(JSON, nullable=True)


    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    category_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("categories.id")
    )
    created_at: Mapped[DateTime] = mapped_column(
        DateTime, default=func.now()
    )

    owner: Mapped["User"] = relationship("User", back_populates="items")
    category: Mapped["Category"] = relationship("Category", back_populates="items")
    bookings: Mapped[list["Booking"]] = relationship(
        "Booking", back_populates="item"
    )
    reviews: Mapped[list["Review"]] = relationship(
        "Review", back_populates="item"
    )


class Booking(Base):
    __tablename__ = "bookings"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    start_date: Mapped[DateTime] = mapped_column(DateTime)
    end_date: Mapped[DateTime] = mapped_column(DateTime)
    total_price: Mapped[float] = mapped_column(Float)
    status: Mapped[BookingStatus] = mapped_column(
        SQLAlchemyEnum(BookingStatus), default=BookingStatus.pending
    )

    item_id: Mapped[int] = mapped_column(Integer, ForeignKey("items.id"))
    renter_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))

    item: Mapped["Item"] = relationship("Item", back_populates="bookings")
    renter: Mapped["User"] = relationship("User", back_populates="bookings")


class Review(Base):
    __tablename__ = "reviews"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    rating: Mapped[int] = mapped_column(Integer)
    comment: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(
        DateTime, default=func.now()
    )

    item_id: Mapped[int] = mapped_column(Integer, ForeignKey("items.id"))
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))

    item: Mapped["Item"] = relationship("Item", back_populates="reviews")
    user: Mapped["User"] = relationship("User", back_populates="reviews")

