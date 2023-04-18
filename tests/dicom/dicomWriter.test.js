import {DicomParser} from '../../src/dicom/dicomParser';
import {
  DicomWriter,
  getElementsFromJSONTags,
  getUID
} from '../../src/dicom/dicomWriter';
import {
  getTagFromDictionary,
  getPixelDataTag
} from '../../src/dicom/dicomTag';
import {dictionary} from '../../src/dicom/dictionary';
import {b64urlToArrayBuffer} from './utils';

import multiframeTest from '/tests/data/multiframe-test1.dcm';
import dwvTestAnonymise from '/tests/data/dwv-test-anonymise.dcm';
import syntheticDataExplicit from '/tests/dicom/synthetic-data_explicit.json';
import syntheticDataImplicit from '/tests/dicom/synthetic-data_implicit.json';
import syntheticDataExplicitBE from
  '/tests/dicom/synthetic-data_explicit_big-endian.json';

/**
 * Tests for the 'dicom/dicomWriter.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */

/**
 * Tests getUID.
 *
 * @function module:tests/dicom~getUID
 */
QUnit.test('Test getUID', function (assert) {
  // check size
  const uid00 = getUID('mytag');
  assert.ok(uid00.length <= 64, 'uid length #0');
  const uid01 = getUID('mysuperlongtagthatneverfinishes');
  assert.ok(uid01.length <= 64, 'uid length #1');

  // consecutive for same tag are different
  const uid10 = getUID('mytag');
  const uid11 = getUID('mytag');
  assert.notEqual(uid10, uid11, 'Consecutive getUID');

  // groups do not start with 0
  const parts = uid10.split('.');
  let count = 0;
  for (let i = 0; i < parts.length; ++i) {
    const part = parts[i];
    if (part[0] === '0' && part.length !== 1) {
      ++count;
    }
  }
  assert.ok(count === 0, 'Zero at start of part');
});

/**
 * Tests for {@link DicomWriter} using simple DICOM data.
 * Using remote file for CI integration.
 *
 * @function module:tests/dicom~dicomWriterSimpleDicom
 */
QUnit.test('Test multiframe writer support.', function (assert) {

  // parse DICOM
  let dicomParser = new DicomParser();
  dicomParser.parse(b64urlToArrayBuffer(multiframeTest));

  const numCols = 256;
  const numRows = 256;
  const numFrames = 16;
  const bufferSize = numCols * numRows * numFrames;

  // raw tags
  let rawTags = dicomParser.getDicomElements();
  // check values
  assert.equal(rawTags['00280008'].value[0], numFrames, 'Number of frames');
  assert.equal(rawTags['00280011'].value[0], numCols, 'Number of columns');
  assert.equal(rawTags['00280010'].value[0], numRows, 'Number of rows');
  // length of value array for pixel data
  assert.equal(
    rawTags['7FE00010'].value[0].length,
    bufferSize,
    'Length of value array for pixel data');

  const dicomWriter = new DicomWriter();
  const buffer = dicomWriter.getBuffer(rawTags);

  dicomParser = new DicomParser();
  dicomParser.parse(buffer);

  rawTags = dicomParser.getDicomElements();

  // check values
  assert.equal(rawTags['00280008'].value[0], numFrames, 'Number of frames');
  assert.equal(rawTags['00280011'].value[0], numCols, 'Number of columns');
  assert.equal(rawTags['00280010'].value[0], numRows, 'Number of rows');
  // length of value array for pixel data
  assert.equal(
    rawTags['7FE00010'].value[0].length,
    bufferSize,
    'Length of value array for pixel data');

});

/**
 * Tests for {@link DicomWriter} anomnymisation.
 * Using remote file for CI integration.
 *
 * @function module:tests/dicom~dicomWriterAnonymise
 */
