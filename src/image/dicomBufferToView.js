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
     * @param {Number} dataIndex The data index.
     */
    this.convert = function (buffer, dataIndex)
    {
        // DICOM parser
        var dicomParser = new dwv.dicom.DicomParser();
        dicomParser.setDefaultCharacterSet(defaultCharacterSet);
        // parse the buffer
        dicomParser.parse(buffer);

        var tmpBuffer = dicomParser.getRawDicomElements().x7FE00010.value;
        var pixelBuffer = [];
        for(var frameIndex = 0; frameIndex < tmpBuffer.length; ++frameIndex){
           pixelBuffer[frameIndex] = [];
           pixelBuffer[frameIndex][0] = tmpBuffer[frameIndex];
        }
        var syntax = dwv.dicom.cleanString(dicomParser.getRawDicomElements().x00020010.value[0]);
        var algoName = dwv.dicom.getSyntaxDecompressionName(syntax);
        var needDecompression = (algoName !== null);

        // worker callback
        var onDecodedFirstFrame = function (/*event*/) {
            // create the image
            var imageFactory = new dwv.image.ImageFactory();
            var image = imageFactory.create( dicomParser.getDicomElements(), pixelBuffer );
            // create the view
            var viewFactory = new dwv.image.ViewFactory();
            var view = viewFactory.create( dicomParser.getDicomElements(), image );
            // return
            self.onload({"view": view, "info": dicomParser.getDicomElements().dumpToTable()});
        };

        if ( needDecompression ) {
            var bitsAllocated = dicomParser.getRawDicomElements().x00280100.value[0];
            var pixelRepresentation = dicomParser.getRawDicomElements().x00280103.value[0];
            var isSigned = (pixelRepresentation === 1);
            var nFrames = pixelBuffer.length;

            if (!pixelDecoder){
                pixelDecoder = new dwv.image.PixelBufferDecoder(algoName);
            }

            // loadend event
            pixelDecoder.ondecodeend = function () {
                self.onloadend();
            };

            // send an onload event for mono frame
            if ( nFrames === 1 ) {
                pixelDecoder.ondecoded = function () {
                    self.onloadend();
                };
            }

            // decoder callback
            var countDecodedFrames = 0;
            var onDecodedFrame = function (frame) {
                return function (event) {
                    // send progress
                    ++countDecodedFrames;
                    var ev = {'type': "load-progress", 'lengthComputable': true,
                        'loaded': (countDecodedFrames * 100 / nFrames), 'total': 100};
                    if ( typeof dataIndex !== "undefined") {
                        ev.index = dataIndex;
                    }
                    self.onprogress(ev);
                    // store data
                    pixelBuffer[frame][0] = event.data[0];
                    // create image for first frame
                    if ( frame === 0 ) {
                        onDecodedFirstFrame();
                    }
                };
            };

            // decompress synchronously the first frame to create the image
            pixelDecoder.decode(pixelBuffer[0][0],
                bitsAllocated, isSigned, onDecodedFrame(0), false);

            // decompress the possible other frames
            if ( nFrames !== 1 ) {
                // decode (asynchronously if possible)
                for (var f = 1; f < nFrames; ++f) {
                    pixelDecoder.decode(pixelBuffer[f][0],
                        bitsAllocated, isSigned, onDecodedFrame(f));
                }
            }
        }
        // no decompression
        else {
            // send progress
            var evnodec = {'type': 'load-progress', 'lengthComputable': true,
                'loaded': 100, 'total': 100};
            if ( typeof dataIndex !== "undefined") {
                evnodec.index = dataIndex;
            }
            self.onprogress(evnodec);
            // create image
            onDecodedFirstFrame();
            // send load events
            self.onloadend();
        }
    };

    /**
     * Abort a conversion.
     */
    this.abort = function () {
        if ( pixelDecoder ) {
            pixelDecoder.abort();
        }
    };
};

/**
 * Handle a load end event.
 * @param {Object} event The load end event.
 * Default does nothing.
 */
dwv.image.DicomBufferToView.prototype.onloadend = function (/*event*/) {};
/**
 * Handle a load event.
 * @param {Object} event The load event.
 * Default does nothing.
 */
dwv.image.DicomBufferToView.prototype.onload = function  (/*event*/) {};
/**
 * Handle a load progress event.
 * @param {Object} event The progress event.
 * Default does nothing.
 */
dwv.image.DicomBufferToView.prototype.onprogress = function  (/*event*/) {};
