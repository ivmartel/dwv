import {
  DicomParser,
  getTransferSyntaxName
} from './dicomParser';
import {
  isPixelDataTag,
  isItemDelimitationItemTag,
  isSequenceDelimitationItemTag,
  getItemTag,
  getItemDelimitationItemTag,
  getSequenceDelimitationItemTag,
  getPixelDataTag,
  getTagFromDictionary,
  getTagFromKey
} from './dicomTag';
import {isNativeLittleEndian} from './dataReader';
import {Spacing} from '../image/spacing';
import {logger} from '../utils/logger';

// doc imports
/* eslint-disable no-unused-vars */
import {Tag} from './dicomTag';
/* eslint-enable no-unused-vars */

/**
 * DicomElements wrapper.
 *
 * Warning: limited support for merged meta data.
 */
export class DicomElementsWrapper {

  /**
   * Wrapped elements.
   *
   * @type {Array}
   */
  #dicomElements;

  /**
   * @param {Array} dicomElements The elements to wrap.
   */
  constructor(dicomElements) {
    this.#dicomElements = dicomElements;
  }

  /**
   * Get a DICOM Element value from a group/element key.
   *
   * @param {string} groupElementKey The key to retrieve.
   * @param {boolean} [asArray] Get the value as an Array.
   * @returns {object} The DICOM element value.
   */
  getFromKey(groupElementKey, asArray) {
    // default
    if (typeof asArray === 'undefined') {
      asArray = false;
    }
    let value = null;
    const dElement = this.#dicomElements[groupElementKey];
    if (typeof dElement !== 'undefined') {
      // raw value if only one
      if (dElement.value.length === 1 && asArray === false) {
        value = dElement.value[0];
      } else {
        value = dElement.value;
      }
    }
    return value;
  }

  /**
   * Dump the DICOM tags to an object.
   *
   * @returns {object} The DICOM tags as an object.
   */
  dumpToObject() {
    const keys = Object.keys(this.#dicomElements);
    const obj = {};
    let dicomElement = null;
    for (let i = 0, leni = keys.length; i < leni; ++i) {
      dicomElement = this.#dicomElements[keys[i]];
      const tag = getTagFromKey(keys[i]);
      obj[this.#getTagName(tag)] =
        this.#getElementAsObject(tag, dicomElement);
    }
    return obj;
  }

  /**
   * Get a tag string name from the dictionary.
   *
   * @param {object} tag The DICOM tag object.
   * @returns {string} The tag name.
   */
  #getTagName(tag) {
    let name = tag.getNameFromDictionary();
    if (name === null) {
      name = tag.getKey();
    }
    return name;
  }

  /**
   * Get a DICOM element as a simple object.
   *
   * @param {Tag} tag The DICOM tag.
   * @param {object} dicomElement The DICOM element.
   * @returns {object} The element as a simple object.
   */
  #getElementAsObject(tag, dicomElement) {
    // element value
    let value = null;

    const isPixel = isPixelDataTag(tag);

    const vr = dicomElement.vr;
    if (vr === 'SQ' &&
      typeof dicomElement.value !== 'undefined' &&
      !isPixel) {
      value = [];
      const items = dicomElement.value;
      let itemValues = null;
      for (let i = 0; i < items.length; ++i) {
        itemValues = {};
        const keys = Object.keys(items[i]);
        for (let k = 0; k < keys.length; ++k) {
          const itemElement = items[i][keys[k]];
          const tag = getTagFromKey(keys[k]);
          const key = this.#getTagName(tag);
          // do not inclure Item elements
          if (key !== 'Item') {
            itemValues[key] = this.#getElementAsObject(tag, itemElement);
          }
        }
        value.push(itemValues);
      }
    } else {
      value = this.#getElementValueAsString(tag, dicomElement);
    }

    // return
    return {
      value: value,
      vr: vr
    };
  }

