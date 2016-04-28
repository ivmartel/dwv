// namespaces
var dwv = dwv || {};
dwv.gui = dwv.gui || {};
dwv.gui.base = dwv.gui.base || {};

/**
 * Loadbox base gui.
 * @constructor
 */
dwv.gui.base.Loadbox = function (app, loaders)
{
    /**
     * Loader HTML select.
     * @private
     */
    var loaderSelector = null;
    
    /**
     * Setup the loadbox HTML.
     */
    this.setup = function ()
    {
        // create gui
        var loaderNames = [];
        for( var key in loaders ) {
            loaderNames.push(loaders[key].getDisplayName());
        }
        
        // loader select
        loaderSelector = dwv.html.createHtmlSelect("loaderSelect", loaderNames);
        loaderSelector.onchange = app.onChangeLoader;

        // node
        var node = app.getElement("loaderlist");
        // clear it
        while(node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
        // append
        node.appendChild(loaderSelector);
        // refresh
        dwv.gui.refreshElement(node);
    };

    /**
     * Display a loader.
     * @param {String} name The name of the loader to show.
     */
    this.displayLoader = function (name)
    {
        var keys = Object.keys(loaders);
        for ( var i = 0; i < keys.length; ++i ) {
            if ( keys[i] === name ) {
                loaders[keys[i]].display(true);
            }
            else {
                loaders[keys[i]].display(false);
            }
        }
    };
    
    /**
     * Reset to its original state.
     */
    this.reset = function () 
    {
        // display first loader
        var keys = Object.keys(loaders);
        this.displayLoader(keys[0]);
        // reset HTML select
        if (loaderSelector) {
            loaderSelector.selectedIndex = 0;
        }
    };

}; // class dwv.gui.base.Loadbox

/**
 * FileLoad base gui.
 * @constructor
 */
dwv.gui.base.FileLoad = function (app)
{
    // closure to self
    var self = this;
    
    /**
     * Get the loader display name.
     */
    this.getDisplayName = function()
    {
        return dwv.i18n("io.file.name");
    };

    /**
     * Internal file input change handler.
     * @param {Object} event The change event.
     */
    function onchangeinternal(event) {
        if (typeof self.onchange == "function") {
            self.onchange(event);
        }
        app.onChangeFiles(event);
    }
    
    /**
     * Setup the file load HTML to the page.
     */
    this.setup = function()
    {
        // input
        var fileLoadInput = document.createElement("input");
        fileLoadInput.onchange = onchangeinternal;
        fileLoadInput.type = "file";
        fileLoadInput.multiple = true;
        fileLoadInput.className = "imagefiles";
        fileLoadInput.setAttribute("data-clear-btn","true");
        fileLoadInput.setAttribute("data-mini","true");

        // associated div
        var fileLoadDiv = document.createElement("div");
        fileLoadDiv.className = "imagefilesdiv";
        fileLoadDiv.style.display = "none";
        fileLoadDiv.appendChild(fileLoadInput);

        // node
        var node = app.getElement("loaderlist");
        // append
        node.appendChild(fileLoadDiv);
        // refresh
        dwv.gui.refreshElement(node);
    };

    /**
     * Display the file load HTML.
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // file div element
        var node = app.getElement("loaderlist");
        var filediv = node.getElementsByClassName("imagefilesdiv")[0];
        filediv.style.display = bool ? "" : "none";
    };

}; // class dwv.gui.base.FileLoad

/**
 * UrlLoad base gui.
 * @constructor
 */
dwv.gui.base.UrlLoad = function (app)
{
    // closure to self
    var self = this;
    
    /**
     * Get the loader display name.
     */
    this.getDisplayName = function()
    {
        return dwv.i18n("io.url.name");
    };

    /**
     * Internal url input change handler.
     * @param {Object} event The change event.
     */
    function onchangeinternal(event) {
        if (typeof self.onchange == "function") {
            self.onchange(event);
        }
        app.onChangeURL(event);
    }
    
    /**
     * Setup the url load HTML to the page.
     */
    this.setup = function ()
    {
        // input
        var urlLoadInput = document.createElement("input");
        urlLoadInput.onchange = onchangeinternal;
        urlLoadInput.type = "url";
        urlLoadInput.className = "imageurl";
        urlLoadInput.setAttribute("data-clear-btn","true");
        urlLoadInput.setAttribute("data-mini","true");

        // associated div
        var urlLoadDiv = document.createElement("div");
        urlLoadDiv.className = "imageurldiv";
        urlLoadDiv.style.display = "none";
        urlLoadDiv.appendChild(urlLoadInput);

        // node
        var node = app.getElement("loaderlist");
        // append
        node.appendChild(urlLoadDiv);
        // refresh
        dwv.gui.refreshElement(node);
    };

    /**
     * Display the url load HTML.
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // url div element
        var node = app.getElement("loaderlist");
        var urldiv = node.getElementsByClassName("imageurldiv")[0];
        urldiv.style.display = bool ? "" : "none";
    };

}; // class dwv.gui.base.UrlLoad
