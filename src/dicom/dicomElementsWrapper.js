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
  getTagFromKey
} from './dicomTag';
import {isNativeLittleEndian} from './dataReader';
import {getOrientationFromCosines} from '../math/orientation';
import {Spacing} from '../image/spacing';
import {logger} from '../utils/logger';

// doc imports
/* eslint-disable no-unused-vars */
import {Tag} from './dicomTag';
import {DataElement} from './dataElement';
import {Matrix33} from '../math/matrix';
/* eslint-enable no-unused-vars */

/**
 * @typedef {Object<string, DataElement>} DataElements
 */

/**
 * Dump the DICOM tags to a string in the same way as the
 * DCMTK `dcmdump` command (https://support.dcmtk.org/docs-dcmrt/dcmdump.html).
 *
 * @param {Object<string, DataElement>} dicomElements The dicom elements.
 * @returns {string} The dumped file.
 */
export function dcmdump(dicomElements) {
  const keys = Object.keys(dicomElements);
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
    dicomElement = dicomElements[keys[i]];
    tag = getTagFromKey(keys[i]);
    if (checkHeader && tag.getGroup() !== '0002') {
      result += '\n';
      result += '# Dicom-Data-Set\n';
      result += '# Used TransferSyntax: ';
      const syntax = dicomElements['00020010'].value[0];
      result += getTransferSyntaxName(syntax);
      result += '\n';
      checkHeader = false;
    }
    result += getElementAsString(tag, dicomElement) + '\n';
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
function getElementValueAsString(tag, dicomElement, pretty) {
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
function getElementAsString(tag, dicomElement, prefix) {
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
      line += getElementValueAsString(tag, dicomElement, false);
    } else {
      // default
      line += ' [';
      line += getElementValueAsString(tag, dicomElement, false);
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
      line += getElementAsString(itemTag, itemElement, prefix + '  ');

      for (let m = 0, lenm = itemKeys.length; m < lenm; ++m) {
        const itemTag = getTagFromKey(itemKeys[m]);
        if (itemKeys[m] !== 'xFFFEE000') {
          line += '\n';
          line += getElementAsString(itemTag, item[itemKeys[m]],
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
      line += getElementAsString(
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
    line += getElementAsString(sqDelimTag, sqDelimElement, prefix);
  } else if (isPixSequence) {
    // pixel sequence
    let pixItem = null;
    for (let n = 0, lenn = dicomElement.value.length; n < lenn; ++n) {
      pixItem = dicomElement.value[n];
      line += '\n';
      pixItem.vr = 'pi';
      line += getElementAsString(
        getPixelDataTag(), pixItem, prefix + '  ');
    }

    const pixDelimTag = getSequenceDelimitationItemTag();
    const pixDelimElement = {
      vr: 'na',
      vl: '0',
      value: ['(SequenceDelimitationItem)']
    };
    line += '\n';
    line += getElementAsString(pixDelimTag, pixDelimElement, prefix);
  }

  return prefix + line;
}

/**
 * Extract the 2D size from dicom elements.
 *
 * @param {DataElements} elements The DICOM elements.
 * @returns {number[]} The size.
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
 * @param {DataElements} elements The DICOM elements.
 * @returns {Spacing} The read spacing or the default [1,1].
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
      // spacing order: [row, column]
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
 * @param {DataElements} elements The DICOM elements.
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
      break;
    }
  }
  // default rescale type for CT
  if (typeof unit === 'undefined') {
    const element = elements['00080060'];
    if (typeof element !== 'undefined') {
      const modality = element.value[0];
      if (modality === 'CT') {
        unit = 'HU';
      }
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
 * Pad an input string with a '0' to form a 2 digit one.
 *
 * @param {string} str The string to pad.
 * @returns {string} The padded string.
 */
function padZeroTwoDigit(str) {
  return ('0' + str).slice(-2);
}

/**
 * Get a DICOM formated date.
 *
 * @param {Date} date The date to format.
 * @returns {string} The formated date.
 */
export function getDicomDate(date) {
  // YYYYMMDD
  return (
    date.getFullYear().toString() +
    padZeroTwoDigit((date.getMonth() + 1).toString()) +
    padZeroTwoDigit(date.getDate().toString())
  );
}

/**
 * Get a DICOM formated time.
 *
 * @param {Date} date The date to format.
 * @returns {string} The formated time.
 */
export function getDicomTime(date) {
  // HHMMSS
  return (
    padZeroTwoDigit(date.getHours().toString()) +
    padZeroTwoDigit(date.getMinutes().toString()) +
    padZeroTwoDigit(date.getSeconds().toString())
  );
}

/**
 * Check the dimension organization from a dicom element.
 *
 * @param {DataElements} dataElements The root dicom element.
 * @returns {object} The dimension organizations and indices.
 */
export function getDimensionOrganization(dataElements) {
  // Dimension Organization Sequence (required)
  const orgSq = dataElements['00209221'];
  if (typeof orgSq === 'undefined' || orgSq.value.length !== 1) {
    throw new Error('Unsupported dimension organization sequence length');
  }
  // Dimension Organization UID
  const orgUID = orgSq.value[0]['00209164'].value[0];

  // Dimension Index Sequence (conditionally required)
  const indices = [];
  const indexSqElem = dataElements['00209222'];
  if (typeof indexSqElem !== 'undefined') {
    const indexSq = indexSqElem.value;
    // expecting 2D index
    if (indexSq.length !== 2) {
      throw new Error('Unsupported dimension index sequence length');
    }
    let indexPointer;
    for (let i = 0; i < indexSq.length; ++i) {
      // Dimension Organization UID (required)
      const indexOrg = indexSq[i]['00209164'].value[0];
      if (indexOrg !== orgUID) {
        throw new Error(
          'Dimension Index Sequence contains a unknown Dimension Organization');
      }
      // Dimension Index Pointer (required)
      indexPointer = indexSq[i]['00209165'].value[0];

      const index = {
        DimensionOrganizationUID: indexOrg,
        DimensionIndexPointer: indexPointer
      };
      // Dimension Description Label (optional)
      if (typeof indexSq[i]['00209421'] !== 'undefined') {
        index.DimensionDescriptionLabel = indexSq[i]['00209421'].value[0];
      }
      // store
      indices.push(index);
    }
    // expecting Image Position at last position
    if (indexPointer !== '(0020,0032)') {
      throw new Error('Unsupported non image position as last index');
    }
  }

  return {
    organizations: {
      value: [
        {
          DimensionOrganizationUID: orgUID
        }
      ]
    },
    indices: {
      value: indices
    }
  };
}

/**
 * Get a spacing object from a dicom measure element.
 *
 * @param {DataElements} dataElements The dicom element.
 * @returns {Spacing} A spacing object.
 */
export function getSpacingFromMeasure(dataElements) {
  // Pixel Spacing
  if (typeof dataElements['00280030'] === 'undefined') {
    return null;
  }
  const pixelSpacing = dataElements['00280030'];
  // spacing order: [row, column]
  const spacingValues = [
    parseFloat(pixelSpacing.value[1]),
    parseFloat(pixelSpacing.value[0]),
  ];
  // Spacing Between Slices
  if (typeof dataElements['00180088'] !== 'undefined') {
    spacingValues.push(parseFloat(dataElements['00180088'].value[0]));
  }
  return new Spacing(spacingValues);
}

/**
 * Get an orientation matrix from a dicom orientation element.
 *
 * @param {DataElements} dataElements The dicom element.
 * @returns {Matrix33|undefined} The orientation matrix.
 */
export function getOrientationMatrix(dataElements) {
  const imageOrientationPatient = dataElements['00200037'];
  let orientationMatrix;
  // slice orientation (cosines are matrices' columns)
  // http://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.7.6.2.html#sect_C.7.6.2.1.1
  if (typeof imageOrientationPatient !== 'undefined') {
    orientationMatrix =
      getOrientationFromCosines(
        imageOrientationPatient.value.map((item) => parseFloat(item))
      );
  }
  return orientationMatrix;
}

/**
 * Get a dicom item from a measure sequence.
 *
 * @param {Spacing} spacing The spacing object.
 * @returns {object} The dicom item.
 */
export function getDicomMeasureItem(spacing) {
  return {
    SpacingBetweenSlices: spacing.get(2),
    PixelSpacing: [spacing.get(1), spacing.get(0)]
  };
}

/**
 * Get a dicom element from a plane orientation sequence.
 *
 * @param {Matrix33} orientation The image orientation.
 * @returns {object} The dicom element.
 */
export function getDicomPlaneOrientationItem(orientation) {
  return {
    ImageOrientationPatient: [
      orientation.get(0, 0),
      orientation.get(1, 0),
      orientation.get(2, 0),
      orientation.get(0, 1),
      orientation.get(1, 1),
      orientation.get(2, 1)
    ]
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
 * Get the decayed dose (Bq).
 *
 * @param {object} elements The DICOM elements to check.
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
      totalDose = totalDoseEl.value[0];
    } else {
      warning += warn;
    }

    // RadionuclideHalfLife (type3, seconds)
    const halfLifeStr = 'RadionuclideHalfLife (00181075)';
    const halfLifeEl = radioInfoSq.value[0]['00181075'];
    warn = checkTag(halfLifeEl, halfLifeStr);
    if (warn.length === 0) {
      halfLife = parseFloat(halfLifeEl.value[0]);
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
 * @param {object} elements The DICOM elements.
 * @returns {object} The value and a warning if
 *   the elements are not as expected.
 */
export function getSuvFactor(elements) {
  let warning = '';

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
    patWeight = patWeightEl.value[0];
  } else {
    warning += warn;
  }

  // Decayed dose (Bq)
  const decayedDose = getDecayedDose(elements);
  warning += decayedDose.warning;

  const result = {};
  if (warning.length !== 0) {
    result.warning = 'Cannot calculate PET SUV:' + warning;
  } else {
    // SUV factor (grams/Bq)
    result.value = (patWeight * 1000) / decayedDose.value;
  }

  return result;
}

/**
 * Get the file list from a DICOMDIR.
 *
 * @param {object} data The buffer data of the DICOMDIR.
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
   * @param {Object<string, DataElement>} _elements The DICOM elements.
   * @returns {number|undefined} The time value if available.
   */
  getTime(_elements) {
    // default returns undefined
    return undefined;
  }
}
