/** 
 * Info module.
 * @module info
 */
var dwv = dwv || {};
/**
 * Namespace for info functions.
 * @class info
 * @namespace dwv
 * @static
 */
dwv.info = dwv.info || {};

/**
 * WindowLevel info layer.
 * @class WindowLevel
 * @namespace dwv.info
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.info.Windowing = function ( app )
{
    /**
     * Create the windowing info div.
     * @method createWindowingDiv
     * @param {String} rootId The div root ID.
     */
    this.create = function ()
    {
        var rootId = app.getContainerDivId();
        var div = document.getElementById(rootId+"-infotr");
        dwv.html.removeNode(rootId+"-ulinfotr");
        // windowing list
        var ul = document.createElement("ul");
        ul.id = rootId+"-ulinfotr";
        // window center list item
        var liwc = document.createElement("li");
        liwc.id = rootId+"-liwcinfotr";
        ul.appendChild(liwc);
        // window width list item
        var liww = document.createElement("li");
        liww.id = rootId+"-liwwinfotr";
        ul.appendChild(liww);
        // add list to div
        div.appendChild(ul);
    };
    
    /**
     * Update the Top Right info div.
     * @method updateWindowingDiv
     * @param {Object} event The windowing change event containing the new values.
     * Warning: expects the windowing info div to exist (use after createWindowingDiv).
     */
    this.update = function (event)
    {
        var rootId = app.getContainerDivId();
        // window center list item
        var liwc = document.getElementById(rootId+"-liwcinfotr");
        dwv.html.cleanNode(liwc);
        liwc.appendChild(document.createTextNode("WindowCenter = "+event.wc));
        // window width list item
        var liww = document.getElementById(rootId+"-liwwinfotr");
        dwv.html.cleanNode(liww);
        liww.appendChild(document.createTextNode("WindowWidth = "+event.ww));
    };
    
}; // class dwv.info.Windowing

/**
 * Position info layer.
 * @class Position
 * @namespace dwv.info
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.info.Position = function ( app )
{
    /**
     * Create the position info div.
     * @method createPositionDiv
     * @param {String} rootId The div root ID.
     */
    this.create = function ()
    {
        var rootId = app.getContainerDivId();
        
        var div = document.getElementById(rootId+"-infotl");
        dwv.html.removeNode(rootId+"-ulinfotl");
        // position list
        var ul = document.createElement("ul");
        ul.id = rootId+"-ulinfotl";
        // position
        var lipos = document.createElement("li");
        lipos.id = rootId+"-liposinfotl";
        ul.appendChild(lipos);
        // value
        var livalue = document.createElement("li");
        livalue.id = rootId+"-livalueinfotl";
        ul.appendChild(livalue);
        // add list to div
        div.appendChild(ul);
    };
    
    /**
     * Update the position info div.
     * @method updatePositionDiv
     * @param {Object} event The position change event containing the new values.
     * Warning: expects the position info div to exist (use after createPositionDiv).
     */
    this.update = function (event)
    {
        var rootId = app.getContainerDivId();
        
        // position list item
        var lipos = document.getElementById(rootId+"-liposinfotl");
        dwv.html.cleanNode(lipos);
        lipos.appendChild(document.createTextNode("Pos = "+event.i+", "+event.j+", "+event.k));
        // value list item
        if( typeof(event.value) != "undefined" )
        {
            var livalue = document.getElementById(rootId+"-livalueinfotl");
            dwv.html.cleanNode(livalue);
            livalue.appendChild(document.createTextNode("Value = "+event.value));
        }
    };
}; // class dwv.info.Position

/**
 * MiniColorMap info layer.
 * @class MiniColorMap
 * @namespace dwv.info
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.info.MiniColorMap = function ( app )
{
    /**
     * Create the mini color map info div.
     * @method createMiniColorMap
     */
    this.create = function ()
    {    
        var rootId = app.getContainerDivId();
        
        // color map
        var div = document.getElementById(rootId+"-infobr");
        dwv.html.removeNode(rootId+"-canvasinfobr");
        var canvas = document.createElement("canvas");
        canvas.id = rootId+"-canvasinfobr";
        canvas.width = 98;
        canvas.height = 10;
        // add canvas to div
        div.appendChild(canvas);
    };
    
    /**
     * Update the mini color map info div.
     * @method updateMiniColorMap
     * @param {Object} event The windowing change event containing the new values.
     * Warning: expects the mini color map div to exist (use after createMiniColorMap).
     */
    this.update = function (event)
    {    
        var rootId = app.getContainerDivId();
        
        var windowCenter = event.wc;
        var windowWidth = event.ww;
        
        var canvas = document.getElementById(rootId+"-canvasinfobr");
        var context = canvas.getContext('2d');
        
        // fill in the image data
        var colourMap = app.getViewController().getColourMap();
        var imageData = context.getImageData(0,0,canvas.width, canvas.height);
        
        var c = 0;
        var minInt = app.getImage().getRescaledDataRange().min;
        var range = app.getImage().getRescaledDataRange().max - minInt;
        var incrC = range / canvas.width;
        var y = 0;
        
        var yMax = 255;
        var yMin = 0;
        var xMin = windowCenter - 0.5 - (windowWidth-1) / 2;
        var xMax = windowCenter - 0.5 + (windowWidth-1) / 2;    
        
        var index;
        for( var j=0; j<canvas.height; ++j ) {
            c = minInt;
            for( var i=0; i<canvas.width; ++i ) {
                if( c <= xMin ) {
                    y = yMin;
                }
                else if( c > xMax ) {
                    y = yMax;
                }
                else {
                    y = ( (c - (windowCenter-0.5) ) / (windowWidth-1) + 0.5 ) *
                        (yMax-yMin) + yMin;
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
    };
}; // class dwv.info.MiniColorMap


/**
 * Plot info layer.
 * @class Plot
 * @namespace dwv.info
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.info.Plot = function (app)
{
    /**
     * Create the plot info.
     * @method create
     * @param {String} rootId The div root ID.
     */
    this.create = function()
    {
        $.plot($("#"+app.getContainerDivId()+"-plot"), [ app.getImage().getHistogram() ], {
            "bars": { "show": true },
            "grid": { "backgroundColor": null },
            "xaxis": { "show": true },
            "yaxis": { "show": false }
        });
    };

    /**
     * Update plot.
     * @method update
     * @param {Object} event The windowing change event containing the new values.
     * Warning: expects the plot to exist (use after createPlot).
     */
    this.update = function (event)
    {
        var wc = event.wc;
        var ww = event.ww;
        
        var half = parseInt( (ww-1) / 2, 10 );
        var center = parseInt( (wc-0.5), 10 );
        var min = center - half;
        var max = center + half;
        
        var markings = [
            { "color": "#faa", "lineWidth": 1, "xaxis": { "from": min, "to": min } },
            { "color": "#aaf", "lineWidth": 1, "xaxis": { "from": max, "to": max } }
        ];
    
        $.plot($("#"+app.getContainerDivId()+"-plot"), [ app.getImage().getHistogram() ], {
            "bars": { "show": true },
            "grid": { "markings": markings, "backgroundColor": null },
            "xaxis": { "show": false },
            "yaxis": { "show": false }
        });
    };

}; // class dwv.info.Plot
