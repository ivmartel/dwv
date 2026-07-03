import {describe, test, assert} from 'vitest';
import {Point3D, Point} from '../../src/math/point.js';
import {Index} from '../../src/math/index.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Geometry} from '../../src/image/geometry.js';
import {Matrix33, getIdentityMat33} from '../../src/math/matrix.js';

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

});
