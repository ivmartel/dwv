// @vitest-environment jsdom
import {describe, test, assert} from 'vitest';
import {InfoLayer} from '../../src/gui/infoLayer.js';
import {getLayerDivId} from '../../src/gui/layerGroup.js';

/**
 * Tests for the 'gui/infoLayer.js' file.
 */

/**
 * Create an info data item.
 *
 * @param {string} pos The position.
 * @param {string} value The value.
 * @returns {object} The info data item.
 */
function getItem(pos, value) {
  return {pos, tags: ['00100010'], format: '{v0}', value};
}

/**
 * Create an info layer inside a layer group div appended to the document.
 *
 * @param {string} groupDivId The layer group div id.
 * @returns {{groupDiv: HTMLDivElement, infoLayer: InfoLayer}} The
 *   group div and info layer.
 */
function createInfoLayer(groupDivId) {
  const groupDiv = document.createElement('div');
  groupDiv.id = groupDivId;
  const div = document.createElement('div');
  groupDiv.appendChild(div);
  document.body.appendChild(groupDiv);
  return {groupDiv, infoLayer: new InfoLayer(div, groupDivId)};
}

describe('gui', () => {

  test('InfoLayer creates and updates items without ids', () => {
    const {groupDiv, infoLayer} = createInfoLayer('infoGroupA');
    infoLayer.onDataChange(new CustomEvent('x', {
      detail: {data: [getItem('tl', 'one'), getItem('br', 'two')]}
    }));
    assert.equal(groupDiv.querySelectorAll('[id]').length, 0, 'no ids');
    assert.equal(groupDiv.querySelector('.info-tl li').textContent, 'one');
    assert.equal(groupDiv.querySelector('.info-br li').textContent, 'two');

    infoLayer.onDataChange(new CustomEvent('x', {
      detail: {data: [getItem('tl', 'three'), getItem('br', 'four')]}
    }));
    assert.equal(groupDiv.querySelector('.info-tl li').textContent, 'three');
    assert.equal(groupDiv.querySelector('.info-br li').textContent, 'four');
    groupDiv.remove();
  });

  test('InfoLayer only updates from its own layer group', () => {
    const groupA = createInfoLayer('infoGroupB');
    const groupB = createInfoLayer('infoGroupC');
    const data = [getItem('tl', 'init')];
    groupA.infoLayer.onDataChange(new CustomEvent('x', {detail: {data}}));
    groupB.infoLayer.onDataChange(new CustomEvent('x', {detail: {data}}));

    const event = new CustomEvent('x', {
      detail: {
        data: [getItem('tl', 'fromB')],
        srclayerid: getLayerDivId('infoGroupC', 0)
      }
    });
    groupA.infoLayer.onDataChange(event);
    groupB.infoLayer.onDataChange(event);
    assert.equal(
      groupA.groupDiv.querySelector('.info-tl li').textContent, 'init');
    assert.equal(
      groupB.groupDiv.querySelector('.info-tl li').textContent, 'fromB');
    groupA.groupDiv.remove();
    groupB.groupDiv.remove();
  });

});
