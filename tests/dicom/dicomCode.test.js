import {describe, test, assert} from 'vitest';
import {
  DcmCodes,
  DicomCode,
  isEqualCode,
  getCode,
  getDicomCodeItem,
  getSegmentationCode,
  getConceptNameCode,
  getMeasurementUnitsCode,
  getQuantificationName,
  getDerivationCode,
  getDerivationQuantificationName,
  isDerivationQuantification,
  getIntensityConceptCode,
  getDwvDicomCode,
  DwvCodes,
  getEnglishLanguageCode,
  getImagingProcedureCode
} from '../../src/dicom/dicomCode.js';
import {
  getElementsFromSimpleTagValues
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
    const codeElements = getElementsFromSimpleTagValues(codeSimpleElements);
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
    // see https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_8.10.html

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

    // coding scheme version
    const code05 = new DicomCode('Prostate');
    code05.value = '41216001';
    code05.schemeDesignator = 'SCT';
    code05.schemeVersion = '2024-03';
    const item05 = getDicomCodeItem(code05);
    assert.deepEqual(Object.keys(item05), [
      'CodeValue',
      'CodingSchemeDesignator',
      'CodingSchemeVersion',
      'CodeMeaning'
    ], 'Test #05 item keys and order');
    const code05b = getCode(getElementsFromSimpleTagValues(item05));
    assert.equal(code05b.schemeVersion, '2024-03',
      'Test #05 scheme version');
    // no version without designator
    const code06 = new DicomCode('HIPAA Privacy Rule');
    code06.urnValue = 'urn:lex:us:federal';
    code06.schemeVersion = '1';
    const item06 = getDicomCodeItem(code06);
    assert.equal(item06.CodingSchemeVersion, undefined,
      'Test #06 no scheme version without designator');
    const code06b = getCode(getElementsFromSimpleTagValues({
      URNCodeValue: 'urn:lex:us:federal',
      CodingSchemeVersion: '1',
      CodeMeaning: 'HIPAA Privacy Rule'
    }));
    assert.equal(code06b.schemeVersion, undefined,
      'Test #06 scheme version not read without designator');

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
    assert.equal(code1.meaning, 'Long Axis', 'getConceptNameCode #1 meaning');

    // DCM code: meaning from the DICOM definition, not the name
    const code2 = getConceptNameCode('height');
    assert.equal(code2.value, '121207', 'getConceptNameCode #2 value');
    assert.equal(code2.schemeDesignator, 'DCM', 'getConceptNameCode #2 scheme');
    assert.equal(code2.meaning, 'Height', 'getConceptNameCode #2 meaning');

    // legacy statistic code
    const code3 = getConceptNameCode('min');
    assert.equal(code3.meaning, 'Pixel by pixel Minimum',
      'getConceptNameCode #3 meaning');
    assert.equal(getQuantificationName(code3), 'min',
      'getQuantificationName #3');
  });

  /**
   * Tests for {@link getDerivationCode}.
   *
   * @function module:tests/dicom~getderivationcode
   */
  test('getDerivationCode', () => {
    assert.equal(getDerivationCode('test'), undefined,
      'getDerivationCode #0');
    assert.notOk(isDerivationQuantification('length'),
      'isDerivationQuantification length');

    const names = {
      min: {value: '255605001', meaning: 'Minimum'},
      max: {value: '56851009', meaning: 'Maximum'},
      mean: {value: '373098007', meaning: 'Mean'},
      median: {value: '373099004', meaning: 'Median'},
      stdDev: {value: '386136009', meaning: 'Standard Deviation'}
    };
    for (const name in names) {
      assert.ok(isDerivationQuantification(name),
        `isDerivationQuantification ${name}`);
      const code = getDerivationCode(name);
      assert.equal(code.schemeDesignator, 'SCT', `${name} scheme`);
      assert.equal(code.value, names[name].value, `${name} value`);
      assert.equal(code.meaning, names[name].meaning, `${name} meaning`);
      assert.equal(getDerivationQuantificationName(code), name,
        `${name} reverse`);
    }
  });

  /**
   * Tests for {@link getIntensityConceptCode}.
   *
   * @function module:tests/dicom~getintensityconceptcode
   */
  test('getIntensityConceptCode', () => {
    const ct = getIntensityConceptCode('CT');
    assert.equal(ct.value, '112031', 'CT value');
    assert.equal(ct.meaning, 'Attenuation Coefficient', 'CT meaning');
    const mr = getIntensityConceptCode('MR');
    assert.equal(mr.value, '110852', 'MR value');
    assert.equal(getIntensityConceptCode('PT'), undefined, 'PT');
    assert.equal(getIntensityConceptCode('XA'), undefined, 'XA');
  });

  /**
   * Tests for report level codes.
   *
   * @function module:tests/dicom~reportcodes
   */
  test('report codes', () => {
    const colour = getDwvDicomCode(DwvCodes.Colour);
    assert.equal(colour.schemeDesignator, '99DWV', 'dwv scheme');
    assert.equal(colour.value, 'COLOUR', 'dwv value');

    const language = getEnglishLanguageCode();
    assert.equal(language.schemeDesignator, 'RFC5646', 'language scheme');
    assert.equal(language.value, 'en-US', 'language value');

    const procedure = getImagingProcedureCode();
    assert.equal(procedure.schemeDesignator, 'SCT', 'procedure scheme');
    assert.equal(procedure.value, '363679005', 'procedure value');
    assert.equal(procedure.meaning, 'Imaging procedure', 'procedure meaning');

    assert.equal(DcmCodes.ProcedureReported.meaning, 'Procedure reported',
      'procedure reported meaning');
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
    assert.equal(code1.meaning, 'millimeter',
      'getMeasurementUnitsCode #1 meaning');
    assert.equal(code0.meaning, 'no units',
      'getMeasurementUnitsCode #0 meaning');
  });

});
