/**
 * Tests for the 'math/stats.js' file.
 */
// Do not warn if these variables were not defined before.
/* global module, test, equal */
module("stats");

test("Test getStats.", function() {
    var arr0 = [1, 2, 3, 4, 5];
    var q0 = dwv.math.getStats(arr0); 
    // min
    equal(q0.min, 1, "min.0");
    // max
    equal(q0.max, 5, "max.0");
    // mean
    equal(q0.mean, 3, "mean.0");
    // stdDev
    equal(q0.stdDev, 1.4142135623730951, "stdDev.0");
    
    var arr1 = [9, 2, 5, 4, 12, 7, 8, 11, 9, 3, 7, 4, 12, 5, 4, 10, 9, 6, 9, 4];
    var q1 = dwv.math.getStats(arr1); 
    // min
    equal(q1.min, 2, "min.1");
    // max
    equal(q1.max, 12, "max.1");
    // mean
    equal(q1.mean, 7, "mean.1");
    // stdDev
    equal(q1.stdDev, 2.9832867780352594, "stdDev.1");
});

test("Test IdGenerator.", function() {
    var generator = new dwv.math.IdGenerator();
    var id0 = generator.get();
    var id1 = generator.get();
    equal((id0 == id1), false, "Ids should not be equal.");
    
    var generator2 = new dwv.math.IdGenerator();
    var id2 = generator2.get();
    equal((id0 == id2), false, "Ids should not be equal.");
    equal((id1 == id2), false, "Ids should not be equal.");

});
