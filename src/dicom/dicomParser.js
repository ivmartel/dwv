/** 
 * DICOM module.
 * @module dicom
 */
var dwv = dwv || {};
dwv.dicom = dwv.dicom || {};

/**
 * Data reader.
 * @class DataReader
 * @namespace dwv.dicom
 * @constructor
 * @param {Array} buffer The input array buffer.
 * @param {Boolean} isLittleEndian Flag to tell if the data is little or big endian.
 */
dwv.dicom.DataReader = function(buffer, isLittleEndian)
{
    /**
     * The main data view.
     * @property view
     * @private
     * @type DataView
     */
    var view = new DataView(buffer);
    // Set endian flag if not defined.
    if(typeof(isLittleEndian)==='undefined') {
        isLittleEndian = true;
    }
    
    /**
     * Read Uint8 (1 byte) data.
     * @method readUint8
     * @param {Number} byteOffset The offset to start reading from.
     * @return {Number} The read data.
     */
    this.readUint8 = function(byteOffset) {
        return view.getUint8(byteOffset, isLittleEndian);
    };
    /**
     * Read Uint16 (2 bytes) data.
     * @method readUint16
     * @param {Number} byteOffset The offset to start reading from.
     * @return {Number} The read data.
     */
    this.readUint16 = function(byteOffset) {
        return view.getUint16(byteOffset, isLittleEndian);
    };
    /**
     * Read Uint32 (4 bytes) data.
     * @method readUint32
     * @param {Number} byteOffset The offset to start reading from.
     * @return {Number} The read data.
     */
    this.readUint32 = function(byteOffset) {
        return view.getUint32(byteOffset, isLittleEndian);
    };
    /**
     * Read Float32 (8 bytes) data.
     * @method readFloat32
     * @param {Number} byteOffset The offset to start reading from.
     * @return {Number} The read data.
     */
    this.readFloat32 = function(byteOffset) {
        return view.getFloat32(byteOffset, isLittleEndian);
    };
    /**
     * Read Uint8 array.
     * @method readUint8Array
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readUint8Array = function(byteOffset, size) {
        var data = new Uint8Array(size);
        var index = 0;
        for(var i=byteOffset; i<byteOffset + size; ++i) {     
            data[index++] = this.readUint8(i);
        }
        return data;
    };
    /**
     * Read Uint16 array.
     * @method readUint16Array
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readUint16Array = function(byteOffset, size) {
        var data = new Uint16Array(size/2);
        var index = 0;
        for(var i=byteOffset; i<byteOffset + size; i+=2) {     
            data[index++] = this.readUint16(i);
        }
        return data;
    };
    /**
     * Read Uint32 array.
     * @method readUint32Array
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readUint32Array = function(byteOffset, size) {
        var data = new Uint32Array(size/4);
        var index = 0;
        for(var i=byteOffset; i<byteOffset + size; i+=4) {     
            data[index++] = this.readUint32(i);
        }
        return data;
    };
    /**
     * Read data as an hexadecimal string.
     * @method readHex
     * @param {Number} byteOffset The offset to start reading from.
     * @return {Array} The read data.
     */
    this.readHex = function(byteOffset) {
        // read and convert to hex string
        var str = this.readUint16(byteOffset).toString(16);
        // return padded
        return "0x0000".substr(0, 6 - str.length) + str.toUpperCase();
    };
    /**
     * Read data as a string.
     * @method readString
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} nChars The number of characters to read.
     * @return {String} The read data.
     */
    this.readString = function(byteOffset, nChars) {
        var result = "";
        for(var i=byteOffset; i<byteOffset + nChars; ++i){
            result += String.fromCharCode( this.readUint8(i) );
        }
        return result;
    };
};

/**
 * Tell if a given syntax is a JPEG one.
 * @method isJpegTransferSyntax
 * @param {String} The transfer syntax to test.
 * @returns {Boolean} True if a jpeg syntax.
 */
dwv.dicom.isJpegTransferSyntax = function(syntax)
{
    return syntax.match(/1.2.840.10008.1.2.4.5/) !== null ||
        syntax.match(/1.2.840.10008.1.2.4.6/) !== null||
        syntax.match(/1.2.840.10008.1.2.4.7/) !== null;
};

