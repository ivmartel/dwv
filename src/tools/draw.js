/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

var Kinetic = Kinetic || {};

dwv.tool.ShapeEditor = function () {
    var shape = null;
    var isActive = false;
    this.setShape = function ( inshape ) {
        shape = inshape;
        // clear previous controls
        var anchors = shape.getLayer().find('.anchor');
        anchors.each( function (anchor) {
            anchor.remove();
        });
        // add new controls
        createControls( shape );
    };
    this.getShape = function () { 
        return shape;
    };
    this.isActive = function () {
        return isActive;
    };
    this.enable = function () {
        isActive = true;
        var anchors = shape.getLayer().find('.anchor');
        anchors.each( function (anchor) {
            anchor.visible(true);
        });
        shape.getParent().draggable(true);
        shape.getLayer().draw();
    };
    this.disable = function () {
        isActive = false;
        var anchors = shape.getLayer().find('.anchor');
        anchors.each( function (anchor) {
            anchor.visible(false);
        });
        shape.getParent().draggable(false);
        shape.getLayer().draw();
        shape = null;
    };
    function createControls( inshape ) {
        // get shape group
        var group = inshape.getParent();
        // add shape specific anchors to the shape group
        if ( inshape instanceof Kinetic.Line ) {
            var points = inshape.points();
            if ( points.length === 4 ) {
                addAnchor(group, points[0], points[1], 'begin', dwv.tool.UpdateLine);
                addAnchor(group, points[2], points[3], 'end', dwv.tool.UpdateLine);
            }
            else {
                addAnchor(group, points[0], points[1], 0, dwv.tool.UpdateRoi);
                for ( var i = 0; i < points.length; i=i+2 ) {
                    addAnchor(group, points[i], points[i+1], i, dwv.tool.UpdateRoi);
                }
            }
        }
        else if ( inshape instanceof Kinetic.Rect ) {
            var rectX = inshape.x();
            var rectY = inshape.y();
            var rectWidth = inshape.width();
            var rectHeight = inshape.height();
            addAnchor(group, rectX, rectY, 'topLeft', dwv.tool.UpdateRect);
            addAnchor(group, rectX+rectWidth, rectY, 'topRight', dwv.tool.UpdateRect);
            addAnchor(group, rectX+rectWidth, rectY+rectHeight, 'bottomRight', dwv.tool.UpdateRect);
            addAnchor(group, rectX, rectY+rectHeight, 'bottomLeft', dwv.tool.UpdateRect);
        }
        else if ( inshape instanceof Kinetic.Ellipse ) {
            var ellipseX = inshape.x();
            var ellipseY = inshape.y();
            var radius = inshape.radius();
            addAnchor(group, ellipseX-radius.x, ellipseY-radius.y, 'topLeft', dwv.tool.UpdateEllipse);
            addAnchor(group, ellipseX+radius.x, ellipseY-radius.y, 'topRight', dwv.tool.UpdateEllipse);
            addAnchor(group, ellipseX+radius.x, ellipseY+radius.y, 'bottomRight', dwv.tool.UpdateEllipse);
            addAnchor(group, ellipseX-radius.x, ellipseY+radius.y, 'bottomLeft', dwv.tool.UpdateEllipse);
        }
        // add group to layer
        inshape.getLayer().add( group );
        // draw layer
        inshape.getLayer().draw();
    }
    function addAnchor(group, x, y, id, updateMethod) {
        // anchor shape
        var anchor = new Kinetic.Circle({
            x: x,
            y: y,
            stroke: '#999',
            fillRed: 100,
            fillBlue: 100,
            fillGreen: 100,
            fillAlpha: 0.7,
            strokeWidth: 2,
            radius: 6,
            name: 'anchor',
            id: id,
            dragOnTop: false,
            draggable: true,
            visible: false
        });

        anchor.on('dragmove', function () {
            updateMethod(shape, this);
            this.getLayer().draw();
        });
        anchor.on('mousedown touchstart', function () {
            this.moveToTop();
        });
        anchor.on('dragend', function () {
            this.getLayer().draw();
        });
        // add hover styling
        anchor.on('mouseover', function () {
            document.body.style.cursor = 'pointer';
            this.stroke('#ddd');
            this.getLayer().draw();
        });
        anchor.on('mouseout', function () {
            document.body.style.cursor = 'default';
            this.stroke('#999');
            this.getLayer().draw();
        });

        group.add(anchor);
    }
};

// List of colors
dwv.tool.colors = [
    "Yellow", "Red", "White", "Green", "Blue", "Lime", "Fuchsia", "Black"
];

