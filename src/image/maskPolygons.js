import {logger} from '../utils/logger.js';

// Conversions between mask buffers and polygons: tracing of mask
//   regions and holes into polygons, rasterization of polygons
//   into a mask buffer.

/**
 * Pixel edge directions, clockwise on screen (y pointing down):
 *   east, south, west, north.
 */
const EDGE_DIRS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1]
];

/**
 * BFS (Breadth-First Search) flood-fill: mark all 8-connected
 * (or 4-connected) pixels with `value` as visited.
 *
 * @param {Uint8Array} buffer The mask buffer.
 * @param {number} sliceOffset Byte offset of the slice in buffer.
 * @param {number} width Slice width.
 * @param {number} height Slice height.
 * @param {number} value Segment value.
 * @param {number} startIdx Flat index of the seed pixel.
 * @param {Uint8Array} visited Per-slice visited flags (length = width*height).
 * @param {boolean} eightConnected True for 8-connectivity, false for 4.
 */
function bfsMarkVisited(
  buffer, sliceOffset, width, height, value, startIdx, visited,
  eightConnected) {
  const queue = [startIdx];
  visited[startIdx] = 1;
  for (let q = 0; q < queue.length; ++q) {
    const idx = queue[q];
    const x = idx % width;
    const y = (idx / width) | 0;
    const neighbors = [
      x > 0 ? idx - 1 : -1,
      x < width - 1 ? idx + 1 : -1,
      y > 0 ? idx - width : -1,
      y < height - 1 ? idx + width : -1
    ];
    if (eightConnected) {
      neighbors.push(
        x > 0 && y > 0 ? idx - width - 1 : -1,
        x < width - 1 && y > 0 ? idx - width + 1 : -1,
        x > 0 && y < height - 1 ? idx + width - 1 : -1,
        x < width - 1 && y < height - 1 ? idx + width + 1 : -1
      );
    }
    for (const ni of neighbors) {
      if (ni !== -1 && !visited[ni] && buffer[sliceOffset + ni] === value) {
        visited[ni] = 1;
        queue.push(ni);
      }
    }
  }
}

/**
 * Trace the outer boundary of a connected foreground region along the
 * pixel edges.
 *
 * The boundary goes around the pixels (not through their centres), so
 * the polygon covers the full pixel area: a pixel belongs to the
 * region if and only if its centre is inside the polygon. The polygon
 * is clockwise on screen, with the region on its right side. Where two
 * pixels of the region only touch at a corner: for an 8-connected region,
 * the trace turns towards the diagonal pixel to keep the region in one
 * polygon, the polygon then touches itself at that corner; for a
 * 4-connected region, it turns away from it.
 *
 * Vertices are in pixel coordinates (pixel centres at integer values,
 * edges at half values), only the corners are returned.
 *
 * @param {Uint8Array} buffer The mask buffer.
 * @param {number} sliceOffset Byte offset of the slice in buffer.
 * @param {number} width Slice width.
 * @param {number} height Slice height.
 * @param {number} value Segment value.
 * @param {number} sx X of the top-left pixel of the component.
 * @param {number} sy Y of the top-left pixel of the component.
 * @param {boolean} eightConnected True for an 8-connected region,
 *   false for a 4-connected one.
 * @returns {Array.<{x: number, y: number}>} Ordered boundary vertices.
 */
function traceEdgeBoundary(
  buffer, sliceOffset, width, height, value, sx, sy, eightConnected) {
  const isIn = function (x, y) {
    return x >= 0 && x < width && y >= 0 && y < height &&
      buffer[sliceOffset + y * width + x] === value;
  };
  /**
   * Check if an edge leaves a vertex in a given direction: the edge
   *   has a region pixel on its right and a non region one on its left.
   *
   * @param {number} vx The vertex x (pixel corner index).
   * @param {number} vy The vertex y (pixel corner index).
   * @param {number} dir The direction index.
   * @returns {boolean} True if the edge exists.
   */
  const hasEdge = function (vx, vy, dir) {
    // pixels around the vertex: top-left, top-right,
    //   bottom-left and bottom-right
    switch (dir) {
      case 0:
        return isIn(vx, vy) && !isIn(vx, vy - 1);
      case 1:
        return isIn(vx - 1, vy) && !isIn(vx, vy);
      case 2:
        return isIn(vx - 1, vy - 1) && !isIn(vx - 1, vy);
      default:
        return isIn(vx, vy - 1) && !isIn(vx - 1, vy - 1);
    }
  };

  // the top-left pixel has no region pixel above it: start
  //   at its top-left corner going east
  const boundary = [{x: sx - 0.5, y: sy - 0.5}];
  let dir = 0;
  let vx = sx + 1;
  let vy = sy;
  // turn order: at a corner contact, the left turn goes to
  //   the diagonal pixel, the right turn stays on the current one
  const turns = eightConnected ? [3, 0, 1] : [1, 0, 3];
  const maxIter = 4 * width * height + 4;
  for (let iter = 0; iter < maxIter; ++iter) {
    if (vx === sx && vy === sy) {
      break;
    }
    let nextDir = -1;
    for (const turn of turns) {
      const candidate = (dir + turn) % 4;
      if (hasEdge(vx, vy, candidate)) {
        nextDir = candidate;
        break;
      }
    }
    if (nextDir === -1) {
      // should not happen on a closed boundary
      logger.warn('Open boundary while tracing mask contour');
      break;
    }
    // keep corners only
    if (nextDir !== dir) {
      boundary.push({x: vx - 0.5, y: vy - 0.5});
    }
    dir = nextDir;
    vx += EDGE_DIRS[dir][0];
    vy += EDGE_DIRS[dir][1];
  }
  return boundary;
}

