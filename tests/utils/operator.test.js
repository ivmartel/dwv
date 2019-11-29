/**
 * Tests for the 'utils/operator.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("utils");

/**
 * Tests for {@link dwv.utils.mergeObjects}.
 * @function module:tests/utils~mergeObjects
ssss */
QUnit.test("Test merge objects.", function (assert) {
    var obj001 = {id: {value: 0}, a: {value: 1}, b: {value: 1}};
    var obj002 = {id: {value: 1}, a: {value: 1}, b: {value: 2}};

    // bad id key
    var fbad01 = function () {
        dwv.utils.mergeObjects(obj001, obj002, "x", "value");
    };
    assert.throws(fbad01, "merge bad id key");

    // bad value key
    var fbad02 = function () {
        dwv.utils.mergeObjects(obj001, obj002, "id", "x");
    };
    assert.throws(fbad02, "merge bad value key");

    // same id
    var obj003 = {id: {value: 0}, a: {value: 1}, b: {value: 2}};
    var fbad03 = function () {
        dwv.utils.mergeObjects(obj001, obj003, "id", "value");
    };
    assert.throws(fbad03, "merge with same id value");

    // test #00: simple
    var ref00 = {
        id: {value: [0,1], merged: true},
        a: {value: 1},
        b: {value: {0: 1, 1: 2}}
    };
    var res00 = dwv.utils.mergeObjects(obj001, obj002, "id", "value");
    assert.equal(JSON.stringify(res00), JSON.stringify(ref00), "merge objects 00");

    // test #01: array values
    var obj011 = {id: {value: 0}, a: {value: 1}, b: {value: [1]}};
    var obj012 = {id: {value: 1}, a: {value: 1}, b: {value: [2]}};
    var ref01 = {
        id: {value: [0,1], merged: true},
        a: {value: 1},
        b: {value: {0: [1], 1: [2]}}
    };
    var res01 = dwv.utils.mergeObjects(obj011, obj012, "id", "value");
    assert.equal(JSON.stringify(res01), JSON.stringify(ref01), "merge objects 01");

    // test #02: merge with already merged
    var obj021 = {id: {value: [0,1], merged: true}, a: {value: 1}, b: {value: {0: 1, 1: 2}}};
    var obj022 = {id: {value: 2}, a: {value: 1}, b: {value: 2}};
    var ref02 = {
        id: {value: [0,1,2], merged: true},
        a: {value: 1},
        b: {value: {0: 1, 1: 2, 2: 2}}
    };
    var res02 = dwv.utils.mergeObjects(obj021, obj022, "id", "value");
    assert.equal(JSON.stringify(res02), JSON.stringify(ref02), "merge objects 02");

    // test #03: merge with already merged that contains a repeated value
    var obj031 = {id: {value: [0,1], merged: true}, a: {value: 1}, b: {value: {0: 1, 1: 2}}};
    var obj032 = {id: {value: 2}, a: {value: 2}, b: {value: 3}};
    var ref03 = {
        id: {value: [0,1,2], merged: true},
        a: {value: {0: 1, 1: 1, 2: 2}},
        b: {value: {0: 1, 1: 2, 2: 3}}
    };
    var res03 = dwv.utils.mergeObjects(obj031, obj032, "id", "value");
    assert.equal(JSON.stringify(res03), JSON.stringify(ref03), "merge objects 03");
});
