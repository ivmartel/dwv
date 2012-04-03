// dicom namespace
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
    this.dicomElement = [];
    this.dict = new dwv.dicom.Dictionary();
    this.file = file;
    // default image information
    this.numberOfRows = 0;
    this.numberOfColumns = 0;
    this.rowSpacing = 1;
    this.columnSpacing = 1;
    this.windowWidth = 1;
    this.windowCenter = 0;
    this.rescaleSlope = 1;
    this.rescaleIntercept = 0;
};

dwv.dicom.DicomParser.prototype.getPixelBuffer=function()
{
    return this.pixelBuffer;
};

dwv.dicom.DicomParser.prototype.appendDicomElement=function( element )
{
    this.dicomElement.push( element );
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
    var name = this.dict.newDictionary[group][element][2] || "Unknown DICOM Tag";

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
        // store image information
        this.storeImageInformation( dataElement );
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

dwv.dicom.DicomParser.prototype.storeImageInformation = function(element)
{
    if(element.tag.name === "Rows")
    {
        this.numberOfRows = element.data[0];
    }
    else if(element.tag.name === "Columns")
    {
        this.numberOfColumns = element.data[0];
    }
    else if(element.tag.name === "PixelSpacing")
    {
        this.rowSpacing = parseFloat(element.data[0]);    
        this.columnSpacing = parseFloat(element.data[1]);    
    }
    else if(element.tag.name === "WindowWidth")
    {
        this.windowWidth = element.data[0];
    }
    else if(element.tag.name === "WindowCenter")
    {
        this.windowCenter = element.data[0];            
    }
    else if(element.tag.name === "RescaleSlope")
    {
        this.rescaleSlope = parseInt(element.data, 10);    
    }
    else if(element.tag.name === "RescaleIntercept")
    {
        this.rescaleIntercept = parseInt(element.data, 10);
    }
};

dwv.dicom.DicomParser.prototype.getImage = function()
{
    // create the DICOM image
    var image = new dwv.image.Image(
        dwv.image.ImageSize(this.numberOfColumns, this.numberOfRows),
        dwv.image.ImageSpacing(this.columnSpacing, this.rowSpacing),
        this.pixelBuffer );
    image.setLookup( 
            this.windowCenter, this.windowWidth, 
            this.rescaleSlope, this.rescaleIntercept);
    
    return image;
};