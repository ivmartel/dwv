/**
 * Tests for the 'utils/string' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("string");

QUnit.test("Test CapitaliseFirstLetter.", function (assert) {
    // undefined
    assert.equal(dwv.utils.capitaliseFirstLetter(), null, "Capitalise undefined");
    // null
    assert.equal(dwv.utils.capitaliseFirstLetter(null), null, "Capitalise null");
    // empty
    assert.equal(dwv.utils.capitaliseFirstLetter(""), "", "Capitalise empty");
    // short
    assert.equal(dwv.utils.capitaliseFirstLetter("a"), "A", "Capitalise one letter");
    // space first
    assert.equal(dwv.utils.capitaliseFirstLetter(" a"), " a", "Capitalise space");
    // regular
    assert.equal(dwv.utils.capitaliseFirstLetter("dicom"), "Dicom", "Capitalise regular");
    assert.equal(dwv.utils.capitaliseFirstLetter("Dicom"), "Dicom", "Capitalise regular no need");
    // with spaces
    assert.equal(dwv.utils.capitaliseFirstLetter("le ciel est bleu"), "Le ciel est bleu",
            "Capitalise sentence");
});
