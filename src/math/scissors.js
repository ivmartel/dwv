import {BucketQueue} from './bucketQueue.js';

// Pre-created to reduce allocation in inner loops
const __twothirdpi = (2 / (3 * Math.PI));

/**
 * Compute grey scale.
 *
 * @param {Array} data The input data.
 * @param {number} width The width of the output.
 * @param {number} height The height of the output.
 * @returns {object} A greyscale object.
 */
function computeGreyscale(data, width, height) {
  // Returns 2D augmented array containing greyscale data
  // Greyscale values found by averaging colour channels
  // Input should be in a flat RGBA array, with values between 0 and 255
  const greyscale = {
    data: []
  };

  // Compute actual values
  for (let y = 0; y < height; y++) {
    greyscale.data[y] = [];

    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      greyscale.data[y][x] = (data[p] + data[p + 1] + data[p + 2]) / (3 * 255);
    }
  }

  // Augment with convenience functions
  greyscale.dx = function (x, y) {
    if (x + 1 === this.data[y].length) {
      // If we're at the end, back up one
      x--;
    }
    return this.data[y][x + 1] - this.data[y][x];
  };

  greyscale.dy = function (x, y) {
    if (y + 1 === this.data.length) {
      // If we're at the end, back up one
      y--;
    }
    return this.data[y][x] - this.data[y + 1][x];
  };

  greyscale.gradMagnitude = function (x, y) {
    const dx = this.dx(x, y);
    const dy = this.dy(x, y);
    return Math.sqrt(dx * dx + dy * dy);
  };

  greyscale.laplace = function (x, y) {
    // Laplacian of Gaussian
    let lap = -16 * this.data[y][x];
    lap += this.data[y - 2][x];
    lap += this.data[y - 1][x - 1] +
      2 * this.data[y - 1][x] +
      this.data[y - 1][x + 1];
    lap += this.data[y][x - 2] +
      2 * this.data[y][x - 1] +
      2 * this.data[y][x + 1] +
      this.data[y][x + 2];
    lap += this.data[y + 1][x - 1] +
      2 * this.data[y + 1][x] +
      this.data[y + 1][x + 1];
    lap += this.data[y + 2][x];

    return lap;
  };

  return greyscale;
}

/**
 * Compute gradient.
 *
 * @param {object} greyscale The input greyscale.
 * @returns {object} A gradient object.
 */
function computeGradient(greyscale) {
  // Returns a 2D array of gradient magnitude values for greyscale. The values
  // are scaled between 0 and 1, and then flipped, so that it works as a cost
  // function.
  const gradient = [];

  let max = 0; // Maximum gradient found, for scaling purposes

  let x = 0;
  let y = 0;

  for (y = 0; y < greyscale.data.length - 1; y++) {
    gradient[y] = [];

    for (x = 0; x < greyscale.data[y].length - 1; x++) {
      gradient[y][x] = greyscale.gradMagnitude(x, y);
      max = Math.max(gradient[y][x], max);
    }

    gradient[y][greyscale.data[y].length - 1] =
      gradient[y][greyscale.data.length - 2];
  }

  gradient[greyscale.data.length - 1] = [];
  for (let i = 0; i < gradient[0].length; i++) {
    gradient[greyscale.data.length - 1][i] =
      gradient[greyscale.data.length - 2][i];
  }

  // Flip and scale.
  for (y = 0; y < gradient.length; y++) {
    for (x = 0; x < gradient[y].length; x++) {
      // @ts-ignore
      gradient[y][x] = 1 - (gradient[y][x] / max);
    }
  }

  return gradient;
}

/**
 * @param {object} greyscale The input greyscale.
 * @returns {object} A laplace object.
 */
