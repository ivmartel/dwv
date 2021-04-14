/**
 * Tests for the 'image/view.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('view');

/**
 * Tests for {@link dwv.image.View} listeners.
 *
 * @function module:tests/image~listeners
 */
QUnit.test('Test listeners.', function (assert) {
  // create an image
  var size0 = 4;
  var imgSize0 = new dwv.image.Size(size0, size0, 1);
  var imgSpacing0 = new dwv.image.Spacing(1, 1, 1);
  var imgOrigin0 = new dwv.math.Point3D(0, 0, 0);
  var imgGeometry0 = new dwv.image.Geometry(imgOrigin0, imgSize0, imgSpacing0);
  var buffer0 = [];
  for (var i = 0; i < size0 * size0; ++i) {
    buffer0[i] = i;
  }
  var image0 = new dwv.image.Image(imgGeometry0, buffer0);
  image0.setMeta({BitsStored: 8});
  // create a view
  var view0 = new dwv.image.View(image0);

  // listeners
  var listener1 = function (event) {
    assert.equal(event.wc, 0, 'Expected call to listener1.');
  };
  var listener2 = function (event) {
    assert.equal(event.ww, 1, 'Expected call to listener2.');
  };
    // with two listeners
  view0.addEventListener('wlcenterchange', listener1);
  view0.addEventListener('wlcenterchange', listener2);
  view0.setWindowLevel(0, 1);
  // without listener2
  view0.removeEventListener('wlcenterchange', listener2);
  view0.setWindowLevel(0, 2);
  // without listener1
  view0.removeEventListener('wlcenterchange', listener1);
  view0.setWindowLevel(1, 1);
});

/**
 * Tests for {@link dwv.image.View} getImage meta.
 *
 * @function module:tests/image~getMeta
 */
QUnit.test('Test playback milliseconds.', function (assert) {
  // create an image
  var size0 = 4;
  var imgSize0 = new dwv.image.Size(size0, size0, 1);
  var imgSpacing0 = new dwv.image.Spacing(1, 1, 1);
  var imgOrigin0 = new dwv.math.Point3D(0, 0, 0);
  var imgGeometry0 = new dwv.image.Geometry(imgOrigin0, imgSize0, imgSpacing0);
  var buffer0 = [];
  for (var i = 0; i < size0 * size0; ++i) {
    buffer0[i] = i;
  }
  var image0 = new dwv.image.Image(imgGeometry0, buffer0);
  image0.setMeta({RecommendedDisplayFrameRate: 20});

  // create a view
  var view0 = new dwv.image.View(image0);

  // get frame rate from meta
  var recommendedDisplayFrameRate =
    view0.getImage().getMeta().RecommendedDisplayFrameRate;

  assert.equal(recommendedDisplayFrameRate, 20, 'check image meta');

  // get milliseconds per frame from frame rate
  var milliseconds = view0.getPlaybackMilliseconds(recommendedDisplayFrameRate);

  assert.equal(milliseconds, 50, 'check view getPlaybackMilliseconds');

  // get default milliseconds if no frame rate provided
  var defaultMilliseconds = view0.getPlaybackMilliseconds(null);

  // default to 10 fps
  assert.equal(defaultMilliseconds, 100, 'check view getPlaybackMilliseconds');
});

/**
 * Tests for {@link dwv.image.View} generateImageData MONO.
 *
 * @function module:tests/image~generateImageDataMONO
 */
QUnit.test('Test generate data MONO.', function (assert) {
  // create an image
  var size0 = 2;
  var imgSize0 = new dwv.image.Size(size0, size0, 1);
  var imgSpacing0 = new dwv.image.Spacing(1, 1, 1);
  var imgOrigin0 = new dwv.math.Point3D(0, 0, 0);
  var imgGeometry0 = new dwv.image.Geometry(imgOrigin0, imgSize0, imgSpacing0);
  var buffer0 = [];
  for (var i = 0; i < size0 * size0; ++i) {
    buffer0[i] = i;
  }
  var image0 = new dwv.image.Image(imgGeometry0, buffer0);
  image0.setMeta({BitsStored: 8});
  // create a view
  var view0 = new dwv.image.View(image0);
  // create the image data
  var imageData = {
    width: size0,
    height: size0,
    data: new Uint8ClampedArray(size0 * size0 * 4)
  };

  // default window level
  view0.setWindowLevelMinMax();
  // call generate data
  view0.generateImageData(imageData);
  // TODO proper data?
  var theoData0 = [0,
    0,
    0,
    255,
    127,
    127,
    127,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255];
  var testContent0 = true;
  for (i = 0; i < size0 * size0 * 4; ++i) {
    if (theoData0[i] !== imageData.data[i]) {
      testContent0 = false;
      break;
    }
  }
  assert.equal(testContent0, true, 'check image data');
});

