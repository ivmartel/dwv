import {logger} from '../utils/logger.js';

/**
 * @import {ColourMap} from './luts.js';
 * @import {Size} from './size.js';
 * @import {Matrix33} from '../math/matrix.js';
 * @import {SegmentCollection} from './segmentCollection.js';
 * @import {MaskSegmentViewHelper} from './maskSegmentViewHelper.js';
 */

/**
 * Generate image data for 'PALETTE COLOR' photometric interpretation.
 *
 * @param {ImageData} array The array to store the outut data.
 * @param {object} iterator Position iterator.
 * @param {Function} alphaFunc The alpha function.
 * @param {ColourMap} colourMap The colour map.
 * @param {boolean} is16BitsStored Flag to know if the data is 16bits.
 */
export function generateImageDataPaletteColor(
  array,
  iterator,
  alphaFunc,
  colourMap,
  is16BitsStored) {
  // right shift 8
  const to8 = function (value) {
    return value >> 8;
  };

  if (is16BitsStored) {
    logger.info('Scaling 16bits data to 8bits.');
  }

  let index = 0;
  let pxValue;
  let ival = iterator.next();
  while (!ival.done) {
    // pixel value
    pxValue = ival.value;
    // store data
    // TODO check pxValue fits in lut
    if (is16BitsStored) {
      array.data[index] = to8(colourMap.red[pxValue]);
      array.data[index + 1] = to8(colourMap.green[pxValue]);
      array.data[index + 2] = to8(colourMap.blue[pxValue]);
    } else {
      array.data[index] = colourMap.red[pxValue];
      array.data[index + 1] = colourMap.green[pxValue];
      array.data[index + 2] = colourMap.blue[pxValue];
    }
    array.data[index + 3] = alphaFunc(pxValue, ival.index);
    // increment
    index += 4;
    ival = iterator.next();
  }
}

/**
 * Generate image data for 'PALETTE COLOR' with overlapping segment blend.
 * For each pixel, averages the palette colours of all visible segments
 * present at that buffer offset.
 *
 * Contour detection uses a cached union ImageContour (one binary buffer where
 * any visible segment is present) built by SegmentCollection. This avoids
 * false seams that would occur if the label-map ImageContour were used,
 * because the label map stores only first-wins values at overlap positions.
 *
 * @param {ImageData} array The array to store the output data.
 * @param {object} iterator Position iterator.
 * @param {ColourMap} colourMap The colour map.
 * @param {SegmentCollection} collection The segment collection.
 * @param {number} sliceSize Number of pixels per slice (ncols * nrows).
 * @param {Size} imageSize The full image size.
 * @param {Matrix33} orientation The view orientation.
 * @param {number} contourThickness Contour thickness (0 = fill only).
 * @param {number} fillOpacity Fill opacity [0-1].
 * @param {MaskSegmentViewHelper} [segmentViewHelper] Hidden-segment tracker.
 */
export function generateImageDataPaletteColorBlend(
  array,
  iterator,
  colourMap,
  collection,
  sliceSize,
  imageSize,
  orientation,
  contourThickness,
  fillOpacity,
  segmentViewHelper) {
  const segments = collection.getAll();
  const fillAlpha = Math.round(0xff * fillOpacity);

  const unionContour = contourThickness > 0
    ? collection.getOrBuildUnionContour(segmentViewHelper, imageSize)
    : null;

  let index = 0;
  let ival = iterator.next();
  while (!ival.done) {
    const offset = ival.index;
    const pxValue = ival.value;

    if (pxValue === 0) {
      // background — always transparent
      array.data[index] = 0;
      array.data[index + 1] = 0;
      array.data[index + 2] = 0;
      array.data[index + 3] = 0;
    } else {
      const sliceIdx = Math.floor(offset / sliceSize);
      const localOff = offset % sliceSize;
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;
      for (const [segNum, sliceMap] of segments) {
        if (segmentViewHelper?.isHidden(segNum)) {
          continue;
        }
        const sliceBuf = sliceMap.get(sliceIdx);
        if (typeof sliceBuf !== 'undefined' && sliceBuf[localOff] !== 0) {
          r += colourMap.red[segNum];
          g += colourMap.green[segNum];
          b += colourMap.blue[segNum];
          ++count;
        }
      }

      if (count === 0) {
        // all segments at this position are hidden
        array.data[index + 3] = 0;
      } else {
        array.data[index] = Math.round(r / count);
        array.data[index + 1] = Math.round(g / count);
        array.data[index + 2] = Math.round(b / count);

        let alpha = fillAlpha;
        if (unionContour !== null &&
          unionContour.getDistance(offset, orientation) <= contourThickness) {
          alpha = 0xff;
        }

        array.data[index + 3] = alpha;
      }
    }

    index += 4;
    ival = iterator.next();
  }
}
