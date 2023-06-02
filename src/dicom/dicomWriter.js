import {
  is32bitVLVR,
  isCharSetStringVR,
  vrTypes
} from './dictionary';
import {
  Tag,
  getTagFromDictionary,
  getTagFromKey,
  getItemTag,
  getItemDelimitationItemTag,
  getSequenceDelimitationItemTag,
  getFileMetaInformationGroupLengthTag,
  isPixelDataTag,
  isItemTag,
  tagCompareFunction
} from './dicomTag';
import {
  getDwvVersion,
  isImplicitTransferSyntax,
  isBigEndianTransferSyntax,
  getDataElementPrefixByteSize
} from './dicomParser';
import {DataWriter} from './dataWriter';
import {logger} from '../utils/logger';

/**
 * Get the dwv UID prefix.
 * Issued by Medical Connections Ltd (www.medicalconnections.co.uk)
 *   on 25/10/2017.
 *
 * @returns {string} The dwv UID prefix.
 */
function getDwvUIDPrefix() {
  return '1.2.826.0.1.3680043.9.7278.1';
}

// local generated uid counter
let _uidCount = 0;

/**
 * Get a UID for a DICOM tag.
 * Note: Use https://github.com/uuidjs/uuid?
 *
 * @see http://dicom.nema.org/dicom/2013/output/chtml/part05/chapter_9.html
 * @see http://dicomiseasy.blogspot.com/2011/12/chapter-4-dicom-objects-in-chapter-3.html
 * @see https://stackoverflow.com/questions/46304306/how-to-generate-unique-dicom-uid
 * @param {string} tagName The input tag.
 * @returns {string} The corresponding UID.
 */
export function getUID(tagName) {
  const prefix = getDwvUIDPrefix() + '.';
  let uid = '';
  if (tagName === 'ImplementationClassUID') {
    uid = prefix + getDwvVersion();
  } else {
    // date (only numbers), do not keep milliseconds
    const date = (new Date()).toISOString().replace(/\D/g, '');
    const datePart = '.' + date.substring(0, 14);
    // count
    _uidCount += 1;
    const countPart = '.' + _uidCount;

    // uid = prefix . tag . date . count
    uid = prefix;

    // limit tag part to not exceed 64 length
    const nonTagLength = prefix.length + countPart.length + datePart.length;
    const leni = Math.min(tagName.length, 64 - nonTagLength);
    if (leni > 1) {
      let tagNumber = '';
      for (let i = 0; i < leni; ++i) {
        tagNumber += tagName.charCodeAt(i);
      }
      uid += tagNumber.substring(0, leni);
    }

    // finish
    uid += datePart + countPart;
  }
  return uid;
}

/**
 * Return true if the input number is even.
 *
 * @param {number} number The number to check.
 * @returns {boolean} True is the number is even.
 */
function isEven(number) {
  return number % 2 === 0;
}

/**
 * Is the input VR a VR that stores data in a typed array.
 * TODO: include ox and xs?
 *
 * @param {string} vr The element VR.
 * @returns {boolean} True if the VR is a typed array one.
 */
function isTypedArrayVr(vr) {
  const vrType = vrTypes[vr];
  return typeof vrType !== 'undefined' &&
    vrType !== 'string';
}

/**
 * Is the input VR a string VR.
 *
 * @param {string} vr The element VR.
 * @returns {boolean} True if the VR is a string one.
 */
function isStringVr(vr) {
  const vrType = vrTypes[vr];
  return typeof vrType !== 'undefined' &&
    vrType === 'string';
}

/**
 * Is the input VR a VR that could need padding.
 * see http://dicom.nema.org/dicom/2013/output/chtml/part05/sect_6.2.html
 *
 * @param {string} vr The element VR.
 * @returns {boolean} True if the VR needs padding.
 */
function isVrToPad(vr) {
  return isStringVr(vr) || vr === 'OB';
}

/**
 * Get the VR specific padding value.
 *
 * @param {string} vr The element VR.
 * @returns {string} The value used to pad.
 */
function getVrPad(vr) {
  let pad = '';
  if (isStringVr(vr)) {
    if (vr === 'UI') {
      pad = '\0';
    } else {
      pad = ' ';
    }
  }
  return pad;
}

/**
 * Push a value at the end of an input Uint8Array.
 *
 * @param {Array|Uint8Array} arr The input array.
 * @param {Array|Uint8Array} value The value to push.
 * @returns {Uint8Array} The new array.
 */
function uint8ArrayPush(arr, value) {
  const newArr = new Uint8Array(arr.length + 1);
  newArr.set(arr);
  newArr.set(value, arr.length);
  return newArr;
}

