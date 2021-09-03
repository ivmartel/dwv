/**
 * Tests for the 'math/BucketQueue.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('BucketQueue');

/**
 * Tests for {@link dwv.math.BucketQueue}.
 *
 * @function module:tests/math~BucketQueue
 */
QUnit.test('Test BucketQueue.', function (assert) {
  var queue00 = new dwv.math.BucketQueue();
  // isEmpty
  assert.equal(queue00.isEmpty(), true, 'create isEmpty');

  var itemEquals = function (rhs) {
    return rhs && rhs.a === this.a && rhs.b === this.b;
  };
  var item00 = {
    a: 0,
    b: 0,
    equals: itemEquals
  };

  // push
  queue00.push(item00);
  assert.equal(queue00.isEmpty(), false, 'push isEmpty');

  // pop
  var resItem02 = queue00.pop();
  assert.equal(queue00.isEmpty(), true, 'pop isEmpty');
  assert.ok(resItem02.equals(item00), 'pop item');

  // remove
  var item01 = {
    a: 0,
    b: 1,
    equals: itemEquals
  };
  queue00.push(item00);
  queue00.push(item01);
  assert.equal(queue00.remove(item00), true, 'remove');
  assert.equal(queue00.isEmpty(), false, 'remove isEmpty');
});
