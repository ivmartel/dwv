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
    array, image, position, frame, windowLut, frameIndex) {

    var sliceRange = image.getSliceIterator(position.k);
    var imageBuffer = image.getSlice(frameIndex, position.k);
    var arrayBuffer = new Uint32Array(array.data.buffer);

    var index = 0;
    var ival = sliceRange.next();
    while (!ival.done) {
        // store data
        arrayBuffer[index] = 0xff000000 |
            (imageBuffer[ival.value] << 16) |
            (imageBuffer[ival.value1] << 8) |
            imageBuffer[ival.value] ;

        // increment
        index += 1;
        ival = sliceRange.next();
    }
};
