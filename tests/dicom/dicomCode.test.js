import {describe, test, assert} from 'vitest';
import {
  DcmCodes,
  DicomCode,
  isEqualCode,
  getCode,
  getDicomCodeItem,
  getSegmentationCode,
  getConceptNameCode,
  getMeasurementUnitsCode
} from '../../src/dicom/dicomCode.js';
import {
  getElementsFromJSONTags
} from '../../src/dicom/simpleTagValues.js';

/**
 * Tests for the 'dicom/dicomCode.js' file.
 */

describe('dicom', () => {

  /**
   * DicomCode test: translate to element and back.
   *
   * @param {object} code The code as an object.
   * @param {string} testName The test name.
   */
  function testCode(code, testName) {
    // code -> simple dicom element
    // (treat simple code as code)
    const codeSimpleElements = getDicomCodeItem(code);
    // translate to code to be able to compare
    const code1 = {
      meaning: codeSimpleElements.CodeMeaning,
      value: codeSimpleElements.CodeValue,
      schemeDesignator: codeSimpleElements.CodingSchemeDesignator,
      longValue: codeSimpleElements.LongCodeValue,
      urnValue: codeSimpleElements.URNCodeValue
    };
    assert.ok(isEqualCode(code1, code),
      `${testName} code from simple element`);

    // simple dicom element -> dicom element
    const codeElements = getElementsFromJSONTags(codeSimpleElements);
    // dicom element -> code
    const code2 = getCode(codeElements);
    // compare
    assert.ok(isEqualCode(code2, code),
      `${testName} code from element`);
  }

  /**
   * Tests for {@link DicomCode} using simple DICOM data.
   *
   * @function module:tests/dicom~dicomCodeClass
   */
  test('DICOM code class', () => {
    const meaning0 = 'code0';
    const code00 = new DicomCode(meaning0);
    assert.equal(code00.meaning, meaning0,
      'Test #00 meaning');
    assert.equal(code00.value, undefined,
      'Test #00 value');
    assert.equal(code00.schemeDesignator, undefined,
      'Test #00 scheme designator');
    assert.equal(code00.toString(), '(undefined, undefined, \'code0\')',
      'Test #00 toString');

    // example codes
    // see https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_8.10.html

    const code01 = {
      meaning: 'Dimeglumine gadopentetate 469.01mg/mL inj soln 15mL pfld syr',
      value: '406400000',
      schemeDesignator: 'SCT',
      longValue: undefined,
      urnValue: undefined
    };
    testCode(code01, assert, 'Test #01 (value)');

    const code02 = {
      meaning: 'Invasive diagnostic procedure',
      value: undefined,
      schemeDesignator: 'SCT',
      longValue: '621566751000087104',
      urnValue: undefined
    };
    testCode(code02, assert, 'Test #02 (long value)');

    const code03 = {
      meaning: 'HIPAA Privacy Rule',
      value: undefined,
      schemeDesignator: undefined,
      longValue: undefined,
      urnValue: 'urn:lex:us:federal:codified.regulation:2013-04-25;45CFR164'
    };
    testCode(code03, assert, 'Test #03 (URN)');

    const code04 = new DicomCode('a');
    code04.value = '0';
    code04.schemeDesignator = 'TEST';
    const str04 = '(0, TEST, \'a\')';
    assert.equal(code04.toString(), str04,
      'Test #04 toString');
  });

  /**
   * Tests for {@link DicomCode} dictionary.
   *
   * @function module:tests/dicom~dictionary
   */
  test('dictionary', () => {
    let count = 0;
    for (const key0 in DcmCodes) {
      for (const key in DcmCodes) {
        if (key !== key0 &&
          DcmCodes[key].value === DcmCodes[key0].value) {
          ++count;
        }
      }
    }
    assert.equal(count, 0, 'Check DcmCodes duplicate');
  });

  /**
   * Tests for {@link getSegmentationCode}.
   *
   * @function module:tests/dicom~getsegmentationcode
   */
  test('getSegmentationCode', () => {
    const code0 = getSegmentationCode();
    const theoCode0 = new DicomCode('Segmentation');
    theoCode0.value = '113076';
    theoCode0.schemeDesignator = 'DCM';
    assert.ok(isEqualCode(code0, theoCode0), 'getSegmentationCode #0');
  });

  /**
   * Tests for {@link getConceptNameCode}.
   *
   * @function module:tests/dicom~getconceptnamecode
   */
  test('getConceptNameCode', () => {
    const code0 = getConceptNameCode('test');
    assert.equal(code0, undefined, 'getConceptNameCode #0');

    const code1 = getConceptNameCode('longAxis');
    const theoCode1 = new DicomCode('longAxis');
    theoCode1.value = '103339001';
    theoCode1.schemeDesignator = 'SCT';
    assert.ok(isEqualCode(code1, theoCode1), 'getConceptNameCode #1');
  });

  /**
   * Tests for {@link getMeasurementUnitsCode}.
   *
   * @function module:tests/dicom~getmeasurementunitscode
   */
  test('getMeasurementUnitsCode', () => {
    const code0 = getMeasurementUnitsCode('test');
    const theoCode0 = new DicomCode('No units');
    theoCode0.value = '1';
    theoCode0.schemeDesignator = 'UCUM';
    assert.ok(isEqualCode(code0, theoCode0), 'getMeasurementUnitsCode #0');

    const code1 = getMeasurementUnitsCode('unit.mm');
    const theoCode1 = new DicomCode('unit.mm');
    theoCode1.value = 'mm';
    theoCode1.schemeDesignator = 'UCUM';
    assert.ok(isEqualCode(code1, theoCode1), 'getMeasurementUnitsCode #1');
  });

});
