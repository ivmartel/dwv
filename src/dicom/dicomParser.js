// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.dicom = dwv.dicom || {};

/**
 * Get the version of the library.
 * @return {String} The version of the library.
 */
dwv.getVersion = function () { return "0.27.0-beta"; };

/**
 * Clean string: trim and remove ending.
 * @param {String} inputStr The string to clean.
 * @return {String} The cleaned string.
 */
dwv.dicom.cleanString = function (inputStr)
{
    var res = inputStr;
    if ( inputStr ) {
        // trim spaces
        res = inputStr.trim();
        // get rid of ending zero-width space (u200B)
        if ( res[res.length-1] === String.fromCharCode("u200B") ) {
            res = res.substring(0, res.length-1);
        }
    }
    return res;
};

/**
 * Is the Native endianness Little Endian.
 * @type Boolean
 */
dwv.dicom.isNativeLittleEndian = function ()
{
    return new Int8Array(new Int16Array([1]).buffer)[0] > 0;
};

/**
 * Get the utfLabel (used by the TextDecoder) from a character set term
 * References:
 * - DICOM [Value Encoding]{@link http://dicom.nema.org/dicom/2013/output/chtml/part05/chapter_6.html}
 * - DICOM [Specific Character Set]{@link http://dicom.nema.org/dicom/2013/output/chtml/part03/sect_C.12.html#sect_C.12.1.1.2}
 * - [TextDecoder#Parameters]{@link https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder/TextDecoder#Parameters}
 */
dwv.dicom.getUtfLabel = function (charSetTerm)
{
    var label = "utf-8";
    if (charSetTerm === "ISO_IR 100" ) {
        label = "iso-8859-1";
    }
    else if (charSetTerm === "ISO_IR 101" ) {
        label = "iso-8859-2";
    }
    else if (charSetTerm === "ISO_IR 109" ) {
        label = "iso-8859-3";
    }
    else if (charSetTerm === "ISO_IR 110" ) {
        label = "iso-8859-4";
    }
    else if (charSetTerm === "ISO_IR 144" ) {
        label = "iso-8859-5";
    }
    else if (charSetTerm === "ISO_IR 127" ) {
        label = "iso-8859-6";
    }
    else if (charSetTerm === "ISO_IR 126" ) {
        label = "iso-8859-7";
    }
    else if (charSetTerm === "ISO_IR 138" ) {
        label = "iso-8859-8";
    }
    else if (charSetTerm === "ISO_IR 148" ) {
        label = "iso-8859-9";
    }
    else if (charSetTerm === "ISO_IR 13" ) {
        label = "shift-jis";
    }
    else if (charSetTerm === "ISO_IR 166" ) {
        label = "iso-8859-11";
    }
    else if (charSetTerm === "ISO 2022 IR 87" ) {
        label = "iso-2022-jp";
    }
    else if (charSetTerm === "ISO 2022 IR 149" ) {
        // not supported by TextDecoder when it says it should...
        //label = "iso-2022-kr";
    }
    else if (charSetTerm === "ISO 2022 IR 58") {
        // not supported by TextDecoder...
        //label = "iso-2022-cn";
    }
    else if (charSetTerm === "ISO_IR 192" ) {
        label = "utf-8";
    }
    else if (charSetTerm === "GB18030" ) {
        label = "gb18030";
    }
    else if (charSetTerm === "GB2312" ) {
        label = "gb2312";
    }
    else if (charSetTerm === "GBK" ) {
        label = "chinese";
    }
    return label;
};

/**
 * Data reader.
 * @constructor
 * @param {Array} buffer The input array buffer.
 * @param {Boolean} isLittleEndian Flag to tell if the data is little or big endian.
 */
