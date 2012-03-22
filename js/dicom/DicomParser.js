/**
 *  DicomParser.js
 *  Version 0.5
 *  Author: BabuHussain<babuhussain.a@raster.in>
 */

var elementIndex=0;

function parseAll()
{
    var index = 0;
    // read tags
    index = this.readTags();
    // read pixel data
    this.readImage(index);    
}

/**
 * DicomParser class.
 */
function DicomParser(inputBuffer,reader)
{
    // members
    this.inputBuffer = inputBuffer;
    this.reader = reader;
    this.dicomElement = [];
    // methods
    this.parseAll = parseAll;
    this.dict = new Dictionary();
}

function getPixelBuffer()
{
    return this.pixelBuffer;
}

DicomParser.prototype.setDicomElement=function(name,vr,vl,group,element,value,offset)
{
    this.dicomElement[elementIndex++]=new DicomElement(name,vr,vl,group,element,value,offset);
};

DicomParser.prototype.readTag=function(offset)
{
    // group
    var g0 = this.reader.readNumber( 1, offset );
    var g1 = this.reader.readNumber( 1, offset+1 );
    var group_str = (g0 + g1*256).toString(16);
    var group = "0x0000".substr(0, 6 - group_str.length) + group_str.toUpperCase();
    // element
    var e2 = this.reader.readNumber( 1, offset+2 );
    var e3 = this.reader.readNumber( 1, offset+3 );
    var element_str = (e2 + e3*256).toString(16);
    var element = "0x0000".substr(0, 6 - element_str.length) + element_str.toUpperCase();
    // name
    var name;
    var dictGroup = this.dict.newDictionary[group];
    if( dictGroup && dictGroup[element]) {
        name = dictGroup[element][2];
    }
    else {
        name = "Undefined DICOM Tag";
    }

    // return as hex
    return { 'group': group, 'element': element, 'name': name };
};

DicomParser.prototype.readDataElement=function(offset)
{
    // only valid for LittleEndianExplicit (transferSyntax: 1.2.840.10008.1.2.1)
    
    // tag: group, element
    var tag = this.readTag(offset);
    
    var vr; // Value Representation
    var vl; // Value Length
    var vlOffset; // byte size of VL + VR
    
    // (private) Item group case
    if( tag.group === "0xFFFE" ) {
        vr = "N/A";
        vl = this.reader.readNumber( 4, offset+4 );
        vlOffset = 4;
    }
    // non Item case
    else {
        vr = this.reader.readString( 2, offset+4 );
        // long representations
        if(vr === "OB" || vr === "OF" || vr === "SQ" || vr === "OW" || vr === "UN") {
            vl = this.reader.readNumber( 4, offset+8 );
            vlOffset = 8;
        }
        // short representation
        else {
            vl = this.reader.readNumber( 2, offset+6 );
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
        data = [this.reader.readNumber( vl, offset+4+vlOffset)];
    }
    else
    {
        data = this.reader.readString( vl, offset+4+vlOffset);
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

DicomParser.prototype.readTags = function() //function( offset, firstContent, secondContent, thirdContent, fourthContent, tagName)
{
    var offset = 0;
    var i;
    
    // dictionary
    this.dict.init();

    // 128 -> 132: magic word
    offset = 128;
    var magicword = this.reader.readString(4, offset);
    if(magicword !== "DICM")
    {
        throw new Error("No magic DICM word found.");
    }
    offset += 4;
    
    // 0x0002, 0x0000: MetaElementGroupLength
    var dataElement = this.readDataElement(offset);
    var metaLength = parseInt(dataElement.data, 10);
    offset += dataElement.offset;
    
    // meta elements
    var metaStart = offset;
    var metaEnd = offset + metaLength;
    for( i=metaStart; i<metaEnd; i++ ) 
    {
        // get the data element
        dataElement = this.readDataElement(i);
        // check the transfer syntax
        if( dataElement.tag.name === "TransferSyntaxUID" ) {
            var val = dataElement.data[0];
            var str = val.substring(0, val.length-1); // get rid of ending zero-with space (u200B)
            if( str !== "1.2.840.10008.1.2.1" ) {
                throw new Error("Unsupported DICOM Transfer Syntax.");
            }
        }            
        // store the data element
        this.setDicomElement( dataElement.tag.name,
            dataElement.vr, dataElement.vl,
            dataElement.tag.group, dataElement.tag.element,
            dataElement.data, i);
        // increment index
        i += dataElement.offset-1;
    }
    
    // DICOM data elements
    for( i=metaEnd; i<this.inputBuffer.length; i++) 
    {
        // get the data element
        dataElement = this.readDataElement(i);
        // store some tags or break on pixel data
        if( dataElement.tag.name === "Rows" ) {
            this.numberOfRows = parseInt(dataElement.data, 10);
        }
        else if( dataElement.tag.name === "Columns" ) {
            this.numberOfColumns = parseInt(dataElement.data, 10);
        }
        else if( dataElement.tag.name === "PixelData") {
            break;
        }
        // store the data element
        this.setDicomElement( dataElement.tag.name,
            dataElement.vr, dataElement.vl,
            dataElement.tag.group, dataElement.tag.element,
            dataElement.data, i);
        // increment index
        i += dataElement.offset-1;
    }
    
    return i;
};

DicomParser.prototype.moveToPixelDataTag=function(index)
{
    for(var i=index; i<this.inputBuffer.length; i++)
    {
        if( this.reader.readNumber(1,i) === 224 
            && this.reader.readNumber(1,i+1) === 127
            && this.reader.readNumber(1,i+2) === 16
            && this.reader.readNumber(1,i+3) === 0)
        {            
            this.pixelDataOffset=i+4;
            break;
        }    
    } 
    return this.pixelDataOffset;
};

DicomParser.prototype.readImage=function(index)
{
    this.pixelBuffer = new Array(this.numberOfRows*this.numberOfColumns*2);
    var pixelIndex=0;
    for(var i=index; i<this.inputBuffer.length; i+=2) 
    {     
        this.pixelBuffer[pixelIndex]=this.reader.readNumber(2,i);
        pixelIndex++;
    }
};

