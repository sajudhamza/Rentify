import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

from databases import models

# Load environment variables from .env file
load_dotenv()

# --- Email Configuration ---
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
EMAILS_FROM_EMAIL = os.getenv("EMAILS_FROM_EMAIL")

def send_email(to: str, subject: str, html_content: str):
    """
    Connects to the SMTP server and sends an email.
    """
    if not all([SMTP_SERVER, SMTP_PORT, EMAILS_FROM_EMAIL]):
        print("--- EMAIL SKIPPED: SMTP settings not configured in .env file. ---")
        return

    message = MIMEMultipart("alternative")
    message["From"] = EMAILS_FROM_EMAIL
    message["To"] = to
    message["Subject"] = subject
    message.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            # For a real SMTP server with authentication, you would uncomment these lines:
            # if SMTP_USERNAME and SMTP_PASSWORD:
            #     server.starttls()
            #     server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(EMAILS_FROM_EMAIL, to, message.as_string())
            print(f"--- Email sent successfully to {to} ---")
            print(f"Subject: {subject}")
            print(f"----------------------------------------")
    except Exception as e:
        print(f"--- FAILED TO SEND EMAIL to {to} ---")
        print(f"Error: {e}")
        print(f"-------------------------------------")


def send_booking_request_email(booking: models.Booking):
    """
    Formats and sends an email notification to the item owner about a new booking request.
    """
    owner_email = booking.item.owner.email
    renter_name = booking.renter.full_name or booking.renter.username
    item_name = booking.item.name
    start_date = booking.start_date.strftime("%B %d, %Y")
    end_date = booking.end_date.strftime("%B %d, %Y")

    subject = f"New Rental Request for {item_name}"
    
    html_content = f"""
    <html>
    <body>
        <h2>Hello {booking.item.owner.full_name or booking.item.owner.username},</h2>
        <p>You have a new rental request from <b>{renter_name}</b> for your item: <b>'{item_name}'</b>.</p>
        <h3>Booking Details:</h3>
        <ul>
            <li><b>Renter's Email:</b> {booking.renter.email}</li>
            <li><b>Requested Dates:</b> {start_date} to {end_date}</li>
            <li><b>Total Price:</b> ${booking.total_price:.2f}</li>
        </ul>
        <p>Please log in to your Rentify account to approve or deny this request.</p>
        <p>Thank you,<br>The Rentify Team</p>
    </body>
    </html>
    """
    send_email(to=owner_email, subject=subject, html_content=html_content)


def send_booking_approval_email(booking: models.Booking):
    """
    Formats and sends an email notification to the renter when their booking is approved.
    """
    renter_email = booking.renter.email
    owner_name = booking.item.owner.full_name or booking.item.owner.username
    item_name = booking.item.name
    start_date = booking.start_date.strftime("%B %d, %Y")
    end_date = booking.end_date.strftime("%B %d, %Y")

    address_parts = [booking.item.address, booking.item.city, booking.item.state, booking.item.zip_code]
    pickup_address = ", ".join(part for part in address_parts if part)

    subject = f"Your Booking for {item_name} has been Confirmed!"

    html_content = f"""
    <html>
    <body>
        <h2>Hello {booking.renter.full_name or booking.renter.username},</h2>
        <p>Great news! Your rental request for <b>'{item_name}'</b> has been approved by {owner_name}.</p>
        <h3>Booking Details:</h3>
        <ul>
            <li><b>Rental Dates:</b> {start_date} to {end_date}</li>
            <li><b>Total Price:</b> ${booking.total_price:.2f}</li>
            <li><b>Owner's Email:</b> {booking.item.owner.email}</li>
        </ul>
        <h3>Pickup Address:</h3>
        <p>{pickup_address}</p>
        <p>Please coordinate with the owner for pickup details.</p>
        <p>Thank you,<br>The Rentify Team</p>
    </body>
    </html>
    """
    send_email(to=renter_email, subject=subject, html_content=html_content)

