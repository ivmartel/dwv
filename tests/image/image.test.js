/**
 * Tests for the 'image/image.js' file.
 */
$(document).ready(function(){
    module("image");
    test("Test Image getValue.", function() {
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
    
    test("Test Image append slice.", function() {
        var size = 4;
        var imgSize = new dwv.image.Size(size, size, 2);
        var imgSpacing = new dwv.image.Spacing(1, 1, 1);

        // slice to append
        var sliceSize = new dwv.image.Size(size, size, 1);
        var sliceBuffer = new Int16Array(sliceSize.getTotalSize());
        for(var i=0; i<size*size; ++i) sliceBuffer[i] = 2;

        // image buffer
        var buffer = new Int16Array(imgSize.getTotalSize());
        for(var i=0; i<size*size; ++i) buffer[i] = 0;
        for(var i=size*size; i<2*size*size; ++i) buffer[i] = 1;
        
        // image 0
        var image0 = new dwv.image.Image(imgSize, imgSpacing, buffer, [[0,0,0],[0,0,1]]);
        var slice0 = new dwv.image.Image(sliceSize, imgSpacing, sliceBuffer, [[0,0,-1]]);
        // append slice before
        image0.appendSlice(slice0);
        // test its values
        equal( image0.getValue(0, 0, 0), 2, "Value at 0,0,0 (append before)" );
        equal( image0.getValue(3, 3, 0), 2, "Value at 3,3,0 (append before)" );
        equal( image0.getValue(0, 0, 1), 0, "Value at 0,0,1 (append before)" );
        equal( image0.getValue(3, 3, 1), 0, "Value at 3,3,1 (append before)" );
        equal( image0.getValue(0, 0, 2), 1, "Value at 0,0,2 (append before)" );
        equal( image0.getValue(3, 3, 2), 1, "Value at 3,3,2 (append before)" );
        // test its positions
        var slicePositions0 = [];
        slicePositions0[0] = [0,0,-1];
        slicePositions0[1] = [0,0,0];
        slicePositions0[2] = [0,0,1];
        deepEqual( image0.getSlicePositions(), slicePositions0, "Slice positions (append before)" );
        
        // image 1
        var image1 = new dwv.image.Image(imgSize, imgSpacing, buffer, [[0,0,0],[0,0,1]]);
        var slice1 = new dwv.image.Image(sliceSize, imgSpacing, sliceBuffer, [[0,0,2]]);
        // append slice before
        image1.appendSlice(slice1);
        // test its values
        equal( image1.getValue(0, 0, 0), 0, "Value at 0,0,0 (append after)" );
        equal( image1.getValue(3, 3, 0), 0, "Value at 3,3,0 (append after)" );
        equal( image1.getValue(0, 0, 1), 1, "Value at 0,0,1 (append after)" );
        equal( image1.getValue(3, 3, 1), 1, "Value at 3,3,1 (append after)" );
        equal( image1.getValue(0, 0, 2), 2, "Value at 0,0,2 (append after)" );
        equal( image1.getValue(3, 3, 2), 2, "Value at 3,3,2 (append after)" );
        // test its positions
        var slicePositions1 = [];
        slicePositions1[0] = [0,0,0];
        slicePositions1[1] = [0,0,1];
        slicePositions1[2] = [0,0,2];
        deepEqual( image1.getSlicePositions(), slicePositions1, "Slice positions (append after)" );

        // image 2
        var image2 = new dwv.image.Image(imgSize, imgSpacing, buffer, [[0,0,0],[0,0,1]]);
        var slice2 = new dwv.image.Image(sliceSize, imgSpacing, sliceBuffer, [[0,0,0.4]]);
        // append slice before
        image2.appendSlice(slice2);
        // test its values
        equal( image2.getValue(0, 0, 0), 0, "Value at 0,0,0 (append between)" );
        equal( image2.getValue(3, 3, 0), 0, "Value at 3,3,0 (append between)" );
        equal( image2.getValue(0, 0, 1), 2, "Value at 0,0,1 (append between)" );
        equal( image2.getValue(3, 3, 1), 2, "Value at 3,3,1 (append between)" );
        equal( image2.getValue(0, 0, 2), 1, "Value at 0,0,2 (append between)" );
        equal( image2.getValue(3, 3, 2), 1, "Value at 3,3,2 (append between)" );
        // test its positions
        var slicePositions2 = [];
        slicePositions2[0] = [0,0,0];
        slicePositions2[1] = [0,0,0.4];
        slicePositions2[2] = [0,0,1];
        deepEqual( image2.getSlicePositions(), slicePositions2, "Slice positions (append between)" );

    });

});
