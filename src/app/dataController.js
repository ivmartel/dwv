import {ListenerHandler} from '../utils/listen';
import {mergeObjects} from '../utils/operator';

// doc imports
/* eslint-disable no-unused-vars */
import {Image} from '../image/image';
/* eslint-enable no-unused-vars */

/**
 * DICOM data: meta and possible image.
 */
class DicomData {
  /**
   * DICOM meta data.
   *
   * @type {object}
   */
  meta;
  /**
   * DICOM image.
   *
   * @type {Image|undefined}
   */
  image;

  /**
   * @param {object} meta The DICOM meta data.
   * @param {Image} image The DICOM image.
   */
  constructor(meta, image) {
    this.meta = meta;
    this.image = image;
  }
}

/*
 * Data (list of {image, meta}) controller.
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
      if (this.#dataList[key].image.containsImageUids(uids)) {
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
      type: 'imageset',
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
   * @param {Image} image The image.
   * @param {object} meta The image meta.
   */
  addNew(dataId, image, meta) {
    if (typeof this.#dataList[dataId] !== 'undefined') {
      throw new Error('Data id already used in storage: ' + dataId);
    }
    // store the new image
    this.#dataList[dataId] = new DicomData(meta, image);
    // listen to image change
    if (typeof image !== 'undefined') {
      image.addEventListener('imagecontentchange', this.#getFireEvent(dataId));
      image.addEventListener('imagegeometrychange', this.#getFireEvent(dataId));
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
        image.removeEventListener('imagecontentchange', this.#getFireEvent(dataId));
        image.removeEventListener('imagegeometrychange', this.#getFireEvent(dataId));
      }
      // fire a data remove event
      this.#fireEvent({
        type: 'imageremove',
        dataid: dataId
      });
      // remove data from list
      delete this.#dataList[dataId];
    }
  }

  /**
   * Update the current data.
   *
   * @param {string} dataId The data id.
   * @param {Image} image The image.
   * @param {object} meta The image meta.
   */
  update(dataId, image, meta) {
    if (typeof this.#dataList[dataId] === 'undefined') {
      throw new Error('Cannot find data to update: ' + dataId);
    }
    const dataToUpdate = this.#dataList[dataId];

    // add slice to current image
    if (typeof dataToUpdate.image !== 'undefined' &&
      typeof image !== 'undefined'
    ) {
      dataToUpdate.image.appendSlice(image);
    }

    // update meta data
    // TODO add time support
    let idKey = '';
    if (typeof meta['00020010'] !== 'undefined') {
      // dicom case, use 'InstanceNumber'
      idKey = '00200013';
    } else {
      idKey = 'imageUid';
    }
    dataToUpdate.meta = mergeObjects(
      dataToUpdate.meta,
      meta,
      idKey,
      'value');
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
