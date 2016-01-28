/**
 * JPEG Baseline decoder worker.
 */
// Do not warn if these variables were not defined before.
/* global importScripts, self, JpegImage */

importScripts('jpg.js'); 

self.addEventListener('message', function (e) {
    
    // decode DICOM buffer
    var decoder = new JpegImage();
    decoder.parse( e.data );
    // post decoded data
    var res = decoder.getData(decoder.width,decoder.height);
    self.postMessage(res);
    
}, false);
