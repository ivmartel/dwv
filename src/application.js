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
    // Original image
    var originalImage = null;
    // Image data array
    var imageData = null;
     
    // Image layer
    var imageLayer = null;
    // Draw layer
    var drawLayer = null;
    // Temporary layer
    var tempLayer = null;
    // Information layer
    var infoLayer = null;
    
    // Tool box
    var toolBox = new dwv.tool.ToolBox(this);
    // UndoStack
    var undoStack = new dwv.tool.UndoStack(this);
    
    // Public Methods
    // --------------
    
    // Get the image
    this.getImage = function() { return image; };
    
    // Set the image
    this.setImage = function(img) { image = img; };    
    this.restoreOriginalImage = function() { image = originalImage; }; 
    
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
    // Get the information layer
    this.getInfoLayer = function() { return infoLayer; };

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
        if( event.keyCode === 90 && event.ctrlKey ) // CRTL-Z
        {
            self.getUndoStack().undo();
        }
        else if( event.keyCode === 89 && event.ctrlKey ) // CRTL-Y
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
        //TODO: for (var i = 0; i < files.length; ++i) {
        if( files[0].type.match("image.*") )
        {
            var reader = new FileReader();
            reader.onload = function(event){
                var image = new Image();
                image.src = event.target.result;
                image.onload = function(e){
                    // parse DICOM
                    var data = dwv.image.getDataFromImage(image, files[0]);
                    // prepare display
                    postLoadInit(data);
                };
            };
            reader.onprogress = dwv.gui.updateProgress;
            reader.onerror = function(){
                alert("An error occurred while reading the image file.");
            };
            reader.readAsDataURL(files[0]);
        }
        else
        {
            var reader = new FileReader();
    		reader.onload = function(event){
    			// parse DICOM
    			var data = dwv.image.getDataFromDicomBuffer(event.target.result);
    			// prepare display
    			postLoadInit(data);
    		};
    		reader.onprogress = dwv.gui.updateProgress;
    		reader.onerror = function(){
                alert("An error occurred while reading the DICOM file.");
            };
    		reader.readAsArrayBuffer(files[0]);
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
            // parse buffer
            try {
                var view = new DataView(request.response);
                var isJpeg = view.getUint32(0) === 0xffd8ffe0;
                var isPng = view.getUint32(0) === 0x89504e47;
                if( isJpeg || isPng ) {
                    // image data
                    var image = new Image();

                    var bytes = new Uint8Array(request.response);
                    var binary = '';
                    for (var i = 0; i < bytes.byteLength; ++i) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    var imgStr = (isJpeg ? "jpeg" : "png");
                    image.src = "data:image/" + imgStr + ";base64," + window.btoa(binary);
                    
                    image.onload = function(e){
                        // parse image data
                        var data = dwv.image.getDataFromImage(image, 0);
                        // prepare display
                        postLoadInit(data);
                    };
                }
                else {
                    // parse DICOM
                    var data = dwv.image.getDataFromDicomBuffer(request.response);
                    // prepare display
                    postLoadInit(data);
                }
            }
            catch(error) {
                if( error.name && error.message) {
                    alert(error.name+": "+error.message+".");
                }
                else {
                    alert("Error: "+error+".");
                }
                if( error.stack ) {
                    console.log(error.stack);
                }
                return;
            }
        };
        request.onerror = function(){
            alert("An error occurred while retrieving the file.");
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
        self.getImage().generateImageData(imageData);         
        // set the image data of the layer
        self.getImageLayer().setImageData(imageData);
        // draw the image
        self.getImageLayer().draw();
    };
    
    /**
     * To be called once the image is loaded.
     * Linked with the window.onresize method.
     */
    this.alignLayers = function()
    {
        if( imageLayer ) {
            drawLayer.align(imageLayer);
            tempLayer.align(imageLayer);
            infoLayer.align(imageLayer);
            
            // align plot
            var plotDiv = document.getElementById("plot");
            plotDiv.style.top = app.getImageLayer().getCanvas().offsetTop
                + app.getImageLayer().getCanvas().height
                - plotDiv.offsetHeight
                - 15;
            plotDiv.style.left = app.getImageLayer().getCanvas().offsetLeft
                + app.getImageLayer().getCanvas().width
                - plotDiv.offsetWidth;
        }
    };
    
    // Private Methods
    // ---------------

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
                || event.type === "touchend"
                || event.type === "touchmove")
            {
                event.preventDefault();
                // If there's one or two fingers inside this element
                if (event.changedTouches.length === 1
                        || event.changedTouches.length === 2) {
                  var touch = event.changedTouches[0];
                  // store
                  event._x = touch.pageX - parseInt(app.getImageLayer().getOffset().left, 10);
                  event._y = touch.pageY - parseInt(app.getImageLayer().getOffset().top, 10);
                  // second finger
                  if (event.changedTouches.length === 2) {
                      touch = event.changedTouches[1];
                      // store
                      event._x1 = touch.pageX - parseInt(app.getImageLayer().getOffset().left, 10);
                      event._y1 = touch.pageY - parseInt(app.getImageLayer().getOffset().top, 10);
                  }
                  // set handle event flag
                  handled = true;
                }
            }
        }
        else
        {
            if( event.type === "mousemove"
                || event.type === "mousedown"
                || event.type === "mouseup"
                || event.type === "mousewheel"
                || event.type === "dblclick" )
            {
                // layerX is for firefox
                event._x = event.offsetX === undefined ? event.layerX : event.offsetX;
                event._y = event.offsetY === undefined ? event.layerY : event.offsetY;
                // set handle event flag
                handled = true;
            }
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
     * To be called once the image is loaded.
     */
    function createLayers(width,height)
    {
        // image layer
        imageLayer = new dwv.html.Layer("imageLayer");
        imageLayer.initialise(width, height);
        imageLayer.fillContext();
        imageLayer.display(true);
        // draw layer
        drawLayer = new dwv.html.Layer("drawLayer");
        drawLayer.initialise(width, height);
        drawLayer.display(true);
        // temp layer
        tempLayer = new dwv.html.Layer("tempLayer");
        tempLayer.initialise(width, height);
        tempLayer.display(true);
        // info layer
        infoLayer = new dwv.html.Layer("infoLayer");
        infoLayer.initialise(width, height);
        infoLayer.display(true);
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
        table.className = "tagList";
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
    	// create the DICOM tags table
    	createTagsTable(data.info);
    	
    	// store image
        originalImage = data.image;
        image = originalImage;

        // layout
        var width = image.getSize().getNumberOfColumns();
        var height = image.getSize().getNumberOfRows();
        createLayers(width, height);
        self.alignLayers();

        // get the image data from the image layer
        imageData = self.getImageLayer().getContext().getImageData( 
            0, 0, 
            self.getImage().getSize().getNumberOfColumns(), 
            self.getImage().getSize().getNumberOfRows());

        // initialise the toolbox
        // note: the window/level tool is responsible for doing the first display.
        toolBox.enable(true);
        // add the HTML for the history 
        dwv.gui.appendUndoHtml();

        // Attach event listeners.
        tempLayer.getCanvas().addEventListener('mousedown', eventHandler, false);
        tempLayer.getCanvas().addEventListener('mousemove', eventHandler, false);
        tempLayer.getCanvas().addEventListener('mouseup', eventHandler, false);
        tempLayer.getCanvas().addEventListener('mousewheel', eventHandler, false);
        tempLayer.getCanvas().addEventListener('touchstart', eventHandler, false);
        tempLayer.getCanvas().addEventListener('touchmove', eventHandler, false);
        tempLayer.getCanvas().addEventListener('touchend', eventHandler, false);
        tempLayer.getCanvas().addEventListener('DOMMouseScroll', eventHandler, false);
        tempLayer.getCanvas().addEventListener('dblclick', eventHandler, false);

        // Keydown listener
        window.addEventListener('keydown', eventHandler, true);
    }
    
};