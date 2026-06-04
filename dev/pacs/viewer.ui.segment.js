import {DicomWriter} from '../../src/dicom/dicomWriter.js';
import {
  rgbToHex,
  hexToRgb,
} from '../../src/utils/colour.js';
import {logger} from '../../src/utils/logger.js';
import {i18n} from '../../src/utils/i18n.js';
import {getSegmentationCode} from '../../src/dicom/dicomCode.js';
import {getReferencedSeriesUID} from '../../src/dicom/dicomImage.js';
import {MaskFactory} from '../../src/image/maskFactory.js';
import {MaskSegmentHelper} from '../../src/image/maskSegmentHelper.js';
import {MaskSegmentViewHelper} from '../../src/image/maskSegmentViewHelper.js';
import {
  ChangeSegmentColourCommand
} from '../../src/command/changeSegmentColourCommand.js';
import {
  DeleteSegmentCommand
} from '../../src/command/deleteSegmentCommand.js';

import {
  getHtmlId,
  getRootFromHtmlId
} from './viewer.ui.js';
import {
  getButton,
  setButtonPressed,
  isButtonPressed
} from './viewer.ui.icons.js';

/**
 * @import {App} from '../../src/app/application.js';
 * @import {MaskSegment} from '../../src/dicom/dicomSegment.js';
 * @import {RGB} from '../../src/utils/colour.js';
 */

/**
 * Segmentation type.
 *
 * @typedef Segmentation
 * @property {number} dataId The segmentation data ID.
 * @property {object[]} labels The segmentation labels.
 * @property {boolean} hasNewSegments If the segmentation is new.
 * @property {MaskSegment[]} segments The segmentation segments.
 * @property {MaskSegmentViewHelper} viewHelper A view helper.
 */

// global vars
/**
 * List of possible colours.
 *
 * @type {RGB[]}
 */
