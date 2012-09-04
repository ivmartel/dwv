/**
 * @namespace Tool classes.
 */
dwv.tool = dwv.tool || {};

/**
* @fileOverviez WindowLevel tool.
*/

/**
 * @function
 */
dwv.tool.showHUvalue = function(x,y)
{
    var context = app.getInfoLayer().getContext();
    var style = app.getStyle();
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
    var style = app.getStyle();
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

/**
 * @function
 */
dwv.tool.onchangePreset = function(event)
{    
    var presetId = parseInt(document.getElementById("presetsMenu").options[
        document.getElementById("presetsMenu").selectedIndex].value, 10);
    
    var presets = [];
    // from DICOM
    for( var i = 0; i < app.getImage().getLookup().windowPresets.length; ++i ) {
       presets.push(app.getImage().getLookup().windowPresets[i]);
    }
    // defaults
    presets.push({"center": 350, "width": 40}); // abdomen
    presets.push({"center": -600, "width": 1500}); // lung
    presets.push({"center": 40, "width": 80}); // brain
    presets.push({"center": 480, "width": 2500}); // bone
    presets.push({"center": 90, "width": 350}); // head
    // min/max preset
    var range = app.getImage().getDataRange();
    var min = range.min;
    var max = range.max;
    var width = max - min;
    var center = min + width/2;
    presets.push({"center": center, "width": width}); // min/max
    
    dwv.tool.updateWindowingData(
        presets[presetId-1].center, 
        presets[presetId-1].width );

};

/**
 * @function
 */
dwv.tool.onchangeColourMap = function(event)
{    
    var colourMapId = parseInt(document.getElementById("colourMapMenu").options[
        document.getElementById("colourMapMenu").selectedIndex].value, 10);

    switch (colourMapId)
    {
        case 1: // default
            dwv.tool.updateColourMap(dwv.image.lut.plain);
            break;
        case 2: // inv plain
            dwv.tool.updateColourMap(dwv.image.lut.invPlain);
            break;
        case 3: // rainbow
            dwv.tool.updateColourMap(dwv.image.lut.rainbow);
            break;
        case 4: // hot
            dwv.tool.updateColourMap(dwv.image.lut.hot);
            break;
        case 5: // test
            dwv.tool.updateColourMap(dwv.image.lut.test);
            break;
    }

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
            this.appendHtml();
            dwv.tool.updateWindowingData(
                    parseInt(app.getImage().getLookup().windowCenter, 10),
                    parseInt(app.getImage().getLookup().windowWidth, 10) );
        }
        else {
            this.clearHtml();
        }
    };

    this.keydown = function(event){
        app.handleKeyDown(event);
    };

}; // WindowLevel class

dwv.tool.WindowLevel.prototype.appendHtml = function()
{
    var div = document.createElement("div");
    div.id = "presetSelector";
    
    // paragraph for the window level preset selector
    var wlParagraph = document.createElement("p");  
    wlParagraph.appendChild(document.createTextNode("WL Preset: "));
    // preset selector
    var wlSelector = document.createElement("select");
    wlSelector.id = "presetsMenu";
    wlSelector.name = "presetsMenu";
    wlSelector.onchange = dwv.tool.onchangePreset;
    wlSelector.selectedIndex = 1;
    // selector options
    var wlOptions = [];
    // from DICOM
    for ( var p = 0; p < app.getImage().getLookup().windowPresets.length; ++p )
    {
        wlOptions.push( app.getImage().getLookup().windowPresets[p].name );
    }
    // default
    var wlDefaultOptions = ["Abdomen", "Lung", "Brain", "Bone", "Head", "Min/Max"];
    for ( var d = 0; d < wlDefaultOptions.length; ++d )
    {
        wlOptions.push( wlDefaultOptions[d] );
    }
    // append options
    var option;
    for ( var i = 0; i < wlOptions.length; ++i )
    {
        option = document.createElement("option");
        option.value = i+1;
        option.appendChild(document.createTextNode(wlOptions[i]));
        wlSelector.appendChild(option);
    }
    // append to paragraph
    wlParagraph.appendChild(wlSelector);
    
    // paragraph for colour map selector
    var cmParagraph = document.createElement("p");  
    cmParagraph.appendChild(document.createTextNode("Colour Map: "));
    // preset selector
    var cmSelector = document.createElement("select");
    cmSelector.id = "colourMapMenu";
    cmSelector.name = "colourMapMenu";
    cmSelector.onchange = dwv.tool.onchangeColourMap;
    cmSelector.selectedIndex = 1;
    // selector options
    var cmOptions = ["Default", "InvPlain", "Rainbow", "Hot", "Test"];
    for ( var o = 0; o < cmOptions.length; ++o )
    {
        option = document.createElement("option");
        option.value = o+1;
        option.appendChild(document.createTextNode(cmOptions[o]));
        cmSelector.appendChild(option);
    }
    // append to paragraph
    cmParagraph.appendChild(cmSelector);

    // append plot
    var plotDiv = document.createElement("div");
    plotDiv.id = "plot";
    plotDiv.style.width = "250px";
    plotDiv.style.height = "150px";
    
    // put all together
    div.appendChild(wlParagraph);
    div.appendChild(cmParagraph);
    div.appendChild(plotDiv);
    document.getElementById('toolbox').appendChild(div);
};

dwv.tool.WindowLevel.prototype.updatePlot = function(wc,ww)
{
    var half = parseInt( (ww-1) / 2, 10 );
    var center = parseInt( (wc-0.5), 10 );
    var min = center - half;
    var max = center + half;
    
    var markings = [
        { color: '#faa', lineWidth: 1, xaxis: { from: min, to: min } },
        { color: '#aaf', lineWidth: 1, xaxis: { from: max, to: max } }
    ];

    $.plot($("#plot"), [ app.getImage().getHistogram() ], {
        bars: { show: true },
        grid: { markings: markings, backgroundColor: null },
        xaxis: { show: false },
        yaxis: { show: false }
    });
};

dwv.tool.WindowLevel.prototype.clearHtml = function()
{
    // find the tool specific node
    var node = document.getElementById('presetSelector');
    // delete its content
    while (node.hasChildNodes()) {
        node.removeChild(node.firstChild);
    }
    // remove the tool specific node
    var top = document.getElementById('toolbox');
    top.removeChild(node);
};
