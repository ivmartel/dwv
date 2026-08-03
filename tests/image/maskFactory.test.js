import {describe, test, assert, vi, afterEach} from 'vitest';
import {
  getElementsFromSimpleTagValues
} from '../../src/dicom/simpleTagValues.js';
import {getReferencedSeriesUID} from '../../src/dicom/dicomImage.js';
import {getSegment} from '../../src/dicom/dicomSegment.js';
import {safeGetAll} from '../../src/dicom/dataElement.js';
import {MaskFactory, mergeMaskImages} from '../../src/image/maskFactory.js';
import {Image} from '../../src/image/image.js';
import {SegmentCollection} from '../../src/image/segmentCollection.js';
import {Geometry} from '../../src/image/geometry.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Point3D} from '../../src/math/point.js';
import * as loggerModule from '../../src/utils/logger.js';

import syntheticData from '/tests/data/synthetic-data.json';

/**
 * Tests for the 'image/maskFactory.js' file.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal reference Image matching test-00 geometry.
 *
 * @returns {Image} The reference image.
 */
function buildRefImage() {
  const config = syntheticData.find(c => c.name === 'test-00');
  const tags = config.tags;
  const geo = new Geometry(
    [new Point3D(0, 0, 0)],
    new Size([tags.Columns, tags.Rows, 1]),
    new Spacing([1, 1, 1])
  );
  const buffer = new Uint16Array(tags.Columns * tags.Rows);
  const image = new Image(geo, buffer, [tags.SOPInstanceUID]);
  image.setMeta({
    SeriesInstanceUID: tags.SeriesInstanceUID,
    StudyInstanceUID: tags.StudyInstanceUID,
    SOPClassUID: tags.SOPClassUID
  });
  return image;
}

/**
 * Parse synthetic SEG config tags into DICOM data elements.
 *
 * @param {object} config A synthetic-data entry.
 * @returns {Record<string, object>} DICOM data elements.
 */
function configToElements(config) {
  return getElementsFromSimpleTagValues(structuredClone(config.tags));
}

/**
 * Build a binary pixel buffer encoding the per-segment squares
 * defined in config.segmentSquares.
 *
 * @param {object} config A synthetic-data SEG entry with segmentSquares.
 * @returns {Uint8Array} Flat pixel buffer (rows × cols × nFrames).
 */
function buildPixelBuffer(config) {
  const tags = config.tags;
  const width = tags.Columns;
  const height = tags.Rows;
  const nFrames = tags.NumberOfFrames;
  const buffer = new Uint8Array(width * height * nFrames);
  const perFrameSeq = tags.PerFrameFunctionalGroupsSequence.value;
  for (let f = 0; f < nFrames; ++f) {
    const segNum =
      perFrameSeq[f].SegmentIdentificationSequence.value[0]
        .ReferencedSegmentNumber;
    const sq = config.segmentSquares[String(segNum)];
    if (sq) {
      for (let j = sq.minJ; j < sq.maxJ; ++j) {
        for (let i = sq.minI; i < sq.maxI; ++i) {
          buffer[f * width * height + j * width + i] = 1;
        }
      }
    }
  }
  return buffer;
}

/**
 * Extract the segment array from DICOM data elements.
 *
 * @param {Record<string, object>} elements DICOM data elements.
 * @returns {Array} Array of MaskSegment objects.
 */
