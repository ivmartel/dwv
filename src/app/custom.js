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
   * @type {Record<string, Record<string, WindowLevel>>}
   */
  wlPresets: undefined,

  /**
   * List of default shape label texts. Indexed by shape name
   * and then by modality. For example `labelTexts.arrow.MR`.
   * No need to redefine all, just overrides is enough. Defaults
   * are used if `custom.labelTexts[shapeName]` is undefined.
   *
   * @type {Record<string, Record<string, string>>}
   */
  labelTexts: undefined,

  /**
   * List of private diffusion b-value rules. Rules are either
   * `{manufacturer, key}` or `{uidPrefix, key}`. For example:
   * `{manufacturer: 'GE', key: '00431039'}`.
   *
   * @type {object[]}
   */
  privateBValueRules: undefined,

  /**
   * Open a dialogue to edit roi data. Defaults to window.prompt.
   *
   * @param {Annotation} annotation The roi data.
   * @param {Function} callback The callback to launch on dialogue exit.
   */
  openRoiDialog: undefined,

  /**
   * Get the volume id from a list of dicom tags.
   *
   * @param {Record<string, DataElement>} elements The DICOM elements.
   * @returns {number|undefined} The id value if available.
   */
  getVolumeIdTagValue: undefined,

  /**
   * Get the volume id from a list of dicom tags parsed after load finishes.
   *
   * @param {Record<string, DataElement>} elements The DICOM elements.
   * @returns {number|undefined} The id value if available.
   */
  getPostLoadVolumeIdTagValue: undefined,

  /**
   * Get the pixel data unit from a list of dicom tags.
   * Not used for PET data with SUV values.
   *
   * @param {Record<string, DataElement>} elements The DICOM elements.
   * @returns {string|undefined} The unit value if available.
   */
  getTagPixelUnit: undefined,

};