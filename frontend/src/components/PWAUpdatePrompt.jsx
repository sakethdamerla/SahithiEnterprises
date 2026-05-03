import { useRegisterSW } from 'virtual:pwa-register/react'
import { useEffect } from 'react';

/**
 * PWAUpdatePrompt Component
 * Shows a popup when a Service Worker update is available
 * and allows the user to reload the page to get the latest version.
 */
export function PWAUpdatePrompt() {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered');
            // Check for updates every 5 minutes (reduced from 60 mins for faster updates)
            if (r) {
                setInterval(() => {
                    r.update();
                }, 5 * 60 * 1000);
            }
        },
        onRegisterError(error) {
            console.log('SW registration error', error)
        },
    })

    // Check for updates when the window/app gains focus
    useEffect(() => {
        const handleFocus = () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistration().then(reg => {
                    if (reg) reg.update();
                });
            }
        };

        window.addEventListener('focus', handleFocus);
        
        // Also check immediately on mount
        handleFocus();

        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    const close = () => {
        setNeedRefresh(false)
    }

    if (!needRefresh) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:right-auto md:left-4 z-[100] animate-in slide-in-from-bottom duration-700 ease-out">
            <div className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-primary-100 max-w-sm w-full relative overflow-hidden group hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] transition-shadow">
                
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary-400/20 transition-colors duration-700"></div>

                <div className="relative z-10">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500 ring-2 ring-white"></span>
                        </span>
                        Update Available
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed font-medium">
                        A new version of Sahithi Enterprises is available. Update now for the latest features!
                    </p>
                </div>

                <div className="flex flex-col gap-2 relative z-10 mt-5">
                    <button
                        className="w-full bg-[#5E35B1] text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-[#5E35B1] shadow-lg shadow-gray-900/10 transition-all active:scale-95 flex justify-center items-center gap-2"
                        onClick={() => updateServiceWorker(true)}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Update Now
                    </button>
                    <button
                        className="w-full bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
                        onClick={close}
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    )
}