/**
 * Tell if a given syntax is a JPEG-LS one.
 * @method isJpeglsTransferSyntax
 * @param {String} The transfer syntax to test.
 * @returns {Boolean} True if a jpeg-ls syntax.
 */
dwv.dicom.isJpeglsTransferSyntax = function(syntax)
{
    return syntax.match(/1.2.840.10008.1.2.4.8/) !== null;
};

/**
 * Tell if a given syntax is a JPEG 2000 one.
 * @method isJpeg2000TransferSyntax
 * @param {String} The transfer syntax to test.
 * @returns {Boolean} True if a jpeg 2000 syntax.
 */
dwv.dicom.isJpeg2000TransferSyntax = function(syntax)
{
    return syntax.match(/1.2.840.10008.1.2.4.9/) !== null;
};

/**
 * DicomParser class.
 * @class DicomParser
 * @namespace dwv.dicom
 * @constructor
 */
dwv.dicom.DicomParser = function()
{
    /**
     * The list of DICOM elements.
     * @property dicomElements
     * @type Array
     */
    this.dicomElements = {};
    /**
     * The pixel buffer.
     * @property pixelBuffer
     * @type Array
     */
    this.pixelBuffer = [];
    
    /**
     * Unknown tags count.
     * @property unknownCount
     * @type Number
     */
    var unknownCount = 0;
    /**
     * Get the next unknown tags count.
     * @method getNextUnknownCount
     * @returns {Number} The next count.
     */
    this.getNextUnknownCount = function () {
        unknownCount++;    
        return unknownCount;
    }; 
};

/**
 * Get the DICOM data elements.
 * @method getDicomElements
 * @returns {Object} The DICOM elements.
 */
dwv.dicom.DicomParser.prototype.getDicomElements = function()
{
    return this.dicomElements;
};

/**
 * Get the DICOM data pixel buffer.
 * @method getPixelBuffer
 * @returns {Array} The pixel buffer.
 */
dwv.dicom.DicomParser.prototype.getPixelBuffer = function()
{
    return this.pixelBuffer;
};

/**
 * Append a DICOM element to the dicomElements member object.
 * Allows for easy retrieval of DICOM tag values from the tag name.
 * If tags have same name (for the 'unknown' private tags cases), a number is appended
 * making the name unique.
 * @method appendDicomElement
 * @param {Object} element The element to add.
 * @param {Object} sequences The sequence the element belongs to (optional).
 */
dwv.dicom.DicomParser.prototype.appendDicomElement = function( element, sequences )
{
    // simple case: not a sequence
    if ( typeof sequences === "undefined" || sequences.length === 0) {
        this.dicomElements[element.name] = { 
            "group": element.group, 
            "element": element.element,
            "vr": element.vr,
            "vl": element.vl,
            "value": element.value 
        };
    }
    else {
        // nothing to do for items and delimitations
        if ( element.name === "Item" || 
                element.name === "ItemDelimitationItem" ||
                element.name === "SequenceDelimitationItem" ) {
            return;
        }
        // create root for nested sequences
        var sequenceName = sequences[0].name;
        var itemNumber = sequences[0].itemNumber;
        var root = this.dicomElements;
        for ( var i = 1; i < sequences.length; ++i ) {
            // update root with previous name and number
            if ( typeof root[sequenceName].value[itemNumber] !== "undefined" ) {
                root = root[sequenceName].value[itemNumber];
            }
            // update name and number
            sequenceName = sequences[i].name;
            itemNumber = sequences[i].itemNumber;
        }
        // append
        this.appendElementToSequence(root, sequenceName, itemNumber, element);

    }
};

/**
 * Append an element to a sequence.
 * @method appendElementToSequence
 * @param {Object} root The DICOM element root where to append the element.
 * @param {String} sequenceName The tail sequence name.
 * @param {Number} itemNumber The tail item number.
 * @param {Object} element The element to append.
 */
