import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * NotificationPersistentPrompt Component
 * Regularly checks for notification permissions and prompts the user
 * if they haven't allowed them yet.
 */
export function NotificationPersistentPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Initial check
        checkPermission();

        // Optional: Re-check on visibility change (re-entering the tab)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkPermission();
            }
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const checkPermission = () => {
        if (!("Notification" in window)) return;

        if (Notification.permission === 'default') {
            // User hasn't decided yet
            setShowPrompt(true);
        } else if (Notification.permission === 'denied') {
            // User explicitly denied. 
            // We can show a prompt explaining HOW to enable it if we want to be persistent.
            // But usually browsers don't allow re-prompting if denied.
            // However, the user asked to "get the popup more times upto they allow it".
            // If denied, the standard browser prompt won't show again.
            // We can show our own custom UI asking them to go to settings.
            setShowPrompt(true);
        } else {
            // Granted
            setShowPrompt(false);
        }
    };

    const handleRequestAction = async () => {
        if (Notification.permission === 'denied') {
            alert("You have blocked notifications. Please enable them in your browser settings (click the lock icon in the address bar) to receive updates.");
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            setShowPrompt(false);
            // Optional: Register for push if needed here
            console.log('Notification permission granted.');
        } else {
            console.log('Notification permission:', permission);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // We will show it again on next visit/refresh because we don't store "dismissed" status
    };

    // Don't show on admin login page
    if (location.pathname === '/admin/login') return null;

    if (!showPrompt) return null;

    return (
        <div className="fixed top-24 right-4 z-[110] animate-in slide-in-from-right-8 fade-in duration-700 ease-out">
            <div className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-blue-50 max-w-sm w-80 relative overflow-hidden group hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] transition-shadow">

                {/* Decorative blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition-colors duration-700" />

                <div className="flex items-start gap-4 relative z-10">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shrink-0 shadow-lg shadow-blue-500/20 text-white relative">
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 ring-2 ring-white"></span>
                        </span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 leading-tight text-base">Stay Updated</h3>
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed font-medium">Don't miss out on flash sales and new product arrivals!</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5 relative z-10">
                    <button
                        onClick={handleDismiss}
                        className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold transition-colors"
                    >
                        Maybe Later
                    </button>
                    <button
                        onClick={handleRequestAction}
                        className="px-4 py-2 bg-gray-900 text-white hover:bg-black rounded-lg text-xs font-bold transition-all shadow-lg shadow-gray-900/10 active:scale-95 flex items-center justify-center gap-1.5"
                    >
                        <span>Enable</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
