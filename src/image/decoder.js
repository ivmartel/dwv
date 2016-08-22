// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

// JPEG Baseline
var hasJpegBaselineDecoder = (typeof JpegImage !== "undefined");
var JpegImage = JpegImage || {};
// JPEG Lossless
var hasJpegLosslessDecoder = (typeof jpeg !== "undefined") &&
    (typeof jpeg.lossless !== "undefined");
var jpeg = jpeg || {};
jpeg.lossless = jpeg.lossless || {};
// JPEG 2000
var hasJpeg2000Decoder = (typeof JpxImage !== "undefined");
var JpxImage = JpxImage || {};

/**
 * Asynchronous pixel buffer decoder.
 * @param {Array} decoderScripts An array of decoder scripts paths.
 */
dwv.image.AsynchPixelBufferDecoder = function (decoderScripts)
{
    // initialise the thread pool 
    var pool = new dwv.utils.ThreadPool(15);
    pool.init();

    /**
     * Decode a pixel buffer.
     * @param {Array} pixelBuffer The pixel buffer.
     * @param {String} algoName The decompression algorithm name.
     * @param {Number} bitsAllocated The bits allocated per element in the buffer.
     * @param {Boolean} isSigned Is the data signed.
     * @param {Function} callback Callback function to handle decoded data.
     */
    this.decode = function (pixelBuffer, algoName, bitsAllocated, isSigned, callback) {
        var script = decoderScripts[algoName];
        if ( typeof script === "undefined" ) {
            throw new Error("No script provided to decompress '" + algoName + "' data.");
        }
        var workerTask = new dwv.utils.WorkerTask(script, callback, {
            'buffer': pixelBuffer,
            'bitsAllocated': bitsAllocated,
            'isSigned': isSigned } );
        pool.addWorkerTask(workerTask);
    };
};

/**
 * Synchronous pixel buffer decoder.
 */
dwv.image.SynchPixelBufferDecoder = function ()
{
    /**
     * Decode a pixel buffer.
     * @param {Array} pixelBuffer The pixel buffer.
     * @param {String} algoName The decompression algorithm name.
     * @param {Number} bitsAllocated The bits allocated per element in the buffer.
     * @param {Boolean} isSigned Is the data signed.
     * @return {Array} The decoded pixel buffer.
     */
    this.decode = function (pixelBuffer, algoName, bitsAllocated, isSigned) {
        var decoder = null;
        var decodedBuffer = null;
        if( algoName === "jpeg-lossless" ) {
            if ( !hasJpegLosslessDecoder ) {
                throw new Error("No JPEG Lossless decoder provided");
            }
            // bytes per element
            var bpe = bitsAllocated / 8;
            var buf = new Uint8Array( pixelBuffer );
            decoder = new jpeg.lossless.Decoder();
            var decoded = decoder.decode(buf.buffer, 0, buf.buffer.byteLength, bpe);
            if (bitsAllocated === 8) {
                if (isSigned) {
                    decodedBuffer = new Int8Array(decoded.buffer);
                }
                else {
                    decodedBuffer = new Uint8Array(decoded.buffer);
                }
            }
            else if (bitsAllocated === 16) {
                if (isSigned) {
                    decodedBuffer = new Int16Array(decoded.buffer);
                }
                else {
                    decodedBuffer = new Uint16Array(decoded.buffer);
                }
            }
        }
        else if ( algoName === "jpeg-baseline" ) {
            if ( !hasJpegBaselineDecoder ) {
                throw new Error("No JPEG Baseline decoder provided");
            }
            decoder = new JpegImage();
            decoder.parse( pixelBuffer );
            decodedBuffer = decoder.getData(decoder.width,decoder.height);
        }
        else if( algoName === "jpeg2000" ) {
            if ( !hasJpeg2000Decoder ) {
                throw new Error("No JPEG 2000 decoder provided");
            }
            // decompress pixel buffer into Int16 image
            decoder = new JpxImage();
            decoder.parse( pixelBuffer );
            // set the pixel buffer
            decodedBuffer = decoder.tiles[0].items;
        }
        // return result as array
        return [decodedBuffer];
    };
};

/**
 * Decode a pixel buffer.
 * Switches between a asynchronous/synchronous mode according to the definition of the 
 * 'dwv.image.decoderScripts' variable.
 * @constructor
 */
dwv.image.PixelBufferDecoder = function ()
{
    /**
     * Asynchronous decoder.
     * Defined only once.
     * @private
     * @type Object
     */ 
    var asynchDecoder = null;
    
    /**
     * Get data from an input buffer using a DICOM parser.
     * @param {Array} pixelBuffer The input data buffer.
     * @param {String} algoName The decompression algorithm name.
     * @param {Number} bitsAllocated The bits allocated per element in the buffer.
     * @param {Boolean} isSigned Is the data signed.
     * @param {Object} callback The callback on the conversion.
     */
    this.decode = function (pixelBuffer, algoName, bitsAllocated, isSigned, callback)
    {
        // run asynchronous if we have scripts
        if (typeof dwv.image.decoderScripts !== "undefined") {
            if (!asynchDecoder) {
                // create the decoder (only once)
                asynchDecoder = new dwv.image.AsynchPixelBufferDecoder(dwv.image.decoderScripts);
            }
            // decode and call the callback
            asynchDecoder.decode(pixelBuffer, algoName, 
                    bitsAllocated, isSigned, callback);
        }
        else {
            // create the decoder
            var synchDecoder = new dwv.image.SynchPixelBufferDecoder();
            // decode
            var decodedBuffer = synchDecoder.decode(pixelBuffer, algoName, 
                    bitsAllocated, isSigned);
            // call the callback
            callback({data: decodedBuffer});
        }
    };
};
