/**
 * Tests for the 'math/point.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */

/**
 * Tests for {@link dwv.math.Point2D}.
 *
 * @function module:tests/math~Point2D
 */
QUnit.test('Test Point2D.', function (assert) {
  var p0 = new dwv.math.Point2D(1, 2);
  // getX
  assert.equal(p0.getX(), 1, 'getX');
  // getY
  assert.equal(p0.getY(), 2, 'getY');
  // can't modify internal x
  p0.x = 3;
  assert.equal(p0.getX(), 1, 'getX after .x');
  // can't modify internal y
  p0.y = 3;
  assert.equal(p0.getY(), 2, 'getY after .y');
  // equals: true
  var p1 = new dwv.math.Point2D(1, 2);
  assert.equal(p0.equals(p1), true, 'equals true');
  // equals: false
  assert.equal(p0.equals(null), false, 'null equals false');
  var p2 = new dwv.math.Point2D(2, 1);
  assert.equal(p0.equals(p2), false, 'equals false');
  // to string
  assert.equal(p0.toString(), '(1, 2)', 'toString');

  // distance
  var p30 = new dwv.math.Point2D(1, 3);
  assert.equal(p0.getDistance(p30), 1, 'getDistance #1');
  var p31 = new dwv.math.Point2D(2, 2);
  assert.equal(p0.getDistance(p31), 1, 'getDistance #2');
  var p32 = new dwv.math.Point2D(2, 1);
  assert.equal(p0.getDistance(p32), Math.sqrt(2), 'getDistance #3');
  var p33 = new dwv.math.Point2D(0, 1);
  assert.equal(p0.getDistance(p33), Math.sqrt(2), 'getDistance #4');

});

/**
 * Tests for {@link dwv.math.Point3D}.
 *
 * @function module:tests/math~Point3D
 */
QUnit.test('Test Point3D.', function (assert) {
  var p0 = new dwv.math.Point3D(1, 2, 3);
  // getX
  assert.equal(p0.getX(), 1, 'getX');
  // getY
  assert.equal(p0.getY(), 2, 'getY');
  // getZ
  assert.equal(p0.getZ(), 3, 'getZ');
  // can't modify internal x
  p0.x = 3;
  assert.equal(p0.getX(), 1, 'getX after .x');
  // can't modify internal y
  p0.y = 3;
  assert.equal(p0.getY(), 2, 'getY after .y');
  // can't modify internal z
  p0.z = 3;
  assert.equal(p0.getZ(), 3, 'getZ after .z');
  // equals: true
  var p1 = new dwv.math.Point3D(1, 2, 3);
  assert.equal(p0.equals(p1), true, 'equals true');
  // equals: false
  assert.equal(p0.equals(null), false, 'null equals false');
  var p2 = new dwv.math.Point3D(3, 2, 1);
  assert.equal(p0.equals(p2), false, 'equals false');
  // to string
  assert.equal(p0.toString(), '(1, 2, 3)', 'toString');

  // distance
  var p30 = new dwv.math.Point3D(1, 2, 4);
  assert.equal(p0.getDistance(p30), 1, 'getDistance #1');
  var p31 = new dwv.math.Point3D(2, 2, 3);
  assert.equal(p0.getDistance(p31), 1, 'getDistance #2');
  var p32 = new dwv.math.Point3D(2, 1, 3);
  assert.equal(p0.getDistance(p32), Math.sqrt(2), 'getDistance #3');
  var p33 = new dwv.math.Point3D(0, 1, 3);
  assert.equal(p0.getDistance(p33), Math.sqrt(2), 'getDistance #4');
});
