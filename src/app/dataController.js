// namespaces
var dwv = dwv || {};

/*
 * Data (list of {image, meta}) controller.
 *
 * @class
 */
dwv.DataController = function () {

  /**
   * List of {image, meta}.
   *
   * @private
   * @type {Array}
   */
  var data = [];

  /**
   * Current data index.
   *
   * @private
   * @type {number}
   */
  var currentIndex = null;

  /**
   * Listener handler.
   *
   * @type {object}
   * @private
   */
  var listenerHandler = new dwv.utils.ListenerHandler();

  /**
   * Reset the class: empty the data storage.
   */
  this.reset = function () {
    currentIndex = null;
    data = [];
  };

  /**
   * Get a data at a given index.
   *
   * @param {number} index The index of the data.
   * @returns {object} The data.
   */
  this.get = function (index) {
    return data[index];
  };

  /**
   * Get the current data index.
   *
   * @returns {number} The index.
   */
  this.getCurrentIndex = function () {
    return currentIndex;
  };

  /**
   * Set the image at a given index.
   *
   * @param {object} image The image to set.
   * @param {number} index The index of the data.
   */
  this.setImage = function (image, index) {
    data[index].image = image;
    fireEvent({
      type: 'imagechange',
      value: [index, image]
    });
  };

  /**
   * Add a new data.
   *
   * @param {object} image The image.
   * @param {object} meta The image meta.
   */
  this.addNew = function (image, meta) {
    currentIndex = data.length;
    // store the new image
    data.push({
      image: image,
      meta: getMetaObject(meta)
    });
  };

  /**
   * Update the current data.
   *
   * @param {object} image The image.
   * @param {object} meta The image meta.
   * @returns {number} The slice number at which the image was added.
   */
  this.updateCurrent = function (image, meta) {
    var currentData = data[currentIndex];
    // add slice to current image
    var sliceNb = currentData.image.appendSlice(image);
    // update meta data
    if (dwv.utils.isArray(meta)) {
      // image file case
      // TODO merge?
      currentData.meta.push(meta);
    } else {
      currentData.meta = dwv.utils.mergeObjects(
        currentData.meta,
        getMetaObject(meta),
        'InstanceNumber',
        'value');
    }
    return sliceNb;
  };

  /**
   * Add an event listener to this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *   event type, will be called with the fired event.
   */
  this.addEventListener = function (type, callback) {
    listenerHandler.add(type, callback);
  };

  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *   event type.
   */
  this.removeEventListener = function (type, callback) {
    listenerHandler.remove(type, callback);
  };

  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   * @private
   */
  function fireEvent(event) {
    listenerHandler.fireEvent(event);
  }

  /**
   * Get a meta data object.
   *
   * @param {*} meta The meta data to convert.
   * @returns {*} object for DICOM, array for DOM image.
   */
  function getMetaObject(meta) {
    var metaObj = null;
    if (dwv.utils.isArray(meta)) {
      metaObj = meta;
    } else {
      var newDcmMetaData = new dwv.dicom.DicomElementsWrapper(meta);
      metaObj = newDcmMetaData.dumpToObject();
    }
    return metaObj;
  }

}; // ImageController class
