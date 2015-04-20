/** 
 * HTML module.
 * @module html
 */
var dwv = dwv || {};
/**
 * Namespace for HTML related functions.
 * @class html
 * @namespace dwv
 * @static
 */
dwv.html = dwv.html || {};

/**
 * Append a cell to a given row.
 * @method appendCell
 * @static
 * @param {Object} row The row to append the cell to.
 * @param {Object} content The content of the cell.
 */
dwv.html.appendCell = function (row, content)
{
    var cell = row.insertCell(-1);
    var str = content;
    // special care for arrays
    if ( content instanceof Array || 
            content instanceof Uint8Array ||
            content instanceof Uint16Array ||
            content instanceof Uint32Array ) {
        if ( content.length > 10 ) {
            content = Array.prototype.slice.call( content, 0, 10 );
            content[10] = "...";
        }
        str = Array.prototype.join.call( content, ', ' );
    }
    // append
    cell.appendChild(document.createTextNode(str));
};

/**
 * Append a header cell to a given row.
 * @method appendHCell
 * @static
 * @param {Object} row The row to append the header cell to.
 * @param {String} text The text of the header cell.
 */
dwv.html.appendHCell = function (row, text)
{
    var cell = document.createElement("th");
    // TODO jquery-mobile specific...
    if ( text !== "Value" && text !== "Name" ) {
        cell.setAttribute("data-priority", "1");
    }
    cell.appendChild(document.createTextNode(text));
    row.appendChild(cell);
};

/**
 * Append a row to an array.
 * @method appendRowForArray
 * @static
 * @param {} table
 * @param {} input
 * @param {} level
 * @param {} maxLevel
 * @param {} rowHeader
 */
dwv.html.appendRowForArray = function (table, input, level, maxLevel, rowHeader)
{
    var row = null;
    // loop through
    for ( var i=0; i<input.length; ++i ) {
        var value = input[i];
        // last level
        if ( typeof value === 'number' ||
                typeof value === 'string' ||
                value === null ||
                value === undefined ||
                level >= maxLevel ) {
            if ( !row ) {
                row = table.insertRow(-1);
            }
            dwv.html.appendCell(row, value);
        }
        // more to come
        else {
            dwv.html.appendRow(table, value, level+i, maxLevel, rowHeader);
        }
    }
};

/**
 * Append a row to an object.
 * @method appendRowForObject
 * @static
 * @param {} table
 * @param {} input
 * @param {} level
 * @param {} maxLevel
 * @param {} rowHeader
 */
dwv.html.appendRowForObject = function (table, input, level, maxLevel, rowHeader)
{
    var keys = Object.keys(input);
    var row = null;
    for ( var o=0; o<keys.length; ++o ) {
        var value = input[keys[o]];
        // last level
        if ( typeof value === 'number' ||
                typeof value === 'string' ||
                value === null ||
                value === undefined ||
                level >= maxLevel ) {
            if ( !row ) {
                row = table.insertRow(-1);
            }
            if ( o === 0 && rowHeader) {
                dwv.html.appendCell(row, rowHeader);
            }
            dwv.html.appendCell(row, value);
        }
        // more to come
        else {
            dwv.html.appendRow(table, value, level+o, maxLevel, keys[o]);
        }
    }
    // header row
    // warn: need to create the header after the rest
    // otherwise the data will inserted in the thead...
    if ( level === 2 ) {
        var header = table.createTHead();
        var th = header.insertRow(-1);
        if ( rowHeader ) {
            dwv.html.appendHCell(th, "Name");
        }
        for ( var k=0; k<keys.length; ++k ) {
            dwv.html.appendHCell(th, dwv.utils.capitaliseFirstLetter(keys[k]));
        }
    }
};

/**
 * Append a row to an object or an array.
 * @method appendRow
 * @static
 * @param {} table
 * @param {} input
 * @param {} level
 * @param {} maxLevel
 * @param {} rowHeader
 */
dwv.html.appendRow = function (table, input, level, maxLevel, rowHeader)
{
    // array
    if ( input instanceof Array ) {
        dwv.html.appendRowForArray(table, input, level+1, maxLevel, rowHeader);
    }
    // object
    else if ( typeof input === 'object') {
        dwv.html.appendRowForObject(table, input, level+1, maxLevel, rowHeader);
    }
    else {
        throw new Error("Unsupported input data type.");
    }
};

