import {BucketQueue} from '../../src/math/bucketQueue';

/**
 * Tests for the 'math/BucketQueue.js' file.
 */
/** @module tests/math */

/* global QUnit */
QUnit.module('math');

/**
 * Tests for {@link BucketQueue}.
 *
 * @function module:tests/math~bucketqueue-class
 */
QUnit.test('BucketQueue class', function (assert) {
  const queue00 = new BucketQueue();
  // isEmpty
  assert.equal(queue00.isEmpty(), true, 'create isEmpty');

  const itemEquals = function (rhs) {
    return rhs && rhs.a === this.a && rhs.b === this.b;
  };
  const item00 = {
    a: 0,
    b: 0,
    equals: itemEquals
  };

  // push
  queue00.push(item00);
  assert.equal(queue00.isEmpty(), false, 'push isEmpty');

  // pop
  const resItem02 = queue00.pop();
  assert.equal(queue00.isEmpty(), true, 'pop isEmpty');
  assert.ok(resItem02.equals(item00), 'pop item');

  // remove
  const item01 = {
    a: 0,
    b: 1,
    equals: itemEquals
  };
  queue00.push(item00);
  queue00.push(item01);
  assert.equal(queue00.remove(item00), true, 'remove');
  assert.equal(queue00.isEmpty(), false, 'remove isEmpty');
});
