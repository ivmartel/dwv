import {
  getTransferSyntaxName,
  isImplicitTransferSyntax,
  getDataElementPrefixByteSize
} from './dicomParser.js';
import {
  getDateObj,
  getTimeObj,
  getDate
} from './dicomDate.js';
import {
  isAnyPixelDataTag,
  isItemTag,
  getItemTag,
  getItemDelimitationItemTag,
  getSequenceDelimitationItemTag,
  getTagFromKey
} from './dicomTag.js';
import {isNativeLittleEndian} from './dataReader.js';
import {getDicomTagInfo} from './dicomTagInfo.js';
import {vrTypes} from './dictionary.js';
import {DataElement} from './dataElement.js';

/**
 * @import {Tag} from './dicomTag.js';
 */

/**
 * Dump the DICOM tags to a string in the same way as the
 * DCMTK `dcmdump` command (https://support.dcmtk.org/docs-dcmrt/dcmdump.html).
 *
 * @param {Record<string, DataElement>} dicomElements The dicom elements.
 * @returns {string} The dumped file.
 */
export function dcmdump(dicomElements) {
  // sort keys: integer like keys (for ex '60000010') come first otherwise
  const keys = Object.keys(dicomElements).sort();
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
  const syntax = dicomElements['00020010'].value[0];
  let dicomElement;
  let tag;
  let checkHeader = true;
  // the meta information header is always explicit
  let isImplicit = false;
  for (let i = 0, leni = keys.length; i < leni; ++i) {
    dicomElement = dicomElements[keys[i]];
    tag = getTagFromKey(keys[i]);
    if (checkHeader && tag.getGroup() !== '0002') {
      result += '\n';
      result += '# Dicom-Data-Set\n';
      result += '# Used TransferSyntax: ';
      result += getTransferSyntaxName(syntax);
      result += '\n';
      checkHeader = false;
      isImplicit = isImplicitTransferSyntax(syntax);
    }
    result += `${getElementAsString(tag, dicomElement, '', isImplicit)}\n`;
  }
  return result;
}

/**
 * Is the input VR a binary VR: 'O'ther or Unknown (UN).
 *
 * @param {string} vr The value representation.
 * @returns {boolean} True if binary.
 */
