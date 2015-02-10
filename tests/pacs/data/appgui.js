/** 
 * Application GUI.
 */

// Window
dwv.gui.getWindowSize = dwv.gui.base.getWindowSize;
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
    dwvDiv.setAttribute("class", "layerContainer");
    var imgCanvas = document.createElement("canvas");
    imgCanvas.id = id + "-imageLayer";
    dwvDiv.appendChild(imgCanvas);
    mainDiv.appendChild(dwvDiv);
    
    // dwv application
    var config = {
        "containerDivId": id,
    };
    var app = new dwv.App();
    app.init(config);
    app.loadURL([fileroot + ".dcm"]);
    
    // image
    var image = document.createElement("img");
    image.src = fileroot + ".jpg";
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
