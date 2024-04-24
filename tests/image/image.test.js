import {Point3D} from '../../src/math/point';
import {Index} from '../../src/math/index';
import {getStats} from '../../src/math/stats';
import {arrayEquals} from '../../src/utils/array';
import {Size} from '../../src/image/size';
import {Spacing} from '../../src/image/spacing';
import {Geometry} from '../../src/image/geometry';
import {RescaleSlopeAndIntercept} from '../../src/image/rsi';
import {Image} from '../../src/image/image';
import {ImageFactory} from '../../src/image/imageFactory';

/**
 * Tests for the 'image/image.js' file.
 */

/* global QUnit */
QUnit.module('image');

/**
 * Compare an image and a buffer.
 *
 * @param {object} image The input image.
 * @param {object} size The size of the input buffer.
 * @param {Array} buffer The input buffer.
 * @param {object} rsi The rescale slope of the input buffer.
 * @returns {object} Statistics of the value and rescaled value differences.
 */
function compareImageAndBuffer(image, size, buffer, rsi) {
  const diffs = [];
  const diffsRescaled = [];

  // calculate differences
  let index = 0;
  for (let k = 0; k < size.get(2); ++k) {
    for (let j = 0; j < size.get(1); ++j) {
      for (let i = 0; i < size.get(0); ++i) {
        const diff = Math.abs(image.getValue(i, j, k) - buffer[index]);
        if (diff !== 0) {
          diffs.push(diff);
        }
        const diffRescaled = Math.abs(
          image.getRescaledValue(i, j, k) - rsi.apply(buffer[index]));
        if (diffRescaled !== 0) {
          diffsRescaled.push(diffRescaled);
        }
        ++index;
      }
    }
  }

  // calculate stats if necessary
  let statsDiff = {min: 0, max: 0, mean: 0, stdDev: 0};
  if (diffs.length !== 0) {
    statsDiff = getStats(diffs);
  }
  let statsDiffRescaled = {min: 0, max: 0, mean: 0, stdDev: 0};
  if (diffsRescaled.length !== 0) {
    statsDiffRescaled = getStats(diffsRescaled);
  }

  // return stats
  return {
    valuesStats: statsDiff,
    rescaledStats: statsDiffRescaled
  };
}

/**
 * Tests for {@link Image} getValue.
 *
 * @function module:tests/image~image-getvalue
 */
QUnit.test('Image getValue', function (assert) {
  const zeroStats = {min: 0, max: 0, mean: 0, stdDev: 0};

  // create a simple image
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
  // test its geometry
  assert.equal(image0.getGeometry(), imgGeometry0, 'Image geometry');
  // test its values
  const rsi0 = new RescaleSlopeAndIntercept(1, 0);
  const res0 = compareImageAndBuffer(image0, imgSize0, buffer0, rsi0);
  assert.propEqual(
    res0.valuesStats,
    zeroStats,
    'Values should be equal');
  assert.propEqual(
    res0.rescaledStats,
    zeroStats,
    'Rescaled values should be equal');
  // outside value
  assert.equal(isNaN(image0.getValue(4, 3, 0)), true, 'Value outside is NaN');
  // TODO: wrong, should not be accessed
  assert.equal(image0.getValue(5, 0, 0), 1 * size0 + 1, 'Value at 5,0,0');
  // check range
  const theoRange0 = {min: 0, max: (size0 * size0) - 1};
  const imgRange00 = image0.getDataRange();
  assert.equal(imgRange00.max, theoRange0.max, 'Range max');
  assert.equal(imgRange00.min, theoRange0.min, 'Range min');
  const imgRange01 = image0.getRescaledDataRange();
  assert.equal(imgRange01.max, theoRange0.max, 'Rescaled range max');
  assert.equal(imgRange01.min, theoRange0.min, 'Rescaled range min');

  // image with rescale
  const image1 = new Image(imgGeometry0, buffer0);
  const slope1 = 2;
  const intercept1 = 10;
  const rsi1 = new RescaleSlopeAndIntercept(slope1, intercept1);
  image1.setRescaleSlopeAndIntercept(rsi1, new Index([0, 0, 0]));
  // test its geometry
  assert.equal(image1.getGeometry(), imgGeometry0, 'Image geometry');
  // test its values
  const res1 = compareImageAndBuffer(image1, imgSize0, buffer0, rsi1);
  assert.propEqual(
    res1.valuesStats,
    zeroStats,
    'Values should be equal');
  assert.propEqual(
    res1.rescaledStats,
    zeroStats,
    'Rescaled values should be equal');
  // check range
  const imgRange10 = image0.getDataRange();
  assert.equal(imgRange10.max, theoRange0.max, 'Range max');
  assert.equal(imgRange10.min, theoRange0.min, 'Range min');
  const theoRange1 = {
    min: theoRange0.min * slope1 + intercept1,
    max: theoRange0.max * slope1 + intercept1
  };
  const imgRange11 = image1.getRescaledDataRange();
  assert.equal(imgRange11.max, theoRange1.max, 'Rescaled range max');
  assert.equal(imgRange11.min, theoRange1.min, 'Rescaled range min');
});

