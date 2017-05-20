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
 * WindowLevel info layer.
 * @constructor
 * @param {Object} div The HTML element to add WindowLevel info to.
 */
dwv.gui.info.Windowing = function ( div )
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
            dwv.i18n("tool.info.window_center", {value: Math.round(event.wc)}) ) );
        // window width list item
        var liww = div.getElementsByClassName("window-width")[0];
        dwv.html.cleanNode(liww);
        liww.appendChild( document.createTextNode(
            dwv.i18n("tool.info.window_width", {value: Math.round(event.ww)}) ) );
    };

}; // class dwv.gui.info.Windowing

/**
 * Position info layer.
 * @constructor
 * @param {Object} div The HTML element to add Position info to.
 */
dwv.gui.info.Position = function ( div )
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
        // frame
        var liframe = document.createElement("li");
        liframe.className = "frame";
        ul.appendChild(liframe);
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
        if( typeof(event.i) !== "undefined" )
        {
            var lipos = div.getElementsByClassName("position")[0];
            dwv.html.cleanNode(lipos);
            lipos.appendChild(document.createTextNode(
            dwv.i18n("tool.info.position", {value: event.i+", "+event.j+", "+event.k}) ) );
        }
        // frame list item
        if( typeof(event.frame) !== "undefined" )
        {
            var liframe = div.getElementsByClassName("frame")[0];
            dwv.html.cleanNode(liframe);
            liframe.appendChild( document.createTextNode(
                dwv.i18n("tool.info.frame", {value: event.frame}) ) );
        }
        // value list item
        if( typeof(event.value) !== "undefined" )
        {
            var livalue = div.getElementsByClassName("value")[0];
            dwv.html.cleanNode(livalue);
            livalue.appendChild( document.createTextNode(
                dwv.i18n("tool.info.value", {value: event.value}) ) );
        }
    };
}; // class dwv.gui.info.Position

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
 * DICOM Header info layer.
 * @constructor
 * @param {Object} div The HTML element to add Header info to.
 * @param {String} pos The string to specify the corner position. (tl,tc,tr,cl,cr,bl,bc,br)
 */
dwv.gui.info.Header = function ( div, pos, app )
{
    /**
     * Create the header info div.
     */
    this.create = function ()
    {
    };

    /**
     * Update the header info div.
     * @param {Object} event some change event
     */
    this.update = function (event)
    {
		// remove all <ul> elements from div
		var ulname = "header" + pos + "-ul";
		var elems = div.getElementsByClassName(ulname);
		if (elems == null)
			return;

		if ( elems.length !== 0 ) {
			while(elems.length > 0 ) {
				dwv.html.removeNode(elems[0]);
			}
		}

		var image = app.getImage();
		if (image == null)
			return;

		// get headers string array of the current position
		var posi = app.getViewController().getCurrentPosition();
		var headers = image.headers[posi.k][pos];
		if (headers == null)
			return;

		if (pos == "bc" || pos == "tc"){
			div.textContent = headers[0];
		}
		else{
			// create <ul> element
			var ul = document.createElement("ul");
			ul.className = ulname;

			for (var n=0; headers[n]; n++){
				var li;

				switch(headers[n]){
					// window level and width
				case "window":
					var win = app.getViewController().getWindowLevel();
					li = document.createElement("li");
					li.className = "header" + pos + "-li";
					li.appendChild( document.createTextNode("WC=" + win.center) );
					ul.appendChild(li);
					
					li = document.createElement("li");
					li.className = pos + "-li";
					li.appendChild( document.createTextNode("WW=" + win.width) );
					ul.appendChild(li);
					break;
					// scale
				case "zoom":
					li = document.createElement("li");
					li.className = pos + "-li";
					var zoom = app.getImageLayer().getZoom();
					li.appendChild( document.createTextNode( ("x" + zoom.x).substr(0,5) ) );
					ul.appendChild(li);
					break;
				default:
					li = document.createElement("li");
					li.className = "header" + pos + "-li";
					li.appendChild( document.createTextNode( headers[n]) );
					ul.appendChild(li);
					break;
				}
			}

			// append <ul> element before color map
			var cmap = div.getElementsByClassName("colour-map-info");
			var plot = div.getElementsByClassName("plot");
			if (cmap)
				div.insertBefore(ul, cmap[0]);
			else if (plot)
				div.insertBefore(ul, plot[0]);
			else
				div.appendChild(ul);
		}
	}
}; // class dwv.gui.info.Header

/**
 * Search DICOM dictionary entry
 * @param {String} tag DICOM tag in xGGGGEEEE format.
 * @return {Array} DICOM Dictionary entry
 */
function searchDictionary( tag )
{
	if (tag == null)
		return null;

	var group = "0" + tag.substr(0,5);
	var elem  = "0x" + tag.substr(5,4);

	var darray = dwv.dicom.dictionary[group];
	if (darray == null)
		return null;

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
	if (value == null || value.length < 8)
		return "";

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
	if (value == null || value.length < 6)
		return "";

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
	if (ori == null)
		return "";

	var rori = "";
	for (var n=0; n<ori.length; n++){
		var o = ori.substr(n,1);
		var r = rlabels[o];
		if (r)
			rori += r;
	}

	return rori;
}

dwv.gui.info.headerMaps = {};

/**
 * Create header string array of the image in each corner
 * @param {Object} dicomElements DICOM elements of the image
 * @param {Object} image The image
 * @aram  {String Array} Array of string to be shown in each corner
 */
dwv.gui.info.createHeaders = function (dicomElements, image)
{
	var headers = {};
	var moda = dicomElements.getFromKey("x00080060");
	if (moda == null){
		return headers;
	}

	var maps = dwv.gui.info.headerMaps[moda];
	if (maps == null){
		maps = dwv.gui.info.headerMaps["*"];
	}
	if (maps == null)
		return headers;

	for (var n=0; maps[n]; n++){
		var value = maps[n].value;
		var tag = maps[n].tag;
		var pos = maps[n].pos;
		var app = maps[n].append;
		var pre = maps[n].prefix;
		var suf = maps[n].suffix;

		if (value == null){
			value = dicomElements.getFromKey(tag);
			if (Array.isArray(value))
				value = value[0];
		}
		if (value == null || value.length == 0){
			continue;
		}

		var dict = searchDictionary(tag);
		if (dict){
			if (dict[0] == "DA"){
				value = formatDate(value);
			}
			else if (dict[0] == "TM"){
				value = formatTime(value);
			}
		}

		if (suf != null){
			value += suf;
		}
		if (pre != null){
			value = pre + value;
		}

		if (headers[pos] == null){
			headers[pos] = [];
		}

		if (app == "true"){
			headers[pos][headers[pos].length-1] += value.trim();
		}
		else{
			headers[pos].push(value.trim());
		}
	}

	// (0020,0020) Patient Orientation
	var	value = dicomElements.getFromKey("x00200020");
	if (value){
		headers["cr"] = [value[0].trim()];
		headers["cl"] = [getReverseOrientation(value[0].trim())];
		headers["bc"] = [value[1].trim()];
		headers["tc"] = [getReverseOrientation(value[1].trim())];
	}

	return headers;
}
