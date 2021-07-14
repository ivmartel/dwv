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
  return '1.2.826.0.1.3680043.9.7278.1.';
};

/**
 * Get a UID for a DICOM tag.
 *
 * @see http://dicom.nema.org/dicom/2013/output/chtml/part05/chapter_9.html
 * @see http://dicomiseasy.blogspot.com/2011/12/chapter-4-dicom-objects-in-chapter-3.html
 * @see https://stackoverflow.com/questions/46304306/how-to-generate-unique-dicom-uid
 * @param {string} tagName The input tag.
 * @returns {string} The corresponding UID.
 */
dwv.dicom.getUID = function (tagName) {
  var uid = dwv.dicom.getDwvUIDPrefix();
  if (tagName === 'ImplementationClassUID') {
    uid += dwv.getVersion();
  } else if (tagName === 'SOPInstanceUID') {
    for (var i = 0; i < tagName.length; ++i) {
      uid += tagName.charCodeAt(i);
    }
    // add date (only numbers)
    uid += '.' + (new Date()).toISOString().replace(/\D/g, '');
  } else {
    throw new Error('Don\'t know how to generate a UID for the tag ' + tagName);
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
 * Is the input VR a non string VR.
 *
 * @param {string} vr The element VR.
 * @returns {boolean} True if the VR is a non string one.
 */
dwv.dicom.isNonStringVr = function (vr) {
  return vr === 'UN' || vr === 'OB' || vr === 'OW' ||
        vr === 'OF' || vr === 'OD' || vr === 'US' || vr === 'SS' ||
        vr === 'UL' || vr === 'SL' || vr === 'FL' || vr === 'FD' ||
        vr === 'SQ' || vr === 'AT';
};

/**
 * Is the input VR a string VR.
 *
 * @param {string} vr The element VR.
 * @returns {boolean} True if the VR is a string one.
 */
dwv.dicom.isStringVr = function (vr) {
  return !dwv.dicom.isNonStringVr(vr);
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
 * @param {object} value The value to pad.
 * @returns {string} The padded value.
 */
dwv.dicom.padElementValue = function (element, value) {
  if (typeof value !== 'undefined' && typeof value.length !== 'undefined') {
    if (dwv.dicom.isVrToPad(element.vr) && !dwv.dicom.isEven(value.length)) {
      if (value instanceof Array) {
        value[value.length - 1] += dwv.dicom.getVrPad(element.vr);
      } else {
        value += dwv.dicom.getVrPad(element.vr);
      }
    }
  }
  return value;
};

/**
 * Data writer.
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
 * @param {Array} buffer The input array buffer.
 * @param {boolean} isLittleEndian Flag to tell if the data is
 *   little or big endian.
 */
dwv.dicom.DataWriter = function (buffer, isLittleEndian) {
  // Set endian flag if not defined.
  if (typeof isLittleEndian === 'undefined') {
    isLittleEndian = true;
  }

  // private DataView
  var view = new DataView(buffer);

  // flag to use VR=UN for private sequences, default to false
  // (mainly used in tests)
  this.useUnVrForPrivateSq = false;

  /**
   * Write Uint8 data.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {number} value The data to write.
   * @returns {number} The new offset position.
   */
  this.writeUint8 = function (byteOffset, value) {
    view.setUint8(byteOffset, value);
    return byteOffset + Uint8Array.BYTES_PER_ELEMENT;
  };

  /**
   * Write Int8 data.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {number} value The data to write.
   * @returns {number} The new offset position.
   */
  this.writeInt8 = function (byteOffset, value) {
    view.setInt8(byteOffset, value);
    return byteOffset + Int8Array.BYTES_PER_ELEMENT;
  };

  /**
   * Write Uint16 data.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {number} value The data to write.
   * @returns {number} The new offset position.
   */
  this.writeUint16 = function (byteOffset, value) {
    view.setUint16(byteOffset, value, isLittleEndian);
    return byteOffset + Uint16Array.BYTES_PER_ELEMENT;
  };

  /**
   * Write Int16 data.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {number} value The data to write.
   * @returns {number} The new offset position.
   */
  this.writeInt16 = function (byteOffset, value) {
    view.setInt16(byteOffset, value, isLittleEndian);
    return byteOffset + Int16Array.BYTES_PER_ELEMENT;
  };

  /**
   * Write Uint32 data.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {number} value The data to write.
   * @returns {number} The new offset position.
   */
  this.writeUint32 = function (byteOffset, value) {
    view.setUint32(byteOffset, value, isLittleEndian);
    return byteOffset + Uint32Array.BYTES_PER_ELEMENT;
  };

  /**
   * Write Int32 data.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {number} value The data to write.
   * @returns {number} The new offset position.
   */
  this.writeInt32 = function (byteOffset, value) {
    view.setInt32(byteOffset, value, isLittleEndian);
    return byteOffset + Int32Array.BYTES_PER_ELEMENT;
  };

  /**
   * Write Float32 data.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {number} value The data to write.
   * @returns {number} The new offset position.
   */
  this.writeFloat32 = function (byteOffset, value) {
    view.setFloat32(byteOffset, value, isLittleEndian);
    return byteOffset + Float32Array.BYTES_PER_ELEMENT;
  };

  /**
   * Write Float64 data.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {number} value The data to write.
   * @returns {number} The new offset position.
   */
  this.writeFloat64 = function (byteOffset, value) {
    view.setFloat64(byteOffset, value, isLittleEndian);
    return byteOffset + Float64Array.BYTES_PER_ELEMENT;
  };

  /**
   * Write string data as hexadecimal.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {number} str The padded hexadecimal string to write ('0x####').
   * @returns {number} The new offset position.
   */
  this.writeHex = function (byteOffset, str) {
    // remove first two chars and parse
    var value = parseInt(str.substr(2), 16);
    view.setUint16(byteOffset, value, isLittleEndian);
    return byteOffset + Uint16Array.BYTES_PER_ELEMENT;
  };

  /**
   * Write string data.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {number} str The data to write.
   * @returns {number} The new offset position.
   */
  this.writeString = function (byteOffset, str) {
    for (var i = 0, len = str.length; i < len; ++i) {
      view.setUint8(byteOffset, str.charCodeAt(i));
      byteOffset += Uint8Array.BYTES_PER_ELEMENT;
    }
    return byteOffset;
  };

};

/**
 * Write a boolean array as binary.
 *
 * @param {number} byteOffset The offset to start writing from.
 * @param {Array} array The array to write.
 * @returns {number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeBinaryArray = function (byteOffset, array) {
  if (array.length % 8 !== 0) {
    throw new Error('Cannot write boolean array as binary.');
  }
  var byte = null;
  var val = null;
  for (var i = 0, len = array.length; i < len; i += 8) {
    byte = 0;
    for (var j = 0; j < 8; ++j) {
      val = array[i + j] === 0 ? 0 : 1;
      byte += val << j;
    }
    byteOffset = this.writeUint8(byteOffset, byte);
  }
  return byteOffset;
};

/**
 * Write Uint8 array.
 *
 * @param {number} byteOffset The offset to start writing from.
 * @param {Array} array The array to write.
 * @returns {number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeUint8Array = function (byteOffset, array) {
  for (var i = 0, len = array.length; i < len; ++i) {
    byteOffset = this.writeUint8(byteOffset, array[i]);
  }
  return byteOffset;
};

/**
 * Write Int8 array.
 *
 * @param {number} byteOffset The offset to start writing from.
 * @param {Array} array The array to write.
 * @returns {number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeInt8Array = function (byteOffset, array) {
  for (var i = 0, len = array.length; i < len; ++i) {
    byteOffset = this.writeInt8(byteOffset, array[i]);
  }
  return byteOffset;
};

/**
 * Write Uint16 array.
 *
 * @param {number} byteOffset The offset to start writing from.
 * @param {Array} array The array to write.
 * @returns {number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeUint16Array = function (byteOffset, array) {
  for (var i = 0, len = array.length; i < len; ++i) {
    byteOffset = this.writeUint16(byteOffset, array[i]);
  }
  return byteOffset;
};

/**
 * Write Int16 array.
 *
 * @param {number} byteOffset The offset to start writing from.
 * @param {Array} array The array to write.
 * @returns {number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeInt16Array = function (byteOffset, array) {
  for (var i = 0, len = array.length; i < len; ++i) {
    byteOffset = this.writeInt16(byteOffset, array[i]);
  }
  return byteOffset;
};

/**
 * Write Uint32 array.
 *
 * @param {number} byteOffset The offset to start writing from.
 * @param {Array} array The array to write.
 * @returns {number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeUint32Array = function (byteOffset, array) {
  for (var i = 0, len = array.length; i < len; ++i) {
    byteOffset = this.writeUint32(byteOffset, array[i]);
  }
  return byteOffset;
};

/**
 * Write Int32 array.
 *
 * @param {number} byteOffset The offset to start writing from.
 * @param {Array} array The array to write.
 * @returns {number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeInt32Array = function (byteOffset, array) {
  for (var i = 0, len = array.length; i < len; ++i) {
    byteOffset = this.writeInt32(byteOffset, array[i]);
  }
  return byteOffset;
};

/**
 * Write Float32 array.
 *
 * @param {number} byteOffset The offset to start writing from.
 * @param {Array} array The array to write.
 * @returns {number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeFloat32Array = function (
  byteOffset, array) {
  for (var i = 0, len = array.length; i < len; ++i) {
    byteOffset = this.writeFloat32(byteOffset, array[i]);
  }
  return byteOffset;
};

/**
 * Write Float64 array.
 *
 * @param {number} byteOffset The offset to start writing from.
 * @param {Array} array The array to write.
 * @returns {number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeFloat64Array = function (
  byteOffset, array) {
  for (var i = 0, len = array.length; i < len; ++i) {
    byteOffset = this.writeFloat64(byteOffset, array[i]);
  }
  return byteOffset;
};

/**
 * Write string array.
 *
 * @param {number} byteOffset The offset to start writing from.
 * @param {Array} array The array to write.
 * @returns {number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeStringArray = function (byteOffset, array) {
  for (var i = 0, len = array.length; i < len; ++i) {
    // separator
    if (i !== 0) {
      byteOffset = this.writeString(byteOffset, '\\');
    }
    // value
    byteOffset = this.writeString(byteOffset, array[i].toString());
  }
  return byteOffset;
};

/**
 * Write a list of items.
 *
 * @param {number} byteOffset The offset to start writing from.
 * @param {Array} items The list of items to write.
 * @param {boolean} isImplicit Is the DICOM VR implicit?
 * @returns {number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeDataElementItems = function (
  byteOffset, items, isImplicit) {
  var item = null;
  for (var i = 0; i < items.length; ++i) {
    item = items[i];
    var itemKeys = Object.keys(item);
    if (itemKeys.length === 0) {
      continue;
    }
    // item element (create new to not modify original)
    var implicitLength = item.xFFFEE000.vl === 'u/l';
    var itemElement = {
      tag: item.xFFFEE000.tag,
      vr: item.xFFFEE000.vr,
      vl: implicitLength ? 0xffffffff : item.xFFFEE000.vl,
      value: []
    };
    byteOffset = this.writeDataElement(itemElement, byteOffset, isImplicit);
    // write rest
    for (var m = 0; m < itemKeys.length; ++m) {
      if (itemKeys[m] !== 'xFFFEE000' && itemKeys[m] !== 'xFFFEE00D') {
        byteOffset = this.writeDataElement(
          item[itemKeys[m]], byteOffset, isImplicit);
      }
    }
    // item delimitation
    if (implicitLength) {
      var itemDelimElement = {
        tag: {
          group: '0xFFFE',
          element: '0xE00D',
          name: 'ItemDelimitationItem'
        },
        vr: 'NONE',
        vl: 0,
        value: []
      };
      byteOffset = this.writeDataElement(
        itemDelimElement, byteOffset, isImplicit);
    }
  }

  // return new offset
  return byteOffset;
};

/**
 * Write data with a specific Value Representation (VR).
 *
 * @param {string} vr The data Value Representation (VR).
 * @param {string} vl The data Value Length (VL).
 * @param {number} byteOffset The offset to start writing from.
 * @param {Array} value The array to write.
 * @param {boolean} isImplicit Is the DICOM VR implicit?
 * @returns {number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeDataElementValue = function (
  vr, vl, byteOffset, value, isImplicit) {
  // first check input type to know how to write
  if (value instanceof Uint8Array) {
    // binary data has been expanded 8 times at read
    if (value.length === 8 * vl) {
      byteOffset = this.writeBinaryArray(byteOffset, value);
    } else {
      byteOffset = this.writeUint8Array(byteOffset, value);
    }
  } else if (value instanceof Int8Array) {
    byteOffset = this.writeInt8Array(byteOffset, value);
  } else if (value instanceof Uint16Array) {
    byteOffset = this.writeUint16Array(byteOffset, value);
  } else if (value instanceof Int16Array) {
    byteOffset = this.writeInt16Array(byteOffset, value);
  } else if (value instanceof Uint32Array) {
    byteOffset = this.writeUint32Array(byteOffset, value);
  } else if (value instanceof Int32Array) {
    byteOffset = this.writeInt32Array(byteOffset, value);
  } else {
    // switch according to VR if input type is undefined
    if (vr === 'UN') {
      byteOffset = this.writeUint8Array(byteOffset, value);
    } else if (vr === 'OB') {
      byteOffset = this.writeInt8Array(byteOffset, value);
    } else if (vr === 'OW') {
      byteOffset = this.writeInt16Array(byteOffset, value);
    } else if (vr === 'OF') {
      byteOffset = this.writeInt32Array(byteOffset, value);
    } else if (vr === 'OD') {
      byteOffset = this.writeInt64Array(byteOffset, value);
    } else if (vr === 'US') {
      byteOffset = this.writeUint16Array(byteOffset, value);
    } else if (vr === 'SS') {
      byteOffset = this.writeInt16Array(byteOffset, value);
    } else if (vr === 'UL') {
      byteOffset = this.writeUint32Array(byteOffset, value);
    } else if (vr === 'SL') {
      byteOffset = this.writeInt32Array(byteOffset, value);
    } else if (vr === 'FL') {
      byteOffset = this.writeFloat32Array(byteOffset, value);
    } else if (vr === 'FD') {
      byteOffset = this.writeFloat64Array(byteOffset, value);
    } else if (vr === 'SQ') {
      byteOffset = this.writeDataElementItems(byteOffset, value, isImplicit);
    } else if (vr === 'AT') {
      for (var i = 0; i < value.length; ++i) {
        var hexString = value[i] + '';
        var hexString1 = hexString.substring(1, 5);
        var hexString2 = hexString.substring(6, 10);
        var dec1 = parseInt(hexString1, 16);
        var dec2 = parseInt(hexString2, 16);
        var atValue = new Uint16Array([dec1, dec2]);
        byteOffset = this.writeUint16Array(byteOffset, atValue);
      }
    } else {
      byteOffset = this.writeStringArray(byteOffset, value);
    }
  }
  // return new offset
  return byteOffset;
};

/**
 * Write a pixel data element.
 *
 * @param {string} vr The data Value Representation (VR).
 * @param {string} vl The data Value Length (VL).
 * @param {number} byteOffset The offset to start writing from.
 * @param {Array} value The array to write.
 * @param {boolean} isImplicit Is the DICOM VR implicit?
 * @returns {number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writePixelDataElementValue = function (
  vr, vl, byteOffset, value, isImplicit) {
  // explicit length
  if (vl !== 'u/l') {
    var finalValue = value[0];
    // flatten multi frame
    if (value.length > 1) {
      finalValue = dwv.dicom.flattenArrayOfTypedArrays(value);
    }
    // write
    byteOffset = this.writeDataElementValue(
      vr, vl, byteOffset, finalValue, isImplicit);
  } else {
    // pixel data as sequence
    var item = {};
    // first item: basic offset table
    item.xFFFEE000 = {
      tag: {
        group: '0xFFFE',
        element: '0xE000',
        name: 'xFFFEE000'
      },
      vr: 'UN',
      vl: 0,
      value: []
    };
    // data
    for (var i = 0; i < value.length; ++i) {
      item[i] = {
        tag: {
          group: '0xFFFE',
          element: '0xE000',
          name: 'xFFFEE000'
        },
        vr: vr,
        vl: value[i].length,
        value: value[i]
      };
    }
    // write
    byteOffset = this.writeDataElementItems(byteOffset, [item], isImplicit);
  }

  // return new offset
  return byteOffset;
};

/**
 * Write a data element.
 *
 * @param {object} element The DICOM data element to write.
 * @param {number} byteOffset The offset to start writing from.
 * @param {boolean} isImplicit Is the DICOM VR implicit?
 * @returns {number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeDataElement = function (
  element, byteOffset, isImplicit) {
  var isTagWithVR = new dwv.dicom.Tag(
    element.tag.group, element.tag.element).isWithVR();
  var is32bitVLVR = (isImplicit || !isTagWithVR)
    ? true : dwv.dicom.is32bitVLVR(element.vr);
  // group
  byteOffset = this.writeHex(byteOffset, element.tag.group);
  // element
  byteOffset = this.writeHex(byteOffset, element.tag.element);
  // VR
  var vr = element.vr;
  // use VR=UN for private sequence
  if (this.useUnVrForPrivateSq &&
    new dwv.dicom.Tag(element.tag.group, element.tag.element).isPrivate() &&
    vr === 'SQ') {
    dwv.logger.warn('Write element using VR=UN for private sequence.');
    vr = 'UN';
  }
  if (isTagWithVR && !isImplicit) {
    byteOffset = this.writeString(byteOffset, vr);
    // reserved 2 bytes for 32bit VL
    if (is32bitVLVR) {
      byteOffset += 2;
    }
  }

  // update vl for sequence or item with implicit length
  var vl = element.vl;
  if (dwv.dicom.isImplicitLengthSequence(element) ||
        dwv.dicom.isImplicitLengthItem(element) ||
        dwv.dicom.isImplicitLengthPixels(element)) {
    vl = 0xffffffff;
  }
  // VL
  if (is32bitVLVR) {
    byteOffset = this.writeUint32(byteOffset, vl);
  } else {
    byteOffset = this.writeUint16(byteOffset, vl);
  }

  // value
  var value = element.value;
  // check value
  if (typeof value === 'undefined') {
    value = [];
  }
  // write
  if (element.tag.name === 'x7FE00010') {
    byteOffset = this.writePixelDataElementValue(
      element.vr, element.vl, byteOffset, value, isImplicit);
  } else {
    byteOffset = this.writeDataElementValue(
      element.vr, element.vl, byteOffset, value, isImplicit);
  }

  // sequence delimitation item for sequence with implicit length
  if (dwv.dicom.isImplicitLengthSequence(element) ||
         dwv.dicom.isImplicitLengthPixels(element)) {
    var seqDelimElement = {
      tag: {
        group: '0xFFFE',
        element: '0xE0DD',
        name: 'SequenceDelimitationItem'
      },
      vr: 'NONE',
      vl: 0,
      value: []
    };
    byteOffset = this.writeDataElement(seqDelimElement, byteOffset, isImplicit);
  }

  // return new offset
  return byteOffset;
};

/**
 * Is this element an implicit length sequence?
 *
 * @param {object} element The element to check.
 * @returns {boolean} True if it is.
 */
dwv.dicom.isImplicitLengthSequence = function (element) {
  // sequence with no length
  return (element.vr === 'SQ') &&
        (element.vl === 'u/l');
};

/**
 * Is this element an implicit length item?
 *
 * @param {object} element The element to check.
 * @returns {boolean} True if it is.
 */
dwv.dicom.isImplicitLengthItem = function (element) {
  // item with no length
  return (element.tag.name === 'xFFFEE000') &&
        (element.vl === 'u/l');
};

/**
 * Is this element an implicit length pixel data?
 *
 * @param {object} element The element to check.
 * @returns {boolean} True if it is.
 */
dwv.dicom.isImplicitLengthPixels = function (element) {
  // pixel data with no length
  return (element.tag.name === 'x7FE00010') &&
        (element.vl === 'u/l');
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
 * DICOM writer.
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
      item.value[0] = '';
      item.vl = 0;
      item.endOffset = item.startOffset;
      return item;
    },
    replace: function (item, value) {
      var paddedValue = dwv.dicom.padElementValue(item, value);
      item.value[0] = paddedValue;
      item.vl = paddedValue.length;
      item.endOffset = item.startOffset + paddedValue.length;
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
    var tag = new dwv.dicom.Tag(element.tag.group, element.tag.element);
    var groupName = tag.getGroupName();
    var tagName = tag.getNameFromDictionary();

    // apply rules:
    var rule;
    if (typeof this.rules[element.tag.name] !== 'undefined') {
      // 1. tag itself
      rule = this.rules[element.tag.name];
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
 * Get the ArrayBuffer corresponding to input DICOM elements.
 *
 * @param {Array} dicomElements The wrapped elements to write.
 * @returns {ArrayBuffer} The elements as a buffer.
 */
dwv.dicom.DicomWriter.prototype.getBuffer = function (dicomElements) {
  // array keys
  var keys = Object.keys(dicomElements);

  // transfer syntax
  var syntax = dwv.dicom.cleanString(dicomElements.x00020010.value[0]);
  var isImplicit = dwv.dicom.isImplicitTransferSyntax(syntax);
  var isBigEndian = dwv.dicom.isBigEndianTransferSyntax(syntax);

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
  for (var i = 0, leni = keys.length; i < leni; ++i) {
    element = this.getElementToWrite(dicomElements[keys[i]]);
    if (element !== null &&
       !fmiglTag.equals2(element.tag) &&
       !icUIDTag.equals2(element.tag) &&
       !ivnTag.equals2(element.tag)) {
      localSize = 0;

      // XB7 2020-04-17
      // Check if UN can be converted to correct VR.
      // This check must be done BEFORE calculating totalSize,
      // otherwise there may be extra null bytes at the end of the file
      // (dcmdump may crash because of these bytes)
      dwv.dicom.checkUnknownVR(element);

      // tag group name (remove first 0)
      groupName = dwv.dicom.TagGroups[element.tag.group.substr(1)];

      // prefix
      if (groupName === 'Meta Element') {
        localSize += dwv.dicom.getDataElementPrefixByteSize(element.vr, false);
      } else {
        localSize += dwv.dicom.getDataElementPrefixByteSize(
          element.vr, isImplicit);
      }

      // value
      var realVl = element.endOffset - element.startOffset;
      localSize += parseInt(realVl, 10);

      // add size of pixel sequence delimitation items
      if (dwv.dicom.isImplicitLengthPixels(element)) {
        localSize += dwv.dicom.getDataElementPrefixByteSize('NONE', isImplicit);
      }

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
  icUIDSize += dwv.dicom.setElementValue(
    icUID, dwv.dicom.getUID('ImplementationClassUID'), false);
  metaElements.push(icUID);
  metaLength += icUIDSize;
  totalSize += icUIDSize;
  // ImplementationVersionName
  var ivn = dwv.dicom.getDicomElement('ImplementationVersionName');
  var ivnSize = dwv.dicom.getDataElementPrefixByteSize(ivn.vr, isImplicit);
  var ivnValue = 'DWV_' + dwv.getVersion();
  ivnSize += dwv.dicom.setElementValue(ivn, ivnValue, false);
  metaElements.push(ivn);
  metaLength += ivnSize;
  totalSize += ivnSize;

  // create the FileMetaInformationGroupLength element
  var fmigl = dwv.dicom.getDicomElement('FileMetaInformationGroupLength');
  var fmiglSize = dwv.dicom.getDataElementPrefixByteSize(fmigl.vr, isImplicit);
  fmiglSize += dwv.dicom.setElementValue(fmigl, metaLength, false);

  // add its size to the total one
  totalSize += fmiglSize;

  // create buffer
  var buffer = new ArrayBuffer(totalSize);
  var metaWriter = new dwv.dicom.DataWriter(buffer);
  var dataWriter = new dwv.dicom.DataWriter(buffer, !isBigEndian);
  var offset = 128;
  // DICM
  offset = metaWriter.writeString(offset, 'DICM');
  // FileMetaInformationGroupLength
  offset = metaWriter.writeDataElement(fmigl, offset, false);
  // write meta
  for (var j = 0, lenj = metaElements.length; j < lenj; ++j) {
    offset = metaWriter.writeDataElement(metaElements[j], offset, false);
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
    offset = dataWriter.writeDataElement(rawElements[k], offset, isImplicit);
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
    var tag = dwv.dicom.Tag(element.tag.group, element.tag.element);
    var dictVr = tag.getVrFromDictionary();
    if (dictVr !== null && element.vr !== dictVr) {
      element.vr = dictVr;
      dwv.logger.info('Element ' + element.tag.group +
        ' ' + element.tag.element +
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
  // return element definition
  return {
    tag: {group: tag.getGroup(), element: tag.getElement()},
    vr: tag.getVrFromDictionary()
  };
};

/**
 * Set a DICOM element value according to its VR (Value Representation).
 *
 * @param {object} element The DICOM element to set the value.
 * @param {object} value The value to set.
 * @param {boolean} isImplicit Does the data use implicit VR?
 * @returns {number} The total element size.
 */
dwv.dicom.setElementValue = function (element, value, isImplicit) {
  // byte size of the element
  var size = 0;
  // special sequence case
  if (element.vr === 'SQ') {

    // set the value
    element.value = value;
    element.vl = 0;

    if (value !== null && value !== 0) {
      var sqItems = [];
      var name;

      // explicit or implicit length
      var explicitLength = true;
      if (typeof value.explicitLength !== 'undefined') {
        explicitLength = value.explicitLength;
        delete value.explicitLength;
      }

      // items
      var itemData;
      var itemKeys = Object.keys(value);
      for (var i = 0, leni = itemKeys.length; i < leni; ++i) {
        var itemElements = {};
        var subSize = 0;
        itemData = value[itemKeys[i]];

        // check data
        if (itemData === null || itemData === 0) {
          continue;
        }

        // elements
        var subElement;
        var elemKeys = Object.keys(itemData);
        for (var j = 0, lenj = elemKeys.length; j < lenj; ++j) {
          subElement = dwv.dicom.getDicomElement(elemKeys[j]);
          subSize += dwv.dicom.setElementValue(
            subElement, itemData[elemKeys[j]]);

          name = new dwv.dicom.Tag(
            subElement.tag.group, subElement.tag.element).getKey();
          itemElements[name] = subElement;
          subSize += dwv.dicom.getDataElementPrefixByteSize(
            subElement.vr, isImplicit);
        }

        // item (after elements to get the size)
        var itemElement = {
          tag: {group: '0xFFFE', element: '0xE000'},
          vr: 'NONE',
          vl: (explicitLength ? subSize : 'u/l'),
          value: []
        };
        name = new dwv.dicom.Tag(
          itemElement.tag.group, itemElement.tag.element).getKey();
        itemElements[name] = itemElement;
        subSize += dwv.dicom.getDataElementPrefixByteSize('NONE', isImplicit);

        // item delimitation
        if (!explicitLength) {
          var itemDelimElement = {
            tag: {group: '0xFFFE', element: '0xE00D'},
            vr: 'NONE',
            vl: 0,
            value: []
          };
          name = new dwv.dicom.Tag(
            itemDelimElement.tag.group, itemDelimElement.tag.element).getKey();
          itemElements[name] = itemDelimElement;
          subSize += dwv.dicom.getDataElementPrefixByteSize('NONE', isImplicit);
        }

        size += subSize;
        sqItems.push(itemElements);
      }

      // add sequence delimitation size
      if (!explicitLength) {
        size += dwv.dicom.getDataElementPrefixByteSize('NONE', isImplicit);
      }

      element.value = sqItems;
      if (explicitLength) {
        element.vl = size;
      } else {
        element.vl = 'u/l';
      }
    }
  } else {
    // set the value and calculate size
    size = 0;
    var paddedValue = dwv.dicom.padElementValue(element, value);
    if (value instanceof Array) {
      element.value = paddedValue;
      for (var k = 0; k < paddedValue.length; ++k) {
        // spearator
        if (k !== 0) {
          size += 1;
        }
        // value
        size += paddedValue[k].toString().length;
      }
    } else {
      element.value = [paddedValue];
      if (typeof paddedValue !== 'undefined' &&
        typeof paddedValue.length !== 'undefined') {
        size = paddedValue.length;
      } else {
        // numbers
        size = 1;
      }
    }

    // convert size to bytes
    if (element.vr === 'US' || element.vr === 'OW') {
      size *= Uint16Array.BYTES_PER_ELEMENT;
    } else if (element.vr === 'SS') {
      size *= Int16Array.BYTES_PER_ELEMENT;
    } else if (element.vr === 'UL') {
      size *= Uint32Array.BYTES_PER_ELEMENT;
    } else if (element.vr === 'SL') {
      size *= Int32Array.BYTES_PER_ELEMENT;
    } else if (element.vr === 'FL') {
      size *= Float32Array.BYTES_PER_ELEMENT;
    } else if (element.vr === 'FD') {
      size *= Float64Array.BYTES_PER_ELEMENT;
    } else {
      size *= Uint8Array.BYTES_PER_ELEMENT;
    }
    element.vl = size;
  }

  // return the size of that data
  return size;
};
