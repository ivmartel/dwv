import {describe, beforeAll, test, assert, vi} from 'vitest';
import {ImageFactory} from '../../src/image/imageFactory.js';
import {Geometry} from '../../src/image/geometry.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Point3D} from '../../src/math/point.js';
import {
  dataStructures,
  getStructureElementsList,
  getStructureNumberOfFiles,
  singleSliceStructure,
  unsortedMultiframeMultiSliceStructure,
  multiframeMultiVolumeStructure,
  multiframeMultiVolumeBValueStructure
} from '../../dev/dicom/dataStructures.js';
import {logger} from '../../src/utils/logger.js';

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

/**
 * Create the image of a file frame by frame, the way loaded data is
 * (see DicomBufferToData and DataController): one image per frame,
 * appended to the first one. Single frame data is created at once.
 *
 * @param {ImageFactory} factory The image factory.
 * @param {object} elements The file data elements.
 * @param {number} numberOfFiles The number of files.
 * @param {number} numberOfFrames The number of frames of the file.
 * @param {object} [image] Optional image to append the frames to.
 * @returns {object} The image.
 */
function createFramesImage(
  factory, elements, numberOfFiles, numberOfFrames, image) {
  const buffer = elements['7FE00010'].value;
  const frameSize = buffer.length / numberOfFrames;
  for (let f = 0; f < numberOfFrames; ++f) {
    let frameImage;
    if (numberOfFrames === 1) {
      frameImage = factory.create(elements, buffer, numberOfFiles);
    } else {
      frameImage = factory.create(
        elements,
        buffer.subarray(f * frameSize, (f + 1) * frameSize),
        numberOfFiles,
        f
      );
    }
    if (typeof image === 'undefined') {
      image = frameImage;
    } else {
      image.appendSlice(frameImage);
    }
  }
  return image;
}

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
    // frames with per-frame position and temporal position: several
    // volumes from a single file
    multiframeMultiVolume: {z: 5, time: 2},
    // one file per slice, combined with appendSlice along z
    multipleSingleSlice: {z: 5},
    // files sharing one position but with a different
    // TemporalPositionIdentifier: appendSlice grows a time dimension
    multipleSingleFrame: {z: 1, time: 3},
    // one z-stack file per time point, frames combined with appendSlice
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
  // assembles a series (see DataController): one Image per frame via
  // ImageFactory (multi-frame data is loaded frame by frame), combined
  // with appendSlice.
  describe.each(structureCases)('$label', ({testCase, structure, expected}) => {
    const tags = testCase.config.tags;

    let image;
    let fileElementsList;

    beforeAll(() => {
      fileElementsList = getStructureElementsList(
        testCase.config, testCase.syntax, structure);
      const numberOfFiles = fileElementsList.length;

      const factory = new ImageFactory();
      const numberOfFrames = typeof structure.numberOfFrames !== 'undefined'
        ? structure.numberOfFrames : 1;
      for (const elements of fileElementsList) {
        factory.checkElements(elements);
        image = createFramesImage(
          factory, elements, numberOfFiles, numberOfFrames, image);
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

    test('meta numberOfFiles is the total number of frames', () => {
      const numberOfFrames = typeof structure.numberOfFrames !== 'undefined'
        ? structure.numberOfFrames : 1;
      assert.equal(
        image.getMeta().numberOfFiles,
        fileElementsList.length * numberOfFrames,
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

  // frames without positions: time frames
  describe('time frames', () => {
    const config = syntheticData[0];
    const tags = config.tags;
    const structure = dataStructures.multiframe;

    test('frame image: one slice with the frame number as time', () => {
      const elements = getStructureElementsList(
        config, '1.2.840.10008.1.2.1', structure)[0];
      const buffer = elements['7FE00010'].value;
      const numberOfFrames = structure.numberOfFrames;
      const frameSize = buffer.length / numberOfFrames;
      for (let f = 0; f < numberOfFrames; ++f) {
        const image = new ImageFactory().create(
          elements, buffer.subarray(f * frameSize, (f + 1) * frameSize), 2, f);
        const geometry = image.getGeometry();
        assert.deepEqual(
          geometry.getSize().getValues(), [tags.Columns, tags.Rows, 1],
          `frame ${f} size`);
        assert.equal(geometry.getInitialTime(), f, `frame ${f} time`);
        assert.equal(
          image.getMeta().numberOfFiles, 2 * numberOfFrames,
          `frame ${f} numberOfFiles is the total number of frames`);
      }
    });

  });

  // frames with positions not in spatial order
  describe('unsorted frames', () => {
    const config = syntheticData[0];
    const tags = config.tags;
    const structure = unsortedMultiframeMultiSliceStructure;
    const order = structure.genOptions.framePositionOrder;

    let elements;
    let buffer;
    let sortedBuffer;

    beforeAll(() => {
      elements = getStructureElementsList(
        config, '1.2.840.10008.1.2.1', structure)[0];
      buffer = elements['7FE00010'].value;
      // frames moved to their spatial slot
      const frameSize = buffer.length / order.length;
      sortedBuffer = buffer.slice();
      for (let f = 0; f < order.length; ++f) {
        sortedBuffer.set(
          buffer.subarray(f * frameSize, (f + 1) * frameSize),
          order[f] * frameSize);
      }
    });

    test('frames image: origins are sorted', () => {
      const image = createFramesImage(
        new ImageFactory(), elements, 1, order.length);
      const origins = image.getGeometry().getOrigins();
      assert.equal(origins.length, order.length, 'one origin per frame');
      for (let i = 0; i < order.length; ++i) {
        assert.deepEqual(
          origins[i].getValues(), [0, 0, i], `slice ${i} origin`);
      }
    });

    test('frames image: buffer in spatial order', () => {
      const image = createFramesImage(
        new ImageFactory(), elements, 1, order.length);
      assert.deepEqual(
        Array.from(image.getBuffer()), Array.from(sortedBuffer),
        'sorted buffer');
    });

    test('frame image: one slice at the frame position', () => {
      const frameSize = buffer.length / order.length;
      for (let f = 0; f < order.length; ++f) {
        const image = new ImageFactory().create(
          elements, buffer.subarray(f * frameSize, (f + 1) * frameSize), 1, f);
        const geometry = image.getGeometry();
        assert.deepEqual(
          geometry.getSize().getValues(), [tags.Columns, tags.Rows, 1],
          `frame ${f} size`);
        assert.deepEqual(
          geometry.getOrigin().getValues(), [0, 0, order[f]],
          `frame ${f} origin`);
        assert.equal(
          image.getMeta().numberOfFiles, order.length,
          `frame ${f} numberOfFiles is the total number of frames`);
      }
    });

  });

  // several volumes in one file: frames share positions
  describe.each([
    multiframeMultiVolumeStructure,
    multiframeMultiVolumeBValueStructure
  ])('multi-volume frames: $name', (structure) => {
    const config = syntheticData[0];
    const tags = config.tags;
    const positions = structure.genOptions.framePositionOrder;
    // volume 0 is the lowest TemporalPositionIndex or b-value
    const volumes = [1, 1, 0, 0];
    const numberOfFrames = structure.numberOfFrames;
    const numberOfSlices = 2;

    let elements;
    let buffer;
    let frameSize;
    let expectedBuffer;

    beforeAll(() => {
      elements = getStructureElementsList(
        config, '1.2.840.10008.1.2.1', structure)[0];
      buffer = elements['7FE00010'].value;
      frameSize = buffer.length / numberOfFrames;
      // frames moved to their (volume, slice) slot
      expectedBuffer = buffer.slice();
      for (let f = 0; f < numberOfFrames; ++f) {
        expectedBuffer.set(
          buffer.subarray(f * frameSize, (f + 1) * frameSize),
          (volumes[f] * numberOfSlices + positions[f]) * frameSize);
      }
    });

    test('frame image: frame position and volume index as time', () => {
      for (let f = 0; f < numberOfFrames; ++f) {
        const image = new ImageFactory().create(
          elements, buffer.subarray(f * frameSize, (f + 1) * frameSize), 1, f);
        const geometry = image.getGeometry();
        assert.deepEqual(
          geometry.getSize().getValues(), [tags.Columns, tags.Rows, 1],
          `frame ${f} size`);
        assert.deepEqual(
          geometry.getOrigin().getValues(), [0, 0, positions[f]],
          `frame ${f} origin`);
        assert.equal(geometry.getInitialTime(), volumes[f], `frame ${f} time`);
        assert.equal(
          image.getMeta().numberOfFiles, numberOfFrames,
          `frame ${f} numberOfFiles is the total number of frames`);
      }
    });

    test('frames image: slices and volumes', () => {
      const image = createFramesImage(
        new ImageFactory(), elements, 1, numberOfFrames);
      const geometry = image.getGeometry();
      assert.deepEqual(
        geometry.getSize().getValues(),
        [tags.Columns, tags.Rows, numberOfSlices, 2],
        'size');
      const origins = geometry.getOrigins();
      assert.equal(origins.length, numberOfSlices, 'one origin per slice');
      for (let i = 0; i < numberOfSlices; ++i) {
        assert.deepEqual(
          origins[i].getValues(), [0, 0, i], `slice ${i} origin`);
      }
      assert.deepEqual(
        Array.from(image.getBuffer()), Array.from(expectedBuffer),
        'buffer in volume then spatial order');
    });

    test('frames image: append order does not matter', () => {
      const factory = new ImageFactory();
      let image;
      for (let f = numberOfFrames - 1; f >= 0; --f) {
        const frameImage = factory.create(
          elements, buffer.subarray(f * frameSize, (f + 1) * frameSize), 1, f);
        if (typeof image === 'undefined') {
          image = frameImage;
        } else {
          image.appendSlice(frameImage);
        }
      }
      assert.deepEqual(
        Array.from(image.getBuffer()), Array.from(expectedBuffer),
        'buffer in volume then spatial order');
    });

  });

  // duplicate positions without per-frame volume ids: time frames
  test('duplicate frame positions without volume ids', () => {
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
    const config = syntheticData[0];
    const structure = structuredClone(multiframeMultiVolumeStructure);
    delete structure.genOptions.frameTemporalPositions;
    const elements = getStructureElementsList(
      config, '1.2.840.10008.1.2.1', structure)[0];
    const buffer = elements['7FE00010'].value;
    const numberOfFrames = structure.numberOfFrames;
    const frameSize = buffer.length / numberOfFrames;
    for (let f = 0; f < numberOfFrames; ++f) {
      const image = new ImageFactory().create(
        elements, buffer.subarray(f * frameSize, (f + 1) * frameSize), 1, f);
      assert.equal(
        image.getGeometry().getInitialTime(), f, `frame ${f} time`);
    }
    warnSpy.mockRestore();
  });

});