/**
 * Converts the input to an HTML table.
 * @method toTable
 * @static
 * @input {Mixed} input Allowed types are: array, array of object, object.
 * @return {Object} The created HTML table.
 * @warning Null is interpreted differently in browsers, firefox will not display it.
 */
dwv.html.toTable = function (input)
{
    var table = document.createElement('table');
    dwv.html.appendRow(table, input, 0, 2);
    return table;
};

/**
 * Get an HTML search form.
 * @method getHtmlSearchForm
 * @static
 * @param {Object} htmlTableToSearch The table to do the search on.
 * @return {Object} The HTML search form.
 */
dwv.html.getHtmlSearchForm = function (htmlTableToSearch)
{
    var form = document.createElement("form");
    form.setAttribute("class", "filter");
    var input = document.createElement("input");
    input.onkeyup = function () {
        dwv.html.filterTable(input, htmlTableToSearch);
    };
    form.appendChild(input);
    
    return form;
};

/**
 * Filter a table with a given parameter: sets the display css of rows to
 * true or false if it contains the term.
 * @method filterTable
 * @static
 * @param {String} term The term to filter the table with.
 * @param {Object} table The table to filter.
 */
dwv.html.filterTable = function (term, table) {
    // de-highlight
    dwv.html.dehighlight(table);
    // split search terms
    var terms = term.value.toLowerCase().split(" ");

    // search
    var text = 0;
    var display = 0;
    for (var r = 1; r < table.rows.length; ++r) {
        display = '';
        for (var i = 0; i < terms.length; ++i) {
            text = table.rows[r].innerHTML.replace(/<[^>]+>/g, "").toLowerCase();
            if (text.indexOf(terms[i]) < 0) {
                display = 'none';
            } else {
                if (terms[i].length) {
                    dwv.html.highlight(terms[i], table.rows[r]);
                }
            }
            table.rows[r].style.display = display;
        }
    }
};

/**
 * Transform back each
 * 'preText <span class="highlighted">term</span> postText'
 * into its original 'preText term postText'.
 * @method dehighlight
 * @static
 * @param {Object} container The container to de-highlight.
 */
dwv.html.dehighlight = function (container) {
    for (var i = 0; i < container.childNodes.length; i++) {
        var node = container.childNodes[i];

        if (node.attributes &&
                node.attributes['class'] &&
                node.attributes['class'].value === 'highlighted') {
            node.parentNode.parentNode.replaceChild(
                    document.createTextNode(
                        node.parentNode.innerHTML.replace(/<[^>]+>/g, "")),
                    node.parentNode);
            // Stop here and process next parent
            return;
        } else if (node.nodeType !== 3) {
            // Keep going onto other elements
            dwv.html.dehighlight(node);
        }
    }
};

/**
 * Create a
 * 'preText <span class="highlighted">term</span> postText'
 * around each search term.
 * @method highlight
 * @static
 * @param {String} term The term to highlight.
 * @param {Object} container The container where to highlight the term.
 */
dwv.html.highlight = function (term, container) {
    for (var i = 0; i < container.childNodes.length; i++) {
        var node = container.childNodes[i];

        if (node.nodeType === 3) {
            // Text node
            var data = node.data;
            var data_low = data.toLowerCase();
            if (data_low.indexOf(term) >= 0) {
                //term found!
                var new_node = document.createElement('span');
                node.parentNode.replaceChild(new_node, node);

                var result;
                while ((result = data_low.indexOf(term)) !== -1) {
                    // before term
                    new_node.appendChild(document.createTextNode(
                                data.substr(0, result)));
                    // term
                    new_node.appendChild(dwv.html.createHighlightNode(
                                document.createTextNode(data.substr(
                                        result, term.length))));
                    // reduce search string
                    data = data.substr(result + term.length);
                    data_low = data_low.substr(result + term.length);
                }
                new_node.appendChild(document.createTextNode(data));
            }
        } else {
            // Keep going onto other elements
            dwv.html.highlight(term, node);
        }
    }
};

/**
 * Highlight a HTML node.
 * @method createHighlightNode
 * @static
 * @param {Object} child The child to highlight.
 * @return {Object} The created HTML node.
 */
dwv.html.createHighlightNode = function (child) {
    var node = document.createElement('span');
    node.setAttribute('class', 'highlighted');
    node.attributes['class'].value = 'highlighted';
    node.appendChild(child);
    return node;
};

/**
 * Remove all children of a HTML node.
 * @method cleanNode
 * @static
 * @param {Object} node The node to remove kids.
 */
