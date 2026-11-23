import {describe, test, assert, vi} from 'vitest';
import {DicomParser} from '../../src/dicom/dicomParser.js';
import {DataElement} from '../../src/dicom/dataElement.js';
import {DicomCode} from '../../src/dicom/dicomCode.js';
import {DicomWriter} from '../../src/dicom/dicomWriter.js';
import {logger} from '../../src/utils/logger.js';
import {custom} from '../../src/app/custom.js';
import {
  defaultPrivateBValueRules
} from '../../src/dicom/dicomVolume.js';
import {
  getElementsFromSimpleTagValues
} from '../../src/dicom/simpleTagValues.js';
import {
  createDerivedVolumeFromSR,
  getDerivedVolumeElements
} from '../../src/dicom/dicomDerivedVolume.js';

/**
 * Tests for the 'dicom/dicomDerivedVolume.js' file.
 */

/**
 * Parse a DICOM file.
 *
 * @param {ArrayBuffer} buffer The file.
 * @returns {Record<string, DataElement>} The data elements.
 */
function parseDerivedTestFile(buffer) {
  const parser = new DicomParser();
  parser.parse(buffer);
  return parser.getDicomElements();
}

/**
 * Create a small MR slice file (2x2 pixels) for the derived volume tests.
 *
 * @param {object} options The slice options.
 * @param {string} options.uid The SOP Instance UID.
 * @param {number} [options.z] The slice z position.
 * @param {string} [options.series] The Series Instance UID.
 * @param {number} [options.rows] The number of rows.
 * @param {number[]} [options.orientation] The image orientation.
 * @param {string} [options.frameOfReference] The frame of reference UID.
 * @param {number} [options.frames] The number of frames.
 * @param {number} [options.instanceNumber] The instance number.
 * @param {number} [options.temporalPosition] The temporal position
 *   identifier.
 * @returns {ArrayBuffer} The slice file.
 */
function createDerivedTestFile(options) {
  const rows = options.rows ?? 2;
  const frames = options.frames ?? 1;
  const tags = {
    TransferSyntaxUID: '1.2.840.10008.1.2.1',
    MediaStorageSOPClassUID: '1.2.840.10008.5.1.4.1.1.4',
    MediaStorageSOPInstanceUID: options.uid,
    SOPClassUID: '1.2.840.10008.5.1.4.1.1.4',
    SOPInstanceUID: options.uid,
    Modality: 'MR',
    PatientName: 'Derived^Test',
    SeriesInstanceUID: options.series ?? '1.2.3.100',
    SeriesDescription: 'Source',
    FrameOfReferenceUID: options.frameOfReference ?? '1.2.3.400',
    ImagePositionPatient: [0, 0, options.z ?? 0],
    ImageOrientationPatient: options.orientation ?? [1, 0, 0, 0, 1, 0],
    PixelSpacing: [1, 1],
    Rows: rows,
    Columns: 2,
    SamplesPerPixel: 1,
    PhotometricInterpretation: 'MONOCHROME2',
    BitsAllocated: 16,
    BitsStored: 16,
    HighBit: 15,
    PixelRepresentation: 0
  };
  if (frames > 1) {
    tags.NumberOfFrames = frames;
  }
  if (typeof options.instanceNumber !== 'undefined') {
    tags.InstanceNumber = options.instanceNumber;
  }
  if (typeof options.temporalPosition !== 'undefined') {
    tags.TemporalPositionIdentifier = options.temporalPosition;
    tags.NumberOfTemporalPositions = 22;
  }
  const elements = getElementsFromSimpleTagValues(tags);
  const pixels = new DataElement('OW');
  pixels.value = [new Uint16Array(rows * 2 * frames).fill(7)];
  elements['7FE00010'] = pixels;
  return new DicomWriter().getBuffer(elements);
}

/**
 * Create the data elements of a small MR slice, as a loaded file.
 *
 * @param {object} options The slice options, see createDerivedTestFile.
 * @returns {Record<string, DataElement>} The slice elements.
 */
function createDerivedTestSlice(options) {
  return parseDerivedTestFile(createDerivedTestFile(options));
}

/**
 * Write and parse data elements.
 *
 * @param {Record<string, DataElement>} elements The elements.
 * @returns {Record<string, DataElement>} The parsed elements.
 */
function writeReadDerivedTestElements(elements) {
  return parseDerivedTestFile(new DicomWriter().getBuffer(elements));
}

