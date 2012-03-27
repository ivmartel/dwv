/**
* HTML utilitaries.
*/

/**
 * Get an HTML table corresponding to an input javascript array. 
 * @param inputArray The input array, can be either a 1D array, 
 *                   2D array or an array of objects
 */
arrayToTable = function(inputArray)
{
    var table = document.createElement('table');
    var row = 0;
    var cell = 0;
    var keys = 0;
    
    for(var i=0; i<inputArray.length; ++i) {
        row = table.insertRow(i);
        // 1D array
        if( typeof inputArray[i] === 'number' || typeof inputArray[i] === 'string') {
            cell = row.insertCell(0);
            cell.appendChild(document.createTextNode(inputArray[i]));
        }
        else if( typeof inputArray[i] === 'object' ) {
            // 2D array
            if( inputArray[i] instanceof Array ) {
                for( var j=0; j<inputArray[i].length; ++j) {
                    cell = row.insertCell(j);
                    cell.appendChild(document.createTextNode(inputArray[i][j]));
                }
            }
            // array of objects
            else {
                keys = Object.keys(inputArray[i]);
                for( var o=0; o<keys.length; ++o ) {
                    cell = row.insertCell(o);
                    cell.appendChild(document.createTextNode(inputArray[i][keys[o]]));
                }
            }
        }
    }

    return table;
};
