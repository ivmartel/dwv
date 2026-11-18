import {getLayerDetailsFromLayerDivId} from './layerGroup.js';

/**
 * @import {InfoDataItem} from './infoData.js';
 */

/**
 * Get the key of the HTML li element of a data.
 *
 * @param {InfoDataItem} data The associated data.
 * @returns {string} The key.
 */
function getLiKey(data) {
  let type;
  if (typeof data.tags !== 'undefined') {
    type = data.tags.join('');
  } else {
    type = data.event;
  }
  let format = encodeURIComponent(data.format.toLowerCase());
  format = format.replace(/%[0-9A-F]{2}/gi, '');

  return `${data.pos}-${type}-${format}`;
}

/**
 * Meta info layer.
 */
export class InfoLayer {
  /**
   * HTML creation flag.
   *
   * @type {boolean}
   */
  #created = false;

  /**
   * Associated HTML div.
   *
   * @type {HTMLDivElement}
   */
  #containerDiv;

  /**
   * The id of the parent layer group div.
   *
   * @type {string}
   */
  #groupDivId;

  /**
   * The HTML li elements, indexed by key (see `getLiKey`).
   *
   * @type {Map<string, HTMLLIElement>}
   */
  #liElements = new Map();

  /**
   * @param {HTMLDivElement} div The associated HTML div.
   * @param {string} groupDivId The id of the parent layer group div.
   */
  constructor(div, groupDivId) {
    this.#containerDiv = div;
    this.#groupDivId = groupDivId;
  }

  /**
   * Handle info data change.
   *
   * @param {CustomEvent} event The value change event.
   */
  onDataChange = (event) => {
    const data = event.detail?.data;
    if (typeof data === 'undefined') {
      return;
    }
    // avoid events from other layers
    if (typeof event.detail?.srclayerid !== 'undefined') {
      const srcDetails = getLayerDetailsFromLayerDivId(event.detail.srclayerid);
      if (srcDetails.groupDivId !== this.#groupDivId) {
        return;
      }
    }
    if (!this.#created) {
      this.#create(data);
    }
    this.#update(data);
  };

  /**
   * Create the info layer HTML.
   *
   * @param {InfoDataItem[]} data The info data array.
   */
  #create(data) {
    const doc = this.#containerDiv.ownerDocument;
    // possible info pos
    const posList = [];
    for (const item of data) {
      const dataPos = item.pos;
      if (!posList.includes(dataPos)) {
        posList.push(dataPos);
      }
    }

    for (const pos of posList) {
      // create list element
      const ul = doc.createElement('ul');
      // list items
      for (const item of data) {
        if (item.pos === pos) {
          const li = doc.createElement('li');
          const key = getLiKey(item);
          if (!this.#liElements.has(key)) {
            this.#liElements.set(key, li);
          }
          // fill in tags
          if (typeof item.tags !== 'undefined') {
            li.appendChild(doc.createTextNode(item.value));
          }
          // append to list
          ul.appendChild(li);
        }
      }
      // position element
      const posElement = doc.createElement('div');
      posElement.className = `info-${pos} info`;
      posElement.appendChild(ul);
      // append to main div
      this.#containerDiv.appendChild(posElement);
    }

    // update flag
    this.#created = true;
  };

  /**
   * Update the info layer HTML.
   *
   * @param {InfoDataItem[]} data The info data array.
   */
  #update(data) {
    const doc = this.#containerDiv.ownerDocument;
    // updates all the data
    for (const item of data) {
      const li = this.#liElements.get(getLiKey(item));
      const text = item.value;
      if (text && li) {
        // update li
        li.replaceChildren(doc.createTextNode(text));
      }
    }
  };

}; // class InfoLayer