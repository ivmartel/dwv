--
-- DICOM Web Viewer (DWV) lua script for integration in a Conquest PACS server.
--
-- Usage:
-- 1. copy this file onto your web server
-- 2. in the 'dicom.ini' of your web server, create the dwv viewer:
-- >> [dwv-static]
-- >> source = dwv-static.lua
-- And set it as the default viewer:
-- >> [webdefaults]
-- >> ...
-- >> viewer = dwv-static
-- 3. copy the DWV distribution files in a 'dwv' folder
-- in the web folder of your web server. It should be accessible
-- via '[server address]/dwv'.
--
-- This script relies on the 'kFactorFile', 'ACRNemaMap' and 'Dictionary'
-- variables being set correctly.

-- Get ids

local patientid = string.gsub(series2, ':.*$', '')
local seriesuid = string.gsub(series2, '^.*:', '')

-- Functions declaration

function getstudyuid()
  local a, b, s
  s = servercommand('get_param:MyACRNema')
  b = newdicomobject()
  b.PatientID = patientid
  b.SeriesInstanceUID = seriesuid
  b.StudyInstanceUID = ''
  a = dicomquery(s, 'SERIES', b)
  return a[0].StudyInstanceUID
end

function queryimages()
  local images, imaget, b, s
  s = servercommand('get_param:MyACRNema')
  b = newdicomobject()
  b.PatientID = patientid
  b.SeriesInstanceUID = seriesuid
  b.SOPInstanceUID = ''
  images = dicomquery(s, 'IMAGE', b)

  imaget={}
  for k=0,#images-1 do
    imaget[k+1]={}
    imaget[k+1].SOPInstanceUID = images[k].SOPInstanceUID
  end
  table.sort(imaget, function(a,b) return a.SOPInstanceUID < b.SOPInstanceUID end)

  return imaget
end

-- Main

local studyuid = getstudyuid()
local images = queryimages()
-- create the url lua array
local urlRoot = webscriptadress
urlRoot = urlRoot .. '?requestType=WADO&contentType=application/dicom'
urlRoot = urlRoot .. '&seriesUID=' .. seriesuid
urlRoot = urlRoot .. '&studyUID=' .. studyuid
local urls = {}
for i=1, #images do
  urls[i] = urlRoot .. '&objectUID=' .. images[i].SOPInstanceUID
end

-- Generate html

HTML('Content-type: text/html\n\n')

-- paths with extra /dwv
print([[
<!DOCTYPE html>
<html>

<head>
<title>DICOM Web Viewer</title>
<meta charset="UTF-8">
]])

