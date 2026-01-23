import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * AnnouncementPopup Component
 * Fetches the latest announcement and displays it as a popup
 * if the user hasn't seen it yet.
 */
export function AnnouncementPopup() {
    const [latestAnnouncement, setLatestAnnouncement] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Don't show popup on the Announcements page itself
        if (location.pathname === '/announcements') {
            setIsVisible(false);
            return;
        }

        const fetchLatestAnnouncement = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const response = await fetch(`${API_URL}/announcements`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        const latest = data[0]; // Assuming API returns sorted by date desc
                        checkIfSeen(latest);
                    }
                }
            } catch (error) {
                console.error('Error checking for announcements:', error);
            }
        };

        fetchLatestAnnouncement();
    }, [location.pathname]);

    const checkIfSeen = (announcement) => {
        const seenId = localStorage.getItem('last_seen_announcement_id');
        if (seenId !== announcement._id) {
            setLatestAnnouncement(announcement);
            // Slight delay for better UX
            setTimeout(() => setIsVisible(true), 2000);
        }
    };

    const handleDismiss = () => {
        if (latestAnnouncement) {
            localStorage.setItem('last_seen_announcement_id', latestAnnouncement._id);
        }
        setIsVisible(false);
    };

    if (!latestAnnouncement || !isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <div
                className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-white/20 max-w-md w-full pointer-events-auto transform transition-all animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 relative overflow-hidden"
            >
                {/* Decorative header background */}
                <div className="h-1.5 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 w-full absolute top-0 left-0"></div>

                <div className="p-6 md:p-8">
                    <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-2.5 w-2.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                            <span className="text-[11px] font-bold tracking-widest text-primary-600 uppercase bg-primary-50 px-2 py-1 rounded-md border border-primary-100">New Updates</span>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-full p-2 transition-all"
                            aria-label="Close"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">{latestAnnouncement.title}</h3>

                    <div className="prose prose-sm text-gray-600 mb-8 max-h-48 overflow-y-auto custom-scrollbar leading-relaxed">
                        <p className="whitespace-pre-wrap">{latestAnnouncement.message}</p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={async () => {
                                handleDismiss();
                                // Try to subscribe to notifications
                                if ('serviceWorker' in navigator && 'PushManager' in window) {
                                    try {
                                        const register = await navigator.serviceWorker.ready;
                                        const subscription = await register.pushManager.subscribe({
                                            userVisibleOnly: true,
                                            applicationServerKey: urlBase64ToUint8Array('BAyPKzO7w9lvfsg-oITsS4QFvFw1M9rRYAFoVtKuxCS7mJYKOH6M4UgWMUIV9vEBjdTZF7-A-fZZNq4oitiWNcg')
                                        });

                                        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                                        await fetch(`${API_URL}/subscribe`, {
                                            method: 'POST',
                                            body: JSON.stringify(subscription),
                                            headers: {
                                                'Content-Type': 'application/json'
                                            }
                                        });
                                        console.log('User subscribed to notifications');
                                    } catch (error) {
                                        console.error('Failed to subscribe user', error);
                                    }
                                }
                            }}
                            className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-900/10 active:scale-95 text-sm tracking-wide"
                        >
                            Okay, Got it
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
