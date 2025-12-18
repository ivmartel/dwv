import {describe, test, assert} from 'vitest';
import {
  ImageReference,
  getImageReference,
  getDicomImageReferenceItem
} from '../../src/dicom/dicomImageReference.js';
import {DataElement} from '../../src/dicom/dataElement.js';
import {
  SopInstanceReference
} from '../../src/dicom/dicomSopInstanceReference.js';

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  ReferencedFrameNumber: '00081160',
  ReferencedSOPSequence: '00081199',
  ReferencedSegmentNumber: '0062000B',
  ReferencedSOPClassUID: '00081150',
  ReferencedSOPInstanceUID: '00081155'
};


/**
 * Tests for the 'dicom/dicomImageReference.js' file.
 */

describe('dicom', () => {

  describe('ImageReference', () => {

    test('constructor creates instance with undefined properties', () => {
      const ref = new ImageReference();
      assert.isUndefined(ref.referencedSOPSequence);
      assert.isUndefined(ref.referencedFrameNumber);
      assert.isUndefined(ref.referencedSegmentNumber);
    });

    test('toString combines SOP and frame when frame present', () => {
      const sopRef = new SopInstanceReference();
      sopRef.referencedSOPClassUID = '1.2.3';
      sopRef.referencedSOPInstanceUID = '4.5.6';

      const ref = new ImageReference();
      ref.referencedSOPSequence = sopRef;
      ref.referencedFrameNumber = '12';

      const out = ref.toString();
      assert.equal(out, '4.5.6 (class: 1.2.3), frame: 12');
    });

  });

  describe('getImageReference', () => {

    test('extracts frame, sop sequence and segment number', () => {
      const deFrame = new DataElement('IS');
      deFrame.value = ['7'];

      const sopDeClass = new DataElement('UI');
      sopDeClass.value = ['1.2.3'];
      const sopDeInst = new DataElement('UI');
      sopDeInst.value = ['4.5.6'];

      const sopItem = {
        [TagKeys.ReferencedSOPClassUID]: sopDeClass,
        [TagKeys.ReferencedSOPInstanceUID]: sopDeInst
      };
      const deSopSeq = new DataElement('SQ');
      deSopSeq.value = [sopItem];

      const deSeg = new DataElement('IS');
      deSeg.value = ['3'];

      const dataElements = {
        [TagKeys.ReferencedFrameNumber]: deFrame,
        [TagKeys.ReferencedSOPSequence]: deSopSeq,
        [TagKeys.ReferencedSegmentNumber]: deSeg
      };

      const ref = getImageReference(dataElements);

      assert.equal(ref.referencedFrameNumber, '7');
      assert.equal(ref.referencedSegmentNumber, '3');
      assert.ok(ref.referencedSOPSequence);
      assert.equal(ref.referencedSOPSequence.referencedSOPClassUID, '1.2.3');
      assert.equal(ref.referencedSOPSequence.referencedSOPInstanceUID, '4.5.6');
    });

    test('handles missing optional tags', () => {
      const sopDeClass = new DataElement('UI');
      sopDeClass.value = ['1.2.3'];
      const sopDeInst = new DataElement('UI');
      sopDeInst.value = ['4.5.6'];
      const sopItem = {
        [TagKeys.ReferencedSOPClassUID]: sopDeClass,
        [TagKeys.ReferencedSOPInstanceUID]: sopDeInst
      };
      const deSopSeq = new DataElement('SQ');
      deSopSeq.value = [sopItem];

      const dataElements = {
        [TagKeys.ReferencedSOPSequence]: deSopSeq
      };

      const ref = getImageReference(dataElements);

      assert.isUndefined(ref.referencedFrameNumber);
      assert.isUndefined(ref.referencedSegmentNumber);
      assert.ok(ref.referencedSOPSequence);
      assert.equal(ref.referencedSOPSequence.referencedSOPInstanceUID, '4.5.6');
    });

    test('returns empty ImageReference when no tags', () => {
      const ref = getImageReference({});
      assert.isUndefined(ref.referencedSOPSequence);
      assert.isUndefined(ref.referencedFrameNumber);
      assert.isUndefined(ref.referencedSegmentNumber);
    });

  });

  describe('getDicomImageReferenceItem', () => {

    test('converts full ImageReference to DICOM item', () => {
      const sopRef = new SopInstanceReference();
      sopRef.referencedSOPClassUID = '1.2.3';
      sopRef.referencedSOPInstanceUID = '4.5.6';

      const ref = new ImageReference();
      ref.referencedSOPSequence = sopRef;
      ref.referencedFrameNumber = '7';
      ref.referencedSegmentNumber = '3';

      const item = getDicomImageReferenceItem(ref);

      assert.equal(item.ReferencedFrameNumber, '7');
      assert.equal(item.ReferencedSegmentNumber, '3');
      assert.ok(item.ReferencedSOPSequence);
      assert.ok(Array.isArray(item.ReferencedSOPSequence.value));
      const sopItem = item.ReferencedSOPSequence.value[0];
      assert.equal(sopItem.ReferencedSOPClassUID, '1.2.3');
      assert.equal(sopItem.ReferencedSOPInstanceUID, '4.5.6');
    });

    test('omits undefined fields when converting', () => {
      const sopRef = new SopInstanceReference();
      sopRef.referencedSOPInstanceUID = '4.5.6';

      const ref = new ImageReference();
      ref.referencedSOPSequence = sopRef;

      const item = getDicomImageReferenceItem(ref);
      assert.isUndefined(item.ReferencedFrameNumber);
      assert.isUndefined(item.ReferencedSegmentNumber);
      assert.ok(item.ReferencedSOPSequence);
      const sopItem = item.ReferencedSOPSequence.value[0];
      assert.equal(sopItem.ReferencedSOPInstanceUID, '4.5.6');
    });

  });

  describe('round-trip conversion via items', () => {

    test('dataElements -> ImageReference -> item -> ImageReference', () => {
      const sopDeClass = new DataElement('UI');
      sopDeClass.value = ['1.2.3'];
      const sopDeInst = new DataElement('UI');
      sopDeInst.value = ['4.5.6'];
      const sopItem = {
        [TagKeys.ReferencedSOPClassUID]: sopDeClass,
        [TagKeys.ReferencedSOPInstanceUID]: sopDeInst
      };
      const deSopSeq = new DataElement('SQ');
      deSopSeq.value = [sopItem];

      const deFrame = new DataElement('IS');
      deFrame.value = ['2'];

      const dataElements = {
        [TagKeys.ReferencedSOPSequence]: deSopSeq,
        [TagKeys.ReferencedFrameNumber]: deFrame
      };

      const ref1 = getImageReference(dataElements);
      const item = getDicomImageReferenceItem(ref1);

      // create new ImageReference from item
      const ref2 = new ImageReference();
      if (typeof item.ReferencedSOPSequence !== 'undefined') {
        // reconstruct SopInstanceReference from simple item
        const sopSimple = item.ReferencedSOPSequence.value[0];
        const sopRef2 = new SopInstanceReference();
        if (typeof sopSimple.ReferencedSOPClassUID !== 'undefined') {
          sopRef2.referencedSOPClassUID = sopSimple.ReferencedSOPClassUID;
        }
        if (typeof sopSimple.ReferencedSOPInstanceUID !== 'undefined') {
          sopRef2.referencedSOPInstanceUID = sopSimple.ReferencedSOPInstanceUID;
        }
        ref2.referencedSOPSequence = sopRef2;
      }
      if (typeof item.ReferencedFrameNumber !== 'undefined') {
        ref2.referencedFrameNumber = item.ReferencedFrameNumber;
      }

      assert.equal(ref1.referencedFrameNumber, ref2.referencedFrameNumber);
      assert.equal(ref1.referencedSOPSequence.referencedSOPInstanceUID,
        ref2.referencedSOPSequence.referencedSOPInstanceUID);
    });

  });

});
