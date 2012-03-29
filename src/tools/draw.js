// tool namespace
dwv.tool = dwv.tool || {};
// draw namespace
dwv.tool.draw = dwv.tool.draw || {};

/**
* draw.js
* Functions for drawing tools.
*/

/**
 * Append the color chooser to the HTML document in the 'colourChooser' node.
 */
dwv.tool.draw.appendColourChooserHtml = function(app)
{
    var div = document.createElement("div");
    div.id = "colourChooser";
    
    var paragraph = document.createElement("p");  
    paragraph.appendChild(document.createTextNode("Colour: "));

    var table = document.createElement("table");
    table.name = "colourChooser";
    table.className = "colourChooser";
    
    var row = table.insertRow(-1);
    row.id = "colours";
    row.onmouseover = dwv.tool.draw.onMouseOver;
    row.onmouseout = dwv.tool.draw.onMouseOut;
    
    var colours = ["black", "white", "red", "green", "blue", "yellow", "lime", "fuchsia"];
    var cell;
    for ( var i = 0; i < colours.length; ++i )
    {
        cell = row.insertCell(i);
        cell.id = colours[i];
        cell.onclick = app.setLineColor;
        cell.appendChild(document.createTextNode(" "));
    }

    paragraph.appendChild(table);
    div.appendChild(paragraph);
    document.getElementById('toolbox').appendChild(div);
    
    // select default
    dwv.tool.draw.setLineColor(app.getStyle().getLineColor());
};

/**
 * Remove the tool specific node.
 */
dwv.tool.draw.clearColourChooserHtml = function()
{
    // find the tool specific node
    var node = document.getElementById('colourChooser');
    // delete its content
    while (node.hasChildNodes()) { 
        node.removeChild(node.firstChild);
    }
    // remove the tool specific node
    var top = document.getElementById('toolbox');
    top.removeChild(node);
};

/**
 * Set the line color of the color chooser
 * @param color The color to use.
 */
dwv.tool.draw.setLineColor = function(color)
{
    // reset borders
    var tr = document.getElementById("colours");
    var tds = tr.getElementsByTagName("td");
    for (var i = 0; i < tds.length; i++)
    {
        tds[i].style.border = "#fff solid 2px";
    }
    // set selected border
    var td = document.getElementById(color);
    td.style.border = "#00f solid 2px";
};

/**
 * Set the cursor when mouse over the color chooser.
 */
dwv.tool.draw.onMouseOver = function(event)
{
    document.body.style.cursor="pointer";
};

/**
 * Set the cursor when mouse out the color chooser.
 */
dwv.tool.draw.onMouseOut = function(event)
{
    document.body.style.cursor="auto";
};
