/**
* windowLevel.js
* WindowLevel tool.
*/
tool.WindowLevel = function(app)
{
    var tool = this;
    this.started = false;
    this.displayed = false;

    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        tool.started = true;
        tool.x0 = ev._x;
        tool.y0 = ev._y;
        showHUvalue(ev._x, ev._y);
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!tool.started)
        {
            return;
        }

        var diffX = ev._x - tool.x0;
        var diffY = tool.y0 - ev._y;                                
        var windowCenter = parseInt(app.getLookupObj().windowCenter) + diffY;
        var windowWidth = parseInt(app.getLookupObj().windowWidth) + diffX;                        
        
        updateWindowingData(windowCenter,windowWidth);    
        
        tool.x0 = ev._x;             
        tool.y0 = ev._y;
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (tool.started)
        {
            tool.mousemove(ev);
            tool.started = false;
            app.updateContext();
        }
    };
    
    this.enable = function(bool){
    	if( bool )
		{
    		this.appendHtml();
		}
    	else
		{
    		this.clearHtml();
		}
    };
    
}; // WindowLevel function

tool.WindowLevel.prototype.appendHtml = function()
{
    var paragraph = document.createElement("p");  
    paragraph.appendChild(document.createTextNode("WL Preset: "));
    
    var selector = document.createElement("select");
    selector.id = "presetsMenu";
    selector.name = "presetsMenu";
    selector.onchange = changePreset;
    selector.selectedIndex = 1;
    paragraph.appendChild(selector);

    var options = new Array("Default", "Abdomen", "Lung", "Brain", "Bone", "Head");
    var option;
    for ( var i = 0; i < options.length; ++i )
    {
        option = document.createElement("option");
        option.value = i+1;
        option.appendChild(document.createTextNode(options[i]));
        selector.appendChild(option);
    }

    document.getElementById('presetSelector').appendChild(paragraph);
};

tool.WindowLevel.prototype.clearHtml = function()
{
	node = document.getElementById('presetSelector');
	while (node.hasChildNodes()) node.removeChild(node.firstChild);
};

function showHUvalue(x,y)
{
    var t = (y*app.getImage().getSize()[0])+x;        
    
    // style
    app.getDrawContext().clearRect(0, 0, 150, 150);
    app.getDrawContext().fillStyle = app.getStyle().getTextColor();
    app.getDrawContext().font = app.getStyle().getFontStr();
    app.getDrawContext().textBaseline = "top";
    app.getDrawContext().textAlign = "left";
    
    // text
    app.getDrawContext().fillText("X = "+x, 0, 0);
    app.getDrawContext().fillText("Y = "+y, 0, app.getStyle().getLineHeight());
    app.getDrawContext().fillText(
    		"HU = "+app.getLookupObj().huLookup[app.getPixelBuffer()[t]], 
    		0, 
    		2*app.getStyle().getLineHeight());
}

function showWindowingValue(windowCenter,windowWidth)
{
    // style
	app.getDrawContext().clearRect(app.getDrawCanvas().width-150, 0, app.getDrawCanvas().width, 150);
	app.getDrawContext().fillStyle = app.getStyle().getTextColor();
	app.getDrawContext().font = app.getStyle().getFontStr();
	app.getDrawContext().textBaseline = "top";
	app.getDrawContext().textAlign = "right";
    
    // text
	app.getDrawContext().fillText("WindowCenter = "+windowCenter, app.getDrawCanvas().width, 0);
	app.getDrawContext().fillText("WindowWidth = "+windowWidth, app.getDrawCanvas().width, app.getStyle().getLineHeight());
}

function updateWindowingData(wc,ww)
{
	app.getLookupObj().setWindowingdata(wc,ww);
    showWindowingValue(wc,ww);
    app.generateImage();
}

function changePreset()
{    
    applyPreset(parseInt(document.getElementById("presetsMenu").options[
        document.getElementById("presetsMenu").selectedIndex].value));
}

function applyPreset(preset)    
{    
    var ww, wc;
    switch (preset)
    {
        case 1: // default
            wc=app.getLookupObj().defaultWindowCenter;
            ww=app.getLookupObj().defaultWindowWidth;
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
