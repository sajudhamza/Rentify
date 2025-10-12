import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, User, Edit, Loader2 } from 'lucide-react';

export const ItemDetailPage = ({ itemId, apiBaseUrl, onBack, currentUser, onEditClick }) => {
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItem = async () => {
            if (!itemId) return;
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${apiBaseUrl}/api/items/${itemId}`);
                if (!response.ok) {
                    throw new Error('Item not found or could not be loaded.');
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
    }, [itemId, apiBaseUrl]);

    if (loading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="h-12 w-12 animate-spin text-gray-500" /></div>;
    }

    if (error) {
        return (
            <div>
                 <button onClick={onBack} className="flex items-center text-gray-600 hover:text-black mb-8 font-semibold">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to all items
                </button>
                <div className="text-center text-red-500 py-20">{error}</div>
            </div>
        );
    }
    
    if (!item) {
         return <div className="text-center text-gray-500">Item could not be loaded.</div>;
    }

    const isOwner = currentUser && item && currentUser.id === item.owner_id;

    return (
        <div>
            <button onClick={onBack} className="flex items-center text-gray-600 hover:text-black mb-8 font-semibold">
                <ArrowLeft size={20} className="mr-2" />
                Back to all items
            </button>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                     <img
                        src={item.image_url || `https://placehold.co/600x600/e2e8f0/334155?text=${encodeURIComponent(item.name)}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div>
                    <h1 className="text-4xl font-bold mb-4">{item.name}</h1>
                    <p className="text-3xl font-semibold mb-6">${item.price_per_day} <span className="text-lg font-normal text-gray-500">/ day</span></p>
                    
                    <div className="prose max-w-none text-gray-700 mb-6">
                       <p>{item.description}</p>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-6">
                        <MapPin size={16} className="mr-2" />
                        <span>New York, NY</span>
                        <span className="mx-2">|</span>
                        <User size={16} className="mr-2" />
                        <span>Owner ID: {item.owner_id}</span>
                    </div>

                    <div className="flex space-x-4">
                         <button className="flex-1 bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                            Rent Now
                        </button>
                        {isOwner && (
                            <button 
                                onClick={() => onEditClick(item)} 
                                className="flex items-center justify-center bg-gray-200 text-gray-800 px-4 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                            >
                                <Edit size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