function computeLaplace(greyscale) {
  // Returns a 2D array of Laplacian of Gaussian values
  const laplace = [];

  // Make the edges low cost here.

  laplace[0] = [];
  laplace[1] = [];
  for (let i = 1; i < greyscale.data.length; i++) {
    // Pad top, since we can't compute Laplacian
    laplace[0][i] = 1;
    laplace[1][i] = 1;
  }

  for (let y = 2; y < greyscale.data.length - 2; y++) {
    laplace[y] = [];
    // Pad left, ditto
    laplace[y][0] = 1;
    laplace[y][1] = 1;

    for (let x = 2; x < greyscale.data[y].length - 2; x++) {
      // Threshold needed to get rid of clutter.
      laplace[y][x] = (greyscale.laplace(x, y) > 0.33) ? 0 : 1;
    }

    // Pad right, ditto
    laplace[y][greyscale.data[y].length - 2] = 1;
    laplace[y][greyscale.data[y].length - 1] = 1;
  }

  laplace[greyscale.data.length - 2] = [];
  laplace[greyscale.data.length - 1] = [];
  for (let j = 1; j < greyscale.data.length; j++) {
    // Pad bottom, ditto
    laplace[greyscale.data.length - 2][j] = 1;
    laplace[greyscale.data.length - 1][j] = 1;
  }

  return laplace;
}

/**
 * Compute the X gradient.
 *
 * @param {object} greyscale The values.
 * @returns {Array} The gradient.
 */
function computeGradX(greyscale) {
  // Returns 2D array of x-gradient values for greyscale
  const gradX = [];

  for (let y = 0; y < greyscale.data.length; y++) {
    gradX[y] = [];

    for (let x = 0; x < greyscale.data[y].length - 1; x++) {
      gradX[y][x] = greyscale.dx(x, y);
    }

    gradX[y][greyscale.data[y].length - 1] =
      gradX[y][greyscale.data[y].length - 2];
  }

  return gradX;
}

/**
 * Compute the Y gradient.
 *
 * @param {object} greyscale The values.
 * @returns {Array} The gradient.
 */
function computeGradY(greyscale) {
  // Returns 2D array of y-gradient values for greyscale
  const gradY = [];

  for (let y = 0; y < greyscale.data.length - 1; y++) {
    gradY[y] = [];

    for (let x = 0; x < greyscale.data[y].length; x++) {
      gradY[y][x] = greyscale.dy(x, y);
    }
  }

  gradY[greyscale.data.length - 1] = [];
  for (let i = 0; i < greyscale.data[0].length; i++) {
    gradY[greyscale.data.length - 1][i] = gradY[greyscale.data.length - 2][i];
  }

  return gradY;
}

/**
 * Compute the gradient unit vector.
 *
 * @param {Array} gradX The X gradient.
 * @param {Array} gradY The Y gradient.
 * @param {number} px The point X.
 * @param {number} py The point Y.
 * @param {object} out The result.
 */
function gradUnitVector(gradX, gradY, px, py, out) {
  // Returns the gradient vector at (px,py), scaled to a magnitude of 1
  const ox = gradX[py][px];
  const oy = gradY[py][px];

  let gvm = Math.sqrt(ox * ox + oy * oy);
  gvm = Math.max(gvm, 1e-100); // To avoid possible divide-by-0 errors

  out.x = ox / gvm;
  out.y = oy / gvm;
}

/**
 * Compute the gradient direction.
 *
 * @param {Array} gradX The X gradient.
 * @param {Array} gradY The Y gradient.
 * @param {number} px The point X.
 * @param {number} py The point Y.
 * @param {number} qx The q X.
 * @param {number} qy The q Y.
 * @returns {number} The direction.
 */
function gradDirection(gradX, gradY, px, py, qx, qy) {
  const __dgpuv = {x: -1, y: -1};
  const __gdquv = {x: -1, y: -1};
  // Compute the gradiant direction, in radians, between to points
  gradUnitVector(gradX, gradY, px, py, __dgpuv);
  gradUnitVector(gradX, gradY, qx, qy, __gdquv);

  let dp = __dgpuv.y * (qx - px) - __dgpuv.x * (qy - py);
  let dq = __gdquv.y * (qx - px) - __gdquv.x * (qy - py);

  // Make sure dp is positive, to keep things consistant
  if (dp < 0) {
    dp = -dp;
    dq = -dq;
  }

  if (px !== qx && py !== qy) {
    // We're going diagonally between pixels
    dp *= Math.SQRT1_2;
    dq *= Math.SQRT1_2;
  }

  return __twothirdpi * (Math.acos(dp) + Math.acos(dq));
}

