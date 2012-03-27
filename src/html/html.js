// html namespace
var html = html || {};

/**
* HTML utilities functions.
*/

/**
 * Get an HTML table corresponding to an input javascript array. 
 * @param inputArray The input array, can be either a 1D array, 
 *                   2D array or an array of objects
 */
html.arrayToTable = function(inputArray)
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
                        cell.appendChild(document.createTextNode(utils.capitaliseFirstLetter(keys[k])));
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
