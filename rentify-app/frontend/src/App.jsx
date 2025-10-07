import React, { useState, useEffect } from 'react';
import { Search, MapPin, ChevronDown, ShoppingBag, User, Menu } from 'lucide-react';

const apiUrl = import.meta.env.VITE_API_BASE_URL;
// --- Helper Components ---

// Header Icon Component
const HeaderIcon = ({ Icon, children }) => (
    <a href="#" className="text-gray-600 hover:text-black flex items-center space-x-2">
        <Icon size={20} />
        {children && <span className="hidden md:inline">{children}</span>}
    </a>
);

// Category Card Component
const CategoryCard = ({ icon: Icon, name }) => (
    <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center">
        <Icon className="w-8 h-8 mb-2 text-black" />
        <span className="text-sm font-medium text-gray-800">{name}</span>
    </div>
);

// Product Card Component
const ProductCard = ({ image, name, price }) => (
    // <!-- TODO: Link to Item Detail Page -->
    <a href="#" className="group">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="w-full h-48 bg-gray-100 overflow-hidden">
                <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 truncate">{name}</h3>
                <p className="text-gray-600 mt-1">{price}</p>
                {/* <!-- TODO: Implement rent functionality --> */}
                <button className="w-full mt-4 bg-black text-white py-2 rounded-md font-semibold hover:bg-gray-800 transition-colors">
                    Rent Now
                </button>
            </div>
        </div>
    </a>
);

// --- Main App Component ---

export default function App() {
    // This state would eventually be fetched from your API
    const [items, setItems] = useState([
        { id: 1, name: 'Professional DSLR Camera', price: '$50/day', image: 'https://placehold.co/600x400/e2e8f0/333?text=Camera' },
        { id: 2, name: 'High-Performance Drone', price: '$75/day', image: 'https://placehold.co/600x400/e2e8f0/333?text=Drone' },
        { id: 3, name: 'Camping Gear Set', price: '$40/day', image: 'https://placehold.co/600x400/e2e8f0/333?text=Camping+Gear' },
        { id: 4, name: 'Electric Scooter', price: '$25/day', image: 'https://placehold.co/600x400/e2e8f0/333?text=Scooter' },
        { id: 5, name: 'Portable Projector', price: '$30/day', image: 'https://placehold.co/600x400/e2e8f0/333?text=Projector' },
        { id: 6, name: 'Mountain Bike', price: '$35/day', image: 'https://placehold.co/600x400/e2e8f0/333?text=Bike' },
        { id: 7, name: 'Paddleboard', price: '$45/day', image: 'https://placehold.co/600x400/e2e8f0/333?text=Paddleboard' },
        { id: 8, name: 'VR Headset', price: '$60/day', image: 'https://placehold.co/600x400/e2e8f0/333?text=VR+Headset' },
    ]);
    const categories = [
        { name: 'Electronics', icon: ShoppingBag },
        { name: 'Outdoors', icon: ShoppingBag },
        { name: 'Tools', icon: ShoppingBag },
        { name: 'Vehicles', icon: ShoppingBag },
        { name: 'Gaming', icon: ShoppingBag },
        { name: 'Home & Kitchen', icon: ShoppingBag },
    ];
    
    // Example of how to fetch data from your Python backend
    useEffect(() => {
        const fetchItems = async () => {
            try {
                // Vite exposes environment variables on `import.meta.env`
                const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/items`;
                console.log(`Fetching items from: ${apiUrl}`);
                
                // --- UNCOMMENT THE CODE BELOW WHEN YOUR API IS READY ---
                // const response = await fetch(apiUrl);
                // if (!response.ok) {
                //     throw new Error('Network response was not ok');
                // }
                // const data = await response.json();
                // setItems(data); // Update state with items from the backend
                
            } catch (error) {
                console.error("Failed to fetch items:", error);
                // Here you could set an error state to display a message to the user
            }
        };

        // fetchItems(); // Call the fetch function
    }, []); // Empty dependency array means this runs once when the component mounts

    return (
        <div className="bg-white font-sans">
            {/* --- Header --- */}
            <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        {/* Left Side: Logo and Location */}
                        <div className="flex items-center space-x-6">
                            <a href="#" className="text-2xl font-bold text-black">Rentify</a>
                            <div className="hidden md:flex items-center space-x-2 text-gray-600 border-l border-gray-300 pl-4">
                                <MapPin size={18} />
                                <span>New York, NY</span>
                                <ChevronDown size={16} />
                            </div>
                        </div>

                        {/* Center: Search Bar (Placeholder) */}
                        <div className="hidden lg:flex flex-grow max-w-xl mx-6">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Search for anything..."
                                    className="w-full bg-gray-100 border border-gray-200 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                    disabled
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <Search size={20} className="text-gray-400" />
                                </div>
                                {/* <!-- TODO: Implement search functionality --> */}
                            </div>
                        </div>

                        {/* Right Side: Navigation and User Actions */}
                        <div className="flex items-center space-x-4">
                            <nav className="hidden md:flex items-center space-x-6">
                                <a href="#" className="font-medium text-gray-600 hover:text-black">List an Item</a>
                                <HeaderIcon Icon={ShoppingBag} />
                            </nav>
                             {/* <!-- TODO: Link to Sign In Page --> */}
                            <a href="#" className="hidden md:flex items-center justify-center bg-black text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors">
                                Sign In
                            </a>
                            <button className="md:hidden">
                                <Menu size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Main Content --- */}
            <main className="container mx-auto px-4 py-8 md:py-12">
                {/* Main Heading */}
                <h1 className="text-3xl md:text-5xl font-bold text-center mb-8">
                    Rent Anything, Anytime
                </h1>

                {/* Categories */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-12">
                    {categories.map((cat) => (
                        <CategoryCard key={cat.name} icon={cat.icon} name={cat.name} />
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {items.map((item) => (
                        <ProductCard key={item.id} {...item} />
                    ))}
                </div>
            </main>

            {/* --- Footer --- */}
            <footer className="border-t border-gray-200 mt-12">
                <div className="container mx-auto px-4 py-8 text-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Rentify. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
