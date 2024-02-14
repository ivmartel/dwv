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

// doc imports
/* eslint-disable no-unused-vars */
import {WriterRule} from '../../src/dicom/dicomWriter';
/* eslint-enable no-unused-vars */

// test data
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
    'patientsName #0');
  assert.equal(
    rawTags['00100020'].value[0].trim(),
    patientID,
    'patientID #0');
  assert.equal(
    rawTags['00100030'].value[0].trim(),
    patientsBirthDate,
    'patientsBirthDate #0');
  assert.equal(
    rawTags['00100040'].value[0].trim(),
    patientsSex,
    'patientsSex #0');
  assert.notOk(rawTags['00104000'], 'patientsComments #0');

  // write buffer
  const dicomWriter = new DicomWriter();
  dicomWriter.setRules(rules);
  const buffer = dicomWriter.getBuffer(rawTags);
  // parse new buffer
  dicomParser = new DicomParser();
  dicomParser.parse(buffer);
  rawTags = dicomParser.getDicomElements();

  // check values
  assert.equal(
    rawTags['00100010'].value[0],
    patientsNameAnonymised,
    'patientName #1');
  assert.equal(
    rawTags['00100020'].value[0],
    patientsIdAnonymised,
    'patientID #1');
  assert.notOk(rawTags['00100030'], 'patientsBirthDate #1');
  assert.notOk(rawTags['00100040'], 'patientsSex #1');
  assert.notOk(rawTags['00104000'], 'patientsComments #1');

});

/**
 * Tests for {@link DicomWriter} anomnymisation and add tags.
 * Using remote file for CI integration.
 *
 * @function module:tests/dicom~dicomWriterAnonymiseAddTags
 */
