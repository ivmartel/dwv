// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.utils = dwv.utils || {};

/**
 * Capitalise the first letter of a string.
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
 * Split key/value string:
 *  key0=val00&key0=val01&key1=val10 returns
 *  { key0 : [val00, val01], key1 : val1 }
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

/**
 * @param {String} inputStr The input string.
 * @param {Object} values A object of {value, unit}.
 */
dwv.utils.replaceFlags = function (inputStr, values)
{
    var res = inputStr;
    if (values === null) {
        return res;
    }
    var keys = Object.keys(values);
    for (var i = 0; i < keys.length; ++i) {
        if ( values[keys[i]] !== null && typeof values[keys[i]] !== "undefined" &&
             values[keys[i]].value !== null && typeof values[keys[i]].value !== "undefined") {
            var valueStr = values[keys[i]].value.toPrecision(4);
            if (values[keys[i]].unit.length !== 0) {
                valueStr += " " + dwv.i18n("unit."+values[keys[i]].unit);
            }
            var flag = '{' + keys[i] + '}';
            res = res.replace(flag, valueStr);
        }
    }
    return res;
};
