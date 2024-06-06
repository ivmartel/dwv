import {Index, getIndexFromStringId} from '../../src/math/index';
import {Point} from '../../src/math/point';

/**
 * Tests for the 'math/index.js' file.
 */

/* global QUnit */
QUnit.module('math');

/**
 * Tests for {@link Index}.
 *
 * @function module:tests/math~index-class
 */
QUnit.test('Index class', function (assert) {
  // error cases
  assert.throws(function () {
    new Index();
  },
  new Error('Cannot create index with no values.'),
  'index with undef values array.');
  assert.throws(function () {
    new Index(null);
  },
  new Error('Cannot create index with no values.'),
  'index with null values array.');
  assert.throws(function () {
    new Index([]);
  },
  new Error('Cannot create index with empty values.'),
  'index with empty values array.');
  assert.throws(function () {
    new Index([2, undefined, 2]);
  },
  new Error('Cannot create index with non number values.'),
  'index with undef values.');
  assert.throws(function () {
    new Index([2, 'a', 2]);
  },
  new Error('Cannot create index with non number values.'),
  'index with string values.');

  const i0 = new Index([1, 2, 3]);
  // getX
  assert.equal(i0.get(0), 1, 'get0');
  // getY
  assert.equal(i0.get(1), 2, 'get1');
  // getZ
  assert.equal(i0.get(2), 3, 'get2');

  // equals: true
  const i10 = new Index([1, 2, 3]);
  assert.equal(i10.equals(i10), true, 'equals true');
  // equals: false
  assert.equal(i10.equals(null), false, 'null equals false');
  const i11 = new Index([1, 2]);
  assert.equal(i10.equals(i11), false, 'length equals false');
  const i12 = new Index([3, 2, 1]);
  assert.equal(i10.equals(i12), false, 'values equals false');

  // compare
  const res13 = i0.compare(i0);
  assert.equal(res13.length, 0, '[compare] #0');
  const i14 = new Index([2, 3, 4]);
  const res14 = i0.compare(i14);
  assert.equal(res14.length, 3, '[compare] #1 length');
  assert.equal(res14[0], 0, '[compare] #1 [0]');
  assert.equal(res14[1], 1, '[compare] #1 [1]');
  assert.equal(res14[2], 2, '[compare] #1 [2]');
  const i15 = new Point([1, 3, 4]);
  const res15 = i0.compare(i15);
  assert.equal(res15.length, 2, '[compare] #2 length');
  assert.equal(res15[0], 1, '[compare] #2 [0]');
  assert.equal(res15[1], 2, '[compare] #2 [1]');

  // to string
  const i20 = new Index([1, 2, 3]);
  assert.equal(i20.toString(), '(1,2,3)', 'toString');

  // warning: values are NOT cloned. So this can happen:
  const val3 = [1, 2, 3];
  const i30 = new Index(val3);
  assert.equal(i30.get(0), 1, '[clone] get0');
  val3[0] = 4;
  assert.equal(i30.get(0), 4, '[clone] get0');

  // addition
  const i40 = new Index([1, 2, 3]);
  const i41 = new Index([2, 3, 4]);
  const i42 = i40.add(i41);
  assert.equal(i42.get(0), 3, '[add] get0');
  assert.equal(i42.get(1), 5, '[add] get1');
  assert.equal(i42.get(2), 7, '[add] get2');
});

/**
 * Tests for {@link Index} to and from stringId conversion.
 *
 * @function module:tests/math~index-stringid
 */
QUnit.test('Index stringId', function (assert) {
  // test #00: all dims
  const i00 = new Index([1, 2, 3]);
  const i00strId = '#0-1_#1-2_#2-3';
  assert.equal(i00.toStringId(), i00strId, 'toStringId #00');
  assert.ok(getIndexFromStringId(i00strId).equals(i00),
    'getFromStringId #00');

  // test #01: 2 dims
  const i01 = new Index([0, 2, 3]);
  const i01strId = '#1-2_#2-3';
  assert.equal(i01.toStringId([1, 2]), i01strId, 'toStringId #01');
  assert.ok(getIndexFromStringId(i01strId).equals(i01),
    'getFromStringId #01');

  // test #01: 1 dim -> X
  const i02 = new Index([1, 0, 0]);
  const i02strId = '#0-1';
  assert.equal(i02.toStringId([0]), i02strId, 'toStringId #02');
  assert.ok(getIndexFromStringId(i02strId).equals(i02),
    'getFromStringId #02');

  // test #03: 1 dim -> Y
  const i03 = new Index([0, 2, 0]);
  const i03strId = '#1-2';
  assert.equal(i03.toStringId([1]), i03strId, 'toStringId #03');
  assert.ok(getIndexFromStringId(i03strId).equals(i03),
    'getFromStringId #03');

  // test #04: 1 dim -> Z
  const i04 = new Index([0, 0, 3]);
  const i04strId = '#2-3';
  assert.equal(i04.toStringId([2]), i04strId, 'toStringId #04');
  assert.ok(getIndexFromStringId(i04strId).equals(i04),
    'getFromStringId #04');

  // test #05: 4 dims
  const i05 = new Index([1, 2, 3, 4]);
  const i05strId = '#0-1_#1-2_#2-3_#3-4';
  assert.equal(i05.toStringId(), i05strId, 'toStringId #05');
  assert.ok(getIndexFromStringId(i05strId).equals(i05),
    'getFromStringId #05');

  // test #06: 5 dims
  const i06 = new Index([0, 0, 0, 0, 1]);
  const i06strId = '#4-1';
  assert.equal(i06.toStringId([4]), i06strId, 'toStringId #06');
  assert.ok(getIndexFromStringId(i06strId).equals(i06),
    'getFromStringId #06');

  // error case
  const i10 = new Index([0, 0, 0]);
  assert.throws(function () {
    i10.toStringId([3]);
  },
  new Error('Non valid dimension for toStringId.'),
  'toStringId error');
});
