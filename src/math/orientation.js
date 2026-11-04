import {Vector3D} from './vector.js';
import {
  Matrix33,
  getIdentityMat33
} from './matrix.js';

/**
 * Create a 3x3 coronal (xzy) matrix.
 *
 * @returns {Matrix33} The coronal matrix.
 */
export function getCoronalMat33() {
  /* eslint-disable @stylistic/js/array-element-newline */
  return new Matrix33([
    1, 0, 0,
    0, 0, 1,
    0, -1, 0
  ]);
  /* eslint-enable @stylistic/js/array-element-newline */
}

/**
 * Create a 3x3 sagittal (yzx) matrix.
 *
 * @returns {Matrix33} The sagittal matrix.
 */
export function getSagittalMat33() {
  /* eslint-disable @stylistic/js/array-element-newline */
  return new Matrix33([
    0, 0, -1,
    1, 0, 0,
    0, -1, 0
  ]);
  /* eslint-enable @stylistic/js/array-element-newline */
}

/**
 * Default anatomical plane orientations.
 */
export const Orientation = {
  /**
   * Axial, also known as transverse.
   */
  Axial: 'axial',
  /**
   * Coronal, also known as frontal.
   */
  Coronal: 'coronal',
  /**
   * Sagittal, also known as anteroposterior.
   */
  Sagittal: 'sagittal'
};

/**
 * Get an orientation matrix from a name.
 *
 * @param {string} name The orientation name.
 * @returns {Matrix33|undefined} The orientation matrix.
 */
export function getMatrixFromName(name) {
  let matrix;
  if (name === Orientation.Axial) {
    matrix = getIdentityMat33();
  } else if (name === Orientation.Coronal) {
    matrix = getCoronalMat33();
  } else if (name === Orientation.Sagittal) {
    matrix = getSagittalMat33();
  }
  return matrix;
}

/**
 * Get the orientation code of an orientation matrix. Each letter defines
 * the towards direction. Letters are: R (right), L (left),
 * A (anterior), P (posterior), I (inferior) and S (superior).
 *
 * @param {Matrix33} matrix The orientation matrix.
 * @returns {string} The orientation code.
 */
export function getOrientationStringLPS(matrix) {
  const v0 = new Vector3D(
    matrix.get(0, 0),
    matrix.get(1, 0),
    matrix.get(2, 0)
  );
  const v1 = new Vector3D(
    matrix.get(0, 1),
    matrix.get(1, 1),
    matrix.get(2, 1)
  );
  const v2 = new Vector3D(
    matrix.get(0, 2),
    matrix.get(1, 2),
    matrix.get(2, 2)
  );
  return getVectorStringLPS(v0) +
    getVectorStringLPS(v1) +
    getVectorStringLPS(v2);
}

/**
 * Get the orientation code of an orientation vector.
 * Credits: David Clunie, {@link https://www.dclunie.com/medical-image-faq/html/part2.html}.
 *
 * @param {Vector3D} vector The orientation vector.
 * @returns {string} The orientation code.
 */
function getVectorStringLPS(vector) {
  let abs = new Vector3D(
    Math.abs(vector.getX()),
    Math.abs(vector.getY()),
    Math.abs(vector.getZ())
  );

  let orientation = '';
  const orientationX = vector.getX() < 0 ? 'R' : 'L';
  const orientationY = vector.getY() < 0 ? 'A' : 'P';
  // as defined in DICOM
  //const orientationZ = vector.getZ() < 0 ? 'F' : 'H';
  const orientationZ = vector.getZ() < 0 ? 'I' : 'S';

  const threshold = 0.0001;

  for (let i = 0; i < 3; i++) {
    if (abs.getX() > threshold &&
      abs.getX() > abs.getY() &&
      abs.getX() > abs.getZ()) {
      orientation += orientationX;
      abs = new Vector3D(0, abs.getY(), abs.getZ());
    } else if (abs.getY() > threshold &&
      abs.getY() > abs.getX() &&
      abs.getY() > abs.getZ()) {
      orientation += orientationY;
      abs = new Vector3D(abs.getX(), 0, abs.getZ());
    } else if (abs.getZ() > threshold &&
      abs.getZ() > abs.getX() &&
      abs.getZ() > abs.getY()) {
      orientation += orientationZ;
      abs = new Vector3D(abs.getX(), abs.getY(), 0);
    } else {
      break;
    }
  }

  return orientation;
}

