import {describe, test, assert, vi, afterEach} from 'vitest';
import {getRTStructFromElements} from '../../src/dicom/dicomRTStruct.js';
import {
  getReferencedSeriesUIDFromRTStruct
} from '../../src/dicom/dicomImage.js';
import {safeGet, safeGetAll} from '../../src/dicom/dataElement.js';
import {getDwvVersion} from '../../src/dicom/dicomParser.js';
import {RtStructFactory} from '../../src/image/rtStructFactory.js';
import {Image} from '../../src/image/image.js';
import {MaskImage} from '../../src/image/maskImage.js';
import {MaskSegment} from '../../src/dicom/dicomSegment.js';
import {Geometry} from '../../src/image/geometry.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Point3D} from '../../src/math/point.js';
import * as loggerModule from '../../src/utils/logger.js';

import {
  getStructureElementsList,
  singleSliceStructure
} from '../../dev/dicom/dataStructures.js';

import syntheticImgData from '/tests/data/synthetic-img.json';
import syntheticRtssData from '/tests/data/synthetic-rtss.json';

// test-img-00 (img) is used throughout as a reference image, alongside
// the RTSTRUCT entries under test.
const syntheticData = [...syntheticImgData, ...syntheticRtssData];

/**
 * Tests for the 'image/rtStructFactory.js' file.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal reference Image matching test-img-00 geometry:
 * 32×32×1, unit spacing, identity orientation, origin at (0,0,0).
 *
 * @returns {Image} The reference image.
 */
function buildRefImage() {
  const config = syntheticData.find(c => c.name === 'test-img-00');
  const tags = config.tags;
  const geo = new Geometry(
    [new Point3D(0, 0, 0)],
    new Size([tags.Columns, tags.Rows, 1]),
    new Spacing([1, 1, 1])
  );
  const buffer = new Uint16Array(tags.Columns * tags.Rows);
  const image = new Image(geo, buffer, [tags.SOPInstanceUID]);
  image.setMeta({SeriesInstanceUID: tags.SeriesInstanceUID});
  return image;
}

/**
 * Generate the DICOM data elements of a synthetic config the way the
 * synthetic data page does (explicit VR little endian, single slice,
 * with the default patient, instance ids and date tags).
 *
 * @param {object} config A synthetic-data entry.
 * @returns {Record<string, object>} DICOM data elements.
 */
