/**
 * @namespace Utils classes and functions.
 */
dwv.utils = dwv.utils || {};

/**
 * @function Capitalise the first letter of a string.
 */
dwv.utils.capitaliseFirstLetter = function(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * @function Clean string.
 */
dwv.utils.cleanString = function(string)
{
    var str = string.trim();
    //get rid of ending zero-width space (u200B)
    if( str[str.length-1] === String.fromCharCode("u200B") ) {
        str = str.substring(0, str.length-1); 
    }
    return str;
};

/**
 * root?key0=val0&key1=val1 ...
 */
dwv.utils.splitQueryString = function(inputStr)
{
    // take after the ?
    var query = inputStr.substr(inputStr.indexOf('?')+1);
    // split key/value pairs
    var pairs = query.split('&');
    var result = {};
    for( var i = 0; i < pairs.length; ++i )
    {
        var pair = pairs[i].split('=');
        result[pair[0]] = pair[1];
    }
    return result;
};
