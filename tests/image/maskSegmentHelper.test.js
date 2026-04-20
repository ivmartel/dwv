import {describe, test, assert, vi, beforeEach, afterEach} from 'vitest';
import {MaskSegmentHelper} from '../../src/image/maskSegmentHelper.js';
import {MaskSegment} from '../../src/dicom/dicomSegment.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Geometry} from '../../src/image/geometry.js';
import {Matrix33} from '../../src/math/matrix.js';
import {Image} from '../../src/image/image.js';
import {Point3D} from '../../src/math/point.js';
import * as loggerModule from '../../src/utils/logger.js';

/**
 * Tests for the 'image/maskSegmentHelper.js' file.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal mock mask image.
 * Only the methods required by MaskSegmentHelper are present;
 * `hasValues` and `updatePaletteColourMap` are Vitest spies so calls
 * can be inspected.
 *
 * @param {object} [meta] Optional initial meta object.
 * @returns {object} Mock mask image.
 */
function makeMockMask(meta = {}) {
  return {
    _meta: meta,
    getMeta() {
      return this._meta;
    },
    setMeta(m) {
      this._meta = m;
    },
    hasValues: vi.fn(() => []),
    updatePaletteColourMap: vi.fn()
  };
}

/**
 * Build a real single-component, single-slice Image for findOverlap tests.
 * Uses Uint8Array so segment numbers (0–255) fit without clamping.
 *
 * @param {number} width Number of columns.
 * @param {number} height Number of rows.
 * @param {number[]} values Pixel values in row-major order.
 * @param {Point3D} [origin] Optional world-space origin (defaults to 0,0,0).
 * @returns {Image} The constructed image.
 */
function makeRealMask(width, height, values, origin = new Point3D(0, 0, 0)) {
  const geometry = new Geometry(
    [origin],
    new Size([width, height, 1]),
    new Spacing([1, 1, 1])
  );
  const img = new Image(geometry, new Uint8Array(values));
  img.setMeta({custom: {segments: []}});
  return img;
}

/**
 * Build a MaskSegment with only number and label set.
 *
 * @param {number} number Segment number.
 * @param {string} [label] Optional label (defaults to `seg-<number>`).
 * @returns {MaskSegment} The constructed segment.
 */
