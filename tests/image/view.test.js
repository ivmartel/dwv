import {Point3D} from '../../src/math/point';
import {Size} from '../../src/image/size';
import {Spacing} from '../../src/image/spacing';
import {Geometry} from '../../src/image/geometry';
import {Image} from '../../src/image/image';
import {View} from '../../src/image/view';
import {RescaleSlopeAndIntercept} from '../../src/image/rsi';
import {WindowLevel} from '../../src/image/windowLevel';

/**
 * Tests for the 'image/view.js' file.
 */

/* global QUnit */
QUnit.module('image');

/**
 * Tests for {@link View} listeners.
 *
 * @function module:tests/image~view-wlchange-event
 */
QUnit.test('View wlchange event - #DWV-REQ-UI-03-001 Change image window/level',
  function (assert) {
    // create an image
    const size0 = 4;
    const imgSize0 = new Size([size0, size0, 1]);
    const imgSpacing0 = new Spacing([1, 1, 1]);
    const imgOrigin0 = new Point3D(0, 0, 0);
    const imgGeometry0 = new Geometry(imgOrigin0, imgSize0, imgSpacing0);
    const buffer0 = [];
    for (let i = 0; i < size0 * size0; ++i) {
      buffer0[i] = i;
    }
    const image0 = new Image(imgGeometry0, buffer0);
    image0.setMeta({BitsStored: 8});
    // create a view
    const view0 = new View(image0);

    // listeners
    const listener1 = function (event) {
      assert.equal(event.wc, 0, 'Expected call to listener1.');
    };
    const listener2 = function (event) {
      assert.equal(event.ww, 1, 'Expected call to listener2.');
    };
      // with two listeners
    view0.addEventListener('wlchange', listener1);
    view0.addEventListener('wlchange', listener2);
    view0.setWindowLevel(new WindowLevel(0, 1));
    // without listener2
    view0.removeEventListener('wlchange', listener2);
    view0.setWindowLevel(new WindowLevel(0, 2));
    // without listener1
    view0.removeEventListener('wlchange', listener1);
    view0.setWindowLevel(new WindowLevel(1, 1));
  }
);

/**
 * Tests for {@link View} getImage meta.
 *
 * @function module:tests/image~playback-milliseconds
 */
QUnit.test('Playback milliseconds', function (assert) {
  // create an image
  const size0 = 4;
  const imgSize0 = new Size([size0, size0, 1]);
  const imgSpacing0 = new Spacing([1, 1, 1]);
  const imgOrigin0 = new Point3D(0, 0, 0);
  const imgGeometry0 = new Geometry(imgOrigin0, imgSize0, imgSpacing0);
  const buffer0 = [];
  for (let i = 0; i < size0 * size0; ++i) {
    buffer0[i] = i;
  }
  const image0 = new Image(imgGeometry0, buffer0);
  image0.setMeta({RecommendedDisplayFrameRate: 20});

  // create a view
  const view0 = new View(image0);

  // get frame rate from meta
  const recommendedDisplayFrameRate =
    view0.getImage().getMeta().RecommendedDisplayFrameRate;

  assert.equal(recommendedDisplayFrameRate, 20, 'check image meta');

  // get milliseconds per frame from frame rate
  const milliseconds =
    view0.getPlaybackMilliseconds(recommendedDisplayFrameRate);

  assert.equal(milliseconds, 50, 'check view getPlaybackMilliseconds');

  // get default milliseconds if no frame rate provided
  const defaultMilliseconds = view0.getPlaybackMilliseconds(null);

  // default to 10 fps
  assert.equal(defaultMilliseconds, 100, 'check view getPlaybackMilliseconds');
});

/**
 * Tests for {@link View} generateImageData MONO.
 *
 * @function module:tests/image~generate-data-mono
 */
