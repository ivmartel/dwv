import {logger} from '../../../src/utils/logger.js';

import {getHtmlId} from './utils.js';
import {
  getButton,
  setButtonPressed
} from './icons.js';
import {renderQuantification} from './quantificationUI.js';

/**
 * @import {
 *   SegmentationService,
 *   SegmentationState,
 *   SegmentationItemState,
 *   SegmentItemState,
 *   SegmentRef
 * } from './segmentationService.js';
 */

/**
 * HTML element id prefixes.
 */
const prefixes = {
  segmentation: 'segmentation',
  segment: 'segment',
  colour: 'colour-',
  view: 'view-',
  delete: 'delete-',
  addSegment: 'add-segment-',
  saveSeg: 'save-seg-',
  saveRtss: 'save-rtss-',
  info: 'info-',
  details: 'details-',
  li: 'li-'
};

/**
 * Get the HTML id of a segmentation.
 *
 * @param {number} segmentationId The segmentation id.
 * @returns {string} The segmentation HTML id.
 */
function getSegmentationHtmlId(segmentationId) {
  return getHtmlId(prefixes.segmentation, segmentationId);
}

/**
 * Get the HTML id of a segment.
 *
 * @param {number} segmentNumber The segment number.
 * @param {number} segmentationId The segmentation id.
 * @returns {string} The segment HTML id.
 */
function getSegmentHtmlId(segmentNumber, segmentationId) {
  const segmentName = getHtmlId(prefixes.segment, segmentNumber);
  const segmentationName = getSegmentationHtmlId(segmentationId);
  return `${segmentName}-${segmentationName}`;
}

/**
 * Get the HTML id of a segment list item.
 *
 * @param {SegmentRef} ref The segment reference.
 * @returns {string} The list item HTML id.
 */
function getSegmentItemHtmlId(ref) {
  return getHtmlId(prefixes.li,
    getSegmentHtmlId(ref.segmentNumber, ref.segmentationId));
}

/**
 * Segmentation component: vanilla renderer of the segmentation
 *   service state. Reference implementation for framework components.
 *
 * Rendering reuses the elements of unchanged segmentations and segments
 *   (the state keeps the identity of unchanged parts).
 */
export class SegmentationComponent {

  /**
   * The segmentation service.
   *
   * @type {SegmentationService}
   */
  #segService;

  /**
   * The root document.
   *
   * @type {Document}
   */
  #rootDoc = document;

  /**
   * With RTSS flag.
   *
   * @type {boolean}
   */
  #withRtss = true;

  /**
   * The unsubscribe function.
   *
   * @type {Function|undefined}
   */
  #unsubscribe;

  /**
   * The last rendered state.
   *
   * @type {SegmentationState|undefined}
   */
  #renderedState;

  /**
   * The rendered segment states indexed by list item HTML id.
   *
   * @type {Map<string, SegmentItemState>}
   */
  #renderedSegments = new Map();

  /**
   * The list item HTML ids of the segments with open quantification
   *   details (view only state).
   *
   * @type {Set<string>}
   */
  #openDetails = new Set();

  /**
   * @param {SegmentationService} segService The segmentation service.
   * @param {Document} [rootDoc] Optional root document,
   *   defaults to `window.document`.
   */
  constructor(segService, rootDoc) {
    this.#segService = segService;
    if (typeof rootDoc !== 'undefined') {
      this.#rootDoc = rootDoc;
    }
  }

  /**
   * Subscribe to the segmentation service and render.
   */
  registerListeners() {
    this.#unsubscribe = this.#segService.subscribe(this.#render);
    this.#render();
  }

  /**
   * Unsubscribe from the segmentation service.
   */
  dispose() {
    if (typeof this.#unsubscribe !== 'undefined') {
      this.#unsubscribe();
      this.#unsubscribe = undefined;
    }
  }

  /**
   * Setup the container div.
   */
  #setupContainerDiv() {
    // fieldset
    const legend = document.createElement('legend');
    legend.appendChild(document.createTextNode('Segmentations'));

    const fieldset = document.createElement('fieldset');
    fieldset.id = 'segmentations-fieldset';
    fieldset.appendChild(legend);

    // main div
    const line = document.createElement('div');
    line.id = 'segmentations-line';
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
   * Setup the html for the segmentation list.
   */
  #setupHtml() {
    // segmentation list
    const segList = document.createElement('ul');
    segList.id = 'segmentation-list';
    segList.className = 'data-list';

