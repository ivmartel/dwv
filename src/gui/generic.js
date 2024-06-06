import {logger} from '../utils/logger';
import {Point2D} from '../math/point';

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
 * @returns {Point2D[]} The list of positions of the touch events.
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
    positions.push(new Point2D(
      touches[i].pageX - offsetLeft,
      touches[i].pageY - offsetTop
    ));
  }
  return positions;
}

/**
 * Get the offsets of an input touch event.
 *
 * @param {object} event The event to get the offset from.
 * @returns {Point2D[]} The array of points.
 */
export function getTouchPoints(event) {
  let positions = [];
  if (typeof event.targetTouches !== 'undefined' &&
    event.targetTouches.length !== 0) {
    // see https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent/targetTouches
    positions = getTouchesPositions(event.targetTouches);
  } else if (typeof event.changedTouches !== 'undefined' &&
    event.changedTouches.length !== 0) {
    // see https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent/changedTouches
    positions = getTouchesPositions(event.changedTouches);
  }
  return positions;
}

/**
 * Get the offset of an input mouse event.
 *
 * @param {object} event The event to get the offset from.
 * @returns {Point2D} The 2D point.
 */
export function getMousePoint(event) {
  // offsetX/Y: the offset in the X coordinate of the mouse pointer
  // between that event and the padding edge of the target node
  // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/offsetX
  // https://caniuse.com/mdn-api_mouseevent_offsetx
  return new Point2D(
    event.offsetX,
    event.offsetY
  );
}

/**
 * Test if a canvas with the input size can be created.
 *
 * Ref:
 * - {@link https://github.com/ivmartel/dwv/issues/902},
 * - {@link https://github.com/jhildenbiddle/canvas-size/blob/v1.2.4/src/canvas-test.js}.
 *
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
