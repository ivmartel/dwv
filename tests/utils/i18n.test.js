/**
 * Tests for the 'utils/i18n' file.
 */
/** @module tests/utils */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("i18n");

/**
 *
 */
function checkLanguage(language, keys, assert) {
    var done = assert.async();
    // initialise with auto language
    dwv.i18nInitialise(language, "..");
    // fail test if load fails
    dwv.i18nOnFailedLoad( function (lng /*, ns, msg*/) {
        assert.ok(false, "Failed loading '" + lng + "' language.");
        // stop linstening
        dwv.i18nOffFailedLoad();
        // finish async test
        done();
    });
    // test once loaded
    dwv.i18nOnLoaded( function (/*loaded*/) {
        // check some values
        for (var i = 0; i < keys.length; ++i ) {
            assert.equal(dwv.i18nExists(keys[i][0]), true, "i18n "+language+" translation exists");
            assert.equal(dwv.i18n(keys[i][0]), keys[i][1], "i18n "+language+" translation is ok");
        }
        // stop linstening
        dwv.i18nOffLoaded();
        // finish async test
        done();
    });
}

/**
 * Tests for {@link dwv.i18n} with en language.
 * @function module:tests/i18n
 */
QUnit.test("Test i18n en.", function (assert) {
    var keys = [["basics.open", "Open"], ["basics.close", "Close"]];
    checkLanguage("en", keys, assert);
});

/**
 * Tests for {@link dwv.i18n} with fr language.
 * @function module:tests/i18n
 */
QUnit.test("Test i18n fr.", function (assert) {
    var keys = [["basics.open", "Ouvrir"], ["basics.close", "Fermer"]];
    checkLanguage("fr", keys, assert);
});
