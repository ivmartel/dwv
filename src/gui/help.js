/** 
 * GUI module.
 * @module gui
 */
var dwv = dwv || {};
/**
 * Namespace for GUI functions.
 * @class gui
 * @namespace dwv
 * @static
 */
dwv.gui = dwv.gui || {};
dwv.gui.base = dwv.gui.base || {};

/**
 * Append the version HTML.
 * @method appendVersionHtml
 */
dwv.gui.base.appendVersionHtml = function (version)
{
    var nodes = document.getElementsByClassName("dwv-version");
    if ( nodes ) {
        for( var i = 0; i < nodes.length; ++i ){
            nodes[i].appendChild( document.createTextNode(version) );
        }
    }
};

/**
 * Build the help HTML.
 * @method appendHelpHtml
 * @param {Boolean} mobile Flag for mobile or not environement.
 */
dwv.gui.base.appendHelpHtml = function(toolList, mobile)
{
    var actionType = "mouse";
    if( mobile ) {
        actionType = "touch";
    }
    
    var toolHelpDiv = document.createElement("div");
    
    // current location
    var loc = window.location.pathname;
    var dir = loc.substring(0, loc.lastIndexOf('/'));

    var tool = null;
    for ( var t=0; t < toolList.length; ++t )
    {
        tool = toolList[t];
        // title
        var title = document.createElement("h3");
        title.appendChild(document.createTextNode(tool.getHelp().title));
        // doc div
        var docDiv = document.createElement("div");
        // brief
        var brief = document.createElement("p");
        brief.appendChild(document.createTextNode(tool.getHelp().brief));
        docDiv.appendChild(brief);
        // details
        if( tool.getHelp()[actionType] ) {
            var keys = Object.keys(tool.getHelp()[actionType]);
            for( var i=0; i<keys.length; ++i )
            {
                var action = tool.getHelp()[actionType][keys[i]];
                
                var img = document.createElement("img");
                img.src = dir + "/../../resources/"+keys[i]+".png";
                img.style.float = "left";
                img.style.margin = "0px 15px 15px 0px";
                
                var br = document.createElement("br");
                br.style.clear = "both";
                
                var para = document.createElement("p");
                para.appendChild(img);
                para.appendChild(document.createTextNode(action));
                para.appendChild(br);
                docDiv.appendChild(para);
            }
        }
        
        // different div structure for mobile or static
        if( mobile )
        {
            var toolDiv = document.createElement("div");
            toolDiv.setAttribute("data-role", "collapsible");
            toolDiv.appendChild(title);
            toolDiv.appendChild(docDiv);
            toolHelpDiv.appendChild(toolDiv);
        }
        else
        {
            toolHelpDiv.id = "accordion";
            toolHelpDiv.appendChild(title);
            toolHelpDiv.appendChild(docDiv);
        }
    }
    
    var helpNode = document.getElementById("help");

    var dwvLink = document.createElement("a");
    dwvLink.href = "https://github.com/ivmartel/dwv/wiki";
    dwvLink.title = "DWV wiki on github.";
    dwvLink.appendChild(document.createTextNode("DWV"));
    
    var dwvExampleLink = document.createElement("a");
    var inputIdx = document.URL.indexOf("?input=");
    dwvExampleLink.href = document.URL.substr(0, inputIdx+7) + 
        "http%3A%2F%2Fx.babymri.org%2F%3F53320924%26.dcm";
    dwvExampleLink.title = "Brain MRI in DWV.";
    dwvExampleLink.target = "_top";
    dwvExampleLink.appendChild(document.createTextNode("MRI"));

    var bbmriLink = document.createElement("a");
    bbmriLink.href = "http://www.babymri.org";
    bbmriLink.title = "babymri.org";
    bbmriLink.appendChild(document.createTextNode("babymri.org"));

    var headPara = document.createElement("p");
    headPara.appendChild(dwvLink);
    headPara.appendChild(document.createTextNode(" can load DICOM data " +
        "either from a local file or from an URL. All DICOM tags are available " +
        "in a searchable table, press the 'tags' or grid button. " + 
        "You can choose to display the image information overlay by pressing the " + 
        "'info' or i button. For some example data, check this "));
    headPara.appendChild(dwvExampleLink);
    headPara.appendChild(document.createTextNode(" from the " ));
    headPara.appendChild(bbmriLink);
    headPara.appendChild(document.createTextNode(" database." ));
    helpNode.appendChild(headPara);
    
    var toolPara = document.createElement("p");
    toolPara.appendChild(document.createTextNode("Each tool defines the possible " + 
        "user interactions. The default tool is the window/level one. " + 
        "Here are the available tools:"));
    helpNode.appendChild(toolPara);
    helpNode.appendChild(toolHelpDiv);
};