function makeSeg(number, label = `seg-${number}`) {
  return new MaskSegment(number, label, 'MANUAL');
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('image', () => {

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  /**
   * Tests that the constructor reads segments from an existing meta object.
   *
   * @function module:tests/image~maskSegmentHelperConstructorExisting
   */
  test('MaskSegmentHelper constructor reads pre-existing segments', () => {
    const seg = makeSeg(1);
    const mask = makeMockMask({custom: {segments: [seg]}});
    const helper = new MaskSegmentHelper(mask);
    assert.equal(helper.getNumberOfSegments(), 1, 'one pre-existing segment');
    assert.equal(helper.getSegment(1), seg, 'segment retrieved correctly');
  });

  /**
   * Tests that the constructor initialises meta.custom when absent.
   *
   * @function module:tests/image~maskSegmentHelperConstructorNoCustom
   */
  test(
    'MaskSegmentHelper constructor initialises meta.custom when absent',
    () => {
      const mask = makeMockMask({});
      new MaskSegmentHelper(mask);
      assert.ok(
        typeof mask.getMeta().custom !== 'undefined', 'custom created'
      );
      assert.deepEqual(
        mask.getMeta().custom.segments, [], 'segments array created'
      );
    }
  );

  /**
   * Tests that the constructor adds a segments array when meta.custom exists
   * but has no segments property.
   *
   * @function module:tests/image~maskSegmentHelperConstructorNoSegments
   */
  test(
    'MaskSegmentHelper constructor adds segments array when missing',
    () => {
      const mask = makeMockMask({custom: {}});
      new MaskSegmentHelper(mask);
      assert.deepEqual(
        mask.getMeta().custom.segments, [], 'segments array added'
      );
    }
  );

  // -------------------------------------------------------------------------
  // getMask
  // -------------------------------------------------------------------------

  /**
   * Tests that getMask returns the mask passed to the constructor.
   *
   * @function module:tests/image~maskSegmentHelperGetMask
   */
  test('MaskSegmentHelper getMask returns the mask image', () => {
    const mask = makeMockMask();
    const helper = new MaskSegmentHelper(mask);
    assert.equal(helper.getMask(), mask);
  });

  // -------------------------------------------------------------------------
  // hasSegment / getSegment / getNumberOfSegments
  // -------------------------------------------------------------------------

  let helper;

  beforeEach(() => {
    helper = new MaskSegmentHelper(makeMockMask());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Tests hasSegment and getSegment for present and absent segments.
   *
   * @function module:tests/image~maskSegmentHelperHasGetSegment
   */
  test('MaskSegmentHelper hasSegment and getSegment', () => {
    const seg = makeSeg(3);
    helper.addSegment(seg);

    assert.ok(helper.hasSegment(3), 'hasSegment true after add');
    assert.notOk(helper.hasSegment(99), 'hasSegment false for unknown');
    assert.equal(helper.getSegment(3), seg, 'getSegment returns segment');
    assert.equal(
      helper.getSegment(99), undefined, 'getSegment returns undefined'
    );
  });

  /**
   * Tests that getNumberOfSegments tracks additions and removals.
   *
   * @function module:tests/image~maskSegmentHelperCount
   */
  test('MaskSegmentHelper getNumberOfSegments tracks add/remove', () => {
    assert.equal(helper.getNumberOfSegments(), 0, 'starts empty');
    helper.addSegment(makeSeg(1));
    helper.addSegment(makeSeg(2));
    assert.equal(helper.getNumberOfSegments(), 2, 'after two adds');
    helper.removeSegment(1);
    assert.equal(helper.getNumberOfSegments(), 1, 'after one remove');
  });

  // -------------------------------------------------------------------------
  // addSegment
  // -------------------------------------------------------------------------

  /**
   * Tests that addSegment calls updatePaletteColourMap when displayRGBValue
   * is set.
   *
   * @function module:tests/image~maskSegmentHelperAddRgb
   */
  test('MaskSegmentHelper addSegment calls updatePaletteColourMap', () => {
    const mask = makeMockMask();
    const h = new MaskSegmentHelper(mask);
    const seg = makeSeg(1);
    seg.displayRGBValue = {r: 255, g: 0, b: 0};

    h.addSegment(seg);

    assert.equal(
      mask.updatePaletteColourMap.mock.calls.length, 1, 'called once'
    );
    assert.equal(
      mask.updatePaletteColourMap.mock.calls[0][0], 1, 'index = segment number'
    );
    assert.deepEqual(
      mask.updatePaletteColourMap.mock.calls[0][1],
      {r: 255, g: 0, b: 0},
      'colour passed through'
    );
  });

  /**
   * Tests that addSegment does not add a segment with a duplicate number.
   *
   * @function module:tests/image~maskSegmentHelperAddDuplicate
   */
  test('MaskSegmentHelper addSegment ignores duplicate segment number', () => {
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});

    helper.addSegment(makeSeg(1));
    helper.addSegment(makeSeg(1)); // duplicate
    assert.equal(
      helper.getNumberOfSegments(), 1, 'still one segment after duplicate add'
    );

    assert.equal(warnSpy.mock.calls.length, 1, 'warning on addSegment');
    assert.ok(warnSpy.mock.calls[0][0].includes('1'),
      'warning mentions the segment number');
  });

  // -------------------------------------------------------------------------
  // removeSegment
  // -------------------------------------------------------------------------

  /**
   * Tests that removeSegment removes an existing segment.
   *
   * @function module:tests/image~maskSegmentHelperRemove
   */
  test('MaskSegmentHelper removeSegment removes the correct segment', () => {
    helper.addSegment(makeSeg(1));
    helper.addSegment(makeSeg(2));
    helper.removeSegment(1);
    assert.notOk(helper.hasSegment(1), 'segment 1 removed');
    assert.ok(helper.hasSegment(2), 'segment 2 still present');
  });

  /**
   * Tests that removeSegment is a no-op for an unknown segment number.
   *
   * @function module:tests/image~maskSegmentHelperRemoveUnknown
   */
  test('MaskSegmentHelper removeSegment is a no-op for unknown number', () => {
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});

    helper.addSegment(makeSeg(1));
    helper.removeSegment(99); // no-op
    assert.equal(helper.getNumberOfSegments(), 1, 'count unchanged');

    assert.equal(warnSpy.mock.calls.length, 1, 'warning on removeSegment');
    assert.ok(warnSpy.mock.calls[0][0].includes('99'),
      'warning mentions the segment number');
  });

  // -------------------------------------------------------------------------
  // updateSegment
  // -------------------------------------------------------------------------

  /**
   * Tests that updateSegment replaces an existing segment in-place.
   *
   * @function module:tests/image~maskSegmentHelperUpdate
   */
  test('MaskSegmentHelper updateSegment replaces an existing segment', () => {
    const original = makeSeg(1, 'original');
    const updated = makeSeg(1, 'updated');
    helper.addSegment(original);
    helper.updateSegment(updated);
    assert.equal(helper.getSegment(1).label, 'updated', 'label replaced');
  });

  /**
   * Tests that updateSegment is a no-op for an unknown segment number.
   *
   * @function module:tests/image~maskSegmentHelperUpdateUnknown
   */
  test('MaskSegmentHelper updateSegment is a no-op for unknown number', () => {
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});

    helper.addSegment(makeSeg(1));
    helper.updateSegment(makeSeg(99)); // no-op
    assert.equal(helper.getNumberOfSegments(), 1, 'count unchanged');

    assert.equal(warnSpy.mock.calls.length, 1, 'warning on updateSegment');
    assert.ok(warnSpy.mock.calls[0][0].includes('99'),
      'warning mentions the segment number');
  });

  // -------------------------------------------------------------------------
  // maskHasSegments
  // -------------------------------------------------------------------------

  /**
   * Tests that maskHasSegments passes displayValue to hasValues.
   *
   * @function module:tests/image~maskSegmentHelperMaskHasSegmentsDisplay
   */
  test(
    'MaskSegmentHelper maskHasSegments uses displayValue when available',
    () => {
      const mask = makeMockMask();
      mask.hasValues.mockReturnValue([true, false]);
      const h = new MaskSegmentHelper(mask);

      const seg1 = makeSeg(1);
      seg1.displayValue = 10;
      const seg2 = makeSeg(2);
      seg2.displayValue = 20;
      h.addSegment(seg1);
      h.addSegment(seg2);

      const result = h.maskHasSegments([1, 2]);

      assert.deepEqual(
        mask.hasValues.mock.calls[0][0], [10, 20], 'displayValues forwarded'
      );
      assert.deepEqual(result, [true, false], 'result from hasValues');
    }
  );

  /**
   * Tests that maskHasSegments falls back to segment.number when displayValue
   * is absent.
   *
   * @function module:tests/image~maskSegmentHelperMaskHasSegmentsNumber
   */
  test(
    'MaskSegmentHelper maskHasSegments falls back to segment.number',
    () => {
      const mask = makeMockMask();
      mask.hasValues.mockReturnValue([true]);
      const h = new MaskSegmentHelper(mask);
      h.addSegment(makeSeg(5)); // no displayValue

      h.maskHasSegments([5]);

      assert.deepEqual(
        mask.hasValues.mock.calls[0][0], [5], 'number used as fallback'
      );
    }
  );

  /**
   * Tests that maskHasSegments inserts false for unknown segment numbers.
   *
   * @function module:tests/image~maskSegmentHelperMaskHasSegmentsUnknown
   */
  test(
    'MaskSegmentHelper maskHasSegments returns false for unknown segments',
    () => {
      const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
        .mockImplementation(() => {});

      const mask = makeMockMask();
      mask.hasValues.mockReturnValue([true]);
      const h = new MaskSegmentHelper(mask);
      h.addSegment(makeSeg(1));

      // numbers[0]=99 (unknown), numbers[1]=1 (known)
      const result = h.maskHasSegments([99, 1]);

      assert.equal(result[0], false, 'unknown segment → false');
      assert.equal(result[1], true, 'known segment → forwarded from hasValues');

      assert.equal(warnSpy.mock.calls.length, 1, 'warning on maskHasSegments');
      assert.ok(warnSpy.mock.calls[0][0].includes('99'),
        'warning mentions the segment number');
    }
  );

  // -------------------------------------------------------------------------
  // findOverlap
  // -------------------------------------------------------------------------

  /**
   * Tests that findOverlap returns empty when neither mask has labelled voxels.
   *
   * @function module:tests/image~maskSegmentHelperFindOverlapEmpty
   */
  test('MaskSegmentHelper findOverlap returns empty for blank masks', () => {
    const mask1 = makeRealMask(3, 1, [0, 0, 0]);
    const mask2 = makeRealMask(3, 1, [0, 0, 0]);
    const h1 = new MaskSegmentHelper(mask1);
    const h2 = new MaskSegmentHelper(mask2);
    assert.deepEqual(h1.findOverlap(h2), {}, 'empty overlap map');
  });

  /**
   * Tests findOverlap when two masks share the same geometry and identical
   * pixel values — every labelled voxel overlaps 100%.
   *
   * @function module:tests/image~maskSegmentHelperFindOverlapIdentical
   */
  test(
    'MaskSegmentHelper findOverlap: identical masks give 100% overlap',
    () => {
      // mask: [1, 1, 2]  — segment 1 covers 2 voxels, segment 2 covers 1
      const mask1 = makeRealMask(3, 1, [1, 1, 2]);
      const mask2 = makeRealMask(3, 1, [1, 1, 2]);
      const seg1 = makeSeg(1, 'bone');
      const seg2 = makeSeg(2, 'muscle');
      const h1 = new MaskSegmentHelper(mask1);
      const h2 = new MaskSegmentHelper(mask2);
      h1.addSegment(seg1);
      h1.addSegment(seg2);
      h2.addSegment(seg1);
      h2.addSegment(seg2);

      const result = h1.findOverlap(h2);

      assert.equal(result[1].count, 2, 'seg1 total voxel count');
      assert.equal(result[1].label, 'bone', 'seg1 label');
      assert.equal(
        result[1].overlap[1].count, 2, 'seg1 vs seg1 overlap count'
      );
      assert.equal(
        result[1].overlap[1].percentage, 100, 'seg1 vs seg1 percentage'
      );
      assert.equal(
        result[2].overlap[2].percentage, 100, 'seg2 fully overlaps'
      );
    }
  );

  /**
   * Tests findOverlap when the two masks have no overlapping labelled voxels.
   *
   * @function module:tests/image~maskSegmentHelperFindOverlapNone
   */
  test('MaskSegmentHelper findOverlap: non-overlapping masks', () => {
    // mask1: seg 1 at pixel 0; mask2: seg 2 at pixel 1 (no shared voxels)
    const mask1 = makeRealMask(3, 1, [1, 0, 0]);
    const mask2 = makeRealMask(3, 1, [0, 2, 0]);
    const h1 = new MaskSegmentHelper(mask1);
    const h2 = new MaskSegmentHelper(mask2);
    h1.addSegment(makeSeg(1));
    h2.addSegment(makeSeg(2));

    const result = h1.findOverlap(h2);

    assert.equal(result[1].count, 1, 'seg1 voxel count');
    assert.deepEqual(result[1].overlap, {}, 'no overlap entries');
  });

  /**
   * Tests findOverlap with partial overlap between segments.
   *
   * @function module:tests/image~maskSegmentHelperFindOverlapPartial
   */
  test('MaskSegmentHelper findOverlap: partial overlap gives correct %', () => {
    // mask1: seg 1 at pixels 0,1,2 (3 voxels)
    // mask2: seg 2 at pixels 1,2   (overlaps 2 of the 3 voxels)
    const mask1 = makeRealMask(3, 1, [1, 1, 1]);
    const mask2 = makeRealMask(3, 1, [0, 2, 2]);
    const h1 = new MaskSegmentHelper(mask1);
    const h2 = new MaskSegmentHelper(mask2);
    h1.addSegment(makeSeg(1));
    h2.addSegment(makeSeg(2));

    const result = h1.findOverlap(h2);

    assert.equal(result[1].count, 3, 'seg1 total voxels');
    assert.equal(
      result[1].overlap[2].count, 2, 'two voxels overlap with seg2'
    );
    assert.closeTo(
      result[1].overlap[2].percentage,
      66.67,
      0.01,
      'overlap percentage ≈ 66.67%'
    );
  });

  /**
   * Tests for {@link MaskSegmentHelper} findOverlap.
   *
   * @function module:tests/image~maskSegmentHelperFindOverlap
   */
  test('MaskSegmentHelper findOverlap', () => {
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

});
