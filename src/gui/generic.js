// namespaces
var dwv = dwv || {};
dwv.gui = dwv.gui || {};
dwv.gui.base = dwv.gui.base || {};

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
