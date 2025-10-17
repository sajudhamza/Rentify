import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, Package, Calendar, ArrowRight, Check, X as XIcon } from 'lucide-react';
import { ProductCard } from './ProductCard'; 

const API_BASE_URL = 'http://localhost:8000';

export const ProfilePage = ({ currentUser, token, dataVersion }) => {
  const [activeTab, setActiveTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [myRentals, setMyRentals] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser || !token) {
      setLoading(false);
      setError("You must be logged in to view this page.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [listingsRes, rentalsRes, requestsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/users/${currentUser.id}/items`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/api/my-bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/api/my-listings/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (!listingsRes.ok) throw new Error('Failed to fetch your listings.');
        if (!rentalsRes.ok) throw new Error('Failed to fetch your rentals.');
        if (!requestsRes.ok) throw new Error('Failed to fetch booking requests.');

        setListings(await listingsRes.json());
        setMyRentals(await rentalsRes.json());
        setBookingRequests(await requestsRes.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, token, dataVersion]);

  const handleBookingStatusUpdate = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to ${newStatus} booking.`);
      }

      // Update the booking status in state
      setBookingRequests(prev =>
        prev.map(req =>
          req.id === bookingId ? { ...req, status: newStatus } : req
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-10 w-10 text-black" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">An Error Occurred</h2>
        <p className="mt-2 text-gray-600">{error}</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'listings':
        return <UserListings items={listings} />;
      case 'rentals':
        return <UserRentals bookings={myRentals} />;
      case 'requests':
        return <BookingRequests requests={bookingRequests} onUpdateStatus={handleBookingStatusUpdate} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="border-b mb-6">
        <nav className="-mb-px flex space-x-6">
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'listings'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Listings
          </button>
          <button
            onClick={() => setActiveTab('rentals')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rentals'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Rentals
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Booking Requests
          </button>
        </nav>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
};

// ---------- Sub-components ----------

const UserListings = ({ items }) => {
  if (items.length === 0) {
    return <EmptyState title="You haven't listed any items yet" message="When you list an item, it will appear here." />;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
      {items.map(item => <ProductCard key={item.id} item={item} />)}
    </div>
  );
};

const UserRentals = ({ bookings }) => {
  if (bookings.length === 0) {
    return <EmptyState title="You haven't rented any items" message="Your past and upcoming rentals will appear here." />;
  }
  return <BookingList bookings={bookings} />;
};

const BookingRequests = ({ requests, onUpdateStatus }) => {
  if (requests.length === 0) {
    return <EmptyState title="No booking requests" message="When someone requests to rent one of your items, it will appear here." />;
  }
  return <BookingList bookings={requests} isOwnerView={true} onUpdateStatus={onUpdateStatus} />;
};

const BookingList = ({ bookings, isOwnerView = false, onUpdateStatus }) => (
  <div className="space-y-4">
    {bookings.map(booking => {
      const item = booking.item || {};
      const itemId = item.id || booking.item_id;
      const imageUrl = item.image_url
        ? `${API_BASE_URL}${item.image_url}`
        : `https://placehold.co/400x400/e2e8f0/334155?text=No+Image`;

      return (
        <div key={booking.id} className="bg-gray-50 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to={itemId ? `/item/${itemId}` : "#"}>
              <img
                src={imageUrl}
                alt={item.name || "Unknown Item"}
                className="w-20 h-20 object-cover rounded-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/400x400/e2e8f0/334155?text=No+Image`;
                }}
              />
            </Link>
            <div>
              <Link
                to={itemId ? `/item/${itemId}` : "#"}
                className="font-bold hover:underline"
              >
                {item.name || "Unknown Item"}
              </Link>
              <p className="text-sm text-gray-600 flex items-center">
                <Calendar size={14} className="mr-2" />
                {new Date(booking.start_date).toLocaleDateString()}
                <ArrowRight size={14} className="mx-2" />
                {new Date(booking.end_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">Total: ${booking.total_price.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyles[booking.status] || statusStyles.default}`}>
              {booking.status.toUpperCase()}
            </span>
            {isOwnerView && booking.status === 'pending' && (
              <>
                <button onClick={() => onUpdateStatus(booking.id, 'confirmed')} className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200"><Check size={16} /></button>
                <button onClick={() => onUpdateStatus(booking.id, 'cancelled')} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"><XIcon size={16} /></button>
              </>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

const EmptyState = ({ title, message }) => (
  <div className="text-center py-16 bg-gray-50 rounded-lg">
    <Package className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-4 text-xl font-semibold text-gray-900">{title}</h3>
    <p className="mt-2 text-gray-500">{message}</p>
  </div>
);

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  default: 'bg-gray-100 text-gray-800',
};
