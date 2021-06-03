// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Create a simple array buffer from an ImageData buffer.
 *
 * @param {object} imageData The ImageData taken from a context.
 * @returns {Array} The image buffer.
 */
dwv.image.imageDataToBuffer = function (imageData) {
  // remove alpha
  // TODO support passing the full image data
  var dataLen = imageData.data.length;
  var buffer = new Uint8Array((dataLen / 4) * 3);
  var j = 0;
  for (var i = 0; i < dataLen; i += 4) {
    buffer[j] = imageData.data[i];
    buffer[j + 1] = imageData.data[i + 1];
    buffer[j + 2] = imageData.data[i + 2];
    j += 3;
  }
  return buffer;
};

/**
 * Get an image from an input context imageData.
 *
 * @param {number} width The width of the coresponding image.
 * @param {number} height The height of the coresponding image.
 * @param {number} sliceIndex The slice index of the imageData.
 * @param {object} imageBuffer The image buffer.
 * @param {number} numberOfFrames The final number of frames.
 * @param {string} imageUid The image UID.
 * @returns {object} The corresponding view.
 */
dwv.image.getDefaultImage = function (
  width, height, sliceIndex,
  imageBuffer, numberOfFrames,
  imageUid) {
  // image size
  var imageSize = new dwv.image.Size(width, height);
  // default spacing
  // TODO: misleading...
  var imageSpacing = new dwv.image.Spacing(1, 1);
  // default origin
  var origin = new dwv.math.Point3D(0, 0, sliceIndex);
  // create image
  var geometry = new dwv.image.Geometry(origin, imageSize, imageSpacing);
  var image = new dwv.image.Image(
    geometry, imageBuffer, numberOfFrames, [imageUid]);
  image.setPhotometricInterpretation('RGB');
  // meta information
  var meta = {};
  meta.BitsStored = 8;
  image.setMeta(meta);
  // return
  return image;
};

/**
 * Get data from an input image using a canvas.
 *
 * @param {object} domImage The DOM Image.
 * @param {object} origin The data origin.
 * @returns {object} A load data event.
 */
dwv.image.getViewFromDOMImage = function (domImage, origin) {
  // image size
  var width = domImage.width;
  var height = domImage.height;

  // draw the image in the canvas in order to get its data
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(domImage, 0, 0);
  // get the image data
  var imageData = ctx.getImageData(0, 0, width, height);

  // image properties
  var info = {};
  if (typeof domImage.origin === 'string') {
    info['origin'] = {value: domImage.origin};
  } else {
    info['fileName'] = {value: domImage.origin.name};
    info['fileType'] = {value: domImage.origin.type};
    info['fileLastModifiedDate'] = {value: domImage.origin.lastModifiedDate};
  }
  info['imageWidth'] = {value: width};
  info['imageHeight'] = {value: height};

  var sliceIndex = domImage.index ? domImage.index : 0;
  info['imageUid'] = {value: sliceIndex};

  // create view
  var imageBuffer = dwv.image.imageDataToBuffer(imageData);
  var image = dwv.image.getDefaultImage(
    width, height, sliceIndex, [imageBuffer], 1, sliceIndex);

  // return
  return {
    data: {
      image: image,
      info: info
    },
    source: origin
  };
};

/**
 * Get data from an input image using a canvas.
 *
 * @param {object} video The DOM Video.
 * @param {Function} onloaditem On load callback.
 * @param {object} onload The function to call once the data is loaded.
 * @param {object} onprogress The function to call to report progress.
 * @param {object} onloadend The function to call to report load end.
 * @param {number} dataIndex The data index.
 * @param {object} origin The data origin.
 */
dwv.image.getViewFromDOMVideo = function (
  video, onloaditem, onload, onprogress, onloadend,
  dataIndex, origin) {
  // video size
  var width = video.videoWidth;
  var height = video.videoHeight;

  // default frame rate...
  var frameRate = 30;
  // number of frames
  var numberOfFrames = Math.floor(video.duration * frameRate);

  // video properties
  var info = {};
  if (video.file) {
    info['fileName'] = {value: video.file.name};
    info['fileType'] = {value: video.file.type};
    info['fileLastModifiedDate'] = {value: video.file.lastModifiedDate};
  }
  info['imageWidth'] = {value: width};
  info['imageHeight'] = {value: height};
  info['numberOfFrames'] = {value: numberOfFrames};

  // draw the image in the canvas in order to get its data
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext('2d');

  // using seeked to loop through all video frames
  video.addEventListener('seeked', onseeked, false);

  // current frame index
  var frameIndex = 0;
  // video image
  var image = null;

  /**
   * Draw the context and store it as a frame
   */
  function storeFrame() {
    // send progress
    onprogress({
      lengthComputable: true,
      loaded: frameIndex,
      total: numberOfFrames,
      index: dataIndex,
      source: origin
    });
    // draw image
    ctx.drawImage(video, 0, 0);
    // context to image buffer
    var imgBuffer = dwv.image.imageDataToBuffer(
      ctx.getImageData(0, 0, width, height));
    if (frameIndex === 0) {
      // create view
      image = dwv.image.getDefaultImage(
        width, height, 1, [imgBuffer], numberOfFrames, dataIndex);
      // call callback
      onloaditem({
        data: {
          image: image,
          info: info
        },
        source: origin
      });
    } else {
      image.appendFrameBuffer(imgBuffer);
    }
    // increment index
    ++frameIndex;
  }

  var nextTime = 0;

  /**
   * Handle seeked event
   */
  function onseeked(/*event*/) {
    // store
    storeFrame();
    // set the next time
    // (not using currentTime, it seems to get offseted)
    nextTime += 1 / frameRate;
    if (nextTime <= this.duration) {
      this.currentTime = nextTime;
    } else {
      onload({
        source: origin
      });
      onloadend({
        source: origin
      });
      // stop listening
      video.removeEventListener('seeked', onseeked);
    }
  }

  // trigger the first seek
  video.currentTime = nextTime;
};
