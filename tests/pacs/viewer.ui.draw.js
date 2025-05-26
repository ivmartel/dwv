import {DicomCode} from '../../src/dicom/dicomCode.js';

/**
 * Draw tool UI.
 */
export class DrawToolUI {

  #app;
  #toolConfig;

  /**
   * @param {object} app The associated application.
   * @param {object} toolConfig The tood configuration.
   */
  constructor(app, toolConfig) {
    this.#app = app;
    this.#toolConfig = toolConfig;
  }

  getValue() {
    const shapeSelect = document.getElementById('draw-shape-select');
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
      shapeName: shapeSelect.value,
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

  getHtml() {
    const shapeSelect = document.createElement('select');
    shapeSelect.id = 'draw-shape-select';

    const shapeNames = this.#toolConfig.options;
    if (typeof shapeNames === 'undefined') {
      return;
    }

    for (const shapeName of shapeNames) {
      const opt = document.createElement('option');
      opt.id = 'shape-' + shapeName;
      opt.value = shapeName;
      opt.appendChild(document.createTextNode(shapeName));
      shapeSelect.appendChild(opt);
    }

    shapeSelect.onchange = (event) => {
      const element = event.target;
      this.#app.setToolFeatures({shapeName: element.value});
    };

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
      this.#app.setToolFeatures({autoShapeColour: element.checked});
      colourInput.disabled = element.checked;
    };

    colourInput.onchange = (event) => {
      const element = event.target;
      this.#app.setToolFeatures({shapeColour: element.value});
    };

    const res = document.createElement('span');
    res.id = 'toolFeatures';
    res.className = 'toolFeatures';
    res.appendChild(shapeSelect);
    res.appendChild(autoColourInput);
    res.appendChild(autoLabel);
    res.appendChild(colourInput);

    return res;
  };

}; // DrawToolUI
