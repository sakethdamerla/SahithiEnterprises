import { useState, useEffect } from 'react';

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        if (isIosDevice) {
            // Check if already in standalone mode
            const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator.standalone);
            if (!isInStandaloneMode) {
                // Show iOS instructions after a slight delay
                setTimeout(() => setShowPrompt(true), 2000);
            }
        }

        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            if (!isIosDevice) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        window.addEventListener('appinstalled', () => {
            setShowPrompt(false);
            setDeferredPrompt(null);
            console.log('PWA was installed');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    if (isIOS) {
        return (
            <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-[200] animate-in slide-in-from-bottom duration-700 ease-out">
                <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 relative max-w-sm ml-auto ring-1 ring-black/5">
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 bg-gray-50/50 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="flex gap-4">
                        <div className="bg-gradient-to-br from-gray-100 to-gray-50 h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-inner">
                            📱
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg tracking-tight">Install App</h3>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">Add to your Home Screen for the best experience.</p>

                            <div className="mt-4 text-sm text-gray-700 bg-gray-50/80 p-3 rounded-xl space-y-2 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center w-6 h-6 bg-white rounded-lg shadow-sm text-blue-500 ring-1 ring-gray-100">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                    </span>
                                    <span>Tap the <span className="font-bold text-gray-900">Share</span> button</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center w-6 h-6 bg-white rounded-lg shadow-sm ring-1 ring-gray-100">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    </span>
                                    <span>Select <span className="font-bold text-gray-900">Add to Home Screen</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-[200] animate-in slide-in-from-bottom-10 fade-in duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
            <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-5 rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] border border-gray-100/50 flex flex-col sm:flex-row items-center gap-4 sm:max-w-md w-full relative overflow-hidden group">
                {/* Gloss effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="flex items-center gap-4 w-full sm:w-auto z-10">
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl shrink-0 shadow-lg shadow-primary-500/30 text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-base">Install App</h3>
                        <p className="text-xs text-gray-500 font-medium">Add to home screen for quick access</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end z-10 pl-2">
                    <button
                        onClick={handleDismiss}
                        className="text-gray-400 hover:text-gray-600 text-sm font-semibold px-2 transition-colors"
                    >
                        Later
                    </button>
                    <button
                        onClick={handleInstallClick}
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 shadow-xl shadow-gray-900/20 active:scale-95 transition-all w-full sm:w-auto"
                    >
                        Install Now
                    </button>
                </div>
            </div>
        </div>
    );
}
