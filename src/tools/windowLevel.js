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
    var context = app.getInfoLayer().getContext();
    var style = new dwv.html.Style();
    var border = 3;

    // style
    context.clearRect(0, 0, 150, 150);
    context.fillStyle = style.getTextColor();
    context.font = style.getFontStr();
    context.textBaseline = "top";
    context.textAlign = "left";
    
    // text
    context.fillText("X = "+x, border, border);
    context.fillText("Y = "+y, border, border + style.getLineHeight());
    context.fillText(
            "HU = "+app.getImage().getValue(x,y), 
            border, 
            border + 2*style.getLineHeight());
};

/**
 * @function
 */
dwv.tool.showWindowingValue = function(windowCenter,windowWidth)
{
    var canvas = app.getInfoLayer().getCanvas();
    var context = app.getInfoLayer().getContext();
    var style = new dwv.html.Style();
    var border = 3;
    
    // style
    context.clearRect(canvas.width-150, 0, canvas.width, 150);
    context.fillStyle = style.getTextColor();
    context.font = style.getFontStr();
    context.textBaseline = "top";
    context.textAlign = "right";
    
    // text
    context.fillText("WindowCenter = "+windowCenter, canvas.width - border, border);
    context.fillText("WindowWidth = "+windowWidth, canvas.width - border, border + style.getLineHeight());
    
    // append color map
    // fill in the image data
    var colourMap = dwv.image.lut.plain;
    var imageData = context.getImageData(0,0,canvas.width, canvas.height);
    var height = 10;
    var width = 100;
    var margin = 1;
    var iEnd = canvas.width - margin;
    var iStart = iEnd - width;
    var jEnd = canvas.height - margin;
    var jStart = jEnd - height;
    
    var c = 0;
    var minInt = app.getImage().getDataRange().min;
    var range = app.getImage().getDataRange().max - minInt;
    var incrC = range / width;
    var y = 0;
    
    var yMax = 255;
    var yMin = 0;
    var xMin = windowCenter - 0.5 - (windowWidth-1) / 2;
    var xMax = windowCenter - 0.5 + (windowWidth-1) / 2;    
    
    for( var j=jStart; j<jEnd; ++j ) {
        c = minInt;
        for( var i=iStart; i<iEnd; ++i ) {
            if( c <= xMin ) y = yMin;
            else if( c > xMax ) y = yMax;
            else {
                y = ( (c - (windowCenter-0.5) ) / (windowWidth-1) + 0.5 )
                    * (yMax-yMin) + yMin;
                y = parseInt(y,10);
            }
            index = (i + j * imageData.width) * 4;
            imageData.data[index] = colourMap.red[y];
            imageData.data[index+1] = colourMap.green[y];
            imageData.data[index+2] = colourMap.blue[y];
            imageData.data[index+3] = 0xff;
            c += incrC;
        }
    }
    // put the image data in the context
    context.putImageData(imageData, 0, 0);
    

};

/**
 * @function
 */
dwv.tool.updateWindowingData = function(wc,ww)
{
    app.getImage().getLookup().setWindowingdata(wc,ww);
    dwv.tool.showWindowingValue(wc,ww);
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

/**
 * @class WindowLevel class.
 */
dwv.tool.WindowLevel = function(app)
{
    var self = this;
    this.started = false;
    this.displayed = false;
    
    this.presets = {
        "abdomen": {"center": 350, "width": 40},
        "lung": {"center": -600, "width": 1500},
        "brain": {"center": 40, "width": 80},
        "bone": {"center": 480, "width": 2500},
        "head": {"center": 90, "width": 350}
    };

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
        var windowCenter = parseInt(app.getImage().getLookup().windowCenter, 10) + diffY;
        var windowWidth = parseInt(app.getImage().getLookup().windowWidth, 10) + diffX;                        
        
        dwv.tool.updateWindowingData(windowCenter,windowWidth);    
        
        self.x0 = ev._x;             
        self.y0 = ev._y;
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (self.started)
        {
            self.mousemove(ev);
            self.started = false;
        }
    };
    
    this.dblclick = function(ev){
        dwv.tool.updateWindowingData(
                parseInt(app.getImage().getValue(ev._x, ev._y), 10),
                parseInt(app.getImage().getLookup().windowWidth, 10) );    
    };
    
    this.enable = function(bool){
        if( bool ) {
            this.updatePresets();
            dwv.gui.appendWindowLevelHtml();
            dwv.tool.updateWindowingData(
                    parseInt(app.getImage().getLookup().windowCenter, 10),
                    parseInt(app.getImage().getLookup().windowWidth, 10) );
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
    // from DICOM
    var dicomPresets = app.getImage().getLookup().windowPresets;
    for( var i = 0; i < dicomPresets.length; ++i ) {
        this.presets[dicomPresets[i].name.toLowerCase()] = dicomPresets[i];
    }
    // min/max preset
    var range = app.getImage().getDataRange();
    var min = range.min;
    var max = range.max;
    var width = max - min;
    var center = min + width/2;
    this.presets["min/max"] = {"center": center, "width": width};
};

/**
 * @function
 */
dwv.tool.WindowLevel.prototype.setPreset = function(name)
{    
    // check if we have it
    if( !this.presets[name] )
    {
        throw new Error("Unknown window level preset: '" + name + "'");
    }
    // enable it
    dwv.tool.updateWindowingData(
        this.presets[name].center, 
        this.presets[name].width );
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
