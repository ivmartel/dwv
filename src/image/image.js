// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.image = dwv.image || {};

/**
 * Image class.
 * Usable once created, optional are:
 * - rescale slope and intercept (default 1:0),
 * - photometric interpretation (default MONOCHROME2),
 * - planar configuration (default RGBRGB...).
 * @constructor
 * @param {Object} geometry The geometry of the image.
 * @param {Array} buffer The image data as an array of frame buffers.
 * @param {Number} numberOfFrames The number of frames (optional, can be used
     to anticipate the final number after appends).
 * @param {Array} imageUids An array of Uids indexed to slice number.
 */
dwv.image.Image = function(geometry, buffer, numberOfFrames, imageUids)
{
    // use buffer length in not specified
    if (typeof numberOfFrames === "undefined") {
        numberOfFrames = buffer.length;
    }

    /**
     * Get the number of frames.
     * @returns {Number} The number of frames.
     */
    this.getNumberOfFrames = function () {
        return numberOfFrames;
    };

    /**
     * Rescale slope and intercept.
     * @private
     * @type Number
     */
    var rsis = [];
    // initialise RSIs
    for ( var s = 0, nslices = geometry.getSize().getNumberOfSlices(); s < nslices; ++s ) {
        rsis.push( new dwv.image.RescaleSlopeAndIntercept( 1, 0 ) );
    }
    /**
     * Flag to know if the RSIs are all identity (1,0).
     * @private
     * @type Boolean
     */
    var isIdentityRSI = true;
    /**
     * Flag to know if the RSIs are all equals.
     * @private
     * @type Boolean
     */
    var isConstantRSI = true;
    /**
     * Photometric interpretation (MONOCHROME, RGB...).
     * @private
     * @type String
     */
    var photometricInterpretation = "MONOCHROME2";
    /**
     * Planar configuration for RGB data (0:RGBRGBRGBRGB... or 1:RRR...GGG...BBB...).
     * @private
     * @type Number
     */
    var planarConfiguration = 0;
    /**
     * Number of components.
     * @private
     * @type Number
     */
    var numberOfComponents = buffer[0].length / (
        geometry.getSize().getTotalSize() );
    /**
     * Meta information.
     * @private
     * @type Object
     */
    var meta = {};

    /**
     * Data range.
     * @private
     * @type Object
     */
    var dataRange = null;
    /**
     * Rescaled data range.
     * @private
     * @type Object
     */
    var rescaledDataRange = null;
    /**
     * Histogram.
     * @private
     * @type Array
     */
    var histogram = null;

    /**
     * Get the image UIDs indexed by slice number.
     * @return {Array} The UIDs array.
     */
    this.getImageUids = function () {
        return imageUids;
    };

    /**
     * Get the geometry of the image.
     * @return {Object} The size of the image.
     */
    this.getGeometry = function() { return geometry; };

    /**
     * Get the data buffer of the image.
     * @todo dangerous...
     * @return {Array} The data buffer of the image.
     */
    this.getBuffer = function() { return buffer; };
    /**
     * Get the data buffer of the image.
     * @todo dangerous...
     * @return {Array} The data buffer of the frame.
     */
    this.getFrame = function (frame) { return buffer[frame]; };

    /**
     * Get the data buffer of the image.
     * @return {Array} The data buffer of the slice.
     */
    this.getSlice = function (frame, slice) { return buffer[frame][slice]; };

    /**
     * Get the rescale slope and intercept.
     * @param {Number} k The slice index.
     * @return {Object} The rescale slope and intercept.
     */
    this.getRescaleSlopeAndIntercept = function(k) { return rsis[k]; };
    /**
     * Set the rescale slope and intercept.
     * @param {Array} inRsi The input rescale slope and intercept.
     * @param {Number} k The slice index (optional).
     */
    this.setRescaleSlopeAndIntercept = function(inRsi, k) {
        if ( typeof k === 'undefined' ) {
            k = 0;
        }
        rsis[k] = inRsi;

        // update RSI flags
        isIdentityRSI = true;
        isConstantRSI = true;
        for ( var s = 0, lens = rsis.length; s < lens; ++s ) {
            if (!rsis[s].isID()) {
                isIdentityRSI = false;
            }
            if (s > 0 && !rsis[s].equals(rsis[s-1])) {
                isConstantRSI = false;
            }
        }
    };
    /**
     * Are all the RSIs identity (1,0).
     * @return {Boolean} True if they are.
     */
    this.isIdentityRSI = function () { return isIdentityRSI; };
    /**
     * Are all the RSIs equal.
     * @return {Boolean} True if they are.
     */
    this.isConstantRSI = function () { return isConstantRSI; };
    /**
     * Get the photometricInterpretation of the image.
     * @return {String} The photometricInterpretation of the image.
     */
    this.getPhotometricInterpretation = function() { return photometricInterpretation; };
    /**
     * Set the photometricInterpretation of the image.
     * @pqrqm {String} interp The photometricInterpretation of the image.
     */
    this.setPhotometricInterpretation = function(interp) { photometricInterpretation = interp; };
    /**
     * Get the planarConfiguration of the image.
     * @return {Number} The planarConfiguration of the image.
     */
    this.getPlanarConfiguration = function() { return planarConfiguration; };
    /**
     * Set the planarConfiguration of the image.
     * @param {Number} config The planarConfiguration of the image.
     */
    this.setPlanarConfiguration = function(config) { planarConfiguration = config; };
    /**
     * Get the numberOfComponents of the image.
     * @return {Number} The numberOfComponents of the image.
     */
    this.getNumberOfComponents = function() { return numberOfComponents; };

    /**
     * Get the meta information of the image.
     * @return {Object} The meta information of the image.
     */
    this.getMeta = function() { return meta; };
    /**
     * Set the meta information of the image.
     * @param {Object} rhs The meta information of the image.
     */
    this.setMeta = function(rhs) { meta = rhs; };

    /**
     * Get value at offset. Warning: No size check...
     * @param {Number} offset The desired offset.
     * @param {Number} frame The desired frame.
     * @return {Number} The value at offset.
     */
    this.getValueAtOffset = function (offset, frame) {
        return buffer[frame][offset];
    };

    /**
     * Clone the image.
     * @return {Image} A clone of this image.
     */
    this.clone = function()
    {
        // clone the image buffer
        var clonedBuffer = [];
        for (var index = 0; index < buffer.length; ++index) {
            clonedBuffer[index] = buffer[index].slice(0);
        }
        // create the image copy
        var copy = new dwv.image.Image(this.getGeometry(), clonedBuffer);
        // copy the RSIs
        var nslices = this.getGeometry().getSize().getNumberOfSlices();
        for ( var k = 0; k < nslices; ++k ) {
            copy.setRescaleSlopeAndIntercept(this.getRescaleSlopeAndIntercept(k), k);
        }
        // copy extras
        copy.setPhotometricInterpretation(this.getPhotometricInterpretation());
        copy.setPlanarConfiguration(this.getPlanarConfiguration());
        copy.setMeta(this.getMeta());
        // return
        return copy;
    };

    /**
     * Append a slice to the image.
     * @param {Image} The slice to append.
     * @return {Number} The number of the inserted slice.
     */
    this.appendSlice = function (rhs)
    {
        // check input
        if( rhs === null ) {
            throw new Error("Cannot append null slice");
        }
        var rhsSize = rhs.getGeometry().getSize();
        var size = geometry.getSize();
        if( rhsSize.getNumberOfSlices() !== 1 ) {
            throw new Error("Cannot append more than one slice");
        }
        if( size.getNumberOfColumns() !== rhsSize.getNumberOfColumns() ) {
            throw new Error("Cannot append a slice with different number of columns");
        }
        if( size.getNumberOfRows() !== rhsSize.getNumberOfRows() ) {
            throw new Error("Cannot append a slice with different number of rows");
        }
        if( !geometry.getOrientation().equals( rhs.getGeometry().getOrientation(), 0.0001 ) ) {
            throw new Error("Cannot append a slice with different orientation");
        }
        if( photometricInterpretation !== rhs.getPhotometricInterpretation() ) {
            throw new Error("Cannot append a slice with different photometric interpretation");
        }
        // all meta should be equal
        for( var key in meta ) {
            if( meta[key] !== rhs.getMeta()[key] ) {
                throw new Error("Cannot append a slice with different "+key);
            }
        }

        // append slice at new position
        var newSliceNb = geometry.getSliceIndex( rhs.getGeometry().getOrigin() );

        // move buffer to retain order
        if( newSliceNb !== size.getNumberOfSlices() )
        {
            var slices = size.getNumberOfSlices();
            for(var i = slices; i > newSliceNb; i--){
                buffer[i] = buffer[i-1];
            }
        }
        buffer[newSliceNb] = rhs.getFrame(0);

        // update geometry
        geometry.appendOrigin( rhs.getGeometry().getOrigin(), newSliceNb );
        // update rsi
        rsis.splice(newSliceNb, 0, rhs.getRescaleSlopeAndIntercept(0));


        // insert sop instance UIDs
        imageUids.splice(newSliceNb, 0, rhs.getImageUids()[0]);

        // return the appended slice number
        return newSliceNb;
    };

    /**
     * Append a frame buffer to the image.
     * @param {Object} frameBuffer The frame buffer to append.
     */
    this.appendFrameBuffer = function (frameBuffer)
    {
        buffer.push(frameBuffer);
    };

    /**
     * Get the data range.
     * @return {Object} The data range.
     */
    this.getDataRange = function() {
        if( !dataRange ) {
            dataRange = this.calculateDataRange();
        }
        return dataRange;
    };

    /**
     * Get the rescaled data range.
     * @return {Object} The rescaled data range.
     */
    this.getRescaledDataRange = function() {
        if( !rescaledDataRange ) {
            rescaledDataRange = this.calculateRescaledDataRange();
        }
        return rescaledDataRange;
    };

    /**
     * Get the histogram.
     * @return {Array} The histogram.
     */
    this.getHistogram = function() {
        if( !histogram ) {
            var res = this.calculateHistogram();
            dataRange = res.dataRange;
            rescaledDataRange = res.rescaledDataRange;
            histogram = res.histogram;
        }
        return histogram;
    };
};

