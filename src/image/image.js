// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.image = dwv.image || {};

/**
 * Rescale Slope and Intercept
 * @constructor
 * @param slope
 * @param intercept
 */
dwv.image.RescaleSlopeAndIntercept = function (slope, intercept)
{
    /*// Check the rescale slope.
    if(typeof(slope) === 'undefined') {
        slope = 1;
    }
    // Check the rescale intercept.
    if(typeof(intercept) === 'undefined') {
        intercept = 0;
    }*/

    /**
     * Get the slope of the RSI.
     * @return {Number} The slope of the RSI.
     */
    this.getSlope = function ()
    {
        return slope;
    };
    /**
     * Get the intercept of the RSI.
     * @return {Number} The intercept of the RSI.
     */
    this.getIntercept = function ()
    {
        return intercept;
    };
    /**
     * Apply the RSI on an input value.
     * @return {Number} The value to rescale.
     */
    this.apply = function (value)
    {
        return value * slope + intercept;
    };
};

/**
 * Check for RSI equality.
 * @param {Object} rhs The other RSI to compare to.
 * @return {Boolean} True if both RSI are equal.
 */
dwv.image.RescaleSlopeAndIntercept.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getSlope() === rhs.getSlope() &&
        this.getIntercept() === rhs.getIntercept();
};

/**
 * Get a string representation of the RSI.
 * @return {String} The RSI as a string.
 */
dwv.image.RescaleSlopeAndIntercept.prototype.toString = function () {
    return (this.getSlope() + ", " + this.getIntercept());
};

/**
 * Is this RSI an ID RSI.
 * @return {Boolean} True if the RSI has a slope of 1 and no intercept.
 */
dwv.image.RescaleSlopeAndIntercept.prototype.isID = function () {
    return (this.getSlope() === 1 && this.getIntercept() === 0);
};

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
 */
