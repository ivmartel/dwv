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
    
    // Data decoders scripts
    var decoderScripts = null;

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
    this.getVersion = function () { return "v0.14.0-beta"; };

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
     * Add a command to the undo stack.
     * @method addToUndoStack
     * @param {Object} The command to add.
     */
    this.addToUndoStack = function (cmd) { 
        if ( undoStack !== null ) {
            undoStack.add(cmd);
        }
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
                            var shapeName = config.shapes[s];
                            var shapeFactoryClass = shapeName+"Factory";
                            if (typeof dwv.tool[shapeFactoryClass] !== "undefined") {
                                shapeList[shapeName] = dwv.tool[shapeFactoryClass];
                            }
                            else {
                                console.warn("Could not initialise unknown shape: "+shapeName);
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
                            var filterName = config.filters[f];
                            if (typeof dwv.tool.filter[filterName] !== "undefined") {
                                filterList[filterName] = new dwv.tool.filter[filterName](this);
                            }
                            else {
                                console.warn("Could not initialise unknown filter: "+filterName);
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
                var loaderList = {};
                for ( var l = 0; l < config.loaders.length; ++l ) {
                    var loaderName = config.loaders[l];
                    var loaderClass = loaderName + "Load";
                    if (typeof dwv.gui[loaderClass] !== "undefined") {
                        loaderList[loaderName] = new dwv.gui[loaderClass](this);
                    }
                    else {
                        console.warn("Could not initialise unknown loader: "+loaderName);
                    }
                }
                loadbox = new dwv.gui.Loadbox(this, loaderList);
                loadbox.setup();
                var loaderKeys = Object.keys(loaderList);
                for ( var lk = 0; lk < loaderKeys.length; ++lk ) {
                    loaderList[loaderKeys[lk]].setup();
                }
                loadbox.displayLoader(loaderKeys[0]);
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
            var query = dwv.utils.getUriQuery(window.location.href);
            // check query
            if ( query && typeof query.input !== "undefined" ) {
                dwv.utils.decodeQuery(query, this.onInputURLs);
                // optional display state
                if ( typeof query.state !== "undefined" ) {
                    var onLoadEnd = function (/*event*/) {
                        loadStateUrl([query.state]);
                    };
                    this.addEventListener( "load-end", onLoadEnd );
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

        // use web workers
        if ( config.useWebWorkers ) {
            // data decoders
            var pathToRoot = "../..";
            decoderScripts = [];
            decoderScripts.jpeg2000 = pathToRoot + "/ext/pdfjs/decode-jpeg2000.js";
            decoderScripts["jpeg-lossless"] = pathToRoot + "/ext/rii-mango/decode-jpegloss.js";
            decoderScripts["jpeg-baseline"] = pathToRoot + "/ext/notmasteryet/decode-jpegbaseline.js";
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
        fileIO.setDecoderScripts(decoderScripts);
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
     * @param {Array} requestHeaders An array of {name, value} to use as request headers.
     */
    this.loadURL = function(urls, requestHeaders)
    {
        // clear variables
        self.reset();
        nSlicesToLoad = urls.length;
        // create IO
        var urlIO = new dwv.io.Url();
        urlIO.setDecoderScripts(decoderScripts);
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
        urlIO.load(urls, requestHeaders);
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
        layer.addEventListener("mousedown", onMouch);
        layer.addEventListener("mousemove", onMouch);
        layer.addEventListener("mouseup", onMouch);
        layer.addEventListener("mouseout", onMouch);
        layer.addEventListener("mousewheel", onMouch);
        layer.addEventListener("DOMMouseScroll", onMouch);
        layer.addEventListener("dblclick", onMouch);
        // touch listeners
        layer.addEventListener("touchstart", onMouch);
        layer.addEventListener("touchmove", onMouch);
        layer.addEventListener("touchend", onMouch);
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
        layer.removeEventListener("mousedown", onMouch);
        layer.removeEventListener("mousemove", onMouch);
        layer.removeEventListener("mouseup", onMouch);
        layer.removeEventListener("mouseout", onMouch);
        layer.removeEventListener("mousewheel", onMouch);
        layer.removeEventListener("DOMMouseScroll", onMouch);
        layer.removeEventListener("dblclick", onMouch);
        // touch listeners
        layer.removeEventListener("touchstart", onMouch);
        layer.removeEventListener("touchmove", onMouch);
        layer.removeEventListener("touchend", onMouch);
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
     * @param {Array} requestHeaders An array of {name, value} to use as request headers.
     */
    this.onInputURLs = function (urls, requestHeaders)
    {
        self.loadURL(urls, requestHeaders);
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
     * Mou(se) and (T)ouch event handler. This function just determines the mouse/touch
     * position relative to the canvas element. It then passes it to the current tool.
     * @method onMouch
     * @private
     * @param {Object} event The event to handle.
     */
    function onMouch(event)
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
        fireEvent(event);
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
            window.addEventListener("keydown", onMouch, true);

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
