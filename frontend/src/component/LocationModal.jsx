import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, MapPin, LocateFixed } from 'lucide-react';

// --- Custom Debounce Hook ---
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export const LocationModal = ({ isOpen, onClose, onLocationSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const [error, setError] = useState(null);
    const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms delay

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setResults([]);
            setError(null);
        }
    }, [isOpen]);

    // --- Live Search Function ---
    useEffect(() => {
        const handleSearch = async () => {
            if (!debouncedSearchQuery || debouncedSearchQuery.length < 3) {
                setResults([]);
                return;
            }
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(debouncedSearchQuery)}&format=json&addressdetails=1&limit=5`
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch location data.');
                }
                const data = await response.json();

                // Process the results to fit our application's data structure
                const formattedResults = data
                    .map(result => {
                        const { address } = result;
                        if (!address || (!address.city && !address.town && !address.village) || !address.state || !address.postcode) {
                            return null;
                        }
                        return {
                            city: address.city || address.town || address.village,
                            state: address.state,
                            zip: address.postcode,
                            display_name: result.display_name
                        };
                    })
                    .filter(Boolean); // Remove any null entries

                setResults(formattedResults);

            } catch (err) {
                setError('Could not perform search. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        handleSearch();
    }, [debouncedSearchQuery]);
    
    // --- Get Current Location ---
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        setGeoLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    if (!response.ok) {
                        throw new Error("Failed to reverse geocode location.");
                    }
                    const data = await response.json();
                    const { address } = data;

                    if (address && (address.city || address.town || address.village) && address.state && address.postcode) {
                        onLocationSelect({
                            city: address.city || address.town || address.village,
                            state: address.state,
                            zip: address.postcode,
                            display_name: data.display_name
                        });
                    } else {
                        setError("Could not determine a valid location from your coordinates.");
                    }
                } catch (err) {
                    setError("Failed to fetch location details.");
                    console.error(err);
                } finally {
                    setGeoLoading(false);
                }
            },
            (err) => {
                setError("Unable to retrieve your location. Please grant permission.");
                setGeoLoading(false);
                console.error(err);
            }
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Select Your Location</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="relative mb-4">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by city, state, or zip code"
                            className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>

                    <button 
                        onClick={handleGetCurrentLocation}
                        disabled={geoLoading}
                        className="w-full flex items-center justify-center px-4 py-2 border rounded-full text-sm font-medium hover:bg-gray-50 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {geoLoading ? (
                            <Loader2 size={16} className="mr-2 animate-spin"/>
                        ) : (
                            <LocateFixed size={16} className="mr-2"/>
                        )}
                        Use Current Location
                    </button>

                    <div className="h-48 overflow-y-auto">
                        {loading && (
                            <div className="flex justify-center items-center h-full">
                                <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
                            </div>
                        )}
                        {error && <p className="text-red-500 text-center">{error}</p>}
                        {!loading && !error && results.length > 0 && (
                             <ul className="space-y-2">
                                {results.map((location, index) => (
                                    <li key={index}>
                                        <button 
                                            onClick={() => onLocationSelect(location)}
                                            className="w-full text-left flex items-center p-3 rounded-lg hover:bg-gray-100"
                                        >
                                            <MapPin size={18} className="mr-3 text-gray-500 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold">{location.city}, {location.state}</p>
                                                <p className="text-xs text-gray-500">{location.display_name}</p>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                         {!loading && !error && debouncedSearchQuery.length >= 3 && results.length === 0 && (
                            <p className="text-center text-gray-500 pt-4">No results found for "{debouncedSearchQuery}".</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

