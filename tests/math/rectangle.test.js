/**
 * Tests for the 'math/shapes.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('shape-rectangle');

/**
 * Tests for {@link dwv.math.Rectangle}.
 *
 * @function module:tests/math~Rectangle
 */
QUnit.test('Test Rectangle.', function (assert) {
  var p0 = new dwv.math.Point2D(0, 0);
  var p1 = new dwv.math.Point2D(-4, -4);
  var r0 = new dwv.math.Rectangle(p0, p1);
  // getBegin
  assert.equal(r0.getBegin().equals(p1), true, 'getBegin');
  // getEnd
  assert.equal(r0.getEnd().equals(p0), true, 'getEnd');
  // getRealWidth
  assert.equal(r0.getRealWidth(), 4, 'getRealWidth');
  // getRealHeight
  assert.equal(r0.getRealHeight(), 4, 'getRealHeight');
  // getWidth
  assert.equal(r0.getWidth(), 4, 'getWidth');
  // getHeight
  assert.equal(r0.getHeight(), 4, 'getHeight');
  // getSurface
  assert.equal(r0.getSurface(), 16, 'getSurface');
  // getWorldSurface
  assert.equal(r0.getWorldSurface(0.5, 0.5), 4, 'getWorldSurface');
});
