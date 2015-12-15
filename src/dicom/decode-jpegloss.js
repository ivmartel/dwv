importScripts('../../ext/rii-mango/lossless-min.js'); 


self.addEventListener('message', function (e) {
    
    //console.log("worker start...")
    //console.log(e)
    
    var buf = new Uint8Array(e.data);
    decoder = new jpeg.lossless.Decoder(buf.buffer);
    var decoded = decoder.decode();
    var res = new Uint16Array(decoded.buffer);
    
    self.postMessage(res);
    
}, false);
