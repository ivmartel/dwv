import {
  getLayerDetailsFromLayerDivId,
  getLayerDetailsFromInfoLayerDivId
} from './layerGroup.js';

/**
 * @import {InfoDataItem} from './infoData.js';
 */

/**
 * Get the HTML div id of a position element.
 *
 * @param {string} pos The position indicator.
 * @returns {string} The div id.
 */
function getPosDivId(pos) {
  return `info-${pos}`;
}

/**
 * Get the HTML li id for a data.
 *
 * @param {InfoDataItem} data The associated data.
 * @returns {string} The ID.
 */
function getLiId(data) {
  let type;
  if (typeof data.tags !== 'undefined') {
    type = data.tags.join('');
  } else {
    type = data.event;
  }
  let format = encodeURIComponent(data.format.toLowerCase());
  format = format.replace(/%[0-9A-F]{2}/gi, '');

  return `${getPosDivId(data.pos)}-${type}-${format}`;
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
   * @param {HTMLDivElement} div The associated HTML div.
   */
  constructor(div) {
    this.#containerDiv = div;
  }

  /**
   * Handle info data change.
   *
   * @param {object} event The value change event.
   */
  onDataChange = (event) => {
    if (typeof event.data === 'undefined') {
      return;
    }
    // avoid events from other layers
    if (typeof event.srclayerid !== 'undefined') {
      const srcDetails = getLayerDetailsFromLayerDivId(event.srclayerid);
      const details =
        getLayerDetailsFromInfoLayerDivId(this.#containerDiv.id);
      if (srcDetails.groupDivId !== details.groupDivId) {
        return;
      }
    }
    if (!this.#created) {
      this.#create(event.data);
    }
    this.#update(event.data);
  };

  /**
   * Create the info layer HTML.
   *
   * @param {InfoDataItem[]} data The info data array.
   */
  #create(data) {
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
      const ul = document.createElement('ul');
      // list items
      for (const item of data) {
        if (item.pos === pos) {
          const li = document.createElement('li');
          li.id = getLiId(item);
          // fill in tags
          if (typeof item.tags !== 'undefined') {
            li.appendChild(document.createTextNode(item.value));
          }
          // append to list
          ul.appendChild(li);
        }
      }
      // position element
      const posElement = document.createElement('div');
      posElement.id = getPosDivId(pos);
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
    // updates all the data
    for (const item of data) {
      const id = `#${getLiId(item)}`;
      const li = this.#containerDiv.querySelector(id);
      const text = item.value;
      if (text && li) {
        // update li
        li.replaceChildren(document.createTextNode(text));
      }
    }
  };

}; // class InfoLayer