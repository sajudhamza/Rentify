# backend/routes/booking.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from utilities import crud, security
from databases import database, models, schemas

router = APIRouter(
    tags=["Bookings"]
)

@router.post("/items/{item_id}/bookings", response_model=schemas.BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking_route(
    item_id: int,
    booking: schemas.BookingCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_active_user)
):
    return crud.create_booking(db=db, item_id=item_id, renter_id=current_user.id, booking=booking)

@router.get("/my-bookings", response_model=List[schemas.BookingResponse])
def get_my_bookings_route(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_active_user)
):
    return crud.get_my_bookings(db, user_id=current_user.id)

@router.get("/my-listings/bookings", response_model=List[schemas.BookingResponse])
def get_my_listing_bookings_route(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_active_user)
):
    return crud.get_my_listing_bookings(db, owner_id=current_user.id)

@router.put("/bookings/{booking_id}", response_model=schemas.BookingResponse)
def update_booking_status_route(
    booking_id: int,
    status_update: schemas.BookingStatusUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_active_user)
):
    return crud.update_booking_status(
        db=db,
        booking_id=booking_id,
        new_status=status_update.status,
        current_user_id=current_user.id
    )