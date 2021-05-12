// namespaces
var dwv = dwv || {};
dwv.utils = dwv.utils || {};

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
 * Unsigned int CIE LAB value to CIE LAB value.
 *
 * @param {object} triplet CIE LAB triplet as {l,a,b} with unsigned range.
 * @returns {object} CIE XYZ triplet as {x,y,z} with CIE LAB range.
 */
dwv.utils.uintLabToLab = function (triplet) {
  return {
    l: triplet.l * 100 / 65536,
    a: (triplet.a * 255 / 65536) - 128,
    b: (triplet.b * 255 / 65536) - 128,
  };
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
  var func = function (x) {
    var res = null;
    if (x > 0.206896552) {
      res = Math.pow(x, 3);
    } else {
      res = 0.128418549 * x - 0.017712903;
    }
    return res;
  };

  var l0 = (triplet.l + 16) / 116;
  var d65 = {
    x: 95.0489,
    y: 100,
    z: 108.884
  };

  return {
    x: d65.x * func(l0 + triplet.a / 500),
    y: d65.y * func(l0),
    z: d65.z * func(l0 - triplet.b / 200)
  };
};

/**
 * Convert CIE XYZ to sRGB.
 *
 * @see https://en.wikipedia.org/wiki/SRGB#The_forward_transformation_(CIE_XYZ_to_sRGB)
 *
 * @param {object} triplet CIE XYZ triplet as {l,a,b}.
 * @returns {object} sRGB triplet as {r,g,b}.
 */
dwv.utils.ciexyzToSrgb = function (triplet) {
  var gammaFunc = function (x) {
    var res = null;
    if (x <= 0.0031308) {
      res = 12.92 * x;
    } else {
      res = 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
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
 * Convert CIE LAB to sRGB (standard illuminant D65).
 *
 * @param {object} triplet CIE LAB triplet as {l,a,b}.
 * @returns {object} sRGB triplet as {x,y,z}.
 */
dwv.utils.cielabToSrgb = function (triplet) {
  return dwv.utils.ciexyzToSrgb(dwv.utils.cielabToCiexyz(triplet));
};