/**
 * Get the value of the image at a specific coordinate.
 * @param {Number} i The X index.
 * @param {Number} j The Y index.
 * @param {Number} k The Z index.
 * @param {Number} f The frame number.
 * @return {Number} The value at the desired position.
 * Warning: No size check...
 */
dwv.image.Image.prototype.getValue = function( i, j, k, f )
{
    var index = new dwv.math.Index3D(i,j,k);
    var frameOrSliceIndex = (f || index.getK());
    return this.getValueAtOffset( this.getGeometry().indexToSliceOffset(index), frameOrSliceIndex );
};

/**
 * Get the rescaled value of the image at a specific coordinate.
 * @param {Number} i The X index.
 * @param {Number} j The Y index.
 * @param {Number} k The Z index.
 * @param {Number} f The frame number.
 * @return {Number} The rescaled value at the desired position.
 * Warning: No size check...
 */
dwv.image.Image.prototype.getRescaledValue = function( i, j, k, f )
{
    var frame = (f || 0);
    var val = this.getValue(i,j,k,frame);
    if (!this.isIdentityRSI()) {
        val = this.getRescaleSlopeAndIntercept(k).apply(val);
    }
    return val;
};

/**
 * Get a slice index iterator.
 * @param {number} sliceIndex The index of the slice.
 * @returns {Object} The slice iterator.
 */
