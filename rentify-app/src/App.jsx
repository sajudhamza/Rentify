import React from 'react';
import { MapPin, Search, Camera, Wrench, Tent, PartyPopper, Home, Menu } from 'lucide-react';

// --- MOCK DATA ---
// In a real application, this data would come from your Python backend API.
const rentalItems = [
    {
        id: 1,
        name: 'Professional DSLR Camera',
        price: 50,
        image: 'https://placehold.co/600x400/e2e8f0/111827?text=DSLR+Camera'
    },
    {
        id: 2,
        name: 'Cordless Power Drill Kit',
        price: 25,
        image: 'https://placehold.co/600x400/e2e8f0/111827?text=Power+Drill'
    },
    {
        id: 3,
        name: '4-Person Camping Tent',
        price: 35,
        image: 'https://placehold.co/600x400/e2e8f0/111827?text=Camping+Tent'
    },
    {
        id: 4,
        name: 'HD Movie Projector',
        price: 40,
        image: 'https://placehold.co/600x400/e2e8f0/111827?text=Projector'
    },
    {
        id: 5,
        name: 'Folding Chairs (Set of 10)',
        price: 15,
        image: 'https://placehold.co/600x400/e2e8f0/111827?text=Folding+Chairs'
    },
    {
        id: 6,
        name: 'Electric Lawn Mower',
        price: 30,
        image: 'https://placehold.co/600x400/e2e8f0/111827?text=Lawn+Mower'
    },
    {
        id: 7,
        name: 'Single Person Kayak',
        price: 45,
        image: 'https://placehold.co/600x400/e2e8f0/111827?text=Kayak'
    },
    {
        id: 8,
        name: 'Portable PA Sound System',
        price: 60,
        image: 'https://placehold.co/600x400/e2e8f0/111827?text=Sound+System'
    },
];

// --- SUB-COMPONENTS ---

const Header = () => (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                {/* Logo and Location */}
                <div className="flex items-center space-x-6">
                    <a href="#" className="text-2xl font-bold text-black">Rentify</a>
                    <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>Location: <span className="font-semibold text-black">New York, NY</span></span>
                    </div>
                </div>

                {/* Search Bar (Placeholder) */}
                <div className="flex-1 max-w-xs mx-4">
                    {/* TODO: Implement search functionality */}
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search for anything..." 
                            className="w-full px-4 py-2 border border-gray-300 rounded-full text-sm bg-gray-100 cursor-not-allowed" 
                            disabled 
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <Search className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center space-x-4">
                    {/* TODO: Link to Item Listing page/flow */}
                    <a href="#" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">List Your Item</a>
                    {/* TODO: Implement User Authentication and link to profile/auth pages */}
                    <a href="#" className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">Sign In</a>
                </nav>
                
                {/* Mobile Menu Button (Placeholder) */}
                <div className="md:hidden">
                    {/* TODO: Implement mobile menu toggle */}
                    <button className="text-gray-600 hover:text-black">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    </header>
);

const CategoryFilter = ({ icon: Icon, name }) => (
    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
        <Icon className="w-4 h-4" />
        {name}
    </button>
);

const ProductCard = ({ item }) => (
    // TODO: Link to Item Detail Page. The entire card will be a clickable link.
    <a href="#" className="group block border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="relative">
            <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
        </div>
        <div className="p-4 bg-white">
            <h3 className="font-semibold text-md text-black mb-1 truncate">{item.name}</h3>
            <p className="text-gray-600 text-sm mb-4">${item.price}/day</p>
            <button className="w-full bg-black text-white py-2 rounded-md text-sm font-semibold group-hover:bg-gray-800 transition-colors">Rent Now</button>
        </div>
    </a>
);

const Footer = () => (
    <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
             {/* TODO: Add links to About, Contact, FAQ pages */}
            <p>&copy; 2024 Rentify. All rights reserved.</p>
        </div>
    </footer>
);


// --- MAIN APP COMPONENT ---
export default function App() {
    return (
        <div className="antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>
            <Header />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Rent Anything, Anytime</h1>
                
                {/* Category Filters */}
                <div className="mb-10">
                    <h2 className="text-lg font-semibold mb-4 text-center sm:text-left">Browse by Category</h2>
                    {/* TODO: This will eventually be dynamic and filter the product grid */}
                    <div className="flex justify-center sm:justify-start items-center gap-2 sm:gap-4 flex-wrap">
                        <CategoryFilter icon={Camera} name="Electronics" />
                        <CategoryFilter icon={Wrench} name="Tools" />
                        <CategoryFilter icon={Tent} name="Outdoor" />
                        <CategoryFilter icon={PartyPopper} name="Events" />
                        <CategoryFilter icon={Home} name="Home & Garden" />
                    </div>
                </div>

                {/* Product Grid */}
                {/* TODO: This grid should be populated dynamically from a backend API call in the future. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {rentalItems.map(item => (
                        <ProductCard key={item.id} item={item} />
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
