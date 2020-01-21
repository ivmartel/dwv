/**
 * Tests for the 'image/image.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module("image");

/**
 * Compare an image and a buffer.
 * @param {Object} image The input image.
 * @param {Object} size The size of the input buffer.
 * @param {Array} buffer The input buffer.
 * @param {Object} rsi The rescale slope of the input buffer.
 * @return {Object} Statistics of the value and rescaled value differences.
 */
dwv.utils.test.CompareImageAndBuffer = function ( image, size, buffer, rsi ) {
    var diffs = [];
    var diffsRescaled = [];

    // calculate differences
    var index = 0;
    for ( var k = 0; k < size.getNumberOfSlices(); ++k ) {
        for ( var j = 0; j < size.getNumberOfRows(); ++j ) {
            for ( var i = 0; i < size.getNumberOfColumns(); ++i ) {
                var diff = Math.abs( image.getValue(i,j,k) - buffer[index] );
                if ( diff !== 0 ) {
                    diffs.push( diff );
                }
                var diffRescaled = Math.abs(
                    image.getRescaledValue(i,j,k) - rsi.apply(buffer[index]) );
                if ( diffRescaled !== 0 ) {
                    diffsRescaled.push( diffRescaled );
                }
                ++index;
            }
        }
    }

    // calculate stats if necessary
    var statsDiff = new dwv.math.Stats(0,0,0,0);
    if ( diffs.length !== 0 ) {
        statsDiff = dwv.math.getStats(diffs);
    }
    var statsDiffRescaled = new dwv.math.Stats(0,0,0,0);
    if ( diffsRescaled.length !== 0 ) {
        statsDiffRescaled = dwv.math.getStats(diffsRescaled);
    }

    // return stats
    return {
        'valuesStats': statsDiff,
        'rescaledStats': statsDiffRescaled
    };
};

/**
 * Tests for {@link dwv.image.Image} getValue.
 * @function module:tests/image~getvalue
 */
QUnit.test("Test Image getValue.", function (assert) {
    var zeroStats = new dwv.math.Stats(0,0,0,0);

    // create a simple image
    var size0 = 4;
    var imgSize0 = new dwv.image.Size(size0, size0, 1);
    var imgSpacing0 = new dwv.image.Spacing(1, 1, 1);
    var imgOrigin0 = new dwv.math.Point3D(0,0,0);
    var imgGeometry0 = new dwv.image.Geometry(imgOrigin0, imgSize0, imgSpacing0);
    var buffer0 = [];
    for(var i=0; i<size0*size0; ++i) {
        buffer0[i] = i;
    }
    var image0 = new dwv.image.Image(imgGeometry0, [buffer0]);
    // test its geometry
    assert.equal( image0.getGeometry(), imgGeometry0, "Image geometry" );
    // test its values
    var rsi0 = new dwv.image.RescaleSlopeAndIntercept(1, 0);
    var res0 = dwv.utils.test.CompareImageAndBuffer( image0, imgSize0, buffer0, rsi0 );
    assert.propEqual( res0.valuesStats.asObject(), zeroStats.asObject(), "Values should be equal" );
    assert.propEqual( res0.rescaledStats.asObject(), zeroStats.asObject(), "Rescaled values should be equal" );
    // outside value
    assert.equal( isNaN(image0.getValue(4, 3, 0)), true, "Value outside is NaN" );
    // TODO: wrong, should not be accessed
    assert.equal( image0.getValue(5, 0, 0), 1*size0 + 1, "Value at 5,0,0" );

    // image with rescale
    var image1 = new dwv.image.Image(imgGeometry0, [buffer0]);
    var slope1 = 2;
    var intercept1 = 10;
    var rsi1 = new dwv.image.RescaleSlopeAndIntercept(slope1, intercept1);
    image1.setRescaleSlopeAndIntercept(rsi1);
    // test its geometry
    assert.equal( image1.getGeometry(), imgGeometry0, "Image geometry" );
    // test its values
    var res1 = dwv.utils.test.CompareImageAndBuffer( image1, imgSize0, buffer0, rsi1 );
    assert.propEqual( res1.valuesStats.asObject(), zeroStats.asObject(), "Values should be equal" );
    assert.propEqual( res1.rescaledStats.asObject(), zeroStats.asObject(), "Rescaled values should be equal" );
});

/**
 * Tests for {@link dwv.image.Image} histogram.
 * @function module:tests/image~histogram
 */
