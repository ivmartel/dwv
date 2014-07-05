/**
 * Tests for the 'utils/string' file.
 */
// Do not warn if these variables were not defined before.
/* global module, test, equal */
module("string");

test("Test CapitaliseFirstLetter.", function() {
    // undefined
    equal(dwv.utils.capitaliseFirstLetter(), null, "Capitalise undefined");
    // null
    equal(dwv.utils.capitaliseFirstLetter(null), null, "Capitalise null");
    // empty
    equal(dwv.utils.capitaliseFirstLetter(""), "", "Capitalise empty");
    // short
    equal(dwv.utils.capitaliseFirstLetter("a"), "A", "Capitalise one letter");
    // space first
    equal(dwv.utils.capitaliseFirstLetter(" a"), " a", "Capitalise space");
    // regular
    equal(dwv.utils.capitaliseFirstLetter("dicom"), "Dicom", "Capitalise regular");
    equal(dwv.utils.capitaliseFirstLetter("Dicom"), "Dicom", "Capitalise regular no need");
    // with spaces
    equal(dwv.utils.capitaliseFirstLetter("le ciel est bleu"), "Le ciel est bleu", 
            "Capitalise sentence");
});

test("Test cleanString.", function() {
    // undefined
    equal(dwv.utils.cleanString(), null, "Clean undefined");
    // null
    equal(dwv.utils.cleanString(null), null, "Clean null");
    // empty
    equal(dwv.utils.cleanString(""), "", "Clean empty");
    // short
    equal(dwv.utils.cleanString("a"), "a", "Clean short");
    // special
    var special = String.fromCharCode("u200B");
    equal(dwv.utils.cleanString(special), "", "Clean just special");
    // regular
    var str = " El cielo azul ";
    var refStr = "El cielo azul";
    equal(dwv.utils.cleanString(str), refStr, "Clean regular");
    // regular with special
    str = " El cielo azul" + special;
    refStr = "El cielo azul";
    equal(dwv.utils.cleanString(str), refStr, "Clean regular with special");
    // regular with special and ending space (not trimmed)
    str = " El cielo azul " + special;
    refStr = "El cielo azul ";
    equal(dwv.utils.cleanString(str), refStr, "Clean regular with special 2");
});

test("Test splitQueryString.", function() {
    // using JSON.stringify to compare objects
    var strEmpty = JSON.stringify({});
    
    // undefined
    var res00 = dwv.utils.splitQueryString();
    equal(JSON.stringify(res00), strEmpty, "Split null");
    // null
    var res01 = dwv.utils.splitQueryString(null);
    equal(JSON.stringify(res01), strEmpty, "Split null");
    // empty
    var res02 = dwv.utils.splitQueryString("");
    equal(JSON.stringify(res02), strEmpty, "Split empty");
    
    // test10
    var test10 = "root?key0";
    var res10 = dwv.utils.splitQueryString(test10);
    var ref10 = {'base': "root", 'query': {}};
    equal(JSON.stringify(res10), JSON.stringify(ref10), "Split test10");
    // test11
    var test11 = "root?key0=val00";
    var res11 = dwv.utils.splitQueryString(test11);
    var ref11 = {'base': "root", 'query': {'key0': "val00"}};
    equal(JSON.stringify(res11), JSON.stringify(ref11), "Split test11");
    
    // test20
    var test20 = "root?key0=val00&key1";
    var res20 = dwv.utils.splitQueryString(test20);
    var ref20 = {'base': "root", 'query': {'key0': "val00"}};
    equal(JSON.stringify(res20), JSON.stringify(ref20), "Split test20");
    // test21
    var test21 = "root?key0=val00&key1=val10";
    var res21 = dwv.utils.splitQueryString(test21);
    var ref21 = {'base': "root", 'query': {'key0': "val00", 'key1': "val10"}};
    equal(JSON.stringify(res21), JSON.stringify(ref21), "Split test21");
    
    // test30
    var test30 = "root?key0=val00&key0&key1=val10";
    var res30 = dwv.utils.splitQueryString(test30);
    var ref30 = {'base': "root", 'query': {'key0': ["val00", null], 'key1': "val10"}};
    equal(JSON.stringify(res30), JSON.stringify(ref30), "Split test30");
    // test31
    var test31 = "root?key0=val00&key0=val01&key1=val10";
    var res31 = dwv.utils.splitQueryString(test31);
    var ref31 = {'base': "root", 'query': {'key0': ["val00", "val01"], 'key1': "val10"}};
    equal(JSON.stringify(res31), JSON.stringify(ref31), "Split test31");
});
