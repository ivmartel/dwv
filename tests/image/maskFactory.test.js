import {describe, test, assert, vi, afterEach} from 'vitest';
import {getReferencedSeriesUID} from '../../src/dicom/dicomImage.js';
import {getSegment} from '../../src/dicom/dicomSegment.js';
import {safeGet, safeGetAll} from '../../src/dicom/dataElement.js';
import {
  DicomParser,
  getDwvVersion,
  getDwvUIDPrefix
} from '../../src/dicom/dicomParser.js';
import {DicomWriter} from '../../src/dicom/dicomWriter.js';
import {ImageFactory} from '../../src/image/imageFactory.js';
import {
  MaskFactory,
  mergeMaskImages,
  getDicomSegDimensionOrganization
} from '../../src/image/maskFactory.js';
import {Image} from '../../src/image/image.js';
import {MaskImage} from '../../src/image/maskImage.js';
import {SegmentCollection} from '../../src/image/segmentCollection.js';
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
import syntheticSegData from '/tests/data/synthetic-seg.json';

// test-img-00 (img) is used throughout as a reference image, alongside
// the SEG entries under test.
const syntheticData = [...syntheticImgData, ...syntheticSegData];

/**
 * Tests for the 'image/maskFactory.js' file.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

/**
 * Build a minimal reference Image matching test-img-00 geometry.
 *
 * @returns {Image} The reference image.
 */
function buildRefImage() {
  const config = syntheticData.find(c => c.name === 'test-img-00');
  const elements = configToElements(config);
  const buffer = elements['7FE00010'].value;
  const factory = new ImageFactory();
  return factory.create(elements, buffer, 1);
}

/**
 * Build a mask Image matching test-img-00 geometry.
 *
 * @param {string} configName The config name.
 * @returns {MaskImage} The reference image.
 */
