import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppWindow, User, Menu, X, LogOut, ChevronDown, User as UserIcon, MapPin } from 'lucide-react';

// User Dropdown Component (no changes)
const UserDropdown = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const handleProfileClick = () => {
        navigate('/profile');
        setIsOpen(false);
    }

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
                         <button
                            onClick={handleProfileClick}
                            className="w-full text-left flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                            <UserIcon size={16} className="mr-2" />
                            My Profile
                        </button>
                        <div className="border-t my-1"></div>
                        <button
                            onClick={onLogout}
                            className="w-full text-left flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
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


// Main Header Component
export const Header = ({ onAuthClick, onCreateItemClick, currentUser, onLogout, location, onLocationClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleOpenAuth = () => {
        onAuthClick();
        setIsMenuOpen(false);
    };

    const handleOpenCreate = () => {
        onCreateItemClick();
        setIsMenuOpen(false);
    }

    const handleLogoutAndCloseMenu = () => {
        onLogout();
        setIsMenuOpen(false);
    }
    
    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-4">
                        <AppWindow className="text-black h-8 w-8" />
                        <h1 className="text-2xl font-bold text-black">Rentify</h1>
                    </Link>

                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="text-gray-600 hover:text-black transition-colors">Home</Link>
                        <button onClick={currentUser ? handleOpenCreate : handleOpenAuth} className="text-gray-600 hover:text-black transition-colors">List an Item</button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button onClick={onLocationClick} className="hidden sm:flex items-center bg-gray-100 rounded-full px-3 py-1.5 hover:bg-gray-200 transition-colors">
                            <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm font-medium">{location ? `${location.city}, ${location.state}` : 'Select Location'}</span>
                        </button>
                        {currentUser ? (
                            <div className="hidden md:block">
                                <UserDropdown user={currentUser} onLogout={onLogout} />
                            </div>
                        ) : (
                            <button onClick={handleOpenAuth} className="hidden md:flex items-center justify-center bg-black text-white rounded-full w-10 h-10 hover:bg-gray-800 transition-colors">
                                <User className="h-5 w-5" />
                            </button>
                        )}
                        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>
            {/* Mobile Menu */}
             <div className={`fixed top-[68px] left-0 right-0 bg-white shadow-lg z-30 md:hidden transition-transform duration-300 ease-in-out ${isMenuOpen ? 'transform translate-y-0' : 'transform -translate-y-full'}`}>
                <nav className="flex flex-col items-center space-y-4 p-6">
                    <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-gray-800 hover:text-black transition-colors text-lg">Home</Link>
                    <button onClick={currentUser ? handleOpenCreate : handleOpenAuth} className="text-gray-800 hover:text-black transition-colors text-lg">List an Item</button>

                    <div className="border-t w-full my-4"></div>

                    {currentUser ? (
                        <div className="flex flex-col items-center space-y-4 w-full">
                            <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-2 font-semibold">{currentUser.username}</Link>
                            <button onClick={handleLogoutAndCloseMenu} className="w-full flex justify-center items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                                <LogOut size={18} className="mr-2" />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleOpenAuth} className="flex items-center justify-center bg-black text-white rounded-full w-12 h-12 hover:bg-gray-800 transition-colors mt-4">
                            <User className="h-6 w-6" />
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
};

