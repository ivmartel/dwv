/**
 * Tests for the 'math/shapes.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */

/**
 * Tests for {@link dwv.math.Rectangle}.
 *
 * @function module:tests/math~Rectangle
 */
QUnit.test('Test Rectangle.', function (assert) {
  var p00 = new dwv.math.Point2D(0, 0);
  var p01 = new dwv.math.Point2D(-4, -4);
  var r00 = new dwv.math.Rectangle(p00, p01);
  // getBegin
  assert.equal(r00.getBegin().equals(p01), true, 'getBegin');
  // getEnd
  assert.equal(r00.getEnd().equals(p00), true, 'getEnd');

  // equals: true
  var r01 = new dwv.math.Rectangle(p00, p01);
  assert.ok(r00.equals(r01), 'equal rectangles');
  // equals: false end
  var p02 = new dwv.math.Point2D(0, -4);
  var r02 = new dwv.math.Rectangle(p00, p02);
  assert.notOk(r00.equals(r02), 'non equal rectangles end');
  // equals: false begin
  var r03 = new dwv.math.Rectangle(p02, p01);
  assert.notOk(r00.equals(r03), 'non equal rectangles begin');

  // getRealWidth
  assert.equal(r00.getRealWidth(), 4, 'getRealWidth');
  // getRealHeight
  assert.equal(r00.getRealHeight(), 4, 'getRealHeight');
  // getWidth
  assert.equal(r00.getWidth(), 4, 'getWidth');
  // getHeight
  assert.equal(r00.getHeight(), 4, 'getHeight');
  // getSurface
  assert.equal(r00.getSurface(), 16, 'getSurface');
  // getWorldSurface
  assert.equal(r00.getWorldSurface(0.5, 0.5), 4, 'getWorldSurface');
});

/**
 * Tests for {@link dwv.math.Rectangle} quantification.
 *
 * @function module:tests/math~Rectangle
 */
QUnit.test('Test Rectangle quantify.', function (assert) {
  var p00 = new dwv.math.Point2D(0, 0);
  var p01 = new dwv.math.Point2D(4, 4);
  var r00 = new dwv.math.Rectangle(p00, p01);
  // view controller
  var mockVc0 = {
    canQuantifyImage: function () {
      return true;
    },
    get2DSpacing: function () {
      return [1, 1];
    },
    getCurrentPosition: function () {
      return new dwv.math.Index([0, 0, 0]);
    },
    getImageRegionValues: function () {
      return [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0];
    }
  };
  var theoQuant0 = {
    min: {value: 0, unit: ''},
    max: {value: 1, unit: ''},
    mean: {value: 0.25, unit: ''},
    stdDev: {value: 0.4330127018922193, unit: ''},
    surface: {value: 0.16, unit: undefined}
  };
  var resQuant0 = r00.quantify(mockVc0);
  assert.equal(resQuant0.min.value, theoQuant0.min.value, 'quant min');
  assert.equal(resQuant0.max.value, theoQuant0.max.value, 'quant max');
  assert.equal(resQuant0.mean.value, theoQuant0.mean.value, 'quant mean');
  assert.equal(resQuant0.stdDev.value, theoQuant0.stdDev.value, 'quant stdDev');
  assert.equal(
    resQuant0.surface.value, theoQuant0.surface.value, 'quant surface');
});
