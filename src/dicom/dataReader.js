/**
 * Is the Native endianness Little Endian.
 *
 * @type {boolean}
 */
export function isNativeLittleEndian() {
  return new Int8Array(new Int16Array([1]).buffer)[0] > 0;
}

/**
 * Flip an array's endianness.
 * Inspired from [DataStream.js]{@link https://github.com/kig/DataStream.js}.
 *
 * @param {object} array The array to flip (modified).
 */
function flipArrayEndianness(array) {
  const blen = array.byteLength;
  const u8 = new Uint8Array(array.buffer, array.byteOffset, blen);
  const bpe = array.BYTES_PER_ELEMENT;
  let tmp;
  for (let i = 0; i < blen; i += bpe) {
    for (let j = i + bpe - 1, k = i; j > k; j--, k++) {
      tmp = u8[k];
      u8[k] = u8[j];
      u8[j] = tmp;
    }
  }
}

/**
 * Data reader.
 */
export class DataReader {

  /**
   * The input buffer.
   *
   * @private
   * @type {Array}
   */
  #buffer;

  /**
   * Is the endianness Little Endian.
   *
   * @private
   * @type {boolean}
   */
  #isLittleEndian = true;

  /**
   * Is the Native endianness Little Endian.
   *
   * @private
   * @type {boolean}
   */
  #isNativeLittleEndian = isNativeLittleEndian();

  /**
   * Flag to know if the TypedArray data needs flipping.
   *
   * @private
   * @type {boolean}
   */
  #needFlip;

  /**
   * The main data view.
   *
   * @private
   * @type {DataView}
   */
  #view;

  /**
   * @param {Array} buffer The input array buffer.
   * @param {boolean} isLittleEndian Flag to tell if the data is little
   *   or big endian.
   */
  constructor(buffer, isLittleEndian) {
    this.#buffer = buffer;
    // Set endian flag if not defined.
    if (typeof isLittleEndian !== 'undefined') {
      this.#isLittleEndian = isLittleEndian;
    }
    this.#needFlip = (this.#isLittleEndian !== this.#isNativeLittleEndian);
    this.#view = new DataView(buffer);
  }

  /**
   * Read Uint16 (2 bytes) data.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @returns {number} The read data.
   */
  readUint16(byteOffset) {
    return this.#view.getUint16(byteOffset, this.#isLittleEndian);
  }

  /**
   * Read Int16 (2 bytes) data.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @returns {number} The read data.
   */
  readInt16(byteOffset) {
    return this.#view.getInt16(byteOffset, this.#isLittleEndian);
  }

  /**
   * Read Uint32 (4 bytes) data.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @returns {number} The read data.
   */
  readUint32(byteOffset) {
    return this.#view.getUint32(byteOffset, this.#isLittleEndian);
  }

  /**
   * Read BigUint64 (8 bytes) data.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @returns {number} The read data.
   */
  readBigUint64(byteOffset) {
    return this.#view.getBigUint64(byteOffset, this.#isLittleEndian);
  }

  /**
   * Read Int32 (4 bytes) data.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @returns {number} The read data.
   */
  readInt32(byteOffset) {
    return this.#view.getInt32(byteOffset, this.#isLittleEndian);
  }

  /**
   * Read BigInt64 (8 bytes) data.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @returns {number} The read data.
   */
  readBigInt64(byteOffset) {
    return this.#view.getBigInt64(byteOffset, this.#isLittleEndian);
  }

  /**
   * Read Float32 (4 bytes) data.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @returns {number} The read data.
   */
  readFloat32(byteOffset) {
    return this.#view.getFloat32(byteOffset, this.#isLittleEndian);
  }

  /**
   * Read Float64 (8 bytes) data.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @returns {number} The read data.
   */
  readFloat64(byteOffset) {
    return this.#view.getFloat64(byteOffset, this.#isLittleEndian);
  }