dwv.dicom.DataReader = function (buffer, isLittleEndian)
{
    // Set endian flag if not defined.
    if ( typeof isLittleEndian === 'undefined' ) {
        isLittleEndian = true;
    }

    // Default text decoder
    var defaultTextDecoder = {};
    defaultTextDecoder.decode = function (buffer) {
        var result = "";
        for ( var i = 0, leni = buffer.length; i < leni; ++i ) {
            result += String.fromCharCode( buffer[ i ] );
        }
        return result;
    };
    // Text decoder
    var textDecoder = defaultTextDecoder;
    if (typeof window.TextDecoder !== "undefined") {
        textDecoder = new TextDecoder("iso-8859-1");
    }

    /**
     * Set the utfLabel used to construct the TextDecoder.
     * @param {String} label The encoding label.
     */
    this.setUtfLabel = function (label) {
        if (typeof window.TextDecoder !== "undefined") {
            textDecoder = new TextDecoder(label);
        }
    };

    /**
     * Is the Native endianness Little Endian.
     * @private
     * @type Boolean
     */
    var isNativeLittleEndian = dwv.dicom.isNativeLittleEndian();

    /**
     * Flag to know if the TypedArray data needs flipping.
     * @private
     * @type Boolean
     */
    var needFlip = (isLittleEndian !== isNativeLittleEndian);

    /**
     * The main data view.
     * @private
     * @type DataView
     */
    var view = new DataView(buffer);

    /**
     * Flip an array's endianness.
     * Inspired from [DataStream.js]{@link https://github.com/kig/DataStream.js}.
     * @param {Object} array The array to flip (modified).
     */
    this.flipArrayEndianness = function (array) {
       var blen = array.byteLength;
       var u8 = new Uint8Array(array.buffer, array.byteOffset, blen);
       var bpel = array.BYTES_PER_ELEMENT;
       var tmp;
       for ( var i = 0; i < blen; i += bpel ) {
         for ( var j = i + bpel - 1, k = i; j > k; j--, k++ ) {
           tmp = u8[k];
           u8[k] = u8[j];
           u8[j] = tmp;
         }
       }
    };

    /**
     * Read Uint16 (2 bytes) data.
     * @param {Number} byteOffset The offset to start reading from.
     * @return {Number} The read data.
     */
    this.readUint16 = function (byteOffset) {
        return view.getUint16(byteOffset, isLittleEndian);
    };
    /**
     * Read Uint32 (4 bytes) data.
     * @param {Number} byteOffset The offset to start reading from.
     * @return {Number} The read data.
     */
    this.readUint32 = function (byteOffset) {
        return view.getUint32(byteOffset, isLittleEndian);
    };
    /**
     * Read Int32 (4 bytes) data.
     * @param {Number} byteOffset The offset to start reading from.
     * @return {Number} The read data.
     */
    this.readInt32 = function (byteOffset) {
        return view.getInt32(byteOffset, isLittleEndian);
    };
    /**
     * Read Uint8 array.
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readUint8Array = function (byteOffset, size) {
        return new Uint8Array(buffer, byteOffset, size);
    };
    /**
     * Read Int8 array.
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readInt8Array = function (byteOffset, size) {
        return new Int8Array(buffer, byteOffset, size);
    };
    /**
     * Read Uint16 array.
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readUint16Array = function (byteOffset, size) {
        var arraySize = size / Uint16Array.BYTES_PER_ELEMENT;
        var data = null;
        // byteOffset should be a multiple of Uint16Array.BYTES_PER_ELEMENT (=2)
        if ( (byteOffset % Uint16Array.BYTES_PER_ELEMENT) === 0 ) {
            data = new Uint16Array(buffer, byteOffset, arraySize);
            if ( needFlip ) {
                this.flipArrayEndianness(data);
            }
        }
        else {
            data = new Uint16Array(arraySize);
            for ( var i = 0; i < arraySize; ++i ) {
                data[i] = view.getUint16( (byteOffset +
                    Uint16Array.BYTES_PER_ELEMENT * i),
                    isLittleEndian);
            }
        }
        return data;
    };
    /**
     * Read Int16 array.
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readInt16Array = function (byteOffset, size) {
        var arraySize = size / Int16Array.BYTES_PER_ELEMENT;
        var data = null;
        // byteOffset should be a multiple of Int16Array.BYTES_PER_ELEMENT (=2)
        if ( (byteOffset % Int16Array.BYTES_PER_ELEMENT) === 0 ) {
            data = new Int16Array(buffer, byteOffset, arraySize);
            if ( needFlip ) {
                this.flipArrayEndianness(data);
            }
        }
        else {
            data = new Int16Array(arraySize);
            for ( var i = 0; i < arraySize; ++i ) {
                data[i] = view.getInt16( (byteOffset +
                    Int16Array.BYTES_PER_ELEMENT * i),
                    isLittleEndian);
            }
        }
        return data;
    };
    /**
     * Read Uint32 array.
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readUint32Array = function (byteOffset, size) {
        var arraySize = size / Uint32Array.BYTES_PER_ELEMENT;
        var data = null;
        // byteOffset should be a multiple of Uint32Array.BYTES_PER_ELEMENT (=4)
        if ( (byteOffset % Uint32Array.BYTES_PER_ELEMENT) === 0 ) {
            data = new Uint32Array(buffer, byteOffset, arraySize);
            if ( needFlip ) {
                this.flipArrayEndianness(data);
            }
        }
        else {
            data = new Uint32Array(arraySize);
            for ( var i = 0; i < arraySize; ++i ) {
                data[i] = view.getUint32( (byteOffset +
                    Uint32Array.BYTES_PER_ELEMENT * i),
                    isLittleEndian);
            }
        }
        return data;
    };
    /**
     * Read Int32 array.
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readInt32Array = function (byteOffset, size) {
        var arraySize = size / Int32Array.BYTES_PER_ELEMENT;
        var data = null;
        // byteOffset should be a multiple of Int32Array.BYTES_PER_ELEMENT (=4)
        if ( (byteOffset % Int32Array.BYTES_PER_ELEMENT) === 0 ) {
            data = new Int32Array(buffer, byteOffset, arraySize);
            if ( needFlip ) {
                this.flipArrayEndianness(data);
            }
        }
        else {
            data = new Int32Array(arraySize);
            for ( var i = 0; i < arraySize; ++i ) {
                data[i] = view.getInt32( (byteOffset +
                    Int32Array.BYTES_PER_ELEMENT * i),
                    isLittleEndian);
            }
        }
        return data;
    };
    /**
     * Read Float32 array.
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readFloat32Array = function (byteOffset, size) {
        var arraySize = size / Float32Array.BYTES_PER_ELEMENT;
        var data = null;
        // byteOffset should be a multiple of Float32Array.BYTES_PER_ELEMENT (=4)
        if ( (byteOffset % Float32Array.BYTES_PER_ELEMENT) === 0 ) {
            data = new Float32Array(buffer, byteOffset, arraySize);
            if ( needFlip ) {
                this.flipArrayEndianness(data);
            }
        }
        else {
            data = new Float32Array(arraySize);
            for ( var i = 0; i < arraySize; ++i ) {
                data[i] = view.getFloat32( (byteOffset +
                    Float32Array.BYTES_PER_ELEMENT * i),
                    isLittleEndian);
            }
        }
        return data;
    };
    /**
     * Read Float64 array.
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readFloat64Array = function (byteOffset, size) {
        var arraySize = size / Float64Array.BYTES_PER_ELEMENT;
        var data = null;
        // byteOffset should be a multiple of Float64Array.BYTES_PER_ELEMENT (=8)
        if ( (byteOffset % Float64Array.BYTES_PER_ELEMENT) === 0 ) {
            data = new Float64Array(buffer, byteOffset, arraySize);
            if ( needFlip ) {
                this.flipArrayEndianness(data);
            }
        }
        else {
            data = new Float64Array(arraySize);
            for ( var i = 0; i < arraySize; ++i ) {
                data[i] = view.getFloat64( (byteOffset +
                    Float64Array.BYTES_PER_ELEMENT*i),
                    isLittleEndian);
            }
        }
        return data;
    };
    /**
     * Read data as an hexadecimal string.
     * @param {Number} byteOffset The offset to start reading from.
     * @return {Array} The read data.
     */
    this.readHex = function (byteOffset) {
        // read and convert to hex string
        var str = this.readUint16(byteOffset).toString(16);
        // return padded
        return "0x0000".substr(0, 6 - str.length) + str.toUpperCase();
    };

    /**
     * Read data as a string.
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} nChars The number of characters to read.
     * @return {String} The read data.
     */
    this.readString = function (byteOffset, nChars) {
        var data = this.readUint8Array(byteOffset, nChars);
        return defaultTextDecoder.decode(data);
    };

    /**
     * Read data as a 'special' string, decoding it if the TextDecoder is available.
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} nChars The number of characters to read.
     * @return {String} The read data.
     */
    this.readSpecialString = function (byteOffset, nChars) {
        var data = this.readUint8Array(byteOffset, nChars);
        return textDecoder.decode(data);
    };

};

