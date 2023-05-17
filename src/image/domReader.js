import {Size} from '../image/size';
import {Spacing} from '../image/spacing';
import {Geometry} from '../image/geometry';
import {Image} from '../image/image';
import {Point3D} from '../math/point';

/**
 * Create a simple array buffer from an ImageData buffer.
 *
 * @param {object} imageData The ImageData taken from a context.
 * @returns {Uint8Array} The image buffer.
 */
function imageDataToBuffer(imageData) {
  // remove alpha
  // TODO support passing the full image data
  const dataLen = imageData.data.length;
  const buffer = new Uint8Array((dataLen / 4) * 3);
  let j = 0;
  for (let i = 0; i < dataLen; i += 4) {
    buffer[j] = imageData.data[i];
    buffer[j + 1] = imageData.data[i + 1];
    buffer[j + 2] = imageData.data[i + 2];
    j += 3;
  }
  return buffer;
}

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
function getDefaultImage(
  width, height, sliceIndex,
  imageBuffer, numberOfFrames,
  imageUid) {
  // image size
  const imageSize = new Size([width, height, 1]);
  // default spacing
  // TODO: misleading...
  const imageSpacing = new Spacing([1, 1, 1]);
  // default origin
  const origin = new Point3D(0, 0, sliceIndex);
  // create image
  const geometry = new Geometry(origin, imageSize, imageSpacing);
  const image = new Image(geometry, imageBuffer, [imageUid]);
  image.setPhotometricInterpretation('RGB');
  // meta information
  const meta = {};
  meta.BitsStored = 8;
  if (typeof numberOfFrames !== 'undefined') {
    meta.numberOfFiles = numberOfFrames;
  }
  image.setMeta(meta);
  // return
  return image;
}

/**
 * Get data from an input image using a canvas.
 *
 * @param {object} domImage The DOM Image, an HTMLImageElement with extra info.
 * @param {object} origin The data origin.
 * @returns {object} A load data event.
 */
export function getViewFromDOMImage(domImage, origin) {
  // image size
  const width = domImage.width;
  const height = domImage.height;

  // draw the image in the canvas in order to get its data
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(domImage, 0, 0);
  // get the image data
  const imageData = ctx.getImageData(0, 0, width, height);

  // image properties
  const info = {};
  if (typeof domImage.origin === 'string') {
    info['origin'] = {value: domImage.origin};
  } else {
    info['fileName'] = {value: domImage.origin.name};
    info['fileType'] = {value: domImage.origin.type};
    info['fileLastModifiedDate'] = {value: domImage.origin.lastModifiedDate};
  }
  info['imageWidth'] = {value: width};
  info['imageHeight'] = {value: height};

  const sliceIndex = domImage.index ? domImage.index : 0;
  info['imageUid'] = {value: sliceIndex};

  // create view
  const imageBuffer = imageDataToBuffer(imageData);
  const image = getDefaultImage(
    width, height, sliceIndex, imageBuffer, 1, sliceIndex);

  // return
  return {
    data: {
      image: image,
      info: info
    },
    source: origin
  };
}

/**
 * Get data from an input image using a canvas.
 *
 * @param {object} video The DOM Video, an HTMLVideoElement with extra info.
 * @param {Function} onloaditem On load callback.
 * @param {object} onload The function to call once the data is loaded.
 * @param {object} onprogress The function to call to report progress.
 * @param {object} onloadend The function to call to report load end.
 * @param {string} dataIndex The data index.
 * @param {object} origin The data origin.
 */
export function getViewFromDOMVideo(
  video, onloaditem, onload, onprogress, onloadend,
  dataIndex, origin) {
  // video size
  const width = video.videoWidth;
  const height = video.videoHeight;

  // default frame rate...
  const frameRate = 30;
  // number of frames
  const numberOfFrames = Math.ceil(video.duration * frameRate);

  // video properties
  const info = {};
  if (video.file) {
    info['fileName'] = {value: video.file.name};
    info['fileType'] = {value: video.file.type};
    info['fileLastModifiedDate'] = {value: video.file.lastModifiedDate};
  }
  info['imageWidth'] = {value: width};
  info['imageHeight'] = {value: height};
  info['numberOfFrames'] = {value: numberOfFrames};
  info['imageUid'] = {value: 0};

  // draw the image in the canvas in order to get its data
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // using seeked to loop through all video frames
  video.addEventListener('seeked', onseeked, false);

  // current frame index
  let frameIndex = 0;
  // video image
  let image = null;

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
    const imgBuffer = imageDataToBuffer(
      ctx.getImageData(0, 0, width, height));
    if (frameIndex === 0) {
      // create view
      image = getDefaultImage(
        width, height, 1, imgBuffer, numberOfFrames, dataIndex);
      // call callback
      onloaditem({
        data: {
          image: image,
          info: info
        },
        source: origin
      });
    } else {
      image.appendFrameBuffer(imgBuffer, frameIndex);
    }
    // increment index
    ++frameIndex;
  }

  let nextTime = 0;

  /**
   * Handle seeked event
   *
   * @param {object} event The seeked event.
   */
  function onseeked(event) {
    // store
    storeFrame();
    // set the next time
    // (not using currentTime, it seems to get offseted)
    nextTime += 1 / frameRate;
    if (nextTime <= event.target.duration) {
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
}