/**
 * Get the LPS 'group' (axial, coronal or sagittal) from a LPS code.
 *
 * @param {string} code The LPS code string.
 * @returns {string|undefined} The group.
 */
function getLPSGroup(code) {
  let orientStr;
  const axialCodes =
    ['LPS', 'LAI', 'RPI', 'RAS', 'ALS', 'ARI', 'PLI', 'PRS'];
  const coronalCodes =
    ['LSA', 'LIP', 'RSP', 'RIA', 'ILA', 'IRP', 'SLP', 'SRA'];
  const sagittalCodes =
    ['PSL', 'PIR', 'ASR', 'AIL', 'IAR', 'IPL', 'SAL', 'SPR'];
  if (axialCodes.includes(code)) {
    orientStr = Orientation.Axial;
  } else if (coronalCodes.includes(code)) {
    orientStr = Orientation.Coronal;
  } else if (sagittalCodes.includes(code)) {
    orientStr = Orientation.Sagittal;
  }
  return orientStr;
}

/**
 * Get the name of an image orientation patient.
 *
 * @param {number[]} cosines The image orientation
 *   patient cosines (6 values).
 * @returns {string|undefined} The orientation
 *   name: axial, coronal or sagittal.
 */
export function getOrientationName(cosines) {
  let name;
  const orientMatrix = getOrientationFromCosines(cosines);
  if (typeof orientMatrix !== 'undefined') {
    const lpsStr = getOrientationStringLPS(orientMatrix.asOneAndZeros());
    name = getLPSGroup(lpsStr);
  }
  return name;
}

/**
 * Get the orientation matrix associated to the direction cosines.
 *
 * @param {number[]} cosines The image orientation
 *   patient cosines (6 values).
 * @returns {Matrix33|undefined} The orientation matrix.
 */
export function getOrientationFromCosines(cosines) {
  let orientationMatrix;
  if (typeof cosines !== 'undefined' && cosines.length === 6) {
    const rowCosines = new Vector3D(cosines[0], cosines[1], cosines[2]);
    const colCosines = new Vector3D(cosines[3], cosines[4], cosines[5]);
    const normal = rowCosines.crossProduct(colCosines);
    /* eslint-disable @stylistic/js/array-element-newline */
    orientationMatrix = new Matrix33([
      rowCosines.getX(), colCosines.getX(), normal.getX(),
      rowCosines.getY(), colCosines.getY(), normal.getY(),
      rowCosines.getZ(), colCosines.getZ(), normal.getZ()
    ]);
    /* eslint-enable @stylistic/js/array-element-newline */
  }
  return orientationMatrix;
}

/**
 * Get the direction cosines from an orientation matrix.
 *
 * @param {Matrix33} matrix The input matrix.
 * @returns {number[]} The image orientation
 *   patient cosines (6 values).
 */
export function getCosinesFromOrientation(matrix) {
  return [
    matrix.get(0, 0),
    matrix.get(1, 0),
    matrix.get(2, 0),
    matrix.get(0, 1),
    matrix.get(1, 1),
    matrix.get(2, 1)
  ];
}

/**
 * Get the view orientation according to an image and target orientation.
 * The view orientation is used to go from target to image space.
 *
 * @param {Matrix33} imageOrientation The image geometry.
 * @param {Matrix33} targetOrientation The target orientation.
 * @returns {Matrix33} The view orientation.
 */
export function getViewOrientation(imageOrientation, targetOrientation) {
  let viewOrientation = getIdentityMat33();
  if (typeof targetOrientation !== 'undefined') {
    // i: image, v: view, t: target, O: orientation, P: point
    // [Img] -- Oi --> [Real] <-- Ot -- [Target]
    // Pi = (Oi)-1 * Ot * Pt = Ov * Pt
    // -> Ov = (Oi)-1 * Ot
    // TODO: asOneAndZeros simplifies but not nice...
    viewOrientation =
      imageOrientation.asOneAndZeros().getInverse().multiply(targetOrientation);
  }
  // abs: the view orientation is only an axis permutation, the slice
  //   is generated in image index order (see getSliceIterator) and
  //   the index and plane conversions do not handle reversed axes.
  //   Axis directions are handled at display by flipping the
  //   layers, see getViewFlips.
  return viewOrientation.getAbs();
}