/**
 * Get the group-element pair from a tag string name.
 * @param {String} tagName The tag string name.
 * @return {Object} group-element pair.
 */
dwv.dicom.getGroupElementFromName = function (tagName)
{
    var group = null;
    var element = null;
    var dict = dwv.dicom.dictionary;
    var keys0 = Object.keys(dict);
    var keys1 = null;
    // label for nested loop break
    outLabel:
    // search through dictionary
    for ( var k0 = 0, lenK0 = keys0.length; k0 < lenK0; ++k0 ) {
        group = keys0[k0];
        keys1 = Object.keys( dict[group] );
        for ( var k1 = 0, lenK1 = keys1.length; k1 < lenK1; ++k1 ) {
            element = keys1[k1];
            if ( dict[group][element][2] === tagName ) {
                break outLabel;
            }
        }
    }
    return { 'group': group, 'element': element };
};

/**
 * Immutable tag.
 * @constructor
 * @param {String} group The tag group.
 * @param {String} element The tag element.
 */
dwv.dicom.Tag = function (group, element)
{
    /**
     * Get the tag group.
     * @return {String} The tag group.
     */
    this.getGroup = function () { return group; };
    /**
     * Get the tag element.
     * @return {String} The tag element.
     */
    this.getElement = function () { return element; };
}; // Tag class

/**
 * Check for Tag equality.
 * @param {Object} rhs The other tag to compare to.
 * @return {Boolean} True if both tags are equal.
 */
dwv.dicom.Tag.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getGroup() === rhs.getGroup() &&
        this.getElement() === rhs.getElement();
};

/**
 * Check for Tag equality.
 * @param {Object} rhs The other tag to compare to provided as a simple object.
 * @return {Boolean} True if both tags are equal.
 */
dwv.dicom.Tag.prototype.equals2 = function (rhs) {
    if (rhs === null ||
        typeof rhs.group === "undefined" ||
        typeof rhs.element === "undefined" ) {
            return false;
    }
    return this.equals(new dwv.dicom.Tag(rhs.group, rhs.element));
};

// Get the FileMetaInformationGroupLength Tag.
dwv.dicom.getFileMetaInformationGroupLengthTag = function () {
    return new dwv.dicom.Tag("0x0002", "0x0000");
};
// Get the Item Tag.
dwv.dicom.getItemTag = function () {
    return new dwv.dicom.Tag("0xFFFE", "0xE000");
};
// Get the ItemDelimitationItem Tag.
dwv.dicom.getItemDelimitationItemTag = function () {
    return new dwv.dicom.Tag("0xFFFE", "0xE00D");
};
// Get the SequenceDelimitationItem Tag.
dwv.dicom.getSequenceDelimitationItemTag = function () {
    return new dwv.dicom.Tag("0xFFFE", "0xE0DD");
};
// Get the PixelData Tag.
dwv.dicom.getPixelDataTag = function () {
    return new dwv.dicom.Tag("0x7FE0", "0x0010");
};

/**
 * Get the group-element key used to store DICOM elements.
 * @param {Number} group The DICOM group.
 * @param {Number} element The DICOM element.
 * @return {String} The key.
 */
dwv.dicom.getGroupElementKey = function (group, element)
{
    return 'x' + group.substr(2,6) + element.substr(2,6);
};

/**
 * Split a group-element key used to store DICOM elements.
 * @param {String} key The key in form "x00280102.
 * @return {Object} The DICOM group and element.
 */
dwv.dicom.splitGroupElementKey = function (key)
{
    return {'group': key.substr(1,4), 'element': key.substr(5,8) };
};

/**
 * Get patient orientation label in the reverse direction.
 * @param {String} ori Patient Orientation value.
 * @return {String} Reverse Orientation Label.
 */
dwv.dicom.getReverseOrientation = function (ori)
{
    if (!ori) {
        return null;
    }
    // reverse labels
    var rlabels = {
        "L": "R",
        "R": "L",
        "A": "P",
        "P": "A",
        "H": "F",
        "F": "H"
    };

    var rori = "";
    for (var n=0; n<ori.length; n++) {
        var o = ori.substr(n,1);
        var r = rlabels[o];
        if (r){
            rori += r;
        }
    }
    // return
    return rori;
};

/**
 * Tell if a given syntax is an implicit one (element with no VR).
 * @param {String} syntax The transfer syntax to test.
 * @return {Boolean} True if an implicit syntax.
 */
dwv.dicom.isImplicitTransferSyntax = function (syntax)
{
    return syntax === "1.2.840.10008.1.2";
};

/**
 * Tell if a given syntax is a big endian syntax.
 * @param {String} syntax The transfer syntax to test.
 * @return {Boolean} True if a big endian syntax.
 */
dwv.dicom.isBigEndianTransferSyntax = function (syntax)
{
    return syntax === "1.2.840.10008.1.2.2";
};

/**
 * Tell if a given syntax is a JPEG baseline one.
 * @param {String} syntax The transfer syntax to test.
 * @return {Boolean} True if a jpeg baseline syntax.
 */
dwv.dicom.isJpegBaselineTransferSyntax = function (syntax)
{
    return syntax === "1.2.840.10008.1.2.4.50" ||
        syntax === "1.2.840.10008.1.2.4.51";
};

/**
 * Tell if a given syntax is a retired JPEG one.
 * @param {String} syntax The transfer syntax to test.
 * @return {Boolean} True if a retired jpeg syntax.
 */
dwv.dicom.isJpegRetiredTransferSyntax = function (syntax)
{
    return ( syntax.match(/1.2.840.10008.1.2.4.5/) !== null &&
        !dwv.dicom.isJpegBaselineTransferSyntax() &&
        !dwv.dicom.isJpegLosslessTransferSyntax() ) ||
        syntax.match(/1.2.840.10008.1.2.4.6/) !== null;
};

