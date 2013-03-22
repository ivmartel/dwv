/**
 * @namespace DICOM related.
 */
dwv.dicom = dwv.dicom || {};

/**
 * @class Data reader
 * @param buffer The input array buffer.
 * @param isLittleEndian Flag to tell if the data is little or big endian.
 */
dwv.dicom.DataReader = function(buffer, isLittleEndian)
{
    var view = new DataView(buffer);
    if(typeof(isLittleEndian)==='undefined') isLittleEndian = true;
    
    //! Read Uint8 (1 bytes) data.
    this.readUint8 = function(byteOffset) {
        return view.getUint8(byteOffset, isLittleEndian);
    };
    //! Read Uint16 (2 bytes) data.
    this.readUint16 = function(byteOffset) {
        return view.getUint16(byteOffset, isLittleEndian);
    };
    //! Read Uint32 (4 bytes) data.
    this.readUint32 = function(byteOffset) {
        return view.getUint32(byteOffset, isLittleEndian);
    };
    //! Read Float32 (8 bytes) data.
    this.readFloat32 = function(byteOffset) {
        return view.getFloat32(byteOffset, isLittleEndian);
    };
    //! Read Uint data of nBytes size.
    this.readNumber = function(byteOffset, nBytes) {
        if( nBytes === 1 )
            return this.readUint8(byteOffset, isLittleEndian);
        else if( nBytes === 2 )
            return this.readUint16(byteOffset, isLittleEndian);
        else if( nBytes === 4 )
            return this.readUint32(byteOffset, isLittleEndian);
        else if( nBytes === 8 )
            return this.readFloat32(byteOffset, isLittleEndian);
        else 
            throw new Error("Unsupported number size.");
    };
    //! Read Uint8 array.
    this.readUint8Array = function(byteOffset, size) {
        var data = [];
        for(var i=byteOffset; i<byteOffset + size; ++i) {     
            data.push(this.readUint8(i));
        }
        return data;
    };
    //! Read Uint16 array.
    this.readUint16Array = function(byteOffset, size) {
        var data = [];
        for(var i=byteOffset; i<byteOffset + size; i+=2) {     
            data.push(this.readUint16(i));
        }
        return data;
    };
    //! Read data as an hexadecimal string.
    this.readHex = function(byteOffset) {
        // read and convert to hex string
        var str = this.readUint16(byteOffset).toString(16);
        // return padded
        return "0x0000".substr(0, 6 - str.length) + str.toUpperCase();
    };
    //! Read data as a string.
    this.readString = function(byteOffset, nChars) {
        var result = "";
        for(var i=byteOffset; i<byteOffset + nChars; ++i){
            result += String.fromCharCode( this.readUint8(i) );
        }
        return result;
    };
};

/**
 * @class DicomParser class.
 */
