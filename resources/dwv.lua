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
body { background-color: #222; color: white;
  margin: 10px; padding: 0; font-size: 80%; }
#pageHeader h1 { display: inline-block; margin: 0; color: #fff; }
#pageHeader a { color: #ddf; }
#pageHeader #toolbar { display: inline-block; float: right; }
#toolbox li:first-child { list-style-type: none; padding-bottom: 10px; margin-left: -20px; }
#pageMain { position: absolute; height: 92%; width: 99%; bottom: 5px; left: 5px; background-color: #333; }
#infotl { color: #333; text-shadow: 0 1px 0 #fff; }
#infotr { color: #333; text-shadow: 0 1px 0 #fff; }
</style>
]])

-- path with extra /dwv
print([[
<link rel="stylesheet" href="/dwv/ext/jquery-ui/themes/ui-darkness/jquery-ui-1.10.3.min.css">
]])

-- path with extra /dwv
print([[
<!-- Third party --> 
<script type="text/javascript" src="/dwv/ext/jquery/jquery-2.0.3.min.js"></script>
<script type="text/javascript" src="/dwv/ext/jquery-ui/jquery-ui-1.10.3.min.js"></script>
<script type="text/javascript" src="/dwv/ext/flot/jquery.flot.min.js"></script>
<script type="text/javascript" src="/dwv/ext/openjpeg/openjpeg.js"></script>
]])

-- path with extra /dwv
print([[
<!-- Local -->
<script type="text/javascript" src="/dwv/dwv-0.6.0beta.min.js"></script>
]])


print([[<script type="text/javascript">]])

print([[
function toggle(dialogId)
{
    if( $(dialogId).dialog('isOpen') ) $(dialogId).dialog('close');
    else $(dialogId).dialog('open');
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
    $("#help").dialog({ position: 
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
]])

print([[
    // button listeners
    var button = null;
    // open
    button = document.getElementById("open-btn");
    if( button ) button.onclick = function() { toggle("#openData"); };
    // toolbox
    button = document.getElementById("toolbox-btn");
    if( button ) button.onclick = function() { toggle("#toolbox"); };
    // history
    button = document.getElementById("history-btn");
    if( button ) button.onclick = function() { toggle("#history"); };
    // tags
    button = document.getElementById("tags-btn");
    if( button ) button.onclick = function() { toggle("#tags"); };
    // layerDialog
    button = document.getElementById("layerDialog-btn");
    if( button ) button.onclick = function() { toggle("#layerDialog"); };
    // info
    button = document.getElementById("info-btn");
    if( button ) button.onclick = function() { app.toggleInfoLayerDisplay(); };
    // help
    button = document.getElementById("help-btn");
    if( button ) button.onclick = function() { toggle("#help"); };
]])
   
print([[
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

]])
   
print([[
    // Add required tools to the tool list
    dwv.tool.tools = {};
    dwv.tool.tools.windowlevel = new dwv.tool.WindowLevel(app);
    dwv.tool.tools.zoom = new dwv.tool.Zoom(app);
    dwv.tool.tools.draw = new dwv.tool.Draw(app);
    dwv.tool.tools.livewire = new dwv.tool.Livewire(app);

    // Add the filter to the filter list
    dwv.tool.tools.filter = new dwv.tool.Filter(app);
    dwv.tool.filters = {};
    dwv.tool.filters.threshold = new dwv.tool.filter.Threshold(app);
    dwv.tool.filters.sharpen = new dwv.tool.filter.Sharpen(app);
    dwv.tool.filters.sobel = new dwv.tool.filter.Sobel(app);

]])
   
print([[
	// append tool container HTML
    dwv.gui.appendToolboxHtml();
    // append tools HTML
    dwv.gui.appendWindowLevelHtml();
    dwv.gui.appendZoomHtml();
    dwv.gui.appendDrawHtml();
    dwv.gui.appendLivewireHtml();
    
    // append filter container HTML
    dwv.gui.appendFilterHtml();
    // append filters HTML
    dwv.gui.filter.appendThresholdHtml();
    dwv.gui.filter.appendSharpenHtml();
    dwv.gui.filter.appendSobelHtml();
    
    // append help HTML
    dwv.gui.appendHelpHtml(false);
]])

print([[
    // initialise the application
    app.init();
    // align layers when the window is resized
    window.onresize = app.resize;
    // possible load from URL
    //var inputUrls = dwv.html.getUriParam(); 
	
	// help
    // TODO Seems accordion only works when at end...
    $("#accordion").accordion({ collapsible: "true", active: "false", heightStyle: "content" });
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
<!-- Title #dwvversion -->
<h1>DICOM Web Viewer (<a href="https://github.com/ivmartel/dwv">dwv</a> v0.6.0beta)</h1>

<!-- Toolbar -->
<div id="toolbar">
<button id="open-btn">File</button>
<button id="toolbox-btn">Toolbox</button>
<button id="history-btn">History</button>
<button id="tags-btn">Tags</button>
<button id="layerDialog-btn">Image</button>
<button id="info-btn">Info</button>
<button id="help-btn">Help</button>
</div><!-- /toolbar -->
]])

print([[</div><!-- pageHeader -->]])

print([[<div id="pageMain">]])

print([[
<!-- Open file -->
<div id="openData" title="File">
<div id="loaderlist"></div>
<div id="progressbar"></div>
</div>
]])

print([[
<!-- Toolbox -->
<div id="toolbox" title="Toolbox">
<ul id="toolList"></ul>
</div>

<!-- History -->
<div id="history" title="History"></div>

<!-- Tags -->
<div id="tags" title="Tags"></div>

<!-- Help -->
<div id="help" title="Help"></div>
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