/**
 * Pad an input OB value.
 *
 * @param {Array|Uint8Array} value The input value.
 * @returns {Array|Uint8Array} The padded input.
 */
function padOBValue(value) {
  if (value !== null &&
    typeof value !== 'undefined' &&
    typeof value.length !== 'undefined') {
    // calculate size and pad if needed
    if (value.length !== 0 &&
      typeof value[0].length !== 'undefined') {
      // handle array of array
      let size = 0;
      for (let i = 0; i < value.length; ++i) {
        size += value[i].length;
      }
      if (!isEven(size)) {
        value[value.length - 1] = uint8ArrayPush(
          value[value.length - 1], [0]);
      }
    } else {
      if (!isEven(value.length)) {
        value = uint8ArrayPush(value, [0]);
      }
    }
  } else {
    throw new Error('Cannot pad undefined or null OB value.');
  }
  // uint8ArrayPush may create a new array so we
  // need to return it
  return value;
}

/**
 * Helper method to flatten an array of typed arrays to 2D typed array
 *
 * @param {Array} initialArray array of typed arrays
 * @returns {object} a typed array containing all values
 */
function flattenArrayOfTypedArrays(initialArray) {
  const initialArrayLength = initialArray.length;
  const arrayLength = initialArray[0].length;
  // If this is not a array of arrays, just return the initial one:
  if (typeof arrayLength === 'undefined') {
    return initialArray;
  }

  const flattenendArrayLength = initialArrayLength * arrayLength;

  const flattenedArray = new initialArray[0].constructor(flattenendArrayLength);

  for (let i = 0; i < initialArrayLength; i++) {
    const indexFlattenedArray = i * arrayLength;
    flattenedArray.set(initialArray[i], indexFlattenedArray);
  }
  return flattenedArray;
}

/**
 * Default text encoder.
 */
class DefaultTextEncoder {
  /**
   * Encode an input string.
   *
   * @param {string} str The string to encode.
   * @returns {Uint8Array} The encoded string.
   */
  encode(str) {
    const result = new Uint8Array(str.length);
    for (let i = 0, leni = str.length; i < leni; ++i) {
      result[i] = str.charCodeAt(i);
    }
    return result;
  }
}

/**
 * DICOM writer.
 *
 * Example usage:
 *   const parser = new DicomParser();
 *   parser.parse(this.response);
 *
 *   const writer = new DicomWriter(parser.getDicomElements());
 *   const blob = new Blob([writer.getBuffer()], {type: 'application/dicom'});
 *
 *   const element = document.getElementById("download");
 *   element.href = URL.createObjectURL(blob);
 *   element.download = "anonym.dcm";
 */
export class DicomWriter {

  // flag to use VR=UN for private sequences, default to false
  // (mainly used in tests)
  #useUnVrForPrivateSq = false;

  /**
   * Set the use UN VR for private sequence flag.
   *
   * @param {boolean} flag True to use UN VR.
   */
  setUseUnVrForPrivateSq(flag) {
    this.#useUnVrForPrivateSq = flag;
  }

