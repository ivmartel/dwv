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

    // Image data array
    var imageData = null;
    
    // Image information
    var originX = 0;
    var originY = 0;
    var width = 0;
    var height = 0;
    // original sizes
    var width0 = 0;
    var height0 = 0;

    // drawing first time flag 
    var firstTime = true;
    
    this.setZoom = function(zx,zy,cx,cy)
    {
        // The zoom is the ratio between the differences from the center
        // to the origins:
        originX = cx - ((cx - originX) * zx);
        originY = cy - ((cy - originY) * zy);
        // calculate new width/height
        width *= zx;
        height *= zy;
    };
    
    // translation is according to the last one
    this.setTranslate = function(tx,ty)
    {
        // new origin
    	originX += tx;
        originY += ty;
    };
    
    this.setImageData = function(data)
    {
        imageData = data;
    };
    
    this.draw = function()
    {
        // clear the context
        this.clearContextRect();
        
        // put the data in the context
        if( firstTime )
        {
            context.putImageData(imageData,originX,originY);
            firstTime = false;
        }
        else
        {
            // store the image data in a temporary canvas
            var tempCanvas = document.createElement("canvas");
            tempCanvas.width = width0;
            tempCanvas.height = height0;
            tempCanvas.getContext("2d").putImageData(imageData, 0, 0);
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
        width0 = inputWidth;
        height0 = inputHeight;
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
        // copy the image data
        imageData = layerToMerge.getContext().getImageData(0, 0, canvas.width, canvas.height);
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
