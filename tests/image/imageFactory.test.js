import {describe, beforeAll, afterAll, test, assert, vi} from 'vitest';
import {
  ImageFactory,
  eraseRegions
} from '../../src/image/imageFactory.js';
import {Geometry} from '../../src/image/geometry.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {MaskImage} from '../../src/image/maskImage.js';
import {Point3D} from '../../src/math/point.js';
import {
  dataStructures,
  getStructureBuffers,
  getStructureElementsList,
  getStructureNumberOfFiles,
  singleSliceStructure,
  unsortedMultiframeMultiSliceStructure,
  unsortedMultiframeMultiVolumeStructure,
  unsortedMultiframeMultiVolumeBValueStructure
} from '../../dev/dicom/dataStructures.js';
import {defaultPatientInfo} from '../../dev/dicom/dicomGenerator.js';
import {logger} from '../../src/utils/logger.js';
import {getAnyPixelDataElement} from '../../src/dicom/dicomTag.js';
import {
  DicomParser,
  getSyntaxDecompressionName
} from '../../src/dicom/dicomParser.js';
import {DicomWriter} from '../../src/dicom/dicomWriter.js';
import {DataElement} from '../../src/dicom/dataElement.js';
import {transferSyntaxKeywords} from '../../src/dicom/dictionary.js';
import {JpegImage} from '../../src/decoders/pdfjs/jpg.js';
import {JpxImage} from '../../src/decoders/pdfjs/jpx.js';
import {RleDecoder} from '../../src/decoders/dwv/rle.js';

import syntheticData from '/tests/data/synthetic-img.json';
import bbmri53323851 from '/tests/data/bbmri-53323851.dcm?inline';
import dicompylerCt from '/tests/data/dicompyler-ct.0.dcm?inline';
import gdcmUsRgbEpicard from '/tests/data/gdcm-US-RGB-8-epicard.dcm?inline';
import gdcmUsRgbEsopecho from '/tests/data/gdcm-US-RGB-8-esopecho.dcm?inline';
import multiframeTest1 from '/tests/data/multiframe-test1.dcm?inline';
import leadtoolsJpegGrey from
  '/tests/data/leadtools-8BitsJpegLossyGrayScale.dcm?inline';
import leadtoolsRle8 from
  '/tests/data/leadtools-flowers-8-mono2-rle.dcm?inline';
