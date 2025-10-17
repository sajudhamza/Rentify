import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Loader2, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { addDays, isSaturday, isSunday, parseISO, format, eachDayOfInterval, isWithinInterval, startOfDay } from 'date-fns';

const API_BASE_URL = 'http://localhost:8000';

// Generate time options for dropdowns (e.g., 10:00 AM, 10:30 AM)
const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
});

export const ItemDetailPage = ({ currentUser, onEditClick, token, dataVersion }) => {
    const { itemId } = useParams();
    const [item, setItem] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookingError, setBookingError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState('');

    // State for Turo-style booking inputs
    const [startDate, setStartDate] = useState(new Date());
    const [startTime, setStartTime] = useState('10:00 AM');
    const [endDate, setEndDate] = useState(addDays(new Date(), 1));
    const [endTime, setEndTime] = useState('10:00 AM');
    
    // State to control calendar visibility
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);

    const startCalendarRef = useRef(null);
    const endCalendarRef = useRef(null);

    // Fetch item and its bookings on load
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [itemResponse, bookingsResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/items/${itemId}`),
                    fetch(`${API_BASE_URL}/api/items/${itemId}/bookings`)
                ]);

                if (!itemResponse.ok) throw new Error('Item not found or there was a server error.');
                if (!bookingsResponse.ok) throw new Error('Could not fetch existing bookings for this item.');
                
                const itemData = await itemResponse.json();
                const bookingsData = await bookingsResponse.json();
                
                setItem(itemData);
                setBookings(bookingsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (itemId) {
            fetchData();
        }
        
        // Effect to handle clicks outside the calendars to close them
        const handleClickOutside = (event) => {
            if (startCalendarRef.current && !startCalendarRef.current.contains(event.target)) {
                setShowStartCalendar(false);
            }
            if (endCalendarRef.current && !endCalendarRef.current.contains(event.target)) {
                setShowEndCalendar(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, [itemId, dataVersion]);
    
    // Helper function to combine a date and a time string into a full Date object
    const combineDateAndTime = (date, time12h) => {
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') hours = '00';
        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
        
        const newDate = new Date(date);
        newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        return newDate;
    };


    const handleBookingRequest = async () => {
        if (!currentUser || !token) {
            setBookingError("You must be logged in to book an item.");
            return;
        }
        setBookingError('');
        setBookingSuccess('');

        const startDateTime = combineDateAndTime(startDate, startTime);
        const endDateTime = combineDateAndTime(endDate, endTime);

        if (endDateTime <= startDateTime) {
            setBookingError("Your trip's end must be after its start.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/items/${item.id}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    start_date: startDateTime.toISOString(),
                    end_date: endDateTime.toISOString(),
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to create booking.");
            }
            setBookingSuccess("Booking request sent successfully!");
        } catch (err) {
            setBookingError(err.message);
        }
    };
    
    const calculateTotalPrice = () => {
        if (!item || !startDate || !endDate) return { days: 0, price: 0 };
        const start = combineDateAndTime(startDate, startTime);
        const end = combineDateAndTime(endDate, endTime);
        if (end <= start) return { days: 0, price: 0 };

        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        const days = Math.ceil(hours / 24); // Round up to the nearest full day
        return { days, price: days * item.price_per_day };
    };
    const { days: totalDays, price: totalPrice } = calculateTotalPrice();
    
    // Comprehensive function to determine which dates should be disabled on the calendar
    const getDisabledDays = (date) => {
        const today = startOfDay(new Date());
        if (date < today) return true;

        if (!item) return false;
        
        // Disable dates outside the owner's set availability window
        const itemMinDate = item.available_from ? parseISO(item.available_from) : null;
        const itemMaxDate = item.available_to ? parseISO(item.available_to) : null;
        if (itemMinDate && date < itemMinDate) return true;
        if (itemMaxDate && date > itemMaxDate) return true;

        // Disable based on weekday/weekend rules
        if (item.availability_rule === 'weekdays_only' && (isSaturday(date) || isSunday(date))) return true;
        if (item.availability_rule === 'weekends_only' && !isSaturday(date) && !isSunday(date)) return true;

        // Disable dates specifically blocked by the owner
        const ownerBlockedDates = (item.disabled_dates || []).map(d => format(parseISO(d), 'yyyy-MM-dd'));
        if (ownerBlockedDates.includes(format(date, 'yyyy-MM-dd'))) return true;
        
        // Disable dates that are part of a confirmed booking
        for (const booking of bookings) {
            const interval = { start: startOfDay(parseISO(booking.start_date)), end: startOfDay(parseISO(booking.end_date)) };
            if (isWithinInterval(date, interval)) return true;
        }

        return false;
    };

    const handleStartDateSelect = (date) => {
        setStartDate(date);
        setShowStartCalendar(false);
        // Automatically adjust end date if it's before the new start date
        if (date >= endDate) {
            setEndDate(addDays(date, 1));
        }
    };
    
    const handleEndDateSelect = (date) => {
        setEndDate(date);
        setShowEndCalendar(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="animate-spin h-10 w-10 text-black" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                <h2 className="mt-4 text-2xl font-bold">Error Loading Item</h2>
                <p className="mt-2 text-gray-600">{error}</p>
                <Link to="/" className="mt-6 inline-block bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800">
                    Back to Home
                </Link>
            </div>
        );
    }

    if (!item) return null;

    const isOwner = currentUser && item && currentUser.id === item.owner_id;

    const imageUrl = item.image_url
        ? `${API_BASE_URL}${item.image_url}`
        : `https://placehold.co/600x600/e2e8f0/334155?text=${encodeURIComponent(item.name)}`;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link to="/" className="flex items-center text-gray-600 hover:text-black mb-6">
                <ArrowLeft size={18} className="mr-2" />
                Back to all items
            </Link>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                     <img
                        src={imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/600x600/e2e8f0/334155?text=Image+not+found`; }}
                    />
                </div>

                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2">{item.name}</h1>
                    <div className="flex items-center text-gray-500 mb-4">
                        <MapPin size={16} className="mr-2" />
                        <span>{`${item.city || 'Unknown'}, ${item.state || 'Location'}`}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-6">{item.description}</p>
                    
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-2xl font-bold">${item.price_per_day.toFixed(2)}</span>
                                <span className="text-gray-600"> / day</span>
                            </div>
                            {isOwner && (
                                 <button 
                                    onClick={() => onEditClick(item)}
                                    className="bg-gray-200 text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Edit Item
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {!isOwner && (
                        <div className="border rounded-xl p-6 shadow-md">
                             <h3 className="text-xl font-bold mb-4 text-center">Book this item</h3>
                             <div className="grid grid-cols-2 gap-4">
                                {/* Start Date & Time Picker */}
                                <div className="relative">
                                    <label className="text-xs font-bold text-gray-500">START</label>
                                    <div 
                                        onClick={() => setShowStartCalendar(!showStartCalendar)}
                                        className="w-full mt-1 p-3 border rounded-lg cursor-pointer flex justify-between items-center bg-white"
                                    >
                                        <span>{format(startDate, 'MMM dd, yyyy')}</span>
                                        <CalendarIcon size={16} className="text-gray-500" />
                                    </div>
                                    <select value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full mt-2 p-3 border rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-black">
                                        {timeOptions.map(t => <option key={`start-${t}`} value={t}>{t}</option>)}
                                    </select>
                                    {showStartCalendar && (
                                        <div className="absolute top-full left-0 z-10 mt-2 shadow-lg bg-white rounded-lg" ref={startCalendarRef}>
                                            <Calendar 
                                                date={startDate}
                                                onChange={handleStartDateSelect}
                                                disabledDay={getDisabledDays}
                                                minDate={new Date()}
                                            />
                                        </div>
                                    )}
                                </div>
                                {/* End Date & Time Picker */}
                                <div className="relative">
                                     <label className="text-xs font-bold text-gray-500">END</label>
                                    <div 
                                        onClick={() => setShowEndCalendar(!showEndCalendar)}
                                        className="w-full mt-1 p-3 border rounded-lg cursor-pointer flex justify-between items-center bg-white"
                                    >
                                        <span>{format(endDate, 'MMM dd, yyyy')}</span>
                                        <CalendarIcon size={16} className="text-gray-500" />
                                    </div>
                                     <select value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full mt-2 p-3 border rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-black">
                                        {timeOptions.map(t => <option key={`end-${t}`} value={t}>{t}</option>)}
                                    </select>
                                    {showEndCalendar && (
                                        <div className="absolute top-full right-0 z-10 mt-2 shadow-lg bg-white rounded-lg" ref={endCalendarRef}>
                                            <Calendar 
                                                date={endDate}
                                                onChange={handleEndDateSelect}
                                                disabledDay={getDisabledDays}
                                                minDate={addDays(startDate, 1)}
                                            />
                                        </div>
                                    )}
                                </div>
                             </div>

                             {totalPrice > 0 && (
                                <div className="bg-gray-50 rounded-lg p-4 my-4">
                                    <div className="flex justify-between items-center text-gray-600 text-sm mb-2">
                                        <span>${item.price_per_day.toFixed(2)} x {totalDays} day{totalDays !== 1 ? 's' : ''}</span>
                                        <span>${(item.price_per_day * totalDays).toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-2 mt-2 flex justify-between items-center font-bold text-lg">
                                        <span>Total Price</span>
                                        <span>${totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                             )}

                             {bookingError && <p className="text-red-500 text-sm my-2 text-center">{bookingError}</p>}
                             {bookingSuccess && <p className="text-green-500 text-sm my-2 text-center">{bookingSuccess}</p>}

                             <button 
                                onClick={handleBookingRequest}
                                className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 mt-4"
                                disabled={totalDays <= 0 || loading}
                            >
                                 {loading ? <Loader2 className="animate-spin" /> : 'Request to Rent'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

