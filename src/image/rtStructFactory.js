import {getRTStructFromElements} from '../dicom/dicomRTStruct.js';
import {MaskSegment} from '../dicom/dicomSegment.js';
import {safeGet} from '../dicom/dataElement.js';
import {
  dateToDateObj,
  getDicomDate,
  dateToTimeObj,
  getDicomTime,
} from '../dicom/dicomDate.js';
import {getReferencedSeriesUIDFromRTStruct} from '../dicom/dicomImage.js';
import {
  getElementsFromJSONTags
} from '../dicom/simpleDataElements.js';
import {transferSyntaxKeywords} from '../dicom/dictionary.js';
import {Image} from './image.js';
import {ColourMap} from './luts.js';
import {SegmentCollection} from './segmentCollection.js';
import {RGB} from '../utils/colour.js';
import {Point} from '../math/point.js';
import {Index} from '../math/index.js';
import {logger} from '../utils/logger.js';

/**
 * @import {DataElement} from '../dicom/dataElement.js';
 * @import {SimpleDataElements} from '../dicom/simpleDataElements.js';
 */

/**
 * Patient/study/series tags to copy into mask meta.
 */
const MetaTagKeys = {
  PatientName: '00100010',
  PatientID: '00100020',
  PatientBirthDate: '00100030',
  PatientSex: '00100040',
  StudyDate: '00080020',
  StudyInstanceUID: '0020000D',
  StudyID: '00200010',
  SeriesInstanceUID: '0020000E',
  SeriesNumber: '00200011',
  FrameOfReferenceUID: '00200052'
};

/**
 * Required DICOM tags for RT Structure Set Storage.
 *
 * @type {Array<{name: string, enum: Array}>}
 */
const RTStructRequiredTags = [
  {
    name: 'TransferSyntaxUID',
    enum: [transferSyntaxKeywords.ExplicitVRLittleEndian]
  },
  {name: 'MediaStorageSOPClassUID', enum: ['1.2.840.10008.5.1.4.1.1.481.3']},
  {name: 'SOPClassUID', enum: ['1.2.840.10008.5.1.4.1.1.481.3']},
  {name: 'Modality', enum: ['RTSTRUCT']},
  {name: 'StructureSetLabel', enum: ['RT Structure Set']}
];

/**
 * Get the default DICOM RT Structure Set tags as an object.
 *
 * @returns {SimpleDataElements} The default tags.
 */
export function getDefaultDicomRTStructJson() {
  /** @type {SimpleDataElements} */
  const tags = {};
  for (const tag of RTStructRequiredTags) {
    tags[tag.name] = tag.enum[0];
  }
  return tags;
}

// Moore neighborhood directions clockwise from W.
const CW_DIRS = [
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1]
];

// Map 'dx,dy' -> clockwise direction index.
const DIR_IDX = {};
for (let i = 0; i < 8; i++) {
  DIR_IDX[`${CW_DIRS[i][0]},${CW_DIRS[i][1]}`] = i;
}

/**
 * BFS (Breadth-First Search) flood-fill: mark all 8-connected
 * pixels with `value` as visited.
 *
 * @param {Uint8Array} buffer The mask buffer.
 * @param {number} sliceOffset Byte offset of the slice in buffer.
 * @param {number} width Slice width.
 * @param {number} height Slice height.
 * @param {number} value Segment value.
 * @param {number} startIdx Flat index of the seed pixel.
 * @param {Uint8Array} visited Per-slice visited flags (length = width*height).
 */
function bfsMarkVisited(
  buffer, sliceOffset, width, height, value, startIdx, visited) {
  const queue = [startIdx];
  visited[startIdx] = 1;
  while (queue.length > 0) {
    const idx = queue.shift();
    const x = idx % width;
    const y = (idx / width) | 0;
    const neighbors = [
      x > 0 ? idx - 1 : -1,
      x < width - 1 ? idx + 1 : -1,
      y > 0 ? idx - width : -1,
      y < height - 1 ? idx + width : -1,
      x > 0 && y > 0 ? idx - width - 1 : -1,
      x < width - 1 && y > 0 ? idx - width + 1 : -1,
      x > 0 && y < height - 1 ? idx + width - 1 : -1,
      x < width - 1 && y < height - 1 ? idx + width + 1 : -1
    ];
    for (const ni of neighbors) {
      if (ni !== -1 && !visited[ni] && buffer[sliceOffset + ni] === value) {
        visited[ni] = 1;
        queue.push(ni);
      }
    }
  }
}

