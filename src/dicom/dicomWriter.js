// namespaces
var dwv = dwv || {};
dwv.dicom = dwv.dicom || {};

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
 * @constructor
 * @param {Array} buffer The input array buffer.
 */
dwv.dicom.DataWriter = function (buffer)
{
    // private DataView
    var view = new DataView(buffer);
    // endianness flag
    var isLittleEndian = true;

    /**
     * Write Uint8 data.
     * @param {Number} byteOffset The offset to start writing from.
     * @param {Number} value The data to write.
     * @returns {Number} The new offset position.
     */
    this.writeUint8 = function (byteOffset, value) {
        view.setUint8(byteOffset, value);
        return byteOffset + Uint8Array.BYTES_PER_ELEMENT;
    };

    /**
     * Write Int8 data.
     * @param {Number} byteOffset The offset to start writing from.
     * @param {Number} value The data to write.
     * @returns {Number} The new offset position.
     */
    this.writeInt8 = function (byteOffset, value) {
        view.setInt8(byteOffset, value);
        return byteOffset + Int8Array.BYTES_PER_ELEMENT;
    };

    /**
     * Write Uint16 data.
     * @param {Number} byteOffset The offset to start writing from.
     * @param {Number} value The data to write.
     * @returns {Number} The new offset position.
     */
    this.writeUint16 = function (byteOffset, value) {
        view.setUint16(byteOffset, value, isLittleEndian);
        return byteOffset + Uint16Array.BYTES_PER_ELEMENT;
    };

    /**
     * Write Int16 data.
     * @param {Number} byteOffset The offset to start writing from.
     * @param {Number} value The data to write.
     * @returns {Number} The new offset position.
     */
    this.writeInt16 = function (byteOffset, value) {
        view.setInt16(byteOffset, value, isLittleEndian);
        return byteOffset + Int16Array.BYTES_PER_ELEMENT;
    };

    /**
     * Write Uint32 data.
     * @param {Number} byteOffset The offset to start writing from.
     * @param {Number} value The data to write.
     * @returns {Number} The new offset position.
     */
    this.writeUint32 = function (byteOffset, value) {
        view.setUint32(byteOffset, value, isLittleEndian);
        return byteOffset + Uint32Array.BYTES_PER_ELEMENT;
    };

    /**
     * Write Int32 data.
     * @param {Number} byteOffset The offset to start writing from.
     * @param {Number} value The data to write.
     * @returns {Number} The new offset position.
     */
    this.writeInt32 = function (byteOffset, value) {
        view.setInt32(byteOffset, value, isLittleEndian);
        return byteOffset + Int32Array.BYTES_PER_ELEMENT;
    };

    /**
     * Write Float32 data.
     * @param {Number} byteOffset The offset to start writing from.
     * @param {Number} value The data to write.
     * @returns {Number} The new offset position.
     */
    this.writeFloat32 = function (byteOffset, value) {
        view.setFloat32(byteOffset, value, isLittleEndian);
        return byteOffset + Float32Array.BYTES_PER_ELEMENT;
    };

    /**
     * Write Float64 data.
     * @param {Number} byteOffset The offset to start writing from.
     * @param {Number} value The data to write.
     * @returns {Number} The new offset position.
     */
    this.writeFloat64 = function (byteOffset, value) {
        view.setFloat64(byteOffset, value, isLittleEndian);
        return byteOffset + Float64Array.BYTES_PER_ELEMENT;
    };

    /**
     * Write string data as hexadecimal.
     * @param {Number} byteOffset The offset to start writing from.
     * @param {Number} str The padded hexadecimal string to write ('0x####').
     * @returns {Number} The new offset position.
     */
    this.writeHex = function (byteOffset, str) {
        // remove first two chars and parse
        var value = parseInt(str.substr(2), 16);
        view.setUint16(byteOffset, value, isLittleEndian);
        return byteOffset + Uint16Array.BYTES_PER_ELEMENT;
    };

    /**
     * Write string data.
     * @param {Number} byteOffset The offset to start writing from.
     * @param {Number} str The data to write.
     * @returns {Number} The new offset position.
     */
    this.writeString = function (byteOffset, str) {
        for ( var i = 0, len = str.length; i < len; ++i ) {
            view.setUint8(byteOffset, str.charCodeAt(i));
            byteOffset += Uint8Array.BYTES_PER_ELEMENT;
        }
        return byteOffset;
    };

};

