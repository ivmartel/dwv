import {describe, test, assert, beforeEach} from 'vitest';
import {PositionHelper} from '../../src/image/positionHelper.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Geometry} from '../../src/image/geometry.js';
import {Index} from '../../src/math/index.js';
import {Point3D} from '../../src/math/point.js';

/**
 * Tests for the 'image/positionHelper.js' file.
 */

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

/**
 * Build a Geometry with unit spacing and identity orientation.
 *
 * @param {number[]} sizeArr Size values [nx, ny, nz].
 * @param {Point3D} [origin] World origin (default: 0,0,0).
 * @returns {Geometry} The constructed geometry.
 */
function makeGeometry(sizeArr, origin = new Point3D(0, 0, 0)) {
  return new Geometry(
    [origin],
    new Size(sizeArr),
    new Spacing(sizeArr.map(() => 1))
  );
}

/**
 * Build a mock view backed by a real Geometry.
 * `currentPosition` is stored in a shared closure so the helper's
 * position accessor and the geometry stay consistent.
 *
 * @param {number[]} sizeArr Geometry size values.
 * @param {number[]} initIndex Initial position as index values.
 * @param {number} [scrollDim] Scroll dimension (default: 2 / z).
 * @param {Point3D} [origin] World origin.
 * @returns {{helper: PositionHelper, geometry: Geometry}} The helper
 *   and the underlying geometry.
 */