dwv.image.Image.prototype.getSliceIterator = function (sliceIndex) {
    var sliceSize = this.getGeometry().getSize().getSliceSize();
    var start = sliceIndex * sliceSize;

    var range = null;
    if (this.getNumberOfComponents() === 1) {
        range = dwv.image.range(start, start + sliceSize);
    } else if (this.getNumberOfComponents() === 3) {
        // 3 times bigger...
        start *= 3;
        sliceSize *= 3;
        var isPlanar = this.getPlanarConfiguration() === 1;
        range = dwv.image.range3d(start, start + sliceSize, 1, isPlanar);
    } else {
        throw new Error("Unsupported number of components: " + this.getNumberOfComponents());
    }

    return range;
};

/**
 * Calculate the data range of the image.
 * WARNING: for speed reasons, only calculated on the first frame...
 * @return {Object} The range {min, max}.
 */
dwv.image.Image.prototype.calculateDataRange = function ()
{
    var size = this.getGeometry().getSize();
    var sliceSize = 1;
    var slices = size.getNumberOfSlices();
    var min = this.getValueAtOffset(0,0);
    var max = min;
    var value = 0;
    for ( var sliceIndex = 0; sliceIndex < slices; ++sliceIndex ) {
        for (var sliceOffset = 0; sliceOffset < sliceSize; ++sliceOffset) {
            value = this.getValueAtOffset(sliceOffset, sliceIndex);
            if (value > max) {
                max = value;
            }
            if (value < min) {
                min = value;
            }
        }
    }
    // return
    return { "min": min, "max": max };
};

