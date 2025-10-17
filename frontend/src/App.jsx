import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

// Import all components from the correct path
import { AuthModal } from './component/AuthModal';
import { CreateItemModal } from './component/CreateItemModal';
import { EditItemModal } from './component/EditItemModal';
import { ItemDetailPage } from './component/ItemDetailPage';
import { ProfilePage } from './component/ProfilePage';
import { Header } from './component/Header';
import { HomePage } from './component/HomePage';
import { LocationModal } from './component/LocationModal';

// --- Configuration ---
const API_BASE_URL = 'http://localhost:8000';

// --- Main App ---
function App() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(null);
    const [location, setLocation] = useState({ city: 'New York', state: 'NY', zip: '10001' });
    
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [dataVersion, setDataVersion] = useState(0);

    // Check for user session on initial load
    useEffect(() => {
        const storedUser = localStorage.getItem('rentifyUser');
        const storedToken = localStorage.getItem('rentifyToken');
        if (storedUser && storedToken) {
            setCurrentUser(JSON.parse(storedUser));
            setToken(storedToken);
        }
    }, []);

    const handleLoginSuccess = (user, accessToken) => {
        setCurrentUser(user);
        setToken(accessToken);
        localStorage.setItem('rentifyUser', JSON.stringify(user));
        localStorage.setItem('rentifyToken', accessToken);
        setIsAuthModalOpen(false);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setToken(null);
        localStorage.removeItem('rentifyUser');
        localStorage.removeItem('rentifyToken');
        navigate('/');
    };
    
    const handleItemCreated = (newItem) => {
        setIsCreateItemModalOpen(false);
        setDataVersion(v => v + 1);
        navigate('/profile');
    };
    
    const handleItemUpdated = (updatedItem) => {
        setItemToEdit(null);
        setDataVersion(v => v + 1); 
    };
    
    const handleLocationSelect = (newLocation) => {
        setLocation(newLocation);
        setIsLocationModalOpen(false);
        setDataVersion(v => v + 1);
    }

    const handleOpenAuthModal = () => setIsAuthModalOpen(true);
    const handleOpenCreateItemModal = () => {
        if (currentUser) {
            setIsCreateItemModalOpen(true);
        } else {
            setIsAuthModalOpen(true);
        }
    };
    
    return (
        <div className="bg-white font-sans">
            <Header
                onAuthClick={handleOpenAuthModal}
                onCreateItemClick={handleOpenCreateItemModal}
                currentUser={currentUser}
                onLogout={handleLogout}
                location={location}
                onLocationClick={() => setIsLocationModalOpen(true)}
            />
            
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                apiBaseUrl={API_BASE_URL}
                onLoginSuccess={handleLoginSuccess}
            />

            <CreateItemModal 
                isOpen={isCreateItemModalOpen}
                onClose={() => setIsCreateItemModalOpen(false)}
                onItemCreated={handleItemCreated}
                apiBaseUrl={API_BASE_URL}
                token={token}
                currentLocation={location}
            />
            
            <LocationModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                onLocationSelect={handleLocationSelect}
            />

            {itemToEdit && (
                <EditItemModal
                    isOpen={!!itemToEdit}
                    onClose={() => setItemToEdit(null)}
                    item={itemToEdit}
                    onItemUpdated={handleItemUpdated}
                    apiBaseUrl={API_BASE_URL}
                    token={token}
                />
            )}

            <Routes>
                <Route path="/" element={<HomePage apiBaseUrl={API_BASE_URL} dataVersion={dataVersion} />} />
                {/* THE FIX IS HERE: Added a `key` prop to force remount on data change */}
                <Route 
                    path="/item/:itemId" 
                    element={<ItemDetailPage 
                        key={dataVersion} 
                        apiBaseUrl={API_BASE_URL} 
                        currentUser={currentUser} 
                        token={token} 
                        onEditClick={setItemToEdit} 
                    />} 
                />
                <Route path="/profile" element={<ProfilePage apiBaseUrl={API_BASE_URL} currentUser={currentUser} token={token} dataVersion={dataVersion} />} />
            </Routes>
        </div>
    );
}

// Wrapper to provide Router context
const AppWrapper = () => (
    <BrowserRouter>
        <App />
    </BrowserRouter>
);

export default AppWrapper;

