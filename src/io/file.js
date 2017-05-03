// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.io = dwv.io || {};

dwv.io.MultiProgressHandler = function (callback)
{
    // closure to self
    var self = this;

    /**
     * List of progresses.
     * @private
     * @type Array
     */
    var progresses = [];

    /**
     * Current progress index.
     * @private
     * @type Number
     */
    var currentIndex = 0;

    /**
     * Multiplier.
     * @private
     * @type Number
     */
    var multi = 2;

    /**
     * Set the mulitplier.
     * @param {Number} mul The mulitplier.
     */
    this.setMulti = function (mul) {
        multi = mul;
    };

    /**
     * Set the number of data to load.
     * @param {Number} n The number of data to load.
     */
    this.setNToLoad = function (n) {
        for ( var i = 0; i < n; ++i ) {
            progresses[i] = [];
            for ( var j = 0; j < multi; ++j ) {
                progresses[i][j] = 0;
            }
        }
    };

    /**
     * Handle a load progress.
     * @param {Object} evet The progress event.
     */
    this.onprogress = function (event) {
        // check event
        if ( !event.lengthComputable ) {
            return;
        }
        if ( typeof event.subindex === "undefined" ) {
            return;
        }
        var index = currentIndex;
        if ( typeof event.index !== "undefined" ) {
            index = event.index;
        }
        // calculate percent
        var percent = (event.loaded * 100) / event.total;
        // set percent for index
        progresses[index][event.subindex] = percent;

        // increment currnetIndex if needed
        var done = true;
        for (var i = 0; i < multi; ++i) {
            if (progresses[currentIndex][i] !== 100) {
                done = false;
                break;
            }
        }
        if (done) {
            ++currentIndex;
            if (currentIndex === progresses.length) {
                currentIndex = 0;
            }
        }

        // call callback
        callback({type: event.type, lengthComputable: true,
            loaded: getGlobalPercent(), total: 100});
    };

    /**
     * Get the global load percent including the provided one.
     * @return {Number} The accumulated percentage.
     */
    function getGlobalPercent() {
        var sum = 0;
        for ( var i = 0; i < progresses.length; ++i ) {
            for ( var j = 0; j < multi; ++j ) {
                sum += progresses[i][j];
            }
        }
        return Math.round( sum / (progresses.length * multi) );
    }

    /**
     * Create a mono progress event handler.
     * @param {Number} index The index of the data.
     * @param {Number} subindex The sub-index of the data.
     */
    this.getMonoProgressHandler = function (index, subindex) {
        return function (event) {
            event.index = index;
            event.subindex = subindex;
            self.onprogress(event);
        };
    };

    /**
     * Create a mono progress event handler.
     * The class handles the progress index.
     * @param {Number} subindex The sub-index of the data.
     */
    this.getUndefinedMonoProgressHandler = function (subindex) {
        return function (event) {
            event.subindex = subindex;
            self.onprogress(event);
        };
    };
};

/**
 * File loader.
 * @constructor
 */
dwv.io.File = function ()
{
    /**
     * CLosure to self.
     * @private
     * @type Object
     */
    var self = this;

    /**
     * Number of data to load.
     * @private
     * @type Number
     */
    var nToLoad = 0;
    /**
     * Number of loaded data.
     * @private
     * @type Number
     */
    var nLoaded = 0;

    /**
     * The default character set (optional).
     * @private
     * @type String
     */
    var defaultCharacterSet;

    /**
     * Get the default character set.
     * @return {String} The default character set.
     */
    this.getDefaultCharacterSet = function () {
        return defaultCharacterSet;
    };

    /**
     * Set the default character set.
     * @param {String} characterSet The character set.
     */
    this.setDefaultCharacterSet = function (characterSet) {
        defaultCharacterSet = characterSet;
    };

    /**
     * Set the number of data to load.
     * @param {Number} n The number of data to load.
     */
    this.setNToLoad = function (n) {
        nToLoad = n;
    };

    /**
     * Increment the number of loaded data
     * and call onloadend if loaded all data.
     */
    this.addLoaded = function () {
        nLoaded++;
        if ( nLoaded === nToLoad ) {
            self.onloadend();
        }
    };

}; // class File

