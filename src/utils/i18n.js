// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.utils = dwv.utils || {};
//external
var i18next = i18next || {};
var i18nextXHRBackend = i18nextXHRBackend || {};

var devlng = {
};

/**
 * Initialise i18n.
 */
dwv.i18nInitialise = function ()
{
    var options = {
        lng: "fr",
        fallbackLng: "en",
        debug: true           
    };

    i18next.use(i18nextXHRBackend).init(options, function() {
        // in case no translation file is found
        if ( !i18next.hasResourceBundle("en", "translation") ) {
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
