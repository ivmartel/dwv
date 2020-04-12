// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Generate image data for 'PALETTE COLOR' photometric interpretation.
 * @param {Array} array The array to store the outut data
 * @param {Object} image The image to generate the view from.
 * @param {Object} position The position at witch to generate the view.
 * @param {number} frame The frame number at witch to generate the view.
 * @param {Object} colourMap The colour map.
 */
dwv.image.generateImageDataPaletteColor = function (
    array, image, position, frame,
    colourMap) {

    var sliceSize = image.getGeometry().getSize().getSliceSize();
    var startOffset = sliceSize * position.k;

    var to8 = function (value) {
        return value >> 8;
    };

    if (image.getMeta().BitsStored === 16) {
        console.log("Scaling 16bits data to 8bits.");
    }

    var index = 0;
    var pxValue = 0;
    var iMax = startOffset + sliceSize;
    for (var i = startOffset; i < iMax; ++i) {
        // pixel value
        pxValue = image.getValueAtOffset(i, frame);
        // store
        // TODO check pxValue fits in lut
        if (image.getMeta().BitsStored === 16) {
            array.data[index] = to8(colourMap.red[pxValue]);
            array.data[index + 1] = to8(colourMap.green[pxValue]);
            array.data[index + 2] = to8(colourMap.blue[pxValue]);
        } else {
            array.data[index] = colourMap.red[pxValue];
            array.data[index + 1] = colourMap.green[pxValue];
            array.data[index + 2] = colourMap.blue[pxValue];
        }
        array.data[index + 3] = 0xff;
        index += 4;
    }
};
