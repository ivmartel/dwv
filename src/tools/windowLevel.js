/**
* windowLevel.js
* WindowLevel tool.
*/

function showHUvalue(x,y)
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
}

function showWindowingValue(windowCenter,windowWidth)
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
}

function updateWindowingData(wc,ww)
{
    app.getImage().getLookup().setWindowingdata(wc,ww);
    showWindowingValue(wc,ww);
    app.generateAndDrawImage();
}

function updateColourMap(colourMap)    
{    
    app.getImage().setColourMap(colourMap);
    app.generateAndDrawImage();
}

function applyPreset(presetId)    
{    
    var ww, wc;
    switch (presetId)
    {
        case 1: // default
            wc=app.getImage().getLookup().defaultWindowCenter;
            ww=app.getImage().getLookup().defaultWindowWidth;
            updateWindowingData(wc,ww);
            break;
        
        case 2: // abdomen
            wc=350;
            ww=40;
            updateWindowingData(wc,ww);
            break;
        
        case 3: // lung
            wc=-600;
            ww=1500;
            updateWindowingData(wc,ww);
            break;
        
        case 4: // brain
            wc=40;
            ww=80;
            updateWindowingData(wc,ww);
            break;
        
        case 5: // bone
            wc=480;
            ww=2500;
            updateWindowingData(wc,ww);
            break;
        
        case 6: // head
            wc=90;
            ww=350;
            updateWindowingData(wc,ww);
            break;
    }
}

function applyColourMap(colourMapId)    
{    
    switch (colourMapId)
    {
        case 1: // default
            updateColourMap(lut.plain);
            break;
            
        case 2: // rainbow
            updateColourMap(lut.rainbow);
            break;
    }
}

function changePreset(event)
{    
    applyPreset( parseInt(document.getElementById("presetsMenu").options[
        document.getElementById("presetsMenu").selectedIndex].value, 10) );
}

function changeColourMap(event)
{    
    applyColourMap( parseInt(document.getElementById("colourMapMenu").options[
        document.getElementById("colourMapMenu").selectedIndex].value, 10) );
}


/**
 * WindowLevel class.
 */
tool.WindowLevel = function(app)
{
    var self = this;
    this.started = false;
    this.displayed = false;

    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        self.started = true;
        self.x0 = ev._x;
        self.y0 = ev._y;
        showHUvalue(ev._x, ev._y);
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
        
        updateWindowingData(windowCenter,windowWidth);    
        
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
    
    this.enable = function(bool){
        if( bool ) {
            this.appendHtml();
        }
        else {
            this.clearHtml();
        }
    };

    this.keydown = function(event){
        app.handleKeyDown(event);
    };

}; // WindowLevel function

tool.WindowLevel.prototype.appendHtml = function()
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
    wlSelector.onchange = changePreset;
    wlSelector.selectedIndex = 1;
    // selector options
    var wlOptions = ["Default", "Abdomen", "Lung", "Brain", "Bone", "Head"];
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
    cmSelector.onchange = changeColourMap;
    cmSelector.selectedIndex = 1;
    // selector options
    var cmOptions = ["Default", "Rainbow"];
    for ( var o = 0; o < cmOptions.length; ++o )
    {
        option = document.createElement("option");
        option.value = o+1;
        option.appendChild(document.createTextNode(cmOptions[o]));
        cmSelector.appendChild(option);
    }
    // append to paragraph
    cmParagraph.appendChild(cmSelector);

    div.appendChild(wlParagraph);
    div.appendChild(cmParagraph);
    document.getElementById('toolbox').appendChild(div);
};

tool.WindowLevel.prototype.clearHtml = function()
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
