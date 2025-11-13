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
  image0.setMeta({
    custom: {
      segments: [
        {
          number: 1,
          label: 'label1'
        },
        {
          number: 2,
          label: 'label2'
        },
        {
          number: 3,
          label: 'label3'
        }
      ]
    }
  });
  const segmentHelper0 = new MaskSegmentHelper(image0);

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
  image1.setMeta({
    custom: {
      segments: [
        {
          number: 1,
          label: 'label1'
        },
        {
          number: 2,
          label: 'label2'
        },
        {
          number: 3,
          label: 'label3'
        },
        {
          number: 4,
          label: 'label4'
        }
      ]
    }
  });
  const segmentHelper1 = new MaskSegmentHelper(image1);

  const overlap1 = segmentHelper1.findOverlap(segmentHelper0);

  // Undefined tests

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
  assert.notStrictEqual(
    typeof overlap1[3],
    'undefined',
    'Expected overlaps on label 3 returned for find overlap'
  );
  assert.notStrictEqual(
    typeof overlap1[4],
    'undefined',
    'Expected overlaps on label 4 returned for find overlap'
  );

  assert.notStrictEqual(
    typeof overlap1[1].overlap[1],
    'undefined',
    'Expected overlaps on label 1 for label 1 returned for find overlap'
  );
  assert.notStrictEqual(
    typeof overlap1[1].overlap[2],
    'undefined',
    'Expected overlaps on label 1 for label 2 returned for find overlap'
  );
  assert.strictEqual(
    typeof overlap1[1].overlap[3],
    'undefined',
    'Expected no overlaps on label 1 for label 3 returned for find overlap'
  );

  assert.notStrictEqual(
    typeof overlap1[2].overlap[1],
    'undefined',
    'Expected overlaps on label 2 for label 1 returned for find overlap'
  );
  assert.notStrictEqual(
    typeof overlap1[2].overlap[2],
    'undefined',
    'Expected overlaps on label 2 for label 2 returned for find overlap'
  );
  assert.notStrictEqual(
    typeof overlap1[2].overlap[3],
    'undefined',
    'Expected overlaps on label 2 for label 3 returned for find overlap'
  );

  assert.equal(
    Object.keys(overlap1[3].overlap).length,
    0,
    'Expected no overlaps on label 3 returned for find overlap'
  );
  assert.equal(
    Object.keys(overlap1[4].overlap).length,
    0,
    'Expected no overlaps on label 4 returned for find overlap'
  );

  // Total count tests

  assert.equal(
    overlap1[1].count,
    8,
    'Expected count on label 1'
  );

  assert.equal(
    overlap1[2].count,
    12,
    'Expected count on label 2'
  );

  assert.equal(
    overlap1[3].count,
    6,
    'Expected count on label 3'
  );

  assert.equal(
    overlap1[4].count,
    6,
    'Expected count on label 4'
  );

  // Overlap count tests

  assert.equal(
    overlap1[1].overlap[1].count,
    2,
    'Expected count on label 1 for label 1 for find overlap'
  );
  assert.equal(
    overlap1[1].overlap[2].count,
    1,
    'Expected count on label 1 for label 2 for find overlap'
  );

  assert.equal(
    overlap1[2].overlap[1].count,
    6,
    'Expected count on label 2 for label 1 for find overlap'
  );
  assert.equal(
    overlap1[2].overlap[2].count,
    3,
    'Expected count on label 2 for label 2 for find overlap'
  );
  assert.equal(
    overlap1[2].overlap[3].count,
    3,
    'Expected count on label 2 for label 3 for find overlap'
  );

  // Overlap percentage tests

  assert.equal(
    overlap1[1].overlap[1].percentage,
    25,
    'Expected percentage on label 1 for label 1 for find overlap'
  );
  assert.equal(
    overlap1[1].overlap[2].percentage,
    12.5,
    'Expected percentage on label 1 for label 2 for find overlap'
  );

  assert.equal(
    overlap1[2].overlap[1].percentage,
    50,
    'Expected percentage on label 2 for label 1 for find overlap'
  );
  assert.equal(
    overlap1[2].overlap[2].percentage,
    25,
    'Expected percentage on label 2 for label 2 for find overlap'
  );
  assert.equal(
    overlap1[2].overlap[3].percentage,
    25,
    'Expected percentage on label 2 for label 3 for find overlap'
  );

});