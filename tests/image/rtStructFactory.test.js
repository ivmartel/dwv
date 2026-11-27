import {describe, test, assert, vi, afterEach} from 'vitest';
import {
  getElementsFromSimpleTagValues
} from '../../src/dicom/simpleTagValues.js';
import {getRTStructFromElements} from '../../src/dicom/dicomRTStruct.js';
import {
  getReferencedSeriesUIDFromRTStruct
} from '../../src/dicom/dicomImage.js';
import {safeGet, safeGetAll} from '../../src/dicom/dataElement.js';
import {getDwvVersion} from '../../src/dicom/dicomParser.js';
import {RtStructFactory} from '../../src/image/rtStructFactory.js';
import {Image} from '../../src/image/image.js';
import {Geometry} from '../../src/image/geometry.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Point3D} from '../../src/math/point.js';
import * as loggerModule from '../../src/utils/logger.js';

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
 * Parse synthetic RTSS config tags into DICOM data elements.
 *
 * @param {object} config A synthetic-data entry.
 * @returns {Record<string, object>} DICOM data elements.
 */
function configToElements(config) {
  return getElementsFromSimpleTagValues(structuredClone(config.tags));
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
      getElementsFromSimpleTagValues(tags1), buildRefImage());
    assert.equal(image1.getMeta().FrameOfReferenceUID, forUid,
      'frame of reference UID from referenced sequence');

    // none
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});
    const tags2 = structuredClone(tags1);
    delete tags2.ReferencedFrameOfReferenceSequence.value[0]
      .FrameOfReferenceUID;
    const image2 = factory.create(
      getElementsFromSimpleTagValues(tags2), buildRefImage());
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
    // test-rtss-00 and test-img-00 have no patient tags
    const outElements = new RtStructFactory().toDicom(
      buildMaskImage('test-rtss-00'), undefined, buildRefImage());
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
