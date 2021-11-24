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

/**
 * Tests for {@link dwv.math.Point}.
 *
 * @function module:tests/math~Point
 */
QUnit.test('Test Point.', function (assert) {
  var p0 = new dwv.math.Point([1, 2, 3]);
  // getX
  assert.equal(p0.get(0), 1, 'getX');
  // getY
  assert.equal(p0.get(1), 2, 'getY');
  // getZ
  assert.equal(p0.get(2), 3, 'getZ');
  // equals: true
  var p1 = new dwv.math.Point([1, 2, 3]);
  assert.equal(p0.equals(p1), true, 'equals true');
  // equals: false
  assert.equal(p0.equals(null), false, 'null equals false');
  var p2 = new dwv.math.Point([3, 2, 1]);
  assert.equal(p0.equals(p2), false, 'equals false');
  // to string
  assert.equal(p0.toString(), '(1,2,3)', 'toString');
});

/**
 * Tests for {@link dwv.math.Point} to and from stringId conversion.
 *
 * @function module:tests/math~Point
 */
QUnit.test('Test Point stringId.', function (assert) {
  var i00 = new dwv.math.Point([1, 2, 3]);
  var i00strId = '#0-1.0000_#1-2.0000_#2-3.0000';
  assert.equal(i00.toStringId(), i00strId, 'toStringId #00');
  assert.ok(dwv.math.getPointFromStringId(i00strId).equals(i00),
    'getFromStringId #00');

  var i01 = new dwv.math.Point([0, 2, 3]);
  var i01strId = '#1-2.0000_#2-3.0000';
  assert.equal(i01.toStringId(1), i01strId, 'toStringId #01');
  assert.ok(dwv.math.getPointFromStringId(i01strId).equals(i01),
    'getFromStringId #01');

  var i02 = new dwv.math.Point([0, 0, 3]);
  var i02strId = '#2-3.0000';
  assert.equal(i02.toStringId(2), i02strId, 'toStringId #02');
  assert.ok(dwv.math.getPointFromStringId(i02strId).equals(i02),
    'getFromStringId #02');

  // error case
  var i10 = new dwv.math.Point([0, 0, 0]);
  assert.throws(function () {
    i10.toStringId(3);
  },
  new Error('Minimum dim cannot be equal or greater than length.'),
  'toStringId error');
});
