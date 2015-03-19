/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};

/**
 * State class.
 * Saves: data url/path, display info, undo stack.
 * @class State
 * @namespace dwv
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.State = function (/*app*/)
{
    var _urls = [];
    
    this.setUrls = function (urls) {
        _urls = urls;
    };
    
    /**
     * Save state.
     * @method save
     */
    this.toJSON = function () {
        return $.toJSON({
            'urls': _urls
        });
    };
    /**
     * Load state.
     * @method load
     */
    this.fromJSON = function (json) {
        console.log(json);
    };
}; // State class
