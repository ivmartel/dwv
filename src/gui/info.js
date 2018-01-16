// namespaces
var dwv = dwv || {};
dwv.gui = dwv.gui || {};
dwv.gui.base = dwv.gui.base || {};
dwv.gui.info = dwv.gui.info || {};

/**
 * Plot some data in a given div.
 * @param {Object} div The HTML element to add WindowLevel info to.
 * @param {Array} data The data array to plot.
 * @param {Object} options Plot options.
 */
dwv.gui.base.plot = function (/*div, data, options*/)
{
    // default does nothing...
};

/**
 * MiniColourMap info layer.
 * @constructor
 * @param {Object} div The HTML element to add colourMap info to.
 * @param {Object} app The associated application.
 */
dwv.gui.info.MiniColourMap = function ( div, app )
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
        // retrieve canvas and context
        var canvas = div.getElementsByClassName("colour-map-info")[0];
        var context = canvas.getContext('2d');
        // fill in the image data
        var colourMap = app.getViewController().getColourMap();
        var imageData = context.getImageData(0,0,canvas.width, canvas.height);
        // histogram sampling
        var c = 0;
        var minInt = app.getImage().getRescaledDataRange().min;
        var range = app.getImage().getRescaledDataRange().max - minInt;
        var incrC = range / canvas.width;
        // Y scale
        var y = 0;
        var yMax = 255;
        var yMin = 0;
        // X scale
        var xMin = windowCenter - 0.5 - (windowWidth-1) / 2;
        var xMax = windowCenter - 0.5 + (windowWidth-1) / 2;
        // loop through values
        var index;
        for ( var j = 0; j < canvas.height; ++j ) {
            c = minInt;
            for ( var i = 0; i < canvas.width; ++i ) {
                if ( c <= xMin ) {
                    y = yMin;
                }
                else if ( c > xMax ) {
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
}; // class dwv.gui.info.MiniColourMap


/**
 * Plot info layer.
 * @constructor
 * @param {Object} div The HTML element to add colourMap info to.
 * @param {Object} app The associated application.
 */
dwv.gui.info.Plot = function (div, app)
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
        // plot
        dwv.gui.plot(div, app.getImage().getHistogram());
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

        // plot
        dwv.gui.plot(div, app.getImage().getHistogram(), {markings: markings});
    };

}; // class dwv.gui.info.Plot

/**
 * DICOM Header overlay info layer.
 * @constructor
 * @param {Object} div The HTML element to add Header overlay info to.
 * @param {String} pos The string to specify the corner position. (tl,tc,tr,cl,cr,bl,bc,br)
 */
