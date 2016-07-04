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
    var dwvImage = new dwv.image.Image( geometry, buffer );
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
dwv.image.DicomBufferToView = function (decoderScripts) {

    // flag to use workers or not to decode data
    var useWorkers = false;
    
    if (typeof decoderScripts !== "undefined" && decoderScripts instanceof Array) {
        useWorkers = true;
        // thread pool
        var pool = new dwv.utils.ThreadPool(15);
        pool.init();
    }

    /**
     * Get data from an input buffer using a DICOM parser.
     * @param {Array} buffer The input data buffer.
     * @param {Object} callback The callback on the conversion.
     * @return {Mixed} The corresponding view and info.
     */
    this.convert = function(buffer, callback)
    {
        // DICOM parser
        var dicomParser = new dwv.dicom.DicomParser();
        // parse the buffer
        dicomParser.parse(buffer);
    
        // worker callback
        var decodedBufferToView = function(event) {
            // create the view
            var viewFactory = new dwv.image.ViewFactory();
            var view = viewFactory.create( dicomParser.getDicomElements(), event.data );
            // return
            callback({"view": view, "info": dicomParser.getDicomElements().dumpToTable()});
        };

        var syntax = dwv.dicom.cleanString(dicomParser.getRawDicomElements().x00020010.value[0]);
        var algoName = dwv.dicom.getSyntaxDecompressionName(syntax);
        var needDecompression = (algoName !== null);

        var pixelBuffer = dicomParser.getRawDicomElements().x7FE00010.value;
        var bitsAllocated = dicomParser.getRawDicomElements().x00280100.value[0];
        var pixelRepresentation = dicomParser.getRawDicomElements().x00280103.value[0];
        var isSigned = (pixelRepresentation === 1);

        if ( needDecompression ) {
            if (useWorkers) {
                var script = decoderScripts[algoName];
                if ( typeof script === "undefined" ) {
                    throw new Error("No script provided to decompress '" + algoName + "' data.");
                }
                var workerTask = new dwv.utils.WorkerTask(script, decodedBufferToView, {
                    'buffer': pixelBuffer[0], // TODO only first frame...
                    'bitsAllocated': bitsAllocated,
                    'isSigned': isSigned } );
                pool.addWorkerTask(workerTask);
            }
            else {

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
                decodedBufferToView({data: decodedBuffer});
            }
        }
        else {
            decodedBufferToView({data: pixelBuffer});
        }
    };
};
