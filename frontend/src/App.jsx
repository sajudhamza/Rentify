import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, Outlet } from 'react-router-dom';
import { AppWindow, Package, Tag, MapPin, Search, User, Menu, X, LogOut, ChevronDown, Loader2, List, ArrowLeft } from 'lucide-react';

import { AuthModal } from './components/AuthModal';
import { CreateItemModal } from './components/CreateItemModal';
import { EditItemModal } from './components/EditItemModal';
import { ProfilePage } from './components/ProfilePage';
import { ItemDetailPage } from './components/ItemDetailPage';

// --- Configuration ---
const API_BASE_URL = 'http://localhost:8000';

// --- Custom Hooks ---
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

// --- Main App Structure ---
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="item/:itemId" element={<ItemDetailPageWrapper />} />
                    <Route path="profile" element={<ProfilePageWrapper />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

// --- Layout Component (Manages State & UI Shell) ---
function Layout() {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Effect to check for persisted user session on initial load
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('rentify_user');
            const token = localStorage.getItem('token');
            if (storedUser && token) {
                setCurrentUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('rentify_user');
            localStorage.removeItem('token');
        }
    }, []);

    // Handlers for Modals
    const handleOpenAuthModal = () => setIsAuthModalOpen(true);
    const handleOpenCreateItemModal = () => {
        if (currentUser) {
            setIsCreateItemModalOpen(true);
        } else {
            setIsAuthModalOpen(true); // Prompt login if not authenticated
        }
        setIsMenuOpen(false);
    };
    const handleCloseModals = () => {
        setIsAuthModalOpen(false);
        setIsCreateItemModalOpen(false);
        setItemToEdit(null);
    };

    // Handlers for Authentication
    const handleLoginSuccess = (user, token) => {
        setCurrentUser(user);
        localStorage.setItem('rentify_user', JSON.stringify(user));
        localStorage.setItem('token', token);
        handleCloseModals();
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('rentify_user');
        localStorage.removeItem('token');
    };
    
    // Handlers for Item Management
    const handleItemCreated = (newItem) => {
        // This will be handled by navigating and refetching on the home/profile page
        handleCloseModals();
    };

    const handleEditItem = (item) => {
        setItemToEdit(item);
    };
    
    const handleItemUpdated = (updatedItem) => {
         // This will be handled by the detail page refetching its own data
        setItemToEdit(null);
    };


    return (
        <div className="bg-white font-sans">
            <Header
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                onAuthClick={handleOpenAuthModal}
                onCreateItemClick={handleOpenCreateItemModal}
                currentUser={currentUser}
                onLogout={handleLogout}
            />
            <MobileMenu
                isOpen={isMenuOpen}
                onAuthClick={handleOpenAuthModal}
                onCreateItemClick={handleOpenCreateItemModal}
                currentUser={currentUser}
                onLogout={handleLogout}
            />

            {isAuthModalOpen && (
                <AuthModal
                    isOpen={isAuthModalOpen}
                    onClose={handleCloseModals}
                    apiBaseUrl={API_BASE_URL}
                    onRegisterSuccess={(user, token) => handleLoginSuccess(user, token)}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}
            
            {isCreateItemModalOpen && (
                <CreateItemModal
                    isOpen={isCreateItemModalOpen}
                    onClose={handleCloseModals}
                    apiBaseUrl={API_BASE_URL}
                    currentUser={currentUser}
                    onItemCreated={handleItemCreated}
                />
            )}

            {itemToEdit && (
                 <EditItemModal
                    isOpen={!!itemToEdit}
                    onClose={handleCloseModals}
                    item={itemToEdit}
                    apiBaseUrl={API_BASE_URL}
                    onItemUpdated={handleItemUpdated}
                />
            )}

            <main>
                <Outlet context={{ currentUser, handleEditItem }} />
            </main>
        </div>
    );
}


// --- Page Components & Wrappers ---

