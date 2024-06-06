import {
  DicomSegmentFrameInfo,
  getSegmentFrameInfo,
  isEqualSegmentFrameInfo,
  getDicomSegmentFrameInfoItem
} from '../../src/dicom/dicomSegmentFrameInfo';
import {getElementsFromJSONTags} from '../../src/dicom/dicomWriter';

/**
 * Tests for the 'dicom/dicomSegmentFrameInfo.js' file.
 */

/* global QUnit */
QUnit.module('dicom');

/**
 * SegmentFrameInfo test: translate to element and back.
 *
 * @param {object} frameInfo The frameInfo as an object.
 * @param {object} assert The QUnit assert.
 * @param {string} testName The test name.
 */
function testSegmentFrameInfo(frameInfo, assert, testName) {
  // frame info -> simple dicom element
  // (treat simple code as code)
  const frameInfoSimpleElements = getDicomSegmentFrameInfoItem(frameInfo);
  // translate to frame info to be able to compare
  const frameInfo1 = {
    dimIndex:
      frameInfoSimpleElements.FrameContentSequence
        .value[0].DimensionIndexValues,
    imagePosPat:
      frameInfoSimpleElements.PlanePositionSequence
        .value[0].ImagePositionPatient,
    derivationImages: [
      {
        sourceImages: frameInfoSimpleElements.DerivationImageSequence
          .value[0].SourceImageSequence.value
      }
    ],
    refSegmentNumber:
      frameInfoSimpleElements.SegmentIdentificationSequence
        .value[0].ReferencedSegmentNumber,
  };
  assert.ok(isEqualSegmentFrameInfo(frameInfo1, frameInfo),
    testName + ' frame info from simple element');

  // simple dicom element -> dicom element
  const segmentElements = getElementsFromJSONTags(frameInfoSimpleElements);
  // dicom element -> frame info
  const frameInfo2 = getSegmentFrameInfo(segmentElements);
  // compare
  assert.ok(isEqualSegmentFrameInfo(frameInfo2, frameInfo),
    testName + ' frame info from element');
}

/**
 * Tests for {@link DicomSegmentFrameInfo} using simple DICOM data.
 *
 * @function module:tests/dicom~dicom-segment-frame-info-class
 */
QUnit.test('DICOM segment frame info class', function (assert) {
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
  const dsfi00 = new DicomSegmentFrameInfo(
    dimIndex0, imagePosPat0, derivationImages0, refSegmentNumber0);
  assert.equal(dsfi00.dimIndex, dimIndex0,
    'Test #00 dimIndex');
  assert.equal(dsfi00.imagePosPat, imagePosPat0,
    'Test #00 imagePosPat');
  assert.equal(dsfi00.derivationImages, derivationImages0,
    'Test #00 derivationImages');
  assert.equal(dsfi00.refSegmentNumber, refSegmentNumber0,
    'Test #00 refSegmentNumber');

  const frameInfo01 = {
    dimIndex: dimIndex0,
    imagePosPat: imagePosPat0,
    derivationImages: derivationImages0,
    refSegmentNumber: refSegmentNumber0
  };
  testSegmentFrameInfo(frameInfo01, assert, 'Test #01');
});
