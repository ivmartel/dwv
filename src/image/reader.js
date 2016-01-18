/** 
 * Image module.
 * @module image
 */
var dwv = dwv || {};
/**
 * Namespace for image related functions.
 * @class image
 * @namespace dwv
 * @static
 */
dwv.image = dwv.image || {};

/**
 * Get data from an input image using a canvas.
 * @method getDataFromImage
 * @static
 * @param {Image} image The image.
 * @return {Mixed} The corresponding view and info.
 */
dwv.image.getDataFromImage = function(image)
{
    // draw the image in the canvas in order to get its data
    var canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height);
    // get the image data
    var imageData = ctx.getImageData(0, 0, image.width, image.height);
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
    // create dwv Image
    var imageSize = new dwv.image.Size(image.width, image.height);
    // TODO: wrong info...
    var imageSpacing = new dwv.image.Spacing(1,1);
    var sliceIndex = image.index ? image.index : 0;
    var origin = new dwv.math.Point3D(0,0,sliceIndex);
    var geometry = new dwv.image.Geometry(origin, imageSize, imageSpacing );
    var dwvImage = new dwv.image.Image( geometry, buffer );
    dwvImage.setPhotometricInterpretation("RGB");
    // meta information
    var meta = {};
    meta.BitsStored = 8;
    dwvImage.setMeta(meta);
    // view
    var view = new dwv.image.View(dwvImage);
    view.setWindowLevelMinMax();
    // properties
    var info = {};
    if( image.file )
    {
        info.fileName = { "value": image.file.name };
        info.fileType = { "value": image.file.type };
        info.fileLastModifiedDate = { "value": image.file.lastModifiedDate };
    }
    info.imageWidth = { "value": image.width };
    info.imageHeight = { "value": image.height };
    // return
    return {"view": view, "info": info};
};



function ThreadPool(size) {
    var self = this;
 
    // set some defaults
    this.taskQueue = [];
    this.workerQueue = [];
    this.poolSize = size;
 
    this.addWorkerTask = function(workerTask) {
        if (self.workerQueue.length > 0) {
            // get the worker from the front of the queue
            var workerThread = self.workerQueue.shift();
            workerThread.run(workerTask);
        } else {
            // no free workers,
            self.taskQueue.push(workerTask);
        }
    };
 
    this.init = function() {
        // create 'size' number of worker threads
        for (var i = 0 ; i < size ; i++) {
            self.workerQueue.push(new WorkerThread(self));
        }
    };
 
    this.freeWorkerThread = function(workerThread) {
        if (self.taskQueue.length > 0) {
            // don't put back in queue, but execute next task
            var workerTask = self.taskQueue.shift();
            workerThread.run(workerTask);
        } else {
            self.workerQueue.push(workerThread);
        }
    };
}
 
// runner work tasks in the pool
function WorkerThread(parentPool) {
 
    var self = this;
 
    this.parentPool = parentPool;
    this.workerTask = {};
 
    this.run = function(workerTask) {
        this.workerTask = workerTask;
        // create a new web worker
        if (this.workerTask.script !== null) {
            var worker = new Worker(workerTask.script);
            worker.addEventListener('message', dummyCallback, false);
            worker.postMessage(workerTask.startMessage);
        }
    };
 
    // for now assume we only get a single callback from a worker
    // which also indicates the end of this worker.
    function dummyCallback(event) {
        // pass to original callback
        self.workerTask.callback(event);
 
        // we should use a separate thread to add the worker
        self.parentPool.freeWorkerThread(self);
        
        this.terminate();
    }
 
}
 
// task to run
function WorkerTask(script, callback, msg) {
 
    this.script = script;
    this.callback = callback;
    this.startMessage = msg;
}

var pool = new ThreadPool(15);
pool.init();


/**
 * Get data from an input buffer using a DICOM parser.
 * @method getDataFromDicomBuffer
 * @static
 * @param {Array} buffer The input data buffer.
 * @return {Mixed} The corresponding view and info.
 */
dwv.image.getDataFromDicomBuffer = function(buffer, onLoad)
{
    // DICOM parser
    var dicomParser = new dwv.dicom.DicomParser();
    // parse the buffer
    dicomParser.parse(buffer);

    var script = '../../src/dicom/decode-jpeg2000.js';
    var callback = function(e) {
        console.log("worker done.");
        //console.log(e);
        
        // create the view
        var viewFactory = new dwv.image.ViewFactory();
        var view = viewFactory.create( dicomParser.getDicomElements(), e.data );
        // return
        //return {"view": view, "info": dicomParser.getDicomElements().dumpToTable()};
        onLoad({"view": view, "info": dicomParser.getDicomElements().dumpToTable()});
    };
    var startMessage = dicomParser.pixelBuffer;
    
    /*var worker = new Worker(script);
    worker.addEventListener('message', callback, false);
    worker.postMessage(startMessage);*/

    var workerTask = new WorkerTask(script,callback,startMessage);
    pool.addWorkerTask(workerTask);
    
};