  /**
   * Dump the DICOM tags to a string.
   *
   * @returns {string} The dumped file.
   */
  dump() {
    const keys = Object.keys(this.#dicomElements);
    let result = '\n';
    result += '# Dicom-File-Format\n';
    result += '\n';
    result += '# Dicom-Meta-Information-Header\n';
    result += '# Used TransferSyntax: ';
    if (isNativeLittleEndian()) {
      result += 'Little Endian Explicit\n';
    } else {
      result += 'NOT Little Endian Explicit\n';
    }
    let dicomElement = null;
    let tag = null;
    let checkHeader = true;
    for (let i = 0, leni = keys.length; i < leni; ++i) {
      dicomElement = this.#dicomElements[keys[i]];
      tag = getTagFromKey(keys[i]);
      if (checkHeader && tag.getGroup() !== '0002') {
        result += '\n';
        result += '# Dicom-Data-Set\n';
        result += '# Used TransferSyntax: ';
        const syntax = this.#dicomElements['00020010'].value[0];
        result += getTransferSyntaxName(syntax);
        result += '\n';
        checkHeader = false;
      }
      result += this.#getElementAsString(tag, dicomElement) + '\n';
    }
    return result;
  }

  /**
   * Get a data element value as a string.
   *
   * @param {Tag} tag The DICOM tag.
   * @param {object} dicomElement The DICOM element.
   * @param {boolean} [pretty] When set to true, returns a 'pretified' content.
   * @returns {string} A string representation of the DICOM element.
   */
  #getElementValueAsString(tag, dicomElement, pretty) {
    let str = '';
    const strLenLimit = 65;

    // dafault to pretty output
    if (typeof pretty === 'undefined') {
      pretty = true;
    }
    // check dicom element input
    if (typeof dicomElement === 'undefined' || dicomElement === null) {
      return str;
    }

    // Polyfill for Number.isInteger.
    const isInteger = Number.isInteger || function (value) {
      return typeof value === 'number' &&
        isFinite(value) &&
        Math.floor(value) === value;
    };

    // TODO Support sequences.

    if (dicomElement.vr !== 'SQ' &&
      dicomElement.value.length === 1 && dicomElement.value[0] === '') {
      str += '(no value available)';
    } else if (isPixelDataTag(tag) &&
      dicomElement.undefinedLength) {
      str = '(PixelSequence)';
    } else if (dicomElement.vr === 'DA' && pretty) {
      const daObj = getDate(dicomElement);
      const da = new Date(daObj.year, daObj.monthIndex, daObj.day);
      str = da.toLocaleDateString();
    } else if (dicomElement.vr === 'TM' && pretty) {
      const tmObj = getTime(dicomElement);
      str = tmObj.hours + ':' + tmObj.minutes + ':' + tmObj.seconds;
    } else {
      let isOtherVR = false;
      if (dicomElement.vr.length !== 0) {
        isOtherVR = (dicomElement.vr[0].toUpperCase() === 'O');
      }
      const isFloatNumberVR = (dicomElement.vr === 'FL' ||
        dicomElement.vr === 'FD' ||
        dicomElement.vr === 'DS');
      let valueStr = '';
      for (let k = 0, lenk = dicomElement.value.length; k < lenk; ++k) {
        valueStr = '';
        if (k !== 0) {
          valueStr += '\\';
        }
        if (isFloatNumberVR) {
          const num = Number(dicomElement.value[k]);
          if (!isInteger(num) && pretty) {
            valueStr += num.toPrecision(4);
          } else {
            valueStr += num.toString();
          }
        } else if (isOtherVR) {
          let tmp = dicomElement.value[k].toString(16);
          if (dicomElement.vr === 'OB') {
            tmp = '00'.substring(0, 2 - tmp.length) + tmp;
          } else {
            tmp = '0000'.substring(0, 4 - tmp.length) + tmp;
          }
          valueStr += tmp;
        } else {
          valueStr += dicomElement.value[k];
        }
        // check length
        if (str.length + valueStr.length <= strLenLimit) {
          str += valueStr;
        } else {
          str += '...';
          break;
        }
      }
    }
    return str;
  }

