/**
* dwvApp
* Main application.
*/
function DwvApp()
{
	var self = this;
	
	// image details
    this.gImage;
    
    // 
    this.gLookupTable;

    // 
    var gHuLookupTable; 

    // 
    this.gLookupObj;

    // 
    this.gPixelBuffer;

    // 
    var gImageLoaded = 0;
    
    // tools
    this.gToolBox = new ToolBox(this);
    
    // display
    var gBaseCanvas;

    // 
    this.gBaseContext;    

    // 
    this.gDrawCanvas;

    // 
    this.gDrawContext;    
    
    // style
    this.gStyle = new Style();

    /**
     * @private
     * @param color
     */
    this.gSetLineColor = function(color)
    {
        // set global var
        self.gStyle.setLineColor(color);
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
    function gInitCanvas()
    {
        // Find the canvas element.
        gBaseCanvas = document.getElementById('imageView');
        if (!gBaseCanvas)
        {
            alert('Error: I cannot find the canvas element!');
            return;
        }

        if (!gBaseCanvas.getContext)
        {
            alert('Error: no canvas.getContext!');
            return;
        }

        // Get the 2D canvas context.
        self.gBaseContext = gBaseCanvas.getContext('2d');
        if (!self.gBaseContext)
        {
            alert('Error: failed to getContext!');
            return;
        }

        // Add the drawing canvas.
        var container = gBaseCanvas.parentNode;
        self.gDrawCanvas = document.createElement('canvas');
        if (!self.gDrawCanvas)
        {
            alert('Error: I cannot create a new canvas element!');
            return;
        }

        gBaseCanvas.width = self.gImage.getSize()[0];
        gBaseCanvas.height = self.gImage.getSize()[1];
        
        self.gDrawCanvas.id = 'imageDraw';
        self.gDrawCanvas.width = gBaseCanvas.width;
        self.gDrawCanvas.height = gBaseCanvas.height;
        container.appendChild(self.gDrawCanvas);
        self.gDrawContext = self.gDrawCanvas.getContext('2d');
    }
    
    /**
     * @private
     * This function draws the #imageDraw canvas on top of #imageView,
     * after which #imageDraw is cleared. This function is called each time when the
     * user completes a drawing operation.
     */
    this.gContextUpdate = function() 
    {
    	self.gBaseContext.drawImage(self.gDrawCanvas, 0, 0);
    	self.gDrawContext.clearRect(0, 0, self.gDrawCanvas.width, self.gDrawCanvas.height);
    };

    /**
     * @private
     * The general-purpose event handler. This function just determines the mouse 
   	 * position relative to the canvas element.
     */
    function gEvCanvas(event)
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
            && event._x < self.gImage.getSize()[0] 
            && event._y < self.gImage.getSize()[1] )
        {
            // Call the event handler of the tool.
            var func = self.gToolBox.getSelectedTool()[event.type];
            if (func)
            {
                func(event);
            }
        }
    }

    /**
     * @public
     */
    this.gLoadDicom = function(evt) 
    {
        gLoadDicomFile(evt.target.files[0]);
    };
    
    /**
     * @private
     * @param file
     */
    function gLoadDicomFile(file) 
    {
        var myreader = new FileReader();
        myreader.onload = function() {
            return function(e) {
                gParseAndLoadDicom(e.target.result);
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
    function gParseAndLoadDicom(file)
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
        
        self.gPixelBuffer = dicomParser.pixelBuffer;
        
        self.gImage = new DicomImage(
            [numberOfRows, numberOfColumns],
            [rowSpacing, columnSpacing]);
            
        self.gLookupObj = new LookupTable();
        self.gLookupObj.setData( windowCenter, windowWidth, rescaleSlope, rescaleIntercept);
        self.gLookupObj.calculateHULookup();
        
        gInitCanvas();
        
        self.gBaseContext.fillRect( 0, 0, self.gImage.getSize()[0], self.gImage.getSize()[1] );    
        self.gGenImage();        
        gImageLoaded=1;
        
        self.gToolBox.init();
        self.gSetLineColor(self.gStyle.getLineColor());
        
        // Attach the mousedown, mousemove and mouseup event listeners.
        self.gDrawCanvas.addEventListener('mousedown', gEvCanvas, false);
        self.gDrawCanvas.addEventListener('mousemove', gEvCanvas, false);
        self.gDrawCanvas.addEventListener('mouseup', gEvCanvas, false);
        self.gDrawCanvas.addEventListener('mousewheel', gEvCanvas, false);
        self.gDrawCanvas.addEventListener('DOMMouseScroll',gEvCanvas,false);
    }
    
    /**
     * @private
     */
    this.gGenImage = function()
    {        
        var imageData = self.gBaseContext.getImageData( 
        		0, 0, 
        		self.gImage.getSize()[0], 
        		self.gImage.getSize()[1]); 
        self.gLookupObj.calculateLookup();
        var n=0;    
        for(var yPix=0; yPix < self.gImage.getSize()[1]; yPix++)
        {
            for(var xPix=0; xPix < self.gImage.getSize()[0];xPix++)
            {        
                var offset = (yPix * self.gImage.getSize()[0] + xPix) * 4;                    
                var pxValue = self.gLookupObj.ylookup[ self.gPixelBuffer[n] ];    
                n++;               
                imageData.data[offset] = parseInt(pxValue);
                imageData.data[offset+1] = parseInt(pxValue);
                imageData.data[offset+2] = parseInt(pxValue);
            }
        }            
        self.gBaseContext.putImageData(imageData, 0,0);
    };
}