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
    
    // Style.
    var style = new dwv.html.Style();
    
    // UndoStack
    var undoStack = new dwv.tool.UndoStack(this);
    
    // Get the image details.
    this.getImage = function() { return image; };
    
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

    // Get the drawing context.
    this.getStyle = function() { return style; };

    // Get the image details.
    this.getUndoStack = function() { return undoStack; };

    /**
     * Initialise the HTML for the application.
     */
    this.init = function()
    {
        // add the HTML for the tool box 
        toolBox.appendHtml();
        // add the HTML for the history 
        undoStack.appendHtml();
        // bind open files with method
        document.getElementById('files').addEventListener('change', this.loadDicom, false);
    };
    
    /**
     * Set the line color.
     * @param event
     */
    this.setLineColor = function(event)
    {
        // get the color
        var color = event.target.id;
        // set style var
        self.getStyle().setLineColor(color);
        // reset borders
        dwv.tool.draw.setLineColor(color);
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
            || event.type === "mousewheel" )
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
        $("#progressbar").progressbar({ value: 0 });
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
                alert("Error: "+error);
            }
            if( error.stack ) {
                console.log(error.stack);
            }
            return;
        }
        // prepare display
        postLoadInit();
        $("#progressbar").progressbar({ value: 100 });
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
        var table = dwv.html.toTable(data);
        table.className = "tagList";
        document.getElementById('tags').appendChild(table);
        document.getElementById("tags").style.display='';
        
        // table search form
        var tagSearchform = document.createElement('form');
        tagSearchform.setAttribute('class', 'filter');
        var input = document.createElement('input');
        input.onkeyup = function() {
            dwv.html.filterTable(input, table);
        };
        tagSearchform.appendChild(input);
        document.getElementById('tags').insertBefore(tagSearchform, table);
        
        image = dicomParser.getImage();
    }
    
    /**
     * @private
     * To be called once the image is loaded.
     */
    function postLoadInit()
    {
        var numberOfColumns = image.getSize().getNumberOfColumns();
        var numberOfRows = image.getSize().getNumberOfRows();
        
        // image layer
        imageLayer = new dwv.html.Layer("imageLayer");
        imageLayer.init(numberOfColumns, numberOfRows);
        imageLayer.fillContext();
        // draw layer
        drawLayer = new dwv.html.Layer("drawLayer");
        drawLayer.init(numberOfColumns, numberOfRows);
        // temp layer
        tempLayer = new dwv.html.Layer("tempLayer");
        tempLayer.init(numberOfColumns, numberOfRows);
        // Attach the mousedown, mousemove and mouseup event listeners.
        tempLayer.getCanvas().addEventListener('mousedown', eventHandler, false);
        tempLayer.getCanvas().addEventListener('mousemove', eventHandler, false);
        tempLayer.getCanvas().addEventListener('mouseup', eventHandler, false);
        tempLayer.getCanvas().addEventListener('mousewheel', eventHandler, false);
        tempLayer.getCanvas().addEventListener('DOMMouseScroll', eventHandler, false);
        // info layer
        infoLayer = new dwv.html.Layer("infoLayer");
        infoLayer.init(numberOfColumns, numberOfRows);
        
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
        // store first image data
        if( imageData === null )
        {
            imageData = self.getImageLayer().getContext().getImageData( 
                0, 0, 
                self.getImage().getSize().getNumberOfColumns(), 
                self.getImage().getSize().getNumberOfRows());
        }
        // generate image data from DICOM
        self.getImage().generateImageData(imageData);         
        // set the image data of the layer
        self.getImageLayer().setImageData(imageData);
        // draw the image
        self.getImageLayer().draw();
    };
};