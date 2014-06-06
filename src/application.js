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
                var zoom = self.getImageLayer().getZoom().x;
                // store
                event._x = touch.pageX - parseInt(app.getImageLayer().getOffset().left, 10);
                event._xs = event._x;
                event._x = parseInt( (event._x / zoom), 10 );
                event._y = touch.pageY - parseInt(app.getImageLayer().getOffset().top, 10);
                event._ys = event._y;
                event._y = parseInt( (event._y / zoom), 10 );
                // second finger
                if (touches.length === 2) {
                    touch = touches[1];
                    // store
                    event._x1 = touch.pageX - parseInt(app.getImageLayer().getOffset().left, 10);
                    event._x1 = parseInt( (event._x1 / zoom), 10 );
                    event._y1 = touch.pageY - parseInt(app.getImageLayer().getOffset().top, 10);
                    event._y1 = parseInt( (event._y1 / zoom), 10 );
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
