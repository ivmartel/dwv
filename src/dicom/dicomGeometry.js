import {Size} from '../image/size.js';
import {Spacing} from '../image/spacing.js';
import {Geometry} from '../image/geometry.js';
import {safeGet, safeGetAll} from './dataElement.js';
import {
  getImage2DSize,
  getPixelSpacing,
  getPixelAspectRatio,
  getOrientationMatrix,
  getSpacingFromMeasure
} from './dicomImage.js';
import {getVolumeIdTagValue} from './dicomVolume.js';
import {getOrientationFromCosines} from '../math/orientation.js';
import {
  Point3D,
  point3DFromArray,
  includesPoint3D
} from '../math/point.js';
import {Index} from '../math/index.js';
import {
  REAL_WORLD_EPSILON,
  isAboveEpsilon
} from '../math/number.js';
import {arraySortEquals} from '../utils/array.js';
import {logger} from '../utils/logger.js';

/**
 * @import {DataElement} from './dataElement.js';
 * @import {Matrix33} from '../math/matrix.js';
 * @import {DicomFunctionalGroup} from './dicomFunctionalGroup.js';
 */

/**
 * @typedef {Record<string, DataElement>} DataElements
 */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  NumberOfFrames: '00280008',
  ImagePositionPatient: '00200032',
  SharedFunctionalGroupsSequence: '52009229',
  PlaneOrientationSequence: '00209116',
  ImageOrientationPatient: '00200037',
  PixelMeasuresSequence: '00289110'
};

/**
 * Get the image geometry from root DICOM elements.
 *
 * @param {DataElements} dataElements The DICOM data elements.
 * @returns {Geometry} The image geometry.
 */
export function getRootGeometry(dataElements) {
  const size2D = getImage2DSize(dataElements);
  const sizeValues = [size2D[0], size2D[1], 1];

  // NumberOfFrames
  const numberOfFrames = safeGet(dataElements, TagKeys.NumberOfFrames);
  if (typeof numberOfFrames !== 'undefined') {
    const number = parseInt(numberOfFrames, 10);
    if (number > 1) {
      sizeValues.push(number);
    }
  }

  // image size
  const size = new Size(sizeValues);

  // image spacing
  let spacingValues = [1, 1, 1];
  const spacing2D = getPixelSpacing(dataElements);
  if (typeof spacing2D !== 'undefined') {
    spacingValues = [spacing2D[0], spacing2D[1], 1];
  } else {
    // try pixel aspect ratio
    const ratio = getPixelAspectRatio(dataElements);
    if (typeof ratio !== 'undefined') {
      spacingValues = [ratio[0], ratio[1], 1];
      logger.warn('Use pixel aspect ratio as spacing');
    }
  }
  const spacing = new Spacing(spacingValues);

  // ImagePositionPatient
  const imagePositionPatient =
    safeGetAll(dataElements, TagKeys.ImagePositionPatient);
  // slice position
  let slicePosition = new Array(0, 0, 0);
  if (typeof imagePositionPatient !== 'undefined') {
    slicePosition = [
      parseFloat(imagePositionPatient[0]),
      parseFloat(imagePositionPatient[1]),
      parseFloat(imagePositionPatient[2])
    ];
  }

  // Image orientation patient
  const orientationMatrix = getOrientationMatrix(dataElements);

  // geometry
  const origin = new Point3D(
    slicePosition[0], slicePosition[1], slicePosition[2]);
  const time = getVolumeIdTagValue(dataElements);

  return new Geometry([origin], size, spacing, orientationMatrix, time);
}

/**
 * Check the distance between a frame origin and a reference origin.
 *
 * @param {Point3D} frameOrigin The frame origin to check.
 * @param {Point3D} refOrigin The reference origin to check against.
 * @param {number} index The frame index, used for error message.
 * @throws {Error} If distance is too high.
 */
