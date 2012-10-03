/**
 * @namespace Tool classes.
 */
dwv.tool = dwv.tool || {};
/**
 * @namespace Drawing Tool classes.
 */
dwv.tool.draw = dwv.tool.draw || {};

dwv.tool.draw.CommandFactory = function() {};

dwv.tool.draw.CommandFactory.prototype.create = function(shapeName, shape, app, style)
{
    var object = null;
    if( shapeName === "line")
    {
        object = new dwv.tool.DrawLineCommand(shape, app, style);
    }
    else if( shapeName === "circle")
    {
        object = new dwv.tool.DrawCircleCommand(shape, app, style);
    }
    else if( shapeName === "rectangle")
    {
        object = new dwv.tool.DrawRectangleCommand(shape, app, style);
    }
    else if( shapeName === "roi")
    {
        object = new dwv.tool.DrawRoiCommand(shape, app, style);
    }
    return object;
};

/**
* @class Drawing tool.
*/
dwv.tool.Draw = function(app)
{
    var self = this;
    this.started = false;
    var command = null;
    var style = new dwv.html.Style();
    var shapeName = "line";
    var points = [];

    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        self.started = true;
        points = [];
        points.push(new dwv.math.Point2D(ev._x, ev._y));
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!self.started)
        {
            return;
        }
        // current point
        points.push(new dwv.math.Point2D(ev._x, ev._y));
        // create circle
        var shapeFactory = new dwv.math.ShapeFactory();
        var shape = shapeFactory.create(shapeName, points);
        // create draw command
        var commandFactory = new dwv.tool.draw.CommandFactory();
        command = commandFactory.create(shapeName, shape, app, style);
        // clear the temporary layer
        app.getTempLayer().clearContextRect();
        // draw
        command.execute();
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (self.started)
        {
            if( ev._x!==points[0].getX() && ev._y!==points[0].getY()) {
                // draw
                self.mousemove(ev);
                // save command in undo stack
                app.getUndoStack().add(command);
                // merge temporary layer
                app.getDrawLayer().merge(app.getTempLayer());
            }
            // set flag
            self.started = false;
        }
    };

    this.enable = function(value){
        if( value ) {
            dwv.tool.draw.appendShapeChooserHtml(app);
            dwv.tool.draw.appendColourChooserHtml(app);
        }
        else { 
            dwv.tool.draw.clearColourChooserHtml();
            dwv.tool.draw.clearShapeChooserHtml();
        }
    };
    
    this.keydown = function(event){
        app.handleKeyDown(event);
    };

    this.setLineColor = function(event)
    {
        // get the color
        var color = event.target.id;
        // set style var
        style.setLineColor(color);
        // reset borders
        dwv.tool.draw.setLineColor(color);
    };
    
    this.setShapeName = function(event)
    {
        shapeName = event.target.options[event.target.selectedIndex].text;
    };
    
}; // Circle class

/**
 * @function Append the color chooser to the HTML document in the 'colourChooser' node.
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
        cell.onclick = app.getToolBox().getSelectedTool().setLineColor;
        cell.appendChild(document.createTextNode(" "));
    }

    paragraph.appendChild(table);
    div.appendChild(paragraph);
    document.getElementById('toolbox').appendChild(div);
    
    // select default
    dwv.tool.draw.setLineColor(app.getStyle().getLineColor());
};

/**
 * @function Remove the tool specific node.
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
 * @function Set the line color of the color chooser
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

dwv.tool.draw.appendShapeChooserHtml = function(app)
{
    var div = document.createElement("div");
    div.id = "shapeChooser";
    
    var paragraph = document.createElement("p");  
    paragraph.appendChild(document.createTextNode("Shape: "));
    
    var selector = document.createElement("select");
    selector.id = "dshape";
    selector.name = "dshape";
    selector.addEventListener('change', app.getToolBox().getSelectedTool().setShapeName, false);
    paragraph.appendChild(selector);

    var options = ["line", "rectangle", "circle", "roi"]; // line is default
    var option;
    for( var i = 0; i < options.length; ++i )
    {
        option = document.createElement("option");
        option.value = options[i];
        option.appendChild(document.createTextNode(options[i]));
        selector.appendChild(option);
    }

    div.appendChild(paragraph);
    document.getElementById('toolbox').appendChild(div);
};

dwv.tool.draw.clearShapeChooserHtml = function()
{
    // find the tool specific node
    var node = document.getElementById('shapeChooser');
    // delete its content
    while (node.hasChildNodes()) { 
        node.removeChild(node.firstChild);
    }
    // remove the tool specific node
    var top = document.getElementById('toolbox');
    top.removeChild(node);
};

/**
 * @function Set the cursor when mouse over the color chooser.
 */
dwv.tool.draw.onMouseOver = function(event)
{
    document.body.style.cursor="pointer";
};

/**
 * @function Set the cursor when mouse out the color chooser.
 */
dwv.tool.draw.onMouseOut = function(event)
{
    document.body.style.cursor="auto";
};

