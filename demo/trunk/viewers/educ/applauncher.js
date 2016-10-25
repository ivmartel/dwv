/**
 * Application launcher.
 */

function setUpHtml(dwvId) {

    var toolbarDiv = document.createElement("div");
    toolbarDiv.className = "toolbar";

    var canvas = document.createElement("canvas");
    canvas.className = "imageLayer";
    var drawDiv = document.createElement("div");
    drawDiv.className = "drawDiv";

    var layerDiv = document.createElement("div");
    layerDiv.className = "layerContainer";
    layerDiv.appendChild(canvas);
    layerDiv.appendChild(drawDiv);

    var drawListDiv = document.createElement("div");
    drawListDiv.id = "dwv-"+dwvId+"-drawList";

    var dwvDiv = document.createElement("div");
    dwvDiv.id = "dwv-"+dwvId;
    dwvDiv.appendChild(toolbarDiv);
    dwvDiv.appendChild(layerDiv);
    dwvDiv.appendChild(drawListDiv);

    var mainDiv = document.getElementById("mainContent");
    // clear previous
    dwv.html.cleanNode(mainDiv);
    // append new
    mainDiv.appendChild(dwvDiv);
}

// start app function
function startApp(caseNumber) {

    setUpHtml(caseNumber);

    // main application
    var myapp = new dwv.App();
    // initialise the application
    myapp.init({
        "containerDivId": "dwv-"+caseNumber,
        "fitToWindow": false,
        "gui": ["tool", "drawList"],
        "tools": ["Scroll", "ZoomAndPan", "WindowLevel", "Draw"],
        "shapes": ["Line", "Protractor", "Rectangle", "Roi", "Ellipse"],
        "isMobile": true
    });
    dwv.gui.appendResetHtml(myapp);

    var rootDir = "/dwv/demo/trunk//viewers/educ/data";
    if (caseNumber === 0) {
        myapp.loadURLs([
            rootDir+"/case"+caseNumber+"/data-1.dcm",
            rootDir+"/case"+caseNumber+"/data-2.dcm",
            rootDir+"/case"+caseNumber+"/data-3.dcm",
            rootDir+"/case"+caseNumber+"/data-4.dcm",
            rootDir+"/case"+caseNumber+"/data-5.dcm"
        ]);
    }
    else {
        myapp.loadURLs([rootDir+"/case"+caseNumber+"/data.dcm"]);
    }

    // load state after image
    //var listener = function (/*event*/) {
    //    myapp.loadURLs(["data/case1/state.json"]);
    //};
    // listen to load-end
    //myapp.addEventListener("load-end", listener);

    var listener = function (event) {
        if (event.loaded === 100) {
            myapp.loadURLs([rootDir+"/case"+caseNumber+"/state.json"]);
        }
    };
    myapp.addEventListener("load-progress", listener);

}

// Image decoders (for web workers)
dwv.image.decoderScripts = {
    "jpeg2000": "../../ext/pdfjs/decode-jpeg2000.js",
    "jpeg-lossless": "../../ext/rii-mango/decode-jpegloss.js",
    "jpeg-baseline": "../../ext/pdfjs/decode-jpegbaseline.js"
};

// check browser support
dwv.browser.check();
// initialise i18n
dwv.i18nInitialise();
// launch when page is loaded
$(document).ready( function()
{
    // and i18n is loaded
    //dwv.i18nOnLoaded( startApp );
});
