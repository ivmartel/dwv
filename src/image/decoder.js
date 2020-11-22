// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * The JPEG baseline decoder.
 * @external JpegImage
 * @see https://github.com/mozilla/pdf.js/blob/master/src/core/jpg.js
 */
/* global JpegImage */
var hasJpegBaselineDecoder = (typeof JpegImage !== 'undefined');

/**
 * The JPEG decoder namespace.
 * @external jpeg
 * @see https://github.com/rii-mango/JPEGLosslessDecoderJS
 */
/* global jpeg */
var hasJpegLosslessDecoder = (typeof jpeg !== 'undefined') &&
    (typeof jpeg.lossless !== 'undefined');

/**
 * The JPEG 2000 decoder.
 * @external JpxImage
 * @see https://github.com/jpambrun/jpx-medical/blob/master/jpx.js
 */
/* global JpxImage */
var hasJpeg2000Decoder = (typeof JpxImage !== 'undefined');

/**
 * Asynchronous pixel buffer decoder.
 * @constructor
 * @param {String} script The path to the decoder script to be used
 *   by the web worker.
 * @param {number} numberOfData The anticipated number of data to decode.
 */
dwv.image.AsynchPixelBufferDecoder = function (script/*, numberOfData*/) {
  // initialise the thread pool
  var pool = new dwv.utils.ThreadPool(15);
  // flag to know if callbacks are set
  var areCallbacksSet = false;

  /**
     * Decode a pixel buffer.
     * @param {Array} pixelBuffer The pixel buffer.
     * @param {Object} pixelMeta The input meta data.
     * @param {number} index The index of the input data.
     */
  this.decode = function (pixelBuffer, pixelMeta, index) {
    if (!areCallbacksSet) {
      areCallbacksSet = true;
      // set event handlers
      pool.onworkstart = this.ondecodestart;
      pool.onworkitem = this.ondecodeditem;
      pool.onwork = this.ondecoded;
      pool.onworkend = this.ondecodeend;
      pool.onerror = this.onerror;
      pool.onabort = this.onabort;
    }
    // create worker task
    var workerTask = new dwv.utils.WorkerTask(
      script,
      {
        'buffer': pixelBuffer,
        'meta': pixelMeta
      },
      index
    );
    // add it the queue and run it
    pool.addWorkerTask(workerTask);
  };

  /**
     * Abort decoding.
     */
  this.abort = function () {
    // abort the thread pool, will trigger pool.onabort
    pool.abort();
  };
};

/**
 * Handle a decode start event.
 * @param {Object} event The decode start event.
 * Default does nothing.
 */
dwv.image.AsynchPixelBufferDecoder.prototype.ondecodestart = function (
  /*event*/) {};
/**
 * Handle a decode item event.
 * @param {Object} event The decode item event fired
 *   when a decode item ended successfully.
 * Default does nothing.
 */
dwv.image.AsynchPixelBufferDecoder.prototype.ondecodeditem = function (
  /*event*/) {};
/**
 * Handle a decode event.
 * @param {Object} event The decode event fired
 *   when a file has been decoded successfully.
 * Default does nothing.
 */
dwv.image.AsynchPixelBufferDecoder.prototype.ondecoded = function (
  /*event*/) {};
/**
 * Handle a decode end event.
 * @param {Object} event The decode end event fired
 *  when a file decoding has completed, successfully or not.
 * Default does nothing.
 */
dwv.image.AsynchPixelBufferDecoder.prototype.ondecodeend = function (
  /*event*/) {};
/**
 * Handle an error event.
 * @param {Object} event The error event.
 * Default does nothing.
 */
dwv.image.AsynchPixelBufferDecoder.prototype.onerror = function (/*event*/) {};
/**
 * Handle an abort event.
 * @param {Object} event The abort event.
 * Default does nothing.
 */
dwv.image.AsynchPixelBufferDecoder.prototype.onabort = function (/*event*/) {};