  /**
   * Get a data element as a string.
   *
   * @param {Tag} tag The DICOM tag.
   * @param {object} dicomElement The DICOM element.
   * @param {string} [prefix] A string to prepend this one.
   * @returns {string} The element as a string.
   */
  #getElementAsString(tag, dicomElement, prefix) {
    // default prefix
    prefix = prefix || '';

    // get tag anme from dictionary
    const tagName = tag.getNameFromDictionary();

    let deSize = dicomElement.value.length;
    let isOtherVR = false;
    if (dicomElement.vr.length !== 0) {
      isOtherVR = (dicomElement.vr[0].toUpperCase() === 'O');
    }

    // no size for delimitations
    if (isItemDelimitationItemTag(tag) ||
      isSequenceDelimitationItemTag(tag)) {
      deSize = 0;
    } else if (isOtherVR) {
      deSize = 1;
    }

    const isPixSequence = (isPixelDataTag(tag) &&
      dicomElement.undefinedLength);

    let line = null;

    // (group,element)
    line = '(';
    line += tag.getGroup().toLowerCase();
    line += ',';
    line += tag.getElement().toLowerCase();
    line += ') ';
    // value representation
    line += dicomElement.vr;
    // value
    if (dicomElement.vr !== 'SQ' &&
      dicomElement.value.length === 1 &&
      dicomElement.value[0] === '') {
      line += ' (no value available)';
      deSize = 0;
    } else {
      // simple number display
      if (dicomElement.vr === 'na') {
        line += ' ';
        line += dicomElement.value[0];
      } else if (isPixSequence) {
        // pixel sequence
        line += ' (PixelSequence #=' + deSize + ')';
      } else if (dicomElement.vr === 'SQ') {
        line += ' (Sequence with';
        if (dicomElement.undefinedLength) {
          line += ' undefined';
        } else {
          line += ' explicit';
        }
        line += ' length #=';
        line += dicomElement.value.length;
        line += ')';
      } else if (isOtherVR ||
          dicomElement.vr === 'pi' ||
          dicomElement.vr === 'UL' ||
          dicomElement.vr === 'US' ||
          dicomElement.vr === 'SL' ||
          dicomElement.vr === 'SS' ||
          dicomElement.vr === 'FL' ||
          dicomElement.vr === 'FD' ||
          dicomElement.vr === 'AT') {
        // 'O'ther array, limited display length
        line += ' ';
        line += this.#getElementValueAsString(tag, dicomElement, false);
      } else {
        // default
        line += ' [';
        line += this.#getElementValueAsString(tag, dicomElement, false);
        line += ']';
      }
    }

    // align #
    const nSpaces = 55 - line.length;
    if (nSpaces > 0) {
      for (let s = 0; s < nSpaces; ++s) {
        line += ' ';
      }
    }
    line += ' # ';
    if (dicomElement.vl < 100) {
      line += ' ';
    }
    if (dicomElement.vl < 10) {
      line += ' ';
    }
    line += dicomElement.vl;
    line += ', ';
    line += deSize; //dictElement[1];
    line += ' ';
    if (tagName !== null) {
      line += tagName;
    } else {
      line += 'Unknown Tag & Data';
    }

    let message = null;

