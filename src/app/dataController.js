import {ListenerHandler} from '../utils/listen.js';
import {mergeObjects} from '../utils/operator.js';
import {MaskFactory} from '../image/maskFactory.js';
import {ImageFactory} from '../image/imageFactory.js';
import {AnnotationGroupFactory} from '../image/annotationGroupFactory.js';
import {imageEventNames} from '../image/image.js';
import {annotationGroupEventNames} from '../image/annotationGroup.js';
import {safeGet} from '../dicom/dataElement.js';
import {
  getVolumeIdTagValue,
  getPostLoadVolumeIdTagValue
} from '../dicom/dicomVolume.js';
import {hasAnyPixelDataElement} from '../dicom/dicomTag.js';
import {getReferencedSeriesUID} from '../dicom/dicomImage.js';

// doc imports
/* eslint-disable no-unused-vars */
import {Image} from '../image/image.js';
import {DataElement} from '../dicom/dataElement.js';
import {AnnotationGroup} from '../image/annotationGroup.js';
/* eslint-enable no-unused-vars */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  Modality: '00080060'
};

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
 * Merge meta datas.
 *
 * @param {Object<string, DataElement>} meta0 The first data to merge.
 * @param {Object<string, DataElement>} meta1 The second data to merge.
 * @param {string} meta1Id A meta1 specific id.
 * @returns {Object<string, DataElement>} The merged data.
 */
function mergeMeta(meta0, meta1, meta1Id) {
  // update meta data
  let idKey;
  if (typeof meta1['00020010'] !== 'undefined') {
    // dicom case, use 'InstanceNumber'
    idKey = '00200013';
  } else {
    idKey = 'imageUid';
  }
  // possible time suffix
  // merge
  return mergeObjects(
    meta0,
    meta1,
    idKey,
    'value',
    meta1Id
  );
}

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
   * Number of files/urls associated to the data.
   *
   * @type {number}
   */
  numberOfFiles;

  /**
   * List of data creation warning.
   *
   * @type {string[]}
   */
  warn = [];

  /**
   * Duplicate origin flag. If true, the image slice append
   * will be blocked. Use a DicomSliceDataList to create the
   * full image.
   *
   * @type {boolean}
   */
  #hasDuplicateOrigin = false;

  /**
   * @param {Object<string, DataElement>} meta The DICOM meta data.
   */
  constructor(meta) {
    this.meta = meta;
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
   * Get the duplicate origin flag.
   *
   * @returns {boolean} The flag.
   */
  hasDuplicateOrigin() {
    return this.#hasDuplicateOrigin;
  }

  /**
   * Append slice and update meta data.
   *
   * @param {DicomData} data The data to append.
   */
  appendData(data) {
    // only process if no duplicate origins were found
    // if there was, then the image must be created when
    // the load finishes via a DicomSliceDataList.buildImage
    if (!this.#hasDuplicateOrigin) {
      // append slice to current image
      if (typeof this.image !== 'undefined' &&
        typeof data.image !== 'undefined'
      ) {
        this.#appendSlice(data.image);
      }

      this.#mergeMeta(data.meta);
    }
  }

  /**
   * Append a slice image to this image.
   *
   * @param {Image} image The image to append.
   */
  #appendSlice(image) {
    // check if append is possible
    const geom0 = this.image.getGeometry();
    const geom1 = image.getGeometry();
    const canAppend = geom0.canAppendOrigin(
      geom1.getOrigin(), geom1.getInitialTime());

    // store result if not possible to stop future appends
    if (!canAppend.success) {
      this.#hasDuplicateOrigin = true;
    }

    // append if possible
    if (!this.#hasDuplicateOrigin) {
      this.image.appendSlice(image);
    }
  }

  /**
   * Merge meta data to this meta.
   *
   * @param {Object<string, DataElement>} meta The data to merge.
   */
  #mergeMeta(meta) {
    const meta1IdNum = getVolumeIdTagValue(meta);
    let meta1Id;
    if (typeof meta1IdNum !== 'undefined') {
      meta1Id = meta1IdNum.toString();
    }
    this.meta = mergeMeta(this.meta, meta, meta1Id);
  }
}

/**
 * DICOM slice data list.
 */
export class DicomSliceDataList {

  /**
   * @type {DicomData[]|undefined}
   */
  #list = [];

  /**
   * Add a clone of the input data to the local list.
   *
   * @param {DicomData} data The data to clone and add.
   */
  addClone(data) {
    const clone = new DicomData(structuredClone(data.meta));
    clone.image = data.image.clone();
    this.add(clone);
  }

