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
 * @param {String} script The path to the decoder script to be used by the web worker.
 */
dwv.image.AsynchPixelBufferDecoder = function (script)
{
    // initialise the thread pool
    var pool = new dwv.utils.ThreadPool(15);
    pool.init();

    /**
     * Decode a pixel buffer.
     * @param {Array} pixelBuffer The pixel buffer.
     * @param {Number} bitsAllocated The bits allocated per element in the buffer.
     * @param {Boolean} isSigned Is the data signed.
     * @param {Function} callback Callback function to handle decoded data.
     */
    this.decode = function (pixelBuffer, bitsAllocated, isSigned, callback) {
        // (re)set event handler
        pool.onpoolworkend = this.ondecodeend;
        pool.onworkerend = this.ondecoded;
        // create worker task
        var workerTask = new dwv.utils.WorkerTask(script, callback, {
            'buffer': pixelBuffer,
            'bitsAllocated': bitsAllocated,
            'isSigned': isSigned } );
        // add it the queue and run it
        pool.addWorkerTask(workerTask);
    };

    /**
     * Abort decoding.
     */
    this.abort = function () {
        // abort the thread pool
        pool.abort();
    };
};

/**
 * Handle a decode end event.
 */
dwv.image.AsynchPixelBufferDecoder.prototype.ondecodeend = function ()
{
    // default does nothing.
};

/**
 * Handle a decode event.
 */
dwv.image.AsynchPixelBufferDecoder.prototype.ondecoded = function ()
{
    // default does nothing.
};

/**
 * Synchronous pixel buffer decoder.
 * @param {String} algoName The decompression algorithm name.
 */
dwv.image.SynchPixelBufferDecoder = function (algoName)
{
    /**
     * Decode a pixel buffer.
     * @param {Array} pixelBuffer The pixel buffer.
     * @param {Number} bitsAllocated The bits allocated per element in the buffer.
     * @param {Boolean} isSigned Is the data signed.
     * @param {Function} callback Callback function to handle decoded data.
     * @external jpeg
     * @external JpegImage
     * @external JpxImage
     */
    this.decode = function (pixelBuffer, bitsAllocated, isSigned, callback) {
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
        // send events
        this.ondecoded();
        this.ondecodeend();
        // call callback with decoded buffer as array
        callback({data: [decodedBuffer]});
    };

    /**
     * Abort decoding.
     */
    this.abort = function () {
        // nothing to do in the synchronous case.
    };
};

/**
 * Handle a decode end event.
 */
dwv.image.SynchPixelBufferDecoder.prototype.ondecodeend = function ()
{
    // default does nothing.
};

/**
 * Handle a decode event.
 */
dwv.image.SynchPixelBufferDecoder.prototype.ondecoded = function ()
{
    // default does nothing.
};

/**
 * Decode a pixel buffer.
 * @constructor
 * @param {String} algoName The decompression algorithm name.
 * If the 'dwv.image.decoderScripts' variable does not contain the desired algorythm,
 * the decoder will switch to the synchronous mode.
 */
dwv.image.PixelBufferDecoder = function (algoName)
{
    /**
     * Pixel decoder.
     * Defined only once.
     * @private
     * @type Object
     */
    var pixelDecoder = null;

    // initialise the asynch decoder (if possible)
    if (typeof dwv.image.decoderScripts !== "undefined" &&
            typeof dwv.image.decoderScripts[algoName] !== "undefined") {
        pixelDecoder = new dwv.image.AsynchPixelBufferDecoder(dwv.image.decoderScripts[algoName]);
    } else {
        pixelDecoder = new dwv.image.SynchPixelBufferDecoder(algoName);
    }

    /**
     * Get data from an input buffer using a DICOM parser.
     * @param {Array} pixelBuffer The input data buffer.
     * @param {Number} bitsAllocated The bits allocated per element in the buffer.
     * @param {Boolean} isSigned Is the data signed.
     * @param {Object} callback The callback on the conversion.
     */
    this.decode = function (pixelBuffer, bitsAllocated, isSigned, callback)
    {
        // set event handler
        pixelDecoder.ondecodeend = this.ondecodeend;
        pixelDecoder.ondecoded = this.ondecoded;
        // decode and call the callback
        pixelDecoder.decode(pixelBuffer, bitsAllocated, isSigned, callback);
    };

    /**
     * Abort decoding.
     */
    this.abort = function ()
    {
        // decoder classes should define an abort
        pixelDecoder.abort();
    };
};

/**
 * Handle a decode end event.
 */
dwv.image.PixelBufferDecoder.prototype.ondecodeend = function ()
{
    // default does nothing.
};

/**
 * Handle a decode end event.
 */
dwv.image.PixelBufferDecoder.prototype.ondecoded = function ()
{
    // default does nothing.
};
