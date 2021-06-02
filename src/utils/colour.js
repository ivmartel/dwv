// namespaces
var dwv = dwv || {};
dwv.utils = dwv.utils || {};

// example implementation: dcmtk/dcmiod/libsrc/cielabutil.cc
// https://github.com/DCMTK/dcmtk/blob/DCMTK-3.6.6/dcmiod/libsrc/cielabutil.cc

/**
 * Convert YBR to RGB.
 *
 * @see http://dicom.nema.org/dicom/2013/output/chtml/part03/sect_C.7.html#sect_C.7.6.3.1.2
 * @see https://en.wikipedia.org/wiki/YCbCr#JPEG_conversion
 *
 * @param {number} y The Y component.
 * @param {number} cb The Cb component.
 * @param {number} cr The Cr component.
 * @returns {object} RGB equivalent as {r,g,b}.
 */
dwv.utils.ybrToRgb = function (y, cb, cr) {
  return {
    r: y + 1.402 * (cr - 128),
    g: y - 0.34414 * (cb - 128) - 0.71414 * (cr - 128),
    b: y + 1.772 * (cb - 128)
  };
};

/**
 * Convert a hexadecimal colour to RGB.
 *
 * @param {string} hexColour The hexadecimal color as '#ab01ef'.
 * @returns {object} RGB equivalent as {r,g,b}.
 */
dwv.utils.hexToRgb = function (hexColour) {
  return {
    r: parseInt(hexColour.substr(1, 2), 16),
    g: parseInt(hexColour.substr(3, 2), 16),
    b: parseInt(hexColour.substr(5, 2), 16)
  };
};

/**
 * Get the brightness of a RGB colour: calculates
 * the luma (Y) of the YIQ colour space.
 *
 * @see https://en.wikipedia.org/wiki/YIQ#From_RGB_to_YIQ
 *
 * @param {object} rgbTriplet RGB triplet.
 * @returns {number} The brightness ([0,1]).
 */
dwv.utils.getBrightness = function (rgbTriplet) {
  // 0.001172549 = 0.299 / 255
  // 0.002301961 = 0.587 / 255
  // 0.000447059 = 0.114 / 255
  return rgbTriplet.r * 0.001172549 +
    rgbTriplet.g * 0.002301961 +
    rgbTriplet.b * 0.000447059;
};

/**
 * Check if a colour given in hexadecimal format is dark.
 *
 * @param {string} hexColour The colour (as '#ab01ef').
 * @returns {boolean} True if the colour is dark (brightness < 0.5).
 */
dwv.utils.isDarkColour = function (hexColour) {
  return dwv.utils.getBrightness(dwv.utils.hexToRgb(hexColour)) < 0.5;
};

/**
 * Get the shadow colour of an input colour.
 *
 * @param {string} hexColour The colour (as '#ab01ef').
 * @returns {string} The shadow colour (white or black).
 */
dwv.utils.getShadowColour = function (hexColour) {
  return dwv.utils.isDarkColour(hexColour) ? '#fff' : '#000';
};

/**
 * Unsigned int CIE LAB value ([0, 65535]) to CIE LAB value
 *   (L: [0, 100], a: [-128, 127], b: [-128, 127]).
 *
 * @param {object} triplet CIE LAB triplet as {l,a,b} with unsigned range.
 * @returns {object} CIE LAB triplet as {l,a,b} with CIE LAB range.
 */
dwv.utils.uintLabToLab = function (triplet) {
  // 0.001525902 = 100 / 65535
  // 0.003891051 = 255 / 65535
  return {
    l: 0.001525902 * triplet.l,
    a: 0.003891051 * triplet.a - 128,
    b: 0.003891051 * triplet.b - 128,
  };
};

/**
 * CIE LAB value (L: [0, 100], a: [-128, 127], b: [-128, 127]) to
 *   unsigned int CIE LAB ([0, 65535]).
 *
 * @param {object} triplet CIE XYZ triplet as {x,y,z} with CIE LAB range.
 * @returns {object} CIE LAB triplet as {l,a,b} with unsigned range.
 */
dwv.utils.labToUintLab = function (triplet) {
  // 655.35 = 65535 / 100
  // aUint = (a + 128) * 65535 / 255
  // 257 = 65535 / 255
  // 32896 = 257 * 128
  return {
    l: 655.35 * triplet.l,
    a: 257 * triplet.a + 32896,
    b: 257 * triplet.b + 32896,
  };
};

/**
 * CIE Standard Illuminant D65
 *
 * @see https://en.wikipedia.org/wiki/Illuminant_D65
 */
dwv.utils.d65 = {
  x: 95.0489,
  y: 100,
  z: 108.884
};

/**
 * Convert CIE LAB to CIE XYZ (standard illuminant D65, 2degree 1931).
 *
 * @see https://en.wikipedia.org/wiki/CIELAB_color_space#From_CIELAB_to_CIEXYZ
 *
 * @param {object} triplet CIE LAB triplet as {l,a,b}.
 * @returns {object} CIE XYZ triplet as {x,y,z}.
 */
