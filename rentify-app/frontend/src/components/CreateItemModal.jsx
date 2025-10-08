import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const CreateItemModal = ({ isOpen, onClose, apiBaseUrl, currentUser, onItemCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [pricePerDay, setPricePerDay] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch categories when the modal opens
    useEffect(() => {
        if (isOpen) {
            const fetchCategories = async () => {
                try {
                    const response = await fetch(`${apiBaseUrl}/api/categories/`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch categories');
                    }
                    const data = await response.json();
                    setCategories(data);
                    if (data.length > 0) {
                        setCategoryId(data[0].id); // Default to the first category
                    }
                } catch (err) {
                    setError(err.message);
                }
            };
            fetchCategories();
        }
    }, [isOpen, apiBaseUrl]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            setError("You must be logged in to list an item.");
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${apiBaseUrl}/api/items/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    price_per_day: parseFloat(pricePerDay),
                    category_id: parseInt(categoryId),
                    owner_id: currentUser.id,
                    image_url: imageUrl || null,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to create item');
            }
            onItemCreated(data); // Pass the new item up to the parent
            onClose(); // Close the modal on success
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg m-4 relative transform transition-all duration-300 ease-in-out"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-center mb-6">List a New Item</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="item-name">Item Name</label>
                            <input id="item-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" required />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="item-description">Description</label>
                            <textarea id="item-description" value={description} onChange={e => setDescription(e.target.value)} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="price">Price per day ($)</label>
                                <input id="price" type="number" value={pricePerDay} onChange={e => setPricePerDay(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" required step="0.01" min="0" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">Category</label>
                                <select id="category" value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white" required>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="image-url">Image URL (Optional)</label>
                            <input id="image-url" type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="https://example.com/image.png" />
                        </div>

                        <div className="pt-2">
                             <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400" disabled={loading}>
                                {loading ? 'Listing Item...' : 'List My Item'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
