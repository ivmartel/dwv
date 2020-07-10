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

    var sliceRange = image.getSliceIterator(position.k);
    var frameOrSliceIndex = (frame) ? frame : position.k;
    var frameBuffer = image.getFrame(frameOrSliceIndex);
    var arrayBuffer = new Uint32Array(array.data.buffer);

    var index = 0;
    var ival = sliceRange.next();
    while (!ival.done) {
        // store data
        arrayBuffer[index] = 0xff000000 |
            (frameBuffer[ival.value2] << 16) |
            (frameBuffer[ival.value1] << 8) |
            frameBuffer[ival.value] ;

        // increment
        index += 1;
        ival = sliceRange.next();
    }
};
