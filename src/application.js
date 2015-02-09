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
    // View
    var view = null;
    // Original image
    var originalImage = null;
    // Image data array
    var imageData = null;
    // Image data width
    var dataWidth = 0;
    // Image data height
    var dataHeight = 0;

    // display window scale
    var windowScale = 1;
    
    var containerDivId = null;
    this.getContainerDivId = function () { return containerDivId; };
    
    this.presets = {};
    this.getPresets = function () { return this.presets; };
    
    var toolboxController = null;
    this.getToolboxController = function () { return toolboxController; };

    var viewController = null;
    this.getViewController = function () { return viewController; };
     
    var plotInfo = null;
    var windowingInfo = null;
    var positionInfo = null;
    var miniColorMap = null; 
    
    var tagsGui = null;
    
    // Image layer
    var imageLayer = null;
    // Draw layers
    var drawLayers = [];
    // Draw stage
    var drawStage = null;
    
    // flag to know if the info layer is listening on the image.
    var isInfoLayerListening = false;
    
    // Toolbox
    var toolbox = null;
    var loadbox = null;
    // UndoStack
    var undoStack = null;
    
    /** 
     * Get the version of the application.
     * @method getVersion
     * @return {String} The version of the application.
     */
    this.getVersion = function() { return "v0.9.0beta"; };
    
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
     * Get the toolbox.
     * @method getToolbox
     * @return {Object} The associated toolbox.
     */
    this.getToolbox = function() { return toolbox; };

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
    this.getDrawLayer = function() { 
        return drawLayers[view.getCurrentPosition().k];
    };
    /** 
     * Get the draw stage.
     * @method getDrawStage
     * @return {Object} The draw layer.
     */
    this.getDrawStage = function() { return drawStage; };

    /** 
     * Get the undo stack.
     * @method getUndoStack
     * @return {Object} The undo stack.
     */
    this.getUndoStack = function() { return undoStack; };

    this.getLoaders = function () 
    {
        return {
            'file': dwv.io.File,
            'url': dwv.io.Url
        };        
    };
    
    /**
     * Initialise the HTML for the application.
     * @method init
     */
    this.init = function ( config ) {
        containerDivId = config.containerDivId;
        // tools
        if ( config.tools && config.tools.length !== 0 ) {
            // setup the tool list
            var toolList = {};
            for ( var t = 0; t < config.tools.length; ++t ) {
                switch( config.tools[t] ) {
                case "Window/Level":
                    toolList["Window/Level"] = new dwv.tool.WindowLevel(this);
                    break;
                case "Zoom/Pan":
                    toolList["Zoom/Pan"] = new dwv.tool.ZoomAndPan(this);
                    break;
                case "Scroll":
                    toolList.Scroll = new dwv.tool.Scroll(this);
                    break;
                case "Draw":
                    if ( config.shapes !== 0 ) {
                        // setup the shape list
                        var shapeList = {};
                        for ( var s = 0; s < config.shapes.length; ++s ) {
                            switch( config.shapes[s] ) {
                            case "Line":
                                shapeList.Line = dwv.tool.LineFactory;
                                break;
                            case "Protractor":
                                shapeList.Protractor = dwv.tool.ProtractorFactory;
                                break;
                            case "Rectangle":
                                shapeList.Rectangle = dwv.tool.RectangleFactory;
                                break;
                            case "Roi":
                                shapeList.Roi = dwv.tool.RoiFactory;
                                break;
                            case "Ellipse":
                                shapeList.Ellipse = dwv.tool.EllipseFactory;
                                break;
                            }
                        }
                        toolList.Draw = new dwv.tool.Draw(this, shapeList);
                    }
                    break;
                case "Livewire":
                    toolList.Livewire = new dwv.tool.Livewire(this);
                    break;
                case "Filter":
                    if ( config.filters.length !== 0 ) {
                        // setup the filter list
                        var filterList = {};
                        for ( var f = 0; f < config.filters.length; ++f ) {
                            switch( config.filters[f] ) {
                            case "Threshold":
                                filterList.Threshold = new dwv.tool.filter.Threshold(this);
                                break;
                            case "Sharpen":
                                filterList.Sharpen = new dwv.tool.filter.Sharpen(this);
                                break;
                            case "Sobel":
                                filterList.Sobel = new dwv.tool.filter.Sobel(this);
                                break;
                            }
                        }
                        toolList.Filter = new dwv.tool.Filter(filterList, this);
                    }
                    break;
                default:
                    throw new Error("Unknown tool: '" + config.tools[t] + "'");
                }
            }
            toolbox = new dwv.tool.Toolbox(toolList, this);
            toolboxController = new dwv.ToolboxController(toolbox);
        }
        // gui
        if ( config.gui ) {
            // tools
            if ( config.gui.indexOf("tool") !== -1 && toolbox) {
                toolbox.setup();
            }
            // load
            if ( config.gui.indexOf("load") !== -1 ) {
                var fileLoadGui = new dwv.gui.FileLoad(this);
                var urlLoadGui = new dwv.gui.UrlLoad(this);
                loadbox = new dwv.gui.Loadbox(this, fileLoadGui, urlLoadGui);
                loadbox.setup();
                fileLoadGui.setup();
                urlLoadGui.setup();
                fileLoadGui.display(true);
                urlLoadGui.display(false);
            }
            // undo
            if ( config.gui.indexOf("undo") !== -1 ) {
                undoStack = new dwv.tool.UndoStack();
                undoStack.setup();
            }
            // DICOM Tags
            if ( config.gui.indexOf("tags") !== -1 ) {
                tagsGui = new dwv.gui.DicomTags();
            }
            // version number
            if ( config.gui.indexOf("version") !== -1 ) {
                dwv.gui.appendVersionHtml(this.getVersion());
            }
            // help
            if ( config.gui.indexOf("help") !== -1 ) {
                var isMobile = true;
                if ( config.isMobile ) {
                    isMobile = config.isMobile;
                }
                dwv.gui.appendHelpHtml( toolbox.getToolList(), isMobile );
            }
        }
        
        // listen to drag&drop
        var dropBoxDivId = containerDivId + "-dropBox";
        var box = document.getElementById(dropBoxDivId);
        if ( box ) {
            box.addEventListener("dragover", onDragOver);
            box.addEventListener("dragleave", onDragLeave);
            box.addEventListener("drop", onDrop);
            // initial size
            var size = dwv.gui.getWindowSize();
            var dropBoxSize = 2 * size.height / 3;
            $("#"+dropBoxDivId).height( dropBoxSize );
            $("#"+dropBoxDivId).width( dropBoxSize );
        }
        // possible load from URL
        if( typeof config.skipLoadUrl === "undefined" ) {
            var inputUrls = dwv.html.getUriParam(); 
            if( inputUrls && inputUrls.length > 0 ) {
                this.loadURL(inputUrls);
            }
        }
        else{
            console.log("Not loading url from adress since skipLoadUrl is defined.");
        }
        // align layers when the window is resized
        if ( config.fitToWindow ) {
            window.onresize = this.onResize;
        }
    };
    
    /**
     * Reset the application.
     * @method reset
     */
    this.reset = function()
    {
        // clear tools
        if ( toolbox ) {
            toolbox.reset();
        }
        // clear draw
        if ( drawStage ) {
            drawLayers = [];
        }
        // clear objects
        image = null;
        view = null;
        // reset undo/redo
        if ( undoStack ) {
            undoStack = new dwv.tool.UndoStack();
            undoStack.initialise();
        }
    };
    
    /**
     * Reset the layout of the application.
     * @method resetLayout
     */
    this.resetLayout = function () {
        if ( imageLayer ) {
            imageLayer.resetLayout(windowScale);
            imageLayer.draw();
        }
        if ( drawStage ) {
            drawStage.offset( {'x': 0, 'y': 0} );
            drawStage.scale( {'x': windowScale, 'y': windowScale} );
            drawStage.draw();
        }
    };
    
    /**
     * Handle key down event.
     * - CRTL-Z: undo
     * - CRTL-Y: redo
     * Default behavior. Usually used in tools. 
     * @method onKeydown
     * @param {Object} event The key down event.
     */
    this.onKeydown = function(event)
    {
        if( event.keyCode === 90 && event.ctrlKey ) // ctrl-z
        {
            undoStack.undo();
        }
        else if( event.keyCode === 89 && event.ctrlKey ) // ctrl-y
        {
            undoStack.redo();
        }
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
        fileIO.onload = function (data) {
            var isFirst = true;
            if( image ) {
                image.appendSlice( data.view.getImage() );
                isFirst = false;
            }
            postLoadInit(data);
            if( drawStage ) {
                // create slice draw layer
                var drawLayer = new Kinetic.Layer({
                    listening: false,
                    hitGraphEnabled: false,
                    visible: isFirst
                });
                // add to layers array
                drawLayers.push(drawLayer);
                // add the layer to the stage
                drawStage.add(drawLayer);
            }
        };
        fileIO.onerror = function(error){ handleError(error); };
        // main load (asynchronous)
        fileIO.load(files);
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
        urlIO.onload = function (data) {
            var isFirst = true;
            if( image ) {
                image.appendSlice( data.view.getImage() );
                isFirst = false;
            }
            postLoadInit(data);
            if( drawStage ) {
                // create slice draw layer
                var drawLayer = new Kinetic.Layer({
                    listening: false,
                    hitGraphEnabled: false,
                    visible: isFirst
                });
                // add to layers array
                drawLayers.push(drawLayer);
                // add the layer to the stage
                drawStage.add(drawLayer);
            }
        };
        urlIO.onerror = function(error){ handleError(error); };
        // main load (asynchronous)
        urlIO.load(urls);
    };
    
    /**
     * Handle window/level change.
     * @method onWLChange
     * @param {Object} event The event fired when changing the window/level.
     */
    this.onWLChange = function (/*event*/)
    {         
        generateAndDrawImage();
    };

    /**
     * Handle color map change.
     * @method onColorChange
     * @param {Object} event The event fired when changing the color map.
     */
    this.onColorChange = function (/*event*/)
    {  
        generateAndDrawImage();
    };

    /**
     * Handle slice change.
     * @method onSliceChange
     * @param {Object} event The event fired when changing the slice.
     */
    this.onSliceChange = function (/*event*/)
    {   
        generateAndDrawImage();
        if ( drawStage ) {
            // hide all draw layers
            for ( var i = 0; i < drawLayers.length; ++i ) {
                drawLayers[i].visible( false );
            }
            // show current draw layer
            var currentLayer = drawLayers[view.getCurrentPosition().k];
            currentLayer.visible( true );
            currentLayer.draw();
        }
    };

    /**
     * Fit the display to the given size. To be called once the image is loaded.
     * @method fitToSize
     */
    this.fitToSize = function (size)
    {
        // previous width
        var oldWidth = parseInt(windowScale*dataWidth, 10);
        // find new best fit
        windowScale = Math.min( (size.width / dataWidth), (size.height / dataHeight) );
        // new sizes
        var newWidth = parseInt(windowScale*dataWidth, 10);
        var newHeight = parseInt(windowScale*dataHeight, 10);
        // ratio previous/new to add to zoom
        var mul = newWidth / oldWidth;

        // resize container
        var jqDivId = "#"+containerDivId;
        $(jqDivId).width(newWidth);
        $(jqDivId).height(newHeight + 1); // +1 to be sure...
        // resize image layer
        if( imageLayer ) {
            var iZoomX = imageLayer.getZoom().x * mul;
            var iZoomY = imageLayer.getZoom().y * mul;
            imageLayer.setWidth(newWidth);
            imageLayer.setHeight(newHeight);
            imageLayer.zoom(iZoomX, iZoomY, 0, 0);
            imageLayer.draw();
        }
        // resize draw stage
        if( drawStage ) {
            // resize div
            var drawDivId = "#" + containerDivId + "-drawDiv";
            $(drawDivId).width(newWidth);
            $(drawDivId).height(newHeight);
            // resize stage
            var stageZomX = drawStage.scale().x * mul;
            var stageZoomY = drawStage.scale().y * mul;
            drawStage.setWidth(newWidth);
            drawStage.setHeight(newHeight);
            drawStage.scale( {x: stageZomX, y: stageZoomY} );
            drawStage.draw();
        }
    };
    
    /**
     * Toggle the display of the information layer.
     * @method toggleInfoLayerDisplay
     */
    this.toggleInfoLayerDisplay = function()
    {
        // toggle html
        var infoDivId = containerDivId + "-infoLayer";
        dwv.html.toggleDisplay(infoDivId);
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
        var keys = Object.keys(this.presets);
        viewController.setWindowLevel(
            this.presets[keys[0]].center, 
            this.presets[keys[0]].width );
        // default position
        this.setCurrentPostion(0,0);
    };

    /**
     * Add layer mouse and touch listeners.
     * @method addLayerListeners
     */
    this.addLayerListeners = function(layer)
    {
        // allow pointer events
        layer.setAttribute("style", "pointer-events: auto;");
        // mouse listeners
        layer.addEventListener("mousedown", eventHandler);
        layer.addEventListener("mousemove", eventHandler);
        layer.addEventListener("mouseup", eventHandler);
        layer.addEventListener("mouseout", eventHandler);
        layer.addEventListener("mousewheel", eventHandler);
        layer.addEventListener("DOMMouseScroll", eventHandler);
        layer.addEventListener("dblclick", eventHandler);
        // touch listeners
        layer.addEventListener("touchstart", eventHandler);
        layer.addEventListener("touchmove", eventHandler);
        layer.addEventListener("touchend", eventHandler);
    };
    
    /**
     * Remove layer mouse and touch listeners.
     * @method removeLayerListeners
     */
    this.removeLayerListeners = function(layer)
    {
        // disable pointer events
        layer.setAttribute("style", "pointer-events: none;");
        // mouse listeners
        layer.removeEventListener("mousedown", eventHandler);
        layer.removeEventListener("mousemove", eventHandler);
        layer.removeEventListener("mouseup", eventHandler);
        layer.removeEventListener("mouseout", eventHandler);
        layer.removeEventListener("mousewheel", eventHandler);
        layer.removeEventListener("DOMMouseScroll", eventHandler);
        layer.removeEventListener("dblclick", eventHandler);
        // touch listeners
        layer.removeEventListener("touchstart", eventHandler);
        layer.removeEventListener("touchmove", eventHandler);
        layer.removeEventListener("touchend", eventHandler);
    };
    
    /**
     * Render the current image.
     * @method render
     */
    this.render = function ()
    {
        generateAndDrawImage();
    };
    
    /**
     * Update the window/level presets.
     * @function updatePresets
     * @param {Boolean} full If true, shows all presets.
     */
    this.updatePresets = function (full)
    {    
        // store the manual preset
        var manual = null;
        if ( this.presets ) {
            manual = this.presets.manual;
        }
        // reinitialize the presets
        this.presets = {};
        
        // DICOM presets
        var dicomPresets = this.getView().getWindowPresets();
        if( dicomPresets ) {
            if( full ) {
                for( var i = 0; i < dicomPresets.length; ++i ) {
                    this.presets[dicomPresets[i].name.toLowerCase()] = dicomPresets[i];
                }
            }
            // just the first one
            else {
                this.presets["default"] = dicomPresets[0];
            }
        }
        
        // default presets
        var modality = this.getImage().getMeta().Modality;
        for( var key in dwv.tool.defaultpresets[modality] ) {
            this.presets[key] = dwv.tool.defaultpresets[modality][key];
        }
        if( full ) {
            for( var key2 in dwv.tool.defaultpresets[modality+"extra"] ) {
                this.presets[key2] = dwv.tool.defaultpresets[modality+"extra"][key2];
            }
        }
        // min/max preset
        var range = this.getImage().getRescaledDataRange();
        var width = range.max - range.min;
        var center = range.min + width/2;
        this.presets["min/max"] = {"center": center, "width": width};
        // manual preset
        if( manual ){
            this.presets.manual = manual;
        }
    };

    // Controller Methods -----------------------------------------------------------

    /**
     * Handle resize.
     * Fit the display to the window. To be called once the image is loaded.
     * @method onResize
     * @param {Object} event The change event.
     */
    this.onResize = function (/*event*/)
    {
        self.fitToSize(dwv.gui.getWindowSize());
    };
    
    /**
     * Handle zoom reset.
     * @method onZoomReset
     * @param {Object} event The change event.
     */
    this.onZoomReset = function (/*event*/)
    {
        self.resetLayout();
    };

    /**
     * Handle loader change.
     * @method onChangeLoader
     * @param {Object} event The change event.
     */
    this.onChangeLoader = function (/*event*/)
    {
        loadbox.displayLoader( this.value );
    };

    /**
     * Handle change url event.
     * @method onChangeURL
     * @param {Object} event The event fired when changing the url field.
     */
    this.onChangeURL = function (event)
    {
        self.loadURL([event.target.value]);
    };

    /**
     * Handle change files event.
     * @method onChangeFiles
     * @param {Object} event The event fired when changing the file field.
     */
    this.onChangeFiles = function (event)
    {
        self.loadFiles(event.target.files);
    };

    /**
     * Set the current position.
     * @method setCurrentPostion
     * @param {Number} i The column index.
     * @param {Number} j The row index.
     */
    this.setCurrentPostion = function (i,j)
    {
        viewController.setCurrentPosition(i,j);
    };

    /**
     * Handle colour map change.
     * @method onChangeColourMap
     * @param {Object} event The change event.
     */
    this.onChangeColourMap = function (/*event*/)
    {
        viewController.setColourMapFromName(this.value);
    };

    /**
     * Handle window/level preset change.
     * @method onChangeWindowLevelPreset
     * @param {Object} event The change event.
     */
    this.onChangeWindowLevelPreset = function (/*event*/)
    {
        var name = this.value;
        // check if we have it
        if( !self.presets[name] ) {
            throw new Error("Unknown window level preset: '" + name + "'");
        }
        // enable it
        viewController.setWindowLevel( 
            self.presets[name].center, 
            self.presets[name].width );
    };

    /**
     * Handle tool change.
     * @method onChangeTool
     * @param {Object} event The change event.
     */
    this.onChangeTool = function (/*event*/)
    {
        toolboxController.setSelectedTool(this.value);
    };

    /**
     * Handle shape change.
     * @method onChangeShape
     * @param {Object} event The change event.
     */
    this.onChangeShape = function (/*event*/)
    {
        toolboxController.setSelectedShape(this.value);
    };

    /**
     * Handle filter change.
     * @method onChangeFilter
     * @param {Object} event The change event.
     */
    this.onChangeFilter = function (/*event*/)
    {
        toolboxController.setSelectedFilter(this.value);
    };

    /**
     * Handle filter run.
     * @method onRunFilter
     * @param {Object} event The run event.
     */
    this.onRunFilter = function (/*event*/)
    {
        toolboxController.runSelectedFilter();
    };

    /**
     * Handle line colour change.
     * @method onChangeLineColour
     * @param {Object} event The change event.
     */
    this.onChangeLineColour = function (/*event*/)
    {
        toolboxController.setLineColour(this.value);
    };

    /**
     * Handle min/max slider change.
     * @method onChangeMinMax
     * @param {Object} range The new range of the data.
     */
    this.onChangeMinMax = function (range)
    {
        toolboxController.setRange(range);
    };

    /**
     * Handle undo.
     * @method onUndo
     * @param {Object} event The associated event.
     */
    this.onUndo = function (/*event*/)
    {
        undoStack.undo();
    };

    /**
     * Handle redo.
     * @method onRedo
     * @param {Object} event The associated event.
     */
    this.onRedo = function (/*event*/)
    {
        undoStack.redo();
    };

    /**
     * Handle toggle of info layer.
     * @method onToggleInfoLayer
     * @param {Object} event The associated event.
     */
    this.onToggleInfoLayer = function (/*event*/)
    {
        self.toggleInfoLayerDisplay();
    };
    
    /**
     * Handle display reset.
     * @method onDisplayReset
     * @param {Object} event The change event.
     */
    this.onDisplayReset = function (/*event*/)
    {
        self.resetLayout();
        self.initWLDisplay();
        // update preset select
        var select = document.getElementById("presetSelect");
        select.selectedIndex = 0;
        dwv.gui.refreshSelect("#presetSelect");
    };

    // Private Methods -----------------------------------------------------------

    /**
     * Generate the image data and draw it.
     * @method generateAndDrawImage
     */
    function generateAndDrawImage()
    {         
        // generate image data from DICOM
        view.generateImageData(imageData);         
        // set the image data of the layer
        imageLayer.setImageData(imageData);
        // draw the image
        imageLayer.draw();
    }
    
    /**
     * Add image listeners.
     * @method addImageInfoListeners
     * @private
     */
    function addImageInfoListeners()
    {
        view.addEventListener("wlchange", windowingInfo.update);
        view.addEventListener("wlchange", miniColorMap.update);
        view.addEventListener("wlchange", plotInfo.update);
        view.addEventListener("colorchange", miniColorMap.update);
        view.addEventListener("positionchange", positionInfo.update);
        isInfoLayerListening = true;
    }
    
    /**
     * Remove image listeners.
     * @method removeImageInfoListeners
     * @private
     */
    function removeImageInfoListeners()
    {
        view.removeEventListener("wlchange", windowingInfo.update);
        view.removeEventListener("wlchange", miniColorMap.update);
        view.removeEventListener("wlchange", plotInfo.update);
        view.removeEventListener("colorchange", miniColorMap.update);
        view.removeEventListener("positionchange", positionInfo.update);
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
        var offsets = null;
        var position = null;
        if( event.type === "touchstart" ||
            event.type === "touchmove")
        {
            event.preventDefault();
            // event offset(s)
            offsets = dwv.html.getEventOffset(event);
            // should have at least one offset
            event._xs = offsets[0].x;
            event._ys = offsets[0].y;
            position = self.getImageLayer().displayToIndex( offsets[0] );
            event._x = parseInt( position.x, 10 );
            event._y = parseInt( position.y, 10 );
            // possible second
            if ( offsets.length === 2 ) {
                event._x1s = offsets[1].x;
                event._y1s = offsets[1].y;
                position = self.getImageLayer().displayToIndex( offsets[1] );
                event._x1 = parseInt( position.x, 10 );
                event._y1 = parseInt( position.y, 10 );
            }
            // set handle event flag
            handled = true;
        }
        else if( event.type === "mousemove" ||
            event.type === "mousedown" ||
            event.type === "mouseup" ||
            event.type === "mouseout" ||
            event.type === "mousewheel" ||
            event.type === "dblclick" ||
            event.type === "DOMMouseScroll" )
        {
            offsets = dwv.html.getEventOffset(event);
            event._xs = offsets[0].x;
            event._ys = offsets[0].y;
            position = self.getImageLayer().displayToIndex( offsets[0] );
            event._x = parseInt( position.x, 10 );
            event._y = parseInt( position.y, 10 );
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
            var func = self.getToolbox().getSelectedTool()[event.type];
            if( func )
            {
                func(event);
            }
        }
    }
    
    /**
     * Handle a drag over.
     * @method onDragOver
     * @private
     * @param {Object} event The event to handle.
     */
    function onDragOver(event)
    {
        // prevent default handling
        event.stopPropagation();
        event.preventDefault();
        // update box 
        var dropBoxDivId = containerDivId + "-dropBox";
        var box = document.getElementById(dropBoxDivId);
        if ( box ) {
            box.className = 'dropBox hover';
        }
    }
    
    /**
     * Handle a drag leave.
     * @method onDragLeave
     * @private
     * @param {Object} event The event to handle.
     */
    function onDragLeave(event)
    {
        // prevent default handling
        event.stopPropagation();
        event.preventDefault();
        // update box
        var dropBoxDivId = containerDivId + "-dropBox";
        var box = document.getElementById(dropBoxDivId);
        if ( box ) {
            box.className = 'dropBox';
        }
    }

    /**
     * Handle a drop event.
     * @method onDrop
     * @private
     * @param {Object} event The event to handle.
     */
    function onDrop(event)
    {
        // prevent default handling
        event.stopPropagation();
        event.preventDefault();
        // load files
        self.loadFiles(event.dataTransfer.files);
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
        imageLayer = new dwv.html.Layer(containerDivId + "-imageLayer");
        imageLayer.initialise(dataWidth, dataHeight);
        imageLayer.fillContext();
        imageLayer.setStyleDisplay(true);
        // draw layer
        var drawDivId = containerDivId + "-drawDiv";
        if( document.getElementById(drawDivId) !== null) {
            // create stage
            drawStage = new Kinetic.Stage({
                container: drawDivId,
                width: dataWidth,
                height: dataHeight,
                listening: false
            });
        }
        // resize app
        self.fitToSize( { 
            'width': $('#'+containerDivId).width(), 
            'height': $('#'+containerDivId).height() } );
        self.resetLayout();
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
        viewController = new dwv.ViewController(view);
        // append the DICOM tags table
        if ( tagsGui ) {
            tagsGui.initialise(data.info);
        }
        // store image
        originalImage = view.getImage();
        image = originalImage;
        
        // layout
        dataWidth = image.getSize().getNumberOfColumns();
        dataHeight = image.getSize().getNumberOfRows();
        createLayers(dataWidth, dataHeight);
        
        // get the image data from the image layer
        imageData = imageLayer.getContext().createImageData( 
                dataWidth, dataHeight);

        // image listeners
        view.addEventListener("wlchange", self.onWLChange);
        view.addEventListener("colorchange", self.onColorChange);
        view.addEventListener("slicechange", self.onSliceChange);
        
        // initialise the toolbox
        if ( toolbox ) {
            // mouse and touch listeners
            self.addLayerListeners( imageLayer.getCanvas() );
            // keydown listener
            window.addEventListener("keydown", eventHandler, true);
            
            toolbox.init();
            toolbox.display(true);
        }
        
        // stop box listening to drag (after first drag)
        var dropBoxDivId = containerDivId + "-dropBox";
        var box = document.getElementById(dropBoxDivId);
        if ( box ) {
            box.removeEventListener("dragover", onDragOver);
            box.removeEventListener("dragleave", onDragLeave);
            box.removeEventListener("drop", onDrop);
            dwv.html.removeNode(dropBoxDivId);
            // switch listening to layerContainer
            var div = document.getElementById(containerDivId);
            div.addEventListener("dragover", onDragOver);
            div.addEventListener("dragleave", onDragLeave);
            div.addEventListener("drop", onDrop);
        }

        // info layer
        var infoDivId = containerDivId + "-infoLayer";
        if ( document.getElementById(infoDivId) ) {
            windowingInfo = new dwv.info.Windowing(self);
            windowingInfo.create();
            
            positionInfo = new dwv.info.Position(self);
            positionInfo.create();
            
            miniColorMap = new dwv.info.MiniColorMap(self);
            miniColorMap.create();
            
            plotInfo = new dwv.info.Plot(self);
            plotInfo.create();
            
            addImageInfoListeners();
        }
        
        // init W/L display
        //self.updatePresets(true);
        self.initWLDisplay();        
    }

};

