import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Star, Loader2, AlertCircle } from 'lucide-react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { format, differenceInCalendarDays } from 'date-fns';

const API_BASE_URL = 'http://localhost:8000';

export const ItemDetailPage = ({ currentUser, onEditClick }) => {
    const { itemId } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookingError, setBookingError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState('');
    const [isBookingLoading, setIsBookingLoading] = useState(false);

    const [dateState, setDateState] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }
    ]);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${API_BASE_URL}/api/items/${itemId}`);
                if (!response.ok) {
                    throw new Error('Item not found');
                }
                const data = await response.json();
                setItem(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [itemId]);

    const handleBooking = async () => {
        if (!currentUser) {
            setBookingError("Please log in to make a booking request.");
            return;
        }

        const { startDate, endDate } = dateState[0];
        if (!startDate || !endDate || differenceInCalendarDays(endDate, startDate) <= 0) {
            setBookingError("Please select a valid date range.");
            return;
        }
        
        setIsBookingLoading(true);
        setBookingError('');
        setBookingSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/items/${item.id}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    start_date: format(startDate, 'yyyy-MM-dd'),
                    end_date: format(endDate, 'yyyy-MM-dd')
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to create booking.");
            }
            
            setBookingSuccess("Booking request sent successfully!");

        } catch (err) {
            setBookingError(err.message);
        } finally {
            setIsBookingLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /> <p className="ml-4 text-lg">Loading item details...</p></div>;
    }

    if (error) {
        return <div className="text-center py-20 text-red-500">{error}</div>;
    }

    if (!item) {
        return <div className="text-center py-20">Item not found.</div>;
    }

    const isOwner = currentUser && currentUser.id === item.owner_id;
    const totalDays = differenceInCalendarDays(dateState[0].endDate, dateState[0].startDate);
    const totalPrice = totalDays > 0 ? (totalDays * item.price_per_day).toFixed(2) : "0.00";

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/" className="flex items-center text-gray-600 hover:text-black mb-6">
                <ArrowLeft size={20} className="mr-2" /> Back to listings
            </Link>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Gallery */}
                <div>
                    <div className="aspect-square w-full bg-gray-100 rounded-2xl overflow-hidden mb-4">
                        <img 
                            src={item.image_url || `https://placehold.co/600x600/e2e8f0/334155?text=${encodeURIComponent(item.name)}`} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Thumbnail images could go here */}
                </div>

                {/* Item Info and Booking */}
                <div>
                    <div className="sticky top-24">
                        <h1 className="text-4xl font-bold mb-2">{item.name}</h1>
                        <div className="flex items-center space-x-4 text-gray-600 mb-4">
                            <div className="flex items-center">
                                <MapPin size={16} className="mr-1" />
                                <span>New York, NY</span>
                            </div>
                            <div className="flex items-center">
                                <Star size={16} className="mr-1 text-yellow-500" />
                                <span>4.8 (12 reviews)</span>
                            </div>
                        </div>

                        <p className="text-gray-700 leading-relaxed mb-6">{item.description}</p>
                        
                        {isOwner && (
                            <button 
                                onClick={() => onEditClick(item)} 
                                className="w-full mb-4 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Edit Your Listing
                            </button>
                        )}
                        
                        <div className="border rounded-2xl p-4">
                             <div className="flex justify-between items-baseline mb-4">
                                <p className="text-2xl font-bold">${item.price_per_day}<span className="text-base font-normal text-gray-600"> / day</span></p>
                            </div>

                            <p className="font-semibold mb-2 text-center">Select your rental dates</p>
                            <div className="flex justify-center">
                               <DateRange
                                    editableDateInputs={true}
                                    onChange={item => setDateState([item.selection])}
                                    moveRangeOnFirstSelection={false}
                                    ranges={dateState}
                                    minDate={new Date()}
                                    className="w-full"
                                />
                            </div>
                            
                            {totalDays > 0 && (
                                <div className="flex justify-between items-center my-4 text-lg">
                                    <p>Total for {totalDays} day(s):</p>
                                    <p className="font-bold">${totalPrice}</p>
                                </div>
                            )}

                            <button 
                                onClick={handleBooking}
                                disabled={isOwner || isBookingLoading}
                                className="w-full mt-2 bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                            >
                                {isBookingLoading && <Loader2 className="inline-block animate-spin mr-2" />}
                                {isOwner ? "This is your item" : "Request to Book"}
                            </button>

                            {bookingError && (
                                <div className="mt-4 flex items-center text-red-600">
                                    <AlertCircle size={16} className="mr-2" />
                                    <p className="text-sm">{bookingError}</p>
                                </div>
                            )}
                            {bookingSuccess && (
                                <div className="mt-4 text-green-600">
                                    <p className="text-sm font-semibold">{bookingSuccess}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

