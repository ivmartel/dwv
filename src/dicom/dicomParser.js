import {
  Tag,
  getTransferSyntaxUIDTag,
  isSequenceDelimitationItemTag,
  isItemDelimitationItemTag,
  isPixelDataTag
} from './dicomTag';
import {
  is32bitVLVR,
  isCharSetStringVR,
  transferSyntaxes,
  transferSyntaxKeywords,
  vrTypes,
} from './dictionary';
import {DataReader} from './dataReader';
import {logger} from '../utils/logger';
import {
  getOrientationFromCosines,
  getOrientationStringLPS,
  getLPSGroup
} from '../math/orientation';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from '../dicom/dataElement';
/* eslint-enable no-unused-vars */

/**
 * List of DICOM data elements indexed via a 8 character string formed from
 * the group and element numbers.
 *
 * @typedef {Object<string, DataElement>} DataElements
 */

/**
 * Get the version of the library.
 *
 * @returns {string} The version of the library.
 */
export function getDwvVersion() {
  return '0.33.1';
}

/**
 * Check that an input buffer includes the DICOM prefix 'DICM'
 *   after the 128 bytes preamble.
 *
 * Ref: [DICOM File Meta]{@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part10/chapter_7.html#sect_7.1}.
 *
 * @param {ArrayBuffer} buffer The buffer to check.
 * @returns {boolean} True if the buffer includes the prefix.
 */
export function hasDicomPrefix(buffer) {
  // check size: typed array constructor will throw RangeError if
  // byteOffset + length * TypedArray.BYTES_PER_ELEMENT > buffer.byteLength
  if (buffer.byteLength < 132) {
    return false;
  }
  const prefixArray = new Uint8Array(buffer, 128, 4);
  const stringReducer = function (previous, current) {
    return previous += String.fromCharCode(current);
  };
  return prefixArray.reduce(stringReducer, '') === 'DICM';
}

// Zero-width space (u200B)
// @ts-ignore
const ZWS = String.fromCharCode('u200B');

/**
 * Clean string: remove zero-width space ending and trim.
 * Warning: no tests are done on the input, will fail if
 *   null or undefined or not string.
 * Exported for tests only.
 *
 * @param {string} inputStr The string to clean.
 * @returns {string} The cleaned string.
 */
export function cleanString(inputStr) {
  let res = inputStr;
  // get rid of ending zero-width space
  const lastIndex = inputStr.length - 1;
  if (inputStr[lastIndex] === ZWS) {
    res = inputStr.substring(0, lastIndex);
  }
  // trim spaces
  res = res.trim();
  // return
  return res;
}

/**
 * Get the utfLabel (used by the TextDecoder) from a character set term.
 *
 * References:
 * - DICOM [Value Encoding]{@link http://dicom.nema.org/medical/dicom/2022a/output/chtml/part05/chapter_6.html},
 * - DICOM [Specific Character Set]{@link http://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.12.html#sect_C.12.1.1.2},
 * - [TextDecoder#Parameters]{@link https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder/TextDecoder#Parameters}.
 *
 * @param {string} charSetTerm The DICOM character set.
 * @returns {string} The corresponding UTF label.
 */
function getUtfLabel(charSetTerm) {
  let label = 'utf-8';
  if (charSetTerm === 'ISO_IR 100') {
    label = 'iso-8859-1';
  } else if (charSetTerm === 'ISO_IR 101') {
    label = 'iso-8859-2';
  } else if (charSetTerm === 'ISO_IR 109') {
    label = 'iso-8859-3';
  } else if (charSetTerm === 'ISO_IR 110') {
    label = 'iso-8859-4';
  } else if (charSetTerm === 'ISO_IR 144') {
    label = 'iso-8859-5';
  } else if (charSetTerm === 'ISO_IR 127') {
    label = 'iso-8859-6';
  } else if (charSetTerm === 'ISO_IR 126') {
    label = 'iso-8859-7';
  } else if (charSetTerm === 'ISO_IR 138') {
    label = 'iso-8859-8';
  } else if (charSetTerm === 'ISO_IR 148') {
    label = 'iso-8859-9';
  } else if (charSetTerm === 'ISO_IR 13') {
    label = 'shift-jis';
  } else if (charSetTerm === 'ISO_IR 166') {
    label = 'iso-8859-11';
  } else if (charSetTerm === 'ISO 2022 IR 87') {
    label = 'iso-2022-jp';
  } else if (charSetTerm === 'ISO 2022 IR 149') {
    // not supported by TextDecoder when it says it should...
    //label = "iso-2022-kr";
  } else if (charSetTerm === 'ISO 2022 IR 58') {
    // not supported by TextDecoder...
    //label = "iso-2022-cn";
  } else if (charSetTerm === 'ISO_IR 192') {
    label = 'utf-8';
  } else if (charSetTerm === 'GB18030') {
    label = 'gb18030';
  } else if (charSetTerm === 'GB2312') {
    label = 'gb2312';
  } else if (charSetTerm === 'GBK') {
    label = 'chinese';
  }
  return label;
}

/**
 * Default text decoder.
 */
