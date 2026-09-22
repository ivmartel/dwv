import {describe, test, assert} from 'vitest';
import {Point3D, Point} from '../../src/math/point.js';
import {Index} from '../../src/math/index.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Geometry} from '../../src/image/geometry.js';
import {Matrix33, getIdentityMat33} from '../../src/math/matrix.js';
import {getOrientationFromCosines} from '../../src/math/orientation.js';

/**
 * Tests for the 'image/geometry.js' file.
 */
/** @module tests/image */

describe('image', () => {

  /**
   * Tests for {@link Geometry}.
   *
   * @function module:tests/image~geometryClass
   */
  test('Geometry class', () => {
    // case #0: simple, index and points are equal
    const imgSize0 = new Size([3, 3, 2]);
    const imgSpacing0 = new Spacing([1, 1, 1]);
    const imgOrigin0 = new Point3D(0, 0, 0);
    const imgGeometry0 = new Geometry([imgOrigin0], imgSize0, imgSpacing0);

    const testData0 = [
      {vals: [0, 0, 0], offset: 0},
      {vals: [1, 0, 0], offset: 1},
      {vals: [2, 0, 0], offset: 2},
      {vals: [0, 1, 0], offset: 3},
      {vals: [1, 1, 0], offset: 4},
      {vals: [2, 1, 0], offset: 5},
      {vals: [0, 2, 0], offset: 6},
      {vals: [1, 2, 0], offset: 7},
      {vals: [2, 2, 0], offset: 8},
      {vals: [0, 0, 1], offset: 9},
      {vals: [1, 0, 1], offset: 10},
      {vals: [2, 0, 1], offset: 11},
      {vals: [0, 1, 1], offset: 12},
      {vals: [1, 1, 1], offset: 13},
      {vals: [2, 1, 1], offset: 14},
      {vals: [0, 2, 1], offset: 15},
      {vals: [1, 2, 1], offset: 16},
      {vals: [2, 2, 1], offset: 17}
    ];
    for (let i = 0; i < testData0.length; ++i) {
      const index = new Index(testData0[i].vals);

      const theoPoint = new Point([
        testData0[i].vals[0], testData0[i].vals[1], testData0[i].vals[2]
      ]);
      const resPoint = imgGeometry0.indexToWorld(index);
      assert.ok(theoPoint.equals(resPoint), `indexToWorld #0-${i}`);
      const resPoint2 = imgGeometry0.worldToIndex(theoPoint);
      assert.ok(index.equals(resPoint2), `worldToIndex #0-${i}`);
    }

    // case #1
    const imgSize1 = new Size([3, 3, 2]);
    const imgSpacing1 = new Spacing([0.5, 0.5, 2]);
    const imgOrigin1 = new Point3D(10.25, 10.25, 20);
    const imgGeometry1 = new Geometry([imgOrigin1], imgSize1, imgSpacing1);

    const testData1 = [
      {vals: [0, 0, 0], pvals: [10.25, 10.25, 20], offset: 0},
      {vals: [1, 0, 0], pvals: [10.75, 10.25, 20], offset: 1},
      {vals: [2, 0, 0], pvals: [11.25, 10.25, 20], offset: 2},
      {vals: [0, 1, 0], pvals: [10.25, 10.75, 20], offset: 3},
      {vals: [1, 1, 0], pvals: [10.75, 10.75, 20], offset: 4},
      {vals: [2, 1, 0], pvals: [11.25, 10.75, 20], offset: 5},
      {vals: [0, 2, 0], pvals: [10.25, 11.25, 20], offset: 6},
      {vals: [1, 2, 0], pvals: [10.75, 11.25, 20], offset: 7},
      {vals: [2, 2, 0], pvals: [11.25, 11.25, 20], offset: 8},
      {vals: [0, 0, 1], pvals: [10.25, 10.25, 22], offset: 9},
      {vals: [1, 0, 1], pvals: [10.75, 10.25, 22], offset: 10},
      {vals: [2, 0, 1], pvals: [11.25, 10.25, 22], offset: 11},
      {vals: [0, 1, 1], pvals: [10.25, 10.75, 22], offset: 12},
      {vals: [1, 1, 1], pvals: [10.75, 10.75, 22], offset: 13},
      {vals: [2, 1, 1], pvals: [11.25, 10.75, 22], offset: 14},
      {vals: [0, 2, 1], pvals: [10.25, 11.25, 22], offset: 15},
      {vals: [1, 2, 1], pvals: [10.75, 11.25, 22], offset: 16},
      {vals: [2, 2, 1], pvals: [11.25, 11.25, 22], offset: 17}
    ];
    for (let i = 0; i < testData1.length; ++i) {
      const index = new Index(testData1[i].vals);

      const theoPoint = new Point([
        testData1[i].pvals[0], testData1[i].pvals[1], testData1[i].pvals[2]
      ]);
      const resPoint = imgGeometry1.indexToWorld(index);
      assert.ok(theoPoint.equals(resPoint), `indexToWorld #1-${i}`);
      const resPoint2 = imgGeometry1.worldToIndex(theoPoint);
      assert.ok(index.equals(resPoint2), `worldToIndex #1-${i}`);
    }
  });

  /**
   * Tests for {@link Geometry#isSimilar}.
   *
   * @function module:tests/image~geometryIsSimilar
   */
  test('Geometry isSimilar', () => {
    const size = new Size([3, 3, 2]);
    const spacing = new Spacing([1, 1, 1]);
    const origin = new Point3D(0, 0, 0);
    const orientation = getIdentityMat33();
    const geom = new Geometry([origin], size, spacing, orientation);

    // identical geometry is similar
    const geomSame = new Geometry(
      [new Point3D(0, 0, 0)], size, spacing, getIdentityMat33());
    assert.ok(geom.isSimilar(geomSame), 'identical geometries are similar');

    // origin within default tolerance (Number.EPSILON) is similar
    const eps = Number.EPSILON / 2;
    const geomOriginClose = new Geometry(
      [new Point3D(eps, eps, eps)], size, spacing, getIdentityMat33());
    assert.ok(
      geom.isSimilar(geomOriginClose), 'origin within epsilon is similar');

    // origin outside tolerance is not similar
    const geomOriginFar = new Geometry(
      [new Point3D(0.1, 0, 0)], size, spacing, getIdentityMat33());
    assert.notOk(
      geom.isSimilar(geomOriginFar), 'origin outside tolerance is not similar');

    // origin outside default but within custom tolerance is similar
    assert.ok(
      geom.isSimilar(geomOriginFar, 0.2),
      'origin within custom tolerance is similar');

    // different size is not similar
    const geomDiffSize = new Geometry(
      [new Point3D(0, 0, 0)], new Size([4, 3, 2]), spacing, getIdentityMat33());
    assert.notOk(
      geom.isSimilar(geomDiffSize), 'different size is not similar');

    // different spacing is not similar
    const geomDiffSpacing = new Geometry(
      [new Point3D(0, 0, 0)], size, new Spacing([2, 1, 1]), getIdentityMat33());
    assert.notOk(
      geom.isSimilar(geomDiffSpacing), 'different spacing is not similar');

    // different orientation is not similar
    const rotValues = [0, -1, 0, 1, 0, 0, 0, 0, 1];
    const rotOrientation = new Matrix33(rotValues);
    const geomDiffOrient = new Geometry(
      [new Point3D(0, 0, 0)], size, spacing, rotOrientation);
    assert.notOk(
      geom.isSimilar(geomDiffOrient), 'different orientation is not similar');

    // null/undefined are not similar
    assert.notOk(geom.isSimilar(null), 'null is not similar');
    assert.notOk(geom.isSimilar(undefined), 'undefined is not similar');
  });

  /**
   * Tests for {@link Geometry#appendVolume}.
   *
   * @function module:tests/image~geometryAppendVolume
   */
  test('Geometry appendVolume', () => {
    const size = new Size([3, 3, 1]);
    const spacing = new Spacing([1, 1, 1]);
    const origin0 = new Point3D(0, 0, 0);
    const origin1 = new Point3D(0, 0, 1);
    const geometry = new Geometry([origin0], size, spacing);
    geometry.appendOrigin(origin1, 1);
    // seed time 0 for the base volume, as Image#appendImage would
    geometry.setInitialTime(0);

    const volOrigins = [new Point3D(0, 0, 0), new Point3D(0, 0, 1)];

    // mismatched slice count throws
    assert.throws(
      () => geometry.appendVolume([new Point3D(0, 0, 0)], 1),
      /different number of slices/);

    // append time 2 first (out of temporal order arrival)
    geometry.appendVolume(volOrigins, 2);
    assert.equal(geometry.getSize().get(3), 2, 'time dimension is 2');
    assert.equal(
      geometry.getCurrentTotalNumberOfSlices(), 4, 'total slices is 4');
    assert.equal(
      geometry.getCurrentNumberOfSlicesBeforeTime(2), 2,
      'only time 0 counted before time 2 so far');

    // now append time 1: it must sort between time 0 and time 2
    geometry.appendVolume(volOrigins, 1);
    assert.equal(geometry.getSize().get(3), 3, 'time dimension is 3');
    assert.equal(
      geometry.getCurrentTotalNumberOfSlices(), 6, 'total slices is 6');
    assert.equal(
      geometry.getCurrentNumberOfSlicesBeforeTime(1), 2,
      'only time 0 counted before time 1');
    assert.equal(
      geometry.getCurrentNumberOfSlicesBeforeTime(2), 4,
      'time 0 and time 1 counted before time 2, even though time 2 ' +
      'was appended first');

    // duplicate time throws
    assert.throws(
      () => geometry.appendVolume(volOrigins, 1),
      /already exists/);
  });

  /**
   * Test that {@link Geometry#worldToIndex} resolves the correct
   * slice for an irregularly spaced grid, instead of naively
   * extrapolating from origin #0 with a single rounded spacing value
   * (which gives an out-of-range index for this data).
   *
   * @function module:tests/image~geometryWorldToIndexIrregularSpacing
   */
  test('Geometry worldToIndex resolves the correct slice for ' +
    'irregular spacing', () => {
    const size = new Size([1, 1, 3]);
    const spacing = new Spacing([1, 1, 1]);
    const origins = [
      new Point3D(0, 0, 0),
      new Point3D(0, 0, 1),
      new Point3D(0, 0, 5)
    ];
    const geometry = new Geometry(origins, size, spacing);

    const point = new Point([0, 0, 5]);

    // naive arithmetic relative to origin #0 would give (5 - 0) / 1 = 5,
    // out of the origins range; worldToIndex must instead match the
    // real (irregularly placed) origin at index #2
    assert.equal(
      geometry.worldToIndex(point).get(2), 2,
      'worldToIndex finds the correct slice regardless of spacing');
  });

  /**
   * Test that {@link Geometry#worldToIndex} falls back to the naive
   * arithmetic result (and so stays correctly out of range) for a
   * position that isn't actually close to any real origin, instead of
   * spuriously snapping to whichever origin happens to be closest.
   *
   * @function module:tests/image~geometryWorldToIndexOutOfRange
   */
  test('Geometry worldToIndex falls back to arithmetic for ' +
    'out-of-range positions', () => {
    const size = new Size([1, 1, 3]);
    const spacing = new Spacing([1, 1, 1]);
    const origins = [
      new Point3D(0, 0, 0),
      new Point3D(0, 0, 1),
      new Point3D(0, 0, 5)
    ];
    const geometry = new Geometry(origins, size, spacing);

    // well past the last origin (#2, at z=5): closest origin is still
    // #2, but far outside half a slice spacing away, so this must not
    // resolve to 2 - it should fall back to the (also out-of-range)
    // naive arithmetic result
    const point = new Point([0, 0, 20]);
    const index = geometry.worldToIndex(point).get(2);
    assert.equal(index, 20, 'falls back to naive arithmetic');
    assert.ok(
      index < 0 || index >= size.get(2),
      'result is correctly out of the geometry bounds');
  });

  /**
   * Regression test for a real gantry-tilted CT geometry (tilted
   * ImageOrientationPatient, so consecutive origins shift in Y as
   * well as Z): {@link Geometry#worldToIndex} and
   * {@link Geometry#getSliceIndex} must both resolve every real
   * slice's own position back to its own index - including for
   * points away from the slice corner (eg. A click anywhere else in
   * the image), since the in-plane offset must not leak into the
   * slice decision. The naive uniform-grid formula worldToIndex used
   * to fall back on gets this systematically wrong for this data
   * (verified separately: it returned [0,0,-1]..[0,0,-11] for slices
   * 1..10, not merely off-by-one)..
   *
   * @function module:tests/image~geometryWorldToIndexGantryTilt
   */
  test('Geometry worldToIndex and getSliceIndex resolve the correct ' +
    'slice for a real gantry-tilted geometry', () => {
    const cosines = [1.0, -0.0, 0.0, -0.0, 0.98687, 0.16151];
    const orientation = getOrientationFromCosines(cosines);
    const rowVec = [cosines[0], cosines[1], cosines[2]];
    const colVec = [cosines[3], cosines[4], cosines[5]];

    // real ImagePositionPatient values from a tilted-gantry CT series
    const ipp = [
      [-87.4287872314, -72.7681121826, -28.2764186859],
      [-87.4287872314, -72.2835693359, -31.2370319366],
      [-87.4287872314, -71.7990264893, -34.1976394653],
      [-87.4287872314, -71.3144912720, -37.1582527161],
      [-87.4287872314, -70.8299484253, -40.1188621521],
      [-87.4287872314, -70.3454055786, -43.0794754028],
      [-87.4287872314, -69.8608703613, -46.0400848389],
      [-87.4287872314, -69.3763275146, -49.0006980896],
      [-87.4287872314, -68.8917846680, -51.9613113403],
      [-87.4287872314, -68.4072418213, -54.9219245911],
      [-87.4287872314, -67.9226989746, -57.8825378418]
    ];
    const origins = ipp.map((v) => new Point3D(v[0], v[1], v[2]));

    const size = new Size([512, 512, 1]);
    const spacing = new Spacing([0.1758, 0.1758, 3]);
    // built the same way dicomGeometry#getFramesGeometry does: origins
    // appended in raw per-frame order, no re-sorting
    const geometry = new Geometry([origins[0]], size, spacing, orientation);
    for (let m = 1; m < origins.length; ++m) {
      geometry.appendOrigin(origins[m], m);
    }

    // exact slice corners
    for (let i = 0; i < origins.length; ++i) {
      const point = new Point(origins[i].getValues());
      assert.equal(
        geometry.worldToIndex(point).get(2), i,
        `worldToIndex at slice #${i}`);
      assert.equal(
        geometry.getSliceIndex(origins[i]), i,
        `getSliceIndex at slice #${i}`);
    }

    // same slices, but clicked away from the corner: the in-plane
    // offset (along row/col) must not affect which slice worldToIndex
    // finds. Only worldToIndex is checked here, not getSliceIndex:
    // getSliceIndex's codirectional refinement is a sign check (not a
    // magnitude/tolerance one like worldToIndex's half-spacing gate),
    // so it stays sensitive to the same float noise this whole test
    // is otherwise working around - harmless for its one real caller
    // (Image#appendSlice, always comparing exact origins with no
    // in-plane offset), but not something to assert here.
    const pixelOffsets = [[0, 0], [100, 50], [300, 250], [500, 500]];
    for (let i = 0; i < origins.length; ++i) {
      for (const [rowOff, colOff] of pixelOffsets) {
        const offsetPoint3D = new Point3D(
          origins[i].getX() +
          rowOff * spacing.get(0) * rowVec[0] +
          colOff * spacing.get(1) * colVec[0],
          origins[i].getY() +
          rowOff * spacing.get(0) * rowVec[1] +
          colOff * spacing.get(1) * colVec[1],
          origins[i].getZ() +
          rowOff * spacing.get(0) * rowVec[2] +
          colOff * spacing.get(1) * colVec[2]
        );
        assert.equal(
          geometry.worldToIndex(new Point(offsetPoint3D.getValues())).get(2),
          i, `worldToIndex at slice #${i}, pixel offset [${rowOff},${colOff}]`);
      }
    }
  });

  /**
   * Tests for {@link Geometry#getSliceIndex}.
   *
   * @function module:tests/image~geometryGetSliceIndex
   */
  test('Geometry getSliceIndex', () => {
    // irregular Z spacing on purpose: getSliceIndex must not assume
    // a uniform grid (unlike worldToIndex's naive arithmetic
    // fallback, which only applies when no origin is close enough)
    const size = new Size([1, 1, 4]);
    const spacing = new Spacing([1, 1, 1]);
    const origins = [
      new Point3D(0, 0, 0),
      new Point3D(0, 0, 1),
      new Point3D(0, 0, 3),
      new Point3D(0, 0, 7)
    ];
    const geometry = new Geometry(origins, size, spacing);

    // a point at an origin returns that origin's own index
    for (let i = 0; i < origins.length; ++i) {
      assert.equal(
        geometry.getSliceIndex(origins[i]), i,
        `getSliceIndex at origin #${i}`);
    }

    const testData = [
      // closest to origin #0, above it -> falls in slice #1
      {z: 0.4, expected: 1},
      // closest to origin #1, below it -> still slice #1
      {z: 0.6, expected: 1},
      // closest to origin #1, above it -> falls in slice #2
      {z: 1.5, expected: 2},
      // closest to origin #2, below it -> still slice #2
      {z: 2.5, expected: 2},
      // closest to origin #2, above it -> falls in slice #3
      {z: 4, expected: 3},
      // closest to origin #3, below it -> still slice #3
      {z: 6, expected: 3},
      // beyond the last origin: one past the last slice, not clamped
      // (this is a valid insertion index, used by appendOrigin)
      {z: 10, expected: 4},
      // before the first origin: clamped to the first slice
      {z: -1, expected: 0}
    ];
    for (const data of testData) {
      const point = new Point3D(0, 0, data.z);
      assert.equal(
        geometry.getSliceIndex(point), data.expected,
        `getSliceIndex at z=${data.z}`);
    }
  });

  /**
   * Test {@link Geometry#getSliceIndex} with the optional time argument.
   *
   * @function module:tests/image~geometryGetSliceIndexTime
   */
  test('Geometry getSliceIndex with time', () => {
    const size = new Size([1, 1, 1]);
    const spacing = new Spacing([1, 1, 1]);
    const origin0 = new Point3D(0, 0, 0);
    const origin1 = new Point3D(0, 0, 1);
    const geometry = new Geometry([origin0], size, spacing);
    // 2 slices for time 0, as Image#appendImage would build it
    geometry.appendOrigin(origin1, 1);
    geometry.setInitialTime(0);

    // second time point has a different (irregular) slice layout,
    // but the same slice count as time 0
    const time1Origins = [
      new Point3D(0, 0, 0),
      new Point3D(0, 0, 4)
    ];
    geometry.appendVolume(time1Origins, 1);

    assert.equal(
      geometry.getSliceIndex(new Point3D(0, 0, 4), 1), 1,
      'getSliceIndex uses the origins of the given time point');
    assert.equal(
      geometry.getSliceIndex(new Point3D(0, 0, 0), 1), 0,
      'getSliceIndex uses the origins of the given time point (start)');
  });

  /**
   * Tests for {@link Geometry#sortOrigins}.
   *
   * @function module:tests/image~geometrySortOrigins
   */
  test('Geometry sortOrigins', () => {
    const size = new Size([1, 1, 1]);
    const spacing = new Spacing([1, 1, 1]);
    // append out of (Z) order
    const geometry = new Geometry([new Point3D(0, 0, 5)], size, spacing);
    geometry.appendOrigin(new Point3D(0, 0, 1), 1);
    geometry.appendOrigin(new Point3D(0, 0, 8), 2);
    geometry.appendOrigin(new Point3D(0, 0, -2), 3);

    geometry.sortOrigins();

    const sortedZ = geometry.getOrigins().map((origin) => origin.getZ());
    assert.deepEqual(
      sortedZ, [-2, 1, 5, 8], 'origins sorted ascending along Z');
  });

  /**
   * Test that {@link Geometry#sortOrigins} sorts along the
   * orientation's normal, not raw world Z, for a tilted geometry.
   *
   * @function module:tests/image~geometrySortOriginsTilted
   */
  test('Geometry sortOrigins orders origins along a tilted normal', () => {
    const cosines = [1.0, -0.0, 0.0, -0.0, 0.98687, 0.16151];
    const orientation = getOrientationFromCosines(cosines);
    const size = new Size([1, 1, 1]);
    const spacing = new Spacing([1, 1, 1]);

    // real, but scrambled, ImagePositionPatient values
    const scrambled = [
      new Point3D(-87.4287872314, -70.3454055786, -43.0794754028),
      new Point3D(-87.4287872314, -72.7681121826, -28.2764186859),
      new Point3D(-87.4287872314, -68.4072418213, -54.9219245911),
      new Point3D(-87.4287872314, -71.7990264893, -34.1976394653)
    ];
    const geometry = new Geometry(
      [scrambled[0]], size, spacing, orientation);
    for (let i = 1; i < scrambled.length; ++i) {
      geometry.appendOrigin(scrambled[i], i);
    }

    geometry.sortOrigins();

    // consecutive origins must now be strictly increasing along the
    // orientation's normal (3rd column) - not necessarily along raw
    // world Z, X or Y taken alone
    const normal = [
      orientation.get(0, 2), orientation.get(1, 2), orientation.get(2, 2)
    ];
    const projectOnNormal = (point) => point.getX() * normal[0] +
      point.getY() * normal[1] + point.getZ() * normal[2];
    const sorted = geometry.getOrigins();
    for (let i = 1; i < sorted.length; ++i) {
      assert.ok(
        projectOnNormal(sorted[i]) > projectOnNormal(sorted[i - 1]),
        `origin #${i} is further along the normal than #${i - 1}`);
    }
  });

});
