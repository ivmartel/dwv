import {
  getDate,
  getTime,
  getDateTime
} from './dicomDate.js';
import {checkDataElement} from './dataElement.js';
import {logger} from '../utils/logger.js';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from './dataElement.js';
/* eslint-enable no-unused-vars */

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
  PatientWeight: '00101030'
};

/**
 * Get the decayed dose (Bq).
 *
 * @param {Object<string, DataElement>} elements The DICOM elements to check.
 * @returns {object} The value and a warning if
 *   the elements are not as expected.
 */
function getDecayedDose(elements) {
  let warning = '';
  let warn;

  // SeriesDate (type1)
  const seriesDateEl = elements[TagKeys.SeriesDate];
  const seriesDateObj = getDate(seriesDateEl);

  let totalDose;
  let halfLife;
  let radioStart;

  const radioInfoSqStr = 'RadiopharmaceuticalInformationSequence (00540016)';
  const radioInfoSq = elements[TagKeys.RadiopharmaceuticalInformationSequence];
  warning += checkDataElement(radioInfoSq, radioInfoSqStr);
  if (typeof radioInfoSq !== 'undefined') {
    if (radioInfoSq.value.length !== 1) {
      logger.warn(
        'Found more than 1 istopes in RadiopharmaceuticalInformation Sequence.'
      );
    }

    // RadionuclideTotalDose (type3, Bq)
    const totalDoseStr = 'RadionuclideTotalDose (00181074)';
    const totalDoseEl = radioInfoSq.value[0][TagKeys.RadionuclideTotalDose];
    warn = checkDataElement(totalDoseEl, totalDoseStr);
    if (warn.length === 0) {
      const dose = parseFloat(totalDoseEl.value[0]);
      if (!isNaN(dose)) {
        totalDose = dose;
      } else {
        warning += ' TotalDose is not a number';
      }
    } else {
      warning += warn;
    }

    // RadionuclideHalfLife (type3, seconds)
    const halfLifeStr = 'RadionuclideHalfLife (00181075)';
    const halfLifeEl = radioInfoSq.value[0][TagKeys.RadionuclideHalfLife];
    warn = checkDataElement(halfLifeEl, halfLifeStr);
    if (warn.length === 0) {
      const hl = parseFloat(halfLifeEl.value[0]);
      if (!isNaN(hl)) {
        halfLife = hl;
      } else {
        warning += ' HalfLife is not a number';
      }
    } else {
      warning += warn;
    }

    // RadiopharmaceuticalStartDateTime (type3)
    const radioStartDateTimeEl =
      radioInfoSq.value[0][TagKeys.RadiopharmaceuticalStartDateTime];
    let radioStartDateObj;
    let radioStartTimeObj;
    if (typeof radioStartDateTimeEl === 'undefined') {
      // use seriesDate as radioStartDate
      radioStartDateObj = seriesDateObj;
      // try RadiopharmaceuticalStartTime (type3)
      const radioStartTimeEl =
        radioInfoSq.value[0][TagKeys.RadiopharmaceuticalStartTime];
      radioStartTimeObj = getTime(radioStartTimeEl);
    } else {
      const radioStartDateTime = getDateTime(radioStartDateTimeEl);
      radioStartDateObj = radioStartDateTime.date;
      radioStartTimeObj = radioStartDateTime.time;
    }
    if (typeof radioStartTimeObj === 'undefined') {
      radioStartTimeObj = {
        hours: 0, minutes: 0, seconds: 0, milliseconds: 0
      };
    }
    radioStart = new Date(
      radioStartDateObj.year,
      radioStartDateObj.monthIndex,
      radioStartDateObj.day,
      radioStartTimeObj.hours,
      radioStartTimeObj.minutes,
      radioStartTimeObj.seconds,
      radioStartTimeObj.milliseconds
    );
  }

  // SeriesTime (type1)
  const seriesTimeEl = elements[TagKeys.SeriesTime];
  const seriesTimeObj = getTime(seriesTimeEl);
  // Series date/time
  let scanStart = new Date(
    seriesDateObj.year,
    seriesDateObj.monthIndex,
    seriesDateObj.day,
    seriesTimeObj.hours,
    seriesTimeObj.minutes,
    seriesTimeObj.seconds,
    seriesTimeObj.milliseconds
  );

  // scanStart Date check
  // AcquisitionDate (type3)
  const acqDateEl = elements[TagKeys.AcquisitionDate];
  // AcquisitionTime (type3)
  const acqTimeEl = elements[TagKeys.AcquisitionTime];
  if (typeof acqDateEl !== 'undefined' &&
    typeof acqTimeEl !== 'undefined') {
    const acqDateObj = getDate(acqDateEl);
    const acqTimeObj = getTime(acqTimeEl);
    const acqDate = new Date(
      acqDateObj.year,
      acqDateObj.monthIndex,
      acqDateObj.day,
      acqTimeObj.hours,
      acqTimeObj.minutes,
      acqTimeObj.seconds,
      acqTimeObj.milliseconds
    );

    if (scanStart > acqDate) {
      const diff = scanStart.getTime() - acqDate.getTime();
      const warn = 'Series date/time is after Aquisition date/time (diff=' +
        diff.toString() + 'ms) ';
      logger.debug(warn);

      // back compute from center (average count rate) of time window
      // for bed position (frame) in series (reliable in all cases)

      let frameRefTime = 0;
      const frameRefTimeElStr = 'FrameReferenceTime (00541300)';
      const frameRefTimeEl = elements[TagKeys.FrameReferenceTime];
      warning += checkDataElement(frameRefTimeEl, frameRefTimeElStr);
      if (typeof frameRefTimeEl !== 'undefined') {
        frameRefTime = frameRefTimeEl.value[0];
      }
      let actualFrameDuration = 0;
      const actualFrameDurationElStr = 'ActualFrameDuration (00181242)';
      const actualFrameDurationEl = elements[TagKeys.ActualFrameDuration];
      warning += checkDataElement(
        actualFrameDurationEl, actualFrameDurationElStr);
      if (typeof actualFrameDurationEl !== 'undefined') {
        actualFrameDuration = actualFrameDurationEl.value[0];
      }
      if (frameRefTime > 0 && actualFrameDuration > 0) {
        // convert to seconds
        actualFrameDuration = actualFrameDuration / 1000;
        frameRefTime = frameRefTime / 1000;
        const decayConstant = Math.log(2) / halfLife;
        const decayDuringFrame = decayConstant * actualFrameDuration;
        const averageCountRateTimeWithinFrame =
          1 /
          decayConstant *
          Math.log(decayDuringFrame / (1 - Math.exp(-decayDuringFrame)));
        const offsetSeconds = averageCountRateTimeWithinFrame - frameRefTime;
        scanStart = new Date(
          acqDateObj.year,
          acqDateObj.monthIndex,
          acqDateObj.day,
          acqTimeObj.hours,
          acqTimeObj.minutes,
          acqTimeObj.seconds + offsetSeconds,
          acqTimeObj.milliseconds
        );
      }
    }
  }

  // decayed dose (Bq)
  let decayedDose;
  if (typeof scanStart !== 'undefined' &&
    typeof radioStart !== 'undefined' &&
    typeof totalDose !== 'undefined' &&
    typeof halfLife !== 'undefined') {
    // decay time (s) (Date diff is in milliseconds)
    const decayTime = (scanStart.getTime() - radioStart.getTime()) / 1000;
    const decay = Math.pow(2, (-decayTime / halfLife));
    decayedDose = totalDose * decay;
  }

  return {
    value: decayedDose,
    warning: warning
  };
}

