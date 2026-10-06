import {describe, test, assert, vi} from 'vitest';
import {
  volumeIdCandidates,
  getVolumeIdTagValue,
  getVolumeIndices,
  guessVolumeIndices
} from '../../src/dicom/dicomVolume.js';
import {getFrameElements} from '../../src/dicom/dicomFunctionalGroup.js';
import {custom} from '../../src/app/custom.js';
import {logger} from '../../src/utils/logger.js';
import {DataElement} from '../../src/dicom/dataElement.js';
import {DicomParser} from '../../src/dicom/dicomParser.js';
import {transferSyntaxKeywords} from '../../src/dicom/dictionary.js';
import {
  getStructureBuffers,
  singleSliceStructure
} from '../../dev/dicom/dataStructures.js';

import syntheticData from '/tests/data/synthetic-img.json';

/**
 * Tests for the 'dicom/dicomVolume.js' file.
 */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  SOPClassUID: '00080016',
  AcquisitionDate: '00080022',
  AcquisitionTime: '00080032',
  Manufacturer: '00080070',
  DiffusionBValue: '00189087',
  SiemensBValue: '0019100C',
  GEBValue: '00431039',
  HitachiBValue: '00291030',
  TemporalPositionIdentifier: '00200100',
  TemporalPositionIndex: '00209128',
  PerFrameFunctionalGroupsSequence: '52009230',
  MRDiffusionSequence: '00189117',
  FrameContentSequence: '00209111',
  DimensionIndexSequence: '00209222',
  DimensionIndexPointer: '00209165',
  DimensionIndexValues: '00209157',
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
 * Create DICOM elements for an enhanced MR multi-frame file with
 * per-frame diffusion b-values.
 *
 * @param {number[]} bValues The per-frame b-values.
 * @returns {Record<string, DataElement>} The DICOM elements.
 */
function makeEnhancedMRElements(bValues) {
  const perFrameGroups = bValues.map(bValue => ({
    [TagKeys.MRDiffusionSequence]: makeDataElement('SQ', [{
      [TagKeys.DiffusionBValue]: makeDataElement('FD', [bValue])
    }])
  }));
  return {
    [TagKeys.SOPClassUID]: makeDataElement(
      'UI', ['1.2.840.10008.5.1.4.1.1.4.1']),
    [TagKeys.PerFrameFunctionalGroupsSequence]:
      makeDataElement('SQ', perFrameGroups)
  };
}

/**
 * Create DICOM elements for a multi-frame file with per-frame
 * TemporalPositionIndex and/or diffusion b-values.
 *
 * @param {object} frameValues The per-frame values: optional
 *   `temporalPositions`, `bValues` and `dimensionIndexValues` arrays.
 * @param {Record<string, DataElement>} [extraElements] Optional
 *   root elements.
 * @returns {Record<string, DataElement>} The DICOM elements.
 */
