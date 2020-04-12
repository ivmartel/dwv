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

    var sliceSize = image.getGeometry().getSize().getSliceSize();
    var startOffset = sliceSize * position.k;

    // 3 times bigger...
    startOffset *= 3;

    // the planar configuration defines the memory layout
    var planarConfig = image.getPlanarConfiguration();
    if (planarConfig !== 0 && planarConfig !== 1) {
        throw new Error("Unsupported planar configuration: " + planarConfig);
    }
    // default: YBRYBRYBR...
    var posY = startOffset;
    var posCB = startOffset + 1;
    var posCR = startOffset + 2;
    var stepPos = 3;
    // YYYY...BBBB...RRRR...
    if (planarConfig === 1) {
        posY = startOffset;
        posCB = startOffset + sliceSize;
        posCR = startOffset + 2 * sliceSize;
        stepPos = 1;
    }

    var index = 0;
    var y, cb, cr;
    var r, g, b;
    for (var i = 0; i < sliceSize; ++i) {
        y = image.getValueAtOffset(posY, frame);
        cb = image.getValueAtOffset(posCB, frame);
        cr = image.getValueAtOffset(posCR, frame);

        // theory:
        // http://dicom.nema.org/dicom/2013/output/chtml/part03/sect_C.7.html#sect_C.7.6.3.1.2
        // reverse equation:
        // https://en.wikipedia.org/wiki/YCbCr#JPEG_conversion
        r = y + 1.402 * (cr - 128);
        g = y - 0.34414 * (cb - 128) - 0.71414 * (cr - 128);
        b = y + 1.772 * (cb - 128);

        array.data[index] = r;
        array.data[index + 1] = g;
        array.data[index + 2] = b;
        array.data[index + 3] = 0xff;
        index += 4;

        posY += stepPos;
        posCB += stepPos;
        posCR += stepPos;
    }
};
