// @vitest-environment jsdom
import {describe, test, assert, vi, afterEach} from 'vitest';
import {
  LayerGroup,
  getLayerDivId,
  getLayerDetailsFromLayerDivId,
  getInfoLayerDivId,
  getLayerDetailsFromInfoLayerDivId,
  getLayerDetailsFromEvent,
  getScaledOffset,
} from '../../src/gui/layerGroup.js';
import {PositionBinder, WindowLevelBinder} from '../../src/gui/binders.js';
import {Stage} from '../../src/gui/stage.js';
import {Point, Point3D} from '../../src/math/point.js';
import {Index} from '../../src/math/index.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Geometry} from '../../src/image/geometry.js';
import {Image} from '../../src/image/image.js';
import {View} from '../../src/image/view.js';
import {ViewController} from '../../src/app/viewController.js';
import {getIdentityMat33} from '../../src/math/matrix.js';
import * as loggerModule from '../../src/utils/logger.js';

/**
 * Tests for the 'gui/layerGroup.js' file.
 */

/**
 * Create a layer group mock with one view layer, as used by the
 * position binder.
 *
 * @param {string} dataId The view layer data id.
 * @param {number[]} position The view layer current position.
 * @param {number[]} size The view layer image size.
 * @param {Geometry} [geometry] The view layer image geometry.
 * @returns {{layerGroup: object, vc: object}} The layer group and its
 *   view controller.
 */
function makeBinderLayerGroup(dataId, position, size, geometry) {
  // identity orientation and origin: plane x, y are the world x, y
  const vc = {
    geometry,
    canSyncVolume: (viewController, value) =>
      typeof geometry !== 'undefined' &&
      typeof viewController.geometry !== 'undefined' &&
      geometry.canSyncVolume(viewController.geometry, value),
    getCurrentPosition: () => new Point(position),
    moreThanOne: (dim) => new Size(size).moreThanOne(dim),
    getScrollDimIndex: () => 2,
    getPlanePositionFromPosition: (point) => ({
      getX: () => point.get(0),
      getY: () => point.get(1)
    }),
    getPositionFromPlanePoint: (point2D) => {
      const values = [...position];
      values[0] = point2D.getX();
      values[1] = point2D.getY();
      return new Point(values);
    },
    setCurrentPosition: vi.fn()
  };
  const vl = {
    getViewController: () => vc,
    getDataId: () => dataId
  };
  const layerGroup = Object.assign(new EventTarget(), {
    getViewLayersByDataId: (id) => id === dataId ? [vl] : [],
    getBaseViewLayer: () => vl
  });
  return {layerGroup, vc};
}

/**
 * Fire a position change event from a source layer group to a
 * position binder of a target layer group.
 *
 * @param {PositionBinder} binder The position binder.
 * @param {object} source The source layer group mock.
 * @param {object} target The target layer group mock.
 * @param {CustomEvent} event The position change event.
 */
function firePositionEvent(binder, source, target, event) {
  source.addEventListener('positionchange', binder.getCallback(target));
  source.dispatchEvent(event);
}

/**
 * Create a geometry with volume ids.
 *
 * @param {string} name The volume id name.
 * @param {number[]} values The volume id values.
 * @returns {Geometry} The geometry.
 */
function makeVolumeGeometry(name, values) {
  const geometry = new Geometry(
    [new Point3D(0, 0, 0)],
    new Size([2, 2, 1, values.length]),
    new Spacing([1, 1, 1]));
  geometry.setVolumeIds(
    values.map(value => ({id: {value, source: name, tagKey: name}})));
  return geometry;
}

/**
 * Create a position change event.
 *
 * @param {string} dataid The source data id.
 * @param {number[]} position The source position.
 * @param {number[]} diffDims The modified dimensions.
 * @returns {CustomEvent} The event.
 */
function makePositionEvent(dataid, position, diffDims) {
  return new CustomEvent('positionchange', {
    detail: {dataid, value: [[], position], diffDims}
  });
}

/**
 * Get the position set on a view controller mock.
 *
 * @param {object} vc The view controller mock.
 * @returns {number[]} The position values.
 */
function getSetPosition(vc) {
  return vc.setCurrentPosition.mock.calls[0][0].getValues();
}

/**
 * Create a layer group mock with one view layer, as used by the
 * window/level binder.
 *
 * @param {string} dataId The view layer data id.
 * @param {string[]} presetNames The view controller preset names.
 * @returns {{layerGroup: object, vc: object}} The layer group and its
 *   view controller.
 */
function makeWindowLevelBinderLayerGroup(dataId, presetNames) {
  const vc = {
    getWindowLevelPresetsNames: () => presetNames,
    setWindowLevel: vi.fn(),
    setWindowLevelPreset: vi.fn()
  };
  const vl = {
    getViewController: () => vc
  };
  const layerGroup = {
    getViewLayersByDataId: (id) => id === dataId ? [vl] : []
  };
  return {layerGroup, vc};
}

