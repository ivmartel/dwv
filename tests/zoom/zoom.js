/**
* zoom.js
* Simple implementation of an image zoom.
*/
var canvas = document.getElementById("image");
var context = canvas.getContext("2d");
var mouseDownX = 0;
var mouseDownY = 0;
var isDragging = false;

var originX0 = 0;
var originY0 = 0;
var width0 = 0;
var height0 = 0;

var newOriginX = 0;
var newOriginY = 0;
var newWidth = 0;
var newHeight = 0;
var newZoom = 1;

var oldOriginX = 0;
var oldOriginY = 0;
var oldWidth = 0;
var oldHeight = 0;
var oldZoom = 1;

var img = new Image();
img.onload = function() {
    originX0 = canvas.width/2 - img.width/2;
    originY0 = canvas.height/2 - img.height/2;
    newOriginX = originX0;
    newOriginY = originY0;
    oldOriginX = originX0;
    oldOriginY = originY0;
    
    width0 = img.width;
    height0 = img.height;
    newWidth = width0;
    newHeight = height0;
    oldWidth = width0;
    oldHeight = height0;
        
    firstDrawImage();
    drawGrid();
};

img.src = 'image.jpg';

function drawGrid() {
    var gridCanvas = document.getElementById("grid");
    var gridContext = gridCanvas.getContext("2d");
    // grid
    gridContext.lineWidth = 0.1;
    var divideX = 20;
    var divideY = 20;
    var incrX = img.width / divideX;
    var incrY = img.height / divideY;
    var nLinesX = Math.round(gridCanvas.width/incrX);
    var nLinesY = Math.round(gridCanvas.height/incrY);
    var beginX = (gridCanvas.width - nLinesX * incrX) / 2;
    var beginY = (gridCanvas.height - nLinesY * incrY) / 2;
    
    // vertical
    for( var i = 0; i < nLinesX; ++i )
    {
        if( i == Math.round(nLinesX / 2) ) gridContext.lineWidth = 1;
        else gridContext.lineWidth = 0.1;
        gridContext.beginPath();
        gridContext.moveTo( beginX + i*incrX, 0);
        gridContext.lineTo( beginX + i*incrX, gridCanvas.height);
        gridContext.stroke();
    }
    // horizontal
    for( var j = 0; j < nLinesY; ++j )
    {
        if( j == Math.round(nLinesY / 2) ) gridContext.lineWidth = 1;
        else gridContext.lineWidth = 0.1;
        gridContext.beginPath();
        gridContext.moveTo( 0, beginY + j*incrY );
        gridContext.lineTo( gridCanvas.width, beginY + j*incrY );
        gridContext.stroke();
    }
};

function firstDrawImage() {
    // clear whole rect
    context.clearRect(0, 0, 800, 600);
	// draw
    context.drawImage(img, originX0, originY0, width0, height0);
};

// use the image as input to the draw image
function drawImage0() {
    // store old
    oldWidth = newWidth;
    oldHeight = newHeight;
    // calculate new
    newWidth = oldWidth*newZoom;
    newHeight = oldHeight*newZoom;
    
    // clear whole rect
    context.clearRect(0, 0, 800, 600);
	// draw
    context.drawImage(img, newOriginX, newOriginY, newWidth, newHeight);
    
    // info paragraph
    appendInfo();
};

// use the canvas as the input to the draw image
function drawImage1() {
    // store old
    oldWidth = newWidth;
    oldHeight = newHeight;
    // calculate new
    newWidth = oldWidth*newZoom;
    newHeight = oldHeight*newZoom;
    
    // get the image data before clearing
    var imageData = context.getImageData(oldOriginX, oldOriginY, oldWidth, oldHeight);
    // clear whole rect
    context.clearRect(0, 0, 800, 600);
	
    // store the image data in a temporary canvas
    var tempCanvas = document.createElement("canvas");
	tempCanvas.width = oldWidth;
	tempCanvas.height = oldHeight;
	tempCanvas.getContext("2d").putImageData(imageData, 0, 0);

	/*context.scale(newZoom,newZoom);
	context.drawImage(tempCanvas, newOriginX, newOriginY);
	context.restore();*/
    
	context.drawImage(tempCanvas, newOriginX, newOriginY, newWidth, newHeight);
    
    // info paragraph
    appendInfo();
};

