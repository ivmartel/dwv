import {describe, test, assert} from 'vitest';
import {
  MaskSegment,
  isEqualSegment,
  getSegment,
  getDicomSegmentItem
} from '../../src/dicom/dicomSegment.js';
import {
  getElementsFromSimpleTagValues
} from '../../src/dicom/simpleTagValues.js';
import {DicomCode, isEqualCode} from '../../src/dicom/dicomCode.js';
import {cielabToSrgb, uintLabToLab} from '../../src/utils/colour.js';

/**
 * @import {DataElement} from '../../src/dicom/dataElement.js';
 * @import {DicomCode} from '../../src/dicom/dicomCode.js';
 */

/**
 * Tests for the 'dicom/dicomSegment.js' file.
 */

describe('dicom', () => {

  /**
   * Get a dicom code from simple dicom elements.
   *
   * @param {Record<string, DataElement>} simpleElements DICOM simple elements.
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
   * @param {string} testName The test name.
   */
  function testSegment(segment, testName) {
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
      `${testName} segment from simple element`);

    // simple dicom element -> dicom element
    const segmentElements =
      getElementsFromSimpleTagValues(segmentSimpleElements);
    // dicom element -> segment
    const segment2 = getSegment(segmentElements);
    // compare
    assert.ok(isEqualSegment(segment2, segment),
      `${testName} segment from element`);
  }

  /**
   * Tests for {@link MaskSegment} using simple DICOM data.
   *
   * @function module:tests/dicom~dicomSegmentClass
   */
  test('DICOM segment class', () => {
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
    testSegment(segment01, 'Test #01');
  });

  /**
   * Tests for {@link MaskSegment} anatomic region and property type
   *   modifier codes.
   *
   * @function module:tests/dicom~dicomSegmentAnatomicAndModifier
   */
  test('DICOM segment anatomic region and type modifier', () => {
    const categoryCode = new DicomCode('Morphologically Abnormal Structure');
    categoryCode.value = '49755003';
    categoryCode.schemeDesignator = 'SCT';
    const typeCode = new DicomCode('Lesion');
    typeCode.value = '52988006';
    typeCode.schemeDesignator = 'SCT';
    const modifierCode = new DicomCode('High risk');
    modifierCode.value = '15508007';
    modifierCode.schemeDesignator = 'SCT';
    const regionCode = new DicomCode('Prostate');
    regionCode.value = '41216001';
    regionCode.schemeDesignator = 'SCT';
    regionCode.schemeVersion = '2024-03';

    const segment = new MaskSegment(2, 'Lesion 1', 'SEMIAUTOMATIC');
    segment.algorithmName = 'algo';
    segment.displayRGBValue = {r: 255, g: 0, b: 0};
    segment.propertyCategoryCode = categoryCode;
    segment.propertyTypeCode = typeCode;
    segment.propertyTypeModifierCodes = [modifierCode];
    segment.anatomicRegionCodes = [regionCode];

    // segment -> simple dicom element
    const item = getDicomSegmentItem(segment);
    // item elements in tag order
    assert.deepEqual(Object.keys(item), [
      'AnatomicRegionSequence',
      'SegmentedPropertyCategoryCodeSequence',
      'SegmentNumber',
      'SegmentLabel',
      'SegmentAlgorithmType',
      'SegmentAlgorithmName',
      'RecommendedDisplayCIELabValue',
      'SegmentedPropertyTypeCodeSequence'
    ], 'segment item keys and order');
    // modifier is in the type code item
    const typeItem = item.SegmentedPropertyTypeCodeSequence.value[0];
    assert.ok(
      typeof typeItem.SegmentedPropertyTypeModifierCodeSequence !==
      'undefined',
      'modifier in type code item');

    // simple dicom element -> dicom element -> segment
    const segment2 = getSegment(getElementsFromSimpleTagValues(item));
    assert.ok(isEqualSegment(segment2, segment), 'segment round trip');
    assert.equal(segment2.propertyTypeModifierCodes.length, 1,
      'modifier codes length');
    assert.ok(isEqualCode(segment2.propertyTypeModifierCodes[0], modifierCode),
      'modifier code');
    assert.equal(segment2.anatomicRegionCodes.length, 1,
      'anatomic region codes length');
    assert.ok(isEqualCode(segment2.anatomicRegionCodes[0], regionCode),
      'anatomic region code');
    assert.equal(segment2.anatomicRegionCodes[0].schemeVersion, '2024-03',
      'anatomic region code scheme version');

    // no modifier nor anatomic region
    const segment3 = new MaskSegment(1, 'Prostate', 'AUTOMATIC');
    segment3.displayValue = 1;
    segment3.propertyCategoryCode = categoryCode;
    segment3.propertyTypeCode = typeCode;
    const item3 = getDicomSegmentItem(segment3);
    assert.equal(item3.AnatomicRegionSequence, undefined,
      'no anatomic region');
    assert.equal(
      item3.SegmentedPropertyTypeCodeSequence.value[0]
        .SegmentedPropertyTypeModifierCodeSequence,
      undefined,
      'no modifier');
    const segment4 = getSegment(getElementsFromSimpleTagValues(item3));
    assert.equal(segment4.propertyTypeModifierCodes, undefined,
      'no read modifier');
    assert.equal(segment4.anatomicRegionCodes, undefined,
      'no read anatomic region');
  });

});