/**
 * Calculate the rescaled data range of the image.
 * WARNING: for speed reasons, only calculated on the first frame...
 * @return {Object} The range {min, max}.
 */
dwv.image.Image.prototype.calculateRescaledDataRange = function ()
{
    if (this.isIdentityRSI()) {
        return this.getDataRange();
    }
    else if (this.isConstantRSI()) {
        var range = this.getDataRange();
        var resmin = this.getRescaleSlopeAndIntercept(0).apply(range.min);
        var resmax = this.getRescaleSlopeAndIntercept(0).apply(range.max);
        return {
            "min": ((resmin < resmax) ? resmin : resmax),
            "max": ((resmin > resmax) ? resmin : resmax)
        };
    }
    else {
        var size = this.getGeometry().getSize();
        var nFrames = 1; //this.getNumberOfFrames();
        var rmin = this.getRescaledValue(0,0,0);
        var rmax = rmin;
        var rvalue = 0;
        for ( var f = 0, nframes = nFrames; f < nframes; ++f ) {
            for ( var k = 0, nslices = size.getNumberOfSlices(); k < nslices; ++k ) {
                for ( var j = 0, nrows = size.getNumberOfRows(); j < nrows; ++j ) {
                    for ( var i = 0, ncols = size.getNumberOfColumns(); i < ncols; ++i ) {
                        rvalue = this.getRescaledValue(i,j,k,f);
                        if( rvalue > rmax ) { rmax = rvalue; }
                        if( rvalue < rmin ) { rmin = rvalue; }
                    }
                }
            }
        }
        // return
        return { "min": rmin, "max": rmax };
    }
};

/**
 * Calculate the histogram of the image.
 * @return {Object} The histogram, data range and rescaled data range.
 */
dwv.image.Image.prototype.calculateHistogram = function ()
{
    var size = this.getGeometry().getSize();
    var histo = [];
    var min = this.getValue(0,0,0);
    var max = min;
    var value = 0;
    var rmin = this.getRescaledValue(0,0,0);
    var rmax = rmin;
    var rvalue = 0;
    for ( var f = 0, nframes = this.getNumberOfFrames(); f < nframes; ++f ) {
        for ( var k = 0, nslices = size.getNumberOfSlices(); k < nslices; ++k ) {
            for ( var j = 0, nrows = size.getNumberOfRows(); j < nrows; ++j ) {
                for ( var i = 0, ncols = size.getNumberOfColumns(); i < ncols; ++i ) {
                    value = this.getValue(i,j,k,f);
                    if( value > max ) { max = value; }
                    if( value < min ) { min = value; }
                    rvalue = this.getRescaleSlopeAndIntercept(k).apply(value);
                    if( rvalue > rmax ) { rmax = rvalue; }
                    if( rvalue < rmin ) { rmin = rvalue; }
                    histo[rvalue] = ( histo[rvalue] || 0 ) + 1;
                }
            }
        }
    }
    // set data range
    var dataRange = { "min": min, "max": max };
    var rescaledDataRange = { "min": rmin, "max": rmax };
    // generate data for plotting
    var histogram = [];
    for ( var b = rmin; b <= rmax; ++b ) {
        histogram.push([b, ( histo[b] || 0 ) ]);
    }
    // return
    return { 'dataRange': dataRange, 'rescaledDataRange': rescaledDataRange,
        'histogram': histogram };
};

