// namespaces
var dwv = dwv || {};
dwv.gui = dwv.gui || {};

/**
 * Dropbox loader
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.gui.DropboxLoader = function (app)
{
    /**
     * Initialise the drop box.
     */
    this.init = function () {
        // listen to drag&drop
        var box = app.getElement("dropBox");
        if ( box ) {
            box.addEventListener("dragover", onDragOver);
            box.addEventListener("dragleave", onDragLeave);
            box.addEventListener("drop", onDrop);
            // initial size
            var size = app.getLayerContainerSize();
            var dropBoxSize = 2 * size.height / 3;
            box.setAttribute("style","width:"+dropBoxSize+"px;height:"+dropBoxSize+"px");
        }
    }

    /**
     * Switch listening from the box to the layer container.
     */
    this.switchToLayerContainer = function () {
        // stop box listening to drag (after first drag)
        var box = app.getElement("dropBox");
        var layerDiv = app.getElement("layerContainer");
        if ( box && layerDiv) {
            // stop listening to the box
            box.removeEventListener("dragover", onDragOver);
            box.removeEventListener("dragleave", onDragLeave);
            box.removeEventListener("drop", onDrop);
            // remove the box node
            dwv.html.removeNode(box);
            // start listening to the layerContainer
            layerDiv.addEventListener("dragover", onDragOver);
            layerDiv.addEventListener("dragleave", onDragLeave);
            layerDiv.addEventListener("drop", onDrop);
        }
    }

    /**
     * Handle a drag over.
     * @private
     * @param {Object} event The event to handle.
     */
    function onDragOver(event)
    {
        // prevent default handling
        event.stopPropagation();
        event.preventDefault();
        // update box
        var box = app.getElement("dropBox");
        if ( box ) {
            box.className = 'dropBox hover';
        }
    }

    /**
     * Handle a drag leave.
     * @private
     * @param {Object} event The event to handle.
     */
    function onDragLeave(event)
    {
        // prevent default handling
        event.stopPropagation();
        event.preventDefault();
        // update box
        var box = app.getElement("dropBox hover");
        if ( box ) {
            box.className = 'dropBox';
        }
    }

    /**
     * Handle a drop event.
     * @private
     * @param {Object} event The event to handle.
     */
    function onDrop(event)
    {
        // prevent default handling
        event.stopPropagation();
        event.preventDefault();
        // load files
        app.loadFiles(event.dataTransfer.files);
    }

}; // dwv.gui.dropboxLoader
