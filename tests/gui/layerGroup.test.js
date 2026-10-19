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
import {PositionBinder} from '../../src/gui/binders.js';
import {Point} from '../../src/math/point.js';
import {Size} from '../../src/image/size.js';
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
 * @returns {{layerGroup: object, vc: object}} The layer group and its
 *   view controller.
 */
function makeBinderLayerGroup(dataId, position, size) {
  // identity orientation and origin: plane x, y are the world x, y
  const vc = {
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
  const layerGroup = {
    getViewLayersByDataId: (id) => id === dataId ? [vl] : [],
    getBaseViewLayer: () => vl
  };
  return {layerGroup, vc};
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
   * Tests for {@link PositionBinder}: time series with the same tag.
   *
   * @function module:tests/gui~positionBinderTimeSeries
   */
  test('PositionBinder matches the timepoint tag value of time series',
    () => {
      const tables = {
        source: [
          {timepointIndex: 0, tagValue: 10},
          {timepointIndex: 1, tagValue: 20}
        ],
        target: [
          {timepointIndex: 0, tagValue: 20},
          {timepointIndex: 1, tagValue: 30}
        ]
      };
      const binder = new PositionBinder(
        (dataId) => tables[dataId],
        () => 'TemporalPositionIdentifier');
      const {layerGroup, vc} =
        makeBinderLayerGroup('target', [0, 0, 1, 1], [2, 2, 5, 2]);
      binder.getCallback(layerGroup)(
        makePositionEvent('source', [1, 1, 3, 1], [2]));
      assert.deepEqual(getSetPosition(vc), [1, 1, 3, 0],
        'timepoint with the same tag value');
    });

  /**
   * Tests for {@link PositionBinder}: no matching timepoint.
   *
   * @function module:tests/gui~positionBinderNoMatch
   */
  test('PositionBinder keeps the timepoint without a matching tag', () => {
    const table = [{timepointIndex: 0, tagValue: 10}];
    // different timepoint tags
    const binder0 = new PositionBinder(
      () => table,
      (dataId) => dataId === 'source' ? 'TemporalPositionIdentifier'
        : 'TemporalPositionIndex');
    const target0 = makeBinderLayerGroup('target', [0, 0, 1, 1], [2, 2, 5, 2]);
    binder0.getCallback(target0.layerGroup)(
      makePositionEvent('source', [1, 1, 3, 0], [2]));
    assert.deepEqual(getSetPosition(target0.vc), [1, 1, 3, 1],
      'different tags');
    // no timepoint lookups (not time series)
    const target1 = makeBinderLayerGroup('target', [0, 0, 1, 1], [2, 2, 5, 2]);
    new PositionBinder().getCallback(target1.layerGroup)(
      makePositionEvent('source', [1, 1, 3, 0], [2]));
    assert.deepEqual(getSetPosition(target1.vc), [1, 1, 3, 1],
      'no lookups');
  });

  /**
   * Tests for {@link PositionBinder}: timepoint only move.
   *
   * @function module:tests/gui~positionBinderVolumeOnlyMove
   */
  test('PositionBinder keeps the target slice on a timepoint only move',
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

});