/**
 * Convolute the image with a given 2D kernel.
 * @param {Array} weights The weights of the 2D kernel as a 3x3 matrix.
 * @return {Image} The convoluted image.
 * Note: Uses the raw buffer values.
 */
dwv.image.Image.prototype.convolute2D = function(weights)
{
    if(weights.length !== 9) {
        throw new Error("The convolution matrix does not have a length of 9; it has "+weights.length);
    }

    var newImage = this.clone();
    var newBuffer = newImage.getBuffer();

    var imgSize = this.getGeometry().getSize();
    var ncols = imgSize.getNumberOfColumns();
    var nrows = imgSize.getNumberOfRows();
    var ncomp = this.getNumberOfComponents();

    // adapt to number of component and planar configuration
    var factor = 1;
    var componentOffset = 1;
    if( ncomp === 3 )
    {
        if( this.getPlanarConfiguration() === 0 )
        {
            factor = 3;
        }
        else
        {
            componentOffset = imgSize.getTotalSize();
        }
    }

    // allow special indent for matrices
    /*jshint indent:false */

    // default weight offset matrix
    var wOff = [];
    wOff[0] = (-ncols-1) * factor; wOff[1] = (-ncols) * factor; wOff[2] = (-ncols+1) * factor;
    wOff[3] = -factor; wOff[4] = 0; wOff[5] = 1 * factor;
    wOff[6] = (ncols-1) * factor; wOff[7] = (ncols) * factor; wOff[8] = (ncols+1) * factor;

    // border weight offset matrices
    // borders are extended (see http://en.wikipedia.org/wiki/Kernel_%28image_processing%29)

    // i=0, j=0
    var wOff00 = [];
    wOff00[0] = wOff[4]; wOff00[1] = wOff[4]; wOff00[2] = wOff[5];
    wOff00[3] = wOff[4]; wOff00[4] = wOff[4]; wOff00[5] = wOff[5];
    wOff00[6] = wOff[7]; wOff00[7] = wOff[7]; wOff00[8] = wOff[8];
    // i=0, j=*
    var wOff0x = [];
    wOff0x[0] = wOff[1]; wOff0x[1] = wOff[1]; wOff0x[2] = wOff[2];
    wOff0x[3] = wOff[4]; wOff0x[4] = wOff[4]; wOff0x[5] = wOff[5];
    wOff0x[6] = wOff[7]; wOff0x[7] = wOff[7]; wOff0x[8] = wOff[8];
    // i=0, j=nrows
    var wOff0n = [];
    wOff0n[0] = wOff[1]; wOff0n[1] = wOff[1]; wOff0n[2] = wOff[2];
    wOff0n[3] = wOff[4]; wOff0n[4] = wOff[4]; wOff0n[5] = wOff[5];
    wOff0n[6] = wOff[4]; wOff0n[7] = wOff[4]; wOff0n[8] = wOff[5];

    // i=*, j=0
    var wOffx0 = [];
    wOffx0[0] = wOff[3]; wOffx0[1] = wOff[4]; wOffx0[2] = wOff[5];
    wOffx0[3] = wOff[3]; wOffx0[4] = wOff[4]; wOffx0[5] = wOff[5];
    wOffx0[6] = wOff[6]; wOffx0[7] = wOff[7]; wOffx0[8] = wOff[8];
    // i=*, j=* -> wOff
    // i=*, j=nrows
    var wOffxn = [];
    wOffxn[0] = wOff[0]; wOffxn[1] = wOff[1]; wOffxn[2] = wOff[2];
    wOffxn[3] = wOff[3]; wOffxn[4] = wOff[4]; wOffxn[5] = wOff[5];
    wOffxn[6] = wOff[3]; wOffxn[7] = wOff[4]; wOffxn[8] = wOff[5];

    // i=ncols, j=0
    var wOffn0 = [];
    wOffn0[0] = wOff[3]; wOffn0[1] = wOff[4]; wOffn0[2] = wOff[4];
    wOffn0[3] = wOff[3]; wOffn0[4] = wOff[4]; wOffn0[5] = wOff[4];
    wOffn0[6] = wOff[6]; wOffn0[7] = wOff[7]; wOffn0[8] = wOff[7];
    // i=ncols, j=*
    var wOffnx = [];
    wOffnx[0] = wOff[0]; wOffnx[1] = wOff[1]; wOffnx[2] = wOff[1];
    wOffnx[3] = wOff[3]; wOffnx[4] = wOff[4]; wOffnx[5] = wOff[4];
    wOffnx[6] = wOff[6]; wOffnx[7] = wOff[7]; wOffnx[8] = wOff[7];
    // i=ncols, j=nrows
    var wOffnn = [];
    wOffnn[0] = wOff[0]; wOffnn[1] = wOff[1]; wOffnn[2] = wOff[1];
    wOffnn[3] = wOff[3]; wOffnn[4] = wOff[4]; wOffnn[5] = wOff[4];
    wOffnn[6] = wOff[3]; wOffnn[7] = wOff[4]; wOffnn[8] = wOff[4];

    // restore indent for rest of method
    /*jshint indent:4 */

    // loop vars
    var newValue = 0;
    var wOffFinal = [];
    // go through the destination image pixels
    for (var frameIndex=0; frameIndex<newBuffer.length; frameIndex++) {
        var pixelOffset = 0;
        for (var c=0; c<ncomp; c++) {
        // special component offset
            pixelOffset += c * componentOffset;
            for (var j=0; j<nrows; j++) {
                for (var i=0; i<ncols; i++) {
                    wOffFinal = wOff;
                    // special border cases
                    if( i === 0 && j === 0 ) {
                        wOffFinal = wOff00;
                    }
                    else if( i === 0 && j === (nrows-1)  ) {
                        wOffFinal = wOff0n;
                    }
                    else if( i === (ncols-1) && j === 0 ) {
                        wOffFinal = wOffn0;
                    }
                    else if( i === (ncols-1) && j === (nrows-1) ) {
                        wOffFinal = wOffnn;
                    }
                    else if( i === 0 && j !== (nrows-1) && j !== 0 ) {
                        wOffFinal = wOff0x;
                    }
                    else if( i === (ncols-1) && j !== (nrows-1) && j !== 0 ) {
                        wOffFinal = wOffnx;
                    }
                    else if( i !== 0 && i !== (ncols-1) && j === 0 ) {
                        wOffFinal = wOffx0;
                   }
                    else if( i !== 0 && i !== (ncols-1) && j === (nrows-1) ) {
                        wOffFinal = wOffxn;
                    }

                    // calculate the weighed sum of the source image pixels that
                    // fall under the convolution matrix
                    newValue = 0;
                    for( var wi=0; wi<9; ++wi )
                    {
                        newValue += this.getValueAtOffset(pixelOffset + wOffFinal[wi], frameIndex) * weights[wi];
                    }
                    newBuffer[frameIndex][pixelOffset] = newValue;
                    // increment pixel offset
                    pixelOffset += factor;
                }
            }
        }
    }
    return newImage;
};

