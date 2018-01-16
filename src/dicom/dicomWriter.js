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
 * @param {Boolean} isLittleEndian Flag to tell if the data is little or big endian.
 */
dwv.dicom.DataWriter = function (buffer, isLittleEndian)
{
    // Set endian flag if not defined.
    if ( typeof isLittleEndian === 'undefined' ) {
        isLittleEndian = true;
    }

    // private DataView
    var view = new DataView(buffer);

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
 * Write a list of items.
 * @param {Number} byteOffset The offset to start writing from.
 * @param {Array} items The list of items to write.
 * @param {Boolean} isImplicit Is the DICOM VR implicit?
 * @returns {Number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeDataElementItems = function (byteOffset, items, isImplicit) {
    var item = null;
    for ( var i = 0; i < items.length; ++i ) {
        item = items[i];
        var itemKeys = Object.keys(item);
        if ( itemKeys.length === 0 ) {
            continue;
        }
        // write item
        var itemElement = item.xFFFEE000;
        itemElement.value = [];
        var implicitLength = (itemElement.vl === "u/l");
        if (implicitLength) {
            itemElement.vl = 0xffffffff;
        }
        byteOffset = this.writeDataElement(itemElement, byteOffset, isImplicit);
        // write rest
        for ( var m = 0; m < itemKeys.length; ++m ) {
            if ( itemKeys[m] !== "xFFFEE000" && itemKeys[m] !== "xFFFEE00D") {
                byteOffset = this.writeDataElement(item[itemKeys[m]], byteOffset, isImplicit);
            }
        }
        // item delimitation
        if (implicitLength) {
            var itemDelimElement = {
                'tag': { group: "0xFFFE",
                    element: "0xE00D",
                    name: "ItemDelimitationItem" },
                'vr': "NONE",
                'vl': 0,
                'value': []
            };
            byteOffset = this.writeDataElement(itemDelimElement, byteOffset, isImplicit);
        }
    }

    // return new offset
    return byteOffset;
};

/**
 * Write data with a specific Value Representation (VR).
 * @param {String} vr The data Value Representation (VR).
 * @param {Number} byteOffset The offset to start writing from.
 * @param {Array} value The array to write.
 * @param {Boolean} isImplicit Is the DICOM VR implicit?
 * @returns {Number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeDataElementValue = function (vr, byteOffset, value, isImplicit) {
    // first check input type to know how to write
    if (value instanceof Uint8Array) {
        byteOffset = this.writeUint8Array(byteOffset, value);
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
        if ( vr === "UN" ) {
            byteOffset = this.writeUint8Array(byteOffset, value);
        } else if ( vr === "OB" ) {
            byteOffset = this.writeInt8Array(byteOffset, value);
        } else if ( vr === "OW" ) {
            byteOffset = this.writeInt16Array(byteOffset, value);
        } else if ( vr === "OF" ) {
            byteOffset = this.writeInt32Array(byteOffset, value);
        } else if ( vr === "OD" ) {
            byteOffset = this.writeInt64Array(byteOffset, value);
        } else if ( vr === "US") {
            byteOffset = this.writeUint16Array(byteOffset, value);
        } else if ( vr === "SS") {
            byteOffset = this.writeInt16Array(byteOffset, value);
        } else if ( vr === "UL") {
            byteOffset = this.writeUint32Array(byteOffset, value);
        } else if ( vr === "SL") {
            byteOffset = this.writeInt32Array(byteOffset, value);
        } else if ( vr === "FL") {
            byteOffset = this.writeFloat32Array(byteOffset, value);
        } else if ( vr === "FD") {
            byteOffset = this.writeFloat64Array(byteOffset, value);
        } else if ( vr === "SQ") {
            byteOffset = this.writeDataElementItems(byteOffset, value, isImplicit);
        } else if ( vr === "AT") {
            for ( var i = 0; i < value.length; ++i ) {
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
 * @param {String} vr The data Value Representation (VR).
 * @param {String} vl The data Value Length (VL).
 * @param {Number} byteOffset The offset to start writing from.
 * @param {Array} value The array to write.
 * @param {Boolean} isImplicit Is the DICOM VR implicit?
 * @returns {Number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writePixelDataElementValue = function (vr, vl, byteOffset, value, isImplicit) {
    // explicit length
    if (vl !== "u/l") {
        var finalValue = value[0];
        // flatten multi frame
        if (value.length > 1) {
            finalValue = dwv.dicom.flattenArrayOfTypedArrays(value);
        }
        // write
        byteOffset = this.writeDataElementValue(vr, byteOffset, finalValue, isImplicit);
    } else {
        // pixel data as sequence
        var item = {};
        // first item: basic offset table
        item.xFFFEE000 = {
            'tag': { group: "0xFFFE",
                element: "0xE000",
                name: "xFFFEE000" },
            'vr': "UN",
            'vl': 0,
            'value': []
        };
        // data
        for (var i = 0; i < value.length; ++i) {
            item[i] = {
                'tag': { group: "0xFFFE",
                    element: "0xE000",
                    name: "xFFFEE000" },
                'vr': vr,
                'vl': value[i].length,
                'value': value[i]
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
 * @param {Object} element The DICOM data element to write.
 * @param {Number} byteOffset The offset to start writing from.
 * @param {Boolean} isImplicit Is the DICOM VR implicit?
 * @returns {Number} The new offset position.
 */
dwv.dicom.DataWriter.prototype.writeDataElement = function (element, byteOffset, isImplicit) {
    var isTagWithVR = dwv.dicom.isTagWithVR(element.tag.group, element.tag.element);
    var is32bitVLVR = (isImplicit || !isTagWithVR) ? true : dwv.dicom.is32bitVLVR(element.vr);
    // group
    byteOffset = this.writeHex(byteOffset, element.tag.group);
    // element
    byteOffset = this.writeHex(byteOffset, element.tag.element);
    // VR
    if ( isTagWithVR && !isImplicit ) {
        byteOffset = this.writeString(byteOffset, element.vr);
        // reserved 2 bytes for 32bit VL
        if ( is32bitVLVR ) {
            byteOffset += 2;
        }
    }

    // update vl for sequence or item with implicit length
    var vl = element.vl;
    if ( dwv.dicom.isImplicitLengthSequence(element) ||
        dwv.dicom.isImplicitLengthItem(element) ||
        dwv.dicom.isImplicitLengthPixels(element) ) {
        vl = 0xffffffff;
    }
    // VL
    if ( is32bitVLVR ) {
        byteOffset = this.writeUint32(byteOffset, vl);
    }
    else {
        byteOffset = this.writeUint16(byteOffset, vl);
    }

    // value
    var value = element.value;
    // check value
    if (typeof value === 'undefined') {
        value = [];
    }
    // write
    if (element.tag.name === "x7FE00010") {
        byteOffset = this.writePixelDataElementValue(element.vr, element.vl, byteOffset, value, isImplicit);
    } else {
        byteOffset = this.writeDataElementValue(element.vr, byteOffset, value, isImplicit);
    }

    // sequence delimitation item for sequence with implicit length
    if ( dwv.dicom.isImplicitLengthSequence(element) ||
         dwv.dicom.isImplicitLengthPixels(element) ) {
        var seqDelimElement = {
            'tag': { group: "0xFFFE",
                element: "0xE0DD",
                name: "SequenceDelimitationItem" },
            'vr': "NONE",
            'vl': 0,
            'value': []
        };
        byteOffset = this.writeDataElement(seqDelimElement, byteOffset, isImplicit);
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
    // sequence with no length
    return (element.vr === "SQ") &&
        (element.vl === "u/l");
};

/**
 * Is this element an implicit length item?
 * @param {Object} element The element to check.
 * @returns {Boolean} True if it is.
 */
dwv.dicom.isImplicitLengthItem = function (element) {
    // item with no length
    return (element.tag.name === "xFFFEE000") &&
        (element.vl === "u/l");
};

/**
 * Is this element an implicit length pixel data?
 * @param {Object} element The element to check.
 * @returns {Boolean} True if it is.
 */
dwv.dicom.isImplicitLengthPixels = function (element) {
    // pixel data with no length
    return (element.tag.name === "x7FE00010") &&
        (element.vl === "u/l");
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
        'clear': function (item) {
            item.value[0] = "";
            item.vl = 0;
            item.endOffset = item.startOffset;
            return item;
        },
        'replace': function (item, value) {
            item.value[0] = value;
            item.vl = value.length;
            item.endOffset = item.startOffset + value.length;
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
        // 1. tag itself
        if (typeof this.rules[element.tag.name] !== 'undefined') {
        	rule = this.rules[element.tag.name];
        }
        // 2. tag name
        else if ( tagName !== null && typeof this.rules[tagName] !== 'undefined' ) {
            rule = this.rules[tagName];
        }
        // 3. group name
        else if ( typeof this.rules[groupName] !== 'undefined' ) {
            rule = this.rules[groupName];
        }
        // 4. default
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
    var icUIDTag = new dwv.dicom.Tag("0x0002", "0x0012"); // ImplementationClassUID
    var ivnTag = new dwv.dicom.Tag("0x0002", "0x0013"); // ImplementationVersionName
    for ( var i = 0, leni = keys.length; i < leni; ++i ) {
        element = this.getElementToWrite(dicomElements[keys[i]]);
        if ( element !== null &&
             !fmiglTag.equals2(element.tag) &&
             !icUIDTag.equals2(element.tag) &&
             !ivnTag.equals2(element.tag) ) {
            localSize = 0;
            // tag group name
            groupName = dwv.dicom.TagGroups[element.tag.group.substr(1)]; // remove first 0

            // prefix
            if ( groupName === 'Meta Element' ) {
                localSize += dwv.dicom.getDataElementPrefixByteSize(element.vr, false);
            } else {
                localSize += dwv.dicom.getDataElementPrefixByteSize(element.vr, isImplicit);
            }

            // value
            var realVl = element.endOffset - element.startOffset;
            localSize += parseInt(realVl, 10);

            // add size of sequence delimitation item
            if ( dwv.dicom.isImplicitLengthSequence(element) ||
                 dwv.dicom.isImplicitLengthPixels(element) ) {
                localSize += dwv.dicom.getDataElementPrefixByteSize("NONE", isImplicit);
            }

            // sort elements
            if ( groupName === 'Meta Element' ) {
                metaElements.push(element);
                metaLength += localSize;
            }
            else {
                rawElements.push(element);
            }

            // add to total size
            totalSize += localSize;
        }
    }

    // ImplementationClassUID
    var icUID = dwv.dicom.getDicomElement("ImplementationClassUID");
    var icUIDSize = dwv.dicom.getDataElementPrefixByteSize(icUID.vr, isImplicit);
    icUIDSize += dwv.dicom.setElementValue(icUID, "1.2.826.0.1.3680043.9.7278.1."+dwv.getVersion(), false);
    metaElements.push(icUID);
    metaLength += icUIDSize;
    totalSize += icUIDSize;
    // ImplementationVersionName
    var ivn = dwv.dicom.getDicomElement("ImplementationVersionName");
    var ivnSize = dwv.dicom.getDataElementPrefixByteSize(ivn.vr, isImplicit);
    ivnSize += dwv.dicom.setElementValue(ivn, "DWV_"+dwv.getVersion(), false);
    metaElements.push(ivn);
    metaLength += ivnSize;
    totalSize += ivnSize;

    // create the FileMetaInformationGroupLength element
    var fmigl = dwv.dicom.getDicomElement("FileMetaInformationGroupLength");
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
    offset = metaWriter.writeString(offset, "DICM");
    // FileMetaInformationGroupLength
    offset = metaWriter.writeDataElement(fmigl, offset, false);
    // write meta
    for ( var j = 0, lenj = metaElements.length; j < lenj; ++j ) {
        offset = metaWriter.writeDataElement(metaElements[j], offset, false);
    }
    // write non meta
    for ( var k = 0, lenk = rawElements.length; k < lenk; ++k ) {
        offset = dataWriter.writeDataElement(rawElements[k], offset, isImplicit);
    }

    // return
    return buffer;
};

/**
 * Get a DICOM element from its tag name (value set separatly).
 * @param {String} tagName The string tag name.
 * @return {Object} The DICOM element.
 */
dwv.dicom.getDicomElement = function (tagName)
{
   var tagGE = dwv.dicom.getGroupElementFromName(tagName);
   var dict = dwv.dicom.dictionary;
   // return element definition
   return {
     'tag': { 'group': tagGE.group, 'element': tagGE.element },
     'vr': dict[tagGE.group][tagGE.element][0],
     'vl': dict[tagGE.group][tagGE.element][1]
   };
};

/**
 * Set a DICOM element value according to its VR (Value Representation).
 * @param {Object} element The DICOM element to set the value.
 * @param {Object} value The value to set.
 * @param {Boolean} isImplicit Does the data use implicit VR?
 * @return {Number} The total element size.
 */
dwv.dicom.setElementValue = function (element, value, isImplicit) {
    // byte size of the element
    var size = 0;
    // special sequence case
    if ( element.vr === "SQ") {

        // set the value
        element.value = value;
        element.vl = 0;

        if ( value !== null && value !== 0 ) {
            var sqItems = [];
            var name;

            // explicit or implicit length
            var explicitLength = true;
            if ( typeof value.explicitLength !== "undefined" ) {
                explicitLength = value.explicitLength;
                delete value.explicitLength;
            }

            // items
            var itemData;
            var itemKeys = Object.keys(value);
            for ( var i = 0, leni = itemKeys.length; i < leni; ++i )
            {
                var itemElements = {};
                var subSize = 0;
                itemData = value[itemKeys[i]];

                // check data
                if ( itemData === null || itemData === 0 ) {
                    continue;
                }

                // elements
                var subElement;
                var elemKeys = Object.keys(itemData);
                for ( var j = 0, lenj = elemKeys.length; j < lenj; ++j )
                {
                    subElement = dwv.dicom.getDicomElement(elemKeys[j]);
                    subSize += dwv.dicom.setElementValue(subElement, itemData[elemKeys[j]]);

                    // add sequence delimitation size for sub sequences
                    if (dwv.dicom.isImplicitLengthSequence(subElement)) {
                        subSize += dwv.dicom.getDataElementPrefixByteSize("NONE", isImplicit);
                    }

                    name = dwv.dicom.getGroupElementKey(subElement.tag.group, subElement.tag.element);
                    itemElements[name] = subElement;
                    subSize += dwv.dicom.getDataElementPrefixByteSize(subElement.vr, isImplicit);
                }

                // item (after elements to get the size)
                var itemElement = {
                         'tag': { 'group': "0xFFFE", 'element': "0xE000" },
                         'vr': "NONE",
                         'vl': (explicitLength ? subSize : "u/l"),
                         'value': []
                     };
                name = dwv.dicom.getGroupElementKey(itemElement.tag.group, itemElement.tag.element);
                itemElements[name] = itemElement;
                subSize += dwv.dicom.getDataElementPrefixByteSize("NONE", isImplicit);

                // item delimitation
                if (!explicitLength) {
                    var itemDelimElement = {
                            'tag': { 'group': "0xFFFE", 'element': "0xE00D" },
                            'vr': "NONE",
                            'vl': 0,
                            'value': []
                        };
                    name = dwv.dicom.getGroupElementKey(itemDelimElement.tag.group, itemDelimElement.tag.element);
                    itemElements[name] = itemDelimElement;
                    subSize += dwv.dicom.getDataElementPrefixByteSize("NONE", isImplicit);
                }

                size += subSize;
                sqItems.push(itemElements);
            }

            element.value = sqItems;
            if (explicitLength) {
                element.vl = size;
            } else {
                element.vl = "u/l";
            }
        }
    }
    else {
        // set the value and calculate size
        size = 0;
        if (value instanceof Array) {
            element.value = value;
            for (var k = 0; k < value.length; ++k) {
                // spearator
                if (k !== 0) {
                    size += 1;
                }
                // value
                size += value[k].toString().length;
            }
        }
        else {
            element.value = [value];
            if (typeof value !== "undefined" && typeof value.length !== "undefined") {
                size = value.length;
            }
            else {
                // numbers
                size = 1;
            }
        }

        // convert size to bytes
        if ( element.vr === "US" || element.vr === "OW") {
            size *= Uint16Array.BYTES_PER_ELEMENT;
        }
        else if ( element.vr === "SS") {
            size *= Int16Array.BYTES_PER_ELEMENT;
        }
        else if ( element.vr === "UL") {
            size *= Uint32Array.BYTES_PER_ELEMENT;
        }
        else if ( element.vr === "SL") {
            size *= Int32Array.BYTES_PER_ELEMENT;
        }
        else if ( element.vr === "FL") {
            size *= Float32Array.BYTES_PER_ELEMENT;
        }
        else if ( element.vr === "FD") {
            size *= Float64Array.BYTES_PER_ELEMENT;
        }
        else {
            size *= Uint8Array.BYTES_PER_ELEMENT;
        }
        element.vl = size;
    }

    // return the size of that data
    return size;
};

/**
 * Get the DICOM element from a DICOM tags object.
 * @param {Object} tags The DICOM tags object.
 * @return {Object} The DICOM elements and the end offset.
 */
dwv.dicom.getElementsFromJSONTags = function (tags) {
    // transfer syntax
    var isImplicit = dwv.dicom.isImplicitTransferSyntax(tags.TransferSyntaxUID);
    // convert JSON to DICOM element object
    var keys = Object.keys(tags);
    var dicomElements = {};
    var dicomElement;
    var name;
    var offset = 128 + 4; // preamble
    var size;
    for ( var k = 0, len = keys.length; k < len; ++k )
    {
        // get the DICOM element definition from its name
        dicomElement = dwv.dicom.getDicomElement(keys[k]);
        // set its value
        size = dwv.dicom.setElementValue(dicomElement, tags[keys[k]], isImplicit);
        // set offsets
        offset += dwv.dicom.getDataElementPrefixByteSize(dicomElement.vr, isImplicit);
        dicomElement.startOffset = offset;
        offset += size;
        dicomElement.endOffset = offset;
        // create the tag group/element key
        name = dwv.dicom.getGroupElementKey(dicomElement.tag.group, dicomElement.tag.element);
        // store
        dicomElements[name] = dicomElement;
    }
    // return
    return {'elements': dicomElements, 'offset': offset };
};

/**
 * GradSquarePixGenerator
 * Generates a small gradient square.
 * @param {Number} numberOfColumns The image number of columns.
 * @param {Number} numberOfRows The image number of rows.
 * @constructor
 */
var GradSquarePixGenerator = function (numberOfColumns, numberOfRows) {

    var halfCols = numberOfColumns * 0.5;
    var halfRows = numberOfRows * 0.5;
    var maxNoBounds = (numberOfColumns/2 + halfCols/2) * (numberOfRows/2 + halfRows/2);
    var max = 100;

    /**
     * Get a grey value.
     * @param {Number} i The column index.
     * @param {Number} j The row index.
     * @return {Array} The grey value.
     */
    this.getGrey = function (i,j) {
        var value = max;
        var jc = Math.abs( j - halfRows );
        var ic = Math.abs( i - halfCols );
        if ( jc < halfRows/2 && ic < halfCols/2 ) {
            value += (i * j) * (max / maxNoBounds);
        }
        return [value];
    };

    /**
     * Get RGB values.
     * @param {Number} i The column index.
     * @param {Number} j The row index.
     * @return {Array} The [R,G,B] values.
     */
    this.getRGB = function (i,j) {
        var value = 0;
        var jc = Math.abs( j - halfRows );
        var ic = Math.abs( i - halfCols );
        if ( jc < halfRows/2 && ic < halfCols/2 ) {
            value += (i * j) * (max / maxNoBounds);
        }
        if (value > 255 ) {
            value = 200;
        }
        return [0, value, value];
    };
};

// List of pixel generators.
dwv.dicom.pixelGenerators = {
    'gradSquare': GradSquarePixGenerator
};

/**
 * Get the DICOM pixel data from a DICOM tags object.
 * @param {Object} tags The DICOM tags object.
 * @param {Object} startOffset The start offset of the pixel data.
 * @param {String} pixGeneratorName The name of a pixel generator.
 * @return {Object} The DICOM pixel data element.
 */
dwv.dicom.generatePixelDataFromJSONTags = function (tags, startOffset, pixGeneratorName) {

    // default generator
    if ( typeof pixGeneratorName === "undefined" ) {
        pixGeneratorName = "gradSquare";
    }

    // check tags
    if ( typeof tags.TransferSyntaxUID === "undefined" ) {
        throw new Error("Missing transfer syntax for pixel generation.");
    } else if ( typeof tags.Rows === "undefined" ) {
        throw new Error("Missing number of rows for pixel generation.");
    } else if ( typeof tags.Columns === "undefined" ) {
        throw new Error("Missing number of columns for pixel generation.");
    } else if ( typeof tags.BitsAllocated === "undefined" ) {
        throw new Error("Missing BitsAllocated for pixel generation.");
    } else if ( typeof tags.PixelRepresentation === "undefined" ) {
        throw new Error("Missing PixelRepresentation for pixel generation.");
    } else if ( typeof tags.SamplesPerPixel === "undefined" ) {
        throw new Error("Missing SamplesPerPixel for pixel generation.");
    } else if ( typeof tags.PhotometricInterpretation === "undefined" ) {
        throw new Error("Missing PhotometricInterpretation for pixel generation.");
    }

    // extract info from tags
    var isImplicit = dwv.dicom.isImplicitTransferSyntax(tags.TransferSyntaxUID);
    var numberOfRows = tags.Rows;
    var numberOfColumns = tags.Columns;
    var bitsAllocated = tags.BitsAllocated;
    var pixelRepresentation = tags.PixelRepresentation;
    var samplesPerPixel = tags.SamplesPerPixel;
    var photometricInterpretation = tags.PhotometricInterpretation;

    var sliceLength = numberOfRows * numberOfColumns;
    var dataLength = sliceLength * samplesPerPixel;

    // check values
    if (samplesPerPixel !== 1 && samplesPerPixel !== 3) {
        throw new Error("Unsupported SamplesPerPixel for pixel generation: "+samplesPerPixel);
    }
    if ( (samplesPerPixel === 1 && !( photometricInterpretation === "MONOCHROME1" ||
        photometricInterpretation === "MONOCHROME2" ) ) ||
        ( samplesPerPixel === 3 && photometricInterpretation !== "RGB" ) ) {
        throw new Error("Unsupported PhotometricInterpretation for pixel generation: " +
            photometricInterpretation + " with SamplesPerPixel: " + samplesPerPixel);
    }

    var nSamples = 1;
    var nColourPlanes = 1;
    if ( samplesPerPixel === 3 ) {
        if ( typeof tags.PlanarConfiguration === "undefined" ) {
            throw new Error("Missing PlanarConfiguration for pixel generation.");
        }
        var planarConfiguration = tags.PlanarConfiguration;
        if ( planarConfiguration !== 0 && planarConfiguration !== 1 ) {
            throw new Error("Unsupported PlanarConfiguration for pixel generation: "+planarConfiguration);
        }
        if ( planarConfiguration === 0 ) {
            nSamples = 3;
        } else {
            nColourPlanes = 3;
        }
    }

    // create pixel array
    var pixels = dwv.dicom.getTypedArray(
        bitsAllocated, pixelRepresentation, dataLength );

    // pixels generator
    if (typeof dwv.dicom.pixelGenerators[pixGeneratorName] === "undefined" ) {
        throw new Error("Unknown PixelData generator: "+pixGeneratorName);
    }
    var generator = new dwv.dicom.pixelGenerators[pixGeneratorName](numberOfColumns, numberOfRows);
    var generate = generator.getGrey;
    if (photometricInterpretation === "RGB") {
        generate = generator.getRGB;
    }

    // main loop
    var offset = 0;
    for ( var c = 0; c < nColourPlanes; ++c ) {
        for ( var j = 0; j < numberOfRows; ++j ) {
            for ( var i = 0; i < numberOfColumns; ++i ) {
                for ( var s = 0; s < nSamples; ++s ) {
                    if ( nColourPlanes !== 1 ) {
                        pixels[offset] = generate(i,j)[c];
                    } else {
                        pixels[offset] = generate(i,j)[s];
                    }
                    ++offset;
                }
            }
        }
    }

    // create and return the DICOM element
    var vr = "OW";
    if ( bitsAllocated === 8 ) {
        vr = "OB";
    }
    var pixVL = dwv.dicom.getDataElementPrefixByteSize(vr, isImplicit) +
       (pixels.BYTES_PER_ELEMENT * dataLength);
    return {
            'tag': { 'group': "0x7FE0", 'element': "0x0010" },
            'vr': vr,
            'vl': pixVL,
            'value': pixels,
            'startOffset': startOffset,
            'endOffset': startOffset + pixVL
        };
};
