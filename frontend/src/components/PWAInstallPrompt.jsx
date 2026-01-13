import { useState, useEffect } from 'react';

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setShowPrompt(true);
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
        // sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t sm:border-t-0 sm:border md:border-t-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:shadow-xl z-50 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 sm:bottom-auto sm:top-4 sm:left-auto sm:right-4 sm:w-96 sm:rounded-xl animate-in slide-in-from-bottom duration-500">
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="bg-primary-100 p-2 rounded-lg shrink-0">
                    <span className="text-2xl">📱</span>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Install App</h3>
                    <p className="text-xs text-gray-600">Get a better experience</p>
                </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                    onClick={handleDismiss}
                    className="text-gray-500 hover:text-gray-700 font-medium text-sm px-2"
                >
                    Not now
                </button>
                <button
                    onClick={handleInstallClick}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-700 shadow-md shadow-primary-600/20 active:scale-95 transition-all flex-1 sm:flex-none text-center"
                >
                    Install
                </button>
            </div>
        </div>
    );
}