/**
 * Tests for {@link dwv.image.View} generateImageData RGB.
 *
 * @function module:tests/image~generateImageDataRGB
 */
QUnit.test('Test generate data RGB.', function (assert) {
  // create an image
  var size0 = 2;
  var imgSize0 = new dwv.image.Size(size0, size0, 1);
  var imgSpacing0 = new dwv.image.Spacing(1, 1, 1);
  var imgOrigin0 = new dwv.math.Point3D(0, 0, 0);
  var imgGeometry0 = new dwv.image.Geometry(imgOrigin0, imgSize0, imgSpacing0);
  var buffer0 = [];
  var index = 0;
  var value = 0;
  // 0, 85, 170, 255
  for (var i = 0; i < size0 * size0; ++i) {
    value = i * 255 / ((size0 * size0) - 1);
    buffer0[index] = value;
    buffer0[index + 1] = value;
    buffer0[index + 2] = value;
    index += 3;
  }
  var image0 = new dwv.image.Image(imgGeometry0, buffer0);
  image0.setPhotometricInterpretation('RGB');
  image0.setMeta({BitsStored: 8});
  // create a view
  var view0 = new dwv.image.View(image0);
  // create the image data
  var imageData = {
    width: size0,
    height: size0,
    data: new Uint8ClampedArray(size0 * size0 * 4)
  };

  // default window level
  view0.setWindowLevel(127, 255);
  // call generate data
  view0.generateImageData(imageData);
  // check data content
  var theoData0 = [0,
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
  var testContent0 = true;
  for (i = 0; i < size0 * size0 * 4; ++i) {
    if (theoData0[i] !== imageData.data[i]) {
      console.log(theoData0[i], imageData.data[i]);
      testContent0 = false;
      break;
    }
  }
  assert.equal(testContent0, true, 'check image data non planar');

  var buffer1 = [];
  index = 0;
  // 0, 85, 170, 255
  for (i = 0; i < 3; ++i) {
    buffer1[index] = 0;
    buffer1[index + 1] = 85;
    buffer1[index + 2] = 170;
    buffer1[index + 3] = 255;
    index += 4;
  }
  var image1 = new dwv.image.Image(imgGeometry0, buffer1);
  image1.setPhotometricInterpretation('RGB');
  image1.setPlanarConfiguration(1);
  image1.setMeta({BitsStored: 8});
  // create a view
  var view1 = new dwv.image.View(image1);

  // default window level
  view1.setWindowLevel(127, 255);
  // call generate data
  view1.generateImageData(imageData);
  // check data content
  var testContent1 = true;
  for (i = 0; i < size0 * size0 * 4; ++i) {
    if (theoData0[i] !== imageData.data[i]) {
      console.log(theoData0[i], imageData.data[i]);
      testContent1 = false;
      break;
    }
  }
  assert.equal(testContent1, true, 'check image data planar');
});

/**
 * Tests for {@link dwv.image.View} generateImageData timing.
 *
 * @function module:tests/image~generateImageDataTiming
 */
QUnit.test('Test generate data timing.', function (assert) {
  // create an image
  var size0 = 128;
  var imgSize0 = new dwv.image.Size(size0, size0, 1);
  var imgSpacing0 = new dwv.image.Spacing(1, 1, 1);
  var imgOrigin0 = new dwv.math.Point3D(0, 0, 0);
  var imgGeometry0 = new dwv.image.Geometry(imgOrigin0, imgSize0, imgSpacing0);
  var buffer0 = [];
  for (var i = 0; i < size0 * size0; ++i) {
    buffer0[i] = i;
  }
  var image0 = new dwv.image.Image(imgGeometry0, buffer0);
  image0.setMeta({BitsStored: 8});
  // create a view
  var view0 = new dwv.image.View(image0);
  // create the image data
  var imageData = {
    width: size0,
    height: size0,
    data: new Uint8Array(size0 * size0 * 4)
  };

  // default window level
  view0.setWindowLevelMinMax();

  // start time
  var start0 = new Date();
  // call generate data
  view0.generateImageData(imageData);
  // time taken
  var time0 = (new Date()) - start0;
  // check time taken
  assert.ok(time0 < 90, 'First generateImageData: ' + time0 + 'ms.');

  // Change the window level
  view0.setWindowLevel(4000, 200);

  // start time
  var start1 = (new Date()).getMilliseconds();
  // call generate data
  view0.generateImageData(imageData);
  // time taken
  var time1 = (new Date()).getMilliseconds() - start1;
  // check time taken
  assert.ok(time1 < 90, 'Second generateImageData: ' + time1 + 'ms.');
});
