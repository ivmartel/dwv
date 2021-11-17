/**
 * Tests for the 'image/spacing.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */

/**
 * Tests for {@link dwv.image.Spacing}.
 *
 * @function module:tests/image~spacing
 */
QUnit.test('Test Spacing.', function (assert) {
  var spacing0 = new dwv.image.Spacing(2, 3, 4);
  // test its values
  assert.equal(spacing0.getColumnSpacing(), 2, 'getColumnSpacing');
  assert.equal(spacing0.getRowSpacing(), 3, 'getRowSpacing');
  assert.equal(spacing0.getSliceSpacing(), 4, 'getSliceSpacing');
  // equality
  assert.equal(spacing0.equals(spacing0), 1, 'equals self true');
  var spacing1 = new dwv.image.Spacing(2, 3, 4);
  assert.equal(spacing0.equals(spacing1), 1, 'equals true');
  var spacing2 = new dwv.image.Spacing(3, 3, 4);
  assert.equal(spacing0.equals(spacing2), 0, 'equals false');
});
