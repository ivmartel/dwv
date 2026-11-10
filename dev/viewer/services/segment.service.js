import {
  rgbToHex,
  hexToRgb,
} from '../../../src/utils/colour.js';
import {logger} from '../../../src/utils/logger.js';
import {getSegmentationCode} from '../../../src/dicom/dicomCode.js';
import {MaskSegmentHelper} from '../../../src/image/maskSegmentHelper.js';
import {MaskSegmentViewHelper} from '../../../src/image/maskSegmentViewHelper.js';
import {
  ChangeSegmentColourCommand
} from '../../../src/command/changeSegmentColourCommand.js';
import {
  DeleteSegmentCommand
} from '../../../src/command/deleteSegmentCommand.js';

import {getQuantificationGroups} from './quantification.js';

/**
 * @import {ViewerService} from './viewer.service.js';
 * @import {MaskSegment} from '../../../src/dicom/dicomSegment.js';
 * @import {MaskImage} from '../../../src/image/maskImage.js';
 * @import {RGB} from '../../../src/utils/colour.js';
 * @import {Statistics} from '../../../src/math/stats.js';
 * @import {Label} from '../../../src/image/label.js';
 * @import {QuantificationGroup} from './quantification.js';
 */

/**
 * Segment state: plain data, do not modify.
 *
 * @typedef {object} SegmentItemState
 * @property {number} number The segment number.
 * @property {string} label The segment label.
 * @property {string} colour The segment colour as hex string.
 * @property {boolean} visible True if the segment is shown.
 */

/**
 * Segmentation state: plain data, do not modify.
 *
 * @typedef {object} SegmentationItemState
 * @property {number} id The segmentation id: stable and never reused,
 *   the data id is only known once the mask is created.
 * @property {string|undefined} dataId The mask data id, undefined
 *   until the mask is created (at first brush).
 * @property {number} quantificationVersion Incremented when the
 *   segments quantification changes (see `getSegmentQuantification`).
 * @property {SegmentItemState[]} segments The segments.
 */

/**
 * Segment reference.
 *
 * @typedef {object} SegmentRef
 * @property {number} segmentationId The segmentation id.
 * @property {number} segmentNumber The segment number.
 */

/**
 * Segmentation service state (snapshot): immutable, a new object
 *   is created on each change and unchanged parts keep their identity.
 *
 * @typedef {object} SegmentationState
 * @property {SegmentationItemState[]} segmentations The segmentations,
 *   in order of addition.
 * @property {SegmentRef[]} selected The selected segments (a tap can
 *   select several), empty if none.
 * @property {SegmentRef|undefined} brushSegment The segment
 *   the brush draws with, undefined if none.
 */

/**
 * Internal segmentation model (mutable, not exposed).
 *
 * @typedef {object} Segmentation
 * @property {number} id The segmentation id.
 * @property {string|undefined} dataId The mask data id.
 * @property {MaskSegment[]} segments The segments.
 * @property {Label[]} labels The mask labels.
 * @property {MaskSegmentViewHelper} viewHelper The view helper
 *   (hidden segments).
 * @property {number} quantificationVersion The quantification version.
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
 * Check if a segment reference points to a given segment.
 *
 * @param {SegmentRef|undefined} ref The reference.
 * @param {number} segmentationId The segmentation id.
 * @param {number} [segmentNumber] Optional segment number,
 *   any segment of the segmentation if undefined.
 * @returns {boolean} True if it does.
 */
function isRefTo(ref, segmentationId, segmentNumber) {
  return typeof ref !== 'undefined' &&
    ref.segmentationId === segmentationId &&
    (typeof segmentNumber === 'undefined' ||
      ref.segmentNumber === segmentNumber);
}

/**
 * Segmentation service: framework agnostic segmentation logic and
 *   state on top of the viewer service, no DOM access.
 *
 * The state follows the external store contract
 *   (`subscribe` / `getSnapshot`). Actions are methods keyed by
 *   segmentation id and segment number; dwv objects are not exposed.
 *
 * Usage: `connect()` once before loading data, `dispose()` when done.
 */
export class SegmentationService {

  /**
   * The dwv service.
   *
   * @type {ViewerService}
   */
  #dwvService;

  /**
   * The segmentations (in order of addition).
   *
   * @type {Segmentation[]}
   */
  #segmentations = [];

