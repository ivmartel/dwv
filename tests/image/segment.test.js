import {Point3D} from '../../src/math/point.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Matrix33} from '../../src/math/matrix.js';
import {Geometry} from '../../src/image/geometry.js';
import {MaskSegmentHelper} from '../../src/image/maskSegmentHelper.js';
import {Image} from '../../src/image/image.js';

/**
 * Tests for the 'image/maskSegmentHelper.js' file.
 */

/* global QUnit */
QUnit.module('image');

/**
 * Tests for {@link MaskSegmentHelper} findOverlap.
 *
 * @function module:tests/image~MaskSegmentHelper-findOverlap
 */
QUnit.test('MaskSegmentHelper findOverlap', function (assert) {
  const imgOrigins = [new Point3D(0, 0, 0)];
  const imgSpacing = new Spacing([1, 1, 1]);
  const imgSize = new Size([4, 4, 2]);
  /* eslint-disable @stylistic/js/array-element-newline */
  const o = [
    1, 0, 0,
    0, 0, 1,
    0, 1, 0,
  ];
  /* eslint-enable @stylistic/js/array-element-newline */
  const imgOrientation = new Matrix33(o);
  const imgGeometry =
    new Geometry(
      imgOrigins,
      imgSize,
      imgSpacing,
      imgOrientation
    );
  /* eslint-disable @stylistic/js/array-element-newline */
  const imgBuffer0 = new Uint8Array([
    1, 1, 0, 0,
    1, 1, 0, 0,
    0, 0, 2, 2,
    0, 0, 2, 2,

    1, 1, 0, 0,
    1, 1, 0, 0,
    0, 0, 0, 3,
    0, 0, 3, 3
  ]);
  /* eslint-enable @stylistic/js/array-element-newline */
  const image0 = new Image(imgGeometry, imgBuffer0);

  /* eslint-disable @stylistic/js/array-element-newline */
  const imgBuffer1 = new Uint8Array([
    2, 2, 3, 3,
    2, 1, 1, 3,
    4, 1, 1, 2,
    4, 4, 2, 2,

    2, 2, 3, 3,
    2, 1, 1, 3,
    4, 1, 1, 2,
    4, 4, 2, 2
  ]);
  /* eslint-enable @stylistic/js/array-element-newline */
  const image1 = new Image(imgGeometry, imgBuffer1);
  image1.setMeta({});
  const segmentHelper1 = new MaskSegmentHelper(image1);

  const overlap1 = segmentHelper1.findOverlap(image0);

  assert.notStrictEqual(
    typeof overlap1,
    'undefined',
    'Expected overlaps returned for find overlap'
  );

  assert.notStrictEqual(
    typeof overlap1[1],
    'undefined',
    'Expected overlaps on label 1 returned for find overlap'
  );
  assert.notStrictEqual(
    typeof overlap1[2],
    'undefined',
    'Expected overlaps on label 2 returned for find overlap'
  );
  assert.strictEqual(
    typeof overlap1[3],
    'undefined',
    'Expected no overlaps on label 3 returned for find overlap'
  );
  assert.strictEqual(
    typeof overlap1[4],
    'undefined',
    'Expected no overlaps on label 4 returned for find overlap'
  );

  assert.notStrictEqual(
    typeof overlap1[1][1],
    'undefined',
    'Expected overlaps on label 1 for label 1 returned for find overlap'
  );
  assert.notStrictEqual(
    typeof overlap1[1][2],
    'undefined',
    'Expected overlaps on label 1 for label 2 returned for find overlap'
  );
  assert.strictEqual(
    typeof overlap1[1][3],
    'undefined',
    'Expected no overlaps on label 1 for label 3 returned for find overlap'
  );

  assert.notStrictEqual(
    typeof overlap1[2][1],
    'undefined',
    'Expected overlaps on label 2 for label 1 returned for find overlap'
  );
  assert.notStrictEqual(
    typeof overlap1[2][2],
    'undefined',
    'Expected overlaps on label 2 for label 2 returned for find overlap'
  );
  assert.notStrictEqual(
    typeof overlap1[2][3],
    'undefined',
    'Expected overlaps on label 2 for label 3 returned for find overlap'
  );

  assert.equal(
    overlap1[1][1],
    2,
    'Expected count on label 1 for label 1 for find overlap'
  );
  assert.equal(
    overlap1[1][2],
    1,
    'Expected count on label 1 for label 2 for find overlap'
  );

  assert.equal(
    overlap1[2][1],
    6,
    'Expected count on label 2 for label 1 for find overlap'
  );
  assert.equal(
    overlap1[2][2],
    3,
    'Expected count on label 2 for label 2 for find overlap'
  );
  assert.equal(
    overlap1[2][2],
    3,
    'Expected count on label 2 for label 3 for find overlap'
  );


});