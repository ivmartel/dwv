import {describe, test, assert} from 'vitest';
import {
  postLoadVolumeIdCandidates,
  getVolumeIdTagValue
} from '../../src/dicom/dicomVolume.js';
import {DataElement} from '../../src/dicom/dataElement.js';

/**
 * Tests for the 'dicom/dicomVolume.js' file.
 */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  SOPClassUID: '00080016',
  AcquisitionTime: '00080032',
  DiffusionBValue: '00189087',
  TemporalPositionIdentifier: '00200100',
  TemporalPositionIndex: '00209128',
  PerFrameFunctionalGroupsSequence: '52009230',
  FrameContentSequence: '00209111',
  EchoTime: '00180081',
  TriggerTime: '00181060',
  InversionTime: '00180082'
};

/**
 * Create DICOM elements for a multi-frame file whose frames all
 * share the given TemporalPositionIndex.
 *
 * @param {number} temporalPositionIndex The per-frame temporal
 *   position index value.
 * @param {number} [numberOfFrames] Optional number of frames
 *   (defaults to 2).
 * @returns {Record<string, DataElement>} The DICOM elements.
 */
function makeMultiFrameElements(temporalPositionIndex, numberOfFrames) {
  numberOfFrames = typeof numberOfFrames === 'undefined' ? 2 : numberOfFrames;
  const frameContentItem = {
    [TagKeys.TemporalPositionIndex]:
      makeDataElement('US', [temporalPositionIndex.toString()])
  };
  const perFrameGroupItem = {
    [TagKeys.FrameContentSequence]: makeDataElement('SQ', [frameContentItem])
  };
  const perFrameGroups = [];
  for (let i = 0; i < numberOfFrames; ++i) {
    perFrameGroups.push(perFrameGroupItem);
  }
  return {
    [TagKeys.PerFrameFunctionalGroupsSequence]:
      makeDataElement('SQ', perFrameGroups)
  };
}

/**
 * Create a data element with a given VR and value.
 *
 * @param {string} vr The value representation.
 * @param {Array} value The element value.
 * @returns {DataElement} The data element.
 */
function makeDataElement(vr, value) {
  const de = new DataElement(vr);
  de.value = value;
  return de;
}

/**
 * Get a candidate getter by name.
 *
 * @param {string} name The candidate name.
 * @returns {Function} The getter.
 */
function getCandidate(name) {
  const candidate = postLoadVolumeIdCandidates.find(
    item => item.name === name);
  return candidate.getter;
}

describe('dicom', () => {

  describe('postLoadVolumeIdCandidates', () => {

    test('has AcquisitionTime last', () => {
      const names = postLoadVolumeIdCandidates.map(item => item.name);
      assert.equal(names[names.length - 1], 'AcquisitionTime');
    });

    test('TemporalPositionIdentifier getter', () => {
      const getter = getCandidate('TemporalPositionIdentifier');
      const elements = {
        [TagKeys.TemporalPositionIdentifier]: makeDataElement('IS', ['3'])
      };
      assert.equal(getter(elements), 3);
    });

    test('TemporalPositionIdentifier getter with no tag', () => {
      const getter = getCandidate('TemporalPositionIdentifier');
      assert.equal(getter({}), undefined);
    });

    test('EchoTime getter', () => {
      const getter = getCandidate('EchoTime');
      const elements = {
        [TagKeys.EchoTime]: makeDataElement('DS', ['35.5'])
      };
      assert.equal(getter(elements), 35.5);
    });

    test('EchoTime getter with no tag', () => {
      const getter = getCandidate('EchoTime');
      assert.equal(getter({}), undefined);
    });

    test('TriggerTime getter', () => {
      const getter = getCandidate('TriggerTime');
      const elements = {
        [TagKeys.TriggerTime]: makeDataElement('DS', ['120'])
      };
      assert.equal(getter(elements), 120);
    });

    test('InversionTime getter', () => {
      const getter = getCandidate('InversionTime');
      const elements = {
        [TagKeys.InversionTime]: makeDataElement('DS', ['800'])
      };
      assert.equal(getter(elements), 800);
    });

    test('AcquisitionTime getter', () => {
      const getter = getCandidate('AcquisitionTime');
      const elements = {
        [TagKeys.AcquisitionTime]: makeDataElement('TM', ['101112'])
      };
      assert.equal(getter(elements), 101112);
    });

    test('DiffusionBValue getter uses root level tag for MR', () => {
      const getter = getCandidate('DiffusionBValue');
      const elements = {
        [TagKeys.SOPClassUID]: makeDataElement(
          'UI', ['1.2.840.10008.5.1.4.1.1.4']),
        [TagKeys.DiffusionBValue]: makeDataElement('FD', [800])
      };
      assert.equal(getter(elements), 800);
    });

    test('DiffusionBValue getter returns undefined for non MR', () => {
      const getter = getCandidate('DiffusionBValue');
      const elements = {
        [TagKeys.SOPClassUID]: makeDataElement(
          'UI', ['1.2.840.10008.5.1.4.1.1.2']),
        [TagKeys.DiffusionBValue]: makeDataElement('FD', [800])
      };
      assert.equal(getter(elements), undefined);
    });

    test('TemporalPositionIndex getter', () => {
      const getter = getCandidate('TemporalPositionIndex');
      const elements = makeMultiFrameElements(2);
      assert.equal(getter(elements), 2);
    });

    test('TemporalPositionIndex getter with no tag', () => {
      const getter = getCandidate('TemporalPositionIndex');
      assert.equal(getter({}), undefined);
    });

    test('TemporalPositionIndex getter with varying value', () => {
      const getter = getCandidate('TemporalPositionIndex');
      const elements = makeMultiFrameElements(2);
      // second frame has a different temporal position: inconsistent,
      // candidate should not be usable for this file
      elements[TagKeys.PerFrameFunctionalGroupsSequence].value[1] = {
        [TagKeys.FrameContentSequence]: makeDataElement('SQ', [{
          [TagKeys.TemporalPositionIndex]: makeDataElement('US', ['3'])
        }])
      };
      assert.equal(getter(elements), undefined);
    });

  });

  describe('getVolumeIdTagValue', () => {

    test('uses TemporalPositionIdentifier if present', () => {
      const elements = {
        [TagKeys.TemporalPositionIdentifier]: makeDataElement('IS', ['3'])
      };
      assert.equal(getVolumeIdTagValue(elements), 3);
    });

    test('prefers TemporalPositionIdentifier over TemporalPositionIndex',
      () => {
        const elements = makeMultiFrameElements(2);
        elements[TagKeys.TemporalPositionIdentifier] =
          makeDataElement('IS', ['5']);
        assert.equal(getVolumeIdTagValue(elements), 5);
      });

    test('uses TemporalPositionIndex for multi-frame files', () => {
      const elements = makeMultiFrameElements(2);
      assert.equal(getVolumeIdTagValue(elements), 2);
    });

    test('falls back to MR diffusion b-value with no frame tag', () => {
      const elements = {
        [TagKeys.SOPClassUID]: makeDataElement(
          'UI', ['1.2.840.10008.5.1.4.1.1.4']),
        [TagKeys.DiffusionBValue]: makeDataElement('FD', [800])
      };
      assert.equal(getVolumeIdTagValue(elements), 800);
    });

    test('returns undefined with no usable tag', () => {
      assert.equal(getVolumeIdTagValue({}), undefined);
    });

  });

});
