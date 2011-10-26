/**
* Layer
* Window layer.
*/
function Layer(name)
{
	var canvas = null;
	var context = null;
	
	this.getName = function() { return name; };
	this.getCanvas = function() { return canvas; };
	this.getContext = function() { return context; };

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
	
	this.clearContext = function()
	{
		context.clearRect(0, 0, canvas.width, canvas.height);
	};
	
	this.merge = function(layerToMerge)
	{
    	// copy content
		context.drawImage(layerToMerge.getCanvas(), 0, 0);
    	// empty merged layer
		layerToMerge.clearContext();
	};
}
