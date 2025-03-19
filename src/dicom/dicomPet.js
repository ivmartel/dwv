import {
  getDate,
  getTime,
  getDateTime
} from './dicomDate';
import {logger} from '../utils/logger';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from './dataElement';
/* eslint-enable no-unused-vars */
/**
 * Check an input tag.
 *
 * @param {DataElement} element The element to check.
 * @param {string} name The element name.
 * @param {Array} [values] The expected values.
 * @returns {string} A warning if the element is not as expected.
 */
function checkTag(element, name, values) {
  let warning = '';
  if (typeof element === 'undefined') {
    warning += ' ' + name + ' is undefined,';
  } else if (element.value.length === 0) {
    warning += ' ' + name + ' is empty,';
  } else {
    if (typeof values !== 'undefined') {
      for (let i = 0; i < values.length; ++i) {

        if (!element.value.includes(values[i])) {
          warning += ' ' + name + ' does not contain ' + values[i] +
            ' (value: ' + element.value + '),';
        }
      }
    }
  }
  return warning;
}

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
  const seriesDateEl = elements['00080021'];
  const seriesDateObj = getDate(seriesDateEl);

  let totalDose;
  let halfLife;
  let radioStart;

  const radioInfoSqStr = 'RadiopharmaceuticalInformationSequence (00540016)';
  const radioInfoSq = elements['00540016'];
  warning += checkTag(radioInfoSq, radioInfoSqStr);
  if (typeof radioInfoSq !== 'undefined') {
    if (radioInfoSq.value.length !== 1) {
      logger.warn(
        'Found more than 1 istopes in RadiopharmaceuticalInformation Sequence.'
      );
    }

    // RadionuclideTotalDose (type3, Bq)
    const totalDoseStr = 'RadionuclideTotalDose (00181074)';
    const totalDoseEl = radioInfoSq.value[0]['00181074'];
    warn = checkTag(totalDoseEl, totalDoseStr);
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
    const halfLifeEl = radioInfoSq.value[0]['00181075'];
    warn = checkTag(halfLifeEl, halfLifeStr);
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
    const radioStartDateTimeEl = radioInfoSq.value[0]['00181078'];
    let radioStartDateObj;
    let radioStartTimeObj;
    if (typeof radioStartDateTimeEl === 'undefined') {
      // use seriesDate as radioStartDate
      radioStartDateObj = seriesDateObj;
      // try RadiopharmaceuticalStartTime (type3)
      const radioStartTimeEl = radioInfoSq.value[0]['00181072'];
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
  const seriesTimeEl = elements['00080031'];
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
  const acqDateEl = elements['00080022'];
  // AcquisitionTime (type3)
  const acqTimeEl = elements['00080032'];
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
      const frameRefTimeEl = elements['00541300'];
      warning += checkTag(frameRefTimeEl, frameRefTimeElStr);
      if (typeof frameRefTimeEl !== 'undefined') {
        frameRefTime = frameRefTimeEl.value[0];
      }
      let actualFrameDuration = 0;
      const actualFrameDurationElStr = 'ActualFrameDuration (0018,1242)';
      const actualFrameDurationEl = elements['00181242'];
      warning += checkTag(actualFrameDurationEl, actualFrameDurationElStr);
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
  const corrImageEl = elements['00280051'];
  warning += checkTag(corrImageEl, corrImageTagStr, ['ATTN', 'DECY']);
  // DecayCorrection (type1): must be START
  const decayCorrTagStr = 'Decay Correction (00541102)';
  const decayCorrEl = elements['00541102'];
  warning += checkTag(decayCorrEl, decayCorrTagStr, ['START']);
  // Units (type1): must be BQML
  const unitTagStr = 'Units (00541001)';
  const unitEl = elements['00541001'];
  warning += checkTag(unitEl, unitTagStr, ['BQML']);

  // PatientWeight (type3, kg)
  let patWeight;
  const patientWeightStr = ' PatientWeight (00101030)';
  const patWeightEl = elements['00101030'];
  const warn = checkTag(patWeightEl, patientWeightStr);
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
