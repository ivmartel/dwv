--
-- DICOM Web Viewer (DWV) lua script for integration in a Conquest PACS server.
--
-- Usage:
-- 1. copy this file onto your web server
-- 2. in the 'dicom.ini' of your web server, create the dwv viewer:
-- >> [dwv-simple]
-- >> source = dwv-mobile.lua
-- And set it as the default viewer:
-- >> [webdefaults]
-- >> ...
-- >> viewer = dwv-simple
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
<link type="text/css" rel="stylesheet" href="/dwv/css/style.css">
]])

print([[
<style type="text/css" >
body { margin: 10px; padding: 0; }
.layerContainer { margin: auto; text-align: center; }
.imageLayer { left: 0px; }
.dropBox { margin: 20px auto; }
.inline { display: inline-block !important; }
</style>
<link type="text/css" rel="stylesheet" href="/dwv/ext/jquery-mobile/jquery.mobile-1.4.5.min.css" />
<link type="text/css" rel="stylesheet" href="/dwv/ext/nprogress/nprogress.css" />
<style type="text/css" >
.ui-popup .ui-controlgroup { background-color: #252525; }
.colourLi > .ui-input-text { text-align: center; }
.colourLi > .ui-input-text input { min-height: 2em; width: 7em; display:inline-block }
.lwColourLi > .ui-input-text { text-align: center; }
.lwColourLi > .ui-input-text input { min-height: 2em; width: 7em; display:inline-block }
.ffColourLi > .ui-input-text { text-align: center; }
.ffColourLi > .ui-input-text input { min-height: 2em; width: 7em; display:inline-block }
/* jquery-mobile strip not visible enough */
.table-stripe tbody tr:nth-child(odd) td,
.table-stripe tbody tr:nth-child(odd) th {
  background-color: #eeeeee; /* non-RGBA fallback  */
  background-color: rgba(0,0,0,0.1);
}
</style>
<link type="text/css" rel="stylesheet" href="/dwv/ext/jquery-mobile/jquery.mobile-1.4.5.min.css">
]])

print([[
<!-- Third party (dwv) -->
<script type="text/javascript" src="/dwv/ext/modernizr/modernizr.js"></script>
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
<script type="text/javascript" src="/dwv/ext/jquery-mobile/jquery.mobile-1.4.5.min.js"></script>
<script type="text/javascript" src="/dwv/ext/nprogress/nprogress.js"></script>
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
<script type="text/javascript" src="/dwv/dwv-0.23.0-beta.min.js"></script>
<!-- Launch the app -->
<script type="text/javascript" src="/dwv/viewers/mobile/appgui.js"></script>
]])

print([[
<script type="text/javascript">
// start app function
function startApp() {
    // translate page
    dwv.i18nPage();
    // main application
    var myapp = new dwv.App();
    myapp.init({
        "containerDivId": "dwv",
        "fitToWindow": true,
        "tools": ["Scroll", "WindowLevel", "ZoomAndPan", "Draw", "Livewire", "Filter", "Floodfill"],
        "filters": ["Threshold", "Sharpen", "Sobel"],
        "shapes": ["Arrow", "Ruler", "Protractor", "Rectangle", "Roi", "Ellipse", "FreeHand"],
        "gui": ["tool", "load", "help", "undo", "version", "tags", "drawList"],
        "loaders": ["File", "Url"],
        "isMobile": true,
        "skipLoadUrl": true
    });
    var size = dwv.gui.getWindowSize();
    $(".layerContainer").height(size.height);
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

<!-- Main page -->
<div data-role="page" data-theme="b" id="main">

<!-- pageHeader #dwvversion -->
<div id="pageHeader" data-role="header">
<h1>DWV <span class="dwv-version"></span></h1>
<a href="#help_page" data-icon="carat-r" class="ui-btn-right"
  data-transition="slide" data-i18n="basics.help">Help</a>
</div><!-- /pageHeader -->

<!-- DWV -->
<div id="dwv">

<div id="pageMain" data-role="content" style="padding:2px;">

<!-- Toolbar -->
<div class="toolbar"></div>

<!-- Open popup -->
<div data-role="popup" id="popupOpen">
<a href="#" data-rel="back" data-role="button" data-icon="delete"
  data-iconpos="notext" class="ui-btn-right" data-i18n="basics.close">Close</a>
<div style="padding:10px 20px;">
<h3 data-i18n="basics.open">Open</h3>
<div id="dwv-loaderlist"></div>
</div>
</div><!-- /popup -->

<!-- Layer Container -->
<div class="layerContainer">
<div class="dropBox"></div>
<canvas class="imageLayer">Only for HTML5 compatible browsers...</canvas>
<div class="drawDiv"></div>
<div class="infoLayer">
<div class="infotl info"></div>
<div class="infotc infoc"></div>
<div class="infotr info"></div>
<div class="infocl infoc"></div>
<div class="infocr infoc"></div>
<div class="infobl info"></div>
<div class="infobc infoc"></div>
<div class="infobr info"></div>
</div><!-- /infoLayer -->
</div><!-- /layerContainer -->

<!-- History -->
<div class="history" title="History" style="display:none;"></div>

</div><!-- /content -->

<div data-role="footer">
<div data-role="navbar" class="toolList">
</div><!-- /navbar -->
</div><!-- /footer -->

</div><!-- /page main -->

</div><!-- /dwv -->

<!-- Tags page -->
<div data-role="page" data-theme="b" id="tags_page">

<div data-role="header">
<a href="#main" data-icon="back" data-transition="slide"
  data-direction="reverse" data-i18n="basics.back">Back</a>
<h1 data-i18n="basics.dicomTags">DICOM Tags</h1>
</div><!-- /header -->

<div data-role="content">
<!-- Tags -->
<div id="dwv-tags" title="Tags"></div>
</div><!-- /content -->

</div><!-- /page tags_page-->

<!-- Draw list page -->
<div data-role="page" data-theme="b" id="drawList_page">

<div data-role="header">
<a href="#main" data-icon="back" data-transition="slide"
  data-direction="reverse" data-i18n="basics.back">Back</a>
<h1 data-i18n="basics.drawList">Draw list</h1>
</div><!-- /header -->

<div data-role="content">
<!-- DrawList -->
<div id="dwv-drawList" title="Draw list"></div>
</div><!-- /content -->

</div><!-- /page draw-list_page-->

<!-- Help page -->
<div data-role="page" data-theme="b" id="help_page">

<div data-role="header">
<a href="#main" data-icon="back" data-transition="slide"
  data-direction="reverse" data-i18n="basics.back">Back</a>
<h1 data-i18n="basics.help">Help</h1>
</div><!-- /header -->

<div data-role="content">
<!-- Help -->
<div id="dwv-help" title="Help"></div>
</div><!-- /content -->

</div><!-- /page help_page-->

</body>
</html>
]])
