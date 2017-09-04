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
<link type="text/css" rel="stylesheet" href="/dwv/css/style.css">
<style type="text/css" >
body { background-color: #222; color: white;
  margin: 10px; padding: 0; font-size: 80%; }
#pageHeader h1 { display: inline-block; margin: 0; color: #fff; }
#pageHeader a { color: #ddf; }
#pageHeader .toolbar { display: inline-block; float: right; }
.toolbox li:first-child { list-style-type: none; padding-bottom: 10px; margin-left: -20px; }
#pageMain { position: absolute; height: 92%; width: 99%; bottom: 5px; left: 5px; background-color: #333; }
.infotl { color: #333; text-shadow: 0 1px 0 #fff; }
.infotr { color: #333; text-shadow: 0 1px 0 #fff; }
.dropBox { margin: 20px; }
</style>
<link type="text/css" rel="stylesheet" href="/dwv/ext/jquery-ui/themes/ui-darkness/jquery-ui-1.12.0.min.css">
]])

print([[
<!-- Third party -->
<script type="text/javascript" src="/dwv/ext/jquery/jquery-2.1.4.min.js"></script>
<script type="text/javascript" src="/dwv/ext/jquery-ui/jquery-ui-1.12.0.min.js"></script>
<script type="text/javascript" src="/dwv/ext/flot/jquery.flot.min.js"></script>
<script type="text/javascript" src="/dwv/ext/ext/konva/konva.min.js"></script>
<!-- Decoders -->
<script type="text/javascript" src="/dwv/decoders/pdfjs/jpx.js"></script>
<script type="text/javascript" src="/dwv/decoders/pdfjs/util.js"></script>
<script type="text/javascript" src="/dwv/decoders/pdfjs/arithmetic_decoder.js"></script>
<script type="text/javascript" src="/dwv/decoders/pdfjs/jpg.js"></script>
<script type="text/javascript" src="/dwv/decoders/rii-mango/lossless-min.js"></script>

<!-- Local -->
<script type="text/javascript" src="/dwv/dwv-0.21.0-beta.min.js"></script>
<!-- Launch the app -->
<script type="text/javascript" src="/dwv/viewers/static/appgui.js"></script>
]])

print([[
<script type="text/javascript">
// check browser support
dwv.browser.check();
// launch when page is loaded
$(document).ready( function()
{
    // gui setup
    dwv.gui.setup();
    // main application
    var myapp = new dwv.App();
    // initialise the application
    myapp.init({
        "containerDivId": "dwv",
        "fitToWindow": true,
        "tools": ["Scroll", "Window/Level", "Zoom/Pan", "Draw", "Livewire", "Filter"],
        "filters": ["Threshold", "Sharpen", "Sobel"],
        "shapes": ["Line", "Protractor", "Rectangle", "Roi", "Ellipse"],
        "gui": ["tool", "load", "help", "undo", "version", "tags"],
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
    if( inputUrls && inputUrls.length > 0 ) myapp.loadURL(inputUrls);
}); // end $(document).ready
</script>
]])

print([[
</head>

<body>

<!-- DWV -->
<div id="dwv">

<div id="pageHeader">

<!-- Title -->
<h1>DICOM Web Viewer
(<a href="https://github.com/ivmartel/dwv">dwv</a>
<span class="dwv-version"></span>)</h1>

<!-- Toolbar -->
<div class="toolbar"></div>

</div><!-- /pageHeader -->

<div id="pageMain">

<!-- Open file -->
<div class="openData" title="File">
<div class="loaderlist"></div>
<div class="progressbar"></div>
</div>

<!-- Toolbox -->
<div class="toolList" title="Toolbox"></div>

<!-- History -->
<div class="history" title="History"></div>

<!-- Tags -->
<div class="tags" title="Tags"></div>

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
<div class="infotr"></div>
<div class="infobl"></div>
<div class="infobr"><div class="plot"></div></div>
</div><!-- /infoLayer -->
</div><!-- /layerContainer -->
</div><!-- /layerDialog -->

</div><!-- /pageMain -->

</div><!-- /dwv -->

</body>
</html>
]])