function checkDistance(frameOrigin, refOrigin, index) {
  const dist = frameOrigin.getDistance(refOrigin);
  // warn is bigger than epsilon, error if bigger than 100*epsilon
  if (dist > REAL_WORLD_EPSILON) {
    if (dist < REAL_WORLD_EPSILON * 100) {
      logger.warn(
        `Frame origin ${index} is far from reference origin (${dist}).`
      );
    } else {
      throw new Error(`No reference origin for frame origin ${index}`);
    }
  }
}

/**
 * Complete origins using reference origins if with gaps.
 *
 * @param {Point3D[]} frameOrigins The frame origins.
 * @param {Point3D[]} refOrigins The reference image origins.
 * @returns {Point3D[]} The continous origins.
 */
function completeOriginsFromReference(
  frameOrigins,
  refOrigins) {
  // result
  const resOrigins = [];

  resOrigins.push(frameOrigins[0]);
  let previousIndex = frameOrigins[0].getClosest(refOrigins);
  checkDistance(frameOrigins[0], refOrigins[previousIndex], 0);
  for (let i = 1; i < frameOrigins.length; ++i) {
    const frameOrigin = frameOrigins[i];
    const currentIndex = frameOrigin.getClosest(refOrigins);
    checkDistance(frameOrigin, refOrigins[currentIndex], i);
    if (currentIndex !== previousIndex + 1) {
      for (let j = previousIndex + 1; j < currentIndex; ++j) {
        resOrigins.push(refOrigins[j]);
      }
    }
    resOrigins.push(frameOrigin);
    previousIndex = currentIndex;
  }

  return resOrigins;
}

/**
 * Complete origins using a base geometry if with gaps.
 *
 * @param {Point3D[]} frameOrigins The frame origins.
 * @param {Geometry} baseGeometry The base geometry.
 * @returns {Point3D[]} The continous origins.
 */
function completeOriginsFromGeometry(
  frameOrigins,
  baseGeometry) {
  // result
  const resOrigins = [];

  resOrigins.push(frameOrigins[0]);
  let sliceIndex = 0;
  for (let g = 1; g < frameOrigins.length; ++g) {
    ++sliceIndex;
    let index = new Index([0, 0, sliceIndex]);
    let point = baseGeometry.indexToWorld(index).get3D();
    const frameOrigin = frameOrigins[g];
    // check if more pos pats are needed
    let dist = frameOrigin.getDistance(point);
    const distPrevious = dist;
    // TODO: good threshold?
    while (isAboveEpsilon(dist)) {
      logger.debug(`Adding intermediate pos pats at ${
        point.toString() }`);
      resOrigins.push(point);
      ++sliceIndex;
      index = new Index([0, 0, sliceIndex]);
      point = baseGeometry.indexToWorld(index).get3D();
      dist = frameOrigin.getDistance(point);
      if (dist > distPrevious) {
        throw new Error(
          'Test distance is increasing when adding intermediate pos pats');
      }
    }
    // add frame pos pat
    resOrigins.push(frameOrigin);
  }

  return resOrigins;
}

/**
 * Get the frames geometry from root DICOM elements and per-frame infos.
 *
 * @param {DataElements} dataElements The DICOM data elements.
 * @param {DicomFunctionalGroup[]} perFrameFuncGroups The per-frame
 *   functional groups.
 * @param {boolean} [completeOrigins] Flag to complete origins if gaps,
 *   defaults to false.
 * @param {Point3D[]} [refOrigins] Reference origins used to complete
 *   gaps, if not present the code will calculate them if completeOrigins
 *   is true.
 * @returns {Geometry} The geometry.
 * @throws {Error} Error for missing or wrong data.
 */
