// Do not warn if these variables were not defined before.

// namespace
// eslint-disable-next-line no-var
var test = test || {};
test.toolFeaturesUI = test.toolFeaturesUI || {};

/**
 * Draw tool features.
 *
 * @param {object} app The associated application.
 * @param {object} toolConfig The tood configuration.
 */
test.toolFeaturesUI.Draw = function (app, toolConfig) {

  this.getValue = function () {
    const shapeSelect = document.getElementById('draw-shape-select');
    return {
      shapeName: shapeSelect.value
    };
  };

  this.getHtml = function () {
    const shapeSelect = document.createElement('select');
    shapeSelect.id = 'draw-shape-select';

    const shapeNames = toolConfig.options;
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

    shapeSelect.onchange = function (event) {
      const element = event.target;
      app.setToolFeatures({shapeName: element.value});
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

    autoColourInput.onchange = function (event) {
      const element = event.target;
      app.setToolFeatures({autoShapeColour: element.checked});
      colourInput.disabled = element.checked;
    };

    colourInput.onchange = function (event) {
      const element = event.target;
      app.setToolFeatures({shapeColour: element.value});
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

}; // test.toolFeaturesUI.Draw
