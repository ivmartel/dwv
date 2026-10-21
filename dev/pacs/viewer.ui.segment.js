import {DicomWriter} from '../../src/dicom/dicomWriter.js';
import {
  rgbToHex,
  hexToRgb,
} from '../../src/utils/colour.js';
import {logger} from '../../src/utils/logger.js';
import {getSegmentationCode} from '../../src/dicom/dicomCode.js';
import {
  MaskFactory,
  mergeMaskImages
} from '../../src/image/maskFactory.js';
import {RtStructFactory} from '../../src/image/rtStructFactory.js';
import {MaskSegmentHelper} from '../../src/image/maskSegmentHelper.js';
import {Brush} from '../../src/tools/brush.js';
import {MaskSegmentViewHelper} from '../../src/image/maskSegmentViewHelper.js';
import {
  ChangeSegmentColourCommand
} from '../../src/command/changeSegmentColourCommand.js';
import {
  DeleteSegmentCommand
} from '../../src/command/deleteSegmentCommand.js';

import {getHtmlId} from './viewer.utils.js';
import {
  getButton,
  setButtonPressed,
  isButtonPressed
} from './viewer.ui.icons.js';
import {
  getQuantificationGroups,
  renderQuantification
} from './viewer.ui.quantification.js';

/**
 * @import {ViewerService} from './viewer.service.js';
 * @import {MaskSegment} from '../../src/dicom/dicomSegment.js';
 * @import {RGB} from '../../src/utils/colour.js';
 * @import {Statistics} from '../../src/math/stats.js';
 * @import {Label} from '../../src/image/label.js';
 * @import {MaskImage} from '../../src/image/maskImage.js';
 * @import {QuantificationGroup} from './viewer.ui.quantification.js';
 */

/**
 * Segmentation type.
 *
 * @typedef Segmentation
 * @property {string|undefined} dataId The segmentation data ID,
 *   undefined until the mask is created.
 * @property {Label[]} labels The segmentation labels.
 * @property {MaskSegment[]} segments The segmentation segments.
 * @property {MaskSegmentViewHelper} viewHelper A view helper.
 * @property {number} [selectedSegmentNumber] The number of the segment
 *   selected for the brush, undefined if none.
 */

/**
 * List of possible colours.
 *
 * @type {RGB[]}
 */
const defaultColours = [
  {r: 255, g: 0, b: 0},
  {r: 0, g: 255, b: 0},
  {r: 0, g: 0, b: 255},
  {r: 0, g: 255, b: 255},
  {r: 255, g: 0, b: 255},
  {r: 255, g: 255, b: 0},
  {r: 255, g: 255, b: 255},
  {r: 255, g: 128, b: 128},
  {r: 128, g: 255, b: 128},
  {r: 128, g: 128, b: 255},
  {r: 128, g: 255, b: 255},
  {r: 255, g: 128, b: 255},
  {r: 255, g: 255, b: 128},
  {r: 128, g: 128, b: 128},
  {r: 255, g: 64, b: 64},
  {r: 64, g: 255, b: 64},
  {r: 64, g: 64, b: 255},
  {r: 64, g: 255, b: 255},
  {r: 255, g: 64, b: 255},
  {r: 255, g: 255, b: 64},
  {r: 64, g: 64, b: 64},
];

/**
 * Get a segment from a segment list.
 *
 * @param {number} segmentNumber The segment number.
 * @param {MaskSegment[]} segments The list to search.
 * @returns {MaskSegment|undefined} The found segment.
 */
function getSegment(segmentNumber, segments) {
  return segments.find(function (item) {
    return item.number === segmentNumber;
  });
}

/**
 * HTML element id prefixes.
 */
const prefixes = {
  segmentation: 'segmentation',
  segment: 'segment',
  span: 'span-',
  colour: 'colour-',
  view: 'view-',
  delete: 'delete-',
  addSegment: 'add-segment-',
  saveSeg: 'save-seg-',
  saveRtss: 'save-rtss-',
  mergeSaveSeg: 'merge-save-seg-',
  mergeSaveRtss: 'merge-save-rtss-',
  volumes: 'span-volumes-',
  info: 'info-',
  details: 'details-',
  li: 'li-'
};

/**
 * Get the HTML id of a segmentation.
 *
 * @param {number} segmentationIndex The segmentation index.
 * @returns {string} The segmentation HTML id.
 */
function getSegmentationHtmlId(segmentationIndex) {
  return getHtmlId(prefixes.segmentation, segmentationIndex);
}

/**
 * Get the HTML id of a segment.
 *
 * @param {number} segmentNumber The segment number.
 * @param {number} segmentationIndex The segmentation index.
 * @returns {string} The segment HTML id.
 */
function getSegmentHtmlId(segmentNumber, segmentationIndex) {
  const segmentName = getHtmlId(prefixes.segment, segmentNumber);
  const segmentationName = getSegmentationHtmlId(segmentationIndex);
  return `${segmentName}-${segmentationName}`;
}

/**
 * Segmentation UI.
 */
export class SegmentationUI {

  /**
   * The associated viewer service.
   *
   * @type {ViewerService}
   */
  #service;

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
   * With overlap check flag.
   *
   * @type {boolean}
   */
  #withOverlapCheck = true;

  /**
   * With merge flag.
   *
   * @type {boolean}
   */
  #withMerge = true;

  /**
   * Colour array to pick from.
   *
   * @type {RGB[]}
   */
  #coloursPick = defaultColours.slice();

  /**
   * List of segmentations.
   *
   * @type {Segmentation[]}
   */
  #segmentations = [];