/**
 * Transform an image using a specific operator.
 * WARNING: no size check!
 * @param {Function} operator The operator to use when transforming.
 * @return {Image} The transformed image.
 * Note: Uses the raw buffer values.
 */
dwv.image.Image.prototype.transform = function(operator)
{
    var newImage = this.clone();
    var newBuffer = newImage.getBuffer();

    for ( var frameOrSlice = 0; frameOrSlice < newBuffer.length; ++frameOrSlice )
    {
        for( var offset = 0, leni = newBuffer[frameOrSlice].length; offset < leni; ++offset )
        {
            newBuffer[frameOrSlice][offset] = operator( newImage.getValueAtOffset(offset,frameOrSlice) );
        }
    }
    return newImage;
};

/**
 * Compose this image with another one and using a specific operator.
 * WARNING: no size check!
 * @param {Image} rhs The image to compose with.
 * @param {Function} operator The operator to use when composing.
 * @return {Image} The composed image.
 * Note: Uses the raw buffer values.
 */
dwv.image.Image.prototype.compose = function(rhs, operator)
{
    var newImage = this.clone();
    var newBuffer = newImage.getBuffer();

    for ( var frameOrSlice = 0; frameOrSlice < newBuffer.length; ++frameOrSlice )
    {
        for( var offset = 0, leni = newBuffer[frameOrSlice].length; offset < leni; ++offset )
        {
            // using the operator on the local buffer, i.e. the latest (not original) data
            newBuffer[frameOrSlice][offset] = Math.floor( operator( this.getValueAtOffset(offset,frameOrSlice), rhs.getValueAtOffset(offset,frameOrSlice) ) );
        }
    }
    return newImage;
};