/**
 * Trace the outer boundary of a connected foreground region using Moore
 * neighborhood tracing (Jacob's stopping criterion).
 *
 * @param {Uint8Array} buffer The mask buffer.
 * @param {number} sliceOffset Byte offset of the slice in buffer.
 * @param {number} width Slice width.
 * @param {number} height Slice height.
 * @param {number} value Segment value.
 * @param {number} sx X of the top-left pixel of the component.
 * @param {number} sy Y of the top-left pixel of the component.
 * @returns {Array.<{x: number, y: number}>} Ordered boundary vertices.
 */
function mooreBoundary(buffer, sliceOffset, width, height, value, sx, sy) {
  const boundary = [{x: sx, y: sy}];
  let bx = sx;
  let by = sy - 1; // conceptual pixel above start (may be out of bounds)
  let cx = sx;
  let cy = sy;

  const maxIter = width * height * 2 + 1;
  for (let iter = 0; iter < maxIter; iter++) {
    const dIdx = DIR_IDX[`${bx - cx},${by - cy}`];
    let foundX = -1;
    let foundY = -1;
    let newBx = bx;
    let newBy = by;
    for (let k = 1; k <= 8; k++) {
      const idx = (dIdx + k) % 8;
      const nx = cx + CW_DIRS[idx][0];
      const ny = cy + CW_DIRS[idx][1];
      if (nx >= 0 && nx < width && ny >= 0 && ny < height &&
        buffer[sliceOffset + ny * width + nx] === value) {
        foundX = nx;
        foundY = ny;
        const prevIdx = (dIdx + k - 1) % 8;
        newBx = cx + CW_DIRS[prevIdx][0];
        newBy = cy + CW_DIRS[prevIdx][1];
        break;
      }
    }
    if (foundX === -1) {
      // isolated pixel
      break;
    }
    bx = newBx;
    by = newBy;
    cx = foundX;
    cy = foundY;
    // The start pixel is topmost-leftmost, so the trace can only return to it
    // after completing one full loop — stop immediately on first return.
    if (cx === sx && cy === sy) {
      break;
    }
    boundary.push({x: cx, y: cy});
  }
  return boundary;
}

/**
 * Extract polygon contours from a mask slice using Moore neighborhood tracing.
 * Returns one polygon per connected region with the given segment value.
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
  const n = width * height;
  const visited = new Uint8Array(n);
  const polygons = [];
  for (let i = 0; i < n; i++) {
    if (buffer[sliceOffset + i] === value && !visited[i]) {
      const sx = i % width;
      const sy = (i / width) | 0;
      bfsMarkVisited(buffer, sliceOffset, width, height, value, i, visited);
      const pts = mooreBoundary(
        buffer, sliceOffset, width, height, value, sx, sy);
      if (pts.length >= 3) {
        polygons.push(pts);
      }
    }
  }
  return polygons;
}

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

/**
 * Merge extra tags into a base tags object (mutates base).
 *
 * @param {SimpleDataElements} tags Base tags object.
 * @param {SimpleDataElements} extra Tags to merge in.
 */
