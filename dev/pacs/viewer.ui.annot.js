import {DrawController} from '../../src/app/drawController.js';
import {
  AnnotationGroupFactory
} from '../../src/image/annotationGroupFactory.js';
import {
  getUID,
  DicomWriter
} from '../../src/dicom/dicomWriter.js';
import {i18n} from '../../src/utils/i18n.js';
import {logger} from '../../src/utils/logger.js';
import {
  getIconElement,
  getButton,
  setButtonPressed,
  isButtonPressed
} from './viewer.ui.icons.js';

/**
 * @import {ViewerService} from './viewer.service.js';
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
 * Quantification keys related to pixel values, other keys are
 *   considered as geometric (lowercase, compared case insensitive).
 */
const pixelValueKeys = [
  'min', 'max', 'mean', 'stddev', 'median', 'p25', 'p75'
];

/**
 * Specific quantification labels, others use the general rule
 *   of `getQuantificationLabel` (lowercase keys, compared case insensitive).
 */
const quantificationLabels = {
  stddev: 'standard deviation',
  surface: 'area'
};

/**
 * Get a readable label for a quantification key.
 *
 * @param {string} key The quantification key.
 * @returns {string} The label.
 */
function getQuantificationLabel(key) {
  const specific = quantificationLabels[key.toLowerCase()];
  if (typeof specific !== 'undefined') {
    return specific;
  }
  // percentile: 'p25' -> '25th percentile'
  const percentile = key.match(/^p(\d+)$/);
  if (percentile !== null) {
    return `${percentile[1]}th percentile`;
  }
  // general rule: 'someKey' -> 'some key'
  return key.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
}

/**
 * Format a quantification value with its unit.
 *
 * @param {number} value The value.
 * @param {string} [unit] The unit (translation key).
 * @returns {string} The formatted value.
 */
function formatQuantificationValue(value, unit) {
  const absValue = Math.abs(value);
  let digits = 2;
  if (absValue >= 100) {
    digits = 1;
  } else if (absValue !== 0 && absValue < 1) {
    digits = 3;
  }
  let res = value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
  if (typeof unit !== 'undefined') {
    let unitStr = i18n.t(unit);
    if (typeof unitStr === 'undefined') {
      unitStr = unit;
    }
    // no space before degree symbol
    res += unitStr === '°' ? unitStr : ` ${unitStr}`;
  }
  return res;
}

/**
 * Get the quantification as groups of label and value pairs.
 *
 * @param {Record<string, object>|undefined} quantification The annotation
 *   quantification.
 * @returns {{title: string, items: {label: string, value: string}[]}[]}
 *   The non empty groups, empty if no quantification.
 */
function getQuantificationGroups(quantification) {
  if (typeof quantification === 'undefined') {
    return [];
  }
  const geometry = {title: 'Geometry', items: []};
  const pixelValues = {title: 'Pixel values', items: []};
  for (const key of Object.keys(quantification)) {
    const quant = quantification[key];
    // skip undefined values (for ex surface on non calibrated data)
    if (typeof quant === 'undefined' ||
      typeof quant.value !== 'number') {
      continue;
    }
    const item = {
      label: getQuantificationLabel(key),
      value: formatQuantificationValue(quant.value, quant.unit)
    };
    if (pixelValueKeys.includes(key.toLowerCase())) {
      pixelValues.items.push(item);
    } else {
      geometry.items.push(item);
    }
  }
  return [geometry, pixelValues].filter(group => group.items.length !== 0);
}

/**
 * Annotation UI.
 */
export class AnnotationUI {

  /**
   * The dwv service.
   *
   * @type {ViewerService}
   */
  #dwvService;

  /**
   * The root document.
   *
   * @type {Document}
   */
  #rootDoc = document;

  /**
   * @param {ViewerService} service The associated viewer service.
   * @param {Document} [rootDoc] Optional root document,
   *   defaults to `window.document`.
   */
  constructor(service, rootDoc) {
    this.#dwvService = service;
    if (typeof rootDoc !== 'undefined') {
      this.#rootDoc = rootDoc;
    }
  }