/**
 * Tell if a given syntax is a JPEG Lossless one.
 * @param {String} syntax The transfer syntax to test.
 * @return {Boolean} True if a jpeg lossless syntax.
 */
dwv.dicom.isJpegLosslessTransferSyntax = function (syntax)
{
    return syntax === "1.2.840.10008.1.2.4.57" ||
        syntax === "1.2.840.10008.1.2.4.70";
};

/**
 * Tell if a given syntax is a JPEG-LS one.
 * @param {String} syntax The transfer syntax to test.
 * @return {Boolean} True if a jpeg-ls syntax.
 */
dwv.dicom.isJpeglsTransferSyntax = function (syntax)
{
    return syntax.match(/1.2.840.10008.1.2.4.8/) !== null;
};

/**
 * Tell if a given syntax is a JPEG 2000 one.
 * @param {String} syntax The transfer syntax to test.
 * @return {Boolean} True if a jpeg 2000 syntax.
 */
dwv.dicom.isJpeg2000TransferSyntax = function (syntax)
{
    return syntax.match(/1.2.840.10008.1.2.4.9/) !== null;
};

/**
 * Tell if a given syntax is a RLE (Run-length encoding) one.
 * @param {String} syntax The transfer syntax to test.
 * @return {Boolean} True if a RLE syntax.
 */
dwv.dicom.isRleTransferSyntax = function (syntax)
{
    return syntax.match(/1.2.840.10008.1.2.5/) !== null;
};

/**
 * Tell if a given syntax needs decompression.
 * @param {String} syntax The transfer syntax to test.
 * @return {String} The name of the decompression algorithm.
 */
dwv.dicom.getSyntaxDecompressionName = function (syntax)
{
    var algo = null;
    if ( dwv.dicom.isJpeg2000TransferSyntax(syntax) ) {
        algo = "jpeg2000";
    }
    else if ( dwv.dicom.isJpegBaselineTransferSyntax(syntax) ) {
        algo = "jpeg-baseline";
    }
    else if ( dwv.dicom.isJpegLosslessTransferSyntax(syntax) ) {
        algo = "jpeg-lossless";
    }
    else if ( dwv.dicom.isRleTransferSyntax(syntax) ) {
        algo = "rle";
    }
    return algo;
};

/**
 * Tell if a given syntax is supported for reading.
 * @param {String} syntax The transfer syntax to test.
 * @return {Boolean} True if a supported syntax.
 */
dwv.dicom.isReadSupportedTransferSyntax = function (syntax) {

    // Unsupported:
    // "1.2.840.10008.1.2.1.99": Deflated Explicit VR - Little Endian
    // "1.2.840.10008.1.2.4.100": MPEG2 Image Compression
    // dwv.dicom.isJpegRetiredTransferSyntax(syntax): non supported JPEG
    // dwv.dicom.isJpeglsTransferSyntax(syntax): JPEG-LS

    return( syntax === "1.2.840.10008.1.2" || // Implicit VR - Little Endian
        syntax === "1.2.840.10008.1.2.1" || // Explicit VR - Little Endian
        syntax === "1.2.840.10008.1.2.2" || // Explicit VR - Big Endian
        dwv.dicom.isJpegBaselineTransferSyntax(syntax) || // JPEG baseline
        dwv.dicom.isJpegLosslessTransferSyntax(syntax) || // JPEG Lossless
        dwv.dicom.isJpeg2000TransferSyntax(syntax) || // JPEG 2000
        dwv.dicom.isRleTransferSyntax(syntax) ); // RLE
};

/**
 * Get the transfer syntax name.
 * Reference: [UID Values]{@link http://dicom.nema.org/dicom/2013/output/chtml/part06/chapter_A.html}.
 * @param {String} syntax The transfer syntax.
 * @return {String} The name of the transfer syntax.
 */
dwv.dicom.getTransferSyntaxName = function (syntax)
{
    var name = "Unknown";
    // Implicit VR - Little Endian
    if( syntax === "1.2.840.10008.1.2" ) {
        name = "Little Endian Implicit";
    }
    // Explicit VR - Little Endian
    else if( syntax === "1.2.840.10008.1.2.1" ) {
        name = "Little Endian Explicit";
    }
    // Deflated Explicit VR - Little Endian
    else if( syntax === "1.2.840.10008.1.2.1.99" ) {
        name = "Little Endian Deflated Explicit";
    }
    // Explicit VR - Big Endian
    else if( syntax === "1.2.840.10008.1.2.2" ) {
        name = "Big Endian Explicit";
    }
    // JPEG baseline
    else if( dwv.dicom.isJpegBaselineTransferSyntax(syntax) ) {
        if ( syntax === "1.2.840.10008.1.2.4.50" ) {
            name = "JPEG Baseline";
        }
        else { // *.51
            name = "JPEG Extended, Process 2+4";
        }
    }
    // JPEG Lossless
    else if( dwv.dicom.isJpegLosslessTransferSyntax(syntax) ) {
        if ( syntax === "1.2.840.10008.1.2.4.57" ) {
            name = "JPEG Lossless, Nonhierarchical (Processes 14)";
        }
        else { // *.70
            name = "JPEG Lossless, Non-hierarchical, 1st Order Prediction";
        }
    }
    // Retired JPEG
    else if( dwv.dicom.isJpegRetiredTransferSyntax(syntax) ) {
        name = "Retired JPEG";
    }
    // JPEG-LS
    else if( dwv.dicom.isJpeglsTransferSyntax(syntax) ) {
        name = "JPEG-LS";
    }
    // JPEG 2000
    else if( dwv.dicom.isJpeg2000TransferSyntax(syntax) ) {
        if ( syntax === "1.2.840.10008.1.2.4.91" ) {
            name = "JPEG 2000 (Lossless or Lossy)";
        }
        else { // *.90
            name = "JPEG 2000 (Lossless only)";
        }
    }
    // MPEG2 Image Compression
    else if( syntax === "1.2.840.10008.1.2.4.100" ) {
        name = "MPEG2";
    }
    // RLE (lossless)
    else if( dwv.dicom.isRleTransferSyntax(syntax) ) {
        name = "RLE";
    }
    // return
    return name;
};

