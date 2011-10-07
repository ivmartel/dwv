/**
* windowLevel.js
* WindowLevel tool.
* WARNING: depends on the folowing external vars:
* - gDrawContext
* - gImage
* - gStyle
* - gImageLoaded
* - gLookupObj
* - gImgUpdate()
*/
function tools_windowLevel()
{
    var tool = this;
    this.started = false;

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

        //showHUvalue(ev._x, ev._y);
        
        gImageLoaded = 0; 
                                                                           
        var diffX = ev._x - tool.x0;
        var diffY = tool.y0 - ev._y;                                
        var windowCenter = parseInt(gLookupObj.windowCenter) + diffY;
        var windowWidth = parseInt(gLookupObj.windowWidth) + diffX;                        
        
        updateWindowingData(windowCenter,windowWidth);    
        
        tool.x0 = ev._x;             
        tool.y0 = ev._y;
        
        gImageLoaded = 1;                                        
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (tool.started)
        {
            tool.mousemove(ev);
            tool.started = false;
            gContextUpdate();
        }
    };
    
    this.enable = function(value){
        var str = "none";
        if( value ) str = "";
        document.getElementById("presetSelector").style.display=str;
    };
    
} // tools_windowLevel

function showHUvalue(x,y)
{
    var t = (y*gImage.getSize()[0])+x;        
    
    // style
    gDrawContext.clearRect(0, 0, 150, 150);
    gDrawContext.fillStyle = gStyle.getTextColor();
    gDrawContext.font = gStyle.getFontStr();
    gDrawContext.textBaseline = "top";
    gDrawContext.textAlign = "left";
    
    // text
    gDrawContext.fillText("X = "+x, 0, 0);
    gDrawContext.fillText("Y = "+y, 0, gStyle.getLineHeight());
    gDrawContext.fillText("HU = "+gLookupObj.huLookup[gPixelBuffer[t]], 0, 2*gStyle.getLineHeight());
}

function showWindowingValue(windowCenter,windowWidth)
{
    // style
    gDrawContext.clearRect(gDrawCanvas.width-150, 0, gDrawCanvas.width, 150);
    gDrawContext.fillStyle = gStyle.getTextColor();
    gDrawContext.font = gStyle.getFontStr();
    gDrawContext.textBaseline = "top";
    gDrawContext.textAlign = "right";
    
    // text
    gDrawContext.fillText("WindowCenter = "+windowCenter, gDrawCanvas.width, 0);
    gDrawContext.fillText("WindowWidth = "+windowWidth, gDrawCanvas.width, gStyle.getLineHeight());
}

function gGetPresetSelector()
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

    document.getElementById('presetSelector').style.display="none";
    document.getElementById('presetSelector').appendChild(paragraph);
}

function updateWindowingData(wc,ww)
{
    gLookupObj.setWindowingdata(wc,ww);
    this.showWindowingValue(wc,ww);
    gGenImage();
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
            wc=gLookupObj.defaultWindowCenter;
            ww=gLookupObj.defaultWindowWidth;
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

