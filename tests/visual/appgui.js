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

// Image decoders (for web workers)
dwv.image.decoderScripts = {
    "jpeg2000": "../../ext/pdfjs/decode-jpeg2000.js",
    "jpeg-lossless": "../../ext/rii-mango/decode-jpegloss.js",
    "jpeg-baseline": "../../ext/pdfjs/decode-jpegbaseline.js"
};

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
        "skipLoadUrl": true
    };
    var url = "../data/" + fileroot + ".dcm";
    var app = new dwv.App();
    app.init(config);
    // display loading time
    var listener = function (event) {
        if (event.type === "load-start") {
            console.time("load-data");
        }
        else {
            console.timeEnd("load-data");
        }
    };
    app.addEventListener("load-start", listener);
    app.addEventListener("load-end", listener);
    // load data
    app.loadURLs([url]);

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