    // continue for sequence
    if (dicomElement.vr === 'SQ') {
      let item = null;
      for (let l = 0, lenl = dicomElement.value.length; l < lenl; ++l) {
        item = dicomElement.value[l];
        const itemKeys = Object.keys(item);
        if (itemKeys.length === 0) {
          continue;
        }

        // get the item element
        const itemTag = getItemTag();
        const itemElement = item['FFFEE000'];
        message = '(Item with';
        if (itemElement.undefinedLength) {
          message += ' undefined';
        } else {
          message += ' explicit';
        }
        message += ' length #=' + (itemKeys.length - 1) + ')';
        itemElement.value = [message];
        itemElement.vr = 'na';

        line += '\n';
        line += this.#getElementAsString(itemTag, itemElement, prefix + '  ');

        for (let m = 0, lenm = itemKeys.length; m < lenm; ++m) {
          const itemTag = getTagFromKey(itemKeys[m]);
          if (itemKeys[m] !== 'xFFFEE000') {
            line += '\n';
            line += this.#getElementAsString(itemTag, item[itemKeys[m]],
              prefix + '    ');
          }
        }

        message = '(ItemDelimitationItem';
        if (!itemElement.undefinedLength) {
          message += ' for re-encoding';
        }
        message += ')';
        const itemDelimTag = getItemDelimitationItemTag();
        const itemDelimElement = {
          vr: 'na',
          vl: '0',
          value: [message]
        };
        line += '\n';
        line += this.#getElementAsString(
          itemDelimTag, itemDelimElement, prefix + '  ');

      }

      message = '(SequenceDelimitationItem';
      if (!dicomElement.undefinedLength) {
        message += ' for re-encod.';
      }
      message += ')';
      const sqDelimTag = getSequenceDelimitationItemTag();
      const sqDelimElement = {
        vr: 'na',
        vl: '0',
        value: [message]
      };
      line += '\n';
      line += this.#getElementAsString(sqDelimTag, sqDelimElement, prefix);
    } else if (isPixSequence) {
      // pixel sequence
      let pixItem = null;
      for (let n = 0, lenn = dicomElement.value.length; n < lenn; ++n) {
        pixItem = dicomElement.value[n];
        line += '\n';
        pixItem.vr = 'pi';
        line += this.#getElementAsString(
          getPixelDataTag(), pixItem, prefix + '  ');
      }

      const pixDelimTag = getSequenceDelimitationItemTag();
      const pixDelimElement = {
        vr: 'na',
        vl: '0',
        value: ['(SequenceDelimitationItem)']
      };
      line += '\n';
      line += this.#getElementAsString(pixDelimTag, pixDelimElement, prefix);
    }

    return prefix + line;
  }

  /**
   * Get a DICOM Element value from a tag name.
   * Uses the DICOM dictionary.
   *
   * @param {string} name The tag name.
   * @returns {object} The DICOM element value.
   */
  getFromName(name) {
    let value = null;
    const tag = getTagFromDictionary(name);
    // check that we are not at the end of the dictionary
    if (tag !== null) {
      value = this.getFromKey(tag.getKey());
    }
    return value;
  }

} // class DicomElementsWrapper

/**
 * Extract the 2D size from dicom elements.
 *
 * @param {object} elements The DICOM elements.
 * @returns {object} The size.
 */
export function getImage2DSize(elements) {
  // rows
  const rows = elements['00280010'];
  if (typeof rows === 'undefined') {
    throw new Error('Missing DICOM image number of rows');
  }
  if (rows.value.length === 0) {
    throw new Error('Empty DICOM image number of rows');
  }
  // columns
  const columns = elements['00280011'];
  if (typeof columns === 'undefined') {
    throw new Error('Missing DICOM image number of columns');
  }
  if (columns.value.length === 0) {
    throw new Error('Empty DICOM image number of columns');
  }
  return [columns.value[0], rows.value[0]];
}

/**
 * Get the pixel spacing from the different spacing tags.
 *
 * @param {object} elements The DICOM elements.
 * @returns {object} The read spacing or the default [1,1].
 */
export function getPixelSpacing(elements) {
  // default
  let rowSpacing = 1;
  let columnSpacing = 1;

  // 1. PixelSpacing
  // 2. ImagerPixelSpacing
  // 3. NominalScannedPixelSpacing
  // 4. PixelAspectRatio
  const keys = ['00280030', '00181164', '00182010', '00280034'];
  for (let k = 0; k < keys.length; ++k) {
    const spacing = elements[keys[k]];
    if (spacing && spacing.value.length === 2) {
      rowSpacing = parseFloat(spacing.value[0]);
      columnSpacing = parseFloat(spacing.value[1]);
      break;
    }
  }

  // check
  if (columnSpacing === 0) {
    logger.warn('Zero column spacing.');
    columnSpacing = 1;
  }
  if (rowSpacing === 0) {
    logger.warn('Zero row spacing.');
    rowSpacing = 1;
  }

  // return
  // (slice spacing will be calculated using the image position patient)
  return new Spacing([columnSpacing, rowSpacing, 1]);
}

