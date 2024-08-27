// Do not warn if these variables were not defined before.
/* global dwv */

// namespace
// eslint-disable-next-line no-var
var test = test || {};
test.toolFeaturesUI = test.toolFeaturesUI || {};

/**
 * Get the annotation group divId.
 *
 * @param {string} dataId The data ID.
 * @returns {string} The divId.
 */
function getAnnotationGroupDivId(dataId) {
  return 'annotationgroup' + dataId;
}

/**
 * Get the annotation divId.
 *
 * @param {Annotation} annotation The annotation.
 * @param {string} dataId The data ID.
 * @returns {string} The divId.
 */
function getAnnotationDivId(annotation, dataId) {
  const prefix = getAnnotationGroupDivId(dataId);
  const suffix = 'annotation' + annotation.id;
  return prefix + '-' + suffix;
}

/**
 * Split a divId to get dataId and annotationId.
 *
 * @param {string} divId The divId.
 * @returns {object} The data and annotation ID.
 */
function splitAnnotationDivId(divId) {
  const split = divId.split('-');
  const prefixStrSize = 'annotationgroup'.length;
  const suffixStrSize = 'annotation'.length;
  return {
    dataId: split[0].substring(prefixStrSize),
    annotationId: split[1].substring(suffixStrSize)
  };
}

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
    autoColourInput.checked = true;

    const autoLabel = document.createElement('label');
    autoLabel.htmlFor = autoColourInput.id;
    autoLabel.appendChild(document.createTextNode('auto colour'));

    const colourInput = document.createElement('input');
    colourInput.type = 'color';
    colourInput.id = 'draw-colour-chooser';
    colourInput.value = '#ffff80';
    colourInput.disabled = true;

    autoColourInput.onchange = function (event) {
      const element = event.target;
      app.setToolFeatures({autoShapeColour: element.checked});
      colourInput.disabled = element.checked;
    };

    colourInput.onchange = function (event) {
      const element = event.target;
      app.setToolFeatures({shapeColour: element.value});
    };

    const hideLabelsButton = document.createElement('button');
    hideLabelsButton.style.borderStyle = 'outset';
    hideLabelsButton.id = 'b-hidelabels';
    hideLabelsButton.title = 'Show/hide annotation labels';
    hideLabelsButton.appendChild(document.createTextNode('\u{1F441}\u{FE0F}'));
    hideLabelsButton.onclick = function (event) {
      const target = event.target;
      const dl = app.getActiveLayerGroup().getActiveDrawLayer();
      const isPressed = target.style.borderStyle === 'inset';
      if (isPressed) {
        target.style.borderStyle = 'outset';
        if (typeof dl !== 'undefined') {
          dl.setLabelsVisibility(true);
        }
      } else {
        target.style.borderStyle = 'inset';
        if (typeof dl !== 'undefined') {
          dl.setLabelsVisibility(false);
        }
      }
    };

    const res = document.createElement('span');
    res.id = 'toolFeatures';
    res.className = 'toolFeatures';
    res.appendChild(shapeSelect);
    res.appendChild(autoColourInput);
    res.appendChild(autoLabel);
    res.appendChild(colourInput);
    res.appendChild(hideLabelsButton);

    // loop on segmentations
    const annotDataids = [];
    for (const dataId of app.getDataIds()) {
      if (typeof app.getData(dataId) !== 'undefined' &&
        typeof app.getData(dataId).annotationGroup !== 'undefined') {
        annotDataids.push(dataId);
      }
    }
    const annotList = document.createElement('ul');
    annotList.id = 'annotation-list';

    if (annotDataids.length !== 0) {
      for (const dataId of annotDataids) {
        const segmentationItem = getAnnotationGroupHtml(
          app.getData(dataId).annotationGroup, dataId);
        annotList.appendChild(segmentationItem);
      }
    }

    // extra item for add annotation group button
    const addItem = document.createElement('li');
    const addAnnotationGroupButton = document.createElement('button');
    addAnnotationGroupButton.appendChild(
      document.createTextNode('Add annotation group'));
    addAnnotationGroupButton.onclick = function (event) {
      // remove list item
      event.target.parentElement.remove();

      const divId = 'layerGroup0';
      const layerGroup = app.getLayerGroupByDivId(divId);

      // add annotation group
      const viewLayer = layerGroup.getActiveViewLayer();
      const refDataId = viewLayer.getDataId();
      const data = app.createAnnotationData(refDataId);
      // render (will create draw layer)
      app.addAndRenderAnnotationData(data, divId, refDataId);

      // update UI
      // item is added by the 'dataadd' listener
      // put back list item
      annotList.appendChild(event.target.parentElement);
    };
    addItem.appendChild(addAnnotationGroupButton);
    annotList.appendChild(addItem);

    res.appendChild(annotList);

    return res;
  };

  this.registerListeners = function () {
    app.addEventListener('dataadd', function (event) {
      console.log('dataadd', event);
      const data = app.getData(event.dataid);
      const ag = data.annotationGroup;
      if (typeof ag !== 'undefined') {
        addNewAnnotationGroupHtml(ag, event.dataid);
        const alist = ag.getList();
        for (const a of alist) {
          console.log('annotation', a);
          console.log('quantification', a.quantification);
        }
      }
    });

    app.addEventListener('annotationadd', onAnnotationAdd);
    app.addEventListener('annotationupdate', onAnnotationUpdate);
    app.addEventListener('annotationremove', onAnnotationRemove);
  };

  /**
   * Get the annotation html.
   *
   * @param {Annotation} annotation The annotation.
   * @param {string} dataId The annotation group dataId.
   * @returns {HTMLSpanElement} The HTMl element.
   */
  function getAnnotationHtml(annotation, dataId) {
    const annotationDivId = getAnnotationDivId(annotation, dataId);

    const inputColour = document.createElement('input');
    inputColour.type = 'color';
    inputColour.title = 'Change annotation colour';
    const inputColourPrefix = 'cb-';
    inputColour.id = inputColourPrefix + annotationDivId;
    inputColour.value = annotation.colour;
    inputColour.onchange = function (event) {
      const target = event.target;
      const newColour = target.value;
      // get annotatio
      const indices =
        splitAnnotationDivId(target.id.substring(inputColourPrefix.length));
      const dataId = indices.dataId;
      const annotationId = indices.annotationId;
      const annotationGroup = app.getData(dataId).annotationGroup;
      const annotation = annotationGroup.find(annotationId);
      // update
      if (newColour !== annotation.colour) {
        const drawController = new dwv.DrawController(annotationGroup);
        drawController.updateAnnotationWithCommand(
          annotationId,
          {colour: annotation.colour},
          {colour: newColour},
          app.addToUndoStack
        );
      }
    };

    const viewButton = document.createElement('button');
    viewButton.style.borderStyle = 'outset';
    const vbIdPrefix = 'vb-';
    viewButton.id = vbIdPrefix + annotationDivId;
    viewButton.title = 'Show/hide annotation';
    viewButton.appendChild(document.createTextNode('\u{1F441}\u{FE0F}'));
    viewButton.onclick = function (event) {
      const target = event.target;
      // get annotatio
      const indices =
        splitAnnotationDivId(target.id.substring(vbIdPrefix.length));
      const dataId = indices.dataId;
      const annotationId = indices.annotationId;
      const drawLayers = app.getDrawLayersByDataId(dataId);
      // toggle hidden
      const isPressed = target.style.borderStyle === 'inset';
      if (isPressed) {
        target.style.borderStyle = 'outset';
        for (const layer of drawLayers) {
          layer.setAnnotationVisibility(annotationId, true);
        }
      } else {
        target.style.borderStyle = 'inset';
        for (const layer of drawLayers) {
          layer.setAnnotationVisibility(annotationId, false);
        }
      }
    };

    const deleteButton = document.createElement('button');
    const dbIdPrefix = 'db-';
    deleteButton.id = dbIdPrefix + annotationDivId;
    deleteButton.title = 'Delete annotation';
    deleteButton.appendChild(document.createTextNode('\u{274C}'));
    deleteButton.onclick = function (event) {
      const target = event.target;
      // get segment and mask
      const indices =
        splitAnnotationDivId(target.id.substring(dbIdPrefix.length));
      const dataId = indices.dataId;
      const annotationId = indices.annotationId;
      // delete if possible
      const drawController = new dwv.DrawController(
        app.getData(dataId).annotationGroup);
      drawController.removeAnnotationWithCommand(
        annotationId,
        app.addToUndoStack
      );
    };

    const span = document.createElement('span');
    span.id = 'span-' + annotationDivId;
    span.appendChild(document.createTextNode(
      annotation.id + ' (' + annotation.getType() + ')'));
    span.appendChild(inputColour);
    span.appendChild(viewButton);
    span.appendChild(deleteButton);

    return span;
  }

  /**
   * Get the annotation group html item.
   *
   * @param {AnnotationGroup} annotationGroup The annotation group.
   * @param {string} dataId The annotation group dataId.
   * @returns {HTMLLIElement} The html item element.
   */
  function getAnnotationGroupHtmlItem(annotationGroup, dataId) {
    const item = document.createElement('li');
    item.id = 'li-' + getAnnotationGroupDivId(dataId);

    const editButton = document.createElement('button');
    editButton.style.borderStyle = 'outset';
    editButton.id = 'eb-' + getAnnotationGroupDivId(dataId);
    editButton.appendChild(document.createTextNode('\u{1F512}'));
    editButton.onclick = function (event) {
      const target = event.target;
      // toggle hidden
      const isPressed = target.style.borderStyle === 'inset';
      if (isPressed) {
        target.style.borderStyle = 'outset';
        if (typeof annotationGroup !== 'undefined') {
          annotationGroup.setEditable(true);
        }
      } else {
        target.style.borderStyle = 'inset';
        if (typeof annotationGroup !== 'undefined') {
          annotationGroup.setEditable(false);
        }
      }
    };
    item.appendChild(editButton);

    return item;
  }

  /**
   * Get the annotation group html item with its annotations.
   *
   * @param {AnnotationGroup} annotationGroup The annotation group.
   * @param {string} dataId The annotation group dataId.
   * @returns {HTMLLIElement} The html item element.
   */
  function getAnnotationGroupHtml(annotationGroup, dataId) {
    const item = getAnnotationGroupHtmlItem(annotationGroup, dataId);

    for (const annotation of annotationGroup.getList()) {
      item.appendChild(getAnnotationHtml(annotation, dataId));
    }

    return item;
  }

  /**
   * Set a new annotation group html item.
   *
   * @param {AnnotationGroup} annotationGroup The annotation group.
   * @param {string} dataId The annotation group dataId.
   */
  function addNewAnnotationGroupHtml(annotationGroup, dataId) {
    const spanFeatures = document.getElementById('toolFeatures');
    if (spanFeatures) {
      const annotList = document.getElementById('annotation-list');
      const item = getAnnotationGroupHtmlItem(annotationGroup, dataId);
      annotList.appendChild(item);
      spanFeatures.appendChild(annotList);
    }
  };

  /**
   * Handle 'annotationadd' event.
   *
   * @param {object} event The event.
   */
  function onAnnotationAdd(event) {
    const annotation = event.data;
    const dataId = event.dataid;

    const annotationGroupDivId = 'li-' + getAnnotationGroupDivId(dataId);
    const item = document.getElementById(annotationGroupDivId);
    item.appendChild(getAnnotationHtml(annotation, dataId));
  };

  /**
   * Handle 'annotationupdate' event.
   *
   * @param {object} event The event.
   */
  function onAnnotationUpdate(event) {
    const annotation = event.data;
    const dataId = event.dataid;
    const keys = event.keys;

    if (typeof keys !== 'undefined') {
      const annotationDivId = getAnnotationDivId(annotation, dataId);
      if (keys.includes('colour')) {
        const inputColour = document.getElementById('cb-' + annotationDivId);
        inputColour.value = annotation.colour;
      }
    }
  };

  /**
   * Handle 'annotationremove' event.
   *
   * @param {object} event The event.
   */
  function onAnnotationRemove(event) {
    const annotation = event.data;
    const dataId = event.dataid;

    const annotationDivId = 'span-' + getAnnotationDivId(annotation, dataId);
    const item = document.getElementById(annotationDivId);
    item.remove();
  };

}; // test.toolFeaturesUI.Draw
