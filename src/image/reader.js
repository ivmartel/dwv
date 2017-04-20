// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Get data from an input context imageData.
 * @param {Object} imageData The context imageData.
 * @param {Number} width The width of the coresponding image.
 * @param {Number} height The height of the coresponding image.
 * @param {Number} sliceIndex The slice index of the imageData.
 * @return {Object} The corresponding view.
 */
dwv.image.getViewFromImageData = function (imageData, width, height, sliceIndex) {
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
    var imageSize = new dwv.image.Size(width, height);

    // TODO: wrong info...
    var imageSpacing = new dwv.image.Spacing(1,1);

    var origin = new dwv.math.Point3D(0,0,sliceIndex);
    var geometry = new dwv.image.Geometry(origin, imageSize, imageSpacing );
    var image = new dwv.image.Image( geometry, [buffer] );
    image.setPhotometricInterpretation("RGB");
    // meta information
    var meta = {};
    meta.BitsStored = 8;
    image.setMeta(meta);
    // view
    var view = new dwv.image.View(image);
    // defaut preset
    view.setWindowLevelMinMax();
    // return
    return view;
};

/**
 * Get data from an input image using a canvas.
 * @param {Object} image The DOM Image.
 * @return {Mixed} The corresponding view and info.
 */
dwv.image.getViewFromDOMImage = function (image)
{
    var width = image.width;
    var height = image.height;

    // draw the image in the canvas in order to get its data
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    // get the image data
    var imageData = ctx.getImageData(0, 0, width, height);
    // view
    var sliceIndex = image.index ? image.index : 0;
    var view = dwv.image.getViewFromImageData(
        imageData, width, height, sliceIndex);
    // properties
    var info = {};
    if( image.file )
    {
        info.fileName = { "value": image.file.name };
        info.fileType = { "value": image.file.type };
        info.fileLastModifiedDate = { "value": image.file.lastModifiedDate };
    }
    info.imageWidth = { "value": width };
    info.imageHeight = { "value": height };
    // return
    return {"view": view, "info": info};
};

/**
 * Get data from an input image using a canvas.
 * @param {Image} video The DOM Video.
 * @return {Mixed} The corresponding view and info.
 */
dwv.image.getViewFromDOMVideo = function (video, callback)
{
    console.log("loading video...");

    var frames = [];
    var frameRate = 30;
    var frameIndex = 0;

    var width = video.videoWidth;
    var height = video.videoHeight;

    // draw the image in the canvas in order to get its data
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');

    video.addEventListener('seeked', onseeked, false);

    function storeFrame() {
        ++frameIndex;
        console.log("frame: " + frameIndex);
        ctx.drawImage(video, 0, 0);

        frames.push( dwv.image.getViewFromImageData(
            ctx.getImageData(0, 0, width, height),
            width, height, 0) );
    }

    function onseeked() {
      ++frameIndex;
      storeFrame();
      // set the next time
      // (do not use currentTime, it seems to get offseted)
      var nextTime = frameIndex / frameRate;
      if (nextTime <= this.duration) {
          // next frame
          this.currentTime = nextTime;
      } else {
          // end
          ondone();
      }
    }

    function ondone() {
        video.removeEventListener('seeked', onseeked);

        callback( {"view": frames[2], "info": {} } );
    }

    // trigger the first seeked
    video.currentTime = 0;
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
