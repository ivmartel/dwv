/**
 * Perpendicular distance from a point to the line through a and b.
 *
 * @param {{x: number, y: number}} pt The point.
 * @param {{x: number, y: number}} a Line start.
 * @param {{x: number, y: number}} b Line end.
 * @returns {number} Distance in pixels.
 */
function ptSegDist(pt, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) {
    return Math.sqrt((pt.x - a.x) ** 2 + (pt.y - a.y) ** 2);
  }
  const t = ((pt.x - a.x) * dx + (pt.y - a.y) * dy) / (dx * dx + dy * dy);
  return Math.sqrt((pt.x - a.x - t * dx) ** 2 + (pt.y - a.y - t * dy) ** 2);
}

/**
 * Simplify a polygon using the Ramer-Douglas-Peucker algorithm.
 * Ref: {@link https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm}.
 *
 * @param {Array.<{x: number, y: number}>} pts Input vertices.
 * @param {number} epsilon Max allowed deviation in pixels.
 * @returns {Array.<{x: number, y: number}>} Simplified vertices.
 */
export function simplifyPolygon(pts, epsilon) {
  if (pts.length <= 3) {
    return pts;
  }
  /**
   * Recursive function to perform RDP simplification.
   *
   * @param {number} start Start index of the segment.
   * @param {number} end End index of the segment.
   * @param {Array<{x: number, y: number}>} result Output array to
   *   collect vertices.
   * @returns {undefined}
   */
  function rdp(start, end, result) {
    if (end <= start + 1) {
      return;
    }
    let maxDist = 0;
    let maxIdx = start;
    for (let i = start + 1; i < end; i++) {
      const d = ptSegDist(pts[i], pts[start], pts[end]);
      if (d > maxDist) {
        maxDist = d;
        maxIdx = i;
      }
    }
    if (maxDist > epsilon) {
      rdp(start, maxIdx, result);
      result.push(pts[maxIdx]);
      rdp(maxIdx, end, result);
    }
  }

  const result = [pts[0]];
  rdp(0, pts.length - 1, result);
  result.push(pts[pts.length - 1]);
  return result;
}
