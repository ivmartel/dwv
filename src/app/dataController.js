import {ListenerHandler} from '../utils/listen.js';
import {mergeObjects} from '../utils/operator.js';
import {MaskFactory} from '../image/maskFactory.js';
import {imageEventNames} from '../image/image.js';
import {annotationGroupEventNames} from '../image/annotationGroup.js';

// doc imports
/* eslint-disable no-unused-vars */
import {Image} from '../image/image.js';
import {DataElement} from '../dicom/dataElement.js';
import {AnnotationGroup} from '../image/annotationGroup.js';
/* eslint-enable no-unused-vars */

/**
 * List of data event names.
 *
 * @type {string[]}
 */
export const dataEventNames = [
  'dataadd',
  'dataremove',
  'dataimageset',
  'dataupdate'
];

/**
 * DICOM data: meta and possible image.
 */
export class DicomData {
  /**
   * DICOM meta data.
   *
   * @type {Object<string, DataElement>}
   */
  meta;

  /**
   * Image extracted from meta data.
   *
   * @type {Image|undefined}
   */
  image;
  /**
   * Annotattion group extracted from meta data.
   *
   * @type {AnnotationGroup|undefined}
   */
  annotationGroup;

  /**
   * Image buffer used to build image.
   *
   * @type {any|undefined}
   */
  buffer;

  /**
   * @param {Object<string, DataElement>} meta The DICOM meta data.
   */
  constructor(meta) {
    this.meta = meta;
  }

  /**
   * Set the image complete flag (for image data).
   *
   * @param {boolean} flag True if the image is complete.
   */
  setComplete(flag) {
    if (typeof this.image !== 'undefined') {
      this.image.setComplete(flag);
    }
  }

  /**
   * Get the image complete flag (for image data).
   *
   * @returns {boolean|undefined} True if the image is complete.
   */
  getComplete() {
    let res;
    if (typeof this.image !== 'undefined') {
      res = this.image.getComplete();
    }
    return res;
  }
}

/*
 * DicomData controller.
 */
export class DataController {

  /**
   * List of DICOM data.
   *
   * @type {Object<string, DicomData>}
   */
  #dataList = {};

  /**
   * List of DICOM data.
   *
   * @type {Object<string, DicomData>}
   */
  #dataListStashed = {};

  /**
   * Distinct data loaded counter.
   *
   * @type {number}
   */
  #dataIdCounter = -1;

  /**
   * Listener handler.
   *
   * @type {ListenerHandler}
   */
  #listenerHandler = new ListenerHandler();

  /**
   * Get the next data id.
   *
   * @returns {string} The data id.
   */
  getNextDataId() {
    ++this.#dataIdCounter;
    return this.#dataIdCounter.toString();
  }