dwv.image.Image = function(geometry, buffer, numberOfFrames)
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
	 * Overlay.
     * @private
     * @type Array
     */
	var overlays = [];

    /**
     * Set the first overlay.
     * @param {Array} over The first overlay.
     */
    this.setFirstOverlay = function (over) { overlays[0] = over; };

    /**
     * Get the overlays.
     * @return {Array} The overlays array.
     */
    this.getOverlays = function () { return overlays; };

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
        for (var f = 0, lenf = this.getNumberOfFrames(); f < lenf; ++f) {
            clonedBuffer[f] = buffer[f].slice(0);
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
    this.appendSlice = function (rhs, frame)
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

        var f = (typeof frame === "undefined") ? 0 : frame;

        // calculate slice size
        var mul = 1;
        if( photometricInterpretation === "RGB" || photometricInterpretation === "YBR_FULL_422") {
            mul = 3;
        }
        var sliceSize = mul * size.getSliceSize();

        // create the new buffer
        var newBuffer = dwv.dicom.getTypedArray(
            buffer[f].BYTES_PER_ELEMENT * 8,
            meta.IsSigned ? 1 : 0,
            sliceSize * (size.getNumberOfSlices() + 1) );

        // append slice at new position
        var newSliceNb = geometry.getSliceIndex( rhs.getGeometry().getOrigin() );
        if( newSliceNb === 0 )
        {
            newBuffer.set(rhs.getFrame(f));
            newBuffer.set(buffer[f], sliceSize);
        }
        else if( newSliceNb === size.getNumberOfSlices() )
        {
            newBuffer.set(buffer[f]);
            newBuffer.set(rhs.getFrame(f), size.getNumberOfSlices() * sliceSize);
        }
        else
        {
            var offset = newSliceNb * sliceSize;
            newBuffer.set(buffer[f].subarray(0, offset - 1));
            newBuffer.set(rhs.getFrame(f), offset);
            newBuffer.set(buffer[f].subarray(offset), offset + sliceSize);
        }

        // update geometry
        geometry.appendOrigin( rhs.getGeometry().getOrigin(), newSliceNb );
        // update rsi
        rsis.splice(newSliceNb, 0, rhs.getRescaleSlopeAndIntercept(0));

        // copy to class variables
        buffer[f] = newBuffer;

		// insert overlay information of the slice to the image
		overlays.splice(newSliceNb, 0, rhs.getOverlays()[0]);

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
    var frame = (f || 0);
    var index = new dwv.math.Index3D(i,j,k);
    return this.getValueAtOffset( this.getGeometry().indexToOffset(index), frame );
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
 * Calculate the data range of the image.
 * WARNING: for speed reasons, only calculated on the first frame...
 * @return {Object} The range {min, max}.
 */
dwv.image.Image.prototype.calculateDataRange = function ()
{
    var size = this.getGeometry().getSize().getTotalSize();
    var nFrames = 1; //this.getNumberOfFrames();
    var min = this.getValueAtOffset(0,0);
    var max = min;
    var value = 0;
    for ( var f = 0; f < nFrames; ++f ) {
        for ( var i = 0; i < size; ++i ) {
            value = this.getValueAtOffset(i,f);
            if( value > max ) { max = value; }
            if( value < min ) { min = value; }
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
    var nslices = imgSize.getNumberOfSlices();
    var nframes = this.getNumberOfFrames();
    var ncomp = this.getNumberOfComponents();

    // adapt to number of component and planar configuration
    var factor = 1;
    var componentOffset = 1;
    var frameOffset = imgSize.getTotalSize();
    if( ncomp === 3 )
    {
        frameOffset *= 3;
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
    var pixelOffset = 0;
    var newValue = 0;
    var wOffFinal = [];
    // go through the destination image pixels
    for (var f=0; f<nframes; f++) {
        pixelOffset = f * frameOffset;
        for (var c=0; c<ncomp; c++) {
            // special component offset
            pixelOffset += c * componentOffset;
            for (var k=0; k<nslices; k++) {
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
                            newValue += this.getValueAtOffset(pixelOffset + wOffFinal[wi], f) * weights[wi];
                        }
                        newBuffer[f][pixelOffset] = newValue;
                        // increment pixel offset
                        pixelOffset += factor;
                    }
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
    for ( var f = 0, lenf = this.getNumberOfFrames(); f < lenf; ++f )
    {
        for( var i = 0, leni = newBuffer[f].length; i < leni; ++i )
        {
            newBuffer[f][i] = operator( newImage.getValueAtOffset(i,f) );
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
    for ( var f = 0, lenf = this.getNumberOfFrames(); f < lenf; ++f )
    {
        for( var i = 0, leni = newBuffer[f].length; i < leni; ++i )
        {
            // using the operator on the local buffer, i.e. the latest (not original) data
            newBuffer[f][i] = Math.floor( operator( this.getValueAtOffset(i,f), rhs.getValueAtOffset(i,f) ) );
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

/**
 * {@link dwv.image.Image} factory.
 * @constructor
 */
dwv.image.ImageFactory = function () {};

/**
 * Get an {@link dwv.image.Image} object from the read DICOM file.
 * @param {Object} dicomElements The DICOM tags.
 * @param {Array} pixelBuffer The pixel buffer.
 * @return {View} A new Image.
 */
dwv.image.ImageFactory.prototype.create = function (dicomElements, pixelBuffer)
{
    // columns
    var columns = dicomElements.getFromKey("x00280011");
    if ( !columns ) {
        throw new Error("Missing or empty DICOM image number of columns");
    }
    // rows
    var rows = dicomElements.getFromKey("x00280010");
    if ( !rows ) {
        throw new Error("Missing or empty DICOM image number of rows");
    }
    // image size
    var size = new dwv.image.Size( columns, rows );

    // spacing
    var rowSpacing = null;
    var columnSpacing = null;
    // PixelSpacing
    var pixelSpacing = dicomElements.getFromKey("x00280030");
    // ImagerPixelSpacing
    var imagerPixelSpacing = dicomElements.getFromKey("x00181164");
    if ( pixelSpacing && pixelSpacing[0] && pixelSpacing[1] ) {
        rowSpacing = parseFloat( pixelSpacing[0] );
        columnSpacing = parseFloat( pixelSpacing[1] );
    }
    else if ( imagerPixelSpacing && imagerPixelSpacing[0] && imagerPixelSpacing[1] ) {
        rowSpacing = parseFloat( imagerPixelSpacing[0] );
        columnSpacing = parseFloat( imagerPixelSpacing[1] );
    }
    // image spacing
    var spacing = new dwv.image.Spacing( columnSpacing, rowSpacing );

    // TransferSyntaxUID
    var transferSyntaxUID = dicomElements.getFromKey("x00020010");
    var syntax = dwv.dicom.cleanString( transferSyntaxUID );
    var jpeg2000 = dwv.dicom.isJpeg2000TransferSyntax( syntax );
    var jpegBase = dwv.dicom.isJpegBaselineTransferSyntax( syntax );
    var jpegLoss = dwv.dicom.isJpegLosslessTransferSyntax( syntax );

    // ImagePositionPatient
    var imagePositionPatient = dicomElements.getFromKey("x00200032");
    // InstanceNumber
    var instanceNumber = dicomElements.getFromKey("x00200013");

    // slice position
    var slicePosition = new Array(0,0,0);
    if ( imagePositionPatient ) {
        slicePosition = [ parseFloat( imagePositionPatient[0] ),
            parseFloat( imagePositionPatient[1] ),
            parseFloat( imagePositionPatient[2] ) ];
    } else if (instanceNumber) {
        // use instanceNumber as slice index if no imagePositionPatient was provided
        console.warn("Using instanceNumber as imagePositionPatient.");
        slicePosition[2] = parseInt(instanceNumber, 10);
    }

    // slice orientation
    var imageOrientationPatient = dicomElements.getFromKey("x00200037");
    var orientationMatrix;
    if ( imageOrientationPatient ) {
        var rowCosines = new dwv.math.Vector3D( parseFloat( imageOrientationPatient[0] ),
            parseFloat( imageOrientationPatient[1] ),
            parseFloat( imageOrientationPatient[2] ) );
        var colCosines = new dwv.math.Vector3D( parseFloat( imageOrientationPatient[3] ),
            parseFloat( imageOrientationPatient[4] ),
            parseFloat( imageOrientationPatient[5] ) );
        var normal = rowCosines.crossProduct(colCosines);
        orientationMatrix = new dwv.math.Matrix33(
            rowCosines.getX(), rowCosines.getY(), rowCosines.getZ(),
            colCosines.getX(), colCosines.getY(), colCosines.getZ(),
            normal.getX(), normal.getY(), normal.getZ() );
    }

    // geometry
    var origin = new dwv.math.Point3D(slicePosition[0], slicePosition[1], slicePosition[2]);
    var geometry = new dwv.image.Geometry( origin, size, spacing, orientationMatrix );

    // image
    var image = new dwv.image.Image( geometry, pixelBuffer );
    // PhotometricInterpretation
    var photometricInterpretation = dicomElements.getFromKey("x00280004");
    if ( photometricInterpretation ) {
        var photo = dwv.dicom.cleanString(photometricInterpretation).toUpperCase();
        // jpeg decoders output RGB data
        if ( (jpeg2000 || jpegBase || jpegLoss) &&
        	(photo !== "MONOCHROME1" && photo !== "MONOCHROME2") ) {
            photo = "RGB";
        }
        // check samples per pixels
        var samplesPerPixel = parseInt(dicomElements.getFromKey("x00280002"), 10);
        if (photo === "RGB" && samplesPerPixel === 1) {
            photo = "PALETTE COLOR";
        }
        image.setPhotometricInterpretation( photo );
    }
    // PlanarConfiguration
    var planarConfiguration = dicomElements.getFromKey("x00280006");
    if ( planarConfiguration ) {
        image.setPlanarConfiguration( planarConfiguration );
    }

    // rescale slope and intercept
    var slope = 1;
    // RescaleSlope
    var rescaleSlope = dicomElements.getFromKey("x00281053");
    if ( rescaleSlope ) {
        slope = parseFloat(rescaleSlope);
    }
    var intercept = 0;
    // RescaleIntercept
    var rescaleIntercept = dicomElements.getFromKey("x00281052");
    if ( rescaleIntercept ) {
        intercept = parseFloat(rescaleIntercept);
    }
    var rsi = new dwv.image.RescaleSlopeAndIntercept(slope, intercept);
    image.setRescaleSlopeAndIntercept( rsi );

    // meta information
    var meta = {};
    // Modality
    var modality = dicomElements.getFromKey("x00080060");
    if ( modality ) {
        meta.Modality = modality;
    }
    // StudyInstanceUID
    var studyInstanceUID = dicomElements.getFromKey("x0020000D");
    if ( studyInstanceUID ) {
        meta.StudyInstanceUID = studyInstanceUID;
    }
    // SeriesInstanceUID
    var seriesInstanceUID = dicomElements.getFromKey("x0020000E");
    if ( seriesInstanceUID ) {
        meta.SeriesInstanceUID = seriesInstanceUID;
    }
    // BitsStored
    var bitsStored = dicomElements.getFromKey("x00280101");
    if ( bitsStored ) {
        meta.BitsStored = parseInt(bitsStored, 10);
    }
    // PixelRepresentation -> is signed
    var pixelRepresentation = dicomElements.getFromKey("x00280103");
    meta.IsSigned = false;
    if ( pixelRepresentation ) {
        meta.IsSigned = (pixelRepresentation === 1);
    }

    // PALETTE COLOR luts
    if (image.getPhotometricInterpretation() === "PALETTE COLOR") {
        var redLut = dicomElements.getFromKey("x00281201");
        var greenLut = dicomElements.getFromKey("x00281202");
        var blueLut = dicomElements.getFromKey("x00281203");
        // check red palette descriptor (should all be equal)
        var descriptor = dicomElements.getFromKey("x00281101");
        if (typeof descriptor !== "undefined" &&
            descriptor.length === 3 &&
            descriptor[2] === 16 ) {
            var shift8 = function (value) {
                return value >> 8;
            };
            redLut = redLut.map(shift8);
            greenLut = greenLut.map(shift8);
            blueLut = blueLut.map(shift8);
        }
        // set the palette
        meta.paletteLut = {
            "red": redLut,
            "green": greenLut,
            "blue": blueLut
        };
    }

    // RecommendedDisplayFrameRate
    var recommendedDisplayFrameRate = dicomElements.getFromKey("x00082144");
    if ( recommendedDisplayFrameRate ) {
        meta.RecommendedDisplayFrameRate = parseInt(recommendedDisplayFrameRate, 10);
    }

    image.setMeta(meta);

    // overlay
    image.setFirstOverlay( dwv.gui.info.createOverlays(dicomElements) );

    return image;
};
