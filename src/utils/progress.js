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
     * Call the member callback with a global event.
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

        // item progress
        var item = null;
        if (typeof event.item !== "undefined") {
            item = event.item;
        } else {
            item = {
                loaded: getItemProgress(event.index),
                total: 100,
                source: event.source
            };
        }

        // call callback with a global event
        callback({
            lengthComputable: true,
            loaded: getGlobalPercent(),
            total: 100,
            item: item
        });
    };

    /**
     * Get the item load percent.
     * @param {Number} index The index of the item.
     * @return {Number} The load percentage.
     * @private
     */
    function getItemProgress(index) {
        var sum = 0;
        for ( var j = 0; j < numberOfDimensions; ++j ) {
            sum += progresses[index][j];
        }
        return sum / numberOfDimensions;
    }

    /**
     * Get the global load percent including the provided one.
     * @return {Number} The accumulated percentage.
     * @private
     */
    function getGlobalPercent() {
        var sum = 0;
        var lenprog = progresses.length;
        for ( var i = 0; i < lenprog; ++i ) {
            sum += getItemProgress(i);
        }
        return Math.round( sum / lenprog );
    }

    /**
     * Create a mono progress event handler.
     * @param {Number} index The index of the data.
     * @param {Number} subindex The sub-index of the data.
     * @param {Mixed} source The progress source.
     */
    this.getMonoProgressHandler = function (index, subindex, source) {
        return function (event) {
            event.index = index;
            event.subindex = subindex;
            event.source = source;
            self.onprogress(event);
        };
    };

    /**
     * Create a mono progress event handler with an undefined index.
     * Warning: The caller handles the progress index.
     * @param {Number} subindex The sub-index of the data.
     * @param {Mixed} source The progress source.
     */
    this.getUndefinedMonoProgressHandler = function (subindex, source) {
        return function (event) {
            event.subindex = subindex;
            event.source = source;
            self.onprogress(event);
        };
    };
};
