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

	/**
	 * Initialise the layer: set the canvas and context
	 * @input width The width of the canvas.
	 * @input height The height of the canvas.
	 */
	this.init = function(width, height)
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
	    canvas.width = width;
	    canvas.height = height;
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
