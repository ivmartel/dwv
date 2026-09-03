import {describe, test, assert} from 'vitest';
import {
  DicomFunctionalGroup,
  getFunctionalGroup,
  isEqualFunctionalGroup,
  getDicomFunctionalGroupItem
} from '../../src/dicom/dicomFunctionalGroup.js';
import {
  getElementsFromSimpleTagValues
} from '../../src/dicom/simpleTagValues.js';

/**
 * Tests for the 'dicom/dicomFunctionalGroup.js' file.
 */

describe('dicom', () => {

  /**
   * Functional group test: translate to element and back.
   *
   * @param {object} funcGroup The functional group as an object.
   * @param {string} testName The test name.
   */
  function testFunctionalGroup(funcGroup, testName) {
    // functional group -> simple dicom element
    // (treat simple code as code)
    const funcGroupSimpleElements = getDicomFunctionalGroupItem(funcGroup);
    // translate to func group to be able to compare
    const funcGroup1 = {
      dimIndex:
        funcGroupSimpleElements.FrameContentSequence
          .value[0].DimensionIndexValues,
      imagePosPat:
        funcGroupSimpleElements.PlanePositionSequence
          .value[0].ImagePositionPatient,
      derivationImages: [
        {
          sourceImages: funcGroupSimpleElements.DerivationImageSequence
            .value[0].SourceImageSequence.value
        }
      ],
      refSegmentNumber:
        funcGroupSimpleElements.SegmentIdentificationSequence
          .value[0].ReferencedSegmentNumber,
    };
    assert.ok(isEqualFunctionalGroup(funcGroup1, funcGroup),
      `${testName} func group from simple element`);

    // simple dicom element -> dicom element
    const segmentElements =
      getElementsFromSimpleTagValues(funcGroupSimpleElements);
    // dicom element -> functional group
    const funcGroup2 = getFunctionalGroup(segmentElements);
    // compare
    assert.ok(isEqualFunctionalGroup(funcGroup2, funcGroup),
      `${testName} func group from element`);
  }

  /**
   * Tests for {@link DicomFunctionalGroup} using simple DICOM data.
   *
   * @function module:tests/dicom~dicomFunctionalGroupClass
   */
  test('DICOM segment functional group class', () => {
    const dimIndex0 = [1, 1];
    const imagePosPat0 = [0.5, 0.5, 0.5];
    // tests only supports simple 1D arrays of objects
    const derivationImages0 = [
      {
        sourceImages: [
          {
            referencedSOPClassUID: '',
            referencedSOPInstanceUID: ''
          }
        ]
      }
    ];
    const refSegmentNumber0 = 0;
    const group00 = new DicomFunctionalGroup(
      dimIndex0, imagePosPat0, derivationImages0, refSegmentNumber0);
    assert.equal(group00.dimIndex, dimIndex0,
      'Test #00 dimIndex');
    assert.equal(group00.imagePosPat, imagePosPat0,
      'Test #00 imagePosPat');
    assert.equal(group00.derivationImages, derivationImages0,
      'Test #00 derivationImages');
    assert.equal(group00.refSegmentNumber, refSegmentNumber0,
      'Test #00 refSegmentNumber');

    const funcGroup01 = {
      dimIndex: dimIndex0,
      imagePosPat: imagePosPat0,
      derivationImages: derivationImages0,
      refSegmentNumber: refSegmentNumber0
    };
    testFunctionalGroup(funcGroup01, 'Test #01');
  });

});
