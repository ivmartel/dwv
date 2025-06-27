import {getTransferSyntaxName} from './dicomParser.js';
import {
  getDate,
  getTime
} from './dicomDate.js';
import {
  isAnyPixelDataTag,
  isItemDelimitationItemTag,
  isSequenceDelimitationItemTag,
  getItemTag,
  getItemDelimitationItemTag,
  getSequenceDelimitationItemTag,
  getPixelDataTag,
  getTagFromKey
} from './dicomTag.js';
import {isNativeLittleEndian} from './dataReader.js';

// doc imports
/* eslint-disable no-unused-vars */
import {Tag} from './dicomTag.js';
import {DataElement} from './dataElement.js';
/* eslint-enable no-unused-vars */

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
 * @param {DataElement} dicomElement The DICOM element.
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
  } else if (isAnyPixelDataTag(tag) &&
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
 * @param {DataElement} dicomElement The DICOM element.
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

  const isPixSequence = (isAnyPixelDataTag(tag) &&
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