/**
 * Create the data elements of an SR listing images under a content item.
 *
 * @param {string} codeValue The long code value of the content item.
 * @param {string[]} uids The referenced SOP Instance UIDs.
 * @returns {Record<string, DataElement>} The SR elements.
 */
function createDerivedTestReport(codeValue, uids) {
  const code = (value, isLong) => ({
    value: [{
      [isLong ? 'LongCodeValue' : 'CodeValue']: value,
      CodingSchemeDesignator: isLong ? 'L_TEST' : 'DCM',
      CodeMeaning: value
    }]
  });
  const elements = getElementsFromSimpleTagValues({
    TransferSyntaxUID: '1.2.840.10008.1.2.1',
    MediaStorageSOPClassUID: '1.2.840.10008.5.1.4.1.1.88.33',
    MediaStorageSOPInstanceUID: '1.2.3.300',
    SOPClassUID: '1.2.840.10008.5.1.4.1.1.88.33',
    SOPInstanceUID: '1.2.3.300',
    Modality: 'SR',
    ValueType: 'CONTAINER',
    ContinuityOfContent: 'SEPARATE',
    ConceptNameCodeSequence: code('126000'),
    ContentSequence: {
      value: [{
        RelationshipType: 'CONTAINS',
        ValueType: 'CONTAINER',
        ConceptNameCodeSequence: code(codeValue, true),
        ContinuityOfContent: 'SEPARATE',
        ContentSequence: {
          value: uids.map(uid => ({
            RelationshipType: 'CONTAINS',
            ValueType: 'IMAGE',
            ConceptNameCodeSequence: code('121138'),
            ReferencedSOPSequence: {
              value: [{
                ReferencedSOPClassUID: '1.2.840.10008.5.1.4.1.1.4',
                ReferencedSOPInstanceUID: uid
              }]
            }
          }))
        }
      }]
    }
  });
  return writeReadDerivedTestElements(elements);
}