/**
 * Quantify a line according to image information.
 * @param {Object} line The line to quantify.
 * @return {Object} A quantification object.
 */
dwv.image.Image.prototype.quantifyLine = function(line)
{
    var quant = {};
    // length
    var spacing = this.getGeometry().getSpacing();
    var length = line.getWorldLength( spacing.getColumnSpacing(),
            spacing.getRowSpacing() );
    if (length !== null) {
        quant.length = {"value": length, "unit": dwv.i18n("unit.mm")};
    }
    // return
    return quant;
};

/**
 * Quantify a rectangle according to image information.
 * @param {Object} rect The rectangle to quantify.
 * @return {Object} A quantification object.
 */
dwv.image.Image.prototype.quantifyRect = function(rect)
{
    var quant = {};
    // surface
    var spacing = this.getGeometry().getSpacing();
    var surface = rect.getWorldSurface( spacing.getColumnSpacing(),
            spacing.getRowSpacing());
    if (surface !== null) {
        quant.surface = {"value": surface/100, "unit": dwv.i18n("unit.cm2")};
    }
    // stats
    var subBuffer = [];
    var minJ = parseInt(rect.getBegin().getY(), 10);
    var maxJ = parseInt(rect.getEnd().getY(), 10);
    var minI = parseInt(rect.getBegin().getX(), 10);
    var maxI = parseInt(rect.getEnd().getX(), 10);
    for ( var j = minJ; j < maxJ; ++j ) {
        for ( var i = minI; i < maxI; ++i ) {
            subBuffer.push( this.getValue(i,j,0) );
        }
    }
    var quantif = dwv.math.getStats( subBuffer );
    quant.min = {"value": quantif.getMin(), "unit": ""};
    quant.max = {"value": quantif.getMax(), "unit": ""};
    quant.mean = {"value": quantif.getMean(), "unit": ""};
    quant.stdDev = {"value": quantif.getStdDev(), "unit": ""};
    // return
    return quant;
};

/**
 * Quantify an ellipse according to image information.
 * @param {Object} ellipse The ellipse to quantify.
 * @return {Object} A quantification object.
 */
dwv.image.Image.prototype.quantifyEllipse = function(ellipse)
{
    var quant = {};
    // surface
    var spacing = this.getGeometry().getSpacing();
    var surface = ellipse.getWorldSurface( spacing.getColumnSpacing(),
            spacing.getRowSpacing());
    if (surface !== null) {
        quant.surface = {"value": surface/100, "unit": dwv.i18n("unit.cm2")};
    }
    // return
    return quant;
};
