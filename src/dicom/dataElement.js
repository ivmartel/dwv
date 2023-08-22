// doc imports
/* eslint-disable no-unused-vars */
import {Tag} from './dicomTag';
/* eslint-enable no-unused-vars */

/**
 * DICOM data element.
 */
export class DataElement {
  /**
   * The element Value Representation.
   *
   * @type {string}
   */
  vr;
  /**
   * The element value.
   *
   * @type {Array}
   */
  value;

  // [start] internal values
  // only present during parsing or writing otherwise not set

  /**
   * The element dicom tag.
   *
   * @type {Tag}
   */
  tag;

  /**
   * The element Value Length.
   *
   * @type {number}
   */
  vl;

  /**
   * Flag to know if defined or undefined sequence length.
   *
   * @type {boolean}
   */
  undefinedLength;

  /**
   * The element start offset.
   *
   * @type {number}
   */
  startOffset;

  /**
   * The element end offset.
   *
   * @type {number}
   */
  endOffset;

  /**
   * The sequence items.
   *
   * @type {Array}
   */
  items;

  // [end] internal values

  /**
   * @param {string} vr The element VR (Value Representation).
   */
  constructor(vr) {
    this.vr = vr;
  }
}