/**
 * Handle a load event.
 * @param {Object} event The load event, event.target
 *  should be the loaded data.
 */
dwv.io.File.prototype.onload = function (/*event*/)
{
    // default does nothing.
};
/**
 * Handle a load end event.
 */
dwv.io.File.prototype.onloadend = function ()
{
    // default does nothing.
};
/**
 * Handle a progress event.
 */
dwv.io.File.prototype.onprogress = function ()
{
    // default does nothing.
};
/**
 * Handle an error event.
 * @param {Object} event The error event, event.message
 *  should be the error message.
 */
dwv.io.File.prototype.onerror = function (/*event*/)
{
    // default does nothing.
};

// File loading data types
dwv.io.fileContentTypes = {
    'Text': 0,
    'ArrayBuffer': 1,
    'DataURL': 2
};
dwv.io.urlContentTypes = {
    'Text': 0,
    'ArrayBuffer': 1,
    'oups': 2
};

/**
 *
 */
dwv.io.DicomDataLoader = function () {
    // closure to self
    var self = this;

    var options = {};

    this.setOptions = function (opt) {
        options = opt;
    };

    // DICOM buffer to dwv.image.View (asynchronous)
    var db2v = new dwv.image.DicomBufferToView();

    function loadDicomBuffer(buffer) {
        // options
        if (typeof options.defaultCharacterSet !== "undefined") {
            db2v.setDefaultCharacterSet(options.defaultCharacterSet);
        }
        // connect handlers
        db2v.onload = self.addLoaded;
        db2v.onprogress = self.onprogress;
        // convert
        try {
            db2v.convert( buffer, self.onload );
        } catch (error) {
            self.onerror(error);
        }
    }

    this.getFileLoadHandler = function (/*file, index*/) {
        return function (event) {
            loadDicomBuffer(event.target.result);
        };
    };

    this.getUrlLoadHandler = function (url/*, index*/) {
        return function (/*event*/) {
            // check response status
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
            // status 200: "OK"; status 0: "debug"
            if (this.status !== 200 && this.status !== 0) {
                self.onerror({'name': "RequestError",
                    'message': "Error status: " + this.status +
                    " while loading '" + url + "' [DicomDataLoader]" });
                return;
            }
            // load
            loadDicomBuffer(this.response);
        };
    };

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
                "' (" + message + ") [DicomDataLoader]" } );
        };
    };

};
dwv.io.DicomDataLoader.prototype.canLoadFile = function (file) {
    var split = file.name.split('.');
    var ext = "";
    if (split.length !== 1) {
        ext = split.pop().toLowerCase();
    }
    var hasExt = (ext.length === 3);
    return !hasExt || (ext === "dcm");
};
dwv.io.DicomDataLoader.prototype.canLoadUrl = function (url) {
    var split = url.split('.');
    var ext = "";
    if (split.length !== 1) {
        ext = split.pop().toLowerCase();
    }
    var hasExt = (ext.length === 3);
    return !hasExt || (ext === "dcm");
};
dwv.io.DicomDataLoader.prototype.loadFileAs = function () {
    return dwv.io.fileContentTypes.ArrayBuffer;
};
dwv.io.DicomDataLoader.prototype.loadUrlAs = function () {
    return dwv.io.urlContentTypes.ArrayBuffer;
};
dwv.io.DicomDataLoader.prototype.onload = function () {
    // default does nothing.
};
dwv.io.DicomDataLoader.prototype.addLoaded = function () {
    // default does nothing.
};
dwv.io.DicomDataLoader.prototype.onerror = function () {
    // default does nothing.
};
dwv.io.DicomDataLoader.prototype.onprogress = function () {
    // default does nothing.
};

/**
 *
 */