function HomePage() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                let itemsUrl = `${API_BASE_URL}/api/items/`;
                if (debouncedSearchQuery) {
                    itemsUrl = `${API_BASE_URL}/api/items/search?q=${encodeURIComponent(debouncedSearchQuery)}`;
                }
                
                const [itemsResponse, categoriesResponse] = await Promise.all([
                    fetch(itemsUrl),
                    debouncedSearchQuery ? Promise.resolve(null) : fetch(`${API_BASE_URL}/api/categories/`) // Don't refetch categories on search
                ]);

                if (!itemsResponse.ok) throw new Error('Network response for items was not ok');
                const itemsData = await itemsResponse.json();
                setItems(itemsData);

                if (categoriesResponse && categoriesResponse.ok) {
                    const categoriesData = await categoriesResponse.json();
                    setCategories(categoriesData);
                } else if (categoriesResponse === null) {
                    // Do nothing, keep existing categories
                } else if(categoriesResponse && !categoriesResponse.ok) {
                     console.error("Failed to fetch categories");
                }

            } catch (err) {
                setError('Failed to fetch data. Please make sure the backend server is running.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [debouncedSearchQuery]);
    
    const handleCardClick = (itemId) => {
        navigate(`/item/${itemId}`);
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-3">Rent Anything, Anytime</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">The best items from people near you. Save money and rent what you need, when you need it.</p>
                <div className="mt-8 max-w-md mx-auto relative">
                    <input
                        type="text"
                        placeholder="Search for an item..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full py-3 pl-12 pr-4 rounded-full border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
            </div>

            <CategoryFilter categories={categories} loading={loading && categories.length === 0} error={!!error} />

            <div>
                {loading && <p className="text-center text-gray-500">Loading rental items...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!loading && !error && items.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl">
                       <Package className="mx-auto h-12 w-12 text-gray-400" />
                       <h3 className="mt-2 text-xl font-semibold text-gray-900">No items found</h3>
                       <p className="mt-1 text-gray-500">{debouncedSearchQuery ? 'Try a different search term.' : 'Check back later!'}</p>
                   </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {items.map(item => (
                        <ProductCard key={item.id} item={item} onCardClick={handleCardClick} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Wrappers to pass context from Outlet to page components
function ItemDetailPageWrapper() {
    const { currentUser, handleEditItem } = useOutletContext();
    return <ItemDetailPage currentUser={currentUser} onEditClick={handleEditItem} />;
}

function ProfilePageWrapper() {
    const { currentUser } = useOutletContext();
    const navigate = useNavigate();
    return <ProfilePage currentUser={currentUser} onNavigate={(itemId) => navigate(`/item/${itemId}`)} />;
}


// --- Reusable UI Components ---

const Header = ({ isMenuOpen, setIsMenuOpen, onAuthClick, onCreateItemClick, currentUser, onLogout }) => (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
                 <Link to="/" className="flex items-center space-x-4">
                    <AppWindow className="text-black h-8 w-8" />
                    <h1 className="text-2xl font-bold text-black">Rentify</h1>
                </Link>

                <div className="hidden md:flex items-center space-x-6">
                    <Link to="/" className="text-gray-600 hover:text-black transition-colors">Home</Link>
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
                            <UserDropdown user={currentUser} onLogout={onLogout} />
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
    </header>
);

const MobileMenu = ({ isOpen, onAuthClick, onCreateItemClick, currentUser, onLogout }) => (
    <div className={`fixed top-[68px] left-0 right-0 bg-white shadow-lg z-30 md:hidden transition-transform duration-300 ease-in-out ${isOpen ? 'transform translate-y-0' : 'transform -translate-y-full'}`}>
        <nav className="flex flex-col items-center space-y-4 p-6">
            <Link to="/" className="text-gray-800 hover:text-black transition-colors text-lg">Home</Link>
            <button onClick={onCreateItemClick} className="text-gray-800 hover:text-black transition-colors text-lg">List an Item</button>
            <a href="#" className="text-gray-800 hover:text-black transition-colors text-lg">About</a>
            <div className="border-t w-full my-4"></div>
            {currentUser ? (
                <div className="flex flex-col items-center space-y-4">
                     <Link to="/profile" className="text-lg font-semibold">{currentUser.username}</Link>
                     <button onClick={onLogout} className="w-full flex justify-center items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <LogOut size={18} className="mr-2" />
                        Logout
                    </button>
                </div>
            ) : (
                <button onClick={onAuthClick} className="flex items-center justify-center bg-black text-white rounded-full w-12 h-12 hover:bg-gray-800 transition-colors mt-4">
                    <User className="h-6 w-6" />
                </button>
            )}
        </nav>
    </div>
);

const UserDropdown = ({ user, onLogout }) => {
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
                        <Link to="/profile" className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                            Profile
                        </Link>
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
    <div onClick={() => onCardClick(item.id)} className="group cursor-pointer">
        <div className="aspect-square w-full bg-gray-100 rounded-2xl overflow-hidden">
            <img
                src={item.image_url || `https://placehold.co/400x400/e2e8f0/334155?text=${encodeURIComponent(item.name)}`}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
        </div>
        <div className="mt-3">
            <h4 className="font-semibold text-lg truncate">{item.name}</h4>
            <p className="text-gray-600">${item.price_per_day} / day</p>
        </div>
    </div>
);

