/**
* dwvApp
* Main application.
*/
function DwvApp()
{
	// Local object.
	var self = this;
	
	// Image details.
    var image = null;
    
    // Image layer.
    var imageLayer = null;
    // Draw layer.
    var drawLayer = null;
    // Temporary layer.
    var tempLayer = null;
    // Information layer.
    var infoLayer = null;

    // Tool box.
    var toolBox = new ToolBox(this);
    
    // Style.
    var style = new Style();
    
    // UndoStack
    var undoStack = new UndoStack(this);
    
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
     * @private
     * @param event
     */
    this.setLineColor = function(event)
    {
        // get the color
    	var color = event.srcElement.id;
    	// set style var
        self.getStyle().setLineColor(color);
        // reset borders
        tool.draw.setLineColor(color);
    };
    
    /**
     * @private
     * This function draws the #imageDraw canvas on top of #imageView,
     * after which #imageDraw is cleared. This function is called each time when the
     * user completes a drawing operation.
     */
    this.mergeTempLayer = function() 
    {
    	self.getDrawLayer().merge(self.getTempLayer());
    };

    /**
     * Handle key event
     */
    this.handleKeyDown = function(event)
    {
    	if( event.keyCode == 90 && event.ctrlKey ) // crtl-z
		{
    		self.getUndoStack().undo();
		}
    	else if( event.keyCode == 89 && event.ctrlKey ) // crtl-y
		{
    		self.getUndoStack().redo();
		}
    };
    
    /**
     * @private
     * The general-purpose event handler. This function just determines the mouse 
   	 * position relative to the canvas element.
     */
    function evenHandler(event)
    {
    	// if mouse envent, chekc that it is in the canvas
    	if( event.type = MouseEvent )
		{
	    	if (event.layerX || event.layerX == 0)
	        { 
	            // Firefox
	            event._x = event.layerX;
	            event._y = event.layerY;
	        }
	        else if (event.offsetX || event.offsetX == 0)
	        {
	            // Opera
	            event._x = event.offsetX;
	            event._y = event.offsetY;
	        }
	
	        if(event._x < 0 
	            || event._y < 0 
	            || event._x >= image.getSize()[0] 
	            || event._y >= image.getSize()[1] )
	        {
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
        loadDicomFile(evt.target.files[0]);
    };
    
    /**
     * @private
     * @param file
     */
    function loadDicomFile(file) 
    {
        var myreader = new FileReader();
        myreader.onload = function() {
            return function(e) {
                parseAndLoadDicom(e.target.result);
                var span = document.createElement('div');
                span.innerHTML = ['<p><b>', e.target.result.length, '</b></p>'].join('');
                document.getElementById('tagList').insertBefore(span, null);
            };
        }();
        myreader.readAsBinaryString(file);
    }
    
    /**
     * @private
     * @param file
     */
    function parseAndLoadDicom(file)
    {    
        var reader = new DicomInputStreamReader();    
        reader.readDicom(file);
        var dicomBuffer = reader.getInputBuffer();
        var dicomReader = reader.getReader();
        var dicomParser = new DicomParser(dicomBuffer,dicomReader);
        dicomParser.parseAll();     
        
        // tag list table      
        var table = document.getElementById("tagList");
        
        var numberOfRows = 0;
        var numberOfColumns = 0;
        var rowSpacing = 0;
        var columnSpacing = 0;
        var windowWidth = 0;
        var windowCenter = 0;
        var rescaleIntercept = 0;
        var rescaleSlope = 0;
        
        var elementindex=0;
        for(;elementindex<dicomParser.dicomElement.length;elementindex++)
        {
            var dicomElement=dicomParser.dicomElement[elementindex];            
            if(dicomElement.name=="numberOfRows")
            {
                numberOfRows=dicomElement.value[0];
            }
            else if(dicomElement.name=="numberOfColumns")
            {
                numberOfColumns=dicomElement.value[0];
            }
            else if(dicomElement.name=="pixelSpacing")
            {
                rowSpacing=parseFloat(dicomElement.value[0]);    
                columnSpacing=parseFloat(dicomElement.value[1]);    
            }
            else if(dicomElement.name=="windowWidth")
            {
                windowWidth=dicomElement.value[0];
            }
            else if(dicomElement.name=="windowCenter")
            {
                windowCenter=dicomElement.value[0];            
            }
            else if(dicomElement.name=="rescaleSlope")
            {
                rescaleSlope=parseInt(dicomElement.value);    
            }
            else if(dicomElement.name=="rescaleIntercept")
            {
                rescaleIntercept=parseInt(dicomElement.value);
            }

            var lastRow = table.rows.length;
            var row = table.insertRow(lastRow);
            var cell0 = row.insertCell(0);
            cell0.appendChild(document.createTextNode(dicomElement.group+", "+dicomElement.element));
            var cell1 = row.insertCell(1);
            cell1.appendChild(document.createTextNode(dicomElement.name));
            var cell2 = row.insertCell(2);
            cell2.appendChild(document.createTextNode(dicomElement.value));
        } 
               
        document.getElementById("tags").style.display='';
        
        image = new DicomImage(
            [numberOfRows, numberOfColumns],
            [rowSpacing, columnSpacing],
            dicomParser.pixelBuffer );
        image.setLookup( windowCenter, windowWidth, rescaleSlope, rescaleIntercept);
        
        // image layer
        imageLayer = new Layer("imageLayer");
        imageLayer.init(image.getSize()[0], image.getSize()[1]);
        imageLayer.fillContext();
        // draw layer
        drawLayer = new Layer("drawLayer");
        drawLayer.init(image.getSize()[0], image.getSize()[1]);
        // temp layer
        tempLayer = new Layer("tempLayer");
        tempLayer.init(image.getSize()[0], image.getSize()[1]);
        // info layer
        infoLayer = new Layer("infoLayer");
        infoLayer.init(image.getSize()[0], image.getSize()[1]);
        
        self.generateImage();        
        
        toolBox.init();
        
        // Attach the mousedown, mousemove and mouseup event listeners.
        tempLayer.getCanvas().addEventListener('mousedown', evenHandler, false);
        tempLayer.getCanvas().addEventListener('mousemove', evenHandler, false);
        tempLayer.getCanvas().addEventListener('mouseup', evenHandler, false);
        tempLayer.getCanvas().addEventListener('mousewheel', evenHandler, false);
        tempLayer.getCanvas().addEventListener('DOMMouseScroll', evenHandler, false);
        
        window.addEventListener('keydown', evenHandler, true);
    }
    
    /**
     * @private
     */
    this.generateImage = function()
    {        
        var imageData = self.getImageLayer().getContext().getImageData( 
        		0, 0, 
        		self.getImage().getSize()[0], 
        		self.getImage().getSize()[1]); 
        self.getImage().generateImageData( imageData );         
        self.getImageLayer().getContext().putImageData(imageData, 0,0);
    };
}