import nemaUsJ2ki from '/tests/data/nema-us1_j2ki.dcm?inline';

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
    let sopInstanceUid;

    beforeAll(() => {
      const elements = getStructureElementsList(
        config, '1.2.840.10008.1.2.1', singleSliceStructure)[0];
      buffer = getAnyPixelDataElement(elements).value;
      // SOPInstanceUID may be generated (not in the config)
      sopInstanceUid = elements['00080018'].value[0];

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
      assert.equal(meta.PatientID, defaultPatientInfo.PatientID, 'PatientID');
      assert.equal(meta.sliceCapacity, 1, 'sliceCapacity');
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
        image.includesImageUid(sopInstanceUid),
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
    multipleMultiframeMultiSlice: {z: 5, time: 3}
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

    test('meta sliceCapacity is the total number of frames', () => {
      const numberOfFrames = typeof structure.numberOfFrames !== 'undefined'
        ? structure.numberOfFrames : 1;
      assert.equal(
        image.getMeta().sliceCapacity,
        fileElementsList.length * numberOfFrames,
        'sliceCapacity');
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
        assert.deepEqual(
          geometry.getInitialTime(), {id: {value: f}}, `frame ${f} time`);
        assert.equal(
          image.getMeta().sliceCapacity, 2 * numberOfFrames,
          `frame ${f} sliceCapacity is the total number of frames`);
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
      buffer = getAnyPixelDataElement(elements).value;
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
          image.getMeta().sliceCapacity, order.length,
          `frame ${f} sliceCapacity is the total number of frames`);
      }
    });

  });

  // several volumes in one file: frames share positions
  describe.each([
    unsortedMultiframeMultiVolumeStructure,
    unsortedMultiframeMultiVolumeBValueStructure
  ])('multi-volume frames: $name', (structure) => {
    const config = syntheticData[0];
    const tags = config.tags;
    const positions = structure.genOptions.framePositionOrder;
    // volume 0 is the lowest TemporalPositionIndex or b-value
    const volumes = [1, 1, 0, 0];
    // the frame time is the frame TemporalPositionIndex or b-value
    const isBValue = typeof structure.genOptions.frameBValues !== 'undefined';
    const volumeIds = isBValue
      ? structure.genOptions.frameBValues
      : structure.genOptions.frameTemporalPositions;
    const volumeIdInfo = isBValue
      ? {source: 'DiffusionBValue', tagKey: '00189087', unit: 'unit.smm2'}
      : {source: 'TemporalPositionIndex', tagKey: '00209128'};
    const getVolumeId = value => ({id: {...volumeIdInfo, value}});
    const numberOfFrames = structure.numberOfFrames;
    const numberOfSlices = 2;

    let elements;
    let buffer;
    let frameSize;
    let expectedBuffer;

    beforeAll(() => {
      elements = getStructureElementsList(
        config, '1.2.840.10008.1.2.1', structure)[0];
      buffer = getAnyPixelDataElement(elements).value;
      frameSize = buffer.length / numberOfFrames;
      // frames moved to their (volume, slice) slot
      expectedBuffer = buffer.slice();
      for (let f = 0; f < numberOfFrames; ++f) {
        expectedBuffer.set(
          buffer.subarray(f * frameSize, (f + 1) * frameSize),
          (volumes[f] * numberOfSlices + positions[f]) * frameSize);
      }
    });

    test('frame image: frame position and volume id as time', () => {
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
        assert.deepEqual(
          geometry.getInitialTime(), getVolumeId(volumeIds[f]),
          `frame ${f} time`);
        assert.equal(
          image.getMeta().sliceCapacity, numberOfFrames,
          `frame ${f} sliceCapacity is the total number of frames`);
      }
    });

    test(
      'frames image: slices and volumes - ' +
      '#DWV-REQ-IO-07-001 Load multi-volume data',
      () => {
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
        assert.deepEqual(
          geometry.getVolumeIds(),
          [...new Set(volumeIds)].sort((a, b) => a - b)
            .map(getVolumeId),
          'volume ids');
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
    const structure = structuredClone(unsortedMultiframeMultiVolumeStructure);
    delete structure.genOptions.frameTemporalPositions;
    const elements = getStructureElementsList(
      config, '1.2.840.10008.1.2.1', structure)[0];
    const buffer = elements['7FE00010'].value;
    const numberOfFrames = structure.numberOfFrames;
    const frameSize = buffer.length / numberOfFrames;
    for (let f = 0; f < numberOfFrames; ++f) {
      const image = new ImageFactory().create(
        elements, buffer.subarray(f * frameSize, (f + 1) * frameSize), 1, f);
      assert.deepEqual(
        image.getGeometry().getInitialTime(), {id: {value: f}},
        `frame ${f} time`);
    }
    warnSpy.mockRestore();
  });

});

// ---------------------------------------------------------------------------
// Pixel anonymisation: eraseRegions and ImageFactory.toDicom
// ---------------------------------------------------------------------------

/**
 * Convert a base64 data url (as imported with '?inline') to a buffer.
 *
 * @param {string} str The data url.
 * @returns {ArrayBuffer} The buffer.
 */
function dataUrlToArrayBuffer(str) {
  const bytes = atob(str.split(';base64,')[1]);
  const res = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; ++i) {
    res[i] = bytes.charCodeAt(i);
  }
  return res.buffer;
}

/**
 * Parse a DICOM buffer.
 *
 * @param {ArrayBuffer} buffer The DICOM buffer.
 * @returns {object} The data elements.
 */
function parseDicom(buffer) {
  const parser = new DicomParser();
  parser.parse(buffer);
  return parser.getDicomElements();
}

/**
 * Cast a decoded buffer as the decoder workers do
 * (see src/decoders/*.worker.js).
 *
 * @param {object} decoded The decoded buffer.
 * @param {object} meta The pixel meta: {bitsAllocated, isSigned}.
 * @returns {object} The typed array.
 */
