/**
 * DICOM module.
 * @module dicom
 */
var dwv = dwv || {};
dwv.dicom = dwv.dicom || {};

/**
 * Data writer.
 * @class DataWriter
 * @namespace dwv.dicom
 * @constructor
 * @param {Array} buffer The input array buffer.
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
 */
dwv.dicom.DataWriter = function (buffer)
{
    var view = new DataView(buffer);
    var isLittleEndian = true;

    this.writeUint8 = function (byteOffset, value) {
        view.setUint8(byteOffset, value);
    };

    this.writeUint16 = function (byteOffset, value) {
        view.setUint16(byteOffset, value, isLittleEndian);
    };

    this.writeUint32 = function (byteOffset, value) {
        view.setUint32(byteOffset, value, isLittleEndian);
    };

    this.writeUint8Array = function (byteOffset, array) {
        for ( var i = 0; i < array.length; ++i ) {
            this.writeUint8((byteOffset + i), array[i]);
        }
    };

    this.writeUint16Array = function (byteOffset, array) {
        for ( var i = 0; i < array.length; ++i ) {
            this.writeUint16((byteOffset + 2*i), array[i]);
        }
    };

    this.writeUint32Array = function (byteOffset, array) {
        for ( var i = 0; i < array.length; ++i ) {
            this.writeUint32((byteOffset + 4*i), array[i]);
        }
    };

    this.writeHex = function (byteOffset, str) {
        var value = parseInt(str.substr(2), 16);
        view.setUint16(byteOffset, value, isLittleEndian);
    };

    this.writeString = function(byteOffset, str) {
        for ( var i = 0; i < str.length; ++i ) {
            view.setUint8((byteOffset + i), str.charCodeAt(i));
        }
    };

    this.writeStringArray = function(byteOffset, array) {
        for ( var i = 0; i < array.length; ++i ) {
            this.writeString(byteOffset, array[i]);
            byteOffset += array[i].length;
            if ( i !== array.length - 1 ) {
                this.writeString(byteOffset, "\\");
            }
            else {
                this.writeString(byteOffset, " ");
            }
            byteOffset += 1;
        }
    };

};

/**
 * DICOM writer.
 * @class DicomWriter
 * @namespace dwv.dicom
 * @constructor
 * @param {Array} dicomElements The wrapped elements to wrap.
 */
dwv.dicom.DicomWriter = function (dicomElements) {

    var actions = {
        'copy': function (item) { return item; },
        'remove': function () { return null; },
        'clear': function (item) { item.value[0] = ""; return item; },
        'replace': function (item, value) { item.value[0] = value; return item; }
    };

    // names: 'default', tagName or groupName
    // priority: tagName, groupName, default
    var rules = {
        'default': {'action': 'remove', 'value': null },
        'PatientName': {'action': 'replace', 'value': 'Anonymized'}, // tag
        'Acquisition' : {'action': 'copy', 'value': null }, // group 'x0018'
        'Image Presentation' : {'action': 'copy', 'value': null }, // group 'x0028'
        'Procedure' : {'action': 'copy', 'value': null }, // group 'x0040'
        'Pixel Data' : {'action': 'copy', 'value': null } // group 'x7fe0'
    };

    this.getElementToWrite = function (element) {
        var result = null;
        var tagName = null;
        var dict = dwv.dicom.dictionary;
        var group = element.group;
        var groupName = dwv.dicom.TagGroups[group.substr(1)]; // remove first 0
        if ( typeof dict[group] !== 'undefined' ) {
            tagName = dict[group][element.element][2];
        }
        // apply rules:
        // 1. tag name
        if ( tagName !== null && typeof rules[tagName] !== 'undefined' ) {
            result = actions[rules[tagName].action](element, rules[tagName].value);
        }
        // 2. group name
        else if ( typeof rules[groupName] !== 'undefined' ) {
            result = actions[rules[groupName].action](element, rules[groupName].value);
        }
        // 3. default
        else {
            result = actions[rules['default'].action](element, rules['default'].value);
        }
        return result;
    };

    this.getBuffer = function () {
        var keys = Object.keys(dicomElements);
        var element;
        var isOtherVR;
        var size = 128 + 4; // DICM
        for ( var i = 0 ; i < keys.length; ++i ) {
            element = this.getElementToWrite(dicomElements[keys[i]]);
            if ( element !== null ) {
                isOtherVR = (element.vr[0] === 'O');
                if ( isOtherVR ) {
                    size += 4;
                }
                size += 8 + element.vl;
            }
        }
        console.log("size: "+size);

        var buffer = new ArrayBuffer(size);
        var writer = new dwv.dicom.DataWriter(buffer);
        var offset = 128;
        writer.writeString(offset, "DICM");
        offset += 4;
        for ( var j = 0 ; j < keys.length; ++j ) {
            element = this.getElementToWrite(dicomElements[keys[j]]);
            if ( element !== null ) {
                // group
                writer.writeHex(offset, element.group);
                offset += 2;
                // element
                writer.writeHex(offset, element.element);
                offset += 2;
                // VR
                writer.writeString(offset, element.vr);
                offset += 2;
                // VL
                isOtherVR = (element.vr[0] === 'O');
                if ( isOtherVR ) {
                    offset += 2;
                    writer.writeUint32(offset, element.vl);
                    offset += 4;
                }
                else {
                    writer.writeUint16(offset, element.vl);
                    offset += 2;
                }
                // data
                if ( element.vr === "OB") {
                    writer.writeUint8Array(offset, element.value);
                }
                else if ( element.vr === "US" || element.vr === "OW") {
                    writer.writeUint16Array(offset, element.value);
                }
                else if ( element.vr === "UL") {
                    writer.writeUint32Array(offset, element.value);
                }
                else {
                    writer.writeStringArray(offset, element.value);
                }
                offset += element.vl;
            }
        }
        return buffer;
    };
};