/**
 * Extract polygon contours from a mask slice by tracing the pixel edges
 * of each connected region (8-connectivity).
 *
 * Returns one polygon per connected region with the given segment value:
 * its outer boundary, holes are not included. The polygons go around the
 * region pixels: their vertices are at pixel corners, in pixel coordinates
 * (pixel centres at integer values).
 *
 * @param {Uint8Array} buffer The mask buffer (all slices).
 * @param {number} sliceOffset Byte offset of the slice in buffer.
 * @param {number} width Slice width in pixels.
 * @param {number} height Slice height in pixels.
 * @param {number} value Segment value to trace.
 * @returns {Array.<Array.<{x: number, y: number}>>} One polygon per
 * connected region.
 */
export function bufferToPolygons(buffer, sliceOffset, width, height, value) {
  return getRegionPolygons(
    buffer, sliceOffset, width, height, value, true);
}

/**
 * Extract the outer boundary polygons of the connected regions of
 * a mask slice, see `bufferToPolygons`.
 *
 * @param {Uint8Array} buffer The mask buffer (all slices).
 * @param {number} sliceOffset Byte offset of the slice in buffer.
 * @param {number} width Slice width in pixels.
 * @param {number} height Slice height in pixels.
 * @param {number} value Segment value to trace.
 * @param {boolean} eightConnected True for 8-connected regions,
 *   false for 4-connected ones.
 * @returns {Array.<Array.<{x: number, y: number}>>} One polygon per
 * connected region.
 */
function getRegionPolygons(
  buffer, sliceOffset, width, height, value, eightConnected) {
  const n = width * height;
  const visited = new Uint8Array(n);
  const polygons = [];
  for (let i = 0; i < n; i++) {
    if (buffer[sliceOffset + i] === value && !visited[i]) {
      const sx = i % width;
      const sy = (i / width) | 0;
      bfsMarkVisited(
        buffer, sliceOffset, width, height, value, i, visited,
        eightConnected);
      polygons.push(traceEdgeBoundary(
        buffer, sliceOffset, width, height, value, sx, sy,
        eightConnected));
    }
  }
  return polygons;
}

/**
 * Fill one or more closed polygons into a flat Uint8Array slice using a
 * scanline even-odd rule applied across all of their edges together.
 * Passing an outer contour together with a nested inner contour therefore
 * punches a hole where the inner contour lies, matching how DICOM
 * CLOSEDPLANAR_XOR (and, by convention, plain CLOSED_PLANAR) contours on
 * the same ROI/slice combine (see PS3.3 C.8.8.6).
 * Ref: {@link https://en.wikipedia.org/wiki/Even%E2%80%93odd_rule}.
 *
 * @param {Uint8Array} buffer The mask buffer (all slices).
 * @param {number} sliceOffset Byte offset of the current slice in buffer.
 * @param {number} width Slice width in pixels.
 * @param {number} height Slice height in pixels.
 * @param {Array.<Array.<{x: number, y: number}>>} polygonsList Polygons
 *   (outer and/or hole contours) in pixel coords, filled together.
 * @param {number} value Segment number to write.
 */