/**
 * View controller.
 * @class ViewController
 * @namespace dwv
 * @constructor
 */
dwv.ViewController = function ( view )
{
    /**
     * Set the current position.
     * @method setWindowLevel
     * @param {Number} i The column index.
     * @param {Number} j The row index.
     */
    this.setCurrentPosition = function (i, j)
    {
        view.setCurrentPosition( { 
            "i": i, "j": j, "k": view.getCurrentPosition().k});
    };
    
    /**
     * Set the window/level.
     * @method setWindowLevel
     * @param {Number} wc The window center.
     * @param {Number} ww The window width.
     */
    this.setWindowLevel = function (wc, ww)
    {
        view.setWindowLevel(wc,ww);
    };

    /**
     * Set the colour map.
     * @method setColourMap
     * @param {Object} colourMap The colour map.
     */
    this.setColourMap = function (colourMap)
    {
        view.setColorMap(colourMap);
    };

    /**
     * Set the colour map from a name.
     * @function setColourMapFromName
     * @param {String} name The name of the colour map to set.
     */
    this.setColourMapFromName = function (name)
    {
        // check if we have it
        if( !dwv.tool.colourMaps[name] ) {
            throw new Error("Unknown colour map: '" + name + "'");
        }
        // enable it
        this.setColourMap( dwv.tool.colourMaps[name] );
    };
    
}; // class dwv.ViewController

