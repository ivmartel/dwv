importScripts('../../ext/pdfjs/jpx.js'); 
importScripts('../../ext/pdfjs/util.js'); 
importScripts('../../ext/pdfjs/arithmetic_decoder.js'); 

self.addEventListener('message', function (e) {
    
    //console.log("worker start...")
    //console.log(e)
    
    var decoder = new JpxImage();
    decoder.parse( e.data );
    // set the pixel buffer
    var res = decoder.tiles[0].items;
    
    self.postMessage(res);
    
}, false);
