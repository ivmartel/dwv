/**
 * @import {WindowLevel} from '../image/windowLevel.js';
 */

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
   * List of private diffusion b-value rules, tested in order. Rules
   * are either `{manufacturer, key}` or `{uidPrefix, key}`. For example:
   * `{manufacturer: 'GE', key: '00431039'}`. Overrides the default list
   * from `dicomVolume.js` (exported as `defaultPrivateBValueRules`),
   * which can be used to extend it.
   *
   * @type {{manufacturer?: string, uidPrefix?: string, key: string}[]}
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
   * @deprecated Since v0.37, please use volumeIdCandidates with
   *   a `preLoad` candidate, for example:
   *   `[{name: 'custom', getter: fn, preLoad: true},
   *   ...defaultVolumeIdCandidates]`.
   */
  getVolumeIdTagValue: undefined,

  /**
   * Get the volume id from a list of dicom tags parsed after load finishes.
   *
   * @param {Record<string, DataElement>} elements The DICOM elements.
   * @returns {number|undefined} The id value if available.
   * @deprecated Since v0.37, please use volumeIdCandidates, for example:
   *   `[{name: 'custom', getter: fn}, ...defaultVolumeIdCandidates]`.
   */
  getPostLoadVolumeIdTagValue: undefined,

  /**
   * Ordered list of candidate volume id getters, tried in order until
   * one produces a valid per-volume grouping of the files of a series
   * or of the frames of a multi-frame file. Candidates flagged with
   * `preLoad` are also used while loading: they must not vary between
   * the slices of a single volume. Overrides the default list from
   * `dicomVolume.js` (exported as `defaultVolumeIdCandidates`), which can
   * be used to extend it.
   *
   * @type {{name: string, getter: Function, preLoad?: boolean}[]}
   */
  volumeIdCandidates: undefined,

  /**
   * Get the pixel data unit from a list of dicom tags.
   * Not used for PET data with SUV values.
   *
   * @param {Record<string, DataElement>} elements The DICOM elements.
   * @returns {string|undefined} The unit value if available.
   */
  getTagPixelUnit: undefined,

};