QUnit.test("Test Image histogram.", function (assert) {
    // create a simple image
    var size0 = 4;
    var imgSize0 = new dwv.image.Size(size0, size0, 1);
    var imgSpacing0 = new dwv.image.Spacing(1, 1, 1);
    var imgOrigin0 = new dwv.math.Point3D(0,0,0);
    var imgGeometry0 = new dwv.image.Geometry(imgOrigin0, imgSize0, imgSpacing0);
    var buffer0 = [];
    for(var i=0; i<size0*size0; ++i) {
        buffer0[i] = i;
    }
    var image0 = new dwv.image.Image(imgGeometry0, [buffer0]);

    // histogram
    var histogram = image0.getHistogram();
    assert.equal( histogram.length, size0*size0, "histogram size" );
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
    assert.equal( histoContentTest, true, "histogram content" );
});

/**
 * Tests for {@link dwv.image.Image} append.
 * @function module:tests/image~append
 */
QUnit.test("Test Image append slice.", function (assert) {
    var size = 4;
    var imgSize = new dwv.image.Size(size, size, 2);
    var imgSizeMinusOne = new dwv.image.Size(size, size, 1);
    var imgSpacing = new dwv.image.Spacing(1, 1, 1);
    var imgOrigin = new dwv.math.Point3D(0,0,0);
    var imgGeometry0 = new dwv.image.Geometry(imgOrigin, imgSizeMinusOne, imgSpacing);
    imgGeometry0.appendOrigin(new dwv.math.Point3D(0,0,1), 1);

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
    var image0 = new dwv.image.Image(imgGeometry0, [buffer], 1, ["0"]);
    // append null
    assert.throws( function () {
            image0.appendSlice(null);
        }, new Error("Cannot append null slice"), "append null slice");
    // real slice
    var sliceOrigin = new dwv.math.Point3D(0,0,-1);
    var sliceGeometry = new dwv.image.Geometry(sliceOrigin, sliceSize, imgSpacing);
    var slice0 = new dwv.image.Image(sliceGeometry, [sliceBuffer], 1, ["1"]);
    // append slice before
    image0.appendSlice(slice0);
    // test its values
    assert.equal( image0.getValue(0, 0, 0), 2, "Value at 0,0,0 (append before)" );
    assert.equal( image0.getValue(3, 3, 0), 2, "Value at 3,3,0 (append before)" );
    assert.equal( image0.getValue(0, 0, 1), 0, "Value at 0,0,1 (append before)" );
    assert.equal( image0.getValue(3, 3, 1), 0, "Value at 3,3,1 (append before)" );
    assert.equal( image0.getValue(0, 0, 2), 1, "Value at 0,0,2 (append before)" );
    assert.equal( image0.getValue(3, 3, 2), 1, "Value at 3,3,2 (append before)" );
    // test its positions
    var sliceOrigins0 = [];
    sliceOrigins0[0] = new dwv.math.Point3D(0,0,-1);
    sliceOrigins0[1] = new dwv.math.Point3D(0,0,0);
    sliceOrigins0[2] = new dwv.math.Point3D(0,0,1);
    assert.deepEqual( imgGeometry0.getOrigins(), sliceOrigins0, "Slice positions (append before)" );

    // image 1
    var imgGeometry1 = new dwv.image.Geometry(imgOrigin, imgSizeMinusOne, imgSpacing);
    imgGeometry1.appendOrigin(new dwv.math.Point3D(0,0,1), 1);
    var image1 = new dwv.image.Image(imgGeometry1, [buffer], 1, ["0"]);
    var sliceOrigin1 = new dwv.math.Point3D(0,0,2);
    var sliceGeometry1 = new dwv.image.Geometry(sliceOrigin1, sliceSize, imgSpacing);
    var slice1 = new dwv.image.Image(sliceGeometry1, [sliceBuffer], 1, ["0"]);
    // append slice before
    image1.appendSlice(slice1);
    // test its values
    assert.equal( image1.getValue(0, 0, 0), 0, "Value at 0,0,0 (append after)" );
    assert.equal( image1.getValue(3, 3, 0), 0, "Value at 3,3,0 (append after)" );
    assert.equal( image1.getValue(0, 0, 1), 1, "Value at 0,0,1 (append after)" );
    assert.equal( image1.getValue(3, 3, 1), 1, "Value at 3,3,1 (append after)" );
    assert.equal( image1.getValue(0, 0, 2), 2, "Value at 0,0,2 (append after)" );
    assert.equal( image1.getValue(3, 3, 2), 2, "Value at 3,3,2 (append after)" );
    // test its positions
    var sliceOrigins1 = [];
    sliceOrigins1[0] = new dwv.math.Point3D(0,0,0);
    sliceOrigins1[1] = new dwv.math.Point3D(0,0,1);
    sliceOrigins1[2] = new dwv.math.Point3D(0,0,2);
    assert.deepEqual( imgGeometry1.getOrigins(), sliceOrigins1, "Slice positions (append after)" );

    // image 2
    var imgGeometry2 = new dwv.image.Geometry(imgOrigin, imgSizeMinusOne, imgSpacing);
    imgGeometry2.appendOrigin(new dwv.math.Point3D(0,0,1), 1);
    var image2 = new dwv.image.Image(imgGeometry2, [buffer], 1, ["0"]);
    var sliceOrigin2 = new dwv.math.Point3D(0,0,0.4);
    var sliceGeometry2 = new dwv.image.Geometry(sliceOrigin2, sliceSize, imgSpacing);
    var slice2 = new dwv.image.Image(sliceGeometry2, [sliceBuffer], 1, ["0"]);
    // append slice before
    image2.appendSlice(slice2);
    // test its values
    assert.equal( image2.getValue(0, 0, 0), 0, "Value at 0,0,0 (append between)" );
    assert.equal( image2.getValue(3, 3, 0), 0, "Value at 3,3,0 (append between)" );
    assert.equal( image2.getValue(0, 0, 1), 2, "Value at 0,0,1 (append between)" );
    assert.equal( image2.getValue(3, 3, 1), 2, "Value at 3,3,1 (append between)" );
    assert.equal( image2.getValue(0, 0, 2), 1, "Value at 0,0,2 (append between)" );
    assert.equal( image2.getValue(3, 3, 2), 1, "Value at 3,3,2 (append between)" );
    // test its positions
    var sliceOrigins2 = [];
    sliceOrigins2[0] = new dwv.math.Point3D(0,0,0);
    sliceOrigins2[1] = new dwv.math.Point3D(0,0,0.4);
    sliceOrigins2[2] = new dwv.math.Point3D(0,0,1);
    assert.deepEqual( imgGeometry2.getOrigins(), sliceOrigins2, "Slice positions (append between)" );
});

