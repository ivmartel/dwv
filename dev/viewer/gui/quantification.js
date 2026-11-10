/**
 * @import {QuantificationGroup} from '../services/quantification.js';
 */

/**
 * Render quantification groups in a details element.
 *
 * @param {HTMLDivElement} detailsDiv The details element.
 * @param {QuantificationGroup[]} groups The quantification groups.
 */
export function renderQuantification(detailsDiv, groups) {
  if (groups.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'quantification-empty';
    emptyDiv.appendChild(document.createTextNode('No quantification.'));
    detailsDiv.replaceChildren(emptyDiv);
    return;
  }
  const elements = [];
  for (const group of groups) {
    const title = document.createElement('div');
    title.className = 'quantification-title';
    title.appendChild(document.createTextNode(group.title));
    const list = document.createElement('dl');
    list.className = 'quantification';
    for (const item of group.items) {
      const term = document.createElement('dt');
      term.appendChild(document.createTextNode(item.label));
      const value = document.createElement('dd');
      value.appendChild(document.createTextNode(item.value));
      // wrap pair to allow several per line
      const pair = document.createElement('div');
      pair.appendChild(term);
      pair.appendChild(value);
      list.appendChild(pair);
    }
    const groupDiv = document.createElement('div');
    groupDiv.className = 'quantification-group';
    groupDiv.appendChild(title);
    groupDiv.appendChild(list);
    elements.push(groupDiv);
  }
  detailsDiv.replaceChildren(...elements);
}