export function getFramesGeometry(
  dataElements,
  perFrameFuncGroups,
  completeOrigins,
  refOrigins) {
  // image size
  const size2D = getImage2DSize(dataElements);
  const size = new Size([size2D[0], size2D[1], 1]);

  // Shared Functional Groups Sequence
  let spacing;
  let imageOrientationPatient;
  const sharedFunctionalGroupsSeq =
    safeGetAll(dataElements, TagKeys.SharedFunctionalGroupsSequence);
  if (typeof sharedFunctionalGroupsSeq !== 'undefined') {
    // should be only one
    const funcGroup0 = sharedFunctionalGroupsSeq[0];
    // Plane Orientation Sequence
    if (typeof funcGroup0[TagKeys.PlaneOrientationSequence] !== 'undefined') {
      const planeOrientationSeq =
        funcGroup0[TagKeys.PlaneOrientationSequence];
      if (planeOrientationSeq.value.length !== 0) {
        // should be only one
        imageOrientationPatient =
          planeOrientationSeq.value[0][TagKeys.ImageOrientationPatient].value;
      } else {
        logger.warn(
          'No shared functional group plane orientation sequence items.');
      }
    }
    // Pixel Measures Sequence
    if (typeof funcGroup0[TagKeys.PixelMeasuresSequence] !== 'undefined') {
      const pixelMeasuresSeq = funcGroup0[TagKeys.PixelMeasuresSequence];
      if (pixelMeasuresSeq.value.length !== 0) {
        // should be only one
        spacing = getSpacingFromMeasure(pixelMeasuresSeq.value[0]);
      } else {
        logger.warn(
          'No shared functional group pixel measure sequence items.');
      }
    }
  }

  // check frame infos
  const frameOrigins = [];
  for (let ii = 0; ii < perFrameFuncGroups.length; ++ii) {
    // populate frame origins
    const frameOrigin = point3DFromArray(perFrameFuncGroups[ii].imagePosPat);
    if (!includesPoint3D(frameOrigins, frameOrigin)) {
      frameOrigins.push(frameOrigin);
    }
    // store orientation if needed, avoid multi
    if (typeof perFrameFuncGroups[ii].imageOrientationPatient !== 'undefined') {
      if (typeof imageOrientationPatient === 'undefined') {
        imageOrientationPatient =
          perFrameFuncGroups[ii].imageOrientationPatient;
      } else if (!arraySortEquals(
        imageOrientationPatient,
        perFrameFuncGroups[ii].imageOrientationPatient)) {
        throw new Error('Unsupported multi orientation frames geometry.');
      }
    }
    // store spacing if needed, avoid multi
    if (typeof perFrameFuncGroups[ii].spacing !== 'undefined') {
      if (typeof spacing === 'undefined') {
        spacing = perFrameFuncGroups[ii].spacing;
      } else if (!spacing.equals(perFrameFuncGroups[ii].spacing)) {
        throw new Error('Unsupported multi resolution frames geometry.');
      }
    }
  }

  // check spacing and orientation
  if (typeof spacing === 'undefined') {
    throw new Error('No spacing found for frames geometry');
  }
  if (spacing.length() !== 3) {
    throw new Error('Incomplete spacing found for frames geometry');
  }
  if (typeof imageOrientationPatient === 'undefined') {
    throw new Error('No imageOrientationPatient found for frames geometry');
  }
  // orientation
  const orientationMatrix = getOrientationFromCosines(
    imageOrientationPatient.map((item) => parseFloat(item))
  );
  if (typeof orientationMatrix === 'undefined') {
    throw new Error(
      'Invalid imageOrientationPatient found for frames geometry');
  }

  let origins;
  if (typeof completeOrigins === 'undefined' ||
    completeOrigins === false) {
    origins = frameOrigins;
  } else if (typeof refOrigins !== 'undefined') {
    origins = completeOriginsFromReference(frameOrigins, refOrigins);
  } else {
    // tmp geometry with correct spacing but only one slice
    const baseGeometry = new Geometry(
      [frameOrigins[0]], size, spacing, orientationMatrix);

    origins = completeOriginsFromGeometry(frameOrigins, baseGeometry);
  }

  // final geometry
  const geometry = new Geometry(
    [origins[0]], size, spacing, orientationMatrix);
  // append origins
  for (let m = 1; m < origins.length; ++m) {
    geometry.appendOrigin(origins[m], m);
  }

  return geometry;
}