/**
 * Tests for {@link dwv.image.Image} convolute2D.
 * @function module:tests/image~convolute2D
 */
QUnit.test("Test Image convolute2D.", function (assert) {
    // create a simple image
    var size0 = 3;
    var imgSize0 = new dwv.image.Size(size0, size0, 1);
    var imgSpacing0 = new dwv.image.Spacing(1, 1, 1);
    var imgOrigin0 = new dwv.math.Point3D(0,0,0);
    var imgGeometry0 = new dwv.image.Geometry(imgOrigin0, imgSize0, imgSpacing0);
    var buffer0 = [];
    for ( var i = 0; i < size0*size0; ++i ) {
        buffer0[i] = i;
    }
    var image0 = new dwv.image.Image(imgGeometry0, [buffer0]);
    // id convolution
    var weights0 = [ 0, 0, 0, 0, 1, 0, 0, 0, 0 ];
    var resImage0 = image0.convolute2D( weights0 );
    var testContent0 = true;
    for ( i = 0; i < size0*size0; ++i) {
        if ( image0.getValueAtOffset(i,0) !== resImage0.getValueAtOffset(i,0) ) {
            testContent0 = false;
            break;
        }
    }
    assert.equal( testContent0, true, "convolute2D id" );
    // blur convolution
    var weights1 = [ 1, 1, 1, 1, 1, 1, 1, 1, 1 ];
    var resImage1 = image0.convolute2D( weights1 );
    var theoResImage1 = [ 12, 18, 24, 30, 36, 42, 48, 54, 60 ];
    var testContent1 = true;
    for ( i = 0; i < size0*size0; ++i ) {
        if ( theoResImage1[i] !== resImage1.getValueAtOffset(i,0) ) {
            testContent1 = false;
            break;
        }
    }
    assert.equal( testContent1, true, "convolute2D blur" );
});

/**
 * Tests for {@link dwv.image.Image} transform.
 * @function module:tests/image~transform
 */
