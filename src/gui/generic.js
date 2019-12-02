// namespaces
var dwv = dwv || {};
dwv.gui = dwv.gui || {};
dwv.gui.base = dwv.gui.base || {};

/**
 * Ask some text to the user.
 * @param {String} message Text to display to the user.
 * @param {String} defaultText Default value displayed in the text input field.
 * @return {String} Text entered by the user.
 */
dwv.gui.base.prompt = function (message, defaultText)
{
    return prompt(message, defaultText);
};

/**
 * Get a HTML element associated to a container div.
 * @param {Number} containerDivId The id of the container div.
 * @param {String} name The name or id to find.
 * @return {Object} The found element or null.
 */
dwv.gui.base.getElement = function (containerDivId, name)
{
    // get by class in the container div
    var parent = document.getElementById(containerDivId);
    if ( !parent ) {
        return null;
    }
    var elements = parent.getElementsByClassName(name);
    // getting the last element since some libraries (ie jquery-mobile) create
    // span in front of regular tags (such as select)...
    var element = elements[elements.length-1];
    // if not found get by id with 'containerDivId-className'
    if ( typeof element === "undefined" ) {
        element = document.getElementById(containerDivId + '-' + name);
    }
    return element;
 };

 /**
 * Set the selected item of a HTML select.
 * @param {String} element The HTML select element.
 * @param {String} value The value of the option to mark as selected.
 */
dwv.gui.base.setSelected = function (/*element, value*/)
{
    // base does nothing...
};

 /**
 * Refresh a HTML element. Mainly for jquery-mobile.
 * @param {String} element The HTML element to refresh.
 */
dwv.gui.base.refreshElement = function (/*element*/)
{
    // base does nothing...
};

/**
* Create an overlay element.
* @param {Object} parent The parent of the overlay element.
* @param {String} className The css class name of the overlay element.
* @param {String} value The value to use in the overlay.
*/
dwv.gui.base.createOverlayElement = function (parent, className, value)
{
    var li = document.createElement("li");
    li.className = className;
    li.appendChild( document.createTextNode( value ) );
    parent.appendChild(li);
};

/**
* Update an overlay element.
* @param {Object} parent The parent of the overlay element.
* @param {String} className The css class name of the overlay element.
* @param {String} value The new value to use in the overlay.
*/
dwv.gui.base.updateOverlayElement = function (parent, className, value)
{
    var li = document.getElementsByClassName(className)[0];
    if (li) {
        dwv.html.cleanNode(li);
        li.appendChild( document.createTextNode(value) );
    }
};
