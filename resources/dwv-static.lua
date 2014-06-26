--
-- DICOM Web Viewer (DWV) lua script for integration in a Conquest PACS server. 
--
-- Usage
-- In the dicom.ini of your web server, create the dwv viewer:
-- >> [dwv-static]
-- >> source = viewers\dwv-static.lua
-- And set it as the default viewer:
-- >> [webdefaults]
-- >> ...
-- >> viewer = dwv-static
-- This script relies on the 'kFactorFile', 'ACRNemaMap' and 'Dictionary'
-- variables being set correctly.
-- Then copy the DWV distribution files in a 'dwv' folder
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
#pageHeader #toolbar { display: inline-block; float: right; }
#toolbox li:first-child { list-style-type: none; padding-bottom: 10px; margin-left: -20px; }
#pageMain { position: absolute; height: 92%; width: 99%; bottom: 5px; left: 5px; background-color: #333; }
#infotl { color: #333; text-shadow: 0 1px 0 #fff; }
#infotr { color: #333; text-shadow: 0 1px 0 #fff; }
</style>
<link type="text/css" rel="stylesheet" href="/dwv/ext/jquery-ui/themes/ui-darkness/jquery-ui-1.10.4.min.css">
]])

print([[
<!-- Third party --> 
<script type="text/javascript" src="/dwv/ext/jquery/jquery-2.1.1.min.js"></script>
<script type="text/javascript" src="/dwv/ext/jquery-ui/jquery-ui-1.10.4.min.js"></script>
<script type="text/javascript" src="/dwv/ext/flot/jquery.flot.min.js"></script>
<script type="text/javascript" src="/dwv/ext/openjpeg/openjpeg.js"></script>
<script type="text/javascript" src="/dwv/ext/kinetic/kinetic-v5.1.1-06.10.min.js"></script>

<!-- Local -->
<script type="text/javascript" src="/dwv/dwv-0.7.0.min.js"></script>
<!-- Launch the app -->
<script type="text/javascript" src="/dwv/viewers/static/appgui.js"></script>
<script type="text/javascript" src="/dwv/viewers/static/applauncher.js"></script>
]])

print([[
<script type="text/javascript">
// prevent default url load
var skipLoadUrl = true;
// launch when page is loaded
$(document).ready(function(){
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
}); // end $(document).ready
</script>
]])

print([[
</head>

<body>

<div id="pageHeader">

<!-- Title -->
<h1>DICOM Web Viewer 
(<a href="https://github.com/ivmartel/dwv">dwv</a> 
<span class="dwv-version"></span>)</h1>

<!-- Toolbar -->
<div id="toolbar"></div>

</div><!-- /pageHeader -->

<div id="pageMain">

<!-- Open file -->
<div id="openData" title="File">
<div id="loaderlist"></div>
<div id="progressbar"></div>
</div>

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

<!-- Layer Container -->
<div id="layerDialog" title="Image">
<div id="layerContainer">
<canvas id="imageLayer">Only for HTML5 compatible browsers...</canvas>
<div id="drawDiv"></div>
<div id="infoLayer">
<div id="infotl"></div>
<div id="infotr"></div>
<div id="infobl"></div>
<div id="infobr"><div id="plot"></div></div>
</div><!-- /infoLayer -->
</div><!-- /layerContainer -->
</div><!-- /layerDialog -->

</div><!-- /pageMain -->

</body>
</html>
]])