  // possible tag actions
  #actions = {
    copy: function (item) {
      return item;
    },
    remove: function () {
      return null;
    },
    clear: function (item) {
      item.value = [];
      return item;
    },
    replace: function (item, value) {
      item.value = [value];
      return item;
    }
  };

  // default rules: just copy
  #defaultRules = {
    default: {action: 'copy', value: null}
  };

  /**
   * Writing rules.
   * Set of objects as:
   *   name : { action: 'actionName', value: 'optionalValue }
   * The names are either 'default', tagName or groupName.
   * Each DICOM element will be checked to see if a rule is applicable.
   * First checked by tagName and then by groupName,
   * if nothing is found the default rule is applied.
   */
  #rules = this.#defaultRules;

  /**
   * Set the writing rules.
   *
   * @param {object} rules The input rules.
   */
  setRules(rules) {
    this.#rules = rules;
  }

  /**
   * Default text encoder.
   *
   * @type {DefaultTextEncoder}
   */
  #defaultTextEncoder = new DefaultTextEncoder();

  /**
   * Special text encoder.
   *
   * @type {DefaultTextEncoder|TextEncoder}
   */
  #textEncoder = this.#defaultTextEncoder;

  /**
   * Encode string data.
   *
   * @param {string} str The string to encode.
   * @returns {Uint8Array} The encoded string.
   */
  #encodeString(str) {
    return this.#defaultTextEncoder.encode(str);
  }

  /**
   * Encode data as a UTF-8.
   *
   * @param {string} str The string to write.
   * @returns {Uint8Array} The encoded string.
   */
  #encodeSpecialString(str) {
    return this.#textEncoder.encode(str);
  }

  /**
   * Use a TextEncoder instead of the default text decoder.
   */
  useSpecialTextEncoder() {
    /**
     * The text encoder.
     *
     * @external TextEncoder
     * @see https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
     */
    this.#textEncoder = new TextEncoder();
  }

  /**
   * Use default anonymisation rules.
   */
  useDefaultAnonymisationRules() {
    this.setRules({
      default: {action: 'remove', value: null},
      PatientName: {action: 'replace', value: 'Anonymized'}, // tag
      'Meta Element': {action: 'copy', value: null}, // group '0002'
      Acquisition: {action: 'copy', value: null}, // group '0018'
      'Image Presentation': {action: 'copy', value: null}, // group '0028'
      Procedure: {action: 'copy', value: null}, // group '0040'
      'Pixel Data': {action: 'copy', value: null} // group '7fe0'
    });
  }

  /**
   * Get the element to write according to the class rules.
   * Priority order: tagName, groupName, default.
   *
   * @param {object} element The element to check
   * @returns {object} The element to write, can be null.
   */
  #getElementToWrite(element) {
    // get group and tag string name
    const groupName = element.tag.getGroupName();
    const tagName = element.tag.getNameFromDictionary();

    // apply rules:
    let rule;
    if (typeof this.#rules[element.tag.getKey()] !== 'undefined') {
      // 1. tag itself
      rule = this.#rules[element.tag.getKey()];
    } else if (typeof tagName !== 'undefined' &&
      typeof this.#rules[tagName] !== 'undefined') {
      // 2. tag name
      rule = this.#rules[tagName];
    } else if (typeof this.#rules[groupName] !== 'undefined') {
      // 3. group name
      rule = this.#rules[groupName];
    } else {
      // 4. default
      rule = this.#rules['default'];
    }
    // apply action on element and return
    return this.#actions[rule.action](element, rule.value);
  }

  /**
   * Write a list of items.
   *
   * @param {DataWriter} writer The raw data writer.
   * @param {number} byteOffset The offset to start writing from.
   * @param {Array} items The list of items to write.
   * @param {boolean} isImplicit Is the DICOM VR implicit?
   * @returns {number} The new offset position.
   */
  #writeDataElementItems(
    writer, byteOffset, items, isImplicit) {
    let item = null;
    for (let i = 0; i < items.length; ++i) {
      item = items[i];
      const itemKeys = Object.keys(item);
      if (itemKeys.length === 0) {
        continue;
      }
      // item element (create new to not modify original)
      let undefinedLength = false;
      if (typeof item['FFFEE000'].undefinedLength !== 'undefined') {
        undefinedLength = item['FFFEE000'].undefinedLength;
      }
      const itemElement = {
        tag: getItemTag(),
        vr: 'NONE',
        vl: undefinedLength ? 0xffffffff : item['FFFEE000'].vl,
        value: []
      };
      byteOffset = this.#writeDataElement(
        writer, itemElement, byteOffset, isImplicit);
      // write rest
      for (let m = 0; m < itemKeys.length; ++m) {
        if (itemKeys[m] !== 'FFFEE000' && itemKeys[m] !== 'FFFEE00D') {
          byteOffset = this.#writeDataElement(
            writer, item[itemKeys[m]], byteOffset, isImplicit);
        }
      }
      // item delimitation
      if (undefinedLength) {
        const itemDelimElement = {
          tag: getItemDelimitationItemTag(),
          vr: 'NONE',
          vl: 0,
          value: []
        };
        byteOffset = this.#writeDataElement(
          writer, itemDelimElement, byteOffset, isImplicit);
      }
    }

    // return new offset
    return byteOffset;
  }

  /**
   * Write data with a specific Value Representation (VR).
   *
   * @param {DataWriter} writer The raw data writer.
   * @param {object} element The element to write.
   * @param {number} byteOffset The offset to start writing from.
   * @param {Array} value The array to write.
   * @param {boolean} isImplicit Is the DICOM VR implicit?
   * @returns {number} The new offset position.
   */
  #writeDataElementValue(
    writer, element, byteOffset, value, isImplicit) {

    const startOffset = byteOffset;

    if (element.vr === 'NONE') {
      // nothing to do!
    } else if (value instanceof Uint8Array) {
      // binary data has been expanded 8 times at read
      if (value.length === 8 * element.vl) {
        byteOffset = writer.writeBinaryArray(byteOffset, value);
      } else {
        byteOffset = writer.writeUint8Array(byteOffset, value);
      }
    } else if (value instanceof Int8Array) {
      byteOffset = writer.writeInt8Array(byteOffset, value);
    } else if (value instanceof Uint16Array) {
      byteOffset = writer.writeUint16Array(byteOffset, value);
    } else if (value instanceof Int16Array) {
      byteOffset = writer.writeInt16Array(byteOffset, value);
    } else if (value instanceof Uint32Array) {
      byteOffset = writer.writeUint32Array(byteOffset, value);
    } else if (value instanceof Int32Array) {
      byteOffset = writer.writeInt32Array(byteOffset, value);
    } else if (value instanceof BigUint64Array) {
      byteOffset = writer.writeUint64Array(byteOffset, value);
    } else if (value instanceof BigInt64Array) {
      byteOffset = writer.writeInt64Array(byteOffset, value);
    } else {
      // switch according to VR if input type is undefined
      const vrType = vrTypes[element.vr];
      if (typeof vrType !== 'undefined') {
        if (vrType === 'Uint8') {
          byteOffset = writer.writeUint8Array(byteOffset, value);
        } else if (vrType === 'Uint16') {
          byteOffset = writer.writeUint16Array(byteOffset, value);
        } else if (vrType === 'Int16') {
          byteOffset = writer.writeInt16Array(byteOffset, value);
        } else if (vrType === 'Uint32') {
          byteOffset = writer.writeUint32Array(byteOffset, value);
        } else if (vrType === 'Int32') {
          byteOffset = writer.writeInt32Array(byteOffset, value);
        } else if (vrType === 'Uint64') {
          byteOffset = writer.writeUint64Array(byteOffset, value);
        } else if (vrType === 'Int64') {
          byteOffset = writer.writeInt64Array(byteOffset, value);
        } else if (vrType === 'Float32') {
          byteOffset = writer.writeFloat32Array(byteOffset, value);
        } else if (vrType === 'Float64') {
          byteOffset = writer.writeFloat64Array(byteOffset, value);
        } else if (vrType === 'string') {
          byteOffset = writer.writeUint8Array(byteOffset, value);
        } else {
          throw Error('Unknown VR type: ' + vrType);
        }
      } else if (element.vr === 'SQ') {
        byteOffset = this.#writeDataElementItems(
          writer, byteOffset, value, isImplicit);
      } else if (element.vr === 'AT') {
        for (let i = 0; i < value.length; ++i) {
          const hexString = value[i] + '';
          const hexString1 = hexString.substring(1, 5);
          const hexString2 = hexString.substring(6, 10);
          const dec1 = parseInt(hexString1, 16);
          const dec2 = parseInt(hexString2, 16);
          const atValue = [dec1, dec2];
          byteOffset = writer.writeUint16Array(byteOffset, atValue);
        }
      } else {
        logger.warn('Unknown VR: ' + element.vr);
      }
    }

    if (element.vr !== 'SQ' && element.vr !== 'NONE') {
      const diff = byteOffset - startOffset;
      if (diff !== element.vl) {
        logger.warn('Offset difference and VL are not equal: ' +
          diff + ' != ' + element.vl + ', vr:' + element.vr);
      }
    }

    // return new offset
    return byteOffset;
  }

  /**
   * Write a pixel data element.
   *
   * @param {DataWriter} writer The raw data writer.
   * @param {object} element The element to write.
   * @param {number} byteOffset The offset to start writing from.
   * @param {Array} value The array to write.
   * @param {boolean} isImplicit Is the DICOM VR implicit?
   * @returns {number} The new offset position.
   */
  #writePixelDataElementValue(
    writer, element, byteOffset, value, isImplicit) {
    // undefined length flag
    let undefinedLength = false;
    if (typeof element.undefinedLength !== 'undefined') {
      undefinedLength = element.undefinedLength;
    }
    // explicit length
    if (!undefinedLength) {
      let finalValue = value[0];
      // flatten multi frame
      if (value.length > 1) {
        finalValue = flattenArrayOfTypedArrays(value);
      }
      // write
      byteOffset = this.#writeDataElementValue(
        writer, element, byteOffset, finalValue, isImplicit);
    } else {
      // pixel data as sequence
      const item = {};
      // first item: basic offset table
      item['FFFEE000'] = {
        tag: getItemTag(),
        vr: 'NONE',
        vl: 0,
        value: []
      };
      // data
      for (let i = 0; i < value.length; ++i) {
        item[i] = {
          tag: getItemTag(),
          vr: element.vr,
          vl: value[i].length,
          value: value[i]
        };
      }
      // write
      byteOffset = this.#writeDataElementItems(
        writer, byteOffset, [item], isImplicit);
    }

    // return new offset
    return byteOffset;
  }

  /**
   * Write a data element.
   *
   * @param {DataWriter} writer The raw data writer.
   * @param {object} element The DICOM data element to write.
   * @param {number} byteOffset The offset to start writing from.
   * @param {boolean} isImplicit Is the DICOM VR implicit?
   * @returns {number} The new offset position.
   */
  #writeDataElement(
    writer, element, byteOffset, isImplicit) {
    const isTagWithVR = element.tag.isWithVR();
    const is32bitVL = (isImplicit || !isTagWithVR)
      ? true : is32bitVLVR(element.vr);
    // group
    byteOffset = writer.writeHex(byteOffset, element.tag.getGroup());
    // element
    byteOffset = writer.writeHex(byteOffset, element.tag.getElement());
    // VR
    let vr = element.vr;
    // use VR=UN for private sequence
    if (this.#useUnVrForPrivateSq &&
      element.tag.isPrivate() &&
      vr === 'SQ') {
      logger.warn('Write element using VR=UN for private sequence.');
      vr = 'UN';
    }
    if (isTagWithVR && !isImplicit) {
      byteOffset = writer.writeUint8Array(byteOffset, this.#encodeString(vr));
      // reserved 2 bytes for 32bit VL
      if (is32bitVL) {
        byteOffset += 2;
      }
    }

    let undefinedLengthSequence = false;
    if (element.vr === 'SQ' ||
      isPixelDataTag(element.tag)) {
      if (typeof element.undefinedLength !== 'undefined') {
        undefinedLengthSequence = element.undefinedLength;
      }
    }
    let undefinedLengthItem = false;
    if (isItemTag(element.tag)) {
      if (typeof element.undefinedLength !== 'undefined') {
        undefinedLengthItem = element.undefinedLength;
      }
    }

    // update vl for sequence or item with undefined length
    let vl = element.vl;
    if (undefinedLengthSequence || undefinedLengthItem) {
      vl = 0xffffffff;
    }
    // VL
    if (is32bitVL) {
      byteOffset = writer.writeUint32(byteOffset, vl);
    } else {
      byteOffset = writer.writeUint16(byteOffset, vl);
    }

    // value
    let value = element.value;
    // check value
    if (typeof value === 'undefined') {
      value = [];
    }
    // write
    if (isPixelDataTag(element.tag)) {
      byteOffset = this.#writePixelDataElementValue(
        writer, element, byteOffset, value, isImplicit);
    } else {
      byteOffset = this.#writeDataElementValue(
        writer, element, byteOffset, value, isImplicit);
    }

    // sequence delimitation item for sequence with undefined length
    if (undefinedLengthSequence) {
      const seqDelimElement = {
        tag: getSequenceDelimitationItemTag(),
        vr: 'NONE',
        vl: 0,
        value: []
      };
      byteOffset = this.#writeDataElement(
        writer, seqDelimElement, byteOffset, isImplicit);
    }

    // return new offset
    return byteOffset;
  }

  /**
   * Get the ArrayBuffer corresponding to input DICOM elements.
   *
   * @param {Array} dicomElements The wrapped elements to write.
   * @returns {ArrayBuffer} The elements as a buffer.
   */
  getBuffer(dicomElements) {
    // Transfer Syntax
    const syntax = dicomElements['00020010'].value[0];
    const isImplicit = isImplicitTransferSyntax(syntax);
    const isBigEndian = isBigEndianTransferSyntax(syntax);
    // Specific CharacterSet
    if (typeof dicomElements['00080005'] !== 'undefined') {
      const oldscs = dicomElements['00080005'].value[0];
      // force UTF-8 if not default character set
      if (typeof oldscs !== 'undefined' && oldscs !== 'ISO-IR 6') {
        logger.debug('Change charset to UTF, was: ' + oldscs);
        this.useSpecialTextEncoder();
        dicomElements['00080005'].value = ['ISO_IR 192'];
      }
    }
    // Bits Allocated (for image data)
    let bitsAllocated;
    if (typeof dicomElements['00280100'] !== 'undefined') {
      bitsAllocated = dicomElements['00280100'].value[0];
    }

    // calculate buffer size and split elements (meta and non meta)
    let totalSize = 128 + 4; // DICM
    let localSize = 0;
    const metaElements = [];
    const rawElements = [];
    let element;
    let groupName;
    let metaLength = 0;
    // FileMetaInformationGroupLength
    const fmiglTag = getFileMetaInformationGroupLengthTag();
    // FileMetaInformationVersion
    const fmivTag = new Tag('0002', '0001');
    // ImplementationClassUID
    const icUIDTag = new Tag('0002', '0012');
    // ImplementationVersionName
    const ivnTag = new Tag('0002', '0013');

    // loop through elements to get the buffer size
    const keys = Object.keys(dicomElements);
    for (let i = 0, leni = keys.length; i < leni; ++i) {
      const originalElement = dicomElements[keys[i]];
      originalElement.tag = getTagFromKey(keys[i]);
      element = this.#getElementToWrite(originalElement);
      if (element !== null &&
        !fmiglTag.equals(element.tag) &&
        !fmivTag.equals(element.tag) &&
        !icUIDTag.equals(element.tag) &&
        !ivnTag.equals(element.tag)) {
        localSize = 0;

        // XB7 2020-04-17
        // Check if UN can be converted to correct VR.
        // This check must be done BEFORE calculating totalSize,
        // otherwise there may be extra null bytes at the end of the file
        // (dcmdump may crash because of these bytes)
        checkUnknownVR(element);

        // update value and vl
        this.#setElementValue(
          element, element.value, isImplicit, bitsAllocated);

        // tag group name
        groupName = element.tag.getGroupName();

        // prefix
        if (groupName === 'Meta Element') {
          localSize += getDataElementPrefixByteSize(element.vr, false);
        } else {
          localSize += getDataElementPrefixByteSize(
            element.vr, isImplicit);
        }

        // value
        localSize += element.vl;

        // sort elements
        if (groupName === 'Meta Element') {
          metaElements.push(element);
          metaLength += localSize;
        } else {
          rawElements.push(element);
        }

        // add to total size
        totalSize += localSize;
      }
    }

    // FileMetaInformationVersion
    const fmiv = getDicomElement('FileMetaInformationVersion');
    let fmivSize = getDataElementPrefixByteSize(fmiv.vr, false);
    fmivSize += this.#setElementValue(fmiv, [0, 1], false);
    metaElements.push(fmiv);
    metaLength += fmivSize;
    totalSize += fmivSize;
    // ImplementationClassUID
    const icUID = getDicomElement('ImplementationClassUID');
    let icUIDSize = getDataElementPrefixByteSize(icUID.vr, false);
    icUIDSize += this.#setElementValue(
      icUID, [getUID('ImplementationClassUID')], false);
    metaElements.push(icUID);
    metaLength += icUIDSize;
    totalSize += icUIDSize;
    // ImplementationVersionName
    const ivn = getDicomElement('ImplementationVersionName');
    let ivnSize = getDataElementPrefixByteSize(ivn.vr, false);
    const ivnValue = 'DWV_' + getDwvVersion();
    ivnSize += this.#setElementValue(ivn, [ivnValue], false);
    metaElements.push(ivn);
    metaLength += ivnSize;
    totalSize += ivnSize;

    // sort elements
    const elemSortFunc = function (a, b) {
      return tagCompareFunction(a.tag, b.tag);
    };
    metaElements.sort(elemSortFunc);
    rawElements.sort(elemSortFunc);

    // create the FileMetaInformationGroupLength element
    const fmigl = getDicomElement('FileMetaInformationGroupLength');
    let fmiglSize = getDataElementPrefixByteSize(fmigl.vr, false);
    fmiglSize += this.#setElementValue(
      fmigl, new Uint32Array([metaLength]), false);
    totalSize += fmiglSize;

    // create buffer
    const buffer = new ArrayBuffer(totalSize);
    const metaWriter = new DataWriter(buffer);
    const dataWriter = new DataWriter(buffer, !isBigEndian);

    let offset = 128;
    // DICM
    offset = metaWriter.writeUint8Array(offset, this.#encodeString('DICM'));
    // FileMetaInformationGroupLength
    offset = this.#writeDataElement(metaWriter, fmigl, offset, false);
    // write meta
    for (let j = 0, lenj = metaElements.length; j < lenj; ++j) {
      offset = this.#writeDataElement(
        metaWriter, metaElements[j], offset, false);
    }

    // check meta position
    const preambleSize = 128 + 4;
    const metaOffset = preambleSize + fmiglSize + metaLength;
    if (offset !== metaOffset) {
      logger.warn('Bad size calculation... meta offset: ' + offset +
        ', calculated size:' + metaOffset +
        ' (diff:' + (offset - metaOffset) + ')');
    }

    // write non meta
    for (let k = 0, lenk = rawElements.length; k < lenk; ++k) {
      offset = this.#writeDataElement(
        dataWriter, rawElements[k], offset, isImplicit);
    }

    // check final position
    if (offset !== totalSize) {
      logger.warn('Bad size calculation... final offset: ' + offset +
        ', calculated size:' + totalSize +
        ' (diff:' + (offset - totalSize) + ')');
    }
    // return
    return buffer;
  }

  /**
   * Set a DICOM element value according to its VR (Value Representation).
   *
   * @param {object} element The DICOM element to set the value.
   * @param {object} value The value to set.
   * @param {boolean} isImplicit Does the data use implicit VR?
   * @param {number} [bitsAllocated] Bits allocated used for pixel data.
   * @returns {number} The total element size.
   */
  #setElementValue(
    element, value, isImplicit, bitsAllocated) {
    // byte size of the element
    let size = 0;
    // special sequence case
    if (element.vr === 'SQ') {

      if (value !== null && value !== 0) {
        const newItems = [];
        let name;

        // explicit or undefined length sequence
        let undefinedLength = false;
        if (typeof element.undefinedLength !== 'undefined') {
          undefinedLength = element.undefinedLength;
          delete element.undefinedLength;
        }

        // items
        for (let i = 0; i < value.length; ++i) {
          const oldItemElements = value[i];
          const newItemElements = {};
          let subSize = 0;

          // check data
          if (oldItemElements === null || oldItemElements === 0) {
            continue;
          }

          // elements
          const itemKeys = Object.keys(oldItemElements);
          for (let j = 0, lenj = itemKeys.length; j < lenj; ++j) {
            const itemKey = itemKeys[j];
            const subElement = oldItemElements[itemKey];
            subElement.tag = getTagFromKey(itemKey);

            if (isItemTag(subElement.tag)) {
              continue;
            }
            // set item value
            subSize += this.#setElementValue(
              subElement, subElement.value, isImplicit, bitsAllocated);
            newItemElements[itemKey] = subElement;
            // add prefix size
            subSize += getDataElementPrefixByteSize(
              subElement.vr, isImplicit);
          }

          // add item element (used to store its size)
          const itemElement = {
            tag: getItemTag(),
            vr: 'NONE',
            vl: subSize,
            value: []
          };
          if (undefinedLength) {
            itemElement.undefinedLength = undefinedLength;
          }
          name = itemElement.tag.getKey();
          newItemElements[name] = itemElement;
          subSize += getDataElementPrefixByteSize(
            itemElement.vr, isImplicit);

          // add item delimitation size
          if (undefinedLength) {
            subSize += getDataElementPrefixByteSize(
              'NONE', isImplicit);
          }

          size += subSize;
          newItems.push(newItemElements);
        }

        // add sequence delimitation size
        if (undefinedLength) {
          size += getDataElementPrefixByteSize('NONE', isImplicit);
        }

        // update sequence element
        element.value = newItems;
        element.vl = size;
        if (undefinedLength) {
          element.undefinedLength = undefinedLength;
        }
      }
    } else {
      // pad if necessary
      if (isVrToPad(element.vr)) {
        const padStr = getVrPad(element.vr);
        // encode string
        // TODO: not sure for UN...
        if (isStringVr(element.vr)) {
          let pad;
          if (isCharSetStringVR(element.vr)) {
            value = this.#encodeSpecialString(value.join('\\'));
            pad = this.#encodeSpecialString(padStr);
          } else {
            value = this.#encodeString(value.join('\\'));
            pad = this.#encodeString(padStr);
          }
          if (!isEven(value.length)) {
            value = uint8ArrayPush(value, pad);
          }
        } else if (element.vr === 'OB') {
          value = padOBValue(value);
        }
      }

      // calculate byte size
      size = 0;
      if (element.vr === 'AT') {
        size = 4 * value.length;
      } else if (element.vr === 'xs') {
        size = value.length * Uint16Array.BYTES_PER_ELEMENT;
      } else if (isTypedArrayVr(element.vr) || element.vr === 'ox') {
        if (isPixelDataTag(element.tag) &&
          Array.isArray(value)) {
          size = 0;
          for (let b = 0; b < value.length; ++b) {
            size += value[b].length;
          }
        } else {
          size = value.length;
        }

        // convert size to bytes
        const vrType = vrTypes[element.vr];
        if (isPixelDataTag(element.tag) || element.vr === 'ox') {
          if (element.undefinedLength) {
            const itemPrefixSize =
              getDataElementPrefixByteSize('NONE', isImplicit);
            // offset table
            size += itemPrefixSize;
            // pixel items
            size += itemPrefixSize * value.length;
            // add sequence delimitation size
            size += itemPrefixSize;
          } else {
            // use bitsAllocated for pixel data
            // no need to multiply for 8 bits
            if (typeof bitsAllocated !== 'undefined') {
              if (bitsAllocated === 1) {
                // binary data
                size /= 8;
              } else if (bitsAllocated === 16) {
                size *= Uint16Array.BYTES_PER_ELEMENT;
              }
            }
          }
        } else if (typeof vrType !== 'undefined') {
          const bpe = getBpeForVrType(vrType);
          if (typeof bpe !== 'undefined') {
            size *= bpe;
          } else {
            throw Error('Unknown bytes per element for VR type: ' + vrType);
          }
        } else {
          throw Error('Unsupported element: ' + element.vr);
        }
      } else {
        size = value.length;
      }

      element.value = value;
      element.vl = size;
    }

    // return the size of that data
    return size;
  }

} // class DicomWriter

