// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.info = dwv.info || {};

/**
 * WindowLevel info layer.
 * @constructor
 * @param {Object} div The HTML element to add WindowLevel info to.
 */
dwv.info.Windowing = function ( div )
{
    /**
     * Create the windowing info div.
     */
    this.create = function ()
    {
        // clean div
        var elems = div.getElementsByClassName("wl-info");
        if ( elems.length !== 0 ) {
            dwv.html.removeNodes(elems);
        }
        // create windowing list
        var ul = document.createElement("ul");
        ul.className = "wl-info";
        // window center list item
        var liwc = document.createElement("li");
        liwc.className = "window-center";
        ul.appendChild(liwc);
        // window width list item
        var liww = document.createElement("li");
        liww.className = "window-width";
        ul.appendChild(liww);
        // add list to div
        div.appendChild(ul);
    };

    /**
     * Update the windowing info div.
     * @param {Object} event The windowing change event containing the new values as {wc,ww}.
     * Warning: expects the windowing info div to exist (use after create).
     */
    this.update = function (event)
    {
        // window center list item
        var liwc = div.getElementsByClassName("window-center")[0];
        dwv.html.cleanNode(liwc);
        liwc.appendChild( document.createTextNode(
            dwv.i18n("tool.info.window_center", {value: event.wc}) ) );
        // window width list item
        var liww = div.getElementsByClassName("window-width")[0];
        dwv.html.cleanNode(liww);
        liww.appendChild( document.createTextNode(
            dwv.i18n("tool.info.window_width", {value: event.ww}) ) );
    };

}; // class dwv.info.Windowing

/**
 * Position info layer.
 * @constructor
 * @param {Object} div The HTML element to add Position info to.
 */
dwv.info.Position = function ( div )
{
    /**
     * Create the position info div.
     */
    this.create = function ()
    {
        // clean div
        var elems = div.getElementsByClassName("pos-info");
        if ( elems.length !== 0 ) {
            dwv.html.removeNodes(elems);
        }
        // position list
        var ul = document.createElement("ul");
        ul.className = "pos-info";
        // position
        var lipos = document.createElement("li");
        lipos.className = "position";
        ul.appendChild(lipos);
        // value
        var livalue = document.createElement("li");
        livalue.className = "value";
        ul.appendChild(livalue);
        // add list to div
        div.appendChild(ul);
    };

    /**
     * Update the position info div.
     * @param {Object} event The position change event containing the new values as {i,j,k}
     *  and optional 'value'.
     * Warning: expects the position info div to exist (use after create).
     */
    this.update = function (event)
    {
        // position list item
        var lipos = div.getElementsByClassName("position")[0];
        dwv.html.cleanNode(lipos);
        lipos.appendChild( document.createTextNode(
            dwv.i18n("tool.info.position", {value: event.i+", "+event.j+", "+event.k}) ) );
        // value list item
        if( typeof(event.value) != "undefined" )
        {
            var livalue = div.getElementsByClassName("value")[0];
            dwv.html.cleanNode(livalue);
            livalue.appendChild( document.createTextNode(
                dwv.i18n("tool.info.value", {value: event.value}) ) );
        }
    };
}; // class dwv.info.Position

/**
 * MiniColourMap info layer.
 * @constructor
 * @param {Object} div The HTML element to add colourMap info to.
 * @param {Object} app The associated application.
 */
dwv.info.MiniColourMap = function ( div, app )
{
    /**
     * Create the mini colour map info div.
     */
    this.create = function ()
    {
        // clean div
        var elems = div.getElementsByClassName("colour-map-info");
        if ( elems.length !== 0 ) {
            dwv.html.removeNodes(elems);
        }
        // colour map
        var canvas = document.createElement("canvas");
        canvas.className = "colour-map-info";
        canvas.width = 98;
        canvas.height = 10;
        // add canvas to div
        div.appendChild(canvas);
    };

    /**
     * Update the mini colour map info div.
     * @param {Object} event The windowing change event containing the new values.
     * Warning: expects the mini colour map div to exist (use after createMiniColourMap).
     */
    this.update = function (event)
    {
        var windowCenter = event.wc;
        var windowWidth = event.ww;

        var canvas = div.getElementsByClassName("colour-map-info")[0];
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
}; // class dwv.info.MiniColourMap


/**
 * Plot info layer.
 * @constructor
 * @param {Object} div The HTML element to add colourMap info to.
 * @param {Object} app The associated application.
 */
dwv.info.Plot = function (div, app)
{
    /**
     * Create the plot info.
     */
    this.create = function()
    {
        // clean div
        if ( div ) {
            dwv.html.cleanNode(div);
        }
        // create
        $.plot(div, [ app.getImage().getHistogram() ], {
            "bars": { "show": true },
            "grid": { "backgroundcolor": null },
            "xaxis": { "show": true },
            "yaxis": { "show": false }
        });
    };

    /**
     * Update plot.
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

        $.plot(div, [ app.getImage().getHistogram() ], {
            "bars": { "show": true },
            "grid": { "markings": markings, "backgroundcolour": null },
            "xaxis": { "show": false },
            "yaxis": { "show": false }
        });
    };

}; // class dwv.info.Plot