describe('getDerivedVolumeElements', () => {
  /**
   * Get new source slices (updated by the function), at z 0, 5 and 10.
   *
   * @returns {Record<string, DataElement>[]} The slice elements.
   */
  const getSlices = () => [
    createDerivedTestSlice({uid: '1.2.3.1', z: 0}),
    createDerivedTestSlice({uid: '1.2.3.2', z: 5}),
    createDerivedTestSlice({uid: '1.2.3.3', z: 10})
  ];

  test('copy the source tags and change the instance tags', () => {
    const [slice1, slice2, slice3] = getSlices();
    const result = getDerivedVolumeElements([slice2, slice1, slice3], {
      SeriesDescription: 'Derived',
      SeriesNumber: '20',
      ImageType: ['DERIVED', 'PRIMARY'],
      SeriesInstanceUID: '2.25.1',
      SourceInstanceSequence: {
        value: [{
          ReferencedSOPClassUID: '1.2.840.10008.5.1.4.1.1.88.33',
          ReferencedSOPInstanceUID: '1.2.3.300'
        }]
      },
      // instance tags are set by the function
      InstanceNumber: '99'
    });
    assert.equal(result.length, 3);
    const elements = result.map(writeReadDerivedTestElements);
    const first = elements[0];
    // changed
    assert.equal(first['0008103E'].value[0], 'Derived');
    assert.equal(first['00200011'].value[0], '20');
    assert.deepEqual(first['00080008'].value, ['DERIVED', 'PRIMARY']);
    assert.equal(first['0020000E'].value[0], '2.25.1');
    assert.equal(first['00420013'].value[0]['00081155'].value[0],
      '1.2.3.300');
    assert.deepEqual(
      elements.map(item => item['00080018'].value[0]),
      ['2.25.1.1', '2.25.1.2', '2.25.1.3']);
    assert.deepEqual(
      elements.map(item => item['00020003'].value[0]),
      ['2.25.1.1', '2.25.1.2', '2.25.1.3']);
    assert.deepEqual(
      elements.map(item => item['00200013'].value[0]), ['1', '2', '3']);
    // source slices, in position order
    assert.deepEqual(
      elements.map(item => item['00082112'].value[0]['00081155'].value[0]),
      ['1.2.3.1', '1.2.3.2', '1.2.3.3']);
    // copied
    assert.equal(first['00100010'].value[0], 'Derived^Test');
    assert.equal(first['00080060'].value[0], 'MR');
    assert.equal(first['00200052'].value[0], '1.2.3.400');
    assert.deepEqual(Array.from(first['7FE00010'].value[0]), [7, 7, 7, 7]);
  });

  test('number the instances in the direction of the input order', () => {
    const positions = order => {
      const slices = getSlices();
      return getDerivedVolumeElements(order.map(index => slices[index]))
        .map(elements => elements['00200032'].value[2]);
    };
    assert.deepEqual(positions([0, 1, 2]), ['0', '5', '10']);
    assert.deepEqual(positions([2, 1, 0]), ['10', '5', '0']);
    assert.deepEqual(positions([1, 0, 2]), ['0', '5', '10']);
  });

  test('number the instances in the source instance number direction', () => {
    const positions = order => {
      const slices = [
        createDerivedTestSlice({uid: '1.2.3.1', z: 0, instanceNumber: 3}),
        createDerivedTestSlice({uid: '1.2.3.2', z: 5, instanceNumber: 2}),
        createDerivedTestSlice({uid: '1.2.3.3', z: 10, instanceNumber: 1})
      ];
      return getDerivedVolumeElements(order.map(index => slices[index]))
        .map(elements => elements['00200032'].value[2]);
    };
    assert.deepEqual(positions([0, 1, 2]), ['10', '5', '0']);
    assert.deepEqual(positions([2, 1, 0]), ['10', '5', '0']);
  });

  test('generate the UIDs without series UID', () => {
    const result = getDerivedVolumeElements(getSlices());
    const seriesUids = new Set(
      result.map(elements => elements['0020000E'].value[0]));
    assert.equal(seriesUids.size, 1);
    const uids = result.map(elements => elements['00080018'].value[0]);
    assert.equal(new Set([...seriesUids, ...uids]).size, 4);
  });

  test('keep the time point tags of one time point', () => {
    const result = getDerivedVolumeElements([
      createDerivedTestSlice({uid: '1.2.3.1', z: 0, temporalPosition: 8}),
      createDerivedTestSlice({uid: '1.2.3.2', z: 5, temporalPosition: 8})
    ]);
    assert.equal(result[0]['00200100'].value[0], '8');
    assert.equal(result[0]['00200105'].value[0], '22');
  });

  test('reject instances that would load as another volume', () => {
    /**
     * Get slices with a private volume index tag.
     *
     * @param {string[]} indices The volume index of each slice.
     * @returns {Record<string, DataElement>[]} The slice elements.
     */
    const getIndexedSlices = indices => getSlices().map((slice, i) => {
      const index = new DataElement('IS');
      index.value = [indices[i]];
      slice['00111010'] = index;
      return slice;
    });
    const rules = custom.privateBValueRules;
    custom.privateBValueRules = [
      {uidPrefix: '2.25', key: '00111010'},
      ...defaultPrivateBValueRules
    ];
    try {
      // same index: one volume
      assert.equal(getDerivedVolumeElements(getIndexedSlices(['8', '8', '8']),
        {SeriesInstanceUID: '2.25.5'}).length, 3);
      // the rule only applies to the new instance UIDs
      assert.throws(() => getDerivedVolumeElements(
        getIndexedSlices(['1', '2', '3']), {SeriesInstanceUID: '2.25.5'}),
      'Derived instance 2.25.5.2 belongs to another volume');
    } finally {
      custom.privateBValueRules = rules;
    }
  });

  test('reject sources that do not form one volume', () => {
    const rejected = [
      [createDerivedTestSlice({uid: '1.2.3.2', z: 5, series: '1.2.3.900'}),
        'not in the series'],
      [createDerivedTestSlice({uid: '1.2.3.2', z: 5, rows: 3}),
        'different number of rows'],
      [createDerivedTestSlice(
        {uid: '1.2.3.2', z: 5, orientation: [0, 1, 0, 0, 0, 1]}),
      'different orientation'],
      [createDerivedTestSlice(
        {uid: '1.2.3.2', z: 5, frameOfReference: '1.2.3.401'}),
      'different frame of reference'],
      [createDerivedTestSlice({uid: '1.2.3.2', z: 0}), 'Cannot append same'],
      [createDerivedTestSlice({uid: '1.2.3.2', z: 5, frames: 2}),
        'multi-frame'],
      [createDerivedTestSlice({uid: '1.2.3.2', z: 5, temporalPosition: 9}),
        'another volume']
    ];
    for (const [slice, message] of rejected) {
      assert.throws(() => getDerivedVolumeElements([getSlices()[0], slice]),
        message);
    }
    const [slice1, noUid] = getSlices();
    delete noUid['00080018'];
    assert.throws(() => getDerivedVolumeElements([slice1, noUid]),
      'no SOP Class or Instance UID');
  });

  test('reject an invalid input', () => {
    const slice1 = getSlices()[0];
    assert.throws(() => getDerivedVolumeElements([]), 'No source');
    assert.throws(() => getDerivedVolumeElements(undefined), 'No source');
    assert.throws(() => getDerivedVolumeElements([slice1],
      {SeriesInstanceUID: '1.2.a'}), 'Invalid series instance UID');
    assert.throws(() => getDerivedVolumeElements([slice1],
      {SeriesInstanceUID: `1.${'2'.repeat(61)}`}),
    'Invalid series instance UID');
    // leading zero (DICOM PS3.5 section 9.1)
    assert.throws(() => getDerivedVolumeElements([slice1],
      {SeriesInstanceUID: '1.2.03'}), 'Invalid series instance UID');
  });

  test('accept a series UID with zero components', () => {
    const result = getDerivedVolumeElements(getSlices(),
      {SeriesInstanceUID: '1.0.2.0'});
    assert.equal(result[0]['00080018'].value[0], '1.0.2.0.1');
  });

  test('accept a one item array series UID', () => {
    const result = getDerivedVolumeElements(getSlices(),
      {SeriesInstanceUID: ['2.25.3']});
    assert.equal(result[0]['0020000E'].value[0], '2.25.3');
    assert.equal(result[0]['00080018'].value[0], '2.25.3.1');
    // the error shows the input value as is
    assert.throws(() => getDerivedVolumeElements(getSlices(),
      {SeriesInstanceUID: ['2.25.3', '2.25.4']}),
    'Invalid series instance UID: ["2.25.3","2.25.4"].');
  });
});

