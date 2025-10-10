import React, { useState, useEffect, useRef } from 'react';
import { AppWindow, Package, Tag, MapPin, Search, User, Menu, X, LogOut, ChevronDown, Loader2, List, ArrowLeft } from 'lucide-react';
import { AuthModal } from './components/AuthModal.jsx';
import { CreateItemModal } from './components/CreateItemModal.jsx';
import { ItemDetailPage } from './components/ItemDetailPage.jsx';
import { EditItemModal } from './components/EditItemModal.jsx';
import { MyItemsPage } from './components/MyItemsPage.jsx';

// --- Configuration ---
const API_BASE_URL = 'http://localhost:8000';

// --- Custom Hook for Debouncing ---
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

// --- Reusable Components ---
const UserDropdown = ({ user, onLogout, onMyItemsClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
            >
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-semibold">{user.username}</span>
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border z-50">
                    <div className="p-2">
                        <div className="px-3 py-2">
                            <p className="font-semibold">{user.full_name}</p>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="border-t my-1"></div>
                        <button
                            onClick={() => { onMyItemsClick(); setIsOpen(false); }}
                            className="w-full text-left flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                            <List size={16} className="mr-2" />
                            My Items
                        </button>
                        <div className="border-t my-1"></div>
                        <button
                            onClick={onLogout}
                            className="w-full text-left flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                            <LogOut size={16} className="mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Header = ({ onAuthClick, onCreateItemClick, currentUser, onLogout, onMyItemsClick, onHomeClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const handleCreateItem = () => {
        setIsMenuOpen(false);
        onCreateItemClick();
    }
    const handleAuth = () => {
        setIsMenuOpen(false);
        onAuthClick();
    }

    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <button onClick={onHomeClick} className="flex items-center space-x-4">
                        <AppWindow className="text-black h-8 w-8" />
                        <h1 className="text-2xl font-bold text-black">Rentify</h1>
                    </button>
                    <div className="hidden md:flex items-center space-x-6">
                        <button onClick={onHomeClick} className="text-gray-600 hover:text-black transition-colors">Home</button>
                        <button onClick={onCreateItemClick} className="text-gray-600 hover:text-black transition-colors">List an Item</button>
                        <a href="#" className="text-gray-600 hover:text-black transition-colors">About</a>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-3 py-1.5">
                            <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm font-medium">New York, NY</span>
                        </div>
                        {currentUser ? (
                             <div className="hidden md:block">
                                <UserDropdown user={currentUser} onLogout={onLogout} onMyItemsClick={onMyItemsClick} />
                             </div>
                        ) : (
                            <button onClick={onAuthClick} className="hidden md:flex items-center justify-center bg-black text-white rounded-full w-10 h-10 hover:bg-gray-800 transition-colors">
                                <User className="h-5 w-5" />
                            </button>
                        )}
                        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>
             <div className={`fixed top-[68px] left-0 right-0 bg-white shadow-lg z-30 md:hidden transition-transform duration-300 ease-in-out ${isMenuOpen ? 'transform translate-y-0' : 'transform -translate-y-full'}`}>
                <nav className="flex flex-col items-center space-y-4 p-6">
                    <button onClick={() => { onHomeClick(); setIsMenuOpen(false); }} className="text-gray-800 hover:text-black transition-colors text-lg">Home</button>
                    <button onClick={handleCreateItem} className="text-gray-800 hover:text-black transition-colors text-lg">List an Item</button>
                    <a href="#" className="text-gray-800 hover:text-black transition-colors text-lg">About</a>
                    <div className="border-t w-full my-4"></div>
                    {currentUser ? (
                        <div className="flex flex-col items-center space-y-4 w-full">
                             <div className="text-lg font-semibold">{currentUser.username}</div>
                             <button onClick={() => { onMyItemsClick(); setIsMenuOpen(false); }} className="w-full flex justify-center items-center px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-lg">
                                <List size={18} className="mr-2" />
                                My Items
                            </button>
                             <button onClick={onLogout} className="w-full flex justify-center items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                                <LogOut size={18} className="mr-2" />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleAuth} className="flex items-center justify-center bg-black text-white rounded-full w-12 h-12 hover:bg-gray-800 transition-colors mt-4">
                            <User className="h-6 w-6" />
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
};

const CategoryFilter = ({ categories, loading, error }) => (
    <div className="mb-12">
        <h3 className="text-lg font-semibold mb-4 text-center sm:text-left">Browse by Category</h3>
        <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            {loading && <p className="text-gray-500">Loading categories...</p>}
            {error && <p className="text-red-500">Could not load categories.</p>}
            {categories.map((category) => (
                <button key={category.id} className="flex items-center bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 rounded-full transition-colors duration-200 text-sm font-medium">
                    <Tag className="h-4 w-4 mr-2" />
                    {category.name}
                </button>
            ))}
        </div>
    </div>
);

const ProductCard = ({ item, onCardClick }) => (
    <div className="group flex flex-col cursor-pointer" onClick={() => onCardClick(item)}>
        <div className="aspect-square w-full bg-gray-100 rounded-2xl overflow-hidden">
            <img
                src={item.image_url || `https://placehold.co/400x400/e2e8f0/334155?text=${encodeURIComponent(item.name)}`}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
        </div>
        <div className="mt-3 flex-grow">
            <h4 className="font-semibold text-lg truncate">{item.name}</h4>
            <p className="text-gray-600">${item.price_per_day} / day</p>
        </div>
        <button className="w-full mt-2 bg-black text-white py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200 pointer-events-none">
            Rent Now
        </button>
    </div>
);

// Main Application Component
export default function App() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);
    const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    
    const [currentView, setCurrentView] = useState('home'); // 'home', 'itemDetail', 'myItems'
    const [selectedItemId, setSelectedItemId] = useState(null);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [itemsResponse, categoriesResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/api/items/`),
                fetch(`${API_BASE_URL}/api/categories/`)
            ]);
            if (!itemsResponse.ok || !categoriesResponse.ok) throw new Error('Network response was not ok');
            const itemsData = await itemsResponse.json();
            const categoriesData = await categoriesResponse.json();
            setItems(itemsData);
            setCategories(categoriesData);
        } catch (err) {
            setError('Failed to fetch data. Please make sure the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentView === 'home' && searchQuery.trim() === '') {
            fetchInitialData();
        }
    }, [currentView, searchQuery]);

    useEffect(() => {
        const searchItems = async () => {
            if (debouncedSearchQuery.trim() === '') {
                setSearchResults([]);
                if (currentView === 'home') fetchInitialData(); // Refetch all items when search is cleared
                return;
            }
            setIsSearching(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/items/search?q=${encodeURIComponent(debouncedSearchQuery)}`);
                if (!response.ok) throw new Error('Search request failed');
                const data = await response.json();
                setSearchResults(data);
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setIsSearching(false);
            }
        };
        searchItems();
    }, [debouncedSearchQuery, currentView]);

    const handleOpenAuthModal = () => setIsAuthModalOpen(true);
    const handleOpenCreateItemModal = () => currentUser ? setIsCreateItemModalOpen(true) : setIsAuthModalOpen(true);
    const handleItemCreated = (newItem) => {
        setItems(prevItems => [newItem, ...prevItems]);
        setIsCreateItemModalOpen(false);
    };
    const handleEditItem = (item) => {
        setItemToEdit(item);
        setIsEditItemModalOpen(true);
    };
    const handleItemUpdated = (updatedItem) => {
        setItems(prevItems => prevItems.map(item => item.id === updatedItem.id ? updatedItem : item));
        setSearchResults(prevResults => prevResults.map(item => item.id === updatedItem.id ? updatedItem : item));
        setIsEditItemModalOpen(false);
        setItemToEdit(null);
        setSelectedItemId(updatedItem.id);
        setCurrentView('itemDetail');
    };
    const handleRegisterSuccess = (user) => {
        setCurrentUser(user);
        setIsAuthModalOpen(false);
    };
    const handleLoginSuccess = (user) => {
        setCurrentUser(user);
        setIsAuthModalOpen(false);
    };
    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentView('home');
    };
    const handleCardClick = (item) => {
        setSelectedItemId(item.id);
        setCurrentView('itemDetail');
    };
    const handleBackToHome = () => {
        setSelectedItemId(null);
        setSearchQuery('');
        setCurrentView('home');
    };
    const handleShowMyItems = () => currentUser && setCurrentView('myItems');

    const itemsToDisplay = searchQuery.trim().length > 0 ? searchResults : items;

    const renderView = () => {
        switch (currentView) {
            case 'itemDetail':
                return <ItemDetailPage itemId={selectedItemId} apiBaseUrl={API_BASE_URL} onBack={handleBackToHome} currentUser={currentUser} onEditClick={handleEditItem} />;
            case 'myItems':
                return <MyItemsPage apiBaseUrl={API_BASE_URL} currentUser={currentUser} onBack={handleBackToHome} onCardClick={handleCardClick} />;
            case 'home':
            default:
                return (
                    <>
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-bold mb-3">Rent Anything, Anytime</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">The best items from people near you. Save money and rent what you need, when you need it.</p>
                            <div className="mt-8 max-w-md mx-auto relative">
                                <input type="text" placeholder="Search for an item..." className="w-full py-3 pl-12 pr-10 rounded-full border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-black" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />}
                            </div>
                        </div>
                        <CategoryFilter categories={categories} loading={loading} error={!!error} />
                        <div>
                            {loading && <div className="flex justify-center items-center py-20"><Loader2 className="h-12 w-12 animate-spin text-gray-500" /></div>}
                            {error && <p className="text-center text-red-500">{error}</p>}
                            {!loading && !error && itemsToDisplay.length === 0 && (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl">
                                   <Package className="mx-auto h-12 w-12 text-gray-400" />
                                   <h3 className="mt-2 text-xl font-semibold text-gray-900">{searchQuery ? 'No items match your search' : 'No items found'}</h3>
                                   <p className="mt-1 text-gray-500">{searchQuery ? 'Try a different search term.' : 'Check back later or list an item!'}</p>
                               </div>
                            )}
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                                {itemsToDisplay.map(item => <ProductCard key={item.id} item={item} onCardClick={handleCardClick} />)}
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="bg-white font-sans">
            <Header onAuthClick={handleOpenAuthModal} onCreateItemClick={handleOpenCreateItemModal} currentUser={currentUser} onLogout={handleLogout} onMyItemsClick={handleShowMyItems} onHomeClick={handleBackToHome} />
            {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} apiBaseUrl={API_BASE_URL} onRegisterSuccess={handleRegisterSuccess} onLoginSuccess={handleLoginSuccess} />}
            {isCreateItemModalOpen && <CreateItemModal isOpen={isCreateItemModalOpen} onClose={() => setIsCreateItemModalOpen(false)} apiBaseUrl={API_BASE_URL} currentUser={currentUser} categories={categories} onItemCreated={handleItemCreated} />}
            {isEditItemModalOpen && itemToEdit && <EditItemModal isOpen={isEditItemModalOpen} onClose={() => setIsEditItemModalOpen(false)} apiBaseUrl={API_BASE_URL} item={itemToEdit} categories={categories} onItemUpdated={handleItemUpdated} />}
            <main className="container mx-auto px-4 py-12">
                {renderView()}
            </main>
        </div>
    );
}