const _colours = [
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
 * Colour array to pick from.
 *
 * @type {RGB[]}
 */
let _coloursPick = _colours.slice();
/**
 * List of segmentations.
 *
 * @type {Segmentation[]}
 */
const _segmentations = [];

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
 * Get the next available colour from the colour list.
 *
 * @returns {RGB} The colour as {r,g,b}.
 */
function nextColour() {
  // recreate if empty
  if (_coloursPick.length === 0) {
    console.log('Regenerating colours...');
    _coloursPick = _colours.slice();
  }
  // pick first in list
  const colour = _coloursPick[0];
  // remove picked
  _coloursPick.splice(0, 1);
  // return first
  return colour;
}

/**
 * Get a new segment.
 *
 * @param {number} number The segment number.
 * @returns {MaskSegment} The new segment.
 */
function getNewSegment(number) {
  return {
    number,
    algorithmType: 'MANUAL',
    algorithmName: undefined,
    label: `s${number}`,
    displayRGBValue: nextColour(),
    displayValue: undefined,
    propertyCategoryCode: getSegmentationCode(),
    propertyTypeCode: getSegmentationCode(),
    trackingId: undefined,
    trackingUid: undefined
  };
}

/**
 * HTML element id prefixes.
 */
const prefixes = {
  segmentation: 'segmentation',
  segment: 'segment',
  span: 'span-',
  select: 'select-',
  colour: 'colour-',
  view: 'view-',
  delete: 'delete-',
  addSegment: 'add-segment-',
  selectEraser: 'select-eraser-',
  save: 'save-',
  volumes: 'span-volumes-',
  info: 'info-',
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
 * Get a segmentation index from an HTML id.
 *
 * @param {string} segmentationName The segmentation HTML id.
 * @returns {number} The segmentation index.
 */
function splitSegmentationHtmlId(segmentationName) {
  const indexStr = getRootFromHtmlId(
    prefixes.segmentation, segmentationName);
  return parseInt(indexStr, 10);
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
 * Get a segment index and number from an HTML id.
 *
 * @param {string} segmentId The segment id.
 * @returns {object} The segment index and number.
 */
function splitSegmentHtmlId(segmentId) {
  const split = segmentId.split('-');
  const numberStr = getRootFromHtmlId(prefixes.segment, split[0]);
  return {
    segmentNumber: parseInt(numberStr, 10),
    segmentationIndex: splitSegmentationHtmlId(split[1])
  };
}

/**
 * Segmentation UI.
 */
export class SegmentationUI {

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
   * With overlap check flag.
   *
   * @type {boolean}
   */
  #withOverlapCheck = true;

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
    this.#app.addEventListener('labelschanged', this.#onLabelsChanged);
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
   * @param {number} dataId The data id.
   */
  #calculateLabels(dataId) {
    const dataCtrl = this.#app.getDataController();
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
      _segmentations.find(
        (seg) => {
          return seg.dataId === event.detail.dataid;
        }
      );

    if (typeof segmentation !== 'undefined') {
      segmentation.labels = event.detail.labels;
    }
  };

  /**
   * Add a segment HTML to the main HTML.
   *
   * @param {Segmentation} segmentation The segmentation.
   */
  #addSegmentationHtml(segmentation) {
    // segmentation as html
    const item =
      this.#getSegmentationHtml(segmentation, _segmentations.length - 1);

    // add segmentation item
    const addItem = this.#rootDoc.getElementById('addsegmentationitem');
    // remove and add after to make it last item
    addItem.remove();

    // update list
    const segList = this.#rootDoc.getElementById('segmentation-list');
    segList.appendChild(item);
    segList.appendChild(addItem);

    if (this.#withOverlapCheck) {
      this.#addOverlapCheckerSelection(segmentation, _segmentations.length - 1);
    }
  }

  /**
   * Handle a dataadd event.
   *
   * @param {CustomEvent} event The dataadd event.
   */
  #onDataAdd = (event) => {
    const dataId = event.detail.dataid;
    const dataCtrl = this.#app.getDataController();
    const maskImage = dataCtrl.get(dataId).image;

    if (typeof maskImage !== 'undefined' && maskImage.isMask()) {
      // setup html if needed
      if (!this.#rootDoc.getElementById('segmentation-list')) {
        this.#setupHtml();
      }

      const segHelper = new MaskSegmentHelper(maskImage);
      if (segHelper.getNumberOfSegments() === 0) {
        // manually created segmentation with no segments
        const selectSegmentCheckedId = this.#getSelectSegmentCheckedId();
        if (typeof selectSegmentCheckedId === 'undefined') {
          // default segment created at first brush
          const segmentNumber = 1;
          const segment = getNewSegment(segmentNumber);
          // default segmentation
          const segmentation = {
            dataId,
            labels: [],
            hasNewSegments: false,
            segments: [segment],
            selectedSegmentNumber: segmentNumber,
            viewHelper: new MaskSegmentViewHelper()
          };
          // add to list
          _segmentations.push(segmentation);
          // add to html
          this.#addSegmentationHtml(segmentation);
        } else {
          const indices = splitSegmentHtmlId(
            getRootFromHtmlId(prefixes.select, selectSegmentCheckedId));
          const segmentation = _segmentations[indices.segmentationIndex];
          // segmentation created with add segmentation
          if (typeof segmentation.dataId === 'undefined') {
            segmentation.dataId = dataId;
            for (const segment of segmentation.segments) {
              segHelper.addSegment(segment);
            }
          }
          segmentation.hasNewSegments = false;
        }
      } else {
        // segmentation from loaded file, pass segments to ui
        const imgMeta = maskImage.getMeta();
        if (typeof imgMeta !== 'undefined') {
          // loaded segmentation
          const segmentation = {
            dataId,
            labels: [],
            hasNewSegments: true,
            segments: imgMeta.custom.segments.slice(),
            viewHelper: new MaskSegmentViewHelper()
          };
          // add to list
          _segmentations.push(segmentation);
          // calculate labels
          this.#calculateLabels(dataId);
          // add to html
          this.#addSegmentationHtml(segmentation);

          // remove colour from colour pick
          for (const segment of imgMeta.custom.segments) {
            const index = _coloursPick.findIndex((item) =>
              item.r === segment.displayRGBValue.r &&
              item.g === segment.displayRGBValue.g &&
              item.b === segment.displayRGBValue.b);
            if (index !== -1) {
              _coloursPick.splice(index, 1);
            }
          }
        }
      }
    }
  };

  /**
   * Setup the html for the segmentation list.
   */
  #setupHtml() {
    // segmentation list
    const segList = document.createElement('ul');
    segList.id = 'segmentation-list';
    segList.className = 'data-list';

    // loop on segmentations
    for (let i = 0; i < _segmentations.length; ++i) {
      const segmentationItem = this.#getSegmentationHtml(_segmentations[i], i);
      segList.appendChild(segmentationItem);
    }

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
        hasNewSegments: true,
        segments: [getNewSegment(1)],
        viewHelper: new MaskSegmentViewHelper()
      };
      // add to list
      _segmentations.push(segmentation);
      // add to html
      this.#addSegmentationHtml(segmentation);
    };
    addItem.appendChild(addSegmentationButton);
    segList.appendChild(addItem);


    // setup and append
    this.#setupContainerDiv();
    this.#getContainerDiv().appendChild(segList);

    if (this.#withOverlapCheck) {
      const overlapChecker = this.#getSegmentationOverlapHtml();
      this.#getContainerDiv().appendChild(overlapChecker);
    }
  }

  /**
   * Select a segment in the brush tool.
   *
   * @param {number} segmentNumber The segment number.
   * @param {Segmentation} segmentation The segmentation.
   */
  #appSelectSegment(segmentNumber, segmentation) {
    segmentation.selectedSegmentNumber = segmentNumber;
    const dataCtrl = this.#app.getDataController();

    // add segment if not present
    const data = dataCtrl.get(segmentation.dataId);
    if (typeof data !== 'undefined') {
      const maskImage = data.image;
      const segHelper = new MaskSegmentHelper(maskImage);
      // add segment to mask
      if (!segHelper.hasSegment(segmentNumber)) {
        console.log('Add segment', segmentNumber);
        segHelper.addSegment(getSegment(
          segmentNumber, segmentation.segments
        ));
      }
    }

    // app features
    const features = {
      brushMode: 'add',
      selectedSegmentNumber: segmentNumber,
      maskDataId: undefined,
      createMask: false
    };
    if (typeof segmentation.dataId !== 'undefined') {
      features.maskDataId = segmentation.dataId;
    } else {
      features.createMask = true;
    }
    console.log('set tool features [add]', features);
    this.#app.setToolFeatures(features);
  }

  /**
   * Select the erase in the brush tool.
   *
   * @param {Segmentation} segmentation The segmentation.
   */
  #appSelectEraser(segmentation) {
    // app features
    const features = {
      brushMode: 'del',
      maskDataId: undefined
    };
    if (typeof segmentation.dataId !== 'undefined') {
      features.maskDataId = segmentation.dataId;
    }
    console.log('set tool features [del]', features);
    this.#app.setToolFeatures(features);
  }

  /**
   * Handle a segment select from UI.
   *
   * @param {Event} event HTML event.
   */
  #onSegmentSelect = (event) => {
    const target = event.target;
    // get segment
    const indices = splitSegmentHtmlId(
      getRootFromHtmlId(prefixes.select, target.id));
    const segmentation = _segmentations[indices.segmentationIndex];
    // select it
    this.#appSelectSegment(indices.segmentNumber, segmentation);
  };

  /**
   * Handle a segment colour change from UI.
   *
   * @param {Event} event HTML event.
   */
  #onSegmentColourChange = (event) => {
    const target = event.target;
    const newHexColour = target.value;
    // get segment
    const indices = splitSegmentHtmlId(
      getRootFromHtmlId(prefixes.colour, target.id));
    const segmentation = _segmentations[indices.segmentationIndex];
    const segment = getSegment(indices.segmentNumber, segmentation.segments);
    const segmentHexColour = rgbToHex(segment.displayRGBValue);

    if (newHexColour !== segmentHexColour) {
      // update colours
      const newRgbColour = hexToRgb(newHexColour);
      // get segment and mask
      const dataCtrl = this.#app.getDataController();
      const maskData = dataCtrl.get(segmentation.dataId);
      // change if possible
      if (typeof maskData !== 'undefined') {
        // create change colour command
        const previousColour = segment.displayRGBValue;
        const chgCmd = new ChangeSegmentColourCommand(
          maskData.image, segment, newRgbColour);
        chgCmd.onExecute = function (/*event*/) {
          // not needed the first time but on undo/redo
          target.value = newHexColour;
        };
        chgCmd.onUndo = function () {
          // not needed the first time but on undo/redo
          target.value = rgbToHex(previousColour);
        };
        // execute command
        if (chgCmd.isValid()) {
          chgCmd.execute();
          const undoCtrl = this.#app.getUndoController();
          undoCtrl.addToUndoStack(chgCmd);
        }
      }

      // update segment
      segment.displayRGBValue = newRgbColour;
      // pass updated color to brush
      this.#appSelectSegment(indices.segmentNumber, segmentation);
    }
  };

  /**
   * Handle a goto segment.
   *
   * @param {MouseEvent} event HTML event.
   */
  #onGotoSegment = (event) => {
    const target = event.currentTarget;
    // get segment
    const indices = splitSegmentHtmlId(
      getRootFromHtmlId(prefixes.li, target.id));
    const segmentation = _segmentations[indices.segmentationIndex];
    const segment = getSegment(indices.segmentNumber, segmentation.segments);

    // Find the first label for this segment
    const label =
      segmentation.labels.find((item) => {
        return item.id === segment.number;
      });

    if (typeof label !== 'undefined') {
      const dataId = segmentation.dataId;
      const stgCtrl = this.#app.getStageController();
      const drawLayers = stgCtrl.getViewLayersByDataId(dataId);
      for (const layer of drawLayers) {
        layer.setCurrentPosition(label.centroid);
      }
    } else {
      console.log('No label for this segment');
    }
  };

  /**
   * Handle a segment view change from UI.
   *
   * @param {MouseEvent} event HTML event.
   */
  #onSegmentViewChange = (event) => {
    // do not propagate to parent (triggers goto)
    event.stopPropagation();

    const target = event.target;
    // get segment
    const indices = splitSegmentHtmlId(
      getRootFromHtmlId(prefixes.view, target.id));
    const segmentation = _segmentations[indices.segmentationIndex];
    const segment = getSegment(indices.segmentNumber, segmentation.segments);
    // toggle hidden
    const segViewHelper = segmentation.viewHelper;
    if (isButtonPressed(target)) {
      setButtonPressed(target, false);
      segViewHelper.removeFromHidden(segment.number);
    } else {
      setButtonPressed(target, true);
      segViewHelper.addToHidden(segment.number);
    }
    // apply hidden
    const stageCtrl = this.#app.getStageController();
    const vls = stageCtrl.getViewLayersByDataId(segmentation.dataId);
    if (vls.length === 0) {
      console.warn('No layers to show/hide seg');
    }
    for (const vl of vls) {
      const vc = vl.getViewController();
      vc.setMaskViewHelper(segViewHelper);
    }
  };

  /**
   * Handle a segment delete from UI.
   *
   * @param {MouseEvent} event HTML event.
   */
  #onSegmentDelete = (event) => {
    // do not propagate to parent (triggers goto)
    event.stopPropagation();

    const target = event.target;
    // get segment
    const indices = splitSegmentHtmlId(
      getRootFromHtmlId(prefixes.delete, target.id));
    const segmentation = _segmentations[indices.segmentationIndex];
    const segmentId = getSegmentHtmlId(
      indices.segmentNumber, indices.segmentationIndex);

    // get segment divs
    const listItem = this.#rootDoc.getElementById(
      getHtmlId(prefixes.li, segmentId)
    );
    if (!listItem) {
      throw new Error('No segment item');
    }
    const parent = listItem.parentNode;
    if (!parent) {
      throw new Error('No delete span parent');
    }
    const nextItem = listItem.nextSibling;

    // get mask
    const dataCtrl = this.#app.getDataController();
    const data = dataCtrl.get(segmentation.dataId);
    // delete if possible
    if (typeof data !== 'undefined') {
      const segment =
        getSegment(indices.segmentNumber, segmentation.segments);
      // create delete command
      const delCmd = new DeleteSegmentCommand(data.image, segment);
      delCmd.onExecute = function () {
        listItem.remove();
        if (segmentation.viewHelper.isHidden(segment.number)) {
          segmentation.viewHelper.removeFromHidden(segment);
        }
      };
      delCmd.onUndo = function () {
        parent.insertBefore(listItem, nextItem);
      };
      // execute command
      if (delCmd.isValid()) {
        delCmd.execute();
        const undoCtrl = this.#app.getUndoController();
        undoCtrl.addToUndoStack(delCmd);
      }
    } else {
      listItem.remove();
    }

    // update labels
    this.#calculateLabels(segmentation.dataId);

    // select first segment
    const spanChildren = parent.childNodes;
    for (const spanNode of spanChildren) {
      if (spanNode.nodeName === 'LI') {
        const spanNodeChildren = spanNode.childNodes;
        for (const node of spanNodeChildren) {
          if (node.nodeName === 'INPUT') {
            const input = node;
            input.checked = true;
            break;
          }
        }
        break;
      }
    }
  };

  /**
   * Get the id of the select segment checked input.
   *
   * @returns {string} The input id.
   */
  #getSelectSegmentCheckedId() {
    let id;
    const selectInputs = document.querySelectorAll(
      'input[type=\'radio\'][name=\'select-segment\']'
    );
    for (const input of selectInputs) {
      if (input.checked) {
        id = input.id;
        break;
      }
    }
    return id;
  }

  /**
   * Get the HTML span element for a segment.
   *
   * @param {MaskSegment} segment The segment.
   * @param {number} segmentationIndex The segmentation index.
   * @returns {HTMLLiElement} THe HTML element.
   */
  #getSegmentHtml(segment, segmentationIndex) {
    const segmentId = getSegmentHtmlId(segment.number, segmentationIndex);

    // segment select
    const selectInput = document.createElement('input');
    selectInput.type = 'radio';
    selectInput.name = 'select-segment';
    selectInput.id = getHtmlId(prefixes.select, segmentId);
    selectInput.title = segmentId;
    selectInput.onchange = this.#onSegmentSelect;

    if (segment.number === 1) {
      selectInput.checked = true;
      this.#appSelectSegment(segment.number, _segmentations[segmentationIndex]);
    }

    const selectLabel = document.createElement('label');
    selectLabel.htmlFor = selectInput.id;
    selectLabel.title = selectInput.title;
    selectLabel.appendChild(document.createTextNode(segment.label));

    const infoButton = getButton('Info');
    infoButton.id = getHtmlId(prefixes.info, segmentId);
    infoButton.title = 'Information';
    infoButton.onclick = (event) => {
      // do not propagate to parent that triggers goto
      event.stopPropagation();
      const target = event.target;
      // get segment
      const indices = splitSegmentHtmlId(
        getRootFromHtmlId(prefixes.info, target.id));
      const segmentation = _segmentations[indices.segmentationIndex];
      const segment2 = getSegment(indices.segmentNumber, segmentation.segments);
      const labelsInfo = this.#getLabelsInfo(segment2, segmentationIndex);

      let qStr = 'Quantification:\n';
      let i = 0;
      for (const labelInfo of labelsInfo) {
        qStr += `- label #${i}\n`;
        const keys = Object.keys(labelInfo);
        for (const key of keys) {
          const quant = labelInfo[key];
          qStr += `  - ${key}: ${
            quant.value.toPrecision(4)
          }${i18n.t(quant.unit)}`;
          qStr += '\n';
        }
        ++i;
      }
      alert(qStr);
    };

    // segment colour
    const colourInput = document.createElement('input');
    colourInput.type = 'color';
    colourInput.title = 'Change segment colour';
    colourInput.id = getHtmlId(prefixes.colour, segmentId);
    colourInput.value = rgbToHex(segment.displayRGBValue);
    colourInput.onchange = this.#onSegmentColourChange;
    colourInput.onclick = (event) => {
      // do not propagate to parent that triggers goto
      event.stopPropagation();
    };

    // segment view
    const viewButton = getButton('View');
    setButtonPressed(viewButton, false);
    viewButton.id = getHtmlId(prefixes.view, segmentId);
    viewButton.title = 'Show/hide segment';
    viewButton.onclick = this.#onSegmentViewChange;

    // segment delete
    const deleteButton = getButton('Delete');
    deleteButton.id = getHtmlId(prefixes.delete, segmentId);
    deleteButton.title = 'Delete segment';
    deleteButton.onclick = this.#onSegmentDelete;

    // content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'data-item-list-item-content';
    contentDiv.appendChild(selectInput);
    contentDiv.appendChild(selectLabel);

    // actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'data-item-list-item-actions';
    actionsDiv.appendChild(infoButton);
    actionsDiv.appendChild(colourInput);
    actionsDiv.appendChild(viewButton);
    actionsDiv.appendChild(deleteButton);

    // list item
    const item = document.createElement('li');
    item.id = getHtmlId(prefixes.li, segmentId);
    item.className = 'data-item-list-item';
    item.title = 'Go to segment';
    item.appendChild(contentDiv);
    item.appendChild(actionsDiv);

    // click on li to go to annotation
    item.addEventListener('click', (event) => {
      const target = event.currentTarget;

      // remove selected class from other rows
      const mainlist = this.#rootDoc.getElementById('segmentation-list');
      const items = mainlist.querySelectorAll('.data-item-list-item');
      items.forEach(item2 => item2.classList.remove('selected'));
      // mark this row as selected
      target.classList.add('selected');

      this.#onGotoSegment(event);
    });

    return item;
  }

  /**
   * Handle an eraser select from UI.
   *
   * @param {Event} event HTML event.
   */
  #onEraserSelect = (event) => {
    const target = event.target;
    // get segmentation
    const segmentationIndex = splitSegmentationHtmlId(
      getRootFromHtmlId(prefixes.selectEraser, target.id));
    const segmentation = _segmentations[segmentationIndex];
    // select eraser
    this.#appSelectEraser(segmentation);
  };

  /**
   * Handle a segment add from UI.
   *
   * @param {MouseEvent} event HTML event.
   */
  #onSegmentAdd = (event) => {
    const target = event.target;
    // get segmentation
    const segmentationIndex = splitSegmentationHtmlId(
      getRootFromHtmlId(prefixes.addSegment, target.id));
    const segmentation = _segmentations[segmentationIndex];
    const segments = segmentation.segments;

    // create new segment
    const newSegment = getNewSegment(segments.length + 1);
    // add to list
    segments.push(newSegment);
    // update flag
    segmentation.hasNewSegments = true;

    // add item to list
    const listDivId = `${getSegmentationHtmlId(segmentationIndex)}-list`;
    const listDiv = this.#rootDoc.getElementById(listDivId);
    listDiv.appendChild(this.#getSegmentHtml(newSegment, segmentationIndex));
  };

  /**
   * Handle a segmentation save from UI.
   *
   * @param {MouseEvent} event HTML event.
   */
  #onSegmentationSave = (event) => {
    const target = event.target;
    // get segmentation
    const segmentationIndex = splitSegmentationHtmlId(
      getRootFromHtmlId(prefixes.save, target.id));
    const segmentationName = getSegmentationHtmlId(segmentationIndex);
    const segmentation = _segmentations[segmentationIndex];
    const dataId = segmentation.dataId;

    // get data
    const dataCtrl = this.#app.getDataController();
    const maskData = dataCtrl.get(dataId);
    if (typeof maskData === 'undefined') {
      throw new Error('Cannot save without mask image');
    }
    const refSeriesUID = getReferencedSeriesUID(maskData.meta);
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
    const fac = new MaskFactory();
    const dicomElements = fac.toDicom(
      maskData.image,
      maskData.image.getMeta().custom.segments,
      sourceData.image,
      {
        MediaStorageSOPInstanceUID: '1.2.3.4.5.6',
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
      logger.error(error);
      alert(error.message);
    }
    if (dicomBuffer !== undefined) {
      // view as Blob to allow download
      const blob = new Blob([dicomBuffer], {type: 'application/dicom'});
      // update generate button
      const element = document.createElement('a');
      element.href = window.URL.createObjectURL(blob);
      element.download = `${segmentationName}.dcm`;
      // trigger download
      element.click();
      URL.revokeObjectURL(element.href);
    }
  };

  /**
   * Get labels info.
   *
   * @param {MaskSegment} segment The segment.
   * @param {number} segmentationIndex The segmentation index.
   * @returns {object[]} The labels info.
   */
  #getLabelsInfo(segment, segmentationIndex) {
    // get the labels info strings
    const segmentation = _segmentations[segmentationIndex];
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
   * @returns {HTMLLIElement} The HTML element.
   */
  #getSegmentationHtml(segmentation, segmentationIndex) {
    const segmentationName = getSegmentationHtmlId(segmentationIndex);

    // name
    const nameDiv = document.createElement('span');
    nameDiv.id = `${segmentationName}-name`;
    nameDiv.className = 'data-item-name';
    nameDiv.appendChild(document.createTextNode(segmentationName));

    // save button
    const saveButton = getButton('Save');
    saveButton.title = 'Save segmentation';
    saveButton.id = getHtmlId(prefixes.save, segmentationName);
    saveButton.onclick = this.#onSegmentationSave;

    // add button
    const addButton = getButton('Add');
    addButton.title = 'Add segment';
    addButton.id = getHtmlId(prefixes.addSegment, segmentationName);
    addButton.onclick = this.#onSegmentAdd;

    // actions
    const actionGroupDiv = document.createElement('div');
    actionGroupDiv.id = `${segmentationName}-actions`;
    actionGroupDiv.className = 'data-item-actions';
    actionGroupDiv.appendChild(saveButton);
    actionGroupDiv.appendChild(addButton);

    // segment list
    const listDiv = document.createElement('ul');
    listDiv.id = `${segmentationName}-list`;
    listDiv.className = 'data-item-list';
    for (const segment of segmentation.segments) {
      listDiv.appendChild(this.#getSegmentHtml(segment, segmentationIndex));
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

    // segment eraser
    const eraserInput = document.createElement('input');
    eraserInput.type = 'radio';
    eraserInput.name = 'select-segment';
    eraserInput.title = 'Eraser';
    eraserInput.id = getHtmlId(prefixes.selectEraser, segmentationName);
    eraserInput.onchange = this.#onEraserSelect;

    const eraserLabel = document.createElement('label');
    eraserLabel.htmlFor = eraserInput.id;
    eraserLabel.title = eraserInput.title;
    eraserLabel.appendChild(document.createTextNode('Eraser'));

    // action span
    const postActionsDiv = document.createElement('span');
    postActionsDiv.id = `span-action-${segmentationName}`;
    postActionsDiv.appendChild(eraserInput);
    postActionsDiv.appendChild(eraserLabel);

    // append span to item
    contentDiv.appendChild(postActionsDiv);

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
   * @param {Segmentation} segmentation The segmentation to add.
   * @param {number} segmentationIndex The segmentation index.
   */
  #addOverlapCheckerSelection(segmentation, segmentationIndex) {
    const overlapSelect0 =
      this.#rootDoc.getElementById('overlap-checker-select-list-0');
    const overlapSelect1 =
      this.#rootDoc.getElementById('overlap-checker-select-list-1');

    const newOption0 = document.createElement('option');
    newOption0.innerHTML = getSegmentationHtmlId(segmentationIndex);
    newOption0.value = segmentation.dataId;

    const newOption1 = document.createElement('option');
    newOption1.innerHTML = getSegmentationHtmlId(segmentationIndex);
    newOption1.value = segmentation.dataId;

    overlapSelect0.appendChild(newOption0);
    overlapSelect1.appendChild(newOption1);
  }

  /**
   * Get the HTML for the segmentation overlap chacker.
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
      const segment0 = overlapSelect0.value;
      const segment1 = overlapSelect1.value;
      const dataCtrl = this.#app.getDataController();
      const maskImage0 = dataCtrl.get(segment0).image;
      const maskImage1 = dataCtrl.get(segment1).image;
      const segHelper0 = new MaskSegmentHelper(maskImage0);
      const segHelper1 = new MaskSegmentHelper(maskImage1);
      const overlap = segHelper0.findOverlap(segHelper1);

      overlapResult.innerHTML = ''; // clear old results
      const overlapList = document.createElement('ul');
      for (
        const [/*segmentNumber0*/, segmentOverlap] of
        Object.entries(overlap)
      ) {
        // title (segment that these overlaps are for)
        const segmentLi = document.createElement('li');
        segmentLi.innerHTML = `${ segmentOverlap.label
        } (${segmentOverlap.count} voxels): `;

        // list of overlaps
        let first = true;
        for (
          const [/*segmentNumber1*/, count] of
          Object.entries(segmentOverlap.overlap)
        ) {
          if (first) {
            first = false;
          } else {
            segmentLi.innerHTML += ', ';
          }
          segmentLi.innerHTML += `${count.label} (${
            count.count } voxels, ${
            (count.percentage).toPrecision(4) }%)`;
        }

        overlapList.appendChild(segmentLi);
      }
      overlapResult.appendChild(overlapList);
    };

    return overlapChecker;
  }
}; // SegmentationUI
