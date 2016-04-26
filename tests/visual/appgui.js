/** 
 * Application GUI.
 * 
 * Snapshots were created using synedra View Personal (http://www.synedra.com),
 *  version 14 for Microsoft Windows:
 * - Right click on the thumbnail in the left 'Document tree area',
 * - Choose 'Convert to JPEG'.
 */

// Default window level presets.
dwv.tool.defaultpresets = {};

// Window
dwv.gui.getWindowSize = dwv.gui.base.getWindowSize;
// get element
dwv.gui.getElement = dwv.gui.base.getElement;
// Progress
dwv.gui.displayProgress = function (/*percent*/) {};

// check browser support
dwv.browser.check();

// test data line
dwv.addDataLine = function (id, fileroot, doc)
{
    var mainDiv = document.getElementById("data-lines");

    // dwv container
    var dwvDiv = document.createElement("div");
    dwvDiv.id = id;
    var layConDiv = document.createElement("div");
    layConDiv.className = "layerContainer";
    var imgCanvas = document.createElement("canvas");
    imgCanvas.className = "imageLayer";
    layConDiv.appendChild(imgCanvas);
    dwvDiv.appendChild(layConDiv);
    mainDiv.appendChild(dwvDiv);

    // dwv application
    var config = {
        "containerDivId": id,
        "skipLoadUrl": true,
        "useWebWorkers": true
    };
    var url = "../data/" + fileroot + ".dcm";
    var app = new dwv.App();
    app.init(config);
    app.loadURLs([url]);

    // parsing timing
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = "arraybuffer";
    request.onload = function (/*event*/) {
        // setup the dicom parser
        var dicomParser = new dwv.dicom.DicomParser();
        // parse the buffer
        console.time("parse::"+fileroot);
        dicomParser.parse(this.response);
        console.timeEnd("parse::"+fileroot);
    };
    request.send(null);

    // image
    var image = document.createElement("img");
    image.src = "./images/" + fileroot + ".jpg";
    image.setAttribute("class", "snapshot");
    mainDiv.appendChild(image);

    // doc
    var docDiv = document.createElement("div");
    docDiv.setAttribute("class", "doc");
    var docUl = document.createElement("ul");
    var keys = Object.keys(doc);
    for ( var i = 0; i < keys.length; ++i ) {
        var li = document.createElement("li");
        var spanKey = document.createElement("span");
        spanKey.setAttribute("class", "key");
        spanKey.appendChild( document.createTextNode(keys[i]) );
        var spanValue = document.createElement("span");
        spanValue.setAttribute("class", "value");
        spanValue.appendChild( document.createTextNode(doc[keys[i]]) );
        if ( keys[i] === "origin" ) {

            var spanOrig = document.createElement("span");
            spanOrig.setAttribute("class", "path");
            spanOrig.setAttribute("title", doc.path);
            spanOrig.appendChild( document.createTextNode(doc[keys[i]]) );
            li.appendChild( spanKey );
            li.appendChild( document.createTextNode( ": " ) );
            li.appendChild( spanOrig );
            docUl.appendChild(li);
        }
        else if ( keys[i] === "path" ) {
            // nothing to do
        }
        else {
            li.appendChild( spanKey );
            li.appendChild( document.createTextNode( ": " ) );
            li.appendChild( spanValue );
            docUl.appendChild(li);
        }
    }
    docDiv.appendChild(docUl);
    mainDiv.appendChild(docDiv);

    // separator
    var sepDiv = document.createElement("div");
    sepDiv.setAttribute("class", "separator");
    mainDiv.appendChild(sepDiv);
};