/**
 * Compute the sides.
 *
 * @param {number} dist The distance.
 * @param {Array} gradX The X gradient.
 * @param {Array} gradY The Y gradient.
 * @param {object} greyscale The value.
 * @returns {object} The sides.
 */
function computeSides(dist, gradX, gradY, greyscale) {
  // Returns 2 2D arrays, containing inside and outside greyscale values.
  // These greyscale values are the intensity just a little bit along the
  // gradient vector, in either direction, from the supplied point. These
  // values are used when using active-learning Intelligent Scissors

  const sides = {};
  sides.inside = [];
  sides.outside = [];

  const guv = {x: -1, y: -1}; // Current gradient unit vector

  for (let y = 0; y < gradX.length; y++) {
    sides.inside[y] = [];
    sides.outside[y] = [];

    for (let x = 0; x < gradX[y].length; x++) {
      gradUnitVector(gradX, gradY, x, y, guv);

      //(x, y) rotated 90 = (y, -x)

      let ix = Math.round(x + dist * guv.y);
      let iy = Math.round(y - dist * guv.x);
      let ox = Math.round(x - dist * guv.y);
      let oy = Math.round(y + dist * guv.x);

      ix = Math.max(Math.min(ix, gradX[y].length - 1), 0);
      ox = Math.max(Math.min(ox, gradX[y].length - 1), 0);
      iy = Math.max(Math.min(iy, gradX.length - 1), 0);
      oy = Math.max(Math.min(oy, gradX.length - 1), 0);

      sides.inside[y][x] = greyscale.data[iy][ix];
      sides.outside[y][x] = greyscale.data[oy][ox];
    }
  }

  return sides;
}

/**
 * Gaussian blur an input buffer.
 *
 * @param {Array} buffer The input buffer.
 * @param {Array} out The result.
 */
function gaussianBlur(buffer, out) {
  // Smooth values over to fill in gaps in the mapping
  out[0] = 0.4 * buffer[0] + 0.5 * buffer[1] + 0.1 * buffer[1];
  out[1] = 0.25 * buffer[0] + 0.4 * buffer[1] + 0.25 * buffer[2] +
    0.1 * buffer[3];

  for (let i = 2; i < buffer.length - 2; i++) {
    out[i] = 0.05 * buffer[i - 2] + 0.25 * buffer[i - 1] +
      0.4 * buffer[i] + 0.25 * buffer[i + 1] + 0.05 * buffer[i + 2];
  }

  const len = buffer.length;
  out[len - 2] = 0.25 * buffer[len - 1] + 0.4 * buffer[len - 2] +
    0.25 * buffer[len - 3] + 0.1 * buffer[len - 4];
  out[len - 1] = 0.4 * buffer[len - 1] + 0.5 * buffer[len - 2] +
    0.1 * buffer[len - 3];
}

/**
 * Scissors.
 *
 * Ref: Eric N. Mortensen, William A. Barrett, Interactive Segmentation with
 *   Intelligent Scissors, Graphical Models and Image Processing, Volume 60,
 *   Issue 5, September 1998, Pages 349-384, ISSN 1077-3169,
 *   DOI: 10.1006/gmip.1998.0480.
 *
 * See: {@link http://www.sciencedirect.com/science/article/B6WG4-45JB8WN-9/2/6fe59d8089fd1892c2bfb82283065579}.
 *
 * Highly inspired from: {@link http://code.google.com/p/livewire-javascript/}.
 */
export class Scissors {

  constructor() {
    this.width = -1;
    this.height = -1;

    this.curPoint = null; // Corrent point we're searching on.
    this.searchGranBits = 8; // Bits of resolution for BucketQueue.
    this.searchGran = 1 << this.searchGranBits; //bits.
    this.pointsPerPost = 500;

    // Precomputed image data. All in ranges 0 >= x >= 1 and
    //   all inverted (1 - x).
    this.greyscale = null; // Greyscale of image
    this.laplace = null; // Laplace zero-crossings (either 0 or 1).
    this.gradient = null; // Gradient magnitudes.
    this.gradX = null; // X-differences.
    this.gradY = null; // Y-differences.

    // Matrix mapping point => parent along shortest-path to root.
    this.parents = null;

    this.working = false; // Currently computing shortest paths?

    // Begin Training:
    this.trained = false;
    this.trainingPoints = null;

    this.edgeWidth = 2;
    this.trainingLength = 32;

    this.edgeGran = 256;
    this.edgeTraining = null;

    this.gradPointsNeeded = 32;
    this.gradGran = 1024;
    this.gradTraining = null;

    this.insideGran = 256;
    this.insideTraining = null;

    this.outsideGran = 256;
    this.outsideTraining = null;
  }
  // End Training


