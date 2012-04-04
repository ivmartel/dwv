/**
 * @namespace Utils classes and functions.
 */
dwv.utils = dwv.utils || {};

/**
* @fileOverview String utilities functions.
*/

/**
 * @function Capitalise the first letter of a string.
 */
dwv.utils.capitaliseFirstLetter = function(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
};