dwv.utils.cielabToCiexyz = function (triplet) {
  var invLabFunc = function (x) {
    var res = null;
    // delta = 6 / 29 = 0.206896552
    if (x > 0.206896552) {
      res = Math.pow(x, 3);
    } else {
      // 0.128418549 = 3 * delta^2
      // 0.017712903 = 3 * delta^2 * (4 / 29)
      res = 0.128418549 * x - 0.017712903;
    }
    return res;
  };

  var illuminant = dwv.utils.d65;
  var l0 = (triplet.l + 16) / 116;

  return {
    x: illuminant.x * invLabFunc(l0 + triplet.a / 500),
    y: illuminant.y * invLabFunc(l0),
    z: illuminant.z * invLabFunc(l0 - triplet.b / 200)
  };
};

/**
 * Convert CIE XYZ to CIE LAB (standard illuminant D65, 2degree 1931).
 *
 * @see https://en.wikipedia.org/wiki/CIELAB_color_space#From_CIEXYZ_to_CIELAB
 *
 * @param {object} triplet CIE XYZ triplet as {x,y,z}.
 * @returns {object} CIE LAB triplet as {l,a,b}.
 */
dwv.utils.ciexyzToCielab = function (triplet) {
  var labFunc = function (x) {
    var res = null;
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
  };

  var illuminant = dwv.utils.d65;
  var fy = labFunc(triplet.y / illuminant.y);

  return {
    l: 116 * fy - 16,
    a: 500 * (labFunc(triplet.x / illuminant.x) - fy),
    b: 200 * (fy - labFunc(triplet.z / illuminant.z))
  };
};

/**
 * Convert CIE XYZ to sRGB.
 *
 * @see https://en.wikipedia.org/wiki/SRGB#The_forward_transformation_(CIE_XYZ_to_sRGB)
 *
 * @param {object} triplet CIE XYZ triplet as {x,y,z}.
 * @returns {object} sRGB triplet as {r,g,b}.
 */
dwv.utils.ciexyzToSrgb = function (triplet) {
  var gammaFunc = function (x) {
    var res = null;
    if (x <= 0.0031308) {
      res = 12.92 * x;
    } else {
      // 0.416666667 = 1 / 2.4
      res = 1.055 * Math.pow(x, 0.416666667) - 0.055;
    }
    return res;
  };

  var x = triplet.x / 100;
  var y = triplet.y / 100;
  var z = triplet.z / 100;

  return {
    r: Math.round(255 * gammaFunc(3.2406 * x - 1.5372 * y - 0.4986 * z)),
    g: Math.round(255 * gammaFunc(-0.9689 * x + 1.8758 * y + 0.0415 * z)),
    b: Math.round(255 * gammaFunc(0.0557 * x - 0.2040 * y + 1.0570 * z))
  };
};

/**
 * Convert sRGB to CIE XYZ.
 *
 * @see https://en.wikipedia.org/wiki/SRGB#The_forward_transformation_(CIE_XYZ_to_sRGB)
 *
 * @param {object} triplet sRGB triplet as {r,g,b}.
 * @returns {object} CIE XYZ triplet as {x,y,z}.
 */
dwv.utils.srgbToCiexyz = function (triplet) {
  var invGammaFunc = function (x) {
    var res = null;
    if (x <= 0.04045) {
      res = x / 12.92;
    } else {
      res = Math.pow((x + 0.055) / 1.055, 2.4);
    }
    return res;
  };

  var rl = invGammaFunc(triplet.r / 255);
  var gl = invGammaFunc(triplet.g / 255);
  var bl = invGammaFunc(triplet.b / 255);

  return {
    x: 100 * (0.4124 * rl + 0.3576 * gl + 0.1805 * bl),
    y: 100 * (0.2126 * rl + 0.7152 * gl + 0.0722 * bl),
    z: 100 * (0.0193 * rl + 0.1192 * gl + 0.9505 * bl)
  };
};

/**
 * Convert CIE LAB to sRGB (standard illuminant D65).
 *
 * @param {object} triplet CIE LAB triplet as {l,a,b}.
 * @returns {object} sRGB triplet as {r,g,b}.
 */
dwv.utils.cielabToSrgb = function (triplet) {
  return dwv.utils.ciexyzToSrgb(dwv.utils.cielabToCiexyz(triplet));
};

/**
 * Convert sRGB to CIE LAB (standard illuminant D65).
 *
 * @param {object} triplet sRGB triplet as {r,g,b}.
 * @returns {object} CIE LAB triplet as {l,a,b}.
 */
dwv.utils.srgbToCielab = function (triplet) {
  return dwv.utils.ciexyzToCielab(dwv.utils.srgbToCiexyz(triplet));
};
