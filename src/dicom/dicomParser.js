/**
 * @namespace DICOM related.
 */
dwv.dicom = dwv.dicom || {};

/**
 * @class Big Endian reader
 * @param file
 */
dwv.dicom.BigEndianReader = function(file)
{
    this.readByteAt = function(i) {
        return file.charCodeAt(i) & 0xff;
    };
    this.readNumber = function(nBytes, startByte) {
        var result = 0;
        for(var i=startByte; i<startByte + nBytes; ++i){
            result = result * 256 + this.readByteAt(i);
        }
        return result;
    };
    this.readString = function(nChars, startChar) {
        var result = "";
        for(var i=startChar; i<startChar + nChars; i++){
            result += String.fromCharCode(this.readNumber(1,i));
        }
        return result;
    };
};

/**
 * @class Litte Endian reader
 * @param file
 */
dwv.dicom.LittleEndianReader = function(file)
{
    this.readByteAt = function(i) {
        return file.charCodeAt(i) & 0xff;
    };
    this.readNumber = function(nBytes, startByte) {
        var result = 0;
        for(var i=startByte + nBytes; i>startByte; i--){
            result = result * 256 + this.readByteAt(i-1);
        }
        return result;
    };
    this.readString = function(nChars, startChar) {
        var result = "";
        for(var i=startChar; i<startChar + nChars; i++){
            result += String.fromCharCode(this.readNumber(1,i));
        }
        return result;
    };
};

/**
 * @class DicomParser class.
 */
dwv.dicom.DicomParser = function(file)
{
    // members
    this.inputBuffer = new Array(file.length);
    this.dicomElements = {};
    this.dict = new dwv.dicom.Dictionary();
    this.file = file;
};

/**
 * Get the DICOM data pixel buffer.
 * @returns The pixel buffer (as an array).
 */
dwv.dicom.DicomParser.prototype.getPixelBuffer=function()
{
    return this.pixelBuffer;
};

/**
 * Append a DICOM element to the dicomElements member object.
 * Allows for easy retrieval of DICOM tag values from the tag name.
 * @param element The element to add.
 */
dwv.dicom.DicomParser.prototype.appendDicomElement=function( element )
{
    // find a good tag name
    var name = element.name;
    var count = 0;
    while( this.dicomElements[name] ) {
        name = element.name + (count++).toString();
    }
    // store it
    this.dicomElements[name] = { 
            "group": element.group, "element": element.element, 
            "value": element.value };
};

/**
 * Read a DICOM tag.
 * @param reader The raw data reader.
 * @param offset The offset where to start to read.
 * @returns An object containing the tags 'group', 'element' and 'name' (unique).
 */
dwv.dicom.DicomParser.prototype.readTag=function(reader, offset)
{
    // group
    var g0 = reader.readNumber( 1, offset );
    var g1 = reader.readNumber( 1, offset+1 );
    var group_str = (g0 + g1*256).toString(16);
    var group = "0x0000".substr(0, 6 - group_str.length) + group_str.toUpperCase();
    // element
    var e2 = reader.readNumber( 1, offset+2 );
    var e3 = reader.readNumber( 1, offset+3 );
    var element_str = (e2 + e3*256).toString(16);
    var element = "0x0000".substr(0, 6 - element_str.length) + element_str.toUpperCase();
    // name
    var name = "dwv::unknown";
    if( this.dict.newDictionary[group] ) {
        if( this.dict.newDictionary[group][element] ) {
            name = this.dict.newDictionary[group][element][2];
        }
    }
    // return as hex
    return {'group': group, 'element': element, 'name': name};
};

/**
 * Read a DICOM data element.
 * @param reader The raw data reader.
 * @param offset The offset where to start to read.
 * @param implicit Is the DICOM VR implicit?
 * @returns An object containing the element 'tag', 'vl', 'vr', 'data' and 'offset'.
 */
dwv.dicom.DicomParser.prototype.readDataElement=function(reader, offset, implicit)
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
        vl = reader.readNumber( 4, offset+tagOffset );
        vlOffset = 4;
    }
    // non Item case
    else {
        // implicit VR?
        if(implicit) {
            vr = "UN";
            if( this.dict.newDictionary[tag.group] ) {
                if( this.dict.newDictionary[tag.group][tag.element] ) {
                    vr = this.dict.newDictionary[tag.group][tag.element][0];
                }
            }
            vrOffset = 0;
        }
        else {
            vr = reader.readString( 2, offset+tagOffset );
            vrOffset = 2;
        }
        // long representations
        if(vr === "OB" || vr === "OF" || vr === "SQ" || vr === "OW" || vr === "UN") {
            vl = reader.readNumber( 4, offset+tagOffset+vrOffset+2 );
            vlOffset = 6;
        }
        // short representation
        else {
            vl = reader.readNumber( 2, offset+tagOffset+vrOffset );
            vlOffset = 2;
        }
    }
    
    // check the value of VL
    if( vl === 0xffffffff ) {
        vl = 0;
    }
    
    // data
    var data;
    if( vr === "US" || vr === "UL")
    {
        data = [reader.readNumber( vl, offset+tagOffset+vrOffset+vlOffset)];
    }
    else if( vr === "OW" ) // should be pixel data
    {
        data = [];
        var begin = offset+tagOffset+vrOffset+vlOffset;
        var end = begin + vl;
        for(var i=begin; i<end; i+=2) 
        {     
            data.push(reader.readNumber(2,i));
        }
    }
    else
    {
        data = reader.readString( vl, offset+tagOffset+vrOffset+vlOffset);
        data = data.split("\\");                
    }    

    // total element offset
    var elementOffset = tagOffset + vrOffset + vlOffset + vl;
    
    // return
    return { 
        'tag': tag, 'vr': vr, 'vl': vl, 
        'data': data,
        'offset': elementOffset};    
};

