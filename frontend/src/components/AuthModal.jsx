import React, { useState } from 'react';
import { X } from 'lucide-react';

// --- SVG Icons for Social Logins ---
const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 12.8C34.553 9.1 29.5 7 24 7c-9.4 0-17 7.6-17 17s7.6 17 17 17s17-7.6 17-17c0-1.745-.272-3.428-.789-5.017z" />
        <path fill="#FF3D00" d="M6.306 14.691L12.793 19.3c1.422-3.411 4.545-6.012 8.207-6.856l-6.75-5.021C10.155 9.103 7.356 11.646 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.702-1.956 12.946-5.187l-6.32-4.945c-2.148 1.455-4.821 2.33-7.626 2.33c-5.782 0-10.638-3.56-12.434-8.487l-6.538 4.93C7.18 39.424 14.93 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083L42 20H24v8h11.303c-.792 2.237-2.231 4.16-4.087 5.571l6.32 4.945C42.473 35.241 44 30.138 44 24c0-1.745-.272-3.428-.789-5.017z" />
    </svg>
);

const AppleIcon = () => (
    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15.22,6.15a3.32,3.32,0,0,0-2.32.93,3.33,3.33,0,0,0-2.31-.93,3.47,3.47,0,0,0-3.45,3.6c0,2.12,1.33,3.8,2.77,5.29s2.32,2.37,3,2.37a.78.78,0,0,0,.76-.75v-1a.76.76,0,0,1,.75-.76.75.75,0,0,1,.75.76v1a.78.78,0,0,0,.76.75c.71,0,1.58-1,3-2.37s2.77-3.17,2.77-5.29A3.47,3.47,0,0,0,15.22,6.15ZM12,5.21a2,2,0,0,1,1.5-2A2,2,0,0,1,15,5.2a1.9,1.9,0,0,1-1.5,2A1.9,1.9,0,0,1,12,5.21Z" />
    </svg>
);

const FacebookIcon = () => (
    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22,12c0-5.52-4.48-10-10-10S2,6.48,2,12c0,4.84,3.44,8.87,8,9.8V15H8v-3h2V9.5C10,7.57,11.57,6,13.5,6H16v3h-1.5c-1,0-1,.5-1,1v1.5h3l-.5,3H13v6.95c5.05-.5,9-4.76,9-9.95Z" />
    </svg>
);


export const AuthModal = ({ isOpen, onClose, apiBaseUrl, onRegisterSuccess, onLoginSuccess }) => {
    const [isLoginView, setIsLoginView] = useState(true);

    // Form States
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${apiBaseUrl}/api/users/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, full_name: fullName }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Registration failed');
            onRegisterSuccess(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${apiBaseUrl}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Login failed');
            onLoginSuccess(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setError(null); // Clear errors when switching views
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md m-4 relative transform transition-all duration-300 ease-in-out"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-center mb-2">
                        {isLoginView ? 'Welcome Back!' : 'Create an Account'}
                    </h2>
                    <p className="text-gray-500 text-center mb-6">
                        {isLoginView ? 'Sign in to continue.' : 'to start renting and listing.'}
                    </p>

                    {/* Social Logins */}
                    <div className="space-y-3 mb-6">
                        <button className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <GoogleIcon />
                            <span className="font-semibold text-gray-700">Continue with Google</span>
                        </button>
                        <button className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors">
                            <AppleIcon />
                            <span className="font-semibold">Continue with Apple</span>
                        </button>
                        <button className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg bg-[#1877F2] text-white hover:bg-blue-700 transition-colors">
                            <FacebookIcon />
                            <span className="font-semibold">Continue with Facebook</span>
                        </button>
                    </div>

                    <div className="flex items-center my-6">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    {isLoginView ? (
                        <form onSubmit={handleLogin}>
                           {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                           <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="login-email">Email</label>
                                <input id="login-email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="you@example.com" required />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="login-password">Password</label>
                                <input id="login-password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="••••••••" required />
                            </div>
                            <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400" disabled={loading}>
                                {loading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister}>
                            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="full-name">Full Name</label>
                                    <input id="full-name" value={fullName} onChange={e => setFullName(e.target.value)} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" required/>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">Username</label>
                                    <input id="username" value={username} onChange={e => setUsername(e.target.value)} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" required/>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
                                <input id="email" value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" required/>
                            </div>
                            <div className="mt-4 mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
                                <input id="password" value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" required/>
                            </div>
                            <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400" disabled={loading}>
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>
                    )}

                    <div className="text-center mt-6">
                        <button onClick={toggleView} className="text-sm text-gray-600 hover:text-black">
                            {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

