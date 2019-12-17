// namespaces
var dwv = dwv || {};
dwv.gui = dwv.gui || {};
dwv.gui.info = dwv.gui.info || {};

/**
 * DICOM Header overlay info controller.
 * @constructor
 * @param {Object} app The assciated app.
 * @param {String} containerDivId The id of the container div.
 */
dwv.gui.info.Controller = function (app, containerDivId)
{
    // closure to self
    var self = this;

    // Info layer overlay guis
    var overlayGuis = [];
    // flag to tell if guis have been created
    var guisCreated = false;

    // overlay data
    var overlayData = {};

    // flag to know if the info layer is listening on the image.
    var isInfoLayerListening = false;

    /**
     * Create the different info elements.
     * TODO Get rid of the app input arg...
     */
    this.init = function ()
    {
        // create overlay info at each corner
        var pos_list = [
          "tl", "tc", "tr",
          "cl",       "cr",
          "bl", "bc", "br" ];

        for (var n = 0; n < pos_list.length; ++n) {
          var pos = pos_list[n];
          var infoElement = getElement("info" + pos);
          if (infoElement) {
            overlayGuis.push(new dwv.gui.info.Overlay(infoElement, pos));
          }
        }

        // listen to update data
        app.addEventListener("slice-change", self.onSliceChange);
        // first toggle: set to listening
        this.toggleListeners();
    };

    /**
     * Handle a new loaded slice event.
     * @param {Object} event The slice-load event.
     */
    this.onLoadSlice = function (event) {
        // create and store overlay data
        var dicomElements = event.data;
        var sopInstanceUid = dicomElements.x00080018.value[0];
        overlayData[sopInstanceUid] = dwv.gui.info.createOverlayData(
            new dwv.dicom.DicomElementsWrapper(dicomElements));

        // create overlay guis if not done
        if (!guisCreated) {
            for (var i = 0; i < overlayGuis.length; ++i) {
                overlayGuis[i].setOverlayData(overlayData[sopInstanceUid]);
                overlayGuis[i].create();
            }
            guisCreated = true;
        }
    };

    /**
     * Handle a changed slice event.
     * @param {Object} event The slice-change event.
     */
    this.onSliceChange = function (event) {
        // change the overlay data to the one of the new slice
        var sopInstanceUid = event.data.sopInstanceUid;
        for (var i = 0; i < overlayGuis.length; ++i) {
            overlayGuis[i].setOverlayData(overlayData[sopInstanceUid]);
        }
    };

    /**
     * Toggle info listeners.
     */
    this.toggleListeners = function () {
        if (overlayGuis.length == 0) {
            return;
        }

        var n;
        if (isInfoLayerListening) {
            for (n = 0; n < overlayGuis.length; ++n) {
                app.removeEventListener("zoom-change", overlayGuis[n].update);
                app.removeEventListener("wl-width-change", overlayGuis[n].update);
                app.removeEventListener("wl-center-change", overlayGuis[n].update);
                app.removeEventListener("position-change", overlayGuis[n].update);
                app.removeEventListener("frame-change", overlayGuis[n].update);
            }
        } else {
            for (n = 0; n < overlayGuis.length; ++n) {
                app.addEventListener("zoom-change", overlayGuis[n].update);
                app.addEventListener("wl-width-change", overlayGuis[n].update);
                app.addEventListener("wl-center-change", overlayGuis[n].update);
                app.addEventListener("position-change", overlayGuis[n].update);
                app.addEventListener("frame-change", overlayGuis[n].update);
            }
        }
        // update flag
        isInfoLayerListening = !isInfoLayerListening;
    };

    /**
     * Toggle info listeners and layer.
     */
    this.toggle = function () {
        // toggle layer
        var infoLayer = app.getElement("infoLayer");
        dwv.html.toggleDisplay(infoLayer);
        // toggle listeners
        this.toggleListeners();
    };

    /**
     * Get a HTML element associated to the application.
     * @param name The name or id to find.
     * @return The found element or null.
     */
    function getElement(name) {
        return dwv.gui.getElement(containerDivId, name);
    }
}; // class dwv.gui.info.Controller
