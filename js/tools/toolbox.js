/**
* toolbox.js
* Tool box.
*/
function ToolBox()
{
    this.tools = {};
    this.selectedTool = 0;
    this.defaultToolName = 'zoom';
}

ToolBox.prototype.getTools = function() {
    return this.tools;
};

ToolBox.prototype.getSelectedTool = function() {
    return this.selectedTool;
};

ToolBox.prototype.setSelectedTool = function(toolName) {
    // disable old one
    if( this.selectedTool )
    {
        this.enable(false)
    }
    // enable new one
    this.selectedTool = new this.tools[toolName]();
    this.enable(true);
};

ToolBox.prototype.hasTool = function(toolName) {
    return this.tools[toolName];
};

ToolBox.prototype.init = function()
{
    // tool list
    this.tools.rect = tools_rect;
    this.tools.roi = tools_roi;
    this.tools.line = tools_line;
    this.tools.circle = tools_circle;
    this.tools.windowLevel = tools_windowLevel;
    this.tools.zoom = tools_zoom;

    // Get the tool select input.
    var tool_select = document.getElementById('dtool');
    if (!tool_select)
    {
        alert('Error: failed to get the dtool element!');
        return;
    }
    tool_select.addEventListener('change', gEventToolChange, false);
    
    // Activate the default tool.
    if (this.tools[this.defaultToolName])
    {
        this.selectedTool = new this.tools[this.defaultToolName]();
        tool_select.value = this.defaultToolName;
    }
    this.enable(true);
}

ToolBox.prototype.enable = function(value)
{
    // enable html select 
    document.getElementById('dtool').disabled = !value;
    // enable selected tool
    this.selectedTool.enable(value);
}

// The event handler for any changes made to the tool selector.
function gEventToolChange(event)
{
    if( gToolBox.hasTool(this.value) )
    {
        gToolBox.setSelectedTool(this.value);
    }
}

function gGetToolBox()
{
    var paragraph = document.createElement("p");  
    paragraph.appendChild(document.createTextNode("Tool: "));
    
    var selector = document.createElement("select");
    selector.id = "dtool";
    selector.name = "dtool";
    selector.disabled = 1;
    paragraph.appendChild(selector);

    var options = new Array("windowLevel", "rect", "circle", "roi", "line", "zoom");
    var option;
    for( var i = 0; i < options.length; ++i )
    {
        option = document.createElement("option");
        option.value = options[i];
        option.appendChild(document.createTextNode(options[i]));
        selector.appendChild(option);
    }

    document.getElementById('toolbox').appendChild(paragraph);
}