  // Begin training methods //
  getTrainingIdx(granularity, value) {
    return Math.round((granularity - 1) * value);
  }

  getTrainedEdge(edge) {
    return this.edgeTraining[this.getTrainingIdx(this.edgeGran, edge)];
  }

  getTrainedGrad(grad) {
    return this.gradTraining[this.getTrainingIdx(this.gradGran, grad)];
  }

  getTrainedInside(inside) {
    return this.insideTraining[this.getTrainingIdx(this.insideGran, inside)];
  }

  getTrainedOutside(outside) {
    return this.outsideTraining[this.getTrainingIdx(this.outsideGran, outside)];
  }
  // End training methods //

  setWorking(working) {
    // Sets working flag
    this.working = working;
  }

  setDimensions(width, height) {
    this.width = width;
    this.height = height;
  }

  setData(data) {
    if (this.width === -1 || this.height === -1) {
      // The width and height should have already been set
      throw new Error('Dimensions have not been set.');
    }

    this.greyscale = computeGreyscale(data, this.width, this.height);
    this.laplace = computeLaplace(this.greyscale);
    this.gradient = computeGradient(this.greyscale);
    this.gradX = computeGradX(this.greyscale);
    this.gradY = computeGradY(this.greyscale);

    const sides = computeSides(
      this.edgeWidth, this.gradX, this.gradY, this.greyscale);
    this.inside = sides.inside;
    this.outside = sides.outside;
    this.edgeTraining = [];
    this.gradTraining = [];
    this.insideTraining = [];
    this.outsideTraining = [];
  }

  findTrainingPoints(p) {
    // Grab the last handful of points for training
    const points = [];

    if (this.parents !== null) {
      for (let i = 0; i < this.trainingLength && p; i++) {
        points.push(p);
        p = this.parents[p.y][p.x];
      }
    }

    return points;
  }

  resetTraining() {
    this.trained = false; // Training is ignored with this flag set
  }

  doTraining(p) {
    // Compute training weights and measures
    this.trainingPoints = this.findTrainingPoints(p);

    if (this.trainingPoints.length < 8) {
      return; // Not enough points, I think. It might crash if length = 0.
    }

    const buffer = [];
    this.calculateTraining(
      buffer, this.edgeGran, this.greyscale, this.edgeTraining);
    this.calculateTraining(
      buffer, this.gradGran, this.gradient, this.gradTraining);
    this.calculateTraining(
      buffer, this.insideGran, this.inside, this.insideTraining);
    this.calculateTraining(
      buffer, this.outsideGran, this.outside, this.outsideTraining);

    if (this.trainingPoints.length < this.gradPointsNeeded) {
      // If we have two few training points, the gradient weight map might not
      // be smooth enough, so average with normal weights.
      this.addInStaticGrad(this.trainingPoints.length, this.gradPointsNeeded);
    }

    this.trained = true;
  }

  calculateTraining(
    buffer, granularity, input, output) {
    let i = 0;
    // Build a map of raw-weights to trained-weights by favoring input values
    buffer.length = granularity;
    for (i = 0; i < granularity; i++) {
      buffer[i] = 0;
    }

    let maxVal = 1;
    for (i = 0; i < this.trainingPoints.length; i++) {
      const p = this.trainingPoints[i];
      const idx = this.getTrainingIdx(granularity, input[p.y][p.x]);
      buffer[idx] += 1;

      maxVal = Math.max(maxVal, buffer[idx]);
    }

    // Invert and scale.
    for (i = 0; i < granularity; i++) {
      buffer[i] = 1 - buffer[i] / maxVal;
    }

    // Blur it, as suggested. Gets rid of static.
    gaussianBlur(buffer, output);
  }

