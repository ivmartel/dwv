// namespaces
var dwv = dwv || {};
dwv.io = dwv.io || {};

/**
 * ZIP data loader.
 */
dwv.io.ZipLoader = function ()
{
    // closure to self
    var self = this;

    /**
     * Loader options.
     * @private
     * @type Object
     */
    var options = {};

    /**
     * Set the loader options.
     * @param {Object} opt The input options.
     */
    this.setOptions = function (opt) {
        options = opt;
    };

    var filename = "";
    var files = [];
    var zobjs = null;

    /**
     * JSZip.async callback
     * @param {ArrayBuffer} content unzipped file image
     * @return {}
     */
    function zipAsyncCallback(content)
    {
    	files.push({"filename": filename, "data": content});

    	if (files.length < zobjs.length){
    		var num = files.length;
    		filename = zobjs[num].name;
    		zobjs[num].async("arrayBuffer").then(zipAsyncCallback);
    	}
    	else {
            var memory = new dwv.io.Memory();
            memory.onload = self.onload;
            memory.onloadend = self.addLoaded;
            memory.onerror = self.onerror;
            memory.onprogress = self.onprogress;

            memory.load(files);
        }
    }

    /**
     * Load data.
     * @param {Object} buffer The DICOM buffer.
     * @param {String} origin The data origin.
     * @param {Number} index The data index.
     */
    this.load = function (buffer/*, origin, index*/) {
        JSZip.loadAsync(buffer).then( function(zip) {
            files = [];
        	zobjs = zip.file(/.*\.dcm/);
            // recursively load zip files into the files array
        	var num = files.length;
        	filename = zobjs[num].name;
        	zobjs[num].async("arrayBuffer").then(zipAsyncCallback);
        });
    };

    /**
     * Get a file load handler.
     * @param {Object} file The file to load.
     * @param {Number} index The index 'id' of the file.
     * @return {Function} A file load handler.
     */
    this.getFileLoadHandler = function (file, index) {
        return function (event) {
            self.load(event.target.result, file, index);
        };
    };

    /**
     * Get a url load handler.
     * @param {String} url The url to load.
     * @param {Number} index The index 'id' of the url.
     * @return {Function} A url load handler.
     */
    this.getUrlLoadHandler = function (url, index) {
        return function (/*event*/) {
            // check response status
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
            // status 200: "OK"; status 0: "debug"
            if (this.status !== 200 && this.status !== 0) {
                self.onerror({'name': "RequestError",
                    'message': "Error status: " + this.status +
                    " while loading '" + url + "' [ZipLoader]" });
                return;
            }
            // load
            self.load(this.response, url, index);
        };
    };

    /**
     * Get an error handler.
     * @param {String} origin The file.name/url at the origin of the error.
     * @return {Function} An error handler.
     */
    this.getErrorHandler = function (origin) {
        return function (event) {
            var message = "";
            if (typeof event.getMessage !== "undefined") {
                message = event.getMessage();
            } else if (typeof this.status !== "undefined") {
                message = "http status: " + this.status;
            }
            self.onerror( {'name': "RequestError",
                'message': "An error occurred while reading '" + origin +
                "' (" + message + ") [ZipLoader]" } );
        };
    };

}; // class DicomDataLoader

/**
 * Check if the loader can load the provided file.
 * @param {Object} file The file to check.
 * @return True if the file can be loaded.
 */
dwv.io.ZipLoader.prototype.canLoadFile = function (file) {
    var ext = file.name.split('.').pop().toLowerCase();
    return (ext === "zip");
};

/**
 * Check if the loader can load the provided url.
 * @param {String} url The url to check.
 * @return True if the url can be loaded.
 */
dwv.io.ZipLoader.prototype.canLoadUrl = function (url) {
    var ext = url.split('.').pop().toLowerCase();
    return (ext === "zip");
};

/**
 * Get the file content type needed by the loader.
 * @return One of the 'dwv.io.fileContentTypes'.
 */
dwv.io.ZipLoader.prototype.loadFileAs = function () {
    return dwv.io.fileContentTypes.ArrayBuffer;
};

/**
 * Get the url content type needed by the loader.
 * @return One of the 'dwv.io.urlContentTypes'.
 */
dwv.io.ZipLoader.prototype.loadUrlAs = function () {
    return dwv.io.urlContentTypes.ArrayBuffer;
};

/**
 * Handle a load event.
 * @param {Object} event The load event, 'event.target'
 *  should be the loaded data.
 * Default does nothing.
 */
dwv.io.ZipLoader.prototype.onload = function (/*event*/) {};
/**
 * Handle an add loaded event.
 * Default does nothing.
 */
dwv.io.ZipLoader.prototype.addLoaded = function () {};
/**
 * Handle an error event.
 * @param {Object} event The error event, 'event.message'
 *  should be the error message.
 * Default does nothing.
 */
dwv.io.ZipLoader.prototype.onerror = function (/*event*/) {};
/**
 * Handle a progress event.
 * @param {Object} event The progress event.
 * Default does nothing.
 */
dwv.io.ZipLoader.prototype.onprogress = function (/*event*/) {};

/**
 * Add to Loader list.
 */
dwv.io.loaderList = dwv.io.loaderList || [];
dwv.io.loaderList.push( "ZipLoader" );
