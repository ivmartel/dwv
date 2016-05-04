// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.utils = dwv.utils || {};
//external
var i18next = i18next || {};
var i18nextXHRBackend = i18nextXHRBackend || {};
var i18nextBrowserLanguageDetector = i18nextBrowserLanguageDetector || {};

var devlng = {
};

/**
 * Initialise i18n.
 * @param {String} language The language to translate to. Defaults to 'auto' and 
 *   gets the language from the browser.
 */
dwv.i18nInitialise = function (language)
{
    var lng = (typeof language === "undefined") ? "auto" : language;
    
    var options = {
        fallbackLng: "en",
        //debug: true           
    };
    
    var i18n = i18next.use(i18nextXHRBackend);
    
    if (lng != "auto") {
        options.lng = lng;
    }
    else {
        i18n.use(i18nextBrowserLanguageDetector);
    }
    
    i18n.init(options, function() {
        // in case no translation file is found
        if ( !i18next.hasResourceBundle("en", "translation") ) {
            console.log("Loading backup translation.");
            i18next.addResourceBundle("en", "translation", devlng);
        }
    });
};
    
/**
 * Handle i18n load event.
 */
dwv.i18nOnLoaded = function (callback) {
    i18next.on('loaded', callback);
};

/**
 * Get the translated text.
 */
dwv.i18n = function (text, options) {
    return i18next.t(text, options);
};

/**
 * Check the existence of a translation.
 */
dwv.i18nExists = function (text, options) {
    return i18next.exists(text, options);
};

/**
 * Translate all data-i18n tags.
 */
dwv.i18nPage = function () {
    var elements = document.getElementsByTagName("*");
    for (var i = 0; i < elements.length; ++i) { 
        if (typeof elements[i].dataset.i18n !== "undefined") {
            elements[i].innerHTML = dwv.i18n(elements[i].dataset.i18n);
        }
    }
};