/**
 * Parse the complete DICOM file (given as input to the class).
 * Fills in the member object 'dicomElements'.
 */
dwv.dicom.DicomParser.prototype.parseAll = function()
{
    var offset = 0;
    var i;
    var implicit = false;
    // dictionary
    this.dict.init();
    // default readers
    var metaReader = new dwv.dicom.LittleEndianReader(this.file);
    var dataReader = new dwv.dicom.LittleEndianReader(this.file);

    // 128 -> 132: magic word
    offset = 128;
    var magicword = metaReader.readString(4, offset);
    if(magicword !== "DICM")
    {
        throw new Error("No magic DICM word found.");
    }
    offset += 4;
    
    // 0x0002, 0x0000: MetaElementGroupLength
    var dataElement = this.readDataElement(metaReader, offset);
    var metaLength = parseInt(dataElement.data, 10);
    offset += dataElement.offset;
    
    // meta elements
    var metaStart = offset;
    var metaEnd = offset + metaLength;
    for( i=metaStart; i<metaEnd; i++ ) 
    {
        // get the data element
        dataElement = this.readDataElement(metaReader, i, false);
        // check the transfer syntax
        if( dataElement.tag.name === "TransferSyntaxUID" ) {
            var val = dataElement.data[0];
            // get rid of ending zero-width space (u200B)
            if( val[val.length-1] === String.fromCharCode("u200B") ) {
                val = val.substring(0, val.length-1); 
            }
            console.log("transfer syntax: "+val);
            if( val === "1.2.840.10008.1.2.2" ) {
                console.log("Big endian.");
                dataReader = new dwv.dicom.BigEndianReader(this.file);
            }
            else if( val === "1.2.840.10008.1.2" ) {
                console.log("Implicit data.");
                implicit = true;
            }
        }            
        // store the data element
        this.appendDicomElement( { 
            'name': dataElement.tag.name,
            'group': dataElement.tag.group, 
            'element': dataElement.tag.element,
            'value': dataElement.data } );
        // increment index
        i += dataElement.offset-1;
    }
    
    // DICOM data elements
    for( i=metaEnd; i<this.inputBuffer.length; i++) 
    {
        // get the data element
        dataElement = this.readDataElement(dataReader, i, implicit);
        // store pixel data
        if( dataElement.tag.name === "PixelData") {
            this.pixelBuffer = dataElement.data;
        }
        // store the data element
        this.appendDicomElement( {
            'name': dataElement.tag.name,
            'group' : dataElement.tag.group, 
            'element': dataElement.tag.element,
            'value': dataElement.data } );
        // increment index
        i += dataElement.offset-1;
    }
};

/**
 * Get an Image object from the read DICOM file.
 * @returns A new Image.
 */
dwv.dicom.DicomParser.prototype.getImage = function()
{
    // size
    var size = new dwv.image.ImageSize(
        this.dicomElements.Columns.value[0], 
        this.dicomElements.Rows.value[0]);
    // spacing
    var rowSpacing = parseFloat(this.dicomElements.PixelSpacing.value[0]);
    var columnSpacing = parseFloat(this.dicomElements.PixelSpacing.value[1]);
    var spacing = new dwv.image.ImageSpacing(
        columnSpacing, rowSpacing);
    // image
    var image = new dwv.image.Image( size, spacing, this.pixelBuffer );
    // lookup
    var rescaleSlope = 1;
    if( this.dicomElements.RescaleSlope ) {
        rescaleSlope = parseFloat(this.dicomElements.RescaleSlope.value[0]);
    }
    var rescaleIntercept = 0;
    if( this.dicomElements.RescaleIntercept ) {
        rescaleIntercept = parseFloat(this.dicomElements.RescaleIntercept.value[0]);
    }
    var windowPresets = [];
    var name;
    for( var i = 0; i < this.dicomElements.WindowCenter.value.length; ++i) {
        if( this.dicomElements.WindowCenterWidthExplanation ) {
            name = this.dicomElements.WindowCenterWidthExplanation.value[i];
        }
        else {
            name = "Default"+i;
        }
        windowPresets.push({
            "center": parseInt( this.dicomElements.WindowCenter.value[i], 10 ),
            "width": parseInt( this.dicomElements.WindowWidth.value[i], 10 ), 
            "name": name
        });
    }
    image.setLookup( windowPresets, rescaleSlope, rescaleIntercept );
    // return
    return image;
};
