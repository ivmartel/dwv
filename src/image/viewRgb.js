// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Generate image data for 'RGB' photometric interpretation.
 * @param {Array} array The array to store the outut data
 * @param {Object} image The image to generate the view from.
 * @param {Object} position The position at witch to generate the view.
 * @param {number} frame The frame number at witch to generate the view.
 */
dwv.image.generateImageDataRgb = function (
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
    // default: RGBRGBRGBRGB...
    var posR = startOffset;
    var posG = startOffset + 1;
    var posB = startOffset + 2;
    var stepPos = 3;
    // RRRR...GGGG...BBBB...
    if (planarConfig === 1) {
        posR = startOffset;
        posG = startOffset + sliceSize;
        posB = startOffset + 2 * sliceSize;
        stepPos = 1;
    }

    var index = 0;
    for (var i = 0; i < sliceSize; ++i) {
        array.data[index] = image.getValueAtOffset(posR, frame);
        array.data[index + 1] = image.getValueAtOffset(posG, frame);
        array.data[index + 2] = image.getValueAtOffset(posB, frame);
        array.data[index + 3] = 0xff;
        index += 4;

        posR += stepPos;
        posG += stepPos;
        posB += stepPos;
    }
};
