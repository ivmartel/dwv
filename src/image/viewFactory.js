import {custom} from '../app/custom.js';
import {View} from './view.js';
import {WindowLevel} from './windowLevel.js';

// doc imports
/* eslint-disable no-unused-vars */
import {Image} from './image.js';
import {DataElement} from '../dicom/dataElement.js';
/* eslint-enable no-unused-vars */

/**
 * List of default window level presets.
 *
 * @type {Object.<string, Object.<string, WindowLevel>>}
 */
const defaultWlPresets = {
  CT: {
    mediastinum: new WindowLevel(40, 400),
    lung: new WindowLevel(-500, 1500),
    bone: new WindowLevel(500, 2000),
    brain: new WindowLevel(40, 80),
    head: new WindowLevel(90, 350)
  }
};

/**
 * {@link View} factory.
 */
export class ViewFactory {

  /**
   * Get an View object from the read DICOM file.
   *
   * @param {Object<string, DataElement>} dataElements The DICOM tags.
   * @param {Image} image The associated image.
   * @returns {View} The new View.
   */
  create(dataElements, image) {
    // view
    const view = new View(image);

    // default color map
    if (image.getPhotometricInterpretation() === 'MONOCHROME1') {
      view.setColourMap('invPlain');
    }

    // window level presets
    let windowPresets = {};
    // image presets
    if (typeof image.getMeta().windowPresets !== 'undefined') {
      windowPresets = image.getMeta().windowPresets;
    }
    // min/max
    // Not filled yet since it is stil too costly to calculate min/max
    // for each slice... It will be filled at first use
    // (see view.setWindowLevelPreset).
    // Order is important, if no wl from DICOM, this will be the default.
    windowPresets.minmax = {name: 'minmax'};
    // optional modality presets
    const modality = image.getMeta().Modality;
    let wlPresets;
    if (typeof custom.wlPresets !== 'undefined' &&
      typeof custom.wlPresets[modality] !== 'undefined') {
      wlPresets = custom.wlPresets[modality];
    } else {
      wlPresets = defaultWlPresets[modality];
    }
    for (const key in wlPresets) {
      const preset = wlPresets[key];
      windowPresets[key] = {
        wl: [new WindowLevel(preset.center, preset.width)],
        name: key
      };
    }

    // store
    view.setWindowPresets(windowPresets);

    // initialise the view
    view.init();

    return view;
  }

} // class ViewFactory