describe('createDerivedVolumeFromSR', () => {
  const code = 'SelectedImages';
  const uids = ['1.2.3.1', '1.2.3.2', '1.2.3.3'];
  /**
   * Get the source files at z 0, 5 and 10, plus one not referenced.
   *
   * @returns {ArrayBuffer[]} The source files.
   */
  const getFiles = () => [
    createDerivedTestFile({uid: '1.2.3.3', z: 10}),
    createDerivedTestFile({uid: '1.2.3.9', z: 20}),
    createDerivedTestFile({uid: '1.2.3.1', z: 0}),
    createDerivedTestFile({uid: '1.2.3.2', z: 5})
  ];

  test('create the files of the referenced images', () => {
    const report = createDerivedTestReport(code, [...uids, uids[0]]);
    const files = getFiles();
    const copies = files.map(file => file.slice(0));
    const result = createDerivedVolumeFromSR(report, code, files, {
      SeriesDescription: 'Derived',
      SeriesInstanceUID: '2.25.2'
    });
    // only the referenced images, each once, in position order
    const elements = result.map(parseDerivedTestFile);
    assert.deepEqual(
      elements.map(item => item['00082112'].value[0]['00081155'].value[0]),
      uids);
    assert.deepEqual(
      elements.map(item => item['00080018'].value[0]),
      ['2.25.2.1', '2.25.2.2', '2.25.2.3']);
    assert.equal(elements[0]['0008103E'].value[0], 'Derived');
    // input files not modified
    files.forEach((file, index) => {
      assert.deepEqual(new Uint8Array(file), new Uint8Array(copies[index]));
    });
  });

  test('parse only the header of the sources not referenced', () => {
    const report = createDerivedTestReport(code, uids);
    const files = getFiles();
    const parseSpy = vi.spyOn(DicomParser.prototype, 'parse');
    try {
      createDerivedVolumeFromSR(report, code, files);
      const isFullParse = call => typeof call[1] === 'undefined';
      const fullParses = parseSpy.mock.calls.filter(isFullParse);
      // not referenced (1.2.3.9): header only
      assert.isFalse(fullParses.some(call => call[0] === files[1]));
      // referenced: header and full parsing, once each
      assert.equal(fullParses.length, uids.length);
      assert.equal(parseSpy.mock.calls.filter(call => call[0] === files[0])
        .length, 2);
    } finally {
      parseSpy.mockRestore();
    }
  });

  test('ignore a source without SOP Instance UID', () => {
    const noUid = new DicomWriter().getBuffer(getElementsFromSimpleTagValues({
      TransferSyntaxUID: '1.2.840.10008.1.2.1',
      Modality: 'MR'
    }));
    const warnSpy = vi.spyOn(logger, 'warn');
    try {
      const result = createDerivedVolumeFromSR(
        createDerivedTestReport(code, uids), code, [noUid, ...getFiles()]);
      assert.equal(result.length, uids.length);
      assert.include(warnSpy.mock.calls[0][0],
        'Source 0 has no SOP Instance UID');
    } finally {
      warnSpy.mockRestore();
    }
  });

  test('reject an SR without referenced image', () => {
    assert.throws(() => createDerivedVolumeFromSR(
      createDerivedTestReport(code, []), code, getFiles()),
    'No image referenced');
    assert.throws(() => createDerivedVolumeFromSR(
      createDerivedTestReport(code, uids), 'Unknown', getFiles()),
    'No image referenced by Unknown.');
    const unknown = new DicomCode('Unknown');
    unknown.value = 'Unknown';
    assert.throws(() => createDerivedVolumeFromSR(
      createDerivedTestReport(code, uids), unknown, getFiles()),
    'No image referenced by Unknown.');
    unknown.value = undefined;
    unknown.urnValue = 'urn:unknown';
    assert.throws(() => createDerivedVolumeFromSR(
      createDerivedTestReport(code, uids), unknown, getFiles()),
    'No image referenced by urn:unknown.');
  });

  test('ignore a source with the SOP Instance UID of another', () => {
    const files = getFiles();
    const warnSpy = vi.spyOn(logger, 'warn');
    try {
      const result = createDerivedVolumeFromSR(
        createDerivedTestReport(code, uids), code, [...files, files[0]]);
      assert.equal(result.length, uids.length);
      assert.equal(warnSpy.mock.calls.length, 1);
      assert.include(warnSpy.mock.calls[0][0],
        `Source ${files.length} has the SOP Instance UID of source 0`);
    } finally {
      warnSpy.mockRestore();
    }
  });

  test('match the coding scheme of a code', () => {
    const report = createDerivedTestReport(code, uids);
    const dicomCode = new DicomCode(code);
    dicomCode.longValue = code;
    dicomCode.schemeDesignator = 'L_TEST';
    assert.equal(
      createDerivedVolumeFromSR(report, dicomCode, getFiles()).length,
      uids.length);
    dicomCode.schemeDesignator = '99OTHER';
    assert.throws(() => createDerivedVolumeFromSR(
      report, dicomCode, getFiles()), `No image referenced by ${code}.`);
  });

  test('reject a referenced image without source', () => {
    assert.throws(() => createDerivedVolumeFromSR(
      createDerivedTestReport(code, [...uids, '1.2.3.8']), code, getFiles()),
    'Missing source instances: 1.2.3.8');
  });

  test('ignore a source that cannot be read', () => {
    const warnSpy = vi.spyOn(logger, 'warn');
    try {
      const result = createDerivedVolumeFromSR(
        createDerivedTestReport(code, uids), code,
        [...getFiles(), new ArrayBuffer(10)]);
      assert.equal(result.length, uids.length);
      assert.equal(warnSpy.mock.calls.length, 1);
      assert.include(warnSpy.mock.calls[0][0], 'Cannot parse source 4');
    } finally {
      warnSpy.mockRestore();
    }
  });

  test('reject a referenced source that cannot be read', () => {
    // header unreadable: the referenced instance is missing
    const files = getFiles();
    files[2] = new ArrayBuffer(10);
    assert.throws(() => createDerivedVolumeFromSR(
      createDerivedTestReport(code, uids), code, files),
    'Missing source instances: 1.2.3.1');
    // pixel data unreadable: the full parsing fails
    const truncated = getFiles();
    truncated[2] = truncated[2].slice(0, truncated[2].byteLength - 4);
    assert.throws(() => createDerivedVolumeFromSR(
      createDerivedTestReport(code, uids), code, truncated),
    'Cannot parse source 2');
  });

  test('reject images that do not form one volume', () => {
    const files = [
      ...getFiles(),
      createDerivedTestFile({uid: '1.2.3.4', z: 5, temporalPosition: 9})
    ];
    assert.throws(() => createDerivedVolumeFromSR(
      createDerivedTestReport(code, [...uids, '1.2.3.4']), code, files),
    'another volume');
  });
});
