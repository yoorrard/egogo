import React, { useEffect, useRef } from 'react';
import type { User } from '../types';

// Fix: Add declaration for the google object from the Google Identity Services script.
// This resolves the "Cannot find name 'google'" TypeScript error.
declare const google: any;

interface LoginScreenProps {
    onLoginSuccess: (user: User) => void;
}

// A simple JWT parser
const parseJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error parsing JWT", e);
        return null;
    }
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const signInButtonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleCredentialResponse = (response: any) => {
            const credential = response.credential;
            if (credential) {
                const userData = parseJwt(credential);
                if (userData) {
                    onLoginSuccess({
                        name: userData.name,
                        email: userData.email,
                        picture: userData.picture,
                    });
                }
            }
        };

        const initializeGsi = () => {
            if (typeof google === 'undefined' || !signInButtonRef.current) {
                console.error("Google Identity Services not available or button not rendered.");
                return;
            }
            
            const GOOGLE_CLIENT_ID = "406527223943-unl6afnco1as8mnd9gvvfoisefvecr5k.apps.googleusercontent.com";
        
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
            });
            
            google.accounts.id.renderButton(
                signInButtonRef.current,
                { theme: "outline", size: "large", text: "signin_with", shape: "pill", width: "300" }
            );
        };
        
        // Check if the script is already loaded
        if (typeof google !== 'undefined') {
            initializeGsi();
            return;
        }

        // If not loaded, create and append the script tag
        const script = document.createElement('script');
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initializeGsi;
        script.onerror = () => {
            console.error("Google Identity Services script failed to load.");
        };

        document.body.appendChild(script);

        // Cleanup function to remove the script when the component unmounts
        return () => {
            const scriptTag = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (scriptTag) {
                document.body.removeChild(scriptTag);
            }
        };

    }, [onLoginSuccess]);

    return (
        <div className="w-full max-w-md mx-auto text-center flex flex-col items-center justify-center h-screen p-4">
             <div className="mb-12">
                <h1 className="text-7xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF8FAB] to-[#A2D2FF]">
                    에고고
                </h1>
                <p className="text-[#7A7C8B] mt-4 text-2xl">AI 페르소나와 대화하며 나를 발견하는 시간</p>
            </div>
            
            <div ref={signInButtonRef} id="googleSignInButton"></div>
            
            <p className="text-xs text-gray-400 mt-12 px-4">
                Google 계정으로 로그인하여 나만의 '에고'와 대화를 시작해보세요. 당신의 이야기는 안전하게 보호됩니다.
            </p>
        </div>
    );
};

export default LoginScreen;