function configToElements(config) {
  return getStructureElementsList(
    config, '1.2.840.10008.1.2.1', singleSliceStructure)[0];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RtStructFactory', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Non-overlapping squares — test-rtss-00
  // Square 1: col=4..10, row=4..10 | Square 2: col=12..18, row=12..18
  // -------------------------------------------------------------------------

  test('create: non-overlapping squares, no overlap flag', () => {
    const config = syntheticData.find(c => c.name === 'test-rtss-00');
    const factory = new RtStructFactory();
    const image = factory.create(configToElements(config), buildRefImage());

    const meta = image.getMeta();
    const segments = meta.custom.segments;
    assert.equal(segments.length, 2, 'two segments created');
    assert.equal(segments[0].label, 'Square1', 'segment 1 name');
    assert.equal(segments[1].label, 'Square2', 'segment 2 name');
    assert.equal(image.getHasOverlap(), false, 'no overlap detected');
    const refConfig = syntheticData.find(c => c.name === 'test-img-00');
    assert.equal(
      image.getMaskReferencedSeriesUID(),
      refConfig.tags.SeriesInstanceUID,
      'referencedSeriesUID matches test-img-00'
    );
  });

  test('create: frame of reference UID', () => {
    const config = syntheticData.find(c => c.name === 'test-rtss-00');
    const forUid = config.tags.FrameOfReferenceUID;
    const factory = new RtStructFactory();

    // root Frame of Reference module
    const image0 = factory.create(configToElements(config), buildRefImage());
    assert.equal(image0.getMeta().FrameOfReferenceUID, forUid,
      'frame of reference UID from root');

    // no Frame of Reference module (optional in RT Structure Set IOD):
    // use ReferencedFrameOfReferenceSequence
    const tags1 = structuredClone(config.tags);
    delete tags1.FrameOfReferenceUID;
    const image1 = factory.create(
      configToElements({tags: tags1}), buildRefImage());
    assert.equal(image1.getMeta().FrameOfReferenceUID, forUid,
      'frame of reference UID from referenced sequence');

    // none
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});
    const tags2 = structuredClone(tags1);
    delete tags2.ReferencedFrameOfReferenceSequence.value[0]
      .FrameOfReferenceUID;
    const image2 = factory.create(
      configToElements({tags: tags2}), buildRefImage());
    assert.isUndefined(image2.getMeta().FrameOfReferenceUID,
      'no frame of reference UID');
    assert.ok(
      warnSpy.mock.calls.some(
        ([msg]) => msg === 'Loaded RT STRUCT has no FrameOfReferenceUID.'
      ),
      'no frame of reference UID warning logged'
    );
  });

  test(
    'create: non-overlapping squares pixel values in label map - ' +
    '#DWV-REQ-IO-06-002 Load DICOM RTSTRUCT',
    () => {
      const config = syntheticData.find(c => c.name === 'test-rtss-00');
      const factory = new RtStructFactory();
      const image = factory.create(configToElements(config), buildRefImage());

      const buf = image.getBuffer();
      const width = 32;
      // square 1 center at (col=7, row=7) → offset 7*32+7 = 231
      assert.equal(buf[7 * width + 7], 1, 'square 1 center is segment 1');
      // square 2 center at (col=15, row=15) → offset 15*32+15 = 495
      assert.equal(buf[15 * width + 15], 2, 'square 2 center is segment 2');
      // gap between the two squares
      assert.equal(buf[11 * width + 11], 0,
        'gap between squares is background');
    });

  test(
    'create: non-overlapping squares segment collection - ' +
    '#DWV-REQ-IO-06-002 Load DICOM RTSTRUCT',
    () => {
      const config = syntheticData.find(c => c.name === 'test-rtss-00');
      const factory = new RtStructFactory();
      const image = factory.create(configToElements(config), buildRefImage());

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

  test(
    'toDicom: non-overlapping squares round-trip - ' +
    '#DWV-REQ-IO-05-004 Write DICOM RTSTRUCT',
    () => {
      const config = syntheticData.find(c => c.name === 'test-rtss-00');
      const factory = new RtStructFactory();
      const refImage = buildRefImage();
      const image = factory.create(configToElements(config), refImage);
      const outElements = factory.toDicom(image, undefined, refImage);

      const refConfig = syntheticData.find(c => c.name === 'test-img-00');
      assert.equal(
        getReferencedSeriesUIDFromRTStruct(outElements),
        refConfig.tags.SeriesInstanceUID,
        'output referencedSeriesUID matches test-img-00'
      );

      const inRois = getRTStructFromElements(configToElements(config));
      const outRois = getRTStructFromElements(outElements);

      assert.equal(outRois.length, inRois.length, 'same ROI count');
      for (let i = 0; i < inRois.length; i++) {
        assert.equal(outRois[i].name, inRois[i].name, `ROI ${i + 1} name`);
        assert.equal(
          outRois[i].colour.r, inRois[i].colour.r, `ROI ${i + 1} red`
        );
        assert.equal(
          outRois[i].colour.g, inRois[i].colour.g, `ROI ${i + 1} green`
        );
        assert.equal(
          outRois[i].colour.b, inRois[i].colour.b, `ROI ${i + 1} blue`
        );
        assert.ok(outRois[i].contours.length > 0, `ROI ${i + 1} has contours`);
        for (const c of outRois[i].contours) {
          assert.ok(c.points3D.length >= 9, 'contour has at least 3 points');
          assert.equal(
            c.points3D.length % 3, 0, 'contour data length is multiple of 3'
          );
        }
      }
    });

  // -------------------------------------------------------------------------
  // Overlapping squares — test-rtss-01
  // Square 1: col=4..10, row=4..10 | Square 2: col=8..14, row=8..14
  // -------------------------------------------------------------------------

  test('create: overlapping squares, overlap flag detected', () => {
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});

    const config = syntheticData.find(c => c.name === 'test-rtss-01');
    const factory = new RtStructFactory();
    const image = factory.create(configToElements(config), buildRefImage());

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
    const refConfig = syntheticData.find(c => c.name === 'test-img-00');
    assert.equal(
      image.getMaskReferencedSeriesUID(),
      refConfig.tags.SeriesInstanceUID,
      'referencedSeriesUID matches test-img-00'
    );
  });

  test('create: overlapping squares pixel values in label map', () => {
    // hide logging
    vi.spyOn(loggerModule.logger, 'warn').mockImplementation(() => {});

    const config = syntheticData.find(c => c.name === 'test-rtss-01');
    const factory = new RtStructFactory();
    const image = factory.create(configToElements(config), buildRefImage());

    const buf = image.getBuffer();
    const width = 32;
    // square 1 exclusive area center at (col=6, row=6)
    assert.equal(buf[6 * width + 6], 1, 'sq 1 exclusive area is seg 1');
    // square 2 exclusive area center at (col=12, row=12)
    assert.equal(buf[12 * width + 12], 2, 'sq 2 exclusive area is seg 2');
    // overlap center at (col=9, row=9) → offset 9*32+9 = 297; seg 1 wins
    assert.equal(buf[9 * width + 9], 1, 'overlap pixel retains first segment');
  });

  test('create: overlapping squares segment collection', () => {
    // hide logging
    vi.spyOn(loggerModule.logger, 'warn').mockImplementation(() => {});

    const config = syntheticData.find(c => c.name === 'test-rtss-01');
    const factory = new RtStructFactory();
    const image = factory.create(configToElements(config), buildRefImage());

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

    // overlap zone at (col=9, row=9): each segment's own buffer has its value
    assert.equal(seg1[9 * width + 9], 1, 'seg 1 buf: overlap pixel = 1');
    assert.equal(seg2[9 * width + 9], 2, 'seg 2 buf: overlap pixel = 2');
    // label map collapses the overlap to first-segment value
    assert.equal(
      image.getBuffer()[9 * width + 9], 1,
      'label map: overlap pixel = 1 (first wins)'
    );
  });

  test('toDicom: overlapping squares round-trip', () => {
    // hide logging
    vi.spyOn(loggerModule.logger, 'warn').mockImplementation(() => {});

    const config = syntheticData.find(c => c.name === 'test-rtss-01');
    const factory = new RtStructFactory();
    const refImage = buildRefImage();
    const image = factory.create(configToElements(config), refImage);
    const outElements = factory.toDicom(image, undefined, refImage);

    const refConfig = syntheticData.find(c => c.name === 'test-img-00');
    assert.equal(
      getReferencedSeriesUIDFromRTStruct(outElements),
      refConfig.tags.SeriesInstanceUID,
      'output referencedSeriesUID matches test-img-00'
    );

    const inRois = getRTStructFromElements(configToElements(config));
    const outRois = getRTStructFromElements(outElements);

    assert.equal(outRois.length, inRois.length, 'same ROI count');
    for (let i = 0; i < inRois.length; i++) {
      assert.equal(outRois[i].name, inRois[i].name, `ROI ${i + 1} name`);
      assert.equal(
        outRois[i].colour.r, inRois[i].colour.r, `ROI ${i + 1} red`
      );
      assert.equal(
        outRois[i].colour.g, inRois[i].colour.g, `ROI ${i + 1} green`
      );
      assert.equal(
        outRois[i].colour.b, inRois[i].colour.b, `ROI ${i + 1} blue`
      );
      assert.ok(outRois[i].contours.length > 0, `ROI ${i + 1} has contours`);
      for (const c of outRois[i].contours) {
        assert.ok(c.points3D.length >= 9, 'contour has at least 3 points');
        assert.equal(
          c.points3D.length % 3, 0, 'contour data length is multiple of 3'
        );
      }
    }
  });

  // -------------------------------------------------------------------------
  // Square with a hole — test-rtss-02
  // Outer square: col=4..20, row=4..20 | Hole: col=10..14, row=10..14
  // -------------------------------------------------------------------------

  test(
    'create: square with hole punches out the hole - ' +
    '#DWV-REQ-IO-06-002 Load DICOM RTSTRUCT',
    () => {
      const config = syntheticData.find(c => c.name === 'test-rtss-02');
      const factory = new RtStructFactory();
      const image = factory.create(configToElements(config), buildRefImage());

      const buf = image.getBuffer();
      const width = 32;
      // outer, outside the hole
      assert.equal(buf[6 * width + 6], 1, 'outer area is segment 1');
      // inside the hole
      assert.equal(buf[12 * width + 12], 0, 'hole area is background');
      // fully outside the square
      assert.equal(buf[2 * width + 2], 0, 'outside square is background');
    });

  test(
    'toDicom: square with hole round-trip preserves the hole - ' +
    '#DWV-REQ-IO-05-004 Write DICOM RTSTRUCT',
    () => {
      const config = syntheticData.find(c => c.name === 'test-rtss-02');
      const factory = new RtStructFactory();
      const refImage = buildRefImage();
      const image = factory.create(configToElements(config), refImage);
      const outElements = factory.toDicom(image, undefined, refImage);

      const outRois = getRTStructFromElements(outElements);
      assert.equal(outRois.length, 1, 'one ROI');
      assert.equal(
        outRois[0].contours.length, 2,
        'outer boundary and hole are both written as contours'
      );
      for (const c of outRois[0].contours) {
        assert.equal(
          c.type, 'CLOSEDPLANAR_XOR',
          'hole-bearing contours are tagged CLOSEDPLANAR_XOR'
        );
      }

      // re-import the round-tripped RTSS and check the hole survived
      const roundTripImage = factory.create(outElements, refImage);
      const buf = roundTripImage.getBuffer();
      const width = 32;
      assert.equal(buf[6 * width + 6], 1, 'outer area is segment 1');
      assert.equal(buf[12 * width + 12], 0, 'hole area is background');
      assert.equal(buf[2 * width + 2], 0, 'outside square is background');
    });

  test('toDicom: same contour type for all the contours of an ROI', () => {
    // two slices: a square with a hole, then a plain square
    const width = 32;
    const sliceSize = width * width;
    const geometry = new Geometry(
      [new Point3D(0, 0, 0), new Point3D(0, 0, 1)],
      new Size([width, width, 2]),
      new Spacing([1, 1, 1])
    );
    const refImage = new Image(
      geometry, new Uint16Array(2 * sliceSize), ['1.2.3.1', '1.2.3.2']);
    refImage.setMeta({SeriesInstanceUID: '1.2.3'});
    const buffer = new Uint8Array(2 * sliceSize);
    for (let y = 4; y <= 14; ++y) {
      for (let x = 4; x <= 14; ++x) {
        const isHole = x >= 8 && x <= 10 && y >= 8 && y <= 10;
        if (!isHole) {
          buffer[y * width + x] = 1;
        }
      }
    }
    for (let y = 4; y <= 10; ++y) {
      for (let x = 4; x <= 10; ++x) {
        buffer[sliceSize + y * width + x] = 1;
      }
    }
    const image = new MaskImage(geometry, buffer, ['1.2.4.1', '1.2.4.2']);
    image.setMeta({Modality: 'RTSTRUCT'});
    const segments = [new MaskSegment(1, 'Ring', 'MANUAL')];

    const outElements =
      new RtStructFactory().toDicom(image, segments, refImage);
    const rois = getRTStructFromElements(outElements);
    assert.equal(rois.length, 1, 'one ROI');
    const contours = rois[0].contours;
    assert.equal(contours.length, 3, 'outer and hole, then square contours');
    for (const c of contours) {
      assert.equal(c.type, 'CLOSEDPLANAR_XOR', 'all contours are XOR');
    }

    // read back
    const reloaded = new RtStructFactory().create(outElements, refImage);
    const outBuffer = reloaded.getBuffer();
    assert.equal(outBuffer[6 * width + 6], 1, 'slice 0 ring is segment 1');
    assert.equal(outBuffer[9 * width + 9], 0, 'slice 0 hole is background');
    assert.equal(
      outBuffer[sliceSize + 7 * width + 7], 1, 'slice 1 square is segment 1');
  });

  /**
   * Save a single slice mask as RTSTRUCT and load it back.
   *
   * @param {string[]} rows The mask rows, one character per pixel
   *   (the segment number, 0 for background).
   * @returns {object} The output elements and the reloaded rows.
   */
  function maskRoundTrip(rows) {
    const width = rows[0].length;
    const height = rows.length;
    const geometry = new Geometry(
      [new Point3D(-10.5, 4, 2)],
      new Size([width, height, 1]),
      new Spacing([0.5, 0.8, 1])
    );
    const refImage = new Image(
      geometry, new Uint16Array(width * height), ['1.2.3.1']);
    refImage.setMeta({SeriesInstanceUID: '1.2.3'});
    const buffer = new Uint8Array(rows.join('').split('').map(Number));
    const image = new MaskImage(geometry, buffer, ['1.2.4.1']);
    image.setMeta({Modality: 'RTSTRUCT'});
    const maxValue = Math.max(...buffer);
    const segments = [];
    for (let i = 1; i <= maxValue; ++i) {
      segments.push(new MaskSegment(i, `Segment${i}`, 'MANUAL'));
    }
    const factory = new RtStructFactory();
    const outElements = factory.toDicom(image, segments, refImage);
    const outBuffer = factory.create(outElements, refImage).getBuffer();
    const outRows = [];
    for (let y = 0; y < height; ++y) {
      outRows.push(
        Array.from(outBuffer.slice(y * width, (y + 1) * width)).join(''));
    }
    return {outElements, outRows};
  }

  test('toDicom: contours go around the pixels', () => {
    const {outElements} = maskRoundTrip([
      '0000',
      '0110',
      '0110',
      '0000'
    ]);
    const rois = getRTStructFromElements(outElements);
    assert.equal(rois[0].contours.length, 1, 'one contour');
    // pixels 1 to 2, edges at 0.5 and 2.5;
    //   origin (-10.5, 4, 2), spacing (0.5, 0.8)
    assert.deepEqual(
      rois[0].contours[0].points3D,
      [
        [-10.25, 4.4, 2],
        [-9.25, 4.4, 2],
        [-9.25, 6, 2],
        [-10.25, 6, 2]
      ].flat(),
      'contour points on the pixel edges'
    );
  });

  test('toDicom: lossless round-trip', () => {
    const cases = {
      'single pixel': [
        '000',
        '010',
        '000'
      ],
      'one pixel line': [
        '00000',
        '01110',
        '00000'
      ],
      'image border': [
        '11',
        '11'
      ],
      'corner contact': [
        '0000',
        '0100',
        '0010',
        '0000'
      ],
      'ring with a corner gap': [
        '00000',
        '01100',
        '01010',
        '00110',
        '00000'
      ],
      'holes with a corner contact': [
        '0000000',
        '0111110',
        '0110110',
        '0101010',
        '0110110',
        '0111110',
        '0000000'
      ],
      'island in a hole': [
        '0000000',
        '0111110',
        '0100010',
        '0101010',
        '0100010',
        '0111110',
        '0000000'
      ],
      'touching segments': [
        '000000',
        '011220',
        '011220',
        '033330',
        '000000'
      ]
    };
    for (const [name, rows] of Object.entries(cases)) {
      assert.deepEqual(maskRoundTrip(rows).outRows, rows, name);
    }
  });

  test('create: accepts CLOSEDPLANAR_XOR contours and punches out the hole',
    () => {
      const config = syntheticData.find(c => c.name === 'test-rtss-03');
      const factory = new RtStructFactory();
      const image = factory.create(configToElements(config), buildRefImage());

      const buf = image.getBuffer();
      const width = 32;
      assert.equal(buf[6 * width + 6], 1, 'outer area is segment 1');
      assert.equal(buf[12 * width + 12], 0, 'hole area is background');
      assert.equal(buf[2 * width + 2], 0, 'outside square is background');
    });

  test(
    'create: keyhole-style single contour with bridge produces correct hole',
    () => {
      const config = syntheticData.find(c => c.name === 'test-rtss-04');
      const factory = new RtStructFactory();
      const image = factory.create(configToElements(config), buildRefImage());

      const buf = image.getBuffer();
      const width = 32;
      assert.equal(buf[6 * width + 6], 1, 'outer area is segment 1');
      assert.equal(buf[12 * width + 12], 0, 'hole area is background');
      assert.equal(buf[2 * width + 2], 0, 'outside square is background');
      // bridge runs along row 12: pixels in the ring on that row must
      // still be filled (the zero-width bridge must not leak into the fill)
      assert.equal(
        buf[12 * width + 6], 1,
        'ring pixel on the bridge row is filled, not leaked into the hole'
      );
    });

  // -------------------------------------------------------------------------
  // Output tags
  // -------------------------------------------------------------------------

  /**
   * Build a mask image from a synthetic RTSS config.
   *
   * @param {string} name The config name.
   * @returns {object} The mask image.
   */
  function buildMaskImage(name) {
    const config = syntheticData.find(c => c.name === name);
    return new RtStructFactory().create(
      configToElements(config), buildRefImage());
  }

  test('toDicom: throws without source image', () => {
    const image = buildMaskImage('test-rtss-00');
    assert.throws(
      () => new RtStructFactory().toDicom(image, undefined, undefined),
      Error,
      'Cannot create DICOM RTSTRUCT without source image'
    );
  });

  test('toDicom: type 2 tags are present', () => {
    const image = buildMaskImage('test-rtss-00');
    // remove the generated default patient and study tags
    // (the reference image has none)
    const meta = image.getMeta();
    for (const name of [
      'PatientName',
      'PatientID',
      'PatientBirthDate',
      'PatientSex',
      'StudyDate',
      'StudyTime',
      'ReferringPhysicianName',
      'StudyID'
    ]) {
      delete meta[name];
    }
    const outElements = new RtStructFactory().toDicom(
      image, undefined, buildRefImage());
    const type2Keys = {
      PatientName: '00100010',
      PatientID: '00100020',
      PatientBirthDate: '00100030',
      PatientSex: '00100040',
      StudyDate: '00080020',
      StudyTime: '00080030',
      ReferringPhysicianName: '00080090',
      StudyID: '00200010',
      AccessionNumber: '00080050',
      OperatorsName: '00081070',
      PositionReferenceIndicator: '00201040'
    };
    for (const [name, key] of Object.entries(type2Keys)) {
      assert.ok(
        typeof outElements[key] !== 'undefined', `${name} is present`);
      assert.equal(safeGet(outElements, key), '', `${name} is empty`);
    }
  });

  test('toDicom: input and source tags are kept', () => {
    const refImage = buildRefImage();
    refImage.getMeta().PositionReferenceIndicator = 'XY';
    const image = buildMaskImage('test-rtss-00');
    const meta = image.getMeta();
    meta.PatientName = 'Doe^John';
    meta.InstanceNumber = '3';
    meta.StructureSetLabel = 'Label';
    let outElements =
      new RtStructFactory().toDicom(image, undefined, refImage);
    assert.equal(
      safeGet(outElements, '00100010'), 'Doe^John', 'mask patient name');
    assert.equal(
      Number(safeGet(outElements, '00200013')), 3, 'mask instance number');
    assert.equal(
      safeGet(outElements, '30060002'), 'Label', 'mask label');
    assert.equal(
      safeGet(outElements, '00201040'), 'XY', 'source position reference');

    // defaults
    delete meta.InstanceNumber;
    delete meta.StructureSetLabel;
    outElements = new RtStructFactory().toDicom(image, undefined, refImage);
    assert.equal(
      Number(safeGet(outElements, '00200013')), 1, 'default instance number');
    assert.equal(
      safeGet(outElements, '30060002'), 'RT Structure Set', 'default label');
  });

  test('toDicom: instance and series identification', () => {
    const refImage = buildRefImage();
    const image = buildMaskImage('test-rtss-00');
    const meta = image.getMeta();
    const factory = new RtStructFactory();

    // loaded RTSTRUCT: series is kept
    const outElements = factory.toDicom(image, undefined, refImage);
    const sopUID = safeGet(outElements, '00080018');
    assert.ok(sopUID.startsWith('2.25.'), 'generated sop uid');
    assert.equal(
      safeGet(outElements, '00020003'), sopUID, 'media storage uid');
    assert.equal(
      safeGet(outElements, '0020000E'), meta.SeriesInstanceUID,
      'input series uid');
    assert.equal(
      Number(safeGet(outElements, '00200011')), 1, 'default series number');

    // a new instance at each call
    const outElements2 = factory.toDicom(image, undefined, refImage);
    assert.notEqual(
      safeGet(outElements2, '00080018'), sopUID, 'new sop uid');

    // not an RTSTRUCT series (for ex a SEG or brush mask): new series
    meta.Modality = 'SEG';
    meta.SeriesNumber = '5';
    const outElements3 = factory.toDicom(image, undefined, refImage);
    const seriesUID = safeGet(outElements3, '0020000E');
    assert.ok(seriesUID.startsWith('2.25.'), 'generated series uid');
    assert.notEqual(seriesUID, meta.SeriesInstanceUID, 'new series uid');
    assert.equal(
      Number(safeGet(outElements3, '00200011')), 1, 'new series number');

    // extra tags win, media storage follows the sop instance uid
    const outElements4 = factory.toDicom(
      image, undefined, refImage, {SOPInstanceUID: '1.2.3.88'});
    assert.equal(
      safeGet(outElements4, '00080018'), '1.2.3.88', 'extra sop uid');
    assert.equal(
      safeGet(outElements4, '00020003'), '1.2.3.88', 'extra media uid');
  });

  test('toDicom: equipment', () => {
    const refImage = buildRefImage();
    const image = buildMaskImage('test-rtss-00');
    image.getMeta().Manufacturer = 'other';
    let outElements =
      new RtStructFactory().toDicom(image, undefined, refImage);
    assert.equal(safeGet(outElements, '00080070'), 'dwv', 'manufacturer');
    assert.equal(safeGet(outElements, '00081090'), 'DWV', 'model name');
    assert.equal(safeGet(outElements, '00181000'), '1', 'serial number');
    assert.equal(
      safeGet(outElements, '00181020'), getDwvVersion(), 'software versions');

    // application equipment via extra tags
    outElements = new RtStructFactory().toDicom(image, undefined, refImage, {
      Manufacturer: 'app'
    });
    assert.equal(safeGet(outElements, '00080070'), 'app', 'app manufacturer');
  });

  test('toDicom: source image references', () => {
    const refImage = buildRefImage();
    const refConfig = syntheticData.find(c => c.name === 'test-img-00');
    refImage.setMeta({...refConfig.tags});
    const refMeta = refImage.getMeta();
    const outElements = new RtStructFactory().toDicom(
      buildMaskImage('test-rtss-00'), undefined, refImage);

    const forItem = safeGetAll(outElements, '30060010')[0];
    const studyItem = safeGetAll(forItem, '30060012')[0];
    assert.equal(
      safeGet(studyItem, '00081150'), '1.2.840.10008.3.1.2.3.1',
      'study sop class');
    assert.equal(
      safeGet(studyItem, '00081155'), refMeta.StudyInstanceUID,
      'study sop instance');
    const seriesItem = safeGetAll(studyItem, '30060014')[0];
    assert.equal(
      safeGet(seriesItem, '0020000E'), refMeta.SeriesInstanceUID,
      'series uid');
    const images = safeGetAll(seriesItem, '30060016');
    assert.equal(images.length, 1, 'one contour image');
    assert.equal(
      safeGet(images[0], '00081150'), refMeta.SOPClassUID,
      'image sop class');
    assert.equal(
      safeGet(images[0], '00081155'), refMeta.SOPInstanceUID,
      'image sop instance');

    // contour level reference
    const roiContour = safeGetAll(outElements, '30060039')[0];
    for (const contour of safeGetAll(roiContour, '30060040')) {
      const contourImages = safeGetAll(contour, '30060016');
      assert.equal(contourImages.length, 1, 'one contour image');
      assert.equal(
        safeGet(contourImages[0], '00081155'), refMeta.SOPInstanceUID,
        'contour image sop instance');
    }
  });

});
