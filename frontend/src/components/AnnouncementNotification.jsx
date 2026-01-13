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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 pointer-events-none">
            <div
                className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full pointer-events-auto transform transition-all animate-in slide-in-from-bottom duration-500 relative overflow-hidden"
            >
                {/* Decorative header background */}
                <div className="h-2 bg-gradient-to-r from-primary-400 to-primary-600 w-full absolute top-0 left-0"></div>

                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span className="text-xs font-bold tracking-wider text-primary-600 uppercase">New Announcement</span>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            aria-label="Close"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{latestAnnouncement.title}</h3>

                    <div className="prose prose-sm text-gray-600 mb-6 max-h-40 overflow-y-auto custom-scrollbar">
                        <p className="whitespace-pre-wrap">{latestAnnouncement.message}</p>
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 active:scale-95"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
}
