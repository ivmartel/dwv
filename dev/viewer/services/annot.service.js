import {DrawController} from '../../../src/app/drawController.js';
import {
  AnnotationGroupFactory
} from '../../../src/image/annotationGroupFactory.js';
import {
  getUID,
  DicomWriter
} from '../../../src/dicom/dicomWriter.js';
import {logger} from '../../../src/utils/logger.js';

/**
 * @import {DwvAppService} from './dwvApp.service.js';
 * @import {Annotation} from '../../../src/image/annotation.js';
 * @import {AnnotationGroup} from '../../../src/image/annotationGroup.js';
 */

/**
 * Annotation state: plain data, do not modify.
 *
 * @typedef {object} AnnotationItemState
 * @property {string} id The annotation tracking UID.
 * @property {string} label The annotation tracking id.
 * @property {string} colour The annotation colour as hex string.
 * @property {string} factoryName The annotation factory name,
 *   'unknown' if not known.
 * @property {boolean} canView True if the annotation can be viewed
 *   (it has a view controller).
 * @property {boolean} visible True if the annotation is shown.
 * @property {object|undefined} quantification The annotation
 *   quantification (see `getQuantificationGroups`).
 */

/**
 * Annotation group state: plain data, do not modify.
 *
 * @typedef {object} AnnotationGroupState
 * @property {string} dataId The annotation group data id.
 * @property {boolean} editable True if the group is editable.
 * @property {boolean} labelsVisible True if the labels are shown.
 * @property {AnnotationItemState[]} annotations The annotations.
 */

/**
 * Annotation selection.
 *
 * @typedef {object} AnnotationSelection
 * @property {string} dataId The annotation group data id.
 * @property {string} annotationId The annotation tracking UID.
 */

/**
 * Annotation service state (snapshot): immutable, a new object
 *   is created on each change and unchanged parts keep their identity.
 *
 * @typedef {object} AnnotationState
 * @property {AnnotationGroupState[]} groups The annotation groups,
 *   in order of addition.
 * @property {AnnotationSelection|undefined} selected
 *   The selected annotation.
 */

/**
 * Get the state of an annotation.
 *
 * @param {Annotation} annotation The annotation.
 * @param {boolean} visible The annotation visibility.
 * @returns {AnnotationItemState} The annotation state.
 */
function getAnnotationItemState(annotation, visible) {
  return {
    id: annotation.trackingUid,
    label: annotation.trackingId,
    colour: annotation.colour,
    factoryName: annotation.getFactory()?.getName() ?? 'unknown',
    canView: annotation.canView(),
    visible,
    quantification: annotation.quantification
  };
}

/**
 * Annotation service: framework agnostic annotation logic and state
 *   on top of the dwv app service, no DOM access.
 *
 * The state follows the external store contract
 *   (`subscribe` / `getSnapshot`). Actions are methods keyed by
 *   data id and annotation id; dwv objects are not exposed.
 *
 * Usage: `connect()` once before loading data, `dispose()` when done.
 */
export class AnnotationService {

  /**
   * The dwv app service.
   *
   * @type {DwvAppService}
   */
  #dwvAppService;

  /**
   * The group states indexed by data id (in order of addition).
   *
   * @type {Map<string, AnnotationGroupState>}
   */
  #groups = new Map();

  /**
   * The editable change listeners indexed by data id.
   *
   * @type {Map<string, Function>}
   */
  #editableListeners = new Map();

  /**
   * The selected annotation.
   *
   * @type {AnnotationSelection|undefined}
   */
  #selected;

  /**
   * The current snapshot.
   *
   * @type {AnnotationState}
   */
  #snapshot = {groups: [], selected: undefined};

  /**
   * The state change listeners.
   *
   * @type {Set<Function>}
   */
  #listeners = new Set();