function mergeTags(tags, extra) {
  for (const key of Object.keys(extra)) {
    tags[key] = extra[key];
  }
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
function fillPolygons(buffer, sliceOffset, width, height, polygonsList, value) {
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
  while (queue.length > 0) {
    const idx = queue.shift();
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
    if (x > 0 && y > 0) {
      tryVisit(idx - width - 1);
    }
    if (x < width - 1 && y > 0) {
      tryVisit(idx - width + 1);
    }
    if (x > 0 && y < height - 1) {
      tryVisit(idx + width - 1);
    }
    if (x < width - 1 && y < height - 1) {
      tryVisit(idx + width + 1);
    }
  }
  return outside;
}

/**
 * Find polygons for background regions fully enclosed by `value`-valued
 * foreground (ie holes), traced the same way as foreground regions.
 *
 * @param {Uint8Array} buffer The mask buffer (all slices).
 * @param {number} sliceOffset Byte offset of the slice in buffer.
 * @param {number} width Slice width in pixels.
 * @param {number} height Slice height in pixels.
 * @param {number} value Segment value to trace holes for.
 * @returns {Array.<Array.<{x: number, y: number}>>} One polygon per
 * enclosed hole region.
 */
function findHolePolygons(buffer, sliceOffset, width, height, value) {
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
  return bufferToPolygons(holeBuffer, 0, width, height, 1);
}

/**
 * {@link Image} factory for DICOM RT Structure Set (RTSTRUCT).
 *
 * Rasterizes ROI contour polygons into a PALETTE COLOR mask image using
 * the same geometry as the reference CT/MR image so that the result can
 * be rendered by the existing mask pipeline.
 */
export class RtStructFactory {

  /**
   * Possible warning created by checkElements.
   *
   * @type {string|undefined}
   */
  #warning;

  /**
   * Get a warning string if elements are not as expected.
   *
   * @returns {string|undefined} The warning.
   */
  getWarning() {
    return this.#warning;
  }

  /**
   * Check dicom elements.
   *
   * @param {Record<string, DataElement>} _dataElements The DICOM data elements.
   * @returns {string|undefined} A possible warning.
   */
  checkElements(_dataElements) {
    this.#warning = undefined;
    return this.#warning;
  }

  /**
   * Get a mask {@link Image} from RTSTRUCT DICOM elements.
   *
   * Contours are rasterized into a Uint8Array whose voxel values are
   * segment numbers (0 = background, 1..N = ROI index).
   * A PALETTE COLOR colour map maps each segment number to the ROI's
   * display colour.
   *
   * @param {Record<string, DataElement>} dataElements The DICOM data elements.
   * @param {Image} refImage The reference image (CT/MR) that was loaded first.
   * @returns {Image} The mask image.
   * @throws {Error} If the reference image geometry cannot be used.
   */
  create(dataElements, refImage) {
    const rois = getRTStructFromElements(dataElements);

    const geo = refImage.getGeometry();
    const size = geo.getSize();
    const width = size.get(0);
    const height = size.get(1);
    const nSlices = size.get(2);
    const sliceSize = width * height;

    const collection = new SegmentCollection(geo);

    // build segments and palette luts
    const segments = [];
    const redLut = [0];
    const greenLut = [0];
    const blueLut = [0];

    for (let roiIndex = 0; roiIndex < rois.length; ++roiIndex) {
      const roi = rois[roiIndex];
      const segNum = roiIndex + 1; // 1-based segment number

      const segment = new MaskSegment(
        segNum, roi.name, roi.generationAlgorithm ?? 'MANUAL');
      segment.interpretedType = roi.interpretedType;
      segment.roiInterpreter = roi.roiInterpreter;
      segment.displayRGBValue = new RGB(
        roi.colour.r, roi.colour.g, roi.colour.b);
      segments.push(segment);

      redLut[segNum] = roi.colour.r;
      greenLut[segNum] = roi.colour.g;
      blueLut[segNum] = roi.colour.b;

      // group this ROI's contours by slice: a slice can hold several
      // contours (outer boundary plus nested hole boundaries) that must be
      // rasterized together with an even-odd rule, not one by one, or a
      // hole contour would just add more filled area instead of punching
      // one out. CLOSED_PLANAR relies on this being an implicit convention
      // (containment/even-odd); CLOSEDPLANAR_XOR makes the same combination
      // explicit (PS3.3 C.8.8.6) - treat both the same way.
      const polygonsByZ = new Map();
      for (const contour of roi.contours) {
        if (contour.type !== 'CLOSED_PLANAR' &&
          contour.type !== 'CLOSEDPLANAR_XOR') {
          continue;
        }
        const raw = contour.points3D;
        if (raw.length < 9) {
          // need at least 3 points (9 values)
          continue;
        }

        // convert 3D patient coords to continuous pixel coords using
        // worldToPoint (unlike worldToIndex, it does not apply Math.floor,
        // preserving sub-pixel positions needed for correct rasterization)
        const pts2D = [];
        for (let i = 0; i < raw.length; i += 3) {
          const p = geo.worldToPoint(
            new Point([raw[i], raw[i + 1], raw[i + 2]]));
          pts2D.push({x: p.getX(), y: p.getY(), z: p.getZ()});
        }

        // all points of a planar contour share the same z index
        const z = Math.round(pts2D[0].z);
        if (z < 0 || z >= nSlices) {
          continue;
        }

        if (!polygonsByZ.has(z)) {
          polygonsByZ.set(z, []);
        }
        polygonsByZ.get(z).push(pts2D);
      }

      // rasterize each slice's contours together into a binary buffer
      // then hand off to the collection
      for (const [z, polygons] of polygonsByZ) {
        const tmpSlice = new Uint8Array(sliceSize);
        fillPolygons(tmpSlice, 0, width, height, polygons, 1);
        collection.addFrame(segNum, tmpSlice, 0, z, sliceSize, segNum);
      }
    }

    // build image UIDs (simple sequential, matching slice order)
    const uids = [];
    for (let k = 0; k < nSlices; ++k) {
      uids.push(refImage.getImageUid(new Index([0, 0, k])));
    }

    // create mask image from the merged label map
    const image = new Image(geo, collection.getLabelMap(), uids);
    image.setSegmentCollection(collection);
    image.setPhotometricInterpretation('PALETTE COLOR');
    image.setPaletteColourMap(new ColourMap(redLut, greenLut, blueLut));

    // build meta
    const safeGetLocal = (key) => safeGet(dataElements, key);
    const meta = {Modality: 'RTSTRUCT'};
    for (const key of Object.keys(MetaTagKeys)) {
      const val = safeGetLocal(MetaTagKeys[key]);
      if (typeof val !== 'undefined') {
        meta[key] = val;
      }
    }

    // custom
    meta.custom = {
      segments,
      referencedSeriesUID: getReferencedSeriesUIDFromRTStruct(dataElements)
    };

    // carry length unit from reference image when available
    const refMeta = refImage.getMeta();
    if (typeof refMeta.lengthUnit !== 'undefined') {
      meta.lengthUnit = refMeta.lengthUnit;
    }
    image.setMeta(meta);

    return image;
  }

  /**
   * Convert a mask {@link Image} into DICOM RT Structure Set elements.
   *
   * Traces each segment's pixel regions per slice using Moore neighborhood
   * contour tracing, simplifies with Ramer-Douglas-Peucker, then maps the
   * 2D pixel coordinates back to 3D patient-space coordinates.
   *
   * @param {Image} image The mask image.
   * @param {MaskSegment[]} [segments] The mask segments; if omitted, taken
   *   from image meta.
   * @param {Image} [sourceImage] Source image (provides StudyInstanceUID).
   * @param {SimpleDataElements} [extraTags] Optional extra tags to merge.
   * @returns {Record<string, DataElement>} The DICOM data elements.
   */
  toDicom(image, segments, sourceImage, extraTags) {
    const tags = getDefaultDicomRTStructJson();

    // copy patient/study/series tags from image meta
    const meta = image.getMeta();
    for (const key of Object.keys(MetaTagKeys)) {
      const val = meta[key];
      if (typeof val !== 'undefined') {
        tags[key] = val;
      }
    }

    // use image segments if not provided
    if (typeof segments === 'undefined') {
      segments = meta.custom?.segments ?? [];
    }

    // keep source image StudyInstanceUID and referenced series when available
    if (typeof sourceImage !== 'undefined') {
      const sourceMeta = sourceImage.getMeta();
      tags.StudyInstanceUID = sourceMeta.StudyInstanceUID;
      tags.ReferencedFrameOfReferenceSequence = {
        value: [{
          FrameOfReferenceUID: tags.FrameOfReferenceUID ?? '',
          RTReferencedStudySequence: {
            value: [{
              ReferencedSOPInstanceUID: sourceMeta.StudyInstanceUID ?? '',
              RTReferencedSeriesSequence: {
                value: [{
                  SeriesInstanceUID: sourceMeta.SeriesInstanceUID ?? ''
                }]
              }
            }]
          }
        }]
      };
    }

    // content date/time
    const now = new Date();
    tags.StructureSetDate = getDicomDate(dateToDateObj(now));
    tags.StructureSetTime = getDicomTime(dateToTimeObj(now));

    const geometry = image.getGeometry();
    const size = geometry.getSize();
    const width = size.get(0);
    const height = size.get(1);
    const nSlices = size.get(2);
    const sliceSize = width * height;
    const buffer = /** @type {Uint8Array} */ (image.getBuffer());
    const hasOverlap = image.getHasOverlap();
    const allSegmentFrames = hasOverlap
      ? image.getSegmentCollection()?.getAll()
      : undefined;

    const roiItems = [];
    const contourItems = [];
    const obsItems = [];

    for (const segment of segments) {
      const segNum = segment.number;
      const colour = segment.displayRGBValue ?? {r: 255, g: 0, b: 0};

      roiItems.push({
        ROINumber: segNum,
        ROIName: segment.label,
        ReferencedFrameOfReferenceUID: tags.FrameOfReferenceUID ?? '',
        ROIGenerationAlgorithm: segment.algorithmType ?? 'MANUAL'
      });

      obsItems.push({
        ObservationNumber: segNum,
        ReferencedROINumber: segNum,
        RTROIInterpretedType: segment.interpretedType ?? 'ORGAN',
        ROIInterpreter: segment.roiInterpreter ?? ''
      });

      // collect contour sequences across all slices
      const contourSeq = [];
      const segFrames = allSegmentFrames?.get(segNum);
      for (let z = 0; z < nSlices; z++) {
        const useOverlapFrame = hasOverlap && segFrames?.has(z);
        const sliceBuffer = useOverlapFrame ? segFrames.get(z) : buffer;
        const sliceOffset = useOverlapFrame ? 0 : z * sliceSize;
        const outerPolygons = bufferToPolygons(
          sliceBuffer, sliceOffset, width, height, segNum);
        // enclosed background regions are written as their own nested
        // contours in the same ContourSequence. When there is a hole, tag
        // the group as CLOSEDPLANAR_XOR so readers combine them via an
        // explicit XOR/even-odd rule (PS3.3 C.8.8.6) instead of relying on
        // the older CLOSED_PLANAR containment convention; single/disjoint
        // contours keep the more broadly supported CLOSED_PLANAR.
        const holePolygons = outerPolygons.length > 0
          ? findHolePolygons(sliceBuffer, sliceOffset, width, height, segNum)
          : [];
        const polygons = outerPolygons.concat(holePolygons);
        const geometricType = holePolygons.length > 0
          ? 'CLOSEDPLANAR_XOR'
          : 'CLOSED_PLANAR';
        for (const polygon of polygons) {
          const simplified = simplifyPolygon(polygon, 1.0);
          if (simplified.length < 3) {
            logger.warn(
              'Saving RT Struct with thin contour, not well supported'
            );
            continue;
          }
          // convert 2D pixel coords to 3D patient-space coords
          const points3D = [];
          for (const pt of simplified) {
            const world = geometry.indexToWorld(new Index([pt.x, pt.y, z]));
            points3D.push(world.get(0), world.get(1), world.get(2));
          }
          contourSeq.push({
            ContourGeometricType: geometricType,
            NumberOfContourPoints: simplified.length,
            ContourData: points3D
          });
        }
      }

      contourItems.push({
        ReferencedROINumber: segNum,
        ROIDisplayColor: [colour.r, colour.g, colour.b],
        ContourSequence: {value: contourSeq}
      });
    }

    tags.StructureSetROISequence = {value: roiItems};
    tags.ROIContourSequence = {value: contourItems};
    tags.RTROIObservationsSequence = {value: obsItems};

    if (typeof extraTags !== 'undefined') {
      mergeTags(tags, extraTags);
    }

    return getElementsFromJSONTags(tags);
  }
}