function castDecoded(decoded, meta) {
  let res;
  if (meta.bitsAllocated === 8) {
    res = meta.isSigned ? new Int8Array(decoded) : new Uint8Array(decoded);
  } else {
    res = meta.isSigned ? new Int16Array(decoded) : new Uint16Array(decoded);
  }
  return res;
}

/**
 * Get the frame buffers of data elements, decoded as the decoder
 * workers do for compressed data (no web worker in tests).
 *
 * @param {object} elements The data elements.
 * @returns {object[]} The list of frame buffers.
 */
function getFrameBuffers(elements) {
  const pixelElement = getAnyPixelDataElement(elements);
  const algoName = getSyntaxDecompressionName(elements['00020010'].value[0]);
  if (typeof algoName === 'undefined') {
    const buffer = pixelElement.value[0];
    let numberOfFrames = 1;
    if (typeof elements['00280008'] !== 'undefined') {
      numberOfFrames = parseInt(elements['00280008'].value[0], 10);
    }
    const frameSize = buffer.length / numberOfFrames;
    const frames = [];
    for (let f = 0; f < numberOfFrames; ++f) {
      frames.push(buffer.subarray(f * frameSize, (f + 1) * frameSize));
    }
    return frames;
  }
  const meta = {
    bitsAllocated: elements['00280100'].value[0],
    isSigned: elements['00280103'].value[0] === 1,
    sliceSize: elements['00280010'].value[0] * elements['00280011'].value[0],
    samplesPerPixel: elements['00280002'].value[0],
    planarConfiguration: elements['00280006']?.value[0]
  };
  return pixelElement.value.map((fragment) => {
    let res;
    if (algoName === 'rle') {
      res = new RleDecoder().decode(fragment, meta.bitsAllocated,
        meta.isSigned, meta.sliceSize, meta.samplesPerPixel,
        meta.planarConfiguration);
    } else if (algoName === 'jpeg-baseline') {
      const decoder = new JpegImage();
      decoder.parse(fragment);
      res = castDecoded(decoder.getData(decoder.width, decoder.height), meta);
    } else if (algoName === 'jpeg2000') {
      const decoder = new JpxImage();
      decoder.parse(fragment);
      res = castDecoded(decoder.tiles[0].items, meta);
    } else {
      throw new Error(`No test decoder for ${algoName}`);
    }
    return res;
  });
}

/**
 * Create the image of data elements the way the app does (see
 * DicomBufferToData and DataController): at once for single frame
 * data, frame by frame for multi-frame data.
 *
 * @param {object} elements The data elements.
 * @param {object[]} [frames] Optional frame buffers, defaults to
 *   the decoded pixel data of the elements.
 * @returns {object} The image.
 */
function createImage(elements, frames) {
  if (typeof frames === 'undefined') {
    frames = getFrameBuffers(elements);
  }
  const factory = new ImageFactory();
  if (frames.length === 1) {
    return factory.create(elements, frames[0], 1);
  }
  let image;
  for (let f = 0; f < frames.length; ++f) {
    const frameImage = factory.create(elements, frames[f], 1, f);
    if (typeof image === 'undefined') {
      image = frameImage;
    } else {
      image.appendSlice(frameImage);
    }
  }
  return image;
}

/**
 * Write data elements and parse the result.
 *
 * @param {object} elements The data elements.
 * @returns {object} The parsed data elements.
 */
function writeAndParse(elements) {
  return parseDicom(new DicomWriter().getBuffer(elements));
}

/**
 * Get the expected buffer of an erased image, computed pixel by pixel.
 *
 * @param {object} image The image before erasing.
 * @param {object[]} regions The erased regions.
 * @returns {number[]} The expected buffer values.
 */
function getExpectedErasedBuffer(image, regions) {
  const size = image.getGeometry().getSize();
  const columns = size.get(0);
  const rows = size.get(1);
  const sliceSize = columns * rows;
  const nComp = image.getNumberOfComponents();
  const isPlanar = image.getPlanarConfiguration() === 1;
  const numberOfSlices = size.getTotalSize() / sliceSize;
  const isErased = (i, j) => regions.some((r) =>
    i >= r.x && i < r.x + r.width && j >= r.y && j < r.y + r.height);
  const res = Array.from(image.getBuffer());
  for (let s = 0; s < numberOfSlices; ++s) {
    for (let j = 0; j < rows; ++j) {
      for (let i = 0; i < columns; ++i) {
        if (!isErased(i, j)) {
          continue;
        }
        for (let c = 0; c < nComp; ++c) {
          const offset = isPlanar
            ? s * sliceSize * nComp + c * sliceSize + j * columns + i
            : (s * sliceSize + j * columns + i) * nComp + c;
          res[offset] = 0;
        }
      }
    }
  }
  return res;
}