function makeHelper(
  sizeArr, initIndex, scrollDim = 2, origin = new Point3D(0, 0, 0)
) {
  const geometry = makeGeometry(sizeArr, origin);
  let currentPosition = geometry.indexToWorld(new Index(initIndex));

  const view = {
    getImage: () => ({getGeometry: () => geometry}),
    getCurrentPosition: () => currentPosition,
    getScrollDimIndex: () => scrollDim,
    setCurrentPosition: (pos) => {
      currentPosition = pos;
      return true;
    }
  };

  return {helper: new PositionHelper(view), geometry};
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('image', () => {

  // 3×4×5 grid, starting at index [1, 2, 3]
  let helper;
  let geometry;

  beforeEach(() => {
    ({helper, geometry} = makeHelper([3, 4, 5], [1, 2, 3]));
  });

  // -------------------------------------------------------------------------
  // Accessors
  // -------------------------------------------------------------------------

  /**
   * Tests that getGeometry returns the image geometry.
   *
   * @function module:tests/image~positionHelperGetGeometry
   */
  test('PositionHelper getGeometry returns the image geometry', () => {
    assert.equal(helper.getGeometry(), geometry);
  });

  /**
   * Tests that getScrollDimIndex returns the view scroll dim.
   *
   * @function module:tests/image~positionHelperGetScrollDim
   */
  test('PositionHelper getScrollDimIndex returns scroll dim from view', () => {
    assert.equal(helper.getScrollDimIndex(), 2);
  });

  /**
   * Tests getMaximumDimValue for each axis.
   *
   * @function module:tests/image~positionHelperGetMaxDimValue
   */
  test('PositionHelper getMaximumDimValue returns size - 1', () => {
    assert.equal(helper.getMaximumDimValue(0), 2, 'x: 3-1');
    assert.equal(helper.getMaximumDimValue(1), 3, 'y: 4-1');
    assert.equal(helper.getMaximumDimValue(2), 4, 'z: 5-1');
  });

  /**
   * Tests that getMaximumScrollValue returns the max along the scroll dim.
   *
   * @function module:tests/image~positionHelperGetMaxScrollValue
   */
  test('PositionHelper getMaximumScrollValue returns max scroll index', () => {
    assert.equal(helper.getMaximumScrollValue(), 4, 'z max = 5-1');
  });

  // -------------------------------------------------------------------------
  // Position / index accessors
  // -------------------------------------------------------------------------

  /**
   * Tests that getCurrentPosition matches the initial position.
   *
   * @function module:tests/image~positionHelperGetCurrentPosition
   */
  test('PositionHelper getCurrentPosition reflects initial index', () => {
    const pos = helper.getCurrentPosition();
    // index [1,2,3] with unit spacing and (0,0,0) origin → world [1,2,3]
    assert.equal(pos.get(0), 1, 'x = 1');
    assert.equal(pos.get(1), 2, 'y = 2');
    assert.equal(pos.get(2), 3, 'z = 3');
  });

  /**
   * Tests that getCurrentIndex matches the initial index.
   *
   * @function module:tests/image~positionHelperGetCurrentIndex
   */
  test('PositionHelper getCurrentIndex matches initial index', () => {
    const idx = helper.getCurrentIndex();
    assert.equal(idx.get(0), 1, 'i = 1');
    assert.equal(idx.get(1), 2, 'j = 2');
    assert.equal(idx.get(2), 3, 'k = 3');
  });

  /**
   * Tests getCurrentPositionDimValue for each axis.
   *
   * @function module:tests/image~positionHelperGetCurrentDimValue
   */
  test(
    'PositionHelper getCurrentPositionDimValue returns index per axis',
    () => {
      assert.equal(helper.getCurrentPositionDimValue(0), 1, 'dim 0 → 1');
      assert.equal(helper.getCurrentPositionDimValue(1), 2, 'dim 1 → 2');
      assert.equal(helper.getCurrentPositionDimValue(2), 3, 'dim 2 → 3');
    }
  );

  /**
   * Tests that getCurrentPositionScrollValue returns the scroll-axis index.
   *
   * @function module:tests/image~positionHelperGetCurrentScrollValue
   */
  test('PositionHelper getCurrentPositionScrollValue returns z index', () => {
    assert.equal(helper.getCurrentPositionScrollValue(), 3);
  });

  /**
   * Tests getCurrentPositionAtDimValue: modifies one dim, keeps others.
   *
   * @function module:tests/image~positionHelperGetCurrentAtDimValue
   */
  test(
    'PositionHelper getCurrentPositionAtDimValue replaces one axis',
    () => {
      const pos = helper.getCurrentPositionAtDimValue(2, 0);
      assert.equal(pos.get(0), 1, 'x unchanged');
      assert.equal(pos.get(1), 2, 'y unchanged');
      assert.equal(pos.get(2), 0, 'z replaced');
    }
  );

  /**
   * Tests getCurrentPositionAtScrollValue: modifies the scroll axis.
   *
   * @function module:tests/image~positionHelperGetCurrentAtScrollValue
   */
  test(
    'PositionHelper getCurrentPositionAtScrollValue replaces scroll axis',
    () => {
      const pos = helper.getCurrentPositionAtScrollValue(0);
      assert.equal(pos.get(2), 0, 'z replaced by scroll value');
    }
  );

  // -------------------------------------------------------------------------
  // setCurrentPosition
  // -------------------------------------------------------------------------

  /**
   * Tests that setCurrentPosition updates the current position.
   *
   * @function module:tests/image~positionHelperSetPosition
   */
  test('PositionHelper setCurrentPosition updates position', () => {
    const newPos = geometry.indexToWorld(new Index([0, 0, 0]));
    const res = helper.setCurrentPosition(newPos);
    assert.ok(res, 'returns true');
    assert.equal(helper.getCurrentPositionDimValue(2), 0, 'z updated to 0');
  });

  /**
   * Tests that setCurrentPosition with undefined returns false without update.
   *
   * @function module:tests/image~positionHelperSetPositionUndefined
   */
  test('PositionHelper setCurrentPosition with undefined returns false', () => {
    const res = helper.setCurrentPosition(undefined);
    assert.notOk(res, 'returns false');
    assert.equal(
      helper.getCurrentPositionDimValue(2), 3, 'position unchanged'
    );
  });

  // -------------------------------------------------------------------------
  // Bounds checking
  // -------------------------------------------------------------------------

  /**
   * Tests isPositionInBounds for positions inside and outside the geometry.
   *
   * @function module:tests/image~positionHelperInBounds
   */
  test('PositionHelper isPositionInBounds returns true/false correctly', () => {
    // isPositionInBounds only checks the scroll dim (z)
    const inBounds = geometry.indexToWorld(new Index([0, 0, 4]));
    const outOfBounds = geometry.indexToWorld(new Index([0, 0, 5]));
    assert.ok(helper.isPositionInBounds(inBounds), 'z=4 in bounds');
    assert.notOk(helper.isPositionInBounds(outOfBounds), 'z=5 out of bounds');
  });

  /**
   * Tests setCurrentPositionSafe rejects an out-of-bounds position.
   *
   * @function module:tests/image~positionHelperSetSafe
   */
  test('PositionHelper setCurrentPositionSafe rejects out-of-bounds', () => {
    const outOfBounds = geometry.indexToWorld(new Index([0, 0, 5]));
    const res = helper.setCurrentPositionSafe(outOfBounds);
    assert.notOk(res, 'returns false');
    assert.equal(
      helper.getCurrentPositionDimValue(2), 3, 'position unchanged'
    );
  });

  // -------------------------------------------------------------------------
  // Increment / decrement
  // -------------------------------------------------------------------------

  /**
   * Tests getIncrementPosition and getDecrementPosition return
   * the neighbouring world points without moving.
   *
   * @function module:tests/image~positionHelperGetIncDec
   */
  test(
    'PositionHelper getIncrementPosition and getDecrementPosition',
    () => {
      const inc = helper.getIncrementPosition(2);
      assert.equal(inc.get(2), 4, 'z incremented from 3 to 4');
      assert.equal(
        helper.getCurrentPositionDimValue(2), 3, 'position not moved'
      );

      const dec = helper.getDecrementPosition(2);
      assert.equal(dec.get(2), 2, 'z decremented from 3 to 2');
    }
  );

  /**
   * Tests that incrementPosition moves when in bounds and fails at the max.
   *
   * @function module:tests/image~positionHelperIncrement
   */
  test(
    'PositionHelper incrementPosition: moves in bounds, fails at max',
    () => {
      // Start at z=3, max z=4 → one more step available
      assert.ok(helper.incrementPosition(2), 'first increment ok (z→4)');
      assert.equal(helper.getCurrentPositionDimValue(2), 4, 'z = 4');
      // Now at z=4 (max), next step is out of bounds
      assert.notOk(helper.incrementPosition(2), 'second increment fails');
      assert.equal(helper.getCurrentPositionDimValue(2), 4, 'z still 4');
    }
  );

  /**
   * Tests that decrementPosition moves when in bounds and fails at zero.
   *
   * @function module:tests/image~positionHelperDecrement
   */
  test('PositionHelper decrementPosition: moves in bounds, fails at 0', () => {
    // Start at z=3 — three decrements possible
    assert.ok(helper.decrementPosition(2), 'decrement ok (z→2)');
    assert.ok(helper.decrementPosition(2), 'decrement ok (z→1)');
    assert.ok(helper.decrementPosition(2), 'decrement ok (z→0)');
    assert.equal(helper.getCurrentPositionDimValue(2), 0, 'z = 0');
    assert.notOk(helper.decrementPosition(2), 'decrement fails at 0');
    assert.equal(helper.getCurrentPositionDimValue(2), 0, 'z still 0');
  });

  /**
   * Tests incrementPositionAlongScroll and decrementPositionAlongScroll.
   *
   * @function module:tests/image~positionHelperScrollIncDec
   */
  test('PositionHelper increment/decrementPositionAlongScroll', () => {
    assert.ok(helper.incrementPositionAlongScroll(), 'increment scroll z→4');
    assert.equal(helper.getCurrentPositionScrollValue(), 4, 'z = 4');
    assert.ok(helper.decrementPositionAlongScroll(), 'decrement scroll z→3');
    assert.equal(helper.getCurrentPositionScrollValue(), 3, 'z = 3');
  });

  // -------------------------------------------------------------------------
  // merge
  // -------------------------------------------------------------------------

  /**
   * Tests that merge throws when the two helpers have different scroll dims.
   *
   * @function module:tests/image~positionHelperMergeIncompatible
   */
  test('PositionHelper merge throws on incompatible scroll dims', () => {
    const {helper: h1} = makeHelper([3, 3, 2], [0, 0, 0], 2);
    const {helper: h2} = makeHelper([3, 3, 2], [0, 0, 0], 0);
    assert.throws(() => h1.merge(h2), Error);
  });

  /**
   * Tests that merge extends the geometry along the scroll dimension.
   *
   * @function module:tests/image~positionHelperMergeCompatible
   */
  test('PositionHelper merge extends the scroll size', () => {
    // Two single-slice 3×3 geometries at adjacent z positions
    const {helper: h1} = makeHelper(
      [3, 3, 1], [0, 0, 0], 2, new Point3D(0, 0, 0)
    );
    const {helper: h2} = makeHelper(
      [3, 3, 1], [0, 0, 0], 2, new Point3D(0, 0, 1)
    );
    h1.merge(h2);
    assert.equal(
      h1.getMaximumScrollValue(), 1,
      'two slices merged → max scroll = 1'
    );
  });

});
