import React, { useState, useEffect } from 'react';
import { Tag, Package, Search, Loader2 } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Link } from 'react-router-dom';

// Custom hook for debouncing
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

export const HomePage = ({ apiBaseUrl, dataVersion }) => {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        const fetchInitialData = async () => {
             try {
                setLoading(true);
                setError(null);
                const apiPath = debouncedSearchTerm 
                    ? `/api/items/search?q=${debouncedSearchTerm}`
                    : `/api/items/`;

                const [itemsResponse, categoriesResponse] = await Promise.all([
                    fetch(`${apiBaseUrl}${apiPath}`),
                    fetch(`${apiBaseUrl}/api/categories/`)
                ]);

                if (!itemsResponse.ok) throw new Error('Failed to fetch items');
                if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');

                const itemsData = await itemsResponse.json();
                const categoriesData = await categoriesResponse.json();

                setItems(itemsData);
                setCategories(categoriesData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [debouncedSearchTerm, dataVersion, apiBaseUrl]);


    return (
        <main className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-3">Rent Anything, Anytime</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">The best items from people near you. Save money and rent what you need, when you need it.</p>
                <div className="mt-8 max-w-md mx-auto relative">
                    <input
                        type="text"
                        placeholder="Search for an item..."
                        className="w-full py-3 pl-12 pr-4 rounded-full border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
            </div>

            {/* Category Filter */}
            <div className="mb-12">
                <h3 className="text-lg font-semibold mb-4 text-center sm:text-left">Browse by Category</h3>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                    {categories.map((category) => (
                        <button key={category.id} className="flex items-center bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 rounded-full transition-colors duration-200 text-sm font-medium">
                            <Tag className="h-4 w-4 mr-2" />
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Product Grid */}
            <div>
                {loading && <div className="text-center"><Loader2 className="animate-spin inline-block h-8 w-8 text-black" /></div>}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!loading && !error && items.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-xl font-semibold text-gray-900">No items found</h3>
                        <p className="mt-1 text-gray-500">{searchTerm ? `No results for "${searchTerm}".` : "Check back later!"}</p>
                    </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {items.map(item => (
                         <Link key={item.id} to={`/item/${item.id}`}>
                            <ProductCard item={item} />
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
};

