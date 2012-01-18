/**
* draw.js
* Functions for drawing tools.
*/
// draw namespace
tool.draw = tool.draw || {};

/**
 * Append the color chooser to the HTML document in the 'colourChooser' node.
 */
tool.draw.appendColourChooserHtml = function(app)
{
    var paragraph = document.createElement("p");  
    paragraph.appendChild(document.createTextNode("Colour: "));

    var table = document.createElement("table");
    table.name = "colourChooser";
    table.className = "colourChooser";
    
    var row = table.insertRow(-1);
    row.id = "colours";
    row.onmouseover = tool.draw.onMouseOver;
    row.onmouseout = tool.draw.onMouseOut;
    
    var colours = new Array("black", "white", "red", "green", "blue", "yellow", "lime", "fuchsia");
    var cell;
    for ( var i = 0; i < colours.length; ++i )
    {
    	cell = row.insertCell(i);
    	cell.id = colours[i];
    	cell.onclick = app.setLineColor;
    	cell.appendChild(document.createTextNode(" "));
    }

    paragraph.appendChild(table);
    document.getElementById('colourChooser').appendChild(paragraph);
    
    // select default
    tool.draw.setLineColor(app.getStyle().getLineColor());
};

/**
 * Remove all children from the 'colourChooser' node.
 */
tool.draw.clearColourChooserHtml = function()
{
	node = document.getElementById('colourChooser');
	while (node.hasChildNodes()) node.removeChild(node.firstChild);
};

/**
 * Set the line color of the color chooser
 * @param color The color to use.
 */
tool.draw.setLineColor = function(color)
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
tool.draw.onMouseOver = function(event)
{
    document.body.style.cursor="pointer";
};

/**
 * Set the cursor when mouse out the color chooser.
 */
tool.draw.onMouseOut = function(event)
{
    document.body.style.cursor="auto";
};