QUnit.test('Test patient anonymisation and add tags', function (assert) {

  // parse test DICOM file
  let dicomParser = new DicomParser();
  dicomParser.parse(b64urlToArrayBuffer(dwvTestAnonymise));

  const patientsName = 'dwv^PatientName';
  const patientComments = '';
  const issuerOfPatientID = 'dwv.org';
  // rule with tagKey, tagName and non existing tag
  const rules = {
    default: {
      action: 'copy', value: null
    },
    '00104000': {
      action: 'replace', value: patientComments
    },
    IssuerOfPatientID: {
      action: 'replace', value: issuerOfPatientID
    },
    PatientBirthDateInAlternativeCalendar: {
      action: 'replace', value: null
    },
    BADKEY00: {
      action: 'replace', value: ''
    }
  };


  // initial tags
  let rawTags = dicomParser.getDicomElements();

  // check values
  assert.equal(
    rawTags['00100010'].value[0].trim(),
    patientsName,
    'patientsName #0');
  assert.notOk(rawTags['00100033'], 'null replace #0');
  assert.notOk(rawTags['00104000'], 'patientsComments #0');
  assert.notOk(rawTags['00100021'], 'issuerOfPatientID #0');

  // write buffer
  const dicomWriter = new DicomWriter();
  dicomWriter.setRules(rules, true);
  const buffer = dicomWriter.getBuffer(rawTags);
  // parse new buffer
  dicomParser = new DicomParser();
  dicomParser.parse(buffer);
  rawTags = dicomParser.getDicomElements();

  // check values
  assert.equal(
    rawTags['00100010'].value[0],
    patientsName,
    'patientName #1');
  assert.notOk(rawTags['00100033'], 'null replace #1');
  assert.equal(
    rawTags['00104000'].value[0],
    patientComments,
    'patientComments #1');
  assert.equal(
    rawTags['00100021'].value[0],
    issuerOfPatientID,
    'issuerOfPatientID #1');
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
 * @param {Object<string, WriterRule>} [writerRules] Optional DICOM
 *   writer rules.
 * @param {object} [outConfig] Optional resulting JSON after
 *   applying writer rules.
 */
function testWriteReadDataFromConfig(config, assert, writerRules, outConfig) {
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
  const jsonTags = structuredClone(config.tags);
  // convert JSON to DICOM element object
  const dicomElements = getElementsFromJSONTags(jsonTags);
  // pixels (if possible): small gradient square
  if (config.tags.Modality !== 'KO') {
    dicomElements['7FE00010'] = generateGradSquare(config.tags);
  }

  // create writer
  const writer = new DicomWriter();
  writer.setUseUnVrForPrivateSq(useUnVrForPrivateSq);
  if (typeof writerRules !== 'undefined') {
    writer.setRules(writerRules, true);
  }

  // create DICOM buffer
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

  if (typeof outConfig === 'undefined') {
    outConfig = config;
  }

  // compare contents
  compare(outConfig.tags, elements, config.name, assert);
}

/**
 * Get writing rules #0 and resulting tags.
 *
 * @param {object} config A JSON config representing DICOM tags.
 * @returns {object} Rules and resulting tags.
 */
function getRulesAndResult0(config) {
  const result = structuredClone(config);
  // action: remove
  delete result.tags.OtherPatientNames;
  // action: clear
  result.tags.PatientID = '';
  // action: replace
  result.tags.PatientName = 'Anonymized';
  // addMissingTags should be true for writer.setRules
  // -> these tags will be added if not present in input config
  result.tags.ReferringPhysicianName = 'Asclepius';
  result.tags.ReferringPhysicianIdentificationSequence = '';

  return {
    rules: {
      default: {
        action: 'copy', value: null
      },
      OtherPatientNames: {
        action: 'remove', value: null
      },
      PatientID: {
        action: 'clear', value: null
      },
      PatientName: {
        action: 'replace', value: result.tags.PatientName
      },
      ReferringPhysicianName: {
        action: 'replace', value: result.tags.ReferringPhysicianName
      },
      ReferringPhysicianIdentificationSequence: {
        action: 'replace',
        value: result.tags.ReferringPhysicianIdentificationSequence
      }
    },
    result: result
  };
}

/**
 * Tests write/read DICOM data with explicit encoding.
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
 * Tests write with rules / read DICOM data with explicit encoding.
 * Using remote file for CI integration.
 *
 * @function module:tests/dicom~dicomExplicitWriteReadFromConfig
 */
QUnit.test('Test synthetic dicom explicit with writing rules #0',
  function (assert) {
    const configs = JSON.parse(syntheticDataExplicit);
    for (let i = 0; i < configs.length; ++i) {
      const r20 = getRulesAndResult0(configs[i]);
      testWriteReadDataFromConfig(
        configs[i], assert, r20.rules, r20.result
      );
    }
  }
);

/**
 * Tests write/read DICOM data with implicit encoding.
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
 * Tests write with rules / read DICOM data with implicit encoding.
 * Using remote file for CI integration.
 *
 * @function module:tests/dicom~dicomImplicitWriteReadFromConfig
 */
QUnit.test('Test synthetic dicom implicit with writing rules #0',
  function (assert) {
    const configs = JSON.parse(syntheticDataImplicit);
    for (let i = 0; i < configs.length; ++i) {
      const r20 = getRulesAndResult0(configs[i]);
      testWriteReadDataFromConfig(
        configs[i], assert, r20.rules, r20.result
      );
    }
  }
);

/**
 * Tests write/read DICOM data with explicit big endian encoding.
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

/**
 * Tests write with rules / read DICOM data with explicit big endian encoding.
 * Using remote file for CI integration.
 *
 * @function module:tests/dicom~dicomExplicitBigEndianWriteReadFromConfig
 */
QUnit.test('Test synthetic dicom explicit big endian with writing rules #0',
  function (assert) {
    const configs = JSON.parse(syntheticDataExplicitBE);
    for (let i = 0; i < configs.length; ++i) {
      const r20 = getRulesAndResult0(configs[i]);
      testWriteReadDataFromConfig(
        configs[i], assert, r20.rules, r20.result
      );
    }
  }
);
