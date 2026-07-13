/**
 * @import {WindowLevel} from './windowLevel.js';
 */

/**
 * Window level preset: a named list of window levels.
 * The list holds a single window level unless the preset is 'perslice',
 * in which case it holds one window level per slice.
 */
export class WindowPreset {
  /**
   * The preset name.
   *
   * @type {string}
   */
  name;

  /**
   * The list of window levels.
   *
   * @type {WindowLevel[]|undefined}
   */
  wl;

  /**
   * Flag to indicate a per-slice window level list.
   *
   * @type {boolean|undefined}
   */
  perslice;

  /**
   * @param {string} name The preset name.
   * @param {WindowLevel[]} [wl] The list of window levels.
   * @param {boolean} [perslice] Flag for a per-slice window level list.
   */
  constructor(name, wl, perslice) {
    this.name = name;
    this.wl = wl;
    this.perslice = perslice;
  }

} // WindowPreset class
