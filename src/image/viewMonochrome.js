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
    windowLut, colourMap) {

    var sliceRange = image.getSliceIterator(position.k);

    var index = 0;
    var pxValue = 0;
    var ival = sliceRange.next();
    while (!ival.done) {
        // pixel value
        pxValue = windowLut.getValue(image.getValueAtOffset(ival.value, frame));
        // store data
        array.data[index] = colourMap.red[pxValue];
        array.data[index + 1] = colourMap.green[pxValue];
        array.data[index + 2] = colourMap.blue[pxValue];
        array.data[index + 3] = 0xff;
        // increment
        index += 4;
        ival = sliceRange.next();
    }
};
