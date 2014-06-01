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
dwv.tool.DrawShapeCommand = function (shape, name, app)
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
        // remove temporary shapes from the layer
        var klayer = app.getKineticLayer();
        var kshapes = klayer.find('.temp');
        kshapes.each( function (kshape) {
            kshape.remove(); 
        });
        // create group
        var kgroup = new Kinetic.Group();
        kgroup.add(shape);
        // add the group to the layer
        app.getKineticLayer().add(kgroup);
        app.getKineticLayer().draw();
    };
    this.undo = function () {
        // remove anchors
        var anchors = shape.getLayer().find('.anchor');
        anchors.each( function (anchor) {
            anchor.visible(false);
        });
        // remove shape
        shape.remove();
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
        group.x( group.x() + translation.x );
        group.y( group.y() + translation.y );
        // draw
        app.getKineticLayer().draw();

        //app.getToolBox().getSelectedTool().setShapeOn(shape);
    };
    this.undo = function () {
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
dwv.tool.DeleteShapeCommand = function (group, shape, name, app, translation)
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
        group.remove();
    };
    this.undo = function () {
        // possible translation before deletion
        if ( typeof(translation) !== undefined ) {
            group.x( group.x() - translation.x );
            group.y( group.y() - translation.y );
        }
        
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
            shape = new dwv.tool.shapes[self.shapeName](points, self.style, false);
            command = new dwv.tool.DrawShapeCommand(shape, self.shapeName, app);
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
            shape = new dwv.tool.shapes[self.shapeName](points, self.style, true);
            command = new dwv.tool.DrawShapeCommand(shape, self.shapeName, app);
            // execute it
            command.execute();
            // save it in undo stack
            app.getUndoStack().add(command);
            // make shape group draggable
            self.setShapeOn(shape);
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
            shapes = app.getKineticLayer().find('.final');
            shapes.each( function (shape){ self.setShapeOn( shape ); });
        }
        else {
            // disable if still active
            if ( shapeEditor.isActive() ) {
                shapeEditor.disable();
            }
            document.body.style.cursor = 'default';
            app.getKineticLayer().draw();
            // remove mouse style
            shapes = app.getKineticLayer().find('.final');
            shapes.each( function (shape){ setShapeOff( shape ); });
        }
    };
    
    function setShapeOff( shape ) {
        // mouse over styling
        shape.off('mouseover');
        // mouse out styling
        shape.off('mouseout');
        // drag
        shape.getParent().draggable(false);
    }

    var trashText = new Kinetic.Text({
        x: 256,
        y: 10,
        fontSize: 13,
        fontFamily: 'Calibri',
        fill: 'tomato',
        text: 'TRASH'
    });

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

        var group = shape.getParent();
            
        // delete?
        var stage = app.getKineticStage();
        trashText.x( 256 - stage.offset().x );
        trashText.y( stage.offset().y + 20 );
        //console.log( 'trash: '+trashText.x()+', '+trashText.y());
        
        var dragStartPos = null;
        
        group.on('dragstart', function (event) {
            dragStartPos = { 'x': (event.evt.offsetX - stage.offset().x) / stage.scale().x,
                    'y': (event.evt.offsetY - stage.offset().y) / stage.scale().y};
            app.getKineticLayer().add( trashText );
            app.getKineticLayer().draw();
        });
        group.on('dragmove', function (event) {
            var ev = { 'x': (event.evt.offsetX - stage.offset().x) / stage.scale().x,
                    'y': (event.evt.offsetY - stage.offset().y) / stage.scale().y};
            //console.log( 'ev: '+ev.x+', '+ev.y);
            if ( Math.abs( ev.x - trashText.x() ) < 20 &&
                    Math.abs( ev.y - trashText.y() ) < 10   ) {
                trashText.fontSize('15');
                trashText.fill('red');
                app.getKineticLayer().draw();
            }
            else {
                trashText.fontSize('13');
                trashText.fill('tomato');
                app.getKineticLayer().draw();
            }
        });
        group.on('dragend', function (event) {
            var stage = app.getKineticStage();
            var ev = { 'x': (event.evt.offsetX - stage.offset().x) / stage.scale().x,
                    'y': (event.evt.offsetY - stage.offset().y) / stage.scale().y};
            // delete case
            if ( Math.abs( ev.x - trashText.x() ) < 20 &&
                    Math.abs( ev.y - trashText.y() ) < 10   ) {
                if ( shapeEditor.isActive() ) {
                    shapeEditor.disable();
                }
                document.body.style.cursor = 'default';
                setShapeOff( shape );
                var delTranslation = {'x': ev.x - dragStartPos.x, 
                        'y': ev.y - dragStartPos.y};
                var delcmd = new dwv.tool.DeleteShapeCommand(group, shape, "shape", app, delTranslation);
                delcmd.execute();
                app.getUndoStack().add(delcmd);
            }
            else {
                // save drag move
                var translation = {'x': ev.x - dragStartPos.x, 
                        'y': ev.y - dragStartPos.y};
                var mvcmd = new dwv.tool.MoveShapeCommand(group, shape, "shape", translation, app);
                app.getUndoStack().add(mvcmd);
            }
            trashText.remove();
            app.getKineticLayer().draw();
        });
        // drag
        group.draggable(true);
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
