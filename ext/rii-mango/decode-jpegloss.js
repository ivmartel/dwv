/**
 * JPEG Lossless decoder worker.
 */
// Do not warn if these variables were not defined before.
/* global importScripts, self, jpeg */

importScripts('lossless-min.js'); 

self.addEventListener('message', function (e) {
    
    // decode DICOM buffer
    var buf = new Uint8Array(e.data);
    var decoder = new jpeg.lossless.Decoder(buf.buffer);
    var decoded = decoder.decode();
    // post decoded data
    var res = new Uint16Array(decoded.buffer);
    self.postMessage(res);
    
}, false);
