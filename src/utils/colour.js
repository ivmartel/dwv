// example implementation: dcmtk/dcmiod/libsrc/cielabutil.cc
// https://github.com/DCMTK/dcmtk/blob/DCMTK-3.6.6/dcmiod/libsrc/cielabutil.cc

// doc imports
/* eslint-disable no-unused-vars */
import {Scalar3D} from '../math/scalar';
/* eslint-enable no-unused-vars */

/**
 * RGB colour class.
 */
export class RGB {
  /**
   * Red component.
   *
   * @type {number}
   */
  r;
  /**
   * Green component.
   *
   * @type {number}
   */
  g;
  /**
   * Blue component.
   *
   * @type {number}
   */
  b;
  /**
   * @param {number} r Red component.
   * @param {number} g Green component.
   * @param {number} b Blue component.
   */
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

// black rgb
export const BLACK = {r: 0, g: 0, b: 0};

/**
 * Check if two rgb objects are equal.
 *
 * @param {RGB} c1 The first colour.
 * @param {RGB} c2 The second colour.
 * @returns {boolean} True if both colour are equal.
 */
export function isEqualRgb(c1, c2) {
  return c1 !== null &&
    c2 !== null &&
    typeof c1 !== 'undefined' &&
    typeof c2 !== 'undefined' &&
    c1.r === c2.r &&
    c1.g === c2.g &&
    c1.b === c2.b;
}

/**
 * Convert YBR to RGB.
 *
 * Ref:
 * - {@link http://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.7.6.3.html#sect_C.7.6.3.1.2},
 * - {@link https://en.wikipedia.org/wiki/YCbCr#JPEG_conversion}.
 *
 * @param {number} y The Y component.
 * @param {number} cb The Cb component.
 * @param {number} cr The Cr component.
 * @returns {RGB} RGB equivalent as {r,g,b}.
 */
export function ybrToRgb(y, cb, cr) {
  return {
    r: y + 1.402 * (cr - 128),
    g: y - 0.34414 * (cb - 128) - 0.71414 * (cr - 128),
    b: y + 1.772 * (cb - 128)
  };
}

/**
 * Convert a hex color into RGB.
 *
 * @param {string} hexStr The hex color as '#ab01ef'.
 * @returns {RGB} The RGB values as {r,g,b}.
 */
export function hexToRgb(hexStr) {
  return {
    r: parseInt(hexStr.substring(1, 3), 16),
    g: parseInt(hexStr.substring(3, 5), 16),
    b: parseInt(hexStr.substring(5, 7), 16)
  };
}

/**
 * Convert RGB to its hex equivalent.
 *
 * @param {RGB} rgb The RGB object as {r,g,b}.
 * @returns {string} A string representing the hex color as '#ab01ef'.
 */
export function rgbToHex(rgb) {
  return '#' +
    ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
}

/**
 * Get the brightness of a RGB colour: calculates
 * the luma (Y) of the YIQ colour space.
 *
 * Ref: {@link https://en.wikipedia.org/wiki/YIQ#From_RGB_to_YIQ}.
 *
 * @param {RGB} rgb RGB triplet.
 * @returns {number} The brightness ([0,1]).
 */
export function getBrightness(rgb) {
  // 0.001172549 = 0.299 / 255
  // 0.002301961 = 0.587 / 255
  // 0.000447059 = 0.114 / 255
  return rgb.r * 0.001172549 +
    rgb.g * 0.002301961 +
    rgb.b * 0.000447059;
}

/**
 * Check if a colour given in hexadecimal format is dark.
 *
 * @param {string} hexColour The colour (as '#ab01ef').
 * @returns {boolean} True if the colour is dark (brightness < 0.5).
 */
export function isDarkColour(hexColour) {
  return getBrightness(hexToRgb(hexColour)) < 0.5;
}

/**
 * Get the shadow colour of an input colour.
 *
 * @param {string} hexColour The colour (as '#ab01ef').
 * @returns {string} The shadow colour (white or black).
 */
export function getShadowColour(hexColour) {
  return isDarkColour(hexColour) ? '#fff' : '#000';
}

/**
 * Unsigned int CIE LAB value ([0, 65535]) to CIE LAB value
 *   (L: [0, 100], a: [-128, 127], b: [-128, 127]).
 *
 * @param {object} triplet CIE LAB triplet as {l,a,b} with unsigned range.
 * @returns {object} CIE LAB triplet as {l,a,b} with CIE LAB range.
 */
export function uintLabToLab(triplet) {
  // 0.001525902 = 100 / 65535
  // 0.003891051 = 255 / 65535
  return {
    l: 0.001525902 * triplet.l,
    a: 0.003891051 * triplet.a - 128,
    b: 0.003891051 * triplet.b - 128,
  };
}

/**
 * CIE LAB value (L: [0, 100], a: [-128, 127], b: [-128, 127]) to
 *   unsigned int CIE LAB ([0, 65535]).
 *
 * @param {object} triplet CIE XYZ triplet as {l,a,b} with CIE LAB range.
 * @returns {object} CIE LAB triplet as {l,a,b} with unsigned range.
 */
export function labToUintLab(triplet) {
  // 655.35 = 65535 / 100
  // aUint = (a + 128) * 65535 / 255
  // 257 = 65535 / 255
  // 32896 = 257 * 128
  return {
    l: 655.35 * triplet.l,
    a: 257 * triplet.a + 32896,
    b: 257 * triplet.b + 32896,
  };
}

/**
 * CIE Standard Illuminant D65, standard 2° observer.
 *
 * Ref: {@link https://en.wikipedia.org/wiki/Illuminant_D65}.
 */
const d65 = {
  x: 95.0489,
  y: 100,
  z: 108.884
};

/**
 * Convert CIE LAB to CIE XYZ (standard illuminant D65, 2degree 1931).
 *
 * Ref: {@link https://en.wikipedia.org/wiki/CIELAB_color_space#From_CIELAB_to_CIEXYZ}.
 *
 * @param {object} triplet CIE LAB triplet as {l,a,b}.
 * @returns {Scalar3D} CIE XYZ triplet as {x,y,z}.
 */
export function cielabToCiexyz(triplet) {
  /**
   * Apply the inverse lab function.
   *
   * @param {number} x The input value.
   * @returns {number} The result.
   */
  function invLabFunc(x) {
    let res = null;
    // delta = 6 / 29 = 0.206896552
    if (x > 0.206896552) {
      res = Math.pow(x, 3);
    } else {
      // 0.128418549 = 3 * delta^2
      // 0.017712903 = 3 * delta^2 * (4 / 29)
      res = 0.128418549 * x - 0.017712903;
    }
    return res;
  }

  const illuminant = d65;
  const l0 = (triplet.l + 16) / 116;

  return {
    x: illuminant.x * invLabFunc(l0 + triplet.a / 500),
    y: illuminant.y * invLabFunc(l0),
    z: illuminant.z * invLabFunc(l0 - triplet.b / 200)
  };
}

/**
 * Convert CIE XYZ to CIE LAB (standard illuminant D65, 2degree 1931).
 *
 * Ref: {@link https://en.wikipedia.org/wiki/CIELAB_color_space#From_CIEXYZ_to_CIELAB}.
 *
 * @param {Scalar3D} triplet CIE XYZ triplet as {x,y,z}.
 * @returns {object} CIE LAB triplet as {l,a,b}.
 */
export function ciexyzToCielab(triplet) {
  /**
   * Apply the lab function.
   *
   * @param {number} x The input value.
   * @returns {number} The result.
   */
  function labFunc(x) {
    let res = null;
    // delta = 6 / 29 = 0.206896552
    // delta^3 = 0.008856452
    if (x > 0.008856452) {
      res = Math.pow(x, 0.333333333);
    } else {
      // 7.787037037 = 1 / 3 * delta^2
      // 0.137931034 = 4 / 29
      res = 7.787037037 * x + 0.137931034;
    }
    return res;
  }

  const illuminant = d65;
  const fy = labFunc(triplet.y / illuminant.y);

  return {
    l: 116 * fy - 16,
    a: 500 * (labFunc(triplet.x / illuminant.x) - fy),
    b: 200 * (fy - labFunc(triplet.z / illuminant.z))
  };
}

/**
 * Convert CIE XYZ to sRGB.
 *
 * Ref: {@link https://en.wikipedia.org/wiki/SRGB#From_CIE_XYZ_to_sRGB}.
 *
 * @param {Scalar3D} triplet CIE XYZ triplet as {x,y,z}.
 * @returns {RGB} 'sRGB' triplet as {r,g,b}.
 */
export function ciexyzToSrgb(triplet) {
  /**
   * Apply the gamma function.
   *
   * @param {number} x The input value.
   * @returns {number} The result.
   */
  function gammaFunc(x) {
    let res = null;
    if (x <= 0.0031308) {
      res = 12.92 * x;
    } else {
      // 0.416666667 = 1 / 2.4
      res = 1.055 * Math.pow(x, 0.416666667) - 0.055;
    }
    // clip [0,1]
    return Math.min(1, Math.max(0, res));
  }

  const x = triplet.x / 100;
  const y = triplet.y / 100;
  const z = triplet.z / 100;

  return {
    r: Math.round(255 * gammaFunc(3.2406 * x - 1.5372 * y - 0.4986 * z)),
    g: Math.round(255 * gammaFunc(-0.9689 * x + 1.8758 * y + 0.0415 * z)),
    b: Math.round(255 * gammaFunc(0.0557 * x - 0.2040 * y + 1.0570 * z))
  };
}

/**
 * Convert sRGB to CIE XYZ.
 *
 * Ref: {@link https://en.wikipedia.org/wiki/SRGB#From_sRGB_to_CIE_XYZ}.
 *
 * @param {RGB} triplet 'sRGB' triplet as {r,g,b}.
 * @returns {Scalar3D} CIE XYZ triplet as {x,y,z}.
 */
export function srgbToCiexyz(triplet) {
  /**
   * Apply the inverse gamma function.
   *
   * @param {number} x The input value.
   * @returns {number} The result.
   */
  function invGammaFunc(x) {
    let res = null;
    if (x <= 0.04045) {
      res = x / 12.92;
    } else {
      res = Math.pow((x + 0.055) / 1.055, 2.4);
    }
    return res;
  }

  const rl = invGammaFunc(triplet.r / 255);
  const gl = invGammaFunc(triplet.g / 255);
  const bl = invGammaFunc(triplet.b / 255);

  return {
    x: 100 * (0.4124 * rl + 0.3576 * gl + 0.1805 * bl),
    y: 100 * (0.2126 * rl + 0.7152 * gl + 0.0722 * bl),
    z: 100 * (0.0193 * rl + 0.1192 * gl + 0.9505 * bl)
  };
}

/**
 * Convert CIE LAB to sRGB (standard illuminant D65).
 *
 * @param {object} triplet CIE LAB triplet as {l,a,b}.
 * @returns {RGB} 'sRGB' triplet as {r,g,b}.
 */
export function cielabToSrgb(triplet) {
  return ciexyzToSrgb(cielabToCiexyz(triplet));
}

/**
 * Convert sRGB to CIE LAB (standard illuminant D65).
 *
 * @param {RGB} triplet 'sRGB' triplet as {r,g,b}.
 * @returns {object} CIE LAB triplet as {l,a,b}.
 */
export function srgbToCielab(triplet) {
  return ciexyzToCielab(srgbToCiexyz(triplet));
}

/**
 * Get the hex code of a string colour for a colour used in pre dwv v0.17.
 *
 * @param {string} name The name of a colour.
 * @returns {string} The hex representing the colour.
 */
export function colourNameToHex(name) {
  // default colours used in dwv version < 0.17
  const dict = {
    Yellow: '#ffff00',
    Red: '#ff0000',
    White: '#ffffff',
    Green: '#008000',
    Blue: '#0000ff',
    Lime: '#00ff00',
    Fuchsia: '#ff00ff',
    Black: '#000000'
  };
  let res = '#ffff00';
  if (typeof dict[name] !== 'undefined') {
    res = dict[name];
  }
  return res;
}
