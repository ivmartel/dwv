import {ListenerHandler} from '../utils/listen';
import {getReverseOrientation} from '../dicom/dicomParser';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application';
/* eslint-enable no-unused-vars */

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
    res += '{v' + i + '}';
  }
  return res;
}

/**
 * Replace flags in a input string. Flags are keywords surrounded with curly
 * braces in the form: '{v0}, {v1}'.
 *
 * @param {string} inputStr The input string.
 * @param {string[]} values An array of strings.
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
    res = res.replace('{v' + i + '}', values[i]);
  }
  return res;
}

/**
 * DICOM Header overlay info.
 */
export class OverlayData {

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
   * Overlay config.
   *
   * @type {object}
   */
  #configs;

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
   * Overlay data.
   *
   * @type {Array}
   */
  #data = [];

  /**
   * Current data uid: set on pos change.
   *
   * @type {number}
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
   * @param {object} configs The overlay config.
   */
  constructor(app, dataId, configs) {
    this.#app = app;
    this.#dataId = dataId;
    this.#configs = configs;

    // parse overlays to get the list of events to listen to
    const keys = Object.keys(this.#configs);
    for (let i = 0; i < keys.length; ++i) {
      const config = this.#configs[keys[i]];
      for (let j = 0; j < config.length; ++j) {
        const eventType = config[j].event;
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
    this.#data = [];
    this.#currentDataUid = undefined;
  }

  /**
   * Handle a new loaded item event.
   *
   * @param {object} data The item meta data.
   */
  addItemMeta(data) {
    // create and store overlay data
    let dataUid;
    // check if dicom data (00020010: transfer syntax)
    if (typeof data['00020010'] !== 'undefined') {
      if (typeof data['00080018'] !== 'undefined') {
        // SOP instance UID
        dataUid = data['00080018'].value[0];
      } else {
        dataUid = data.length;
      }
      this.#data[dataUid] = createOverlayData(data, this.#configs);
    } else {
      // image file case
      const keys = Object.keys(data);
      for (let d = 0; d < keys.length; ++d) {
        const obj = data[keys[d]];
        if (keys[d] === 'imageUid') {
          dataUid = obj.value;
          break;
        }
      }
      this.#data[dataUid] = createOverlayDataForDom(data, this.#configs);
    }
    // store uid
    this.#currentDataUid = dataUid;
  }

  /**
   * Handle a changed slice event.
   *
   * @param {object} event The slicechange event.
   */
  #onSliceChange = (event) => {
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
   * Update the overlay data.
   *
   * @param {object} event An event defined by the overlay map and
   *   registered in toggleListeners.
   */
  #updateData = (event) => {
    if (event.dataid !== this.#dataId) {
      return;
    }

    const sliceOverlayData = this.#data[this.#currentDataUid];
    if (typeof sliceOverlayData === 'undefined') {
      console.warn('No slice overlay data for: ' + this.#currentDataUid);
      return;
    }

    for (let n = 0; n < sliceOverlayData.length; ++n) {
      let text = undefined;
      if (typeof sliceOverlayData[n].tags !== 'undefined') {
        // update tags only on slice change
        if (event.type === 'positionchange') {
          text = sliceOverlayData[n].value;
        }
      } else {
        // update text if the value is an event type
        if (typeof sliceOverlayData[n].event !== 'undefined' &&
          sliceOverlayData[n].event === event.type) {
          const format = sliceOverlayData[n].format;
          let values = event.value;
          // optional number precision
          if (typeof sliceOverlayData[n].precision !== 'undefined') {
            let mapFunc = null;
            if (sliceOverlayData[n].precision === 'round') {
              mapFunc = Math.round;
            } else {
              mapFunc = getNumberToPrecision(sliceOverlayData[n].precision);
            }
            values = values.map(mapFunc);
          }
          text = replaceFlags(format, values);
        }
      }
      if (typeof text !== 'undefined') {
        sliceOverlayData[n].value = text;
      }
    }

    // fire valuechange for listeners
    this.#fireEvent({type: 'valuechange', data: sliceOverlayData});
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
    this.#app.addEventListener('positionchange', this.#onSliceChange);
    // add event listeners
    for (let i = 0; i < this.#eventNames.length; ++i) {
      this.#app.addEventListener(this.#eventNames[i], this.#updateData);
    }
    // update flag
    this.#isListening = true;
  }

  /**
   * Toggle info listeners.
   */
  removeAppListeners() {
    // stop listening to update tags data
    this.#app.removeEventListener('positionchange', this.#onSliceChange);
    // remove event listeners
    for (let i = 0; i < this.#eventNames.length; ++i) {
      this.#app.removeEventListener(this.#eventNames[i], this.#updateData);
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

} // class OverlayData

/**
 * Create overlay data array for a DICOM image.
 *
 * @param {object} dicomElements DICOM elements of the image.
 * @param {object} configs The overlay data configs.
 * @returns {Array} Overlay data array.
 */
function createOverlayData(dicomElements, configs) {
  const overlays = [];
  let modality;
  const modElement = dicomElements['00080060'];
  if (typeof modElement !== 'undefined') {
    modality = modElement.value[0];
  } else {
    return overlays;
  }
  const config = configs[modality] || configs['*'];
  if (!config) {
    return overlays;
  }

  for (let n = 0; n < config.length; ++n) {
    // deep copy
    const overlay = JSON.parse(JSON.stringify(config[n]));

    // add tag values
    const tags = overlay.tags;
    if (typeof tags !== 'undefined' && tags.length !== 0) {
      // get values
      const values = [];
      for (let i = 0; i < tags.length; ++i) {
        const elem = dicomElements[tags[i]];
        if (typeof elem !== 'undefined') {
          values.push(dicomElements[tags[i]].value);
        } else {
          values.push('');
        }
      }
      // format
      if (typeof overlay.format === 'undefined' || overlay.format === null) {
        overlay.format = createDefaultReplaceFormat(values.length);
      }
      overlay.value = replaceFlags(overlay.format, values).trim();
    }

    // store
    overlays.push(overlay);
  }

  // (0020,0020) Patient Orientation
  const poElement = dicomElements['00200020'];
  if (typeof poElement !== 'undefined' &&
    poElement.value.length === 2
  ) {
    const po0 = poElement.value[0];
    const po1 = poElement.value[1];
    overlays.push({
      pos: 'cr', value: po0, format: '{v0}'
    });
    overlays.push({
      pos: 'cl', value: getReverseOrientation(po0), format: '{v0}'
    });
    overlays.push({
      pos: 'bc', value: po1, format: '{v0}'
    });
    overlays.push({
      pos: 'tc', value: getReverseOrientation(po1), format: '{v0}'
    });
  }

  return overlays;
}

/**
 * Create overlay data array for a DOM image.
 *
 * @param {object} info Meta data.
 * @param {object} configs The overlay data configs.
 * @returns {Array} Overlay data array.
 */
function createOverlayDataForDom(info, configs) {
  const overlays = [];
  const config = configs.DOM;
  if (!config) {
    return overlays;
  }

  const infoKeys = Object.keys(info);

  for (let n = 0; n < config.length; ++n) {
    // deep copy
    const overlay = JSON.parse(JSON.stringify(config[n]));

    // add tag values
    const tags = overlay.tags;
    if (typeof tags !== 'undefined' && tags.length !== 0) {
      // get values
      const values = [];
      for (let i = 0; i < tags.length; ++i) {
        for (let j = 0; j < infoKeys.length; ++j) {
          if (tags[i] === infoKeys[j]) {
            values.push(info[infoKeys[j]].value);
          }
        }
      }
      // format
      if (typeof overlay.format === 'undefined' || overlay.format === null) {
        overlay.format = createDefaultReplaceFormat(values.length);
      }
      overlay.value = replaceFlags(overlay.format, values).trim();
    }

    // store
    overlays.push(overlay);
  }

  return overlays;
}
