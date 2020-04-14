// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Generate image data for 'YBR_FULL' photometric interpretation.
 * @param {Array} array The array to store the outut data
 * @param {Object} image The image to generate the view from.
 * @param {Object} position The position at witch to generate the view.
 * @param {number} frame The frame number at witch to generate the view.
 */
dwv.image.generateImageDataYbrFull = function (
    array, image, position, frame) {

    var sliceRange = image.getSliceIterator(position.k);

    var index = 0;
    var y, cb, cr;
    var r, g, b;
    var ival = sliceRange.next();
    while (!ival.done) {
        // pixel values
        y = image.getValueAtOffset(ival.value, frame);
        cb = image.getValueAtOffset(ival.value1, frame);
        cr = image.getValueAtOffset(ival.value2, frame);
        // convert to rgb
        // theory:
        // http://dicom.nema.org/dicom/2013/output/chtml/part03/sect_C.7.html#sect_C.7.6.3.1.2
        // reverse equation:
        // https://en.wikipedia.org/wiki/YCbCr#JPEG_conversion
        r = y + 1.402 * (cr - 128);
        g = y - 0.34414 * (cb - 128) - 0.71414 * (cr - 128);
        b = y + 1.772 * (cb - 128);
        // store data
        array.data[index] = r;
        array.data[index + 1] = g;
        array.data[index + 2] = b;
        array.data[index + 3] = 0xff;
        // increment
        index += 4;
        ival = sliceRange.next();
    }
};
