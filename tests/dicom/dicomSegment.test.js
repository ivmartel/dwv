import {
  MaskSegment,
  isEqualSegment,
  getSegment,
  getDicomSegmentItem
} from '../../src/dicom/dicomSegment';
import {getElementsFromJSONTags} from '../../src/dicom/dicomWriter';
import {cielabToSrgb, uintLabToLab} from '../../src/utils/colour';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from '../../src/dicom/dataElement';
import {DicomCode} from '../../src/dicom/dicomCode';
/* eslint-enable no-unused-vars */

/**
 * Tests for the 'dicom/dicomSegment.js' file.
 */

/* global QUnit */
QUnit.module('dicom');

/**
 * Get a dicom code from simple dicom elements.
 *
 * @param {Object<string, DataElement>} simpleElements DICOM simple elements.
 * @returns {DicomCode} The corresponding DICOM code.
 */
function getCodeFromSimpleDicom(simpleElements) {
  return {
    meaning: simpleElements.CodeMeaning,
    value: simpleElements.CodeValue,
    schemeDesignator: simpleElements.CodingSchemeDesignator,
    longValue: simpleElements.LongCodeValue,
    urnValue: simpleElements.URNCodeValue
  };
}

/**
 * MaskSegment test: translate to element and back.
 *
 * @param {object} segment The segment as an object.
 * @param {object} assert The QUnit assert.
 * @param {string} testName The test name.
 */
function testSegment(segment, assert, testName) {
  // segment -> simple dicom element
  // (treat simple code as code)
  const segmentSimpleElements = getDicomSegmentItem(segment);
  // cielab to RGB
  const cielabElement = segmentSimpleElements.RecommendedDisplayCIELabValue;
  const rgb = cielabToSrgb(uintLabToLab({
    l: cielabElement[0],
    a: cielabElement[1],
    b: cielabElement[2]
  }));
  // translate to segment to be able to compare
  const segment1 = {
    number: segmentSimpleElements.SegmentNumber,
    label: segmentSimpleElements.SegmentLabel,
    algorithmType: segmentSimpleElements.SegmentAlgorithmType,
    displayRGBValue: rgb,
    propertyCategoryCode: getCodeFromSimpleDicom(
      segmentSimpleElements.SegmentedPropertyCategoryCodeSequence.value[0]),
    propertyTypeCode: getCodeFromSimpleDicom(
      segmentSimpleElements.SegmentedPropertyTypeCodeSequence.value[0]),
  };
  assert.ok(isEqualSegment(segment1, segment),
    testName + ' segment from simple element');

  // simple dicom element -> dicom element
  const segmentElements = getElementsFromJSONTags(segmentSimpleElements);
  // dicom element -> segment
  const segment2 = getSegment(segmentElements);
  // compare
  assert.ok(isEqualSegment(segment2, segment),
    testName + ' segment from element');
}

/**
 * Tests for {@link MaskSegment} using simple DICOM data.
 *
 * @function module:tests/dicom~dicom-segment-class
 */
QUnit.test('DICOM segment class', function (assert) {
  const number0 = 0;
  const label0 = 'Segment0';
  const algorithmType0 = 'MANUAL';
  const segment00 = new MaskSegment(number0, label0, algorithmType0);
  assert.equal(segment00.number, number0,
    'Test #00 number');
  assert.equal(segment00.label, label0,
    'Test #00 label');
  assert.equal(segment00.algorithmType, algorithmType0,
    'Test #00 algorithm type');

  const code01 = {
    meaning: 'Dimeglumine gadopentetate 469.01mg/mL inj soln 15mL pfld syr',
    value: '406400000',
    schemeDesignator: 'SCT',
    longValue: undefined,
    urnValue: undefined
  };

  const segment01 = {
    number: number0,
    label: label0,
    algorithmType: algorithmType0,
    displayRGBValue: {r: 255, g: 0, b: 0},
    propertyCategoryCode: code01,
    propertyTypeCode: code01,
    trackingId: '01234',
    trackingUid: '01234'
  };
  testSegment(segment01, assert, 'Test #01');
});
