/** 
 * HTML module.
 * @module html
 */
var dwv = dwv || {};
dwv.html = dwv.html || {};

/**
 * Window layer.
 * @class Layer
 * @namespace dwv.html
 * @constructor
 * @param {String} name The name of the layer.
 */
dwv.html.Layer = function(name)
{
    /**
     * The associated HTMLCanvasElement.
     * @property canvas
     * @private
     * @type Object
     */
    var canvas = null;
    /**
     * The associated CanvasRenderingContext2D.
     * @property context
     * @private
     * @type Object
     */
    var context = null;
    
    /**
     * Get the layer name.
     * @method getName
     * @return {String} The layer name.
     */
    this.getName = function() { return name; };
    /**
     * Get the layer canvas.
     * @method getCanvas
     * @return {Object} The layer canvas.
     */
    this.getCanvas = function() { return canvas; };
    /**
     * Get the layer context.
     * @method getContext
     * @return {Object} The layer context.
     */
    this.getContext = function() { return context; };
    /**
     * Get the layer offset on page.
     * @method getOffset
     * @return {Number} The layer offset on page.
     */
    this.getOffset = function() { return $('#'+name).offset(); };

    /**
     * The image data array.
     * @property imageData
     * @private
     * @type Array
     */
    var imageData = null;
    var dataWidth = 0;
    var dataHeight = 0;
    
    
    /**
     * The image origin X position.
     * @property originX
     * @private
     * @type Number
     */
    var originX = 0;
    /**
     * The image origin Y position.
     * @property originY
     * @private
     * @type Number
     */
    var originY = 0;
    /**
     * The image zoom in the X direction.
     * @property zoomX
     * @private
     * @type Number
     */
    var zoomX = 1;
    /**
     * The image zoom in the Y direction.
     * @property zoomY
     * @private
     * @type Number
     */
    var zoomY = 1;
    
    this.getOrigin = function () {
        return {x: originX, y: originY};
    };
    this.getZoom = function () {
        return {x: zoomX, y: zoomY};
    };
    var newDisplay = false;
    this.setDisplay = function ( width, height ) {
        var layer = document.getElementById( name );
        layer.width = width;
        layer.height = height;
        newDisplay = true;
    };
    
    /**
     * Set the layer zoom.
     * @method setZoom
     * @param {Number} newZoomX The zoom in the X direction.
     * @param {Number} newZoomY The zoom in the Y direction.
     * @param {Number} centerX The zoom center in the X direction.
     * @param {Number} centerY The zoom center in the Y direction.
     */
    this.zoom = function(newZoomX,newZoomY,centerX,centerY)
    {
        // check zoom value
        if( newZoomX <= 0.1 || newZoomX >= 10 ||
            newZoomY <= 0.1 || newZoomY >= 10 ) {
            return;
        }
        // The zoom is the ratio between the differences from the center
        // to the origins:
        // centerX - originX = ( centerX - originX0 ) * zoomX
        
        originX = centerX - (centerX - originX) * (newZoomX / zoomX);
        originY = centerY - (centerY - originY) * (newZoomY / zoomY);
        
        //originX = (centerX / zoomX) + originX - (centerX / newZoomX);
        //originY = (centerY / zoomY) + originY - (centerY / newZoomY);
                
        // save zoom
        zoomX = newZoomX;
        zoomY = newZoomY;
    };
    
    /**
     * Set the layer translation.
     * Translation is according to the last one.
     * @method setTranslate
     * @param {Number} tx The translation in the X direction.
     * @param {Number} ty The translation in the Y direction.
     */
    this.translate = function(tx,ty)
    {
        // check translate value
        if( zoomX >= 1 ) { 
            if( (originX + tx) < -1 * (canvas.width * zoomX) + canvas.width ||
                (originX + tx) > 0 ) {
                return;
            }
        } else {
            if( (originX + tx) > -1 * (canvas.width * zoomX) + canvas.width ||
                (originX + tx) < 0 ) {
                return;
            }
        }
        if( zoomY >= 1 ) { 
            if( (originY + ty) < -1 * (canvas.height * zoomY) + canvas.height ||
                (originY + ty) > 0 ) {
                return;
            }
        } else {
            if( (originY + ty) > -1 * (canvas.height * zoomY) + canvas.height ||
                (originY + ty) < 0 ) {
                return;
            }
        }
        // new origin
        originX += tx;
        originY += ty;
    };
    
    /**
     * Set the image data array.
     * @method setImageData
     * @param {Array} data The data array.
     */
    this.setImageData = function(data)
    {
        imageData = data;
    };
    
    /**
     * Reset the layout.
     * @method resetLayout
     */ 
    this.resetLayout = function(zoom)
    {
        originX = 0;
        originY = 0;
        zoomX = zoom;
        zoomY = zoom;
    };
    
    /**
     * Draw the content (imageData) of the layer.
     * The imageData variable needs to be set
     * @method draw
     */
    this.draw = function()
    {
        // clear the context
        context.clearRect(0, 0, dataWidth, dataHeight);
        
       // Put the image data in the context
        
        // 1. store the image data in a temporary canvas
        var tempCanvas = document.createElement("canvas");
        tempCanvas.width = dataWidth;
        tempCanvas.height = dataHeight;
        tempCanvas.getContext("2d").putImageData(imageData, 0, 0);
        // 2. draw the temporary canvas on the context
        
        var w = canvas.width;
        var h = canvas.height;
        
        if ( newDisplay ) {
            newDisplay = false;
        }
        else {
            w *= zoomX;
            h *= zoomY;
        }
        
        context.drawImage(tempCanvas,
            originX, originY, w, h);
    };
    
    /**
     * Initialise the layer: set the canvas and context
     * @method initialise
     * @input {Number} inputWidth The width of the canvas.
     * @input {Number} inputHeight The height of the canvas.
     */
    this.initialise = function(inputWidth, inputHeight)
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
        // canvas sizes
        dataWidth = inputWidth;
        dataHeight = inputHeight;
        canvas.width = inputWidth;
        canvas.height = inputHeight;
        // original empty image data array
        context.clearRect (0, 0, canvas.width, canvas.height);
        imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    };
    
    /**
     * Fill the full context with the current style.
     * @method fillContext
     */
    this.fillContext = function()
    {
        context.fillRect( 0, 0, canvas.width, canvas.height );
    };
    
    /**
     * Clear the context and reset the image data.
     * @method clear
     */
    this.clear = function()
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        this.resetLayout();
    };

    /**
     * Merge two layers.
     * @method merge
     * @input {Layer} layerToMerge The layer to merge. It will also be emptied.
     */
    this.merge = function(layerToMerge)
    {
        // basic resampling of the merge data to put it at zoom 1:1
        var mergeImageData = layerToMerge.getContext().getImageData(
            0, 0, canvas.width, canvas.height);
        var offMerge = 0;
        var offMergeJ = 0;
        var offThis = 0;
        var offThisJ = 0;
        var alpha = 0;
        for( var j=0; j < canvas.height; ++j ) {
            offMergeJ = parseInt( (originY + j * zoomY), 10 ) * canvas.width;
            offThisJ = j * canvas.width;
            for( var i=0; i < canvas.width; ++i ) {
                // 4 component data: RGB + alpha
                offMerge = 4 * ( parseInt( (originX + i * zoomX), 10 ) + offMergeJ );
                offThis = 4 * ( i + offThisJ );
                // merge non transparent 
                alpha = mergeImageData.data[offMerge+3];
                if( alpha !== 0 ) {
                    imageData.data[offThis] = mergeImageData.data[offMerge];
                    imageData.data[offThis+1] = mergeImageData.data[offMerge+1];
                    imageData.data[offThis+2] = mergeImageData.data[offMerge+2];
                    imageData.data[offThis+3] = alpha;
                }
            }
        }
        // empty and reset merged layer
        layerToMerge.clear();
        // draw the layer
        this.draw();
    };
    
    /**
     * Set the line color for the layer.
     * @method setLineColor
     * @input {String} color The line color.
     */
    this.setLineColor = function(color)
    {
        context.fillStyle = color;
        context.strokeStyle = color;
    };
    
    /**
     * Display the layer.
     * @method setStyleDisplay
     * @input {Boolean} val Whether to display the layer or not.
     */
    this.setStyleDisplay = function(val)
    {
        if( val === true )
        {
            canvas.style.display = '';
        }
        else
        {
            canvas.style.display = "none";
        }
    };
    
    /**
     * Check if the layer is visible.
     * @method isVisible
     * @return {Boolean} True if the layer is visible.
     */
    this.isVisible = function()
    {
        if( canvas.style.display === "none" ) {
            return false;
        }
        else {
            return true;
        }
    };
    
    /**
     * Align on another layer.
     * @method align
     * @param {Layer} rhs The layer to align on.
     */
    this.align = function(rhs)
    {
        canvas.style.top = rhs.getCanvas().offsetTop;
        canvas.style.left = rhs.getCanvas().offsetLeft;
    };
}; // Layer class