/**
 * Get the PET SUV factor.
 *
 * Ref:
 * - {@link https://qibawiki.rsna.org/index.php/Standardized_Uptake_Value_(SUV)#SUV_Calculation},
 * - {@link https://qibawiki.rsna.org/images/6/62/SUV_vendorneutral_pseudocode_happypathonly_20180626_DAC.pdf},
 * - {@link https://qibawiki.rsna.org/images/8/86/SUV_vendorneutral_pseudocode_20180626_DAC.pdf}.
 *
 * @param {Object<string, DataElement>} elements The DICOM elements.
 * @returns {object} The value and a warning if
 *   the elements are not as expected.
 */
export function getSuvFactor(elements) {
  let warning = '';
  const result = {};


  // CorrectedImage (type2): must contain ATTN and DECY
  const corrImageTagStr = 'Corrected Image (00280051)';
  const corrImageEl = elements[TagKeys.CorrectedImage];
  warning += checkDataElement(corrImageEl, corrImageTagStr, ['ATTN', 'DECY']);
  // DecayCorrection (type1): must be START
  const decayCorrTagStr = 'Decay Correction (00541102)';
  const decayCorrEl = elements[TagKeys.DecayCorrection];
  warning += checkDataElement(decayCorrEl, decayCorrTagStr, ['START']);
  // Units (type1): must be BQML
  const unitTagStr = 'Units (00541001)';
  const unitEl = elements[TagKeys.Units];
  warning += checkDataElement(unitEl, unitTagStr, ['BQML']);

  // PatientWeight (type3, kg)
  let patWeight;
  const patientWeightStr = ' PatientWeight (00101030)';
  const patWeightEl = elements[TagKeys.PatientWeight];
  const warn = checkDataElement(patWeightEl, patientWeightStr);
  if (warn.length === 0) {
    const weight = parseFloat(patWeightEl.value[0]);
    if (!isNaN(weight)) {
      patWeight = weight;
    } else {
      warning += ' PatientWeight is not a number';
    }
  } else {
    warning += warn;
  }

  // Decayed dose (Bq)
  const decayedDose = getDecayedDose(elements);
  warning += decayedDose.warning;


  if (warning.length !== 0) {
    result.warning = 'Cannot calculate PET SUV:' + warning;
  } else {
    // SUV factor (grams/Bq)
    result.value = (patWeight * 1000) / decayedDose.value;
  }

  return result;
}
