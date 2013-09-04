/**
 * @namespace Info classes.
 */
dwv.info = dwv.info || {};

/**
 * @function Create the windowing info div.
 */
dwv.info.createWindowingDiv = function()
{
    var div = document.getElementById("infotr");
    dwv.html.removeNode("ulinfotr");
    // windowing list
    var ul = document.createElement("ul");
    ul.id = "ulinfotr";
    // window center list item
    var liwc = document.createElement("li");
    liwc.id = "liwcinfotr";
    ul.appendChild(liwc);
    // window width list item
    var liww = document.createElement("li");
    liww.id = "liwwinfotr";
    ul.appendChild(liww);
    // add list to div
    div.appendChild(ul);
};

/**
 * @function Update the Top Right info div.
 * @param event The windowing change event containing the new values.
 * Warning: expects the windowing info div to exist (use after createWindowingDiv).
 */
dwv.info.updateWindowingDiv = function(event)
{
    // window center list item
    var liwc = document.getElementById("liwcinfotr");
    dwv.html.cleanNode(liwc);
    liwc.appendChild(document.createTextNode("WindowCenter = "+event.wc));
    // window width list item
    var liww = document.getElementById("liwwinfotr");
    dwv.html.cleanNode(liww);
    liww.appendChild(document.createTextNode("WindowWidth = "+event.ww));
};

/**
 * @function Create the position info div.
 */
dwv.info.createPositionDiv = function()
{
    var div = document.getElementById("infotl");
    dwv.html.removeNode("ulinfotl");
    // position list
    var ul = document.createElement("ul");
    ul.id = "ulinfotl";
    // position
    var lipos = document.createElement("li");
    lipos.id = "liposinfotl";
    ul.appendChild(lipos);
    // value
    var livalue = document.createElement("li");
    livalue.id = "livalueinfotl";
    ul.appendChild(livalue);
    // add list to div
    div.appendChild(ul);
};

/**
 * @function Update the position info div.
 * @param event The position change event containing the new values.
 * Warning: expects the position info div to exist (use after createPositionDiv).
 */
dwv.info.updatePositionDiv = function(event)
{
    // window center list item
    var lipos = document.getElementById("liposinfotl");
    dwv.html.cleanNode(lipos);
    lipos.appendChild(document.createTextNode("Pos = "+event.i+", "+event.j+", "+event.k));
    // window width list item
    var livalue = document.getElementById("livalueinfotl");
    dwv.html.cleanNode(livalue);
    livalue.appendChild(document.createTextNode("Value = "+event.value));
};

/**
 * @function Create the mini color map info div.
 */
dwv.info.createMiniColorMap = function()
{    
    // color map
    var div = document.getElementById("infobr");
    dwv.html.removeNode("canvasinfobr");
    var canvas = document.createElement("canvas");
    canvas.id = "canvasinfobr";
    canvas.width = 98;
    canvas.height = 10;
    // add canvas to div
    div.appendChild(canvas);
};

/**
 * @function Update the mini color map info div.
 * @param event The windowing change event containing the new values.
 * Warning: expects the mini color map div to exist (use after createMiniColorMap).
 */
dwv.info.updateMiniColorMap = function(event)
{    
    var windowCenter = event.wc;
    var windowWidth = event.ww;
    
    var canvas = document.getElementById("canvasinfobr");
    context = canvas.getContext('2d');
    
    // fill in the image data
    var colourMap = app.getView().getColorMap();
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
    
    for( var j=0; j<canvas.height; ++j ) {
        c = minInt;
        for( var i=0; i<canvas.width; ++i ) {
            if( c <= xMin ) y = yMin;
            else if( c > xMax ) y = yMax;
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

/**
 * @function Create the plot info.
 */
dwv.info.createPlot = function()
{
    $.plot($("#plot"), [ app.getImage().getHistogram() ], {
        "bars": { "show": true },
        "grid": { "backgroundColor": null },
        "xaxis": { "show": true },
        "yaxis": { "show": false }
    });
};

/**
 * @function Update the plot markings.
 * @param event The windowing change event containing the new values.
 * Warning: expects the plot to exist (use after createPlot).
 */
dwv.info.updatePlotMarkings = function(event)
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

    $.plot($("#plot"), [ app.getImage().getHistogram() ], {
        "bars": { "show": true },
        "grid": { "markings": markings, "backgroundColor": null },
        "xaxis": { "show": false },
        "yaxis": { "show": false }
    });
};
