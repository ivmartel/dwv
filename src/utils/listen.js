// namespaces
var dwv = dwv || {};
dwv.utils = dwv.utils || {};

/**
  * ListenerHandler class: handles add/removing and firing listeners.
  * @constructor
 */
dwv.utils.ListenerHandler = function ()
{
    /**
     * listeners.
     * @private
     */
    var listeners = {};

    /**
     * Add an event listener.
     * @param {String} type The event type.
     * @param {Object} callback The method associated with the provided event type,
     *    will be called with the fired event.
     */
    this.add = function (type, callback)
    {
        // create array if not present
        if ( typeof listeners[type] === "undefined" ) {
            listeners[type] = [];
        }
        // add callback to listeners array
        listeners[type].push(callback);
    };

    /**
     * Remove an event listener.
     * @param {String} type The event type.
     * @param {Object} callback The method associated with the provided event type.
     */
    this.remove = function (type, callback)
    {
        // check if the type is present
        if( typeof listeners[type] === "undefined" ) {
            return;
        }
        // remove from listeners array
        for ( var i = 0; i < listeners[type].length; ++i ) {
            if ( listeners[type][i] === callback ) {
                listeners[type].splice(i,1);
            }
        }
    };

    /**
     * Fire an event: call all associated listeners with the input event object.
     * @param {Object} event The event to fire.
     */
    this.fireEvent = function (event)
    {
        // check if they are listeners for the event type
        if ( typeof listeners[event.type] === "undefined" ) {
            return;
        }
        // fire events
        for ( var i=0; i < listeners[event.type].length; ++i ) {
            listeners[event.type][i](event);
        }
    };
};