class DefaultTextDecoder {
  /**
   * Decode an input string buffer.
   *
   * @param {Uint8Array} buffer The buffer to decode.
   * @returns {string} The decoded string.
   */
  decode(buffer) {
    let result = '';
    for (let i = 0, leni = buffer.length; i < leni; ++i) {
      result += String.fromCharCode(buffer[i]);
    }
    return result;
  }
}

/**
 * Get patient orientation label in the reverse direction.
 *
 * @param {string} ori Patient Orientation value.
 * @returns {string} Reverse Orientation Label.
 */
export function getReverseOrientation(ori) {
  if (!ori) {
    return null;
  }
  // reverse labels
  const rlabels = {
    L: 'R',
    R: 'L',
    A: 'P',
    P: 'A',
    H: 'F',
    F: 'H'
  };

  let rori = '';
  for (let n = 0; n < ori.length; n++) {
    const o = ori.substring(n, n + 1);
    const r = rlabels[o];
    if (r) {
      rori += r;
    }
  }
  // return
  return rori;
}

/**
 * Get the name of an image orientation patient.
 *
 * @param {number[]} orientation The image orientation patient.
 * @returns {string|undefined} The orientation
 *   name: axial, coronal or sagittal.
 */
export function getOrientationName(orientation) {
  let name;
  const orientMatrix = getOrientationFromCosines(orientation);
  if (typeof orientMatrix !== 'undefined') {
    const lpsStr = getOrientationStringLPS(orientMatrix.asOneAndZeros());
    name = getLPSGroup(lpsStr);
  }
  return name;
}

/**
 * Tell if a given syntax is an implicit one (element with no VR).
 *
 * @param {string} syntax The transfer syntax to test.
 * @returns {boolean} True if an implicit syntax.
 */
export function isImplicitTransferSyntax(syntax) {
  return syntax === transferSyntaxKeywords.ImplicitVRLittleEndian;
}

/**
 * Tell if a given syntax is a big endian syntax.
 *
 * @param {string} syntax The transfer syntax to test.
 * @returns {boolean} True if a big endian syntax.
 */
export function isBigEndianTransferSyntax(syntax) {
  return syntax === transferSyntaxKeywords.ExplicitVRBigEndian;
}

/**
 * Tell if a given syntax is a JPEG baseline one.
 *
 * @param {string} syntax The transfer syntax to test.
 * @returns {boolean} True if a jpeg baseline syntax.
 */
export function isJpegBaselineTransferSyntax(syntax) {
  return syntax === transferSyntaxKeywords.JPEGBaseline8Bit ||
    syntax === transferSyntaxKeywords.JPEGExtended12Bit;
}

/**
 * Tell if a given syntax is a JPEG Lossless one.
 *
 * @param {string} syntax The transfer syntax to test.
 * @returns {boolean} True if a jpeg lossless syntax.
 */
export function isJpegLosslessTransferSyntax(syntax) {
  return syntax === transferSyntaxKeywords.JPEGLossless ||
    syntax === transferSyntaxKeywords.JPEGLosslessSV1;
}

/**
 * Tell if a given syntax is a JPEG 2000 one.
 *
 * @param {string} syntax The transfer syntax to test.
 * @returns {boolean} True if a jpeg 2000 syntax.
 */
export function isJpeg2000TransferSyntax(syntax) {
  return syntax.match(/1.2.840.10008.1.2.4.9/) !== null;
}

/**
 * Tell if a given syntax is a RLE (Run-length encoding) one.
 *
 * @param {string} syntax The transfer syntax to test.
 * @returns {boolean} True if a RLE syntax.
 */
function isRleTransferSyntax(syntax) {
  return syntax === transferSyntaxKeywords.RLELossless;
}

/**
 * Tell if a given syntax needs decompression.
 *
 * @param {string} syntax The transfer syntax to test.
 * @returns {string} The name of the decompression algorithm.
 */
export function getSyntaxDecompressionName(syntax) {
  let algo = null;
  if (isJpeg2000TransferSyntax(syntax)) {
    algo = 'jpeg2000';
  } else if (isJpegBaselineTransferSyntax(syntax)) {
    algo = 'jpeg-baseline';
  } else if (isJpegLosslessTransferSyntax(syntax)) {
    algo = 'jpeg-lossless';
  } else if (isRleTransferSyntax(syntax)) {
    algo = 'rle';
  }
  return algo;
}

/**
 * Tell if a given syntax is supported for reading.
 *
 * @param {string} syntax The transfer syntax to test.
 * @returns {boolean} True if a supported syntax.
 */
function isReadSupportedTransferSyntax(syntax) {
  return (syntax === transferSyntaxKeywords.ImplicitVRLittleEndian ||
    syntax === transferSyntaxKeywords.ExplicitVRLittleEndian ||
    syntax === transferSyntaxKeywords.ExplicitVRBigEndian ||
    isJpegBaselineTransferSyntax(syntax) ||
    isJpegLosslessTransferSyntax(syntax) ||
    isJpeg2000TransferSyntax(syntax) ||
    isRleTransferSyntax(syntax));
}

/**
 * Get a transfer syntax name from its UID.
 *
 * @param {string} syntax The transfer syntax UID value.
 * @returns {string} The transfer syntax name.
 */