/**
 * Create a window/level change event.
 *
 * @param {string} dataid The source data id.
 * @param {Array} value The event value: [center, width, presetName].
 * @returns {CustomEvent} The event.
 */
function makeWindowLevelEvent(dataid, value) {
  return new CustomEvent('wlchange', {
    detail: {dataid, value}
  });
}

describe('gui', () => {

  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  /**
   * Tests for {@link LayerGroup} string id.
   *
   * @function module:tests/gui~layergroupStringId
   */
  test('LayerGroup string id', () => {
    // test #00
    const theoId00 = 'layerGroupA-layer-0';
    const theoDetails00 = {groupDivId: 'layerGroupA', layerIndex: 0};
    const id00 = getLayerDivId(
      theoDetails00.groupDivId, theoDetails00.layerIndex);
    const details00 = getLayerDetailsFromLayerDivId(theoId00);
    assert.equal(id00, theoId00, 'getLayerDivId #00');
    assert.equal(details00.groupDivId, theoDetails00.groupDivId,
      'getLayerDetailsFromLayerDivId groupId #00');
    assert.equal(details00.layerIndex, theoDetails00.layerIndex,
      'getLayerDetailsFromLayerDivId layerId #00');

    // test #01
    const theoId01 = 'layerGroupB-layer-1';
    const theoDetails01 = {groupDivId: 'layerGroupB', layerIndex: 1};
    const id01 = getLayerDivId(
      theoDetails01.groupDivId, theoDetails01.layerIndex);
    const details01 = getLayerDetailsFromLayerDivId(theoId01);
    assert.equal(id01, theoId01, 'getLayerDivId #01');
    assert.equal(details01.groupDivId, theoDetails01.groupDivId,
      'getLayerDetailsFromLayerDivId groupId #01');
    assert.equal(details01.layerIndex, theoDetails01.layerIndex,
      'getLayerDetailsFromLayerDivId layerId #01');
  });

  /**
   * Tests for {@link LayerGroup} creation.
   *
   * @function module:tests/gui~layergroupCreation
   */
  test('LayerGroup creation', () => {
    const element00 = document.createElement('div');
    element00.id = 'layerGroup00';
    const layerGroup00 = new LayerGroup(element00);
    assert.equal(layerGroup00.getNumberOfLayers(), 0,
      'new layerGroup has no layers');
    assert.equal(layerGroup00.getDivId(), element00.id,
      'new layerGroup div id');
  });

  /**
   * Tests for {@link LayerGroup} add/remove view layer.
   *
   * @function module:tests/gui~layergroupAddRemoveViewLayer
   */
  test('LayerGroup add remove view layer', () => {
    const element00 = document.createElement('div');
    element00.id = 'layerGroup00';
    const layerGroup00 = new LayerGroup(element00);
    assert.equal(layerGroup00.getNumberOfLayers(), 0,
      'new layerGroup has no layers');

    const vl00 = layerGroup00.addViewLayer();
    assert.equal(layerGroup00.getNumberOfLayers(), 1,
      'layerGroup has one view layers after add');
    let activeType = typeof layerGroup00.getActiveViewLayer();
    assert.ok(activeType !== 'undefined',
      'layerGroup active view layer is defined after add');

    layerGroup00.removeLayer(vl00);
    assert.equal(layerGroup00.getNumberOfLayers(), 0,
      'layerGroup has no view layers after remove');
    activeType = typeof layerGroup00.getActiveViewLayer();
    assert.ok(activeType === 'undefined',
      'layerGroup active view layer is undefined after remove');
  });

  /**
   * Tests for {@link LayerGroup} add/remove draw layer.
   *
   * @function module:tests/gui~layergroupAddRemoveDrawLayer
   */
  test('LayerGroup add remove draw layer', () => {
    const element00 = document.createElement('div');
    element00.id = 'layerGroup00';
    const layerGroup00 = new LayerGroup(element00);
    assert.equal(layerGroup00.getNumberOfLayers(), 0,
      'new layerGroup has no layers');

    const dl00 = layerGroup00.addDrawLayer();
    assert.equal(layerGroup00.getNumberOfLayers(), 1,
      'layerGroup has one draw layers after add');
    let activeType = typeof layerGroup00.getActiveDrawLayer();
    assert.ok(activeType !== 'undefined',
      'layerGroup active draw layer is defined after add');

    layerGroup00.removeLayer(dl00);
    assert.equal(layerGroup00.getNumberOfLayers(), 0,
      'layerGroup has no draw layers after remove');
    activeType = typeof layerGroup00.getActiveDrawLayer();
    assert.ok(activeType === 'undefined',
      'layerGroup active draw layer is undefined after remove');
  });

  test('getInfoLayerDivId returns expected id', () => {
    assert.equal(getInfoLayerDivId('layerGroupA'), 'layerGroupA-infolayer');
    assert.equal(getInfoLayerDivId('lg0'), 'lg0-infolayer');
  });

  test('getLayerDetailsFromInfoLayerDivId returns the groupDivId', () => {
    const details = getLayerDetailsFromInfoLayerDivId('layerGroupA-infolayer');
    assert.equal(details.groupDivId, 'layerGroupA');
  });

  test('getLayerDetailsFromEvent returns null when no .layer ancestor', () => {
    const div = document.createElement('div');
    const ev = {target: div};
    assert.isNull(getLayerDetailsFromEvent(ev));
  });

  test('getLayerDetailsFromEvent extracts details from .layer', () => {
    const layerDiv = document.createElement('div');
    layerDiv.className = 'layer';
    layerDiv.id = 'layerGroup0-layer-1';
    const canvas = document.createElement('canvas');
    layerDiv.appendChild(canvas);
    document.body.appendChild(layerDiv);
    const ev = {target: canvas};
    const details = getLayerDetailsFromEvent(ev);
    assert.equal(details.groupDivId, 'layerGroup0');
    assert.equal(details.layerIndex, '1');
  });

  test('getScaledOffset keeps the center fixed under a new scale', () => {
    const offset = {x: 0, y: 0};
    const scale = {x: 1, y: 1};
    const newScale = {x: 2, y: 2};
    const center = {x: 10, y: 20};
    const result = getScaledOffset(offset, scale, newScale, center);
    // indexCenter = (center - offset) * scale = (10,20)
    // newOffset = center - indexCenter / newScale = (10-5, 20-10) = (5, 10)
    assert.equal(result.x, 5);
    assert.equal(result.y, 10);
  });

  test('LayerGroup constructor with info layer creates info layer div', () => {
    const div = document.createElement('div');
    div.id = 'lgWithInfo';
    document.body.appendChild(div);
    new LayerGroup(div, true);
    const infoDiv = div.querySelector('#lgWithInfo-infolayer');
    assert.ok(infoDiv, 'info layer div exists');
    assert.ok(infoDiv.classList.contains('infoLayer'));
  });

  test('LayerGroup getDivId returns the container div id', () => {
    const div = document.createElement('div');
    div.id = 'myGroup';
    const lg = new LayerGroup(div);
    assert.equal(lg.getDivId(), 'myGroup');
  });

  test('LayerGroup initial scale is {x:1,y:1,z:1}', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    const lg = new LayerGroup(div);
    assert.deepEqual(lg.getScale(), {x: 1, y: 1, z: 1});
    assert.deepEqual(lg.getBaseScale(), {x: 1, y: 1, z: 1});
    assert.deepEqual(lg.getAddedScale(), {x: 1, y: 1, z: 1});
  });

  test('LayerGroup initial offset is {x:0,y:0,z:0}', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    const lg = new LayerGroup(div);
    assert.deepEqual(lg.getOffset(), {x: 0, y: 0, z: 0});
  });

  test('setScale updates the scale and fires zoomchange', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    const lg = new LayerGroup(div);
    const newScale = {x: 2, y: 2, z: 2};
    let fired = false;
    lg.addEventListener('zoomchange', (ev) => {
      fired = true;
      assert.deepEqual(ev.detail.value, [2, 2, 2]);
    });
    lg.setScale(newScale);
    assert.deepEqual(lg.getScale(), newScale);
    assert.ok(fired, 'zoomchange was fired');
  });

  test('setOffset updates the offset and fires offsetchange', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    const lg = new LayerGroup(div);
    const newOffset = {x: 10, y: 20, z: 30};
    let fired = false;
    lg.addEventListener('offsetchange', (ev) => {
      fired = true;
      assert.deepEqual(ev.detail.value, [10, 20, 30]);
    });
    lg.setOffset(newOffset);
    assert.deepEqual(lg.getOffset(), newOffset);
    assert.ok(fired, 'offsetchange was fired');
  });

  test('addTranslation shifts the offset in the opposite direction', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    const lg = new LayerGroup(div);
    lg.addTranslation({x: 3, y: 5, z: 7});
    assert.deepEqual(lg.getOffset(), {x: -3, y: -5, z: -7});
  });

  test('flipScaleZ negates the base scale z and updates scale', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    const lg = new LayerGroup(div);
    lg.flipScaleZ();
    assert.equal(lg.getBaseScale().z, -1);
    assert.equal(lg.getScale().z, -1);
  });

  test('addScale multiplies scale by (1 + step)', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    const lg = new LayerGroup(div);
    lg.addScale(0.5, {getX: () => 0, getY: () => 0, getZ: () => 0});
    assert.equal(lg.getScale().x, 1.5);
    assert.equal(lg.getScale().y, 1.5);
  });

  test('resetZoomPan restores base scale and zero offset', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    const lg = new LayerGroup(div);
    lg.setScale({x: 3, y: 3, z: 3});
    lg.setOffset({x: 10, y: 10, z: 10});
    lg.resetZoomPan();
    assert.deepEqual(lg.getScale(), {x: 1, y: 1, z: 1});
    assert.deepEqual(lg.getOffset(), {x: 0, y: 0, z: 0});
  });

  test('getAddedScale reflects scale relative to baseScale', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    const lg = new LayerGroup(div);
    lg.flipScaleZ();
    lg.setScale({x: -2, y: 2, z: -2});
    const added = lg.getAddedScale();
    assert.equal(added.z, 2);
  });

  test('shouldBind returns false with no view layers', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    const lg = new LayerGroup(div);
    assert.equal(lg.shouldBind(), false);
  });

  test('getMaxWorldSize returns undefined with no layers', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    const lg = new LayerGroup(div);
    assert.equal(typeof lg.getMaxWorldSize(), 'undefined');
  });

  test('includes returns false for undefined id', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    const lg = new LayerGroup(div);
    assert.equal(lg.includes(undefined), false);
  });

  test('includes returns true after addViewLayer', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    const vl = lg.addViewLayer();
    assert.ok(lg.includes(vl.getId()));
  });

  test('getNumberOfViewLayers counts only view layers', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    assert.equal(lg.getNumberOfViewLayers(), 0);
    lg.addViewLayer();
    assert.equal(lg.getNumberOfViewLayers(), 1);
    lg.addDrawLayer();
    assert.equal(lg.getNumberOfViewLayers(), 1);
  });

  test('getViewLayers returns only view layers', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    const vl = lg.addViewLayer();
    lg.addDrawLayer();
    const viewLayers = lg.getViewLayers();
    assert.equal(viewLayers.length, 1);
    assert.equal(viewLayers[0], vl);
  });

  test('getViewLayers filters with callback', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    lg.addViewLayer();
    assert.equal(lg.getViewLayers(() => false).length, 0);
  });

  test('getDrawLayers returns only draw layers', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    lg.addViewLayer();
    const dl = lg.addDrawLayer();
    const drawLayers = lg.getDrawLayers();
    assert.equal(drawLayers.length, 1);
    assert.equal(drawLayers[0], dl);
  });

  test('getDrawLayers filters with callback', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    lg.addDrawLayer();
    assert.equal(lg.getDrawLayers(() => false).length, 0);
  });

  test('getActiveViewLayer returns view layer after addViewLayer', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    const vl = lg.addViewLayer();
    assert.equal(lg.getActiveViewLayer(), vl);
  });

  test('getActiveViewLayer returns undefined for active draw layer', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    lg.addViewLayer();
    lg.addDrawLayer();
    assert.equal(typeof lg.getActiveViewLayer(), 'undefined');
  });

  test('getActiveDrawLayer returns draw layer after addDrawLayer', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    const dl = lg.addDrawLayer();
    assert.equal(lg.getActiveDrawLayer(), dl);
  });

  test('getBaseViewLayer returns the first view layer', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    const vl0 = lg.addViewLayer();
    lg.addViewLayer();
    assert.equal(lg.getBaseViewLayer(), vl0);
  });

  test('getBaseViewLayer returns undefined with no view layers', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    const lg = new LayerGroup(div);
    assert.equal(typeof lg.getBaseViewLayer(), 'undefined');
  });

  test('setActiveLayer fires activelayerchange event', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    const vl = lg.addViewLayer();
    const vl2 = lg.addViewLayer();
    let eventLayer;
    lg.addEventListener('activelayerchange', (ev) => {
      eventLayer = ev.detail.value[0];
    });
    lg.setActiveLayer(0);
    assert.equal(eventLayer, vl);
    lg.setActiveLayer(1);
    assert.equal(eventLayer, vl2);
  });

  test('setActiveLayerById sets the active layer by id', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    const vl0 = lg.addViewLayer();
    const vl1 = lg.addViewLayer();
    lg.setActiveLayerById(vl0.getId());
    assert.equal(lg.getActiveViewLayer(), vl0);
    lg.setActiveLayerById(vl1.getId());
    assert.equal(lg.getActiveViewLayer(), vl1);
  });

  test('setActiveLayerByDataId sets the active layer by data id', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    const vl0 = lg.addViewLayer();
    const vl1 = lg.addViewLayer();
    vi.spyOn(vl0, 'getDataId').mockReturnValue('data0');
    vi.spyOn(vl1, 'getDataId').mockReturnValue('data1');
    lg.setActiveLayerByDataId('data0');
    assert.equal(lg.getActiveViewLayer(), vl0);
  });

  test('getViewLayersByDataId returns matching view layers', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    const vl = lg.addViewLayer();
    vi.spyOn(vl, 'getDataId').mockReturnValue('data0');
    assert.deepEqual(lg.getViewLayersByDataId('data0'), [vl]);
    assert.deepEqual(lg.getViewLayersByDataId('other'), []);
  });

  test('getDrawLayersByDataId returns matching draw layers', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    const dl = lg.addDrawLayer();
    vi.spyOn(dl, 'getDataId').mockReturnValue('data0');
    assert.deepEqual(lg.getDrawLayersByDataId('data0'), [dl]);
    assert.deepEqual(lg.getDrawLayersByDataId('other'), []);
  });

  test('getViewDataIndices returns data ids of all view layers', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    const vl0 = lg.addViewLayer();
    const vl1 = lg.addViewLayer();
    vi.spyOn(vl0, 'getDataId').mockReturnValue('data0');
    vi.spyOn(vl1, 'getDataId').mockReturnValue('data1');
    assert.deepEqual(lg.getViewDataIndices(), ['data0', 'data1']);
  });

  test('setImageSmoothing propagates to view layers only', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    const vl = lg.addViewLayer();
    lg.addDrawLayer();
    const vlSpy = vi.spyOn(vl, 'setImageSmoothing');
    lg.setImageSmoothing(true);
    assert.equal(vlSpy.mock.calls.length, 1);
    assert.equal(vlSpy.mock.calls[0][0], true);
  });

  test('draw delegates to all layers', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    const vl = lg.addViewLayer();
    const dl = lg.addDrawLayer();
    const vlSpy = vi.spyOn(vl, 'draw').mockImplementation(() => {});
    const dlSpy = vi.spyOn(dl, 'draw').mockImplementation(() => {});
    lg.draw();
    assert.equal(vlSpy.mock.calls.length, 1);
    assert.equal(dlSpy.mock.calls.length, 1);
  });

  test('display delegates flag to all layers', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    const vl = lg.addViewLayer();
    const dl = lg.addDrawLayer();
    const vlSpy = vi.spyOn(vl, 'display').mockImplementation(() => {});
    const dlSpy = vi.spyOn(dl, 'display').mockImplementation(() => {});
    lg.display(false);
    assert.equal(vlSpy.mock.calls[0][0], false);
    assert.equal(dlSpy.mock.calls[0][0], false);
  });

  test('removeLayer fires layerremove event', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    const vl = lg.addViewLayer();
    let eventLayerId;
    lg.addEventListener('layerremove', (ev) => {
      eventLayerId = ev.detail.layerid;
    });
    lg.removeLayer(vl);
    assert.equal(eventLayerId, vl.getId());
  });

  test('removeLayer throws when the layer is not in the group', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    lg.addViewLayer();
    assert.throws(() => lg.removeLayer({}));
  });

  test('empty clears all layers and fires layerremove for each', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    lg.addViewLayer();
    lg.addDrawLayer();
    let removeCount = 0;
    lg.addEventListener('layerremove', () => {
      removeCount++;
    });
    lg.empty();
    assert.equal(lg.getNumberOfLayers(), 0);
    assert.equal(removeCount, 2);
  });

  test('removeLayersByDataId removes layers matching the data id', () => {
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    const vl0 = lg.addViewLayer();
    const vl1 = lg.addViewLayer();
    vi.spyOn(vl0, 'getDataId').mockReturnValue('data0');
    vi.spyOn(vl1, 'getDataId').mockReturnValue('data1');
    lg.removeLayersByDataId('data0');
    assert.equal(lg.getNumberOfLayers(), 1);
    assert.equal(lg.getViewLayers()[0], vl1);
  });

  test('setShowCrosshair get/set round-trips correctly', () => {
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});
    const div = document.createElement('div');
    div.id = 'lg0';
    document.body.appendChild(div);
    const lg = new LayerGroup(div);
    assert.equal(lg.getShowCrosshair(), false);
    lg.setShowCrosshair(true);
    assert.equal(lg.getShowCrosshair(), true);
    assert.equal(warnSpy.mock.calls.length, 1);
    assert.equal(warnSpy.mock.calls[0][0], 'No layer to show crosshair');
    lg.setShowCrosshair(false);
    assert.equal(lg.getShowCrosshair(), false);
  });

  /**
   * Tests for {@link PositionBinder}: same data.
   *
   * @function module:tests/gui~positionBinderSameData
   */
  test('PositionBinder binds the full position of the same data', () => {
    const {layerGroup, vc} =
      makeBinderLayerGroup('data0', [0, 0, 1, 0], [2, 2, 5, 3]);
    new PositionBinder().getCallback(layerGroup)(
      makePositionEvent('data0', [1, 1, 3, 2], [2, 3]));
    assert.deepEqual(getSetPosition(vc), [1, 1, 3, 2]);
  });

  /**
   * Tests for {@link PositionBinder}: same volume id origin.
   *
   * @function module:tests/gui~positionBinderSameVolumeIdOrigin
   */
  test('PositionBinder follows the volume id of the same origin', () => {
    const source = makeBinderLayerGroup('source', [0, 0, 1, 1], [2, 2, 5, 2],
      makeVolumeGeometry('TemporalPositionIdentifier', [1, 2]));
    const target = makeBinderLayerGroup('target', [0, 0, 1, 3], [2, 2, 5, 2],
      makeVolumeGeometry('TemporalPositionIdentifier', [2, 3]));
    firePositionEvent(new PositionBinder(), source.layerGroup,
      target.layerGroup, makePositionEvent('source', [1, 1, 3, 2], [2]));
    assert.deepEqual(getSetPosition(target.vc), [1, 1, 3, 2],
      'volume id value followed');
  });

  /**
   * Tests for {@link PositionBinder}: no matching volume id.
   *
   * @function module:tests/gui~positionBinderNoMatch
   */
  test('PositionBinder keeps the volume without a matching id', () => {
    const binder = new PositionBinder();
    const source = makeBinderLayerGroup('source', [0, 0, 1, 1], [2, 2, 5, 2],
      makeVolumeGeometry('TemporalPositionIdentifier', [1, 2]));
    const other = makeBinderLayerGroup('other', [0, 0, 1, 0], [2, 2, 5, 2],
      makeVolumeGeometry('DiffusionBValue', [0, 1]));
    const targetGeometry =
      makeVolumeGeometry('TemporalPositionIdentifier', [2, 3]);
    // different origin
    const target0 = makeBinderLayerGroup('target', [0, 0, 1, 3], [2, 2, 5, 2],
      targetGeometry);
    firePositionEvent(binder, other.layerGroup, target0.layerGroup,
      makePositionEvent('other', [1, 1, 3, 1], [2]));
    assert.deepEqual(getSetPosition(target0.vc), [1, 1, 3, 3],
      'different origin');
    // same origin, value not in target
    const target1 = makeBinderLayerGroup('target', [0, 0, 1, 3], [2, 2, 5, 2],
      targetGeometry);
    firePositionEvent(binder, source.layerGroup, target1.layerGroup,
      makePositionEvent('source', [1, 1, 3, 1], [2]));
    assert.deepEqual(getSetPosition(target1.vc), [1, 1, 3, 3],
      'value not in target');
    // no source view layer
    const target2 = makeBinderLayerGroup('target', [0, 0, 1, 3], [2, 2, 5, 2],
      targetGeometry);
    binder.getCallback(target2.layerGroup)(
      makePositionEvent('source', [1, 1, 3, 2], [2]));
    assert.deepEqual(getSetPosition(target2.vc), [1, 1, 3, 3],
      'no source view layer');
  });

  /**
   * Tests for {@link PositionBinder}: volume only move.
   *
   * @function module:tests/gui~positionBinderVolumeOnlyMove
   */
  test('PositionBinder keeps the target slice on a volume only move',
    () => {
      const {layerGroup, vc} =
        makeBinderLayerGroup('data0', [0, 0, 1, 0], [2, 2, 5, 3]);
      new PositionBinder().getCallback(layerGroup)(
        makePositionEvent('data0', [1, 1, 3, 2], [3]));
      assert.deepEqual(getSetPosition(vc), [0, 0, 1, 2]);
    });

  /**
   * Tests for {@link PositionBinder}: single slice target.
   *
   * @function module:tests/gui~positionBinderSingleSlice
   */
  test('PositionBinder follows the in-plane position of a single slice ' +
    'target', () => {
    const {layerGroup, vc} =
      makeBinderLayerGroup('data0', [0, 0, 1, 0], [2, 2, 1, 3]);
    new PositionBinder().getCallback(layerGroup)(
      makePositionEvent('data0', [1, 1, 3, 2], [0, 1, 2, 3]));
    assert.deepEqual(getSetPosition(vc), [1, 1, 1, 2],
      'in-plane position followed, slice kept');
  });

  /**
   * Tests for {@link PositionBinder}: single slice target volume move.
   *
   * @function module:tests/gui~positionBinderSingleSliceVolumeMove
   */
  test('PositionBinder keeps the in-plane position of a single slice ' +
    'target on a volume only move', () => {
    const {layerGroup, vc} =
      makeBinderLayerGroup('data0', [0, 0, 1, 0], [2, 2, 1, 3]);
    new PositionBinder().getCallback(layerGroup)(
      makePositionEvent('data0', [1, 1, 3, 2], [3]));
    assert.deepEqual(getSetPosition(vc), [0, 0, 1, 2],
      'in-plane position and slice kept, volume followed');
  });

  /**
   * Tests for {@link PositionBinder}: unchanged position.
   *
   * @function module:tests/gui~positionBinderUnchanged
   */
  test('PositionBinder ignores an unchanged position', () => {
    const {layerGroup, vc} =
      makeBinderLayerGroup('data0', [0, 0, 1], [2, 2, 5]);
    const callback = new PositionBinder().getCallback(layerGroup);
    callback(makePositionEvent('data0', [1, 1, 3], []));
    assert.equal(vc.setCurrentPosition.mock.calls.length, 0,
      'unchanged position not synced');
    callback(makePositionEvent('data0', [1, 1, 3], [2]));
    assert.equal(vc.setCurrentPosition.mock.calls.length, 1,
      'changed position synced');
  });

  /**
   * Tests for {@link PositionBinder}: unchanged position of other data.
   *
   * @function module:tests/gui~positionBinderUnchangedOtherData
   */
  test('PositionBinder follows an unchanged index of other data', () => {
    // other data can have a finer grid
    const {layerGroup, vc} =
      makeBinderLayerGroup('target', [0, 0, 1], [2, 2, 5]);
    new PositionBinder().getCallback(layerGroup)(
      makePositionEvent('source', [1.5, 1, 3], []));
    assert.deepEqual(getSetPosition(vc), [1.5, 1, 3]);
  });

  /**
   * Tests for {@link PositionBinder}: target still loading.
   *
   * @function module:tests/gui~positionBinderLoading
   */
  test('PositionBinder ignores a target still loading', () => {
    const layerGroup = {
      getViewLayersByDataId: () => [],
      getBaseViewLayer: () => undefined
    };
    assert.doesNotThrow(() => new PositionBinder().getCallback(layerGroup)(
      makePositionEvent('data0', [1, 1, 3, 2], [2])));
  });

  /**
   * Tests for {@link PositionBinder}: shared event value.
   *
   * @function module:tests/gui~positionBinderEventValue
   */
  test('PositionBinder does not modify the event value', () => {
    const {layerGroup} =
      makeBinderLayerGroup('data0', [0, 0, 1, 0], [2, 2, 5, 3]);
    const event = makePositionEvent('data0', [1, 1, 3, 2], [3]);
    new PositionBinder().getCallback(layerGroup)(event);
    assert.deepEqual(event.detail.value[1], [1, 1, 3, 2]);
  });

  /**
   * Tests for {@link ViewController#canSyncVolume}, as used by the
   * position binder.
   *
   * @function module:tests/gui~viewControllerCanSyncVolume
   */
  test('ViewController canSyncVolume', () => {
    const createViewController = (geometry) => {
      const image = new Image(
        geometry, new Uint8Array(geometry.getSize().getTotalSize()));
      const view = new View(image);
      view.setOrientation(getIdentityMat33());
      return new ViewController(view);
    };
    const target = createViewController(
      makeVolumeGeometry('TemporalPositionIdentifier', [2, 3]));

    // same volume id origin
    const source = createViewController(
      makeVolumeGeometry('TemporalPositionIdentifier', [1, 2]));
    assert.ok(target.canSyncVolume(source, 2), 'value in target');
    assert.notOk(target.canSyncVolume(source, 1), 'value not in target');

    // different volume id origin
    const other = createViewController(
      makeVolumeGeometry('DiffusionBValue', [2, 3]));
    assert.notOk(target.canSyncVolume(other, 2), 'other origin');

    // no volume ids
    const noIds = createViewController(new Geometry(
      [new Point3D(0, 0, 0)], new Size([2, 2, 1]), new Spacing([1, 1, 1])));
    assert.notOk(target.canSyncVolume(noIds, 2), 'source without ids');
    assert.notOk(noIds.canSyncVolume(source, 2), 'target without ids');
  });

  /**
   * Tests for {@link PositionBinder} bound through a stage: the event is
   * dispatched by a real source layer group.
   *
   * @function module:tests/gui~positionBinderStage
   */
  test('PositionBinder syncs the volume id of stage layer groups', () => {
    const stage = new Stage();
    // add a layer group with a view layer, starting at the last volume
    const addLayerGroup = (id, volumeIds) => {
      const div = document.createElement('div');
      div.id = id;
      document.body.appendChild(div);
      const geometry = makeVolumeGeometry(
        'TemporalPositionIdentifier', volumeIds);
      const view = new View(new Image(
        geometry, new Uint8Array(geometry.getSize().getTotalSize()), ['0']));
      view.setOrientation(getIdentityMat33());
      const viewLayer = stage.addLayerGroup(div).addViewLayer();
      vi.spyOn(viewLayer, 'draw').mockImplementation(() => {});
      viewLayer.setView(view, `${id}-data`);
      const vc = viewLayer.getViewController();
      vc.setCurrentPosition(
        geometry.indexToWorld(new Index([0, 0, 0, 1])), true);
      return vc;
    };
    const sourceVc = addLayerGroup('lg0', [1, 2]);
    const targetVc = addLayerGroup('lg1', [2, 3]);
    stage.setBinders([new PositionBinder()]);

    // move the source to volume id 2: the target follows the id
    sourceVc.setCurrentPosition(new Point([1, 1, 0, 2]));
    assert.deepEqual(targetVc.getCurrentPosition().getValues(),
      [1, 1, 0, 2], 'target position');
    assert.deepEqual(targetVc.getCurrentIndex().getValues(),
      [1, 1, 0, 0], 'target volume index of the id');
  });

  /**
   * Tests for {@link WindowLevelBinder}: different data.
   *
   * @function module:tests/gui~windowLevelBinderOtherData
   */
  test('WindowLevelBinder ignores an event from different data', () => {
    const {layerGroup, vc} =
      makeWindowLevelBinderLayerGroup('data0', ['Abdomen']);
    new WindowLevelBinder().getCallback(layerGroup)(
      makeWindowLevelEvent('other', [50, 100, 'manual']));
    assert.equal(vc.setWindowLevel.mock.calls.length, 0);
    assert.equal(vc.setWindowLevelPreset.mock.calls.length, 0);
  });

  /**
   * Tests for {@link WindowLevelBinder}: no preset name.
   *
   * @function module:tests/gui~windowLevelBinderNoName
   */
  test('WindowLevelBinder sets the window level values when no preset ' +
    'name is given', () => {
    const {layerGroup, vc} =
      makeWindowLevelBinderLayerGroup('data0', ['Abdomen']);
    new WindowLevelBinder().getCallback(layerGroup)(
      makeWindowLevelEvent('data0', [50, 100]));
    assert.equal(vc.setWindowLevelPreset.mock.calls.length, 0);
    assert.equal(vc.setWindowLevel.mock.calls.length, 1);
    const wl = vc.setWindowLevel.mock.calls[0][0];
    assert.equal(wl.center, 50);
    assert.equal(wl.width, 100);
  });

  /**
   * Tests for {@link WindowLevelBinder}: 'manual' preset name.
   *
   * @function module:tests/gui~windowLevelBinderManual
   */
  test('WindowLevelBinder sets the window level values for a \'manual\' ' +
    'preset name', () => {
    // the target may already have its own (older) 'manual' preset
    const {layerGroup, vc} =
      makeWindowLevelBinderLayerGroup('data0', ['Abdomen', 'manual']);
    new WindowLevelBinder().getCallback(layerGroup)(
      makeWindowLevelEvent('data0', [50, 100, 'manual']));
    assert.equal(vc.setWindowLevelPreset.mock.calls.length, 0);
    assert.equal(vc.setWindowLevel.mock.calls.length, 1);
    const wl = vc.setWindowLevel.mock.calls[0][0];
    assert.equal(wl.center, 50);
    assert.equal(wl.width, 100);
  });

  /**
   * Tests for {@link WindowLevelBinder}: known preset name.
   *
   * @function module:tests/gui~windowLevelBinderKnownPreset
   */
  test('WindowLevelBinder sets the preset when the name is known', () => {
    const {layerGroup, vc} =
      makeWindowLevelBinderLayerGroup('data0', ['Abdomen']);
    new WindowLevelBinder().getCallback(layerGroup)(
      makeWindowLevelEvent('data0', [50, 100, 'Abdomen']));
    assert.equal(vc.setWindowLevel.mock.calls.length, 0);
    assert.equal(vc.setWindowLevelPreset.mock.calls.length, 1);
    assert.equal(vc.setWindowLevelPreset.mock.calls[0][0], 'Abdomen');
  });

  /**
   * Tests for {@link WindowLevelBinder}: unknown preset name.
   *
   * @function module:tests/gui~windowLevelBinderUnknownPreset
   */
  test('WindowLevelBinder sets the window level values for an unknown ' +
    'preset name', () => {
    const {layerGroup, vc} =
      makeWindowLevelBinderLayerGroup('data0', ['Abdomen']);
    new WindowLevelBinder().getCallback(layerGroup)(
      makeWindowLevelEvent('data0', [50, 100, 'Lung']));
    assert.equal(vc.setWindowLevelPreset.mock.calls.length, 0);
    assert.equal(vc.setWindowLevel.mock.calls.length, 1);
    const wl = vc.setWindowLevel.mock.calls[0][0];
    assert.equal(wl.center, 50);
    assert.equal(wl.width, 100);
  });

});
