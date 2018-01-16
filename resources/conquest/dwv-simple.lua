--
-- DICOM Web Viewer (DWV) lua script for integration in a Conquest PACS server.
--
-- Usage:
-- 1. copy this file onto your web server
-- 2. in the 'dicom.ini' of your web server, create the dwv viewer:
-- >> [dwv-simple]
-- >> source = dwv-simple.lua
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
<link type="text/css" rel="stylesheet" href="/dwv/ext/jquery-mobile/jquery.mobile-1.4.5.min.css">
]])

print([[
<!-- Third party (dwv) -->
<script type="text/javascript" src="/dwv/ext/modernizr/modernizr.js"></script>
<script type="text/javascript" src="/dwv/ext/i18next/i18next.min.js"></script>
<script type="text/javascript" src="/dwv/ext/i18next/i18nextXHRBackend.min.js"></script>
<script type="text/javascript" src="/dwv/ext/i18next/i18nextBrowserLanguageDetector.min.js"></script>
]])

print([[
<!-- Third party (viewer) -->
<script type="text/javascript" src="/dwv/ext/jquery/jquery-2.1.4.min.js"></script>
<script type="text/javascript" src="/dwv/ext/jquery-mobile/jquery.mobile-1.4.5.min.js"></script>
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
<script type="text/javascript" src="/dwv/viewers/simple/appgui.js"></script>
]])

print([[
<script type="text/javascript">
// start app function
function startApp() {
    // main application
    var myapp = new dwv.App();
    // initialise the application
    myapp.init({
        "containerDivId": "dwv",
        "fitToWindow": true,
        "tools": ["Scroll", "ZoomAndPan", "WindowLevel"],
        "gui": ["tool"],
        "isMobile": true,
        "skipLoadUrl": true
    });
    dwv.gui.appendResetHtml(myapp);
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
    i18nInitialised = true;
    launchApp();
});
]])

print([[
</script>
]])

print([[
</head>

<body>

<!-- Main page -->
<div data-role="page" data-theme="b">

<!-- Main content -->
<div data-role="content">

<!-- DWV -->
<div id="dwv">

<!-- Toolbar -->
<div class="toolbar"></div>

<!-- Layer Container -->
<div class="layerContainer">
<canvas class="imageLayer">Only for HTML5 compatible browsers...</canvas>
</div><!-- /layerContainer -->

</div><!-- /dwv -->

</div><!-- /content -->

</div><!-- /page -->

</body>
</html>
]])
