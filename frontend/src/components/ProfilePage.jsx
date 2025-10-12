import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Book, User, Loader2, Check, X } from 'lucide-react';
import { format } from 'date-fns';

const API_BASE_URL = 'http://localhost:8000';

const ProductCard = ({ item, onCardClick }) => (
    <div onClick={() => onCardClick(item.id)} className="group cursor-pointer">
        <div className="aspect-square w-full bg-gray-100 rounded-2xl overflow-hidden">
            <img
                src={item.image_url || `https://placehold.co/400x400/e2e8f0/334155?text=${encodeURIComponent(item.name)}`}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
        </div>
        <div className="mt-3">
            <h4 className="font-semibold text-lg truncate">{item.name}</h4>
            <p className="text-gray-600">${item.price_per_day} / day</p>
        </div>
    </div>
);

export const ProfilePage = ({ currentUser, onNavigate }) => {
    const [activeTab, setActiveTab] = useState('listings');
    const [userItems, setUserItems] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [bookingRequests, setBookingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser) return;

        const fetchData = async (endpoint, setter) => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${endpoint}`);
                }
                const data = await response.json();
                setter(data);
            } catch (err) {
                console.error(err);
                setError(`Could not fetch data for ${endpoint}.`);
            }
        };

        const loadAllData = async () => {
            setLoading(true);
            setError(null);
            await Promise.all([
                fetchData(`users/${currentUser.id}/items`, setUserItems),
                fetchData('my-bookings', setMyBookings),
                fetchData('my-listings/bookings', setBookingRequests)
            ]);
            setLoading(false);
        };

        loadAllData();
    }, [currentUser]);

    const handleUpdateBookingStatus = async (bookingId, status) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) throw new Error('Failed to update booking status.');

            const updatedBooking = await response.json();
            setBookingRequests(prev => prev.map(b => b.id === bookingId ? updatedBooking : b));

        } catch (err) {
            console.error("Update booking error:", err);
            // Optionally set an error state to show in the UI
        }
    };


    const renderContent = () => {
        if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;
        if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

        switch (activeTab) {
            case 'listings':
                return userItems.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {userItems.map(item => <ProductCard key={item.id} item={item} onCardClick={onNavigate} />)}
                    </div>
                ) : <p>You haven't listed any items yet.</p>;

            case 'rentals':
                return myBookings.length > 0 ? (
                    <div className="space-y-4">
                        {myBookings.map(booking => (
                            <div key={booking.id} className="bg-white p-4 rounded-lg border flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{booking.item.name}</p>
                                    <p className="text-sm text-gray-600">
                                        {format(new Date(booking.start_date), 'MMM dd, yyyy')} - {format(new Date(booking.end_date), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : <p>You haven't rented any items yet.</p>;

            case 'requests':
                 return bookingRequests.length > 0 ? (
                    <div className="space-y-4">
                        {bookingRequests.map(req => (
                            <div key={req.id} className="bg-white p-4 rounded-lg border">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{req.item.name}</p>
                                        <p className="text-sm text-gray-600">Renter: {req.renter.username}</p>
                                        <p className="text-sm text-gray-600">
                                            {format(new Date(req.start_date), 'MMM dd')} - {format(new Date(req.end_date), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">${req.total_price.toFixed(2)}</p>
                                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                            req.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                            req.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                </div>
                                {req.status === 'pending' && (
                                    <div className="flex items-center space-x-2 mt-4">
                                        <button onClick={() => handleUpdateBookingStatus(req.id, 'confirmed')} className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center justify-center"><Check size={16} className="mr-1"/> Approve</button>
                                        <button onClick={() => handleUpdateBookingStatus(req.id, 'cancelled')} className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center justify-center"><X size={16} className="mr-1"/> Deny</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : <p>You have no pending booking requests.</p>;

            case 'profile':
                return <p>Profile editing form will be here.</p>;
            default:
                return null;
        }
    };

    if (!currentUser) {
        return <div className="text-center py-20">Please log in to view your profile.</div>;
    }

    const tabs = [
        { id: 'listings', name: 'My Listings', icon: Package },
        { id: 'rentals', name: 'My Rentals', icon: Book },
        { id: 'requests', name: 'Booking Requests', icon: Book },
        { id: 'profile', name: 'Edit Profile', icon: User },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-1/4">
                    <nav className="space-y-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${activeTab === tab.id ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                            >
                                <tab.icon size={20} className="mr-3" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

