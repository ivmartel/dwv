// Inspired from umdjs
// See https://github.com/umdjs/umd/blob/master/templates/returnExports.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'i18next',
            'i18next-xhr-backend',
            'i18next-browser-languagedetector',
            'konva'
        ], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(
            require('i18next'),
            require('i18next-xhr-backend'),
            require('i18next-browser-languagedetector'),
            require('konva')
        );
    } else {
        // Browser globals (root is window)
        root.dwv = factory(
            root.i18next,
            root.i18nextXHRBackend,
            root.i18nextBrowserLanguageDetector,
            root.Konva
        );
    }
}(this, function (
    i18next,
    i18nextXHRBackend,
    i18nextBrowserLanguageDetector,
    Konva) {