/**
 * Tests for {@link Image} histogram.
 *
 * @function module:tests/image~image-histogram
 */
QUnit.test('Image histogram', function (assert) {
  // create a simple image
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

  // histogram
  const histogram = image0.getHistogram();
  assert.equal(histogram.length, size0 * size0, 'histogram size');
  let histoContentTest = true;
  for (let j = 0; j < size0 * size0; ++j) {
    if (histogram[j][0] !== j) {
      histoContentTest = false;
      break;
    }
    if (histogram[j][1] !== 1) {
      histoContentTest = false;
      break;
    }
  }
  assert.equal(histoContentTest, true, 'histogram content');
});

/**
 * Tests for {@link Image} append.
 *
 * @function module:tests/image~image-append-slice
 */
QUnit.test('Image append slice', function (assert) {
  /**
   * Compare two arrays of vectors.
   *
   * @param {Point3D[]} arr0 The first array.
   * @param {Point3D[]} arr1 The second array.
   * @returns {boolean} True if both arrays are equal.
   */
  function compareArrayOfVectors(arr0, arr1) {
    return arr0.every(function (element, index) {
      return element.equals(arr1[index]);
    });
  }

  const size = 4;
  const imgSize = new Size([size, size, 2]);
  const imgSizeMinusOne = new Size([size, size, 1]);
  const imgSpacing = new Spacing([1, 1, 1]);
  const imgOrigin = new Point3D(0, 0, 0);

  // slice to append
  const sliceSize = new Size([size, size, 1]);
  const sliceBuffer = new Int16Array(sliceSize.getTotalSize());
  for (let i = 0; i < size * size; ++i) {
    sliceBuffer[i] = 2;
  }

  // image buffer
  const buffer = new Int16Array(imgSize.getTotalSize());
  for (let j = 0; j < size * size; ++j) {
    buffer[j] = 0;
  }
  for (let k = size * size; k < 2 * size * size; ++k) {
    buffer[k] = 1;
  }

  // image 0
  const imgGeometry0 = new Geometry(
    imgOrigin, imgSizeMinusOne, imgSpacing);
  imgGeometry0.appendOrigin(new Point3D(0, 0, 1), 1);
  const image0 = new Image(imgGeometry0, buffer, ['0']);
  image0.setMeta({numberOfFiles: 3});
  // append null
  assert.throws(function () {
    image0.appendSlice(null);
  }, new Error('Cannot append null slice'), 'append null slice');
  // real slice
  const sliceOrigin = new Point3D(0, 0, -1);
  const sliceGeometry = new Geometry(
    sliceOrigin, sliceSize, imgSpacing);
  const slice0 = new Image(sliceGeometry, sliceBuffer, ['1']);
  slice0.setMeta({numberOfFiles: 3});
  // append slice before
  image0.appendSlice(slice0);
  // test its values
  assert.equal(image0.getValue(0, 0, 0), 2, 'Value at 0,0,0 (append before)');
  assert.equal(image0.getValue(3, 3, 0), 2, 'Value at 3,3,0 (append before)');
  assert.equal(image0.getValue(0, 0, 1), 0, 'Value at 0,0,1 (append before)');
  assert.equal(image0.getValue(3, 3, 1), 0, 'Value at 3,3,1 (append before)');
  assert.equal(image0.getValue(0, 0, 2), 1, 'Value at 0,0,2 (append before)');
  assert.equal(image0.getValue(3, 3, 2), 1, 'Value at 3,3,2 (append before)');
  // test its positions
  const sliceOrigins0 = [];
  sliceOrigins0[0] = new Point3D(0, 0, -1);
  sliceOrigins0[1] = new Point3D(0, 0, 0);
  sliceOrigins0[2] = new Point3D(0, 0, 1);
  assert.ok(
    compareArrayOfVectors(imgGeometry0.getOrigins(), sliceOrigins0),
    'Slice positions (append before)');

  // image 1
  const imgGeometry1 = new Geometry(
    imgOrigin, imgSizeMinusOne, imgSpacing);
  imgGeometry1.appendOrigin(new Point3D(0, 0, 1), 1);
  const image1 = new Image(imgGeometry1, buffer, ['0']);
  image1.setMeta({numberOfFiles: 3});
  const sliceOrigin1 = new Point3D(0, 0, 2);
  const sliceGeometry1 = new Geometry(
    sliceOrigin1, sliceSize, imgSpacing);
  const slice1 = new Image(sliceGeometry1, sliceBuffer, ['1']);
  slice1.setMeta({numberOfFiles: 3});
  // append slice before
  image1.appendSlice(slice1);
  // test its values
  assert.equal(image1.getValue(0, 0, 0), 0, 'Value at 0,0,0 (append after)');
  assert.equal(image1.getValue(3, 3, 0), 0, 'Value at 3,3,0 (append after)');
  assert.equal(image1.getValue(0, 0, 1), 1, 'Value at 0,0,1 (append after)');
  assert.equal(image1.getValue(3, 3, 1), 1, 'Value at 3,3,1 (append after)');
  assert.equal(image1.getValue(0, 0, 2), 2, 'Value at 0,0,2 (append after)');
  assert.equal(image1.getValue(3, 3, 2), 2, 'Value at 3,3,2 (append after)');
  // test its positions
  const sliceOrigins1 = [];
  sliceOrigins1[0] = new Point3D(0, 0, 0);
  sliceOrigins1[1] = new Point3D(0, 0, 1);
  sliceOrigins1[2] = new Point3D(0, 0, 2);
  assert.ok(
    compareArrayOfVectors(imgGeometry1.getOrigins(), sliceOrigins1),
    'Slice positions (append after)');

  // image 2
  const imgGeometry2 = new Geometry(
    imgOrigin, imgSizeMinusOne, imgSpacing);
  imgGeometry2.appendOrigin(new Point3D(0, 0, 1), 1);
  const image2 = new Image(imgGeometry2, buffer, ['0']);
  image2.setMeta({numberOfFiles: 3});
  const sliceOrigin2 = new Point3D(0, 0, 0.4);
  const sliceGeometry2 = new Geometry(
    sliceOrigin2, sliceSize, imgSpacing);
  const slice2 = new Image(sliceGeometry2, sliceBuffer, ['1']);
  slice2.setMeta({numberOfFiles: 3});
  // append slice before
  image2.appendSlice(slice2);
  // test its values
  assert.equal(image2.getValue(0, 0, 0), 0, 'Value at 0,0,0 (append between)');
  assert.equal(image2.getValue(3, 3, 0), 0, 'Value at 3,3,0 (append between)');
  assert.equal(image2.getValue(0, 0, 1), 2, 'Value at 0,0,1 (append between)');
  assert.equal(image2.getValue(3, 3, 1), 2, 'Value at 3,3,1 (append between)');
  assert.equal(image2.getValue(0, 0, 2), 1, 'Value at 0,0,2 (append between)');
  assert.equal(image2.getValue(3, 3, 2), 1, 'Value at 3,3,2 (append between)');
  // test its positions
  const sliceOrigins2 = [];
  sliceOrigins2[0] = new Point3D(0, 0, 0);
  sliceOrigins2[1] = new Point3D(0, 0, 0.4);
  sliceOrigins2[2] = new Point3D(0, 0, 1);
  assert.ok(
    compareArrayOfVectors(imgGeometry2.getOrigins(), sliceOrigins2),
    'Slice positions (append between)');
});

