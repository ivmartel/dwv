import {
  LayerGroup,
  getLayerDivId,
  getLayerDetailsFromLayerDivId
} from '../../src/gui/layerGroup';

/**
 * Tests for the 'gui/LayerGroup.js' file.
 */

/* global QUnit */
QUnit.module('gui');

/**
 * Tests for {@link LayerGroup} string id.
 *
 * @function module:tests/gui~layergroup-string-id
 */
QUnit.test('LayerGroup string id', function (assert) {
  // test #00
  const theoId00 = 'layerGroupA-layer-0';
  const theoDetails00 = {groupDivId: 'layerGroupA', layerId: 0};
  const id00 = getLayerDivId(
    theoDetails00.groupDivId, theoDetails00.layerId);
  const details00 = getLayerDetailsFromLayerDivId(theoId00);
  assert.equal(id00, theoId00, 'getLayerDivId #00');
  assert.equal(details00.groupDivId, theoDetails00.groupDivId,
    'getLayerDetailsFromLayerDivId groupId #00');
  assert.equal(details00.layerId, theoDetails00.layerId,
    'getLayerDetailsFromLayerDivId layerId #00');

  // test #01
  const theoId01 = 'layerGroupB-layer-1';
  const theoDetails01 = {groupDivId: 'layerGroupB', layerId: 1};
  const id01 = getLayerDivId(
    theoDetails01.groupDivId, theoDetails01.layerId);
  const details01 = getLayerDetailsFromLayerDivId(theoId01);
  assert.equal(id01, theoId01, 'getLayerDivId #01');
  assert.equal(details01.groupDivId, theoDetails01.groupDivId,
    'getLayerDetailsFromLayerDivId groupId #01');
  assert.equal(details01.layerId, theoDetails01.layerId,
    'getLayerDetailsFromLayerDivId layerId #01');
});

/**
 * Tests for {@link LayerGroup} creation.
 *
 * @function module:tests/gui~layergroup-creation
 */
QUnit.test('LayerGroup creation', function (assert) {
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
 * @function module:tests/gui~layergroup-add-remove-view-layer
 */
QUnit.test('LayerGroup add remove view layer', function (assert) {
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
 * @function module:tests/gui~layergroup-add-remove-draw-layer
 */
QUnit.test('LayerGroup add remove draw layer', function (assert) {
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
