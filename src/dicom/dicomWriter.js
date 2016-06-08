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
        byteOffset = this.writeString(byteOffset, array[i]);
        // separator
        if ( len !== 1 && i !== array.length - 1 ) {
            byteOffset = this.writeString(byteOffset, "\\");
        }
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
dwv.dicom.DataWriter.prototype.writeVR = function (vr, byteOffset, value) {
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
                if ( itemKeys[m] !== "xFFFEE000" ) {
                    byteOffset = this.writeDataElement(item[itemKeys[m]], byteOffset);
                }
            }
        }
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
    // group
    byteOffset = this.writeHex(byteOffset, element.group);
    // element
    byteOffset = this.writeHex(byteOffset, element.element);
    // VR
    if ( element.vr !== "N/A" ) {
        byteOffset = this.writeString(byteOffset, element.vr);
    }
    // VL
    var isOtherVR = (element.vr[0] === 'O' || element.vr === "SQ" );
    if ( isOtherVR ) {
        byteOffset += 2;
    }
    if ( isOtherVR || element.group === "0xFFFE") {
        byteOffset = this.writeUint32(byteOffset, element.vl);
    }
    else {
        byteOffset = this.writeUint16(byteOffset, element.vl);
    }
    // value
    byteOffset = this.writeVR(element.vr, byteOffset, element.value);
    
    // return new offset
    return byteOffset;
};

/**
 * DICOM writer.
 * @constructor
 * @param {Array} dicomElements The wrapped elements to wrap.
 */
dwv.dicom.DicomWriter = function (dicomElements) {

    this.actions = {
        'copy': function (item) { return item; },
        'remove': function () { return null; },
        'clear': function (item) { item.value[0] = ""; return item; },
        'replace': function (item, value) { item.value[0] = value; item.vl = value.length; return item; }
    };

    // names: 'default', tagName or groupName
    // priority: tagName, groupName, default
    this.rules = {
        //'default': {'action': 'copy', 'value': null },
        'default': {'action': 'remove', 'value': null },
        'PatientName': {'action': 'replace', 'value': 'Anonymized'}, // tag
        'Meta Element' : {'action': 'copy', 'value': null }, // group 'x0002'
        'Acquisition' : {'action': 'copy', 'value': null }, // group 'x0018'
        'Image Presentation' : {'action': 'copy', 'value': null }, // group 'x0028'
        'Procedure' : {'action': 'copy', 'value': null }, // group 'x0040'
        'Pixel Data' : {'action': 'copy', 'value': null } // group 'x7fe0'
    };

    this.getElementToWrite = function (element) {
        var tagName = null;
        var dict = dwv.dicom.dictionary;
        var group = element.group;
        var groupName = dwv.dicom.TagGroups[group.substr(1)]; // remove first 0
        if ( typeof dict[group] !== 'undefined' ) {
            tagName = dict[group][element.element][2];
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
        return this.actions[rule.action](element, rule.value);
    };
    
    this.getBuffer = function () {
        var keys = Object.keys(dicomElements);
        var element;
        
        // calculate buffer size
        var size = 128 + 4; // DICM
        for ( var i = 0; i < keys.length; ++i ) {
            element = this.getElementToWrite(dicomElements[keys[i]]);
            if ( element !== null ) {
                if ( element.vr[0] === 'O' || element.vr === "SQ" ) {
                    size += 4;
                }
                size += 8 + parseInt(element.vl, 10);
            }
        }
        console.log("size: "+size);

        // split meta and non meta elements
        var metaElements = [];
        var rawElements = [];
        var groupName;
        for ( var k = 0; k < keys.length; ++k ) {
            element = this.getElementToWrite(dicomElements[keys[k]]);
            if ( element !== null ) {
                groupName = dwv.dicom.TagGroups[element.group.substr(1)]; // remove first 0
                if ( groupName === 'Meta Element' ) {
                    metaElements.push(element);
                }
                else {
                    rawElements.push(element);
                }
            }
        }
        
        // create buffer
        var buffer = new ArrayBuffer(size);
        var writer = new dwv.dicom.DataWriter(buffer);
        var offset = 128;
        // DICM
        offset = writer.writeString(offset, "DICM");
        console.log("offset = " + offset);
        // write meta
        for ( var l = 0; l < metaElements.length; ++l ) {
            offset = writer.writeDataElement(metaElements[l], offset);
        }
        // write non meta
        for ( var j = 0; j < rawElements.length; ++j ) {
            offset = writer.writeDataElement(rawElements[j], offset);
        }
        return buffer;
    };
};
