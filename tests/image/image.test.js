/**
 * Tests for the 'image/image.js' file.
 */
$(document).ready(function(){
    test("Test Image.", function() {
        // create an image
        var size = 4;
        var imgSize = new dwv.image.ImageSize(size, size, 1);
        var imgSpacing = new dwv.image.ImageSpacing(1, 1, 1);
        var buffer = [];
        for(var i=0; i<size*size; ++i) buffer[i] = i;
        var image0 = new dwv.image.Image(imgSize, imgSpacing, buffer);
        // TODO: could be done by default
        image0.setIdRescaleLut();
        // test its values
        equal( image0.getValue(0, 0, 0), 0, "Value at 0,0,0" );
        equal( image0.getValue(1, 0, 0), 1, "Value at 1,0,0" );
        equal( image0.getValue(1, 1, 0), 1*size + 1, "Value at 1,1,0" );
        // TODO: wrong...
        equal( image0.getValue(5, 0, 0), 1*size + 1, "Value at 5,0,0" );
        equal( image0.getValue(3, 3, 0), 3*size + 3, "Value at 3,3,0" );
        equal( image0.getValue(4, 3, 0), undefined, "Value outside" );
    });

});