QUnit.test("Test Image transform.", function (assert) {
    // create a simple image
    var size0 = 3;
    var imgSize0 = new dwv.image.Size(size0, size0, 1);
    var imgSpacing0 = new dwv.image.Spacing(1, 1, 1);
    var imgOrigin0 = new dwv.math.Point3D(0,0,0);
    var imgGeometry0 = new dwv.image.Geometry(imgOrigin0, imgSize0, imgSpacing0);
    var buffer0 = [];
    for ( var i = 0; i < size0*size0; ++i ) {
        buffer0[i] = i;
    }
    var image0 = new dwv.image.Image(imgGeometry0, [buffer0]);

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
        if ( theoResImage0[i] !== resImage0.getValueAtOffset(i,0) ) {
            testContent0 = false;
            break;
        }
    }
    assert.equal( testContent0, true, "transform threshold" );

    // new image
    image0 = new dwv.image.Image(imgGeometry0, [buffer0]);

    // multiply function
    var func1 = function ( value ) {
        return value * 2;
    };
    var resImage1 = image0.transform( func1 );
    var theoResImage1 = [ 0, 2, 4, 6, 8, 10, 12, 14, 16 ];
    var testContent1 = true;
    for ( i = 0; i < size0*size0; ++i) {
        if ( theoResImage1[i] !== resImage1.getValueAtOffset(i,0) ) {
            testContent1 = false;
            break;
        }
    }
    assert.equal( testContent1, true, "transform multiply" );
});

/**
 * Tests for {@link dwv.image.Image} compose.
 * @function module:tests/image~compose
 */
QUnit.test("Test Image compose.", function (assert) {
    // create two simple images
    var size0 = 3;
    var imgSize0 = new dwv.image.Size(size0, size0, 1);
    var imgSpacing0 = new dwv.image.Spacing(1, 1, 1);
    var imgOrigin0 = new dwv.math.Point3D(0,0,0);
    var imgGeometry0 = new dwv.image.Geometry(imgOrigin0, imgSize0, imgSpacing0);
    var buffer0 = [];
    for ( var i = 0; i < size0*size0; ++i ) {
        buffer0[i] = i;
    }
    var image0 = new dwv.image.Image(imgGeometry0, [buffer0]);
    var buffer1 = [];
    for ( i = 0; i < size0*size0; ++i ) {
        buffer1[i] = i;
    }
    var image1 = new dwv.image.Image(imgGeometry0, [buffer1]);

    // addition function
    var func0 = function ( a, b ) {
        return a + b;
    };
    var resImage0 = image0.compose( image1, func0 );
    var theoResImage0 = [ 0, 2, 4, 6, 8, 10, 12, 14, 16 ];
    var testContent0 = true;
    for ( i = 0; i < size0*size0; ++i) {
        if ( theoResImage0[i] !== resImage0.getValueAtOffset(i,0) ) {
            testContent0 = false;
            break;
        }
    }
    assert.equal( testContent0, true, "compose addition" );
});

/**
 * Tests for {@link dwv.image.ImageFactory}.
 * @function module:tests/imageFactory
 */
QUnit.test("Test ImageFactory.", function (assert) {
    var zeroStats = new dwv.math.Stats(0,0,0,0);

    var size0 = 3;
    var imgSize0 = new dwv.image.Size(size0, size0, 1);
    var imgSpacing0 = new dwv.image.Spacing(1, 1, 1);
    var imgOrigin0 = new dwv.math.Point3D(0,0,0);
    var imgGeometry0 = new dwv.image.Geometry(imgOrigin0, imgSize0, imgSpacing0);
    var buffer0 = [];
    for ( var i = 0; i < size0*size0; ++i ) {
        buffer0[i] = i;
    }
    var rsi0 = new dwv.image.RescaleSlopeAndIntercept(1, 0);

    var dicomElements0 = [];
    // columns
    dicomElements0.x00280011 = { 'value': imgSize0.getNumberOfColumns() };
    // rows
    dicomElements0.x00280010 = { 'value': imgSize0.getNumberOfRows() };
    // spacing
    dicomElements0.x00280030 = { 'value': [imgSpacing0.getRowSpacing(), imgSpacing0.getColumnSpacing()] };
    // transfer syntax (explicit VR)
    dicomElements0.x00020010 = { 'value': '1.2.840.10008.1.2.1' };

    // wrap the dicom elements
    var wrappedDicomElements0 = new dwv.dicom.DicomElementsWrapper(dicomElements0);
    // create the image factory
    var factory0 = new dwv.image.ImageFactory();
    // create the image
    var image0 = factory0.create( wrappedDicomElements0, [buffer0] );

    // test its geometry
    assert.ok( image0.getGeometry().equals(imgGeometry0), "Image geometry" );
    // test its values
    var res0 = dwv.utils.test.CompareImageAndBuffer( image0, imgSize0, buffer0, rsi0 );
    assert.propEqual( res0.valuesStats.asObject(), zeroStats.asObject(), "Values should be equal" );
    assert.propEqual( res0.rescaledStats.asObject(), zeroStats.asObject(), "Rescaled values should be equal" );
});
