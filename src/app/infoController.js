// namespaces
var dwv = dwv || {};

/**
 * Info controller.
 * @constructor
 */
dwv.InfoController = function (containerDivId)
{

    // Info layer plot gui
    var plotInfo = null;
    // Info layer colour map gui
    var miniColourMap = null;
	// Info layer overlay
	var overlayInfos = [];
    // flag to know if the info layer is listening on the image.
    var isInfoLayerListening = false;

    /**
     * Create the different info elements.
     * TODO Get rid of the app input arg...
     */
    this.create = function (app)
    {
        var infocm = getElement("infocm");
        if (infocm) {
            miniColourMap = new dwv.gui.info.MiniColourMap(infocm, app);
            miniColourMap.create();
        }

		// create overlay info at each corner
		var pos_list = [
			"tl", "tc", "tr",
			"cl",       "cr",
			"bl", "bc", "br" ];

		var num = 0;
		for (var n=0; n<pos_list.length; n++){
			var pos = pos_list[n];
			var info = getElement("info" + pos);
			if (info) {
				overlayInfos[num] = new dwv.gui.info.Overlay(info, pos, app);
				overlayInfos[num].create();
				num++;
			}
		}

        var plot = getElement("plot");
        if (plot) {
            plotInfo = new dwv.gui.info.Plot(plot, app);
            plotInfo.create();
        }
    };

    /**
     * Toggle info listeners to the app and the view.
     * @param {Object} app The app to listen or not to.
     * @param {Object} view The view to listen or not to.
     */
    this.toggleListeners = function (app, view)
    {
        if (isInfoLayerListening) {
            removeListeners(app, view);
        }
        else {
            addListeners(app, view);
        }
    };

    /**
     * Get a HTML element associated to the application.
     * @param name The name or id to find.
     * @return The found element or null.
     */
    function getElement(name)
    {
        return dwv.gui.getElement(containerDivId, name);
    }

    /**
     * Add info listeners to the view.
     * @param {Object} app The app to listen to.
     * @param {Object} view The view to listen to.
     */
    function addListeners(app, view)
    {
        if (plotInfo) {
            view.addEventListener("wl-width-change", plotInfo.update);
            view.addEventListener("wl-center-change", plotInfo.update);
        }
        if (miniColourMap) {
            view.addEventListener("wl-width-change", miniColourMap.update);
            view.addEventListener("wl-center-change", miniColourMap.update);
            view.addEventListener("colour-change", miniColourMap.update);
        }
		if (overlayInfos.length > 0){
			for (var n=0; n<overlayInfos.length; n++){
				app.addEventListener("zoom-change", overlayInfos[n].update);
				view.addEventListener("wl-width-change", overlayInfos[n].update);
                view.addEventListener("wl-center-change", overlayInfos[n].update);
				view.addEventListener("position-change", overlayInfos[n].update);
				view.addEventListener("frame-change", overlayInfos[n].update);
			}
		}
        // udpate listening flag
        isInfoLayerListening = true;
    }

    /**
     * Remove info listeners to the view.
     * @param {Object} app The app to stop listening to.
     * @param {Object} view The view to stop listening to.
     */
    function removeListeners(app, view)
    {
        if (plotInfo) {
            view.removeEventListener("wl-width-change", plotInfo.update);
            view.removeEventListener("wl-center-change", plotInfo.update);
        }
        if (miniColourMap) {
            view.removeEventListener("wl-width-change", miniColourMap.update);
            view.removeEventListener("wl-center-change", miniColourMap.update);
            view.removeEventListener("colour-change", miniColourMap.update);
        }
		if (overlayInfos.length > 0){
			for (var n=0; n<overlayInfos.length; n++){
				app.removeEventListener("zoom-change", overlayInfos[n].update);
                view.removeEventListener("wl-width-change", overlayInfos[n].update);
				view.removeEventListener("wl-center-change", overlayInfos[n].update);
				view.removeEventListener("position-change", overlayInfos[n].update);
				view.removeEventListener("frame-change", overlayInfos[n].update);
			}
		}
        // udpate listening flag
        isInfoLayerListening = false;
    }

}; // class dwv.InfoController
