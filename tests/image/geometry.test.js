/**
 * Tests for the 'image/geometry.js' file.
 */
/** @module tests/image */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('image');

/**
 * Tests for {@link dwv.image.Geometry}.
 *
 * @function module:tests/image~geometry
 */
QUnit.test('Test Geometry.', function (assert) {
  var size0 = 4;
  var imgSize0 = new dwv.image.Size([size0, size0, 1]);
  var imgSpacing0 = new dwv.image.Spacing(1, 1, 1);
  var imgOrigin0 = new dwv.math.Point3D(0, 0, 0);
  var imgGeometry0 = new dwv.image.Geometry(imgOrigin0, imgSize0, imgSpacing0);

  var testData = [
    {vals: [0, 0, 0], offset: 0},
    {vals: [1, 0, 0], offset: 1},
    {vals: [2, 0, 0], offset: 2},
    {vals: [3, 0, 0], offset: 3},
    {vals: [0, 1, 0], offset: 4},
    {vals: [1, 1, 0], offset: 5},
    {vals: [2, 1, 0], offset: 6},
    {vals: [3, 1, 0], offset: 7},
    {vals: [0, 2, 0], offset: 8},
    {vals: [1, 2, 0], offset: 9},
    {vals: [2, 2, 0], offset: 10},
    {vals: [3, 2, 0], offset: 11},
    {vals: [0, 3, 0], offset: 12},
    {vals: [1, 3, 0], offset: 13},
    {vals: [2, 3, 0], offset: 14},
    {vals: [3, 3, 0], offset: 15}
  ];
  for (var i = 0; i < testData.length; ++i) {
    var index = new dwv.math.Index(testData[i].vals);
    var offset = testData[i].offset;
    assert.equal(
      imgGeometry0.indexToOffset(index), offset, 'indexToOffset #' + i);
    assert.ok(
      imgGeometry0.offsetToIndex(offset).equals(index), 'offsetToIndex #' + i);

    var theoPoint = new dwv.math.Point3D(
      testData[i].vals[0], testData[i].vals[1], testData[i].vals[2]
    );
    var resPoint = imgGeometry0.indexToWorld(index);
    assert.true(theoPoint.equals(resPoint), 'indexToWorkd #' + i);
    var resPoint2 = imgGeometry0.worldToIndex(theoPoint);
    assert.true(index.equals(resPoint2), 'worldToIndex #' + i);
  }
});
