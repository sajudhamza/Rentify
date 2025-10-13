import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Loader2, AlertCircle } from 'lucide-react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { addDays, differenceInCalendarDays } from 'date-fns';

const API_BASE_URL = 'http://localhost:8000';

export const ItemDetailPage = ({ currentUser, onEditClick, token, dataVersion }) => {
    const { itemId } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookingError, setBookingError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState('');

    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: addDays(new Date(), 1),
            key: 'selection'
        }
    ]);

    useEffect(() => {
        const fetchItem = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/api/items/${itemId}`);
                if (!response.ok) {
                    throw new Error('Item not found or there was a server error.');
                }
                const data = await response.json();
                setItem(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (itemId) {
            fetchItem();
        }
    }, [itemId, dataVersion]);

    const handleBookingRequest = async () => {
        if (!currentUser || !token) {
            setBookingError("You must be logged in to book an item.");
            return;
        }
        setBookingError('');
        setBookingSuccess('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/items/${item.id}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    start_date: dateRange[0].startDate.toISOString().split('T')[0],
                    end_date: dateRange[0].endDate.toISOString().split('T')[0],
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

    if (!item) {
        return null;
    }

    const isOwner = currentUser && item && currentUser.id === item.owner_id;
    const { startDate, endDate } = dateRange[0];
    const dayCount = startDate && endDate ? differenceInCalendarDays(endDate, startDate) || 1 : 0;
    const totalPrice = item && dayCount > 0 ? dayCount * item.price_per_day : 0;

    // Correctly construct the image URL
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
                        {/* Display actual item location using correct field names */}
                        <span>{`${item.city || 'Unknown'}, ${item.state || 'Location'}`}</span>
                        <span className="mx-2">·</span>
                        <div className="flex items-center">
                            <Star size={16} className="text-yellow-500 mr-1" />
                            <span>4.8 (12 reviews)</span>
                        </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-6">{item.description}</p>
                    
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-2xl font-bold">${item.price_per_day}</span>
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
                        <div>
                             <h3 className="font-semibold mb-3">Select Dates</h3>
                             <div className="flex justify-center mb-4">
                                <DateRange
                                    editableDateInputs={true}
                                    onChange={item => setDateRange([item.selection])}
                                    moveRangeOnFirstSelection={false}
                                    ranges={dateRange}
                                    minDate={new Date()}
                                />
                             </div>
                             
                             {dayCount > 0 && (
                                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                    <div className="flex justify-between items-center text-gray-600 mb-2">
                                        <span>${item.price_per_day.toFixed(2)} x {dayCount} day{dayCount !== 1 ? 's' : ''}</span>
                                        <span>${(item.price_per_day * dayCount).toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-2 mt-2 flex justify-between items-center font-bold text-lg">
                                        <span>Total Price</span>
                                        <span>${totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                             )}

                             {bookingError && <p className="text-red-500 text-sm mb-2 text-center">{bookingError}</p>}
                             {bookingSuccess && <p className="text-green-500 text-sm mb-2 text-center">{bookingSuccess}</p>}
                             <button 
                                onClick={handleBookingRequest}
                                className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                                disabled={dayCount === 0}
                            >
                                 Request to Rent
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

