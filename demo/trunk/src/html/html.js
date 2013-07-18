/**
 * @namespace HTML related.
 */
dwv.html = dwv.html || {};

/**
 * @function Append a cell to a given row.
 * @param row The row to append the cell to.
 * @param text The text of the cell.
 */
dwv.html.appendCell = function(row, text)
{
    var cell = row.insertCell(-1);
    cell.appendChild(document.createTextNode(text));
};

/**
 * @function Append a header cell to a given row.
 * @param row The row to append the header cell to.
 * @param text The text of the header cell.
 */
dwv.html.appendHCell = function(row, text)
{
    var cell = document.createElement("th");
    // TODO jquery-mobile specific...
    if( text !== "Value" && text !== "Name" ) cell.setAttribute("data-priority", "1");
    cell.appendChild(document.createTextNode(text));
    row.appendChild(cell);
};

/**
 * @function
 */
dwv.html.appendRowForArray = function(table, input, level, maxLevel, rowHeader)
{
    var row = null;
    // loop through
    for(var i=0; i<input.length; ++i) {
        // more to come
        if( typeof input[i] === 'number'
            || typeof input[i] === 'string'
            || input[i] === null
            || input[i] === undefined
            || level >= maxLevel ) {
            if( !row ) {
                row = table.insertRow(-1);
            }
            dwv.html.appendCell(row, input[i]);
        }
        // last level
        else {
            dwv.html.appendRow(table, input[i], level+i, maxLevel, rowHeader);
        }
    }
};

/**
 * @function
 */
dwv.html.appendRowForObject = function(table, input, level, maxLevel, rowHeader)
{
    var keys = Object.keys(input);
    var row = null;
    for( var o=0; o<keys.length; ++o ) {
        // more to come
        if( typeof input[keys[o]] === 'number' 
            || typeof input[keys[o]] === 'string'
            || input[keys[o]] === null
            || input[keys[o]] === undefined
            || level >= maxLevel ) {
            if( !row ) {
                row = table.insertRow(-1);
            }
            if( o === 0 && rowHeader) {
                dwv.html.appendCell(row, rowHeader);
            }
            dwv.html.appendCell(row, input[keys[o]]);
        }
        // last level
        else {
            dwv.html.appendRow(table, input[keys[o]], level+o, maxLevel, keys[o]);
        }
    }
    // header row
    // warn: need to create the header after the rest
    // otherwise the data will inserted in the thead...
    if( level === 2 ) {
        var header = table.createTHead();
        var th = header.insertRow(-1);
        if( rowHeader ) {
            dwv.html.appendHCell(th, "Name");
        }
        for( var k=0; k<keys.length; ++k ) {
            dwv.html.appendHCell(th, dwv.utils.capitaliseFirstLetter(keys[k]));
        }
    }
};

/**
 * @function
 */
dwv.html.appendRow = function(table, input, level, maxLevel, rowHeader)
{
    // array
    if( input instanceof Array ) {
        dwv.html.appendRowForArray(table, input, level+1, maxLevel, rowHeader);
    }
    // object
    else if( typeof input === 'object') {
        dwv.html.appendRowForObject(table, input, level+1, maxLevel, rowHeader);
    }
    else {
        throw new Error("Unsupported input data type.");
    }
};

/**
 * @function Converts the input to an HTML table.
 * @input input Allowed types are: array, array of object, object.
 * @warning Null is interpreted differently in browsers, firefox will not display it.
 */
dwv.html.toTable = function(input)
{
    var table = document.createElement('table');
    dwv.html.appendRow(table, input, 0, 2);
    return table;
};

/**
 * @function
 */
dwv.html.getHtmlSearchForm = function(htmlTableToSearch)
{
    var form = document.createElement("form");
    form.setAttribute("class", "filter");
    var input = document.createElement("input");
    input.onkeyup = function() {
        dwv.html.filterTable(input, htmlTableToSearch);
    };
    form.appendChild(input);
    
    return form;
};

/**
 * @function
 * @param term
 * @param table
 */