dwv.io.RawImageLoader = function () {
    // closure to self
    var self = this;

    this.setOptions = function () {
        // does nothing
    };

    function loadDataUri( dataUri, origin, index ) {
        // create a DOM image
        var image = new Image();
        image.src = dataUri;
        // storing values to pass them on
        image.origin = origin;
        image.index = index;
        // triggered by ctx.drawImage
        image.onload = function (/*event*/) {
            try {
                self.onload( dwv.image.getViewFromDOMImage(this) );
                self.addLoaded();
            } catch (error) {
                self.onerror(error);
            }
            self.onprogress({type: event.type, lengthComputable: true,
                loaded: 100, total: 100});
        };
    }

    function createDataUri(response, ext) {
        // image data as string
        var bytes = new Uint8Array(response);
        var imageDataStr = '';
        for( var i = 0; i < bytes.byteLength; ++i ) {
            imageDataStr += String.fromCharCode(bytes[i]);
        }
        // image type
        var imageType = ext;
        if (imageType === "jpg") {
            imageType = "jpeg";
        }
        // create uri
        var uri = "data:image/" + imageType + ";base64," + window.btoa(imageDataStr);
        return uri;
    }

    this.getFileLoadHandler = function (file, index) {
        return function (event) {
            loadDataUri(event.target.result, file, index);
        };
    };

    this.getUrlLoadHandler = function (url, index) {
        return function (/*event*/) {
            // check response status
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
            // status 200: "OK"; status 0: "debug"
            if (this.status !== 200 && this.status !== 0) {
                self.onerror({'name': "RequestError",
                    'message': "Error status: " + this.status +
                    " while loading '" + url + "' [RawImageLoader]" });
                return;
            }
            // load
            var ext = url.split('.').pop().toLowerCase();
            loadDataUri(createDataUri(this.response, ext), url, index);
        };
    };

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
                "' (" + message + ") [RawImageLoader]" } );
        };
    };

};
dwv.io.RawImageLoader.prototype.canLoadFile = function (file) {
    return file.type.match("image.*");
};
dwv.io.RawImageLoader.prototype.canLoadUrl = function (url) {
    var ext = url.split('.').pop().toLowerCase();
    return (ext === "jpeg") || (ext === "jpg") ||
            (ext === "png") || (ext === "gif");
};
dwv.io.RawImageLoader.prototype.loadFileAs = function () {
    return dwv.io.fileContentTypes.DataURL;
};
dwv.io.RawImageLoader.prototype.loadUrlAs = function () {
    return dwv.io.urlContentTypes.ArrayBuffer;
};
dwv.io.RawImageLoader.prototype.onload = function () {
    // default does nothing.
};
dwv.io.RawImageLoader.prototype.addLoaded = function () {
    // default does nothing.
};
dwv.io.RawImageLoader.prototype.onerror = function () {
    // default does nothing.
};
dwv.io.RawImageLoader.prototype.onprogress = function () {
    // default does nothing.
};

/**
 *
 */
dwv.io.RawVideoLoader = function () {
    // closure to self
    var self = this;

    this.setOptions = function () {
        // does nothing
    };

    this.getFileLoadHandler = function (file, index) {
        return function (event) {
            // create a DOM video
            var video = document.createElement('video');
            video.src = event.target.result;
            // storing values to pass them on
            video.file = file;
            video.index = index;
            // onload handler
            video.onloadedmetadata = function (/*event*/) {
                try {
                    dwv.image.getViewFromDOMVideo(this, self.onload, self.onprogress);
                    self.addLoaded();
                } catch (error) {
                    self.onerror(error);
                }
            };
        };
    };

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
                "' (" + message + ") [RawVideoLoader]" } );
        };
    };

};
dwv.io.RawVideoLoader.prototype.canLoadFile = function (file) {
    return file.type.match("video.*");
};
dwv.io.RawVideoLoader.prototype.canLoadUrl = function (/*url*/) {
    //var ext = url.split('.').pop().toLowerCase();
    //return (ext === "mp4") || (ext === "ogg") ||
    //        (ext === "webm");
    return false;
};
dwv.io.RawVideoLoader.prototype.loadFileAs = function () {
    return dwv.io.fileContentTypes.DataURL;
};
dwv.io.RawVideoLoader.prototype.onload = function () {
    // default does nothing.
};
dwv.io.RawVideoLoader.prototype.addLoaded = function () {
    // default does nothing.
};
dwv.io.RawVideoLoader.prototype.onerror = function () {
    // default does nothing.
};
dwv.io.RawVideoLoader.prototype.onprogress = function () {
    // default does nothing.
};

/**
 *
 */
