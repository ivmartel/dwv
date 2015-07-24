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

QUnit.test("Test splitQueryString.", function (assert) {
    // using JSON.stringify to compare objects
    var strEmpty = JSON.stringify({});
    
    // undefined
    var res00 = dwv.utils.splitQueryString();
    assert.equal(JSON.stringify(res00), strEmpty, "Split null");
    // null
    var res01 = dwv.utils.splitQueryString(null);
    assert.equal(JSON.stringify(res01), strEmpty, "Split null");
    // empty
    var res02 = dwv.utils.splitQueryString("");
    assert.equal(JSON.stringify(res02), strEmpty, "Split empty");
    
    // test10
    var test10 = "root?key0";
    var res10 = dwv.utils.splitQueryString(test10);
    var ref10 = {'base': "root", 'query': {}};
    assert.equal(JSON.stringify(res10), JSON.stringify(ref10), "Split test10");
    // test11
    var test11 = "root?key0=val00";
    var res11 = dwv.utils.splitQueryString(test11);
    var ref11 = {'base': "root", 'query': {'key0': "val00"}};
    assert.equal(JSON.stringify(res11), JSON.stringify(ref11), "Split test11");
    
    // test20
    var test20 = "root?key0=val00&key1";
    var res20 = dwv.utils.splitQueryString(test20);
    var ref20 = {'base': "root", 'query': {'key0': "val00"}};
    assert.equal(JSON.stringify(res20), JSON.stringify(ref20), "Split test20");
    // test21
    var test21 = "root?key0=val00&key1=val10";
    var res21 = dwv.utils.splitQueryString(test21);
    var ref21 = {'base': "root", 'query': {'key0': "val00", 'key1': "val10"}};
    assert.equal(JSON.stringify(res21), JSON.stringify(ref21), "Split test21");
    
    // test30
    var test30 = "root?key0=val00&key0&key1=val10";
    var res30 = dwv.utils.splitQueryString(test30);
    var ref30 = {'base': "root", 'query': {'key0': ["val00", null], 'key1': "val10"}};
    assert.equal(JSON.stringify(res30), JSON.stringify(ref30), "Split test30");
    // test31
    var test31 = "root?key0=val00&key0=val01&key1=val10";
    var res31 = dwv.utils.splitQueryString(test31);
    var ref31 = {'base': "root", 'query': {'key0': ["val00", "val01"], 'key1': "val10"}};
    assert.equal(JSON.stringify(res31), JSON.stringify(ref31), "Split test31");
});
