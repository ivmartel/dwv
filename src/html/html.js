// html namespace
dwv.html = dwv.html || {};

/**
* HTML utilities functions.
*/

/**
 * Get an HTML table corresponding to an input javascript array. 
 * @param inputArray The input array, can be either a 1D array, 
 *                   2D array or an array of objects
 */
dwv.html.arrayToTable = function(inputArray)
{
    var table = document.createElement('table');
    var row = 0;
    var cell = 0;
    var keys = 0;
    
    for(var i=0; i<inputArray.length; ++i) {
        row = table.insertRow(-1);
        // 1D array
        if( typeof inputArray[i] === 'number' || typeof inputArray[i] === 'string') {
            cell = row.insertCell(-1);
            cell.appendChild(document.createTextNode(inputArray[i]));
        }
        else if( typeof inputArray[i] === 'object' ) {
            // 2D array
            if( inputArray[i] instanceof Array ) {
                for( var j=0; j<inputArray[i].length; ++j) {
                    cell = row.insertCell(-1);
                    cell.appendChild(document.createTextNode(inputArray[i][j]));
                }
            }
            // array of objects
            else {
                keys = Object.keys(inputArray[i]);
                // header
                if( i === 0 ) {
                    var header = table.createTHead();
                    var th = header.insertRow(-1);
                    for( var k=0; k<keys.length; ++k ) {
                        cell = th.insertCell(-1);
                        cell.appendChild(document.createTextNode(dwv.utils.capitaliseFirstLetter(keys[k])));
                    }
                }
                // values
                for( var o=0; o<keys.length; ++o ) {
                    cell = row.insertCell(-1);
                    cell.appendChild(document.createTextNode(inputArray[i][keys[o]]));
                }
            }
        }
    }

    return table;
};

/**
 * 
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
 * Transform back each
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
 * Create a
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

dwv.html.createHighlightNode = function(child) {
    var node = document.createElement('span');
    node.setAttribute('class', 'highlighted');
    node.attributes['class'].value = 'highlighted';
    node.appendChild(child);
    return node;
};
