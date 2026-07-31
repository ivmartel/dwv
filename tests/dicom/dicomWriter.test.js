// @vitest-environment jsdom
import {describe, test, assert, vi} from 'vitest';
import {DicomParser} from '../../src/dicom/dicomParser.js';
import {
  DicomWriter,
  getElementsFromJSONTags,
  getUID
} from '../../src/dicom/dicomWriter.js';
import {
  getPixelDataTag
} from '../../src/dicom/dicomTag.js';
import {
  getTagFromDictionary,
} from '../../src/dicom/dicomTagInfo.js';
import {
  dictionary,
  transferSyntaxKeywords
} from '../../src/dicom/dictionary.js';
import {b64urlToArrayBuffer} from './utils.js';

/**
 * @import {WriterRule} from '../../src/dicom/dicomWriter.js';
 */

// test data
import multiframeTest from '/tests/data/multiframe-test1.dcm?inline';
import dwvTestAnonymise from '/tests/data/dwv-test-anonymise.dcm?inline';
import syntheticData from '/tests/data/synthetic-data.json';

/**
 * Tests for the 'dicom/dicomWriter.js' file.
 */

describe('dicom', () => {

  /**
   * Tests {@link getUID}.
   *
   * @function module:tests/dicom~getuid
   */
  test('getUID', () => {
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
   * Tests for {@link DicomWriter} using multiframe DICOM data.
   * Using remote file for CI integration.
   *
   * @function module:tests/dicom~writeMultiframe
   */
  test('Write multiframe - #DWV-REQ-IO-05-001 Write DICOM file',
    () => {
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
    }
  );

  /**
   * Tests for {@link DicomWriter} anomnymisation.
   * Using remote file for CI integration.
   *
   * @function module:tests/dicom~writeAnonymised
   */
  test('Write anonymised - #DWV-REQ-IO-05-002 Write anonymised DICOM file',
    () => {
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
    }
  );

  /**
   * Tests for {@link DicomWriter} anomnymisation and add tags.
   * Using remote file for CI integration.
   *
   * @function module:tests/dicom~writeAnonymisedAndAddTags
   */
  test(
    // eslint-disable-next-line @stylistic/js/max-len
    'Write anonymised and add tags - #DWV-REQ-IO-05-002 Write anonymised DICOM file',
    () => {
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
    }
  );

  /**
   * Compare JSON tags and DICOM elements.
   *
   * @param {object} jsonTags The JSON tags.
   * @param {object} dicomElements The DICOM elements.
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
          `${name} - ${tagName}`);
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
   * Simple GradSquarePixGenerator.
   *
   * @param {object} tags The input tags.
   * @returns {object} The pixel buffer.
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

    // full grad square
    // const borderI = 0;
    // const borderJ = 0;
    // ~centered grad square
    const borderI = Math.ceil(numberOfColumns * 0.25);
    const borderJ = Math.ceil(numberOfRows * 0.25);

    const minI = borderI;
    const minJ = borderJ;
    const maxI = numberOfColumns - borderI;
    const maxJ = numberOfRows - borderJ;

    const background = 0;
    const max = 255;
    let maxNoBounds = 1;

    const getValue = function (i, j) {
      let value = background;
      if (i >= minI && i <= maxI &&
        j >= minJ && j <= maxJ) {
        value += Math.round((i + j) * (max / maxNoBounds));
      }
      return [value];
    };

    const getRGB = function (i, j) {
      let value = getValue(i, j);
      if (value > 255) {
        value = 200;
      }
      return [value, 0, 0];
    };

    maxNoBounds = getValue(maxI, maxJ) / max;

    const getFunc = isRGB ? getRGB : getValue;

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
   * Simple BinaryPixGenerator.
   *
   * @param {object} tags The input tags.
   * @param {object} segmentSquares Per-segment square bounds
   *   keyed by segment number string. Each entry has
   *   {minI, maxI, minJ, maxJ}.
   * @returns {object} The pixel buffer.
   */
  function generateBinary(tags, segmentSquares) {

    const numberOfColumns = tags.Columns;
    const numberOfRows = tags.Rows;
    let numberOfFrames = 1;
    if (typeof tags.NumberOfFrames !== 'undefined') {
      numberOfFrames = tags.NumberOfFrames;
    }
    const dataLength = numberOfRows * numberOfColumns * numberOfFrames;
    const pixelBuffer = new Uint8Array(dataLength);

    // main loop
    let offset = 0;
    for (let f = 0; f < numberOfFrames; ++f) {
      // use frame + 1 as segment number
      const {minI, maxI, minJ, maxJ} = segmentSquares[String(f + 1)];

      for (let j = 0; j < numberOfRows; ++j) {
        for (let i = 0; i < numberOfColumns; ++i) {
          const inRange = i >= minI && i < maxI &&
            j >= minJ && j < maxJ;
          pixelBuffer[offset] = inRange ? 1 : 0;
          ++offset;
        }
      }
    }

    const pixVL = pixelBuffer.BYTES_PER_ELEMENT * dataLength;
    return {
      tag: getPixelDataTag(),
      vr: 'OB',
      vl: pixVL,
      value: pixelBuffer
    };
  }

  /**
   * Test a JSON config: write a DICOM file and read it back.
   *
   * @param {object} config A JSON config representing DICOM tags.
   * @param {Record<string, WriterRule>} [writerRules] Optional DICOM
   *   writer rules.
   * @param {object} [outConfig] Optional resulting JSON after
   *   applying writer rules.
   */
  function testWriteReadDataFromConfig(config, writerRules, outConfig) {
    // add private tags to dict if present
    let useUnVrForPrivateSq = false;
    let consoleSpy;
    if (typeof config.privateDictionary !== 'undefined') {
      // console warn spy
      consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

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
    // pixels (if possible)
    if (config.tags.Modality !== 'KO' &&
      config.tags.Modality !== 'RTSTRUCT'
    ) {
      if (config.tags.Modality === 'SEG') {
        // simple binary
        dicomElements['7FE00010'] = generateBinary(
          config.tags, config.segmentSquares
        );
      } else {
        // grad square
        dicomElements['7FE00010'] = generateGradSquare(config.tags);
      }
    }

    // create writer
    const writer = new DicomWriter();
    writer.setUseUnVrForPrivateSq(useUnVrForPrivateSq);
    if (typeof writerRules !== 'undefined') {
      writer.setRules(writerRules, true);
    }

    // create DICOM buffer
    let dicomBuffer;
    try {
      dicomBuffer = writer.getBuffer(dicomElements);
    } catch (error) {
      assert.ok(false, `Caught error: ${error}`);
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

    // reset spy
    if (typeof consoleSpy !== 'undefined') {
      // TODO could try to check message...
      // reset
      consoleSpy.mockReset();
    }
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
      result
    };
  }

  /**
   * Tests write/read DICOM data with explicit encoding.
   * Using remote file for CI integration.
   *
   * @function module:tests/dicom~readWriteSyntheticExplicit
   */
  test(
    'Read-write synthetic explicit - #DWV-REQ-IO-01-001 Load DICOM file(s)',
    () => {
      for (const config of syntheticData) {
        config.tags.TransferSyntaxUID =
          transferSyntaxKeywords.ExplicitVRLittleEndian;
        testWriteReadDataFromConfig(config);
      }
    }
  );

  /**
   * Tests write with rules / read DICOM data with explicit encoding.
   * Using remote file for CI integration.
   *
   * @function module:tests/dicom~readWriteSyntheticExplicitWithRules
   */
  test(
    // eslint-disable-next-line @stylistic/js/max-len
    'Read-write synthetic explicit with rules - #DWV-REQ-IO-01-001 Load DICOM file(s)',
    () => {
      for (const config of syntheticData) {
        config.tags.TransferSyntaxUID =
          transferSyntaxKeywords.ExplicitVRLittleEndian;
        const r20 = getRulesAndResult0(config);
        testWriteReadDataFromConfig(
          config, r20.rules, r20.result
        );
      }
    }
  );

  /**
   * Tests write/read DICOM data with implicit encoding.
   * Using remote file for CI integration.
   *
   * @function module:tests/dicom~readWriteSyntheticImplicit
   */
  test(
    'Read-write synthetic implicit - #DWV-REQ-IO-01-001 Load DICOM file(s)',
    () => {
      for (const config of syntheticData) {
        config.tags.TransferSyntaxUID =
          transferSyntaxKeywords.ImplicitVRLittleEndian;
        testWriteReadDataFromConfig(config);
      }
    }
  );

  /**
   * Tests write with rules / read DICOM data with implicit encoding.
   * Using remote file for CI integration.
   *
   * @function module:tests/dicom~readWriteSyntheticImplicitWithRules
   */
  test(
    // eslint-disable-next-line @stylistic/js/max-len
    'Read-write synthetic implicit with rules - #DWV-REQ-IO-01-001 Load DICOM file(s)',
    () => {
      for (const config of syntheticData) {
        config.tags.TransferSyntaxUID =
          transferSyntaxKeywords.ImplicitVRLittleEndian;
        const r20 = getRulesAndResult0(config);
        testWriteReadDataFromConfig(
          config, r20.rules, r20.result
        );
      }
    }
  );

  /**
   * Tests write/read DICOM data with explicit big endian encoding.
   * Using remote file for CI integration.
   *
   * @function module:tests/dicom~readWriteSyntheticExplicitBigEndian
   */
  test(
    // eslint-disable-next-line @stylistic/js/max-len
    'Read-write synthetic explicit big endian - #DWV-REQ-IO-01-001 Load DICOM file(s)',
    () => {
      for (const config of syntheticData) {
        config.tags.TransferSyntaxUID =
          transferSyntaxKeywords.ExplicitVRBigEndian;
        testWriteReadDataFromConfig(config);
      }
    }
  );

  /**
   * Tests write with rules / read DICOM data with explicit big endian encoding.
   * Using remote file for CI integration.
   *
   * @function module:tests/dicom~readWriteSyntheticExplicitBeWithRules
   */
  test(
    // eslint-disable-next-line @stylistic/js/max-len
    'Read-write synthetic explicit BE with rules - #DWV-REQ-IO-01-001 Load DICOM file(s)',
    () => {
      for (const config of syntheticData) {
        config.tags.TransferSyntaxUID =
          transferSyntaxKeywords.ExplicitVRBigEndian;
        const r20 = getRulesAndResult0(config);
        testWriteReadDataFromConfig(
          config, r20.rules, r20.result
        );
      }
    }
  );

});
