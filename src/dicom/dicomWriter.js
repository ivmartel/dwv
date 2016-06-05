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
 * @constructor
 * @param {Array} dicomElements The wrapped elements to wrap.
 */
dwv.dicom.DicomWriter = function (dicomElements) {

    this.actions = {
        'copy': function (item) { return item; },
        'remove': function () { return null; },
        'clear': function (item) { item.value[0] = ""; return item; },
        'replace': function (item, value) { item.value[0] = value; return item; }
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
    
    this.writeElement = function (element, writer, offset) {
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
        var isOtherVR = (element.vr[0] === 'O');
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
        else if ( element.vr === "SQ") {
            // not yet...
        }
        else {
            writer.writeStringArray(offset, element.value);
        }
        offset += parseInt(element.vl, 10);
        
        return offset;
    };

    this.getBuffer = function () {
        var keys = Object.keys(dicomElements);
        var element;
        
        // calculate buffer size
        var isOtherVR;
        var size = 128 + 4; // DICM
        for ( var i = 0; i < keys.length; ++i ) {
            element = this.getElementToWrite(dicomElements[keys[i]]);
            if ( element !== null ) {
                isOtherVR = (element.vr[0] === 'O');
                if ( isOtherVR ) {
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
        writer.writeString(offset, "DICM");
        offset += 4;
        // write meta
        for ( var l = 0; l < metaElements.length; ++l ) {
            offset = this.writeElement(metaElements[l], writer, offset);
        }
        // write non meta
        for ( var j = 0; j < rawElements.length; ++j ) {
            offset = this.writeElement(rawElements[j], writer, offset);
        }
        return buffer;
    };
};
