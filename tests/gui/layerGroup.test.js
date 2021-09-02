/**
 * Tests for the 'gui/LayerGroup.js' file.
 */
/** @module tests/gui */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('gui');

/**
 * Tests for {@link dwv.gui.LayerGroup} string id.
 *
 * @function module:tests/gui~LayerGroup
 */
QUnit.test('Test LayerGroup string id.', function (assert) {
  // test #00
  var theoId00 = 'layer-0-0';
  var theoDetails00 = {groupId: 0, layerId: 0};
  var id00 = dwv.gui.getLayerGroupDivId(
    theoDetails00.groupId, theoDetails00.layerId);
  var details00 = dwv.gui.getLayerDetailsFromLayerDivId(theoId00);
  assert.equal(id00, theoId00, 'getLayerGroupDivId #00');
  assert.equal(details00.groupId, theoDetails00.groupId,
    'getLayerDetailsFromLayerDivId groupId #00');
  assert.equal(details00.layerId, theoDetails00.layerId,
    'getLayerDetailsFromLayerDivId layerId #00');

  // test #01
  var theoId01 = 'layer-1-2';
  var theoDetails01 = {groupId: 1, layerId: 2};
  var id01 = dwv.gui.getLayerGroupDivId(
    theoDetails01.groupId, theoDetails01.layerId);
  var details01 = dwv.gui.getLayerDetailsFromLayerDivId(theoId01);
  assert.equal(id01, theoId01, 'getLayerGroupDivId #01');
  assert.equal(details01.groupId, theoDetails01.groupId,
    'getLayerDetailsFromLayerDivId groupId #01');
  assert.equal(details01.layerId, theoDetails01.layerId,
    'getLayerDetailsFromLayerDivId layerId #01');
});
