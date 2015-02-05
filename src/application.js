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
    
    var presets = {};
    this.getPresets = function () { return presets; };
     
    var plotInfo = null;
    var windowingInfo = null;
    var positionInfo = null;
    var miniColorMap = null;    
    
    // Image layer
    var imageLayer = null;
    // Draw layers
    var drawLayers = [];
    // Draw stage
    var drawStage = null;
    
    // flag to know if the info layer is listening on the image.
    var isInfoLayerListening = false;
    
    // Tool box
    var toolBox = null;
    // UndoStack
    var undoStack = new dwv.tool.UndoStack();
    
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

    /**
     * Initialise the HTML for the application.
     * @method init
     */
    this.init = function ( config ) {
        containerDivId = config.containerDivId;
        // align layers when the window is resized
        if ( config.fitToWindow ) {
            window.onresize = this.fitToWindow;
        }
        // tools
        if ( config.tools.length !== 0 ) {
            var toolList = {};
            for ( var i = 0; i < config.tools.length; ++i ) {
                switch( config.tools[i] ) {
                case "WindowLevel":
                    toolList["Window/Level"] = new dwv.tool.WindowLevel(this);
                    break;
                case "ZoomPan":
                    toolList["Zoom/Pan"] = new dwv.tool.ZoomAndPan(this);
                    break;
                case "Scroll":
                    toolList.Scroll = new dwv.tool.Scroll(this);
                    break;
                case "Draw":
                    toolList.Draw = new dwv.tool.Draw(this);
                    break;
                case "Livewire":
                    toolList.Livewire = new dwv.tool.Livewire(this);
                    break;
                case "Filter":
                    toolList.Filter = new dwv.tool.Filter(this);
                    break;
                default:
                    throw new Error("Unknown tool: '" + config.tools[i] + "'");
                }
            }
            toolBox = new dwv.tool.ToolBox(toolList);
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
    };
    
    /**
     * Reset the application.
     * @method reset
     */
    this.reset = function()
    {
        // clear tools
        if ( toolBox ) {
            toolBox.reset();
        }
        // clear draw
        if ( drawStage ) {
            drawLayers = [];
        }
        // clear objects
        image = null;
        view = null;
        // clear undo/redo
        undoStack = new dwv.tool.UndoStack();
        dwv.gui.cleanUndoHtml();
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
     * Handle change files event.
     * @method onChangeFiles
     * @param {Object} event The event fired when changing the file field.
     */
    this.onChangeFiles = function(event)
    {
        this.loadFiles(event.target.files);
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
     * Handle change url event.
     * @method onChangeURL
     * @param {Object} event The event fired when changing the url field.
     */
    this.onChangeURL = function(event)
    {
        this.loadURL([event.target.value]);
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
     * Fit the display to the window. To be called once the image is loaded.
     * @method resize
     */
    this.fitToWindow = function()
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
        this.updateWindowingData(
            this.presets[keys[0]].center, 
            this.presets[keys[0]].width );
        // default position
        this.updatePostionValue(0,0);
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
        console.log("moda:"+modality);
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

    /**
     * Update the views' current position.
     * @method updatePostionValue
     * @static
     * @param {Number} i The column index.
     * @param {Number} j The row index.
     */
    this.updatePostionValue = function(i,j)
    {
        this.getView().setCurrentPosition({"i": i, "j": j, "k": this.getView().getCurrentPosition().k});
    };

    /**
     * Update the views' windowing data.
     * @method updateWindowingData
     * @static
     * @param {Number} wc The window center.
     * @param {Number} ww The window width.
     */
    this.updateWindowingData = function(wc,ww)
    {
        this.getView().setWindowLevel(wc,ww);
    };

    /**
     * Set the active window/level preset.
     * @method updateWindowingData
     * @param {String} name The name of the preset to set.
     */
    this.updateWindowingDataFromName = function(name)
    {
        // check if we have it
        if( !this.presets[name] ) {
            throw new Error("Unknown window level preset: '" + name + "'");
        }
        // enable it
        this.updateWindowingData( 
            this.presets[name].center, 
            this.presets[name].width );
    };

    /**
     * Update the views' colour map.
     * @method updateColourMap
     * @static
     * @param {Object} colourMap The colour map.
     */
    this.updateColourMap = function(colourMap)
    {
        this.getView().setColorMap(colourMap);
    };

    /**
     * Update the views' colour map.
     * @function updateColourMap
     * @param {String} name The name of the colour map to set.
     */
    this.updateColourMapFromName = function(name)
    {
        // check if we have it
        if( !dwv.tool.colourMaps[name] ) {
            throw new Error("Unknown colour map: '" + name + "'");
        }
        // enable it
        this.updateColourMap( dwv.tool.colourMaps[name] );
    };


    // Private Methods -------------------------------------------

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
            var func = self.getToolBox().getSelectedTool()[event.type];
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
        //windowScale = $('#'+containerDivId).width() / dataWidth;
        self.fitToWindow();
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
        // append the DICOM tags table
        dwv.gui.appendTagsTable(data.info);
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
        if ( toolBox ) {
            // mouse and touch listeners
            self.addLayerListeners( imageLayer.getCanvas() );
            // keydown listener
            window.addEventListener("keydown", eventHandler, true);
            
            toolBox.init();
            toolBox.display(true);
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
