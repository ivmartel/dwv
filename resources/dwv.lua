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
-- This scripts relies on the 'kFactorFile', 'ACRNemaMap' and 'Dictionary' 
-- variables being set correctly.


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

local seriesuid = string.gsub(series, '^.*:', '')
local studyuid = getstudyuid()
local images = queryimages()

local url = 'http://127.0.0.1' .. script_name
url = url .. '?requestType=WADO&contentType=application/dicom'
url = url .. '&seriesUID=' .. seriesuid
url = url .. '&studyUID=' .. studyuid
url = url .. '&objectUID=' .. images[1].SOPInstanceUID
  
-- Generate html

HTML('Content-type: text/html\n\n')
--print([[<!DOCTYPE html>]])
print([[<html>]])

print([[<head>
<title>DICOM Web Viewer</title>
<meta http-equiv="content-type" content="text/html; charset=ISO-8859-1">
<link rel="stylesheet" href="/dwv/css/style.css">
<style>
body { font-size: 80%; }
#toolbox li:first-child { list-style-type: none; padding-bottom: 10px; margin-left: -20px; }
</style>
<link rel="stylesheet" href="/dwv/ext/jquery/ui/1.10.1/themes/ui-darkness/jquery-ui.min.css">
</head>]])

print([[<body>]])

print([[<!-- Third party -->  
<script type="text/javascript" src="/dwv/ext/jquery/jquery-1.9.1.min.js"></script>
<script type="text/javascript" src="/dwv/ext/jquery/ui/1.10.1/jquery-ui.min.js"></script>
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
<script type="text/javascript" src="/dwv/src/image/lookupTable.js"></script>
<script type="text/javascript" src="/dwv/src/image/luts.js"></script>
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
function getUriParam(name)
{
    var val = 0;
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)")
    var results = regex.exec(window.location.href);
    if( results && results[1] ) val = results[1];
    return val;
}]])

print([[// main application
var app = new dwv.App();
// jquery
$(document).ready(function(){
    // create buttons and dialogs
    $("button").button();
    $("#openData").dialog({ position: [10, 110] });
    $("#toolbox").dialog({ position: [10, 280] });
    $("#history").dialog({ position: [10, 450], autoOpen: false });
    $("#tags").dialog({ position: ['right', 110], autoOpen: false, height: 400, width: 400 });
    $("#layerContainer").dialog({ position: [340, 110], 
        width: [570], height: [590] });
    // initialise the application
    app.init();
    // possible load from URL
    app.loadDicomURL("]].. url ..[[");
});
</script>]])

print([[<!-- Title -->
<h1>DICOM Web Viewer (<a href="https://github.com/ivmartel/dwv">dwv</a> v0.3b)</h1>

<!-- Buttons -->
<button onclick="toggle('#openData')">Open</button>
<button onclick="toggle('#toolbox')">Toolbox</button>
<button onclick="toggle('#history')">History</button>
<button onclick="toggle('#tags')">Tags</button>
<button onclick="toggle('#layerContainer')">Image</button>]])

print([[<!-- Open file -->
<div id="openData" title="Open">
<p><form>
Path: <input type="file" id="dicomfiles" multiple />
URL: <input type="url" id="dicomurl" />
</form></p>
<div id="progressbar"></div>
</div>]])

print([[<!-- Toolbox -->
<div id="toolbox" title="Toolbox">
<ul id="toolList"></ul>
</div>

<!-- History -->
<div id="history" title="History"></div>

<!-- Tags -->
<div id="tags" title="Tags" style="display:none;"></div>]])

print([[<!-- Layer Container -->
<div id="layerContainer" title="Image">
<canvas id="imageLayer" width="512" height="512"></canvas>
<canvas id="drawLayer" width="512" height="512"></canvas>
<canvas id="infoLayer" width="512" height="512"></canvas>
<canvas id="tempLayer" width="512" height="512"></canvas>
<div id="plot" style="width:100px;height:70px"></div>
</div>]])

print([[</body>]])
print([[</html>]])
