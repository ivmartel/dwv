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
    	for (var i = 0; i < files.length; ++i)
    	{
            var file = files[i];
	        if( file.type.match("image.*") )
	        {
	            var reader = new FileReader();
	            reader.onload = function(event){
	                var tmp_image = new Image();
	                tmp_image.src = event.target.result;
	                tmp_image.onload = function(e){
	                    try {
	                        // parse image file
	                        var data = dwv.image.getDataFromImage(tmp_image, file);
		        			if( image ) image.appendSlice( data.view.getImage() );
	                        // prepare display
	                        postLoadInit(data);
	        			} catch(error) {
	                        handleError(error);
	                        return;
	        			}
	                };
	            };
	            reader.onprogress = dwv.gui.updateProgress;
	            reader.onerror = function(event){
	                alert("An error occurred while reading the image file: "+event.getMessage());
	            };
	            reader.readAsDataURL(file);
	        }
	        else
	        {
	            var reader = new FileReader();
	    		reader.onload = function(event){
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
	    		reader.onprogress = dwv.gui.updateProgress;
	    		reader.onerror = function(event){
	                alert("An error occurred while reading the DICOM file: "+event.getMessage());
	            };
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
    this.loadURL = function(url) 
    {
        var request = new XMLHttpRequest();
        // TODO Verify URL...
        request.open('GET', url, true);
        request.responseType = "arraybuffer"; 
        request.onload = function(ev) {
            var view = new DataView(request.response);
            var isJpeg = view.getUint32(0) === 0xffd8ffe0;
            var isPng = view.getUint32(0) === 0x89504e47;
            var isGif = view.getUint32(0) === 0x47494638;
            if( isJpeg || isPng || isGif ) {
                // image data
                var image = new Image();

                var bytes = new Uint8Array(request.response);
                var binary = '';
                for (var i = 0; i < bytes.byteLength; ++i) {
                    binary += String.fromCharCode(bytes[i]);
                }
                var imgStr = "unknown";
                if (isJpeg) imgStr = "jpeg";
                else if (isPng) imgStr = "png";
                else if (isGif) imgStr = "gif";
                image.src = "data:image/" + imgStr + ";base64," + window.btoa(binary);
                
                image.onload = function(e){
        			try {
	                    // parse image data
	                    var data = dwv.image.getDataFromImage(image, 0);
	                    // prepare display
	                    postLoadInit(data);
        			} catch(error) {
                        handleError(error);
                        return;
        			}
                };
            }
            else {
                try {
	            	// parse DICOM
	                var data = dwv.image.getDataFromDicomBuffer(request.response);
	                // prepare display
	                postLoadInit(data);
    			} catch(error) {
                    handleError(error);
                    return;
    			}
            }
        };
        request.onerror = function(event){
            alert("An error occurred while retrieving the file: (http) "+request.status);
        };
        request.onprogress = dwv.gui.updateProgress;
        request.send(null);
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
            mainHeight = $('#pageMain').height() - 60;
        }
        displayZoom = Math.min( (mainWidth / dataWidth), (mainHeight / dataHeight) );
        $("#layerContainer").width(displayZoom*dataWidth);
        $("#layerContainer").height(displayZoom*dataHeight);
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
            if( event.type === "touchstart"
                || event.type === "touchmove")
            {
                event.preventDefault();
                // If there's one or two fingers inside this element
                if (event.targetTouches.length === 1
                        || event.targetTouches.length === 2) {
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
            if( event.type === "mousemove"
                || event.type === "mousedown"
                || event.type === "mouseup"
                || event.type === "mouseout"
                || event.type === "mousewheel"
                || event.type === "dblclick" 
                || event.type === "DOMMouseScroll" )
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
