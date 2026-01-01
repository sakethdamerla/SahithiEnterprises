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
        <div className="fixed top-0 left-0 right-0 p-4 bg-white border-b items-center justify-between shadow-xl z-50 flex sm:top-4 sm:left-auto sm:right-4 sm:w-96 sm:rounded-xl sm:border">
            <div className="flex items-center gap-3">
                <div className="bg-primary-100 p-2 rounded-lg">
                    <span className="text-2xl">📱</span>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Install App</h3>
                    <p className="text-xs text-gray-600">Get a better experience</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleDismiss}
                    className="text-gray-400 hover:text-gray-600 p-1"
                >
                    ✕
                </button>
                <button
                    onClick={handleInstallClick}
                    className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-700"
                >
                    Install
                </button>
            </div>
        </div>
    );
}