dwv.html.cleanNode = function (node) {
    // remove its children
    while (node.hasChildNodes()) {
        node.removeChild(node.firstChild);
    }
};

/**
 * Remove a HTML node and all its children.
 * @method removeNode
 * @static
 * @param {String} nodeId The string id of the node to delete.
 */
dwv.html.removeNode = function (nodeId) {
    // find the node
    var node = document.getElementById(nodeId);
    // check node
    if ( !node ) {
        return;
    }
    // remove its children
    dwv.html.cleanNode(node);
    // remove it from its parent
    var top = node.parentNode;
    top.removeChild(node);
};

/**
 * Create a HTML select from an input array of options.
 * The values of the options are the name of the option made lower case.
 * It is left to the user to set the 'onchange' method of the select.
 * @method createHtmlSelect
 * @static
 * @param {String} name The name of the HTML select.
 * @param {Mixed} list The list of options of the HTML select.
 * @return {Object} The created HTML select.
 */
dwv.html.createHtmlSelect = function (name, list) {
    // select
    var select = document.createElement("select");
    select.id = name;
    select.name = name;
    // options
    var option;
    if ( list instanceof Array )
    {
        for ( var i in list )
        {
            option = document.createElement("option");
            option.value = list[i];
            option.appendChild(document.createTextNode(dwv.utils.capitaliseFirstLetter(list[i])));
            select.appendChild(option);
        }
    }
    else if ( typeof list === 'object')
    {
        for ( var item in list )
        {
            option = document.createElement("option");
            option.value = item;
            option.appendChild(document.createTextNode(dwv.utils.capitaliseFirstLetter(item)));
            select.appendChild(option);
        }
    }
    else
    {
        throw new Error("Unsupported input list type.");
    }
    return select;
};

/**
 * Get a list of parameters from an input URI that looks like:
 *  [dwv root]?input=encodeURI([root]?key0=value0&key1=value1)
 * or
 *  [dwv root]?input=encodeURI([manifest link])&type=manifest
 *  
 * @method getUriParam
 * @static
 * @param {String } uri The URI to decode.
 * @return {Object} The parameters found in the input uri.
 */
dwv.html.getUriParam = function (uri)
{
    // split key/value pairs
    var mainQueryPairs = dwv.utils.splitQueryString(uri);
    // check pairs
    if ( Object.keys(mainQueryPairs).length === 0 ) {
        return null;
    }
    // has to have an input key
    return mainQueryPairs.query;
};

/**
 * Decode a Key/Value pair uri. If a key is repeated, the result 
 * be an array of base + each key. 
 * @method decodeKeyValueUri
 * @static
 * @param {String} uri The uri to decode.
 * @param {String} replaceMode The key replace more.
 */
dwv.html.decodeKeyValueUri = function (uri, replaceMode)
{
    var result = [];

    // repeat key replace mode (default to keep key)
    var repeatKeyReplaceMode = "key";
    if ( replaceMode ) {
        repeatKeyReplaceMode = replaceMode;
    }

    // decode input URI
    var queryUri = decodeURIComponent(uri);
    // get key/value pairs from input URI
    var inputQueryPairs = dwv.utils.splitQueryString(queryUri);
    if ( Object.keys(inputQueryPairs).length === 0 ) 
    {
        result.push(queryUri);
    }
    else
    {
        var keys = Object.keys(inputQueryPairs.query);
        // find repeat key
        var repeatKey = null;
        for ( var i = 0; i < keys.length; ++i )
        {
            if ( inputQueryPairs.query[keys[i]] instanceof Array )
            {
                repeatKey = keys[i];
                break;
            }
        }
    
        if ( !repeatKey ) 
        {
            result.push(queryUri);
        }
        else
        {
            var repeatList = inputQueryPairs.query[repeatKey];
            // build base uri
            var baseUrl = inputQueryPairs.base;
            // do not add '?' when the repeatKey is 'file'
            // root/path/to/?file=0.jpg&file=1.jpg
            if ( repeatKey !== "file" ) { 
                baseUrl += "?";
            }
            var gotOneArg = false;
            for ( var j = 0; j < keys.length; ++j )
            {
                if ( keys[j] !== repeatKey ) {
                    if ( gotOneArg ) {
                        baseUrl += "&";
                    }
                    baseUrl += keys[j] + "=" + inputQueryPairs.query[keys[j]];
                    gotOneArg = true;
                }
            }
            // append built urls to result
            var url;
            for ( var k = 0; k < repeatList.length; ++k )
            {
                url = baseUrl;
                if ( gotOneArg ) {
                    url += "&";
                }
                if ( repeatKeyReplaceMode === "key" ) {
                    url += repeatKey + "=";
                }
                // other than 'key' mode: do nothing
                url += repeatList[k];
                result.push(url);
            }
        }
    }
    // return
    return result;
};

