import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';

export const CreateItemModal = ({ isOpen, onClose, apiBaseUrl, onItemCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [pricePerDay, setPricePerDay] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Fetch categories when modal opens
            const fetchCategories = async () => {
                try {
                    const response = await fetch(`${apiBaseUrl}/api/categories/`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch categories');
                    }
                    const data = await response.json();
                    setCategories(data);
                    if (data.length > 0) {
                        setCategoryId(data[0].id);
                    }
                } catch (err) {
                    setError('Could not load categories.');
                }
            };
            fetchCategories();
        }
    }, [isOpen, apiBaseUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to list an item.');
            setLoading(false);
            return;
        }

        const itemData = {
            name,
            description,
            price_per_day: parseFloat(pricePerDay),
            category_id: parseInt(categoryId),
            image_url: imageUrl || null,
            is_available: true,
        };

        try {
            const response = await fetch(`${apiBaseUrl}/api/items/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(itemData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create item.');
            }

            const newItem = await response.json();
            onItemCreated(newItem);
            handleClose();

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setName('');
        setDescription('');
        setPricePerDay('');
        setCategoryId(categories.length > 0 ? categories[0].id : '');
        setImageUrl('');
        setError('');
        setLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">List a New Item</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Item Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                            required
                        />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="pricePerDay" className="block text-sm font-medium text-gray-700">Price per Day ($)</label>
                            <input
                                type="number"
                                id="pricePerDay"
                                value={pricePerDay}
                                onChange={(e) => setPricePerDay(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                required
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                id="category"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                required
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
                        <input
                            type="text"
                            id="imageUrl"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-sm text-red-800 rounded-lg p-3 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 flex justify-center items-center transition-colors"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'List Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

