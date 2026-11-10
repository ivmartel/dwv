import {logger} from '../../../src/utils/logger.js';
import {
  getIconElement,
  getButton,
  setButtonPressed
} from './viewer.ui.icons.js';
import {getQuantificationGroups} from '../services/quantification.js';
import {renderQuantification} from './viewer.ui.quantification.js';

/**
 * @import {
 *   AnnotationService,
 *   AnnotationState,
 *   AnnotationGroupState,
 *   AnnotationItemState,
 *   AnnotationSelection
 * } from '../services/annot.service.js';
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
 * Get the annotation divId from its id.
 *
 * @param {string} annotationId The annotation tracking UID.
 * @param {string} dataId The data ID.
 * @returns {string} The divId.
 */
function getAnnotationDivId(annotationId, dataId) {
  const prefix = getAnnotationGroupDivId(dataId);
  return `${prefix}-annotation${annotationId}`;
}

/**
 * Annotation component: vanilla renderer of the annotation service
 *   state. Reference implementation for framework components.
 *
 * Rendering reuses the elements of unchanged groups and annotations
 *   (the state keeps the identity of unchanged parts).
 */
export class AnnotationComponent {

  /**
   * The annotation service.
   *
   * @type {AnnotationService}
   */
  #annotService;

  /**
   * The root document.
   *
   * @type {Document}
   */
  #rootDoc = document;

  /**
   * The unsubscribe function.
   *
   * @type {Function|undefined}
   */
  #unsubscribe;

  /**
   * The last rendered state.
   *
   * @type {AnnotationState|undefined}
   */
  #renderedState;

  /**
   * The rendered annotation states indexed by annotation divId.
   *
   * @type {Map<string, AnnotationItemState>}
   */
  #renderedAnnotations = new Map();

  /**
   * The divIds of the annotations with open quantification details
   *   (view only state).
   *
   * @type {Set<string>}
   */
  #openDetails = new Set();

  /**
   * @param {AnnotationService} annotService The annotation service.
   * @param {Document} [rootDoc] Optional root document,
   *   defaults to `window.document`.
   */
  constructor(annotService, rootDoc) {
    this.#annotService = annotService;
    if (typeof rootDoc !== 'undefined') {
      this.#rootDoc = rootDoc;
    }
  }

  /**
   * Subscribe to the annotation service and render.
   */
  registerListeners() {
    this.#unsubscribe = this.#annotService.subscribe(this.#render);
    this.#render();
  }

  /**
   * Unsubscribe from the annotation service.
   */
  dispose() {
    if (typeof this.#unsubscribe !== 'undefined') {
      this.#unsubscribe();
      this.#unsubscribe = undefined;
    }
  }