/**
 * Write Uint8 array.
 * @param {Number} byteOffset The offset to start writing from.
 * @param {Array} array The array to write.
 * @returns {Number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeUint8Array = function (byteOffset, array) {
    for ( var i = 0, len = array.length; i < len; ++i ) {
        byteOffset = this.writeUint8(byteOffset, array[i]);
    }
    return byteOffset;
};

/**
 * Write Int8 array.
 * @param {Number} byteOffset The offset to start writing from.
 * @param {Array} array The array to write.
 * @returns {Number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeInt8Array = function (byteOffset, array) {
    for ( var i = 0, len = array.length; i < len; ++i ) {
        byteOffset = this.writeInt8(byteOffset, array[i]);
    }
    return byteOffset;
};

/**
 * Write Uint16 array.
 * @param {Number} byteOffset The offset to start writing from.
 * @param {Array} array The array to write.
 * @returns {Number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeUint16Array = function (byteOffset, array) {
    for ( var i = 0, len = array.length; i < len; ++i ) {
        byteOffset = this.writeUint16(byteOffset, array[i]);
    }
    return byteOffset;
};

/**
 * Write Int16 array.
 * @param {Number} byteOffset The offset to start writing from.
 * @param {Array} array The array to write.
 * @returns {Number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeInt16Array = function (byteOffset, array) {
    for ( var i = 0, len = array.length; i < len; ++i ) {
        byteOffset = this.writeInt16(byteOffset, array[i]);
    }
    return byteOffset;
};

/**
 * Write Uint32 array.
 * @param {Number} byteOffset The offset to start writing from.
 * @param {Array} array The array to write.
 * @returns {Number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeUint32Array = function (byteOffset, array) {
    for ( var i = 0, len = array.length; i < len; ++i ) {
        byteOffset = this.writeUint32(byteOffset, array[i]);
    }
    return byteOffset;
};

/**
 * Write Int32 array.
 * @param {Number} byteOffset The offset to start writing from.
 * @param {Array} array The array to write.
 * @returns {Number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeInt32Array = function (byteOffset, array) {
    for ( var i = 0, len = array.length; i < len; ++i ) {
        byteOffset = this.writeInt32(byteOffset, array[i]);
    }
    return byteOffset;
};

/**
 * Write Float32 array.
 * @param {Number} byteOffset The offset to start writing from.
 * @param {Array} array The array to write.
 * @returns {Number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeFloat32Array = function (byteOffset, array) {
    for ( var i = 0, len = array.length; i < len; ++i ) {
        byteOffset = this.writeFloat32(byteOffset, array[i]);
    }
    return byteOffset;
};

/**
 * Write Float64 array.
 * @param {Number} byteOffset The offset to start writing from.
 * @param {Array} array The array to write.
 * @returns {Number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeFloat64Array = function (byteOffset, array) {
    for ( var i = 0, len = array.length; i < len; ++i ) {
        byteOffset = this.writeFloat64(byteOffset, array[i]);
    }
    return byteOffset;
};

/**
 * Write string array.
 * @param {Number} byteOffset The offset to start writing from.
 * @param {Array} array The array to write.
 * @returns {Number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeStringArray = function (byteOffset, array) {
    for ( var i = 0, len = array.length; i < len; ++i ) {
        // separator
        if ( i !== 0 ) {
            byteOffset = this.writeString(byteOffset, "\\");
        }
        // value
        byteOffset = this.writeString(byteOffset, array[i].toString());
    }
    return byteOffset;
};

/**
 * Write data with a specific Value Representation (VR).
 * @param {String} vr The data Value Representation (VR).
 * @param {Number} byteOffset The offset to start writing from.
 * @param {Array} value The array to write.
 * @returns {Number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeDataElementValue = function (vr, byteOffset, value) {
    // switch according to VR
    if ( vr === "OB") {
        byteOffset = this.writeUint8Array(byteOffset, value);
    }
    else if ( vr === "US" || vr === "OW") {
        byteOffset = this.writeUint16Array(byteOffset, value);
    }
    else if ( vr === "SS") {
        byteOffset = this.writeInt16Array(byteOffset, value);
    }
    else if ( vr === "UL") {
        byteOffset = this.writeUint32Array(byteOffset, value);
    }
    else if ( vr === "SL") {
        byteOffset = this.writeInt32Array(byteOffset, value);
    }
    else if ( vr === "FL") {
        byteOffset = this.writeFloat32Array(byteOffset, value);
    }
    else if ( vr === "FD") {
        byteOffset = this.writeFloat64Array(byteOffset, value);
    }
    else if ( vr === "SQ") {
        var item = null;
        for ( var i = 0; i < value.length; ++i ) {
            item = value[i];
            var itemKeys = Object.keys(item);
            if ( itemKeys.length === 0 ) {
                continue;
            }
            // write item
            var itemElement = item.xFFFEE000;
            itemElement.value = [];
            byteOffset = this.writeDataElement(itemElement, byteOffset);
            // write rest
            for ( var m = 0; m < itemKeys.length; ++m ) {
                if ( itemKeys[m] !== "xFFFEE000" && itemKeys[m] !== "xFFFEE00D") {
                    byteOffset = this.writeDataElement(item[itemKeys[m]], byteOffset);
                }
            }
            // item delimitation
            if (typeof item.xFFFEE00D !== "undefined") {
                var itemDelimElement = item.xFFFEE00D;
                itemDelimElement.value = [];
                byteOffset = this.writeDataElement(itemDelimElement, byteOffset);
            }
        }
    } else if ( vr === "AT") {
        var hexString = value + '';
        var hexString1 = hexString.substring(1, 5);
        var hexString2 = hexString.substring(6, 10);
        var dec1 = parseInt(hexString1, 16);
        var dec2 = parseInt(hexString2, 16);
        value = new Uint16Array([dec1, dec2]);
        byteOffset = this.writeUint16Array(byteOffset, value);
    }
    else {
        byteOffset = this.writeStringArray(byteOffset, value);
    }

    // return new offset
    return byteOffset;
};

/**
 * Write a data element.
 * @param {Object} element The DICOM data element to write.
 * @param {Number} byteOffset The offset to start writing from.
 * @returns {Number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeDataElement = function (element, byteOffset) {
    var isTagWithVR = dwv.dicom.isTagWithVR(element.tag.group, element.tag.element);
    var is32bitVLVR = dwv.dicom.is32bitVLVR(element.vr);
    // group
    byteOffset = this.writeHex(byteOffset, element.tag.group);
    // element
    byteOffset = this.writeHex(byteOffset, element.tag.element);
    // VR
    if ( isTagWithVR ) {
        byteOffset = this.writeString(byteOffset, element.vr);
        // reserved 2 bytes for 32bit VL
        if ( is32bitVLVR ) {
            byteOffset += 2;
        }
    }
    // update vl for sequence with implicit length
    if ( dwv.dicom.isImplicitLengthSequence(element) ) {
        element.vl = 0xffffffff;
    }
    // VL
    if ( is32bitVLVR || !isTagWithVR ) {
        byteOffset = this.writeUint32(byteOffset, element.vl);
    }
    else {
        byteOffset = this.writeUint16(byteOffset, element.vl);
    }
    // value
    var value = element.value;
    // pixel data: array of arrays of size 1 for single frame 
    // is flattened to a single array for multi frame support
    if (element.tag.name === "x7FE00010") {
        value = element.value[0];
        if(element.value.length > 1) {
        	value = dwv.dicom.flattenArrayOfTypedArrays(element.value);
        }
    }
    
    if(typeof value === 'undefined') {
        value = [];
    }
    
    byteOffset = this.writeDataElementValue(element.vr, byteOffset, value);

    // sequence delimitation item for sequence with implicit length
    if ( dwv.dicom.isImplicitLengthSequence(element) ) {
        var seqDelimElement = {
                'tag': { group: "0xFFFE", element: "0xE0DD" },
                'vr': "NONE",
                'vl': 0,
                'value': []
            };
        byteOffset = this.writeDataElement(seqDelimElement, byteOffset);
    }

    // return new offset
    return byteOffset;
};

/**
 * Is this element an implicit length sequence?
 * @param {Object} element The element to check.
 * @returns {Boolean} True if it is.
 */
