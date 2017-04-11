// namespaces
var dwv = dwv || {};
dwv.gui = dwv.gui || {};
dwv.gui.base = dwv.gui.base || {};

/**
 * Append the version HTML.
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
 * @param {Boolean} mobile Flag for mobile or not environement.
 */
dwv.gui.base.appendHelpHtml = function(toolList, mobile, app)
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
    var tkeys = Object.keys(toolList);
    for ( var t=0; t < tkeys.length; ++t )
    {
        tool = toolList[tkeys[t]];
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
                img.src = dir + "/../../resources/doc/"+keys[i]+".png";
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

    var helpNode = app.getElement("help");

    var headPara = document.createElement("p");
    headPara.appendChild(document.createTextNode(dwv.i18n("help.intro.p0")));
    helpNode.appendChild(headPara);

    var secondPara = document.createElement("p");
    secondPara.appendChild(document.createTextNode(dwv.i18n("help.intro.p1")));
    helpNode.appendChild(secondPara);

    var toolPara = document.createElement("p");
    toolPara.appendChild(document.createTextNode(dwv.i18n("help.tool_intro")));
    helpNode.appendChild(toolPara);
    helpNode.appendChild(toolHelpDiv);
};