  /**
   * The dwv app service event handlers.
   *
   * @type {Record<string, Function>}
   */
  #handlers = {
    dataadd: (event) => this.#onDataAdd(event),
    dataremove: (event) => this.#onDataRemove(event),
    drawlayeradd: (event) => this.#onDrawLayerAdd(event),
    annotationadd: (event) => this.#onAnnotationAdd(event),
    annotationupdate: (event) => this.#onAnnotationUpdate(event),
    annotationremove: (event) => this.#onAnnotationRemove(event),
    annotationselect: (event) => this.#onAnnotationSelect(event),
    tap: (event) => this.#onTap(event)
  };

  /**
   * @param {DwvAppService} dwvAppService The associated dwv app service.
   */
  constructor(dwvAppService) {
    this.#dwvAppService = dwvAppService;
  }

  // store contract

  /**
   * Get the current state. Returns the same object as long
   *   as the state does not change.
   *
   * @returns {AnnotationState} The state.
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
   * Listen to the dwv app service events.
   */
  connect() {
    for (const [type, handler] of Object.entries(this.#handlers)) {
      this.#dwvAppService.addEventListener(type, handler);
    }
  }

  /**
   * Stop listening to the dwv app service and annotation groups events,
   *   remove the subscribers.
   */
  dispose() {
    for (const [type, handler] of Object.entries(this.#handlers)) {
      this.#dwvAppService.removeEventListener(type, handler);
    }
    for (const dataId of this.#editableListeners.keys()) {
      this.#removeEditableListener(dataId);
    }
    this.#listeners.clear();
  }

  // queries

  /**
   * Get the reference for a new annotation group: the active view layer
   *   of the main layer group.
   *
   * @returns {{refDataId: string, divId: string}|undefined}
   *   The reference data id and layer group div id, undefined
   *   if there is no active view layer.
   */
  getDefaultGroupReference() {
    const divId = this.#dwvAppService.getMainLayerGroupDivId();
    const layerGroup = this.#dwvAppService.getStageController()
      .getLayerGroupByDivId(divId);
    const viewLayer = layerGroup?.getActiveViewLayer();
    if (typeof viewLayer === 'undefined') {
      return undefined;
    }
    return {refDataId: viewLayer.getDataId(), divId};
  }

  // actions

  /**
   * Add an annotation group. The group appears in the state once
   *   loaded by the app.
   *
   * @param {string} [refDataId] The reference data id, defaults to
   *   the one of `getDefaultGroupReference`.
   * @param {string} [divId] The layer group div id, defaults to
   *   the one of `getDefaultGroupReference`.
   * @returns {boolean} False if no reference was found.
   */
  addAnnotationGroup(refDataId, divId) {
    if (typeof refDataId === 'undefined' || typeof divId === 'undefined') {
      const ref = this.getDefaultGroupReference();
      if (typeof ref === 'undefined') {
        logger.warn(
          'No active view layer, please select one in the data table'
        );
        return false;
      }
      refDataId ??= ref.refDataId;
      divId ??= ref.divId;
    }
    const data = this.#dwvAppService.createAnnotationData(refDataId);
    // render (will create draw layer and trigger 'dataadd')
    this.#dwvAppService.addAndRenderAnnotationData(data, divId, refDataId);
    return true;
  }

  /**
   * Change an annotation colour (undoable).
   *
   * @param {string} dataId The annotation group data id.
   * @param {string} annotationId The annotation tracking UID.
   * @param {string} colour The new colour as hex string.
   */
  changeAnnotationColour(dataId, annotationId, colour) {
    const annotationGroup = this.#getAnnotationGroup(dataId);
    // get annotation from the group (the group can replace it on update)
    const annotation = annotationGroup?.find(annotationId);
    if (typeof annotation === 'undefined' ||
      colour === annotation.colour) {
      return;
    }
    const drawController = new DrawController(annotationGroup);
    const undoCtrl = this.#dwvAppService.getUndoController();
    drawController.updateAnnotationWithCommand(
      annotationId,
      {colour: annotation.colour},
      {colour},
      undoCtrl.addToUndoStack
    );
  }

  /**
   * Delete an annotation (undoable).
   *
   * @param {string} dataId The annotation group data id.
   * @param {string} annotationId The annotation tracking UID.
   */
  deleteAnnotation(dataId, annotationId) {
    const annotationGroup = this.#getAnnotationGroup(dataId);
    if (typeof annotationGroup === 'undefined') {
      return;
    }
    const drawController = new DrawController(annotationGroup);
    const undoCtrl = this.#dwvAppService.getUndoController();
    drawController.removeAnnotationWithCommand(
      annotationId,
      undoCtrl.addToUndoStack
    );
  }

  /**
   * Set an annotation visibility.
   *
   * @param {string} dataId The annotation group data id.
   * @param {string} annotationId The annotation tracking UID.
   * @param {boolean} visible True to show the annotation.
   */
  setAnnotationVisibility(dataId, annotationId, visible) {
    const drawLayers = this.#dwvAppService.getStageController()
      .getDrawLayersByDataId(dataId);
    for (const layer of drawLayers) {
      layer.setAnnotationVisibility(annotationId, visible);
    }
    this.#updateAnnotation(dataId, annotationId,
      (item) => ({...item, visible}));
  }

  /**
   * Set an annotation group labels visibility.
   *
   * @param {string} dataId The annotation group data id.
   * @param {boolean} visible True to show the labels.
   * @returns {boolean} False if no draw layer was found.
   */
  setLabelsVisibility(dataId, visible) {
    const drawLayer = this.#dwvAppService.getStageController()
      .getDrawLayersByDataId(dataId)[0];
    if (typeof drawLayer === 'undefined') {
      logger.warn(`Cannot find draw layer with id ${dataId}`);
      return false;
    }
    drawLayer.setLabelsVisibility(visible);
    this.#updateGroup(dataId, (group) => ({...group, labelsVisible: visible}));
    return true;
  }

  /**
   * Set an annotation group editability.
   *
   * @param {string} dataId The annotation group data id.
   * @param {boolean} editable True to make the group editable.
   */
  setAnnotationGroupEditable(dataId, editable) {
    // state is updated by the group editable change listener
    this.#getAnnotationGroup(dataId)?.setEditable(editable);
  }

  /**
   * Go to an annotation: set the view position to its centroid
   *   and highlight it.
   *
   * @param {string} dataId The annotation group data id.
   * @param {string} annotationId The annotation tracking UID.
   */
  gotoAnnotation(dataId, annotationId) {
    const annotation = this.#getAnnotationGroup(dataId)?.find(annotationId);
    const annotCentroid = annotation?.getCentroid();
    if (typeof annotCentroid === 'undefined') {
      logger.warn('No centroid for annotation');
      return;
    }
    const drawLayers = this.#dwvAppService.getStageController()
      .getDrawLayersByDataId(dataId);
    for (const layer of drawLayers) {
      layer.setCurrentPosition(annotCentroid);
      layer.highlightAnnotation(annotationId);
    }
  }

  /**
   * Select an annotation.
   *
   * @param {string} dataId The annotation group data id.
   * @param {string} annotationId The annotation tracking UID.
   * @returns {boolean} False if the annotation was not found.
   */
  selectAnnotation(dataId, annotationId) {
    const exists = this.#groups.get(dataId)?.annotations
      .some((item) => item.id === annotationId);
    if (!exists) {
      return false;
    }
    if (this.#selected?.dataId !== dataId ||
      this.#selected?.annotationId !== annotationId) {
      this.#selected = {dataId, annotationId};
      this.#emit();
    }
    return true;
  }

  /**
   * Clear the annotation selection.
   */
  clearSelection() {
    if (typeof this.#selected !== 'undefined') {
      this.#selected = undefined;
      this.#emit();
    }
  }

  /**
   * Get an annotation group as a DICOM SR blob.
   *
   * @param {string} dataId The annotation group data id.
   * @returns {Blob} The DICOM SR blob.
   * @throws {Error} If the group is not found or the writing fails.
   */
  getAnnotationGroupAsDicom(dataId) {
    const annotationGroup = this.#getAnnotationGroup(dataId);
    if (typeof annotationGroup === 'undefined') {
      throw new Error(`Cannot find annotation group with id ${dataId}`);
    }
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
    const writer = new DicomWriter();
    const dicomBuffer = writer.getBuffer(dicomElements);
    return new Blob([dicomBuffer], {type: 'application/dicom'});
  }

  // internals

  /**
   * Get an annotation group from the data controller.
   *
   * @param {string} dataId The annotation group data id.
   * @returns {AnnotationGroup|undefined} The annotation group.
   */
  #getAnnotationGroup(dataId) {
    return this.#dwvAppService.getDataController().get(dataId)?.annotationGroup;
  }

  /**
   * Build a new snapshot and notify the listeners.
   */
  #emit() {
    this.#snapshot = {
      groups: Array.from(this.#groups.values()),
      selected: this.#selected
    };
    for (const listener of this.#listeners) {
      listener();
    }
  }

  /**
   * Update a group state.
   *
   * @param {string} dataId The annotation group data id.
   * @param {Function} update Function taking the old group state
   *   and returning the new one.
   */
  #updateGroup(dataId, update) {
    const group = this.#groups.get(dataId);
    if (typeof group === 'undefined') {
      return;
    }
    this.#groups.set(dataId, update(group));
    this.#emit();
  }

  /**
   * Update an annotation state.
   *
   * @param {string} dataId The annotation group data id.
   * @param {string} annotationId The annotation tracking UID.
   * @param {Function} update Function taking the old annotation state
   *   and returning the new one.
   */
  #updateAnnotation(dataId, annotationId, update) {
    this.#updateGroup(dataId, (group) => ({
      ...group,
      annotations: group.annotations.map((item) =>
        item.id === annotationId ? update(item) : item)
    }));
  }

  /**
   * Remove the editable change listener of a group.
   *
   * @param {string} dataId The annotation group data id.
   */
  #removeEditableListener(dataId) {
    const listener = this.#editableListeners.get(dataId);
    if (typeof listener !== 'undefined') {
      // the data can already be removed from the data controller
      this.#getAnnotationGroup(dataId)?.removeEventListener(
        'annotationgroupeditablechange', listener);
      this.#editableListeners.delete(dataId);
    }
  }

  /**
   * Handle 'dataadd' event: add the group state if the data
   *   has an annotation group.
   *
   * @param {CustomEvent} event The event.
   */
  #onDataAdd(event) {
    const dataId = event.detail.dataid;
    const annotationGroup = this.#getAnnotationGroup(dataId);
    if (typeof annotationGroup === 'undefined') {
      return;
    }
    const listener = (editEvent) => {
      this.#updateGroup(dataId,
        (group) => ({...group, editable: editEvent.detail.data}));
    };
    annotationGroup.addEventListener(
      'annotationgroupeditablechange', listener);
    this.#editableListeners.set(dataId, listener);

    this.#groups.set(dataId, {
      dataId,
      editable: annotationGroup.isEditable(),
      labelsVisible: true,
      annotations: annotationGroup.getList().map(
        (annotation) => getAnnotationItemState(annotation, true))
    });
    this.#emit();
  }

  /**
   * Handle 'dataremove' event: remove the group state
   *   if the data was an annotation group.
   *
   * @param {CustomEvent} event The event.
   */
  #onDataRemove(event) {
    const dataId = event.detail.dataid;
    if (!this.#groups.has(dataId)) {
      return;
    }
    this.#removeEditableListener(dataId);
    this.#groups.delete(dataId);
    if (this.#selected?.dataId === dataId) {
      this.#selected = undefined;
    }
    this.#emit();
  }

  /**
   * Handle 'drawlayeradd' event: refresh the annotations states
   *   (view controller and quantification are set by the draw layer).
   *
   * @param {CustomEvent} event The event.
   */
  #onDrawLayerAdd(event) {
    const dataId = event.detail.dataid;
    const annotationGroup = this.#getAnnotationGroup(dataId);
    if (typeof annotationGroup === 'undefined') {
      return;
    }
    this.#updateGroup(dataId, (group) => ({
      ...group,
      annotations: annotationGroup.getList().map((annotation) => {
        const old = group.annotations.find(
          (item) => item.id === annotation.trackingUid);
        return getAnnotationItemState(annotation, old?.visible ?? true);
      })
    }));
  }

  /**
   * Handle 'annotationadd' event.
   *
   * @param {CustomEvent} event The event.
   */
  #onAnnotationAdd(event) {
    const annotation = event.detail.data;
    // reset selection
    this.#selected = undefined;
    this.#updateGroup(event.detail.dataid, (group) => ({
      ...group,
      annotations: [
        ...group.annotations,
        getAnnotationItemState(annotation, true)
      ]
    }));
  }

  /**
   * Handle 'annotationupdate' event.
   *
   * @param {CustomEvent} event The event.
   */
  #onAnnotationUpdate(event) {
    const annotation = event.detail.data;
    this.#updateAnnotation(event.detail.dataid, annotation.trackingUid,
      (item) => getAnnotationItemState(annotation, item.visible));
  }

  /**
   * Handle 'annotationremove' event.
   *
   * @param {CustomEvent} event The event.
   */
  #onAnnotationRemove(event) {
    const dataId = event.detail.dataid;
    const annotationId = event.detail.data.trackingUid;
    if (this.#selected?.dataId === dataId &&
      this.#selected?.annotationId === annotationId) {
      this.#selected = undefined;
    }
    this.#updateGroup(dataId, (group) => ({
      ...group,
      annotations: group.annotations.filter(
        (item) => item.id !== annotationId)
    }));
  }

  /**
   * Handle 'annotationselect' event.
   *
   * @param {CustomEvent} event The event.
   */
  #onAnnotationSelect(event) {
    this.selectAnnotation(event.detail.dataid, event.detail.annotationid);
  }

  /**
   * Handle 'tap' event: select the tapped annotation,
   *   or clear the selection if no annotation was tapped.
   *
   * @param {CustomEvent} event The event.
   */
  #onTap(event) {
    const hit = event.detail.annotations[0];
    if (typeof hit === 'undefined' ||
      !this.selectAnnotation(hit.dataid, hit.annotationid)) {
      this.clearSelection();
    }
  }

}
