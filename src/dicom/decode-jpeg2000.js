/**
 * JPEG 2000 decoder worker.
 */
// Do not warn if these variables were not defined before.
/* global importScripts, self, JpxImage */

importScripts('../../ext/pdfjs/jpx.js'); 
importScripts('../../ext/pdfjs/util.js'); 
importScripts('../../ext/pdfjs/arithmetic_decoder.js'); 

self.addEventListener('message', function (e) {
    
    // decode DICOM buffer
    var decoder = new JpxImage();
    decoder.parse( e.data );
    // post decoded data
    var res = decoder.tiles[0].items;
    self.postMessage(res);
    
}, false);
