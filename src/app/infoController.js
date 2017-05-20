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
    // Info layer windowing gui
    var windowingInfo = null;
    // Info layer position gui
    var positionInfo = null;
    // Info layer colour map gui
    var miniColourMap = null;
	// Info layer headers
	var headerInfos = [];
    // flag to know if the info layer is listening on the image.
    var isInfoLayerListening = false;

    /**
     * Create the different info elements.
     * TODO Get rid of the app input arg...
     */
    this.create = function (app)
    {
        var infotr = getElement("infotr");
        if (infotr) {
            windowingInfo = new dwv.gui.info.Windowing(infotr);
            windowingInfo.create();
        }

        var infotl = getElement("infotl");
        if (infotl) {
            positionInfo = new dwv.gui.info.Position(infotl);
            positionInfo.create();
        }

        var infobr = getElement("infobr");
        if (infobr) {
            miniColourMap = new dwv.gui.info.MiniColourMap(infobr, app);
            miniColourMap.create();
        }
		
		// create header info at each corner
		var pos_list = [
			"tl", "tc", "tr",
			"cl",       "cr",
			"bl", "bc", "br" ];

		var hnum = 0;
		for (var n=0; n<pos_list.length; n++){
			var pos = pos_list[n];
			var info = getElement("header" + pos);
			if (info) {
				headerInfos[hnum] = new dwv.gui.info.Header(info, pos, app);
				headerInfos[hnum].create();
				hnum++;
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
        if (windowingInfo) {
            view.addEventListener("wl-change", windowingInfo.update);
        }
        if (plotInfo) {
            view.addEventListener("wl-change", plotInfo.update);
        }
        if (miniColourMap) {
            view.addEventListener("wl-change", miniColourMap.update);
            view.addEventListener("colour-change", miniColourMap.update);
        }
        if (positionInfo) {
            view.addEventListener("position-change", positionInfo.update);
            view.addEventListener("frame-change", positionInfo.update);
        }
		if (headerInfos.length > 0){
			for (var n=0; n<headerInfos.length; n++){
				app.addEventListener("zoom-change", headerInfos[n].update);
				view.addEventListener("wl-change", headerInfos[n].update);
				view.addEventListener("position-change", headerInfos[n].update);
				view.addEventListener("frame-change", headerInfos[n].update);
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
        if (windowingInfo) {
            view.removeEventListener("wl-change", windowingInfo.update);
        }
        if (plotInfo) {
            view.removeEventListener("wl-change", plotInfo.update);
        }
        if (miniColourMap) {
            view.removeEventListener("wl-change", miniColourMap.update);
            view.removeEventListener("colour-change", miniColourMap.update);
        }
        if (positionInfo) {
            view.removeEventListener("position-change", positionInfo.update);
            view.removeEventListener("frame-change", positionInfo.update);
        }
		if (headerInfos.length > 0){
			for (var n=0; n<headerInfos.length; n++){
				app.removeEventListener("zoom-change", headerInfos[n].update);
				view.removeEventListener("wl-change", headerInfos[n].update);
				view.removeEventListener("position-change", headerInfos[n].update);
				view.removeEventListener("frame-change", headerInfos[n].update);
			}
		}
        // udpate listening flag
        isInfoLayerListening = false;
    }

}; // class dwv.InfoController
