/**
 * Tests for the 'image/geometry.js' file.
 */
// Do not warn if these variables were not defined before.
/* global module, test, equal */
module("geometry");

test("Test Size.", function() {
    var size0 = new dwv.image.Size(2, 3, 4);
    // test its values
    equal( size0.getNumberOfColumns(), 2, "getNumberOfColumns" );
    equal( size0.getNumberOfRows(), 3, "getNumberOfRows" );
    equal( size0.getNumberOfSlices(), 4, "getNumberOfSlices" );
    equal( size0.getSliceSize(), 6, "getSliceSize" );
    equal( size0.getTotalSize(), 24, "getTotalSize" );
    // equality
    equal( size0.equals(size0), 1, "equals self true" );
    var size1 = new dwv.image.Size(2, 3, 4);
    equal( size0.equals(size1), 1, "equals true" );
    var size2 = new dwv.image.Size(3, 3, 4);
    equal( size0.equals(size2), 0, "equals false" );
    // is in bounds
    equal( size0.isInBounds(0,0,0), 1, "isInBounds 0" );
    equal( size0.isInBounds(1,2,3), 1, "isInBounds max" );
    equal( size0.isInBounds(2,3,4), 0, "isInBounds too big" );
    equal( size0.isInBounds(-1,2,3), 0, "isInBounds too small" );
});

test("Test Spacing.", function() {
    var spacing0 = new dwv.image.Spacing(2, 3, 4);
    // test its values
    equal( spacing0.getColumnSpacing(), 2, "getColumnSpacing" );
    equal( spacing0.getRowSpacing(), 3, "getRowSpacing" );
    equal( spacing0.getSliceSpacing(), 4, "getSliceSpacing" );
    // equality
    equal( spacing0.equals(spacing0), 1, "equals self true" );
    var spacing1 = new dwv.image.Spacing(2, 3, 4);
    equal( spacing0.equals(spacing1), 1, "equals true" );
    var spacing2 = new dwv.image.Spacing(3, 3, 4);
    equal( spacing0.equals(spacing2), 0, "equals false" );
});
