import {
  cleanString,
  DicomParser
} from '../../src/dicom/dicomParser';
import {
  DicomWriter,
  getElementsFromJSONTags,
  getUID
} from '../../src/dicom/dicomWriter';
import {
  getTagFromDictionary,
  getPixelDataTag
} from '../../src/dicom/dicomTag';
import {DicomElementsWrapper} from '../../src/dicom/dicomElementsWrapper';
import {DicomDictionary} from '../../src/dicom/dictionary';
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
  var uid00 = getUID('mytag');
  assert.ok(uid00.length <= 64, 'uid length #0');
  var uid01 = getUID('mysuperlongtagthatneverfinishes');
  assert.ok(uid01.length <= 64, 'uid length #1');

  // consecutive for same tag are different
  var uid10 = getUID('mytag');
  var uid11 = getUID('mytag');
  assert.notEqual(uid10, uid11, 'Consecutive getUID');

  // groups do not start with 0
  var parts = uid10.split('.');
  var count = 0;
  for (var i = 0; i < parts.length; ++i) {
    var part = parts[i];
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
  var dicomParser = new DicomParser();
  dicomParser.parse(b64urlToArrayBuffer(multiframeTest));

  var numCols = 256;
  var numRows = 256;
  var numFrames = 16;
  var bufferSize = numCols * numRows * numFrames;

  // raw tags
  var rawTags = dicomParser.getRawDicomElements();
  // check values
  assert.equal(rawTags.x00280008.value[0], numFrames, 'Number of frames');
  assert.equal(rawTags.x00280011.value[0], numCols, 'Number of columns');
  assert.equal(rawTags.x00280010.value[0], numRows, 'Number of rows');
  // length of value array for pixel data
  assert.equal(
    rawTags.x7FE00010.value[0].length,
    bufferSize,
    'Length of value array for pixel data');

  var dicomWriter = new DicomWriter();
  var buffer = dicomWriter.getBuffer(rawTags);

  dicomParser = new DicomParser();
  dicomParser.parse(buffer);

  rawTags = dicomParser.getRawDicomElements();

  // check values
  assert.equal(rawTags.x00280008.value[0], numFrames, 'Number of frames');
  assert.equal(rawTags.x00280011.value[0], numCols, 'Number of columns');
  assert.equal(rawTags.x00280010.value[0], numRows, 'Number of rows');
  // length of value array for pixel data
  assert.equal(
    rawTags.x7FE00010.value[0].length,
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
  var dicomParser = new DicomParser();
  dicomParser.parse(b64urlToArrayBuffer(dwvTestAnonymise));

  var patientsNameAnonymised = 'anonymise-name';
  var patientsIdAnonymised = 'anonymise-id';
  // rules with different levels: full tag, tag name and group name
  var rules = {
    default: {
      action: 'copy', value: null
    },
    x00100010: {
      action: 'replace', value: patientsNameAnonymised
    },
    PatientID: {
      action: 'replace', value: patientsIdAnonymised
    },
    Patient: {
      action: 'remove', value: null
    }
  };

  var patientsName = 'dwv^PatientName';
  var patientID = 'dwv-patient-id123';
  var patientsBirthDate = '19830101';
  var patientsSex = 'M';

  // raw tags
  var rawTags = dicomParser.getRawDicomElements();
  // check values
  assert.equal(
    rawTags.x00100010.value[0].trim(),
    patientsName,
    'patientsName');
  assert.equal(
    rawTags.x00100020.value[0].trim(),
    patientID,
    'patientID');
  assert.equal(
    rawTags.x00100030.value[0].trim(),
    patientsBirthDate,
    'patientsBirthDate');
  assert.equal(
    rawTags.x00100040.value[0].trim(),
    patientsSex,
    'patientsSex');

  var dicomWriter = new DicomWriter();
  dicomWriter.rules = rules;
  var buffer = dicomWriter.getBuffer(rawTags);

  dicomParser = new DicomParser();

  dicomParser.parse(buffer);

  rawTags = dicomParser.getRawDicomElements();

  // check values
  assert.equal(
    rawTags.x00100010.value[0],
    patientsNameAnonymised,
    'patientName');
  assert.equal(
    rawTags.x00100020.value[0],
    patientsIdAnonymised,
    'patientID');
  assert.notOk(rawTags.x00100030, 'patientsBirthDate');
  assert.notOk(rawTags.x00100040, 'patientsSex');

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
  var keys = Object.keys(jsonTags);
  for (var k = 0; k < keys.length; ++k) {
    var tagName = keys[k];
    var tag = getTagFromDictionary(tagName);
    var tagKey = tag.getKey();
    var element = dicomElements.getDEFromKey(tagKey);
    var value = dicomElements.getFromKey(tagKey, true);
    if (element.vr !== 'SQ') {
      var jsonTag = jsonTags[tagName];
      // stringify possible array
      if (Array.isArray(jsonTag)) {
        jsonTag = jsonTag.join();
      }
      comparator.equal(
        cleanString(value.join()),
        jsonTag,
        name + ' - ' + tagName);
    } else {
      // check content
      if (jsonTags[tagName] === null || jsonTags[tagName] === 0) {
        continue;
      }
      var sqValue = jsonTags[tagName].value;
      if (typeof sqValue === 'undefined' ||
      sqValue === null) {
        continue;
      }
      // supposing same order of subkeys and indices...
      for (var i = 0; i < sqValue.length; ++i) {
        if (sqValue[i] !== 'undefinedLength') {
          var wrap = new DicomElementsWrapper(value[i]);
          compare(
            sqValue[i], wrap, name, comparator);
        }
      }
    }
  }
}

// simple GradSquarePixGenerator
function generateGradSquare(tags) {

  var numberOfColumns = tags.Columns;
  var numberOfRows = tags.Rows;
  var isRGB = tags.PhotometricInterpretation.trim() === 'RGB';
  var samplesPerPixel = tags.SamplesPerPixel;

  var numberOfSamples = 1;
  var numberOfColourPlanes = 1;
  if (samplesPerPixel === 3) {
    var planarConfiguration = tags.PlanarConfiguration;
    if (planarConfiguration === 0) {
      numberOfSamples = 3;
    } else {
      numberOfColourPlanes = 3;
    }
  }

  var dataLength = numberOfRows * numberOfColumns * samplesPerPixel;

  var bitsAllocated = tags.BitsAllocated;
  var pixelRepresentation = tags.PixelRepresentation;
  var pixelBuffer;
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

  var halfCols = numberOfRows * 0.5;
  var halfRows = numberOfColumns * 0.5;

  var background = 0;
  var maxNoBounds = (halfCols + halfCols / 2) * (halfRows + halfRows / 2);
  var max = 100;

  var getFunc;
  if (isRGB) {
    getFunc = function (i, j) {
      var value = background;
      var jc = Math.abs(j - halfRows);
      var ic = Math.abs(i - halfCols);
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
      var value = 0;
      var jc = Math.abs(j - halfRows);
      var ic = Math.abs(i - halfCols);
      if (jc < halfRows / 2 && ic < halfCols / 2) {
        value += (i * j) * (max / maxNoBounds);
      }
      return [value];
    };
  }

  // main loop
  var offset = 0;
  for (var c = 0; c < numberOfColourPlanes; ++c) {
    for (var j = 0; j < numberOfRows; ++j) {
      for (var i = 0; i < numberOfColumns; ++i) {
        for (var s = 0; s < numberOfSamples; ++s) {
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

  var pixVL = pixelBuffer.BYTES_PER_ELEMENT * dataLength;
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
  var useUnVrForPrivateSq = false;
  if (typeof config.privateDictionary !== 'undefined') {
    var keys = Object.keys(config.privateDictionary);
    for (var i = 0; i < keys.length; ++i) {
      var group = keys[i];
      var tags = config.privateDictionary[group];
      DicomDictionary[group] = tags;
    }
    if (typeof config.useUnVrForPrivateSq !== 'undefined') {
      useUnVrForPrivateSq = config.useUnVrForPrivateSq;
    }
  }
  // pass tags clone to avoid modifications (for ex by padElement)
  // TODO: find another way
  var jsonTags = JSON.parse(JSON.stringify(config.tags));
  // convert JSON to DICOM element object
  var dicomElements = getElementsFromJSONTags(jsonTags);
  // pixels (if possible): small gradient square
  if (config.tags.Modality !== 'KO') {
    dicomElements.x7FE00010 = generateGradSquare(config.tags);
  }

  // create DICOM buffer
  var writer = new DicomWriter();
  writer.useUnVrForPrivateSq = useUnVrForPrivateSq;
  var dicomBuffer = null;
  try {
    dicomBuffer = writer.getBuffer(dicomElements);
  } catch (error) {
    assert.ok(false, 'Caught error: ' + error);
    return;
  }

  // parse the buffer
  var dicomParser = new DicomParser();
  dicomParser.parse(dicomBuffer);
  var elements = dicomParser.getDicomElements();

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
  var configs = JSON.parse(syntheticDataExplicit);
  for (var i = 0; i < configs.length; ++i) {
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
  var configs = JSON.parse(syntheticDataImplicit);
  for (var i = 0; i < configs.length; ++i) {
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
  var configs = JSON.parse(syntheticDataExplicitBE);
  for (var i = 0; i < configs.length; ++i) {
    testWriteReadDataFromConfig(configs[i], assert);
  }
});