    // extra item for add segmentation button
    const addItem = document.createElement('li');
    addItem.id = 'addsegmentationitem';
    const addSegmentationButton = document.createElement('button');
    addSegmentationButton.appendChild(
      document.createTextNode('Add segmentation'));
    addSegmentationButton.onclick = () => {
      // the segmentation is rendered on the next state change
      this.#segService.addSegmentation();
    };
    addItem.appendChild(addSegmentationButton);
    segList.appendChild(addItem);

    // setup and append
    this.#setupContainerDiv();
    const containerDiv =
      this.#rootDoc.getElementById('segmentations-fieldset');
    if (containerDiv) {
      containerDiv.appendChild(segList);
    }
  }

  /**
   * Render the segmentation service state.
   */
  #render = () => {
    const state = this.#segService.getSnapshot();
    if (state === this.#renderedState) {
      return;
    }
    const previous = this.#renderedState;
    this.#renderedState = state;

    let segList = this.#rootDoc.getElementById('segmentation-list');
    if (!segList) {
      // setup html on first segmentation
      if (state.segmentations.length === 0) {
        return;
      }
      this.#setupHtml();
      segList = this.#rootDoc.getElementById('segmentation-list');
      if (!segList) {
        logger.warn('Cannot find segmentation list element');
        return;
      }
    }
    // the add item stays last
    const addItem = this.#rootDoc.getElementById('addsegmentationitem');

    // segmentations
    const previousList = previous?.segmentations ?? [];
    for (const segmentation of state.segmentations) {
      const previousItem = previousList.find(
        (item) => item.id === segmentation.id);
      if (segmentation !== previousItem) {
        this.#renderSegmentation(segList, addItem, segmentation,
          previousItem);
      }
    }
    // remove segmentations not in state
    for (const segmentation of previousList) {
      if (!state.segmentations.some((item) => item.id === segmentation.id)) {
        this.#rootDoc.getElementById(
          getSegmentationHtmlId(segmentation.id))?.remove();
        for (const segment of segmentation.segments) {
          const itemId = getSegmentItemHtmlId({
            segmentationId: segmentation.id,
            segmentNumber: segment.number
          });
          this.#renderedSegments.delete(itemId);
          this.#openDetails.delete(itemId);
        }
      }
    }

    // selection (rows may have been rebuilt)
    this.#renderSelection(segList, state.selected,
      state.selected !== previous?.selected);
  };

  /**
   * Render a segmentation.
   *
   * @param {HTMLElement} segList The segmentation list element.
   * @param {HTMLElement|null} addItem The add segmentation item.
   * @param {SegmentationItemState} segmentation The segmentation state.
   * @param {SegmentationItemState} [previous] The previously
   *   rendered segmentation state.
   */
  #renderSegmentation(segList, addItem, segmentation, previous) {
    const segmentationId = segmentation.id;
    const segmentationHtmlId = getSegmentationHtmlId(segmentationId);
    if (!this.#rootDoc.getElementById(segmentationHtmlId)) {
      segList.insertBefore(
        this.#getSegmentationHtml(segmentationId), addItem);
    }

    const quantificationChanged = typeof previous !== 'undefined' &&
      previous.quantificationVersion !== segmentation.quantificationVersion;

    // segments
    const listDiv = this.#rootDoc.getElementById(
      `${segmentationHtmlId}-list`);
    const itemIds = new Set();
    segmentation.segments.forEach((segment, index) => {
      const itemId = getSegmentItemHtmlId(
        {segmentationId, segmentNumber: segment.number});
      itemIds.add(itemId);
      let item = this.#rootDoc.getElementById(itemId);
      if (!item || this.#renderedSegments.get(itemId) !== segment) {
        const newItem = this.#getSegmentHtml(segment, segmentationId);
        if (item) {
          item.replaceWith(newItem);
        }
        item = newItem;
        this.#renderedSegments.set(itemId, segment);
      } else if (quantificationChanged && this.#openDetails.has(itemId)) {
        // kept item: refresh open quantification
        renderQuantification(
          this.#rootDoc.getElementById(
            getHtmlId(prefixes.details,
              getSegmentHtmlId(segment.number, segmentationId))),
          this.#segService.getSegmentQuantification(
            segmentationId, segment.number));
      }
      const current = listDiv.children[index];
      if (current !== item) {
        listDiv.insertBefore(item, current ?? null);
      }
    });
    // remove segments not in state
    for (const child of Array.from(listDiv.children)) {
      if (!itemIds.has(child.id)) {
        child.remove();
        this.#renderedSegments.delete(child.id);
        this.#openDetails.delete(child.id);
      }
    }
  }

  /**
   * Render the selection.
   *
   * @param {HTMLElement} segList The segmentation list element.
   * @param {SegmentRef[]} selected The selected segments.
   * @param {boolean} changed True if the selection changed.
   */
  #renderSelection(segList, selected, changed) {
    const items = segList.querySelectorAll('.data-item-list-item');
    items.forEach(item => item.classList.remove('selected'));
    const selectedItems = [];
    for (const ref of selected) {
      const item = this.#rootDoc.getElementById(getSegmentItemHtmlId(ref));
      if (item) {
        item.classList.add('selected');
        selectedItems.push(item);
      }
    }
    if (changed && selectedItems.length !== 0) {
      selectedItems[0].scrollIntoView({block: 'nearest'});
    }
  }

  /**
   * Set the quantification details open state.
   *
   * @param {HTMLButtonElement} infoButton The info button.
   * @param {HTMLDivElement} detailsDiv The details element.
   * @param {number} segmentationId The segmentation id.
   * @param {number} segmentNumber The segment number.
   * @param {boolean} open True to open the details.
   */
  #setDetailsOpen(infoButton, detailsDiv, segmentationId, segmentNumber,
    open) {
    if (open) {
      renderQuantification(detailsDiv,
        this.#segService.getSegmentQuantification(
          segmentationId, segmentNumber));
    }
    detailsDiv.hidden = !open;
    setButtonPressed(infoButton, open);
    infoButton.setAttribute('aria-expanded', String(open));
  }

  /**
   * Save a segmentation as SEG or RTSS.
   *
   * @param {number} segmentationId The segmentation id.
   * @param {boolean} asRtss Whether to save as RTSS.
   */
  #saveSegmentation(segmentationId, asRtss) {
    let blob;
    try {
      blob = this.#segService.getSegmentationAsDicom(segmentationId, asRtss);
    } catch (error) {
      logger.error(error.message);
      alert(error.message);
      return;
    }
    const suffix = asRtss ? 'rtss' : 'seg';

    // temporary link to download
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download =
      `${getSegmentationHtmlId(segmentationId)}-${suffix}.dcm`;
    // trigger download
    element.click();
    URL.revokeObjectURL(element.href);
  }

  /**
   * Get the HTML list item for a segment.
   *
   * @param {SegmentItemState} segment The segment state.
   * @param {number} segmentationId The segmentation id.
   * @returns {HTMLLIElement} The HTML element.
   */
  #getSegmentHtml(segment, segmentationId) {
    const segmentNumber = segment.number;
    const segmentId = getSegmentHtmlId(segmentNumber, segmentationId);
    const itemId = getHtmlId(prefixes.li, segmentId);

    // segment label
    const labelSpan = document.createElement('span');
    labelSpan.title = segmentId;
    labelSpan.appendChild(document.createTextNode(`🖌️ ${segment.label}`));

    // quantification details (folded by default)
    const detailsDiv = document.createElement('div');
    detailsDiv.id = getHtmlId(prefixes.details, segmentId);
    detailsDiv.className = 'data-item-list-item-details';
    detailsDiv.hidden = true;
    detailsDiv.onclick = (event) => {
      // do not propagate to parent that triggers goto
      event.stopPropagation();
    };

    const infoButton = getButton('Info');
    infoButton.id = getHtmlId(prefixes.info, segmentId);
    infoButton.title = 'Show/hide quantification';
    infoButton.setAttribute('aria-controls', detailsDiv.id);
    this.#setDetailsOpen(infoButton, detailsDiv, segmentationId,
      segmentNumber, this.#openDetails.has(itemId));
    infoButton.onclick = (event) => {
      // do not propagate to parent that triggers goto
      event.stopPropagation();
      const open = detailsDiv.hidden;
      if (open) {
        this.#openDetails.add(itemId);
      } else {
        this.#openDetails.delete(itemId);
      }
      this.#setDetailsOpen(infoButton, detailsDiv, segmentationId,
        segmentNumber, open);
    };

    // segment colour
    const colourInput = document.createElement('input');
    colourInput.type = 'color';
    colourInput.title = 'Change segment colour';
    colourInput.id = getHtmlId(prefixes.colour, segmentId);
    colourInput.value = segment.colour;
    colourInput.onchange = () => {
      this.#segService.changeSegmentColour(
        segmentationId, segmentNumber, colourInput.value);
    };
    colourInput.onclick = (event) => {
      // do not propagate to parent that triggers goto
      event.stopPropagation();
    };

    // segment view: pressed means hidden
    const viewButton = getButton('View');
    setButtonPressed(viewButton, !segment.visible);
    viewButton.id = getHtmlId(prefixes.view, segmentId);
    viewButton.title = 'Show/hide segment';
    viewButton.onclick = (event) => {
      // do not propagate to parent that triggers goto
      event.stopPropagation();
      this.#segService.setSegmentVisibility(
        segmentationId, segmentNumber, !segment.visible);
    };

    // segment delete
    const deleteButton = getButton('Delete');
    deleteButton.id = getHtmlId(prefixes.delete, segmentId);
    deleteButton.title = 'Delete segment';
    deleteButton.onclick = (event) => {
      // do not propagate to parent that triggers goto
      event.stopPropagation();
      this.#segService.deleteSegment(segmentationId, segmentNumber);
    };

    // content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'data-item-list-item-content';
    contentDiv.appendChild(labelSpan);

    // actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'data-item-list-item-actions';
    actionsDiv.appendChild(infoButton);
    actionsDiv.appendChild(colourInput);
    actionsDiv.appendChild(viewButton);
    actionsDiv.appendChild(deleteButton);

    // list item
    const item = document.createElement('li');
    item.id = itemId;
    item.className = 'data-item-list-item';
    item.title = 'Select and go to segment';
    item.appendChild(contentDiv);
    item.appendChild(actionsDiv);
    item.appendChild(detailsDiv);

    // click on li to select and go to segment
    item.onclick = () => {
      this.#segService.selectSegment(segmentationId, segmentNumber);
      this.#segService.gotoSegment(segmentationId, segmentNumber);
    };

    return item;
  }

  /**
   * Get the HTML list element for a segmentation, without its segments.
   *
   * @param {number} segmentationId The segmentation id.
   * @returns {HTMLLIElement} The HTML element.
   */
  #getSegmentationHtml(segmentationId) {
    const segmentationName = getSegmentationHtmlId(segmentationId);

    // name
    const nameDiv = document.createElement('span');
    nameDiv.id = `${segmentationName}-name`;
    nameDiv.className = 'data-item-name';
    nameDiv.appendChild(document.createTextNode(segmentationName));

    // save buttons
    const saveSegButton = getButton('Save');
    saveSegButton.title = 'Save SEG';
    saveSegButton.id = getHtmlId(prefixes.saveSeg, segmentationName);
    saveSegButton.onclick = () => {
      this.#saveSegmentation(segmentationId, false);
    };

    const saveRtssButton = getButton('Save');
    saveRtssButton.title = 'Save RTSS';
    saveRtssButton.id = getHtmlId(prefixes.saveRtss, segmentationName);
    saveRtssButton.onclick = () => {
      this.#saveSegmentation(segmentationId, true);
    };

    // add button
    const addButton = getButton('Add');
    addButton.title = 'Add segment';
    addButton.id = getHtmlId(prefixes.addSegment, segmentationName);
    addButton.onclick = () => {
      this.#segService.addSegment(segmentationId);
    };

    // actions
    const actionGroupDiv = document.createElement('div');
    actionGroupDiv.id = `${segmentationName}-actions`;
    actionGroupDiv.className = 'data-item-actions';
    actionGroupDiv.appendChild(saveSegButton);
    if (this.#withRtss) {
      actionGroupDiv.appendChild(saveRtssButton);
    }
    actionGroupDiv.appendChild(addButton);

    // segment list (filled by the segmentation rendering)
    const listDiv = document.createElement('ul');
    listDiv.id = `${segmentationName}-list`;
    listDiv.className = 'data-item-list';

    // data-item-header
    const headerDiv = document.createElement('div');
    headerDiv.id = `${segmentationName}-header`;
    headerDiv.className = 'data-item-header';
    headerDiv.appendChild(nameDiv);
    headerDiv.appendChild(actionGroupDiv);

    // data-item-content
    const contentDiv = document.createElement('div');
    contentDiv.id = `${segmentationName}-content`;
    contentDiv.className = 'data-item-content';
    contentDiv.appendChild(listDiv);

    // segmentation item
    const segmentationItem = document.createElement('li');
    segmentationItem.id = segmentationName;
    segmentationItem.className = 'data-item';
    segmentationItem.appendChild(headerDiv);
    segmentationItem.appendChild(contentDiv);

    return segmentationItem;
  }

}; // SegmentationComponent
