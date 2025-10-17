import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Upload } from 'lucide-react';

export const EditItemModal = ({ isOpen, onClose, item, onItemUpdated, apiBaseUrl, token }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price_per_day: '',
        category_id: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        is_available: true,
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                description: item.description || '',
                price_per_day: item.price_per_day || '',
                category_id: item.category_id || '',
                address: item.address || '',
                city: item.city || '',
                state: item.state || '',
                zip_code: item.zip_code || '',
                is_available: item.is_available,
            });
            setImagePreview(item.image_url ? `${apiBaseUrl}${item.image_url}` : '');
            setImageFile(null); // Reset file input on new item
        }
        
        // Fetch categories when the modal opens with an item
        if (isOpen) {
            const fetchCategories = async () => {
                try {
                    const response = await fetch(`${apiBaseUrl}/api/categories/`);
                    if (!response.ok) throw new Error('Could not fetch categories.');
                    setCategories(await response.json());
                } catch (err) {
                    setError('Failed to load categories.');
                }
            };
            fetchCategories();
        }

    }, [item, isOpen, apiBaseUrl]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
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

        const data = new FormData();
        // Append all form fields, ensuring they are not null or undefined
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key]);
            }
        });

        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            const response = await fetch(`${apiBaseUrl}/api/items/${item.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data, // Send as FormData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to update item.');
            }
            
            const updatedItem = await response.json();
            onItemUpdated(updatedItem); // This will trigger the data refresh in App.jsx

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
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
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Item Image</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-24 object-cover rounded-md" />
                                    ) : (
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    )}
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-gray-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-black">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="image" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Item Name</label>
                            <input type="text" name="name" id="name" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" value={formData.name} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">Description</label>
                            <textarea name="description" id="description" required rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" value={formData.description} onChange={handleInputChange}></textarea>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="price_per_day">Price per day ($)</label>
                                <input type="number" name="price_per_day" id="price_per_day" required min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" value={formData.price_per_day} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category_id">Category</label>
                                <select name="category_id" id="category_id" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white" value={formData.category_id} onChange={handleInputChange}>
                                    <option value="" disabled>Select a category</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                        </div>
                        
                        {/* Location Fields */}
                         <div>
                            <h3 className="text-md font-medium text-gray-900 mb-2">Item Location</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">Address</label>
                                    <input type="text" name="address" id="address" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" value={formData.address} onChange={handleInputChange} />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="city">City</label>
                                        <input type="text" name="city" id="city" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" value={formData.city} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="state">State</label>
                                        <input type="text" name="state" id="state" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" value={formData.state} onChange={handleInputChange} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="zip_code">Zip Code</label>
                                        <input type="text" name="zip_code" id="zip_code" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" value={formData.zip_code} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>
                        </div>

                         <div className="flex items-center">
                            <input
                                id="is_available"
                                name="is_available"
                                type="checkbox"
                                checked={formData.is_available}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                            />
                            <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">
                                This item is available for rent
                            </label>
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

