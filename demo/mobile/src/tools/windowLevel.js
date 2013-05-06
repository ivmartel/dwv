/**
 * @namespace Tool classes.
 */
dwv.tool = dwv.tool || {};

/**
* @fileOverview WindowLevel tool.
*/

/**
 * @function
 */
dwv.tool.showHUvalue = function(x,y)
{
    var div = document.getElementById("infotl");
    dwv.html.removeNode("ulinfotl");
    var ul = document.createElement("ul");
    ul.id = "ulinfotl";
    
    var lix = document.createElement("li");
    lix.appendChild(document.createTextNode("X = "+x));
    ul.appendChild(lix);
    var liy = document.createElement("li");
    liy.appendChild(document.createTextNode("Y = "+y));
    ul.appendChild(liy);
    var lihu = document.createElement("li");
    lihu.appendChild(document.createTextNode("v = "+app.getImage().getValue(x,y)));
    ul.appendChild(lihu);
    
    div.appendChild(ul);
};

/**
 * @function
 */
dwv.tool.showWindowingValue = function(windowCenter,windowWidth)
{
    var div = document.getElementById("infotr");
    dwv.html.removeNode("ulinfotr");
    var ul = document.createElement("ul");
    ul.id = "ulinfotr";
    
    var liwc = document.createElement("li");
    liwc.appendChild(document.createTextNode("WindowCenter = "+windowCenter));
    ul.appendChild(liwc);
    var liww = document.createElement("li");
    liww.appendChild(document.createTextNode("WindowWidth = "+windowWidth));
    ul.appendChild(liww);
    
    div.appendChild(ul);
};

dwv.tool.showMiniColorMap = function(windowCenter,windowWidth)
{    
    // color map
    var div = document.getElementById("infobr");
    dwv.html.removeNode("canvasinfobr");
    var canvas = document.createElement("canvas");
    canvas.id = "canvasinfobr";
    canvas.width = 98;
    canvas.height = 10;
    context = canvas.getContext('2d');
    
    // fill in the image data
    var colourMap = app.getImage().getColorMap();
    var imageData = context.getImageData(0,0,canvas.width, canvas.height);
    
    var c = 0;
    var minInt = app.getImage().getDataRange().min;
    var range = app.getImage().getDataRange().max - minInt;
    var incrC = range / canvas.width;
    var y = 0;
    
    var yMax = 255;
    var yMin = 0;
    var xMin = windowCenter - 0.5 - (windowWidth-1) / 2;
    var xMax = windowCenter - 0.5 + (windowWidth-1) / 2;    
    
    for( var j=0; j<canvas.height; ++j ) {
        c = minInt;
        for( var i=0; i<canvas.width; ++i ) {
            if( c <= xMin ) y = yMin;
            else if( c > xMax ) y = yMax;
            else {
                y = ( (c - (windowCenter-0.5) ) / (windowWidth-1) + 0.5 )
                    * (yMax-yMin) + yMin;
                y = parseInt(y,10);
            }
            index = (i + j * canvas.width) * 4;
            imageData.data[index] = colourMap.red[y];
            imageData.data[index+1] = colourMap.green[y];
            imageData.data[index+2] = colourMap.blue[y];
            imageData.data[index+3] = 0xff;
            c += incrC;
        }
    }
    // put the image data in the context
    context.putImageData(imageData, 0, 0);
    
    div.appendChild(canvas);
};

/**
 * @function
 */
dwv.tool.updateWindowingData = function(wc,ww)
{
    app.getImage().setWindowLevel(wc,ww);
    dwv.tool.showWindowingValue(wc,ww);
    dwv.tool.showMiniColorMap(wc,ww);
    dwv.tool.WindowLevel.prototype.updatePlot(wc,ww);
    app.generateAndDrawImage();
};

/**
 * @function
 */
dwv.tool.updateColourMap = function(colourMap)    
{    
    app.getImage().setColourMap(colourMap);
    app.generateAndDrawImage();
};

dwv.tool.colourMaps = {
    "plain": dwv.image.lut.plain,
    "invplain": dwv.image.lut.invPlain,
    "rainbow": dwv.image.lut.rainbow,
    "hot": dwv.image.lut.hot,
    "test": dwv.image.lut.test
};

dwv.tool.presets = {
        "abdomen": {"center": 350, "width": 40},
        "lung": {"center": -600, "width": 1500},
        "brain": {"center": 40, "width": 80},
        "bone": {"center": 480, "width": 2500},
        "head": {"center": 90, "width": 350}
    };