/**
 * Get the appropriate TypedArray in function of arguments.
 * @param {Number} bitsAllocated The number of bites used to store the data: [8, 16, 32].
 * @param {Number} pixelRepresentation The pixel representation, 0:unsigned;1:signed.
 * @param {Size} size The size of the new array.
 * @return The good typed array.
 */
dwv.dicom.getTypedArray = function (bitsAllocated, pixelRepresentation, size)
{
    var res = null;
    if (bitsAllocated === 8) {
        if (pixelRepresentation === 0) {
            res = new Uint8Array(size);
        }
        else {
            res = new Int8Array(size);
        }
    }
    else if (bitsAllocated === 16) {
        if (pixelRepresentation === 0) {
            res = new Uint16Array(size);
        }
        else {
            res = new Int16Array(size);
        }
    }
    else if (bitsAllocated === 32) {
        if (pixelRepresentation === 0) {
            res = new Uint32Array(size);
        }
        else {
            res = new Int32Array(size);
        }
    }
    return res;
};

/**
 * Does this Value Representation (VR) have a 32bit Value Length (VL).
 * Ref: [Data Element explicit]{@link http://dicom.nema.org/dicom/2013/output/chtml/part05/chapter_7.html#table_7.1-1}.
 * @param {String} vr The data Value Representation (VR).
 * @returns {Boolean} True if this VR has a 32-bit VL.
 */
dwv.dicom.is32bitVLVR = function (vr)
{
    // added locally used 'ox'
    return ( vr === "OB" || vr === "OW" || vr === "OF" || vr === "ox" ||  vr === "UT" ||
    vr === "SQ" || vr === "UN" );
};

/**
 * Does this tag have a VR.
 * Basically the Item, ItemDelimitationItem and SequenceDelimitationItem tags.
 * @param {String} group The tag group.
 * @param {String} element The tag element.
 * @returns {Boolean} True if this tar has a VR.
 */
dwv.dicom.isTagWithVR = function (group, element) {
    return !(group === "0xFFFE" &&
            (element === "0xE000" || element === "0xE00D" || element === "0xE0DD" ));
};


/**
 * Get the number of bytes occupied by a data element prefix, i.e. without its value.
 * @param {String} vr The Value Representation of the element.
 * @param {Boolean} isImplicit Does the data use implicit VR?
 * WARNING: this is valid for tags with a VR, if not sure use the 'isTagWithVR' function first.
 * Reference:
 * - [Data Element explicit]{@link http://dicom.nema.org/dicom/2013/output/chtml/part05/chapter_7.html#table_7.1-1},
 * - [Data Element implicit]{@link http://dicom.nema.org/dicom/2013/output/chtml/part05/sect_7.5.html#table_7.5-1}.
 *
 * | Tag | VR  | VL | Value |
 * | 4   | 2   | 2  | X     | -> regular explicit: 8 + X
 * | 4   | 2+2 | 4  | X     | -> 32bit VL: 12 + X
 *
 * | Tag | VL | Value |
 * | 4   | 4  | X     | -> implicit (32bit VL): 8 + X
 *
 * | Tag | Len | Value |
 * | 4   | 4   | X     | -> item: 8 + X
 */
dwv.dicom.getDataElementPrefixByteSize = function (vr, isImplicit) {
    return isImplicit ? 8 : dwv.dicom.is32bitVLVR(vr) ? 12 : 8;
};

/**
 * DicomParser class.
 * @constructor
 */
dwv.dicom.DicomParser = function ()
{
    /**
     * The list of DICOM elements.
     * @type Array
     */
    this.dicomElements = {};

    /**
     * Default character set (optional).
     * @private
     * @type String
    */
    var defaultCharacterSet;
    /**
     * Get the default character set.
     * @return {String} The default character set.
     */
    this.getDefaultCharacterSet = function () {
        return defaultCharacterSet;
    };
    /**
     * Set the default character set.
     * param {String} The character set.
     */
    this.setDefaultCharacterSet = function (characterSet) {
        defaultCharacterSet = characterSet;
    };
};

/**
 * Get the raw DICOM data elements.
 * @return {Object} The raw DICOM elements.
 */
dwv.dicom.DicomParser.prototype.getRawDicomElements = function ()
{
    return this.dicomElements;
};

/**
 * Get the DICOM data elements.
 * @return {Object} The DICOM elements.
 */
dwv.dicom.DicomParser.prototype.getDicomElements = function ()
{
    return new dwv.dicom.DicomElementsWrapper(this.dicomElements);
};

/**
 * Read a DICOM tag.
 * @param reader The raw data reader.
 * @param offset The offset where to start to read.
 * @return An object containing the tags 'group', 'element' and 'name'.
 */
dwv.dicom.DicomParser.prototype.readTag = function (reader, offset)
{
    // group
    var group = reader.readHex(offset);
    offset += Uint16Array.BYTES_PER_ELEMENT;
    // element
    var element = reader.readHex(offset);
    offset += Uint16Array.BYTES_PER_ELEMENT;
    // name
    var name = dwv.dicom.getGroupElementKey(group, element);
    // return
    return {
        'group': group,
        'element': element,
        'name': name,
        'endOffset': offset };
};

/**
 * Read an item data element.
 * @param {Object} reader The raw data reader.
 * @param {Number} offset The offset where to start to read.
 * @param {Boolean} implicit Is the DICOM VR implicit?
 * @returns {Object} The item data as a list of data elements.
 */
dwv.dicom.DicomParser.prototype.readItemDataElement = function (reader, offset, implicit)
{
    var itemData = {};

    // read the first item
    var item = this.readDataElement(reader, offset, implicit);
    offset = item.endOffset;

    // exit if it is a sequence delimitation item
    var isSeqDelim = ( item.tag.name === "xFFFEE0DD" );
    if (isSeqDelim) {
        return {
            data: itemData,
            endOffset: item.endOffset,
            isSeqDelim: isSeqDelim };
    }

    // store it
    itemData[item.tag.name] = item;

    // explicit VR items
    if (item.vl !== "u/l") {
        // not empty
        if (item.vl !== 0) {
            // read until the end offset
            var endOffset = offset;
            offset -= item.vl;
            while (offset < endOffset) {
                item = this.readDataElement(reader, offset, implicit);
                offset = item.endOffset;
                itemData[item.tag.name] = item;
            }
        }
    }
    // implicit VR items
    else {
        // read until the item delimitation item
        var isItemDelim = false;
        while (!isItemDelim) {
            item = this.readDataElement(reader, offset, implicit);
            offset = item.endOffset;
            isItemDelim = ( item.tag.name === "xFFFEE00D" );
            if (!isItemDelim) {
                itemData[item.tag.name] = item;
            }
        }
    }

    return {
        'data': itemData,
        'endOffset': offset,
        'isSeqDelim': false };
};

