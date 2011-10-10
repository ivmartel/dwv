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
    
    // Lookup object.
    var lookupObj = null;

    // Pixel buffer.
    var pixelBuffer = null;

    // Base context.
    var baseContext = null;    

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
    
    // Get the lookup object.
    this.getLookupObj = function() { return lookupObj; };

    // Get the pixel buffer.
    this.getPixelBuffer = function() { return pixelBuffer; };

    // Get the tool box.
    this.getToolBox = function() { return toolBox; };

    // Get the base context.
    this.getBaseContext = function() { return baseContext; };

    // Get the drawing canvas.
    this.getDrawCanvas = function() { return drawCanvas; };

    // Get the drawing context.
    this.getDrawContext = function() { return drawContext; };

    // Get the drawing context.
    this.getStyle = function() { return style; };
    
    /**
     * @private
     * @param color
     */
    this.setLineColor = function(color)
    {
        // set global var
        self.getStyle().setLineColor(color);
        // reset borders
        var tr = document.getElementById("colours");
        var tds = tr.getElementsByTagName("td");
        for (var i = 0; i < tds.length; i++)
        {
            tds[i].style.border = "#fff solid 2px";
        }
        // set selected border
        var td = document.getElementById(color);
        td.style.border = "#00f solid 2px";
    };
    
    /**
     * @private
     */
    function initCanvas()
    {
        // Find the canvas element.
        var baseCanvas = document.getElementById('imageView');
        if (!baseCanvas)
        {
            alert('Error: I cannot find the canvas element!');
            return;
        }

        if (!baseCanvas.getContext)
        {
            alert('Error: no canvas.getContext!');
            return;
        }

        // Get the 2D canvas context.
        baseContext = baseCanvas.getContext('2d');
        if (!baseContext)
        {
            alert('Error: failed to getContext!');
            return;
        }

        // Add the drawing canvas.
        var container = baseCanvas.parentNode;
        drawCanvas = document.createElement('canvas');
        if (!drawCanvas)
        {
            alert('Error: I cannot create a new canvas element!');
            return;
        }

        baseCanvas.width = image.getSize()[0];
        baseCanvas.height = image.getSize()[1];
        
        drawCanvas.id = 'imageDraw';
        drawCanvas.width = baseCanvas.width;
        drawCanvas.height = baseCanvas.height;
        container.appendChild(drawCanvas);
        drawContext = drawCanvas.getContext('2d');
    }
    
    /**
     * @private
     * This function draws the #imageDraw canvas on top of #imageView,
     * after which #imageDraw is cleared. This function is called each time when the
     * user completes a drawing operation.
     */
    this.updateContext = function() 
    {
    	self.getBaseContext().drawImage(self.getDrawCanvas(), 0, 0);
    	self.getDrawContext().clearRect(0, 0, 
    			self.getDrawCanvas().width, 
    			self.getDrawCanvas().height);
    };

    /**
     * @private
     * The general-purpose event handler. This function just determines the mouse 
   	 * position relative to the canvas element.
     */
    function evCanvas(event)
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

        if(event._x >= 0 
            && event._y >= 0 
            && event._x < image.getSize()[0] 
            && event._y < image.getSize()[1] )
        {
            // Call the event handler of the tool.
            var func = self.getToolBox().getSelectedTool()[event.type];
            if (func)
            {
                func(event);
            }
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
        
        pixelBuffer = dicomParser.pixelBuffer;
        
        image = new DicomImage(
            [numberOfRows, numberOfColumns],
            [rowSpacing, columnSpacing]);
            
        lookupObj = new LookupTable();
        lookupObj.setData( windowCenter, windowWidth, rescaleSlope, rescaleIntercept);
        lookupObj.calculateHULookup();
        
        initCanvas();
        
        baseContext.fillRect( 0, 0, image.getSize()[0], image.getSize()[1] );    
        self.generateImage();        
        
        toolBox.init();
        self.setLineColor(style.getLineColor());
        
        // Attach the mousedown, mousemove and mouseup event listeners.
        drawCanvas.addEventListener('mousedown', evCanvas, false);
        drawCanvas.addEventListener('mousemove', evCanvas, false);
        drawCanvas.addEventListener('mouseup', evCanvas, false);
        drawCanvas.addEventListener('mousewheel', evCanvas, false);
        drawCanvas.addEventListener('DOMMouseScroll', evCanvas,false);
    }
    
    /**
     * @private
     */
    this.generateImage = function()
    {        
        var imageData = self.getBaseContext().getImageData( 
        		0, 0, 
        		self.getImage().getSize()[0], 
        		self.getImage().getSize()[1]); 
        self.getLookupObj().calculateLookup();
        var n=0;    
        for(var yPix=0; yPix < self.getImage().getSize()[1]; yPix++)
        {
            for(var xPix=0; xPix < self.getImage().getSize()[0];xPix++)
            {        
                var offset = (yPix * self.getImage().getSize()[0] + xPix) * 4;                    
                var pxValue = self.getLookupObj().ylookup[ self.getPixelBuffer()[n] ];    
                n++;               
                imageData.data[offset] = parseInt(pxValue);
                imageData.data[offset+1] = parseInt(pxValue);
                imageData.data[offset+2] = parseInt(pxValue);
            }
        }            
        self.getBaseContext().putImageData(imageData, 0,0);
    };
}