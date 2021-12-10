// Inspired from umdjs
// See https://github.com/umdjs/umd/blob/master/templates/returnExports.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'i18next',
            'i18next-http-backend',
            'i18next-browser-languagedetector',
            'jszip',
            'konva',
            'magic-wand-tool'
        ], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.

        // Konva: requires 'canvas'
        module.exports = factory(
            require('i18next'),
            require('i18next-http-backend'),
            require('i18next-browser-languagedetector'),
            require('jszip'),
            require('konva/cmj'),
            require('magic-wand-tool')
        );
    } else {
        // Browser globals (root is window)
        root.dwv = factory(
            root.i18next,
            root.i18nextHttpBackend,
            root.i18nextBrowserLanguageDetector,
            root.JSZip,
            root.Konva,
            root.MagicWand
        );
    }
}(this, function (
    i18next,
    i18nextHttpBackend,
    i18nextBrowserLanguageDetector,
    JSZip,
    Konva,
    MagicWand) {

    // similar to what browserify does but reversed
    // https://www.contentful.com/blog/2017/01/17/the-global-object-in-javascript/
    var window = typeof window !== 'undefined' ?
        window : typeof self !== 'undefined' ?
        self : typeof global !== 'undefined' ?
        global : {};

    // if it has a default, treat it as ESM
    var isEsmModule = function (mod) {
      return typeof mod !== 'undefined' &&
        typeof mod.default !== 'undefined';
    }
    // i18next (>v17) comes as a module, see #862
    if (isEsmModule(i18next)) {
      i18next = i18next.default;
    }
    if (isEsmModule(i18nextHttpBackend)) {
      i18nextHttpBackend = i18nextHttpBackend.default;
    }
    if (isEsmModule(i18nextBrowserLanguageDetector)) {
      i18nextBrowserLanguageDetector = i18nextBrowserLanguageDetector.default;
    }
    // Konva (>=v8) comes as a module, see #1044
    if (isEsmModule(Konva)) {
      Konva = Konva.default;
    }
