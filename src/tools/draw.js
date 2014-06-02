/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/**
 * Draw shape command.
 * @class DrawShapeCommand
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.DrawShapeCommand = function (group, shape, name, app)
{
    /**
     * Command name.
     * @property name
     * @private
     * @type String
     */
    var _name = "Draw-"+name;
    /**
     * Get the command name.
     * @method getName
     * @return {String} The command name.
     */
    this.getName = function() { return _name; };

    /**
     * Execute the command.
     * @method execute
     */
    this.execute = function()
    {
        // add the group to the layer
        app.getKineticLayer().add(group);
        // draw
        app.getKineticLayer().draw();
    };
    this.undo = function () {
        // remove the group
        group.remove();
        // draw
        app.getKineticLayer().draw();
    };

}; // DrawShapeCommand class

/**
 * Move shape command.
 * @class MoveShapeCommand
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.MoveShapeCommand = function (group, shape, name, translation, app)
{
    /**
     * Command name.
     * @property name
     * @private
     * @type String
     */
    var _name = "Move-"+name;
    /**
     * Get the command name.
     * @method getName
     * @return {String} The command name.
     */
    this.getName = function() { return _name; };

    /**
     * Execute the command.
     * @method execute
     */
    this.execute = function()
    {
        // translate group
        group.x( group.x() + translation.x );
        group.y( group.y() + translation.y );
        // draw
        app.getKineticLayer().draw();
    };
    this.undo = function () {
        // invert translate group
        group.x( group.x() - translation.x );
        group.y( group.y() - translation.y );
        // draw
        app.getKineticLayer().draw();
    };

}; // MoveShapeCommand class