/**
 * Get test regions for an image: one across the centre and one
 * touching the bottom right corner.
 *
 * @param {object} image The image.
 * @returns {object[]} The regions.
 */
function getTestRegions(image) {
  const size = image.getGeometry().getSize();
  const columns = size.get(0);
  const rows = size.get(1);
  return [
    {
      x: Math.floor(columns / 4),
      y: Math.floor(rows / 2),
      width: Math.floor(columns / 2),
      height: 3
    },
    {x: columns - 5, y: rows - 2, width: 5, height: 2}
  ];
}

/**
 * Count the different values of two arrays (faster than a deep
 * equal for large buffers).
 *
 * @param {object} array0 The first array.
 * @param {object} array1 The second array.
 * @returns {number} The number of different values, or -1 for
 *   arrays of different lengths.
 */
function countDiffs(array0, array1) {
  if (array0.length !== array1.length) {
    return -1;
  }
  let count = 0;
  for (let i = 0; i < array0.length; ++i) {
    if (array0[i] !== array1[i]) {
      ++count;
    }
  }
  return count;
}

const explicitLE = transferSyntaxKeywords.ExplicitVRLittleEndian;

// files to anonymise: the expected output transfer syntax,
// photometric interpretation and planar configuration
const anonymisationCases = [
  {
    name: 'MR, explicit VR little endian',
    getBuffer: () => dataUrlToArrayBuffer(bbmri53323851),
    syntax: explicitLE,
    photometric: 'MONOCHROME2'
  },
  {
    name: 'CT signed, implicit VR little endian',
    getBuffer: () => dataUrlToArrayBuffer(dicompylerCt),
    syntax: transferSyntaxKeywords.ImplicitVRLittleEndian,
    photometric: 'MONOCHROME2'
  },
  {
    name: 'US RGB planar, explicit VR big endian',
    getBuffer: () => dataUrlToArrayBuffer(gdcmUsRgbEpicard),
    syntax: transferSyntaxKeywords.ExplicitVRBigEndian,
    photometric: 'RGB',
    planarConfiguration: 1
  },
  {
    name: 'US RGB, explicit VR little endian',
    getBuffer: () => dataUrlToArrayBuffer(gdcmUsRgbEsopecho),
    syntax: explicitLE,
    photometric: 'RGB',
    planarConfiguration: 0,
    warning: 'Use pixel aspect ratio as spacing'
  },
  {
    name: 'MR multi-frame',
    getBuffer: () => dataUrlToArrayBuffer(multiframeTest1),
    syntax: explicitLE,
    photometric: 'MONOCHROME2'
  },
  {
    name: 'RLE',
    getBuffer: () => dataUrlToArrayBuffer(leadtoolsRle8),
    syntax: explicitLE,
    photometric: 'MONOCHROME2'
  },
  {
    name: 'synthetic RGB planar RLE',
    getBuffer: () => getStructureBuffers(
      syntheticData.find((config) => config.name === 'test-img-02'),
      transferSyntaxKeywords.RLELossless,
      singleSliceStructure)[0],
    syntax: explicitLE,
    photometric: 'RGB',
    planarConfiguration: 1
  },
  {
    name: 'JPEG baseline',
    getBuffer: () => dataUrlToArrayBuffer(leadtoolsJpegGrey),
    syntax: explicitLE,
    photometric: 'MONOCHROME2',
    lossy: true
  },
  {
    name: 'JPEG 2000 YBR_ICT',
    getBuffer: () => dataUrlToArrayBuffer(nemaUsJ2ki),
    syntax: explicitLE,
    photometric: 'RGB',
    planarConfiguration: 0
  }
];

