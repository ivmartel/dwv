// Main DWV namespace.
var dwv = dwv || {};

/**
 * Toolbox controller.
 * @class ToolboxController
 * @namespace dwv
 * @constructor
 */
dwv.ToolboxController = function (toolbox)
{
    /**
     * Set the selected tool.
     * @method setSelectedTool
     * @param {String} name The name of the tool.
     */
    this.setSelectedTool = function (name)
    {
        toolbox.setSelectedTool(name);
    };
    
    /**
     * Set the selected shape.
     * @method setSelectedShape
     * @param {String} name The name of the shape.
     */
    this.setSelectedShape = function (name)
    {
        toolbox.getSelectedTool().setShapeName(name);
    };
    
    /**
     * Set the selected filter.
     * @method setSelectedFilter
     * @param {String} name The name of the filter.
     */
    this.setSelectedFilter = function (name)
    {
        toolbox.getSelectedTool().setSelectedFilter(name);
    };
    
    /**
     * Run the selected filter.
     * @method runSelectedFilter
     */
    this.runSelectedFilter = function ()
    {
        toolbox.getSelectedTool().getSelectedFilter().run();
    };
    
    /**
     * Set the tool line color.
     * @method runFilter
     * @param {String} name The name of the color.
     */
    this.setLineColour = function (name)
    {
        toolbox.getSelectedTool().setLineColour(name);
    };
    
    /**
     * Set the tool range.
     * @method setRange
     * @param {Object} range The new range of the data.
     */
    this.setRange = function (range)
    {
        // seems like jquery is checking if the method exists before it 
        // is used...
        if ( toolbox && toolbox.getSelectedTool() &&
                toolbox.getSelectedTool().getSelectedFilter() ) {
            toolbox.getSelectedTool().getSelectedFilter().run(range);
        }
    };
    
}; // class dwv.ToolboxController
