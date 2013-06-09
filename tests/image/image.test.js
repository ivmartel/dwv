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
        // listener
        var listener1 = function(event){
            equal( event.wc, 0, "Expected call to listener1.");
        };
        var listener2 = function(event){
            equal( event.ww, 1, "Expected call to listener2.");
        };
        // with two listeners
        image0.addEventListener("wlchange", listener1 );
        image0.addEventListener("wlchange", listener2 );
        image0.setWindowLevel(0,1);
        // without listener2
        image0.removeEventListener("wlchange", listener2 );
        image0.setWindowLevel(0,2);
        // without listener1
        image0.removeEventListener("wlchange", listener1 );
        image0.setWindowLevel(1,1);
    });

});
