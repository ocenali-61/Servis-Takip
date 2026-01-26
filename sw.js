/**
 * sw.js
 * Service Worker for Offline capability.
 */

const CACHE_NAME = 'servis-takip-v1';
const ASSETS = [
    './',
    './index.html',
    './servisler.html',
    './ogrenciler.html',
    './takip.html',
    './arsiv.html',
    './rapor.html',
    './js/storage.js',
    './js/servis.js',
    './js/ogrenci.js',
    './js/takip.js',
    './js/arsiv.js',
    './js/export.js',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});
