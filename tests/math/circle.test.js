/**
 * Tests for the 'math/shapes.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */

/**
 * Tests for {@link dwv.math.Circle}.
 *
 * @function module:tests/math~Circle
 */
QUnit.test('Test Circle.', function (assert) {
  var center0 = new dwv.math.Point2D(0, 0);
  var c0 = new dwv.math.Circle(center0, 2);
  // getCenter
  assert.equal(c0.getCenter(), center0, 'getCenter');
  // getRadius
  assert.equal(c0.getRadius(), 2, 'getRadius');

  // equals: true
  var c1 = new dwv.math.Circle(center0, 2);
  assert.ok(c0.equals(c1), 'equal circles');
  // equals: false radius
  var c20 = new dwv.math.Circle(center0, 3);
  assert.notOk(c0.equals(c20), 'non equal circles radius');
  // equals: false center
  var center21 = new dwv.math.Point2D(1, 1);
  var c21 = new dwv.math.Circle(center21, 2);
  assert.notOk(c0.equals(c21), 'non equal circles center');

  // getSurface
  assert.equal(c0.getSurface(), Math.PI * 2 * 2, 'getSurface');
  // getWorldSurface
  assert.equal(c0.getWorldSurface(0.5, 0.5), Math.PI, 'getWorldSurface');
});

/**
 * Tests for {@link dwv.math.Circle} quantification.
 *
 * @function module:tests/math~Circle
 */
QUnit.test('Test Circle quantify.', function (assert) {
  var center0 = new dwv.math.Point2D(2, 2);
  var c0 = new dwv.math.Circle(center0, 2);
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
    getImageVariableRegionValues: function () {
      return [0, 1, 1, 0, 0, 1, 1, 0];
    }
  };
  var theoQuant0 = {
    min: {value: 0, unit: ''},
    max: {value: 1, unit: ''},
    mean: {value: 0.5, unit: ''},
    stdDev: {value: 0.5, unit: ''},
    surface: {value: 0.12566370614359174, unit: undefined}
  };
  var resQuant0 = c0.quantify(mockVc0);
  assert.equal(resQuant0.min.value, theoQuant0.min.value, 'quant min');
  assert.equal(resQuant0.max.value, theoQuant0.max.value, 'quant max');
  assert.equal(resQuant0.mean.value, theoQuant0.mean.value, 'quant mean');
  assert.equal(resQuant0.stdDev.value, theoQuant0.stdDev.value, 'quant stdDev');
  assert.equal(
    resQuant0.surface.value, theoQuant0.surface.value, 'quant surface');
});
