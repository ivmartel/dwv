/** 
 * Utility module.
 * @module utils
 */
var dwv = dwv || {};
/**
 * Namespace for utility functions.
 * @class utils
 * @namespace dwv
 * @static
 */
dwv.utils = dwv.utils || {};

/**
 * Capitalise the first letter of a string.
 * @method capitaliseFirstLetter
 * @static
 * @param {String} string The string to capitalise the first letter.
 * @return {String} The new string.
 */
dwv.utils.capitaliseFirstLetter = function (string)
{
    var res = string;
    if ( string ) {
        res = string.charAt(0).toUpperCase() + string.slice(1);
    }
    return res;
};

/**
 * Clean string: trim and remove ending.
 * @method cleanString
 * @static
 * @param {String} string The string to clean.
 * @return {String} The cleaned string.
 */
dwv.utils.cleanString = function (string)
{
    var res = string;
    if ( string ) {
        // trim spaces
        res = string.trim();
        // get rid of ending zero-width space (u200B)
        if ( res[res.length-1] === String.fromCharCode("u200B") ) {
            res = res.substring(0, res.length-1);
        }
    }
    return res;
};

/**
 * Split query string:
 *  'root?key0=val00&key0=val01&key1=val10' returns 
 *  { base : root, query : [ key0 : [val00, val01], key1 : val1 ] }
 * Returns an empty object if the input string is not correct (null, empty...)
 *  or if it is not a query string (no question mark).
 * @method splitQueryString
 * @static
 * @param {String} inputStr The string to split.
 * @return {Object} The split string.
 */
dwv.utils.splitQueryString = function (inputStr)
{
    // result
    var result = {};
    // check if query string
    var sepIndex = null;
    if ( inputStr && (sepIndex = inputStr.indexOf('?')) !== -1 ) {
        // base: before the '?'
        result.base = inputStr.substr(0, sepIndex);
        // query : after the '?' and until possible '#'
        var hashIndex = inputStr.indexOf('#');
        if ( hashIndex === -1 ) {
            hashIndex = inputStr.length;
        }
        var query = inputStr.substr(sepIndex + 1, (hashIndex - 1 - sepIndex));
        // split key/value pairs of the query
        result.query = dwv.utils.splitKeyValueString(query);
    }
    // return
    console.log(result);
    return result;
};

/**
 * Split key/value string:
 *  key0=val00&key0=val01&key1=val10 returns 
*   { key0 : [val00, val01], key1 : val1 }
 * @method splitKeyValueString
 * @static
 * @param {String} inputStr The string to split.
 * @return {Object} The split string.
 */
dwv.utils.splitKeyValueString = function (inputStr)
{
    // result
    var result = {};
    // check input string
    if ( inputStr ) {
         // split key/value pairs
        var pairs = inputStr.split('&');
        for ( var i = 0; i < pairs.length; ++i )
        {
            var pair = pairs[i].split('=');
            // if the key does not exist, create it
            if ( !result[pair[0]] ) 
            {
                result[pair[0]] = pair[1];
            }
            else
            {
                // make it an array
                if ( !( result[pair[0]] instanceof Array ) ) {
                    result[pair[0]] = [result[pair[0]]];
                }
                result[pair[0]].push(pair[1]);
            }
        }
    }
    return result;
};
