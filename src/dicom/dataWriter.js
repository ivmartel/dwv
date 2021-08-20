// namespaces
var dwv = dwv || {};
dwv.dicom = dwv.dicom || {};

/**
 * Data writer.
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

  // Default text encoder
  var defaultTextEncoder = {};
  defaultTextEncoder.encode = function (buffer) {
    var result = new Uint8Array(buffer.length);
    for (var i = 0, leni = buffer.length; i < leni; ++i) {
      result[i] = buffer.charCodeAt(i);
    }
    return result;
  };

  // Text encoder
  var textEncoder = defaultTextEncoder;
  if (typeof window.TextEncoder !== 'undefined') {
    textEncoder = new TextEncoder('iso-8859-1');
  }

  /**
   * Set the utfLabel used to construct the TextEncoder.
   *
   * @param {string} label The encoding label.
   */
  this.setUtfLabel = function (label) {
    if (typeof window.TextEncoder !== 'undefined') {
      textEncoder = new TextEncoder(label);
    }
  };

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
    var data = defaultTextEncoder.encode(str);
    return this.writeUint8Array(byteOffset, data);
  };

  /**
   * Write data as a 'special' string, encoding it if the
   *   TextEncoder is available.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} str The data to write.
   * @returns {number} The new offset position.
   */
  this.writeSpecialString = function (byteOffset, str) {
    var data = textEncoder.encode(str);
    return this.writeUint8Array(byteOffset, data);
  };

}; // class DataWriter

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
