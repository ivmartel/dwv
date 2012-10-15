/**
* @class App
* Main application.
*/
dwv.App = function()
{
    // Local object.
    var self = this;
    
    // Image details.
    var image = null;
    
    var imageData = null;
    // Get the image details.
    this.getImageData = function() { return imageData; };
    
    // Image layer.
    var imageLayer = null;
    // Draw layer.
    var drawLayer = null;
    // Temporary layer.
    var tempLayer = null;
    // Information layer.
    var infoLayer = null;

    // Tool box.
    var toolBox = new dwv.tool.ToolBox(this);
    
    // UndoStack
    var undoStack = new dwv.tool.UndoStack(this);
    
    // Get the image details.
    this.getImage = function() { return image; };
    this.setImage = function(img) { image = img; };    
    
    // Get the tool box.
    this.getToolBox = function() { return toolBox; };

    // Get the image layer.
    this.getImageLayer = function() { return imageLayer; };
    // Get the draw layer.
    this.getDrawLayer = function() { return drawLayer; };
    // Get the temporary layer.
    this.getTempLayer = function() { return tempLayer; };
    // Get the information layer.
    this.getInfoLayer = function() { return infoLayer; };

    // Get the image details.
    this.getUndoStack = function() { return undoStack; };

    /**
     * Initialise the HTML for the application.
     */
    this.init = function()
    {
        // bind open files with method
        document.getElementById('files').addEventListener('change', this.loadDicom, false);
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
     * @private
     * The general-purpose event handler. This function just determines the mouse 
     * position relative to the canvas element.
     */
    function eventHandler(event)
    {
        // if mouse event, check that it is in the canvas
        if( event.type === "mousemove"
            || event.type === "mousedown"
            || event.type === "mouseup"
            || event.type === "mousewheel"
            || event.type === "dblclick")
        {
            // set event._x and event._y to be used later
            // layerX is for firefox
            event._x = event.offsetX === undefined ? event.layerX : event.offsetX;
            event._y = event.offsetY === undefined ? event.layerY : event.offsetY;
            
            if(event._x < 0 
                || event._y < 0 
                || event._x >= image.getSize().getNumberOfColumns() 
                || event._y >= image.getSize().getNumberOfRows() )
            {
                // exit
                return;
            }
        }
            
        // Call the event handler of the tool.
        var func = self.getToolBox().getSelectedTool()[event.type];
        if (func)
        {
            func(event);
        }
    }

    /**
     * @public
     */
    this.loadDicom = function(evt) 
    {
        var reader = new FileReader();
        reader.onload = onLoadedDicom;
        reader.onprogress = updateProgress;
        //$("#progressbar").progressbar({ value: 0 });
        reader.readAsBinaryString(evt.target.files[0]);
    };
    
    function onLoadedDicom(evt)
    {
        // parse the DICOM file
        try {
            parseDicom(evt.target.result);
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
        // prepare display
        postLoadInit();
        //$("#progressbar").progressbar({ value: 100 });
    }
    
    function updateProgress(evt)
    {
        // evt is an ProgressEvent.
        if (evt.lengthComputable) {
          var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
          // Increase the progress bar length.
          if (percentLoaded < 100) {
              $("#progressbar").progressbar({ value: percentLoaded });
          }
        }
    }
    
    /**
     * @private
     * @param file
     */
    function parseDicom(file)
    {    
        // parse the DICOM file
        var dicomParser = new dwv.dicom.DicomParser(file);
        dicomParser.parseAll();
        
        // tag list table (without the pixel data)
        var data = dicomParser.dicomElements;
        data.PixelData.value = "...";
        // HTML node
        var node = document.getElementById("tags");
        // remove possible previous
        while (node.hasChildNodes()) { 
            node.removeChild(node.firstChild);
        }
        // new table
        var table = dwv.html.toTable(data);
        table.className = "tagList";
        // append new table
        node.appendChild(table);
        // display it
        //node.style.display='';
        
        // table search form
        var tagSearchform = document.createElement("form");
        tagSearchform.setAttribute("class", "filter");
        var input = document.createElement("input");
        input.onkeyup = function() {
            dwv.html.filterTable(input, table);
        };
        tagSearchform.appendChild(input);
        node.insertBefore(tagSearchform, table);
        
        image = dicomParser.getImage();
    }
    
    /**
     * @private
     * To be called once the image is loaded.
     */
    function layoutLayers()
    {
        var numberOfColumns = image.getSize().getNumberOfColumns();
        var numberOfRows = image.getSize().getNumberOfRows();
        
        // image layer
        imageLayer = new dwv.html.Layer("imageLayer");
        imageLayer.init(numberOfColumns, numberOfRows);
        imageLayer.fillContext();
        imageLayer.display(true);
        // draw layer
        drawLayer = new dwv.html.Layer("drawLayer");
        drawLayer.init(numberOfColumns, numberOfRows);
        drawLayer.display(true);
        // temp layer
        tempLayer = new dwv.html.Layer("tempLayer");
        tempLayer.init(numberOfColumns, numberOfRows);
        tempLayer.display(true);
        // info layer
        infoLayer = new dwv.html.Layer("infoLayer");
        infoLayer.init(numberOfColumns, numberOfRows);
        infoLayer.display(true);
    }
    
    /**
     * @private
     * To be called once the image is loaded.
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
    
    /**
     * @private
     * To be called once the image is loaded.
     */
    function postLoadInit()
    {
        // layout
        layoutLayers();
        self.alignLayers();

        // get the image data from the image layer
        imageData = self.getImageLayer().getContext().getImageData( 
            0, 0, 
            self.getImage().getSize().getNumberOfColumns(), 
            self.getImage().getSize().getNumberOfRows());

        // add the HTML for the tool box 
        dwv.gui.appendToolboxHtml();
        // add the HTML for the history 
        dwv.gui.appendUndoHtml();

        // Attach the mousedown, mousemove and mouseup event listeners.
        tempLayer.getCanvas().addEventListener('mousedown', eventHandler, false);
        tempLayer.getCanvas().addEventListener('mousemove', eventHandler, false);
        tempLayer.getCanvas().addEventListener('mouseup', eventHandler, false);
        tempLayer.getCanvas().addEventListener('mousewheel', eventHandler, false);
        tempLayer.getCanvas().addEventListener('DOMMouseScroll', eventHandler, false);
        tempLayer.getCanvas().addEventListener('dblclick', eventHandler, false);

        // Keydown listener
        window.addEventListener('keydown', eventHandler, true);

        // initialise the toolbox
        // note: the window/level tool is responsible for doing the first display.
        toolBox.init();
    }
    
    /**
     * @private
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
};