import {
  getLayerDivId,
  getLayerDetailsFromLayerDivId
} from '../../src/gui/layerGroup';

/**
 * Tests for the 'gui/LayerGroup.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */

/**
 * Tests for {@link LayerGroup} string id.
 *
 * @function module:tests/gui~LayerGroup
 */
QUnit.test('Test LayerGroup string id.', function (assert) {
  // test #00
  var theoId00 = 'layerGroupA-layer-0';
  var theoDetails00 = {groupDivId: 'layerGroupA', layerId: 0};
  var id00 = getLayerDivId(
    theoDetails00.groupDivId, theoDetails00.layerId);
  var details00 = getLayerDetailsFromLayerDivId(theoId00);
  assert.equal(id00, theoId00, 'getLayerDivId #00');
  assert.equal(details00.groupDivId, theoDetails00.groupDivId,
    'getLayerDetailsFromLayerDivId groupId #00');
  assert.equal(details00.layerId, theoDetails00.layerId,
    'getLayerDetailsFromLayerDivId layerId #00');

  // test #01
  var theoId01 = 'layerGroupB-layer-1';
  var theoDetails01 = {groupDivId: 'layerGroupB', layerId: 1};
  var id01 = getLayerDivId(
    theoDetails01.groupDivId, theoDetails01.layerId);
  var details01 = getLayerDetailsFromLayerDivId(theoId01);
  assert.equal(id01, theoId01, 'getLayerDivId #01');
  assert.equal(details01.groupDivId, theoDetails01.groupDivId,
    'getLayerDetailsFromLayerDivId groupId #01');
  assert.equal(details01.layerId, theoDetails01.layerId,
    'getLayerDetailsFromLayerDivId layerId #01');
});
