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
<style type="text/css" >
body { margin: 10px; padding: 0; }
.layerContainer { margin: auto; text-align: center; }
.imageLayer { left: 0px; }
.dropBox { margin: 20px auto; }
</style>
<link type="text/css" rel="stylesheet" href="/dwv/ext/jquery-mobile/jquery.mobile-1.4.5.min.css">
]])

print([[
<!-- Third party -->
<script type="text/javascript" src="/dwv/ext/jquery/jquery-2.1.4.min.js"></script>
<script type="text/javascript" src="/dwv/ext/jquery-mobile/jquery.mobile-1.4.5.min.js"></script>
<script type="text/javascript" src="/dwv/ext/flot/jquery.flot.min.js"></script>
<script type="text/javascript" src="/dwv/ext/pdfjs/jpx.js"></script>
<script type="text/javascript" src="/dwv/ext/pdfjs/util.js"></script>
<script type="text/javascript" src="/dwv/ext/pdfjs/arithmetic_decoder.js"></script>
<script type="text/javascript" src="/dwv/ext/pdfjs/jpg.js"></script>
<script type="text/javascript" src="/dwv/ext/rii-mango/lossless-min.js"></script>
<script type="text/javascript" src="/dwv/ext/kinetic/kinetic-v5.1.1-06.10.min.js"></script>

<!-- Local -->
<script type="text/javascript" src="/dwv/dwv-0.17.0-beta.min.js"></script>
<!-- Launch the app -->
<script type="text/javascript" src="/dwv/viewers/mobile/appgui.js"></script>
]])

print([[
<script type="text/javascript">
// check browser support
dwv.browser.check();
// launch when page is loaded
$(document).ready( function()
{
    // main application
    var myapp = new dwv.App();
    myapp.init({
        "containerDivId": "dwv",
        "fitToWindow": true,
        "tools": ["Scroll", "Window/Level", "Zoom/Pan", "Draw", "Livewire", "Filter"],
        "filters": ["Threshold", "Sharpen", "Sobel"],
        "shapes": ["Line", "Protractor", "Rectangle", "Roi", "Ellipse"],
        "gui": ["tool", "load", "help", "undo", "version", "tags"],
        "isMobile": true
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
    if( inputUrls && inputUrls.length > 0 ) myapp.loadURL(inputUrls);
}); // end $(document).ready
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
  data-transition="slide">Help</a>
</div><!-- /pageHeader -->

<!-- DWV -->
<div id="dwv">

<div id="pageMain" data-role="content" style="padding:2px;">

<!-- Toolbar -->
<div class="toolbar"></div>

<!-- Open popup -->
<div data-role="popup" id="popupOpen">
<a href="#" data-rel="back" data-role="button"
  data-icon="delete" data-iconpos="notext" class="ui-btn-right">Close</a>
<div style="padding:10px 20px;">
<h3>Open</h3>
<div id="dwv-loaderlist"></div>
</div>
</div><!-- /popup -->

<!-- Layer Container -->
<div class="layerContainer">
<div class="dropBox"></div>
<canvas class="imageLayer">Only for HTML5 compatible browsers...</canvas>
<div class="drawDiv"></div>
<div class="infoLayer">
<div class="infotl"></div>
<div class="infotr"></div>
<div class="infobl"></div>
<div class="infobr"><div class="plot"></div></div>
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
<a href="#main" data-icon="back"
  data-transition="slide" data-direction="reverse">Back</a>
<h1>DICOM Tags</h1>
</div><!-- /header -->

<div data-role="content">
<!-- Tags -->
<div id="dwv-tags" title="Tags"></div>
</div><!-- /content -->

</div><!-- /page tags_page-->

<!-- Help page -->
<div data-role="page" data-theme="b" id="help_page">

<div data-role="header">
<a href="#main" data-icon="back"
  data-transition="slide" data-direction="reverse">Back</a>
<h1>DWV Help</h1>
</div><!-- /header -->

<div data-role="content">
<!-- Tags -->
<div id="dwv-help" title="Help"></div>
</div><!-- /content -->

</div><!-- /page help_page-->

</body>
</html>
]])
