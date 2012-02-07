/**
* zoom.js
* Simple implementation of an image zoom/pan.
*/
var canvas = document.getElementById("image");
var context = canvas.getContext("2d");

// mouse event date
var mouseDownX = 0;
var mouseDownY = 0;
var isDragging = false;
// context image data
var originX = 0;
var originY = 0;
var width = 0;
var height = 0;

// image data array
var imageData = 0;

// image object
var img = new Image();
img.onload = function() {
    // initial data
    originX = canvas.width/2 - img.width/2;
    originY = canvas.height/2 - img.height/2;
    width = img.width;
    height = img.height;

    firstDrawImage();
    drawGrid();
    
    console.log("[Zoom Example] Image loaded!");
};
img.src = 'image.jpg';

/**
 * Draw the under layer grid.
 */
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

/**
 * First drawing of the image.
 * Does it from the image object.
 */
function firstDrawImage() {
    // clear whole context
    context.clearRect(0, 0, 800, 600);
    // draw
    context.drawImage(img, originX, originY, width, height);
    // store image data
    imageData = context.getImageData(originX, originY, width, height);
    // info paragraph
    appendInfo();
};

/**
 * Draw image.
 * Use the canvas as the input to draw image.
 * Context image data has been updated before in specific mouse event methods.
 */ 
function drawImage() {
    // clear whole context
    context.clearRect(0, 0, 800, 600);
    
    // store the original image data in a temporary canvas
    // to be able to give it back to be drawn
    // Question: no other way?
    var tempCanvas = document.createElement("canvas");
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    tempCanvas.getContext("2d").putImageData(imageData, 0, 0);

    // draw it in the resized context
    context.drawImage(tempCanvas, originX, originY, width, height);
    
    // info paragraph
    appendInfo();
};

/**
 * Append informational text.
 */
function appendInfo() {
    // get div
    var infoDiv = document.getElementById("info");
    // clear it
    infoDiv.innerHTML = "";
    // new text
    var text = document.createTextNode(
            "origin: ("+Math.round(originX)+","+Math.round(originY)+")"
            +", image size: ("+Math.round(width)+","+Math.round(height)+")");
    // append text to div
    infoDiv.appendChild(text);
};

/**
 * Actions on mouse down.
 * - store mouse position
 * - set isDragging flag to true
 */
canvas.onmousedown = function(event) {
    // get mouse coordinates
    mouseDownX = event.clientX - canvas.offsetLeft;
    mouseDownY = event.clientY - canvas.offsetTop;
    // start dragging
    isDragging = true;
};

/**
 * Actions on mouse move.
 * - calculate new origin
 * - draw the image
 */
canvas.onmousemove = function(event) {
    // exit if not dragging
    if( !isDragging ) return;
    
    // get mouse coordinates
    var mouseX = event.clientX - canvas.offsetLeft;
    var mouseY = event.clientY - canvas.offsetTop;
    // calculate translation
    var tx = mouseX - mouseDownX;
    var ty = mouseY - mouseDownY;
    // calculate new origin
    originX += tx;
    originY += ty;
    
    // save mouse position for next move
    mouseDownX = mouseX;
    mouseDownY = mouseY;

    // draw image
    drawImage();
};

/**
 * Actions on mouse up.
 * - set isDragging flag to false
 */
canvas.onmouseup = function(event) {
    // end dragging
    if( isDragging ) isDragging = false;
};
 
/**
 * Act on mouse wheel.
 * - zoom
 * - draw image
 */
canvas.onmousewheel = function(event) {
    // get mouse coordinates
    var mouseX = event.clientX - canvas.offsetLeft;
    var mouseY = event.clientY - canvas.offsetTop;
    // get mouse wheel
    var wheel = event.wheelDelta/120; //n or -n
    // calculate zoom
    var zoom = 1 - wheel/2;

    // zoom centered on mouse
    var centerX = mouseX;
    var centerY = mouseY;

    // calculate new origin
    
    // zoom centered on center of image, even after been moved: 
    //var centerX = originX + ( (img.width / 2) * (zoom/totalZoom) );
    //var centerY = originY + ( (img.height / 2) * (zoom/totalZoom) );

    // The zoom is the ratio between the differences from the center
    // to the origins:
    // centerX - originXnew = (centerX - originXold) * zoom
    originX = centerX - ((centerX - originX) * zoom);
    originY = centerY - ((centerY - originY) * zoom);
    
    // calculate new size
    width *= zoom;
    height *= zoom;
    
    // draw image
    drawImage();
};
