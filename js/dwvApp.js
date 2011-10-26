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
    
    // Base canvas.
    var imageCanvas = null;    

    // Base context.
    var imageContext = null;    

    // Drawing canvas.
    var drawCanvas = null;

    // Drawing context.
    var drawContext = null;   
    
    // Tool box.
    var toolBox = new ToolBox(this);
    
    // Style.
    var style = new Style();
    

    // Get the image details.
    this.getImage = function() { return image; };
    
    // Get the tool box.
    this.getToolBox = function() { return toolBox; };

    // Get the image canvas.
    this.getImageCanvas = function() { return imageCanvas; };

    // Get the image context.
    this.getImageContext = function() { return imageContext; };

    // Get the drawing canvas.
    this.getDrawCanvas = function() { return drawCanvas; };

    // Get the drawing context.
    this.getDrawContext = function() { return drawContext; };

    // Get the drawing context.
    this.getStyle = function() { return style; };
    
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
     */
    function initCanvas()
    {
        // Find the canvas element.
        imageCanvas = document.getElementById('imageLayer');
        if (!imageCanvas)
        {
            alert('Error: I cannot find the canvas element!');
            return;
        }

        if (!imageCanvas.getContext)
        {
            alert('Error: no canvas.getContext!');
            return;
        }

        // Get the 2D canvas context.
        imageContext = imageCanvas.getContext('2d');
        if (!imageContext)
        {
            alert('Error: failed to getContext!');
            return;
        }

        imageCanvas.width = image.getSize()[0];
        imageCanvas.height = image.getSize()[1];

        // Find the canvas element.
        drawCanvas = document.getElementById('drawLayer');
        if (!drawCanvas)
        {
            alert('Error: I cannot find the canvas element!');
            return;
        }

        if (!drawCanvas.getContext)
        {
            alert('Error: no canvas.getContext!');
            return;
        }

        // Get the 2D canvas context.
        drawContext = drawCanvas.getContext('2d');
        if (!drawContext)
        {
            alert('Error: failed to getContext!');
            return;
        }

        drawCanvas.width = image.getSize()[0];
        drawCanvas.height = image.getSize()[1];
    }
    
    /**
     * @private
     * This function draws the #imageDraw canvas on top of #imageView,
     * after which #imageDraw is cleared. This function is called each time when the
     * user completes a drawing operation.
     */
    this.updateContext = function() 
    {
    	self.getImageContext().drawImage(self.getDrawCanvas(), 0, 0);
    	self.getDrawContext().clearRect(0, 0, 
    			self.getDrawCanvas().width, 
    			self.getDrawCanvas().height);
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
                document.getElementById('tagSearch').insertBefore(span, null);
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
        
        initCanvas();
        
        imageContext.fillRect( 0, 0, image.getSize()[0], image.getSize()[1] );    
        self.generateImage();        
        
        toolBox.init();
        
        // Attach the mousedown, mousemove and mouseup event listeners.
        drawCanvas.addEventListener('mousedown', evenHandler, false);
        drawCanvas.addEventListener('mousemove', evenHandler, false);
        drawCanvas.addEventListener('mouseup', evenHandler, false);
        drawCanvas.addEventListener('mousewheel', evenHandler, false);
        drawCanvas.addEventListener('DOMMouseScroll', evenHandler, false);
        
        window.addEventListener('keydown', evenHandler, true);
    }
    
    /**
     * @private
     */
    this.generateImage = function()
    {        
        var imageData = self.getImageContext().getImageData( 
        		0, 0, 
        		self.getImage().getSize()[0], 
        		self.getImage().getSize()[1]); 
        self.getImage().generateImageData( imageData );         
        self.getImageContext().putImageData(imageData, 0,0);
    };
}