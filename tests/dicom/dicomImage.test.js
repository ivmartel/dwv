import {describe, test, expect, vi} from 'vitest';
import {
  getPixelSpacing,
  isMonochrome
} from '../../src/dicom/dicomImage.js';

/**
 * Tests for the 'dicom/dicomImage.js' file.
 */

describe('dicom', () => {

  /**
   * Tests for getPixelSpacing.
   *
   * @function module:tests/dicom~getPixelSpacing
   */
  test('getPixelSpacing', () => {
    const TagKeys = {
      PixelSpacing: '00280030',
      ImagerPixelSpacing: '00181164',
      NominalScannedPixelSpacing: '00182010',
      DistanceSourceToDetector: '00181110',
      DistanceSourceToPatient: '00181111',
      EstimatedRadiographicMagnificationFactor: '00181114',
      PixelAspectRatio: '00280034',
      SpacingBetweenSlices: '00180088',
      PixelMeasuresSequence: '00289110',
      SharedFunctionalGroupsSequence: '52009229',
      PerFrameFunctionalGroupsSequence: '52009230'
    };
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // PixelSpacing #0
    const spacing00 = [1.1];
    const elements00 = {};
    elements00[TagKeys.PixelSpacing] = {
      value: spacing00
    };
    expect(getPixelSpacing(elements00)).toEqual(undefined);

    // PixelSpacing #1
    const spacing01 = [1.1, 1.2];
    const elements01 = {};
    elements01[TagKeys.PixelSpacing] = {
      value: spacing01.toReversed()
    };
    expect(getPixelSpacing(elements01)).toStrictEqual(spacing01);

    // ImagerPixelSpacing #0
    const elements10 = {};
    elements10[TagKeys.ImagerPixelSpacing] = {
      value: spacing01.toReversed()
    };
    expect(getPixelSpacing(elements10)).toStrictEqual(spacing01);
    expect(consoleSpy).toHaveBeenLastCalledWith(
      'Got pixel spacing from raw ImagerPixelSpacing tag'
    );

    // ImagerPixelSpacing #1
    const factor11 = 2;
    const spacing11 = [
      spacing01[0] / factor11,
      spacing01[1] / factor11
    ];
    const elements11 = {};
    elements11[TagKeys.ImagerPixelSpacing] = {
      value: spacing01.toReversed()
    };
    elements11[TagKeys.EstimatedRadiographicMagnificationFactor] = {
      value: [factor11]
    };
    expect(getPixelSpacing(elements11)).toStrictEqual(spacing11);
    expect(consoleSpy).toHaveBeenLastCalledWith(
      'Got pixel spacing from corrected ImagerPixelSpacing tag'
    );

    // ImagerPixelSpacing #2
    const dstd12 = 4;
    const dstp12 = 2;
    const factor12 = dstd12 / dstp12;
    const spacing12 = [
      spacing01[0] / factor12,
      spacing01[1] / factor12
    ];
    const elements12 = {};
    elements12[TagKeys.ImagerPixelSpacing] = {
      value: spacing01.toReversed()
    };
    elements12[TagKeys.DistanceSourceToDetector] = {
      value: [dstd12]
    };
    elements12[TagKeys.DistanceSourceToPatient] = {
      value: [dstp12]
    };
    expect(getPixelSpacing(elements12)).toStrictEqual(spacing12);
    expect(consoleSpy).toHaveBeenLastCalledWith(
      'Got pixel spacing from corrected ImagerPixelSpacing tag'
    );

    // NominalScannedPixelSpacing #0
    const elements20 = {};
    elements20[TagKeys.NominalScannedPixelSpacing] = {
      value: spacing01.toReversed()
    };
    expect(getPixelSpacing(elements20)).toStrictEqual(spacing01);
    expect(consoleSpy).toHaveBeenLastCalledWith(
      'Got pixel spacing from NominalScannedPixelSpacing tag'
    );

    // PixelMeasuresSequence #0
    const elements300 = {};
    elements300[TagKeys.PixelMeasuresSequence] = {
      value: [
        elements01
      ]
    };
    const elements30 = {};
    elements30[TagKeys.SharedFunctionalGroupsSequence] = {
      value: [
        elements300
      ]
    };
    expect(getPixelSpacing(elements30)).toStrictEqual(spacing01);

    // PixelMeasuresSequence #1
    const elements31 = {};
    elements31[TagKeys.PerFrameFunctionalGroupsSequence] = {
      value: [
        elements300
      ]
    };
    expect(getPixelSpacing(elements31)).toStrictEqual(spacing01);
  });

  /**
   * Tests for isMonochrome.
   *
   * @function module:tests/dicom~isMonochrome
   */
  test('isMonochrome', () => {
    // ok
    expect(isMonochrome('MONOCHROME1')).toBeTruthy();
    expect(isMonochrome('MONOCHROME2')).toBeTruthy();
    // method tests that the string starts with MONOCHROME...
    expect(isMonochrome('MONOCHROME')).toBeTruthy();
    expect(isMonochrome('MONOCHROME123')).toBeTruthy();

    // case sensitive
    expect(isMonochrome('monochrome1')).not.toBeTruthy();

    // not ok
    expect(isMonochrome()).not.toBeTruthy();
    expect(isMonochrome('abcd')).not.toBeTruthy();
    expect(isMonochrome('RGB')).not.toBeTruthy();
    expect(isMonochrome('PALETTE COLOR')).not.toBeTruthy();
  });

});
