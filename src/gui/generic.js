import {logger} from '../utils/logger';

/**
 * List of interaction event names.
 */
export const InteractionEventNames = [
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
 * @param {string} containerDivId The id of the container div.
 * @param {string} name The name or id to find.
 * @returns {object} The found element or null.
 * @deprecated
 */
export function getElement(containerDivId, name) {
  // get by class in the container div
  const parent = document.getElementById(containerDivId);
  if (!parent) {
    return null;
  }
  const elements = parent.getElementsByClassName(name);
  // getting the last element since some libraries (ie jquery-mobile) create
  // span in front of regular tags (such as select)...
  let element = elements[elements.length - 1];
  // if not found get by id with 'containerDivId-className'
  if (typeof element === 'undefined') {
    element = document.getElementById(containerDivId + '-' + name);
  }
  return element;
}

/**
 * Overridalbe custom UI object for client defined UI.
 */
export const customUI = {
  /**
   * Open a dialogue to edit roi data. Defaults to window.prompt.
   *
   * @param {object} data The roi data.
   * @param {Function} callback The callback to launch on dialogue exit.
   */
  openRoiDialog(data, callback) {
    const textExpr = prompt('Label', data.textExpr);
    if (textExpr !== null) {
      data.textExpr = textExpr;
      callback(data);
    }
  }
};

/**
 * Get the positions (without the parent offset) of a list of touch events.
 *
 * @param {Array} touches The list of touch events.
 * @returns {Array} The list of positions of the touch events.
 */
function getTouchesPositions(touches) {
  // get the touch offset from all its parents
  let offsetLeft = 0;
  let offsetTop = 0;
  if (touches.length !== 0 &&
    typeof touches[0].target !== 'undefined') {
    let offsetParent = touches[0].target.offsetParent;
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
    logger.debug('No touch target offset parent.');
  }
  // set its position
  const positions = [];
  for (let i = 0; i < touches.length; ++i) {
    positions.push({
      x: touches[i].pageX - offsetLeft,
      y: touches[i].pageY - offsetTop
    });
  }
  return positions;
}

/**
 * Get the offset of an input event.
 *
 * @param {object} event The event to get the offset from.
 * @returns {Array} The array of offsets.
 */
export function getEventOffset(event) {
  let positions = [];
  if (typeof event.targetTouches !== 'undefined' &&
    event.targetTouches.length !== 0) {
    // see https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent/targetTouches
    positions = getTouchesPositions(event.targetTouches);
  } else if (typeof event.changedTouches !== 'undefined' &&
    event.changedTouches.length !== 0) {
    // see https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent/changedTouches
    positions = getTouchesPositions(event.changedTouches);
  } else {
    // offsetX/Y: the offset in the X coordinate of the mouse pointer
    // between that event and the padding edge of the target node
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/offsetX
    // https://caniuse.com/mdn-api_mouseevent_offsetx
    positions.push({
      x: event.offsetX,
      y: event.offsetY
    });
  }
  return positions;
}

/**
 * Test if a canvas with the input size can be created.
 *
 * @see https://github.com/ivmartel/dwv/issues/902
 * @see https://github.com/jhildenbiddle/canvas-size/blob/v1.2.4/src/canvas-test.js
 * @param {number} width The canvas width.
 * @param {number} height The canvas height.
 * @returns {boolean} True is the canvas can be created.
 */
export function canCreateCanvas(width, height) {
  // test canvas with input size
  const testCvs = document.createElement('canvas');
  testCvs.width = width;
  testCvs.height = height;
  // crop canvas to speed up test
  const cropCvs = document.createElement('canvas');
  cropCvs.width = 1;
  cropCvs.height = 1;
  // contexts
  const testCtx = testCvs.getContext('2d');
  const cropCtx = cropCvs.getContext('2d');
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
}
