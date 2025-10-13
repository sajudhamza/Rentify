// import React, { useState, useEffect } from 'react';
// import { X, Loader2, AlertCircle, UploadCloud } from 'lucide-react';

// export const CreateItemModal = ({ isOpen, onClose, onItemCreated, apiBaseUrl, token, currentLocation }) => {
//     const [name, setName] = useState('');
//     const [description, setDescription] = useState('');
//     const [pricePerDay, setPricePerDay] = useState('');
//     const [categoryId, setCategoryId] = useState('');
//     const [imageFile, setImageFile] = useState(null);
//     const [imagePreview, setImagePreview] = useState('');
    
//     // Location state
//     const [address, setAddress] = useState('');
//     const [city, setCity] = useState('');
//     const [state, setState] = useState('');
//     const [zipCode, setZipCode] = useState('');
    
//     const [categories, setCategories] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         if (isOpen) {
//             // Reset form fields to their initial state
//             setName('');
//             setDescription('');
//             setPricePerDay('');
//             setImageFile(null);
//             setImagePreview('');
//             setAddress('');
//             setError('');
//             setLoading(false);

//             // Pre-fill location from props
//             if (currentLocation) {
//                 setCity(currentLocation.city || '');
//                 setState(currentLocation.state || '');
//                 setZipCode(currentLocation.zip || '');
//             } else {
//                 setCity('');
//                 setState('');
//                 setZipCode('');
//             }

//             const fetchCategories = async () => {
//                 try {
//                     const response = await fetch(`${apiBaseUrl}/api/categories/`);
//                     if (!response.ok) throw new Error('Failed to fetch categories');
//                     const data = await response.json();
//                     setCategories(data);
//                     // Set default category after fetching
//                     if (data.length > 0) {
//                         setCategoryId(data[0].id);
//                     } else {
//                         setCategoryId('');
//                     }
//                 } catch (err) {
//                     setError('Could not load categories.');
//                 }
//             };
//             fetchCategories();
//         }
//     }, [isOpen, apiBaseUrl, currentLocation]);

//     const handleImageChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setImageFile(file);
//             setImagePreview(URL.createObjectURL(file));
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');

//         if (!token) {
//             setError('You must be logged in to list an item.');
//             setLoading(false);
//             return;
//         }

//         const formData = new FormData();
        
//         formData.append('name', name);
//         formData.append('description', description);
//         formData.append('price_per_day', parseFloat(pricePerDay));
//         formData.append('category_id', parseInt(categoryId));
//         formData.append('address', address);
//         formData.append('item_city', city);
//         formData.append('item_state', state);
//         formData.append('item_zip', zipCode);

//         if (imageFile) {
//             formData.append('file', imageFile);
//         }

//         try {
//             const response = await fetch(`${apiBaseUrl}/api/items/`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 if (response.status === 422) {
//                     const errorDetails = errorData.detail.map(err => `${err.loc[1]}: ${err.msg}`).join(', ');
//                     throw new Error(`Validation Error: ${errorDetails}`);
//                 }
//                 throw new Error(errorData.detail || 'Failed to create item.');
//             }

//             onItemCreated();

//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };
    
//     const handleClose = () => {
//         onClose();
//     };


//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
//             <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//                 <div className="p-8">
//                     <div className="flex justify-between items-center mb-6">
//                         <h2 className="text-2xl font-bold">List a New Item</h2>
//                         <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
//                             <X size={24} />
//                         </button>
//                     </div>

//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         {/* Item Details Section */}
//                         <div>
//                             <label htmlFor="name" className="block text-sm font-medium text-gray-700">Item Name</label>
//                             <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required />
//                         </div>
//                         <div>
//                             <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
//                             <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required />
//                         </div>
//                         <div className="grid grid-cols-2 gap-4">
//                             <div>
//                                 <label htmlFor="pricePerDay" className="block text-sm font-medium text-gray-700">Price per Day ($)</label>
//                                 <input type="number" id="pricePerDay" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required step="0.01" min="0" />
//                             </div>
//                             <div>
//                                 <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
//                                 <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required>
//                                     {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
//                                 </select>
//                             </div>
//                         </div>