function getSegmentsFromElements(elements) {
  const segSeq = safeGetAll(elements, '00620002');
  return segSeq ? segSeq.map(item => getSegment(item)) : [];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MaskFactory', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Non-overlapping squares — test-11
  // Square 1: col=4..10, row=4..10 | Square 2: col=12..18, row=12..18
  // -------------------------------------------------------------------------

  test('create: non-overlapping squares, no overlap flag', () => {
    const config = syntheticData.find(c => c.name === 'test-11');
    const factory = new MaskFactory();
    const image = factory.create(
      configToElements(config), buildPixelBuffer(config), buildRefImage()
    );

    const meta = image.getMeta();
    const segments = meta.custom.segments;
    assert.equal(segments.length, 2, 'two segments created');
    assert.equal(segments[0].label, 'Square1', 'segment 1 name');
    assert.equal(segments[1].label, 'Square2', 'segment 2 name');
    assert.equal(image.getHasOverlap(), false, 'no overlap detected');
    const refConfig = syntheticData.find(c => c.name === 'test-00');
    assert.equal(
      image.getMaskReferencedSeriesUID(),
      refConfig.tags.SeriesInstanceUID,
      'referencedSeriesUID matches test-00'
    );
  });

  test('create: non-overlapping squares pixel values in label map', () => {
    const config = syntheticData.find(c => c.name === 'test-11');
    const factory = new MaskFactory();
    const image = factory.create(
      configToElements(config), buildPixelBuffer(config), buildRefImage()
    );

    const buf = image.getBuffer();
    const width = 32;
    // square 1 center at (col=7, row=7)
    assert.equal(buf[7 * width + 7], 1, 'square 1 center is segment 1');
    // square 2 center at (col=15, row=15)
    assert.equal(buf[15 * width + 15], 2, 'square 2 center is segment 2');
    // gap between the two squares
    assert.equal(buf[11 * width + 11], 0, 'gap between squares is background');
  });

  test('create: non-overlapping squares segment collection', () => {
    const config = syntheticData.find(c => c.name === 'test-11');
    const factory = new MaskFactory();
    const image = factory.create(
      configToElements(config), buildPixelBuffer(config), buildRefImage()
    );

    const collection = image.getSegmentCollection();
    assert.ok(collection !== undefined, 'segment collection exists');

    const all = collection.getAll();
    assert.equal(all.size, 2, 'two per-segment entries');

    const width = 32;
    const seg1 = all.get(1)?.get(0);
    const seg2 = all.get(2)?.get(0);
    assert.ok(seg1 !== undefined, 'segment 1 slice 0 present');
    assert.ok(seg2 !== undefined, 'segment 2 slice 0 present');

    // segment 1 covers col=4..10, row=4..10
    assert.equal(seg1[7 * width + 7], 1, 'seg 1 buf: center pixel = 1');
    assert.equal(seg1[15 * width + 15], 0, 'seg 1 buf: sq 2 pixel = 0');

    // segment 2 covers col=12..18, row=12..18
    assert.equal(seg2[15 * width + 15], 2, 'seg 2 buf: center pixel = 2');
    assert.equal(seg2[7 * width + 7], 0, 'seg 2 buf: sq 1 pixel = 0');
  });

  test('toDicom: non-overlapping squares round-trip', () => {
    const config = syntheticData.find(c => c.name === 'test-11');
    const factory = new MaskFactory();
    const refImage = buildRefImage();
    const image = factory.create(
      configToElements(config), buildPixelBuffer(config), refImage
    );
    const segments = image.getMeta().custom.segments;
    const outElements = factory.toDicom(image, segments, refImage);

    const refConfig = syntheticData.find(c => c.name === 'test-00');
    assert.equal(
      getReferencedSeriesUID(outElements),
      refConfig.tags.SeriesInstanceUID,
      'output referencedSeriesUID matches test-00'
    );

    const inSegs = getSegmentsFromElements(configToElements(config));
    const outSegs = getSegmentsFromElements(outElements);

    assert.equal(outSegs.length, inSegs.length, 'same segment count');
    for (let i = 0; i < inSegs.length; i++) {
      assert.equal(outSegs[i].label, inSegs[i].label, `seg ${i + 1} label`);
      assert.equal(
        outSegs[i].displayRGBValue.r,
        inSegs[i].displayRGBValue.r,
        `seg ${i + 1} red`
      );
      assert.equal(
        outSegs[i].displayRGBValue.g,
        inSegs[i].displayRGBValue.g,
        `seg ${i + 1} green`
      );
      assert.equal(
        outSegs[i].displayRGBValue.b,
        inSegs[i].displayRGBValue.b,
        `seg ${i + 1} blue`
      );
    }
  });

  // -------------------------------------------------------------------------
  // Overlapping squares — test-12
  // Square 1: col=4..10, row=4..10 | Square 2: col=8..14, row=8..14
  // -------------------------------------------------------------------------

  test('create: overlapping squares, overlap flag detected', () => {
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});

    const config = syntheticData.find(c => c.name === 'test-12');
    const factory = new MaskFactory();
    const image = factory.create(
      configToElements(config), buildPixelBuffer(config), buildRefImage()
    );

    assert.ok(
      warnSpy.mock.calls.some(
        ([msg]) => msg === 'SegmentCollection: detected overlapping segments'
      ),
      'overlap warning logged during create'
    );

    const meta = image.getMeta();
    const segments = meta.custom.segments;
    assert.equal(segments.length, 2, 'two segments created');
    assert.equal(segments[0].label, 'Square1', 'segment 1 name');
    assert.equal(segments[1].label, 'Square2', 'segment 2 name');
    assert.equal(image.getHasOverlap(), true, 'overlap detected');
    const refConfig = syntheticData.find(c => c.name === 'test-00');
    assert.equal(
      image.getMaskReferencedSeriesUID(),
      refConfig.tags.SeriesInstanceUID,
      'referencedSeriesUID matches test-00'
    );
  });

  test('create: overlapping squares pixel values in label map', () => {
    // hide logging
    vi.spyOn(loggerModule.logger, 'warn').mockImplementation(() => {});

    const config = syntheticData.find(c => c.name === 'test-12');
    const factory = new MaskFactory();
    const image = factory.create(
      configToElements(config), buildPixelBuffer(config), buildRefImage()
    );

    const buf = image.getBuffer();
    const width = 32;
    // square 1 exclusive area center at (col=6, row=6)
    assert.equal(buf[6 * width + 6], 1, 'sq 1 exclusive area is seg 1');
    // square 2 exclusive area center at (col=12, row=12)
    assert.equal(buf[12 * width + 12], 2, 'sq 2 exclusive area is seg 2');
    // overlap center at (col=9, row=9); seg 1 wins
    assert.equal(buf[9 * width + 9], 1, 'overlap pixel retains first segment');
  });

  test('create: overlapping squares segment collection', () => {
    // hide logging
    vi.spyOn(loggerModule.logger, 'warn').mockImplementation(() => {});

    const config = syntheticData.find(c => c.name === 'test-12');
    const factory = new MaskFactory();
    const image = factory.create(
      configToElements(config), buildPixelBuffer(config), buildRefImage()
    );

    const collection = image.getSegmentCollection();
    assert.ok(collection !== undefined, 'segment collection exists');

    const all = collection.getAll();
    assert.equal(all.size, 2, 'two per-segment entries');

    const width = 32;
    const seg1 = all.get(1)?.get(0);
    const seg2 = all.get(2)?.get(0);
    assert.ok(seg1 !== undefined, 'segment 1 slice 0 present');
    assert.ok(seg2 !== undefined, 'segment 2 slice 0 present');

    // segment 1 covers col=4..10, row=4..10
    assert.equal(seg1[6 * width + 6], 1, 'seg 1 buf: exclusive pixel = 1');
    // segment 2 covers col=8..14, row=8..14
    assert.equal(seg2[12 * width + 12], 2, 'seg 2 buf: exclusive pixel = 2');

    // overlap zone at (col=9, row=9)
    assert.equal(seg1[9 * width + 9], 1, 'seg 1 buf: overlap pixel = 1');
    assert.equal(seg2[9 * width + 9], 2, 'seg 2 buf: overlap pixel = 2');
    // label map: first segment wins
    assert.equal(
      image.getBuffer()[9 * width + 9], 1,
      'label map: overlap pixel = 1 (first wins)'
    );
  });

  test('toDicom: overlapping squares round-trip', () => {
    // hide logging
    vi.spyOn(loggerModule.logger, 'warn').mockImplementation(() => {});

    const config = syntheticData.find(c => c.name === 'test-12');
    const factory = new MaskFactory();
    const refImage = buildRefImage();
    const image = factory.create(
      configToElements(config), buildPixelBuffer(config), refImage
    );
    const segments = image.getMeta().custom.segments;
    const outElements = factory.toDicom(image, segments, refImage);

    const refConfig = syntheticData.find(c => c.name === 'test-00');
    assert.equal(
      getReferencedSeriesUID(outElements),
      refConfig.tags.SeriesInstanceUID,
      'output referencedSeriesUID matches test-00'
    );

    const inSegs = getSegmentsFromElements(configToElements(config));
    const outSegs = getSegmentsFromElements(outElements);

    assert.equal(outSegs.length, inSegs.length, 'same segment count');
    for (let i = 0; i < inSegs.length; i++) {
      assert.equal(outSegs[i].label, inSegs[i].label, `seg ${i + 1} label`);
      assert.equal(
        outSegs[i].displayRGBValue.r,
        inSegs[i].displayRGBValue.r,
        `seg ${i + 1} red`
      );
      assert.equal(
        outSegs[i].displayRGBValue.g,
        inSegs[i].displayRGBValue.g,
        `seg ${i + 1} green`
      );
      assert.equal(
        outSegs[i].displayRGBValue.b,
        inSegs[i].displayRGBValue.b,
        `seg ${i + 1} blue`
      );
    }
  });

});