QUnit.test('Generate data MONO - #DWV-REQ-UI-02-001 Display image',
  function (assert) {
    // create an image
    const size0 = 2;
    const imgSize0 = new Size([size0, size0, 1]);
    const imgSpacing0 = new Spacing([1, 1, 1]);
    const imgOrigin0 = new Point3D(0, 0, 0);
    const imgGeometry0 = new Geometry(imgOrigin0, imgSize0, imgSpacing0);
    const buffer0 = [];
    for (let i = 0; i < size0 * size0; ++i) {
      buffer0[i] = i;
    }
    const image0 = new Image(imgGeometry0, buffer0);
    image0.setMeta({BitsStored: 8});
    // create a view
    const view0 = new View(image0);
    // create the image data
    const imageData = {
      width: size0,
      height: size0,
      data: new Uint8ClampedArray(size0 * size0 * 4)
    };

    // default window level
    view0.setWindowLevelMinMax();
    // call generate data
    view0.generateImageData(imageData);
    // TODO proper data?
    const theoData0 = [0,
      0,
      0,
      255,
      128,
      128,
      128,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255];
    let testContent0 = true;
    for (let i = 0; i < size0 * size0 * 4; ++i) {
      if (theoData0[i] !== imageData.data[i]) {
        testContent0 = false;
        break;
      }
    }
    assert.equal(testContent0, true, 'check image data');
  }
);

/**
 * Tests for {@link View} generateImageData MONO with RSI.
 *
 * @function module:tests/image~generate-data-mono-with-rsi
 */
QUnit.test('Generate data MONO with RSI - #DWV-REQ-UI-02-001 Display image',
  function (assert) {
    // create an image
    const size0 = 2;
    const imgSize0 = new Size([size0, size0, 1]);
    const imgSpacing0 = new Spacing([1, 1, 1]);
    const imgOrigin0 = new Point3D(0, 0, 0);
    const imgGeometry0 = new Geometry(imgOrigin0, imgSize0, imgSpacing0);
    const buffer0 = [];
    for (let i = 0; i < size0 * size0; ++i) {
      buffer0[i] = i;
    }
    const image0 = new Image(imgGeometry0, buffer0);
    image0.setMeta({BitsStored: 8});
    image0.setRescaleSlopeAndIntercept(new RescaleSlopeAndIntercept(2, 0));
    // create a view
    const view0 = new View(image0);
    // create the image data
    const imageData = {
      width: size0,
      height: size0,
      data: new Uint8ClampedArray(size0 * size0 * 4)
    };

    // default window level
    view0.setWindowLevelMinMax();
    // call generate data
    view0.generateImageData(imageData);
    // TODO proper data?
    const theoData0 = [0,
      0,
      0,
      255,
      102,
      102,
      102,
      255,
      204,
      204,
      204,
      255,
      255,
      255,
      255,
      255];
    let testContent0 = true;
    for (let i = 0; i < size0 * size0 * 4; ++i) {
      if (theoData0[i] !== imageData.data[i]) {
        console.log(i, theoData0[i], imageData.data[i]);
        testContent0 = false;
        break;
      }
    }
    assert.equal(testContent0, true, 'check image data');
  }
);

/**
 * Tests for {@link View} generateImageData RGB.
 *
 * @function module:tests/image~generate-data-rgb
 */