/**
 * Read the pixel item data element.
 * Ref: [Single frame fragments]{@link http://dicom.nema.org/dicom/2013/output/chtml/part05/sect_A.4.html#table_A.4-1}.
 * @param {Object} reader The raw data reader.
 * @param {Number} offset The offset where to start to read.
 * @param {Boolean} implicit Is the DICOM VR implicit?
 * @returns {Array} The item data as an array of data elements.
 */
dwv.dicom.DicomParser.prototype.readPixelItemDataElement = function (reader, offset, implicit)
{
    var itemData = [];

    // first item: basic offset table
    var item = this.readDataElement(reader, offset, implicit);
    var offsetTableVl = item.vl;
    offset = item.endOffset;

    // read until the sequence delimitation item
    var isSeqDelim = false;
    while (!isSeqDelim) {
        item = this.readDataElement(reader, offset, implicit);
        offset = item.endOffset;
        isSeqDelim = ( item.tag.name === "xFFFEE0DD" );
        if (!isSeqDelim) {
            itemData.push(item.value);
        }
    }

    return {
        'data': itemData,
        'endOffset': offset,
        'offsetTableVl': offsetTableVl };
};

/**
 * Read a DICOM data element.
 * Reference: [DICOM VRs]{@link http://dicom.nema.org/dicom/2013/output/chtml/part05/sect_6.2.html#table_6.2-1}.
 * @param {Object} reader The raw data reader.
 * @param {Number} offset The offset where to start to read.
 * @param {Boolean} implicit Is the DICOM VR implicit?
 * @return {Object} An object containing the element 'tag', 'vl', 'vr', 'data' and 'endOffset'.
 */
