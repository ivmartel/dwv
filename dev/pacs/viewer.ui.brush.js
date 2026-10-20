import {getControlDiv, getSplitButton} from './viewer.utils.js';

/**
 * @import {ViewerService} from './viewer.service.js';
 */

/**
 * Brush tool UI.
 */
export class BrushToolUI {

  /**
   * The associated viewer service.
   *
   * @type {ViewerService}
   */
  #service;

  /**
   * The brush mode: 'add' for brush, 'del' for eraser.
   *
   * @type {string}
   */
  #brushMode = 'add';

  /**
   * @param {ViewerService} service The associated viewer service.
   */
  constructor(service, /*toolConfig*/) {
    this.#service = service;
  }

  /**
   * Bind app to ui.
   */
  registerListeners() {
    // listen to brush size event (via shortcut)
    this.#service.addEventListener('brushsizechange', this.#onBrushSizeChange);
  };

  /**
   * Get the value of the tool UI.
   *
   * @returns {object|undefined} The value.
   */
  getValue() {
    return {brushMode: this.#brushMode};
  };

  /**
   * Merge the tool button with a brush/eraser menu: the button displays
   * the selected mode, selecting a mode in the menu updates
   * the button text and presses it.
   *
   * @param {HTMLButtonElement} toolButton The tool button.
   * @returns {HTMLElement} The tool button with its mode menu.
   */
  getToolButtonHtml(toolButton) {
    const modes = {
      Brush: 'add',
      Eraser: 'del'
    };
    const onSelect = (modeName) => {
      this.#brushMode = modes[modeName];
      toolButton.textContent = modeName;
    };
    return getSplitButton(
      toolButton, Object.keys(modes), onSelect, 'brush-mode-', 'Select mode');
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
      this.#service.setToolFeatures({brushSize: size});
      //this.updateBrushCursorSize(size);
    };
    // set default size
    const defaultCursorSize = 10;
    this.#service.setToolFeatures({brushSize: defaultCursorSize});
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
        selectedSegmentNumber: 1,
        createMask: true
      };
      console.log('set tool features [add-default]', features);
      this.#service.setToolFeatures(features);
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
  //   const stgCtrl = this.#service.getStageController();
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