function isBinaryVR(vr) {
  return vr === 'UN' || (vr.length !== 0 && vr[0].toUpperCase() === 'O');
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
    const da = getDate(getDateObj(dicomElement));
    str = da.toLocaleDateString();
  } else if (dicomElement.vr === 'TM' && pretty) {
    const tmObj = getTimeObj(dicomElement);
    str = `${tmObj.hours}:${tmObj.minutes}:${tmObj.seconds}`;
  } else {
    const isOtherVR = isBinaryVR(dicomElement.vr);
    const isFloatNumberVR = (dicomElement.vr === 'FL' ||
      dicomElement.vr === 'FD' ||
      dicomElement.vr === 'DS');
    // pixel data value is a list of frames: display the first one
    /** @type {ArrayLike<any>} */
    let values = dicomElement.value;
    const first = dicomElement.value[0];
    if (Array.isArray(values) && ArrayBuffer.isView(first)) {
      values = dicomElement.value[0];
    }
    for (let k = 0, lenk = values.length; k < lenk; ++k) {
      let valueStr = '';
      if (k !== 0) {
        valueStr += '\\';
      }
      if (isFloatNumberVR) {
        const num = Number(values[k]);
        if (!isInteger(num) && pretty) {
          valueStr += num.toPrecision(4);
        } else {
          valueStr += num.toString();
        }
      } else if (isOtherVR) {
        let tmp = values[k].toString(16);
        if (dicomElement.vr === 'OB' || dicomElement.vr === 'UN') {
          tmp = '00'.substring(0, 2 - tmp.length) + tmp;
        } else {
          tmp = '0000'.substring(0, 4 - tmp.length) + tmp;
        }
        valueStr += tmp;
      } else {
        valueStr += values[k];
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
 * Text encoder used to get string byte lengths.
 */
const textEncoder = new TextEncoder();

/**
 * Get the value length (in bytes) of a data element, as it would be
 * written. The parser does not keep the read value length, so it is
 * computed from the parsed value.
 * String lengths are computed using UTF-8, they can differ from the
 * written ones for non ASCII characters with other character sets.
 *
 * @param {Tag} tag The DICOM tag.
 * @param {DataElement} dicomElement The DICOM element.
 * @param {boolean} isImplicit Does the data use implicit VR?
 * @returns {number} The value length.
 */
function getValueLength(tag, dicomElement, isImplicit) {
  const value = dicomElement.value;
  if (typeof value === 'undefined' || value === null) {
    return 0;
  }
  const delimitationLength = getDataElementPrefixByteSize('NONE', isImplicit);
  let length = 0;
  if (dicomElement.vr === 'SQ') {
    for (const item of value) {
      length += getItemLength(item, isImplicit);
    }
    if (dicomElement.undefinedLength) {
      length += delimitationLength;
    }
  } else if (isAnyPixelDataTag(tag) && dicomElement.undefinedLength) {
    // pixel sequence: fragments and sequence delimitation item
    for (const fragment of value) {
      length += delimitationLength + fragment.byteLength;
    }
    length += delimitationLength;
  } else if (dicomElement.vr === 'AT') {
    length = 4 * value.length;
  } else if (vrTypes[dicomElement.vr] === 'string') {
    length = textEncoder.encode(value.join('\\')).length;
  } else if (ArrayBuffer.isView(value)) {
    length = value.byteLength;
  } else if (Array.isArray(value) && ArrayBuffer.isView(value[0])) {
    // pixel data frames
    for (const frame of value) {
      length += frame.byteLength;
    }
  } else {
    // number array
    const vrType = vrTypes[dicomElement.vr];
    const bitsPerElement = typeof vrType !== 'undefined'
      ? parseInt(vrType.replace(/\D/g, ''), 10) : NaN;
    if (!isNaN(bitsPerElement)) {
      length = value.length * bitsPerElement / 8;
    }
  }
  // values have an even length
  return length + (length % 2);
}

/**
 * Get the length (in bytes) of the content of a sequence item.
 *
 * @param {Record<string, DataElement>} item The sequence item.
 * @param {boolean} isImplicit Does the data use implicit VR?
 * @returns {number} The item content length.
 */
function getItemContentLength(item, isImplicit) {
  let length = 0;
  for (const key of Object.keys(item)) {
    const tag = getTagFromKey(key);
    if (!isItemTag(tag)) {
      const element = item[key];
      length += getDataElementPrefixByteSize(element.vr, isImplicit);
      length += getValueLength(tag, element, isImplicit);
    }
  }
  return length;
}

/**
 * Get the length (in bytes) of a sequence item, including its item
 * and item delimitation elements.
 *
 * @param {Record<string, DataElement>} item The sequence item.
 * @param {boolean} isImplicit Does the data use implicit VR?
 * @returns {number} The item length.
 */
function getItemLength(item, isImplicit) {
  const prefixLength = getDataElementPrefixByteSize('NONE', isImplicit);
  let length = prefixLength + getItemContentLength(item, isImplicit);
  if (item[getItemTag().getKey()]?.undefinedLength) {
    length += prefixLength;
  }
  return length;
}

/**
 * Get a dump line.
 *
 * @param {string} prefix A string to prepend to the line.
 * @param {Tag} tag The DICOM tag.
 * @param {string} vr The value representation.
 * @param {string} value The value string.
 * @param {string} length The value length string.
 * @param {number} multiplicity The value multiplicity.
 * @param {string} name The tag name.
 * @returns {string} The line.
 */
function getLine(prefix, tag, vr, value, length, multiplicity, name) {
  const group = tag.getGroup().toLowerCase();
  const element = tag.getElement().toLowerCase();
  const line = `(${group},${element}) ${vr} ${value}`;
  // align #
  return `${prefix}${line.padEnd(55)} # ${length.padStart(3)}, ` +
    `${multiplicity} ${name}`;
}

/**
 * Get a data element as a string.
 *
 * @param {Tag} tag The DICOM tag.
 * @param {DataElement} dicomElement The DICOM element.
 * @param {string} prefix A string to prepend this one.
 * @param {boolean} isImplicit Does the data use implicit VR?
 * @returns {string} The element as a string.
 */
function getElementAsString(tag, dicomElement, prefix, isImplicit) {
  // get tag name from dictionary
  const name = getDicomTagInfo(tag)?.getName() ?? 'Unknown Tag & Data';

  const vr = dicomElement.vr;
  const isOtherVR = isBinaryVR(vr);
  const isPixSequence = isAnyPixelDataTag(tag) &&
    dicomElement.undefinedLength;

  const length = dicomElement.undefinedLength
    ? 'u/l' : getValueLength(tag, dicomElement, isImplicit).toString();

  let multiplicity = dicomElement.value.length;
  let value;
  if (vr !== 'SQ' &&
    dicomElement.value.length === 1 &&
    dicomElement.value[0] === '') {
    value = '(no value available)';
    multiplicity = 0;
  } else if (isPixSequence) {
    value = `(PixelSequence #=${dicomElement.value.length})`;
    multiplicity = 1;
  } else if (vr === 'SQ') {
    const lengthType = dicomElement.undefinedLength ? 'undefined' : 'explicit';
    value = `(Sequence with ${lengthType} length` +
      ` #=${dicomElement.value.length})`;
    multiplicity = 1;
  } else if (isOtherVR ||
    vr === 'UL' ||
    vr === 'US' ||
    vr === 'SL' ||
    vr === 'SS' ||
    vr === 'FL' ||
    vr === 'FD' ||
    vr === 'AT') {
    // 'O'ther array, limited display length
    value = getElementValueAsString(tag, dicomElement, false);
    if (isOtherVR) {
      multiplicity = 1;
    }
  } else {
    // default
    value = `[${getElementValueAsString(tag, dicomElement, false)}]`;
  }

  const lines = [getLine(prefix, tag, vr, value, length, multiplicity, name)];

  if (vr === 'SQ') {
    // sequence items
    const itemTag = getItemTag();
    for (const item of dicomElement.value) {
      const itemKeys = Object.keys(item).sort();
      if (itemKeys.length === 0) {
        continue;
      }
      const elementKeys = itemKeys.filter(
        (key) => !isItemTag(getTagFromKey(key)));
      const isItemUndefinedLength =
        item[itemTag.getKey()]?.undefinedLength === true;

      const itemLengthType = isItemUndefinedLength ? 'undefined' : 'explicit';
      const itemLength = isItemUndefinedLength
        ? 'u/l' : getItemContentLength(item, isImplicit).toString();
      lines.push(getLine(`${prefix}  `, itemTag, 'na',
        `(Item with ${itemLengthType} length #=${elementKeys.length})`,
        itemLength, 1, 'Item'));

      for (const key of elementKeys) {
        lines.push(getElementAsString(
          getTagFromKey(key), item[key], `${prefix}    `, isImplicit));
      }

      const itemDelimSuffix = isItemUndefinedLength ? '' : ' for re-encoding';
      lines.push(getLine(`${prefix}  `, getItemDelimitationItemTag(),
        'na', `(ItemDelimitationItem${itemDelimSuffix})`,
        '0', 0, 'ItemDelimitationItem'));
    }

    const sqDelimSuffix = dicomElement.undefinedLength ? '' : ' for re-encod.';
    lines.push(getLine(prefix, getSequenceDelimitationItemTag(),
      'na', `(SequenceDelimitationItem${sqDelimSuffix})`,
      '0', 0, 'SequenceDelimitationItem'));
  } else if (isPixSequence) {
    // pixel sequence fragments
    const itemTag = getItemTag();
    for (const fragment of dicomElement.value) {
      const fragmentElement = new DataElement('OB');
      fragmentElement.value = fragment;
      lines.push(getLine(`${prefix}  `, itemTag, 'pi',
        getElementValueAsString(itemTag, fragmentElement, false),
        fragment.byteLength.toString(), 1, 'Item'));
    }

    lines.push(getLine(prefix, getSequenceDelimitationItemTag(),
      'na', '(SequenceDelimitationItem)',
      '0', 0, 'SequenceDelimitationItem'));
  }

  return lines.join('\n');
}
