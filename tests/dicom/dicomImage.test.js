import {describe, test, expect, vi} from 'vitest';
import {
  getImage2DSize,
  getPixelSpacing,
  getPixelAspectRatio,
  getSpacingFromMeasure,
  getTagPixelUnit,
  getOrientationMatrix,
  getDicomMeasureItem,
  getDicomPlaneOrientationItem,
  getPhotometricInterpretation,
  isMonochrome,
  isSecondatyCapture,
  getReferencedSeriesUID
} from '../../src/dicom/dicomImage.js';
import {Spacing} from '../../src/image/spacing.js';
import {Matrix33} from '../../src/math/matrix.js';

/**
 * Tests for the 'dicom/dicomImage.js' file.
 */

describe('dicom', () => {

  /**
   * Tests for {@link getPixelSpacing}.
   *
   * @function module:tests/dicom~getpixelspacing
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
   * Tests for {@link isMonochrome}.
   *
   * @function module:tests/dicom~ismonochrome
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

  /**
   * Tests for {@link getImage2DSize}.
   *
   * @function module:tests/dicom~getImage2DSize
   */
  test('getImage2DSize', () => {
    const TagKeys = {
      Rows: '00280010',
      Columns: '00280011'
    };

    // no rows
    const elements00 = {};
    elements00[TagKeys.Columns] = {value: [512]};
    expect(getImage2DSize(elements00)).toBeUndefined();

    // no columns
    const elements01 = {};
    elements01[TagKeys.Rows] = {value: [512]};
    expect(getImage2DSize(elements01)).toBeUndefined();

    // both present
    const elements02 = {};
    elements02[TagKeys.Rows] = {value: [512]};
    elements02[TagKeys.Columns] = {value: [256]};
    expect(getImage2DSize(elements02)).toEqual([256, 512]);

    // empty object
    expect(getImage2DSize({})).toBeUndefined();
  });

  /**
   * Tests for {@link getPixelAspectRatio}.
   *
   * @function module:tests/dicom~getPixelAspectRatio
   */
  test('getPixelAspectRatio', () => {
    const TagKeys = {
      PixelAspectRatio: '00280034'
    };

    // single value (should be undefined)
    const elements00 = {};
    elements00[TagKeys.PixelAspectRatio] = {value: [1.0]};
    expect(getPixelAspectRatio(elements00)).toBeUndefined();

    // two values
    const elements01 = {};
    elements01[TagKeys.PixelAspectRatio] = {value: [1.0, 2.0]};
    expect(getPixelAspectRatio(elements01)).toEqual([2.0, 1.0]);

    // no pixel aspect ratio
    expect(getPixelAspectRatio({})).toBeUndefined();
  });

  /**
   * Tests for {@link getSpacingFromMeasure}.
   *
   * @function module:tests/dicom~getSpacingFromMeasure
   */
  test('getSpacingFromMeasure', () => {
    const TagKeys = {
      PixelSpacing: '00280030',
      SpacingBetweenSlices: '00180088'
    };

    // no pixel spacing
    const elements00 = {};
    expect(getSpacingFromMeasure(elements00)).toBeUndefined();

    // pixel spacing only
    const elements01 = {};
    elements01[TagKeys.PixelSpacing] = {value: [1.0, 2.0]};
    const spacing01 = getSpacingFromMeasure(elements01);
    expect(spacing01).toBeDefined();
    expect(spacing01.get(0)).toBe(2.0);
    expect(spacing01.get(1)).toBe(1.0);
    expect(spacing01.get(2)).toBeUndefined();

    // pixel spacing with spacing between slices
    const elements02 = {};
    elements02[TagKeys.PixelSpacing] = {value: [1.0, 2.0]};
    elements02[TagKeys.SpacingBetweenSlices] = {value: [3.0]};
    const spacing02 = getSpacingFromMeasure(elements02);
    expect(spacing02).toBeDefined();
    expect(spacing02.get(0)).toBe(2.0);
    expect(spacing02.get(1)).toBe(1.0);
    expect(spacing02.get(2)).toBe(3.0);
  });

  /**
   * Tests for {@link getTagPixelUnit}.
   *
   * @function module:tests/dicom~getTagPixelUnit
   */
  test('getTagPixelUnit', () => {
    const TagKeys = {
      RescaleType: '00281054',
      Units: '00541001',
      Modality: '00080060'
    };

    // RescaleType
    const elements00 = {};
    elements00[TagKeys.RescaleType] = {value: ['HU']};
    expect(getTagPixelUnit(elements00)).toBe('HU');

    // Units
    const elements01 = {};
    elements01[TagKeys.Units] = {value: ['Bq/mL']};
    expect(getTagPixelUnit(elements01)).toBe('Bq/mL');

    // CT modality default
    const elements02 = {};
    elements02[TagKeys.Modality] = {value: ['CT']};
    expect(getTagPixelUnit(elements02)).toBe('HU');

    // non-CT modality
    const elements03 = {};
    elements03[TagKeys.Modality] = {value: ['MR']};
    expect(getTagPixelUnit(elements03)).toBeUndefined();

    // empty
    expect(getTagPixelUnit({})).toBeUndefined();
  });

  /**
   * Tests for (@link getOrientationMatrix}.
   *
   * @function module:tests/dicom~getOrientationMatrix
   */
  test('getOrientationMatrix', () => {
    const TagKeys = {
      ImageOrientationPatient: '00200037'
    };

    // no orientation
    expect(getOrientationMatrix({})).toBeUndefined();

    // identity orientation
    const elements00 = {};
    elements00[TagKeys.ImageOrientationPatient] = {
      value: ['1', '0', '0', '0', '1', '0']
    };
    const matrix00 = getOrientationMatrix(elements00);
    expect(matrix00).toBeDefined();
    expect(matrix00.get(0, 0)).toBe(1);
    expect(matrix00.get(1, 0)).toBe(0);
    expect(matrix00.get(0, 1)).toBe(0);

    // different orientation
    const elements01 = {};
    elements01[TagKeys.ImageOrientationPatient] = {
      value: ['0', '1', '0', '-1', '0', '0']
    };
    const matrix01 = getOrientationMatrix(elements01);
    expect(matrix01).toBeDefined();
  });

  /**
   * Tests for {@link getDicomMeasureItem}.
   *
   * @function module:tests/dicom~getDicomMeasureItem
   */
  test('getDicomMeasureItem', () => {
    const spacing = new Spacing([1.5, 2.5, 3.5]);
    const item = getDicomMeasureItem(spacing);

    expect(item).toBeDefined();
    expect(item.PixelSpacing).toEqual([2.5, 1.5]);
    expect(item.SpacingBetweenSlices).toBe(3.5);
  });

  /**
   * Tests for {@link getDicomPlaneOrientationItem}.
   *
   * @function module:tests/dicom~getDicomPlaneOrientationItem
   */
  test('getDicomPlaneOrientationItem', () => {
    /* eslint-disable @stylistic/js/array-element-newline */
    const matrix = new Matrix33([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ]);
    /* eslint-enable @stylistic/js/array-element-newline */
    const item = getDicomPlaneOrientationItem(matrix);

    expect(item).toBeDefined();
    expect(item.ImageOrientationPatient).toEqual([1, 0, 0, 0, 1, 0]);
  });

  /**
   * Tests for {@link getPhotometricInterpretation}.
   *
   * @function module:tests/dicom~getPhotometricInterpretation
   */
  test('getPhotometricInterpretation', () => {
    const TagKeys = {
      PhotometricInterpretation: '00280004',
      TransferSyntax: '00020010',
      SamplesPerPixel: '00280002'
    };

    // no elements
    expect(getPhotometricInterpretation({})).toBeUndefined();

    // monochrome
    const elements00 = {};
    elements00[TagKeys.PhotometricInterpretation] = {
      value: ['MONOCHROME2']
    };
    elements00[TagKeys.TransferSyntax] = {
      value: ['1.2.840.10008.1.2']
    };
    expect(getPhotometricInterpretation(elements00)).toBe('MONOCHROME2');

    // RGB
    const elements01 = {};
    elements01[TagKeys.PhotometricInterpretation] = {
      value: ['RGB']
    };
    elements01[TagKeys.TransferSyntax] = {
      value: ['1.2.840.10008.1.2']
    };
    elements01[TagKeys.SamplesPerPixel] = {value: [3]};
    expect(getPhotometricInterpretation(elements01)).toBe('RGB');

    // JPEG baseline
    const elements02 = {};
    elements02[TagKeys.PhotometricInterpretation] = {
      value: ['YBR_FULL_422']
    };
    elements02[TagKeys.TransferSyntax] = {
      value: ['1.2.840.10008.1.2.4.50']
    };
    elements02[TagKeys.SamplesPerPixel] = {value: [3]};
    expect(getPhotometricInterpretation(elements02)).toBe('RGB');

    // single sample RGB -> PALETTE COLOR
    const elements03 = {};
    elements03[TagKeys.PhotometricInterpretation] = {
      value: ['RGB']
    };
    elements03[TagKeys.TransferSyntax] = {
      value: ['1.2.840.10008.1.2']
    };
    elements03[TagKeys.SamplesPerPixel] = {
      value: [1]
    };
    expect(getPhotometricInterpretation(elements03)).toBe('PALETTE COLOR');
  });

  /**
   * Tests for {@link isSecondatyCapture}.
   *
   * @function module:tests/dicom~isSecondatyCapture
   */
  test('isSecondatyCapture', () => {
    // valid secondary capture UIDs
    expect(isSecondatyCapture('1.2.840.10008.5.1.4.1.1.7')).toBeTruthy();
    expect(isSecondatyCapture('1.2.840.10008.5.1.4.1.1.7.1')).toBeTruthy();
    expect(isSecondatyCapture('1.2.840.10008.5.1.4.1.1.7.2')).toBeTruthy();

    // invalid UIDs
    expect(isSecondatyCapture('1.2.840.10008.5.1.4.1.1.2')).not.toBeTruthy();
    expect(isSecondatyCapture('1.2.840.10008.5.1.4.1.1')).not.toBeTruthy();
    expect(isSecondatyCapture()).not.toBeTruthy();
    expect(isSecondatyCapture('invalid')).not.toBeTruthy();
  });

  /**
   * Tests for {@link getReferencedSeriesUID}.
   *
   * @function module:tests/dicom~getReferencedSeriesUID
   */
  test('getReferencedSeriesUID', () => {
    const TagKeys = {
      ReferencedSeriesSequence: '00081115',
      SeriesInstanceUID: '0020000E'
    };

    // no sequence
    expect(getReferencedSeriesUID({})).toBeUndefined();

    // with sequence and UID
    const elements00 = {};
    elements00[TagKeys.ReferencedSeriesSequence] = {
      value: [
        {
          [TagKeys.SeriesInstanceUID]: {value: ['1.2.3']}
        }
      ]
    };
    expect(getReferencedSeriesUID(elements00)).toBe('1.2.3');

    // with sequence but no UID
    const elements01 = {};
    elements01[TagKeys.ReferencedSeriesSequence] = {
      value: [{}]
    };
    expect(getReferencedSeriesUID(elements01)).toBeUndefined();
  });

});