function makePerFrameElements(frameValues, extraElements) {
  const lists = Object.values(frameValues);
  const numberOfFrames = lists[0].length;
  const perFrameGroups = [];
  for (let i = 0; i < numberOfFrames; ++i) {
    const group = {};
    const frameContentItem = {};
    if (typeof frameValues.temporalPositions !== 'undefined') {
      frameContentItem[TagKeys.TemporalPositionIndex] =
        makeDataElement('US', [frameValues.temporalPositions[i]]);
    }
    if (typeof frameValues.dimensionIndexValues !== 'undefined') {
      frameContentItem[TagKeys.DimensionIndexValues] =
        makeDataElement('UL', frameValues.dimensionIndexValues[i]);
    }
    group[TagKeys.FrameContentSequence] =
      makeDataElement('SQ', [frameContentItem]);
    if (typeof frameValues.bValues !== 'undefined') {
      group[TagKeys.MRDiffusionSequence] = makeDataElement('SQ', [{
        [TagKeys.DiffusionBValue]:
          makeDataElement('FD', [frameValues.bValues[i]])
      }]);
    }
    perFrameGroups.push(group);
  }
  return {
    ...extraElements,
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
  const candidate = volumeIdCandidates.find(
    item => item.name === name);
  return candidate.getter;
}

describe('dicom', () => {

  describe('volumeIdCandidates', () => {

    test('has AcquisitionTime last', () => {
      const names = volumeIdCandidates.map(item => item.name);
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

    test('EchoTime getter with non numeric value', () => {
      const getter = getCandidate('EchoTime');
      const elements = {
        [TagKeys.EchoTime]: makeDataElement('DS', ['abc'])
      };
      assert.equal(getter(elements), undefined);
    });

    test('TemporalPositionIdentifier getter with non numeric value', () => {
      const getter = getCandidate('TemporalPositionIdentifier');
      const elements = {
        [TagKeys.TemporalPositionIdentifier]: makeDataElement('IS', ['abc'])
      };
      assert.equal(getter(elements), undefined);
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
      // seconds since midnight
      assert.equal(getter(elements), 10 * 3600 + 11 * 60 + 12);
    });

    test('AcquisitionTime getter orders across midnight', () => {
      const getter = getCandidate('AcquisitionTime');
      const before = getter({
        [TagKeys.AcquisitionDate]: makeDataElement('DA', ['20260101']),
        [TagKeys.AcquisitionTime]: makeDataElement('TM', ['235959'])
      });
      const after = getter({
        [TagKeys.AcquisitionDate]: makeDataElement('DA', ['20260102']),
        [TagKeys.AcquisitionTime]: makeDataElement('TM', ['000001'])
      });
      assert.isBelow(before, after);
      assert.equal(after - before, 2);
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

    test('TemporalPositionIndex getter with non numeric value', () => {
      const getter = getCandidate('TemporalPositionIndex');
      const elements = makeMultiFrameElements('abc');
      assert.equal(getter(elements), undefined);
    });

    test('TemporalPositionIndex getter ignores non numeric frame', () => {
      const getter = getCandidate('TemporalPositionIndex');
      const elements = makeMultiFrameElements(2);
      elements[TagKeys.PerFrameFunctionalGroupsSequence].value[1] = {
        [TagKeys.FrameContentSequence]: makeDataElement('SQ', [{
          [TagKeys.TemporalPositionIndex]: makeDataElement('US', ['abc'])
        }])
      };
      assert.equal(getter(elements), 2);
    });

    test('DiffusionBValue getter with per-frame enhanced MR value', () => {
      const getter = getCandidate('DiffusionBValue');
      const elements = makeEnhancedMRElements([500, 500]);
      assert.equal(getter(elements), 500);
    });

    test('DiffusionBValue getter with varying per-frame value', () => {
      const getter = getCandidate('DiffusionBValue');
      // multiple b-values in one file: not a single volume
      const elements = makeEnhancedMRElements([0, 500, 1000]);
      assert.equal(getter(elements), undefined);
    });

    test('DiffusionBValue getter keeps fractional value', () => {
      const getter = getCandidate('DiffusionBValue');
      const elements = {
        [TagKeys.SOPClassUID]: makeDataElement(
          'UI', ['1.2.840.10008.5.1.4.1.1.4']),
        [TagKeys.DiffusionBValue]: makeDataElement('FD', [50.5])
      };
      assert.equal(getter(elements), 50.5);
    });

    test('DiffusionBValue getter with small exponent value', () => {
      const getter = getCandidate('DiffusionBValue');
      const elements = {
        [TagKeys.SOPClassUID]: makeDataElement(
          'UI', ['1.2.840.10008.5.1.4.1.1.4']),
        // parseInt would give 1
        [TagKeys.DiffusionBValue]: makeDataElement('FD', [1e-7])
      };
      assert.equal(getter(elements), 1e-7);
    });

    test('DiffusionBValue getter with non numeric value', () => {
      const getter = getCandidate('DiffusionBValue');
      const elements = {
        [TagKeys.SOPClassUID]: makeDataElement(
          'UI', ['1.2.840.10008.5.1.4.1.1.4']),
        [TagKeys.DiffusionBValue]: makeDataElement('FD', ['abc'])
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

    test('uses explicit VR private b-value', () => {
      const elements = {
        [TagKeys.SOPClassUID]: makeDataElement(
          'UI', ['1.2.840.10008.5.1.4.1.1.4']),
        [TagKeys.Manufacturer]: makeDataElement('LO', ['SIEMENS']),
        [TagKeys.SiemensBValue]: makeDataElement('IS', ['1000'])
      };
      assert.equal(getVolumeIdTagValue(elements), 1000);
    });

    test('decodes implicit VR (UN) private b-value', () => {
      const elements = {
        [TagKeys.SOPClassUID]: makeDataElement(
          'UI', ['1.2.840.10008.5.1.4.1.1.4']),
        [TagKeys.Manufacturer]: makeDataElement('LO', ['SIEMENS']),
        // '1500'
        [TagKeys.SiemensBValue]: makeDataElement(
          'UN', new Uint8Array([0x31, 0x35, 0x30, 0x30]))
      };
      assert.equal(getVolumeIdTagValue(elements), 1500);
    });

    test('decodes multi-valued padded UN private b-value', () => {
      const elements = {
        [TagKeys.SOPClassUID]: makeDataElement(
          'UI', ['1.2.840.10008.5.1.4.1.1.4']),
        [TagKeys.Manufacturer]: makeDataElement('LO', ['GE MEDICAL SYSTEMS']),
        // '500\8 '
        [TagKeys.GEBValue]: makeDataElement(
          'UN', new Uint8Array([0x35, 0x30, 0x30, 0x5C, 0x38, 0x20]))
      };
      assert.equal(getVolumeIdTagValue(elements), 500);
    });

    test('uses Hitachi private b-value', () => {
      const elements = {
        [TagKeys.SOPClassUID]: makeDataElement(
          'UI', ['1.2.840.10008.5.1.4.1.1.4']),
        [TagKeys.Manufacturer]: makeDataElement(
          'LO', ['Hitachi Medical Corporation']),
        [TagKeys.HitachiBValue]: makeDataElement('DS', ['1000'])
      };
      assert.equal(getVolumeIdTagValue(elements), 1000);
    });

    test('falls back to standard b-value on invalid private one', () => {
      const elements = {
        [TagKeys.SOPClassUID]: makeDataElement(
          'UI', ['1.2.840.10008.5.1.4.1.1.4']),
        [TagKeys.Manufacturer]: makeDataElement('LO', ['SIEMENS']),
        [TagKeys.SiemensBValue]: makeDataElement(
          'UN', new Uint8Array([0x00, 0x00])),
        [TagKeys.DiffusionBValue]: makeDataElement('FD', [800])
      };
      assert.equal(getVolumeIdTagValue(elements), 800);
    });

    test('reads padded UN private b-value from generated data', () => {
      // private tag declared as UN to simulate a reader without the
      // vendor dictionary (else the parser fixes the VR)
      const config = structuredClone(syntheticData[0]);
      config.tags.Manufacturer = 'SIEMENS';
      // '500\0'
      config.tags.SiemensBValue = [0x35, 0x30, 0x30, 0x00];
      config.privateDictionary = {
        '0019': {
          '100C': ['UN', '1', 'SiemensBValue']
        }
      };
      const syntaxes = [
        transferSyntaxKeywords.ImplicitVRLittleEndian,
        transferSyntaxKeywords.ExplicitVRLittleEndian
      ];
      for (const syntax of syntaxes) {
        const buffer = getStructureBuffers(
          config, syntax, singleSliceStructure)[0];
        const parser = new DicomParser();
        parser.parse(buffer);
        const elements = parser.getDicomElements();
        assert.equal(elements[TagKeys.SiemensBValue].vr, 'UN',
          `UN vr for ${syntax}`);
        assert.equal(getVolumeIdTagValue(elements), 500,
          `b-value for ${syntax}`);
      }
    });

    test('returns undefined with no usable tag', () => {
      assert.equal(getVolumeIdTagValue({}), undefined);
    });

  });

  describe('getVolumeIdTagValue pre load candidates', () => {

    test('flags the explicit candidates', () => {
      const names = volumeIdCandidates
        .filter(item => item.preLoad === true)
        .map(item => item.name);
      assert.deepEqual(names, [
        'TemporalPositionIdentifier',
        'TemporalPositionIndex',
        'DiffusionBValue'
      ]);
    });

    test('ignores non pre load candidates', () => {
      const elements = {
        [TagKeys.EchoTime]: makeDataElement('DS', ['90'])
      };
      assert.isUndefined(getVolumeIdTagValue(elements));
    });

    test('uses deprecated custom getter with a warning', () => {
      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
      custom.getVolumeIdTagValue = () => 7;
      try {
        assert.equal(getVolumeIdTagValue({}), 7);
        assert.equal(getVolumeIdTagValue({}), 7);
        assert.equal(warnSpy.mock.calls.length, 1, 'warn once');
      } finally {
        custom.getVolumeIdTagValue = undefined;
        warnSpy.mockRestore();
      }
    });

    test('uses custom pre load candidates', () => {
      const elements = {
        [TagKeys.EchoTime]: makeDataElement('DS', ['90']),
        [TagKeys.TemporalPositionIdentifier]: makeDataElement('IS', ['3'])
      };
      custom.volumeIdCandidates = [
        {
          name: 'EchoTime',
          getter: getCandidate('EchoTime'),
          preLoad: true
        },
        {
          name: 'TemporalPositionIdentifier',
          getter: getCandidate('TemporalPositionIdentifier')
        }
      ];
      try {
        assert.equal(getVolumeIdTagValue(elements), 90);
      } finally {
        custom.volumeIdCandidates = undefined;
      }
    });

  });

  describe('getVolumeIndices', () => {

    test('volume-major items', () => {
      assert.deepEqual(
        getVolumeIndices([1, 1, 2, 2], [0, 1, 0, 1], 2),
        [0, 0, 1, 1]);
    });

    test('slice-major items', () => {
      assert.deepEqual(
        getVolumeIndices([1, 2, 1, 2], [0, 0, 1, 1], 2),
        [0, 1, 0, 1]);
    });

    test('scrambled items', () => {
      assert.deepEqual(
        getVolumeIndices([2, 1, 1, 2], [1, 0, 1, 0], 2),
        [1, 0, 0, 1]);
    });

    test('sorts values as numbers', () => {
      assert.deepEqual(
        getVolumeIndices([1000, 50, 0], [0, 0, 0], 1),
        [2, 1, 0]);
    });

    test('accepts fractional values', () => {
      assert.deepEqual(
        getVolumeIndices([0.5, 1.5, 0.5, 1.5], [0, 0, 1, 1], 2),
        [0, 1, 0, 1]);
    });

    test('undefined for invalid groupings', () => {
      // length mismatch
      assert.isUndefined(getVolumeIndices([1, 2], [0, 0, 1], 2));
      // missing value
      assert.isUndefined(
        getVolumeIndices([1, undefined, 2, 2], [0, 1, 0, 1], 2));
      // non number value
      assert.isUndefined(
        getVolumeIndices(['1', '1', '2', '2'], [0, 1, 0, 1], 2));
      assert.isUndefined(
        getVolumeIndices([1, NaN, 2, 2], [0, 1, 0, 1], 2));
      // single value
      assert.isUndefined(
        getVolumeIndices([1, 1, 1, 1], [0, 1, 0, 1], 2));
      // volumes x slices !== items
      assert.isUndefined(
        getVolumeIndices([1, 1, 2, 3], [0, 1, 0, 1], 2));
      // duplicate (slice, volume) pair
      assert.isUndefined(
        getVolumeIndices([1, 1, 2, 2], [0, 0, 1, 1], 2));
    });

  });

  describe('guessVolumeIndices on frames', () => {

    const enhancedMRElements = {
      [TagKeys.SOPClassUID]: makeDataElement(
        'UI', ['1.2.840.10008.5.1.4.1.1.4.1'])
    };

    /**
     * Get the per frame DICOM tags of a multi-frame file.
     *
     * @param {Record<string, DataElement>} elements The DICOM tags.
     * @returns {Record<string, DataElement>[]} The frames DICOM tags.
     */
    function getFramesElements(elements) {
      const numberOfFrames =
        elements[TagKeys.PerFrameFunctionalGroupsSequence].value.length;
      const res = [];
      for (let i = 0; i < numberOfFrames; ++i) {
        res.push(getFrameElements(elements, i));
      }
      return res;
    }

    test('uses varying TemporalPositionIndex first', () => {
      const elements = makePerFrameElements({
        temporalPositions: [2, 2, 1, 1],
        bValues: [0, 1000, 0, 1000]
      }, enhancedMRElements);
      const res = guessVolumeIndices(
        getFramesElements(elements), [0, 1, 0, 1], 2);
      assert.deepEqual(res.volumeIndices, [1, 1, 0, 0]);
      assert.equal(res.getter, getCandidate('TemporalPositionIndex'));
    });

    test('falls back to b-value with constant TemporalPositionIndex', () => {
      const elements = makePerFrameElements({
        temporalPositions: [1, 1, 1, 1],
        bValues: [1000, 1000, 50, 50]
      }, enhancedMRElements);
      const res = guessVolumeIndices(
        getFramesElements(elements), [0, 1, 0, 1], 2);
      assert.deepEqual(res.volumeIndices, [1, 1, 0, 0]);
      assert.equal(res.getter, getCandidate('DiffusionBValue'));
    });

    test('uses Philips dimension index b-value', () => {
      const dimensionIndexValues = [
        [1, 1, 1, 1], [1, 2, 1, 1], [1, 1, 2, 1], [1, 2, 2, 1]
      ];
      const philipsElements = {
        ...enhancedMRElements,
        [TagKeys.Manufacturer]:
          makeDataElement('LO', ['Philips Medical Systems']),
        [TagKeys.DimensionIndexSequence]: makeDataElement('SQ', [{
          [TagKeys.DimensionIndexPointer]:
            makeDataElement('AT', ['(0018,9087)'])
        }])
      };
      const elements = makePerFrameElements(
        {dimensionIndexValues}, philipsElements);
      const res = guessVolumeIndices(
        getFramesElements(elements), [0, 1, 0, 1], 2);
      assert.deepEqual(res.volumeIndices, [0, 0, 1, 1]);

      // not without the Philips manufacturer
      const otherElements = makePerFrameElements({dimensionIndexValues}, {
        ...philipsElements,
        [TagKeys.Manufacturer]: makeDataElement('LO', ['SIEMENS'])
      });
      assert.isUndefined(guessVolumeIndices(
        getFramesElements(otherElements), [0, 1, 0, 1], 2));

      // not without the b-value pointer
      const noPointerElements = makePerFrameElements({dimensionIndexValues}, {
        ...enhancedMRElements,
        [TagKeys.Manufacturer]: philipsElements[TagKeys.Manufacturer]
      });
      assert.isUndefined(guessVolumeIndices(
        getFramesElements(noPointerElements), [0, 1, 0, 1], 2));
    });

    test('undefined without a valid candidate', () => {
      const elements = makePerFrameElements({
        temporalPositions: [1, 1, 1, 1]
      }, enhancedMRElements);
      assert.isUndefined(guessVolumeIndices(
        getFramesElements(elements), [0, 1, 0, 1], 2));
    });

    test('uses custom candidates', () => {
      const elements = makePerFrameElements({
        temporalPositions: [2, 2, 1, 1]
      });
      const framesElements = getFramesElements(elements);
      const values = [5, 6, 5, 6];
      const getter = frameElements => values[
        framesElements.indexOf(frameElements)];
      custom.volumeIdCandidates = [{name: 'Custom', getter}];
      try {
        const res = guessVolumeIndices(framesElements, [0, 0, 1, 1], 2);
        assert.deepEqual(res.volumeIndices, [0, 1, 0, 1]);
        assert.equal(res.getter, getter);
      } finally {
        custom.volumeIdCandidates = undefined;
      }
    });

    test('uses custom post load getter only', () => {
      const elements = makePerFrameElements({
        temporalPositions: [2, 2, 1, 1]
      });
      custom.getPostLoadVolumeIdTagValue = () => 1;
      try {
        assert.isUndefined(guessVolumeIndices(
          getFramesElements(elements), [0, 1, 0, 1], 2));
      } finally {
        custom.getPostLoadVolumeIdTagValue = undefined;
      }
    });

  });

});
