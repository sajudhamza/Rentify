import React from 'react';
import { Link } from 'react-router-dom';

// This should match the base URL of your backend API
const API_BASE_URL = 'http://localhost:8000';

export const ProductCard = ({ item }) => {
    // Construct the full image URL. If the item has a relative image_url from the backend,
    // prepend the API base URL. Otherwise, use a placeholder.
    const imageUrl = item.image_url 
        ? `${API_BASE_URL}${item.image_url}` 
        : `https://placehold.co/400x400/e2e8f0/334155?text=${encodeURIComponent(item.name)}`;

    return (
        <Link to={`/item/${item.id}`} className="group">
            <div className="aspect-square w-full bg-gray-100 rounded-2xl overflow-hidden">
                <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    // Add an error handler for broken image links
                    onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/400x400/e2e8f0/334155?text=Image+not+found`; }}
                />
            </div>
            <div className="mt-3">
                <h4 className="font-semibold text-lg truncate">{item.name}</h4>
                <p className="text-gray-600">${item.price_per_day} / day</p>
                {/* Display the new location fields */}
                <p className="text-sm text-gray-500">{`${item.item_city || item.city}, ${item.item_state || item.state}`}</p>
            </div>
        </Link>
    );
};

