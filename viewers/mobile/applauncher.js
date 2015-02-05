/** 
 * Application launcher.
 */

// check browser support
dwv.browser.check();
// main application
var app = new dwv.App();

// launch when page is loaded
$(document).ready( function()
{
    // Add required loaders to the loader list
    dwv.io.loaders = {};
    dwv.io.loaders.file = dwv.io.File;
    dwv.io.loaders.url = dwv.io.Url;

    // append load container HTML
    dwv.gui.appendLoadboxHtml();
    // append loaders HTML
    dwv.gui.appendFileLoadHtml();
    dwv.gui.appendUrlLoadHtml();
    dwv.gui.displayFileLoadHtml(true);

    // Add filters to the filter list for the filter tool
    dwv.tool.filters = {};
    dwv.tool.filters.threshold = new dwv.tool.filter.Threshold(app);
    dwv.tool.filters.sharpen = new dwv.tool.filter.Sharpen(app);
    dwv.tool.filters.sobel = new dwv.tool.filter.Sobel(app);

    // Add shapes to the shape list for the draw tool
    dwv.tool.shapes = {};
    dwv.tool.shapes.line = dwv.tool.LineFactory;
    dwv.tool.shapes.protractor = dwv.tool.ProtractorFactory;
    dwv.tool.shapes.rectangle = dwv.tool.RectangleFactory;
    dwv.tool.shapes.roi = dwv.tool.RoiFactory;
    dwv.tool.shapes.ellipse = dwv.tool.EllipseFactory;

    var config = {
        "containerDivId": "dwv",
        "fitToWindow": true,
        "tools": ["WindowLevel", "ZoomPan", "Scroll", "Draw", "Livewire", "Filter"]
    };

    // initialise the application
    app.init(config);

    // append tool container HTML
    dwv.gui.appendToolboxHtml(app);
    // append tools HTML
    dwv.gui.appendWindowLevelHtml(app);
    dwv.gui.appendZoomAndPanHtml();
    dwv.gui.appendScrollHtml();
    dwv.gui.appendDrawHtml();
    dwv.gui.appendLivewireHtml();
    
    // append filter container HTML
    dwv.gui.appendFilterHtml();
    // append filters HTML
    dwv.gui.filter.appendThresholdHtml();
    dwv.gui.filter.appendSharpenHtml();
    dwv.gui.filter.appendSobelHtml();
    
    // append help HTML
    dwv.gui.appendHelpHtml(app, true);
    dwv.gui.appendVersionHtml();
    dwv.gui.appendUndoHtml();

    
    var size = dwv.gui.getWindowSize();
    $(".layerContainer").height(size.height);

});
