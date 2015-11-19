// Main DWV namespace.
var dwv = dwv || {};

var Kinetic = Kinetic || {};

/**
 * Main application class.
 * @class App
 * @namespace dwv
 * @constructor
 */
dwv.App = function ()
{
    // Local object
    var self = this;
    
    // Image
    var image = null;
    // Original image
    var originalImage = null;
    // Image data array
    var imageData = null;
    // Image data width
    var dataWidth = 0;
    // Image data height
    var dataHeight = 0;
    // Number of slices to load
    var nSlicesToLoad = 0;

    // Container div id
    var containerDivId = null;
    // Display window scale
    var windowScale = 1;
    // Fit display to window flag
    var fitToWindow = false;
    // main scale
    var scale = 1;
    // zoom center
    var scaleCenter = {"x": 0, "y": 0};
    // translation
    var translation = {"x": 0, "y": 0};
    
    // View
    var view = null;
    // View controller
    var viewController = null;
     
    // Info layer plot gui
    var plotInfo = null;
    // Info layer windowing gui
    var windowingInfo = null;
    // Info layer position gui
    var positionInfo = null;
    // Info layer colour map gui
    var miniColourMap = null; 
    // flag to know if the info layer is listening on the image.
    var isInfoLayerListening = false;

    // Dicom tags gui
    var tagsGui = null;
    
    // Image layer
    var imageLayer = null;
    // Draw layers
    var drawLayers = [];
    // Draw stage
    var drawStage = null;
    
    // Generic style
    var style = new dwv.html.Style();
    
    // Toolbox
    var toolbox = null;
    // Toolbox controller
    var toolboxController = null;

    // Loadbox
    var loadbox = null;
    // UndoStack
    var undoStack = null;
    
    // listeners
    var listeners = {};

    /** 
     * Get the version of the application.
     * @method getVersion
     * @return {String} The version of the application.
     */
    this.getVersion = function () { return "v0.12.0"; };
    
    /** 
     * Get the image.
     * @method getImage
     * @return {Image} The associated image.
     */
    this.getImage = function () { return image; };
    /** 
     * Set the view.
     * @method setImage
     * @param {Image} img The associated image.
     */
    this.setImage = function (img)
    { 
        image = img; 
        view.setImage(img);
    };
    /** 
     * Restore the original image.
     * @method restoreOriginalImage
     */
    this.restoreOriginalImage = function () 
    { 
        image = originalImage; 
        view.setImage(originalImage); 
    }; 
    /** 
     * Get the image data array.
     * @method getImageData
     * @return {Array} The image data array.
     */
    this.getImageData = function () { return imageData; };
    /** 
     * Get the number of slices to load.
     * @method getNSlicesToLoad
     * @return {Number} The number of slices to load.
     */
    this.getNSlicesToLoad = function () { return nSlicesToLoad; };

    /** 
     * Get the main scale.
     * @method getScale
     * @return {Number} The main scale.
     */
    this.getScale = function () { return scale / windowScale; };

    /** 
     * Get the scale center.
     * @method getScaleCenter
     * @return {Object} The coordinates of the scale center.
     */
    this.getScaleCenter = function () { return scaleCenter; };

    /** 
     * Get the translation.
     * @method getTranslation
     * @return {Object} The translation.
     */
    this.getTranslation = function () { return translation; };

    /** 
     * Get the view controller.
     * @method getViewController
     * @return {Object} The controller.
     */
    this.getViewController = function () { return viewController; };

    /** 
     * Get the image layer.
     * @method getImageLayer
     * @return {Object} The image layer.
     */
    this.getImageLayer = function () { return imageLayer; };
    /** 
     * Get the draw layer.
     * @method getDrawLayer
     * @return {Object} The draw layer.
     */
    this.getDrawLayer = function (k) { 
        if ( typeof  k === "undefined" ) {
            return drawLayers[view.getCurrentPosition().k];
        }
        else {
            return drawLayers[k];
        }
    };
    /** 
     * Get the draw stage.
     * @method getDrawStage
     * @return {Object} The draw layer.
     */
    this.getDrawStage = function () { return drawStage; };

    /** 
     * Get the app style.
     * @method getStyle
     * @return {Object} The app style.
     */
    this.getStyle = function () { return style; };

    /** 
     * Get the toolbox.
     * @method getToolbox
     * @return {Object} The associated toolbox.
     */
    this.getToolbox = function () { return toolbox; };
    /** 
     * Get the toolbox controller.
     * @method getToolboxController
     * @return {Object} The controller.
     */
    this.getToolboxController = function () { return toolboxController; };

    /** 
     * Get the undo stack.
     * @method getUndoStack
     * @return {Object} The undo stack.
     */
    this.getUndoStack = function () { return undoStack; };

    /** 
     * Get the data loaders.
     * @method getLoaders
     * @return {Object} The loaders.
     */
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
                        toolList.Draw.addEventListener("draw-create", fireEvent);
                        toolList.Draw.addEventListener("draw-change", fireEvent);
                        toolList.Draw.addEventListener("draw-move", fireEvent);
                        toolList.Draw.addEventListener("draw-delete", fireEvent);
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
                loadbox = new dwv.gui.Loadbox(this, 
                    {"file": fileLoadGui, "url": urlLoadGui} );
                loadbox.setup();
                fileLoadGui.setup();
                urlLoadGui.setup();
                fileLoadGui.display(true);
                urlLoadGui.display(false);
            }
            // undo
            if ( config.gui.indexOf("undo") !== -1 ) {
                undoStack = new dwv.tool.UndoStack(this);
                undoStack.setup();
            }
            // DICOM Tags
            if ( config.gui.indexOf("tags") !== -1 ) {
                tagsGui = new dwv.gui.DicomTags(this);
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
                dwv.gui.appendHelpHtml( toolbox.getToolList(), isMobile, this );
            }
        }
        
        // listen to drag&drop
        var box = this.getElement("dropBox");
        if ( box ) {
            box.addEventListener("dragover", onDragOver);
            box.addEventListener("dragleave", onDragLeave);
            box.addEventListener("drop", onDrop);
            // initial size
            var size = dwv.gui.getWindowSize();
            var dropBoxSize = 2 * size.height / 3;
            box.setAttribute("style","width:"+dropBoxSize+"px;height:"+dropBoxSize+"px");
        }
        // possible load from URL
        if ( typeof config.skipLoadUrl === "undefined" ) {
            var query = dwv.html.getUriParam(window.location.href); 
            // check query
            if ( query && typeof query.input !== "undefined" ) {
                // manifest
                if ( query.type && query.type === "manifest" ) {
                    var finalUri = "";
                    if ( query.input[0] === '/' ) {
                        finalUri = window.location.protocol + "//" + window.location.host;
                    }
                    finalUri += query.input;
                    dwv.html.decodeManifestUri( finalUri, query.nslices, this.onInputURLs );
                }
                // urls
                else {
                    var urls = dwv.html.decodeKeyValueUri( query.input, query.dwvReplaceMode );
                    this.loadURL(urls);
                    if ( typeof query.state !== "undefined" ) {
                        var onLoadEnd = function (/*event*/) {
                            loadStateUrl([query.state]);
                        };
                        this.addEventListener( "load-end", onLoadEnd );
                        
                    }
                }
            }
        }
        else{
            console.log("Not loading url from address since skipLoadUrl is defined.");
        }
        // align layers when the window is resized
        if ( config.fitToWindow ) {
            fitToWindow = true;
            window.onresize = this.onResize;
        }
    };
    
    /**
     * Get a HTML element associated to the application.
     * @method getElement
     * @param name The name or id to find.
     * @return The found element or null.
     */
     this.getElement = function (name)
     {
         return dwv.gui.getElement(containerDivId, name);
     };

    /**
     * Reset the application.
     * @method reset
     */
    this.reset = function ()
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
        nSlicesToLoad = 0;
        // reset undo/redo
        if ( undoStack ) {
            undoStack = new dwv.tool.UndoStack(this);
            undoStack.initialise();
        }
    };
    
    /**
     * Reset the layout of the application.
     * @method resetLayout
     */
    this.resetLayout = function () {
        scale = windowScale;
        scaleCenter = {"x": 0, "y": 0};
        translation = {"x": 0, "y": 0};
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
     * Add an event listener on the app.
     * @method addEventListener
     * @param {String} type The event type.
     * @param {Object} listener The method associated with the provided event type.
     */
    this.addEventListener = function (type, listener)
    {
        if ( typeof listeners[type] === "undefined" ) {
            listeners[type] = [];
        }
        listeners[type].push(listener);
    };

    /**
     * Remove an event listener from the app.
     * @method removeEventListener
     * @param {String} type The event type.
     * @param {Object} listener The method associated with the provided event type.
     */
    this.removeEventListener = function (type, listener)
    {
        if( typeof listeners[type] === "undefined" ) {
            return;
        }
        for ( var i = 0; i < listeners[type].length; ++i )
        {   
            if ( listeners[type][i] === listener ) {
                listeners[type].splice(i,1);
            }
        }
    };

    /**
     * Load a list of files.
     * @method loadFiles
     * @param {Array} files The list of files to load.
     */
    this.loadFiles = function (files)
    {
        // has been checked for emptiness.
        var ext = files[0].name.split('.').pop().toLowerCase();
        if ( ext === "json" ) {
            loadStateFile(files);
        }
        else {
            loadImageFiles(files);
        }
    };

    /**
     * Load a list of image files.
     * @method loadImageFiles
     * @param {Array} files The list of image files to load.
     */
    function loadImageFiles (files) 
    {
        // clear variables
        self.reset();
        nSlicesToLoad = files.length;
        // create IO
        var fileIO = new dwv.io.File();
        fileIO.onload = function (data) {
            
            var isFirst = true;
            if ( image ) {
                view.append( data.view );
                isFirst = false;
            }
            postLoadInit(data);
            if ( drawStage ) {
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
        fileIO.onerror = function (error) { handleError(error); };
        fileIO.onprogress = onLoadProgress;
        // main load (asynchronous)
        fileIO.load(files);
    }
    
    /**
     * Load a State file.
     * @method loadStateFile
     * @param {Array} file An array with the state file to load.
     */
    function loadStateFile(file) 
    {
        // create IO
        var fileIO = new dwv.io.File();
        fileIO.onload = function (data) {
            // load state
            var state = new dwv.State(self);
            state.fromJSON(data, fireEvent);
        };
        fileIO.onerror = function (error) { handleError(error); };
        // main load (asynchronous)
        fileIO.load(file);
    }

    /**
     * Load a list of URLs.
     * @method loadURL
     * @param {Array} urls The list of urls to load.
     */
    this.loadURL = function(urls) 
    {
        // clear variables
        this.reset();
        nSlicesToLoad = urls.length;
        // create IO
        var urlIO = new dwv.io.Url();
        urlIO.onload = function (data) {
            var isFirst = true;
            if ( image ) {
                view.append( data.view );
                isFirst = false;
            }
            postLoadInit(data);
            if ( drawStage ) {
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
        urlIO.onerror = function (error) { handleError(error); };
        urlIO.onloadend = function (/*event*/) { fireEvent({ 'type': 'load-end' }); };
        urlIO.onprogress = onLoadProgress;
        // main load (asynchronous)
        urlIO.load(urls);
    };
    
    /**
     * Load a State url.
     * @method loadStateUrl
     * @param {Array} file An array with the state url to load.
     */
    function loadStateUrl(url) 
    {
        // create IO
        var urlIO = new dwv.io.Url();
        urlIO.onload = function (data) {
            // load state
            var state = new dwv.State(self);
            state.fromJSON(data, fireEvent);
        };
        urlIO.onerror = function (error) { handleError(error); };
        // main load (asynchronous)
        urlIO.load(url);
    }

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
        scale *= mul;
        
        // update style
        style.setScale(windowScale);

        // resize container
        var container = this.getElement("layerContainer");
        container.setAttribute("style","width:"+newWidth+"px;height:"+newHeight+"px");
        // resize image layer
        if ( imageLayer ) {
            imageLayer.setWidth(newWidth);
            imageLayer.setHeight(newHeight);
            imageLayer.zoom(scale, scale, 0, 0);
            imageLayer.draw();
        }
        // resize draw stage
        if ( drawStage ) {
            // resize div
            var drawDiv = this.getElement("drawDiv");
            drawDiv.setAttribute("style","width:"+newWidth+"px;height:"+newHeight+"px");
           // resize stage
            drawStage.setWidth(newWidth);
            drawStage.setHeight(newHeight);
            drawStage.scale( {x: scale, y: scale} );
            drawStage.draw();
        }
    };
    
    /**
     * Toggle the display of the information layer.
     * @method toggleInfoLayerDisplay
     */
    this.toggleInfoLayerDisplay = function ()
    {
        // toggle html
        var infoLayer = self.getElement("infoLayer");
        dwv.html.toggleDisplay(infoLayer);
        // toggle listeners
        if ( isInfoLayerListening ) {
            removeImageInfoListeners();
        }
        else {
            addImageInfoListeners();
        }
    };
    
    /**
     * Init the Window/Level display
     */
    this.initWLDisplay = function ()
    {
        // set window/level from first preset
        var presets = viewController.getPresets();
        var keys = Object.keys(presets);
        viewController.setWindowLevel(
            presets[keys[0]].center, 
            presets[keys[0]].width );
        // default position
        viewController.setCurrentPosition2D(0,0);
    };

    /**
     * Add layer mouse and touch listeners.
     * @method addLayerListeners
     */
    this.addLayerListeners = function (layer)
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
    this.removeLayerListeners = function (layer)
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
     * Zoom to the layers.
     * @method zoom
     * @param {Number} zoom The zoom to apply.
     * @param {Number} cx The zoom center X coordinate.
     * @param {Number} cy The zoom center Y coordinate.
     */ 
    this.zoom = function (zoom, cx, cy) {
        scale = zoom * windowScale;
        if ( scale <= 0.1 ) {
            scale = 0.1;
        }
        scaleCenter = {"x": cx, "y": cy};
        zoomLayers();
    };
    
    /**
     * Add a step to the layers zoom.
     * @method stepZoom
     * @param {Number} step The zoom step increment. A good step is of 0.1.
     * @param {Number} cx The zoom center X coordinate.
     * @param {Number} cy The zoom center Y coordinate.
     */ 
    this.stepZoom = function (step, cx, cy) {
        scale += step;
        if ( scale <= 0.1 ) {
            scale = 0.1;
        }
        scaleCenter = {"x": cx, "y": cy};
        zoomLayers();
    };

    /**
     * Apply a translation to the layers.
     * @method translate
     * @param {Number} tx The translation along X.
     * @param {Number} ty The translation along Y.
     */ 
    this.translate = function (tx, ty)
    {
        translation = {"x": tx, "y": ty};
        translateLayers();
    };
    
    /**
     * Add a translation to the layers.
     * @method stepTranslate
     * @param {Number} tx The step translation along X.
     * @param {Number} ty The step translation along Y.
     */ 
    this.stepTranslate = function (tx, ty)
    {
        var txx = translation.x + tx / scale;
        var tyy = translation.y + ty / scale;
        translation = {"x": txx, "y": tyy};
        translateLayers();
    };

    // Handler Methods -----------------------------------------------------------

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
     * Handle colour map change.
     * @method onColourChange
     * @param {Object} event The event fired when changing the colour map.
     */
    this.onColourChange = function (/*event*/)
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
     * Handle key down event.
     * - CRTL-Z: undo
     * - CRTL-Y: redo
     * Default behavior. Usually used in tools. 
     * @method onKeydown
     * @param {Object} event The key down event.
     */
    this.onKeydown = function (event)
    {
        if ( event.keyCode === 90 && event.ctrlKey ) // ctrl-z
        {
            undoStack.undo();
        }
        else if ( event.keyCode === 89 && event.ctrlKey ) // ctrl-y
        {
            undoStack.redo();
        }
    };
    
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
     * Handle input urls.
     * @method onInputURLs
     * @param {Array} urls The list of input urls.
     */
    this.onInputURLs = function (urls)
    {
        self.loadURL(urls);
    };

    /**
     * Handle change files event.
     * @method onChangeFiles
     * @param {Object} event The event fired when changing the file field.
     */
    this.onChangeFiles = function (event)
    {
        var files = event.target.files;
        if ( files.length !== 0 ) {
            self.loadFiles(files);
        }  
    };

    /**
     * Handle state save event.
     * @method onStateSave
     * @param {Object} event The event fired when changing the state save field.
     */
    this.onStateSave = function (/*event*/)
    {
        var state = new dwv.State(self);
        // add href to link (html5)
        var element = self.getElement("download-state");
        element.href = "data:application/json," + state.toJSON();
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
        var preset = viewController.getPresets()[name];
        // check if we have it
        if ( !preset ) {
            throw new Error("Unknown window level preset: '" + name + "'");
        }
        // enable it
        viewController.setWindowLevel( 
            preset.center, preset.width );
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
        var select = self.getElement("presetSelect");
        select.selectedIndex = 0;
        dwv.gui.refreshElement(select);
    };


    // Private Methods -----------------------------------------------------------

    /**
     * Fire an event: call all associated listeners.
     * @method fireEvent
     * @param {Object} event The event to fire.
     */
    function fireEvent (event)
    {
        if ( typeof listeners[event.type] === "undefined" ) {
            return;
        }
        for ( var i = 0; i < listeners[event.type].length; ++i )
        {   
            listeners[event.type][i](event);
        }
    }
    
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
     * Apply the stored zoom to the layers.
     * @method zoomLayers
     */ 
    function zoomLayers()
    {
        // image layer
        if( imageLayer ) {
            imageLayer.zoom(scale, scale, scaleCenter.x, scaleCenter.y);
            imageLayer.draw();
        }
        // draw layer
        if( drawStage ) { 
            // zoom
            var newKZoom = {'x': scale, 'y': scale};
            // offset
            // TODO different from the imageLayer offset?
            var oldKZoom = drawStage.scale();
            var oldOffset = drawStage.offset();
            var newOffsetX = (scaleCenter.x / oldKZoom.x) + 
                oldOffset.x - (scaleCenter.x / newKZoom.x);
            var newOffsetY = (scaleCenter.y / oldKZoom.y) + 
                oldOffset.y - (scaleCenter.y / newKZoom.y);
            var newOffset = { 'x': newOffsetX, 'y': newOffsetY };
            // store
            drawStage.offset( newOffset );
            drawStage.scale( newKZoom );
            drawStage.draw();
        }
    }

    /**
     * Apply the stored translation to the layers.
     * @method translateLayers
     */ 
    function translateLayers()
    {
        // image layer
        if( imageLayer ) {
            imageLayer.translate(translation.x, translation.y);
            imageLayer.draw();
        }
        // draw layer
        if( drawStage && imageLayer ) { 
            var ox = - imageLayer.getOrigin().x / scale - translation.x;
            var oy = - imageLayer.getOrigin().y / scale - translation.y;
            drawStage.offset( { 'x': ox, 'y': oy } );
            drawStage.draw();
        }
    }

    /**
     * Add image listeners.
     * @method addImageInfoListeners
     * @private
     */
    function addImageInfoListeners()
    {
        view.addEventListener("wl-change", windowingInfo.update);
        view.addEventListener("wl-change", miniColourMap.update);
        view.addEventListener("wl-change", plotInfo.update);
        view.addEventListener("colour-change", miniColourMap.update);
        view.addEventListener("position-change", positionInfo.update);
        isInfoLayerListening = true;
    }
    
    /**
     * Remove image listeners.
     * @method removeImageInfoListeners
     * @private
     */
    function removeImageInfoListeners()
    {
        view.removeEventListener("wl-change", windowingInfo.update);
        view.removeEventListener("wl-change", miniColourMap.update);
        view.removeEventListener("wl-change", plotInfo.update);
        view.removeEventListener("colour-change", miniColourMap.update);
        view.removeEventListener("position-change", positionInfo.update);
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
        if ( event.type === "touchstart" ||
            event.type === "touchmove")
        {
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
        else if ( event.type === "mousemove" ||
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
        else if ( event.type === "keydown" || 
                event.type === "touchend")
        {
            handled = true;
        }
            
        // Call the event handler of the tool.
        if ( handled )
        {
            if ( event.type !== "keydown" ) {
                event.preventDefault();
            }
            var func = self.getToolbox().getSelectedTool()[event.type];
            if ( func )
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
        var box = self.getElement("dropBox");
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
        var box = self.getElement("dropBox hover");
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
        if ( error.name && error.message) {
            alert(error.name+": "+error.message+".");
        }
        else {
            alert("Error: "+error+".");
        }
        // log
        if ( error.stack ) {
            console.error(error.stack);
        }
    }
    
    /**
     * Handle a load progress.
     * @method onLoadProgress
     * @private
     * @param {Object} event The event to handle.
     */
    function onLoadProgress(event)
    {
        if( event.lengthComputable )
        {
            var percent = Math.round((event.loaded / event.total) * 100);
            dwv.gui.displayProgress(percent);
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
        var canImgLay = self.getElement("imageLayer");
        imageLayer = new dwv.html.Layer(canImgLay);
        imageLayer.initialise(dataWidth, dataHeight);
        imageLayer.fillContext();
        imageLayer.setStyleDisplay(true);
        // draw layer
        var drawDiv = self.getElement("drawDiv");
        if ( drawDiv ) {
            // create stage
            drawStage = new Kinetic.Stage({
                container: drawDiv,
                width: dataWidth,
                height: dataHeight,
                listening: false
            });
            // reset style
            // (avoids a not needed vertical scrollbar) 
            drawStage.getContent().setAttribute("style", "");
        }
        // resize app
        if ( fitToWindow ) {
            self.fitToSize( dwv.gui.getWindowSize() );
        }
        else {
            self.fitToSize( {
                'width': self.getElement("layerContainer").offsetWidth,
                'height': self.getElement("layerContainer").offsetHeight } );
        }
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
        if ( view ) {
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
        var size = image.getGeometry().getSize();
        dataWidth = size.getNumberOfColumns();
        dataHeight = size.getNumberOfRows();
        createLayers(dataWidth, dataHeight);
        
        // get the image data from the image layer
        imageData = imageLayer.getContext().createImageData( 
                dataWidth, dataHeight);

        // image listeners
        view.addEventListener("wl-change", self.onWLChange);
        view.addEventListener("colour-change", self.onColourChange);
        view.addEventListener("slice-change", self.onSliceChange);
        
        // connect with local listeners
        view.addEventListener("wl-change", fireEvent);
        view.addEventListener("colour-change", fireEvent);
        view.addEventListener("position-change", fireEvent);
        view.addEventListener("slice-change", fireEvent);
        
        // update presets with loaded image (used in w/l tool)
        viewController.updatePresets(image, true);

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
        var box = self.getElement("dropBox");
        if ( box ) {
            box.removeEventListener("dragover", onDragOver);
            box.removeEventListener("dragleave", onDragLeave);
            box.removeEventListener("drop", onDrop);
            dwv.html.removeNode(box);
            // switch listening to layerContainer
            var div = self.getElement("layerContainer");
            div.addEventListener("dragover", onDragOver);
            div.addEventListener("dragleave", onDragLeave);
            div.addEventListener("drop", onDrop);
        }

        // info layer
        var infoLayer = self.getElement("infoLayer"); 
        if ( infoLayer ) {
            var infotr = self.getElement("infotr");
            windowingInfo = new dwv.info.Windowing(infotr);
            windowingInfo.create();
            
            var infotl = self.getElement("infotl");
            positionInfo = new dwv.info.Position(infotl);
            positionInfo.create();
            
            var infobr = self.getElement("infobr");
            miniColourMap = new dwv.info.MiniColourMap(infobr, self);
            miniColourMap.create();
            
            var plot = self.getElement("plot");
            plotInfo = new dwv.info.Plot(plot, self);
            plotInfo.create();
            
            addImageInfoListeners();
        }
        
        // init W/L display: triggers a wlchange event
        //   listened by the view and a general display.
        self.initWLDisplay();        
    }

};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};

var Kinetic = Kinetic || {};

/**
 * State class.
 * Saves: data url/path, display info, undo stack.
 * @class State
 * @namespace dwv
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.State = function (app)
{
    /**
     * Save state.
     * @method save
     */
    this.toJSON = function () {
        // store each slice drawings group
        var nSlices = app.getImage().getGeometry().getSize().getNumberOfSlices();
        var drawings = [];
        for ( var k = 0; k < nSlices; ++k ) {
            // getChildren always return, so drawings will have the good size
            var groups = app.getDrawLayer(k).getChildren();
            // remove anchors
            for ( var i = 0; i < groups.length; ++i ) {
                var anchors  = groups[i].find(".anchor");
                for ( var a = 0; a < anchors.length; ++a ) {
                    anchors[a].remove();
                }
            }
            drawings.push(groups);
        }
        // return a JSON string
        return JSON.stringify( {
            "window-center": app.getViewController().getWindowLevel().center, 
            "window-width": app.getViewController().getWindowLevel().width,
            "position": app.getViewController().getCurrentPosition(),
            "scale": app.getScale(),
            "scaleCenter": app.getScaleCenter(),
            "translation": app.getTranslation(),
            "drawings": drawings
        } );
    };
    /**
     * Load state.
     * @method load
     */
    this.fromJSON = function (json, eventCallback) {
        var data = JSON.parse(json);
        // display
        app.getViewController().setWindowLevel(data["window-center"], data["window-width"]);
        app.getViewController().setCurrentPosition(data.position);
        app.zoom(data.scale, data.scaleCenter.x, data.scaleCenter.y);
        app.translate(data.translation.x, data.translation.y);
        // drawings
        var nSlices = app.getImage().getGeometry().getSize().getNumberOfSlices();
        var isShape = function (node) {
            return node.name() === "shape";
        };
        for ( var k = 0 ; k < nSlices; ++k ) {
            for ( var i = 0 ; i < data.drawings[k].length; ++i ) {
                var group = Kinetic.Node.create(data.drawings[k][i]);
                var shape = group.getChildren( isShape )[0];
                var cmd = new dwv.tool.DrawGroupCommand(
                    group, shape.className,
                    app.getDrawLayer(k) );
                if ( typeof eventCallback !== "undefined" ) {
                    cmd.onExecute = eventCallback;
                    cmd.onUndo = eventCallback;
                }
                cmd.execute();
                app.getUndoStack().add(cmd);
            }
        }
    };
}; // State class
;// Main DWV namespace.
var dwv = dwv || {};

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
     * Set the tool line colour.
     * @method runFilter
     * @param {String} name The name of the colour.
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
        if ( toolbox && toolbox.getSelectedTool() &&
                toolbox.getSelectedTool().getSelectedFilter() ) {
            toolbox.getSelectedTool().getSelectedFilter().run(range);
        }
    };
    
}; // class dwv.ToolboxController
;// Main DWV namespace.
var dwv = dwv || {};

/**
 * View controller.
 * @class ViewController
 * @namespace dwv
 * @constructor
 */
dwv.ViewController = function ( view )
{
    // Window/level presets
    var presets = null;

    /** 
     * Get the window/level presets.
     * @method getPresets
     * @return {Object} The presets.
     */
    this.getPresets = function () { return presets; };

    /**
     * Get the current position.
     * @method getCurrentPosition
     * @return {Object} The position.
      */
    this.getCurrentPosition = function ()
    {
        return view.getCurrentPosition();
    };
    
    /**
     * Set the current position.
     * @method setCurrentPosition
     * @param {Object} pos The position.
     * @return {Boolean} False if not in bounds.
      */
    this.setCurrentPosition = function (pos)
    {
        return view.setCurrentPosition(pos);
    };

    /**
     * Set the current 2D (i,j) position.
     * @method setCurrentPosition2D
     * @param {Number} i The column index.
     * @param {Number} j The row index.
     * @return {Boolean} False if not in bounds.
      */
    this.setCurrentPosition2D = function (i, j)
    {
        return view.setCurrentPosition({ 
            "i": i, 
            "j": j, 
            "k": view.getCurrentPosition().k
        });
    };
    
    /**
     * Increment the current slice number.
     * @method incrementSliceNb
     * @return {Boolean} False if not in bounds.
     */
    this.incrementSliceNb = function ()
    {
        return view.setCurrentPosition({
            "i": view.getCurrentPosition().i,
            "j": view.getCurrentPosition().j,
            "k": view.getCurrentPosition().k + 1 
        });
    };

    /**
     * Decrement the current slice number.
     * @method decrementSliceNb
     * @return {Boolean} False if not in bounds.
     */
    this.decrementSliceNb = function ()
    {
        return view.setCurrentPosition({
            "i": view.getCurrentPosition().i,
            "j": view.getCurrentPosition().j,
            "k": view.getCurrentPosition().k - 1 
        });
    };

    /**
     * Go to first slice .
     * @method goFirstSlice
     * @return {Boolean} False if not in bounds.
     */
    this.goFirstSlice = function()
    {
        return view.setCurrentPosition({
            "i": view.getCurrentPosition().i,
            "j": view.getCurrentPosition().j,
            "k":  0 
        });
    };

    /**
     * Get the window/level.
     * @method getWindowLevel
     * @return {Object} The window center and width.
     */
    this.getWindowLevel = function ()
    {
        return { 
            "width": view.getWindowLut().getWidth(),
            "center": view.getWindowLut().getCenter() 
        };
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
     * Update the window/level presets.
     * @function updatePresets
     * @param {Object} image The associated image.
     * @param {Boolean} full If true, shows all presets.
     */
    this.updatePresets = function (image)
    {    
        // store the manual preset
        var manual = null;
        if ( presets ) {
            manual = presets.manual;
        }
        // reinitialize the presets
        presets = {};
        
        // DICOM presets
        var dicomPresets = view.getWindowPresets();
        if ( dicomPresets ) {
            for( var i = 0; i < dicomPresets.length; ++i ) {
                presets[dicomPresets[i].name.toLowerCase()] = dicomPresets[i];
            }
        }
        
        // Image presets
        
        // min/max preset
        var range = image.getRescaledDataRange();
        var width = range.max - range.min;
        var center = range.min + width/2;
        presets["min/max"] = {"center": center, "width": width};
        // optional modality presets
        if ( typeof dwv.tool.defaultpresets != "undefined" ) {
            var modality = image.getMeta().Modality;
            for( var key in dwv.tool.defaultpresets[modality] ) {
                presets[key] = dwv.tool.defaultpresets[modality][key];
            }
        }
        
        // Manual preset
        if ( manual ){
            presets.manual = manual;
        }
    };

    /**
     * Get the colour map.
     * @method getColourMap
     * @return {Object} The colour map.
     */
    this.getColourMap = function ()
    {
        return view.getColourMap();
    };

    /**
     * Set the colour map.
     * @method setColourMap
     * @param {Object} colourMap The colour map.
     */
    this.setColourMap = function (colourMap)
    {
        view.setColourMap(colourMap);
    };

    /**
     * Set the colour map from a name.
     * @function setColourMapFromName
     * @param {String} name The name of the colour map to set.
     */
    this.setColourMapFromName = function (name)
    {
        // check if we have it
        if ( !dwv.tool.colourMaps[name] ) {
            throw new Error("Unknown colour map: '" + name + "'");
        }
        // enable it
        this.setColourMap( dwv.tool.colourMaps[name] );
    };
    
}; // class dwv.ViewController

;/** 
 * DICOM module.
 * @module dicom
 */
var dwv = dwv || {};
dwv.dicom = dwv.dicom || {};
// JPEG Baseline
var hasJpegBaselineDecoder = (typeof JpegImage !== "undefined");
var JpegImage = JpegImage || {};
// JPEG Lossless
var hasJpegLosslessDecoder = (typeof jpeg !== "undefined") &&
    (typeof jpeg.lossless !== "undefined");
var jpeg = jpeg || {};
jpeg.lossless = jpeg.lossless || {};
// JPEG 2000
var hasJpeg2000Decoder = (typeof JpxImage !== "undefined");
var JpxImage = JpxImage || {};

/**
 * Clean string: trim and remove ending.
 * @method cleanString
 * @static
 * @param {String} string The string to clean.
 * @return {String} The cleaned string.
 */
dwv.dicom.cleanString = function (string)
{
    var res = string;
    if ( string ) {
        // trim spaces
        res = string.trim();
        // get rid of ending zero-width space (u200B)
        if ( res[res.length-1] === String.fromCharCode("u200B") ) {
            res = res.substring(0, res.length-1);
        }
    }
    return res;
};

/**
 * Is the Native endianness Little Endian.
 * @property isNativeLittleEndian
 * @type Boolean
 */
dwv.dicom.isNativeLittleEndian = function ()
{
    return new Int8Array(new Int16Array([1]).buffer)[0] > 0;
};

/**
 * Data reader.
 * @class DataReader
 * @namespace dwv.dicom
 * @constructor
 * @param {Array} buffer The input array buffer.
 * @param {Boolean} isLittleEndian Flag to tell if the data is little or big endian.
 */
dwv.dicom.DataReader = function (buffer, isLittleEndian)
{
    // Set endian flag if not defined.
    if ( typeof isLittleEndian === 'undefined' ) {
        isLittleEndian = true;
    }
    
    /**
     * Is the Native endianness Little Endian.
     * @property isNativeLittleEndian
     * @private
     * @type Boolean
     */
    var isNativeLittleEndian = dwv.dicom.isNativeLittleEndian();

    /**
     * Flag to know if the TypedArray data needs flipping.
     * @property needFlip
     * @private
     * @type Boolean
     */
    var needFlip = (isLittleEndian !== isNativeLittleEndian);
    
    /**
     * The main data view.
     * @property view
     * @private
     * @type DataView
     */
    var view = new DataView(buffer);
    
    /**
     * Flip an array's endianness.
     * Inspired from https://github.com/kig/DataStream.js.
     * @method flipArrayEndianness
     * @param {Object} array The array to flip (modified).
     */
    this.flipArrayEndianness = function (array) {
       var blen = array.byteLength;
       var u8 = new Uint8Array(array.buffer, array.byteOffset, blen);
       var bpel = array.BYTES_PER_ELEMENT;
       var tmp;
       for ( var i = 0; i < blen; i += bpel ) {
         for ( var j = i + bpel - 1, k = i; j > k; j--, k++ ) {
           tmp = u8[k];
           u8[k] = u8[j];
           u8[j] = tmp;
         }
       }
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
     * Read Int32 (4 bytes) data.
     * @method readInt32
     * @param {Number} byteOffset The offset to start reading from.
     * @return {Number} The read data.
     */
    this.readInt32 = function(byteOffset) {
        return view.getInt32(byteOffset, isLittleEndian);
    };
    /**
     * Read Uint8 array.
     * @method readUint8Array
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readUint8Array = function(byteOffset, size) {
        return new Uint8Array(buffer, byteOffset, size);
    };
    /**
     * Read Int8 array.
     * @method readInt8Array
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readInt8Array = function(byteOffset, size) {
        return new Int8Array(buffer, byteOffset, size);
    };
    /**
     * Read Uint16 array.
     * @method readUint16Array
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readUint16Array = function(byteOffset, size) {
        var data = new Uint16Array(buffer, byteOffset, (size / 2));
        if ( needFlip ) {
            this.flipArrayEndianness(data);
        }
        return data;
    };
    /**
     * Read Int16 array.
     * @method readInt16Array
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readInt16Array = function(byteOffset, size) {
        var data = new Int16Array(buffer, byteOffset, (size / 2));
        if ( needFlip ) {
            this.flipArrayEndianness(data);
        }
        return data;
    };
    /**
     * Read Uint32 array.
     * @method readUint32Array
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readUint32Array = function(byteOffset, size) {
        var arraySize = size / 4;
        var data = null;
        // start offset of Uint32Array should be a multiple of 4
        if ( (byteOffset % 4) === 0 ) {
            data = new Uint32Array(buffer, byteOffset, arraySize);
            if ( needFlip ) {
                this.flipArrayEndianness(data);
            }
        }
        else {
            data = new Uint32Array(arraySize);
            for ( var i = 0; i < arraySize; ++i ) {
                data[i] = view.getUint32((byteOffset + 4*i), isLittleEndian);
            }
        }
        return data;
    };
    /**
     * Read Int32 array.
     * @method readInt32Array
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readInt32Array = function(byteOffset, size) {
        var arraySize = size / 4;
        var data = null;
        // start offset of Int32Array should be a multiple of 4
        if ( (byteOffset % 4) === 0 ) {
            data = new Int32Array(buffer, byteOffset, arraySize);
            if ( needFlip ) {
                this.flipArrayEndianness(data);
            }
        }
        else {
            data = new Int32Array(arraySize);
            for ( var i = 0; i < arraySize; ++i ) {
                data[i] = view.getInt32((byteOffset + 4*i), isLittleEndian);
            }
        }
        return data;
    };
    /**
     * Read Float32 array.
     * @method readFloat32Array
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readFloat32Array = function(byteOffset, size) {
        var arraySize = size / 4;
        var data = null;
        // start offset of Float32Array should be a multiple of 4
        if ( (byteOffset % 4) === 0 ) {
            data = new Float32Array(buffer, byteOffset, arraySize);
            if ( needFlip ) {
                this.flipArrayEndianness(data);
            }
        }
        else {
            data = new Float32Array(arraySize);
            for ( var i = 0; i < arraySize; ++i ) {
                data[i] = view.getFloat32((byteOffset + 4*i), isLittleEndian);
            }
        }
        return data;
    };
    /**
     * Read Float64 array.
     * @method readFloat64Array
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readFloat64Array = function(byteOffset, size) {
        var arraySize = size / 8;
        var data = null;
        // start offset of Float64Array should be a multiple of 8
        if ( (byteOffset % 8) === 0 ) {
            data = new Float64Array(buffer, byteOffset, arraySize);
            if ( needFlip ) {
                this.flipArrayEndianness(data);
            }
        }
        else {
            data = new Float64Array(arraySize);
            for ( var i = 0; i < arraySize; ++i ) {
                data[i] = view.getFloat64((byteOffset + 8*i), isLittleEndian);
            }
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
        var data = this.readUint8Array(byteOffset, nChars);
        for ( var i = 0; i < nChars; ++i ) {
            result += String.fromCharCode( data[ i ] );
        }
        return result;
    };
};

/**
 * Get the group-element key used to store DICOM elements.
 * @param {Number} group The DICOM group.
 * @param {Number} element The DICOM element.
 * @returns {String} The key.
 */
dwv.dicom.getGroupElementKey = function (group, element)
{
    return 'x' + group.substr(2,6) + element.substr(2,6);
};

/**
 * Split a group-element key used to store DICOM elements.
 * @param key The key in form "x00280102.
 * @returns {Object} The DICOM group and element.
 */
dwv.dicom.splitGroupElementKey = function (key)
{
    return {'group': key.substr(1,4), 'element': key.substr(5,8) };
};

/**
 * Tell if a given syntax is a JPEG baseline one.
 * @method isJpegBaselineTransferSyntax
 * @param {String} The transfer syntax to test.
 * @returns {Boolean} True if a jpeg baseline syntax.
 */
dwv.dicom.isJpegBaselineTransferSyntax = function(syntax)
{
    return syntax === "1.2.840.10008.1.2.4.50" ||
        syntax === "1.2.840.10008.1.2.4.51";
};

/**
 * Tell if a given syntax is a non supported JPEG one.
 * @method isJpegNonSupportedTransferSyntax
 * @param {String} The transfer syntax to test.
 * @returns {Boolean} True if a non supported jpeg syntax.
 */
dwv.dicom.isJpegNonSupportedTransferSyntax = function(syntax)
{
    return ( syntax.match(/1.2.840.10008.1.2.4.5/) !== null &&
        !dwv.dicom.isJpegBaselineTransferSyntax() &&
        !dwv.dicom.isJpegLosslessTransferSyntax() ) ||
        syntax.match(/1.2.840.10008.1.2.4.6/) !== null;
};

/**
 * Tell if a given syntax is a JPEG Lossless one.
 * @method isJpegLosslessTransferSyntax
 * @param {String} The transfer syntax to test.
 * @returns {Boolean} True if a jpeg lossless syntax.
 */
dwv.dicom.isJpegLosslessTransferSyntax = function(syntax)
{
    return syntax === "1.2.840.10008.1.2.4.57" ||
        syntax === "1.2.840.10008.1.2.4.70";
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
 * Get the transfer syntax name.
 * @method getTransferSyntaxName
 * @param {String} The transfer syntax.
 * @returns {String} The name of the transfer syntax.
 */
dwv.dicom.getTransferSyntaxName = function (syntax)
{
    var name = "unknown";
    // Implicit VR - Little Endian
    if( syntax === "1.2.840.10008.1.2" ) {
        name = "Little Endian Implicit";
    }
    // Explicit VR - Little Endian
    else if( syntax === "1.2.840.10008.1.2.1" ) {
        name = "Little Endian Explicit";
    }
    // Deflated Explicit VR - Little Endian
    else if( syntax === "1.2.840.10008.1.2.1.99" ) {
        name = "Little Endian Deflated Explicit";
    }
    // Explicit VR - Big Endian
    else if( syntax === "1.2.840.10008.1.2.2" ) {
        name = "Big Endian Explicit";
    }
    // JPEG baseline
    else if( dwv.dicom.isJpegBaselineTransferSyntax(syntax) ) {
        if ( syntax === "1.2.840.10008.1.2.4.50" ) {
            name = "JPEG Baseline";
        }
        else { // *.51
            name = "JPEG Extended, Process 2+4";
        }
    }
    // JPEG Lossless
    else if( dwv.dicom.isJpegLosslessTransferSyntax(syntax) ) {
        if ( syntax === "1.2.840.10008.1.2.4.57" ) {
            name = "JPEG Lossless, Nonhierarchical (Processes 14)";
        }
        else { // *.70
            name = "JPEG Lossless, Non-hierarchical, 1st Order Prediction";
        }
    }
    // Non supported JPEG
    else if( dwv.dicom.isJpegNonSupportedTransferSyntax(syntax) ) {
        name = "Non supported JPEG";
    }
    // JPEG-LS
    else if( dwv.dicom.isJpeglsTransferSyntax(syntax) ) {
        name = "JPEG-LS";
    }
    // JPEG 2000
    else if( dwv.dicom.isJpeg2000TransferSyntax(syntax) ) {
        if ( syntax === "1.2.840.10008.1.2.4.91" ) {
            name = "JPEG 2000 (Lossless or Lossy)";
        }
        else { // *.90
            name = "JPEG 2000 (Lossless only)";
        }
    }
    // MPEG2 Image Compression
    else if( syntax === "1.2.840.10008.1.2.4.100" ) {
        name = "MPEG2";
    }
    // RLE (lossless)
    else if( syntax === "1.2.840.10008.1.2.5" ) {
        name = "RLE";
    }
    // return
    return name;
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
     * The pixel buffer.
     * @property pixelBuffer
     * @type Array
     */
    this.pixelBuffer = [];
    
    /**
     * Unknown tags count.
     * @property unknownCount
     * @type Number
     */
    var unknownCount = 0;
    /**
     * Get the next unknown tags count.
     * @method getNextUnknownCount
     * @returns {Number} The next count.
     */
    this.getNextUnknownCount = function () {
        unknownCount++;    
        return unknownCount;
    }; 
};

/**
 * Get the raw DICOM data elements.
 * @method getRawDicomElements
 * @returns {Object} The raw DICOM elements.
 */
dwv.dicom.DicomParser.prototype.getRawDicomElements = function()
{
    return this.dicomElements;
};

/**
 * Get the DICOM data elements.
 * @method getDicomElements
 * @returns {Object} The DICOM elements.
 */
dwv.dicom.DicomParser.prototype.getDicomElements = function()
{
    return new dwv.dicom.DicomElementsWrapper(this.dicomElements);
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
 * If tags have same name (for the 'unknown' private tags cases), a number is appended
 * making the name unique.
 * @method appendDicomElement
 * @param {Object} element The element to add.
 * @param {Object} sequences The sequence the element belongs to (optional).
 */
dwv.dicom.DicomParser.prototype.appendDicomElement = function( element, sequences )
{
    // simple case: not a Sequence or a SequenceDelimitationItem
    if ( ( typeof sequences === "undefined" || sequences.length === 0 ) &&
            element.tag.name !== "xFFFEE0DD" ) {
        this.dicomElements[element.tag.name] = { 
            "group": element.tag.group, 
            "element": element.tag.element,
            "vr": element.vr,
            "vl": element.vl,
            "value": element.data 
        };
    }
    else {
        // storing item element as other elements
        
        // nothing to do for delimitations
        // (ItemDelimitationItem, SequenceDelimitationItem)
        if ( element.tag.name === "xFFFEE00D" ||
                element.tag.name === "xFFFEE0DD" ) {
            return;
        }
        // create root for nested sequences
        var sequenceName = sequences[0].name;
        var itemNumber = sequences[0].itemNumber;
        var root = this.dicomElements;
        for ( var i = 1; i < sequences.length; ++i ) {
            // update root with previous name and number
            if ( typeof root[sequenceName].value[itemNumber] !== "undefined" ) {
                root = root[sequenceName].value[itemNumber];
            }
            // update name and number
            sequenceName = sequences[i].name;
            itemNumber = sequences[i].itemNumber;
        }
        
        // append
        this.appendElementToSequence(root, sequenceName, itemNumber, element);
    }
};

/**
 * Append an element to a sequence.
 * @method appendElementToSequence
 * @param {Object} root The DICOM element root where to append the element.
 * @param {String} sequenceName The tail sequence name.
 * @param {Number} itemNumber The tail item number.
 * @param {Object} element The element to append.
 */
dwv.dicom.DicomParser.prototype.appendElementToSequence = function (
    root, sequenceName, itemNumber, element)
{
    // start the sequence
    if ( typeof root[sequenceName] === "undefined" ) {
        root[sequenceName] = {
            "group": element.tag.group,
            "element": element.tag.element,
            "vr": element.vr,
            "vl": element.vl,
            "value": []
        };
    }
    // continue the sequence
    else {
        // add item array if needed
        if ( typeof root[sequenceName].value[itemNumber] === "undefined" ) {
            root[sequenceName].value[itemNumber] = {};
        }
        // append element
        root[sequenceName].value[itemNumber][element.tag.name] = {
            "group": element.tag.group,
            "element": element.tag.element,
            "vr": element.vr,
            "vl": element.vl,
            "value": element.data
        };
    }
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
    var name = dwv.dicom.getGroupElementKey(group, element);
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
    
    var vr = null; // Value Representation (VR)
    var vl = 0; // Value Length (VL)
    var vrOffset = 0; // byte size of VR
    var vlOffset = 0; // byte size of VL
    
    var isOtherVR = false; // OX, OW, OB and OF
    
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
            var dict = dwv.dicom.dictionary;
            if ( typeof dict[tag.group] !== "undefined" &&
                    typeof dict[tag.group][tag.element] !== "undefined" ) {
                vr = dwv.dicom.dictionary[tag.group][tag.element][0];
            }
            isOtherVR = (vr[0].toUpperCase() === 'O');
            vrOffset = 0;
            vl = reader.readUint32( offset+tagOffset+vrOffset );
            vlOffset = 4;
        }
        else {
            vr = reader.readString( offset+tagOffset, 2 );
            isOtherVR = (vr[0] === 'O');
            vrOffset = 2;
            // long representations
            if ( isOtherVR || vr === "SQ" || vr === "UN" ) {
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
    var vlString = vl;
    if( vl === 0xffffffff ) {
        vlString = "u/l";
        vl = 0;
    }
    
    // data
    var data = null;
    var dataOffset = offset+tagOffset+vrOffset+vlOffset;
    if( isOtherVR )
    {
        // OB or BitsAllocated == 8
        if ( vr === "OB" || 
                ( typeof this.dicomElements.x00280100 !== 'undefined' &&
                    this.dicomElements.x00280100.value[0] === 8 ) ) {
            data = reader.readUint8Array( dataOffset, vl );
        }
        else {
            data = reader.readUint16Array( dataOffset, vl );
        }
    }
    // numbers
    else if( vr === "US")
    {
        data = reader.readUint16Array( dataOffset, vl );
    }
    else if( vr === "UL")
    {
        data = reader.readUint32Array( dataOffset, vl );
    }
    else if( vr === "SS")
    {
        data = reader.readInt16Array( dataOffset, vl );
    }
    else if( vr === "SL")
    {
        data = reader.readInt32Array( dataOffset, vl );
    }
    else if( vr === "FL")
    {
        data = reader.readFloat32Array( dataOffset, vl );
    }
    else if( vr === "FD")
    {
        data = reader.readFloat64Array( dataOffset, vl );
    }
    // attribute
    else if( vr === "AT")
    {
        var raw = reader.readUint16Array( dataOffset, vl );
        data = [];
        for ( var i = 0; i < raw.length; i+=2 ) {
            var stri = raw[i].toString(16);
            var stri1 = raw[i+1].toString(16);
            var str = "(";
            str += "0000".substr(0, 4 - stri.length) + stri.toUpperCase();
            str += ",";
            str += "0000".substr(0, 4 - stri1.length) + stri1.toUpperCase();
            str += ")";
            data.push(str);
        }
    }
    // not available
    else if( vr === "N/A")
    {
        data = reader.readUint8Array( dataOffset, vl );
    }
    // raw
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
        'vl': vlString, 
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
    var isJpegBaseline = false;
    var isJpegLossless = false;
    var isJpeg2000 = false;
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
    
    // 0x0002, 0x0000: FileMetaInformationGroupLength
    var dataElement = this.readDataElement(metaReader, offset);
    // store the data element
    this.appendDicomElement( dataElement );
    // get meta length
    var metaLength = parseInt(dataElement.data[0], 10);
    offset += dataElement.offset;
    
    // meta elements
    var metaStart = offset;
    var metaEnd = metaStart + metaLength;
    var i = metaStart;
    while( i < metaEnd ) 
    {
        // get the data element
        dataElement = this.readDataElement(metaReader, i, false);
        // store the data element
        this.appendDicomElement( dataElement );
        // increment index
        i += dataElement.offset;
    }
    
    // check the TransferSyntaxUID (has to be there!)
    var syntax = dwv.dicom.cleanString(this.dicomElements.x00020010.value[0]);
    
    // Explicit VR - Little Endian
    if( syntax === "1.2.840.10008.1.2.1" ) {
        // nothing to do!
    }
    // Implicit VR - Little Endian
    else if( syntax === "1.2.840.10008.1.2" ) {
        implicit = true;
    }
    // Deflated Explicit VR - Little Endian
    else if( syntax === "1.2.840.10008.1.2.1.99" ) {
        throw new Error("Unsupported DICOM transfer syntax (Deflated Explicit VR): "+syntax);
    }
    // Explicit VR - Big Endian
    else if( syntax === "1.2.840.10008.1.2.2" ) {
        dataReader = new dwv.dicom.DataReader(buffer,false);
    }
    // JPEG baseline
    else if( dwv.dicom.isJpegBaselineTransferSyntax(syntax) ) {
        isJpegBaseline = true;
        console.log("JPEG Baseline compressed DICOM data: " + syntax);
    }
    // JPEG Lossless
    else if( dwv.dicom.isJpegLosslessTransferSyntax(syntax) ) {
        isJpegLossless = true;
        console.log("JPEG Lossless compressed DICOM data: " + syntax);
    }
    // non supported JPEG
    else if( dwv.dicom.isJpegNonSupportedTransferSyntax(syntax) ) {
        throw new Error("Unsupported DICOM transfer syntax (retired JPEG): "+syntax);
    }
    // JPEG-LS
    else if( dwv.dicom.isJpeglsTransferSyntax(syntax) ) {
        //console.log("JPEG-LS compressed DICOM data: " + syntax);
        throw new Error("Unsupported DICOM transfer syntax (JPEG-LS): "+syntax);
    }
    // JPEG 2000
    else if( dwv.dicom.isJpeg2000TransferSyntax(syntax) ) {
        console.log("JPEG 2000 compressed DICOM data: " + syntax);
        isJpeg2000 = true;
    }
    // MPEG2 Image Compression
    else if( syntax === "1.2.840.10008.1.2.4.100" ) {
        throw new Error("Unsupported DICOM transfer syntax (MPEG2): "+syntax);
    }
    // RLE (lossless)
    else if( syntax === "1.2.840.10008.1.2.5" ) {
        throw new Error("Unsupported DICOM transfer syntax (RLE): "+syntax);
    }
    else {
        throw new Error("Unknown transfer syntax.");
    }

    var startedPixelItems = false;
    var tagName = "";
    var tagOffset = 0;
    var sequences = [];

    // DICOM data elements
    while( i < buffer.byteLength ) 
    {
        // get the data element
        dataElement = this.readDataElement(dataReader, i, implicit);
        
        // locals
        tagName = dataElement.tag.name;
        tagOffset = dataElement.offset;
        var vlNumber = (dataElement.vl === "u/l") ? 0 : dataElement.vl;
        
        // new sequence (either vl="u/l" or vl!=0)
        if ( dataElement.vr === "SQ" && dataElement.vl !== 0 ) {
            sequences.push( {
                'name': tagName, 'itemNumber': -1,
                'vl': dataElement.vl, 'vlCount': 0
            });
            tagOffset -= vlNumber;
        }
        // new Item
        if ( sequences.length !== 0 && tagName === "xFFFEE000" ) {
            sequences[sequences.length-1].itemNumber += 1;
            if ( !startedPixelItems ) {
                tagOffset -= vlNumber;
            }
        }
        // end of sequence with implicit length (SequenceDelimitationItem)
        else if ( tagName === "xFFFEE0DD" ) {
            sequences = sequences.slice(0, -1);
        }
        
        // store pixel data from multiple Items
        if( startedPixelItems ) {
            // Item
            if( tagName === "xFFFEE000" ) {
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
            // SequenceDelimitationItem
            else if( tagName === "xFFFEE0DD" ) {
                startedPixelItems = false;
            }
            else {
                throw new Error("Unexpected tag in encapsulated pixel data: "+dataElement.tag.name);
            }
        }
        // check the PixelData tag
        if( tagName === "x7FE00010") {
            if( dataElement.data.length !== 0 ) {
                this.pixelBuffer = dataElement.data;
            }
            else {
                // pixel data sequence
                startedPixelItems = true;
                sequences.push( {
                    'name': tagName, 'itemNumber': -1,
                    'vl': dataElement.vl, 'vlCount': 0
                });
                tagOffset -= vlNumber;
            }
        }
        
        // store the data element
        this.appendDicomElement( dataElement, sequences );
        
        // end of sequence with explicit length
        if ( dataElement.vr !== "SQ" && sequences.length !== 0 ) {
            var last = sequences.length - 1;
            sequences[last].vlCount += tagOffset;
            // check if we have reached the sequence vl
            //  and the next ones
            while ( sequences.length > 0 &&
                    sequences[last].vlCount === sequences[last].vl ) {
                // last count + size of a sequence
                var lastVlCount = sequences[last].vlCount + 8;
                // add VR size for explicit encoding
                if ( !implicit ) {
                    lastVlCount += 4;
                }
                // remove last sequence
                sequences = sequences.slice(0, -1);
                // add nested sequence vl
                if ( sequences.length !== 0 ) {
                    last = sequences.length - 1;
                    sequences[last].vlCount += lastVlCount;
                }
            }
        }
        
        // increment index
        i += tagOffset;
    }
    
    // check numberOfFrames
    if ( typeof this.dicomElements.x00280008 !== 'undefined' && 
            this.dicomElements.x00280008.value[0] > 1 ) {
        throw new Error("Unsupported multi-frame data");
    }

    // uncompress data if needed
    var decoder = null;
    if( isJpegLossless ) {
        if ( !hasJpegLosslessDecoder ) {
            throw new Error("No JPEG Lossless decoder provided");
        }
        var buf = new Uint8Array(this.pixelBuffer);
        decoder = new jpeg.lossless.Decoder(buf.buffer);
        var decoded = decoder.decode();
        this.pixelBuffer = new Uint16Array(decoded.buffer);
    }
    else if ( isJpegBaseline ) {
        if ( !hasJpegBaselineDecoder ) {
            throw new Error("No JPEG Baseline decoder provided");
        }
        decoder = new JpegImage();
        decoder.parse( this.pixelBuffer );
        this.pixelBuffer = decoder.getData(decoder.width,decoder.height);
    }
    else if( isJpeg2000 ) {
        if ( !hasJpeg2000Decoder ) {
            throw new Error("No JPEG 2000 decoder provided");
        }
        // decompress pixel buffer into Int16 image
        decoder = new JpxImage();
        decoder.parse( this.pixelBuffer );
        // set the pixel buffer
        this.pixelBuffer = decoder.tiles[0].items;
    }
};

/**
 * DicomElements wrapper.
 * @class DicomElementsWrapper
 * @namespace dwv.dicom
 * @constructor
 * @param {Array} dicomElements The elements to wrap.
 */
dwv.dicom.DicomElementsWrapper = function (dicomElements) {

    /**
    * Get a DICOM Element value from a group/element key.
    * @method getFromKey
    * @param {String} groupElementKey The key to retrieve.
    * @param {Boolean} asArray Get the value as an Array.
    * @return {Object} The DICOM element value.
    */
    this.getFromKey = function ( groupElementKey, asArray ) {
        // default
        if ( typeof asArray === "undefined" ) {
            asArray = false;
        }
        var value = null;
        var dElement = dicomElements[groupElementKey];
        if ( typeof dElement !== "undefined" ) {
            // raw value if only one
            if ( dElement.value.length === 1 && asArray === false) {
                value = dElement.value[0];
            }
            else {
                value = dElement.value;
            }
        }
        return value;
    };
    
    /**
     * Dump the DICOM tags to an array.
     * @returns {Array}
     */
    this.dumpToTable = function () {
        var keys = Object.keys(dicomElements);
        var dict = dwv.dicom.dictionary;
        var table = [];
        var dicomElement = null;
        var dictElement = null;
        var row = null;
        for ( var i = 0 ; i < keys.length; ++i ) {
            dicomElement = dicomElements[keys[i]];
            row = {};
            // trying to have name first in row
            dictElement = null;
            if ( typeof dict[dicomElement.group] !== "undefined" && 
                    typeof dict[dicomElement.group][dicomElement.element] !== "undefined") {
                dictElement = dict[dicomElement.group][dicomElement.element];
            }
            if ( dictElement !== null ) {
                row.name = dictElement[2];
            }
            else {
                row.name = "Unknown Tag & Data";
            }
            var deKeys = Object.keys(dicomElement);
            for ( var j = 0 ; j < deKeys.length; ++j ) {
                row[deKeys[j]] = dicomElement[deKeys[j]];
            }
            table.push( row );
        }
        return table;
    };

    /**
     * Dump the DICOM tags to a string.
     * @returns {String} The dumped file.
     */
    this.dump = function () {
        var keys = Object.keys(dicomElements);
        var result = "\n";
        result += "# Dicom-File-Format\n";
        result += "\n";
        result += "# Dicom-Meta-Information-Header\n";
        result += "# Used TransferSyntax: ";
        if ( dwv.dicom.isNativeLittleEndian() ) {
            result += "Little Endian Explicit\n";
        }
        else {
            result += "NOT Little Endian Explicit\n";
        }
        var dicomElement = null;
        var checkHeader = true;
        for ( var i = 0 ; i < keys.length; ++i ) {
            dicomElement = dicomElements[keys[i]];
            if ( checkHeader && dicomElement.group !== "0x0002" ) {
                result += "\n";
                result += "# Dicom-Data-Set\n";
                result += "# Used TransferSyntax: ";
                var syntax = dwv.dicom.cleanString(dicomElements.x00020010.value[0]);
                result += dwv.dicom.getTransferSyntaxName(syntax);
                result += "\n";
                checkHeader = false;
            }
            result += this.getElementAsString(dicomElement) + "\n";
        }
        return result;
    };

};

/**
 * 
 * @param group
 * @param element
 * @returns
 */
dwv.dicom.DicomElementsWrapper.prototype.getElementAsString = function ( dicomElement, prefix )
{
    // default prefix
    prefix = prefix || "";
    
    // get element from dictionary
    var dict = dwv.dicom.dictionary;
    var dictElement = null;
    if ( typeof dict[dicomElement.group] !== "undefined" && 
            typeof dict[dicomElement.group][dicomElement.element] !== "undefined") {
        dictElement = dict[dicomElement.group][dicomElement.element];
    }
    
    var deSize = dicomElement.value.length;
    var isOtherVR = ( dicomElement.vr[0].toUpperCase() === "O" );
    
    // no size for delimitations
    if ( dicomElement.group === "0xFFFE" && (
            dicomElement.element === "0xE00D" ||
            dicomElement.element === "0xE0DD" ) ) {
        deSize = 0;
    }
    else if ( isOtherVR ) {
        deSize = 1;
    }

    var isPixSequence = (dicomElement.group === '0x7FE0' && 
        dicomElement.element === '0x0010' && 
        dicomElement.vl === 'u/l');
    
    var line = null;
    
    // (group,element)
    line = "(";
    line += dicomElement.group.substr(2,5).toLowerCase();
    line += ",";
    line += dicomElement.element.substr(2,5).toLowerCase();
    line += ") ";
    // value representation
    line += dicomElement.vr;
    // value
    if ( dicomElement.vr !== "SQ" && dicomElement.value.length === 1 && dicomElement.value[0] === "" ) {
        line += " (no value available)";
        deSize = 0;
    }
    else {
        // simple number display
        if ( dicomElement.vr === "na" ) {
            line += " ";
            line += dicomElement.value[0];
        }
        // pixel sequence
        else if ( isPixSequence ) {
            line += " (PixelSequence #=" + deSize + ")";
        }
        // 'O'ther array, limited display length
        else if ( isOtherVR ||
                dicomElement.vr === 'pi' ||
                dicomElement.vr === "UL" || 
                dicomElement.vr === "US" ||
                dicomElement.vr === "SL" ||
                dicomElement.vr === "SS" ||
                dicomElement.vr === "FL" ||
                dicomElement.vr === "FD" ||
                dicomElement.vr === "AT" ) {
            line += " ";
            var valuesStr = "";
            var valueStr = "";
            for ( var k = 0; k < dicomElement.value.length; ++k ) {
                valueStr = "";
                if ( k !== 0 ) {
                    valueStr += "\\";
                }
                if ( dicomElement.vr === "FL" ) {
                    valueStr += Number(dicomElement.value[k].toPrecision(8));
                }
                else if ( isOtherVR ) {
                    var tmp = dicomElement.value[k].toString(16);
                    if ( dicomElement.vr === "OB" ) {
                        tmp = "00".substr(0, 2 - tmp.length) + tmp;
                    }
                    else {
                        tmp = "0000".substr(0, 4 - tmp.length) + tmp;
                    }
                    valueStr += tmp;
                }
                else {
                    valueStr += dicomElement.value[k];
                }
                if ( valuesStr.length + valueStr.length <= 65 ) {
                    valuesStr += valueStr;
                }
                else {
                    valuesStr += "...";
                    break;
                }
            }
            line += valuesStr;
        }
        else if ( dicomElement.vr === 'SQ' ) {
            line += " (Sequence with";
            if ( dicomElement.vl === "u/l" ) {
                line += " undefined";
            }
            else {
                line += " explicit";
            }
            line += " length #=";
    		line += dicomElement.value.length;
    		line += ")";
        }
        // default
        else {
            line += " [";
            for ( var j = 0; j < dicomElement.value.length; ++j ) {
                if ( j !== 0 ) {
                    line += "\\";
                }
                if ( typeof dicomElement.value[j] === "string" ) {
                    line += dwv.dicom.cleanString(dicomElement.value[j]);
                }
                else {
                    line += dicomElement.value[j];
                }
            }
            line += "]";
        }
    }
    
    // align #
    var nSpaces = 55 - line.length;
    if ( nSpaces > 0 ) {
        for ( var s = 0; s < nSpaces; ++s ) {
            line += " ";
        }
    }
    line += " # ";
    if ( dicomElement.vl < 100 ) {
        line += " ";
    }
    if ( dicomElement.vl < 10 ) {
        line += " ";
    }
    line += dicomElement.vl;
    line += ", ";
    line += deSize; //dictElement[1];
    line += " ";
    if ( dictElement !== null ) {
        line += dictElement[2];
    }
    else {
        line += "Unknown Tag & Data";
    }
    
    var message = null;
    
    // continue for sequence
    if ( dicomElement.vr === 'SQ' ) {
        var item = null;
        for ( var l = 0; l < dicomElement.value.length; ++l ) {
            item = dicomElement.value[l];
            var itemKeys = Object.keys(item);
            if ( itemKeys.length === 0 ) {
                continue;
            }
            
            // get the item element
            var itemElement = item.xFFFEE000;
            message = "(Item with";
            if ( itemElement.vl === "u/l" ) {
                message += " undefined";
            }
            else {
                message += " explicit";
            }
            message += " length #="+(itemKeys.length - 1)+")";
            itemElement.value = [message];
            itemElement.vr = "na";
            
            line += "\n";
            line += this.getElementAsString(itemElement, prefix + "  ");
            
            for ( var m = 0; m < itemKeys.length; ++m ) {
                if ( itemKeys[m] !== "xFFFEE000" ) {
                    line += "\n";
                    line += this.getElementAsString(item[itemKeys[m]], prefix + "    ");
                }
            }

            message = "(ItemDelimitationItem";
            if ( itemElement.vl !== "u/l" ) {
                message += " for re-encoding";
            }
            message += ")";
            var itemDelimElement = {
                    "group": "0xFFFE",
                    "element": "0xE00D",
                    "vr": "na", 
                    "vl": "0", 
                    "value": [message],
                };
                line += "\n";
                line += this.getElementAsString(itemDelimElement, prefix + "  ");

        }
        
        message = "(SequenceDelimitationItem";
        if ( dicomElement.vl !== "u/l" ) {
            message += " for re-encod.";
        }
        message += ")";
        var sqDelimElement = {
            "group": "0xFFFE",
            "element": "0xE0DD",
            "vr": "na", 
            "vl": "0", 
            "value": [message],
        };
        line += "\n";
        line += this.getElementAsString(sqDelimElement, prefix);
    }
    // pixel sequence
    else if ( isPixSequence ) {
        var pixItem = null;
        for ( var n = 0; n < dicomElement.value.length; ++n ) {
            pixItem = dicomElement.value[n];
            var pixItemKeys = Object.keys(pixItem);
            for ( var o = 0; o < pixItemKeys.length; ++o ) {
                line += "\n";
                var pixElement = pixItem[pixItemKeys[o]];
                pixElement.vr = 'pi';
                line += this.getElementAsString(pixElement, prefix + "  ");
            }
        }
        
        var pixDelimElement = {
            "group": "0xFFFE",
            "element": "0xE0DD",
            "vr": "na", 
            "vl": "0", 
            "value": ["(SequenceDelimitationItem)"],
        };
        line += "\n";
        line += this.getElementAsString(pixDelimElement, prefix);
    }

    return prefix + line;
};

/**
* Get a DICOM Element value from a group and an element.
* @method getFromGroupElement
* @param {Number} group The group.
* @param {Number} element The element.
* @return {Object} The DICOM element value.
*/
dwv.dicom.DicomElementsWrapper.prototype.getFromGroupElement = function ( 
    group, element )
{
   return this.getFromKey(
       dwv.dicom.getGroupElementKey(group, element) );
};

/**
* Get a DICOM Element value from a tag name.
* Uses the DICOM dictionary.
* @method getFromName
* @param {String} name The tag name.
* @return {Object} The DICOM element value.
*/
dwv.dicom.DicomElementsWrapper.prototype.getFromName = function ( name )
{
   var group = null;
   var element = null;
   var dict = dwv.dicom.dictionary;
   var keys0 = Object.keys(dict);
   var keys1 = null;
   var k0 = 0;
   var k1 = 0;
   // label for nested loop break
   outLabel:
   // search through dictionary 
   for ( k0 = 0; k0 < keys0.length; ++k0 ) {
       group = keys0[k0];
       keys1 = Object.keys( dict[group] );
       for ( k1 = 0; k1 < keys1.length; ++k1 ) {
           element = keys1[k1];
           if ( dict[group][element][2] === name ) {
               break outLabel;
           }
       }
   }
   var dicomElement = null;
   // check that we are not at the end of the dictionary
   if ( k0 !== keys0.length && k1 !== keys1.length ) {
       dicomElement = this.getFromKey(dwv.dicom.getGroupElementKey(group, element));
   }
   return dicomElement;
};

;/** 
 * DICOM module.
 * @module dicom
 */
var dwv = dwv || {};
dwv.dicom = dwv.dicom || {};

/**
 * DICOM tag dictionary.
 * Generated using xml standard conversion
 *  from https://github.com/ivmartel/dcmbench/tree/master/view/part06
 *  with http://medical.nema.org/medical/dicom/current/source/docbook/part06/part06.xml
 * Conversion changes: 
 * - (vr) "See Note" -> "NONE", "OB or OW" -> "ox", "US or SS" -> "xs"
 * - added "GenericGroupLength" element to each group
 * Local changes:
 * - tag numbers with 'xx' were replaced with '00', 'xxx' with '001' and 'xxxx' with '0004'
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
        '0x0000': ['UL', '1', 'FileMetaInformationGroupLength'],
        '0x0001': ['OB', '1', 'FileMetaInformationVersion'],
        '0x0002': ['UI', '1', 'MediaStorageSOPClassUID'],
        '0x0003': ['UI', '1', 'MediaStorageSOPInstanceUID'],
        '0x0010': ['UI', '1', 'TransferSyntaxUID'],
        '0x0012': ['UI', '1', 'ImplementationClassUID'],
        '0x0013': ['SH', '1', 'ImplementationVersionName'],
        '0x0016': ['AE', '1', 'SourceApplicationEntityTitle'],
        '0x0017': ['AE', '1', 'SendingApplicationEntityTitle'],
        '0x0018': ['AE', '1', 'ReceivingApplicationEntityTitle'],
        '0x0100': ['UI', '1', 'PrivateInformationCreatorUID'],
        '0x0102': ['OB', '1', 'PrivateInformation'],
    },
    '0x0004': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x1130': ['CS', '1', 'FileSetID'],
        '0x1141': ['CS', '1-8', 'FileSetDescriptorFileID'],
        '0x1142': ['CS', '1', 'SpecificCharacterSetOfFileSetDescriptorFile'],
        '0x1200': ['UL', '1', 'OffsetOfTheFirstDirectoryRecordOfTheRootDirectoryEntity'],
        '0x1202': ['UL', '1', 'OffsetOfTheLastDirectoryRecordOfTheRootDirectoryEntity'],
        '0x1212': ['US', '1', 'FileSetConsistencyFlag'],
        '0x1220': ['SQ', '1', 'DirectoryRecordSequence'],
        '0x1400': ['UL', '1', 'OffsetOfTheNextDirectoryRecord'],
        '0x1410': ['US', '1', 'RecordInUseFlag'],
        '0x1420': ['UL', '1', 'OffsetOfReferencedLowerLevelDirectoryEntity'],
        '0x1430': ['CS', '1', 'DirectoryRecordType'],
        '0x1432': ['UI', '1', 'PrivateRecordUID'],
        '0x1500': ['CS', '1-8', 'ReferencedFileID'],
        '0x1504': ['UL', '1', 'MRDRDirectoryRecordOffset'],
        '0x1510': ['UI', '1', 'ReferencedSOPClassUIDInFile'],
        '0x1511': ['UI', '1', 'ReferencedSOPInstanceUIDInFile'],
        '0x1512': ['UI', '1', 'ReferencedTransferSyntaxUIDInFile'],
        '0x151A': ['UI', '1-n', 'ReferencedRelatedGeneralSOPClassUIDInFile'],
        '0x1600': ['UL', '1', 'NumberOfReferences'],
    },
    '0x0008': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0001': ['UL', '1', 'LengthToEnd'],
        '0x0005': ['CS', '1-n', 'SpecificCharacterSet'],
        '0x0006': ['SQ', '1', 'LanguageCodeSequence'],
        '0x0008': ['CS', '2-n', 'ImageType'],
        '0x0010': ['SH', '1', 'RecognitionCode'],
        '0x0012': ['DA', '1', 'InstanceCreationDate'],
        '0x0013': ['TM', '1', 'InstanceCreationTime'],
        '0x0014': ['UI', '1', 'InstanceCreatorUID'],
        '0x0015': ['DT', '1', 'InstanceCoercionDateTime'],
        '0x0016': ['UI', '1', 'SOPClassUID'],
        '0x0018': ['UI', '1', 'SOPInstanceUID'],
        '0x001A': ['UI', '1-n', 'RelatedGeneralSOPClassUID'],
        '0x001B': ['UI', '1', 'OriginalSpecializedSOPClassUID'],
        '0x0020': ['DA', '1', 'StudyDate'],
        '0x0021': ['DA', '1', 'SeriesDate'],
        '0x0022': ['DA', '1', 'AcquisitionDate'],
        '0x0023': ['DA', '1', 'ContentDate'],
        '0x0024': ['DA', '1', 'OverlayDate'],
        '0x0025': ['DA', '1', 'CurveDate'],
        '0x002A': ['DT', '1', 'AcquisitionDateTime'],
        '0x0030': ['TM', '1', 'StudyTime'],
        '0x0031': ['TM', '1', 'SeriesTime'],
        '0x0032': ['TM', '1', 'AcquisitionTime'],
        '0x0033': ['TM', '1', 'ContentTime'],
        '0x0034': ['TM', '1', 'OverlayTime'],
        '0x0035': ['TM', '1', 'CurveTime'],
        '0x0040': ['US', '1', 'DataSetType'],
        '0x0041': ['LO', '1', 'DataSetSubtype'],
        '0x0042': ['CS', '1', 'NuclearMedicineSeriesType'],
        '0x0050': ['SH', '1', 'AccessionNumber'],
        '0x0051': ['SQ', '1', 'IssuerOfAccessionNumberSequence'],
        '0x0052': ['CS', '1', 'QueryRetrieveLevel'],
        '0x0053': ['CS', '1', 'QueryRetrieveView'],
        '0x0054': ['AE', '1-n', 'RetrieveAETitle'],
        '0x0056': ['CS', '1', 'InstanceAvailability'],
        '0x0058': ['UI', '1-n', 'FailedSOPInstanceUIDList'],
        '0x0060': ['CS', '1', 'Modality'],
        '0x0061': ['CS', '1-n', 'ModalitiesInStudy'],
        '0x0062': ['UI', '1-n', 'SOPClassesInStudy'],
        '0x0064': ['CS', '1', 'ConversionType'],
        '0x0068': ['CS', '1', 'PresentationIntentType'],
        '0x0070': ['LO', '1', 'Manufacturer'],
        '0x0080': ['LO', '1', 'InstitutionName'],
        '0x0081': ['ST', '1', 'InstitutionAddress'],
        '0x0082': ['SQ', '1', 'InstitutionCodeSequence'],
        '0x0090': ['PN', '1', 'ReferringPhysicianName'],
        '0x0092': ['ST', '1', 'ReferringPhysicianAddress'],
        '0x0094': ['SH', '1-n', 'ReferringPhysicianTelephoneNumbers'],
        '0x0096': ['SQ', '1', 'ReferringPhysicianIdentificationSequence'],
        '0x009C': ['PN', '1-n', 'ConsultingPhysicianName'],
        '0x009D': ['SQ', '1', 'ConsultingPhysicianIdentificationSequence'],
        '0x0100': ['SH', '1', 'CodeValue'],
        '0x0101': ['LO', '1', 'ExtendedCodeValue'],
        '0x0102': ['SH', '1', 'CodingSchemeDesignator'],
        '0x0103': ['SH', '1', 'CodingSchemeVersion'],
        '0x0104': ['LO', '1', 'CodeMeaning'],
        '0x0105': ['CS', '1', 'MappingResource'],
        '0x0106': ['DT', '1', 'ContextGroupVersion'],
        '0x0107': ['DT', '1', 'ContextGroupLocalVersion'],
        '0x0108': ['LT', '1', 'ExtendedCodeMeaning'],
        '0x010B': ['CS', '1', 'ContextGroupExtensionFlag'],
        '0x010C': ['UI', '1', 'CodingSchemeUID'],
        '0x010D': ['UI', '1', 'ContextGroupExtensionCreatorUID'],
        '0x010F': ['CS', '1', 'ContextIdentifier'],
        '0x0110': ['SQ', '1', 'CodingSchemeIdentificationSequence'],
        '0x0112': ['LO', '1', 'CodingSchemeRegistry'],
        '0x0114': ['ST', '1', 'CodingSchemeExternalID'],
        '0x0115': ['ST', '1', 'CodingSchemeName'],
        '0x0116': ['ST', '1', 'CodingSchemeResponsibleOrganization'],
        '0x0117': ['UI', '1', 'ContextUID'],
        '0x0118': ['UI', '1', 'MappingResourceUID'],
        '0x0119': ['UC', '1', 'LongCodeValue'],
        '0x0120': ['UR', '1', 'URNCodeValue'],
        '0x0121': ['SQ', '1', 'EquivalentCodeSequence'],
        '0x0201': ['SH', '1', 'TimezoneOffsetFromUTC'],
        '0x0300': ['SQ', '1', 'PrivateDataElementCharacteristicsSequence'],
        '0x0301': ['US', '1', 'PrivateGroupReference'],
        '0x0302': ['LO', '1', 'PrivateCreatorReference'],
        '0x0303': ['CS', '1', 'BlockIdentifyingInformationStatus'],
        '0x0304': ['US', '1-n', 'NonidentifyingPrivateElements'],
        '0x0306': ['US', '1-n', 'IdentifyingPrivateElements'],
        '0x0305': ['SQ', '1', 'DeidentificationActionSequence'],
        '0x0307': ['CS', '1', 'DeidentificationAction'],
        '0x1000': ['AE', '1', 'NetworkID'],
        '0x1010': ['SH', '1', 'StationName'],
        '0x1030': ['LO', '1', 'StudyDescription'],
        '0x1032': ['SQ', '1', 'ProcedureCodeSequence'],
        '0x103E': ['LO', '1', 'SeriesDescription'],
        '0x103F': ['SQ', '1', 'SeriesDescriptionCodeSequence'],
        '0x1040': ['LO', '1', 'InstitutionalDepartmentName'],
        '0x1048': ['PN', '1-n', 'PhysiciansOfRecord'],
        '0x1049': ['SQ', '1', 'PhysiciansOfRecordIdentificationSequence'],
        '0x1050': ['PN', '1-n', 'PerformingPhysicianName'],
        '0x1052': ['SQ', '1', 'PerformingPhysicianIdentificationSequence'],
        '0x1060': ['PN', '1-n', 'NameOfPhysiciansReadingStudy'],
        '0x1062': ['SQ', '1', 'PhysiciansReadingStudyIdentificationSequence'],
        '0x1070': ['PN', '1-n', 'OperatorsName'],
        '0x1072': ['SQ', '1', 'OperatorIdentificationSequence'],
        '0x1080': ['LO', '1-n', 'AdmittingDiagnosesDescription'],
        '0x1084': ['SQ', '1', 'AdmittingDiagnosesCodeSequence'],
        '0x1090': ['LO', '1', 'ManufacturerModelName'],
        '0x1100': ['SQ', '1', 'ReferencedResultsSequence'],
        '0x1110': ['SQ', '1', 'ReferencedStudySequence'],
        '0x1111': ['SQ', '1', 'ReferencedPerformedProcedureStepSequence'],
        '0x1115': ['SQ', '1', 'ReferencedSeriesSequence'],
        '0x1120': ['SQ', '1', 'ReferencedPatientSequence'],
        '0x1125': ['SQ', '1', 'ReferencedVisitSequence'],
        '0x1130': ['SQ', '1', 'ReferencedOverlaySequence'],
        '0x1134': ['SQ', '1', 'ReferencedStereometricInstanceSequence'],
        '0x113A': ['SQ', '1', 'ReferencedWaveformSequence'],
        '0x1140': ['SQ', '1', 'ReferencedImageSequence'],
        '0x1145': ['SQ', '1', 'ReferencedCurveSequence'],
        '0x114A': ['SQ', '1', 'ReferencedInstanceSequence'],
        '0x114B': ['SQ', '1', 'ReferencedRealWorldValueMappingInstanceSequence'],
        '0x1150': ['UI', '1', 'ReferencedSOPClassUID'],
        '0x1155': ['UI', '1', 'ReferencedSOPInstanceUID'],
        '0x115A': ['UI', '1-n', 'SOPClassesSupported'],
        '0x1160': ['IS', '1-n', 'ReferencedFrameNumber'],
        '0x1161': ['UL', '1-n', 'SimpleFrameList'],
        '0x1162': ['UL', '3-3n', 'CalculatedFrameList'],
        '0x1163': ['FD', '2', 'TimeRange'],
        '0x1164': ['SQ', '1', 'FrameExtractionSequence'],
        '0x1167': ['UI', '1', 'MultiFrameSourceSOPInstanceUID'],
        '0x1190': ['UR', '1', 'RetrieveURL'],
        '0x1195': ['UI', '1', 'TransactionUID'],
        '0x1196': ['US', '1', 'WarningReason'],
        '0x1197': ['US', '1', 'FailureReason'],
        '0x1198': ['SQ', '1', 'FailedSOPSequence'],
        '0x1199': ['SQ', '1', 'ReferencedSOPSequence'],
        '0x1200': ['SQ', '1', 'StudiesContainingOtherReferencedInstancesSequence'],
        '0x1250': ['SQ', '1', 'RelatedSeriesSequence'],
        '0x2110': ['CS', '1', 'LossyImageCompressionRetired'],
        '0x2111': ['ST', '1', 'DerivationDescription'],
        '0x2112': ['SQ', '1', 'SourceImageSequence'],
        '0x2120': ['SH', '1', 'StageName'],
        '0x2122': ['IS', '1', 'StageNumber'],
        '0x2124': ['IS', '1', 'NumberOfStages'],
        '0x2127': ['SH', '1', 'ViewName'],
        '0x2128': ['IS', '1', 'ViewNumber'],
        '0x2129': ['IS', '1', 'NumberOfEventTimers'],
        '0x212A': ['IS', '1', 'NumberOfViewsInStage'],
        '0x2130': ['DS', '1-n', 'EventElapsedTimes'],
        '0x2132': ['LO', '1-n', 'EventTimerNames'],
        '0x2133': ['SQ', '1', 'EventTimerSequence'],
        '0x2134': ['FD', '1', 'EventTimeOffset'],
        '0x2135': ['SQ', '1', 'EventCodeSequence'],
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
        '0x2251': ['SQ', '1', 'AnatomicStructureSpaceOrRegionCodeSequenceTrial'],
        '0x2253': ['SQ', '1', 'AnatomicPortalOfEntranceCodeSequenceTrial'],
        '0x2255': ['SQ', '1', 'AnatomicApproachDirectionCodeSequenceTrial'],
        '0x2256': ['ST', '1', 'AnatomicPerspectiveDescriptionTrial'],
        '0x2257': ['SQ', '1', 'AnatomicPerspectiveCodeSequenceTrial'],
        '0x2258': ['ST', '1', 'AnatomicLocationOfExaminingInstrumentDescriptionTrial'],
        '0x2259': ['SQ', '1', 'AnatomicLocationOfExaminingInstrumentCodeSequenceTrial'],
        '0x225A': ['SQ', '1', 'AnatomicStructureSpaceOrRegionModifierCodeSequenceTrial'],
        '0x225C': ['SQ', '1', 'OnAxisBackgroundAnatomicStructureCodeSequenceTrial'],
        '0x3001': ['SQ', '1', 'AlternateRepresentationSequence'],
        '0x3010': ['UI', '1-n', 'IrradiationEventUID'],
        '0x3011': ['SQ', '1', 'SourceIrradiationEventSequence'],
        '0x3012': ['UI', '1', 'RadiopharmaceuticalAdministrationEventUID'],
        '0x4000': ['LT', '1', 'IdentifyingComments'],
        '0x9007': ['CS', '4', 'FrameType'],
        '0x9092': ['SQ', '1', 'ReferencedImageEvidenceSequence'],
        '0x9121': ['SQ', '1', 'ReferencedRawDataSequence'],
        '0x9123': ['UI', '1', 'CreatorVersionUID'],
        '0x9124': ['SQ', '1', 'DerivationImageSequence'],
        '0x9154': ['SQ', '1', 'SourceImageEvidenceSequence'],
        '0x9205': ['CS', '1', 'PixelPresentation'],
        '0x9206': ['CS', '1', 'VolumetricProperties'],
        '0x9207': ['CS', '1', 'VolumeBasedCalculationTechnique'],
        '0x9208': ['CS', '1', 'ComplexImageComponent'],
        '0x9209': ['CS', '1', 'AcquisitionContrast'],
        '0x9215': ['SQ', '1', 'DerivationCodeSequence'],
        '0x9237': ['SQ', '1', 'ReferencedPresentationStateSequence'],
        '0x9410': ['SQ', '1', 'ReferencedOtherPlaneSequence'],
        '0x9458': ['SQ', '1', 'FrameDisplaySequence'],
        '0x9459': ['FL', '1', 'RecommendedDisplayFrameRateInFloat'],
        '0x9460': ['CS', '1', 'SkipFrameRangeFlag'],
    },
    '0x0010': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0010': ['PN', '1', 'PatientName'],
        '0x0020': ['LO', '1', 'PatientID'],
        '0x0021': ['LO', '1', 'IssuerOfPatientID'],
        '0x0022': ['CS', '1', 'TypeOfPatientID'],
        '0x0024': ['SQ', '1', 'IssuerOfPatientIDQualifiersSequence'],
        '0x0030': ['DA', '1', 'PatientBirthDate'],
        '0x0032': ['TM', '1', 'PatientBirthTime'],
        '0x0040': ['CS', '1', 'PatientSex'],
        '0x0050': ['SQ', '1', 'PatientInsurancePlanCodeSequence'],
        '0x0101': ['SQ', '1', 'PatientPrimaryLanguageCodeSequence'],
        '0x0102': ['SQ', '1', 'PatientPrimaryLanguageModifierCodeSequence'],
        '0x0200': ['CS', '1', 'QualityControlSubject'],
        '0x0201': ['SQ', '1', 'QualityControlSubjectTypeCodeSequence'],
        '0x1000': ['LO', '1-n', 'OtherPatientIDs'],
        '0x1001': ['PN', '1-n', 'OtherPatientNames'],
        '0x1002': ['SQ', '1', 'OtherPatientIDsSequence'],
        '0x1005': ['PN', '1', 'PatientBirthName'],
        '0x1010': ['AS', '1', 'PatientAge'],
        '0x1020': ['DS', '1', 'PatientSize'],
        '0x1021': ['SQ', '1', 'PatientSizeCodeSequence'],
        '0x1030': ['DS', '1', 'PatientWeight'],
        '0x1040': ['LO', '1', 'PatientAddress'],
        '0x1050': ['LO', '1-n', 'InsurancePlanIdentification'],
        '0x1060': ['PN', '1', 'PatientMotherBirthName'],
        '0x1080': ['LO', '1', 'MilitaryRank'],
        '0x1081': ['LO', '1', 'BranchOfService'],
        '0x1090': ['LO', '1', 'MedicalRecordLocator'],
        '0x1100': ['SQ', '1', 'ReferencedPatientPhotoSequence'],
        '0x2000': ['LO', '1-n', 'MedicalAlerts'],
        '0x2110': ['LO', '1-n', 'Allergies'],
        '0x2150': ['LO', '1', 'CountryOfResidence'],
        '0x2152': ['LO', '1', 'RegionOfResidence'],
        '0x2154': ['SH', '1-n', 'PatientTelephoneNumbers'],
        '0x2155': ['LT', '1', 'PatientTelecomInformation'],
        '0x2160': ['SH', '1', 'EthnicGroup'],
        '0x2180': ['SH', '1', 'Occupation'],
        '0x21A0': ['CS', '1', 'SmokingStatus'],
        '0x21B0': ['LT', '1', 'AdditionalPatientHistory'],
        '0x21C0': ['US', '1', 'PregnancyStatus'],
        '0x21D0': ['DA', '1', 'LastMenstrualDate'],
        '0x21F0': ['LO', '1', 'PatientReligiousPreference'],
        '0x2201': ['LO', '1', 'PatientSpeciesDescription'],
        '0x2202': ['SQ', '1', 'PatientSpeciesCodeSequence'],
        '0x2203': ['CS', '1', 'PatientSexNeutered'],
        '0x2210': ['CS', '1', 'AnatomicalOrientationType'],
        '0x2292': ['LO', '1', 'PatientBreedDescription'],
        '0x2293': ['SQ', '1', 'PatientBreedCodeSequence'],
        '0x2294': ['SQ', '1', 'BreedRegistrationSequence'],
        '0x2295': ['LO', '1', 'BreedRegistrationNumber'],
        '0x2296': ['SQ', '1', 'BreedRegistryCodeSequence'],
        '0x2297': ['PN', '1', 'ResponsiblePerson'],
        '0x2298': ['CS', '1', 'ResponsiblePersonRole'],
        '0x2299': ['LO', '1', 'ResponsibleOrganization'],
        '0x4000': ['LT', '1', 'PatientComments'],
        '0x9431': ['FL', '1', 'ExaminedBodyThickness'],
    },
    '0x0012': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0010': ['LO', '1', 'ClinicalTrialSponsorName'],
        '0x0020': ['LO', '1', 'ClinicalTrialProtocolID'],
        '0x0021': ['LO', '1', 'ClinicalTrialProtocolName'],
        '0x0030': ['LO', '1', 'ClinicalTrialSiteID'],
        '0x0031': ['LO', '1', 'ClinicalTrialSiteName'],
        '0x0040': ['LO', '1', 'ClinicalTrialSubjectID'],
        '0x0042': ['LO', '1', 'ClinicalTrialSubjectReadingID'],
        '0x0050': ['LO', '1', 'ClinicalTrialTimePointID'],
        '0x0051': ['ST', '1', 'ClinicalTrialTimePointDescription'],
        '0x0060': ['LO', '1', 'ClinicalTrialCoordinatingCenterName'],
        '0x0062': ['CS', '1', 'PatientIdentityRemoved'],
        '0x0063': ['LO', '1-n', 'DeidentificationMethod'],
        '0x0064': ['SQ', '1', 'DeidentificationMethodCodeSequence'],
        '0x0071': ['LO', '1', 'ClinicalTrialSeriesID'],
        '0x0072': ['LO', '1', 'ClinicalTrialSeriesDescription'],
        '0x0081': ['LO', '1', 'ClinicalTrialProtocolEthicsCommitteeName'],
        '0x0082': ['LO', '1', 'ClinicalTrialProtocolEthicsCommitteeApprovalNumber'],
        '0x0083': ['SQ', '1', 'ConsentForClinicalTrialUseSequence'],
        '0x0084': ['CS', '1', 'DistributionType'],
        '0x0085': ['CS', '1', 'ConsentForDistributionFlag'],
    },
    '0x0014': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0023': ['ST', '1-n', 'CADFileFormat'],
        '0x0024': ['ST', '1-n', 'ComponentReferenceSystem'],
        '0x0025': ['ST', '1-n', 'ComponentManufacturingProcedure'],
        '0x0028': ['ST', '1-n', 'ComponentManufacturer'],
        '0x0030': ['DS', '1-n', 'MaterialThickness'],
        '0x0032': ['DS', '1-n', 'MaterialPipeDiameter'],
        '0x0034': ['DS', '1-n', 'MaterialIsolationDiameter'],
        '0x0042': ['ST', '1-n', 'MaterialGrade'],
        '0x0044': ['ST', '1-n', 'MaterialPropertiesDescription'],
        '0x0045': ['ST', '1-n', 'MaterialPropertiesFileFormatRetired'],
        '0x0046': ['LT', '1', 'MaterialNotes'],
        '0x0050': ['CS', '1', 'ComponentShape'],
        '0x0052': ['CS', '1', 'CurvatureType'],
        '0x0054': ['DS', '1', 'OuterDiameter'],
        '0x0056': ['DS', '1', 'InnerDiameter'],
        '0x1010': ['ST', '1', 'ActualEnvironmentalConditions'],
        '0x1020': ['DA', '1', 'ExpiryDate'],
        '0x1040': ['ST', '1', 'EnvironmentalConditions'],
        '0x2002': ['SQ', '1', 'EvaluatorSequence'],
        '0x2004': ['IS', '1', 'EvaluatorNumber'],
        '0x2006': ['PN', '1', 'EvaluatorName'],
        '0x2008': ['IS', '1', 'EvaluationAttempt'],
        '0x2012': ['SQ', '1', 'IndicationSequence'],
        '0x2014': ['IS', '1', 'IndicationNumber'],
        '0x2016': ['SH', '1', 'IndicationLabel'],
        '0x2018': ['ST', '1', 'IndicationDescription'],
        '0x201A': ['CS', '1-n', 'IndicationType'],
        '0x201C': ['CS', '1', 'IndicationDisposition'],
        '0x201E': ['SQ', '1', 'IndicationROISequence'],
        '0x2030': ['SQ', '1', 'IndicationPhysicalPropertySequence'],
        '0x2032': ['SH', '1', 'PropertyLabel'],
        '0x2202': ['IS', '1', 'CoordinateSystemNumberOfAxes'],
        '0x2204': ['SQ', '1', 'CoordinateSystemAxesSequence'],
        '0x2206': ['ST', '1', 'CoordinateSystemAxisDescription'],
        '0x2208': ['CS', '1', 'CoordinateSystemDataSetMapping'],
        '0x220A': ['IS', '1', 'CoordinateSystemAxisNumber'],
        '0x220C': ['CS', '1', 'CoordinateSystemAxisType'],
        '0x220E': ['CS', '1', 'CoordinateSystemAxisUnits'],
        '0x2210': ['OB', '1', 'CoordinateSystemAxisValues'],
        '0x2220': ['SQ', '1', 'CoordinateSystemTransformSequence'],
        '0x2222': ['ST', '1', 'TransformDescription'],
        '0x2224': ['IS', '1', 'TransformNumberOfAxes'],
        '0x2226': ['IS', '1-n', 'TransformOrderOfAxes'],
        '0x2228': ['CS', '1', 'TransformedAxisUnits'],
        '0x222A': ['DS', '1-n', 'CoordinateSystemTransformRotationAndScaleMatrix'],
        '0x222C': ['DS', '1-n', 'CoordinateSystemTransformTranslationMatrix'],
        '0x3011': ['DS', '1', 'InternalDetectorFrameTime'],
        '0x3012': ['DS', '1', 'NumberOfFramesIntegrated'],
        '0x3020': ['SQ', '1', 'DetectorTemperatureSequence'],
        '0x3022': ['ST', '1', 'SensorName'],
        '0x3024': ['DS', '1', 'HorizontalOffsetOfSensor'],
        '0x3026': ['DS', '1', 'VerticalOffsetOfSensor'],
        '0x3028': ['DS', '1', 'SensorTemperature'],
        '0x3040': ['SQ', '1', 'DarkCurrentSequence'],
        '0x3050': ['ox', '1', 'DarkCurrentCounts'],
        '0x3060': ['SQ', '1', 'GainCorrectionReferenceSequence'],
        '0x3070': ['ox', '1', 'AirCounts'],
        '0x3071': ['DS', '1', 'KVUsedInGainCalibration'],
        '0x3072': ['DS', '1', 'MAUsedInGainCalibration'],
        '0x3073': ['DS', '1', 'NumberOfFramesUsedForIntegration'],
        '0x3074': ['LO', '1', 'FilterMaterialUsedInGainCalibration'],
        '0x3075': ['DS', '1', 'FilterThicknessUsedInGainCalibration'],
        '0x3076': ['DA', '1', 'DateOfGainCalibration'],
        '0x3077': ['TM', '1', 'TimeOfGainCalibration'],
        '0x3080': ['OB', '1', 'BadPixelImage'],
        '0x3099': ['LT', '1', 'CalibrationNotes'],
        '0x4002': ['SQ', '1', 'PulserEquipmentSequence'],
        '0x4004': ['CS', '1', 'PulserType'],
        '0x4006': ['LT', '1', 'PulserNotes'],
        '0x4008': ['SQ', '1', 'ReceiverEquipmentSequence'],
        '0x400A': ['CS', '1', 'AmplifierType'],
        '0x400C': ['LT', '1', 'ReceiverNotes'],
        '0x400E': ['SQ', '1', 'PreAmplifierEquipmentSequence'],
        '0x400F': ['LT', '1', 'PreAmplifierNotes'],
        '0x4010': ['SQ', '1', 'TransmitTransducerSequence'],
        '0x4011': ['SQ', '1', 'ReceiveTransducerSequence'],
        '0x4012': ['US', '1', 'NumberOfElements'],
        '0x4013': ['CS', '1', 'ElementShape'],
        '0x4014': ['DS', '1', 'ElementDimensionA'],
        '0x4015': ['DS', '1', 'ElementDimensionB'],
        '0x4016': ['DS', '1', 'ElementPitchA'],
        '0x4017': ['DS', '1', 'MeasuredBeamDimensionA'],
        '0x4018': ['DS', '1', 'MeasuredBeamDimensionB'],
        '0x4019': ['DS', '1', 'LocationOfMeasuredBeamDiameter'],
        '0x401A': ['DS', '1', 'NominalFrequency'],
        '0x401B': ['DS', '1', 'MeasuredCenterFrequency'],
        '0x401C': ['DS', '1', 'MeasuredBandwidth'],
        '0x401D': ['DS', '1', 'ElementPitchB'],
        '0x4020': ['SQ', '1', 'PulserSettingsSequence'],
        '0x4022': ['DS', '1', 'PulseWidth'],
        '0x4024': ['DS', '1', 'ExcitationFrequency'],
        '0x4026': ['CS', '1', 'ModulationType'],
        '0x4028': ['DS', '1', 'Damping'],
        '0x4030': ['SQ', '1', 'ReceiverSettingsSequence'],
        '0x4031': ['DS', '1', 'AcquiredSoundpathLength'],
        '0x4032': ['CS', '1', 'AcquisitionCompressionType'],
        '0x4033': ['IS', '1', 'AcquisitionSampleSize'],
        '0x4034': ['DS', '1', 'RectifierSmoothing'],
        '0x4035': ['SQ', '1', 'DACSequence'],
        '0x4036': ['CS', '1', 'DACType'],
        '0x4038': ['DS', '1-n', 'DACGainPoints'],
        '0x403A': ['DS', '1-n', 'DACTimePoints'],
        '0x403C': ['DS', '1-n', 'DACAmplitude'],
        '0x4040': ['SQ', '1', 'PreAmplifierSettingsSequence'],
        '0x4050': ['SQ', '1', 'TransmitTransducerSettingsSequence'],
        '0x4051': ['SQ', '1', 'ReceiveTransducerSettingsSequence'],
        '0x4052': ['DS', '1', 'IncidentAngle'],
        '0x4054': ['ST', '1', 'CouplingTechnique'],
        '0x4056': ['ST', '1', 'CouplingMedium'],
        '0x4057': ['DS', '1', 'CouplingVelocity'],
        '0x4058': ['DS', '1', 'ProbeCenterLocationX'],
        '0x4059': ['DS', '1', 'ProbeCenterLocationZ'],
        '0x405A': ['DS', '1', 'SoundPathLength'],
        '0x405C': ['ST', '1', 'DelayLawIdentifier'],
        '0x4060': ['SQ', '1', 'GateSettingsSequence'],
        '0x4062': ['DS', '1', 'GateThreshold'],
        '0x4064': ['DS', '1', 'VelocityOfSound'],
        '0x4070': ['SQ', '1', 'CalibrationSettingsSequence'],
        '0x4072': ['ST', '1', 'CalibrationProcedure'],
        '0x4074': ['SH', '1', 'ProcedureVersion'],
        '0x4076': ['DA', '1', 'ProcedureCreationDate'],
        '0x4078': ['DA', '1', 'ProcedureExpirationDate'],
        '0x407A': ['DA', '1', 'ProcedureLastModifiedDate'],
        '0x407C': ['TM', '1-n', 'CalibrationTime'],
        '0x407E': ['DA', '1-n', 'CalibrationDate'],
        '0x4080': ['SQ', '1', 'ProbeDriveEquipmentSequence'],
        '0x4081': ['CS', '1', 'DriveType'],
        '0x4082': ['LT', '1', 'ProbeDriveNotes'],
        '0x4083': ['SQ', '1', 'DriveProbeSequence'],
        '0x4084': ['DS', '1', 'ProbeInductance'],
        '0x4085': ['DS', '1', 'ProbeResistance'],
        '0x4086': ['SQ', '1', 'ReceiveProbeSequence'],
        '0x4087': ['SQ', '1', 'ProbeDriveSettingsSequence'],
        '0x4088': ['DS', '1', 'BridgeResistors'],
        '0x4089': ['DS', '1', 'ProbeOrientationAngle'],
        '0x408B': ['DS', '1', 'UserSelectedGainY'],
        '0x408C': ['DS', '1', 'UserSelectedPhase'],
        '0x408D': ['DS', '1', 'UserSelectedOffsetX'],
        '0x408E': ['DS', '1', 'UserSelectedOffsetY'],
        '0x4091': ['SQ', '1', 'ChannelSettingsSequence'],
        '0x4092': ['DS', '1', 'ChannelThreshold'],
        '0x409A': ['SQ', '1', 'ScannerSettingsSequence'],
        '0x409B': ['ST', '1', 'ScanProcedure'],
        '0x409C': ['DS', '1', 'TranslationRateX'],
        '0x409D': ['DS', '1', 'TranslationRateY'],
        '0x409F': ['DS', '1', 'ChannelOverlap'],
        '0x40A0': ['LO', '1', 'ImageQualityIndicatorType'],
        '0x40A1': ['LO', '1', 'ImageQualityIndicatorMaterial'],
        '0x40A2': ['LO', '1', 'ImageQualityIndicatorSize'],
        '0x5002': ['IS', '1', 'LINACEnergy'],
        '0x5004': ['IS', '1', 'LINACOutput'],
        '0x5100': ['US', '1', 'ActiveAperture'],
        '0x5101': ['DS', '1', 'TotalAperture'],
        '0x5102': ['DS', '1', 'ApertureElevation'],
        '0x5103': ['DS', '1', 'MainLobeAngle'],
        '0x5104': ['DS', '1', 'MainRoofAngle'],
        '0x5105': ['CS', '1', 'ConnectorType'],
        '0x5106': ['SH', '1', 'WedgeModelNumber'],
        '0x5107': ['DS', '1', 'WedgeAngleFloat'],
        '0x5108': ['DS', '1', 'WedgeRoofAngle'],
        '0x5109': ['CS', '1', 'WedgeElement1Position'],
        '0x510A': ['DS', '1', 'WedgeMaterialVelocity'],
        '0x510B': ['SH', '1', 'WedgeMaterial'],
        '0x510C': ['DS', '1', 'WedgeOffsetZ'],
        '0x510D': ['DS', '1', 'WedgeOriginOffsetX'],
        '0x510E': ['DS', '1', 'WedgeTimeDelay'],
        '0x510F': ['SH', '1', 'WedgeName'],
        '0x5110': ['SH', '1', 'WedgeManufacturerName'],
        '0x5111': ['LO', '1', 'WedgeDescription'],
        '0x5112': ['DS', '1', 'NominalBeamAngle'],
        '0x5113': ['DS', '1', 'WedgeOffsetX'],
        '0x5114': ['DS', '1', 'WedgeOffsetY'],
        '0x5115': ['DS', '1', 'WedgeTotalLength'],
        '0x5116': ['DS', '1', 'WedgeInContactLength'],
        '0x5117': ['DS', '1', 'WedgeFrontGap'],
        '0x5118': ['DS', '1', 'WedgeTotalHeight'],
        '0x5119': ['DS', '1', 'WedgeFrontHeight'],
        '0x511A': ['DS', '1', 'WedgeRearHeight'],
        '0x511B': ['DS', '1', 'WedgeTotalWidth'],
        '0x511C': ['DS', '1', 'WedgeInContactWidth'],
        '0x511D': ['DS', '1', 'WedgeChamferHeight'],
        '0x511E': ['CS', '1', 'WedgeCurve'],
        '0x511F': ['DS', '1', 'RadiusAlongWedge'],
    },
    '0x0018': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0010': ['LO', '1', 'ContrastBolusAgent'],
        '0x0012': ['SQ', '1', 'ContrastBolusAgentSequence'],
        '0x0013': ['FL', '1', 'ContrastBolusT1Relaxivity'],
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
        '0x0029': ['SQ', '1', 'InterventionDrugCodeSequence'],
        '0x002A': ['SQ', '1', 'AdditionalDrugSequence'],
        '0x0030': ['LO', '1-n', 'Radionuclide'],
        '0x0031': ['LO', '1', 'Radiopharmaceutical'],
        '0x0032': ['DS', '1', 'EnergyWindowCenterline'],
        '0x0033': ['DS', '1-n', 'EnergyWindowTotalWidth'],
        '0x0034': ['LO', '1', 'InterventionDrugName'],
        '0x0035': ['TM', '1', 'InterventionDrugStartTime'],
        '0x0036': ['SQ', '1', 'InterventionSequence'],
        '0x0037': ['CS', '1', 'TherapyType'],
        '0x0038': ['CS', '1', 'InterventionStatus'],
        '0x0039': ['CS', '1', 'TherapyDescription'],
        '0x003A': ['ST', '1', 'InterventionDescription'],
        '0x0040': ['IS', '1', 'CineRate'],
        '0x0042': ['CS', '1', 'InitialCineRunState'],
        '0x0050': ['DS', '1', 'SliceThickness'],
        '0x0060': ['DS', '1', 'KVP'],
        '0x0070': ['IS', '1', 'CountsAccumulated'],
        '0x0071': ['CS', '1', 'AcquisitionTerminationCondition'],
        '0x0072': ['DS', '1', 'EffectiveDuration'],
        '0x0073': ['CS', '1', 'AcquisitionStartCondition'],
        '0x0074': ['IS', '1', 'AcquisitionStartConditionData'],
        '0x0075': ['IS', '1', 'AcquisitionTerminationConditionData'],
        '0x0080': ['DS', '1', 'RepetitionTime'],
        '0x0081': ['DS', '1', 'EchoTime'],
        '0x0082': ['DS', '1', 'InversionTime'],
        '0x0083': ['DS', '1', 'NumberOfAverages'],
        '0x0084': ['DS', '1', 'ImagingFrequency'],
        '0x0085': ['SH', '1', 'ImagedNucleus'],
        '0x0086': ['IS', '1-n', 'EchoNumbers'],
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
        '0x1019': ['LO', '1-n', 'SecondaryCaptureDeviceSoftwareVersions'],
        '0x101A': ['LO', '1-n', 'HardcopyDeviceSoftwareVersion'],
        '0x101B': ['LO', '1', 'HardcopyDeviceManufacturerModelName'],
        '0x1020': ['LO', '1-n', 'SoftwareVersions'],
        '0x1022': ['SH', '1', 'VideoImageFormatAcquired'],
        '0x1023': ['LO', '1', 'DigitalImageFormatAcquired'],
        '0x1030': ['LO', '1', 'ProtocolName'],
        '0x1040': ['LO', '1', 'ContrastBolusRoute'],
        '0x1041': ['DS', '1', 'ContrastBolusVolume'],
        '0x1042': ['TM', '1', 'ContrastBolusStartTime'],
        '0x1043': ['TM', '1', 'ContrastBolusStopTime'],
        '0x1044': ['DS', '1', 'ContrastBolusTotalDose'],
        '0x1045': ['IS', '1', 'SyringeCounts'],
        '0x1046': ['DS', '1-n', 'ContrastFlowRate'],
        '0x1047': ['DS', '1-n', 'ContrastFlowDuration'],
        '0x1048': ['CS', '1', 'ContrastBolusIngredient'],
        '0x1049': ['DS', '1', 'ContrastBolusIngredientConcentration'],
        '0x1050': ['DS', '1', 'SpatialResolution'],
        '0x1060': ['DS', '1', 'TriggerTime'],
        '0x1061': ['LO', '1', 'TriggerSourceOrType'],
        '0x1062': ['IS', '1', 'NominalInterval'],
        '0x1063': ['DS', '1', 'FrameTime'],
        '0x1064': ['LO', '1', 'CardiacFramingType'],
        '0x1065': ['DS', '1-n', 'FrameTimeVector'],
        '0x1066': ['DS', '1', 'FrameDelay'],
        '0x1067': ['DS', '1', 'ImageTriggerDelay'],
        '0x1068': ['DS', '1', 'MultiplexGroupTimeOffset'],
        '0x1069': ['DS', '1', 'TriggerTimeOffset'],
        '0x106A': ['CS', '1', 'SynchronizationTrigger'],
        '0x106C': ['US', '2', 'SynchronizationChannel'],
        '0x106E': ['UL', '1', 'TriggerSamplePosition'],
        '0x1070': ['LO', '1', 'RadiopharmaceuticalRoute'],
        '0x1071': ['DS', '1', 'RadiopharmaceuticalVolume'],
        '0x1072': ['TM', '1', 'RadiopharmaceuticalStartTime'],
        '0x1073': ['TM', '1', 'RadiopharmaceuticalStopTime'],
        '0x1074': ['DS', '1', 'RadionuclideTotalDose'],
        '0x1075': ['DS', '1', 'RadionuclideHalfLife'],
        '0x1076': ['DS', '1', 'RadionuclidePositronFraction'],
        '0x1077': ['DS', '1', 'RadiopharmaceuticalSpecificActivity'],
        '0x1078': ['DT', '1', 'RadiopharmaceuticalStartDateTime'],
        '0x1079': ['DT', '1', 'RadiopharmaceuticalStopDateTime'],
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
        '0x1134': ['CS', '1', 'TableMotion'],
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
        '0x1149': ['IS', '1-2', 'FieldOfViewDimensions'],
        '0x1150': ['IS', '1', 'ExposureTime'],
        '0x1151': ['IS', '1', 'XRayTubeCurrent'],
        '0x1152': ['IS', '1', 'Exposure'],
        '0x1153': ['IS', '1', 'ExposureInuAs'],
        '0x1154': ['DS', '1', 'AveragePulseWidth'],
        '0x1155': ['CS', '1', 'RadiationSetting'],
        '0x1156': ['CS', '1', 'RectificationType'],
        '0x115A': ['CS', '1', 'RadiationMode'],
        '0x115E': ['DS', '1', 'ImageAndFluoroscopyAreaDoseProduct'],
        '0x1160': ['SH', '1', 'FilterType'],
        '0x1161': ['LO', '1-n', 'TypeOfFilters'],
        '0x1162': ['DS', '1', 'IntensifierSize'],
        '0x1164': ['DS', '2', 'ImagerPixelSpacing'],
        '0x1166': ['CS', '1-n', 'Grid'],
        '0x1170': ['IS', '1', 'GeneratorPower'],
        '0x1180': ['SH', '1', 'CollimatorGridName'],
        '0x1181': ['CS', '1', 'CollimatorType'],
        '0x1182': ['IS', '1-2', 'FocalDistance'],
        '0x1183': ['DS', '1-2', 'XFocusCenter'],
        '0x1184': ['DS', '1-2', 'YFocusCenter'],
        '0x1190': ['DS', '1-n', 'FocalSpots'],
        '0x1191': ['CS', '1', 'AnodeTargetMaterial'],
        '0x11A0': ['DS', '1', 'BodyPartThickness'],
        '0x11A2': ['DS', '1', 'CompressionForce'],
        '0x11A4': ['LO', '1', 'PaddleDescription'],
        '0x1200': ['DA', '1-n', 'DateOfLastCalibration'],
        '0x1201': ['TM', '1-n', 'TimeOfLastCalibration'],
        '0x1202': ['DT', '1', 'DateTimeOfLastCalibration'],
        '0x1210': ['SH', '1-n', 'ConvolutionKernel'],
        '0x1240': ['IS', '1-n', 'UpperLowerPixelValues'],
        '0x1242': ['IS', '1', 'ActualFrameDuration'],
        '0x1243': ['IS', '1', 'CountRate'],
        '0x1244': ['US', '1', 'PreferredPlaybackSequencing'],
        '0x1250': ['SH', '1', 'ReceiveCoilName'],
        '0x1251': ['SH', '1', 'TransmitCoilName'],
        '0x1260': ['SH', '1', 'PlateType'],
        '0x1261': ['LO', '1', 'PhosphorType'],
        '0x1300': ['DS', '1', 'ScanVelocity'],
        '0x1301': ['CS', '1-n', 'WholeBodyTechnique'],
        '0x1302': ['IS', '1', 'ScanLength'],
        '0x1310': ['US', '4', 'AcquisitionMatrix'],
        '0x1312': ['CS', '1', 'InPlanePhaseEncodingDirection'],
        '0x1314': ['DS', '1', 'FlipAngle'],
        '0x1315': ['CS', '1', 'VariableFlipAngleFlag'],
        '0x1316': ['DS', '1', 'SAR'],
        '0x1318': ['DS', '1', 'dBdt'],
        '0x1400': ['LO', '1', 'AcquisitionDeviceProcessingDescription'],
        '0x1401': ['LO', '1', 'AcquisitionDeviceProcessingCode'],
        '0x1402': ['CS', '1', 'CassetteOrientation'],
        '0x1403': ['CS', '1', 'CassetteSize'],
        '0x1404': ['US', '1', 'ExposuresOnPlate'],
        '0x1405': ['IS', '1', 'RelativeXRayExposure'],
        '0x1411': ['DS', '1', 'ExposureIndex'],
        '0x1412': ['DS', '1', 'TargetExposureIndex'],
        '0x1413': ['DS', '1', 'DeviationIndex'],
        '0x1450': ['DS', '1', 'ColumnAngulation'],
        '0x1460': ['DS', '1', 'TomoLayerHeight'],
        '0x1470': ['DS', '1', 'TomoAngle'],
        '0x1480': ['DS', '1', 'TomoTime'],
        '0x1490': ['CS', '1', 'TomoType'],
        '0x1491': ['CS', '1', 'TomoClass'],
        '0x1495': ['IS', '1', 'NumberOfTomosynthesisSourceImages'],
        '0x1500': ['CS', '1', 'PositionerMotion'],
        '0x1508': ['CS', '1', 'PositionerType'],
        '0x1510': ['DS', '1', 'PositionerPrimaryAngle'],
        '0x1511': ['DS', '1', 'PositionerSecondaryAngle'],
        '0x1520': ['DS', '1-n', 'PositionerPrimaryAngleIncrement'],
        '0x1521': ['DS', '1-n', 'PositionerSecondaryAngleIncrement'],
        '0x1530': ['DS', '1', 'DetectorPrimaryAngle'],
        '0x1531': ['DS', '1', 'DetectorSecondaryAngle'],
        '0x1600': ['CS', '1-3', 'ShutterShape'],
        '0x1602': ['IS', '1', 'ShutterLeftVerticalEdge'],
        '0x1604': ['IS', '1', 'ShutterRightVerticalEdge'],
        '0x1606': ['IS', '1', 'ShutterUpperHorizontalEdge'],
        '0x1608': ['IS', '1', 'ShutterLowerHorizontalEdge'],
        '0x1610': ['IS', '2', 'CenterOfCircularShutter'],
        '0x1612': ['IS', '1', 'RadiusOfCircularShutter'],
        '0x1620': ['IS', '2-2n', 'VerticesOfThePolygonalShutter'],
        '0x1622': ['US', '1', 'ShutterPresentationValue'],
        '0x1623': ['US', '1', 'ShutterOverlayGroup'],
        '0x1624': ['US', '3', 'ShutterPresentationColorCIELabValue'],
        '0x1700': ['CS', '1-3', 'CollimatorShape'],
        '0x1702': ['IS', '1', 'CollimatorLeftVerticalEdge'],
        '0x1704': ['IS', '1', 'CollimatorRightVerticalEdge'],
        '0x1706': ['IS', '1', 'CollimatorUpperHorizontalEdge'],
        '0x1708': ['IS', '1', 'CollimatorLowerHorizontalEdge'],
        '0x1710': ['IS', '2', 'CenterOfCircularCollimator'],
        '0x1712': ['IS', '1', 'RadiusOfCircularCollimator'],
        '0x1720': ['IS', '2-2n', 'VerticesOfThePolygonalCollimator'],
        '0x1800': ['CS', '1', 'AcquisitionTimeSynchronized'],
        '0x1801': ['SH', '1', 'TimeSource'],
        '0x1802': ['CS', '1', 'TimeDistributionProtocol'],
        '0x1803': ['LO', '1', 'NTPSourceAddress'],
        '0x2001': ['IS', '1-n', 'PageNumberVector'],
        '0x2002': ['SH', '1-n', 'FrameLabelVector'],
        '0x2003': ['DS', '1-n', 'FramePrimaryAngleVector'],
        '0x2004': ['DS', '1-n', 'FrameSecondaryAngleVector'],
        '0x2005': ['DS', '1-n', 'SliceLocationVector'],
        '0x2006': ['SH', '1-n', 'DisplayWindowLabelVector'],
        '0x2010': ['DS', '2', 'NominalScannedPixelSpacing'],
        '0x2020': ['CS', '1', 'DigitizingDeviceTransportDirection'],
        '0x2030': ['DS', '1', 'RotationOfScannedFilm'],
        '0x2041': ['SQ', '1', 'BiopsyTargetSequence'],
        '0x2042': ['UI', '1', 'TargetUID'],
        '0x2043': ['FL', '2', 'LocalizingCursorPosition'],
        '0x2044': ['FL', '3', 'CalculatedTargetPosition'],
        '0x2045': ['SH', '1', 'TargetLabel'],
        '0x2046': ['FL', '1', 'DisplayedZValue'],
        '0x3100': ['CS', '1', 'IVUSAcquisition'],
        '0x3101': ['DS', '1', 'IVUSPullbackRate'],
        '0x3102': ['DS', '1', 'IVUSGatedRate'],
        '0x3103': ['IS', '1', 'IVUSPullbackStartFrameNumber'],
        '0x3104': ['IS', '1', 'IVUSPullbackStopFrameNumber'],
        '0x3105': ['IS', '1-n', 'LesionNumber'],
        '0x4000': ['LT', '1', 'AcquisitionComments'],
        '0x5000': ['SH', '1-n', 'OutputPower'],
        '0x5010': ['LO', '1-n', 'TransducerData'],
        '0x5012': ['DS', '1', 'FocusDepth'],
        '0x5020': ['LO', '1', 'ProcessingFunction'],
        '0x5021': ['LO', '1', 'PostprocessingFunction'],
        '0x5022': ['DS', '1', 'MechanicalIndex'],
        '0x5024': ['DS', '1', 'BoneThermalIndex'],
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
        '0x6038': ['UL', '1', 'DopplerSampleVolumeXPositionRetired'],
        '0x6039': ['SL', '1', 'DopplerSampleVolumeXPosition'],
        '0x603A': ['UL', '1', 'DopplerSampleVolumeYPositionRetired'],
        '0x603B': ['SL', '1', 'DopplerSampleVolumeYPosition'],
        '0x603C': ['UL', '1', 'TMLinePositionX0Retired'],
        '0x603D': ['SL', '1', 'TMLinePositionX0'],
        '0x603E': ['UL', '1', 'TMLinePositionY0Retired'],
        '0x603F': ['SL', '1', 'TMLinePositionY0'],
        '0x6040': ['UL', '1', 'TMLinePositionX1Retired'],
        '0x6041': ['SL', '1', 'TMLinePositionX1'],
        '0x6042': ['UL', '1', 'TMLinePositionY1Retired'],
        '0x6043': ['SL', '1', 'TMLinePositionY1'],
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
        '0x6060': ['FL', '1-n', 'RWaveTimeVector'],
        '0x7000': ['CS', '1', 'DetectorConditionsNominalFlag'],
        '0x7001': ['DS', '1', 'DetectorTemperature'],
        '0x7004': ['CS', '1', 'DetectorType'],
        '0x7005': ['CS', '1', 'DetectorConfiguration'],
        '0x7006': ['LT', '1', 'DetectorDescription'],
        '0x7008': ['LT', '1', 'DetectorMode'],
        '0x700A': ['SH', '1', 'DetectorID'],
        '0x700C': ['DA', '1', 'DateOfLastDetectorCalibration'],
        '0x700E': ['TM', '1', 'TimeOfLastDetectorCalibration'],
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
        '0x702A': ['LO', '1', 'DetectorManufacturerName'],
        '0x702B': ['LO', '1', 'DetectorManufacturerModelName'],
        '0x7030': ['DS', '2', 'FieldOfViewOrigin'],
        '0x7032': ['DS', '1', 'FieldOfViewRotation'],
        '0x7034': ['CS', '1', 'FieldOfViewHorizontalFlip'],
        '0x7036': ['FL', '2', 'PixelDataAreaOriginRelativeToFOV'],
        '0x7038': ['FL', '1', 'PixelDataAreaRotationAngleRelativeToFOV'],
        '0x7040': ['LT', '1', 'GridAbsorbingMaterial'],
        '0x7041': ['LT', '1', 'GridSpacingMaterial'],
        '0x7042': ['DS', '1', 'GridThickness'],
        '0x7044': ['DS', '1', 'GridPitch'],
        '0x7046': ['IS', '2', 'GridAspectRatio'],
        '0x7048': ['DS', '1', 'GridPeriod'],
        '0x704C': ['DS', '1', 'GridFocalDistance'],
        '0x7050': ['CS', '1-n', 'FilterMaterial'],
        '0x7052': ['DS', '1-n', 'FilterThicknessMinimum'],
        '0x7054': ['DS', '1-n', 'FilterThicknessMaximum'],
        '0x7056': ['FL', '1-n', 'FilterBeamPathLengthMinimum'],
        '0x7058': ['FL', '1-n', 'FilterBeamPathLengthMaximum'],
        '0x7060': ['CS', '1', 'ExposureControlMode'],
        '0x7062': ['LT', '1', 'ExposureControlModeDescription'],
        '0x7064': ['CS', '1', 'ExposureStatus'],
        '0x7065': ['DS', '1', 'PhototimerSetting'],
        '0x8150': ['DS', '1', 'ExposureTimeInuS'],
        '0x8151': ['DS', '1', 'XRayTubeCurrentInuA'],
        '0x9004': ['CS', '1', 'ContentQualification'],
        '0x9005': ['SH', '1', 'PulseSequenceName'],
        '0x9006': ['SQ', '1', 'MRImagingModifierSequence'],
        '0x9008': ['CS', '1', 'EchoPulseSequence'],
        '0x9009': ['CS', '1', 'InversionRecovery'],
        '0x9010': ['CS', '1', 'FlowCompensation'],
        '0x9011': ['CS', '1', 'MultipleSpinEcho'],
        '0x9012': ['CS', '1', 'MultiPlanarExcitation'],
        '0x9014': ['CS', '1', 'PhaseContrast'],
        '0x9015': ['CS', '1', 'TimeOfFlightContrast'],
        '0x9016': ['CS', '1', 'Spoiling'],
        '0x9017': ['CS', '1', 'SteadyStatePulseSequence'],
        '0x9018': ['CS', '1', 'EchoPlanarPulseSequence'],
        '0x9019': ['FD', '1', 'TagAngleFirstAxis'],
        '0x9020': ['CS', '1', 'MagnetizationTransfer'],
        '0x9021': ['CS', '1', 'T2Preparation'],
        '0x9022': ['CS', '1', 'BloodSignalNulling'],
        '0x9024': ['CS', '1', 'SaturationRecovery'],
        '0x9025': ['CS', '1', 'SpectrallySelectedSuppression'],
        '0x9026': ['CS', '1', 'SpectrallySelectedExcitation'],
        '0x9027': ['CS', '1', 'SpatialPresaturation'],
        '0x9028': ['CS', '1', 'Tagging'],
        '0x9029': ['CS', '1', 'OversamplingPhase'],
        '0x9030': ['FD', '1', 'TagSpacingFirstDimension'],
        '0x9032': ['CS', '1', 'GeometryOfKSpaceTraversal'],
        '0x9033': ['CS', '1', 'SegmentedKSpaceTraversal'],
        '0x9034': ['CS', '1', 'RectilinearPhaseEncodeReordering'],
        '0x9035': ['FD', '1', 'TagThickness'],
        '0x9036': ['CS', '1', 'PartialFourierDirection'],
        '0x9037': ['CS', '1', 'CardiacSynchronizationTechnique'],
        '0x9041': ['LO', '1', 'ReceiveCoilManufacturerName'],
        '0x9042': ['SQ', '1', 'MRReceiveCoilSequence'],
        '0x9043': ['CS', '1', 'ReceiveCoilType'],
        '0x9044': ['CS', '1', 'QuadratureReceiveCoil'],
        '0x9045': ['SQ', '1', 'MultiCoilDefinitionSequence'],
        '0x9046': ['LO', '1', 'MultiCoilConfiguration'],
        '0x9047': ['SH', '1', 'MultiCoilElementName'],
        '0x9048': ['CS', '1', 'MultiCoilElementUsed'],
        '0x9049': ['SQ', '1', 'MRTransmitCoilSequence'],
        '0x9050': ['LO', '1', 'TransmitCoilManufacturerName'],
        '0x9051': ['CS', '1', 'TransmitCoilType'],
        '0x9052': ['FD', '1-2', 'SpectralWidth'],
        '0x9053': ['FD', '1-2', 'ChemicalShiftReference'],
        '0x9054': ['CS', '1', 'VolumeLocalizationTechnique'],
        '0x9058': ['US', '1', 'MRAcquisitionFrequencyEncodingSteps'],
        '0x9059': ['CS', '1', 'Decoupling'],
        '0x9060': ['CS', '1-2', 'DecoupledNucleus'],
        '0x9061': ['FD', '1-2', 'DecouplingFrequency'],
        '0x9062': ['CS', '1', 'DecouplingMethod'],
        '0x9063': ['FD', '1-2', 'DecouplingChemicalShiftReference'],
        '0x9064': ['CS', '1', 'KSpaceFiltering'],
        '0x9065': ['CS', '1-2', 'TimeDomainFiltering'],
        '0x9066': ['US', '1-2', 'NumberOfZeroFills'],
        '0x9067': ['CS', '1', 'BaselineCorrection'],
        '0x9069': ['FD', '1', 'ParallelReductionFactorInPlane'],
        '0x9070': ['FD', '1', 'CardiacRRIntervalSpecified'],
        '0x9073': ['FD', '1', 'AcquisitionDuration'],
        '0x9074': ['DT', '1', 'FrameAcquisitionDateTime'],
        '0x9075': ['CS', '1', 'DiffusionDirectionality'],
        '0x9076': ['SQ', '1', 'DiffusionGradientDirectionSequence'],
        '0x9077': ['CS', '1', 'ParallelAcquisition'],
        '0x9078': ['CS', '1', 'ParallelAcquisitionTechnique'],
        '0x9079': ['FD', '1-n', 'InversionTimes'],
        '0x9080': ['ST', '1', 'MetaboliteMapDescription'],
        '0x9081': ['CS', '1', 'PartialFourier'],
        '0x9082': ['FD', '1', 'EffectiveEchoTime'],
        '0x9083': ['SQ', '1', 'MetaboliteMapCodeSequence'],
        '0x9084': ['SQ', '1', 'ChemicalShiftSequence'],
        '0x9085': ['CS', '1', 'CardiacSignalSource'],
        '0x9087': ['FD', '1', 'DiffusionBValue'],
        '0x9089': ['FD', '3', 'DiffusionGradientOrientation'],
        '0x9090': ['FD', '3', 'VelocityEncodingDirection'],
        '0x9091': ['FD', '1', 'VelocityEncodingMinimumValue'],
        '0x9092': ['SQ', '1', 'VelocityEncodingAcquisitionSequence'],
        '0x9093': ['US', '1', 'NumberOfKSpaceTrajectories'],
        '0x9094': ['CS', '1', 'CoverageOfKSpace'],
        '0x9095': ['UL', '1', 'SpectroscopyAcquisitionPhaseRows'],
        '0x9096': ['FD', '1', 'ParallelReductionFactorInPlaneRetired'],
        '0x9098': ['FD', '1-2', 'TransmitterFrequency'],
        '0x9100': ['CS', '1-2', 'ResonantNucleus'],
        '0x9101': ['CS', '1', 'FrequencyCorrection'],
        '0x9103': ['SQ', '1', 'MRSpectroscopyFOVGeometrySequence'],
        '0x9104': ['FD', '1', 'SlabThickness'],
        '0x9105': ['FD', '3', 'SlabOrientation'],
        '0x9106': ['FD', '3', 'MidSlabPosition'],
        '0x9107': ['SQ', '1', 'MRSpatialSaturationSequence'],
        '0x9112': ['SQ', '1', 'MRTimingAndRelatedParametersSequence'],
        '0x9114': ['SQ', '1', 'MREchoSequence'],
        '0x9115': ['SQ', '1', 'MRModifierSequence'],
        '0x9117': ['SQ', '1', 'MRDiffusionSequence'],
        '0x9118': ['SQ', '1', 'CardiacSynchronizationSequence'],
        '0x9119': ['SQ', '1', 'MRAveragesSequence'],
        '0x9125': ['SQ', '1', 'MRFOVGeometrySequence'],
        '0x9126': ['SQ', '1', 'VolumeLocalizationSequence'],
        '0x9127': ['UL', '1', 'SpectroscopyAcquisitionDataColumns'],
        '0x9147': ['CS', '1', 'DiffusionAnisotropyType'],
        '0x9151': ['DT', '1', 'FrameReferenceDateTime'],
        '0x9152': ['SQ', '1', 'MRMetaboliteMapSequence'],
        '0x9155': ['FD', '1', 'ParallelReductionFactorOutOfPlane'],
        '0x9159': ['UL', '1', 'SpectroscopyAcquisitionOutOfPlanePhaseSteps'],
        '0x9166': ['CS', '1', 'BulkMotionStatus'],
        '0x9168': ['FD', '1', 'ParallelReductionFactorSecondInPlane'],
        '0x9169': ['CS', '1', 'CardiacBeatRejectionTechnique'],
        '0x9170': ['CS', '1', 'RespiratoryMotionCompensationTechnique'],
        '0x9171': ['CS', '1', 'RespiratorySignalSource'],
        '0x9172': ['CS', '1', 'BulkMotionCompensationTechnique'],
        '0x9173': ['CS', '1', 'BulkMotionSignalSource'],
        '0x9174': ['CS', '1', 'ApplicableSafetyStandardAgency'],
        '0x9175': ['LO', '1', 'ApplicableSafetyStandardDescription'],
        '0x9176': ['SQ', '1', 'OperatingModeSequence'],
        '0x9177': ['CS', '1', 'OperatingModeType'],
        '0x9178': ['CS', '1', 'OperatingMode'],
        '0x9179': ['CS', '1', 'SpecificAbsorptionRateDefinition'],
        '0x9180': ['CS', '1', 'GradientOutputType'],
        '0x9181': ['FD', '1', 'SpecificAbsorptionRateValue'],
        '0x9182': ['FD', '1', 'GradientOutput'],
        '0x9183': ['CS', '1', 'FlowCompensationDirection'],
        '0x9184': ['FD', '1', 'TaggingDelay'],
        '0x9185': ['ST', '1', 'RespiratoryMotionCompensationTechniqueDescription'],
        '0x9186': ['SH', '1', 'RespiratorySignalSourceID'],
        '0x9195': ['FD', '1', 'ChemicalShiftMinimumIntegrationLimitInHz'],
        '0x9196': ['FD', '1', 'ChemicalShiftMaximumIntegrationLimitInHz'],
        '0x9197': ['SQ', '1', 'MRVelocityEncodingSequence'],
        '0x9198': ['CS', '1', 'FirstOrderPhaseCorrection'],
        '0x9199': ['CS', '1', 'WaterReferencedPhaseCorrection'],
        '0x9200': ['CS', '1', 'MRSpectroscopyAcquisitionType'],
        '0x9214': ['CS', '1', 'RespiratoryCyclePosition'],
        '0x9217': ['FD', '1', 'VelocityEncodingMaximumValue'],
        '0x9218': ['FD', '1', 'TagSpacingSecondDimension'],
        '0x9219': ['SS', '1', 'TagAngleSecondAxis'],
        '0x9220': ['FD', '1', 'FrameAcquisitionDuration'],
        '0x9226': ['SQ', '1', 'MRImageFrameTypeSequence'],
        '0x9227': ['SQ', '1', 'MRSpectroscopyFrameTypeSequence'],
        '0x9231': ['US', '1', 'MRAcquisitionPhaseEncodingStepsInPlane'],
        '0x9232': ['US', '1', 'MRAcquisitionPhaseEncodingStepsOutOfPlane'],
        '0x9234': ['UL', '1', 'SpectroscopyAcquisitionPhaseColumns'],
        '0x9236': ['CS', '1', 'CardiacCyclePosition'],
        '0x9239': ['SQ', '1', 'SpecificAbsorptionRateSequence'],
        '0x9240': ['US', '1', 'RFEchoTrainLength'],
        '0x9241': ['US', '1', 'GradientEchoTrainLength'],
        '0x9250': ['CS', '1', 'ArterialSpinLabelingContrast'],
        '0x9251': ['SQ', '1', 'MRArterialSpinLabelingSequence'],
        '0x9252': ['LO', '1', 'ASLTechniqueDescription'],
        '0x9253': ['US', '1', 'ASLSlabNumber'],
        '0x9254': ['FD', '1', 'ASLSlabThickness'],
        '0x9255': ['FD', '3', 'ASLSlabOrientation'],
        '0x9256': ['FD', '3', 'ASLMidSlabPosition'],
        '0x9257': ['CS', '1', 'ASLContext'],
        '0x9258': ['UL', '1', 'ASLPulseTrainDuration'],
        '0x9259': ['CS', '1', 'ASLCrusherFlag'],
        '0x925A': ['FD', '1', 'ASLCrusherFlowLimit'],
        '0x925B': ['LO', '1', 'ASLCrusherDescription'],
        '0x925C': ['CS', '1', 'ASLBolusCutoffFlag'],
        '0x925D': ['SQ', '1', 'ASLBolusCutoffTimingSequence'],
        '0x925E': ['LO', '1', 'ASLBolusCutoffTechnique'],
        '0x925F': ['UL', '1', 'ASLBolusCutoffDelayTime'],
        '0x9260': ['SQ', '1', 'ASLSlabSequence'],
        '0x9295': ['FD', '1', 'ChemicalShiftMinimumIntegrationLimitInppm'],
        '0x9296': ['FD', '1', 'ChemicalShiftMaximumIntegrationLimitInppm'],
        '0x9297': ['CS', '1', 'WaterReferenceAcquisition'],
        '0x9298': ['IS', '1', 'EchoPeakPosition'],
        '0x9301': ['SQ', '1', 'CTAcquisitionTypeSequence'],
        '0x9302': ['CS', '1', 'AcquisitionType'],
        '0x9303': ['FD', '1', 'TubeAngle'],
        '0x9304': ['SQ', '1', 'CTAcquisitionDetailsSequence'],
        '0x9305': ['FD', '1', 'RevolutionTime'],
        '0x9306': ['FD', '1', 'SingleCollimationWidth'],
        '0x9307': ['FD', '1', 'TotalCollimationWidth'],
        '0x9308': ['SQ', '1', 'CTTableDynamicsSequence'],
        '0x9309': ['FD', '1', 'TableSpeed'],
        '0x9310': ['FD', '1', 'TableFeedPerRotation'],
        '0x9311': ['FD', '1', 'SpiralPitchFactor'],
        '0x9312': ['SQ', '1', 'CTGeometrySequence'],
        '0x9313': ['FD', '3', 'DataCollectionCenterPatient'],
        '0x9314': ['SQ', '1', 'CTReconstructionSequence'],
        '0x9315': ['CS', '1', 'ReconstructionAlgorithm'],
        '0x9316': ['CS', '1', 'ConvolutionKernelGroup'],
        '0x9317': ['FD', '2', 'ReconstructionFieldOfView'],
        '0x9318': ['FD', '3', 'ReconstructionTargetCenterPatient'],
        '0x9319': ['FD', '1', 'ReconstructionAngle'],
        '0x9320': ['SH', '1', 'ImageFilter'],
        '0x9321': ['SQ', '1', 'CTExposureSequence'],
        '0x9322': ['FD', '2', 'ReconstructionPixelSpacing'],
        '0x9323': ['CS', '1', 'ExposureModulationType'],
        '0x9324': ['FD', '1', 'EstimatedDoseSaving'],
        '0x9325': ['SQ', '1', 'CTXRayDetailsSequence'],
        '0x9326': ['SQ', '1', 'CTPositionSequence'],
        '0x9327': ['FD', '1', 'TablePosition'],
        '0x9328': ['FD', '1', 'ExposureTimeInms'],
        '0x9329': ['SQ', '1', 'CTImageFrameTypeSequence'],
        '0x9330': ['FD', '1', 'XRayTubeCurrentInmA'],
        '0x9332': ['FD', '1', 'ExposureInmAs'],
        '0x9333': ['CS', '1', 'ConstantVolumeFlag'],
        '0x9334': ['CS', '1', 'FluoroscopyFlag'],
        '0x9335': ['FD', '1', 'DistanceSourceToDataCollectionCenter'],
        '0x9337': ['US', '1', 'ContrastBolusAgentNumber'],
        '0x9338': ['SQ', '1', 'ContrastBolusIngredientCodeSequence'],
        '0x9340': ['SQ', '1', 'ContrastAdministrationProfileSequence'],
        '0x9341': ['SQ', '1', 'ContrastBolusUsageSequence'],
        '0x9342': ['CS', '1', 'ContrastBolusAgentAdministered'],
        '0x9343': ['CS', '1', 'ContrastBolusAgentDetected'],
        '0x9344': ['CS', '1', 'ContrastBolusAgentPhase'],
        '0x9345': ['FD', '1', 'CTDIvol'],
        '0x9346': ['SQ', '1', 'CTDIPhantomTypeCodeSequence'],
        '0x9351': ['FL', '1', 'CalciumScoringMassFactorPatient'],
        '0x9352': ['FL', '3', 'CalciumScoringMassFactorDevice'],
        '0x9353': ['FL', '1', 'EnergyWeightingFactor'],
        '0x9360': ['SQ', '1', 'CTAdditionalXRaySourceSequence'],
        '0x9401': ['SQ', '1', 'ProjectionPixelCalibrationSequence'],
        '0x9402': ['FL', '1', 'DistanceSourceToIsocenter'],
        '0x9403': ['FL', '1', 'DistanceObjectToTableTop'],
        '0x9404': ['FL', '2', 'ObjectPixelSpacingInCenterOfBeam'],
        '0x9405': ['SQ', '1', 'PositionerPositionSequence'],
        '0x9406': ['SQ', '1', 'TablePositionSequence'],
        '0x9407': ['SQ', '1', 'CollimatorShapeSequence'],
        '0x9410': ['CS', '1', 'PlanesInAcquisition'],
        '0x9412': ['SQ', '1', 'XAXRFFrameCharacteristicsSequence'],
        '0x9417': ['SQ', '1', 'FrameAcquisitionSequence'],
        '0x9420': ['CS', '1', 'XRayReceptorType'],
        '0x9423': ['LO', '1', 'AcquisitionProtocolName'],
        '0x9424': ['LT', '1', 'AcquisitionProtocolDescription'],
        '0x9425': ['CS', '1', 'ContrastBolusIngredientOpaque'],
        '0x9426': ['FL', '1', 'DistanceReceptorPlaneToDetectorHousing'],
        '0x9427': ['CS', '1', 'IntensifierActiveShape'],
        '0x9428': ['FL', '1-2', 'IntensifierActiveDimensions'],
        '0x9429': ['FL', '2', 'PhysicalDetectorSize'],
        '0x9430': ['FL', '2', 'PositionOfIsocenterProjection'],
        '0x9432': ['SQ', '1', 'FieldOfViewSequence'],
        '0x9433': ['LO', '1', 'FieldOfViewDescription'],
        '0x9434': ['SQ', '1', 'ExposureControlSensingRegionsSequence'],
        '0x9435': ['CS', '1', 'ExposureControlSensingRegionShape'],
        '0x9436': ['SS', '1', 'ExposureControlSensingRegionLeftVerticalEdge'],
        '0x9437': ['SS', '1', 'ExposureControlSensingRegionRightVerticalEdge'],
        '0x9438': ['SS', '1', 'ExposureControlSensingRegionUpperHorizontalEdge'],
        '0x9439': ['SS', '1', 'ExposureControlSensingRegionLowerHorizontalEdge'],
        '0x9440': ['SS', '2', 'CenterOfCircularExposureControlSensingRegion'],
        '0x9441': ['US', '1', 'RadiusOfCircularExposureControlSensingRegion'],
        '0x9442': ['SS', '2-n', 'VerticesOfThePolygonalExposureControlSensingRegion'],
        '0x9445': ['', '', ''],
        '0x9447': ['FL', '1', 'ColumnAngulationPatient'],
        '0x9449': ['FL', '1', 'BeamAngle'],
        '0x9451': ['SQ', '1', 'FrameDetectorParametersSequence'],
        '0x9452': ['FL', '1', 'CalculatedAnatomyThickness'],
        '0x9455': ['SQ', '1', 'CalibrationSequence'],
        '0x9456': ['SQ', '1', 'ObjectThicknessSequence'],
        '0x9457': ['CS', '1', 'PlaneIdentification'],
        '0x9461': ['FL', '1-2', 'FieldOfViewDimensionsInFloat'],
        '0x9462': ['SQ', '1', 'IsocenterReferenceSystemSequence'],
        '0x9463': ['FL', '1', 'PositionerIsocenterPrimaryAngle'],
        '0x9464': ['FL', '1', 'PositionerIsocenterSecondaryAngle'],
        '0x9465': ['FL', '1', 'PositionerIsocenterDetectorRotationAngle'],
        '0x9466': ['FL', '1', 'TableXPositionToIsocenter'],
        '0x9467': ['FL', '1', 'TableYPositionToIsocenter'],
        '0x9468': ['FL', '1', 'TableZPositionToIsocenter'],
        '0x9469': ['FL', '1', 'TableHorizontalRotationAngle'],
        '0x9470': ['FL', '1', 'TableHeadTiltAngle'],
        '0x9471': ['FL', '1', 'TableCradleTiltAngle'],
        '0x9472': ['SQ', '1', 'FrameDisplayShutterSequence'],
        '0x9473': ['FL', '1', 'AcquiredImageAreaDoseProduct'],
        '0x9474': ['CS', '1', 'CArmPositionerTabletopRelationship'],
        '0x9476': ['SQ', '1', 'XRayGeometrySequence'],
        '0x9477': ['SQ', '1', 'IrradiationEventIdentificationSequence'],
        '0x9504': ['SQ', '1', 'XRay3DFrameTypeSequence'],
        '0x9506': ['SQ', '1', 'ContributingSourcesSequence'],
        '0x9507': ['SQ', '1', 'XRay3DAcquisitionSequence'],
        '0x9508': ['FL', '1', 'PrimaryPositionerScanArc'],
        '0x9509': ['FL', '1', 'SecondaryPositionerScanArc'],
        '0x9510': ['FL', '1', 'PrimaryPositionerScanStartAngle'],
        '0x9511': ['FL', '1', 'SecondaryPositionerScanStartAngle'],
        '0x9514': ['FL', '1', 'PrimaryPositionerIncrement'],
        '0x9515': ['FL', '1', 'SecondaryPositionerIncrement'],
        '0x9516': ['DT', '1', 'StartAcquisitionDateTime'],
        '0x9517': ['DT', '1', 'EndAcquisitionDateTime'],
        '0x9518': ['SS', '1', 'PrimaryPositionerIncrementSign'],
        '0x9519': ['SS', '1', 'SecondaryPositionerIncrementSign'],
        '0x9524': ['LO', '1', 'ApplicationName'],
        '0x9525': ['LO', '1', 'ApplicationVersion'],
        '0x9526': ['LO', '1', 'ApplicationManufacturer'],
        '0x9527': ['CS', '1', 'AlgorithmType'],
        '0x9528': ['LO', '1', 'AlgorithmDescription'],
        '0x9530': ['SQ', '1', 'XRay3DReconstructionSequence'],
        '0x9531': ['LO', '1', 'ReconstructionDescription'],
        '0x9538': ['SQ', '1', 'PerProjectionAcquisitionSequence'],
        '0x9541': ['SQ', '1', 'DetectorPositionSequence'],
        '0x9542': ['SQ', '1', 'XRayAcquisitionDoseSequence'],
        '0x9543': ['FD', '1', 'XRaySourceIsocenterPrimaryAngle'],
        '0x9544': ['FD', '1', 'XRaySourceIsocenterSecondaryAngle'],
        '0x9545': ['FD', '1', 'BreastSupportIsocenterPrimaryAngle'],
        '0x9546': ['FD', '1', 'BreastSupportIsocenterSecondaryAngle'],
        '0x9547': ['FD', '1', 'BreastSupportXPositionToIsocenter'],
        '0x9548': ['FD', '1', 'BreastSupportYPositionToIsocenter'],
        '0x9549': ['FD', '1', 'BreastSupportZPositionToIsocenter'],
        '0x9550': ['FD', '1', 'DetectorIsocenterPrimaryAngle'],
        '0x9551': ['FD', '1', 'DetectorIsocenterSecondaryAngle'],
        '0x9552': ['FD', '1', 'DetectorXPositionToIsocenter'],
        '0x9553': ['FD', '1', 'DetectorYPositionToIsocenter'],
        '0x9554': ['FD', '1', 'DetectorZPositionToIsocenter'],
        '0x9555': ['SQ', '1', 'XRayGridSequence'],
        '0x9556': ['SQ', '1', 'XRayFilterSequence'],
        '0x9557': ['FD', '3', 'DetectorActiveAreaTLHCPosition'],
        '0x9558': ['FD', '6', 'DetectorActiveAreaOrientation'],
        '0x9559': ['CS', '1', 'PositionerPrimaryAngleDirection'],
        '0x9601': ['SQ', '1', 'DiffusionBMatrixSequence'],
        '0x9602': ['FD', '1', 'DiffusionBValueXX'],
        '0x9603': ['FD', '1', 'DiffusionBValueXY'],
        '0x9604': ['FD', '1', 'DiffusionBValueXZ'],
        '0x9605': ['FD', '1', 'DiffusionBValueYY'],
        '0x9606': ['FD', '1', 'DiffusionBValueYZ'],
        '0x9607': ['FD', '1', 'DiffusionBValueZZ'],
        '0x9701': ['DT', '1', 'DecayCorrectionDateTime'],
        '0x9715': ['FD', '1', 'StartDensityThreshold'],
        '0x9716': ['FD', '1', 'StartRelativeDensityDifferenceThreshold'],
        '0x9717': ['FD', '1', 'StartCardiacTriggerCountThreshold'],
        '0x9718': ['FD', '1', 'StartRespiratoryTriggerCountThreshold'],
        '0x9719': ['FD', '1', 'TerminationCountsThreshold'],
        '0x9720': ['FD', '1', 'TerminationDensityThreshold'],
        '0x9721': ['FD', '1', 'TerminationRelativeDensityThreshold'],
        '0x9722': ['FD', '1', 'TerminationTimeThreshold'],
        '0x9723': ['FD', '1', 'TerminationCardiacTriggerCountThreshold'],
        '0x9724': ['FD', '1', 'TerminationRespiratoryTriggerCountThreshold'],
        '0x9725': ['CS', '1', 'DetectorGeometry'],
        '0x9726': ['FD', '1', 'TransverseDetectorSeparation'],
        '0x9727': ['FD', '1', 'AxialDetectorDimension'],
        '0x9729': ['US', '1', 'RadiopharmaceuticalAgentNumber'],
        '0x9732': ['SQ', '1', 'PETFrameAcquisitionSequence'],
        '0x9733': ['SQ', '1', 'PETDetectorMotionDetailsSequence'],
        '0x9734': ['SQ', '1', 'PETTableDynamicsSequence'],
        '0x9735': ['SQ', '1', 'PETPositionSequence'],
        '0x9736': ['SQ', '1', 'PETFrameCorrectionFactorsSequence'],
        '0x9737': ['SQ', '1', 'RadiopharmaceuticalUsageSequence'],
        '0x9738': ['CS', '1', 'AttenuationCorrectionSource'],
        '0x9739': ['US', '1', 'NumberOfIterations'],
        '0x9740': ['US', '1', 'NumberOfSubsets'],
        '0x9749': ['SQ', '1', 'PETReconstructionSequence'],
        '0x9751': ['SQ', '1', 'PETFrameTypeSequence'],
        '0x9755': ['CS', '1', 'TimeOfFlightInformationUsed'],
        '0x9756': ['CS', '1', 'ReconstructionType'],
        '0x9758': ['CS', '1', 'DecayCorrected'],
        '0x9759': ['CS', '1', 'AttenuationCorrected'],
        '0x9760': ['CS', '1', 'ScatterCorrected'],
        '0x9761': ['CS', '1', 'DeadTimeCorrected'],
        '0x9762': ['CS', '1', 'GantryMotionCorrected'],
        '0x9763': ['CS', '1', 'PatientMotionCorrected'],
        '0x9764': ['CS', '1', 'CountLossNormalizationCorrected'],
        '0x9765': ['CS', '1', 'RandomsCorrected'],
        '0x9766': ['CS', '1', 'NonUniformRadialSamplingCorrected'],
        '0x9767': ['CS', '1', 'SensitivityCalibrated'],
        '0x9768': ['CS', '1', 'DetectorNormalizationCorrection'],
        '0x9769': ['CS', '1', 'IterativeReconstructionMethod'],
        '0x9770': ['CS', '1', 'AttenuationCorrectionTemporalRelationship'],
        '0x9771': ['SQ', '1', 'PatientPhysiologicalStateSequence'],
        '0x9772': ['SQ', '1', 'PatientPhysiologicalStateCodeSequence'],
        '0x9801': ['FD', '1-n', 'DepthsOfFocus'],
        '0x9803': ['SQ', '1', 'ExcludedIntervalsSequence'],
        '0x9804': ['DT', '1', 'ExclusionStartDateTime'],
        '0x9805': ['FD', '1', 'ExclusionDuration'],
        '0x9806': ['SQ', '1', 'USImageDescriptionSequence'],
        '0x9807': ['SQ', '1', 'ImageDataTypeSequence'],
        '0x9808': ['CS', '1', 'DataType'],
        '0x9809': ['SQ', '1', 'TransducerScanPatternCodeSequence'],
        '0x980B': ['CS', '1', 'AliasedDataType'],
        '0x980C': ['CS', '1', 'PositionMeasuringDeviceUsed'],
        '0x980D': ['SQ', '1', 'TransducerGeometryCodeSequence'],
        '0x980E': ['SQ', '1', 'TransducerBeamSteeringCodeSequence'],
        '0x980F': ['SQ', '1', 'TransducerApplicationCodeSequence'],
        '0x9810': ['xs', '1', 'ZeroVelocityPixelValue'],
        '0xA001': ['SQ', '1', 'ContributingEquipmentSequence'],
        '0xA002': ['DT', '1', 'ContributionDateTime'],
        '0xA003': ['ST', '1', 'ContributionDescription'],
    },
    '0x0020': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x000D': ['UI', '1', 'StudyInstanceUID'],
        '0x000E': ['UI', '1', 'SeriesInstanceUID'],
        '0x0010': ['SH', '1', 'StudyID'],
        '0x0011': ['IS', '1', 'SeriesNumber'],
        '0x0012': ['IS', '1', 'AcquisitionNumber'],
        '0x0013': ['IS', '1', 'InstanceNumber'],
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
        '0x0070': ['LO', '1', 'ImageGeometryType'],
        '0x0080': ['CS', '1-n', 'MaskingImage'],
        '0x00AA': ['IS', '1', 'ReportNumber'],
        '0x0100': ['IS', '1', 'TemporalPositionIdentifier'],
        '0x0105': ['IS', '1', 'NumberOfTemporalPositions'],
        '0x0110': ['DS', '1', 'TemporalResolution'],
        '0x0200': ['UI', '1', 'SynchronizationFrameOfReferenceUID'],
        '0x0242': ['UI', '1', 'SOPInstanceUIDOfConcatenationSource'],
        '0x1000': ['IS', '1', 'SeriesInStudy'],
        '0x1001': ['IS', '1', 'AcquisitionsInSeries'],
        '0x1002': ['IS', '1', 'ImagesInAcquisition'],
        '0x1003': ['IS', '1', 'ImagesInSeries'],
        '0x1004': ['IS', '1', 'AcquisitionsInStudy'],
        '0x1005': ['IS', '1', 'ImagesInStudy'],
        '0x1020': ['LO', '1-n', 'Reference'],
        '0x1040': ['LO', '1', 'PositionReferenceIndicator'],
        '0x1041': ['DS', '1', 'SliceLocation'],
        '0x1070': ['IS', '1-n', 'OtherStudyNumbers'],
        '0x1200': ['IS', '1', 'NumberOfPatientRelatedStudies'],
        '0x1202': ['IS', '1', 'NumberOfPatientRelatedSeries'],
        '0x1204': ['IS', '1', 'NumberOfPatientRelatedInstances'],
        '0x1206': ['IS', '1', 'NumberOfStudyRelatedSeries'],
        '0x1208': ['IS', '1', 'NumberOfStudyRelatedInstances'],
        '0x1209': ['IS', '1', 'NumberOfSeriesRelatedInstances'],
        '0x3100': ['CS', '1-n', 'SourceImageIDs'],
        '0x3401': ['CS', '1', 'ModifyingDeviceID'],
        '0x3402': ['CS', '1', 'ModifiedImageID'],
        '0x3403': ['DA', '1', 'ModifiedImageDate'],
        '0x3404': ['LO', '1', 'ModifyingDeviceManufacturer'],
        '0x3405': ['TM', '1', 'ModifiedImageTime'],
        '0x3406': ['LO', '1', 'ModifiedImageDescription'],
        '0x4000': ['LT', '1', 'ImageComments'],
        '0x5000': ['AT', '1-n', 'OriginalImageIdentification'],
        '0x5002': ['LO', '1-n', 'OriginalImageIdentificationNomenclature'],
        '0x9056': ['SH', '1', 'StackID'],
        '0x9057': ['UL', '1', 'InStackPositionNumber'],
        '0x9071': ['SQ', '1', 'FrameAnatomySequence'],
        '0x9072': ['CS', '1', 'FrameLaterality'],
        '0x9111': ['SQ', '1', 'FrameContentSequence'],
        '0x9113': ['SQ', '1', 'PlanePositionSequence'],
        '0x9116': ['SQ', '1', 'PlaneOrientationSequence'],
        '0x9128': ['UL', '1', 'TemporalPositionIndex'],
        '0x9153': ['FD', '1', 'NominalCardiacTriggerDelayTime'],
        '0x9154': ['FL', '1', 'NominalCardiacTriggerTimePriorToRPeak'],
        '0x9155': ['FL', '1', 'ActualCardiacTriggerTimePriorToRPeak'],
        '0x9156': ['US', '1', 'FrameAcquisitionNumber'],
        '0x9157': ['UL', '1-n', 'DimensionIndexValues'],
        '0x9158': ['LT', '1', 'FrameComments'],
        '0x9161': ['UI', '1', 'ConcatenationUID'],
        '0x9162': ['US', '1', 'InConcatenationNumber'],
        '0x9163': ['US', '1', 'InConcatenationTotalNumber'],
        '0x9164': ['UI', '1', 'DimensionOrganizationUID'],
        '0x9165': ['AT', '1', 'DimensionIndexPointer'],
        '0x9167': ['AT', '1', 'FunctionalGroupPointer'],
        '0x9170': ['SQ', '1', 'UnassignedSharedConvertedAttributesSequence'],
        '0x9171': ['SQ', '1', 'UnassignedPerFrameConvertedAttributesSequence'],
        '0x9172': ['SQ', '1', 'ConversionSourceAttributesSequence'],
        '0x9213': ['LO', '1', 'DimensionIndexPrivateCreator'],
        '0x9221': ['SQ', '1', 'DimensionOrganizationSequence'],
        '0x9222': ['SQ', '1', 'DimensionIndexSequence'],
        '0x9228': ['UL', '1', 'ConcatenationFrameOffsetNumber'],
        '0x9238': ['LO', '1', 'FunctionalGroupPrivateCreator'],
        '0x9241': ['FL', '1', 'NominalPercentageOfCardiacPhase'],
        '0x9245': ['FL', '1', 'NominalPercentageOfRespiratoryPhase'],
        '0x9246': ['FL', '1', 'StartingRespiratoryAmplitude'],
        '0x9247': ['CS', '1', 'StartingRespiratoryPhase'],
        '0x9248': ['FL', '1', 'EndingRespiratoryAmplitude'],
        '0x9249': ['CS', '1', 'EndingRespiratoryPhase'],
        '0x9250': ['CS', '1', 'RespiratoryTriggerType'],
        '0x9251': ['FD', '1', 'RRIntervalTimeNominal'],
        '0x9252': ['FD', '1', 'ActualCardiacTriggerDelayTime'],
        '0x9253': ['SQ', '1', 'RespiratorySynchronizationSequence'],
        '0x9254': ['FD', '1', 'RespiratoryIntervalTime'],
        '0x9255': ['FD', '1', 'NominalRespiratoryTriggerDelayTime'],
        '0x9256': ['FD', '1', 'RespiratoryTriggerDelayThreshold'],
        '0x9257': ['FD', '1', 'ActualRespiratoryTriggerDelayTime'],
        '0x9301': ['FD', '3', 'ImagePositionVolume'],
        '0x9302': ['FD', '6', 'ImageOrientationVolume'],
        '0x9307': ['CS', '1', 'UltrasoundAcquisitionGeometry'],
        '0x9308': ['FD', '3', 'ApexPosition'],
        '0x9309': ['FD', '16', 'VolumeToTransducerMappingMatrix'],
        '0x930A': ['FD', '16', 'VolumeToTableMappingMatrix'],
        '0x930B': ['CS', '1', 'VolumeToTransducerRelationship'],
        '0x930C': ['CS', '1', 'PatientFrameOfReferenceSource'],
        '0x930D': ['FD', '1', 'TemporalPositionTimeOffset'],
        '0x930E': ['SQ', '1', 'PlanePositionVolumeSequence'],
        '0x930F': ['SQ', '1', 'PlaneOrientationVolumeSequence'],
        '0x9310': ['SQ', '1', 'TemporalPositionSequence'],
        '0x9311': ['CS', '1', 'DimensionOrganizationType'],
        '0x9312': ['UI', '1', 'VolumeFrameOfReferenceUID'],
        '0x9313': ['UI', '1', 'TableFrameOfReferenceUID'],
        '0x9421': ['LO', '1', 'DimensionDescriptionLabel'],
        '0x9450': ['SQ', '1', 'PatientOrientationInFrameSequence'],
        '0x9453': ['LO', '1', 'FrameLabel'],
        '0x9518': ['US', '1-n', 'AcquisitionIndex'],
        '0x9529': ['SQ', '1', 'ContributingSOPInstancesReferenceSequence'],
        '0x9536': ['US', '1', 'ReconstructionIndex'],
    },
    '0x0022': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0001': ['US', '1', 'LightPathFilterPassThroughWavelength'],
        '0x0002': ['US', '2', 'LightPathFilterPassBand'],
        '0x0003': ['US', '1', 'ImagePathFilterPassThroughWavelength'],
        '0x0004': ['US', '2', 'ImagePathFilterPassBand'],
        '0x0005': ['CS', '1', 'PatientEyeMovementCommanded'],
        '0x0006': ['SQ', '1', 'PatientEyeMovementCommandCodeSequence'],
        '0x0007': ['FL', '1', 'SphericalLensPower'],
        '0x0008': ['FL', '1', 'CylinderLensPower'],
        '0x0009': ['FL', '1', 'CylinderAxis'],
        '0x000A': ['FL', '1', 'EmmetropicMagnification'],
        '0x000B': ['FL', '1', 'IntraOcularPressure'],
        '0x000C': ['FL', '1', 'HorizontalFieldOfView'],
        '0x000D': ['CS', '1', 'PupilDilated'],
        '0x000E': ['FL', '1', 'DegreeOfDilation'],
        '0x0010': ['FL', '1', 'StereoBaselineAngle'],
        '0x0011': ['FL', '1', 'StereoBaselineDisplacement'],
        '0x0012': ['FL', '1', 'StereoHorizontalPixelOffset'],
        '0x0013': ['FL', '1', 'StereoVerticalPixelOffset'],
        '0x0014': ['FL', '1', 'StereoRotation'],
        '0x0015': ['SQ', '1', 'AcquisitionDeviceTypeCodeSequence'],
        '0x0016': ['SQ', '1', 'IlluminationTypeCodeSequence'],
        '0x0017': ['SQ', '1', 'LightPathFilterTypeStackCodeSequence'],
        '0x0018': ['SQ', '1', 'ImagePathFilterTypeStackCodeSequence'],
        '0x0019': ['SQ', '1', 'LensesCodeSequence'],
        '0x001A': ['SQ', '1', 'ChannelDescriptionCodeSequence'],
        '0x001B': ['SQ', '1', 'RefractiveStateSequence'],
        '0x001C': ['SQ', '1', 'MydriaticAgentCodeSequence'],
        '0x001D': ['SQ', '1', 'RelativeImagePositionCodeSequence'],
        '0x001E': ['FL', '1', 'CameraAngleOfView'],
        '0x0020': ['SQ', '1', 'StereoPairsSequence'],
        '0x0021': ['SQ', '1', 'LeftImageSequence'],
        '0x0022': ['SQ', '1', 'RightImageSequence'],
        '0x0028': ['CS', '1', 'StereoPairsPresent'],
        '0x0030': ['FL', '1', 'AxialLengthOfTheEye'],
        '0x0031': ['SQ', '1', 'OphthalmicFrameLocationSequence'],
        '0x0032': ['FL', '2-2n', 'ReferenceCoordinates'],
        '0x0035': ['FL', '1', 'DepthSpatialResolution'],
        '0x0036': ['FL', '1', 'MaximumDepthDistortion'],
        '0x0037': ['FL', '1', 'AlongScanSpatialResolution'],
        '0x0038': ['FL', '1', 'MaximumAlongScanDistortion'],
        '0x0039': ['CS', '1', 'OphthalmicImageOrientation'],
        '0x0041': ['FL', '1', 'DepthOfTransverseImage'],
        '0x0042': ['SQ', '1', 'MydriaticAgentConcentrationUnitsSequence'],
        '0x0048': ['FL', '1', 'AcrossScanSpatialResolution'],
        '0x0049': ['FL', '1', 'MaximumAcrossScanDistortion'],
        '0x004E': ['DS', '1', 'MydriaticAgentConcentration'],
        '0x0055': ['FL', '1', 'IlluminationWaveLength'],
        '0x0056': ['FL', '1', 'IlluminationPower'],
        '0x0057': ['FL', '1', 'IlluminationBandwidth'],
        '0x0058': ['SQ', '1', 'MydriaticAgentSequence'],
        '0x1007': ['SQ', '1', 'OphthalmicAxialMeasurementsRightEyeSequence'],
        '0x1008': ['SQ', '1', 'OphthalmicAxialMeasurementsLeftEyeSequence'],
        '0x1009': ['CS', '1', 'OphthalmicAxialMeasurementsDeviceType'],
        '0x1010': ['CS', '1', 'OphthalmicAxialLengthMeasurementsType'],
        '0x1012': ['SQ', '1', 'OphthalmicAxialLengthSequence'],
        '0x1019': ['FL', '1', 'OphthalmicAxialLength'],
        '0x1024': ['SQ', '1', 'LensStatusCodeSequence'],
        '0x1025': ['SQ', '1', 'VitreousStatusCodeSequence'],
        '0x1028': ['SQ', '1', 'IOLFormulaCodeSequence'],
        '0x1029': ['LO', '1', 'IOLFormulaDetail'],
        '0x1033': ['FL', '1', 'KeratometerIndex'],
        '0x1035': ['SQ', '1', 'SourceOfOphthalmicAxialLengthCodeSequence'],
        '0x1037': ['FL', '1', 'TargetRefraction'],
        '0x1039': ['CS', '1', 'RefractiveProcedureOccurred'],
        '0x1040': ['SQ', '1', 'RefractiveSurgeryTypeCodeSequence'],
        '0x1044': ['SQ', '1', 'OphthalmicUltrasoundMethodCodeSequence'],
        '0x1050': ['SQ', '1', 'OphthalmicAxialLengthMeasurementsSequence'],
        '0x1053': ['FL', '1', 'IOLPower'],
        '0x1054': ['FL', '1', 'PredictedRefractiveError'],
        '0x1059': ['FL', '1', 'OphthalmicAxialLengthVelocity'],
        '0x1065': ['LO', '1', 'LensStatusDescription'],
        '0x1066': ['LO', '1', 'VitreousStatusDescription'],
        '0x1090': ['SQ', '1', 'IOLPowerSequence'],
        '0x1092': ['SQ', '1', 'LensConstantSequence'],
        '0x1093': ['LO', '1', 'IOLManufacturer'],
        '0x1094': ['LO', '1', 'LensConstantDescription'],
        '0x1095': ['LO', '1', 'ImplantName'],
        '0x1096': ['SQ', '1', 'KeratometryMeasurementTypeCodeSequence'],
        '0x1097': ['LO', '1', 'ImplantPartNumber'],
        '0x1100': ['SQ', '1', 'ReferencedOphthalmicAxialMeasurementsSequence'],
        '0x1101': ['SQ', '1', 'OphthalmicAxialLengthMeasurementsSegmentNameCodeSequence'],
        '0x1103': ['SQ', '1', 'RefractiveErrorBeforeRefractiveSurgeryCodeSequence'],
        '0x1121': ['FL', '1', 'IOLPowerForExactEmmetropia'],
        '0x1122': ['FL', '1', 'IOLPowerForExactTargetRefraction'],
        '0x1125': ['SQ', '1', 'AnteriorChamberDepthDefinitionCodeSequence'],
        '0x1127': ['SQ', '1', 'LensThicknessSequence'],
        '0x1128': ['SQ', '1', 'AnteriorChamberDepthSequence'],
        '0x1130': ['FL', '1', 'LensThickness'],
        '0x1131': ['FL', '1', 'AnteriorChamberDepth'],
        '0x1132': ['SQ', '1', 'SourceOfLensThicknessDataCodeSequence'],
        '0x1133': ['SQ', '1', 'SourceOfAnteriorChamberDepthDataCodeSequence'],
        '0x1134': ['SQ', '1', 'SourceOfRefractiveMeasurementsSequence'],
        '0x1135': ['SQ', '1', 'SourceOfRefractiveMeasurementsCodeSequence'],
        '0x1140': ['CS', '1', 'OphthalmicAxialLengthMeasurementModified'],
        '0x1150': ['SQ', '1', 'OphthalmicAxialLengthDataSourceCodeSequence'],
        '0x1153': ['SQ', '1', 'OphthalmicAxialLengthAcquisitionMethodCodeSequence'],
        '0x1155': ['FL', '1', 'SignalToNoiseRatio'],
        '0x1159': ['LO', '1', 'OphthalmicAxialLengthDataSourceDescription'],
        '0x1210': ['SQ', '1', 'OphthalmicAxialLengthMeasurementsTotalLengthSequence'],
        '0x1211': ['SQ', '1', 'OphthalmicAxialLengthMeasurementsSegmentalLengthSequence'],
        '0x1212': ['SQ', '1', 'OphthalmicAxialLengthMeasurementsLengthSummationSequence'],
        '0x1220': ['SQ', '1', 'UltrasoundOphthalmicAxialLengthMeasurementsSequence'],
        '0x1225': ['SQ', '1', 'OpticalOphthalmicAxialLengthMeasurementsSequence'],
        '0x1230': ['SQ', '1', 'UltrasoundSelectedOphthalmicAxialLengthSequence'],
        '0x1250': ['SQ', '1', 'OphthalmicAxialLengthSelectionMethodCodeSequence'],
        '0x1255': ['SQ', '1', 'OpticalSelectedOphthalmicAxialLengthSequence'],
        '0x1257': ['SQ', '1', 'SelectedSegmentalOphthalmicAxialLengthSequence'],
        '0x1260': ['SQ', '1', 'SelectedTotalOphthalmicAxialLengthSequence'],
        '0x1262': ['SQ', '1', 'OphthalmicAxialLengthQualityMetricSequence'],
        '0x1265': ['SQ', '1', 'OphthalmicAxialLengthQualityMetricTypeCodeSequence'],
        '0x1273': ['LO', '1', 'OphthalmicAxialLengthQualityMetricTypeDescription'],
        '0x1300': ['SQ', '1', 'IntraocularLensCalculationsRightEyeSequence'],
        '0x1310': ['SQ', '1', 'IntraocularLensCalculationsLeftEyeSequence'],
        '0x1330': ['SQ', '1', 'ReferencedOphthalmicAxialLengthMeasurementQCImageSequence'],
        '0x1415': ['CS', '1', 'OphthalmicMappingDeviceType'],
        '0x1420': ['SQ', '1', 'AcquisitionMethodCodeSequence'],
        '0x1423': ['SQ', '1', 'AcquisitionMethodAlgorithmSequence'],
        '0x1436': ['SQ', '1', 'OphthalmicThicknessMapTypeCodeSequence'],
        '0x1443': ['SQ', '1', 'OphthalmicThicknessMappingNormalsSequence'],
        '0x1445': ['SQ', '1', 'RetinalThicknessDefinitionCodeSequence'],
        '0x1450': ['SQ', '1', 'PixelValueMappingToCodedConceptSequence'],
        '0x1452': ['xs', '1', 'MappedPixelValue'],
        '0x1454': ['LO', '1', 'PixelValueMappingExplanation'],
        '0x1458': ['SQ', '1', 'OphthalmicThicknessMapQualityThresholdSequence'],
        '0x1460': ['FL', '1', 'OphthalmicThicknessMapThresholdQualityRating'],
        '0x1463': ['FL', '2', 'AnatomicStructureReferencePoint'],
        '0x1465': ['SQ', '1', 'RegistrationToLocalizerSequence'],
        '0x1466': ['CS', '1', 'RegisteredLocalizerUnits'],
        '0x1467': ['FL', '2', 'RegisteredLocalizerTopLeftHandCorner'],
        '0x1468': ['FL', '2', 'RegisteredLocalizerBottomRightHandCorner'],
        '0x1470': ['SQ', '1', 'OphthalmicThicknessMapQualityRatingSequence'],
        '0x1472': ['SQ', '1', 'RelevantOPTAttributesSequence'],
        '0x1512': ['SQ', '1', 'TransformationMethodCodeSequence'],
        '0x1513': ['SQ', '1', 'TransformationAlgorithmSequence'],
        '0x1515': ['CS', '1', 'OphthalmicAxialLengthMethod'],
        '0x1517': ['FL', '1', 'OphthalmicFOV'],
        '0x1518': ['SQ', '1', 'TwoDimensionalToThreeDimensionalMapSequence'],
        '0x1525': ['SQ', '1', 'WideFieldOphthalmicPhotographyQualityRatingSequence'],
        '0x1526': ['SQ', '1', 'WideFieldOphthalmicPhotographyQualityThresholdSequence'],
        '0x1527': ['FL', '1', 'WideFieldOphthalmicPhotographyThresholdQualityRating'],
        '0x1528': ['FL', '1', 'XCoordinatesCenterPixelViewAngle'],
        '0x1529': ['FL', '1', 'YCoordinatesCenterPixelViewAngle'],
        '0x1530': ['UL', '1', 'NumberOfMapPoints'],
        '0x1531': ['OF', '1', 'TwoDimensionalToThreeDimensionalMapData'],
    },
    '0x0024': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0010': ['FL', '1', 'VisualFieldHorizontalExtent'],
        '0x0011': ['FL', '1', 'VisualFieldVerticalExtent'],
        '0x0012': ['CS', '1', 'VisualFieldShape'],
        '0x0016': ['SQ', '1', 'ScreeningTestModeCodeSequence'],
        '0x0018': ['FL', '1', 'MaximumStimulusLuminance'],
        '0x0020': ['FL', '1', 'BackgroundLuminance'],
        '0x0021': ['SQ', '1', 'StimulusColorCodeSequence'],
        '0x0024': ['SQ', '1', 'BackgroundIlluminationColorCodeSequence'],
        '0x0025': ['FL', '1', 'StimulusArea'],
        '0x0028': ['FL', '1', 'StimulusPresentationTime'],
        '0x0032': ['SQ', '1', 'FixationSequence'],
        '0x0033': ['SQ', '1', 'FixationMonitoringCodeSequence'],
        '0x0034': ['SQ', '1', 'VisualFieldCatchTrialSequence'],
        '0x0035': ['US', '1', 'FixationCheckedQuantity'],
        '0x0036': ['US', '1', 'PatientNotProperlyFixatedQuantity'],
        '0x0037': ['CS', '1', 'PresentedVisualStimuliDataFlag'],
        '0x0038': ['US', '1', 'NumberOfVisualStimuli'],
        '0x0039': ['CS', '1', 'ExcessiveFixationLossesDataFlag'],
        '0x0040': ['CS', '1', 'ExcessiveFixationLosses'],
        '0x0042': ['US', '1', 'StimuliRetestingQuantity'],
        '0x0044': ['LT', '1', 'CommentsOnPatientPerformanceOfVisualField'],
        '0x0045': ['CS', '1', 'FalseNegativesEstimateFlag'],
        '0x0046': ['FL', '1', 'FalseNegativesEstimate'],
        '0x0048': ['US', '1', 'NegativeCatchTrialsQuantity'],
        '0x0050': ['US', '1', 'FalseNegativesQuantity'],
        '0x0051': ['CS', '1', 'ExcessiveFalseNegativesDataFlag'],
        '0x0052': ['CS', '1', 'ExcessiveFalseNegatives'],
        '0x0053': ['CS', '1', 'FalsePositivesEstimateFlag'],
        '0x0054': ['FL', '1', 'FalsePositivesEstimate'],
        '0x0055': ['CS', '1', 'CatchTrialsDataFlag'],
        '0x0056': ['US', '1', 'PositiveCatchTrialsQuantity'],
        '0x0057': ['CS', '1', 'TestPointNormalsDataFlag'],
        '0x0058': ['SQ', '1', 'TestPointNormalsSequence'],
        '0x0059': ['CS', '1', 'GlobalDeviationProbabilityNormalsFlag'],
        '0x0060': ['US', '1', 'FalsePositivesQuantity'],
        '0x0061': ['CS', '1', 'ExcessiveFalsePositivesDataFlag'],
        '0x0062': ['CS', '1', 'ExcessiveFalsePositives'],
        '0x0063': ['CS', '1', 'VisualFieldTestNormalsFlag'],
        '0x0064': ['SQ', '1', 'ResultsNormalsSequence'],
        '0x0065': ['SQ', '1', 'AgeCorrectedSensitivityDeviationAlgorithmSequence'],
        '0x0066': ['FL', '1', 'GlobalDeviationFromNormal'],
        '0x0067': ['SQ', '1', 'GeneralizedDefectSensitivityDeviationAlgorithmSequence'],
        '0x0068': ['FL', '1', 'LocalizedDeviationFromNormal'],
        '0x0069': ['LO', '1', 'PatientReliabilityIndicator'],
        '0x0070': ['FL', '1', 'VisualFieldMeanSensitivity'],
        '0x0071': ['FL', '1', 'GlobalDeviationProbability'],
        '0x0072': ['CS', '1', 'LocalDeviationProbabilityNormalsFlag'],
        '0x0073': ['FL', '1', 'LocalizedDeviationProbability'],
        '0x0074': ['CS', '1', 'ShortTermFluctuationCalculated'],
        '0x0075': ['FL', '1', 'ShortTermFluctuation'],
        '0x0076': ['CS', '1', 'ShortTermFluctuationProbabilityCalculated'],
        '0x0077': ['FL', '1', 'ShortTermFluctuationProbability'],
        '0x0078': ['CS', '1', 'CorrectedLocalizedDeviationFromNormalCalculated'],
        '0x0079': ['FL', '1', 'CorrectedLocalizedDeviationFromNormal'],
        '0x0080': ['CS', '1', 'CorrectedLocalizedDeviationFromNormalProbabilityCalculated'],
        '0x0081': ['FL', '1', 'CorrectedLocalizedDeviationFromNormalProbability'],
        '0x0083': ['SQ', '1', 'GlobalDeviationProbabilitySequence'],
        '0x0085': ['SQ', '1', 'LocalizedDeviationProbabilitySequence'],
        '0x0086': ['CS', '1', 'FovealSensitivityMeasured'],
        '0x0087': ['FL', '1', 'FovealSensitivity'],
        '0x0088': ['FL', '1', 'VisualFieldTestDuration'],
        '0x0089': ['SQ', '1', 'VisualFieldTestPointSequence'],
        '0x0090': ['FL', '1', 'VisualFieldTestPointXCoordinate'],
        '0x0091': ['FL', '1', 'VisualFieldTestPointYCoordinate'],
        '0x0092': ['FL', '1', 'AgeCorrectedSensitivityDeviationValue'],
        '0x0093': ['CS', '1', 'StimulusResults'],
        '0x0094': ['FL', '1', 'SensitivityValue'],
        '0x0095': ['CS', '1', 'RetestStimulusSeen'],
        '0x0096': ['FL', '1', 'RetestSensitivityValue'],
        '0x0097': ['SQ', '1', 'VisualFieldTestPointNormalsSequence'],
        '0x0098': ['FL', '1', 'QuantifiedDefect'],
        '0x0100': ['FL', '1', 'AgeCorrectedSensitivityDeviationProbabilityValue'],
        '0x0102': ['CS', '1', 'GeneralizedDefectCorrectedSensitivityDeviationFlag'],
        '0x0103': ['FL', '1', 'GeneralizedDefectCorrectedSensitivityDeviationValue'],
        '0x0104': ['FL', '1', 'GeneralizedDefectCorrectedSensitivityDeviationProbabilityValue'],
        '0x0105': ['FL', '1', 'MinimumSensitivityValue'],
        '0x0106': ['CS', '1', 'BlindSpotLocalized'],
        '0x0107': ['FL', '1', 'BlindSpotXCoordinate'],
        '0x0108': ['FL', '1', 'BlindSpotYCoordinate'],
        '0x0110': ['SQ', '1', 'VisualAcuityMeasurementSequence'],
        '0x0112': ['SQ', '1', 'RefractiveParametersUsedOnPatientSequence'],
        '0x0113': ['CS', '1', 'MeasurementLaterality'],
        '0x0114': ['SQ', '1', 'OphthalmicPatientClinicalInformationLeftEyeSequence'],
        '0x0115': ['SQ', '1', 'OphthalmicPatientClinicalInformationRightEyeSequence'],
        '0x0117': ['CS', '1', 'FovealPointNormativeDataFlag'],
        '0x0118': ['FL', '1', 'FovealPointProbabilityValue'],
        '0x0120': ['CS', '1', 'ScreeningBaselineMeasured'],
        '0x0122': ['SQ', '1', 'ScreeningBaselineMeasuredSequence'],
        '0x0124': ['CS', '1', 'ScreeningBaselineType'],
        '0x0126': ['FL', '1', 'ScreeningBaselineValue'],
        '0x0202': ['LO', '1', 'AlgorithmSource'],
        '0x0306': ['LO', '1', 'DataSetName'],
        '0x0307': ['LO', '1', 'DataSetVersion'],
        '0x0308': ['LO', '1', 'DataSetSource'],
        '0x0309': ['LO', '1', 'DataSetDescription'],
        '0x0317': ['SQ', '1', 'VisualFieldTestReliabilityGlobalIndexSequence'],
        '0x0320': ['SQ', '1', 'VisualFieldGlobalResultsIndexSequence'],
        '0x0325': ['SQ', '1', 'DataObservationSequence'],
        '0x0338': ['CS', '1', 'IndexNormalsFlag'],
        '0x0341': ['FL', '1', 'IndexProbability'],
        '0x0344': ['SQ', '1', 'IndexProbabilitySequence'],
    },
    '0x0028': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0002': ['US', '1', 'SamplesPerPixel'],
        '0x0003': ['US', '1', 'SamplesPerPixelUsed'],
        '0x0004': ['CS', '1', 'PhotometricInterpretation'],
        '0x0005': ['US', '1', 'ImageDimensions'],
        '0x0006': ['US', '1', 'PlanarConfiguration'],
        '0x0008': ['IS', '1', 'NumberOfFrames'],
        '0x0009': ['AT', '1-n', 'FrameIncrementPointer'],
        '0x000A': ['AT', '1-n', 'FrameDimensionPointer'],
        '0x0010': ['US', '1', 'Rows'],
        '0x0011': ['US', '1', 'Columns'],
        '0x0012': ['US', '1', 'Planes'],
        '0x0014': ['US', '1', 'UltrasoundColorDataPresent'],
        '0x0020': ['', '', ''],
        '0x0030': ['DS', '2', 'PixelSpacing'],
        '0x0031': ['DS', '2', 'ZoomFactor'],
        '0x0032': ['DS', '2', 'ZoomCenter'],
        '0x0034': ['IS', '2', 'PixelAspectRatio'],
        '0x0040': ['CS', '1', 'ImageFormat'],
        '0x0050': ['LO', '1-n', 'ManipulatedImage'],
        '0x0051': ['CS', '1-n', 'CorrectedImage'],
        '0x005F': ['LO', '1', 'CompressionRecognitionCode'],
        '0x0060': ['CS', '1', 'CompressionCode'],
        '0x0061': ['SH', '1', 'CompressionOriginator'],
        '0x0062': ['LO', '1', 'CompressionLabel'],
        '0x0063': ['SH', '1', 'CompressionDescription'],
        '0x0065': ['CS', '1-n', 'CompressionSequence'],
        '0x0066': ['AT', '1-n', 'CompressionStepPointers'],
        '0x0068': ['US', '1', 'RepeatInterval'],
        '0x0069': ['US', '1', 'BitsGrouped'],
        '0x0070': ['US', '1-n', 'PerimeterTable'],
        '0x0071': ['xs', '1', 'PerimeterValue'],
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
        '0x0104': ['xs', '1', 'SmallestValidPixelValue'],
        '0x0105': ['xs', '1', 'LargestValidPixelValue'],
        '0x0106': ['xs', '1', 'SmallestImagePixelValue'],
        '0x0107': ['xs', '1', 'LargestImagePixelValue'],
        '0x0108': ['xs', '1', 'SmallestPixelValueInSeries'],
        '0x0109': ['xs', '1', 'LargestPixelValueInSeries'],
        '0x0110': ['xs', '1', 'SmallestImagePixelValueInPlane'],
        '0x0111': ['xs', '1', 'LargestImagePixelValueInPlane'],
        '0x0120': ['xs', '1', 'PixelPaddingValue'],
        '0x0121': ['xs', '1', 'PixelPaddingRangeLimit'],
        '0x0122': ['FL', '1', 'FloatPixelPaddingValue'],
        '0x0123': ['FD', '1', 'DoubleFloatPixelPaddingValue'],
        '0x0124': ['FL', '1', 'FloatPixelPaddingRangeLimit'],
        '0x0125': ['FD', '1', 'DoubleFloatPixelPaddingRangeLimit'],
        '0x0200': ['US', '1', 'ImageLocation'],
        '0x0300': ['CS', '1', 'QualityControlImage'],
        '0x0301': ['CS', '1', 'BurnedInAnnotation'],
        '0x0302': ['CS', '1', 'RecognizableVisualFeatures'],
        '0x0303': ['CS', '1', 'LongitudinalTemporalInformationModified'],
        '0x0304': ['UI', '1', 'ReferencedColorPaletteInstanceUID'],
        '0x0400': ['LO', '1', 'TransformLabel'],
        '0x0401': ['LO', '1', 'TransformVersionNumber'],
        '0x0402': ['US', '1', 'NumberOfTransformSteps'],
        '0x0403': ['LO', '1-n', 'SequenceOfCompressedData'],
        '0x0404': ['AT', '1-n', 'DetailsOfCoefficients'],
        '0x04x0': ['US', '1', 'RowsForNthOrderCoefficients'],
        '0x04x1': ['US', '1', 'ColumnsForNthOrderCoefficients'],
        '0x04x2': ['LO', '1-n', 'CoefficientCoding'],
        '0x04x3': ['AT', '1-n', 'CoefficientCodingPointers'],
        '0x0700': ['LO', '1', 'DCTLabel'],
        '0x0701': ['CS', '1-n', 'DataBlockDescription'],
        '0x0702': ['AT', '1-n', 'DataBlock'],
        '0x0710': ['US', '1', 'NormalizationFactorFormat'],
        '0x0720': ['US', '1', 'ZonalMapNumberFormat'],
        '0x0721': ['AT', '1-n', 'ZonalMapLocation'],
        '0x0722': ['US', '1', 'ZonalMapFormat'],
        '0x0730': ['US', '1', 'AdaptiveMapFormat'],
        '0x0740': ['US', '1', 'CodeNumberFormat'],
        '0x08x0': ['CS', '1-n', 'CodeLabel'],
        '0x08x2': ['US', '1', 'NumberOfTables'],
        '0x08x3': ['AT', '1-n', 'CodeTableLocation'],
        '0x08x4': ['US', '1', 'BitsForCodeWord'],
        '0x08x8': ['AT', '1-n', 'ImageDataLocation'],
        '0x0A02': ['CS', '1', 'PixelSpacingCalibrationType'],
        '0x0A04': ['LO', '1', 'PixelSpacingCalibrationDescription'],
        '0x1040': ['CS', '1', 'PixelIntensityRelationship'],
        '0x1041': ['SS', '1', 'PixelIntensityRelationshipSign'],
        '0x1050': ['DS', '1-n', 'WindowCenter'],
        '0x1051': ['DS', '1-n', 'WindowWidth'],
        '0x1052': ['DS', '1', 'RescaleIntercept'],
        '0x1053': ['DS', '1', 'RescaleSlope'],
        '0x1054': ['LO', '1', 'RescaleType'],
        '0x1055': ['LO', '1-n', 'WindowCenterWidthExplanation'],
        '0x1056': ['CS', '1', 'VOILUTFunction'],
        '0x1080': ['CS', '1', 'GrayScale'],
        '0x1090': ['CS', '1', 'RecommendedViewingMode'],
        '0x1100': ['xs', '3', 'GrayLookupTableDescriptor'],
        '0x1101': ['xs', '3', 'RedPaletteColorLookupTableDescriptor'],
        '0x1102': ['xs', '3', 'GreenPaletteColorLookupTableDescriptor'],
        '0x1103': ['xs', '3', 'BluePaletteColorLookupTableDescriptor'],
        '0x1104': ['US', '3', 'AlphaPaletteColorLookupTableDescriptor'],
        '0x1111': ['xs', '4', 'LargeRedPaletteColorLookupTableDescriptor'],
        '0x1112': ['xs', '4', 'LargeGreenPaletteColorLookupTableDescriptor'],
        '0x1113': ['xs', '4', 'LargeBluePaletteColorLookupTableDescriptor'],
        '0x1199': ['UI', '1', 'PaletteColorLookupTableUID'],
        '0x1200': ['US or SS or OW', '1-n or 1', 'GrayLookupTableData'],
        '0x1201': ['OW', '1', 'RedPaletteColorLookupTableData'],
        '0x1202': ['OW', '1', 'GreenPaletteColorLookupTableData'],
        '0x1203': ['OW', '1', 'BluePaletteColorLookupTableData'],
        '0x1204': ['OW', '1', 'AlphaPaletteColorLookupTableData'],
        '0x1211': ['OW', '1', 'LargeRedPaletteColorLookupTableData'],
        '0x1212': ['OW', '1', 'LargeGreenPaletteColorLookupTableData'],
        '0x1213': ['OW', '1', 'LargeBluePaletteColorLookupTableData'],
        '0x1214': ['UI', '1', 'LargePaletteColorLookupTableUID'],
        '0x1221': ['OW', '1', 'SegmentedRedPaletteColorLookupTableData'],
        '0x1222': ['OW', '1', 'SegmentedGreenPaletteColorLookupTableData'],
        '0x1223': ['OW', '1', 'SegmentedBluePaletteColorLookupTableData'],
        '0x1300': ['CS', '1', 'BreastImplantPresent'],
        '0x1350': ['CS', '1', 'PartialView'],
        '0x1351': ['ST', '1', 'PartialViewDescription'],
        '0x1352': ['SQ', '1', 'PartialViewCodeSequence'],
        '0x135A': ['CS', '1', 'SpatialLocationsPreserved'],
        '0x1401': ['SQ', '1', 'DataFrameAssignmentSequence'],
        '0x1402': ['CS', '1', 'DataPathAssignment'],
        '0x1403': ['US', '1', 'BitsMappedToColorLookupTable'],
        '0x1404': ['SQ', '1', 'BlendingLUT1Sequence'],
        '0x1405': ['CS', '1', 'BlendingLUT1TransferFunction'],
        '0x1406': ['FD', '1', 'BlendingWeightConstant'],
        '0x1407': ['US', '3', 'BlendingLookupTableDescriptor'],
        '0x1408': ['OW', '1', 'BlendingLookupTableData'],
        '0x140B': ['SQ', '1', 'EnhancedPaletteColorLookupTableSequence'],
        '0x140C': ['SQ', '1', 'BlendingLUT2Sequence'],
        '0x140D': ['CS', '1', 'BlendingLUT2TransferFunction'],
        '0x140E': ['CS', '1', 'DataPathID'],
        '0x140F': ['CS', '1', 'RGBLUTTransferFunction'],
        '0x1410': ['CS', '1', 'AlphaLUTTransferFunction'],
        '0x2000': ['OB', '1', 'ICCProfile'],
        '0x2110': ['CS', '1', 'LossyImageCompression'],
        '0x2112': ['DS', '1-n', 'LossyImageCompressionRatio'],
        '0x2114': ['CS', '1-n', 'LossyImageCompressionMethod'],
        '0x3000': ['SQ', '1', 'ModalityLUTSequence'],
        '0x3002': ['xs', '3', 'LUTDescriptor'],
        '0x3003': ['LO', '1', 'LUTExplanation'],
        '0x3004': ['LO', '1', 'ModalityLUTType'],
        '0x3006': ['US or OW', '1-n or 1', 'LUTData'],
        '0x3010': ['SQ', '1', 'VOILUTSequence'],
        '0x3110': ['SQ', '1', 'SoftcopyVOILUTSequence'],
        '0x4000': ['LT', '1', 'ImagePresentationComments'],
        '0x5000': ['SQ', '1', 'BiPlaneAcquisitionSequence'],
        '0x6010': ['US', '1', 'RepresentativeFrameNumber'],
        '0x6020': ['US', '1-n', 'FrameNumbersOfInterest'],
        '0x6022': ['LO', '1-n', 'FrameOfInterestDescription'],
        '0x6023': ['CS', '1-n', 'FrameOfInterestType'],
        '0x6030': ['US', '1-n', 'MaskPointers'],
        '0x6040': ['US', '1-n', 'RWavePointer'],
        '0x6100': ['SQ', '1', 'MaskSubtractionSequence'],
        '0x6101': ['CS', '1', 'MaskOperation'],
        '0x6102': ['US', '2-2n', 'ApplicableFrameRange'],
        '0x6110': ['US', '1-n', 'MaskFrameNumbers'],
        '0x6112': ['US', '1', 'ContrastFrameAveraging'],
        '0x6114': ['FL', '2', 'MaskSubPixelShift'],
        '0x6120': ['SS', '1', 'TIDOffset'],
        '0x6190': ['ST', '1', 'MaskOperationExplanation'],
        '0x7000': ['SQ', '1', 'EquipmentAdministratorSequence'],
        '0x7001': ['US', '1', 'NumberOfDisplaySubsystems'],
        '0x7002': ['US', '1', 'CurrentConfigurationID'],
        '0x7003': ['US', '1', 'DisplaySubsystemID'],
        '0x7004': ['SH', '1', 'DisplaySubsystemName'],
        '0x7005': ['LO', '1', 'DisplaySubsystemDescription'],
        '0x7006': ['CS', '1', 'SystemStatus'],
        '0x7007': ['LO', '1', 'SystemStatusComment'],
        '0x7008': ['SQ', '1', 'TargetLuminanceCharacteristicsSequence'],
        '0x7009': ['US', '1', 'LuminanceCharacteristicsID'],
        '0x700A': ['SQ', '1', 'DisplaySubsystemConfigurationSequence'],
        '0x700B': ['US', '1', 'ConfigurationID'],
        '0x700C': ['SH', '1', 'ConfigurationName'],
        '0x700D': ['LO', '1', 'ConfigurationDescription'],
        '0x700E': ['US', '1', 'ReferencedTargetLuminanceCharacteristicsID'],
        '0x700F': ['SQ', '1', 'QAResultsSequence'],
        '0x7010': ['SQ', '1', 'DisplaySubsystemQAResultsSequence'],
        '0x7011': ['SQ', '1', 'ConfigurationQAResultsSequence'],
        '0x7012': ['SQ', '1', 'MeasurementEquipmentSequence'],
        '0x7013': ['CS', '1-n', 'MeasurementFunctions'],
        '0x7014': ['CS', '1', 'MeasurementEquipmentType'],
        '0x7015': ['SQ', '1', 'VisualEvaluationResultSequence'],
        '0x7016': ['SQ', '1', 'DisplayCalibrationResultSequence'],
        '0x7017': ['US', '1', 'DDLValue'],
        '0x7018': ['FL', '2', 'CIExyWhitePoint'],
        '0x7019': ['CS', '1', 'DisplayFunctionType'],
        '0x701A': ['FL', '1', 'GammaValue'],
        '0x701B': ['US', '1', 'NumberOfLuminancePoints'],
        '0x701C': ['SQ', '1', 'LuminanceResponseSequence'],
        '0x701D': ['FL', '1', 'TargetMinimumLuminance'],
        '0x701E': ['FL', '1', 'TargetMaximumLuminance'],
        '0x701F': ['FL', '1', 'LuminanceValue'],
        '0x7020': ['LO', '1', 'LuminanceResponseDescription'],
        '0x7021': ['CS', '1', 'WhitePointFlag'],
        '0x7022': ['SQ', '1', 'DisplayDeviceTypeCodeSequence'],
        '0x7023': ['SQ', '1', 'DisplaySubsystemSequence'],
        '0x7024': ['SQ', '1', 'LuminanceResultSequence'],
        '0x7025': ['CS', '1', 'AmbientLightValueSource'],
        '0x7026': ['CS', '1-n', 'MeasuredCharacteristics'],
        '0x7027': ['SQ', '1', 'LuminanceUniformityResultSequence'],
        '0x7028': ['SQ', '1', 'VisualEvaluationTestSequence'],
        '0x7029': ['CS', '1', 'TestResult'],
        '0x702A': ['LO', '1', 'TestResultComment'],
        '0x702B': ['CS', '1', 'TestImageValidation'],
        '0x702C': ['SQ', '1', 'TestPatternCodeSequence'],
        '0x702D': ['SQ', '1', 'MeasurementPatternCodeSequence'],
        '0x702E': ['SQ', '1', 'VisualEvaluationMethodCodeSequence'],
        '0x7FE0': ['UR', '1', 'PixelDataProviderURL'],
        '0x9001': ['UL', '1', 'DataPointRows'],
        '0x9002': ['UL', '1', 'DataPointColumns'],
        '0x9003': ['CS', '1', 'SignalDomainColumns'],
        '0x9099': ['US', '1', 'LargestMonochromePixelValue'],
        '0x9108': ['CS', '1', 'DataRepresentation'],
        '0x9110': ['SQ', '1', 'PixelMeasuresSequence'],
        '0x9132': ['SQ', '1', 'FrameVOILUTSequence'],
        '0x9145': ['SQ', '1', 'PixelValueTransformationSequence'],
        '0x9235': ['CS', '1', 'SignalDomainRows'],
        '0x9411': ['FL', '1', 'DisplayFilterPercentage'],
        '0x9415': ['SQ', '1', 'FramePixelShiftSequence'],
        '0x9416': ['US', '1', 'SubtractionItemID'],
        '0x9422': ['SQ', '1', 'PixelIntensityRelationshipLUTSequence'],
        '0x9443': ['SQ', '1', 'FramePixelDataPropertiesSequence'],
        '0x9444': ['CS', '1', 'GeometricalProperties'],
        '0x9445': ['FL', '1', 'GeometricMaximumDistortion'],
        '0x9446': ['CS', '1-n', 'ImageProcessingApplied'],
        '0x9454': ['CS', '1', 'MaskSelectionMode'],
        '0x9474': ['CS', '1', 'LUTFunction'],
        '0x9478': ['FL', '1', 'MaskVisibilityPercentage'],
        '0x9501': ['SQ', '1', 'PixelShiftSequence'],
        '0x9502': ['SQ', '1', 'RegionPixelShiftSequence'],
        '0x9503': ['SS', '2-2n', 'VerticesOfTheRegion'],
        '0x9505': ['SQ', '1', 'MultiFramePresentationSequence'],
        '0x9506': ['US', '2-2n', 'PixelShiftFrameRange'],
        '0x9507': ['US', '2-2n', 'LUTFrameRange'],
        '0x9520': ['DS', '16', 'ImageToEquipmentMappingMatrix'],
        '0x9537': ['CS', '1', 'EquipmentCoordinateSystemIdentification'],
    },
    '0x0032': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
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
        '0x1031': ['SQ', '1', 'RequestingPhysicianIdentificationSequence'],
        '0x1032': ['PN', '1', 'RequestingPhysician'],
        '0x1033': ['LO', '1', 'RequestingService'],
        '0x1034': ['SQ', '1', 'RequestingServiceCodeSequence'],
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
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0004': ['SQ', '1', 'ReferencedPatientAliasSequence'],
        '0x0008': ['CS', '1', 'VisitStatusID'],
        '0x0010': ['LO', '1', 'AdmissionID'],
        '0x0011': ['LO', '1', 'IssuerOfAdmissionID'],
        '0x0014': ['SQ', '1', 'IssuerOfAdmissionIDSequence'],
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
        '0x0060': ['LO', '1', 'ServiceEpisodeID'],
        '0x0061': ['LO', '1', 'IssuerOfServiceEpisodeID'],
        '0x0062': ['LO', '1', 'ServiceEpisodeDescription'],
        '0x0064': ['SQ', '1', 'IssuerOfServiceEpisodeIDSequence'],
        '0x0100': ['SQ', '1', 'PertinentDocumentsSequence'],
        '0x0101': ['SQ', '1', 'PertinentResourcesSequence'],
        '0x0102': ['LO', '1', 'ResourceDescription'],
        '0x0300': ['LO', '1', 'CurrentPatientLocation'],
        '0x0400': ['LO', '1', 'PatientInstitutionResidence'],
        '0x0500': ['LO', '1', 'PatientState'],
        '0x0502': ['SQ', '1', 'PatientClinicalTrialParticipationSequence'],
        '0x4000': ['LT', '1', 'VisitComments'],
    },
    '0x003A': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0004': ['CS', '1', 'WaveformOriginality'],
        '0x0005': ['US', '1', 'NumberOfWaveformChannels'],
        '0x0010': ['UL', '1', 'NumberOfWaveformSamples'],
        '0x001A': ['DS', '1', 'SamplingFrequency'],
        '0x0020': ['SH', '1', 'MultiplexGroupLabel'],
        '0x0200': ['SQ', '1', 'ChannelDefinitionSequence'],
        '0x0202': ['IS', '1', 'WaveformChannelNumber'],
        '0x0203': ['SH', '1', 'ChannelLabel'],
        '0x0205': ['CS', '1-n', 'ChannelStatus'],
        '0x0208': ['SQ', '1', 'ChannelSourceSequence'],
        '0x0209': ['SQ', '1', 'ChannelSourceModifiersSequence'],
        '0x020A': ['SQ', '1', 'SourceWaveformSequence'],
        '0x020C': ['LO', '1', 'ChannelDerivationDescription'],
        '0x0210': ['DS', '1', 'ChannelSensitivity'],
        '0x0211': ['SQ', '1', 'ChannelSensitivityUnitsSequence'],
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
        '0x0230': ['FL', '1', 'WaveformDataDisplayScale'],
        '0x0231': ['US', '3', 'WaveformDisplayBackgroundCIELabValue'],
        '0x0240': ['SQ', '1', 'WaveformPresentationGroupSequence'],
        '0x0241': ['US', '1', 'PresentationGroupNumber'],
        '0x0242': ['SQ', '1', 'ChannelDisplaySequence'],
        '0x0244': ['US', '3', 'ChannelRecommendedDisplayCIELabValue'],
        '0x0245': ['FL', '1', 'ChannelPosition'],
        '0x0246': ['CS', '1', 'DisplayShadingFlag'],
        '0x0247': ['FL', '1', 'FractionalChannelDisplayScale'],
        '0x0248': ['FL', '1', 'AbsoluteChannelDisplayScale'],
        '0x0300': ['SQ', '1', 'MultiplexedAudioChannelsDescriptionCodeSequence'],
        '0x0301': ['IS', '1', 'ChannelIdentificationCode'],
        '0x0302': ['CS', '1', 'ChannelMode'],
    },
    '0x0040': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0001': ['AE', '1-n', 'ScheduledStationAETitle'],
        '0x0002': ['DA', '1', 'ScheduledProcedureStepStartDate'],
        '0x0003': ['TM', '1', 'ScheduledProcedureStepStartTime'],
        '0x0004': ['DA', '1', 'ScheduledProcedureStepEndDate'],
        '0x0005': ['TM', '1', 'ScheduledProcedureStepEndTime'],
        '0x0006': ['PN', '1', 'ScheduledPerformingPhysicianName'],
        '0x0007': ['LO', '1', 'ScheduledProcedureStepDescription'],
        '0x0008': ['SQ', '1', 'ScheduledProtocolCodeSequence'],
        '0x0009': ['SH', '1', 'ScheduledProcedureStepID'],
        '0x000A': ['SQ', '1', 'StageCodeSequence'],
        '0x000B': ['SQ', '1', 'ScheduledPerformingPhysicianIdentificationSequence'],
        '0x0010': ['SH', '1-n', 'ScheduledStationName'],
        '0x0011': ['SH', '1', 'ScheduledProcedureStepLocation'],
        '0x0012': ['LO', '1', 'PreMedication'],
        '0x0020': ['CS', '1', 'ScheduledProcedureStepStatus'],
        '0x0026': ['SQ', '1', 'OrderPlacerIdentifierSequence'],
        '0x0027': ['SQ', '1', 'OrderFillerIdentifierSequence'],
        '0x0031': ['UT', '1', 'LocalNamespaceEntityID'],
        '0x0032': ['UT', '1', 'UniversalEntityID'],
        '0x0033': ['CS', '1', 'UniversalEntityIDType'],
        '0x0035': ['CS', '1', 'IdentifierTypeCode'],
        '0x0036': ['SQ', '1', 'AssigningFacilitySequence'],
        '0x0039': ['SQ', '1', 'AssigningJurisdictionCodeSequence'],
        '0x003A': ['SQ', '1', 'AssigningAgencyOrDepartmentCodeSequence'],
        '0x0100': ['SQ', '1', 'ScheduledProcedureStepSequence'],
        '0x0220': ['SQ', '1', 'ReferencedNonImageCompositeSOPInstanceSequence'],
        '0x0241': ['AE', '1', 'PerformedStationAETitle'],
        '0x0242': ['SH', '1', 'PerformedStationName'],
        '0x0243': ['SH', '1', 'PerformedLocation'],
        '0x0244': ['DA', '1', 'PerformedProcedureStepStartDate'],
        '0x0245': ['TM', '1', 'PerformedProcedureStepStartTime'],
        '0x0250': ['DA', '1', 'PerformedProcedureStepEndDate'],
        '0x0251': ['TM', '1', 'PerformedProcedureStepEndTime'],
        '0x0252': ['CS', '1', 'PerformedProcedureStepStatus'],
        '0x0253': ['SH', '1', 'PerformedProcedureStepID'],
        '0x0254': ['LO', '1', 'PerformedProcedureStepDescription'],
        '0x0255': ['LO', '1', 'PerformedProcedureTypeDescription'],
        '0x0260': ['SQ', '1', 'PerformedProtocolCodeSequence'],
        '0x0261': ['CS', '1', 'PerformedProtocolType'],
        '0x0270': ['SQ', '1', 'ScheduledStepAttributesSequence'],
        '0x0275': ['SQ', '1', 'RequestAttributesSequence'],
        '0x0280': ['ST', '1', 'CommentsOnThePerformedProcedureStep'],
        '0x0281': ['SQ', '1', 'PerformedProcedureStepDiscontinuationReasonCodeSequence'],
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
        '0x030E': ['SQ', '1', 'ExposureDoseSequence'],
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
        '0x0400': ['LT', '1', 'CommentsOnTheScheduledProcedureStep'],
        '0x0440': ['SQ', '1', 'ProtocolContextSequence'],
        '0x0441': ['SQ', '1', 'ContentItemModifierSequence'],
        '0x0500': ['SQ', '1', 'ScheduledSpecimenSequence'],
        '0x050A': ['LO', '1', 'SpecimenAccessionNumber'],
        '0x0512': ['LO', '1', 'ContainerIdentifier'],
        '0x0513': ['SQ', '1', 'IssuerOfTheContainerIdentifierSequence'],
        '0x0515': ['SQ', '1', 'AlternateContainerIdentifierSequence'],
        '0x0518': ['SQ', '1', 'ContainerTypeCodeSequence'],
        '0x051A': ['LO', '1', 'ContainerDescription'],
        '0x0520': ['SQ', '1', 'ContainerComponentSequence'],
        '0x0550': ['SQ', '1', 'SpecimenSequence'],
        '0x0551': ['LO', '1', 'SpecimenIdentifier'],
        '0x0552': ['SQ', '1', 'SpecimenDescriptionSequenceTrial'],
        '0x0553': ['ST', '1', 'SpecimenDescriptionTrial'],
        '0x0554': ['UI', '1', 'SpecimenUID'],
        '0x0555': ['SQ', '1', 'AcquisitionContextSequence'],
        '0x0556': ['ST', '1', 'AcquisitionContextDescription'],
        '0x059A': ['SQ', '1', 'SpecimenTypeCodeSequence'],
        '0x0560': ['SQ', '1', 'SpecimenDescriptionSequence'],
        '0x0562': ['SQ', '1', 'IssuerOfTheSpecimenIdentifierSequence'],
        '0x0600': ['LO', '1', 'SpecimenShortDescription'],
        '0x0602': ['UT', '1', 'SpecimenDetailedDescription'],
        '0x0610': ['SQ', '1', 'SpecimenPreparationSequence'],
        '0x0612': ['SQ', '1', 'SpecimenPreparationStepContentItemSequence'],
        '0x0620': ['SQ', '1', 'SpecimenLocalizationContentItemSequence'],
        '0x06FA': ['LO', '1', 'SlideIdentifier'],
        '0x071A': ['SQ', '1', 'ImageCenterPointCoordinatesSequence'],
        '0x072A': ['DS', '1', 'XOffsetInSlideCoordinateSystem'],
        '0x073A': ['DS', '1', 'YOffsetInSlideCoordinateSystem'],
        '0x074A': ['DS', '1', 'ZOffsetInSlideCoordinateSystem'],
        '0x08D8': ['SQ', '1', 'PixelSpacingSequence'],
        '0x08DA': ['SQ', '1', 'CoordinateSystemAxisCodeSequence'],
        '0x08EA': ['SQ', '1', 'MeasurementUnitsCodeSequence'],
        '0x09F8': ['SQ', '1', 'VitalStainCodeSequenceTrial'],
        '0x1001': ['SH', '1', 'RequestedProcedureID'],
        '0x1002': ['LO', '1', 'ReasonForTheRequestedProcedure'],
        '0x1003': ['SH', '1', 'RequestedProcedurePriority'],
        '0x1004': ['LO', '1', 'PatientTransportArrangements'],
        '0x1005': ['LO', '1', 'RequestedProcedureLocation'],
        '0x1006': ['SH', '1', 'PlacerOrderNumberProcedure'],
        '0x1007': ['SH', '1', 'FillerOrderNumberProcedure'],
        '0x1008': ['LO', '1', 'ConfidentialityCode'],
        '0x1009': ['SH', '1', 'ReportingPriority'],
        '0x100A': ['SQ', '1', 'ReasonForRequestedProcedureCodeSequence'],
        '0x1010': ['PN', '1-n', 'NamesOfIntendedRecipientsOfResults'],
        '0x1011': ['SQ', '1', 'IntendedRecipientsOfResultsIdentificationSequence'],
        '0x1012': ['SQ', '1', 'ReasonForPerformedProcedureCodeSequence'],
        '0x1060': ['LO', '1', 'RequestedProcedureDescriptionTrial'],
        '0x1101': ['SQ', '1', 'PersonIdentificationCodeSequence'],
        '0x1102': ['ST', '1', 'PersonAddress'],
        '0x1103': ['LO', '1-n', 'PersonTelephoneNumbers'],
        '0x1104': ['LT', '1', 'PersonTelecomInformation'],
        '0x1400': ['LT', '1', 'RequestedProcedureComments'],
        '0x2001': ['LO', '1', 'ReasonForTheImagingServiceRequest'],
        '0x2004': ['DA', '1', 'IssueDateOfImagingServiceRequest'],
        '0x2005': ['TM', '1', 'IssueTimeOfImagingServiceRequest'],
        '0x2006': ['SH', '1', 'PlacerOrderNumberImagingServiceRequestRetired'],
        '0x2007': ['SH', '1', 'FillerOrderNumberImagingServiceRequestRetired'],
        '0x2008': ['PN', '1', 'OrderEnteredBy'],
        '0x2009': ['SH', '1', 'OrderEntererLocation'],
        '0x2010': ['SH', '1', 'OrderCallbackPhoneNumber'],
        '0x2011': ['LT', '1', 'OrderCallbackTelecomInformation'],
        '0x2016': ['LO', '1', 'PlacerOrderNumberImagingServiceRequest'],
        '0x2017': ['LO', '1', 'FillerOrderNumberImagingServiceRequest'],
        '0x2400': ['LT', '1', 'ImagingServiceRequestComments'],
        '0x3001': ['LO', '1', 'ConfidentialityConstraintOnPatientDataDescription'],
        '0x4001': ['CS', '1', 'GeneralPurposeScheduledProcedureStepStatus'],
        '0x4002': ['CS', '1', 'GeneralPurposePerformedProcedureStepStatus'],
        '0x4003': ['CS', '1', 'GeneralPurposeScheduledProcedureStepPriority'],
        '0x4004': ['SQ', '1', 'ScheduledProcessingApplicationsCodeSequence'],
        '0x4005': ['DT', '1', 'ScheduledProcedureStepStartDateTime'],
        '0x4006': ['CS', '1', 'MultipleCopiesFlag'],
        '0x4007': ['SQ', '1', 'PerformedProcessingApplicationsCodeSequence'],
        '0x4009': ['SQ', '1', 'HumanPerformerCodeSequence'],
        '0x4010': ['DT', '1', 'ScheduledProcedureStepModificationDateTime'],
        '0x4011': ['DT', '1', 'ExpectedCompletionDateTime'],
        '0x4015': ['SQ', '1', 'ResultingGeneralPurposePerformedProcedureStepsSequence'],
        '0x4016': ['SQ', '1', 'ReferencedGeneralPurposeScheduledProcedureStepSequence'],
        '0x4018': ['SQ', '1', 'ScheduledWorkitemCodeSequence'],
        '0x4019': ['SQ', '1', 'PerformedWorkitemCodeSequence'],
        '0x4020': ['CS', '1', 'InputAvailabilityFlag'],
        '0x4021': ['SQ', '1', 'InputInformationSequence'],
        '0x4022': ['SQ', '1', 'RelevantInformationSequence'],
        '0x4023': ['UI', '1', 'ReferencedGeneralPurposeScheduledProcedureStepTransactionUID'],
        '0x4025': ['SQ', '1', 'ScheduledStationNameCodeSequence'],
        '0x4026': ['SQ', '1', 'ScheduledStationClassCodeSequence'],
        '0x4027': ['SQ', '1', 'ScheduledStationGeographicLocationCodeSequence'],
        '0x4028': ['SQ', '1', 'PerformedStationNameCodeSequence'],
        '0x4029': ['SQ', '1', 'PerformedStationClassCodeSequence'],
        '0x4030': ['SQ', '1', 'PerformedStationGeographicLocationCodeSequence'],
        '0x4031': ['SQ', '1', 'RequestedSubsequentWorkitemCodeSequence'],
        '0x4032': ['SQ', '1', 'NonDICOMOutputCodeSequence'],
        '0x4033': ['SQ', '1', 'OutputInformationSequence'],
        '0x4034': ['SQ', '1', 'ScheduledHumanPerformersSequence'],
        '0x4035': ['SQ', '1', 'ActualHumanPerformersSequence'],
        '0x4036': ['LO', '1', 'HumanPerformerOrganization'],
        '0x4037': ['PN', '1', 'HumanPerformerName'],
        '0x4040': ['CS', '1', 'RawDataHandling'],
        '0x4041': ['CS', '1', 'InputReadinessState'],
        '0x4050': ['DT', '1', 'PerformedProcedureStepStartDateTime'],
        '0x4051': ['DT', '1', 'PerformedProcedureStepEndDateTime'],
        '0x4052': ['DT', '1', 'ProcedureStepCancellationDateTime'],
        '0x8302': ['DS', '1', 'EntranceDoseInmGy'],
        '0x9092': ['SQ', '1', 'ParametricMapFrameTypeSequence'],
        '0x9094': ['SQ', '1', 'ReferencedImageRealWorldValueMappingSequence'],
        '0x9096': ['SQ', '1', 'RealWorldValueMappingSequence'],
        '0x9098': ['SQ', '1', 'PixelValueMappingCodeSequence'],
        '0x9210': ['SH', '1', 'LUTLabel'],
        '0x9211': ['xs', '1', 'RealWorldValueLastValueMapped'],
        '0x9212': ['FD', '1-n', 'RealWorldValueLUTData'],
        '0x9216': ['xs', '1', 'RealWorldValueFirstValueMapped'],
        '0x9220': ['SQ', '1', 'QuantityDefinitionSequence'],
        '0x9224': ['FD', '1', 'RealWorldValueIntercept'],
        '0x9225': ['FD', '1', 'RealWorldValueSlope'],
        '0xA007': ['CS', '1', 'FindingsFlagTrial'],
        '0xA010': ['CS', '1', 'RelationshipType'],
        '0xA020': ['SQ', '1', 'FindingsSequenceTrial'],
        '0xA021': ['UI', '1', 'FindingsGroupUIDTrial'],
        '0xA022': ['UI', '1', 'ReferencedFindingsGroupUIDTrial'],
        '0xA023': ['DA', '1', 'FindingsGroupRecordingDateTrial'],
        '0xA024': ['TM', '1', 'FindingsGroupRecordingTimeTrial'],
        '0xA026': ['SQ', '1', 'FindingsSourceCategoryCodeSequenceTrial'],
        '0xA027': ['LO', '1', 'VerifyingOrganization'],
        '0xA028': ['SQ', '1', 'DocumentingOrganizationIdentifierCodeSequenceTrial'],
        '0xA030': ['DT', '1', 'VerificationDateTime'],
        '0xA032': ['DT', '1', 'ObservationDateTime'],
        '0xA040': ['CS', '1', 'ValueType'],
        '0xA043': ['SQ', '1', 'ConceptNameCodeSequence'],
        '0xA047': ['LO', '1', 'MeasurementPrecisionDescriptionTrial'],
        '0xA050': ['CS', '1', 'ContinuityOfContent'],
        '0xA057': ['CS', '1-n', 'UrgencyOrPriorityAlertsTrial'],
        '0xA060': ['LO', '1', 'SequencingIndicatorTrial'],
        '0xA066': ['SQ', '1', 'DocumentIdentifierCodeSequenceTrial'],
        '0xA067': ['PN', '1', 'DocumentAuthorTrial'],
        '0xA068': ['SQ', '1', 'DocumentAuthorIdentifierCodeSequenceTrial'],
        '0xA070': ['SQ', '1', 'IdentifierCodeSequenceTrial'],
        '0xA073': ['SQ', '1', 'VerifyingObserverSequence'],
        '0xA074': ['OB', '1', 'ObjectBinaryIdentifierTrial'],
        '0xA075': ['PN', '1', 'VerifyingObserverName'],
        '0xA076': ['SQ', '1', 'DocumentingObserverIdentifierCodeSequenceTrial'],
        '0xA078': ['SQ', '1', 'AuthorObserverSequence'],
        '0xA07A': ['SQ', '1', 'ParticipantSequence'],
        '0xA07C': ['SQ', '1', 'CustodialOrganizationSequence'],
        '0xA080': ['CS', '1', 'ParticipationType'],
        '0xA082': ['DT', '1', 'ParticipationDateTime'],
        '0xA084': ['CS', '1', 'ObserverType'],
        '0xA085': ['SQ', '1', 'ProcedureIdentifierCodeSequenceTrial'],
        '0xA088': ['SQ', '1', 'VerifyingObserverIdentificationCodeSequence'],
        '0xA089': ['OB', '1', 'ObjectDirectoryBinaryIdentifierTrial'],
        '0xA090': ['SQ', '1', 'EquivalentCDADocumentSequence'],
        '0xA0B0': ['US', '2-2n', 'ReferencedWaveformChannels'],
        '0xA110': ['DA', '1', 'DateOfDocumentOrVerbalTransactionTrial'],
        '0xA112': ['TM', '1', 'TimeOfDocumentCreationOrVerbalTransactionTrial'],
        '0xA120': ['DT', '1', 'DateTime'],
        '0xA121': ['DA', '1', 'Date'],
        '0xA122': ['TM', '1', 'Time'],
        '0xA123': ['PN', '1', 'PersonName'],
        '0xA124': ['UI', '1', 'UID'],
        '0xA125': ['CS', '2', 'ReportStatusIDTrial'],
        '0xA130': ['CS', '1', 'TemporalRangeType'],
        '0xA132': ['UL', '1-n', 'ReferencedSamplePositions'],
        '0xA136': ['US', '1-n', 'ReferencedFrameNumbers'],
        '0xA138': ['DS', '1-n', 'ReferencedTimeOffsets'],
        '0xA13A': ['DT', '1-n', 'ReferencedDateTime'],
        '0xA160': ['UT', '1', 'TextValue'],
        '0xA161': ['FD', '1-n', 'FloatingPointValue'],
        '0xA162': ['SL', '1-n', 'RationalNumeratorValue'],
        '0xA163': ['UL', '1-n', 'RationalDenominatorValue'],
        '0xA167': ['SQ', '1', 'ObservationCategoryCodeSequenceTrial'],
        '0xA168': ['SQ', '1', 'ConceptCodeSequence'],
        '0xA16A': ['ST', '1', 'BibliographicCitationTrial'],
        '0xA170': ['SQ', '1', 'PurposeOfReferenceCodeSequence'],
        '0xA171': ['UI', '1', 'ObservationUID'],
        '0xA172': ['UI', '1', 'ReferencedObservationUIDTrial'],
        '0xA173': ['CS', '1', 'ReferencedObservationClassTrial'],
        '0xA174': ['CS', '1', 'ReferencedObjectObservationClassTrial'],
        '0xA180': ['US', '1', 'AnnotationGroupNumber'],
        '0xA192': ['DA', '1', 'ObservationDateTrial'],
        '0xA193': ['TM', '1', 'ObservationTimeTrial'],
        '0xA194': ['CS', '1', 'MeasurementAutomationTrial'],
        '0xA195': ['SQ', '1', 'ModifierCodeSequence'],
        '0xA224': ['ST', '1', 'IdentificationDescriptionTrial'],
        '0xA290': ['CS', '1', 'CoordinatesSetGeometricTypeTrial'],
        '0xA296': ['SQ', '1', 'AlgorithmCodeSequenceTrial'],
        '0xA297': ['ST', '1', 'AlgorithmDescriptionTrial'],
        '0xA29A': ['SL', '2-2n', 'PixelCoordinatesSetTrial'],
        '0xA300': ['SQ', '1', 'MeasuredValueSequence'],
        '0xA301': ['SQ', '1', 'NumericValueQualifierCodeSequence'],
        '0xA307': ['PN', '1', 'CurrentObserverTrial'],
        '0xA30A': ['DS', '1-n', 'NumericValue'],
        '0xA313': ['SQ', '1', 'ReferencedAccessionSequenceTrial'],
        '0xA33A': ['ST', '1', 'ReportStatusCommentTrial'],
        '0xA340': ['SQ', '1', 'ProcedureContextSequenceTrial'],
        '0xA352': ['PN', '1', 'VerbalSourceTrial'],
        '0xA353': ['ST', '1', 'AddressTrial'],
        '0xA354': ['LO', '1', 'TelephoneNumberTrial'],
        '0xA358': ['SQ', '1', 'VerbalSourceIdentifierCodeSequenceTrial'],
        '0xA360': ['SQ', '1', 'PredecessorDocumentsSequence'],
        '0xA370': ['SQ', '1', 'ReferencedRequestSequence'],
        '0xA372': ['SQ', '1', 'PerformedProcedureCodeSequence'],
        '0xA375': ['SQ', '1', 'CurrentRequestedProcedureEvidenceSequence'],
        '0xA380': ['SQ', '1', 'ReportDetailSequenceTrial'],
        '0xA385': ['SQ', '1', 'PertinentOtherEvidenceSequence'],
        '0xA390': ['SQ', '1', 'HL7StructuredDocumentReferenceSequence'],
        '0xA402': ['UI', '1', 'ObservationSubjectUIDTrial'],
        '0xA403': ['CS', '1', 'ObservationSubjectClassTrial'],
        '0xA404': ['SQ', '1', 'ObservationSubjectTypeCodeSequenceTrial'],
        '0xA491': ['CS', '1', 'CompletionFlag'],
        '0xA492': ['LO', '1', 'CompletionFlagDescription'],
        '0xA493': ['CS', '1', 'VerificationFlag'],
        '0xA494': ['CS', '1', 'ArchiveRequested'],
        '0xA496': ['CS', '1', 'PreliminaryFlag'],
        '0xA504': ['SQ', '1', 'ContentTemplateSequence'],
        '0xA525': ['SQ', '1', 'IdenticalDocumentsSequence'],
        '0xA600': ['CS', '1', 'ObservationSubjectContextFlagTrial'],
        '0xA601': ['CS', '1', 'ObserverContextFlagTrial'],
        '0xA603': ['CS', '1', 'ProcedureContextFlagTrial'],
        '0xA730': ['SQ', '1', 'ContentSequence'],
        '0xA731': ['SQ', '1', 'RelationshipSequenceTrial'],
        '0xA732': ['SQ', '1', 'RelationshipTypeCodeSequenceTrial'],
        '0xA744': ['SQ', '1', 'LanguageCodeSequenceTrial'],
        '0xA992': ['ST', '1', 'UniformResourceLocatorTrial'],
        '0xB020': ['SQ', '1', 'WaveformAnnotationSequence'],
        '0xDB00': ['CS', '1', 'TemplateIdentifier'],
        '0xDB06': ['DT', '1', 'TemplateVersion'],
        '0xDB07': ['DT', '1', 'TemplateLocalVersion'],
        '0xDB0B': ['CS', '1', 'TemplateExtensionFlag'],
        '0xDB0C': ['UI', '1', 'TemplateExtensionOrganizationUID'],
        '0xDB0D': ['UI', '1', 'TemplateExtensionCreatorUID'],
        '0xDB73': ['UL', '1-n', 'ReferencedContentItemIdentifier'],
        '0xE001': ['ST', '1', 'HL7InstanceIdentifier'],
        '0xE004': ['DT', '1', 'HL7DocumentEffectiveTime'],
        '0xE006': ['SQ', '1', 'HL7DocumentTypeCodeSequence'],
        '0xE008': ['SQ', '1', 'DocumentClassCodeSequence'],
        '0xE010': ['UR', '1', 'RetrieveURI'],
        '0xE011': ['UI', '1', 'RetrieveLocationUID'],
        '0xE020': ['CS', '1', 'TypeOfInstances'],
        '0xE021': ['SQ', '1', 'DICOMRetrievalSequence'],
        '0xE022': ['SQ', '1', 'DICOMMediaRetrievalSequence'],
        '0xE023': ['SQ', '1', 'WADORetrievalSequence'],
        '0xE024': ['SQ', '1', 'XDSRetrievalSequence'],
        '0xE025': ['SQ', '1', 'WADORSRetrievalSequence'],
        '0xE030': ['UI', '1', 'RepositoryUniqueID'],
        '0xE031': ['UI', '1', 'HomeCommunityID'],
    },
    '0x0042': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0010': ['ST', '1', 'DocumentTitle'],
        '0x0011': ['OB', '1', 'EncapsulatedDocument'],
        '0x0012': ['LO', '1', 'MIMETypeOfEncapsulatedDocument'],
        '0x0013': ['SQ', '1', 'SourceInstanceSequence'],
        '0x0014': ['LO', '1-n', 'ListOfMIMETypes'],
    },
    '0x0044': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0001': ['ST', '1', 'ProductPackageIdentifier'],
        '0x0002': ['CS', '1', 'SubstanceAdministrationApproval'],
        '0x0003': ['LT', '1', 'ApprovalStatusFurtherDescription'],
        '0x0004': ['DT', '1', 'ApprovalStatusDateTime'],
        '0x0007': ['SQ', '1', 'ProductTypeCodeSequence'],
        '0x0008': ['LO', '1-n', 'ProductName'],
        '0x0009': ['LT', '1', 'ProductDescription'],
        '0x000A': ['LO', '1', 'ProductLotIdentifier'],
        '0x000B': ['DT', '1', 'ProductExpirationDateTime'],
        '0x0010': ['DT', '1', 'SubstanceAdministrationDateTime'],
        '0x0011': ['LO', '1', 'SubstanceAdministrationNotes'],
        '0x0012': ['LO', '1', 'SubstanceAdministrationDeviceID'],
        '0x0013': ['SQ', '1', 'ProductParameterSequence'],
        '0x0019': ['SQ', '1', 'SubstanceAdministrationParameterSequence'],
    },
    '0x0046': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0012': ['LO', '1', 'LensDescription'],
        '0x0014': ['SQ', '1', 'RightLensSequence'],
        '0x0015': ['SQ', '1', 'LeftLensSequence'],
        '0x0016': ['SQ', '1', 'UnspecifiedLateralityLensSequence'],
        '0x0018': ['SQ', '1', 'CylinderSequence'],
        '0x0028': ['SQ', '1', 'PrismSequence'],
        '0x0030': ['FD', '1', 'HorizontalPrismPower'],
        '0x0032': ['CS', '1', 'HorizontalPrismBase'],
        '0x0034': ['FD', '1', 'VerticalPrismPower'],
        '0x0036': ['CS', '1', 'VerticalPrismBase'],
        '0x0038': ['CS', '1', 'LensSegmentType'],
        '0x0040': ['FD', '1', 'OpticalTransmittance'],
        '0x0042': ['FD', '1', 'ChannelWidth'],
        '0x0044': ['FD', '1', 'PupilSize'],
        '0x0046': ['FD', '1', 'CornealSize'],
        '0x0050': ['SQ', '1', 'AutorefractionRightEyeSequence'],
        '0x0052': ['SQ', '1', 'AutorefractionLeftEyeSequence'],
        '0x0060': ['FD', '1', 'DistancePupillaryDistance'],
        '0x0062': ['FD', '1', 'NearPupillaryDistance'],
        '0x0063': ['FD', '1', 'IntermediatePupillaryDistance'],
        '0x0064': ['FD', '1', 'OtherPupillaryDistance'],
        '0x0070': ['SQ', '1', 'KeratometryRightEyeSequence'],
        '0x0071': ['SQ', '1', 'KeratometryLeftEyeSequence'],
        '0x0074': ['SQ', '1', 'SteepKeratometricAxisSequence'],
        '0x0075': ['FD', '1', 'RadiusOfCurvature'],
        '0x0076': ['FD', '1', 'KeratometricPower'],
        '0x0077': ['FD', '1', 'KeratometricAxis'],
        '0x0080': ['SQ', '1', 'FlatKeratometricAxisSequence'],
        '0x0092': ['CS', '1', 'BackgroundColor'],
        '0x0094': ['CS', '1', 'Optotype'],
        '0x0095': ['CS', '1', 'OptotypePresentation'],
        '0x0097': ['SQ', '1', 'SubjectiveRefractionRightEyeSequence'],
        '0x0098': ['SQ', '1', 'SubjectiveRefractionLeftEyeSequence'],
        '0x0100': ['SQ', '1', 'AddNearSequence'],
        '0x0101': ['SQ', '1', 'AddIntermediateSequence'],
        '0x0102': ['SQ', '1', 'AddOtherSequence'],
        '0x0104': ['FD', '1', 'AddPower'],
        '0x0106': ['FD', '1', 'ViewingDistance'],
        '0x0121': ['SQ', '1', 'VisualAcuityTypeCodeSequence'],
        '0x0122': ['SQ', '1', 'VisualAcuityRightEyeSequence'],
        '0x0123': ['SQ', '1', 'VisualAcuityLeftEyeSequence'],
        '0x0124': ['SQ', '1', 'VisualAcuityBothEyesOpenSequence'],
        '0x0125': ['CS', '1', 'ViewingDistanceType'],
        '0x0135': ['SS', '2', 'VisualAcuityModifiers'],
        '0x0137': ['FD', '1', 'DecimalVisualAcuity'],
        '0x0139': ['LO', '1', 'OptotypeDetailedDefinition'],
        '0x0145': ['SQ', '1', 'ReferencedRefractiveMeasurementsSequence'],
        '0x0146': ['FD', '1', 'SpherePower'],
        '0x0147': ['FD', '1', 'CylinderPower'],
        '0x0201': ['CS', '1', 'CornealTopographySurface'],
        '0x0202': ['FL', '2', 'CornealVertexLocation'],
        '0x0203': ['FL', '1', 'PupilCentroidXCoordinate'],
        '0x0204': ['FL', '1', 'PupilCentroidYCoordinate'],
        '0x0205': ['FL', '1', 'EquivalentPupilRadius'],
        '0x0207': ['SQ', '1', 'CornealTopographyMapTypeCodeSequence'],
        '0x0208': ['IS', '2-2n', 'VerticesOfTheOutlineOfPupil'],
        '0x0210': ['SQ', '1', 'CornealTopographyMappingNormalsSequence'],
        '0x0211': ['SQ', '1', 'MaximumCornealCurvatureSequence'],
        '0x0212': ['FL', '1', 'MaximumCornealCurvature'],
        '0x0213': ['FL', '2', 'MaximumCornealCurvatureLocation'],
        '0x0215': ['SQ', '1', 'MinimumKeratometricSequence'],
        '0x0218': ['SQ', '1', 'SimulatedKeratometricCylinderSequence'],
        '0x0220': ['FL', '1', 'AverageCornealPower'],
        '0x0224': ['FL', '1', 'CornealISValue'],
        '0x0227': ['FL', '1', 'AnalyzedArea'],
        '0x0230': ['FL', '1', 'SurfaceRegularityIndex'],
        '0x0232': ['FL', '1', 'SurfaceAsymmetryIndex'],
        '0x0234': ['FL', '1', 'CornealEccentricityIndex'],
        '0x0236': ['FL', '1', 'KeratoconusPredictionIndex'],
        '0x0238': ['FL', '1', 'DecimalPotentialVisualAcuity'],
        '0x0242': ['CS', '1', 'CornealTopographyMapQualityEvaluation'],
        '0x0244': ['SQ', '1', 'SourceImageCornealProcessedDataSequence'],
        '0x0247': ['FL', '3', 'CornealPointLocation'],
        '0x0248': ['CS', '1', 'CornealPointEstimated'],
        '0x0249': ['FL', '1', 'AxialPower'],
        '0x0250': ['FL', '1', 'TangentialPower'],
        '0x0251': ['FL', '1', 'RefractivePower'],
        '0x0252': ['FL', '1', 'RelativeElevation'],
        '0x0253': ['FL', '1', 'CornealWavefront'],
    },
    '0x0048': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0001': ['FL', '1', 'ImagedVolumeWidth'],
        '0x0002': ['FL', '1', 'ImagedVolumeHeight'],
        '0x0003': ['FL', '1', 'ImagedVolumeDepth'],
        '0x0006': ['UL', '1', 'TotalPixelMatrixColumns'],
        '0x0007': ['UL', '1', 'TotalPixelMatrixRows'],
        '0x0008': ['SQ', '1', 'TotalPixelMatrixOriginSequence'],
        '0x0010': ['CS', '1', 'SpecimenLabelInImage'],
        '0x0011': ['CS', '1', 'FocusMethod'],
        '0x0012': ['CS', '1', 'ExtendedDepthOfField'],
        '0x0013': ['US', '1', 'NumberOfFocalPlanes'],
        '0x0014': ['FL', '1', 'DistanceBetweenFocalPlanes'],
        '0x0015': ['US', '3', 'RecommendedAbsentPixelCIELabValue'],
        '0x0100': ['SQ', '1', 'IlluminatorTypeCodeSequence'],
        '0x0102': ['DS', '6', 'ImageOrientationSlide'],
        '0x0105': ['SQ', '1', 'OpticalPathSequence'],
        '0x0106': ['SH', '1', 'OpticalPathIdentifier'],
        '0x0107': ['ST', '1', 'OpticalPathDescription'],
        '0x0108': ['SQ', '1', 'IlluminationColorCodeSequence'],
        '0x0110': ['SQ', '1', 'SpecimenReferenceSequence'],
        '0x0111': ['DS', '1', 'CondenserLensPower'],
        '0x0112': ['DS', '1', 'ObjectiveLensPower'],
        '0x0113': ['DS', '1', 'ObjectiveLensNumericalAperture'],
        '0x0120': ['SQ', '1', 'PaletteColorLookupTableSequence'],
        '0x0200': ['SQ', '1', 'ReferencedImageNavigationSequence'],
        '0x0201': ['US', '2', 'TopLeftHandCornerOfLocalizerArea'],
        '0x0202': ['US', '2', 'BottomRightHandCornerOfLocalizerArea'],
        '0x0207': ['SQ', '1', 'OpticalPathIdentificationSequence'],
        '0x021A': ['SQ', '1', 'PlanePositionSlideSequence'],
        '0x021E': ['SL', '1', 'ColumnPositionInTotalImagePixelMatrix'],
        '0x021F': ['SL', '1', 'RowPositionInTotalImagePixelMatrix'],
        '0x0301': ['CS', '1', 'PixelOriginInterpretation'],
    },
    '0x0050': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0004': ['CS', '1', 'CalibrationImage'],
        '0x0010': ['SQ', '1', 'DeviceSequence'],
        '0x0012': ['SQ', '1', 'ContainerComponentTypeCodeSequence'],
        '0x0013': ['FD', '1', 'ContainerComponentThickness'],
        '0x0014': ['DS', '1', 'DeviceLength'],
        '0x0015': ['FD', '1', 'ContainerComponentWidth'],
        '0x0016': ['DS', '1', 'DeviceDiameter'],
        '0x0017': ['CS', '1', 'DeviceDiameterUnits'],
        '0x0018': ['DS', '1', 'DeviceVolume'],
        '0x0019': ['DS', '1', 'InterMarkerDistance'],
        '0x001A': ['CS', '1', 'ContainerComponentMaterial'],
        '0x001B': ['LO', '1', 'ContainerComponentID'],
        '0x001C': ['FD', '1', 'ContainerComponentLength'],
        '0x001D': ['FD', '1', 'ContainerComponentDiameter'],
        '0x001E': ['LO', '1', 'ContainerComponentDescription'],
        '0x0020': ['LO', '1', 'DeviceDescription'],
    },
    '0x0052': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0001': ['FL', '1', 'ContrastBolusIngredientPercentByVolume'],
        '0x0002': ['FD', '1', 'OCTFocalDistance'],
        '0x0003': ['FD', '1', 'BeamSpotSize'],
        '0x0004': ['FD', '1', 'EffectiveRefractiveIndex'],
        '0x0006': ['CS', '1', 'OCTAcquisitionDomain'],
        '0x0007': ['FD', '1', 'OCTOpticalCenterWavelength'],
        '0x0008': ['FD', '1', 'AxialResolution'],
        '0x0009': ['FD', '1', 'RangingDepth'],
        '0x0011': ['FD', '1', 'ALineRate'],
        '0x0012': ['US', '1', 'ALinesPerFrame'],
        '0x0013': ['FD', '1', 'CatheterRotationalRate'],
        '0x0014': ['FD', '1', 'ALinePixelSpacing'],
        '0x0016': ['SQ', '1', 'ModeOfPercutaneousAccessSequence'],
        '0x0025': ['SQ', '1', 'IntravascularOCTFrameTypeSequence'],
        '0x0026': ['CS', '1', 'OCTZOffsetApplied'],
        '0x0027': ['SQ', '1', 'IntravascularFrameContentSequence'],
        '0x0028': ['FD', '1', 'IntravascularLongitudinalDistance'],
        '0x0029': ['SQ', '1', 'IntravascularOCTFrameContentSequence'],
        '0x0030': ['SS', '1', 'OCTZOffsetCorrection'],
        '0x0031': ['CS', '1', 'CatheterDirectionOfRotation'],
        '0x0033': ['FD', '1', 'SeamLineLocation'],
        '0x0034': ['FD', '1', 'FirstALineLocation'],
        '0x0036': ['US', '1', 'SeamLineIndex'],
        '0x0038': ['US', '1', 'NumberOfPaddedALines'],
        '0x0039': ['CS', '1', 'InterpolationType'],
        '0x003A': ['CS', '1', 'RefractiveIndexApplied'],
    },
    '0x0054': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
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
        '0x0039': ['CS', '1', 'PhaseDescription'],
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
        '0x0222': ['SQ', '1', 'ViewModifierCodeSequence'],
        '0x0300': ['SQ', '1', 'RadionuclideCodeSequence'],
        '0x0302': ['SQ', '1', 'AdministrationRouteCodeSequence'],
        '0x0304': ['SQ', '1', 'RadiopharmaceuticalCodeSequence'],
        '0x0306': ['SQ', '1', 'CalibrationDataSequence'],
        '0x0308': ['US', '1', 'EnergyWindowNumber'],
        '0x0400': ['SH', '1', 'ImageID'],
        '0x0410': ['SQ', '1', 'PatientOrientationCodeSequence'],
        '0x0412': ['SQ', '1', 'PatientOrientationModifierCodeSequence'],
        '0x0414': ['SQ', '1', 'PatientGantryRelationshipCodeSequence'],
        '0x0500': ['CS', '1', 'SliceProgressionDirection'],
        '0x0501': ['CS', '1', 'ScanProgressionDirection'],
        '0x1000': ['CS', '2', 'SeriesType'],
        '0x1001': ['CS', '1', 'Units'],
        '0x1002': ['CS', '1', 'CountsSource'],
        '0x1004': ['CS', '1', 'ReprojectionMethod'],
        '0x1006': ['CS', '1', 'SUVType'],
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
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x3000': ['SQ', '1', 'HistogramSequence'],
        '0x3002': ['US', '1', 'HistogramNumberOfBins'],
        '0x3004': ['xs', '1', 'HistogramFirstBinValue'],
        '0x3006': ['xs', '1', 'HistogramLastBinValue'],
        '0x3008': ['US', '1', 'HistogramBinWidth'],
        '0x3010': ['LO', '1', 'HistogramExplanation'],
        '0x3020': ['UL', '1-n', 'HistogramData'],
    },
    '0x0062': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0001': ['CS', '1', 'SegmentationType'],
        '0x0002': ['SQ', '1', 'SegmentSequence'],
        '0x0003': ['SQ', '1', 'SegmentedPropertyCategoryCodeSequence'],
        '0x0004': ['US', '1', 'SegmentNumber'],
        '0x0005': ['LO', '1', 'SegmentLabel'],
        '0x0006': ['ST', '1', 'SegmentDescription'],
        '0x0008': ['CS', '1', 'SegmentAlgorithmType'],
        '0x0009': ['LO', '1', 'SegmentAlgorithmName'],
        '0x000A': ['SQ', '1', 'SegmentIdentificationSequence'],
        '0x000B': ['US', '1-n', 'ReferencedSegmentNumber'],
        '0x000C': ['US', '1', 'RecommendedDisplayGrayscaleValue'],
        '0x000D': ['US', '3', 'RecommendedDisplayCIELabValue'],
        '0x000E': ['US', '1', 'MaximumFractionalValue'],
        '0x000F': ['SQ', '1', 'SegmentedPropertyTypeCodeSequence'],
        '0x0010': ['CS', '1', 'SegmentationFractionalType'],
        '0x0011': ['SQ', '1', 'SegmentedPropertyTypeModifierCodeSequence'],
        '0x0012': ['SQ', '1', 'UsedSegmentsSequence'],
    },
    '0x0064': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0002': ['SQ', '1', 'DeformableRegistrationSequence'],
        '0x0003': ['UI', '1', 'SourceFrameOfReferenceUID'],
        '0x0005': ['SQ', '1', 'DeformableRegistrationGridSequence'],
        '0x0007': ['UL', '3', 'GridDimensions'],
        '0x0008': ['FD', '3', 'GridResolution'],
        '0x0009': ['OF', '1', 'VectorGridData'],
        '0x000F': ['SQ', '1', 'PreDeformationMatrixRegistrationSequence'],
        '0x0010': ['SQ', '1', 'PostDeformationMatrixRegistrationSequence'],
    },
    '0x0066': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0001': ['UL', '1', 'NumberOfSurfaces'],
        '0x0002': ['SQ', '1', 'SurfaceSequence'],
        '0x0003': ['UL', '1', 'SurfaceNumber'],
        '0x0004': ['LT', '1', 'SurfaceComments'],
        '0x0009': ['CS', '1', 'SurfaceProcessing'],
        '0x000A': ['FL', '1', 'SurfaceProcessingRatio'],
        '0x000B': ['LO', '1', 'SurfaceProcessingDescription'],
        '0x000C': ['FL', '1', 'RecommendedPresentationOpacity'],
        '0x000D': ['CS', '1', 'RecommendedPresentationType'],
        '0x000E': ['CS', '1', 'FiniteVolume'],
        '0x0010': ['CS', '1', 'Manifold'],
        '0x0011': ['SQ', '1', 'SurfacePointsSequence'],
        '0x0012': ['SQ', '1', 'SurfacePointsNormalsSequence'],
        '0x0013': ['SQ', '1', 'SurfaceMeshPrimitivesSequence'],
        '0x0015': ['UL', '1', 'NumberOfSurfacePoints'],
        '0x0016': ['OF', '1', 'PointCoordinatesData'],
        '0x0017': ['FL', '3', 'PointPositionAccuracy'],
        '0x0018': ['FL', '1', 'MeanPointDistance'],
        '0x0019': ['FL', '1', 'MaximumPointDistance'],
        '0x001A': ['FL', '6', 'PointsBoundingBoxCoordinates'],
        '0x001B': ['FL', '3', 'AxisOfRotation'],
        '0x001C': ['FL', '3', 'CenterOfRotation'],
        '0x001E': ['UL', '1', 'NumberOfVectors'],
        '0x001F': ['US', '1', 'VectorDimensionality'],
        '0x0020': ['FL', '1-n', 'VectorAccuracy'],
        '0x0021': ['OF', '1', 'VectorCoordinateData'],
        '0x0023': ['OW', '1', 'TrianglePointIndexList'],
        '0x0024': ['OW', '1', 'EdgePointIndexList'],
        '0x0025': ['OW', '1', 'VertexPointIndexList'],
        '0x0026': ['SQ', '1', 'TriangleStripSequence'],
        '0x0027': ['SQ', '1', 'TriangleFanSequence'],
        '0x0028': ['SQ', '1', 'LineSequence'],
        '0x0029': ['OW', '1', 'PrimitivePointIndexList'],
        '0x002A': ['UL', '1', 'SurfaceCount'],
        '0x002B': ['SQ', '1', 'ReferencedSurfaceSequence'],
        '0x002C': ['UL', '1', 'ReferencedSurfaceNumber'],
        '0x002D': ['SQ', '1', 'SegmentSurfaceGenerationAlgorithmIdentificationSequence'],
        '0x002E': ['SQ', '1', 'SegmentSurfaceSourceInstanceSequence'],
        '0x002F': ['SQ', '1', 'AlgorithmFamilyCodeSequence'],
        '0x0030': ['SQ', '1', 'AlgorithmNameCodeSequence'],
        '0x0031': ['LO', '1', 'AlgorithmVersion'],
        '0x0032': ['LT', '1', 'AlgorithmParameters'],
        '0x0034': ['SQ', '1', 'FacetSequence'],
        '0x0035': ['SQ', '1', 'SurfaceProcessingAlgorithmIdentificationSequence'],
        '0x0036': ['LO', '1', 'AlgorithmName'],
        '0x0037': ['FL', '1', 'RecommendedPointRadius'],
        '0x0038': ['FL', '1', 'RecommendedLineThickness'],
        '0x0040': ['UL', '1-n', 'LongPrimitivePointIndexList'],
        '0x0041': ['UL', '3-3n', 'LongTrianglePointIndexList'],
        '0x0042': ['UL', '2-2n', 'LongEdgePointIndexList'],
        '0x0043': ['UL', '1-n', 'LongVertexPointIndexList'],
    },
    '0x0068': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x6210': ['LO', '1', 'ImplantSize'],
        '0x6221': ['LO', '1', 'ImplantTemplateVersion'],
        '0x6222': ['SQ', '1', 'ReplacedImplantTemplateSequence'],
        '0x6223': ['CS', '1', 'ImplantType'],
        '0x6224': ['SQ', '1', 'DerivationImplantTemplateSequence'],
        '0x6225': ['SQ', '1', 'OriginalImplantTemplateSequence'],
        '0x6226': ['DT', '1', 'EffectiveDateTime'],
        '0x6230': ['SQ', '1', 'ImplantTargetAnatomySequence'],
        '0x6260': ['SQ', '1', 'InformationFromManufacturerSequence'],
        '0x6265': ['SQ', '1', 'NotificationFromManufacturerSequence'],
        '0x6270': ['DT', '1', 'InformationIssueDateTime'],
        '0x6280': ['ST', '1', 'InformationSummary'],
        '0x62A0': ['SQ', '1', 'ImplantRegulatoryDisapprovalCodeSequence'],
        '0x62A5': ['FD', '1', 'OverallTemplateSpatialTolerance'],
        '0x62C0': ['SQ', '1', 'HPGLDocumentSequence'],
        '0x62D0': ['US', '1', 'HPGLDocumentID'],
        '0x62D5': ['LO', '1', 'HPGLDocumentLabel'],
        '0x62E0': ['SQ', '1', 'ViewOrientationCodeSequence'],
        '0x62F0': ['FD', '9', 'ViewOrientationModifier'],
        '0x62F2': ['FD', '1', 'HPGLDocumentScaling'],
        '0x6300': ['OB', '1', 'HPGLDocument'],
        '0x6310': ['US', '1', 'HPGLContourPenNumber'],
        '0x6320': ['SQ', '1', 'HPGLPenSequence'],
        '0x6330': ['US', '1', 'HPGLPenNumber'],
        '0x6340': ['LO', '1', 'HPGLPenLabel'],
        '0x6345': ['ST', '1', 'HPGLPenDescription'],
        '0x6346': ['FD', '2', 'RecommendedRotationPoint'],
        '0x6347': ['FD', '4', 'BoundingRectangle'],
        '0x6350': ['US', '1-n', 'ImplantTemplate3DModelSurfaceNumber'],
        '0x6360': ['SQ', '1', 'SurfaceModelDescriptionSequence'],
        '0x6380': ['LO', '1', 'SurfaceModelLabel'],
        '0x6390': ['FD', '1', 'SurfaceModelScalingFactor'],
        '0x63A0': ['SQ', '1', 'MaterialsCodeSequence'],
        '0x63A4': ['SQ', '1', 'CoatingMaterialsCodeSequence'],
        '0x63A8': ['SQ', '1', 'ImplantTypeCodeSequence'],
        '0x63AC': ['SQ', '1', 'FixationMethodCodeSequence'],
        '0x63B0': ['SQ', '1', 'MatingFeatureSetsSequence'],
        '0x63C0': ['US', '1', 'MatingFeatureSetID'],
        '0x63D0': ['LO', '1', 'MatingFeatureSetLabel'],
        '0x63E0': ['SQ', '1', 'MatingFeatureSequence'],
        '0x63F0': ['US', '1', 'MatingFeatureID'],
        '0x6400': ['SQ', '1', 'MatingFeatureDegreeOfFreedomSequence'],
        '0x6410': ['US', '1', 'DegreeOfFreedomID'],
        '0x6420': ['CS', '1', 'DegreeOfFreedomType'],
        '0x6430': ['SQ', '1', 'TwoDMatingFeatureCoordinatesSequence'],
        '0x6440': ['US', '1', 'ReferencedHPGLDocumentID'],
        '0x6450': ['FD', '2', 'TwoDMatingPoint'],
        '0x6460': ['FD', '4', 'TwoDMatingAxes'],
        '0x6470': ['SQ', '1', 'TwoDDegreeOfFreedomSequence'],
        '0x6490': ['FD', '3', 'ThreeDDegreeOfFreedomAxis'],
        '0x64A0': ['FD', '2', 'RangeOfFreedom'],
        '0x64C0': ['FD', '3', 'ThreeDMatingPoint'],
        '0x64D0': ['FD', '9', 'ThreeDMatingAxes'],
        '0x64F0': ['FD', '3', 'TwoDDegreeOfFreedomAxis'],
        '0x6500': ['SQ', '1', 'PlanningLandmarkPointSequence'],
        '0x6510': ['SQ', '1', 'PlanningLandmarkLineSequence'],
        '0x6520': ['SQ', '1', 'PlanningLandmarkPlaneSequence'],
        '0x6530': ['US', '1', 'PlanningLandmarkID'],
        '0x6540': ['LO', '1', 'PlanningLandmarkDescription'],
        '0x6545': ['SQ', '1', 'PlanningLandmarkIdentificationCodeSequence'],
        '0x6550': ['SQ', '1', 'TwoDPointCoordinatesSequence'],
        '0x6560': ['FD', '2', 'TwoDPointCoordinates'],
        '0x6590': ['FD', '3', 'ThreeDPointCoordinates'],
        '0x65A0': ['SQ', '1', 'TwoDLineCoordinatesSequence'],
        '0x65B0': ['FD', '4', 'TwoDLineCoordinates'],
        '0x65D0': ['FD', '6', 'ThreeDLineCoordinates'],
        '0x65E0': ['SQ', '1', 'TwoDPlaneCoordinatesSequence'],
        '0x65F0': ['FD', '4', 'TwoDPlaneIntersection'],
        '0x6610': ['FD', '3', 'ThreeDPlaneOrigin'],
        '0x6620': ['FD', '3', 'ThreeDPlaneNormal'],
    },
    '0x0070': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
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
        '0x0040': ['IS', '1', 'ImageRotationRetired'],
        '0x0041': ['CS', '1', 'ImageHorizontalFlip'],
        '0x0042': ['US', '1', 'ImageRotation'],
        '0x0050': ['US', '2', 'DisplayedAreaTopLeftHandCornerTrial'],
        '0x0051': ['US', '2', 'DisplayedAreaBottomRightHandCornerTrial'],
        '0x0052': ['SL', '2', 'DisplayedAreaTopLeftHandCorner'],
        '0x0053': ['SL', '2', 'DisplayedAreaBottomRightHandCorner'],
        '0x005A': ['SQ', '1', 'DisplayedAreaSelectionSequence'],
        '0x0060': ['SQ', '1', 'GraphicLayerSequence'],
        '0x0062': ['IS', '1', 'GraphicLayerOrder'],
        '0x0066': ['US', '1', 'GraphicLayerRecommendedDisplayGrayscaleValue'],
        '0x0067': ['US', '3', 'GraphicLayerRecommendedDisplayRGBValue'],
        '0x0068': ['LO', '1', 'GraphicLayerDescription'],
        '0x0080': ['CS', '1', 'ContentLabel'],
        '0x0081': ['LO', '1', 'ContentDescription'],
        '0x0082': ['DA', '1', 'PresentationCreationDate'],
        '0x0083': ['TM', '1', 'PresentationCreationTime'],
        '0x0084': ['PN', '1', 'ContentCreatorName'],
        '0x0086': ['SQ', '1', 'ContentCreatorIdentificationCodeSequence'],
        '0x0087': ['SQ', '1', 'AlternateContentDescriptionSequence'],
        '0x0100': ['CS', '1', 'PresentationSizeMode'],
        '0x0101': ['DS', '2', 'PresentationPixelSpacing'],
        '0x0102': ['IS', '2', 'PresentationPixelAspectRatio'],
        '0x0103': ['FL', '1', 'PresentationPixelMagnificationRatio'],
        '0x0207': ['LO', '1', 'GraphicGroupLabel'],
        '0x0208': ['ST', '1', 'GraphicGroupDescription'],
        '0x0209': ['SQ', '1', 'CompoundGraphicSequence'],
        '0x0226': ['UL', '1', 'CompoundGraphicInstanceID'],
        '0x0227': ['LO', '1', 'FontName'],
        '0x0228': ['CS', '1', 'FontNameType'],
        '0x0229': ['LO', '1', 'CSSFontName'],
        '0x0230': ['FD', '1', 'RotationAngle'],
        '0x0231': ['SQ', '1', 'TextStyleSequence'],
        '0x0232': ['SQ', '1', 'LineStyleSequence'],
        '0x0233': ['SQ', '1', 'FillStyleSequence'],
        '0x0234': ['SQ', '1', 'GraphicGroupSequence'],
        '0x0241': ['US', '3', 'TextColorCIELabValue'],
        '0x0242': ['CS', '1', 'HorizontalAlignment'],
        '0x0243': ['CS', '1', 'VerticalAlignment'],
        '0x0244': ['CS', '1', 'ShadowStyle'],
        '0x0245': ['FL', '1', 'ShadowOffsetX'],
        '0x0246': ['FL', '1', 'ShadowOffsetY'],
        '0x0247': ['US', '3', 'ShadowColorCIELabValue'],
        '0x0248': ['CS', '1', 'Underlined'],
        '0x0249': ['CS', '1', 'Bold'],
        '0x0250': ['CS', '1', 'Italic'],
        '0x0251': ['US', '3', 'PatternOnColorCIELabValue'],
        '0x0252': ['US', '3', 'PatternOffColorCIELabValue'],
        '0x0253': ['FL', '1', 'LineThickness'],
        '0x0254': ['CS', '1', 'LineDashingStyle'],
        '0x0255': ['UL', '1', 'LinePattern'],
        '0x0256': ['OB', '1', 'FillPattern'],
        '0x0257': ['CS', '1', 'FillMode'],
        '0x0258': ['FL', '1', 'ShadowOpacity'],
        '0x0261': ['FL', '1', 'GapLength'],
        '0x0262': ['FL', '1', 'DiameterOfVisibility'],
        '0x0273': ['FL', '2', 'RotationPoint'],
        '0x0274': ['CS', '1', 'TickAlignment'],
        '0x0278': ['CS', '1', 'ShowTickLabel'],
        '0x0279': ['CS', '1', 'TickLabelAlignment'],
        '0x0282': ['CS', '1', 'CompoundGraphicUnits'],
        '0x0284': ['FL', '1', 'PatternOnOpacity'],
        '0x0285': ['FL', '1', 'PatternOffOpacity'],
        '0x0287': ['SQ', '1', 'MajorTicksSequence'],
        '0x0288': ['FL', '1', 'TickPosition'],
        '0x0289': ['SH', '1', 'TickLabel'],
        '0x0294': ['CS', '1', 'CompoundGraphicType'],
        '0x0295': ['UL', '1', 'GraphicGroupID'],
        '0x0306': ['CS', '1', 'ShapeType'],
        '0x0308': ['SQ', '1', 'RegistrationSequence'],
        '0x0309': ['SQ', '1', 'MatrixRegistrationSequence'],
        '0x030A': ['SQ', '1', 'MatrixSequence'],
        '0x030C': ['CS', '1', 'FrameOfReferenceTransformationMatrixType'],
        '0x030D': ['SQ', '1', 'RegistrationTypeCodeSequence'],
        '0x030F': ['ST', '1', 'FiducialDescription'],
        '0x0310': ['SH', '1', 'FiducialIdentifier'],
        '0x0311': ['SQ', '1', 'FiducialIdentifierCodeSequence'],
        '0x0312': ['FD', '1', 'ContourUncertaintyRadius'],
        '0x0314': ['SQ', '1', 'UsedFiducialsSequence'],
        '0x0318': ['SQ', '1', 'GraphicCoordinatesDataSequence'],
        '0x031A': ['UI', '1', 'FiducialUID'],
        '0x031C': ['SQ', '1', 'FiducialSetSequence'],
        '0x031E': ['SQ', '1', 'FiducialSequence'],
        '0x0401': ['US', '3', 'GraphicLayerRecommendedDisplayCIELabValue'],
        '0x0402': ['SQ', '1', 'BlendingSequence'],
        '0x0403': ['FL', '1', 'RelativeOpacity'],
        '0x0404': ['SQ', '1', 'ReferencedSpatialRegistrationSequence'],
        '0x0405': ['CS', '1', 'BlendingPosition'],
    },
    '0x0072': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0002': ['SH', '1', 'HangingProtocolName'],
        '0x0004': ['LO', '1', 'HangingProtocolDescription'],
        '0x0006': ['CS', '1', 'HangingProtocolLevel'],
        '0x0008': ['LO', '1', 'HangingProtocolCreator'],
        '0x000A': ['DT', '1', 'HangingProtocolCreationDateTime'],
        '0x000C': ['SQ', '1', 'HangingProtocolDefinitionSequence'],
        '0x000E': ['SQ', '1', 'HangingProtocolUserIdentificationCodeSequence'],
        '0x0010': ['LO', '1', 'HangingProtocolUserGroupName'],
        '0x0012': ['SQ', '1', 'SourceHangingProtocolSequence'],
        '0x0014': ['US', '1', 'NumberOfPriorsReferenced'],
        '0x0020': ['SQ', '1', 'ImageSetsSequence'],
        '0x0022': ['SQ', '1', 'ImageSetSelectorSequence'],
        '0x0024': ['CS', '1', 'ImageSetSelectorUsageFlag'],
        '0x0026': ['AT', '1', 'SelectorAttribute'],
        '0x0028': ['US', '1', 'SelectorValueNumber'],
        '0x0030': ['SQ', '1', 'TimeBasedImageSetsSequence'],
        '0x0032': ['US', '1', 'ImageSetNumber'],
        '0x0034': ['CS', '1', 'ImageSetSelectorCategory'],
        '0x0038': ['US', '2', 'RelativeTime'],
        '0x003A': ['CS', '1', 'RelativeTimeUnits'],
        '0x003C': ['SS', '2', 'AbstractPriorValue'],
        '0x003E': ['SQ', '1', 'AbstractPriorCodeSequence'],
        '0x0040': ['LO', '1', 'ImageSetLabel'],
        '0x0050': ['CS', '1', 'SelectorAttributeVR'],
        '0x0052': ['AT', '1-n', 'SelectorSequencePointer'],
        '0x0054': ['LO', '1-n', 'SelectorSequencePointerPrivateCreator'],
        '0x0056': ['LO', '1', 'SelectorAttributePrivateCreator'],
        '0x0060': ['AT', '1-n', 'SelectorATValue'],
        '0x0062': ['CS', '1-n', 'SelectorCSValue'],
        '0x0064': ['IS', '1-n', 'SelectorISValue'],
        '0x0066': ['LO', '1-n', 'SelectorLOValue'],
        '0x0068': ['LT', '1', 'SelectorLTValue'],
        '0x006A': ['PN', '1-n', 'SelectorPNValue'],
        '0x006C': ['SH', '1-n', 'SelectorSHValue'],
        '0x006E': ['ST', '1', 'SelectorSTValue'],
        '0x0070': ['UT', '1', 'SelectorUTValue'],
        '0x0072': ['DS', '1-n', 'SelectorDSValue'],
        '0x0074': ['FD', '1-n', 'SelectorFDValue'],
        '0x0076': ['FL', '1-n', 'SelectorFLValue'],
        '0x0078': ['UL', '1-n', 'SelectorULValue'],
        '0x007A': ['US', '1-n', 'SelectorUSValue'],
        '0x007C': ['SL', '1-n', 'SelectorSLValue'],
        '0x007E': ['SS', '1-n', 'SelectorSSValue'],
        '0x007F': ['UI', '1-n', 'SelectorUIValue'],
        '0x0080': ['SQ', '1', 'SelectorCodeSequenceValue'],
        '0x0100': ['US', '1', 'NumberOfScreens'],
        '0x0102': ['SQ', '1', 'NominalScreenDefinitionSequence'],
        '0x0104': ['US', '1', 'NumberOfVerticalPixels'],
        '0x0106': ['US', '1', 'NumberOfHorizontalPixels'],
        '0x0108': ['FD', '4', 'DisplayEnvironmentSpatialPosition'],
        '0x010A': ['US', '1', 'ScreenMinimumGrayscaleBitDepth'],
        '0x010C': ['US', '1', 'ScreenMinimumColorBitDepth'],
        '0x010E': ['US', '1', 'ApplicationMaximumRepaintTime'],
        '0x0200': ['SQ', '1', 'DisplaySetsSequence'],
        '0x0202': ['US', '1', 'DisplaySetNumber'],
        '0x0203': ['LO', '1', 'DisplaySetLabel'],
        '0x0204': ['US', '1', 'DisplaySetPresentationGroup'],
        '0x0206': ['LO', '1', 'DisplaySetPresentationGroupDescription'],
        '0x0208': ['CS', '1', 'PartialDataDisplayHandling'],
        '0x0210': ['SQ', '1', 'SynchronizedScrollingSequence'],
        '0x0212': ['US', '2-n', 'DisplaySetScrollingGroup'],
        '0x0214': ['SQ', '1', 'NavigationIndicatorSequence'],
        '0x0216': ['US', '1', 'NavigationDisplaySet'],
        '0x0218': ['US', '1-n', 'ReferenceDisplaySets'],
        '0x0300': ['SQ', '1', 'ImageBoxesSequence'],
        '0x0302': ['US', '1', 'ImageBoxNumber'],
        '0x0304': ['CS', '1', 'ImageBoxLayoutType'],
        '0x0306': ['US', '1', 'ImageBoxTileHorizontalDimension'],
        '0x0308': ['US', '1', 'ImageBoxTileVerticalDimension'],
        '0x0310': ['CS', '1', 'ImageBoxScrollDirection'],
        '0x0312': ['CS', '1', 'ImageBoxSmallScrollType'],
        '0x0314': ['US', '1', 'ImageBoxSmallScrollAmount'],
        '0x0316': ['CS', '1', 'ImageBoxLargeScrollType'],
        '0x0318': ['US', '1', 'ImageBoxLargeScrollAmount'],
        '0x0320': ['US', '1', 'ImageBoxOverlapPriority'],
        '0x0330': ['FD', '1', 'CineRelativeToRealTime'],
        '0x0400': ['SQ', '1', 'FilterOperationsSequence'],
        '0x0402': ['CS', '1', 'FilterByCategory'],
        '0x0404': ['CS', '1', 'FilterByAttributePresence'],
        '0x0406': ['CS', '1', 'FilterByOperator'],
        '0x0420': ['US', '3', 'StructuredDisplayBackgroundCIELabValue'],
        '0x0421': ['US', '3', 'EmptyImageBoxCIELabValue'],
        '0x0422': ['SQ', '1', 'StructuredDisplayImageBoxSequence'],
        '0x0424': ['SQ', '1', 'StructuredDisplayTextBoxSequence'],
        '0x0427': ['SQ', '1', 'ReferencedFirstFrameSequence'],
        '0x0430': ['SQ', '1', 'ImageBoxSynchronizationSequence'],
        '0x0432': ['US', '2-n', 'SynchronizedImageBoxList'],
        '0x0434': ['CS', '1', 'TypeOfSynchronization'],
        '0x0500': ['CS', '1', 'BlendingOperationType'],
        '0x0510': ['CS', '1', 'ReformattingOperationType'],
        '0x0512': ['FD', '1', 'ReformattingThickness'],
        '0x0514': ['FD', '1', 'ReformattingInterval'],
        '0x0516': ['CS', '1', 'ReformattingOperationInitialViewDirection'],
        '0x0520': ['CS', '1-n', 'ThreeDRenderingType'],
        '0x0600': ['SQ', '1', 'SortingOperationsSequence'],
        '0x0602': ['CS', '1', 'SortByCategory'],
        '0x0604': ['CS', '1', 'SortingDirection'],
        '0x0700': ['CS', '2', 'DisplaySetPatientOrientation'],
        '0x0702': ['CS', '1', 'VOIType'],
        '0x0704': ['CS', '1', 'PseudoColorType'],
        '0x0705': ['SQ', '1', 'PseudoColorPaletteInstanceReferenceSequence'],
        '0x0706': ['CS', '1', 'ShowGrayscaleInverted'],
        '0x0710': ['CS', '1', 'ShowImageTrueSizeFlag'],
        '0x0712': ['CS', '1', 'ShowGraphicAnnotationFlag'],
        '0x0714': ['CS', '1', 'ShowPatientDemographicsFlag'],
        '0x0716': ['CS', '1', 'ShowAcquisitionTechniquesFlag'],
        '0x0717': ['CS', '1', 'DisplaySetHorizontalJustification'],
        '0x0718': ['CS', '1', 'DisplaySetVerticalJustification'],
    },
    '0x0074': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0120': ['FD', '1', 'ContinuationStartMeterset'],
        '0x0121': ['FD', '1', 'ContinuationEndMeterset'],
        '0x1000': ['CS', '1', 'ProcedureStepState'],
        '0x1002': ['SQ', '1', 'ProcedureStepProgressInformationSequence'],
        '0x1004': ['DS', '1', 'ProcedureStepProgress'],
        '0x1006': ['ST', '1', 'ProcedureStepProgressDescription'],
        '0x1008': ['SQ', '1', 'ProcedureStepCommunicationsURISequence'],
        '0x100A': ['UR', '1', 'ContactURI'],
        '0x100C': ['LO', '1', 'ContactDisplayName'],
        '0x100E': ['SQ', '1', 'ProcedureStepDiscontinuationReasonCodeSequence'],
        '0x1020': ['SQ', '1', 'BeamTaskSequence'],
        '0x1022': ['CS', '1', 'BeamTaskType'],
        '0x1024': ['IS', '1', 'BeamOrderIndexTrial'],
        '0x1025': ['CS', '1', 'AutosequenceFlag'],
        '0x1026': ['FD', '1', 'TableTopVerticalAdjustedPosition'],
        '0x1027': ['FD', '1', 'TableTopLongitudinalAdjustedPosition'],
        '0x1028': ['FD', '1', 'TableTopLateralAdjustedPosition'],
        '0x102A': ['FD', '1', 'PatientSupportAdjustedAngle'],
        '0x102B': ['FD', '1', 'TableTopEccentricAdjustedAngle'],
        '0x102C': ['FD', '1', 'TableTopPitchAdjustedAngle'],
        '0x102D': ['FD', '1', 'TableTopRollAdjustedAngle'],
        '0x1030': ['SQ', '1', 'DeliveryVerificationImageSequence'],
        '0x1032': ['CS', '1', 'VerificationImageTiming'],
        '0x1034': ['CS', '1', 'DoubleExposureFlag'],
        '0x1036': ['CS', '1', 'DoubleExposureOrdering'],
        '0x1038': ['DS', '1', 'DoubleExposureMetersetTrial'],
        '0x103A': ['DS', '4', 'DoubleExposureFieldDeltaTrial'],
        '0x1040': ['SQ', '1', 'RelatedReferenceRTImageSequence'],
        '0x1042': ['SQ', '1', 'GeneralMachineVerificationSequence'],
        '0x1044': ['SQ', '1', 'ConventionalMachineVerificationSequence'],
        '0x1046': ['SQ', '1', 'IonMachineVerificationSequence'],
        '0x1048': ['SQ', '1', 'FailedAttributesSequence'],
        '0x104A': ['SQ', '1', 'OverriddenAttributesSequence'],
        '0x104C': ['SQ', '1', 'ConventionalControlPointVerificationSequence'],
        '0x104E': ['SQ', '1', 'IonControlPointVerificationSequence'],
        '0x1050': ['SQ', '1', 'AttributeOccurrenceSequence'],
        '0x1052': ['AT', '1', 'AttributeOccurrencePointer'],
        '0x1054': ['UL', '1', 'AttributeItemSelector'],
        '0x1056': ['LO', '1', 'AttributeOccurrencePrivateCreator'],
        '0x1057': ['IS', '1-n', 'SelectorSequencePointerItems'],
        '0x1200': ['CS', '1', 'ScheduledProcedureStepPriority'],
        '0x1202': ['LO', '1', 'WorklistLabel'],
        '0x1204': ['LO', '1', 'ProcedureStepLabel'],
        '0x1210': ['SQ', '1', 'ScheduledProcessingParametersSequence'],
        '0x1212': ['SQ', '1', 'PerformedProcessingParametersSequence'],
        '0x1216': ['SQ', '1', 'UnifiedProcedureStepPerformedProcedureSequence'],
        '0x1220': ['SQ', '1', 'RelatedProcedureStepSequence'],
        '0x1222': ['LO', '1', 'ProcedureStepRelationshipType'],
        '0x1224': ['SQ', '1', 'ReplacedProcedureStepSequence'],
        '0x1230': ['LO', '1', 'DeletionLock'],
        '0x1234': ['AE', '1', 'ReceivingAE'],
        '0x1236': ['AE', '1', 'RequestingAE'],
        '0x1238': ['LT', '1', 'ReasonForCancellation'],
        '0x1242': ['CS', '1', 'SCPStatus'],
        '0x1244': ['CS', '1', 'SubscriptionListStatus'],
        '0x1246': ['CS', '1', 'UnifiedProcedureStepListStatus'],
        '0x1324': ['UL', '1', 'BeamOrderIndex'],
        '0x1338': ['FD', '1', 'DoubleExposureMeterset'],
        '0x133A': ['FD', '4', 'DoubleExposureFieldDelta'],
    },
    '0x0076': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0001': ['LO', '1', 'ImplantAssemblyTemplateName'],
        '0x0003': ['LO', '1', 'ImplantAssemblyTemplateIssuer'],
        '0x0006': ['LO', '1', 'ImplantAssemblyTemplateVersion'],
        '0x0008': ['SQ', '1', 'ReplacedImplantAssemblyTemplateSequence'],
        '0x000A': ['CS', '1', 'ImplantAssemblyTemplateType'],
        '0x000C': ['SQ', '1', 'OriginalImplantAssemblyTemplateSequence'],
        '0x000E': ['SQ', '1', 'DerivationImplantAssemblyTemplateSequence'],
        '0x0010': ['SQ', '1', 'ImplantAssemblyTemplateTargetAnatomySequence'],
        '0x0020': ['SQ', '1', 'ProcedureTypeCodeSequence'],
        '0x0030': ['LO', '1', 'SurgicalTechnique'],
        '0x0032': ['SQ', '1', 'ComponentTypesSequence'],
        '0x0034': ['CS', '1', 'ComponentTypeCodeSequence'],
        '0x0036': ['CS', '1', 'ExclusiveComponentType'],
        '0x0038': ['CS', '1', 'MandatoryComponentType'],
        '0x0040': ['SQ', '1', 'ComponentSequence'],
        '0x0055': ['US', '1', 'ComponentID'],
        '0x0060': ['SQ', '1', 'ComponentAssemblySequence'],
        '0x0070': ['US', '1', 'Component1ReferencedID'],
        '0x0080': ['US', '1', 'Component1ReferencedMatingFeatureSetID'],
        '0x0090': ['US', '1', 'Component1ReferencedMatingFeatureID'],
        '0x00A0': ['US', '1', 'Component2ReferencedID'],
        '0x00B0': ['US', '1', 'Component2ReferencedMatingFeatureSetID'],
        '0x00C0': ['US', '1', 'Component2ReferencedMatingFeatureID'],
    },
    '0x0078': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0001': ['LO', '1', 'ImplantTemplateGroupName'],
        '0x0010': ['ST', '1', 'ImplantTemplateGroupDescription'],
        '0x0020': ['LO', '1', 'ImplantTemplateGroupIssuer'],
        '0x0024': ['LO', '1', 'ImplantTemplateGroupVersion'],
        '0x0026': ['SQ', '1', 'ReplacedImplantTemplateGroupSequence'],
        '0x0028': ['SQ', '1', 'ImplantTemplateGroupTargetAnatomySequence'],
        '0x002A': ['SQ', '1', 'ImplantTemplateGroupMembersSequence'],
        '0x002E': ['US', '1', 'ImplantTemplateGroupMemberID'],
        '0x0050': ['FD', '3', 'ThreeDImplantTemplateGroupMemberMatchingPoint'],
        '0x0060': ['FD', '9', 'ThreeDImplantTemplateGroupMemberMatchingAxes'],
        '0x0070': ['SQ', '1', 'ImplantTemplateGroupMemberMatching2DCoordinatesSequence'],
        '0x0090': ['FD', '2', 'TwoDImplantTemplateGroupMemberMatchingPoint'],
        '0x00A0': ['FD', '4', 'TwoDImplantTemplateGroupMemberMatchingAxes'],
        '0x00B0': ['SQ', '1', 'ImplantTemplateGroupVariationDimensionSequence'],
        '0x00B2': ['LO', '1', 'ImplantTemplateGroupVariationDimensionName'],
        '0x00B4': ['SQ', '1', 'ImplantTemplateGroupVariationDimensionRankSequence'],
        '0x00B6': ['US', '1', 'ReferencedImplantTemplateGroupMemberID'],
        '0x00B8': ['US', '1', 'ImplantTemplateGroupVariationDimensionRank'],
    },
    '0x0080': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0001': ['SQ', '1', 'SurfaceScanAcquisitionTypeCodeSequence'],
        '0x0002': ['SQ', '1', 'SurfaceScanModeCodeSequence'],
        '0x0003': ['SQ', '1', 'RegistrationMethodCodeSequence'],
        '0x0004': ['FD', '1', 'ShotDurationTime'],
        '0x0005': ['FD', '1', 'ShotOffsetTime'],
        '0x0006': ['US', '1-n', 'SurfacePointPresentationValueData'],
        '0x0007': ['US', '3-3n', 'SurfacePointColorCIELabValueData'],
        '0x0008': ['SQ', '1', 'UVMappingSequence'],
        '0x0009': ['SH', '1', 'TextureLabel'],
        '0x0010': ['OF', '1-n', 'UValueData'],
        '0x0011': ['OF', '1-n', 'VValueData'],
        '0x0012': ['SQ', '1', 'ReferencedTextureSequence'],
        '0x0013': ['SQ', '1', 'ReferencedSurfaceDataSequence'],
    },
    '0x0088': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0130': ['SH', '1', 'StorageMediaFileSetID'],
        '0x0140': ['UI', '1', 'StorageMediaFileSetUID'],
        '0x0200': ['SQ', '1', 'IconImageSequence'],
        '0x0904': ['LO', '1', 'TopicTitle'],
        '0x0906': ['ST', '1', 'TopicSubject'],
        '0x0910': ['LO', '1', 'TopicAuthor'],
        '0x0912': ['LO', '1-32', 'TopicKeywords'],
    },
    '0x0100': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0410': ['CS', '1', 'SOPInstanceStatus'],
        '0x0420': ['DT', '1', 'SOPAuthorizationDateTime'],
        '0x0424': ['LT', '1', 'SOPAuthorizationComment'],
        '0x0426': ['LO', '1', 'AuthorizationEquipmentCertificationNumber'],
    },
    '0x0400': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0005': ['US', '1', 'MACIDNumber'],
        '0x0010': ['UI', '1', 'MACCalculationTransferSyntaxUID'],
        '0x0015': ['CS', '1', 'MACAlgorithm'],
        '0x0020': ['AT', '1-n', 'DataElementsSigned'],
        '0x0100': ['UI', '1', 'DigitalSignatureUID'],
        '0x0105': ['DT', '1', 'DigitalSignatureDateTime'],
        '0x0110': ['CS', '1', 'CertificateType'],
        '0x0115': ['OB', '1', 'CertificateOfSigner'],
        '0x0120': ['OB', '1', 'Signature'],
        '0x0305': ['CS', '1', 'CertifiedTimestampType'],
        '0x0310': ['OB', '1', 'CertifiedTimestamp'],
        '0x0401': ['SQ', '1', 'DigitalSignaturePurposeCodeSequence'],
        '0x0402': ['SQ', '1', 'ReferencedDigitalSignatureSequence'],
        '0x0403': ['SQ', '1', 'ReferencedSOPInstanceMACSequence'],
        '0x0404': ['OB', '1', 'MAC'],
        '0x0500': ['SQ', '1', 'EncryptedAttributesSequence'],
        '0x0510': ['UI', '1', 'EncryptedContentTransferSyntaxUID'],
        '0x0520': ['OB', '1', 'EncryptedContent'],
        '0x0550': ['SQ', '1', 'ModifiedAttributesSequence'],
        '0x0561': ['SQ', '1', 'OriginalAttributesSequence'],
        '0x0562': ['DT', '1', 'AttributeModificationDateTime'],
        '0x0563': ['LO', '1', 'ModifyingSystem'],
        '0x0564': ['LO', '1', 'SourceOfPreviousValues'],
        '0x0565': ['CS', '1', 'ReasonForTheAttributeModification'],
    },
    '0x1000': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0010': ['US', '3', 'EscapeTriplet'],
        '0x0011': ['US', '3', 'RunLengthTriplet'],
        '0x0012': ['US', '1', 'HuffmanTableSize'],
        '0x0013': ['US', '3', 'HuffmanTableTriplet'],
        '0x0014': ['US', '1', 'ShiftTableSize'],
        '0x0015': ['US', '3', 'ShiftTableTriplet'],
    },
    '0x1010': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0004': ['US', '1-n', 'ZonalMap'],
    },
    '0x2000': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
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
        '0x0000': ['UL', '1', 'GenericGroupLength'],
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
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0010': ['US', '1', 'ImageBoxPosition'],
        '0x0020': ['CS', '1', 'Polarity'],
        '0x0030': ['DS', '1', 'RequestedImageSize'],
        '0x0040': ['CS', '1', 'RequestedDecimateCropBehavior'],
        '0x0050': ['CS', '1', 'RequestedResolutionID'],
        '0x00A0': ['CS', '1', 'RequestedImageSizeFlag'],
        '0x00A2': ['CS', '1', 'DecimateCropResult'],
        '0x0110': ['SQ', '1', 'BasicGrayscaleImageSequence'],
        '0x0111': ['SQ', '1', 'BasicColorImageSequence'],
        '0x0130': ['SQ', '1', 'ReferencedImageOverlayBoxSequence'],
        '0x0140': ['SQ', '1', 'ReferencedVOILUTBoxSequence'],
    },
    '0x2030': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0010': ['US', '1', 'AnnotationPosition'],
        '0x0020': ['LO', '1', 'TextString'],
    },
    '0x2040': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0010': ['SQ', '1', 'ReferencedOverlayPlaneSequence'],
        '0x0011': ['US', '1-99', 'ReferencedOverlayPlaneGroups'],
        '0x0020': ['SQ', '1', 'OverlayPixelDataSequence'],
        '0x0060': ['CS', '1', 'OverlayMagnificationType'],
        '0x0070': ['CS', '1', 'OverlaySmoothingType'],
        '0x0072': ['CS', '1', 'OverlayOrImageMagnification'],
        '0x0074': ['US', '1', 'MagnifyToNumberOfColumns'],
        '0x0080': ['CS', '1', 'OverlayForegroundDensity'],
        '0x0082': ['CS', '1', 'OverlayBackgroundDensity'],
        '0x0090': ['CS', '1', 'OverlayMode'],
        '0x0100': ['CS', '1', 'ThresholdDensity'],
        '0x0500': ['SQ', '1', 'ReferencedImageBoxSequenceRetired'],
    },
    '0x2050': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0010': ['SQ', '1', 'PresentationLUTSequence'],
        '0x0020': ['CS', '1', 'PresentationLUTShape'],
        '0x0500': ['SQ', '1', 'ReferencedPresentationLUTSequence'],
    },
    '0x2100': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0010': ['SH', '1', 'PrintJobID'],
        '0x0020': ['CS', '1', 'ExecutionStatus'],
        '0x0030': ['CS', '1', 'ExecutionStatusInfo'],
        '0x0040': ['DA', '1', 'CreationDate'],
        '0x0050': ['TM', '1', 'CreationTime'],
        '0x0070': ['AE', '1', 'Originator'],
        '0x0140': ['AE', '1', 'DestinationAE'],
        '0x0160': ['SH', '1', 'OwnerID'],
        '0x0170': ['IS', '1', 'NumberOfFilms'],
        '0x0500': ['SQ', '1', 'ReferencedPrintJobSequencePullStoredPrint'],
    },
    '0x2110': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0010': ['CS', '1', 'PrinterStatus'],
        '0x0020': ['CS', '1', 'PrinterStatusInfo'],
        '0x0030': ['LO', '1', 'PrinterName'],
        '0x0099': ['SH', '1', 'PrintQueueID'],
    },
    '0x2120': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0010': ['CS', '1', 'QueueStatus'],
        '0x0050': ['SQ', '1', 'PrintJobDescriptionSequence'],
        '0x0070': ['SQ', '1', 'ReferencedPrintJobSequence'],
    },
    '0x2130': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
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
    '0x2200': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0001': ['CS', '1', 'LabelUsingInformationExtractedFromInstances'],
        '0x0002': ['UT', '1', 'LabelText'],
        '0x0003': ['CS', '1', 'LabelStyleSelection'],
        '0x0004': ['LT', '1', 'MediaDisposition'],
        '0x0005': ['LT', '1', 'BarcodeValue'],
        '0x0006': ['CS', '1', 'BarcodeSymbology'],
        '0x0007': ['CS', '1', 'AllowMediaSplitting'],
        '0x0008': ['CS', '1', 'IncludeNonDICOMObjects'],
        '0x0009': ['CS', '1', 'IncludeDisplayApplication'],
        '0x000A': ['CS', '1', 'PreserveCompositeInstancesAfterMediaCreation'],
        '0x000B': ['US', '1', 'TotalNumberOfPiecesOfMediaCreated'],
        '0x000C': ['LO', '1', 'RequestedMediaApplicationProfile'],
        '0x000D': ['SQ', '1', 'ReferencedStorageMediaSequence'],
        '0x000E': ['AT', '1-n', 'FailureAttributes'],
        '0x000F': ['CS', '1', 'AllowLossyCompression'],
        '0x0020': ['CS', '1', 'RequestPriority'],
    },
    '0x3002': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
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
        '0x0040': ['SQ', '1', 'FluenceMapSequence'],
        '0x0041': ['CS', '1', 'FluenceDataSource'],
        '0x0042': ['DS', '1', 'FluenceDataScale'],
        '0x0050': ['SQ', '1', 'PrimaryFluenceModeSequence'],
        '0x0051': ['CS', '1', 'FluenceMode'],
        '0x0052': ['SH', '1', 'FluenceModeID'],
    },
    '0x3004': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0001': ['CS', '1', 'DVHType'],
        '0x0002': ['CS', '1', 'DoseUnits'],
        '0x0004': ['CS', '1', 'DoseType'],
        '0x0005': ['CS', '1', 'SpatialTransformOfDose'],
        '0x0006': ['LO', '1', 'DoseComment'],
        '0x0008': ['DS', '3', 'NormalizationPoint'],
        '0x000A': ['CS', '1', 'DoseSummationType'],
        '0x000C': ['DS', '2-n', 'GridFrameOffsetVector'],
        '0x000E': ['DS', '1', 'DoseGridScaling'],
        '0x0010': ['SQ', '1', 'RTDoseROISequence'],
        '0x0012': ['DS', '1', 'DoseValue'],
        '0x0014': ['CS', '1-3', 'TissueHeterogeneityCorrection'],
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
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0002': ['SH', '1', 'StructureSetLabel'],
        '0x0004': ['LO', '1', 'StructureSetName'],
        '0x0006': ['ST', '1', 'StructureSetDescription'],
        '0x0008': ['DA', '1', 'StructureSetDate'],
        '0x0009': ['TM', '1', 'StructureSetTime'],
        '0x0010': ['SQ', '1', 'ReferencedFrameOfReferenceSequence'],
        '0x0012': ['SQ', '1', 'RTReferencedStudySequence'],
        '0x0014': ['SQ', '1', 'RTReferencedSeriesSequence'],
        '0x0016': ['SQ', '1', 'ContourImageSequence'],
        '0x0018': ['SQ', '1', 'PredecessorStructureSetSequence'],
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
        '0x00B6': ['SQ', '1', 'ROIElementalCompositionSequence'],
        '0x00B7': ['US', '1', 'ROIElementalCompositionAtomicNumber'],
        '0x00B8': ['FL', '1', 'ROIElementalCompositionAtomicMassFraction'],
        '0x00B9': ['SQ', '1', 'AdditionalRTROIIdentificationCodeSequence'],
        '0x00C0': ['SQ', '1', 'FrameOfReferenceRelationshipSequence'],
        '0x00C2': ['UI', '1', 'RelatedFrameOfReferenceUID'],
        '0x00C4': ['CS', '1', 'FrameOfReferenceTransformationType'],
        '0x00C6': ['DS', '16', 'FrameOfReferenceTransformationMatrix'],
        '0x00C8': ['LO', '1', 'FrameOfReferenceTransformationComment'],
    },
    '0x3008': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0010': ['SQ', '1', 'MeasuredDoseReferenceSequence'],
        '0x0012': ['ST', '1', 'MeasuredDoseDescription'],
        '0x0014': ['CS', '1', 'MeasuredDoseType'],
        '0x0016': ['DS', '1', 'MeasuredDoseValue'],
        '0x0020': ['SQ', '1', 'TreatmentSessionBeamSequence'],
        '0x0021': ['SQ', '1', 'TreatmentSessionIonBeamSequence'],
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
        '0x0041': ['SQ', '1', 'IonControlPointDeliverySequence'],
        '0x0042': ['DS', '1', 'SpecifiedMeterset'],
        '0x0044': ['DS', '1', 'DeliveredMeterset'],
        '0x0045': ['FL', '1', 'MetersetRateSet'],
        '0x0046': ['FL', '1', 'MetersetRateDelivered'],
        '0x0047': ['FL', '1-n', 'ScanSpotMetersetsDelivered'],
        '0x0048': ['DS', '1', 'DoseRateDelivered'],
        '0x0050': ['SQ', '1', 'TreatmentSummaryCalculatedDoseReferenceSequence'],
        '0x0052': ['DS', '1', 'CumulativeDoseToDoseReference'],
        '0x0054': ['DA', '1', 'FirstTreatmentDate'],
        '0x0056': ['DA', '1', 'MostRecentTreatmentDate'],
        '0x005A': ['IS', '1', 'NumberOfFractionsDelivered'],
        '0x0060': ['SQ', '1', 'OverrideSequence'],
        '0x0061': ['AT', '1', 'ParameterSequencePointer'],
        '0x0062': ['AT', '1', 'OverrideParameterPointer'],
        '0x0063': ['IS', '1', 'ParameterItemIndex'],
        '0x0064': ['IS', '1', 'MeasuredDoseReferenceNumber'],
        '0x0065': ['AT', '1', 'ParameterPointer'],
        '0x0066': ['ST', '1', 'OverrideReason'],
        '0x0068': ['SQ', '1', 'CorrectedParameterSequence'],
        '0x006A': ['FL', '1', 'CorrectionValue'],
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
        '0x00F0': ['SQ', '1', 'RecordedSnoutSequence'],
        '0x00F2': ['SQ', '1', 'RecordedRangeShifterSequence'],
        '0x00F4': ['SQ', '1', 'RecordedLateralSpreadingDeviceSequence'],
        '0x00F6': ['SQ', '1', 'RecordedRangeModulatorSequence'],
        '0x0100': ['SQ', '1', 'RecordedSourceSequence'],
        '0x0105': ['LO', '1', 'SourceSerialNumber'],
        '0x0110': ['SQ', '1', 'TreatmentSessionApplicationSetupSequence'],
        '0x0116': ['CS', '1', 'ApplicationSetupCheck'],
        '0x0120': ['SQ', '1', 'RecordedBrachyAccessoryDeviceSequence'],
        '0x0122': ['IS', '1', 'ReferencedBrachyAccessoryDeviceNumber'],
        '0x0130': ['SQ', '1', 'RecordedChannelSequence'],
        '0x0132': ['DS', '1', 'SpecifiedChannelTotalTime'],
        '0x0134': ['DS', '1', 'DeliveredChannelTotalTime'],
        '0x0136': ['IS', '1', 'SpecifiedNumberOfPulses'],
        '0x0138': ['IS', '1', 'DeliveredNumberOfPulses'],
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
        '0x0171': ['SQ', '1', 'PulseSpecificBrachyControlPointDeliveredSequence'],
        '0x0172': ['US', '1', 'PulseNumber'],
        '0x0173': ['SQ', '1', 'BrachyPulseControlPointDeliveredSequence'],
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
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0002': ['SH', '1', 'RTPlanLabel'],
        '0x0003': ['LO', '1', 'RTPlanName'],
        '0x0004': ['ST', '1', 'RTPlanDescription'],
        '0x0006': ['DA', '1', 'RTPlanDate'],
        '0x0007': ['TM', '1', 'RTPlanTime'],
        '0x0009': ['LO', '1-n', 'TreatmentProtocols'],
        '0x000A': ['CS', '1', 'PlanIntent'],
        '0x000B': ['LO', '1-n', 'TreatmentSites'],
        '0x000C': ['CS', '1', 'RTPlanGeometry'],
        '0x000E': ['ST', '1', 'PrescriptionDescription'],
        '0x0010': ['SQ', '1', 'DoseReferenceSequence'],
        '0x0012': ['IS', '1', 'DoseReferenceNumber'],
        '0x0013': ['UI', '1', 'DoseReferenceUID'],
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
        '0x004B': ['FL', '1', 'SnoutPositionTolerance'],
        '0x004C': ['DS', '1', 'PatientSupportAngleTolerance'],
        '0x004E': ['DS', '1', 'TableTopEccentricAngleTolerance'],
        '0x004F': ['FL', '1', 'TableTopPitchAngleTolerance'],
        '0x0050': ['FL', '1', 'TableTopRollAngleTolerance'],
        '0x0051': ['DS', '1', 'TableTopVerticalPositionTolerance'],
        '0x0052': ['DS', '1', 'TableTopLongitudinalPositionTolerance'],
        '0x0053': ['DS', '1', 'TableTopLateralPositionTolerance'],
        '0x0055': ['CS', '1', 'RTPlanRelationship'],
        '0x0070': ['SQ', '1', 'FractionGroupSequence'],
        '0x0071': ['IS', '1', 'FractionGroupNumber'],
        '0x0072': ['LO', '1', 'FractionGroupDescription'],
        '0x0078': ['IS', '1', 'NumberOfFractionsPlanned'],
        '0x0079': ['IS', '1', 'NumberOfFractionPatternDigitsPerDay'],
        '0x007A': ['IS', '1', 'RepeatFractionCycleLength'],
        '0x007B': ['LT', '1', 'FractionPattern'],
        '0x0080': ['IS', '1', 'NumberOfBeams'],
        '0x0082': ['DS', '3', 'BeamDoseSpecificationPoint'],
        '0x0084': ['DS', '1', 'BeamDose'],
        '0x0086': ['DS', '1', 'BeamMeterset'],
        '0x0088': ['FL', '1', 'BeamDosePointDepth'],
        '0x0089': ['FL', '1', 'BeamDosePointEquivalentDepth'],
        '0x008A': ['FL', '1', 'BeamDosePointSSD'],
        '0x008B': ['CS', '1', 'BeamDoseMeaning'],
        '0x008C': ['SQ', '1', 'BeamDoseVerificationControlPointSequence'],
        '0x008D': ['FL', '1', 'AverageBeamDosePointDepth'],
        '0x008E': ['FL', '1', 'AverageBeamDosePointEquivalentDepth'],
        '0x008F': ['FL', '1', 'AverageBeamDosePointSSD'],
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
        '0x00BB': ['FL', '1', 'IsocenterToBeamLimitingDeviceDistance'],
        '0x00BC': ['IS', '1', 'NumberOfLeafJawPairs'],
        '0x00BE': ['DS', '3-n', 'LeafPositionBoundaries'],
        '0x00C0': ['IS', '1', 'BeamNumber'],
        '0x00C2': ['LO', '1', 'BeamName'],
        '0x00C3': ['ST', '1', 'BeamDescription'],
        '0x00C4': ['CS', '1', 'BeamType'],
        '0x00C5': ['FD', '1', 'BeamDeliveryDurationLimit'],
        '0x00C6': ['CS', '1', 'RadiationType'],
        '0x00C7': ['CS', '1', 'HighDoseTechniqueType'],
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
        '0x00D7': ['FL', '1', 'TotalWedgeTrayWaterEquivalentThickness'],
        '0x00D8': ['DS', '1', 'WedgeOrientation'],
        '0x00D9': ['FL', '1', 'IsocenterToWedgeTrayDistance'],
        '0x00DA': ['DS', '1', 'SourceToWedgeTrayDistance'],
        '0x00DB': ['FL', '1', 'WedgeThinEdgePosition'],
        '0x00DC': ['SH', '1', 'BolusID'],
        '0x00DD': ['ST', '1', 'BolusDescription'],
        '0x00DE': ['DS', '1', 'EffectiveWedgeAngle'],
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
        '0x00EF': ['SH', '1', 'CompensatorTrayID'],
        '0x00F0': ['IS', '1', 'NumberOfBlocks'],
        '0x00F2': ['DS', '1', 'TotalBlockTrayFactor'],
        '0x00F3': ['FL', '1', 'TotalBlockTrayWaterEquivalentThickness'],
        '0x00F4': ['SQ', '1', 'BlockSequence'],
        '0x00F5': ['SH', '1', 'BlockTrayID'],
        '0x00F6': ['DS', '1', 'SourceToBlockTrayDistance'],
        '0x00F7': ['FL', '1', 'IsocenterToBlockTrayDistance'],
        '0x00F8': ['CS', '1', 'BlockType'],
        '0x00F9': ['LO', '1', 'AccessoryCode'],
        '0x00FA': ['CS', '1', 'BlockDivergence'],
        '0x00FB': ['CS', '1', 'BlockMountingPosition'],
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
        '0x0131': ['FL', '1', 'AverageBeamDosePointSourceToExternalContourSurfaceDistance'],
        '0x0132': ['FL', '1', 'SourceToExternalContourDistance'],
        '0x0133': ['FL', '3', 'ExternalContourEntryPoint'],
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
        '0x0183': ['LO', '1', 'PatientSetupLabel'],
        '0x0184': ['LO', '1', 'PatientAdditionalPosition'],
        '0x0190': ['SQ', '1', 'FixationDeviceSequence'],
        '0x0192': ['CS', '1', 'FixationDeviceType'],
        '0x0194': ['SH', '1', 'FixationDeviceLabel'],
        '0x0196': ['ST', '1', 'FixationDeviceDescription'],
        '0x0198': ['SH', '1', 'FixationDevicePosition'],
        '0x0199': ['FL', '1', 'FixationDevicePitchAngle'],
        '0x019A': ['FL', '1', 'FixationDeviceRollAngle'],
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
        '0x021B': ['SH', '1', 'SourceModelID'],
        '0x021C': ['LO', '1', 'SourceDescription'],
        '0x0222': ['DS', '1', 'SourceEncapsulationNominalThickness'],
        '0x0224': ['DS', '1', 'SourceEncapsulationNominalTransmission'],
        '0x0226': ['LO', '1', 'SourceIsotopeName'],
        '0x0228': ['DS', '1', 'SourceIsotopeHalfLife'],
        '0x0229': ['CS', '1', 'SourceStrengthUnits'],
        '0x022A': ['DS', '1', 'ReferenceAirKermaRate'],
        '0x022B': ['DS', '1', 'SourceStrength'],
        '0x022C': ['DA', '1', 'SourceStrengthReferenceDate'],
        '0x022E': ['TM', '1', 'SourceStrengthReferenceTime'],
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
        '0x02D4': ['DS', '3', 'ControlPoint3DPosition'],
        '0x02D6': ['DS', '1', 'CumulativeTimeWeight'],
        '0x02E0': ['CS', '1', 'CompensatorDivergence'],
        '0x02E1': ['CS', '1', 'CompensatorMountingPosition'],
        '0x02E2': ['DS', '1-n', 'SourceToCompensatorDistance'],
        '0x02E3': ['FL', '1', 'TotalCompensatorTrayWaterEquivalentThickness'],
        '0x02E4': ['FL', '1', 'IsocenterToCompensatorTrayDistance'],
        '0x02E5': ['FL', '1', 'CompensatorColumnOffset'],
        '0x02E6': ['FL', '1-n', 'IsocenterToCompensatorDistances'],
        '0x02E7': ['FL', '1', 'CompensatorRelativeStoppingPowerRatio'],
        '0x02E8': ['FL', '1', 'CompensatorMillingToolDiameter'],
        '0x02EA': ['SQ', '1', 'IonRangeCompensatorSequence'],
        '0x02EB': ['LT', '1', 'CompensatorDescription'],
        '0x0302': ['IS', '1', 'RadiationMassNumber'],
        '0x0304': ['IS', '1', 'RadiationAtomicNumber'],
        '0x0306': ['SS', '1', 'RadiationChargeState'],
        '0x0308': ['CS', '1', 'ScanMode'],
        '0x030A': ['FL', '2', 'VirtualSourceAxisDistances'],
        '0x030C': ['SQ', '1', 'SnoutSequence'],
        '0x030D': ['FL', '1', 'SnoutPosition'],
        '0x030F': ['SH', '1', 'SnoutID'],
        '0x0312': ['IS', '1', 'NumberOfRangeShifters'],
        '0x0314': ['SQ', '1', 'RangeShifterSequence'],
        '0x0316': ['IS', '1', 'RangeShifterNumber'],
        '0x0318': ['SH', '1', 'RangeShifterID'],
        '0x0320': ['CS', '1', 'RangeShifterType'],
        '0x0322': ['LO', '1', 'RangeShifterDescription'],
        '0x0330': ['IS', '1', 'NumberOfLateralSpreadingDevices'],
        '0x0332': ['SQ', '1', 'LateralSpreadingDeviceSequence'],
        '0x0334': ['IS', '1', 'LateralSpreadingDeviceNumber'],
        '0x0336': ['SH', '1', 'LateralSpreadingDeviceID'],
        '0x0338': ['CS', '1', 'LateralSpreadingDeviceType'],
        '0x033A': ['LO', '1', 'LateralSpreadingDeviceDescription'],
        '0x033C': ['FL', '1', 'LateralSpreadingDeviceWaterEquivalentThickness'],
        '0x0340': ['IS', '1', 'NumberOfRangeModulators'],
        '0x0342': ['SQ', '1', 'RangeModulatorSequence'],
        '0x0344': ['IS', '1', 'RangeModulatorNumber'],
        '0x0346': ['SH', '1', 'RangeModulatorID'],
        '0x0348': ['CS', '1', 'RangeModulatorType'],
        '0x034A': ['LO', '1', 'RangeModulatorDescription'],
        '0x034C': ['SH', '1', 'BeamCurrentModulationID'],
        '0x0350': ['CS', '1', 'PatientSupportType'],
        '0x0352': ['SH', '1', 'PatientSupportID'],
        '0x0354': ['LO', '1', 'PatientSupportAccessoryCode'],
        '0x0356': ['FL', '1', 'FixationLightAzimuthalAngle'],
        '0x0358': ['FL', '1', 'FixationLightPolarAngle'],
        '0x035A': ['FL', '1', 'MetersetRate'],
        '0x0360': ['SQ', '1', 'RangeShifterSettingsSequence'],
        '0x0362': ['LO', '1', 'RangeShifterSetting'],
        '0x0364': ['FL', '1', 'IsocenterToRangeShifterDistance'],
        '0x0366': ['FL', '1', 'RangeShifterWaterEquivalentThickness'],
        '0x0370': ['SQ', '1', 'LateralSpreadingDeviceSettingsSequence'],
        '0x0372': ['LO', '1', 'LateralSpreadingDeviceSetting'],
        '0x0374': ['FL', '1', 'IsocenterToLateralSpreadingDeviceDistance'],
        '0x0380': ['SQ', '1', 'RangeModulatorSettingsSequence'],
        '0x0382': ['FL', '1', 'RangeModulatorGatingStartValue'],
        '0x0384': ['FL', '1', 'RangeModulatorGatingStopValue'],
        '0x0386': ['FL', '1', 'RangeModulatorGatingStartWaterEquivalentThickness'],
        '0x0388': ['FL', '1', 'RangeModulatorGatingStopWaterEquivalentThickness'],
        '0x038A': ['FL', '1', 'IsocenterToRangeModulatorDistance'],
        '0x0390': ['SH', '1', 'ScanSpotTuneID'],
        '0x0392': ['IS', '1', 'NumberOfScanSpotPositions'],
        '0x0394': ['FL', '1-n', 'ScanSpotPositionMap'],
        '0x0396': ['FL', '1-n', 'ScanSpotMetersetWeights'],
        '0x0398': ['FL', '2', 'ScanningSpotSize'],
        '0x039A': ['IS', '1', 'NumberOfPaintings'],
        '0x03A0': ['SQ', '1', 'IonToleranceTableSequence'],
        '0x03A2': ['SQ', '1', 'IonBeamSequence'],
        '0x03A4': ['SQ', '1', 'IonBeamLimitingDeviceSequence'],
        '0x03A6': ['SQ', '1', 'IonBlockSequence'],
        '0x03A8': ['SQ', '1', 'IonControlPointSequence'],
        '0x03AA': ['SQ', '1', 'IonWedgeSequence'],
        '0x03AC': ['SQ', '1', 'IonWedgePositionSequence'],
        '0x0401': ['SQ', '1', 'ReferencedSetupImageSequence'],
        '0x0402': ['ST', '1', 'SetupImageComment'],
        '0x0410': ['SQ', '1', 'MotionSynchronizationSequence'],
        '0x0412': ['FL', '3', 'ControlPointOrientation'],
        '0x0420': ['SQ', '1', 'GeneralAccessorySequence'],
        '0x0421': ['SH', '1', 'GeneralAccessoryID'],
        '0x0422': ['ST', '1', 'GeneralAccessoryDescription'],
        '0x0423': ['CS', '1', 'GeneralAccessoryType'],
        '0x0424': ['IS', '1', 'GeneralAccessoryNumber'],
        '0x0425': ['FL', '1', 'SourceToGeneralAccessoryDistance'],
        '0x0431': ['SQ', '1', 'ApplicatorGeometrySequence'],
        '0x0432': ['CS', '1', 'ApplicatorApertureShape'],
        '0x0433': ['FL', '1', 'ApplicatorOpening'],
        '0x0434': ['FL', '1', 'ApplicatorOpeningX'],
        '0x0435': ['FL', '1', 'ApplicatorOpeningY'],
        '0x0436': ['FL', '1', 'SourceToApplicatorMountingPositionDistance'],
        '0x0440': ['IS', '1', 'NumberOfBlockSlabItems'],
        '0x0441': ['SQ', '1', 'BlockSlabSequence'],
        '0x0442': ['DS', '1', 'BlockSlabThickness'],
        '0x0443': ['US', '1', 'BlockSlabNumber'],
        '0x0450': ['SQ', '1', 'DeviceMotionControlSequence'],
        '0x0451': ['CS', '1', 'DeviceMotionExecutionMode'],
        '0x0452': ['CS', '1', 'DeviceMotionObservationMode'],
        '0x0453': ['SQ', '1', 'DeviceMotionParameterCodeSequence'],
    },
    '0x300C': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
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
        '0x00F2': ['SQ', '1', 'ReferencedControlPointSequence'],
        '0x00F4': ['IS', '1', 'ReferencedStartControlPointIndex'],
        '0x00F6': ['IS', '1', 'ReferencedStopControlPointIndex'],
        '0x0100': ['IS', '1', 'ReferencedRangeShifterNumber'],
        '0x0102': ['IS', '1', 'ReferencedLateralSpreadingDeviceNumber'],
        '0x0104': ['IS', '1', 'ReferencedRangeModulatorNumber'],
        '0x0111': ['SQ', '1', 'OmittedBeamTaskSequence'],
        '0x0112': ['CS', '1', 'ReasonForOmission'],
        '0x0113': ['LO', '1', 'ReasonForOmissionDescription'],
    },
    '0x300E': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0002': ['CS', '1', 'ApprovalStatus'],
        '0x0004': ['DA', '1', 'ReviewDate'],
        '0x0005': ['TM', '1', 'ReviewTime'],
        '0x0008': ['PN', '1', 'ReviewerName'],
    },
    '0x4000': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0010': ['LT', '1', 'Arbitrary'],
        '0x4000': ['LT', '1', 'TextComments'],
    },
    '0x4008': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0040': ['SH', '1', 'ResultsID'],
        '0x0042': ['LO', '1', 'ResultsIDIssuer'],
        '0x0050': ['SQ', '1', 'ReferencedInterpretationSequence'],
        '0x00FF': ['CS', '1', 'ReportProductionStatusTrial'],
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
        '0x0117': ['SQ', '1', 'InterpretationDiagnosisCodeSequence'],
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
    '0x4010': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0001': ['CS', '1', 'LowEnergyDetectors'],
        '0x0002': ['CS', '1', 'HighEnergyDetectors'],
        '0x0004': ['SQ', '1', 'DetectorGeometrySequence'],
        '0x1001': ['SQ', '1', 'ThreatROIVoxelSequence'],
        '0x1004': ['FL', '3', 'ThreatROIBase'],
        '0x1005': ['FL', '3', 'ThreatROIExtents'],
        '0x1006': ['OB', '1', 'ThreatROIBitmap'],
        '0x1007': ['SH', '1', 'RouteSegmentID'],
        '0x1008': ['CS', '1', 'GantryType'],
        '0x1009': ['CS', '1', 'OOIOwnerType'],
        '0x100A': ['SQ', '1', 'RouteSegmentSequence'],
        '0x1010': ['US', '1', 'PotentialThreatObjectID'],
        '0x1011': ['SQ', '1', 'ThreatSequence'],
        '0x1012': ['CS', '1', 'ThreatCategory'],
        '0x1013': ['LT', '1', 'ThreatCategoryDescription'],
        '0x1014': ['CS', '1', 'ATDAbilityAssessment'],
        '0x1015': ['CS', '1', 'ATDAssessmentFlag'],
        '0x1016': ['FL', '1', 'ATDAssessmentProbability'],
        '0x1017': ['FL', '1', 'Mass'],
        '0x1018': ['FL', '1', 'Density'],
        '0x1019': ['FL', '1', 'ZEffective'],
        '0x101A': ['SH', '1', 'BoardingPassID'],
        '0x101B': ['FL', '3', 'CenterOfMass'],
        '0x101C': ['FL', '3', 'CenterOfPTO'],
        '0x101D': ['FL', '6-n', 'BoundingPolygon'],
        '0x101E': ['SH', '1', 'RouteSegmentStartLocationID'],
        '0x101F': ['SH', '1', 'RouteSegmentEndLocationID'],
        '0x1020': ['CS', '1', 'RouteSegmentLocationIDType'],
        '0x1021': ['CS', '1-n', 'AbortReason'],
        '0x1023': ['FL', '1', 'VolumeOfPTO'],
        '0x1024': ['CS', '1', 'AbortFlag'],
        '0x1025': ['DT', '1', 'RouteSegmentStartTime'],
        '0x1026': ['DT', '1', 'RouteSegmentEndTime'],
        '0x1027': ['CS', '1', 'TDRType'],
        '0x1028': ['CS', '1', 'InternationalRouteSegment'],
        '0x1029': ['LO', '1-n', 'ThreatDetectionAlgorithmandVersion'],
        '0x102A': ['SH', '1', 'AssignedLocation'],
        '0x102B': ['DT', '1', 'AlarmDecisionTime'],
        '0x1031': ['CS', '1', 'AlarmDecision'],
        '0x1033': ['US', '1', 'NumberOfTotalObjects'],
        '0x1034': ['US', '1', 'NumberOfAlarmObjects'],
        '0x1037': ['SQ', '1', 'PTORepresentationSequence'],
        '0x1038': ['SQ', '1', 'ATDAssessmentSequence'],
        '0x1039': ['CS', '1', 'TIPType'],
        '0x103A': ['CS', '1', 'DICOSVersion'],
        '0x1041': ['DT', '1', 'OOIOwnerCreationTime'],
        '0x1042': ['CS', '1', 'OOIType'],
        '0x1043': ['FL', '3', 'OOISize'],
        '0x1044': ['CS', '1', 'AcquisitionStatus'],
        '0x1045': ['SQ', '1', 'BasisMaterialsCodeSequence'],
        '0x1046': ['CS', '1', 'PhantomType'],
        '0x1047': ['SQ', '1', 'OOIOwnerSequence'],
        '0x1048': ['CS', '1', 'ScanType'],
        '0x1051': ['LO', '1', 'ItineraryID'],
        '0x1052': ['SH', '1', 'ItineraryIDType'],
        '0x1053': ['LO', '1', 'ItineraryIDAssigningAuthority'],
        '0x1054': ['SH', '1', 'RouteID'],
        '0x1055': ['SH', '1', 'RouteIDAssigningAuthority'],
        '0x1056': ['CS', '1', 'InboundArrivalType'],
        '0x1058': ['SH', '1', 'CarrierID'],
        '0x1059': ['CS', '1', 'CarrierIDAssigningAuthority'],
        '0x1060': ['FL', '3', 'SourceOrientation'],
        '0x1061': ['FL', '3', 'SourcePosition'],
        '0x1062': ['FL', '1', 'BeltHeight'],
        '0x1064': ['SQ', '1', 'AlgorithmRoutingCodeSequence'],
        '0x1067': ['CS', '1', 'TransportClassification'],
        '0x1068': ['LT', '1', 'OOITypeDescriptor'],
        '0x1069': ['FL', '1', 'TotalProcessingTime'],
        '0x106C': ['OB', '1', 'DetectorCalibrationData'],
        '0x106D': ['CS', '1', 'AdditionalScreeningPerformed'],
        '0x106E': ['CS', '1', 'AdditionalInspectionSelectionCriteria'],
        '0x106F': ['SQ', '1', 'AdditionalInspectionMethodSequence'],
        '0x1070': ['CS', '1', 'AITDeviceType'],
        '0x1071': ['SQ', '1', 'QRMeasurementsSequence'],
        '0x1072': ['SQ', '1', 'TargetMaterialSequence'],
        '0x1073': ['FD', '1', 'SNRThreshold'],
        '0x1075': ['DS', '1', 'ImageScaleRepresentation'],
        '0x1076': ['SQ', '1', 'ReferencedPTOSequence'],
        '0x1077': ['SQ', '1', 'ReferencedTDRInstanceSequence'],
        '0x1078': ['ST', '1', 'PTOLocationDescription'],
        '0x1079': ['SQ', '1', 'AnomalyLocatorIndicatorSequence'],
        '0x107A': ['FL', '3', 'AnomalyLocatorIndicator'],
        '0x107B': ['SQ', '1', 'PTORegionSequence'],
        '0x107C': ['CS', '1', 'InspectionSelectionCriteria'],
        '0x107D': ['SQ', '1', 'SecondaryInspectionMethodSequence'],
        '0x107E': ['DS', '6', 'PRCSToRCSOrientation'],
    },
    '0x4FFE': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0001': ['SQ', '1', 'MACParametersSequence'],
    },
    '0x5000': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
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
        '0x0110': ['US', '1-n', 'CurveDataDescriptor'],
        '0x0112': ['US', '1-n', 'CoordinateStartValue'],
        '0x0114': ['US', '1-n', 'CoordinateStepValue'],
        '0x1001': ['CS', '1', 'CurveActivationLayer'],
        '0x2000': ['US', '1', 'AudioType'],
        '0x2002': ['US', '1', 'AudioSampleFormat'],
        '0x2004': ['US', '1', 'NumberOfChannels'],
        '0x2006': ['UL', '1', 'NumberOfSamples'],
        '0x2008': ['UL', '1', 'SampleRate'],
        '0x200A': ['UL', '1', 'TotalTime'],
        '0x200C': ['ox', '1', 'AudioSampleData'],
        '0x200E': ['LT', '1', 'AudioComments'],
        '0x2500': ['LO', '1', 'CurveLabel'],
        '0x2600': ['SQ', '1', 'CurveReferencedOverlaySequence'],
        '0x2610': ['US', '1', 'CurveReferencedOverlayGroup'],
        '0x3000': ['ox', '1', 'CurveData'],
    },
    '0x5200': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x9229': ['SQ', '1', 'SharedFunctionalGroupsSequence'],
        '0x9230': ['SQ', '1', 'PerFrameFunctionalGroupsSequence'],
    },
    '0x5400': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0100': ['SQ', '1', 'WaveformSequence'],
        '0x0110': ['ox', '1', 'ChannelMinimumValue'],
        '0x0112': ['ox', '1', 'ChannelMaximumValue'],
        '0x1004': ['US', '1', 'WaveformBitsAllocated'],
        '0x1006': ['CS', '1', 'WaveformSampleInterpretation'],
        '0x100A': ['ox', '1', 'WaveformPaddingValue'],
        '0x1010': ['ox', '1', 'WaveformData'],
    },
    '0x5600': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0010': ['OF', '1', 'FirstOrderPhaseCorrectionAngle'],
        '0x0020': ['OF', '1', 'SpectroscopyData'],
    },
    '0x6000': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0010': ['US', '1', 'OverlayRows'],
        '0x0011': ['US', '1', 'OverlayColumns'],
        '0x0012': ['US', '1', 'OverlayPlanes'],
        '0x0015': ['IS', '1', 'NumberOfFramesInOverlay'],
        '0x0022': ['LO', '1', 'OverlayDescription'],
        '0x0040': ['CS', '1', 'OverlayType'],
        '0x0045': ['LO', '1', 'OverlaySubtype'],
        '0x0050': ['SS', '2', 'OverlayOrigin'],
        '0x0051': ['US', '1', 'ImageFrameOrigin'],
        '0x0052': ['US', '1', 'OverlayPlaneOrigin'],
        '0x0060': ['CS', '1', 'OverlayCompressionCode'],
        '0x0061': ['SH', '1', 'OverlayCompressionOriginator'],
        '0x0062': ['SH', '1', 'OverlayCompressionLabel'],
        '0x0063': ['CS', '1', 'OverlayCompressionDescription'],
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
        '0x1001': ['CS', '1', 'OverlayActivationLayer'],
        '0x1100': ['US', '1', 'OverlayDescriptorGray'],
        '0x1101': ['US', '1', 'OverlayDescriptorRed'],
        '0x1102': ['US', '1', 'OverlayDescriptorGreen'],
        '0x1103': ['US', '1', 'OverlayDescriptorBlue'],
        '0x1200': ['US', '1-n', 'OverlaysGray'],
        '0x1201': ['US', '1-n', 'OverlaysRed'],
        '0x1202': ['US', '1-n', 'OverlaysGreen'],
        '0x1203': ['US', '1-n', 'OverlaysBlue'],
        '0x1301': ['IS', '1', 'ROIArea'],
        '0x1302': ['DS', '1', 'ROIMean'],
        '0x1303': ['DS', '1', 'ROIStandardDeviation'],
        '0x1500': ['LO', '1', 'OverlayLabel'],
        '0x3000': ['ox', '1', 'OverlayData'],
        '0x4000': ['LT', '1', 'OverlayComments'],
    },
    '0x7FE0': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0008': ['OF', '1', 'FloatPixelData'],
        '0x0009': ['OD', '1', 'DoubleFloatPixelData'],
        '0x0010': ['ox', '1', 'PixelData'],
        '0x0020': ['OW', '1', 'CoefficientsSDVN'],
        '0x0030': ['OW', '1', 'CoefficientsSDHN'],
        '0x0040': ['OW', '1', 'CoefficientsSDDN'],
    },
    '0x7F00': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0x0010': ['ox', '1', 'VariablePixelData'],
        '0x0011': ['US', '1', 'VariableNextDataGroup'],
        '0x0020': ['OW', '1', 'VariableCoefficientsSDVN'],
        '0x0030': ['OW', '1', 'VariableCoefficientsSDHN'],
        '0x0040': ['OW', '1', 'VariableCoefficientsSDDN'],
    },
    '0xFFFA': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0xFFFA': ['SQ', '1', 'DigitalSignaturesSequence'],
    },
    '0xFFFC': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0xFFFC': ['OB', '1', 'DataSetTrailingPadding'],
    },
    '0xFFFE': {
        '0x0000': ['UL', '1', 'GenericGroupLength'],
        '0xE000': ['NONE', '1', 'Item'],
        '0xE00D': ['NONE', '1', 'ItemDelimitationItem'],
        '0xE0DD': ['NONE', '1', 'SequenceDelimitationItem'],
    }
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
    var isSafari5 = (navigator.appVersion.indexOf("Safari") !== -1) &&
        (navigator.appVersion.indexOf("Chrome") === -1) &&
        ( (navigator.appVersion.indexOf("5.0.") !== -1) ||
          (navigator.appVersion.indexOf("5.1.") !== -1) );
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
 * Filter tool base gui.
 * @class Filter
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Filter = function (app)
{
    /**
     * Setup the filter tool HTML.
     * @method setup
     */
    this.setup = function (list)
    {
        // filter select
        var filterSelector = dwv.html.createHtmlSelect("filterSelect", list);
        filterSelector.onchange = app.onChangeFilter;
    
        // filter list element
        var filterLi = dwv.html.createHiddenElement("li", "filterLi");
        filterLi.className += " ui-block-b";
        filterLi.appendChild(filterSelector);
        
        // append element
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        dwv.html.appendElement(node, filterLi);
    };
    
    /**
     * Display the tool HTML.
     * @method display
     * @param {Boolean} flag True to display, false to hide.
     */
    this.display = function (flag)
    {
        var node = app.getElement("filterLi");
        dwv.html.displayElement(node, flag);
    };
    
    /**
     * Initialise the tool HTML.
     * @method initialise
     */
    this.initialise = function ()
    {
        // filter select: reset selected options
        var filterSelector = app.getElement("filterSelect");
        filterSelector.selectedIndex = 0;
        // refresh
        dwv.gui.refreshElement(filterSelector);
    };

}; // class dwv.gui.base.Filter

/**
 * Threshold filter base gui.
 * @class Threshold
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Threshold = function (app)
{
    /**
     * Threshold slider.
     * @property slider
     * @private
     * @type Object
     */
    var slider = new dwv.gui.Slider(app);
    
    /**
     * Setup the threshold filter HTML.
     * @method setup
     */
    this.setup = function ()
    {
        // threshold list element
        var thresholdLi = dwv.html.createHiddenElement("li", "thresholdLi");
        thresholdLi.className += " ui-block-c";
        
        // node
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        // append threshold
        node.appendChild(thresholdLi);
        // threshold slider
        slider.append();
        // refresh
        dwv.gui.refreshElement(node);
    };
    
    /**
     * Clear the threshold filter HTML.
     * @method display
     * @param {Boolean} flag True to display, false to hide.
     */
    this.display = function (flag)
    {
        var node = app.getElement("thresholdLi");
        dwv.html.displayElement(node, flag);
    };
    
    /**
     * Initialise the threshold filter HTML.
     * @method initialise
     */
    this.initialise = function ()
    {
        // threshold slider
        slider.initialise();
    };

}; // class dwv.gui.base.Threshold
    
/**
 * Create the apply filter button.
 * @method createFilterApplyButton
 * @static
 */
dwv.gui.filter.base.createFilterApplyButton = function (app)
{
    var button = document.createElement("button");
    button.id = "runFilterButton";
    button.onclick = app.onRunFilter;
    button.setAttribute("style","width:100%; margin-top:0.5em;");
    button.setAttribute("class","ui-btn ui-btn-b");
    button.appendChild(document.createTextNode("Apply"));
    return button;
};

/**
 * Sharpen filter base gui.
 * @class Sharpen
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Sharpen = function (app)
{
    /**
     * Setup the sharpen filter HTML.
     * @method setup
     */
    this.setup = function ()
    {
        // sharpen list element
        var sharpenLi = dwv.html.createHiddenElement("li", "sharpenLi");
        sharpenLi.className += " ui-block-c";
        sharpenLi.appendChild( dwv.gui.filter.base.createFilterApplyButton(app) );
        // append element
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        dwv.html.appendElement(node, sharpenLi);
    };
    
    /**
     * Display the sharpen filter HTML.
     * @method display
     * @param {Boolean} flag True to display, false to hide.
     */
    this.display = function (flag)
    {
        var node = app.getElement("sharpenLi");
        dwv.html.displayElement(node, flag);
    };
    
}; // class dwv.gui.base.Sharpen

/**
 * Sobel filter base gui.
 * @class Sobel
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Sobel = function (app)
{
    /**
     * Setup the sobel filter HTML.
     * @method setup
     */
    this.setup = function ()
    {
        // sobel list element
        var sobelLi = dwv.html.createHiddenElement("li", "sobelLi");
        sobelLi.className += " ui-block-c";
        sobelLi.appendChild( dwv.gui.filter.base.createFilterApplyButton(app) );
        // append element
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        dwv.html.appendElement(node, sobelLi);
    };
    
    /**
     * Display the sobel filter HTML.
     * @method display
     * @param {Boolean} flag True to display, false to hide.
     */
    this.display = function (flag)
    {
        var node = app.getElement("sobelLi");
        dwv.html.displayElement(node, flag);
    };
    
}; // class dwv.gui.base.Sobel

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
 * Namespace for base GUI functions.
 * @class base
 * @namespace dwv.gui
 * @static
 */
dwv.gui.base = dwv.gui.base || {};

/**
 * Get the size of the image display window.
 * @method getWindowSize
 * @static
 */
dwv.gui.base.getWindowSize = function()
{
    return { 'width': window.innerWidth, 'height': window.innerHeight - 147 };
};

/**
 * Display a progress value.
 * @method displayProgress
 * @static
 * @param {Number} percent The progress percentage.
 */
dwv.gui.base.displayProgress = function(/*percent*/)
{
    // default does nothing...
};

/**
 * Get a HTML element associated to a container div.
 * @method getElement
 * @static
 * @param containerDivId The id of the container div.
 * @param name The name or id to find.
 * @return The found element or null.
 */
dwv.gui.base.getElement = function (containerDivId, name)
{
    // get by class in the container div
    var parent = document.getElementById(containerDivId);
    var elements = parent.getElementsByClassName(name);
    // getting the last element since some libraries (ie jquery-mobile) creates
    // span in front of regular tags (such as select)...
    var element = elements[elements.length-1];
    // if not found get by id with 'containerDivId-className'
    if ( typeof element === "undefined" ) {
        element = document.getElementById(containerDivId + '-' + name);
    }
    return element;
 };

 /**
 * Refresh a HTML element. Mainly for jquery-mobile.
 * @method refreshElement
 * @static
 * @param {String} element The HTML element to refresh.
 */
dwv.gui.base.refreshElement = function (/*element*/)
{
    // base does nothing...
};

/**
 * Set the selected item of a HTML select.
 * @method setSelected
 * @static
 * @param {String} selectName The name of the HTML select.
 * @param {String} itemName The name of the itme to mark as selected.
 */
dwv.gui.setSelected = function(element, itemName)
{
    if ( element ) {
        var index = 0;
        for( index in element.options){
            if( element.options[index].text === itemName ) {
                break;
            }
        }
        element.selectedIndex = index;
        dwv.gui.refreshElement(element);
    }
};

/**
 * Slider base gui.
 * @class Slider
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Slider = function (app)
{
    /**
     * Append the slider HTML.
     * @method append
     */
    this.append = function ()
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
        app.getElement("thresholdLi").appendChild(div);
        // bind change
        $("#threshold-div").on("change",
                function(/*event*/) {
                    app.onChangeMinMax(
                        { "min":$("#threshold-min").val(),
                          "max":$("#threshold-max").val() } );
                }
            );
        // refresh
        dwv.gui.refreshElement(app.getElement("toolList"));
    };
    
    /**
     * Initialise the slider HTML.
     * @method initialise
     */
    this.initialise = function ()
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
        // refresh
        dwv.gui.refreshElement(app.getElement("toolList"));
    };

}; // class dwv.gui.base.Slider

/**
 * DICOM tags base gui.
 * @class DicomTags
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.DicomTags = function (app)
{
    /**
     * Initialise the DICOM tags table. To be called once the DICOM has been parsed.
     * @method initialise
     * @param {Object} dataInfo The data information.
     */
    this.initialise = function (dataInfo)
    {
        // HTML node
        var node = app.getElement("tags");
        if( node === null ) {
            return;
        }
        // remove possible previous
        while (node.hasChildNodes()) { 
            node.removeChild(node.firstChild);
        }
        // tag list table (without the pixel data)
        if(dataInfo.PixelData) {
            dataInfo.PixelData.value = "...";
        }
        // tags HTML table
        var table = dwv.html.toTable(dataInfo);
        table.className = "tagsTable";
        //table.setAttribute("class", "tagsList");
        table.setAttribute("data-role", "table");
        table.setAttribute("data-mode", "columntoggle");
        // search form
        node.appendChild(dwv.html.getHtmlSearchForm(table));
        // tags table
        node.appendChild(table);
        // refresh
        dwv.gui.refreshElement(node);
    };
    
}; // class dwv.gui.base.DicomTags
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
dwv.gui.base.appendVersionHtml = function (version)
{
    var nodes = document.getElementsByClassName("dwv-version");
    if ( nodes ) {
        for( var i = 0; i < nodes.length; ++i ){
            nodes[i].appendChild( document.createTextNode(version) );
        }
    }
};

/**
 * Build the help HTML.
 * @method appendHelpHtml
 * @param {Boolean} mobile Flag for mobile or not environement.
 */
dwv.gui.base.appendHelpHtml = function(toolList, mobile, app)
{
    var actionType = "mouse";
    if( mobile ) {
        actionType = "touch";
    }
    
    var toolHelpDiv = document.createElement("div");
    
    // current location
    var loc = window.location.pathname;
    var dir = loc.substring(0, loc.lastIndexOf('/'));

    var tool = null;
    var tkeys = Object.keys(toolList);
    for ( var t=0; t < tkeys.length; ++t )
    {
        tool = toolList[tkeys[t]];
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
    
    var helpNode = app.getElement("help");

    var dwvLink = document.createElement("a");
    dwvLink.href = "https://github.com/ivmartel/dwv/wiki";
    dwvLink.title = "DWV wiki on github.";
    dwvLink.appendChild(document.createTextNode("DWV"));
    
    var dwvExampleLink = document.createElement("a");
    var inputIdx = document.URL.indexOf("?input=");
    dwvExampleLink.href = document.URL.substr(0, inputIdx+7) + 
        "http%3A%2F%2Fx.babymri.org%2F%3F53320924%26.dcm";
    dwvExampleLink.title = "Brain MRI in DWV.";
    dwvExampleLink.target = "_top";
    dwvExampleLink.appendChild(document.createTextNode("MRI"));

    var bbmriLink = document.createElement("a");
    bbmriLink.href = "http://www.babymri.org";
    bbmriLink.title = "babymri.org";
    bbmriLink.appendChild(document.createTextNode("babymri.org"));

    var headPara = document.createElement("p");
    headPara.appendChild(dwvLink);
    headPara.appendChild(document.createTextNode(" can load DICOM data " +
        "either from a local file or from an URL. All DICOM tags are available " +
        "in a searchable table, press the 'tags' or grid button. " + 
        "You can choose to display the image information overlay by pressing the " + 
        "'info' or i button. For some example data, check this "));
    headPara.appendChild(dwvExampleLink);
    headPara.appendChild(document.createTextNode(" from the " ));
    headPara.appendChild(bbmriLink);
    headPara.appendChild(document.createTextNode(" database." ));
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
 * @param {Object} content The content of the cell.
 */
dwv.html.appendCell = function (row, content)
{
    var cell = row.insertCell(-1);
    var str = content;
    // special care for arrays
    if ( content instanceof Array || 
            content instanceof Uint8Array ||
            content instanceof Uint16Array ||
            content instanceof Uint32Array ) {
        if ( content.length > 10 ) {
            content = Array.prototype.slice.call( content, 0, 10 );
            content[10] = "...";
        }
        str = Array.prototype.join.call( content, ', ' );
    }
    // append
    cell.appendChild(document.createTextNode(str));
};

/**
 * Append a header cell to a given row.
 * @method appendHCell
 * @static
 * @param {Object} row The row to append the header cell to.
 * @param {String} text The text of the header cell.
 */
dwv.html.appendHCell = function (row, text)
{
    var cell = document.createElement("th");
    // TODO jquery-mobile specific...
    if ( text !== "Value" && text !== "Name" ) {
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
dwv.html.appendRowForArray = function (table, input, level, maxLevel, rowHeader)
{
    var row = null;
    // loop through
    for ( var i=0; i<input.length; ++i ) {
        var value = input[i];
        // last level
        if ( typeof value === 'number' ||
                typeof value === 'string' ||
                value === null ||
                value === undefined ||
                level >= maxLevel ) {
            if ( !row ) {
                row = table.insertRow(-1);
            }
            dwv.html.appendCell(row, value);
        }
        // more to come
        else {
            dwv.html.appendRow(table, value, level+i, maxLevel, rowHeader);
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
dwv.html.appendRowForObject = function (table, input, level, maxLevel, rowHeader)
{
    var keys = Object.keys(input);
    var row = null;
    for ( var o=0; o<keys.length; ++o ) {
        var value = input[keys[o]];
        // last level
        if ( typeof value === 'number' ||
                typeof value === 'string' ||
                value === null ||
                value === undefined ||
                level >= maxLevel ) {
            if ( !row ) {
                row = table.insertRow(-1);
            }
            if ( o === 0 && rowHeader) {
                dwv.html.appendCell(row, rowHeader);
            }
            dwv.html.appendCell(row, value);
        }
        // more to come
        else {
            dwv.html.appendRow(table, value, level+o, maxLevel, keys[o]);
        }
    }
    // header row
    // warn: need to create the header after the rest
    // otherwise the data will inserted in the thead...
    if ( level === 2 ) {
        var header = table.createTHead();
        var th = header.insertRow(-1);
        if ( rowHeader ) {
            dwv.html.appendHCell(th, "Name");
        }
        for ( var k=0; k<keys.length; ++k ) {
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
dwv.html.appendRow = function (table, input, level, maxLevel, rowHeader)
{
    // array
    if ( input instanceof Array ) {
        dwv.html.appendRowForArray(table, input, level+1, maxLevel, rowHeader);
    }
    // object
    else if ( typeof input === 'object') {
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
dwv.html.toTable = function (input)
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
dwv.html.getHtmlSearchForm = function (htmlTableToSearch)
{
    var form = document.createElement("form");
    form.setAttribute("class", "filter");
    var input = document.createElement("input");
    input.onkeyup = function () {
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
dwv.html.filterTable = function (term, table) {
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
dwv.html.dehighlight = function (container) {
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
dwv.html.highlight = function (term, container) {
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
dwv.html.createHighlightNode = function (child) {
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
dwv.html.cleanNode = function (node) {
    // remove its children
    while (node.hasChildNodes()) {
        node.removeChild(node.firstChild);
    }
};

/**
 * Remove a HTML node and all its children.
 * @method removeNode
 * @static
 * @param {String} nodeId The string id of the node to delete.
 */
dwv.html.removeNode = function (node) {
    // check node
    if ( !node ) {
        return;
    }
    // remove its children
    dwv.html.cleanNode(node);
    // remove it from its parent
    var top = node.parentNode;
    top.removeChild(node);
};

dwv.html.removeNodes = function (nodes) {
    for ( var i = 0; i < nodes.length; ++i ) {
        dwv.html.removeNode(nodes[i]);
    }
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
dwv.html.createHtmlSelect = function (name, list) {
    // select
    var select = document.createElement("select");
    //select.name = name;
    select.className = name;
    // options
    var option;
    if ( list instanceof Array )
    {
        for ( var i in list )
        {
            option = document.createElement("option");
            option.value = list[i];
            option.appendChild(document.createTextNode(dwv.utils.capitaliseFirstLetter(list[i])));
            select.appendChild(option);
        }
    }
    else if ( typeof list === 'object')
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
 * @return {Object} The parameters found in the input uri.
 */
dwv.html.getUriParam = function (uri)
{
    // split key/value pairs
    var mainQueryPairs = dwv.utils.splitQueryString(uri);
    // check pairs
    if ( Object.keys(mainQueryPairs).length === 0 ) {
        return null;
    }
    // has to have an input key
    return mainQueryPairs.query;
};

/**
 * Decode a Key/Value pair uri. If a key is repeated, the result 
 * be an array of base + each key. 
 * @method decodeKeyValueUri
 * @static
 * @param {String} uri The uri to decode.
 * @param {String} replaceMode The key replace more.
 */
dwv.html.decodeKeyValueUri = function (uri, replaceMode)
{
    var result = [];

    // repeat key replace mode (default to keep key)
    var repeatKeyReplaceMode = "key";
    if ( replaceMode ) {
        repeatKeyReplaceMode = replaceMode;
    }

    // decode input URI
    var queryUri = decodeURIComponent(uri);
    // get key/value pairs from input URI
    var inputQueryPairs = dwv.utils.splitQueryString(queryUri);
    if ( Object.keys(inputQueryPairs).length === 0 ) 
    {
        result.push(queryUri);
    }
    else
    {
        var keys = Object.keys(inputQueryPairs.query);
        // find repeat key
        var repeatKey = null;
        for ( var i = 0; i < keys.length; ++i )
        {
            if ( inputQueryPairs.query[keys[i]] instanceof Array )
            {
                repeatKey = keys[i];
                break;
            }
        }
    
        if ( !repeatKey ) 
        {
            result.push(queryUri);
        }
        else
        {
            var repeatList = inputQueryPairs.query[repeatKey];
            // build base uri
            var baseUrl = inputQueryPairs.base;
            // do not add '?' when the repeatKey is 'file'
            // root/path/to/?file=0.jpg&file=1.jpg
            if ( repeatKey !== "file" ) { 
                baseUrl += "?";
            }
            var gotOneArg = false;
            for ( var j = 0; j < keys.length; ++j )
            {
                if ( keys[j] !== repeatKey ) {
                    if ( gotOneArg ) {
                        baseUrl += "&";
                    }
                    baseUrl += keys[j] + "=" + inputQueryPairs.query[keys[j]];
                    gotOneArg = true;
                }
            }
            // append built urls to result
            var url;
            for ( var k = 0; k < repeatList.length; ++k )
            {
                url = baseUrl;
                if ( gotOneArg ) {
                    url += "&";
                }
                if ( repeatKeyReplaceMode === "key" ) {
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
 * @param {Function} The function to call with the decoded urls.
 */
dwv.html.decodeManifestUri = function (uri, nslices, callback)
{
    // Request error
    var onErrorRequest = function (/*event*/)
    {
        console.warn( "RequestError while receiving manifest: "+this.status );
    };

    // Request handler
    var onLoadRequest = function (/*event*/)
    {
        var urls = dwv.html.decodeManifest(this.responseXML, nslices);
        callback(urls);
    };
    
    var request = new XMLHttpRequest();
    request.open('GET', decodeURIComponent(uri), true);
    request.responseType = "xml"; 
    request.onload = onLoadRequest;
    request.onerror = onErrorRequest;
    request.send(null);
};

/**
 * Decode an XML manifest. 
 * @method decodeManifest
 * @static
 * @param {Object} manifest The manifest to decode.
 * @param {Number} nslices The number of slices to load.
 */
dwv.html.decodeManifest = function (manifest, nslices)
{
    var result = [];
    // wado url
    var wadoElement = manifest.getElementsByTagName("wado_query");
    var wadoURL = wadoElement[0].getAttribute("wadoURL");
    var rootURL = wadoURL + "?requestType=WADO&contentType=application/dicom&";
    // patient list
    var patientList = manifest.getElementsByTagName("Patient");
    if ( patientList.length > 1 ) {
        console.warn("More than one patient, loading first one.");
    }
    // study list
    var studyList = patientList[0].getElementsByTagName("Study");
    if ( studyList.length > 1 ) {
        console.warn("More than one study, loading first one.");
    }
    var studyUID = studyList[0].getAttribute("StudyInstanceUID");
    // series list
    var seriesList = studyList[0].getElementsByTagName("Series");
    if ( seriesList.length > 1 ) {
        console.warn("More than one series, loading first one.");
    }
    var seriesUID = seriesList[0].getAttribute("SeriesInstanceUID");
    // instance list
    var instanceList = seriesList[0].getElementsByTagName("Instance");
    // loop on instances and push links
    var max = instanceList.length;
    if ( nslices < max ) {
        max = nslices;
    }
    for ( var i = 0; i < max; ++i ) {
        var sopInstanceUID = instanceList[i].getAttribute("SOPInstanceUID");
        var link = rootURL + 
        "&studyUID=" + studyUID +
        "&seriesUID=" + seriesUID +
        "&objectUID=" + sopInstanceUID;
        result.push( link );
    }
    // return
    return result;
};

/**
 * Display or not an element.
 * @method displayElement
 * @static
 * @param {Object} element The HTML element to display.
 * @param {Boolean} flag True to display the element.
 */
dwv.html.displayElement = function (element, flag)
{
    element.style.display = flag ? "" : "none";
};

/**
 * Toggle the display of an element.
 * @method toggleDisplay
 * @static
 * @param {Object} element The HTML element to display.
 */
dwv.html.toggleDisplay = function (element)
{
    if ( element.style.display === "none" ) {
        element.style.display = '';
    }
    else {
        element.style.display = "none";
    }
};

/**
 * Append an element.
 * @method appendElement
 * @static
 * @param {Object} parent The HTML element to append to.
 * @param {Object} element The HTML element to append.
 */
dwv.html.appendElement = function (parent, element)
{
    // append
    parent.appendChild(element);
    // refresh
    dwv.gui.refreshElement(parent);
};

/**
 * Create an element.
 * @method createElement
 * @static
 * @param {String} type The type of the elemnt.
 * @param {String} className The className of the element.
 */
dwv.html.createHiddenElement = function (type, className)
{
    var element = document.createElement(type);
    element.className = className;
    // hide by default
    element.style.display = "none";
    // return
    return element;
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
dwv.html.Layer = function(canvas)
{
    /**
     * The associated HTMLCanvasElement.
     * @property canvas
     * @private
     * @type Object
     */
    //var canvas = null;
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
    //this.getName = function() { return name; };
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
    this.getOffset = function() { return canvas.offset(); };

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
    
    var trans = {'x': 0, 'y': 0};
    
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
        trans.x = tx;
        trans.y = ty;
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
        trans.x = 0;
        trans.y = 0;
    };
    
    /**
     * Transform a display position to an index.
     * @method displayToIndex
     */ 
    this.displayToIndex = function ( point2D ) {
        return {'x': ( (point2D.x - origin.x) / zoom.x ) - trans.x,
            'y': ( (point2D.y - origin.y) / zoom.y ) - trans.y};
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
        context.setTransform( zoom.x, 0, 0, zoom.y, 
            origin.x + (trans.x * zoom.x), 
            origin.y + (trans.y * zoom.y) );
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
        //canvas = document.getElementById(name);
        //if (!canvas)
        //{
        //    alert("Error: cannot find the canvas element for '" + name + "'.");
        //    return;
        //}
        // check that the getContext method exists
        if (!canvas.getContext)
        {
            alert("Error: no canvas.getContext method.");
            return;
        }
        // get the 2D context
        context = canvas.getContext('2d');
        if (!context)
        {
            alert("Error: failed to get the 2D context.");
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
     * Set the line colour for the layer.
     * @method setLineColour
     * @input {String} colour The line colour.
     */
    this.setLineColour = function(colour)
    {
        context.fillStyle = colour;
        context.strokeStyle = colour;
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

/**
 * Get the offset of an input event.
 * @method getEventOffset
 * @static
 * @param {Object} event The event to get the offset from.
 * @return {Array} The array of offsets.
 */
dwv.html.getEventOffset = function (event) {
    var positions = [];
    var ex = 0;
    var ey = 0;
    if ( event.targetTouches ) {
        // get the touch offset from all its parents
        var offsetLeft = 0;
        var offsetTop = 0;
        var offsetParent = event.targetTouches[0].target.offsetParent;
        while ( offsetParent ) {
            if (!isNaN(offsetParent.offsetLeft)) {
                offsetLeft += offsetParent.offsetLeft;
            }
            if (!isNaN(offsetParent.offsetTop)) {
                offsetTop += offsetParent.offsetTop;
            }
            offsetParent = offsetParent.offsetParent;
        }
        // set its position
        var touch = null;
        for ( var i = 0 ; i < event.targetTouches.length; ++i ) {
            touch = event.targetTouches[i];
            ex = touch.pageX - offsetLeft;
            ey = touch.pageY - offsetTop;
            positions.push({'x': ex, 'y': ey});
        }
    }
    else {
        // layerX is used by Firefox
        ex = event.offsetX === undefined ? event.layerX : event.offsetX;
        ey = event.offsetY === undefined ? event.layerY : event.offsetY;
        positions.push({'x': ex, 'y': ey});
    }
    return positions;
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
 * Loadbox base gui.
 * @class Loadbox
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Loadbox = function (app, loaders)
{
    /**
     * Setup the loadbox HTML.
     * @method setup
     */
    this.setup = function ()
    {
        // loader select
        var loaderSelector = dwv.html.createHtmlSelect("loaderSelect", app.getLoaders());
        loaderSelector.onchange = app.onChangeLoader;
        
        // node
        var node = app.getElement("loaderlist");
        // clear it
        while(node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
        // append
        node.appendChild(loaderSelector);
        // refresh
        dwv.gui.refreshElement(node);
    };
    
    /**
     * Display a loader.
     * @param {String} name The name of the loader to show.
     */
    this.displayLoader = function (name)
    {
        var keys = Object.keys(loaders);
        for ( var i = 0; i < keys.length; ++i ) {
            if ( keys[i] === name ) {
                loaders[keys[i]].display(true);
            }
            else {
                loaders[keys[i]].display(false);
            }
        }
    };
    
}; // class dwv.gui.base.Loadbox

/**
 * FileLoad base gui.
 * @class FileLoad
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.FileLoad = function (app)
{
    /**
     * Setup the file load HTML to the page.
     * @method setup
     */
    this.setup = function()
    {
        // input
        var fileLoadInput = document.createElement("input");
        fileLoadInput.onchange = app.onChangeFiles;
        fileLoadInput.type = "file";
        fileLoadInput.multiple = true;
        fileLoadInput.className = "imagefiles";
        fileLoadInput.setAttribute("data-clear-btn","true");
        fileLoadInput.setAttribute("data-mini","true");
    
        // associated div
        var fileLoadDiv = document.createElement("div");
        fileLoadDiv.className = "imagefilesdiv";
        fileLoadDiv.style.display = "none";
        fileLoadDiv.appendChild(fileLoadInput);
        
        // node
        var node = app.getElement("loaderlist");
        // append
        node.appendChild(fileLoadDiv);
        // refresh
        dwv.gui.refreshElement(node);
    };
    
    /**
     * Display the file load HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // file div element
        var node = app.getElement("loaderlist");
        var filediv = node.getElementsByClassName("imagefilesdiv")[0];
        filediv.style.display = bool ? "" : "none";
    };
    
}; // class dwv.gui.base.FileLoad

/**
 * FileLoad base gui.
 * @class FileLoad
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.UrlLoad = function (app)
{
    /**
     * Setup the url load HTML to the page.
     * @method setup
     */
    this.setup = function ()
    {
        // input
        var urlLoadInput = document.createElement("input");
        urlLoadInput.onchange = app.onChangeURL;
        urlLoadInput.type = "url";
        urlLoadInput.className = "imageurl";
        urlLoadInput.setAttribute("data-clear-btn","true");
        urlLoadInput.setAttribute("data-mini","true");
    
        // associated div
        var urlLoadDiv = document.createElement("div");
        urlLoadDiv.className = "imageurldiv";
        urlLoadDiv.style.display = "none";
        urlLoadDiv.appendChild(urlLoadInput);
    
        // node
        var node = app.getElement("loaderlist");
        // append
        node.appendChild(urlLoadDiv);
        // refresh
        dwv.gui.refreshElement(node);
    };
    
    /**
     * Display the url load HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // url div element
        var node = app.getElement("loaderlist");
        var urldiv = node.getElementsByClassName("imageurldiv")[0];
        urldiv.style.display = bool ? "" : "none";
    };

}; // class dwv.gui.base.UrlLoad
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
dwv.html.Style = function ()
{
    /**
     * Font size.
     * @property fontSize
     * @private
     * @type Number
     */
    var fontSize = 12;
    /**
     * Font family.
     * @property fontFamily
     * @private
     * @type String
     */
    var fontFamily = "Verdana";
    /**
     * Text colour.
     * @property textColour
     * @private
     * @type String
     */
    var textColour = "#fff";
    /**
     * Line colour.
     * @property lineColour
     * @private
     * @type String
     */
    var lineColour = "";
    /**
     * Display scale.
     * @property scale
     * @private
     * @type Number
     */
    var displayScale = 1;
    /**
     * Stroke width.
     * @property strokeWidth
     * @private
     * @type Number
     */
    var strokeWidth = 2;
    
    /**
     * Get the font family.
     * @method getFontFamily
     * @return {String} The font family.
     */
    this.getFontFamily = function () { return fontFamily; };

    /**
     * Get the font size.
     * @method getFontSize
     * @return {Number} The font size.
     */
    this.getFontSize = function () { return fontSize; };
    
    /**
     * Get the stroke width.
     * @method getStrokeWidth
     * @return {Number} The stroke width.
     */
    this.getStrokeWidth = function () { return strokeWidth; };

    /**
     * Get the text colour.
     * @method getTextColour
     * @return {String} The text colour.
     */
    this.getTextColour = function () { return textColour; };

    /**
     * Get the line colour.
     * @method getLineColour
     * @return {String} The line colour.
     */
    this.getLineColour = function () { return lineColour; };

    /**
     * Set the line colour.
     * @method setLineColour
     * @param {String} colour The line colour.
     */
    this.setLineColour = function (colour) { lineColour = colour; };

    /**
     * Set the display scale.
     * @method setScale
     * @param {String} scale The display scale.
     */
    this.setScale = function (scale) { displayScale = scale; };
    
    /**
     * Scale an input value.
     * @method scale
     * @param {Number} value The value to scale.
     */
    this.scale = function (value) { return value / displayScale; };
};

/**
 * Get the font definition string.
 * @method getFontStr
 * @return {String} The font definition string.
 */
dwv.html.Style.prototype.getFontStr = function ()
{
    return ("normal " + this.getFontSize() + "px sans-serif"); 
};

/**
 * Get the line height.
 * @method getLineHeight
 * @return {Number} The line height.
 */
dwv.html.Style.prototype.getLineHeight = function ()
{
    return ( this.getFontSize() + this.getFontSize() / 5 ); 
};

/**
 * Get the font size scaled to the display.
 * @method getScaledFontSize
 * @return {Number} The scaled font size.
 */
dwv.html.Style.prototype.getScaledFontSize = function () 
{ 
    return this.scale( this.getFontSize() );
};

/**
 * Get the stroke width scaled to the display.
 * @method getScaledStrokeWidth
 * @return {Number} The scaled stroke width.
 */
dwv.html.Style.prototype.getScaledStrokeWidth = function () 
{ 
    return this.scale( this.getStrokeWidth() ); 
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
 * Toolbox base gui.
 * @class Toolbox
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Toolbox = function (app)
{
    /**
     * Setup the toolbox HTML.
     * @method setup
     */
    this.setup = function (list)
    {
        // tool select
        var toolSelector = dwv.html.createHtmlSelect("toolSelect", list);
        toolSelector.onchange = app.onChangeTool;
        
        // tool list element
        var toolLi = document.createElement("li");
        toolLi.className = "toolLi ui-block-a";
        toolLi.style.display = "none";
        toolLi.appendChild(toolSelector);

        // tool ul
        var toolUl = document.createElement("ul");
        toolUl.appendChild(toolLi);
        toolUl.className = "ui-grid-b"; 

        // node
        var node = app.getElement("toolList");
        // append
        node.appendChild(toolUl);
        // refresh
        dwv.gui.refreshElement(node);
    };
    
    /**
     * Display the toolbox HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // tool list element
        var node = app.getElement("toolLi");
        dwv.html.displayElement(node, bool);
    };
    
    /**
     * Initialise the toolbox HTML.
     * @method initialise
     */
    this.initialise = function (displays)
    {
        // tool select: reset selected option
        var toolSelector = app.getElement("toolSelect");
        
        // update list
        var options = toolSelector.options;
        var selectedIndex = -1;
        for ( var i = 0; i < options.length; ++i ) {
            if ( !displays[i] ) {
                options[i].style.display = "none";
            }
            else {
                if ( selectedIndex === -1 ) {
                    selectedIndex = i;
                }
                options[i].style.display = "";
            }
        }
        toolSelector.selectedIndex = selectedIndex;
        
        // refresh
        dwv.gui.refreshElement(toolSelector);
    };
    
}; // dwv.gui.base.Toolbox

/**
 * WindowLevel tool base gui.
 * @class WindowLevel
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.WindowLevel = function (app)
{
    /**
     * Setup the tool HTML.
     * @method setup
     */
    this.setup = function ()
    {
        // preset select
        var wlSelector = dwv.html.createHtmlSelect("presetSelect", []);
        wlSelector.onchange = app.onChangeWindowLevelPreset;
        // colour map select
        var cmSelector = dwv.html.createHtmlSelect("colourMapSelect", dwv.tool.colourMaps);
        cmSelector.onchange = app.onChangeColourMap;
    
        // preset list element
        var wlLi = document.createElement("li");
        wlLi.className = "wlLi ui-block-b";
        //wlLi.className = "wlLi";
        wlLi.style.display = "none";
        wlLi.appendChild(wlSelector);
        // colour map list element
        var cmLi = document.createElement("li");
        cmLi.className = "cmLi ui-block-c";
        //cmLi.className = "cmLi";
        cmLi.style.display = "none";
        cmLi.appendChild(cmSelector);
    
        // node
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        // append preset
        node.appendChild(wlLi);
        // append colour map
        node.appendChild(cmLi);
        // refresh
        dwv.gui.refreshElement(node);
    };
    
    /**
     * Display the tool HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // presets list element
        var node = app.getElement("wlLi");
        dwv.html.displayElement(node, bool);
        // colour map list element
        node = app.getElement("cmLi");
        dwv.html.displayElement(node, bool);
    };
    
    /**
     * Initialise the tool HTML.
     * @method initialise
     */
    this.initialise = function ()
    {
        // create new preset select
        var wlSelector = dwv.html.createHtmlSelect("presetSelect", app.getViewController().getPresets());
        wlSelector.onchange = app.onChangeWindowLevelPreset;
        wlSelector.title = "Select w/l preset.";
        
        // copy html list
        var wlLi = app.getElement("wlLi");
        // clear node
        dwv.html.cleanNode(wlLi);
        // add children
        wlLi.appendChild(wlSelector);
        // refresh
        dwv.gui.refreshElement(wlLi);
        
        // colour map select
        var cmSelector = app.getElement("colourMapSelect");
        cmSelector.selectedIndex = 0;
        // special monochrome1 case
        if( app.getImage().getPhotometricInterpretation() === "MONOCHROME1" )
        {
            cmSelector.selectedIndex = 1;
        }
        // refresh
        dwv.gui.refreshElement(cmSelector);
    };
    
}; // class dwv.gui.base.WindowLevel

/**
 * Draw tool base gui.
 * @class Draw
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Draw = function (app)
{
    // default colours
    var colours = [
       "Yellow", "Red", "White", "Green", "Blue", "Lime", "Fuchsia", "Black"
    ];
    /**
     * Get the available colours.
     * @method getColours
     */
    this.getColours = function () { return colours; };
    
    /**
     * Setup the tool HTML.
     * @method setup
     */
    this.setup = function (shapeList)
    {
        // shape select
        var shapeSelector = dwv.html.createHtmlSelect("shapeSelect", shapeList);
        shapeSelector.onchange = app.onChangeShape;
        // colour select
        var colourSelector = dwv.html.createHtmlSelect("colourSelect", colours);
        colourSelector.onchange = app.onChangeLineColour;
    
        // shape list element
        var shapeLi = document.createElement("li");
        shapeLi.className = "shapeLi ui-block-c";
        shapeLi.style.display = "none";
        shapeLi.appendChild(shapeSelector);
        //shapeLi.setAttribute("class","ui-block-c");
        // colour list element
        var colourLi = document.createElement("li");
        colourLi.className = "colourLi ui-block-b";
        colourLi.style.display = "none";
        colourLi.appendChild(colourSelector);
        //colourLi.setAttribute("class","ui-block-b");
        
        // node
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        // apend shape
        node.appendChild(shapeLi);
        // append colour
        node.appendChild(colourLi);
        // refresh
        dwv.gui.refreshElement(node);
    };

    /**
     * Display the tool HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // colour list element
        var node = app.getElement("colourLi");
        dwv.html.displayElement(node, bool);
        // shape list element
        node = app.getElement("shapeLi");
        dwv.html.displayElement(node, bool);
    };
    
    /**
     * Initialise the tool HTML.
     * @method initialise
     */
    this.initialise = function ()
    {
        // shape select: reset selected option
        var shapeSelector = app.getElement("shapeSelect");
        shapeSelector.selectedIndex = 0;
        // refresh
        dwv.gui.refreshElement(shapeSelector);
        
        // colour select: reset selected option
        var colourSelector = app.getElement("colourSelect");
        colourSelector.selectedIndex = 0;
        // refresh
        dwv.gui.refreshElement(colourSelector);
    };
    
}; // class dwv.gui.base.Draw

/**
 * Livewire tool base gui.
 * @class Livewire
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Livewire = function (app)
{
    // default colours
    var colours = [
       "Yellow", "Red", "White", "Green", "Blue", "Lime", "Fuchsia", "Black"
    ];
    /**
     * Get the available colours.
     * @method getColours
     */
    this.getColours = function () { return colours; };

    /**
     * Setup the tool HTML.
     * @method setup
     */
    this.setup = function ()
    {
        // colour select
        var colourSelector = dwv.html.createHtmlSelect("lwColourSelect", colours);
        colourSelector.onchange = app.onChangeLineColour;
        
        // colour list element
        var colourLi = document.createElement("li");
        colourLi.className = "lwColourLi ui-block-b";
        colourLi.style.display = "none";
        //colourLi.setAttribute("class","ui-block-b");
        colourLi.appendChild(colourSelector);
        
        // node
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        // apend colour
        node.appendChild(colourLi);
        // refresh
        dwv.gui.refreshElement(node);
    };
    
    /**
     * Display the tool HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // colour list
        var node = app.getElement("lwColourLi");
        dwv.html.displayElement(node, bool);
    };
    
    /**
     * Initialise the tool HTML.
     * @method initialise
     */
    this.initialise = function ()
    {
        var colourSelector = app.getElement("lwColourSelect");
        colourSelector.selectedIndex = 0;
        dwv.gui.refreshElement(colourSelector);
    };
    
}; // class dwv.gui.base.Livewire

/**
 * ZoomAndPan tool base gui.
 * @class ZoomAndPan
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.ZoomAndPan = function (app)
{
    /**
     * Setup the tool HTML.
     * @method setup
     */
    this.setup = function()
    {
        // reset button
        var button = document.createElement("button");
        button.className = "zoomResetButton";
        button.name = "zoomResetButton";
        button.onclick = app.onZoomReset;
        button.setAttribute("style","width:100%; margin-top:0.5em;");
        button.setAttribute("class","ui-btn ui-btn-b");
        var text = document.createTextNode("Reset");
        button.appendChild(text);
        
        // list element
        var liElement = document.createElement("li");
        liElement.className = "zoomLi ui-block-c";
        liElement.style.display = "none";
        //liElement.setAttribute("class","ui-block-c");
        liElement.appendChild(button);
        
        // node
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        // append element
        node.appendChild(liElement);
        // refresh
        dwv.gui.refreshElement(node);
    };
    
    /**
     * Display the tool HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function(bool)
    {
        // display list element
        var node = app.getElement("zoomLi");
        dwv.html.displayElement(node, bool);
    };
    
}; // class dwv.gui.base.ZoomAndPan

/**
 * Scroll tool base gui.
 * @class Scroll
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Scroll = function (app)
{
    /**
     * Setup the tool HTML.
     * @method setup
     */
    this.setup = function()
    {
        // list element
        var liElement = document.createElement("li");
        liElement.className = "scrollLi ui-block-c";
        liElement.style.display = "none";
        
        // node
        var node = app.getElement("toolList").getElementsByTagName("ul")[0];
        // append element
        node.appendChild(liElement);
        // refresh
        dwv.gui.refreshElement(node);
    };
    
    /**
     * Display the tool HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function(bool)
    {
        // display list element
        var node = app.getElement("scrollLi");
        dwv.html.displayElement(node, bool);
    };
    
}; // class dwv.gui.base.Scroll
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
 * Undo base gui.
 * @class Undo
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Undo = function (app)
{
    /**
     * Setup the undo HTML.
     * @method setup
     * @static
     */
    this.setup = function ()
    {
        var paragraph = document.createElement("p");  
        paragraph.appendChild(document.createTextNode("History:"));
        paragraph.appendChild(document.createElement("br"));
        
        var select = document.createElement("select");
        select.className = "history_list";
        select.name = "history_list";
        select.multiple = "multiple";
        paragraph.appendChild(select);
    
        // node
        var node = app.getElement("history");
        // clear it
        while(node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
        // append
        node.appendChild(paragraph);
        // refresh
        dwv.gui.refreshElement(node);
    };
    
    /**
     * Clear the command list of the undo HTML.
     * @method cleanUndoHtml
     */
    this.initialise = function ()
    {
        var select = app.getElement("history_list");
        if ( select && select.length !== 0 ) {
            for( var i = select.length - 1; i >= 0; --i)
            {
                select.remove(i);
            }
        }
        // refresh
        dwv.gui.refreshElement(select);
    };
    
    /**
     * Add a command to the undo HTML.
     * @method addCommandToUndoHtml
     * @param {String} commandName The name of the command to add.
     */
    this.addCommandToUndoHtml = function (commandName)
    {
        var select = app.getElement("history_list");
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
        // refresh
        dwv.gui.refreshElement(select);
    };
    
    /**
     * Enable the last command of the undo HTML.
     * @method enableInUndoHtml
     * @param {Boolean} enable Flag to enable or disable the command.
     */
    this.enableInUndoHtml = function (enable)
    {
        var select = app.getElement("history_list");
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
        // refresh
        dwv.gui.refreshElement(select);
    };

}; // class dwv.gui.base.Undo
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
     * Threshold maximum.
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
    
    /**
     * Original image.
     * @property originalImage
     * @private
     * @type Object
     */
    var originalImage = null;
    /**
     * Set the original image.
     * @method setOriginalImage
     * @param {Object} image The original image.
     */
    this.setOriginalImage = function (image) { originalImage = image; };
    /**
     * Get the original image.
     * @method getOriginalImage
     * @return {Object} image The original image.
     */
    this.getOriginalImage = function () { return originalImage; };
};

/**
 * Transform the main image using this filter.
 * @method update
 * @return {Object} The transformed image.
 */ 
dwv.image.filter.Threshold.prototype.update = function ()
{
    var image = this.getOriginalImage();
    var imageMin = image.getDataRange().min;
    var self = this;
    var threshFunction = function (value) {
        if ( value < self.getMin() || value > self.getMax() ) {
            return imageMin;
        }
        else {
            return value;
        }
    };
    return image.transform( threshFunction );
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
    /**
     * Original image.
     * @property originalImage
     * @private
     * @type Object
     */
    var originalImage = null;
    /**
     * Set the original image.
     * @method setOriginalImage
     * @param {Object} image The original image.
     */
    this.setOriginalImage = function (image) { originalImage = image; };
    /**
     * Get the original image.
     * @method getOriginalImage
     * @return {Object} image The original image.
     */
    this.getOriginalImage = function () { return originalImage; };
};

/**
 * Transform the main image using this filter.
 * @method update
 * @return {Object} The transformed image.
 */ 
dwv.image.filter.Sharpen.prototype.update = function()
{
    var image = this.getOriginalImage();
    
    return image.convolute2D(
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
    /**
     * Original image.
     * @property originalImage
     * @private
     * @type Object
     */
    var originalImage = null;
    /**
     * Set the original image.
     * @method setOriginalImage
     * @param {Object} image The original image.
     */
    this.setOriginalImage = function (image) { originalImage = image; };
    /**
     * Get the original image.
     * @method getOriginalImage
     * @return {Object} image The original image.
     */
    this.getOriginalImage = function () { return originalImage; };
};

/**
 * Transform the main image using this filter.
 * @method update
 * @return {Object} The transformed image.
 */ 
dwv.image.filter.Sobel.prototype.update = function()
{
    var image = this.getOriginalImage();
    
    var gradX = image.convolute2D(
        [ 1,  0,  -1,
          2,  0,  -2,
          1,  0,  -1 ] );

    var gradY = image.convolute2D(
        [  1,  2,  1,
           0,  0,  0,
          -1, -2, -1 ] );
    
    return gradX.compose( gradY, function (x,y) { return Math.sqrt(x*x+y*y); } );
};

;/** 
 * Image module.
 * @module image
 */
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * 2D/3D Size class.
 * @class Size
 * @namespace dwv.image
 * @constructor
 * @param {Number} numberOfColumns The number of columns.
 * @param {Number} numberOfRows The number of rows.
 * @param {Number} numberOfSlices The number of slices.
*/
dwv.image.Size = function ( numberOfColumns, numberOfRows, numberOfSlices )
{
    /**
     * Get the number of columns.
     * @method getNumberOfColumns
     * @return {Number} The number of columns.
     */ 
    this.getNumberOfColumns = function () { return numberOfColumns; };
    /**
     * Get the number of rows.
     * @method getNumberOfRows
     * @return {Number} The number of rows.
     */ 
    this.getNumberOfRows = function () { return numberOfRows; };
    /**
     * Get the number of slices.
     * @method getNumberOfSlices
     * @return {Number} The number of slices.
     */ 
    this.getNumberOfSlices = function () { return (numberOfSlices || 1.0); };
};

/**
 * Get the size of a slice.
 * @method getSliceSize
 * @return {Number} The size of a slice.
 */ 
dwv.image.Size.prototype.getSliceSize = function () {
    return this.getNumberOfColumns() * this.getNumberOfRows();
};

/**
 * Get the total size.
 * @method getTotalSize
 * @return {Number} The total size.
 */ 
dwv.image.Size.prototype.getTotalSize = function () {
    return this.getSliceSize() * this.getNumberOfSlices();
};

/**
 * Check for equality.
 * @method equals
 * @param {Size} rhs The object to compare to.
 * @return {Boolean} True if both objects are equal.
 */ 
dwv.image.Size.prototype.equals = function (rhs) {
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
dwv.image.Size.prototype.isInBounds = function ( i, j, k ) {
    if( i < 0 || i > this.getNumberOfColumns() - 1 ||
        j < 0 || j > this.getNumberOfRows() - 1 ||
        k < 0 || k > this.getNumberOfSlices() - 1 ) {
        return false;
    }
    return true;
};

/**
 * 2D/3D Spacing class. 
 * @class Spacing
 * @namespace dwv.image
 * @constructor
 * @param {Number} columnSpacing The column spacing.
 * @param {Number} rowSpacing The row spacing.
 * @param {Number} sliceSpacing The slice spacing.
 */
dwv.image.Spacing = function ( columnSpacing, rowSpacing, sliceSpacing )
{
    /**
     * Get the column spacing.
     * @method getColumnSpacing
     * @return {Number} The column spacing.
     */ 
    this.getColumnSpacing = function () { return columnSpacing; };
    /**
     * Get the row spacing.
     * @method getRowSpacing
     * @return {Number} The row spacing.
     */ 
    this.getRowSpacing = function () { return rowSpacing; };
    /**
     * Get the slice spacing.
     * @method getSliceSpacing
     * @return {Number} The slice spacing.
     */ 
    this.getSliceSpacing = function () { return (sliceSpacing || 1.0); };
};

/**
 * Check for equality.
 * @method equals
 * @param {Spacing} rhs The object to compare to.
 * @return {Boolean} True if both objects are equal.
 */ 
dwv.image.Spacing.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getColumnSpacing() === rhs.getColumnSpacing() &&
        this.getRowSpacing() === rhs.getRowSpacing() &&
        this.getSliceSpacing() === rhs.getSliceSpacing();
};

/**
 * 2D/3D Geometry class. 
 * @class Geometry
 * @namespace dwv.image
 * @constructor
 * @param {Object} origin The object origin.
 * @param {Object} size The object size.
 * @param {Object} spacing The object spacing.
 */
dwv.image.Geometry = function ( origin, size, spacing )
{
    // check input origin.
    if( typeof(origin) === 'undefined' ) {
        origin = new dwv.math.Point3D(0,0,0);
    }
    var origins = [origin];
    
    /**
     * Get the object first origin.
     * @method getOrigin
     * @return {Object} The object first origin.
     */ 
    this.getOrigin = function () { return origin; };
    /**
     * Get the object origins.
     * @method getOrigins
     * @return {Array} The object origins.
     */ 
    this.getOrigins = function () { return origins; };
    /**
     * Get the object size.
     * @method getSize
     * @return {Object} The object size.
     */ 
    this.getSize = function () { return size; };
    /**
     * Get the object spacing.
     * @method getSpacing
     * @return {Object} The object spacing.
     */ 
    this.getSpacing = function () { return spacing; };
    
    /**
     * Get the slice position of a point in the current slice layout.
     * @method getSliceIndex
     * @param {Object} point The point to evaluate.
     */
    this.getSliceIndex = function (point)
    {
        // cannot use this.worldToIndex(point).getK() since
        // we cannot guaranty consecutive slices...
        
        // find the closest index
        var closestSliceIndex = 0;
        var minDiff = Math.abs( origins[0].getZ() - point.getZ() );
        var diff = 0;
        for( var i = 0; i < origins.length; ++i )
        {
            diff = Math.abs( origins[i].getZ() - point.getZ() );
            if( diff < minDiff ) 
            {
                minDiff = diff;
                closestSliceIndex = i;
            }
        }
        diff = origins[closestSliceIndex].getZ() - point.getZ();
        var sliceIndex = ( diff > 0 ) ? closestSliceIndex : closestSliceIndex + 1;
        return sliceIndex;
    };
    
    /**
     * Append an origin to the geometry.
     * @param {Object} origin The origin to append.
     * @param {Number} index The index at which to append.
     */
    this.appendOrigin = function (origin, index)
    {
        // add in origin array
        origins.splice(index, 0, origin);
        // increment slice number
        size = new dwv.image.Size(
            size.getNumberOfColumns(),
            size.getNumberOfRows(),
            size.getNumberOfSlices() + 1);
    };

};

/**
 * Check for equality.
 * @method equals
 * @param {Geometry} rhs The object to compare to.
 * @return {Boolean} True if both objects are equal.
 */ 
dwv.image.Geometry.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getOrigin() === rhs.getOrigin() &&
        this.getSize() === rhs.getSize() &&
        this.getSpacing() === rhs.getSpacing();
};

/**
 * Convert an index to an offset in memory.
 * @param {Object} index The index to convert.
 */
dwv.image.Geometry.prototype.indexToOffset = function (index) {
    var size = this.getSize();
    return index.getI() +
       index.getJ() * size.getNumberOfColumns() +
       index.getK() * size.getSliceSize();
};

/**
 * Convert an index into world coordinates.
 * @param {Object} index The index to convert.
 */
dwv.image.Geometry.prototype.indexToWorld = function (index) {
    var origin = this.getOrigin();
    var spacing = this.getSpacing();
    return new dwv.math.Point3D(
        origin.getX() + index.getI() * spacing.getColumnSpacing(),
        origin.getY() + index.getJ() * spacing.getRowSpacing(),
        origin.getZ() + index.getK() * spacing.getSliceSpacing() );
};

/**
 * Convert world coordinates into an index.
 * @param {Object} THe point to convert.
 */
dwv.image.Geometry.prototype.worldToIndex = function (point) {
    var origin = this.getOrigin();
    var spacing = this.getSpacing();
    return new dwv.math.Point3D(
        point.getX() / spacing.getColumnSpacing() - origin.getX(),
        point.getY() / spacing.getRowSpacing() - origin.getY(),
        point.getZ() / spacing.getSliceSpacing() - origin.getZ() );
};
;/** 
 * Image module.
 * @module image
 */
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Rescale Slope and Intercept
 * @class RescaleSlopeAndIntercept
 * @namespace dwv.image
 * @constructor
 * @param slope
 * @param intercept
 */
dwv.image.RescaleSlopeAndIntercept = function (slope, intercept)
{
    /*// Check the rescale slope.
    if(typeof(slope) === 'undefined') {
        slope = 1;
    }
    // Check the rescale intercept.
    if(typeof(intercept) === 'undefined') {
        intercept = 0;
    }*/
    
    /**
     * Get the slope of the RSI.
     * @method getSlope
     * @return {Number} The slope of the RSI.
     */ 
    this.getSlope = function ()
    {
        return slope;
    };
    /**
     * Get the intercept of the RSI.
     * @method getIntercept
     * @return {Number} The intercept of the RSI.
     */ 
    this.getIntercept = function ()
    {
        return intercept;
    };
    /**
     * Apply the RSI on an input value.
     * @method apply
     * @return {Number} The value to rescale.
     */ 
    this.apply = function (value)
    {
        return value * slope + intercept;
    };
};

/** 
 * Check for RSI equality.
 * @method equals
 * @param {Object} rhs The other RSI to compare to.
 * @return {Boolean} True if both RSI are equal.
 */ 
dwv.image.RescaleSlopeAndIntercept.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getSlope() === rhs.getSlope() &&
        this.getIntercept() === rhs.getIntercept();
};

/** 
 * Get a string representation of the RSI.
 * @method toString
 * @return {String} The RSI as a string.
 */ 
dwv.image.RescaleSlopeAndIntercept.prototype.toString = function () {
    return (this.getSlope() + ", " + this.getIntercept());
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
 * @param {Object} geometry The geometry of the image.
 * @param {Array} buffer The image data.
 */
dwv.image.Image = function(geometry, buffer)
{
    /**
     * Rescale slope and intercept.
     * @property rsi
     * @private
     * @type Number
     */
    var rsis = [];
    for ( var s = 0; s < geometry.getSize().getNumberOfSlices(); ++s ) {
        rsis.push( new dwv.image.RescaleSlopeAndIntercept( 1, 0 ) );
    }
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
    var numberOfComponents = buffer.length / geometry.getSize().getTotalSize();
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
    
    /**
     * Data range.
     * @property dataRange
     * @private
     * @type Object
     */
    var dataRange = null;
    /**
     * Rescaled data range.
     * @property rescaledDataRange
     * @private
     * @type Object
     */
    var rescaledDataRange = null;
    /**
     * Histogram.
     * @property histogram
     * @private
     * @type Array
     */
    var histogram = null;
     
    /**
     * Get the geometry of the image.
     * @method getGeometry
     * @return {Object} The size of the image.
     */ 
    this.getGeometry = function() { return geometry; };
    /**
     * Get the data buffer of the image. TODO dangerous...
     * @method getBuffer
     * @return {Array} The data buffer of the image.
     */ 
    this.getBuffer = function() { return buffer; };
    
    /**
     * Get the rescale slope and intercept.
     * @method getRescaleSlopeAndIntercept
     * @return {Object} The rescale slope and intercept.
     */ 
    this.getRescaleSlopeAndIntercept = function(k) { return rsis[k]; };
    /**
     * Set the rescale slope and intercept.
     * @method setRescaleSlopeAndIntercept
     * @param {Object} rsi The rescale slope and intercept.
     */ 
    this.setRescaleSlopeAndIntercept = function(inRsi, k) { 
        if ( typeof k === 'undefined' ) {
            k = 0;
        }
        rsis[k] = inRsi; 
    };
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
        var copy = new dwv.image.Image(this.getGeometry(), originalBuffer);
        var nslices = this.getGeometry().getSize().getNumberOfSlices();
        for ( var k = 0; k < nslices; ++k ) {
            copy.setRescaleSlopeAndIntercept(this.getRescaleSlopeAndIntercept(k), k);
        }
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
        var rhsSize = rhs.getGeometry().getSize();
        var size = geometry.getSize();
        if( rhsSize.getNumberOfSlices() !== 1 ) {
            throw new Error("Cannot append more than one slice");
        }
        if( size.getNumberOfColumns() !== rhsSize.getNumberOfColumns() ) {
            throw new Error("Cannot append a slice with different number of columns");
        }
        if( size.getNumberOfRows() !== rhsSize.getNumberOfRows() ) {
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
        
        // calculate slice size
        var mul = 1;
        if( photometricInterpretation === "RGB" ) {
            mul = 3;
        }
        var sliceSize = mul * size.getSliceSize();
        
        // create the new buffer
        var newBuffer = new Int16Array(sliceSize * (size.getNumberOfSlices() + 1) );
        
        // append slice at new position
        var newSliceNb = geometry.getSliceIndex( rhs.getGeometry().getOrigin() );
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
        
        // update geometry
        geometry.appendOrigin( rhs.getGeometry().getOrigin(), newSliceNb );
        // update rsi
        rsis.splice(newSliceNb, 0, rhs.getRescaleSlopeAndIntercept(0));
        
        // copy to class variables
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
     * Get the rescaled data range.
     * @method getRescaledDataRange
     * @return {Object} The rescaled data range.
     */ 
    this.getRescaledDataRange = function() { 
        if( !rescaledDataRange ) {
            rescaledDataRange = this.calculateRescaledDataRange();
        }
        return rescaledDataRange;
    };

    /**
     * Get the histogram.
     * @method getHistogram
     * @return {Array} The histogram.
     */ 
    this.getHistogram = function() { 
        if( !histogram ) {
            var res = this.calculateHistogram();
            dataRange = res.dataRange;
            rescaledDataRange = res.rescaledDataRange;
            histogram = res.histogram;
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
    var index = new dwv.math.Index3D(i,j,k);
    return this.getValueAtOffset( this.getGeometry().indexToOffset(index) );
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
    return this.getRescaleSlopeAndIntercept(k).apply( this.getValue(i,j,k) );
};

/**
 * Calculate the data range of the image.
 * @method calculateDataRange
 * @return {Object} The range {min, max}.
 */
dwv.image.Image.prototype.calculateDataRange = function ()
{
    var size = this.getGeometry().getSize().getTotalSize();
    var min = this.getValueAtOffset(0);
    var max = min;
    var value = 0;
    for ( var i = 0; i < size; ++i ) {    
        value = this.getValueAtOffset(i);
        if( value > max ) { max = value; }
        if( value < min ) { min = value; }
    }
    // return
    return { "min": min, "max": max };
};

/**
 * Calculate the rescaled data range of the image.
 * @method calculateRescaledDataRange
 * @return {Object} The range {min, max}.
 */
dwv.image.Image.prototype.calculateRescaledDataRange = function ()
{
    var size = this.getGeometry().getSize();
    var rmin = this.getRescaledValue(0,0,0);
    var rmax = rmin;
    var rvalue = 0;
    for ( var k = 0; k < size.getNumberOfSlices(); ++k ) {    
        for ( var j = 0; j < size.getNumberOfRows(); ++j ) {    
            for ( var i = 0; i < size.getNumberOfColumns(); ++i ) {    
                rvalue = this.getRescaledValue(i,j,k);
                if( rvalue > rmax ) { rmax = rvalue; }
                if( rvalue < rmin ) { rmin = rvalue; }
            }
        }
    }
    // return
    return { "min": rmin, "max": rmax };
};

/**
 * Calculate the histogram of the image.
 * @method calculateHistogram
 * @return {Object} The histogram, data range and rescaled data range.
 */
dwv.image.Image.prototype.calculateHistogram = function ()
{
    var size = this.getGeometry().getSize();
    var histo = [];
    var min = this.getValue(0,0,0);
    var max = min;
    var value = 0;
    var rmin = this.getRescaledValue(0,0,0);
    var rmax = rmin;
    var rvalue = 0;
    for ( var k = 0; k < size.getNumberOfSlices(); ++k ) {    
        for ( var j = 0; j < size.getNumberOfRows(); ++j ) {    
            for ( var i = 0; i < size.getNumberOfColumns(); ++i ) {    
                value = this.getValue(i,j,k);
                if( value > max ) { max = value; }
                if( value < min ) { min = value; }
                rvalue = this.getRescaleSlopeAndIntercept(k).apply(value);
                if( rvalue > rmax ) { rmax = rvalue; }
                if( rvalue < rmin ) { rmin = rvalue; }
                histo[rvalue] = ( histo[rvalue] || 0 ) + 1;
            }
        }
    }
    // set data range
    var dataRange = { "min": min, "max": max };
    var rescaledDataRange = { "min": rmin, "max": rmax };
    // generate data for plotting
    var histogram = [];
    for ( var b = rmin; b <= rmax; ++b ) {    
        histogram.push([b, ( histo[b] || 0 ) ]);
    }
    // return
    return { 'dataRange': dataRange, 'rescaledDataRange': rescaledDataRange,
        'histogram': histogram };
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

    var imgSize = this.getGeometry().getSize();
    var ncols = imgSize.getNumberOfColumns();
    var nrows = imgSize.getNumberOfRows();
    var nslices = imgSize.getNumberOfSlices();
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
            componentOffset = imgSize.getTotalSize();
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
                    else if( i === 0 && j === (nrows-1)  ) {
                        wOffFinal = wOff0n;
                    }
                    else if( i === (ncols-1) && j === 0 ) {
                        wOffFinal = wOffn0;
                    }
                    else if( i === (ncols-1) && j === (nrows-1) ) {
                        wOffFinal = wOffnn;
                    }
                    else if( i === 0 && j !== (nrows-1) && j !== 0 ) {
                        wOffFinal = wOff0x;
                    }
                    else if( i === (ncols-1) && j !== (nrows-1) && j !== 0 ) {
                        wOffFinal = wOffnx;
                    }
                    else if( i !== 0 && i !== (ncols-1) && j === 0 ) {
                        wOffFinal = wOffx0;
                    }
                    else if( i !== 0 && i !== (ncols-1) && j === (nrows-1) ) {
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

/**
 * Quantify a line according to image information.
 * @method quantifyLine
 * @param {Object} line The line to quantify.
 * @return {Object} A quantification object.
 */
dwv.image.Image.prototype.quantifyLine = function(line)
{
    var spacing = this.getGeometry().getSpacing();
    var length = line.getWorldLength( spacing.getColumnSpacing(), 
            spacing.getRowSpacing() );
    return {"length": length};
};

/**
 * Quantify a rectangle according to image information.
 * @method quantifyRect
 * @param {Object} rect The rectangle to quantify.
 * @return {Object} A quantification object.
 */
dwv.image.Image.prototype.quantifyRect = function(rect)
{
    var spacing = this.getGeometry().getSpacing();
    var surface = rect.getWorldSurface( spacing.getColumnSpacing(), 
            spacing.getRowSpacing());
    var subBuffer = [];
    var minJ = parseInt(rect.getBegin().getY(), 10);
    var maxJ = parseInt(rect.getEnd().getY(), 10);
    var minI = parseInt(rect.getBegin().getX(), 10);
    var maxI = parseInt(rect.getEnd().getX(), 10);
    for ( var j = minJ; j < maxJ; ++j ) {
        for ( var i = minI; i < maxI; ++i ) {
            subBuffer.push( this.getValue(i,j,0) );
        }
    }
    var quantif = dwv.math.getStats( subBuffer );
    return {"surface": surface, "min": quantif.min, 'max': quantif.max,
        "mean": quantif.mean, 'stdDev': quantif.stdDev};
};

/**
 * Quantify an ellipse according to image information.
 * @method quantifyEllipse
 * @param {Object} ellipse The ellipse to quantify.
 * @return {Object} A quantification object.
 */
dwv.image.Image.prototype.quantifyEllipse = function(ellipse)
{
    var spacing = this.getGeometry().getSpacing();
    var surface = ellipse.getWorldSurface( spacing.getColumnSpacing(), 
            spacing.getRowSpacing());
    return {"surface": surface};
};

/**
 * Image factory.
 * @class ImageFactory
 * @namespace dwv.image
 * @constructor
 */
dwv.image.ImageFactory = function () {};

/**
 * Get an Image object from the read DICOM file.
 * @method create
 * @param {Object} dicomElements The DICOM tags.
 * @param {Array} pixelBuffer The pixel buffer.
 * @returns {View} A new Image.
 */
dwv.image.ImageFactory.prototype.create = function (dicomElements, pixelBuffer)
{
    // columns
    var columns = dicomElements.getFromKey("x00280011");
    if ( !columns ) {
        throw new Error("Missing or empty DICOM image number of columns");
    }
    // rows
    var rows = dicomElements.getFromKey("x00280010");
    if ( !rows ) {
        throw new Error("Missing or empty DICOM image number of rows");
    }
    // image size
    var size = new dwv.image.Size( columns, rows );
    
    // spacing
    var rowSpacing = 1;
    var columnSpacing = 1;
    // PixelSpacing
    var pixelSpacing = dicomElements.getFromKey("x00280030");
    // ImagerPixelSpacing
    var imagerPixelSpacing = dicomElements.getFromKey("x00181164");
    if ( pixelSpacing && pixelSpacing[0] && pixelSpacing[1] ) {
        rowSpacing = parseFloat( pixelSpacing[0] );
        columnSpacing = parseFloat( pixelSpacing[1] );
    }
    else if ( imagerPixelSpacing && imagerPixelSpacing[0] && imagerPixelSpacing[1] ) {
        rowSpacing = parseFloat( imagerPixelSpacing[0] );
        columnSpacing = parseFloat( imagerPixelSpacing[1] );
    }
    // image spacing
    var spacing = new dwv.image.Spacing( columnSpacing, rowSpacing);

    // TransferSyntaxUID
    var transferSyntaxUID = dicomElements.getFromKey("x00020010");
    var syntax = dwv.dicom.cleanString( transferSyntaxUID );
    var jpeg2000 = dwv.dicom.isJpeg2000TransferSyntax( syntax );
    
    // buffer data
    var buffer = pixelBuffer;
    // PixelRepresentation
    var pixelRepresentation = dicomElements.getFromKey("x00280103");
    if ( pixelRepresentation === 1 ) {
        // unsigned to signed data
        buffer = new Int16Array(pixelBuffer.length);
        for ( var i=0; i<pixelBuffer.length; ++i ) {
            buffer[i] = pixelBuffer[i];
            if ( buffer[i] >= Math.pow(2, 15) ) {
                buffer[i] -= Math.pow(2, 16);
            }
        }
    }
    
    // slice position
    var slicePosition = new Array(0,0,0);
    // ImagePositionPatient
    var imagePositionPatient = dicomElements.getFromKey("x00200032");
    if ( imagePositionPatient ) {
        slicePosition = [ parseFloat( imagePositionPatient[0] ),
            parseFloat( imagePositionPatient[1] ),
            parseFloat( imagePositionPatient[2] ) ];
    }
    
    // geometry
    var origin = new dwv.math.Point3D(slicePosition[0], slicePosition[1], slicePosition[2]);
    var geometry = new dwv.image.Geometry( origin, size, spacing );
    
    // image
    var image = new dwv.image.Image( geometry, buffer );
    // PhotometricInterpretation
    var photometricInterpretation = dicomElements.getFromKey("x00280004");
    if ( photometricInterpretation ) {
        var photo = dwv.dicom.cleanString(photometricInterpretation).toUpperCase();
        if ( jpeg2000 && photo.match(/YBR/) ) {
            photo = "RGB";
        }
        image.setPhotometricInterpretation( photo );
    }        
    // PlanarConfiguration
    var planarConfiguration = dicomElements.getFromKey("x00280006");
    if ( planarConfiguration ) {
        image.setPlanarConfiguration( planarConfiguration );
    }  
    
    // rescale slope and intercept
    var slope = 1;
    // RescaleSlope
    var rescaleSlope = dicomElements.getFromKey("x00281053");
    if ( rescaleSlope ) {
        slope = parseFloat(rescaleSlope);
    }
    var intercept = 0;
    // RescaleIntercept
    var rescaleIntercept = dicomElements.getFromKey("x00281052");
    if ( rescaleIntercept ) {
        intercept = parseFloat(rescaleIntercept);
    }
    var rsi = new dwv.image.RescaleSlopeAndIntercept(slope, intercept);
    image.setRescaleSlopeAndIntercept( rsi );
    
    // meta information
    var meta = {};
    // Modality
    var modality = dicomElements.getFromKey("x00080060");
    if ( modality ) {
        meta.Modality = modality;
    }
    // StudyInstanceUID
    var studyInstanceUID = dicomElements.getFromKey("x0020000D");
    if ( studyInstanceUID ) {
        meta.StudyInstanceUID = studyInstanceUID;
    }
    // SeriesInstanceUID
    var seriesInstanceUID = dicomElements.getFromKey("x0020000E");
    if ( seriesInstanceUID ) {
        meta.SeriesInstanceUID = seriesInstanceUID;
    }
    // BitsStored
    var bitsStored = dicomElements.getFromKey("x00280101");
    if ( bitsStored ) {
        meta.BitsStored = parseInt(bitsStored, 10);
    }
    image.setMeta(meta);
    
    return image;
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
 * @param {Object} rsi The rescale slope and intercept.
 */
dwv.image.lut.Rescale = function (rsi)
{
    /**
     * The internal array.
     * @property rescaleLut
     * @private
     * @type Array
     */
    var rescaleLut = null;
    
    /**
     * Get the Rescale Slope and Intercept (RSI).
     * @method getRSI
     * @return {Object} The rescale slope and intercept.
     */ 
    this.getRSI = function () { return rsi; };
    
    /**
     * Initialise the LUT.
     * @method initialise
     * @param {Number} bitsStored The number of bits used to store the data.
     */ 
    this.initialise = function (bitsStored)
    {
        var size = Math.pow(2, bitsStored);
        rescaleLut = new Float32Array(size);
        for ( var i = 0; i < size; ++i ) {
            rescaleLut[i] = rsi.apply(i);
        }
    };
    
    /**
     * Get the length of the LUT array.
     * @method getLength
     * @return {Number} The length of the LUT array.
     */ 
    this.getLength = function () { return rescaleLut.length; };
    
    /**
     * Get the value of the LUT at the given offset.
     * @method getValue
     * @return {Number} The value of the LUT at the given offset.
     */ 
    this.getValue = function (offset) { return rescaleLut[offset]; };
};

/**
 * Window LUT class.
 * @class Window
 * @namespace dwv.image.lut
 * @constructor
 * @param {Number} rescaleLut_ The associated rescale LUT.
 * @param {Boolean} isSigned_ Flag to know if the data is signed.
 */
dwv.image.lut.Window = function (rescaleLut, isSigned)
{
    /**
     * The internal array: Uint8ClampedArray clamps between 0 and 255.
     * (not supported on travis yet... using basic array, be sure not to overflow!)
     * @property rescaleLut
     * @private
     * @type Array
     */
    var windowLut = null;
    
    // check Uint8ClampedArray support
    if ( !dwv.browser.hasClampedArray() ) {
        windowLut = new Uint8Array(rescaleLut.getLength());
    }
    else {
        windowLut = new Uint8ClampedArray(rescaleLut.getLength());
    }
    
    /**
     * The window center.
     * @property center
     * @private
     * @type Number
     */
    var center = null;
    /**
     * The window width.
     * @property width
     * @private
     * @type Number
     */
    var width = null;
    
    /**
     * Flag to know if the lut needs update or not.
     * @property needsUpdate
     * @private
     * @type Boolean
     */
    var needsUpdate = false;
    
    /**
     * Get the window center.
     * @method getCenter
     * @return {Number} The window center.
     */ 
    this.getCenter = function() { return center; };
    /**
     * Get the window width.
     * @method getWidth
     * @return {Number} The window width.
     */ 
    this.getWidth = function() { return width; };
    /**
     * Get the signed flag.
     * @method isSigned
     * @return {Boolean} The signed flag.
     */ 
    this.isSigned = function() { return isSigned; };
    /**
     * Get the rescale lut.
     * @method getRescaleLut
     * @return {Object} The rescale lut.
     */ 
    this.getRescaleLut = function() { return rescaleLut; };
    
    /**
     * Set the window center and width.
     * @method setCenterAndWidth
     * @param {Number} inCenter The window center.
     * @param {Number} inWidth The window width.
     */ 
    this.setCenterAndWidth = function (inCenter, inWidth)
    {
        // store the window values
        center = inCenter;
        width = inWidth;
        needsUpdate = true;
    };
    
    /**
     * Update the lut if needed..
     * @method update
     */
    this.update = function ()
    {
        if ( !needsUpdate ) {
            return;
        }
        // pre calculate loop values
        var size = windowLut.length;
        var center0 = center - 0.5;
        if ( isSigned ) {
            center0 += rescaleLut.getRSI().getSlope() * (size / 2);
        }
        var width0 = width - 1;
        var dispval = 0;
        if( !dwv.browser.hasClampedArray() )
        {
            var yMax = 255;
            var yMin = 0;
            for(var j=0; j<size; ++j)
            {
                // from the DICOM specification (https://www.dabsoft.ch/dicom/3/C.11.2.1.2/)
                // y = ((x - (c - 0.5)) / (w-1) + 0.5) * (ymax - ymin )+ ymin
                dispval = ((rescaleLut.getValue(j) - center0 ) / width0 + 0.5) * 255;
                dispval = parseInt(dispval, 10);
                if ( dispval <= yMin ) {
                    windowLut[j] = yMin;
                }
                else if ( dispval > yMax ) {
                    windowLut[j] = yMax;
                }
                else {
                    windowLut[j] = dispval;
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
                dispval = ((rescaleLut.getValue(i) - center0 ) / width0 + 0.5) * 255;
                windowLut[i]= parseInt(dispval, 10);
            }
        }
        needsUpdate = false;
    };
    
    /**
     * Get the length of the LUT array.
     * @method getLength
     * @return {Number} The length of the LUT array.
     */ 
    this.getLength = function() { return windowLut.length; };

    /**
     * Get the value of the LUT at the given offset.
     * @method getValue
     * @return {Number} The value of the LUT at the given offset.
     */ 
    this.getValue = function(offset)
    {
        var shift = isSigned ? windowLut.length / 2 : 0;
        return windowLut[offset+shift];
    };
};

/**
* Lookup tables for image colour display. 
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

// hot iron
dwv.image.lut.hot_iron = {
    "red":   [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122, 124, 126, 128, 130, 132, 134, 136, 138, 140, 142, 144, 146, 148, 150, 152, 154, 156, 158, 160, 162, 164, 166, 168, 170, 172, 174, 176, 178, 180, 182, 184, 186, 188, 190, 192, 194, 196, 198, 200, 202, 204, 206, 208, 210, 212, 214, 216, 218, 220, 222, 224, 226, 228, 230, 232, 234, 236, 238, 240, 242, 244, 246, 248, 250, 252, 254, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], 
    "green": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122, 124, 126, 128, 130, 132, 134, 136, 138, 140, 142, 144, 146, 148, 150, 152, 154, 156, 158, 160, 162, 164, 166, 168, 170, 172, 174, 176, 178, 180, 182, 184, 186, 188, 190, 192, 194, 196, 198, 200, 202, 204, 206, 208, 210, 212, 214, 216, 218, 220, 222, 224, 226, 228, 230, 232, 234, 236, 238, 240, 242, 244, 246, 248, 250, 252, 255], 
    "blue":  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 144, 148, 152, 156, 160, 164, 168, 172, 176, 180, 184, 188, 192, 196, 200, 204, 208, 212, 216, 220, 224, 228, 232, 236, 240, 244, 248, 252, 255]
};

// pet
dwv.image.lut.pet = {
    "red":   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 51, 53, 55, 57, 59, 61, 63, 65, 67, 69, 71, 73, 75, 77, 79, 81, 83, 85, 86, 88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122, 124, 126, 128, 130, 132, 134, 136, 138, 140, 142, 144, 146, 148, 150, 152, 154, 156, 158, 160, 162, 164, 166, 168, 170, 171, 173, 175, 177, 179, 181, 183, 185, 187, 189, 191, 193, 195, 197, 199, 201, 203, 205, 207, 209, 211, 213, 215, 217, 219, 221, 223, 225, 227, 229, 231, 233, 235, 237, 239, 241, 243, 245, 247, 249, 251, 253, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
    "green": [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 65, 67, 69, 71, 73, 75, 77, 79, 81, 83, 85, 87, 89, 91, 93, 95, 97, 99, 101, 103, 105, 107, 109, 111, 113, 115, 117, 119, 121, 123, 125, 128, 126, 124, 122, 120, 118, 116, 114, 112, 110, 108, 106, 104, 102, 100, 98, 96, 94, 92, 90, 88, 86, 84, 82, 80, 78, 76, 74, 72, 70, 68, 66, 64, 63, 61, 59, 57, 55, 53, 51, 49, 47, 45, 43, 41, 39, 37, 35, 33, 31, 29, 27, 25, 23, 21, 19, 17, 15, 13, 11, 9, 7, 5, 3, 1, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122, 124, 126, 128, 130, 132, 134, 136, 138, 140, 142, 144, 146, 148, 150, 152, 154, 156, 158, 160, 162, 164, 166, 168, 170, 172, 174, 176, 178, 180, 182, 184, 186, 188, 190, 192, 194, 196, 198, 200, 202, 204, 206, 208, 210, 212, 214, 216, 218, 220, 222, 224, 226, 228, 230, 232, 234, 236, 238, 240, 242, 244, 246, 248, 250, 252, 255],
    "blue":  [0, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 51, 53, 55, 57, 59, 61, 63, 65, 67, 69, 71, 73, 75, 77, 79, 81, 83, 85, 87, 89, 91, 93, 95, 97, 99, 101, 103, 105, 107, 109, 111, 113, 115, 117, 119, 121, 123, 125, 127, 129, 131, 133, 135, 137, 139, 141, 143, 145, 147, 149, 151, 153, 155, 157, 159, 161, 163, 165, 167, 169, 171, 173, 175, 177, 179, 181, 183, 185, 187, 189, 191, 193, 195, 197, 199, 201, 203, 205, 207, 209, 211, 213, 215, 217, 219, 221, 223, 225, 227, 229, 231, 233, 235, 237, 239, 241, 243, 245, 247, 249, 251, 253, 255, 252, 248, 244, 240, 236, 232, 228, 224, 220, 216, 212, 208, 204, 200, 196, 192, 188, 184, 180, 176, 172, 168, 164, 160, 156, 152, 148, 144, 140, 136, 132, 128, 124, 120, 116, 112, 108, 104, 100, 96, 92, 88, 84, 80, 76, 72, 68, 64, 60, 56, 52, 48, 44, 40, 36, 32, 28, 24, 20, 16, 12, 8, 4, 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 85, 89, 93, 97, 101, 105, 109, 113, 117, 121, 125, 129, 133, 137, 141, 145, 149, 153, 157, 161, 165, 170, 174, 178, 182, 186, 190, 194, 198, 202, 206, 210, 214, 218, 222, 226, 230, 234, 238, 242, 246, 250, 255]
};

// hot metal blue
dwv.image.lut.hot_metal_blue = {
    "red":   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 6, 9, 12, 15, 18, 21, 24, 26, 29, 32, 35, 38, 41, 44, 47, 50, 52, 55, 57, 59, 62, 64, 66, 69, 71, 74, 76, 78, 81, 83, 85, 88, 90, 93, 96, 99, 102, 105, 108, 111, 114, 116, 119, 122, 125, 128, 131, 134, 137, 140, 143, 146, 149, 152, 155, 158, 161, 164, 166, 169, 172, 175, 178, 181, 184, 187, 190, 194, 198, 201, 205, 209, 213, 217, 221, 224, 228, 232, 236, 240, 244, 247, 251, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
    "green": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 6, 8, 9, 11, 13, 15, 17, 19, 21, 23, 24, 26, 28, 30, 32, 34, 36, 38, 40, 41, 43, 45, 47, 49, 51, 53, 55, 56, 58, 60, 62, 64, 66, 68, 70, 72, 73, 75, 77, 79, 81, 83, 85, 87, 88, 90, 92, 94, 96, 98, 100, 102, 104, 105, 107, 109, 111, 113, 115, 117, 119, 120, 122, 124, 126, 128, 130, 132, 134, 136, 137, 139, 141, 143, 145, 147, 149, 151, 152, 154, 156, 158, 160, 162, 164, 166, 168, 169, 171, 173, 175, 177, 179, 181, 183, 184, 186, 188, 190, 192, 194, 196, 198, 200, 201, 203, 205, 207, 209, 211, 213, 215, 216, 218, 220, 222, 224, 226, 228, 229, 231, 233, 235, 237, 239, 240, 242, 244, 246, 248, 250, 251, 253, 255],
    "blue":  [0, 2, 4, 6, 8, 10, 12, 14, 16, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 51, 53, 55, 57, 59, 61, 63, 65, 67, 69, 71, 73, 75, 77, 79, 81, 83, 84, 86, 88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108, 110, 112, 114, 116, 117, 119, 121, 123, 125, 127, 129, 131, 133, 135, 137, 139, 141, 143, 145, 147, 149, 151, 153, 155, 157, 159, 161, 163, 165, 167, 169, 171, 173, 175, 177, 179, 181, 183, 184, 186, 188, 190, 192, 194, 196, 198, 200, 197, 194, 191, 188, 185, 182, 179, 176, 174, 171, 168, 165, 162, 159, 156, 153, 150, 144, 138, 132, 126, 121, 115, 109, 103, 97, 91, 85, 79, 74, 68, 62, 56, 50, 47, 44, 41, 38, 35, 32, 29, 26, 24, 21, 18, 15, 12, 9, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 6, 9, 12, 15, 18, 21, 24, 26, 29, 32, 35, 38, 41, 44, 47, 50, 53, 56, 59, 62, 65, 68, 71, 74, 76, 79, 82, 85, 88, 91, 94, 97, 100, 103, 106, 109, 112, 115, 118, 121, 124, 126, 129, 132, 135, 138, 141, 144, 147, 150, 153, 156, 159, 162, 165, 168, 171, 174, 176, 179, 182, 185, 188, 191, 194, 197, 200, 203, 206, 210, 213, 216, 219, 223, 226, 229, 232, 236, 239, 242, 245, 249, 252, 255]
};

// pet 20 step
dwv.image.lut.pet_20step = {
    "red":   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 192, 192, 192, 192, 192, 192, 192, 192, 192, 192, 192, 192, 192, 176, 176, 176, 176, 176, 176, 176, 176, 176, 176, 176, 176, 176, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
    "green": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 144, 144, 144, 144, 144, 144, 144, 144, 144, 144, 144, 144, 144, 192, 192, 192, 192, 192, 192, 192, 192, 192, 192, 192, 192, 192, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 208, 176, 176, 176, 176, 176, 176, 176, 176, 176, 176, 176, 176, 176, 144, 144, 144, 144, 144, 144, 144, 144, 144, 144, 144, 144, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
    "blue":  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 112, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 176, 176, 176, 176, 176, 176, 176, 176, 176, 176, 176, 176, 176, 192, 192, 192, 192, 192, 192, 192, 192, 192, 192, 192, 192, 192, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 224, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 96, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]
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
    var canvas = document.createElement('canvas');
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
    var origin = new dwv.math.Point3D(0,0,sliceIndex);
    var geometry = new dwv.image.Geometry(origin, imageSize, imageSpacing );
    var dwvImage = new dwv.image.Image( geometry, buffer );
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
    // create the view
    var viewFactory = new dwv.image.ViewFactory();
    var view = viewFactory.create( dicomParser.getDicomElements(), dicomParser.getPixelBuffer() );
    // return
    return {"view": view, "info": dicomParser.getDicomElements().dumpToTable()};
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
     * Window lookup tables, indexed per Rescale Slope and Intercept (RSI).
     * @property windowLuts
     * @private
     * @type Window
     */
    var windowLuts = {};
    
    /**
     * Window presets.
     * @property windowPresets
     * @private
     * @type Object
     */
    var windowPresets = null;
    /**
     * colour map
     * @property colourMap
     * @private
     * @type Object
     */
    var colourMap = dwv.image.lut.plain;
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
     * Get the window LUT of the image.
     * @method getWindowLut
     * @return {Window} The window LUT of the image.
     */ 
    this.getWindowLut = function (rsi) { 
        if ( typeof rsi === "undefined" ) {
            var sliceNumber = this.getCurrentPosition().k;
            rsi = image.getRescaleSlopeAndIntercept(sliceNumber);
        }
        return windowLuts[ rsi.toString() ];
    };
    /**
     * Set the window LUT of the image.
     * @method setWindowLut
     * @param {Window} wlut The window LUT of the image.
     */ 
    this.setWindowLut = function (wlut) 
    {
        var rsi = wlut.getRescaleLut().getRSI();
        windowLuts[rsi.toString()] = wlut;
    };
    
    var self = this;
    
    /**
     * Initialise the view. Only called at construction.
     * @method initialise
     * @private
     */ 
    function initialise()
    {
        // create the rescale lookup table
        var rescaleLut = new dwv.image.lut.Rescale(
            image.getRescaleSlopeAndIntercept(0) );
        // initialise the rescale lookup table
        rescaleLut.initialise(image.getMeta().BitsStored);
        // create the window lookup table
        var windowLut = new dwv.image.lut.Window(rescaleLut, isSigned);
        self.setWindowLut(windowLut);
    }
    
    // default constructor
    initialise();

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
     * Get the colour map of the image.
     * @method getColourMap
     * @return {Object} The colour map of the image.
     */ 
    this.getColourMap = function() { return colourMap; };
    /**
     * Set the colour map of the image.
     * @method setColourMap
     * @param {Object} map The colour map of the image.
     */ 
    this.setColourMap = function(map) { 
        colourMap = map;
        // TODO Better handle this...
        if( this.getImage().getPhotometricInterpretation() === "MONOCHROME1") {
            colourMap = dwv.image.lut.invPlain;
        }
        this.fireEvent({"type": "colour-change", 
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
    this.getCurrentPosition = function() { 
        // return a clone to avoid reference problems
        return {"i": currentPosition.i, "j": currentPosition.j, "k": currentPosition.k};
    };
    /**
     * Set the current position. Returns false if not in bounds.
     * @method setCurrentPosition
     * @param {Object} pos The current position.
     */ 
    this.setCurrentPosition = function(pos) { 
        if( !image.getGeometry().getSize().isInBounds(pos.i,pos.j,pos.k) ) {
            return false;
        }
        var oldPosition = currentPosition;
        currentPosition = pos;
        // only display value for monochrome data
        if( image.getPhotometricInterpretation().match(/MONOCHROME/) !== null )
        {
            this.fireEvent({"type": "position-change", 
                "i": pos.i, "j": pos.j, "k": pos.k,
                "value": image.getRescaledValue(pos.i,pos.j,pos.k)});
        }
        else
        {
            this.fireEvent({"type": "position-change", 
                "i": pos.i, "j": pos.j, "k": pos.k});
        }
        // slice change event (used to trigger redraw)
        if( oldPosition.k !== currentPosition.k ) {
            this.fireEvent({"type": "slice-change"});
        }
        return true;
    };
    
    /**
     * Append another view to this one.
     * @method append
     * @param {Object} rhs The view to append.
     */
    this.append = function( rhs )
    {  
       // append images
       this.getImage().appendSlice( rhs.getImage() );
       // init to update self
       this.setWindowLut(rhs.getWindowLut());
    };
    
    /**
     * Set the view window/level.
     * @method setWindowLevel
     * @param {Number} center The window center.
     * @param {Number} width The window width.
     * Warning: uses the latest set rescale LUT or the default linear one.
     */
    this.setWindowLevel = function ( center, width )
    {
        // window width shall be >= 1 (see https://www.dabsoft.ch/dicom/3/C.11.2.1.2/)
        if ( width >= 1 ) {
            for ( var key in windowLuts ) {
                windowLuts[key].setCenterAndWidth(center, width);
            }
            this.fireEvent({"type": "wl-change", "wc": center, "ww": width });
        }
    };

    /**
     * Clone the image using all meta data and the original data buffer.
     * @method clone
     * @return {View} A full copy of this {dwv.image.View}.
     */
    this.clone = function ()
    {
        var copy = new dwv.image.View(this.getImage());
        for ( var key in windowLuts ) {
            copy.setWindowLut(windowLuts[key]);
        }
        copy.setListeners(this.getListeners());
        return copy;
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
    windowLut.update();
    var colourMap = this.getColourMap();
    var index = 0;
    var sliceSize = image.getGeometry().getSize().getSliceSize();
    var sliceOffset = 0;
    switch (photoInterpretation)
    {
    case "MONOCHROME1":
    case "MONOCHROME2":
        sliceOffset = (sliceNumber || 0) * sliceSize;
        var iMax = sliceOffset + sliceSize;
        for(var i=sliceOffset; i < iMax; ++i)
        {        
            pxValue = parseInt( windowLut.getValue( 
                    image.getValueAtOffset(i) ), 10 );
            array.data[index] = colourMap.red[pxValue];
            array.data[index+1] = colourMap.green[pxValue];
            array.data[index+2] = colourMap.blue[pxValue];
            array.data[index+3] = 0xff;
            index += 4;
        }
        break;
    
    case "RGB":
        // the planar configuration defines the memory layout
        if( planarConfig !== 0 && planarConfig !== 1 ) {
            throw new Error("Unsupported planar configuration: "+planarConfig);
        }
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
        for(var j=0; j < sliceSize; ++j)
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

/**
 * View factory.
 * @class ViewFactory
 * @namespace dwv.image
 * @constructor
 */
dwv.image.ViewFactory = function () {};

/**
 * Get an View object from the read DICOM file.
 * @method create
 * @param {Object} dicomElements The DICOM tags.
 * @param {Array} pixelBuffer The pixel buffer.
 * @returns {View} The new View.
 */
dwv.image.ViewFactory.prototype.create = function (dicomElements, pixelBuffer)
{
    // create the image
    var imageFactory = new dwv.image.ImageFactory();
    var image = imageFactory.create(dicomElements, pixelBuffer);
    
    // PixelRepresentation
    var isSigned = false;
    var pixelRepresentation = dicomElements.getFromKey("x00280103");
    if ( pixelRepresentation === 1 ) {
        isSigned = true;
    }
    // view
    var view = new dwv.image.View(image, isSigned);
    // presets
    var windowPresets = [];
    // WindowCenter and WindowWidth
    var windowCenter = dicomElements.getFromKey("x00281050", true);
    var windowWidth = dicomElements.getFromKey("x00281051", true);
    if ( windowCenter && windowWidth ) {
        var name;
        for ( var j = 0; j < windowCenter.length; ++j) {
            var width = parseFloat( windowWidth[j], 10 );
            var center = parseFloat( windowCenter[j], 10 );
            if ( width ) {
                name = "Default"+j;
                var windowCenterWidthExplanation = dicomElements.getFromKey("x00281055");
                if ( windowCenterWidthExplanation ) {
                    name = windowCenterWidthExplanation[j];
                }
                windowPresets.push({
                    "center": center,
                    "width": width, 
                    "name": name
                });
            }
        }
    }
    if ( windowPresets.length !== 0 ) {
        view.setWindowPresets( windowPresets );
    }
    else {
        view.setWindowLevelMinMax();
    }

    return view;
};;/** 
 * I/O module.
 * @module io
 */
var dwv = dwv || {};
/**
 * Namespace for I/O functions.
 * @class io
 * @namespace dwv
 * @static
 */
dwv.io = dwv.io || {};

/**
 * File loader.
 * @class File
 * @namespace dwv.io
 * @constructor
 */
dwv.io.File = function ()
{
    /**
     * Number of data to load.
     * @property nToLoad
     * @private
     * @type Number
     */
    var nToLoad = 0;
    /**
     * Number of loaded data.
     * @property nLoaded
     * @private
     * @type Number
     */
    var nLoaded = 0;
    /**
     * List of progresses.
     * @property progressList
     * @private
     * @type Array
     */
    var progressList = [];
    
    /**
     * Set the number of data to load.
     * @method setNToLoad
     */ 
    this.setNToLoad = function (n) { 
        nToLoad = n;
        for ( var i = 0; i < nToLoad; ++i ) {
            progressList[i] = 0;
        }
    };
    
    /**
     * Increment the number of loaded data
     * and call onloadend if loaded all data.
     * @method addLoaded
     */ 
    this.addLoaded = function () {
        nLoaded++;
        if ( nLoaded === nToLoad ) {
            this.onloadend();
        }
    };
    
    /**
     * Get the global load percent including the provided one.
     * @method getGlobalPercent
     * @param {Number} n The number of the loaded data.
     * @param {Number} percent The percentage of data 'n' that has been loaded.
     * @return {Number} The accumulated percentage. 
     */
    this.getGlobalPercent = function (n, percent) {
        progressList[n] = percent/nToLoad;
        var totPercent = 0;
        for ( var i = 0; i < progressList.length; ++i ) {
            totPercent += progressList[i];
        }
        return totPercent;
    };
}; // class File

/**
 * Handle a load event.
 * @method onload
 * @param {Object} event The load event, event.target 
 *  should be the loaded data.
 */
dwv.io.File.prototype.onload = function (/*event*/) 
{
    // default does nothing.
};
/**
 * Handle a load end event.
 * @method onloadend
 */
dwv.io.File.prototype.onloadend = function () 
{
    // default does nothing.
};
/**
 * Handle a progress event.
 * @method onprogress
 */
dwv.io.File.prototype.onprogress = function () 
{
    // default does nothing.
};
/**
 * Handle an error event.
 * @method onerror
 * @param {Object} event The error event, event.message
 *  should be the error message.
 */
dwv.io.File.prototype.onerror = function (/*event*/) 
{
    // default does nothing.
};

/**
 * Create an error handler from a base one and locals.
 * @method createErrorHandler
 * @param {String} file The related file.
 * @param {String} text The text to insert in the message.
 * @param {Function} baseHandler The base handler.
 */
dwv.io.File.createErrorHandler = function (file, text, baseHandler) {
    return function (event) {
        baseHandler( {'name': "RequestError", 
            'message': "An error occurred while reading the " + text + " file: " + file + 
            " ("+event.getMessage() + ")" } );
    };
};

/**
 * Create an progress handler from a base one and locals.
 * @method createProgressHandler
 * @param {Number} n The number of the loaded data.
 * @param {Function} calculator The load progress accumulator.
 * @param {Function} baseHandler The base handler.
 */
dwv.io.File.createProgressHandler = function (n, calculator, baseHandler) {
    return function (event) {
        if( event.lengthComputable )
        {
            var percent = Math.round((event.loaded / event.total) * 100);
            var ev = {lengthComputable: true, loaded: calculator(n, percent), total: 100};
            baseHandler(ev);
        }
    };
};

/**
 * Load a list of files.
 * @method load
 * @param {Array} ioArray The list of files to load.
 */
dwv.io.File.prototype.load = function (ioArray) 
{
    // closure to self for handlers
    var self = this;
    // set the number of data to load
    this.setNToLoad( ioArray.length );

    // call the listeners
    var onLoad = function (data)
    {
        self.onload(data);
        self.addLoaded();
    };
    
    // DICOM reader loader
    var onLoadDicomReader = function (event)
    {
        try {
            onLoad( dwv.image.getDataFromDicomBuffer(event.target.result) );
        } catch(error) {
            self.onerror(error);
        }
    };

    // image loader
    var onLoadImage = function (/*event*/)
    {
        try {
            onLoad( dwv.image.getDataFromImage(this) );
        } catch(error) {
            self.onerror(error);
        }
    };

    // text reader loader
    var onLoadTextReader = function (event)
    {
        try {
            onLoad( event.target.result );
        } catch(error) {
            self.onerror(error);
        }
    };

    // image reader loader
    var onLoadImageReader = function (event)
    {
        var theImage = new Image();
        theImage.src = event.target.result;
        // storing values to pass them on
        theImage.file = this.file;
        theImage.index = this.index;
        // triggered by ctx.drawImage
        theImage.onload = onLoadImage;
    };

    // loop on I/O elements
    for (var i = 0; i < ioArray.length; ++i)
    {
        var file = ioArray[i];
        var reader = new FileReader();
        reader.onprogress = dwv.io.File.createProgressHandler(i, 
                self.getGlobalPercent, self.onprogress);
        if ( file.name.split('.').pop().toLowerCase() === "json" )
        {
            reader.onload = onLoadTextReader;
            reader.onerror = dwv.io.File.createErrorHandler(file, "text", self.onerror);
            reader.readAsText(file);
        }
        else if ( file.type.match("image.*") )
        {
            // storing values to pass them on
            reader.file = file;
            reader.index = i;
            // callbacks
            reader.onload = onLoadImageReader;
            reader.onerror = dwv.io.File.createErrorHandler(file, "image", self.onerror);
            reader.readAsDataURL(file);
        }
        else
        {
            reader.onload = onLoadDicomReader;
            reader.onerror = dwv.io.File.createErrorHandler(file, "DICOM", self.onerror);
            reader.readAsArrayBuffer(file);
        }
    }
};
;/** 
 * I/O module.
 * @module io
 */
var dwv = dwv || {};
/**
 * Namespace for I/O functions.
 * @class io
 * @namespace dwv
 * @static
 */
dwv.io = dwv.io || {};

/**
 * Url loader.
 * @class Url
 * @namespace dwv.io
 * @constructor
 */
dwv.io.Url = function ()
{
    /**
     * Number of data to load.
     * @property nToLoad
     * @private
     * @type Number
     */
    var nToLoad = 0;
    /**
     * Number of loaded data.
     * @property nLoaded
     * @private
     * @type Number
     */
    var nLoaded = 0;
    /**
     * List of progresses.
     * @property progressList
     * @private
     * @type Array
     */
    var progressList = [];
    
    /**
     * Set the number of data to load.
     * @method setNToLoad
     */ 
    this.setNToLoad = function (n) {
        nToLoad = n;
        for ( var i = 0; i < nToLoad; ++i ) {
            progressList[i] = 0;
        }
    };
    
    /**
     * Increment the number of loaded data
     * and call onloadend if loaded all data.
     * @method addLoaded
     */ 
    this.addLoaded = function () {
        nLoaded++;
        if ( nLoaded === nToLoad ) {
            this.onloadend();
        }
    };
    
    /**
     * Get the global load percent including the provided one.
     * @method getGlobalPercent
     * @param {Number} n The number of the loaded data.
     * @param {Number} percent The percentage of data 'n' that has been loaded.
     * @return {Number} The accumulated percentage. 
     */
    this.getGlobalPercent = function (n, percent) {
        progressList[n] = percent/nToLoad;
        var totPercent = 0;
        for ( var i = 0; i < progressList.length; ++i ) {
            totPercent += progressList[i];
        }
        return totPercent;
    };
}; // class Url

/**
 * Handle a load event.
 * @method onload
 * @param {Object} event The load event, event.target 
 *  should be the loaded data.
 */
dwv.io.Url.prototype.onload = function (/*event*/) 
{
    // default does nothing.
};
/**
 * Handle a load end event.
 * @method onloadend
 */
dwv.io.Url.prototype.onloadend = function () 
{
    // default does nothing.
};
/**
 * Handle a progress event.
 * @method onprogress
 */
dwv.io.File.prototype.onprogress = function () 
{
    // default does nothing.
};
/**
 * Handle an error event.
 * @method onerror
 * @param {Object} event The error event, event.message 
 *  should be the error message.
 */
dwv.io.Url.prototype.onerror = function (/*event*/) 
{
    // default does nothing.
};

/**
 * Create an error handler from a base one and locals.
 * @method createErrorHandler
 * @param {String} url The related url.
 * @param {String} text The text to insert in the message.
 * @param {Function} baseHandler The base handler.
 */
dwv.io.Url.createErrorHandler = function (url, text, baseHandler) {
    return function (/*event*/) {
        baseHandler( {'name': "RequestError", 
            'message': "An error occurred while retrieving the " + text + " file (via http): " + url + 
            " (status: "+this.status + ")" } );
    };
};

/**
 * Create an progress handler from a base one and locals.
 * @method createProgressHandler
 * @param {Number} n The number of the loaded data.
 * @param {Function} calculator The load progress accumulator.
 * @param {Function} baseHandler The base handler.
 */
dwv.io.Url.createProgressHandler = function (n, calculator, baseHandler) {
    return function (event) {
        if( event.lengthComputable )
        {
            var percent = Math.round((event.loaded / event.total) * 100);
            var ev = {lengthComputable: true, loaded: calculator(n, percent), total: 100};
            baseHandler(ev);
        }
    };
};

/**
 * Load a list of URLs.
 * @method load
 * @param {Array} ioArray The list of urls to load.
 */
dwv.io.Url.prototype.load = function (ioArray) 
{
    // closure to self for handlers
    var self = this;
    // set the number of data to load
    this.setNToLoad( ioArray.length );

    // call the listeners
    var onLoad = function (data)
    {
        self.onload(data);
        self.addLoaded();
    };

    // DICOM request
    var onLoadDicomRequest = function (response)
    {
        try {
            onLoad( dwv.image.getDataFromDicomBuffer(response) );
        } catch (error) {
            self.onerror(error);
        }
    };

    // image request
    var onLoadImage = function (/*event*/)
    {
        try {
            onLoad( dwv.image.getDataFromImage(this) );
        } catch (error) {
            self.onerror(error);
        }
    };

    // text request
    var onLoadTextRequest = function (/*event*/)
    {
        try {
            onLoad( this.responseText );
        } catch (error) {
            self.onerror(error);
        }
    };
    
    // binary request
    var onLoadBinaryRequest = function (/*event*/)
    {
        // find the image type from its signature
        var view = new DataView(this.response);
        var isJpeg = view.getUint32(0) === 0xffd8ffe0;
        var isPng = view.getUint32(0) === 0x89504e47;
        var isGif = view.getUint32(0) === 0x47494638;
        
        // check possible extension
        // (responseURL is supported on major browsers but not IE...)
        if ( !isJpeg && !isPng && !isGif && this.responseURL )
        {
            var ext = this.responseURL.split('.').pop().toLowerCase();
            isJpeg = (ext === "jpg") || (ext === "jpeg");
            isPng = (ext === "png");
            isGif = (ext === "gif");
        }
        
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
            tmpImage.onload = onLoadImage;
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
        // read as text according to extension
        var isText = ( url.split('.').pop().toLowerCase() === "json" );

        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        if ( !isText ) {
            request.responseType = "arraybuffer"; 
            request.onload = onLoadBinaryRequest;
            request.onerror = dwv.io.Url.createErrorHandler(url, "binary", self.onerror);
        }
        else {
            request.onload = onLoadTextRequest;
            request.onerror = dwv.io.Url.createErrorHandler(url, "text", self.onerror);
        }
        request.onprogress = dwv.io.File.createProgressHandler(i, 
            self.getGlobalPercent, self.onprogress);
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
/**
 * Namespace for math functions.
 * @class math
 * @namespace dwv
 * @static
 */
dwv.math = dwv.math || {};

/** 
 * Immutable 2D point.
 * @class Point2D
 * @namespace dwv.math
 * @constructor
 * @param {Number} x The X coordinate for the point.
 * @param {Number} y The Y coordinate for the point.
 */
dwv.math.Point2D = function (x,y)
{
    /** 
     * Get the X position of the point.
     * @method getX
     * @return {Number} The X position of the point.
     */
    this.getX = function () { return x; };
    /** 
     * Get the Y position of the point.
     * @method getY
     * @return {Number} The Y position of the point. 
     */
    this.getY = function () { return y; };
}; // Point2D class

/** 
 * Check for Point2D equality.
 * @method equals
 * @param {Point2D} rhs The other Point2D to compare to.
 * @return {Boolean} True if both points are equal.
 */ 
dwv.math.Point2D.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getX() === rhs.getX() &&
        this.getY() === rhs.getY();
};

/** 
 * Get a string representation of the Point2D.
 * @method toString
 * @return {String} The Point2D as a string.
 */ 
dwv.math.Point2D.prototype.toString = function () {
    return "(" + this.getX() + ", " + this.getY() + ")";
};

/** 
 * Mutable 2D point.
 * @class FastPoint2D
 * @namespace dwv.math
 * @constructor
 * @param {Number} x The X coordinate for the point.
 * @param {Number} y The Y coordinate for the point.
 */
dwv.math.FastPoint2D = function (x,y)
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
dwv.math.FastPoint2D.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.x === rhs.x &&
        this.y === rhs.y;
};

/** 
 * Get a string representation of the FastPoint2D.
 * @method toString
 * @return {String} The Point2D as a string.
 */ 
dwv.math.FastPoint2D.prototype.toString = function () {
    return "(" + this.x + ", " + this.y + ")";
};

/** 
 * Immutable 3D point.
 * @class Point3D
 * @namespace dwv.math
 * @constructor
 * @param {Number} x The X coordinate for the point.
 * @param {Number} y The Y coordinate for the point.
 * @param {Number} z The Z coordinate for the point.
 */
dwv.math.Point3D = function (x,y,z)
{
    /** 
     * Get the X position of the point.
     * @method getX
     * @return {Number} The X position of the point.
     */
    this.getX = function () { return x; };
    /** 
     * Get the Y position of the point.
     * @method getY
     * @return {Number} The Y position of the point. 
     */
    this.getY = function () { return y; };
    /** 
     * Get the Z position of the point.
     * @method getZ
     * @return {Number} The Z position of the point. 
     */
    this.getZ = function () { return z; };
}; // Point3D class

/** 
 * Check for Point3D equality.
 * @method equals
 * @param {Point3D} rhs The other Point3D to compare to.
 * @return {Boolean} True if both points are equal.
 */ 
dwv.math.Point3D.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getX() === rhs.getX() &&
        this.getY() === rhs.getY() &&
        this.getZ() === rhs.getZ();
};

/** 
 * Get a string representation of the Point3D.
 * @method toString
 * @return {String} The Point3D as a string.
 */ 
dwv.math.Point3D.prototype.toString = function () {
    return "(" + this.getX() + 
        ", " + this.getY() +
        ", " + this.getZ() + ")";
};

/** 
 * Immutable 3D index.
 * @class Index3D
 * @namespace dwv.math
 * @constructor
 * @param {Number} i The column index.
 * @param {Number} j The row index.
 * @param {Number} k The slice index.
 */
dwv.math.Index3D = function (i,j,k)
{
    /** 
     * Get the column index.
     * @method getI
     * @return {Number} The column index.
     */
    this.getI = function () { return i; };
    /** 
     * Get the row index.
     * @method getJ
     * @return {Number} The row index. 
     */
    this.getJ = function () { return j; };
    /** 
     * Get the slice index.
     * @method getK
     * @return {Number} The slice index. 
     */
    this.getK = function () { return k; };
}; // Index3D class

/** 
 * Check for Index3D equality.
 * @method equals
 * @param {Index3D} rhs The other Index3D to compare to.
 * @return {Boolean} True if both points are equal.
 */ 
dwv.math.Index3D.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getI() === rhs.getI() &&
        this.getJ() === rhs.getJ() &&
        this.getK() === rhs.getK();
};

/** 
 * Get a string representation of the Index3D.
 * @method toString
 * @return {String} The Index3D as a string.
 */ 
dwv.math.Index3D.prototype.toString = function () {
    return "(" + this.getI() + 
        ", " + this.getJ() +
        ", " + this.getK() + ")";
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
    // Greyscale values found by averaging colour channels
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
/**
 * Namespace for math functions.
 * @class math
 * @namespace dwv
 * @static
 */
dwv.math = dwv.math || {};

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
     * Line delta in the X direction.
     * @property dx
     * @private
     * @type Number
     */
    var dx = end.getX() - begin.getX();
    /**
     * Line delta in the Y direction.
     * @property dy
     * @private
     * @type Number
     */
    var dy = end.getY() - begin.getY();
    /**
     * Line length.
     * @property length
     * @private
     * @type Number
     */
    var length = Math.sqrt( dx * dx + dy * dy );
        
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
     * Get the line delta in the X direction.
     * @method getDeltaX
     * @return {Number} The delta in the X direction.
     */
    this.getDeltaX = function() { return dx; };
    /**
     * Get the line delta in the Y direction.
     * @method getDeltaX
     * @return {Number} The delta in the Y direction.
     */
    this.getDeltaY = function() { return dy; };
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
        var dxs = dx * spacingX;
        var dys = dy * spacingY;
        return Math.sqrt( dxs * dxs + dys * dys );
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
    /**
     * Get the slope of the line.
     * @method getSlope
     * @return {Number} The slope of the line.
     */
    this.getSlope = function()
    { 
        return dy / dx;
    };
    /**
     * Get the inclination of the line.
     * @method getInclination
     * @return {Number} The inclination of the line.
     */
    this.getInclination = function()
    { 
        // tan(theta) = slope
        var angle = Math.atan2( dy, dx ) * 180 / Math.PI;
        // shift?
        return 180 - angle;
    };
}; // Line class

/**
 * Get the angle between two lines.
 * @param line0 The first line.
 * @param line1 The second line.
 */
dwv.math.getAngle = function (line0, line1)
{
    var dx0 = line0.getDeltaX();
    var dy0 = line0.getDeltaY();
    var dx1 = line1.getDeltaX();
    var dy1 = line1.getDeltaY();
    // dot = ||a||*||b||*cos(theta)
    var dot = dx0 * dx1 + dy0 * dy1;
    // cross = ||a||*||b||*sin(theta)
    var det = dx0 * dy1 - dy0 * dx1;
    // tan = sin / cos
    var angle = Math.atan2( det, dot ) * 180 / Math.PI;
    // complementary angle
    // shift?
    return 360 - (180 - angle);
};

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
 * Math module.
 * @module math
 */
var dwv = dwv || {};
dwv.math = dwv.math || {};

/**
 * Get the minimum, maximum, mean and standard deviation
 * of an array of values.
 * Note: could use https://github.com/tmcw/simple-statistics
 * @method getStats
 * @static
 */
dwv.math.getStats = function (array)
{
    var min = array[0];
    var max = min;
    var mean = 0;
    var sum = 0;
    var sumSqr = 0;
    var stdDev = 0;
    var variance = 0;
    
    var val = 0;
    for ( var i = 0; i < array.length; ++i ) {
        val = array[i];
        if ( val < min ) {
            min = val;
        }
        else if ( val > max ) {
            max = val;
        }
        sum += val;
        sumSqr += val * val;
    }
    
    mean = sum / array.length;
    // see http://en.wikipedia.org/wiki/Algorithms_for_calculating_variance
    variance = sumSqr / array.length - mean * mean;
    stdDev = Math.sqrt(variance);
    
    return { 'min': min, 'max': max, 'mean': mean, 'stdDev': stdDev };
};

/** 
 * Unique ID generator.
 * @class IdGenerator
 * @namespace dwv.math
 * @constructor
 */
dwv.math.IdGenerator = function ()
{
    /**
     * Root for IDs.
     * @property root
     * @private
     * @type Number
     */
    var root = Math.floor( Math.random() * 26 ) + Date.now();
    /**
     * Get a unique id.
     * @method get
     * @return {Number} The unique Id.
     */
    this.get = function () {
        return root++;
    };
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/**
 * Draw group command.
 * @class DrawGroupCommand
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.DrawGroupCommand = function (group, name, layer)
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
        // add the group to the layer
        layer.add(group);
        // draw
        layer.draw();
        // callback
        this.onExecute({'type': 'draw-create', 'id': group.id});
    };
    /**
     * Undo the command.
     * @method undo
     */
    this.undo = function () {
        // remove the group from the parent layer
        group.remove();
        // draw
        layer.draw();
        // callback
        this.onUndo({'type': 'draw-delete', 'id': group.id});
    };
}; // DrawGroupCommand class

/**
 * Handle an execute event.
 * @method onExecute
 * @param {Object} event The execute event with type and id.
 */
dwv.tool.DrawGroupCommand.prototype.onExecute = function (/*event*/) 
{
    // default does nothing.
};
/**
 * Handle an undo event.
 * @method onUndo
 * @param {Object} event The undo event with type and id.
 */
dwv.tool.DrawGroupCommand.prototype.onUndo = function (/*event*/) 
{
    // default does nothing.
};

/**
 * Move group command.
 * @class MoveGroupCommand
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.MoveGroupCommand = function (group, name, translation, layer)
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
        // translate all children of group
        group.getChildren().each( function (shape) {
            shape.x( shape.x() + translation.x );
            shape.y( shape.y() + translation.y );
        });
        // draw
        layer.draw();
        // callback
        this.onExecute({'type': 'draw-move', 'id': group.id});
    };
    /**
     * Undo the command.
     * @method undo
     */
    this.undo = function () {
        // invert translate all children of group
        group.getChildren().each( function (shape) {
            shape.x( shape.x() - translation.x );
            shape.y( shape.y() - translation.y );
        });
        // draw
        layer.draw();
        // callback
        this.onUndo({'type': 'draw-move', 'id': group.id});
    };
}; // MoveGroupCommand class

/**
 * Handle an execute event.
 * @method onExecute
 * @param {Object} event The execute event with type and id.
 */
dwv.tool.MoveGroupCommand.prototype.onExecute = function (/*event*/) 
{
    // default does nothing.
};
/**
 * Handle an undo event.
 * @method onUndo
 * @param {Object} event The undo event with type and id.
 */
dwv.tool.MoveGroupCommand.prototype.onUndo = function (/*event*/) 
{
    // default does nothing.
};

/**
 * Change group command.
 * @class ChangeGroupCommand
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.ChangeGroupCommand = function (name, func, startAnchor, endAnchor, layer, image)
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
        func( endAnchor, image );
        // draw
        layer.draw();
        // callback
        this.onExecute({'type': 'draw-change'});
    };
    /**
     * Undo the command.
     * @method undo
     */
    this.undo = function () {
        // invert change shape
        func( startAnchor, image );
        // draw
        layer.draw();
        // callback
        this.onUndo({'type': 'draw-change'});
    };
}; // ChangeGroupCommand class

/**
 * Handle an execute event.
 * @method onExecute
 * @param {Object} event The execute event with type and id.
 */
dwv.tool.ChangeGroupCommand.prototype.onExecute = function (/*event*/) 
{
    // default does nothing.
};
/**
 * Handle an undo event.
 * @method onUndo
 * @param {Object} event The undo event with type and id.
 */
dwv.tool.ChangeGroupCommand.prototype.onUndo = function (/*event*/) 
{
    // default does nothing.
};

/**
 * Delete group command.
 * @class DeleteGroupCommand
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.DeleteGroupCommand = function (group, name, layer)
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
        // remove the group from the parent layer
        group.remove();
        // draw
        layer.draw();
        // callback
        this.onExecute({'type': 'draw-delete', 'id': group.id});
    };
    /**
     * Undo the command.
     * @method undo
     */
    this.undo = function () {
        // add the group to the layer
        layer.add(group);
        // draw
        layer.draw();
        // callback
        this.onUndo({'type': 'draw-create', 'id': group.id});
    };
}; // DeleteGroupCommand class

/**
 * Handle an execute event.
 * @method onExecute
 * @param {Object} event The execute event with type and id.
 */
dwv.tool.DeleteGroupCommand.prototype.onExecute = function (/*event*/) 
{
    // default does nothing.
};
/**
 * Handle an undo event.
 * @method onUndo
 * @param {Object} event The undo event with type and id.
 */
dwv.tool.DeleteGroupCommand.prototype.onUndo = function (/*event*/) 
{
    // default does nothing.
};

/**
 * Drawing tool.
 * @class Draw
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.Draw = function (app, shapeFactoryList)
{
    /**
     * Closure to self: to be used by event handlers.
     * @property self
     * @private
     * @type WindowLevel
     */
    var self = this;
    /**
     * Draw GUI.
     * @property gui
     * @type Object
     */
    var gui = null;
    /**
     * Interaction start flag.
     * @property started
     * @private
     * @type Boolean
     */
    var started = false;
    
    /**
     * Shape factory list
     * @property shapeFactoryList
     * @type Object
     */
    this.shapeFactoryList = shapeFactoryList;
    /**
     * Draw command.
     * @property command
     * @private
     * @type Object
     */
    var command = null;
    /**
     * Current shape group.
     * @property shapeGroup
     * @private
     * @type Object
     */
    var shapeGroup = null;

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
    var shapeEditor = new dwv.tool.ShapeEditor(app);
    
    // associate the event listeners of the editor
    //  with those of the draw tool
    shapeEditor.setDrawEventCallback(fireEvent);

    /**
     * Trash draw: a cross.
     * @property trash
     * @private
     * @type Object
     */
    var trash = new Kinetic.Group();

    // first line of the cross
    var trashLine1 = new Kinetic.Line({
        points: [-10, -10, 10, 10 ],
        stroke: 'red',
    });
    // second line of the cross
    var trashLine2 = new Kinetic.Line({
        points: [10, -10, -10, 10 ],
        stroke: 'red'
    });
    trash.add(trashLine1);
    trash.add(trashLine2);

    // listeners
    var listeners = {};

    /**
     * The associated draw layer.
     * @property drawLayer
     * @private
     * @type Object
     */
    var drawLayer = null;
    
    /**
     * The associated draw layer.
     * @property drawLayer
     * @private
     * @type Object
     */
    var idGenerator = new dwv.math.IdGenerator();

    /**
     * Handle mouse down event.
     * @method mousedown
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        // determine if the click happened in an existing shape
        var stage = app.getDrawStage();
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
                shapeEditor.setImage(app.getImage());
                shapeEditor.enable();
            }
        }
        else {
            // disable edition
            shapeEditor.disable();
            shapeEditor.setShape(null);
            shapeEditor.setImage(null);
            // start storing points
            started = true;
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
            // clear last added point from the list (but not the first one)
            if ( points.length != 1 ) {
                points.pop();
            }
            // add current one to the list
            points.push( lastPoint );
            // allow for anchor points
            var factory = new self.shapeFactoryList[self.shapeName]();
            if( points.length < factory.getNPoints() ) {
                clearTimeout(this.timer);
                this.timer = setTimeout( function () {
                    points.push( lastPoint );
                }, factory.getTimeout() );
            }
            // remove previous draw
            if ( shapeGroup ) {
                shapeGroup.destroy();
            }
            // create shape group
            shapeGroup = factory.create(points, app.getStyle(), app.getImage());
            // do not listen during creation
            var shape = shapeGroup.getChildren( function (node) {
                return node.name() === 'shape';
            })[0];
            shape.listening(false);
            drawLayer.hitGraphEnabled(false);
            // draw shape command
            command = new dwv.tool.DrawGroupCommand(shapeGroup, self.shapeName, drawLayer);
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
            // reset shape group
            if ( shapeGroup ) {
                shapeGroup.destroy();
            }
            // create final shape
            var factory = new self.shapeFactoryList[self.shapeName]();
            var group = factory.create(points, app.getStyle(), app.getImage());
            group.id( idGenerator.get() );
            // re-activate layer
            drawLayer.hitGraphEnabled(true);
            // draw shape command
            command = new dwv.tool.DrawGroupCommand(group, self.shapeName, drawLayer);
            command.onExecute = fireEvent;
            command.onUndo = fireEvent;
            // execute it
            command.execute();
            // save it in undo stack
            app.getUndoStack().add(command);
            
            // set shape on
            var shape = group.getChildren( function (node) {
                return node.name() === 'shape';
            })[0];
            self.setShapeOn( shape );
        }
        // reset flag
        started = false;
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
        app.onKeydown(event);
    };

    /**
     * Setup the tool GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui = new dwv.gui.Draw(app);
        gui.setup(this.shapeFactoryList);
    };
    
    /**
     * Enable the tool.
     * @method enable
     * @param {Boolean} flag The flag to enable or not.
     */
    this.display = function ( flag ){
        if ( gui ) {
            gui.display( flag );
        }
        // reset shape display properties
        shapeEditor.disable();
        shapeEditor.setShape(null);
        shapeEditor.setImage(null);
        document.body.style.cursor = 'default';
        // make layer listen or not to events
        app.getDrawStage().listening( flag );
        drawLayer = app.getDrawLayer();
        drawLayer.listening( flag );
        drawLayer.hitGraphEnabled( flag );
        // get the list of shapes
        var groups = drawLayer.getChildren();
        var shapes = [];
        var fshape = function (node) {
            return node.name() === 'shape';
        };
        for ( var i = 0; i < groups.length; ++i ) {
            // should only be one shape per group
            shapes.push( groups[i].getChildren(fshape)[0] );
        }
        // set shape display properties
        if ( flag ) {
            app.addLayerListeners( app.getDrawStage().getContent() );
            shapes.forEach( function (shape){ self.setShapeOn( shape ); });
        }
        else {
            app.removeLayerListeners( app.getDrawStage().getContent() );
            shapes.forEach( function (shape){ setShapeOff( shape ); });
        }
        // draw
        drawLayer.draw();
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
        var stage = app.getDrawStage();
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
        var dragLastPos = null;
        
        // command name based on shape type
        var cmdName = "shape";
        if ( shape instanceof Kinetic.Line ) {
            if ( shape.points().length == 4 ) {
                cmdName = "line";
            }
            else if ( shape.points().length == 6 ) {
                cmdName = "protractor";
            }
            else {
                cmdName = "roi";
            }
        }
        else if ( shape instanceof Kinetic.Rect ) {
            cmdName = "rectangle";
        }
        else if ( shape instanceof Kinetic.Ellipse ) {
            cmdName = "ellipse";
        }
        
        // shape colour
        var colour = shape.stroke();
        
        // drag start event handling
        shape.on('dragstart', function (event) {
            // save start position
            var offset = dwv.html.getEventOffset( event.evt )[0];
            dragStartPos = getRealPosition( offset );
            // display trash
            var stage = app.getDrawStage();
            var scale = stage.scale();
            var invscale = {'x': 1/scale.x, 'y': 1/scale.y};
            trash.x( stage.offset().x + ( 256 / scale.x ) );
            trash.y( stage.offset().y + ( 20 / scale.y ) );
            trash.scale( invscale );
            drawLayer.add( trash );
            // deactivate anchors to avoid events on null shape
            shapeEditor.setAnchorsActive(false);
            // draw
            drawLayer.draw();
        });
        // drag move event handling
        shape.on('dragmove', function (event) {
            var offset = dwv.html.getEventOffset( event.evt )[0];
            var pos = getRealPosition( offset );
            var translation;
            if ( dragLastPos ) {
                translation = {'x': pos.x - dragLastPos.x, 
                    'y': pos.y - dragLastPos.y};
            }
            else {
                translation = {'x': pos.x - dragStartPos.x, 
                        'y': pos.y - dragStartPos.y};
            }
            dragLastPos = pos;
            // highlight trash when on it
            if ( Math.abs( pos.x - trash.x() ) < 10 &&
                    Math.abs( pos.y - trash.y() ) < 10   ) {
                trash.getChildren().each( function (tshape){ tshape.stroke('orange'); });
                shape.stroke('red');
            }
            else {
                trash.getChildren().each( function (tshape){ tshape.stroke('red'); });
                shape.stroke(colour);
            }
            // update group but not 'this' shape
            var group = this.getParent();
            group.getChildren().each( function (shape) {
                if ( shape === this ) {
                    return;
                }
                shape.x( shape.x() + translation.x );
                shape.y( shape.y() + translation.y );
            });
            // reset anchors
            shapeEditor.resetAnchors();
            // draw
            drawLayer.draw();
        });
        // drag end event handling
        shape.on('dragend', function (/*event*/) {
            var pos = dragLastPos;
            dragLastPos = null;
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
                // restore colour
                shape.stroke(colour);
                // disable editor
                shapeEditor.disable();
                shapeEditor.setShape(null);
                shapeEditor.setImage(null);
                document.body.style.cursor = 'default';
                // delete command
                var delcmd = new dwv.tool.DeleteGroupCommand(this.getParent(), cmdName, drawLayer);
                delcmd.onExecute = fireEvent;
                delcmd.onUndo = fireEvent;
                delcmd.execute();
                app.getUndoStack().add(delcmd);
            }
            else {
                // save drag move
                var translation = {'x': pos.x - dragStartPos.x, 
                        'y': pos.y - dragStartPos.y};
                if ( translation.x !== 0 || translation.y !== 0 ) {
                    var mvcmd = new dwv.tool.MoveGroupCommand(this.getParent(), cmdName, translation, drawLayer);
                    mvcmd.onExecute = fireEvent;
                    mvcmd.onUndo = fireEvent;
                    app.getUndoStack().add(mvcmd);
                    // the move is handled by kinetic, trigger an event manually
                    fireEvent({'type': 'draw-move'});
                }
                // reset anchors
                shapeEditor.setAnchorsActive(true);
                shapeEditor.resetAnchors();
            }
            // remove trash
            trash.remove();
            // draw
            drawLayer.draw();
        });
    };

    /**
     * Initialise the tool.
     * @method init
     */
    this.init = function() {
        // set the default to the first in the list
        var shapeName = 0;
        for( var key in this.shapeFactoryList ){
            shapeName = key;
            break;
        }
        this.setShapeName(shapeName);
        // init gui
        if ( gui ) {
            // same for colour
            this.setLineColour(gui.getColours()[0]);
            // init html
            gui.initialise();
        }
        return true;
    };

    /**
     * Add an event listener on the app.
     * @method addEventListener
     * @param {String} type The event type.
     * @param {Object} listener The method associated with the provided event type.
     */
    this.addEventListener = function (type, listener)
    {
        if ( typeof listeners[type] === "undefined" ) {
            listeners[type] = [];
        }
        listeners[type].push(listener);
    };

    /**
     * Remove an event listener from the app.
     * @method removeEventListener
     * @param {String} type The event type.
     * @param {Object} listener The method associated with the provided event type.
     */
    this.removeEventListener = function (type, listener)
    {
        if( typeof listeners[type] === "undefined" ) {
            return;
        }
        for ( var i = 0; i < listeners[type].length; ++i )
        {   
            if ( listeners[type][i] === listener ) {
                listeners[type].splice(i,1);
            }
        }
    };

    /**
     * Set the line colour of the drawing.
     * @method setLineColour
     * @param {String} colour The colour to set.
     */
    this.setLineColour = function (colour)
    {
        app.getStyle().setLineColour(colour);
    };

    // Private Methods -----------------------------------------------------------

    /**
     * Fire an event: call all associated listeners.
     * @method fireEvent
     * @param {Object} event The event to fire.
     */
    function fireEvent (event)
    {
        if ( typeof listeners[event.type] === "undefined" ) {
            return;
        }
        for ( var i=0; i < listeners[event.type].length; ++i )
        {   
            listeners[event.type][i](event);
        }
    }

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
            "Choose the shape and its colour from the drop down menus. Once created, shapes " +
            "can be edited by selecting them. Anchors will appear and allow specific shape edition. " +
            "Drag the shape on the top red cross to delete it. All actions are undoable. ",
        'mouse': {
            'mouse_drag': "A single mouse drag draws the desired shape.",
        },
        'touch': {
            'touch_drag': "A single touch drag draws the desired shape.",
        }
    };
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
    return this.shapeFactoryList[name];
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
dwv.tool.ShapeEditor = function (app)
{
    /**
     * Edited shape.
     * @property shape
     * @private
     * @type Object
     */
    var shape = null;
    /**
     * Edited image. Used for quantification update.
     * @property image
     * @private
     * @type Object
     */
    var image = null;
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
     * @type Function
     */
    var updateFunction = null;
    /**
     * Draw event callback.
     * @property drawEventCallback
     * @private
     * @type Function
     */
    var drawEventCallback = null;
    
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
     * Set the associated image.
     * @method setImage
     * @param {Object} img The associated image.
     */
    this.setImage = function ( img ) {
        image = img;
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
     * Set the draw event callback.
     * @method setDrawEventCallback
     * @param {Object} callback The callback.
     */
    this.setDrawEventCallback = function ( callback ) {
        drawEventCallback = callback;
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
            if ( points.length === 4 || points.length === 6) {
                // add shape offset
                var p0x = points[0] + shape.x();
                var p0y = points[1] + shape.y();
                var p1x = points[2] + shape.x();
                var p1y = points[3] + shape.y();
                addAnchor(group, p0x, p0y, 'begin');
                if ( points.length === 4 ) {
                    updateFunction = dwv.tool.UpdateLine;
                    addAnchor(group, p1x, p1y, 'end');
                }
                else {
                    updateFunction = dwv.tool.UpdateProtractor;
                    addAnchor(group, p1x, p1y, 'mid');
                    var p2x = points[4] + shape.x();
                    var p2y = points[5] + shape.y();
                    addAnchor(group, p2x, p2y, 'end');
                }
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
            strokeWidth: app.getStyle().getScaledStrokeWidth(),
            radius: app.getStyle().scale(6),
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
        
        // command name based on shape type
        var cmdName = "shape";
        if ( shape instanceof Kinetic.Line ) {
            if ( shape.points().length == 4 ) {
                cmdName = "line";
            }
            else if ( shape.points().length == 6 ) {
                cmdName = "protractor";
            }
            else {
                cmdName = "roi";
            }
        }
        else if ( shape instanceof Kinetic.Rect ) {
            cmdName = "rectangle";
        }
        else if ( shape instanceof Kinetic.Ellipse ) {
            cmdName = "ellipse";
        }

        // drag start listener
        anchor.on('dragstart', function () {
            startAnchor = getClone(this);
        });
        // drag move listener
        anchor.on('dragmove', function () {
            if ( updateFunction ) {
                updateFunction(this, image);
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
            var chgcmd = new dwv.tool.ChangeGroupCommand(
                    cmdName, updateFunction, startAnchor, endAnchor, this.getLayer(), image);
            chgcmd.onExecute = drawEventCallback;
            chgcmd.onUndo = drawEventCallback;
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
 * Ellipse factory.
 * @class EllipseFactory
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.EllipseFactory = function ()
{
    /** 
     * Get the number of points needed to build the shape.
     * @method getNPoints
     * @return {Number} The number of points.
     */
    this.getNPoints = function () { return 2; };
    /** 
     * Get the timeout between point storage.
     * @method getTimeout
     * @return {Number} The timeout in milliseconds.
     */
    this.getTimeout = function () { return 0; };
};  

/**
 * Create an ellipse shape to be displayed.
 * @method create
 * @param {Array} points The points from which to extract the ellipse.
 * @param {Object} style The drawing style.
 * @param {Object} image The associated image.
 */ 
dwv.tool.EllipseFactory.prototype.create = function (points, style, image)
{
    // calculate radius
    var a = Math.abs(points[0].getX() - points[1].getX());
    var b = Math.abs(points[0].getY() - points[1].getY());
    // physical shape
    var ellipse = new dwv.math.Ellipse(points[0], a, b);
    // draw shape
    var kshape = new Kinetic.Ellipse({
        x: ellipse.getCenter().getX(),
        y: ellipse.getCenter().getY(),
        radius: { x: ellipse.getA(), y: ellipse.getB() },
        stroke: style.getLineColour(),
        strokeWidth: style.getScaledStrokeWidth(),
        name: "shape"
    });
    // quantification
    var quant = image.quantifyEllipse( ellipse );
    var cm2 = quant.surface / 100;
    var str = cm2.toPrecision(4) + " cm2";
    // quantification text
    var ktext = new Kinetic.Text({
        x: ellipse.getCenter().getX(),
        y: ellipse.getCenter().getY(),
        text: str,
        fontSize: style.getScaledFontSize(),
        fontFamily: style.getFontFamily(),
        fill: style.getLineColour(),
        name: "text"
    });
    // return group
    var group = new Kinetic.Group();
    group.name("ellipse-group");
    group.add(kshape);
    group.add(ktext);
    return group;
};

/**
 * Update an ellipse shape.
 * @method UpdateEllipse
 * @static
 * @param {Object} anchor The active anchor.
 * @param {Object} image The associated image.
 */ 
dwv.tool.UpdateEllipse = function (anchor, image)
{
    // parent group
    var group = anchor.getParent();
    // associated shape
    var kellipse = group.getChildren( function (node) {
        return node.name() === 'shape';
    })[0];
    // associated text
    var ktext = group.getChildren(function(node){
        return node.name() === 'text';
    })[0];
    // find special points
    var topLeft = group.getChildren( function (node) {
        return node.id() === 'topLeft';
    })[0];
    var topRight = group.getChildren( function (node) {
        return node.id() === 'topRight';
    })[0];
    var bottomRight = group.getChildren( function (node) {
        return node.id() === 'bottomRight';
    })[0];
    var bottomLeft = group.getChildren( function (node) {
        return node.id() === 'bottomLeft';
    })[0];
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
    kellipse.position( center );
    var radiusAbs = { 'x': Math.abs(radiusX), 'y': Math.abs(radiusY) };
    if ( radiusAbs ) {
        kellipse.radius( radiusAbs );
    }
    // update text
    var ellipse = new dwv.math.Ellipse(center, radiusX, radiusY);
    var quant = image.quantifyEllipse( ellipse );
    var cm2 = quant.surface / 100;
    var str = cm2.toPrecision(4) + " cm2";
    var textPos = { 'x': center.x, 'y': center.y };
    ktext.position(textPos);
    ktext.text(str);
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
 * @param {Array} filterList The list of filter objects.
 * @param {Object} gui The associated gui.
 */
dwv.tool.Filter = function ( filterList, app )
{
    /**
     * Filter GUI.
     * @property gui
     * @type Object
     */
    var gui = null;
    /**
     * Filter list
     * @property filterList
     * @type Object
     */
    this.filterList = filterList;
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
    /**
     * Display Flag.
     * @property displayed
     * @type Boolean
     */
    this.displayed = false;
    
    /**
     * Setup the filter GUI.
     * @method setup
     */
    this.setup = function ()
    {
        if ( Object.keys(this.filterList).length !== 0 ) {
            gui = new dwv.gui.Filter(app);
            gui.setup(this.filterList);
            for( var key in this.filterList ){
                this.filterList[key].setup();
            }
        }
    };

    /**
     * Enable the filter.
     * @method enable
     * @param {Boolean} bool Flag to enable or not.
     */
    this.display = function (bool)
    {
        if ( gui ) {
            gui.display(bool);
        }
        this.displayed = bool;
        // display the selected filter
        this.selectedFilter.display(bool);
    };

    /**
     * Initialise the filter.
     * @method init
     */
    this.init = function ()
    {
        // set the default to the first in the list
        for( var key in this.filterList ){
            this.defaultFilterName = key;
            break;
        }
        this.setSelectedFilter(this.defaultFilterName);
        // init all filters
        for( key in this.filterList ) {
            this.filterList[key].init();
        }    
        // init html
        if ( gui ) {
            gui.initialise();
        }
        return true;
    };

    /**
     * Handle keydown event.
     * @method keydown
     * @param {Object} event The keydown event.
     */
    this.keydown = function (event)
    {
        app.onKeydown(event);
    };

}; // class dwv.tool.Filter

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.Filter.prototype.getHelp = function ()
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
 * Get the selected filter.
 * @method getSelectedFilter
 * @return {Object} The selected filter.
 */
dwv.tool.Filter.prototype.getSelectedFilter = function ()
{
    return this.selectedFilter;
};

/**
 * Set the selected filter.
 * @method setSelectedFilter
 * @return {String} The name of the filter to select.
 */
dwv.tool.Filter.prototype.setSelectedFilter = function (name)
{
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
    this.selectedFilter = this.filterList[name];
    // display the selected filter
    if( this.displayed )
    {
        this.selectedFilter.display(true);
    }
};

/**
 * Get the list of filters.
 * @method getFilterList
 * @return {Array} The list of filter objects.
 */
dwv.tool.Filter.prototype.getFilterList = function ()
{
    return this.filterList;
};

/**
 * Check if a filter is in the filter list.
 * @method hasFilter
 * @param {String} name The name to check.
 * @return {String} The filter list element for the given name.
 */
dwv.tool.Filter.prototype.hasFilter = function (name)
{
    return this.filterList[name];
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
dwv.tool.filter.Threshold = function ( app )
{
    /**
     * Filter GUI.
     * @property gui
     * @type Object
     */
    var gui = new dwv.gui.Threshold(app);
    
    /**
     * Setup the filter GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui.setup();
    };

    /**
     * Display the filter.
     * @method display
     * @param {Boolean} bool Flag to display or not.
     */
    this.display = function (bool)
    {
        gui.display(bool);
    };
    
    /**
     * Initialise the filter.
     * @method init
     */
    this.init = function ()
    {
        gui.initialise();
    };
    
    /**
     * Run the filter.
     * @method run
     * @param {Mixed} args The filter arguments.
     */
    this.run = function (args)
    {
        var filter = new dwv.image.filter.Threshold();
        filter.setMin(args.min);
        filter.setMax(args.max);
        var command = new dwv.tool.RunFilterCommand(filter, app);
        command.execute();
        // save command in undo stack
        app.getUndoStack().add(command);
    };
    
}; // class dwv.tool.filter.Threshold


/**
 * Sharpen filter tool.
 * @class Sharpen
 * @namespace dwv.tool.filter
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.filter.Sharpen = function ( app )
{
    /**
     * Filter GUI.
     * @property gui
     * @type Object
     */
    var gui = new dwv.gui.Sharpen(app);
    
    /**
     * Setup the filter GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui.setup();
    };

    /**
     * Display the filter.
     * @method display
     * @param {Boolean} bool Flag to enable or not.
     */
    this.display = function (bool)
    {
        gui.display(bool);
    };
    
    /**
     * Initialise the filter.
     * @method init
     */
    this.init = function()
    {
        // nothing to do...
    };
    
    /**
     * Run the filter.
     * @method run
     * @param {Mixed} args The filter arguments.
     */
    this.run = function(/*args*/)
    {
        var filter = new dwv.image.filter.Sharpen();
        var command = new dwv.tool.RunFilterCommand(filter, app);
        command.execute();
        // save command in undo stack
        app.getUndoStack().add(command);
    };

}; // dwv.tool.filter.Sharpen

/**
 * Sobel filter tool.
 * @class Sobel
 * @namespace dwv.tool.filter
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.filter.Sobel = function ( app )
{
    /**
     * Filter GUI.
     * @property gui
     * @type Object
     */
    var gui = new dwv.gui.Sobel(app);
    
    /**
     * Setup the filter GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui.setup();
    };

    /**
     * Enable the filter.
     * @method enable
     * @param {Boolean} bool Flag to enable or not.
     */
    this.display = function(bool)
    {
        gui.display(bool);
    };
    
    /**
     * Initialise the filter.
     * @method init
     */
    this.init = function()
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

}; // class dwv.tool.filter.Sobel

/**
 * Run filter command.
 * @class RunFilterCommand
 * @namespace dwv.tool
 * @constructor
 * @param {Object} filter The filter to run.
 * @param {Object} app The associated application.
 */
dwv.tool.RunFilterCommand = function (filter, app) {
    
    /**
     * Get the command name.
     * @method getName
     * @return {String} The command name.
     */
    this.getName = function () { return "Filter-" + filter.getName(); };

    /**
     * Execute the command.
     * @method execute
     */
    this.execute = function ()
    {
        filter.setOriginalImage(app.getImage());
        app.setImage(filter.update());
        app.render();
    }; 
    /**
     * Undo the command.
     * @method undo
     */
    this.undo = function () {
        app.setImage(filter.getOriginalImage());
        app.render();
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
 * WindowLevel info layer.
 * @class Windowing
 * @namespace dwv.info
 * @constructor
 * @param {Object} div The HTML element to add WindowLevel info to.
 */
dwv.info.Windowing = function ( div )
{
    /**
     * Create the windowing info div.
     * @method create
     */
    this.create = function ()
    {
        // clean div
        var elems = div.getElementsByClassName("wl-info");
        if ( elems.length !== 0 ) {
            dwv.html.removeNodes(elems);
        }
        // create windowing list
        var ul = document.createElement("ul");
        ul.className = "wl-info";
        // window center list item
        var liwc = document.createElement("li");
        liwc.className = "window-center";
        ul.appendChild(liwc);
        // window width list item
        var liww = document.createElement("li");
        liww.className = "window-width";
        ul.appendChild(liww);
        // add list to div
        div.appendChild(ul);
    };
    
    /**
     * Update the windowing info div.
     * @method update
     * @param {Object} event The windowing change event containing the new values as {wc,ww}.
     * Warning: expects the windowing info div to exist (use after create).
     */
    this.update = function (event)
    {
        // window center list item
        var liwc = div.getElementsByClassName("window-center")[0];
        dwv.html.cleanNode(liwc);
        liwc.appendChild(document.createTextNode("WindowCenter = "+event.wc));
        // window width list item
        var liww = div.getElementsByClassName("window-width")[0];
        dwv.html.cleanNode(liww);
        liww.appendChild(document.createTextNode("WindowWidth = "+event.ww));
    };
    
}; // class dwv.info.Windowing

/**
 * Position info layer.
 * @class Position
 * @namespace dwv.info
 * @constructor
 * @param {Object} div The HTML element to add Position info to.
 */
dwv.info.Position = function ( div )
{
    /**
     * Create the position info div.
     * @method create
     */
    this.create = function ()
    {
        // clean div
        var elems = div.getElementsByClassName("pos-info");
        if ( elems.length !== 0 ) {
            dwv.html.removeNodes(elems);
        }
        // position list
        var ul = document.createElement("ul");
        ul.className = "pos-info";
        // position
        var lipos = document.createElement("li");
        lipos.className = "position";
        ul.appendChild(lipos);
        // value
        var livalue = document.createElement("li");
        livalue.className = "value";
        ul.appendChild(livalue);
        // add list to div
        div.appendChild(ul);
    };
    
    /**
     * Update the position info div.
     * @method update
     * @param {Object} event The position change event containing the new values as {i,j,k}
     *  and optional 'value'.
     * Warning: expects the position info div to exist (use after create).
     */
    this.update = function (event)
    {
        // position list item
        var lipos = div.getElementsByClassName("position")[0];
        dwv.html.cleanNode(lipos);
        lipos.appendChild(document.createTextNode(
            "Pos = "+event.i+", "+event.j+", "+event.k));
        // value list item
        if( typeof(event.value) != "undefined" )
        {
            var livalue = div.getElementsByClassName("value")[0];
            dwv.html.cleanNode(livalue);
            livalue.appendChild(document.createTextNode("Value = "+event.value));
        }
    };
}; // class dwv.info.Position

/**
 * MiniColourMap info layer.
 * @class MiniColourMap
 * @namespace dwv.info
 * @constructor
 * @param {Object} div The HTML element to add colourMap info to.
 * @param {Object} app The associated application.
 */
dwv.info.MiniColourMap = function ( div, app )
{
    /**
     * Create the mini colour map info div.
     * @method create
     */
    this.create = function ()
    {    
        // clean div
        var elems = div.getElementsByClassName("colour-map-info");
        if ( elems.length !== 0 ) {
            dwv.html.removeNodes(elems);
        }
        // colour map
        var canvas = document.createElement("canvas");
        canvas.className = "colour-map-info";
        canvas.width = 98;
        canvas.height = 10;
        // add canvas to div
        div.appendChild(canvas);
    };
    
    /**
     * Update the mini colour map info div.
     * @method update
     * @param {Object} event The windowing change event containing the new values.
     * Warning: expects the mini colour map div to exist (use after createMiniColourMap).
     */
    this.update = function (event)
    {    
        var windowCenter = event.wc;
        var windowWidth = event.ww;
        
        var canvas = div.getElementsByClassName("colour-map-info")[0];
        var context = canvas.getContext('2d');
        
        // fill in the image data
        var colourMap = app.getViewController().getColourMap();
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
}; // class dwv.info.MiniColourMap


/**
 * Plot info layer.
 * @class Plot
 * @namespace dwv.info
 * @constructor
 * @param {Object} div The HTML element to add colourMap info to.
 * @param {Object} app The associated application.
 */
dwv.info.Plot = function (div, app)
{
    /**
     * Create the plot info.
     * @method create
     */
    this.create = function()
    {
        // clean div
        if ( div ) {
            dwv.html.cleanNode(div);
        }
        // create
        $.plot(div, [ app.getImage().getHistogram() ], {
            "bars": { "show": true },
            "grid": { "backgroundcolor": null },
            "xaxis": { "show": true },
            "yaxis": { "show": false }
        });
    };

    /**
     * Update plot.
     * @method update
     * @param {Object} event The windowing change event containing the new values.
     * Warning: expects the plot to exist (use after createPlot).
     */
    this.update = function (event)
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
    
        $.plot(div, [ app.getImage().getHistogram() ], {
            "bars": { "show": true },
            "grid": { "markings": markings, "backgroundcolour": null },
            "xaxis": { "show": false },
            "yaxis": { "show": false }
        });
    };

}; // class dwv.info.Plot
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/** 
 * Line factory.
 * @class LineFactory
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.LineFactory = function ()
{
    /** 
     * Get the number of points needed to build the shape.
     * @method getNPoints
     * @return {Number} The number of points.
     */
    this.getNPoints = function () { return 2; };
    /** 
     * Get the timeout between point storage.
     * @method getTimeout
     * @return {Number} The timeout in milliseconds.
     */
    this.getTimeout = function () { return 0; };
};  

/**
 * Create a line shape to be displayed.
 * @method create
 * @param {Array} points The points from which to extract the line.
 * @param {Object} style The drawing style.
 * @param {Object} image The associated image.
 */ 
dwv.tool.LineFactory.prototype.create = function (points, style, image)
{
    // physical shape
    var line = new dwv.math.Line(points[0], points[1]);
    // draw shape
    var kshape = new Kinetic.Line({
        points: [line.getBegin().getX(), line.getBegin().getY(), 
                 line.getEnd().getX(), line.getEnd().getY() ],
        stroke: style.getLineColour(),
        strokeWidth: style.getScaledStrokeWidth(),
        name: "shape"
    });
    // quantification
    var quant = image.quantifyLine( line );
    var str = quant.length.toPrecision(4) + " mm";
    // quantification text
    var dX = line.getBegin().getX() > line.getEnd().getX() ? 0 : -1;
    var dY = line.getBegin().getY() > line.getEnd().getY() ? -1 : 0.5;
    var ktext = new Kinetic.Text({
        x: line.getEnd().getX() + dX * 25,
        y: line.getEnd().getY() + dY * 15,
        text: str,
        fontSize: style.getScaledFontSize(),
        fontFamily: style.getFontFamily(),
        fill: style.getLineColour(),
        name: "text"
    });
    // return group
    var group = new Kinetic.Group();
    group.name("line-group");
    group.add(kshape);
    group.add(ktext);
    return group;
};

/**
 * Update a line shape.
 * @method UpdateLine
 * @static
 * @param {Object} anchor The active anchor.
 * @param {Object} image The associated image.
 */ 
dwv.tool.UpdateLine = function (anchor, image)
{
    // parent group
    var group = anchor.getParent();
    // associated shape
    var kline = group.getChildren( function (node) {
        return node.name() === 'shape';
    })[0];
    // associated text
    var ktext = group.getChildren( function (node) {
        return node.name() === 'text';
    })[0];
    // find special points
    var begin = group.getChildren( function (node) {
        return node.id() === 'begin';
    })[0];
    var end = group.getChildren( function (node) {
        return node.id() === 'end';
    })[0];
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
    var bx = begin.x() - kline.x();
    var by = begin.y() - kline.y();
    var ex = end.x() - kline.x();
    var ey = end.y() - kline.y();
    kline.points( [bx,by,ex,ey] );
    // update text
    var p2d0 = new dwv.math.Point2D(begin.x(), begin.y());
    var p2d1 = new dwv.math.Point2D(end.x(), end.y());
    var line = new dwv.math.Line(p2d0, p2d1);
    var quant = image.quantifyLine( line );
    var str = quant.length.toPrecision(4) + " mm";
    var dX = line.getBegin().getX() > line.getEnd().getX() ? 0 : -1;
    var dY = line.getBegin().getY() > line.getEnd().getY() ? -1 : 0.5;
    var textPos = { 
        'x': line.getEnd().getX() + dX * 25,
        'y': line.getEnd().getY() + dY * 15, };
    ktext.position( textPos );
    ktext.text(str);
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

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
     * Livewire GUI.
     * @property gui
     * @type Object
     */
    var gui = null;
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
        var nrows = app.getImage().getGeometry().getSize().getNumberOfRows();
        for( var i = 0; i < nrows; ++i ) {
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
        
        // remove previous draw
        if ( shapeGroup ) {
            shapeGroup.destroy();
        }
        // create shape
        var factory = new dwv.tool.RoiFactory();
        shapeGroup = factory.create(currentPath.pointArray, self.style);
        // draw shape command
        command = new dwv.tool.DrawGroupCommand(shapeGroup, "livewire", app.getDrawLayer());
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
        app.onKeydown(event);
    };

    /**
     * Setup the tool GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui = new dwv.gui.Livewire(app);
        gui.setup();
    };
    
    /**
     * Enable the tool.
     * @method enable
     * @param {Boolean} bool The flag to enable or not.
     */
    this.display = function(bool){
        if ( gui ) {
            gui.display(bool);
        }
        // TODO why twice?
        this.init();
    };

    /**
     * Initialise the tool.
     * @method init
     */
    this.init = function()
    {
        if ( gui ) {
            // set the default to the first in the list
            this.setLineColour(gui.getColours()[0]);
            // init html
            gui.initialise();
        }
        
        //scissors = new dwv.math.Scissors();
        var size = app.getImage().getGeometry().getSize();
        scissors.setDimensions(
                size.getNumberOfColumns(),
                size.getNumberOfRows() );
        scissors.setData(app.getImageData().data);
        
        return true;
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
 * Set the line colour of the drawing.
 * @method setLineColour
 * @param {String} colour The colour to set.
 */
dwv.tool.Livewire.prototype.setLineColour = function(colour)
{
    // set style var
    this.style.setLineColour(colour);
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/** 
 * Protractor factory.
 * @class ProtractorFactory
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.ProtractorFactory = function ()
{
    /** 
     * Get the number of points needed to build the shape.
     * @method getNPoints
     * @return {Number} The number of points.
     */
    this.getNPoints = function () { return 3; };
    /** 
     * Get the timeout between point storage.
     * @method getTimeout
     * @return {Number} The timeout in milliseconds.
     */
    this.getTimeout = function () { return 500; };
};  

/**
 * Create a protractor shape to be displayed.
 * @method ProtractorCreator
 * @static
 * @param {Array} points The points from which to extract the protractor.
 * @param {Object} style The drawing style.
 * @param {Object} image The associated image.
 */ 
dwv.tool.ProtractorFactory.prototype.create = function (points, style/*, image*/)
{
    // physical shape
    var line0 = new dwv.math.Line(points[0], points[1]);
    // points stored the kineticjs way
    var pointsArray = [];
    for( var i = 0; i < points.length; ++i )
    {
        pointsArray.push( points[i].getX() );
        pointsArray.push( points[i].getY() );
    }
    // draw shape
    var kshape = new Kinetic.Line({
        points: pointsArray,
        stroke: style.getLineColour(),
        strokeWidth: style.getScaledStrokeWidth(),
        name: "shape"
    });
    var group = new Kinetic.Group();
    group.name("protractor-group");
    group.add(kshape);
    // text and decoration
    if ( points.length == 3 ) {
        var line1 = new dwv.math.Line(points[1], points[2]);
        // quantification
        var angle = dwv.math.getAngle(line0, line1);
        var inclination = line0.getInclination();
        if ( angle > 180 ) {
            angle = 360 - angle;
            inclination += angle;
        }
        var angleStr = angle.toPrecision(4) + "\u00B0";
        // quantification text
        var midX = ( line0.getMidpoint().getX() + line1.getMidpoint().getX() ) / 2;
        var midY = ( line0.getMidpoint().getY() + line1.getMidpoint().getY() ) / 2;
        var ktext = new Kinetic.Text({
            x: midX,
            y: midY - 15,
            text: angleStr,
            fontSize: style.getScaledFontSize(),
            fontFamily: style.getFontFamily(),
            fill: style.getLineColour(),
            name: "text"
        });
        // arc
        var radius = Math.min(line0.getLength(), line1.getLength()) * 33 / 100;
        var karc = new Kinetic.Arc({
            innerRadius: radius,
            outerRadius: radius,
            stroke: style.getLineColour(),
            strokeWidth: style.getScaledStrokeWidth(),
            angle: angle,
            rotationDeg: -inclination,
            x: points[1].getX(),
            y: points[1].getY(),
            name: "arc"
         });
        // add to group
        group.add(ktext);
        group.add(karc);
    }
    // return group
    return group;
};

/**
 * Update a protractor shape.
 * @method UpdateProtractor
 * @static
 * @param {Object} anchor The active anchor.
 * @param {Object} image The associated image.
 */ 
dwv.tool.UpdateProtractor = function (anchor/*, image*/)
{
    // parent group
    var group = anchor.getParent();
    // associated shape
    var kline = group.getChildren( function (node) {
        return node.name() === 'shape';
    })[0];
    // associated text
    var ktext = group.getChildren( function (node) {
        return node.name() === 'text';
    })[0];
    // associated arc
    var karc = group.getChildren( function (node) {
        return node.name() === 'arc';
    })[0];
    // find special points
    var begin = group.getChildren( function (node) {
        return node.id() === 'begin';
    })[0];
    var mid = group.getChildren( function (node) {
        return node.id() === 'mid';
    })[0];
    var end = group.getChildren( function (node) {
        return node.id() === 'end';
    })[0];
    // update special points
    switch ( anchor.id() ) {
    case 'begin':
        begin.x( anchor.x() );
        begin.y( anchor.y() );
        break;
    case 'mid':
        mid.x( anchor.x() );
        mid.y( anchor.y() );
        break;
    case 'end':
        end.x( anchor.x() );
        end.y( anchor.y() );
        break;
    }
    // update shape and compensate for possible drag
    // note: shape.position() and shape.size() won't work...
    var bx = begin.x() - kline.x();
    var by = begin.y() - kline.y();
    var mx = mid.x() - kline.x();
    var my = mid.y() - kline.y();
    var ex = end.x() - kline.x();
    var ey = end.y() - kline.y();
    kline.points( [bx,by,mx,my,ex,ey] );
    // update text
    var p2d0 = new dwv.math.Point2D(begin.x(), begin.y());
    var p2d1 = new dwv.math.Point2D(mid.x(), mid.y());
    var p2d2 = new dwv.math.Point2D(end.x(), end.y());
    var line0 = new dwv.math.Line(p2d0, p2d1);
    var line1 = new dwv.math.Line(p2d1, p2d2);
    var angle = dwv.math.getAngle(line0, line1);
    var inclination = line0.getInclination();
    if ( angle > 180 ) {
        angle = 360 - angle;
        inclination += angle;
    }
    var str = angle.toPrecision(4) + "\u00B0";
    var midX = ( line0.getMidpoint().getX() + line1.getMidpoint().getX() ) / 2;
    var midY = ( line0.getMidpoint().getY() + line1.getMidpoint().getY() ) / 2;
    var textPos = { 'x': midX, 'y': midY - 15 };
    ktext.position( textPos );
    ktext.text(str);
    // arc
    var radius = Math.min(line0.getLength(), line1.getLength()) * 33 / 100;
    karc.innerRadius(radius);
    karc.outerRadius(radius);
    karc.angle(angle);
    karc.rotation(-inclination);
    var arcPos = { 'x': mid.x(), 'y': mid.y() };
    karc.position(arcPos);
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/** 
 * Rectangle factory.
 * @class RectangleFactory
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.RectangleFactory = function ()
{
    /** 
     * Get the number of points needed to build the shape.
     * @method getNPoints
     * @return {Number} The number of points.
     */
    this.getNPoints = function () { return 2; };
    /** 
     * Get the timeout between point storage.
     * @method getTimeout
     * @return {Number} The timeout in milliseconds.
     */
    this.getTimeout = function () { return 0; };
};  

/**
 * Create a rectangle shape to be displayed.
 * @method create
 * @param {Array} points The points from which to extract the rectangle.
 * @param {Object} style The drawing style.
 * @param {Object} image The associated image.
 */ 
dwv.tool.RectangleFactory.prototype.create = function (points, style, image)
{
    // physical shape
    var rectangle = new dwv.math.Rectangle(points[0], points[1]);
    // draw shape
    var kshape = new Kinetic.Rect({
        x: rectangle.getBegin().getX(),
        y: rectangle.getBegin().getY(),
        width: rectangle.getWidth(),
        height: rectangle.getHeight(),
        stroke: style.getLineColour(),
        strokeWidth: style.getScaledStrokeWidth(),
        name: "shape"
    });
    // quantification
    var quant = image.quantifyRect( rectangle );
    var cm2 = quant.surface / 100;
    var str = cm2.toPrecision(4) + " cm2";
    // quantification text
    var ktext = new Kinetic.Text({
        x: rectangle.getBegin().getX(),
        y: rectangle.getEnd().getY() + 10,
        text: str,
        fontSize: style.getScaledFontSize(),
        fontFamily: style.getFontFamily(),
        fill: style.getLineColour(),
        name: "text"
    });
    // return group
    var group = new Kinetic.Group();
    group.name("rectangle-group");
    group.add(kshape);
    group.add(ktext);
    return group;
};

/**
 * Update a rectangle shape.
 * @method UpdateRect
 * @static
 * @param {Object} anchor The active anchor.
 * @param {Object} image The associated image.
 */ 
dwv.tool.UpdateRect = function (anchor, image)
{
    // parent group
    var group = anchor.getParent();
    // associated shape
    var krect = group.getChildren( function (node) {
        return node.name() === 'shape';
    })[0];
    // associated text
    var ktext = group.getChildren( function (node) {
        return node.name() === 'text';
    })[0];
    // find special points
    var topLeft = group.getChildren( function (node) {
        return node.id() === 'topLeft';
    })[0];
    var topRight = group.getChildren( function (node) {
        return node.id() === 'topRight';
    })[0];
    var bottomRight = group.getChildren( function (node) {
        return node.id() === 'bottomRight';
    })[0];
    var bottomLeft = group.getChildren( function (node) {
        return node.id() === 'bottomLeft';
    })[0];
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
    krect.position(topLeft.position());
    var width = topRight.x() - topLeft.x();
    var height = bottomLeft.y() - topLeft.y();
    if ( width && height ) {
        krect.size({'width': width, 'height': height});
    }
    // update text
    var p2d0 = new dwv.math.Point2D(topLeft.x(), topLeft.y());
    var p2d1 = new dwv.math.Point2D(bottomRight.x(), bottomRight.y());
    var rect = new dwv.math.Rectangle(p2d0, p2d1);
    var quant = image.quantifyRect( rect );
    var cm2 = quant.surface / 100;
    var str = cm2.toPrecision(4) + " cm2";
    var textPos = { 'x': rect.getBegin().getX(), 'y': rect.getEnd().getY() + 10 };
    ktext.position(textPos);
    ktext.text(str);
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/** 
 * ROI factory.
 * @class RoiFactory
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.RoiFactory = function ()
{
    /** 
     * Get the number of points needed to build the shape.
     * @method getNPoints
     * @return {Number} The number of points.
     */
    this.getNPoints = function () { return 50; };
    /** 
     * Get the timeout between point storage.
     * @method getTimeout
     * @return {Number} The timeout in milliseconds.
     */
    this.getTimeout = function () { return 100; };
};  

/**
 * Create a roi shape to be displayed.
 * @method RoiCreator
 * @param {Array} points The points from which to extract the line.
 * @param {Object} style The drawing style.
 * @param {Object} image The associated image.
 */ 
dwv.tool.RoiFactory.prototype.create = function (points, style /*, image*/)
{
    // physical shape
    var roi = new dwv.math.ROI();
    // add input points to the ROI
    roi.addPoints(points);
    // points stored the kineticjs way
    var arr = [];
    for( var i = 0; i < roi.getLength(); ++i )
    {
        arr.push( roi.getPoint(i).getX() );
        arr.push( roi.getPoint(i).getY() );
    }
    // draw shape
    var kshape = new Kinetic.Line({
        points: arr,
        stroke: style.getLineColour(),
        strokeWidth: style.getScaledStrokeWidth(),
        name: "shape",
        closed: true
    });
    // return group
    var group = new Kinetic.Group();
    group.name("roi-group");
    group.add(kshape);
    return group;
}; 

/**
 * Update a roi shape.
 * @method UpdateRoi
 * @static
 * @param {Object} anchor The active anchor.
 * @param {Object} image The associated image.
 */ 
dwv.tool.UpdateRoi = function (anchor /*, image*/)
{
    // parent group
    var group = anchor.getParent();
    // associated shape
    var kroi = group.getChildren( function (node) {
        return node.name() === 'shape';
    })[0];
    // update self
    var point = group.getChildren( function (node) {
        return node.id() === anchor.id();
    })[0];
    point.x( anchor.x() );
    point.y( anchor.y() );
    // update the roi point and compensate for possible drag
    // (the anchor id is the index of the point in the list)
    var points = kroi.points();
    points[anchor.id()] = anchor.x() - kroi.x();
    points[anchor.id()+1] = anchor.y() - kroi.y();
    kroi.points( points );
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
     * Scroll GUI.
     * @property gui
     * @type Object
     */
    var gui = null;
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
            app.getViewController().incrementSliceNb();
        }
        else {
            app.getViewController().decrementSliceNb();
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
     * Handle mouse scroll event (fired by Firefox).
     * @method DOMMouseScroll
     * @param {Object} event The mouse scroll event.
     */
    this.DOMMouseScroll = function(event){
        // ev.detail on firefox is 3
        if( event.detail < 0 ) {
            app.getViewController().incrementSliceNb();
        }
        else {
            app.getViewController().decrementSliceNb();
        }
    };

    /**
     * Handle mouse wheel event.
     * @method mousewheel
     * @param {Object} event The mouse wheel event.
     */
    this.mousewheel = function(event){
        // ev.wheelDelta on chrome is 120
        if( event.wheelDelta > 0 ) {
            app.getViewController().incrementSliceNb();
        }
        else {
            app.getViewController().decrementSliceNb();
        }
    };
    /**
     * Handle key down event.
     * @method keydown
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        app.onKeydown(event);
    };

    /**
     * Setup the tool GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui = new dwv.gui.Scroll(app);
        gui.setup();
    };
    
    /**
     * Enable the tool.
     * @method enable
     * @param {Boolean} bool The flag to enable or not.
     */
    this.display = function(bool){
        if ( gui ) {
            gui.display(bool);
        }
    };

    /**
     * Initialise the tool.
     * @method init
     */
    this.init = function() {
        if ( app.getNSlicesToLoad() === 1 ) {
            return false;
        }
        return true;
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
 * Tool box.
 * @class Toolbox
 * @namespace dwv.tool
 * @constructor
 * @param {Array} toolList The list of tool objects.
 * @param {Object} gui The associated gui.
 */
dwv.tool.Toolbox = function( toolList, app )
{
    /**
     * Toolbox GUI.
     * @property gui
     * @type Object
     */
    var gui = null;
    /**
     * Selected tool.
     * @property selectedTool
     * @type Object
     */
    var selectedTool = null;
    /**
     * Default tool name.
     * @property defaultToolName
     * @type String
     */
    var defaultToolName = null;
    
    /**
     * Get the list of tools.
     * @method getToolList
     * @return {Array} The list of tool objects.
     */
    this.getToolList = function ()
    {
        return toolList;
    };

    /**
     * Get the selected tool.
     * @method getSelectedTool
     * @return {Object} The selected tool.
     */
    this.getSelectedTool = function ()
    {
        return selectedTool;
    };

    /**
     * Setup the toolbox GUI.
     * @method setup
     */
    this.setup = function ()
    {
        if ( Object.keys(toolList).length !== 0 ) {
            gui = new dwv.gui.Toolbox(app);
            gui.setup(toolList);
            for( var key in toolList ) {
                toolList[key].setup();
            }
        }
    };

    /**
     * Display the toolbox.
     * @method display
     * @param {Boolean} bool Flag to display or not.
     */
    this.display = function (bool)
    {
        if ( Object.keys(toolList).length !== 0 && gui ) {
            gui.display(bool);
        }
    };
    
    /**
     * Initialise the tool box.
     * @method init
     */
    this.init = function ()
    {
        var keys = Object.keys(toolList);
        // check if we have tools
        if ( keys.length === 0 ) {
            return;
        }
        // init all tools
        defaultToolName = "";
        var displays = [];
        var display = null;
        for( var key in toolList ) {
            display = toolList[key].init();
            if ( display && defaultToolName === "" ) {
                defaultToolName = key;
            }
            displays.push(display);
        }
        this.setSelectedTool(defaultToolName);
        // init html
        if ( gui ) {
            gui.initialise(displays);
        }
    };

    /**
     * Set the selected tool.
     * @method setSelectedTool
     * @return {String} The name of the tool to select.
     */
    this.setSelectedTool = function (name)
    {
        // check if we have it
        if( !this.hasTool(name) )
        {
            throw new Error("Unknown tool: '" + name + "'");
        }
        // hide last selected
        if( selectedTool )
        {
            selectedTool.display(false);
        }
        // enable new one
        selectedTool = toolList[name];
        // display it
        selectedTool.display(true);
    };

    /**
     * Reset the tool box.
     * @method reset
     */
    this.reset = function ()
    {
        // hide last selected
        if ( selectedTool ) {
            selectedTool.display(false);
        }
        selectedTool = null;
        defaultToolName = null;
    };
};

/**
 * Check if a tool is in the tool list.
 * @method hasTool
 * @param {String} name The name to check.
 * @return {String} The tool list element for the given name.
 */
dwv.tool.Toolbox.prototype.hasTool = function (name)
{
    return this.getToolList()[name];
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
 */
dwv.tool.UndoStack = function (app)
{ 
    /**
     * Undo GUI.
     * @property gui
     * @type Object
     */
    var gui = new dwv.gui.Undo(app);
    /**
     * Array of commands.
     * @property stack
     * @private
     * @type Array
     */
    var stack = [];
    
    /**
     * Get the stack.
     * @method getStack
     * @return {Array} The list of stored commands.
     */
    this.getStack = function () { return stack; };
    
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
        gui.addCommandToUndoHtml(cmd.getName());
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
            // decrement command index
            --curCmdIndex; 
            // undo last command
            stack[curCmdIndex].undo();
            // disable last in display history
            gui.enableInUndoHtml(false);
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
            // run last command
            stack[curCmdIndex].execute();
            // increment command index
            ++curCmdIndex;
            // enable next in display history
            gui.enableInUndoHtml(true);
        }
    };

    /**
     * Setup the tool GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui.setup();
    };

    /**
     * Initialise the tool GUI.
     * @method initialise
     */
    this.initialise = function ()
    {
        gui.initialise();
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
     * WindowLevel GUI.
     * @property gui
     * @type Object
     */
    var gui = null;
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
        app.getViewController().setCurrentPosition2D(event._x, event._y);
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
        var windowCenter = parseInt(app.getViewController().getWindowLevel().center, 10) + diffY;
        var windowWidth = parseInt(app.getViewController().getWindowLevel().width, 10) + diffX;
        // update GUI
        app.getViewController().setWindowLevel(windowCenter,windowWidth);
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
            var windowCenter = parseInt(app.getViewController().getWindowLevel().center, 10);
            var windowWidth = parseInt(app.getViewController().getWindowLevel().width, 10);
            app.getViewController().getPresets().manual = {"center": windowCenter, "width": windowWidth};
            // update gui
            if ( gui ) {
                gui.initialise();
                // set selected
                dwv.gui.setSelected(app.getElement("presetSelect"), "Manual");
            }
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
        app.getViewController().setWindowLevel(
            parseInt(app.getImage().getRescaledValue(
                event._x, event._y, app.getViewController().getCurrentPosition().k), 10),
            parseInt(app.getViewController().getWindowLevel().width, 10) );    
    };
    
    /**
     * Handle key down event.
     * @method keydown
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        // let the app handle it
        app.onKeydown(event);
    };
    
    /**
     * Setup the tool GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui = new dwv.gui.WindowLevel(app);
        gui.setup();
    };
    
    /**
     * Display the tool.
     * @method display
     * @param {Boolean} bool The flag to display or not.
     */
    this.display = function (bool)
    {
        if ( gui )
        {
            if( app.getImage().getPhotometricInterpretation().match(/MONOCHROME/) !== null ) {
                gui.display(bool);
            }
            else {
                gui.display(false);
            }
        }
    };
    
    /**
     * Initialise the tool.
     * @method init
     */
    this.init = function() {
        if ( gui ) {
            gui.initialise();
        }
        return true;
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
     * @type Object
     */
    var self = this;
    /**
     * ZoomAndPan GUI.
     * @property gui
     * @type Object
     */
    var gui = null;
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
        var tx = event._xs - self.x0;
        var ty = event._ys - self.y0;
        // apply translation
        //app.translate(tx, ty);
        app.stepTranslate(tx, ty);
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
                app.getViewController().incrementSliceNb();
            }
            else {
                app.getViewController().decrementSliceNb();
            }
        }
        else
        {
            // zoom mode
            var zoom = (lineRatio - 1) / 2;
            if( Math.abs(zoom) % 0.1 <= 0.05 ) {
                app.stepZoom(zoom, event._xs, event._ys);
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
        var step = - event.detail / 30;
        app.stepZoom(step, event._xs, event._ys);
    };

    /**
     * Handle mouse wheel event.
     * @method mousewheel
     * @param {Object} event The mouse wheel event.
     */
    this.mousewheel = function(event){
        // ev.wheelDelta on chrome is 120
        var step = event.wheelDelta / 1200;
        app.stepZoom(step, event._xs, event._ys);
    };
    
    /**
     * Handle key down event.
     * @method keydown
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        app.onKeydown(event);
    };

    /**
     * Setup the tool GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui = new dwv.gui.ZoomAndPan(app);
        gui.setup();
    };
    
    /**
     * Enable the tool.
     * @method enable
     * @param {Boolean} bool The flag to enable or not.
     */
    this.display = function(bool){
        if ( gui ) {
            gui.display(bool);
        }
    };

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
    return true;
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
dwv.utils.capitaliseFirstLetter = function (string)
{
    var res = string;
    if ( string ) {
        res = string.charAt(0).toUpperCase() + string.slice(1);
    }
    return res;
};

/**
 * Split query string:
 *  'root?key0=val00&key0=val01&key1=val10' returns 
 *  { base : root, query : [ key0 : [val00, val01], key1 : val1 ] }
 * Returns an empty object if the input string is not correct (null, empty...)
 *  or if it is not a query string (no question mark).
 * @method splitQueryString
 * @static
 * @param {String} inputStr The string to split.
 * @return {Object} The split string.
 */
dwv.utils.splitQueryString = function (inputStr)
{
    // result
    var result = {};
    // check if query string
    var sepIndex = null;
    if ( inputStr && (sepIndex = inputStr.indexOf('?')) !== -1 ) {
        // base: before the '?'
        result.base = inputStr.substr(0, sepIndex);
        // query : after the '?' and until possible '#'
        var hashIndex = inputStr.indexOf('#');
        if ( hashIndex === -1 ) {
            hashIndex = inputStr.length;
        }
        var query = inputStr.substr(sepIndex + 1, (hashIndex - 1 - sepIndex));
        // split key/value pairs of the query
        result.query = dwv.utils.splitKeyValueString(query);
    }
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
dwv.utils.splitKeyValueString = function (inputStr)
{
    // result
    var result = {};
    // check input string
    if ( inputStr ) {
         // split key/value pairs
        var pairs = inputStr.split('&');
        for ( var i = 0; i < pairs.length; ++i )
        {
            var pair = pairs[i].split('=');
            // if the key does not exist, create it
            if ( !result[pair[0]] ) 
            {
                result[pair[0]] = pair[1];
            }
            else
            {
                // make it an array
                if ( !( result[pair[0]] instanceof Array ) ) {
                    result[pair[0]] = [result[pair[0]]];
                }
                result[pair[0]].push(pair[1]);
            }
        }
    }
    return result;
};
