from databases import models

def send_booking_request_email(booking: models.Booking):
    """
    Simulates sending an email to the item owner about a new booking request.
    """
    owner_email = booking.item.owner.email
    renter_name = booking.renter.full_name or booking.renter.username
    item_name = booking.item.name
    start_date = booking.start_date.strftime("%B %d, %Y")
    end_date = booking.end_date.strftime("%B %d, %Y")

    subject = f"New Rental Request for {item_name}"
    
    message = f"""
    ==================================================
    SIMULATING EMAIL NOTIFICATION
    ==================================================
    TO: {owner_email}
    SUBJECT: {subject}
    --------------------------------------------------
    Hello {booking.item.owner.full_name or booking.item.owner.username},

    You have a new rental request from {renter_name} for your item: '{item_name}'.

    Booking Details:
    - Renter's Email: {booking.renter.email}
    - Requested Dates: {start_date} to {end_date}
    - Total Price: ${booking.total_price:.2f}

    Please log in to your Rentify account to approve or deny this request.

    Thank you,
    The Rentify Team
    ==================================================
    """
    print(message)


def send_booking_approval_email(booking: models.Booking):
    """
    Simulates sending an email to the renter when their booking is approved.
    """
    renter_email = booking.renter.email
    owner_name = booking.item.owner.full_name or booking.item.owner.username
    item_name = booking.item.name
    start_date = booking.start_date.strftime("%B %d, %Y")
    end_date = booking.end_date.strftime("%B %d, %Y")

    # Construct the full address for the email
    address_parts = [
        booking.item.address,
        booking.item.city,
        booking.item.state,
        booking.item.zip_code,
    ]
    pickup_address = ", ".join(part for part in address_parts if part)


    subject = f"Your Booking for {item_name} has been Confirmed!"

    message = f"""
    ==================================================
    SIMULATING EMAIL NOTIFICATION
    ==================================================
    TO: {renter_email}
    SUBJECT: {subject}
    --------------------------------------------------
    Hello {booking.renter.full_name or booking.renter.username},

    Great news! Your rental request for '{item_name}' has been approved by {owner_name}.

    Booking Details:
    - Rental Dates: {start_date} to {end_date}
    - Total Price: ${booking.total_price:.2f}
    - Owner's Email: {booking.item.owner.email}
    
    Pickup Address:
    {pickup_address}

    Please coordinate with the owner for pickup details.

    Thank you,
    The Rentify Team
    ==================================================
    """
    print(message)

