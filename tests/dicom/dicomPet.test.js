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

    /**
     * Tests for {@link getSuvFactor} without corrected image.
     *
     * @function module:tests/dicom~getsuvfactorNoCorrected
     */
    test('no corrected', () => {
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

    /**
     * Tests for {@link getSuvFactor} without decay correction.
     *
     * @function module:tests/dicom~getsuvfactorNoDecay
     */
    test('no decay', () => {
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

    /**
     * Tests for {@link getSuvFactor} without Units.
     *
     * @function module:tests/dicom~getsuvfactorNoUnits
     */
    test('no units', () => {
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

    /**
     * Tests for {@link getSuvFactor} without PatientWeight.
     *
     * @function module:tests/dicom~getsuvfactorNoWeight
     */
    test('no weight', () => {
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

    /**
     * Tests for {@link getSuvFactor} without
     * RadiopharmaceuticalInformationSequence.
     *
     * @function module:tests/dicom~getsuvfactorNoRadio
     */
    test('no radio', () => {
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

    /**
     * Tests for {@link getSuvFactor} without RadionuclideTotalDose.
     *
     * @function module:tests/dicom~getsuvfactorNoTotalDose
     */
    test('no total dose', () => {
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

    /**
     * Tests for {@link getSuvFactor} without RadionuclideHalfLife.
     *
     * @function module:tests/dicom~getsuvfactorNoHalfLife
     */
    test('no half life', () => {
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

    /**
     * Tests for {@link getSuvFactor}.
     *
     * @function module:tests/dicom~getsuvfactorGoodInput
     */
    test('good input', () => {
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

    /**
     * Tests for {@link getSuvFactor} with
     * RadiopharmaceuticalStartDateTime.
     *
     * @function module:tests/dicom~getsuvfactorRadioStartDate
     */
    test('radio start date', () => {
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

    /**
     * Tests for {@link getSuvFactor} with invalid
     * PatientWeight.
     *
     * @function module:tests/dicom~getsuvfactorInvalidWeight
     */
    test('invalid weight', () => {
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

    /**
     * Tests for {@link getSuvFactor} correct.
     *
     * @function module:tests/dicom~getsuvfactorCorrect
     */
    test('correct', () => {
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