/**
 * Tests for {@link Image} convolute2D.
 *
 * @function module:tests/image~image-convolute2D
 */
QUnit.test('Image convolute2D', function (assert) {
  // create a simple image
  const size0 = 3;
  const imgSize0 = new Size([size0, size0, 1]);
  const imgSpacing0 = new Spacing([1, 1, 1]);
  const imgOrigin0 = new Point3D(0, 0, 0);
  const imgGeometry0 = new Geometry(imgOrigin0, imgSize0, imgSpacing0);
  const buffer0 = [];
  for (let i = 0; i < size0 * size0; ++i) {
    buffer0[i] = i;
  }
  const image0 = new Image(imgGeometry0, buffer0);
  // id convolution
  const weights0 = [0, 0, 0, 0, 1, 0, 0, 0, 0];
  const resImage0 = image0.convolute2D(weights0);
  let testContent0 = true;
  for (let i = 0; i < size0 * size0; ++i) {
    if (image0.getValueAtOffset(i, 0) !== resImage0.getValueAtOffset(i, 0)) {
      testContent0 = false;
      break;
    }
  }
  assert.equal(testContent0, true, 'convolute2D id');
  // blur convolution
  const weights1 = [1, 1, 1, 1, 1, 1, 1, 1, 1];
  const resImage1 = image0.convolute2D(weights1);
  const theoResImage1 = [12, 18, 24, 30, 36, 42, 48, 54, 60];
  let testContent1 = true;
  for (let i = 0; i < size0 * size0; ++i) {
    if (theoResImage1[i] !== resImage1.getValueAtOffset(i, 0)) {
      testContent1 = false;
      break;
    }
  }
  assert.equal(testContent1, true, 'convolute2D blur');
});