/**
 * Drawing tool.
 * @class Draw
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.Draw = function (app)
{
    /**
     * Closure to self: to be used by event handlers.
     * @property self
     * @private
     * @type WindowLevel
     */
    var self = this;
    /**
     * Interaction start flag.
     * @property started
     * @type Boolean
     */
    var started = false;
    
    /**
     * Draw command.
     * @property command
     * @private
     * @type Object
     */
    var command = null;
    var shape = null;
    /**
     * Drawing style.
     * @property style
     * @type Style
     */
    this.style = new dwv.html.Style();
    /**
     * Shape name.
     * @property shapeName
     * @type String
     */
    this.shapeName = 0;
    /**
     * List of points
     * @property points
     * @type Array
     */
    var points = [];
    
    var lastPoint = null;
    
    var shapeEditor = new dwv.tool.ShapeEditor();

    /**
     * Handle mouse down event.
     * @method mousedown
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        var stage = app.getKineticStage();
        var shape = stage.getIntersection({
            x: event._xs, 
            y: event._ys
        });
        
        if ( shape ) {
            var group = shape.getParent();
            var draw = group.find(".final")[0];
            
            if( draw ) {
                if ( draw !== shapeEditor.getShape() ) {
                    if ( shapeEditor.isActive() ) {
                        shapeEditor.disable();
                    }
                    shapeEditor.setShape(draw);
                    shapeEditor.enable();
                }
            }
        }
        else {
            if ( shapeEditor.isActive() ) {
                shapeEditor.disable();
            }
            started = true;
            // clear array
            points = [];
            // store point
            lastPoint = new dwv.math.Point2D(event._x, event._y);
            points.push(lastPoint);
        }
    };

    /**
     * Handle mouse move event.
     * @method mousemove
     * @param {Object} event The mouse move event.
     */
    this.mousemove = function(event){
        if (!started)
        {
            return;
        }
        if ( Math.abs( event._x - lastPoint.getX() ) > 0 ||
                Math.abs( event._y - lastPoint.getY() ) > 0 )
        {
            // current point
            lastPoint = new dwv.math.Point2D(event._x, event._y);
            points.push( lastPoint );
            // create draw command
            shape = new dwv.tool.shapes[self.shapeName](points, app, self.style, false);
            command = new dwv.tool.DrawEllipseCommand(shape, app);
            // clear the temporary layer
            app.getTempLayer().clear();
            // draw
            command.execute();
        }
    };

    /**
     * Handle mouse up event.
     * @method mouseup
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function (/*event*/){
        if (started && points.length > 1 )
        {
            // create final command
            shape = new dwv.tool.shapes[self.shapeName](points, app, self.style, true);
            command = new dwv.tool.DrawEllipseCommand(shape, app);
            // execute it
            command.execute();
            // save it in undo stack
            app.getUndoStack().add(command);
        }
        // reset flag
        started = false;
    };
    
    /**
     * Handle mouse out event.
     * @method mouseout
     * @param {Object} event The mouse out event.
     */
    this.mouseout = function(event){
        self.mouseup(event);
    };

    /**
     * Handle touch start event.
     * @method touchstart
     * @param {Object} event The touch start event.
     */
    this.touchstart = function(event){
        self.mousedown(event);
    };

    /**
     * Handle touch move event.
     * @method touchmove
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        self.mousemove(event);
    };

    /**
     * Handle touch end event.
     * @method touchend
     * @param {Object} event The touch end event.
     */
    this.touchend = function(event){
        self.mouseup(event);
    };

    /**
     * Handle key down event.
     * @method keydown
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        app.handleKeyDown(event);
    };

    /**
     * Enable the tool.
     * @method enable
     * @param {Boolean} bool The flag to enable or not.
     */
    this.display = function(bool){
        dwv.gui.displayDrawHtml(bool);
    };

}; // Draw class

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.Draw.prototype.getHelp = function()
{
    return {
        'title': "Draw",
        'brief': "Allows to draw shapes on the image. " +
            "Choose the shape and its color from the drop down menus. ",
        'mouse': {
            'mouse_drag': "A single mouse drag draws the desired shape.",
        },
        'touch': {
            'touch_drag': "A single touch drag draws the desired shape.",
        }
    };
};

/**
 * Set the line color of the drawing.
 * @method setLineColour
 * @param {String} colour The colour to set.
 */
dwv.tool.Draw.prototype.setLineColour = function(colour)
{
    // set style var
    this.style.setLineColor(colour);
};

/**
 * Set the shape name of the drawing.
 * @method setShapeName
 * @param {String} name The name of the shape.
 */
dwv.tool.Draw.prototype.setShapeName = function(name)
{
    // check if we have it
    if( !this.hasShape(name) )
    {
        throw new Error("Unknown shape: '" + name + "'");
    }
    this.shapeName = name;
};

/**
 * Check if the shape is in the shape list.
 * @method hasShape
 * @param {String} name The name of the shape.
 */
dwv.tool.Draw.prototype.hasShape = function(name) {
    return dwv.tool.shapes[name];
};

/**
 * Initialise the tool.
 * @method init
 */
dwv.tool.Draw.prototype.init = function() {
    // set the default to the first in the list
    var shapeName = 0;
    for( var key in dwv.tool.shapes ){
        shapeName = key;
        break;
    }
    this.setShapeName(shapeName);
    // same for color
    this.setLineColour(dwv.tool.colors[0]);
    // init html
    dwv.gui.initDrawHtml();
};