dwv.dicom.DicomParser.prototype.appendElementToSequence = function (root, sequenceName, itemNumber, element)
{
    // start the sequence
    if ( typeof root[sequenceName] === "undefined" ) {
        root[sequenceName] = { 
            "group": element.group, 
            "element": element.element,
            "vr": element.vr,
            "vl": element.vl,
            "value": [] 
        };
    }
    // continue the sequence
    else {
        // add item array if needed
        if ( typeof root[sequenceName].value[itemNumber] === "undefined" ) {
            root[sequenceName].value[itemNumber] = {};
        }
        // append element
        root[sequenceName].value[itemNumber][element.name] = { 
            "group": element.group, 
            "element": element.element,
            "vr": element.vr,
            "vl": element.vl,
            "value": element.value 
        };
    }
};

/**
 * Read a DICOM tag.
 * @method readTag
 * @param reader The raw data reader.
 * @param offset The offset where to start to read.
 * @returns An object containing the tags 'group', 'element' and 'name'.
 */
dwv.dicom.DicomParser.prototype.readTag = function(reader, offset)
{
    // group
    var group = reader.readHex(offset);
    // element
    var element = reader.readHex(offset+2);
    // vr and name
    var vr = "UN";
    var name = null;
    if( typeof dwv.dicom.dictionary[group] !== "undefined" &&
            typeof dwv.dicom.dictionary[group][element] !== "undefined" ) {
        vr = dwv.dicom.dictionary[group][element][0];
        name = dwv.dicom.dictionary[group][element][2];
    }
    else {
        name = "dwv::unknown" + this.getNextUnknownCount().toString();
    }

    // return
    return {'group': group, 'element': element, 'name': name, 'vr': vr};
};

/**
 * Read a DICOM data element.
 * @method readDataElement
 * @param reader The raw data reader.
 * @param offset The offset where to start to read.
 * @param implicit Is the DICOM VR implicit?
 * @returns {Object} An object containing the element 'tag', 'vl', 'vr', 'data' and 'offset'.
 */
dwv.dicom.DicomParser.prototype.readDataElement = function(reader, offset, implicit)
{
    // tag: group, element
    var tag = this.readTag(reader, offset);
    var tagOffset = 4;
    
    var vr; // Value Representation (VR)
    var vl; // Value Length (VL)
    var vrOffset = 0; // byte size of VR
    var vlOffset = 0; // byte size of VL
    
    // (private) Item group case
    if( tag.group === "0xFFFE" ) {
        vr = "N/A";
        vrOffset = 0;
        vl = reader.readUint32( offset+tagOffset );
        vlOffset = 4;
    }
    // non Item case
    else {
        // implicit VR?
        if(implicit) {
            vr = tag.vr;
            vrOffset = 0;
            vl = reader.readUint32( offset+tagOffset+vrOffset );
            vlOffset = 4;
        }
        else {
            vr = reader.readString( offset+tagOffset, 2 );
            vrOffset = 2;
            // long representations
            if(vr === "OB" || vr === "OF" || vr === "SQ" || vr === "OW" || vr === "UN") {
                vl = reader.readUint32( offset+tagOffset+vrOffset+2 );
                vlOffset = 6;
            }
            // short representation
            else {
                vl = reader.readUint16( offset+tagOffset+vrOffset );
                vlOffset = 2;
            }
        }
    }
    
    // check the value of VL
    var vlString = vl;
    if( vl === 0xffffffff ) {
        vlString = "u/l";
        vl = 0;
    }
    
    // data
    var data = null;
    var dataOffset = offset+tagOffset+vrOffset+vlOffset;
    if( vr === "OB" || vr === "N/A")
    {
        data = reader.readUint8Array( dataOffset, vl );
    }
    else if( vr === "US")
    {
        data = reader.readUint16Array( dataOffset, vl );
    }
    else if( vr === "UL")
    {
        data = reader.readUint32Array( dataOffset, vl );
    }
    else if( vr === "OX" || vr === "OW" )
    {
        if ( vr === "OX" ) {
            console.warn("OX value representation for tag: "+tag.name+".");
        }
        if ( typeof(this.dicomElements.BitsAllocated) !== 'undefined' &&
                this.dicomElements.BitsAllocated.value[0] === 8 ) {
            data = reader.readUint8Array( dataOffset, vl );
        }
        else {
            data = reader.readUint16Array( dataOffset, vl );
        }
    }
    else
    {
        data = reader.readString( dataOffset, vl);
        data = data.split("\\");                
    }    

    // total element offset
    var elementOffset = tagOffset + vrOffset + vlOffset + vl;
    
    // return
    return { 
        'tag': tag, 
        'vr': vr, 
        'vl': vlString, 
        'data': data,
        'offset': elementOffset
    };    
};