/**
 * Delete shape command.
 * @class DeleteShapeCommand
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.DeleteShapeCommand = function (group, shape, name, app)
{
    /**
     * Command name.
     * @property name
     * @private
     * @type String
     */
    var _name = "Delete-"+name;
    /**
     * Get the command name.
     * @method getName
     * @return {String} The command name.
     */
    this.getName = function() { return _name; };

    /**
     * Execute the command.
     * @method execute
     */
    this.execute = function()
    {
        // remove the group
        group.remove();
        // draw
        app.getKineticLayer().draw();
    };
    this.undo = function () {
        // add the group to the layer
        app.getKineticLayer().add(group);
        // draw
        app.getKineticLayer().draw();
    };

}; // DeleteShapeCommand class

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
     * @private
     * @type Boolean
     */
    var started = false;
    /**
     * Interaction just started flag.
     * @property justStarted
     * @private
     * @type Boolean
     */
    var justStarted = true;
    
    /**
     * Draw command.
     * @property command
     * @private
     * @type Object
     */
    var command = null;
    /**
     * Current shape.
     * @property shape
     * @private
     * @type Object
     */
    var shape = null;
    /**
     * Current shape group.
     * @property shapeGroup
     * @private
     * @type Object
     */
    var shapeGroup = null;

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
     * List of points.
     * @property points
     * @private
     * @type Array
     */
    var points = [];
    
    /**
     * Last selected point.
     * @property lastPoint
     * @private
     * @type Object
     */
    var lastPoint = null;
    
    /**
     * Shape editor.
     * @property shapeEditor
     * @private
     * @type Object
     */
    var shapeEditor = new dwv.tool.ShapeEditor();

    var trashLine1 = new Kinetic.Line({
        points: [0, 0, 10, 10 ],
        stroke: 'tomato',
    });
    var trashLine2 = new Kinetic.Line({
        points: [10, 0, 0, 10 ],
        stroke: 'tomato'
    });
    var trash = new Kinetic.Group();
    trash.add(trashLine1);
    trash.add(trashLine2);

    /**
     * Handle mouse down event.
     * @method mousedown
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        // determine if the click happened in an existing shape
        var stage = app.getKineticStage();
        var kshape = stage.getIntersection({
            x: event._xs, 
            y: event._ys
        });
        
        if ( kshape ) {
            var group = kshape.getParent();
            var draw = group.find(".shape")[0];
            // activate editor if click on other shape
            if( draw && draw !== shapeEditor.getShape() ) { 
                // disable previous edition
                shapeEditor.disable();
                // set new edited shape
                shapeEditor.setShape(draw);
                // enable new edition
                shapeEditor.enable();
            }
        }
        else {
            // disable edition
            shapeEditor.disable();
            // start storing points
            started = true;
            shapeGroup = new Kinetic.Group();
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
            // remove previous draw if not just started
            if ( shape && !justStarted ) {
                shape.destroy();
            }
            if ( justStarted ) {
                justStarted = false;
            }
            // create shape
            shape = new dwv.tool.shapes[self.shapeName](points, self.style);
            // add shape to group
            shapeGroup.add(shape);
            // draw shape command
            command = new dwv.tool.DrawShapeCommand(shapeGroup, shape, self.shapeName, app);
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
            // remove previous draw
            if ( shape ) {
                shape.destroy();
            }
            // create final shape
            shape = new dwv.tool.shapes[self.shapeName](points, self.style);
            // add shape to group
            shapeGroup.add(shape);
            // draw shape command
            command = new dwv.tool.DrawShapeCommand(shapeGroup, shape, self.shapeName, app);
            // execute it
            command.execute();
            // save it in undo stack
            app.getUndoStack().add(command);
            
            // make shape group draggable
            self.setShapeOn(shape);
            // reset flag
            justStarted = true;
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
        var shapes = null;
        if ( bool ) {
            shapes = app.getKineticLayer().find('.shape');
            shapes.each( function (shape){ self.setShapeOn( shape ); });
        }
        else {
            // disable editor
            shapeEditor.disable();
            document.body.style.cursor = 'default';
            // remove mouse style
            shapes = app.getKineticLayer().find('.shape');
            shapes.each( function (shape){ setShapeOff( shape ); });
            // draw
            app.getKineticLayer().draw();
        }
    };
    
    /**
     * Set shape off properties.
     * @method setShapeOff
     * @param {Object} shape The shape to set off.
     */
    function setShapeOff( shape ) {
        // mouse over styling
        shape.off('mouseover');
        // mouse out styling
        shape.off('mouseout');
        // drag
        shape.getParent().draggable(false);
    }

    /**
     * Set shape on properties.
     * @method setShapeOn
     * @param {Object} shape The shape to set on.
     */
    this.setShapeOn = function ( shape ) {
        // mouse over styling
        shape.on('mouseover', function () {
            if ( this.getLayer() ) {
                document.body.style.cursor = 'pointer';
                this.getLayer().draw();
            }
        });
        // mouse out styling
        shape.on('mouseout', function () {
            if ( this.getLayer() ) {
                document.body.style.cursor = 'default';
                this.getLayer().draw();
            }
        });

        // shape group
        var group = shape.getParent();
        // make it draggable
        group.draggable(true);
        
        // command name based on shape type
        var cmdName = "shape";
        if ( shape instanceof Kinetic.Line ) {
            cmdName = "line";
        }
        else if ( shape instanceof Kinetic.Rect ) {
            cmdName = "rectangle";
        }
        else if ( shape instanceof Kinetic.Ellipse ) {
            cmdName = "ellipse";
        }
        
        // set trash position
        var stage = app.getKineticStage();
        trash.x( 256 - stage.offset().x );
        trash.y( stage.offset().y + 20 );
        
        var dragStartPos = null;
        
        // drag start event handling
        group.on('dragstart', function (event) {
            // save start position
            dragStartPos = { 'x': (event.evt.offsetX - stage.offset().x) / stage.scale().x,
                    'y': (event.evt.offsetY - stage.offset().y) / stage.scale().y};
            // display trash
            app.getKineticLayer().add( trash );
            // draw
            app.getKineticLayer().draw();
        });
        // drag move event handling
        group.on('dragmove', function (event) {
            var ev = { 'x': (event.evt.offsetX - stage.offset().x) / stage.scale().x,
                    'y': (event.evt.offsetY - stage.offset().y) / stage.scale().y};
            // highlight trash if on it
            if ( Math.abs( ev.x - trash.x() ) < 10 &&
                    Math.abs( ev.y - trash.y() ) < 10   ) {
                trash.getChildren().each( function (shape){ shape.stroke('red'); });
            }
            else {
                trash.getChildren().each( function (shape){ shape.stroke('tomato'); });
            }
            // draw
            app.getKineticLayer().draw();
        });
        // drag end event handling
        group.on('dragend', function (event) {
            var stage = app.getKineticStage();
            var ev = { 'x': (event.evt.offsetX - stage.offset().x) / stage.scale().x,
                    'y': (event.evt.offsetY - stage.offset().y) / stage.scale().y};
            // delete case
            if ( Math.abs( ev.x - trash.x() ) < 20 &&
                    Math.abs( ev.y - trash.y() ) < 10   ) {
                // compensate for the drag translation
                var delTranslation = {'x': ev.x - dragStartPos.x, 
                        'y': ev.y - dragStartPos.y};
                this.x( this.x() - delTranslation.x );
                this.y( this.y() - delTranslation.y );
                // delete command
                var delcmd = new dwv.tool.DeleteShapeCommand(this, shape, cmdName, app);
                delcmd.execute();
                app.getUndoStack().add(delcmd);
            }
            else {
                // save drag move
                var translation = {'x': ev.x - dragStartPos.x, 
                        'y': ev.y - dragStartPos.y};
                var mvcmd = new dwv.tool.MoveShapeCommand(this, shape, cmdName, translation, app);
                app.getUndoStack().add(mvcmd);
            }
            // remove trash
            trash.remove();
            // draw
            app.getKineticLayer().draw();
        });
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
