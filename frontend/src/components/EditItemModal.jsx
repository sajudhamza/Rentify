import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

export const EditItemModal = ({ isOpen, onClose, apiBaseUrl, item, categories, onItemUpdated }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price_per_day: '',
        category_id: '',
        image_url: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // When the 'item' prop changes (i.e., when the modal is opened for a new item),
    // update the form data to reflect that item's details.
    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                description: item.description || '',
                price_per_day: item.price_per_day || '',
                category_id: item.category_id || '',
                image_url: item.image_url || '',
            });
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Prepare only the fields that have changed.
        const payload = {};
        for (const key in formData) {
            // Check against original item's value, handle type differences
            if (String(formData[key]) !== String(item[key])) {
                 payload[key] = formData[key];
            }
        }
        
        // Ensure numeric types are sent correctly if they changed
        if (payload.price_per_day) {
            payload.price_per_day = parseFloat(payload.price_per_day);
        }
         if (payload.category_id) {
            payload.category_id = parseInt(payload.category_id, 10);
        }


        if (Object.keys(payload).length === 0) {
            setError("No changes were made.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/api/items/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to update item.');
            }
            
            const updatedItem = await response.json();
            onItemUpdated(updatedItem); // Pass the full updated item back

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">Edit Item</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</p>}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Item Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} required rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"></textarea>
                    </div>
                    <div>
                        <label htmlFor="price_per_day" className="block text-sm font-medium text-gray-700">Price per day ($)</label>
                        <input type="number" name="price_per_day" id="price_per_day" value={formData.price_per_day} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" />
                    </div>
                    <div>
                        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Category</label>
                        <select name="category_id" id="category_id" value={formData.category_id} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black">
                            <option value="">Select a category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
                        <input type="text" name="image_url" id="image_url" value={formData.image_url} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} className="mr-3 py-2 px-4 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={loading} className="py-2 px-4 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:bg-gray-400 flex items-center">
                            {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

