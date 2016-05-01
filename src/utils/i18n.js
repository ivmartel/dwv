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
