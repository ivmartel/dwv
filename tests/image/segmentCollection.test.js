import {describe, test, assert} from 'vitest';
import {Geometry} from '../../src/image/geometry.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Point3D} from '../../src/math/point.js';
import {MaskSegment} from '../../src/dicom/dicomSegment.js';
import {SegmentCollection} from '../../src/image/segmentCollection.js';

/**
 * Tests for the 'image/segmentCollection.js' file.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal Geometry: ncols × nrows × nslices, unit spacing.
 *
 * @param {number} ncols Number of columns.
 * @param {number} nrows Number of rows.
 * @param {number} nslices Number of slices.
 * @returns {Geometry} The geometry.
 */
function makeGeometry(ncols, nrows, nslices) {
  const origins = [];
  for (let k = 0; k < nslices; ++k) {
    origins.push(new Point3D(0, 0, k));
  }
  return new Geometry(
    origins,
    new Size([ncols, nrows, nslices]),
    new Spacing([1, 1, 1])
  );
}

/**
 * Build a pixel buffer for one frame: listed offsets set to 1, rest 0.
 *
 * @param {number} sliceSize Total pixels per slice (ncols * nrows).
 * @param {number[]} activeOffsets Local offsets within the slice to set.
 * @returns {Uint8Array} The pixel buffer.
 */
function makePixelBuffer(sliceSize, activeOffsets) {
  const buf = new Uint8Array(sliceSize);
  for (const o of activeOffsets) {
    buf[o] = 1;
  }
  return buf;
}

/**
 * Build a MaskSegment with number and displayValue set.
 *
 * @param {number} number Segment number.
 * @returns {MaskSegment} The segment.
 */
