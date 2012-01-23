/**
* zoom.js
* Simple implementation of an image zoom.
*/
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var totalZoom = 1;
var originX0 = 0;
var originY0 = 0;
var originX = 0;
var originY = 0;
var mouseDownX = 0;
var mouseDownY = 0;
var isDragging = false;

var img = new Image();
img.onload = function() {
    originX = canvas.width/2 - img.width/2;
    originY = canvas.height/2 - img.height/2;
    originX0 = originX;
    originY0 = originY;
    drawImage();
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

function drawImage() {
    // clear whole rect
    context.clearRect(0, 0, 800, 600);
    // adapt to zoom
    var width = img.width/totalZoom;
    var height = img.height/totalZoom;
    // draw
    context.drawImage(img, originX, originY, width, height);
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
    drawImage();
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
    // store new origin
    originX += tx;
    originY += ty;
};
 
canvas.onmousewheel = function(event) {
    // get mouse coordinates
    var mouseX = event.clientX - canvas.offsetLeft;
    var mouseY = event.clientY - canvas.offsetTop;
    // get mouse wheel
    var wheel = event.wheelDelta/120;//n or -n
    // calculate zoom
    var zoom = 1 + wheel/2;
    // store new zoom
    totalZoom *= zoom;

    // method using context.drawImage
    zoomImage0(mouseX, mouseY, zoom);
    // method using context.scale
    //zoomImage1(totalZoom);
};

function zoomImage0(mouseX, mouseY, zoom) {
    // zoom centered on mouse: 
    var centerX = mouseX;
    var centerY = mouseY;
    // zoom centered on center of image, even after been moved: 
    //var centerX = originX + ( (img.width / 2) * (zoom/totalZoom) );
    //var centerY = originY + ( (img.height / 2) * (zoom/totalZoom) );
    
    // The zoom is the ratio between the differences from the center
    // to the origins:
    // centerX - originXnew = (centerX - originXold) / zoom
    originX = centerX - ((centerX - originX) / zoom);
    originY = centerY - ((centerY - originY) / zoom);
    
    // draw
    drawImage();
}

function zoomImage1(level) {
    // shift origin
    //originX = originX/zoom;
    //originY = originY/zoom;
   
    // save context
    context.save();
    // translate to zoom center
    context.translate(originX, originY);
    // scale context
    context.scale(totalZoom, totalZoom);
    // draw in modified context
    drawImage();
    // translate back
    context.translate(originX*totalZoom, originY*totalZoom);
    // restore context
    context.restore();

    // restore origin
    originX = originX*zoom;
    originY = originY*zoom;
}