/**
 * Get the target orientation according to an image and view orientation.
 * The target orientation is used to go from target to real space.
 *
 * @param {Matrix33} imageOrientation The image geometry.
 * @param {Matrix33} viewOrientation The view orientation.
 * @returns {Matrix33} The target orientation.
 */
export function getTargetOrientation(imageOrientation, viewOrientation) {
  // i: image, v: view, t: target, O: orientation, P: point
  // [Img] -- Oi --> [Real] <-- Ot -- [Target]
  // Pi = (Oi)-1 * Ot * Pt = Ov * Pt
  // -> Ot = Oi * Ov
  // note: asOneAndZeros as in getViewOrientation...
  let targetOrientation =
    imageOrientation.asOneAndZeros().multiply(viewOrientation);

  // abs for coronal acquisitions: historical, the display does not
  //   depend on it (see getViewFlips) but the plane offsets and the
  //   annotation plane cosines (planePoints) do, keep for compatibility
  const simpleImageOrientation = imageOrientation.asOneAndZeros().getAbs();
  if (simpleImageOrientation.isSimilar(getCoronalMat33().getAbs())) {
    targetOrientation = targetOrientation.getAbs();
  }

  return targetOrientation;
}

/**
 * Get the display orientation of a view: the orientation matrix of the
 *   target orientation name or, if undefined or unknown, the one of the
 *   image acquisition plane.
 *
 * @param {Matrix33} imageOrientation The image orientation.
 * @param {string} [targetName] The target orientation name.
 * @returns {Matrix33} The display orientation.
 */
export function getDisplayOrientation(imageOrientation, targetName) {
  let displayOrientation = getMatrixFromName(targetName);
  if (typeof displayOrientation === 'undefined') {
    // acquisition plane from the image normal
    const planeNames = [
      Orientation.Sagittal,
      Orientation.Coronal,
      Orientation.Axial
    ];
    displayOrientation = getMatrixFromName(
      planeNames[imageOrientation.getThirdColMajorDirection()]);
  }
  return displayOrientation;
}

/**
 * Get the layer flips needed to show an image with its display
 *   orientation: for each view axis, flip it if its direction is
 *   opposite to the display one.
 *
 * The scale flips are in the target space, as expected by the layers
 *   flipScale methods, and the offset ones in the view space.
 *
 * @param {Matrix33} imageOrientation The image orientation.
 * @param {Matrix33} displayOrientation The display orientation,
 *   see getDisplayOrientation.
 * @param {Matrix33} targetOrientation The layers target orientation,
 *   see getTargetOrientation.
 * @returns {{scale: {x: boolean, y: boolean, z: boolean},
 *   offset: {x: boolean, y: boolean}}} The scale and offset flips.
 */
export function getViewFlips(
  imageOrientation, displayOrientation, targetOrientation) {
  const viewOrientation =
    getViewOrientation(imageOrientation, displayOrientation);
  // view to real space with signs
  const signedTarget =
    imageOrientation.asOneAndZeros().multiply(viewOrientation);
  // sign of each view axis compared to the display one
  const signs = [];
  for (let j = 0; j < 3; ++j) {
    let dot = 0;
    for (let i = 0; i < 3; ++i) {
      dot += signedTarget.get(i, j) * displayOrientation.get(i, j);
    }
    signs.push(dot < 0 ? -1 : 1);
  }
  // no flip along the scroll axis
  signs[2] = targetOrientation.getColAbsMax(2).value < 0 ? -1 : 1;
  // the layers scale is the target oriented flip scale:
  //   flipScale = target * signs
  const flipScale = targetOrientation.multiplyArray3D(signs);
  return {
    scale: {
      x: flipScale[0] < 0,
      y: flipScale[1] < 0,
      z: flipScale[2] < 0
    },
    offset: {
      x: signs[0] < 0,
      y: signs[1] < 0
    }
  };
}