/**
 * Fix for broken DICOM elements: Replace "UN" with correct VR if the
 * element exists in dictionary
 *
 * @param {object} element The DICOM element.
 */
function checkUnknownVR(element) {
  if (element.vr === 'UN') {
    const dictVr = element.tag.getVrFromDictionary();
    if (typeof dictVr !== 'undefined' && element.vr !== dictVr) {
      element.vr = dictVr;
      logger.info('Element ' + element.tag.getGroup() +
        ' ' + element.tag.getElement() +
        ' VR changed from UN to ' + element.vr);
    }
  }
}

/**
 * Get a DICOM element from its tag name (value set separatly).
 *
 * @param {string} tagName The string tag name.
 * @returns {object} The DICOM element.
 */
function getDicomElement(tagName) {
  const tag = getTagFromDictionary(tagName);
  return {
    tag: tag,
    vr: tag.getVrFromDictionary()
  };
}

/**
 * Get the number of bytes per element for a given VR type.
 *
 * @param {string} vrType The VR type as defined in the dictionary.
 * @returns {number} The bytes per element.
 */
function getBpeForVrType(vrType) {
  let bpe;
  if (vrType === 'Uint8') {
    bpe = Uint8Array.BYTES_PER_ELEMENT;
  } else if (vrType === 'Uint16') {
    bpe = Uint16Array.BYTES_PER_ELEMENT;
  } else if (vrType === 'Int16') {
    bpe = Int16Array.BYTES_PER_ELEMENT;
  } else if (vrType === 'Uint32') {
    bpe = Uint32Array.BYTES_PER_ELEMENT;
  } else if (vrType === 'Int32') {
    bpe = Int32Array.BYTES_PER_ELEMENT;
  } else if (vrType === 'Float32') {
    bpe = Float32Array.BYTES_PER_ELEMENT;
  } else if (vrType === 'Float64') {
    bpe = Float64Array.BYTES_PER_ELEMENT;
  } else if (vrType === 'Uint64') {
    bpe = BigUint64Array.BYTES_PER_ELEMENT;
  } else if (vrType === 'Int64') {
    bpe = BigInt64Array.BYTES_PER_ELEMENT;
  }
  return bpe;
}

