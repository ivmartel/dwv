// utils namespace
var utils = utils || {};

/**
* String utilities functions.
*/

/**
 * Capitalise the first letter of a string.
 */
utils.capitaliseFirstLetter = function(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
};
