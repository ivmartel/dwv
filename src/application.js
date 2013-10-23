// Main DWV namespace.
var dwv = dwv || {};
 
/**
 * Main application class.
 * @class App
 * @namespace dwv
 * @constructor
 * @param {Boolean} mobile Handle mobile or not.
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
     * Get the draw layer.
     * @method getDrawLayer
     * @return {Object} The draw layer.
     */
    this.getDrawLayer = function() { return drawLayer; };
    /** 
     * Get the temporary layer.
     * @method getTempLayer
     * @return {Object} The temporary layer.
     */
    this.getTempLayer = function() { return tempLayer; };

    /** 
     * Get the undo stack.
     * @method getUndoStack
     * @return {Object} The undo stack.
     */
    this.getUndoStack = function() { return undoStack; };

    /** 
     * Get the mobile flag.
     * @method isMobile
     * @return {Boolean} The mobile flag.
     */
    this.isMobile = function() { return mobile; };

    /**
     * Initialise the HTML for the application.
     * @method init
     */
    this.init = function()
    {
        // bind open files with method
        var fileElement = document.getElementById('imagefiles');
        if( fileElement ) fileElement.addEventListener('change', this.onChangeFiles, false);
        var urlElement = document.getElementById('imageurl');
        if( urlElement ) urlElement.addEventListener('change', this.onChangeURL, false);
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
        // adapt the size of the layer container
        var mainWidth = 0;
        var mainHeight = 0;
        if( mobile ) {
            mainWidth = $(window).width();
            mainHeight = $(window).height() - 147;
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
     * Set the layers zoom. To be called once the image is loaded.
     * @method setLayersZoom
     * @param {Number} zoomX The zoom in the X direction.
     * @param {Number} zoomY The zoom in the Y direction.
     * @param {Number} cx The zoom center X coordinate.
     * @param {Number} cy The zoom center Y coordinate.
     */
    this.setLayersZoom = function(zoomX,zoomY,cx,cy)
    {
        if( imageLayer ) imageLayer.zoom(zoomX,zoomY,cx,cy);
        if( drawLayer ) drawLayer.zoom(zoomX,zoomY,cx,cy);
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
            isInfoLayerListening = false;
        }
        else {
            addImageInfoListeners();
            isInfoLayerListening = true;
        }
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
     * Handle an error: display it to the user.
     * @method handleError
     * @private
     * @param {Object} error The error to handle.
     */
    function handleError(error)
    {
        if( error.name && error.message) alert(error.name+": "+error.message+".");
        else alert("Error: "+error+".");
        if( error.stack ) console.log(error.stack);
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
     * Create the DICOM tags table. To be called once the DICOM has been parsed.
     * @method createTagsTable
     * @private
     * @param {Object} dataInfo The data information.
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
     * Post load application initialisation. To be called once the DICOM has been parsed.
     * @method postLoadInit
     * @private
     * @param {Object} data The data to display.
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