/**
 * Get the pixel data unit.
 *
 * @param {object} elements The DICOM elements.
 * @returns {string|null} The unit value if available.
 */
export function getPixelUnit(elements) {
  let unit;
  // 1. RescaleType
  // 2. Units (for PET)
  const keys = ['00281054', '00541001'];
  for (let i = 0; i < keys.length; ++i) {
    const element = elements[keys[i]];
    if (typeof element !== 'undefined') {
      unit = element.value[0];
    }
  }
  // default rescale type for CT
  if (typeof unit !== 'undefined') {
    const modality = elements['00080060'].value[0];
    if (modality === 'CT') {
      unit = 'HU';
    }
  }
  return unit;
}

/**
 * Get a 'date' object with {year, monthIndex, day} ready for the
 *   Date constructor from a DICOM element with vr=DA.
 *
 * @param {object} element The DICOM element with date information.
 * @returns {{year, monthIndex, day}|undefined} The 'date' object.
 */
export function getDate(element) {
  if (typeof element === 'undefined') {
    return undefined;
  }
  if (element.value.length !== 1) {
    return undefined;
  }
  const daValue = element.value[0];
  // Two possible formats:
  // - standard 'YYYYMMDD'
  // - non-standard 'YYYY.MM.DD' (previous ACR-NEMA)
  let monthBeginIndex = 4;
  let dayBeginIndex = 6;
  if (daValue.length === 10) {
    monthBeginIndex = 5;
    dayBeginIndex = 8;
  }
  const daYears = parseInt(daValue.substring(0, 4), 10);
  // 0-11 range
  const daMonthIndex = daValue.length >= monthBeginIndex + 2
    ? parseInt(daValue.substring(
      monthBeginIndex, monthBeginIndex + 2), 10) - 1 : 0;
  const daDay = daValue.length === dayBeginIndex + 2
    ? parseInt(daValue.substring(
      dayBeginIndex, dayBeginIndex + 2), 10) : 0;
  return {
    year: daYears,
    monthIndex: daMonthIndex,
    day: daDay
  };
}

/**
 * Get a time object with {hours, minutes, seconds} ready for the
 *   Date constructor from a DICOM element with vr=TM.
 *
 * @param {object} element The DICOM element with date information.
 * @returns {{hours, minutes, seconds, milliseconds}|undefined} The time object.
 */
export function getTime(element) {
  if (typeof element === 'undefined') {
    return undefined;
  }
  if (element.value.length !== 1) {
    return undefined;
  }
  // format: HH[MMSS.FFFFFF]
  const tmValue = element.value[0];
  const tmHours = parseInt(tmValue.substring(0, 2), 10);
  const tmMinutes = tmValue.length >= 4
    ? parseInt(tmValue.substring(2, 4), 10) : 0;
  const tmSeconds = tmValue.length >= 6
    ? parseInt(tmValue.substring(4, 6), 10) : 0;
  const tmFracSecondsStr = tmValue.length >= 8
    ? tmValue.substring(7, 10) : 0;
  const tmMilliSeconds = tmFracSecondsStr === 0 ? 0
    : parseInt(tmFracSecondsStr, 10) *
      Math.pow(10, 3 - tmFracSecondsStr.length);
  return {
    hours: tmHours,
    minutes: tmMinutes,
    seconds: tmSeconds,
    milliseconds: tmMilliSeconds
  };
}

/**
 * Get a 'dateTime' object with {date, time} ready for the
 *   Date constructor from a DICOM element with vr=DT.
 *
 * @param {object} element The DICOM element with date-time information.
 * @returns {{date, time}|undefined} The time object.
 */
export function getDateTime(element) {
  if (typeof element === 'undefined') {
    return undefined;
  }
  if (element.value.length !== 1) {
    return undefined;
  }
  // format: YYYYMMDDHHMMSS.FFFFFF&ZZXX
  const dtFullValue = element.value[0];
  // remove offset (&ZZXX)
  const dtValue = dtFullValue.split('&')[0];
  const dtDate = getDate({value: [dtValue.substring(0, 8)]});
  const dtTime = dtValue.length >= 9
    ? getTime({value: [dtValue.substring(8)]}) : undefined;
  return {
    date: dtDate,
    time: dtTime
  };
}

