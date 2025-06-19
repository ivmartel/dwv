import {DrawController} from '../../src/app/drawController.js';
import {
  AnnotationGroupFactory
} from '../../src/image/annotationGroupFactory.js';
import {
  getUID,
  DicomWriter
} from '../../src/dicom/dicomWriter.js';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../../src/app/application.js';
import {AnnotationGroup} from '../../src/image/annotationGroup.js';
/* eslint-enable no-unused-vars */

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
  const suffix = 'annotation' + annotation.trackingUid;
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
 * Annotation UI.
 */
export class AnnotationUI {

  /**
   * The associated application.
   *
   * @type {App}
   */
  #app;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
  }

  /**
   * Bind app to ui.
   */
  registerListeners() {
    this.#app.addEventListener('dataadd', this.#onDataAdd);
    this.#app.addEventListener('drawlayeradd', this.#onDrawLayerAdd);
    this.#app.addEventListener('annotationadd', this.#onAnnotationAdd);
    this.#app.addEventListener('annotationupdate', this.#onAnnotationUpdate);
    this.#app.addEventListener('annotationremove', this.#onAnnotationRemove);
  };

  /**
   * Setup the html for the annotation list.
   */
  #setupHtml() {
    // add annotation group button
    const addItem = document.createElement('li');
    addItem.id = 'addannotationgroupitem';
    const addAnnotationGroupButton = document.createElement('button');
    addAnnotationGroupButton.appendChild(
      document.createTextNode('Add annotation group'));
    addAnnotationGroupButton.onclick = () => {
      const divId = 'layerGroup0';
      const layerGroup = this.#app.getLayerGroupByDivId(divId);
      // add annotation group
      const viewLayer = layerGroup.getActiveViewLayer();
      if (typeof viewLayer === 'undefined') {
        console.warn(
          'No active view layer, please select one in the data table'
        );
        return;
      }
      const refDataId = viewLayer.getDataId();
      const data = this.#app.createAnnotationData(refDataId);
      // render (will create draw layer)
      this.#app.addAndRenderAnnotationData(data, divId, refDataId);
      // item is added to the UI by the 'dataadd' listener
    };
    addItem.appendChild(addAnnotationGroupButton);

    // annotation list
    const annotList = document.createElement('ul');
    annotList.id = 'annotationgroup-list';
    annotList.appendChild(addItem);

    // fieldset
    const legend = document.createElement('legend');
    legend.appendChild(document.createTextNode('Annotation Groups'));
    const fieldset = document.createElement('fieldset');
    fieldset.appendChild(legend);
    fieldset.appendChild(annotList);

    // main div
    const line = document.createElement('div');
    line.id = 'annotationgroups-line';
    line.className = 'line';
    line.appendChild(fieldset);

    // insert
    const detailsEl = document.getElementById('layersdetails');
    detailsEl.parentElement.insertBefore(line, detailsEl);
  }

  /**
   * Get the annotation html.
   *
   * @param {Annotation} annotation The annotation.
   * @param {string} dataId The annotation group dataId.
   * @returns {HTMLSpanElement} The HTMl element.
   */
  #getAnnotationHtml(annotation, dataId) {
    const annotationDivId = getAnnotationDivId(annotation, dataId);

    const inputColour = document.createElement('input');
    inputColour.type = 'color';
    inputColour.title = 'Change annotation colour';
    const inputColourPrefix = 'cb-';
    inputColour.id = inputColourPrefix + annotationDivId;
    inputColour.value = annotation.colour;
    inputColour.onchange = (event) => {
      const target = event.target;
      const newColour = target.value;
      // get annotation
      const indices =
        splitAnnotationDivId(target.id.substring(inputColourPrefix.length));
      const dataId = indices.dataId;
      const annotationId = indices.annotationId;
      const annotationGroup = this.#app.getData(dataId).annotationGroup;
      const annotation = annotationGroup.find(annotationId);
      // update
      if (newColour !== annotation.colour) {
        const drawController = new DrawController(annotationGroup);
        drawController.updateAnnotationWithCommand(
          annotationId,
          {colour: annotation.colour},
          {colour: newColour},
          this.#app.addToUndoStack
        );
      }
    };

    const gotoButton = document.createElement('button');
    const gbIdPrefix = 'gotob-';
    gotoButton.id = gbIdPrefix + annotationDivId;
    gotoButton.title = 'Goto annotation';
    gotoButton.appendChild(document.createTextNode('\u{1F3AF}'));
    gotoButton.onclick = (event) => {
      const target = event.target;
      // get annotation
      const indices =
        splitAnnotationDivId(target.id.substring(gbIdPrefix.length));
      const dataId = indices.dataId;
      const annotationId = indices.annotationId;
      const annotationGroup = this.#app.getData(dataId).annotationGroup;
      const annotation = annotationGroup.find(annotationId);
      const annotCentroid = annotation.getCentroid();
      if (typeof annotCentroid !== 'undefined') {
        const drawLayers = this.#app.getDrawLayersByDataId(dataId);
        for (const layer of drawLayers) {
          layer.setCurrentPosition(annotCentroid);
        }
      } else {
        console.log('No centroid for annotation');
      }
    };

    const viewButton = document.createElement('button');
    viewButton.style.borderStyle = 'outset';
    const vbIdPrefix = 'vb-';
    viewButton.id = vbIdPrefix + annotationDivId;
    viewButton.title = 'Show/hide annotation';
    viewButton.appendChild(document.createTextNode('\u{1F441}\u{FE0F}'));
    viewButton.onclick = (event) => {
      const target = event.target;
      // get annotatio
      const indices =
        splitAnnotationDivId(target.id.substring(vbIdPrefix.length));
      const dataId = indices.dataId;
      const annotationId = indices.annotationId;
      const drawLayers = this.#app.getDrawLayersByDataId(dataId);
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
    deleteButton.onclick = (event) => {
      const target = event.target;
      // get segment and mask
      const indices =
        splitAnnotationDivId(target.id.substring(dbIdPrefix.length));
      const dataId = indices.dataId;
      const annotationId = indices.annotationId;
      // delete if possible
      const drawController = new DrawController(
        this.#app.getData(dataId).annotationGroup);
      drawController.removeAnnotationWithCommand(
        annotationId,
        this.#app.addToUndoStack
      );
    };

    // disable/enable buttons if group is editable or not
    const annotationGroup = this.#app.getData(dataId).annotationGroup;
    annotationGroup.addEventListener(
      'annotationgroupeditablechange', function (event) {
        const disabled = !event.data;
        inputColour.disabled = disabled;
        deleteButton.disabled = disabled;
      }
    );

    const span = document.createElement('span');
    span.id = 'span-' + annotationDivId;
    let factoryName = 'unknown';
    if (typeof annotation.getFactory() !== 'undefined') {
      factoryName = annotation.getFactory().getName();
    }
    span.appendChild(document.createTextNode(
      annotation.trackingId + ' (' + factoryName + ')'));
    span.appendChild(inputColour);
    span.appendChild(gotoButton);
    span.appendChild(viewButton);
    span.appendChild(deleteButton);

    return span;
  }

  /**
   * Get an annotation group html.
   *
   * @param {AnnotationGroup} annotationGroup The annotation group.
   * @param {string} dataId The annotation group dataId.
   * @returns {HTMLIement} The annotation list element.
   */
  #getAnnotationGroupHtml(annotationGroup, dataId) {
    const item = document.createElement('li');
    item.id = 'li-' + getAnnotationGroupDivId(dataId);

    const lockButton = document.createElement('button');
    lockButton.style.borderStyle = 'outset';
    lockButton.id = 'lockb-' + getAnnotationGroupDivId(dataId);
    lockButton.appendChild(document.createTextNode('\u{1F512}'));
    lockButton.onclick = function (event) {
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
    item.appendChild(lockButton);

    // save segment button
    const saveButton = document.createElement('button');
    saveButton.appendChild(document.createTextNode('\u{1F4BE}'));
    saveButton.title = 'Save annnotation group';
    saveButton.onclick = function () {
      const factory = new AnnotationGroupFactory();
      const sopUID = getUID('SOPInstanceUID');
      const extraTags = {
        MediaStorageSOPInstanceUID: sopUID,
        SOPInstanceUID: sopUID,
        InstanceNumber: 123,
        SeriesInstanceUID: getUID('SeriesInstanceUID'),
        SeriesNumber: 123,
        SeriesDescription: 'Annnotation made with dwv',
      };
      const dicomElements = factory.toDicom(annotationGroup, extraTags);
      // write
      const writer = new DicomWriter();
      let dicomBuffer = null;
      try {
        dicomBuffer = writer.getBuffer(dicomElements);
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
      const blob = new Blob([dicomBuffer], {type: 'application/dicom'});
      saveButton.href = window.URL.createObjectURL(blob);

      // temporary link to download
      const element = document.createElement('a');
      element.href = window.URL.createObjectURL(blob);
      element.download = 'dicom-sr-' + dataId + '.dcm';
      // trigger download
      element.click();
      URL.revokeObjectURL(element.href);
    };
    item.appendChild(saveButton);

    const hideLabelsButton = document.createElement('button');
    hideLabelsButton.style.borderStyle = 'outset';
    hideLabelsButton.id = 'b-hidelabels';
    hideLabelsButton.title = 'Show/hide annotation labels';
    hideLabelsButton.appendChild(document.createTextNode('\u{1F3F7}\u{FE0F}'));
    hideLabelsButton.onclick = (event) => {
      const target = event.target;
      const drawLayer = this.#app.getDrawLayersByDataId(dataId)[0];
      if (typeof drawLayer === 'undefined') {
        console.warn('Cannot find draw layer with id ' + dataId);
      }
      const isPressed = target.style.borderStyle === 'inset';
      if (isPressed) {
        target.style.borderStyle = 'outset';
        drawLayer.setLabelsVisibility(true);
      } else {
        target.style.borderStyle = 'inset';
        drawLayer.setLabelsVisibility(false);
      }
    };
    item.appendChild(hideLabelsButton);

    for (const annotation of annotationGroup.getList()) {
      item.appendChild(this.#getAnnotationHtml(annotation, dataId));
    }

    return item;
  };

  /**
   * Handle 'dataadd' event.
   *
   * @param {object} event The event.
   */
  #onDataAdd = (event) => {
    const data = this.#app.getData(event.dataid);
    const ag = data.annotationGroup;
    if (typeof ag !== 'undefined') {
      // setup html if needed
      if (!document.getElementById('annotationgroup-list')) {
        this.#setupHtml();
      }
      // annotation group as html
      const item = this.#getAnnotationGroupHtml(ag, event.dataid);
      // add annotation group item
      const addItem = document.getElementById('addannotationgroupitem');
      // remove and add after to make it last item
      addItem.remove();

      // update list
      const annotList = document.getElementById('annotationgroup-list');
      annotList.appendChild(item);
      annotList.appendChild(addItem);
    }
  };

  /**
   * Handle 'drawlayeradd' event.
   *
   * @param {object} event The event.
   */
  #onDrawLayerAdd = (event) => {
    const dataId = event.dataid;
    const annotationGroup = this.#app.getData(dataId).annotationGroup;
    // strike through non viewable annotations
    for (const annotation of annotationGroup.getList()) {
      let textDecoration = '';
      if (!annotation.canView()) {
        textDecoration = 'line-through';
      }
      const annotationDivId =
        'span-' + getAnnotationDivId(annotation, dataId);
      const item = document.getElementById(annotationDivId);
      if (item) {
        item.style['text-decoration-line'] = textDecoration;
      }
    }
  };

  /**
   * Handle 'annotationadd' event.
   *
   * @param {object} event The event.
   */
  #onAnnotationAdd = (event) => {
    const annotation = event.data;
    const dataId = event.dataid;
    // add annotation html to list
    const annotationGroupDivId = 'li-' + getAnnotationGroupDivId(dataId);
    const item = document.getElementById(annotationGroupDivId);
    item.appendChild(this.#getAnnotationHtml(annotation, dataId));
  };

  /**
   * Handle 'annotationupdate' event.
   *
   * @param {object} event The event.
   */
  #onAnnotationUpdate = (event) => {
    const annotation = event.data;
    const dataId = event.dataid;
    const keys = event.keys;

    if (typeof keys !== 'undefined') {
      const annotationDivId = getAnnotationDivId(annotation, dataId);
      // update colour input
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
  #onAnnotationRemove = (event) => {
    const annotation = event.data;
    const dataId = event.dataid;
    // remove annotation from list
    const annotationDivId = 'span-' + getAnnotationDivId(annotation, dataId);
    const item = document.getElementById(annotationDivId);
    item.remove();
  };

}; // AnnotationUI