  /**
   * Get the list of ids in the data storage.
   *
   * @returns {string[]} The list of data ids.
   */
  getDataIds() {
    return Object.keys(this.#dataList);
  }

  /**
   * Reset the class: empty the data storage.
   */
  reset() {
    this.#dataList = {};
  }

  /**
   * Get a data at a given index.
   *
   * @param {string} dataId The data id.
   * @returns {DicomData|undefined} The DICOM data.
   */
  get(dataId) {
    return this.#dataList[dataId];
  }

  /**
   * Get the list of dataIds that contain the input UIDs.
   *
   * @param {string[]} uids A list of UIDs.
   * @returns {string[]} The list of dataIds that contain the UIDs.
   */
  getDataIdsFromSopUids(uids) {
    const res = [];
    // check input
    if (typeof uids === 'undefined' ||
      uids.length === 0) {
      return res;
    }
    const keys = Object.keys(this.#dataList);
    for (const key of keys) {
      if (typeof this.#dataList[key].image !== 'undefined' &&
        this.#dataList[key].image.containsImageUids(uids)) {
        res.push(key);
      }
    }
    return res;
  }

  /**
   * Get the first data id with the given SeriesInstanceUID.
   *
   * @param {string} uid The SeriesInstanceUID.
   * @returns {string} The data id.
   */
  getDataIdFromSeriesUid(uid) {
    let res;
    const keys = Object.keys(this.#dataList);
    for (const key of keys) {
      const image = this.#dataList[key].image;
      if (typeof image !== 'undefined') {
        const imageSeriesUID = image.getMeta().SeriesInstanceUID;
        if (uid === imageSeriesUID) {
          res = key;
          break;
        }
      }
    }
    return res;
  }

  /**
   * Set the image at a given index.
   *
   * @param {string} dataId The data id.
   * @param {Image} image The image to set.
   */
  setImage(dataId, image) {
    this.#dataList[dataId].image = image;

    // propagate image events
    for (const eventName of imageEventNames) {
      image.addEventListener(eventName, this.#getFireEvent(dataId));
    }

    /**
     * Data image set event.
     *
     * @event DataController#dataimageset
     * @type {object}
     * @property {string} type The event type.
     * @property {Array} value The event value, first element is the image.
     * @property {string} dataid The data id.
     */
    this.#fireEvent({
      type: 'dataimageset',
      value: [image],
      dataid: dataId
    });
  }

  /**
   * Add a new data.
   *
   * @param {string} dataId The data id.
   * @param {DicomData} data The data.
   */
  add(dataId, data) {
    if (typeof this.#dataList[dataId] !== 'undefined') {
      throw new Error('Data id already used in storage: ' + dataId);
    }
    // store the new image
    this.#dataList[dataId] = data;

    let modality;
    if (typeof data.meta['00080060'] !== 'undefined') {
      modality = data.meta['00080060'].value[0];
    }

    // DICOM seg case
    // find the reference data to allow for geometry creation
    if (modality === 'SEG' &&
      typeof data.image === 'undefined') {
      // get referencedSeriesUID from meta
      let referencedSeriesUID;
      const refSeriesSq = data.meta['00081115'];
      if (typeof refSeriesSq !== 'undefined') {
        referencedSeriesUID = refSeriesSq.value[0]['0020000E'].value[0];
      }
      if (typeof referencedSeriesUID === 'undefined') {
        throw new Error('Cannot create mask image: ' +
          'the DICOM seg does not have a referenced series UID');
      }
      // get the reference data id
      const refDataId = this.getDataIdFromSeriesUid(referencedSeriesUID);
      if (typeof refDataId === 'undefined') {
        throw new Error('Cannot create mask image: ' +
          'the DICOM seg referenced series is not loaded');
      }
      // create image
      const maskFactory = new MaskFactory();
      data.image = maskFactory.create(
        data.meta,
        data.buffer,
        this.#dataList[refDataId].image
      );
    }

    // propagate image events
    if (typeof data.image !== 'undefined') {
      for (const eventName of imageEventNames) {
        data.image.addEventListener(eventName, this.#getFireEvent(dataId));
      }
    }
    // propagate annotation group events
    if (typeof data.annotationGroup !== 'undefined') {
      for (const eventName of annotationGroupEventNames) {
        data.annotationGroup.addEventListener(
          eventName, this.#getFireEvent(dataId));
      }
    }

    /**
     * Data add event.
     *
     * @event DataController#dataadd
     * @type {object}
     * @property {string} type The event type.
     * @property {string} dataid The data id.
     */
    this.#fireEvent({
      type: 'dataadd',
      dataid: dataId
    });
  }

  /**
   * Remove a data from the list.
   *
   * @param {string} dataId The data id.
   */
  remove(dataId) {
    if (typeof this.#dataList[dataId] !== 'undefined') {
      // stop propagating image events
      const image = this.#dataList[dataId].image;
      if (typeof image !== 'undefined') {
        for (const eventName of imageEventNames) {
          image.removeEventListener(eventName, this.#getFireEvent(dataId));
        }
      }
      // stop propagating annotation group events
      const annotationGroup = this.#dataList[dataId].annotationGroup;
      if (typeof annotationGroup !== 'undefined') {
        for (const eventName of annotationGroupEventNames) {
          annotationGroup.removeEventListener(
            eventName, this.#getFireEvent(dataId));
        }
      }
      // remove data from list
      delete this.#dataList[dataId];
      /**
       * Data remove event.
       *
       * @event DataController#dataremove
       * @type {object}
       * @property {string} type The event type.
       * @property {string} dataid The data id.
       */
      this.#fireEvent({
        type: 'dataremove',
        dataid: dataId
      });
    }
  }

  /**
   * Stash a data from the list.
   *
   * @param {string} dataId The data id.
   */
  stash(dataId) {
    if (typeof this.#dataList[dataId] !== 'undefined') {
      this.#dataListStashed[dataId] = this.#dataList[dataId];
      this.remove(dataId);
    }
  }

  /**
   * Unstash a data from the list.
   *
   * @param {string} dataId The data id.
   */
  unstash(dataId) {
    if (typeof this.#dataListStashed[dataId] !== 'undefined') {
      this.add(dataId, this.#dataListStashed[dataId]);
      delete this.#dataListStashed[dataId];
    }
  }

  /**
   * Get the list of ids in the stashed data storage.
   *
   * @returns {string[]} The list of data ids.
   */
  getStashedDataIds() {
    return Object.keys(this.#dataListStashed);
  }

  /**
   * Get a stashed data at a given index.
   *
   * @param {string} dataId The data id.
   * @returns {DicomData|undefined} The DICOM data.
   */
  getStashed(dataId) {
    return this.#dataListStashed[dataId];
  }

  /**
   * Update the current data.
   *
   * @param {string} dataId The data id.
   * @param {DicomData} data The data.
   */
  update(dataId, data) {
    if (typeof this.#dataList[dataId] === 'undefined') {
      throw new Error('Cannot find data to update: ' + dataId);
    }
    const dataToUpdate = this.#dataList[dataId];

    // add slice to current image
    if (typeof dataToUpdate.image !== 'undefined' &&
      typeof data.image !== 'undefined'
    ) {
      dataToUpdate.image.appendSlice(data.image);
    }

    // update meta data
    // TODO add time support
    let idKey = '';
    if (typeof data.meta['00020010'] !== 'undefined') {
      // dicom case, use 'InstanceNumber'
      idKey = '00200013';
    } else {
      idKey = 'imageUid';
    }
    dataToUpdate.meta = mergeObjects(
      dataToUpdate.meta,
      data.meta,
      idKey,
      'value');

    /**
     * Data udpate event.
     *
     * @event DataController#dataupdate
     * @type {object}
     * @property {string} type The event type.
     * @property {string} dataid The data id.
     */
    this.#fireEvent({
      type: 'dataupdate',
      dataid: dataId
    });
  }

  /**
   * Mark a data a complete (fully loaded).
   *
   * @param {string} dataId The data id.
   */
  markDataAsComplete(dataId) {
    if (typeof this.#dataList[dataId] === 'undefined') {
      throw new Error('Cannot find data to mark as complete: ' + dataId);
    }
    this.#dataList[dataId].setComplete(true);
  }

  /**
   * Add an event listener to this class.
   *
   * @param {string} type The event type.
   * @param {Function} callback The function associated with the provided
   *   event type, will be called with the fired event.
   */
  addEventListener(type, callback) {
    this.#listenerHandler.add(type, callback);
  }

  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {Function} callback The function associated with the provided
   *   event type.
   */
  removeEventListener(type, callback) {
    this.#listenerHandler.remove(type, callback);
  }

  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   */
  #fireEvent = (event) => {
    this.#listenerHandler.fireEvent(event);
  };

  /**
   * Get a fireEvent function that adds the input data id
   * to the event value.
   *
   * @param {string} dataId The data id.
   * @returns {Function} A fireEvent function.
   */
  #getFireEvent(dataId) {
    return (event) => {
      event.dataid = dataId;
      this.#fireEvent(event);
    };
  }

} // DataController class