/**
 * Parse the complete DICOM file (given as input to the class).
 * Fills in the member object 'dicomElements'.
 * @method parse
 * @param buffer The input array buffer.
 */
dwv.dicom.DicomParser.prototype.parse = function(buffer)
{
    var offset = 0;
    var implicit = false;
    var jpeg = false;
    var jpeg2000 = false;
    // default readers
    var metaReader = new dwv.dicom.DataReader(buffer);
    var dataReader = new dwv.dicom.DataReader(buffer);

    // 128 -> 132: magic word
    offset = 128;
    var magicword = metaReader.readString( offset, 4 );
    if(magicword !== "DICM")
    {
        throw new Error("Not a valid DICOM file (no magic DICM word found)");
    }
    offset += 4;
    
    // 0x0002, 0x0000: FileMetaInformationGroupLength
    var dataElement = this.readDataElement(metaReader, offset);
    var metaLength = parseInt(dataElement.data[0], 10);
    offset += dataElement.offset;
    
    // meta elements
    var metaStart = offset;
    var metaEnd = metaStart + metaLength;
    var i = metaStart;
    while( i < metaEnd ) 
    {
        // get the data element
        dataElement = this.readDataElement(metaReader, i, false);
        // store the data element
        this.appendDicomElement( { 
            'name': dataElement.tag.name,
            'group': dataElement.tag.group, 
            'vr' : dataElement.vr, 
            'vl' : dataElement.vl, 
            'element': dataElement.tag.element,
            'value': dataElement.data 
        });
        // increment index
        i += dataElement.offset;
    }
    
    // check the transfer syntax
    var syntax = dwv.utils.cleanString(this.dicomElements.TransferSyntaxUID.value[0]);
    
    // Implicit VR - Little Endian
    if( syntax === "1.2.840.10008.1.2" ) {
        implicit = true;
    }
    // Explicit VR - Little Endian (default): 1.2.840.10008.1.2.1 
    // Deflated Explicit VR - Little Endian
    else if( syntax === "1.2.840.10008.1.2.1.99" ) {
        throw new Error("Unsupported DICOM transfer syntax (Deflated Explicit VR): "+syntax);
    }
    // Explicit VR - Big Endian
    else if( syntax === "1.2.840.10008.1.2.2" ) {
        dataReader = new dwv.dicom.DataReader(buffer,false);
    }
    // JPEG
    else if( dwv.dicom.isJpegTransferSyntax(syntax) ) {
        jpeg = true;
        //console.log("JPEG compressed DICOM data: " + syntax);
        throw new Error("Unsupported DICOM transfer syntax (JPEG): "+syntax);
    }
    // JPEG-LS
    else if( dwv.dicom.isJpeglsTransferSyntax(syntax) ) {
        //console.log("JPEG-LS compressed DICOM data: " + syntax);
        throw new Error("Unsupported DICOM transfer syntax (JPEG-LS): "+syntax);
    }
    // JPEG 2000
    else if( dwv.dicom.isJpeg2000TransferSyntax(syntax) ) {
        console.log("JPEG 2000 compressed DICOM data: " + syntax);
        jpeg2000 = true;
    }
    // MPEG2 Image Compression
    else if( syntax === "1.2.840.10008.1.2.4.100" ) {
        throw new Error("Unsupported DICOM transfer syntax (MPEG2): "+syntax);
    }
    // RLE (lossless)
    else if( syntax === "1.2.840.10008.1.2.5" ) {
        throw new Error("Unsupported DICOM transfer syntax (RLE): "+syntax);
    }

    var startedPixelItems = false;
    
    var tagName = "";
    var tagOffset = 0;
    var sequences = [];
    // DICOM data elements
    while( i < buffer.byteLength ) 
    {
        // get the data element
        try
        {
            dataElement = this.readDataElement(dataReader, i, implicit);
        }
        catch(err)
        {
            console.warn("Problem reading at " + i + " / " + buffer.byteLength +
                ", after " + tagName + ".\n" + err);
        }
        
        // locals
        tagName = dataElement.tag.name;
        tagOffset = dataElement.offset;
        var vlNumber = (dataElement.vl === "u/l") ? 0 : dataElement.vl;
        
        // new sequence
        if ( dataElement.vr === "SQ" && dataElement.vl !== 0 ) {
            sequences.push( {
                'name': tagName, 'itemNumber': -1,
                'vl': dataElement.vl, 'vlCount': 0
            });
            tagOffset -= vlNumber;
        }
        // new item
        if ( sequences.length !== 0 && tagName === "Item" ) {
            sequences[sequences.length-1].itemNumber += 1;
            if ( !startedPixelItems ) {
                tagOffset -= vlNumber;
            }
        }
        // end of sequence with implicit length
        else if ( tagName === "SequenceDelimitationItem" ) {
            sequences = sequences.slice(0, -1);
        }
        
        // store pixel data from multiple items
        if( startedPixelItems ) {
            if( tagName === "Item" ) {
                if( dataElement.data.length === 4 ) {
                    console.log("Skipping Basic Offset Table.");
                }
                else if( dataElement.data.length !== 0 ) {
                    console.log("Concatenating multiple pixel data items, length: "+dataElement.data.length);
                    // concat does not work on typed arrays
                    //this.pixelBuffer = this.pixelBuffer.concat( dataElement.data );
                    // manual concat...
                    var size = dataElement.data.length + this.pixelBuffer.length;
                    var newBuffer = new Uint16Array(size);
                    newBuffer.set( this.pixelBuffer, 0 );
                    newBuffer.set( dataElement.data, this.pixelBuffer.length );
                    this.pixelBuffer = newBuffer;
                }
            }
            else if( tagName === "SequenceDelimitationItem" ) {
                startedPixelItems = false;
            }
            else {
                throw new Error("Unexpected tag in encapsulated pixel data: "+dataElement.tag.name);
            }
        }
        // check the pixel data tag
        if( tagName === "PixelData") {
            if( dataElement.data.length !== 0 ) {
                this.pixelBuffer = dataElement.data;
            }
            else {
                startedPixelItems = true;
            }
        }
        
        // store the data element
        this.appendDicomElement( {
            'name': tagName,
            'group' : dataElement.tag.group, 
            'vr' : dataElement.vr, 
            'vl' : dataElement.vl, 
            'element': dataElement.tag.element,
            'value': dataElement.data 
            }, sequences );
        
        // end of sequence with explicit length
        if ( dataElement.vr !== "SQ" && sequences.length !== 0 ) {
            var last = sequences.length - 1;
            sequences[last].vlCount += tagOffset;
            if ( sequences[last].vlCount === sequences[last].vl ) {
                sequences = sequences.slice(0, -1);
            }
        }
        
        // increment index
        i += tagOffset;
    }
    
    // uncompress data
    if( jpeg ) {
        // using jpgjs from https://github.com/notmasteryet/jpgjs
        // -> error with ffc3 and ffc1 jpeg jfif marker
        /*var j = new JpegImage();
        j.parse(this.pixelBuffer);
        var d = 0;
        j.copyToImageData(d);
        this.pixelBuffer = d.data;*/
    }
    else if( jpeg2000 ) {
        // decompress pixel buffer into Uint8 image
        var uint8Image = null;
        try {
            uint8Image = openjpeg(this.pixelBuffer, "j2k");
        } catch(error) {
            throw new Error("Cannot decode JPEG 2000 ([" +error.name + "] " + error.message + ")");
        }
        this.pixelBuffer = uint8Image.data;
    }
};
