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
    /**
     * Create the overlay info div.
     */
    this.create = function ()
    {
        // remove all <ul> elements from div
        dwv.html.cleanNode(div);

        // get overlay string array of the current position
        var image = app.getImage();
        if (!image){
            return;
        }
        var posi = app.getViewController().getCurrentPosition();
        var overlays = image.getOverlays()[posi.k][pos];
        if (!overlays){
            return;
        }

        if (pos === "bc" || pos === "tc"){
            div.textContent = overlays[0];
        }
        else{
            // create <ul> element
            var ul = document.createElement("ul");

            for (var n=0; overlays[n]; n++){
                var li;

                if (overlays[n] === "window") {

                    li = document.createElement("li");
                    li.className = "window-center";
                    ul.appendChild(li);

                    li = document.createElement("li");
                    li.className = "window-width";
                    ul.appendChild(li);
                }
                else if (overlays[n] === "zoom") {
                    li = document.createElement("li");
                    li.className = "zoom";
                    ul.appendChild(li);
                } else {
                    li = document.createElement("li");
                    li.appendChild( document.createTextNode( overlays[n]) );
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
        var image = app.getImage();
        if (!image){
            return;
        }
        var posi = app.getViewController().getCurrentPosition();
        var overlays = image.getOverlays()[posi.k][pos];
        if (!overlays){
            return;
        }

        var li;
        var n;

        if (event.type === "wl-change") {
            for (n=0; overlays[n]; n++){
                if (overlays[n] === "window") {
                    var win = app.getViewController().getWindowLevel();
                    if (typeof win === "undefined") {
                        continue;
                    }

                    li = div.getElementsByClassName("window-center")[0];
                    dwv.html.cleanNode(li);
                    li.appendChild( document.createTextNode("WC=" + win.center) );

                    li = div.getElementsByClassName("window-width")[0];
                    dwv.html.cleanNode(li);
                    li.appendChild( document.createTextNode("WW=" + win.width) );
                }
            }
        }

        if (event.type === "zoom-change") {
            for (n=0; overlays[n]; n++){
                if (overlays[n] === "zoom") {
                    li = div.getElementsByClassName("zoom")[0];
                    dwv.html.cleanNode(li);
                    var zoom = app.getImageLayer().getZoom();
                    li.appendChild( document.createTextNode( ("x" + zoom.x).substr(0,5) ) );
                }
            }
        }

    };
}; // class dwv.gui.info.Overlay

/**
 * Search DICOM dictionary entry
 * @param {String} tag DICOM tag in xGGGGEEEE format.
 * @return {Array} DICOM Dictionary entry
 */
function searchDictionary( tag )
{
    if (!tag){
        return null;
    }

    var group = "0" + tag.substr(0,5);
    var elem  = "0x" + tag.substr(5,4);

    var darray = dwv.dicom.dictionary[group];
    if (!darray){
        return null;
    }

    return darray[elem];
}

/**
 * Format DICOM date value to YYYY/MM/DD
 * @param {String} value DICOM DA-type value
 * @return {String} Formatted date value
 * TODO: to be internationalized
 */
function formatDate( value )
{
    if (!value || value.length < 8) {
        return "";
    }

    return value.substr(0,4) + "/" + value.substr(4,2) + "/" + value.substr(6,2);
}

/**
 * Format DICOM time value to hh:mm:ss
 * @param {String} value DICOM TM-type value
 * @return {String} Formatted time value
 * TODO: to be internationalized
 */
function formatTime( value )
{
    if (!value || value.length < 6){
        return "";
    }

    return value.substr(0,2) + ":" + value.substr(2,2) + ":" + value.substr(4,2);
}

/**
 * Patient orientation in the reverse direction
 */
var rlabels = {
    "L": "R",
    "R": "L",
    "A": "P",
    "P": "A",
    "H": "F",
    "F": "H"
};

/**
 * Get patient orientation label in the reverse direction
 * @param {String} ori Patient Orientation value
 * @return {String} Reverse Orientation Label
 */
function getReverseOrientation( ori )
{
    if (!ori){
        return "";
    }

    var rori = "";
    for (var n=0; n<ori.length; n++){
        var o = ori.substr(n,1);
        var r = rlabels[o];
        if (r){
            rori += r;
        }
    }

    return rori;
}

dwv.gui.info.overlayMaps = {};

/**
 * Create overlay string array of the image in each corner
 * @param {Object} dicomElements DICOM elements of the image
 * @param {Object} image The image
 * @return {Array} Array of string to be shown in each corner
 */
dwv.gui.info.createOverlays = function (dicomElements)
{
    var overlays = {};
    var moda = dicomElements.getFromKey("x00080060");
    if (!moda){
        return overlays;
    }

    var maps = dwv.gui.info.overlayMaps[moda] || dwv.gui.info.overlayMaps['*'];
    if (!maps){
        return overlays;
    }

    for (var n=0; maps[n]; n++){
        var value = maps[n].value;
        var tag = maps[n].tag;
        var pos = maps[n].pos;
        var app = maps[n].append;
        var pre = maps[n].prefix;
        var suf = maps[n].suffix;

        if (!value){
            value = dicomElements.getFromKey(tag);
            if (Array.isArray(value)){
                value = value[0];
            }
        }

        if (!value || value.length === 0){
            continue;
        }

        var dict = searchDictionary(tag);
        if (dict){
            if (dict[0] === "DA"){
                value = formatDate(value);
            }
            else if (dict[0] === "TM"){
                value = formatTime(value);
            }
        }

        if (suf){
            value += suf;
        }
        if (pre){
            value = pre + value;
        }

        if (!overlays[pos]){
            overlays[pos] = [];
        }

        if (app === "true"){
            overlays[pos][overlays[pos].length-1] += value.trim();
        }
        else{
            overlays[pos].push(value.trim());
        }
    }

    // (0020,0020) Patient Orientation
    var    valuePO = dicomElements.getFromKey("x00200020");
    if (valuePO !== null){
        overlays.cr = [valuePO[0].trim()];
        overlays.cl = [getReverseOrientation(valuePO[0].trim())];
        overlays.bc = [valuePO[1].trim()];
        overlays.tc = [getReverseOrientation(valuePO[1].trim())];
    }

    return overlays;
};
