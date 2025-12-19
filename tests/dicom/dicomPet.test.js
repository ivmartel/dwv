import {describe, test, assert} from 'vitest';
import {getSuvFactor} from '../../src/dicom/dicomPet.js';
import {DataElement} from '../../src/dicom/dataElement.js';

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  SeriesDate: '00080021',
  AcquisitionDate: '00080022',
  SeriesTime: '00080031',
  AcquisitionTime: '00080032',
  RadiopharmaceuticalInformationSequence: '00540016',
  RadionuclideTotalDose: '00181074',
  RadionuclideHalfLife: '00181075',
  RadiopharmaceuticalStartDateTime: '00181078',
  RadiopharmaceuticalStartTime: '00181072',
  FrameReferenceTime: '00541300',
  ActualFrameDuration: '00181242',
  CorrectedImage: '00280051',
  DecayCorrection: '00541102',
  Units: '00541001',
  PatientWeight: '00101030',
  CodeMeaning: '00080104',
  CodeValue: '00080100',
  CodingSchemeDesignator: '00080102'
};

/**
 * Tests for the 'dicom/dicomPet.js' file.
 */

describe('dicom', () => {

  describe('getSuvFactor', () => {

    test('returns warning when CorrectedImage missing', () => {
      const deSeriesDate = new DataElement('DA');
      deSeriesDate.value = ['20231215'];

      const deSeriesTime = new DataElement('TM');
      deSeriesTime.value = ['120000'];

      const elements = {
        [TagKeys.SeriesDate]: deSeriesDate,
        [TagKeys.SeriesTime]: deSeriesTime
      };

      const result = getSuvFactor(elements);

      assert.ok(result.warning);
      assert.isUndefined(result.value);
      assert.include(result.warning, 'Corrected Image');
    });

    test('returns warning when DecayCorrection missing', () => {
      const deCorrectImage = new DataElement('CS');
      deCorrectImage.value = ['ATTN', 'DECY'];

      const deSeriesDate = new DataElement('DA');
      deSeriesDate.value = ['20231215'];

      const deSeriesTime = new DataElement('TM');
      deSeriesTime.value = ['120000'];

      const elements = {
        [TagKeys.CorrectedImage]: deCorrectImage,
        [TagKeys.SeriesDate]: deSeriesDate,
        [TagKeys.SeriesTime]: deSeriesTime
      };

      const result = getSuvFactor(elements);

      assert.ok(result.warning);
      assert.isUndefined(result.value);
      assert.include(result.warning, 'Decay Correction');
    });

    test('returns warning when Units missing', () => {
      const deCorrectImage = new DataElement('CS');
      deCorrectImage.value = ['ATTN', 'DECY'];

      const deDecayCorr = new DataElement('CS');
      deDecayCorr.value = ['START'];

      const deSeriesDate = new DataElement('DA');
      deSeriesDate.value = ['20231215'];

      const deSeriesTime = new DataElement('TM');
      deSeriesTime.value = ['120000'];

      const elements = {
        [TagKeys.CorrectedImage]: deCorrectImage,
        [TagKeys.DecayCorrection]: deDecayCorr,
        [TagKeys.SeriesDate]: deSeriesDate,
        [TagKeys.SeriesTime]: deSeriesTime
      };

      const result = getSuvFactor(elements);

      assert.ok(result.warning);
      assert.isUndefined(result.value);
      assert.include(result.warning, 'Units');
    });

    test('returns warning when PatientWeight missing', () => {
      const deCorrectImage = new DataElement('CS');
      deCorrectImage.value = ['ATTN', 'DECY'];

      const deDecayCorr = new DataElement('CS');
      deDecayCorr.value = ['START'];

      const deUnits = new DataElement('CS');
      deUnits.value = ['BQML'];

      const deSeriesDate = new DataElement('DA');
      deSeriesDate.value = ['20231215'];

      const deSeriesTime = new DataElement('TM');
      deSeriesTime.value = ['120000'];

      const elements = {
        [TagKeys.CorrectedImage]: deCorrectImage,
        [TagKeys.DecayCorrection]: deDecayCorr,
        [TagKeys.Units]: deUnits,
        [TagKeys.SeriesDate]: deSeriesDate,
        [TagKeys.SeriesTime]: deSeriesTime
      };

      const result = getSuvFactor(elements);

      assert.ok(result.warning);
      assert.isUndefined(result.value);
      assert.include(result.warning, 'PatientWeight');
    });

    test('returns warning when RadiopharmaceuticalInformationSequence ' +
      'missing', () => {
      const deCorrectImage = new DataElement('CS');
      deCorrectImage.value = ['ATTN', 'DECY'];

      const deDecayCorr = new DataElement('CS');
      deDecayCorr.value = ['START'];

      const deUnits = new DataElement('CS');
      deUnits.value = ['BQML'];

      const dePatWeight = new DataElement('DS');
      dePatWeight.value = ['70.5'];

      const deSeriesDate = new DataElement('DA');
      deSeriesDate.value = ['20231215'];

      const deSeriesTime = new DataElement('TM');
      deSeriesTime.value = ['120000'];

      const elements = {
        [TagKeys.CorrectedImage]: deCorrectImage,
        [TagKeys.DecayCorrection]: deDecayCorr,
        [TagKeys.Units]: deUnits,
        [TagKeys.PatientWeight]: dePatWeight,
        [TagKeys.SeriesDate]: deSeriesDate,
        [TagKeys.SeriesTime]: deSeriesTime
      };

      const result = getSuvFactor(elements);

      assert.ok(result.warning);
      assert.isUndefined(result.value);
      assert.include(result.warning,
        'RadiopharmaceuticalInformationSequence');
    });

    test('returns warning when RadionuclideTotalDose missing', () => {
      const deCorrectImage = new DataElement('CS');
      deCorrectImage.value = ['ATTN', 'DECY'];

      const deDecayCorr = new DataElement('CS');
      deDecayCorr.value = ['START'];

      const deUnits = new DataElement('CS');
      deUnits.value = ['BQML'];

      const dePatWeight = new DataElement('DS');
      dePatWeight.value = ['70.5'];

      const deSeriesDate = new DataElement('DA');
      deSeriesDate.value = ['20231215'];

      const deSeriesTime = new DataElement('TM');
      deSeriesTime.value = ['120000'];

      const radioInfoSq = new DataElement('SQ');
      radioInfoSq.value = [{}];

      const elements = {
        [TagKeys.CorrectedImage]: deCorrectImage,
        [TagKeys.DecayCorrection]: deDecayCorr,
        [TagKeys.Units]: deUnits,
        [TagKeys.PatientWeight]: dePatWeight,
        [TagKeys.SeriesDate]: deSeriesDate,
        [TagKeys.SeriesTime]: deSeriesTime,
        [TagKeys.RadiopharmaceuticalInformationSequence]: radioInfoSq
      };

      const result = getSuvFactor(elements);

      assert.ok(result.warning);
      assert.isUndefined(result.value);
      assert.include(result.warning, 'RadionuclideTotalDose');
    });

    test('returns warning when RadionuclideHalfLife missing', () => {
      const deCorrectImage = new DataElement('CS');
      deCorrectImage.value = ['ATTN', 'DECY'];

      const deDecayCorr = new DataElement('CS');
      deDecayCorr.value = ['START'];

      const deUnits = new DataElement('CS');
      deUnits.value = ['BQML'];

      const dePatWeight = new DataElement('DS');
      dePatWeight.value = ['70.5'];

      const deSeriesDate = new DataElement('DA');
      deSeriesDate.value = ['20231215'];

      const deSeriesTime = new DataElement('TM');
      deSeriesTime.value = ['120000'];

      const deTotalDose = new DataElement('DS');
      deTotalDose.value = ['400000000'];

      const radioInfoSq = new DataElement('SQ');
      radioInfoSq.value = [{
        [TagKeys.RadionuclideTotalDose]: deTotalDose
      }];

      const elements = {
        [TagKeys.CorrectedImage]: deCorrectImage,
        [TagKeys.DecayCorrection]: deDecayCorr,
        [TagKeys.Units]: deUnits,
        [TagKeys.PatientWeight]: dePatWeight,
        [TagKeys.SeriesDate]: deSeriesDate,
        [TagKeys.SeriesTime]: deSeriesTime,
        [TagKeys.RadiopharmaceuticalInformationSequence]: radioInfoSq
      };

      const result = getSuvFactor(elements);

      assert.ok(result.warning);
      assert.isUndefined(result.value);
      assert.include(result.warning, 'RadionuclideHalfLife');
    });

    test('calculates SUV factor with basic required elements', () => {
      const deCorrectImage = new DataElement('CS');
      deCorrectImage.value = ['ATTN', 'DECY'];

      const deDecayCorr = new DataElement('CS');
      deDecayCorr.value = ['START'];

      const deUnits = new DataElement('CS');
      deUnits.value = ['BQML'];

      const dePatWeight = new DataElement('DS');
      dePatWeight.value = ['70'];

      const deSeriesDate = new DataElement('DA');
      deSeriesDate.value = ['20231215'];

      const deSeriesTime = new DataElement('TM');
      deSeriesTime.value = ['120000'];

      const deTotalDose = new DataElement('DS');
      deTotalDose.value = ['400000000'];

      const deHalfLife = new DataElement('DS');
      deHalfLife.value = ['6588'];

      const radioInfoSq = new DataElement('SQ');
      radioInfoSq.value = [{
        [TagKeys.RadionuclideTotalDose]: deTotalDose,
        [TagKeys.RadionuclideHalfLife]: deHalfLife
      }];

      const elements = {
        [TagKeys.CorrectedImage]: deCorrectImage,
        [TagKeys.DecayCorrection]: deDecayCorr,
        [TagKeys.Units]: deUnits,
        [TagKeys.PatientWeight]: dePatWeight,
        [TagKeys.SeriesDate]: deSeriesDate,
        [TagKeys.SeriesTime]: deSeriesTime,
        [TagKeys.RadiopharmaceuticalInformationSequence]: radioInfoSq
      };

      const result = getSuvFactor(elements);

      assert.isUndefined(result.warning);
      assert.ok(typeof result.value === 'number');
      assert.ok(result.value > 0);
    });

    test('calculates SUV factor with RadiopharmaceuticalStartDateTime', () => {
      const deCorrectImage = new DataElement('CS');
      deCorrectImage.value = ['ATTN', 'DECY'];

      const deDecayCorr = new DataElement('CS');
      deDecayCorr.value = ['START'];

      const deUnits = new DataElement('CS');
      deUnits.value = ['BQML'];

      const dePatWeight = new DataElement('DS');
      dePatWeight.value = ['70'];

      const deSeriesDate = new DataElement('DA');
      deSeriesDate.value = ['20231215'];

      const deSeriesTime = new DataElement('TM');
      deSeriesTime.value = ['120000'];

      const deTotalDose = new DataElement('DS');
      deTotalDose.value = ['400000000'];

      const deHalfLife = new DataElement('DS');
      deHalfLife.value = ['6588'];

      const deRadioStartDateTime = new DataElement('DT');
      deRadioStartDateTime.value = ['20231215110000'];

      const radioInfoSq = new DataElement('SQ');
      radioInfoSq.value = [{
        [TagKeys.RadionuclideTotalDose]: deTotalDose,
        [TagKeys.RadionuclideHalfLife]: deHalfLife,
        [TagKeys.RadiopharmaceuticalStartDateTime]: deRadioStartDateTime
      }];

      const elements = {
        [TagKeys.CorrectedImage]: deCorrectImage,
        [TagKeys.DecayCorrection]: deDecayCorr,
        [TagKeys.Units]: deUnits,
        [TagKeys.PatientWeight]: dePatWeight,
        [TagKeys.SeriesDate]: deSeriesDate,
        [TagKeys.SeriesTime]: deSeriesTime,
        [TagKeys.RadiopharmaceuticalInformationSequence]: radioInfoSq
      };

      const result = getSuvFactor(elements);

      assert.isUndefined(result.warning);
      assert.ok(typeof result.value === 'number');
      assert.ok(result.value > 0);
    });

    test('returns warning for invalid PatientWeight', () => {
      const deCorrectImage = new DataElement('CS');
      deCorrectImage.value = ['ATTN', 'DECY'];

      const deDecayCorr = new DataElement('CS');
      deDecayCorr.value = ['START'];

      const deUnits = new DataElement('CS');
      deUnits.value = ['BQML'];

      const dePatWeight = new DataElement('DS');
      dePatWeight.value = ['invalid'];

      const deSeriesDate = new DataElement('DA');
      deSeriesDate.value = ['20231215'];

      const deSeriesTime = new DataElement('TM');
      deSeriesTime.value = ['120000'];

      const elements = {
        [TagKeys.CorrectedImage]: deCorrectImage,
        [TagKeys.DecayCorrection]: deDecayCorr,
        [TagKeys.Units]: deUnits,
        [TagKeys.PatientWeight]: dePatWeight,
        [TagKeys.SeriesDate]: deSeriesDate,
        [TagKeys.SeriesTime]: deSeriesTime
      };

      const result = getSuvFactor(elements);

      assert.ok(result.warning);
      assert.isUndefined(result.value);
      assert.include(result.warning, 'PatientWeight is not a number');
    });

    test('calculates correct SUV factor value', () => {
      const deCorrectImage = new DataElement('CS');
      deCorrectImage.value = ['ATTN', 'DECY'];

      const deDecayCorr = new DataElement('CS');
      deDecayCorr.value = ['START'];

      const deUnits = new DataElement('CS');
      deUnits.value = ['BQML'];

      const dePatWeight = new DataElement('DS');
      dePatWeight.value = ['80'];

      const deSeriesDate = new DataElement('DA');
      deSeriesDate.value = ['20231215'];

      const deSeriesTime = new DataElement('TM');
      deSeriesTime.value = ['120000'];

      const deTotalDose = new DataElement('DS');
      deTotalDose.value = ['370000000'];

      const deHalfLife = new DataElement('DS');
      deHalfLife.value = ['6588'];

      const radioInfoSq = new DataElement('SQ');
      radioInfoSq.value = [{
        [TagKeys.RadionuclideTotalDose]: deTotalDose,
        [TagKeys.RadionuclideHalfLife]: deHalfLife
      }];

      const elements = {
        [TagKeys.CorrectedImage]: deCorrectImage,
        [TagKeys.DecayCorrection]: deDecayCorr,
        [TagKeys.Units]: deUnits,
        [TagKeys.PatientWeight]: dePatWeight,
        [TagKeys.SeriesDate]: deSeriesDate,
        [TagKeys.SeriesTime]: deSeriesTime,
        [TagKeys.RadiopharmaceuticalInformationSequence]: radioInfoSq
      };

      const result = getSuvFactor(elements);

      assert.isUndefined(result.warning);
      // SUV factor = (patWeight * 1000) / decayedDose
      // With 80kg weight, should get reasonable SUV factor
      assert.ok(result.value > 0);
      assert.ok(result.value < 100);
    });

  });

});
