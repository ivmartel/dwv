/**
 * Data writer.
 */
export class DataWriter {

  /**
   * Is the endianness Little Endian.
   *
   * @type {boolean}
   */
  #isLittleEndian = true;

  /**
   * The main data view.
   *
   * @type {DataView}
   */
  #view;

  /**
   * @param {ArrayBuffer} buffer The input array buffer.
   * @param {boolean} [isLittleEndian] Flag to tell if the data is
   *   little or big endian.
   */
  constructor(buffer, isLittleEndian) {
    // Set endian flag if not defined.
    if (typeof isLittleEndian !== 'undefined') {
      this.#isLittleEndian = isLittleEndian;
    }
    this.#view = new DataView(buffer);
  }

  /**
   * Write Uint8 data.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {number} value The data to write.
   * @returns {number} The new offset position.
   */
  writeUint8(byteOffset, value) {
    this.#view.setUint8(byteOffset, value);
    return byteOffset + Uint8Array.BYTES_PER_ELEMENT;
  }

  /**
   * Write Int8 data.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {number} value The data to write.
   * @returns {number} The new offset position.
   */
  writeInt8(byteOffset, value) {
    this.#view.setInt8(byteOffset, value);
    return byteOffset + Int8Array.BYTES_PER_ELEMENT;
  }

  /**
   * Write Uint16 data.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {number} value The data to write.
   * @returns {number} The new offset position.
   */
  writeUint16(byteOffset, value) {
    this.#view.setUint16(byteOffset, value, this.#isLittleEndian);
    return byteOffset + Uint16Array.BYTES_PER_ELEMENT;
  }

  /**
   * Write Int16 data.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {number} value The data to write.
   * @returns {number} The new offset position.
   */
  writeInt16(byteOffset, value) {
    this.#view.setInt16(byteOffset, value, this.#isLittleEndian);
    return byteOffset + Int16Array.BYTES_PER_ELEMENT;
  }

  /**
   * Write Uint32 data.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {number} value The data to write.
   * @returns {number} The new offset position.
   */
  writeUint32(byteOffset, value) {
    this.#view.setUint32(byteOffset, value, this.#isLittleEndian);
    return byteOffset + Uint32Array.BYTES_PER_ELEMENT;
  }

  /**
   * Write Uint64 data.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {bigint} value The data to write.
   * @returns {number} The new offset position.
   */
  writeUint64(byteOffset, value) {
    this.#view.setBigUint64(byteOffset, value, this.#isLittleEndian);
    return byteOffset + BigUint64Array.BYTES_PER_ELEMENT;
  }

  /**
   * Write Int32 data.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {number} value The data to write.
   * @returns {number} The new offset position.
   */
  writeInt32(byteOffset, value) {
    this.#view.setInt32(byteOffset, value, this.#isLittleEndian);
    return byteOffset + Int32Array.BYTES_PER_ELEMENT;
  }

  /**
   * Write Int64 data.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {bigint} value The data to write.
   * @returns {number} The new offset position.
   */
  writeInt64(byteOffset, value) {
    this.#view.setBigInt64(byteOffset, value, this.#isLittleEndian);
    return byteOffset + BigInt64Array.BYTES_PER_ELEMENT;
  }

  /**
   * Write Float32 data.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {number} value The data to write.
   * @returns {number} The new offset position.
   */
  writeFloat32(byteOffset, value) {
    this.#view.setFloat32(byteOffset, value, this.#isLittleEndian);
    return byteOffset + Float32Array.BYTES_PER_ELEMENT;
  }

  /**
   * Write Float64 data.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {number} value The data to write.
   * @returns {number} The new offset position.
   */
  writeFloat64(byteOffset, value) {
    this.#view.setFloat64(byteOffset, value, this.#isLittleEndian);
    return byteOffset + Float64Array.BYTES_PER_ELEMENT;
  }

  /**
   * Write string data of length 4 as hexadecimal (no '0x' prefix).
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {string} str The hexadecimal string to write ('####').
   * @returns {number} The new offset position.
   */
  writeHex(byteOffset, str) {
    // remove first two chars and parse
    const value = parseInt(str, 16);
    this.#view.setUint16(byteOffset, value, this.#isLittleEndian);
    return byteOffset + Uint16Array.BYTES_PER_ELEMENT;
  }