/**
 * Synchronous pixel buffer decoder.
 * @constructor
 * @param {String} algoName The decompression algorithm name.
 * @param {number} numberOfData The anticipated number of data to decode.
 */
dwv.image.SynchPixelBufferDecoder = function (algoName, numberOfData) {
  // decode count
  var decodeCount = 0;

  /**
     * Decode a pixel buffer.
     * @param {Array} pixelBuffer The pixel buffer.
     * @param {Object} pixelMeta The input meta data.
     * @param {number} index The index of the input data.
     * @external jpeg
     * @external JpegImage
     * @external JpxImage
     */
  this.decode = function (pixelBuffer, pixelMeta, index) {
    ++decodeCount;

    var decoder = null;
    var decodedBuffer = null;
    if (algoName === 'jpeg-lossless') {
      if (!hasJpegLosslessDecoder) {
        throw new Error('No JPEG Lossless decoder provided');
      }
      // bytes per element
      var bpe = pixelMeta.bitsAllocated / 8;
      var buf = new Uint8Array(pixelBuffer);
      decoder = new jpeg.lossless.Decoder();
      var decoded = decoder.decode(buf.buffer, 0, buf.buffer.byteLength, bpe);
      if (pixelMeta.bitsAllocated === 8) {
        if (pixelMeta.isSigned) {
          decodedBuffer = new Int8Array(decoded.buffer);
        } else {
          decodedBuffer = new Uint8Array(decoded.buffer);
        }
      } else if (pixelMeta.bitsAllocated === 16) {
        if (pixelMeta.isSigned) {
          decodedBuffer = new Int16Array(decoded.buffer);
        } else {
          decodedBuffer = new Uint16Array(decoded.buffer);
        }
      }
    } else if (algoName === 'jpeg-baseline') {
      if (!hasJpegBaselineDecoder) {
        throw new Error('No JPEG Baseline decoder provided');
      }
      decoder = new JpegImage();
      decoder.parse(pixelBuffer);
      decodedBuffer = decoder.getData(decoder.width, decoder.height);
    } else if (algoName === 'jpeg2000') {
      if (!hasJpeg2000Decoder) {
        throw new Error('No JPEG 2000 decoder provided');
      }
      // decompress pixel buffer into Int16 image
      decoder = new JpxImage();
      decoder.parse(pixelBuffer);
      // set the pixel buffer
      decodedBuffer = decoder.tiles[0].items;
    } else if (algoName === 'rle') {
      // decode DICOM buffer
      decoder = new dwv.decoder.RleDecoder();
      // set the pixel buffer
      decodedBuffer = decoder.decode(
        pixelBuffer,
        pixelMeta.bitsAllocated,
        pixelMeta.isSigned,
        pixelMeta.sliceSize,
        pixelMeta.samplesPerPixel,
        pixelMeta.planarConfiguration);
    }
    // send decode events
    this.ondecodeditem({
      data: [decodedBuffer],
      index: index
    });
    // decode end?
    if (decodeCount === numberOfData) {
      this.ondecoded({});
      this.ondecodeend({});
    }
  };

  /**
     * Abort decoding.
     */
  this.abort = function () {
    // nothing to do in the synchronous case.
    // callback
    this.onabort({});
    this.ondecodeend({});
  };
};

/**
 * Handle a decode start event.
 * @param {Object} event The decode start event.
 * Default does nothing.
 */
dwv.image.SynchPixelBufferDecoder.prototype.ondecodestart = function (
  /*event*/) {};
/**
 * Handle a decode item event.
 * @param {Object} event The decode item event fired
 *   when a decode item ended successfully.
 * Default does nothing.
 */
dwv.image.SynchPixelBufferDecoder.prototype.ondecodeditem = function (
  /*event*/) {};
/**
 * Handle a decode event.
 * @param {Object} event The decode event fired
 *   when a file has been decoded successfully.
 * Default does nothing.
 */
dwv.image.SynchPixelBufferDecoder.prototype.ondecoded = function (
  /*event*/) {};
/**
 * Handle a decode end event.
 * @param {Object} event The decode end event fired
 *  when a file decoding has completed, successfully or not.
 * Default does nothing.
 */
