import {
  DcmCodes,
  DicomCode,
  isEqualCode,
  getCode,
  getDicomCodeItem
} from '../../src/dicom/dicomCode.js';
import {getElementsFromJSONTags} from '../../src/dicom/dicomWriter.js';

/**
 * Tests for the 'dicom/dicomCode.js' file.
 */
/** @module tests/dicom */

/* global QUnit */
QUnit.module('dicom');

/**
 * DicomCode test: translate to element and back.
 *
 * @param {object} code The code as an object.
 * @param {object} assert The QUnit assert.
 * @param {string} testName The test name.
 */
function testCode(code, assert, testName) {
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
    testName + ' code from simple element');

  // simple dicom element -> dicom element
  const codeElements = getElementsFromJSONTags(codeSimpleElements);
  // dicom element -> code
  const code2 = getCode(codeElements);
  // compare
  assert.ok(isEqualCode(code2, code),
    testName + ' code from element');
}

/**
 * Tests for {@link DicomCode} using simple DICOM data.
 *
 * @function module:tests/dicom~dicom-code-class
 */
QUnit.test('DICOM code class', function (assert) {
  const meaning0 = 'code0';
  const code00 = new DicomCode(meaning0);
  assert.equal(code00.meaning, meaning0,
    'Test #00 meaning');
  assert.equal(code00.value, undefined,
    'Test #00 value');
  assert.equal(code00.schemeDesignator, undefined,
    'Test #00 scheme designator');

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
});

/**
 * Tests for {@link DicomCode} dictionary.
 *
 * @function module:tests/dicom~dicom-code-dict
 */
QUnit.test('DICOM code dictionary', function (assert) {
  let count = 0;
  for (const key0 in DcmCodes) {
    for (const key in DcmCodes) {
      if (key !== key0 &&
        DcmCodes[key].value === DcmCodes[key0].value) {
        ++count;
      }
    }
  }
  assert.equal(count, 0, 'DCmCodes duplicate');
});
