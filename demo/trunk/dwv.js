// Main DWV namespace.
var dwv = dwv || {};

var Kinetic = Kinetic || {};

/**
 * Main application class.
 * @class App
 * @namespace dwv
 * @constructor
 */
dwv.App = function()
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
    var windowScale = 1;
     
    // Image layer
    var imageLayer = null;
    // Kinetic layer
    var kineticLayer = null;
    var kineticStage = null;
    
    // flag to know if the info layer is listening on the image.
    var isInfoLayerListening = false;
    
    // Tool box
    var toolBox = new dwv.tool.ToolBox(this);
    // UndoStack
    var undoStack = new dwv.tool.UndoStack(this);
    
    /** 
     * Get the version of the application.
     * @method getVersion
     * @return {String} The version of the application.
     */
    this.getVersion = function() { return "v0.7.0beta"; };
    
    /** 
     * Get the image.
     * @method getImage
     * @return {Image} The associated image.
     */
    this.getImage = function() { return image; };
    /** 
     * Get the view.
     * @method getView
     * @return {Image} The associated view.
     */
    this.getView = function() { return view; };
    
    /** 
     * Set the view.
     * @method setImage
     * @param {Image} img The associated image.
     */
    this.setImage = function(img)
    { 
        image = img; 
        view.setImage(img);
    };
    
    /** 
     * Restore the original image.
     * @method restoreOriginalImage
     */
    this.restoreOriginalImage = function() 
    { 
        image = originalImage; 
        view.setImage(originalImage); 
    }; 
    
    /** 
     * Get the image data array.
     * @method getImageData
     * @return {Array} The image data array.
     */
    this.getImageData = function() { return imageData; };

    /** 
     * Get the tool box.
     * @method getToolBox
     * @return {Object} The associated toolbox.
     */
    this.getToolBox = function() { return toolBox; };

    /** 
     * Get the image layer.
     * @method getImageLayer
     * @return {Object} The image layer.
     */
    this.getImageLayer = function() { return imageLayer; };
    /** 
     * Get the kinetic layer.
     * @method getKineticLayer
     * @return {Object} The temporary layer.
     */
    this.getKineticLayer = function() { return kineticLayer; };
    this.getKineticStage = function() { return kineticStage; };

    /** 
     * Get the undo stack.
     * @method getUndoStack
     * @return {Object} The undo stack.
     */
    this.getUndoStack = function() { return undoStack; };

    /**
     * Initialise the HTML for the application.
     * @method init
     */
    this.init = function(){
        // align layers when the window is resized
        window.onresize = app.resize;
        // possible load from URL
        if( typeof skipLoadUrl === "undefined" ) {
            var inputUrls = dwv.html.getUriParam(); 
            if( inputUrls && inputUrls.length > 0 ) {
                app.loadURL(inputUrls);
            }
        }
        else{
            console.log("Not loading url from adress since skipLoadUrl is defined.");
        }
    };
    
    /**
     * Reset the application.
     * @method reset
     */
    this.reset = function()
    {
        image = null;
        view = null;
        undoStack = new dwv.tool.UndoStack(this);
    };
    
    this.resetLayout = function () {
        if ( app.getImageLayer() ) {
            app.getImageLayer().resetLayout(windowScale);
            app.getImageLayer().draw();
        }
        if ( app.getKineticStage() ) {
            var stage = app.getKineticStage();
            stage.offset( {'x': 0, 'y': 0} );
            stage.scale( {'x': windowScale, 'y': windowScale} );
            stage.draw();
        }
    };
    
    /**
     * Handle key down event.
     * - CRTL-Z: undo
     * - CRTL-Y: redo
     * Default behavior. Usually used in tools. 
     * @method handleKeyDown
     * @param {Object} event The key down event.
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
     * Handle change files event.
     * @method onChangeFiles
     * @param {Object} event The event fired when changing the file field.
     */
    this.onChangeFiles = function(event)
    {
        self.loadFiles(event.target.files);
    };

    /**
     * Load a list of files.
     * @method loadFiles
     * @param {Array} files The list of files to load.
     */
    this.loadFiles = function(files) 
    {
        // clear variables
        this.reset();
        // create IO
        var fileIO = new dwv.io.File();
        fileIO.onload = function(data){
            if( image ) {
                image.appendSlice( data.view.getImage() );
            }
            postLoadInit(data);
        };
        fileIO.onerror = function(error){ handleError(error); };
        // main load (asynchronous)
        fileIO.load(files);
    };
    
    /**
     * Handle change url event.
     * @method onChangeURL
     * @param {Object} event The event fired when changing the url field.
     */
    this.onChangeURL = function(event)
    {
        self.loadURL([event.target.value]);
    };

    /**
     * Load a list of URLs.
     * @method loadURL
     * @param {Array} urls The list of urls to load.
     */
    this.loadURL = function(urls) 
    {
        // clear variables
        this.reset();
        // create IO
        var urlIO = new dwv.io.Url();
        urlIO.onload = function(data){
            if( image ) {
                image.appendSlice( data.view.getImage() );
            }
            postLoadInit(data);
        };
        urlIO.onerror = function(error){ handleError(error); };
        // main load (asynchronous)
        urlIO.load(urls);
    };
    
    /**
     * Generate the image data and draw it.
     * @method generateAndDrawImage
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
     * Resize the display window. To be called once the image is loaded.
     * @method resize
     */
    this.resize = function()
    {
        // previous width
        var oldWidth = parseInt(windowScale*dataWidth, 10);
        // find new best fit
        var size = dwv.gui.getWindowSize();
        windowScale = Math.min( (size.width / dataWidth), (size.height / dataHeight) );
        // new sizes
        var newWidth = parseInt(windowScale*dataWidth, 10);
        var newHeight = parseInt(windowScale*dataHeight, 10);
        // ratio previous/new to add to zoom
        var mul = newWidth / oldWidth;

        // resize container
        $("#layerContainer").width(newWidth);
        $("#layerContainer").height(newHeight + 1); // +1 to be sure...
        // resize image layer
        if( app.getImageLayer() ) {
            var iZoomX = app.getImageLayer().getZoom().x * mul;
            var iZoomY = app.getImageLayer().getZoom().y * mul;
            app.getImageLayer().setWidth(newWidth);
            app.getImageLayer().setHeight(newHeight);
            app.getImageLayer().zoom(iZoomX, iZoomY, 0, 0);
            app.getImageLayer().draw();
        }
        // resize draw layer
        if( kineticStage ) {
            // resize div
            $("#kineticDiv").width(newWidth);
            $("#kineticDiv").height(newHeight);
            // resize stage
            var kZoomX = kineticStage.scale().x * mul;
            var kZoomY = kineticStage.scale().y * mul;
            kineticStage.setWidth(newWidth);
            kineticStage.setHeight(newHeight);
            kineticStage.scale( {x: kZoomX, y: kZoomY} );
            kineticStage.draw();
        }
    };
    
    /**
     * Toggle the display of the info layer.
     * @method toggleInfoLayerDisplay
     */
    this.toggleInfoLayerDisplay = function()
    {
        // toggle html
        dwv.html.toggleDisplay('infoLayer');
        // toggle listeners
        if( isInfoLayerListening ) {
            removeImageInfoListeners();
        }
        else {
            addImageInfoListeners();
        }
    };
    
    /**
     * Init the Window/Level display
     */
    this.initWLDisplay = function()
    {
        // set window/level
        var keys = Object.keys(dwv.tool.presets);
        dwv.tool.updateWindowingData(
            dwv.tool.presets[keys[0]].center, 
            dwv.tool.presets[keys[0]].width );
        // default position
        dwv.tool.updatePostionValue(0,0);
    };

    // Private Methods -------------------------------------------

    /**
     * Add image listeners.
     * @method addImageInfoListeners
     * @private
     */
    function addImageInfoListeners()
    {
        view.addEventListener("wlchange", dwv.info.updateWindowingDiv);
        view.addEventListener("wlchange", dwv.info.updateMiniColorMap);
        view.addEventListener("wlchange", dwv.info.updatePlotMarkings);
        view.addEventListener("colorchange", dwv.info.updateMiniColorMap);
        view.addEventListener("positionchange", dwv.info.updatePositionDiv);
        isInfoLayerListening = true;
    }
    
    /**
     * Remove image listeners.
     * @method removeImageInfoListeners
     * @private
     */
    function removeImageInfoListeners()
    {
        view.removeEventListener("wlchange", dwv.info.updateWindowingDiv);
        view.removeEventListener("wlchange", dwv.info.updateMiniColorMap);
        view.removeEventListener("wlchange", dwv.info.updatePlotMarkings);
        view.removeEventListener("colorchange", dwv.info.updateMiniColorMap);
        view.removeEventListener("positionchange", dwv.info.updatePositionDiv);
        isInfoLayerListening = false;
    }
    
    /**
     * General-purpose event handler. This function just determines the mouse 
     * position relative to the canvas element. It then passes it to the current tool.
     * @method eventHandler
     * @private
     * @param {Object} event The event to handle.
     */
    function eventHandler(event)
    {
        // flag not to get confused between touch and mouse
        var handled = false;
        // Store the event position relative to the image canvas
        // in an extra member of the event:
        // event._x and event._y.
        if( event.type === "touchstart" ||
            event.type === "touchmove")
        {
            event.preventDefault();
            var touches = event.targetTouches;
            // If there's one or two fingers inside this element
            if( touches.length === 1 || touches.length === 2)
            {
                var touch = touches[0];
                // store
                event._x = touch.pageX - parseInt(app.getImageLayer().getOffset().left, 10);
                event._xs = event._x;
                //event._x = parseInt( (event._x / zoom), 10 );
                event._y = touch.pageY - parseInt(app.getImageLayer().getOffset().top, 10);
                event._ys = event._y;
                //event._y = parseInt( (event._y / zoom), 10 );
                var t = self.getImageLayer().displayToIndex( {'x': event._x, 'y': event._y} );
                event._x = parseInt( t.x, 10 );
                event._y = parseInt( t.y, 10 );
                // second finger
                if (touches.length === 2) {
                    touch = touches[1];
                    // store
                    event._x1 = touch.pageX - parseInt(app.getImageLayer().getOffset().left, 10);
                    //event._x1 = parseInt( (event._x1 / zoom), 10 );
                    event._y1 = touch.pageY - parseInt(app.getImageLayer().getOffset().top, 10);
                    //event._y1 = parseInt( (event._y1 / zoom), 10 );
                    var t1 = self.getImageLayer().displayToIndex( {'x': event._x1, 'y': event._y1} );
                    event._x1 = parseInt( t1.x, 10 );
                    event._y1 = parseInt( t1.y, 10 );
                }
                // set handle event flag
                handled = true;
            }
        }
        else if( event.type === "mousemove" ||
            event.type === "mousedown" ||
            event.type === "mouseup" ||
            event.type === "mouseout" ||
            event.type === "mousewheel" ||
            event.type === "dblclick" ||
            event.type === "DOMMouseScroll" )
        {
            // layerX is for firefox
            event._x = event.offsetX === undefined ? event.layerX : event.offsetX;
            event._xs = event._x;
            //event._x = parseInt( (event._x / zoom), 10 );
            event._y = event.offsetY === undefined ? event.layerY : event.offsetY;
            event._ys = event._y;
            //event._y = parseInt( (event._y / zoom), 10 );
            var p = self.getImageLayer().displayToIndex( {'x': event._x, 'y': event._y} );
            event._x = parseInt( p.x, 10 );
            event._y = parseInt( p.y, 10 );
            // set handle event flag
            handled = true;
        }
        else if( event.type === "keydown" || 
                event.type === "touchend")
        {
            handled = true;
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
     * Handle an error: display it to the user.
     * @method handleError
     * @private
     * @param {Object} error The error to handle.
     */
    function handleError(error)
    {
        // alert window
        if( error.name && error.message) {
            alert(error.name+": "+error.message+".");
        }
        else {
            alert("Error: "+error+".");
        }
        // log
        if( error.stack ) {
            console.error(error.stack);
        }
    }
    
    /**
     * Create the application layers.
     * @method createLayers
     * @private
     * @param {Number} dataWidth The width of the input data.
     * @param {Number} dataHeight The height of the input data.
     */
    function createLayers(dataWidth, dataHeight)
    {
        // image layer
        imageLayer = new dwv.html.Layer("imageLayer");
        imageLayer.initialise(dataWidth, dataHeight);
        imageLayer.fillContext();
        imageLayer.setStyleDisplay(true);
        // kinetic layer
        if( document.getElementById("kineticDiv") !== null) {
            // create stage
            kineticStage = new Kinetic.Stage({
                container: 'kineticDiv',
                width: dataWidth,
                height: dataHeight
            });
            // create layer
            kineticLayer = new Kinetic.Layer();
            // add the layer to the stage
            kineticStage.add(kineticLayer);
        }
        
        // resize app
        self.resize();
        
    }
    
    /**
     * Create the DICOM tags table. To be called once the DICOM has been parsed.
     * @method createTagsTable
     * @private
     * @param {Object} dataInfo The data information.
     */
    function createTagsTable(dataInfo)
    {
        // HTML node
        var node = document.getElementById("tags");
        if( node === null ) {
            return;
        }
        // tag list table (without the pixel data)
        if(dataInfo.PixelData) {
            dataInfo.PixelData.value = "...";
        }
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
     * Post load application initialisation. To be called once the DICOM has been parsed.
     * @method postLoadInit
     * @private
     * @param {Object} data The data to display.
     */
    function postLoadInit(data)
    {
        // only initialise the first time
        if( view ) {
            return;
        }
        
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
        
        // get the image data from the image layer
        imageData = self.getImageLayer().getContext().createImageData( 
                dataWidth, dataHeight);

        var kineticDiv = document.getElementById("kineticDiv");
        
        var topLayer = imageLayer.getCanvas();
        if ( kineticLayer ) {
            topLayer = kineticDiv;
        }
        // mouse listeners
        topLayer.addEventListener("mousedown", eventHandler, false);
        topLayer.addEventListener("mousemove", eventHandler, false);
        topLayer.addEventListener("mouseup", eventHandler, false);
        topLayer.addEventListener("mouseout", eventHandler, false);
        topLayer.addEventListener("mousewheel", eventHandler, false);
        topLayer.addEventListener("DOMMouseScroll", eventHandler, false);
        topLayer.addEventListener("dblclick", eventHandler, false);
        // touch listeners
        topLayer.addEventListener("touchstart", eventHandler, false);
        topLayer.addEventListener("touchmove", eventHandler, false);
        topLayer.addEventListener("touchend", eventHandler, false);
        // keydown listener
        window.addEventListener("keydown", eventHandler, true);
        // image listeners
        view.addEventListener("wlchange", app.generateAndDrawImage);
        view.addEventListener("colorchange", app.generateAndDrawImage);
        view.addEventListener("slicechange", app.generateAndDrawImage);
        
        // info layer
        if(document.getElementById("infoLayer")){
            dwv.info.createWindowingDiv();
            dwv.info.createPositionDiv();
            dwv.info.createMiniColorMap();
            dwv.info.createPlot();
            addImageInfoListeners();
        }
        
        // initialise the toolbox
        toolBox.init();
        toolBox.display(true);
        
        // init W/L display
        self.initWLDisplay();        
    }
};
;/** 
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
     * Read Uint data of nBytes size.
     * @method readNumber
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} nBytes The number of bytes to read.
     * @return {Number} The read data.
     */
    this.readNumber = function(byteOffset, nBytes) {
        if( nBytes === 1 ) {
            return this.readUint8(byteOffset, isLittleEndian);
        }
        else if( nBytes === 2 ) {
            return this.readUint16(byteOffset, isLittleEndian);
        }
        else if( nBytes === 4 ) {
            return this.readUint32(byteOffset, isLittleEndian);
        }
        else if( nBytes === 8 ) {
            return this.readFloat32(byteOffset, isLittleEndian);
        }
        else { 
            console.log("Non number: '"+this.readString(byteOffset, nBytes)+"'");
            throw new Error("Unsupported number size.");
        }
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
     * The number of DICOM Items.
     * @property numberOfItems
     * @type Number
     */
    this.numberOfItems = 0;
    /**
     * The pixel buffer.
     * @property pixelBuffer
     * @type Array
     */
    this.pixelBuffer = [];
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
 * If tags have same name (for the 'unknown' and private tags cases), a number is appended
 * making the name unique.
 * @method appendDicomElement
 * @param {Object} element The element to add.
 */
dwv.dicom.DicomParser.prototype.appendDicomElement = function( element )
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
        "value": element.value 
    };
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
    // name
    var name = "dwv::unknown";
    if( dwv.dicom.dictionary[group] ) {
        if( dwv.dicom.dictionary[group][element] ) {
            name = dwv.dicom.dictionary[group][element][2];
        }
    }
    // return
    return {'group': group, 'element': element, 'name': name};
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
            vr = "UN";
            if( dwv.dicom.dictionary[tag.group] ) {
                if( dwv.dicom.dictionary[tag.group][tag.element] ) {
                    vr = dwv.dicom.dictionary[tag.group][tag.element][0];
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
        'tag': tag, 
        'vr': vr, 
        'vl': vl, 
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
            'value': dataElement.data 
        });
        // increment index
        i += dataElement.offset;
    }
    
    var startedPixelItems = false;
    
    var tagName = "";
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
        });
        // increment index
        i += dataElement.offset;
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

/**
 * Get an Image object from the read DICOM file.
 * @method createImage
 * @returns {View} A new Image.
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

    // special jpeg 2000 case: openjpeg returns a Uint8 planar MONO or RGB image
    var syntax = dwv.utils.cleanString(
        this.dicomElements.TransferSyntaxUID.value[0] );
    var jpeg2000 = dwv.dicom.isJpeg2000TransferSyntax( syntax );
    
    // buffer data
    var buffer = null;
    // convert to 16bit if needed
    if( jpeg2000 && this.dicomElements.BitsAllocated.value[0] === 16 )
    {
        var sliceSize = size.getSliceSize();
        buffer = new Int16Array( sliceSize );
        var k = 0;
        for( var p = 0; p < sliceSize; ++p ) {
            buffer[p] = 256 * this.pixelBuffer[k] + this.pixelBuffer[k+1];
            k += 2;
        }
    }
    else
    {
        buffer = new Int16Array(this.pixelBuffer.length);
        // unsigned to signed data if needed
        var shift = false;
        if( this.dicomElements.PixelRepresentation &&
                this.dicomElements.PixelRepresentation.value[0] == 1) {
            shift = true;
        }
        // copy
        for( var i=0; i<this.pixelBuffer.length; ++i ) {
            buffer[i] = this.pixelBuffer[i];
            if( shift && buffer[i] >= Math.pow(2, 15) ) {
                buffer[i] -= Math.pow(2, 16);
            }
        }
    }
    
    // slice position
    var slicePosition = new Array(0,0,0);
    if( this.dicomElements.ImagePositionPatient ) {
        slicePosition = [ parseFloat(this.dicomElements.ImagePositionPatient.value[0]),
            parseFloat(this.dicomElements.ImagePositionPatient.value[1]),
            parseFloat(this.dicomElements.ImagePositionPatient.value[2]) ];
    }
    
    // image
    var image = new dwv.image.Image( size, spacing, buffer, [slicePosition] );
    // photometricInterpretation
    if( this.dicomElements.PhotometricInterpretation ) {
        var photo = dwv.utils.cleanString(
            this.dicomElements.PhotometricInterpretation.value[0]).toUpperCase();
        if( jpeg2000 && photo.match(/YBR/) ) {
            photo = "RGB";
        }
        image.setPhotometricInterpretation( photo );
    }        
    // planarConfiguration
    if( this.dicomElements.PlanarConfiguration ) {
        var planar = this.dicomElements.PlanarConfiguration.value[0];
        if( jpeg2000 ) {
            planar = 1;
        }
        image.setPlanarConfiguration( planar );
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
                else {
                    name = "Default"+j;
                }
                windowPresets.push({
                    "center": parseFloat( this.dicomElements.WindowCenter.value[j], 10 ),
                    "width": width, 
                    "name": name
                });
            }
        }
    }
    if( windowPresets.length !== 0 ) {
        view.setWindowPresets( windowPresets );
    }
    else {
        view.setWindowLevelMinMax();
    }

    return view;
};
;/** 
 * DICOM module.
 * @module dicom
 */
var dwv = dwv || {};
dwv.dicom = dwv.dicom || {};

/**
 * DICOM tag dictionary.
 * @namespace dwv.dicom
 */
dwv.dicom.dictionary = {
    '0x0000': {
        '0x0000': ['UL', '1', 'GroupLength'],
        '0x0001': ['UL', '1', 'CommandLengthToEnd'],
        '0x0002': ['UI', '1', 'AffectedSOPClassUID'],
        '0x0003': ['UI', '1', 'RequestedSOPClassUID'],
        '0x0010': ['CS', '1', 'CommandRecognitionCode'],
        '0x0100': ['US', '1', 'CommandField'],
        '0x0110': ['US', '1', 'MessageID'],
        '0x0120': ['US', '1', 'MessageIDBeingRespondedTo'],
        '0x0200': ['AE', '1', 'Initiator'], 
        '0x0300': ['AE', '1', 'Receiver'],
        '0x0400': ['AE', '1', 'FindLocation'],
        '0x0600': ['AE', '1', 'MoveDestination'],
        '0x0700': ['US', '1', 'Priority'],
        '0x0800': ['US', '1', 'DataSetType'],
        '0x0850': ['US', '1', 'NumberOfMatches'],
        '0x0860': ['US', '1', 'ResponseSequenceNumber'],
        '0x0900': ['US', '1', 'Status'],
        '0x0901': ['AT', '1-n', 'OffendingElement'],
        '0x0902': ['LO', '1', 'ErrorComment'],
        '0x0903': ['US', '1', 'ErrorID'],
        '0x0904': ['OT', '1-n', 'ErrorInformation'],
        '0x1000': ['UI', '1', 'AffectedSOPInstanceUID'],
        '0x1001': ['UI', '1', 'RequestedSOPInstanceUID'],
        '0x1002': ['US', '1', 'EventTypeID'],
        '0x1003': ['OT', '1-n', 'EventInformation'],
        '0x1005': ['AT', '1-n', 'AttributeIdentifierList'],
        '0x1007': ['AT', '1-n', 'ModificationList'],
        '0x1008': ['US', '1', 'ActionTypeID'],
        '0x1009': ['OT', '1-n', 'ActionInformation'],
        '0x1013': ['UI', '1-n', 'SuccessfulSOPInstanceUIDList'],
        '0x1014': ['UI', '1-n', 'FailedSOPInstanceUIDList'],
        '0x1015': ['UI', '1-n', 'WarningSOPInstanceUIDList'],
        '0x1020': ['US', '1', 'NumberOfRemainingSuboperations'],
        '0x1021': ['US', '1', 'NumberOfCompletedSuboperations'],
        '0x1022': ['US', '1', 'NumberOfFailedSuboperations'],
        '0x1023': ['US', '1', 'NumberOfWarningSuboperations'],
        '0x1030': ['AE', '1', 'MoveOriginatorApplicationEntityTitle'],
        '0x1031': ['US', '1', 'MoveOriginatorMessageID'],
        '0x4000': ['AT', '1', 'DialogReceiver'],
        '0x4010': ['AT', '1', 'TerminalType'],
        '0x5010': ['SH', '1', 'MessageSetID'],
        '0x5020': ['SH', '1', 'EndMessageSet'],
        '0x5110': ['AT', '1', 'DisplayFormat'],
        '0x5120': ['AT', '1', 'PagePositionID'],
        '0x5130': ['CS', '1', 'TextFormatID'],
        '0x5140': ['CS', '1', 'NormalReverse'],
        '0x5150': ['CS', '1', 'AddGrayScale'],
        '0x5160': ['CS', '1', 'Borders'],
        '0x5170': ['IS', '1', 'Copies'],
        '0x5180': ['CS', '1', 'OldMagnificationType'],
        '0x5190': ['CS', '1', 'Erase'],
        '0x51A0': ['CS', '1', 'Print'],
        '0x51B0': ['US', '1-n', 'Overlays'],
    },
    '0x0002': {
        '0x0000': ['UL', '1', 'MetaElementGroupLength'],
        '0x0001': ['OB', '1', 'FileMetaInformationVersion'],
        '0x0002': ['UI', '1', 'MediaStorageSOPClassUID'],
        '0x0003': ['UI', '1', 'MediaStorageSOPInstanceUID'],
        '0x0010': ['UI', '1', 'TransferSyntaxUID'],
        '0x0012': ['UI', '1', 'ImplementationClassUID'],
        '0x0013': ['SH', '1', 'ImplementationVersionName'],
        '0x0016': ['AE', '1', 'SourceApplicationEntityTitle'],
        '0x0100': ['UI', '1', 'PrivateInformationCreatorUID'],
        '0x0102': ['OB', '1', 'PrivateInformation'],
    },
    '0x0004': {
        '0x0000': ['UL', '1', 'FileSetGroupLength'],
        '0x1130': ['CS', '1', 'FileSetID'],
        '0x1141': ['CS', '8', 'FileSetDescriptorFileID'],
        '0x1142': ['CS', '1', 'FileSetCharacterSet'],
        '0x1200': ['UL', '1', 'RootDirectoryFirstRecord'],
        '0x1202': ['UL', '1', 'RootDirectoryLastRecord'],
        '0x1212': ['US', '1', 'FileSetConsistencyFlag'],
        '0x1220': ['SQ', '1', 'DirectoryRecordSequence'],
        '0x1400': ['UL', '1', 'NextDirectoryRecordOffset'],
        '0x1410': ['US', '1', 'RecordInUseFlag'],
        '0x1420': ['UL', '1', 'LowerLevelDirectoryOffset'],
        '0x1430': ['CS', '1', 'DirectoryRecordType'],
        '0x1432': ['UI', '1', 'PrivateRecordUID'],
        '0x1500': ['CS', '8', 'ReferencedFileID'],
        '0x1504': ['UL', '1', 'DirectoryRecordOffset'],
        '0x1510': ['UI', '1', 'ReferencedSOPClassUIDInFile'],
        '0x1511': ['UI', '1', 'ReferencedSOPInstanceUIDInFile'],
        '0x1512': ['UI', '1', 'ReferencedTransferSyntaxUIDInFile'],
        '0x1600': ['UL', '1', 'NumberOfReferences'],
    },
    '0x0008': {
        '0x0000': ['UL', '1', 'IdentifyingGroupLength'],
        '0x0001': ['UL', '1', 'LengthToEnd'],
        '0x0005': ['CS', '1', 'SpecificCharacterSet'],
        '0x0008': ['CS', '1-n', 'ImageType'],
        '0x000A': ['US', '1', 'SequenceItemNumber'],
        '0x0010': ['CS', '1', 'RecognitionCode'],
        '0x0012': ['DA', '1', 'InstanceCreationDate'],
        '0x0013': ['TM', '1', 'InstanceCreationTime'],
        '0x0014': ['UI', '1', 'InstanceCreatorUID'],
        '0x0016': ['UI', '1', 'SOPClassUID'],
        '0x0018': ['UI', '1', 'SOPInstanceUID'],
        '0x0020': ['DA', '1', 'StudyDate'],
        '0x0021': ['DA', '1', 'SeriesDate'],
        '0x0022': ['DA', '1', 'AcquisitionDate'],
        '0x0023': ['DA', '1', 'ImageDate'],
        /* '0x0023': ['DA','1','ContentDate'], */
        '0x0024': ['DA', '1', 'OverlayDate'],
        '0x0025': ['DA', '1', 'CurveDate'],
        '0x002A': ['DT', '1', 'AcquisitionDatetime'],
        '0x0030': ['TM', '1', 'StudyTime'],
        '0x0031': ['TM', '1', 'SeriesTime'],
        '0x0032': ['TM', '1', 'AcquisitionTime'],
        '0x0033': ['TM', '1', 'ImageTime'],
        '0x0034': ['TM', '1', 'OverlayTime'],
        '0x0035': ['TM', '1', 'CurveTime'],
        '0x0040': ['US', '1', 'OldDataSetType'],
        '0x0041': ['LT', '1', 'OldDataSetSubtype'],
        '0x0042': ['CS', '1', 'NuclearMedicineSeriesType'],
        '0x0050': ['SH', '1', 'AccessionNumber'],
        '0x0052': ['CS', '1', 'QueryRetrieveLevel'],
        '0x0054': ['AE', '1-n', 'RetrieveAETitle'],
        '0x0058': ['UI', '1-n', 'DataSetFailedSOPInstanceUIDList'],
        '0x0060': ['CS', '1', 'Modality'],
        '0x0061': ['CS', '1-n', 'ModalitiesInStudy'],
        '0x0064': ['CS', '1', 'ConversionType'],
        '0x0068': ['CS', '1', 'PresentationIntentType'],
        '0x0070': ['LO', '1', 'Manufacturer'],
        '0x0080': ['LO', '1', 'InstitutionName'],
        '0x0081': ['ST', '1', 'InstitutionAddress'],
        '0x0082': ['SQ', '1', 'InstitutionCodeSequence'],
        '0x0090': ['PN', '1', 'ReferringPhysicianName'],
        '0x0092': ['ST', '1', 'ReferringPhysicianAddress'],
        '0x0094': ['SH', '1-n', 'ReferringPhysicianTelephoneNumber'],
        '0x0100': ['SH', '1', 'CodeValue'],
        '0x0102': ['SH', '1', 'CodingSchemeDesignator'],
        '0x0103': ['SH', '1', 'CodingSchemeVersion'],
        '0x0104': ['LO', '1', 'CodeMeaning'],
        '0x0105': ['CS', '1', 'MappingResource'],
        '0x0106': ['DT', '1', 'ContextGroupVersion'],
        '0x0107': ['DT', '1', 'ContextGroupLocalVersion'],
        '0x010B': ['CS', '1', 'CodeSetExtensionFlag'],
        '0x010C': ['UI', '1', 'PrivateCodingSchemeCreatorUID'],
        '0x010D': ['UI', '1', 'CodeSetExtensionCreatorUID'],
        '0x010F': ['CS', '1', 'ContextIdentifier'],
        '0x0201': ['SH', '1', 'TimezoneOffsetFromUTC'],
        '0x1000': ['AE', '1', 'NetworkID'],
        '0x1010': ['SH', '1', 'StationName'],
        '0x1030': ['LO', '1', 'StudyDescription'],
        '0x1032': ['SQ', '1', 'ProcedureCodeSequence'],
        '0x103E': ['LO', '1', 'SeriesDescription'],
        '0x1040': ['LO', '1', 'InstitutionalDepartmentName'],
        '0x1048': ['PN', '1-n', 'PhysicianOfRecord'],
        '0x1050': ['PN', '1-n', 'PerformingPhysicianName'],
        '0x1060': ['PN', '1-n', 'PhysicianReadingStudy'],
        '0x1070': ['PN', '1-n', 'OperatorName'],
        '0x1080': ['LO', '1-n', 'AdmittingDiagnosisDescription'],
        '0x1084': ['SQ', '1', 'AdmittingDiagnosisCodeSequence'],
        '0x1090': ['LO', '1', 'ManufacturerModelName'],
        '0x1100': ['SQ', '1', 'ReferencedResultsSequence'],
        '0x1110': ['SQ', '1', 'ReferencedStudySequence'],
        '0x1111': ['SQ', '1', 'ReferencedStudyComponentSequence'],
        '0x1115': ['SQ', '1', 'ReferencedSeriesSequence'],
        '0x1120': ['SQ', '1', 'ReferencedPatientSequence'],
        '0x1125': ['SQ', '1', 'ReferencedVisitSequence'],
        '0x1130': ['SQ', '1', 'ReferencedOverlaySequence'],
        '0x1140': ['SQ', '1', 'ReferencedImageSequence'],
        '0x1145': ['SQ', '1', 'ReferencedCurveSequence'],
        '0x114A': ['SQ', '1', 'ReferencedInstanceSequence'],
        '0x114B': ['LO', '1', 'ReferenceDescription'],
        '0x1150': ['UI', '1', 'ReferencedSOPClassUID'],
        '0x1155': ['UI', '1', 'ReferencedSOPInstanceUID'],
        '0x115A': ['UI', '1-n', 'SOPClassesSupported'],
        '0x1160': ['IS', '1', 'ReferencedFrameNumber'],
        '0x1195': ['UI', '1', 'TransactionUID'],
        '0x1197': ['US', '1', 'FailureReason'],
        '0x1198': ['SQ', '1', 'FailedSOPSequence'],
        '0x1199': ['SQ', '1', 'ReferencedSOPSequence'],
        '0x2110': ['CS', '1', 'LossyImageCompression'],
        '0x2111': ['ST', '1', 'DerivationDescription'],
        '0x2112': ['SQ', '1', 'SourceImageSequence'],
        '0x2120': ['SH', '1', 'StageName'],
        '0x2122': ['IS', '1', 'StageNumber'],
        '0x2124': ['IS', '1', 'NumberOfStages'],
        '0x2128': ['IS', '1', 'ViewNumber'],
        '0x2129': ['IS', '1', 'NumberOfEventTimers'],
        '0x212A': ['IS', '1', 'NumberOfViewsInStage'],
        '0x2130': ['DS', '1-n', 'EventElapsedTime'],
        '0x2132': ['LO', '1-n', 'EventTimerName'],
        '0x2142': ['IS', '1', 'StartTrim'],
        '0x2143': ['IS', '1', 'StopTrim'],
        '0x2144': ['IS', '1', 'RecommendedDisplayFrameRate'],
        '0x2200': ['CS', '1', 'TransducerPosition'],
        '0x2204': ['CS', '1', 'TransducerOrientation'],
        '0x2208': ['CS', '1', 'AnatomicStructure'],
        '0x2218': ['SQ', '1', 'AnatomicRegionSequence'],
        '0x2220': ['SQ', '1', 'AnatomicRegionModifierSequence'],
        '0x2228': ['SQ', '1', 'PrimaryAnatomicStructureSequence'],
        '0x2229': ['SQ', '1', 'AnatomicStructureSpaceOrRegionSequence'],
        '0x2230': ['SQ', '1', 'PrimaryAnatomicStructureModifierSequence'],
        '0x2240': ['SQ', '1', 'TransducerPositionSequence'],
        '0x2242': ['SQ', '1', 'TransducerPositionModifierSequence'],
        '0x2244': ['SQ', '1', 'TransducerOrientationSequence'],
        '0x2246': ['SQ', '1', 'TransducerOrientationModifierSequence'],
        '0x4000': ['LT', '1-n', 'IdentifyingComments'],
    },
    '0x0010': {
        '0x0000': ['UL', '1', 'PatientGroupLength'],
        '0x0010': ['PN', '1', 'PatientName'],
        '0x0020': ['LO', '1', 'PatientID'],
        '0x0021': ['LO', '1', 'IssuerOfPatientID'],
        '0x0030': ['DA', '1', 'PatientBirthDate'],
        '0x0032': ['TM', '1', 'PatientBirthTime'],
        '0x0040': ['CS', '1', 'PatientSex'],
        '0x0050': ['SQ', '1', 'PatientInsurancePlanCodeSequence'],
        '0x1000': ['LO', '1-n', 'OtherPatientID'],
        '0x1001': ['PN', '1-n', 'OtherPatientName'],
        '0x1005': ['PN', '1', 'PatientBirthName'],
        '0x1010': ['AS', '1', 'PatientAge'],
        '0x1020': ['DS', '1', 'PatientSize'],
        '0x1030': ['DS', '1', 'PatientWeight'],
        '0x1040': ['LO', '1', 'PatientAddress'],
        '0x1050': ['LT', '1-n', 'InsurancePlanIdentification'],
        '0x1060': ['PN', '1', 'PatientMotherBirthName'],
        '0x1080': ['LO', '1', 'MilitaryRank'],
        '0x1081': ['LO', '1', 'BranchOfService'],
        '0x1090': ['LO', '1', 'MedicalRecordLocator'],
        '0x2000': ['LO', '1-n', 'MedicalAlerts'],
        '0x2110': ['LO', '1-n', 'ContrastAllergies'],
        '0x2150': ['LO', '1', 'CountryOfResidence'],
        '0x2152': ['LO', '1', 'RegionOfResidence'],
        '0x2154': ['SH', '1-n', 'PatientTelephoneNumber'],
        '0x2160': ['SH', '1', 'EthnicGroup'],
        '0x2180': ['SH', '1', 'Occupation'],
        '0x21A0': ['CS', '1', 'SmokingStatus'],
        '0x21B0': ['LT', '1', 'AdditionalPatientHistory'],
        '0x21C0': ['US', '1', 'PregnancyStatus'],
        '0x21D0': ['DA', '1', 'LastMenstrualDate'],
        '0x21F0': ['LO', '1', 'PatientReligiousPreference'],
        '0x4000': ['LT', '1', 'PatientComments'],
    },
    '0x0018': {
        '0x0000': ['UL', '1', 'AcquisitionGroupLength'],
        '0x0010': ['LO', '1', 'ContrastBolusAgent'],
        '0x0012': ['SQ', '1', 'ContrastBolusAgentSequence'],
        '0x0014': ['SQ', '1', 'ContrastBolusAdministrationRouteSequence'],
        '0x0015': ['CS', '1', 'BodyPartExamined'],
        '0x0020': ['CS', '1-n', 'ScanningSequence'],
        '0x0021': ['CS', '1-n', 'SequenceVariant'],
        '0x0022': ['CS', '1-n', 'ScanOptions'],
        '0x0023': ['CS', '1', 'MRAcquisitionType'],
        '0x0024': ['SH', '1', 'SequenceName'],
        '0x0025': ['CS', '1', 'AngioFlag'],
        '0x0026': ['SQ', '1', 'InterventionDrugInformationSequence'],
        '0x0027': ['TM', '1', 'InterventionDrugStopTime'],
        '0x0028': ['DS', '1', 'InterventionDrugDose'],
        '0x0029': ['SQ', '1', 'InterventionalDrugSequence'],
        '0x002A': ['SQ', '1', 'AdditionalDrugSequence'],
        '0x0030': ['LO', '1-n', 'Radionuclide'],
        '0x0031': ['LO', '1-n', 'Radiopharmaceutical'],
        '0x0032': ['DS', '1', 'EnergyWindowCenterline'],
        '0x0033': ['DS', '1-n', 'EnergyWindowTotalWidth'],
        '0x0034': ['LO', '1', 'InterventionalDrugName'],
        '0x0035': ['TM', '1', 'InterventionalDrugStartTime'],
        '0x0036': ['SQ', '1', 'InterventionalTherapySequence'],
        '0x0037': ['CS', '1', 'TherapyType'],
        '0x0038': ['CS', '1', 'InterventionalStatus'],
        '0x0039': ['CS', '1', 'TherapyDescription'],
        '0x0040': ['IS', '1', 'CineRate'],
        '0x0050': ['DS', '1', 'SliceThickness'],
        '0x0060': ['DS', '1', 'KVP'],
        '0x0070': ['IS', '1', 'CountsAccumulated'],
        '0x0071': ['CS', '1', 'AcquisitionTerminationCondition'],
        '0x0072': ['DS', '1', 'EffectiveSeriesDuration'],
        '0x0073': ['CS', '1', 'AcquisitionStartCondition'],
        '0x0074': ['IS', '1', 'AcquisitionStartConditionData'],
        '0x0075': ['IS', '1', 'AcquisitionTerminationConditionData'],
        '0x0080': ['DS', '1', 'RepetitionTime'],
        '0x0081': ['DS', '1', 'EchoTime'],
        '0x0082': ['DS', '1', 'InversionTime'],
        '0x0083': ['DS', '1', 'NumberOfAverages'],
        '0x0084': ['DS', '1', 'ImagingFrequency'],
        '0x0085': ['SH', '1', 'ImagedNucleus'],
        '0x0086': ['IS', '1-n', 'EchoNumber'],
        '0x0087': ['DS', '1', 'MagneticFieldStrength'],
        '0x0088': ['DS', '1', 'SpacingBetweenSlices'],
        '0x0089': ['IS', '1', 'NumberOfPhaseEncodingSteps'],
        '0x0090': ['DS', '1', 'DataCollectionDiameter'],
        '0x0091': ['IS', '1', 'EchoTrainLength'],
        '0x0093': ['DS', '1', 'PercentSampling'],
        '0x0094': ['DS', '1', 'PercentPhaseFieldOfView'],
        '0x0095': ['DS', '1', 'PixelBandwidth'],
        '0x1000': ['LO', '1', 'DeviceSerialNumber'],
        '0x1002': ['UI', '1', 'DeviceUID'],
        '0x1003': ['LO', '1', 'DeviceID'],
        '0x1004': ['LO', '1', 'PlateID'],
        '0x1005': ['LO', '1', 'GeneratorID'],
        '0x1006': ['LO', '1', 'GridID'],
        '0x1007': ['LO', '1', 'CassetteID'],
        '0x1008': ['LO', '1', 'GantryID'],
        '0x1010': ['LO', '1', 'SecondaryCaptureDeviceID'],
        '0x1011': ['LO', '1', 'HardcopyCreationDeviceID'],
        '0x1012': ['DA', '1', 'DateOfSecondaryCapture'],
        '0x1014': ['TM', '1', 'TimeOfSecondaryCapture'],
        '0x1016': ['LO', '1', 'SecondaryCaptureDeviceManufacturer'],
        '0x1017': ['LO', '1', 'HardcopyDeviceManufacturer'],
        '0x1018': ['LO', '1', 'SecondaryCaptureDeviceManufacturerModelName'],
        '0x1019': ['LO', '1-n', 'SecondaryCaptureDeviceSoftwareVersion'],
        '0x101A': ['LO', '1-n', 'HardcopyDeviceSoftwareVersion'],
        '0x101B': ['LO', '1', 'HardcopyDeviceManfuacturersModelName'],
        '0x1020': ['LO', '1-n', 'SoftwareVersion'],
        '0x1022': ['SH', '1', 'VideoImageFormatAcquired'],
        '0x1023': ['LO', '1', 'DigitalImageFormatAcquired'],
        '0x1030': ['LO', '1', 'ProtocolName'],
        '0x1040': ['LO', '1', 'ContrastBolusRoute'],
        '0x1041': ['DS', '1', 'ContrastBolusVolume'],
        '0x1042': ['TM', '1', 'ContrastBolusStartTime'],
        '0x1043': ['TM', '1', 'ContrastBolusStopTime'],
        '0x1044': ['DS', '1', 'ContrastBolusTotalDose'],
        '0x1045': ['IS', '1-n', 'SyringeCounts'],
        '0x1046': ['DS', '1-n', 'ContrastFlowRate'],
        '0x1047': ['DS', '1-n', 'ContrastFlowDuration'],
        '0x1048': ['CS', '1', 'ContrastBolusIngredient'],
        '0x1049': ['DS', '1', 'ContrastBolusIngredientConcentration'],
        '0x1050': ['DS', '1', 'SpatialResolution'],
        '0x1060': ['DS', '1', 'TriggerTime'],
        '0x1061': ['LO', '1', 'TriggerSourceOrType'],
        '0x1062': ['IS', '1', 'NominalInterval'],
        '0x1063': ['DS', '1', 'FrameTime'],
        '0x1064': ['LO', '1', 'FramingType'],
        '0x1065': ['DS', '1-n', 'FrameTimeVector'],
        '0x1066': ['DS', '1', 'FrameDelay'],
        '0x1067': ['DS', '1', 'ImageTriggerDelay'],
        '0x1068': ['DS', '1', 'MultiplexGroupTimeOffset'],
        '0x1069': ['DS', '1', 'TriggerTimeOffset'],
        '0x106A': ['CS', '1', 'SynchronizationTrigger'],
        '0x106C': ['US', '2', 'SynchronizationChannel'],
        '0x106E': ['UL', '1', 'TriggerSamplePosition'],
        '0x1070': ['LO', '1-n', 'RadionuclideRoute'],
        '0x1071': ['DS', '1-n', 'RadionuclideVolume'],
        '0x1072': ['TM', '1-n', 'RadionuclideStartTime'],
        '0x1073': ['TM', '1-n', 'RadionuclideStopTime'],
        '0x1074': ['DS', '1-n', 'RadionuclideTotalDose'],
        '0x1075': ['DS', '1', 'RadionuclideHalfLife'],
        '0x1076': ['DS', '1', 'RadionuclidePositronFraction'],
        '0x1077': ['DS', '1', 'RadiopharmaceuticalSpecificActivity'],
        '0x1080': ['CS', '1', 'BeatRejectionFlag'],
        '0x1081': ['IS', '1', 'LowRRValue'],
        '0x1082': ['IS', '1', 'HighRRValue'],
        '0x1083': ['IS', '1', 'IntervalsAcquired'],
        '0x1084': ['IS', '1', 'IntervalsRejected'],
        '0x1085': ['LO', '1', 'PVCRejection'],
        '0x1086': ['IS', '1', 'SkipBeats'],
        '0x1088': ['IS', '1', 'HeartRate'],
        '0x1090': ['IS', '1', 'CardiacNumberOfImages'],
        '0x1094': ['IS', '1', 'TriggerWindow'],
        '0x1100': ['DS', '1', 'ReconstructionDiameter'],
        '0x1110': ['DS', '1', 'DistanceSourceToDetector'],
        '0x1111': ['DS', '1', 'DistanceSourceToPatient'],
        '0x1114': ['DS', '1', 'EstimatedRadiographicMagnificationFactor'],
        '0x1120': ['DS', '1', 'GantryDetectorTilt'],
        '0x1121': ['DS', '1', 'GantryDetectorSlew'],
        '0x1130': ['DS', '1', 'TableHeight'],
        '0x1131': ['DS', '1', 'TableTraverse'],
        '0x1134': ['DS', '1', 'TableMotion'],
        '0x1135': ['DS', '1-n', 'TableVerticalIncrement'],
        '0x1136': ['DS', '1-n', 'TableLateralIncrement'],
        '0x1137': ['DS', '1-n', 'TableLongitudinalIncrement'],
        '0x1138': ['DS', '1', 'TableAngle'],
        '0x113A': ['CS', '1', 'TableType'],
        '0x1140': ['CS', '1', 'RotationDirection'],
        '0x1141': ['DS', '1', 'AngularPosition'],
        '0x1142': ['DS', '1-n', 'RadialPosition'],
        '0x1143': ['DS', '1', 'ScanArc'],
        '0x1144': ['DS', '1', 'AngularStep'],
        '0x1145': ['DS', '1', 'CenterOfRotationOffset'],
        '0x1146': ['DS', '1-n', 'RotationOffset'],
        '0x1147': ['CS', '1', 'FieldOfViewShape'],
        '0x1149': ['IS', '2', 'FieldOfViewDimension'],
        '0x1150': ['IS', '1', 'ExposureTime'],
        '0x1151': ['IS', '1', 'XrayTubeCurrent'],
        '0x1152': ['IS', '1', 'Exposure'],
        '0x1153': ['IS', '1', 'ExposureinuAs'],
        '0x1154': ['DS', '1', 'AveragePulseWidth'],
        '0x1155': ['CS', '1', 'RadiationSetting'],
        '0x1156': ['CS', '1', 'RectificationType'],
        '0x115A': ['CS', '1', 'RadiationMode'],
        '0x115E': ['DS', '1', 'ImageAreaDoseProduct'],
        '0x1160': ['SH', '1', 'FilterType'],
        '0x1161': ['LO', '1-n', 'TypeOfFilters'],
        '0x1162': ['DS', '1', 'IntensifierSize'],
        '0x1164': ['DS', '2', 'ImagerPixelSpacing'],
        '0x1166': ['CS', '1', 'Grid'],
        '0x1170': ['IS', '1', 'GeneratorPower'],
        '0x1180': ['SH', '1', 'CollimatorGridName'],
        '0x1181': ['CS', '1', 'CollimatorType'],
        '0x1182': ['IS', '1', 'FocalDistance'],
        '0x1183': ['DS', '1', 'XFocusCenter'],
        '0x1184': ['DS', '1', 'YFocusCenter'],
        '0x1190': ['DS', '1-n', 'FocalSpot'],
        '0x1191': ['CS', '1', 'AnodeTargetMaterial'],
        '0x11A0': ['DS', '1', 'BodyPartThickness'],
        '0x11A2': ['DS', '1', 'CompressionForce'],
        '0x1200': ['DA', '1-n', 'DateOfLastCalibration'],
        '0x1201': ['TM', '1-n', 'TimeOfLastCalibration'],
        '0x1210': ['SH', '1-n', 'ConvolutionKernel'],
        '0x1240': ['IS', '1-n', 'UpperLowerPixelValues'],
        '0x1242': ['IS', '1', 'ActualFrameDuration'],
        '0x1243': ['IS', '1', 'CountRate'],
        '0x1244': ['US', '1', 'PreferredPlaybackSequencing'],
        '0x1250': ['SH', '1', 'ReceivingCoil'],
        '0x1251': ['SH', '1', 'TransmittingCoil'],
        '0x1260': ['SH', '1', 'PlateType'],
        '0x1261': ['LO', '1', 'PhosphorType'],
        '0x1300': ['IS', '1', 'ScanVelocity'],
        '0x1301': ['CS', '1-n', 'WholeBodyTechnique'],
        '0x1302': ['IS', '1', 'ScanLength'],
        '0x1310': ['US', '4', 'AcquisitionMatrix'],
        '0x1312': ['CS', '1', 'PhaseEncodingDirection'],
        '0x1314': ['DS', '1', 'FlipAngle'],
        '0x1315': ['CS', '1', 'VariableFlipAngleFlag'],
        '0x1316': ['DS', '1', 'SAR'],
        '0x1318': ['DS', '1', 'dBdt'],
        '0x1400': ['LO', '1', 'AcquisitionDeviceProcessingDescription'],
        '0x1401': ['LO', '1', 'AcquisitionDeviceProcessingCode'],
        '0x1402': ['CS', '1', 'CassetteOrientation'],
        '0x1403': ['CS', '1', 'CassetteSize'],
        '0x1404': ['US', '1', 'ExposuresOnPlate'],
        '0x1405': ['IS', '1', 'RelativeXrayExposure'],
        '0x1450': ['DS', '1', 'ColumnAngulation'],
        '0x1460': ['DS', '1', 'TomoLayerHeight'],
        '0x1470': ['DS', '1', 'TomoAngle'],
        '0x1480': ['DS', '1', 'TomoTime'],
        '0x1490': ['CS', '1', 'TomoType'],
        '0x1491': ['CS', '1', 'TomoClass'],
        '0x1495': ['IS', '1', 'NumberofTomosynthesisSourceImages'],
        '0x1500': ['CS', '1', 'PositionerMotion'],
        '0x1508': ['CS', '1', 'PositionerType'],
        '0x1510': ['DS', '1', 'PositionerPrimaryAngle'],
        '0x1511': ['DS', '1', 'PositionerSecondaryAngle'],
        '0x1520': ['DS', '1-n', 'PositionerPrimaryAngleIncrement'],
        '0x1521': ['DS', '1-n', 'PositionerSecondaryAngleIncrement'],
        '0x1530': ['DS', '1', 'DetectorPrimaryAngle'],
        '0x1531': ['DS', '1', 'DetectorSecondaryAngle'],
        '0x1600': ['CS', '3', 'ShutterShape'],
        '0x1602': ['IS', '1', 'ShutterLeftVerticalEdge'],
        '0x1604': ['IS', '1', 'ShutterRightVerticalEdge'],
        '0x1606': ['IS', '1', 'ShutterUpperHorizontalEdge'],
        '0x1608': ['IS', '1', 'ShutterLowerHorizontalEdge'],
        '0x1610': ['IS', '1', 'CenterOfCircularShutter'],
        '0x1612': ['IS', '1', 'RadiusOfCircularShutter'],
        '0x1620': ['IS', '1-n', 'VerticesOfPolygonalShutter'],
        '0x1622': ['US', '1', 'ShutterPresentationValue'],
        '0x1623': ['US', '1', 'ShutterOverlayGroup'],
        '0x1700': ['CS', '3', 'CollimatorShape'],
        '0x1702': ['IS', '1', 'CollimatorLeftVerticalEdge'],
        '0x1704': ['IS', '1', 'CollimatorRightVerticalEdge'],
        '0x1706': ['IS', '1', 'CollimatorUpperHorizontalEdge'],
        '0x1708': ['IS', '1', 'CollimatorLowerHorizontalEdge'],
        '0x1710': ['IS', '1', 'CenterOfCircularCollimator'],
        '0x1712': ['IS', '1', 'RadiusOfCircularCollimator'],
        '0x1720': ['IS', '1-n', 'VerticesOfPolygonalCollimator'],
        '0x1800': ['CS', '1', 'AcquisitionTimeSynchronized'],
        '0x1801': ['SH', '1', 'TimeSource'],
        '0x1802': ['CS', '1', 'TimeDistributionProtocol'],
        '0x1810': ['DT', '1', 'AcquisitionTimestamp'],
        '0x4000': ['LT', '1-n', 'AcquisitionComments'],
        '0x5000': ['SH', '1-n', 'OutputPower'],
        '0x5010': ['LO', '3', 'TransducerData'],
        '0x5012': ['DS', '1', 'FocusDepth'],
        '0x5020': ['LO', '1', 'PreprocessingFunction'],
        '0x5021': ['LO', '1', 'PostprocessingFunction'],
        '0x5022': ['DS', '1', 'MechanicalIndex'],
        '0x5024': ['DS', '1', 'ThermalIndex'],
        '0x5026': ['DS', '1', 'CranialThermalIndex'],
        '0x5027': ['DS', '1', 'SoftTissueThermalIndex'],
        '0x5028': ['DS', '1', 'SoftTissueFocusThermalIndex'],
        '0x5029': ['DS', '1', 'SoftTissueSurfaceThermalIndex'],
        '0x5030': ['DS', '1', 'DynamicRange'],
        '0x5040': ['DS', '1', 'TotalGain'],
        '0x5050': ['IS', '1', 'DepthOfScanField'],
        '0x5100': ['CS', '1', 'PatientPosition'],
        '0x5101': ['CS', '1', 'ViewPosition'],
        '0x5104': ['SQ', '1', 'ProjectionEponymousNameCodeSequence'],
        '0x5210': ['DS', '6', 'ImageTransformationMatrix'],
        '0x5212': ['DS', '3', 'ImageTranslationVector'],
        '0x6000': ['DS', '1', 'Sensitivity'],
        '0x6011': ['SQ', '1', 'SequenceOfUltrasoundRegions'],
        '0x6012': ['US', '1', 'RegionSpatialFormat'],
        '0x6014': ['US', '1', 'RegionDataType'],
        '0x6016': ['UL', '1', 'RegionFlags'],
        '0x6018': ['UL', '1', 'RegionLocationMinX0'],
        '0x601A': ['UL', '1', 'RegionLocationMinY0'],
        '0x601C': ['UL', '1', 'RegionLocationMaxX1'],
        '0x601E': ['UL', '1', 'RegionLocationMaxY1'],
        '0x6020': ['SL', '1', 'ReferencePixelX0'],
        '0x6022': ['SL', '1', 'ReferencePixelY0'],
        '0x6024': ['US', '1', 'PhysicalUnitsXDirection'],
        '0x6026': ['US', '1', 'PhysicalUnitsYDirection'],
        '0x6028': ['FD', '1', 'ReferencePixelPhysicalValueX'],
        '0x602A': ['FD', '1', 'ReferencePixelPhysicalValueY'],
        '0x602C': ['FD', '1', 'PhysicalDeltaX'],
        '0x602E': ['FD', '1', 'PhysicalDeltaY'],
        '0x6030': ['UL', '1', 'TransducerFrequency'],
        '0x6031': ['CS', '1', 'TransducerType'],
        '0x6032': ['UL', '1', 'PulseRepetitionFrequency'],
        '0x6034': ['FD', '1', 'DopplerCorrectionAngle'],
        '0x6036': ['FD', '1', 'SteeringAngle'],
        '0x6038': ['UL', '1', 'DopplerSampleVolumeXPosition'],
        '0x603A': ['UL', '1', 'DopplerSampleVolumeYPosition'],
        '0x603C': ['UL', '1', 'TMLinePositionX0'],
        '0x603E': ['UL', '1', 'TMLinePositionY0'],
        '0x6040': ['UL', '1', 'TMLinePositionX1'],
        '0x6042': ['UL', '1', 'TMLinePositionY1'],
        '0x6044': ['US', '1', 'PixelComponentOrganization'],
        '0x6046': ['UL', '1', 'PixelComponentMask'],
        '0x6048': ['UL', '1', 'PixelComponentRangeStart'],
        '0x604A': ['UL', '1', 'PixelComponentRangeStop'],
        '0x604C': ['US', '1', 'PixelComponentPhysicalUnits'],
        '0x604E': ['US', '1', 'PixelComponentDataType'],
        '0x6050': ['UL', '1', 'NumberOfTableBreakPoints'],
        '0x6052': ['UL', '1-n', 'TableOfXBreakPoints'],
        '0x6054': ['FD', '1-n', 'TableOfYBreakPoints'],
        '0x6056': ['UL', '1', 'NumberOfTableEntries'],
        '0x6058': ['UL', '1-n', 'TableOfPixelValues'],
        '0x605A': ['FL', '1-n', 'TableOfParameterValues'],
        '0x7000': ['CS', '1', 'DetectorConditionsNominalFlag'],
        '0x7001': ['DS', '1', 'DetectorTemperature'],
        '0x7004': ['CS', '1', 'DetectorType'],
        '0x7005': ['CS', '1', 'DetectorConfiguration'],
        '0x7006': ['LT', '1', 'DetectorDescription'],
        '0x7008': ['LT', '1', 'DetectorMode'],
        '0x700A': ['SH', '1', 'DetectorID'],
        '0x700C': ['DA', '1', 'DateofLastDetectorCalibration'],
        '0x700E': ['TM', '1', 'TimeofLastDetectorCalibration'],
        '0x7010': ['IS', '1', 'ExposuresOnDetectorSinceLastCalibration'],
        '0x7011': ['IS', '1', 'ExposuresOnDetectorSinceManufactured'],
        '0x7012': ['DS', '1', 'DetectorTimeSinceLastExposure'],
        '0x7014': ['DS', '1', 'DetectorActiveTime'],
        '0x7016': ['DS', '1', 'DetectorActivationOffsetFromExposure'],
        '0x701A': ['DS', '2', 'DetectorBinning'],
        '0x7020': ['DS', '2', 'DetectorElementPhysicalSize'],
        '0x7022': ['DS', '2', 'DetectorElementSpacing'],
        '0x7024': ['CS', '1', 'DetectorActiveShape'],
        '0x7026': ['DS', '1-2', 'DetectorActiveDimensions'],
        '0x7028': ['DS', '2', 'DetectorActiveOrigin'],
        '0x7030': ['DS', '2', 'FieldofViewOrigin'],
        '0x7032': ['DS', '1', 'FieldofViewRotation'],
        '0x7034': ['CS', '1', 'FieldofViewHorizontalFlip'],
        '0x7040': ['LT', '1', 'GridAbsorbingMaterial'],
        '0x7041': ['LT', '1', 'GridSpacingMaterial'],
        '0x7042': ['DS', '1', 'GridThickness'],
        '0x7044': ['DS', '1', 'GridPitch'],
        '0x7046': ['IS', '2', 'GridAspectRatio'],
        '0x7048': ['DS', '1', 'GridPeriod'],
        '0x704C': ['DS', '1', 'GridFocalDistance'],
        '0x7050': ['LT', '1-n', 'FilterMaterial'],
        '0x7052': ['DS', '1-n', 'FilterThicknessMinimum'],
        '0x7054': ['DS', '1-n', 'FilterThicknessMaximum'],
        '0x7060': ['CS', '1', 'ExposureControlMode'],
        '0x7062': ['LT', '1', 'ExposureControlModeDescription'],
        '0x7064': ['CS', '1', 'ExposureStatus'],
        '0x7065': ['DS', '1', 'PhototimerSetting'],
    },
    '0x0020': {
        '0x0000': ['UL', '1', 'ImageGroupLength'],
        '0x000D': ['UI', '1', 'StudyInstanceUID'],
        '0x000E': ['UI', '1', 'SeriesInstanceUID'],
        '0x0010': ['SH', '1', 'StudyID'],
        '0x0011': ['IS', '1', 'SeriesNumber'],
        '0x0012': ['IS', '1', 'AcquisitionNumber'],
        '0x0013': ['IS', '1', 'ImageNumber'],
        '0x0014': ['IS', '1', 'IsotopeNumber'],
        '0x0015': ['IS', '1', 'PhaseNumber'],
        '0x0016': ['IS', '1', 'IntervalNumber'],
        '0x0017': ['IS', '1', 'TimeSlotNumber'],
        '0x0018': ['IS', '1', 'AngleNumber'],
        '0x0019': ['IS', '1', 'ItemNumber'],
        '0x0020': ['CS', '2', 'PatientOrientation'],
        '0x0022': ['IS', '1', 'OverlayNumber'],
        '0x0024': ['IS', '1', 'CurveNumber'],
        '0x0026': ['IS', '1', 'LUTNumber'],
        '0x0030': ['DS', '3', 'ImagePosition'],
        '0x0032': ['DS', '3', 'ImagePositionPatient'],
        '0x0035': ['DS', '6', 'ImageOrientation'],
        '0x0037': ['DS', '6', 'ImageOrientationPatient'],
        '0x0050': ['DS', '1', 'Location'],
        '0x0052': ['UI', '1', 'FrameOfReferenceUID'],
        '0x0060': ['CS', '1', 'Laterality'],
        '0x0062': ['CS', '1', 'ImageLaterality'],
        '0x0070': ['LT', '1', 'ImageGeometryType'],
        '0x0080': ['CS', '1-n', 'MaskingImage'],
        '0x0100': ['IS', '1', 'TemporalPositionIdentifier'],
        '0x0105': ['IS', '1', 'NumberOfTemporalPositions'],
        '0x0110': ['DS', '1', 'TemporalResolution'],
        '0x0200': ['UI', '1', 'SynchronizationFrameofReferenceUID'],
        '0x1000': ['IS', '1', 'SeriesInStudy'],
        '0x1001': ['IS', '1', 'AcquisitionsInSeries'],
        '0x1002': ['IS', '1', 'ImagesInAcquisition'],
        '0x1003': ['IS', '1', 'ImagesInSeries'],
        '0x1004': ['IS', '1', 'AcquisitionsInStudy'],
        '0x1005': ['IS', '1', 'ImagesInStudy'],
        '0x1020': ['CS', '1-n', 'Reference'],
        '0x1040': ['LO', '1', 'PositionReferenceIndicator'],
        '0x1041': ['DS', '1', 'SliceLocation'],
        '0x1070': ['IS', '1-n', 'OtherStudyNumbers'],
        '0x1200': ['IS', '1', 'NumberOfPatientRelatedStudies'],
        '0x1202': ['IS', '1', 'NumberOfPatientRelatedSeries'],
        '0x1204': ['IS', '1', 'NumberOfPatientRelatedImages'],
        '0x1206': ['IS', '1', 'NumberOfStudyRelatedSeries'],
        '0x1208': ['IS', '1', 'NumberOfStudyRelatedImages'],
        '0x1209': ['IS', '1', 'NumberOfSeriesRelatedInstances'],
        '0x3100': ['CS', '1-n', 'SourceImageID'],
        '0x3401': ['CS', '1', 'ModifyingDeviceID'],
        '0x3402': ['CS', '1', 'ModifiedImageID'],
        '0x3403': ['DA', '1', 'ModifiedImageDate'],
        '0x3404': ['LO', '1', 'ModifyingDeviceManufacturer'],
        '0x3405': ['TM', '1', 'ModifiedImageTime'],
        '0x3406': ['LT', '1', 'ModifiedImageDescription'],
        '0x4000': ['LT', '1', 'ImageComments'],
        '0x5000': ['AT', '1-n', 'OriginalImageIdentification'],
        '0x5002': ['CS', '1-n', 'OriginalImageIdentificationNomenclature'],
    },
    '0x0028': {
        '0x0000': ['UL', '1', 'ImagePresentationGroupLength'],
        '0x0002': ['US', '1', 'SamplesPerPixel'],
        '0x0004': ['CS', '1', 'PhotometricInterpretation'],
        '0x0005': ['US', '1', 'ImageDimensions'],
        '0x0006': ['US', '1', 'PlanarConfiguration'],
        '0x0008': ['IS', '1', 'NumberOfFrames'],
        '0x0009': ['AT', '1', 'FrameIncrementPointer'],
        '0x0010': ['US', '1', 'Rows'],
        '0x0011': ['US', '1', 'Columns'],
        '0x0012': ['US', '1', 'Planes'],
        '0x0014': ['US', '1', 'UltrasoundColorDataPresent'],
        '0x0030': ['DS', '2', 'PixelSpacing'],
        '0x0031': ['DS', '2', 'ZoomFactor'],
        '0x0032': ['DS', '2', 'ZoomCenter'],
        '0x0034': ['IS', '2', 'PixelAspectRatio'],
        '0x0040': ['CS', '1', 'ImageFormat'],
        '0x0050': ['LT', '1-n', 'ManipulatedImage'],
        '0x0051': ['CS', '1', 'CorrectedImage'],
        '0x005F': ['CS', '1', 'CompressionRecognitionCode'],
        '0x0060': ['CS', '1', 'CompressionCode'],
        '0x0061': ['SH', '1', 'CompressionOriginator'],
        '0x0062': ['SH', '1', 'CompressionLabel'],
        '0x0063': ['SH', '1', 'CompressionDescription'],
        '0x0065': ['CS', '1-n', 'CompressionSequence'],
        '0x0066': ['AT', '1-n', 'CompressionStepPointers'],
        '0x0068': ['US', '1', 'RepeatInterval'],
        '0x0069': ['US', '1', 'BitsGrouped'],
        '0x0070': ['US', '1-n', 'PerimeterTable'],
        '0x0071': ['XS', '1', 'PerimeterValue'],
        '0x0080': ['US', '1', 'PredictorRows'],
        '0x0081': ['US', '1', 'PredictorColumns'],
        '0x0082': ['US', '1-n', 'PredictorConstants'],
        '0x0090': ['CS', '1', 'BlockedPixels'],
        '0x0091': ['US', '1', 'BlockRows'],
        '0x0092': ['US', '1', 'BlockColumns'],
        '0x0093': ['US', '1', 'RowOverlap'],
        '0x0094': ['US', '1', 'ColumnOverlap'],
        '0x0100': ['US', '1', 'BitsAllocated'],
        '0x0101': ['US', '1', 'BitsStored'],
        '0x0102': ['US', '1', 'HighBit'],
        '0x0103': ['US', '1', 'PixelRepresentation'],
        '0x0104': ['XS', '1', 'SmallestValidPixelValue'],
        '0x0105': ['XS', '1', 'LargestValidPixelValue'],
        '0x0106': ['XS', '1', 'SmallestImagePixelValue'],
        '0x0107': ['XS', '1', 'LargestImagePixelValue'],
        '0x0108': ['XS', '1', 'SmallestPixelValueInSeries'],
        '0x0109': ['XS', '1', 'LargestPixelValueInSeries'],
        '0x0110': ['XS', '1', 'SmallestPixelValueInPlane'],
        '0x0111': ['XS', '1', 'LargestPixelValueInPlane'],
        '0x0120': ['XS', '1', 'PixelPaddingValue'],
        '0x0200': ['US', '1', 'ImageLocation'],
        '0x0300': ['CS', '1', 'QualityControlImage'],
        '0x0301': ['CS', '1', 'BurnedInAnnotation'],
        '0x0400': ['CS', '1', 'TransformLabel'],
        '0x0401': ['CS', '1', 'TransformVersionNumber'],
        '0x0402': ['US', '1', 'NumberOfTransformSteps'],
        '0x0403': ['CS', '1-n', 'SequenceOfCompressedData'],
        '0x0404': ['AT', '1-n', 'DetailsOfCoefficients'],
        '0x0410': ['US', '1', 'RowsForNthOrderCoefficients'],
        '0x0411': ['US', '1', 'ColumnsForNthOrderCoefficients'],
        '0x0412': ['CS', '1-n', 'CoefficientCoding'],
        '0x0413': ['AT', '1-n', 'CoefficientCodingPointers'],
        '0x0700': ['CS', '1', 'DCTLabel'],
        '0x0701': ['CS', '1-n', 'DataBlockDescription'],
        '0x0702': ['AT', '1-n', 'DataBlock'],
        '0x0710': ['US', '1', 'NormalizationFactorFormat'],
        '0x0720': ['US', '1', 'ZonalMapNumberFormat'],
        '0x0721': ['AT', '1-n', 'ZonalMapLocation'],
        '0x0722': ['US', '1', 'ZonalMapFormat'],
        '0x0730': ['US', '1', 'AdaptiveMapFormat'],
        '0x0740': ['US', '1', 'CodeNumberFormat'],
        '0x0800': ['CS', '1-n', 'CodeLabel'],
        '0x0802': ['US', '1', 'NumberOfTables'],
        '0x0803': ['AT', '1-n', 'CodeTableLocation'],
        '0x0804': ['US', '1', 'BitsForCodeWord'],
        '0x0808': ['AT', '1-n', 'ImageDataLocation'],
        '0x1040': ['CS', '1', 'PixelIntensityRelationship'],
        '0x1041': ['SS', '1', 'PixelIntensityRelationshipSign'],
        '0x1050': ['DS', '1-n', 'WindowCenter'],
        '0x1051': ['DS', '1-n', 'WindowWidth'],
        '0x1052': ['DS', '1', 'RescaleIntercept'],
        '0x1053': ['DS', '1', 'RescaleSlope'],
        '0x1054': ['LO', '1', 'RescaleType'],
        '0x1055': ['LO', '1-n', 'WindowCenterWidthExplanation'],
        '0x1080': ['CS', '1', 'GrayScale'],
        '0x1090': ['CS', '1', 'RecommendedViewingMode'],
        '0x1100': ['XS', '3', 'GrayLookupTableDescriptor'],
        '0x1101': ['XS', '3', 'RedPaletteColorLookupTableDescriptor'],
        '0x1102': ['XS', '3', 'GreenPaletteColorLookupTableDescriptor'],
        '0x1103': ['XS', '3', 'BluePaletteColorLookupTableDescriptor'],
        '0x1111': ['US', '4', 'LargeRedPaletteColorLookupTableDescriptor'],
        '0x1112': ['US', '4', 'LargeGreenPaletteColorLookupTabe'],
        '0x1113': ['US', '4', 'LargeBluePaletteColorLookupTabl'],
        '0x1199': ['UI', '1', 'PaletteColorLookupTableUID'],
        '0x1200': ['XS', '1-n', 'GrayLookupTableData'],
        '0x1201': ['XS', '1-n', 'RedPaletteColorLookupTableData'],
        '0x1202': ['XS', '1-n', 'GreenPaletteColorLookupTableData'],
        '0x1203': ['XS', '1-n', 'BluePaletteColorLookupTableData'],
        '0x1211': ['OW', '1', 'LargeRedPaletteColorLookupTableData'],
        '0x1212': ['OW', '1', 'LargeGreenPaletteColorLookupTableData'],
        '0x1213': ['OW', '1', 'LargeBluePaletteColorLookupTableData'],
        '0x1214': ['UI', '1', 'LargePaletteColorLookupTableUID'],
        '0x1221': ['OW', '1', 'SegmentedRedPaletteColorLookupTableData'],
        '0x1222': ['OW', '1', 'SegmentedGreenPaletteColorLookupTableData'],
        '0x1223': ['OW', '1', 'SegmentedBluePaletteColorLookupTableData'],
        '0x1300': ['CS', '1', 'ImplantPresent'],
        '0x2110': ['CS', '1', 'LossyImageCompression'],
        '0x2112': ['DS', '1-n', 'LossyImageCompressionRatio'],
        '0x3000': ['SQ', '1', 'ModalityLUTSequence'],
        '0x3002': ['XS', '3', 'LUTDescriptor'],
        '0x3003': ['LO', '1', 'LUTExplanation'],
        '0x3004': ['LO', '1', 'ModalityLUTType'],
        '0x3006': ['XS', '1-n', 'LUTData'],
        '0x3010': ['SQ', '1', 'VOILUTSequence'],
        '0x3110': ['SQ', '1', 'SoftcopyVOILUTSequence'],
        '0x4000': ['LT', '1-n', 'ImagePresentationComments'],
        '0x5000': ['SQ', '1', 'BiPlaneAcquisitionSequence'],
        '0x6010': ['US', '1', 'RepresentativeFrameNumber'],
        '0x6020': ['US', '1-n', 'FrameNumbersOfInterest'],
        '0x6022': ['LO', '1-n', 'FrameOfInterestDescription'],
        '0x6030': ['US', '1-n', 'MaskPointer'],
        '0x6040': ['US', '1-n', 'RWavePointer'],
        '0x6100': ['SQ', '1', 'MaskSubtractionSequence'],
        '0x6101': ['CS', '1', 'MaskOperation'],
        '0x6102': ['US', '1-n', 'ApplicableFrameRange'],
        '0x6110': ['US', '1-n', 'MaskFrameNumbers'],
        '0x6112': ['US', '1', 'ContrastFrameAveraging'],
        '0x6114': ['FL', '2', 'MaskSubPixelShift'],
        '0x6120': ['SS', '1', 'TIDOffset'],
        '0x6190': ['ST', '1', 'MaskOperationExplanation'],
    },
    '0x0032': {
        '0x0000': ['UL', '1', 'StudyGroupLength'],
        '0x000A': ['CS', '1', 'StudyStatusID'],
        '0x000C': ['CS', '1', 'StudyPriorityID'],
        '0x0012': ['LO', '1', 'StudyIDIssuer'],
        '0x0032': ['DA', '1', 'StudyVerifiedDate'],
        '0x0033': ['TM', '1', 'StudyVerifiedTime'],
        '0x0034': ['DA', '1', 'StudyReadDate'],
        '0x0035': ['TM', '1', 'StudyReadTime'],
        '0x1000': ['DA', '1', 'ScheduledStudyStartDate'],
        '0x1001': ['TM', '1', 'ScheduledStudyStartTime'],
        '0x1010': ['DA', '1', 'ScheduledStudyStopDate'],
        '0x1011': ['TM', '1', 'ScheduledStudyStopTime'],
        '0x1020': ['LO', '1', 'ScheduledStudyLocation'],
        '0x1021': ['AE', '1-n', 'ScheduledStudyLocationAETitle'],
        '0x1030': ['LO', '1', 'ReasonForStudy'],
        '0x1032': ['PN', '1', 'RequestingPhysician'],
        '0x1033': ['LO', '1', 'RequestingService'],
        '0x1040': ['DA', '1', 'StudyArrivalDate'],
        '0x1041': ['TM', '1', 'StudyArrivalTime'],
        '0x1050': ['DA', '1', 'StudyCompletionDate'],
        '0x1051': ['TM', '1', 'StudyCompletionTime'],
        '0x1055': ['CS', '1', 'StudyComponentStatusID'],
        '0x1060': ['LO', '1', 'RequestedProcedureDescription'],
        '0x1064': ['SQ', '1', 'RequestedProcedureCodeSequence'],
        '0x1070': ['LO', '1', 'RequestedContrastAgent'],
        '0x4000': ['LT', '1', 'StudyComments'],
    },
    '0x0038': {
        '0x0000': ['UL', '1', 'VisitGroupLength'],
        '0x0004': ['SQ', '1', 'ReferencedPatientAliasSequence'],
        '0x0008': ['CS', '1', 'VisitStatusID'],
        '0x0010': ['LO', '1', 'AdmissionID'],
        '0x0011': ['LO', '1', 'IssuerOfAdmissionID'],
        '0x0016': ['LO', '1', 'RouteOfAdmissions'],
        '0x001A': ['DA', '1', 'ScheduledAdmissionDate'],
        '0x001B': ['TM', '1', 'ScheduledAdmissionTime'],
        '0x001C': ['DA', '1', 'ScheduledDischargeDate'],
        '0x001D': ['TM', '1', 'ScheduledDischargeTime'],
        '0x001E': ['LO', '1', 'ScheduledPatientInstitutionResidence'],
        '0x0020': ['DA', '1', 'AdmittingDate'],
        '0x0021': ['TM', '1', 'AdmittingTime'],
        '0x0030': ['DA', '1', 'DischargeDate'],
        '0x0032': ['TM', '1', 'DischargeTime'],
        '0x0040': ['LO', '1', 'DischargeDiagnosisDescription'],
        '0x0044': ['SQ', '1', 'DischargeDiagnosisCodeSequence'],
        '0x0050': ['LO', '1', 'SpecialNeeds'],
        '0x0300': ['LO', '1', 'CurrentPatientLocation'],
        '0x0400': ['LO', '1', 'PatientInstitutionResidence'],
        '0x0500': ['LO', '1', 'PatientState'],
        '0x4000': ['LT', '1', 'VisitComments'],
    },
    '0x003A': {
        '0x0004': ['CS', '1', 'WaveformOriginality'],
        '0x0005': ['US', '1', 'NumberofChannels'],
        '0x0010': ['UL', '1', 'NumberofSamples'],
        '0x001A': ['DS', '1', 'SamplingFrequency'],
        '0x0020': ['SH', '1', 'MultiplexGroupLabel'],
        '0x0200': ['SQ', '1', 'ChannelDefinitionSequence'],
        '0x0202': ['IS', '1', 'WVChannelNumber'],
        '0x0203': ['SH', '1', 'ChannelLabel'],
        '0x0205': ['CS', '1-n', 'ChannelStatus'],
        '0x0208': ['SQ', '1', 'ChannelSourceSequence'],
        '0x0209': ['SQ', '1', 'ChannelSourceModifiersSequence'],
        '0x020A': ['SQ', '1', 'SourceWaveformSequence'],
        '0x020C': ['LO', '1', 'ChannelDerivationDescription'],
        '0x0210': ['DS', '1', 'ChannelSensitivity'],
        '0x0211': ['SQ', '1', 'ChannelSensitivityUnits'],
        '0x0212': ['DS', '1', 'ChannelSensitivityCorrectionFactor'],
        '0x0213': ['DS', '1', 'ChannelBaseline'],
        '0x0214': ['DS', '1', 'ChannelTimeSkew'],
        '0x0215': ['DS', '1', 'ChannelSampleSkew'],
        '0x0218': ['DS', '1', 'ChannelOffset'],
        '0x021A': ['US', '1', 'WaveformBitsStored'],
        '0x0220': ['DS', '1', 'FilterLowFrequency'],
        '0x0221': ['DS', '1', 'FilterHighFrequency'],
        '0x0222': ['DS', '1', 'NotchFilterFrequency'],
        '0x0223': ['DS', '1', 'NotchFilterBandwidth'],
    },
    '0x0040': {
        '0x0000': ['UL', '1', 'ModalityWorklistGroupLength'],
        '0x0001': ['AE', '1', 'ScheduledStationAETitle'],
        '0x0002': ['DA', '1', 'ScheduledProcedureStepStartDate'],
        '0x0003': ['TM', '1', 'ScheduledProcedureStepStartTime'],
        '0x0004': ['DA', '1', 'ScheduledProcedureStepEndDate'],
        '0x0005': ['TM', '1', 'ScheduledProcedureStepEndTime'],
        '0x0006': ['PN', '1', 'ScheduledPerformingPhysicianName'],
        '0x0007': ['LO', '1', 'ScheduledProcedureStepDescription'],
        '0x0008': ['SQ', '1', 'ScheduledProcedureStepCodeSequence'],
        '0x0009': ['SH', '1', 'ScheduledProcedureStepID'],
        '0x0010': ['SH', '1', 'ScheduledStationName'],
        '0x0011': ['SH', '1', 'ScheduledProcedureStepLocation'],
        '0x0012': ['LO', '1', 'ScheduledPreOrderOfMedication'],
        '0x0020': ['CS', '1', 'ScheduledProcedureStepStatus'],
        '0x0100': ['SQ', '1-n', 'ScheduledProcedureStepSequence'],
        '0x0220': ['SQ', '1', 'ReferencedStandaloneSOPInstanceSequence'],
        '0x0241': ['AE', '1', 'PerformedStationAETitle'],
        '0x0242': ['SH', '1', 'PerformedStationName'],
        '0x0243': ['SH', '1', 'PerformedLocation'],
        '0x0244': ['DA', '1', 'PerformedProcedureStepStartDate'],
        '0x0245': ['TM', '1', 'PerformedProcedureStepStartTime'],
        '0x0250': ['DA', '1', 'PerformedProcedureStepEndDate'],
        '0x0251': ['TM', '1', 'PerformedProcedureStepEndTime'],
        '0x0252': ['CS', '1', 'PerformedProcedureStepStatus'],
        '0x0253': ['CS', '1', 'PerformedProcedureStepID'],
        '0x0254': ['LO', '1', 'PerformedProcedureStepDescription'],
        '0x0255': ['LO', '1', 'PerformedProcedureTypeDescription'],
        '0x0260': ['SQ', '1', 'PerformedActionItemSequence'],
        '0x0270': ['SQ', '1', 'ScheduledStepAttributesSequence'],
        '0x0275': ['SQ', '1', 'RequestAttributesSequence'],
        '0x0280': ['ST', '1', 'CommentsOnThePerformedProcedureSteps'],
        '0x0293': ['SQ', '1', 'QuantitySequence'],
        '0x0294': ['DS', '1', 'Quantity'],
        '0x0295': ['SQ', '1', 'MeasuringUnitsSequence'],
        '0x0296': ['SQ', '1', 'BillingItemSequence'],
        '0x0300': ['US', '1', 'TotalTimeOfFluoroscopy'],
        '0x0301': ['US', '1', 'TotalNumberOfExposures'],
        '0x0302': ['US', '1', 'EntranceDose'],
        '0x0303': ['US', '1-2', 'ExposedArea'],
        '0x0306': ['DS', '1', 'DistanceSourceToEntrance'],
        '0x0307': ['DS', '1', 'DistanceSourceToSupport'],
        '0x0310': ['ST', '1', 'CommentsOnRadiationDose'],
        '0x0312': ['DS', '1', 'XRayOutput'],
        '0x0314': ['DS', '1', 'HalfValueLayer'],
        '0x0316': ['DS', '1', 'OrganDose'],
        '0x0318': ['CS', '1', 'OrganExposed'],
        '0x0320': ['SQ', '1', 'BillingProcedureStepSequence'],
        '0x0321': ['SQ', '1', 'FilmConsumptionSequence'],
        '0x0324': ['SQ', '1', 'BillingSuppliesAndDevicesSequence'],
        '0x0330': ['SQ', '1', 'ReferencedProcedureStepSequence'],
        '0x0340': ['SQ', '1', 'PerformedSeriesSequence'],
        '0x0400': ['LT', '1', 'CommentsOnScheduledProcedureStep'],
        '0x050A': ['LO', '1', 'SpecimenAccessionNumber'],
        '0x0550': ['SQ', '1', 'SpecimenSequence'],
        '0x0551': ['LO', '1', 'SpecimenIdentifier'],
        '0x0555': ['SQ', '1', 'AcquisitionContextSequence'],
        '0x0556': ['ST', '1', 'AcquisitionContextDescription'],
        '0x059A': ['SQ', '1', 'SpecimenTypeCodeSequence'],
        '0x06FA': ['LO', '1', 'SlideIdentifier'],
        '0x071A': ['SQ', '1', 'ImageCenterPointCoordinatesSequence'],
        '0x072A': ['DS', '1', 'XOffsetInSlideCoordinateSystem'],
        '0x073A': ['DS', '1', 'YOffsetInSlideCoordinateSystem'],
        '0x074A': ['DS', '1', 'ZOffsetInSlideCoordinateSystem'],
        '0x08D8': ['SQ', '1', 'PixelSpacingSequence'],
        '0x08DA': ['SQ', '1', 'CoordinateSystemAxisCodeSequence'],
        '0x08EA': ['SQ', '1', 'MeasurementUnitsCodeSequence'],
        '0x1001': ['SH', '1', 'RequestedProcedureID'],
        '0x1002': ['LO', '1', 'ReasonForRequestedProcedure'],
        '0x1003': ['SH', '1', 'RequestedProcedurePriority'],
        '0x1004': ['LO', '1', 'PatientTransportArrangements'],
        '0x1005': ['LO', '1', 'RequestedProcedureLocation'],
        '0x1006': ['SH', '1', 'PlacerOrderNumberOfProcedure'],
        '0x1007': ['SH', '1', 'FillerOrderNumberOfProcedure'],
        '0x1008': ['LO', '1', 'ConfidentialityCode'],
        '0x1009': ['SH', '1', 'ReportingPriority'],
        '0x1010': ['PN', '1-n', 'NamesOfIntendedRecipientsOfResults'],
        '0x1400': ['LT', '1', 'RequestedProcedureComments'],
        '0x2001': ['LO', '1', 'ReasonForTheImagingServiceRequest'],
        '0x2002': ['LO', '1', 'ImagingServiceRequestDescription'],
        '0x2004': ['DA', '1', 'IssueDateOfImagingServiceRequest'],
        '0x2005': ['TM', '1', 'IssueTimeOfImagingServiceRequest'],
        '0x2006': ['SH', '1', 'PlacerOrderNumberOfImagingServiceRequest'],
        '0x2007': ['SH', '0', 'FillerOrderNumberOfImagingServiceRequest'],
        '0x2008': ['PN', '1', 'OrderEnteredBy'],
        '0x2009': ['SH', '1', 'OrderEntererLocation'],
        '0x2010': ['SH', '1', 'OrderCallbackPhoneNumber'],
        '0x2016': ['LO', '1', 'PlacerOrderNumberImagingServiceRequest'],
        '0x2017': ['LO', '1', 'FillerOrderNumberImagingServiceRequest'],
        '0x2400': ['LT', '1', 'ImagingServiceRequestComments'],
        '0x3001': ['LT', '1', 'ConfidentialityConstraint'],
        '0xA010': ['CS', '1', 'RelationshipType'],
        '0xA027': ['LO', '1', 'VerifyingOrganization'],
        '0xA030': ['DT', '1', 'VerificationDateTime'],
        '0xA032': ['DT', '1', 'ObservationDateTime'],
        '0xA040': ['CS', '1', 'ValueType'],
        '0xA043': ['SQ', '1', 'ConceptNameCodeSequence'],
        '0xA050': ['CS', '1', 'ContinuityOfContent'],
        '0xA073': ['SQ', '1', 'VerifyingObserverSequence'],
        '0xA075': ['PN', '1', 'VerifyingObserverName'],
        '0xA088': ['SQ', '1', 'VerifyingObserverIdentificationCodeSeque'],
        '0xA0B0': ['US', '2-2n', 'ReferencedWaveformChannels'],
        '0xA120': ['DT', '1', 'DateTime'],
        '0xA121': ['DA', '1', 'Date'],
        '0xA122': ['TM', '1', 'Time'],
        '0xA123': ['PN', '1', 'PersonName'],
        '0xA124': ['UI', '1', 'UID'],
        '0xA130': ['CS', '1', 'TemporalRangeType'],
        '0xA132': ['UL', '1-n', 'ReferencedSamplePositionsU'],
        '0xA136': ['US', '1-n', 'ReferencedFrameNumbers'],
        '0xA138': ['DS', '1-n', 'ReferencedTimeOffsets'],
        '0xA13A': ['DT', '1-n', 'ReferencedDatetime'],
        '0xA160': ['UT', '1', 'TextValue'],
        '0xA168': ['SQ', '1', 'ConceptCodeSequence'],
        '0xA180': ['US', '1', 'AnnotationGroupNumber'],
        '0xA195': ['SQ', '1', 'ConceptNameCodeSequenceModifier'],
        '0xA300': ['SQ', '1', 'MeasuredValueSequence'],
        '0xA30A': ['DS', '1-n', 'NumericValue'],
        '0xA360': ['SQ', '1', 'PredecessorDocumentsSequence'],
        '0xA370': ['SQ', '1', 'ReferencedRequestSequence'],
        '0xA372': ['SQ', '1', 'PerformedProcedureCodeSequence'],
        '0xA375': ['SQ', '1', 'CurrentRequestedProcedureEvidenceSequenSequence'],
        '0xA385': ['SQ', '1', 'PertinentOtherEvidenceSequence'],
        '0xA491': ['CS', '1', 'CompletionFlag'],
        '0xA492': ['LO', '1', 'CompletionFlagDescription'],
        '0xA493': ['CS', '1', 'VerificationFlag'],
        '0xA504': ['SQ', '1', 'ContentTemplateSequence'],
        '0xA525': ['SQ', '1', 'IdenticalDocumentsSequence'],
        '0xA730': ['SQ', '1', 'ContentSequence'],
        '0xB020': ['SQ', '1', 'AnnotationSequence'],
        '0xDB00': ['CS', '1', 'TemplateIdentifier'],
        '0xDB06': ['DT', '1', 'TemplateVersion'],
        '0xDB07': ['DT', '1', 'TemplateLocalVersion'],
        '0xDB0B': ['CS', '1', 'TemplateExtensionFlag'],
        '0xDB0C': ['UI', '1', 'TemplateExtensionOrganizationUID'],
        '0xDB0D': ['UI', '1', 'TemplateExtensionCreatorUID'],
        '0xDB73': ['UL', '1-n', 'ReferencedContentItemIdentifier'],
    },
    '0x0050': {
        '0x0000': ['UL', '1', 'XRayAngioDeviceGroupLength'],
        '0x0004': ['CS', '1', 'CalibrationObject'],
        '0x0010': ['SQ', '1', 'DeviceSequence'],
        '0x0012': ['CS', '1', 'DeviceType'],
        '0x0014': ['DS', '1', 'DeviceLength'],
        '0x0016': ['DS', '1', 'DeviceDiameter'],
        '0x0017': ['CS', '1', 'DeviceDiameterUnits'],
        '0x0018': ['DS', '1', 'DeviceVolume'],
        '0x0019': ['DS', '1', 'InterMarkerDistance'],
        '0x0020': ['LO', '1', 'DeviceDescription'],
        '0x0030': ['SQ', '1', 'CodedInterventionalDeviceSequence'],
    },
    '0x0054': {
        '0x0000': ['UL', '1', 'NuclearMedicineGroupLength'],
        '0x0010': ['US', '1-n', 'EnergyWindowVector'],
        '0x0011': ['US', '1', 'NumberOfEnergyWindows'],
        '0x0012': ['SQ', '1', 'EnergyWindowInformationSequence'],
        '0x0013': ['SQ', '1', 'EnergyWindowRangeSequence'],
        '0x0014': ['DS', '1', 'EnergyWindowLowerLimit'],
        '0x0015': ['DS', '1', 'EnergyWindowUpperLimit'],
        '0x0016': ['SQ', '1', 'RadiopharmaceuticalInformationSequence'],
        '0x0017': ['IS', '1', 'ResidualSyringeCounts'],
        '0x0018': ['SH', '1', 'EnergyWindowName'],
        '0x0020': ['US', '1-n', 'DetectorVector'],
        '0x0021': ['US', '1', 'NumberOfDetectors'],
        '0x0022': ['SQ', '1', 'DetectorInformationSequence'],
        '0x0030': ['US', '1-n', 'PhaseVector'],
        '0x0031': ['US', '1', 'NumberOfPhases'],
        '0x0032': ['SQ', '1', 'PhaseInformationSequence'],
        '0x0033': ['US', '1', 'NumberOfFramesInPhase'],
        '0x0036': ['IS', '1', 'PhaseDelay'],
        '0x0038': ['IS', '1', 'PauseBetweenFrames'],
        '0x0050': ['US', '1-n', 'RotationVector'],
        '0x0051': ['US', '1', 'NumberOfRotations'],
        '0x0052': ['SQ', '1', 'RotationInformationSequence'],
        '0x0053': ['US', '1', 'NumberOfFramesInRotation'],
        '0x0060': ['US', '1-n', 'RRIntervalVector'],
        '0x0061': ['US', '1', 'NumberOfRRIntervals'],
        '0x0062': ['SQ', '1', 'GatedInformationSequence'],
        '0x0063': ['SQ', '1', 'DataInformationSequence'],
        '0x0070': ['US', '1-n', 'TimeSlotVector'],
        '0x0071': ['US', '1', 'NumberOfTimeSlots'],
        '0x0072': ['SQ', '1', 'TimeSlotInformationSequence'],
        '0x0073': ['DS', '1', 'TimeSlotTime'],
        '0x0080': ['US', '1-n', 'SliceVector'],
        '0x0081': ['US', '1', 'NumberOfSlices'],
        '0x0090': ['US', '1-n', 'AngularViewVector'],
        '0x0100': ['US', '1-n', 'TimeSliceVector'],
        '0x0101': ['US', '1', 'NumberOfTimeSlices'],
        '0x0200': ['DS', '1', 'StartAngle'],
        '0x0202': ['CS', '1', 'TypeOfDetectorMotion'],
        '0x0210': ['IS', '1-n', 'TriggerVector'],
        '0x0211': ['US', '1', 'NumberOfTriggersInPhase'],
        '0x0220': ['SQ', '1', 'ViewCodeSequence'],
        '0x0222': ['SQ', '1', 'ViewAngulationModifierCodeSequence'],
        '0x0300': ['SQ', '1', 'RadionuclideCodeSequence'],
        '0x0302': ['SQ', '1', 'AdministrationRouteCodeSequence'],
        '0x0304': ['SQ', '1', 'RadiopharmaceuticalCodeSequence'],
        '0x0306': ['SQ', '1', 'CalibrationDataSequence'],
        '0x0308': ['US', '1', 'EnergyWindowNumber'],
        '0x0400': ['SH', '1', 'ImageID'],
        '0x0410': ['SQ', '1', 'PatientOrientationCodeSequence'],
        '0x0412': ['SQ', '1', 'PatientOrientationModifierCodeSequence'],
        '0x0414': ['SQ', '1', 'PatientGantryRelationshipCodeSequence'],
        '0x1000': ['CS', '2', 'SeriesType'],
        '0x1001': ['CS', '1', 'Units'],
        '0x1002': ['CS', '1', 'CountsSource'],
        '0x1004': ['CS', '1', 'ReprojectionMethod'],
        '0x1100': ['CS', '1', 'RandomsCorrectionMethod'],
        '0x1101': ['LO', '1', 'AttenuationCorrectionMethod'],
        '0x1102': ['CS', '1', 'DecayCorrection'],
        '0x1103': ['LO', '1', 'ReconstructionMethod'],
        '0x1104': ['LO', '1', 'DetectorLinesOfResponseUsed'],
        '0x1105': ['LO', '1', 'ScatterCorrectionMethod'],
        '0x1200': ['DS', '1', 'AxialAcceptance'],
        '0x1201': ['IS', '2', 'AxialMash'],
        '0x1202': ['IS', '1', 'TransverseMash'],
        '0x1203': ['DS', '2', 'DetectorElementSize'],
        '0x1210': ['DS', '1', 'CoincidenceWindowWidth'],
        '0x1220': ['CS', '1-n', 'SecondaryCountsType'],
        '0x1300': ['DS', '1', 'FrameReferenceTime'],
        '0x1310': ['IS', '1', 'PrimaryPromptsCountsAccumulated'],
        '0x1311': ['IS', '1-n', 'SecondaryCountsAccumulated'],
        '0x1320': ['DS', '1', 'SliceSensitivityFactor'],
        '0x1321': ['DS', '1', 'DecayFactor'],
        '0x1322': ['DS', '1', 'DoseCalibrationFactor'],
        '0x1323': ['DS', '1', 'ScatterFractionFactor'],
        '0x1324': ['DS', '1', 'DeadTimeFactor'],
        '0x1330': ['US', '1', 'ImageIndex'],
        '0x1400': ['CS', '1-n', 'CountsIncluded'],
        '0x1401': ['CS', '1', 'DeadTimeCorrectionFlag'],
    },
    '0x0060': {
        '0x0000': ['UL', '1', 'HistogramGroupLength'],
        '0x3000': ['SQ', '1', 'HistogramSequence'],
        '0x3002': ['US', '1', 'HistogramNumberofBins'],
        '0x3004': ['US/SS', '1', 'HistogramFirstBinValue'],
        '0x3006': ['US/SS', '1', 'HistogramLastBinValue'],
        '0x3008': ['US', '1', 'HistogramBinWidth'],
        '0x3010': ['LO', '1', 'HistogramExplanation'],
        '0x3020': ['UL', '1-n', 'HistogramData'],
    },
    '0x0070': {
        '0x0001': ['SQ', '1', 'GraphicAnnotationSequence'],
        '0x0002': ['CS', '1', 'GraphicLayer'],
        '0x0003': ['CS', '1', 'BoundingBoxAnnotationUnits'],
        '0x0004': ['CS', '1', 'AnchorPointAnnotationUnits'],
        '0x0005': ['CS', '1', 'GraphicAnnotationUnits'],
        '0x0006': ['ST', '1', 'UnformattedTextValue'],
        '0x0008': ['SQ', '1', 'TextObjectSequence'],
        '0x0009': ['SQ', '1', 'GraphicObjectSequence'],
        '0x0010': ['FL', '2', 'BoundingBoxTopLeftHandCorner'],
        '0x0011': ['FL', '2', 'BoundingBoxBottomRightHandCorner'],
        '0x0012': ['CS', '1', 'BoundingBoxTextHorizontalJustification'],
        '0x0014': ['FL', '2', 'AnchorPoint'],
        '0x0015': ['CS', '1', 'AnchorPointVisibility'],
        '0x0020': ['US', '1', 'GraphicDimensions'],
        '0x0021': ['US', '1', 'NumberOfGraphicPoints'],
        '0x0022': ['FL', '2-n', 'GraphicData'],
        '0x0023': ['CS', '1', 'GraphicType'],
        '0x0024': ['CS', '1', 'GraphicFilled'],
        '0x0040': ['IS', '1', 'ImageRotationFrozenDraftRetired'],
        '0x0041': ['CS', '1', 'ImageHorizontalFlip'],
        '0x0042': ['US', '1', 'ImageRotation'],
        '0x0050': ['US', '2', 'DisplayedAreaTLHCFrozenDraftRetired'],
        '0x0051': ['US', '2', 'DisplayedAreaBRHCFrozenDraftRetired'],
        '0x0052': ['SL', '2', 'DisplayedAreaTopLeftHandCorner'],
        '0x0053': ['SL', '2', 'DisplayedAreaBottomRightHandCorner'],
        '0x005A': ['SQ', '1', 'DisplayedAreaSelectionSequence'],
        '0x0060': ['SQ', '1', 'GraphicLayerSequence'],
        '0x0062': ['IS', '1', 'GraphicLayerOrder'],
        '0x0066': ['US', '1', 'GraphicLayerRecommendedDisplayGrayscaleValue'],
        '0x0067': ['US', '3', 'GraphicLayerRecommendedDisplayRGBValue'],
        '0x0068': ['LO', '1', 'GraphicLayerDescription'],
        '0x0080': ['CS', '1', 'PresentationLabel'],
        '0x0081': ['LO', '1', 'PresentationDescription'],
        '0x0082': ['DA', '1', 'PresentationCreationDate'],
        '0x0083': ['TM', '1', 'PresentationCreationTime'],
        '0x0084': ['PN', '1', 'PresentationCreatorsName'],
        '0x0100': ['CS', '1', 'PresentationSizeMode'],
        '0x0101': ['DS', '2', 'PresentationPixelSpacing'],
        '0x0102': ['IS', '2', 'PresentationPixelAspectRatio'],
        '0x0103': ['FL', '1', 'PresentationPixelMagnificationRatio'],
    },
    '0x0088': {
        '0x0000': ['UL', '1', 'StorageGroupLength'],
        '0x0130': ['SH', '1', 'StorageMediaFilesetID'],
        '0x0140': ['UI', '1', 'StorageMediaFilesetUID'],
        '0x0200': ['SQ', '1', 'IconImage'],
        '0x0904': ['LO', '1', 'TopicTitle'],
        '0x0906': ['ST', '1', 'TopicSubject'],
        '0x0910': ['LO', '1', 'TopicAuthor'],
        '0x0912': ['LO', '3', 'TopicKeyWords'],
    },
    '0x1000': {
        '0x0000': ['UL', '1', 'CodeTableGroupLength'],
        '0x0010': ['US', '3', 'EscapeTriplet'],
        '0x0011': ['US', '3', 'RunLengthTriplet'],
        '0x0012': ['US', '1', 'HuffmanTableSize'],
        '0x0013': ['US', '3', 'HuffmanTableTriplet'],
        '0x0014': ['US', '1', 'ShiftTableSize'],
        '0x0015': ['US', '3', 'ShiftTableTriplet'],
    },
    '0x1010': {
        '0x0000': ['UL', '1', 'ZonalMapGroupLength'],
        '0x0004': ['US', '1-n', 'ZonalMap'],
    },
    '0x2000': {
        '0x0000': ['UL', '1', 'FilmSessionGroupLength'],
        '0x0010': ['IS', '1', 'NumberOfCopies'],
        '0x001E': ['SQ', '1', 'PrinterConfigurationSequence'],
        '0x0020': ['CS', '1', 'PrintPriority'],
        '0x0030': ['CS', '1', 'MediumType'],
        '0x0040': ['CS', '1', 'FilmDestination'],
        '0x0050': ['LO', '1', 'FilmSessionLabel'],
        '0x0060': ['IS', '1', 'MemoryAllocation'],
        '0x0061': ['IS', '1', 'MaximumMemoryAllocation'],
        '0x0062': ['CS', '1', 'ColorImagePrintingFlag'],
        '0x0063': ['CS', '1', 'CollationFlag'],
        '0x0065': ['CS', '1', 'AnnotationFlag'],
        '0x0067': ['CS', '1', 'ImageOverlayFlag'],
        '0x0069': ['CS', '1', 'PresentationLUTFlag'],
        '0x006A': ['CS', '1', 'ImageBoxPresentationLUTFlag'],
        '0x00A0': ['US', '1', 'MemoryBitDepth'],
        '0x00A1': ['US', '1', 'PrintingBitDepth'],
        '0x00A2': ['SQ', '1', 'MediaInstalledSequence'],
        '0x00A4': ['SQ', '1', 'OtherMediaAvailableSequence'],
        '0x00A8': ['SQ', '1', 'SupportedImageDisplayFormatsSequence'],
        '0x0500': ['SQ', '1', 'ReferencedFilmBoxSequence'],
        '0x0510': ['SQ', '1', 'ReferencedStoredPrintSequence'],
    },
    '0x2010': {
        '0x0000': ['UL', '1', 'FilmBoxGroupLength'],
        '0x0010': ['ST', '1', 'ImageDisplayFormat'],
        '0x0030': ['CS', '1', 'AnnotationDisplayFormatID'],
        '0x0040': ['CS', '1', 'FilmOrientation'],
        '0x0050': ['CS', '1', 'FilmSizeID'],
        '0x0052': ['CS', '1', 'PrinterResolutionID'],
        '0x0054': ['CS', '1', 'DefaultPrinterResolutionID'],
        '0x0060': ['CS', '1', 'MagnificationType'],
        '0x0080': ['CS', '1', 'SmoothingType'],
        '0x00A6': ['CS', '1', 'DefaultMagnificationType'],
        '0x00A7': ['CS', '1-n', 'OtherMagnificationTypesAvailable'],
        '0x00A8': ['CS', '1', 'DefaultSmoothingType'],
        '0x00A9': ['CS', '1-n', 'OtherSmoothingTypesAvailable'],
        '0x0100': ['CS', '1', 'BorderDensity'],
        '0x0110': ['CS', '1', 'EmptyImageDensity'],
        '0x0120': ['US', '1', 'MinDensity'],
        '0x0130': ['US', '1', 'MaxDensity'],
        '0x0140': ['CS', '1', 'Trim'],
        '0x0150': ['ST', '1', 'ConfigurationInformation'],
        '0x0152': ['LT', '1', 'ConfigurationInformationDescription'],
        '0x0154': ['IS', '1', 'MaximumCollatedFilms'],
        '0x015E': ['US', '1', 'Illumination'],
        '0x0160': ['US', '1', 'ReflectedAmbientLight'],
        '0x0376': ['DS', '2', 'PrinterPixelSpacing'],
        '0x0500': ['SQ', '1', 'ReferencedFilmSessionSequence'],
        '0x0510': ['SQ', '1', 'ReferencedImageBoxSequence'],
        '0x0520': ['SQ', '1', 'ReferencedBasicAnnotationBoxSequence'],
    },
    '0x2020': {
        '0x0000': ['UL', '1', 'ImageBoxGroupLength'],
        '0x0010': ['US', '1', 'ImageBoxPosition'],
        '0x0020': ['CS', '1', 'Polarity'],
        '0x0030': ['DS', '1', 'RequestedImageSize'],
        '0x0040': ['CS', '1', 'RequestedDecimateCropBehavior'],
        '0x0050': ['CS', '1', 'RequestedResolutionID'],
        '0x00A0': ['CS', '1', 'RequestedImageSizeFlag'],
        '0x00A2': ['CS', '1', 'DecimateCropResult'],
        '0x0110': ['SQ', '1', 'PreformattedGrayscaleImageSequence'],
        '0x0111': ['SQ', '1', 'PreformattedColorImageSequence'],
        '0x0130': ['SQ', '1', 'ReferencedImageOverlayBoxSequence'],
        '0x0140': ['SQ', '1', 'ReferencedVOILUTBoxSequence'],
    },
    '0x2030': {
        '0x0000': ['UL', '1', 'AnnotationGroupLength'],
        '0x0010': ['US', '1', 'AnnotationPosition'],
        '0x0020': ['LO', '1', 'TextString'],
    },
    '0x2040': {
        '0x0000': ['UL', '1', 'OverlayBoxGroupLength'],
        '0x0010': ['SQ', '1', 'ReferencedOverlayPlaneSequence'],
        '0x0011': ['US', '9', 'ReferencedOverlayPlaneGroups'],
        '0x0020': ['SQ', '1', 'OverlayPixelDataSequence'],
        '0x0060': ['CS', '1', 'OverlayMagnificationType'],
        '0x0070': ['CS', '1', 'OverlaySmoothingType'],
        '0x0072': ['CS', '1', 'OverlayOrImageMagnification'],
        '0x0074': ['US', '1', 'MagnifyToNumberOfColumns'],
        '0x0080': ['CS', '1', 'OverlayForegroundDensity'],
        '0x0082': ['CS', '1', 'OverlayBackgroundDensity'],
        '0x0090': ['CS', '1', 'OverlayMode'],
        '0x0100': ['CS', '1', 'ThresholdDensity'],
        '0x0500': ['SQ', '1', 'ReferencedOverlayImageBoxSequence'],
    },
    '0x2050': {
        '0x0000': ['UL', '1', 'PresentationLUTGroupLength'],
        '0x0010': ['SQ', '1', 'PresentationLUTSequence'],
        '0x0020': ['CS', '1', 'PresentationLUTShape'],
        '0x0500': ['SQ', '1', 'ReferencedPresentationLUTSequence'],
    },
    '0x2100': {
        '0x0000': ['UL', '1', 'PrintJobGroupLength'],
        '0x0010': ['SH', '1', 'PrintJobID'],
        '0x0020': ['CS', '1', 'ExecutionStatus'],
        '0x0030': ['CS', '1', 'ExecutionStatusInfo'],
        '0x0040': ['DA', '1', 'CreationDate'],
        '0x0050': ['TM', '1', 'CreationTime'],
        '0x0070': ['AE', '1', 'Originator'],
        '0x0140': ['AE', '1', 'DestinationAE'],
        '0x0160': ['SH', '1', 'OwnerID'],
        '0x0170': ['IS', '1', 'NumberOfFilms'],
        '0x0500': ['SQ', '1', 'ReferencedPrintJobSequence'],
    },
    '0x2110': {
        '0x0000': ['UL', '1', 'PrinterGroupLength'],
        '0x0010': ['CS', '1', 'PrinterStatus'],
        '0x0020': ['CS', '1', 'PrinterStatusInfo'],
        '0x0030': ['LO', '1', 'PrinterName'],
        '0x0099': ['SH', '1', 'PrintQueueID'],
    },
    '0x2120': {
        '0x0000': ['UL', '1', 'QueueGroupLength'],
        '0x0010': ['CS', '1', 'QueueStatus'],
        '0x0050': ['SQ', '1', 'PrintJobDescriptionSequence'],
        '0x0070': ['SQ', '1', 'QueueReferencedPrintJobSequence'],
    },
    '0x2130': {
        '0x0000': ['UL', '1', 'PrintContentGroupLength'],
        '0x0010': ['SQ', '1', 'PrintManagementCapabilitiesSequence'],
        '0x0015': ['SQ', '1', 'PrinterCharacteristicsSequence'],
        '0x0030': ['SQ', '1', 'FilmBoxContentSequence'],
        '0x0040': ['SQ', '1', 'ImageBoxContentSequence'],
        '0x0050': ['SQ', '1', 'AnnotationContentSequence'],
        '0x0060': ['SQ', '1', 'ImageOverlayBoxContentSequence'],
        '0x0080': ['SQ', '1', 'PresentationLUTContentSequence'],
        '0x00A0': ['SQ', '1', 'ProposedStudySequence'],
        '0x00C0': ['SQ', '1', 'OriginalImageSequence'],
    },
    '0x3002': {
        '0x0000': ['UL', '1', 'RTImageGroupLength'],
        '0x0002': ['SH', '1', 'RTImageLabel'],
        '0x0003': ['LO', '1', 'RTImageName'],
        '0x0004': ['ST', '1', 'RTImageDescription'],
        '0x000A': ['CS', '1', 'ReportedValuesOrigin'],
        '0x000C': ['CS', '1', 'RTImagePlane'],
        '0x000D': ['DS', '3', 'XRayImageReceptorTranslation'],
        '0x000E': ['DS', '1', 'XRayImageReceptorAngle'],
        '0x0010': ['DS', '6', 'RTImageOrientation'],
        '0x0011': ['DS', '2', 'ImagePlanePixelSpacing'],
        '0x0012': ['DS', '2', 'RTImagePosition'],
        '0x0020': ['SH', '1', 'RadiationMachineName'],
        '0x0022': ['DS', '1', 'RadiationMachineSAD'],
        '0x0024': ['DS', '1', 'RadiationMachineSSD'],
        '0x0026': ['DS', '1', 'RTImageSID'],
        '0x0028': ['DS', '1', 'SourceToReferenceObjectDistance'],
        '0x0029': ['IS', '1', 'FractionNumber'],
        '0x0030': ['SQ', '1', 'ExposureSequence'],
        '0x0032': ['DS', '1', 'MetersetExposure'],
        '0x0034': ['DS', '4', 'DiaphragmPosition'],
    },
    '0x3004': {
        '0x0000': ['UL', '1', 'RTDoseGroupLength'],
        '0x0001': ['CS', '1', 'DVHType'],
        '0x0002': ['CS', '1', 'DoseUnits'],
        '0x0004': ['CS', '1', 'DoseType'],
        '0x0006': ['LO', '1', 'DoseComment'],
        '0x0008': ['DS', '3', 'NormalizationPoint'],
        '0x000A': ['CS', '1', 'DoseSummationType'],
        '0x000C': ['DS', '2-n', 'GridFrameOffsetVector'],
        '0x000E': ['DS', '1', 'DoseGridScaling'],
        '0x0010': ['SQ', '1', 'RTDoseROISequence'],
        '0x0012': ['DS', '1', 'DoseValue'],
        '0x0040': ['DS', '3', 'DVHNormalizationPoint'],
        '0x0042': ['DS', '1', 'DVHNormalizationDoseValue'],
        '0x0050': ['SQ', '1', 'DVHSequence'],
        '0x0052': ['DS', '1', 'DVHDoseScaling'],
        '0x0054': ['CS', '1', 'DVHVolumeUnits'],
        '0x0056': ['IS', '1', 'DVHNumberOfBins'],
        '0x0058': ['DS', '2-2n', 'DVHData'],
        '0x0060': ['SQ', '1', 'DVHReferencedROISequence'],
        '0x0062': ['CS', '1', 'DVHROIContributionType'],
        '0x0070': ['DS', '1', 'DVHMinimumDose'],
        '0x0072': ['DS', '1', 'DVHMaximumDose'],
        '0x0074': ['DS', '1', 'DVHMeanDose'],
    },
    '0x3006': {
        '0x0000': ['UL', '1', 'RTStructureSetGroupLength'],
        '0x0002': ['SH', '1', 'StructureSetLabel'],
        '0x0004': ['LO', '1', 'StructureSetName'],
        '0x0006': ['ST', '1', 'StructureSetDescription'],
        '0x0008': ['DA', '1', 'StructureSetDate'],
        '0x0009': ['TM', '1', 'StructureSetTime'],
        '0x0010': ['SQ', '1', 'ReferencedFrameOfReferenceSequence'],
        '0x0012': ['SQ', '1', 'RTReferencedStudySequence'],
        '0x0014': ['SQ', '1', 'RTReferencedSeriesSequence'],
        '0x0016': ['SQ', '1', 'ContourImageSequence'],
        '0x0020': ['SQ', '1', 'StructureSetROISequence'],
        '0x0022': ['IS', '1', 'ROINumber'],
        '0x0024': ['UI', '1', 'ReferencedFrameOfReferenceUID'],
        '0x0026': ['LO', '1', 'ROIName'],
        '0x0028': ['ST', '1', 'ROIDescription'],
        '0x002A': ['IS', '3', 'ROIDisplayColor'],
        '0x002C': ['DS', '1', 'ROIVolume'],
        '0x0030': ['SQ', '1', 'RTRelatedROISequence'],
        '0x0033': ['CS', '1', 'RTROIRelationship'],
        '0x0036': ['CS', '1', 'ROIGenerationAlgorithm'],
        '0x0038': ['LO', '1', 'ROIGenerationDescription'],
        '0x0039': ['SQ', '1', 'ROIContourSequence'],
        '0x0040': ['SQ', '1', 'ContourSequence'],
        '0x0042': ['CS', '1', 'ContourGeometricType'],
        '0x0044': ['DS', '1', 'ContourSlabThickness'],
        '0x0045': ['DS', '3', 'ContourOffsetVector'],
        '0x0046': ['IS', '1', 'NumberOfContourPoints'],
        '0x0048': ['IS', '1', 'ContourNumber'],
        '0x0049': ['IS', '1-n', 'AttachedContours'],
        '0x0050': ['DS', '3-3n', 'ContourData'],
        '0x0080': ['SQ', '1', 'RTROIObservationsSequence'],
        '0x0082': ['IS', '1', 'ObservationNumber'],
        '0x0084': ['IS', '1', 'ReferencedROINumber'],
        '0x0085': ['SH', '1', 'ROIObservationLabel'],
        '0x0086': ['SQ', '1', 'RTROIIdentificationCodeSequence'],
        '0x0088': ['ST', '1', 'ROIObservationDescription'],
        '0x00A0': ['SQ', '1', 'RelatedRTROIObservationsSequence'],
        '0x00A4': ['CS', '1', 'RTROIInterpretedType'],
        '0x00A6': ['PN', '1', 'ROIInterpreter'],
        '0x00B0': ['SQ', '1', 'ROIPhysicalPropertiesSequence'],
        '0x00B2': ['CS', '1', 'ROIPhysicalProperty'],
        '0x00B4': ['DS', '1', 'ROIPhysicalPropertyValue'],
        '0x00C0': ['SQ', '1', 'FrameOfReferenceRelationshipSequence'],
        '0x00C2': ['UI', '1', 'RelatedFrameOfReferenceUID'],
        '0x00C4': ['CS', '1', 'FrameOfReferenceTransformationType'],
        '0x00C6': ['DS', '16', 'FrameOfReferenceTransformationMatrix'],
        '0x00C8': ['LO', '1', 'FrameOfReferenceTransformationComment'],
    },
    '0x3008': {
        '0x0010': ['SQ', '1', 'MeasuredDoseReferenceSequence'],
        '0x0012': ['ST', '1', 'MeasuredDoseDescription'],
        '0x0014': ['CS', '1', 'MeasuredDoseType'],
        '0x0016': ['DS', '1', 'MeasuredDoseValue'],
        '0x0020': ['SQ', '1', 'TreatmentSessionBeamSequence'],
        '0x0022': ['IS', '1', 'CurrentFractionNumber'],
        '0x0024': ['DA', '1', 'TreatmentControlPointDate'],
        '0x0025': ['TM', '1', 'TreatmentControlPointTime'],
        '0x002A': ['CS', '1', 'TreatmentTerminationStatus'],
        '0x002B': ['SH', '1', 'TreatmentTerminationCode'],
        '0x002C': ['CS', '1', 'TreatmentVerificationStatus'],
        '0x0030': ['SQ', '1', 'ReferencedTreatmentRecordSequence'],
        '0x0032': ['DS', '1', 'SpecifiedPrimaryMeterset'],
        '0x0033': ['DS', '1', 'SpecifiedSecondaryMeterset'],
        '0x0036': ['DS', '1', 'DeliveredPrimaryMeterset'],
        '0x0037': ['DS', '1', 'DeliveredSecondaryMeterset'],
        '0x003A': ['DS', '1', 'SpecifiedTreatmentTime'],
        '0x003B': ['DS', '1', 'DeliveredTreatmentTime'],
        '0x0040': ['SQ', '1', 'ControlPointDeliverySequence'],
        '0x0042': ['DS', '1', 'SpecifiedMeterset'],
        '0x0044': ['DS', '1', 'DeliveredMeterset'],
        '0x0048': ['DS', '1', 'DoseRateDelivered'],
        '0x0050': ['SQ', '1', 'TreatmentSummaryCalculatedDoseReferenceSequence'],
        '0x0052': ['DS', '1', 'CumulativeDosetoDoseReference'],
        '0x0054': ['DA', '1', 'FirstTreatmentDate'],
        '0x0056': ['DA', '1', 'MostRecentTreatmentDate'],
        '0x005A': ['IS', '1', 'NumberofFractionsDelivered'],
        '0x0060': ['SQ', '1', 'OverrideSequence'],
        '0x0062': ['AT', '1', 'OverrideParameterPointer'],
        '0x0064': ['IS', '1', 'MeasuredDoseReferenceNumber'],
        '0x0066': ['ST', '1', 'OverrideReason'],
        '0x0070': ['SQ', '1', 'CalculatedDoseReferenceSequence'],
        '0x0072': ['IS', '1', 'CalculatedDoseReferenceNumber'],
        '0x0074': ['ST', '1', 'CalculatedDoseReferenceDescription'],
        '0x0076': ['DS', '1', 'CalculatedDoseReferenceDoseValue'],
        '0x0078': ['DS', '1', 'StartMeterset'],
        '0x007A': ['DS', '1', 'EndMeterset'],
        '0x0080': ['SQ', '1', 'ReferencedMeasuredDoseReferenceSequence'],
        '0x0082': ['IS', '1', 'ReferencedMeasuredDoseReferenceNumber'],
        '0x0090': ['SQ', '1', 'ReferencedCalculatedDoseReferenceSequence'],
        '0x0092': ['IS', '1', 'ReferencedCalculatedDoseReferenceNumber'],
        '0x00A0': ['SQ', '1', 'BeamLimitingDeviceLeafPairsSequence'],
        '0x00B0': ['SQ', '1', 'RecordedWedgeSequence'],
        '0x00C0': ['SQ', '1', 'RecordedCompensatorSequence'],
        '0x00D0': ['SQ', '1', 'RecordedBlockSequence'],
        '0x00E0': ['SQ', '1', 'TreatmentSummaryMeasuredDoseReferenceSequence'],
        '0x0100': ['SQ', '1', 'RecordedSourceSequence'],
        '0x0105': ['LO', '1', 'SourceSerialNumber'],
        '0x0110': ['SQ', '1', 'TreatmentSessionApplicationSetupSequence'],
        '0x0116': ['CS', '1', 'ApplicationSetupCheck'],
        '0x0120': ['SQ', '1', 'RecordedBrachyAccessoryDeviceSequence'],
        '0x0122': ['IS', '1', 'ReferencedBrachyAccessoryDeviceNumber'],
        '0x0130': ['SQ', '1', 'RecordedChannelSequence'],
        '0x0132': ['DS', '1', 'SpecifiedChannelTotalTime'],
        '0x0134': ['DS', '1', 'DeliveredChannelTotalTime'],
        '0x0136': ['IS', '1', 'SpecifiedNumberofPulses'],
        '0x0138': ['IS', '1', 'DeliveredNumberofPulses'],
        '0x013A': ['DS', '1', 'SpecifiedPulseRepetitionInterval'],
        '0x013C': ['DS', '1', 'DeliveredPulseRepetitionInterval'],
        '0x0140': ['SQ', '1', 'RecordedSourceApplicatorSequence'],
        '0x0142': ['IS', '1', 'ReferencedSourceApplicatorNumber'],
        '0x0150': ['SQ', '1', 'RecordedChannelShieldSequence'],
        '0x0152': ['IS', '1', 'ReferencedChannelShieldNumber'],
        '0x0160': ['SQ', '1', 'BrachyControlPointDeliveredSequence'],
        '0x0162': ['DA', '1', 'SafePositionExitDate'],
        '0x0164': ['TM', '1', 'SafePositionExitTime'],
        '0x0166': ['DA', '1', 'SafePositionReturnDate'],
        '0x0168': ['TM', '1', 'SafePositionReturnTime'],
        '0x0200': ['CS', '1', 'CurrentTreatmentStatus'],
        '0x0202': ['ST', '1', 'TreatmentStatusComment'],
        '0x0220': ['SQ', '1', 'FractionGroupSummarySequence'],
        '0x0223': ['IS', '1', 'ReferencedFractionNumber'],
        '0x0224': ['CS', '1', 'FractionGroupType'],
        '0x0230': ['CS', '1', 'BeamStopperPosition'],
        '0x0240': ['SQ', '1', 'FractionStatusSummarySequence'],
        '0x0250': ['DA', '1', 'TreatmentDate'],
        '0x0251': ['TM', '1', 'TreatmentTime'],
    },
    '0x300A': {
        '0x0000': ['UL', '1', 'RTPlanGroupLength'],
        '0x0002': ['SH', '1', 'RTPlanLabel'],
        '0x0003': ['LO', '1', 'RTPlanName'],
        '0x0004': ['ST', '1', 'RTPlanDescription'],
        '0x0006': ['DA', '1', 'RTPlanDate'],
        '0x0007': ['TM', '1', 'RTPlanTime'],
        '0x0009': ['LO', '1-n', 'TreatmentProtocols'],
        '0x000A': ['CS', '1', 'TreatmentIntent'],
        '0x000B': ['LO', '1-n', 'TreatmentSites'],
        '0x000C': ['CS', '1', 'RTPlanGeometry'],
        '0x000E': ['ST', '1', 'PrescriptionDescription'],
        '0x0010': ['SQ', '1', 'DoseReferenceSequence'],
        '0x0012': ['IS', '1', 'DoseReferenceNumber'],
        '0x0014': ['CS', '1', 'DoseReferenceStructureType'],
        '0x0015': ['CS', '1', 'NominalBeamEnergyUnit'],
        '0x0016': ['LO', '1', 'DoseReferenceDescription'],
        '0x0018': ['DS', '3', 'DoseReferencePointCoordinates'],
        '0x001A': ['DS', '1', 'NominalPriorDose'],
        '0x0020': ['CS', '1', 'DoseReferenceType'],
        '0x0021': ['DS', '1', 'ConstraintWeight'],
        '0x0022': ['DS', '1', 'DeliveryWarningDose'],
        '0x0023': ['DS', '1', 'DeliveryMaximumDose'],
        '0x0025': ['DS', '1', 'TargetMinimumDose'],
        '0x0026': ['DS', '1', 'TargetPrescriptionDose'],
        '0x0027': ['DS', '1', 'TargetMaximumDose'],
        '0x0028': ['DS', '1', 'TargetUnderdoseVolumeFraction'],
        '0x002A': ['DS', '1', 'OrganAtRiskFullVolumeDose'],
        '0x002B': ['DS', '1', 'OrganAtRiskLimitDose'],
        '0x002C': ['DS', '1', 'OrganAtRiskMaximumDose'],
        '0x002D': ['DS', '1', 'OrganAtRiskOverdoseVolumeFraction'],
        '0x0040': ['SQ', '1', 'ToleranceTableSequence'],
        '0x0042': ['IS', '1', 'ToleranceTableNumber'],
        '0x0043': ['SH', '1', 'ToleranceTableLabel'],
        '0x0044': ['DS', '1', 'GantryAngleTolerance'],
        '0x0046': ['DS', '1', 'BeamLimitingDeviceAngleTolerance'],
        '0x0048': ['SQ', '1', 'BeamLimitingDeviceToleranceSequence'],
        '0x004A': ['DS', '1', 'BeamLimitingDevicePositionTolerance'],
        '0x004C': ['DS', '1', 'PatientSupportAngleTolerance'],
        '0x004E': ['DS', '1', 'TableTopEccentricAngleTolerance'],
        '0x0051': ['DS', '1', 'TableTopVerticalPositionTolerance'],
        '0x0052': ['DS', '1', 'TableTopLongitudinalPositionTolerance'],
        '0x0053': ['DS', '1', 'TableTopLateralPositionTolerance'],
        '0x0055': ['CS', '1', 'RTPlanRelationship'],
        '0x0070': ['SQ', '1', 'FractionGroupSequence'],
        '0x0071': ['IS', '1', 'FractionGroupNumber'],
        '0x0078': ['IS', '1', 'NumberOfFractionsPlanned'],
        // '0x0079': ['IS','1','NumberOfFractionsPerDay'], /// Changed
        '0x0079': ['IS', '1', 'NumberOfFractionsPatternDigistsPerDay'],
        '0x007A': ['IS', '1', 'RepeatFractionCycleLength'],
        '0x007B': ['LT', '1', 'FractionPattern'],
        '0x0080': ['IS', '1', 'NumberOfBeams'],
        '0x0082': ['DS', '3', 'BeamDoseSpecificationPoint'],
        '0x0084': ['DS', '1', 'BeamDose'],
        '0x0086': ['DS', '1', 'BeamMeterset'],
        '0x00A0': ['IS', '1', 'NumberOfBrachyApplicationSetups'],
        '0x00A2': ['DS', '3', 'BrachyApplicationSetupDoseSpecificationPoint'],
        '0x00A4': ['DS', '1', 'BrachyApplicationSetupDose'],
        '0x00B0': ['SQ', '1', 'BeamSequence'],
        '0x00B2': ['SH', '1', 'TreatmentMachineName'],
        '0x00B3': ['CS', '1', 'PrimaryDosimeterUnit'],
        '0x00B4': ['DS', '1', 'SourceAxisDistance'],
        '0x00B6': ['SQ', '1', 'BeamLimitingDeviceSequence'],
        '0x00B8': ['CS', '1', 'RTBeamLimitingDeviceType'],
        '0x00BA': ['DS', '1', 'SourceToBeamLimitingDeviceDistance'],
        '0x00BC': ['IS', '1', 'NumberOfLeafJawPairs'],
        '0x00BE': ['DS', '3-n', 'LeafPositionBoundaries'],
        '0x00C0': ['IS', '1', 'BeamNumber'],
        '0x00C2': ['LO', '1', 'BeamName'],
        '0x00C3': ['ST', '1', 'BeamDescription'],
        '0x00C4': ['CS', '1', 'BeamType'],
        '0x00C6': ['CS', '1', 'RadiationType'],
        '0x00C8': ['IS', '1', 'ReferenceImageNumber'],
        '0x00CA': ['SQ', '1', 'PlannedVerificationImageSequence'],
        '0x00CC': ['LO', '1-n', 'ImagingDeviceSpecificAcquisitionParameters'],
        '0x00CE': ['CS', '1', 'TreatmentDeliveryType'],
        '0x00D0': ['IS', '1', 'NumberOfWedges'],
        '0x00D1': ['SQ', '1', 'WedgeSequence'],
        '0x00D2': ['IS', '1', 'WedgeNumber'],
        '0x00D3': ['CS', '1', 'WedgeType'],
        '0x00D4': ['SH', '1', 'WedgeID'],
        '0x00D5': ['IS', '1', 'WedgeAngle'],
        '0x00D6': ['DS', '1', 'WedgeFactor'],
        '0x00D8': ['DS', '1', 'WedgeOrientation'],
        '0x00DA': ['DS', '1', 'SourceToWedgeTrayDistance'],
        '0x00E0': ['IS', '1', 'NumberOfCompensators'],
        '0x00E1': ['SH', '1', 'MaterialID'],
        '0x00E2': ['DS', '1', 'TotalCompensatorTrayFactor'],
        '0x00E3': ['SQ', '1', 'CompensatorSequence'],
        '0x00E4': ['IS', '1', 'CompensatorNumber'],
        '0x00E5': ['SH', '1', 'CompensatorID'],
        '0x00E6': ['DS', '1', 'SourceToCompensatorTrayDistance'],
        '0x00E7': ['IS', '1', 'CompensatorRows'],
        '0x00E8': ['IS', '1', 'CompensatorColumns'],
        '0x00E9': ['DS', '2', 'CompensatorPixelSpacing'],
        '0x00EA': ['DS', '2', 'CompensatorPosition'],
        '0x00EB': ['DS', '1-n', 'CompensatorTransmissionData'],
        '0x00EC': ['DS', '1-n', 'CompensatorThicknessData'],
        '0x00ED': ['IS', '1', 'NumberOfBoli'],
        '0x00EE': ['CS', '1', 'CompensatorType'],
        '0x00F0': ['IS', '1', 'NumberOfBlocks'],
        '0x00F2': ['DS', '1', 'TotalBlockTrayFactor'],
        '0x00F4': ['SQ', '1', 'BlockSequence'],
        '0x00F5': ['SH', '1', 'BlockTrayID'],
        '0x00F6': ['DS', '1', 'SourceToBlockTrayDistance'],
        '0x00F8': ['CS', '1', 'BlockType'],
        '0x00FA': ['CS', '1', 'BlockDivergence'],
        '0x00FC': ['IS', '1', 'BlockNumber'],
        '0x00FE': ['LO', '1', 'BlockName'],
        '0x0100': ['DS', '1', 'BlockThickness'],
        '0x0102': ['DS', '1', 'BlockTransmission'],
        '0x0104': ['IS', '1', 'BlockNumberOfPoints'],
        '0x0106': ['DS', '2-2n', 'BlockData'],
        '0x0107': ['SQ', '1', 'ApplicatorSequence'],
        '0x0108': ['SH', '1', 'ApplicatorID'],
        '0x0109': ['CS', '1', 'ApplicatorType'],
        '0x010A': ['LO', '1', 'ApplicatorDescription'],
        '0x010C': ['DS', '1', 'CumulativeDoseReferenceCoefficient'],
        '0x010E': ['DS', '1', 'FinalCumulativeMetersetWeight'],
        '0x0110': ['IS', '1', 'NumberOfControlPoints'],
        '0x0111': ['SQ', '1', 'ControlPointSequence'],
        '0x0112': ['IS', '1', 'ControlPointIndex'],
        '0x0114': ['DS', '1', 'NominalBeamEnergy'],
        '0x0115': ['DS', '1', 'DoseRateSet'],
        '0x0116': ['SQ', '1', 'WedgePositionSequence'],
        '0x0118': ['CS', '1', 'WedgePosition'],
        '0x011A': ['SQ', '1', 'BeamLimitingDevicePositionSequence'],
        '0x011C': ['DS', '2-2n', 'LeafJawPositions'],
        '0x011E': ['DS', '1', 'GantryAngle'],
        '0x011F': ['CS', '1', 'GantryRotationDirection'],
        '0x0120': ['DS', '1', 'BeamLimitingDeviceAngle'],
        '0x0121': ['CS', '1', 'BeamLimitingDeviceRotationDirection'],
        '0x0122': ['DS', '1', 'PatientSupportAngle'],
        '0x0123': ['CS', '1', 'PatientSupportRotationDirection'],
        '0x0124': ['DS', '1', 'TableTopEccentricAxisDistance'],
        '0x0125': ['DS', '1', 'TableTopEccentricAngle'],
        '0x0126': ['CS', '1', 'TableTopEccentricRotationDirection'],
        '0x0128': ['DS', '1', 'TableTopVerticalPosition'],
        '0x0129': ['DS', '1', 'TableTopLongitudinalPosition'],
        '0x012A': ['DS', '1', 'TableTopLateralPosition'],
        '0x012C': ['DS', '3', 'IsocenterPosition'],
        '0x012E': ['DS', '3', 'SurfaceEntryPoint'],
        '0x0130': ['DS', '1', 'SourceToSurfaceDistance'],
        '0x0134': ['DS', '1', 'CumulativeMetersetWeight'],
        '0x0140': ['FL', '1', 'TableTopPitchAngle'],
        '0x0142': ['CS', '1', 'TableTopPitchRotationDirection'],
        '0x0144': ['FL', '1', 'TableTopRollAngle'],
        '0x0146': ['CS', '1', 'TableTopRollRotationDirection'],
        '0x0148': ['FL', '1', 'HeadFixationAngle'],
        '0x014A': ['FL', '1', 'GantryPitchAngle'],
        '0x014C': ['CS', '1', 'GantryPitchRotationDirection'],
        '0x014E': ['FL', '1', 'GantryPitchAngleTolerance'],
        '0x0180': ['SQ', '1', 'PatientSetupSequence'],
        '0x0182': ['IS', '1', 'PatientSetupNumber'],
        '0x0184': ['LO', '1', 'PatientAdditionalPosition'],
        '0x0190': ['SQ', '1', 'FixationDeviceSequence'],
        '0x0192': ['CS', '1', 'FixationDeviceType'],
        '0x0194': ['SH', '1', 'FixationDeviceLabel'],
        '0x0196': ['ST', '1', 'FixationDeviceDescription'],
        '0x0198': ['SH', '1', 'FixationDevicePosition'],
        '0x01A0': ['SQ', '1', 'ShieldingDeviceSequence'],
        '0x01A2': ['CS', '1', 'ShieldingDeviceType'],
        '0x01A4': ['SH', '1', 'ShieldingDeviceLabel'],
        '0x01A6': ['ST', '1', 'ShieldingDeviceDescription'],
        '0x01A8': ['SH', '1', 'ShieldingDevicePosition'],
        '0x01B0': ['CS', '1', 'SetupTechnique'],
        '0x01B2': ['ST', '1', 'SetupTechniqueDescription'],
        '0x01B4': ['SQ', '1', 'SetupDeviceSequence'],
        '0x01B6': ['CS', '1', 'SetupDeviceType'],
        '0x01B8': ['SH', '1', 'SetupDeviceLabel'],
        '0x01BA': ['ST', '1', 'SetupDeviceDescription'],
        '0x01BC': ['DS', '1', 'SetupDeviceParameter'],
        '0x01D0': ['ST', '1', 'SetupReferenceDescription'],
        '0x01D2': ['DS', '1', 'TableTopVerticalSetupDisplacement'],
        '0x01D4': ['DS', '1', 'TableTopLongitudinalSetupDisplacement'],
        '0x01D6': ['DS', '1', 'TableTopLateralSetupDisplacement'],
        '0x0200': ['CS', '1', 'BrachyTreatmentTechnique'],
        '0x0202': ['CS', '1', 'BrachyTreatmentType'],
        '0x0206': ['SQ', '1', 'TreatmentMachineSequence'],
        '0x0210': ['SQ', '1', 'SourceSequence'],
        '0x0212': ['IS', '1', 'SourceNumber'],
        '0x0214': ['CS', '1', 'SourceType'],
        '0x0216': ['LO', '1', 'SourceManufacturer'],
        '0x0218': ['DS', '1', 'ActiveSourceDiameter'],
        '0x021A': ['DS', '1', 'ActiveSourceLength'],
        '0x0222': ['DS', '1', 'SourceEncapsulationNominalThickness'],
        '0x0224': ['DS', '1', 'SourceEncapsulationNominalTransmission'],
        '0x0226': ['LO', '1', 'SourceIsotopeName'],
        '0x0228': ['DS', '1', 'SourceIsotopeHalfLife'],
        '0x022A': ['DS', '1', 'ReferenceAirKermaRate'],
        '0x022C': ['DA', '1', 'AirKermaRateReferenceDate'],
        '0x022E': ['TM', '1', 'AirKermaRateReferenceTime'],
        '0x0230': ['SQ', '1', 'ApplicationSetupSequence'],
        '0x0232': ['CS', '1', 'ApplicationSetupType'],
        '0x0234': ['IS', '1', 'ApplicationSetupNumber'],
        '0x0236': ['LO', '1', 'ApplicationSetupName'],
        '0x0238': ['LO', '1', 'ApplicationSetupManufacturer'],
        '0x0240': ['IS', '1', 'TemplateNumber'],
        '0x0242': ['SH', '1', 'TemplateType'],
        '0x0244': ['LO', '1', 'TemplateName'],
        '0x0250': ['DS', '1', 'TotalReferenceAirKerma'],
        '0x0260': ['SQ', '1', 'BrachyAccessoryDeviceSequence'],
        '0x0262': ['IS', '1', 'BrachyAccessoryDeviceNumber'],
        '0x0263': ['SH', '1', 'BrachyAccessoryDeviceID'],
        '0x0264': ['CS', '1', 'BrachyAccessoryDeviceType'],
        '0x0266': ['LO', '1', 'BrachyAccessoryDeviceName'],
        '0x026A': ['DS', '1', 'BrachyAccessoryDeviceNominalThickness'],
        '0x026C': ['DS', '1', 'BrachyAccessoryDeviceNominalTransmission'],
        '0x0280': ['SQ', '1', 'ChannelSequence'],
        '0x0282': ['IS', '1', 'ChannelNumber'],
        '0x0284': ['DS', '1', 'ChannelLength'],
        '0x0286': ['DS', '1', 'ChannelTotalTime'],
        '0x0288': ['CS', '1', 'SourceMovementType'],
        '0x028A': ['IS', '1', 'NumberOfPulses'],
        '0x028C': ['DS', '1', 'PulseRepetitionInterval'],
        '0x0290': ['IS', '1', 'SourceApplicatorNumber'],
        '0x0291': ['SH', '1', 'SourceApplicatorID'],
        '0x0292': ['CS', '1', 'SourceApplicatorType'],
        '0x0294': ['LO', '1', 'SourceApplicatorName'],
        '0x0296': ['DS', '1', 'SourceApplicatorLength'],
        '0x0298': ['LO', '1', 'SourceApplicatorManufacturer'],
        '0x029C': ['DS', '1', 'SourceApplicatorWallNominalThickness'],
        '0x029E': ['DS', '1', 'SourceApplicatorWallNominalTransmission'],
        '0x02A0': ['DS', '1', 'SourceApplicatorStepSize'],
        '0x02A2': ['IS', '1', 'TransferTubeNumber'],
        '0x02A4': ['DS', '1', 'TransferTubeLength'],
        '0x02B0': ['SQ', '1', 'ChannelShieldSequence'],
        '0x02B2': ['IS', '1', 'ChannelShieldNumber'],
        '0x02B3': ['SH', '1', 'ChannelShieldID'],
        '0x02B4': ['LO', '1', 'ChannelShieldName'],
        '0x02B8': ['DS', '1', 'ChannelShieldNominalThickness'],
        '0x02BA': ['DS', '1', 'ChannelShieldNominalTransmission'],
        '0x02C8': ['DS', '1', 'FinalCumulativeTimeWeight'],
        '0x02D0': ['SQ', '1', 'BrachyControlPointSequence'],
        '0x02D2': ['DS', '1', 'ControlPointRelativePosition'],
        '0x02D4': ['DS', '3', 'ControlPointDPosition'],
        '0x02D6': ['DS', '1', 'CumulativeTimeWeight'],
    },
    '0x300C': {
        '0x0000': ['UL', '1', 'RTRelationshipGroupLength'],
        '0x0002': ['SQ', '1', 'ReferencedRTPlanSequence'],
        '0x0004': ['SQ', '1', 'ReferencedBeamSequence'],
        '0x0006': ['IS', '1', 'ReferencedBeamNumber'],
        '0x0007': ['IS', '1', 'ReferencedReferenceImageNumber'],
        '0x0008': ['DS', '1', 'StartCumulativeMetersetWeight'],
        '0x0009': ['DS', '1', 'EndCumulativeMetersetWeight'],
        '0x000A': ['SQ', '1', 'ReferencedBrachyApplicationSetupSequence'],
        '0x000C': ['IS', '1', 'ReferencedBrachyApplicationSetupNumber'],
        '0x000E': ['IS', '1', 'ReferencedSourceNumber'],
        '0x0020': ['SQ', '1', 'ReferencedFractionGroupSequence'],
        '0x0022': ['IS', '1', 'ReferencedFractionGroupNumber'],
        '0x0040': ['SQ', '1', 'ReferencedVerificationImageSequence'],
        '0x0042': ['SQ', '1', 'ReferencedReferenceImageSequence'],
        '0x0050': ['SQ', '1', 'ReferencedDoseReferenceSequence'],
        '0x0051': ['IS', '1', 'ReferencedDoseReferenceNumber'],
        '0x0055': ['SQ', '1', 'BrachyReferencedDoseReferenceSequence'],
        '0x0060': ['SQ', '1', 'ReferencedStructureSetSequence'],
        '0x006A': ['IS', '1', 'ReferencedPatientSetupNumber'],
        '0x0080': ['SQ', '1', 'ReferencedDoseSequence'],
        '0x00A0': ['IS', '1', 'ReferencedToleranceTableNumber'],
        '0x00B0': ['SQ', '1', 'ReferencedBolusSequence'],
        '0x00C0': ['IS', '1', 'ReferencedWedgeNumber'],
        '0x00D0': ['IS', '1', 'ReferencedCompensatorNumber'],
        '0x00E0': ['IS', '1', 'ReferencedBlockNumber'],
        '0x00F0': ['IS', '1', 'ReferencedControlPointIndex'],
    },
    '0x300E': {
        '0x0000': ['UL', '1', 'RTApprovalGroupLength'],
        '0x0002': ['CS', '1', 'ApprovalStatus'],
        '0x0004': ['DA', '1', 'ReviewDate'],
        '0x0005': ['TM', '1', 'ReviewTime'],
        '0x0008': ['PN', '1', 'ReviewerName'],
    },
    '0x4000': {
        '0x0000': ['UL', '1', 'TextGroupLength'],
        '0x0010': ['LT', '1-n', 'TextArbitrary'],
        '0x4000': ['LT', '1-n', 'TextComments'],
    },
    '0x4008': {
        '0x0000': ['UL', '1', 'ResultsGroupLength'],
        '0x0040': ['SH', '1', 'ResultsID'],
        '0x0042': ['LO', '1', 'ResultsIDIssuer'],
        '0x0050': ['SQ', '1', 'ReferencedInterpretationSequence'],
        '0x0100': ['DA', '1', 'InterpretationRecordedDate'],
        '0x0101': ['TM', '1', 'InterpretationRecordedTime'],
        '0x0102': ['PN', '1', 'InterpretationRecorder'],
        '0x0103': ['LO', '1', 'ReferenceToRecordedSound'],
        '0x0108': ['DA', '1', 'InterpretationTranscriptionDate'],
        '0x0109': ['TM', '1', 'InterpretationTranscriptionTime'],
        '0x010A': ['PN', '1', 'InterpretationTranscriber'],
        '0x010B': ['ST', '1', 'InterpretationText'],
        '0x010C': ['PN', '1', 'InterpretationAuthor'],
        '0x0111': ['SQ', '1', 'InterpretationApproverSequence'],
        '0x0112': ['DA', '1', 'InterpretationApprovalDate'],
        '0x0113': ['TM', '1', 'InterpretationApprovalTime'],
        '0x0114': ['PN', '1', 'PhysicianApprovingInterpretation'],
        '0x0115': ['LT', '1', 'InterpretationDiagnosisDescription'],
        '0x0117': ['SQ', '1', 'DiagnosisCodeSequence'],
        '0x0118': ['SQ', '1', 'ResultsDistributionListSequence'],
        '0x0119': ['PN', '1', 'DistributionName'],
        '0x011A': ['LO', '1', 'DistributionAddress'],
        '0x0200': ['SH', '1', 'InterpretationID'],
        '0x0202': ['LO', '1', 'InterpretationIDIssuer'],
        '0x0210': ['CS', '1', 'InterpretationTypeID'],
        '0x0212': ['CS', '1', 'InterpretationStatusID'],
        '0x0300': ['ST', '1', 'Impressions'],
        '0x4000': ['ST', '1', 'ResultsComments'],
    },
    '0x5000': {
        '0x0000': ['UL', '1', 'CurveGroupLength'],
        '0x0005': ['US', '1', 'CurveDimensions'],
        '0x0010': ['US', '1', 'NumberOfPoints'],
        '0x0020': ['CS', '1', 'TypeOfData'],
        '0x0022': ['LO', '1', 'CurveDescription'],
        '0x0030': ['SH', '1-n', 'AxisUnits'],
        '0x0040': ['SH', '1-n', 'AxisLabels'],
        '0x0103': ['US', '1', 'DataValueRepresentation'],
        '0x0104': ['US', '1-n', 'MinimumCoordinateValue'],
        '0x0105': ['US', '1-n', 'MaximumCoordinateValue'],
        '0x0106': ['SH', '1-n', 'CurveRange'],
        '0x0110': ['US', '1', 'CurveDataDescriptor'],
        '0x0112': ['US', '1', 'CoordinateStartValue'],
        '0x0114': ['US', '1', 'CoordinateStepValue'],
        '0x2000': ['US', '1', 'AudioType'],
        '0x2002': ['US', '1', 'AudioSampleFormat'],
        '0x2004': ['US', '1', 'NumberOfChannels'],
        '0x2006': ['UL', '1', 'NumberOfSamples'],
        '0x2008': ['UL', '1', 'SampleRate'],
        '0x200A': ['UL', '1', 'TotalTime'],
        '0x200C': ['OX', '1', 'AudioSampleData'],
        '0x200E': ['LT', '1', 'AudioComments'],
        '0x3000': ['OX', '1', 'CurveData'],
    },
    '0x5400': {
        '0x0100': ['SQ', '1', 'WaveformSequence'],
        '0x0110': ['OW/OB', '1', 'ChannelMinimumValue'],
        '0x0112': ['OW/OB', '1', 'ChannelMaximumValue'],
        '0x1004': ['US', '1', 'WaveformBitsAllocated'],
        '0x1006': ['CS', '1', 'WaveformSampleInterpretation'],
        '0x100A': ['OW/OB', '1', 'WaveformPaddingValue'],
        '0x1010': ['OW/OB', '1', 'WaveformData'],
    },
    '0x6000': {
        '0x0000': ['UL', '1', 'OverlayGroupLength'],
        '0x0010': ['US', '1', 'OverlayRows'],
        '0x0011': ['US', '1', 'OverlayColumns'],
        '0x0012': ['US', '1', 'OverlayPlanes'],
        '0x0015': ['IS', '1', 'OverlayNumberOfFrames'],
        '0x0040': ['CS', '1', 'OverlayType'],
        '0x0050': ['SS', '2', 'OverlayOrigin'],
        '0x0051': ['US', '1', 'OverlayImageFrameOrigin'],
        '0x0052': ['US', '1', 'OverlayPlaneOrigin'],
        '0x0060': ['CS', '1', 'OverlayCompressionCode'],
        '0x0061': ['SH', '1', 'OverlayCompressionOriginator'],
        '0x0062': ['SH', '1', 'OverlayCompressionLabel'],
        '0x0063': ['SH', '1', 'OverlayCompressionDescription'],
        '0x0066': ['AT', '1-n', 'OverlayCompressionStepPointers'],
        '0x0068': ['US', '1', 'OverlayRepeatInterval'],
        '0x0069': ['US', '1', 'OverlayBitsGrouped'],
        '0x0100': ['US', '1', 'OverlayBitsAllocated'],
        '0x0102': ['US', '1', 'OverlayBitPosition'],
        '0x0110': ['CS', '1', 'OverlayFormat'],
        '0x0200': ['US', '1', 'OverlayLocation'],
        '0x0800': ['CS', '1-n', 'OverlayCodeLabel'],
        '0x0802': ['US', '1', 'OverlayNumberOfTables'],
        '0x0803': ['AT', '1-n', 'OverlayCodeTableLocation'],
        '0x0804': ['US', '1', 'OverlayBitsForCodeWord'],
        '0x1100': ['US', '1', 'OverlayDescriptorGray'],
        '0x1101': ['US', '1', 'OverlayDescriptorRed'],
        '0x1102': ['US', '1', 'OverlayDescriptorGreen'],
        '0x1103': ['US', '1', 'OverlayDescriptorBlue'],
        '0x1200': ['US', '1-n', 'OverlayGray'],
        '0x1201': ['US', '1-n', 'OverlayRed'],
        '0x1202': ['US', '1-n', 'OverlayGreen'],
        '0x1203': ['US', '1-n', 'OverlayBlue'],
        '0x1301': ['IS', '1', 'ROIArea'],
        '0x1302': ['DS', '1', 'ROIMean'],
        '0x1303': ['DS', '1', 'ROIStandardDeviation'],
        '0x3000': ['OW', '1', 'OverlayData'],
        '0x4000': ['LT', '1-n', 'OverlayComments'],
    },
    '0x7F00': {
        '0x0000': ['UL', '1', 'VariablePixelDataGroupLength'],
        '0x0010': ['OX', '1', 'VariablePixelData'],
        '0x0011': ['AT', '1', 'VariableNextDataGroup'],
        '0x0020': ['OW', '1-n', 'VariableCoefficientsSDVN'],
        '0x0030': ['OW', '1-n', 'VariableCoefficientsSDHN'],
        '0x0040': ['OW', '1-n', 'VariableCoefficientsSDDN'],
    },
    '0x7FE0': {
        '0x0000': ['UL', '1', 'PixelDataGroupLength'],
        '0x0010': ['OX', '1', 'PixelData'],
        '0x0020': ['OW', '1-n', 'CoefficientsSDVN'],
        '0x0030': ['OW', '1-n', 'CoefficientsSDHN'],
        '0x0040': ['OW', '1-n', 'CoefficientsSDDN'],
    },
    '0xFFFC': {
        '0xFFFC': ['OB', '1', 'DataSetTrailingPadding'],
    },
    '0xFFFE': {
        '0xE000': ['NONE', '1', 'Item'],
        '0xE00D': ['NONE', '1', 'ItemDelimitationItem'],
        '0xE0DD': ['NONE', '1', 'SequenceDelimitationItem'],
    },
}; // dwv.dicom.Dictionnary
;/** 
 * Browser module.
 * @module browser
 */
var dwv = dwv || {};
/**
 * Namespace for browser related functions.
 * @class browser
 * @namespace dwv
 * @static
 */
dwv.browser = dwv.browser || {};

/**
 * Browser check for the FileAPI.
 * @method hasFileApi
 * @static
 */ 
dwv.browser.hasFileApi = function()
{
    // regular test does not work on Safari 5
    var isSafari5 = (navigator.appVersion.indexOf("Safari") != -1) &&
        ( (navigator.appVersion.indexOf("5.0.") != -1) ||
          (navigator.appVersion.indexOf("5.1.") != -1) );
    if( isSafari5 ) 
    {
        console.warn("Assuming FileAPI support for Safari5...");
        return true;
    }
    // regular test
    return "FileReader" in window;
};

/**
 * Browser check for the XMLHttpRequest.
 * @method hasXmlHttpRequest
 * @static
 */ 
dwv.browser.hasXmlHttpRequest = function()
{
    return "XMLHttpRequest" in window && "withCredentials" in new XMLHttpRequest();
};

/**
 * Browser check for typed array.
 * @method hasTypedArray
 * @static
 */ 
dwv.browser.hasTypedArray = function()
{
    return "Uint8Array" in window && "Uint16Array" in window;
};

/**
 * Browser check for clamped array.
 * @method hasClampedArray
 * @static
 */ 
dwv.browser.hasClampedArray = function()
{
    return "Uint8ClampedArray" in window;
};

/**
 * Browser checks to see if it can run dwv. Throws an error if not.
 * TODO Maybe use http://modernizr.com/.
 * @method check
 * @static
 */ 
dwv.browser.check = function()
{
    var appnorun = "The application cannot be run.";
    var message = "";
    // Check for the File API support
    if( !dwv.browser.hasFileApi() ) {
        message = "The File APIs are not supported in this browser. ";
        alert(message+appnorun);
        throw new Error(message);
    }
    // Check for XMLHttpRequest
    if( !dwv.browser.hasXmlHttpRequest() ) {
        message = "The XMLHttpRequest is not supported in this browser. ";
        alert(message+appnorun);
        throw new Error(message);
    }
    // Check typed array
    if( !dwv.browser.hasTypedArray() ) {
        message = "The Typed arrays are not supported in this browser. ";
        alert(message+appnorun);
        throw new Error(message);
    }
    // check clamped array
    if( !dwv.browser.hasClampedArray() ) {
        // silent fail since IE does not support it...
        console.warn("The Uint8ClampedArray is not supported in this browser. This may impair performance. ");
    }
};
;/** 
 * GUI module.
 * @module gui
 */
var dwv = dwv || {};
/**
 * Namespace for GUI functions.
 * @class gui
 * @namespace dwv
 * @static
 */
dwv.gui = dwv.gui || {};
dwv.gui.base = dwv.gui.base || {};
dwv.gui.filter = dwv.gui.filter || {};
dwv.gui.filter.base = dwv.gui.filter.base || {};

/**
 * Append the filter HTML to the page.
 * @method appendFilterHtml
 * @static
 */
dwv.gui.base.appendFilterHtml = function()
{
    // filter select
    var filterSelector = dwv.html.createHtmlSelect("filterSelect",dwv.tool.filters);
    filterSelector.onchange = dwv.gui.onChangeFilter;

    // filter list element
    var filterLi = document.createElement("li");
    filterLi.id = "filterLi";
    filterLi.style.display = "none";
    filterLi.setAttribute("class","ui-block-b");
    filterLi.appendChild(filterSelector);
    
    // node
    var node = document.getElementById("toolList");
    // apend filter
    node.appendChild(filterLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the filter HTML.
 * @method displayFilterHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.base.displayFilterHtml = function(bool)
{
    // filter lsit element
    var filterLi = document.getElementById("filterLi");
    filterLi.style.display = bool ? "" : "none";
};

/**
 * Initialise the filter HTML.
 * @method displayFilterHtml
 * @static
 */
dwv.gui.base.initFilterHtml = function()
{
    // filter select: reset selected options
    var filterSelector = document.getElementById("filterSelect");
    filterSelector.selectedIndex = 0;
    dwv.gui.refreshSelect("#filterSelect");
};

// create namespace if not there
dwv.gui.filter = dwv.gui.filter || {};

/**
 * Append the threshold filter HTML to the page.
 * @method appendThresholdHtml
 * @static
 */
dwv.gui.filter.base.appendThresholdHtml = function()
{
    // threshold list element
    var thresholdLi = document.createElement("li");
    thresholdLi.id = "thresholdLi";
    thresholdLi.setAttribute("class","ui-block-c");
    thresholdLi.style.display = "none";
    
    // node
    var node = document.getElementById("toolList");
    // append threshold
    node.appendChild(thresholdLi);
    // threshold slider
    dwv.gui.appendSliderHtml();
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Clear the treshold filter HTML.
 * @method displayThresholdHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.filter.base.displayThresholdHtml = function(bool)
{
    // threshold list element
    var thresholdLi = document.getElementById("thresholdLi");
    thresholdLi.style.display = bool ? "" : "none";
};

/**
 * Initialise the treshold filter HTML.
 * @method initThresholdHtml
 * @static
 */
dwv.gui.filter.base.initThresholdHtml = function()
{
    // threshold slider
    dwv.gui.initSliderHtml();
};

/**
 * Append the sharpen filter HTML to the page.
 * @method appendSharpenHtml
 * @static
 */
dwv.gui.filter.base.appendSharpenHtml = function()
{
    // sharpen button
    var buttonRun = document.createElement("button");
    buttonRun.id = "runFilterButton";
    buttonRun.onclick = dwv.gui.onRunFilter;
    buttonRun.appendChild(document.createTextNode("Apply"));

    // sharpen list element
    var sharpenLi = document.createElement("li");
    sharpenLi.id = "sharpenLi";
    sharpenLi.style.display = "none";
    sharpenLi.setAttribute("class","ui-block-c");
    sharpenLi.appendChild(buttonRun);
    
    // node
    var node = document.getElementById("toolList");
    // append threshold
    node.appendChild(sharpenLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the sharpen filter HTML.
 * @method displaySharpenHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.filter.base.displaySharpenHtml = function(bool)
{
    // sharpen list element
    var sharpenLi = document.getElementById("sharpenLi");
    sharpenLi.style.display = bool ? "" : "none";
};

/**
 * Append the sobel filter HTML to the page.
 * @method appendSobelHtml
 * @static
 */
dwv.gui.filter.base.appendSobelHtml = function()
{
    // sobel button
    var buttonRun = document.createElement("button");
    buttonRun.id = "runFilterButton";
    buttonRun.onclick = dwv.gui.onRunFilter;
    buttonRun.appendChild(document.createTextNode("Apply"));

    // sobel list element
    var sobelLi = document.createElement("li");
    sobelLi.id = "sobelLi";
    sobelLi.style.display = "none";
    sobelLi.setAttribute("class","ui-block-c");
    sobelLi.appendChild(buttonRun);
    
    // node
    var node = document.getElementById("toolList");
    // append sobel
    node.appendChild(sobelLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the sobel filter HTML.
 * @method displaySobelHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.filter.base.displaySobelHtml = function(bool)
{
    // sobel list element
    var sobelLi = document.getElementById("sobelLi");
    sobelLi.style.display = bool ? "" : "none";
};

;/** 
 * GUI module.
 * @module gui
 */
var dwv = dwv || {};
/**
 * Namespace for GUI functions.
 * @class gui
 * @namespace dwv
 * @static
 */
dwv.gui = dwv.gui || {};
dwv.gui.base = dwv.gui.base || {};

/**
 * Get the size of the image display window.
 * @method getWindowSize
 * @static
 */
dwv.gui.base.getWindowSize = function()
{
    return { 'width': ($(window).width()), 'height': ($(window).height() - 147) };
};

/**
 * Update the progress bar.
 * @method updateProgress
 * @static
 * @param {Object} event A ProgressEvent.
 */
dwv.gui.updateProgress = function(event)
{
    // event is an ProgressEvent.
    if( event.lengthComputable )
    {
        var percent = Math.round((event.loaded / event.total) * 100);
        dwv.gui.displayProgress(percent);
    }
};

/**
 * Display a progress value.
 * @method displayProgress
 * @static
 * @param {Number} percent The progress percentage.
 */
dwv.gui.base.displayProgress = function(percent)
{
    // jquery-mobile specific
    if( percent < 100 ) {
        $.mobile.loading("show", {text: percent+"%", textVisible: true, theme: "b"} );
    }
    else if( percent === 100 ) {
        $.mobile.loading("hide");
    }
};

/**
 * Refresh a HTML select.
 * @method refreshSelect
 * @static
 * @param {String} selectName The name of the HTML select to refresh.
 */
dwv.gui.refreshSelect = function(selectName)
{
    // jquery-mobile
    if( $(selectName).selectmenu ) {
        $(selectName).selectmenu('refresh');
    }
};

/**
 * Set the selected item of a HTML select.
 * @method refreshSelect
 * @static
 * @param {String} selectName The name of the HTML select.
 * @param {String} itemName The name of the itme to mark as selected.
 */
dwv.gui.setSelected = function(selectName, itemName)
{
    var select = document.getElementById(selectName);
    var index = 0;
    for( index in select.options){ 
        if( select.options[index].text === itemName ) {
            break;
        }
    }
    select.selectedIndex = index;
    dwv.gui.refreshSelect("#" + selectName);
};

/**
 * Append the slider HTML.
 * @method appendSliderHtml
 * @static
 */
dwv.gui.base.appendSliderHtml = function()
{
    // default values
    var min = 0;
    var max = 1;
    
    // jquery-mobile range slider
    // minimum input
    var inputMin = document.createElement("input");
    inputMin.id = "threshold-min";
    inputMin.type = "range";
    inputMin.max = max;
    inputMin.min = min;
    inputMin.value = min;
    // maximum input
    var inputMax = document.createElement("input");
    inputMax.id = "threshold-max";
    inputMax.type = "range";
    inputMax.max = max;
    inputMax.min = min;
    inputMax.value = max;
    // slicer div
    var div = document.createElement("div");
    div.id = "threshold-div";
    div.setAttribute("data-role", "rangeslider");
    div.appendChild(inputMin);
    div.appendChild(inputMax);
    div.setAttribute("data-mini", "true");
    // append to document
    document.getElementById("thresholdLi").appendChild(div);
    // bind change
    $("#threshold-div").on("change",
            function(/*event*/) {
                dwv.gui.onChangeMinMax(
                    { "min":$("#threshold-min").val(),
                      "max":$("#threshold-max").val() } );
            }
        );
    // trigger creation
    $("#toolList").trigger("create");
};

/**
 * Initialise the slider HTML.
 * @method initSliderHtml
 * @static
 */
dwv.gui.base.initSliderHtml = function()
{
    var min = app.getImage().getDataRange().min;
    var max = app.getImage().getDataRange().max;
    
    // minimum input
    var inputMin = document.getElementById("threshold-min");
    inputMin.max = max;
    inputMin.min = min;
    inputMin.value = min;
    // maximum input
    var inputMax = document.getElementById("threshold-max");
    inputMax.max = max;
    inputMax.min = min;
    inputMax.value = max;
    // trigger creation
    $("#toolList").trigger("create");
};


;/** 
 * GUI module.
 * @module gui
 */
var dwv = dwv || {};
/**
 * Namespace for GUI functions.
 * @class gui
 * @namespace dwv
 * @static
 */
dwv.gui = dwv.gui || {};

/**
 * Handle window/level change.
 * @method onChangeWindowLevelPreset
 * @namespace dwv.gui
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeWindowLevelPreset = function(/*event*/)
{
    dwv.tool.updateWindowingDataFromName(this.value);
};

/**
 * Handle colour map change.
 * @method onChangeColourMap
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeColourMap = function(/*event*/)
{
    dwv.tool.updateColourMapFromName(this.value);
};

/**
 * Handle loader change.
 * @method onChangeLoader
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeLoader = function(/*event*/)
{
    if( this.value === "file") {
        dwv.gui.displayUrlLoadHtml(false);
        dwv.gui.displayFileLoadHtml(true);
    }
    else if( this.value === "url") {
        dwv.gui.displayFileLoadHtml(false);
        dwv.gui.displayUrlLoadHtml(true);
    }
};

/**
 * Handle files change.
 * @method onChangeFiles
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeFiles = function(event)
{
    app.onChangeFiles(event);
};

/**
 * Handle URL change.
 * @method onChangeURL
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeURL = function(event)
{
    app.onChangeURL(event);
};

/**
 * Handle tool change.
 * @method onChangeTool
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeTool = function(/*event*/)
{
    app.getToolBox().setSelectedTool(this.value);
};

/**
 * Handle filter change.
 * @method onChangeFilter
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeFilter = function(/*event*/)
{
    app.getToolBox().getSelectedTool().setSelectedFilter(this.value);
};

/**
 * Handle filter run.
 * @method onRunFilter
 * @static
 * @param {Object} event The run event.
 */
dwv.gui.onRunFilter = function(/*event*/)
{
    app.getToolBox().getSelectedTool().getSelectedFilter().run();
};

/**
 * Handle min/max slider change.
 * @method onChangeMinMax
 * @static
 * @param {Object} range The new range of the data.
 */
dwv.gui.onChangeMinMax = function(range)
{
    // seems like jquery is checking if the method exists before it 
    // is used...
    if( app.getToolBox().getSelectedTool().getSelectedFilter ) {
        app.getToolBox().getSelectedTool().getSelectedFilter().run(range);
    }
};

/**
 * Handle shape change.
 * @method onChangeShape
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeShape = function(/*event*/)
{
    app.getToolBox().getSelectedTool().setShapeName(this.value);
};

/**
 * Handle line color change.
 * @method onChangeLineColour
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeLineColour = function(/*event*/)
{
    app.getToolBox().getSelectedTool().setLineColour(this.value);
};

/**
 * Handle zoom reset.
 * @method onZoomReset
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onZoomReset = function(/*event*/)
{
    app.resetLayout();
};

/**
 * Handle display reset.
 * @method onDisplayReset
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onDisplayReset = function(event)
{
    dwv.gui.onZoomReset(event);
    app.initWLDisplay();
    // update preset select
    var select = document.getElementById("presetSelect");
    select.selectedIndex = 0;
    dwv.gui.refreshSelect("#presetSelect");
};

/**
 * Handle undo.
 * @method onUndo
 * @static
 * @param {Object} event The associated event.
 */
dwv.gui.onUndo = function(/*event*/)
{
    app.getUndoStack().undo();
};

/**
 * Handle redo.
 * @method onRedo
 * @static
 * @param {Object} event The associated event.
 */
dwv.gui.onRedo = function(/*event*/)
{
    app.getUndoStack().redo();
};

/**
 * Handle toggle of info layer.
 * @method onToggleInfoLayer
 * @static
 * @param {Object} event The associated event.
 */
dwv.gui.onToggleInfoLayer = function(/*event*/)
{
    app.toggleInfoLayerDisplay();
};
;/** 
 * GUI module.
 * @module gui
 */
var dwv = dwv || {};
/**
 * Namespace for GUI functions.
 * @class gui
 * @namespace dwv
 * @static
 */
dwv.gui = dwv.gui || {};
dwv.gui.base = dwv.gui.base || {};

/**
 * Append the version HTML.
 * @method appendVersionHtml
 */
dwv.gui.base.appendVersionHtml = function()
{
    var nodes = document.getElementsByClassName("dwv-version");
    for( var i = 0; i < nodes.length; ++i ){
        nodes[i].appendChild(document.createTextNode(app.getVersion()));
    }
};

/**
 * Build the help HTML.
 * @method appendHelpHtml
 * @param {Boolean} mobile Flag for mobile or not environement.
 */
dwv.gui.base.appendHelpHtml = function(mobile)
{
    var actionType = "mouse";
    if( mobile ) {
        actionType = "touch";
    }
    
    var toolHelpDiv = document.createElement("div");
    
    // current location
    var loc = window.location.pathname;
    var dir = loc.substring(0, loc.lastIndexOf('/'));

    for ( var t in dwv.tool.tools )
    {
        var tool = dwv.tool.tools[t];
        // title
        var title = document.createElement("h3");
        title.appendChild(document.createTextNode(tool.getHelp().title));
        // doc div
        var docDiv = document.createElement("div");
        // brief
        var brief = document.createElement("p");
        brief.appendChild(document.createTextNode(tool.getHelp().brief));
        docDiv.appendChild(brief);
        // details
        if( tool.getHelp()[actionType] ) {
            var keys = Object.keys(tool.getHelp()[actionType]);
            for( var i=0; i<keys.length; ++i )
            {
                var action = tool.getHelp()[actionType][keys[i]];
                
                var img = document.createElement("img");
                img.src = dir + "/../../resources/"+keys[i]+".png";
                img.style.float = "left";
                img.style.margin = "0px 15px 15px 0px";
                
                var br = document.createElement("br");
                br.style.clear = "both";
                
                var para = document.createElement("p");
                para.appendChild(img);
                para.appendChild(document.createTextNode(action));
                para.appendChild(br);
                docDiv.appendChild(para);
            }
        }
        
        // different div structure for mobile or static
        if( mobile )
        {
            var toolDiv = document.createElement("div");
            toolDiv.setAttribute("data-role", "collapsible");
            toolDiv.appendChild(title);
            toolDiv.appendChild(docDiv);
            toolHelpDiv.appendChild(toolDiv);
        }
        else
        {
            toolHelpDiv.id = "accordion";
            toolHelpDiv.appendChild(title);
            toolHelpDiv.appendChild(docDiv);
        }
    }
    
    var helpNode = document.getElementById("help");

    var headPara = document.createElement("p");
    headPara.appendChild(document.createTextNode("DWV can load DICOM data " +
        "either from a local file or from an URL. All DICOM tags are available " +
        "in a searchable table, press the 'tags' or grid button. " + 
        "You can choose to display the image information overlay by pressing the " + 
        "'info' or i button. "));
    helpNode.appendChild(headPara);
    
    var toolPara = document.createElement("p");
    toolPara.appendChild(document.createTextNode("Each tool defines the possible " + 
        "user interactions. The default tool is the window/level one. " + 
        "Here are the available tools:"));
    helpNode.appendChild(toolPara);
    helpNode.appendChild(toolHelpDiv);
};
;/** 
 * HTML module.
 * @module html
 */
var dwv = dwv || {};
/**
 * Namespace for HTML related functions.
 * @class html
 * @namespace dwv
 * @static
 */
dwv.html = dwv.html || {};

/**
 * Append a cell to a given row.
 * @method appendCell
 * @static
 * @param {Object} row The row to append the cell to.
 * @param {String} text The text of the cell.
 */
dwv.html.appendCell = function(row, text)
{
    var cell = row.insertCell(-1);
    cell.appendChild(document.createTextNode(text));
};

/**
 * Append a header cell to a given row.
 * @method appendHCell
 * @static
 * @param {Object} row The row to append the header cell to.
 * @param {String} text The text of the header cell.
 */
dwv.html.appendHCell = function(row, text)
{
    var cell = document.createElement("th");
    // TODO jquery-mobile specific...
    if( text !== "Value" && text !== "Name" ) {
        cell.setAttribute("data-priority", "1");
    }
    cell.appendChild(document.createTextNode(text));
    row.appendChild(cell);
};

/**
 * Append a row to an array.
 * @method appendRowForArray
 * @static
 * @param {} table
 * @param {} input
 * @param {} level
 * @param {} maxLevel
 * @param {} rowHeader
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
 * Append a row to an object.
 * @method appendRowForObject
 * @static
 * @param {} table
 * @param {} input
 * @param {} level
 * @param {} maxLevel
 * @param {} rowHeader
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
 * Append a row to an object or an array.
 * @method appendRow
 * @static
 * @param {} table
 * @param {} input
 * @param {} level
 * @param {} maxLevel
 * @param {} rowHeader
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
 * Converts the input to an HTML table.
 * @method toTable
 * @static
 * @input {Mixed} input Allowed types are: array, array of object, object.
 * @return {Object} The created HTML table.
 * @warning Null is interpreted differently in browsers, firefox will not display it.
 */
dwv.html.toTable = function(input)
{
    var table = document.createElement('table');
    dwv.html.appendRow(table, input, 0, 2);
    return table;
};

/**
 * Get an HTML search form.
 * @method getHtmlSearchForm
 * @static
 * @param {Object} htmlTableToSearch The table to do the search on.
 * @return {Object} The HTML search form.
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
 * Filter a table with a given parameter: sets the display css of rows to
 * true or false if it contains the term.
 * @method filterTable
 * @static
 * @param {String} term The term to filter the table with.
 * @param {Object} table The table to filter.
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
 * Transform back each
 * 'preText <span class="highlighted">term</span> postText'
 * into its original 'preText term postText'.
 * @method dehighlight
 * @static
 * @param {Object} container The container to de-highlight.
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
 * Create a
 * 'preText <span class="highlighted">term</span> postText'
 * around each search term.
 * @method highlight
 * @static
 * @param {String} term The term to highlight.
 * @param {Object} container The container where to highlight the term.
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
 * Highlight a HTML node.
 * @method createHighlightNode
 * @static
 * @param {Object} child The child to highlight.
 * @return {Object} The created HTML node.
 */
dwv.html.createHighlightNode = function(child) {
    var node = document.createElement('span');
    node.setAttribute('class', 'highlighted');
    node.attributes['class'].value = 'highlighted';
    node.appendChild(child);
    return node;
};

/**
 * Remove all children of a HTML node.
 * @method cleanNode
 * @static
 * @param {Object} node The node to remove kids.
 */
dwv.html.cleanNode = function(node) {
    // remove its children
    while (node.hasChildNodes()) {
        node.removeChild(node.firstChild);
    }
};

/**
 * Remove a HTML node and all its children.
 * @method removeNode
 * @static
 * @param {Number} nodeId The id of the node to delete.
 */
dwv.html.removeNode = function(nodeId) {
    // find the node
    var node = document.getElementById(nodeId);
    // check node
    if( !node ) {
        return;
    }
    // remove its children
    dwv.html.cleanNode(node);
    // remove it from its parent
    var top = node.parentNode;
    top.removeChild(node);
};

/**
 * Create a HTML select from an input array of options.
 * The values of the options are the name of the option made lower case.
 * It is left to the user to set the 'onchange' method of the select.
 * @method createHtmlSelect
 * @static
 * @param {String} name The name of the HTML select.
 * @param {Mixed} list The list of options of the HTML select.
 * @return {Object} The created HTML select.
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
            option.value = list[i];
            option.appendChild(document.createTextNode(dwv.utils.capitaliseFirstLetter(list[i])));
            select.appendChild(option);
        }
    }
    else if( typeof list === 'object')
    {
        for ( var item in list )
        {
            option = document.createElement("option");
            option.value = item;
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

/**
 * Get a list of parameters from an input URI that looks like:
 *  [dwv root]?input=encodeURI([root]?key0=value0&key1=value1)
 * or
 *  [dwv root]?input=encodeURI([manifest link])&type=manifest
 *  
 * @method getUriParam
 * @static
 * @param {String } uri The URI to decode.
 * @return {Array} The array of parameters.
 */
dwv.html.getUriParam = function(uri)
{
    var inputUri = uri || window.location.href;
    // split key/value pairs
    var mainQueryPairs = dwv.utils.splitQueryString(inputUri);
    // check pairs
    if( mainQueryPairs === null ) {
        return null;
    }
    // has to have an input key
    var query = mainQueryPairs.query;
    if( !query || !query.input ) { 
        throw new Error("No input parameter in query URI.");
    }
    
    var result = [];
    // if manifest
    if( query.type && query.type === "manifest" ) {
        result = dwv.html.decodeManifestUri( query.input, query.nslices );
    }
    // if key/value uri
    else {
        result = dwv.html.decodeKeyValueUri( query.input, query.dwvReplaceMode );
    }
   
    return result;
};

/**
 * Decode a Key/Value pair uri. If a key is repeated, the result 
 * be an array of base + each key. 
 * @method decodeKeyValueUri
 * @static
 * @param {String} uri The uri to decode.
 * @param {String} replaceMode The key replace more.
 */
dwv.html.decodeKeyValueUri = function(uri, replaceMode)
{
    var result = [];

    // decode input URI
    var queryUri = decodeURIComponent(uri);
    // get key/value pairs from input URI
    var inputQueryPairs = dwv.utils.splitQueryString(queryUri);
    // repeat key replace mode (default to keep key)
    var repeatKeyReplaceMode = "key";
    if( replaceMode ) {
        repeatKeyReplaceMode = replaceMode;
    }
    
    if( !inputQueryPairs ) 
    {
        result.push(queryUri);
    }
    else
    {
        var keys = Object.keys(inputQueryPairs.query);
        // find repeat key
        var repeatKey = null;
        for( var i = 0; i < keys.length; ++i )
        {
            if( inputQueryPairs.query[keys[i]] instanceof Array )
            {
                repeatKey = keys[i];
                break;
            }
        }
    
        if( !repeatKey ) 
        {
            result.push(queryUri);
        }
        else
        {
            var repeatList = inputQueryPairs.query[repeatKey];
            // build base uri
            var baseUrl = inputQueryPairs.base;
            // do not add '?' for what looks like file elements
            // root/path/to/?key=0.jpg&key=1.jpg
            if( !( baseUrl[baseUrl.length-1] === '/' && repeatList[0].indexOf('.') !== -1 ) ) { 
                baseUrl += "?";
            }
            var gotOneArg = false;
            for( var j = 0; j < keys.length; ++j )
            {
                if( keys[j] !== repeatKey ) {
                    if( gotOneArg ) {
                        baseUrl += "&";
                    }
                    baseUrl += keys[j] + "=" + inputQueryPairs.query[keys[j]];
                    gotOneArg = true;
                }
            }
            // append built urls to result
            var url;
            for( var k = 0; k < repeatList.length; ++k )
            {
                url = baseUrl;
                if( gotOneArg ) {
                    url += "&";
                }
                if( repeatKeyReplaceMode === "key" ) {
                    url += repeatKey + "=";
                }
                // other than 'key' mode: do nothing
                url += repeatList[k];
                result.push(url);
            }
        }
    }
    // return
    return result;
};

/**
 * Decode a manifest uri. 
 * @method decodeManifestUri
 * @static
 * @param {String} uri The uri to decode.
 * @param {number} nslices The number of slices to load.
 */
dwv.html.decodeManifestUri = function(uri, nslices)
{
    var result = [];
    
    // Request error
    var onErrorRequest = function(/*event*/)
    {
        console.warn( "RequestError while receiving manifest: "+this.status );
    };

    // Request handler
    var onLoadRequest = function(/*event*/)
    {
        var doc = this.responseXML;
        // wado url
        var wadoElement = doc.getElementsByTagName("wado_query");
        var wadoURL = wadoElement[0].getAttribute("wadoURL");
        var rootURL = wadoURL + "?requestType=WADO&contentType=application/dicom&";
        // patient list
        var patientList = doc.getElementsByTagName("Patient");
        if( patientList.length > 1 ) {
            console.warn("More than one patient, loading first one.");
        }
        // study list
        var studyList = patientList[0].getElementsByTagName("Study");
        if( studyList.length > 1 ) {
            console.warn("More than one study, loading first one.");
        }
        var studyUID = studyList[0].getAttribute("StudyInstanceUID");
        // series list
        var seriesList = studyList[0].getElementsByTagName("Series");
        if( seriesList.length > 1 ) {
            console.warn("More than one series, loading first one.");
        }
        var seriesUID = seriesList[0].getAttribute("SeriesInstanceUID");
        // instance list
        var instanceList = seriesList[0].getElementsByTagName("Instance");
        // loop on instances and push links
        var max = instanceList.length;
        if( nslices < max ) {
            max = nslices;
        }
        for( var i = 0; i < max; ++i ) {
            var sopInstanceUID = instanceList[i].getAttribute("SOPInstanceUID");
            var link = rootURL + 
            "&studyUID=" + studyUID +
            "&seriesUID=" + seriesUID +
            "&objectUID=" + sopInstanceUID;
            result.push( link );
        }
    };
    
    var request = new XMLHttpRequest();
    request.open('GET', decodeURIComponent(uri), false);
    request.responseType = "xml"; 
    request.onload = onLoadRequest;
    request.onerror = onErrorRequest;
    //request.onprogress = dwv.gui.updateProgress;
    request.send(null);

    // return
    return result;
};

/**
 * Display or not an element.
 * @method displayElement
 * @static
 * @param {Number} id The id of the element to toggle its display.
 * @param {Boolean} bool True to display the element.
 */
dwv.html.displayElement = function(id,bool)
{
    var element = document.getElementById(id);
    if( element ) {
        element.style.display = bool ? "" : "none";
    }
};

/**
 * Toggle the display of an element.
 * @method toggleDisplay
 * @static
 * @param {Number} id The id of the element to toggle its display.
 */
dwv.html.toggleDisplay = function(id)
{
    if( document.getElementById(id) )
    {
        var div = document.getElementById(id);
        if( div.style.display === "none" ) {
            div.style.display = '';
        }
        else {
            div.style.display = "none";
        }
    }
};
;/** 
 * HTML module.
 * @module html
 */
var dwv = dwv || {};
dwv.html = dwv.html || {};

/**
 * Window layer.
 * @class Layer
 * @namespace dwv.html
 * @constructor
 * @param {String} name The name of the layer.
 */
dwv.html.Layer = function(name)
{
    /**
     * The associated HTMLCanvasElement.
     * @property canvas
     * @private
     * @type Object
     */
    var canvas = null;
    /**
     * A cache of the initial canvas.
     * @property cacheCanvas
     * @private
     * @type Object
     */
    var cacheCanvas = null;
    /**
     * The associated CanvasRenderingContext2D.
     * @property context
     * @private
     * @type Object
     */
    var context = null;
    
    /**
     * Get the layer name.
     * @method getName
     * @return {String} The layer name.
     */
    this.getName = function() { return name; };
    /**
     * Get the layer canvas.
     * @method getCanvas
     * @return {Object} The layer canvas.
     */
    this.getCanvas = function() { return canvas; };
    /**
     * Get the layer context.
     * @method getContext
     * @return {Object} The layer context.
     */
    this.getContext = function() { return context; };
    /**
     * Get the layer offset on page.
     * @method getOffset
     * @return {Number} The layer offset on page.
     */
    this.getOffset = function() { return $('#'+name).offset(); };

    /**
     * The image data array.
     * @property imageData
     * @private
     * @type Array
     */
    var imageData = null;
    
    /**
     * The layer origin.
     * @property origin
     * @private
     * @type {Object}
     */
    var origin = {'x': 0, 'y': 0};
    /**
     * Get the layer origin.
     * @method getOrigin
     * @returns {Object} The layer origin as {'x','y'}.
     */
    this.getOrigin = function () {
        return origin;
    };
    /**
     * The image zoom.
     * @property zoom
     * @private
     * @type {Object}
     */
    var zoom = {'x': 1, 'y': 1};
    /**
     * Get the layer zoom.
     * @method getZoom
     * @returns {Object} The layer zoom as {'x','y'}.
     */
    this.getZoom = function () {
        return zoom;
    };
    
    /**
     * Set the canvas width.
     * @method setWidth
     * @param {Number} width The new width.
     */
    this.setWidth = function ( width ) {
        canvas.width = width;
    };
    /**
     * Set the canvas height.
     * @method setHeight
     * @param {Number} height The new height.
     */
    this.setHeight = function ( height ) {
        canvas.height = height;
    };
    
    /**
     * Set the layer zoom.
     * @method setZoom
     * @param {Number} newZoomX The zoom in the X direction.
     * @param {Number} newZoomY The zoom in the Y direction.
     * @param {Number} centerX The zoom center in the X direction.
     * @param {Number} centerY The zoom center in the Y direction.
     */
    this.zoom = function(newZoomX,newZoomY,centerX,centerY)
    {
        // The zoom is the ratio between the differences from the center
        // to the origins:
        // centerX - originX = ( centerX - originX0 ) * zoomX
        // (center in ~world coordinate system)  
        //originX = (centerX / zoomX) + originX - (centerX / newZoomX);
        //originY = (centerY / zoomY) + originY - (centerY / newZoomY);
        
        // center in image coordinate system        
        origin.x = centerX - (centerX - origin.x) * (newZoomX / zoom.x);
        origin.y = centerY - (centerY - origin.y) * (newZoomY / zoom.y);

        // save zoom
        zoom.x = newZoomX;
        zoom.y = newZoomY;
    };
    
    /**
     * Set the layer translation.
     * Translation is according to the last one.
     * @method setTranslate
     * @param {Number} tx The translation in the X direction.
     * @param {Number} ty The translation in the Y direction.
     */
    this.translate = function(tx,ty)
    {
        // new origin
        origin.x += tx * zoom.x;
        origin.y += ty * zoom.y;
    };
    
    /**
     * Set the image data array.
     * @method setImageData
     * @param {Array} data The data array.
     */
    this.setImageData = function(data)
    {
        imageData = data;
        // update the cached canvas
        cacheCanvas.getContext("2d").putImageData(imageData, 0, 0);
    };
    
    /**
     * Reset the layout.
     * @method resetLayout
     */ 
    this.resetLayout = function(izoom)
    {
        origin.x = 0;
        origin.y = 0;
        zoom.x = izoom;
        zoom.y = izoom;
    };
    
    /**
     * Transform a display position to an index.
     * @method displayToIndex
     */ 
    this.displayToIndex = function ( point2D ) {
        return {'x': (point2D.x - origin.x) / zoom.x,
            'y': (point2D.y - origin.y) / zoom.y };
    };
    
    /**
     * Draw the content (imageData) of the layer.
     * The imageData variable needs to be set
     * @method draw
     */
    this.draw = function ()
    {
        // clear the context: reset the transform first
        // store the current transformation matrix
        context.save();
        // use the identity matrix while clearing the canvas
        context.setTransform( 1, 0, 0, 1, 0, 0 );
        context.clearRect( 0, 0, canvas.width, canvas.height );
        // restore the transform
        context.restore();
        
        // draw the cached canvas on the context
        // transform takes as input a, b, c, d, e, f to create
        // the transform matrix (column-major order):
        // [ a c e ]
        // [ b d f ]
        // [ 0 0 1 ]
        context.setTransform( zoom.x, 0, 0, zoom.y, origin.x, origin.y );
        context.drawImage( cacheCanvas, 0, 0 );
    };
    
    /**
     * Initialise the layer: set the canvas and context
     * @method initialise
     * @input {Number} inputWidth The width of the canvas.
     * @input {Number} inputHeight The height of the canvas.
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
        // cached canvas
        cacheCanvas = document.createElement("canvas");
        cacheCanvas.width = inputWidth;
        cacheCanvas.height = inputHeight;
    };
    
    /**
     * Fill the full context with the current style.
     * @method fillContext
     */
    this.fillContext = function()
    {
        context.fillRect( 0, 0, canvas.width, canvas.height );
    };
    
    /**
     * Clear the context and reset the image data.
     * @method clear
     */
    this.clear = function()
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        this.resetLayout();
    };

    /**
     * Merge two layers.
     * @method merge
     * @input {Layer} layerToMerge The layer to merge. It will also be emptied.
     */
    this.merge = function(layerToMerge)
    {
        // basic resampling of the merge data to put it at zoom 1:1
        var mergeImageData = layerToMerge.getContext().getImageData(
            0, 0, canvas.width, canvas.height);
        var offMerge = 0;
        var offMergeJ = 0;
        var offThis = 0;
        var offThisJ = 0;
        var alpha = 0;
        for( var j=0; j < canvas.height; ++j ) {
            offMergeJ = parseInt( (origin.y + j * zoom.y), 10 ) * canvas.width;
            offThisJ = j * canvas.width;
            for( var i=0; i < canvas.width; ++i ) {
                // 4 component data: RGB + alpha
                offMerge = 4 * ( parseInt( (origin.x + i * zoom.x), 10 ) + offMergeJ );
                offThis = 4 * ( i + offThisJ );
                // merge non transparent 
                alpha = mergeImageData.data[offMerge+3];
                if( alpha !== 0 ) {
                    imageData.data[offThis] = mergeImageData.data[offMerge];
                    imageData.data[offThis+1] = mergeImageData.data[offMerge+1];
                    imageData.data[offThis+2] = mergeImageData.data[offMerge+2];
                    imageData.data[offThis+3] = alpha;
                }
            }
        }
        // empty and reset merged layer
        layerToMerge.clear();
        // draw the layer
        this.draw();
    };
    
    /**
     * Set the line color for the layer.
     * @method setLineColor
     * @input {String} color The line color.
     */
    this.setLineColor = function(color)
    {
        context.fillStyle = color;
        context.strokeStyle = color;
    };
    
    /**
     * Display the layer.
     * @method setStyleDisplay
     * @input {Boolean} val Whether to display the layer or not.
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
    
    /**
     * Check if the layer is visible.
     * @method isVisible
     * @return {Boolean} True if the layer is visible.
     */
    this.isVisible = function()
    {
        if( canvas.style.display === "none" ) {
            return false;
        }
        else {
            return true;
        }
    };
    
    /**
     * Align on another layer.
     * @method align
     * @param {Layer} rhs The layer to align on.
     */
    this.align = function(rhs)
    {
        canvas.style.top = rhs.getCanvas().offsetTop;
        canvas.style.left = rhs.getCanvas().offsetLeft;
    };
}; // Layer class

;/** 
 * GUI module.
 * @module gui
 */
var dwv = dwv || {};
/**
 * Namespace for GUI functions.
 * @class gui
 * @namespace dwv
 * @static
 */
dwv.gui = dwv.gui || {};
dwv.gui.base = dwv.gui.base || {};

/**
 * Append the loadbox HTML to the page.
 * @method appendLoadboxHtml
 * @static
 */
dwv.gui.base.appendLoadboxHtml = function()
{
    // loader select
    var loaderSelector = dwv.html.createHtmlSelect("loaderSelect",dwv.io.loaders);
    loaderSelector.onchange = dwv.gui.onChangeLoader;
    
    // node
    var node = document.getElementById("loaderlist");
    // clear it
    while(node.hasChildNodes()) {
        node.removeChild(node.firstChild);
    }
    // append
    node.appendChild(loaderSelector);
    // trigger create event (mobile)
    $("#loaderlist").trigger("create");
};

/**
 * Append the file load HTML to the page.
 * @method appendFileLoadHtml
 * @static
 */
dwv.gui.base.appendFileLoadHtml = function()
{
    // input
    var fileLoadInput = document.createElement("input");
    fileLoadInput.onchange = dwv.gui.onChangeFiles;
    fileLoadInput.type = "file";
    fileLoadInput.multiple = true;
    fileLoadInput.id = "imagefiles";
    fileLoadInput.setAttribute("data-clear-btn","true");
    fileLoadInput.setAttribute("data-mini","true");

    // associated div
    var fileLoadDiv = document.createElement("div");
    fileLoadDiv.id = "imagefilesdiv";
    fileLoadDiv.style.display = "none";
    fileLoadDiv.appendChild(fileLoadInput);
    
    // node
    var node = document.getElementById("loaderlist");
    // append
    node.appendChild(fileLoadDiv);
    // trigger create event (mobile)
    $("#loaderlist").trigger("create");
};

/**
 * Display the file load HTML.
 * @method clearUrlLoadHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.base.displayFileLoadHtml = function(bool)
{
    // file div element
    var filediv = document.getElementById("imagefilesdiv");
    filediv.style.display = bool ? "" : "none";
};

/**
 * Append the url load HTML to the page.
 * @method appendUrlLoadHtml
 * @static
 */
dwv.gui.base.appendUrlLoadHtml = function()
{
    // input
    var urlLoadInput = document.createElement("input");
    urlLoadInput.onchange = dwv.gui.onChangeURL;
    urlLoadInput.type = "url";
    urlLoadInput.id = "imageurl";
    urlLoadInput.setAttribute("data-clear-btn","true");
    urlLoadInput.setAttribute("data-mini","true");

    // associated div
    var urlLoadDiv = document.createElement("div");
    urlLoadDiv.id = "imageurldiv";
    urlLoadDiv.style.display = "none";
    urlLoadDiv.appendChild(urlLoadInput);

    // node
    var node = document.getElementById("loaderlist");
    // append
    node.appendChild(urlLoadDiv);
    // trigger create event (mobile)
    $("#loaderlist").trigger("create");
};

/**
 * Display the url load HTML.
 * @method clearUrlLoadHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.base.displayUrlLoadHtml = function(bool)
{
    // url div element
    var urldiv = document.getElementById("imageurldiv");
    urldiv.style.display = bool ? "" : "none";
};
;/** 
 * HTML module.
 * @module html
 */
var dwv = dwv || {};
dwv.html = dwv.html || {};

/**
 * Style class.
 * @class Style
 * @namespace dwv.html
 * @constructor
 */
dwv.html.Style = function()
{
    /**
     * Font size.
     * @property fontSize
     * @private
     * @type Number
     */
    var fontSize = 12;
    /**
     * Font definition string.
     * @property fontStr
     * @private
     * @type String
     */
    var fontStr = "normal "+this.fontSize+"px sans-serif";
    /**
     * Line height.
     * @property lineHeight
     * @private
     * @type Number
     */
    var lineHeight = this.fontSize + this.fontSize/5;
    /**
     * Text color.
     * @property textColor
     * @private
     * @type String
     */
    var textColor = "#fff";
    /**
     * Line color.
     * @property lineColor
     * @private
     * @type String
     */
    var lineColor = 0;
    
    /**
     * Get the font size.
     * @method getFontSize
     * @return {Number} The font size.
     */
    dwv.html.Style.prototype.getFontSize = function() { return fontSize; };

    /**
     * Get the font definition string.
     * @method getFontStr
     * @return {String} The font definition string.
     */
    dwv.html.Style.prototype.getFontStr = function() { return fontStr; };

    /**
     * Get the line height.
     * @method getLineHeight
     * @return {Number} The line height.
     */
    dwv.html.Style.prototype.getLineHeight = function() { return lineHeight; };

    /**
     * Get the text color.
     * @method getTextColor
     * @return {String} The text color.
     */
    dwv.html.Style.prototype.getTextColor = function() { return textColor; };

    /**
     * Get the line color.
     * @method getLineColor
     * @return {String} The line color.
     */
    dwv.html.Style.prototype.getLineColor = function() { return lineColor; };

    /**
     * Set the line color.
     * @method setLineColor
     * @param {String} color The line color.
     */
    dwv.html.Style.prototype.setLineColor = function(color) { lineColor = color; };
};
;/** 
 * GUI module.
 * @module gui
 */
var dwv = dwv || {};
/**
 * Namespace for GUI functions.
 * @class gui
 * @namespace dwv
 * @static
 */
dwv.gui = dwv.gui || {};
dwv.gui.base = dwv.gui.base || {};

/**
 * Append the toolbox HTML to the page.
 * @method appendToolboxHtml
 * @static
 */
dwv.gui.base.appendToolboxHtml = function()
{
    // tool select
    var toolSelector = dwv.html.createHtmlSelect("toolSelect",dwv.tool.tools);
    toolSelector.onchange = dwv.gui.onChangeTool;
    
    // tool list element
    var toolLi = document.createElement("li");
    toolLi.id = "toolLi";
    toolLi.style.display = "none";
    toolLi.appendChild(toolSelector);
    toolLi.setAttribute("class","ui-block-a");

    // node
    var node = document.getElementById("toolList");
    // clear it
    while(node.hasChildNodes()) {
        node.removeChild(node.firstChild);
    }
    // append
    node.appendChild(toolLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the toolbox HTML.
 * @method displayToolboxHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.base.displayToolboxHtml = function(bool)
{
    // tool list element
    dwv.html.displayElement("toolLi", bool);
};

/**
 * Initialise the toolbox HTML.
 * @method initToolboxHtml
 * @static
 */
dwv.gui.base.initToolboxHtml = function()
{
    // tool select: reset selected option
    var toolSelector = document.getElementById("toolSelect");
    toolSelector.selectedIndex = 0;
    dwv.gui.refreshSelect("#toolSelect");
};

/**
 * Append the window/level HTML to the page.
 * @method appendWindowLevelHtml
 * @static
 */
dwv.gui.base.appendWindowLevelHtml = function()
{
    // preset select
    var wlSelector = dwv.html.createHtmlSelect("presetSelect",dwv.tool.presets);
    wlSelector.onchange = dwv.gui.onChangeWindowLevelPreset;
    // colour map select
    var cmSelector = dwv.html.createHtmlSelect("colourMapSelect",dwv.tool.colourMaps);
    cmSelector.onchange = dwv.gui.onChangeColourMap;

    // preset list element
    var wlLi = document.createElement("li");
    wlLi.id = "wlLi";
    wlLi.style.display = "none";
    wlLi.appendChild(wlSelector);
    wlLi.setAttribute("class","ui-block-b");
    // color map list element
    var cmLi = document.createElement("li");
    cmLi.id = "cmLi";
    cmLi.style.display = "none";
    cmLi.appendChild(cmSelector);
    cmLi.setAttribute("class","ui-block-c");

    // node
    var node = document.getElementById("toolList");
    // apend preset
    node.appendChild(wlLi);
    // apend color map if monochrome image
    node.appendChild(cmLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the window/level HTML.
 * @method displayWindowLevelHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.base.displayWindowLevelHtml = function(bool)
{
    // presets list element
    dwv.html.displayElement("wlLi", bool);
    // color map list element
    dwv.html.displayElement("cmLi", bool);
};

/**
 * Initialise the window/level HTML.
 * @method initWindowLevelHtml
 * @static
 */
dwv.gui.base.initWindowLevelHtml = function()
{
    // create new preset select
    var wlSelector = dwv.html.createHtmlSelect("presetSelect",dwv.tool.presets);
    wlSelector.onchange = dwv.gui.onChangeWindowLevelPreset;
    wlSelector.title = "Select w/l preset.";
    
    // copy html list
    var wlLi = document.getElementById("wlLi");
    // clear node
    dwv.html.cleanNode(wlLi);
    // add children
    wlLi.appendChild(wlSelector);
    $("#toolList").trigger("create");
    
    // colour map select
    var cmSelector = document.getElementById("colourMapSelect");
    cmSelector.selectedIndex = 0;
    // special monochrome1 case
    if( app.getImage().getPhotometricInterpretation() === "MONOCHROME1" )
    {
        cmSelector.selectedIndex = 1;
    }
    dwv.gui.refreshSelect("#colourMapSelect");
};

/**
 * Append the draw HTML to the page.
 * @method appendDrawHtml
 * @static
 */
dwv.gui.base.appendDrawHtml = function()
{
    // shape select
    var shapeSelector = dwv.html.createHtmlSelect("shapeSelect",dwv.tool.shapes);
    shapeSelector.onchange = dwv.gui.onChangeShape;
    // colour select
    var colourSelector = dwv.html.createHtmlSelect("colourSelect",dwv.tool.colors);
    colourSelector.onchange = dwv.gui.onChangeLineColour;

    // shape list element
    var shapeLi = document.createElement("li");
    shapeLi.id = "shapeLi";
    shapeLi.style.display = "none";
    shapeLi.appendChild(shapeSelector);
    shapeLi.setAttribute("class","ui-block-c");
    // colour list element
    var colourLi = document.createElement("li");
    colourLi.id = "colourLi";
    colourLi.style.display = "none";
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

/**
 * Display the draw HTML.
 * @method displayDrawHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.base.displayDrawHtml = function(bool)
{
    // color list element
    dwv.html.displayElement("colourLi", bool);
    // shape list element
    dwv.html.displayElement("shapeLi", bool);
};

/**
 * Initialise the draw HTML.
 * @method displayDrawHtml
 * @static
 * */
dwv.gui.base.initDrawHtml = function()
{
    // shape select: reset selected option
    var shapeSelector = document.getElementById("shapeSelect");
    shapeSelector.selectedIndex = 0;
    dwv.gui.refreshSelect("#shapeSelect");
    // color select: reset selected option
    var colourSelector = document.getElementById("colourSelect");
    colourSelector.selectedIndex = 0;
    dwv.gui.refreshSelect("#colourSelect");
};

/**
 * Append the color chooser HTML to the page.
 * @method appendLivewireHtml
 * @static
 */
dwv.gui.base.appendLivewireHtml = function()
{
    // colour select
    var colourSelector = dwv.html.createHtmlSelect("lwColourSelect",dwv.tool.colors);
    colourSelector.onchange = dwv.gui.onChangeLineColour;
    
    // colour list element
    var colourLi = document.createElement("li");
    colourLi.id = "lwColourLi";
    colourLi.style.display = "none";
    colourLi.setAttribute("class","ui-block-b");
    colourLi.appendChild(colourSelector);
    
    // node
    var node = document.getElementById("toolList");
    // apend colour
    node.appendChild(colourLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the livewire HTML.
 * @method displayLivewireHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.base.displayLivewireHtml = function(bool)
{
    // colour list
    dwv.html.displayElement("lwColourLi", bool);
};

/**
 * Initialise the livewire HTML.
 * @method initLivewireHtml
 * @static
 */
dwv.gui.base.initLivewireHtml = function()
{
    var colourSelector = document.getElementById("lwColourSelect");
    colourSelector.selectedIndex = 0;
    dwv.gui.refreshSelect("#lwColourSelect");
};

/**
 * Append the ZoomAndPan HTML to the page.
 * @method appendZoomAndPanHtml
 * @static
 */
dwv.gui.base.appendZoomAndPanHtml = function()
{
    // reset button
    var button = document.createElement("button");
    button.id = "zoomResetButton";
    button.name = "zoomResetButton";
    button.onclick = dwv.gui.onZoomReset;
    var text = document.createTextNode("Reset");
    button.appendChild(text);
    
    // list element
    var liElement = document.createElement("li");
    liElement.id = "zoomLi";
    liElement.style.display = "none";
    liElement.setAttribute("class","ui-block-c");
    liElement.appendChild(button);
    
    // node
    var node = document.getElementById("toolList");
    // append element
    node.appendChild(liElement);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the ZoomAndPan HTML.
 * @method displayZoomAndPanHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.base.displayZoomAndPanHtml = function(bool)
{
    // display list element
    dwv.html.displayElement("zoomLi", bool);
};

/**
 * Append the Scroll HTML to the page.
 * @method appendScrollHtml
 * @static
 */
dwv.gui.base.appendScrollHtml = function()
{
    // list element
    var liElement = document.createElement("li");
    liElement.id = "scrollLi";
    liElement.style.display = "none";
    liElement.setAttribute("class","ui-block-c");
    
    // node
    var node = document.getElementById("toolList");
    // append element
    node.appendChild(liElement);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the Scroll HTML.
 * @method displayScrollHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.base.displayScrollHtml = function(bool)
{
    // display list element
    dwv.html.displayElement("scrollLi", bool);
};
;/** 
 * GUI module.
 * @module gui
 */
var dwv = dwv || {};
/**
 * Namespace for GUI functions.
 * @class gui
 * @namespace dwv
 * @static
 */
dwv.gui = dwv.gui || {};
dwv.gui.base = dwv.gui.base || {};

/**
 * Append the undo HTML to the page.
 * @method appendUndoHtml
 * @static
 */
dwv.gui.base.appendUndoHtml = function()
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
    while(node.hasChildNodes()) {
        node.removeChild(node.firstChild);
    }
    // append
    node.appendChild(paragraph);
};

/**
 * Add a command to the undo HTML.
 * @method addCommandToUndoHtml
 * @static
 * @param {String} commandName The name of the command to add.
 */
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

/**
 * Enable the last command of the undo HTML.
 * @method enableInUndoHtml
 * @static
 * @param {Boolean} enable Flag to enable or disable the command.
 */
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
;/** 
 * Image module.
 * @module image
 */
var dwv = dwv || {};
dwv.image = dwv.image || {};
dwv.image.filter = dwv.image.filter || {};

/**
 * Threshold an image between an input minimum and maximum.
 * @class Threshold
 * @namespace dwv.image.filter
 * @constructor
 */
dwv.image.filter.Threshold = function()
{
    /**
     * Threshold minimum.
     * @property min
     * @private
     * @type Number
     */
    var min = 0;
    /**
     * Threshold maxnimum.
     * @property max
     * @private
     * @type Number
     */
    var max = 0;

    /**
     * Get the threshold minimum.
     * @method getMin
     * @return {Number} The threshold minimum.
     */
    this.getMin = function() { return min; };
    /**
     * Set the threshold minimum.
     * @method setMin
     * @param {Number} val The threshold minimum.
     */
    this.setMin = function(val) { min = val; };
    /**
     * Get the threshold maximum.
     * @method getMax
     * @return {Number} The threshold maximum.
     */
    this.getMax = function() { return max; };
    /**
     * Set the threshold maximum.
     * @method setMax
     * @param {Number} val The threshold maximum.
     */
    this.setMax = function(val) { max = val; };
    /**
     * Get the name of the filter.
     * @method getName
     * @return {String} The name of the filter.
     */
    this.getName = function() { return "Threshold"; };
};

/**
 * Transform the main image using this filter.
 * @method update
 * @return {Object} The transformed image.
 */ 
dwv.image.filter.Threshold.prototype.update = function()
{
    var imageMin = app.getImage().getDataRange().min;
    var self = this;
    var threshFunction = function(value){
        if(value<self.getMin()||value>self.getMax()) {
            return imageMin;
        }
        else {
            return value;
        }
    };
    return app.getImage().transform( threshFunction );
};

/**
 * Sharpen an image using a sharpen convolution matrix.
 * @class Sharpen
 * @namespace dwv.image.filter
 * @constructor
 */
dwv.image.filter.Sharpen = function()
{
    /**
     * Get the name of the filter.
     * @method getName
     * @return {String} The name of the filter.
     */
    this.getName = function() { return "Sharpen"; };
};

/**
 * Transform the main image using this filter.
 * @method update
 * @return {Object} The transformed image.
 */ 
dwv.image.filter.Sharpen.prototype.update = function()
{
    return app.getImage().convolute2D(
        [  0, -1,  0,
          -1,  5, -1,
           0, -1,  0 ] );
};

/**
 * Apply a Sobel filter to an image.
 * @class Sobel
 * @namespace dwv.image.filter
 * @constructor
 */
dwv.image.filter.Sobel = function()
{
    /**
     * Get the name of the filter.
     * @method getName
     * @return {String} The name of the filter.
     */
    this.getName = function() { return "Sobel"; };
};

/**
 * Transform the main image using this filter.
 * @method update
 * @return {Object} The transformed image.
 */ 
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

;/** 
 * Image module.
 * @module image
 */
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Image Size class.
 * Supports 2D and 3D images.
 * @class Size
 * @namespace dwv.image
 * @constructor
 * @param {Number} numberOfColumns The number of columns.
 * @param {Number} numberOfRows The number of rows.
 * @param {Number} numberOfSlices The number of slices.
*/
dwv.image.Size = function( numberOfColumns, numberOfRows, numberOfSlices )
{
    /**
     * Get the number of columns.
     * @method getNumberOfColumns
     * @return {Number} The number of columns.
     */ 
    this.getNumberOfColumns = function() { return numberOfColumns; };
    /**
     * Get the number of rows.
     * @method getNumberOfRows
     * @return {Number} The number of rows.
     */ 
    this.getNumberOfRows = function() { return numberOfRows; };
    /**
     * Get the number of slices.
     * @method getNumberOfSlices
     * @return {Number} The number of slices.
     */ 
    this.getNumberOfSlices = function() { return (numberOfSlices || 1.0); };
};

/**
 * Get the size of a slice.
 * @method getSliceSize
 * @return {Number} The size of a slice.
 */ 
dwv.image.Size.prototype.getSliceSize = function() {
    return this.getNumberOfColumns()*this.getNumberOfRows();
};

/**
 * Get the total size.
 * @method getTotalSize
 * @return {Number} The total size.
 */ 
dwv.image.Size.prototype.getTotalSize = function() {
    return this.getSliceSize()*this.getNumberOfSlices();
};

/**
 * Check for equality.
 * @method equals
 * @param {Size} rhs The object to compare to.
 * @return {Boolean} True if both objects are equal.
 */ 
dwv.image.Size.prototype.equals = function(rhs) {
    return rhs !== null &&
        this.getNumberOfColumns() === rhs.getNumberOfColumns() &&
        this.getNumberOfRows() === rhs.getNumberOfRows() &&
        this.getNumberOfSlices() === rhs.getNumberOfSlices();
};

/**
 * Check that coordinates are within bounds.
 * @method isInBounds
 * @param {Number} i The column coordinate.
 * @param {Number} j The row coordinate.
 * @param {Number} k The slice coordinate.
 * @return {Boolean} True if the given coordinates are within bounds.
 */ 
dwv.image.Size.prototype.isInBounds = function( i, j, k ) {
    if( i < 0 || i > this.getNumberOfColumns() - 1 ||
        j < 0 || j > this.getNumberOfRows() - 1 ||
        k < 0 || k > this.getNumberOfSlices() - 1 ) {
        return false;
    }
    return true;
};

/**
 * Image Spacing class. 
 * Supports 2D and 3D images.
 * @class Spacing
 * @namespace dwv.image
 * @constructor
 * @param {Number} columnSpacing The column spacing.
 * @param {Number} rowSpacing The row spacing.
 * @param {Number} sliceSpacing The slice spacing.
 */
dwv.image.Spacing = function( columnSpacing, rowSpacing, sliceSpacing )
{
    /**
     * Get the column spacing.
     * @method getColumnSpacing
     * @return {Number} The column spacing.
     */ 
    this.getColumnSpacing = function() { return columnSpacing; };
    /**
     * Get the row spacing.
     * @method getRowSpacing
     * @return {Number} The row spacing.
     */ 
    this.getRowSpacing = function() { return rowSpacing; };
    /**
     * Get the slice spacing.
     * @method getSliceSpacing
     * @return {Number} The slice spacing.
     */ 
    this.getSliceSpacing = function() { return (sliceSpacing || 1.0); };
};

/**
 * Check for equality.
 * @method equals
 * @param {Spacing} rhs The object to compare to.
 * @return {Boolean} True if both objects are equal.
 */ 
dwv.image.Spacing.prototype.equals = function(rhs) {
    return rhs !== null &&
        this.getColumnSpacing() === rhs.getColumnSpacing() &&
        this.getRowSpacing() === rhs.getRowSpacing() &&
        this.getSliceSpacing() === rhs.getSliceSpacing();
};

/**
 * Image class.
 * Usable once created, optional are:
 * - rescale slope and intercept (default 1:0), 
 * - photometric interpretation (default MONOCHROME2),
 * - planar configuration (default RGBRGB...).
 * @class Image
 * @namespace dwv.image
 * @constructor
 * @param {Size} size The size of the image.
 * @param {Spacing} spacing The spacing of the image.
 * @param {Array} buffer The image data.
 * @param {Array} slicePositions The slice positions.
 */
dwv.image.Image = function(size, spacing, buffer, slicePositions)
{
    /**
     * Rescale slope.
     * @property rescaleSlope
     * @private
     * @type Number
     */
    var rescaleSlope = 1;
    /**
     * Rescale intercept.
     * @property rescaleIntercept
     * @private
     * @type Number
     */
    var rescaleIntercept = 0;
    /**
     * Photometric interpretation (MONOCHROME, RGB...).
     * @property photometricInterpretation
     * @private
     * @type String
     */
    var photometricInterpretation = "MONOCHROME2";
    /**
     * Planar configuration for RGB data (0:RGBRGBRGBRGB... or 1:RRR...GGG...BBB...).
     * @property planarConfiguration
     * @private
     * @type Number
     */
    var planarConfiguration = 0;
    /**
     * Number of components.
     * @property planarConfiguration
     * @private
     * @type Number
     */
    var numberOfComponents = buffer.length / size.getTotalSize();
    /**
     * Meta information.
     * @property meta
     * @private
     * @type Object
     */
    var meta = {};
    
    /**
     * Original buffer.
     * @property originalBuffer
     * @private
     * @type Array
     */
    var originalBuffer = new Int16Array(buffer);
    
    // check slice positions.
    if( typeof(slicePositions) === 'undefined' ) {
        slicePositions = [[0,0,0]];
    }
    
    /**
     * Data range.
     * @property dataRange
     * @private
     * @type Object
     */
    var dataRange = null;
    /**
     * Histogram.
     * @property histogram
     * @private
     * @type Array
     */
    var histogram = null;
     
    /**
     * Get the size of the image.
     * @method getSize
     * @return {Size} The size of the image.
     */ 
    this.getSize = function() { return size; };
    /**
     * Get the spacing of the image.
     * @method getSpacing
     * @return {Spacing} The spacing of the image.
     */ 
    this.getSpacing = function() { return spacing; };
    /**
     * Get the data buffer of the image. TODO dangerous...
     * @method getBuffer
     * @return {Array} The data buffer of the image.
     */ 
    this.getBuffer = function() { return buffer; };
    /**
     * Get the slice positions.
     * @method getSlicePositions
     * @return {Array} The slice positions.
     */ 
    this.getSlicePositions = function() { return slicePositions; };
    
    /**
     * Get the rescale slope.
     * @method getRescaleSlope
     * @return {Number} The rescale slope.
     */ 
    this.getRescaleSlope = function() { return rescaleSlope; };
    /**
     * Set the rescale slope.
     * @method setRescaleSlope
     * @param {Number} rs The rescale slope.
     */ 
    this.setRescaleSlope = function(rs) { rescaleSlope = rs; };
    /**
     * Get the rescale intercept.
     * @method getRescaleIntercept
     * @return {Number} The rescale intercept.
     */ 
    this.getRescaleIntercept = function() { return rescaleIntercept; };
    /**
     * Set the rescale intercept.
     * @method setRescaleIntercept
     * @param {Number} ri The rescale intercept.
     */ 
    this.setRescaleIntercept = function(ri) { rescaleIntercept = ri; };
    /**
     * Get the photometricInterpretation of the image.
     * @method getPhotometricInterpretation
     * @return {String} The photometricInterpretation of the image.
     */ 
    this.getPhotometricInterpretation = function() { return photometricInterpretation; };
    /**
     * Set the photometricInterpretation of the image.
     * @method setPhotometricInterpretation
     * @pqrqm {String} interp The photometricInterpretation of the image.
     */ 
    this.setPhotometricInterpretation = function(interp) { photometricInterpretation = interp; };
    /**
     * Get the planarConfiguration of the image.
     * @method getPlanarConfiguration
     * @return {Number} The planarConfiguration of the image.
     */ 
    this.getPlanarConfiguration = function() { return planarConfiguration; };
    /**
     * Set the planarConfiguration of the image.
     * @method setPlanarConfiguration
     * @param {Number} config The planarConfiguration of the image.
     */ 
    this.setPlanarConfiguration = function(config) { planarConfiguration = config; };
    /**
     * Get the numberOfComponents of the image.
     * @method getNumberOfComponents
     * @return {Number} The numberOfComponents of the image.
     */ 
    this.getNumberOfComponents = function() { return numberOfComponents; };

    /**
     * Get the meta information of the image.
     * @method getMeta
     * @return {Object} The meta information of the image.
     */ 
    this.getMeta = function() { return meta; };
    /**
     * Set the meta information of the image.
     * @method setMeta
     * @param {Object} rhs The meta information of the image.
     */ 
    this.setMeta = function(rhs) { meta = rhs; };

    /**
     * Get value at offset. Warning: No size check...
     * @method getValueAtOffset
     * @param {Number} offset The desired offset.
     * @return {Number} The value at offset.
     */ 
    this.getValueAtOffset = function(offset) {
        return buffer[offset];
    };
    
    /**
     * Clone the image.
     * @method clone
     * @return {Image} A clone of this image.
     */ 
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
    
    /**
     * Append a slice to the image.
     * @method appendSlice
     * @param {Image} The slice to append.
     */ 
    this.appendSlice = function(rhs)
    {
        // check input
        if( rhs === null ) {
            throw new Error("Cannot append null slice");
        }
        if( rhs.getSize().getNumberOfSlices() !== 1 ) {
            throw new Error("Cannot append more than one slice");
        }
        if( size.getNumberOfColumns() !== rhs.getSize().getNumberOfColumns() ) {
            throw new Error("Cannot append a slice with different number of columns");
        }
        if( size.getNumberOfRows() !== rhs.getSize().getNumberOfRows() ) {
            throw new Error("Cannot append a slice with different number of rows");
        }
        if( photometricInterpretation !== rhs.getPhotometricInterpretation() ) {
            throw new Error("Cannot append a slice with different photometric interpretation");
        }
        // all meta should be equal
        for( var key in meta ) {
            if( meta[key] !== rhs.getMeta()[key] ) {
                throw new Error("Cannot append a slice with different "+key);
            }
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
        if( photometricInterpretation === "RGB" ) {
            mul = 3;
        }
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
    
    /**
     * Get the data range.
     * @method getDataRange
     * @return {Object} The data range.
     */ 
    this.getDataRange = function() { 
        if( !dataRange ) {
            dataRange = this.calculateDataRange();
        }
        return dataRange;
    };

    /**
     * Get the histogram.
     * @method getHistogram
     * @return {Array} The histogram.
     */ 
    this.getHistogram = function() { 
        if( !histogram ) {
            histogram = this.calculateHistogram();
        }
        return histogram;
    };
};

/**
 * Get the value of the image at a specific coordinate.
 * @method getValue
 * @param {Number} i The X index.
 * @param {Number} j The Y index.
 * @param {Number} k The Z index.
 * @return {Number} The value at the desired position.
 * Warning: No size check...
 */
dwv.image.Image.prototype.getValue = function( i, j, k )
{
    return this.getValueAtOffset( i +
        ( j * this.getSize().getNumberOfColumns() ) +
        ( k * this.getSize().getSliceSize()) );
};

/**
 * Get the rescaled value of the image at a specific offset.
 * @method getRescaledValueAtOffset
 * @param {Number} offset The offset in the buffer. 
 * @return {Number} The rescaled value at the desired offset.
 * Warning: No size check...
 */
dwv.image.Image.prototype.getRescaledValueAtOffset = function( offset )
{
    return (this.getValueAtOffset(offset)*this.getRescaleSlope())+this.getRescaleIntercept();
};

/**
 * Get the rescaled value of the image at a specific coordinate.
 * @method getRescaledValue
 * @param {Number} i The X index.
 * @param {Number} j The Y index.
 * @param {Number} k The Z index.
 * @return {Number} The rescaled value at the desired position.
 * Warning: No size check...
 */
dwv.image.Image.prototype.getRescaledValue = function( i, j, k )
{
    return (this.getValue(i,j,k)*this.getRescaleSlope())+this.getRescaleIntercept();
};

/**
 * Calculate the raw image data range.
 * @method calculateDataRange
 * @return {Object} The range {min, max}.
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
 * @method getRescaledDataRange
 * @return {Object} The rescaled data range {min, max}.
 */
dwv.image.Image.prototype.getRescaledDataRange = function()
{
    var rawRange = this.getDataRange();
    return { "min": rawRange.min*this.getRescaleSlope()+this.getRescaleIntercept(),
        "max": rawRange.max*this.getRescaleSlope()+this.getRescaleIntercept()};
};

/**
 * Calculate the histogram of the image.
 * @method calculateHistogram
 * @return {Array} An array representing the histogram.
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
 * @method convolute2D
 * @param {Array} weights The weights of the 2D kernel as a 3x3 matrix.
 * @return {Image} The convoluted image.
 * Note: Uses the raw buffer values.
 */
dwv.image.Image.prototype.convolute2D = function(weights)
{
    if(weights.length !== 9) {
        throw new Error("The convolution matrix does not have a length of 9; it has "+weights.length);
    }

    var newImage = this.clone();
    var newBuffer = newImage.getBuffer();

    var ncols = this.getSize().getNumberOfColumns();
    var nrows = this.getSize().getNumberOfRows();
    var nslices = this.getSize().getNumberOfSlices();
    var ncomp = this.getNumberOfComponents();
    
    // adapt to number of component and planar configuration
    var factor = 1;
    var componentOffset = 1;
    if( ncomp === 3 )
    {
        if( this.getPlanarConfiguration() === 0 )
        {
            factor = 3;
        }
        else
        {
            componentOffset = this.getSize().getTotalSize();
        }
    }
    
    // allow special indent for matrices
    /*jshint indent:false */

    // default weight offset matrix
    var wOff = [];
    wOff[0] = (-ncols-1) * factor; wOff[1] = (-ncols) * factor; wOff[2] = (-ncols+1) * factor;
    wOff[3] = -factor; wOff[4] = 0; wOff[5] = 1 * factor;
    wOff[6] = (ncols-1) * factor; wOff[7] = (ncols) * factor; wOff[8] = (ncols+1) * factor;
    
    // border weight offset matrices
    // borders are extended (see http://en.wikipedia.org/wiki/Kernel_%28image_processing%29)
    
    // i=0, j=0
    var wOff00 = [];
    wOff00[0] = wOff[4]; wOff00[1] = wOff[4]; wOff00[2] = wOff[5];
    wOff00[3] = wOff[4]; wOff00[4] = wOff[4]; wOff00[5] = wOff[5];
    wOff00[6] = wOff[7]; wOff00[7] = wOff[7]; wOff00[8] = wOff[8];
    // i=0, j=*
    var wOff0x = [];
    wOff0x[0] = wOff[1]; wOff0x[1] = wOff[1]; wOff0x[2] = wOff[2];
    wOff0x[3] = wOff[4]; wOff0x[4] = wOff[4]; wOff0x[5] = wOff[5];
    wOff0x[6] = wOff[7]; wOff0x[7] = wOff[7]; wOff0x[8] = wOff[8];
    // i=0, j=nrows
    var wOff0n = [];
    wOff0n[0] = wOff[1]; wOff0n[1] = wOff[1]; wOff0n[2] = wOff[2];
    wOff0n[3] = wOff[4]; wOff0n[4] = wOff[4]; wOff0n[5] = wOff[5];
    wOff0n[6] = wOff[4]; wOff0n[7] = wOff[4]; wOff0n[8] = wOff[5];
    
    // i=*, j=0
    var wOffx0 = [];
    wOffx0[0] = wOff[3]; wOffx0[1] = wOff[4]; wOffx0[2] = wOff[5];
    wOffx0[3] = wOff[3]; wOffx0[4] = wOff[4]; wOffx0[5] = wOff[5];
    wOffx0[6] = wOff[6]; wOffx0[7] = wOff[7]; wOffx0[8] = wOff[8];
    // i=*, j=* -> wOff
    // i=*, j=nrows
    var wOffxn = [];
    wOffxn[0] = wOff[0]; wOffxn[1] = wOff[1]; wOffxn[2] = wOff[2];
    wOffxn[3] = wOff[3]; wOffxn[4] = wOff[4]; wOffxn[5] = wOff[5];
    wOffxn[6] = wOff[3]; wOffxn[7] = wOff[4]; wOffxn[8] = wOff[5];
    
    // i=ncols, j=0
    var wOffn0 = [];
    wOffn0[0] = wOff[3]; wOffn0[1] = wOff[4]; wOffn0[2] = wOff[4];
    wOffn0[3] = wOff[3]; wOffn0[4] = wOff[4]; wOffn0[5] = wOff[4];
    wOffn0[6] = wOff[6]; wOffn0[7] = wOff[7]; wOffn0[8] = wOff[7];
    // i=ncols, j=*
    var wOffnx = [];
    wOffnx[0] = wOff[0]; wOffnx[1] = wOff[1]; wOffnx[2] = wOff[1];
    wOffnx[3] = wOff[3]; wOffnx[4] = wOff[4]; wOffnx[5] = wOff[4];
    wOffnx[6] = wOff[6]; wOffnx[7] = wOff[7]; wOffnx[8] = wOff[7];
    // i=ncols, j=nrows
    var wOffnn = [];
    wOffnn[0] = wOff[0]; wOffnn[1] = wOff[1]; wOffnn[2] = wOff[1];
    wOffnn[3] = wOff[3]; wOffnn[4] = wOff[4]; wOffnn[5] = wOff[4];
    wOffnn[6] = wOff[3]; wOffnn[7] = wOff[4]; wOffnn[8] = wOff[4];
    
    // restore indent for rest of method
    /*jshint indent:4 */

    // loop vars
    var pixelOffset = 0;
    var newValue = 0;
    var wOffFinal = [];
    // go through the destination image pixels
    for (var c=0; c<ncomp; c++) {
        // special component offset
        pixelOffset = c * componentOffset;
        for (var k=0; k<nslices; k++) {
            for (var j=0; j<nrows; j++) {
                for (var i=0; i<ncols; i++) {
                    wOffFinal = wOff;
                    // special border cases
                    if( i === 0 && j === 0 ) {
                        wOffFinal = wOff00;
                    }
                    else if( i === 0 && j === nrows ) {
                        wOffFinal = wOff0n;
                    }
                    else if( i === ncols && j === 0 ) {
                        wOffFinal = wOffn0;
                    }
                    else if( i === ncols && j === nrows ) {
                        wOffFinal = wOffnn;
                    }
                    else if( i === 0 && j !== nrows && j !== 0 ) {
                        wOffFinal = wOff0x;
                    }
                    else if( i === ncols && j !== nrows && j !== 0 ) {
                        wOffFinal = wOffnx;
                    }
                    else if( i !== 0 && i !== ncols && j === 0 ) {
                        wOffFinal = wOffx0;
                    }
                    else if( i !== 0 && i !== ncols && j === nrows ) {
                        wOffFinal = wOffxn;
                    }
                        
                    // calculate the weighed sum of the source image pixels that
                    // fall under the convolution matrix
                    newValue = 0;
                    for( var wi=0; wi<9; ++wi )
                    {
                        newValue += this.getValueAtOffset(pixelOffset + wOffFinal[wi]) * weights[wi];
                    }
                    newBuffer[pixelOffset] = newValue;
                    // increment pixel offset
                    pixelOffset += factor;
                }
            }
        }
    }
    return newImage;
};

/**
 * Transform an image using a specific operator.
 * @method transform
 * @param {Function} operator The operator to use when transforming.
 * @return {Image} The transformed image.
 * Note: Uses the raw buffer values.
 */
dwv.image.Image.prototype.transform = function(operator)
{
    var newImage = this.clone();
    var newBuffer = newImage.getBuffer();
    for( var i=0; i < newBuffer.length; ++i )
    {   
        newBuffer[i] = operator( newImage.getValueAtOffset(i) );
    }
    return newImage;
};

/**
 * Compose this image with another one and using a specific operator.
 * @method compose
 * @param {Image} rhs The image to compose with.
 * @param {Function} operator The operator to use when composing.
 * @return {Image} The composed image.
 * Note: Uses the raw buffer values.
 */
dwv.image.Image.prototype.compose = function(rhs, operator)
{
    var newImage = this.clone();
    var newBuffer = newImage.getBuffer();
    for( var i=0; i < newBuffer.length; ++i )
    {   
        // using the operator on the local buffer, i.e. the latest (not original) data
        newBuffer[i] = Math.floor( operator( this.getValueAtOffset(i), rhs.getValueAtOffset(i) ) );
    }
    return newImage;
};

;/** 
 * Image module.
 * @module image
 */
var dwv = dwv || {};
dwv.image = dwv.image || {};
dwv.image.lut = dwv.image.lut || {};

/**
 * Rescale LUT class.
 * @class Rescale
 * @namespace dwv.image.lut
 * @constructor
 * @param {Number} slope_ The rescale slope.
 * @param {Number} intercept_ The rescale intercept.
 */
dwv.image.lut.Rescale = function(slope_,intercept_)
{
    /**
     * The internal array.
     * @property rescaleLut_
     * @private
     * @type Array
     */
    var rescaleLut_ = null;
    
    // Check the rescale slope.
    if(typeof(slope_) === 'undefined') {
        slope_ = 1;
    }
    // Check the rescale intercept.
    if(typeof(intercept_) === 'undefined') {
        intercept_ = 0;
    }
    
    /**
     * Get the rescale slope.
     * @method getSlope
     * @return {Number} The rescale slope.
     */ 
    this.getSlope = function() { return slope_; };
    /**
     * Get the rescale intercept.
     * @method getIntercept
     * @return {Number} The rescale intercept.
     */ 
    this.getIntercept = function() { return intercept_; };
    
    /**
     * Initialise the LUT.
     * @method initialise
     * @param {Number} bitsStored The number of bits used to store the data.
     */ 
    // Initialise the LUT.
    this.initialise = function(bitsStored)
    {
        var size = Math.pow(2, bitsStored);
        rescaleLut_ = new Float32Array(size);
        for(var i=0; i<size; ++i) {
            rescaleLut_[i] = i * slope_ + intercept_;
        }
    };
    
    /**
     * Get the length of the LUT array.
     * @method getLength
     * @return {Number} The length of the LUT array.
     */ 
    this.getLength = function() { return rescaleLut_.length; };
    
    /**
     * Get the value of the LUT at the given offset.
     * @method getValue
     * @return {Number} The value of the LUT at the given offset.
     */ 
    this.getValue = function(offset) { return rescaleLut_[offset]; };
};

/**
 * Window LUT class.
 * @class Window
 * @namespace dwv.image.lut
 * @constructor
 * @param {Number} rescaleLut_ The associated rescale LUT.
 * @param {Boolean} isSigned_ Flag to know if the data is signed.
 */
dwv.image.lut.Window = function(rescaleLut_, isSigned_)
{
    /**
     * The internal array: Uint8ClampedArray clamps between 0 and 255.
     * (not supported on travis yet... using basic array, be sure not to overflow!)
     * @property rescaleLut_
     * @private
     * @type Array
     */
    var windowLut_ = null;
    
    // check Uint8ClampedArray support
    if( !dwv.browser.hasClampedArray() ) {
        windowLut_ = new Uint8Array(rescaleLut_.getLength());
    }
    else {
        windowLut_ = new Uint8ClampedArray(rescaleLut_.getLength());
    }
    
    /**
     * The window center.
     * @property center_
     * @private
     * @type Number
     */
    var center_ = null;
    /**
     * The window width.
     * @property width_
     * @private
     * @type Number
     */
    var width_ = null;
    
    /**
     * Get the window center.
     * @method getCenter
     * @return {Number} The window center.
     */ 
    this.getCenter = function() { return center_; };
    /**
     * Get the window width.
     * @method getWidth
     * @return {Number} The window width.
     */ 
    this.getWidth = function() { return width_; };
    /**
     * Get the signed flag.
     * @method isSigned
     * @return {Boolean} The signed flag.
     */ 
    this.isSigned = function() { return isSigned_; };
    
    /**
     * Set the window center and width.
     * @method setCenterAndWidth
     * @param {Number} center The window center.
     * @param {Number} width The window width.
     */ 
    this.setCenterAndWidth = function(center, width)
    {
        // store the window values
        center_ = center;
        width_ = width;
        // pre calculate loop values
        var size = windowLut_.length;
        var center0 = isSigned_ ? center - 0.5 + size / 2 : center - 0.5;
        var width0 = width - 1;
        var dispval = 0;
        if( !dwv.browser.hasClampedArray() )
        {
            var xMin = center - 0.5 - (width-1) / 2;
            var xMax = center - 0.5 + (width-1) / 2;    
            var yMax = 255;
            var yMin = 0;
            var value = 0;
            for(var j=0; j<size; ++j)
            {
                // from the DICOM specification (https://www.dabsoft.ch/dicom/3/C.11.2.1.2/)
                // y = ((x - (c - 0.5)) / (w-1) + 0.5) * (ymax - ymin )+ ymin
                value = rescaleLut_.getValue(j);
                if(value <= xMin)
                {                            
                    windowLut_[j] = yMin;                        
                }
                else if (value > xMax)
                {
                    windowLut_[j] = yMax;         
                }
                else
                {                
                    dispval = ((value - center0 ) / width0 + 0.5) * 255;
                    windowLut_[j]= parseInt(dispval, 10);
                }
            }
        }
        else
        {
            // when using Uint8ClampedArray, values are clamped between 0 and 255
            // no need to check
            for(var i=0; i<size; ++i)
            {
                // from the DICOM specification (https://www.dabsoft.ch/dicom/3/C.11.2.1.2/)
                // y = ((x - (c - 0.5)) / (w-1) + 0.5) * (ymax - ymin )+ ymin
                dispval = ((rescaleLut_.getValue(i) - center0 ) / width0 + 0.5) * 255;
                windowLut_[i]= parseInt(dispval, 10);
            }
        }
    };
    
    /**
     * Get the length of the LUT array.
     * @method getLength
     * @return {Number} The length of the LUT array.
     */ 
    this.getLength = function() { return windowLut_.length; };

    /**
     * Get the value of the LUT at the given offset.
     * @method getValue
     * @return {Number} The value of the LUT at the given offset.
     */ 
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
    for( var i=0; i<dwv.image.lut.range_max; ++i ) {
        lut.push(func(i));
    }
    return lut;
};

dwv.image.lut.max = function(/*i*/)
{
    return dwv.image.lut.range_max-1;
};

dwv.image.lut.maxFirstThird = function(i)
{
    if( i < dwv.image.lut.range_max/3 ) {
        return dwv.image.lut.range_max-1;
    }
    return 0;
};

dwv.image.lut.maxSecondThird = function(i)
{
    var third = dwv.image.lut.range_max/3;
    if( i >= third && i < 2*third ) {
        return dwv.image.lut.range_max-1;
    }
    return 0;
};

dwv.image.lut.maxThirdThird = function(i)
{
    if( i >= 2*dwv.image.lut.range_max/3 ) {
        return dwv.image.lut.range_max-1;
    }
    return 0;
};

dwv.image.lut.toMaxFirstThird = function(i)
{
    var val = i * 3;
    if( val > dwv.image.lut.range_max-1 ) {
        return dwv.image.lut.range_max-1;
    }
    return val;
};

dwv.image.lut.toMaxSecondThird = function(i)
{
    var third = dwv.image.lut.range_max/3;
    var val = 0;
    if( i >= third ) {
        val = (i-third) * 3;
        if( val > dwv.image.lut.range_max-1 ) {
            return dwv.image.lut.range_max-1;
        }
    }
    return val;
};

dwv.image.lut.toMaxThirdThird = function(i)
{
    var third = dwv.image.lut.range_max/3;
    var val = 0;
    if( i >= 2*third ) {
        val = (i-2*third) * 3;
        if( val > dwv.image.lut.range_max-1 ) {
            return dwv.image.lut.range_max-1;
        }
    }
    return val;
};

dwv.image.lut.zero = function(/*i*/)
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
;/** 
 * Image module.
 * @module image
 */
var dwv = dwv || {};
/**
 * Namespace for image related functions.
 * @class image
 * @namespace dwv
 * @static
 */
dwv.image = dwv.image || {};

/**
 * Get data from an input image using a canvas.
 * @method getDataFromImage
 * @static
 * @param {Image} image The image.
 * @return {Mixed} The corresponding view and info.
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
    // meta information
    var meta = {};
    meta.BitsStored = 8;
    dwvImage.setMeta(meta);
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
 * @method getDataFromDicomBuffer
 * @static
 * @param {Array} buffer The input data buffer.
 * @return {Mixed} The corresponding view and info.
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

;/** 
 * Image module.
 * @module image
 */
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * View class.
 * @class View
 * @namespace dwv.image
 * @constructor
 * @param {Image} image The associated image.
 * @param {Boolean} isSigned Is the data signed.
 * Need to set the window lookup table once created
 * (either directly or with helper methods). 
 */
dwv.image.View = function(image, isSigned)
{
    /**
     * Rescale lookup table.
     * @property rescaleLut
     * @private
     * @type Rescale
     */
    var rescaleLut = new dwv.image.lut.Rescale(
        image.getRescaleSlope(), image.getRescaleIntercept() );
    // initialise it
    rescaleLut.initialise(image.getMeta().BitsStored);
    
    /**
     * Window lookup table.
     * @property windowLut
     * @private
     * @type Window
     */
    var windowLut = new dwv.image.lut.Window(rescaleLut, isSigned);
    
    /**
     * Window presets.
     * @property windowPresets
     * @private
     * @type Object
     */
    var windowPresets = null;
    /**
     * Color map
     * @property colorMap
     * @private
     * @type Object
     */
    var colorMap = dwv.image.lut.plain;
    /**
     * Current position
     * @property currentPosition
     * @private
     * @type Object
     */
    var currentPosition = {"i":0,"j":0,"k":0};
    
    /**
     * Get the associated image.
     * @method getImage
     * @return {Image} The associated image.
     */ 
    this.getImage = function() { return image; };
    /**
     * Set the associated image.
     * @method setImage
     * @param {Image} inImage The associated image.
     */ 
    this.setImage = function(inImage) { image = inImage; };
    
    /**
     * Get the rescale LUT of the image.
     * @method getRescaleLut
     * @return {Rescale} The rescale LUT of the image.
     */ 
    this.getRescaleLut = function() { return rescaleLut; };
    /**
     * Set the rescale LUT of the image.
     * @method setRescaleLut
     * @param {Rescale} lut The rescale LUT of the image.
     */ 
    this.setRescaleLut = function(lut) { rescaleLut = lut; };

    /**
     * Get the window LUT of the image.
     * @method getWindowLut
     * @return {Window} The window LUT of the image.
     */ 
    this.getWindowLut = function() { return windowLut; };
    /**
     * Set the window LUT of the image.
     * @method setWindowLut
     * @param {Window} lut The window LUT of the image.
     */ 
    this.setWindowLut = function(lut) { windowLut = lut; };
    
    /**
     * Get the window presets.
     * @method getWindowPresets
     * @return {Object} The window presets.
     */ 
    this.getWindowPresets = function() { return windowPresets; };
    /**
     * Set the window presets.
     * @method setWindowPresets
     * @param {Object} presets The window presets.
     */ 
    this.setWindowPresets = function(presets) { 
        windowPresets = presets;
        this.setWindowLevel(presets[0].center, presets[0].width);
    };
    
    /**
     * Get the color map of the image.
     * @method getColorMap
     * @return {Object} The color map of the image.
     */ 
    this.getColorMap = function() { return colorMap; };
    /**
     * Set the color map of the image.
     * @method setColorMap
     * @param {Object} map The color map of the image.
     */ 
    this.setColorMap = function(map) { 
        colorMap = map;
        // TODO Better handle this...
        if( this.getImage().getPhotometricInterpretation() === "MONOCHROME1") {
            colorMap = dwv.image.lut.invPlain;
        }
        this.fireEvent({"type": "colorchange", 
           "wc": this.getWindowLut().getCenter(),
           "ww": this.getWindowLut().getWidth() });
    };
    
    /**
     * Is the data signed data.
     * @method isSigned
     * @return {Boolean} The signed data flag.
     */ 
    this.isSigned = function() { return isSigned; };
    
    /**
     * Get the current position.
     * @method getCurrentPosition
     * @return {Object} The current position.
     */ 
    this.getCurrentPosition = function() { return currentPosition; };
    /**
     * Set the current position. Returns false if not in bounds.
     * @method setCurrentPosition
     * @param {Object} pos The current position.
     */ 
    this.setCurrentPosition = function(pos) { 
        if( !image.getSize().isInBounds(pos.i,pos.j,pos.k) ) {
            return false;
        }
        var oldPosition = currentPosition;
        currentPosition = pos;
        // only display value for monochrome data
        if( app.getImage().getPhotometricInterpretation().match(/MONOCHROME/) !== null )
        {
            this.fireEvent({"type": "positionchange", 
                "i": pos.i, "j": pos.j, "k": pos.k,
                "value": image.getRescaledValue(pos.i,pos.j,pos.k)});
        }
        else
        {
            this.fireEvent({"type": "positionchange", 
                "i": pos.i, "j": pos.j, "k": pos.k});
        }
        // slice change event (used to trigger redraw)
        if( oldPosition.k !== currentPosition.k ) {
            this.fireEvent({"type": "slicechange"});
        }
        return true;
    };
    
    /**
     * View listeners
     * @property listeners
     * @private
     * @type Object
     */
    var listeners = {};
    /**
     * Get the view listeners.
     * @method getListeners
     * @return {Object} The view listeners.
     */ 
    this.getListeners = function() { return listeners; };
    /**
     * Set the view listeners.
     * @method setListeners
     * @param {Object} list The view listeners.
     */ 
    this.setListeners = function(list) { listeners = list; };
};

/**
 * Set the view window/level.
 * @method setWindowLevel
 * @param {Number} center The window center.
 * @param {Number} width The window width.
 * Warning: uses the latest set rescale LUT or the default linear one.
 */
dwv.image.View.prototype.setWindowLevel = function( center, width )
{
    this.getWindowLut().setCenterAndWidth(center, width);
    this.fireEvent({"type": "wlchange", "wc": center, "ww": width });
};

/**
 * Set the image window/level to cover the full data range.
 * @method setWindowLevelMinMax
 * Warning: uses the latest set rescale LUT or the default linear one.
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
 * Go to first slice .
 * @method goFirstSlice
 * @return {Boolean} False if not in bounds.
 */
dwv.image.View.prototype.goFirstSlice = function()
{
    return this.setCurrentPosition({
        "i": this.getCurrentPosition().i,
        "j": this.getCurrentPosition().j,
        "k":  0 
    });
};
/**
 * Increment the current slice number.
 * @method incrementSliceNb
 * @return {Boolean} False if not in bounds.
 */
dwv.image.View.prototype.incrementSliceNb = function()
{
    return this.setCurrentPosition({
        "i": this.getCurrentPosition().i,
        "j": this.getCurrentPosition().j,
        "k": this.getCurrentPosition().k + 1 
    });
};

/**
 * Decrement the current slice number.
 * @method decrementSliceNb
 * @return {Boolean} False if not in bounds.
 */
dwv.image.View.prototype.decrementSliceNb = function()
{
    return this.setCurrentPosition({
        "i": this.getCurrentPosition().i,
        "j": this.getCurrentPosition().j,
        "k": this.getCurrentPosition().k - 1 
    });
};

/**
 * Clone the image using all meta data and the original data buffer.
 * @method clone
 * @return {View} A full copy of this {dwv.image.Image}.
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
 * @method generateImageData
 * @param {Array} array The array to fill in.
 * @param {Number} sliceNumber The slice position.
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
    switch (photoInterpretation)
    {
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
 * @method addEventListener
 * @param {String} type The event type.
 * @param {Object} listener The method associated with the provided event type.
 */
dwv.image.View.prototype.addEventListener = function(type, listener)
{
    var listeners = this.getListeners();
    if( !listeners[type] ) {
        listeners[type] = [];
    }
    listeners[type].push(listener);
};

/**
 * Remove an event listener on the view.
 * @method removeEventListener
 * @param {String} type The event type.
 * @param {Object} listener The method associated with the provided event type.
 */
dwv.image.View.prototype.removeEventListener = function(type, listener)
{
    var listeners = this.getListeners();
    if( !listeners[type] ) {
        return;
    }
    for(var i=0; i < listeners[type].length; ++i)
    {   
        if( listeners[type][i] === listener ) {
            listeners[type].splice(i,1);
        }
    }
};

/**
 * Fire an event: call all associated listeners.
 * @method fireEvent
 * @param {Object} event The event to fire.
 */
dwv.image.View.prototype.fireEvent = function(event)
{
    var listeners = this.getListeners();
    if( !listeners[event.type] ) {
        return;
    }
    for(var i=0; i < listeners[event.type].length; ++i)
    {   
        listeners[event.type][i](event);
    }
};

;/** 
 * I/O module.
 * @module io
 */
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * File loader.
 * @class File
 * @namespace dwv.io
 * @constructor
 */
dwv.io.File = function()
{
    this.onload = null;
    this.onerror = null;
};

/**
 * Load a list of files.
 * @method load
 * @param {Array} ioArray The list of files to load.
 */
dwv.io.File.prototype.load = function(ioArray) 
{
    // create closure to the onload method
    var onload = this.onload;
    var onerror = this.onerror;

    // Request error
    var onErrorImageReader = function(event)
    {
        onerror( {'name': "RequestError", 
            'message': "An error occurred while reading the image file: "+event.getMessage() } );
    };


    // Request error
    var onErrorDicomReader = function(event)
    {
        onerror( {'name': "RequestError", 
            'message': "An error occurred while reading the DICOM file: "+event.getMessage() } );
    };

    // DICOM reader loader
    var onLoadDicomReader = function(event)
    {
        // parse DICOM file
        try {
            var tmpdata = dwv.image.getDataFromDicomBuffer(event.target.result);
            // call listener
            onload(tmpdata);
        } catch(error) {
            onerror(error);
        }
        // force 100% progress (sometimes with firefox)
        var endEvent = {lengthComputable: true, loaded: 1, total: 1};
        dwv.gui.updateProgress(endEvent);
    };

    // Image loader
    var onLoadImageFile = function(/*event*/)
    {
        // parse image file
        try {
            var tmpdata = dwv.image.getDataFromImage(this);
            // call listener
            onload(tmpdata);
        } catch(error) {
            onerror(error);
        }
    };

    // Image reader loader
    var onLoadImageReader = function(event)
    {
        var theImage = new Image();
        theImage.src = event.target.result;
        // storing values to pass them on
        theImage.file = this.file;
        theImage.index = this.index;
        theImage.onload = onLoadImageFile;
    };

    // loop on I/O elements
    for (var i = 0; i < ioArray.length; ++i)
    {
        var file = ioArray[i];
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
;/** 
 * I/O module.
 * @module io
 */
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * Url loader.
 * @class Url
 * @namespace dwv.io
 * @constructor
 */
dwv.io.Url = function()
{
    this.onload = null;
    this.onerror = null;
};

/**
 * Load a list of URLs.
 * @method load
 * @param {Array} ioArray The list of urls to load.
 */
dwv.io.Url.prototype.load = function(ioArray) 
{
    // create closure to the class data
    var onload = this.onload;
    var onerror = this.onerror;
    
    // Request error
    var onErrorRequest = function(/*event*/)
    {
        onerror( {'name': "RequestError", 
            'message': "An error occurred while retrieving the file: (http) "+this.status } );
    };

    // DICOM request loader
    var onLoadDicomRequest = function(response)
    {
        // parse DICOM file
        try {
            var tmpdata = dwv.image.getDataFromDicomBuffer(response);
            // call listener
            onload(tmpdata);
        } catch(error) {
            onerror(error);
        }
    };

    // Image request loader
    var onLoadImageRequest = function(/*event*/)
    {
        // parse image data
        try {
            var tmpdata = dwv.image.getDataFromImage(this);
            // call listener
            onload(tmpdata);
        } catch(error) {
            onerror(error);
        }
    };

    // Request handler
    var onLoadRequest = function(/*event*/)
    {
        // find the image type
        var view = new DataView(this.response);
        var isJpeg = view.getUint32(0) === 0xffd8ffe0;
        var isPng = view.getUint32(0) === 0x89504e47;
        var isGif = view.getUint32(0) === 0x47494638;
        
        // non DICOM
        if( isJpeg || isPng || isGif )
        {
            // image data as string
            var bytes = new Uint8Array(this.response);
            var imageDataStr = '';
            for( var i = 0; i < bytes.byteLength; ++i ) {
                imageDataStr += String.fromCharCode(bytes[i]);
            }
            // image type
            var imageType = "unknown";
            if(isJpeg) {
                imageType = "jpeg";
            }
            else if(isPng) {
                imageType = "png";
            }
            else if(isGif) {
                imageType = "gif";
            }
            // temporary image object
            var tmpImage = new Image();
            tmpImage.src = "data:image/" + imageType + ";base64," + window.btoa(imageDataStr);
            tmpImage.onload = onLoadImageRequest;
        }
        else
        {
            onLoadDicomRequest(this.response);
        }
    };

    // loop on I/O elements
    for (var i = 0; i < ioArray.length; ++i)
    {
        var url = ioArray[i];
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
;/** 
 * Math module.
 * @module math
 */
var dwv = dwv || {};
dwv.math = dwv.math || {};

/** 
 * Circular Bucket Queue.
 *
 * Returns input'd points in sorted order. All operations run in roughly O(1)
 * time (for input with small cost values), but it has a strict requirement:
 *
 * If the most recent point had a cost of c, any points added should have a cost
 * c' in the range c <= c' <= c + (capacity - 1).
 * 
 * @class BucketQueue
 * @namespace dwv.math
 * @constructor
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
	var buckets = new Array(newSize);
	
	for ( var i = 0; i < buckets.length; i++ ) {
		buckets[i] = null;
	}
	
	return buckets;
};
;/** 
 * Math module.
 * @module math
 */
var dwv = dwv || {};
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
		var dx = this.dx(x,y); 
		var dy = this.dy(x,y);
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

	var max = 0; // Maximum gradient found, for scaling purposes

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
		dp = -dp; 
		dq = -dq;
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

    var len = buffer.length;
    out[len-2] = 0.25*buffer[len-1] + 0.4*buffer[len-2] + 0.25*buffer[len-3] + 0.1*buffer[len-4];
    out[len-1] = 0.4*buffer[len-1] + 0.5*buffer[len-2] + 0.1*buffer[len-3];
};


/**
 * Scissors
 * @class Scissors
 * @namespace dwv.math
 * @constructor
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
;/** 
 * Math module.
 * @module math
 */
var dwv = dwv || {};
dwv.math = dwv.math || {};

/** 
 * 2D point. Immutable.
 * @class Point2D
 * @namespace dwv.math
 * @constructor
 * @param {Number} x The X coordinate for the point.
 * @param {Number} y The Y coordinate for the point.
 */
dwv.math.Point2D = function(x,y)
{
    /** 
     * Get the X position of the point.
     * @method getX
     * @return {Number} The X position of the point.
     */
    this.getX = function() { return x; };
    /** 
     * Get the Y position of the point.
     * @method getY
     * @return {Number} The Y position of the point. 
     */
    this.getY = function() { return y; };
}; // Point2D class

/** 
 * Check for Point2D equality.
 * @method equals
 * @param {Point2D} other The other Point2D to compare to.
 * @return {Boolean} True if both points are equal.
 */ 
dwv.math.Point2D.prototype.equals = function(other) {
    if( !other ) { 
        return false;
    }
    return ( this.getX() === other.getX() && this.getY() === other.getY() );
};

/** 
 * Get a string representation of the Point2D.
 * @method toString
 * @return {String} The Point2D as a string.
 */ 
dwv.math.Point2D.prototype.toString = function() {
    return "(" + this.getX() + ", " + this.getY() + ")";
};

/** 
 * Fast 2D point since it's mutable!
 * @class FastPoint2D
 * @namespace dwv.math
 * @constructor
 * @param {Number} x The X coordinate for the point.
 * @param {Number} y The Y coordinate for the point.
 */
dwv.math.FastPoint2D = function(x,y)
{
    this.x = x;
    this.y = y;
}; // FastPoint2D class

/** 
 * Check for FastPoint2D equality.
 * @method equals
 * @param {FastPoint2D} other The other FastPoint2D to compare to.
 * @return {Boolean} True if both points are equal.
 */ 
dwv.math.FastPoint2D.prototype.equals = function(other) {
    if( !other ) { 
        return false;
    }
    return ( this.x === other.x && this.y === other.y );
};

/** 
 * Get a string representation of the FastPoint2D.
 * @method toString
 * @return {String} The Point2D as a string.
 */ 
dwv.math.FastPoint2D.prototype.toString = function() {
    return "(" + this.x + ", " + this.y + ")";
};

/** 
 * Circle shape.
 * @class Circle
 * @namespace dwv.math
 * @constructor
 * @param {Object} centre A Point2D representing the centre of the circle.
 * @param {Number} radius The radius of the circle.
 */
dwv.math.Circle = function(centre, radius)
{
    /**
     * Circle surface.
     * @property surface
     * @private
     * @type Number
     */
    var surface = Math.PI*radius*radius;

    /**
     * Get the centre (point) of the circle.
     * @method getCenter
     * @return {Object} The center (point) of the circle.
     */
    this.getCenter = function() { return centre; };
    /**
     * Get the radius of the circle.
     * @method getRadius
     * @return {Number} The radius of the circle.
     */
    this.getRadius = function() { return radius; };
    /**
     * Get the surface of the circle.
     * @method getSurface
     * @return {Number} The surface of the circle.
     */
    this.getSurface = function() { return surface; };
    /**
     * Get the surface of the circle with a spacing.
     * @method getWorldSurface
     * @param {Number} spacingX The X spacing.
     * @param {Number} spacingY The Y spacing.
     * @return {Number} The surface of the circle multiplied by the given spacing.
     */
    this.getWorldSurface = function(spacingX, spacingY)
    {
        return surface * spacingX * spacingY;
    };
}; // Circle class

/** 
 * Ellipse shape.
 * @class Ellipse
 * @namespace dwv.math
 * @constructor
 * @param {Object} centre A Point2D representing the centre of the ellipse.
 * @param {Number} a The radius of the ellipse on the horizontal axe.
 * @param {Number} b The radius of the ellipse on the vertical axe.
 */
dwv.math.Ellipse = function(centre, a, b)
{
    /**
     * Circle surface.
     * @property surface
     * @private
     * @type Number
     */
    var surface = Math.PI*a*b;

    /**
     * Get the centre (point) of the ellipse.
     * @method getCenter
     * @return {Object} The center (point) of the ellipse.
     */
    this.getCenter = function() { return centre; };
    /**
     * Get the radius of the ellipse on the horizontal axe.
     * @method getA
     * @return {Number} The radius of the ellipse on the horizontal axe.
     */
    this.getA = function() { return a; };
    /**
     * Get the radius of the ellipse on the vertical axe.
     * @method getB
     * @return {Number} The radius of the ellipse on the vertical axe.
     */
    this.getB = function() { return b; };
    /**
     * Get the surface of the ellipse.
     * @method getSurface
     * @return {Number} The surface of the ellipse.
     */
    this.getSurface = function() { return surface; };
    /**
     * Get the surface of the ellipse with a spacing.
     * @method getWorldSurface
     * @param {Number} spacingX The X spacing.
     * @param {Number} spacingY The Y spacing.
     * @return {Number} The surface of the ellipse multiplied by the given spacing.
     */
    this.getWorldSurface = function(spacingX, spacingY)
    {
        return surface * spacingX * spacingY;
    };
}; // Circle class

/**
 * Line shape.
 * @class Line
 * @namespace dwv.math
 * @constructor
 * @param {Object} begin A Point2D representing the beginning of the line.
 * @param {Object} end A Point2D representing the end of the line.
 */
dwv.math.Line = function(begin, end)
{
    /**
     * Line length.
     * @property length
     * @private
     * @type Number
     */
    var length = Math.sqrt(
        Math.abs(end.getX() - begin.getX()) * Math.abs(end.getX() - begin.getX()) +
        Math.abs(end.getY() - begin.getY()) * Math.abs(end.getY() - begin.getY() ) );
    
    /**
     * Get the begin point of the line.
     * @method getBegin
     * @return {Object} The beginning point of the line.
     */
    this.getBegin = function() { return begin; };
    /**
     * Get the end point of the line.
     * @method getEnd
     * @return {Object} The ending point of the line.
     */
    this.getEnd = function() { return end; };
    /**
     * Get the length of the line.
     * @method getLength
     * @return {Number} The length of the line.
     */
    this.getLength = function() { return length; };
    /**
     * Get the length of the line with spacing.
     * @method getWorldLength
     * @param {Number} spacingX The X spacing.
     * @param {Number} spacingY The Y spacing.
     * @return {Number} The length of the line with spacing.
     */
    this.getWorldLength = function(spacingX, spacingY)
    {
        var lx = Math.abs(end.getX() - begin.getX()) * spacingX;
        var ly = Math.abs(end.getY() - begin.getY()) * spacingY;
        return Math.sqrt( lx * lx + ly * ly );
    };
    /**
     * Get the mid point of the line.
     * @method getMidpoint
     * @return {Object} The mid point of the line.
     */
    this.getMidpoint = function()
    {
        return new dwv.math.Point2D( 
            parseInt( (begin.getX()+end.getX()) / 2, 10 ), 
            parseInt( (begin.getY()+end.getY()) / 2, 10 ) );
    };
}; // Line class

/**
 * Rectangle shape.
 * @class Rectangle
 * @namespace dwv.math
 * @constructor
 * @param {Object} begin A Point2D representing the beginning of the rectangle.
 * @param {Object} end A Point2D representing the end of the rectangle.
 */
dwv.math.Rectangle = function(begin, end)
{
    if ( end.getX() < begin.getX() ) {
        var tmpX = begin.getX();
        begin = new dwv.math.Point2D( end.getX(), begin.getY() );
        end = new dwv.math.Point2D( tmpX, end.getY() );
    }
    if ( end.getY() < begin.getY() ) {
        var tmpY = begin.getY();
        begin = new dwv.math.Point2D( begin.getX(), end.getY() );
        end = new dwv.math.Point2D( end.getX(), tmpY );
    }
    
    /**
     * Rectangle surface.
     * @property surface
     * @private
     * @type Number
     */
    var surface = Math.abs(end.getX() - begin.getX()) * Math.abs(end.getY() - begin.getY() );

    /**
     * Get the begin point of the rectangle.
     * @method getBegin
     * @return {Object} The begin point of the rectangle
     */
    this.getBegin = function() { return begin; };
    /**
     * Get the end point of the rectangle.
     * @method getEnd
     * @return {Object} The end point of the rectangle
     */
    this.getEnd = function() { return end; };
    /**
     * Get the real width of the rectangle.
     * @method getRealWidth
     * @return {Number} The real width of the rectangle.
     */
    this.getRealWidth = function() { return end.getX() - begin.getX(); };
    /**
     * Get the real height of the rectangle.
     * @method getRealHeight
     * @return {Number} The real height of the rectangle.
     */
    this.getRealHeight = function() { return end.getY() - begin.getY(); };
    /**
     * Get the width of the rectangle.
     * @method getWidth
     * @return {Number} The width of the rectangle.
     */
    this.getWidth = function() { return Math.abs(this.getRealWidth()); };
    /**
     * Get the height of the rectangle.
     * @method getHeight
     * @return {Number} The height of the rectangle.
     */
    this.getHeight = function() { return Math.abs(this.getRealHeight()); };
    /**
     * Get the surface of the rectangle.
     * @method getSurface
     * @return {Number} The surface of the rectangle.
     */
    this.getSurface = function() { return surface; };
    /**
     * Get the surface of the rectangle with a spacing.
     * @method getWorldSurface
     * @return {Number} The surface of the rectangle with a spacing.
     */
    this.getWorldSurface = function(spacingX, spacingY)
    {
        return surface * spacingX * spacingY;
    };
}; // Rectangle class

/**
 * Region Of Interest shape.
 * @class ROI
 * @namespace dwv.math
 * @constructor
 * Note: should be a closed path.
 */
dwv.math.ROI = function()
{
    /**
     * List of points.
     * @property points
     * @private
     * @type Array
     */
    var points = [];
    
    /**
     * Get a point of the list at a given index.
     * @method getPoint
     * @param {Number} index The index of the point to get (beware, no size check).
     * @return {Object} The Point2D at the given index.
     */ 
    this.getPoint = function(index) { return points[index]; };
    /**
     * Get the length of the point list.
     * @method getLength
     * @return {Number} The length of the point list.
     */ 
    this.getLength = function() { return points.length; };
    /**
     * Add a point to the ROI.
     * @method addPoint
     * @param {Object} point The Point2D to add.
     */
    this.addPoint = function(point) { points.push(point); };
    /**
     * Add points to the ROI.
     * @method addPoints
     * @param {Array} rhs The array of POints2D to add.
     */
    this.addPoints = function(rhs) { points=points.concat(rhs);};
}; // ROI class

/**
 * Path shape.
 * @class Path
 * @namespace dwv.math
 * @constructor
 * @param {Array} inputPointArray The list of Point2D that make the path (optional).
 * @param {Array} inputControlPointIndexArray The list of control point of path, 
 *  as indexes (optional).
 * Note: first and last point do not need to be equal.
 */
dwv.math.Path = function(inputPointArray, inputControlPointIndexArray)
{
    /**
     * List of points.
     * @property pointArray
     * @type Array
     */
    this.pointArray = inputPointArray ? inputPointArray.slice() : [];
    /**
     * List of control points.
     * @property controlPointIndexArray
     * @type Array
     */
    this.controlPointIndexArray = inputControlPointIndexArray ?
        inputControlPointIndexArray.slice() : [];
}; // Path class

/**
 * Get a point of the list.
 * @method getPoint
 * @param {Number} index The index of the point to get (beware, no size check).
 * @return {Object} The Point2D at the given index.
 */ 
dwv.math.Path.prototype.getPoint = function(index) {
    return this.pointArray[index];
};

/**
 * Is the given point a control point.
 * @method isControlPoint
 * @param {Object} point The Point2D to check.
 * @return {Boolean} True if a control point.
 */ 
dwv.math.Path.prototype.isControlPoint = function(point) {
    var index = this.pointArray.indexOf(point);
    if( index !== -1 ) {
        return this.controlPointIndexArray.indexOf(index) !== -1;
    }
    else {
        throw new Error("Error: isControlPoint called with not in list point.");
    }
};

/**
 * Get the length of the path.
 * @method getLength
 * @return {Number} The length of the path.
 */ 
dwv.math.Path.prototype.getLength = function() { 
    return this.pointArray.length;
};

/**
 * Add a point to the path.
 * @method addPoint
 * @param {Object} point The Point2D to add.
 */
dwv.math.Path.prototype.addPoint = function(point) {
    this.pointArray.push(point);
};

/**
 * Add a control point to the path.
 * @method addControlPoint
 * @param {Object} point The Point2D to make a control point.
 */
dwv.math.Path.prototype.addControlPoint = function(point) {
    var index = this.pointArray.indexOf(point);
    if( index !== -1 ) {
        this.controlPointIndexArray.push(index);
    }
    else {
        throw new Error("Error: addControlPoint called with no point in list point.");
    }
};

/**
 * Add points to the path.
 * @method addPoints
 * @param {Array} points The list of Point2D to add.
 */
dwv.math.Path.prototype.addPoints = function(newPointArray) { 
    this.pointArray = this.pointArray.concat(newPointArray);
};

/**
 * Append a Path to this one.
 * @method appenPath
 * @param {Path} other The Path to append.
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
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/**
 * Draw shape command.
 * @class DrawShapeCommand
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.DrawShapeCommand = function (shape, name, app)
{
    /**
     * Get the command name.
     * @method getName
     * @return {String} The command name.
     */
    this.getName = function () { return "Draw-"+name; };
    /**
     * Execute the command.
     * @method execute
     */
    this.execute = function () {
        var group = shape.getParent();
        // add the group to the layer
        app.getKineticLayer().add(group);
        // draw
        app.getKineticLayer().draw();
    };
    /**
     * Undo the command.
     * @method undo
     */
    this.undo = function () {
        var group = shape.getParent();
        // remove the group from the parent layer
        group.remove();
        // draw
        app.getKineticLayer().draw();
    };
}; // DrawShapeCommand class

/**
 * Move shape command.
 * @class MoveShapeCommand
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.MoveShapeCommand = function (shape, name, translation, app)
{
    /**
     * Get the command name.
     * @method getName
     * @return {String} The command name.
     */
    this.getName = function () { return "Move-"+name; };

    /**
     * Execute the command.
     * @method execute
     */
    this.execute = function () {
        var group = shape.getParent();
        // translate all children of group
        group.getChildren().each( function (shape) {
            shape.x( shape.x() + translation.x );
            shape.y( shape.y() + translation.y );
        });
        // draw
        app.getKineticLayer().draw();
    };
    /**
     * Undo the command.
     * @method undo
     */
    this.undo = function () {
        var group = shape.getParent();
        // invert translate all children of group
        group.getChildren().each( function (shape) {
            shape.x( shape.x() - translation.x );
            shape.y( shape.y() - translation.y );
        });
        // draw
        app.getKineticLayer().draw();
    };
}; // MoveShapeCommand class

/**
 * Change shape command.
 * @class ChangeShapeCommand
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.ChangeShapeCommand = function (shape, name, func, startAnchor, endAnchor, app)
{
    /**
     * Get the command name.
     * @method getName
     * @return {String} The command name.
     */
    this.getName = function () { return "Change-"+name; };

    /**
     * Execute the command.
     * @method execute
     */
    this.execute = function () {
        // change shape
        func( shape, endAnchor );
        // draw
        app.getKineticLayer().draw();
    };
    /**
     * Undo the command.
     * @method undo
     */
    this.undo = function () {
        // invert change shape
        func( shape, startAnchor );
        // draw
        app.getKineticLayer().draw();
    };
}; // ChangeShapeCommand class

/**
 * Delete shape command.
 * @class DeleteShapeCommand
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.DeleteShapeCommand = function (shape, name, app)
{
    /**
     * Get the command name.
     * @method getName
     * @return {String} The command name.
     */
    this.getName = function () { return "Delete-"+name; };
    /**
     * Execute the command.
     * @method execute
     */
    this.execute = function () {
        var group = shape.getParent();
        // remove the group from the parent layer
        group.remove();
        // draw
        app.getKineticLayer().draw();
    };
    /**
     * Undo the command.
     * @method undo
     */
    this.undo = function () {
        var group = shape.getParent();
        // add the group to the layer
        app.getKineticLayer().add(group);
        // draw
        app.getKineticLayer().draw();
    };
}; // DeleteShapeCommand class

// List of colors
dwv.tool.colors = [
    "Yellow", "Red", "White", "Green", "Blue", "Lime", "Fuchsia", "Black"
];

/**
 * Drawing tool.
 * @class Draw
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.Draw = function (app)
{
    /**
     * Closure to self: to be used by event handlers.
     * @property self
     * @private
     * @type WindowLevel
     */
    var self = this;
    /**
     * Interaction start flag.
     * @property started
     * @private
     * @type Boolean
     */
    var started = false;
    /**
     * Interaction just started flag.
     * @property justStarted
     * @private
     * @type Boolean
     */
    var justStarted = true;
    
    /**
     * Draw command.
     * @property command
     * @private
     * @type Object
     */
    var command = null;
    /**
     * Current active shape.
     * @property shape
     * @private
     * @type Object
     */
    var activeShape = null;
    var createdShapes = [];
    /**
     * Current shape group.
     * @property shapeGroup
     * @private
     * @type Object
     */
    var shapeGroup = null;

    /**
     * Drawing style.
     * @property style
     * @type Style
     */
    this.style = new dwv.html.Style();
    /**
     * Shape name.
     * @property shapeName
     * @type String
     */
    this.shapeName = 0;
    
    /**
     * List of points.
     * @property points
     * @private
     * @type Array
     */
    var points = [];
    
    /**
     * Last selected point.
     * @property lastPoint
     * @private
     * @type Object
     */
    var lastPoint = null;
    
    /**
     * Shape editor.
     * @property shapeEditor
     * @private
     * @type Object
     */
    var shapeEditor = new dwv.tool.ShapeEditor();

    var trashLine1 = new Kinetic.Line({
        points: [-10, -10, 10, 10 ],
        stroke: 'red',
    });
    var trashLine2 = new Kinetic.Line({
        points: [10, -10, -10, 10 ],
        stroke: 'red'
    });
    var trash = new Kinetic.Group();
    trash.add(trashLine1);
    trash.add(trashLine2);

    /**
     * Handle mouse down event.
     * @method mousedown
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        // determine if the click happened in an existing shape
        var stage = app.getKineticStage();
        var kshape = stage.getIntersection({
            x: event._xs, 
            y: event._ys
        });
        
        if ( kshape ) {
            var group = kshape.getParent();
            var selectedShape = group.find(".shape")[0];
            // reset editor if click on other shape
            // (and avoid anchors mouse down)
            if ( selectedShape && selectedShape !== shapeEditor.getShape() ) { 
                shapeEditor.disable();
                shapeEditor.setShape(selectedShape);
                shapeEditor.enable();
            }
        }
        else {
            // disable edition
            shapeEditor.disable();
            shapeEditor.setShape(null);
            // start storing points
            started = true;
            shapeGroup = new Kinetic.Group();
            // clear array
            points = [];
            // store point
            lastPoint = new dwv.math.Point2D(event._x, event._y);
            points.push(lastPoint);
        }
    };

    /**
     * Handle mouse move event.
     * @method mousemove
     * @param {Object} event The mouse move event.
     */
    this.mousemove = function(event){
        if (!started)
        {
            return;
        }
        if ( Math.abs( event._x - lastPoint.getX() ) > 0 ||
                Math.abs( event._y - lastPoint.getY() ) > 0 )
        {
            // current point
            lastPoint = new dwv.math.Point2D(event._x, event._y);
            points.push( lastPoint );
            // remove previous draw if not just started
            if ( activeShape && !justStarted ) {
                activeShape.destroy();
            }
            if ( justStarted ) {
                justStarted = false;
            }
            // create shape
            activeShape = new dwv.tool.shapes[self.shapeName](points, self.style);
            // add shape to group
            shapeGroup.add(activeShape);
            // draw shape command
            command = new dwv.tool.DrawShapeCommand(activeShape, self.shapeName, app);
            // draw
            command.execute();
        }
    };

    /**
     * Handle mouse up event.
     * @method mouseup
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function (/*event*/){
        if (started && points.length > 1 )
        {
            // remove previous draw
            if ( activeShape ) {
                activeShape.destroy();
            }
            // create final shape
            activeShape = new dwv.tool.shapes[self.shapeName](points, self.style);
            // add shape to group
            shapeGroup.add(activeShape);
            // draw shape command
            command = new dwv.tool.DrawShapeCommand(activeShape, self.shapeName, app);
            // execute it
            command.execute();
            // save it in undo stack
            app.getUndoStack().add(command);
            
            // set shape on
            self.setShapeOn(activeShape);
            createdShapes.push(activeShape);
        }
        // reset flag
        started = false;
        justStarted = true;
    };
    
    /**
     * Handle mouse out event.
     * @method mouseout
     * @param {Object} event The mouse out event.
     */
    this.mouseout = function(event){
        self.mouseup(event);
    };

    /**
     * Handle touch start event.
     * @method touchstart
     * @param {Object} event The touch start event.
     */
    this.touchstart = function(event){
        self.mousedown(event);
    };

    /**
     * Handle touch move event.
     * @method touchmove
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        self.mousemove(event);
    };

    /**
     * Handle touch end event.
     * @method touchend
     * @param {Object} event The touch end event.
     */
    this.touchend = function(event){
        self.mouseup(event);
    };

    /**
     * Handle key down event.
     * @method keydown
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        app.handleKeyDown(event);
    };

    /**
     * Enable the tool.
     * @method enable
     * @param {Boolean} flag The flag to enable or not.
     */
    this.display = function ( flag ){
        dwv.gui.displayDrawHtml( flag );
        // reset shape display properties
        shapeEditor.disable();
        shapeEditor.setShape(null);
        document.body.style.cursor = 'default';
        // set shape display properties
        if ( flag ) {
            createdShapes.forEach( function (shape){ self.setShapeOn( shape ); });
        }
        else {
            createdShapes.forEach( function (shape){ setShapeOff( shape ); });
        }
        // draw
        app.getKineticLayer().draw();
    };
    
    /**
     * Set shape off properties.
     * @method setShapeOff
     * @param {Object} shape The shape to set off.
     */
    function setShapeOff( shape ) {
        // mouse styling
        shape.off('mouseover');
        shape.off('mouseout');
        // drag
        shape.draggable(false);
        shape.off('dragstart');
        shape.off('dragmove');
        shape.off('dragend');
    }

    /**
     * Get the real position from an event.
     */
    function getRealPosition( index ) {
        var stage = app.getKineticStage();
        return { 'x': stage.offset().x + index.x / stage.scale().x,
            'y': stage.offset().y + index.y / stage.scale().y };
    }
    
    /**
     * Set shape on properties.
     * @method setShapeOn
     * @param {Object} shape The shape to set on.
     */
    this.setShapeOn = function ( shape ) {
        // mouse over styling
        shape.on('mouseover', function () {
            document.body.style.cursor = 'pointer';
        });
        // mouse out styling
        shape.on('mouseout', function () {
            document.body.style.cursor = 'default';
        });

        // make it draggable
        shape.draggable(true);
        var dragStartPos = null;
        
        // command name based on shape type
        var cmdName = "shape";
        if ( shape instanceof Kinetic.Line ) {
            cmdName = "line";
        }
        else if ( shape instanceof Kinetic.Rect ) {
            cmdName = "rectangle";
        }
        else if ( shape instanceof Kinetic.Ellipse ) {
            cmdName = "ellipse";
        }
        
        // shape color
        var color = shape.stroke();
        
        // drag start event handling
        shape.on('dragstart', function (event) {
            // save start position
            var offset = { 'x': event.evt.offsetX, 'y': event.evt.offsetY };
            dragStartPos = getRealPosition( offset );
            // display trash
            var stage = app.getKineticStage();
            var scale = stage.scale();
            var invscale = {'x': 1/scale.x, 'y': 1/scale.y};
            trash.x( stage.offset().x + ( 256 / scale.x ) );
            trash.y( stage.offset().y + ( 20 / scale.y ) );
            trash.scale( invscale );
            app.getKineticLayer().add( trash );
            // deactivate anchors to avoid events on null shape
            shapeEditor.setAnchorsActive(false);
            // draw
            app.getKineticLayer().draw();
        });
        // drag move event handling
        shape.on('dragmove', function (event) {
            var offset = { 'x': event.evt.offsetX, 'y': event.evt.offsetY };
            var pos = getRealPosition( offset );
            // highlight trash when on it
            if ( Math.abs( pos.x - trash.x() ) < 10 &&
                    Math.abs( pos.y - trash.y() ) < 10   ) {
                trash.getChildren().each( function (tshape){ tshape.stroke('orange'); });
                shape.stroke('red');
            }
            else {
                trash.getChildren().each( function (tshape){ tshape.stroke('red'); });
                shape.stroke(color);
            }
            // reset anchors
            shapeEditor.resetAnchors();
            // draw
            app.getKineticLayer().draw();
        });
        // drag end event handling
        shape.on('dragend', function (event) {
            var offset = { 'x': event.evt.offsetX, 'y': event.evt.offsetY };
            var pos = getRealPosition( offset );
            // delete case
            if ( Math.abs( pos.x - trash.x() ) < 10 &&
                    Math.abs( pos.y - trash.y() ) < 10   ) {
                // compensate for the drag translation
                var delTranslation = {'x': pos.x - dragStartPos.x, 
                        'y': pos.y - dragStartPos.y};
                var group = this.getParent();
                group.getChildren().each( function (shape) {
                    shape.x( shape.x() - delTranslation.x );
                    shape.y( shape.y() - delTranslation.y );
                });
                // disable editor
                shapeEditor.disable();
                shapeEditor.setShape(null);
                document.body.style.cursor = 'default';
                // delete command
                var delcmd = new dwv.tool.DeleteShapeCommand(this, cmdName, app);
                delcmd.execute();
                app.getUndoStack().add(delcmd);
            }
            else {
                // save drag move
                var translation = {'x': pos.x - dragStartPos.x, 
                        'y': pos.y - dragStartPos.y};
                if ( translation.x !== 0 || translation.y !== 0 ) {
                    var mvcmd = new dwv.tool.MoveShapeCommand(this, cmdName, translation, app);
                    app.getUndoStack().add(mvcmd);
                }
                // reset anchors
                shapeEditor.setAnchorsActive(true);
                shapeEditor.resetAnchors();
            }
            // remove trash
            trash.remove();
            // draw
            app.getKineticLayer().draw();
        });
    };


}; // Draw class

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.Draw.prototype.getHelp = function()
{
    return {
        'title': "Draw",
        'brief': "Allows to draw shapes on the image. " +
            "Choose the shape and its color from the drop down menus. ",
        'mouse': {
            'mouse_drag': "A single mouse drag draws the desired shape.",
        },
        'touch': {
            'touch_drag': "A single touch drag draws the desired shape.",
        }
    };
};

/**
 * Set the line color of the drawing.
 * @method setLineColour
 * @param {String} colour The colour to set.
 */
dwv.tool.Draw.prototype.setLineColour = function(colour)
{
    // set style var
    this.style.setLineColor(colour);
};

/**
 * Set the shape name of the drawing.
 * @method setShapeName
 * @param {String} name The name of the shape.
 */
dwv.tool.Draw.prototype.setShapeName = function(name)
{
    // check if we have it
    if( !this.hasShape(name) )
    {
        throw new Error("Unknown shape: '" + name + "'");
    }
    this.shapeName = name;
};

/**
 * Check if the shape is in the shape list.
 * @method hasShape
 * @param {String} name The name of the shape.
 */
dwv.tool.Draw.prototype.hasShape = function(name) {
    return dwv.tool.shapes[name];
};

/**
 * Initialise the tool.
 * @method init
 */
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
    // init html
    dwv.gui.initDrawHtml();
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/**
 * Shape editor.
 * @class ShapeEditor
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.ShapeEditor = function ()
{
    /**
     * Edited shape.
     * @property shape
     * @private
     * @type Object
     */
    var shape = null;
    /**
     * Active flag.
     * @property isActive
     * @private
     * @type Boolean
     */
    var isActive = false;
    /**
     * Update function used by anchors to update the shape.
     * @property updateFunction
     * @private
     * @type Object
     */
    var updateFunction = null;
    
    /**
     * Set the shape to edit.
     * @method setShape
     * @param {Object} inshape The shape to edit.
     */
    this.setShape = function ( inshape ) {
        shape = inshape;
        // reset anchors
        if ( shape ) {
            removeAnchors();
            addAnchors();
        }
    };
    
    /**
     * Get the edited shape.
     * @method getShape
     * @return {Object} The edited shape.
     */
    this.getShape = function () { 
        return shape;
    };
    
    /**
     * Get the active flag.
     * @method isActive
     * @return {Boolean} The active flag.
     */
    this.isActive = function () {
        return isActive;
    };

    /**
     * Enable the editor. Redraws the layer.
     * @method enable
     */
    this.enable = function () {
        isActive = true;
        if ( shape ) {
            setAnchorsVisible( true );
            if ( shape.getLayer() ) {
                shape.getLayer().draw();
            }
        }
    };
    
    /**
     * Disable the editor. Redraws the layer.
     * @method disable
     */
    this.disable = function () {
        isActive = false;
        if ( shape ) {
            setAnchorsVisible( false );
            if ( shape.getLayer() ) {
                shape.getLayer().draw();
            }
        }
    };
    
    /**
     * Reset the anchors.
     * @method resetAnchors
     */
    this.resetAnchors = function () {
        // remove previous controls
        removeAnchors();
        // add anchors
        addAnchors();
        // set them visible
        setAnchorsVisible( true );
    };
    
    /**
     * Apply a function on all anchors.
     * @param {Object} func A f(shape) function.
     */
    function applyFuncToAnchors( func ) {
        if ( shape && shape.getParent() ) {
            var anchors = shape.getParent().find('.anchor');
            anchors.each( func );
        }
    }
    
    /**
     * Set anchors visibility.
     * @method setAnchorsVisible
     * @param {Boolean} flag The visible flag.
     */
    function setAnchorsVisible( flag ) {
        applyFuncToAnchors( function (anchor) {
            anchor.visible( flag );
        });
    }

    /**
     * Set anchors active.
     * @method setAnchorsActive
     * @param {Boolean} flag The active (on/off) flag.
     */
    this.setAnchorsActive = function ( flag ) {
        var func = null;
        if ( flag ) { 
            func = function (anchor) {
                setAnchorOn( anchor );
            };
        }
        else {
            func = function (anchor) {
                setAnchorOff( anchor );
            };
        }
        applyFuncToAnchors( func );
    };

    /**
     * Remove anchors.
     * @method removeAnchors
     */
    function removeAnchors() {
        applyFuncToAnchors( function (anchor) {
            anchor.remove();
        });
    }
    
    /**
     * Add the shape anchors.
     * @method addAnchors
     */
    function addAnchors() {
        // exit if no shape or no layer
        if ( !shape || !shape.getLayer() ) {
            return;
        }
        // get shape group
        var group = shape.getParent();
        // add shape specific anchors to the shape group
        if ( shape instanceof Kinetic.Line ) {
            var points = shape.points();
            if ( points.length === 4 ) {
                updateFunction = dwv.tool.UpdateLine;
                // add shape offset
                var lineBeginX = points[0] + shape.x();
                var lineBeginY = points[1] + shape.y();
                var lineEndX = points[2] + shape.x();
                var lineEndY = points[3] + shape.y();
                addAnchor(group, lineBeginX, lineBeginY, 'begin');
                addAnchor(group, lineEndX, lineEndY, 'end');
            }
            else {
                updateFunction = dwv.tool.UpdateRoi;
                var px = 0;
                var py = 0;
                for ( var i = 0; i < points.length; i=i+2 ) {
                    px = points[i] + shape.x();
                    py = points[i+1] + shape.y();
                    addAnchor(group, px, py, i);
                }
            }
        }
        else if ( shape instanceof Kinetic.Rect ) {
            updateFunction = dwv.tool.UpdateRect;
            var rectX = shape.x();
            var rectY = shape.y();
            var rectWidth = shape.width();
            var rectHeight = shape.height();
            addAnchor(group, rectX, rectY, 'topLeft');
            addAnchor(group, rectX+rectWidth, rectY, 'topRight');
            addAnchor(group, rectX+rectWidth, rectY+rectHeight, 'bottomRight');
            addAnchor(group, rectX, rectY+rectHeight, 'bottomLeft');
        }
        else if ( shape instanceof Kinetic.Ellipse ) {
            updateFunction = dwv.tool.UpdateEllipse;
            var ellipseX = shape.x();
            var ellipseY = shape.y();
            var radius = shape.radius();
            addAnchor(group, ellipseX-radius.x, ellipseY-radius.y, 'topLeft');
            addAnchor(group, ellipseX+radius.x, ellipseY-radius.y, 'topRight');
            addAnchor(group, ellipseX+radius.x, ellipseY+radius.y, 'bottomRight');
            addAnchor(group, ellipseX-radius.x, ellipseY+radius.y, 'bottomLeft');
        }
        // add group to layer
        shape.getLayer().add( group );
    }
    
    /**
     * Create shape editor controls, i.e. the anchors.
     * @method addAnchor
     * @param {Object} group The group associated with this anchor.
     * @param {Number} x The X position of the anchor.
     * @param {Number} y The Y position of the anchor.
     * @param {Number} id The id of the anchor.
     */
    function addAnchor(group, x, y, id) {
        // anchor shape
        var anchor = new Kinetic.Circle({
            x: x,
            y: y,
            stroke: '#999',
            fillRed: 100,
            fillBlue: 100,
            fillGreen: 100,
            fillAlpha: 0.7,
            strokeWidth: 2,
            radius: 6,
            name: 'anchor',
            id: id,
            dragOnTop: false,
            draggable: true,
            visible: false
        });
        // set anchor on
        setAnchorOn( anchor );
        // add the anchor to the group
        group.add(anchor);
    }
    
    /**
     * Get a simple clone of the input anchor.
     * @param {Object} anchor The anchor to clone.
     */
    function getClone( anchor ) {
        // create closure to properties
        var parent = anchor.getParent();
        var id = anchor.id();
        var x = anchor.x();
        var y = anchor.y();
        // create clone object
        var clone = {};
        clone.getParent = function () {
            return parent;
        };
        clone.id = function () {
            return id;
        };
        clone.x = function () {
            return x;
        };
        clone.y = function () {
            return y;
        };
        return clone;
    }
    
    /**
     * Set the anchor on listeners.
     * @param {Object} anchor The anchor to set on.
     */
    function setAnchorOn( anchor ) {
        var startAnchor = null;
        // drag start listener
        anchor.on('dragstart', function () {
            startAnchor = getClone(this);
        });
        // drag move listener
        anchor.on('dragmove', function () {
            if ( updateFunction ) {
                updateFunction(shape, this);
            }
            if ( this.getLayer() ) {
                this.getLayer().draw();
            }
            else {
                console.warn("No layer to draw the anchor!");
            }
        });
        // drag end listener
        anchor.on('dragend', function () {
            var endAnchor = getClone(this);
            // store the change command
            var chgcmd = new dwv.tool.ChangeShapeCommand(
                    shape, "shape", updateFunction, startAnchor, endAnchor, app);
            chgcmd.execute();
            app.getUndoStack().add(chgcmd);
            // reset start anchor
            startAnchor = endAnchor;
        });
        // mouse down listener
        anchor.on('mousedown touchstart', function () {
            this.moveToTop();
        });
        // mouse over styling
        anchor.on('mouseover', function () {
            document.body.style.cursor = 'pointer';
            this.stroke('#ddd');
            if ( this.getLayer() ) {
                this.getLayer().draw();
            }
            else {
                console.warn("No layer to draw the anchor!");
            }
        });
        // mouse out styling
        anchor.on('mouseout', function () {
            document.body.style.cursor = 'default';
            this.stroke('#999');
            if ( this.getLayer() ) {
                this.getLayer().draw();
            }
            else {
                console.warn("No layer to draw the anchor!");
            }
        });
    }
    
    /**
     * Set the anchor off listeners.
     * @param {Object} anchor The anchor to set off.
     */
    function setAnchorOff( anchor ) {
        anchor.off('dragstart');
        anchor.off('dragmove');
        anchor.off('dragend');
        anchor.off('mousedown touchstart');
        anchor.off('mouseover');
        anchor.off('mouseout');
    }
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/**
 * Create an ellipse shape to be displayed.
 * @method EllipseCreator
 * @static
 * @param {Array} points The points from which to extract the ellipse.
 * @param {Style} style The drawing style.
 */ 
dwv.tool.EllipseCreator = function (points, style)
{
    // calculate radius
    var a = Math.abs(points[0].getX() - points[points.length-1].getX());
    var b = Math.abs(points[0].getY() - points[points.length-1].getY());
    // physical object
    var ellipse = new dwv.math.Ellipse(points[0], a, b);
    // shape
    var kellipse = new Kinetic.Ellipse({
        x: ellipse.getCenter().getX(),
        y: ellipse.getCenter().getY(),
        radius: { x: ellipse.getA(), y: ellipse.getB() },
        stroke: style.getLineColor(),
        strokeWidth: 2,
        name: "shape"
    });
    // return shape
    return kellipse;
};

/**
 * Update an ellipse shape.
 * @method UpdateEllipse
 * @static
 * @param {Object} ellipse The ellipse shape to update.
 * @param {Object} anchor The active anchor.
 */ 
dwv.tool.UpdateEllipse = function (ellipse, anchor)
{
    // parent group
    var group = anchor.getParent();
    // find special points
    var topLeft = group.find('#topLeft')[0];
    var topRight = group.find('#topRight')[0];
    var bottomRight = group.find('#bottomRight')[0];
    var bottomLeft = group.find('#bottomLeft')[0];
    // update 'self' (undo case) and special points
    switch ( anchor.id() ) {
    case 'topLeft':
        topLeft.x( anchor.x() );
        topLeft.y( anchor.y() );
        topRight.y( anchor.y() );
        bottomLeft.x( anchor.x() );
        break;
    case 'topRight':
        topRight.x( anchor.x() );
        topRight.y( anchor.y() );
        topLeft.y( anchor.y() );
        bottomRight.x( anchor.x() );
        break;
    case 'bottomRight':
        bottomRight.x( anchor.x() );
        bottomRight.y( anchor.y() );
        bottomLeft.y( anchor.y() );
        topRight.x( anchor.x() ); 
        break;
    case 'bottomLeft':
        bottomLeft.x( anchor.x() );
        bottomLeft.y( anchor.y() );
        bottomRight.y( anchor.y() );
        topLeft.x( anchor.x() ); 
        break;
    default :
        console.error('Unhandled anchor id: '+anchor.id());
        break;
    }
    // update shape
    var radiusX = ( topRight.x() - topLeft.x() ) / 2;
    var radiusY = ( bottomRight.y() - topRight.y() ) / 2;
    var center = { 'x': topLeft.x() + radiusX, 'y': topRight.y() + radiusY };
    ellipse.position( center );
    var radiusAbs = { 'x': Math.abs(radiusX), 'y': Math.abs(radiusY) };
    if ( radiusAbs ) {
        ellipse.radius( radiusAbs );
    }
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * Filter tool.
 * @class Filter
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.Filter = function(/*app*/)
{
    /**
     * Selected filter.
     * @property selectedFilter
     * @type Object
     */
    this.selectedFilter = 0;
    /**
     * Default filter name.
     * @property defaultFilterName
     * @type String
     */
    this.defaultFilterName = 0;
    
    this.displayed = false;
};

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.Filter.prototype.getHelp = function()
{
    return {
        'title': "Filter",
        'brief': "A few simple image filters are available: a Threshold filter to " +
            "limit the image intensities between a chosen minimum and maximum, " +
            "a Sharpen filter to convolute the image with a sharpen matrix, " +
            "a Sobel filter to get the gradient of the image in both directions."
    };
};

/**
 * Enable the filter.
 * @method enable
 * @param {Boolean} bool Flag to enable or not.
 */
dwv.tool.Filter.prototype.display = function(bool)
{
    dwv.gui.displayFilterHtml(bool);
    this.displayed = bool;
    // display the selected filter
    this.selectedFilter.display(bool);
};

/**
 * Get the selected filter.
 * @method getSelectedFilter
 * @return {Object} The selected filter.
 */
dwv.tool.Filter.prototype.getSelectedFilter = function() {
    return this.selectedFilter;
};

/**
 * Set the selected filter.
 * @method setSelectedFilter
 * @return {String} The name of the filter to select.
 */
dwv.tool.Filter.prototype.setSelectedFilter = function(name) {
    // check if we have it
    if( !this.hasFilter(name) )
    {
        throw new Error("Unknown filter: '" + name + "'");
    }
    // hide last selected
    if( this.displayed )
    {
        this.selectedFilter.display(false);
    }
    // enable new one
    this.selectedFilter = dwv.tool.filters[name];
    // display the selected filter
    if( this.displayed )
    {
        this.selectedFilter.display(true);
    }
};

/**
 * Check if a filter is in the filter list.
 * @method hasFilter
 * @param {String} name The name to check.
 * @return {String} The filter list element for the given name.
 */
dwv.tool.Filter.prototype.hasFilter = function(name) {
    return dwv.tool.filters[name];
};

/**
 * Initialise the filter.
 * @method init
 */
dwv.tool.Filter.prototype.init = function()
{
    // set the default to the first in the list
    for( var key in dwv.tool.filters ){
        this.defaultFilterName = key;
        break;
    }
    this.setSelectedFilter(this.defaultFilterName);
    // init all filters
    for( key in dwv.tool.filters ) {
        dwv.tool.filters[key].init();
    }    
    // init html
    dwv.gui.initFilterHtml();
};

/**
 * Handle keydown event.
 * @method keydown
 * @param {Object} event The keydown event.
 */
dwv.tool.Filter.prototype.keydown = function(event){
    app.handleKeyDown(event);
};

// Filter namespace
dwv.tool.filter = dwv.tool.filter || {};

/**
 * Threshold filter tool.
 * @class Threshold
 * @namespace dwv.tool.filter
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.filter.Threshold = function(/*app*/) {};

/**
 * Enable the filter.
 * @method enable
 * @param {Boolean} bool Flag to enable or not.
 */
dwv.tool.filter.Threshold.prototype.display = function(bool)
{
    dwv.gui.filter.displayThresholdHtml(bool);
};

dwv.tool.filter.Threshold.prototype.init = function()
{
    // init html
    dwv.gui.filter.initThresholdHtml();
};

/**
 * Run the filter.
 * @method run
 * @param {Mixed} args The filter arguments.
 */
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

/**
 * Sharpen filter tool.
 * @class Sharpen
 * @namespace dwv.tool.filter
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.filter.Sharpen = function(/*app*/) {};

/**
 * Enable the filter.
 * @method enable
 * @param {Boolean} bool Flag to enable or not.
 */
dwv.tool.filter.Sharpen.prototype.display = function(bool)
{
    dwv.gui.filter.displaySharpenHtml(bool);
};

dwv.tool.filter.Sharpen.prototype.init = function()
{
    // nothing to do...
};

/**
 * Run the filter.
 * @method run
 * @param {Mixed} args The filter arguments.
 */
dwv.tool.filter.Sharpen.prototype.run = function(/*args*/)
{
    var filter = new dwv.image.filter.Sharpen();
    var command = new dwv.tool.RunFilterCommand(filter, app);
    command.execute();
    // save command in undo stack
    app.getUndoStack().add(command);
};

/**
 * Sobel filter tool.
 * @class Sharpen
 * @namespace dwv.tool.filter
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.filter.Sobel = function(/*app*/) {};

/**
 * Enable the filter.
 * @method enable
 * @param {Boolean} bool Flag to enable or not.
 */
dwv.tool.filter.Sobel.prototype.display = function(bool)
{
    dwv.gui.filter.displaySobelHtml(bool);
};

dwv.tool.filter.Sobel.prototype.init = function()
{
    // nothing to do...
};

/**
 * Run the filter.
 * @method run
 * @param {Mixed} args The filter arguments.
 */
dwv.tool.filter.Sobel.prototype.run = function(/*args*/)
{
    var filter = new dwv.image.filter.Sobel();
    var command = new dwv.tool.RunFilterCommand(filter, app);
    command.execute();
    // save command in undo stack
    app.getUndoStack().add(command);
};

/**
 * Run filter command.
 * @class RunFilterCommand
 * @namespace dwv.tool
 * @constructor
 * @param {Object} filter The filter to run.
 * @param {Object} app The associated application.
 */
dwv.tool.RunFilterCommand = function(filter, app)
{
    /**
     * Command name.
     * @property name
     * @private
     * @type String
     */
    var name = "RunFilter: " + filter.getName();
    /**
     * Get the command name.
     * @method getName
     * @return {String} The command name.
     */
    this.getName = function() { return name; };
    /**
     * Set the command name.
     * @method setName
     * @param {String} str The command name.
     */
    this.setName = function(str) { name = str; };

    /**
     * Execute the command.
     * @method execute
     */
    this.execute = function()
    {
        app.setImage(filter.update());
        app.generateAndDrawImage();
    }; 
}; // RunFilterCommand class
;/** 
 * Info module.
 * @module info
 */
var dwv = dwv || {};
/**
 * Namespace for info functions.
 * @class info
 * @namespace dwv
 * @static
 */
dwv.info = dwv.info || {};

/**
 * Create the windowing info div.
 * @method createWindowingDiv
 * @static
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
 * Update the Top Right info div.
 * @method updateWindowingDiv
 * @static
 * @param {Object} event The windowing change event containing the new values.
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
 * Create the position info div.
 * @method createPositionDiv
 * @static
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
 * Update the position info div.
 * @method updatePositionDiv
 * @static
 * @param {Object} event The position change event containing the new values.
 * Warning: expects the position info div to exist (use after createPositionDiv).
 */
dwv.info.updatePositionDiv = function(event)
{
    // position list item
    var lipos = document.getElementById("liposinfotl");
    dwv.html.cleanNode(lipos);
    lipos.appendChild(document.createTextNode("Pos = "+event.i+", "+event.j+", "+event.k));
    // value list item
    if( event.value )
    {
        var livalue = document.getElementById("livalueinfotl");
        dwv.html.cleanNode(livalue);
        livalue.appendChild(document.createTextNode("Value = "+event.value));
    }
};

/**
 * Create the mini color map info div.
 * @method createMiniColorMap
 * @static
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
 * Update the mini color map info div.
 * @method updateMiniColorMap
 * @static
 * @param {Object} event The windowing change event containing the new values.
 * Warning: expects the mini color map div to exist (use after createMiniColorMap).
 */
dwv.info.updateMiniColorMap = function(event)
{    
    var windowCenter = event.wc;
    var windowWidth = event.ww;
    
    var canvas = document.getElementById("canvasinfobr");
    var context = canvas.getContext('2d');
    
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
    
    var index;
    for( var j=0; j<canvas.height; ++j ) {
        c = minInt;
        for( var i=0; i<canvas.width; ++i ) {
            if( c <= xMin ) {
                y = yMin;
            }
            else if( c > xMax ) {
                y = yMax;
            }
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
 * Create the plot info.
 * @method createPlot
 * @static
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
 * Update the plot markings.
 * @method updatePlotMarkings
 * @static
 * @param {Object} event The windowing change event containing the new values.
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
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/**
 * Create a line shape to be displayed.
 * @method LineCreator
 * @static
 * @param {Array} points The points from which to extract the line.
 * @param {Style} style The drawing style.
 */ 
dwv.tool.LineCreator = function (points, style)
{
    // physical object
    var line = new dwv.math.Line(points[0], points[points.length-1]);
    // shape
    var kline = new Kinetic.Line({
        points: [line.getBegin().getX(), line.getBegin().getY(), 
                 line.getEnd().getX(), line.getEnd().getY() ],
        stroke: style.getLineColor(),
        strokeWidth: 2,
        name: "shape"
    });
    // return shape
    return kline;
};

/**
 * Update a line shape.
 * @method UpdateLine
 * @static
 * @param {Object} line The line shape to update.
 * @param {Object} anchor The active anchor.
 */ 
dwv.tool.UpdateLine = function (line, anchor)
{
    // parent group
    var group = anchor.getParent();
    // find special points
    var begin = group.find('#begin')[0];
    var end = group.find('#end')[0];
    // update special points
    switch ( anchor.id() ) {
    case 'begin':
        begin.x( anchor.x() );
        begin.y( anchor.y() );
        break;
    case 'end':
        end.x( anchor.x() );
        end.y( anchor.y() );
        break;
    }
    // update shape and compensate for possible drag
    // note: shape.position() and shape.size() won't work...
    var bx = begin.x() - line.x();
    var by = begin.y() - line.y();
    var ex = end.x() - line.x();
    var ey = end.y() - line.y();
    line.points( [bx,by,ex,ey] );
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * Livewire painting tool.
 * @class Livewire
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.Livewire = function(app)
{
    /**
     * Closure to self: to be used by event handlers.
     * @property self
     * @private
     * @type WindowLevel
     */
    var self = this;
    /**
     * Interaction start flag.
     * @property started
     * @type Boolean
     */
    this.started = false;
    
    /**
     * Draw command.
     * @property command
     * @private
     * @type Object
     */
    var command = null;
    /**
     * Drawing style.
     * @property style
     * @type Style
     */
    this.style = new dwv.html.Style();
    
    /**
     * Path storage. Paths are stored in reverse order.
     * @property path
     * @private
     * @type Path
     */
    var path = new dwv.math.Path();
    /**
     * Current path storage. Paths are stored in reverse order.
     * @property currentPath
     * @private
     * @type Path
     */
    var currentPath = new dwv.math.Path();
    /**
     * List of parent points.
     * @property parentPoints
     * @private
     * @type Array
     */
    var parentPoints = [];
    /**
     * Tolerance.
     * @property tolerance
     * @private
     * @type Number
     */
    var tolerance = 5;
    
    /**
     * Clear the parent points list.
     * @method clearParentPoints
     * @private
     */
    function clearParentPoints() {
        for( var i = 0; i < app.getImage().getSize().getNumberOfRows(); ++i ) {
            parentPoints[i] = [];
        }
    }
    
    /**
     * Clear the stored paths.
     * @method clearPaths
     * @private
     */
    function clearPaths() {
        path = new dwv.math.Path();
        currentPath = new dwv.math.Path();
    }
    
    /**
     * Scissor representation.
     * @property scissors
     * @private
     * @type Scissors
     */
    var scissors = new dwv.math.Scissors();
    
    /**
     * Handle mouse down event.
     * @method mousedown
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        // first time
        if( !self.started ) {
            self.started = true;
            self.x0 = event._x;
            self.y0 = event._y;
            // clear vars
            clearPaths();
            clearParentPoints();
            // do the training from the first point
            var p = new dwv.math.FastPoint2D(event._x, event._y);
            scissors.doTraining(p);
            // add the initial point to the path
            var p0 = new dwv.math.Point2D(event._x, event._y);
            path.addPoint(p0);
            path.addControlPoint(p0);
        }
        else {
            // final point: at 'tolerance' of the initial point
            if( (Math.abs(event._x - self.x0) < tolerance) && (Math.abs(event._y - self.y0) < tolerance) ) {
                // draw
                self.mousemove(event);
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
                var pn = new dwv.math.FastPoint2D(event._x, event._y);
                scissors.doTraining(pn);
                path.addControlPoint(currentPath.getPoint(0));
            }
        }
    };

    /**
     * Handle mouse move event.
     * @method mousemove
     * @param {Object} event The mouse move event.
     */
    this.mousemove = function(event){
        if (!self.started)
        {
            return;
        }
        // set the point to find the path to
        var p = new dwv.math.FastPoint2D(event._x, event._y);
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
        app.getTempLayer().clear();
        // draw
        command.execute();
    };

    /**
     * Handle mouse up event.
     * @method mouseup
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function(/*event*/){
        // nothing to do
    };
    
    /**
     * Handle mouse out event.
     * @method mouseout
     * @param {Object} event The mouse out event.
     */
    this.mouseout = function(event){
        // treat as mouse up
        self.mouseup(event);
    };
    
    /**
     * Handle touch start event.
     * @method touchstart
     * @param {Object} event The touch start event.
     */
    this.touchstart = function(event){
        // treat as mouse down
        self.mousedown(event);
    };

    /**
     * Handle touch move event.
     * @method touchmove
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        // treat as mouse move
        self.mousemove(event);
    };

    /**
     * Handle touch end event.
     * @method touchend
     * @param {Object} event The touch end event.
     */
    this.touchend = function(event){
        // treat as mouse up
        self.mouseup(event);
    };

    /**
     * Handle key down event.
     * @method keydown
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        app.handleKeyDown(event);
    };

    /**
     * Enable the tool.
     * @method enable
     * @param {Boolean} bool The flag to enable or not.
     */
    this.display = function(bool){
        dwv.gui.displayLivewireHtml(bool);
        // TODO why twice?
        this.init();
    };

    /**
     * Initialise the tool.
     * @method init
     */
    this.init = function()
    {
        // set the default to the first in the list
        this.setLineColour(dwv.tool.colors[0]);
        // init html
        dwv.gui.initLivewireHtml();
        
        //scissors = new dwv.math.Scissors();
        scissors.setDimensions(
                app.getImage().getSize().getNumberOfColumns(),
                app.getImage().getSize().getNumberOfRows() );
        scissors.setData(app.getImageData().data);
    };
    
}; // Livewire class

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.Livewire.prototype.getHelp = function()
{
    return {
        'title': "Livewire",
        'brief': "The Livewire tool is a semi-automatic segmentation tool " +
            "that proposes to the user paths that follow intensity edges." + 
            "Click once to initialise and then move the mouse to see " + 
            "the proposed paths. Click again to build your contour. " + 
            "The process stops when you click on the first root point. " +
            "BEWARE: the process can take time!"
    };
};

/**
 * Set the line color of the drawing.
 * @method setLineColour
 * @param {String} colour The colour to set.
 */
dwv.tool.Livewire.prototype.setLineColour = function(colour)
{
    // set style var
    this.style.setLineColor(colour);
};

/**
 * Draw livewire command.
 * @class DrawLivewireCommand
 * @namespace dwv.tool
 * @param {Object} livewire The livewire to draw.
 * @param {Object} app The application to draw the livewire on.
 * @param {Object} style The style of the livewire.
 */
dwv.tool.DrawLivewireCommand = function(livewire, app, style)
{
    /**
     * The livewire color.
     * @property livewireColor
     * @private
     * @type String
     */
    var livewireColor = style.getLineColor();
    /**
     * The HTML context.
     * @property context
     * @private
     * @type Object
     */
    var context = app.getTempLayer().getContext();
    
    /**
     * Command name.
     * @property name
     * @private
     * @type String
     */
    var name = "DrawLivewireCommand";
    /**
     * Get the command name.
     * @method getName
     * @return {String} The command name.
     */
    this.getName = function() { return name; };
    /**
     * Set the command name.
     * @method setName
     * @param {String} str The command name.
     */
    this.setName = function(str) { name = str; };

    /**
     * Execute the command.
     * @method execute
     */
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
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/**
 * Create a rectangle shape to be displayed.
 * @method RectangleCreator
 * @static
 * @param {Array} points The points from which to extract the rectangle.
 * @param {Style} style The drawing style.
 */ 
dwv.tool.RectangleCreator = function (points, style)
{
    // physical shape
    var rectangle = new dwv.math.Rectangle(points[0], points[points.length-1]);
    // shape
    var krect = new Kinetic.Rect({
        x: rectangle.getBegin().getX(),
        y: rectangle.getBegin().getY(),
        width: rectangle.getWidth(),
        height: rectangle.getHeight(),
        stroke: style.getLineColor(),
        strokeWidth: 2,
        name: "shape"
    });
    // return shape
    return krect;
};

/**
 * Update a rectangle shape.
 * @method UpdateRect
 * @static
 * @param {Object} rect The rectangle shape to update.
 * @param {Object} anchor The active anchor.
 */ 
dwv.tool.UpdateRect = function (rect, anchor)
{
    // parent group
    var group = anchor.getParent();
    // find special points
    var topLeft = group.find('#topLeft')[0];
    var topRight = group.find('#topRight')[0];
    var bottomRight = group.find('#bottomRight')[0];
    var bottomLeft = group.find('#bottomLeft')[0];
    // update 'self' (undo case) and special points
    switch ( anchor.id() ) {
    case 'topLeft':
        topLeft.x( anchor.x() );
        topLeft.y( anchor.y() );
        topRight.y( anchor.y() );
        bottomLeft.x( anchor.x() );
        break;
    case 'topRight':
        topRight.x( anchor.x() );
        topRight.y( anchor.y() );
        topLeft.y( anchor.y() );
        bottomRight.x( anchor.x() );
        break;
    case 'bottomRight':
        bottomRight.x( anchor.x() );
        bottomRight.y( anchor.y() );
        bottomLeft.y( anchor.y() );
        topRight.x( anchor.x() ); 
        break;
    case 'bottomLeft':
        bottomLeft.x( anchor.x() );
        bottomLeft.y( anchor.y() );
        bottomRight.y( anchor.y() );
        topLeft.x( anchor.x() ); 
        break;
    default :
        console.error('Unhandled anchor id: '+anchor.id());
        break;
    }
    // update shape
    rect.position(topLeft.position());
    var width = topRight.x() - topLeft.x();
    var height = bottomLeft.y() - topLeft.y();
    if ( width && height ) {
        rect.size({'width': width, 'height': height});
    }
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/**
 * Create a roi shape to be displayed.
 * @method RoiCreator
 * @static
 * @param {Array} points The points from which to extract the line.
 * @param {Style} style The drawing style.
 */ 
dwv.tool.RoiCreator = function (points, style)
{
    // physical shape
    var roi = new dwv.math.ROI();
    // sample points so that they are not too close 
    // to one another
    /*if ( isFinal ) {
        var size = points.length;
        var clean = [];
        if ( size > 0 ) {
            clean.push( points[0] );
            var last = points[0];
            for ( var j = 1; j < size; ++j ) {
                var line = new dwv.math.Line( last, points[j] );
                if( line.getLength() > 2 ) {
                    clean.push( points[j] );
                    last = points[j];
                }
            }
            points = clean;
        }
    }*/
    // add input points to the ROI
    roi.addPoints(points);
    // points stored the kineticjs way
    var arr = [];
    for( var i = 1; i < roi.getLength(); ++i )
    {
        arr = arr.concat( roi.getPoint(i).getX() );
        arr = arr.concat( roi.getPoint(i).getY() );
    }
    // shape
    var kline = new Kinetic.Line({
        points: arr,
        stroke: style.getLineColor(),
        strokeWidth: 2,
        name: "shape",
        closed: true
    });
    // return shape
    return kline;
}; 

/**
 * Update a roi shape.
 * @method UpdateRoi
 * @static
 * @param {Object} line The line shape to update.
 * @param {Object} anchor The active anchor.
 */ 
dwv.tool.UpdateRoi = function (roi, anchor)
{
    // parent group
    var group = anchor.getParent();
    // update self
    var point = group.find('#'+anchor.id())[0];
    point.x( anchor.x() );
    point.y( anchor.y() );
    // update the roi point and compensate for possible drag
    // (the anchor id is the index of the point in the list)
    var points = roi.points();
    points[anchor.id()] = anchor.x() - roi.x();
    points[anchor.id()+1] = anchor.y() - roi.y();
    roi.points( points );
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
/**
 * Namespace for tool functions.
 * @class tool
 * @namespace dwv
 * @static
 */
dwv.tool = dwv.tool || {};

/**
 * Scroll class.
 * @class Scroll
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.Scroll = function(app)
{
    /**
     * Closure to self: to be used by event handlers.
     * @property self
     * @private
     * @type WindowLevel
     */
    var self = this;
    /**
     * Interaction start flag.
     * @property started
     * @type Boolean
     */
    this.started = false;

    /**
     * Handle mouse down event.
     * @method mousedown
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        self.started = true;
        // first position
        self.x0 = event._x;
        self.y0 = event._y;
    };

    /**
     * Handle mouse move event.
     * @method mousemove
     * @param {Object} event The mouse move event.
     */
    this.mousemove = function(event){
        if (!self.started) {
            return;
        }

        // difference to last position
        var diffY = event._y - self.y0;
        // do not trigger for small moves
        if( Math.abs(diffY) < 15 ) {
            return;
        }
        // update GUI
        if( diffY > 0 ) {
            app.getView().incrementSliceNb();
        }
        else {
            app.getView().decrementSliceNb();
        }
        // reset origin point
        self.x0 = event._x;
        self.y0 = event._y;
    };

    /**
     * Handle mouse up event.
     * @method mouseup
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function(/*event*/){
        if (self.started)
        {
            // stop recording
            self.started = false;
        }
    };
    
    /**
     * Handle mouse out event.
     * @method mouseout
     * @param {Object} event The mouse out event.
     */
    this.mouseout = function(event){
        self.mouseup(event);
    };

    /**
     * Handle touch start event.
     * @method touchstart
     * @param {Object} event The touch start event.
     */
    this.touchstart = function(event){
        self.mousedown(event);
    };

    /**
     * Handle touch move event.
     * @method touchmove
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        self.mousemove(event);
    };

    /**
     * Handle touch end event.
     * @method touchend
     * @param {Object} event The touch end event.
     */
    this.touchend = function(event){
        self.mouseup(event);
    };

    /**
     * Handle key down event.
     * @method keydown
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        app.handleKeyDown(event);
    };

    /**
     * Enable the tool.
     * @method enable
     * @param {Boolean} bool The flag to enable or not.
     */
    this.display = function(bool){
        dwv.gui.displayScrollHtml(bool);
    };

}; // Scroll class

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.Scroll.prototype.getHelp = function()
{
    return {
        'title': "Scroll",
        'brief': "The scroll tool allows to scroll through slices.",
        'mouse': {
            'mouse_drag': "A single vertical mouse drag changes the current slice.",
        },
        'touch': {
            'touch_drag': "A single vertical touch drag changes the current slice.",
        }
    };
};

/**
 * Initialise the tool.
 * @method init
 */
dwv.tool.Scroll.prototype.init = function() {
    // nothing to do.
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * Tool box.
 * Relies on the static variable dwv.tool.tools. The available tools 
 * of the gui will be those of this list.
 * @class ToolBox
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.ToolBox = function(/*app*/)
{
    /**
     * Selected tool.
     * @property selectedTool
     * @type Object
     */
    this.selectedTool = 0;
    /**
     * Default tool name.
     * @property defaultToolName
     * @type String
     */
    this.defaultToolName = 0;
};

/**
 * Enable the toolbox.
 * @method enable
 * @param {Boolean} bool Flag to enable or not.
 */
dwv.tool.ToolBox.prototype.display = function(bool)
{
    dwv.gui.displayToolboxHtml(bool);
};

/**
 * Get the selected tool.
 * @method getSelectedTool
 * @return {Object} The selected tool.
 */
dwv.tool.ToolBox.prototype.getSelectedTool = function() {
    return this.selectedTool;
};

/**
 * Set the selected tool.
 * @method setSelectedTool
 * @return {String} The name of the tool to select.
 */
dwv.tool.ToolBox.prototype.setSelectedTool = function(name) {
    // check if we have it
    if( !this.hasTool(name) )
    {
        throw new Error("Unknown tool: '" + name + "'");
    }
    // hide last selected
    if( this.selectedTool )
    {
        this.selectedTool.display(false);
    }
    // enable new one
    this.selectedTool = dwv.tool.tools[name];
    // display it
    this.selectedTool.display(true);
};

/**
 * Check if a tool is in the tool list.
 * @method hasTool
 * @param {String} name The name to check.
 * @return {String} The tool list element for the given name.
 */
dwv.tool.ToolBox.prototype.hasTool = function(name) {
    return dwv.tool.tools[name];
};

/**
 * Initialise the tool box.
 * @method init
 */
dwv.tool.ToolBox.prototype.init = function()
{
    // set the default to the first in the list
    for( var key in dwv.tool.tools ){
        this.defaultToolName = key;
        break;
    }
    this.setSelectedTool(this.defaultToolName);
    // init all tools
    for( key in dwv.tool.tools ) {
        dwv.tool.tools[key].init();
    }    
    // init html
    dwv.gui.initToolboxHtml();
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * UndoStack class.
 * @class UndoStack
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.UndoStack = function(app)
{ 
    /**
     * Array of commands.
     * @property stack
     * @private
     * @type Array
     */
    var stack = [];
    /**
     * Current command index.
     * @property curCmdIndex
     * @private
     * @type Number
     */
    var curCmdIndex = 0;

    /**
     * Add a command to the stack.
     * @method add
     * @param {Object} cmd The command to add.
     */
    this.add = function(cmd)
    { 
        // clear commands after current index
        stack = stack.slice(0,curCmdIndex);
        // store command
        stack.push(cmd);
        //stack[curCmdIndex] = cmd;
        // increment index
        ++curCmdIndex;
        // add command to display history
        dwv.gui.addCommandToUndoHtml(cmd.getName());
    };

    /**
     * Undo the last command. 
     * @method undo
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
            
            stack[curCmdIndex].undo();
            
            // redo from first command
            //for( var i = 0; i < curCmdIndex; ++i)
            //{
            //    stack[i].execute(); 
            //}
            // display
            if( curCmdIndex === 0 ) {
                // just draw the image
                app.generateAndDrawImage();
            }
            // disable last in display history
            dwv.gui.enableInUndoHtml(false);
        }
    }; 

    /**
     * Redo the last command.
     * @method redo
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
            // enable next in display history
            dwv.gui.enableInUndoHtml(true);
        }
    };

}; // UndoStack class
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
/**
 * Namespace for tool functions.
 * @class tool
 * @namespace dwv
 * @static
 */
dwv.tool = dwv.tool || {};

/**
 * Update the views' current position.
 * @method updatePostionValue
 * @static
 * @param {Number} i The column index.
 * @param {Number} j The row index.
 */
dwv.tool.updatePostionValue = function(i,j)
{
    app.getView().setCurrentPosition({"i": i, "j": j, "k": app.getView().getCurrentPosition().k});
};

/**
 * Update the views' windowing data.
 * @method updateWindowingData
 * @static
 * @param {Number} wc The window center.
 * @param {Number} ww The window width.
 */
dwv.tool.updateWindowingData = function(wc,ww)
{
    app.getView().setWindowLevel(wc,ww);
};

/**
 * Set the active window/level preset.
 * @method updateWindowingData
 * @param {String} name The name of the preset to set.
 */
dwv.tool.updateWindowingDataFromName = function(name)
{
    // check if we have it
    if( !dwv.tool.presets[name] ) {
        throw new Error("Unknown window level preset: '" + name + "'");
    }
    // enable it
    dwv.tool.updateWindowingData( 
        dwv.tool.presets[name].center, 
        dwv.tool.presets[name].width );
};

/**
 * Update the views' colour map.
 * @method updateColourMap
 * @static
 * @param {Object} colourMap The colour map.
 */
dwv.tool.updateColourMap = function(colourMap)
{
    app.getView().setColorMap(colourMap);
};

/**
 * Update the views' colour map.
 * @function updateColourMap
 * @param {String} name The name of the colour map to set.
 */
dwv.tool.updateColourMapFromName = function(name)
{
    // check if we have it
    if( !dwv.tool.colourMaps[name] ) {
        throw new Error("Unknown colour map: '" + name + "'");
    }
    // enable it
    dwv.tool.updateColourMap( dwv.tool.colourMaps[name] );
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
    "mediastinum": {"center": 40, "width": 400},
    "lung": {"center": -500, "width": 1500},
    "bone": {"center": 500, "width": 2000},
};
dwv.tool.defaultpresets.CTextra = {
    "brain": {"center": 40, "width": 80},
    "head": {"center": 90, "width": 350}
};

/**
 * Update the window/level presets.
 * @function updatePresets
 * @param {Boolean} full If true, shows all presets.
 */
dwv.tool.updatePresets = function(full)
{    
    // store the manual preset
    var manual = dwv.tool.presets.manual;
    // reinitialize the presets
    dwv.tool.presets = {};
    
    // DICOM presets
    var dicomPresets = app.getView().getWindowPresets();
    if( dicomPresets ) {
        if( full ) {
            for( var i = 0; i < dicomPresets.length; ++i ) {
                dwv.tool.presets[dicomPresets[i].name.toLowerCase()] = dicomPresets[i];
            }
        }
        // just the first one
        else {
            dwv.tool.presets["default"] = dicomPresets[0];
        }
    }
    
    // min/max preset
    if( full ) {
        var range = app.getImage().getRescaledDataRange();
        var width = range.max - range.min;
        var center = range.min + width/2;
        dwv.tool.presets["min/max"] = {"center": center, "width": width};
    }
    
    // default presets
    var modality = app.getImage().getMeta().Modality;
    for( var key in dwv.tool.defaultpresets[modality] ) {
        dwv.tool.presets[key] = dwv.tool.defaultpresets[modality][key];
    }
    if( full ) {
        for( var key2 in dwv.tool.defaultpresets[modality+"extra"] ) {
            dwv.tool.presets[key2] = dwv.tool.defaultpresets[modality+"extra"][key2];
        }
    }
    // manual preset
    if( manual ){
        dwv.tool.presets.manual = manual;
    }
};

/**
 * WindowLevel tool: handle window/level related events.
 * @class WindowLevel
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.WindowLevel = function(app)
{
    /**
     * Closure to self: to be used by event handlers.
     * @property self
     * @private
     * @type WindowLevel
     */
    var self = this;
    /**
     * Interaction start flag.
     * @property started
     * @type Boolean
     */
    this.started = false;

    /**
     * Handle mouse down event.
     * @method mousedown
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        // set start flag
        self.started = true;
        // store initial position
        self.x0 = event._x;
        self.y0 = event._y;
        // update GUI
        dwv.tool.updatePostionValue(event._x, event._y);
    };
    
    /**
     * Handle mouse move event.
     * @method mousemove
     * @param {Object} event The mouse move event.
     */
    this.mousemove = function(event){
        // check start flag
        if( !self.started ) {
            return;
        }
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
    
    /**
     * Handle mouse up event.
     * @method mouseup
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function(/*event*/){
        // set start flag
        if( self.started ) {
            self.started = false;
            // store the manual preset
            var windowCenter = parseInt(app.getView().getWindowLut().getCenter(), 10);
            var windowWidth = parseInt(app.getView().getWindowLut().getWidth(), 10);
            dwv.tool.presets.manual = {"center": windowCenter, "width": windowWidth};
            // update gui
            dwv.gui.initWindowLevelHtml();
            // set selected
            dwv.gui.setSelected("presetSelect", "Manual");
        }
    };
    
    /**
     * Handle mouse out event.
     * @method mouseout
     * @param {Object} event The mouse out event.
     */
    this.mouseout = function(event){
        // treat as mouse up
        self.mouseup(event);
    };
    
    /**
     * Handle touch start event.
     * @method touchstart
     * @param {Object} event The touch start event.
     */
    this.touchstart = function(event){
        self.mousedown(event);
    };
    
    /**
     * Handle touch move event.
     * @method touchmove
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        self.mousemove(event);
    };
    
    /**
     * Handle touch end event.
     * @method touchend
     * @param {Object} event The touch end event.
     */
    this.touchend = function(event){
        self.mouseup(event);
    };
    
    /**
     * Handle double click event.
     * @method dblclick
     * @param {Object} event The double click event.
     */
    this.dblclick = function(event){
        // update GUI
        dwv.tool.updateWindowingData(
            parseInt(app.getImage().getRescaledValue(event._x, event._y, app.getView().getCurrentPosition().k), 10),
            parseInt(app.getView().getWindowLut().getWidth(), 10) );    
    };
    
    /**
     * Handle key down event.
     * @method keydown
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        // let the app handle it
        app.handleKeyDown(event);
    };
    
    /**
     * Enable the tool.
     * @method enable
     * @param {Boolean} bool The flag to enable or not.
     */
    this.display = function(bool){
        if( app.getImage().getPhotometricInterpretation().match(/MONOCHROME/) !== null ) {
            dwv.gui.displayWindowLevelHtml(bool);
        }
        else {
            dwv.gui.displayWindowLevelHtml(false);
        }
    };
    
    /**
     * Initialise the tool.
     * @method init
     */
    this.init = function() {
        dwv.tool.updatePresets(true);
        dwv.gui.initWindowLevelHtml();
    };
}; // WindowLevel class

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.WindowLevel.prototype.getHelp = function()
{
    return {
        'title': "Window/Level",
        'brief': "Changes the Window and Level of the image.",
        'mouse': {
            'mouse_drag': "A single mouse drag changes the window in the horizontal direction and the level in the vertical one.",
            'double_click': "A double click will center the window and level on the clicked intensity.",
        },
        'touch': {
            'touch_drag': "A single touch drag changes the window in the horizontal direction and the level in the vertical one.",
        }
    };
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
/**
 * Namespace for tool functions.
 * @class tool
 * @namespace dwv
 * @static
 */
dwv.tool = dwv.tool || {};

/**
 * ZoomAndPan class.
 * @class ZoomAndPan
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.ZoomAndPan = function(app)
{
    /**
     * Closure to self: to be used by event handlers.
     * @property self
     * @private
     * @type WindowLevel
     */
    var self = this;
    /**
     * Interaction start flag.
     * @property started
     * @type Boolean
     */
    this.started = false;

    /**
     * Handle mouse down event.
     * @method mousedown
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        self.started = true;
        // first position
        self.x0 = event._xs;
        self.y0 = event._ys;
    };

    /**
     * Handle two touch down event.
     * @method twotouchdown
     * @param {Object} event The touch down event.
     */
    this.twotouchdown = function(event){
        self.started = true;
        // store first point
        self.x0 = event._x;
        self.y0 = event._y;
        // first line
        var point0 = new dwv.math.Point2D(event._x, event._y);
        var point1 = new dwv.math.Point2D(event._x1, event._y1);
        self.line0 = new dwv.math.Line(point0, point1);
        self.midPoint = self.line0.getMidpoint();         
    };

    /**
     * Handle mouse move event.
     * @method mousemove
     * @param {Object} event The mouse move event.
     */
    this.mousemove = function(event){
        if (!self.started)
        {
            return;
        }

        // calculate translation
        var tx = (event._xs - self.x0);
        var ty = (event._ys - self.y0);
        // apply translation
        translateLayers(tx, ty);
        
        // reset origin point
        self.x0 = event._xs;
        self.y0 = event._ys;
    };

    /**
     * Handle two touch move event.
     * @method twotouchmove
     * @param {Object} event The touch move event.
     */
    this.twotouchmove = function(event){
        if (!self.started)
        {
            return;
        }
        var point0 = new dwv.math.Point2D(event._x, event._y);
        var point1 = new dwv.math.Point2D(event._x1, event._y1);
        var newLine = new dwv.math.Line(point0, point1);
        var lineRatio = newLine.getLength() / self.line0.getLength();
        
        if( lineRatio === 1 )
        {
            // scroll mode
            // difference  to last position
            var diffY = event._y - self.y0;
            // do not trigger for small moves
            if( Math.abs(diffY) < 15 ) {
                return;
            }
            // update GUI
            if( diffY > 0 ) {
                app.getView().incrementSliceNb();
            }
            else {
                app.getView().decrementSliceNb();
            }
        }
        else
        {
            // zoom mode
            var zoom = (lineRatio - 1) / 2;
            if( Math.abs(zoom) % 0.1 <= 0.05 ) {
                zoomLayers(zoom, self.midPoint.getX(), self.midPoint.getY(),event._xs, event._ys);
            }
        }
    };
    
    /**
     * Handle mouse up event.
     * @method mouseup
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function(/*event*/){
        if (self.started)
        {
            // stop recording
            self.started = false;
        }
    };
    
    /**
     * Handle mouse out event.
     * @method mouseout
     * @param {Object} event The mouse out event.
     */
    this.mouseout = function(event){
        self.mouseup(event);
    };

    /**
     * Handle touch start event.
     * @method touchstart
     * @param {Object} event The touch start event.
     */
    this.touchstart = function(event){
        var touches = event.targetTouches;
        if( touches.length === 1 ){
            self.mousedown(event);
        }
        else if( touches.length === 2 ){
            self.twotouchdown(event);
        }
    };

    /**
     * Handle touch move event.
     * @method touchmove
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        var touches = event.targetTouches;
        if( touches.length === 1 ){
            self.mousemove(event);
        }
        else if( touches.length === 2 ){
            self.twotouchmove(event);
        }
    };

    /**
     * Handle touch end event.
     * @method touchend
     * @param {Object} event The touch end event.
     */
    this.touchend = function(event){
        self.mouseup(event);
    };

    /**
     * Handle mouse scroll event (fired by Firefox).
     * @method DOMMouseScroll
     * @param {Object} event The mouse scroll event.
     */
    this.DOMMouseScroll = function(event){
        // ev.detail on firefox is 3
        var step = event.detail/30;
        zoomLayers(step, event._x, event._y,event._xs, event._ys);
        
        // TODO slice scroll
        //if( event.detail > 0 ) app.getView().incrementSliceNb();
        //else app.getView().decrementSliceNb();
    };

    /**
     * Handle mouse wheel event.
     * @method mousewheel
     * @param {Object} event The mouse wheel event.
     */
    this.mousewheel = function(event){
        // ev.wheelDelta on chrome is 120
        var step = event.wheelDelta/1200;
        zoomLayers(step, event._x, event._y,event._xs, event._ys);
        
        // TODO slice scroll
        //if( event.wheelDelta > 0 ) app.getView().incrementSliceNb();
        //else app.getView().decrementSliceNb();
    };
    
    /**
     * Handle key down event.
     * @method keydown
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        app.handleKeyDown(event);
    };

    /**
     * Enable the tool.
     * @method enable
     * @param {Boolean} bool The flag to enable or not.
     */
    this.display = function(bool){
        dwv.gui.displayZoomAndPanHtml(bool);
    };

    /**
     * Apply the zoom to the layers.
     * @method zoomLayers
     * @param {Number} step The zoom step increment. A good step is of 0.1.
     * @param {Number} cx The zoom center X coordinate.
     * @param {Number} cy The zoom center Y coordinate.
     */ 
    function zoomLayers(step, cx, cy, cx2, cy2)
    {
        if( app.getImageLayer() ) {
            var oldZoom = app.getImageLayer().getZoom();
            var newZoom = {'x': (oldZoom.x + step), 'y': (oldZoom.y + step)};
            app.getImageLayer().zoom(newZoom.x, newZoom.y, cx2, cy2);
            app.getImageLayer().draw();
        }
        if( app.getKineticStage() ) { 
            
            var stage = app.getKineticStage();
            var oldKZoom = stage.scale();
            var newKZoom = {'x': (oldKZoom.x + step), 'y': (oldKZoom.y + step)};
            
            var oldOffset = stage.offset();
            var newOffsetX = (cx2 / oldKZoom.x) + oldOffset.x - (cx2 / newKZoom.x);
            var newOffsetY = (cy2 / oldKZoom.y) + oldOffset.y - (cy2 / newKZoom.y);
            var newOffset = { 'x': newOffsetX, 'y': newOffsetY };
            
            stage.offset( newOffset );
            stage.scale( newKZoom );
            stage.draw();
        }
    }

    /**
     * Apply a translation to the layers.
     * @method translateLayers
     * @param {Number} tx The translation along X.
     * @param {Number} ty The translation along Y.
     */ 
    function translateLayers(tx, ty)
    {
        if( app.getImageLayer() ) {
            app.getImageLayer().translate(tx, ty);
            app.getImageLayer().draw();
        }
        if( app.getKineticStage() ) { 
            var stage = app.getKineticStage();
            var offset = stage.offset();
            offset.x -= tx;
            offset.y -= ty;
            stage.offset( offset );
            stage.draw();
        }
    }

}; // ZoomAndPan class

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.ZoomAndPan.prototype.getHelp = function()
{
    return {
        'title': "Zoom/Pan",
        'brief': "The Zoom/Pan tool allows to zoom and pan the image.",
        'mouse': {
            'mouse_wheel': "The mouse wheel is used to zoom the image.",
            'mouse_drag': "A single mouse drag drags the image in the desired direction."
        },
        'touch': {
            'twotouch_pinch': "A pinch in or out allows to zoom the image.",
            'touch_drag': "A single touch drag drags the image in the desired direction."
        }
    };
};

/**
 * Initialise the tool.
 * @method init
 */
dwv.tool.ZoomAndPan.prototype.init = function() {
    // nothing to do.
};;/** 
 * Utility module.
 * @module utils
 */
var dwv = dwv || {};
/**
 * Namespace for utility functions.
 * @class utils
 * @namespace dwv
 * @static
 */
dwv.utils = dwv.utils || {};

/**
 * Capitalise the first letter of a string.
 * @method capitaliseFirstLetter
 * @static
 * @param {String} string The string to capitalise the first letter.
 * @return {String} The new string.
 */
dwv.utils.capitaliseFirstLetter = function(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Clean string: trim and remove ending.
 * @method cleanString
 * @static
 * @param {String} string The string to clean.
 * @return {String} The cleaned string.
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
 * Split query string:
 *  'root?key0=val00&key0=val01&key1=val10' returns 
 *  { base : root, query : [ key0 : [val00, val01], key1 : val1 ] }
 * Returns null if not a query string (no question mark).
 * @method splitQueryString
 * @static
 * @param {String} inputStr The string to split.
 * @return {Object} The split string.
 */
dwv.utils.splitQueryString = function(inputStr)
{
    // check if query string
    if( inputStr.indexOf('?') === -1 ) {
        return null;
    }
    // result
    var result = {};
    // base
    result.base = inputStr.substr(0, inputStr.indexOf('?'));
    // take after the '?'
    var query = inputStr.substr(inputStr.indexOf('?')+1);
    // split key/value pairs
    result.query = dwv.utils.splitKeyValueString(query);
    // return
    return result;
};

/**
 * Split key/value string:
 *  key0=val00&key0=val01&key1=val10 returns 
*   { key0 : [val00, val01], key1 : val1 }
 * @method splitKeyValueString
 * @static
 * @param {String} inputStr The string to split.
 * @return {Object} The split string.
 */
dwv.utils.splitKeyValueString = function(inputStr)
{
    // result
    var result = {};
    // split key/value pairs
    var pairs = inputStr.split('&');
    for( var i = 0; i < pairs.length; ++i )
    {
        var pair = pairs[i].split('=');
        // if the key does not exist, create it
        if( !result[pair[0]] ) 
        {
            result[pair[0]] = pair[1];
        }
        else
        {
            // make it an array
            if( !( result[pair[0]] instanceof Array) ) {
                result[pair[0]] = [result[pair[0]]];
            }
            result[pair[0]].push(pair[1]);
        }
    }
    return result;
};