  /**
   * @param {ViewerService} service The associated viewer service.
   * @param {Document} [rootDoc] Optional root document,
   *   defaults to `window.document`.
   */
  constructor(service, rootDoc) {
    this.#service = service;
    if (typeof rootDoc !== 'undefined') {
      this.#rootDoc = rootDoc;
    }
  }

  /**
   * Get the next available colour from the colour list.
   *
   * @returns {RGB} The colour as {r,g,b}.
   */
  #nextColour() {
    // recreate if empty
    if (this.#coloursPick.length === 0) {
      logger.debug('Regenerating colours...');
      this.#coloursPick = defaultColours.slice();
    }
    // pick and remove first in list, return a copy
    return {...this.#coloursPick.shift()};
  }

  /**
   * Get a new segment.
   *
   * @param {number} number The segment number.
   * @returns {MaskSegment} The new segment.
   */
  #getNewSegment(number) {
    return {
      number,
      algorithmType: 'MANUAL',
      algorithmName: undefined,
      label: `s${number}`,
      displayRGBValue: this.#nextColour(),
      displayValue: undefined,
      propertyCategoryCode: getSegmentationCode(),
      propertyTypeCode: getSegmentationCode(),
      trackingId: undefined,
      trackingUid: undefined
    };
  }

  /**
   * Bind app to ui.
   */
  registerListeners() {
    this.#service.addEventListener('dataadd', this.#onDataAdd);
    this.#service.addEventListener('dataremove', this.#onDataRemove);
    this.#service.addEventListener('labelschanged', this.#onLabelsChanged);
    this.#service.addEventListener('tap', this.#onTap);
  };

  /**
   * Get the segmentation of the current brush selection.
   *
   * @returns {Segmentation|undefined} The segmentation.
   */
  #getSelectedSegmentation() {
    return this.#segmentations.find(
      (seg) => typeof seg.selectedSegmentNumber !== 'undefined');
  }

  /**
   * Mark segment list items as selected, unselecting the others.
   *
   * @param {HTMLElement[]} items The segment list items.
   */
  #selectSegmentItems(items) {
    // remove selected class from other rows
    const mainlist = this.#rootDoc.getElementById('segmentation-list');
    if (mainlist) {
      const allItems = mainlist.querySelectorAll('.data-item-list-item');
      allItems.forEach(item => item.classList.remove('selected'));
    }
    // mark these rows as selected
    items.forEach(item => item.classList.add('selected'));
  }

  /**
   * Handle 'tap' event: select the tapped segments rows,
   *   or clear the selection if no segment was tapped.
   *
   * @param {CustomEvent} event The event.
   */
  #onTap = (event) => {
    const items = [];
    for (const hit of event.detail.segments) {
      const segmentationIndex = this.#segmentations.findIndex((seg) => {
        return seg.dataId === hit.dataid;
      });
      if (segmentationIndex === -1) {
        continue;
      }
      for (const segmentNumber of hit.segmentnumbers) {
        const segmentId = getSegmentHtmlId(segmentNumber, segmentationIndex);
        const item = this.#rootDoc.getElementById(
          getHtmlId(prefixes.li, segmentId));
        if (item) {
          items.push(item);
        }
      }
    }
    // an empty list clears the selection
    this.#selectSegmentItems(items);
    if (items.length !== 0) {
      items[0].scrollIntoView({block: 'nearest'});
    }
  };

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
   * Get the container div.
   *
   * @returns {HTMLDivElement} The element.
   */
  #getContainerDiv() {
    return this.#rootDoc.getElementById('segmentations-fieldset');
  }

  /**
   * Calculate mask labels.
   *
   * @param {string} dataId The data id.
   */
  #calculateLabels(dataId) {
    const dataCtrl = this.#service.getDataController();
    const maskData = dataCtrl.get(dataId);
    if (!maskData) {
      throw new Error(
        `No data to calculate labels for dataId: ${dataId}`
      );
    }
    const image = maskData.image;
    image.recalculateLabels();
  }

  /**
   * Handle a labels changed event.
   *
   * @param {CustomEvent} event The change event.
   */
  #onLabelsChanged = (event) => {
    const segmentation =
      this.#segmentations.find(
        (seg) => {
          return seg.dataId === event.detail.dataid;
        }
      );

    if (typeof segmentation !== 'undefined') {
      segmentation.labels = event.detail.labels;
      // update quantification if shown
      const segmentationIndex = this.#segmentations.indexOf(segmentation);
      for (const segment of segmentation.segments) {
        const segmentId = getSegmentHtmlId(segment.number, segmentationIndex);
        const detailsDiv = this.#rootDoc.getElementById(
          getHtmlId(prefixes.details, segmentId));
        if (detailsDiv && !detailsDiv.hidden) {
          renderQuantification(detailsDiv,
            this.#getSegmentQuantificationGroups(segment, segmentation));
        }
      }
    }
  };

  /**
   * Add a segment HTML to the main HTML.
   *
   * @param {Segmentation} segmentation The segmentation.
   * @param {boolean} [selectFirst] Optional flag to select the first
   *   segment (and pass it to the brush).
   */
  #addSegmentationHtml(segmentation, selectFirst = false) {
    // segmentation as html
    const item = this.#getSegmentationHtml(
      segmentation, this.#segmentations.length - 1, selectFirst);

    const segList = this.#rootDoc.getElementById('segmentation-list');
    if (!segList) {
      logger.warn('Cannot find segmentation list element');
      return;
    }
    // add segmentation item
    const addItem = this.#rootDoc.getElementById('addsegmentationitem');
    if (addItem) {
      // remove and add after to make it last item
      addItem.remove();
      segList.appendChild(item);
      segList.appendChild(addItem);
    } else {
      segList.appendChild(item);
    }

    if (this.#withOverlapCheck) {
      this.#addOverlapCheckerSelection(this.#segmentations.length - 1);
    }
  }

  /**
   * Handle a dataadd event.
   *
   * @param {CustomEvent} event The dataadd event.
   */
  #onDataAdd = (event) => {
    const dataId = event.detail.dataid;
    const dataCtrl = this.#service.getDataController();
    const maskImage = dataCtrl.get(dataId).image;

    if (typeof maskImage !== 'undefined' && maskImage.isMask()) {
      // setup html if needed
      if (!this.#rootDoc.getElementById('segmentation-list')) {
        this.#setupHtml();
      }

      const segHelper = new MaskSegmentHelper(maskImage);
      if (segHelper.getNumberOfSegments() === 0) {
        // manually created segmentation with no segments
        const segmentation = this.#getSelectedSegmentation();
        if (typeof segmentation === 'undefined') {
          // default segment created at first brush
          const segmentNumber = 1;
          const segment = this.#getNewSegment(segmentNumber);
          // default segmentation
          const defaultSegmentation = {
            dataId,
            labels: [],
            segments: [segment],
            viewHelper: new MaskSegmentViewHelper()
          };
          // add to list
          this.#segmentations.push(defaultSegmentation);
          // add to html, select segment to pass the mask id to the brush
          this.#addSegmentationHtml(defaultSegmentation, true);
        } else if (typeof segmentation.dataId === 'undefined') {
          // segmentation created with add segmentation
          segmentation.dataId = dataId;
          for (const segment of segmentation.segments) {
            segHelper.addSegment(segment);
          }
        }
      } else {
        // segmentation from loaded file, pass segments to ui
        const imgMeta = maskImage.getMeta();
        if (typeof imgMeta !== 'undefined') {
          // loaded segmentation
          const segmentation = {
            dataId,
            labels: [],
            segments: imgMeta.custom.segments.slice(),
            viewHelper: new MaskSegmentViewHelper()
          };
          // add to list
          this.#segmentations.push(segmentation);
          // calculate labels
          this.#calculateLabels(dataId);
          // add to html
          this.#addSegmentationHtml(segmentation);

          // remove colour from colour pick
          for (const segment of imgMeta.custom.segments) {
            const index = this.#coloursPick.findIndex((item) =>
              item.r === segment.displayRGBValue.r &&
              item.g === segment.displayRGBValue.g &&
              item.b === segment.displayRGBValue.b);
            if (index !== -1) {
              this.#coloursPick.splice(index, 1);
            }
          }
        }
      }

      if (this.#withMerge && this.#canMerge()) {
        const mergeSegButton =
          this.#rootDoc.getElementById(`${prefixes.mergeSaveSeg}0`);
        if (mergeSegButton) {
          mergeSegButton.disabled = false;
        }
        if (this.#withRtss) {
          const mergeRtssButton =
            this.#rootDoc.getElementById(`${prefixes.mergeSaveRtss}0`);
          if (mergeRtssButton) {
            mergeRtssButton.disabled = false;
          }
        }
      }
    }
  };

  /**
   * Handle a dataremove event.
   *
   * @param {CustomEvent} event The dataremove event.
   */
  #onDataRemove = (event) => {
    const dataId = event.detail.dataid;
    const index = this.#segmentations.findIndex(
      (seg) => seg.dataId === dataId);
    if (index === -1) {
      return;
    }
    const segmentation = this.#segmentations[index];
    // keep the entry in the list: html ids and handlers use the
    // segmentation index, clear its data id to mark it as removed
    segmentation.dataId = undefined;
    segmentation.selectedSegmentNumber = undefined;

    // remove segmentation item
    const item = this.#rootDoc.getElementById(getSegmentationHtmlId(index));
    if (item) {
      item.remove();
    }

    // remove from overlap checker
    if (this.#withOverlapCheck) {
      for (const selectId of [
        'overlap-checker-select-list-0',
        'overlap-checker-select-list-1'
      ]) {
        const select = this.#rootDoc.getElementById(selectId);
        const option = select?.querySelector(`option[value="${index}"]`);
        if (option) {
          option.remove();
        }
      }
    }

    // disable merge if no more possible
    if (this.#withMerge && !this.#canMerge()) {
      const mergeSegButton =
        this.#rootDoc.getElementById(`${prefixes.mergeSaveSeg}0`);
      if (mergeSegButton) {
        mergeSegButton.disabled = true;
      }
      if (this.#withRtss) {
        const mergeRtssButton =
          this.#rootDoc.getElementById(`${prefixes.mergeSaveRtss}0`);
        if (mergeRtssButton) {
          mergeRtssButton.disabled = true;
        }
      }
    }
  };

  /**
   * Check if the first two segmentations can be merged:
   * they both need mask data.
   *
   * @returns {boolean} True if mergeable.
   */
  #canMerge() {
    return this.#segmentations.length > 1 &&
      typeof this.#segmentations[0].dataId !== 'undefined' &&
      typeof this.#segmentations[1].dataId !== 'undefined';
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
    addSegmentationButton.onclick = (/*event*/) => {
      // new segmentation
      const segmentation = {
        dataId: undefined,
        labels: [],
        segments: [this.#getNewSegment(1)],
        viewHelper: new MaskSegmentViewHelper()
      };
      // add to list
      this.#segmentations.push(segmentation);
      // add to html, select segment to start drawing
      this.#addSegmentationHtml(segmentation, true);
    };
    addItem.appendChild(addSegmentationButton);
    segList.appendChild(addItem);


    // setup and append
    this.#setupContainerDiv();
    const containerDiv = this.#getContainerDiv();
    if (!containerDiv) {
      return;
    }
    containerDiv.appendChild(segList);

    if (this.#withOverlapCheck) {
      const overlapChecker = this.#getSegmentationOverlapHtml();
      containerDiv.appendChild(overlapChecker);
    }
    if (this.#withMerge) {
      const mergeHtml = this.#getSegmentationMergeHtml();
      containerDiv.appendChild(mergeHtml);
    }
  }

  /**
   * Select a segment in the brush tool.
   *
   * @param {number} segmentNumber The segment number.
   * @param {Segmentation} segmentation The segmentation.
   */
  #appSelectSegment(segmentNumber, segmentation) {
    // store selection: only one selected segment for all segmentations
    for (const seg of this.#segmentations) {
      seg.selectedSegmentNumber = undefined;
    }
    segmentation.selectedSegmentNumber = segmentNumber;
    const dataCtrl = this.#service.getDataController();

    // add segment if not present
    const data = dataCtrl.get(segmentation.dataId);
    if (typeof data !== 'undefined') {
      const maskImage = data.image;
      const segHelper = new MaskSegmentHelper(maskImage);
      // add segment to mask
      if (!segHelper.hasSegment(segmentNumber)) {
        logger.debug(`Add segment ${segmentNumber}`);
        segHelper.addSegment(getSegment(
          segmentNumber, segmentation.segments
        ));
      }
    }

    // app features
    const features = {
      selectedSegmentNumber: segmentNumber,
      maskDataId: undefined,
      createMask: false
    };
    if (typeof segmentation.dataId !== 'undefined') {
      features.maskDataId = segmentation.dataId;
    } else {
      features.createMask = true;
    }
    logger.debug(
      `set tool features [select] ${JSON.stringify(features)}`);
    this.#service.setToolFeatures(features);
  }

  /**
   * Change a segment colour.
   *
   * @param {HTMLInputElement} colourInput The colour input.
   * @param {MaskSegment} segment The segment.
   * @param {Segmentation} segmentation The segmentation.
   */
  #changeSegmentColour(colourInput, segment, segmentation) {
    const newHexColour = colourInput.value;
    const segmentHexColour = rgbToHex(segment.displayRGBValue);

    if (newHexColour !== segmentHexColour) {
      // update colours
      const newRgbColour = hexToRgb(newHexColour);
      // get mask
      const dataCtrl = this.#service.getDataController();
      const maskData = dataCtrl.get(segmentation.dataId);
      // change if possible
      if (typeof maskData !== 'undefined') {
        // create change colour command
        const previousColour = segment.displayRGBValue;
        const chgCmd = new ChangeSegmentColourCommand(
          maskData.image, segment, newRgbColour);
        chgCmd.onExecute = function (/*event*/) {
          // not needed the first time but on undo/redo
          colourInput.value = newHexColour;
        };
        chgCmd.onUndo = function () {
          // not needed the first time but on undo/redo
          colourInput.value = rgbToHex(previousColour);
        };
        // execute command
        if (chgCmd.isValid()) {
          chgCmd.execute();
          const undoCtrl = this.#service.getUndoController();
          undoCtrl.addToUndoStack(chgCmd);
        }
      } else {
        // no mask yet: only update segment, its colour will be
        // passed to the mask palette when the segment is added to it
        segment.displayRGBValue = newRgbColour;
      }
    }
  }

  /**
   * Go to a segment: set the view position to its first label centroid.
   *
   * @param {MaskSegment} segment The segment.
   * @param {Segmentation} segmentation The segmentation.
   */
  #gotoSegment(segment, segmentation) {
    // Find the first label for this segment
    const label =
      segmentation.labels.find((item) => {
        return item.id === segment.number;
      });

    if (typeof label !== 'undefined') {
      const dataId = segmentation.dataId;
      const stgCtrl = this.#service.getStageController();
      const layers = stgCtrl.getViewLayersByDataId(dataId);
      for (const layer of layers) {
        layer.setCurrentPosition(label.centroid);
        layer.highlightSegment(segment.number);
      }
    } else {
      logger.warn('No label for this segment');
    }
  }

  /**
   * Toggle a segment visibility.
   *
   * @param {HTMLButtonElement} viewButton The view button.
   * @param {MaskSegment} segment The segment.
   * @param {Segmentation} segmentation The segmentation.
   */
  #toggleSegmentView(viewButton, segment, segmentation) {
    // toggle hidden
    const segViewHelper = segmentation.viewHelper;
    if (isButtonPressed(viewButton)) {
      setButtonPressed(viewButton, false);
      segViewHelper.removeFromHidden(segment.number);
    } else {
      setButtonPressed(viewButton, true);
      segViewHelper.addToHidden(segment.number);
    }
    // apply hidden
    const stageCtrl = this.#service.getStageController();
    const vls = stageCtrl.getViewLayersByDataId(segmentation.dataId);
    if (vls.length === 0) {
      logger.warn('No layers to show/hide seg');
    }
    for (const vl of vls) {
      const vc = vl.getViewController();
      vc.setMaskViewHelper(segViewHelper);
    }
  }

  /**
   * Delete a segment.
   *
   * @param {MaskSegment} segment The segment.
   * @param {Segmentation} segmentation The segmentation.
   * @param {HTMLLIElement} listItem The segment list item.
   * @param {HTMLButtonElement} viewButton The segment view button.
   */
  #deleteSegment(segment, segmentation, listItem, viewButton) {
    const parent = listItem.parentNode;
    if (!parent) {
      throw new Error('No segment item parent');
    }
    const nextItem = listItem.nextSibling;
    // store selected state before removal
    const wasSelected =
      segmentation.selectedSegmentNumber === segment.number;

    // get mask
    const dataCtrl = this.#service.getDataController();
    const data = dataCtrl.get(segmentation.dataId);
    // delete if possible
    if (typeof data !== 'undefined') {
      // create delete command
      const delCmd = new DeleteSegmentCommand(data.image, segment);
      delCmd.onExecute = function () {
        listItem.remove();
        if (segmentation.viewHelper.isHidden(segment.number)) {
          segmentation.viewHelper.removeFromHidden(segment.number);
          // undo brings the segment back visible
          setButtonPressed(viewButton, false);
        }
      };
      delCmd.onUndo = function () {
        parent.insertBefore(listItem, nextItem);
      };
      // execute command
      if (delCmd.isValid()) {
        delCmd.execute();
        const undoCtrl = this.#service.getUndoController();
        undoCtrl.addToUndoStack(delCmd);
      }
      // update labels
      this.#calculateLabels(segmentation.dataId);
    } else {
      // no mask yet: remove from the segmentation segments so that
      // it is not added to the mask when it gets created
      const index = segmentation.segments.indexOf(segment);
      if (index !== -1) {
        segmentation.segments.splice(index, 1);
      }
      listItem.remove();
    }

    // select first remaining segment if the deleted one was selected
    if (wasSelected) {
      segmentation.selectedSegmentNumber = undefined;
      const segmentationIndex = this.#segmentations.indexOf(segmentation);
      for (const remaining of segmentation.segments) {
        const segmentId =
          getSegmentHtmlId(remaining.number, segmentationIndex);
        const item = parent.querySelector(
          `#${getHtmlId(prefixes.li, segmentId)}`);
        if (item instanceof HTMLElement) {
          this.#selectSegment(item, remaining, segmentation);
          break;
        }
      }
    }
  }

  /**
   * Get a segment quantification groups.
   *
   * @param {MaskSegment} segment The segment.
   * @param {Segmentation} segmentation The segmentation.
   * @returns {QuantificationGroup[]} The quantification groups.
   */
  #getSegmentQuantificationGroups(segment, segmentation) {
    const labelsInfo = this.#getLabelsInfo(segment, segmentation);
    const statsList = this.#getHistogramStats(segment, segmentation);
    // only show the volume index for multi volume data
    const volumeSuffix = (volume) => {
      return statsList.length > 1 ? ` (#${volume})` : '';
    };
    // statistics as quantification
    const statsToQuantification = (stats, unit) => {
      const res = {};
      for (const key of Object.keys(stats)) {
        res[key] = {value: stats[key], unit};
      }
      return res;
    };
    // same label order as labels info
    const segmentLabels = segmentation.labels.filter(
      (label) => label.id === segment.number);

    const groups = [];
    const nLabels = labelsInfo.length;
    for (let i = 0; i < nLabels; ++i) {
      const prefix = nLabels > 1 ? `Label #${i} ` : '';
      groups.push(...getQuantificationGroups(labelsInfo[i], {
        geometry: prefix === '' ? 'Geometry' : `${prefix}geometry`
      }));
      // label histogram stats, if available
      for (const item of statsList) {
        const labelItem = item.labelStats?.find(
          (element) => element.label === segmentLabels[i]);
        if (typeof labelItem !== 'undefined') {
          const title = prefix === ''
            ? 'Pixel values' : `${prefix}pixel values`;
          groups.push(...getQuantificationGroups(
            statsToQuantification(labelItem.stats, labelItem.unit),
            {pixelValues: title + volumeSuffix(item.volume)}));
        }
      }
    }
    // global histogram stats
    if (nLabels > 1) {
      for (const item of statsList) {
        groups.push(...getQuantificationGroups(
          statsToQuantification(item.stats, item.unit),
          {pixelValues: `All pixel values${volumeSuffix(item.volume)}`}));
      }
    }
    return groups;
  }

  /**
   * Toggle a segment information section.
   *
   * @param {HTMLButtonElement} infoButton The info button.
   * @param {HTMLDivElement} detailsDiv The details element.
   * @param {MaskSegment} segment The segment.
   * @param {Segmentation} segmentation The segmentation.
   */
  #toggleSegmentInfo(infoButton, detailsDiv, segment, segmentation) {
    const open = detailsDiv.hidden;
    if (open) {
      renderQuantification(detailsDiv,
        this.#getSegmentQuantificationGroups(segment, segmentation));
    }
    detailsDiv.hidden = !open;
    setButtonPressed(infoButton, open);
    infoButton.setAttribute('aria-expanded', String(open));
  }

  /**
   * Select a segment: mark its row as selected and pass it to the brush
   * if it is the selected tool.
   *
   * @param {HTMLElement} item The segment list item.
   * @param {MaskSegment} segment The segment.
   * @param {Segmentation} segmentation The segmentation.
   */
  #selectSegment(item, segment, segmentation) {
    this.#selectSegmentItems([item]);
    const toolboxCtrl = this.#service.getToolboxController();
    if (toolboxCtrl.getSelectedTool() instanceof Brush) {
      this.#appSelectSegment(segment.number, segmentation);
    }
  }

  /**
   * Get the HTML span element for a segment.
   *
   * @param {MaskSegment} segment The segment.
   * @param {number} segmentationIndex The segmentation index.
   * @param {boolean} [selectSegment] Optional flag to select segment.
   * @returns {HTMLLIElement} The HTML element.
   */
  #getSegmentHtml(segment, segmentationIndex, selectSegment = false) {
    const segmentation = this.#segmentations[segmentationIndex];
    const segmentId = getSegmentHtmlId(segment.number, segmentationIndex);

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
    setButtonPressed(infoButton, false);
    infoButton.id = getHtmlId(prefixes.info, segmentId);
    infoButton.title = 'Show/hide quantification';
    infoButton.setAttribute('aria-expanded', 'false');
    infoButton.setAttribute('aria-controls', detailsDiv.id);
    infoButton.onclick = (event) => {
      // do not propagate to parent that triggers goto
      event.stopPropagation();
      this.#toggleSegmentInfo(infoButton, detailsDiv, segment, segmentation);
    };

    // segment colour
    const colourInput = document.createElement('input');
    colourInput.type = 'color';
    colourInput.title = 'Change segment colour';
    colourInput.id = getHtmlId(prefixes.colour, segmentId);
    colourInput.value = rgbToHex(segment.displayRGBValue);
    colourInput.onchange = () => {
      this.#changeSegmentColour(colourInput, segment, segmentation);
    };
    colourInput.onclick = (event) => {
      // do not propagate to parent that triggers goto
      event.stopPropagation();
    };

    // segment view
    const viewButton = getButton('View');
    setButtonPressed(viewButton, false);
    viewButton.id = getHtmlId(prefixes.view, segmentId);
    viewButton.title = 'Show/hide segment';
    viewButton.onclick = (event) => {
      // do not propagate to parent that triggers goto
      event.stopPropagation();
      this.#toggleSegmentView(viewButton, segment, segmentation);
    };

    // list item
    const item = document.createElement('li');

    // segment delete
    const deleteButton = getButton('Delete');
    deleteButton.id = getHtmlId(prefixes.delete, segmentId);
    deleteButton.title = 'Delete segment';
    deleteButton.onclick = (event) => {
      // do not propagate to parent that triggers goto
      event.stopPropagation();
      this.#deleteSegment(segment, segmentation, item, viewButton);
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
    item.id = getHtmlId(prefixes.li, segmentId);
    item.className = 'data-item-list-item';
    item.title = 'Select and go to segment';
    item.appendChild(contentDiv);
    item.appendChild(actionsDiv);
    item.appendChild(detailsDiv);

    // click on li to select and go to segment
    item.onclick = () => {
      this.#selectSegment(item, segment, segmentation);
      this.#gotoSegment(segment, segmentation);
    };

    if (selectSegment) {
      this.#selectSegment(item, segment, segmentation);
    }

    return item;
  }

  /**
   * Add a new segment to a segmentation.
   *
   * @param {number} segmentationIndex The segmentation index.
   * @param {HTMLUListElement} listDiv The segment list element.
   */
  #addSegment(segmentationIndex, listDiv) {
    const segments = this.#segmentations[segmentationIndex].segments;

    // create new segment: numbers are not necessarily contiguous
    const maxNumber = segments.reduce(
      (max, segment) => Math.max(max, segment.number), 0);
    const newSegment = this.#getNewSegment(maxNumber + 1);
    // add to list
    segments.push(newSegment);

    // add item to list
    listDiv.appendChild(
      this.#getSegmentHtml(newSegment, segmentationIndex, true)
    );
  }

  /**
   * Save a segmentation as SEG or RTSS.
   *
   * @param {Segmentation} segmentation The segmentation.
   * @param {string} fileName The file name.
   * @param {boolean} asRtss Whether to save as RTSS.
   */
  #saveSegmentation(segmentation, fileName, asRtss) {
    const dataCtrl = this.#service.getDataController();
    const maskData = dataCtrl.get(segmentation.dataId);
    if (typeof maskData === 'undefined') {
      const format = asRtss ? 'RTSS' : 'SEG';
      throw new Error(`Cannot save ${format} without mask image`);
    }
    this.#saveData(maskData.image, fileName, asRtss);
  }

  /**
   * Merge the first two segmentations and save the result.
   *
   * @param {boolean} asRtss Whether to save as RTSS.
   */
  #mergeSave(asRtss) {
    if (!this.#canMerge()) {
      throw new Error('Cannot merge segmentations without mask data');
    }
    // merge first two masks
    const dataCtrl = this.#service.getDataController();
    const maskId0 = this.#segmentations[0].dataId;
    const maskImage0 = dataCtrl.get(maskId0).image;
    const maskId1 = this.#segmentations[1].dataId;
    const maskImage1 = dataCtrl.get(maskId1).image;

    const mergedImage = mergeMaskImages(maskImage0, maskImage1);

    // save
    let fileName;
    if (asRtss) {
      fileName = 'merged-segmentation-rtss';
    } else {
      fileName = 'merged-segmentation-seg';
    }
    this.#saveData(mergedImage, fileName, asRtss);
  }

  /**
   * Save a segmentation or RTSS.
   *
   * @param {MaskImage} maskImage The mask data.
   * @param {string} fileName The file name.
   * @param {boolean} asRtss Whether to save as RTSS.
   */
  #saveData(maskImage, fileName, asRtss = false) {
    const dataCtrl = this.#service.getDataController();
    const refSeriesUID = maskImage.getMaskReferencedSeriesUID();
    if (typeof refSeriesUID === 'undefined') {
      throw new Error('Cannot save without referenced UID');
    }
    const sourceId = dataCtrl.getDataIdFromSeriesUid(refSeriesUID);
    if (typeof sourceId === 'undefined') {
      throw new Error('Cannot save without referenced ID');
    }
    const sourceData = dataCtrl.get(sourceId);
    if (typeof sourceData === 'undefined') {
      throw new Error('Cannot save without source image');
    }
    // dicom elements
    let fac;
    if (asRtss) {
      fac = new RtStructFactory();
    } else {
      fac = new MaskFactory();
    }
    const dicomElements = fac.toDicom(
      maskImage,
      maskImage.getMeta().custom.segments,
      sourceData.image,
      {
        MediaStorageSOPInstanceUID: '1.2.3.4.5.6.1000',
        SeriesInstanceUID: '1.2.3.4.5.6',
        SeriesNumber: '1',
        SOPInstanceUID: '1.2.3.4.5.6.1000',
      }
    );
    // create writer with default rules
    const writer = new DicomWriter();
    let dicomBuffer;
    try {
      dicomBuffer = writer.getBuffer(dicomElements);
    } catch (error) {
      logger.error(error.message);
      alert(error.message);
      return;
    }
    // view as Blob to allow download
    const blob = new Blob([dicomBuffer], {type: 'application/dicom'});

    // temporary link to download
    const element = document.createElement('a');
    element.href = window.URL.createObjectURL(blob);
    element.download = `${fileName}.dcm`;
    // trigger download
    element.click();
    URL.revokeObjectURL(element.href);
  };

  /**
   * Get the per volume histogram statistics of the reference image
   * values inside a segment.
   *
   * @param {MaskSegment} segment The segment.
   * @param {Segmentation} segmentation The segmentation.
   * @returns {{volume: number, stats: Statistics, unit?: string,
   *   labelStats?: {label: Label, stats: Statistics, unit?: string}[]}[]}
   *   The statistics with their histogram unit, with per label
   *   statistics if available, empty if the reference image is
   *   not available.
   */
  #getHistogramStats(segment, segmentation) {
    const dataCtrl = this.#service.getDataController();
    const maskData = dataCtrl.get(segmentation.dataId);
    if (typeof maskData === 'undefined') {
      return [];
    }
    const maskImage = maskData.image;
    const refSeriesUID = maskImage.getMaskReferencedSeriesUID();
    if (typeof refSeriesUID === 'undefined') {
      return [];
    }
    const refDataId = dataCtrl.getDataIdFromSeriesUid(refSeriesUID);
    if (typeof refDataId === 'undefined') {
      return [];
    }
    const refImage = dataCtrl.get(refDataId).image;

    let volumeHistograms;
    try {
      volumeHistograms = maskImage.getHistogramBySegment(
        refImage, segment.number.toString());
    } catch (error) {
      logger.warn(
        `Cannot calculate segment histogram: ${error.message}`);
      return [];
    }

    const res = [];
    for (const item of volumeHistograms) {
      const stats = item.histogram.getStats();
      if (typeof stats === 'undefined') {
        continue;
      }
      const resItem = {
        volume: item.volume,
        stats,
        unit: item.histogram.getUnit()
      };
      if (typeof item.labelHistograms !== 'undefined') {
        resItem.labelStats = [];
        for (const labelItem of item.labelHistograms) {
          const labelStats = labelItem.histogram.getStats();
          if (typeof labelStats !== 'undefined') {
            resItem.labelStats.push({
              label: labelItem.label,
              stats: labelStats,
              unit: labelItem.histogram.getUnit()
            });
          }
        }
      }
      res.push(resItem);
    }
    return res;
  }

  /**
   * Get labels info.
   *
   * @param {MaskSegment} segment The segment.
   * @param {Segmentation} segmentation The segmentation.
   * @returns {object[]} The labels info.
   */
  #getLabelsInfo(segment, segmentation) {
    // get the labels info strings
    const labelsInfo = [];
    for (const label of segmentation.labels) {
      if (label.id === segment.number) {
        const labelInfo = {};
        labelInfo.volume = label.volume;

        if (typeof label.diameters !== 'undefined') {
          if (typeof label.diameters.major.diameter.value !== 'undefined') {
            labelInfo.majorDiameter = label.diameters.major.diameter;
          }
          if (typeof label.diameters.minor.diameter.value !== 'undefined') {
            labelInfo.minorDiameter = label.diameters.minor.diameter;
          }
          if (typeof label.height !== 'undefined') {
            labelInfo.height = label.height;
          }
        }

        labelsInfo.push(labelInfo);
      }
    }
    return labelsInfo;
  }

  /**
   * Get the HTML list element for a segmentation.
   *
   * @param {Segmentation} segmentation The segmentation.
   * @param {number} segmentationIndex The segmentation index.
   * @param {boolean} [selectFirst] Optional flag to select the first
   *   segment.
   * @returns {HTMLLIElement} The HTML element.
   */
  #getSegmentationHtml(segmentation, segmentationIndex, selectFirst = false) {
    const segmentationName = getSegmentationHtmlId(segmentationIndex);

    // name
    const nameDiv = document.createElement('span');
    nameDiv.id = `${segmentationName}-name`;
    nameDiv.className = 'data-item-name';
    nameDiv.appendChild(document.createTextNode(segmentationName));

    // save button
    const saveSegButton = getButton('Save');
    saveSegButton.title = 'Save SEG';
    saveSegButton.id = getHtmlId(prefixes.saveSeg, segmentationName);
    saveSegButton.onclick = () => {
      this.#saveSegmentation(segmentation, `${segmentationName}-seg`, false);
    };

    const saveRtssButton = getButton('Save');
    saveRtssButton.title = 'Save RTSS';
    saveRtssButton.id = getHtmlId(prefixes.saveRtss, segmentationName);
    saveRtssButton.onclick = () => {
      this.#saveSegmentation(segmentation, `${segmentationName}-rtss`, true);
    };

    // add button
    const addButton = getButton('Add');
    addButton.title = 'Add segment';
    addButton.id = getHtmlId(prefixes.addSegment, segmentationName);
    addButton.onclick = () => {
      this.#addSegment(segmentationIndex, listDiv);
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

    // segment list
    const listDiv = document.createElement('ul');
    listDiv.id = `${segmentationName}-list`;
    listDiv.className = 'data-item-list';
    for (let i = 0; i < segmentation.segments.length; ++i) {
      listDiv.appendChild(this.#getSegmentHtml(
        segmentation.segments[i], segmentationIndex, selectFirst && i === 0));
    }

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

  /**
   * Add to the list of segmentations on the overlap checker.
   *
   * @param {number} segmentationIndex The segmentation index.
   */
  #addOverlapCheckerSelection(segmentationIndex) {
    const overlapSelect0 =
      this.#rootDoc.getElementById('overlap-checker-select-list-0');
    const overlapSelect1 =
      this.#rootDoc.getElementById('overlap-checker-select-list-1');
    if (!overlapSelect0 || !overlapSelect1) {
      logger.warn('Cannot find overlap checker select elements');
      return;
    }

    // use the segmentation index as value: the data id can be
    // undefined at this point (segmentation without mask yet)
    const newOption0 = document.createElement('option');
    newOption0.innerHTML = getSegmentationHtmlId(segmentationIndex);
    newOption0.value = segmentationIndex.toString();

    const newOption1 = document.createElement('option');
    newOption1.innerHTML = getSegmentationHtmlId(segmentationIndex);
    newOption1.value = segmentationIndex.toString();

    overlapSelect0.appendChild(newOption0);
    overlapSelect1.appendChild(newOption1);
  }

  /**
   * Get the HTML for the segmentation overlap checker.
   *
   * @returns {HTMLLIElement} The HTML element.
   */
  #getSegmentationOverlapHtml() {
    // create overlap checker
    const overlapChecker = document.createElement('div');
    overlapChecker.id = 'overlap-checker';

    // label
    const overlapLabel = document.createElement('label');
    overlapLabel.innerHTML = 'Overlap:';
    overlapChecker.appendChild(overlapLabel);

    // dropdowns
    const overlapSelect0 = document.createElement('select');
    const overlapSelect1 = document.createElement('select');
    overlapSelect0.id = 'overlap-checker-select-list-0';
    overlapSelect1.id = 'overlap-checker-select-list-1';
    overlapChecker.appendChild(overlapSelect0);
    overlapChecker.appendChild(overlapSelect1);

    // button
    const overlapButton = document.createElement('button');
    overlapButton.innerHTML = 'Check Overlap';
    overlapChecker.appendChild(overlapButton);

    // result holder
    const overlapResult = document.createElement('div');
    overlapChecker.appendChild(overlapResult);

    overlapButton.onclick = (/*event*/) => {
      const segmentation0 =
        this.#segmentations[parseInt(overlapSelect0.value, 10)];
      const segmentation1 =
        this.#segmentations[parseInt(overlapSelect1.value, 10)];
      const dataCtrl = this.#service.getDataController();
      const maskData0 = dataCtrl.get(segmentation0?.dataId);
      const maskData1 = dataCtrl.get(segmentation1?.dataId);
      if (typeof maskData0 === 'undefined' ||
        typeof maskData1 === 'undefined') {
        overlapResult.textContent = 'Cannot check overlap: missing mask data.';
        return;
      }
      const maskImage0 = maskData0.image;
      const maskImage1 = maskData1.image;
      const segHelper0 = new MaskSegmentHelper(maskImage0);
      const segHelper1 = new MaskSegmentHelper(maskImage1);
      const overlap = segHelper0.findOverlap(segHelper1);

      overlapResult.replaceChildren(); // clear old results
      const overlapList = document.createElement('ul');
      for (
        const [/*segmentNumber0*/, segmentOverlap] of
        Object.entries(overlap)
      ) {
        // title (segment that these overlaps are for)
        // (use textContent: labels come from loaded data)
        const segmentLi = document.createElement('li');
        const overlapStrings = Object.values(segmentOverlap.overlap).map(
          (count) => `${count.label} (${
            count.count } voxels, ${
            (count.percentage).toPrecision(4) }%)`
        );
        segmentLi.textContent = `${ segmentOverlap.label
        } (${segmentOverlap.count} voxels): ${overlapStrings.join(', ')}`;

        overlapList.appendChild(segmentLi);
      }
      overlapResult.appendChild(overlapList);
    };

    return overlapChecker;
  }

  /**
   * Get the HTML for the segmentation merge.
   *
   * @returns {HTMLLIElement} The HTML element.
   */
  #getSegmentationMergeHtml() {
    // create main div
    const mergeDiv = document.createElement('div');
    mergeDiv.id = 'segmentation-merge';

    // label
    const mergeLabel = document.createElement('label');
    mergeLabel.innerHTML = 'Merge Segmentation 0 & 1:';
    mergeDiv.appendChild(mergeLabel);

    const saveSegButton = getButton('Save');
    saveSegButton.disabled = true;
    saveSegButton.title = 'Merge and Save SEG';
    saveSegButton.id = getHtmlId(prefixes.mergeSaveSeg, '0');
    saveSegButton.onclick = () => {
      this.#mergeSave(false);
    };

    const saveRtssButton = getButton('Save');
    saveRtssButton.disabled = true;
    saveRtssButton.title = 'Merge and Save RTSS';
    saveRtssButton.id = getHtmlId(prefixes.mergeSaveRtss, '0');
    saveRtssButton.onclick = () => {
      this.#mergeSave(true);
    };

    mergeDiv.appendChild(saveSegButton);
    if (this.#withRtss) {
      mergeDiv.appendChild(saveRtssButton);
    }

    return mergeDiv;
  }

}; // SegmentationUI