export function fillPolygons(
  buffer, sliceOffset, width, height, polygonsList, value) {
  const polygons = polygonsList.filter((pts) => pts.length >= 3);
  if (polygons.length === 0) {
    return;
  }

  const allYs = polygons.flatMap((pts) => pts.map((p) => p.y));
  const yMin = Math.max(0, Math.floor(Math.min(...allYs)));
  const yMax = Math.min(height - 1, Math.ceil(Math.max(...allYs)));

  for (let y = yMin; y <= yMax; ++y) {
    // find x-intersections at scanline y across all polygons
    const xs = [];
    for (const pts of polygons) {
      const n = pts.length;
      for (let i = 0; i < n; ++i) {
        const p1 = pts[i];
        const p2 = pts[(i + 1) % n];
        // Top-half-open rule for all rows except the last: edges firing at
        // their lower endpoint but not their upper endpoint. For y=yMax the
        // upper endpoint IS the polygon bottom, so switch to closed interval
        // (and skip horizontal edges explicitly to avoid double-counting).
        const inRange = y < yMax
          ? (p1.y <= y && p2.y > y) || (p2.y <= y && p1.y > y)
          : p1.y !== p2.y &&
            ((p1.y <= y && p2.y >= y) || (p2.y <= y && p1.y >= y));
        if (inRange) {
          xs.push(p1.x + (y - p1.y) / (p2.y - p1.y) * (p2.x - p1.x));
        }
      }
    }
    xs.sort((a, b) => a - b);
    // fill pairs
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xStart = Math.max(0, Math.ceil(xs[k]));
      const xEnd = Math.min(width - 1, Math.floor(xs[k + 1]));
      for (let x = xStart; x <= xEnd; ++x) {
        buffer[sliceOffset + y * width + x] = value;
      }
    }
  }
}

/**
 * Flood-fill background pixels reachable from the slice border without
 * crossing any `value`-valued foreground pixel. Used to tell apart plain
 * outside background from background fully enclosed by foreground (holes).
 *
 * The foreground regions are 8-connected (see `bufferToPolygons`), so the
 * background is 4-connected: background pixels that only touch at a corner
 * are separated by the foreground pixels touching at that corner.
 *
 * @param {Uint8Array} buffer The mask buffer (all slices).
 * @param {number} sliceOffset Byte offset of the slice in buffer.
 * @param {number} width Slice width in pixels.
 * @param {number} height Slice height in pixels.
 * @param {number} value Segment value to treat as foreground.
 * @returns {Uint8Array} Per-slice flags, 1 where reachable from the border.
 */
function markOutsideBackground(buffer, sliceOffset, width, height, value) {
  const outside = new Uint8Array(width * height);
  const queue = [];
  /**
   * @param {number} idx Flat pixel index.
   */
  function tryVisit(idx) {
    if (!outside[idx] && buffer[sliceOffset + idx] !== value) {
      outside[idx] = 1;
      queue.push(idx);
    }
  }
  for (let x = 0; x < width; ++x) {
    tryVisit(x);
    tryVisit((height - 1) * width + x);
  }
  for (let y = 0; y < height; ++y) {
    tryVisit(y * width);
    tryVisit(y * width + width - 1);
  }
  for (let q = 0; q < queue.length; ++q) {
    const idx = queue[q];
    const x = idx % width;
    const y = (idx / width) | 0;
    if (x > 0) {
      tryVisit(idx - 1);
    }
    if (x < width - 1) {
      tryVisit(idx + 1);
    }
    if (y > 0) {
      tryVisit(idx - width);
    }
    if (y < height - 1) {
      tryVisit(idx + width);
    }
  }
  return outside;
}

/**
 * Find polygons for background regions fully enclosed by `value`-valued
 * foreground (ie holes), traced as 4-connected regions (the dual of the
 * 8-connected foreground).
 *
 * @param {Uint8Array} buffer The mask buffer (all slices).
 * @param {number} sliceOffset Byte offset of the slice in buffer.
 * @param {number} width Slice width in pixels.
 * @param {number} height Slice height in pixels.
 * @param {number} value Segment value to trace holes for.
 * @returns {Array.<Array.<{x: number, y: number}>>} One polygon per
 * enclosed hole region.
 */
export function findHolePolygons(buffer, sliceOffset, width, height, value) {
  const n = width * height;
  const outside = markOutsideBackground(
    buffer, sliceOffset, width, height, value);
  const holeBuffer = new Uint8Array(n);
  let anyHole = false;
  for (let i = 0; i < n; ++i) {
    if (buffer[sliceOffset + i] !== value && !outside[i]) {
      holeBuffer[i] = 1;
      anyHole = true;
    }
  }
  if (!anyHole) {
    return [];
  }
  // background is 4-connected
  return getRegionPolygons(holeBuffer, 0, width, height, 1, false);
}
