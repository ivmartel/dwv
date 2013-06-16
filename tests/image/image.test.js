/**
 * Tests for the 'image/image.js' file.
 */
$(document).ready(function(){
    test("Test Image.", function() {
        // create a simple image
        var size0 = 4;
        var imgSize0 = new dwv.image.Size(size0, size0, 1);
        var imgSpacing0 = new dwv.image.Spacing(1, 1, 1);
        var buffer0 = [];
        for(var i=0; i<size0*size0; ++i) buffer0[i] = i;
        var image0 = new dwv.image.Image(imgSize0, imgSpacing0, buffer0);
        // test its values
        equal( image0.getValue(0, 0, 0), 0, "Value at 0,0,0" );
        equal( image0.getValue(1, 0, 0), 1, "Value at 1,0,0" );
        equal( image0.getValue(1, 1, 0), 1*size0 + 1, "Value at 1,1,0" );
        equal( image0.getValue(3, 3, 0), 3*size0 + 3, "Value at 3,3,0" );
        equal( isNaN(image0.getValue(4, 3, 0)), true, "Value outside is NaN" );
        // TODO: wrong, should not be accessed
        equal( image0.getValue(5, 0, 0), 1*size0 + 1, "Value at 5,0,0" );
        
        // image with rescale
        var image1 = new dwv.image.Image(imgSize0, imgSpacing0, buffer0);
        var slope1 = 2;
        image1.setRescaleSlope(slope1);
        var intercept1 = 10;
        image1.setRescaleIntercept(intercept1);
        // test its values
        equal( image1.getValue(0, 0, 0), 0, "Value at 0,0,0" );
        equal( image1.getValue(1, 0, 0), 1, "Value at 1,0,0" );
        equal( image1.getValue(1, 1, 0), 1*size0 + 1, "Value at 1,1,0" );
        equal( image1.getValue(3, 3, 0), 3*size0 + 3, "Value at 3,3,0" );
        equal( image1.getRescaledValue(0, 0, 0), 0+intercept1, "Value at 0,0,0" );
        equal( image1.getRescaledValue(1, 0, 0), 1*slope1+intercept1, "Value at 1,0,0" );
        equal( image1.getRescaledValue(1, 1, 0), (1*size0 + 1)*slope1+intercept1, "Value at 1,1,0" );
        equal( image1.getRescaledValue(3, 3, 0), (3*size0 + 3)*slope1+intercept1, "Value at 3,3,0" );
    });

});
