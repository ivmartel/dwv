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
-- Then copy the 'css', 'src' and 'ext' folders of DWV in a 'dwv' folder
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

local url = webscriptadress
url = url .. '?requestType=WADO&contentType=application/dicom'
url = url .. '&seriesUID=' .. seriesuid
url = url .. '&studyUID=' .. studyuid
url = url .. '&objectUID=' .. images[1].SOPInstanceUID
 
-- Generate html

HTML('Content-type: text/html\n\n')
--print([[<!DOCTYPE html>]])
print([[<html>]])

print([[<head>]])

print([[<title>DICOM Web Viewer</title>
<meta http-equiv="content-type" content="text/html; charset=ISO-8859-1">
<link rel="stylesheet" href="/dwv/css/style.css">
<style>
body { font-size: 80%; }
#toolbox li:first-child { list-style-type: none; padding-bottom: 10px; margin-left: -20px; }
#pageMain { height: 85%; width: 100%; margin-top: 10px; }
</style>
<link rel="stylesheet" href="ext/jquery/ui/1.10.2/themes/ui-darkness/jquery-ui-1.10.2.min.css">

print([[<!-- Third party --> 
<script type="text/javascript" src="/dwv/ext/jquery/jquery-1.9.1.min.js"></script>
<script type="text/javascript" src="ext/jquery/ui/1.10.2/jquery-ui-1.10.2.min.js"></script>
<script type="text/javascript" src="/dwv/ext/flot/jquery.flot.min.js"></script>]])

print([[<!-- Local -->
<script type="text/javascript" src="/dwv/src/dwv.js"></script>
<script type="text/javascript" src="/dwv/src/application.js"></script>
<script type="text/javascript" src="/dwv/src/dicom/dicomParser.js"></script>
<script type="text/javascript" src="/dwv/src/dicom/dictionary.js"></script>
<script type="text/javascript" src="/dwv/src/html/gui.js"></script>
<script type="text/javascript" src="/dwv/src/html/gui_ui.js"></script>
<script type="text/javascript" src="/dwv/src/html/html.js"></script>
<script type="text/javascript" src="/dwv/src/html/style.js"></script>
<script type="text/javascript" src="/dwv/src/html/layer.js"></script>
<script type="text/javascript" src="/dwv/src/image/filter.js"></script>
<script type="text/javascript" src="/dwv/src/image/image.js"></script>
<script type="text/javascript" src="/dwv/src/image/luts.js"></script>
<script type="text/javascript" src="/dwv/src/image/reader.js"></script>
<script type="text/javascript" src="/dwv/src/math/shapes.js"></script>
<script type="text/javascript" src="/dwv/src/math/bucketQueue.js"></script>
<script type="text/javascript" src="/dwv/src/math/scissors.js"></script>
<script type="text/javascript" src="/dwv/src/utils/string.js"></script>]])

print([[<!-- Tools: beware order is important... -->
<script type="text/javascript" src="/dwv/src/tools/toolbox.js"></script>
<script type="text/javascript" src="/dwv/src/tools/windowLevel.js"></script>
<script type="text/javascript" src="/dwv/src/tools/draw.js"></script>
<script type="text/javascript" src="/dwv/src/tools/line.js"></script>
<script type="text/javascript" src="/dwv/src/tools/rectangle.js"></script>
<script type="text/javascript" src="/dwv/src/tools/roi.js"></script>
<script type="text/javascript" src="/dwv/src/tools/circle.js"></script>
<script type="text/javascript" src="/dwv/src/tools/livewire.js"></script>
<script type="text/javascript" src="/dwv/src/tools/zoom.js"></script>
<script type="text/javascript" src="/dwv/src/tools/filter.js"></script>
<script type="text/javascript" src="/dwv/src/tools/undo.js"></script>]])

print([[<script type="text/javascript">
function toggle(dialogName)
{
    if( $(dialogName).dialog('isOpen') )
    {
        $(dialogName).dialog('close');
    }
    else
    {
        $(dialogName).dialog('open');
    }
}
function load()
{
  app.loadURL(']]..webscriptadress..[[?requestType=WADO&contentType=application/dicom'+
    '&studyUID=]]..studyuid..[[' +
    '&seriesUID=]]..seriesuid..[[' +
    '&objectUID=' + document.forms[0].slice.value);
}
function nextslice()
{
  if (document.forms[0].slice.selectedIndex == document.forms[0].slice.length-1)
  {
    document.forms[0].slice.selectedIndex = 0;
  }
  else
  {
    document.forms[0].slice.selectedIndex = document.forms[0].slice.selectedIndex + 1;
  }
  load();
}
function previousslice()
{
  if (document.forms[0].slice.selectedIndex == 0)
  {
    document.forms[0].slice.selectedIndex = document.forms[0].slice.length-1;
  }
  else
  {
    document.forms[0].slice.selectedIndex = document.forms[0].slice.selectedIndex - 1;
  }
  load();
}
]])

print([[// main application
var app = new dwv.App();
// jquery
$(document).ready(function(){
    // create buttons and dialogs
    $("button").button();
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
    var input = dwv.html.getUriParam("input"); 
    if( input ) app.loadURL(decodeURIComponent(input));
});
</script>]])

print([[</head>]])

print([[<body>]])

print([[<div id="pageHeader">]])

print([[<!-- Title -->
<h1>DICOM Web Viewer (<a href="https://github.com/ivmartel/dwv">dwv</a> v0.3b)</h1>

<!-- Buttons -->
<button onclick="toggle('#openData')">File</button>
<button onclick="toggle('#toolbox')">Toolbox</button>
<button onclick="toggle('#history')">History</button>
<button onclick="toggle('#tags')">Tags</button>
<button onclick="toggle('#layerDialog')">Image</button>

print([[</div><!-- pageHeader -->]])

print([[<div id="pageMain">]])

print([[<!-- Open file -->
<div id="openData" title="File">
<form><p>
Path: <input type="file" id="imagefiles" multiple />
URL: <input type="url" id="imageurl" />
<br>Slice: 
<input type=button value='<' onclick=previousslice() />
<select name=slice onchange=load()>]])

for i=1, #images do
  print('  <option value='..images[i].SOPInstanceUID..'>'..i..'</option>')
end

print([[</select>
<input type=button value='>' onclick=nextslice() />
</p></form>]])

print([[<div id="progressbar"></div>]])

print([[</div>]])

print([[<!-- Toolbox -->
<div id="toolbox" title="Toolbox">
<ul id="toolList"></ul>
</div>

<!-- History -->
<div id="history" title="History"></div>

<!-- Tags -->
<div id="tags" title="Tags" style="display:none;"></div>]])

print([[<!-- Layer Container -->
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
</div><!-- /layerDialog -->]])

print([[</div><!-- pageMain -->]])

print([[</body>]])
print([[</html>]])