/**
 * Check an input tag.
 *
 * @param {object} element The element to check.
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
 * Do the input elements allow for PET SUV calculation.
 *
 * @param {object} elements The DICOM elements to check.
 * @returns {string} A warning if the elements are not as expected.
 */
export function canGetSuvFactor(elements) {
  let warning = '';

  // RadiopharmaceuticalInformationSequence (type2)
  const radioInfoSqStr = 'RadiopharmaceuticalInformationSequence (00540016)';
  const radioInfoSq = elements['00540016'];
  warning += checkTag(radioInfoSq, radioInfoSqStr);
  if (typeof radioInfoSq !== 'undefined') {
    // RadionuclideTotalDose (type3, Bq)
    const totalDoseStr = 'RadionuclideTotalDose (00181074)';
    const totalDoseEl = radioInfoSq.value[0]['00181074'];
    warning += checkTag(totalDoseEl, totalDoseStr);
    // RadionuclideHalfLife (type3, seconds)
    const halfLifeStr = 'RadionuclideHalfLife (00181075)';
    const halfLifeEl = radioInfoSq.value[0]['00181075'];
    warning += checkTag(halfLifeEl, halfLifeStr);
  }
  // PatientWeight (type3, kilograms)
  const patientWeightStr = ' PatientWeight (00101030)';
  const patWeightEl = elements['00101030'];
  warning += checkTag(patWeightEl, patientWeightStr);

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

  // series date/time must be before acquisition date/time

  // AcquisitionDate (type3)
  const acqDateEl = elements['00080022'];
  // AcquisitionTime (type3)
  const acqTimeEl = elements['00080032'];

  if (typeof acqDateEl !== 'undefined' &&
    typeof acqTimeEl !== 'undefined') {
    const acqDateObj = getDate(acqDateEl);
    const acqTimeObj = getTime(acqTimeEl);
    const acqDate = new Date(
      acqDateObj.year, acqDateObj.monthIndex, acqDateObj.day,
      acqTimeObj.hours, acqTimeObj.minutes,
      acqTimeObj.seconds, acqTimeObj.milliseconds
    );

    // SeriesDate (type1 for PET)
    const seriesDateEl = elements['00080021'];
    // SeriesTime (type1 for PET)
    const seriesTimeEl = elements['00080031'];
    const seriesDateObj = getDate(seriesDateEl);
    const seriesTimeObj = getTime(seriesTimeEl);
    const seriesDate = new Date(
      seriesDateObj.year, seriesDateObj.monthIndex, seriesDateObj.day,
      seriesTimeObj.hours, seriesTimeObj.minutes,
      seriesTimeObj.seconds, seriesTimeObj.milliseconds
    );

    if (seriesDate > acqDate) {
      warning += ' Series date/time is after Aquisition date/time';
    }
  }

  if (warning.length !== 0) {
    warning = 'Cannot calculate PET SUV:' + warning;
  }
  return warning;
}

/**
 * Get the PET SUV factor.
 *
 * @see https://qibawiki.rsna.org/images/6/62/SUV_vendorneutral_pseudocode_happypathonly_20180626_DAC.pdf
 * (from https://qibawiki.rsna.org/index.php/Standardized_Uptake_Value_(SUV)#SUV_Calculation )
 * @param {object} elements The DICOM elements.
 * @returns {number} The factor.
 */
