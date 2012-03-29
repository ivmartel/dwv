// utils namespace
dwv.utils = dwv.utils || {};

/**
* String utilities functions.
*/

/**
 * Capitalise the first letter of a string.
 */
dwv.utils.capitaliseFirstLetter = function(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
};
