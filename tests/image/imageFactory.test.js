import {describe, beforeAll, test, assert} from 'vitest';
import {ImageFactory} from '../../src/image/imageFactory.js';
import {Geometry} from '../../src/image/geometry.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Point3D} from '../../src/math/point.js';
import {
  dataStructures,
  getStructureElementsList,
  getStructureNumberOfFiles,
  singleSliceStructure
} from '../../dev/dicom/dataStructures.js';

import syntheticData from '/tests/data/synthetic-img.json';

// config and transfer syntax pairs to run the creation suites against
// (the first suite runs against all configs)
const creationCases = [
  {
    name: syntheticData[0].name,
    syntax: '1.2.840.10008.1.2.1',
    config: syntheticData[0]
  }
];

/**
 * Tests for the 'image/imageFactory.js' file.
 */

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ImageFactory', () => {

  // run the full check/create test suite against every image config
  // in synthetic-img.json (simple MR, RGB, alternate encodings,
  // private tags, charset, etc.)
  describe.each(syntheticData)('$name', (config) => {
    const tags = config.tags;

    // checkElements() and create() are pure (no shared mutable state
    // between calls, no mutation of their inputs) and every test below
    // only reads their results, so both run once per config and are
    // shared across all assertions instead of being redone per test.
    let warning;
    let image;
    let buffer;

    beforeAll(() => {
      const elements = getStructureElementsList(
        config, '1.2.840.10008.1.2.1', singleSliceStructure)[0];
      buffer = elements['7FE00010'].value;

      const factory = new ImageFactory();
      warning = factory.checkElements(elements);
      image = factory.create(elements, buffer, 1);
    });

    test('checkElements: returns no warning', () => {
      assert.equal(warning, undefined, 'no warning for valid MR data');
    });

    test('create: geometry matches tags', () => {
      const geo = image.getGeometry();
      const expectedGeo = new Geometry(
        [new Point3D(
          tags.ImagePositionPatient[0],
          tags.ImagePositionPatient[1],
          tags.ImagePositionPatient[2]
        )],
        new Size([tags.Columns, tags.Rows, 1]),
        new Spacing([tags.PixelSpacing[0], tags.PixelSpacing[1], 1])
      );

      assert.ok(geo.equals(expectedGeo), 'geometry matches tags');
      assert.equal(
        geo.getSize().get(0), tags.Columns, 'columns match');
      assert.equal(
        geo.getSize().get(1), tags.Rows, 'rows match');
      assert.deepEqual(
        geo.getOrigin().getValues(), [0, 0, 0], 'origin at (0,0,0)');
      assert.equal(
        geo.getSpacing().get(0), tags.PixelSpacing[0], 'spacing x matches');
      assert.equal(
        geo.getSpacing().get(1), tags.PixelSpacing[1], 'spacing y matches');
    });

    test('create: meta tags match tags', () => {
      const meta = image.getMeta();
      assert.equal(meta.Modality, tags.Modality, 'Modality');
      assert.equal(meta.SOPClassUID, tags.SOPClassUID, 'SOPClassUID');
      assert.equal(
        meta.PhotometricInterpretation,
        tags.PhotometricInterpretation,
        'PhotometricInterpretation'
      );
      assert.equal(meta.BitsAllocated, tags.BitsAllocated, 'BitsAllocated');
      assert.equal(meta.BitsStored, tags.BitsStored, 'BitsStored');
      assert.equal(meta.HighBit, tags.HighBit, 'HighBit');
      assert.equal(
        meta.PixelRepresentation, tags.PixelRepresentation,
        'PixelRepresentation'
      );
      assert.equal(meta.StudyInstanceUID, tags.StudyInstanceUID,
        'StudyInstanceUID');
      assert.equal(meta.SeriesInstanceUID, tags.SeriesInstanceUID,
        'SeriesInstanceUID');
      assert.equal(meta.PatientID, tags.PatientID, 'PatientID');
      assert.equal(meta.numberOfFiles, 1, 'numberOfFiles');
    });

    test('create: length unit is mm when PixelSpacing is present', () => {
      assert.equal(image.getMeta().lengthUnit, 'unit.mm', 'length unit is mm');
    });

    test('create: default RSI (slope=1, intercept=0) when no rescale tags',
      () => {
        const rsi = image.getRescaleSlopeAndIntercept();
        assert.equal(rsi.getSlope(), 1, 'default slope is 1');
        assert.equal(rsi.getIntercept(), 0, 'default intercept is 0');
      }
    );

    test('create: no window presets when no window tags', () => {
      assert.equal(
        image.getMeta().windowPresets, undefined, 'no window presets'
      );
    });

    test('create: pixel buffer values are preserved', () => {
      const imageBuffer = image.getBuffer();
      assert.equal(imageBuffer[0], buffer[0], 'first pixel matches');
      assert.equal(
        imageBuffer[buffer.length - 1],
        buffer[buffer.length - 1],
        'last pixel matches'
      );
    });

    test('create: SOPInstanceUID used as frame UID', () => {
      assert.ok(
        image.includesImageUid(tags.SOPInstanceUID),
        'SOPInstanceUID is in image UIDs'
      );
    });

  });

  // expected geometry per data structure: number of slices (z) and
  // number of time points (undefined if no time dimension)
  const structureExpectations = {
    // frames without per-frame position: stacked along time
    multiframe: {z: 1, time: 3},
    // frames with per-frame position (frames3D): a genuine z-stack
    // from a single file
    multiframeMultiSlice: {z: 5},
    // one file per slice, combined with appendSlice along z
    multipleSingleSlice: {z: 5},
    // files sharing one position but with a different
    // TemporalPositionIdentifier: appendSlice grows a time dimension
    multipleSingleFrame: {z: 1, time: 3},
    // one z-stack file per time point, combined with appendVolume
    multipleSingleFrameMultiSlice: {z: 5, time: 3}
  };

  const structureCases = [];
  for (const testCase of creationCases) {
    for (const [key, structure] of Object.entries(dataStructures)) {
      structureCases.push({
        label: `${structure.name} - ${testCase.name} ${testCase.syntax}`,
        testCase,
        structure,
        expected: structureExpectations[key]
      });
    }
  }

  // build an image from the files of a data structure, the way the app
  // assembles a series (see DataController): one Image per file via
  // ImageFactory, combined with appendVolume if the file image has more
  // than one slice, appendSlice otherwise.
  describe.each(structureCases)('$label', ({testCase, structure, expected}) => {
    const tags = testCase.config.tags;

    let image;
    let fileElementsList;

    beforeAll(() => {
      fileElementsList = getStructureElementsList(
        testCase.config, testCase.syntax, structure);
      const numberOfFiles = fileElementsList.length;

      const factory = new ImageFactory();
      for (const elements of fileElementsList) {
        factory.checkElements(elements);
        const fileImage = factory.create(
          elements, elements['7FE00010'].value, numberOfFiles);
        if (typeof image === 'undefined') {
          image = fileImage;
        } else if (fileImage.getGeometry().getSize().get(2) > 1) {
          image.appendVolume(fileImage);
        } else {
          image.appendSlice(fileImage);
        }
      }
    });

    test('generates the structure number of files', () => {
      assert.equal(
        fileElementsList.length, getStructureNumberOfFiles(structure),
        'number of files');
    });

    test('geometry size', () => {
      const size = image.getGeometry().getSize();
      assert.equal(size.get(0), tags.Columns, 'columns');
      assert.equal(size.get(1), tags.Rows, 'rows');
      assert.equal(size.get(2), expected.z, 'z size');
      if (typeof expected.time === 'undefined') {
        assert.equal(size.length(), 3, 'no time dimension');
      } else {
        assert.equal(size.length(), 4, 'time dimension');
        assert.equal(size.get(3), expected.time, 'time size');
      }
    });

    test('origins are ordered along z with expected spacing', () => {
      const origins = image.getGeometry().getOrigins();
      assert.equal(origins.length, expected.z, 'one origin per slice');
      for (let i = 0; i < expected.z; ++i) {
        assert.deepEqual(
          origins[i].getValues(), [0, 0, i], `slice ${i} origin`);
      }
    });

    test('meta numberOfFiles matches the number of files', () => {
      assert.equal(
        image.getMeta().numberOfFiles, fileElementsList.length,
        'numberOfFiles');
    });

    test('pixel buffer holds every file with distinct content', () => {
      const fileBuffers = fileElementsList.map(
        (elements) => Array.from(elements['7FE00010'].value));
      assert.deepEqual(
        Array.from(image.getBuffer()), fileBuffers.flat(),
        'buffer is the concatenation of the file buffers');

      // sanity check the generated data actually varies, along z or
      // time, otherwise the check above would not detect a mix-up
      const sliceSize = tags.Rows * tags.Columns;
      const buffer = image.getBuffer();
      const getSlice = (index) => Array.from(
        buffer.slice(index * sliceSize, (index + 1) * sliceSize));
      assert.notDeepEqual(getSlice(0), getSlice(1), 'slices 0 and 1 differ');
      if (expected.z > 1 && typeof expected.time !== 'undefined') {
        assert.notDeepEqual(
          getSlice(0), getSlice(expected.z),
          'slice 0 of time 0 and 1 differ');
      }
    });

    test('each file SOPInstanceUID is included as an image UID', () => {
      for (const elements of fileElementsList) {
        const uid = elements['00080018'].value[0];
        assert.ok(image.includesImageUid(uid), `${uid} included`);
      }
    });

  });

});
