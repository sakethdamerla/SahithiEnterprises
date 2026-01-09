import { useRegisterSW } from 'virtual:pwa-register/react'

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

    // Close the prompt without updating
    const close = () => {
        setNeedRefresh(false)
    }

    // Reload the page to activate the new SW
    const handleUpdate = () => {
        updateServiceWorker(true);
    }

    if (!needRefresh) return null;

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
            </div>
        </div>
    )
}
