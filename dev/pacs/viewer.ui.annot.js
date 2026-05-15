import {DrawController} from '../../src/app/drawController.js';
import {
  AnnotationGroupFactory
} from '../../src/image/annotationGroupFactory.js';
import {
  getUID,
  DicomWriter
} from '../../src/dicom/dicomWriter.js';
import {i18n} from '../../src/utils/i18n.js';
import {
  getIconElement,
  getButton,
  setButtonPressed,
  isButtonPressed
} from './viewer.ui.icons.js';

/**
 * @import {App} from '../../src/app/application.js';
 * @import {Annotation} from '../../src/image/annotation.js';
 * @import {AnnotationGroup} from '../../src/image/annotationGroup.js';
 */

/**
 * Get the annotation group divId.
 *
 * @param {string} dataId The data ID.
 * @returns {string} The divId.
 */
function getAnnotationGroupDivId(dataId) {
  return `annotationgroup${dataId}`;
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
  const suffix = `annotation${annotation.trackingUid}`;
  return `${prefix}-${suffix}`;
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
   * The root document.
   *
   * @type {Document}
   */
  #rootDoc = document;

  /**
   * @param {App} app The associated application.
   * @param {Document} [rootDoc] Optional root document,
   *   defaults to `window.document`.
   */
  constructor(app, rootDoc) {
    this.#app = app;
    if (typeof rootDoc !== 'undefined') {
      this.#rootDoc = rootDoc;
    }
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
   * Setup the container div.
   */
  #setupContainerDiv() {
    // fieldset
    const legend = document.createElement('legend');
    legend.appendChild(document.createTextNode('Annotation Groups'));

    const fieldset = document.createElement('fieldset');
    fieldset.id = 'annotationgroups-fieldset';
    fieldset.appendChild(legend);

    // main div
    const line = document.createElement('div');
    line.id = 'annotationgroups-line';
    line.className = 'line';
    line.appendChild(fieldset);

    // insert
    const detailsEl = this.#rootDoc.getElementById('layersdetails');
    detailsEl.parentElement.insertBefore(line, detailsEl);
  }

  /**
   * Get the container div.
   *
   * @returns {HTMLDivElement} The element.
   */
  #getContainerDiv() {
    return this.#rootDoc.getElementById('annotationgroups-fieldset');
  }

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
      const stgCtrl = this.#app.getStageController();
      const layerGroup = stgCtrl.getLayerGroupByDivId(divId);
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
    annotList.className = 'data-list';
    annotList.appendChild(addItem);

    // setup and append
    this.#setupContainerDiv();
    this.#getContainerDiv().appendChild(annotList);
  }

  /**
   * Get the annotation html.
   *
   * @param {Annotation} annotation The annotation.
   * @param {string} dataId The annotation group dataId.
   * @returns {HTMLLIElement} The HTMl element.
   */
  #getAnnotationHtml(annotation, dataId) {
    const annotationDivId = getAnnotationDivId(annotation, dataId);

    const infoButton = getButton('Info');
    const ibIdPrefix = 'ib-';
    infoButton.id = ibIdPrefix + annotationDivId;
    infoButton.title = 'Information';
    infoButton.onclick = (event) => {
      // do not propagate to parent that triggers goto
      event.stopPropagation();
      const target = event.target;
      // get annotatio
      const indices =
        splitAnnotationDivId(target.id.substring(vbIdPrefix.length));
      const clkDataId = indices.dataId;
      const annotationId = indices.annotationId;
      const annotationGroup = this.#app.getData(clkDataId).annotationGroup;
      const clkAnnotation = annotationGroup.find(annotationId);

      let qStr = 'Quantification:\n';
      if (typeof clkAnnotation.quantification !== 'undefined') {
        const keys = Object.keys(clkAnnotation.quantification);
        for (const key of keys) {
          const quant = clkAnnotation.quantification[key];
          qStr += `- ${key}: ${quant.value.toPrecision(4)}`;
          if (typeof quant.unit !== 'undefined') {
            qStr += i18n.t(quant.unit);
          }
          qStr += '\n';
        }
      } else {
        qStr = 'No quantification.';
      }
      alert(qStr);
    };

    const inputColour = document.createElement('input');
    inputColour.type = 'color';
    inputColour.title = 'Change annotation colour';
    const inputColourPrefix = 'cb-';
    inputColour.id = inputColourPrefix + annotationDivId;
    inputColour.value = annotation.colour;
    inputColour.onclick = (event) => {
      // do not propagate to parent that triggers goto
      event.stopPropagation();
    };
    inputColour.onchange = (event) => {
      const target = event.target;
      const newColour = target.value;
      // get annotation
      const indices =
        splitAnnotationDivId(target.id.substring(inputColourPrefix.length));
      const chgDataId = indices.dataId;
      const annotationId = indices.annotationId;
      const annotationGroup = this.#app.getData(chgDataId).annotationGroup;
      const chgAnnotation = annotationGroup.find(annotationId);
      // update
      if (newColour !== chgAnnotation.colour) {
        const drawController = new DrawController(annotationGroup);
        drawController.updateAnnotationWithCommand(
          annotationId,
          {colour: chgAnnotation.colour},
          {colour: newColour},
          this.#app.addToUndoStack
        );
      }
    };

    const viewButton = getButton('View');
    setButtonPressed(viewButton, false);
    const vbIdPrefix = 'vb-';
    viewButton.id = vbIdPrefix + annotationDivId;
    viewButton.title = 'Show/hide annotation';
    viewButton.onclick = (event) => {
      // do not propagate to parent (triggers goto)
      event.stopPropagation();
      const target = event.target;
      // get annotatio
      const indices =
        splitAnnotationDivId(target.id.substring(vbIdPrefix.length));
      const clkDataId = indices.dataId;
      const annotationId = indices.annotationId;
      const drawLayers =
        this.#app.getStageController().getDrawLayersByDataId(clkDataId);
      // toggle hidden
      if (isButtonPressed(target)) {
        setButtonPressed(target, false);
        for (const layer of drawLayers) {
          layer.setAnnotationVisibility(annotationId, true);
        }
      } else {
        setButtonPressed(target, true);
        for (const layer of drawLayers) {
          layer.setAnnotationVisibility(annotationId, false);
        }
      }
    };

    const deleteButton = getButton('Delete');
    const dbIdPrefix = 'db-';
    deleteButton.id = dbIdPrefix + annotationDivId;
    deleteButton.title = 'Delete annotation';
    deleteButton.onclick = (event) => {
      // do not propagate to parent (triggers goto)
      event.stopPropagation();
      const target = event.target;
      // get segment and mask
      const indices =
        splitAnnotationDivId(target.id.substring(dbIdPrefix.length));
      const clkDataId = indices.dataId;
      const annotationId = indices.annotationId;
      // delete if possible
      const drawController = new DrawController(
        this.#app.getData(clkDataId).annotationGroup);
      // TODO reposition div at same position after delete undo?
      drawController.removeAnnotationWithCommand(
        annotationId,
        this.#app.addToUndoStack
      );
    };

    // disable/enable buttons if group is editable or not
    const annotationGroup = this.#app.getData(dataId).annotationGroup;
    annotationGroup.addEventListener(
      'annotationgroupeditablechange', function (event) {
        const disabled = !event.detail.data;
        inputColour.disabled = disabled;
        deleteButton.disabled = disabled;
      }
    );

    // content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'data-item-list-item-content';
    let factoryName = 'unknown';
    if (typeof annotation.getFactory() !== 'undefined') {
      factoryName = annotation.getFactory().getName();
    }
    contentDiv.appendChild(getIconElement(factoryName));
    contentDiv.appendChild(document.createTextNode(
      ` ${annotation.trackingId}`));

    // actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'data-item-list-item-actions';
    actionsDiv.appendChild(infoButton);
    actionsDiv.appendChild(inputColour);
    actionsDiv.appendChild(viewButton);
    actionsDiv.appendChild(deleteButton);

    // list item
    const item = document.createElement('li');
    item.id = annotationDivId;
    item.className = 'data-item-list-item';
    item.appendChild(contentDiv);
    item.appendChild(actionsDiv);
    item.title = 'Go to annotation';

    // click on li to go to annotation
    item.addEventListener('click', (event) => {
      const target = event.currentTarget;

      // remove selected class from other rows
      const mainlist = this.#rootDoc.getElementById('annotationgroup-list');
      const items = mainlist.querySelectorAll('.data-item-list-item');
      items.forEach(item2 => item2.classList.remove('selected'));
      // mark this row as selected
      target.classList.add('selected');

      // get annotation
      const indices = splitAnnotationDivId(target.id);
      const clkDataId = indices.dataId;
      const annotationId = indices.annotationId;
      const clkAnnotationGroup = this.#app.getData(clkDataId).annotationGroup;
      const clkAnnotation = clkAnnotationGroup.find(annotationId);
      const annotCentroid = clkAnnotation.getCentroid();
      if (typeof annotCentroid !== 'undefined') {
        const drawLayers =
          this.#app.getStageController().getDrawLayersByDataId(clkDataId);
        for (const layer of drawLayers) {
          layer.setCurrentPosition(annotCentroid);
        }
      } else {
        console.log('No centroid for annotation');
      }
    });

    return item;
  }

  /**
   * Get an annotation group html.
   *
   * @param {AnnotationGroup} annotationGroup The annotation group.
   * @param {string} dataId The annotation group dataId.
   * @returns {HTMLIement} The annotation list element.
   */
  #getAnnotationGroupHtml(annotationGroup, dataId) {
    // name
    const nameDiv = document.createElement('span');
    nameDiv.id = `${getAnnotationGroupDivId(dataId)}-name`;
    nameDiv.className = 'data-item-name';
    nameDiv.appendChild(document.createTextNode(`group #${dataId}`));

    // lock button
    const lockButton = getButton('Lock');
    setButtonPressed(lockButton, false);
    lockButton.id = `lockb-${getAnnotationGroupDivId(dataId)}`;
    lockButton.onclick = function (event) {
      const target = event.target;
      // toggle hidden
      if (isButtonPressed(target)) {
        setButtonPressed(target, false);
        if (typeof annotationGroup !== 'undefined') {
          annotationGroup.setEditable(true);
        }
      } else {
        setButtonPressed(target, true);
        if (typeof annotationGroup !== 'undefined') {
          annotationGroup.setEditable(false);
        }
      }
    };

    // save button
    const saveButton = getButton('Save');
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
      element.download = `dicom-sr-${dataId}.dcm`;
      // trigger download
      element.click();
      URL.revokeObjectURL(element.href);
    };

    // hide button
    const hideLabelsButton = getButton('Label');
    setButtonPressed(hideLabelsButton, false);
    hideLabelsButton.id = 'b-hidelabels';
    hideLabelsButton.title = 'Show/hide annotation labels';
    hideLabelsButton.onclick = (event) => {
      const target = event.target;
      const drawLayer =
        this.#app.getStageController().getDrawLayersByDataId(dataId)[0];
      if (typeof drawLayer === 'undefined') {
        console.warn(`Cannot find draw layer with id ${dataId}`);
      }
      if (isButtonPressed(target)) {
        setButtonPressed(target, false);
        drawLayer.setLabelsVisibility(true);
      } else {
        setButtonPressed(target, true);
        drawLayer.setLabelsVisibility(false);
      }
    };

    // actions
    const actionGroupDiv = document.createElement('div');
    actionGroupDiv.id = `${getAnnotationGroupDivId(dataId)}-actions`;
    actionGroupDiv.className = 'data-item-actions';
    actionGroupDiv.appendChild(lockButton);
    actionGroupDiv.appendChild(saveButton);
    actionGroupDiv.appendChild(hideLabelsButton);

    // annotation list
    const listDiv = document.createElement('ul');
    listDiv.id = `${getAnnotationGroupDivId(dataId)}-list`;
    listDiv.className = 'data-item-list';
    for (const annotation of annotationGroup.getList()) {
      listDiv.appendChild(this.#getAnnotationHtml(annotation, dataId));
    }

    // data-item-header
    const headerDiv = document.createElement('div');
    headerDiv.id = `${getAnnotationGroupDivId(dataId)}-header`;
    headerDiv.className = 'data-item-header';
    headerDiv.appendChild(nameDiv);
    headerDiv.appendChild(actionGroupDiv);

    // data-item-content
    const contentDiv = document.createElement('div');
    contentDiv.id = `${getAnnotationGroupDivId(dataId)}-content`;
    contentDiv.className = 'data-item-content';
    contentDiv.appendChild(listDiv);

    // data-item
    const item = document.createElement('li');
    item.id = getAnnotationGroupDivId(dataId);
    item.className = 'data-item';
    item.appendChild(headerDiv);
    item.appendChild(contentDiv);

    return item;
  };

  /**
   * Handle 'dataadd' event.
   *
   * @param {CustomEvent} event The event.
   */
  #onDataAdd = (event) => {
    const data = this.#app.getData(event.detail.dataid);
    const ag = data.annotationGroup;
    if (typeof ag !== 'undefined') {
      // setup html if needed
      if (!this.#rootDoc.getElementById('annotationgroup-list')) {
        this.#setupHtml();
      }
      // annotation group as html
      const item = this.#getAnnotationGroupHtml(ag, event.detail.dataid);
      // add annotation group item
      const addItem = this.#rootDoc.getElementById('addannotationgroupitem');
      // remove and add after to make it last item
      addItem.remove();

      // update list
      const annotList = this.#rootDoc.getElementById('annotationgroup-list');
      annotList.appendChild(item);
      annotList.appendChild(addItem);
    }
  };

  /**
   * Handle 'drawlayeradd' event.
   *
   * @param {CustomEvent} event The event.
   */
  #onDrawLayerAdd = (event) => {
    const dataId = event.detail.dataid;
    const annotationGroup = this.#app.getData(dataId).annotationGroup;
    // strike through non viewable annotations
    for (const annotation of annotationGroup.getList()) {
      let textDecoration = '';
      if (!annotation.canView()) {
        textDecoration = 'line-through';
      }
      const annotationDivId = getAnnotationDivId(annotation, dataId);
      const item = this.#rootDoc.getElementById(annotationDivId);
      if (item) {
        item.style['text-decoration-line'] = textDecoration;
      }
    }
  };

  /**
   * Handle 'annotationadd' event.
   *
   * @param {CustomEvent} event The event.
   */
  #onAnnotationAdd = (event) => {
    const annotation = event.detail.data;
    const dataId = event.detail.dataid;
    // add item to list
    const listDivId = `${getAnnotationGroupDivId(dataId)}-list`;
    const listDiv = this.#rootDoc.getElementById(listDivId);
    listDiv.appendChild(this.#getAnnotationHtml(annotation, dataId));
  };

  /**
   * Handle 'annotationupdate' event.
   *
   * @param {CustomEvent} event The event.
   */
  #onAnnotationUpdate = (event) => {
    const annotation = event.detail.data;
    const dataId = event.detail.dataid;
    const keys = event.detail.keys;

    if (typeof keys !== 'undefined') {
      const annotationDivId = getAnnotationDivId(annotation, dataId);
      // update colour input
      if (keys.includes('colour')) {
        const inputColour = this.#rootDoc.getElementById(
          `cb-${annotationDivId}`);
        inputColour.value = annotation.colour;
      }
    }
  };

  /**
   * Handle 'annotationremove' event.
   *
   * @param {CustomEvent} event The event.
   */
  #onAnnotationRemove = (event) => {
    const annotation = event.detail.data;
    const dataId = event.detail.dataid;
    // remove annotation from list
    const annotationDivId = getAnnotationDivId(annotation, dataId);
    const item = this.#rootDoc.getElementById(annotationDivId);
    item.remove();
  };

}; // AnnotationUI