dwv.dicom.DicomParser = function()
{
    // the list of DICOM elements
    this.dicomElements = {};
    // the number of DICOM Items
    this.numberOfItems = 0;
    // the DICOM dictionary used to find tag names
    this.dict = new dwv.dicom.Dictionary();
    // the pixel buffer
    this.pixelBuffer = [];
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
 * If tags have same name (for the 'unknown' and private tags cases), a number is appended
 * making the name unique.
 * @param element The element to add.
 */
dwv.dicom.DicomParser.prototype.appendDicomElement=function( element )
{
    // find a good tag name
    var name = element.name;
    // count the number of items
    if( name === "Item" ) {
        ++this.numberOfItems;
    }
    var count = 1;
    while( this.dicomElements[name] ) {
        name = element.name + (count++).toString();
    }
    // store it
    this.dicomElements[name] = { 
            "group": element.group, 
            "element": element.element,
            "vr": element.vr,
            "vl": element.vl,
            "value": element.value };
};

/**
 * Read a DICOM tag.
 * @param reader The raw data reader.
 * @param offset The offset where to start to read.
 * @returns An object containing the tags 'group', 'element' and 'name'.
 */
dwv.dicom.DicomParser.prototype.readTag=function(reader, offset)
{
    // group
    var group = reader.readHex(offset);
    // element
    var element = reader.readHex(offset+2);
    // name
    var name = "dwv::unknown";
    if( this.dict.newDictionary[group] ) {
        if( this.dict.newDictionary[group][element] ) {
            name = this.dict.newDictionary[group][element][2];
        }
    }
    // return
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
        vl = reader.readUint32( offset+tagOffset );
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
    if( vl === 0xffffffff ) {
        vl = 0;
    }
    
    
    // data
    var data;
    var dataOffset = offset+tagOffset+vrOffset+vlOffset;
    if( vr === "US" || vr === "UL")
    {
        data = [reader.readNumber( dataOffset, vl )];
    }
    else if( vr === "OX" || vr === "OW" )
    {
        data = reader.readUint16Array( dataOffset, vl );
    }
    else if( vr === "OB" || vr === "N/A")
    {
        data = reader.readUint8Array( dataOffset, vl );
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
        'tag': tag, 'vr': vr, 'vl': vl, 
        'data': data,
        'offset': elementOffset};    
};

/**
 * Parse the complete DICOM file (given as input to the class).
 * Fills in the member object 'dicomElements'.
 * @param buffer The input array buffer.
 */
dwv.dicom.DicomParser.prototype.parse = function(buffer)
{
    var offset = 0;
    var implicit = false;
    var jpeg = false;
    var jpeg2000 = false;
    // dictionary
    this.dict.init();
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
    
    // 0x0002, 0x0000: MetaElementGroupLength
    var dataElement = this.readDataElement(metaReader, offset);
    var metaLength = parseInt(dataElement.data, 10);
    offset += dataElement.offset;
    
    // meta elements
    var metaStart = offset;
    var metaEnd = metaStart + metaLength;
    var i = metaStart;
    while( i < metaEnd ) 
    {
        // get the data element
        dataElement = this.readDataElement(metaReader, i, false);
        // check the transfer syntax
        if( dataElement.tag.name === "TransferSyntaxUID" ) {
            var syntax = dataElement.data[0];
            // get rid of ending zero-width space (u200B)
            if( syntax[syntax.length-1] === String.fromCharCode("u200B") ) {
                syntax = syntax.substring(0, syntax.length-1); 
            }
            
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
            else if( syntax.match(/1.2.840.10008.1.2.4.5/) 
                    || syntax.match(/1.2.840.10008.1.2.4.6/)
                    || syntax.match(/1.2.840.10008.1.2.4.7/) 
                    || syntax.match(/1.2.840.10008.1.2.4.8/) ) {
                jpeg = true;
                throw new Error("Unsupported DICOM transfer syntax (JPEG): "+syntax);
            }
            // JPEG 2000
            else if( syntax.match(/1.2.840.10008.1.2.4.9/) ) {
                jpeg2000 = true;
                throw new Error("Unsupported DICOM transfer syntax (JPEG 2000): "+syntax);
            }
            // MPEG2 Image Compression
            else if( syntax === "1.2.840.10008.1.2.4.100" ) {
                throw new Error("Unsupported DICOM transfer syntax (MPEG2): "+syntax);
            }
            // RLE (lossless)
            else if( syntax === "1.2.840.10008.1.2.4.5" ) {
                throw new Error("Unsupported DICOM transfer syntax (RLE): "+syntax);
            }
        }            
        // store the data element
        this.appendDicomElement( { 
            'name': dataElement.tag.name,
            'group': dataElement.tag.group, 
            'element': dataElement.tag.element,
            'value': dataElement.data } );
        // increment index
        i += dataElement.offset;
    }
    
    var startedPixelItems = false;
    
    var tagName;
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
            console.warn("Problem reading at " + i + " / " + buffer.byteLength
                    + ", after " + tagName + ".\n" + err);
        }
        tagName = dataElement.tag.name;
        // store pixel data from multiple items
        if( startedPixelItems ) {
            if( tagName === "Item" ) {
                if( dataElement.data.length !== 0 ) {
                    this.pixelBuffer = this.pixelBuffer.concat( dataElement.data );
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
            'value': dataElement.data } );
        // increment index
        i += dataElement.offset;
    }
    
    // uncompress data
    if( jpeg ) {
        console.log("JPEG");
        // using jpgjs from https://github.com/notmasteryet/jpgjs
        // -> error with ffc3 and ffc1 jpeg jfif marker
        /*var j = new JpegImage();
        j.parse(this.pixelBuffer);
        var d = 0;
        j.copyToImageData(d);
        this.pixelBuffer = d.data;*/
    }
    else if( jpeg2000 ) {
        console.log("JPEG 2000");
        // using openjpeg.js from https://github.com/kripken/j2k.js
        // -> 2 layers results????
        /*var data = new Uint16Array(this.pixelBuffer);
        var result = openjpeg(data, "j2k");
        this.pixelBuffer = result.data;*/
        
        // using jpx.js from https://github.com/mozilla/pdf.js
        // -> ...
        /*var j = new JpxImage();
        j.parse(this.pixelBuffer);
        console.log("width: "+j.width);
        console.log("height: "+j.height);
        console.log("tiles: "+j.tiles.length);
        console.log("count: "+j.componentsCount);
        this.pixelBuffer = j.tiles[0].items;*/
    }
};

/**
 * Get an Image object from the read DICOM file.
 * @returns A new Image.
 */
dwv.dicom.DicomParser.prototype.getImage = function()
{
    // size
    if( !this.dicomElements.Columns ) {
        throw new Error("Missing DICOM image number of columns");
    }
    if( !this.dicomElements.Rows ) {
        throw new Error("Missing DICOM image number of rows");
    }
    var size = new dwv.image.ImageSize(
        this.dicomElements.Columns.value[0], 
        this.dicomElements.Rows.value[0]);
    // spacing
    var rowSpacing = 1;
    var columnSpacing = 1;
    if( this.dicomElements.PixelSpacing ) {
        rowSpacing = parseFloat(this.dicomElements.PixelSpacing.value[0]);
        columnSpacing = parseFloat(this.dicomElements.PixelSpacing.value[1]);
    }
    else if( this.dicomElements.ImagerPixelSpacing ) {
        rowSpacing = parseFloat(this.dicomElements.ImagerPixelSpacing.value[0]);
        columnSpacing = parseFloat(this.dicomElements.ImagerPixelSpacing.value[1]);
    }
    var spacing = new dwv.image.ImageSpacing(
        columnSpacing, rowSpacing);
    // image
    var image = new dwv.image.Image( size, spacing, this.pixelBuffer );
    // lookup
    var slope = 1;
    if( this.dicomElements.RescaleSlope ) {
        slope = parseFloat(this.dicomElements.RescaleSlope.value[0]);
    }
    var intercept = 0;
    if( this.dicomElements.RescaleIntercept ) {
        intercept = parseFloat(this.dicomElements.RescaleIntercept.value[0]);
    }
    image.setRescaleSlopeAndIntercept(slope, intercept);
    if( this.dicomElements.WindowCenter && this.dicomElements.WindowWidth ) {
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
                "center": parseFloat( this.dicomElements.WindowCenter.value[i], 10 ),
                "width": parseFloat( this.dicomElements.WindowWidth.value[i], 10 ), 
                "name": name
            });
        }
        image.setWindowPresets( windowPresets );
    }
    else
    {
        image.setWindowLevelMinMax();
    }
    // return
    return image;
};
