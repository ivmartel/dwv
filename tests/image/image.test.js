/**
 * Tests for the 'image/image.js' file.
 */
// Do not warn if these variables were not defined before.
/* global module, test, equal, deepEqual */
module("image");

test("Test Size.", function() {
    var size0 = new dwv.image.Size(2, 3, 4);
    // test its values
    equal( size0.getNumberOfColumns(), 2, "getNumberOfColumns" );
    equal( size0.getNumberOfRows(), 3, "getNumberOfRows" );
    equal( size0.getNumberOfSlices(), 4, "getNumberOfSlices" );
    equal( size0.getSliceSize(), 6, "getSliceSize" );
    equal( size0.getTotalSize(), 24, "getTotalSize" );
    // equality
    equal( size0.equals(size0), 1, "equals self true" );
    var size1 = new dwv.image.Size(2, 3, 4);
    equal( size0.equals(size1), 1, "equals true" );
    var size2 = new dwv.image.Size(3, 3, 4);
    equal( size0.equals(size2), 0, "equals false" );
    // is in bounds
    equal( size0.isInBounds(0,0,0), 1, "isInBounds 0" );
    equal( size0.isInBounds(1,2,3), 1, "isInBounds max" );
    equal( size0.isInBounds(2,3,4), 0, "isInBounds too big" );
    equal( size0.isInBounds(-1,2,3), 0, "isInBounds too small" );
});

test("Test Spacing.", function() {
    var spacing0 = new dwv.image.Spacing(2, 3, 4);
    // test its values
    equal( spacing0.getColumnSpacing(), 2, "getColumnSpacing" );
    equal( spacing0.getRowSpacing(), 3, "getRowSpacing" );
    equal( spacing0.getSliceSpacing(), 4, "getSliceSpacing" );
    // equality
    equal( spacing0.equals(spacing0), 1, "equals self true" );
    var spacing1 = new dwv.image.Spacing(2, 3, 4);
    equal( spacing0.equals(spacing1), 1, "equals true" );
    var spacing2 = new dwv.image.Spacing(3, 3, 4);
    equal( spacing0.equals(spacing2), 0, "equals false" );
});