/**
 * Get the DICOM elements from a DICOM json tags object.
 * The json is a simplified version of the oficial DICOM json with
 * tag names instead of keys and direct values (no value property) for
 * simple tags.
 *
 * @param {object} jsonTags The DICOM json tags object.
 * @returns {object} The DICOM elements.
 */
export function getElementsFromJSONTags(jsonTags) {
  const keys = Object.keys(jsonTags);
  const dicomElements = {};
  for (let k = 0, len = keys.length; k < len; ++k) {
    // get the DICOM element definition from its name
    const tag = getTagFromDictionary(keys[k]);
    if (!tag) {
      continue;
    }
    const vr = tag.getVrFromDictionary();
    // tag value
    let value;
    let undefinedLength = false;
    const jsonTag = jsonTags[keys[k]];
    if (vr === 'SQ') {
      const items = [];
      if (typeof jsonTag.undefinedLength !== 'undefined') {
        undefinedLength = jsonTag.undefinedLength;
      }
      if (typeof jsonTag.value !== 'undefined' &&
        jsonTag.value !== null) {
        for (let i = 0; i < jsonTag.value.length; ++i) {
          items.push(getElementsFromJSONTags(jsonTag.value[i]));
        }
      } else {
        logger.trace('Undefined or null jsonTag SQ value.');
      }
      value = items;
    } else {
      if (Array.isArray(jsonTag)) {
        value = jsonTag;
      } else {
        value = [jsonTag];
      }
    }
    // create element
    const dicomElement = {
      tag: tag,
      vr: vr,
      value: value
    };
    if (undefinedLength) {
      dicomElement.undefinedLength = undefinedLength;
    }
    // store
    dicomElements[tag.getKey()] = dicomElement;
  }
  // return
  return dicomElements;
}