export function getTransferSyntaxName(syntax) {
  let name = 'Unknown';
  if (typeof transferSyntaxes[syntax] !== 'undefined') {
    name = transferSyntaxes[syntax];
  }
  return name;
}

/**
 * Guess the transfer syntax from the first data element.
 *
 * See {@link https://github.com/ivmartel/dwv/issues/188}
 *   (Allow to load DICOM with no DICM preamble) for more details.
 *
 * @param {DataElement} firstDataElement The first data element
 *   of the DICOM header.
 * @returns {DataElement} The transfer syntax data element.
 */
function guessTransferSyntax(firstDataElement) {
  const oEightGroupBigEndian = '0800';
  const oEightGroupLittleEndian = '0008';
  // check that group is 0008
  const group = firstDataElement.tag.getGroup();
  if (group !== oEightGroupBigEndian &&
    group !== oEightGroupLittleEndian) {
    throw new Error(
      'Not a valid DICOM file (no magic DICM word found' +
        ' and first element not in 0008 group)'
    );
  }
  // reasonable assumption: 2 uppercase characters => explicit vr
  const vr = firstDataElement.vr;
  const vr0 = vr.charCodeAt(0);
  const vr1 = vr.charCodeAt(1);
  const implicit = (vr0 >= 65 && vr0 <= 90 && vr1 >= 65 && vr1 <= 90)
    ? false : true;
  // guess transfer syntax
  let syntax = null;
  if (group === oEightGroupLittleEndian) {
    if (implicit) {
      syntax = transferSyntaxKeywords.ImplicitVRLittleEndian;
    } else {
      syntax = transferSyntaxKeywords.ExplicitVRLittleEndian;
    }
  } else {
    if (implicit) {
      // ImplicitVRBigEndian: impossible
      throw new Error(
        'Not a valid DICOM file (no magic DICM word found' +
        'and implicit VR big endian detected)'
      );
    } else {
      syntax = transferSyntaxKeywords.ExplicitVRBigEndian;
    }
  }
  // set transfer syntax data element
  const dataElement = new DataElement('UI');
  dataElement.tag = getTransferSyntaxUIDTag();
  dataElement.value = [syntax];
  dataElement.vl = dataElement.value[0].length;
  dataElement.startOffset = firstDataElement.startOffset;
  dataElement.endOffset = dataElement.startOffset + dataElement.vl;

  return dataElement;
}

/**
 * Get the appropriate TypedArray in function of arguments.
 *
 * @param {number} bitsAllocated The number of bites used to store
 *   the data: [8, 16, 32].
 * @param {number} pixelRepresentation The pixel representation,
 *   0:unsigned;1:signed.
 * @param {number} size The size of the new array.
 * @returns {Uint8Array|Int8Array|Uint16Array|Int16Array|Uint32Array|Int32Array}
 *   The good typed array.
 */
export function getTypedArray(bitsAllocated, pixelRepresentation, size) {
  let res = null;
  try {
    if (bitsAllocated === 1 || bitsAllocated === 8) {
      if (pixelRepresentation === 0) {
        res = new Uint8Array(size);
      } else {
        res = new Int8Array(size);
      }
    } else if (bitsAllocated === 16) {
      if (pixelRepresentation === 0) {
        res = new Uint16Array(size);
      } else {
        res = new Int16Array(size);
      }
    } else if (bitsAllocated === 32) {
      if (pixelRepresentation === 0) {
        res = new Uint32Array(size);
      } else {
        res = new Int32Array(size);
      }
    }
  } catch (error) {
    if (error instanceof RangeError) {
      const powerOf2 = Math.floor(Math.log(size) / Math.log(2));
      logger.error('Cannot allocate array of size: ' +
        size + ' (>2^' + powerOf2 + ').');
    }
  }
  return res;
}

/**
 * Get the number of bytes occupied by a data element prefix,
 *   (without its value).
 *
 * WARNING: this is valid for tags with a VR, if not sure use
 *   the 'isTagWithVR' function first.
 *
 * Reference:
 * - [Data Element explicit]{@link http://dicom.nema.org/medical/dicom/2022a/output/chtml/part05/chapter_7.html#table_7.1-1},
 * - [Data Element implicit]{@link http://dicom.nema.org/medical/dicom/2022a/output/chtml/part05/sect_7.5.2.html#table_7.5-1}.
 *
 * ```
 * | Tag | VR  | VL | Value |
 * | 4   | 2   | 2  | X     | -> regular explicit: 8 + X
 * | 4   | 2+2 | 4  | X     | -> 32bit VL: 12 + X
 *
 * | Tag | VL | Value |
 * | 4   | 4  | X     | -> implicit (32bit VL): 8 + X
 *
 * | Tag | Len | Value |
 * | 4   | 4   | X     | -> item: 8 + X
 * ```
 *
 * @param {string} vr The Value Representation of the element.
 * @param {boolean} isImplicit Does the data use implicit VR?
 * @returns {number} The size of the element prefix.
 */
export function getDataElementPrefixByteSize(vr, isImplicit) {
  return isImplicit ? 8 : is32bitVLVR(vr) ? 12 : 8;
}