/**
 * Decode a manifest uri. 
 * @method decodeManifestUri
 * @static
 * @param {String} uri The uri to decode.
 * @param {number} nslices The number of slices to load.
 * @param {Function} The function to call with the decoded urls.
 */
dwv.html.decodeManifestUri = function (uri, nslices, callback)
{
    // Request error
    var onErrorRequest = function (/*event*/)
    {
        console.warn( "RequestError while receiving manifest: "+this.status );
    };

    // Request handler
    var onLoadRequest = function (/*event*/)
    {
        var urls = dwv.html.decodeManifest(this.responseXML, nslices);
        callback(urls);
    };
    
    var request = new XMLHttpRequest();
    request.open('GET', decodeURIComponent(uri), true);
    request.responseType = "xml"; 
    request.onload = onLoadRequest;
    request.onerror = onErrorRequest;
    //request.onprogress = dwv.gui.updateProgress;
    request.send(null);
};

/**
 * Decode an XML manifest. 
 * @method decodeManifest
 * @static
 * @param {Object} manifest The manifest to decode.
 * @param {Number} nslices The number of slices to load.
 */
dwv.html.decodeManifest = function (manifest, nslices)
{
    var result = [];
    // wado url
    var wadoElement = manifest.getElementsByTagName("wado_query");
    var wadoURL = wadoElement[0].getAttribute("wadoURL");
    var rootURL = wadoURL + "?requestType=WADO&contentType=application/dicom&";
    // patient list
    var patientList = manifest.getElementsByTagName("Patient");
    if ( patientList.length > 1 ) {
        console.warn("More than one patient, loading first one.");
    }
    // study list
    var studyList = patientList[0].getElementsByTagName("Study");
    if ( studyList.length > 1 ) {
        console.warn("More than one study, loading first one.");
    }
    var studyUID = studyList[0].getAttribute("StudyInstanceUID");
    // series list
    var seriesList = studyList[0].getElementsByTagName("Series");
    if ( seriesList.length > 1 ) {
        console.warn("More than one series, loading first one.");
    }
    var seriesUID = seriesList[0].getAttribute("SeriesInstanceUID");
    // instance list
    var instanceList = seriesList[0].getElementsByTagName("Instance");
    // loop on instances and push links
    var max = instanceList.length;
    if ( nslices < max ) {
        max = nslices;
    }
    for ( var i = 0; i < max; ++i ) {
        var sopInstanceUID = instanceList[i].getAttribute("SOPInstanceUID");
        var link = rootURL + 
        "&studyUID=" + studyUID +
        "&seriesUID=" + seriesUID +
        "&objectUID=" + sopInstanceUID;
        result.push( link );
    }
    // return
    return result;
};

/**
 * Display or not an element.
 * @method displayElement
 * @static
 * @param {Number} id The id of the element to toggle its display.
 * @param {Boolean} flag True to display the element.
 */
dwv.html.displayElement = function (id, flag)
{
    var element = document.getElementById(id);
    if ( element ) {
        element.style.display = flag ? "" : "none";
    }
};

/**
 * Toggle the display of an element.
 * @method toggleDisplay
 * @static
 * @param {Number} id The id of the element to toggle its display.
 */
dwv.html.toggleDisplay = function (id)
{
    var element = document.getElementById(id);
    if ( element ) {
        if ( element.style.display === "none" ) {
            element.style.display = '';
        }
        else {
            element.style.display = "none";
        }
    }
};

/**
 * Append an element.
 * @method appendElement
 * @static
 * @param {Number} parentId The id of the element to append to.
 * @param {Object} element The element to append.
 */
dwv.html.appendElement = function (parentId, element)
{
    var node = document.getElementById(parentId);
    if ( element ) {
        // append
        node.appendChild(element);
        // trigger create event (mobile)
        $('#'+parentId).trigger("create");
    }
};

/**
 * Create an element.
 * @method createElement
 * @static
 * @param {String} type The type of the elemnt.
 * @param {Number} id The id of the element
 */
dwv.html.createHiddenElement = function (type, id)
{
    var element = document.createElement(type);
    element.id = id;
    // hide by default
    element.style.display = "none";
    // return
    return element;
};