QUnit.test('Test patient anonymisation', function (assert) {

  // parse DICOM
  let dicomParser = new DicomParser();
  dicomParser.parse(b64urlToArrayBuffer(dwvTestAnonymise));

  const patientsNameAnonymised = 'anonymise-name';
  const patientsIdAnonymised = 'anonymise-id';
  // rules with different levels: full tag, tag name and group name
  const rules = {
    default: {
      action: 'copy', value: null
    },
    '00100010': {
      action: 'replace', value: patientsNameAnonymised
    },
    PatientID: {
      action: 'replace', value: patientsIdAnonymised
    },
    Patient: {
      action: 'remove', value: null
    }
  };

  const patientsName = 'dwv^PatientName';
  const patientID = 'dwv-patient-id123';
  const patientsBirthDate = '19830101';
  const patientsSex = 'M';

  // raw tags
  let rawTags = dicomParser.getDicomElements();
  // check values
  assert.equal(
    rawTags['00100010'].value[0].trim(),
    patientsName,
    'patientsName');
  assert.equal(
    rawTags['00100020'].value[0].trim(),
    patientID,
    'patientID');
  assert.equal(
    rawTags['00100030'].value[0].trim(),
    patientsBirthDate,
    'patientsBirthDate');
  assert.equal(
    rawTags['00100040'].value[0].trim(),
    patientsSex,
    'patientsSex');

  const dicomWriter = new DicomWriter();
  dicomWriter.setRules(rules);
  const buffer = dicomWriter.getBuffer(rawTags);

  dicomParser = new DicomParser();

  dicomParser.parse(buffer);

  rawTags = dicomParser.getDicomElements();

  // check values
  assert.equal(
    rawTags['00100010'].value[0],
    patientsNameAnonymised,
    'patientName');
  assert.equal(
    rawTags['00100020'].value[0],
    patientsIdAnonymised,
    'patientID');
  assert.notOk(rawTags['00100030'], 'patientsBirthDate');
  assert.notOk(rawTags['00100040'], 'patientsSex');

});

/**
 * Compare JSON tags and DICOM elements
 *
 * @param {object} jsonTags The JSON tags.
 * @param {object} dicomElements The DICOM elements
 * @param {string} name The name of the test.
 * @param {object} comparator An object with an equal function (such as
 *   Qunit assert).
 */
function compare(jsonTags, dicomElements, name, comparator) {
  // check content
  if (jsonTags === null || jsonTags === 0) {
    return;
  }
  const keys = Object.keys(jsonTags);
  for (let k = 0; k < keys.length; ++k) {
    const tagName = keys[k];
    const tag = getTagFromDictionary(tagName);
    const tagKey = tag.getKey();
    const element = dicomElements[tagKey];
    const value = element.value;
    if (element.vr !== 'SQ') {
      let jsonTag = jsonTags[tagName];
      // stringify possible array
      if (Array.isArray(jsonTag)) {
        jsonTag = jsonTag.join();
      }
      comparator.equal(
        value.join(),
        jsonTag,
        name + ' - ' + tagName);
    } else {
      // check content
      if (jsonTags[tagName] === null || jsonTags[tagName] === 0) {
        continue;
      }
      const sqValue = jsonTags[tagName].value;
      if (typeof sqValue === 'undefined' ||
      sqValue === null) {
        continue;
      }
      // supposing same order of subkeys and indices...
      for (let i = 0; i < sqValue.length; ++i) {
        if (sqValue[i] !== 'undefinedLength') {
          compare(
            sqValue[i], value[i], name, comparator);
        }
      }
    }
  }
}

/**
 * Simple GradSquarePixGenerator
 *
 * @param {object} tags The input tags.
 * @returns {object} The pixel buffer
 */
function generateGradSquare(tags) {

  const numberOfColumns = tags.Columns;
  const numberOfRows = tags.Rows;
  const isRGB = tags.PhotometricInterpretation.trim() === 'RGB';
  const samplesPerPixel = tags.SamplesPerPixel;

  let numberOfSamples = 1;
  let numberOfColourPlanes = 1;
  if (samplesPerPixel === 3) {
    const planarConfiguration = tags.PlanarConfiguration;
    if (planarConfiguration === 0) {
      numberOfSamples = 3;
    } else {
      numberOfColourPlanes = 3;
    }
  }

  const dataLength = numberOfRows * numberOfColumns * samplesPerPixel;

  const bitsAllocated = tags.BitsAllocated;
  const pixelRepresentation = tags.PixelRepresentation;
  let pixelBuffer;
  if (bitsAllocated === 8) {
    if (pixelRepresentation === 0) {
      pixelBuffer = new Uint8Array(dataLength);
    } else {
      pixelBuffer = new Int8Array(dataLength);
    }
  } else if (bitsAllocated === 16) {
    if (pixelRepresentation === 0) {
      pixelBuffer = new Uint16Array(dataLength);
    } else {
      pixelBuffer = new Int16Array(dataLength);
    }
  }

  const halfCols = numberOfRows * 0.5;
  const halfRows = numberOfColumns * 0.5;

  const background = 0;
  const maxNoBounds = (halfCols + halfCols / 2) * (halfRows + halfRows / 2);
  const max = 100;

  let getFunc;
  if (isRGB) {
    getFunc = function (i, j) {
      let value = background;
      const jc = Math.abs(j - halfRows);
      const ic = Math.abs(i - halfCols);
      if (jc < halfRows / 2 && ic < halfCols / 2) {
        value += (i * j) * (max / maxNoBounds);
      }
      if (value > 255) {
        value = 200;
      }
      return [0, value, value];
    };
  } else {
    getFunc = function (i, j) {
      let value = 0;
      const jc = Math.abs(j - halfRows);
      const ic = Math.abs(i - halfCols);
      if (jc < halfRows / 2 && ic < halfCols / 2) {
        value += (i * j) * (max / maxNoBounds);
      }
      return [value];
    };
  }

  // main loop
  let offset = 0;
  for (let c = 0; c < numberOfColourPlanes; ++c) {
    for (let j = 0; j < numberOfRows; ++j) {
      for (let i = 0; i < numberOfColumns; ++i) {
        for (let s = 0; s < numberOfSamples; ++s) {
          if (numberOfColourPlanes !== 1) {
            pixelBuffer[offset] = getFunc(i, j)[c];
          } else {
            pixelBuffer[offset] = getFunc(i, j)[s];
          }
          ++offset;
        }
      }
    }
  }

  const pixVL = pixelBuffer.BYTES_PER_ELEMENT * dataLength;
  return {
    tag: getPixelDataTag(),
    vr: bitsAllocated === 8 ? 'OB' : 'OW',
    vl: pixVL,
    value: pixelBuffer
  };
}

