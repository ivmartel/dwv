// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Create a dwv.image.View from a DICOM buffer.
 * @constructor
 */
dwv.image.DicomBufferToView = function ()
{
    // closure to self
    var self = this;

    /**
     * The default character set (optional).
     * @private
     * @type String
     */
    var defaultCharacterSet;

    /**
     * Set the default character set.
     * param {String} The character set.
     */
    this.setDefaultCharacterSet = function (characterSet) {
        defaultCharacterSet = characterSet;
    };

    /**
     * Pixel buffer decoder.
     * Define only once to allow optional asynchronous mode.
     * @private
     * @type Object
     */
    var pixelDecoder = null;

    /**
     * Get data from an input buffer using a DICOM parser.
     * @param {Array} buffer The input data buffer.
     * @param {String} origin The data origin.
     * @param {Number} dataIndex The data index.
     */
    this.convert = function (buffer, origin, dataIndex)
    {
        // DICOM parser
        var dicomParser = new dwv.dicom.DicomParser();
        dicomParser.setDefaultCharacterSet(defaultCharacterSet);
        // parse the buffer
        try {
          dicomParser.parse(buffer);
        } catch (error) {
          self.onerror({
              error: error,
              source: origin
          });
          self.onloadend({
              source: origin
          });
          return;
        }

        var pixelBuffer = dicomParser.getRawDicomElements().x7FE00010.value;
        var syntax = dwv.dicom.cleanString(dicomParser.getRawDicomElements().x00020010.value[0]);
        var algoName = dwv.dicom.getSyntaxDecompressionName(syntax);
        var needDecompression = (algoName !== null);

        // worker callback
        var onDecodedFirstFrame = function (/*event*/) {
            // create the image
            var imageFactory = new dwv.image.ImageFactory();
            var viewFactory = new dwv.image.ViewFactory();
            try {
                var image = imageFactory.create( dicomParser.getDicomElements(), pixelBuffer );
                var view = viewFactory.create( dicomParser.getDicomElements(), image );
                // call onload
                self.onload({
                  "data": {
                    "view": view,
                    "info": dicomParser.getRawDicomElements()
                    },
                    source: origin
                });
            } catch (error) {
                self.onerror({
                    error: error,
                    source: origin
                });
                self.onloadend({
                    source: origin
                });
            }
        };

        if ( needDecompression ) {
            // gather pixel buffer meta data
            var bitsAllocated = dicomParser.getRawDicomElements().x00280100.value[0];
            var pixelRepresentation = dicomParser.getRawDicomElements().x00280103.value[0];
            var pixelMeta = {
                "bitsAllocated": bitsAllocated,
                "isSigned": (pixelRepresentation === 1)
            };
            var columnsElement = dicomParser.getRawDicomElements().x00280011;
            var rowsElement = dicomParser.getRawDicomElements().x00280010;
            if (typeof columnsElement !== "undefined" && typeof rowsElement !== "undefined") {
                pixelMeta.sliceSize = columnsElement.value[0] * rowsElement.value[0];
            }
            var samplesPerPixelElement = dicomParser.getRawDicomElements().x00280002;
            if (typeof samplesPerPixelElement !== "undefined") {
                pixelMeta.samplesPerPixel = samplesPerPixelElement.value[0];
            }
            var planarConfigurationElement = dicomParser.getRawDicomElements().x00280006;
            if (typeof planarConfigurationElement !== "undefined") {
                pixelMeta.planarConfiguration = planarConfigurationElement.value[0];
            }

            var nFrames = pixelBuffer.length;

            if (!pixelDecoder){
                pixelDecoder = new dwv.image.PixelBufferDecoder(algoName);
                // callbacks
                pixelDecoder.ondecodestart = self.onloadstart;
                pixelDecoder.ondecoded = self.onload;
                pixelDecoder.ondecodeend = self.onloadend;
                pixelDecoder.onerror = self.onerror;
                pixelDecoder.onabort = self.onabort;
                // send an onload event for mono frame
                if ( nFrames === 1 ) {
                    pixelDecoder.ondecoded = self.onloadend;
                }
            }

            // decoder callback
            var countDecodedFrames = 0;
            var onDecodedFrame = function (frame) {
                return function (event) {
                    ++countDecodedFrames;
                    // send progress
                    self.onprogress({
                        lengthComputable: true,
                        loaded: (countDecodedFrames * 100 / nFrames),
                        total: 100,
                        index: dataIndex,
                        source: origin
                    });
                    // store data
                    pixelBuffer[frame] = event.data[0];
                    // create image for first frame
                    if ( frame === 0 ) {
                        onDecodedFirstFrame();
                    }
                };
            };

            // decompress synchronously the first frame to create the image
            pixelDecoder.decode(pixelBuffer[0],
                pixelMeta, onDecodedFrame(0), false);

            // decompress the possible other frames
            if ( nFrames !== 1 ) {
                // decode (asynchronously if possible)
                for (var f = 1; f < nFrames; ++f) {
                    pixelDecoder.decode(pixelBuffer[f],
                        pixelMeta, onDecodedFrame(f));
                }
            }
        }
        // no decompression
        else {
            // send progress
            self.onprogress({
                lengthComputable: true,
                loaded: 100,
                total: 100,
                index: dataIndex,
                source: origin
            });
            // create image
            onDecodedFirstFrame();
            // send load events
            self.onloadend({
                source: origin
            });
        }
    };

    /**
     * Abort a conversion.
     */
    this.abort = function () {
        // abort decoding, will trigger pixelDecoder.onabort
        if ( pixelDecoder ) {
            pixelDecoder.abort();
        }
    };
};

/**
 * Handle a load start event.
 * @param {Object} event The load start event.
 * Default does nothing.
 */
dwv.image.DicomBufferToView.prototype.onloadstart = function (/*event*/) {};
/**
 * Handle a load progress event.
 * @param {Object} event The progress event.
 * Default does nothing.
 */
dwv.image.DicomBufferToView.prototype.onprogress = function  (/*event*/) {};
/**
 * Handle a load event.
 * @param {Object} event The load event fired
 *   when a file has been loaded successfully.
 * Default does nothing.
 */
dwv.image.DicomBufferToView.prototype.onload = function  (/*event*/) {};
/**
 * Handle a load end event.
 * @param {Object} event The load end event fired
 *  when a file load has completed, successfully or not.
 * Default does nothing.
 */
dwv.image.DicomBufferToView.prototype.onloadend = function (/*event*/) {};
/**
 * Handle an error event.
 * @param {Object} event The error event.
 * Default does nothing.
 */
dwv.image.DicomBufferToView.prototype.onerror = function (/*event*/) {};
/**
 * Handle an abort event.
 * @param {Object} event The abort event.
 * Default does nothing.
 */
dwv.image.DicomBufferToView.prototype.onabort = function (/*event*/) {};
