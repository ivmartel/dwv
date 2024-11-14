// namespace
// eslint-disable-next-line no-var
var test = test || {};

// Do not warn if these variables were not defined before.
/* global dwv */

/**
 * Get an array find callback for an index.
 *
 * @param {Index} i0 The index to find.
 * @returns {Function} The find callback.
 */
function getEqualIndexCallback(i0) {
  return function (index) {
    return index.equals(i0);
  };
}

/**
 * Get an increment vector for input directions.
 *
 * @param {number[]} dir The directions.
 * @returns {number[]} The increment vector.
 */
function getDirIncr(dir) {
  let incr;
  if (!dir.includes(0)) {
    incr = [1, 0, 0];
  } else if (!dir.includes(1)) {
    incr = [0, 1, 0];
  } else if (!dir.includes(2)) {
    incr = [0, 0, 1];
  }
  return incr;
}

/**
 * SquarePixGenerator
 * Generates pixel data with simple mono value squares.
 *
 * @param {object} options The generator options.
 * @class
 */
const SquarePixGenerator = function (options) {

  const numberOfColumns = options.numberOfColumns;
  const numberOfRows = options.numberOfRows;
  const numberOfSamples = options.numberOfSamples;
  const numberOfColourPlanes = options.numberOfColourPlanes;
  const isRGB = options.photometricInterpretation === 'RGB';
  const getFunc = isRGB ? getRGB : getValue;

  // supposing as many slices as coloums
  const numberOfSlices = options.numberOfSlices;

  const numberOfZonesI = 2;
  const numberOfZonesJ = 2;
  const numberOfZonesK = 2;

  const numberOfShapes = numberOfZonesI * numberOfZonesJ * numberOfZonesK;

  const sizeZoneI = Math.floor(numberOfColumns / numberOfZonesI);
  const sizeZoneJ = Math.floor(numberOfRows / numberOfZonesJ);
  const sizeZoneK = Math.floor(numberOfSlices / numberOfZonesK);

  const halfSizeZoneI = Math.floor(sizeZoneI / 2);
  const halfSizeZoneJ = Math.floor(sizeZoneJ / 2);
  const halfSizeZoneK = Math.floor(sizeZoneK / 2);

  // const quarterSizeZoneI = Math.floor(sizeZoneI / 4);
  // const quarterSizeZoneJ = Math.floor(sizeZoneJ / 4);
  // const quarterSizeZoneK = Math.floor(sizeZoneK / 4);
  // const eigthSizeZoneJ = Math.floor(sizeZoneJ / 8);

  const squareSizes = [
    halfSizeZoneI, halfSizeZoneJ, halfSizeZoneK
  ];
  // square only config
  const configs = [
    {shape: 'rectangle', dir: [0, 1], size: squareSizes},
    {shape: 'rectangle', dir: [0, 1], size: squareSizes},
    {shape: 'rectangle', dir: [0, 1], size: squareSizes},
    {shape: 'rectangle', dir: [0, 1], size: squareSizes},
    {shape: 'rectangle', dir: [0, 1], size: squareSizes},
    {shape: 'rectangle', dir: [0, 1], size: squareSizes},
    {shape: 'rectangle', dir: [0, 1], size: squareSizes},
    {shape: 'rectangle', dir: [0, 1], size: squareSizes}
  ];

  // const rectSizes = [
  //   halfSizeZoneI, halfSizeZoneJ + quarterSizeZoneJ, halfSizeZoneK
  // ];
  // const circleSizes = [
  //   quarterSizeZoneI, quarterSizeZoneJ, quarterSizeZoneK
  // ];
  // const ellipseSizes = [
  //   quarterSizeZoneI, quarterSizeZoneJ + eigthSizeZoneJ, quarterSizeZoneK
  // ];

  // mix of rectangles and ellipses in different directions
  // const configs = [
  //   {shape: 'rectangle', dir: [0, 1], size: squareSizes},
  //   {shape: 'rectangle', dir: [0, 2], size: squareSizes},
  //   {shape: 'rectangle', dir: [1, 2], size: squareSizes},
  //   {shape: 'rectangle', dir: [0, 1], size: rectSizes},
  //   {shape: 'ellipse', dir: [0, 1], size: circleSizes},
  //   {shape: 'ellipse', dir: [0, 2], size: circleSizes},
  //   {shape: 'ellipse', dir: [1, 2], size: circleSizes},
  //   {shape: 'ellipse', dir: [0, 1], size: ellipseSizes}
  // ];

  const indices = [];
  let shapeNumber = 0;
  for (let nk = 0; nk < numberOfZonesK; ++nk) {
    for (let nj = 0; nj < numberOfZonesJ; ++nj) {
      for (let ni = 0; ni < numberOfZonesI; ++ni) {
        const config = configs[shapeNumber];
        const incr = getDirIncr(config.dir);
        const nSlices = config.size[2];
        const halfNSlices = Math.floor(nSlices / 2);
        for (let k = 0; k < nSlices; ++k) {
          const center = new dwv.Index([
            halfSizeZoneI + ni * sizeZoneI + incr[0] * (k - halfNSlices),
            halfSizeZoneJ + nj * sizeZoneJ + incr[1] * (k - halfNSlices),
            halfSizeZoneK + nk * sizeZoneK + incr[2] * (k - halfNSlices)
          ]);
          let newIndices;
          if (config.shape === 'rectangle') {
            newIndices =
              dwv.getRectangleIndices(center, config.size, config.dir);
          } else if (config.shape === 'ellipse') {
            newIndices =
              dwv.getEllipseIndices(center, config.size, config.dir);
          }
          indices.push(...newIndices);
        }
        ++shapeNumber;
      }
    }
  }

  const background = 0;
  const max = 200;

  this.generate = function (pixelBuffer, sliceNumber) {
    // main loop
    let offset = 0;
    for (let c = 0; c < numberOfColourPlanes; ++c) {
      for (let j = 0; j < numberOfRows; ++j) {
        for (let i = 0; i < numberOfColumns; ++i) {
          for (let s = 0; s < numberOfSamples; ++s) {
            if (numberOfColourPlanes !== 1) {
              pixelBuffer[offset] = getFunc(i, j, sliceNumber)[c];
            } else {
              pixelBuffer[offset] = getFunc(i, j, sliceNumber)[s];
            }
            ++offset;
          }
        }
      }
    }
  };

  /**
   * Get the shape number at a given position.
   *
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @param {number} k The slice index.
   * @returns {number} A shape number.
   */
  function getShapeNumber(i, j, k) {
    return Math.floor(i / sizeZoneI) +
      Math.floor(j / sizeZoneJ) +
      Math.floor(k / sizeZoneK);
  }

  /**
   * Get a simple value.
   *
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @param {number} k The slice index.
   * @returns {number[]} The grey value.
   */
  function getValue(i, j, k) {
    let value = background;
    if (indices.find(getEqualIndexCallback(new dwv.Index([i, j, k])))) {
      const shapeNum = getShapeNumber(i, j, k);
      value += Math.round(max * (shapeNum + 1) / numberOfShapes) + i;
    }
    return [value];
  }

  /**
   * Get RGB values.
   *
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @param {number} k The slice index.
   * @returns {number[]} The [R,G,B] values.
   */
  function getRGB(i, j, k) {
    let value = getValue(i, j, k);
    if (value > 255) {
      value = 200;
    }
    return [value, 0, 0];
  }
};

test.pixelGenerators = test.pixelGenerators || {};
test.pixelGenerators.square = {
  generator: SquarePixGenerator
};