/**
 * Is the input VR a known VR.
 *
 * @param {string} vr The vr to test.
 * @returns {boolean} True if known.
 */
function isKnownVR(vr) {
  const extraVrTypes = ['NONE', 'ox', 'xx', 'xs'];
  const knownTypes = Object.keys(vrTypes).concat(extraVrTypes);
  return knownTypes.includes(vr);
}

/**
 * Small list of used tag keys.
 */
const TagKeys = {
  TransferSyntax: '00020010',
  SpecificCharacterSet: '00080005',
  NumberOfFrames: '00280008',
  BitsAllocated: '00280100',
  PixelRepresentation: '00280103',
  PixelData: '7FE00010'
};

/**
 * DicomParser class.
 *
 * @example
 * // XMLHttpRequest onload callback
 * const onload = function (event) {
 *   // setup the dicom parser
 *   const dicomParser = new dwv.DicomParser();
 *   // parse the buffer
 *   dicomParser.parse(event.target.response);
 *   // get the dicom tags
 *   const tags = dicomParser.getDicomElements();
 *   // display the modality
 *   const div = document.getElementById('dwv');
 *   div.appendChild(document.createTextNode(
 *     'Modality: ' + tags['00080060'].value[0]
 *   ));
 * };
 * // DICOM file request
 * const request = new XMLHttpRequest();
 * const url = 'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm';
 * request.open('GET', url);
 * request.responseType = 'arraybuffer';
 * request.onload = onload;
 * request.send();
 */
export class DicomParser {

  /**
   * The list of DICOM elements.
   *
   * @type {DataElements}
   */
  #dataElements = {};

  /**
   * Default character set (optional).
   *
   * @type {string}
   */
  #defaultCharacterSet;

  /**
   * Default text decoder.
   *
   * @type {DefaultTextDecoder}
   */
  #defaultTextDecoder = new DefaultTextDecoder();

  /**
   * Special text decoder.
   *
   * @type {DefaultTextDecoder|TextDecoder}
   */
  #textDecoder = this.#defaultTextDecoder;