test("Test Image getValue.", function() {
    // create a simple image
    var size0 = 4;
    var imgSize0 = new dwv.image.Size(size0, size0, 1);
    var imgSpacing0 = new dwv.image.Spacing(1, 1, 1);
    var buffer0 = [];
    for(var i=0; i<size0*size0; ++i) {
        buffer0[i] = i;
    }
    var image0 = new dwv.image.Image(imgSize0, imgSpacing0, buffer0);
    // test its values
    equal( image0.getValue(0, 0, 0), 0, "Value at 0,0,0" );
    equal( image0.getValue(1, 0, 0), 1, "Value at 1,0,0" );
    equal( image0.getValue(1, 1, 0), 1*size0 + 1, "Value at 1,1,0" );
    equal( image0.getValue(3, 3, 0), 3*size0 + 3, "Value at 3,3,0" );
    equal( isNaN(image0.getValue(4, 3, 0)), true, "Value outside is NaN" );
    // TODO: wrong, should not be accessed
    equal( image0.getValue(5, 0, 0), 1*size0 + 1, "Value at 5,0,0" );
    // histogram
    var histogram = image0.getHistogram();
    equal( histogram.length, size0*size0, "histogram size" );
    var histoContentTest = true;
    for ( var j=0; j<size0*size0; ++j) {
        if ( histogram[j][0] !== j ) {
            histoContentTest = false;
            break;
        }
        if ( histogram[j][1] !== 1 ) {
            histoContentTest = false;
            break;
        }
    }
    equal( histoContentTest, true, "histogram content" );
    
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

test("Test Image append slice.", function (assert) {
    var size = 4;
    var imgSize = new dwv.image.Size(size, size, 2);
    var imgSpacing = new dwv.image.Spacing(1, 1, 1);

    // slice to append
    var sliceSize = new dwv.image.Size(size, size, 1);
    var sliceBuffer = new Int16Array(sliceSize.getTotalSize());
    for(var i=0; i<size*size; ++i) {
        sliceBuffer[i] = 2;
    }

    // image buffer
    var buffer = new Int16Array(imgSize.getTotalSize());
    for(var j=0; j<size*size; ++j) {
        buffer[j] = 0;
    }
    for(var k=size*size; k<2*size*size; ++k) {
        buffer[k] = 1;
    }
    
    // image 0
    var image0 = new dwv.image.Image(imgSize, imgSpacing, buffer, [[0,0,0],[0,0,1]]);
    // append null
    assert.throws( function () {
            image0.appendSlice(null);
        }, new Error("Cannot append null slice"), "append null slice");
    // real slice
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

test("Test Image convolute2D.", function() {
    // create a simple image
    var size0 = 3;
    var imgSize0 = new dwv.image.Size(size0, size0, 1);
    var imgSpacing0 = new dwv.image.Spacing(1, 1, 1);
    var buffer0 = [];
    for ( var i = 0; i < size0*size0; ++i ) {
        buffer0[i] = i;
    }
    var image0 = new dwv.image.Image(imgSize0, imgSpacing0, buffer0);
    // id convolution
    var weights0 = [ 0, 0, 0, 0, 1, 0, 0, 0, 0 ];
    var resImage0 = image0.convolute2D( weights0 );
    var testContent0 = true;
    for ( i = 0; i < size0*size0; ++i) {
        if ( image0.getValueAtOffset(i) !== resImage0.getValueAtOffset(i) ) {
            testContent0 = false;
            break;
        }
    }
    equal( testContent0, true, "convolute2D id" );
    // blur convolution
    var weights1 = [ 1, 1, 1, 1, 1, 1, 1, 1, 1 ];
    var resImage1 = image0.convolute2D( weights1 );
    var theoResImage1 = [ 12, 18, 24, 30, 36, 42, 48, 54, 60 ];
    var testContent1 = true;
    for ( i = 0; i < size0*size0; ++i ) {
        if ( theoResImage1[i] !== resImage1.getValueAtOffset(i) ) {
            console.log(i);
            testContent1 = false;
            break;
        }
    }
    equal( testContent1, true, "convolute2D blur" );
});

test("Test Image transform.", function() {
    // create a simple image
    var size0 = 3;
    var imgSize0 = new dwv.image.Size(size0, size0, 1);
    var imgSpacing0 = new dwv.image.Spacing(1, 1, 1);
    var buffer0 = [];
    for ( var i = 0; i < size0*size0; ++i ) {
        buffer0[i] = i;
    }
    var image0 = new dwv.image.Image(imgSize0, imgSpacing0, buffer0);
    
    // treshold function
    var func0 = function ( value ) {
        if ( value < 3 || value > 5 ) {
            return 0;
        }
        else {
            return value;
        }
    };
    var resImage0 = image0.transform( func0 );
    var theoResImage0 = [ 0, 0, 0, 3, 4, 5, 0, 0, 0 ];
    var testContent0 = true;
    for ( i = 0; i < size0*size0; ++i) {
        if ( theoResImage0[i] !== resImage0.getValueAtOffset(i) ) {
            testContent0 = false;
            break;
        }
    }
    equal( testContent0, true, "transform threshold" );
    
    // transform changes the calling image... reset it
    image0 = new dwv.image.Image(imgSize0, imgSpacing0, buffer0);
    
    // multiply function
    var func1 = function ( value ) {
        return value * 2;
    };
    var resImage1 = image0.transform( func1 );
    var theoResImage1 = [ 0, 2, 4, 6, 8, 10, 12, 14, 16 ];
    var testContent1 = true;
    for ( i = 0; i < size0*size0; ++i) {
        if ( theoResImage1[i] !== resImage1.getValueAtOffset(i) ) {
            testContent1 = false;
            break;
        }
    }
    equal( testContent1, true, "transform multiply" );
});