dwv.gui.info.Overlay = function ( div, pos, app )
{
    // closure to self
    var self = this;

    /**
     * Get the overlay array of the current position.
     * @return {Array} The overlay information.
     */
    this.getOverlays = function ()
    {
        var image = app.getImage();
        if (!image) {
            return;
        }
        var allOverlays = image.getOverlays();
        if (!allOverlays) {
            return;
        }
        var position = app.getViewController().getCurrentPosition();
        var sliceOverlays = allOverlays[position.k];
        if (!sliceOverlays) {
            return;
        }
        return sliceOverlays[pos];
    };

    /**
     * Create the overlay info div.
     */
    this.create = function ()
    {
        // remove all <ul> elements from div
        dwv.html.cleanNode(div);

        // get overlay string array of the current position
        var overlays = self.getOverlays();
        if (!overlays) {
            return;
        }

        if (pos === "bc" || pos === "tc" ||
            pos === "cr" || pos === "cl") {
            div.textContent = overlays[0].value;
        } else {
            // create <ul> element
            var ul = document.createElement("ul");

            for (var n=0; overlays[n]; n++){
                var li;
                if (overlays[n].value === "window-center") {
                    li = document.createElement("li");
                    li.className = "info-" + pos + "-window-center";
                    ul.appendChild(li);
                } else if (overlays[n].value === "window-width") {
                    li = document.createElement("li");
                    li.className = "info-" + pos + "-window-width";
                    ul.appendChild(li);
                } else if (overlays[n].value === "zoom") {
                    li = document.createElement("li");
                    li.className = "info-" + pos + "-zoom";
                    ul.appendChild(li);
                } else if (overlays[n].value === "offset") {
                    li = document.createElement("li");
                    li.className = "info-" + pos + "-offset";
                    ul.appendChild(li);
                } else if (overlays[n].value === "value") {
                    li = document.createElement("li");
                    li.className = "info-" + pos + "-value";
                    ul.appendChild(li);
                } else if (overlays[n].value === "position") {
                    li = document.createElement("li");
                    li.className = "info-" + pos + "-position";
                    ul.appendChild(li);
                } else if (overlays[n].value === "frame") {
                    li = document.createElement("li");
                    li.className = "info-" + pos + "-frame";
                    ul.appendChild(li);
                } else {
                    li = document.createElement("li");
                    li.className = "info-" + pos + "-" + n;
                    li.appendChild( document.createTextNode( overlays[n].value ) );
                    ul.appendChild(li);
                }
            }

            // append <ul> element before color map
            div.appendChild(ul);
        }
    };

    /**
     * Update the overlay info div.
     * @param {Object} event A change event.
     */
    this.update = function ( event )
    {
        // get overlay string array of the current position
        var overlays = self.getOverlays();
        if (!overlays) {
            return;
        }

        if (pos === "bc" || pos === "tc" ||
            pos === "cr" || pos === "cl") {
            div.textContent = overlays[0].value;
        } else {
            var li;
            var n;

            for (n=0; overlays[n]; n++) {
                if (overlays[n].value === "window-center") {
                    if (event.type === "wl-center-change") {
                        li = div.getElementsByClassName("info-" + pos + "-window-center")[0];
                        dwv.html.cleanNode(li);
                        var wcStr = dwv.utils.replaceFlags2( overlays[n].format, [Math.round(event.wc)] );
                        if (li) {
                            li.appendChild( document.createTextNode(wcStr) );
                        }
                    }
                } else if (overlays[n].value === "window-width") {
                    if (event.type === "wl-width-change") {
                        li = div.getElementsByClassName("info-" + pos + "-window-width")[0];
                        dwv.html.cleanNode(li);
                        var wwStr = dwv.utils.replaceFlags2( overlays[n].format, [Math.round(event.ww)] );
                        if (li) {
                            li.appendChild( document.createTextNode(wwStr) );
                        }
                    }
                } else if (overlays[n].value === "zoom") {
                    if (event.type === "zoom-change") {
                        li = div.getElementsByClassName("info-" + pos + "-zoom")[0];
                        dwv.html.cleanNode(li);
                        var zoom = Number(event.scale).toPrecision(3);
                        var zoomStr = dwv.utils.replaceFlags2( overlays[n].format, [zoom] );
                        if (li) {
                            li.appendChild( document.createTextNode( zoomStr ) );
                        }
                    }
                } else if (overlays[n].value === "offset") {
                    if (event.type === "zoom-change") {
                        li = div.getElementsByClassName("info-" + pos + "-offset")[0];
                        dwv.html.cleanNode(li);
                        var offset = [ Number(event.cx).toPrecision(3),
                            Number(event.cy).toPrecision(3)];
                        var offStr = dwv.utils.replaceFlags2( overlays[n].format, offset );
                        if (li) {
                            li.appendChild( document.createTextNode( offStr ) );
                        }
                    }
                } else if (overlays[n].value === "value") {
                    if (event.type === "position-change") {
                        li = div.getElementsByClassName("info-" + pos + "-value")[0];
                        dwv.html.cleanNode(li);
                        var valueStr = dwv.utils.replaceFlags2( overlays[n].format, [event.value] );
                        if (li) {
                            li.appendChild( document.createTextNode( valueStr ) );
                        }
                    }
                } else if (overlays[n].value === "position") {
                    if (event.type === "position-change") {
                        li = div.getElementsByClassName("info-" + pos + "-position")[0];
                        dwv.html.cleanNode(li);
                        var posStr = dwv.utils.replaceFlags2( overlays[n].format, [event.i, event.j, event.k] );
                        if (li) {
                            li.appendChild( document.createTextNode( posStr ) );
                        }
                    }
                } else if (overlays[n].value === "frame") {
                    if (event.type === "frame-change") {
                        li = div.getElementsByClassName("info-" + pos + "-frame")[0];
                        dwv.html.cleanNode(li);
                        var frameStr = dwv.utils.replaceFlags2( overlays[n].format, [event.frame] );
                        if (li) {
                            li.appendChild( document.createTextNode( frameStr ) );
                        }
                    }
                } else {
                    if (event.type === "position-change") {
                        li = div.getElementsByClassName("info-" + pos + "-" + n)[0];
                        dwv.html.cleanNode(li);
                        if (li) {
                            li.appendChild( document.createTextNode( overlays[n].value ) );
                        }
                    }
                }
            }
        }
    };
}; // class dwv.gui.info.Overlay