//                         {/* Image Upload Section */}
//                         <div>
//                            <label className="block text-sm font-medium text-gray-700 mb-2">Item Image</label>
//                             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
//                                 <div className="space-y-1 text-center">
//                                     {imagePreview ? (
//                                         <img src={imagePreview} alt="Item preview" className="mx-auto h-24 w-auto object-cover rounded-md" />
//                                     ) : (
//                                         <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
//                                     )}
//                                     <div className="flex text-sm text-gray-600">
//                                         <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-gray-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-black">
//                                             <span>Upload a file</span>
//                                             <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
//                                         </label>
//                                         <p className="pl-1">or drag and drop</p>
//                                     </div>
//                                     <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Location Section */}
//                         <div className="space-y-4 pt-2">
//                              <h3 className="text-lg font-medium text-gray-900">Item Location</h3>
//                              <div>
//                                 <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address (Optional)</label>
//                                 <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" />
//                             </div>
//                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                                 <div>
//                                     <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
//                                     <input type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required />
//                                 </div>
//                                 <div>
//                                     <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
//                                     <input type="text" id="state" value={state} onChange={(e) => setState(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required />
//                                 </div>
//                                 <div>
//                                     <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip Code</label>
//                                     <input type="text" id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required />
//                                 </div>
//                             </div>
//                         </div>

//                         {error && (
//                             <div className="bg-red-50 border border-red-200 text-sm text-red-800 rounded-lg p-3 flex items-center">
//                                 <AlertCircle className="h-4 w-4 mr-2" />
//                                 <span>{error}</span>
//                             </div>
//                         )}

//                         <div className="flex justify-end pt-4">
//                             <button
//                                 type="submit"
//                                 disabled={loading}
//                                 className="w-full bg-black text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 flex justify-center items-center transition-colors"
//                             >
//                                 {loading ? <Loader2 className="animate-spin" /> : 'List Item'}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// };

import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, UploadCloud } from 'lucide-react';

export const CreateItemModal = ({ isOpen, onClose, onItemCreated, apiBaseUrl, token, currentLocation }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price_per_day: '',
        category_id: '',
        city: '',
        state: '',
        zip_code: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset form but pre-fill location
            setFormData({
                name: '',
                description: '',
                price_per_day: '',
                category_id: '',
                city: currentLocation?.city || '',
                state: currentLocation?.state || '',
                zip_code: currentLocation?.zip || '',
            });
            setImageFile(null);
            setImagePreview('');
            setError('');

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
                        setFormData(prev => ({ ...prev, category_id: data[0].id }));
                    }
                } catch (err) {
                    setError('Could not load categories.');
                }
            };
            fetchCategories();
        }
    }, [isOpen, apiBaseUrl, currentLocation]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!token) {
            setError('You must be logged in to list an item.');
            setLoading(false);
            return;
        }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price_per_day', parseFloat(formData.price_per_day));
        data.append('category_id', parseInt(formData.category_id));
        data.append('city', formData.city);
        data.append('state', formData.state);
        data.append('zip_code', formData.zip_code);
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            const response = await fetch(`${apiBaseUrl}/api/items/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Handle complex validation errors from FastAPI
                if (errorData.detail && Array.isArray(errorData.detail)) {
                     const errorMsg = errorData.detail.map(err => `${err.loc[1]}: ${err.msg}`).join(', ');
                     throw new Error(errorMsg);
                }
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
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">List a New Item</h2>
                        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Item Name</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Item Image</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-auto rounded-md" />
                                    ) : (
                                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                    )}
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-gray-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-black">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="price_per_day" className="block text-sm font-medium text-gray-700">Price per Day ($)</label>
                                <input type="number" id="price_per_day" name="price_per_day" value={formData.price_per_day} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required step="0.01" min="0" />
                            </div>
                            <div>
                                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Category</label>
                                <select id="category_id" name="category_id" value={formData.category_id} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Item Location</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required />
                                <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required />
                                <input type="text" name="zip_code" value={formData.zip_code} onChange={handleInputChange} placeholder="Zip Code" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required />
                            </div>
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
        </div>
    );
};