  /**
   * Add data to the local list.
   *
   * @param {DicomData} data The data to add.
   */
  add(data) {
    this.#list.push(data);
  }

  /**
   * Build a data from the stored slice data.
   *
   * @returns {{image, meta}} The result data.
   */
  buildData() {
    // get and check the number of slices per volumes
    const numberOfSlicesPerVolumes = this.#getNumberOfSlicesPerVolumes();
    if (typeof numberOfSlicesPerVolumes === 'undefined') {
      throw new Error('Non constant number of slices per volumes');
    }
    if (numberOfSlicesPerVolumes === 0) {
      throw new Error('Duplicate origins but no volumes');
    }
    if (numberOfSlicesPerVolumes === 1) {
      throw new Error('Duplicate origins but just one slice per volume');
    }

    // get indices per volumes
    const volsIndices = this.#getVolumesIndices(
      numberOfSlicesPerVolumes, getPostLoadVolumeIdTagValue);

    if (typeof volsIndices === 'undefined') {
      throw new Error('Cannot create image for multi-volume');
    }

    // reset times and append slice
    let image;
    let meta;
    for (let i = 0; i < volsIndices.length; ++i) {
      const indices = volsIndices[i];
      // meta
      // TODO fix slow when in indices loop
      const sliceMeta = this.#list[indices[0]].meta;
      if (typeof meta === 'undefined') {
        meta = sliceMeta;
      } else {
        const sliceMetaId = `${i}:${
          getPostLoadVolumeIdTagValue(sliceMeta) }`;
        meta = mergeMeta(
          meta, sliceMeta, sliceMetaId);
      }
      // image
      for (const index of indices) {
        const sliceImage = this.#list[index].image;
        sliceImage.getGeometry().setInitialTime(i);
        if (typeof image === 'undefined') {
          image = sliceImage;
        } else {
          image.appendSlice(sliceImage);
        }
      }
    }
    return {image, meta};
  }

  /**
   * Get the list of indices per volume.
   *
   * @param {number} numberOfSlicesPerVolumes The number of
   *   expected slices per volumes.
   * @param {Function} volumeIndexGetter A function to get the volume index from
   *   meta data.
   * @returns {number[][]|undefined} List of indices per volume or
   *   undefined if something went wrong.
   */
  #getVolumesIndices(numberOfSlicesPerVolumes, volumeIndexGetter) {
    const originList = this.#getOriginList();
    const volumesIndices = [];
    const volIndexValues = [];
    for (const item of originList) {
      // build volume index list
      if (volIndexValues.length === 0) {
        for (const index of item.indices) {
          const relData = this.#list[index];
          const volumeIndex = volumeIndexGetter(relData.meta);
          if (volIndexValues.includes(volumeIndex)) {
            // duplicate volume index
            return;
          }
          volIndexValues.push(volumeIndex);
        }
        if (volIndexValues.length !== numberOfSlicesPerVolumes) {
          // too many indices
          return;
        }
        volIndexValues.sort();
      }
      // add indices to volume indices
      for (const index of item.indices) {
        const relData = this.#list[index];
        const volumeIndex = volumeIndexGetter(relData.meta);
        const volIndex = volIndexValues.indexOf(volumeIndex);
        if (volIndex === -1) {
          // unknown index
          return;
        }
        // add data index to volume indices
        if (typeof volumesIndices[volIndex] === 'undefined') {
          volumesIndices[volIndex] = [];
        }
        volumesIndices[volIndex].push(index);
      }
    }

    // check same size
    const numberOfSlices = originList.length;
    for (const list of volumesIndices) {
      if (list.length !== numberOfSlices) {
        // wrong number of slices
        return;
      }
    }

    return volumesIndices;
  }

  /**
   * Get the number of slices per volumes of a data.
   *
   * @returns {number|undefined} The number of slices per volumes or
   *   undefined if non constant between volumes.
   */
  #getNumberOfSlicesPerVolumes() {
    const originList = this.#getOriginList();
    if (originList.length === 0) {
      return 0;
    }
    const count = originList[0].count;
    // check if constant count
    for (const item of originList) {
      if (item.count !== count) {
        // non constant number of origins
        return;
      }
    }
    return count;
  }

  /**
   * Get the list of origins and thein occurences in a list
   *   of {pos, indices, count}.
   *
   * @returns {object[]} A list of origins and
   *   their number of occurences.
   */
  #getOriginList() {
    // equal callback
    const getEqualPosCallback = function (pos) {
      return function (element) {
        return element.pos.equals(pos);
      };
    };

    const res = [];
    for (let i = 0; i < this.#list.length; ++i) {
      const relData = this.#list[i];
      const origin = relData.image.getGeometry().getOrigin();
      const findCallback = getEqualPosCallback(origin);
      const found = res.find(findCallback);
      if (typeof found === 'undefined') {
        res.push({
          pos: origin,
          indices: [i],
          count: 1
        });
      } else {
        ++found.count;
        found.indices.push(i);
      }
    }

    return res;
  }
}

