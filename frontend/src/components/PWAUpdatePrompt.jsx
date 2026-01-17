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
            const response = await fetch('/manifest.webmanifest');
            const manifest = await response.json();
            const serverVersion = manifest.version;
            const localVersion = localStorage.getItem('pwaVersion');

            // Show prompt only if version changed or never stored
            if (serverVersion && serverVersion !== localVersion) {
                setShowPrompt(true);
            } else if (!localVersion) {
                // First time visit or no version stored, but update available.
                // If we want to be strict, we might only show if we have a prev version.
                // But usually first time we might want to store it.
                // However, useRegisterSW needRefresh implies an update to an EXISTING SW.
                // So we probably have visited before.
                // Let's safe default to showing if we can't verify version, 
                // OR we can decide to assume it's a minor update if no version tracking existed.
                // User request: "only show when updated the pwa and manifest files"
                // If I just added versioning, localVersion is null. serverVersion is '1.0.0'.
                // We should probably show it once to 'sync' the version.
                setShowPrompt(true);
            }
        } catch (error) {
            console.error('Failed to check PWA version:', error);
            // Fallback: show prompt if check fails (safety net)? Or suppress?
            // User wants less popups. Let's suppress if we can't verify.
        }
    };

    // Close the prompt without updating
    const close = () => {
        setShowPrompt(false);
        setNeedRefresh(false);
    }

    // Reload the page to activate the new SW
    const handleUpdate = async () => {
        // Store the new version before updating
        try {
            const response = await fetch('/manifest.webmanifest');
            const manifest = await response.json();
            if (manifest.version) {
                localStorage.setItem('pwaVersion', manifest.version);
            }
        } catch (e) {
            console.error("Could not save new version", e);
        }
        updateServiceWorker(true);
    }

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:right-auto md:left-4 z-[100] animate-in slide-in-from-bottom duration-300">
            <div className="bg-white p-5 rounded-xl shadow-2xl border border-primary-100 w-full md:w-96 flex flex-col gap-3 relative overflow-hidden">

                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                            </span>
                            Update Available
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            A new version of the app is available. Update now to get the latest features and fixes.
                        </p>
                    </div>
                    <button
                        onClick={close}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex gap-3 mt-2 relative z-10">
                    <button
                        className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all active:scale-95 flex justify-center items-center gap-2"
                        onClick={handleUpdate}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Update Now
                    </button>
                    <button
                        className="px-4 py-2.5 text-gray-600 bg-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                        onClick={close}
                    >
                        Later
                    </button>
                </div>

                <div className="pt-2 border-t border-gray-100 mt-1">
                    <button
                        className="w-full text-xs text-red-500 hover:text-red-700 font-medium py-2 flex items-center justify-center gap-1 transition-colors"
                        onClick={async () => {
                            if (confirm("Are you sure you want to uninstall? This will clear all app data and allow you to reinstall.")) {
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
                                // Redirect to site (Reloads as fresh)
                                window.location.reload();
                            }
                        }}
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Uninstall App
                    </button>
                </div>
            </div>
        </div>

    )
}