function appendInfo() {
	// add info
    var infoDiv = document.getElementById("info");
    infoDiv.innerHTML = "";
    var text = document.createTextNode(
    		"origin 0: ("+Math.round(originX0)+","+Math.round(originY0)+")"
    		+", old origin: ("+Math.round(oldOriginX)+","+Math.round(oldOriginY)+")"
    		+", new origin: ("+Math.round(newOriginX)+","+Math.round(newOriginY)+")"
    		+", old image size: ("+Math.round(oldWidth)+","+Math.round(oldHeight)+")"
    		+", new image size: ("+Math.round(newWidth)+","+Math.round(newHeight)+")"
    		+", old zoom: "+oldZoom
			+", new zoom: "+newZoom);
    infoDiv.appendChild(text);
};

canvas.onmousedown = function(event) {
    // get mouse coordinates
    var mouseX = event.clientX - canvas.offsetLeft;
    var mouseY = event.clientY - canvas.offsetTop;
    // start dragging
    isDragging = true;
    // save initial mouse down
    mouseDownX = mouseX;
    mouseDownY = mouseY;
};
 
canvas.onmousemove = function(event) {
    // exit if not dragging
    if( !isDragging ) return;
    
    // get mouse coordinates
    var mouseX = event.clientX - canvas.offsetLeft;
    var mouseY = event.clientY - canvas.offsetTop;
    // calculate translation
    var tx = mouseX - mouseDownX;
    var ty = mouseY - mouseDownY;
    
    // save context
    context.save();
    // translate it
    context.translate(tx, ty);
    // draw in translated context
    drawImage0();
    // restore context
    context.restore();
};

canvas.onmouseup = function(event) {
    // end dragging
    isDragging = false;
    // get mouse coordinates
    var mouseX = event.clientX - canvas.offsetLeft;
    var mouseY = event.clientY - canvas.offsetTop;
    // calculate translation
    var tx = mouseX - mouseDownX;
    var ty = mouseY - mouseDownY;
    // store old
    oldOriginX = newOriginX;
    oldOriginY = newOriginY;
    // calculate new
    newOriginX += tx;
    newOriginY += ty;
};
 
canvas.onmousewheel = function(event) {
    // get mouse coordinates
    var mouseX = event.clientX - canvas.offsetLeft;
    var mouseY = event.clientY - canvas.offsetTop;
    // get mouse wheel
    var wheel = event.wheelDelta/120;//n or -n
    // calculate zoom
    var zoom = 1 + wheel/2;

    // method using context.drawImage
    zoomImage(mouseX, mouseY, zoom);
};

function zoomImage(mouseX, mouseY, zoom) {
    // zoom centered on mouse: 
    var centerX = mouseX;
    var centerY = mouseY;
    // zoom centered on center of image, even after been moved: 
    //var centerX = originX + ( (img.width / 2) * (zoom/totalZoom) );
    //var centerY = originY + ( (img.height / 2) * (zoom/totalZoom) );
    
    // store old
    oldOriginX = newOriginX;
    oldOriginY = newOriginY;
    oldZoom = newZoom;

    // calculate new
    
    // The zoom is the ratio between the differences from the center
    // to the origins:
    // centerX - originXnew = (centerX - originXold) * zoom
    newOriginX = centerX - ((centerX - oldOriginX) * zoom);
    newOriginY = centerY - ((centerY - oldOriginY) * zoom);
    newZoom = zoom;
    
    // draw image from the image object
    //drawImage0();
    // draw image from the canvas object
    // problem when un-zooming...
    drawImage1();
}
