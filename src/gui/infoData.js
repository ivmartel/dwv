import {ListenerHandler} from '../utils/listen.js';
import {getReverseOrientation} from '../dicom/dicomParser.js';
import {
  getDateObj,
  getTimeObj,
  getDate
} from '../dicom/dicomDate.js';
import {logger} from '../utils/logger.js';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application.js';
import {DataElement} from '../dicom/dataElement.js';
/* eslint-enable no-unused-vars */

/**
 * Info data item class.
 */
export class InfoDataItem {
  /**
   * List of tag keys.
   *
   * @type {string[]|undefined}
   */
  tags;
  /**
   * @type {string|undefined}
   */
  event;

  /**
   * @type {string}
   */
  pos;
  /**
   * @type {string}
   */
  format;
  /**
   * @type {string|undefined}
   */
  precision;

  /**
   * @type {string}
   */
  value;
}

/**
 * Get a number toprecision function with the provided precision.
 *
 * @param {number} precision The precision to achieve.
 * @returns {Function} The to precision function.
 */
function getNumberToPrecision(precision) {
  return function (num) {
    return Number(num).toPrecision(precision);
  };
}

/**
 * Create a default replace format from a given length.
 * For example: '{v0}, {v1}'.
 *
 * @param {number} length The length of the format.
 * @returns {string} A replace format.
 */
function createDefaultReplaceFormat(length) {
  let res = '';
  for (let i = 0; i < length; ++i) {
    if (i !== 0) {
      res += ', ';
    }
    res += `{v${i}}`;
  }
  return res;
}

/**
 * Replace flags in a input string. Flags are keywords surrounded with curly
 * braces in the form: '{v0}, {v1}'.
 *
 * @param {string} inputStr The input string.
 * @param {Array} values An array of values.
 * @example
 *    var values = ["a", "b"];
 *    var str = "The length is: {v0}. The size is: {v1}";
 *    var res = replaceFlags(str, values);
 *    // "The length is: a. The size is: b"
 * @returns {string} The result string.
 */
function replaceFlags(inputStr, values) {
  let res = inputStr;
  for (let i = 0; i < values.length; ++i) {
    res = res.replace(`{v${i}}`, values[i]);
  }
  return res;
}

/**
 * DICOM Header info data.
 */
export class InfoData {

  /**
   * Associated app.
   *
   * @type {App}
   */
  #app;

  /**
   * Associated data id.
   *
   * @type {string}
   */
  #dataId;

  /**
   * Info data config indexed by modality.
   *
   * @type {Record<string, InfoDataItem[]>}
   */
  #infoConfigs;

  /**
   * List of event used by the config.
   *
   * @type {string[]}
   */
  #eventNames = [];

  /**
   * Flag to know if listening to app.
   *
   * @type {boolean}
   */
  #isListening;

  /**
   * Meta data storage indexed by dataUid.
   *
   * @type {Record<string, InfoDataItem[]>|undefined}
   */
  #infoData = {};

  /**
   * Current data uid: set on pos change.
   *
   * @type {string}
   */
  #currentDataUid;

  /**
   * Listener handler.
   *
   * @type {ListenerHandler}
   */
  #listenerHandler = new ListenerHandler();

