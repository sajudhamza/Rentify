import React, { useState, useEffect } from 'react';
import { Package, Loader2, ArrowLeft } from 'lucide-react';

const ProductCard = ({ item, onCardClick }) => (
    <div className="group flex flex-col cursor-pointer" onClick={() => onCardClick(item)}>
        <div className="aspect-square w-full bg-gray-100 rounded-2xl overflow-hidden">
            <img
                src={item.image_url || `https://placehold.co/400x400/e2e8f0/334155?text=${encodeURIComponent(item.name)}`}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
        </div>
        <div className="mt-3 flex-grow">
            <h4 className="font-semibold text-lg truncate">{item.name}</h4>
            <p className="text-gray-600">${item.price_per_day} / day</p>
        </div>
         <button className="w-full mt-2 bg-gray-200 text-gray-800 py-2.5 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200 pointer-events-none">
            View Details
        </button>
    </div>
);


export const MyItemsPage = ({ apiBaseUrl, currentUser, onBack, onCardClick }) => {
    const [myItems, setMyItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            setError("You must be logged in to see your items.");
            setLoading(false);
            return;
        }

        const fetchMyItems = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${apiBaseUrl}/api/users/${currentUser.id}/items`);
                if (!response.ok) {
                    throw new Error('Failed to fetch your items.');
                }
                const data = await response.json();
                setMyItems(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMyItems();
    }, [currentUser, apiBaseUrl]);

    return (
        <div>
            <div className="flex items-center mb-8">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 mr-4">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-3xl font-bold">My Listed Items</h2>
            </div>
            
            {loading && (
                 <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
                 </div>
            )}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!loading && !error && myItems.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-2xl">
                   <Package className="mx-auto h-16 w-16 text-gray-400" />
                   <h3 className="mt-4 text-2xl font-semibold text-gray-900">You haven't listed any items yet</h3>
                   <p className="mt-2 text-gray-500">Click "List an Item" to get started.</p>
               </div>
            )}

            {!loading && !error && myItems.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {myItems.map(item => (
                        <ProductCard key={item.id} item={item} onCardClick={onCardClick} />
                    ))}
                </div>
            )}
        </div>
    );
};

