import {getControlDiv} from './viewer.ui.js';

/**
 * @import {App} from '../../src/app/application.js';
 */

/**
 * Brush tool UI.
 */
export class BrushToolUI {

  /**
   * The associated application.
   *
   * @type {App}
   */
  #app;

  /**
   * @param {App} app The associated application.
   */
  constructor(app, /*toolConfig*/) {
    this.#app = app;
  }

  /**
   * Bind app to ui.
   */
  registerListeners() {
    // listen to brush size event (via shortcut)
    this.#app.addEventListener('brushsizechange', this.#onBrushSizeChange);
  };

  /**
   * Get the value of the tool UI.
   *
   * @returns {object|undefined} The value.
   */
  getValue() {
    return undefined;
  };

  /**
   * Get the HTML element of the tool UI.
   *
   * @returns {HTMLElement|undefined} The element.
   */
  getHtml() {
    // list of segmentations
    const res = document.createElement('ul');
    res.id = 'toolFeatures';
    res.className = 'toolFeatures';

    // brush size input
    const sizeCallback = (size) => {
      this.#app.setToolFeatures({brushSize: size});
      //this.updateBrushCursorSize(size);
    };
    // set default size
    const defaultCursorSize = 10;
    this.#app.setToolFeatures({brushSize: defaultCursorSize});
    // append range
    const controlDiv = getControlDiv(
      'brush-size',
      'Brush size',
      1,
      20,
      defaultCursorSize,
      sizeCallback,
      undefined,
      1
    );
    res.appendChild(controlDiv);

    // if no segmentations, use default
    if (!document.getElementById('segmentation-list')) {
      const features = {
        brushMode: 'add',
        selectedSegmentNumber: 1,
        createMask: true
      };
      console.log('set tool features [add-default]', features);
      this.#app.setToolFeatures(features);
    }

    return res;
  };

  /**
   * Handle brush size change event.
   *
   * @param {CustomEvent} event The change event.
   */
  #onBrushSizeChange(event) {
    const newValue = event.detail.value;
    const controlRange = document.getElementById('brush-size-range');
    const controlValue = document.getElementById('brush-size-number');
    if (controlRange && controlValue) {
      controlRange.value = newValue;
      controlValue.value = newValue;
    }
  }

  /**
   * Update the brush cursor size.
   *
   * @param {number} _brushSize The new size.
   */
  // #updateBrushCursorSize(_brushSize) {
  //   const stgCtrl = this.#app.getStageController();
  //   const lg = stgCtrl.getActiveLayerGroup();
  //   if (typeof lg === 'undefined') {
  //     throw new Error('No active layer group for brush cursor');
  //   }
  //   const vl = lg.getActiveViewLayer();
  //   if (typeof vl === 'undefined') {
  //     throw new Error('No active view layer for brush cursor');
  //   }
  //   const scale = vl.getScale();
  //   const spacing = vl.getViewController().get2DSpacing();

  //   const width = 2 * brushSize * Math.abs(scale.x) / spacing.x;
  //   const height = 2 * brushSize * Math.abs(scale.y) / spacing.y;

  //   const cursorDiv = document.getElementById('brushCursor');
  //   cursorDiv.style.width = Math.round(width) + 'px';
  //   cursorDiv.style.height = Math.round(height) + 'px';
  // }

  /**
   * Add the brush cursor to the dom.
   */
  // #addBrushCursor() {
  //   // cursor div
  //   const cursorDiv = document.createElement('div');
  //   cursorDiv.id = 'brushCursor';
  //   document.body.prepend(cursorDiv);

  //   // default size
  //   const cursorRange = document.getElementById('brush-size-range');
  //   this.#updateBrushCursorSize(parseInt(cursorRange.value, 10));

  //   // update position on mouse move
  //   window.addEventListener('mousemove', updateBrushCursorPos);
  // }

}; // BrushToolUI

/**
 * Update the brush cursor on mouse move.
 *
 * @param event The mouse move event.
 */
// function updateBrushCursorPos(event) {
//   const cursorDiv = document.getElementById('brushCursor');
//   // calculate shape half sizes
//   const width = cursorDiv.clientWidth;
//   const left = cursorDiv.offsetLeft + (cursorDiv.offsetWidth - width);
//   const halfX = left + width / 2;
//   const height = cursorDiv.clientHeight;
//   const top = cursorDiv.offsetTop + (cursorDiv.offsetHeight - height);
//   const halfY = top + height / 2;
//   // new cursor position
//   const mouseX = event.clientX - halfX;
//   const mouseY = event.clientY - halfY;
//   cursorDiv.style.translate = `${mouseX}px ${mouseY}px`;
// }

/**
 * Remove the brush cursor from the dom.
 */
// function removeBrushCursor() {
//   // remove div
//   const cursorDiv = document.getElementById('brushCursor');
//   if (cursorDiv) {
//     cursorDiv.remove();
//   }

//   // stop listening on mouse move
//   window.removeEventListener('mousemove', updateBrushCursorPos);
// }
