import {Tag} from './dicomTag.js';
import {
  tagGroups,
  dictionary
} from './dictionary.js';

/**
 * DICOM tag info: vr, multiplicity, name.
 */
export class TagInfo {
  /**
   * The tag Value Representation (VR).
   *
   * @type {string}
   */
  #vr;
  /**
   * The tag multiplicity.
   *
   * @type {number}
   */
  #multiplicity;
  /**
   * The tag name.
   *
   * @type {string}
   */
  #name;
  /**
   * @param {string} vr The tag Value Representation (VR).
   * @param {number} multiplicity The tag multiplicity.
   * @param {string} name The tag name.
   */
  constructor(vr, multiplicity, name) {
    this.#vr = vr;
    this.#multiplicity = multiplicity;
    this.#name = name;
  }
  /**
   * Get the tag Value Representation (VR).
   *
   * @returns {string} The tag vr.
   */
  getVr() {
    return this.#vr;
  }
  /**
   * Get the tag multiplicity.
   *
   * @returns {number} The multiplicity.
   */
  getMultiplicity() {
    return this.#multiplicity;
  }
  /**
   * Get the tag name.
   *
   * @returns {string} The name.
   */
  getName() {
    return this.#name;
  }
}

/**
 * Get the DICOM tag info for a tag using the
 * local DICOM tag dictionary.
 *
 * @param {Tag} tag The DICOM tag.
 * @returns {TagInfo|undefined} The info.
 */
export function getDicomTagInfo(tag) {
  if (typeof tag === 'undefined') {
    return undefined;
  }
  let info;
  const group = tag.getGroup();
  const element = tag.getElement();
  if (typeof dictionary[group] !== 'undefined' &&
    typeof dictionary[group][element] !== 'undefined') {
    const dictItem = dictionary[group][element];
    info = new TagInfo(
      dictItem[0],
      parseInt(dictItem[1], 10),
      dictItem[2]
    );
  }
  return info;
}

/**
 * Get the DICOM tag group name as defined in TagGroups.
 *
 * @param {Tag} tag The DICOM tag.
 * @returns {string|undefined} The group name.
 */
export function getDicomTagGroupName(tag) {
  return tagGroups[tag.getGroup()];
}

/**
 * Get a tag from the dictionary using a tag string name.
 *
 * @param {string} tagName The tag string name.
 * @returns {Tag|undefined} The tag object or undefined if
 *   bad input or not found.
 */
export function getTagFromDictionary(tagName) {
  if (typeof tagName === 'undefined' || tagName === null) {
    return undefined;
  }
  // search through dictionary
  const groups = Object.keys(dictionary);
  for (const group of groups) {
    const elements = Object.keys(dictionary[group]);
    for (const element of elements) {
      if (dictionary[group][element][2] === tagName) {
        return new Tag(group, element);
      }
    }
  }
  return undefined;
}