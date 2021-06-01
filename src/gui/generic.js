// namespaces
var dwv = dwv || {};
dwv.gui = dwv.gui || {};
dwv.gui.base = dwv.gui.base || {};

/**
 * List of interaction event names.
 */
dwv.gui.interactionEventNames = [
  'mousedown',
  'mousemove',
  'mouseup',
  'mouseout',
  'wheel',
  'dblclick',
  'touchstart',
  'touchmove',
  'touchend'
];

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

/**
 * Get the size available for a div.
 *
 * @param {object} div The input div.
 * @returns {object} The available width and height as {x,y}.
 */
dwv.gui.getDivSize = function (div) {
  var parent = div.parentNode;
  // offsetHeight: height of an element, including vertical padding
  // and borders
  // ref: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight
  var height = parent.offsetHeight;
  // remove the height of other elements of the container div
  var kids = parent.children;
  for (var i = 0; i < kids.length; ++i) {
    if (!kids[i].classList.contains(div.className)) {
      var styles = window.getComputedStyle(kids[i]);
      // offsetHeight does not include margin
      var margin = parseFloat(styles.getPropertyValue('margin-top'), 10) +
             parseFloat(styles.getPropertyValue('margin-bottom'), 10);
      height -= (kids[i].offsetHeight + margin);
    }
  }
  return {x: parent.offsetWidth, y: height};
};

/**
 * Get the positions (without the parent offset) of a list of touch events.
 *
 * @param {Array} touches The list of touch events.
 * @returns {Array} The list of positions of the touch events.
 */
dwv.html.getTouchesPositions = function (touches) {
  // get the touch offset from all its parents
  var offsetLeft = 0;
  var offsetTop = 0;
  if (touches.length !== 0 &&
    typeof touches[0].target !== 'undefined') {
    var offsetParent = touches[0].target.offsetParent;
    while (offsetParent) {
      if (!isNaN(offsetParent.offsetLeft)) {
        offsetLeft += offsetParent.offsetLeft;
      }
      if (!isNaN(offsetParent.offsetTop)) {
        offsetTop += offsetParent.offsetTop;
      }
      offsetParent = offsetParent.offsetParent;
    }
  } else {
    dwv.logger.debug('No touch target offset parent.');
  }
  // set its position
  var positions = [];
  for (var i = 0; i < touches.length; ++i) {
    positions.push({
      x: touches[i].pageX - offsetLeft,
      y: touches[i].pageY - offsetTop
    });
  }
  return positions;
};

/**
 * Get the offset of an input event.
 *
 * @param {object} event The event to get the offset from.
 * @returns {Array} The array of offsets.
 */
dwv.html.getEventOffset = function (event) {
  var positions = [];
  if (typeof event.targetTouches !== 'undefined' &&
    event.targetTouches.length !== 0) {
    // see https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent/targetTouches
    positions = dwv.html.getTouchesPositions(event.targetTouches);
  } else if (typeof event.changedTouches !== 'undefined' &&
      event.changedTouches.length !== 0) {
    // see https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent/changedTouches
    positions = dwv.html.getTouchesPositions(event.changedTouches);
  } else {
    // layerX is used by Firefox
    var ex = event.offsetX === undefined ? event.layerX : event.offsetX;
    var ey = event.offsetY === undefined ? event.layerY : event.offsetY;
    positions.push({x: ex, y: ey});
  }
  return positions;
};
