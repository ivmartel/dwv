import {View} from './view';
import {luts} from './luts';
import {
  WindowLevel,
  defaultPresets
} from './windowLevel';
import {logger} from '../utils/logger';

// doc imports
/* eslint-disable no-unused-vars */
import {Image} from './image';
import {DataElement} from '../dicom/dataElement';
/* eslint-enable no-unused-vars */

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
    } else if (image.getPhotometricInterpretation() === 'PALETTE COLOR') {
      if (typeof luts['palette'] !== 'undefined') {
        view.setColourMap('palette');
      } else {
        logger.warn('Cannot find Palette lut');
      }
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
    if (typeof defaultPresets !== 'undefined') {
      const modality = image.getMeta().Modality;
      for (const key in defaultPresets[modality]) {
        const preset = defaultPresets[modality][key];
        windowPresets[key] = {
          wl: [new WindowLevel(preset.center, preset.width)],
          name: key
        };
      }
    }

    // store
    view.setWindowPresets(windowPresets);

    // initialise the view
    view.init();

    return view;
  }

} // class ViewFactory
