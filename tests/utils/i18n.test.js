/**
 * Tests for the 'utils/i18n' file.
 */
/** @module tests/utils */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("i18n");

/**
 * Initialise i18n and check it.
 */
function checkLanguage(language, keys, assert) {
    var done = assert.async();
    // fail test if load fails
    dwv.i18nOnFailedLoad( function (lng /*, ns, msg*/) {
        assert.ok(false, "Failed loading '" + lng + "' language.");
        // stop linstening
        dwv.i18nOffFailedLoad();
        // finish async test
        done();
    });
    // test once initialised
    dwv.i18nOnInitialised( function (/*options*/) {
        // stop linstening
        dwv.i18nOffInitialised();
        // check some values
        for (var i = 0; i < keys.length; ++i ) {
            assert.equal(dwv.i18nExists(keys[i][0]), true, "i18n "+language+" translation exists");
            assert.equal(dwv.i18n(keys[i][0]), keys[i][1], "i18n "+language+" translation is ok");
        }
        // finish async test
        done();
    });
    // initialise with input language
    dwv.i18nInitialise(language, "..");
}

/**
 * Tests for {@link dwv.i18n} with en language.
 * @function module:tests/utils~i18nEn
 */
QUnit.test("Test i18n en.", function (assert) {
    var keys = [["basics.open", "Open"], ["basics.close", "Close"]];
    checkLanguage("en", keys, assert);
});

/**
 * Tests for {@link dwv.i18n} with fr language.
 * @function module:tests/utils~i18nFr
 */
QUnit.test("Test i18n fr.", function (assert) {
    var keys = [["basics.open", "Ouvrir"], ["basics.close", "Fermer"]];
    checkLanguage("fr", keys, assert);
});