// ---------------------------------------------------------------------------
// mergeMaskImages tests
// ---------------------------------------------------------------------------

/**
 * Build a minimal single-segment mask using the test-00 geometry.
 *
 * @param {number} segNumber The segment number.
 * @param {string} label The segment label.
 * @param {number} pixelStart First pixel index to mark as foreground.
 * @param {number} pixelCount Number of contiguous foreground pixels.
 * @returns {Image} The mask image.
 */
function buildSingleSegmentMask(segNumber, label, pixelStart, pixelCount) {
  const config = syntheticData.find(c => c.name === 'test-00');
  const tags = config.tags;
  const geometry = new Geometry(
    [new Point3D(0, 0, 0)],
    new Size([tags.Columns, tags.Rows, 1]),
    new Spacing([1, 1, 1])
  );
  const sliceSize = tags.Columns * tags.Rows;
  const sliceBuf = new Uint8Array(sliceSize);
  for (let p = pixelStart; p < pixelStart + pixelCount; ++p) {
    sliceBuf[p] = 1;
  }
  const collection = new SegmentCollection(geometry);
  collection.addFrame(segNumber, sliceBuf, 0, 0, sliceSize, segNumber);
  const labelMap = collection.getLabelMap();
  const image = new Image(geometry, labelMap, [`uid-${segNumber}`]);
  image.setSegmentCollection(collection);
  const segment = {number: segNumber, label};
  image.setMeta({
    Modality: 'SEG',
    custom: {
      segments: [segment],
      referencedSeriesUID: tags.SeriesInstanceUID,
    }
  });
  return image;
}