  /**
   * Decode an input string buffer using the default text decoder.
   *
   * @param {Uint8Array} buffer The buffer to decode.
   * @returns {string} The decoded string.
   */
  #decodeString(buffer) {
    return this.#defaultTextDecoder.decode(buffer);
  }

  /**
   * Decode an input string buffer using the 'special' text decoder.
   *
   * @param {Uint8Array} buffer The buffer to decode.
   * @returns {string} The decoded string.
   */
  #decodeSpecialString(buffer) {
    return this.#textDecoder.decode(buffer);
  }

  /**
   * Get the default character set.
   *
   * @returns {string} The default character set.
   */
  getDefaultCharacterSet() {
    return this.#defaultCharacterSet;
  }

  /**
   * Set the default character set.
   *
   * @param {string} characterSet The input character set.
   */
  setDefaultCharacterSet(characterSet) {
    this.#defaultCharacterSet = characterSet;
  }

  /**
   * Set the text decoder character set.
   *
   * @param {string} characterSet The input character set.
   */
  setDecoderCharacterSet(characterSet) {
    /**
     * The text decoder.
     *
     * Ref: {@link https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder}.
     *
     * @external TextDecoder
     */
    this.#textDecoder = new TextDecoder(characterSet);
  }

  // not using type DataElements since the typedef is not exported with the API

  /**
   * Get the DICOM data elements.
   *
   * @returns {Object<string, DataElement>} The data elements.
   */
  getDicomElements() {
    return this.#dataElements;
  }

  /**
   * Read a DICOM tag.
   *
   * @param {DataReader} reader The raw data reader.
   * @param {number} offset The offset where to start to read.
   * @returns {object} An object containing the tag and the end offset.
   */
  #readTag(reader, offset) {
    // group
    const group = reader.readHex(offset);
    offset += Uint16Array.BYTES_PER_ELEMENT;
    // element
    const element = reader.readHex(offset);
    offset += Uint16Array.BYTES_PER_ELEMENT;
    // return
    return {
      tag: new Tag(group, element),
      endOffset: offset
    };
  }

  /**
   * Read an item data element.
   *
   * @param {DataReader} reader The raw data reader.
   * @param {number} offset The offset where to start to read.
   * @param {boolean} implicit Is the DICOM VR implicit?
   * @returns {object} The item data as a list of data elements.
   */
  #readItemDataElement(reader, offset, implicit) {
    const itemData = {};

    // read the first item
    let item = this.#readDataElement(reader, offset, implicit);
    offset = item.endOffset;

    // exit if it is a sequence delimitation item
    if (isSequenceDelimitationItemTag(item.tag)) {
      return {
        data: itemData,
        endOffset: item.endOffset,
        isSeqDelim: true
      };
    }

    // store item (mainly to keep vl)
    itemData[item.tag.getKey()] = {
      tag: item.tag,
      vr: 'NONE',
      vl: item.vl,
      undefinedLength: item.undefinedLength
    };

    if (!item.undefinedLength) {
      // explicit VR item: read until the end offset
      const endOffset = offset;
      offset -= item.vl;
      while (offset < endOffset) {
        item = this.#readDataElement(reader, offset, implicit);
        offset = item.endOffset;
        itemData[item.tag.getKey()] = item;
      }
    } else {
      // implicit VR item: read until the item delimitation item
      let isItemDelim = false;
      while (!isItemDelim) {
        item = this.#readDataElement(reader, offset, implicit);
        offset = item.endOffset;
        isItemDelim = isItemDelimitationItemTag(item.tag);
        if (!isItemDelim) {
          itemData[item.tag.getKey()] = item;
        }
      }
    }

    return {
      data: itemData,
      endOffset: offset,
      isSeqDelim: false
    };
  }

  /**
   * Read the pixel item data element.
   * Ref: [Single frame fragments]{@link http://dicom.nema.org/medical/dicom/2022a/output/chtml/part05/sect_A.4.html#table_A.4-1}.
   *
   * @param {DataReader} reader The raw data reader.
   * @param {number} offset The offset where to start to read.
   * @param {boolean} implicit Is the DICOM VR implicit?
   * @returns {object} The item data as an array of data elements.
   */
  #readPixelItemDataElement(
    reader, offset, implicit) {
    const itemData = [];

    // first item: basic offset table
    let item = this.#readDataElement(reader, offset, implicit);
    const offsetTableVl = item.vl;
    offset = item.endOffset;

    // read until the sequence delimitation item
    let isSeqDelim = false;
    while (!isSeqDelim) {
      item = this.#readDataElement(reader, offset, implicit);
      offset = item.endOffset;
      isSeqDelim = isSequenceDelimitationItemTag(item.tag);
      if (!isSeqDelim) {
        // force pixel item vr to OB
        item.vr = 'OB';
        itemData.push(item);
      }
    }

    return {
      data: itemData,
      endOffset: offset,
      offsetTableVl: offsetTableVl
    };
  }

  /**
   * Read a DICOM data element.
   *
   * Reference: [DICOM VRs]{@link http://dicom.nema.org/medical/dicom/2022a/output/chtml/part05/sect_6.2.html#table_6.2-1}.
   *
   * @param {DataReader} reader The raw data reader.
   * @param {number} offset The offset where to start to read.
   * @param {boolean} implicit Is the DICOM VR implicit?
   * @returns {DataElement} The data element.
   */
  #readDataElement(reader, offset, implicit) {
    // Tag: group, element
    const readTagRes = this.#readTag(reader, offset);
    const tag = readTagRes.tag;
    offset = readTagRes.endOffset;

    // Value Representation (VR)
    let vr = null;
    let is32bitVL = false;
    if (tag.isWithVR()) {
      // implicit VR
      if (implicit) {
        vr = tag.getVrFromDictionary();
        if (typeof vr === 'undefined') {
          vr = 'UN';
        }
        is32bitVL = true;
      } else {
        vr = this.#decodeString(reader.readUint8Array(offset, 2));
        offset += 2 * Uint8Array.BYTES_PER_ELEMENT;
        is32bitVL = is32bitVLVR(vr);
        // reserved 2 bytes
        if (is32bitVL) {
          offset += 2 * Uint8Array.BYTES_PER_ELEMENT;
        }
      }
    } else {
      vr = 'NONE';
      is32bitVL = true;
    }

    // check vr
    if (!isKnownVR(vr)) {
      logger.warn('Unknown VR: ' + vr +
        ' (for tag ' + tag.getKey() + '), treating as \'UN\'');
      vr = 'UN';
    }

    // Value Length (VL)
    let vl = 0;
    if (is32bitVL) {
      vl = reader.readUint32(offset);
      offset += Uint32Array.BYTES_PER_ELEMENT;
    } else {
      vl = reader.readUint16(offset);
      offset += Uint16Array.BYTES_PER_ELEMENT;
    }

    // check the value of VL
    let undefinedLength = false;
    if (vl === 0xffffffff) {
      undefinedLength = true;
      vl = 0;
    }

    // treat private tag with unknown VR and zero VL as a sequence (see #799)
    if (tag.isPrivate() && vr === 'UN' && vl === 0) {
      vr = 'SQ';
    }

    let startOffset = offset;
    let endOffset = startOffset + vl;

    // read sequence elements
    let data;
    if (isPixelDataTag(tag) && undefinedLength) {
      // pixel data sequence (implicit)
      const pixItemData =
        this.#readPixelItemDataElement(reader, offset, implicit);
      offset = pixItemData.endOffset;
      startOffset += pixItemData.offsetTableVl;
      data = pixItemData.data;
      endOffset = offset;
      vl = offset - startOffset;
    } else if (vr === 'SQ') {
      // sequence
      data = [];
      let itemData;
      if (!undefinedLength) {
        if (vl !== 0) {
          // explicit VR sequence: read until the end offset
          const sqEndOffset = offset + vl;
          while (offset < sqEndOffset) {
            itemData = this.#readItemDataElement(reader, offset, implicit);
            data.push(itemData.data);
            offset = itemData.endOffset;
          }
          endOffset = offset;
          vl = offset - startOffset;
        }
      } else {
        // implicit VR sequence: read until the sequence delimitation item
        let isSeqDelim = false;
        while (!isSeqDelim) {
          itemData = this.#readItemDataElement(reader, offset, implicit);
          isSeqDelim = itemData.isSeqDelim;
          offset = itemData.endOffset;
          // do not store the delimitation item
          if (!isSeqDelim) {
            data.push(itemData.data);
          }
        }
        endOffset = offset;
        vl = offset - startOffset;
      }
    }

    // return
    const element = new DataElement(vr);
    element.tag = tag;
    element.vl = vl;
    element.startOffset = startOffset;
    element.endOffset = endOffset;
    // only set if true (only for sequences and items)
    if (undefinedLength) {
      element.undefinedLength = undefinedLength;
    }
    if (data) {
      element.items = data;
    }
    return element;
  }

  /**
   * Interpret the data of an element.
   *
   * @param {DataElement} element The data element.
   * @param {DataReader} reader The raw data reader.
   * @param {number} [pixelRepresentation] PixelRepresentation 0->unsigned,
   *   1->signed (needed for pixel data or VR=xs).
   * @param {number} [bitsAllocated] Bits allocated (needed for pixel data).
   * @returns {object} The interpreted data.
   */
  #interpretElement(
    element, reader, pixelRepresentation, bitsAllocated) {

    const tag = element.tag;
    const vl = element.vl;
    const vr = element.vr;
    const offset = element.startOffset;

    // data
    let data = null;
    const vrType = vrTypes[vr];
    if (isPixelDataTag(tag)) {
      if (element.undefinedLength) {
        // implicit pixel data sequence
        data = [];
        for (let j = 0; j < element.items.length; ++j) {
          data.push(this.#interpretElement(
            element.items[j], reader,
            pixelRepresentation, bitsAllocated));
        }
        // remove non parsed items
        delete element.items;
      } else {
        // check bits allocated and VR
        // https://dicom.nema.org/medical/dicom/2022a/output/chtml/part05/sect_A.2.html
        if (bitsAllocated > 8 && vr === 'OB') {
          logger.warn(
            'Reading DICOM pixel data with bitsAllocated>8 and OB VR' +
            ', treating as OW'
          );
          element.vr = 'OW';
        }
        // read
        data = [];
        if (bitsAllocated === 1) {
          data.push(reader.readBinaryArray(offset, vl));
        } else if (bitsAllocated === 8) {
          if (pixelRepresentation === 0) {
            data.push(reader.readUint8Array(offset, vl));
          } else {
            data.push(reader.readInt8Array(offset, vl));
          }
        } else if (bitsAllocated === 16) {
          if (pixelRepresentation === 0) {
            data.push(reader.readUint16Array(offset, vl));
          } else {
            data.push(reader.readInt16Array(offset, vl));
          }
        } else {
          throw new Error('Unsupported bits allocated: ' + bitsAllocated);
        }
      }
    } else if (typeof vrType !== 'undefined') {
      if (vrType === 'Uint8') {
        data = reader.readUint8Array(offset, vl);
      } else if (vrType === 'Uint16') {
        data = reader.readUint16Array(offset, vl);
        // keep as binary for 'O*' VR
        if (vr[0] !== 'O') {
          data = Array.from(data);
        }
      } else if (vrType === 'Uint32') {
        data = reader.readUint32Array(offset, vl);
        // keep as binary for 'O*' VR
        if (vr[0] !== 'O') {
          data = Array.from(data);
        }
      } else if (vrType === 'Uint64') {
        data = reader.readUint64Array(offset, vl);
      } else if (vrType === 'Int16') {
        data = Array.from(reader.readInt16Array(offset, vl));
      } else if (vrType === 'Int32') {
        data = Array.from(reader.readInt32Array(offset, vl));
      } else if (vrType === 'Int64') {
        data = reader.readInt64Array(offset, vl);
      } else if (vrType === 'Float32') {
        data = Array.from(reader.readFloat32Array(offset, vl));
      } else if (vrType === 'Float64') {
        data = Array.from(reader.readFloat64Array(offset, vl));
      } else if (vrType === 'string') {
        const stream = reader.readUint8Array(offset, vl);
        if (isCharSetStringVR(vr)) {
          data = this.#decodeSpecialString(stream);
        } else {
          data = this.#decodeString(stream);
        }
        data = cleanString(data).split('\\');
      } else {
        throw new Error('Unknown VR type: ' + vrType);
      }
    } else if (vr === 'xx') {
      // US or OW
      data = Array.from(reader.readUint16Array(offset, vl));
    } else if (vr === 'ox') {
      // OB or OW
      if (bitsAllocated === 8) {
        if (pixelRepresentation === 0) {
          data = Array.from(reader.readUint8Array(offset, vl));
        } else {
          data = Array.from(reader.readInt8Array(offset, vl));
        }
      } else {
        if (pixelRepresentation === 0) {
          data = Array.from(reader.readUint16Array(offset, vl));
        } else {
          data = Array.from(reader.readInt16Array(offset, vl));
        }
      }
    } else if (vr === 'xs') {
      // (US or SS) or (US or SS or OW)
      if (pixelRepresentation === 0) {
        data = Array.from(reader.readUint16Array(offset, vl));
      } else {
        data = Array.from(reader.readInt16Array(offset, vl));
      }
    } else if (vr === 'AT') {
      // attribute
      const raw = reader.readUint16Array(offset, vl);
      data = [];
      for (let i = 0, leni = raw.length; i < leni; i += 2) {
        const stri = raw[i].toString(16);
        const stri1 = raw[i + 1].toString(16);
        let str = '(';
        str += '0000'.substring(0, 4 - stri.length) + stri.toUpperCase();
        str += ',';
        str += '0000'.substring(0, 4 - stri1.length) + stri1.toUpperCase();
        str += ')';
        data.push(str);
      }
    } else if (vr === 'SQ') {
      // sequence
      data = [];
      for (let k = 0; k < element.items.length; ++k) {
        const item = element.items[k];
        const itemData = {};
        const keys = Object.keys(item);
        let sqBitsAllocated = bitsAllocated;
        let sqPixelRepresentation = pixelRepresentation;
        for (let l = 0; l < keys.length; ++l) {
          // check if local bitsAllocated
          // (inside item loop to get interpreted value)
          let dataElement = item[TagKeys.BitsAllocated];
          if (typeof dataElement !== 'undefined' &&
            typeof dataElement.value !== 'undefined') {
            sqBitsAllocated = dataElement.value[0];
          }
          // check if local pixelRepresentation
          // (inside item loop to get interpreted value)
          dataElement = item[TagKeys.PixelRepresentation];
          if (typeof dataElement !== 'undefined' &&
            typeof dataElement.value !== 'undefined') {
            sqPixelRepresentation = dataElement.value[0];
          }
          const subElement = item[keys[l]];
          subElement.value = this.#interpretElement(
            subElement, reader,
            sqPixelRepresentation, sqBitsAllocated);
          delete subElement.tag;
          delete subElement.vl;
          delete subElement.startOffset;
          delete subElement.endOffset;
          itemData[keys[l]] = subElement;
        }
        data.push(itemData);
      }
      // remove non parsed elements
      delete element.items;
    } else if (vr === 'NONE') {
      // no VR -> no data
      data = [];
    } else {
      logger.warn('Unknown VR: ' + vr +
        ' (for tag ' + element.tag.getKey() + ')');
      // empty data...
      data = [];
    }

    return data;
  }

  /**
   * Interpret the data of a list of elements.
   *
   * @param {DataElements} elements A list of data elements.
   * @param {DataReader} reader The raw data reader.
   * @param {number} pixelRepresentation PixelRepresentation 0->unsigned,
   *   1->signed.
   * @param {number} bitsAllocated Bits allocated.
   */
  #interpret(
    elements, reader,
    pixelRepresentation, bitsAllocated) {

    const keys = Object.keys(elements);
    for (let i = 0; i < keys.length; ++i) {
      const element = elements[keys[i]];
      if (typeof element.value === 'undefined') {
        element.value = this.#interpretElement(
          element, reader, pixelRepresentation, bitsAllocated);
      }
      // delete interpretation specific properties
      delete element.tag;
      delete element.vl;
      delete element.startOffset;
      delete element.endOffset;
    }
  }

  /**
   * Parse the complete DICOM file (given as input to the class).
   * Fills in the member object 'dataElements'.
   *
   * @param {ArrayBuffer} buffer The input array buffer.
   */
  parse(buffer) {
    let offset = 0;
    let syntax = '';
    let dataElement = null;
    // default readers
    const metaReader = new DataReader(buffer);
    let dataReader = new DataReader(buffer);

    // 128 -> 132: magic word
    offset = 128;
    const magicword = this.#decodeString(metaReader.readUint8Array(offset, 4));
    offset += 4 * Uint8Array.BYTES_PER_ELEMENT;
    if (magicword === 'DICM') {
      // 0002, 0000: FileMetaInformationGroupLength (vr='UL')
      dataElement = this.#readDataElement(metaReader, offset, false);
      dataElement.value = this.#interpretElement(dataElement, metaReader);
      // increment offset
      offset = dataElement.endOffset;
      // store the data element
      this.#dataElements[dataElement.tag.getKey()] = dataElement;
      // get meta length
      const metaLength = dataElement.value[0];

      // meta elements
      const metaEnd = offset + metaLength;
      while (offset < metaEnd) {
        // get the data element
        dataElement = this.#readDataElement(metaReader, offset, false);
        offset = dataElement.endOffset;
        // store the data element
        this.#dataElements[dataElement.tag.getKey()] = dataElement;
      }

      // check the TransferSyntaxUID (has to be there!)
      dataElement = this.#dataElements[TagKeys.TransferSyntax];
      if (typeof dataElement === 'undefined') {
        throw new Error('Not a valid DICOM file (no TransferSyntaxUID found)');
      }
      dataElement.value = this.#interpretElement(dataElement, metaReader);
      syntax = dataElement.value[0];

    } else {
      logger.warn('No DICM prefix, trying to guess tansfer syntax.');
      // read first element
      dataElement = this.#readDataElement(dataReader, 0, false);
      // guess transfer syntax
      const tsElement = guessTransferSyntax(dataElement);
      // store
      this.#dataElements[tsElement.tag.getKey()] = tsElement;
      syntax = tsElement.value[0];
      // reset offset
      offset = 0;
    }

    // check transfer syntax support
    if (!isReadSupportedTransferSyntax(syntax)) {
      throw new Error('Unsupported DICOM transfer syntax: \'' + syntax +
        '\' (' + getTransferSyntaxName(syntax) + ')');
    }

    // set implicit flag
    let implicit = false;
    if (isImplicitTransferSyntax(syntax)) {
      implicit = true;
    }

    // Big Endian
    if (isBigEndianTransferSyntax(syntax)) {
      dataReader = new DataReader(buffer, false);
    }

    // DICOM data elements
    while (offset < buffer.byteLength) {
      // get the data element
      dataElement = this.#readDataElement(dataReader, offset, implicit);
      // increment offset
      offset = dataElement.endOffset;
      // store the data element
      const key = dataElement.tag.getKey();
      if (typeof this.#dataElements[key] === 'undefined') {
        this.#dataElements[key] = dataElement;
      } else {
        logger.warn('Not saving duplicate tag: ' + key);
      }
    }

    // safety checks...
    if (isNaN(offset)) {
      throw new Error('Problem while parsing, bad offset');
    }
    if (buffer.byteLength !== offset) {
      logger.warn('Did not reach the end of the buffer: ' +
        offset + ' != ' + buffer.byteLength);
    }

    //-------------------------------------------------
    // values needed for data interpretation

    // pixel specific
    let pixelRepresentation = 0;
    let bitsAllocated = 16;
    if (typeof this.#dataElements[TagKeys.PixelData] !== 'undefined') {
      // PixelRepresentation 0->unsigned, 1->signed
      dataElement = this.#dataElements[TagKeys.PixelRepresentation];
      if (typeof dataElement !== 'undefined') {
        dataElement.value = this.#interpretElement(dataElement, dataReader);
        pixelRepresentation = dataElement.value[0];
      } else {
        logger.warn(
          'Reading DICOM pixel data with default pixelRepresentation.');
      }

      // BitsAllocated
      dataElement = this.#dataElements[TagKeys.BitsAllocated];
      if (typeof dataElement !== 'undefined') {
        dataElement.value = this.#interpretElement(dataElement, dataReader);
        bitsAllocated = dataElement.value[0];
      } else {
        logger.warn('Reading DICOM pixel data with default bitsAllocated.');
      }
    }

    // default character set
    if (typeof this.#defaultCharacterSet !== 'undefined') {
      this.setDecoderCharacterSet(this.#defaultCharacterSet);
    }

    // SpecificCharacterSet
    dataElement = this.#dataElements[TagKeys.SpecificCharacterSet];
    if (typeof dataElement !== 'undefined') {
      dataElement.value = this.#interpretElement(dataElement, dataReader);
      let charSetTerm;
      if (dataElement.value.length === 1) {
        charSetTerm = dataElement.value[0];
      } else {
        charSetTerm = dataElement.value[1];
        logger.warn('Unsupported character set with code extensions: \'' +
          charSetTerm + '\'.');
      }
      this.setDecoderCharacterSet(getUtfLabel(charSetTerm));
    }

    // interpret the dicom elements
    this.#interpret(
      this.#dataElements, dataReader,
      pixelRepresentation, bitsAllocated
    );

    // handle fragmented pixel buffer
    // Reference: http://dicom.nema.org/medical/dicom/2022a/output/chtml/part05/sect_8.2.html
    // (third note, "Depending on the transfer syntax...")
    dataElement = this.#dataElements[TagKeys.PixelData];
    if (typeof dataElement !== 'undefined') {
      if (dataElement.undefinedLength) {
        let numberOfFrames = 1;
        if (typeof this.#dataElements[TagKeys.NumberOfFrames] !== 'undefined') {
          numberOfFrames = Number(
            this.#dataElements[TagKeys.NumberOfFrames].value[0]
          );
        }
        const pixItems = dataElement.value;
        if (pixItems.length > 1 && pixItems.length > numberOfFrames) {
          // concatenate pixel data items
          // concat does not work on typed arrays
          //this.pixelBuffer = this.pixelBuffer.concat( dataElement.data );
          // manual concat...
          const nItemPerFrame = pixItems.length / numberOfFrames;
          const newPixItems = [];
          let index = 0;
          for (let f = 0; f < numberOfFrames; ++f) {
            index = f * nItemPerFrame;
            // calculate the size of a frame
            let size = 0;
            for (let i = 0; i < nItemPerFrame; ++i) {
              size += pixItems[index + i].length;
            }
            // create new buffer
            const newBuffer = new pixItems[0].constructor(size);
            // fill new buffer
            let fragOffset = 0;
            for (let j = 0; j < nItemPerFrame; ++j) {
              newBuffer.set(pixItems[index + j], fragOffset);
              fragOffset += pixItems[index + j].length;
            }
            newPixItems[f] = newBuffer;
          }
          // store as pixel data
          dataElement.value = newPixItems;
        }
      }
    }
  }

} // class DicomParser
