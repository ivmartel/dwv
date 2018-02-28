/* global self, caches, Promise */

// https://developers.google.com/web/fundamentals/primers/service-workers/
// chrome: chrome://inspect/#service-workers

var CACHE_NAME = 'dwv-test-cache-v0';
var urlsToCache = [
    './',
    // css
    './css/style.css',
    // js
    './ext/dwv/dwv-0.23.0-beta.min.js',
    './src/applauncher.js',
    './src/appgui.js',
    // images
    './resources/icons/dwv-16.png',
    './resources/icons/dwv-60.png',
    './resources/icons/dwv-128.png',
    './resources/help/double_tap.png',
    './resources/help/tap_and_hold.png',
    './resources/help/tap.png',
    './resources/help/touch_drag.png',
    './resources/help/twotouch_drag.png',
    './resources/help/twotouch_pinch.png',
    // translations
    './locales/de/translation.json',
    './locales/en/translation.json',
    './locales/es/translation.json',
    './locales/fr/translation.json',
    './locales/it/translation.json',
    './locales/jp/translation.json',
    './locales/ru/translation.json',
    './locales/zh/translation.json',
    // overlays
    './locales/de/overlays.json',
    './locales/en/overlays.json',
    './locales/es/overlays.json',
    './locales/fr/overlays.json',
    './locales/it/overlays.json',
    './locales/jp/overlays.json',
    './locales/ru/overlays.json',
    './locales/zh/overlays.json',

    // third party

    // css
    './ext/jquery-mobile/jquery.mobile-1.4.5.min.css',
    './ext/jquery-mobile/images/ajax-loader.gif',
    './ext/jquery-mobile/images/icons-svg/plus-white.svg',
    './ext/jquery-mobile/images/icons-svg/forward-white.svg',
    './ext/jquery-mobile/images/icons-svg/back-white.svg',
    './ext/jquery-mobile/images/icons-svg/info-white.svg',
    './ext/jquery-mobile/images/icons-svg/grid-black.svg',
    './ext/jquery-mobile/images/icons-png/plus-white.png',
    './ext/jquery-mobile/images/icons-png/forward-white.png',
    './ext/jquery-mobile/images/icons-png/back-white.png',
    './ext/jquery-mobile/images/icons-png/info-white.png',
    './ext/jquery-mobile/images/icons-png/grid-black.png',
    // js: dwv
    './ext/modernizr/modernizr.js',
    './ext/i18next/i18next.min.js',
    './ext/i18next/i18nextXHRBackend.min.js',
    './ext/i18next/i18nextBrowserLanguageDetector.min.js',
    './ext/konva/konva.min.js',
    './ext/magic-wand/magic-wand.js',
    './ext/jszip/jszip.min.js',
    // js: viewer
    './ext/jquery/jquery-2.1.4.min.js',
    './ext/jquery-mobile/jquery.mobile-1.4.5.min.js',
    './ext/jquery-mobile/jquery.mobile-1.4.5.min.map',
    './ext/nprogress/nprogress.js',
    './ext/flot/jquery.flot.min.js',
    // js: decoders
    './decoders/pdfjs/jpx.js',
    './decoders/pdfjs/arithmetic_decoder.js',
    './decoders/pdfjs/decode-jpeg2000.js',
    './decoders/pdfjs/util.js',
    './decoders/pdfjs/jpg.js',
    './decoders/pdfjs/decode-jpegbaseline.js',
    './decoders/rii-mango/lossless-min.js',
    './decoders/rii-mango/decode-jpegloss.js'
    ];

// install
self.addEventListener('install', function (event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME).then( function (cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

// fetch
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then( function (response) {
            // Cache hit - return response
            if (response) {
                //console.log('Return form cache', event.request.url);
                return response;
            }
            return fetch(event.request);
        })
    );
});

// activate
self.addEventListener('activate', function (event) {

    var cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Delete cache: '+cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
