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
dwv.gui.base = dwv.gui.base || {};

/**
 * Loadbox base gui.
 * @class Loadbox
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Loadbox = function (app, loaders)
{
    /**
     * Setup the loadbox HTML.
     * @method setup
     */
    this.setup = function ()
    {
        // loader select
        var loaderSelector = dwv.html.createHtmlSelect("loaderSelect", app.getLoaders());
        loaderSelector.onchange = app.onChangeLoader;
        
        // node
        var node = document.getElementById("loaderlist");
        // clear it
        while(node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
        // append
        node.appendChild(loaderSelector);
        // trigger create event (mobile)
        $("#loaderlist").trigger("create");
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
    
}; // class dwv.gui.base.Loadbox

/**
 * FileLoad base gui.
 * @class FileLoad
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.FileLoad = function (app)
{
    /**
     * Setup the file load HTML to the page.
     * @method setup
     */
    this.setup = function()
    {
        // input
        var fileLoadInput = document.createElement("input");
        fileLoadInput.onchange = app.onChangeFiles;
        fileLoadInput.type = "file";
        fileLoadInput.multiple = true;
        fileLoadInput.id = "imagefiles";
        fileLoadInput.setAttribute("data-clear-btn","true");
        fileLoadInput.setAttribute("data-mini","true");
    
        // associated div
        var fileLoadDiv = document.createElement("div");
        fileLoadDiv.id = "imagefilesdiv";
        fileLoadDiv.style.display = "none";
        fileLoadDiv.appendChild(fileLoadInput);
        
        // node
        var node = document.getElementById("loaderlist");
        // append
        node.appendChild(fileLoadDiv);
        // trigger create event (mobile)
        $("#loaderlist").trigger("create");
    };
    
    /**
     * Display the file load HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // file div element
        var filediv = document.getElementById("imagefilesdiv");
        filediv.style.display = bool ? "" : "none";
    };
    
}; // class dwv.gui.base.FileLoad

/**
 * FileLoad base gui.
 * @class FileLoad
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.UrlLoad = function (app)
{
    /**
     * Setup the url load HTML to the page.
     * @method setup
     */
    this.setup = function ()
    {
        // input
        var urlLoadInput = document.createElement("input");
        urlLoadInput.onchange = app.onChangeURL;
        urlLoadInput.type = "url";
        urlLoadInput.id = "imageurl";
        urlLoadInput.setAttribute("data-clear-btn","true");
        urlLoadInput.setAttribute("data-mini","true");
    
        // associated div
        var urlLoadDiv = document.createElement("div");
        urlLoadDiv.id = "imageurldiv";
        urlLoadDiv.style.display = "none";
        urlLoadDiv.appendChild(urlLoadInput);
    
        // node
        var node = document.getElementById("loaderlist");
        // append
        node.appendChild(urlLoadDiv);
        // trigger create event (mobile)
        $("#loaderlist").trigger("create");
    };
    
    /**
     * Display the url load HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // url div element
        var urldiv = document.getElementById("imageurldiv");
        urldiv.style.display = bool ? "" : "none";
    };

}; // class dwv.gui.base.UrlLoad
