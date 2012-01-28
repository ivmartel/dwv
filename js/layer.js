/**
* Layer
* Window layer.
*/
function Layer(name)
{
	// A HTMLCanvasElement.
	var canvas = null;
	// A CanvasRenderingContext2D.
	var context = null;
	
	// Get the layer name.
	this.getName = function() { return name; };
	// Get the layer canvas.
	this.getCanvas = function() { return canvas; };
	// Get the layer context
	this.getContext = function() { return context; };

	var imageData = null;
	
	var zoomX = 1;
	var zoomY = 1;
	var zoomCenterX = 0;
	var zoomCenterY = 0;
	var transX = 0;
	var transY = 0;

    var originX = 0;
    var originY = 0;
    var width = 0;
	var height = 0;
	
	var firstTime = true;
	
	this.setZoom = function(zx,zy,cx,cy)
	{
		zoomX = zx;
		zoomY = zy;
		zoomCenterX = cx;
		zoomCenterY = cy;
	};
	
	// translation is according to the last one
	this.setTranslate = function(tx,ty)
	{
		transX = tx;
		transY = ty;
	};
	
	this.setImageData = function(data)
	{
		imageData = data;
	};
	
    this.draw = function()
    {
        // get the image data before clearing
        var imageData2 = context.getImageData(originX, originY, width, height);
        
        // re-generate data if windowing has changed or de-zoom
        //...
        
        // clear the context
        this.clearContextRect();
        
        // store width/height
        var oldWidth = width;
        var oldHeight = height;

        // put the data in the context
        if( firstTime )
        {
            context.putImageData(imageData,originX,originY);
            firstTime = false;
        }
        else
        {
            if( transX != 1 || transY != 1)
            {
                originX += transX;
                originY += transY;
                // restore base settings
                transX = 0;
                transY = 0;
            }
            if( zoomX != 1 || zoomY != 1)
            {
                // The zoom is the ratio between the differences from the center
                // to the origins:
                originX = zoomCenterX - ((zoomCenterX - originX) / zoomX);
                originY = zoomCenterY - ((zoomCenterY - originY) / zoomY);
                // calculate new width/height
                width /= zoomX;
                height /= zoomY;
                // restore base settings
                zoomX = 1;
                zoomY = 1;
            }
            
            // store the image data in a temporary canvas
            var tempCanvas = document.createElement("canvas");
            tempCanvas.width = oldWidth;
            tempCanvas.height = oldHeight;
            tempCanvas.getContext("2d").putImageData(imageData2, 0, 0);
            // draw the temporary canvas on the fixes context
            context.drawImage(tempCanvas,originX,originY,width,height);
        }
	};
	
	/**
	 * Initialise the layer: set the canvas and context
	 * @input width The width of the canvas.
	 * @input height The height of the canvas.
	 */
	this.init = function(inputWidth, inputHeight)
	{
	    // find the canvas element
		canvas = document.getElementById(name);
	    if (!canvas)
	    {
	        alert("Error: cannot find the canvas element for '" + name + "'.");
	        return;
	    }
		// check that the getContext method exists
	    if (!canvas.getContext)
	    {
	        alert("Error: no canvas.getContext method for '" + name + "'.");
	        return;
	    }
	    // get the 2D context
	    context = canvas.getContext('2d');
	    if (!context)
	    {
	        alert("Error: failed to get the 2D context for '" + name + "'.");
	        return;
	    }
	    // set sizes
	    canvas.width = inputWidth;
	    canvas.height = inputHeight;
	    
	    width = inputWidth;
	    height = inputHeight;
	};
	
	/**
	 * Fill the full context with the current style.
	 */
	this.fillContext = function()
	{
	    context.fillRect( 0, 0, canvas.width, canvas.height );
	};
	
	/**
	 * Clear the full context.
	 */
	this.clearContextRect = function()
	{
		context.clearRect(0, 0, canvas.width, canvas.height);
	};
	
	/**
	 * Merge two layers.
	 */
	this.merge = function(layerToMerge)
	{
    	// copy content
		context.drawImage(layerToMerge.getCanvas(), 0, 0);
    	// empty merged layer
		layerToMerge.clearContextRect();
	};
	
	/**
	 * Set the fill and stroke style of the context.
	 */
	this.setLineColor = function(color)
	{
		context.fillStyle = color;
		context.strokeStyle = color;
	};
} // Layer class
