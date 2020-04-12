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

    var sliceSize = image.getGeometry().getSize().getSliceSize();
    var startOffset = sliceSize * position.k;

    var index = 0;
    var pxValue = 0;
    var iMax = startOffset + sliceSize;
    for (var i = startOffset; i < iMax; ++i) {
        // pixel value
        pxValue = windowLut.getValue(image.getValueAtOffset(i, frame));
        // store
        array.data[index] = colourMap.red[pxValue];
        array.data[index + 1] = colourMap.green[pxValue];
        array.data[index + 2] = colourMap.blue[pxValue];
        array.data[index + 3] = 0xff;
        index += 4;
    }
};
