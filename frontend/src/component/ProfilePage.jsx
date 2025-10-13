import React, { useState, useEffect } from 'react';
import { Loader2, Package, List, BookOpen, User } from 'lucide-react';
import { ProductCard } from './ProductCard.jsx';

export const ProfilePage = ({ apiBaseUrl, currentUser, token, dataVersion }) => {
    const [activeTab, setActiveTab] = useState('listings');
    const [listings, setListings] = useState([]);
    const [rentals, setRentals] = useState([]);
    const [bookingRequests, setBookingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser || !token) {
                setLoading(false);
                return;
            };

            setLoading(true);
            setError(null);

            try {
                const headers = { 'Authorization': `Bearer ${token}` };
                
                const [listingsRes, rentalsRes, requestsRes] = await Promise.all([
                    fetch(`${apiBaseUrl}/api/users/${currentUser.id}/items`, { headers }),
                    fetch(`${apiBaseUrl}/api/my-bookings`, { headers }),
                    fetch(`${apiBaseUrl}/api/my-listings/bookings`, { headers })
                ]);

                if (!listingsRes.ok) throw new Error('Failed to fetch your listings.');
                if (!rentalsRes.ok) throw new Error('Failed to fetch your rentals.');
                if (!requestsRes.ok) throw new Error('Failed to fetch booking requests.');
                
                setListings(await listingsRes.json());
                setRentals(await rentalsRes.json());
                setBookingRequests(await requestsRes.json());

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser, token, apiBaseUrl, dataVersion]);
    
    const handleBookingStatusUpdate = async (bookingId, newStatus) => {
        try {
            const response = await fetch(`${apiBaseUrl}/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (!response.ok) throw new Error('Failed to update booking status.');
            
            // Refresh data by updating the state
            setBookingRequests(prev => prev.map(b => b.id === bookingId ? {...b, status: newStatus} : b));

        } catch (err) {
            alert(err.message);
        }
    };


    const renderContent = () => {
        if (loading) return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
        if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
        if (!currentUser) return <div className="text-center p-10 text-gray-500">Please log in to view your profile.</div>;

        switch(activeTab) {
            case 'listings':
                return listings.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {listings.map(item => <ProductCard key={item.id} item={item} />)}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl">
                           <Package className="mx-auto h-12 w-12 text-gray-400" />
                           <h3 className="mt-2 text-xl font-semibold text-gray-900">No listings yet</h3>
                           <p className="mt-1 text-gray-500">You haven't listed any items for rent.</p>
                    </div>
                );
            
            case 'rentals':
                 return rentals.length > 0 ? (
                    <div className="space-y-4 max-w-2xl mx-auto">
                        {rentals.map(booking => (
                            <div key={booking.id} className="p-4 border rounded-lg flex justify-between items-center bg-white shadow-sm">
                                <div>
                                    <p className="font-semibold text-lg">{booking.item.name}</p>
                                    <p className="text-sm text-gray-500">
                                        Rented from: <span className="font-medium">{new Date(booking.start_date).toLocaleDateString()}</span> to <span className="font-medium">{new Date(booking.end_date).toLocaleDateString()}</span>
                                    </p>
                                    <p className="text-sm text-gray-500">Total Price: ${booking.total_price}</p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                    'bg-red-100 text-red-800'
                                }`}>{booking.status}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-10 bg-gray-50 rounded-2xl">
                           <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                           <h3 className="mt-2 text-xl font-semibold text-gray-900">No rentals yet</h3>
                           <p className="mt-1 text-gray-500">You haven't rented any items.</p>
                    </div>
                );

            case 'requests':
                return bookingRequests.length > 0 ? (
                    <div className="space-y-4 max-w-2xl mx-auto">
                        {bookingRequests.map(req => (
                            <div key={req.id} className="p-4 border rounded-lg bg-white shadow-sm">
                                <p className="font-semibold text-lg">{req.item.name}</p>
                                <p className="text-sm text-gray-500">Requested by: <span className="font-medium">{req.renter.username}</span></p>
                                <p className="text-sm text-gray-500">
                                    Dates: <span className="font-medium">{new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}</span>
                                </p>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                                        req.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                        req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>{req.status}</span>
                                    {req.status === 'pending' && (
                                        <div className="space-x-2">
                                            <button onClick={() => handleBookingStatusUpdate(req.id, 'confirmed')} className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold transition-colors">Approve</button>
                                            <button onClick={() => handleBookingStatusUpdate(req.id, 'cancelled')} className="px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold transition-colors">Deny</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl">
                           <User className="mx-auto h-12 w-12 text-gray-400" />
                           <h3 className="mt-2 text-xl font-semibold text-gray-900">No booking requests</h3>
                           <p className="mt-1 text-gray-500">You have no pending rental requests for your items.</p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>
            <div className="flex border-b mb-6">
                <button onClick={() => setActiveTab('listings')} className={`px-4 py-2 flex items-center gap-2 ${activeTab === 'listings' ? 'border-b-2 border-black font-semibold text-black' : 'text-gray-500 hover:text-black'}`}><List className="h-5 w-5" /> My Listings</button>
                <button onClick={() => setActiveTab('rentals')} className={`px-4 py-2 flex items-center gap-2 ${activeTab === 'rentals' ? 'border-b-2 border-black font-semibold text-black' : 'text-gray-500 hover:text-black'}`}><BookOpen className="h-5 w-5" /> My Rentals</button>
                <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 flex items-center gap-2 ${activeTab === 'requests' ? 'border-b-2 border-black font-semibold text-black' : 'text-gray-500 hover:text-black'}`}><User className="h-5 w-5" /> Booking Requests</button>
            </div>
            {renderContent()}
        </div>
    );
};