/**
 * Create overlay string array of the image in each corner
 * @param {Object} dicomElements DICOM elements of the image
 * @return {Array} Array of string to be shown in each corner
 */
dwv.gui.info.createOverlays = function (dicomElements)
{
    var overlays = {};
    var modality = dicomElements.getFromKey("x00080060");
    if (!modality){
        return overlays;
    }

    var omaps = dwv.gui.info.overlayMaps;
    if (!omaps){
        return overlays;
    }
    var omap = omaps[modality] || omaps['*'];

    for (var n=0; omap[n]; n++){
        var value = omap[n].value;
        var tags = omap[n].tags;
        var format = omap[n].format;
        var pos = omap[n].pos;

        if (typeof tags !== "undefined" && tags.length !== 0) {
            // get values
            var values = [];
            for ( var i = 0; i < tags.length; ++i ) {
                values.push( dicomElements.getElementValueAsStringFromKey( tags[i] ) );
            }
            // format
            if (typeof format === "undefined" || format === null) {
                format = dwv.utils.createDefaultReplaceFormat( values );
            }
            value = dwv.utils.replaceFlags2( format, values );
        }

        if (!value || value.length === 0){
            continue;
        }

        // add value to overlays
        if (!overlays[pos]) {
            overlays[pos] = [];
        }
        overlays[pos].push({'value': value.trim(), 'format': format});
    }

    // (0020,0020) Patient Orientation
    var valuePO = dicomElements.getFromKey("x00200020");
    if (typeof valuePO !== "undefined" && valuePO !== null && valuePO.length == 2){
        var po0 = dwv.dicom.cleanString(valuePO[0]);
        var po1 = dwv.dicom.cleanString(valuePO[1]);
        overlays.cr = [{'value': po0}];
        overlays.cl = [{'value': dwv.dicom.getReverseOrientation(po0)}];
        overlays.bc = [{'value': po1}];
        overlays.tc = [{'value': dwv.dicom.getReverseOrientation(po1)}];
    }

    return overlays;
};

/**
 * Create overlay string array of the image in each corner
 * @param {Object} dicomElements DICOM elements of the image
 * @return {Array} Array of string to be shown in each corner
 */
dwv.gui.info.createOverlaysForDom = function (info)
{
    var overlays = {};
    var omaps = dwv.gui.info.overlayMaps;
    if (!omaps){
        return overlays;
    }
    var omap = omaps.DOM;
    if (!omap){
        return overlays;
    }

    for (var n=0; omap[n]; n++){
        var value = omap[n].value;
        var tags = omap[n].tags;
        var format = omap[n].format;
        var pos = omap[n].pos;

        if (typeof tags !== "undefined" && tags.length !== 0) {
            // get values
            var values = [];
            for ( var i = 0; i < tags.length; ++i ) {
                for ( var j = 0; j < info.length; ++j ) {
                    if (tags[i] === info[j].name) {
                        values.push( info[j].value );
                    }
                }
            }
            // format
            if (typeof format === "undefined" || format === null) {
                format = dwv.utils.createDefaultReplaceFormat( values );
            }
            value = dwv.utils.replaceFlags2( format, values );
        }

        if (!value || value.length === 0){
            continue;
        }

        // add value to overlays
        if (!overlays[pos]) {
            overlays[pos] = [];
        }
        overlays[pos].push({'value': value.trim(), 'format': format});
    }

    return overlays;
};
