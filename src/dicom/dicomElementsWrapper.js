import {
  DicomParser,
  cleanString,
  getTransferSyntaxName
} from './dicomParser';
import {
  isPixelDataTag,
  isItemDelimitationItemTag,
  isSequenceDelimitationItemTag,
  getItemDelimitationItemTag,
  getSequenceDelimitationItemTag,
  getTagFromDictionary
} from './dicomTag';
import {isNativeLittleEndian} from './dataReader';
import {Spacing} from '../image/spacing';
import {logger} from '../utils/logger';

/**
 * DicomElements wrapper.
 */
export class DicomElementsWrapper {

  /**
   * Wrapped elements.
   *
   * @private
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
   * @param {boolean} asArray Get the value as an Array.
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
      obj[this.#getTagName(dicomElement.tag)] =
        this.#getElementAsObject(dicomElement);
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
      name = tag.getKey2();
    }
    return name;
  }

  /**
   * Get a DICOM element as a simple object.
   *
   * @param {object} dicomElement The DICOM element.
   * @returns {object} The element as a simple object.
   */
  #getElementAsObject(dicomElement) {
    // element value
    let value = null;

    const isPixel = isPixelDataTag(dicomElement.tag);

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
          const key = this.#getTagName(itemElement.tag);
          // do not inclure Item elements
          if (key !== 'Item') {
            itemValues[key] = this.#getElementAsObject(itemElement);
          }
        }
        value.push(itemValues);
      }
    } else {
      value = this.#getElementValueAsString(dicomElement);
    }

    // return
    return {
      value: value,
      group: dicomElement.tag.getGroup(),
      element: dicomElement.tag.getElement(),
      vr: vr,
      vl: dicomElement.vl
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
    let checkHeader = true;
    for (let i = 0, leni = keys.length; i < leni; ++i) {
      dicomElement = this.#dicomElements[keys[i]];
      if (checkHeader && dicomElement.tag.getGroup() !== '0x0002') {
        result += '\n';
        result += '# Dicom-Data-Set\n';
        result += '# Used TransferSyntax: ';
        const syntax = cleanString(
          this.#dicomElements.x00020010.value[0]);
        result += getTransferSyntaxName(syntax);
        result += '\n';
        checkHeader = false;
      }
      result += this.#getElementAsString(dicomElement) + '\n';
    }
    return result;
  }

  /**
   * Get a data element value as a string.
   *
   * @param {object} dicomElement The DICOM element.
   * @param {boolean} pretty When set to true, returns a 'pretified' content.
   * @returns {string} A string representation of the DICOM element.
   */
  #getElementValueAsString(
    dicomElement, pretty) {
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
    } else if (isPixelDataTag(dicomElement.tag) &&
      dicomElement.undefinedLength) {
      str = '(PixelSequence)';
    } else if (dicomElement.vr === 'DA' && pretty) {
      const daValue = dicomElement.value[0];
      // Two possible date formats:
      // - standard 'YYYYMMDD'
      // - non-standard 'YYYY.MM.DD' (previous ACR-NEMA)
      let monthBeginIndex = 4;
      let dayBeginIndex = 6;
      if (daValue.length !== 8) {
        monthBeginIndex = 5;
        dayBeginIndex = 8;
      }
      const da = new Date(
        parseInt(daValue.substring(0, 4), 10),
        parseInt(daValue.substring(
          monthBeginIndex, monthBeginIndex + 2), 10) - 1, // 0-11 range
        parseInt(daValue.substring(
          dayBeginIndex, dayBeginIndex + 2), 10));
      str = da.toLocaleDateString();
    } else if (dicomElement.vr === 'TM' && pretty) {
      const tmValue = dicomElement.value[0];
      const tmHour = tmValue.substring(0, 2);
      const tmMinute = tmValue.length >= 4 ? tmValue.substring(2, 4) : '00';
      const tmSeconds = tmValue.length >= 6 ? tmValue.substring(4, 6) : '00';
      str = tmHour + ':' + tmMinute + ':' + tmSeconds;
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
          let val = dicomElement.value[k];
          if (typeof val === 'string') {
            val = cleanString(val);
          }
          const num = Number(val);
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
        } else if (typeof dicomElement.value[k] === 'string') {
          valueStr += cleanString(dicomElement.value[k]);
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
   * @param {object} dicomElement The DICOM element.
   * @param {string} prefix A string to prepend this one.
   * @returns {string} The element as a string.
   */
  #getElementAsString(dicomElement, prefix) {
    // default prefix
    prefix = prefix || '';

    // get tag anme from dictionary
    const tag = dicomElement.tag;
    const tagName = tag.getNameFromDictionary();

    let deSize = dicomElement.value.length;
    let isOtherVR = false;
    if (dicomElement.vr.length !== 0) {
      isOtherVR = (dicomElement.vr[0].toUpperCase() === 'O');
    }

    // no size for delimitations
    if (isItemDelimitationItemTag(dicomElement.tag) ||
      isSequenceDelimitationItemTag(dicomElement.tag)) {
      deSize = 0;
    } else if (isOtherVR) {
      deSize = 1;
    }

    const isPixSequence = (isPixelDataTag(dicomElement.tag) &&
      dicomElement.undefinedLength);

    let line = null;

    // (group,element)
    line = '(';
    line += dicomElement.tag.getGroup().substring(2).toLowerCase();
    line += ',';
    line += dicomElement.tag.getElement().substring(2).toLowerCase();
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
        line += this.#getElementValueAsString(dicomElement, false);
      } else {
        // default
        line += ' [';
        line += this.#getElementValueAsString(dicomElement, false);
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
        const itemElement = item.xFFFEE000;
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
        line += this.#getElementAsString(itemElement, prefix + '  ');

        for (let m = 0, lenm = itemKeys.length; m < lenm; ++m) {
          if (itemKeys[m] !== 'xFFFEE000') {
            line += '\n';
            line += this.#getElementAsString(item[itemKeys[m]],
              prefix + '    ');
          }
        }

        message = '(ItemDelimitationItem';
        if (!itemElement.undefinedLength) {
          message += ' for re-encoding';
        }
        message += ')';
        const itemDelimElement = {
          tag: getItemDelimitationItemTag(),
          vr: 'na',
          vl: '0',
          value: [message]
        };
        line += '\n';
        line += this.#getElementAsString(itemDelimElement, prefix + '  ');

      }

      message = '(SequenceDelimitationItem';
      if (!dicomElement.undefinedLength) {
        message += ' for re-encod.';
      }
      message += ')';
      const sqDelimElement = {
        tag: getSequenceDelimitationItemTag(),
        vr: 'na',
        vl: '0',
        value: [message]
      };
      line += '\n';
      line += this.#getElementAsString(sqDelimElement, prefix);
    } else if (isPixSequence) {
      // pixel sequence
      let pixItem = null;
      for (let n = 0, lenn = dicomElement.value.length; n < lenn; ++n) {
        pixItem = dicomElement.value[n];
        line += '\n';
        pixItem.vr = 'pi';
        line += this.#getElementAsString(pixItem, prefix + '  ');
      }

      const pixDelimElement = {
        tag: getSequenceDelimitationItemTag(),
        vr: 'na',
        vl: '0',
        value: ['(SequenceDelimitationItem)']
      };
      line += '\n';
      line += this.#getElementAsString(pixDelimElement, prefix);
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
 * @returns {object} The size.
 */
export function getImage2DSize(elements) {
  // rows
  const rows = elements['x00280010'];
  if (typeof rows === 'undefined') {
    throw new Error('Missing DICOM image number of rows');
  }
  if (rows.value.length === 0) {
    throw new Error('Empty DICOM image number of rows');
  }
  // columns
  const columns = elements['x00280011'];
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
  const keys = ['x00280030', 'x00181164', 'x00182010', 'x00280034'];
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
 * Get the time.
 *
 * @returns {number|undefined} The time value if available.
 */
export function getTime(_elements) {
  // default returns undefined
  return undefined;
}

/**
 * Get the pixel data unit.
 *
 * @returns {string|null} The unit value if available.
 */
export function getPixelUnit(elements) {
  let unit;
  // 1. RescaleType
  // 2. Units (for PET)
  const keys = ['x00281054', 'x00541001'];
  for (let i = 0; i < keys.length; ++i) {
    const element = elements[keys[i]];
    if (typeof element !== 'undefined') {
      unit = element.value[0];
    }
  }
  // default rescale type for CT
  if (typeof unit !== 'undefined') {
    const modality = elements['x00080060'].value[0];
    if (modality === 'CT') {
      unit = 'HU';
    }
  }
  return unit;
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
  const elements = parser.getRawDicomElements();

  // Directory Record Sequence
  if (typeof elements.x00041220 === 'undefined' ||
    typeof elements.x00041220.value === 'undefined') {
    logger.warn('No Directory Record Sequence found in DICOMDIR.');
    return undefined;
  }
  const dirSeq = elements.x00041220.value;

  if (dirSeq.length === 0) {
    logger.warn('The Directory Record Sequence of the DICOMDIR is empty.');
    return undefined;
  }

  const records = [];
  let series = null;
  let study = null;
  for (let i = 0; i < dirSeq.length; ++i) {
    // Directory Record Type
    if (typeof dirSeq[i].x00041430 === 'undefined' ||
      typeof dirSeq[i].x00041430.value === 'undefined') {
      continue;
    }
    const recType = cleanString(dirSeq[i].x00041430.value[0]);

    // supposed to come in order...
    if (recType === 'STUDY') {
      study = [];
      records.push(study);
    } else if (recType === 'SERIES') {
      series = [];
      study.push(series);
    } else if (recType === 'IMAGE') {
      // Referenced File ID
      if (typeof dirSeq[i].x00041500 === 'undefined' ||
        typeof dirSeq[i].x00041500.value === 'undefined') {
        continue;
      }
      const refFileIds = dirSeq[i].x00041500.value;
      // clean and join ids
      let refFileId = '';
      for (let j = 0; j < refFileIds.length; ++j) {
        if (j !== 0) {
          refFileId += '/';
        }
        refFileId += cleanString(refFileIds[j]);
      }
      series.push(refFileId);
    }
  }
  return records;
}