  /**
   * The next segmentation id.
   *
   * @type {number}
   */
  #nextId = 0;

  /**
   * Colour array to pick from.
   *
   * @type {RGB[]}
   */
  #coloursPick = defaultColours.slice();

  /**
   * The selected segments.
   *
   * @type {SegmentRef[]}
   */
  #selected = [];

  /**
   * The brush segment.
   *
   * @type {SegmentRef|undefined}
   */
  #brushSegment;

  /**
   * Cache of the segmentation states, indexed by segmentation id:
   *   an entry is removed when the segmentation changes.
   *
   * @type {Map<number, SegmentationItemState>}
   */
  #segmentationStates = new Map();

  /**
   * Cache of the segment states, indexed by `${id}-${number}`:
   *   an entry is removed when the segment changes.
   *
   * @type {Map<string, SegmentItemState>}
   */
  #segmentStates = new Map();

  /**
   * The current snapshot.
   *
   * @type {SegmentationState}
   */
  #snapshot = {segmentations: [], selected: [], brushSegment: undefined};

  /**
   * The state change listeners.
   *
   * @type {Set<Function>}
   */
  #listeners = new Set();

  /**
   * The viewer service event handlers.
   *
   * @type {Record<string, Function>}
   */
  #handlers = {
    dataadd: (event) => this.#onDataAdd(event),
    dataremove: (event) => this.#onDataRemove(event),
    labelschanged: (event) => this.#onLabelsChanged(event),
    tap: (event) => this.#onTap(event)
  };

  /**
   * @param {ViewerService} service The associated viewer service.
   */
  constructor(service) {
    this.#dwvService = service;
  }

  // store contract

  /**
   * Get the current state. Returns the same object as long
   *   as the state does not change.
   *
   * @returns {SegmentationState} The state.
   */
  getSnapshot = () => {
    return this.#snapshot;
  };

  /**
   * Subscribe to state changes.
   *
   * @param {Function} listener The listener, called without
   *   arguments after each change.
   * @returns {Function} The unsubscribe function.
   */
  subscribe = (listener) => {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  };

  // lifecycle

  /**
   * Listen to the viewer service events.
   */
  connect() {
    for (const [type, handler] of Object.entries(this.#handlers)) {
      this.#dwvService.addEventListener(type, handler);
    }
  }

  /**
   * Stop listening to the viewer service events, remove the subscribers.
   */
  dispose() {
    for (const [type, handler] of Object.entries(this.#handlers)) {
      this.#dwvService.removeEventListener(type, handler);
    }
    this.#listeners.clear();
  }

  // queries

  /**
   * Get the quantification of a segment: labels geometry and
   *   reference image pixel values statistics. Computed on demand
   *   (histograms), refresh when the segmentation
   *   `quantificationVersion` changes.
   *
   * @param {number} segmentationId The segmentation id.
   * @param {number} segmentNumber The segment number.
   * @returns {QuantificationGroup[]} The quantification groups,
   *   empty if none.
   */
  getSegmentQuantification(segmentationId, segmentNumber) {
    const segmentation = this.#getSegmentation(segmentationId);
    const segment = segmentation?.segments.find(
      (item) => item.number === segmentNumber);
    if (typeof segment === 'undefined') {
      return [];
    }
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

  // actions

  /**
   * Add a new segmentation with one segment and select it. The mask
   *   is created at first brush.
   *
   * @returns {number} The new segmentation id.
   */
  addSegmentation() {
    const segmentation = this.#createSegmentation(
      undefined, [this.#getNewSegment(1)]);
    this.#emit();
    this.selectSegment(segmentation.id, 1);
    return segmentation.id;
  }

  /**
   * Add a new segment to a segmentation and select it.
   *
   * @param {number} segmentationId The segmentation id.
   * @returns {number|undefined} The new segment number, undefined
   *   if the segmentation is not found.
   */
  addSegment(segmentationId) {
    const segmentation = this.#getSegmentation(segmentationId);
    if (typeof segmentation === 'undefined') {
      return undefined;
    }
    // numbers are not necessarily contiguous
    const maxNumber = segmentation.segments.reduce(
      (max, segment) => Math.max(max, segment.number), 0);
    const segmentNumber = maxNumber + 1;
    segmentation.segments.push(this.#getNewSegment(segmentNumber));
    this.#markDirty(segmentationId);
    this.#emit();
    this.selectSegment(segmentationId, segmentNumber);
    return segmentNumber;
  }

  /**
   * Select a segment, and pass it to the brush if it is
   *   the selected tool.
   *
   * @param {number} segmentationId The segmentation id.
   * @param {number} segmentNumber The segment number.
   */
  selectSegment(segmentationId, segmentNumber) {
    const segmentation = this.#getSegmentation(segmentationId);
    if (typeof segmentation === 'undefined') {
      return;
    }
    this.#selected = [{segmentationId, segmentNumber}];
    if (this.#dwvService.isSelectedTool('Brush')) {
      this.#setBrushSegment(segmentation, segmentNumber);
    }
    this.#emit();
  }

  /**
   * Clear the segment selection (does not change the brush segment).
   */
  clearSelection() {
    if (this.#selected.length !== 0) {
      this.#selected = [];
      this.#emit();
    }
  }

  /**
   * Change a segment colour (undoable once the mask exists).
   *
   * @param {number} segmentationId The segmentation id.
   * @param {number} segmentNumber The segment number.
   * @param {string} colour The new colour as hex string.
   */
  changeSegmentColour(segmentationId, segmentNumber, colour) {
    const segmentation = this.#getSegmentation(segmentationId);
    const segment = segmentation?.segments.find(
      (item) => item.number === segmentNumber);
    if (typeof segment === 'undefined' ||
      colour === rgbToHex(segment.displayRGBValue)) {
      return;
    }
    const newRgbColour = hexToRgb(colour);
    const maskImage = this.#getMaskImage(segmentation);
    if (typeof maskImage === 'undefined') {
      // no mask yet: only update segment, its colour will be
      // passed to the mask palette when the segment is added to it
      segment.displayRGBValue = newRgbColour;
      this.#markDirty(segmentationId, segmentNumber);
      this.#emit();
      return;
    }
    const chgCmd = new ChangeSegmentColourCommand(
      maskImage, segment, newRgbColour);
    // the command changes the segment colour
    const onChange = () => {
      this.#markDirty(segmentationId, segmentNumber);
      this.#emit();
    };
    chgCmd.onExecute = onChange;
    chgCmd.onUndo = onChange;
    if (chgCmd.isValid()) {
      chgCmd.execute();
      this.#dwvService.getUndoController().addToUndoStack(chgCmd);
    }
  }

  /**
   * Set a segment visibility.
   *
   * @param {number} segmentationId The segmentation id.
   * @param {number} segmentNumber The segment number.
   * @param {boolean} visible True to show the segment.
   */
  setSegmentVisibility(segmentationId, segmentNumber, visible) {
    const segmentation = this.#getSegmentation(segmentationId);
    if (typeof segmentation === 'undefined') {
      return;
    }
    const viewHelper = segmentation.viewHelper;
    if (visible) {
      viewHelper.removeFromHidden(segmentNumber);
    } else {
      viewHelper.addToHidden(segmentNumber);
    }
    this.#applyViewHelper(segmentation);
    this.#markDirty(segmentationId, segmentNumber);
    this.#emit();
  }

  /**
   * Delete a segment (undoable once the mask exists). Selects the
   *   first remaining segment if the deleted one was the brush segment.
   *
   * @param {number} segmentationId The segmentation id.
   * @param {number} segmentNumber The segment number.
   */
  deleteSegment(segmentationId, segmentNumber) {
    const segmentation = this.#getSegmentation(segmentationId);
    const segment = segmentation?.segments.find(
      (item) => item.number === segmentNumber);
    if (typeof segment === 'undefined') {
      return;
    }
    const wasBrushSegment =
      isRefTo(this.#brushSegment, segmentationId, segmentNumber);

    const maskImage = this.#getMaskImage(segmentation);
    if (typeof maskImage !== 'undefined') {
      const delCmd = new DeleteSegmentCommand(maskImage, segment);
      // keep the position for undo
      const index = segmentation.segments.indexOf(segment);
      delCmd.onExecute = () => {
        this.#removeSegment(segmentation, segment);
        // undo brings the segment back visible
        if (segmentation.viewHelper.isHidden(segmentNumber)) {
          segmentation.viewHelper.removeFromHidden(segmentNumber);
          this.#applyViewHelper(segmentation);
        }
        this.#emit();
      };
      delCmd.onUndo = () => {
        segmentation.segments.splice(index, 0, segment);
        this.#markDirty(segmentationId, segmentNumber);
        this.#emit();
      };
      if (delCmd.isValid()) {
        delCmd.execute();
        this.#dwvService.getUndoController().addToUndoStack(delCmd);
      }
      // update labels
      maskImage.recalculateLabels();
    } else {
      // no mask yet: removing it from the segments makes sure
      // it is not added to the mask when it gets created
      this.#removeSegment(segmentation, segment);
      this.#emit();
    }

    // select first remaining segment if the deleted one was the brush one
    if (wasBrushSegment) {
      this.#brushSegment = undefined;
      const first = segmentation.segments[0];
      if (typeof first !== 'undefined') {
        this.selectSegment(segmentationId, first.number);
      } else {
        this.#emit();
      }
    }
  }

  /**
   * Go to a segment: set the view position to its first label
   *   centroid and highlight it.
   *
   * @param {number} segmentationId The segmentation id.
   * @param {number} segmentNumber The segment number.
   */
  gotoSegment(segmentationId, segmentNumber) {
    const segmentation = this.#getSegmentation(segmentationId);
    const label = segmentation?.labels.find(
      (item) => item.id === segmentNumber);
    if (typeof label === 'undefined') {
      logger.warn('No label for this segment');
      return;
    }
    const layers = this.#dwvService.getStageController()
      .getViewLayersByDataId(segmentation.dataId);
    for (const layer of layers) {
      layer.setCurrentPosition(label.centroid);
      layer.highlightSegment(segmentNumber);
    }
  }

  /**
   * Get a segmentation as a DICOM SEG or RTSS blob.
   *
   * @param {number} segmentationId The segmentation id.
   * @param {boolean} asRtss Whether to save as RTSS.
   * @returns {Blob} The DICOM blob.
   * @throws {Error} If there is no mask or the writing fails.
   */
  getSegmentationAsDicom(segmentationId, asRtss) {
    const segmentation = this.#getSegmentation(segmentationId);
    const maskImage = this.#getMaskImage(segmentation);
    if (typeof maskImage === 'undefined') {
      const format = asRtss ? 'RTSS' : 'SEG';
      throw new Error(`Cannot save ${format} without mask image`);
    }
    return this.#dwvService.getMaskImageAsDicom(maskImage, asRtss);
  }

  // internals

  /**
   * Get a segmentation.
   *
   * @param {number} segmentationId The segmentation id.
   * @returns {Segmentation|undefined} The segmentation.
   */
  #getSegmentation(segmentationId) {
    return this.#segmentations.find((item) => item.id === segmentationId);
  }

  /**
   * Get the mask image of a segmentation.
   *
   * @param {Segmentation|undefined} segmentation The segmentation.
   * @returns {MaskImage|undefined} The mask image, undefined
   *   if not created yet.
   */
  #getMaskImage(segmentation) {
    if (typeof segmentation?.dataId === 'undefined') {
      return undefined;
    }
    return this.#dwvService.getDataController()
      .get(segmentation.dataId)?.image;
  }

  /**
   * Create and store a segmentation.
   *
   * @param {string|undefined} dataId The mask data id.
   * @param {MaskSegment[]} segments The segments.
   * @returns {Segmentation} The new segmentation.
   */
  #createSegmentation(dataId, segments) {
    const segmentation = {
      id: this.#nextId++,
      dataId,
      segments,
      labels: [],
      viewHelper: new MaskSegmentViewHelper(),
      quantificationVersion: 0
    };
    this.#segmentations.push(segmentation);
    return segmentation;
  }

  /**
   * Remove a segment from a segmentation list (not from the mask).
   *
   * @param {Segmentation} segmentation The segmentation.
   * @param {MaskSegment} segment The segment.
   */
  #removeSegment(segmentation, segment) {
    const index = segmentation.segments.indexOf(segment);
    if (index !== -1) {
      segmentation.segments.splice(index, 1);
    }
    this.#selected = this.#selected.filter(
      (ref) => !isRefTo(ref, segmentation.id, segment.number));
    this.#markDirty(segmentation.id, segment.number);
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
   * Set the brush segment: add the segment to the mask if needed
   *   and pass it to the brush tool.
   *
   * @param {Segmentation} segmentation The segmentation.
   * @param {number} segmentNumber The segment number.
   */
  #setBrushSegment(segmentation, segmentNumber) {
    this.#brushSegment = {segmentationId: segmentation.id, segmentNumber};

    // add segment to mask if not present
    const maskImage = this.#getMaskImage(segmentation);
    if (typeof maskImage !== 'undefined') {
      const segHelper = new MaskSegmentHelper(maskImage);
      if (!segHelper.hasSegment(segmentNumber)) {
        logger.debug(`Add segment ${segmentNumber}`);
        segHelper.addSegment(segmentation.segments.find(
          (item) => item.number === segmentNumber));
      }
    }

    // tool features
    const features = {
      selectedSegmentNumber: segmentNumber,
      maskDataId: segmentation.dataId,
      createMask: typeof segmentation.dataId === 'undefined'
    };
    logger.debug(
      `set tool features [select] ${JSON.stringify(features)}`);
    this.#dwvService.setToolFeatures(features);
  }

  /**
   * Apply a segmentation view helper (hidden segments)
   *   to its view layers.
   *
   * @param {Segmentation} segmentation The segmentation.
   */
  #applyViewHelper(segmentation) {
    const vls = this.#dwvService.getStageController()
      .getViewLayersByDataId(segmentation.dataId);
    if (vls.length === 0) {
      logger.warn('No layers to show/hide seg');
    }
    for (const vl of vls) {
      vl.getViewController().setMaskViewHelper(segmentation.viewHelper);
    }
  }

  /**
   * Mark a segmentation, and optionally one of its segments,
   *   as changed: their state is rebuilt at next emit.
   *
   * @param {number} segmentationId The segmentation id.
   * @param {number} [segmentNumber] Optional segment number.
   */
  #markDirty(segmentationId, segmentNumber) {
    this.#segmentationStates.delete(segmentationId);
    if (typeof segmentNumber !== 'undefined') {
      this.#segmentStates.delete(`${segmentationId}-${segmentNumber}`);
    }
  }

  /**
   * Get a segmentation state, from the cache if not changed.
   *
   * @param {Segmentation} segmentation The segmentation.
   * @returns {SegmentationItemState} The state.
   */
  #getSegmentationState(segmentation) {
    let state = this.#segmentationStates.get(segmentation.id);
    if (typeof state === 'undefined') {
      state = {
        id: segmentation.id,
        dataId: segmentation.dataId,
        quantificationVersion: segmentation.quantificationVersion,
        segments: segmentation.segments.map((segment) =>
          this.#getSegmentState(segmentation, segment))
      };
      this.#segmentationStates.set(segmentation.id, state);
    }
    return state;
  }

  /**
   * Get a segment state, from the cache if not changed.
   *
   * @param {Segmentation} segmentation The segmentation.
   * @param {MaskSegment} segment The segment.
   * @returns {SegmentItemState} The state.
   */
  #getSegmentState(segmentation, segment) {
    const key = `${segmentation.id}-${segment.number}`;
    let state = this.#segmentStates.get(key);
    if (typeof state === 'undefined') {
      state = {
        number: segment.number,
        label: segment.label,
        colour: rgbToHex(segment.displayRGBValue),
        visible: !segmentation.viewHelper.isHidden(segment.number)
      };
      this.#segmentStates.set(key, state);
    }
    return state;
  }

  /**
   * Build a new snapshot and notify the listeners.
   */
  #emit() {
    this.#snapshot = {
      segmentations: this.#segmentations.map(
        (segmentation) => this.#getSegmentationState(segmentation)),
      selected: this.#selected,
      brushSegment: this.#brushSegment
    };
    for (const listener of this.#listeners) {
      listener();
    }
  }

  /**
   * Handle 'dataadd' event: create or link a segmentation
   *   if the data is a mask.
   *
   * @param {CustomEvent} event The event.
   */
  #onDataAdd(event) {
    const dataId = event.detail.dataid;
    const maskImage = this.#dwvService.getDataController().get(dataId)?.image;
    if (typeof maskImage === 'undefined' || !maskImage.isMask()) {
      return;
    }

    const segHelper = new MaskSegmentHelper(maskImage);
    if (segHelper.getNumberOfSegments() === 0) {
      // mask created by the brush, with no segments
      const brushSegmentation =
        this.#getSegmentation(this.#brushSegment?.segmentationId);
      if (typeof brushSegmentation === 'undefined') {
        // default segmentation, select its segment
        // to pass the mask id to the brush
        const segmentation = this.#createSegmentation(
          dataId, [this.#getNewSegment(1)]);
        this.#emit();
        this.selectSegment(segmentation.id, 1);
      } else if (typeof brushSegmentation.dataId === 'undefined') {
        // segmentation created with add segmentation
        brushSegmentation.dataId = dataId;
        for (const segment of brushSegmentation.segments) {
          segHelper.addSegment(segment);
        }
        this.#markDirty(brushSegmentation.id);
        this.#emit();
      }
    } else {
      // segmentation from loaded file
      const imgMeta = maskImage.getMeta();
      if (typeof imgMeta === 'undefined') {
        return;
      }
      const segments = imgMeta.custom.segments;
      this.#createSegmentation(dataId, segments.slice());
      // remove colours from colour pick
      for (const segment of segments) {
        const index = this.#coloursPick.findIndex((item) =>
          item.r === segment.displayRGBValue.r &&
          item.g === segment.displayRGBValue.g &&
          item.b === segment.displayRGBValue.b);
        if (index !== -1) {
          this.#coloursPick.splice(index, 1);
        }
      }
      this.#emit();
      // calculate labels (result via 'labelschanged')
      maskImage.recalculateLabels();
    }
  }

  /**
   * Handle 'dataremove' event: remove the segmentation
   *   if the data was a mask.
   *
   * @param {CustomEvent} event The event.
   */
  #onDataRemove(event) {
    const dataId = event.detail.dataid;
    const segmentation = this.#segmentations.find(
      (item) => item.dataId === dataId);
    if (typeof segmentation === 'undefined') {
      return;
    }
    const id = segmentation.id;
    this.#segmentations.splice(this.#segmentations.indexOf(segmentation), 1);
    this.#segmentationStates.delete(id);
    for (const segment of segmentation.segments) {
      this.#segmentStates.delete(`${id}-${segment.number}`);
    }
    this.#selected = this.#selected.filter((ref) => !isRefTo(ref, id));
    if (isRefTo(this.#brushSegment, id)) {
      this.#brushSegment = undefined;
    }
    this.#emit();
  }

  /**
   * Handle 'labelschanged' event: store the labels and signal
   *   the quantification change.
   *
   * @param {CustomEvent} event The event.
   */
  #onLabelsChanged(event) {
    const segmentation = this.#segmentations.find(
      (item) => item.dataId === event.detail.dataid);
    if (typeof segmentation === 'undefined') {
      return;
    }
    segmentation.labels = event.detail.labels;
    ++segmentation.quantificationVersion;
    this.#markDirty(segmentation.id);
    this.#emit();
  }

  /**
   * Handle 'tap' event: select the tapped segments,
   *   or clear the selection if no segment was tapped.
   *
   * @param {CustomEvent} event The event.
   */
  #onTap(event) {
    const selected = [];
    for (const hit of event.detail.segments) {
      const segmentation = this.#segmentations.find(
        (item) => item.dataId === hit.dataid);
      if (typeof segmentation === 'undefined') {
        continue;
      }
      for (const segmentNumber of hit.segmentnumbers) {
        if (segmentation.segments.some(
          (item) => item.number === segmentNumber)) {
          selected.push({segmentationId: segmentation.id, segmentNumber});
        }
      }
    }
    if (selected.length === 0) {
      this.clearSelection();
    } else {
      this.#selected = selected;
      this.#emit();
    }
  }

  /**
   * Get the labels info of a segment.
   *
   * @param {MaskSegment} segment The segment.
   * @param {Segmentation} segmentation The segmentation.
   * @returns {object[]} The labels info.
   */
  #getLabelsInfo(segment, segmentation) {
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
    const maskImage = this.#getMaskImage(segmentation);
    if (typeof maskImage === 'undefined') {
      return [];
    }
    const dataCtrl = this.#dwvService.getDataController();
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

}