describe('mergeMaskImages', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('merge: segments from both masks appear in merged metadata', () => {
    const mask1 = buildSingleSegmentMask(1, 'Seg1', 0, 16);
    const mask2 = buildSingleSegmentMask(2, 'Seg2', 100, 16);
    const merged = mergeMaskImages(mask1, mask2);
    const segments = merged.getMeta().custom.segments;
    assert.equal(segments.length, 2, 'merged has 2 segments');
    assert.equal(segments[0].number, 1, 'first segment number');
    assert.equal(segments[0].label, 'Seg1', 'first segment label');
    assert.equal(segments[1].number, 2, 'second segment number');
    assert.equal(segments[1].label, 'Seg2', 'second segment label');
  });

  test('merge: pixel data from both masks present in label map', () => {
    const mask1 = buildSingleSegmentMask(1, 'Seg1', 0, 16);
    const mask2 = buildSingleSegmentMask(2, 'Seg2', 100, 16);
    const merged = mergeMaskImages(mask1, mask2);
    const buf = merged.getBuffer();
    assert.equal(buf[0], 1, 'mask1 pixel region has value 1');
    assert.equal(buf[100], 2, 'mask2 pixel region has value 2');
    assert.equal(buf[50], 0, 'gap between regions is background');
  });

  test('merge: conflicting segment number in mask2 is remapped', () => {
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});
    const mask1 = buildSingleSegmentMask(1, 'Seg1', 0, 16);
    const mask2 = buildSingleSegmentMask(1, 'Seg1b', 100, 16);
    const merged = mergeMaskImages(mask1, mask2);
    const segments = merged.getMeta().custom.segments;
    assert.equal(segments.length, 2, 'merged has 2 segments');
    assert.equal(segments[0].number, 1, 'mask1 segment keeps number 1');
    assert.equal(segments[1].number, 2, 'mask2 segment remapped to 2');
    const buf = merged.getBuffer();
    assert.equal(buf[0], 1, 'mask1 pixels keep value 1');
    assert.equal(buf[100], 2, 'mask2 pixels use new value 2');
    assert.equal(warnSpy.mock.calls.length, 1, 'remap warning logged once');
    assert.equal(
      warnSpy.mock.calls[0][0],
      'mergeMaskImages: segment number conflict, remapping 1 to 2'
    );
  });

  test('merge: segment collection contains both segments', () => {
    const mask1 = buildSingleSegmentMask(1, 'Seg1', 0, 16);
    const mask2 = buildSingleSegmentMask(2, 'Seg2', 100, 16);
    const merged = mergeMaskImages(mask1, mask2);
    const all = merged.getSegmentCollection().getAll();
    assert.ok(all.has(1), 'collection has segment 1');
    assert.ok(all.has(2), 'collection has segment 2');
  });

  test('merge round-trip via toDicom: NumberOfFrames matches combined input',
    () => {
      const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
        .mockImplementation(() => {});
      const config = syntheticData.find(c => c.name === 'test-11');
      const factory = new MaskFactory();
      const mask1 = factory.create(
        configToElements(config), buildPixelBuffer(config), buildRefImage()
      );
      const mask2 = factory.create(
        configToElements(config), buildPixelBuffer(config), buildRefImage()
      );
      const merged = mergeMaskImages(mask1, mask2);
      const mergedSegments = merged.getMeta().custom.segments;
      const outElements =
        factory.toDicom(merged, mergedSegments, buildRefImage());
      const nFrames =
        parseInt(outElements['00280008'].value[0], 10);
      assert.equal(
        nFrames,
        parseInt(config.tags.NumberOfFrames, 10) * 2,
        'merged NumberOfFrames equals 2 × input frames'
      );
      // mask2 has the same segment numbers as mask1 and occupies the same
      // physical space, so both the remap and the overlap detection warn
      const warnMsgs = warnSpy.mock.calls.map(([msg]) => msg);
      assert.ok(
        warnMsgs.includes(
          'mergeMaskImages: segment number conflict, remapping 1 to 3'
        ),
        'segment 1 remap warning logged'
      );
      assert.ok(
        warnMsgs.includes(
          'mergeMaskImages: segment number conflict, remapping 2 to 4'
        ),
        'segment 2 remap warning logged'
      );
      assert.ok(
        warnMsgs.includes('SegmentCollection: detected overlapping segments'),
        'overlap warning logged for co-located remapped segments'
      );
    }
  );

  test('merge: brush mask (no #segments) as mask2 pixel data is preserved',
    () => {
      const config = syntheticData.find(c => c.name === 'test-00');
      const tags = config.tags;
      const sliceSize = tags.Columns * tags.Rows;
      const brushBuf = new Uint8Array(sliceSize);
      for (let p = 100; p < 116; ++p) {
        brushBuf[p] = 2;
      }
      const brushGeometry = new Geometry(
        [new Point3D(0, 0, 0)],
        new Size([tags.Columns, tags.Rows, 1]),
        new Spacing([1, 1, 1])
      );
      const brushMask = new Image(brushGeometry, brushBuf, ['uid-brush']);
      brushMask.setupSegmentCollection();
      brushMask.setMeta({Modality: 'SEG', custom: {}});
      const mask1 = buildSingleSegmentMask(1, 'Seg1', 0, 16);
      const merged = mergeMaskImages(mask1, brushMask);
      const buf = merged.getBuffer();
      assert.equal(buf[0], 1, 'DICOM mask pixels present');
      assert.equal(buf[100], 2, 'brush mask pixels present');
      assert.equal(buf[50], 0, 'gap is background');
    }
  );

  test('merge: brush mask (no #segments) as mask1 pixel data is preserved',
    () => {
      const config = syntheticData.find(c => c.name === 'test-00');
      const tags = config.tags;
      const sliceSize = tags.Columns * tags.Rows;
      const brushBuf = new Uint8Array(sliceSize);
      for (let p = 0; p < 16; ++p) {
        brushBuf[p] = 1;
      }
      const brushGeometry = new Geometry(
        [new Point3D(0, 0, 0)],
        new Size([tags.Columns, tags.Rows, 1]),
        new Spacing([1, 1, 1])
      );
      const brushMask = new Image(brushGeometry, brushBuf, ['uid-brush']);
      brushMask.setupSegmentCollection();
      brushMask.setMeta({Modality: 'SEG', custom: {}});
      const mask2 = buildSingleSegmentMask(2, 'Seg2', 100, 16);
      const merged = mergeMaskImages(brushMask, mask2);
      const buf = merged.getBuffer();
      assert.equal(buf[0], 1, 'brush mask pixels present');
      assert.equal(buf[100], 2, 'DICOM mask pixels present');
    }
  );

  test('merge: mask2 local slice index is remapped to mask1 slice position',
    () => {
      const config = syntheticData.find(c => c.name === 'test-00');
      const tags = config.tags;
      const sliceSize = tags.Columns * tags.Rows;

      // mask1: 3 slices (z=0,1,2), segment 1 only on the slice at z=1
      const geometry1 = new Geometry(
        [new Point3D(0, 0, 0), new Point3D(0, 0, 1), new Point3D(0, 0, 2)],
        new Size([tags.Columns, tags.Rows, 3]),
        new Spacing([1, 1, 1])
      );
      const collection1 = new SegmentCollection(geometry1);
      const sliceBuf1 = new Uint8Array(sliceSize);
      sliceBuf1[0] = 1;
      collection1.addFrame(1, sliceBuf1, 0, 1, sliceSize, 1);
      const mask1 = new Image(
        geometry1, collection1.getLabelMap(), ['uid-1a', 'uid-1b', 'uid-1c']);
      mask1.setSegmentCollection(collection1);
      mask1.setMeta({
        Modality: 'SEG',
        custom: {segments: [{number: 1, label: 'Seg1'}]}
      });

      // mask2: single-slice mask whose only slice sits at z=1 (mask1's
      // 2nd slice) but whose own local slice index is 0, not 1: local and
      // mask1-relative slice indices intentionally disagree
      const geometry2 = new Geometry(
        [new Point3D(0, 0, 1)],
        new Size([tags.Columns, tags.Rows, 1]),
        new Spacing([1, 1, 1])
      );
      const collection2 = new SegmentCollection(geometry2);
      const sliceBuf2 = new Uint8Array(sliceSize);
      sliceBuf2[100] = 1;
      collection2.addFrame(2, sliceBuf2, 0, 0, sliceSize, 2);
      const mask2 = new Image(
        geometry2, collection2.getLabelMap(), ['uid-2']);
      mask2.setSegmentCollection(collection2);
      mask2.setMeta({
        Modality: 'SEG',
        custom: {segments: [{number: 2, label: 'Seg2'}]}
      });

      const merged = mergeMaskImages(mask1, mask2);
      const buf = merged.getBuffer();
      assert.equal(
        buf[sliceSize + 0], 1, 'mask1 pixel stays on its own slice (z=1)');
      assert.equal(
        buf[sliceSize + 100], 2,
        'mask2 pixel is remapped to matching mask1 slice (z=1)');
      assert.equal(
        buf[100], 0,
        'mask2 pixel must not leak into mask1 slice 0 (z=0)');
    }
  );

  test('merge: wider mask2 geometry is used as merged geometry, ' +
    'mask1 not clipped',
  () => {
    const config = syntheticData.find(c => c.name === 'test-00');
    const tags = config.tags;
    const sliceSize = tags.Columns * tags.Rows;

    // mask1: single slice at z=1 only
    const geometry1 = new Geometry(
      [new Point3D(0, 0, 1)],
      new Size([tags.Columns, tags.Rows, 1]),
      new Spacing([1, 1, 1])
    );
    const collection1 = new SegmentCollection(geometry1);
    const sliceBuf1 = new Uint8Array(sliceSize);
    sliceBuf1[0] = 1;
    collection1.addFrame(1, sliceBuf1, 0, 0, sliceSize, 1);
    const mask1 = new Image(
      geometry1, collection1.getLabelMap(), ['uid-1']);
    mask1.setSegmentCollection(collection1);
    mask1.setMeta({
      Modality: 'SEG',
      custom: {segments: [{number: 1, label: 'Seg1'}]}
    });

    // mask2: wider than mask1, 3 slices (z=0,1,2), segment 2 on every slice
    const geometry2 = new Geometry(
      [new Point3D(0, 0, 0), new Point3D(0, 0, 1), new Point3D(0, 0, 2)],
      new Size([tags.Columns, tags.Rows, 3]),
      new Spacing([1, 1, 1])
    );
    const collection2 = new SegmentCollection(geometry2);
    const sliceBuf2a = new Uint8Array(sliceSize);
    sliceBuf2a[50] = 1;
    collection2.addFrame(2, sliceBuf2a, 0, 0, sliceSize, 2);
    const sliceBuf2b = new Uint8Array(sliceSize);
    sliceBuf2b[100] = 1;
    collection2.addFrame(2, sliceBuf2b, 0, 1, sliceSize, 2);
    const sliceBuf2c = new Uint8Array(sliceSize);
    sliceBuf2c[150] = 1;
    collection2.addFrame(2, sliceBuf2c, 0, 2, sliceSize, 2);
    const mask2 = new Image(
      geometry2, collection2.getLabelMap(), ['uid-2a', 'uid-2b', 'uid-2c']);
    mask2.setSegmentCollection(collection2);
    mask2.setMeta({
      Modality: 'SEG',
      custom: {segments: [{number: 2, label: 'Seg2'}]}
    });

    const merged = mergeMaskImages(mask1, mask2);
    assert.equal(
      merged.getGeometry().getSize().get(2), 3,
      'merged geometry keeps mask2 full slice range (not clipped to mask1)');
    const buf = merged.getBuffer();
    assert.equal(buf[50], 2, 'mask2 pixel present on slice 0 (z=0)');
    assert.equal(
      buf[sliceSize + 0], 1, 'mask1 pixel correctly placed on slice 1 (z=1)');
    assert.equal(
      buf[sliceSize + 100], 2, 'mask2 pixel present on slice 1 (z=1)');
    assert.equal(
      buf[2 * sliceSize + 150], 2, 'mask2 pixel present on slice 2 (z=2)');
  }
  );

});
