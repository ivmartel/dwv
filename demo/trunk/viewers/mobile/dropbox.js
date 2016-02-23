/**
 * Dropbox related utils.
 * Depends upon:
 * - https://www.dropbox.com/static/api/2/dropins.js
 * API doc page: https://www.dropbox.com/developers/chooser
 */
var dwv = dwv || {};
dwv.dropbox = dwv.dropbox || {};

var Dropbox = Dropbox || {};

/**
 * DropboxLoad gui.
 * @class DropboxLoad
 * @namespace dwv.gui
 * @constructor
 */
dwv.gui.DropboxLoad = function (app)
{
    /**
     * Setup the dropbox load HTML to the page.
     * @method setup
     */
    this.setup = function()
    {
        // associated div
        var gdriveLoadDiv = document.createElement("div");
        gdriveLoadDiv.className = "dropboxdiv";
        gdriveLoadDiv.style.display = "none";

        // node
        var node = app.getElement("loaderlist");
        // append
        node.appendChild(gdriveLoadDiv);
        // refresh
        dwv.gui.refreshElement(node);
    };

    /**
     * Display the file load HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // gdrive div element
        var node = app.getElement("loaderlist");
        var filediv = node.getElementsByClassName("dropboxdiv")[0];
        filediv.style.display = bool ? "" : "none";
        
        if (bool) {
            var options = {
                // Required. Called when a user selects an item in the Chooser.
                success: function (files) {
                    var urls = [];
                    for (var i = 0; i < files.length; ++i) {
                        urls[urls.length] = files[i].link;
                    }
                    app.loadURL(urls);
                },
                // Optional. Called when the user closes the dialog without selecting a file
                // and does not include any parameters.
                cancel: function () {},
                // Optional. "preview" (default) is a preview link to the document for sharing,
                // "direct" is an expiring link to download the contents of the file. For more
                // information about link types, see Link types below.
                linkType: "direct", // "preview" or "direct"
                // Optional. A value of false (default) limits selection to a single file, while
                // true enables multiple file selection.
                multiselect: true, // true or false
                // Optional. List of file extensions
                extensions: ['.dcm'],
            };
            Dropbox.choose(options);
        }
    };
};