  /**
   * Bind app to ui.
   */
  registerListeners() {
    this.#dwvService.addEventListener('dataadd',
      this.#onDataAdd);
    this.#dwvService.addEventListener('dataremove',
      this.#onDataRemove);
    this.#dwvService.addEventListener('drawlayeradd',
      this.#onDrawLayerAdd);
    this.#dwvService.addEventListener('annotationadd',
      this.#onAnnotationAdd);
    this.#dwvService.addEventListener('annotationupdate',
      this.#onAnnotationUpdate);
    this.#dwvService.addEventListener('annotationremove',
      this.#onAnnotationRemove);
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
    if (!detailsEl) {
      logger.warn('Cannot find layers details element');
      return;
    }
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
      this.#addAnnotationGroup();
    };
    addItem.appendChild(addAnnotationGroupButton);

    // annotation list
    const annotList = document.createElement('ul');
    annotList.id = 'annotationgroup-list';
    annotList.className = 'data-list';
    annotList.appendChild(addItem);

    // setup and append
    this.#setupContainerDiv();
    const containerDiv = this.#getContainerDiv();
    if (containerDiv) {
      containerDiv.appendChild(annotList);
    }
  }

  /**
   * Add an annotation group to the active view layer.
   */
  #addAnnotationGroup() {
    // get the reference data id from the main layer group
    const divId = this.#dwvService.getMainLayerGroupDivId();
    const stgCtrl = this.#dwvService.getStageController();
    const layerGroup = stgCtrl.getLayerGroupByDivId(divId);
    // add annotation group
    const viewLayer = layerGroup.getActiveViewLayer();
    if (typeof viewLayer === 'undefined') {
      logger.warn(
        'No active view layer, please select one in the data table'
      );
      return;
    }
    const refDataId = viewLayer.getDataId();
    const data = this.#dwvService.createAnnotationData(refDataId);
    // render (will create draw layer)
    this.#dwvService.addAndRenderAnnotationData(data, divId, refDataId);
    // item is added to the UI by the 'dataadd' listener
  }

  /**
   * Render an annotation quantification.
   *
   * @param {HTMLDivElement} detailsDiv The details element.
   * @param {Annotation} annotation The annotation.
   */
  #renderQuantification(detailsDiv, annotation) {
    const groups = getQuantificationGroups(annotation.quantification);
    if (groups.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'quantification-empty';
      emptyDiv.appendChild(document.createTextNode('No quantification.'));
      detailsDiv.replaceChildren(emptyDiv);
      return;
    }
    const elements = [];
    for (const group of groups) {
      const title = document.createElement('div');
      title.className = 'quantification-title';
      title.appendChild(document.createTextNode(group.title));
      const list = document.createElement('dl');
      list.className = 'quantification';
      for (const item of group.items) {
        const term = document.createElement('dt');
        term.appendChild(document.createTextNode(item.label));
        const value = document.createElement('dd');
        value.appendChild(document.createTextNode(item.value));
        // wrap pair to allow several per line
        const pair = document.createElement('div');
        pair.appendChild(term);
        pair.appendChild(value);
        list.appendChild(pair);
      }
      const groupDiv = document.createElement('div');
      groupDiv.className = 'quantification-group';
      groupDiv.appendChild(title);
      groupDiv.appendChild(list);
      elements.push(groupDiv);
    }
    detailsDiv.replaceChildren(...elements);
  }

  /**
   * Toggle an annotation information section.
   *
   * @param {HTMLButtonElement} infoButton The info button.
   * @param {HTMLDivElement} detailsDiv The details element.
   * @param {AnnotationGroup} annotationGroup The annotation group.
   * @param {string} annotationId The annotation tracking UID.
   */
  #toggleAnnotationInfo(infoButton, detailsDiv, annotationGroup,
    annotationId) {
    const open = detailsDiv.hidden;
    if (open) {
      // get annotation (the group can replace it on update)
      const annotation = annotationGroup.find(annotationId);
      this.#renderQuantification(detailsDiv, annotation);
    }
    detailsDiv.hidden = !open;
    setButtonPressed(infoButton, open);
    infoButton.setAttribute('aria-expanded', String(open));
  }

  /**
   * Change an annotation colour.
   *
   * @param {HTMLInputElement} inputColour The colour input.
   * @param {AnnotationGroup} annotationGroup The annotation group.
   * @param {string} annotationId The annotation tracking UID.
   */
  #changeAnnotationColour(inputColour, annotationGroup, annotationId) {
    const newColour = inputColour.value;
    // get annotation (the group can replace it on update)
    const annotation = annotationGroup.find(annotationId);
    // update
    if (newColour !== annotation.colour) {
      const drawController = new DrawController(annotationGroup);
      const undoCtrl = this.#dwvService.getUndoController();
      drawController.updateAnnotationWithCommand(
        annotationId,
        {colour: annotation.colour},
        {colour: newColour},
        undoCtrl.addToUndoStack
      );
    }
  }

  /**
   * Toggle an annotation visibility.
   *
   * @param {HTMLButtonElement} viewButton The view button.
   * @param {string} annotationId The annotation tracking UID.
   * @param {string} dataId The annotation group dataId.
   */
  #toggleAnnotationView(viewButton, annotationId, dataId) {
    const drawLayers = this.#dwvService.getStageController()
      .getDrawLayersByDataId(dataId);
    // toggle view
    const isPressed = isButtonPressed(viewButton);
    setButtonPressed(viewButton, !isPressed);
    for (const layer of drawLayers) {
      layer.setAnnotationVisibility(annotationId, isPressed);
    }
  }

  /**
   * Delete an annotation.
   *
   * @param {AnnotationGroup} annotationGroup The annotation group.
   * @param {string} annotationId The annotation tracking UID.
   */
  #deleteAnnotation(annotationGroup, annotationId) {
    const drawController = new DrawController(annotationGroup);
    const undoCtrl = this.#dwvService.getUndoController();
    // TODO reposition div at same position after delete undo?
    drawController.removeAnnotationWithCommand(
      annotationId,
      undoCtrl.addToUndoStack
    );
  }

  /**
   * Go to an annotation: set the view position to its centroid.
   *
   * @param {AnnotationGroup} annotationGroup The annotation group.
   * @param {string} annotationId The annotation tracking UID.
   * @param {string} dataId The annotation group dataId.
   */
  #gotoAnnotation(annotationGroup, annotationId, dataId) {
    // get annotation (the group can replace it on update)
    const annotation = annotationGroup.find(annotationId);
    const annotCentroid = annotation.getCentroid();
    if (typeof annotCentroid !== 'undefined') {
      const drawLayers = this.#dwvService.getStageController()
        .getDrawLayersByDataId(dataId);
      for (const layer of drawLayers) {
        layer.setCurrentPosition(annotCentroid);
      }
    } else {
      logger.warn('No centroid for annotation');
    }
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
    const annotationId = annotation.trackingUid;
    const dataCtrl = this.#dwvService.getDataController();
    const annotationGroup = dataCtrl.get(dataId).annotationGroup;

    // quantification details (folded by default)
    const detailsDiv = document.createElement('div');
    detailsDiv.id = `qd-${annotationDivId}`;
    detailsDiv.className = 'data-item-list-item-details';
    detailsDiv.hidden = true;
    detailsDiv.onclick = (event) => {
      // do not propagate to parent (triggers goto)
      event.stopPropagation();
    };

    const infoButton = getButton('Info');
    setButtonPressed(infoButton, false);
    infoButton.id = `ib-${annotationDivId}`;
    infoButton.title = 'Show/hide quantification';
    infoButton.setAttribute('aria-expanded', 'false');
    infoButton.setAttribute('aria-controls', detailsDiv.id);
    infoButton.onclick = (event) => {
      // do not propagate to parent (triggers goto)
      event.stopPropagation();
      this.#toggleAnnotationInfo(
        infoButton, detailsDiv, annotationGroup, annotationId);
    };

    const inputColour = document.createElement('input');
    inputColour.type = 'color';
    inputColour.title = 'Change annotation colour';
    inputColour.id = `cb-${annotationDivId}`;
    inputColour.value = annotation.colour;
    inputColour.onclick = (event) => {
      // do not propagate to parent that triggers goto
      event.stopPropagation();
    };
    inputColour.onchange = () => {
      this.#changeAnnotationColour(inputColour, annotationGroup, annotationId);
    };

    const viewButton = getButton('View');
    setButtonPressed(viewButton, false);
    viewButton.id = `vb-${annotationDivId}`;
    viewButton.title = 'Show/hide annotation';
    viewButton.onclick = (event) => {
      // do not propagate to parent (triggers goto)
      event.stopPropagation();
      this.#toggleAnnotationView(viewButton, annotationId, dataId);
    };

    const deleteButton = getButton('Delete');
    deleteButton.id = `db-${annotationDivId}`;
    deleteButton.title = 'Delete annotation';
    deleteButton.onclick = (event) => {
      // do not propagate to parent (triggers goto)
      event.stopPropagation();
      this.#deleteAnnotation(annotationGroup, annotationId);
    };

    // disable buttons if group is not editable
    // (updated by the group 'annotationgroupeditablechange' listener)
    const disabled = !annotationGroup.isEditable();
    inputColour.disabled = disabled;
    deleteButton.disabled = disabled;

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
    item.appendChild(detailsDiv);
    item.title = 'Go to annotation';

    // click on li to go to annotation
    item.onclick = () => {
      // remove selected class from other rows
      const mainlist = this.#rootDoc.getElementById('annotationgroup-list');
      if (mainlist) {
        const items = mainlist.querySelectorAll('.data-item-list-item');
        items.forEach(item2 => item2.classList.remove('selected'));
      }
      // mark this row as selected
      item.classList.add('selected');

      this.#gotoAnnotation(annotationGroup, annotationId, dataId);
    };

    return item;
  }

  /**
   * Toggle an annotation group editability.
   *
   * @param {HTMLButtonElement} lockButton The lock button.
   * @param {AnnotationGroup} annotationGroup The annotation group.
   */
  #toggleAnnotationGroupLock(lockButton, annotationGroup) {
    // toggle hidden
    const isPressed = isButtonPressed(lockButton);
    setButtonPressed(lockButton, !isPressed);
    if (typeof annotationGroup !== 'undefined') {
      annotationGroup.setEditable(isPressed);
    }
  }

  /**
   * Save an annotation group as DICOM SR.
   *
   * @param {AnnotationGroup} annotationGroup The annotation group.
   * @param {string} dataId The annotation group dataId.
   */
  #saveAnnotationGroup(annotationGroup, dataId) {
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
    let dicomBuffer;
    try {
      dicomBuffer = writer.getBuffer(dicomElements);
    } catch (error) {
      logger.error(error.message);
      alert(error.message);
      return;
    }
    const blob = new Blob([dicomBuffer], {type: 'application/dicom'});

    // temporary link to download
    const element = document.createElement('a');
    element.href = window.URL.createObjectURL(blob);
    element.download = `dicom-sr-${dataId}.dcm`;
    // trigger download
    element.click();
    URL.revokeObjectURL(element.href);
  }

  /**
   * Toggle an annotation group labels visibility.
   *
   * @param {HTMLButtonElement} hideLabelsButton The hide labels button.
   * @param {string} dataId The annotation group dataId.
   */
  #toggleLabelsVisibility(hideLabelsButton, dataId) {
    const drawLayer = this.#dwvService.getStageController()
      .getDrawLayersByDataId(dataId)[0];
    if (typeof drawLayer === 'undefined') {
      logger.warn(`Cannot find draw layer with id ${dataId}`);
      return;
    }
    // toggle hide
    const isPressed = isButtonPressed(hideLabelsButton);
    setButtonPressed(hideLabelsButton, !isPressed);
    drawLayer.setLabelsVisibility(isPressed);
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
    lockButton.onclick = () => {
      this.#toggleAnnotationGroupLock(lockButton, annotationGroup);
    };

    // save button
    const saveButton = getButton('Save');
    saveButton.title = 'Save annnotation group';
    saveButton.onclick = () => {
      this.#saveAnnotationGroup(annotationGroup, dataId);
    };

    // hide button
    const hideLabelsButton = getButton('Label');
    setButtonPressed(hideLabelsButton, false);
    hideLabelsButton.id = `hidelabelsb-${getAnnotationGroupDivId(dataId)}`;
    hideLabelsButton.title = 'Show/hide annotation labels';
    hideLabelsButton.onclick = () => {
      this.#toggleLabelsVisibility(hideLabelsButton, dataId);
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

    // disable/enable annotation buttons if group is editable or not
    // (one listener per group, covers annotations added later)
    annotationGroup.addEventListener(
      'annotationgroupeditablechange', function (event) {
        const disabled = !event.detail.data;
        const elements = listDiv.querySelectorAll('[id^="cb-"], [id^="db-"]');
        for (const element of elements) {
          element.disabled = disabled;
        }
      }
    );

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
    const dataId = event.detail.dataid;
    const dataCtrl = this.#dwvService.getDataController();
    const data = dataCtrl.get(dataId);
    const ag = data.annotationGroup;
    if (typeof ag !== 'undefined') {
      // setup html if needed
      if (!this.#rootDoc.getElementById('annotationgroup-list')) {
        this.#setupHtml();
      }
      const annotList = this.#rootDoc.getElementById('annotationgroup-list');
      if (!annotList) {
        logger.warn('Cannot find annotation group list element');
        return;
      }
      // annotation group as html
      const item = this.#getAnnotationGroupHtml(ag, dataId);
      // add annotation group item
      const addItem = this.#rootDoc.getElementById('addannotationgroupitem');
      if (addItem) {
        // remove and add after to make it last item
        addItem.remove();
        annotList.appendChild(item);
        annotList.appendChild(addItem);
      } else {
        annotList.appendChild(item);
      }
    }
  };

  /**
   * Handle 'dataremove' event.
   *
   * @param {CustomEvent} event The event.
   */
  #onDataRemove = (event) => {
    const dataId = event.detail.dataid;
    // remove annotation group item if present
    // (data is already removed from the data controller)
    const item = this.#rootDoc.getElementById(
      getAnnotationGroupDivId(dataId));
    if (item) {
      item.remove();
    }
  };

  /**
   * Handle 'drawlayeradd' event.
   *
   * @param {CustomEvent} event The event.
   */
  #onDrawLayerAdd = (event) => {
    const dataId = event.detail.dataid;
    const dataCtrl = this.#dwvService.getDataController();
    const annotationGroup = dataCtrl.get(dataId).annotationGroup;
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
    if (listDiv) {
      listDiv.appendChild(this.#getAnnotationHtml(annotation, dataId));
    }
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

    const annotationDivId = getAnnotationDivId(annotation, dataId);

    // update quantification if shown
    const detailsDiv = this.#rootDoc.getElementById(`qd-${annotationDivId}`);
    if (detailsDiv && !detailsDiv.hidden) {
      this.#renderQuantification(detailsDiv, annotation);
    }

    if (typeof keys !== 'undefined') {
      // update colour input
      if (keys.includes('colour')) {
        const inputColour = this.#rootDoc.getElementById(
          `cb-${annotationDivId}`);
        if (inputColour) {
          inputColour.value = annotation.colour;
        }
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
    if (item) {
      item.remove();
    }
  };

}; // AnnotationUI
