// namespaces
var dwv = dwv || {};
dwv.utils = dwv.utils || {};

/**
 * Multiple progresses handler.
 * Stores a multi dimensional list of progresses to allow to
 * calculate a global progress.
 * @param {Function} callback The function to pass the global progress to.
 */
dwv.utils.MultiProgressHandler = function (callback)
{
    // closure to self
    var self = this;

    /**
     * List of progresses.
     * First dimension is a list of item for which the progress is recorded,
     *   for example file names.
     * Second dimension is a list of possible progresses, for example
     *   the progress of the download and the progress of the decoding.
     * @private
     * @type Array
     */
    var progresses = [];

    /**
     * Number of dimensions.
     * @private
     * @type Number
     */
    var numberOfDimensions = 2;

    /**
     * Set the number of dimensions.
     * @param {Number} num The number.
     */
    this.setNumberOfDimensions = function (num) {
        numberOfDimensions = num;
    };

    /**
     * Set the number of data to load.
     * @param {Number} n The number of data to load.
     */
    this.setNToLoad = function (n) {
        for ( var i = 0; i < n; ++i ) {
            progresses[i] = [];
            for ( var j = 0; j < numberOfDimensions; ++j ) {
                progresses[i][j] = 0;
            }
        }
    };

    /**
     * Handle a load progress.
     * @param {Object} event The progress event.
     */
    this.onprogress = function (event) {
        // check event
        if ( !event.lengthComputable ) {
            return;
        }
        if ( typeof event.subindex === "undefined" ) {
            return;
        }
        if ( typeof event.index === "undefined" ) {
            return;
        }
        // calculate percent
        var percent = (event.loaded * 100) / event.total;
        // set percent for index
        progresses[event.index][event.subindex] = percent;

        // call callback
        callback({'type': event.type, 'lengthComputable': true,
            'loaded': getGlobalPercent(), 'total': 100});
    };

    /**
     * Get the global load percent including the provided one.
     * @return {Number} The accumulated percentage.
     */
    function getGlobalPercent() {
        var sum = 0;
        var lenprog = progresses.length;
        for ( var i = 0; i < lenprog; ++i ) {
            for ( var j = 0; j < numberOfDimensions; ++j ) {
                sum += progresses[i][j];
            }
        }
        return Math.round( sum / (lenprog * numberOfDimensions) );
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
     * Create a mono loadend event handler: sends a 100% progress.
     * @param {Number} index The index of the data.
     * @param {Number} subindex The sub-index of the data.
     */
    this.getMonoOnLoadEndHandler = function (index, subindex) {
        return function () {
            self.onprogress({'type': 'load-progress', 'lengthComputable': true,
                'loaded': 100, 'total': 100,
                'index': index, 'subindex': subindex});
        };
    };

    /**
     * Create a mono progress event handler with an undefined index.
     * Warning: The caller handles the progress index.
     * @param {Number} subindex The sub-index of the data.
     */
    this.getUndefinedMonoProgressHandler = function (subindex) {
        return function (event) {
            event.subindex = subindex;
            self.onprogress(event);
        };
    };
};
