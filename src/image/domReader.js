// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Create a simple array buffer from an ImageData buffer.
 * @param {Object} imageData The ImageData taken from a context.
 * @return {Array} The image buffer.
 */
dwv.image.imageDataToBuffer = function (imageData) {
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
    return buffer;
};

/**
 * Get data from an input context imageData.
 * @param {Number} width The width of the coresponding image.
 * @param {Number} height The height of the coresponding image.
 * @param {Number} sliceIndex The slice index of the imageData.
 * @param {Object} imageBuffer The image buffer.
 * @param {Number} numberOfFrames The final number of frames.
 * @return {Object} The corresponding view.
 */
dwv.image.getDefaultView = function (
    width, height, sliceIndex,
    imageBuffer, numberOfFrames) {
    // image size
    var imageSize = new dwv.image.Size(width, height);
    // default spacing
    // TODO: misleading...
    var imageSpacing = new dwv.image.Spacing(1,1);
    // default origin
    var origin = new dwv.math.Point3D(0,0,sliceIndex);
    // create image
    var geometry = new dwv.image.Geometry(origin, imageSize, imageSpacing );
    var image = new dwv.image.Image( geometry, imageBuffer, numberOfFrames );
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
    // image size
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

    // create view
    var sliceIndex = image.index ? image.index : 0;
    var imageBuffer = dwv.image.imageDataToBuffer(imageData);
    var view = dwv.image.getDefaultView(
        width, height, sliceIndex, [imageBuffer]);

    // image properties
    var info = [];
    if( image.file )
    {
        info.push({ "name": "fileName", "value": image.file.name });
        info.push({ "name": "fileType", "value": image.file.type });
        info.push({ "name": "fileLastModifiedDate", "value": image.file.lastModifiedDate });
    }
    info.push({ "name": "imageWidth", "value": width });
    info.push({ "name": "imageHeight", "value": height });

    // return
    return {"view": view, "info": info};
};

/**
 * Get data from an input image using a canvas.
 * @param {Object} video The DOM Video.
 * @param {Object} callback The function to call once the data is loaded.
 * @param {Object} cbprogress The function to call to report progress.
 * @param {Object} cbonloadend The function to call to report load end.
 * @param {Number} dataindex The data index.
 */
dwv.image.getViewFromDOMVideo = function (video, callback, cbprogress, cbonloadend, dataIndex)
{
    // video size
    var width = video.videoWidth;
    var height = video.videoHeight;

    // default frame rate...
    var frameRate = 30;
    // number of frames
    var numberOfFrames = Math.floor(video.duration * frameRate);

    // video properties
    var info = [];
    if( video.file )
    {
        info.push({ "name": "fileName", "value": video.file.name });
        info.push({ "name": "fileType", "value": video.file.type });
        info.push({ "name": "fileLastModifiedDate", "value": video.file.lastModifiedDate });
    }
    info.push({ "name": "imageWidth", "value": width });
    info.push({ "name": "imageHeight", "value": height });
    info.push({ "name": "numberOfFrames", "value": numberOfFrames });

    // draw the image in the canvas in order to get its data
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');

    // using seeked to loop through all video frames
    video.addEventListener('seeked', onseeked, false);

    // current frame index
    var frameIndex = 0;
    // video view
    var view = null;

    // draw the context and store it as a frame
    function storeFrame() {
        // send progress
        var evprog = {'type': 'load-progress', 'lengthComputable': true,
            'loaded': frameIndex, 'total': numberOfFrames};
        if (typeof dataIndex !== "undefined") {
            evprog.index = dataIndex;
        }
        cbprogress(evprog);
        // draw image
        ctx.drawImage(video, 0, 0);
        // context to image buffer
        var imgBuffer = dwv.image.imageDataToBuffer(
            ctx.getImageData(0, 0, width, height) );
        if (frameIndex === 0) {
            // create view
            view = dwv.image.getDefaultView(
                width, height, 1, [imgBuffer], numberOfFrames);
            // call callback
            callback( {"view": view, "info": info } );
        } else {
            view.appendFrameBuffer(imgBuffer);
        }
    }

    // handle seeked event
    function onseeked(/*event*/) {
        // store
        storeFrame();
        // increment index
        ++frameIndex;
        // set the next time
        // (not using currentTime, it seems to get offseted)
        var nextTime = frameIndex / frameRate;
        if (nextTime <= this.duration) {
            this.currentTime = nextTime;
        } else {
            cbonloadend();
            // stop listening
            video.removeEventListener('seeked', onseeked);
        }
    }

    // trigger the first seeked
    video.currentTime = 0;
};
