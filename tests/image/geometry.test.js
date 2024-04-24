import {Point3D, Point} from '../../src/math/point';
import {Index} from '../../src/math/index';
import {Size} from '../../src/image/size';
import {Spacing} from '../../src/image/spacing';
import {Geometry} from '../../src/image/geometry';

/**
 * Tests for the 'image/geometry.js' file.
 */
/** @module tests/image */

/* global QUnit */
QUnit.module('image');

/**
 * Tests for {@link Geometry}.
 *
 * @function module:tests/image~geometry-class
 */
QUnit.test('Geometry class', function (assert) {
  // case #0: simple, index and points are equal
  const imgSize0 = new Size([3, 3, 2]);
  const imgSpacing0 = new Spacing([1, 1, 1]);
  const imgOrigin0 = new Point3D(0, 0, 0);
  const imgGeometry0 = new Geometry(imgOrigin0, imgSize0, imgSpacing0);

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
    assert.true(theoPoint.equals(resPoint), 'indexToWorld #0-' + i);
    const resPoint2 = imgGeometry0.worldToIndex(theoPoint);
    assert.true(index.equals(resPoint2), 'worldToIndex #0-' + i);
  }

  // case #1
  const imgSize1 = new Size([3, 3, 2]);
  const imgSpacing1 = new Spacing([0.5, 0.5, 2]);
  const imgOrigin1 = new Point3D(10.25, 10.25, 20);
  const imgGeometry1 = new Geometry(imgOrigin1, imgSize1, imgSpacing1);

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
    assert.true(theoPoint.equals(resPoint), 'indexToWorld #1-' + i);
    const resPoint2 = imgGeometry1.worldToIndex(theoPoint);
    assert.true(index.equals(resPoint2), 'worldToIndex #1-' + i);
  }
});