dwv.image.SynchPixelBufferDecoder.prototype.ondecodeend = function (
  /*event*/) {};
/**
 * Handle an error event.
 * @param {Object} event The error event.
 * Default does nothing.
 */
dwv.image.SynchPixelBufferDecoder.prototype.onerror = function (/*event*/) {};
/**
 * Handle an abort event.
 * @param {Object} event The abort event.
 * Default does nothing.
 */
dwv.image.SynchPixelBufferDecoder.prototype.onabort = function (/*event*/) {};

/**
 * Decode a pixel buffer.
 * @constructor
 * @param {String} algoName The decompression algorithm name.
 * @param {number} numberOfData The anticipated number of data to decode.
 * If the 'dwv.image.decoderScripts' variable does not contain the desired,
 * algorythm the decoder will switch to the synchronous mode.
 */
dwv.image.PixelBufferDecoder = function (algoName, numberOfData) {
  /**
     * Pixel decoder.
     * Defined only once.
     * @private
     * @type Object
     */
  var pixelDecoder = null;

  // initialise the asynch decoder (if possible)
  if (typeof dwv.image.decoderScripts !== 'undefined' &&
            typeof dwv.image.decoderScripts[algoName] !== 'undefined') {
    pixelDecoder = new dwv.image.AsynchPixelBufferDecoder(
      dwv.image.decoderScripts[algoName], numberOfData);
  } else {
    pixelDecoder = new dwv.image.SynchPixelBufferDecoder(
      algoName, numberOfData);
  }

  // flag to know if callbacks are set
  var areCallbacksSet = false;

  /**
     * Get data from an input buffer using a DICOM parser.
     * @param {Array} pixelBuffer The input data buffer.
     * @param {Object} pixelMeta The input meta data.
     * @param {number} index The index of the input data.
     */
  this.decode = function (pixelBuffer, pixelMeta, index) {
    if (!areCallbacksSet) {
      areCallbacksSet = true;
      // set callbacks
      pixelDecoder.ondecodestart = this.ondecodestart;
      pixelDecoder.ondecodeditem = this.ondecodeditem;
      pixelDecoder.ondecoded = this.ondecoded;
      pixelDecoder.ondecodeend = this.ondecodeend;
      pixelDecoder.onerror = this.onerror;
      pixelDecoder.onabort = this.onabort;
    }
    // decode and call the callback
    pixelDecoder.decode(pixelBuffer, pixelMeta, index);
  };

  /**
     * Abort decoding.
     */
  this.abort = function () {
    // decoder classes should define an abort
    pixelDecoder.abort();
  };
};

/**
 * Handle a decode start event.
 * @param {Object} event The decode start event.
 * Default does nothing.
 */
dwv.image.PixelBufferDecoder.prototype.ondecodestart = function (/*event*/) {};
/**
 * Handle a decode item event.
 * @param {Object} event The decode item event fired
 *   when a decode item ended successfully.
 * Default does nothing.
 */
dwv.image.PixelBufferDecoder.prototype.ondecodeditem = function (/*event*/) {};
/**
 * Handle a decode event.
 * @param {Object} event The decode event fired
 *   when a file has been decoded successfully.
 * Default does nothing.
 */
dwv.image.PixelBufferDecoder.prototype.ondecoded = function (/*event*/) {};
/**
 * Handle a decode end event.
 * @param {Object} event The decode end event fired
 *  when a file decoding has completed, successfully or not.
 * Default does nothing.
 */
dwv.image.PixelBufferDecoder.prototype.ondecodeend = function (/*event*/) {};
/**
 * Handle an error event.
 * @param {Object} event The error event.
 * Default does nothing.
 */
dwv.image.PixelBufferDecoder.prototype.onerror = function (/*event*/) {};
/**
 * Handle an abort event.
 * @param {Object} event The abort event.
 * Default does nothing.
 */
dwv.image.PixelBufferDecoder.prototype.onabort = function (/*event*/) {};
