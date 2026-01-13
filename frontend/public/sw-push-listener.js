self.addEventListener('push', function (event) {
    let data = { title: 'New Announcement', body: 'Check it out!', icon: '/pwa-192x192.png' };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            console.error('Push data parse error', e);
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
            url: self.location.origin + '/announcements'
        },
        actions: [
            { action: 'explore', title: 'View Announcement', icon: '/pwa-192x192.png' },
            { action: 'close', title: 'Close', icon: '/pwa-192x192.png' },
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            // If app is open, focus it
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url === '/' || client.url.includes('announcements') && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not open, open it
            if (clients.openWindow) {
                return clients.openWindow('/announcements');
            }
        })
    );
});
