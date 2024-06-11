import {Vector3D} from './vector';
import {
  Matrix33,
  getIdentityMat33
} from './matrix';

/**
 * Create a 3x3 coronal (xzy) matrix.
 *
 * @returns {Matrix33} The coronal matrix.
 */
export function getCoronalMat33() {
  /* eslint-disable array-element-newline */
  return new Matrix33([
    1, 0, 0,
    0, 0, 1,
    0, -1, 0
  ]);
  /* eslint-enable array-element-newline */
}

/**
 * Create a 3x3 sagittal (yzx) matrix.
 *
 * @returns {Matrix33} The sagittal matrix.
 */
export function getSagittalMat33() {
  /* eslint-disable array-element-newline */
  return new Matrix33([
    0, 0, -1,
    1, 0, 0,
    0, -1, 0
  ]);
  /* eslint-enable array-element-newline */
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
export function getLPSGroup(code) {
  let orientStr;
  const axialCodes = ['LPS', 'LAI', 'RPI', 'RAS'];
  const coronalCodes = ['LSA', 'LIP', 'RSP', 'RIA'];
  const sagittalCodes = ['PSL', 'PIR', 'ASR', 'AIL'];
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
 * Get the orientation matrix associated to the direction cosines.
 *
 * @param {number[]} cosines The direction cosines.
 * @returns {Matrix33|undefined} The orientation matrix.
 */
export function getOrientationFromCosines(cosines) {
  let orientationMatrix;
  if (typeof cosines !== 'undefined' && cosines.length === 6) {
    const rowCosines = new Vector3D(cosines[0], cosines[1], cosines[2]);
    const colCosines = new Vector3D(cosines[3], cosines[4], cosines[5]);
    const normal = rowCosines.crossProduct(colCosines);
    /* eslint-disable array-element-newline */
    orientationMatrix = new Matrix33([
      rowCosines.getX(), colCosines.getX(), normal.getX(),
      rowCosines.getY(), colCosines.getY(), normal.getY(),
      rowCosines.getZ(), colCosines.getZ(), normal.getZ()
    ]);
    /* eslint-enable array-element-newline */
  }
  return orientationMatrix;
}