  /**
   * Read binary (0/1) array.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} size The size of the array.
   * @returns {Array} The read data.
   */
  readBinaryArray(byteOffset, size) {
    // input
    const bitArray = new Uint8Array(this.#buffer, byteOffset, size);
    // result
    const byteArrayLength = 8 * bitArray.length;
    const data = new Uint8Array(byteArrayLength);
    let bitNumber = 0;
    let bitIndex = 0;
    for (let i = 0; i < byteArrayLength; ++i) {
      bitNumber = i % 8;
      bitIndex = Math.floor(i / 8);
      // see https://stackoverflow.com/questions/4854207/get-a-specific-bit-from-byte/4854257
      data[i] = 255 * ((bitArray[bitIndex] & (1 << bitNumber)) !== 0);
    }
    return data;
  }

  /**
   * Read Uint8 array.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} size The size of the array.
   * @returns {Array} The read data.
   */
  readUint8Array(byteOffset, size) {
    return new Uint8Array(this.#buffer, byteOffset, size);
  }

  /**
   * Read Int8 array.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} size The size of the array.
   * @returns {Array} The read data.
   */
  readInt8Array(byteOffset, size) {
    return new Int8Array(this.#buffer, byteOffset, size);
  }

  /**
   * Read Uint16 array.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} size The size of the array.
   * @returns {Array} The read data.
   */
  readUint16Array(byteOffset, size) {
    const bpe = Uint16Array.BYTES_PER_ELEMENT;
    const arraySize = size / bpe;
    let data = null;
    // byteOffset should be a multiple of Uint16Array.BYTES_PER_ELEMENT (=2)
    if (byteOffset % bpe === 0) {
      data = new Uint16Array(this.#buffer, byteOffset, arraySize);
      if (this.#needFlip) {
        flipArrayEndianness(data);
      }
    } else {
      data = new Uint16Array(arraySize);
      for (let i = 0; i < arraySize; ++i) {
        data[i] = this.readUint16(byteOffset + bpe * i);
      }
    }
    return data;
  }

  /**
   * Read Int16 array.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} size The size of the array.
   * @returns {Array} The read data.
   */
  readInt16Array(byteOffset, size) {
    const bpe = Int16Array.BYTES_PER_ELEMENT;
    const arraySize = size / bpe;
    let data = null;
    // byteOffset should be a multiple of Int16Array.BYTES_PER_ELEMENT (=2)
    if (byteOffset % bpe === 0) {
      data = new Int16Array(this.#buffer, byteOffset, arraySize);
      if (this.#needFlip) {
        flipArrayEndianness(data);
      }
    } else {
      data = new Int16Array(arraySize);
      for (let i = 0; i < arraySize; ++i) {
        data[i] = this.readInt16(byteOffset + bpe * i);
      }
    }
    return data;
  }

  /**
   * Read Uint32 array.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} size The size of the array.
   * @returns {Array} The read data.
   */
  readUint32Array(byteOffset, size) {
    const bpe = Uint32Array.BYTES_PER_ELEMENT;
    const arraySize = size / bpe;
    let data = null;
    // byteOffset should be a multiple of Uint32Array.BYTES_PER_ELEMENT (=4)
    if (byteOffset % bpe === 0) {
      data = new Uint32Array(this.#buffer, byteOffset, arraySize);
      if (this.#needFlip) {
        flipArrayEndianness(data);
      }
    } else {
      data = new Uint32Array(arraySize);
      for (let i = 0; i < arraySize; ++i) {
        data[i] = this.readUint32(byteOffset + bpe * i);
      }
    }
    return data;
  }

  /**
   * Read Uint64 array.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} size The size of the array.
   * @returns {Array} The read data.
   */
  readUint64Array(byteOffset, size) {
    const bpe = BigUint64Array.BYTES_PER_ELEMENT;
    const arraySize = size / bpe;
    let data = null;
    // byteOffset should be a multiple of BigUint64Array.BYTES_PER_ELEMENT (=8)
    if (byteOffset % bpe === 0) {
      data = new BigUint64Array(this.#buffer, byteOffset, arraySize);
      if (this.#needFlip) {
        flipArrayEndianness(data);
      }
    } else {
      data = new BigUint64Array(arraySize);
      for (let i = 0; i < arraySize; ++i) {
        data[i] = this.readBigUint64(byteOffset + bpe * i);
      }
    }
    return data;
  }

  /**
   * Read Int32 array.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} size The size of the array.
   * @returns {Array} The read data.
   */
  readInt32Array(byteOffset, size) {
    const bpe = Int32Array.BYTES_PER_ELEMENT;
    const arraySize = size / bpe;
    let data = null;
    // byteOffset should be a multiple of Int32Array.BYTES_PER_ELEMENT (=4)
    if (byteOffset % bpe === 0) {
      data = new Int32Array(this.#buffer, byteOffset, arraySize);
      if (this.#needFlip) {
        flipArrayEndianness(data);
      }
    } else {
      data = new Int32Array(arraySize);
      for (let i = 0; i < arraySize; ++i) {
        data[i] = this.readInt32(byteOffset + bpe * i);
      }
    }
    return data;
  }

  /**
   * Read Int64 array.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} size The size of the array.
   * @returns {Array} The read data.
   */
  readInt64Array(byteOffset, size) {
    const bpe = BigInt64Array.BYTES_PER_ELEMENT;
    const arraySize = size / bpe;
    let data = null;
    // byteOffset should be a multiple of BigInt64Array.BYTES_PER_ELEMENT (=8)
    if (byteOffset % bpe === 0) {
      data = new BigInt64Array(this.#buffer, byteOffset, arraySize);
      if (this.#needFlip) {
        flipArrayEndianness(data);
      }
    } else {
      data = new BigInt64Array(arraySize);
      for (let i = 0; i < arraySize; ++i) {
        data[i] = this.readBigInt64(byteOffset + bpe * i);
      }
    }
    return data;
  }

  /**
   * Read Float32 array.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} size The size of the array.
   * @returns {Array} The read data.
   */
  readFloat32Array(byteOffset, size) {
    const bpe = Float32Array.BYTES_PER_ELEMENT;
    const arraySize = size / bpe;
    let data = null;
    // byteOffset should be a multiple of Float32Array.BYTES_PER_ELEMENT (=4)
    if (byteOffset % bpe === 0) {
      data = new Float32Array(this.#buffer, byteOffset, arraySize);
      if (this.#needFlip) {
        flipArrayEndianness(data);
      }
    } else {
      data = new Float32Array(arraySize);
      for (let i = 0; i < arraySize; ++i) {
        data[i] = this.readFloat32(byteOffset + bpe * i);
      }
    }
    return data;
  }

  /**
   * Read Float64 array.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @param {number} size The size of the array.
   * @returns {Array} The read data.
   */
  readFloat64Array(byteOffset, size) {
    const bpe = Float64Array.BYTES_PER_ELEMENT;
    const arraySize = size / bpe;
    let data = null;
    // byteOffset should be a multiple of Float64Array.BYTES_PER_ELEMENT (=8)
    if (byteOffset % bpe === 0) {
      data = new Float64Array(this.#buffer, byteOffset, arraySize);
      if (this.#needFlip) {
        flipArrayEndianness(data);
      }
    } else {
      data = new Float64Array(arraySize);
      for (let i = 0; i < arraySize; ++i) {
        data[i] = this.readFloat64(byteOffset + bpe * i);
      }
    }
    return data;
  }

  /**
   * Read data as an hexadecimal string.
   *
   * @param {number} byteOffset The offset to start reading from.
   * @returns {Array} The read data.
   */
  readHex(byteOffset) {
    // read and convert to hex string
    const str = this.readUint16(byteOffset).toString(16);
    // return padded
    return '0x0000'.substring(0, 6 - str.length) + str.toUpperCase();
  }

} // class DataReader
