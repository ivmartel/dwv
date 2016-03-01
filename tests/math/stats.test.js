/**
 * Tests for the 'math/stats.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("stats");

QUnit.test("Test getStats.", function (assert) {
    var arr0 = [1, 2, 3, 4, 5];
    var q0 = dwv.math.getStats(arr0);
    // min
    assert.equal(q0.min, 1, "min.0");
    // max
    assert.equal(q0.max, 5, "max.0");
    // mean
    assert.equal(q0.mean, 3, "mean.0");
    // stdDev
    assert.equal(q0.stdDev, 1.4142135623730951, "stdDev.0");

    var arr1 = [9, 2, 5, 4, 12, 7, 8, 11, 9, 3, 7, 4, 12, 5, 4, 10, 9, 6, 9, 4];
    var q1 = dwv.math.getStats(arr1);
    // min
    assert.equal(q1.min, 2, "min.1");
    // max
    assert.equal(q1.max, 12, "max.1");
    // mean
    assert.equal(q1.mean, 7, "mean.1");
    // stdDev
    assert.equal(q1.stdDev, 2.9832867780352594, "stdDev.1");
});

QUnit.test("Test GUID.", function (assert) {
    var id0 = dwv.math.guid();
    var id1 = dwv.math.guid();
    assert.equal((id0 == id1), false, "Two GUids should not be equal.");

    var duplicates = 0;
    // create an array of guids
    var ids = [];
    for (var i = 0; i < 1000; ++i) {
        ids[ids.length] = dwv.math.guid();
    }
    // check duplicates
    var id = 0;
    for (i = 0; i < ids.length; ++i) {
        id = ids.pop();
        if (ids.indexOf(id) !== -1) {
            ++duplicates;
        }
    }
    assert.equal(duplicates, 0, "1000 GUids should not be equal.");
});
