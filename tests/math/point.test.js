import {
  Point2D,
  Point3D,
  Point
} from '../../src/math/point';

/**
 * Tests for the 'math/point.js' file.
 */

/* global QUnit */
QUnit.module('math');

/**
 * Tests for {@link Point2D}.
 *
 * @function module:tests/math~point2D-class
 */
QUnit.test('Point2D class', function (assert) {
  const p0 = new Point2D(1, 2);
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
  const p1 = new Point2D(1, 2);
  assert.equal(p0.equals(p1), true, 'equals true');
  // equals: false
  assert.equal(p0.equals(null), false, 'null equals false');
  const p2 = new Point2D(2, 1);
  assert.equal(p0.equals(p2), false, 'equals false');
  // to string
  assert.equal(p0.toString(), '(1, 2)', 'toString');

});

/**
 * Tests for {@link Point3D}.
 *
 * @function module:tests/math~point3D-class
 */
QUnit.test('Point3D class', function (assert) {
  const p0 = new Point3D(1, 2, 3);
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
  const p1 = new Point3D(1, 2, 3);
  assert.equal(p0.equals(p1), true, 'equals true');
  // equals: false
  assert.equal(p0.equals(null), false, 'null equals false');
  const p2 = new Point3D(3, 2, 1);
  assert.equal(p0.equals(p2), false, 'equals false');
  // to string
  assert.equal(p0.toString(), '(1, 2, 3)', 'toString');

  // distance
  const p30 = new Point3D(1, 2, 4);
  assert.equal(p0.getDistance(p30), 1, 'getDistance #1');
  const p31 = new Point3D(2, 2, 3);
  assert.equal(p0.getDistance(p31), 1, 'getDistance #2');
  const p32 = new Point3D(2, 1, 3);
  assert.equal(p0.getDistance(p32), Math.sqrt(2), 'getDistance #3');
  const p33 = new Point3D(0, 1, 3);
  assert.equal(p0.getDistance(p33), Math.sqrt(2), 'getDistance #4');

  // is closest
  const p40 = new Point3D(0, 0, 0);
  const pList40 = [
    new Point3D(-2, 0, 0),
    new Point3D(-1, 0, 0),
    new Point3D(0, 0, 0),
    new Point3D(1, 0, 0),
    new Point3D(2, 0, 0)
  ];
  assert.equal(p40.getClosest(pList40), 2, 'getClosest #0');
  const pList41 = [
    new Point3D(-2, 0, 0),
    new Point3D(-1, 0, 0),
    new Point3D(0.1, 0, 0),
    new Point3D(0.1, 0, 0),
    new Point3D(1, 0, 0),
    new Point3D(2, 0, 0)
  ];
  assert.equal(p40.getClosest(pList41), 2, 'getClosest #1');
  const pList42 = [
    new Point3D(0, -2, 0),
    new Point3D(0, -1, 0),
    new Point3D(0, 0, 0),
    new Point3D(0, 1, 0),
    new Point3D(0, 2, 0)
  ];
  assert.equal(p40.getClosest(pList42), 2, 'getClosest #2');
  const pList43 = [
    new Point3D(0, -2, 0),
    new Point3D(0, -1, 0),
    new Point3D(0, 0.1, 0),
    new Point3D(0, 0.1, 0),
    new Point3D(0, 1, 0),
    new Point3D(0, 2, 0)
  ];
  assert.equal(p40.getClosest(pList43), 2, 'getClosest #3');
  const pList44 = [
    new Point3D(0, 0, -2),
    new Point3D(0, 0, -1),
    new Point3D(0, 0, 0),
    new Point3D(0, 0, 1),
    new Point3D(0, 0, 2)
  ];
  assert.equal(p40.getClosest(pList44), 2, 'getClosest #4');
  const pList45 = [
    new Point3D(0, 0, -2),
    new Point3D(0, 0, -1),
    new Point3D(0, 0, 0.1),
    new Point3D(0, 0, 0.1),
    new Point3D(0, 0, 1),
    new Point3D(0, 0, 2)
  ];
  assert.equal(p40.getClosest(pList45), 2, 'getClosest #5');
});

/**
 * Tests for {@link Point}.
 *
 * @function module:tests/math~point-class
 */
QUnit.test('Point class', function (assert) {
  const p0 = new Point([1, 2, 3]);
  // getX
  assert.equal(p0.get(0), 1, 'getX');
  // getY
  assert.equal(p0.get(1), 2, 'getY');
  // getZ
  assert.equal(p0.get(2), 3, 'getZ');
  // equals: true
  const p1 = new Point([1, 2, 3]);
  assert.equal(p0.equals(p1), true, 'equals true');
  // equals: false
  assert.equal(p0.equals(null), false, 'null equals false');
  const p2 = new Point([3, 2, 1]);
  assert.equal(p0.equals(p2), false, 'equals false');
  // to string
  assert.equal(p0.toString(), '(1,2,3)', 'toString');

  // compare
  const res30 = p0.compare(p0);
  assert.equal(res30.length, 0, '[compare] #0');
  const p31 = new Point([2, 3, 4]);
  const res31 = p0.compare(p31);
  assert.equal(res31.length, 3, '[compare] #1 length');
  assert.equal(res31[0], 0, '[compare] #1 [0]');
  assert.equal(res31[1], 1, '[compare] #1 [1]');
  assert.equal(res31[2], 2, '[compare] #1 [2]');
  const p32 = new Point([1, 3, 4]);
  const res32 = p0.compare(p32);
  assert.equal(res32.length, 2, '[compare] #2 length');
  assert.equal(res32[0], 1, '[compare] #2 [0]');
  assert.equal(res32[1], 2, '[compare] #2 [1]');

  // addition
  const p40 = new Point([2, 3, 4]);
  const res40 = p0.add(p40);
  assert.equal(res40.get(0), 3, '[add] get0');
  assert.equal(res40.get(1), 5, '[add] get1');
  assert.equal(res40.get(2), 7, '[add] get2');

  // mergeWith3D
  const p50 = new Point([1, 2, 3, 4]);
  const p3D0 = new Point3D(5, 6, 7);
  const res50 = p50.mergeWith3D(p3D0);
  assert.equal(res50.length(), 4, '[merge] #0 length');
  assert.equal(res50.get(0), 5, '[merge] #0 [0]');
  assert.equal(res50.get(1), 6, '[merge] #0 [1]');
  assert.equal(res50.get(2), 7, '[merge] #0 [2]');
  assert.equal(res50.get(3), 4, '[merge] #0 [3]');
});