function buildMaskImage(configName) {
  const config = syntheticData.find(c => c.name === configName);
  const elements = configToElements(config);
  const buffer = elements['7FE00010'].value;
  const factory = new MaskFactory();
  return factory.create(elements, buffer, buildRefImage());
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
  // Non-overlapping squares — test-seg-00
  // Square 1: col=4..10, row=4..10 | Square 2: col=12..18, row=12..18
  // -------------------------------------------------------------------------

  test('create: non-overlapping squares, no overlap flag', () => {
    const image = buildMaskImage('test-seg-00');

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

  test('create: throws for incomplete per-frame functional groups', () => {
    const config = syntheticData.find(c => c.name === 'test-seg-00');
    const elements = configToElements(config);
    // remove the FrameContentSequence of the first per-frame item
    const perFrameSq = safeGetAll(elements, '52009230');
    delete perFrameSq[0]['00209111'];
    const buffer = elements['7FE00010'].value;
    const factory = new MaskFactory();
    assert.throws(
      () => factory.create(elements, buffer, buildRefImage()),
      Error,
      'Incomplete per frame functional groups'
    );
  });

  test(
    'create: non-overlapping squares pixel values in label map - ' +
    '#DWV-REQ-IO-06-001 Load DICOM SEG',
    () => {
      const image = buildMaskImage('test-seg-00');

      const buf = image.getBuffer();
      const width = 32;
      // square 1 center at (col=7, row=7)
      assert.equal(buf[7 * width + 7], 1, 'square 1 center is segment 1');
      // square 2 center at (col=15, row=15)
      assert.equal(buf[15 * width + 15], 2, 'square 2 center is segment 2');
      // gap between the two squares
      assert.equal(buf[11 * width + 11], 0,
        'gap between squares is background');
    });

  test(
    'create: non-overlapping squares segment collection - ' +
    '#DWV-REQ-IO-06-001 Load DICOM SEG',
    () => {
      const image = buildMaskImage('test-seg-00');

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
    '#DWV-REQ-IO-05-003 Write DICOM SEG',
    () => {
      const config = syntheticData.find(c => c.name === 'test-seg-00');
      const refImage = buildRefImage();
      const image = buildMaskImage('test-seg-00');

      const factory = new MaskFactory();
      const segments = image.getMeta().custom.segments;
      const outElements = factory.toDicom(image, segments, refImage);

      const refConfig = syntheticData.find(c => c.name === 'test-img-00');
      assert.equal(
        getReferencedSeriesUID(outElements),
        refConfig.tags.SeriesInstanceUID,
        'output referencedSeriesUID matches test-img-00'
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
  // Overlapping squares — test-seg-01
  // Square 1: col=4..10, row=4..10 | Square 2: col=8..14, row=8..14
  // -------------------------------------------------------------------------

  test('create: overlapping squares, overlap flag detected', () => {
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});

    const image = buildMaskImage('test-seg-01');

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

    const image = buildMaskImage('test-seg-01');

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

    const image = buildMaskImage('test-seg-01');

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

  test(
    'toDicom: overlapping squares round-trip - ' +
    '#DWV-REQ-IO-05-003 Write DICOM SEG',
    () => {
    // hide logging
      vi.spyOn(loggerModule.logger, 'warn').mockImplementation(() => {});

      const config = syntheticData.find(c => c.name === 'test-seg-01');
      const refImage = buildRefImage();
      const image = buildMaskImage('test-seg-01');

      const factory = new MaskFactory();
      const segments = image.getMeta().custom.segments;
      const outElements = factory.toDicom(image, segments, refImage);

      const refConfig = syntheticData.find(c => c.name === 'test-img-00');
      assert.equal(
        getReferencedSeriesUID(outElements),
        refConfig.tags.SeriesInstanceUID,
        'output referencedSeriesUID matches test-img-00'
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

  test('toDicom: defaults to the image meta segments', () => {
    const image = buildMaskImage('test-seg-00');
    const outElements =
      new MaskFactory().toDicom(image, undefined, buildRefImage());
    const outSegs = getSegmentsFromElements(outElements);
    assert.deepEqual(
      outSegs.map(seg => seg.number),
      image.getMeta().custom.segments.map(seg => seg.number),
      'output segments are the meta ones'
    );
  });

  test('toDicom: throws without segments', () => {
    const image = buildMaskImage('test-seg-00');
    delete image.getMeta().custom.segments;
    assert.throws(
      () => new MaskFactory().toDicom(image, undefined, buildRefImage()),
      'Cannot create DICOM SEG without segments'
    );
  });

  test('toDicom: throws without source image', () => {
    const image = buildMaskImage('test-seg-00');
    assert.throws(
      () => new MaskFactory().toDicom(image, undefined, undefined),
      'Cannot create DICOM SEG without source image'
    );
  });

  test('toDicom: does not modify the image meta', () => {
    const image = buildMaskImage('test-seg-00');
    const metaBefore = {...image.getMeta()};
    new MaskFactory().toDicom(
      image, undefined, buildRefImage(), {SOPInstanceUID: '1.2.3'});
    const meta = image.getMeta();
    assert.deepEqual(
      Object.keys(meta), Object.keys(metaBefore), 'same meta keys');
    for (const key of Object.keys(metaBefore)) {
      assert.equal(meta[key], metaBefore[key], `same meta ${key}`);
    }
  });

  test('toDicom: one position dimension index per position', () => {
    // 3 slices, segment 1 on slices 0 and 2, segment 2 on slice 1
    const geometry = new Geometry(
      [
        new Point3D(0, 0, 0),
        new Point3D(0, 0, 1),
        new Point3D(0, 0, 2)
      ],
      new Size([4, 4, 3]),
      new Spacing([1, 1, 1])
    );
    const sliceSize = 16;
    const buffer = new Uint8Array(sliceSize * 3);
    buffer[0] = 1;
    buffer[sliceSize + 1] = 2;
    buffer[2 * sliceSize + 2] = 1;
    const image = new MaskImage(geometry, buffer, ['0', '1', '2']);
    image.setMeta({Modality: 'SEG'});
    const segments = [
      {number: 1, label: 's1', algorithmType: 'MANUAL'},
      {number: 2, label: 's2', algorithmType: 'MANUAL'}
    ];
    // source image with the same geometry
    const sourceUids = ['1.2.3.0', '1.2.3.1', '1.2.3.2'];
    const sourceImage = new Image(
      geometry, new Uint8Array(sliceSize * 3), sourceUids);
    sourceImage.setMeta({
      SOPClassUID: '1.2.840.10008.5.1.4.1.1.4',
      SeriesInstanceUID: '1.2.3',
      StudyInstanceUID: '1.2'
    });
    const outElements =
      new MaskFactory().toDicom(image, segments, sourceImage);

    const frames = safeGetAll(outElements, '52009230');
    assert.equal(frames.length, 3, 'number of frames');
    const zByIndex = new Map();
    for (const frame of frames) {
      const index = frame['00209111'].value[0]['00209157'].value[1];
      const z = Number(frame['00209113'].value[0]['00200032'].value[2]);
      // DerivationImageSequence > SourceImageSequence
      const sourceUid = frame['00089124'].value[0]['00082112']
        .value[0]['00081155'].value[0];
      assert.equal(sourceUid, sourceUids[z], `source image for z ${z}`);
      if (zByIndex.has(index)) {
        assert.equal(z, zByIndex.get(index), `same z for index ${index}`);
      } else {
        zByIndex.set(index, z);
      }
    }
    assert.equal(zByIndex.size, 3, 'one index per position');
    assert.deepEqual(
      Array.from(zByIndex.keys()).sort(), [1, 2, 3], 'indices from 1 to 3');
  });

  test('toDicom: slice thickness and lossy image compression', () => {
    const factory = new MaskFactory();
    const refImage = buildRefImage();
    let outElements =
      factory.toDicom(buildMaskImage('test-seg-00'), undefined, refImage);
    const measures = safeGetAll(outElements, '52009229')[0]['00289110'];
    assert.ok(
      typeof measures.value[0]['00180050'] !== 'undefined',
      'slice thickness is present'
    );
    assert.equal(
      safeGet(outElements, '00282110'), '00', 'not lossy compressed');

    // source image lossy compressed
    refImage.getMeta().LossyImageCompression = '01';
    outElements =
      factory.toDicom(buildMaskImage('test-seg-00'), undefined, refImage);
    assert.equal(
      safeGet(outElements, '00282110'), '01', 'lossy from source');
  });

  /**
   * Check the dimension organization and indices of a DICOM SEG.
   *
   * @param {Record<string, object>} elements The DICOM SEG elements.
   * @param {string} orgUID The expected organization UID.
   * @param {string[]} labels The expected index labels.
   */
  function checkDimensions(elements, orgUID, labels) {
    const orgs = safeGetAll(elements, '00209221');
    assert.equal(orgs.length, 1, 'one dimension organization');
    assert.equal(orgs[0]['00209164'].value[0], orgUID, 'organization uid');
    const indices = safeGetAll(elements, '00209222');
    assert.deepEqual(
      indices.map(item => item['00209164'].value[0]),
      [orgUID, orgUID],
      'index organization uids'
    );
    // segment number then position, with their functional groups
    assert.deepEqual(
      indices.map(item => item['00209165'].value[0]),
      ['(0062,000B)', '(0020,0032)'],
      'dimension index pointers'
    );
    assert.deepEqual(
      indices.map(item => item['00209167'].value[0]),
      ['(0062,000A)', '(0020,9113)'],
      'functional group pointers'
    );
    assert.deepEqual(
      indices.map(item => item['00209421'].value[0]),
      labels,
      'dimension description labels'
    );
    for (const frame of safeGetAll(elements, '52009230')) {
      const values = frame['00209111'].value[0]['00209157'].value;
      assert.equal(values.length, indices.length, 'one value per index');
    }
  }

  /**
   * Write a DICOM SEG and read it back as a mask.
   *
   * @param {Record<string, object>} elements The DICOM SEG elements.
   * @param {Image} refImage The reference image.
   * @returns {MaskImage} The read mask.
   */
  function writeAndRead(elements, refImage) {
    const buffer = new DicomWriter().getBuffer(elements);
    const parser = new DicomParser();
    parser.parse(buffer);
    const parsed = parser.getDicomElements();
    return new MaskFactory().create(
      parsed, parsed['7FE00010'].value[0], refImage);
  }

  const dwvOrgUID = getDicomSegDimensionOrganization()
    .organizations.value[0].DimensionOrganizationUID;
  const dwvLabels = ['ReferencedSegmentNumber', 'ImagePositionPatient'];

  test('getDicomSegDimensionOrganization: valid uid', () => {
    assert.equal(
      dwvOrgUID, `${getDwvUIDPrefix()}.681051091011101.1`, 'uid value');
    // UI: max 64 chars, numeric components without leading zero
    assert.ok(dwvOrgUID.length <= 64, 'uid length');
    assert.ok(
      /^(0|[1-9]\d*)(\.(0|[1-9]\d*))*$/.test(dwvOrgUID), 'uid format');
  });

  test('toDicom: dwv dimensions without input indices', () => {
    // remove the DimensionIndexSequence of test-seg-00
    const refImage = buildRefImage();
    const image = buildMaskImage('test-seg-00');
    delete image.getMeta().DimensionIndexSequence;
    const outElements =
      new MaskFactory().toDicom(image, undefined, refImage);
    checkDimensions(outElements, dwvOrgUID, dwvLabels);

    const reloaded = writeAndRead(outElements, refImage);
    assert.deepEqual(
      Array.from(reloaded.getBuffer()),
      Array.from(image.getBuffer()),
      'same label map after reload'
    );
  });

  test('toDicom: keeps the input segment and position indices', () => {
    const refImage = buildRefImage();
    const image = buildMaskImage('test-seg-00');
    const meta = image.getMeta();
    const orgUID = '1.2.3.99';
    meta.DimensionOrganizationSequence = {
      value: [{DimensionOrganizationUID: orgUID}]
    };
    // no functional group pointers in input
    meta.DimensionIndexSequence = {
      value: [
        {
          DimensionOrganizationUID: orgUID,
          DimensionIndexPointer: '(0062,000B)',
          DimensionDescriptionLabel: 'Segment'
        },
        {
          DimensionOrganizationUID: orgUID,
          DimensionIndexPointer: '(0020,0032)',
          DimensionDescriptionLabel: 'Position'
        }
      ]
    };
    const outElements =
      new MaskFactory().toDicom(image, undefined, refImage);
    checkDimensions(outElements, orgUID, ['Segment', 'Position']);

    // read back: indices are kept, with their functional groups
    const reloaded = writeAndRead(outElements, refImage);
    assert.deepEqual(
      Array.from(reloaded.getBuffer()),
      Array.from(image.getBuffer()),
      'same label map after reload'
    );
    assert.deepEqual(
      reloaded.getMeta().DimensionIndexSequence.value.map(
        item => item.FunctionalGroupPointer),
      ['(0062,000A)', '(0020,9113)'],
      'read functional group pointers'
    );
  });

  test('toDicom: dwv dimensions for other input indices', () => {
    const refImage = buildRefImage();
    const image = buildMaskImage('test-seg-00');
    const meta = image.getMeta();
    const orgUID = '1.2.3.99';
    meta.DimensionOrganizationSequence = {
      value: [{DimensionOrganizationUID: orgUID}]
    };
    // stack id then position: not written by dwv
    meta.DimensionIndexSequence = {
      value: [
        {
          DimensionOrganizationUID: orgUID,
          DimensionIndexPointer: '(0020,9056)'
        },
        {
          DimensionOrganizationUID: orgUID,
          DimensionIndexPointer: '(0020,0032)'
        }
      ]
    };
    const outElements =
      new MaskFactory().toDicom(image, undefined, refImage);
    checkDimensions(outElements, dwvOrgUID, dwvLabels);
  });

  test('toDicom: default content label and description', () => {
    // remove the content label and description of test-seg-00
    const image = buildMaskImage('test-seg-00');
    delete image.getMeta().ContentLabel;
    delete image.getMeta().ContentDescription;
    const outElements = new MaskFactory().toDicom(
      image, undefined, buildRefImage());
    assert.equal(
      safeGet(outElements, '00700080'), 'SEGMENTATION', 'content label');
    // type 2: present, empty
    assert.ok(
      typeof outElements['00700081'] !== 'undefined',
      'content description is present'
    );
    assert.equal(
      safeGet(outElements, '00700081'), '', 'empty description');
  });

  test('toDicom: instance number and position reference indicator', () => {
    const refImage = buildRefImage();
    // test-img-00 has no position reference indicator, remove the
    //   generator instance number and the position reference
    //   indicator from test-seg-00
    const noNumberImage = buildMaskImage('test-seg-00');
    delete noNumberImage.getMeta().InstanceNumber;
    delete noNumberImage.getMeta().PositionReferenceIndicator;
    let outElements =
      new MaskFactory().toDicom(noNumberImage, undefined, refImage);
    assert.equal(
      Number(safeGet(outElements, '00200013')), 1, 'default instance number');
    // type 2: present, empty
    assert.equal(
      safeGet(outElements, '00201040'), '', 'empty position reference');

    // position reference indicator from the source image
    refImage.getMeta().PositionReferenceIndicator = 'XY';
    const noPositionRefImage = buildMaskImage('test-seg-00');
    delete noPositionRefImage.getMeta().PositionReferenceIndicator;
    outElements = new MaskFactory().toDicom(
      noPositionRefImage, undefined, refImage);
    assert.equal(
      safeGet(outElements, '00201040'), 'XY', 'source position reference');

    // mask values win
    const image = buildMaskImage('test-seg-00');
    image.getMeta().InstanceNumber = '3';
    image.getMeta().PositionReferenceIndicator = 'SN';
    outElements = new MaskFactory().toDicom(image, undefined, refImage);
    assert.equal(
      Number(safeGet(outElements, '00200013')), 3, 'mask instance number');
    assert.equal(
      safeGet(outElements, '00201040'), 'SN', 'mask position reference');
  });

  test('toDicom: instance and series identification', () => {
    const refImage = buildRefImage();
    const image = buildMaskImage('test-seg-00');
    const meta = image.getMeta();
    // no input series
    delete meta.SeriesInstanceUID;
    delete meta.SeriesNumber;

    const factory = new MaskFactory();
    const outElements = factory.toDicom(image, undefined, refImage);
    const sopUID = safeGet(outElements, '00080018');
    assert.ok(sopUID.startsWith('2.25.'), 'generated sop uid');
    assert.equal(
      safeGet(outElements, '00020003'), sopUID, 'media storage uid');
    const seriesUID = safeGet(outElements, '0020000E');
    assert.ok(seriesUID.startsWith('2.25.'), 'generated series uid');
    assert.notEqual(seriesUID, sopUID, 'series and sop uids differ');
    assert.equal(
      Number(safeGet(outElements, '00200011')), 1, 'default series number');

    // a new instance at each call
    const outElements2 = factory.toDicom(image, undefined, refImage);
    assert.notEqual(
      safeGet(outElements2, '00080018'), sopUID, 'new sop uid');

    // input series is kept
    meta.SeriesInstanceUID = '1.2.3.77';
    meta.SeriesNumber = '5';
    const outElements3 = factory.toDicom(image, undefined, refImage);
    assert.equal(
      safeGet(outElements3, '0020000E'), '1.2.3.77', 'input series uid');
    assert.equal(
      Number(safeGet(outElements3, '00200011')), 5, 'input series number');

    // extra tags win, media storage follows the sop instance uid
    const outElements4 = factory.toDicom(
      image, undefined, refImage, {SOPInstanceUID: '1.2.3.88'});
    assert.equal(
      safeGet(outElements4, '00080018'), '1.2.3.88', 'extra sop uid');
    assert.equal(
      safeGet(outElements4, '00020003'), '1.2.3.88', 'extra media uid');
  });

  test('toDicom: dwv equipment, not the input one', () => {
    const refImage = buildRefImage();
    const image = buildMaskImage('test-seg-00');
    // input mask equipment
    const meta = image.getMeta();
    meta.Manufacturer = 'other';
    meta.ManufacturerModelName = 'other model';
    meta.DeviceSerialNumber = '42';
    meta.SoftwareVersions = '9.9';
    let outElements = new MaskFactory().toDicom(image, undefined, refImage);
    assert.equal(safeGet(outElements, '00080070'), 'dwv', 'manufacturer');
    assert.equal(safeGet(outElements, '00081090'), 'DWV', 'model name');
    assert.equal(safeGet(outElements, '00181000'), '1', 'serial number');
    assert.equal(
      safeGet(outElements, '00181020'), getDwvVersion(), 'software versions');

    // application equipment via extra tags
    outElements = new MaskFactory().toDicom(image, undefined, refImage, {
      Manufacturer: 'app',
      ManufacturerModelName: 'app model',
      DeviceSerialNumber: 'A1',
      SoftwareVersions: '1.0'
    });
    assert.equal(safeGet(outElements, '00080070'), 'app', 'app manufacturer');
    assert.equal(
      safeGet(outElements, '00081090'), 'app model', 'app model name');
    assert.equal(safeGet(outElements, '00181000'), 'A1', 'app serial number');
    assert.equal(
      safeGet(outElements, '00181020'), '1.0', 'app software versions');
  });

  test('toDicom: keeps the input content label and description', () => {
    const refImage = buildRefImage();
    const image = buildMaskImage('test-seg-00');
    image.getMeta().ContentLabel = 'LIVER_SEG';
    image.getMeta().ContentDescription = 'Liver segmentation';
    const outElements =
      new MaskFactory().toDicom(image, undefined, refImage);
    assert.equal(
      safeGet(outElements, '00700080'), 'LIVER_SEG', 'content label');
    assert.equal(
      safeGet(outElements, '00700081'), 'Liver segmentation',
      'content description');

    // kept when read back
    const meta = writeAndRead(outElements, refImage).getMeta();
    assert.equal(meta.ContentLabel, 'LIVER_SEG', 'read content label');
    assert.equal(
      meta.ContentDescription, 'Liver segmentation',
      'read content description');

    // extra tags win
    const extraElements = new MaskFactory().toDicom(
      image, undefined, refImage, {ContentLabel: 'OTHER'});
    assert.equal(
      safeGet(extraElements, '00700080'), 'OTHER', 'extra content label');
  });

});

// ---------------------------------------------------------------------------
// mergeMaskImages tests
// ---------------------------------------------------------------------------

/**
 * Build a minimal single-segment mask using the test-img-00 geometry.
 *
 * @param {number} segNumber The segment number.
 * @param {string} label The segment label.
 * @param {number} pixelStart First pixel index to mark as foreground.
 * @param {number} pixelCount Number of contiguous foreground pixels.
 * @returns {MaskImage} The mask image.
 */
function buildSingleSegmentMask(segNumber, label, pixelStart, pixelCount) {
  const config = syntheticData.find(c => c.name === 'test-img-00');
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
  const image = new MaskImage(geometry, labelMap, [`uid-${segNumber}`],
    collection);
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
      const config = syntheticData.find(c => c.name === 'test-seg-00');
      const factory = new MaskFactory();
      const mask1 = buildMaskImage('test-seg-00');
      const mask2 = buildMaskImage('test-seg-00');
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
      const config = syntheticData.find(c => c.name === 'test-img-00');
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
      const brushMask = new MaskImage(brushGeometry, brushBuf, ['uid-brush']);
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
      const config = syntheticData.find(c => c.name === 'test-img-00');
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
      const brushMask = new MaskImage(brushGeometry, brushBuf, ['uid-brush']);
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
      const config = syntheticData.find(c => c.name === 'test-img-00');
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
      const mask1 = new MaskImage(
        geometry1, collection1.getLabelMap(), ['uid-1a', 'uid-1b', 'uid-1c'],
        collection1);
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
      const mask2 = new MaskImage(
        geometry2, collection2.getLabelMap(), ['uid-2'], collection2);
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
    const config = syntheticData.find(c => c.name === 'test-img-00');
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
    const mask1 = new MaskImage(
      geometry1, collection1.getLabelMap(), ['uid-1'], collection1);
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
    const mask2 = new MaskImage(
      geometry2, collection2.getLabelMap(), ['uid-2a', 'uid-2b', 'uid-2c'],
      collection2);
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

  test('merge: result geometry is the same regardless of input order',
    () => {
      const config = syntheticData.find(c => c.name === 'test-img-00');
      const tags = config.tags;
      const sliceSize = tags.Columns * tags.Rows;

      // narrow mask: single slice at z=1 only
      const narrowGeometry = new Geometry(
        [new Point3D(0, 0, 1)],
        new Size([tags.Columns, tags.Rows, 1]),
        new Spacing([1, 1, 1])
      );
      const narrowCollection = new SegmentCollection(narrowGeometry);
      const narrowSliceBuf = new Uint8Array(sliceSize);
      narrowSliceBuf[0] = 1;
      narrowCollection.addFrame(1, narrowSliceBuf, 0, 0, sliceSize, 1);
      const narrowMask = new MaskImage(
        narrowGeometry, narrowCollection.getLabelMap(), ['uid-narrow'],
        narrowCollection);
      narrowMask.setMeta({
        Modality: 'SEG',
        custom: {segments: [{number: 1, label: 'Seg1'}]}
      });

      // wide mask: 3 slices (z=0,1,2)
      const wideGeometry = new Geometry(
        [new Point3D(0, 0, 0), new Point3D(0, 0, 1), new Point3D(0, 0, 2)],
        new Size([tags.Columns, tags.Rows, 3]),
        new Spacing([1, 1, 1])
      );
      const wideCollection = new SegmentCollection(wideGeometry);
      for (let k = 0; k < 3; ++k) {
        const sliceBuf = new Uint8Array(sliceSize);
        sliceBuf[50] = 1;
        wideCollection.addFrame(2, sliceBuf, 0, k, sliceSize, 2);
      }
      const wideMask = new MaskImage(
        wideGeometry, wideCollection.getLabelMap(),
        ['uid-wide-a', 'uid-wide-b', 'uid-wide-c'], wideCollection);
      wideMask.setMeta({
        Modality: 'SEG',
        custom: {segments: [{number: 2, label: 'Seg2'}]}
      });

      const mergedNarrowFirst = mergeMaskImages(narrowMask, wideMask);
      const mergedWideFirst = mergeMaskImages(wideMask, narrowMask);

      assert.ok(
        mergedNarrowFirst.getGeometry().equals(mergedWideFirst.getGeometry()),
        'merged geometry does not depend on argument order');
      assert.equal(
        mergedNarrowFirst.getGeometry().getSize().get(2), 3,
        'merged geometry keeps the wider (3-slice) range either way');
    }
  );

});
