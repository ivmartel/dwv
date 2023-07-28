import {ListenerHandler} from '../utils/listen';
import {mergeObjects} from '../utils/operator';

// doc imports
/* eslint-disable no-unused-vars */
import {Image} from '../image/image';
/* eslint-enable no-unused-vars */

/*
 * Data (list of {image, meta}) controller.
 */
export class DataController {

  /**
   * List of {image, meta}.
   *
   * @type {object}
   */
  #data = {};

  /**
   * Listener handler.
   *
   * @type {ListenerHandler}
   */
  #listenerHandler = new ListenerHandler();

  /**
   * Get the list of ids in the data storage.
   *
   * @returns {Array} The list of data ids.
   */
  getDataIds() {
    return Object.keys(this.#data);
  }

  /**
   * Reset the class: empty the data storage.
   */
  reset() {
    this.#data = [];
  }

  /**
   * Get a data at a given index.
   *
   * @param {string} dataId The data id.
   * @returns {object} The data.
   */
  get(dataId) {
    return this.#data[dataId];
  }

  /**
   * Set the image at a given index.
   *
   * @param {string} dataId The data id.
   * @param {Image} image The image to set.
   */
  setImage(dataId, image) {
    this.#data[dataId].image = image;
    // fire image set
    this.#fireEvent({
      type: 'imageset',
      value: [image],
      dataid: dataId
    });
    // listen to image change
    image.addEventListener('imagechange', this.#getFireEvent(dataId));
  }

  /**
   * Add a new data.
   *
   * @param {string} dataId The data id.
   * @param {Image} image The image.
   * @param {object} meta The image meta.
   */
  addNew(dataId, image, meta) {
    if (typeof this.#data[dataId] !== 'undefined') {
      throw new Error('Data id already used in storage: ' + dataId);
    }
    // store the new image
    this.#data[dataId] = {
      image: image,
      meta: meta
    };
    // listen to image change
    image.addEventListener('imagechange', this.#getFireEvent(dataId));
  }

  /**
   * Update the current data.
   *
   * @param {string} dataId The data id.
   * @param {Image} image The image.
   * @param {object} meta The image meta.
   */
  update(dataId, image, meta) {
    const dataToUpdate = this.#data[dataId];

    // add slice to current image
    dataToUpdate.image.appendSlice(image);

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
   * @param {object} callback The method associated with the provided
   *   event type, will be called with the fired event.
   */
  addEventListener(type, callback) {
    this.#listenerHandler.add(type, callback);
  }

  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
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

} // ImageController class
