/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

var Kinetic = Kinetic || {};

function updateLine(line, activeAnchor) {
    var group = activeAnchor.getParent();
    
    var begin = group.find('#begin')[0];
    var end = group.find('#end')[0];
    
    var anchorX = activeAnchor.x();
    var anchorY = activeAnchor.y();
    
    // update anchor positions
    switch (activeAnchor.id()) {
    case 'begin':
        begin.x( anchorX );
        begin.y( anchorY );
        break;
    case 'end':
        end.x( anchorX );
        end.y( anchorY );
        break;
    }
    
    //line.setPosition(begin.getPosition());
    line.points([begin.x(), begin.y(), end.x(), end.y()]);
}

function updateRect(rect, activeAnchor) {
    var group = activeAnchor.getParent();

    var topLeft = group.find('#topLeft')[0];
    var topRight = group.find('#topRight')[0];
    var bottomRight = group.find('#bottomRight')[0];
    var bottomLeft = group.find('#bottomLeft')[0];

    var anchorX = activeAnchor.x();
    var anchorY = activeAnchor.y();

    // update anchor positions
    switch (activeAnchor.id()) {
    case 'topLeft':
        topRight.y(anchorY);
        bottomLeft.x(anchorX);
        break;
    case 'topRight':
        topLeft.y(anchorY);
        bottomRight.x(anchorX);
        break;
    case 'bottomRight':
        bottomLeft.y(anchorY);
        topRight.x(anchorX); 
        break;
    case 'bottomLeft':
        bottomRight.y(anchorY);
        topLeft.x(anchorX); 
        break;
    }

    rect.setPosition(topLeft.getPosition());

    var width = Math.abs( topRight.x() - topLeft.x() );
    var height = Math.abs( bottomLeft.y() - topLeft.y() );
    if ( width && height ) {
        rect.setSize({width:width, height: height});
    }
}

function updateCircle(circle, activeAnchor) {
    var group = activeAnchor.getParent();

    var topLeft = group.find('#topLeft')[0];
    var topRight = group.find('#topRight')[0];
    var bottomRight = group.find('#bottomRight')[0];
    var bottomLeft = group.find('#bottomLeft')[0];

    var anchorX = activeAnchor.x();
    var anchorY = activeAnchor.y();

    // update anchor positions
    switch (activeAnchor.id()) {
    case 'topLeft':
        topRight.y(anchorY);
        bottomLeft.x(anchorX);
        break;
    case 'topRight':
        topLeft.y(anchorY);
        bottomRight.x(anchorX);
        break;
    case 'bottomRight':
        bottomLeft.y(anchorY);
        topRight.x(anchorX); 
        break;
    case 'bottomLeft':
        bottomRight.y(anchorY);
        topLeft.x(anchorX); 
        break;
    }

    var radius = Math.abs( topRight.x() - topLeft.x() ) / 2;
    circle.radius( radius );
    //circle.x( topLeft.x() + radius );
    //circle.y( topLeft.y() + radius );
}

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
        // add spape specific anchors to the shape group
        if ( inshape instanceof Kinetic.Line ) {
            var points = inshape.points();
            var lineBegin = points[0];
            var lineEnd = points[1];
            addAnchor(group, lineBegin.x, lineBegin.y, 'begin', updateLine);
            addAnchor(group, lineEnd.x, lineEnd.y, 'end', updateLine);
        }
        else if ( inshape instanceof Kinetic.Rect ) {
            var rectX = inshape.x();
            var rectY = inshape.y();
            var rectWidth = inshape.width();
            var rectHeight = inshape.height();
            addAnchor(group, rectX, rectY, 'topLeft', updateRect);
            addAnchor(group, rectX+rectWidth, rectY, 'topRight', updateRect);
            addAnchor(group, rectX+rectWidth, rectY+rectHeight, 'bottomRight', updateRect);
            addAnchor(group, rectX, rectY+rectHeight, 'bottomLeft', updateRect);
        }
        else if ( inshape instanceof Kinetic.Circle ) {
            var circleX = inshape.x();
            var circleY = inshape.y();
            var radius = inshape.radius();
            addAnchor(group, circleX-radius, circleY-radius, 'topLeft', updateCircle);
            addAnchor(group, circleX+radius, circleY-radius, 'topRight', updateCircle);
            addAnchor(group, circleX+radius, circleY+radius, 'bottomRight', updateCircle);
            addAnchor(group, circleX-radius, circleY+radius, 'bottomLeft', updateCircle);
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
            stroke: '#666',
            fill: '#ddd',
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
            this.setStrokeWidth(4);
            this.getLayer().draw();
        });
        anchor.on('mouseout', function () {
            document.body.style.cursor = 'default';
            this.strokeWidth(2);
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
            console.log("got shape: "+shape.name());
            var group = shape.getParent();
            var draw = group.find(".final")[0];
            
            if( draw ) {
                console.log("got draw: "+draw.name());
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
            console.log("no shape");
            if ( shapeEditor.isActive() ) {
                shapeEditor.disable();
            }
            started = true;
            // clear array
            points = [];
            // store point
            points.push(new dwv.math.Point2D(event._x, event._y));
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
        if ( event._x !== points[0].getX() &&
             event._y !== points[0].getY() )
        {
            // current point
            points.push(new dwv.math.Point2D(event._x, event._y));
            // create draw command
            command = new dwv.tool.shapes[self.shapeName](points, app, self.style, false);
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
            command = new dwv.tool.shapes[self.shapeName](points, app, self.style, true);
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
