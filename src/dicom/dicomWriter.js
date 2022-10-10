// namespaces
var dwv = dwv || {};
dwv.dicom = dwv.dicom || {};

/**
 * Get the dwv UID prefix.
 * Issued by Medical Connections Ltd (www.medicalconnections.co.uk)
 *   on 25/10/2017.
 *
 * @returns {string} The dwv UID prefix.
 */
dwv.dicom.getDwvUIDPrefix = function () {
  return '1.2.826.0.1.3680043.9.7278.1';
};

// local generated uid counter
var _uidCount = 0;

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
dwv.dicom.getUID = function (tagName) {
  var prefix = dwv.dicom.getDwvUIDPrefix() + '.';
  var uid = '';
  if (tagName === 'ImplementationClassUID') {
    uid = prefix + dwv.getVersion();
  } else {
    // date (only numbers), do not keep milliseconds
    var date = (new Date()).toISOString().replace(/\D/g, '');
    var datePart = '.' + date.substring(0, 14);
    // count
    _uidCount += 1;
    var countPart = '.' + _uidCount;

    // uid = prefix . tag . date . count
    uid = prefix;

    // limit tag part to not exceed 64 length
    var nonTagLength = prefix.length + countPart.length + datePart.length;
    var leni = Math.min(tagName.length, 64 - nonTagLength);
    if (leni > 1) {
      var tagNumber = '';
      for (var i = 0; i < leni; ++i) {
        tagNumber += tagName.charCodeAt(i);
      }
      uid += tagNumber.substring(0, leni);
    }

    // finish
    uid += datePart + countPart;
  }
  return uid;
};

/**
 * Return true if the input number is even.
 *
 * @param {number} number The number to check.
 * @returns {boolean} True is the number is even.
 */
dwv.dicom.isEven = function (number) {
  return number % 2 === 0;
};

/**
 * Is the input VR a VR that stores data in a typed array.
 * TODO: include ox and xs?
 *
 * @param {string} vr The element VR.
 * @returns {boolean} True if the VR is a typed array one.
 */
dwv.dicom.isTypedArrayVr = function (vr) {
  var vrType = dwv.dicom.vrTypes[vr];
  return typeof vrType !== 'undefined' &&
    vrType !== 'string';
};

/**
 * Is the input VR a string VR.
 *
 * @param {string} vr The element VR.
 * @returns {boolean} True if the VR is a string one.
 */
dwv.dicom.isStringVr = function (vr) {
  var vrType = dwv.dicom.vrTypes[vr];
  return typeof vrType !== 'undefined' &&
    vrType === 'string';
};

/**
 * Is the input VR a VR that could need padding.
 *
 * @param {string} vr The element VR.
 * @returns {boolean} True if the VR needs padding.
 */
dwv.dicom.isVrToPad = function (vr) {
  return dwv.dicom.isStringVr(vr) || vr === 'OB';
};

/**
 * Get the VR specific padding value.
 *
 * @param {string} vr The element VR.
 * @returns {boolean} The value used to pad.
 */
dwv.dicom.getVrPad = function (vr) {
  var pad = 0;
  if (dwv.dicom.isStringVr(vr)) {
    if (vr === 'UI') {
      pad = '\0';
    } else {
      pad = ' ';
    }
  }
  return pad;
};

/**
 * Pad an input value according to its VR.
 * see http://dicom.nema.org/dicom/2013/output/chtml/part05/sect_6.2.html
 *
 * @param {object} element The DICOM element to get the VR from.
 * @param {Array} value The value to pad.
 * @returns {Array} The padded value.
 */
dwv.dicom.padElementValue = function (element, value) {
  var newValue = value;
  if (value !== null &&
    typeof value !== 'undefined' &&
    typeof value.length !== 'undefined' &&
    dwv.dicom.isVrToPad(element.vr)) {
    // calculate size
    var size = 0;
    if (element.vr === 'OB' &&
      value.length !== 0 &&
      typeof value[0].length !== 'undefined') {
      // pixel data comes as an array of typedArray
      for (var i = 0; i < value.length; ++i) {
        size += value[i].length;
      }
    } else {
      size = value.join('').length;
    }
    // pad if needed
    if (!dwv.dicom.isEven(size)) {
      newValue[value.length - 1] += dwv.dicom.getVrPad(element.vr);
    }
  }
  return newValue;
};

