// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Generate image data for 'MONOCHROME*' photometric interpretation.
 * @param {Array} array The array to store the outut data
 * @param {Object} image The image to generate the view from.
 * @param {Object} position The position at witch to generate the view.
 * @param {number} frame The frame number at witch to generate the view.
 * @param {Object} windowLut The window/level LUT.
 * @param {Object} colourMap The colour map.
 */
dwv.image.generateImageDataMonochrome = function (
    array, image, position, frame,
    windowLut, colourMap , frameIndex) {

    var sliceRange = image.getSliceIterator(position.k);
    var imageBuffer = image.getSlice(frameIndex, position.k);
    var arrayBuffer = new Uint32Array(array.data.buffer);

    var index = 0;
    var pxValue = 0;
    var ival = sliceRange.next();
    while (!ival.done) {
        // pixel value
        pxValue = windowLut.getValue(imageBuffer[index]);
        // store data
        arrayBuffer[index] = 0xff000000 |
            (colourMap.blue[pxValue] << 16) |
            (colourMap.green[pxValue] << 8) |
            colourMap.red[pxValue];
        // increment
        index += 1;
        ival = sliceRange.next();
    }
};