dwv.io.JSONTextLoader = function () {
    // closure to self
    var self = this;

    this.setOptions = function () {
        // does nothing
    };

    function loadJsonText(text) {
        try {
            self.onload( text );
            //self.addLoaded();
        } catch (error) {
            self.onerror(error);
        }
        self.onprogress({type: event.type, lengthComputable: true,
            loaded: 100, total: 100});
    }

    this.getFileLoadHandler = function (/*file, index*/) {
        return function (event) {
            loadJsonText(event.target.result);
        };
    };

    this.getUrlLoadHandler = function (url/*, index*/) {
        return function (/*event*/) {
            // check response status
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
            // status 200: "OK"; status 0: "debug"
            if (this.status !== 200 && this.status !== 0) {
                self.onerror({'name': "RequestError",
                    'message': "Error status: " + this.status +
                    " while loading '" + url + "' [JSONTextLoader]" });
                return;
            }
            // load
            loadJsonText(this.responseText);
        };
    };

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
                "' (" + message + ") [JSONTextLoader]" } );
        };
    };

};
dwv.io.JSONTextLoader.prototype.canLoadFile = function (file) {
    var ext = file.name.split('.').pop().toLowerCase();
    return (ext === "json");
};
dwv.io.JSONTextLoader.prototype.canLoadUrl = function (url) {
    var ext = url.split('.').pop().toLowerCase();
    return (ext === "json");
};
dwv.io.JSONTextLoader.prototype.loadFileAs = function () {
    return dwv.io.fileContentTypes.Text;
};
dwv.io.JSONTextLoader.prototype.loadUrlAs = function () {
    return dwv.io.urlContentTypes.Text;
};
dwv.io.JSONTextLoader.prototype.onload = function () {
    // default does nothing.
};
dwv.io.JSONTextLoader.prototype.addLoaded = function () {
    // default does nothing.
};
dwv.io.JSONTextLoader.prototype.onerror = function () {
    // default does nothing.
};
dwv.io.JSONTextLoader.prototype.onprogress = function () {
    // default does nothing.
};

/**
 * Load a list of files.
 * @param {Array} ioArray The list of files to load.
 * @external FileReader
 */
dwv.io.File.prototype.load = function (ioArray)
{
    // closure to self for handlers
    var self = this;
    // set the number of data to load
    this.setNToLoad( ioArray.length );

    var mproghandler = new dwv.io.MultiProgressHandler(self.onprogress);
    mproghandler.setNToLoad( ioArray.length );

    // create loaders
    var loaders = [];
    loaders.push( new dwv.io.DicomDataLoader() );
    loaders.push( new dwv.io.RawImageLoader() );
    loaders.push( new dwv.io.RawVideoLoader() );
    loaders.push( new dwv.io.JSONTextLoader() );

    // set loaders callbacks
    var loader = null;
    for (var k = 0; k < loaders.length; ++k) {
        loader = loaders[k];
        loader.onload = self.onload;
        loader.addLoaded = self.addLoaded;
        loader.onerror = self.onerror;
        loader.setOptions({
            'defaultCharacterSet': this.getDefaultCharacterSet()
        });
        loader.onprogress = mproghandler.getUndefinedMonoProgressHandler(1);
    }

    // loop on I/O elements
    for (var i = 0; i < ioArray.length; ++i)
    {
        var file = ioArray[i];
        var reader = new FileReader();

        // bind reader progress
        reader.onprogress = mproghandler.getMonoProgressHandler(i, 0);

        // find a loader
        var foundLoader = false;
        for (var l = 0; l < loaders.length; ++l) {
            loader = loaders[l];
            if (loader.canLoadFile(file)) {
                foundLoader = true;
                // set reader callbacks
                reader.onload = loader.getFileLoadHandler(file, i);
                reader.onerror = loader.getErrorHandler(file.name);
                // read
                if (loader.loadFileAs() === dwv.io.fileContentTypes.Text) {
                    reader.readAsText(file);
                } else if (loader.loadFileAs() === dwv.io.fileContentTypes.DataURL) {
                    reader.readAsDataURL(file);
                } else if (loader.loadFileAs() === dwv.io.fileContentTypes.ArrayBuffer) {
                    reader.readAsArrayBuffer(file);
                }
                // next file
                break;
            }
        }
        // TODO: throw?
        if (!foundLoader) {
            throw new Error("No loader found for file: "+file);
        }
    }
};