/**
 * Helper method to flatten an array of typed arrays to 2D typed array
 *
 * @param {Array} initialArray array of typed arrays
 * @returns {object} a typed array containing all values
 */
dwv.dicom.flattenArrayOfTypedArrays = function (initialArray) {
  var initialArrayLength = initialArray.length;
  var arrayLength = initialArray[0].length;
  // If this is not a array of arrays, just return the initial one:
  if (typeof arrayLength === 'undefined') {
    return initialArray;
  }

  var flattenendArrayLength = initialArrayLength * arrayLength;

  var flattenedArray = new initialArray[0].constructor(flattenendArrayLength);

  for (var i = 0; i < initialArrayLength; i++) {
    var indexFlattenedArray = i * arrayLength;
    flattenedArray.set(initialArray[i], indexFlattenedArray);
  }
  return flattenedArray;
};

/**
 * Default text encoder.
 */
dwv.dicom.DefaultTextEncoder = function () {
  /**
   * Encode an input string.
   *
   * @param {string} str The string to encode.
   * @returns {Uint8Array} The encoded string.
   */
  this.encode = function (str) {
    var result = new Uint8Array(str.length);
    for (var i = 0, leni = str.length; i < leni; ++i) {
      result[i] = str.charCodeAt(i);
    }
    return result;
  };
};

/**
 * DICOM writer.
 *
 * Example usage:
 *   var parser = new dwv.dicom.DicomParser();
 *   parser.parse(this.response);
 *
 *   var writer = new dwv.dicom.DicomWriter(parser.getRawDicomElements());
 *   var blob = new Blob([writer.getBuffer()], {type: 'application/dicom'});
 *
 *   var element = document.getElementById("download");
 *   element.href = URL.createObjectURL(blob);
 *   element.download = "anonym.dcm";
 *
 * @class
 */