print([[
<link type="text/css" rel="stylesheet" href="/dwv/css/style.css">
<style type="text/css" >
body { background-color: #222; color: white; font-size: 80%; }
#pageHeader h1 { display: inline-block; margin: 0; color: #fff; }
#pageHeader a { color: #ddf; }
#pageHeader .toolbar { display: inline-block; float: right; }
.toolList ul { padding: 0; }
.toolList li { list-style-type: none; }
#pageMain { position: absolute; height: 92%; width: 99%; bottom: 5px; left: 5px; background-color: #333; }
.infotl { text-shadow: 0 1px 0 #000; }
.infotc { text-shadow: 0 1px 0 #000; }
.infotr { text-shadow: 0 1px 0 #000; }
.infocl { text-shadow: 0 1px 0 #000; }
.infocr { text-shadow: 0 1px 0 #000; }
.infobl { text-shadow: 0 1px 0 #000; }
.infobc { text-shadow: 0 1px 0 #000; }
.infobr { text-shadow: 0 1px 0 #000; }
.dropBox { margin: 20px; }
.ui-icon { zoom: 125%; }
.tagsTable tr:nth-child(even) { background-color: #333; }
.drawList tr:nth-child(even) { background-color: #333; }
button, input, li, table { margin-top: 0.2em; }
li button, li input { margin: 0; }
.history_list { width: 100%; }
</style>
<link type="text/css" rel="stylesheet" href="/dwv/ext/jquery-ui/themes/ui-darkness/jquery-ui-1.12.1.min.css">
]])

print([[
<!-- Third party (dwv) -->
<script type="text/javascript" src="/dwv/ext/i18next/i18next.min.js"></script>
<script type="text/javascript" src="/dwv/ext/i18next/i18nextXHRBackend.min.js"></script>
<script type="text/javascript" src="/dwv/ext/i18next/i18nextBrowserLanguageDetector.min.js"></script>
<script type="text/javascript" src="/dwv/ext/konva/konva.min.js"></script>
<script type="text/javascript" src="/dwv/ext/magic-wand/magic-wand.js"></script>
<script type="text/javascript" src="/dwv/ext/jszip/jszip.min.js"></script>
]])

print([[
<!-- Third party (viewer) -->
<script type="text/javascript" src="/dwv/ext/jquery/jquery-2.1.4.min.js"></script>
<script type="text/javascript" src="/dwv/ext/jquery-ui/jquery-ui-1.12.1.min.js"></script>
<script type="text/javascript" src="/dwv/ext/flot/jquery.flot.min.js"></script>
]])

print([[
<!-- Decoders -->
<script type="text/javascript" src="/dwv/decoders/pdfjs/jpx.js"></script>
<script type="text/javascript" src="/dwv/decoders/pdfjs/util.js"></script>
<script type="text/javascript" src="/dwv/decoders/pdfjs/arithmetic_decoder.js"></script>
<script type="text/javascript" src="/dwv/decoders/pdfjs/jpg.js"></script>
<script type="text/javascript" src="/dwv/decoders/rii-mango/lossless-min.js"></script>
]])

print([[
<!-- Local -->
<script type="text/javascript" src="/dwv/dwv-0.23.5.min.js"></script>
<!-- Launch the app -->
<script type="text/javascript" src="/dwv/viewers/static/appgui.js"></script>
]])

print([[
<script type="text/javascript">
// start app function
function startApp() {
    // gui setup
    dwv.gui.setup();
    // main application
    var myapp = new dwv.App();
    // initialise the application
    myapp.init({
        "containerDivId": "dwv",
        "fitToWindow": true,
        "gui": ["tool", "load", "help", "undo", "version", "tags", "drawList"],
        "loaders": ["File", "Url"],
        "tools": ["Scroll", "WindowLevel", "ZoomAndPan", "Draw", "Livewire", "Filter", "Floodfill"],
        "filters": ["Threshold", "Sharpen", "Sobel"],
        "shapes": ["Arrow", "Ruler", "Protractor", "Rectangle", "Roi", "Ellipse", "FreeHand"],
        "isMobile": false,
        "skipLoadUrl": true
    });
    // help
    // TODO Seems accordion only works when at end...
    $("#accordion").accordion({ collapsible: "true", active: "false", heightStyle: "content" });
]])
-- create javascript url array
print([[
    var inputUrls = [
]])
for i=1, #images do
  print('      "'..urls[i]..'",')
end
print([[
    ];
]])
-- load data
print([[
    if( inputUrls && inputUrls.length > 0 ) myapp.loadURLs(inputUrls);
}; // end startApp
]])

print([[
// check browser support
dwv.browser.check();
// initialise i18n
dwv.i18nInitialise("en","/dwv");
]])

print([[
// status flags
var domContentLoaded = false;
var i18nInitialised = false;
// launch when both DOM and i18n are ready
function launchApp() {
    if ( domContentLoaded && i18nInitialised ) {
        startApp();
    }
}
// DOM ready?
$(document).ready( function() {
    domContentLoaded = true;
    launchApp();
});
// i18n ready?
dwv.i18nOnInitialised( function () {
    // call next once the overlays are loaded
    var onLoaded = function (data) {
        dwv.gui.info.overlayMaps = data;
        i18nInitialised = true;
        launchApp();
    };
    // load overlay map info
    $.getJSON( dwv.i18nGetLocalePath("overlays.json"), onLoaded )
    .fail( function () {
        console.log("Using fallback overlays.");
        $.getJSON( dwv.i18nGetFallbackLocalePath("overlays.json"), onLoaded );
    });
});
]])

print([[
</script>
]])

print([[
</head>

<body>

<!-- DWV -->
<div id="dwv">

<div id="pageHeader">

<!-- Title -->
<h1>DWV <span class="dwv-version"></span></h1>

<!-- Toolbar -->
<div class="toolbar"></div>

</div><!-- /pageHeader -->

<div id="pageMain">

<!-- Open file -->
<div class="openData" title="File">
<div class="loaderlist"></div>
<div id="progressbar"></div>
</div>

<!-- Toolbox -->
<div class="toolList" title="Toolbox"></div>

<!-- History -->
<div class="history" title="History"></div>

<!-- Tags -->
<div class="tags" title="Tags"></div>

<!-- DrawList -->
<div class="drawList" title="Draw list"></div>

<!-- Help -->
<div class="help" title="Help"></div>

<!-- Layer Container -->
<div class="layerDialog" title="Image">
<div class="dropBox"></div>
<div class="layerContainer">
<canvas class="imageLayer">Only for HTML5 compatible browsers...</canvas>
<div class="drawDiv"></div>
<div class="infoLayer">
<div class="infotl"></div>
<div class="infotc"></div>
<div class="infotr"></div>
<div class="infocl"></div>
<div class="infocr"></div>
<div class="infobl"></div>
<div class="infobc"></div>
<div class="infobr" style="bottom: 64px;"></div>
<div class="plot"></div>
</div><!-- /infoLayer -->
</div><!-- /layerContainer -->
</div><!-- /layerDialog -->

</div><!-- /pageMain -->

</div><!-- /dwv -->

</body>
</html>
]])
