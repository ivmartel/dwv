// namespaces
var dwv = dwv || {};
dwv.gui = dwv.gui || {};
dwv.gui.base = dwv.gui.base || {};

/**
 * Ask some text to the user.
 *
 * @param {string} message Text to display to the user.
 * @param {string} defaultText Default value displayed in the text input field.
 * @returns {string} Text entered by the user.
 */
dwv.gui.base.prompt = function (message, defaultText) {
  return prompt(message, defaultText);
};

/**
 * Get a HTML element associated to a container div.
 *
 * @param {number} containerDivId The id of the container div.
 * @param {string} name The name or id to find.
 * @returns {object} The found element or null.
 */
dwv.gui.base.getElement = function (containerDivId, name) {
  // get by class in the container div
  var parent = document.getElementById(containerDivId);
  if (!parent) {
    return null;
  }
  var elements = parent.getElementsByClassName(name);
  // getting the last element since some libraries (ie jquery-mobile) create
  // span in front of regular tags (such as select)...
  var element = elements[elements.length - 1];
  // if not found get by id with 'containerDivId-className'
  if (typeof element === 'undefined') {
    element = document.getElementById(containerDivId + '-' + name);
  }
  return element;
};
