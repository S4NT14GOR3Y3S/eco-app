/* ============================================
   SERVICE-WORKER.JS - Para Funcionar Offline
   ============================================ */

const CACHE_NAME = 'eco-v1.0.0';
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/colors.css',
    '/css/styles.css',
    '/css/animations.css',
    '/js/app.js',
    '/js/storage.js',
    '/js/audio.js',
    '/js/activities.js',
    // Fuentes de Google Fonts se cachearán dinámicamente
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Cacheando archivos');
                return cache.addAll(CACHE_ASSETS);
            })
            .then(() => {
                console.log('✅ Service Worker: Instalado correctamente');
                return self.skipWaiting(); // Activar inmediatamente
            })
            .catch((error) => {
                console.error('❌ Error al cachear archivos:', error);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('⚡ Service Worker: Activando...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cache) => {
                        // Eliminar caches antiguas
                        if (cache !== CACHE_NAME) {
                            console.log('🗑️ Service Worker: Eliminando cache antigua:', cache);
                            return caches.delete(cache);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activado');
                return self.clients.claim(); // Tomar control de todas las páginas
            })
    );
});

// Interceptar peticiones (Fetch)
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar peticiones que no sean HTTP/HTTPS
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Estrategia: Cache First, Network Fallback
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                // Si está en cache, devolver
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Si no, ir a la red
                return fetch(request)
                    .then((networkResponse) => {
                        // No cachear si no es una respuesta válida
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
                            return networkResponse;
                        }

                        // Cachear recursos externos dinámicamente
                        // (como fuentes de Google, imágenes que se cargan después, etc.)
                        if (shouldCache(url)) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(request, responseToCache);
                                });
                        }

                        return networkResponse;
                    })
                    .catch((error) => {
                        console.warn('🌐 Sin conexión, no hay cache para:', request.url);
                        
                        // Si es una navegación, devolver página offline personalizada
                        if (request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        // Para otros recursos, simplemente fallar silenciosamente
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Determinar si un recurso debe ser cacheado dinámicamente
function shouldCache(url) {
    // Cachear recursos de la misma origin
    if (url.origin === location.origin) {
        return true;
    }

    // Cachear fuentes de Google Fonts
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        return true;
    }

    // No cachear otros recursos externos por defecto
    return false;
}

// Escuchar mensajes del cliente (para comunicación)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    // Responder con información del cache
    if (event.data && event.data.type === 'GET_CACHE_INFO') {
        caches.open(CACHE_NAME)
            .then((cache) => cache.keys())
            .then((requests) => {
                event.ports[0].postMessage({
                    cacheName: CACHE_NAME,
                    cachedUrls: requests.map(req => req.url)
                });
            });
    }

    // Forzar actualización del cache
    if (event.data && event.data.type === 'FORCE_UPDATE') {
        caches.delete(CACHE_NAME)
            .then(() => {
                return caches.open(CACHE_NAME);
            })
            .then((cache) => {
                return cache.addAll(CACHE_ASSETS);
            })
            .then(() => {
                event.ports[0].postMessage({ success: true });
            })
            .catch((error) => {
                event.ports[0].postMessage({ success: false, error: error.message });
            });
    }
});

// Sincronización en segundo plano (para futuras funcionalidades)
self.addEventListener('sync', (event) => {
    console.log('🔄 Background Sync:', event.tag);
    
    if (event.tag === 'sync-progress') {
        event.waitUntil(
            // Aquí podrías sincronizar el progreso del usuario con un servidor
            // Por ahora, ECO funciona 100% offline
            Promise.resolve()
        );
    }
});

// Notificaciones Push (para futuras funcionalidades)
self.addEventListener('push', (event) => {
    console.log('📬 Push Notification recibida');
    
    const options = {
        body: event.data ? event.data.text() : '¡Sigue aprendiendo con ECO!',
        icon: '/assets/images/ui/icon-192.png',
        badge: '/assets/images/ui/icon-72.png',
        vibrate: [200, 100, 200],
        tag: 'eco-notification',
        requireInteraction: false
    };

    event.waitUntil(
        self.registration.showNotification('ECO - Educación Cognitiva', options)
    );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Click en notificación');
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});

console.log('🦜 Service Worker de ECO cargado');