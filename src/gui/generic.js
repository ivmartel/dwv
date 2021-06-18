// namespaces
var dwv = dwv || {};
dwv.gui = dwv.gui || {};

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
dwv.gui.getElement = function (containerDivId, name) {
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
 * Get a HTML element associated to a container div. Defaults to local one.
 *
 * @see dwv.gui.getElement
 */
dwv.getElement = dwv.gui.getElement;

/**
 * Prompt the user for some text. Uses window.prompt.
 *
 * @param {string} message The message in front of the input field.
 * @param {string} value The input default value.
 * @returns {string} The new value.
 */
dwv.gui.prompt = function (message, value) {
  return prompt(message, value);
};

/**
 * Prompt the user for some text. Defaults to local one.
 *
 * @see dwv.gui.prompt
 */
dwv.prompt = dwv.gui.prompt;

/**
 * Open a dialogue to edit roi data. Defaults to undefined.
 *
 * @param {object} data The roi data.
 * @param {Function} callback The callback to launch on dialogue exit.
 * @see dwv.tool.Draw
 */
dwv.openRoiDialog;

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
dwv.gui.getTouchesPositions = function (touches) {
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
dwv.gui.getEventOffset = function (event) {
  var positions = [];
  if (typeof event.targetTouches !== 'undefined' &&
    event.targetTouches.length !== 0) {
    // see https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent/targetTouches
    positions = dwv.gui.getTouchesPositions(event.targetTouches);
  } else if (typeof event.changedTouches !== 'undefined' &&
      event.changedTouches.length !== 0) {
    // see https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent/changedTouches
    positions = dwv.gui.getTouchesPositions(event.changedTouches);
  } else {
    // layerX is used by Firefox
    var ex = event.offsetX === undefined ? event.layerX : event.offsetX;
    var ey = event.offsetY === undefined ? event.layerY : event.offsetY;
    positions.push({x: ex, y: ey});
  }
  return positions;
};

/**
 * Test if a canvas with the input size can be created.
 *
 * @see https://github.com/ivmartel/dwv/issues/902
 * @see https://github.com/jhildenbiddle/canvas-size/blob/v1.2.4/src/canvas-test.js
 * @param {number} width The canvas width.
 * @param {number} height The canvas height.
 * @returns {boolean} True is the canvas can be created.
 */
dwv.gui.canCreateCanvas = function (width, height) {
  // test canvas with input size
  var testCvs = document.createElement('canvas');
  testCvs.width = width;
  testCvs.height = height;
  // crop canvas to speed up test
  var cropCvs = document.createElement('canvas');
  cropCvs.width = 1;
  cropCvs.height = 1;
  // contexts
  var testCtx = testCvs.getContext('2d');
  var cropCtx = cropCvs.getContext('2d');
  // set data
  if (testCtx) {
    testCtx.fillRect(width - 1, height - 1, 1, 1);
    // Render the test pixel in the bottom-right corner of the
    // test canvas in the top-left of the 1x1 crop canvas. This
    // dramatically reducing the time for getImageData to complete.
    cropCtx.drawImage(testCvs, width - 1, height - 1, 1, 1, 0, 0, 1, 1);
  }
  // Verify image data (alpha component, Pass = 255, Fail = 0)
  return cropCtx && cropCtx.getImageData(0, 0, 1, 1).data[3] !== 0;
};
