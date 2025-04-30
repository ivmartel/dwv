// doc imports
/* eslint-disable no-unused-vars */
import {WindowLevel} from '../image/windowLevel.js';
/* eslint-enable no-unused-vars */

/**
 * Overridalbe custom object for client defined items.
 */
export const custom = {
  /**
   * List of default window level presets. Indexed bu modality
   * and then by preset name. For example `wlPresets.MR.mediastimun`.
   * No need to redefine all, just overrides is enough. Defaults
   * are used if `custom.wlPresets[modality]` is undefined.
   *
   * @type {Object.<string, Object.<string, WindowLevel>>}
   */
  wlPresets: undefined,

  /**
   * List of default shape label texts. Indexed by shape name
   * and then by modality. For example `labelTexts.arrow.MR`.
   * No need to redefine all, just overrides is enough. Defaults
   * are used if `custom.labelTexts[shapeName]` is undefined.
   *
   * @type {Object.<string, Object.<string, string>>}
   */
  labelTexts: undefined,

  /**
   * Open a dialogue to edit roi data. Defaults to window.prompt.
   *
   * @param {Annotation} annotation The roi data.
   * @param {Function} callback The callback to launch on dialogue exit.
   */
  openRoiDialog: undefined,

  /**
   * Get the time from a list of dicom tags.
   *
   * @param {Object<string, DataElement>} elements The DICOM elements.
   * @returns {number|undefined} The time value if available.
   */
  getTagTime: undefined,

  /**
   * Get the pixel data unit from a list of dicom tags.
   * Not used for PET data with SUV values.
   *
   * @param {Object<string, DataElement>} elements The DICOM elements.
   * @returns {string|undefined} The unit value if available.
   */
  getTagPixelUnit: undefined,


};