export function getSuvFactor(elements) {

  // SeriesDate (type1 for PET)
  const seriesDateEl = elements['00080021'];
  const seriesDateObj = getDate(seriesDateEl);
  // SeriesTime (type1 for PET)
  const seriesTimeEl = elements['00080031'];
  const seriesTimeObj = getTime(seriesTimeEl);

  // RadiopharmaceuticalInformationSequence (type2)
  const radioInfoSq = elements['00540016'];
  if (radioInfoSq.value.length !== 1) {
    console.warn(
      'Found more than 1 istopes in RadiopharmaceuticalInformation Sequence.');
  }
  // RadiopharmaceuticalStartDateTime (type3)
  const radioStartDateTimeEl = radioInfoSq.value[0]['00181078'];
  let radioStartDateObj;
  let radioStartTimeObj;
  if (typeof radioStartDateTimeEl === 'undefined') {
    radioStartDateObj = seriesDateObj;
    // RadiopharmaceuticalStartTime (type3)
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
  const radioStart = new Date(
    radioStartDateObj.year,
    radioStartDateObj.monthIndex,
    radioStartDateObj.day,
    radioStartTimeObj.hours,
    radioStartTimeObj.minutes,
    radioStartTimeObj.seconds,
    radioStartTimeObj.milliseconds
  );

  // RadionuclideTotalDose (type3, Bq)
  const totalDoseEl = radioInfoSq.value[0]['00181074'];
  // RadionuclideHalfLife (type3, seconds)
  const halfLifeEl = radioInfoSq.value[0]['00181075'];
  // PatientWeight (type3, kilograms)
  const patWeightEl = elements['00101030'];

  // Series date/time
  const scanStart = new Date(
    seriesDateObj.year,
    seriesDateObj.monthIndex,
    seriesDateObj.day,
    seriesTimeObj.hours,
    seriesTimeObj.minutes,
    seriesTimeObj.seconds,
    seriesTimeObj.milliseconds
  );
  // Date diff is in milliseconds
  const decaySeconds = (scanStart.getTime() - radioStart.getTime()) / 1000;
  const decay = Math.pow(2,
    (-decaySeconds / parseFloat(halfLifeEl.value[0]))
  );
  const decayedDose = totalDoseEl.value[0] * decay;
  // factor is grams / Bq
  const suvFactor = (patWeightEl.value[0] * 1000) / decayedDose;

  return suvFactor;
}

/**
 * Get the file list from a DICOMDIR
 *
 * @param {object} data The buffer data of the DICOMDIR
 * @returns {Array|undefined} The file list as an array ordered by
 *   STUDY > SERIES > IMAGES.
 */
export function getFileListFromDicomDir(data) {
  // parse file
  const parser = new DicomParser();
  parser.parse(data);
  const elements = parser.getDicomElements();

  // Directory Record Sequence
  if (typeof elements['00041220'] === 'undefined' ||
    typeof elements['00041220'].value === 'undefined') {
    logger.warn('No Directory Record Sequence found in DICOMDIR.');
    return undefined;
  }
  const dirSeq = elements['00041220'].value;

  if (dirSeq.length === 0) {
    logger.warn('The Directory Record Sequence of the DICOMDIR is empty.');
    return undefined;
  }

  const records = [];
  let series = null;
  let study = null;
  for (let i = 0; i < dirSeq.length; ++i) {
    // Directory Record Type
    if (typeof dirSeq[i]['00041430'] === 'undefined' ||
      typeof dirSeq[i]['00041430'].value === 'undefined') {
      continue;
    }
    const recType = dirSeq[i]['00041430'].value[0];

    // supposed to come in order...
    if (recType === 'STUDY') {
      study = [];
      records.push(study);
    } else if (recType === 'SERIES') {
      series = [];
      study.push(series);
    } else if (recType === 'IMAGE') {
      // Referenced File ID
      if (typeof dirSeq[i]['00041500'] === 'undefined' ||
        typeof dirSeq[i]['00041500'].value === 'undefined') {
        continue;
      }
      const refFileIds = dirSeq[i]['00041500'].value;
      // join ids
      series.push(refFileIds.join('/'));
    }
  }
  return records;
}

/**
 * Methods used to extract values from DICOM elements.
 *
 * Implemented as class and method to allow for override via its prototype.
 */
export class TagValueExtractor {
  /**
   * Get the time.
   *
   * @param {object} _elements The DICOM elements.
   * @returns {number|undefined} The time value if available.
   */
  getTime(_elements) {
    // default returns undefined
    return undefined;
  }
}
