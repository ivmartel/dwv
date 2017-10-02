/**
 * JPEG 2000 decoder worker.
 */
// Do not warn if these variables were not defined before.
/* global importScripts, self, OpenJPEG */

importScripts('openJPEG-DynamicMemory-browser.js');

self.addEventListener('message', function (event) {

    // decode DICOM buffer
    // higly inspired from https://github.com/chafey/cornerstoneWADOImageLoader/blob/0.14.7/src/webWorker/decodeTask/decoders/decodeJPEG2000.js

    var bytesPerPixel = event.data.bitsAllocated / 8;
    var signed = event.data.isSigned;
    var data = event.data.buffer;

    var openJPEG = new OpenJPEG();

    var dataPtr = openJPEG._malloc(data.length);
    openJPEG.writeArrayToMemory(data, dataPtr);

    // create param outpout
    var imagePtrPtr = openJPEG._malloc(4);
    var imageSizePtr = openJPEG._malloc(4);
    var imageSizeXPtr = openJPEG._malloc(4);
    var imageSizeYPtr = openJPEG._malloc(4);
    var imageSizeCompPtr = openJPEG._malloc(4);

    var t0 = Date.now();
    var ret = openJPEG.ccall('jp2_decode', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number'],
      [dataPtr, data.length, imagePtrPtr, imageSizePtr, imageSizeXPtr, imageSizeYPtr, imageSizeCompPtr]);
    // add num vomp..etc

    if (ret !== 0) {
      console.log('[opj_decode] decoding failed!');
      openJPEG._free(dataPtr);
      openJPEG._free(openJPEG.getValue(imagePtrPtr, '*'));
      openJPEG._free(imageSizeXPtr);
      openJPEG._free(imageSizeYPtr);
      openJPEG._free(imageSizePtr);
      openJPEG._free(imageSizeCompPtr);

      return undefined;
    }

    var imagePtr = openJPEG.getValue(imagePtrPtr, '*');

    var image = {
        length: openJPEG.getValue(imageSizePtr, 'i32'),
        sx: openJPEG.getValue(imageSizeXPtr, 'i32'),
        sy: openJPEG.getValue(imageSizeYPtr, 'i32'),
        nbChannels: openJPEG.getValue(imageSizeCompPtr, 'i32'), // hard coded for now
        perf_timetodecode: undefined,
        pixelData: undefined
    };

    // Copy the data from the EMSCRIPTEN heap into the correct type array
    var length = image.sx * image.sy * image.nbChannels;
    var src32 = new Int32Array(openJPEG.HEAP32.buffer, imagePtr, length);

    if (bytesPerPixel === 1) {
      if (Uint8Array.from) {
        image.pixelData = Uint8Array.from(src32);
      } else {
        image.pixelData = new Uint8Array(length);
        for (var i = 0; i < length; i++) {
          image.pixelData[i] = src32[i];
        }
      }
    } else if (signed) {
      if (Int16Array.from) {
        image.pixelData = Int16Array.from(src32);
      } else {
        image.pixelData = new Int16Array(length);
        for (var i1 = 0; i1 < length; i1++) {
          image.pixelData[i1] = src32[i1];
        }
      }
    } else if (Uint16Array.from) {
      image.pixelData = Uint16Array.from(src32);
    } else {
      image.pixelData = new Uint16Array(length);
      for (var i2 = 0; i2 < length; i2++) {
        image.pixelData[i2] = src32[i2];
      }
    }

    var t1 = Date.now();

    image.perf_timetodecode = t1 - t0;

    // free
    openJPEG._free(dataPtr);
    openJPEG._free(imagePtrPtr);
    openJPEG._free(imagePtr);
    openJPEG._free(imageSizePtr);
    openJPEG._free(imageSizeXPtr);
    openJPEG._free(imageSizeYPtr);
    openJPEG._free(imageSizeCompPtr);

    // post decoded data
    var res = image.pixelData;
    self.postMessage([res]);

}, false);
