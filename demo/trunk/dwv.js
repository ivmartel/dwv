//! @namespace Main DWV namespace.
var dwv = dwv || {};
 
/**
* @class App
* Main application.
*/
dwv.App = function(mobile)
{
    // Local object
    var self = this;
    // Image
    var image = null;
    var view = null;
    // Original image
    var originalImage = null;
    // Image data array
    var imageData = null;
    var dataWidth = 0;
    var dataHeight = 0;
    var displayZoom = 1;
     
    // Image layer
    var imageLayer = null;
    // Draw layer
    var drawLayer = null;
    // Temporary layer
    var tempLayer = null;
    
    // flag to know if the info layer is listening on the image.
    var isInfoLayerListening = true;
    
    // Tool box
    var toolBox = new dwv.tool.ToolBox(this);
    // UndoStack
    var undoStack = new dwv.tool.UndoStack(this);
    
    // Public Methods
    // --------------
    
    // Get the image
    this.getImage = function() { return image; };
    // Get the view
    this.getView = function() { return view; };
    
    // Set the image
    this.setImage = function(img) { image = img; view.setImage(img); };    
    // Restore the original image
    this.restoreOriginalImage = function() { image = originalImage; view.setImage(originalImage); }; 
    
    // Get the image data array
    this.getImageData = function() { return imageData; };

    // Get the tool box
    this.getToolBox = function() { return toolBox; };

    // Get the image layer
    this.getImageLayer = function() { return imageLayer; };
    // Get the draw layer
    this.getDrawLayer = function() { return drawLayer; };
    // Get the temporary layer
    this.getTempLayer = function() { return tempLayer; };

    // Get the image details
    this.getUndoStack = function() { return undoStack; };

    /**
     * Initialise the HTML for the application.
     */
    this.init = function()
    {
        // bind open files with method
        document.getElementById('imagefiles').addEventListener('change', this.onChangeFiles, false);
        document.getElementById('imageurl').addEventListener('change', this.onChangeURL, false);
    };
    
    this.reset = function()
    {
        image = null;
        view = null;
        undoStack = new dwv.tool.UndoStack(this);
    };
    
    /**
     * Handle key event.
     * - CRTL-Z: undo
     * - CRTL-Y: redo
     * Default behavior. Usually used in tools. 
     * @param event
     */
    this.handleKeyDown = function(event)
    {
        if( event.keyCode === 90 && event.ctrlKey ) // ctrl-z
        {
            self.getUndoStack().undo();
        }
        else if( event.keyCode === 89 && event.ctrlKey ) // ctrl-y
        {
            self.getUndoStack().redo();
        }
    };
    
    /**
     * @public
     */
    this.onChangeFiles = function(evt)
    {
        self.loadFiles(evt.target.files);
    };

    /**
     * @public
     */
    this.loadFiles = function(files) 
    {
        // Image loader
        var onLoadImage = function(event){
            try {
                // parse image file
                var data = dwv.image.getDataFromImage(this);
                if( image ) image.appendSlice( data.view.getImage() );
                // prepare display
                postLoadInit(data);
            } catch(error) {
                handleError(error);
                return;
            }
        };
        
        // Image reader loader
        var onLoadImageReader = function(event){
            var theImage = new Image();
            theImage.src = event.target.result;
            // storing values to pass them on
            theImage.file = this.file;
            theImage.index = this.index;
            theImage.onload = onLoadImage;
        };
        // Image reader error handler
        var onErrorImageReader = function(event){
            alert("An error occurred while reading the image file: "+event.getMessage());
        };
        
        // DICOM reader loader
        var onLoadDicomReader = function(event){
            try {
                // parse DICOM file
                var data = dwv.image.getDataFromDicomBuffer(event.target.result);
                if( image ) image.appendSlice( data.view.getImage() );
                // prepare display
                postLoadInit(data);
            } catch(error) {
                handleError(error);
                return;
            }
        };
        // DICOM reader error handler
        var onErrorDicomReader = function(event){
            alert("An error occurred while reading the DICOM file: "+event.getMessage());
        };
        
        // main load loop
        this.reset();
        for (var i = 0; i < files.length; ++i)
        {
            var file = files[i];
            var reader = new FileReader();
            if( file.type.match("image.*") )
            {
                // storing values to pass them on
                reader.file = file;
                reader.index = i;
                reader.onload = onLoadImageReader;
                reader.onprogress = dwv.gui.updateProgress;
                reader.onerror = onErrorImageReader;
                reader.readAsDataURL(file);
            }
            else
            {
                reader.onload = onLoadDicomReader;
                reader.onprogress = dwv.gui.updateProgress;
                reader.onerror = onErrorDicomReader;
                reader.readAsArrayBuffer(file);
            }
        }
    };
        
    /**
     * @public
     */
    this.onChangeURL = function(evt)
    {
        self.loadURL(evt.target.value);
    };

    /**
     * @public
     */
    this.loadURL = function(urls) 
    {
        // Image loader
        var onLoadImage = function(event){
            try {
                // parse image data
                var data = dwv.image.getDataFromImage(this);
                if( image ) image.appendSlice( data.view.getImage() );
                // prepare display
                postLoadInit(data);
            } catch(error) {
                handleError(error);
                return;
            }
        };
        
        // Request handler
        var onLoadRequest = function(event) {
            var view = new DataView(this.response);
            var isJpeg = view.getUint32(0) === 0xffd8ffe0;
            var isPng = view.getUint32(0) === 0x89504e47;
            var isGif = view.getUint32(0) === 0x47494638;
            if( isJpeg || isPng || isGif ) {
                // image data
                var theImage = new Image();

                var bytes = new Uint8Array(this.response);
                var binary = '';
                for (var i = 0; i < bytes.byteLength; ++i) {
                    binary += String.fromCharCode(bytes[i]);
                }
                var imgStr = "unknown";
                if (isJpeg) imgStr = "jpeg";
                else if (isPng) imgStr = "png";
                else if (isGif) imgStr = "gif";
                theImage.src = "data:image/" + imgStr + ";base64," + window.btoa(binary);
                
                theImage.onload = onLoadImage;
            }
            else {
                try {
                    // parse DICOM
                    var data = dwv.image.getDataFromDicomBuffer(this.response);
                    if( image ) image.appendSlice( data.view.getImage() );
                    // prepare display
                    postLoadInit(data);
                } catch(error) {
                    handleError(error);
                    return;
                }
            }
        };
        // Request error handler
        var onErrorRequest = function(event){
            alert("An error occurred while retrieving the file: (http) "+this.status);
        };
        
        // main load loop
        this.reset();
        for (var i = 0; i < urls.length; ++i)
        {
            var url = urls[i];
            var request = new XMLHttpRequest();
            // TODO Verify URL...
            request.open('GET', url, true);
            request.responseType = "arraybuffer"; 
            request.onload = onLoadRequest;
            request.onerror = onErrorRequest;
            request.onprogress = dwv.gui.updateProgress;
            request.send(null);
        }
    };
    
    /**
     * Generate the image data and draw it.
     */
    this.generateAndDrawImage = function()
    {         
        // generate image data from DICOM
        self.getView().generateImageData(imageData);         
        // set the image data of the layer
        self.getImageLayer().setImageData(imageData);
        // draw the image
        self.getImageLayer().draw();
    };
    
    /**
     * To be called once the image is loaded.
     */
    this.resize = function()
    {
        // adapt the size of the layer container
        var mainWidth = 0;
        var mainHeight = 0;
        if( mobile ) {
            mainWidth = $(window).width();
            mainHeight = $(window).height() - 125;
        }
        else {
            mainWidth = $('#pageMain').width() - 360;
            mainHeight = $('#pageMain').height() - 75;
        }
        displayZoom = Math.min( (mainWidth / dataWidth), (mainHeight / dataHeight) );
        $("#layerContainer").width(parseInt(displayZoom*dataWidth, 10));
        $("#layerContainer").height(parseInt(displayZoom*dataHeight, 10));
    };
    
    /**
     * To be called once the image is loaded.
     */
    this.setLayersZoom = function(zoomX,zoomY,cx,cy)
    {
        if( imageLayer ) imageLayer.zoom(zoomX,zoomY,cx,cy);
        if( drawLayer ) drawLayer.zoom(zoomX,zoomY,cx,cy);
    };
    
    /**
     * Toggle the display of the info layer.
     */
    this.toggleInfoLayerDisplay = function()
    {
        // toggle html
        dwv.html.toggleDisplay('infoLayer');
        // toggle listeners
        if( isInfoLayerListening ) {
            removeImageInfoListeners();
            isInfoLayerListening = false;
        }
        else {
            addImageInfoListeners();
            isInfoLayerListening = true;
        }
    };
    
    // Private Methods
    // ---------------

    /**
     * Add image listeners.
     */
    function addImageInfoListeners()
    {
        view.addEventListener("wlchange", dwv.info.updateWindowingDiv);
        view.addEventListener("wlchange", dwv.info.updateMiniColorMap);
        view.addEventListener("wlchange", dwv.info.updatePlotMarkings);
        view.addEventListener("colorchange", dwv.info.updateMiniColorMap);
        view.addEventListener("positionchange", dwv.info.updatePositionDiv);
    }
    
    /**
     * Remove image listeners.
     */
    function removeImageInfoListeners()
    {
        view.removeEventListener("wlchange", dwv.info.updateWindowingDiv);
        view.removeEventListener("wlchange", dwv.info.updateMiniColorMap);
        view.removeEventListener("wlchange", dwv.info.updatePlotMarkings);
        view.removeEventListener("colorchange", dwv.info.updateMiniColorMap);
        view.removeEventListener("positionchange", dwv.info.updatePositionDiv);
    }
    
    /**
     * @private
     * The general-purpose event handler. This function just determines the mouse 
     * position relative to the canvas element.
     */
    function eventHandler(event)
    {
        // flag not to get confused between touch and mouse
        var handled = false;
        // Store the event position relative to the image canvas
        // in an extra member of the event:
        // event._x and event._y.
        if( mobile )
        {
            if( event.type === "touchstart" ||
                event.type === "touchmove")
            {
                event.preventDefault();
                // If there's one or two fingers inside this element
                if( event.targetTouches.length === 1 ||
                    event.targetTouches.length === 2)
                {
                  var touch = event.targetTouches[0];
                  // store
                  event._x = touch.pageX - parseInt(app.getImageLayer().getOffset().left, 10);
                  event._x = parseInt( (event._x / displayZoom), 10 );
                  event._y = touch.pageY - parseInt(app.getImageLayer().getOffset().top, 10);
                  event._y = parseInt( (event._y / displayZoom), 10 );
                  // second finger
                  if (event.targetTouches.length === 2) {
                      touch = event.targetTouches[1];
                      // store
                      event._x1 = touch.pageX - parseInt(app.getImageLayer().getOffset().left, 10);
                      event._x1 = parseInt( (event._x1 / displayZoom), 10 );
                      event._y1 = touch.pageY - parseInt(app.getImageLayer().getOffset().top, 10);
                      event._y1 = parseInt( (event._y1 / displayZoom), 10 );
                  }
                  // set handle event flag
                  handled = true;
                }
            }
            else if( event.type === "touchend" ) handled = true;
        }
        else
        {
            if( event.type === "mousemove" ||
                event.type === "mousedown" ||
                event.type === "mouseup" ||
                event.type === "mouseout" ||
                event.type === "mousewheel" ||
                event.type === "dblclick" ||
                event.type === "DOMMouseScroll" )
            {
                // layerX is for firefox
                event._x = event.offsetX === undefined ? event.layerX : event.offsetX;
                event._x = parseInt( (event._x / displayZoom), 10 );
                event._y = event.offsetY === undefined ? event.layerY : event.offsetY;
                event._y = parseInt( (event._y / displayZoom), 10 );
                // set handle event flag
                handled = true;
            }
            else if( event.type === "keydown" ) handled = true;
        }
            
        // Call the event handler of the tool.
        if( handled )
        {
            var func = self.getToolBox().getSelectedTool()[event.type];
            if( func )
            {
                func(event);
            }
        }
    }
    
    /**
     * @private
     * */
    function handleError(error)
    {
        if( error.name && error.message) alert(error.name+": "+error.message+".");
        else alert("Error: "+error+".");
        if( error.stack ) console.log(error.stack);
    }
    
    /**
     * @private
     * @param dataWidth The width of the input data.
     * @param dataHeight The height of the input data.
     */
    function createLayers(dataWidth, dataHeight)
    {
        // resize app
        self.resize();
        
        // image layer
        imageLayer = new dwv.html.Layer("imageLayer");
        imageLayer.initialise(dataWidth, dataHeight);
        imageLayer.fillContext();
        imageLayer.setStyleDisplay(true);
        // draw layer
        drawLayer = new dwv.html.Layer("drawLayer");
        drawLayer.initialise(dataWidth, dataHeight);
        drawLayer.setStyleDisplay(true);
        // temp layer
        tempLayer = new dwv.html.Layer("tempLayer");
        tempLayer.initialise(dataWidth, dataHeight);
        tempLayer.setStyleDisplay(true);
    }
    
    /**
     * @private
     * Create the DICOM tags table.
     * @param dataInfo The data information.
     * To be called once the DICOM has been parsed.
     */
    function createTagsTable(dataInfo)
    {
        // tag list table (without the pixel data)
        if(dataInfo.PixelData) dataInfo.PixelData.value = "...";
        // HTML node
        var node = document.getElementById("tags");
        // remove possible previous
        while (node.hasChildNodes()) { 
            node.removeChild(node.firstChild);
        }
        // tags HTML table
        var table = dwv.html.toTable(dataInfo);
        table.id = "tagsTable";
        table.className = "tagsList table-stripe";
        table.setAttribute("data-role", "table");
        table.setAttribute("data-mode", "columntoggle");
        // search form
        node.appendChild(dwv.html.getHtmlSearchForm(table));
        // tags table
        node.appendChild(table);
    }
    
    /**
     * @private
     * To be called once the DICOM has been parsed.
     */
    function postLoadInit(data)
    {
        // only initialise the first time
        if( view ) return;
        
        // get the view from the loaded data
        view = data.view;
        // create the DICOM tags table
        createTagsTable(data.info);
        // store image
        originalImage = view.getImage();
        image = originalImage;
        
        // layout
        dataWidth = image.getSize().getNumberOfColumns();
        dataHeight = image.getSize().getNumberOfRows();
        createLayers(dataWidth, dataHeight);
        
        // create the info layer
        dwv.info.createWindowingDiv();
        dwv.info.createPositionDiv();
        dwv.info.createMiniColorMap();
        dwv.info.createPlot();

        // get the image data from the image layer
        imageData = self.getImageLayer().getContext().createImageData( 
                dataWidth, dataHeight);

        // mouse listeners
        tempLayer.getCanvas().addEventListener("mousedown", eventHandler, false);
        tempLayer.getCanvas().addEventListener("mousemove", eventHandler, false);
        tempLayer.getCanvas().addEventListener("mouseup", eventHandler, false);
        tempLayer.getCanvas().addEventListener("mouseout", eventHandler, false);
        tempLayer.getCanvas().addEventListener("mousewheel", eventHandler, false);
        tempLayer.getCanvas().addEventListener("DOMMouseScroll", eventHandler, false);
        tempLayer.getCanvas().addEventListener("dblclick", eventHandler, false);
        // touch listeners
        tempLayer.getCanvas().addEventListener("touchstart", eventHandler, false);
        tempLayer.getCanvas().addEventListener("touchmove", eventHandler, false);
        tempLayer.getCanvas().addEventListener("touchend", eventHandler, false);
        // keydown listener
        window.addEventListener("keydown", eventHandler, true);
        // image listeners
        view.addEventListener("wlchange", app.generateAndDrawImage);
        view.addEventListener("colorchange", app.generateAndDrawImage);
        view.addEventListener("slicechange", app.generateAndDrawImage);
        addImageInfoListeners();
        
        // initialise the toolbox
        toolBox.enable(true);
        // add the HTML for the history 
        dwv.gui.appendUndoHtml();
        
        // the following has to be done after adding listeners
        
        // set window/level: triggers first data and div display
        dwv.tool.updateWindowingData(
                parseInt(app.getView().getWindowLut().getCenter(), 10),
                parseInt(app.getView().getWindowLut().getWidth(), 10) );
        // default position: triggers div display
        dwv.tool.updatePostionValue(0,0);
    }
    
};
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace DICOM related.
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
        var data = new Uint8Array(size);
        var index = 0;
        for(var i=byteOffset; i<byteOffset + size; ++i) {     
            data[index++] = this.readUint8(i);
        }
        return data;
    };
    //! Read Uint16 array.
    this.readUint16Array = function(byteOffset, size) {
        var data = new Uint16Array(size/2);
        var index = 0;
        for(var i=byteOffset; i<byteOffset + size; i+=2) {     
            data[index++] = this.readUint16(i);
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
            var syntax = dwv.utils.cleanString(dataElement.data[0]);
            
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
            else if( syntax.match(/1.2.840.10008.1.2.4.5/) ||
                    syntax.match(/1.2.840.10008.1.2.4.6/) ||
                    syntax.match(/1.2.840.10008.1.2.4.7/) ||
                    syntax.match(/1.2.840.10008.1.2.4.8/) ) {
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
            'vr' : dataElement.vr, 
            'vl' : dataElement.vl, 
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
            console.warn("Problem reading at " + i + " / " + buffer.byteLength +
                ", after " + tagName + ".\n" + err);
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
dwv.dicom.DicomParser.prototype.createImage = function()
{
    // size
    if( !this.dicomElements.Columns ) {
        throw new Error("Missing DICOM image number of columns");
    }
    if( !this.dicomElements.Rows ) {
        throw new Error("Missing DICOM image number of rows");
    }
    var size = new dwv.image.Size(
        this.dicomElements.Columns.value[0], 
        this.dicomElements.Rows.value[0] );
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
    var spacing = new dwv.image.Spacing( columnSpacing, rowSpacing);
    // buffer data
    var buffer = new Int16Array(this.pixelBuffer.length);
    // unsigned to signed data if needed
    var shift = false;
    if( this.dicomElements.PixelRepresentation &&
            this.dicomElements.PixelRepresentation.value[0] == 1) {
        shift = true;
    }
    for( var i=0; i<this.pixelBuffer.length; ++i ) {
        buffer[i] = this.pixelBuffer[i];
        if( shift && buffer[i] >= Math.pow(2, 15) ) 
            buffer[i] -= Math.pow(2, 16);
    }
    // slice position
    var slicePosition = [0,0,0];
    if( this.dicomElements.ImagePositionPatient )
        slicePosition = [ parseFloat(this.dicomElements.ImagePositionPatient.value[0]),
            parseFloat(this.dicomElements.ImagePositionPatient.value[1]),
            parseFloat(this.dicomElements.ImagePositionPatient.value[2]) ];
    
    // image
    var image = new dwv.image.Image( size, spacing, buffer, [slicePosition] );
    // photometricInterpretation
    if( this.dicomElements.PhotometricInterpretation ) {
        image.setPhotometricInterpretation( dwv.utils.cleanString(
            this.dicomElements.PhotometricInterpretation.value[0]).toUpperCase() );
    }        
    // planarConfiguration
    if( this.dicomElements.PlanarConfiguration ) {
        image.setPlanarConfiguration( 
            this.dicomElements.PlanarConfiguration.value[0] );
    }        
    // rescale slope
    if( this.dicomElements.RescaleSlope ) {
        image.setRescaleSlope( parseFloat(this.dicomElements.RescaleSlope.value[0]) );
    }
    // rescale intercept
    if( this.dicomElements.RescaleIntercept ) {
        image.setRescaleIntercept( parseFloat(this.dicomElements.RescaleIntercept.value[0]) );
    }
    // meta information
    var meta = {};
    if( this.dicomElements.Modality ) {
        meta.Modality = this.dicomElements.Modality.value[0];
    }
    if( this.dicomElements.StudyInstanceUID ) {
        meta.StudyInstanceUID = this.dicomElements.StudyInstanceUID.value[0];
    }
    if( this.dicomElements.SeriesInstanceUID ) {
        meta.SeriesInstanceUID = this.dicomElements.SeriesInstanceUID.value[0];
    }
    if( this.dicomElements.BitsStored ) {
        meta.BitsStored = parseInt(this.dicomElements.BitsStored.value[0], 10);
    }
    image.setMeta(meta);
    
    // pixel representation
    var isSigned = 0;
    if( this.dicomElements.PixelRepresentation ) {
        isSigned = this.dicomElements.PixelRepresentation.value[0];
    }
    // view
    var view = new dwv.image.View(image, isSigned);
    // window center and width
    var windowPresets = [];
    if( this.dicomElements.WindowCenter && this.dicomElements.WindowWidth ) {
        var name;
        for( var j = 0; j < this.dicomElements.WindowCenter.value.length; ++j) {
            var width = parseFloat( this.dicomElements.WindowWidth.value[j], 10 );
            if( width !== 0 ) {
                if( this.dicomElements.WindowCenterWidthExplanation ) {
                    name = this.dicomElements.WindowCenterWidthExplanation.value[j];
                }
                else name = "Default"+j;
                windowPresets.push({
                    "center": parseFloat( this.dicomElements.WindowCenter.value[j], 10 ),
                    "width": width, 
                    "name": name
                });
            }
        }
    }
    if( windowPresets.length !== 0 ) view.setWindowPresets( windowPresets );
    else view.setWindowLevelMinMax();

    return view;
};
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace DICOM related.
dwv.dicom = dwv.dicom || {};

/**
 * @class DICOM tag dictionary.
 */
dwv.dicom.Dictionary = function() {
    this.newDictionary = [];
    this.init = function() {
        
        // 0x0000
        this.newDictionary['0x0000'] = [];
        this.newDictionary['0x0000']['0x0000'] = ['UL', '1', 'GroupLength'];
        this.newDictionary['0x0000']['0x0001'] = ['UL', '1', 'CommandLengthToEnd'];
        this.newDictionary['0x0000']['0x0002'] = ['UI', '1', 'AffectedSOPClassUID'];
        this.newDictionary['0x0000']['0x0003'] = ['UI', '1', 'RequestedSOPClassUID'];
        this.newDictionary['0x0000']['0x0010'] = ['CS', '1', 'CommandRecognitionCode'];
        this.newDictionary['0x0000']['0x0100'] = ['US', '1', 'CommandField'];
        this.newDictionary['0x0000']['0x0110'] = ['US', '1', 'MessageID'];
        this.newDictionary['0x0000']['0x0120'] = ['US', '1', 'MessageIDBeingRespondedTo'];
        this.newDictionary['0x0000']['0x0200'] = ['AE', '1', 'Initiator']; 
        this.newDictionary['0x0000']['0x0300'] = ['AE', '1', 'Receiver'];
        this.newDictionary['0x0000']['0x0400'] = ['AE', '1', 'FindLocation'];
        this.newDictionary['0x0000']['0x0600'] = ['AE', '1', 'MoveDestination'];
        this.newDictionary['0x0000']['0x0700'] = ['US', '1', 'Priority'];
        this.newDictionary['0x0000']['0x0800'] = ['US', '1', 'DataSetType'];
        this.newDictionary['0x0000']['0x0850'] = ['US', '1', 'NumberOfMatches'];
        this.newDictionary['0x0000']['0x0860'] = ['US', '1', 'ResponseSequenceNumber'];
        this.newDictionary['0x0000']['0x0900'] = ['US', '1', 'Status'];
        this.newDictionary['0x0000']['0x0901'] = ['AT', '1-n', 'OffendingElement'];
        this.newDictionary['0x0000']['0x0902'] = ['LO', '1', 'ErrorComment'];
        this.newDictionary['0x0000']['0x0903'] = ['US', '1', 'ErrorID'];
        this.newDictionary['0x0000']['0x0904'] = ['OT', '1-n', 'ErrorInformation'];
        this.newDictionary['0x0000']['0x1000'] = ['UI', '1', 'AffectedSOPInstanceUID'];
        this.newDictionary['0x0000']['0x1001'] = ['UI', '1', 'RequestedSOPInstanceUID'];
        this.newDictionary['0x0000']['0x1002'] = ['US', '1', 'EventTypeID'];
        this.newDictionary['0x0000']['0x1003'] = ['OT', '1-n', 'EventInformation'];
        this.newDictionary['0x0000']['0x1005'] = ['AT', '1-n', 'AttributeIdentifierList'];
        this.newDictionary['0x0000']['0x1007'] = ['AT', '1-n', 'ModificationList'];
        this.newDictionary['0x0000']['0x1008'] = ['US', '1', 'ActionTypeID'];
        this.newDictionary['0x0000']['0x1009'] = ['OT', '1-n', 'ActionInformation'];
        this.newDictionary['0x0000']['0x1013'] = ['UI', '1-n', 'SuccessfulSOPInstanceUIDList'];
        this.newDictionary['0x0000']['0x1014'] = ['UI', '1-n', 'FailedSOPInstanceUIDList'];
        this.newDictionary['0x0000']['0x1015'] = ['UI', '1-n', 'WarningSOPInstanceUIDList'];
        this.newDictionary['0x0000']['0x1020'] = ['US', '1', 'NumberOfRemainingSuboperations'];
        this.newDictionary['0x0000']['0x1021'] = ['US', '1', 'NumberOfCompletedSuboperations'];
        this.newDictionary['0x0000']['0x1022'] = ['US', '1', 'NumberOfFailedSuboperations'];
        this.newDictionary['0x0000']['0x1023'] = ['US', '1', 'NumberOfWarningSuboperations'];
        this.newDictionary['0x0000']['0x1030'] = ['AE', '1', 'MoveOriginatorApplicationEntityTitle'];
        this.newDictionary['0x0000']['0x1031'] = ['US', '1', 'MoveOriginatorMessageID'];
        this.newDictionary['0x0000']['0x4000'] = ['AT', '1', 'DialogReceiver'];
        this.newDictionary['0x0000']['0x4010'] = ['AT', '1', 'TerminalType'];
        this.newDictionary['0x0000']['0x5010'] = ['SH', '1', 'MessageSetID'];
        this.newDictionary['0x0000']['0x5020'] = ['SH', '1', 'EndMessageSet'];
        this.newDictionary['0x0000']['0x5110'] = ['AT', '1', 'DisplayFormat'];
        this.newDictionary['0x0000']['0x5120'] = ['AT', '1', 'PagePositionID'];
        this.newDictionary['0x0000']['0x5130'] = ['CS', '1', 'TextFormatID'];
        this.newDictionary['0x0000']['0x5140'] = ['CS', '1', 'NormalReverse'];
        this.newDictionary['0x0000']['0x5150'] = ['CS', '1', 'AddGrayScale'];
        this.newDictionary['0x0000']['0x5160'] = ['CS', '1', 'Borders'];
        this.newDictionary['0x0000']['0x5170'] = ['IS', '1', 'Copies'];
        this.newDictionary['0x0000']['0x5180'] = ['CS', '1', 'OldMagnificationType'];
        this.newDictionary['0x0000']['0x5190'] = ['CS', '1', 'Erase'];
        this.newDictionary['0x0000']['0x51A0'] = ['CS', '1', 'Print'];
        this.newDictionary['0x0000']['0x51B0'] = ['US', '1-n', 'Overlays'];

        // 0x0002
        this.newDictionary['0x0002'] = [];
        this.newDictionary['0x0002']['0x0000'] = ['UL', '1', 'MetaElementGroupLength'];
        this.newDictionary['0x0002']['0x0001'] = ['OB', '1', 'FileMetaInformationVersion'];
        this.newDictionary['0x0002']['0x0002'] = ['UI', '1', 'MediaStorageSOPClassUID'];
        this.newDictionary['0x0002']['0x0003'] = ['UI', '1', 'MediaStorageSOPInstanceUID'];
        this.newDictionary['0x0002']['0x0010'] = ['UI', '1', 'TransferSyntaxUID'];
        this.newDictionary['0x0002']['0x0012'] = ['UI', '1', 'ImplementationClassUID'];
        this.newDictionary['0x0002']['0x0013'] = ['SH', '1', 'ImplementationVersionName'];
        this.newDictionary['0x0002']['0x0016'] = ['AE', '1', 'SourceApplicationEntityTitle'];
        this.newDictionary['0x0002']['0x0100'] = ['UI', '1', 'PrivateInformationCreatorUID'];
        this.newDictionary['0x0002']['0x0102'] = ['OB', '1', 'PrivateInformation'];

        // 0x0004
        this.newDictionary['0x0004'] = [];
        this.newDictionary['0x0004']['0x0000'] = ['UL', '1', 'FileSetGroupLength'];
        this.newDictionary['0x0004']['0x1130'] = ['CS', '1', 'FileSetID'];
        this.newDictionary['0x0004']['0x1141'] = ['CS', '8', 'FileSetDescriptorFileID'];
        this.newDictionary['0x0004']['0x1142'] = ['CS', '1', 'FileSetCharacterSet'];
        this.newDictionary['0x0004']['0x1200'] = ['UL', '1', 'RootDirectoryFirstRecord'];
        this.newDictionary['0x0004']['0x1202'] = ['UL', '1', 'RootDirectoryLastRecord'];
        this.newDictionary['0x0004']['0x1212'] = ['US', '1', 'FileSetConsistencyFlag'];
        this.newDictionary['0x0004']['0x1220'] = ['SQ', '1', 'DirectoryRecordSequence'];
        this.newDictionary['0x0004']['0x1400'] = ['UL', '1', 'NextDirectoryRecordOffset'];
        this.newDictionary['0x0004']['0x1410'] = ['US', '1', 'RecordInUseFlag'];
        this.newDictionary['0x0004']['0x1420'] = ['UL', '1', 'LowerLevelDirectoryOffset'];
        this.newDictionary['0x0004']['0x1430'] = ['CS', '1', 'DirectoryRecordType'];
        this.newDictionary['0x0004']['0x1432'] = ['UI', '1', 'PrivateRecordUID'];
        this.newDictionary['0x0004']['0x1500'] = ['CS', '8', 'ReferencedFileID'];
        this.newDictionary['0x0004']['0x1504'] = ['UL', '1', 'DirectoryRecordOffset'];
        this.newDictionary['0x0004']['0x1510'] = ['UI', '1', 'ReferencedSOPClassUIDInFile'];
        this.newDictionary['0x0004']['0x1511'] = ['UI', '1', 'ReferencedSOPInstanceUIDInFile'];
        this.newDictionary['0x0004']['0x1512'] = ['UI', '1', 'ReferencedTransferSyntaxUIDInFile'];
        this.newDictionary['0x0004']['0x1600'] = ['UL', '1', 'NumberOfReferences'];

        // 0x0008
        this.newDictionary['0x0008'] = [];
        this.newDictionary['0x0008']['0x0000'] = ['UL', '1', 'IdentifyingGroupLength'];
        this.newDictionary['0x0008']['0x0001'] = ['UL', '1', 'LengthToEnd'];
        this.newDictionary['0x0008']['0x0005'] = ['CS', '1', 'SpecificCharacterSet'];
        this.newDictionary['0x0008']['0x0008'] = ['CS', '1-n', 'ImageType'];
        this.newDictionary['0x0008']['0x000A'] = ['US', '1', 'SequenceItemNumber'];
        this.newDictionary['0x0008']['0x0010'] = ['CS', '1', 'RecognitionCode'];
        this.newDictionary['0x0008']['0x0012'] = ['DA', '1', 'InstanceCreationDate'];
        this.newDictionary['0x0008']['0x0013'] = ['TM', '1', 'InstanceCreationTime'];
        this.newDictionary['0x0008']['0x0014'] = ['UI', '1', 'InstanceCreatorUID'];
        this.newDictionary['0x0008']['0x0016'] = ['UI', '1', 'SOPClassUID'];
        this.newDictionary['0x0008']['0x0018'] = ['UI', '1', 'SOPInstanceUID'];
        this.newDictionary['0x0008']['0x0020'] = ['DA', '1', 'StudyDate'];
        this.newDictionary['0x0008']['0x0021'] = ['DA', '1', 'SeriesDate'];
        this.newDictionary['0x0008']['0x0022'] = ['DA', '1', 'AcquisitionDate'];
        this.newDictionary['0x0008']['0x0023'] = ['DA', '1', 'ImageDate'];
        /* this.newDictionary['0x0008']['0x0023'] = ['DA','1','ContentDate']; */
        this.newDictionary['0x0008']['0x0024'] = ['DA', '1', 'OverlayDate'];
        this.newDictionary['0x0008']['0x0025'] = ['DA', '1', 'CurveDate'];
        this.newDictionary['0x0008']['0x002A'] = ['DT', '1', 'AcquisitionDatetime'];
        this.newDictionary['0x0008']['0x0030'] = ['TM', '1', 'StudyTime'];
        this.newDictionary['0x0008']['0x0031'] = ['TM', '1', 'SeriesTime'];
        this.newDictionary['0x0008']['0x0032'] = ['TM', '1', 'AcquisitionTime'];
        this.newDictionary['0x0008']['0x0033'] = ['TM', '1', 'ImageTime'];
        this.newDictionary['0x0008']['0x0034'] = ['TM', '1', 'OverlayTime'];
        this.newDictionary['0x0008']['0x0035'] = ['TM', '1', 'CurveTime'];
        this.newDictionary['0x0008']['0x0040'] = ['US', '1', 'OldDataSetType'];
        this.newDictionary['0x0008']['0x0041'] = ['LT', '1', 'OldDataSetSubtype'];
        this.newDictionary['0x0008']['0x0042'] = ['CS', '1', 'NuclearMedicineSeriesType'];
        this.newDictionary['0x0008']['0x0050'] = ['SH', '1', 'AccessionNumber'];
        this.newDictionary['0x0008']['0x0052'] = ['CS', '1', 'QueryRetrieveLevel'];
        this.newDictionary['0x0008']['0x0054'] = ['AE', '1-n', 'RetrieveAETitle'];
        this.newDictionary['0x0008']['0x0058'] = ['UI', '1-n', 'DataSetFailedSOPInstanceUIDList'];
        this.newDictionary['0x0008']['0x0060'] = ['CS', '1', 'Modality'];
        this.newDictionary['0x0008']['0x0061'] = ['CS', '1-n', 'ModalitiesInStudy'];
        this.newDictionary['0x0008']['0x0064'] = ['CS', '1', 'ConversionType'];
        this.newDictionary['0x0008']['0x0068'] = ['CS', '1', 'PresentationIntentType'];
        this.newDictionary['0x0008']['0x0070'] = ['LO', '1', 'Manufacturer'];
        this.newDictionary['0x0008']['0x0080'] = ['LO', '1', 'InstitutionName'];
        this.newDictionary['0x0008']['0x0081'] = ['ST', '1', 'InstitutionAddress'];
        this.newDictionary['0x0008']['0x0082'] = ['SQ', '1', 'InstitutionCodeSequence'];
        this.newDictionary['0x0008']['0x0090'] = ['PN', '1', 'ReferringPhysicianName'];
        this.newDictionary['0x0008']['0x0092'] = ['ST', '1', 'ReferringPhysicianAddress'];
        this.newDictionary['0x0008']['0x0094'] = ['SH', '1-n', 'ReferringPhysicianTelephoneNumber'];
        this.newDictionary['0x0008']['0x0100'] = ['SH', '1', 'CodeValue'];
        this.newDictionary['0x0008']['0x0102'] = ['SH', '1', 'CodingSchemeDesignator'];
        this.newDictionary['0x0008']['0x0103'] = ['SH', '1', 'CodingSchemeVersion'];
        this.newDictionary['0x0008']['0x0104'] = ['LO', '1', 'CodeMeaning'];
        this.newDictionary['0x0008']['0x0105'] = ['CS', '1', 'MappingResource'];
        this.newDictionary['0x0008']['0x0106'] = ['DT', '1', 'ContextGroupVersion'];
        this.newDictionary['0x0008']['0x0107'] = ['DT', '1', 'ContextGroupLocalVersion'];
        this.newDictionary['0x0008']['0x010B'] = ['CS', '1', 'CodeSetExtensionFlag'];
        this.newDictionary['0x0008']['0x010C'] = ['UI', '1', 'PrivateCodingSchemeCreatorUID'];
        this.newDictionary['0x0008']['0x010D'] = ['UI', '1', 'CodeSetExtensionCreatorUID'];
        this.newDictionary['0x0008']['0x010F'] = ['CS', '1', 'ContextIdentifier'];
        this.newDictionary['0x0008']['0x0201'] = ['SH', '1', 'TimezoneOffsetFromUTC'];
        this.newDictionary['0x0008']['0x1000'] = ['AE', '1', 'NetworkID'];
        this.newDictionary['0x0008']['0x1010'] = ['SH', '1', 'StationName'];
        this.newDictionary['0x0008']['0x1030'] = ['LO', '1', 'StudyDescription'];
        this.newDictionary['0x0008']['0x1032'] = ['SQ', '1', 'ProcedureCodeSequence'];
        this.newDictionary['0x0008']['0x103E'] = ['LO', '1', 'SeriesDescription'];
        this.newDictionary['0x0008']['0x1040'] = ['LO', '1', 'InstitutionalDepartmentName'];
        this.newDictionary['0x0008']['0x1048'] = ['PN', '1-n', 'PhysicianOfRecord'];
        this.newDictionary['0x0008']['0x1050'] = ['PN', '1-n', 'PerformingPhysicianName'];
        this.newDictionary['0x0008']['0x1060'] = ['PN', '1-n', 'PhysicianReadingStudy'];
        this.newDictionary['0x0008']['0x1070'] = ['PN', '1-n', 'OperatorName'];
        this.newDictionary['0x0008']['0x1080'] = ['LO', '1-n', 'AdmittingDiagnosisDescription'];
        this.newDictionary['0x0008']['0x1084'] = ['SQ', '1', 'AdmittingDiagnosisCodeSequence'];
        this.newDictionary['0x0008']['0x1090'] = ['LO', '1', 'ManufacturerModelName'];
        this.newDictionary['0x0008']['0x1100'] = ['SQ', '1', 'ReferencedResultsSequence'];
        this.newDictionary['0x0008']['0x1110'] = ['SQ', '1', 'ReferencedStudySequence'];
        this.newDictionary['0x0008']['0x1111'] = ['SQ', '1', 'ReferencedStudyComponentSequence'];
        this.newDictionary['0x0008']['0x1115'] = ['SQ', '1', 'ReferencedSeriesSequence'];
        this.newDictionary['0x0008']['0x1120'] = ['SQ', '1', 'ReferencedPatientSequence'];
        this.newDictionary['0x0008']['0x1125'] = ['SQ', '1', 'ReferencedVisitSequence'];
        this.newDictionary['0x0008']['0x1130'] = ['SQ', '1', 'ReferencedOverlaySequence'];
        this.newDictionary['0x0008']['0x1140'] = ['SQ', '1', 'ReferencedImageSequence'];
        this.newDictionary['0x0008']['0x1145'] = ['SQ', '1', 'ReferencedCurveSequence'];
        this.newDictionary['0x0008']['0x114A'] = ['SQ', '1', 'ReferencedInstanceSequence'];
        this.newDictionary['0x0008']['0x114B'] = ['LO', '1', 'ReferenceDescription'];
        this.newDictionary['0x0008']['0x1150'] = ['UI', '1', 'ReferencedSOPClassUID'];
        this.newDictionary['0x0008']['0x1155'] = ['UI', '1', 'ReferencedSOPInstanceUID'];
        this.newDictionary['0x0008']['0x115A'] = ['UI', '1-n', 'SOPClassesSupported'];
        this.newDictionary['0x0008']['0x1160'] = ['IS', '1', 'ReferencedFrameNumber'];
        this.newDictionary['0x0008']['0x1195'] = ['UI', '1', 'TransactionUID'];
        this.newDictionary['0x0008']['0x1197'] = ['US', '1', 'FailureReason'];
        this.newDictionary['0x0008']['0x1198'] = ['SQ', '1', 'FailedSOPSequence'];
        this.newDictionary['0x0008']['0x1199'] = ['SQ', '1', 'ReferencedSOPSequence'];
        this.newDictionary['0x0008']['0x2110'] = ['CS', '1', 'LossyImageCompression'];
        this.newDictionary['0x0008']['0x2111'] = ['ST', '1', 'DerivationDescription'];
        this.newDictionary['0x0008']['0x2112'] = ['SQ', '1', 'SourceImageSequence'];
        this.newDictionary['0x0008']['0x2120'] = ['SH', '1', 'StageName'];
        this.newDictionary['0x0008']['0x2122'] = ['IS', '1', 'StageNumber'];
        this.newDictionary['0x0008']['0x2124'] = ['IS', '1', 'NumberOfStages'];
        this.newDictionary['0x0008']['0x2128'] = ['IS', '1', 'ViewNumber'];
        this.newDictionary['0x0008']['0x2129'] = ['IS', '1', 'NumberOfEventTimers'];
        this.newDictionary['0x0008']['0x212A'] = ['IS', '1', 'NumberOfViewsInStage'];
        this.newDictionary['0x0008']['0x2130'] = ['DS', '1-n', 'EventElapsedTime'];
        this.newDictionary['0x0008']['0x2132'] = ['LO', '1-n', 'EventTimerName'];
        this.newDictionary['0x0008']['0x2142'] = ['IS', '1', 'StartTrim'];
        this.newDictionary['0x0008']['0x2143'] = ['IS', '1', 'StopTrim'];
        this.newDictionary['0x0008']['0x2144'] = ['IS', '1', 'RecommendedDisplayFrameRate'];
        this.newDictionary['0x0008']['0x2200'] = ['CS', '1', 'TransducerPosition'];
        this.newDictionary['0x0008']['0x2204'] = ['CS', '1', 'TransducerOrientation'];
        this.newDictionary['0x0008']['0x2208'] = ['CS', '1', 'AnatomicStructure'];
        this.newDictionary['0x0008']['0x2218'] = ['SQ', '1', 'AnatomicRegionSequence'];
        this.newDictionary['0x0008']['0x2220'] = ['SQ', '1', 'AnatomicRegionModifierSequence'];
        this.newDictionary['0x0008']['0x2228'] = ['SQ', '1', 'PrimaryAnatomicStructureSequence'];
        this.newDictionary['0x0008']['0x2229'] = ['SQ', '1', 'AnatomicStructureSpaceOrRegionSequence'];
        this.newDictionary['0x0008']['0x2230'] = ['SQ', '1', 'PrimaryAnatomicStructureModifierSequence'];
        this.newDictionary['0x0008']['0x2240'] = ['SQ', '1', 'TransducerPositionSequence'];
        this.newDictionary['0x0008']['0x2242'] = ['SQ', '1', 'TransducerPositionModifierSequence'];
        this.newDictionary['0x0008']['0x2244'] = ['SQ', '1', 'TransducerOrientationSequence'];
        this.newDictionary['0x0008']['0x2246'] = ['SQ', '1', 'TransducerOrientationModifierSequence'];
        this.newDictionary['0x0008']['0x4000'] = ['LT', '1-n', 'IdentifyingComments'];

        // 0x0010
        this.newDictionary['0x0010'] = [];
        this.newDictionary['0x0010']['0x0000'] = ['UL', '1', 'PatientGroupLength'];
        this.newDictionary['0x0010']['0x0010'] = ['PN', '1', 'PatientName'];
        this.newDictionary['0x0010']['0x0020'] = ['LO', '1', 'PatientID'];
        this.newDictionary['0x0010']['0x0021'] = ['LO', '1', 'IssuerOfPatientID'];
        this.newDictionary['0x0010']['0x0030'] = ['DA', '1', 'PatientBirthDate'];
        this.newDictionary['0x0010']['0x0032'] = ['TM', '1', 'PatientBirthTime'];
        this.newDictionary['0x0010']['0x0040'] = ['CS', '1', 'PatientSex'];
        this.newDictionary['0x0010']['0x0050'] = ['SQ', '1', 'PatientInsurancePlanCodeSequence'];
        this.newDictionary['0x0010']['0x1000'] = ['LO', '1-n', 'OtherPatientID'];
        this.newDictionary['0x0010']['0x1001'] = ['PN', '1-n', 'OtherPatientName'];
        this.newDictionary['0x0010']['0x1005'] = ['PN', '1', 'PatientBirthName'];
        this.newDictionary['0x0010']['0x1010'] = ['AS', '1', 'PatientAge'];
        this.newDictionary['0x0010']['0x1020'] = ['DS', '1', 'PatientSize'];
        this.newDictionary['0x0010']['0x1030'] = ['DS', '1', 'PatientWeight'];
        this.newDictionary['0x0010']['0x1040'] = ['LO', '1', 'PatientAddress'];
        this.newDictionary['0x0010']['0x1050'] = ['LT', '1-n', 'InsurancePlanIdentification'];
        this.newDictionary['0x0010']['0x1060'] = ['PN', '1', 'PatientMotherBirthName'];
        this.newDictionary['0x0010']['0x1080'] = ['LO', '1', 'MilitaryRank'];
        this.newDictionary['0x0010']['0x1081'] = ['LO', '1', 'BranchOfService'];
        this.newDictionary['0x0010']['0x1090'] = ['LO', '1', 'MedicalRecordLocator'];
        this.newDictionary['0x0010']['0x2000'] = ['LO', '1-n', 'MedicalAlerts'];
        this.newDictionary['0x0010']['0x2110'] = ['LO', '1-n', 'ContrastAllergies'];
        this.newDictionary['0x0010']['0x2150'] = ['LO', '1', 'CountryOfResidence'];
        this.newDictionary['0x0010']['0x2152'] = ['LO', '1', 'RegionOfResidence'];
        this.newDictionary['0x0010']['0x2154'] = ['SH', '1-n', 'PatientTelephoneNumber'];
        this.newDictionary['0x0010']['0x2160'] = ['SH', '1', 'EthnicGroup'];
        this.newDictionary['0x0010']['0x2180'] = ['SH', '1', 'Occupation'];
        this.newDictionary['0x0010']['0x21A0'] = ['CS', '1', 'SmokingStatus'];
        this.newDictionary['0x0010']['0x21B0'] = ['LT', '1', 'AdditionalPatientHistory'];
        this.newDictionary['0x0010']['0x21C0'] = ['US', '1', 'PregnancyStatus'];
        this.newDictionary['0x0010']['0x21D0'] = ['DA', '1', 'LastMenstrualDate'];
        this.newDictionary['0x0010']['0x21F0'] = ['LO', '1', 'PatientReligiousPreference'];
        this.newDictionary['0x0010']['0x4000'] = ['LT', '1', 'PatientComments'];

        // 0x0018
        this.newDictionary['0x0018'] = [];
        this.newDictionary['0x0018']['0x0000'] = ['UL', '1', 'AcquisitionGroupLength'];
        this.newDictionary['0x0018']['0x0010'] = ['LO', '1', 'ContrastBolusAgent'];
        this.newDictionary['0x0018']['0x0012'] = ['SQ', '1', 'ContrastBolusAgentSequence'];
        this.newDictionary['0x0018']['0x0014'] = ['SQ', '1', 'ContrastBolusAdministrationRouteSequence'];
        this.newDictionary['0x0018']['0x0015'] = ['CS', '1', 'BodyPartExamined'];
        this.newDictionary['0x0018']['0x0020'] = ['CS', '1-n', 'ScanningSequence'];
        this.newDictionary['0x0018']['0x0021'] = ['CS', '1-n', 'SequenceVariant'];
        this.newDictionary['0x0018']['0x0022'] = ['CS', '1-n', 'ScanOptions'];
        this.newDictionary['0x0018']['0x0023'] = ['CS', '1', 'MRAcquisitionType'];
        this.newDictionary['0x0018']['0x0024'] = ['SH', '1', 'SequenceName'];
        this.newDictionary['0x0018']['0x0025'] = ['CS', '1', 'AngioFlag'];
        this.newDictionary['0x0018']['0x0026'] = ['SQ', '1', 'InterventionDrugInformationSequence'];
        this.newDictionary['0x0018']['0x0027'] = ['TM', '1', 'InterventionDrugStopTime'];
        this.newDictionary['0x0018']['0x0028'] = ['DS', '1', 'InterventionDrugDose'];
        this.newDictionary['0x0018']['0x0029'] = ['SQ', '1', 'InterventionalDrugSequence'];
        this.newDictionary['0x0018']['0x002A'] = ['SQ', '1', 'AdditionalDrugSequence'];
        this.newDictionary['0x0018']['0x0030'] = ['LO', '1-n', 'Radionuclide'];
        this.newDictionary['0x0018']['0x0031'] = ['LO', '1-n', 'Radiopharmaceutical'];
        this.newDictionary['0x0018']['0x0032'] = ['DS', '1', 'EnergyWindowCenterline'];
        this.newDictionary['0x0018']['0x0033'] = ['DS', '1-n', 'EnergyWindowTotalWidth'];
        this.newDictionary['0x0018']['0x0034'] = ['LO', '1', 'InterventionalDrugName'];
        this.newDictionary['0x0018']['0x0035'] = ['TM', '1', 'InterventionalDrugStartTime'];
        this.newDictionary['0x0018']['0x0036'] = ['SQ', '1', 'InterventionalTherapySequence'];
        this.newDictionary['0x0018']['0x0037'] = ['CS', '1', 'TherapyType'];
        this.newDictionary['0x0018']['0x0038'] = ['CS', '1', 'InterventionalStatus'];
        this.newDictionary['0x0018']['0x0039'] = ['CS', '1', 'TherapyDescription'];
        this.newDictionary['0x0018']['0x0040'] = ['IS', '1', 'CineRate'];
        this.newDictionary['0x0018']['0x0050'] = ['DS', '1', 'SliceThickness'];
        this.newDictionary['0x0018']['0x0060'] = ['DS', '1', 'KVP'];
        this.newDictionary['0x0018']['0x0070'] = ['IS', '1', 'CountsAccumulated'];
        this.newDictionary['0x0018']['0x0071'] = ['CS', '1', 'AcquisitionTerminationCondition'];
        this.newDictionary['0x0018']['0x0072'] = ['DS', '1', 'EffectiveSeriesDuration'];
        this.newDictionary['0x0018']['0x0073'] = ['CS', '1', 'AcquisitionStartCondition'];
        this.newDictionary['0x0018']['0x0074'] = ['IS', '1', 'AcquisitionStartConditionData'];
        this.newDictionary['0x0018']['0x0075'] = ['IS', '1', 'AcquisitionTerminationConditionData'];
        this.newDictionary['0x0018']['0x0080'] = ['DS', '1', 'RepetitionTime'];
        this.newDictionary['0x0018']['0x0081'] = ['DS', '1', 'EchoTime'];
        this.newDictionary['0x0018']['0x0082'] = ['DS', '1', 'InversionTime'];
        this.newDictionary['0x0018']['0x0083'] = ['DS', '1', 'NumberOfAverages'];
        this.newDictionary['0x0018']['0x0084'] = ['DS', '1', 'ImagingFrequency'];
        this.newDictionary['0x0018']['0x0085'] = ['SH', '1', 'ImagedNucleus'];
        this.newDictionary['0x0018']['0x0086'] = ['IS', '1-n', 'EchoNumber'];
        this.newDictionary['0x0018']['0x0087'] = ['DS', '1', 'MagneticFieldStrength'];
        this.newDictionary['0x0018']['0x0088'] = ['DS', '1', 'SpacingBetweenSlices'];
        this.newDictionary['0x0018']['0x0089'] = ['IS', '1', 'NumberOfPhaseEncodingSteps'];
        this.newDictionary['0x0018']['0x0090'] = ['DS', '1', 'DataCollectionDiameter'];
        this.newDictionary['0x0018']['0x0091'] = ['IS', '1', 'EchoTrainLength'];
        this.newDictionary['0x0018']['0x0093'] = ['DS', '1', 'PercentSampling'];
        this.newDictionary['0x0018']['0x0094'] = ['DS', '1', 'PercentPhaseFieldOfView'];
        this.newDictionary['0x0018']['0x0095'] = ['DS', '1', 'PixelBandwidth'];
        this.newDictionary['0x0018']['0x1000'] = ['LO', '1', 'DeviceSerialNumber'];
        this.newDictionary['0x0018']['0x1002'] = ['UI', '1', 'DeviceUID'];
        this.newDictionary['0x0018']['0x1003'] = ['LO', '1', 'DeviceID'];
        this.newDictionary['0x0018']['0x1004'] = ['LO', '1', 'PlateID'];
        this.newDictionary['0x0018']['0x1005'] = ['LO', '1', 'GeneratorID'];
        this.newDictionary['0x0018']['0x1006'] = ['LO', '1', 'GridID'];
        this.newDictionary['0x0018']['0x1007'] = ['LO', '1', 'CassetteID'];
        this.newDictionary['0x0018']['0x1008'] = ['LO', '1', 'GantryID'];
        this.newDictionary['0x0018']['0x1010'] = ['LO', '1', 'SecondaryCaptureDeviceID'];
        this.newDictionary['0x0018']['0x1011'] = ['LO', '1', 'HardcopyCreationDeviceID'];
        this.newDictionary['0x0018']['0x1012'] = ['DA', '1', 'DateOfSecondaryCapture'];
        this.newDictionary['0x0018']['0x1014'] = ['TM', '1', 'TimeOfSecondaryCapture'];
        this.newDictionary['0x0018']['0x1016'] = ['LO', '1', 'SecondaryCaptureDeviceManufacturer'];
        this.newDictionary['0x0018']['0x1017'] = ['LO', '1', 'HardcopyDeviceManufacturer'];
        this.newDictionary['0x0018']['0x1018'] = ['LO', '1', 'SecondaryCaptureDeviceManufacturerModelName'];
        this.newDictionary['0x0018']['0x1019'] = ['LO', '1-n', 'SecondaryCaptureDeviceSoftwareVersion'];
        this.newDictionary['0x0018']['0x101A'] = ['LO', '1-n', 'HardcopyDeviceSoftwareVersion'];
        this.newDictionary['0x0018']['0x101B'] = ['LO', '1', 'HardcopyDeviceManfuacturersModelName'];
        this.newDictionary['0x0018']['0x1020'] = ['LO', '1-n', 'SoftwareVersion'];
        this.newDictionary['0x0018']['0x1022'] = ['SH', '1', 'VideoImageFormatAcquired'];
        this.newDictionary['0x0018']['0x1023'] = ['LO', '1', 'DigitalImageFormatAcquired'];
        this.newDictionary['0x0018']['0x1030'] = ['LO', '1', 'ProtocolName'];
        this.newDictionary['0x0018']['0x1040'] = ['LO', '1', 'ContrastBolusRoute'];
        this.newDictionary['0x0018']['0x1041'] = ['DS', '1', 'ContrastBolusVolume'];
        this.newDictionary['0x0018']['0x1042'] = ['TM', '1', 'ContrastBolusStartTime'];
        this.newDictionary['0x0018']['0x1043'] = ['TM', '1', 'ContrastBolusStopTime'];
        this.newDictionary['0x0018']['0x1044'] = ['DS', '1', 'ContrastBolusTotalDose'];
        this.newDictionary['0x0018']['0x1045'] = ['IS', '1-n', 'SyringeCounts'];
        this.newDictionary['0x0018']['0x1046'] = ['DS', '1-n', 'ContrastFlowRate'];
        this.newDictionary['0x0018']['0x1047'] = ['DS', '1-n', 'ContrastFlowDuration'];
        this.newDictionary['0x0018']['0x1048'] = ['CS', '1', 'ContrastBolusIngredient'];
        this.newDictionary['0x0018']['0x1049'] = ['DS', '1', 'ContrastBolusIngredientConcentration'];
        this.newDictionary['0x0018']['0x1050'] = ['DS', '1', 'SpatialResolution'];
        this.newDictionary['0x0018']['0x1060'] = ['DS', '1', 'TriggerTime'];
        this.newDictionary['0x0018']['0x1061'] = ['LO', '1', 'TriggerSourceOrType'];
        this.newDictionary['0x0018']['0x1062'] = ['IS', '1', 'NominalInterval'];
        this.newDictionary['0x0018']['0x1063'] = ['DS', '1', 'FrameTime'];
        this.newDictionary['0x0018']['0x1064'] = ['LO', '1', 'FramingType'];
        this.newDictionary['0x0018']['0x1065'] = ['DS', '1-n', 'FrameTimeVector'];
        this.newDictionary['0x0018']['0x1066'] = ['DS', '1', 'FrameDelay'];
        this.newDictionary['0x0018']['0x1067'] = ['DS', '1', 'ImageTriggerDelay'];
        this.newDictionary['0x0018']['0x1068'] = ['DS', '1', 'MultiplexGroupTimeOffset'];
        this.newDictionary['0x0018']['0x1069'] = ['DS', '1', 'TriggerTimeOffset'];
        this.newDictionary['0x0018']['0x106A'] = ['CS', '1', 'SynchronizationTrigger'];
        this.newDictionary['0x0018']['0x106C'] = ['US', '2', 'SynchronizationChannel'];
        this.newDictionary['0x0018']['0x106E'] = ['UL', '1', 'TriggerSamplePosition'];
        this.newDictionary['0x0018']['0x1070'] = ['LO', '1-n', 'RadionuclideRoute'];
        this.newDictionary['0x0018']['0x1071'] = ['DS', '1-n', 'RadionuclideVolume'];
        this.newDictionary['0x0018']['0x1072'] = ['TM', '1-n', 'RadionuclideStartTime'];
        this.newDictionary['0x0018']['0x1073'] = ['TM', '1-n', 'RadionuclideStopTime'];
        this.newDictionary['0x0018']['0x1074'] = ['DS', '1-n', 'RadionuclideTotalDose'];
        this.newDictionary['0x0018']['0x1075'] = ['DS', '1', 'RadionuclideHalfLife'];
        this.newDictionary['0x0018']['0x1076'] = ['DS', '1', 'RadionuclidePositronFraction'];
        this.newDictionary['0x0018']['0x1077'] = ['DS', '1', 'RadiopharmaceuticalSpecificActivity'];
        this.newDictionary['0x0018']['0x1080'] = ['CS', '1', 'BeatRejectionFlag'];
        this.newDictionary['0x0018']['0x1081'] = ['IS', '1', 'LowRRValue'];
        this.newDictionary['0x0018']['0x1082'] = ['IS', '1', 'HighRRValue'];
        this.newDictionary['0x0018']['0x1083'] = ['IS', '1', 'IntervalsAcquired'];
        this.newDictionary['0x0018']['0x1084'] = ['IS', '1', 'IntervalsRejected'];
        this.newDictionary['0x0018']['0x1085'] = ['LO', '1', 'PVCRejection'];
        this.newDictionary['0x0018']['0x1086'] = ['IS', '1', 'SkipBeats'];
        this.newDictionary['0x0018']['0x1088'] = ['IS', '1', 'HeartRate'];
        this.newDictionary['0x0018']['0x1090'] = ['IS', '1', 'CardiacNumberOfImages'];
        this.newDictionary['0x0018']['0x1094'] = ['IS', '1', 'TriggerWindow'];
        this.newDictionary['0x0018']['0x1100'] = ['DS', '1', 'ReconstructionDiameter'];
        this.newDictionary['0x0018']['0x1110'] = ['DS', '1', 'DistanceSourceToDetector'];
        this.newDictionary['0x0018']['0x1111'] = ['DS', '1', 'DistanceSourceToPatient'];
        this.newDictionary['0x0018']['0x1114'] = ['DS', '1', 'EstimatedRadiographicMagnificationFactor'];
        this.newDictionary['0x0018']['0x1120'] = ['DS', '1', 'GantryDetectorTilt'];
        this.newDictionary['0x0018']['0x1121'] = ['DS', '1', 'GantryDetectorSlew'];
        this.newDictionary['0x0018']['0x1130'] = ['DS', '1', 'TableHeight'];
        this.newDictionary['0x0018']['0x1131'] = ['DS', '1', 'TableTraverse'];
        this.newDictionary['0x0018']['0x1134'] = ['DS', '1', 'TableMotion'];
        this.newDictionary['0x0018']['0x1135'] = ['DS', '1-n', 'TableVerticalIncrement'];
        this.newDictionary['0x0018']['0x1136'] = ['DS', '1-n', 'TableLateralIncrement'];
        this.newDictionary['0x0018']['0x1137'] = ['DS', '1-n', 'TableLongitudinalIncrement'];
        this.newDictionary['0x0018']['0x1138'] = ['DS', '1', 'TableAngle'];
        this.newDictionary['0x0018']['0x113A'] = ['CS', '1', 'TableType'];
        this.newDictionary['0x0018']['0x1140'] = ['CS', '1', 'RotationDirection'];
        this.newDictionary['0x0018']['0x1141'] = ['DS', '1', 'AngularPosition'];
        this.newDictionary['0x0018']['0x1142'] = ['DS', '1-n', 'RadialPosition'];
        this.newDictionary['0x0018']['0x1143'] = ['DS', '1', 'ScanArc'];
        this.newDictionary['0x0018']['0x1144'] = ['DS', '1', 'AngularStep'];
        this.newDictionary['0x0018']['0x1145'] = ['DS', '1', 'CenterOfRotationOffset'];
        this.newDictionary['0x0018']['0x1146'] = ['DS', '1-n', 'RotationOffset'];
        this.newDictionary['0x0018']['0x1147'] = ['CS', '1', 'FieldOfViewShape'];
        this.newDictionary['0x0018']['0x1149'] = ['IS', '2', 'FieldOfViewDimension'];
        this.newDictionary['0x0018']['0x1150'] = ['IS', '1', 'ExposureTime'];
        this.newDictionary['0x0018']['0x1151'] = ['IS', '1', 'XrayTubeCurrent'];
        this.newDictionary['0x0018']['0x1152'] = ['IS', '1', 'Exposure'];
        this.newDictionary['0x0018']['0x1153'] = ['IS', '1', 'ExposureinuAs'];
        this.newDictionary['0x0018']['0x1154'] = ['DS', '1', 'AveragePulseWidth'];
        this.newDictionary['0x0018']['0x1155'] = ['CS', '1', 'RadiationSetting'];
        this.newDictionary['0x0018']['0x1156'] = ['CS', '1', 'RectificationType'];
        this.newDictionary['0x0018']['0x115A'] = ['CS', '1', 'RadiationMode'];
        this.newDictionary['0x0018']['0x115E'] = ['DS', '1', 'ImageAreaDoseProduct'];
        this.newDictionary['0x0018']['0x1160'] = ['SH', '1', 'FilterType'];
        this.newDictionary['0x0018']['0x1161'] = ['LO', '1-n', 'TypeOfFilters'];
        this.newDictionary['0x0018']['0x1162'] = ['DS', '1', 'IntensifierSize'];
        this.newDictionary['0x0018']['0x1164'] = ['DS', '2', 'ImagerPixelSpacing'];
        this.newDictionary['0x0018']['0x1166'] = ['CS', '1', 'Grid'];
        this.newDictionary['0x0018']['0x1170'] = ['IS', '1', 'GeneratorPower'];
        this.newDictionary['0x0018']['0x1180'] = ['SH', '1', 'CollimatorGridName'];
        this.newDictionary['0x0018']['0x1181'] = ['CS', '1', 'CollimatorType'];
        this.newDictionary['0x0018']['0x1182'] = ['IS', '1', 'FocalDistance'];
        this.newDictionary['0x0018']['0x1183'] = ['DS', '1', 'XFocusCenter'];
        this.newDictionary['0x0018']['0x1184'] = ['DS', '1', 'YFocusCenter'];
        this.newDictionary['0x0018']['0x1190'] = ['DS', '1-n', 'FocalSpot'];
        this.newDictionary['0x0018']['0x1191'] = ['CS', '1', 'AnodeTargetMaterial'];
        this.newDictionary['0x0018']['0x11A0'] = ['DS', '1', 'BodyPartThickness'];
        this.newDictionary['0x0018']['0x11A2'] = ['DS', '1', 'CompressionForce'];
        this.newDictionary['0x0018']['0x1200'] = ['DA', '1-n', 'DateOfLastCalibration'];
        this.newDictionary['0x0018']['0x1201'] = ['TM', '1-n', 'TimeOfLastCalibration'];
        this.newDictionary['0x0018']['0x1210'] = ['SH', '1-n', 'ConvolutionKernel'];
        this.newDictionary['0x0018']['0x1240'] = ['IS', '1-n', 'UpperLowerPixelValues'];
        this.newDictionary['0x0018']['0x1242'] = ['IS', '1', 'ActualFrameDuration'];
        this.newDictionary['0x0018']['0x1243'] = ['IS', '1', 'CountRate'];
        this.newDictionary['0x0018']['0x1244'] = ['US', '1', 'PreferredPlaybackSequencing'];
        this.newDictionary['0x0018']['0x1250'] = ['SH', '1', 'ReceivingCoil'];
        this.newDictionary['0x0018']['0x1251'] = ['SH', '1', 'TransmittingCoil'];
        this.newDictionary['0x0018']['0x1260'] = ['SH', '1', 'PlateType'];
        this.newDictionary['0x0018']['0x1261'] = ['LO', '1', 'PhosphorType'];
        this.newDictionary['0x0018']['0x1300'] = ['IS', '1', 'ScanVelocity'];
        this.newDictionary['0x0018']['0x1301'] = ['CS', '1-n', 'WholeBodyTechnique'];
        this.newDictionary['0x0018']['0x1302'] = ['IS', '1', 'ScanLength'];
        this.newDictionary['0x0018']['0x1310'] = ['US', '4', 'AcquisitionMatrix'];
        this.newDictionary['0x0018']['0x1312'] = ['CS', '1', 'PhaseEncodingDirection'];
        this.newDictionary['0x0018']['0x1314'] = ['DS', '1', 'FlipAngle'];
        this.newDictionary['0x0018']['0x1315'] = ['CS', '1', 'VariableFlipAngleFlag'];
        this.newDictionary['0x0018']['0x1316'] = ['DS', '1', 'SAR'];
        this.newDictionary['0x0018']['0x1318'] = ['DS', '1', 'dBdt'];
        this.newDictionary['0x0018']['0x1400'] = ['LO', '1', 'AcquisitionDeviceProcessingDescription'];
        this.newDictionary['0x0018']['0x1401'] = ['LO', '1', 'AcquisitionDeviceProcessingCode'];
        this.newDictionary['0x0018']['0x1402'] = ['CS', '1', 'CassetteOrientation'];
        this.newDictionary['0x0018']['0x1403'] = ['CS', '1', 'CassetteSize'];
        this.newDictionary['0x0018']['0x1404'] = ['US', '1', 'ExposuresOnPlate'];
        this.newDictionary['0x0018']['0x1405'] = ['IS', '1', 'RelativeXrayExposure'];
        this.newDictionary['0x0018']['0x1450'] = ['DS', '1', 'ColumnAngulation'];
        this.newDictionary['0x0018']['0x1460'] = ['DS', '1', 'TomoLayerHeight'];
        this.newDictionary['0x0018']['0x1470'] = ['DS', '1', 'TomoAngle'];
        this.newDictionary['0x0018']['0x1480'] = ['DS', '1', 'TomoTime'];
        this.newDictionary['0x0018']['0x1490'] = ['CS', '1', 'TomoType'];
        this.newDictionary['0x0018']['0x1491'] = ['CS', '1', 'TomoClass'];
        this.newDictionary['0x0018']['0x1495'] = ['IS', '1', 'NumberofTomosynthesisSourceImages'];
        this.newDictionary['0x0018']['0x1500'] = ['CS', '1', 'PositionerMotion'];
        this.newDictionary['0x0018']['0x1508'] = ['CS', '1', 'PositionerType'];
        this.newDictionary['0x0018']['0x1510'] = ['DS', '1', 'PositionerPrimaryAngle'];
        this.newDictionary['0x0018']['0x1511'] = ['DS', '1', 'PositionerSecondaryAngle'];
        this.newDictionary['0x0018']['0x1520'] = ['DS', '1-n', 'PositionerPrimaryAngleIncrement'];
        this.newDictionary['0x0018']['0x1521'] = ['DS', '1-n', 'PositionerSecondaryAngleIncrement'];
        this.newDictionary['0x0018']['0x1530'] = ['DS', '1', 'DetectorPrimaryAngle'];
        this.newDictionary['0x0018']['0x1531'] = ['DS', '1', 'DetectorSecondaryAngle'];
        this.newDictionary['0x0018']['0x1600'] = ['CS', '3', 'ShutterShape'];
        this.newDictionary['0x0018']['0x1602'] = ['IS', '1', 'ShutterLeftVerticalEdge'];
        this.newDictionary['0x0018']['0x1604'] = ['IS', '1', 'ShutterRightVerticalEdge'];
        this.newDictionary['0x0018']['0x1606'] = ['IS', '1', 'ShutterUpperHorizontalEdge'];
        this.newDictionary['0x0018']['0x1608'] = ['IS', '1', 'ShutterLowerHorizontalEdge'];
        this.newDictionary['0x0018']['0x1610'] = ['IS', '1', 'CenterOfCircularShutter'];
        this.newDictionary['0x0018']['0x1612'] = ['IS', '1', 'RadiusOfCircularShutter'];
        this.newDictionary['0x0018']['0x1620'] = ['IS', '1-n', 'VerticesOfPolygonalShutter'];
        this.newDictionary['0x0018']['0x1622'] = ['US', '1', 'ShutterPresentationValue'];
        this.newDictionary['0x0018']['0x1623'] = ['US', '1', 'ShutterOverlayGroup'];
        this.newDictionary['0x0018']['0x1700'] = ['CS', '3', 'CollimatorShape'];
        this.newDictionary['0x0018']['0x1702'] = ['IS', '1', 'CollimatorLeftVerticalEdge'];
        this.newDictionary['0x0018']['0x1704'] = ['IS', '1', 'CollimatorRightVerticalEdge'];
        this.newDictionary['0x0018']['0x1706'] = ['IS', '1', 'CollimatorUpperHorizontalEdge'];
        this.newDictionary['0x0018']['0x1708'] = ['IS', '1', 'CollimatorLowerHorizontalEdge'];
        this.newDictionary['0x0018']['0x1710'] = ['IS', '1', 'CenterOfCircularCollimator'];
        this.newDictionary['0x0018']['0x1712'] = ['IS', '1', 'RadiusOfCircularCollimator'];
        this.newDictionary['0x0018']['0x1720'] = ['IS', '1-n', 'VerticesOfPolygonalCollimator'];
        this.newDictionary['0x0018']['0x1800'] = ['CS', '1', 'AcquisitionTimeSynchronized'];
        this.newDictionary['0x0018']['0x1801'] = ['SH', '1', 'TimeSource'];
        this.newDictionary['0x0018']['0x1802'] = ['CS', '1', 'TimeDistributionProtocol'];
        this.newDictionary['0x0018']['0x1810'] = ['DT', '1', 'AcquisitionTimestamp'];
        this.newDictionary['0x0018']['0x4000'] = ['LT', '1-n', 'AcquisitionComments'];
        this.newDictionary['0x0018']['0x5000'] = ['SH', '1-n', 'OutputPower'];
        this.newDictionary['0x0018']['0x5010'] = ['LO', '3', 'TransducerData'];
        this.newDictionary['0x0018']['0x5012'] = ['DS', '1', 'FocusDepth'];
        this.newDictionary['0x0018']['0x5020'] = ['LO', '1', 'PreprocessingFunction'];
        this.newDictionary['0x0018']['0x5021'] = ['LO', '1', 'PostprocessingFunction'];
        this.newDictionary['0x0018']['0x5022'] = ['DS', '1', 'MechanicalIndex'];
        this.newDictionary['0x0018']['0x5024'] = ['DS', '1', 'ThermalIndex'];
        this.newDictionary['0x0018']['0x5026'] = ['DS', '1', 'CranialThermalIndex'];
        this.newDictionary['0x0018']['0x5027'] = ['DS', '1', 'SoftTissueThermalIndex'];
        this.newDictionary['0x0018']['0x5028'] = ['DS', '1', 'SoftTissueFocusThermalIndex'];
        this.newDictionary['0x0018']['0x5029'] = ['DS', '1', 'SoftTissueSurfaceThermalIndex'];
        this.newDictionary['0x0018']['0x5030'] = ['DS', '1', 'DynamicRange'];
        this.newDictionary['0x0018']['0x5040'] = ['DS', '1', 'TotalGain'];
        this.newDictionary['0x0018']['0x5050'] = ['IS', '1', 'DepthOfScanField'];
        this.newDictionary['0x0018']['0x5100'] = ['CS', '1', 'PatientPosition'];
        this.newDictionary['0x0018']['0x5101'] = ['CS', '1', 'ViewPosition'];
        this.newDictionary['0x0018']['0x5104'] = ['SQ', '1', 'ProjectionEponymousNameCodeSequence'];
        this.newDictionary['0x0018']['0x5210'] = ['DS', '6', 'ImageTransformationMatrix'];
        this.newDictionary['0x0018']['0x5212'] = ['DS', '3', 'ImageTranslationVector'];
        this.newDictionary['0x0018']['0x6000'] = ['DS', '1', 'Sensitivity'];
        this.newDictionary['0x0018']['0x6011'] = ['SQ', '1', 'SequenceOfUltrasoundRegions'];
        this.newDictionary['0x0018']['0x6012'] = ['US', '1', 'RegionSpatialFormat'];
        this.newDictionary['0x0018']['0x6014'] = ['US', '1', 'RegionDataType'];
        this.newDictionary['0x0018']['0x6016'] = ['UL', '1', 'RegionFlags'];
        this.newDictionary['0x0018']['0x6018'] = ['UL', '1', 'RegionLocationMinX0'];
        this.newDictionary['0x0018']['0x601A'] = ['UL', '1', 'RegionLocationMinY0'];
        this.newDictionary['0x0018']['0x601C'] = ['UL', '1', 'RegionLocationMaxX1'];
        this.newDictionary['0x0018']['0x601E'] = ['UL', '1', 'RegionLocationMaxY1'];
        this.newDictionary['0x0018']['0x6020'] = ['SL', '1', 'ReferencePixelX0'];
        this.newDictionary['0x0018']['0x6022'] = ['SL', '1', 'ReferencePixelY0'];
        this.newDictionary['0x0018']['0x6024'] = ['US', '1', 'PhysicalUnitsXDirection'];
        this.newDictionary['0x0018']['0x6026'] = ['US', '1', 'PhysicalUnitsYDirection'];
        this.newDictionary['0x0018']['0x6028'] = ['FD', '1', 'ReferencePixelPhysicalValueX'];
        this.newDictionary['0x0018']['0x602A'] = ['FD', '1', 'ReferencePixelPhysicalValueY'];
        this.newDictionary['0x0018']['0x602C'] = ['FD', '1', 'PhysicalDeltaX'];
        this.newDictionary['0x0018']['0x602E'] = ['FD', '1', 'PhysicalDeltaY'];
        this.newDictionary['0x0018']['0x6030'] = ['UL', '1', 'TransducerFrequency'];
        this.newDictionary['0x0018']['0x6031'] = ['CS', '1', 'TransducerType'];
        this.newDictionary['0x0018']['0x6032'] = ['UL', '1', 'PulseRepetitionFrequency'];
        this.newDictionary['0x0018']['0x6034'] = ['FD', '1', 'DopplerCorrectionAngle'];
        this.newDictionary['0x0018']['0x6036'] = ['FD', '1', 'SteeringAngle'];
        this.newDictionary['0x0018']['0x6038'] = ['UL', '1', 'DopplerSampleVolumeXPosition'];
        this.newDictionary['0x0018']['0x603A'] = ['UL', '1', 'DopplerSampleVolumeYPosition'];
        this.newDictionary['0x0018']['0x603C'] = ['UL', '1', 'TMLinePositionX0'];
        this.newDictionary['0x0018']['0x603E'] = ['UL', '1', 'TMLinePositionY0'];
        this.newDictionary['0x0018']['0x6040'] = ['UL', '1', 'TMLinePositionX1'];
        this.newDictionary['0x0018']['0x6042'] = ['UL', '1', 'TMLinePositionY1'];
        this.newDictionary['0x0018']['0x6044'] = ['US', '1', 'PixelComponentOrganization'];
        this.newDictionary['0x0018']['0x6046'] = ['UL', '1', 'PixelComponentMask'];
        this.newDictionary['0x0018']['0x6048'] = ['UL', '1', 'PixelComponentRangeStart'];
        this.newDictionary['0x0018']['0x604A'] = ['UL', '1', 'PixelComponentRangeStop'];
        this.newDictionary['0x0018']['0x604C'] = ['US', '1', 'PixelComponentPhysicalUnits'];
        this.newDictionary['0x0018']['0x604E'] = ['US', '1', 'PixelComponentDataType'];
        this.newDictionary['0x0018']['0x6050'] = ['UL', '1', 'NumberOfTableBreakPoints'];
        this.newDictionary['0x0018']['0x6052'] = ['UL', '1-n', 'TableOfXBreakPoints'];
        this.newDictionary['0x0018']['0x6054'] = ['FD', '1-n', 'TableOfYBreakPoints'];
        this.newDictionary['0x0018']['0x6056'] = ['UL', '1', 'NumberOfTableEntries'];
        this.newDictionary['0x0018']['0x6058'] = ['UL', '1-n', 'TableOfPixelValues'];
        this.newDictionary['0x0018']['0x605A'] = ['FL', '1-n', 'TableOfParameterValues'];
        this.newDictionary['0x0018']['0x7000'] = ['CS', '1', 'DetectorConditionsNominalFlag'];
        this.newDictionary['0x0018']['0x7001'] = ['DS', '1', 'DetectorTemperature'];
        this.newDictionary['0x0018']['0x7004'] = ['CS', '1', 'DetectorType'];
        this.newDictionary['0x0018']['0x7005'] = ['CS', '1', 'DetectorConfiguration'];
        this.newDictionary['0x0018']['0x7006'] = ['LT', '1', 'DetectorDescription'];
        this.newDictionary['0x0018']['0x7008'] = ['LT', '1', 'DetectorMode'];
        this.newDictionary['0x0018']['0x700A'] = ['SH', '1', 'DetectorID'];
        this.newDictionary['0x0018']['0x700C'] = ['DA', '1', 'DateofLastDetectorCalibration'];
        this.newDictionary['0x0018']['0x700E'] = ['TM', '1', 'TimeofLastDetectorCalibration'];
        this.newDictionary['0x0018']['0x7010'] = ['IS', '1', 'ExposuresOnDetectorSinceLastCalibration'];
        this.newDictionary['0x0018']['0x7011'] = ['IS', '1', 'ExposuresOnDetectorSinceManufactured'];
        this.newDictionary['0x0018']['0x7012'] = ['DS', '1', 'DetectorTimeSinceLastExposure'];
        this.newDictionary['0x0018']['0x7014'] = ['DS', '1', 'DetectorActiveTime'];
        this.newDictionary['0x0018']['0x7016'] = ['DS', '1', 'DetectorActivationOffsetFromExposure'];
        this.newDictionary['0x0018']['0x701A'] = ['DS', '2', 'DetectorBinning'];
        this.newDictionary['0x0018']['0x7020'] = ['DS', '2', 'DetectorElementPhysicalSize'];
        this.newDictionary['0x0018']['0x7022'] = ['DS', '2', 'DetectorElementSpacing'];
        this.newDictionary['0x0018']['0x7024'] = ['CS', '1', 'DetectorActiveShape'];
        this.newDictionary['0x0018']['0x7026'] = ['DS', '1-2', 'DetectorActiveDimensions'];
        this.newDictionary['0x0018']['0x7028'] = ['DS', '2', 'DetectorActiveOrigin'];
        this.newDictionary['0x0018']['0x7030'] = ['DS', '2', 'FieldofViewOrigin'];
        this.newDictionary['0x0018']['0x7032'] = ['DS', '1', 'FieldofViewRotation'];
        this.newDictionary['0x0018']['0x7034'] = ['CS', '1', 'FieldofViewHorizontalFlip'];
        this.newDictionary['0x0018']['0x7040'] = ['LT', '1', 'GridAbsorbingMaterial'];
        this.newDictionary['0x0018']['0x7041'] = ['LT', '1', 'GridSpacingMaterial'];
        this.newDictionary['0x0018']['0x7042'] = ['DS', '1', 'GridThickness'];
        this.newDictionary['0x0018']['0x7044'] = ['DS', '1', 'GridPitch'];
        this.newDictionary['0x0018']['0x7046'] = ['IS', '2', 'GridAspectRatio'];
        this.newDictionary['0x0018']['0x7048'] = ['DS', '1', 'GridPeriod'];
        this.newDictionary['0x0018']['0x704C'] = ['DS', '1', 'GridFocalDistance'];
        this.newDictionary['0x0018']['0x7050'] = ['LT', '1-n', 'FilterMaterial'];
        this.newDictionary['0x0018']['0x7052'] = ['DS', '1-n', 'FilterThicknessMinimum'];
        this.newDictionary['0x0018']['0x7054'] = ['DS', '1-n', 'FilterThicknessMaximum'];
        this.newDictionary['0x0018']['0x7060'] = ['CS', '1', 'ExposureControlMode'];
        this.newDictionary['0x0018']['0x7062'] = ['LT', '1', 'ExposureControlModeDescription'];
        this.newDictionary['0x0018']['0x7064'] = ['CS', '1', 'ExposureStatus'];
        this.newDictionary['0x0018']['0x7065'] = ['DS', '1', 'PhototimerSetting'];

        // 0x0020
        this.newDictionary['0x0020'] = [];
        this.newDictionary['0x0020']['0x0000'] = ['UL', '1', 'ImageGroupLength'];
        this.newDictionary['0x0020']['0x000D'] = ['UI', '1', 'StudyInstanceUID'];
        this.newDictionary['0x0020']['0x000E'] = ['UI', '1', 'SeriesInstanceUID'];
        this.newDictionary['0x0020']['0x0010'] = ['SH', '1', 'StudyID'];
        this.newDictionary['0x0020']['0x0011'] = ['IS', '1', 'SeriesNumber'];
        this.newDictionary['0x0020']['0x0012'] = ['IS', '1', 'AcquisitionNumber'];
        this.newDictionary['0x0020']['0x0013'] = ['IS', '1', 'ImageNumber'];
        this.newDictionary['0x0020']['0x0014'] = ['IS', '1', 'IsotopeNumber'];
        this.newDictionary['0x0020']['0x0015'] = ['IS', '1', 'PhaseNumber'];
        this.newDictionary['0x0020']['0x0016'] = ['IS', '1', 'IntervalNumber'];
        this.newDictionary['0x0020']['0x0017'] = ['IS', '1', 'TimeSlotNumber'];
        this.newDictionary['0x0020']['0x0018'] = ['IS', '1', 'AngleNumber'];
        this.newDictionary['0x0020']['0x0019'] = ['IS', '1', 'ItemNumber'];
        this.newDictionary['0x0020']['0x0020'] = ['CS', '2', 'PatientOrientation'];
        this.newDictionary['0x0020']['0x0022'] = ['IS', '1', 'OverlayNumber'];
        this.newDictionary['0x0020']['0x0024'] = ['IS', '1', 'CurveNumber'];
        this.newDictionary['0x0020']['0x0026'] = ['IS', '1', 'LUTNumber'];
        this.newDictionary['0x0020']['0x0030'] = ['DS', '3', 'ImagePosition'];
        this.newDictionary['0x0020']['0x0032'] = ['DS', '3', 'ImagePositionPatient'];
        this.newDictionary['0x0020']['0x0035'] = ['DS', '6', 'ImageOrientation'];
        this.newDictionary['0x0020']['0x0037'] = ['DS', '6', 'ImageOrientationPatient'];
        this.newDictionary['0x0020']['0x0050'] = ['DS', '1', 'Location'];
        this.newDictionary['0x0020']['0x0052'] = ['UI', '1', 'FrameOfReferenceUID'];
        this.newDictionary['0x0020']['0x0060'] = ['CS', '1', 'Laterality'];
        this.newDictionary['0x0020']['0x0062'] = ['CS', '1', 'ImageLaterality'];
        this.newDictionary['0x0020']['0x0070'] = ['LT', '1', 'ImageGeometryType'];
        this.newDictionary['0x0020']['0x0080'] = ['CS', '1-n', 'MaskingImage'];
        this.newDictionary['0x0020']['0x0100'] = ['IS', '1', 'TemporalPositionIdentifier'];
        this.newDictionary['0x0020']['0x0105'] = ['IS', '1', 'NumberOfTemporalPositions'];
        this.newDictionary['0x0020']['0x0110'] = ['DS', '1', 'TemporalResolution'];
        this.newDictionary['0x0020']['0x0200'] = ['UI', '1', 'SynchronizationFrameofReferenceUID'];
        this.newDictionary['0x0020']['0x1000'] = ['IS', '1', 'SeriesInStudy'];
        this.newDictionary['0x0020']['0x1001'] = ['IS', '1', 'AcquisitionsInSeries'];
        this.newDictionary['0x0020']['0x1002'] = ['IS', '1', 'ImagesInAcquisition'];
        this.newDictionary['0x0020']['0x1003'] = ['IS', '1', 'ImagesInSeries'];
        this.newDictionary['0x0020']['0x1004'] = ['IS', '1', 'AcquisitionsInStudy'];
        this.newDictionary['0x0020']['0x1005'] = ['IS', '1', 'ImagesInStudy'];
        this.newDictionary['0x0020']['0x1020'] = ['CS', '1-n', 'Reference'];
        this.newDictionary['0x0020']['0x1040'] = ['LO', '1', 'PositionReferenceIndicator'];
        this.newDictionary['0x0020']['0x1041'] = ['DS', '1', 'SliceLocation'];
        this.newDictionary['0x0020']['0x1070'] = ['IS', '1-n', 'OtherStudyNumbers'];
        this.newDictionary['0x0020']['0x1200'] = ['IS', '1', 'NumberOfPatientRelatedStudies'];
        this.newDictionary['0x0020']['0x1202'] = ['IS', '1', 'NumberOfPatientRelatedSeries'];
        this.newDictionary['0x0020']['0x1204'] = ['IS', '1', 'NumberOfPatientRelatedImages'];
        this.newDictionary['0x0020']['0x1206'] = ['IS', '1', 'NumberOfStudyRelatedSeries'];
        this.newDictionary['0x0020']['0x1208'] = ['IS', '1', 'NumberOfStudyRelatedImages'];
        this.newDictionary['0x0020']['0x1209'] = ['IS', '1', 'NumberOfSeriesRelatedInstances'];
        this.newDictionary['0x0020']['0x3100'] = ['CS', '1-n', 'SourceImageID'];
        this.newDictionary['0x0020']['0x3401'] = ['CS', '1', 'ModifyingDeviceID'];
        this.newDictionary['0x0020']['0x3402'] = ['CS', '1', 'ModifiedImageID'];
        this.newDictionary['0x0020']['0x3403'] = ['DA', '1', 'ModifiedImageDate'];
        this.newDictionary['0x0020']['0x3404'] = ['LO', '1', 'ModifyingDeviceManufacturer'];
        this.newDictionary['0x0020']['0x3405'] = ['TM', '1', 'ModifiedImageTime'];
        this.newDictionary['0x0020']['0x3406'] = ['LT', '1', 'ModifiedImageDescription'];
        this.newDictionary['0x0020']['0x4000'] = ['LT', '1', 'ImageComments'];
        this.newDictionary['0x0020']['0x5000'] = ['AT', '1-n', 'OriginalImageIdentification'];
        this.newDictionary['0x0020']['0x5002'] = ['CS', '1-n', 'OriginalImageIdentificationNomenclature'];

        // 0x0028
        this.newDictionary['0x0028'] = [];
        this.newDictionary['0x0028']['0x0000'] = ['UL', '1', 'ImagePresentationGroupLength'];
        this.newDictionary['0x0028']['0x0002'] = ['US', '1', 'SamplesPerPixel'];
        this.newDictionary['0x0028']['0x0004'] = ['CS', '1', 'PhotometricInterpretation'];
        this.newDictionary['0x0028']['0x0005'] = ['US', '1', 'ImageDimensions'];
        this.newDictionary['0x0028']['0x0006'] = ['US', '1', 'PlanarConfiguration'];
        this.newDictionary['0x0028']['0x0008'] = ['IS', '1', 'NumberOfFrames'];
        this.newDictionary['0x0028']['0x0009'] = ['AT', '1', 'FrameIncrementPointer'];
        this.newDictionary['0x0028']['0x0010'] = ['US', '1', 'Rows'];
        this.newDictionary['0x0028']['0x0011'] = ['US', '1', 'Columns'];
        this.newDictionary['0x0028']['0x0012'] = ['US', '1', 'Planes'];
        this.newDictionary['0x0028']['0x0014'] = ['US', '1', 'UltrasoundColorDataPresent'];
        this.newDictionary['0x0028']['0x0030'] = ['DS', '2', 'PixelSpacing'];
        this.newDictionary['0x0028']['0x0031'] = ['DS', '2', 'ZoomFactor'];
        this.newDictionary['0x0028']['0x0032'] = ['DS', '2', 'ZoomCenter'];
        this.newDictionary['0x0028']['0x0034'] = ['IS', '2', 'PixelAspectRatio'];
        this.newDictionary['0x0028']['0x0040'] = ['CS', '1', 'ImageFormat'];
        this.newDictionary['0x0028']['0x0050'] = ['LT', '1-n', 'ManipulatedImage'];
        this.newDictionary['0x0028']['0x0051'] = ['CS', '1', 'CorrectedImage'];
        this.newDictionary['0x0028']['0x005F'] = ['CS', '1', 'CompressionRecognitionCode'];
        this.newDictionary['0x0028']['0x0060'] = ['CS', '1', 'CompressionCode'];
        this.newDictionary['0x0028']['0x0061'] = ['SH', '1', 'CompressionOriginator'];
        this.newDictionary['0x0028']['0x0062'] = ['SH', '1', 'CompressionLabel'];
        this.newDictionary['0x0028']['0x0063'] = ['SH', '1', 'CompressionDescription'];
        this.newDictionary['0x0028']['0x0065'] = ['CS', '1-n', 'CompressionSequence'];
        this.newDictionary['0x0028']['0x0066'] = ['AT', '1-n', 'CompressionStepPointers'];
        this.newDictionary['0x0028']['0x0068'] = ['US', '1', 'RepeatInterval'];
        this.newDictionary['0x0028']['0x0069'] = ['US', '1', 'BitsGrouped'];
        this.newDictionary['0x0028']['0x0070'] = ['US', '1-n', 'PerimeterTable'];
        this.newDictionary['0x0028']['0x0071'] = ['XS', '1', 'PerimeterValue'];
        this.newDictionary['0x0028']['0x0080'] = ['US', '1', 'PredictorRows'];
        this.newDictionary['0x0028']['0x0081'] = ['US', '1', 'PredictorColumns'];
        this.newDictionary['0x0028']['0x0082'] = ['US', '1-n', 'PredictorConstants'];
        this.newDictionary['0x0028']['0x0090'] = ['CS', '1', 'BlockedPixels'];
        this.newDictionary['0x0028']['0x0091'] = ['US', '1', 'BlockRows'];
        this.newDictionary['0x0028']['0x0092'] = ['US', '1', 'BlockColumns'];
        this.newDictionary['0x0028']['0x0093'] = ['US', '1', 'RowOverlap'];
        this.newDictionary['0x0028']['0x0094'] = ['US', '1', 'ColumnOverlap'];
        this.newDictionary['0x0028']['0x0100'] = ['US', '1', 'BitsAllocated'];
        this.newDictionary['0x0028']['0x0101'] = ['US', '1', 'BitsStored'];
        this.newDictionary['0x0028']['0x0102'] = ['US', '1', 'HighBit'];
        this.newDictionary['0x0028']['0x0103'] = ['US', '1', 'PixelRepresentation'];
        this.newDictionary['0x0028']['0x0104'] = ['XS', '1', 'SmallestValidPixelValue'];
        this.newDictionary['0x0028']['0x0105'] = ['XS', '1', 'LargestValidPixelValue'];
        this.newDictionary['0x0028']['0x0106'] = ['XS', '1', 'SmallestImagePixelValue'];
        this.newDictionary['0x0028']['0x0107'] = ['XS', '1', 'LargestImagePixelValue'];
        this.newDictionary['0x0028']['0x0108'] = ['XS', '1', 'SmallestPixelValueInSeries'];
        this.newDictionary['0x0028']['0x0109'] = ['XS', '1', 'LargestPixelValueInSeries'];
        this.newDictionary['0x0028']['0x0110'] = ['XS', '1', 'SmallestPixelValueInPlane'];
        this.newDictionary['0x0028']['0x0111'] = ['XS', '1', 'LargestPixelValueInPlane'];
        this.newDictionary['0x0028']['0x0120'] = ['XS', '1', 'PixelPaddingValue'];
        this.newDictionary['0x0028']['0x0200'] = ['US', '1', 'ImageLocation'];
        this.newDictionary['0x0028']['0x0300'] = ['CS', '1', 'QualityControlImage'];
        this.newDictionary['0x0028']['0x0301'] = ['CS', '1', 'BurnedInAnnotation'];
        this.newDictionary['0x0028']['0x0400'] = ['CS', '1', 'TransformLabel'];
        this.newDictionary['0x0028']['0x0401'] = ['CS', '1', 'TransformVersionNumber'];
        this.newDictionary['0x0028']['0x0402'] = ['US', '1', 'NumberOfTransformSteps'];
        this.newDictionary['0x0028']['0x0403'] = ['CS', '1-n', 'SequenceOfCompressedData'];
        this.newDictionary['0x0028']['0x0404'] = ['AT', '1-n', 'DetailsOfCoefficients'];
        this.newDictionary['0x0028']['0x0410'] = ['US', '1', 'RowsForNthOrderCoefficients'];
        this.newDictionary['0x0028']['0x0411'] = ['US', '1', 'ColumnsForNthOrderCoefficients'];
        this.newDictionary['0x0028']['0x0412'] = ['CS', '1-n', 'CoefficientCoding'];
        this.newDictionary['0x0028']['0x0413'] = ['AT', '1-n', 'CoefficientCodingPointers'];
        this.newDictionary['0x0028']['0x0700'] = ['CS', '1', 'DCTLabel'];
        this.newDictionary['0x0028']['0x0701'] = ['CS', '1-n', 'DataBlockDescription'];
        this.newDictionary['0x0028']['0x0702'] = ['AT', '1-n', 'DataBlock'];
        this.newDictionary['0x0028']['0x0710'] = ['US', '1', 'NormalizationFactorFormat'];
        this.newDictionary['0x0028']['0x0720'] = ['US', '1', 'ZonalMapNumberFormat'];
        this.newDictionary['0x0028']['0x0721'] = ['AT', '1-n', 'ZonalMapLocation'];
        this.newDictionary['0x0028']['0x0722'] = ['US', '1', 'ZonalMapFormat'];
        this.newDictionary['0x0028']['0x0730'] = ['US', '1', 'AdaptiveMapFormat'];
        this.newDictionary['0x0028']['0x0740'] = ['US', '1', 'CodeNumberFormat'];
        this.newDictionary['0x0028']['0x0800'] = ['CS', '1-n', 'CodeLabel'];
        this.newDictionary['0x0028']['0x0802'] = ['US', '1', 'NumberOfTables'];
        this.newDictionary['0x0028']['0x0803'] = ['AT', '1-n', 'CodeTableLocation'];
        this.newDictionary['0x0028']['0x0804'] = ['US', '1', 'BitsForCodeWord'];
        this.newDictionary['0x0028']['0x0808'] = ['AT', '1-n', 'ImageDataLocation'];
        this.newDictionary['0x0028']['0x1040'] = ['CS', '1', 'PixelIntensityRelationship'];
        this.newDictionary['0x0028']['0x1041'] = ['SS', '1', 'PixelIntensityRelationshipSign'];
        this.newDictionary['0x0028']['0x1050'] = ['DS', '1-n', 'WindowCenter'];
        this.newDictionary['0x0028']['0x1051'] = ['DS', '1-n', 'WindowWidth'];
        this.newDictionary['0x0028']['0x1052'] = ['DS', '1', 'RescaleIntercept'];
        this.newDictionary['0x0028']['0x1053'] = ['DS', '1', 'RescaleSlope'];
        this.newDictionary['0x0028']['0x1054'] = ['LO', '1', 'RescaleType'];
        this.newDictionary['0x0028']['0x1055'] = ['LO', '1-n', 'WindowCenterWidthExplanation'];
        this.newDictionary['0x0028']['0x1080'] = ['CS', '1', 'GrayScale'];
        this.newDictionary['0x0028']['0x1090'] = ['CS', '1', 'RecommendedViewingMode'];
        this.newDictionary['0x0028']['0x1100'] = ['XS', '3', 'GrayLookupTableDescriptor'];
        this.newDictionary['0x0028']['0x1101'] = ['XS', '3', 'RedPaletteColorLookupTableDescriptor'];
        this.newDictionary['0x0028']['0x1102'] = ['XS', '3', 'GreenPaletteColorLookupTableDescriptor'];
        this.newDictionary['0x0028']['0x1103'] = ['XS', '3', 'BluePaletteColorLookupTableDescriptor'];
        this.newDictionary['0x0028']['0x1111'] = ['US', '4', 'LargeRedPaletteColorLookupTableDescriptor'];
        this.newDictionary['0x0028']['0x1112'] = ['US', '4', 'LargeGreenPaletteColorLookupTabe'];
        this.newDictionary['0x0028']['0x1113'] = ['US', '4', 'LargeBluePaletteColorLookupTabl'];
        this.newDictionary['0x0028']['0x1199'] = ['UI', '1', 'PaletteColorLookupTableUID'];
        this.newDictionary['0x0028']['0x1200'] = ['XS', '1-n', 'GrayLookupTableData'];
        this.newDictionary['0x0028']['0x1201'] = ['XS', '1-n', 'RedPaletteColorLookupTableData'];
        this.newDictionary['0x0028']['0x1202'] = ['XS', '1-n', 'GreenPaletteColorLookupTableData'];
        this.newDictionary['0x0028']['0x1203'] = ['XS', '1-n', 'BluePaletteColorLookupTableData'];
        this.newDictionary['0x0028']['0x1211'] = ['OW', '1', 'LargeRedPaletteColorLookupTableData'];
        this.newDictionary['0x0028']['0x1212'] = ['OW', '1', 'LargeGreenPaletteColorLookupTableData'];
        this.newDictionary['0x0028']['0x1213'] = ['OW', '1', 'LargeBluePaletteColorLookupTableData'];
        this.newDictionary['0x0028']['0x1214'] = ['UI', '1', 'LargePaletteColorLookupTableUID'];
        this.newDictionary['0x0028']['0x1221'] = ['OW', '1', 'SegmentedRedPaletteColorLookupTableData'];
        this.newDictionary['0x0028']['0x1222'] = ['OW', '1', 'SegmentedGreenPaletteColorLookupTableData'];
        this.newDictionary['0x0028']['0x1223'] = ['OW', '1', 'SegmentedBluePaletteColorLookupTableData'];
        this.newDictionary['0x0028']['0x1300'] = ['CS', '1', 'ImplantPresent'];
        this.newDictionary['0x0028']['0x2110'] = ['CS', '1', 'LossyImageCompression'];
        this.newDictionary['0x0028']['0x2112'] = ['DS', '1-n', 'LossyImageCompressionRatio'];
        this.newDictionary['0x0028']['0x3000'] = ['SQ', '1', 'ModalityLUTSequence'];
        this.newDictionary['0x0028']['0x3002'] = ['XS', '3', 'LUTDescriptor'];
        this.newDictionary['0x0028']['0x3003'] = ['LO', '1', 'LUTExplanation'];
        this.newDictionary['0x0028']['0x3004'] = ['LO', '1', 'ModalityLUTType'];
        this.newDictionary['0x0028']['0x3006'] = ['XS', '1-n', 'LUTData'];
        this.newDictionary['0x0028']['0x3010'] = ['SQ', '1', 'VOILUTSequence'];
        this.newDictionary['0x0028']['0x3110'] = ['SQ', '1', 'SoftcopyVOILUTSequence'];
        this.newDictionary['0x0028']['0x4000'] = ['LT', '1-n', 'ImagePresentationComments'];
        this.newDictionary['0x0028']['0x5000'] = ['SQ', '1', 'BiPlaneAcquisitionSequence'];
        this.newDictionary['0x0028']['0x6010'] = ['US', '1', 'RepresentativeFrameNumber'];
        this.newDictionary['0x0028']['0x6020'] = ['US', '1-n', 'FrameNumbersOfInterest'];
        this.newDictionary['0x0028']['0x6022'] = ['LO', '1-n', 'FrameOfInterestDescription'];
        this.newDictionary['0x0028']['0x6030'] = ['US', '1-n', 'MaskPointer'];
        this.newDictionary['0x0028']['0x6040'] = ['US', '1-n', 'RWavePointer'];
        this.newDictionary['0x0028']['0x6100'] = ['SQ', '1', 'MaskSubtractionSequence'];
        this.newDictionary['0x0028']['0x6101'] = ['CS', '1', 'MaskOperation'];
        this.newDictionary['0x0028']['0x6102'] = ['US', '1-n', 'ApplicableFrameRange'];
        this.newDictionary['0x0028']['0x6110'] = ['US', '1-n', 'MaskFrameNumbers'];
        this.newDictionary['0x0028']['0x6112'] = ['US', '1', 'ContrastFrameAveraging'];
        this.newDictionary['0x0028']['0x6114'] = ['FL', '2', 'MaskSubPixelShift'];
        this.newDictionary['0x0028']['0x6120'] = ['SS', '1', 'TIDOffset'];
        this.newDictionary['0x0028']['0x6190'] = ['ST', '1', 'MaskOperationExplanation'];

        // 0x0032
        this.newDictionary['0x0032'] = [];
        this.newDictionary['0x0032']['0x0000'] = ['UL', '1', 'StudyGroupLength'];
        this.newDictionary['0x0032']['0x000A'] = ['CS', '1', 'StudyStatusID'];
        this.newDictionary['0x0032']['0x000C'] = ['CS', '1', 'StudyPriorityID'];
        this.newDictionary['0x0032']['0x0012'] = ['LO', '1', 'StudyIDIssuer'];
        this.newDictionary['0x0032']['0x0032'] = ['DA', '1', 'StudyVerifiedDate'];
        this.newDictionary['0x0032']['0x0033'] = ['TM', '1', 'StudyVerifiedTime'];
        this.newDictionary['0x0032']['0x0034'] = ['DA', '1', 'StudyReadDate'];
        this.newDictionary['0x0032']['0x0035'] = ['TM', '1', 'StudyReadTime'];
        this.newDictionary['0x0032']['0x1000'] = ['DA', '1', 'ScheduledStudyStartDate'];
        this.newDictionary['0x0032']['0x1001'] = ['TM', '1', 'ScheduledStudyStartTime'];
        this.newDictionary['0x0032']['0x1010'] = ['DA', '1', 'ScheduledStudyStopDate'];
        this.newDictionary['0x0032']['0x1011'] = ['TM', '1', 'ScheduledStudyStopTime'];
        this.newDictionary['0x0032']['0x1020'] = ['LO', '1', 'ScheduledStudyLocation'];
        this.newDictionary['0x0032']['0x1021'] = ['AE', '1-n', 'ScheduledStudyLocationAETitle'];
        this.newDictionary['0x0032']['0x1030'] = ['LO', '1', 'ReasonForStudy'];
        this.newDictionary['0x0032']['0x1032'] = ['PN', '1', 'RequestingPhysician'];
        this.newDictionary['0x0032']['0x1033'] = ['LO', '1', 'RequestingService'];
        this.newDictionary['0x0032']['0x1040'] = ['DA', '1', 'StudyArrivalDate'];
        this.newDictionary['0x0032']['0x1041'] = ['TM', '1', 'StudyArrivalTime'];
        this.newDictionary['0x0032']['0x1050'] = ['DA', '1', 'StudyCompletionDate'];
        this.newDictionary['0x0032']['0x1051'] = ['TM', '1', 'StudyCompletionTime'];
        this.newDictionary['0x0032']['0x1055'] = ['CS', '1', 'StudyComponentStatusID'];
        this.newDictionary['0x0032']['0x1060'] = ['LO', '1', 'RequestedProcedureDescription'];
        this.newDictionary['0x0032']['0x1064'] = ['SQ', '1', 'RequestedProcedureCodeSequence'];
        this.newDictionary['0x0032']['0x1070'] = ['LO', '1', 'RequestedContrastAgent'];
        this.newDictionary['0x0032']['0x4000'] = ['LT', '1', 'StudyComments'];

        // 0x0038
        this.newDictionary['0x0038'] = [];
        this.newDictionary['0x0038']['0x0000'] = ['UL', '1', 'VisitGroupLength'];
        this.newDictionary['0x0038']['0x0004'] = ['SQ', '1', 'ReferencedPatientAliasSequence'];
        this.newDictionary['0x0038']['0x0008'] = ['CS', '1', 'VisitStatusID'];
        this.newDictionary['0x0038']['0x0010'] = ['LO', '1', 'AdmissionID'];
        this.newDictionary['0x0038']['0x0011'] = ['LO', '1', 'IssuerOfAdmissionID'];
        this.newDictionary['0x0038']['0x0016'] = ['LO', '1', 'RouteOfAdmissions'];
        this.newDictionary['0x0038']['0x001A'] = ['DA', '1', 'ScheduledAdmissionDate'];
        this.newDictionary['0x0038']['0x001B'] = ['TM', '1', 'ScheduledAdmissionTime'];
        this.newDictionary['0x0038']['0x001C'] = ['DA', '1', 'ScheduledDischargeDate'];
        this.newDictionary['0x0038']['0x001D'] = ['TM', '1', 'ScheduledDischargeTime'];
        this.newDictionary['0x0038']['0x001E'] = ['LO', '1', 'ScheduledPatientInstitutionResidence'];
        this.newDictionary['0x0038']['0x0020'] = ['DA', '1', 'AdmittingDate'];
        this.newDictionary['0x0038']['0x0021'] = ['TM', '1', 'AdmittingTime'];
        this.newDictionary['0x0038']['0x0030'] = ['DA', '1', 'DischargeDate'];
        this.newDictionary['0x0038']['0x0032'] = ['TM', '1', 'DischargeTime'];
        this.newDictionary['0x0038']['0x0040'] = ['LO', '1', 'DischargeDiagnosisDescription'];
        this.newDictionary['0x0038']['0x0044'] = ['SQ', '1', 'DischargeDiagnosisCodeSequence'];
        this.newDictionary['0x0038']['0x0050'] = ['LO', '1', 'SpecialNeeds'];
        this.newDictionary['0x0038']['0x0300'] = ['LO', '1', 'CurrentPatientLocation'];
        this.newDictionary['0x0038']['0x0400'] = ['LO', '1', 'PatientInstitutionResidence'];
        this.newDictionary['0x0038']['0x0500'] = ['LO', '1', 'PatientState'];
        this.newDictionary['0x0038']['0x4000'] = ['LT', '1', 'VisitComments'];

        // 0x003A
        this.newDictionary['0x003A'] = [];
        this.newDictionary['0x003A']['0x0004'] = ['CS', '1', 'WaveformOriginality'];
        this.newDictionary['0x003A']['0x0005'] = ['US', '1', 'NumberofChannels'];
        this.newDictionary['0x003A']['0x0010'] = ['UL', '1', 'NumberofSamples'];
        this.newDictionary['0x003A']['0x001A'] = ['DS', '1', 'SamplingFrequency'];
        this.newDictionary['0x003A']['0x0020'] = ['SH', '1', 'MultiplexGroupLabel'];
        this.newDictionary['0x003A']['0x0200'] = ['SQ', '1', 'ChannelDefinitionSequence'];
        this.newDictionary['0x003A']['0x0202'] = ['IS', '1', 'WVChannelNumber'];
        this.newDictionary['0x003A']['0x0203'] = ['SH', '1', 'ChannelLabel'];
        this.newDictionary['0x003A']['0x0205'] = ['CS', '1-n', 'ChannelStatus'];
        this.newDictionary['0x003A']['0x0208'] = ['SQ', '1', 'ChannelSourceSequence'];
        this.newDictionary['0x003A']['0x0209'] = ['SQ', '1', 'ChannelSourceModifiersSequence'];
        this.newDictionary['0x003A']['0x020A'] = ['SQ', '1', 'SourceWaveformSequence'];
        this.newDictionary['0x003A']['0x020C'] = ['LO', '1', 'ChannelDerivationDescription'];
        this.newDictionary['0x003A']['0x0210'] = ['DS', '1', 'ChannelSensitivity'];
        this.newDictionary['0x003A']['0x0211'] = ['SQ', '1', 'ChannelSensitivityUnits'];
        this.newDictionary['0x003A']['0x0212'] = ['DS', '1', 'ChannelSensitivityCorrectionFactor'];
        this.newDictionary['0x003A']['0x0213'] = ['DS', '1', 'ChannelBaseline'];
        this.newDictionary['0x003A']['0x0214'] = ['DS', '1', 'ChannelTimeSkew'];
        this.newDictionary['0x003A']['0x0215'] = ['DS', '1', 'ChannelSampleSkew'];
        this.newDictionary['0x003A']['0x0218'] = ['DS', '1', 'ChannelOffset'];
        this.newDictionary['0x003A']['0x021A'] = ['US', '1', 'WaveformBitsStored'];
        this.newDictionary['0x003A']['0x0220'] = ['DS', '1', 'FilterLowFrequency'];
        this.newDictionary['0x003A']['0x0221'] = ['DS', '1', 'FilterHighFrequency'];
        this.newDictionary['0x003A']['0x0222'] = ['DS', '1', 'NotchFilterFrequency'];
        this.newDictionary['0x003A']['0x0223'] = ['DS', '1', 'NotchFilterBandwidth'];

        // 0x0040
        this.newDictionary['0x0040'] = [];
        this.newDictionary['0x0040']['0x0000'] = ['UL', '1', 'ModalityWorklistGroupLength'];
        this.newDictionary['0x0040']['0x0001'] = ['AE', '1', 'ScheduledStationAETitle'];
        this.newDictionary['0x0040']['0x0002'] = ['DA', '1', 'ScheduledProcedureStepStartDate'];
        this.newDictionary['0x0040']['0x0003'] = ['TM', '1', 'ScheduledProcedureStepStartTime'];
        this.newDictionary['0x0040']['0x0004'] = ['DA', '1', 'ScheduledProcedureStepEndDate'];
        this.newDictionary['0x0040']['0x0005'] = ['TM', '1', 'ScheduledProcedureStepEndTime'];
        this.newDictionary['0x0040']['0x0006'] = ['PN', '1', 'ScheduledPerformingPhysicianName'];
        this.newDictionary['0x0040']['0x0007'] = ['LO', '1', 'ScheduledProcedureStepDescription'];
        this.newDictionary['0x0040']['0x0008'] = ['SQ', '1', 'ScheduledProcedureStepCodeSequence'];
        this.newDictionary['0x0040']['0x0009'] = ['SH', '1', 'ScheduledProcedureStepID'];
        this.newDictionary['0x0040']['0x0010'] = ['SH', '1', 'ScheduledStationName'];
        this.newDictionary['0x0040']['0x0011'] = ['SH', '1', 'ScheduledProcedureStepLocation'];
        this.newDictionary['0x0040']['0x0012'] = ['LO', '1', 'ScheduledPreOrderOfMedication'];
        this.newDictionary['0x0040']['0x0020'] = ['CS', '1', 'ScheduledProcedureStepStatus'];
        this.newDictionary['0x0040']['0x0100'] = ['SQ', '1-n', 'ScheduledProcedureStepSequence'];
        this.newDictionary['0x0040']['0x0220'] = ['SQ', '1', 'ReferencedStandaloneSOPInstanceSequence'];
        this.newDictionary['0x0040']['0x0241'] = ['AE', '1', 'PerformedStationAETitle'];
        this.newDictionary['0x0040']['0x0242'] = ['SH', '1', 'PerformedStationName'];
        this.newDictionary['0x0040']['0x0243'] = ['SH', '1', 'PerformedLocation'];
        this.newDictionary['0x0040']['0x0244'] = ['DA', '1', 'PerformedProcedureStepStartDate'];
        this.newDictionary['0x0040']['0x0245'] = ['TM', '1', 'PerformedProcedureStepStartTime'];
        this.newDictionary['0x0040']['0x0250'] = ['DA', '1', 'PerformedProcedureStepEndDate'];
        this.newDictionary['0x0040']['0x0251'] = ['TM', '1', 'PerformedProcedureStepEndTime'];
        this.newDictionary['0x0040']['0x0252'] = ['CS', '1', 'PerformedProcedureStepStatus'];
        this.newDictionary['0x0040']['0x0253'] = ['CS', '1', 'PerformedProcedureStepID'];
        this.newDictionary['0x0040']['0x0254'] = ['LO', '1', 'PerformedProcedureStepDescription'];
        this.newDictionary['0x0040']['0x0255'] = ['LO', '1', 'PerformedProcedureTypeDescription'];
        this.newDictionary['0x0040']['0x0260'] = ['SQ', '1', 'PerformedActionItemSequence'];
        this.newDictionary['0x0040']['0x0270'] = ['SQ', '1', 'ScheduledStepAttributesSequence'];
        this.newDictionary['0x0040']['0x0275'] = ['SQ', '1', 'RequestAttributesSequence'];
        this.newDictionary['0x0040']['0x0280'] = ['ST', '1', 'CommentsOnThePerformedProcedureSteps'];
        this.newDictionary['0x0040']['0x0293'] = ['SQ', '1', 'QuantitySequence'];
        this.newDictionary['0x0040']['0x0294'] = ['DS', '1', 'Quantity'];
        this.newDictionary['0x0040']['0x0295'] = ['SQ', '1', 'MeasuringUnitsSequence'];
        this.newDictionary['0x0040']['0x0296'] = ['SQ', '1', 'BillingItemSequence'];
        this.newDictionary['0x0040']['0x0300'] = ['US', '1', 'TotalTimeOfFluoroscopy'];
        this.newDictionary['0x0040']['0x0301'] = ['US', '1', 'TotalNumberOfExposures'];
        this.newDictionary['0x0040']['0x0302'] = ['US', '1', 'EntranceDose'];
        this.newDictionary['0x0040']['0x0303'] = ['US', '1-2', 'ExposedArea'];
        this.newDictionary['0x0040']['0x0306'] = ['DS', '1', 'DistanceSourceToEntrance'];
        this.newDictionary['0x0040']['0x0307'] = ['DS', '1', 'DistanceSourceToSupport'];
        this.newDictionary['0x0040']['0x0310'] = ['ST', '1', 'CommentsOnRadiationDose'];
        this.newDictionary['0x0040']['0x0312'] = ['DS', '1', 'XRayOutput'];
        this.newDictionary['0x0040']['0x0314'] = ['DS', '1', 'HalfValueLayer'];
        this.newDictionary['0x0040']['0x0316'] = ['DS', '1', 'OrganDose'];
        this.newDictionary['0x0040']['0x0318'] = ['CS', '1', 'OrganExposed'];
        this.newDictionary['0x0040']['0x0320'] = ['SQ', '1', 'BillingProcedureStepSequence'];
        this.newDictionary['0x0040']['0x0321'] = ['SQ', '1', 'FilmConsumptionSequence'];
        this.newDictionary['0x0040']['0x0324'] = ['SQ', '1', 'BillingSuppliesAndDevicesSequence'];
        this.newDictionary['0x0040']['0x0330'] = ['SQ', '1', 'ReferencedProcedureStepSequence'];
        this.newDictionary['0x0040']['0x0340'] = ['SQ', '1', 'PerformedSeriesSequence'];
        this.newDictionary['0x0040']['0x0400'] = ['LT', '1', 'CommentsOnScheduledProcedureStep'];
        this.newDictionary['0x0040']['0x050A'] = ['LO', '1', 'SpecimenAccessionNumber'];
        this.newDictionary['0x0040']['0x0550'] = ['SQ', '1', 'SpecimenSequence'];
        this.newDictionary['0x0040']['0x0551'] = ['LO', '1', 'SpecimenIdentifier'];
        this.newDictionary['0x0040']['0x0555'] = ['SQ', '1', 'AcquisitionContextSequence'];
        this.newDictionary['0x0040']['0x0556'] = ['ST', '1', 'AcquisitionContextDescription'];
        this.newDictionary['0x0040']['0x059A'] = ['SQ', '1', 'SpecimenTypeCodeSequence'];
        this.newDictionary['0x0040']['0x06FA'] = ['LO', '1', 'SlideIdentifier'];
        this.newDictionary['0x0040']['0x071A'] = ['SQ', '1', 'ImageCenterPointCoordinatesSequence'];
        this.newDictionary['0x0040']['0x072A'] = ['DS', '1', 'XOffsetInSlideCoordinateSystem'];
        this.newDictionary['0x0040']['0x073A'] = ['DS', '1', 'YOffsetInSlideCoordinateSystem'];
        this.newDictionary['0x0040']['0x074A'] = ['DS', '1', 'ZOffsetInSlideCoordinateSystem'];
        this.newDictionary['0x0040']['0x08D8'] = ['SQ', '1', 'PixelSpacingSequence'];
        this.newDictionary['0x0040']['0x08DA'] = ['SQ', '1', 'CoordinateSystemAxisCodeSequence'];
        this.newDictionary['0x0040']['0x08EA'] = ['SQ', '1', 'MeasurementUnitsCodeSequence'];
        this.newDictionary['0x0040']['0x1001'] = ['SH', '1', 'RequestedProcedureID'];
        this.newDictionary['0x0040']['0x1002'] = ['LO', '1', 'ReasonForRequestedProcedure'];
        this.newDictionary['0x0040']['0x1003'] = ['SH', '1', 'RequestedProcedurePriority'];
        this.newDictionary['0x0040']['0x1004'] = ['LO', '1', 'PatientTransportArrangements'];
        this.newDictionary['0x0040']['0x1005'] = ['LO', '1', 'RequestedProcedureLocation'];
        this.newDictionary['0x0040']['0x1006'] = ['SH', '1', 'PlacerOrderNumberOfProcedure'];
        this.newDictionary['0x0040']['0x1007'] = ['SH', '1', 'FillerOrderNumberOfProcedure'];
        this.newDictionary['0x0040']['0x1008'] = ['LO', '1', 'ConfidentialityCode'];
        this.newDictionary['0x0040']['0x1009'] = ['SH', '1', 'ReportingPriority'];
        this.newDictionary['0x0040']['0x1010'] = ['PN', '1-n', 'NamesOfIntendedRecipientsOfResults'];
        this.newDictionary['0x0040']['0x1400'] = ['LT', '1', 'RequestedProcedureComments'];
        this.newDictionary['0x0040']['0x2001'] = ['LO', '1', 'ReasonForTheImagingServiceRequest'];
        this.newDictionary['0x0040']['0x2002'] = ['LO', '1', 'ImagingServiceRequestDescription'];
        this.newDictionary['0x0040']['0x2004'] = ['DA', '1', 'IssueDateOfImagingServiceRequest'];
        this.newDictionary['0x0040']['0x2005'] = ['TM', '1', 'IssueTimeOfImagingServiceRequest'];
        this.newDictionary['0x0040']['0x2006'] = ['SH', '1', 'PlacerOrderNumberOfImagingServiceRequest'];
        this.newDictionary['0x0040']['0x2007'] = ['SH', '0', 'FillerOrderNumberOfImagingServiceRequest'];
        this.newDictionary['0x0040']['0x2008'] = ['PN', '1', 'OrderEnteredBy'];
        this.newDictionary['0x0040']['0x2009'] = ['SH', '1', 'OrderEntererLocation'];
        this.newDictionary['0x0040']['0x2010'] = ['SH', '1', 'OrderCallbackPhoneNumber'];
        this.newDictionary['0x0040']['0x2016'] = ['LO', '1', 'PlacerOrderNumberImagingServiceRequest'];
        this.newDictionary['0x0040']['0x2017'] = ['LO', '1', 'FillerOrderNumberImagingServiceRequest'];
        this.newDictionary['0x0040']['0x2400'] = ['LT', '1', 'ImagingServiceRequestComments'];
        this.newDictionary['0x0040']['0x3001'] = ['LT', '1', 'ConfidentialityConstraint'];
        this.newDictionary['0x0040']['0xA010'] = ['CS', '1', 'RelationshipType'];
        this.newDictionary['0x0040']['0xA027'] = ['LO', '1', 'VerifyingOrganization'];
        this.newDictionary['0x0040']['0xA030'] = ['DT', '1', 'VerificationDateTime'];
        this.newDictionary['0x0040']['0xA032'] = ['DT', '1', 'ObservationDateTime'];
        this.newDictionary['0x0040']['0xA040'] = ['CS', '1', 'ValueType'];
        this.newDictionary['0x0040']['0xA043'] = ['SQ', '1', 'ConceptNameCodeSequence'];
        this.newDictionary['0x0040']['0xA050'] = ['CS', '1', 'ContinuityOfContent'];
        this.newDictionary['0x0040']['0xA073'] = ['SQ', '1', 'VerifyingObserverSequence'];
        this.newDictionary['0x0040']['0xA075'] = ['PN', '1', 'VerifyingObserverName'];
        this.newDictionary['0x0040']['0xA088'] = ['SQ', '1', 'VerifyingObserverIdentificationCodeSeque'];
        this.newDictionary['0x0040']['0xA0B0'] = ['US', '2-2n', 'ReferencedWaveformChannels'];
        this.newDictionary['0x0040']['0xA120'] = ['DT', '1', 'DateTime'];
        this.newDictionary['0x0040']['0xA121'] = ['DA', '1', 'Date'];
        this.newDictionary['0x0040']['0xA122'] = ['TM', '1', 'Time'];
        this.newDictionary['0x0040']['0xA123'] = ['PN', '1', 'PersonName'];
        this.newDictionary['0x0040']['0xA124'] = ['UI', '1', 'UID'];
        this.newDictionary['0x0040']['0xA130'] = ['CS', '1', 'TemporalRangeType'];
        this.newDictionary['0x0040']['0xA132'] = ['UL', '1-n', 'ReferencedSamplePositionsU'];
        this.newDictionary['0x0040']['0xA136'] = ['US', '1-n', 'ReferencedFrameNumbers'];
        this.newDictionary['0x0040']['0xA138'] = ['DS', '1-n', 'ReferencedTimeOffsets'];
        this.newDictionary['0x0040']['0xA13A'] = ['DT', '1-n', 'ReferencedDatetime'];
        this.newDictionary['0x0040']['0xA160'] = ['UT', '1', 'TextValue'];
        this.newDictionary['0x0040']['0xA168'] = ['SQ', '1', 'ConceptCodeSequence'];
        this.newDictionary['0x0040']['0xA180'] = ['US', '1', 'AnnotationGroupNumber'];
        this.newDictionary['0x0040']['0xA195'] = ['SQ', '1', 'ConceptNameCodeSequenceModifier'];
        this.newDictionary['0x0040']['0xA300'] = ['SQ', '1', 'MeasuredValueSequence'];
        this.newDictionary['0x0040']['0xA30A'] = ['DS', '1-n', 'NumericValue'];
        this.newDictionary['0x0040']['0xA360'] = ['SQ', '1', 'PredecessorDocumentsSequence'];
        this.newDictionary['0x0040']['0xA370'] = ['SQ', '1', 'ReferencedRequestSequence'];
        this.newDictionary['0x0040']['0xA372'] = ['SQ', '1', 'PerformedProcedureCodeSequence'];
        this.newDictionary['0x0040']['0xA375'] = ['SQ', '1', 'CurrentRequestedProcedureEvidenceSequenSequence'];
        this.newDictionary['0x0040']['0xA385'] = ['SQ', '1', 'PertinentOtherEvidenceSequence'];
        this.newDictionary['0x0040']['0xA491'] = ['CS', '1', 'CompletionFlag'];
        this.newDictionary['0x0040']['0xA492'] = ['LO', '1', 'CompletionFlagDescription'];
        this.newDictionary['0x0040']['0xA493'] = ['CS', '1', 'VerificationFlag'];
        this.newDictionary['0x0040']['0xA504'] = ['SQ', '1', 'ContentTemplateSequence'];
        this.newDictionary['0x0040']['0xA525'] = ['SQ', '1', 'IdenticalDocumentsSequence'];
        this.newDictionary['0x0040']['0xA730'] = ['SQ', '1', 'ContentSequence'];
        this.newDictionary['0x0040']['0xB020'] = ['SQ', '1', 'AnnotationSequence'];
        this.newDictionary['0x0040']['0xDB00'] = ['CS', '1', 'TemplateIdentifier'];
        this.newDictionary['0x0040']['0xDB06'] = ['DT', '1', 'TemplateVersion'];
        this.newDictionary['0x0040']['0xDB07'] = ['DT', '1', 'TemplateLocalVersion'];
        this.newDictionary['0x0040']['0xDB0B'] = ['CS', '1', 'TemplateExtensionFlag'];
        this.newDictionary['0x0040']['0xDB0C'] = ['UI', '1', 'TemplateExtensionOrganizationUID'];
        this.newDictionary['0x0040']['0xDB0D'] = ['UI', '1', 'TemplateExtensionCreatorUID'];
        this.newDictionary['0x0040']['0xDB73'] = ['UL', '1-n', 'ReferencedContentItemIdentifier'];

        // 0x0050
        this.newDictionary['0x0050'] = [];
        this.newDictionary['0x0050']['0x0000'] = ['UL', '1', 'XRayAngioDeviceGroupLength'];
        this.newDictionary['0x0050']['0x0004'] = ['CS', '1', 'CalibrationObject'];
        this.newDictionary['0x0050']['0x0010'] = ['SQ', '1', 'DeviceSequence'];
        this.newDictionary['0x0050']['0x0012'] = ['CS', '1', 'DeviceType'];
        this.newDictionary['0x0050']['0x0014'] = ['DS', '1', 'DeviceLength'];
        this.newDictionary['0x0050']['0x0016'] = ['DS', '1', 'DeviceDiameter'];
        this.newDictionary['0x0050']['0x0017'] = ['CS', '1', 'DeviceDiameterUnits'];
        this.newDictionary['0x0050']['0x0018'] = ['DS', '1', 'DeviceVolume'];
        this.newDictionary['0x0050']['0x0019'] = ['DS', '1', 'InterMarkerDistance'];
        this.newDictionary['0x0050']['0x0020'] = ['LO', '1', 'DeviceDescription'];
        this.newDictionary['0x0050']['0x0030'] = ['SQ', '1', 'CodedInterventionalDeviceSequence'];

        // 0x0054
        this.newDictionary['0x0054'] = [];
        this.newDictionary['0x0054']['0x0000'] = ['UL', '1', 'NuclearMedicineGroupLength'];
        this.newDictionary['0x0054']['0x0010'] = ['US', '1-n', 'EnergyWindowVector'];
        this.newDictionary['0x0054']['0x0011'] = ['US', '1', 'NumberOfEnergyWindows'];
        this.newDictionary['0x0054']['0x0012'] = ['SQ', '1', 'EnergyWindowInformationSequence'];
        this.newDictionary['0x0054']['0x0013'] = ['SQ', '1', 'EnergyWindowRangeSequence'];
        this.newDictionary['0x0054']['0x0014'] = ['DS', '1', 'EnergyWindowLowerLimit'];
        this.newDictionary['0x0054']['0x0015'] = ['DS', '1', 'EnergyWindowUpperLimit'];
        this.newDictionary['0x0054']['0x0016'] = ['SQ', '1', 'RadiopharmaceuticalInformationSequence'];
        this.newDictionary['0x0054']['0x0017'] = ['IS', '1', 'ResidualSyringeCounts'];
        this.newDictionary['0x0054']['0x0018'] = ['SH', '1', 'EnergyWindowName'];
        this.newDictionary['0x0054']['0x0020'] = ['US', '1-n', 'DetectorVector'];
        this.newDictionary['0x0054']['0x0021'] = ['US', '1', 'NumberOfDetectors'];
        this.newDictionary['0x0054']['0x0022'] = ['SQ', '1', 'DetectorInformationSequence'];
        this.newDictionary['0x0054']['0x0030'] = ['US', '1-n', 'PhaseVector'];
        this.newDictionary['0x0054']['0x0031'] = ['US', '1', 'NumberOfPhases'];
        this.newDictionary['0x0054']['0x0032'] = ['SQ', '1', 'PhaseInformationSequence'];
        this.newDictionary['0x0054']['0x0033'] = ['US', '1', 'NumberOfFramesInPhase'];
        this.newDictionary['0x0054']['0x0036'] = ['IS', '1', 'PhaseDelay'];
        this.newDictionary['0x0054']['0x0038'] = ['IS', '1', 'PauseBetweenFrames'];
        this.newDictionary['0x0054']['0x0050'] = ['US', '1-n', 'RotationVector'];
        this.newDictionary['0x0054']['0x0051'] = ['US', '1', 'NumberOfRotations'];
        this.newDictionary['0x0054']['0x0052'] = ['SQ', '1', 'RotationInformationSequence'];
        this.newDictionary['0x0054']['0x0053'] = ['US', '1', 'NumberOfFramesInRotation'];
        this.newDictionary['0x0054']['0x0060'] = ['US', '1-n', 'RRIntervalVector'];
        this.newDictionary['0x0054']['0x0061'] = ['US', '1', 'NumberOfRRIntervals'];
        this.newDictionary['0x0054']['0x0062'] = ['SQ', '1', 'GatedInformationSequence'];
        this.newDictionary['0x0054']['0x0063'] = ['SQ', '1', 'DataInformationSequence'];
        this.newDictionary['0x0054']['0x0070'] = ['US', '1-n', 'TimeSlotVector'];
        this.newDictionary['0x0054']['0x0071'] = ['US', '1', 'NumberOfTimeSlots'];
        this.newDictionary['0x0054']['0x0072'] = ['SQ', '1', 'TimeSlotInformationSequence'];
        this.newDictionary['0x0054']['0x0073'] = ['DS', '1', 'TimeSlotTime'];
        this.newDictionary['0x0054']['0x0080'] = ['US', '1-n', 'SliceVector'];
        this.newDictionary['0x0054']['0x0081'] = ['US', '1', 'NumberOfSlices'];
        this.newDictionary['0x0054']['0x0090'] = ['US', '1-n', 'AngularViewVector'];
        this.newDictionary['0x0054']['0x0100'] = ['US', '1-n', 'TimeSliceVector'];
        this.newDictionary['0x0054']['0x0101'] = ['US', '1', 'NumberOfTimeSlices'];
        this.newDictionary['0x0054']['0x0200'] = ['DS', '1', 'StartAngle'];
        this.newDictionary['0x0054']['0x0202'] = ['CS', '1', 'TypeOfDetectorMotion'];
        this.newDictionary['0x0054']['0x0210'] = ['IS', '1-n', 'TriggerVector'];
        this.newDictionary['0x0054']['0x0211'] = ['US', '1', 'NumberOfTriggersInPhase'];
        this.newDictionary['0x0054']['0x0220'] = ['SQ', '1', 'ViewCodeSequence'];
        this.newDictionary['0x0054']['0x0222'] = ['SQ', '1', 'ViewAngulationModifierCodeSequence'];
        this.newDictionary['0x0054']['0x0300'] = ['SQ', '1', 'RadionuclideCodeSequence'];
        this.newDictionary['0x0054']['0x0302'] = ['SQ', '1', 'AdministrationRouteCodeSequence'];
        this.newDictionary['0x0054']['0x0304'] = ['SQ', '1', 'RadiopharmaceuticalCodeSequence'];
        this.newDictionary['0x0054']['0x0306'] = ['SQ', '1', 'CalibrationDataSequence'];
        this.newDictionary['0x0054']['0x0308'] = ['US', '1', 'EnergyWindowNumber'];
        this.newDictionary['0x0054']['0x0400'] = ['SH', '1', 'ImageID'];
        this.newDictionary['0x0054']['0x0410'] = ['SQ', '1', 'PatientOrientationCodeSequence'];
        this.newDictionary['0x0054']['0x0412'] = ['SQ', '1', 'PatientOrientationModifierCodeSequence'];
        this.newDictionary['0x0054']['0x0414'] = ['SQ', '1', 'PatientGantryRelationshipCodeSequence'];
        this.newDictionary['0x0054']['0x1000'] = ['CS', '2', 'SeriesType'];
        this.newDictionary['0x0054']['0x1001'] = ['CS', '1', 'Units'];
        this.newDictionary['0x0054']['0x1002'] = ['CS', '1', 'CountsSource'];
        this.newDictionary['0x0054']['0x1004'] = ['CS', '1', 'ReprojectionMethod'];
        this.newDictionary['0x0054']['0x1100'] = ['CS', '1', 'RandomsCorrectionMethod'];
        this.newDictionary['0x0054']['0x1101'] = ['LO', '1', 'AttenuationCorrectionMethod'];
        this.newDictionary['0x0054']['0x1102'] = ['CS', '1', 'DecayCorrection'];
        this.newDictionary['0x0054']['0x1103'] = ['LO', '1', 'ReconstructionMethod'];
        this.newDictionary['0x0054']['0x1104'] = ['LO', '1', 'DetectorLinesOfResponseUsed'];
        this.newDictionary['0x0054']['0x1105'] = ['LO', '1', 'ScatterCorrectionMethod'];
        this.newDictionary['0x0054']['0x1200'] = ['DS', '1', 'AxialAcceptance'];
        this.newDictionary['0x0054']['0x1201'] = ['IS', '2', 'AxialMash'];
        this.newDictionary['0x0054']['0x1202'] = ['IS', '1', 'TransverseMash'];
        this.newDictionary['0x0054']['0x1203'] = ['DS', '2', 'DetectorElementSize'];
        this.newDictionary['0x0054']['0x1210'] = ['DS', '1', 'CoincidenceWindowWidth'];
        this.newDictionary['0x0054']['0x1220'] = ['CS', '1-n', 'SecondaryCountsType'];
        this.newDictionary['0x0054']['0x1300'] = ['DS', '1', 'FrameReferenceTime'];
        this.newDictionary['0x0054']['0x1310'] = ['IS', '1', 'PrimaryPromptsCountsAccumulated'];
        this.newDictionary['0x0054']['0x1311'] = ['IS', '1-n', 'SecondaryCountsAccumulated'];
        this.newDictionary['0x0054']['0x1320'] = ['DS', '1', 'SliceSensitivityFactor'];
        this.newDictionary['0x0054']['0x1321'] = ['DS', '1', 'DecayFactor'];
        this.newDictionary['0x0054']['0x1322'] = ['DS', '1', 'DoseCalibrationFactor'];
        this.newDictionary['0x0054']['0x1323'] = ['DS', '1', 'ScatterFractionFactor'];
        this.newDictionary['0x0054']['0x1324'] = ['DS', '1', 'DeadTimeFactor'];
        this.newDictionary['0x0054']['0x1330'] = ['US', '1', 'ImageIndex'];
        this.newDictionary['0x0054']['0x1400'] = ['CS', '1-n', 'CountsIncluded'];
        this.newDictionary['0x0054']['0x1401'] = ['CS', '1', 'DeadTimeCorrectionFlag'];

        // 0x0060
        this.newDictionary['0x0060'] = [];
        this.newDictionary['0x0060']['0x0000'] = ['UL', '1', 'HistogramGroupLength'];
        this.newDictionary['0x0060']['0x3000'] = ['SQ', '1', 'HistogramSequence'];
        this.newDictionary['0x0060']['0x3002'] = ['US', '1', 'HistogramNumberofBins'];
        this.newDictionary['0x0060']['0x3004'] = ['US/SS', '1', 'HistogramFirstBinValue'];
        this.newDictionary['0x0060']['0x3006'] = ['US/SS', '1', 'HistogramLastBinValue'];
        this.newDictionary['0x0060']['0x3008'] = ['US', '1', 'HistogramBinWidth'];
        this.newDictionary['0x0060']['0x3010'] = ['LO', '1', 'HistogramExplanation'];
        this.newDictionary['0x0060']['0x3020'] = ['UL', '1-n', 'HistogramData'];

        // 0x0070
        this.newDictionary['0x0070'] = [];
        this.newDictionary['0x0070']['0x0001'] = ['SQ', '1', 'GraphicAnnotationSequence'];
        this.newDictionary['0x0070']['0x0002'] = ['CS', '1', 'GraphicLayer'];
        this.newDictionary['0x0070']['0x0003'] = ['CS', '1', 'BoundingBoxAnnotationUnits'];
        this.newDictionary['0x0070']['0x0004'] = ['CS', '1', 'AnchorPointAnnotationUnits'];
        this.newDictionary['0x0070']['0x0005'] = ['CS', '1', 'GraphicAnnotationUnits'];
        this.newDictionary['0x0070']['0x0006'] = ['ST', '1', 'UnformattedTextValue'];
        this.newDictionary['0x0070']['0x0008'] = ['SQ', '1', 'TextObjectSequence'];
        this.newDictionary['0x0070']['0x0009'] = ['SQ', '1', 'GraphicObjectSequence'];
        this.newDictionary['0x0070']['0x0010'] = ['FL', '2', 'BoundingBoxTopLeftHandCorner'];
        this.newDictionary['0x0070']['0x0011'] = ['FL', '2', 'BoundingBoxBottomRightHandCorner'];
        this.newDictionary['0x0070']['0x0012'] = ['CS', '1', 'BoundingBoxTextHorizontalJustification'];
        this.newDictionary['0x0070']['0x0014'] = ['FL', '2', 'AnchorPoint'];
        this.newDictionary['0x0070']['0x0015'] = ['CS', '1', 'AnchorPointVisibility'];
        this.newDictionary['0x0070']['0x0020'] = ['US', '1', 'GraphicDimensions'];
        this.newDictionary['0x0070']['0x0021'] = ['US', '1', 'NumberOfGraphicPoints'];
        this.newDictionary['0x0070']['0x0022'] = ['FL', '2-n', 'GraphicData'];
        this.newDictionary['0x0070']['0x0023'] = ['CS', '1', 'GraphicType'];
        this.newDictionary['0x0070']['0x0024'] = ['CS', '1', 'GraphicFilled'];
        this.newDictionary['0x0070']['0x0040'] = ['IS', '1', 'ImageRotationFrozenDraftRetired'];
        this.newDictionary['0x0070']['0x0041'] = ['CS', '1', 'ImageHorizontalFlip'];
        this.newDictionary['0x0070']['0x0042'] = ['US', '1', 'ImageRotation'];
        this.newDictionary['0x0070']['0x0050'] = ['US', '2', 'DisplayedAreaTLHCFrozenDraftRetired'];
        this.newDictionary['0x0070']['0x0051'] = ['US', '2', 'DisplayedAreaBRHCFrozenDraftRetired'];
        this.newDictionary['0x0070']['0x0052'] = ['SL', '2', 'DisplayedAreaTopLeftHandCorner'];
        this.newDictionary['0x0070']['0x0053'] = ['SL', '2', 'DisplayedAreaBottomRightHandCorner'];
        this.newDictionary['0x0070']['0x005A'] = ['SQ', '1', 'DisplayedAreaSelectionSequence'];
        this.newDictionary['0x0070']['0x0060'] = ['SQ', '1', 'GraphicLayerSequence'];
        this.newDictionary['0x0070']['0x0062'] = ['IS', '1', 'GraphicLayerOrder'];
        this.newDictionary['0x0070']['0x0066'] = ['US', '1', 'GraphicLayerRecommendedDisplayGrayscaleValue'];
        this.newDictionary['0x0070']['0x0067'] = ['US', '3', 'GraphicLayerRecommendedDisplayRGBValue'];
        this.newDictionary['0x0070']['0x0068'] = ['LO', '1', 'GraphicLayerDescription'];
        this.newDictionary['0x0070']['0x0080'] = ['CS', '1', 'PresentationLabel'];
        this.newDictionary['0x0070']['0x0081'] = ['LO', '1', 'PresentationDescription'];
        this.newDictionary['0x0070']['0x0082'] = ['DA', '1', 'PresentationCreationDate'];
        this.newDictionary['0x0070']['0x0083'] = ['TM', '1', 'PresentationCreationTime'];
        this.newDictionary['0x0070']['0x0084'] = ['PN', '1', 'PresentationCreatorsName'];
        this.newDictionary['0x0070']['0x0100'] = ['CS', '1', 'PresentationSizeMode'];
        this.newDictionary['0x0070']['0x0101'] = ['DS', '2', 'PresentationPixelSpacing'];
        this.newDictionary['0x0070']['0x0102'] = ['IS', '2', 'PresentationPixelAspectRatio'];
        this.newDictionary['0x0070']['0x0103'] = ['FL', '1', 'PresentationPixelMagnificationRatio'];

        // 0x0088
        this.newDictionary['0x0088'] = [];
        this.newDictionary['0x0088']['0x0000'] = ['UL', '1', 'StorageGroupLength'];
        this.newDictionary['0x0088']['0x0130'] = ['SH', '1', 'StorageMediaFilesetID'];
        this.newDictionary['0x0088']['0x0140'] = ['UI', '1', 'StorageMediaFilesetUID'];
        this.newDictionary['0x0088']['0x0200'] = ['SQ', '1', 'IconImage'];
        this.newDictionary['0x0088']['0x0904'] = ['LO', '1', 'TopicTitle'];
        this.newDictionary['0x0088']['0x0906'] = ['ST', '1', 'TopicSubject'];
        this.newDictionary['0x0088']['0x0910'] = ['LO', '1', 'TopicAuthor'];
        this.newDictionary['0x0088']['0x0912'] = ['LO', '3', 'TopicKeyWords'];

        // 0x1000
        this.newDictionary['0x1000'] = [];
        this.newDictionary['0x1000']['0x0000'] = ['UL', '1', 'CodeTableGroupLength'];
        this.newDictionary['0x1000']['0x0010'] = ['US', '3', 'EscapeTriplet'];
        this.newDictionary['0x1000']['0x0011'] = ['US', '3', 'RunLengthTriplet'];
        this.newDictionary['0x1000']['0x0012'] = ['US', '1', 'HuffmanTableSize'];
        this.newDictionary['0x1000']['0x0013'] = ['US', '3', 'HuffmanTableTriplet'];
        this.newDictionary['0x1000']['0x0014'] = ['US', '1', 'ShiftTableSize'];
        this.newDictionary['0x1000']['0x0015'] = ['US', '3', 'ShiftTableTriplet'];

        // 0x1010
        this.newDictionary['0x1010'] = [];
        this.newDictionary['0x1010']['0x0000'] = ['UL', '1', 'ZonalMapGroupLength'];
        this.newDictionary['0x1010']['0x0004'] = ['US', '1-n', 'ZonalMap'];

        // 0x2000
        this.newDictionary['0x2000'] = [];
        this.newDictionary['0x2000']['0x0000'] = ['UL', '1', 'FilmSessionGroupLength'];
        this.newDictionary['0x2000']['0x0010'] = ['IS', '1', 'NumberOfCopies'];
        this.newDictionary['0x2000']['0x001E'] = ['SQ', '1', 'PrinterConfigurationSequence'];
        this.newDictionary['0x2000']['0x0020'] = ['CS', '1', 'PrintPriority'];
        this.newDictionary['0x2000']['0x0030'] = ['CS', '1', 'MediumType'];
        this.newDictionary['0x2000']['0x0040'] = ['CS', '1', 'FilmDestination'];
        this.newDictionary['0x2000']['0x0050'] = ['LO', '1', 'FilmSessionLabel'];
        this.newDictionary['0x2000']['0x0060'] = ['IS', '1', 'MemoryAllocation'];
        this.newDictionary['0x2000']['0x0061'] = ['IS', '1', 'MaximumMemoryAllocation'];
        this.newDictionary['0x2000']['0x0062'] = ['CS', '1', 'ColorImagePrintingFlag'];
        this.newDictionary['0x2000']['0x0063'] = ['CS', '1', 'CollationFlag'];
        this.newDictionary['0x2000']['0x0065'] = ['CS', '1', 'AnnotationFlag'];
        this.newDictionary['0x2000']['0x0067'] = ['CS', '1', 'ImageOverlayFlag'];
        this.newDictionary['0x2000']['0x0069'] = ['CS', '1', 'PresentationLUTFlag'];
        this.newDictionary['0x2000']['0x006A'] = ['CS', '1', 'ImageBoxPresentationLUTFlag'];
        this.newDictionary['0x2000']['0x00A0'] = ['US', '1', 'MemoryBitDepth'];
        this.newDictionary['0x2000']['0x00A1'] = ['US', '1', 'PrintingBitDepth'];
        this.newDictionary['0x2000']['0x00A2'] = ['SQ', '1', 'MediaInstalledSequence'];
        this.newDictionary['0x2000']['0x00A4'] = ['SQ', '1', 'OtherMediaAvailableSequence'];
        this.newDictionary['0x2000']['0x00A8'] = ['SQ', '1', 'SupportedImageDisplayFormatsSequence'];
        this.newDictionary['0x2000']['0x0500'] = ['SQ', '1', 'ReferencedFilmBoxSequence'];
        this.newDictionary['0x2000']['0x0510'] = ['SQ', '1', 'ReferencedStoredPrintSequence'];

        // 0x2010
        this.newDictionary['0x2010'] = [];
        this.newDictionary['0x2010']['0x0000'] = ['UL', '1', 'FilmBoxGroupLength'];
        this.newDictionary['0x2010']['0x0010'] = ['ST', '1', 'ImageDisplayFormat'];
        this.newDictionary['0x2010']['0x0030'] = ['CS', '1', 'AnnotationDisplayFormatID'];
        this.newDictionary['0x2010']['0x0040'] = ['CS', '1', 'FilmOrientation'];
        this.newDictionary['0x2010']['0x0050'] = ['CS', '1', 'FilmSizeID'];
        this.newDictionary['0x2010']['0x0052'] = ['CS', '1', 'PrinterResolutionID'];
        this.newDictionary['0x2010']['0x0054'] = ['CS', '1', 'DefaultPrinterResolutionID'];
        this.newDictionary['0x2010']['0x0060'] = ['CS', '1', 'MagnificationType'];
        this.newDictionary['0x2010']['0x0080'] = ['CS', '1', 'SmoothingType'];
        this.newDictionary['0x2010']['0x00A6'] = ['CS', '1', 'DefaultMagnificationType'];
        this.newDictionary['0x2010']['0x00A7'] = ['CS', '1-n', 'OtherMagnificationTypesAvailable'];
        this.newDictionary['0x2010']['0x00A8'] = ['CS', '1', 'DefaultSmoothingType'];
        this.newDictionary['0x2010']['0x00A9'] = ['CS', '1-n', 'OtherSmoothingTypesAvailable'];
        this.newDictionary['0x2010']['0x0100'] = ['CS', '1', 'BorderDensity'];
        this.newDictionary['0x2010']['0x0110'] = ['CS', '1', 'EmptyImageDensity'];
        this.newDictionary['0x2010']['0x0120'] = ['US', '1', 'MinDensity'];
        this.newDictionary['0x2010']['0x0130'] = ['US', '1', 'MaxDensity'];
        this.newDictionary['0x2010']['0x0140'] = ['CS', '1', 'Trim'];
        this.newDictionary['0x2010']['0x0150'] = ['ST', '1', 'ConfigurationInformation'];
        this.newDictionary['0x2010']['0x0152'] = ['LT', '1', 'ConfigurationInformationDescription'];
        this.newDictionary['0x2010']['0x0154'] = ['IS', '1', 'MaximumCollatedFilms'];
        this.newDictionary['0x2010']['0x015E'] = ['US', '1', 'Illumination'];
        this.newDictionary['0x2010']['0x0160'] = ['US', '1', 'ReflectedAmbientLight'];
        this.newDictionary['0x2010']['0x0376'] = ['DS', '2', 'PrinterPixelSpacing'];
        this.newDictionary['0x2010']['0x0500'] = ['SQ', '1', 'ReferencedFilmSessionSequence'];
        this.newDictionary['0x2010']['0x0510'] = ['SQ', '1', 'ReferencedImageBoxSequence'];
        this.newDictionary['0x2010']['0x0520'] = ['SQ', '1', 'ReferencedBasicAnnotationBoxSequence'];

        // 0x2020
        this.newDictionary['0x2020'] = [];
        this.newDictionary['0x2020']['0x0000'] = ['UL', '1', 'ImageBoxGroupLength'];
        this.newDictionary['0x2020']['0x0010'] = ['US', '1', 'ImageBoxPosition'];
        this.newDictionary['0x2020']['0x0020'] = ['CS', '1', 'Polarity'];
        this.newDictionary['0x2020']['0x0030'] = ['DS', '1', 'RequestedImageSize'];
        this.newDictionary['0x2020']['0x0040'] = ['CS', '1', 'RequestedDecimateCropBehavior'];
        this.newDictionary['0x2020']['0x0050'] = ['CS', '1', 'RequestedResolutionID'];
        this.newDictionary['0x2020']['0x00A0'] = ['CS', '1', 'RequestedImageSizeFlag'];
        this.newDictionary['0x2020']['0x00A2'] = ['CS', '1', 'DecimateCropResult'];
        this.newDictionary['0x2020']['0x0110'] = ['SQ', '1', 'PreformattedGrayscaleImageSequence'];
        this.newDictionary['0x2020']['0x0111'] = ['SQ', '1', 'PreformattedColorImageSequence'];
        this.newDictionary['0x2020']['0x0130'] = ['SQ', '1', 'ReferencedImageOverlayBoxSequence'];
        this.newDictionary['0x2020']['0x0140'] = ['SQ', '1', 'ReferencedVOILUTBoxSequence'];

        // 0x2030
        this.newDictionary['0x2030'] = [];
        this.newDictionary['0x2030']['0x0000'] = ['UL', '1', 'AnnotationGroupLength'];
        this.newDictionary['0x2030']['0x0010'] = ['US', '1', 'AnnotationPosition'];
        this.newDictionary['0x2030']['0x0020'] = ['LO', '1', 'TextString'];

        // 0x2040
        this.newDictionary['0x2040'] = [];
        this.newDictionary['0x2040']['0x0000'] = ['UL', '1', 'OverlayBoxGroupLength'];
        this.newDictionary['0x2040']['0x0010'] = ['SQ', '1', 'ReferencedOverlayPlaneSequence'];
        this.newDictionary['0x2040']['0x0011'] = ['US', '9', 'ReferencedOverlayPlaneGroups'];
        this.newDictionary['0x2040']['0x0020'] = ['SQ', '1', 'OverlayPixelDataSequence'];
        this.newDictionary['0x2040']['0x0060'] = ['CS', '1', 'OverlayMagnificationType'];
        this.newDictionary['0x2040']['0x0070'] = ['CS', '1', 'OverlaySmoothingType'];
        this.newDictionary['0x2040']['0x0072'] = ['CS', '1', 'OverlayOrImageMagnification'];
        this.newDictionary['0x2040']['0x0074'] = ['US', '1', 'MagnifyToNumberOfColumns'];
        this.newDictionary['0x2040']['0x0080'] = ['CS', '1', 'OverlayForegroundDensity'];
        this.newDictionary['0x2040']['0x0082'] = ['CS', '1', 'OverlayBackgroundDensity'];
        this.newDictionary['0x2040']['0x0090'] = ['CS', '1', 'OverlayMode'];
        this.newDictionary['0x2040']['0x0100'] = ['CS', '1', 'ThresholdDensity'];
        this.newDictionary['0x2040']['0x0500'] = ['SQ', '1', 'ReferencedOverlayImageBoxSequence'];

        // 0x2050
        this.newDictionary['0x2050'] = [];
        this.newDictionary['0x2050']['0x0000'] = ['UL', '1', 'PresentationLUTGroupLength'];
        this.newDictionary['0x2050']['0x0010'] = ['SQ', '1', 'PresentationLUTSequence'];
        this.newDictionary['0x2050']['0x0020'] = ['CS', '1', 'PresentationLUTShape'];
        this.newDictionary['0x2050']['0x0500'] = ['SQ', '1', 'ReferencedPresentationLUTSequence'];

        // 0x2100
        this.newDictionary['0x2100'] = [];
        this.newDictionary['0x2100']['0x0000'] = ['UL', '1', 'PrintJobGroupLength'];
        this.newDictionary['0x2100']['0x0010'] = ['SH', '1', 'PrintJobID'];
        this.newDictionary['0x2100']['0x0020'] = ['CS', '1', 'ExecutionStatus'];
        this.newDictionary['0x2100']['0x0030'] = ['CS', '1', 'ExecutionStatusInfo'];
        this.newDictionary['0x2100']['0x0040'] = ['DA', '1', 'CreationDate'];
        this.newDictionary['0x2100']['0x0050'] = ['TM', '1', 'CreationTime'];
        this.newDictionary['0x2100']['0x0070'] = ['AE', '1', 'Originator'];
        this.newDictionary['0x2100']['0x0140'] = ['AE', '1', 'DestinationAE'];
        this.newDictionary['0x2100']['0x0160'] = ['SH', '1', 'OwnerID'];
        this.newDictionary['0x2100']['0x0170'] = ['IS', '1', 'NumberOfFilms'];
        this.newDictionary['0x2100']['0x0500'] = ['SQ', '1', 'ReferencedPrintJobSequence'];

        // 0x2110
        this.newDictionary['0x2110'] = [];
        this.newDictionary['0x2110']['0x0000'] = ['UL', '1', 'PrinterGroupLength'];
        this.newDictionary['0x2110']['0x0010'] = ['CS', '1', 'PrinterStatus'];
        this.newDictionary['0x2110']['0x0020'] = ['CS', '1', 'PrinterStatusInfo'];
        this.newDictionary['0x2110']['0x0030'] = ['LO', '1', 'PrinterName'];
        this.newDictionary['0x2110']['0x0099'] = ['SH', '1', 'PrintQueueID'];

        // 0x2120
        this.newDictionary['0x2120'] = [];
        this.newDictionary['0x2120']['0x0000'] = ['UL', '1', 'QueueGroupLength'];
        this.newDictionary['0x2120']['0x0010'] = ['CS', '1', 'QueueStatus'];
        this.newDictionary['0x2120']['0x0050'] = ['SQ', '1', 'PrintJobDescriptionSequence'];
        this.newDictionary['0x2120']['0x0070'] = ['SQ', '1', 'QueueReferencedPrintJobSequence'];

        // 0x2130
        this.newDictionary['0x2130'] = [];
        this.newDictionary['0x2130']['0x0000'] = ['UL', '1', 'PrintContentGroupLength'];
        this.newDictionary['0x2130']['0x0010'] = ['SQ', '1', 'PrintManagementCapabilitiesSequence'];
        this.newDictionary['0x2130']['0x0015'] = ['SQ', '1', 'PrinterCharacteristicsSequence'];
        this.newDictionary['0x2130']['0x0030'] = ['SQ', '1', 'FilmBoxContentSequence'];
        this.newDictionary['0x2130']['0x0040'] = ['SQ', '1', 'ImageBoxContentSequence'];
        this.newDictionary['0x2130']['0x0050'] = ['SQ', '1', 'AnnotationContentSequence'];
        this.newDictionary['0x2130']['0x0060'] = ['SQ', '1', 'ImageOverlayBoxContentSequence'];
        this.newDictionary['0x2130']['0x0080'] = ['SQ', '1', 'PresentationLUTContentSequence'];
        this.newDictionary['0x2130']['0x00A0'] = ['SQ', '1', 'ProposedStudySequence'];
        this.newDictionary['0x2130']['0x00C0'] = ['SQ', '1', 'OriginalImageSequence'];

        // 0x3002
        this.newDictionary['0x3002'] = [];
        this.newDictionary['0x3002']['0x0000'] = ['UL', '1', 'RTImageGroupLength'];
        this.newDictionary['0x3002']['0x0002'] = ['SH', '1', 'RTImageLabel'];
        this.newDictionary['0x3002']['0x0003'] = ['LO', '1', 'RTImageName'];
        this.newDictionary['0x3002']['0x0004'] = ['ST', '1', 'RTImageDescription'];
        this.newDictionary['0x3002']['0x000A'] = ['CS', '1', 'ReportedValuesOrigin'];
        this.newDictionary['0x3002']['0x000C'] = ['CS', '1', 'RTImagePlane'];
        this.newDictionary['0x3002']['0x000D'] = ['DS', '3', 'XRayImageReceptorTranslation'];
        this.newDictionary['0x3002']['0x000E'] = ['DS', '1', 'XRayImageReceptorAngle'];
        this.newDictionary['0x3002']['0x0010'] = ['DS', '6', 'RTImageOrientation'];
        this.newDictionary['0x3002']['0x0011'] = ['DS', '2', 'ImagePlanePixelSpacing'];
        this.newDictionary['0x3002']['0x0012'] = ['DS', '2', 'RTImagePosition'];
        this.newDictionary['0x3002']['0x0020'] = ['SH', '1', 'RadiationMachineName'];
        this.newDictionary['0x3002']['0x0022'] = ['DS', '1', 'RadiationMachineSAD'];
        this.newDictionary['0x3002']['0x0024'] = ['DS', '1', 'RadiationMachineSSD'];
        this.newDictionary['0x3002']['0x0026'] = ['DS', '1', 'RTImageSID'];
        this.newDictionary['0x3002']['0x0028'] = ['DS', '1', 'SourceToReferenceObjectDistance'];
        this.newDictionary['0x3002']['0x0029'] = ['IS', '1', 'FractionNumber'];
        this.newDictionary['0x3002']['0x0030'] = ['SQ', '1', 'ExposureSequence'];
        this.newDictionary['0x3002']['0x0032'] = ['DS', '1', 'MetersetExposure'];
        this.newDictionary['0x3002']['0x0034'] = ['DS', '4', 'DiaphragmPosition'];

        // x3004
        this.newDictionary['0x3004'] = [];
        this.newDictionary['0x3004']['0x0000'] = ['UL', '1', 'RTDoseGroupLength'];
        this.newDictionary['0x3004']['0x0001'] = ['CS', '1', 'DVHType'];
        this.newDictionary['0x3004']['0x0002'] = ['CS', '1', 'DoseUnits'];
        this.newDictionary['0x3004']['0x0004'] = ['CS', '1', 'DoseType'];
        this.newDictionary['0x3004']['0x0006'] = ['LO', '1', 'DoseComment'];
        this.newDictionary['0x3004']['0x0008'] = ['DS', '3', 'NormalizationPoint'];
        this.newDictionary['0x3004']['0x000A'] = ['CS', '1', 'DoseSummationType'];
        this.newDictionary['0x3004']['0x000C'] = ['DS', '2-n', 'GridFrameOffsetVector'];
        this.newDictionary['0x3004']['0x000E'] = ['DS', '1', 'DoseGridScaling'];
        this.newDictionary['0x3004']['0x0010'] = ['SQ', '1', 'RTDoseROISequence'];
        this.newDictionary['0x3004']['0x0012'] = ['DS', '1', 'DoseValue'];
        this.newDictionary['0x3004']['0x0040'] = ['DS', '3', 'DVHNormalizationPoint'];
        this.newDictionary['0x3004']['0x0042'] = ['DS', '1', 'DVHNormalizationDoseValue'];
        this.newDictionary['0x3004']['0x0050'] = ['SQ', '1', 'DVHSequence'];
        this.newDictionary['0x3004']['0x0052'] = ['DS', '1', 'DVHDoseScaling'];
        this.newDictionary['0x3004']['0x0054'] = ['CS', '1', 'DVHVolumeUnits'];
        this.newDictionary['0x3004']['0x0056'] = ['IS', '1', 'DVHNumberOfBins'];
        this.newDictionary['0x3004']['0x0058'] = ['DS', '2-2n', 'DVHData'];
        this.newDictionary['0x3004']['0x0060'] = ['SQ', '1', 'DVHReferencedROISequence'];
        this.newDictionary['0x3004']['0x0062'] = ['CS', '1', 'DVHROIContributionType'];
        this.newDictionary['0x3004']['0x0070'] = ['DS', '1', 'DVHMinimumDose'];
        this.newDictionary['0x3004']['0x0072'] = ['DS', '1', 'DVHMaximumDose'];
        this.newDictionary['0x3004']['0x0074'] = ['DS', '1', 'DVHMeanDose'];

        // 0x3006
        this.newDictionary['0x3006'] = [];
        this.newDictionary['0x3006']['0x0000'] = ['UL', '1', 'RTStructureSetGroupLength'];
        this.newDictionary['0x3006']['0x0002'] = ['SH', '1', 'StructureSetLabel'];
        this.newDictionary['0x3006']['0x0004'] = ['LO', '1', 'StructureSetName'];
        this.newDictionary['0x3006']['0x0006'] = ['ST', '1', 'StructureSetDescription'];
        this.newDictionary['0x3006']['0x0008'] = ['DA', '1', 'StructureSetDate'];
        this.newDictionary['0x3006']['0x0009'] = ['TM', '1', 'StructureSetTime'];
        this.newDictionary['0x3006']['0x0010'] = ['SQ', '1', 'ReferencedFrameOfReferenceSequence'];
        this.newDictionary['0x3006']['0x0012'] = ['SQ', '1', 'RTReferencedStudySequence'];
        this.newDictionary['0x3006']['0x0014'] = ['SQ', '1', 'RTReferencedSeriesSequence'];
        this.newDictionary['0x3006']['0x0016'] = ['SQ', '1', 'ContourImageSequence'];
        this.newDictionary['0x3006']['0x0020'] = ['SQ', '1', 'StructureSetROISequence'];
        this.newDictionary['0x3006']['0x0022'] = ['IS', '1', 'ROINumber'];
        this.newDictionary['0x3006']['0x0024'] = ['UI', '1', 'ReferencedFrameOfReferenceUID'];
        this.newDictionary['0x3006']['0x0026'] = ['LO', '1', 'ROIName'];
        this.newDictionary['0x3006']['0x0028'] = ['ST', '1', 'ROIDescription'];
        this.newDictionary['0x3006']['0x002A'] = ['IS', '3', 'ROIDisplayColor'];
        this.newDictionary['0x3006']['0x002C'] = ['DS', '1', 'ROIVolume'];
        this.newDictionary['0x3006']['0x0030'] = ['SQ', '1', 'RTRelatedROISequence'];
        this.newDictionary['0x3006']['0x0033'] = ['CS', '1', 'RTROIRelationship'];
        this.newDictionary['0x3006']['0x0036'] = ['CS', '1', 'ROIGenerationAlgorithm'];
        this.newDictionary['0x3006']['0x0038'] = ['LO', '1', 'ROIGenerationDescription'];
        this.newDictionary['0x3006']['0x0039'] = ['SQ', '1', 'ROIContourSequence'];
        this.newDictionary['0x3006']['0x0040'] = ['SQ', '1', 'ContourSequence'];
        this.newDictionary['0x3006']['0x0042'] = ['CS', '1', 'ContourGeometricType'];
        this.newDictionary['0x3006']['0x0044'] = ['DS', '1', 'ContourSlabThickness'];
        this.newDictionary['0x3006']['0x0045'] = ['DS', '3', 'ContourOffsetVector'];
        this.newDictionary['0x3006']['0x0046'] = ['IS', '1', 'NumberOfContourPoints'];
        this.newDictionary['0x3006']['0x0048'] = ['IS', '1', 'ContourNumber'];
        this.newDictionary['0x3006']['0x0049'] = ['IS', '1-n', 'AttachedContours'];
        this.newDictionary['0x3006']['0x0050'] = ['DS', '3-3n', 'ContourData'];
        this.newDictionary['0x3006']['0x0080'] = ['SQ', '1', 'RTROIObservationsSequence'];
        this.newDictionary['0x3006']['0x0082'] = ['IS', '1', 'ObservationNumber'];
        this.newDictionary['0x3006']['0x0084'] = ['IS', '1', 'ReferencedROINumber'];
        this.newDictionary['0x3006']['0x0085'] = ['SH', '1', 'ROIObservationLabel'];
        this.newDictionary['0x3006']['0x0086'] = ['SQ', '1', 'RTROIIdentificationCodeSequence'];
        this.newDictionary['0x3006']['0x0088'] = ['ST', '1', 'ROIObservationDescription'];
        this.newDictionary['0x3006']['0x00A0'] = ['SQ', '1', 'RelatedRTROIObservationsSequence'];
        this.newDictionary['0x3006']['0x00A4'] = ['CS', '1', 'RTROIInterpretedType'];
        this.newDictionary['0x3006']['0x00A6'] = ['PN', '1', 'ROIInterpreter'];
        this.newDictionary['0x3006']['0x00B0'] = ['SQ', '1', 'ROIPhysicalPropertiesSequence'];
        this.newDictionary['0x3006']['0x00B2'] = ['CS', '1', 'ROIPhysicalProperty'];
        this.newDictionary['0x3006']['0x00B4'] = ['DS', '1', 'ROIPhysicalPropertyValue'];
        this.newDictionary['0x3006']['0x00C0'] = ['SQ', '1', 'FrameOfReferenceRelationshipSequence'];
        this.newDictionary['0x3006']['0x00C2'] = ['UI', '1', 'RelatedFrameOfReferenceUID'];
        this.newDictionary['0x3006']['0x00C4'] = ['CS', '1', 'FrameOfReferenceTransformationType'];
        this.newDictionary['0x3006']['0x00C6'] = ['DS', '16', 'FrameOfReferenceTransformationMatrix'];
        this.newDictionary['0x3006']['0x00C8'] = ['LO', '1', 'FrameOfReferenceTransformationComment'];

        // 0x3008
        this.newDictionary['0x3008'] = [];
        this.newDictionary['0x3008']['0x0010'] = ['SQ', '1', 'MeasuredDoseReferenceSequence'];
        this.newDictionary['0x3008']['0x0012'] = ['ST', '1', 'MeasuredDoseDescription'];
        this.newDictionary['0x3008']['0x0014'] = ['CS', '1', 'MeasuredDoseType'];
        this.newDictionary['0x3008']['0x0016'] = ['DS', '1', 'MeasuredDoseValue'];
        this.newDictionary['0x3008']['0x0020'] = ['SQ', '1', 'TreatmentSessionBeamSequence'];
        this.newDictionary['0x3008']['0x0022'] = ['IS', '1', 'CurrentFractionNumber'];
        this.newDictionary['0x3008']['0x0024'] = ['DA', '1', 'TreatmentControlPointDate'];
        this.newDictionary['0x3008']['0x0025'] = ['TM', '1', 'TreatmentControlPointTime'];
        this.newDictionary['0x3008']['0x002A'] = ['CS', '1', 'TreatmentTerminationStatus'];
        this.newDictionary['0x3008']['0x002B'] = ['SH', '1', 'TreatmentTerminationCode'];
        this.newDictionary['0x3008']['0x002C'] = ['CS', '1', 'TreatmentVerificationStatus'];
        this.newDictionary['0x3008']['0x0030'] = ['SQ', '1', 'ReferencedTreatmentRecordSequence'];
        this.newDictionary['0x3008']['0x0032'] = ['DS', '1', 'SpecifiedPrimaryMeterset'];
        this.newDictionary['0x3008']['0x0033'] = ['DS', '1', 'SpecifiedSecondaryMeterset'];
        this.newDictionary['0x3008']['0x0036'] = ['DS', '1', 'DeliveredPrimaryMeterset'];
        this.newDictionary['0x3008']['0x0037'] = ['DS', '1', 'DeliveredSecondaryMeterset'];
        this.newDictionary['0x3008']['0x003A'] = ['DS', '1', 'SpecifiedTreatmentTime'];
        this.newDictionary['0x3008']['0x003B'] = ['DS', '1', 'DeliveredTreatmentTime'];
        this.newDictionary['0x3008']['0x0040'] = ['SQ', '1', 'ControlPointDeliverySequence'];
        this.newDictionary['0x3008']['0x0042'] = ['DS', '1', 'SpecifiedMeterset'];
        this.newDictionary['0x3008']['0x0044'] = ['DS', '1', 'DeliveredMeterset'];
        this.newDictionary['0x3008']['0x0048'] = ['DS', '1', 'DoseRateDelivered'];
        this.newDictionary['0x3008']['0x0050'] = ['SQ', '1', 'TreatmentSummaryCalculatedDoseReferenceSequence'];
        this.newDictionary['0x3008']['0x0052'] = ['DS', '1', 'CumulativeDosetoDoseReference'];
        this.newDictionary['0x3008']['0x0054'] = ['DA', '1', 'FirstTreatmentDate'];
        this.newDictionary['0x3008']['0x0056'] = ['DA', '1', 'MostRecentTreatmentDate'];
        this.newDictionary['0x3008']['0x005A'] = ['IS', '1', 'NumberofFractionsDelivered'];
        this.newDictionary['0x3008']['0x0060'] = ['SQ', '1', 'OverrideSequence'];
        this.newDictionary['0x3008']['0x0062'] = ['AT', '1', 'OverrideParameterPointer'];
        this.newDictionary['0x3008']['0x0064'] = ['IS', '1', 'MeasuredDoseReferenceNumber'];
        this.newDictionary['0x3008']['0x0066'] = ['ST', '1', 'OverrideReason'];
        this.newDictionary['0x3008']['0x0070'] = ['SQ', '1', 'CalculatedDoseReferenceSequence'];
        this.newDictionary['0x3008']['0x0072'] = ['IS', '1', 'CalculatedDoseReferenceNumber'];
        this.newDictionary['0x3008']['0x0074'] = ['ST', '1', 'CalculatedDoseReferenceDescription'];
        this.newDictionary['0x3008']['0x0076'] = ['DS', '1', 'CalculatedDoseReferenceDoseValue'];
        this.newDictionary['0x3008']['0x0078'] = ['DS', '1', 'StartMeterset'];
        this.newDictionary['0x3008']['0x007A'] = ['DS', '1', 'EndMeterset'];
        this.newDictionary['0x3008']['0x0080'] = ['SQ', '1', 'ReferencedMeasuredDoseReferenceSequence'];
        this.newDictionary['0x3008']['0x0082'] = ['IS', '1', 'ReferencedMeasuredDoseReferenceNumber'];
        this.newDictionary['0x3008']['0x0090'] = ['SQ', '1', 'ReferencedCalculatedDoseReferenceSequence'];
        this.newDictionary['0x3008']['0x0092'] = ['IS', '1', 'ReferencedCalculatedDoseReferenceNumber'];
        this.newDictionary['0x3008']['0x00A0'] = ['SQ', '1', 'BeamLimitingDeviceLeafPairsSequence'];
        this.newDictionary['0x3008']['0x00B0'] = ['SQ', '1', 'RecordedWedgeSequence'];
        this.newDictionary['0x3008']['0x00C0'] = ['SQ', '1', 'RecordedCompensatorSequence'];
        this.newDictionary['0x3008']['0x00D0'] = ['SQ', '1', 'RecordedBlockSequence'];
        this.newDictionary['0x3008']['0x00E0'] = ['SQ', '1', 'TreatmentSummaryMeasuredDoseReferenceSequence'];
        this.newDictionary['0x3008']['0x0100'] = ['SQ', '1', 'RecordedSourceSequence'];
        this.newDictionary['0x3008']['0x0105'] = ['LO', '1', 'SourceSerialNumber'];
        this.newDictionary['0x3008']['0x0110'] = ['SQ', '1', 'TreatmentSessionApplicationSetupSequence'];
        this.newDictionary['0x3008']['0x0116'] = ['CS', '1', 'ApplicationSetupCheck'];
        this.newDictionary['0x3008']['0x0120'] = ['SQ', '1', 'RecordedBrachyAccessoryDeviceSequence'];
        this.newDictionary['0x3008']['0x0122'] = ['IS', '1', 'ReferencedBrachyAccessoryDeviceNumber'];
        this.newDictionary['0x3008']['0x0130'] = ['SQ', '1', 'RecordedChannelSequence'];
        this.newDictionary['0x3008']['0x0132'] = ['DS', '1', 'SpecifiedChannelTotalTime'];
        this.newDictionary['0x3008']['0x0134'] = ['DS', '1', 'DeliveredChannelTotalTime'];
        this.newDictionary['0x3008']['0x0136'] = ['IS', '1', 'SpecifiedNumberofPulses'];
        this.newDictionary['0x3008']['0x0138'] = ['IS', '1', 'DeliveredNumberofPulses'];
        this.newDictionary['0x3008']['0x013A'] = ['DS', '1', 'SpecifiedPulseRepetitionInterval'];
        this.newDictionary['0x3008']['0x013C'] = ['DS', '1', 'DeliveredPulseRepetitionInterval'];
        this.newDictionary['0x3008']['0x0140'] = ['SQ', '1', 'RecordedSourceApplicatorSequence'];
        this.newDictionary['0x3008']['0x0142'] = ['IS', '1', 'ReferencedSourceApplicatorNumber'];
        this.newDictionary['0x3008']['0x0150'] = ['SQ', '1', 'RecordedChannelShieldSequence'];
        this.newDictionary['0x3008']['0x0152'] = ['IS', '1', 'ReferencedChannelShieldNumber'];
        this.newDictionary['0x3008']['0x0160'] = ['SQ', '1', 'BrachyControlPointDeliveredSequence'];
        this.newDictionary['0x3008']['0x0162'] = ['DA', '1', 'SafePositionExitDate'];
        this.newDictionary['0x3008']['0x0164'] = ['TM', '1', 'SafePositionExitTime'];
        this.newDictionary['0x3008']['0x0166'] = ['DA', '1', 'SafePositionReturnDate'];
        this.newDictionary['0x3008']['0x0168'] = ['TM', '1', 'SafePositionReturnTime'];
        this.newDictionary['0x3008']['0x0200'] = ['CS', '1', 'CurrentTreatmentStatus'];
        this.newDictionary['0x3008']['0x0202'] = ['ST', '1', 'TreatmentStatusComment'];
        this.newDictionary['0x3008']['0x0220'] = ['SQ', '1', 'FractionGroupSummarySequence'];
        this.newDictionary['0x3008']['0x0223'] = ['IS', '1', 'ReferencedFractionNumber'];
        this.newDictionary['0x3008']['0x0224'] = ['CS', '1', 'FractionGroupType'];
        this.newDictionary['0x3008']['0x0230'] = ['CS', '1', 'BeamStopperPosition'];
        this.newDictionary['0x3008']['0x0240'] = ['SQ', '1', 'FractionStatusSummarySequence'];
        this.newDictionary['0x3008']['0x0250'] = ['DA', '1', 'TreatmentDate'];
        this.newDictionary['0x3008']['0x0251'] = ['TM', '1', 'TreatmentTime'];

        // 0x300A
        this.newDictionary['0x300A'] = [];
        this.newDictionary['0x300A']['0x0000'] = ['UL', '1', 'RTPlanGroupLength'];
        this.newDictionary['0x300A']['0x0002'] = ['SH', '1', 'RTPlanLabel'];
        this.newDictionary['0x300A']['0x0003'] = ['LO', '1', 'RTPlanName'];
        this.newDictionary['0x300A']['0x0004'] = ['ST', '1', 'RTPlanDescription'];
        this.newDictionary['0x300A']['0x0006'] = ['DA', '1', 'RTPlanDate'];
        this.newDictionary['0x300A']['0x0007'] = ['TM', '1', 'RTPlanTime'];
        this.newDictionary['0x300A']['0x0009'] = ['LO', '1-n', 'TreatmentProtocols'];
        this.newDictionary['0x300A']['0x000A'] = ['CS', '1', 'TreatmentIntent'];
        this.newDictionary['0x300A']['0x000B'] = ['LO', '1-n', 'TreatmentSites'];
        this.newDictionary['0x300A']['0x000C'] = ['CS', '1', 'RTPlanGeometry'];
        this.newDictionary['0x300A']['0x000E'] = ['ST', '1', 'PrescriptionDescription'];
        this.newDictionary['0x300A']['0x0010'] = ['SQ', '1', 'DoseReferenceSequence'];
        this.newDictionary['0x300A']['0x0012'] = ['IS', '1', 'DoseReferenceNumber'];
        this.newDictionary['0x300A']['0x0014'] = ['CS', '1', 'DoseReferenceStructureType'];
        this.newDictionary['0x300A']['0x0015'] = ['CS', '1', 'NominalBeamEnergyUnit'];
        this.newDictionary['0x300A']['0x0016'] = ['LO', '1', 'DoseReferenceDescription'];
        this.newDictionary['0x300A']['0x0018'] = ['DS', '3', 'DoseReferencePointCoordinates'];
        this.newDictionary['0x300A']['0x001A'] = ['DS', '1', 'NominalPriorDose'];
        this.newDictionary['0x300A']['0x0020'] = ['CS', '1', 'DoseReferenceType'];
        this.newDictionary['0x300A']['0x0021'] = ['DS', '1', 'ConstraintWeight'];
        this.newDictionary['0x300A']['0x0022'] = ['DS', '1', 'DeliveryWarningDose'];
        this.newDictionary['0x300A']['0x0023'] = ['DS', '1', 'DeliveryMaximumDose'];
        this.newDictionary['0x300A']['0x0025'] = ['DS', '1', 'TargetMinimumDose'];
        this.newDictionary['0x300A']['0x0026'] = ['DS', '1', 'TargetPrescriptionDose'];
        this.newDictionary['0x300A']['0x0027'] = ['DS', '1', 'TargetMaximumDose'];
        this.newDictionary['0x300A']['0x0028'] = ['DS', '1', 'TargetUnderdoseVolumeFraction'];
        this.newDictionary['0x300A']['0x002A'] = ['DS', '1', 'OrganAtRiskFullVolumeDose'];
        this.newDictionary['0x300A']['0x002B'] = ['DS', '1', 'OrganAtRiskLimitDose'];
        this.newDictionary['0x300A']['0x002C'] = ['DS', '1', 'OrganAtRiskMaximumDose'];
        this.newDictionary['0x300A']['0x002D'] = ['DS', '1', 'OrganAtRiskOverdoseVolumeFraction'];
        this.newDictionary['0x300A']['0x0040'] = ['SQ', '1', 'ToleranceTableSequence'];
        this.newDictionary['0x300A']['0x0042'] = ['IS', '1', 'ToleranceTableNumber'];
        this.newDictionary['0x300A']['0x0043'] = ['SH', '1', 'ToleranceTableLabel'];
        this.newDictionary['0x300A']['0x0044'] = ['DS', '1', 'GantryAngleTolerance'];
        this.newDictionary['0x300A']['0x0046'] = ['DS', '1', 'BeamLimitingDeviceAngleTolerance'];
        this.newDictionary['0x300A']['0x0048'] = ['SQ', '1', 'BeamLimitingDeviceToleranceSequence'];
        this.newDictionary['0x300A']['0x004A'] = ['DS', '1', 'BeamLimitingDevicePositionTolerance'];
        this.newDictionary['0x300A']['0x004C'] = ['DS', '1', 'PatientSupportAngleTolerance'];
        this.newDictionary['0x300A']['0x004E'] = ['DS', '1', 'TableTopEccentricAngleTolerance'];
        this.newDictionary['0x300A']['0x0051'] = ['DS', '1', 'TableTopVerticalPositionTolerance'];
        this.newDictionary['0x300A']['0x0052'] = ['DS', '1', 'TableTopLongitudinalPositionTolerance'];
        this.newDictionary['0x300A']['0x0053'] = ['DS', '1', 'TableTopLateralPositionTolerance'];
        this.newDictionary['0x300A']['0x0055'] = ['CS', '1', 'RTPlanRelationship'];
        this.newDictionary['0x300A']['0x0070'] = ['SQ', '1', 'FractionGroupSequence'];
        this.newDictionary['0x300A']['0x0071'] = ['IS', '1', 'FractionGroupNumber'];
        this.newDictionary['0x300A']['0x0078'] = ['IS', '1', 'NumberOfFractionsPlanned'];
        // this.newDictionary['0x300A']['0x0079'] = ['IS','1','NumberOfFractionsPerDay']; /// Changed
        this.newDictionary['0x300A']['0x0079'] = ['IS', '1', 'NumberOfFractionsPatternDigistsPerDay'];
        this.newDictionary['0x300A']['0x007A'] = ['IS', '1', 'RepeatFractionCycleLength'];
        this.newDictionary['0x300A']['0x007B'] = ['LT', '1', 'FractionPattern'];
        this.newDictionary['0x300A']['0x0080'] = ['IS', '1', 'NumberOfBeams'];
        this.newDictionary['0x300A']['0x0082'] = ['DS', '3', 'BeamDoseSpecificationPoint'];
        this.newDictionary['0x300A']['0x0084'] = ['DS', '1', 'BeamDose'];
        this.newDictionary['0x300A']['0x0086'] = ['DS', '1', 'BeamMeterset'];
        this.newDictionary['0x300A']['0x00A0'] = ['IS', '1', 'NumberOfBrachyApplicationSetups'];
        this.newDictionary['0x300A']['0x00A2'] = ['DS', '3', 'BrachyApplicationSetupDoseSpecificationPoint'];
        this.newDictionary['0x300A']['0x00A4'] = ['DS', '1', 'BrachyApplicationSetupDose'];
        this.newDictionary['0x300A']['0x00B0'] = ['SQ', '1', 'BeamSequence'];
        this.newDictionary['0x300A']['0x00B2'] = ['SH', '1', 'TreatmentMachineName'];
        this.newDictionary['0x300A']['0x00B3'] = ['CS', '1', 'PrimaryDosimeterUnit'];
        this.newDictionary['0x300A']['0x00B4'] = ['DS', '1', 'SourceAxisDistance'];
        this.newDictionary['0x300A']['0x00B6'] = ['SQ', '1', 'BeamLimitingDeviceSequence'];
        this.newDictionary['0x300A']['0x00B8'] = ['CS', '1', 'RTBeamLimitingDeviceType'];
        this.newDictionary['0x300A']['0x00BA'] = ['DS', '1', 'SourceToBeamLimitingDeviceDistance'];
        this.newDictionary['0x300A']['0x00BC'] = ['IS', '1', 'NumberOfLeafJawPairs'];
        this.newDictionary['0x300A']['0x00BE'] = ['DS', '3-n', 'LeafPositionBoundaries'];
        this.newDictionary['0x300A']['0x00C0'] = ['IS', '1', 'BeamNumber'];
        this.newDictionary['0x300A']['0x00C2'] = ['LO', '1', 'BeamName'];
        this.newDictionary['0x300A']['0x00C3'] = ['ST', '1', 'BeamDescription'];
        this.newDictionary['0x300A']['0x00C4'] = ['CS', '1', 'BeamType'];
        this.newDictionary['0x300A']['0x00C6'] = ['CS', '1', 'RadiationType'];
        this.newDictionary['0x300A']['0x00C8'] = ['IS', '1', 'ReferenceImageNumber'];
        this.newDictionary['0x300A']['0x00CA'] = ['SQ', '1', 'PlannedVerificationImageSequence'];
        this.newDictionary['0x300A']['0x00CC'] = ['LO', '1-n', 'ImagingDeviceSpecificAcquisitionParameters'];
        this.newDictionary['0x300A']['0x00CE'] = ['CS', '1', 'TreatmentDeliveryType'];
        this.newDictionary['0x300A']['0x00D0'] = ['IS', '1', 'NumberOfWedges'];
        this.newDictionary['0x300A']['0x00D1'] = ['SQ', '1', 'WedgeSequence'];
        this.newDictionary['0x300A']['0x00D2'] = ['IS', '1', 'WedgeNumber'];
        this.newDictionary['0x300A']['0x00D3'] = ['CS', '1', 'WedgeType'];
        this.newDictionary['0x300A']['0x00D4'] = ['SH', '1', 'WedgeID'];
        this.newDictionary['0x300A']['0x00D5'] = ['IS', '1', 'WedgeAngle'];
        this.newDictionary['0x300A']['0x00D6'] = ['DS', '1', 'WedgeFactor'];
        this.newDictionary['0x300A']['0x00D8'] = ['DS', '1', 'WedgeOrientation'];
        this.newDictionary['0x300A']['0x00DA'] = ['DS', '1', 'SourceToWedgeTrayDistance'];
        this.newDictionary['0x300A']['0x00E0'] = ['IS', '1', 'NumberOfCompensators'];
        this.newDictionary['0x300A']['0x00E1'] = ['SH', '1', 'MaterialID'];
        this.newDictionary['0x300A']['0x00E2'] = ['DS', '1', 'TotalCompensatorTrayFactor'];
        this.newDictionary['0x300A']['0x00E3'] = ['SQ', '1', 'CompensatorSequence'];
        this.newDictionary['0x300A']['0x00E4'] = ['IS', '1', 'CompensatorNumber'];
        this.newDictionary['0x300A']['0x00E5'] = ['SH', '1', 'CompensatorID'];
        this.newDictionary['0x300A']['0x00E6'] = ['DS', '1', 'SourceToCompensatorTrayDistance'];
        this.newDictionary['0x300A']['0x00E7'] = ['IS', '1', 'CompensatorRows'];
        this.newDictionary['0x300A']['0x00E8'] = ['IS', '1', 'CompensatorColumns'];
        this.newDictionary['0x300A']['0x00E9'] = ['DS', '2', 'CompensatorPixelSpacing'];
        this.newDictionary['0x300A']['0x00EA'] = ['DS', '2', 'CompensatorPosition'];
        this.newDictionary['0x300A']['0x00EB'] = ['DS', '1-n', 'CompensatorTransmissionData'];
        this.newDictionary['0x300A']['0x00EC'] = ['DS', '1-n', 'CompensatorThicknessData'];
        this.newDictionary['0x300A']['0x00ED'] = ['IS', '1', 'NumberOfBoli'];
        this.newDictionary['0x300A']['0x00EE'] = ['CS', '1', 'CompensatorType'];
        this.newDictionary['0x300A']['0x00F0'] = ['IS', '1', 'NumberOfBlocks'];
        this.newDictionary['0x300A']['0x00F2'] = ['DS', '1', 'TotalBlockTrayFactor'];
        this.newDictionary['0x300A']['0x00F4'] = ['SQ', '1', 'BlockSequence'];
        this.newDictionary['0x300A']['0x00F5'] = ['SH', '1', 'BlockTrayID'];
        this.newDictionary['0x300A']['0x00F6'] = ['DS', '1', 'SourceToBlockTrayDistance'];
        this.newDictionary['0x300A']['0x00F8'] = ['CS', '1', 'BlockType'];
        this.newDictionary['0x300A']['0x00FA'] = ['CS', '1', 'BlockDivergence'];
        this.newDictionary['0x300A']['0x00FC'] = ['IS', '1', 'BlockNumber'];
        this.newDictionary['0x300A']['0x00FE'] = ['LO', '1', 'BlockName'];
        this.newDictionary['0x300A']['0x0100'] = ['DS', '1', 'BlockThickness'];
        this.newDictionary['0x300A']['0x0102'] = ['DS', '1', 'BlockTransmission'];
        this.newDictionary['0x300A']['0x0104'] = ['IS', '1', 'BlockNumberOfPoints'];
        this.newDictionary['0x300A']['0x0106'] = ['DS', '2-2n', 'BlockData'];
        this.newDictionary['0x300A']['0x0107'] = ['SQ', '1', 'ApplicatorSequence'];
        this.newDictionary['0x300A']['0x0108'] = ['SH', '1', 'ApplicatorID'];
        this.newDictionary['0x300A']['0x0109'] = ['CS', '1', 'ApplicatorType'];
        this.newDictionary['0x300A']['0x010A'] = ['LO', '1', 'ApplicatorDescription'];
        this.newDictionary['0x300A']['0x010C'] = ['DS', '1', 'CumulativeDoseReferenceCoefficient'];
        this.newDictionary['0x300A']['0x010E'] = ['DS', '1', 'FinalCumulativeMetersetWeight'];
        this.newDictionary['0x300A']['0x0110'] = ['IS', '1', 'NumberOfControlPoints'];
        this.newDictionary['0x300A']['0x0111'] = ['SQ', '1', 'ControlPointSequence'];
        this.newDictionary['0x300A']['0x0112'] = ['IS', '1', 'ControlPointIndex'];
        this.newDictionary['0x300A']['0x0114'] = ['DS', '1', 'NominalBeamEnergy'];
        this.newDictionary['0x300A']['0x0115'] = ['DS', '1', 'DoseRateSet'];
        this.newDictionary['0x300A']['0x0116'] = ['SQ', '1', 'WedgePositionSequence'];
        this.newDictionary['0x300A']['0x0118'] = ['CS', '1', 'WedgePosition'];
        this.newDictionary['0x300A']['0x011A'] = ['SQ', '1', 'BeamLimitingDevicePositionSequence'];
        this.newDictionary['0x300A']['0x011C'] = ['DS', '2-2n', 'LeafJawPositions'];
        this.newDictionary['0x300A']['0x011E'] = ['DS', '1', 'GantryAngle'];
        this.newDictionary['0x300A']['0x011F'] = ['CS', '1', 'GantryRotationDirection'];
        this.newDictionary['0x300A']['0x0120'] = ['DS', '1', 'BeamLimitingDeviceAngle'];
        this.newDictionary['0x300A']['0x0121'] = ['CS', '1', 'BeamLimitingDeviceRotationDirection'];
        this.newDictionary['0x300A']['0x0122'] = ['DS', '1', 'PatientSupportAngle'];
        this.newDictionary['0x300A']['0x0123'] = ['CS', '1', 'PatientSupportRotationDirection'];
        this.newDictionary['0x300A']['0x0124'] = ['DS', '1', 'TableTopEccentricAxisDistance'];
        this.newDictionary['0x300A']['0x0125'] = ['DS', '1', 'TableTopEccentricAngle'];
        this.newDictionary['0x300A']['0x0126'] = ['CS', '1', 'TableTopEccentricRotationDirection'];
        this.newDictionary['0x300A']['0x0128'] = ['DS', '1', 'TableTopVerticalPosition'];
        this.newDictionary['0x300A']['0x0129'] = ['DS', '1', 'TableTopLongitudinalPosition'];
        this.newDictionary['0x300A']['0x012A'] = ['DS', '1', 'TableTopLateralPosition'];
        this.newDictionary['0x300A']['0x012C'] = ['DS', '3', 'IsocenterPosition'];
        this.newDictionary['0x300A']['0x012E'] = ['DS', '3', 'SurfaceEntryPoint'];
        this.newDictionary['0x300A']['0x0130'] = ['DS', '1', 'SourceToSurfaceDistance'];
        this.newDictionary['0x300A']['0x0134'] = ['DS', '1', 'CumulativeMetersetWeight'];
        this.newDictionary['0x300A']['0x0140'] = ['FL', '1', 'TableTopPitchAngle'];
        this.newDictionary['0x300A']['0x0142'] = ['CS', '1', 'TableTopPitchRotationDirection'];
        this.newDictionary['0x300A']['0x0144'] = ['FL', '1', 'TableTopRollAngle'];
        this.newDictionary['0x300A']['0x0146'] = ['CS', '1', 'TableTopRollRotationDirection'];
        this.newDictionary['0x300A']['0x0148'] = ['FL', '1', 'HeadFixationAngle'];
        this.newDictionary['0x300A']['0x014A'] = ['FL', '1', 'GantryPitchAngle'];
        this.newDictionary['0x300A']['0x014C'] = ['CS', '1', 'GantryPitchRotationDirection'];
        this.newDictionary['0x300A']['0x014E'] = ['FL', '1', 'GantryPitchAngleTolerance'];
        this.newDictionary['0x300A']['0x0180'] = ['SQ', '1', 'PatientSetupSequence'];
        this.newDictionary['0x300A']['0x0182'] = ['IS', '1', 'PatientSetupNumber'];
        this.newDictionary['0x300A']['0x0184'] = ['LO', '1', 'PatientAdditionalPosition'];
        this.newDictionary['0x300A']['0x0190'] = ['SQ', '1', 'FixationDeviceSequence'];
        this.newDictionary['0x300A']['0x0192'] = ['CS', '1', 'FixationDeviceType'];
        this.newDictionary['0x300A']['0x0194'] = ['SH', '1', 'FixationDeviceLabel'];
        this.newDictionary['0x300A']['0x0196'] = ['ST', '1', 'FixationDeviceDescription'];
        this.newDictionary['0x300A']['0x0198'] = ['SH', '1', 'FixationDevicePosition'];
        this.newDictionary['0x300A']['0x01A0'] = ['SQ', '1', 'ShieldingDeviceSequence'];
        this.newDictionary['0x300A']['0x01A2'] = ['CS', '1', 'ShieldingDeviceType'];
        this.newDictionary['0x300A']['0x01A4'] = ['SH', '1', 'ShieldingDeviceLabel'];
        this.newDictionary['0x300A']['0x01A6'] = ['ST', '1', 'ShieldingDeviceDescription'];
        this.newDictionary['0x300A']['0x01A8'] = ['SH', '1', 'ShieldingDevicePosition'];
        this.newDictionary['0x300A']['0x01B0'] = ['CS', '1', 'SetupTechnique'];
        this.newDictionary['0x300A']['0x01B2'] = ['ST', '1', 'SetupTechniqueDescription'];
        this.newDictionary['0x300A']['0x01B4'] = ['SQ', '1', 'SetupDeviceSequence'];
        this.newDictionary['0x300A']['0x01B6'] = ['CS', '1', 'SetupDeviceType'];
        this.newDictionary['0x300A']['0x01B8'] = ['SH', '1', 'SetupDeviceLabel'];
        this.newDictionary['0x300A']['0x01BA'] = ['ST', '1', 'SetupDeviceDescription'];
        this.newDictionary['0x300A']['0x01BC'] = ['DS', '1', 'SetupDeviceParameter'];
        this.newDictionary['0x300A']['0x01D0'] = ['ST', '1', 'SetupReferenceDescription'];
        this.newDictionary['0x300A']['0x01D2'] = ['DS', '1', 'TableTopVerticalSetupDisplacement'];
        this.newDictionary['0x300A']['0x01D4'] = ['DS', '1', 'TableTopLongitudinalSetupDisplacement'];
        this.newDictionary['0x300A']['0x01D6'] = ['DS', '1', 'TableTopLateralSetupDisplacement'];
        this.newDictionary['0x300A']['0x0200'] = ['CS', '1', 'BrachyTreatmentTechnique'];
        this.newDictionary['0x300A']['0x0202'] = ['CS', '1', 'BrachyTreatmentType'];
        this.newDictionary['0x300A']['0x0206'] = ['SQ', '1', 'TreatmentMachineSequence'];
        this.newDictionary['0x300A']['0x0210'] = ['SQ', '1', 'SourceSequence'];
        this.newDictionary['0x300A']['0x0212'] = ['IS', '1', 'SourceNumber'];
        this.newDictionary['0x300A']['0x0214'] = ['CS', '1', 'SourceType'];
        this.newDictionary['0x300A']['0x0216'] = ['LO', '1', 'SourceManufacturer'];
        this.newDictionary['0x300A']['0x0218'] = ['DS', '1', 'ActiveSourceDiameter'];
        this.newDictionary['0x300A']['0x021A'] = ['DS', '1', 'ActiveSourceLength'];
        this.newDictionary['0x300A']['0x0222'] = ['DS', '1', 'SourceEncapsulationNominalThickness'];
        this.newDictionary['0x300A']['0x0224'] = ['DS', '1', 'SourceEncapsulationNominalTransmission'];
        this.newDictionary['0x300A']['0x0226'] = ['LO', '1', 'SourceIsotopeName'];
        this.newDictionary['0x300A']['0x0228'] = ['DS', '1', 'SourceIsotopeHalfLife'];
        this.newDictionary['0x300A']['0x022A'] = ['DS', '1', 'ReferenceAirKermaRate'];
        this.newDictionary['0x300A']['0x022C'] = ['DA', '1', 'AirKermaRateReferenceDate'];
        this.newDictionary['0x300A']['0x022E'] = ['TM', '1', 'AirKermaRateReferenceTime'];
        this.newDictionary['0x300A']['0x0230'] = ['SQ', '1', 'ApplicationSetupSequence'];
        this.newDictionary['0x300A']['0x0232'] = ['CS', '1', 'ApplicationSetupType'];
        this.newDictionary['0x300A']['0x0234'] = ['IS', '1', 'ApplicationSetupNumber'];
        this.newDictionary['0x300A']['0x0236'] = ['LO', '1', 'ApplicationSetupName'];
        this.newDictionary['0x300A']['0x0238'] = ['LO', '1', 'ApplicationSetupManufacturer'];
        this.newDictionary['0x300A']['0x0240'] = ['IS', '1', 'TemplateNumber'];
        this.newDictionary['0x300A']['0x0242'] = ['SH', '1', 'TemplateType'];
        this.newDictionary['0x300A']['0x0244'] = ['LO', '1', 'TemplateName'];
        this.newDictionary['0x300A']['0x0250'] = ['DS', '1', 'TotalReferenceAirKerma'];
        this.newDictionary['0x300A']['0x0260'] = ['SQ', '1', 'BrachyAccessoryDeviceSequence'];
        this.newDictionary['0x300A']['0x0262'] = ['IS', '1', 'BrachyAccessoryDeviceNumber'];
        this.newDictionary['0x300A']['0x0263'] = ['SH', '1', 'BrachyAccessoryDeviceID'];
        this.newDictionary['0x300A']['0x0264'] = ['CS', '1', 'BrachyAccessoryDeviceType'];
        this.newDictionary['0x300A']['0x0266'] = ['LO', '1', 'BrachyAccessoryDeviceName'];
        this.newDictionary['0x300A']['0x026A'] = ['DS', '1', 'BrachyAccessoryDeviceNominalThickness'];
        this.newDictionary['0x300A']['0x026C'] = ['DS', '1', 'BrachyAccessoryDeviceNominalTransmission'];
        this.newDictionary['0x300A']['0x0280'] = ['SQ', '1', 'ChannelSequence'];
        this.newDictionary['0x300A']['0x0282'] = ['IS', '1', 'ChannelNumber'];
        this.newDictionary['0x300A']['0x0284'] = ['DS', '1', 'ChannelLength'];
        this.newDictionary['0x300A']['0x0286'] = ['DS', '1', 'ChannelTotalTime'];
        this.newDictionary['0x300A']['0x0288'] = ['CS', '1', 'SourceMovementType'];
        this.newDictionary['0x300A']['0x028A'] = ['IS', '1', 'NumberOfPulses'];
        this.newDictionary['0x300A']['0x028C'] = ['DS', '1', 'PulseRepetitionInterval'];
        this.newDictionary['0x300A']['0x0290'] = ['IS', '1', 'SourceApplicatorNumber'];
        this.newDictionary['0x300A']['0x0291'] = ['SH', '1', 'SourceApplicatorID'];
        this.newDictionary['0x300A']['0x0292'] = ['CS', '1', 'SourceApplicatorType'];
        this.newDictionary['0x300A']['0x0294'] = ['LO', '1', 'SourceApplicatorName'];
        this.newDictionary['0x300A']['0x0296'] = ['DS', '1', 'SourceApplicatorLength'];
        this.newDictionary['0x300A']['0x0298'] = ['LO', '1', 'SourceApplicatorManufacturer'];
        this.newDictionary['0x300A']['0x029C'] = ['DS', '1', 'SourceApplicatorWallNominalThickness'];
        this.newDictionary['0x300A']['0x029E'] = ['DS', '1', 'SourceApplicatorWallNominalTransmission'];
        this.newDictionary['0x300A']['0x02A0'] = ['DS', '1', 'SourceApplicatorStepSize'];
        this.newDictionary['0x300A']['0x02A2'] = ['IS', '1', 'TransferTubeNumber'];
        this.newDictionary['0x300A']['0x02A4'] = ['DS', '1', 'TransferTubeLength'];
        this.newDictionary['0x300A']['0x02B0'] = ['SQ', '1', 'ChannelShieldSequence'];
        this.newDictionary['0x300A']['0x02B2'] = ['IS', '1', 'ChannelShieldNumber'];
        this.newDictionary['0x300A']['0x02B3'] = ['SH', '1', 'ChannelShieldID'];
        this.newDictionary['0x300A']['0x02B4'] = ['LO', '1', 'ChannelShieldName'];
        this.newDictionary['0x300A']['0x02B8'] = ['DS', '1', 'ChannelShieldNominalThickness'];
        this.newDictionary['0x300A']['0x02BA'] = ['DS', '1', 'ChannelShieldNominalTransmission'];
        this.newDictionary['0x300A']['0x02C8'] = ['DS', '1', 'FinalCumulativeTimeWeight'];
        this.newDictionary['0x300A']['0x02D0'] = ['SQ', '1', 'BrachyControlPointSequence'];
        this.newDictionary['0x300A']['0x02D2'] = ['DS', '1', 'ControlPointRelativePosition'];
        this.newDictionary['0x300A']['0x02D4'] = ['DS', '3', 'ControlPointDPosition'];
        this.newDictionary['0x300A']['0x02D6'] = ['DS', '1', 'CumulativeTimeWeight'];

        // 0x300C
        this.newDictionary['0x300C'] = [];
        this.newDictionary['0x300C']['0x0000'] = ['UL', '1', 'RTRelationshipGroupLength'];
        this.newDictionary['0x300C']['0x0002'] = ['SQ', '1', 'ReferencedRTPlanSequence'];
        this.newDictionary['0x300C']['0x0004'] = ['SQ', '1', 'ReferencedBeamSequence'];
        this.newDictionary['0x300C']['0x0006'] = ['IS', '1', 'ReferencedBeamNumber'];
        this.newDictionary['0x300C']['0x0007'] = ['IS', '1', 'ReferencedReferenceImageNumber'];
        this.newDictionary['0x300C']['0x0008'] = ['DS', '1', 'StartCumulativeMetersetWeight'];
        this.newDictionary['0x300C']['0x0009'] = ['DS', '1', 'EndCumulativeMetersetWeight'];
        this.newDictionary['0x300C']['0x000A'] = ['SQ', '1', 'ReferencedBrachyApplicationSetupSequence'];
        this.newDictionary['0x300C']['0x000C'] = ['IS', '1', 'ReferencedBrachyApplicationSetupNumber'];
        this.newDictionary['0x300C']['0x000E'] = ['IS', '1', 'ReferencedSourceNumber'];
        this.newDictionary['0x300C']['0x0020'] = ['SQ', '1', 'ReferencedFractionGroupSequence'];
        this.newDictionary['0x300C']['0x0022'] = ['IS', '1', 'ReferencedFractionGroupNumber'];
        this.newDictionary['0x300C']['0x0040'] = ['SQ', '1', 'ReferencedVerificationImageSequence'];
        this.newDictionary['0x300C']['0x0042'] = ['SQ', '1', 'ReferencedReferenceImageSequence'];
        this.newDictionary['0x300C']['0x0050'] = ['SQ', '1', 'ReferencedDoseReferenceSequence'];
        this.newDictionary['0x300C']['0x0051'] = ['IS', '1', 'ReferencedDoseReferenceNumber'];
        this.newDictionary['0x300C']['0x0055'] = ['SQ', '1', 'BrachyReferencedDoseReferenceSequence'];
        this.newDictionary['0x300C']['0x0060'] = ['SQ', '1', 'ReferencedStructureSetSequence'];
        this.newDictionary['0x300C']['0x006A'] = ['IS', '1', 'ReferencedPatientSetupNumber'];
        this.newDictionary['0x300C']['0x0080'] = ['SQ', '1', 'ReferencedDoseSequence'];
        this.newDictionary['0x300C']['0x00A0'] = ['IS', '1', 'ReferencedToleranceTableNumber'];
        this.newDictionary['0x300C']['0x00B0'] = ['SQ', '1', 'ReferencedBolusSequence'];
        this.newDictionary['0x300C']['0x00C0'] = ['IS', '1', 'ReferencedWedgeNumber'];
        this.newDictionary['0x300C']['0x00D0'] = ['IS', '1', 'ReferencedCompensatorNumber'];
        this.newDictionary['0x300C']['0x00E0'] = ['IS', '1', 'ReferencedBlockNumber'];
        this.newDictionary['0x300C']['0x00F0'] = ['IS', '1', 'ReferencedControlPointIndex'];

        // 0x300E
        this.newDictionary['0x300E'] = [];
        this.newDictionary['0x300E']['0x0000'] = ['UL', '1', 'RTApprovalGroupLength'];
        this.newDictionary['0x300E']['0x0002'] = ['CS', '1', 'ApprovalStatus'];
        this.newDictionary['0x300E']['0x0004'] = ['DA', '1', 'ReviewDate'];
        this.newDictionary['0x300E']['0x0005'] = ['TM', '1', 'ReviewTime'];
        this.newDictionary['0x300E']['0x0008'] = ['PN', '1', 'ReviewerName'];

        // 0x4000
        this.newDictionary['0x4000'] = [];
        this.newDictionary['0x4000']['0x0000'] = ['UL', '1', 'TextGroupLength'];
        this.newDictionary['0x4000']['0x0010'] = ['LT', '1-n', 'TextArbitrary'];
        this.newDictionary['0x4000']['0x4000'] = ['LT', '1-n', 'TextComments'];

        // 0x4008
        this.newDictionary['0x4008'] = [];
        this.newDictionary['0x4008']['0x0000'] = ['UL', '1', 'ResultsGroupLength'];
        this.newDictionary['0x4008']['0x0040'] = ['SH', '1', 'ResultsID'];
        this.newDictionary['0x4008']['0x0042'] = ['LO', '1', 'ResultsIDIssuer'];
        this.newDictionary['0x4008']['0x0050'] = ['SQ', '1', 'ReferencedInterpretationSequence'];
        this.newDictionary['0x4008']['0x0100'] = ['DA', '1', 'InterpretationRecordedDate'];
        this.newDictionary['0x4008']['0x0101'] = ['TM', '1', 'InterpretationRecordedTime'];
        this.newDictionary['0x4008']['0x0102'] = ['PN', '1', 'InterpretationRecorder'];
        this.newDictionary['0x4008']['0x0103'] = ['LO', '1', 'ReferenceToRecordedSound'];
        this.newDictionary['0x4008']['0x0108'] = ['DA', '1', 'InterpretationTranscriptionDate'];
        this.newDictionary['0x4008']['0x0109'] = ['TM', '1', 'InterpretationTranscriptionTime'];
        this.newDictionary['0x4008']['0x010A'] = ['PN', '1', 'InterpretationTranscriber'];
        this.newDictionary['0x4008']['0x010B'] = ['ST', '1', 'InterpretationText'];
        this.newDictionary['0x4008']['0x010C'] = ['PN', '1', 'InterpretationAuthor'];
        this.newDictionary['0x4008']['0x0111'] = ['SQ', '1', 'InterpretationApproverSequence'];
        this.newDictionary['0x4008']['0x0112'] = ['DA', '1', 'InterpretationApprovalDate'];
        this.newDictionary['0x4008']['0x0113'] = ['TM', '1', 'InterpretationApprovalTime'];
        this.newDictionary['0x4008']['0x0114'] = ['PN', '1', 'PhysicianApprovingInterpretation'];
        this.newDictionary['0x4008']['0x0115'] = ['LT', '1', 'InterpretationDiagnosisDescription'];
        this.newDictionary['0x4008']['0x0117'] = ['SQ', '1', 'DiagnosisCodeSequence'];
        this.newDictionary['0x4008']['0x0118'] = ['SQ', '1', 'ResultsDistributionListSequence'];
        this.newDictionary['0x4008']['0x0119'] = ['PN', '1', 'DistributionName'];
        this.newDictionary['0x4008']['0x011A'] = ['LO', '1', 'DistributionAddress'];
        this.newDictionary['0x4008']['0x0200'] = ['SH', '1', 'InterpretationID'];
        this.newDictionary['0x4008']['0x0202'] = ['LO', '1', 'InterpretationIDIssuer'];
        this.newDictionary['0x4008']['0x0210'] = ['CS', '1', 'InterpretationTypeID'];
        this.newDictionary['0x4008']['0x0212'] = ['CS', '1', 'InterpretationStatusID'];
        this.newDictionary['0x4008']['0x0300'] = ['ST', '1', 'Impressions'];
        this.newDictionary['0x4008']['0x4000'] = ['ST', '1', 'ResultsComments'];

        // 0x5000
        this.newDictionary['0x5000'] = [];
        this.newDictionary['0x5000']['0x0000'] = ['UL', '1', 'CurveGroupLength'];
        this.newDictionary['0x5000']['0x0005'] = ['US', '1', 'CurveDimensions'];
        this.newDictionary['0x5000']['0x0010'] = ['US', '1', 'NumberOfPoints'];
        this.newDictionary['0x5000']['0x0020'] = ['CS', '1', 'TypeOfData'];
        this.newDictionary['0x5000']['0x0022'] = ['LO', '1', 'CurveDescription'];
        this.newDictionary['0x5000']['0x0030'] = ['SH', '1-n', 'AxisUnits'];
        this.newDictionary['0x5000']['0x0040'] = ['SH', '1-n', 'AxisLabels'];
        this.newDictionary['0x5000']['0x0103'] = ['US', '1', 'DataValueRepresentation'];
        this.newDictionary['0x5000']['0x0104'] = ['US', '1-n', 'MinimumCoordinateValue'];
        this.newDictionary['0x5000']['0x0105'] = ['US', '1-n', 'MaximumCoordinateValue'];
        this.newDictionary['0x5000']['0x0106'] = ['SH', '1-n', 'CurveRange'];
        this.newDictionary['0x5000']['0x0110'] = ['US', '1', 'CurveDataDescriptor'];
        this.newDictionary['0x5000']['0x0112'] = ['US', '1', 'CoordinateStartValue'];
        this.newDictionary['0x5000']['0x0114'] = ['US', '1', 'CoordinateStepValue'];
        this.newDictionary['0x5000']['0x2000'] = ['US', '1', 'AudioType'];
        this.newDictionary['0x5000']['0x2002'] = ['US', '1', 'AudioSampleFormat'];
        this.newDictionary['0x5000']['0x2004'] = ['US', '1', 'NumberOfChannels'];
        this.newDictionary['0x5000']['0x2006'] = ['UL', '1', 'NumberOfSamples'];
        this.newDictionary['0x5000']['0x2008'] = ['UL', '1', 'SampleRate'];
        this.newDictionary['0x5000']['0x200A'] = ['UL', '1', 'TotalTime'];
        this.newDictionary['0x5000']['0x200C'] = ['OX', '1', 'AudioSampleData'];
        this.newDictionary['0x5000']['0x200E'] = ['LT', '1', 'AudioComments'];
        this.newDictionary['0x5000']['0x3000'] = ['OX', '1', 'CurveData'];

        // 0x5400
        this.newDictionary['0x5400'] = [];
        this.newDictionary['0x5400']['0x0100'] = ['SQ', '1', 'WaveformSequence'];
        this.newDictionary['0x5400']['0x0110'] = ['OW/OB', '1', 'ChannelMinimumValue'];
        this.newDictionary['0x5400']['0x0112'] = ['OW/OB', '1', 'ChannelMaximumValue'];
        this.newDictionary['0x5400']['0x1004'] = ['US', '1', 'WaveformBitsAllocated'];
        this.newDictionary['0x5400']['0x1006'] = ['CS', '1', 'WaveformSampleInterpretation'];
        this.newDictionary['0x5400']['0x100A'] = ['OW/OB', '1', 'WaveformPaddingValue'];
        this.newDictionary['0x5400']['0x1010'] = ['OW/OB', '1', 'WaveformData'];

        // 0x6000
        this.newDictionary['0x6000'] = [];
        this.newDictionary['0x6000']['0x0000'] = ['UL', '1', 'OverlayGroupLength'];
        this.newDictionary['0x6000']['0x0010'] = ['US', '1', 'OverlayRows'];
        this.newDictionary['0x6000']['0x0011'] = ['US', '1', 'OverlayColumns'];
        this.newDictionary['0x6000']['0x0012'] = ['US', '1', 'OverlayPlanes'];
        this.newDictionary['0x6000']['0x0015'] = ['IS', '1', 'OverlayNumberOfFrames'];
        this.newDictionary['0x6000']['0x0040'] = ['CS', '1', 'OverlayType'];
        this.newDictionary['0x6000']['0x0050'] = ['SS', '2', 'OverlayOrigin'];
        this.newDictionary['0x6000']['0x0051'] = ['US', '1', 'OverlayImageFrameOrigin'];
        this.newDictionary['0x6000']['0x0052'] = ['US', '1', 'OverlayPlaneOrigin'];
        this.newDictionary['0x6000']['0x0060'] = ['CS', '1', 'OverlayCompressionCode'];
        this.newDictionary['0x6000']['0x0061'] = ['SH', '1', 'OverlayCompressionOriginator'];
        this.newDictionary['0x6000']['0x0062'] = ['SH', '1', 'OverlayCompressionLabel'];
        this.newDictionary['0x6000']['0x0063'] = ['SH', '1', 'OverlayCompressionDescription'];
        this.newDictionary['0x6000']['0x0066'] = ['AT', '1-n', 'OverlayCompressionStepPointers'];
        this.newDictionary['0x6000']['0x0068'] = ['US', '1', 'OverlayRepeatInterval'];
        this.newDictionary['0x6000']['0x0069'] = ['US', '1', 'OverlayBitsGrouped'];
        this.newDictionary['0x6000']['0x0100'] = ['US', '1', 'OverlayBitsAllocated'];
        this.newDictionary['0x6000']['0x0102'] = ['US', '1', 'OverlayBitPosition'];
        this.newDictionary['0x6000']['0x0110'] = ['CS', '1', 'OverlayFormat'];
        this.newDictionary['0x6000']['0x0200'] = ['US', '1', 'OverlayLocation'];
        this.newDictionary['0x6000']['0x0800'] = ['CS', '1-n', 'OverlayCodeLabel'];
        this.newDictionary['0x6000']['0x0802'] = ['US', '1', 'OverlayNumberOfTables'];
        this.newDictionary['0x6000']['0x0803'] = ['AT', '1-n', 'OverlayCodeTableLocation'];
        this.newDictionary['0x6000']['0x0804'] = ['US', '1', 'OverlayBitsForCodeWord'];
        this.newDictionary['0x6000']['0x1100'] = ['US', '1', 'OverlayDescriptorGray'];
        this.newDictionary['0x6000']['0x1101'] = ['US', '1', 'OverlayDescriptorRed'];
        this.newDictionary['0x6000']['0x1102'] = ['US', '1', 'OverlayDescriptorGreen'];
        this.newDictionary['0x6000']['0x1103'] = ['US', '1', 'OverlayDescriptorBlue'];
        this.newDictionary['0x6000']['0x1200'] = ['US', '1-n', 'OverlayGray'];
        this.newDictionary['0x6000']['0x1201'] = ['US', '1-n', 'OverlayRed'];
        this.newDictionary['0x6000']['0x1202'] = ['US', '1-n', 'OverlayGreen'];
        this.newDictionary['0x6000']['0x1203'] = ['US', '1-n', 'OverlayBlue'];
        this.newDictionary['0x6000']['0x1301'] = ['IS', '1', 'ROIArea'];
        this.newDictionary['0x6000']['0x1302'] = ['DS', '1', 'ROIMean'];
        this.newDictionary['0x6000']['0x1303'] = ['DS', '1', 'ROIStandardDeviation'];
        this.newDictionary['0x6000']['0x3000'] = ['OW', '1', 'OverlayData'];
        this.newDictionary['0x6000']['0x4000'] = ['LT', '1-n', 'OverlayComments'];

        // 0x7F00
        this.newDictionary['0x7F00'] = [];
        this.newDictionary['0x7F00']['0x0000'] = ['UL', '1', 'VariablePixelDataGroupLength'];
        this.newDictionary['0x7F00']['0x0010'] = ['OX', '1', 'VariablePixelData'];
        this.newDictionary['0x7F00']['0x0011'] = ['AT', '1', 'VariableNextDataGroup'];
        this.newDictionary['0x7F00']['0x0020'] = ['OW', '1-n', 'VariableCoefficientsSDVN'];
        this.newDictionary['0x7F00']['0x0030'] = ['OW', '1-n', 'VariableCoefficientsSDHN'];
        this.newDictionary['0x7F00']['0x0040'] = ['OW', '1-n', 'VariableCoefficientsSDDN'];

        // 0x7FE0
        this.newDictionary['0x7FE0'] = [];
        this.newDictionary['0x7FE0']['0x0000'] = ['UL', '1', 'PixelDataGroupLength'];
        this.newDictionary['0x7FE0']['0x0010'] = ['OX', '1', 'PixelData'];
        this.newDictionary['0x7FE0']['0x0020'] = ['OW', '1-n', 'CoefficientsSDVN'];
        this.newDictionary['0x7FE0']['0x0030'] = ['OW', '1-n', 'CoefficientsSDHN'];
        this.newDictionary['0x7FE0']['0x0040'] = ['OW', '1-n', 'CoefficientsSDDN'];

        // 0xFFFC
        this.newDictionary['0xFFFC'] = [];
        this.newDictionary['0xFFFC']['0xFFFC'] = ['OB', '1', 'DataSetTrailingPadding'];

        // 0xFFFE
        this.newDictionary['0xFFFE'] = [];
        this.newDictionary['0xFFFE']['0xE000'] = ['NONE', '1', 'Item'];
        this.newDictionary['0xFFFE']['0xE00D'] = ['NONE', '1', 'ItemDelimitationItem'];
        this.newDictionary['0xFFFE']['0xE0DD'] = ['NONE', '1', 'SequenceDelimitationItem'];
    };
};
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace GUI classes.
dwv.gui = dwv.gui || {};

dwv.gui.onChangeWindowLevelPreset = function(event)
{
    app.getToolBox().getSelectedTool().setPreset(this.value);
};

dwv.gui.onChangeColourMap = function(event)
{
    app.getToolBox().getSelectedTool().setColourMap(this.value);
};

dwv.gui.onChangeTool = function(event)
{
    app.getToolBox().setSelectedTool(this.value);
};

dwv.gui.onChangeFilter = function(event)
{
    app.getToolBox().getSelectedTool().setSelectedFilter(this.value);
};

dwv.gui.onChangeShape = function(event)
{
    app.getToolBox().getSelectedTool().setShapeName(this.value);
};

dwv.gui.onChangeLineColour = function(event)
{
    app.getToolBox().getSelectedTool().setLineColour(this.value);
};

dwv.gui.appendToolboxHtml = function()
{
    // select
    var toolSelector = dwv.html.createHtmlSelect("toolSelect",dwv.tool.tools);
    toolSelector.onchange = dwv.gui.onChangeTool;
    // label
    var toolLabel = document.createElement("label");
    toolLabel.setAttribute("for", "toolSelect");
    toolLabel.appendChild(document.createTextNode("Tool: "));
    // list element
    var toolLi = document.createElement("li");
    toolLi.id = "toolLi";
    //toolLi.appendChild(toolLabel);
    toolLi.appendChild(toolSelector);
    toolLi.setAttribute("class","ui-block-a");

    // node
    var node = document.getElementById("toolList");
    // clear it
    while(node.hasChildNodes()) node.removeChild(node.firstChild);
    // append
    node.appendChild(toolLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

dwv.gui.appendWindowLevelHtml = function()
{
    // preset selector
    var wlSelector = dwv.html.createHtmlSelect("presetSelect",dwv.tool.presets);
    wlSelector.onchange = dwv.gui.onChangeWindowLevelPreset;
    // preset label
    var wlLabel = document.createElement("label");
    wlLabel.setAttribute("for", "presetSelect");
    wlLabel.appendChild(document.createTextNode("WL Preset: "));
    // colour map selector
    var cmSelector = dwv.html.createHtmlSelect("colourMapSelect",dwv.tool.colourMaps);
    // special monochrome1 case
    if( app.getImage().getPhotometricInterpretation() === "MONOCHROME1" )
        cmSelector.options[1].defaultSelected = true;
    cmSelector.onchange = dwv.gui.onChangeColourMap;
    // colour map label
    var cmLabel = document.createElement("label");
    cmLabel.setAttribute("for", "colourMapSelect");
    cmLabel.appendChild(document.createTextNode("Colour Map: "));

    // preset list element
    var wlLi = document.createElement("li");
    wlLi.id = "wlLi";
    //wlLi.appendChild(wlLabel);
    wlLi.appendChild(wlSelector);
    wlLi.setAttribute("class","ui-block-b");
    // color map list element
    var cmLi = document.createElement("li");
    cmLi.id = "cmLi";
    // cmLi.appendChild(cmLabel);
    cmLi.appendChild(cmSelector);
    cmLi.setAttribute("class","ui-block-c");

    // node
    var node = document.getElementById("toolList");
    // apend preset
    node.appendChild(wlLi);
    // apend color map
    node.appendChild(cmLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

dwv.gui.clearWindowLevelHtml = function()
{
    dwv.html.removeNode("wlLi");
    dwv.html.removeNode("cmLi");
};

dwv.gui.appendDrawHtml = function()
{
    // shape select
    var shapeSelector = dwv.html.createHtmlSelect("shapeSelect",dwv.tool.shapes);
    shapeSelector.onchange = dwv.gui.onChangeShape;
    // shape label
    var shapeLabel = document.createElement("label");
    shapeLabel.setAttribute("for", "shapeSelect");
    shapeLabel.appendChild(document.createTextNode("Shape: "));
    // colour select
    var colourSelector = dwv.html.createHtmlSelect("colourSelect",dwv.tool.colors);
    colourSelector.onchange = dwv.gui.onChangeLineColour;
    // colour label
    var colourLabel = document.createElement("label");
    colourLabel.setAttribute("for", "colourSelect");
    colourLabel.appendChild(document.createTextNode("Colour: "));

    // list element
    var shapeLi = document.createElement("li");
    shapeLi.id = "shapeLi";
    // shapeLi.appendChild(shapeLabel);
    shapeLi.appendChild(shapeSelector);
    shapeLi.setAttribute("class","ui-block-c");
    // list element
    var colourLi = document.createElement("li");
    colourLi.id = "colourLi";
    //colourLi.appendChild(colourLabel);
    colourLi.appendChild(colourSelector);
    colourLi.setAttribute("class","ui-block-b");
    
    // node
    var node = document.getElementById("toolList");
    // apend shape
    node.appendChild(shapeLi);
    // append color
    node.appendChild(colourLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

dwv.gui.clearDrawHtml = function()
{
    dwv.html.removeNode("colourLi");
    dwv.html.removeNode("shapeLi");
};

/**
 * @function Append the color chooser to the HTML document in the 'colourChooser' node.
 */
dwv.gui.appendLivewireHtml = function()
{
    // select
    var colourSelector = dwv.html.createHtmlSelect("colourSelect",dwv.tool.colors);
    colourSelector.onchange = dwv.gui.onChangeLineColour;
    // label
    var colourLabel = document.createElement("label");
    colourLabel.setAttribute("for", "colourSelect");
    colourLabel.appendChild(document.createTextNode("Colour: "));
    
    // list element
    var colourLi = document.createElement("li");
    colourLi.id = "colourLi";
    colourLi.setAttribute("class","ui-block-b");
    //colourLi.appendChild(colourLabel);
    colourLi.appendChild(colourSelector);
    
    // append to tool list
    document.getElementById("toolList").appendChild(colourLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * @function Remove the color chooser specific node.
 */
dwv.gui.clearLivewireHtml = function()
{
    dwv.html.removeNode("colourLi");
};

dwv.gui.appendFilterHtml = function()
{
    // select
    var filterSelector = dwv.html.createHtmlSelect("filterSelect",dwv.tool.filters);
    filterSelector.onchange = dwv.gui.onChangeFilter;
    // label
    var filterLabel = document.createElement("label");
    filterLabel.setAttribute("for", "filterSelect");
    filterLabel.appendChild(document.createTextNode("Filter: "));

    // list element
    var filterLi = document.createElement("li");
    filterLi.id = "filterLi";
    filterLi.setAttribute("class","ui-block-b");
    //filterLi.appendChild(filterLabel);
    filterLi.appendChild(filterSelector);
    
    // append to tool list
    document.getElementById("toolList").appendChild(filterLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

dwv.gui.clearFilterHtml = function()
{
    dwv.html.removeNode("filterLi");
};

/**
 * @namespace GUI classes.
 */
dwv.gui.filter = dwv.gui.filter || {};

/**
* @function Threshold Filter User Interface.
*/
dwv.gui.filter.appendThresholdHtml = function()
{
    // list element
    var thresholdLi = document.createElement("li");
    thresholdLi.setAttribute("class","ui-block-c");
    thresholdLi.id = "thresholdLi";
    
    // append to tool list
    document.getElementById("toolList").appendChild(thresholdLi);
    // gui specific slider...
    dwv.gui.getSliderHtml();
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

dwv.gui.filter.clearThresholdHtml = function()
{
    dwv.html.removeNode("thresholdLi");
};

/**
* @function Sharpen Filter User Interface.
*/
dwv.gui.filter.appendSharpenHtml = function()
{
    // button
    var buttonRun = document.createElement("button");
    buttonRun.id = "runFilterButton";
    buttonRun.onclick = app.getToolBox().getSelectedTool().getSelectedFilter().run;
    buttonRun.appendChild(document.createTextNode("Apply"));

    // list element
    var sharpenLi = document.createElement("li");
    sharpenLi.id = "sharpenLi";
    sharpenLi.setAttribute("class","ui-block-c");
    sharpenLi.appendChild(buttonRun);
    
    // append to tool list
    document.getElementById("toolList").appendChild(sharpenLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

dwv.gui.filter.clearSharpenHtml = function()
{
    dwv.html.removeNode("sharpenLi");
};

/**
* @function Sobel Filter User Interface.
*/
dwv.gui.filter.appendSobelHtml = function()
{
    // button
    var buttonRun = document.createElement("button");
    buttonRun.id = "runFilterButton";
    buttonRun.onclick = app.getToolBox().getSelectedTool().getSelectedFilter().run;
    buttonRun.appendChild(document.createTextNode("Apply"));

    // list element
    var sobelLi = document.createElement("li");
    sobelLi.id = "sobelLi";
    sobelLi.setAttribute("class","ui-block-c");
    sobelLi.appendChild(buttonRun);
    
    // append to tool list
    document.getElementById("toolList").appendChild(sobelLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

dwv.gui.filter.clearSobelHtml = function()
{
    dwv.html.removeNode("sobelLi");
};

dwv.gui.appendZoomHtml = function()
{
    // button
    var button = document.createElement("button");
    button.id = "zoomResetButton";
    button.name = "zoomResetButton";
    button.onclick = dwv.tool.zoomReset;
    var text = document.createTextNode("Reset");
    button.appendChild(text);
    
    // list element
    var zoomLi = document.createElement("li");
    zoomLi.id = "zoomLi";
    zoomLi.setAttribute("class","ui-block-c");
    zoomLi.appendChild(button);
    
    // append to tool list
    document.getElementById("toolList").appendChild(zoomLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

dwv.gui.clearZoomHtml = function()
{
    dwv.html.removeNode("zoomLi");
};

dwv.gui.appendUndoHtml = function()
{
    var paragraph = document.createElement("p");  
    paragraph.appendChild(document.createTextNode("History:"));
    paragraph.appendChild(document.createElement("br"));
    
    var select = document.createElement("select");
    select.id = "history_list";
    select.name = "history_list";
    select.multiple = "multiple";
    paragraph.appendChild(select);

    // node
    var node = document.getElementById("history");
    // clear it
    while(node.hasChildNodes()) node.removeChild(node.firstChild);
    // append
    node.appendChild(paragraph);
};

dwv.gui.addCommandToUndoHtml = function(commandName)
{
    var select = document.getElementById("history_list");
    // remove undone commands
    var count = select.length - (select.selectedIndex+1);
    if( count > 0 )
    {
        for( var i = 0; i < count; ++i)
        {
            select.remove(select.length-1);
        }
    }
    // add new option
    var option = document.createElement("option");
    option.text = commandName;
    option.value = commandName;
    select.add(option);
    // increment selected index
    select.selectedIndex++;
};

dwv.gui.enableInUndoHtml = function(enable)
{
    var select = document.getElementById("history_list");
    // enable or not (order is important)
    var option;
    if( enable ) 
    {
        // increment selected index
        select.selectedIndex++;
        // enable option
        option = select.options[select.selectedIndex];
        option.disabled = false;
    }
    else 
    {
        // disable option
        option = select.options[select.selectedIndex];
        option.disabled = true;
        // decrement selected index
        select.selectedIndex--;
    }
};

;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace HTML related.
dwv.html = dwv.html || {};

/**
 * @function Append a cell to a given row.
 * @param row The row to append the cell to.
 * @param text The text of the cell.
 */
dwv.html.appendCell = function(row, text)
{
    var cell = row.insertCell(-1);
    cell.appendChild(document.createTextNode(text));
};

/**
 * @function Append a header cell to a given row.
 * @param row The row to append the header cell to.
 * @param text The text of the header cell.
 */
dwv.html.appendHCell = function(row, text)
{
    var cell = document.createElement("th");
    // TODO jquery-mobile specific...
    if( text !== "Value" && text !== "Name" ) cell.setAttribute("data-priority", "1");
    cell.appendChild(document.createTextNode(text));
    row.appendChild(cell);
};

/**
 * @function
 */
dwv.html.appendRowForArray = function(table, input, level, maxLevel, rowHeader)
{
    var row = null;
    // loop through
    for(var i=0; i<input.length; ++i) {
        // more to come
        if( typeof input[i] === 'number' ||
            typeof input[i] === 'string' ||
            input[i] === null ||
            input[i] === undefined ||
            level >= maxLevel ) {
            if( !row ) {
                row = table.insertRow(-1);
            }
            dwv.html.appendCell(row, input[i]);
        }
        // last level
        else {
            dwv.html.appendRow(table, input[i], level+i, maxLevel, rowHeader);
        }
    }
};

/**
 * @function
 */
dwv.html.appendRowForObject = function(table, input, level, maxLevel, rowHeader)
{
    var keys = Object.keys(input);
    var row = null;
    for( var o=0; o<keys.length; ++o ) {
        // more to come
        if( typeof input[keys[o]] === 'number' ||
            typeof input[keys[o]] === 'string' ||
            input[keys[o]] === null ||
            input[keys[o]] === undefined ||
            level >= maxLevel ) {
            if( !row ) {
                row = table.insertRow(-1);
            }
            if( o === 0 && rowHeader) {
                dwv.html.appendCell(row, rowHeader);
            }
            dwv.html.appendCell(row, input[keys[o]]);
        }
        // last level
        else {
            dwv.html.appendRow(table, input[keys[o]], level+o, maxLevel, keys[o]);
        }
    }
    // header row
    // warn: need to create the header after the rest
    // otherwise the data will inserted in the thead...
    if( level === 2 ) {
        var header = table.createTHead();
        var th = header.insertRow(-1);
        if( rowHeader ) {
            dwv.html.appendHCell(th, "Name");
        }
        for( var k=0; k<keys.length; ++k ) {
            dwv.html.appendHCell(th, dwv.utils.capitaliseFirstLetter(keys[k]));
        }
    }
};

/**
 * @function
 */
dwv.html.appendRow = function(table, input, level, maxLevel, rowHeader)
{
    // array
    if( input instanceof Array ) {
        dwv.html.appendRowForArray(table, input, level+1, maxLevel, rowHeader);
    }
    // object
    else if( typeof input === 'object') {
        dwv.html.appendRowForObject(table, input, level+1, maxLevel, rowHeader);
    }
    else {
        throw new Error("Unsupported input data type.");
    }
};

/**
 * @function Converts the input to an HTML table.
 * @input input Allowed types are: array, array of object, object.
 * @warning Null is interpreted differently in browsers, firefox will not display it.
 */
dwv.html.toTable = function(input)
{
    var table = document.createElement('table');
    dwv.html.appendRow(table, input, 0, 2);
    return table;
};

/**
 * @function
 */
dwv.html.getHtmlSearchForm = function(htmlTableToSearch)
{
    var form = document.createElement("form");
    form.setAttribute("class", "filter");
    var input = document.createElement("input");
    input.onkeyup = function() {
        dwv.html.filterTable(input, htmlTableToSearch);
    };
    form.appendChild(input);
    
    return form;
};

/**
 * @function
 * @param term
 * @param table
 */
dwv.html.filterTable = function(term, table) {
    // de-highlight
    dwv.html.dehighlight(table);
    // split search terms
    var terms = term.value.toLowerCase().split(" ");

    // search
    var text = 0;
    var display = 0;
    for (var r = 1; r < table.rows.length; ++r) {
        display = '';
        for (var i = 0; i < terms.length; ++i) {
            text = table.rows[r].innerHTML.replace(/<[^>]+>/g, "").toLowerCase();
            if (text.indexOf(terms[i]) < 0) {
                display = 'none';
            } else {
                if (terms[i].length) {
                    dwv.html.highlight(terms[i], table.rows[r]);
                }
            }
            table.rows[r].style.display = display;
        }
    }
};

/**
 * @function Transform back each
 * <span>preText <span class="highlighted">term</span> postText</span>
 * into its original preText term postText
 * @param container The container to de-highlight.
 */
dwv.html.dehighlight = function(container) {
    for (var i = 0; i < container.childNodes.length; i++) {
        var node = container.childNodes[i];

        if (node.attributes &&
                node.attributes['class'] &&
                node.attributes['class'].value === 'highlighted') {
            node.parentNode.parentNode.replaceChild(
                    document.createTextNode(
                        node.parentNode.innerHTML.replace(/<[^>]+>/g, "")),
                    node.parentNode);
            // Stop here and process next parent
            return;
        } else if (node.nodeType !== 3) {
            // Keep going onto other elements
            dwv.html.dehighlight(node);
        }
    }
};

/**
 * @function Create a
 * <span>preText <span class="highlighted">term</span> postText</span>
 * around each search term
 * @param term The term to highlight.
 * @param container The container where to highlight the term.
 */
dwv.html.highlight = function(term, container) {
    for (var i = 0; i < container.childNodes.length; i++) {
        var node = container.childNodes[i];

        if (node.nodeType === 3) {
            // Text node
            var data = node.data;
            var data_low = data.toLowerCase();
            if (data_low.indexOf(term) >= 0) {
                //term found!
                var new_node = document.createElement('span');
                node.parentNode.replaceChild(new_node, node);

                var result;
                while ((result = data_low.indexOf(term)) !== -1) {
                    // before term
                    new_node.appendChild(document.createTextNode(
                                data.substr(0, result)));
                    // term
                    new_node.appendChild(dwv.html.createHighlightNode(
                                document.createTextNode(data.substr(
                                        result, term.length))));
                    // reduce search string
                    data = data.substr(result + term.length);
                    data_low = data_low.substr(result + term.length);
                }
                new_node.appendChild(document.createTextNode(data));
            }
        } else {
            // Keep going onto other elements
            dwv.html.highlight(term, node);
        }
    }
};

/**
 * @function
 */
dwv.html.createHighlightNode = function(child) {
    var node = document.createElement('span');
    node.setAttribute('class', 'highlighted');
    node.attributes['class'].value = 'highlighted';
    node.appendChild(child);
    return node;
};

/**
 * @function Remove all children of a node.
 * @param nodeId The id of the node to delete.
 * @param parentId The id of the parent of the node to delete.
 */
dwv.html.cleanNode = function(node) {
    // remove its children
    while (node.hasChildNodes()) {
        node.removeChild(node.firstChild);
    }
};

/**
 * @function Remove all children of a node and then remove it from its parent.
 * @param nodeId The id of the node to delete.
 * @param parentId The id of the parent of the node to delete.
 */
dwv.html.removeNode = function(nodeId) {
    // find the node
    var node = document.getElementById(nodeId);
    // check node
    if( !node ) return;
    // remove its children
    dwv.html.cleanNode(node);
    // remove it from its parent
    var top = node.parentNode;
    top.removeChild(node);
};

/**
 * @function Create a HTML select from an input array of options.
 * The values of the options are the name of the option made lower case.
 * It is left to the user to set the 'onchange' method of the select.
 * @param name The name of the HTML select.
 * @param list The list of options of the HTML select.
 * @return The created HTML select.
 */
dwv.html.createHtmlSelect = function(name, list) {
    // select
    var select = document.createElement("select");
    select.id = name;
    select.name = name;
    // options
    var option;
    if( list instanceof Array )
    {
        for ( var i in list )
        {
            option = document.createElement("option");
            option.value = list[i].toLowerCase();
            option.appendChild(document.createTextNode(dwv.utils.capitaliseFirstLetter(list[i])));
            select.appendChild(option);
        }
    }
    else if( typeof list === 'object')
    {
        for ( var item in list )
        {
            option = document.createElement("option");
            option.value = item.toLowerCase();
            option.appendChild(document.createTextNode(dwv.utils.capitaliseFirstLetter(item)));
            select.appendChild(option);
        }
    }
    else
    {
        throw new Error("Unsupported input list type.");
    }
    return select;
};

dwv.html.getUriParam = function(uri)
{
    var inputUri = uri || window.location.href;
    var val = [];
    // split key/value pairs
    var mainQueryPairs = dwv.utils.splitQueryString(inputUri);
    // check pairs
    if( mainQueryPairs === null ) return null;
    // has to have an input key
    if( !mainQueryPairs.input ) 
        throw new Error("No input parameter in query URI.");
    // decode input URI
    var queryUri = decodeURIComponent(mainQueryPairs.input);
    // get key/value pairs from input URI
    var inputQueryPairs = dwv.utils.splitQueryString(queryUri);
    // repeat key replace mode (default to keep key)
    var repeatKeyReplaceMode = "key";
    if( mainQueryPairs.dwvReplaceMode ) repeatKeyReplaceMode = mainQueryPairs.dwvReplaceMode;
    
    if( !inputQueryPairs ) val.push(queryUri);
    else
    {
        var keys = Object.keys(inputQueryPairs);
        // find repeat key
        var repeatKey = null;
        for( var i = 0; i < keys.length; ++i )
        {
            if( inputQueryPairs[keys[i]] instanceof Array )
                repeatKey = keys[i];
        }
    
        if( !repeatKey ) val.push(queryUri);
        else
        {
            // build base uri
            var baseUrl = inputQueryPairs.base + "?";
            var gotOneArg = false;
            for( var j = 0; j < keys.length; ++j )
            {
                if( keys[j] !== "base" && keys[j] !== repeatKey ) {
                    if( gotOneArg ) baseUrl += "&";
                    baseUrl += keys[j] + "=" + inputQueryPairs[keys[j]];
                    gotOneArg = true;
                }
            }
            
            // check if we really have repetition
            var url;
            if( inputQueryPairs[repeatKey] instanceof Array )
            {
                for( var k = 0; k < inputQueryPairs[repeatKey].length; ++k )
                {
                    url = baseUrl;
                    if( gotOneArg ) url += "&";
                    if( repeatKeyReplaceMode === "key" ) url += repeatKey + "=";
                    // other than key: do nothing
                    url += inputQueryPairs[repeatKey][k];
                    val.push(url);
                }
            }
            else 
            {
                url = baseUrl;
                if( gotOneArg ) url += "&";
                url += repeatKey + "=" + inputQueryPairs[repeatKey];
                val.push(url);
            }
        }
    }
    
    return val;
};

dwv.html.toggleDisplay = function(id)
{
    if( document.getElementById(id) )
    {
        var div = document.getElementById(id);
        if( div.style.display === "none" ) div.style.display = '';
        else div.style.display = "none";
    }
};

/**
 * Browser checks to see if it can run dwv...
 * TODO Maybe use http://modernizr.com/.
 */ 
dwv.html.checkBrowser = function()
{
    var appnorun = "The application cannot be run.";
    var message = "";
    // Check for the File API support
    if( !window.FileReader ) {
        message = "The File APIs are not supported in this browser. ";
        alert(message+appnorun);
        throw new Error(message);
    }
    // Check for XMLHttpRequest
    if( !window.XMLHttpRequest || !("withCredentials" in new XMLHttpRequest()) ) {
        message = "The XMLHttpRequest is not supported in this browser. ";
        alert(message+appnorun);
        throw new Error(message);
    }
    // Check typed array
    if( !window.Uint8Array || !window.Uint16Array ) {
        message = "The Typed arrays are not supported in this browser. ";
        alert(message+appnorun);
        throw new Error(message);
    }
};

;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Layer abstraction.
dwv.html = dwv.html || {};

/**
* @class Window layer.
*/
dwv.html.Layer = function(name)
{
    // A HTMLCanvasElement.
    var canvas = null;
    // A CanvasRenderingContext2D.
    var context = null;
    
    // Get the layer name.
    this.getName = function() { return name; };
    // Get the layer canvas.
    this.getCanvas = function() { return canvas; };
    // Get the layer context
    this.getContext = function() { return context; };
    // Get the layer offset on page
    this.getOffset = function() { return $('#'+name).offset(); };

    // Image data array
    var imageData = null;
    
    // Image information
    var originX = 0;
    var originY = 0;
    var zoomX = 1;
    var zoomY = 1;
    
    // set the zoom
    this.setZoom = function(stepX,stepY,centerX,centerY)
    {
        var newZoomX = zoomX + stepX;
        var newZoomY = zoomY + stepY;
        // check zoom value
        if( newZoomX <= 0.1 || newZoomX >= 10 ||
            newZoomY <= 0.1 || newZoomY >= 10 ) return;
        // The zoom is the ratio between the differences from the center
        // to the origins:
        // centerX - originX = ( centerX - originX0 ) * zoomX
        originX = centerX - (centerX - originX) * (newZoomX / zoomX);
        originY = centerY - (centerY - originY) * (newZoomY / zoomY);
        // save zoom
        zoomX = newZoomX;
        zoomY = newZoomY;
        // draw 
        this.draw();
    };
    
    // zoom the layer
    this.zoom = function(zx,zy,cx,cy)
    {
        // set zoom
        this.setZoom(zx, zy, cx, cy);
        // draw 
        this.draw();
    };

    // translation is according to the last one
    this.setTranslate = function(tx,ty)
    {
        // check translate value
        if( zoomX >= 1 ) { 
            if( (originX + tx) < -1 * (canvas.width * zoomX) + canvas.width ||
                (originX + tx) > 0 ) return;
        } else {
            if( (originX + tx) > -1 * (canvas.width * zoomX) + canvas.width ||
                (originX + tx) < 0 ) return;
        }
        if( zoomY >= 1 ) { 
            if( (originY + ty) < -1 * (canvas.height * zoomY) + canvas.height ||
                (originY + ty) > 0 ) return;
        } else {
            if( (originY + ty) > -1 * (canvas.height * zoomY) + canvas.height ||
                (originY + ty) < 0 ) return;
        }
        // new origin
        originX += tx;
        originY += ty;
    };
    
    // translation is according to the last one
    this.translate = function(tx,ty)
    {
        // set the translate
        this.setTranslate(tx, ty);
        // draw
        this.draw();
    };
    
    // set the image data array
    this.setImageData = function(data)
    {
        imageData = data;
    };
    
    /**
     * Reset the layout
     */ 
    this.resetLayout = function()
    {
        originX = 0;
        originY = 0;
        zoomX = 1;
        zoomY = 1;
    };
    
    /**
     * Draw the content (imageData) of the layer.
     * The imageData variable needs to be set
     */
    this.draw = function()
    {
        // clear the context
        this.clearContextRect();
        
        // Put the image data in the context
        
        // 1. store the image data in a temporary canvas
        var tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCanvas.getContext("2d").putImageData(imageData, 0, 0);
        // 2. draw the temporary canvas on the context
        context.drawImage(tempCanvas,
            originX, originY,
            canvas.width * zoomX, 
            canvas.height * zoomY);
    };
    
    /**
     * Initialise the layer: set the canvas and context
     * @input width The width of the canvas.
     * @input height The height of the canvas.
     */
    this.initialise = function(inputWidth, inputHeight)
    {
        // find the canvas element
        canvas = document.getElementById(name);
        if (!canvas)
        {
            alert("Error: cannot find the canvas element for '" + name + "'.");
            return;
        }
        // check that the getContext method exists
        if (!canvas.getContext)
        {
            alert("Error: no canvas.getContext method for '" + name + "'.");
            return;
        }
        // get the 2D context
        context = canvas.getContext('2d');
        if (!context)
        {
            alert("Error: failed to get the 2D context for '" + name + "'.");
            return;
        }
        // canvas sizes
        canvas.width = inputWidth;
        canvas.height = inputHeight;
        // original empty image data array
        context.clearRect (0, 0, canvas.width, canvas.height);
        imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    };
    
    /**
     * Fill the full context with the current style.
     */
    this.fillContext = function()
    {
        context.fillRect( 0, 0, canvas.width, canvas.height );
    };
    
    /**
     * Clear the full context.
     */
    this.clearContextRect = function()
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
    };
    
    /**
     * Merge two layers.
     * @input layerToMerge The layer to merge. It will also be emptied.
     */
    this.merge = function(layerToMerge)
    {
        // copy content
        context.drawImage(layerToMerge.getCanvas(), 0, 0);
        // reset layout
        this.resetLayout();
        // store the image data
        imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        // empty merged layer
        layerToMerge.clearContextRect();
    };
    
    /**
     * Set the fill and stroke style of the context.
     */
    this.setLineColor = function(color)
    {
        context.fillStyle = color;
        context.strokeStyle = color;
    };
    
    /**
     * Display the layer.
     */
    this.setStyleDisplay = function(val)
    {
        if( val === true )
        {
            canvas.style.display = '';
        }
        else
        {
            canvas.style.display = "none";
        }
    };
    
    this.isVisible = function()
    {
      if( canvas.style.display === "none" ) return false;
      else return true;
    };
    
    /**
     * Align on another layer.
     */
    this.align = function(rhs)
    {
        canvas.style.top = rhs.getCanvas().offsetTop;
        canvas.style.left = rhs.getCanvas().offsetLeft;
    };
}; // Layer class
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Canvas style class.
dwv.html = dwv.html || {};

/**
* @class Style class.
*/
dwv.html.Style = function()
{
    // immutable
    this.fontSize = 12;
    this.fontStr = "normal "+this.fontSize+"px sans-serif";
    this.lineHeight = this.fontSize + this.fontSize/5;
    this.textColor = "#fff";
    // mutable
    this.lineColor = 0;
};

dwv.html.Style.prototype.getFontSize = function() {
    return this.fontSize;
};

dwv.html.Style.prototype.getFontStr = function() {
    return this.fontStr;
};

dwv.html.Style.prototype.getLineHeight = function() {
    return this.lineHeight;
};

dwv.html.Style.prototype.getTextColor = function() {
    return this.textColor;
};

dwv.html.Style.prototype.getLineColor = function() {
    return this.lineColor;
};

dwv.html.Style.prototype.setLineColor = function(color) {
    this.lineColor = color;
};
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Image related.
dwv.image = dwv.image || {};
//! @namespace Filter classes.
dwv.image.filter = dwv.image.filter || {};

/**
 * @function Threshold an image between an input minimum and maximum.
 * @param min The new minimum.
 * @param max The new maximum.
 */
dwv.image.filter.Threshold = function()
{
    var min = 0;
    var max = 0;
    // Get the minimum value.
    this.getMin = function() { return min; };
    // Set the minimum value.
    this.setMin = function(val) { min = val; };
    // Get the maximum value.
    this.getMax = function() { return max; };
    // Set the maximum value.
    this.setMax = function(val) { max = val; };
    // Get the name of the filter.
    this.getName = function() { return "Threshold"; };
};

dwv.image.filter.Threshold.prototype.update = function()
{
    var imageMin = app.getImage().getDataRange().min;
    var self = this;
    var threshFunction = function(value){
        if(value<self.getMin()||value>self.getMax()) return imageMin;
        else return value;
    };
    return app.getImage().transform( threshFunction );
};

/**
 * @function Sharpen an image using a sharpen convolution matrix.
 */
dwv.image.filter.Sharpen = function()
{
    // Get the name of the filter.
    this.getName = function() { return "Sharpen"; };
};

dwv.image.filter.Sharpen.prototype.update = function()
{
    return app.getImage().convolute2D(
        [  0, -1,  0,
          -1,  5, -1,
           0, -1,  0 ] );
};

/**
 * @function Apply a Sobel filter to an image.
 */
dwv.image.filter.Sobel = function()
{
    // Get the name of the filter.
    this.getName = function() { return "Sobel"; };
};

dwv.image.filter.Sobel.prototype.update = function()
{
    var gradX = app.getImage().convolute2D(
        [ 1,  0,  -1,
          2,  0,  -2,
          1,  0,  -1 ] );

    var gradY = app.getImage().convolute2D(
        [  1,  2,  1,
           0,  0,  0,
          -1, -2, -1 ] );
    
    return gradX.compose( gradY, function(x,y){return Math.sqrt(x*x+y*y);} );
};
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Image related.
dwv.image = dwv.image || {};

/**
* @class Image Size class. 
* Supports 2D and 3D images.
* @param numberOfColumns The number of columns (number).
* @param numberOfRows The number of rows (number).
* @param numberOfSlices The number of slices (number).
*/
dwv.image.Size = function( numberOfColumns, numberOfRows, numberOfSlices )
{
    // Get the number of columns.
    this.getNumberOfColumns = function() { return numberOfColumns; };
    // Get the number of rows.
    this.getNumberOfRows = function() { return numberOfRows; };
    // Get the number of slices.
    this.getNumberOfSlices = function() { return (numberOfSlices || 1.0); };
};
// Get the size of a slice.
dwv.image.Size.prototype.getSliceSize = function() {
    return this.getNumberOfColumns()*this.getNumberOfRows();
};
// Get the total size.
dwv.image.Size.prototype.getTotalSize = function() {
    return this.getSliceSize()*this.getNumberOfSlices();
};
// Check for equality.
dwv.image.Size.prototype.equals = function(rhs) {
    return rhs !== null &&
        this.getNumberOfColumns() === rhs.getNumberOfColumns() &&
        this.getNumberOfRows() === rhs.getNumberOfRows() &&
        this.getNumberOfSlices() === rhs.getNumberOfSlices();
};
// Check that coordinates are within bounds.
dwv.image.Size.prototype.isInBounds = function( i, j, k ) {
    if( i < 0 || i > this.getNumberOfColumns() - 1 ||
        j < 0 || j > this.getNumberOfRows() - 1 ||
        k < 0 || k > this.getNumberOfSlices() - 1 ) return false;
    return true;
};

/**
* @class Image Spacing class. 
* Supports 2D and 3D images.
* @param columnSpacing The column spacing (number).
* @param rowSpacing The row spacing (number).
* @param sliceSpacing The slice spacing (number).
*/
dwv.image.Spacing = function( columnSpacing, rowSpacing, sliceSpacing )
{
    // Get the column spacing.
    this.getColumnSpacing = function() { return columnSpacing; };
    // Get the row spacing.
    this.getRowSpacing = function() { return rowSpacing; };
    // Get the slice spacing.
    this.getSliceSpacing = function() { return (sliceSpacing || 1.0); };
};
// Check for equality.
dwv.image.Spacing.prototype.equals = function(rhs) {
    return rhs !== null &&
        this.getColumnSpacing() === rhs.getColumnSpacing() &&
        this.getRowSpacing() === rhs.getRowSpacing() &&
        this.getSliceSpacing() === rhs.getSliceSpacing();
};

/**
* @class Image class.
* @param size The sizes of the image.
* @param spacing The spacings of the image.
* @param _buffer The image data.
* Usable once created, optional are:
* - rescale slope and intercept (default 1:0), 
* - photometric interpretation (default MONOCHROME2),
* - planar configuration (default RGBRGB...).
*/
dwv.image.Image = function(size, spacing, buffer, slicePositions)
{
    // Rescale slope.
    var rescaleSlope = 1;
    // Rescale intercept.
    var rescaleIntercept = 0;
    // Photometric interpretation (MONOCHROME, RGB...)
    var photometricInterpretation = "MONOCHROME2";
    // Planar configuration for RGB data (0:RGBRGBRGBRGB... or 1:RRR...GGG...BBB...)
    var planarConfiguration = 0;
    // Meta information
    var meta = {};
    
    // original buffer.
    var originalBuffer = new Int16Array(buffer);
    
    // check slice positions.
    if( typeof(slicePositions) === 'undefined' ) slicePositions = [[0,0,0]];
    
    // data range.
    var dataRange = null;
    // histogram.
    var histogram = null;
     
    // Get the size of the image.
    this.getSize = function() { return size; };
    // Get the spacing of the image.
    this.getSpacing = function() { return spacing; };
    // Get the data buffer of the image. TODO dangerous...
    this.getBuffer = function() { return buffer; };
    // Get the slice positions.
    this.getSlicePositions = function() { return slicePositions; };
    
    // Get the rescale slope.
    this.getRescaleSlope = function() { return rescaleSlope; };
    // Set the rescale slope.
    this.setRescaleSlope = function(val) { rescaleSlope = val; };
    // Get the rescale intercept.
    this.getRescaleIntercept = function() { return rescaleIntercept; };
    // Set the rescale intercept.
    this.setRescaleIntercept = function(val) { rescaleIntercept = val; };
    // Get the photometricInterpretation of the image.
    this.getPhotometricInterpretation = function() { return photometricInterpretation; };
    // Set the photometricInterpretation of the image.
    this.setPhotometricInterpretation = function(interp) { photometricInterpretation = interp; };
    // Get the planarConfiguration of the image.
    this.getPlanarConfiguration = function() { return planarConfiguration; };
    // Set the planarConfiguration of the image.
    this.setPlanarConfiguration = function(config) { planarConfiguration = config; };

    // Get the meta information of the image.
    this.getMeta = function() { return meta; };
    // Set the meta information of the image.
    this.setMeta = function(rhs) { meta = rhs; };

    // Get value at offset. Warning: No size check...
    this.getValueAtOffset = function(offset) {
        return buffer[offset];
    };
    // Clone the image.
    this.clone = function()
    {
        var copy = new dwv.image.Image(this.getSize(), this.getSpacing(), originalBuffer, slicePositions);
        copy.setRescaleSlope(this.getRescaleSlope());
        copy.setRescaleIntercept(this.getRescaleIntercept());
        copy.setPhotometricInterpretation(this.getPhotometricInterpretation());
        copy.setPlanarConfiguration(this.getPlanarConfiguration());
        copy.setMeta(this.getMeta());
        return copy;
    };
    // Append a slice to the image.
    this.appendSlice = function(rhs)
    {
        // check input
        if( rhs === null )
            throw new Error("Cannot append null slice");
        if( rhs.getSize().getNumberOfSlices() !== 1 )
            throw new Error("Cannot append more than one slice");
        if( size.getNumberOfColumns() !== rhs.getSize().getNumberOfColumns() )
            throw new Error("Cannot append a slice with different number of columns");
        if( size.getNumberOfRows() !== rhs.getSize().getNumberOfRows() )
            throw new Error("Cannot append a slice with different number of rows");
        if( photometricInterpretation !== rhs.getPhotometricInterpretation() )
            throw new Error("Cannot append a slice with different photometric interpretation");
        // all meta should be equal
        for( var key in meta ) {
            if( meta[key] !== rhs.getMeta()[key] )
                throw new Error("Cannot append a slice with different "+key);
        }
        
        // find index where to append slice
        var closestSliceIndex = 0;
        var slicePosition = rhs.getSlicePositions()[0];
        var minDiff = Math.abs( slicePositions[0][2] - slicePosition[2] );
        var diff = 0;
        for( var i = 0; i < slicePositions.length; ++i )
        {
            diff = Math.abs( slicePositions[i][2] - slicePosition[2] );
            if( diff < minDiff ) 
            {
                minDiff = diff;
                closestSliceIndex = i;
            }
        }
        diff = slicePositions[closestSliceIndex][2] - slicePosition[2];
        var newSliceNb = ( diff > 0 ) ? closestSliceIndex : closestSliceIndex + 1;
        
        // new size
        var newSize = new dwv.image.Size(size.getNumberOfColumns(),
                size.getNumberOfRows(),
                size.getNumberOfSlices() + 1 );
        
        // calculate slice size
        var mul = 1;
        if( photometricInterpretation === "RGB" ) mul = 3;
        var sliceSize = mul * size.getSliceSize();
        
        // create the new buffer
        var newBuffer = new Int16Array(sliceSize * newSize.getNumberOfSlices());
        
        // append slice at new position
        if( newSliceNb === 0 )
        {
            newBuffer.set(rhs.getBuffer());
            newBuffer.set(buffer, sliceSize);
        }
        else if( newSliceNb === size.getNumberOfSlices() )
        {
            newBuffer.set(buffer);
            newBuffer.set(rhs.getBuffer(), size.getNumberOfSlices() * sliceSize);
        }
        else
        {
            var offset = newSliceNb * sliceSize;
            newBuffer.set(buffer.subarray(0, offset - 1));
            newBuffer.set(rhs.getBuffer(), offset);
            newBuffer.set(buffer.subarray(offset), offset + sliceSize);
        }
        
        // update slice positions
        slicePositions.splice(newSliceNb, 0, slicePosition);
        
        // copy to class variables
        size = newSize;
        buffer = newBuffer;
        originalBuffer = new Int16Array(newBuffer);
    };
    // Get the data range.
    this.getDataRange = function() { 
        if( !dataRange ) dataRange = this.calculateDataRange();
        return dataRange;
    };
    // Get the histogram.
    this.getHistogram = function() { 
        if( !histogram ) histogram = this.calculateHistogram();
        return histogram;
    };
};

/**
 * Get the value of the image at a specific coordinate.
 * @param i The X index.
 * @param j The Y index.
 * @param k The Z index.
 * @returns The value at the desired position.
 * Warning: No size check...
 */
dwv.image.Image.prototype.getValue = function( i, j, k )
{
    return this.getValueAtOffset( i +
        ( j * this.getSize().getNumberOfColumns() ) +
        ( k * this.getSize().getSliceSize()) );
};

/**
 * Get the value of the image at a specific offset.
 * @param offset The offset in the buffer. 
 * @returns The value at the desired offset.
 * Warning: No size check...
 */
dwv.image.Image.prototype.getRescaledValueAtOffset = function( offset )
{
    return (this.getValueAtOffset(offset)*this.getRescaleSlope())+this.getRescaleIntercept();
};

/**
 * Get the value of the image at a specific coordinate.
 * @param i The X index.
 * @param j The Y index.
 * @param k The Z index.
 * @returns The value at the desired position.
 * Warning: No size check...
 */
dwv.image.Image.prototype.getRescaledValue = function( i, j, k )
{
    return (this.getValue(i,j,k)*this.getRescaleSlope())+this.getRescaleIntercept();
};

/**
 * Calculate the raw image data range.
 * @returns The range {min, max}.
 */
dwv.image.Image.prototype.calculateDataRange = function()
{
    var min = this.getValueAtOffset(0);
    var max = min;
    var value = 0;
    for(var i=0; i < this.getSize().getTotalSize(); ++i)
    {    
        value = this.getValueAtOffset(i);
        if( value > max ) { max = value; }
        if( value < min ) { min = value; }
    }
    return { "min": min, "max": max };
};

/**
 * Calculate the image data range after rescale.
 * @returns The range {min, max}.
 */
dwv.image.Image.prototype.getRescaledDataRange = function()
{
    var rawRange = this.getDataRange();
    return { "min": rawRange.min*this.getRescaleSlope()+this.getRescaleIntercept(),
        "max": rawRange.max*this.getRescaleSlope()+this.getRescaleIntercept()};
};

/**
 * Calculate the histogram of the image.
 * @returns An array representing the histogram.
 */
dwv.image.Image.prototype.calculateHistogram = function()
{
    var histo = [];
    var histoPlot = [];
    var value = 0;
    var size = this.getSize().getTotalSize();
    for(var i=0; i < size; ++i)
    {    
        value = this.getRescaledValueAtOffset(i);
        histo[value] = histo[value] || 0;
        histo[value] += 1;
    }
    // generate data for plotting
    var min = this.getRescaledDataRange().min;
    var max = this.getRescaledDataRange().max;
    for(var j=min; j < max; ++j)
    {    
        value = histo[j] || 0;
        histoPlot.push([j, value]);
    }
    return histoPlot;
};

/**
 * Convolute the image with a given 2D kernel.
 * @param weights The weights of the 2D kernel.
 * @returns The convoluted image.
 * 
 * Note: Uses the raw buffer values.
 */
dwv.image.Image.prototype.convolute2D = function(weights)
{
    var newImage = this.clone();
    var newBuffer = newImage.getBuffer();

    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side/2);
    
    var ncols = this.getSize().getNumberOfColumns();
    var nrows = this.getSize().getNumberOfRows();
    var nslices = this.getSize().getNumberOfSlices();
    
    // loop vars
    var dstOff = 0;
    var newValue = 0;
    var sci = 0;
    var scj = 0;
    var srcOff = 0;
    var wt = 0;
    
    // go through the destination image pixels
    for (var k=0; k<nslices; k++) {
        for (var j=0; j<nrows; j++) {
            for (var i=0; i<ncols; i++) {
                dstOff = k*ncols*nrows + j*ncols + i;
                // calculate the weighed sum of the source image pixels that
                // fall under the convolution matrix
                newValue = 0;
                for (var cj=0; cj<side; cj++) {
                    for (var ci=0; ci<side; ci++) {
                        sci = i + ci - halfSide;
                        scj = j + cj - halfSide;
                        if (sci >= 0 && sci < ncols && scj >= 0 && scj < nrows ) {
                            srcOff = k*ncols*nrows + scj*ncols + sci;
                            wt = weights[cj*side+ci];
                            newValue += this.getValueAtOffset(srcOff) * wt;
                        }
                    }
                }
                newBuffer[dstOff] = newValue;
            }
        }
    }
    return newImage;
};

/**
 * Transform an image using a specific operator.
 * @param operator The operator to use when transforming.
 * @returns The transformed image.
 * 
 * Note: Uses the raw buffer values.
 */
dwv.image.Image.prototype.transform = function(operator)
{
    var newImage = this.clone();
    var newBuffer = newImage.getBuffer();
    for(var i=0; i < this.getSize().getTotalSize(); ++i)
    {   
        newBuffer[i] = operator( newImage.getValueAtOffset(i) );
    }
    return newImage;
};

/**
 * Compose this image with another one and using a specific operator.
 * @param rhs The image to compose with.
 * @param operator The operator to use when composing.
 * @returns The composed image.
 * 
 * Note: Uses the raw buffer values.
 */
dwv.image.Image.prototype.compose = function(rhs, operator)
{
    var newImage = this.clone();
    var newBuffer = newImage.getBuffer();
    for(var i=0; i < this.getSize().getTotalSize(); ++i)
    {   
        // using the operator on the local buffer, i.e. the latest (not original) data
        newBuffer[i] = Math.floor( operator( this.getValueAtOffset(i), rhs.getValueAtOffset(i) ) );
    }
    return newImage;
};
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Image related.
dwv.image = dwv.image || {};
//! @namespace LookUp Table (LUT) related.
dwv.image.lut = dwv.image.lut || {};

/**
 * @class Rescale LUT class.
 * @returns {Rescale}
 */
dwv.image.lut.Rescale = function(slope_,intercept_)
{
    // The internal array.
    var rescaleLut_ = null;
    // The rescale slope.
    if(typeof(slope_) === 'undefined') slope_ = 1;
    // The rescale intercept.
    if(typeof(intercept_) === 'undefined') intercept_ = 0;
    
    // Get the rescale slope.
    this.getSlope = function() { return slope_; };
    // Get the rescale intercept.
    this.getIntercept = function() { return intercept_; };
    // Initialise the LUT.
    this.initialise = function(bitsStored)
    {
        var size = Math.pow(2, bitsStored);
        rescaleLut_ = new Float32Array(size);
        for(var i=0; i<size; ++i)
            rescaleLut_[i] = i * slope_ + intercept_;
    };
    // Get the length of the LUT array.
    this.getLength = function() { return rescaleLut_.length; };
    // Get the value of the LUT at the given offset.
    this.getValue = function(offset) { return rescaleLut_[offset]; };
};

/**
 * @class Window LUT class.
 * @returns {Window}
 */
dwv.image.lut.Window = function(rescaleLut_, isSigned_)
{
    // The internal array: Uint8ClampedArray clamps between 0 and 255.
    // (not supported on travis yet... using basic array, be sure not to overflow!)
    var windowLut_ = null;
    if( !window.Uint8ClampedArray ) {
        console.warn("No support for Uint8ClampedArray.");
        windowLut_ = new Uint8Array(rescaleLut_.getLength());
    }
    else windowLut_ = new Uint8ClampedArray(rescaleLut_.getLength());
    // The window center.
    var center_ = null;
    // The window width.
    var width_ = null;
    
    // Get the center.
    this.getCenter = function() { return center_; };
    // Get the width.
    this.getWidth = function() { return width_; };
    // Get the signed flag.
    this.isSigned = function() { return isSigned_; };
    // Set the window center and width.
    this.setCenterAndWidth = function(center, width)
    {
        // store the window values
        center_ = center;
        width_ = width;
        // pre calculate loop values
        var size = windowLut_.length;
        var center0 = isSigned_ ? center - 0.5 + size / 2 : center - 0.5;
        var width0 = width - 1;
        // Uint8ClampedArray clamps between 0 and 255
        var dispval = 0;
        for(var i=0; i<size; ++i)
        {
            // from the DICOM specification (https://www.dabsoft.ch/dicom/3/C.11.2.1.2/)
            // y = ((x - (c - 0.5)) / (w-1) + 0.5) * (ymax - ymin )+ ymin
            dispval = ((rescaleLut_.getValue(i) - center0 ) / width0 + 0.5) * 255;
            windowLut_[i]= parseInt(dispval, 10);
        }
    };
    // Get the length of the LUT array.
    this.getLength = function() { return windowLut_.length; };
    // Get the value of the LUT at the given offset.
    this.getValue = function(offset)
    {
        var shift = isSigned_ ? windowLut_.length / 2 : 0;
        return windowLut_[offset+shift];
    };

};

/**
* Lookup tables for image color display. 
*/

dwv.image.lut.range_max = 256;

dwv.image.lut.buildLut = function(func)
{
    var lut = [];
    for( var i=0; i<dwv.image.lut.range_max; ++i )
        lut.push(func(i));
    return lut;
};

dwv.image.lut.max = function(i)
{
    return dwv.image.lut.range_max-1;
};

dwv.image.lut.maxFirstThird = function(i)
{
    if( i < dwv.image.lut.range_max/3 )
        return dwv.image.lut.range_max-1;
    return 0;
};

dwv.image.lut.maxSecondThird = function(i)
{
    var third = dwv.image.lut.range_max/3;
    if( i >= third && i < 2*third )
        return dwv.image.lut.range_max-1;
    return 0;
};

dwv.image.lut.maxThirdThird = function(i)
{
    if( i >= 2*dwv.image.lut.range_max/3 )
        return dwv.image.lut.range_max-1;
    return 0;
};

dwv.image.lut.toMaxFirstThird = function(i)
{
    var val = i * 3;
    if( val > dwv.image.lut.range_max-1 )
        return dwv.image.lut.range_max-1;
    return val;
};

dwv.image.lut.toMaxSecondThird = function(i)
{
    var third = dwv.image.lut.range_max/3;
    var val = 0;
    if( i >= third ) {
        val = (i-third) * 3;
        if( val > dwv.image.lut.range_max-1 )
            return dwv.image.lut.range_max-1;
    }
    return val;
};

dwv.image.lut.toMaxThirdThird = function(i)
{
    var third = dwv.image.lut.range_max/3;
    var val = 0;
    if( i >= 2*third ) {
        val = (i-2*third) * 3;
        if( val > dwv.image.lut.range_max-1 )
            return dwv.image.lut.range_max-1;
    }
    return val;
};

dwv.image.lut.zero = function(i)
{
    return 0;
};

dwv.image.lut.id = function(i)
{
    return i;
};

dwv.image.lut.invId = function(i)
{
    return (dwv.image.lut.range_max-1)-i;
};

// plain
dwv.image.lut.plain = {
   "red":   dwv.image.lut.buildLut(dwv.image.lut.id),
   "green": dwv.image.lut.buildLut(dwv.image.lut.id),
   "blue":  dwv.image.lut.buildLut(dwv.image.lut.id)
};

// inverse plain
dwv.image.lut.invPlain = {
   "red":   dwv.image.lut.buildLut(dwv.image.lut.invId),
   "green": dwv.image.lut.buildLut(dwv.image.lut.invId),
   "blue":  dwv.image.lut.buildLut(dwv.image.lut.invId)
};

//rainbow 
dwv.image.lut.rainbow = {
   "blue":  [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 144, 148, 152, 156, 160, 164, 168, 172, 176, 180, 184, 188, 192, 196, 200, 204, 208, 212, 216, 220, 224, 228, 232, 236, 240, 244, 248, 252, 255, 247, 239, 231, 223, 215, 207, 199, 191, 183, 175, 167, 159, 151, 143, 135, 127, 119, 111, 103, 95, 87, 79, 71, 63, 55, 47, 39, 31, 23, 15, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   "green": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128, 136, 144, 152, 160, 168, 176, 184, 192, 200, 208, 216, 224, 232, 240, 248, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 253, 251, 249, 247, 245, 243, 241, 239, 237, 235, 233, 231, 229, 227, 225, 223, 221, 219, 217, 215, 213, 211, 209, 207, 205, 203, 201, 199, 197, 195, 193, 192, 189, 186, 183, 180, 177, 174, 171, 168, 165, 162, 159, 156, 153, 150, 147, 144, 141, 138, 135, 132, 129, 126, 123, 120, 117, 114, 111, 108, 105, 102, 99, 96, 93, 90, 87, 84, 81, 78, 75, 72, 69, 66, 63, 60, 57, 54, 51, 48, 45, 42, 39, 36, 33, 30, 27, 24, 21, 18, 15, 12, 9, 6, 3],
   "red":   [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 62, 60, 58, 56, 54, 52, 50, 48, 46, 44, 42, 40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 144, 148, 152, 156, 160, 164, 168, 172, 176, 180, 184, 188, 192, 196, 200, 204, 208, 212, 216, 220, 224, 228, 232, 236, 240, 244, 248, 252, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]
};

// hot
dwv.image.lut.hot = {
   "red":   dwv.image.lut.buildLut(dwv.image.lut.toMaxFirstThird),
   "green": dwv.image.lut.buildLut(dwv.image.lut.toMaxSecondThird),
   "blue":  dwv.image.lut.buildLut(dwv.image.lut.toMaxThirdThird)
};

// test
dwv.image.lut.test = {
   "red":   dwv.image.lut.buildLut(dwv.image.lut.id),
   "green": dwv.image.lut.buildLut(dwv.image.lut.zero),
   "blue":  dwv.image.lut.buildLut(dwv.image.lut.zero)
};

//red
/*dwv.image.lut.red = {
   "red":   dwv.image.lut.buildLut(dwv.image.lut.max),
   "green": dwv.image.lut.buildLut(dwv.image.lut.id),
   "blue":  dwv.image.lut.buildLut(dwv.image.lut.id)
};*/
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Image related.
dwv.image = dwv.image || {};

/**
 * Get data from an input image using a canvas.
 * @param image The image.
 * @param file The corresponding file.
 */
dwv.image.getDataFromImage = function(image)
{
    // draw the image in the canvas in order to get its data
    var canvas = document.getElementById('imageLayer');
    canvas.width = image.width;
    canvas.height = image.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height);
    // get the image data
    var imageData = ctx.getImageData(0, 0, image.width, image.height);
    // remove alpha
    // TODO support passing the full image data
    var buffer = [];
    var j = 0;
    for( var i = 0; i < imageData.data.length; i+=4 ) {
        buffer[j] = imageData.data[i];
        buffer[j+1] = imageData.data[i+1];
        buffer[j+2] = imageData.data[i+2];
        j+=3;
    }
    // create dwv Image
    var imageSize = new dwv.image.Size(image.width, image.height);
    // TODO: wrong info...
    var imageSpacing = new dwv.image.Spacing(1,1);
    var sliceIndex = image.index ? image.index : 0;
    var dwvImage = new dwv.image.Image(imageSize, imageSpacing, buffer, [[0,0,sliceIndex]]);
    dwvImage.setPhotometricInterpretation("RGB");
    // view
    var view = new dwv.image.View(dwvImage);
    view.setWindowLevelMinMax();
    // properties
    var info = {};
    if( image.file )
    {
        info.fileName = { "value": image.file.name };
        info.fileType = { "value": image.file.type };
        info.fileLastModifiedDate = { "value": image.file.lastModifiedDate };
    }
    info.imageWidth = { "value": image.width };
    info.imageHeight = { "value": image.height };
    // return
    return {"view": view, "info": info};
};

/**
 * Get data from an input buffer using a DICOM parser.
 * @param buffer The input data buffer.
 */
dwv.image.getDataFromDicomBuffer = function(buffer)
{
    // DICOM parser
    var dicomParser = new dwv.dicom.DicomParser();
    // parse the buffer
    dicomParser.parse(buffer);
    var view = dicomParser.createImage();
    // return
    return {"view": view, "info": dicomParser.dicomElements};
};

;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Image related.
dwv.image = dwv.image || {};

/**
* @class View class.
* @param image The associated image.
* Need to set the window lookup table once created
* (either directly or with helper methods). 
*/
dwv.image.View = function(image, isSigned)
{
    // rescale lookup table
    var rescaleLut = new dwv.image.lut.Rescale(
        image.getRescaleSlope(), image.getRescaleIntercept() );
    rescaleLut.initialise(image.getMeta().BitsStored);
    // window lookup table
    var windowLut = new dwv.image.lut.Window(rescaleLut, isSigned);
    // window presets
    var windowPresets = null;
    // color map
    var colorMap = dwv.image.lut.plain;
    // current position
    var currentPosition = {"i":0,"j":0,"k":0};
    
    // Get the associated image.
    this.getImage = function() { return image; };
    // Set the associated image.
    this.setImage = function(inImage) { image = inImage; };
    
    // Get the rescale LUT of the image.
    this.getRescaleLut = function() { return rescaleLut; };
    // Set the rescale LUT of the image.
    this.setRescaleLut = function(lut) { rescaleLut = lut; };
    // Get the window LUT of the image.
    this.getWindowLut = function() { return windowLut; };
    // Set the window LUT of the image.
    this.setWindowLut = function(lut) { windowLut = lut; };
    // Get the window presets.
    this.getWindowPresets = function() { return windowPresets; };
    // Set the window presets.
    this.setWindowPresets = function(presets) { 
        windowPresets = presets;
        this.setWindowLevel(presets[0].center, presets[0].width);
    };
    // Get the color map of the image.
    this.getColorMap = function() { return colorMap; };
    // Set the color map of the image.
    this.setColorMap = function(map) { 
        colorMap = map;
        // TODO Better handle this...
        if( this.getImage().getPhotometricInterpretation() === "MONOCHROME1") 
            colorMap = dwv.image.lut.invPlain;
        this.fireEvent({"type": "colorchange", 
            "wc": this.getWindowLut().getCenter(),
            "ww": this.getWindowLut().getWidth() });
    };
    // Is the data signed data.
    this.isSigned = function() { return isSigned; };
    // Get the current position.
    this.getCurrentPosition = function() { return currentPosition; };
    // Set the current position. Returns false if not in bounds.
    this.setCurrentPosition = function(pos) { 
        if( !image.getSize().isInBounds(pos.i,pos.j,pos.k) ) return false;
        var oldPosition = currentPosition;
        currentPosition = pos;
        this.fireEvent({"type": "positionchange", 
            "i": pos.i, "j": pos.j, "k": pos.k,
            "value": image.getRescaledValue(pos.i,pos.j,pos.k)});
        // slice change event (used to trigger redraw)
        if( oldPosition.k !== currentPosition.k ) {
            this.fireEvent({"type": "slicechange"});
        }
        return true;
    };
    
    // view listeners
    var listeners = {};
    // Get the view listeners.
    this.getListeners = function() { return listeners; };
    // Set the view listeners.
    this.setListeners = function(list) { listeners = list; };
};

/**
 * Set the view window/level.
 * @param center The window center.
 * @param width The window width.
 * @warning Uses the latest set rescale LUT or the default linear one.
 */
dwv.image.View.prototype.setWindowLevel = function( center, width )
{
    this.getWindowLut().setCenterAndWidth(center, width);
    this.fireEvent({"type": "wlchange", "wc": center, "ww": width });
};

/**
 * Set the image window/level to cover the full data range.
 * @warning Uses the latest set rescale LUT or the default linear one.
 */
dwv.image.View.prototype.setWindowLevelMinMax = function()
{
    // calculate center and width
    var range = this.getImage().getRescaledDataRange();
    var min = range.min;
    var max = range.max;
    var width = max - min;
    var center = min + width/2;
    // set window level
    this.setWindowLevel(center,width);
};

/**
 * Increment the current slice number.
 * Returns false if not in bounds.
 */
dwv.image.View.prototype.incrementSliceNb = function()
{
    return this.setCurrentPosition({
        "i": this.getCurrentPosition().i,
        "j": this.getCurrentPosition().j,
        "k": this.getCurrentPosition().k + 1 });
};

/**
 * Decrement the current slice number.
 * Returns false if not in bounds.
 */
dwv.image.View.prototype.decrementSliceNb = function()
{
    return this.setCurrentPosition({
        "i": this.getCurrentPosition().i,
        "j": this.getCurrentPosition().j,
        "k": this.getCurrentPosition().k - 1 });
};

/**
 * Clone the image using all meta data and the original data buffer.
 * @returns A full copy of this {dwv.image.Image}.
 */
dwv.image.View.prototype.clone = function()
{
    var copy = new dwv.image.View(this.getImage());
    copy.setRescaleLut(this.getRescaleLut());
    copy.setWindowLut(this.getWindowLut());
    copy.setListeners(this.getListeners());
    return copy;
};

/**
 * Generate display image data to be given to a canvas.
 * @param array The array to fill in.
 * @param sliceNumber The slice position.
 */
dwv.image.View.prototype.generateImageData = function( array )
{        
    var sliceNumber = this.getCurrentPosition().k;
    var image = this.getImage();
    var pxValue = 0;
    var photoInterpretation = image.getPhotometricInterpretation();
    var planarConfig = image.getPlanarConfiguration();
    var windowLut = this.getWindowLut();
    var colorMap = this.getColorMap();
    var index = 0;
    var sliceSize = 0;
    var sliceOffset = 0;
    switch (photoInterpretation) {
        case "MONOCHROME1":
        case "MONOCHROME2":
            sliceSize = image.getSize().getSliceSize();
            sliceOffset = (sliceNumber || 0) * sliceSize;
            var iMax = sliceOffset + sliceSize;
            for(var i=sliceOffset; i < iMax; ++i)
            {        
                pxValue = parseInt( windowLut.getValue( 
                        image.getValueAtOffset(i) ), 10 );
                array.data[index] = colorMap.red[pxValue];
                array.data[index+1] = colorMap.green[pxValue];
                array.data[index+2] = colorMap.blue[pxValue];
                array.data[index+3] = 0xff;
                index += 4;
            }
        break;
        
        case "RGB":
            // the planar configuration defines the memory layout
            if( planarConfig !== 0 && planarConfig !== 1 ) {
                throw new Error("Unsupported planar configuration: "+planarConfig);
            }
            sliceSize = image.getSize().getSliceSize();
            sliceOffset = (sliceNumber || 0) * 3 * sliceSize;
            // default: RGBRGBRGBRGB...
            var posR = sliceOffset;
            var posG = sliceOffset + 1;
            var posB = sliceOffset + 2;
            var stepPos = 3;
            // RRRR...GGGG...BBBB...
            if (planarConfig === 1) { 
                posR = sliceOffset;
                posG = sliceOffset + sliceSize;
                posB = sliceOffset + 2 * sliceSize;
                stepPos = 1;
            }
            
            var redValue = 0;
            var greenValue = 0;
            var blueValue = 0;
            for(var j=0; j < image.getSize().getSliceSize(); ++j)
            {        
                redValue = parseInt( windowLut.getValue( 
                        image.getValueAtOffset(posR) ), 10 );
                greenValue = parseInt( windowLut.getValue( 
                        image.getValueAtOffset(posG) ), 10 );
                blueValue = parseInt( windowLut.getValue( 
                        image.getValueAtOffset(posB) ), 10 );
                
                array.data[index] = redValue;
                array.data[index+1] = greenValue;
                array.data[index+2] = blueValue;
                array.data[index+3] = 0xff;
                index += 4;
                
                posR += stepPos;
                posG += stepPos;
                posB += stepPos;
            }
        break;
        
        default: 
            throw new Error("Unsupported photometric interpretation: "+photoInterpretation);
    }
};

/**
 * Add an event listener on the view.
 * @param type The event type.
 * @param listener The method associated with the provided event type.
 */
dwv.image.View.prototype.addEventListener = function(type, listener)
{
    var listeners = this.getListeners();
    if( !listeners[type] ) listeners[type] = [];
    listeners[type].push(listener);
};

/**
 * Remove an event listener on the view.
 * @param type The event type.
 * @param listener The method associated with the provided event type.
 */
dwv.image.View.prototype.removeEventListener = function(type, listener)
{
    var listeners = this.getListeners();
    if( !listeners[type] ) return;
    for(var i=0; i < listeners[type].length; ++i)
    {   
        if( listeners[type][i] === listener )
            listeners[type].splice(i,1);
    }
};

/**
 * Fire an event: call all associated listeners.
 * @param event The event to fire.
 */
dwv.image.View.prototype.fireEvent = function(event)
{
    var listeners = this.getListeners();
    if( !listeners[event.type] ) return;
    for(var i=0; i < listeners[event.type].length; ++i)
    {   
        listeners[event.type][i](event);
    }
};

;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Math related.
dwv.math = dwv.math || {};

/** 
 * @class Circular Bucket Queue.
 *
 * Returns input'd points in sorted order. All operations run in roughly O(1)
 * time (for input with small cost values), but it has a strict requirement:
 *
 * If the most recent point had a cost of c, any points added should have a cost
 * c' in the range c <= c' <= c + (capacity - 1).
 * 
 * @input bits
 * @input cost_functor
 */
dwv.math.BucketQueue = function(bits, cost_functor)
{
	this.bucketCount = 1 << bits; // # of buckets = 2^bits
	this.mask = this.bucketCount - 1; // 2^bits - 1 = index mask
	this.size = 0;
	
	this.loc = 0; // Current index in bucket list
	
	// Cost defaults to item value
	this.cost = (typeof(cost_functor) !== 'undefined') ? cost_functor : function(item) {
		return item;
	};
	
	this.buckets = this.buildArray(this.bucketCount);
};

dwv.math.BucketQueue.prototype.push = function(item) {
	// Prepend item to the list in the appropriate bucket
	var bucket = this.getBucket(item);
	item.next = this.buckets[bucket];
	this.buckets[bucket] = item;
	
	this.size++;
};

dwv.math.BucketQueue.prototype.pop = function() {
	if ( this.size === 0 ) {
		throw new Error("Cannot pop, bucketQueue is empty.");
	}
	
	// Find first empty bucket
	while ( this.buckets[this.loc] === null ) {
        this.loc = (this.loc + 1) % this.bucketCount;
	}
	
	// All items in bucket have same cost, return the first one
	var ret = this.buckets[this.loc];
	this.buckets[this.loc] = ret.next;
	ret.next = null;
	
	this.size--;
	return ret;
};

dwv.math.BucketQueue.prototype.remove = function(item) {
	// Tries to remove item from queue. Returns true on success, false otherwise
	if ( !item ) {
		return false;
	}
	
	// To find node, go to bucket and search through unsorted list.
	var bucket = this.getBucket(item);
	var node = this.buckets[bucket];
	
	while ( node !== null && !item.equals(node.next) ) {
		node = node.next;
	}
	
	if ( node === null ) {
		// Item not in list, ergo item not in queue
		return false;
	} 
	else {
		// Found item, do standard list node deletion
		node.next = node.next.next;
		
		this.size--;
		return true;
	}
};

dwv.math.BucketQueue.prototype.isEmpty = function() {
	return this.size === 0;
};

dwv.math.BucketQueue.prototype.getBucket = function(item) {
	// Bucket index is the masked cost
	return this.cost(item) & this.mask;
};

dwv.math.BucketQueue.prototype.buildArray = function(newSize) {
	// Create array and initialze pointers to null
	var buckets = [];
	buckets.length = newSize;
	
	for ( var i = 0; i < buckets.length; i++ ) {
		buckets[i] = null;
	}
	
	return buckets;
};
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
// @namespace Math related.
dwv.math = dwv.math || {};

// Pre-created to reduce allocation in inner loops
var __twothirdpi = ( 2 / (3 * Math.PI) );

/**
 * 
 */
dwv.math.computeGreyscale = function(data, width, height) {
	// Returns 2D augmented array containing greyscale data
	// Greyscale values found by averaging color channels
	// Input should be in a flat RGBA array, with values between 0 and 255
	var greyscale = [];

	// Compute actual values
	for (var y = 0; y < height; y++) {
		greyscale[y] = [];

		for (var x = 0; x < width; x++) {
			var p = (y*width + x)*4;
			greyscale[y][x] = (data[p] + data[p+1] + data[p+2]) / (3*255);
		}
	}

	// Augment with convenience functions
	greyscale.dx = function(x,y) {
		if ( x+1 === this[y].length ) {
			// If we're at the end, back up one
			x--;
		}
		return this[y][x+1] - this[y][x];
	};

	greyscale.dy = function(x,y) {
		if ( y+1 === this.length ) {
			// If we're at the end, back up one
			y--;
		}
		return this[y][x] - this[y+1][x];
	};

	greyscale.gradMagnitude = function(x,y) {
		var dx = this.dx(x,y); var dy = this.dy(x,y);
		return Math.sqrt(dx*dx + dy*dy);
	};

	greyscale.laplace = function(x,y) { 
		// Laplacian of Gaussian
		var lap = -16 * this[y][x];
		lap += this[y-2][x];
		lap += this[y-1][x-1] + 2*this[y-1][x] + this[y-1][x+1];
		lap += this[y][x-2]   + 2*this[y][x-1] + 2*this[y][x+1] + this[y][x+2];
		lap += this[y+1][x-1] + 2*this[y+1][x] + this[y+1][x+1];
		lap += this[y+2][x];

		return lap;
	};

	return greyscale;
};

/**
 * 
 */
dwv.math.computeGradient = function(greyscale) {
	// Returns a 2D array of gradient magnitude values for greyscale. The values
	// are scaled between 0 and 1, and then flipped, so that it works as a cost
	// function.
	var gradient = [];

	max = 0; // Maximum gradient found, for scaling purposes

	var x = 0;
	var y = 0;
	
	for (y = 0; y < greyscale.length-1; y++) {
		gradient[y] = [];

		for (x = 0; x < greyscale[y].length-1; x++) {
			gradient[y][x] = greyscale.gradMagnitude(x,y);
			max = Math.max(gradient[y][x], max);
		}

		gradient[y][greyscale[y].length-1] = gradient[y][greyscale.length-2];
	}

	gradient[greyscale.length-1] = [];
	for (var i = 0; i < gradient[0].length; i++) {
		gradient[greyscale.length-1][i] = gradient[greyscale.length-2][i];
	}

	// Flip and scale.
	for (y = 0; y < gradient.length; y++) {
		for (x = 0; x < gradient[y].length; x++) {
			gradient[y][x] = 1 - (gradient[y][x] / max);
		}
	}

	return gradient;
};

/**
 * 
 */
dwv.math.computeLaplace = function(greyscale) {
	// Returns a 2D array of Laplacian of Gaussian values
	var laplace = [];

	// Make the edges low cost here.

	laplace[0] = [];
	laplace[1] = [];
	for (var i = 1; i < greyscale.length; i++) {
		// Pad top, since we can't compute Laplacian
		laplace[0][i] = 1;
		laplace[1][i] = 1;
	}

	for (var y = 2; y < greyscale.length-2; y++) {
		laplace[y] = [];
		// Pad left, ditto
		laplace[y][0] = 1;
		laplace[y][1] = 1;

		for (var x = 2; x < greyscale[y].length-2; x++) {
			// Threshold needed to get rid of clutter.
			laplace[y][x] = (greyscale.laplace(x,y) > 0.33) ? 0 : 1;
		}

		// Pad right, ditto
		laplace[y][greyscale[y].length-2] = 1;
		laplace[y][greyscale[y].length-1] = 1;
	}
	
	laplace[greyscale.length-2] = [];
	laplace[greyscale.length-1] = [];
	for (var j = 1; j < greyscale.length; j++) {
		// Pad bottom, ditto
		laplace[greyscale.length-2][j] = 1;
		laplace[greyscale.length-1][j] = 1;
	}

	return laplace;
};

dwv.math.computeGradX = function(greyscale) {
	// Returns 2D array of x-gradient values for greyscale
	var gradX = [];

	for ( var y = 0; y < greyscale.length; y++ ) {
		gradX[y] = [];

		for ( var x = 0; x < greyscale[y].length-1; x++ ) {
			gradX[y][x] = greyscale.dx(x,y);
		}

		gradX[y][greyscale[y].length-1] = gradX[y][greyscale[y].length-2];
	}

	return gradX;
};

dwv.math.computeGradY = function(greyscale) {
	// Returns 2D array of y-gradient values for greyscale
	var gradY = [];

	for (var y = 0; y < greyscale.length-1; y++) {
		gradY[y] = [];

		for ( var x = 0; x < greyscale[y].length; x++ ) {
			gradY[y][x] = greyscale.dy(x,y);
		}
	}

	gradY[greyscale.length-1] = [];
	for ( var i = 0; i < greyscale[0].length; i++ ) {
		gradY[greyscale.length-1][i] = gradY[greyscale.length-2][i];
	}

	return gradY;
};

dwv.math.gradUnitVector = function(gradX, gradY, px, py, out) {
	// Returns the gradient vector at (px,py), scaled to a magnitude of 1
	var ox = gradX[py][px]; 
	var oy = gradY[py][px];

	var gvm = Math.sqrt(ox*ox + oy*oy);
	gvm = Math.max(gvm, 1e-100); // To avoid possible divide-by-0 errors

	out.x = ox / gvm;
	out.y = oy / gvm;
};

dwv.math.gradDirection = function(gradX, gradY, px, py, qx, qy) {
    var __dgpuv = new dwv.math.FastPoint2D(-1, -1); 
    var __gdquv = new dwv.math.FastPoint2D(-1, -1);
	// Compute the gradiant direction, in radians, between to points
    dwv.math.gradUnitVector(gradX, gradY, px, py, __dgpuv);
    dwv.math.gradUnitVector(gradX, gradY, qx, qy, __gdquv);

	var dp = __dgpuv.y * (qx - px) - __dgpuv.x * (qy - py);
	var dq = __gdquv.y * (qx - px) - __gdquv.x * (qy - py);

	// Make sure dp is positive, to keep things consistant
	if (dp < 0) {
		dp = -dp; dq = -dq;
	}

	if ( px !== qx && py !== qy ) {
		// We're going diagonally between pixels
		dp *= Math.SQRT1_2;
		dq *= Math.SQRT1_2;
	}

	return __twothirdpi * (Math.acos(dp) + Math.acos(dq));
};

dwv.math.computeSides = function(dist, gradX, gradY, greyscale) {
	// Returns 2 2D arrays, containing inside and outside greyscale values.
	// These greyscale values are the intensity just a little bit along the
	// gradient vector, in either direction, from the supplied point. These
	// values are used when using active-learning Intelligent Scissors
	
	var sides = {};
	sides.inside = [];
	sides.outside = [];

	var guv = new dwv.math.FastPoint2D(-1, -1); // Current gradient unit vector

	for ( var y = 0; y < gradX.length; y++ ) {
		sides.inside[y] = [];
		sides.outside[y] = [];

		for ( var x = 0; x < gradX[y].length; x++ ) {
            dwv.math.gradUnitVector(gradX, gradY, x, y, guv);

			//(x, y) rotated 90 = (y, -x)

			var ix = Math.round(x + dist*guv.y);
			var iy = Math.round(y - dist*guv.x);
			var ox = Math.round(x - dist*guv.y);
			var oy = Math.round(y + dist*guv.x);

			ix = Math.max(Math.min(ix, gradX[y].length-1), 0);
			ox = Math.max(Math.min(ox, gradX[y].length-1), 0);
			iy = Math.max(Math.min(iy, gradX.length-1), 0);
			oy = Math.max(Math.min(oy, gradX.length-1), 0);

			sides.inside[y][x] = greyscale[iy][ix];
			sides.outside[y][x] = greyscale[oy][ox];
		}
	}

	return sides;
};

dwv.math.gaussianBlur = function(buffer, out) {
    // Smooth values over to fill in gaps in the mapping
    out[0] = 0.4*buffer[0] + 0.5*buffer[1] + 0.1*buffer[1];
    out[1] = 0.25*buffer[0] + 0.4*buffer[1] + 0.25*buffer[2] + 0.1*buffer[3];

    for ( var i = 2; i < buffer.length-2; i++ ) {
        out[i] = 0.05*buffer[i-2] + 0.25*buffer[i-1] + 0.4*buffer[i] + 0.25*buffer[i+1] + 0.05*buffer[i+2];
    }

    len = buffer.length;
    out[len-2] = 0.25*buffer[len-1] + 0.4*buffer[len-2] + 0.25*buffer[len-3] + 0.1*buffer[len-4];
    out[len-1] = 0.4*buffer[len-1] + 0.5*buffer[len-2] + 0.1*buffer[len-3];
};


/**
 * @class Scissors.
 * 
 * Ref: Eric N. Mortensen, William A. Barrett, Interactive Segmentation with
 *   Intelligent Scissors, Graphical Models and Image Processing, Volume 60,
 *   Issue 5, September 1998, Pages 349-384, ISSN 1077-3169,
 *   DOI: 10.1006/gmip.1998.0480.
 * 
 * (http://www.sciencedirect.com/science/article/B6WG4-45JB8WN-9/2/6fe59d8089fd1892c2bfb82283065579)
 * 
 * Highly inspired from http://code.google.com/p/livewire-javascript/
 */
dwv.math.Scissors = function()
{
	this.width = -1;
	this.height = -1;

	this.curPoint = null; // Corrent point we're searching on.
	this.searchGranBits = 8; // Bits of resolution for BucketQueue.
	this.searchGran = 1 << this.earchGranBits; //bits.
	this.pointsPerPost = 500;

	// Precomputed image data. All in ranges 0 >= x >= 1 and all inverted (1 - x).
	this.greyscale = null; // Greyscale of image
	this.laplace = null; // Laplace zero-crossings (either 0 or 1).
	this.gradient = null; // Gradient magnitudes.
	this.gradX = null; // X-differences.
	this.gradY = null; // Y-differences.

	this.parents = null; // Matrix mapping point => parent along shortest-path to root.

	this.working = false; // Currently computing shortest paths?

	// Begin Training:
	this.trained = false;
	this.trainingPoints = null;

	this.edgeWidth = 2;
	this.trainingLength = 32;

	this.edgeGran = 256;
	this.edgeTraining = null;

	this.gradPointsNeeded = 32;
	this.gradGran = 1024;
	this.gradTraining = null;

	this.insideGran = 256;
	this.insideTraining = null;

	this.outsideGran = 256;
	this.outsideTraining = null;
	// End Training
}; // Scissors class

// Begin training methods //
dwv.math.Scissors.prototype.getTrainingIdx = function(granularity, value) {
	return Math.round((granularity - 1) * value);
};

dwv.math.Scissors.prototype.getTrainedEdge = function(edge) {
	return this.edgeTraining[this.getTrainingIdx(this.edgeGran, edge)];
};

dwv.math.Scissors.prototype.getTrainedGrad = function(grad) {
	return this.gradTraining[this.getTrainingIdx(this.gradGran, grad)];
};

dwv.math.Scissors.prototype.getTrainedInside = function(inside) {
	return this.insideTraining[this.getTrainingIdx(this.insideGran, inside)];
};

dwv.math.Scissors.prototype.getTrainedOutside = function(outside) {
	return this.outsideTraining[this.getTrainingIdx(this.outsideGran, outside)];
};
// End training methods //

dwv.math.Scissors.prototype.setWorking = function(working) {
    // Sets working flag
    this.working = working;
};

dwv.math.Scissors.prototype.setDimensions = function(width, height) {
	this.width = width;
	this.height = height;
};

dwv.math.Scissors.prototype.setData = function(data) {
	if ( this.width === -1 || this.height === -1 ) {
		// The width and height should have already been set
		throw new Error("Dimensions have not been set.");
	}

	this.greyscale = dwv.math.computeGreyscale(data, this.width, this.height);
	this.laplace = dwv.math.computeLaplace(this.greyscale);
	this.gradient = dwv.math.computeGradient(this.greyscale);
	this.gradX = dwv.math.computeGradX(this.greyscale);
	this.gradY = dwv.math.computeGradY(this.greyscale);
	
	var sides = dwv.math.computeSides(this.edgeWidth, this.gradX, this.gradY, this.greyscale);
	this.inside = sides.inside;
	this.outside = sides.outside;
	this.edgeTraining = [];
	this.gradTraining = [];
	this.insideTraining = [];
	this.outsideTraining = [];
};

dwv.math.Scissors.prototype.findTrainingPoints = function(p) {
	// Grab the last handful of points for training
	var points = [];

	if ( this.parents !== null ) {
		for ( var i = 0; i < this.trainingLength && p; i++ ) {
			points.push(p);
			p = this.parents[p.y][p.x];
		}
	}

	return points;
};

dwv.math.Scissors.prototype.resetTraining = function() {
	this.trained = false; // Training is ignored with this flag set
};

dwv.math.Scissors.prototype.doTraining = function(p) {
	// Compute training weights and measures
	this.trainingPoints = this.findTrainingPoints(p);

	if ( this.trainingPoints.length < 8 ) {
		return; // Not enough points, I think. It might crash if length = 0.
	}

	var buffer = [];
	this.calculateTraining(buffer, this.edgeGran, this.greyscale, this.edgeTraining);
	this.calculateTraining(buffer, this.gradGran, this.gradient, this.gradTraining);
	this.calculateTraining(buffer, this.insideGran, this.inside, this.insideTraining);
	this.calculateTraining(buffer, this.outsideGran, this.outside, this.outsideTraining);

	if ( this.trainingPoints.length < this.gradPointsNeeded ) {
		// If we have two few training points, the gradient weight map might not
		// be smooth enough, so average with normal weights.
		this.addInStaticGrad(this.trainingPoints.length, this.gradPointsNeeded);
	}

	this.trained = true;
};

dwv.math.Scissors.prototype.calculateTraining = function(buffer, granularity, input, output) {
	var i = 0;
    // Build a map of raw-weights to trained-weights by favoring input values
	buffer.length = granularity;
	for ( i = 0; i < granularity; i++ ) {
		buffer[i] = 0;
	}

	var maxVal = 1;
	for ( i = 0; i < this.trainingPoints.length; i++ ) {
		var p = this.trainingPoints[i];
		var idx = this.getTrainingIdx(granularity, input[p.y][p.x]);
		buffer[idx] += 1;

		maxVal = Math.max(maxVal, buffer[idx]);
	}

	// Invert and scale.
	for ( i = 0; i < granularity; i++ ) {
		buffer[i] = 1 - buffer[i] / maxVal;
	}

	// Blur it, as suggested. Gets rid of static.
	dwv.math.gaussianBlur(buffer, output);
};

dwv.math.Scissors.prototype.addInStaticGrad = function(have, need) {
	// Average gradient raw-weights to trained-weights map with standard weight
	// map so that we don't end up with something to spiky
	for ( var i = 0; i < this.gradGran; i++ ) {
		this.gradTraining[i] = Math.min(this.gradTraining[i],  1 - i*(need - have)/(need*this.gradGran));
	}
};

dwv.math.Scissors.prototype.gradDirection = function(px, py, qx, qy) {
	return dwv.math.gradDirection(this.gradX, this.gradY, px, py, qx, qy);
};

dwv.math.Scissors.prototype.dist = function(px, py, qx, qy) {
	// The grand culmunation of most of the code: the weighted distance function
	var grad =  this.gradient[qy][qx];

	if ( px === qx || py === qy ) {
		// The distance is Euclidean-ish; non-diagonal edges should be shorter
		grad *= Math.SQRT1_2;
	}

	var lap = this.laplace[qy][qx];
	var dir = this.gradDirection(px, py, qx, qy);

	if ( this.trained ) {
		// Apply training magic
		var gradT = this.getTrainedGrad(grad);
		var edgeT = this.getTrainedEdge(this.greyscale[py][px]);
		var insideT = this.getTrainedInside(this.inside[py][px]);
		var outsideT = this.getTrainedOutside(this.outside[py][px]);

		return 0.3*gradT + 0.3*lap + 0.1*(dir + edgeT + insideT + outsideT);
	} else {
		// Normal weights
		return 0.43*grad + 0.43*lap + 0.11*dir;
	}
};

dwv.math.Scissors.prototype.adj = function(p) {
	var list = [];

	var sx = Math.max(p.x-1, 0);
	var sy = Math.max(p.y-1, 0);
	var ex = Math.min(p.x+1, this.greyscale[0].length-1);
	var ey = Math.min(p.y+1, this.greyscale.length-1);

	var idx = 0;
	for ( var y = sy; y <= ey; y++ ) {
		for ( var x = sx; x <= ex; x++ ) {
			if ( x !== p.x || y !== p.y ) {
				list[idx++] = new dwv.math.FastPoint2D(x,y);
			}
		}
	}

	return list;
};

dwv.math.Scissors.prototype.setPoint = function(sp) {
	this.setWorking(true);

	this.curPoint = sp;
	
	var x = 0;
	var y = 0;

	this.visited = [];
	for ( y = 0; y < this.height; y++ ) {
		this.visited[y] = [];
		for ( x = 0; x < this.width; x++ ) {
			this.visited[y][x] = false;
		}
	}

	this.parents = [];
	for ( y = 0; y < this.height; y++ ) {
		this.parents[y] = [];
	}

	this.cost = [];
	for ( y = 0; y < this.height; y++ ) {
		this.cost[y] = [];
		for ( x = 0; x < this.width; x++ ) {
			this.cost[y][x] = Number.MAX_VALUE;
		}
	}

	this.pq = new dwv.math.BucketQueue(this.searchGranBits, function(p) {
		return Math.round(this.searchGran * this.costArr[p.y][p.x]);
	});
	this.pq.searchGran = this.searchGran;
	this.pq.costArr = this.cost;

	this.pq.push(sp);
	this.cost[sp.y][sp.x] = 0;
};

dwv.math.Scissors.prototype.doWork = function() {
	if ( !this.working ) {
		return;
	}

	this.timeout = null;

	var pointCount = 0;
	var newPoints = [];
	while ( !this.pq.isEmpty() && pointCount < this.pointsPerPost ) {
		var p = this.pq.pop();
		newPoints.push(p);
		newPoints.push(this.parents[p.y][p.x]);

		this.visited[p.y][p.x] = true;

		var adjList = this.adj(p);
		for ( var i = 0; i < adjList.length; i++) {
			var q = adjList[i];

			var pqCost = this.cost[p.y][p.x] + this.dist(p.x, p.y, q.x, q.y);

			if ( pqCost < this.cost[q.y][q.x] ) {
				if ( this.cost[q.y][q.x] !== Number.MAX_VALUE ) {
					// Already in PQ, must remove it so we can re-add it.
					this.pq.remove(q);
				}

				this.cost[q.y][q.x] = pqCost;
				this.parents[q.y][q.x] = p;
				this.pq.push(q);
			}
		}

		pointCount++;
	}

	return newPoints;
};
;//! @module Main DWV namespace.
var dwv = dwv || {};
//! @module Math related.
dwv.math = dwv.math || {};

/**
 * shapes.js
 * Definition of basic shapes.
 */

/**
 * @class 2D point. Immutable.
 * @param x The X coordinate for the point.
 * @param y The Y coordinate for the point.
 */
dwv.math.Point2D = function(x,y)
{
    // Get the X position of the point.
    this.getX = function() { return x; };
    // Get the Y position of the point.
    this.getY = function() { return y; };
}; // Point2D class

/**
 * Check for Point2D equality.
 * @param other The other Point2D to compare to.
 * @return True if both points are equal.
 */ 
dwv.math.Point2D.prototype.equals = function(other) {
    if( !other ) { 
        return false;
    }
    return ( this.getX() === other.getX() && this.getY() === other.getY() );
};

/**
 * Get a string representation of the Point2D.
 * @return The Point2D as string.
 */ 
dwv.math.Point2D.prototype.toString = function() {
    return "(" + this.getX() + ", " + this.getY() + ")";
};

/**
 * @class Fast 2D point since it's mutable!
 * @param x The X coordinate for the point.
 * @param y The Y coordinate for the point.
 */
dwv.math.FastPoint2D = function(x,y)
{
    this.x = x;
    this.y = y;
}; // FastPoint2D class

/**
 * Check for FastPoint2D equality.
 * @param other The other FastPoint2D to compare to.
 * @return True if both points are equal.
 */ 
dwv.math.FastPoint2D.prototype.equals = function(other) {
    if( !other ) { 
        return false;
    }
    return ( this.x === other.x && this.y === other.y );
};

/**
 * Get a string representation of the FastPoint2D.
 * @return The Point2D as string.
 */ 
dwv.math.FastPoint2D.prototype.toString = function() {
    return "(" + this.x + ", " + this.y + ")";
};

/**
 * @class Circle shape.
 * @param centre A Point2D representing the centre of the circle.
 * @param radius The radius of the circle.
 */
dwv.math.Circle = function(centre, radius)
{
    // Cache the surface
    var surface = Math.PI*radius*radius;

    // Get the centre of the circle.
    this.getCenter = function() { return centre; };
    // Get the radius of the circle.
    this.getRadius = function() { return radius; };
    // Get the surface of the circle.
    this.getSurface = function() { return surface; };
    // Get the surface of the circle with a spacing.
    this.getWorldSurface = function(spacingX, spacingY)
    {
        return surface * spacingX * spacingY;
    };
}; // Circle class

/**
 * @class Line shape.
 * @param begin A Point2D representing the beginning of the line.
 * @param end A Point2D representing the end of the line.
 */
dwv.math.Line = function(begin, end)
{
    // cache the length
    var length = Math.sqrt(
            Math.abs(end.getX() - begin.getX()) * Math.abs(end.getX() - begin.getX()) +
            Math.abs(end.getY() - begin.getY()) * Math.abs(end.getY() - begin.getY() ) );
    
    // Get the begin point of the line.
    this.getBegin = function() { return begin; };
    // Get the end point of the line.
    this.getEnd = function() { return end; };
    // Get the length of the line.
    this.getLength = function() { return length; };
    // Get the length of the line with a spacing.
    this.getWorldLength = function(spacingX, spacingY)
    {
        var lx = Math.abs(end.getX() - begin.getX()) * spacingX;
        var ly = Math.abs(end.getY() - begin.getY()) * spacingY;
        return Math.sqrt( lx * lx + ly * ly );
    };
    // Get the mid point of the line.
    this.getMidpoint = function()
    {
        return new dwv.math.Point2D( 
            parseInt( (begin.getX()+end.getX()) / 2, 10 ), 
            parseInt( (begin.getY()+end.getY()) / 2, 10 ) );
    };
}; // Line class

/**
 * @class Rectangle shape.
 * @param begin A Point2D representing the beginning of the rectangle.
 * @param end A Point2D representing the end of the rectangle.
 */
dwv.math.Rectangle = function(begin, end)
{
    // cache the length
    var surface = Math.abs(end.getX() - begin.getX()) * Math.abs(end.getY() - begin.getY() );

    // Get the begin point of the rectangle.
    this.getBegin = function() { return begin; };
    // Get the end point of the rectangle.
    this.getEnd = function() { return end; };
    // Get the real width of the rectangle.
    this.getRealWidth = function() { return end.getX() - begin.getX(); };
    // Get the real height of the rectangle.
    this.getRealHeight = function() { return end.getY() - begin.getY(); };
    // Get the width of the rectangle.
    this.getWidth = function() { return Math.abs(this.getRealWidth()); };
    // Get the height of the rectangle.
    this.getHeight = function() { return Math.abs(this.getRealHeight()); };
    // Get the surface of the rectangle.
    this.getSurface = function() { return surface; };
    // Get the surface of the rectangle with a spacing.
    this.getWorldSurface = function(spacingX, spacingY)
    {
        return surface * spacingX * spacingY;
    };
}; // Rectangle class

/**
 * @class Region Of Interest shape.
 * Note: should be a closed path.
 */
dwv.math.ROI = function()
{
    // list of points.
    var points = [];
    
    /**
     * Get a point of the list.
     * @param index The index of the point to get (beware, no size check).
     * @return The Point2D at the given index.
     */ 
    this.getPoint = function(index) { return points[index]; };
    // Get the length of the list
    this.getLength = function() { return points.length; };
    /**
     * Add a point to the ROI.
     * @param point The Point2D to add.
     */
    this.addPoint = function(point) { points.push(point); };
    /**
     * Add points to the ROI.
     * @param rhs The array of POints2D to add.
     */
    this.addPoints = function(rhs) { points=points.concat(rhs);};
}; // ROI class

/**
 * @class Path shape.
 * @param points The list of Point2D that make the path (optional).
 * @param points The list of control point of path, as indexes (optional).
 * Note: first and last point do not need to be equal.
 */
dwv.math.Path = function(inputPointArray, inputControlPointIndexArray)
{
    // list of points.
    this.pointArray = inputPointArray ? inputPointArray.slice() : [];
    // list of control points
    this.controlPointIndexArray = inputControlPointIndexArray ? inputControlPointIndexArray.slice() : [];
}; // Path class

/**
 * Get a point of the list.
 * @param index The index of the point to get (beware, no size check).
 * @return The Point2D at the given index.
 */ 
dwv.math.Path.prototype.getPoint = function(index) {
    return this.pointArray[index];
};

/**
 * Is is a control point.
 * @param point The Point2D to check.
 * @return True if a control point.
 */ 
dwv.math.Path.prototype.isControlPoint = function(point) {
    var index = this.pointArray.indexOf(point);
    if( index !== -1 ) {
        return this.controlPointIndexArray.indexOf(index) !== -1;
    }
    else {
        throw Error("Error: isControlPoint called with not in list point.");
    }
};

/**
 * Get the length of the path.
 */ 
dwv.math.Path.prototype.getLength = function() { 
    return this.pointArray.length;
};

/**
 * Add a point to the path.
 * @param point The Point2D to add.
 */
dwv.math.Path.prototype.addPoint = function(point) {
    this.pointArray.push(point);
};

/**
 * Add a control point to the path.
 * @param point The Point2D to make a control point.
 */
dwv.math.Path.prototype.addControlPoint = function(point) {
    var index = this.pointArray.indexOf(point);
    if( index !== -1 ) {
        this.controlPointIndexArray.push(index);
    }
    else {
        throw Error("Error: addControlPoint called with no point in list point.");
    }
};

/**
 * Add points to the path.
 * @param points The list of Point2D to add.
 */
dwv.math.Path.prototype.addPoints = function(newPointArray) { 
    this.pointArray = this.pointArray.concat(newPointArray);
};

/**
 * Append a Path to this one.
 * @param other The Path to append.
 */
dwv.math.Path.prototype.appenPath = function(other) {
    var oldSize = this.pointArray.length;
    this.pointArray = this.pointArray.concat(other.pointArray);
    var indexArray = [];
    for( var i=0; i < other.controlPointIndexArray.length; ++i ) {
        indexArray[i] = other.controlPointIndexArray[i] + oldSize;
    }
    this.controlPointIndexArray = this.controlPointIndexArray.concat(indexArray);
};
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Tool classes.
dwv.tool = dwv.tool || {};

/**
 * @class Draw circle command.
 * @param points The points from which to extract the circle.
 * @param app The application to draw the circle on.
 * @param style The drawing style.
 */
dwv.tool.DrawCircleCommand = function(points, app, style)
{
    // radius
    var a = Math.abs(points[0].getX() - points[points.length-1].getX());
    var b = Math.abs(points[0].getY() - points[points.length-1].getY());
    var radius = Math.round( Math.sqrt( a * a + b * b ) );
    // check zero radius
    if( radius === 0 )
    {
        // silent fail...
        return;
    }
    // create circle
    var circle = new dwv.math.Circle(points[0], radius);
    var lineColor = style.getLineColor();
    var context = app.getTempLayer().getContext();
    
    // command name
    var name = "DrawCircleCommand";
    this.setName = function(str) { name = str; };
    this.getName = function() { return name; };

    // main method
    this.execute = function()
    {
        // style
        context.fillStyle = lineColor;
        context.strokeStyle = lineColor;
        // path
        context.beginPath();
        context.arc(
                circle.getCenter().getX(), 
                circle.getCenter().getY(), 
                circle.getRadius(),
                0, 2*Math.PI);
        context.stroke();
        // surface
        var surf = circle.getWorldSurface( 
            app.getImage().getSpacing().getColumnSpacing(), 
            app.getImage().getSpacing().getRowSpacing() );
        context.font = style.getFontStr();
        context.fillText( Math.round(surf) + "mm2",
                circle.getCenter().getX() + style.getFontSize(),
                circle.getCenter().getY() + style.getFontSize());
    };
}; // DrawCircleCommand class

//Shape list
dwv.tool.shapes = dwv.tool.shapes || {};
//Add the shape command to the list
dwv.tool.shapes.circle = dwv.tool.DrawCircleCommand;
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Tool classes.
dwv.tool = dwv.tool || {};

//! List of colors
dwv.tool.colors = [
    "Yellow", "Red", "White", "Green", "Blue", "Lime", "Fuchsia", "Black"
];

//shape list: to be completed after each tool definition 
dwv.tool.shapes = dwv.tool.shapes || {};

/**
* @class Drawing tool.
*/
dwv.tool.Draw = function(app)
{
    var self = this;
    // start drawing flag
    var started = false;
    // draw command
    var command = null;
    // draw style
    this.style = new dwv.html.Style();
    // shape name
    this.shapeName = 0;
    // list of points
    var points = [];

    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        started = true;
        // clear array
        points = [];
        // store point
        points.push(new dwv.math.Point2D(ev._x, ev._y));
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!started)
        {
            return;
        }
        if( ev._x !== points[0].getX() &&
            ev._y !== points[0].getY() )
        {
            // current point
            points.push(new dwv.math.Point2D(ev._x, ev._y));
            // create draw command
            command = new dwv.tool.shapes[self.shapeName](points, app, self.style);
            // clear the temporary layer
            app.getTempLayer().clearContextRect();
            // draw
            command.execute();
        }
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (started)
        {
            // save command in undo stack
            app.getUndoStack().add(command);
            // merge temporary layer
            app.getDrawLayer().merge(app.getTempLayer());
            // set flag
            started = false;
        }
    };
    
    this.mouseout = function(ev){
        self.mouseup(ev);
    };

    this.touchstart = function(ev){
        self.mousedown(ev);
    };

    this.touchmove = function(ev){
        self.mousemove(ev);
    };

    this.touchend = function(ev){
        self.mouseup(ev);
    };

   // Enable the draw tool
    this.enable = function(value){
        if( value ) {
            this.init();
            dwv.gui.appendDrawHtml();
        }
        else { 
            dwv.gui.clearDrawHtml();
        }
    };
    
    // Handle key down event
    this.keydown = function(event){
        app.handleKeyDown(event);
    };

}; // Draw class

// Set the line color of the drawing
dwv.tool.Draw.prototype.setLineColour = function(colour)
{
    // set style var
    this.style.setLineColor(colour);
};

// Set the shape name of the drawing
dwv.tool.Draw.prototype.setShapeName = function(name)
{
    // check if we have it
    if( !this.hasShape(name) )
    {
        throw new Error("Unknown shape: '" + name + "'");
    }
    this.shapeName = name;
};

dwv.tool.Draw.prototype.hasShape = function(name) {
    return dwv.tool.shapes[name];
};

dwv.tool.Draw.prototype.init = function() {
    // set the default to the first in the list
    var shapeName = 0;
    for( var key in dwv.tool.shapes ){
        shapeName = key;
        break;
    }
    this.setShapeName(shapeName);
    // same for color
    this.setLineColour(dwv.tool.colors[0]);
};

//Tool list
dwv.tool.tools = dwv.tool.tools || {};
//Add the tool to the list
dwv.tool.tools.draw = dwv.tool.Draw;
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Tool classes.
dwv.tool = dwv.tool || {};

//filter list: to be completed after each tool definition 
dwv.tool.filters = dwv.tool.filters || {};

/**
* @class Filter tool.
*/
dwv.tool.Filter = function(app)
{
    this.selectedFilter = 0;
    this.defaultFilterName = 0;
};

dwv.tool.Filter.prototype.enable = function(bool)
{
    if( bool ) {
        dwv.gui.appendFilterHtml();
        this.init();
    }
    else {
        if( this.selectedFilter )
        {
            this.selectedFilter.enable(false);
        }
        dwv.gui.clearFilterHtml();
    }
};

dwv.tool.Filter.prototype.getSelectedFilter = function() {
    return this.selectedFilter;
};

dwv.tool.Filter.prototype.setSelectedFilter = function(name) {
    // check if we have it
    if( !this.hasFilter(name) )
    {
        throw new Error("Unknown filter: '" + name + "'");
    }
    // disable last selected
    if( this.selectedFilter )
    {
        this.selectedFilter.enable(false);
    }
    // enable new one
    this.selectedFilter = new dwv.tool.filters[name](app);
    this.selectedFilter.enable(true);
};

dwv.tool.Filter.prototype.hasFilter = function(name) {
    return dwv.tool.filters[name];
};

dwv.tool.Filter.prototype.init = function()
{
    // set the default to the first in the list
    for( var key in dwv.tool.filters ){
        this.defaultFilterName = key;
        break;
    }
    this.setSelectedFilter(this.defaultFilterName);
};

dwv.tool.Filter.prototype.keydown = function(event){
    app.handleKeyDown(event);
};

/**
 * @namespace Filter classes.
 */
dwv.tool.filter = dwv.tool.filter || {};

/**
* @class Threshold filter tool.
*/
dwv.tool.filter.Threshold = function(app) {};

dwv.tool.filter.Threshold.prototype.enable = function(value)
{
    if( value ) {
        dwv.gui.filter.appendThresholdHtml();
    }
    else { 
        dwv.gui.filter.clearThresholdHtml();
    }
};

dwv.tool.filter.Threshold.prototype.run = function(args)
{
    var filter = new dwv.image.filter.Threshold();
    filter.setMin(args.min);
    filter.setMax(args.max);
    var command = new dwv.tool.RunFilterCommand(filter, app);
    command.execute();
    // save command in undo stack
    app.getUndoStack().add(command);
};

// Add the tool to the list
dwv.tool.filters.threshold = dwv.tool.filter.Threshold;

/**
* @class Sharpen filter tool.
*/
dwv.tool.filter.Sharpen = function(app) {};

dwv.tool.filter.Sharpen.prototype.enable = function(value)
{
    if( value ) {
        dwv.gui.filter.appendSharpenHtml();
    }
    else { 
        dwv.gui.filter.clearSharpenHtml();
    }
};

dwv.tool.filter.Sharpen.prototype.run = function(args)
{
    var filter = new dwv.image.filter.Sharpen();
    var command = new dwv.tool.RunFilterCommand(filter, app);
    command.execute();
    // save command in undo stack
    app.getUndoStack().add(command);
};

// Add the tool to the list
dwv.tool.filters.sharpen = dwv.tool.filter.Sharpen;

/**
* @class Sobel filter tool.
*/
dwv.tool.filter.Sobel = function(app) {};

dwv.tool.filter.Sobel.prototype.enable = function(value)
{
    if( value ) {
        dwv.gui.filter.appendSobelHtml();
    }
    else { 
        dwv.gui.filter.clearSobelHtml();
    }
};

dwv.tool.filter.Sobel.prototype.run = function(args)
{
    var filter = new dwv.image.filter.Sobel();
    var command = new dwv.tool.RunFilterCommand(filter, app);
    command.execute();
    // save command in undo stack
    app.getUndoStack().add(command);
};

//Add the tool to the list
dwv.tool.filters.sobel = dwv.tool.filter.Sobel;

//Tool list
dwv.tool.tools = dwv.tool.tools || {};
//Add the filters to the tools
dwv.tool.tools.filter = dwv.tool.Filter;

/**
 * @class Run filter command.
 * @param filter The filter to run.
 * @param app The application to draw the line on.
 */
dwv.tool.RunFilterCommand = function(filter, app)
{
    // command name
    var name = "RunFilter: " + filter.getName();
    this.setName = function(str) { name = str; };
    this.getName = function() { return name; };

    // main method
    this.execute = function()
    {
        app.setImage(filter.update());
        app.generateAndDrawImage();
    }; 
}; // RunFilterCommand class
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
// @namespace Info classes.
dwv.info = dwv.info || {};

/**
 * @function Create the windowing info div.
 */
dwv.info.createWindowingDiv = function()
{
    var div = document.getElementById("infotr");
    dwv.html.removeNode("ulinfotr");
    // windowing list
    var ul = document.createElement("ul");
    ul.id = "ulinfotr";
    // window center list item
    var liwc = document.createElement("li");
    liwc.id = "liwcinfotr";
    ul.appendChild(liwc);
    // window width list item
    var liww = document.createElement("li");
    liww.id = "liwwinfotr";
    ul.appendChild(liww);
    // add list to div
    div.appendChild(ul);
};

/**
 * @function Update the Top Right info div.
 * @param event The windowing change event containing the new values.
 * Warning: expects the windowing info div to exist (use after createWindowingDiv).
 */
dwv.info.updateWindowingDiv = function(event)
{
    // window center list item
    var liwc = document.getElementById("liwcinfotr");
    dwv.html.cleanNode(liwc);
    liwc.appendChild(document.createTextNode("WindowCenter = "+event.wc));
    // window width list item
    var liww = document.getElementById("liwwinfotr");
    dwv.html.cleanNode(liww);
    liww.appendChild(document.createTextNode("WindowWidth = "+event.ww));
};

/**
 * @function Create the position info div.
 */
dwv.info.createPositionDiv = function()
{
    var div = document.getElementById("infotl");
    dwv.html.removeNode("ulinfotl");
    // position list
    var ul = document.createElement("ul");
    ul.id = "ulinfotl";
    // position
    var lipos = document.createElement("li");
    lipos.id = "liposinfotl";
    ul.appendChild(lipos);
    // value
    var livalue = document.createElement("li");
    livalue.id = "livalueinfotl";
    ul.appendChild(livalue);
    // add list to div
    div.appendChild(ul);
};

/**
 * @function Update the position info div.
 * @param event The position change event containing the new values.
 * Warning: expects the position info div to exist (use after createPositionDiv).
 */
dwv.info.updatePositionDiv = function(event)
{
    // window center list item
    var lipos = document.getElementById("liposinfotl");
    dwv.html.cleanNode(lipos);
    lipos.appendChild(document.createTextNode("Pos = "+event.i+", "+event.j+", "+event.k));
    // window width list item
    var livalue = document.getElementById("livalueinfotl");
    dwv.html.cleanNode(livalue);
    livalue.appendChild(document.createTextNode("Value = "+event.value));
};

/**
 * @function Create the mini color map info div.
 */
dwv.info.createMiniColorMap = function()
{    
    // color map
    var div = document.getElementById("infobr");
    dwv.html.removeNode("canvasinfobr");
    var canvas = document.createElement("canvas");
    canvas.id = "canvasinfobr";
    canvas.width = 98;
    canvas.height = 10;
    // add canvas to div
    div.appendChild(canvas);
};

/**
 * @function Update the mini color map info div.
 * @param event The windowing change event containing the new values.
 * Warning: expects the mini color map div to exist (use after createMiniColorMap).
 */
dwv.info.updateMiniColorMap = function(event)
{    
    var windowCenter = event.wc;
    var windowWidth = event.ww;
    
    var canvas = document.getElementById("canvasinfobr");
    context = canvas.getContext('2d');
    
    // fill in the image data
    var colourMap = app.getView().getColorMap();
    var imageData = context.getImageData(0,0,canvas.width, canvas.height);
    
    var c = 0;
    var minInt = app.getImage().getRescaledDataRange().min;
    var range = app.getImage().getRescaledDataRange().max - minInt;
    var incrC = range / canvas.width;
    var y = 0;
    
    var yMax = 255;
    var yMin = 0;
    var xMin = windowCenter - 0.5 - (windowWidth-1) / 2;
    var xMax = windowCenter - 0.5 + (windowWidth-1) / 2;    
    
    for( var j=0; j<canvas.height; ++j ) {
        c = minInt;
        for( var i=0; i<canvas.width; ++i ) {
            if( c <= xMin ) y = yMin;
            else if( c > xMax ) y = yMax;
            else {
                y = ( (c - (windowCenter-0.5) ) / (windowWidth-1) + 0.5 ) *
                    (yMax-yMin) + yMin;
                y = parseInt(y,10);
            }
            index = (i + j * canvas.width) * 4;
            imageData.data[index] = colourMap.red[y];
            imageData.data[index+1] = colourMap.green[y];
            imageData.data[index+2] = colourMap.blue[y];
            imageData.data[index+3] = 0xff;
            c += incrC;
        }
    }
    // put the image data in the context
    context.putImageData(imageData, 0, 0);
};

/**
 * @function Create the plot info.
 */
dwv.info.createPlot = function()
{
    $.plot($("#plot"), [ app.getImage().getHistogram() ], {
        "bars": { "show": true },
        "grid": { "backgroundColor": null },
        "xaxis": { "show": true },
        "yaxis": { "show": false }
    });
};

/**
 * @function Update the plot markings.
 * @param event The windowing change event containing the new values.
 * Warning: expects the plot to exist (use after createPlot).
 */
dwv.info.updatePlotMarkings = function(event)
{
    var wc = event.wc;
    var ww = event.ww;
    
    var half = parseInt( (ww-1) / 2, 10 );
    var center = parseInt( (wc-0.5), 10 );
    var min = center - half;
    var max = center + half;
    
    var markings = [
        { "color": "#faa", "lineWidth": 1, "xaxis": { "from": min, "to": min } },
        { "color": "#aaf", "lineWidth": 1, "xaxis": { "from": max, "to": max } }
    ];

    $.plot($("#plot"), [ app.getImage().getHistogram() ], {
        "bars": { "show": true },
        "grid": { "markings": markings, "backgroundColor": null },
        "xaxis": { "show": false },
        "yaxis": { "show": false }
    });
};
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Tool classes.
dwv.tool = dwv.tool || {};

/**
 * @class Draw line command.
 * @param points The points from which to extract the line.
 * @param app The application to draw the line on.
 * @param style The drawing style.
 */
dwv.tool.DrawLineCommand = function(points, app, style)
{
    var line = new dwv.math.Line(points[0], points[points.length-1]);
    var lineColor = style.getLineColor();
    var context = app.getTempLayer().getContext();
    
    // command name
    var name = "DrawLineCommand";
    this.setName = function(str) { name = str; };
    this.getName = function() { return name; };

    // main method
    this.execute = function()
    {
        // style
        context.fillStyle = lineColor;
        context.strokeStyle = lineColor;
        // path
        context.beginPath();
        context.moveTo( line.getBegin().getX(), line.getBegin().getY());
        context.lineTo( line.getEnd().getX(), line.getEnd().getY());
        context.stroke();
        context.closePath();
        // length
        var length = line.getWorldLength( 
            app.getImage().getSpacing().getColumnSpacing(), 
            app.getImage().getSpacing().getRowSpacing() );
        context.font = style.getFontStr();
        context.fillText( Math.round(length) + "mm",
                line.getEnd().getX() + style.getFontSize(),
                line.getEnd().getY() + style.getFontSize());
    }; 
}; // DrawLineCommand class

//Shape list
dwv.tool.shapes = dwv.tool.shapes || {};
//Add the shape command to the list
dwv.tool.shapes.line = dwv.tool.DrawLineCommand;
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Tool classes.
dwv.tool = dwv.tool || {};

/**
* @class Livewire painting tool.
*/
dwv.tool.Livewire = function(app)
{
    var self = this;
    this.started = false;
    // draw style
    this.style = new dwv.html.Style();
    var command = null;
    // paths are stored in reverse order
    var path = new dwv.math.Path();
    var currentPath = new dwv.math.Path();
    var parentPoints = [];
    var tolerance = 5;
    
    function clearParentPoints() {
        for( var i = 0; i < app.getImage().getSize().getNumberOfRows(); ++i ) {
            parentPoints[i] = [];
        }
    }
    
    function clearPaths() {
        path = new dwv.math.Path();
        currentPath = new dwv.math.Path();
    }
    
    var scissors = new dwv.math.Scissors();
    scissors.setDimensions(
        app.getImage().getSize().getNumberOfColumns(),
        app.getImage().getSize().getNumberOfRows() );
    scissors.setData(app.getImageData().data);
    
    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        // first time
        if( !self.started ) {
            self.started = true;
            self.x0 = ev._x;
            self.y0 = ev._y;
            // clear vars
            clearPaths();
            clearParentPoints();
            // do the training from the first point
            var p = new dwv.math.FastPoint2D(ev._x, ev._y);
            scissors.doTraining(p);
            // add the initial point to the path
            var p0 = new dwv.math.Point2D(ev._x, ev._y);
            path.addPoint(p0);
            path.addControlPoint(p0);
        }
        else {
            // final point: at 'tolerance' of the initial point
            if( (Math.abs(ev._x - self.x0) < tolerance) && (Math.abs(ev._y - self.y0) < tolerance) ) {
                // draw
                self.mousemove(ev);
                console.log("Done.");
                // save command in undo stack
                app.getUndoStack().add(command);
                // merge temporary layer
                app.getDrawLayer().merge(app.getTempLayer());
                // set flag
                self.started = false;
            }
            // anchor point
            else {
                path = currentPath;
                clearParentPoints();
                var pn = new dwv.math.FastPoint2D(ev._x, ev._y);
                scissors.doTraining(pn);
                path.addControlPoint(currentPath.getPoint(0));
            }
        }
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!self.started)
        {
            return;
        }
        // set the point to find the path to
        var p = new dwv.math.FastPoint2D(ev._x, ev._y);
        scissors.setPoint(p);
        // do the work
        var results = 0;
        var stop = false;
        while( !parentPoints[p.y][p.x] && !stop)
        {
            console.log("Getting ready...");
            results = scissors.doWork();
            
            if( results.length === 0 ) { 
                stop = true;
            }
            else {
                // fill parents
                for( var i = 0; i < results.length-1; i+=2 ) {
                    var _p = results[i];
                    var _q = results[i+1];
                    parentPoints[_p.y][_p.x] = _q;
                }
            }
        }
        console.log("Ready!");
        
        // get the path
        currentPath = new dwv.math.Path();
        stop = false;
        while (p && !stop) {
            currentPath.addPoint(new dwv.math.Point2D(p.x, p.y));
            if(!parentPoints[p.y]) { 
                stop = true;
            }
            else { 
                if(!parentPoints[p.y][p.x]) { 
                    stop = true;
                }
                else {
                    p = parentPoints[p.y][p.x];
                }
            }
        }
        currentPath.appenPath(path);
        
        // create draw command
        command = new dwv.tool.DrawLivewireCommand(currentPath, app, self.style);
        // clear the temporary layer
        app.getTempLayer().clearContextRect();
        // draw
        command.execute();
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        // nothing to do
    };
    
    this.enable = function(value){
        if( value ) {
            this.init();
            dwv.gui.appendLivewireHtml();
        }
        else {
            dwv.gui.clearLivewireHtml();
        }
    };

    this.keydown = function(event){
        app.handleKeyDown(event);
    };

}; // Livewire class

//Set the line color of the drawing
dwv.tool.Livewire.prototype.setLineColour = function(colour)
{
    // set style var
    this.style.setLineColor(colour);
};

dwv.tool.Livewire.prototype.init = function()
{
    // set the default to the first in the list
    this.setLineColour(dwv.tool.colors[0]);
};

//Tool list
dwv.tool.tools = dwv.tool.tools || {};
//Add the tool to the list
dwv.tool.tools.livewire = dwv.tool.Livewire;

/**
 * @class Draw livewire command.
 * @param livewire The livewire to draw.
 * @param app The application to draw the livewire on.
 */
dwv.tool.DrawLivewireCommand = function(livewire, app, style)
{
    // app members can change 
    var livewireColor = style.getLineColor();
    var context = app.getTempLayer().getContext();
    
    // command name
    var name = "DrawLivewireCommand";
    this.setName = function(str) { name = str; };
    this.getName = function() { return name; };

    // main method
    this.execute = function()
    {
        // style
        context.fillStyle = livewireColor;
        context.strokeStyle = livewireColor;
        // path
        context.beginPath();
        var p = livewire.getPoint(0);
        context.moveTo( p.getX(), p.getY());
        for( var i=1; i < livewire.getLength(); ++i ) {
            p = livewire.getPoint(i);
            context.lineTo( p.getX(), p.getY());
        }
        for( var j=0; j < livewire.controlPointIndexArray.length; ++j ) { 
            p = livewire.getPoint(livewire.controlPointIndexArray[j]);
            context.fillRect(p.getX()-3, p.getY()-3, 5, 5);
        }
        context.stroke();
        //context.closePath();
    }; 
}; // DrawLivewireCommand class
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Tool classes.
dwv.tool = dwv.tool || {};

/**
 * @class Draw rectangle command.
 * @param points The points from which to extract the circle.
 * @param app The application to draw the line on.
 * @param style The drawing style.
 */
dwv.tool.DrawRectangleCommand = function(points, app, style)
{
    var rectangle = new dwv.math.Rectangle(points[0], points[points.length-1]);
    var lineColor = style.getLineColor();
    var context = app.getTempLayer().getContext();
    
    // command name
    var name = "DrawRectangleCommand";
    this.setName = function(str) { name = str; };
    this.getName = function() { return name; };

    // main method
    this.execute = function()
    {
        // style
        context.fillStyle = lineColor;
        context.strokeStyle = lineColor;
        // path
        context.beginPath();
        context.strokeRect( 
                rectangle.getBegin().getX(), 
                rectangle.getBegin().getY(),
                rectangle.getRealWidth(),
                rectangle.getRealHeight() );
        // length
        var surf = rectangle.getWorldSurface( 
            app.getImage().getSpacing().getColumnSpacing(), 
            app.getImage().getSpacing().getRowSpacing() );
        context.font = style.getFontStr();
        context.fillText( Math.round(surf) + "mm2",
                rectangle.getEnd().getX() + style.getFontSize(),
                rectangle.getEnd().getY() + style.getFontSize());
    }; 
}; // DrawRectangleCommand class

//Shape list
dwv.tool.shapes = dwv.tool.shapes || {};
//Add the shape command to the list
dwv.tool.shapes.rectangle = dwv.tool.DrawRectangleCommand;
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Tool classes.
dwv.tool = dwv.tool || {};

/**
 * @class Draw ROI command.
 * @param points The points from which to extract the line.
 * @param app The application to draw the line on.
 * @param style The drawing style.
 */
dwv.tool.DrawRoiCommand = function(points, app, style)
{
    var roi = new dwv.math.ROI();
    roi.addPoints(points);

    var lineColor = style.getLineColor();
    var context = app.getTempLayer().getContext();
    
    // command name
    var name = "DrawRoiCommand";
    this.setName = function(str) { name = str; };
    this.getName = function() { return name; };

    // main method
    this.execute = function()
    {
        // style
        context.fillStyle = lineColor;
        context.strokeStyle = lineColor;
        // path
        context.beginPath();
        context.moveTo(
                roi.getPoint(0).getX(), 
                roi.getPoint(0).getY());
        for( var i = 1; i < roi.getLength(); ++i )
        {
            context.lineTo(
                    roi.getPoint(i).getX(), 
                    roi.getPoint(i).getY());
            context.stroke();
        }
        context.closePath();
        context.stroke();
    }; 
}; // DrawRoiCommand class

//Shape list
dwv.tool.shapes = dwv.tool.shapes || {};
//Add the shape command to the list
dwv.tool.shapes.roi = dwv.tool.DrawRoiCommand;
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Tool classes.
dwv.tool = dwv.tool || {};

// tool list: to be completed after each tool definition 
dwv.tool.tools = dwv.tool.tools || {};
    
/**
* @class Tool box.
*/
dwv.tool.ToolBox = function(app)
{
    this.selectedTool = 0;
    this.defaultToolName = 0;
};

dwv.tool.ToolBox.prototype.enable = function(bool)
{
    if( bool ) {
        this.sortTools();
        dwv.gui.appendToolboxHtml();
        this.init();
    }
};

dwv.tool.ToolBox.prototype.getSelectedTool = function() {
    return this.selectedTool;
};

dwv.tool.ToolBox.prototype.setSelectedTool = function(name) {
    // check if we have it
    if( !this.hasTool(name) )
    {
        throw new Error("Unknown tool: '" + name + "'");
    }
    // disable last selected
    if( this.selectedTool )
    {
        this.selectedTool.enable(false);
    }
    // enable new one
    this.selectedTool = new dwv.tool.tools[name](app);
    this.selectedTool.enable(true);
};

dwv.tool.ToolBox.prototype.hasTool = function(name) {
    return dwv.tool.tools[name];
};

dwv.tool.ToolBox.prototype.sortTools = function()
{
    // fiddle with order: make window level first if present
    var tools = dwv.tool.tools;
    dwv.tool.tools = {};
    if( tools.windowlevel ) dwv.tool.tools.windowlevel = tools.windowlevel;
    for( var key in tools ) {
        if( key === "windowlevel" ) continue;
        dwv.tool.tools[key] = tools[key];
    }
};

dwv.tool.ToolBox.prototype.init = function()
{
    // set the default to the first in the list
    for( var key in dwv.tool.tools ){
        this.defaultToolName = key;
        break;
    }
    this.setSelectedTool(this.defaultToolName);
};
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Tool classes.
dwv.tool = dwv.tool || {};

/**
 * @class UndoStack class.
 * @param app
 */
dwv.tool.UndoStack = function(app)
{ 
    // Array of commands.
    var stack = [];
    // Current command index.
    var curCmdIndex = 0;

    /**
     * Add a command to the stack.
     * @param cmd The command to add.
     */
    this.add = function(cmd)
    { 
        // clear commands after current index
        stack = stack.slice(0,curCmdIndex);
        // store command
        stack[curCmdIndex] = cmd;
        // increment index
        ++curCmdIndex;
        // add command to display history
        dwv.gui.addCommandToUndoHtml(cmd.getName());
    };

    /**
     * Undo the last command. 
     */
    this.undo = function()
    { 
        // a bit inefficient...
        if( curCmdIndex > 0 )
        {
            // decrement index
            --curCmdIndex; 
            // reset image
            app.restoreOriginalImage();
            // clear layers
            app.getDrawLayer().clearContextRect();
            app.getTempLayer().clearContextRect();
            // redo from first command
            for( var i = 0; i < curCmdIndex; ++i)
            {
                stack[i].execute(); 
            }
            // display
            if( curCmdIndex === 0 ) {
                // just draw the image
                app.generateAndDrawImage();
            }
            else {
                // merge the temporary layer
                app.getDrawLayer().merge(app.getTempLayer());
            }
            // disable last in display history
            dwv.gui.enableInUndoHtml(false);
        }
    }; 

    /**
     * Redo the last command.
     */
    this.redo = function()
    { 
        if( curCmdIndex < stack.length )
        {
            // run command
            var cmd = stack[curCmdIndex];
            cmd.execute();
            // increment index
            ++curCmdIndex;
            // merge the temporary layer
            app.getDrawLayer().merge(app.getTempLayer());
            // enable next in display history
            dwv.gui.enableInUndoHtml(true);
        }
    };

}; // UndoStack class
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Tool classes.
dwv.tool = dwv.tool || {};

/**
* @fileOverview WindowLevel tool.
*/

/**
 * @function Update the views' current position.
 */
dwv.tool.updatePostionValue = function(i,j)
{
    app.getView().setCurrentPosition({"i": i, "j": j, "k": app.getView().getCurrentPosition().k});
};

/**
 * @function Update the views' windowing data
 */
dwv.tool.updateWindowingData = function(wc,ww)
{
    app.getView().setWindowLevel(wc,ww);
};

/**
 * @function Update the views' colour map.
 */
dwv.tool.updateColourMap = function(colourMap)
{
    app.getView().setColorMap(colourMap);
};

// Default colour maps.
dwv.tool.colourMaps = {
    "plain": dwv.image.lut.plain,
    "invplain": dwv.image.lut.invPlain,
    "rainbow": dwv.image.lut.rainbow,
    "hot": dwv.image.lut.hot,
    "test": dwv.image.lut.test
};
// Default window level presets.
dwv.tool.presets = {};
dwv.tool.defaultpresets = {};
dwv.tool.defaultpresets.CT = {
    "abdomen": {"center": 350, "width": 40},
    "lung": {"center": -600, "width": 1500},
    "brain": {"center": 40, "width": 80},
    "bone": {"center": 480, "width": 2500},
    "head": {"center": 90, "width": 350}
};

/**
 * @class WindowLevel tool: handle window/level related events.
 */
dwv.tool.WindowLevel = function(app)
{
    // Closure to self: to be used by event handlers.
    var self = this;
    // Interaction start flag.
    this.started = false;
    // Initialise presets.
    this.updatePresets();
    
    // Called on mouse down event.
    this.mousedown = function(event){
        // set start flag
        self.started = true;
        // store initial position
        self.x0 = event._x;
        self.y0 = event._y;
        // update GUI
        dwv.tool.updatePostionValue(event._x, event._y);
    };
    
    // Called on touch start event with two fingers.
    this.twotouchdown = function(event){
        // set start flag
        self.started = true;
        // store initial positions
        self.x0 = event._x;
        self.y0 = event._y;
        self.x1 = event._x1;
        self.y1 = event._y1;
    };
    
    // Called on mouse move event.
    this.mousemove = function(event){
        // check start flag
        if( !self.started ) return;
        // difference to last position
        var diffX = event._x - self.x0;
        var diffY = self.y0 - event._y;
        // calculate new window level
        var windowCenter = parseInt(app.getView().getWindowLut().getCenter(), 10) + diffY;
        var windowWidth = parseInt(app.getView().getWindowLut().getWidth(), 10) + diffX;
        // update GUI
        dwv.tool.updateWindowingData(windowCenter,windowWidth);
        // store position
        self.x0 = event._x;
        self.y0 = event._y;
    };
    
    // Called on touch move event with two fingers.
    this.twotouchmove = function(event){
        // check start flag
        if( !self.started ) return;
        // difference  to last position
        var diffY = event._y - self.y0;
        // do not trigger for small moves
        if( Math.abs(diffY) < 15 ) return;
        // update GUI
        if( diffY > 0 ) app.getView().incrementSliceNb();
        else app.getView().decrementSliceNb();
        // store position
        self.y0 = event._y;
    };
    
    // Called on mouse up event.
    this.mouseup = function(event){
        // set start flag
        if( self.started ) self.started = false;
    };
    
    // Called on mouse out event.
    this.mouseout = function(event){
        // treat as mouse up
        self.mouseup(event);
    };
    
    // Called on touch start event.
    this.touchstart = function(event){
        // dispatch to one or two touch handler
        if( event.targetTouches.length === 1 ) self.mousedown(event);
        else if( event.targetTouches.length === 2 ) self.twotouchdown(event);
    };
    
    // Called on touch move event.
    this.touchmove = function(event){
        // dispatch to one or two touch handler
        if( event.targetTouches.length === 1 ) self.mousemove(event);
        else if( event.targetTouches.length === 2 ) self.twotouchmove(event);
    };
    
    // Called on touch end event.
    this.touchend = function(event){
        // treat as mouse up
        self.mouseup(event);
    };
    
    // Called on double click event.
    this.dblclick = function(event){
        // update GUI
        dwv.tool.updateWindowingData(
            parseInt(app.getImage().getRescaledValue(event._x, event._y, app.getView().getCurrentPosition().k), 10),
            parseInt(app.getView().getWindowLut().getWidth(), 10) );    
    };
    
    // Called on mouse (wheel) scroll event on Firefox.
    this.DOMMouseScroll = function(event){
        // update GUI
        if( event.detail > 0 ) app.getView().incrementSliceNb();
        else app.getView().decrementSliceNb();
    };
    
    // Called on mouse wheel event.
    this.mousewheel = function(event){
        // update GUI
        if( event.wheelDelta > 0 ) app.getView().incrementSliceNb();
        else app.getView().decrementSliceNb();
    };
    
    // Called on key down event.
    this.keydown = function(event){
        // let the app handle it
        app.handleKeyDown(event);
    };
    
    // Enable the tool: prepare HTML for it.
    this.enable = function(bool){
        // update GUI
        if( bool ) dwv.gui.appendWindowLevelHtml();
        else dwv.gui.clearWindowLevelHtml();
    };
    
}; // WindowLevel class

/**
 * @function Update the window/level presets.
 */
dwv.tool.WindowLevel.prototype.updatePresets = function()
{    
    // copy the presets and reinitialize the external one
    // (hoping to control the order of the presets)
    dwv.tool.presets = {};
    // DICOM presets
    var dicomPresets = app.getView().getWindowPresets();
    if( dicomPresets ) {
        for( var i = 0; i < dicomPresets.length; ++i ) {
            dwv.tool.presets[dicomPresets[i].name.toLowerCase()] = dicomPresets[i];
        }
    }
    // min/max preset
    var range = app.getImage().getRescaledDataRange();
    var min = range.min;
    var max = range.max;
    var width = max - min;
    var center = min + width/2;
    dwv.tool.presets["min/max"] = {"center": center, "width": width};
    // re-populate the external array
    var modality = app.getImage().getMeta().Modality;
    for( var key in dwv.tool.defaultpresets[modality] ) {
        dwv.tool.presets[key] = dwv.tool.defaultpresets[modality][key];
    }
};

/**
 * @function Set the window/level presets.
 */
dwv.tool.WindowLevel.prototype.setPreset = function(name)
{
    // check if we have it
    if( !dwv.tool.presets[name] )
        throw new Error("Unknown window level preset: '" + name + "'");
    // enable it
    dwv.tool.updateWindowingData( 
        dwv.tool.presets[name].center, 
        dwv.tool.presets[name].width );
};

/**
 * @function Set the colour map.
 */
dwv.tool.WindowLevel.prototype.setColourMap = function(name)
{
    // check if we have it
    if( !dwv.tool.colourMaps[name] )
        throw new Error("Unknown colour map: '" + name + "'");
    // enable it
    dwv.tool.updateColourMap( dwv.tool.colourMaps[name] );
};

//Tool list
dwv.tool.tools = dwv.tool.tools || {};
//Add the tool to the list
dwv.tool.tools.windowlevel = dwv.tool.WindowLevel;
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Tool classes.
dwv.tool = dwv.tool || {};

/**
 * @function
 */
dwv.tool.zoomReset = function(event)
{
    app.getImageLayer().resetLayout();
    app.getImageLayer().draw();
    app.getDrawLayer().resetLayout();
    app.getDrawLayer().draw();
};

/**
 * @class Zoom class.
 */
dwv.tool.Zoom = function(app)
{
    var self = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        self.started = true;
        // first position
        self.x0 = ev._x;
        self.y0 = ev._y;
     };

     this.twotouchdown = function(ev){
         self.started = true;
         // first line
         var point0 = new dwv.math.Point2D(ev._x, ev._y);
         var point1 = new dwv.math.Point2D(ev._x1, ev._y1);
         self.line0 = new dwv.math.Line(point0, point1);
         self.midPoint = self.line0.getMidpoint();         
     };

     // This function is called every time you move the mouse.
     this.mousemove = function(ev){
        if (!self.started)
        {
            return;
        }

        // calculate translation
        var tx = (ev._x - self.x0);
        var ty = (ev._y - self.y0);
        // apply translation
        app.getImageLayer().translate(tx,ty);
        app.getDrawLayer().translate(tx,ty);
        
        // reset origin point
        self.x0 = ev._x;
        self.y0 = ev._y;
    };

    this.twotouchmove = function(ev){
       if (!self.started)
       {
           return;
       }
       var point0 = new dwv.math.Point2D(ev._x, ev._y);
       var point1 = new dwv.math.Point2D(ev._x1, ev._y1);
       var newLine = new dwv.math.Line(point0, point1);
       var lineRatio = newLine.getLength() / self.line0.getLength();
       
       var zoom = (lineRatio - 1) / 2;
       if( Math.abs(zoom) % 0.1 <= 0.05 )
           zoomLayers(zoom, self.midPoint.getX(), self.midPoint.getY());
    };
    
    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (self.started)
        {
            // stop recording
            self.started = false;
        }
    };
    
    this.mouseout = function(ev){
        self.mouseup(ev);
    };

    this.touchstart = function(ev){
        if( event.targetTouches.length === 1 ){
            self.mousedown(ev);
        }
        else if( event.targetTouches.length === 2 ){
            self.twotouchdown(ev);
        }
    };

    this.touchmove = function(ev){
        if( event.targetTouches.length === 1 ){
            self.mousemove(ev);
        }
        else if( event.targetTouches.length === 2 ){
            self.twotouchmove(ev);
        }
    };

    this.touchend = function(ev){
        self.mouseup(ev);
    };

    // This is called when you use the mouse wheel on Firefox.
    this.DOMMouseScroll = function(ev){
        // ev.detail on firefox is 3
        var step = ev.detail/30;
        zoomLayers(step, ev._x, ev._y);
    };

    // This is called when you use the mouse wheel.
    this.mousewheel = function(ev){
        // ev.wheelDelta on chrome is 120
        var step = ev.wheelDelta/1200;
        zoomLayers(step, ev._x, ev._y);
    };
    
    // Enable method.
    this.enable = function(bool){
        if( bool ) { 
            dwv.gui.appendZoomHtml();
        }
        else { 
            dwv.gui.clearZoomHtml();
        }
    };

    // Keyboard shortcut.
    this.keydown = function(event){
        app.handleKeyDown(event);
    };

    // Really do the zoom
    // A good step is of 0.1.
    function zoomLayers(step, cx, cy)
    {
        app.setLayersZoom(step,step,cx,cy);
    }

}; // Zoom class

//Tool list
dwv.tool.tools = dwv.tool.tools || {};
//Add the tool to the list
dwv.tool.tools.zoom = dwv.tool.Zoom;
;//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Utils classes and functions.
dwv.utils = dwv.utils || {};

/**
 * @function Capitalise the first letter of a string.
 */
dwv.utils.capitaliseFirstLetter = function(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * @function Clean string.
 */
dwv.utils.cleanString = function(string)
{
    var str = string.trim();
    //get rid of ending zero-width space (u200B)
    if( str[str.length-1] === String.fromCharCode("u200B") ) {
        str = str.substring(0, str.length-1); 
    }
    return str;
};

/**
 * root?key0=val0&key1=val1 returns [{"key"="key0", "value"="val0"}, {"key"="key1", "value"="val1"}]
 * Returns null if not a query string (no question mark).
 */
dwv.utils.splitQueryString = function(inputStr)
{
    // check if query string
    if( inputStr.indexOf('?') === -1 ) return null;
    // result
    var result = {};
    // base
    result.base = inputStr.substr(0, inputStr.indexOf('?'));
    // take after the ?
    var query = inputStr.substr(inputStr.indexOf('?')+1);
    // split key/value pairs
    var pairs = query.split('&');
    for( var i = 0; i < pairs.length; ++i )
    {
        var pair = pairs[i].split('=');
        // if the key does not exist, create it
        if( !result[pair[0]] ) result[pair[0]] = pair[1];
        else
        {
            if( !( result[pair[0]] instanceof Array) ) {
                result[pair[0]] = [result[pair[0]]];
            }
            result[pair[0]].push(pair[1]);
        }
    }
    return result;
};
