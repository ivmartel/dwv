/**
* windowLevel.js
* WindowLevel tool.
* WARNING: draws on the context var using external methods.
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
        
        imageLoaded = 0; 
                                                                           
        var diffX = ev._x - tool.x0;
        var diffY = tool.y0 - ev._y;                                
        wc = parseInt(wc) + diffY;
        ww = parseInt(ww) + diffX;                        
        
        showWindowingValue(wc,ww);    
        lookupObj.setWindowingdata(wc,ww);                                
        genImage();
        
        tool.x0 = ev._x;             
        tool.y0 = ev._y;
        
        imageLoaded = 1;                                        
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (tool.started)
        {
            tool.mousemove(ev);
            tool.started = false;
            img_update();
        }
    };
} // tools_windowLevel

