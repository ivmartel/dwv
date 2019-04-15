// namespaces
var dwv = dwv || {};
dwv.io = dwv.io || {};
// external
var JSZip = JSZip || {};

/**
 * ZIP data loader.
 * @constructor
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
     * Loading flag.
     * @private
     * @type Boolean
     */
    var isLoading = false;

    /**
     * Set the loader options.
     * @param {Object} opt The input options.
     */
    this.setOptions = function (opt) {
        options = opt;
    };

    /**
     * Is the load ongoing?
     * @return {Boolean} True if loading.
     */
    this.isLoading = function () {
        return isLoading;
    };

    var filename = "";
    var files = [];
    var zobjs = null;

    /**
     * JSZip.async callback
     * @param {ArrayBuffer} content unzipped file image
     * @param {Number} index The data index.
     * @return {}
     */
    function zipAsyncCallback(content, index)
    {
        files.push({"filename": filename, "data": content});

        // sent un-ziped progress with the data index
        // (max 50% to take into account the memory loading)
        var unzipPercent = files.length * 50 / zobjs.length;
        self.onprogress({'type': 'read-progress', 'lengthComputable': true,
            'loaded': unzipPercent, 'total': 100, 'index': index});

        // recursively call until we have all the files
        if (files.length < zobjs.length) {
            var num = files.length;
            filename = zobjs[num].name;
            zobjs[num].async("arrayBuffer").then( function (content) {
                zipAsyncCallback(content, index);
            });
        } else {
            var memoryIO = new dwv.io.MemoryLoader();
            memoryIO.onload = self.onload;
            memoryIO.onloadend = function () {
                // reset loading flag
                isLoading = false;
                // call listeners
                self.onloadend();
            };
            memoryIO.onprogress = function (progress) {
                // add 50% to take into account the un-zipping
                progress.loaded = 50 + progress.loaded / 2;
                // set data index
                progress.index = index;
                self.onprogress(progress);
            };
            memoryIO.onerror = self.onerror;
            memoryIO.onabort = self.onabort;

            memoryIO.load(files);
        }
    }

    /**
     * Load data.
     * @param {Object} buffer The DICOM buffer.
     * @param {String} origin The data origin.
     * @param {Number} index The data index.
     */
    this.load = function (buffer, origin, index) {
        // set loading flag
        isLoading = true;

        JSZip.loadAsync(buffer).then( function(zip) {
            files = [];
            zobjs = zip.file(/.*\.dcm/);
            // recursively load zip files into the files array
            var num = files.length;
            filename = zobjs[num].name;
            zobjs[num].async("arrayBuffer").then( function (content) {
                zipAsyncCallback(content, index);
            });
        });
    };

    /**
     * Abort load: pass to listeners.
     */
    this.abort = function () {
        // reset loading flag
        isLoading = false;
        // call listeners
        self.onabort();
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

}; // class DicomDataLoader

/**
 * Check if the loader can load the provided file.
 * @param {Object} file The file to check.
 * @return True if the file can be loaded.
 */
dwv.io.ZipLoader.prototype.canLoadFile = function (file) {
    var ext = dwv.utils.getFileExtension(file.name);
    return (ext === "zip");
};

/**
 * Check if the loader can load the provided url.
 * @param {String} url The url to check.
 * @return True if the url can be loaded.
 */
dwv.io.ZipLoader.prototype.canLoadUrl = function (url) {
    var urlObjext = dwv.utils.getUrlFromUri(url);
    var ext = dwv.utils.getFileExtension(urlObjext.pathname);
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
 * Handle an load end event.
 * Default does nothing.
 */
dwv.io.ZipLoader.prototype.onloadend = function () {};
/**
 * Handle a progress event.
 * @param {Object} event The progress event.
 * Default does nothing.
 */
dwv.io.ZipLoader.prototype.onprogress = function (/*event*/) {};
/**
 * Handle an error event.
 * @param {Object} event The error event with an
 *  optional 'event.message'.
 * Default does nothing.
 */
dwv.io.ZipLoader.prototype.onerror = function (/*event*/) {};
/**
 * Handle an abort event.
 * @param {Object} event The abort event with an
 *  optional 'event.message'.
 * Default does nothing.
 */
dwv.io.ZipLoader.prototype.onabort = function (/*event*/) {};

/**
 * Add to Loader list.
 */
dwv.io.loaderList = dwv.io.loaderList || [];
dwv.io.loaderList.push( "ZipLoader" );
