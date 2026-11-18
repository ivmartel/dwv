import {describe, test, assert} from 'vitest';
import {
  Index,
  getZeroIndex
} from '../../src/math/index.js';
import {Point} from '../../src/math/point.js';

/**
 * Tests for the 'math/index.js' file.
 */

describe('math', () => {

  /**
   * Tests for {@link Index}.
   *
   * @function module:tests/math~indexClass
   */
  test('Index class', () => {
    // error cases
    assert.throws(function () {
      new Index();
    },
    Error,
    'Cannot create index with no values.',
    'index with undef values array.');
    assert.throws(function () {
      new Index(null);
    },
    Error,
    'Cannot create index with no values.',
    'index with null values array.');
    assert.throws(function () {
      new Index([]);
    },
    Error,
    'Cannot create index with empty values.',
    'index with empty values array.');
    assert.throws(function () {
      new Index([2, undefined, 2]);
    },
    Error,
    'Cannot create index with non number values.',
    'index with undef values.');
    assert.throws(function () {
      new Index([2, 'a', 2]);
    },
    Error,
    'Cannot create index with non number values.',
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

    // next
    const i50 = new Index([1, 2, 3]);
    const i51res = i50.next(0);
    const i51theo = new Index([2, 2, 3]);
    assert.ok(i51res.equals(i51theo), '[next] #0');
    const i52res = i50.next(1);
    const i52theo = new Index([1, 3, 3]);
    assert.ok(i52res.equals(i52theo), '[next] #1');
    const i53res = i50.next(2);
    const i53theo = new Index([1, 2, 4]);
    assert.ok(i53res.equals(i53theo), '[next] #2');

    // previous
    const i60 = new Index([1, 2, 3]);
    const i61res = i60.previous(0);
    const i61theo = new Index([0, 2, 3]);
    assert.ok(i61res.equals(i61theo), '[previous] #0');
    const i62res = i60.previous(1);
    const i62theo = new Index([1, 1, 3]);
    assert.ok(i62res.equals(i62theo), '[previous] 1');
    const i63res = i60.previous(2);
    const i63theo = new Index([1, 2, 2]);
    assert.ok(i63res.equals(i63theo), '[previous] 2');

    // getWithNew2D
    const i70 = new Index([1, 2, 3]);
    const i71res = i70.getWithNew2D(0, 1);
    const i71theo = new Index([0, 1, 3]);
    assert.ok(i71res.equals(i71theo), '[getWithNew2D] #0');
  });

  /**
   * Tests for {@link getZeroIndex}.
   *
   * @function module:tests/math~indexGetzeroindex
   */
  test('Index getZeroIndex', () => {
    const i0 = getZeroIndex(3);
    const i0theo = new Index([0, 0, 0]);
    assert.ok(i0.equals(i0theo), '[getZeroIndex] #0');
  });

});