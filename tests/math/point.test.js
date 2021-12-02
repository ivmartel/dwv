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

  // compare
  var res30 = p0.compare(p0);
  assert.equal(res30.length, 0, '[compare] #0');
  var p31 = new dwv.math.Point([2, 3, 4]);
  var res31 = p0.compare(p31);
  assert.equal(res31.length, 3, '[compare] #1 length');
  assert.equal(res31[0], 0, '[compare] #1 [0]');
  assert.equal(res31[1], 1, '[compare] #1 [1]');
  assert.equal(res31[2], 2, '[compare] #1 [2]');
  var p32 = new dwv.math.Point([1, 3, 4]);
  var res32 = p0.compare(p32);
  assert.equal(res32.length, 2, '[compare] #2 length');
  assert.equal(res32[0], 1, '[compare] #2 [0]');
  assert.equal(res32[1], 2, '[compare] #2 [1]');

  // addition
  var p40 = new dwv.math.Point([2, 3, 4]);
  var res40 = p0.add(p40);
  assert.equal(res40.get(0), 3, '[add] get0');
  assert.equal(res40.get(1), 5, '[add] get1');
  assert.equal(res40.get(2), 7, '[add] get2');

  // mergeWith3D
  var p50 = new dwv.math.Point([1, 2, 3, 4]);
  var p3D0 = new dwv.math.Point3D(5, 6, 7);
  var res50 = p50.mergeWith3D(p3D0);
  assert.equal(res50.length(), 4, '[merge] #0 length');
  assert.equal(res50.get(0), 5, '[merge] #0 [0]');
  assert.equal(res50.get(1), 6, '[merge] #0 [1]');
  assert.equal(res50.get(2), 7, '[merge] #0 [2]');
  assert.equal(res50.get(3), 4, '[merge] #0 [3]');
});