  addInStaticGrad(have, need) {
    // Average gradient raw-weights to trained-weights map with standard weight
    // map so that we don't end up with something to spiky
    for (let i = 0; i < this.gradGran; i++) {
      this.gradTraining[i] = Math.min(
        this.gradTraining[i],
        1 - i * (need - have) / (need * this.gradGran)
      );
    }
  }

  gradDirection(px, py, qx, qy) {
    return gradDirection(this.gradX, this.gradY, px, py, qx, qy);
  }

  dist(px, py, qx, qy) {
    // The grand culmunation of most of the code: the weighted distance function
    let grad = this.gradient[qy][qx];

    if (px === qx || py === qy) {
      // The distance is Euclidean-ish; non-diagonal edges should be shorter
      grad *= Math.SQRT1_2;
    }

    const lap = this.laplace[qy][qx];
    const dir = this.gradDirection(px, py, qx, qy);

    if (this.trained) {
      // Apply training magic
      const gradT = this.getTrainedGrad(grad);
      const edgeT = this.getTrainedEdge(this.greyscale.data[py][px]);
      const insideT = this.getTrainedInside(this.inside[py][px]);
      const outsideT = this.getTrainedOutside(this.outside[py][px]);

      return 0.3 * gradT + 0.3 * lap + 0.1 * (dir + edgeT + insideT + outsideT);
    } else {
      // Normal weights
      return 0.43 * grad + 0.43 * lap + 0.11 * dir;
    }
  }

  adj(p) {
    const list = [];

    const sx = Math.max(p.x - 1, 0);
    const sy = Math.max(p.y - 1, 0);
    const ex = Math.min(p.x + 1, this.greyscale.data[0].length - 1);
    const ey = Math.min(p.y + 1, this.greyscale.data.length - 1);

    let idx = 0;
    for (let y = sy; y <= ey; y++) {
      for (let x = sx; x <= ex; x++) {
        if (x !== p.x || y !== p.y) {
          list[idx++] = {x: x, y: y};
        }
      }
    }

    return list;
  }

  #costFunction = (p) => {
    return Math.round(this.searchGran * this.cost[p.y][p.x]);
  };

  setPoint(sp) {
    this.setWorking(true);

    this.curPoint = sp;

    let x = 0;
    let y = 0;

    this.visited = [];
    for (y = 0; y < this.height; y++) {
      this.visited[y] = [];
      for (x = 0; x < this.width; x++) {
        this.visited[y][x] = false;
      }
    }

    this.parents = [];
    for (y = 0; y < this.height; y++) {
      this.parents[y] = [];
    }

    this.cost = [];
    for (y = 0; y < this.height; y++) {
      this.cost[y] = [];
      for (x = 0; x < this.width; x++) {
        this.cost[y][x] = Number.MAX_VALUE;
      }
    }
    this.cost[sp.y][sp.x] = 0;

    this.pq = new BucketQueue(this.searchGranBits, this.#costFunction);
    this.pq.push(sp);
  }

  doWork() {
    if (!this.working) {
      return;
    }

    this.timeout = null;

    let pointCount = 0;
    const newPoints = [];
    while (!this.pq.isEmpty() && pointCount < this.pointsPerPost) {
      const p = this.pq.pop();
      newPoints.push(p);
      newPoints.push(this.parents[p.y][p.x]);

      this.visited[p.y][p.x] = true;

      const adjList = this.adj(p);
      for (let i = 0; i < adjList.length; i++) {
        const q = adjList[i];

        const pqCost = this.cost[p.y][p.x] + this.dist(p.x, p.y, q.x, q.y);

        if (pqCost < this.cost[q.y][q.x]) {
          if (this.cost[q.y][q.x] !== Number.MAX_VALUE) {
            // Already in PQ, must remove it so we can re-add it.
            this.pq.remove(q);
          }

          this.cost[q.y][q.x] = pqCost;
          this.parents[q.y][q.x] = p;
          this.pq.push(q);
        }
      }

      pointCount++;
    }

    return newPoints;
  }

} // Scissors class