dwv.html.filterTable = function(term, table) {
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
 * @function Transform back each
 * <span>preText <span class="highlighted">term</span> postText</span>
 * into its original preText term postText
 * @param container The container to de-highlight.
 */
dwv.html.dehighlight = function(container) {
    for (var i = 0; i < container.childNodes.length; i++) {
        var node = container.childNodes[i];

        if (node.attributes 
                && node.attributes['class']
                && node.attributes['class'].value === 'highlighted') {
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
 * @function Create a
 * <span>preText <span class="highlighted">term</span> postText</span>
 * around each search term
 * @param term The term to highlight.
 * @param container The container where to highlight the term.
 */
dwv.html.highlight = function(term, container) {
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
 * @function
 */
dwv.html.createHighlightNode = function(child) {
    var node = document.createElement('span');
    node.setAttribute('class', 'highlighted');
    node.attributes['class'].value = 'highlighted';
    node.appendChild(child);
    return node;
};

/**
 * @function Remove all children of a node.
 * @param nodeId The id of the node to delete.
 * @param parentId The id of the parent of the node to delete.
 */
dwv.html.cleanNode = function(node) {
    // remove its children
    while (node.hasChildNodes()) {
        node.removeChild(node.firstChild);
    }
};

/**
 * @function Remove all children of a node and then remove it from its parent.
 * @param nodeId The id of the node to delete.
 * @param parentId The id of the parent of the node to delete.
 */
dwv.html.removeNode = function(nodeId) {
    // find the node
    var node = document.getElementById(nodeId);
    // check node
    if( !node ) return;
    // remove its children
    dwv.html.cleanNode(node);
    // remove it from its parent
    var top = node.parentNode;
    top.removeChild(node);
};

/**
 * @function Create a HTML select from an input array of options.
 * The values of the options are the name of the option made lower case.
 * It is left to the user to set the 'onchange' method of the select.
 * @param name The name of the HTML select.
 * @param array The array of options of the HTML select.
 * @return The created HTML select.
 */
dwv.html.createHtmlSelect = function(name, list) {
    // select
    var select = document.createElement("select");
    select.id = name;
    select.name = name;
    // options
    var option;
    if( list instanceof Array )
    {
        for ( var i in list )
        {
            option = document.createElement("option");
            option.value = list[i].toLowerCase();
            option.appendChild(document.createTextNode(dwv.utils.capitaliseFirstLetter(list[i])));
            select.appendChild(option);
        }
    }
    else if( typeof list === 'object')
    {
        for ( var name in list )
        {
            option = document.createElement("option");
            option.value = name.toLowerCase();
            option.appendChild(document.createTextNode(dwv.utils.capitaliseFirstLetter(name)));
            select.appendChild(option);
        }
    }
    else
    {
        throw new Error("Unsupported input list type.");
    }
    return select;
};

dwv.html.getUriParam = function(uri)
{
    var inputUri = uri || window.location.href;
    var val = [];
    // split key/value pairs
    var mainQueryPairs = dwv.utils.splitQueryString(inputUri);
    // check pairs
    if( mainQueryPairs === null ) return null;
    // has to have an input key
    if( !mainQueryPairs.input ) 
        throw new Error("No input parameter in query URI.");
    // decode input URI
    var queryUri = decodeURIComponent(mainQueryPairs.input);
    // get key/value pairs from input URI
    var inputQueryPairs = dwv.utils.splitQueryString(queryUri);
    // repeat key replace mode (default to keep key)
    var repeatKeyReplaceMode = "key";
    if( mainQueryPairs.dwvReplaceMode ) repeatKeyReplaceMode = mainQueryPairs.dwvReplaceMode;
    
    if( !inputQueryPairs ) val.push(queryUri);
    else
    {
        var keys = Object.keys(inputQueryPairs);
        // find repeat key
        var repeatKey = null;
        for( var i = 0; i < keys.length; ++i )
        {
            if( inputQueryPairs[keys[i]] instanceof Array )
                repeatKey = keys[i];
        }
    
        if( !repeatKey ) val.push(queryUri);
        else
        {
            // build base uri
            var baseUrl = inputQueryPairs.base + "?";
            var gotOneArg = false;
            for( var i = 0; i < keys.length; ++i )
            {
                if( keys[i] !== "base" && keys[i] !== repeatKey ) {
                    if( gotOneArg ) baseUrl += "&";
                    baseUrl += keys[i] + "=" + inputQueryPairs[keys[i]];
                    gotOneArg = true;
                }
            }
            
            // check if we really have repetition
            if( inputQueryPairs[repeatKey] instanceof Array )
            {
                for( var i = 0; i < inputQueryPairs[repeatKey].length; ++i )
                {
                    var url = baseUrl;
                    if( gotOneArg ) url += "&";
                    if( repeatKeyReplaceMode === "key" ) url += repeatKey + "=";
                    // other than key: do nothing
                    url += inputQueryPairs[repeatKey][i];
                    val.push(url);
                }
            }
            else 
            {
                var url = baseUrl;
                if( gotOneArg ) url += "&";
                url += repeatKey + "=" + inputQueryPairs[repeatKey];
                val.push(url);
            }
        }
    }
    
    return val;
};

dwv.html.toggleDisplay = function(id)
{
    if( document.getElementById(id) )
    {
        var div = document.getElementById(id);
        if( div.style.display === "none" ) div.style.display = '';
        else div.style.display = "none";
    }
};

