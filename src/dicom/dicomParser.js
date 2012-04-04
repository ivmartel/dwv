/**
 * @namespace DICOM related.
 */
dwv.dicom = dwv.dicom || {};

/**
 *  DicomParser.js
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
 * DicomParser class.
 */
dwv.dicom.DicomParser = function(file)
{
    // members
    this.inputBuffer = new Array(file.length);
    this.dicomElements = {};
    this.dict = new dwv.dicom.Dictionary();
    this.file = file;
};

dwv.dicom.DicomParser.prototype.getPixelBuffer=function()
{
    return this.pixelBuffer;
};

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
    return { 'group': group, 'element': element, 'name': name };
};

dwv.dicom.DicomParser.prototype.readDataElement=function(reader, offset)
{
    // only valid for LittleEndianExplicit (transferSyntax: 1.2.840.10008.1.2.1)
    
    // tag: group, element
    var tag = this.readTag(reader, offset);
    
    var vr; // Value Representation
    var vl; // Value Length
    var vlOffset; // byte size of VL + VR
    
    // (private) Item group case
    if( tag.group === "0xFFFE" ) {
        vr = "N/A";
        vl = reader.readNumber( 4, offset+4 );
        vlOffset = 4;
    }
    // non Item case
    else {
        vr = reader.readString( 2, offset+4 );
        // long representations
        if(vr === "OB" || vr === "OF" || vr === "SQ" || vr === "OW" || vr === "UN") {
            vl = reader.readNumber( 4, offset+8 );
            vlOffset = 8;
        }
        // short representation
        else {
            vl = reader.readNumber( 2, offset+6 );
            vlOffset = 4;
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
        data = [reader.readNumber( vl, offset+4+vlOffset)];
    }
    else if( vr === "OW" ) // should be pixel data
    {
        data = [];
        var begin = offset+4+vlOffset;
        var end = begin + vl;
        for(var i=begin; i<end; i+=2) 
        {     
            data.push(reader.readNumber(2,i));
        }
    }
    else
    {
        data = reader.readString( vl, offset+4+vlOffset);
        data = data.split("\\");                
    }    

    // total element offset
    var elementOffset = 4 + vlOffset + vl;
    
    // return
    return { 
        'tag': tag, 'vr': vr, 'vl': vl, 
        'data': data,
        'offset': elementOffset};    
};

dwv.dicom.DicomParser.prototype.parseAll = function()
{
    var offset = 0;
    var i;
    
    // dictionary
    this.dict.init();
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
        dataElement = this.readDataElement(metaReader, i);
        // check the transfer syntax
        if( dataElement.tag.name === "TransferSyntaxUID" ) {
            var val = dataElement.data[0];
            //var str = val.substring(0, val.length-1); // get rid of ending zero-with space (u200B)
            console.log("transfer: "+val);
            if( val === "1.2.840.10008.1.2.2" ) {
                console.log("Big endian!");
                dataReader = new dwv.dicom.BigEndianReader(this.file);
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
        dataElement = this.readDataElement(dataReader, i);
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
    var rescaleSlope = parseFloat(this.dicomElements.RescaleSlope.value[0]) || 1;
    var rescaleIntercept = parseFloat(this.dicomElements.RescaleIntercept.value[0]) || 0;
    image.setLookup( 
        this.dicomElements.WindowCenter.value[0], 
        this.dicomElements.WindowWidth.value[0], 
        rescaleSlope, rescaleIntercept );
    // return
    return image;
};