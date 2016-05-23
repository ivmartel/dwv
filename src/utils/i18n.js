// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.utils = dwv.utils || {};
// external
var i18next = i18next || {};
var i18nextXHRBackend = i18nextXHRBackend || {};
var i18nextBrowserLanguageDetector = i18nextBrowserLanguageDetector || {};

// This is mainly a wrapper around the i18next object.
// see its API: http://i18next.com/docs/api/

/**
 * Initialise i18n.
 * @param {String} language The language to translate to. Defaults to 'auto' and 
 *   gets the language from the browser.
 * @param {String} localesPath Path the locales directory.
 */
dwv.i18nInitialise = function (language, localesPath)
{
    var lng = (typeof language === "undefined") ? "auto" : language;
    var lpath = (typeof localesPath === "undefined") ? "" : localesPath;
    // i18n options: default 'en' language and
    //  only load language, not specialised (for ex en-GB)  
    var options = {
        fallbackLng: "en",
        load: "languageOnly",
        backend: { loadPath: lpath + "/locales/{{lng}}/{{ns}}.json" }
    };
    // use the XHR backend to get translation files
    var i18n = i18next.use(i18nextXHRBackend);
    // use browser language or the specified one
    if (lng == "auto") {
        i18n.use(i18nextBrowserLanguageDetector);
    }
    else {
        options.lng = lng;
    }
    // init i18n: will be ready when the 'loaded' event is fired
    i18n.init(options);
};
    
/**
 * Handle i18n load event.
 * @param {Object} callback The callback function to call when i18n is loaded.
 */
dwv.i18nOnLoaded = function (callback) {
    i18next.on('loaded', callback);
};

/**
 * Get the translated text.
 * @param {String} key The key to the text entry.
 * @param {Object} options The translation options such as plural, context...
 */
dwv.i18n = function (key, options) {
    return i18next.t(key, options);
};

/**
 * Check the existence of a translation.
 * @param {String} key The key to the text entry.
 * @param {Object} options The translation options such as plural, context...
 */
dwv.i18nExists = function (key, options) {
    return i18next.exists(key, options);
};

/**
 * Translate all data-i18n tags in the current html page. If an html tag defines the 
 * data-i18n attribute, its value will be used as key to find its corresponding text
 * and will replace the content of the html tag.
 */
dwv.i18nPage = function () {
    // get all elements
    var elements = document.getElementsByTagName("*");
    // if the element defines data-i18n, replace its content with the tranlation
    for (var i = 0; i < elements.length; ++i) { 
        if (typeof elements[i].dataset.i18n !== "undefined") {
            elements[i].innerHTML = dwv.i18n(elements[i].dataset.i18n);
        }
    }
};