dwv.dicom.DicomParser.prototype.readDataElement = function (reader, offset, implicit)
{
    // Tag: group, element
    var tag = this.readTag(reader, offset);
    offset = tag.endOffset;

    // Value Representation (VR)
    var vr = null;
    var is32bitVLVR = false;
    if (dwv.dicom.isTagWithVR(tag.group, tag.element)) {
        // implicit VR
        if (implicit) {
            vr = "UN";
            var dict = dwv.dicom.dictionary;
            if ( typeof dict[tag.group] !== "undefined" &&
                    typeof dict[tag.group][tag.element] !== "undefined" ) {
                vr = dwv.dicom.dictionary[tag.group][tag.element][0];
            }
            is32bitVLVR = true;
        }
        else {
            vr = reader.readString( offset, 2 );
            offset += 2 * Uint8Array.BYTES_PER_ELEMENT;
            is32bitVLVR = dwv.dicom.is32bitVLVR(vr);
            // reserved 2 bytes
            if ( is32bitVLVR ) {
                offset += 2 * Uint8Array.BYTES_PER_ELEMENT;
            }
        }
    }
    else {
        vr = "UN";
        is32bitVLVR = true;
    }

    // Value Length (VL)
    var vl = 0;
    if ( is32bitVLVR ) {
        vl = reader.readUint32( offset );
        offset += Uint32Array.BYTES_PER_ELEMENT;
    }
    else {
        vl = reader.readUint16( offset );
        offset += Uint16Array.BYTES_PER_ELEMENT;
    }

    // check the value of VL
    var vlString = vl;
    if( vl === 0xffffffff ) {
        vlString = "u/l";
        vl = 0;
    }

    var startOffset = offset;

    // data
    var data = null;
    var isPixelData = (tag.name === "x7FE00010");
    // pixel data sequence (implicit)
    if (isPixelData && vlString === "u/l")
    {
        var pixItemData = this.readPixelItemDataElement(reader, offset, implicit);
        offset = pixItemData.endOffset;
        startOffset += pixItemData.offsetTableVl;
        data = pixItemData.data;
    }
    else if (isPixelData && (vr === "OB" || vr === "OW" || vr === "OF" || vr === "ox")) {
        // BitsAllocated
        var bitsAllocated = 16;
        if ( typeof this.dicomElements.x00280100 !== 'undefined' ) {
            bitsAllocated = this.dicomElements.x00280100.value[0];
        } else {
            console.warn("Reading DICOM pixel data with default bitsAllocated.");
        }
        if (bitsAllocated === 8 && vr === "OW") {
            console.warn("Reading DICOM pixel data with vr=OW and bitsAllocated=8 (should be 16).");
        }
        if (bitsAllocated === 16 && vr === "OB") {
            console.warn("Reading DICOM pixel data with vr=OB and bitsAllocated=16 (should be 8).");
        }
        // PixelRepresentation 0->unsigned, 1->signed
        var pixelRepresentation = 0;
        if ( typeof this.dicomElements.x00280103 !== 'undefined' ) {
            pixelRepresentation = this.dicomElements.x00280103.value[0];
        } else {
            console.warn("Reading DICOM pixel data with default pixelRepresentation.");
        }
        // read
        if ( bitsAllocated === 8 ) {
            if (pixelRepresentation === 0) {
                data = reader.readUint8Array( offset, vl );
            }
            else {
                data = reader.readInt8Array( offset, vl );
            }
        }
        else if ( bitsAllocated === 16 ) {
            if (pixelRepresentation === 0) {
                data = reader.readUint16Array( offset, vl );
            }
            else {
                data = reader.readInt16Array( offset, vl );
            }
        }
        else if ( bitsAllocated === 32 ) {
            if (pixelRepresentation === 0) {
                data = reader.readUint32Array( offset, vl );
            }
            else {
                data = reader.readInt32Array( offset, vl );
            }
        }
        else if ( bitsAllocated === 64 ) {
            if (pixelRepresentation === 0) {
                data = reader.readUint64Array( offset, vl );
            }
            else {
                data = reader.readInt64Array( offset, vl );
            }
        }
        offset += vl;
    }
    // others
    else if ( vr === "OB" )
    {
        data = reader.readUint8Array( offset, vl );
        offset += vl;
    }
    else if ( vr === "OW" )
    {
        data = reader.readUint16Array( offset, vl );
        offset += vl;
    }
    else if ( vr === "OF" )
    {
        data = reader.readUint32Array( offset, vl );
        offset += vl;
    }
    else if ( vr === "OD" )
    {
        data = reader.readUint64Array( offset, vl );
        offset += vl;
    }
    // numbers
    else if( vr === "US")
    {
        data = reader.readUint16Array( offset, vl );
        offset += vl;
    }
    else if( vr === "UL")
    {
        data = reader.readUint32Array( offset, vl );
        offset += vl;
    }
    else if( vr === "SS")
    {
        data = reader.readInt16Array( offset, vl );
        offset += vl;
    }
    else if( vr === "SL")
    {
        data = reader.readInt32Array( offset, vl );
        offset += vl;
    }
    else if( vr === "FL")
    {
        data = reader.readFloat32Array( offset, vl );
        offset += vl;
    }
    else if( vr === "FD")
    {
        data = reader.readFloat64Array( offset, vl );
        offset += vl;
    }
    else if( vr === "xs")
    {
        // PixelRepresentation 0->unsigned, 1->signed
        var pixelRep = 0;
        if (typeof this.dicomElements.x00280103 !== 'undefined' ) {
            pixelRep = this.dicomElements.x00280103.value[0];
        } else {
            console.warn("Reading DICOM pixel data with default pixelRepresentation.");
        }
        // read
        if (pixelRep === 0) {
            data = reader.readUint16Array(offset, vl);
        } else {
            data = reader.readInt16Array(offset, vl);
        }
        offset += vl;
    }
    // attribute
    else if( vr === "AT")
    {
        var raw = reader.readUint16Array( offset, vl );
        offset += vl;
        data = [];
        for ( var i = 0, leni = raw.length; i < leni; i+=2 ) {
            var stri = raw[i].toString(16);
            var stri1 = raw[i+1].toString(16);
            var str = "(";
            str += "0000".substr(0, 4 - stri.length) + stri.toUpperCase();
            str += ",";
            str += "0000".substr(0, 4 - stri1.length) + stri1.toUpperCase();
            str += ")";
            data.push(str);
        }
    }
    // not available
    else if( vr === "UN")
    {
        data = reader.readUint8Array( offset, vl );
        offset += vl;
    }
    // sequence
    else if (vr === "SQ")
    {
        data = [];
        var itemData;
        // explicit VR sequence
        if (vlString !== "u/l") {
            // not empty
            if (vl !== 0) {
                var sqEndOffset = offset + vl;
                while (offset < sqEndOffset) {
                     itemData = this.readItemDataElement(reader, offset, implicit);
                     data.push( itemData.data );
                     offset = itemData.endOffset;
                }
            }
        }
        // implicit VR sequence
        else {
            // read until the sequence delimitation item
            var isSeqDelim = false;
            while (!isSeqDelim) {
                itemData = this.readItemDataElement(reader, offset, implicit);
                isSeqDelim = itemData.isSeqDelim;
                offset = itemData.endOffset;
                // do not store the delimitation item
                if (!isSeqDelim) {
                    data.push( itemData.data );
                }
            }
        }
    }
    // raw
    else
    {
        if ( vr === "SH" || vr === "LO" || vr === "ST" ||
            vr === "PN" || vr === "LT" || vr === "UT" ) {
            data = reader.readSpecialString( offset, vl );
        } else {
            data = reader.readString( offset, vl );
        }
        offset += vl;
        data = data.split("\\");
    }

    // return
    return {
        'tag': tag,
        'vr': vr,
        'vl': vlString,
        'value': data,
        'startOffset': startOffset,
        'endOffset': offset
    };
};

/**
 * Parse the complete DICOM file (given as input to the class).
 * Fills in the member object 'dicomElements'.
 * @param buffer The input array buffer.
 */