/**
 * Tests for {@link Image} transform.
 *
 * @function module:tests/image~image-transform
 */
QUnit.test('Image transform', function (assert) {
  // create a simple image
  const size0 = 3;
  const imgSize0 = new Size([size0, size0, 1]);
  const imgSpacing0 = new Spacing([1, 1, 1]);
  const imgOrigin0 = new Point3D(0, 0, 0);
  const imgGeometry0 = new Geometry(imgOrigin0, imgSize0, imgSpacing0);
  const buffer0 = [];
  for (let i = 0; i < size0 * size0; ++i) {
    buffer0[i] = i;
  }
  let image0 = new Image(imgGeometry0, buffer0);

  // treshold function
  const func0 = function (value) {
    if (value < 3 || value > 5) {
      return 0;
    } else {
      return value;
    }
  };
  const resImage0 = image0.transform(func0);
  const theoResImage0 = [0, 0, 0, 3, 4, 5, 0, 0, 0];
  let testContent0 = true;
  for (let i = 0; i < size0 * size0; ++i) {
    if (theoResImage0[i] !== resImage0.getValueAtOffset(i, 0)) {
      testContent0 = false;
      break;
    }
  }
  assert.equal(testContent0, true, 'transform threshold');

  // new image
  image0 = new Image(imgGeometry0, buffer0);

  // multiply function
  const func1 = function (value) {
    return value * 2;
  };
  const resImage1 = image0.transform(func1);
  const theoResImage1 = [0, 2, 4, 6, 8, 10, 12, 14, 16];
  let testContent1 = true;
  for (let i = 0; i < size0 * size0; ++i) {
    if (theoResImage1[i] !== resImage1.getValueAtOffset(i, 0)) {
      testContent1 = false;
      break;
    }
  }
  assert.equal(testContent1, true, 'transform multiply');
});

/**
 * Tests for {@link Image} compose.
 *
 * @function module:tests/image~image-compose
 */
QUnit.test('Image compose', function (assert) {
  // create two simple images
  const size0 = 3;
  const imgSize0 = new Size([size0, size0, 1]);
  const imgSpacing0 = new Spacing([1, 1, 1]);
  const imgOrigin0 = new Point3D(0, 0, 0);
  const imgGeometry0 = new Geometry(imgOrigin0, imgSize0, imgSpacing0);
  const buffer0 = [];
  for (let i = 0; i < size0 * size0; ++i) {
    buffer0[i] = i;
  }
  const image0 = new Image(imgGeometry0, buffer0);
  const buffer1 = [];
  for (let i = 0; i < size0 * size0; ++i) {
    buffer1[i] = i;
  }
  const image1 = new Image(imgGeometry0, buffer1);

  // addition function
  const func0 = function (a, b) {
    return a + b;
  };
  const resImage0 = image0.compose(image1, func0);
  const theoResImage0 = [0, 2, 4, 6, 8, 10, 12, 14, 16];
  let testContent0 = true;
  for (let i = 0; i < size0 * size0; ++i) {
    if (theoResImage0[i] !== resImage0.getValueAtOffset(i, 0)) {
      testContent0 = false;
      break;
    }
  }
  assert.equal(testContent0, true, 'compose addition');
});

/**
 * Tests for {@link ImageFactory}.
 *
 * @function module:tests/image~imageFactory
 */
