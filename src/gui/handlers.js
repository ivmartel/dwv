/** 
 * GUI module.
 * @module gui
 */
var dwv = dwv || {};
/**
 * Namespace for GUI functions.
 * @class gui
 * @namespace dwv
 * @static
 */
dwv.gui = dwv.gui || {};

/**
 * Handle loader change.
 * @method onChangeLoader
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeLoader = function(/*event*/)
{
    if( this.value === "file") {
        dwv.gui.displayUrlLoadHtml(false);
        dwv.gui.displayFileLoadHtml(true);
    }
    else if( this.value === "url") {
        dwv.gui.displayFileLoadHtml(false);
        dwv.gui.displayUrlLoadHtml(true);
    }
};

/**
 * Handle files change.
 * @method onChangeFiles
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeFiles = function(event)
{
    app.onChangeFiles(event);
};

/**
 * Handle URL change.
 * @method onChangeURL
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeURL = function(event)
{
    app.onChangeURL(event);
};

/**
 * Handle display reset.
 * @method onDisplayReset
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onDisplayReset = function(event)
{
    dwv.gui.onZoomReset(event);
    app.initWLDisplay();
    // update preset select
    var select = document.getElementById("presetSelect");
    select.selectedIndex = 0;
    dwv.gui.refreshSelect("#presetSelect");
};

/**
 * Handle undo.
 * @method onUndo
 * @static
 * @param {Object} event The associated event.
 */
dwv.gui.onUndo = function(/*event*/)
{
    app.getUndoStack().undo();
};

/**
 * Handle redo.
 * @method onRedo
 * @static
 * @param {Object} event The associated event.
 */
dwv.gui.onRedo = function(/*event*/)
{
    app.getUndoStack().redo();
};

/**
 * Handle toggle of info layer.
 * @method onToggleInfoLayer
 * @static
 * @param {Object} event The associated event.
 */
dwv.gui.onToggleInfoLayer = function(/*event*/)
{
    app.toggleInfoLayerDisplay();
};