dwv.dicom.isImplicitLengthSequence = function (element) {
    return (element.vr === "SQ" &&
        typeof element.value !== "undefined" &&
        ( ( Object.keys(element.value).length !== 0 &&
                typeof element.value[0] !== "undefined" &&
                typeof element.value[0].xFFFEE00D !== "undefined" ) ||
        ( element.value === 0 ) ) );
};

/**
 * Helper method to flatten an array of typed arrays to 2D typed array
 * @param {Array} array of typed arrays
 * @returns {Object} a typed array containing all values 
 */
dwv.dicom.flattenArrayOfTypedArrays = function(initialArray) {
    var initialArrayLength = initialArray.length;
    var arrayLength = initialArray[0].length;
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
 * @constructor
 */
dwv.dicom.DicomWriter = function () {

    // possible tag actions
    var actions = {
        'copy': function (item) { return item; },
        'remove': function () { return null; },
        'clear': function (item) { item.value[0] = ""; return item; },
        'replace': function (item, value) {
            item.value[0] = value;
            item.vl = value.length;
            return item;
        }
    };

    // default rules: just copy
    var defaultRules = {
        'default': {action: 'copy', value: null }
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
        'default': {action: 'remove', value: null },
        'PatientName': {action: 'replace', value: 'Anonymized'}, // tag
        'Meta Element' : {action: 'copy', value: null }, // group 'x0002'
        'Acquisition' : {action: 'copy', value: null }, // group 'x0018'
        'Image Presentation' : {action: 'copy', value: null }, // group 'x0028'
        'Procedure' : {action: 'copy', value: null }, // group 'x0040'
        'Pixel Data' : {action: 'copy', value: null } // group 'x7fe0'
    };

    /**
     * Get the element to write according to the class rules.
     * Priority order: tagName, groupName, default.
     * @param {Object} element The element to check
     * @return {Object} The element to write, can be null.
     */
    this.getElementToWrite = function (element) {
        // get group and tag string name
        var tagName = null;
        var dict = dwv.dicom.dictionary;
        var group = element.tag.group;
        var groupName = dwv.dicom.TagGroups[group.substr(1)]; // remove first 0
        if ( typeof dict[group] !== 'undefined' && typeof dict[group][element.tag.element] !== 'undefined') {
            tagName = dict[group][element.tag.element][2];
        }
        // apply rules:
        var rule;
        // 1. tag name
        if ( tagName !== null && typeof this.rules[tagName] !== 'undefined' ) {
            rule = this.rules[tagName];
        }
        // 2. group name
        else if ( typeof this.rules[groupName] !== 'undefined' ) {
            rule = this.rules[groupName];
        }
        // 3. default
        else {
            rule = this.rules['default'];
        }
        // apply action on element and return
        return actions[rule.action](element, rule.value);
    };
};

/**
 * Get the ArrayBuffer corresponding to input DICOM elements.
 * @param {Array} dicomElements The wrapped elements to write.
 * @returns {ArrayBuffer} The elements as a buffer.
 */
dwv.dicom.DicomWriter.prototype.getBuffer = function (dicomElements) {
    // array keys
    var keys = Object.keys(dicomElements);

    // calculate buffer size and split elements (meta and non meta)
    var size = 128 + 4; // DICM
    var metaElements = [];
    var rawElements = [];
    var element;
    var groupName;
    for ( var i = 0, leni = keys.length; i < leni; ++i ) {
        element = this.getElementToWrite(dicomElements[keys[i]]);
        if ( element !== null ) {
            // size
            size += dwv.dicom.getDataElementPrefixByteSize(element.vr) + parseInt(element.vl, 10);

            // add size of sequence delimitation item
            if ( dwv.dicom.isImplicitLengthSequence(element) ) {
                size += dwv.dicom.getDataElementPrefixByteSize("NONE");
            }

            // sort element
            groupName = dwv.dicom.TagGroups[element.tag.group.substr(1)]; // remove first 0
            if ( groupName === 'Meta Element' ) {
                metaElements.push(element);
            }
            else {
                rawElements.push(element);
            }
        }
    }

    console.log("size: "+size);

    // create buffer
    var buffer = new ArrayBuffer(size);
    var writer = new dwv.dicom.DataWriter(buffer);
    var offset = 128;
    // DICM
    offset = writer.writeString(offset, "DICM");
    // write meta
    for ( var j = 0, lenj = metaElements.length; j < lenj; ++j ) {
        offset = writer.writeDataElement(metaElements[j], offset);
    }
    // write non meta
    for ( var k = 0, lenk = rawElements.length; k < lenk; ++k ) {
        offset = writer.writeDataElement(rawElements[k], offset);
    }

    // return
    return buffer;
};
