/**
 * JPEG 2000 decoder worker.
 */
// Do not warn if these variables were not defined before.
/* global importScripts, self, JpxImage */

importScripts('jpx.js', 'util.js', 'arithmetic_decoder.js'); 

self.addEventListener('message', function (e) {
    
    // decode DICOM buffer
    var decoder = new JpxImage();
    decoder.parse( e.data );
    // post decoded data
    var res = decoder.tiles[0].items;
    self.postMessage(res);
    
}, false);
