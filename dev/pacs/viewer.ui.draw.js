import {DicomCode} from '../../src/dicom/dicomCode.js';
import {getSplitButton} from './viewer.utils.js';

/**
 * @import {ViewerService} from './viewer.service.js';
 */

/**
 * Draw tool UI.
 */
export class DrawToolUI {

  /**
   * The associated viewer service.
   *
   * @type {ViewerService}
   */
  #service;

  /**
   * The tool configuration.
   *
   * @type {object}
   */
  #toolConfig;

  /**
   * The selected shape name.
   *
   * @type {string|undefined}
   */
  #shapeName;

  /**
   * @param {ViewerService} service The associated viewer service.
   * @param {object} toolConfig The tool configuration.
   */
  constructor(service, toolConfig) {
    this.#service = service;
    this.#toolConfig = toolConfig;
    // default to rectangle if available
    const shapeNames = this.#toolConfig.options;
    if (typeof shapeNames !== 'undefined') {
      this.#shapeName = shapeNames.includes('Rectangle')
        ? 'Rectangle' : shapeNames[0];
    }
  }

  /**
   * Bind app to ui.
   */
  registerListeners() {};

  /**
   * Get the value of the tool UI.
   *
   * @returns {object|undefined} The value.
   */
  getValue() {
    // example annotation meta data added at draw time
    // (not sure of the concept-value association)
    const concept0 = new DicomCode('Processing type');
    concept0.schemeDesignator = 'DCM';
    concept0.value = '111701';
    const value0 = new DicomCode('Manual Processing');
    value0.schemeDesignator = 'DCM';
    value0.value = '123109';
    // example draw meta validator
    const drawMetaValidator = function (/*meta*/) {
      //return meta.StationName === 'web browser';
      return true;
    };
    // example ref meta validator
    const refMetaValidator = function (/*meta*/) {
      //return meta.Modality === 'CT';
      return true;
    };
    return {
      shapeName: this.#shapeName,
      annotationMeta: [
        {concept: concept0, value: value0}
      ],
      annotationGroupMeta: [
        // {concept: 'StationName', value: 'web browser'}
      ],
      drawMetaValidator,
      refMetaValidator
    };
  };

  /**
   * Merge the tool button with a shape menu: the button displays
   * the selected shape, selecting a shape in the menu updates
   * the button text and presses it.
   *
   * @param {HTMLButtonElement} toolButton The tool button.
   * @returns {HTMLElement} The tool button with its shape menu.
   */
  getToolButtonHtml(toolButton) {
    const shapeNames = this.#toolConfig.options;
    if (typeof shapeNames === 'undefined') {
      return toolButton;
    }
    toolButton.textContent = `Draw: ${this.#shapeName}`;
    const onSelect = (shapeName) => {
      this.#shapeName = shapeName;
      toolButton.textContent = `Draw: ${shapeName}`;
    };
    return getSplitButton(
      toolButton, shapeNames, onSelect, 'shape-', 'Select shape');
  };

  /**
   * Get the HTML element of the tool UI.
   *
   * @returns {HTMLElement|undefined} The element.
   */
  getHtml() {
    const autoColourInput = document.createElement('input');
    autoColourInput.type = 'checkbox';
    autoColourInput.id = 'draw-auto-colour';
    autoColourInput.checked = false;

    const autoLabel = document.createElement('label');
    autoLabel.htmlFor = autoColourInput.id;
    autoLabel.appendChild(document.createTextNode('auto colour'));

    const colourInput = document.createElement('input');
    colourInput.type = 'color';
    colourInput.id = 'draw-colour-chooser';
    colourInput.value = '#ffff80';

    autoColourInput.onchange = (event) => {
      const element = event.target;
      this.#service.setToolFeatures({autoShapeColour: element.checked});
      colourInput.disabled = element.checked;
    };

    colourInput.onchange = (event) => {
      const element = event.target;
      this.#service.setToolFeatures({shapeColour: element.value});
    };

    const res = document.createElement('span');
    res.id = 'toolFeatures';
    res.className = 'toolFeatures';
    res.appendChild(autoColourInput);
    res.appendChild(autoLabel);
    res.appendChild(colourInput);

    return res;
  };

}; // DrawToolUI
