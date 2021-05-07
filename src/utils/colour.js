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
