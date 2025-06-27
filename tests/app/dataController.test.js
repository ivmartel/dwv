import {
  DicomData,
  DataController
} from '../../src/app/dataController.js';
import {Point3D} from '../../src/math/point.js';
import {Image} from '../../src/image/image.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Geometry} from '../../src/image/geometry.js';

/**
 * Tests for the 'app/dataController.js' file.
 */

/* global QUnit */
QUnit.module('app');

/**
 * Tests for {@link DataController} getValue.
 *
 * @function module:tests/app~datacontroller-class
 */
QUnit.test('DataController class', function (assert) {
  const dc0 = new DataController();

  // ids before add
  assert.deepEqual(dc0.getDataIds(), [], 'dataIds before add');

  // test image
  const size0 = 4;
  const imgSize0 = new Size([size0, size0, 1]);
  const imgSpacing0 = new Spacing([1, 1, 1]);
  const imgOrigin0 = new Point3D(0, 0, 0);
  const imgGeometry0 = new Geometry([imgOrigin0], imgSize0, imgSpacing0);
  const buffer0 = [];
  for (let i = 0; i < size0 * size0; ++i) {
    buffer0[i] = i;
  }
  const image0 = new Image(imgGeometry0, buffer0);

  // add image
  const dataId0 = 'img0';
  const dicomData0 = new DicomData({});
  dicomData0.image = image0;
  dc0.add(dataId0, dicomData0);
  assert.deepEqual(dc0.getDataIds(), [dataId0], 'dataIds after add');

  // get image
  const dc0Data0 = dc0.get(dataId0);
  assert.ok(dc0Data0.image.getGeometry().equals(imgGeometry0),
    'get image has good geometry');

  // add again should throw
  assert.throws(function () {
    dc0.add(dataId0, dicomData0);
  },
  new Error('Data id already used in storage: ' + dataId0),
  'add already existing.');

  // set image
  let receivedImageSet = false;
  dc0.addEventListener('dataimageset', function () {
    receivedImageSet = true;
  });
  dc0.setImage(dataId0, image0);
  assert.ok(receivedImageSet, 'received imageset event');

  // reset
  dc0.reset();
  assert.deepEqual(dc0.getDataIds(), [], 'dataIds after reset');
});
