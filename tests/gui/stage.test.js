// @vitest-environment jsdom
import {describe, test, assert, vi, afterEach} from 'vitest';
import {Stage} from '../../src/gui/stage.js';
import * as loggerModule from '../../src/utils/logger.js';

/**
 * Tests for the 'gui/stage.js' file.
 */

/**
 * @param {string} id The div id.
 * @returns {HTMLDivElement} A div appended to the document body.
 */
function makeDiv(id) {
  const div = document.createElement('div');
  div.id = id;
  document.body.appendChild(div);
  return div;
}

describe('gui/Stage', () => {

  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  test('initial state: no layer groups, undefined active', () => {
    const stage = new Stage();
    assert.equal(stage.getNumberOfLayerGroups(), 0);
    assert.equal(typeof stage.getActiveLayerGroup(), 'undefined');
    assert.equal(typeof stage.getLayerGroup(0), 'undefined');
  });

  test('addLayerGroup creates a layer group and marks it active', () => {
    const stage = new Stage();
    const lg = stage.addLayerGroup(makeDiv('lg0'));
    assert.equal(stage.getNumberOfLayerGroups(), 1);
    assert.equal(stage.getLayerGroup(0), lg);
    assert.equal(stage.getActiveLayerGroup(), lg);
  });

  test('addLayerGroup: each new group becomes the active one', () => {
    const stage = new Stage();
    const lg0 = stage.addLayerGroup(makeDiv('lg0'));
    assert.equal(stage.getActiveLayerGroup(), lg0);
    const lg1 = stage.addLayerGroup(makeDiv('lg1'));
    assert.equal(stage.getActiveLayerGroup(), lg1);
    assert.equal(stage.getNumberOfLayerGroups(), 2);
  });

  test('setActiveLayerGroup changes the active layer group', () => {
    const stage = new Stage();
    const lg0 = stage.addLayerGroup(makeDiv('lg0'));
    const lg1 = stage.addLayerGroup(makeDiv('lg1'));
    assert.equal(stage.getActiveLayerGroup(), lg1);
    stage.setActiveLayerGroup(0);
    assert.equal(stage.getActiveLayerGroup(), lg0);
  });

  test('setActiveLayerGroup ignores an invalid index', () => {
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});
    const stage = new Stage();
    const lg0 = stage.addLayerGroup(makeDiv('lg0'));
    stage.setActiveLayerGroup(0);
    stage.setActiveLayerGroup(99);
    assert.equal(stage.getActiveLayerGroup(), lg0);
    assert.equal(warnSpy.mock.calls.length, 1);
    assert.equal(
      warnSpy.mock.calls[0][0],
      'No layer group to set as active with index: 99');
  });

  test('getLayerGroupByDivId returns the correct group or undefined', () => {
    const stage = new Stage();
    stage.addLayerGroup(makeDiv('groupA'));
    stage.addLayerGroup(makeDiv('groupB'));
    assert.equal(stage.getLayerGroupByDivId('groupA'), stage.getLayerGroup(0));
    assert.equal(stage.getLayerGroupByDivId('groupB'), stage.getLayerGroup(1));
    assert.equal(typeof stage.getLayerGroupByDivId('unknown'), 'undefined');
  });

  test('getViewLayersByDataId aggregates results from all layer groups', () => {
    const stage = new Stage();
    const lg0 = stage.addLayerGroup(makeDiv('lg0'));
    const lg1 = stage.addLayerGroup(makeDiv('lg1'));
    const fakeLayer = {};
    vi.spyOn(lg0, 'getViewLayersByDataId').mockReturnValue([fakeLayer]);
    vi.spyOn(lg1, 'getViewLayersByDataId').mockReturnValue([]);
    const result = stage.getViewLayersByDataId('data1');
    assert.deepEqual(result, [fakeLayer]);
    assert.equal(lg0.getViewLayersByDataId.mock.calls[0][0], 'data1');
  });

  test('getViewLayers aggregates results from all layer groups', () => {
    const stage = new Stage();
    const lg0 = stage.addLayerGroup(makeDiv('lg0'));
    const lg1 = stage.addLayerGroup(makeDiv('lg1'));
    const fakeA = {};
    const fakeB = {};
    vi.spyOn(lg0, 'getViewLayers').mockReturnValue([fakeA]);
    vi.spyOn(lg1, 'getViewLayers').mockReturnValue([fakeB]);
    const result = stage.getViewLayers();
    assert.deepEqual(result, [fakeA, fakeB]);
  });

  test('getViewLayers forwards the callback to each layer group', () => {
    const stage = new Stage();
    const lg0 = stage.addLayerGroup(makeDiv('lg0'));
    const cb = vi.fn();
    vi.spyOn(lg0, 'getViewLayers').mockReturnValue([]);
    stage.getViewLayers(cb);
    assert.equal(lg0.getViewLayers.mock.calls[0][0], cb);
  });

  test('getDrawLayersByDataId aggregates results from all layer groups', () => {
    const stage = new Stage();
    const lg0 = stage.addLayerGroup(makeDiv('lg0'));
    const lg1 = stage.addLayerGroup(makeDiv('lg1'));
    const fakeLayer = {};
    vi.spyOn(lg0, 'getDrawLayersByDataId').mockReturnValue([fakeLayer]);
    vi.spyOn(lg1, 'getDrawLayersByDataId').mockReturnValue([]);
    const result = stage.getDrawLayersByDataId('data1');
    assert.deepEqual(result, [fakeLayer]);
    assert.equal(lg0.getDrawLayersByDataId.mock.calls[0][0], 'data1');
  });

  test('getDrawLayers aggregates results from all layer groups', () => {
    const stage = new Stage();
    const lg0 = stage.addLayerGroup(makeDiv('lg0'));
    const lg1 = stage.addLayerGroup(makeDiv('lg1'));
    const fakeA = {};
    const fakeB = {};
    vi.spyOn(lg0, 'getDrawLayers').mockReturnValue([fakeA]);
    vi.spyOn(lg1, 'getDrawLayers').mockReturnValue([fakeB]);
    const result = stage.getDrawLayers();
    assert.deepEqual(result, [fakeA, fakeB]);
  });

  test('getDrawLayers forwards the callback to each layer group', () => {
    const stage = new Stage();
    const lg0 = stage.addLayerGroup(makeDiv('lg0'));
    const cb = vi.fn();
    vi.spyOn(lg0, 'getDrawLayers').mockReturnValue([]);
    stage.getDrawLayers(cb);
    assert.equal(lg0.getDrawLayers.mock.calls[0][0], cb);
  });

  test('setBinders throws on null input', () => {
    const stage = new Stage();
    assert.throws(() => stage.setBinders(null));
  });

  test('setBinders throws on undefined input', () => {
    const stage = new Stage();
    assert.throws(() => stage.setBinders(undefined));
  });

  test('setBinders accepts an empty list without throwing', () => {
    const stage = new Stage();
    assert.doesNotThrow(() => stage.setBinders([]));
  });

  test('empty clears all layer groups and resets the active index', () => {
    const stage = new Stage();
    stage.addLayerGroup(makeDiv('lg0'));
    stage.addLayerGroup(makeDiv('lg1'));
    stage.empty();
    assert.equal(stage.getNumberOfLayerGroups(), 0);
    assert.equal(typeof stage.getActiveLayerGroup(), 'undefined');
  });

  test('removeLayersByDataId delegates to every layer group', () => {
    const stage = new Stage();
    const lg0 = stage.addLayerGroup(makeDiv('lg0'));
    const lg1 = stage.addLayerGroup(makeDiv('lg1'));
    const spy0 = vi.spyOn(lg0, 'removeLayersByDataId');
    const spy1 = vi.spyOn(lg1, 'removeLayersByDataId');
    stage.removeLayersByDataId('data1');
    assert.equal(spy0.mock.calls[0][0], 'data1');
    assert.equal(spy1.mock.calls[0][0], 'data1');
  });

  test('removeLayerGroup removes the group and updates the count', () => {
    const stage = new Stage();
    const lg0 = stage.addLayerGroup(makeDiv('lg0'));
    const lg1 = stage.addLayerGroup(makeDiv('lg1'));
    stage.removeLayerGroup(lg0);
    assert.equal(stage.getNumberOfLayerGroups(), 1);
    assert.equal(stage.getLayerGroup(0), lg1);
  });

  test('removeLayerGroup clears active index when active group removed', () => {
    const stage = new Stage();
    const lg0 = stage.addLayerGroup(makeDiv('lg0'));
    stage.setActiveLayerGroup(0);
    stage.removeLayerGroup(lg0);
    assert.equal(typeof stage.getActiveLayerGroup(), 'undefined');
  });

  test('removeLayerGroup throws when the group is not found', () => {
    const stage = new Stage();
    stage.addLayerGroup(makeDiv('lg0'));
    assert.throws(() => stage.removeLayerGroup({}));
  });

  test('resetZoomPan delegates to every layer group', () => {
    const stage = new Stage();
    const lg0 = stage.addLayerGroup(makeDiv('lg0'));
    const lg1 = stage.addLayerGroup(makeDiv('lg1'));
    const spy0 = vi.spyOn(lg0, 'resetZoomPan');
    const spy1 = vi.spyOn(lg1, 'resetZoomPan');
    stage.resetZoomPan();
    assert.equal(spy0.mock.calls.length, 1);
    assert.equal(spy1.mock.calls.length, 1);
  });

  test('resetViews delegates to every layer group', () => {
    const stage = new Stage();
    const lg0 = stage.addLayerGroup(makeDiv('lg0'));
    const lg1 = stage.addLayerGroup(makeDiv('lg1'));
    const spy0 = vi.spyOn(lg0, 'resetViews');
    const spy1 = vi.spyOn(lg1, 'resetViews');
    stage.resetViews();
    assert.equal(spy0.mock.calls.length, 1);
    assert.equal(spy1.mock.calls.length, 1);
  });

  test('draw delegates to every layer group', () => {
    const stage = new Stage();
    const lg0 = stage.addLayerGroup(makeDiv('lg0'));
    const lg1 = stage.addLayerGroup(makeDiv('lg1'));
    const spy0 = vi.spyOn(lg0, 'draw');
    const spy1 = vi.spyOn(lg1, 'draw');
    stage.draw();
    assert.equal(spy0.mock.calls.length, 1);
    assert.equal(spy1.mock.calls.length, 1);
  });

  test('setImageSmoothing propagates to existing layer groups', () => {
    const stage = new Stage();
    const lg0 = stage.addLayerGroup(makeDiv('lg0'));
    const lg1 = stage.addLayerGroup(makeDiv('lg1'));
    const spy0 = vi.spyOn(lg0, 'setImageSmoothing');
    const spy1 = vi.spyOn(lg1, 'setImageSmoothing');
    stage.setImageSmoothing(true);
    assert.equal(spy0.mock.calls[0][0], true);
    assert.equal(spy1.mock.calls[0][0], true);
  });

  test('fitToContainer calls fitToContainer on each layer group', () => {
    const stage = new Stage();
    const lg0 = stage.addLayerGroup(makeDiv('lg0'));
    const lg1 = stage.addLayerGroup(makeDiv('lg1'));
    vi.spyOn(lg0, 'getDivToWorldSizeRatio').mockReturnValue(undefined);
    vi.spyOn(lg1, 'getDivToWorldSizeRatio').mockReturnValue(undefined);
    const fitSpy0 = vi.spyOn(lg0, 'fitToContainer')
      .mockImplementation(() => {});
    const fitSpy1 = vi.spyOn(lg1, 'fitToContainer')
      .mockImplementation(() => {});
    stage.fitToContainer();
    assert.equal(fitSpy0.mock.calls.length, 1);
    assert.equal(fitSpy1.mock.calls.length, 1);
  });

  test('fitToContainer uses minimum ratio across bound groups', () => {
    const stage = new Stage();
    const lg0 = stage.addLayerGroup(makeDiv('lg0'));
    const lg1 = stage.addLayerGroup(makeDiv('lg1'));
    vi.spyOn(lg0, 'getDivToWorldSizeRatio').mockReturnValue(0.5);
    vi.spyOn(lg1, 'getDivToWorldSizeRatio').mockReturnValue(0.3);
    vi.spyOn(lg0, 'shouldBind').mockReturnValue(true);
    vi.spyOn(lg1, 'shouldBind').mockReturnValue(true);
    const fitSpy0 = vi.spyOn(lg0, 'fitToContainer')
      .mockImplementation(() => {});
    const fitSpy1 = vi.spyOn(lg1, 'fitToContainer')
      .mockImplementation(() => {});
    stage.fitToContainer();
    assert.equal(fitSpy0.mock.calls[0][0], 0.3);
    assert.equal(fitSpy1.mock.calls[0][0], 0.3);
  });

});