describe('eraseRegions and toDicom', () => {

  describe.each(anonymisationCases)('$name', (testCase) => {
    let elements;
    let elementsCopy;
    let image;
    let erasedImage;
    let regions;
    let tags;
    let parsed;
    let warnSpy;
    const warnings = new Set();

    beforeAll(() => {
      warnSpy = vi.spyOn(logger, 'warn').mockImplementation(
        (message) => warnings.add(message));
      elements = parseDicom(testCase.getBuffer());
      elementsCopy = structuredClone(elements);
      image = createImage(elements);
      erasedImage = image.clone();
      regions = getTestRegions(image);
      tags = eraseRegions(erasedImage, regions);
      // the writer modifies its input: write the output once
      parsed = writeAndParse(
        new ImageFactory().toDicom(erasedImage, elements, tags));
    });

    afterAll(() => {
      warnSpy.mockRestore();
    });

    test('eraseRegions: region pixels are 0, others unchanged', () => {
      const expected = getExpectedErasedBuffer(image, regions);
      assert.ok(countDiffs(image.getBuffer(), expected) > 0,
        'regions were not 0');
      assert.equal(countDiffs(erasedImage.getBuffer(), expected), 0,
        'erased buffer');
    });

    test('eraseRegions: returns the clean pixel data tags', () => {
      assert.deepEqual(tags, {
        BurnedInAnnotation: 'NO',
        DeidentificationMethodCodeSequence: {
          value: [{
            CodeValue: '113101',
            CodingSchemeDesignator: 'DCM',
            CodeMeaning: 'Clean Pixel Data Option'
          }]
        }
      }, 'tags');
    });

    test('toDicom: round trip gives the erased image', () => {
      const reloaded = createImage(parsed);
      assert.deepEqual(
        reloaded.getGeometry().getSize().getValues(),
        erasedImage.getGeometry().getSize().getValues(), 'size');
      assert.equal(
        reloaded.getBuffer().constructor, erasedImage.getBuffer().constructor,
        'buffer type');
      assert.equal(
        countDiffs(reloaded.getBuffer(), erasedImage.getBuffer()), 0,
        'buffer');
      assert.equal(
        reloaded.getPhotometricInterpretation(),
        erasedImage.getPhotometricInterpretation(),
        'photometric interpretation');
    });

    test('toDicom: transfer syntax and pixel encoding tags', () => {
      assert.equal(parsed['00020010'].value[0], testCase.syntax,
        'transfer syntax');
      assert.equal(parsed['00280004'].value[0], testCase.photometric,
        'photometric interpretation');
      const planarConfiguration = testCase.planarConfiguration ??
        elements['00280006']?.value[0];
      assert.equal(parsed['00280006']?.value[0], planarConfiguration,
        'planar configuration');
      // SamplesPerPixel, Rows, Columns, BitsAllocated, BitsStored,
      // HighBit and PixelRepresentation
      const keys = [
        '00280002',
        '00280010',
        '00280011',
        '00280100',
        '00280101',
        '00280102',
        '00280103'
      ];
      for (const key of keys) {
        assert.equal(parsed[key].value[0], elements[key].value[0], key);
      }
      const pixelElement = parsed['7FE00010'];
      assert.ok(!pixelElement.undefinedLength, 'native pixel data');
      assert.equal(pixelElement.value.length, 1, 'one pixel buffer');
      const lossy = parsed['00282110']?.value[0];
      if (testCase.lossy) {
        assert.equal(lossy, '01', 'lossy image compression');
      } else {
        assert.equal(lossy, elements['00282110']?.value[0],
          'unchanged lossy image compression');
      }
    });

    test('toDicom: extra tags are merged', () => {
      assert.equal(parsed['00280301'].value[0], 'NO', 'burned in annotation');
      const codeItem = parsed['00120064'].value[0];
      assert.equal(codeItem['00080100'].value[0], '113101', 'code value');
      assert.equal(codeItem['00080102'].value[0], 'DCM', 'code scheme');
    });

    test('toDicom and write: input elements are not modified', () => {
      new DicomWriter().getBuffer(
        new ImageFactory().toDicom(erasedImage, elements, tags));
      assert.deepEqual(elements, elementsCopy, 'elements');
    });

    test('only logs the expected warning', () => {
      const expected = typeof testCase.warning !== 'undefined'
        ? [testCase.warning] : [];
      assert.deepEqual([...warnings], expected, 'warnings');
    });
  });

  // frames with positions not in spatial or volume order: the image
  // slices are sorted, the output frames must stay in file order
  describe.each([
    unsortedMultiframeMultiSliceStructure,
    unsortedMultiframeMultiVolumeStructure,
    unsortedMultiframeMultiVolumeBValueStructure
  ])('unsorted frames: $name', (structure) => {
    let elements;

    beforeAll(() => {
      elements = parseDicom(getStructureBuffers(
        syntheticData[0], explicitLE, structure)[0]);
    });

    test('toDicom: frames in file order', () => {
      const image = createImage(elements);
      const outElements = new ImageFactory().toDicom(image, elements);
      assert.notDeepEqual(
        Array.from(image.getBuffer()),
        Array.from(elements['7FE00010'].value[0]),
        'image slices are not in file order');
      assert.deepEqual(
        Array.from(outElements['7FE00010'].value[0]),
        Array.from(elements['7FE00010'].value[0]),
        'pixel data in file order');
    });

    test('toDicom: frames appended in reverse order', () => {
      const frames = getFrameBuffers(elements);
      const factory = new ImageFactory();
      let image;
      for (let f = frames.length - 1; f >= 0; --f) {
        const frameImage = factory.create(elements, frames[f], 1, f);
        if (typeof image === 'undefined') {
          image = frameImage;
        } else {
          image.appendSlice(frameImage);
        }
      }
      const outElements = factory.toDicom(image, elements);
      assert.deepEqual(
        Array.from(outElements['7FE00010'].value[0]),
        Array.from(elements['7FE00010'].value[0]),
        'pixel data in file order');
    });

    test('eraseRegions and toDicom: round trip', () => {
      const image = createImage(elements);
      const tags = eraseRegions(image, getTestRegions(image));
      const parsed = writeAndParse(
        new ImageFactory().toDicom(image, elements, tags));
      assert.deepEqual(
        Array.from(createImage(parsed).getBuffer()),
        Array.from(image.getBuffer()), 'buffer');
    });
  });

  describe('eraseRegions', () => {
    let elements;

    beforeAll(() => {
      elements = parseDicom(dataUrlToArrayBuffer(bbmri53323851));
    });

    test('fires imagecontentchange', () => {
      const image = createImage(elements);
      const handler = vi.fn();
      image.addEventListener('imagecontentchange', handler);
      eraseRegions(image, [{x: 1, y: 2, width: 3, height: 4}]);
      assert.equal(handler.mock.calls.length, 1, 'one event');
    });

    test('whole image region', () => {
      const image = createImage(elements);
      eraseRegions(image, [{x: 0, y: 0, width: 256, height: 256}]);
      assert.ok(image.getBuffer().every((value) => value === 0), 'all 0');
    });

    test.each([
      {name: 'no region', regions: []},
      {name: 'not an array', regions: {x: 0, y: 0, width: 1, height: 1}},
      {name: 'missing value', regions: [{x: 0, y: 0, width: 1}]},
      {name: 'non integer', regions: [{x: 0.5, y: 0, width: 1, height: 1}]},
      {name: 'string value', regions: [{x: '0', y: 0, width: 1, height: 1}]},
      {name: 'zero width', regions: [{x: 0, y: 0, width: 0, height: 1}]},
      {name: 'negative x', regions: [{x: -1, y: 0, width: 2, height: 1}]},
      {
        name: 'partly outside',
        regions: [
          {x: 0, y: 0, width: 1, height: 1},
          {x: 250, y: 0, width: 10, height: 1}
        ]
      },
      {name: 'outside', regions: [{x: 0, y: 256, width: 1, height: 1}]}
    ])('invalid regions: $name', ({regions}) => {
      const image = createImage(elements);
      const before = Array.from(image.getBuffer());
      assert.throws(() => eraseRegions(image, regions), Error);
      assert.deepEqual(
        Array.from(image.getBuffer()), before, 'image not modified');
    });

    test('mask image throws', () => {
      const geometry = new Geometry(
        [new Point3D(0, 0, 0)], new Size([2, 2, 1]), new Spacing([1, 1, 1]));
      const mask = new MaskImage(geometry, new Uint8Array(4), ['0']);
      assert.throws(
        () => eraseRegions(mask, [{x: 0, y: 0, width: 1, height: 1}]),
        /Mask images are not supported/);
    });

    test('resampled image throws', () => {
      const image = createImage(elements);
      vi.spyOn(image, 'isResampled').mockReturnValue(true);
      assert.throws(
        () => eraseRegions(image, [{x: 0, y: 0, width: 1, height: 1}]),
        /Resampled images are not supported/);
    });

    test('incomplete image throws', () => {
      const mfElements = parseDicom(dataUrlToArrayBuffer(multiframeTest1));
      // first frame of 16
      const image = new ImageFactory().create(
        mfElements, getFrameBuffers(mfElements)[0], 1, 0);
      assert.throws(
        () => eraseRegions(image, [{x: 0, y: 0, width: 1, height: 1}]),
        /not complete/);
    });
  });

  describe('toDicom', () => {
    let elements;
    let image;

    beforeAll(() => {
      elements = parseDicom(dataUrlToArrayBuffer(bbmri53323851));
      image = createImage(elements);
    });

    test('extra tags cannot change the pixel encoding', () => {
      const outElements = new ImageFactory().toDicom(image, elements, {
        PatientName: 'Anonymous',
        TransferSyntaxUID: transferSyntaxKeywords.JPEGBaseline8Bit,
        PhotometricInterpretation: 'MONOCHROME1'
      });
      assert.deepEqual(outElements['00100010'].value, ['Anonymous'],
        'patient name');
      assert.deepEqual(outElements['00020010'].value, [explicitLE],
        'transfer syntax');
      assert.deepEqual(outElements['00280004'].value, ['MONOCHROME2'],
        'photometric interpretation');
    });

    test('pixel value range and encapsulation tags are removed', () => {
      const getElement = (vr, value) => {
        const element = new DataElement(vr);
        element.value = value;
        return element;
      };
      const inElements = {
        ...elements,
        '00280106': getElement('US', [10]),
        '00280107': getElement('US', [1000]),
        '00280108': getElement('US', [0]),
        '00280109': getElement('US', [2000]),
        '7FE00003': getElement('UV', [123])
      };
      const outElements = new ImageFactory().toDicom(image, inElements);
      const removedKeys = [
        '00280106',
        '00280107',
        '00280108',
        '00280109',
        '7FE00003'
      ];
      for (const key of removedKeys) {
        assert.equal(outElements[key], undefined, key);
      }
    });

    test('merged data elements throw', () => {
      const merged = {...elements, mergeId: ['1', '2']};
      assert.throws(
        () => new ImageFactory().toDicom(image, merged),
        /several files/);
    });

    test('image of several files throws', () => {
      const elementsList = getStructureBuffers(
        syntheticData[0], explicitLE, dataStructures.multipleSingleSlice)
        .map(parseDicom);
      let seriesImage;
      for (const fileElements of elementsList) {
        const sliceImage = new ImageFactory().create(
          fileElements, getFrameBuffers(fileElements)[0],
          elementsList.length);
        if (typeof seriesImage === 'undefined') {
          seriesImage = sliceImage;
        } else {
          seriesImage.appendSlice(sliceImage);
        }
      }
      assert.throws(
        () => new ImageFactory().toDicom(seriesImage, elementsList[0]),
        /single file/);
    });

    test('elements of another image throw', () => {
      const otherElements = parseDicom(dataUrlToArrayBuffer(dicompylerCt));
      assert.throws(
        () => new ImageFactory().toDicom(image, otherElements),
        Error);
    });

    test('unsupported photometric interpretation throws', () => {
      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
      const ybrElements = parseDicom(dataUrlToArrayBuffer(gdcmUsRgbEsopecho));
      const ybrImage = createImage(ybrElements);
      assert.ok(warnSpy.mock.calls.length !== 0, 'aspect ratio warning');
      warnSpy.mockRestore();
      const photometric = new DataElement('CS');
      photometric.value = ['YBR_FULL_422'];
      assert.throws(
        () => new ImageFactory().toDicom(ybrImage,
          {...ybrElements, '00280004': photometric}),
        /Unsupported PhotometricInterpretation/);
    });
  });

});
