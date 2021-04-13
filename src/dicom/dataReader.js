// namespaces
var dwv = dwv || {};
dwv.dicom = dwv.dicom || {};

/**
 * Is the Native endianness Little Endian.
 *
 * @type {boolean}
 */
dwv.dicom.isNativeLittleEndian = function () {
  return new Int8Array(new Int16Array([1]).buffer)[0] > 0;
};

/**
 * Flip an array's endianness.
 * Inspired from [DataStream.js]{@link https://github.com/kig/DataStream.js}.
 *
 * @param {object} array The array to flip (modified).
 */
dwv.dicom.flipArrayEndianness = function (array) {
  var blen = array.byteLength;
  var u8 = new Uint8Array(array.buffer, array.byteOffset, blen);
  var bpe = array.BYTES_PER_ELEMENT;
  var tmp;
  for (var i = 0; i < blen; i += bpe) {
    for (var j = i + bpe - 1, k = i; j > k; j--, k++) {
      tmp = u8[k];
      u8[k] = u8[j];
      u8[j] = tmp;
    }
  }
};

/**
 * Data reader.
 *
 * @class
 * @param {Array} buffer The input array buffer.
 * @param {boolean} isLittleEndian Flag to tell if the data is little
 *   or big endian.
 */
dwv.dicom.DataReader = function (buffer, isLittleEndian) {
  // Set endian flag if not defined.
  if (typeof isLittleEndian === 'undefined') {
    isLittleEndian = true;
  }

  // Default text decoder
  var defaultTextDecoder = {};
  defaultTextDecoder.decode = function (buffer) {
    var result = '';
    for (var i = 0, leni = buffer.length; i < leni; ++i) {
      result += String.fromCharCode(buffer[i]);
    }
    return result;
  };

  // Text decoder
  var textDecoder = defaultTextDecoder;
  if (typeof window.TextDecoder !== 'undefined') {
    textDecoder = new TextDecoder('iso-8859-1');
  }

  /**
   * Set the utfLabel used to construct the TextDecoder.
   *
   * @param {string} label The encoding label.
   */
  this.setUtfLabel = function (label) {
    if (typeof window.TextDecoder !== 'undefined') {
      textDecoder = new TextDecoder(label);
    }
  };

  /**
   * Is the Native endianness Little Endian.
   *
   * @private
   * @type {boolean}
   */
  var isNativeLittleEndian = dwv.dicom.isNativeLittleEndian();

  /**
   * Flag to know if the TypedArray data needs flipping.
   *
   * @private
   * @type {boolean}
   */
  var needFlip = (isLittleEndian !== isNativeLittleEndian);

  /**
   * The main data view.
   *
   * @private
   * @type {DataView}
   */
  var view = new DataView(buffer);

  /**
   * Read Uint16 (2 bytes) data.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @returns {number} The read data.
   */
  this.readUint16 = function (byteOffset) {
    return view.getUint16(byteOffset, isLittleEndian);
  };

  /**
   * Read Uint32 (4 bytes) data.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @returns {number} The read data.
   */
  this.readUint32 = function (byteOffset) {
    return view.getUint32(byteOffset, isLittleEndian);
  };

  /**
   * Read Int32 (4 bytes) data.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @returns {number} The read data.
   */
  this.readInt32 = function (byteOffset) {
    return view.getInt32(byteOffset, isLittleEndian);
  };

  /**
   * Read Float32 (4 bytes) data.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @returns {number} The read data.
   */
  this.readFloat32 = function (byteOffset) {
    return view.getFloat32(byteOffset, isLittleEndian);
  };

  /**
   * Read Float64 (8 bytes) data.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @returns {number} The read data.
   */
  this.readFloat64 = function (byteOffset) {
    return view.getFloat64(byteOffset, isLittleEndian);
  };

  /**
   * Read Uint8 array.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} size The size of the array.
   * @returns {Array} The read data.
   */
  this.readUint8Array = function (byteOffset, size) {
    return new Uint8Array(buffer, byteOffset, size);
  };

  /**
   * Read Int8 array.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} size The size of the array.
   * @returns {Array} The read data.
   */
  this.readInt8Array = function (byteOffset, size) {
    return new Int8Array(buffer, byteOffset, size);
  };

  /**
   * Read Uint16 array.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} size The size of the array.
   * @returns {Array} The read data.
   */
  this.readUint16Array = function (byteOffset, size) {
    var bpe = Uint16Array.BYTES_PER_ELEMENT;
    var arraySize = size / bpe;
    var data = null;
    // byteOffset should be a multiple of Uint16Array.BYTES_PER_ELEMENT (=2)
    if (byteOffset % bpe === 0) {
      data = new Uint16Array(buffer, byteOffset, arraySize);
      if (needFlip) {
        dwv.dicom.flipArrayEndianness(data);
      }
    } else {
      data = new Uint16Array(arraySize);
      for (var i = 0; i < arraySize; ++i) {
        data[i] = this.readUint16(byteOffset + bpe * i);
      }
    }
    return data;
  };

  /**
   * Read Int16 array.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} size The size of the array.
   * @returns {Array} The read data.
   */
  this.readInt16Array = function (byteOffset, size) {
    var bpe = Int16Array.BYTES_PER_ELEMENT;
    var arraySize = size / bpe;
    var data = null;
    // byteOffset should be a multiple of Int16Array.BYTES_PER_ELEMENT (=2)
    if (byteOffset % bpe === 0) {
      data = new Int16Array(buffer, byteOffset, arraySize);
      if (needFlip) {
        dwv.dicom.flipArrayEndianness(data);
      }
    } else {
      data = new Int16Array(arraySize);
      for (var i = 0; i < arraySize; ++i) {
        data[i] = this.readInt16(byteOffset + bpe * i);
      }
    }
    return data;
  };

  /**
   * Read Uint32 array.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} size The size of the array.
   * @returns {Array} The read data.
   */
  this.readUint32Array = function (byteOffset, size) {
    var bpe = Uint32Array.BYTES_PER_ELEMENT;
    var arraySize = size / bpe;
    var data = null;
    // byteOffset should be a multiple of Uint32Array.BYTES_PER_ELEMENT (=4)
    if (byteOffset % bpe === 0) {
      data = new Uint32Array(buffer, byteOffset, arraySize);
      if (needFlip) {
        dwv.dicom.flipArrayEndianness(data);
      }
    } else {
      data = new Uint32Array(arraySize);
      for (var i = 0; i < arraySize; ++i) {
        data[i] = this.readUint32(byteOffset + bpe * i);
      }
    }
    return data;
  };

  /**
   * Read Int32 array.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} size The size of the array.
   * @returns {Array} The read data.
   */
  this.readInt32Array = function (byteOffset, size) {
    var bpe = Int32Array.BYTES_PER_ELEMENT;
    var arraySize = size / bpe;
    var data = null;
    // byteOffset should be a multiple of Int32Array.BYTES_PER_ELEMENT (=4)
    if (byteOffset % bpe === 0) {
      data = new Int32Array(buffer, byteOffset, arraySize);
      if (needFlip) {
        dwv.dicom.flipArrayEndianness(data);
      }
    } else {
      data = new Int32Array(arraySize);
      for (var i = 0; i < arraySize; ++i) {
        data[i] = this.readInt32(byteOffset + bpe * i);
      }
    }
    return data;
  };

  /**
   * Read Float32 array.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} size The size of the array.
   * @returns {Array} The read data.
   */
  this.readFloat32Array = function (byteOffset, size) {
    var bpe = Float32Array.BYTES_PER_ELEMENT;
    var arraySize = size / bpe;
    var data = null;
    // byteOffset should be a multiple of Float32Array.BYTES_PER_ELEMENT (=4)
    if (byteOffset % bpe === 0) {
      data = new Float32Array(buffer, byteOffset, arraySize);
      if (needFlip) {
        dwv.dicom.flipArrayEndianness(data);
      }
    } else {
      data = new Float32Array(arraySize);
      for (var i = 0; i < arraySize; ++i) {
        data[i] = this.readFloat32(byteOffset + bpe * i);
      }
    }
    return data;
  };

  /**
   * Read Float64 array.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} size The size of the array.
   * @returns {Array} The read data.
   */
  this.readFloat64Array = function (byteOffset, size) {
    var bpe = Float64Array.BYTES_PER_ELEMENT;
    var arraySize = size / bpe;
    var data = null;
    // byteOffset should be a multiple of Float64Array.BYTES_PER_ELEMENT (=8)
    if (byteOffset % bpe === 0) {
      data = new Float64Array(buffer, byteOffset, arraySize);
      if (needFlip) {
        dwv.dicom.flipArrayEndianness(data);
      }
    } else {
      data = new Float64Array(arraySize);
      for (var i = 0; i < arraySize; ++i) {
        data[i] = this.readFloat64(byteOffset + bpe * i);
      }
    }
    return data;
  };

  /**
   * Read data as a string.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} nChars The number of characters to read.
   * @returns {string} The read data.
   */
  this.readString = function (byteOffset, nChars) {
    var data = this.readUint8Array(byteOffset, nChars);
    return defaultTextDecoder.decode(data);
  };

  /**
   * Read data as a 'special' string, decoding it if the
   *   TextDecoder is available.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} nChars The number of characters to read.
   * @returns {string} The read data.
   */
  this.readSpecialString = function (byteOffset, nChars) {
    var data = this.readUint8Array(byteOffset, nChars);
    return textDecoder.decode(data);
  };

}; // class DataReader

/**
 * Read data as an hexadecimal string.
 *
 * @param {number} byteOffset The offset to start reading from.
 * @returns {Array} The read data.
 */
dwv.dicom.DataReader.prototype.readHex = function (byteOffset) {
  // read and convert to hex string
  var str = this.readUint16(byteOffset).toString(16);
  // return padded
  return '0x0000'.substr(0, 6 - str.length) + str.toUpperCase();
};
