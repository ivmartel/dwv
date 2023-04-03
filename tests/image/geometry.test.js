import {Point3D, Point} from '../../src/math/point';
import {Index} from '../../src/math/index';
import {Size} from '../../src/image/size';
import {Spacing} from '../../src/image/spacing';
import {Geometry} from '../../src/image/geometry';

/**
 * Tests for the 'image/geometry.js' file.
 */
/** @module tests/image */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('image');

/**
 * Tests for {@link Geometry}.
 *
 * @function module:tests/image~geometry
 */
QUnit.test('Test Geometry.', function (assert) {
  const size0 = 4;
  const imgSize0 = new Size([size0, size0, 1]);
  const imgSpacing0 = new Spacing([1, 1, 1]);
  const imgOrigin0 = new Point3D(0, 0, 0);
  const imgGeometry0 = new Geometry(imgOrigin0, imgSize0, imgSpacing0);

  const testData = [
    {vals: [0, 0, 0], offset: 0},
    {vals: [1, 0, 0], offset: 1},
    {vals: [2, 0, 0], offset: 2},
    {vals: [3, 0, 0], offset: 3},
    {vals: [0, 1, 0], offset: 4},
    {vals: [1, 1, 0], offset: 5},
    {vals: [2, 1, 0], offset: 6},
    {vals: [3, 1, 0], offset: 7},
    {vals: [0, 2, 0], offset: 8},
    {vals: [1, 2, 0], offset: 9},
    {vals: [2, 2, 0], offset: 10},
    {vals: [3, 2, 0], offset: 11},
    {vals: [0, 3, 0], offset: 12},
    {vals: [1, 3, 0], offset: 13},
    {vals: [2, 3, 0], offset: 14},
    {vals: [3, 3, 0], offset: 15}
  ];
  for (let i = 0; i < testData.length; ++i) {
    const index = new Index(testData[i].vals);

    const theoPoint = new Point([
      testData[i].vals[0], testData[i].vals[1], testData[i].vals[2]
    ]);
    const resPoint = imgGeometry0.indexToWorld(index);
    assert.true(theoPoint.equals(resPoint), 'indexToWorkd #' + i);
    const resPoint2 = imgGeometry0.worldToIndex(theoPoint);
    assert.true(index.equals(resPoint2), 'worldToIndex #' + i);
  }
});
