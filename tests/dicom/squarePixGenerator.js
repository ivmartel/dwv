import {Index} from '../../src/math/index.js';
import {getRectangleIndices} from '../../src/math/rectangle.js';
import {getEllipseIndices} from '../../src/math/ellipse.js';

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
 * SquarePixGenerator: generates pixel data with simple mono value squares.
 */
export class SquarePixGenerator {

  #numberOfColumns;
  #numberOfRows;
  #numberOfSamples;
  #numberOfColourPlanes;

  #isRGB;

  #numberOfShapes;
  #sizeZoneI;
  #sizeZoneJ;
  #sizeZoneK;

  #configs;
  #indices;

  #background = 0;
  #maxValue = 200;

  /**
   * @param {object} options The generator options.
   */
  constructor(options) {
    this.#numberOfColumns = options.numberOfColumns;
    this.#numberOfRows = options.numberOfRows;
    this.#numberOfSamples = options.numberOfSamples;
    this.#numberOfColourPlanes = options.numberOfColourPlanes;
    this.#isRGB = options.photometricInterpretation === 'RGB';

    // supposing as many slices as coloums
    const numberOfSlices = options.numberOfSlices;

    const numberOfZonesI = 2;
    const numberOfZonesJ = 2;
    const numberOfZonesK = 2;

    this.#numberOfShapes = numberOfZonesI * numberOfZonesJ * numberOfZonesK;

    this.#sizeZoneI = Math.floor(this.#numberOfColumns / numberOfZonesI);
    this.#sizeZoneJ = Math.floor(this.#numberOfRows / numberOfZonesJ);
    this.#sizeZoneK = Math.floor(numberOfSlices / numberOfZonesK);

    const halfSizeZoneI = Math.floor(this.#sizeZoneI / 2);
    const halfSizeZoneJ = Math.floor(this.#sizeZoneJ / 2);
    const halfSizeZoneK = Math.floor(this.#sizeZoneK / 2);

    // const quarterSizeZoneI = Math.floor(sizeZoneI / 4);
    // const quarterSizeZoneJ = Math.floor(sizeZoneJ / 4);
    // const quarterSizeZoneK = Math.floor(sizeZoneK / 4);
    // const eigthSizeZoneJ = Math.floor(sizeZoneJ / 8);

    const squareSizes = [
      halfSizeZoneI, halfSizeZoneJ, halfSizeZoneK
    ];
    // square only config
    this.#configs = [
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
    // this.#configs = [
    //   {shape: 'rectangle', dir: [0, 1], size: squareSizes},
    //   {shape: 'rectangle', dir: [0, 2], size: squareSizes},
    //   {shape: 'rectangle', dir: [1, 2], size: squareSizes},
    //   {shape: 'rectangle', dir: [0, 1], size: rectSizes},
    //   {shape: 'ellipse', dir: [0, 1], size: circleSizes},
    //   {shape: 'ellipse', dir: [0, 2], size: circleSizes},
    //   {shape: 'ellipse', dir: [1, 2], size: circleSizes},
    //   {shape: 'ellipse', dir: [0, 1], size: ellipseSizes}
    // ];

    this.#indices = [];
    let shapeNumber = 0;
    for (let nk = 0; nk < numberOfZonesK; ++nk) {
      for (let nj = 0; nj < numberOfZonesJ; ++nj) {
        for (let ni = 0; ni < numberOfZonesI; ++ni) {
          const config = this.#configs[shapeNumber];
          const incr = getDirIncr(config.dir);
          const nSlices = config.size[2];
          const halfNSlices = Math.floor(nSlices / 2);
          for (let k = 0; k < nSlices; ++k) {
            const center = new Index([
              halfSizeZoneI + ni * this.#sizeZoneI +
                incr[0] * (k - halfNSlices),
              halfSizeZoneJ + nj * this.#sizeZoneJ +
                incr[1] * (k - halfNSlices),
              halfSizeZoneK + nk * this.#sizeZoneK +
                incr[2] * (k - halfNSlices)
            ]);
            let newIndices;
            if (config.shape === 'rectangle') {
              newIndices =
                getRectangleIndices(center, config.size, config.dir);
            } else if (config.shape === 'ellipse') {
              newIndices =
                getEllipseIndices(center, config.size, config.dir);
            }
            this.#indices.push(...newIndices);
          }
          ++shapeNumber;
        }
      }
    }
  }

  /**
   * @param {number[]} pixelBuffer The buffer.
   * @param {number} sliceNumber The slice number.
   */
  generate(pixelBuffer, sliceNumber) {
    const getFunc = this.#isRGB ? this.#getRGB : this.#getValue;

    // main loop
    let offset = 0;
    for (let c = 0; c < this.#numberOfColourPlanes; ++c) {
      for (let j = 0; j < this.#numberOfRows; ++j) {
        for (let i = 0; i < this.#numberOfColumns; ++i) {
          for (let s = 0; s < this.#numberOfSamples; ++s) {
            if (this.#numberOfColourPlanes !== 1) {
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
  #getShapeNumber(i, j, k) {
    return Math.floor(i / this.#sizeZoneI) +
      Math.floor(j / this.#sizeZoneJ) +
      Math.floor(k / this.#sizeZoneK);
  }

  /**
   * Get a simple value.
   *
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @param {number} k The slice index.
   * @returns {number[]} The grey value.
   */
  #getValue = (i, j, k) => {
    let value = this.#background;
    if (this.#indices.find(getEqualIndexCallback(new Index([i, j, k])))) {
      const shapeNum = this.#getShapeNumber(i, j, k);
      value += Math.round(
        this.#maxValue * (shapeNum + 1) / this.#numberOfShapes) + i;
    }
    return [value];
  };

  /**
   * Get RGB values.
   *
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @param {number} k The slice index.
   * @returns {number[]} The [R,G,B] values.
   */
  #getRGB = (i, j, k) => {
    let value = this.#getValue(i, j, k);
    if (value > 255) {
      value = 200;
    }
    return [value, 0, 0];
  };
}