  /**
   * @param {App} app The associated application.
   * @param {string} dataId The associated data id.
   * @param {Record<string, InfoDataItem[]>} configs The info data config.
   */
  constructor(app, dataId, configs) {
    this.#app = app;
    this.#dataId = dataId;
    this.#infoConfigs = configs;

    // parse config to get the list of events to listen to
    const keys = Object.keys(this.#infoConfigs);
    for (let i = 0; i < keys.length; ++i) {
      const modalityConfig = this.#infoConfigs[keys[i]];
      for (const item of modalityConfig) {
        const eventType = item.event;
        if (typeof eventType !== 'undefined') {
          if (!this.#eventNames.includes(eventType)) {
            this.#eventNames.push(eventType);
          }
        }
      }
    }
    // add app listeners
    this.addAppListeners();
  }

  /**
   * Reset the data.
   */
  reset() {
    this.#infoData = {};
    this.#currentDataUid = undefined;
  }

  /**
   * Handle a new loaded item event.
   *
   * @param {Record<string, DataElement>} data The item meta data.
   */
  addItemMeta(data) {
    // create and store info data
    let dataUid;
    // check if dicom data (00020010: transfer syntax)
    if (typeof data['00020010'] !== 'undefined') {
      if (typeof data['00080018'] !== 'undefined') {
        // SOP instance UID
        dataUid = data['00080018'].value[0];
        this.#infoData[dataUid] = createInfoData(data, this.#infoConfigs);
      } else {
        logger.warn('Missing DICOM SOP instance UID for info data indexing');
      }
    } else if (typeof data.imageUid !== 'undefined') {
      // image file case
      dataUid = data.imageUid.value[0];
      this.#infoData[dataUid] = createInfoDataForDom(data, this.#infoConfigs);
    } else {
      logger.warn('Missing DOM image UID for info data indexing');
    }
    // store uid
    if (typeof dataUid !== 'undefined') {
      this.#currentDataUid = dataUid;
    }
  }

  /**
   * Handle a changed slice event.
   *
   * @param {object} event The slicechange event.
   */
  onSliceChange = (event) => {
    if (event.dataid !== this.#dataId) {
      return;
    }
    if (typeof event.data !== 'undefined' &&
      typeof event.data.imageUid !== 'undefined' &&
      this.#currentDataUid !== event.data.imageUid) {
      this.#currentDataUid = event.data.imageUid;
      this.#updateData(event);
    }
  };

  /**
   * Update the info data.
   *
   * @param {object} event An event defined by the info map and
   *   registered in toggleListeners.
   */
  #updateData = (event) => {
    if (typeof event.dataid !== 'undefined' &&
      event.dataid !== this.#dataId) {
      return;
    }

    const sliceInfoData = this.#infoData[this.#currentDataUid];
    if (typeof sliceInfoData === 'undefined') {
      console.warn(`No slice info data for: ${this.#currentDataUid}`);
      return;
    }

    for (const infoDataItem of sliceInfoData) {
      let text = undefined;
      if (typeof infoDataItem.tags !== 'undefined') {
        // update tags only on slice change
        if (event.type === 'positionchange') {
          text = infoDataItem.value;
        }
      } else if (typeof infoDataItem.event !== 'undefined' &&
        infoDataItem.event === event.type) {
        // update text if the value is an event type

        const format = infoDataItem.format;
        let values = event.value;
        // optional number precision
        if (typeof infoDataItem.precision !== 'undefined') {
          let mapFunc;
          if (infoDataItem.precision === 'round') {
            mapFunc = Math.round;
          } else {
            mapFunc = getNumberToPrecision(
              parseInt(infoDataItem.precision, 10)
            );
          }
          values = values.map(mapFunc);
        }
        text = replaceFlags(format, values);
      }
      if (typeof text !== 'undefined') {
        infoDataItem.value = text;
      }
    }

    /**
     * Value change event.
     *
     * @event InfoData#valuechange
     * @type {object}
     * @property {string} type The event type.
     * @property {InfoDataItem[]} data The value of the info data.
     */
    this.#fireEvent({
      type: 'valuechange',
      data: sliceInfoData
    });
  };

  /**
   * Is this class listening to app events.
   *
   * @returns {boolean} True is listening to app events.
   */
  isListening() {
    return this.#isListening;
  }

  /**
   * Toggle info listeners.
   */
  addAppListeners() {
    // listen to update tags data
    this.#app.addEventListener('positionchange', this.onSliceChange);
    // add event listeners
    for (const eventName of this.#eventNames) {
      this.#app.addEventListener(eventName, this.#updateData);
    }
    // update flag
    this.#isListening = true;
  }

  /**
   * Toggle info listeners.
   */
  removeAppListeners() {
    // stop listening to update tags data
    this.#app.removeEventListener('positionchange', this.onSliceChange);
    // remove event listeners
    for (const eventName of this.#eventNames) {
      this.#app.removeEventListener(eventName, this.#updateData);
    }
    // update flag
    this.#isListening = false;
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
  #fireEvent(event) {
    this.#listenerHandler.fireEvent(event);
  }

} // class InfoData

