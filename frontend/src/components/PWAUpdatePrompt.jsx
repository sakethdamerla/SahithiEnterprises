import { useRegisterSW } from 'virtual:pwa-register/react'
import { useState, useEffect } from 'react';

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
            console.log('SW Registered: ', r)
        },
        onRegisterError(error) {
            console.log('SW registration error', error)
        },
    })

    // State to control prompt visibility based on version check
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        if (needRefresh) {
            checkVersion();
        }
    }, [needRefresh]);

    const checkVersion = async () => {
        try {
            const response = await fetch('/manifest.json');
            const manifest = await response.json();
            const serverVersion = manifest.version;
            const localVersion = localStorage.getItem('pwaVersion');

            // Show prompt only if version changed or never stored
            if (serverVersion && serverVersion !== localVersion) {
                setShowPrompt(true);
            } else if (!localVersion) {
                // First time visit or no version stored, but update available.
                setShowPrompt(true);
            }
        } catch (error) {
            console.error('Failed to check PWA version:', error);
        }
    };

    // Reload the page to activate the new SW
    const handleUpdate = async () => {
        try {
            // Unregister SW
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
            }
            // Clear Caches
            if ('caches' in window) {
                const keys = await caches.keys();
                for (const key of keys) {
                    await caches.delete(key);
                }
            }

            // Store the new version so we don't prompt again for the same version
            const response = await fetch('/manifest.webmanifest');
            const manifest = await response.json();
            if (manifest.version) {
                localStorage.setItem('pwaVersion', manifest.version);
            }

            // Redirect/Reload to site
            window.location.reload();
        } catch (e) {
            console.error("Update/Uninstall failed", e);
            // Fallback reload
            window.location.reload();
        }
    }

    if (!showPrompt) return null;

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
                        className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-black shadow-lg shadow-gray-900/10 transition-all active:scale-95 flex justify-center items-center gap-2"
                        onClick={handleUpdate}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Update Now
                    </button>
                </div>
            </div>
        </div>
    )
}
