import {ListenerHandler} from '../utils/listen';
import {mergeObjects} from '../utils/operator';

// doc imports
/* eslint-disable no-unused-vars */
import {Image} from '../image/image';
import {AnnotationGroup} from '../image/annotationGroup';
/* eslint-enable no-unused-vars */

/**
 * DICOM data: meta and possible image.
 */
export class DicomData {
  /**
   * DICOM meta data.
   *
   * @type {object}
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
   * @param {object} meta The DICOM meta data.
   */
  constructor(meta) {
    this.meta = meta;
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
   * Set the image at a given index.
   *
   * @param {string} dataId The data id.
   * @param {Image} image The image to set.
   */
  setImage(dataId, image) {
    this.#dataList[dataId].image = image;
    // fire image set
    this.#fireEvent({
      type: 'dataimageset',
      value: [image],
      dataid: dataId
    });
    // listen to image change
    image.addEventListener('imagecontentchange', this.#getFireEvent(dataId));
    image.addEventListener('imagegeometrychange', this.#getFireEvent(dataId));
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
    // fire a data add event
    this.#fireEvent({
      type: 'dataadd',
      dataid: dataId
    });
    // listen to image change
    if (typeof data.image !== 'undefined') {
      data.image.addEventListener(
        'imagecontentchange', this.#getFireEvent(dataId));
      data.image.addEventListener(
        'imagegeometrychange', this.#getFireEvent(dataId));
    }
    if (typeof data.annotationGroup !== 'undefined') {
      data.annotationGroup.addEventListener(
        'annotationadd', this.#getFireEvent(dataId));
      data.annotationGroup.addEventListener(
        'annotationupdate', this.#getFireEvent(dataId));
      data.annotationGroup.addEventListener(
        'annotationremove', this.#getFireEvent(dataId));
    }
  }

  /**
   * Remove a data from the list.
   *
   * @param {string} dataId The data id.
   */
  remove(dataId) {
    if (typeof this.#dataList[dataId] !== 'undefined') {
      // stop listeners
      const image = this.#dataList[dataId].image;
      if (typeof image !== 'undefined') {
        image.removeEventListener(
          'imagecontentchange', this.#getFireEvent(dataId));
        image.removeEventListener(
          'imagegeometrychange', this.#getFireEvent(dataId));
      }
      const annotationGroup = this.#dataList[dataId].annotationGroup;
      if (typeof annotationGroup !== 'undefined') {
        annotationGroup.removeEventListener(
          'annotationadd', this.#getFireEvent(dataId));
        annotationGroup.removeEventListener(
          'annotationupdate', this.#getFireEvent(dataId));
        annotationGroup.removeEventListener(
          'annotationremove', this.#getFireEvent(dataId));
      }
      // remove data from list
      delete this.#dataList[dataId];
      // fire a data remove event
      this.#fireEvent({
        type: 'dataremove',
        dataid: dataId
      });
    }
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

    // fire a data add event
    this.#fireEvent({
      type: 'dataupdate',
      dataid: dataId
    });
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