/**
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
   * Temporary slice list for data with duplicate origin
   * that needs to be created once the load is finished.
   *
   * @type {Object<string, DicomSliceDataList>}
   */
  #tmpSliceList = {};

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
   * Interpret dicom data and create its 'content': image in
   * most cases, annotationGroup for dicom SR.
   *
   * @param {DicomData} data The dicom data.
   */
  #setDataContent(data) {
    const modality = safeGet(data.meta, TagKeys.Modality);

    let factory;
    if (hasAnyPixelDataElement(data.meta)) {
      if (modality === 'SEG') {
        // DICOM seg case
        // find the referenced data to allow for geometry creation
        const referencedSeriesUID = getReferencedSeriesUID(data.meta);
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
        factory = new MaskFactory();
        if (typeof factory.checkElements(data.meta) === 'undefined') {
          data.image = factory.create(
            data.meta,
            data.buffer,
            this.#dataList[refDataId].image
          );
        }
      } else {
        // image case
        factory = new ImageFactory();
        if (typeof factory.checkElements(data.meta) === 'undefined') {
          data.image = factory.create(
            data.meta,
            data.buffer,
            data.numberOfFiles
          );
        }
      }
    } else if (modality === 'SR') {
      // annotation case
      factory = new AnnotationGroupFactory();
      if (typeof factory.checkElements(data.meta) === 'undefined') {
        data.annotationGroup = factory.create(data.meta);
      }
    }

    // add warnings if present
    if (typeof factory !== 'undefined' &&
      typeof factory.getWarning() !== 'undefined') {
      data.warn.push(factory.getWarning());
    }
  }

  /**
   * Add a new data.
   *
   * @param {string} dataId The data id.
   * @param {DicomData} data The data.
   * @returns {boolean} False if the data cannot be added.
   */
  add(dataId, data) {
    if (typeof dataId === 'undefined' ||
      typeof this.#dataList[dataId] !== 'undefined') {
      return false;
    }
    // store the new image
    this.#dataList[dataId] = data;

    // create the data content if not present
    if (typeof data.image === 'undefined' &&
      typeof data.annotationGroup === 'undefined') {
      // create content
      this.#setDataContent(data);
      // store data for possible processing at complete time
      // (see markDataAsComplete)
      if (typeof data.numberOfFiles !== 'undefined' &&
        data.numberOfFiles > 1) {
        this.#tmpSliceList[dataId] = new DicomSliceDataList();
        // add first data as clone since this data
        // is the base for future appends with no
        // duplicate origin
        this.#tmpSliceList[dataId].addClone(data);
      }
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

    return true;
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
      throw new Error(`Cannot find data to update: ${dataId}`);
    }
    const dataToUpdate = this.#dataList[dataId];

    // create the data content
    this.#setDataContent(data);

    // store data for possible processing at complete time
    // (see markDataAsComplete)
    if (typeof this.#tmpSliceList[dataId] !== 'undefined') {
      this.#tmpSliceList[dataId].add(data);
    }

    // append data if no duplicate origin
    // (if has duplicates, data will be created in markDataAsComplete)
    if (!dataToUpdate.hasDuplicateOrigin()) {
      dataToUpdate.appendData(data);
    }

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
   * @returns {{imageHasChanged}} An object with an imageHasChanged property.
   */
  markDataAsComplete(dataId) {
    const data = this.#dataList[dataId];
    if (typeof data === 'undefined') {
      throw new Error(`Cannot find data to mark as complete: ${dataId}`);
    }

    const res = {imageHasChanged: false};

    // data with duplicate origin case: build image
    // from final slice list
    if (typeof this.#tmpSliceList[dataId] !== 'undefined' &&
      data.hasDuplicateOrigin()
    ) {
      const finalData = this.#tmpSliceList[dataId].buildData();
      // set image: sends dataimageset event
      this.setImage(dataId, finalData.image);
      // set meta
      data.meta = finalData.meta;
      // reset tmp var
      delete this.#tmpSliceList[dataId];
      // mark image as changed
      res.imageHasChanged = true;
    }

    // mark image as complete
    data.setComplete(true);

    return res;
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