/**
 * @class WindowLevel class.
 */
dwv.tool.WindowLevel = function(app)
{
    var self = this;
    this.started = false;
    this.displayed = false;
    

    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        self.started = true;
        self.x0 = ev._x;
        self.y0 = ev._y;
        dwv.tool.showHUvalue(ev._x, ev._y);
    };
    
    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!self.started)
        {
            return;
        }

        var diffX = ev._x - self.x0;
        var diffY = self.y0 - ev._y;                                
        var windowCenter = parseInt(app.getImage().getWindowLut().getCenter(), 10) + diffY;
        var windowWidth = parseInt(app.getImage().getWindowLut().getWidth(), 10) + diffX;                        
        
        dwv.tool.updateWindowingData(windowCenter,windowWidth);    
        
        self.x0 = ev._x;             
        self.y0 = ev._y;
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (self.started)
        {
            self.started = false;
        }
    };
    
    this.mouseout = function(ev){
        self.mouseup(ev);
    };

    this.touchstart = function(ev){
        self.mousedown(ev);
    };

    this.touchmove = function(ev){
        self.mousemove(ev);
    };

    this.touchend = function(ev){
        self.mouseup(ev);
    };

    this.dblclick = function(ev){
        dwv.tool.updateWindowingData(
                parseInt(app.getImage().getValue(ev._x, ev._y), 10),
                parseInt(app.getImage().getWindowLut().getWidth(), 10) );    
    };
    
    this.enable = function(bool){
        if( bool ) {
            this.updatePresets();
            dwv.gui.appendWindowLevelHtml();
            dwv.tool.updateWindowingData(
                    parseInt(app.getImage().getWindowLut().getCenter(), 10),
                    parseInt(app.getImage().getWindowLut().getWidth(), 10) );
        }
        else {
            dwv.gui.clearWindowLevelHtml();
        }
    };

    this.keydown = function(event){
        app.handleKeyDown(event);
    };

}; // WindowLevel class

dwv.tool.WindowLevel.prototype.updatePresets = function()
{    
    // copy the presets and reinitialize the external one
	// (hoping to control the order of the presets)
	var presets = dwv.tool.presets;
    dwv.tool.presets = {};
	// DICOM presets
    var dicomPresets = app.getImage().getWindowPresets();
    if( dicomPresets )
    {
        for( var i = 0; i < dicomPresets.length; ++i ) {
            dwv.tool.presets[dicomPresets[i].name.toLowerCase()] = dicomPresets[i];
        }
    }
    // min/max preset
    var range = app.getImage().getDataRange();
    var min = range.min;
    var max = range.max;
    var width = max - min;
    var center = min + width/2;
    dwv.tool.presets["min/max"] = {"center": center, "width": width};
    // re-populate the external array
    for( var key in presets ) {
    	dwv.tool.presets[key] = presets[key];
    }
};

/**
 * @function
 */
dwv.tool.WindowLevel.prototype.setPreset = function(name)
{    
    // check if we have it
    if( !dwv.tool.presets[name] )
    {
        throw new Error("Unknown window level preset: '" + name + "'");
    }
    // enable it
    dwv.tool.updateWindowingData(
    		dwv.tool.presets[name].center, 
    		dwv.tool.presets[name].width );
};

/**
 * @function
 */
dwv.tool.WindowLevel.prototype.setColourMap = function(name)
{    
    // check if we have it
    if( !dwv.tool.colourMaps[name] )
    {
        throw new Error("Unknown colour map: '" + name + "'");
    }
    // enable it
    dwv.tool.updateColourMap( dwv.tool.colourMaps[name] );
};

dwv.tool.WindowLevel.prototype.updatePlot = function(wc,ww)
{
    var half = parseInt( (ww-1) / 2, 10 );
    var center = parseInt( (wc-0.5), 10 );
    var min = center - half;
    var max = center + half;
    
    var markings = [
        { "color": "#faa", "lineWidth": 1, "xaxis": { "from": min, "to": min } },
        { "color": "#aaf", "lineWidth": 1, "xaxis": { "from": max, "to": max } }
    ];

    $.plot($("#plot"), [ app.getImage().getHistogram() ], {
        "bars": { "show": true },
        "grid": { "markings": markings, "backgroundColor": null },
        "xaxis": { "show": false },
        "yaxis": { "show": false }
    });
};

// Add the tool to the list
dwv.tool.tools["windowlevel"] = dwv.tool.WindowLevel;
