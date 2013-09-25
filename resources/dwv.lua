--
-- DICOM Web Viewer (DWV) lua script for integration in a Conquest PACS server. 
--
-- Usage
-- In the dicom.ini of your web server, create the dwv viewer:
-- >> [dwv]
-- >> source = viewers\dwv.lua
-- And set it as the default viewer:
-- >> [webdefaults]
-- >> ...
-- >> viewer = dwv
-- This script relies on the 'kFactorFile', 'ACRNemaMap' and 'Dictionary'
-- variables being set correctly.
-- Then copy the DWV distribution files (without the html files) in a 'dwv' folder
-- in the web folder of your web server.

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
print([[<!DOCTYPE html>]])
print([[<html>]])

print([[<head>]])

print([[
<title>DICOM Web Viewer</title>
<meta charset="UTF-8">
<link rel="stylesheet" href="/dwv/style.css">
<style>
body { font-size: 80%; }
#pageHeader h1 { display: inline-block; margin: 0; }
#pageHeader #toolbar { display: inline-block; float: right; }
#toolbox li:first-child { list-style-type: none; padding-bottom: 10px; margin-left: -20px; }
#pageMain { position: absolute; height: 92%; width: 99%; bottom: 5px; left: 5px; background-color: #333; }
#infotl { color: #333; text-shadow: 0 1px 0 #fff; }
#infotr { color: #333; text-shadow: 0 1px 0 #fff; }
</style>
]])

-- path with extra /dwv
print([[
<link rel="stylesheet" href="/dwv/ext/jquery-ui/themes/ui-darkness/jquery-ui-1.10.2.min.css">
]])

-- path with extra /dwv
print([[
<!-- Third party --> 
<script type="text/javascript" src="/dwv/ext/jquery/jquery-1.9.1.min.js"></script>
<script type="text/javascript" src="/dwv/ext/jquery-ui/jquery-ui-1.10.2.min.js"></script>
<script type="text/javascript" src="/dwv/ext/flot/jquery.flot.min.js"></script>
]])

-- path with extra /dwv
print([[
<!-- Local -->
<script type="text/javascript" src="/dwv/dwv-0.4.1.min.js"></script>
<script type="text/javascript" src="/dwv/gui_ui.js"></script>
]])


print([[<script type="text/javascript">]])

print([[
function toggle(dialogName)
{
    if( $(dialogName).dialog('isOpen') ) $(dialogName).dialog('close');
    else $(dialogName).dialog('open');
}
]])

print([[
// check browser support
dwv.html.browser.check();
// main application
var app = new dwv.App();
]])

print([[
// jquery
$(document).ready(function(){
    // initialise buttons
    $("button").button();
    $("#toggleInfoLayer").button({ icons: 
        { primary: "ui-icon-comment" }, text: false });
    // create dialogs
    $("#openData").dialog({ position: 
        {my: "left top", at: "left top", of: "#pageMain"} });
    $("#toolbox").dialog({ position: 
        {my: "left top+200", at: "left top", of: "#pageMain"} });
    $("#history").dialog({ position: 
        {my: "left top+370", at: "left top", of: "#pageMain"},
        autoOpen: false });
    $("#tags").dialog({ position: 
        {my: "right top", at: "right top", of: "#pageMain"},
        autoOpen: false, width: 500, height: 590 });
]])
   
print([[
    // image dialog
    $("#layerDialog").dialog({ position: 
        {my: "left+320 top", at: "left top", of: "#pageMain"}});
    // default size
    $("#layerDialog").dialog({ width: "auto", resizable: false });
    // Resizable but keep aspect ratio
    // TODO it seems to add a border that bothers getting the cursor position...
    //$("#layerContainer").resizable({ aspectRatio: true });
    
    // initialise the application
    app.init();
    // align layers when the window is resized
    window.onresize = app.resize;
    // possible load from URL
    //var inputUrls = dwv.html.getUriParam(); 
]])

-- create javascript url array
print([[    var inputUrls = []])
for i=1, #images do
  print('      "'..urls[i]..'",')
end
print([[    ];]])
-- load data
print([[
    if( inputUrls && inputUrls.length > 0 ) app.loadURL(inputUrls);
});
]])

print([[</script>]])
print([[</head>]])
print([[<body>]])

print([[<div id="pageHeader">]])

print([[
<!-- Title -->
<h1>DICOM Web Viewer (<a href="https://github.com/ivmartel/dwv">dwv</a> v0.4.1)</h1>

<!-- Toolbar -->
<div id="toolbar">
<button onclick="toggle('#openData')">File</button>
<button onclick="toggle('#toolbox')">Toolbox</button>
<button onclick="toggle('#history')">History</button>
<button onclick="toggle('#tags')">Tags</button>
<button onclick="toggle('#layerDialog')">Image</button>
<button onclick="app.toggleInfoLayerDisplay()">Info</button>
</div><!-- /toolbar -->
]])

print([[</div><!-- pageHeader -->]])

print([[<div id="pageMain">]])

print([[
<!-- Open file -->
<div id="openData" title="File">
<form><p>
Path: <input type="file" id="imagefiles" multiple />
URL: <input type="url" id="imageurl" />
]])

print([[</p></form>]])

print([[<div id="progressbar"></div>]])

print([[</div>]])

print([[
<!-- Toolbox -->
<div id="toolbox" title="Toolbox">
<ul id="toolList"></ul>
</div>

<!-- History -->
<div id="history" title="History"></div>

<!-- Tags -->
<div id="tags" title="Tags" style="display:none;"></div>
]])

print([[
<!-- Layer Container -->
<div id="layerDialog" title="Image">
<div id="layerContainer">
<canvas id="imageLayer">Only for HTML5 compatible browsers...</canvas>
<canvas id="drawLayer">Only for HTML5 compatible browsers...</canvas>
<canvas id="tempLayer">Only for HTML5 compatible browsers...</canvas>
<div id="infoLayer">
<div id="infotl"></div>
<div id="infotr"></div>
<div id="infobl"></div>
<div id="infobr"><div id="plot"></div></div>
</div><!-- /infoLayer -->
</div><!-- /layerContainer -->
</div><!-- /layerDialog -->
]])

print([[</div><!-- pageMain -->]])

print([[</body>]])
print([[</html>]])