  /**
   * Get a group state from the last rendered state.
   *
   * @param {string} dataId The annotation group data id.
   * @returns {AnnotationGroupState|undefined} The group state.
   */
  #getGroupState(dataId) {
    return this.#renderedState?.groups.find(
      (group) => group.dataId === dataId);
  }

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
      // the group is rendered on the next state change
      this.#annotService.addAnnotationGroup();
    };
    addItem.appendChild(addAnnotationGroupButton);

    // annotation list
    const annotList = document.createElement('ul');
    annotList.id = 'annotationgroup-list';
    annotList.className = 'data-list';
    annotList.appendChild(addItem);

    // setup and append
    this.#setupContainerDiv();
    const containerDiv =
      this.#rootDoc.getElementById('annotationgroups-fieldset');
    if (containerDiv) {
      containerDiv.appendChild(annotList);
    }
  }

  /**
   * Render the annotation service state.
   */
  #render = () => {
    const state = this.#annotService.getSnapshot();
    if (state === this.#renderedState) {
      return;
    }
    const previous = this.#renderedState;
    this.#renderedState = state;

    let annotList = this.#rootDoc.getElementById('annotationgroup-list');
    if (!annotList) {
      // setup html on first group
      if (state.groups.length === 0) {
        return;
      }
      this.#setupHtml();
      annotList = this.#rootDoc.getElementById('annotationgroup-list');
      if (!annotList) {
        logger.warn('Cannot find annotation group list element');
        return;
      }
    }
    // the add item stays last
    const addItem = this.#rootDoc.getElementById('addannotationgroupitem');

    // groups
    const previousGroups = previous?.groups ?? [];
    for (const group of state.groups) {
      const previousGroup = previousGroups.find(
        (item) => item.dataId === group.dataId);
      if (group !== previousGroup) {
        this.#renderGroup(annotList, addItem, group);
      }
    }
    // remove groups not in state
    for (const group of previousGroups) {
      if (!state.groups.some((item) => item.dataId === group.dataId)) {
        this.#rootDoc.getElementById(
          getAnnotationGroupDivId(group.dataId))?.remove();
        for (const annotation of group.annotations) {
          const divId = getAnnotationDivId(annotation.id, group.dataId);
          this.#renderedAnnotations.delete(divId);
          this.#openDetails.delete(divId);
        }
      }
    }

    // selection (rows may have been rebuilt)
    this.#renderSelection(annotList, state.selected,
      state.selected !== previous?.selected);
  };

  /**
   * Render an annotation group.
   *
   * @param {HTMLElement} annotList The annotation group list element.
   * @param {HTMLElement|null} addItem The add group item.
   * @param {AnnotationGroupState} group The group state.
   */
  #renderGroup(annotList, addItem, group) {
    const dataId = group.dataId;
    const groupDivId = getAnnotationGroupDivId(dataId);
    let item = this.#rootDoc.getElementById(groupDivId);
    if (!item) {
      item = this.#getAnnotationGroupHtml(dataId);
      annotList.insertBefore(item, addItem);
    }

    // header buttons: pressed means locked / hidden
    setButtonPressed(
      this.#rootDoc.getElementById(`lockb-${groupDivId}`),
      !group.editable);
    setButtonPressed(
      this.#rootDoc.getElementById(`hidelabelsb-${groupDivId}`),
      !group.labelsVisible);

    // annotations
    const listDiv = this.#rootDoc.getElementById(`${groupDivId}-list`);
    const divIds = new Set();
    group.annotations.forEach((annotation, index) => {
      const divId = getAnnotationDivId(annotation.id, dataId);
      divIds.add(divId);
      let annotItem = this.#rootDoc.getElementById(divId);
      if (!annotItem ||
        this.#renderedAnnotations.get(divId) !== annotation) {
        const newItem = this.#getAnnotationHtml(annotation, dataId);
        if (annotItem) {
          annotItem.replaceWith(newItem);
        }
        annotItem = newItem;
        this.#renderedAnnotations.set(divId, annotation);
      }
      const current = listDiv.children[index];
      if (current !== annotItem) {
        listDiv.insertBefore(annotItem, current ?? null);
      }
    });
    // remove annotations not in state
    for (const child of Array.from(listDiv.children)) {
      if (!divIds.has(child.id)) {
        child.remove();
        this.#renderedAnnotations.delete(child.id);
        this.#openDetails.delete(child.id);
      }
    }

    // disable annotation edit buttons if the group is not editable
    const elements = listDiv.querySelectorAll('[id^="cb-"], [id^="db-"]');
    for (const element of elements) {
      element.disabled = !group.editable;
    }
  }

  /**
   * Render the selection.
   *
   * @param {HTMLElement} annotList The annotation group list element.
   * @param {AnnotationSelection|undefined} selected The selection.
   * @param {boolean} changed True if the selection changed.
   */
  #renderSelection(annotList, selected, changed) {
    const items = annotList.querySelectorAll('.data-item-list-item');
    items.forEach(item => item.classList.remove('selected'));
    if (typeof selected === 'undefined') {
      return;
    }
    const item = this.#rootDoc.getElementById(
      getAnnotationDivId(selected.annotationId, selected.dataId));
    if (item) {
      item.classList.add('selected');
      if (changed) {
        item.scrollIntoView({block: 'nearest'});
      }
    }
  }

  /**
   * Toggle an annotation information section.
   *
   * @param {HTMLButtonElement} infoButton The info button.
   * @param {HTMLDivElement} detailsDiv The details element.
   * @param {AnnotationItemState} annotation The annotation state.
   * @param {string} divId The annotation divId.
   */
  #toggleAnnotationInfo(infoButton, detailsDiv, annotation, divId) {
    const open = detailsDiv.hidden;
    if (open) {
      this.#openDetails.add(divId);
    } else {
      this.#openDetails.delete(divId);
    }
    this.#setDetailsOpen(infoButton, detailsDiv, annotation, open);
  }

  /**
   * Set the quantification details open state.
   *
   * @param {HTMLButtonElement} infoButton The info button.
   * @param {HTMLDivElement} detailsDiv The details element.
   * @param {AnnotationItemState} annotation The annotation state.
   * @param {boolean} open True to open the details.
   */
  #setDetailsOpen(infoButton, detailsDiv, annotation, open) {
    if (open) {
      renderQuantification(
        detailsDiv, getQuantificationGroups(annotation.quantification));
    }
    detailsDiv.hidden = !open;
    setButtonPressed(infoButton, open);
    infoButton.setAttribute('aria-expanded', String(open));
  }

  /**
   * Save an annotation group as DICOM SR.
   *
   * @param {string} dataId The annotation group data id.
   */
  #saveAnnotationGroup(dataId) {
    let blob;
    try {
      blob = this.#annotService.getAnnotationGroupAsDicom(dataId);
    } catch (error) {
      logger.error(error.message);
      alert(error.message);
      return;
    }

    // temporary link to download
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = `dicom-sr-${dataId}.dcm`;
    // trigger download
    element.click();
    URL.revokeObjectURL(element.href);
  }

  /**
   * Get the annotation html.
   *
   * @param {AnnotationItemState} annotation The annotation state.
   * @param {string} dataId The annotation group data id.
   * @returns {HTMLLIElement} The HTMl element.
   */
  #getAnnotationHtml(annotation, dataId) {
    const annotationDivId = getAnnotationDivId(annotation.id, dataId);
    const annotationId = annotation.id;

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
    infoButton.id = `ib-${annotationDivId}`;
    infoButton.title = 'Show/hide quantification';
    infoButton.setAttribute('aria-controls', detailsDiv.id);
    this.#setDetailsOpen(infoButton, detailsDiv, annotation,
      this.#openDetails.has(annotationDivId));
    infoButton.onclick = (event) => {
      // do not propagate to parent (triggers goto)
      event.stopPropagation();
      this.#toggleAnnotationInfo(
        infoButton, detailsDiv, annotation, annotationDivId);
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
      this.#annotService.changeAnnotationColour(
        dataId, annotationId, inputColour.value);
    };

    // pressed means hidden
    const viewButton = getButton('View');
    setButtonPressed(viewButton, !annotation.visible);
    viewButton.id = `vb-${annotationDivId}`;
    viewButton.title = 'Show/hide annotation';
    viewButton.onclick = (event) => {
      // do not propagate to parent (triggers goto)
      event.stopPropagation();
      this.#annotService.setAnnotationVisibility(
        dataId, annotationId, !annotation.visible);
    };

    const deleteButton = getButton('Delete');
    deleteButton.id = `db-${annotationDivId}`;
    deleteButton.title = 'Delete annotation';
    deleteButton.onclick = (event) => {
      // do not propagate to parent (triggers goto)
      event.stopPropagation();
      this.#annotService.deleteAnnotation(dataId, annotationId);
    };
    // colour and delete disabled state is set by the group rendering

    // content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'data-item-list-item-content';
    contentDiv.appendChild(getIconElement(annotation.factoryName));
    contentDiv.appendChild(document.createTextNode(` ${annotation.label}`));

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
    // strike through non viewable annotations
    if (!annotation.canView) {
      item.style['text-decoration-line'] = 'line-through';
    }

    // click on li to go to annotation
    item.onclick = () => {
      this.#annotService.selectAnnotation(dataId, annotationId);
      this.#annotService.gotoAnnotation(dataId, annotationId);
    };

    return item;
  }

  /**
   * Get an annotation group html, without its annotations.
   *
   * @param {string} dataId The annotation group data id.
   * @returns {HTMLLIElement} The annotation group element.
   */
  #getAnnotationGroupHtml(dataId) {
    const groupDivId = getAnnotationGroupDivId(dataId);

    // name
    const nameDiv = document.createElement('span');
    nameDiv.id = `${groupDivId}-name`;
    nameDiv.className = 'data-item-name';
    nameDiv.appendChild(document.createTextNode(`group #${dataId}`));

    // lock button (pressed state set by the group rendering)
    const lockButton = getButton('Lock');
    lockButton.id = `lockb-${groupDivId}`;
    lockButton.onclick = () => {
      const group = this.#getGroupState(dataId);
      if (typeof group !== 'undefined') {
        this.#annotService.setAnnotationGroupEditable(
          dataId, !group.editable);
      }
    };

    // save button
    const saveButton = getButton('Save');
    saveButton.title = 'Save annnotation group';
    saveButton.onclick = () => {
      this.#saveAnnotationGroup(dataId);
    };

    // hide labels button (pressed state set by the group rendering)
    const hideLabelsButton = getButton('Label');
    hideLabelsButton.id = `hidelabelsb-${groupDivId}`;
    hideLabelsButton.title = 'Show/hide annotation labels';
    hideLabelsButton.onclick = () => {
      const group = this.#getGroupState(dataId);
      if (typeof group !== 'undefined') {
        this.#annotService.setLabelsVisibility(
          dataId, !group.labelsVisible);
      }
    };

    // actions
    const actionGroupDiv = document.createElement('div');
    actionGroupDiv.id = `${groupDivId}-actions`;
    actionGroupDiv.className = 'data-item-actions';
    actionGroupDiv.appendChild(lockButton);
    actionGroupDiv.appendChild(saveButton);
    actionGroupDiv.appendChild(hideLabelsButton);

    // annotation list (filled by the group rendering)
    const listDiv = document.createElement('ul');
    listDiv.id = `${groupDivId}-list`;
    listDiv.className = 'data-item-list';

    // data-item-header
    const headerDiv = document.createElement('div');
    headerDiv.id = `${groupDivId}-header`;
    headerDiv.className = 'data-item-header';
    headerDiv.appendChild(nameDiv);
    headerDiv.appendChild(actionGroupDiv);

    // data-item-content
    const contentDiv = document.createElement('div');
    contentDiv.id = `${groupDivId}-content`;
    contentDiv.className = 'data-item-content';
    contentDiv.appendChild(listDiv);

    // data-item
    const item = document.createElement('li');
    item.id = groupDivId;
    item.className = 'data-item';
    item.appendChild(headerDiv);
    item.appendChild(contentDiv);

    return item;
  };

}; // AnnotationComponent