QUnit.test('Generate data RGB - #DWV-REQ-UI-02-001 Display image',
  function (assert) {
    // create an image
    const size0 = 2;
    const imgSize0 = new Size([size0, size0, 1]);
    const imgSpacing0 = new Spacing([1, 1, 1]);
    const imgOrigin0 = new Point3D(0, 0, 0);
    const imgGeometry0 = new Geometry(imgOrigin0, imgSize0, imgSpacing0);
    const buffer0 = [];
    let index = 0;
    let value = 0;
    // 0, 85, 170, 255
    for (let i = 0; i < size0 * size0; ++i) {
      value = i * 255 / ((size0 * size0) - 1);
      buffer0[index] = value;
      buffer0[index + 1] = value;
      buffer0[index + 2] = value;
      index += 3;
    }
    const image0 = new Image(imgGeometry0, buffer0);
    image0.setPhotometricInterpretation('RGB');
    image0.setMeta({BitsStored: 8});
    // create a view
    const view0 = new View(image0);
    // create the image data
    const imageData = {
      width: size0,
      height: size0,
      data: new Uint8ClampedArray(size0 * size0 * 4)
    };

    // default window level
    view0.setWindowLevel(new WindowLevel(127, 255));
    // call generate data
    view0.generateImageData(imageData);
    // check data content
    const theoData0 = [0,
      0,
      0,
      255,
      85,
      85,
      85,
      255,
      170,
      170,
      170,
      255,
      255,
      255,
      255,
      255];
    let testContent0 = true;
    for (let i = 0; i < size0 * size0 * 4; ++i) {
      if (theoData0[i] !== imageData.data[i]) {
        console.log(theoData0[i], imageData.data[i]);
        testContent0 = false;
        break;
      }
    }
    assert.equal(testContent0, true, 'check image data non planar');

    const buffer1 = [];
    index = 0;
    // 0, 85, 170, 255
    for (let i = 0; i < 3; ++i) {
      buffer1[index] = 0;
      buffer1[index + 1] = 85;
      buffer1[index + 2] = 170;
      buffer1[index + 3] = 255;
      index += 4;
    }
    const image1 = new Image(imgGeometry0, buffer1);
    image1.setPhotometricInterpretation('RGB');
    image1.setPlanarConfiguration(1);
    image1.setMeta({BitsStored: 8});
    // create a view
    const view1 = new View(image1);

    // default window level
    view1.setWindowLevel(new WindowLevel(127, 255));
    // call generate data
    view1.generateImageData(imageData);
    // check data content
    let testContent1 = true;
    for (let i = 0; i < size0 * size0 * 4; ++i) {
      if (theoData0[i] !== imageData.data[i]) {
        console.log(theoData0[i], imageData.data[i]);
        testContent1 = false;
        break;
      }
    }
    assert.equal(testContent1, true, 'check image data planar');
  }
);

/**
 * Tests for {@link View} generateImageData timing.
 *
 * @function module:tests/image~generate-data-timing
 */
QUnit.test('Generate data timing - #DWV-REQ-UI-02-001 Display image',
  function (assert) {
    // create an image
    const size0 = 128;
    const imgSize0 = new Size([size0, size0, 1]);
    const imgSpacing0 = new Spacing([1, 1, 1]);
    const imgOrigin0 = new Point3D(0, 0, 0);
    const imgGeometry0 = new Geometry(imgOrigin0, imgSize0, imgSpacing0);
    const buffer0 = [];
    for (let i = 0; i < size0 * size0; ++i) {
      buffer0[i] = i;
    }
    const image0 = new Image(imgGeometry0, buffer0);
    image0.setMeta({BitsStored: 8});
    // create a view
    const view0 = new View(image0);
    // create the image data
    const imageData = {
      width: size0,
      height: size0,
      data: new Uint8Array(size0 * size0 * 4)
    };

    // default window level
    view0.setWindowLevelMinMax();

    // start time
    const start0 = new Date();
    // call generate data
    view0.generateImageData(imageData);
    // time taken
    const time0 = (new Date()) - start0;
    // check time taken
    assert.ok(time0 < 90, 'First generateImageData: ' + time0 + 'ms.');

    // Change the window level
    view0.setWindowLevel(new WindowLevel(4000, 200));

    // start time
    const start1 = (new Date()).getMilliseconds();
    // call generate data
    view0.generateImageData(imageData);
    // time taken
    const time1 = (new Date()).getMilliseconds() - start1;
    // check time taken
    assert.ok(time1 < 90, 'Second generateImageData: ' + time1 + 'ms.');
  }
);
