import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, UploadCloud } from 'lucide-react';
import { DateRange, Calendar } from 'react-date-range';
import { addYears, isSaturday, isSunday, format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export const CreateItemModal = ({ isOpen, onClose, onItemCreated, apiBaseUrl, token, currentLocation }) => {
    // State for each form field for better control
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [pricePerDay, setPricePerDay] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    
    // Location state
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');

    // Availability state
    const [availability, setAvailability] = useState([
        {
            startDate: new Date(),
            endDate: addYears(new Date(), 1),
            key: 'selection'
        }
    ]);
    const [availabilityRule, setAvailabilityRule] = useState('all_days');
    const [blockedDates, setBlockedDates] = useState([]);
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset all form fields when the modal opens
            setName('');
            setDescription('');
            setPricePerDay('');
            setImageFile(null);
            setImagePreview('');
            setAddress('');
            setError('');
            setLoading(false);
            setAvailability([
                {
                    startDate: new Date(),
                    endDate: addYears(new Date(), 1),
                    key: 'selection'
                }
            ]);
            setAvailabilityRule('all_days');
            setBlockedDates([]);

            // Pre-fill location from props
            if (currentLocation) {
                setCity(currentLocation.city || '');
                setState(currentLocation.state || '');
                setZipCode(currentLocation.zip || '');
            } else {
                setCity('');
                setState('');
                setZipCode('');
            }

            // Fetch categories for the dropdown
            const fetchCategories = async () => {
                try {
                    const response = await fetch(`${apiBaseUrl}/api/categories/`);
                    if (!response.ok) throw new Error('Failed to fetch categories');
                    const data = await response.json();
                    setCategories(data);
                    // Set a default category after fetching
                    if (data.length > 0) {
                        setCategoryId(data[0].id);
                    } else {
                        setCategoryId('');
                    }
                } catch (err) {
                    setError('Could not load categories.');
                }
            };
            fetchCategories();
        }
    }, [isOpen, apiBaseUrl, currentLocation]);
    
    // ** NEW: Effect to clean up blocked dates if the main range changes **
    useEffect(() => {
        const { startDate, endDate } = availability[0];
        if (startDate && endDate) {
            setBlockedDates(prev => prev.filter(date => date >= startDate && date <= endDate));
        }
    }, [availability]);


    const handleImageChange = (e) => {
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
        
        data.append('name', name);
        data.append('description', description);
        data.append('price_per_day', parseFloat(pricePerDay));
        data.append('category_id', parseInt(categoryId));
        data.append('address', address);
        data.append('city', city);
        data.append('state', state);
        data.append('zip_code', zipCode);

        if (availability[0].startDate) {
            data.append('available_from', availability[0].startDate.toISOString().split('T')[0]);
        }
        if (availability[0].endDate) {
            data.append('available_to', availability[0].endDate.toISOString().split('T')[0]);
        }
        
        data.append('availability_rule', availabilityRule);

        const formattedBlockedDates = blockedDates.map(date => format(date, 'yyyy-MM-dd'));
        data.append('disabled_dates', JSON.stringify(formattedBlockedDates));

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
                if (response.status === 422) {
                    const errorDetails = errorData.detail.map(err => `${err.loc.join(' > ')}: ${err.msg}`).join(', ');
                    throw new Error(`Validation Error: ${errorDetails}`);
                }
                throw new Error(errorData.detail || 'Failed to create item.');
            }

            const newItem = await response.json();
            onItemCreated(newItem);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockDateToggle = (date) => {
        const dateString = format(date, 'yyyy-MM-dd');
        setBlockedDates(prev => {
            const isBlocked = prev.some(d => format(d, 'yyyy-MM-dd') === dateString);
            if (isBlocked) {
                return prev.filter(d => format(d, 'yyyy-MM-dd') !== dateString);
            } else {
                return [...prev, date];
            }
        });
    };
    
    const getDisabledDays = (date) => {
        if (availabilityRule === 'weekdays_only' && (isSaturday(date) || isSunday(date))) {
            return true;
        }
        if (availabilityRule === 'weekends_only' && (!isSaturday(date) && !isSunday(date))) {
            return true;
        }
        const dateString = format(date, 'yyyy-MM-dd');
        return blockedDates.some(d => format(d, 'yyyy-MM-dd') === dateString);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">List a New Item</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-sm text-red-800 rounded-lg p-3 flex items-center mb-4">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                             <h3 className="text-lg font-medium text-gray-900">Item Details</h3>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Item Name</label>
                                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="pricePerDay" className="block text-sm font-medium text-gray-700">Price per Day ($)</label>
                                    <input type="number" id="pricePerDay" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required step="0.01" min="0" />
                                </div>
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                                    <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                           <label className="block text-lg font-medium text-gray-900">Item Image</label>
                            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Item preview" className="mx-auto h-24 w-auto object-cover rounded-md" />
                                    ) : (
                                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                    )}
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-gray-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-black">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                             <h3 className="text-lg font-medium text-gray-900">Item Location</h3>
                             <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address (Optional)</label>
                                <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                    <input type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required />
                                </div>
                                <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                                    <input type="text" id="state" value={state} onChange={(e) => setState(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required />
                                </div>
                                <div>
                                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip Code</label>
                                    <input type="text" id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black" required />
                                </div>
                            </div>
                        </div>
                        
                         <div>
                             <h3 className="text-lg font-medium text-gray-900">Set Availability</h3>
                             <p className="text-sm text-gray-500">First, set the overall date range your item is available.</p>
                             <div className="mt-2 flex justify-center border rounded-lg overflow-hidden">
                                <DateRange
                                    onChange={item => setAvailability([item.selection])}
                                    ranges={availability}
                                    months={1} 
                                    minDate={new Date()}
                                    maxDate={addYears(new Date(), 1)}
                                />
                             </div>
                             <div className="mt-4">
                                 <label className="block text-sm font-medium text-gray-700">Rental Rules</label>
                                 <div className="mt-2 flex justify-center rounded-lg shadow-sm">
                                    <button type="button" onClick={() => setAvailabilityRule('all_days')} className={`px-4 py-2 text-sm font-medium rounded-l-lg ${availabilityRule === 'all_days' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border'}`}>All Days</button>
                                    <button type="button" onClick={() => setAvailabilityRule('weekdays_only')} className={`px-4 py-2 text-sm font-medium -ml-px ${availabilityRule === 'weekdays_only' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border'}`}>Weekdays Only</button>
                                    <button type="button" onClick={() => setAvailabilityRule('weekends_only')} className={`px-4 py-2 text-sm font-medium rounded-r-lg -ml-px ${availabilityRule === 'weekends_only' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border'}`}>Weekends Only</button>
                                </div>
                             </div>

                             <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700">Block Out Specific Dates (Optional)</label>
                                <p className="text-sm text-gray-500">Click on dates in the calendar below to toggle them as unavailable.</p>
                                <div className="mt-2 flex justify-center border rounded-lg overflow-hidden">
                                     <Calendar
                                        onChange={handleBlockDateToggle}
                                        disabledDates={blockedDates}
                                        // ** THE FIX IS HERE: Constrain the calendar to the selected availability range **
                                        minDate={availability[0].startDate}
                                        maxDate={availability[0].endDate}
                                    />
                                </div>
                                {blockedDates.length > 0 && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        <strong>Blocked:</strong> {blockedDates.map(d => format(d, 'MM/dd/yy')).join(', ')}
                                    </div>
                                )}
                             </div>
                        </div>

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

