// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Get data from an input image using a canvas.
 * @param {Image} Image The DOM Image.
 * @return {Mixed} The corresponding view and info.
 */
dwv.image.getViewFromDOMImage = function (image)
{
    // draw the image in the canvas in order to get its data
    var canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height);
    // get the image data
    var imageData = ctx.getImageData(0, 0, image.width, image.height);
    // remove alpha
    // TODO support passing the full image data
    var buffer = [];
    var j = 0;
    for( var i = 0; i < imageData.data.length; i+=4 ) {
        buffer[j] = imageData.data[i];
        buffer[j+1] = imageData.data[i+1];
        buffer[j+2] = imageData.data[i+2];
        j+=3;
    }
    // create dwv Image
    var imageSize = new dwv.image.Size(image.width, image.height);
    // TODO: wrong info...
    var imageSpacing = new dwv.image.Spacing(1,1);
    var sliceIndex = image.index ? image.index : 0;
    var origin = new dwv.math.Point3D(0,0,sliceIndex);
    var geometry = new dwv.image.Geometry(origin, imageSize, imageSpacing );
    var dwvImage = new dwv.image.Image( geometry, [buffer] );
    dwvImage.setPhotometricInterpretation("RGB");
    // meta information
    var meta = {};
    meta.BitsStored = 8;
    dwvImage.setMeta(meta);
    // view
    var view = new dwv.image.View(dwvImage);
    view.setWindowLevelMinMax();
    // properties
    var info = {};
    if( image.file )
    {
        info.fileName = { "value": image.file.name };
        info.fileType = { "value": image.file.type };
        info.fileLastModifiedDate = { "value": image.file.lastModifiedDate };
    }
    info.imageWidth = { "value": image.width };
    info.imageHeight = { "value": image.height };
    // return
    return {"view": view, "info": info};
};

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
     * @param {Object} callback The callback on the conversion.
     */
    this.convert = function (buffer, callback)
    {
        // DICOM parser
        var dicomParser = new dwv.dicom.DicomParser();
        dicomParser.setDefaultCharacterSet(defaultCharacterSet);
        // parse the buffer
        dicomParser.parse(buffer);

        var pixelBuffer = dicomParser.getRawDicomElements().x7FE00010.value;
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
            callback({"view": view, "info": dicomParser.getDicomElements().dumpToTable()});
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
                    self.onload();
                };
            }

            // decoder callback
            var countDecodedFrames = 0;
            var onDecodedFrame = function (frame) {
                return function (event) {
                    // send progress
                    ++countDecodedFrames;
                    var ev = {type: "read-progress", lengthComputable: true,
                        loaded: (countDecodedFrames * 100 / nFrames), total: 100};
                    self.onprogress(ev);
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
                bitsAllocated, isSigned, onDecodedFrame(0), false);

            // decompress the possible other frames
            if ( nFrames !== 1 ) {
                // decode (asynchronously if possible)
                for (var f = 1; f < nFrames; ++f) {
                    pixelDecoder.decode(pixelBuffer[f],
                        bitsAllocated, isSigned, onDecodedFrame(f));
                }
            }
        }
        // no decompression
        else {
            // send progress
            self.onprogress({type: "read-progress", lengthComputable: true,
                loaded: 100, total: 100});
            // create image
            onDecodedFirstFrame();
            // send load events
            self.onload();
            self.onloadend();
        }
    };
};

/**
 * Handle a load end event.
 */
dwv.image.DicomBufferToView.prototype.onloadend = function ()
{
    // default does nothing.
};
/**
 * Handle a load event.
 */
dwv.image.DicomBufferToView.prototype.onload = function ()
{
    // default does nothing.
};
/**
 * Handle a load progress event.
 */
dwv.image.DicomBufferToView.prototype.onprogress = function ()
{
    // default does nothing.
};
