self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
    // Simple fetch passthrough for now to ensure dynamic API calls work
    // A real PWA would cache static assets here
    e.respondWith(
        fetch(e.request).catch(err => {
            console.error('Fetch failed:', e.request.url, err);
            // Optional: return a fallback response for images if offline
            return new Response('Network error occurred', {
                status: 408,
                headers: { 'Content-Type': 'text/plain' },
            });
        })
    );
});