QUnit.test('ImageFactory', function (assert) {
  const zeroStats = {min: 0, max: 0, mean: 0, stdDev: 0};

  const size0 = 3;
  const imgSize0 = new Size([size0, size0, 1]);
  const imgSpacing0 = new Spacing([1, 1, 1]);
  const imgOrigin0 = new Point3D(0, 0, 0);
  const imgGeometry0 = new Geometry(imgOrigin0, imgSize0, imgSpacing0);
  const buffer0 = [];
  for (let i = 0; i < size0 * size0; ++i) {
    buffer0[i] = i;
  }
  const rsi0 = new RescaleSlopeAndIntercept(1, 0);

  const dicomElements0 = [];
  // columns
  dicomElements0['00280011'] = {value: [imgSize0.get(0)]};
  // rows
  dicomElements0['00280010'] = {value: [imgSize0.get(1)]};
  // spacing
  dicomElements0['00280030'] = {
    value: [imgSpacing0.get(1), imgSpacing0.get(2)]
  };
  // transfer syntax (explicit VR)
  dicomElements0['00020010'] = {value: ['1.2.840.10008.1.2.1']};
  // SOP class UID
  dicomElements0['00080016'] = {value: ['1.2.840.10008.5.1.4.1.1.4']};
  // modality
  dicomElements0['00080060'] = {value: ['MR']};
  // SOP instance UID
  dicomElements0['00080018'] = {value: ['1.2.840.34.56.78999654.234]']};

  // create the image factory
  const factory0 = new ImageFactory();
  // create the image
  const image0 = factory0.create(dicomElements0, buffer0);

  // test its geometry
  assert.ok(image0.getGeometry().equals(imgGeometry0), 'Image geometry');
  // test its values
  const res0 = compareImageAndBuffer(image0, imgSize0, buffer0, rsi0);
  assert.propEqual(
    res0.valuesStats,
    zeroStats,
    'Values should be equal');
  assert.propEqual(
    res0.rescaledStats,
    zeroStats,
    'Rescaled values should be equal');
});

/**
 * Tests for {@link Image} hasValues and getOffsets.
 *
 * @function module:tests/image~hasValues-getOffsets
 */
QUnit.test('hasValues getOffsets', function (assert) {
  const size0 = 3;
  const imgSize0 = new Size([size0, size0, 1]);
  const imgSpacing0 = new Spacing([1, 1, 1]);
  const imgOrigin0 = new Point3D(0, 0, 0);
  const imgGeometry0 = new Geometry(imgOrigin0, imgSize0, imgSpacing0);
  const buffer0 = [];
  buffer0[0] = 1;
  for (let i0 = 1; i0 < 2 * size0; ++i0) {
    buffer0[i0] = 0;
  }
  for (let i1 = 2 * size0; i1 < size0 * size0; ++i1) {
    buffer0[i1] = 1;
  }
  const theoOffset0 = [1, 2, 3, 4, 5];
  const theoOffset1 = [0, 6, 7, 8];

  // create the image
  const image0 = new Image(imgGeometry0, buffer0);

  // test hasValues
  assert.ok(
    arrayEquals(image0.hasValues([0]), [true]),
    'Image has values 0'
  );
  assert.ok(
    arrayEquals(image0.hasValues([1]), [true]),
    'Image has values 1'
  );
  assert.ok(
    arrayEquals(image0.hasValues([2]), [false]),
    'Image has values 2'
  );
  assert.ok(
    arrayEquals(image0.hasValues([0, 1]), [true, true]),
    'Image has values 0,1'
  );
  assert.ok(
    arrayEquals(image0.hasValues([0, 2]), [true, false]),
    'Image has values 0,2'
  );
  assert.ok(
    arrayEquals(image0.hasValues([2, 0]), [false, true]),
    'Image has values 2,0'
  );
  assert.ok(
    arrayEquals(image0.hasValues([0, 2, 1]), [true, false, true]),
    'Image has values 0,2,1'
  );
  assert.ok(
    arrayEquals(image0.hasValues([2, 1, 0]), [false, true, true]),
    'Image has values 2,1,0'
  );

  // test offsets list
  const off00 = image0.getOffsets(0);
  const off01 = image0.getOffsets(1);
  assert.ok(arrayEquals(off00, theoOffset0), 'Image offsets 0');
  assert.ok(arrayEquals(off01, theoOffset1), 'Image offsets 1');
});
