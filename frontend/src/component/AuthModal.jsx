import React, { useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, apiBaseUrl, onLoginSuccess }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [formData, setFormData] = useState({
        identifier: '', // Used for login (can be username or email)
        username: '',   // Used for registration
        email: '',      // Used for registration
        password: '',
        full_name: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Determine which identifier to use for login attempt
        const loginIdentifier = isLoginView ? formData.identifier : formData.email;

        try {
            // Step 1: Get the access token
            const tokenResponse = await fetch(`${apiBaseUrl}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    username: loginIdentifier, // Backend expects 'username' but this can be username or email
                    password: formData.password
                })
            });

            if (!tokenResponse.ok) {
                const errorData = await tokenResponse.json();
                throw new Error(errorData.detail || 'Failed to sign in.');
            }

            const { access_token } = await tokenResponse.json();

            // Step 2: Use the token to get user details
            const userResponse = await fetch(`${apiBaseUrl}/api/users/me`, {
                headers: { 'Authorization': `Bearer ${access_token}` }
            });

            if (!userResponse.ok) {
                throw new Error('Could not fetch user details.');
            }

            const userData = await userResponse.json();
            
            if (onLoginSuccess) {
                onLoginSuccess(userData, access_token);
            }
            handleClose(); // Close modal on success

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const registerResponse = await fetch(`${apiBaseUrl}/api/users/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    full_name: formData.full_name
                })
            });

            if (!registerResponse.ok) {
                const errorData = await registerResponse.json();
                throw new Error(errorData.detail || 'Failed to register.');
            }

            // After successful registration, automatically sign the user in
            // by calling the sign-in logic.
            await handleSignIn(e);

        } catch (err) {
            setError(err.message);
            // Ensure loading is stopped if registration fails but signIn isn't called
            setLoading(false);
        }
    };
    
    const resetForm = () => {
        setFormData({ identifier: '', username: '', email: '', password: '', full_name: '' });
        setError('');
        setIsLoginView(true);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative animate-fade-in-up">
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-center mb-2">{isLoginView ? 'Welcome Back' : 'Create an Account'}</h2>
                    <p className="text-gray-500 text-center mb-6">{isLoginView ? 'Sign in to continue to Rentify.' : 'Join our community of renters and owners.'}</p>
                    
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-center">
                            <AlertCircle size={20} className="mr-2"/>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={isLoginView ? handleSignIn : handleRegister} className="space-y-4">
                        {isLoginView ? (
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="identifier">Username or Email</label>
                                <input type="text" name="identifier" id="identifier" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" value={formData.identifier} onChange={handleInputChange} />
                            </div>
                        ) : (
                             <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="full_name">Full Name</label>
                                    <input type="text" name="full_name" id="full_name" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" value={formData.full_name} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">Username</label>
                                    <input type="text" name="username" id="username" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" value={formData.username} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
                                    <input type="email" name="email" id="email" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" value={formData.email} onChange={handleInputChange} />
                                </div>
                             </>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
                            <input type="password" name="password" id="password" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" value={formData.password} onChange={handleInputChange} />
                        </div>
                        
                        <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex justify-center items-center">
                            {loading ? <Loader2 className="animate-spin" /> : (isLoginView ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>
                    
                    <div className="text-center mt-4">
                        <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="text-sm text-gray-600 hover:text-black">
                            {isLoginView ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">OR</span>
                        </div>
                    </div>

                    {/* Social Logins */}
                    <div className="space-y-3">
                         <button className="w-full flex items-center justify-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.2 0 5.8 1.2 7.8 3.1l6.1-6.1C34.6 2.5 29.8 0 24 0 14.9 0 7.3 5.4 3.4 12.9l7.4 5.8C12.7 13.3 18 9.5 24 9.5z"></path><path fill="#34A853" d="M46.6 25.1c0-1.6-.1-3.2-.4-4.7H24v8.9h12.7c-.5 2.9-2.2 5.3-4.8 7l7.3 5.7c4.2-3.9 6.8-9.6 6.8-16.9z"></path><path fill="#FBBC05" d="M10.8 28.7c-.7-2.1-.7-4.4 0-6.5l-7.4-5.8C1.2 19.9 0 24.8 0 30s1.2 10.1 3.4 13.6l7.4-5.8c-.7-2.2-.7-4.5 0-6.6z"></path><path fill="#EA4335" d="M24 48c5.8 0 10.6-1.9 14.2-5.2l-7.3-5.7c-1.9 1.3-4.3 2-6.9 2-6 0-11.3-3.8-13.2-9.2l-7.4 5.8C7.3 42.6 14.9 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
                            Continue with Google
                        </button>
                         <button className="w-full flex items-center justify-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M12.01,1.76c-2.3,0-4.24,1.62-5.32,1.75c-1.47,0.18-3.04,1.05-4.11,2.73c-1.63,2.58-1.54,6.43,0.3,8.88 c0.98,1.29,2.23,2.44,3.78,2.44c1.47,0,1.93-0.89,3.71-0.89c1.78,0,2.16,0.89,3.71,0.89c1.55,0,2.8-1.15,3.78-2.44 c1.84-2.45,1.93-6.3,0.3-8.88c-1.07-1.68-2.64-2.55-4.11-2.73c-1.08-0.13-2.94-1.75-5.24-1.75 M14.34,0 c-0.12,2.02-1.83,3.58-3.69,3.58s-3.57-1.56-3.69-3.58C7.81,0.02,8.81,0.01,9.6,0.01c1.19,0,2.13,0.48,2.88,0.48 c0.75,0,1.81-0.48,2.88-0.48C16.19,0.01,17.19,0.02,17.22,0C16.48,0,15.19,0,14.34,0"></path></svg>
                            Continue with Apple
                        </button>
                         <button className="w-full flex items-center justify-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="#1877F2" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z"></path></svg>
                            Continue with Facebook
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

