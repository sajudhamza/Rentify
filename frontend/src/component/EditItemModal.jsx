import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';

export const EditItemModal = ({ isOpen, onClose, item, onItemUpdated, apiBaseUrl, token }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price_per_day: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name,
                description: item.description,
                price_per_day: item.price_per_day,
            });
        }
    }, [item]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateItem = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!token) {
            setError('Authentication error. Please log in again.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/api/items/${item.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    price_per_day: parseFloat(formData.price_per_day),
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to update item.');
            }
            
            const updatedItem = await response.json();
            onItemUpdated(updatedItem);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-center mb-6">Edit Your Item</h2>
                    
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-center">
                            <AlertCircle size={20} className="mr-2"/>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleUpdateItem} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Item Name</label>
                            <input type="text" name="name" id="name" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" value={formData.name} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">Description</label>
                            <textarea name="description" id="description" required rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" value={formData.description} onChange={handleInputChange}></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="price_per_day">Price per day ($)</label>
                            <input type="number" name="price_per_day" id="price_per_day" required min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" value={formData.price_per_day} onChange={handleInputChange} />
                        </div>
                        
                        <div className="pt-4">
                            <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex justify-center items-center">
                                {loading ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

