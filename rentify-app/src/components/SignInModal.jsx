import React from 'react';
import Modal from 'react-modal';
import { X } from 'lucide-react';
import {
  GoogleLoginButton,
  FacebookLoginButton,
  MicrosoftLoginButton,
  AppleLoginButton,
} from 'react-social-login-buttons';
import { GoogleLogin } from '@react-oauth/google';

// --- Helper component for providers not in the library ---
// The library doesn't include Yahoo, so we create a custom one.
const YahooLoginButton = ({ onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-center py-2.5 px-3.5 mt-4 text-sm font-medium text-white bg-[#6001d2] rounded-md shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6001d2]"
    >
        {/* Basic SVG for Yahoo logo */}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.001 2C6.478 2 2 6.477 2 12s4.478 10 10.001 10C17.524 22 22 17.523 22 12S17.524 2 12.001 2zm.07 17.135c-2.435 0-4.04-1.288-4.04-3.565 0-2.033 1.254-3.08 2.723-3.08 1.15 0 1.83.46 2.14.93l-.86 1.13c-.235-.353-.614-.658-1.13-.658-.69 0-1.29.56-1.29 1.554 0 1.15.72 1.777 1.48 1.777.62 0 1.21-.33 1.58-.87l.86 1.05c-.56.76-1.52 1.287-2.493 1.287zm4.56-5.462c0-.52-.08-.94-.2-1.3l-.9.3c.08.3.12.6.12.9 0 .5-.12 1.03-.33 1.43l.9.45c.32-.58.41-1.26.41-2.18z"/></svg>
        <span className="ml-3">Sign in with Yahoo</span>
    </button>
);


// --- Main Modal Component ---
const SignInModal = ({ isOpen, onClose }) => {
    // --- Authentication Handlers (Placeholders) ---
    // In a real app, these would trigger the OAuth flow with a library
    // like @react-oauth/google, Firebase Auth, or Auth0.

    const handleGoogleSuccess = async (credentialResponse) => {
        console.log('Google Sign-In Success:', credentialResponse);
        const idToken = credentialResponse.credential;

        try {
            // Send the ID token to your backend
            const response = await fetch('/api/auth/google', { // Assuming proxy is set up
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: idToken }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Google sign-in failed.');
            }

            const data = await response.json();
            console.log('Backend authentication successful:', data);

            // TODO: Update your app's state to reflect the logged-in user
            // e.g., setUser(data.user);
            
            onClose(); // Close the modal upon success

        } catch (error) {
            console.error('Error during Google sign-in:', error);
            // TODO: Show an error message to the user in the UI
        }
    };

    const handleGoogleError = () => {
        console.error('Google Sign-In failed.');
        // TODO: Show an error message
    };

    const handleSignInWithFacebook = () => {
        console.log('Signing in with Facebook...');
        onClose();
    };

    const handleSignInWithMicrosoft = () => {
        console.log('Signing in with Microsoft...');
        onClose();
    };
    
    const handleSignInWithApple = () => {
        console.log('Signing in with Apple...');
        onClose();
    };

    const handleSignInWithYahoo = () => {
        console.log('Signing in with Yahoo...');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Sign In"
            // Basic styling for the modal
            style={{
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    zIndex: 20,
                },
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '2rem',
                    maxWidth: '400px',
                    width: '90%',
                },
            }}
            appElement={document.getElementById('root') || undefined}
        >
            <div className="relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-0 right-0 text-gray-400 hover:text-gray-800"
                >
                    <X size={24} />
                </button>

                {/* Modal Content */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                    <p className="text-gray-500 mb-6">Sign in to continue with Rentify.</p>
                </div>
                
                {/* Provider Buttons */}
                <div className="flex flex-col space-y-2">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        shape="rectangular"
                        width="300px" // Adjust width as needed
                    />
                    <FacebookLoginButton onClick={handleSignInWithFacebook} />
                    <MicrosoftLoginButton onClick={handleSignInWithMicrosoft} />
                    <AppleLoginButton onClick={handleSignInWithApple} />
                    <YahooLoginButton onClick={handleSignInWithYahoo} />
                </div>
            </div>
        </Modal>
    );
};

export default SignInModal;