/**
 * Create info data array for a DICOM image.
 *
 * @param {object} dicomElements DICOM elements of the image.
 * @param {Record<string, InfoDataItem[]>} configs The info data configs.
 * @returns {InfoDataItem[]} Info data array.
 */
function createInfoData(dicomElements, configs) {
  const datas = [];
  let modality;
  const modElement = dicomElements['00080060'];
  if (typeof modElement !== 'undefined') {
    modality = modElement.value[0];
  } else {
    return datas;
  }
  const modalityConfigs = configs[modality] || configs['*'];
  if (!modalityConfigs) {
    return datas;
  }

  // transform a config item into data item by adding a value
  for (const modalityConfig of modalityConfigs) {
    // deep copy
    const dataItem = JSON.parse(JSON.stringify(modalityConfig));

    // add tag values
    const tags = dataItem.tags;
    if (typeof tags !== 'undefined' && tags.length !== 0) {
      // get values
      const values = [];
      for (const tag of tags) {
        const elem = dicomElements[tag];
        if (typeof elem !== 'undefined') {
          if (elem.vr === 'DA') {
            const da = getDate(getDateObj(elem));
            if (typeof da !== 'undefined') {
              values.push(da.toLocaleDateString());
            }
          } else if (elem.vr === 'TM') {
            const baseDateObj = {year: 1900, monthIndex: 0, day: 1};
            const da = getDate(baseDateObj, getTimeObj(elem));
            if (typeof da !== 'undefined') {
              values.push(da.toLocaleTimeString());
            }
          } else {
            values.push(elem.value);
          }
        } else {
          values.push('undefined');
        }
      }
      // format
      if (typeof dataItem.format === 'undefined' || dataItem.format === null) {
        dataItem.format = createDefaultReplaceFormat(values.length);
      }
      dataItem.value = replaceFlags(dataItem.format, values).trim();
    }

    // store
    datas.push(dataItem);
  }

  // (0020,0020) Patient Orientation
  const poElement = dicomElements['00200020'];
  if (typeof poElement !== 'undefined' &&
    poElement.value.length === 2
  ) {
    const po0 = poElement.value[0];
    const po1 = poElement.value[1];
    datas.push({
      pos: 'cr', value: po0, format: '{v0}'
    });
    datas.push({
      pos: 'cl', value: getReverseOrientation(po0), format: '{v0}'
    });
    datas.push({
      pos: 'bc', value: po1, format: '{v0}'
    });
    datas.push({
      pos: 'tc', value: getReverseOrientation(po1), format: '{v0}'
    });
  }

  return datas;
}

/**
 * Create info data array for a DOM image.
 *
 * @param {object} domElements Meta data.
 * @param {Record<string, InfoDataItem[]>} configs The info data configs.
 * @returns {InfoDataItem[]} Info data array.
 */
function createInfoDataForDom(domElements, configs) {
  const datas = [];
  const domConfigs = configs.DOM;
  if (!domConfigs) {
    return datas;
  }

  // transform a config item into data item by adding a value
  for (const domConfig of domConfigs) {
    // deep copy
    const dataItem = JSON.parse(JSON.stringify(domConfig));

    // add tag values
    const tags = dataItem.tags;
    if (typeof tags !== 'undefined' && tags.length !== 0) {
      // get values
      const values = [];
      for (const tag of tags) {
        const elem = domElements[tag];
        if (typeof elem !== 'undefined') {
          values.push(elem.value);
        }
      }
      // format
      if (typeof dataItem.format === 'undefined' || dataItem.format === null) {
        dataItem.format = createDefaultReplaceFormat(values.length);
      }
      dataItem.value = replaceFlags(dataItem.format, values).trim();
    }

    // store
    datas.push(dataItem);
  }

  return datas;
}