  /**
   * Write a boolean array as binary.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {Array} array The array to write.
   * @returns {number} The new offset position.
   */
  writeBinaryArray(byteOffset, array) {
    if (array.length % 8 !== 0) {
      throw new Error('Cannot write boolean array as binary.');
    }
    let byte = null;
    let val = null;
    for (let i = 0, len = array.length; i < len; i += 8) {
      byte = 0;
      for (let j = 0; j < 8; ++j) {
        val = array[i + j] === 0 ? 0 : 1;
        byte += val << j;
      }
      byteOffset = this.writeUint8(byteOffset, byte);
    }
    return byteOffset;
  }

  /**
   * Write Uint8 array.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {Array|Uint8Array} array The array to write.
   * @returns {number} The new offset position.
   */
  writeUint8Array(byteOffset, array) {
    for (let i = 0, len = array.length; i < len; ++i) {
      byteOffset = this.writeUint8(byteOffset, array[i]);
    }
    return byteOffset;
  }

  /**
   * Write Int8 array.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {Array} array The array to write.
   * @returns {number} The new offset position.
   */
  writeInt8Array(byteOffset, array) {
    for (let i = 0, len = array.length; i < len; ++i) {
      byteOffset = this.writeInt8(byteOffset, array[i]);
    }
    return byteOffset;
  }

  /**
   * Write Uint16 array.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {Array} array The array to write.
   * @returns {number} The new offset position.
   */
  writeUint16Array(byteOffset, array) {
    for (let i = 0, len = array.length; i < len; ++i) {
      byteOffset = this.writeUint16(byteOffset, array[i]);
    }
    return byteOffset;
  }

  /**
   * Write Int16 array.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {Array} array The array to write.
   * @returns {number} The new offset position.
   */
  writeInt16Array(byteOffset, array) {
    for (let i = 0, len = array.length; i < len; ++i) {
      byteOffset = this.writeInt16(byteOffset, array[i]);
    }
    return byteOffset;
  }

  /**
   * Write Uint32 array.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {Array} array The array to write.
   * @returns {number} The new offset position.
   */
  writeUint32Array(byteOffset, array) {
    for (let i = 0, len = array.length; i < len; ++i) {
      byteOffset = this.writeUint32(byteOffset, array[i]);
    }
    return byteOffset;
  }

  /**
   * Write Uint64 array.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {Array} array The array to write.
   * @returns {number} The new offset position.
   */
  writeUint64Array(byteOffset, array) {
    for (let i = 0, len = array.length; i < len; ++i) {
      byteOffset = this.writeUint64(byteOffset, array[i]);
    }
    return byteOffset;
  }

  /**
   * Write Int32 array.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {Array} array The array to write.
   * @returns {number} The new offset position.
   */
  writeInt32Array(byteOffset, array) {
    for (let i = 0, len = array.length; i < len; ++i) {
      byteOffset = this.writeInt32(byteOffset, array[i]);
    }
    return byteOffset;
  }

  /**
   * Write Int64 array.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {Array} array The array to write.
   * @returns {number} The new offset position.
   */
  writeInt64Array(byteOffset, array) {
    for (let i = 0, len = array.length; i < len; ++i) {
      byteOffset = this.writeInt64(byteOffset, array[i]);
    }
    return byteOffset;
  }

  /**
   * Write Float32 array.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {Array} array The array to write.
   * @returns {number} The new offset position.
   */
  writeFloat32Array(byteOffset, array) {
    for (let i = 0, len = array.length; i < len; ++i) {
      byteOffset = this.writeFloat32(byteOffset, array[i]);
    }
    return byteOffset;
  }

  /**
   * Write Float64 array.
   *
   * @param {number} byteOffset The offset to start writing from.
   * @param {Array} array The array to write.
   * @returns {number} The new offset position.
   */
  writeFloat64Array(byteOffset, array) {
    for (let i = 0, len = array.length; i < len; ++i) {
      byteOffset = this.writeFloat64(byteOffset, array[i]);
    }
    return byteOffset;
  }

} // class DataWriter
