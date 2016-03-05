/** @module tests/image */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("geometry");

/**
 * Tests for {@link dwv.image.Size}.
 * @function module:tests/image~size
 */
QUnit.test("Test Size.", function (assert) {
    var size0 = new dwv.image.Size(2, 3, 4);
    // test its values
    assert.equal( size0.getNumberOfColumns(), 2, "getNumberOfColumns" );
    assert.equal( size0.getNumberOfRows(), 3, "getNumberOfRows" );
    assert.equal( size0.getNumberOfSlices(), 4, "getNumberOfSlices" );
    assert.equal( size0.getSliceSize(), 6, "getSliceSize" );
    assert.equal( size0.getTotalSize(), 24, "getTotalSize" );
    // equality
    assert.equal( size0.equals(size0), 1, "equals self true" );
    var size1 = new dwv.image.Size(2, 3, 4);
    assert.equal( size0.equals(size1), 1, "equals true" );
    var size2 = new dwv.image.Size(3, 3, 4);
    assert.equal( size0.equals(size2), 0, "equals false" );
    // is in bounds
    assert.equal( size0.isInBounds(0,0,0), 1, "isInBounds 0" );
    assert.equal( size0.isInBounds(1,2,3), 1, "isInBounds max" );
    assert.equal( size0.isInBounds(2,3,4), 0, "isInBounds too big" );
    assert.equal( size0.isInBounds(-1,2,3), 0, "isInBounds too small" );
});

/**
 * Tests for {@link dwv.image.Spacing}.
 * @function module:tests/image~spacing
 */
QUnit.test("Test Spacing.", function (assert) {
    var spacing0 = new dwv.image.Spacing(2, 3, 4);
    // test its values
    assert.equal( spacing0.getColumnSpacing(), 2, "getColumnSpacing" );
    assert.equal( spacing0.getRowSpacing(), 3, "getRowSpacing" );
    assert.equal( spacing0.getSliceSpacing(), 4, "getSliceSpacing" );
    // equality
    assert.equal( spacing0.equals(spacing0), 1, "equals self true" );
    var spacing1 = new dwv.image.Spacing(2, 3, 4);
    assert.equal( spacing0.equals(spacing1), 1, "equals true" );
    var spacing2 = new dwv.image.Spacing(3, 3, 4);
    assert.equal( spacing0.equals(spacing2), 0, "equals false" );
});