/**
 * Toolbox controller.
 * @class ToolboxController
 * @namespace dwv
 * @constructor
 */
dwv.ToolboxController = function (toolbox)
{
    /**
     * Set the selected tool.
     * @method setSelectedTool
     * @param {String} name The name of the tool.
     */
    this.setSelectedTool = function (name)
    {
        toolbox.setSelectedTool(name);
    };
    
    /**
     * Set the selected shape.
     * @method setSelectedShape
     * @param {String} name The name of the shape.
     */
    this.setSelectedShape = function (name)
    {
        toolbox.getSelectedTool().setShapeName(name);
    };
    
    /**
     * Set the selected filter.
     * @method setSelectedFilter
     * @param {String} name The name of the filter.
     */
    this.setSelectedFilter = function (name)
    {
        toolbox.getSelectedTool().setSelectedFilter(name);
    };
    
    /**
     * Run the selected filter.
     * @method runSelectedFilter
     */
    this.runSelectedFilter = function ()
    {
        toolbox.getSelectedTool().getSelectedFilter().run();
    };
    
    /**
     * Set the tool line color.
     * @method runFilter
     * @param {String} name The name of the color.
     */
    this.setLineColour = function (name)
    {
        toolbox.getSelectedTool().setLineColour(name);
    };
    
    /**
     * Set the tool range.
     * @method setRange
     * @param {Object} range The new range of the data.
     */
    this.setRange = function (range)
    {
        // seems like jquery is checking if the method exists before it 
        // is used...
        if( toolbox && toolbox.getSelectedTool() &&
                toolbox.getSelectedTool().getSelectedFilter() ) {
            toolbox.getSelectedTool().getSelectedFilter().run(range);
        }
    };
    
}; // class dwv.ToolboxController