/**
 * Test a JSON config: write a DICOM file and read it back.
 *
 * @param {object} config A JSON config representing DICOM tags.
 * @param {object} assert A Qunit assert.
 */
function testWriteReadDataFromConfig(config, assert) {
  // add private tags to dict if present
  let useUnVrForPrivateSq = false;
  if (typeof config.privateDictionary !== 'undefined') {
    const keys = Object.keys(config.privateDictionary);
    for (let i = 0; i < keys.length; ++i) {
      const group = keys[i];
      const tags = config.privateDictionary[group];
      dictionary[group] = tags;
    }
    if (typeof config.useUnVrForPrivateSq !== 'undefined') {
      useUnVrForPrivateSq = config.useUnVrForPrivateSq;
    }
  }
  // pass tags clone to avoid modifications (for ex by padElement)
  // TODO: find another way
  const jsonTags = JSON.parse(JSON.stringify(config.tags));
  // convert JSON to DICOM element object
  const dicomElements = getElementsFromJSONTags(jsonTags);
  // pixels (if possible): small gradient square
  if (config.tags.Modality !== 'KO') {
    dicomElements['7FE00010'] = generateGradSquare(config.tags);
  }

  // create DICOM buffer
  const writer = new DicomWriter();
  writer.setUseUnVrForPrivateSq(useUnVrForPrivateSq);
  let dicomBuffer = null;
  try {
    dicomBuffer = writer.getBuffer(dicomElements);
  } catch (error) {
    assert.ok(false, 'Caught error: ' + error);
    return;
  }

  // parse the buffer
  const dicomParser = new DicomParser();
  dicomParser.parse(dicomBuffer);
  const elements = dicomParser.getDicomElements();

  // compare contents
  compare(config.tags, elements, config.name, assert);
}

/**
 * Tests write/read DICOM data from config file: explicit encoding.
 * Using remote file for CI integration.
 *
 * @function module:tests/dicom~dicomExplicitWriteReadFromConfig
 */
QUnit.test('Test synthetic dicom explicit', function (assert) {
  const configs = JSON.parse(syntheticDataExplicit);
  for (let i = 0; i < configs.length; ++i) {
    testWriteReadDataFromConfig(configs[i], assert);
  }
});

/**
 * Tests write/read DICOM data from config file: implicit encoding.
 * Using remote file for CI integration.
 *
 * @function module:tests/dicom~dicomImplicitWriteReadFromConfig
 */
QUnit.test('Test synthetic dicom implicit', function (assert) {
  const configs = JSON.parse(syntheticDataImplicit);
  for (let i = 0; i < configs.length; ++i) {
    testWriteReadDataFromConfig(configs[i], assert);
  }
});

/**
 * Tests write/read DICOM data from config file: explicit big endian encoding.
 * Using remote file for CI integration.
 *
 * @function module:tests/dicom~dicomExplicitBigEndianWriteReadFromConfig
 */
QUnit.test('Test synthetic dicom explicit big endian', function (assert) {
  const configs = JSON.parse(syntheticDataExplicitBE);
  for (let i = 0; i < configs.length; ++i) {
    testWriteReadDataFromConfig(configs[i], assert);
  }
});