dwv.dicom.DicomParser.prototype.parse = function (buffer)
{
    var offset = 0;
    var implicit = false;
    var syntax = "";
    var dataElement = null;
    // default readers
    var metaReader = new dwv.dicom.DataReader(buffer);
    var dataReader = new dwv.dicom.DataReader(buffer);

    // 128 -> 132: magic word
    offset = 128;
    var magicword = metaReader.readString( offset, 4 );
    offset += 4 * Uint8Array.BYTES_PER_ELEMENT;
    if (magicword === "DICM") {
        // 0x0002, 0x0000: FileMetaInformationGroupLength
        dataElement = this.readDataElement(metaReader, offset, false);
        offset = dataElement.endOffset;
        // store the data element
        this.dicomElements[dataElement.tag.name] = dataElement;
        // get meta length
        var metaLength = parseInt(dataElement.value[0], 10);

        // meta elements
        var metaEnd = offset + metaLength;
        while( offset < metaEnd )
        {
            // get the data element
            dataElement = this.readDataElement(metaReader, offset, false);
            offset = dataElement.endOffset;
            // store the data element
            this.dicomElements[dataElement.tag.name] = dataElement;
        }
    } else {
        // no metadata: attempt to detect transfer syntax
        // see https://github.com/ivmartel/dwv/issues/188
        //   (Allow to load DICOM with no DICM preamble) for more details
        var oEightGroupBigEndian = "0x0800";
        var oEightGroupLittleEndian = "0x0008";
        // read first element
        dataElement = this.readDataElement(dataReader, 0, implicit);
        // check that group is 0x0008
        if ((dataElement.tag.group !== oEightGroupBigEndian) &&
            (dataElement.tag.group !== oEightGroupLittleEndian)) {
            throw new Error("Not a valid DICOM file (no magic DICM word found and first element not in 0x0008 group)");
        }
        // reasonable assumption: 2 uppercase characters => explicit vr
        var vr0 = dataElement.vr.charCodeAt(0);
        var vr1 = dataElement.vr.charCodeAt(1);
        implicit = (vr0 >= 65 && vr0 <= 90 && vr1 >= 65 && vr1 <= 90) ? false : true;
        // guess transfer syntax
        if (dataElement.tag.group === oEightGroupLittleEndian) {
            if (implicit) {
                 // ImplicitVRLittleEndian
                syntax = "1.2.840.10008.1.2";
            } else {
                // ExplicitVRLittleEndian
                syntax = "1.2.840.10008.1.2.1";
            }
        } else {
            if (implicit) {
                // ImplicitVRBigEndian: impossible
                throw new Error("Not a valid DICOM file (no magic DICM word found and implicit VR big endian detected)");
            } else {
                // ExplicitVRBigEndian
                syntax = "1.2.840.10008.1.2.2";
            }
        }
        // set transfer syntax data element
        dataElement.tag.group = "0x0002";
        dataElement.tag.element = "0x0010";
        dataElement.tag.name = "x00020010";
        dataElement.tag.endOffset = 4;
        dataElement.vr = "UI";
        dataElement.value = [syntax + " "]; // even length
        dataElement.vl = dataElement.value[0].length;
        dataElement.endOffset = dataElement.startOffset + dataElement.vl;
        // store it
        this.dicomElements[dataElement.tag.name] = dataElement;

        // reset offset
        offset = 0;
    }

    // check the TransferSyntaxUID (has to be there!)
    if (typeof this.dicomElements.x00020010 === "undefined")
    {
        throw new Error("Not a valid DICOM file (no TransferSyntaxUID found)");
    }
    syntax = dwv.dicom.cleanString(this.dicomElements.x00020010.value[0]);

    // check support
    if (!dwv.dicom.isReadSupportedTransferSyntax(syntax)) {
        throw new Error("Unsupported DICOM transfer syntax: '"+syntax+
            "' ("+dwv.dicom.getTransferSyntaxName(syntax)+")");
    }

    // Implicit VR
    if (dwv.dicom.isImplicitTransferSyntax(syntax)) {
        implicit = true;
    }

    // Big Endian
    if (dwv.dicom.isBigEndianTransferSyntax(syntax)) {
        dataReader = new dwv.dicom.DataReader(buffer,false);
    }

    // default character set
    if (typeof this.getDefaultCharacterSet() !== "undefined") {
        dataReader.setUtfLabel(this.getDefaultCharacterSet());
    }

    // DICOM data elements
    while ( offset < buffer.byteLength )
    {
        // get the data element
        dataElement = this.readDataElement(dataReader, offset, implicit);
        // check character set
        if (dataElement.tag.name === "x00080005") {
            var charSetTerm;
            if (dataElement.value.length === 1) {
                charSetTerm = dwv.dicom.cleanString(dataElement.value[0]);
            }
            else {
                charSetTerm = dwv.dicom.cleanString(dataElement.value[1]);
                console.warn("Unsupported character set with code extensions: '"+charSetTerm+"'.");
            }
            dataReader.setUtfLabel(dwv.dicom.getUtfLabel(charSetTerm));
        }
        // increment offset
        offset = dataElement.endOffset;
        // store the data element
        this.dicomElements[dataElement.tag.name] = dataElement;
    }

    // safety check...
    if (buffer.byteLength !== offset) {
        console.warn("Did not reach the end of the buffer: "+
            offset+" != "+buffer.byteLength);
    }

    // pixel buffer
    if (typeof this.dicomElements.x7FE00010 !== "undefined") {

        var numberOfFrames = 1;
        if (typeof this.dicomElements.x00280008 !== "undefined") {
            numberOfFrames = this.dicomElements.x00280008.value[0];
        }

        if (this.dicomElements.x7FE00010.vl !== "u/l") {
            // compressed should be encapsulated...
            if (dwv.dicom.isJpeg2000TransferSyntax( syntax ) ||
                dwv.dicom.isJpegBaselineTransferSyntax( syntax ) ||
                dwv.dicom.isJpegLosslessTransferSyntax( syntax ) ) {
                console.warn("Compressed but no items...");
            }

            // calculate the slice size
            var pixData = this.dicomElements.x7FE00010.value;
            var columns = this.dicomElements.x00280011.value[0];
            var rows = this.dicomElements.x00280010.value[0];
            var samplesPerPixel = this.dicomElements.x00280002.value[0];
            var sliceSize = columns * rows * samplesPerPixel;
            // slice data in an array of frames
            var newPixData = [];
            var frameOffset = 0;
            for (var g = 0; g < numberOfFrames; ++g) {
                newPixData[g] = pixData.slice(frameOffset, frameOffset+sliceSize);
                frameOffset += sliceSize;
            }
            // store as pixel data
            this.dicomElements.x7FE00010.value = newPixData;
        }
        else {
            // handle fragmented pixel buffer
            // Reference: http://dicom.nema.org/dicom/2013/output/chtml/part05/sect_8.2.html
            // (third note, "Depending on the transfer syntax...")
            var pixItems = this.dicomElements.x7FE00010.value;
            if (pixItems.length > 1 && pixItems.length > numberOfFrames ) {

                // concatenate pixel data items
                // concat does not work on typed arrays
                //this.pixelBuffer = this.pixelBuffer.concat( dataElement.data );
                // manual concat...
                var nItemPerFrame = pixItems.length / numberOfFrames;
                var newPixItems = [];
                var index = 0;
                for (var f = 0; f < numberOfFrames; ++f) {
                    index = f * nItemPerFrame;
                    // calculate the size of a frame
                    var size = 0;
                    for (var i = 0; i < nItemPerFrame; ++i) {
                        size += pixItems[index + i].length;
                    }
                    // create new buffer
                    var newBuffer = new pixItems[0].constructor(size);
                    // fill new buffer
                    var fragOffset = 0;
                    for (var j = 0; j < nItemPerFrame; ++j) {
                        newBuffer.set( pixItems[index + j], fragOffset );
                        fragOffset += pixItems[index + j].length;
                    }
                    newPixItems[f] = newBuffer;
                }
                // store as pixel data
                this.dicomElements.x7FE00010.value = newPixItems;
            }
        }
    }
};