function makeSeg(number) {
  const seg = new MaskSegment(number, `seg-${number}`, 'MANUAL');
  seg.displayValue = number;
  return seg;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SegmentCollection', () => {

  // -------------------------------------------------------------------------
  // getLabelMap — basic construction
  // -------------------------------------------------------------------------

  test(
    'getLabelMap returns a zero-filled buffer when no frames are added',
    () => {
      const geom = makeGeometry(3, 2, 1);
      const collection = new SegmentCollection(geom);
      const labelMap = collection.getLabelMap();
      assert.equal(
        labelMap.length, 6, 'buffer size = ncols * nrows * nslices'
      );
      assert.ok(
        labelMap.every(v => v === 0),
        'all pixels are zero'
      );
    }
  );

  test('getLabelMap writes correct pixels for a single segment', () => {
    // 3×1×1 image; segment 1 covers offset 0 and 2
    const geom = makeGeometry(3, 1, 1);
    const collection = new SegmentCollection(geom);
    collection.addFrame(1, makePixelBuffer(3, [0, 2]), 0, 0, 3, 1);

    const labelMap = collection.getLabelMap();

    assert.equal(labelMap[0], 1, 'offset 0 written');
    assert.equal(labelMap[1], 0, 'offset 1 untouched');
    assert.equal(labelMap[2], 1, 'offset 2 written');
  });

  test('getLabelMap handles multiple segments on different slices', () => {
    // 3×1×2; seg 1 on slice 0 at offset 0, seg 2 on slice 1 at offset 1
    const geom = makeGeometry(3, 1, 2);
    const collection = new SegmentCollection(geom);
    collection.addFrame(1, makePixelBuffer(3, [0]), 0, 0, 3, 1);
    collection.addFrame(2, makePixelBuffer(3, [1]), 0, 1, 3, 2);

    const labelMap = collection.getLabelMap();

    assert.equal(labelMap[0], 1, 'slice 0, offset 0: seg 1');
    assert.equal(labelMap[1], 0, 'slice 0, offset 1: empty');
    assert.equal(labelMap[2], 0, 'slice 0, offset 2: empty');
    assert.equal(labelMap[3], 0, 'slice 1, offset 0: empty');
    assert.equal(labelMap[4], 2, 'slice 1, offset 1: seg 2');
    assert.equal(labelMap[5], 0, 'slice 1, offset 2: empty');
  });

  test(
    'getLabelMap is lazily cached: returns the same object on re-call',
    () => {
      const geom = makeGeometry(2, 2, 1);
      const collection = new SegmentCollection(geom);
      collection.addFrame(1, makePixelBuffer(4, [0]), 0, 0, 4, 1);
      const first = collection.getLabelMap();
      const second = collection.getLabelMap();
      assert.equal(first, second, 'same Uint8Array instance returned');
    }
  );

  // -------------------------------------------------------------------------
  // getLabelMap / getHasOverlap — overlap detection
  // -------------------------------------------------------------------------

  test('getHasOverlap is false when segments share no voxels', () => {
    // seg 1: offset 0 — seg 2: offset 1, same slice
    const geom = makeGeometry(3, 1, 1);
    const collection = new SegmentCollection(geom);
    collection.addFrame(1, makePixelBuffer(3, [0]), 0, 0, 3, 1);
    collection.addFrame(2, makePixelBuffer(3, [1]), 0, 0, 3, 2);

    assert.equal(collection.getHasOverlap(), false, 'no overlap expected');
  });

  test('getHasOverlap is true when two segments share a voxel', () => {
    // both segments cover offset 1 of slice 0
    const geom = makeGeometry(3, 1, 1);
    const collection = new SegmentCollection(geom);
    collection.addFrame(1, makePixelBuffer(3, [0, 1]), 0, 0, 3, 1);
    collection.addFrame(2, makePixelBuffer(3, [1, 2]), 0, 0, 3, 2);

    assert.equal(collection.getHasOverlap(), true, 'overlap at offset 1');
  });

  test(
    'getLabelMap first-wins: lower segment number keeps overlap voxel',
    () => {
      // seg 1 and seg 2 both cover offset 1; seg 1 is added first
      const geom = makeGeometry(3, 1, 1);
      const collection = new SegmentCollection(geom);
      collection.addFrame(1, makePixelBuffer(3, [1]), 0, 0, 3, 1);
      collection.addFrame(2, makePixelBuffer(3, [1]), 0, 0, 3, 2);

      const labelMap = collection.getLabelMap();
      assert.equal(labelMap[1], 1, 'seg 1 wins at overlap voxel');
    }
  );

  test(
    'getHasOverlap works correctly before getLabelMap is called explicitly',
    () => {
      // Regression: flag must be valid even if getLabelMap was never called
      const geom = makeGeometry(2, 1, 1);
      const collection = new SegmentCollection(geom);
      collection.addFrame(1, makePixelBuffer(2, [0, 1]), 0, 0, 2, 1);
      collection.addFrame(2, makePixelBuffer(2, [0]), 0, 0, 2, 2);
      assert.equal(collection.getHasOverlap(), true, 'overlap detected');
    }
  );

  // -------------------------------------------------------------------------
  // setLabelMap — brush path
  // -------------------------------------------------------------------------

  test('setLabelMap stores the buffer and getHasOverlap stays false', () => {
    const geom = makeGeometry(3, 1, 1);
    const collection = new SegmentCollection(geom);
    const buf = new Uint8Array([1, 0, 2]);
    collection.setLabelMap(buf);

    assert.equal(
      collection.getLabelMap(), buf, 'getLabelMap returns set buffer'
    );
    assert.equal(
      collection.getHasOverlap(), false, 'no segments added, no overlap'
    );
  });

  // -------------------------------------------------------------------------
  // addFrame — merge behaviour
  // -------------------------------------------------------------------------

  test(
    'addFrame merges a second frame into the same (segment, slice)',
    () => {
      // Two frames for same segment and slice — pixels should union
      const geom = makeGeometry(4, 1, 1);
      const collection = new SegmentCollection(geom);
      collection.addFrame(1, makePixelBuffer(4, [0, 1]), 0, 0, 4, 1);
      collection.addFrame(1, makePixelBuffer(4, [2, 3]), 0, 0, 4, 1);

      const labelMap = collection.getLabelMap();
      assert.equal(labelMap[0], 1, 'first frame pixel present');
      assert.equal(labelMap[1], 1, 'first frame pixel present');
      assert.equal(labelMap[2], 1, 'second frame pixel merged in');
      assert.equal(labelMap[3], 1, 'second frame pixel merged in');
    }
  );

  // -------------------------------------------------------------------------
  // getSegmentBuffers — MaskFactory path
  // -------------------------------------------------------------------------

  test(
    'getSegmentBuffers (MaskFactory path) preserves overlap pixels per segment',
    () => {
      // seg 1 and 2 share offset 0; label map keeps only seg 1 there,
      // but getSegmentBuffers must return offset 0 for seg 2 as well
      const geom = makeGeometry(3, 1, 1);
      const collection = new SegmentCollection(geom);
      collection.addFrame(1, makePixelBuffer(3, [0, 1]), 0, 0, 3, 1);
      collection.addFrame(2, makePixelBuffer(3, [0, 2]), 0, 0, 3, 2);

      const segs = [makeSeg(1), makeSeg(2)];
      const roiBuffers = collection.getSegmentBuffers(segs);

      // segmentIndex = segment.number - 1
      assert.ok(
        roiBuffers[0][0][0] === 1, 'seg 1 slice 0 offset 0 present'
      );
      assert.ok(
        roiBuffers[1][0][0] === 1,
        'seg 2 slice 0 offset 0 also present (overlap voxel)'
      );
      assert.ok(
        roiBuffers[1][0][2] === 1, 'seg 2 slice 0 offset 2 present'
      );
    }
  );

  // -------------------------------------------------------------------------
  // getSegmentBuffers — brush path (no per-segment data)
  // -------------------------------------------------------------------------

  test('getSegmentBuffers (brush path) reconstructs from label map', () => {
    const geom = makeGeometry(3, 1, 1);
    const collection = new SegmentCollection(geom);
    // Brush path: only a pre-built label map, no addFrame calls
    collection.setLabelMap(new Uint8Array([1, 0, 2]));

    const segs = [makeSeg(1), makeSeg(2)];
    const roiBuffers = collection.getSegmentBuffers(segs);

    assert.equal(roiBuffers[0][0][0], 1, 'seg 1 at offset 0');
    assert.equal(roiBuffers[0][0][1], 0, 'seg 1 absent at offset 1');
    assert.equal(roiBuffers[1][0][2], 1, 'seg 2 at offset 2');
  });

  // -------------------------------------------------------------------------
  // getOrBuildUnionContour — caching
  // -------------------------------------------------------------------------

  test(
    'getOrBuildUnionContour returns same object when visibility is unchanged',
    () => {
      const geom = makeGeometry(3, 1, 1);
      const collection = new SegmentCollection(geom);
      collection.addFrame(1, makePixelBuffer(3, [0, 1]), 0, 0, 3, 1);

      const size = geom.getSize();
      const c1 = collection.getOrBuildUnionContour(undefined, size);
      const c2 = collection.getOrBuildUnionContour(undefined, size);
      assert.equal(c1, c2, 'same ImageContour instance returned from cache');
    }
  );

  test(
    'getOrBuildUnionContour rebuilds when hidden-segment set changes',
    () => {
      const geom = makeGeometry(3, 1, 1);
      const collection = new SegmentCollection(geom);
      collection.addFrame(1, makePixelBuffer(3, [0]), 0, 0, 3, 1);
      collection.addFrame(2, makePixelBuffer(3, [1]), 0, 0, 3, 2);

      const size = geom.getSize();

      // First call: nothing hidden
      const c1 = collection.getOrBuildUnionContour(undefined, size);

      // Second call: hide seg 1 — different visibility key → rebuild
      const helper = {isHidden: (n) => n === 1};
      const c2 = collection.getOrBuildUnionContour(helper, size);

      assert.notEqual(
        c1, c2, 'different contour built after hiding a segment'
      );

      // Third call: same visibility key as c2 → cache hit
      const c3 = collection.getOrBuildUnionContour(helper, size);
      assert.equal(
        c2, c3, 'cached contour reused when visibility unchanged'
      );
    }
  );

});