dwv.dicom.DicomWriter = function () {

  // flag to use VR=UN for private sequences, default to false
  // (mainly used in tests)
  this.useUnVrForPrivateSq = false;

  // possible tag actions
  var actions = {
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
  var defaultRules = {
    default: {action: 'copy', value: null}
  };

  /**
   * Public (modifiable) rules.
   * Set of objects as:
   *   name : { action: 'actionName', value: 'optionalValue }
   * The names are either 'default', tagName or groupName.
   * Each DICOM element will be checked to see if a rule is applicable.
   * First checked by tagName and then by groupName,
   * if nothing is found the default rule is applied.
   */
  this.rules = defaultRules;

  /**
   * Default text encoder.
   *
   * @private
   * @type {dwv.dicom.DefaultTextEncoder}
   */
  var defaultTextEncoder = new dwv.dicom.DefaultTextEncoder();

  /**
   * Special text encoder.
   *
   * @private
   * @type {dwv.dicom.DefaultTextEncoder|TextEncoder}
   */
  var textEncoder = defaultTextEncoder;

  /**
   * Encode string data.
   *
   * @param {number} str The string to encode.
   * @returns {Uint8Array} The encoded string.
   */
  this.encodeString = function (str) {
    return defaultTextEncoder.encode(str);
  };

  /**
   * Encode data as a UTF-8.
   *
   * @param {number} str The string to write.
   * @returns {Uint8Array} The encoded string.
   */
  this.encodeSpecialString = function (str) {
    return textEncoder.encode(str);
  };

  /**
   * Use a TextEncoder instead of the default text decoder.
   */
  this.useSpecialTextEncoder = function () {
    textEncoder = new TextEncoder();
  };

  /**
   * Example anonymisation rules.
   */
  this.anonymisationRules = {
    default: {action: 'remove', value: null},
    PatientName: {action: 'replace', value: 'Anonymized'}, // tag
    'Meta Element': {action: 'copy', value: null}, // group 'x0002'
    Acquisition: {action: 'copy', value: null}, // group 'x0018'
    'Image Presentation': {action: 'copy', value: null}, // group 'x0028'
    Procedure: {action: 'copy', value: null}, // group 'x0040'
    'Pixel Data': {action: 'copy', value: null} // group 'x7fe0'
  };

  /**
   * Get the element to write according to the class rules.
   * Priority order: tagName, groupName, default.
   *
   * @param {object} element The element to check
   * @returns {object} The element to write, can be null.
   */
  this.getElementToWrite = function (element) {
    // get group and tag string name
    var groupName = element.tag.getGroupName();
    var tagName = element.tag.getNameFromDictionary();

    // apply rules:
    var rule;
    if (typeof this.rules[element.tag.getKey()] !== 'undefined') {
      // 1. tag itself
      rule = this.rules[element.tag.getKey()];
    } else if (tagName !== null && typeof this.rules[tagName] !== 'undefined') {
      // 2. tag name
      rule = this.rules[tagName];
    } else if (typeof this.rules[groupName] !== 'undefined') {
      // 3. group name
      rule = this.rules[groupName];
    } else {
      // 4. default
      rule = this.rules['default'];
    }
    // apply action on element and return
    return actions[rule.action](element, rule.value);
  };
};

/**
 * Write a list of items.
 *
 * @param {dwv.dicom.DataWriter} writer The raw data writer.
 * @param {number} byteOffset The offset to start writing from.
 * @param {Array} items The list of items to write.
 * @param {boolean} isImplicit Is the DICOM VR implicit?
 * @returns {number} The new offset position.
 */
dwv.dicom.DicomWriter.prototype.writeDataElementItems = function (
  writer, byteOffset, items, isImplicit) {
  var item = null;
  for (var i = 0; i < items.length; ++i) {
    item = items[i];
    var itemKeys = Object.keys(item);
    if (itemKeys.length === 0) {
      continue;
    }
    // item element (create new to not modify original)
    var undefinedLength = false;
    if (typeof item.xFFFEE000.undefinedLength !== 'undefined') {
      undefinedLength = item.xFFFEE000.undefinedLength;
    }
    var itemElement = {
      tag: dwv.dicom.getItemTag(),
      vr: 'NONE',
      vl: undefinedLength ? 0xffffffff : item.xFFFEE000.vl,
      value: []
    };
    byteOffset = this.writeDataElement(
      writer, itemElement, byteOffset, isImplicit);
    // write rest
    for (var m = 0; m < itemKeys.length; ++m) {
      if (itemKeys[m] !== 'xFFFEE000' && itemKeys[m] !== 'xFFFEE00D') {
        byteOffset = this.writeDataElement(
          writer, item[itemKeys[m]], byteOffset, isImplicit);
      }
    }
    // item delimitation
    if (undefinedLength) {
      var itemDelimElement = {
        tag: dwv.dicom.getItemDelimitationItemTag(),
        vr: 'NONE',
        vl: 0,
        value: []
      };
      byteOffset = this.writeDataElement(
        writer, itemDelimElement, byteOffset, isImplicit);
    }
  }

  // return new offset
  return byteOffset;
};

/**
 * Write data with a specific Value Representation (VR).
 *
 * @param {dwv.dicom.DataWriter} writer The raw data writer.
 * @param {string} vr The data Value Representation (VR).
 * @param {string} vl The data Value Length (VL).
 * @param {number} byteOffset The offset to start writing from.
 * @param {Array} value The array to write.
 * @param {boolean} isImplicit Is the DICOM VR implicit?
 * @returns {number} The new offset position.
 */
dwv.dicom.DicomWriter.prototype.writeDataElementValue = function (
  writer, vr, vl, byteOffset, value, isImplicit) {

  var startOffset = byteOffset;

  if (vr === 'NONE') {
    // nothing to do!
  } else if (value instanceof Uint8Array) {
    // binary data has been expanded 8 times at read
    if (value.length === 8 * vl) {
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
    var vrType = dwv.dicom.vrTypes[vr];
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
    } else if (vr === 'SQ') {
      byteOffset = this.writeDataElementItems(
        writer, byteOffset, value, isImplicit);
    } else if (vr === 'AT') {
      for (var i = 0; i < value.length; ++i) {
        var hexString = value[i] + '';
        var hexString1 = hexString.substring(1, 5);
        var hexString2 = hexString.substring(6, 10);
        var dec1 = parseInt(hexString1, 16);
        var dec2 = parseInt(hexString2, 16);
        var atValue = new Uint16Array([dec1, dec2]);
        byteOffset = writer.writeUint16Array(byteOffset, atValue);
      }
    } else {
      dwv.logger.warn('Unknown VR: ' + vr);
    }
  }

  if (vr !== 'SQ' && vr !== 'NONE') {
    var diff = byteOffset - startOffset;
    if (diff !== vl) {
      dwv.logger.warn('Offset difference and VL are not equal: ' +
        diff + ' != ' + vl + ', vr:' + vr + ', val:' + value);
    }
  }

  // return new offset
  return byteOffset;
};

/**
 * Write a pixel data element.
 *
 * @param {dwv.dicom.DataWriter} writer The raw data writer.
 * @param {string} vr The data Value Representation (VR).
 * @param {string} vl The data Value Length (VL).
 * @param {number} byteOffset The offset to start writing from.
 * @param {Array} value The array to write.
 * @param {boolean} isImplicit Is the DICOM VR implicit?
 * @returns {number} The new offset position.
 */
dwv.dicom.DicomWriter.prototype.writePixelDataElementValue = function (
  writer, vr, vl, byteOffset, value, isImplicit) {
  // explicit length
  if (vl !== 'u/l') {
    var finalValue = value[0];
    // flatten multi frame
    if (value.length > 1) {
      finalValue = dwv.dicom.flattenArrayOfTypedArrays(value);
    }
    // write
    byteOffset = this.writeDataElementValue(
      writer, vr, vl, byteOffset, finalValue, isImplicit);
  } else {
    // pixel data as sequence
    var item = {};
    // first item: basic offset table
    item.xFFFEE000 = {
      tag: dwv.dicom.getItemTag(),
      vr: 'NONE',
      vl: 0,
      value: []
    };
    // data
    for (var i = 0; i < value.length; ++i) {
      item[i] = {
        tag: dwv.dicom.getItemTag(),
        vr: vr,
        vl: value[i].length,
        value: value[i]
      };
    }
    // write
    byteOffset = this.writeDataElementItems(
      writer, byteOffset, [item], isImplicit);
  }

  // return new offset
  return byteOffset;
};

/**
 * Write a data element.
 *
 * @param {dwv.dicom.DataWriter} writer The raw data writer.
 * @param {object} element The DICOM data element to write.
 * @param {number} byteOffset The offset to start writing from.
 * @param {boolean} isImplicit Is the DICOM VR implicit?
 * @returns {number} The new offset position.
 */
dwv.dicom.DicomWriter.prototype.writeDataElement = function (
  writer, element, byteOffset, isImplicit) {
  var isTagWithVR = element.tag.isWithVR();
  var is32bitVLVR = (isImplicit || !isTagWithVR)
    ? true : dwv.dicom.is32bitVLVR(element.vr);
  // group
  byteOffset = writer.writeHex(byteOffset, element.tag.getGroup());
  // element
  byteOffset = writer.writeHex(byteOffset, element.tag.getElement());
  // VR
  var vr = element.vr;
  // use VR=UN for private sequence
  if (this.useUnVrForPrivateSq &&
    element.tag.isPrivate() &&
    vr === 'SQ') {
    dwv.logger.warn('Write element using VR=UN for private sequence.');
    vr = 'UN';
  }
  if (isTagWithVR && !isImplicit) {
    byteOffset = writer.writeUint8Array(byteOffset, this.encodeString(vr));
    // reserved 2 bytes for 32bit VL
    if (is32bitVLVR) {
      byteOffset += 2;
    }
  }

  var undefinedLengthSequence = false;
  if (element.vr === 'SQ' ||
    dwv.dicom.isPixelDataTag(element.tag)) {
    if (typeof element.undefinedLength !== 'undefined') {
      undefinedLengthSequence = element.undefinedLength;
    }
  }
  var undefinedLengthItem = false;
  if (dwv.dicom.isItemTag(element.tag)) {
    if (typeof element.undefinedLength !== 'undefined') {
      undefinedLengthItem = element.undefinedLength;
    }
  }

  // update vl for sequence or item with undefined length
  var vl = element.vl;
  if (undefinedLengthSequence || undefinedLengthItem) {
    vl = 0xffffffff;
  }
  // VL
  if (is32bitVLVR) {
    byteOffset = writer.writeUint32(byteOffset, vl);
  } else {
    byteOffset = writer.writeUint16(byteOffset, vl);
  }

  // value
  var value = element.value;
  // check value
  if (typeof value === 'undefined') {
    value = [];
  }
  // write
  if (dwv.dicom.isPixelDataTag(element.tag)) {
    byteOffset = this.writePixelDataElementValue(
      writer, element.vr, element.vl, byteOffset, value, isImplicit);
  } else {
    byteOffset = this.writeDataElementValue(
      writer, element.vr, element.vl, byteOffset, value, isImplicit);
  }

  // sequence delimitation item for sequence with undefined length
  if (undefinedLengthSequence) {
    var seqDelimElement = {
      tag: dwv.dicom.getSequenceDelimitationItemTag(),
      vr: 'NONE',
      vl: 0,
      value: []
    };
    byteOffset = this.writeDataElement(
      writer, seqDelimElement, byteOffset, isImplicit);
  }

  // return new offset
  return byteOffset;
};

/**
 * Get the ArrayBuffer corresponding to input DICOM elements.
 *
 * @param {Array} dicomElements The wrapped elements to write.
 * @returns {ArrayBuffer} The elements as a buffer.
 */
dwv.dicom.DicomWriter.prototype.getBuffer = function (dicomElements) {
  // Transfer Syntax
  var syntax = dwv.dicom.cleanString(dicomElements.x00020010.value[0]);
  var isImplicit = dwv.dicom.isImplicitTransferSyntax(syntax);
  var isBigEndian = dwv.dicom.isBigEndianTransferSyntax(syntax);
  // Bits Allocated
  var bitsAllocated = dicomElements.x00280100.value[0];
  // Specific CharacterSet
  if (typeof dicomElements.x00080005 !== 'undefined') {
    var oldscs = dwv.dicom.cleanString(dicomElements.x00080005.value[0]);
    // force UTF-8 if not default character set
    if (typeof oldscs !== 'undefined' && oldscs !== 'ISO-IR 6') {
      dwv.logger.debug('Change charset to UTF, was: ' + oldscs);
      this.useSpecialTextEncoder();
      dicomElements.x00080005.value = ['ISO_IR 192'];
    }
  }

  // calculate buffer size and split elements (meta and non meta)
  var totalSize = 128 + 4; // DICM
  var localSize = 0;
  var metaElements = [];
  var rawElements = [];
  var element;
  var groupName;
  var metaLength = 0;
  var fmiglTag = dwv.dicom.getFileMetaInformationGroupLengthTag();
  // ImplementationClassUID
  var icUIDTag = new dwv.dicom.Tag('0x0002', '0x0012');
  // ImplementationVersionName
  var ivnTag = new dwv.dicom.Tag('0x0002', '0x0013');

  // loop through elements to get the buffer size
  var keys = Object.keys(dicomElements);
  for (var i = 0, leni = keys.length; i < leni; ++i) {
    element = this.getElementToWrite(dicomElements[keys[i]]);
    if (element !== null &&
       !fmiglTag.equals(element.tag) &&
       !icUIDTag.equals(element.tag) &&
       !ivnTag.equals(element.tag)) {
      localSize = 0;

      // XB7 2020-04-17
      // Check if UN can be converted to correct VR.
      // This check must be done BEFORE calculating totalSize,
      // otherwise there may be extra null bytes at the end of the file
      // (dcmdump may crash because of these bytes)
      dwv.dicom.checkUnknownVR(element);

      // update value and vl
      this.setElementValue(
        element, element.value, isImplicit, bitsAllocated);

      // tag group name
      groupName = element.tag.getGroupName();

      // prefix
      if (groupName === 'Meta Element') {
        localSize += dwv.dicom.getDataElementPrefixByteSize(element.vr, false);
      } else {
        localSize += dwv.dicom.getDataElementPrefixByteSize(
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

  // ImplementationClassUID
  var icUID = dwv.dicom.getDicomElement('ImplementationClassUID');
  var icUIDSize = dwv.dicom.getDataElementPrefixByteSize(icUID.vr, isImplicit);
  icUIDSize += this.setElementValue(
    icUID, [dwv.dicom.getUID('ImplementationClassUID')], false);
  metaElements.push(icUID);
  metaLength += icUIDSize;
  totalSize += icUIDSize;
  // ImplementationVersionName
  var ivn = dwv.dicom.getDicomElement('ImplementationVersionName');
  var ivnSize = dwv.dicom.getDataElementPrefixByteSize(ivn.vr, isImplicit);
  var ivnValue = 'DWV_' + dwv.getVersion();
  ivnSize += this.setElementValue(ivn, [ivnValue], false);
  metaElements.push(ivn);
  metaLength += ivnSize;
  totalSize += ivnSize;

  // create the FileMetaInformationGroupLength element
  var fmigl = dwv.dicom.getDicomElement('FileMetaInformationGroupLength');
  var fmiglSize = dwv.dicom.getDataElementPrefixByteSize(fmigl.vr, isImplicit);
  fmiglSize += this.setElementValue(
    fmigl, new Uint32Array([metaLength]), false);
  totalSize += fmiglSize;

  // create buffer
  var buffer = new ArrayBuffer(totalSize);
  var metaWriter = new dwv.dicom.DataWriter(buffer);
  var dataWriter = new dwv.dicom.DataWriter(buffer, !isBigEndian);

  var offset = 128;
  // DICM
  offset = metaWriter.writeUint8Array(offset, this.encodeString('DICM'));
  // FileMetaInformationGroupLength
  offset = this.writeDataElement(metaWriter, fmigl, offset, false);
  // write meta
  for (var j = 0, lenj = metaElements.length; j < lenj; ++j) {
    offset = this.writeDataElement(metaWriter, metaElements[j], offset, false);
  }

  // check meta position
  var preambleSize = 128 + 4;
  var metaOffset = preambleSize + fmiglSize + metaLength;
  if (offset !== metaOffset) {
    dwv.logger.warn('Bad size calculation... meta offset: ' + offset +
      ', calculated size:' + metaOffset +
      ' (diff:' + (offset - metaOffset) + ')');
  }

  // pass flag to writer
  dataWriter.useUnVrForPrivateSq = this.useUnVrForPrivateSq;
  // write non meta
  for (var k = 0, lenk = rawElements.length; k < lenk; ++k) {
    offset = this.writeDataElement(
      dataWriter, rawElements[k], offset, isImplicit);
  }

  // check final position
  if (offset !== totalSize) {
    dwv.logger.warn('Bad size calculation... final offset: ' + offset +
      ', calculated size:' + totalSize +
      ' (diff:' + (offset - totalSize) + ')');
  }
  // return
  return buffer;
};

/**
 * Fix for broken DICOM elements: Replace "UN" with correct VR if the
 * element exists in dictionary
 *
 * @param {object} element The DICOM element.
 */
dwv.dicom.checkUnknownVR = function (element) {
  if (element.vr === 'UN') {
    var dictVr = element.tag.getVrFromDictionary();
    if (dictVr !== null && element.vr !== dictVr) {
      element.vr = dictVr;
      dwv.logger.info('Element ' + element.tag.getGroup() +
        ' ' + element.tag.getElement() +
        ' VR changed from UN to ' + element.vr);
    }
  }
};

/**
 * Get a DICOM element from its tag name (value set separatly).
 *
 * @param {string} tagName The string tag name.
 * @returns {object} The DICOM element.
 */
dwv.dicom.getDicomElement = function (tagName) {
  var tag = dwv.dicom.getTagFromDictionary(tagName);
  return {
    tag: tag,
    vr: tag.getVrFromDictionary()
  };
};

/**
 * Get the number of bytes per element for a given VR type.
 *
 * @param {string} vrType The VR type as defined in the dictionary.
 * @returns {number} The bytes per element.
 */
dwv.dicom.getBpeForVrType = function (vrType) {
  var bpe;
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
};

/**
 * Set a DICOM element value according to its VR (Value Representation).
 *
 * @param {object} element The DICOM element to set the value.
 * @param {object} value The value to set.
 * @param {boolean} isImplicit Does the data use implicit VR?
 * @param {number} bitsAllocated Bits allocated used for pixel data.
 * @returns {number} The total element size.
 */
dwv.dicom.DicomWriter.prototype.setElementValue = function (
  element, value, isImplicit, bitsAllocated) {
  // byte size of the element
  var size = 0;
  // special sequence case
  if (element.vr === 'SQ') {

    if (value !== null && value !== 0) {
      var newItems = [];
      var name;

      // explicit or undefined length sequence
      var undefinedLength = false;
      if (typeof element.undefinedLength !== 'undefined') {
        undefinedLength = element.undefinedLength;
        delete element.undefinedLength;
      }

      // items
      for (var i = 0; i < value.length; ++i) {
        var oldItemElements = value[i];
        var newItemElements = {};
        var subSize = 0;

        // check data
        if (oldItemElements === null || oldItemElements === 0) {
          continue;
        }

        // elements
        var itemKeys = Object.keys(oldItemElements);
        for (var j = 0, lenj = itemKeys.length; j < lenj; ++j) {
          var itemKey = itemKeys[j];
          var subElement = oldItemElements[itemKey];
          if (dwv.dicom.isItemTag(subElement.tag)) {
            continue;
          }
          // set item value
          subSize += this.setElementValue(
            subElement, subElement.value, isImplicit, bitsAllocated);
          newItemElements[itemKey] = subElement;
          // add prefix size
          subSize += dwv.dicom.getDataElementPrefixByteSize(
            subElement.vr, isImplicit);
        }

        // add item element (used to store its size)
        var itemElement = {
          tag: dwv.dicom.getItemTag(),
          vr: 'NONE',
          vl: subSize,
          value: []
        };
        if (undefinedLength) {
          itemElement.undefinedLength = undefinedLength;
        }
        name = itemElement.tag.getKey();
        newItemElements[name] = itemElement;
        subSize += dwv.dicom.getDataElementPrefixByteSize(
          itemElement.vr, isImplicit);

        // add item delimitation size
        if (undefinedLength) {
          subSize += dwv.dicom.getDataElementPrefixByteSize(
            'NONE', isImplicit);
        }

        size += subSize;
        newItems.push(newItemElements);
      }

      // add sequence delimitation size
      if (undefinedLength) {
        size += dwv.dicom.getDataElementPrefixByteSize('NONE', isImplicit);
      }

      // update sequence element
      element.value = newItems;
      element.vl = size;
      if (undefinedLength) {
        element.undefinedLength = undefinedLength;
      }
    }
  } else {
    // set the value and calculate size
    size = 0;

    // encode
    if (dwv.dicom.isStringVr(element.vr)) {
      if (dwv.dicom.charSetString.includes(element.vr)) {
        value = this.encodeSpecialString(value.join('\\'));
      } else {
        value = this.encodeString(value.join('\\'));
      }
    }

    var paddedValue = dwv.dicom.padElementValue(element, value);
    element.value = paddedValue;

    if (element.vr === 'AT') {
      size = 4;
    } else if (element.vr === 'xs') {
      size = element.value.length * Uint16Array.BYTES_PER_ELEMENT;
    } else if (dwv.dicom.isTypedArrayVr(element.vr) || element.vr === 'ox') {
      if (dwv.dicom.isPixelDataTag(element.tag) &&
        Array.isArray(value)) {
        size = 0;
        for (var b = 0; b < value.length; ++b) {
          size += value[b].length;
        }
      } else {
        size = element.value.length;
      }

      // convert size to bytes
      var vrType = dwv.dicom.vrTypes[element.vr];
      if (dwv.dicom.isPixelDataTag(element.tag) || element.vr === 'ox') {
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
      } else if (typeof vrType !== 'undefined') {
        var bpe = dwv.dicom.getBpeForVrType(vrType);
        if (typeof bpe !== 'undefined') {
          size *= bpe;
        } else {
          throw Error('Unknown bytes per element for VR type: ' + vrType);
        }
      } else {
        throw Error('Unsupported element: ' + element.vr);
      }
    } else {
      size = element.value.length;
    }

    element.vl = size;
  }

  // return the size of that data
  return size;
};

/**
 * Get the DICOM elements from a DICOM json tags object.
 * The json is a simplified version of the oficial DICOM json with
 * tag names instead of keys and direct values (no value property) for
 * simple tags.
 *
 * @param {object} jsonTags The DICOM json tags object.
 * @returns {object} The DICOM elements.
 */
dwv.dicom.getElementsFromJSONTags = function (jsonTags) {
  var keys = Object.keys(jsonTags);
  var dicomElements = {};
  for (var k = 0, len = keys.length; k < len; ++k) {
    // get the DICOM element definition from its name
    var tag = dwv.dicom.getTagFromDictionary(keys[k]);
    var vr = tag.getVrFromDictionary();
    // tag value
    var value;
    var undefinedLength = false;
    var jsonTag = jsonTags[keys[k]];
    if (vr === 'SQ') {
      var items = [];
      if (typeof jsonTag.undefinedLength !== 'undefined') {
        undefinedLength = jsonTag.undefinedLength;
      }
      if (typeof jsonTag.value !== 'undefined' &&
        jsonTag.value !== null) {
        for (var i = 0; i < jsonTag.value.length; ++i) {
          items.push(dwv.dicom.getElementsFromJSONTags(jsonTag.value[i]));
        }
      } else {
        dwv.logger.trace('Undefined or null jsonTag SQ value.');
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
    var dicomElement = {
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
};
