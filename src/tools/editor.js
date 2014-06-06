/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/**
 * Shape editor.
 * @class ShapeEditor
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.ShapeEditor = function ()
{
    /**
     * Edited shape.
     * @property shape
     * @private
     * @type Object
     */
    var shape = null;
    /**
     * Active flag.
     * @property isActive
     * @private
     * @type Boolean
     */
    var isActive = false;
    /**
     * Update function used by anchors to update the shape.
     * @property updateFunction
     * @private
     * @type Object
     */
    var updateFunction = null;
    
    /**
     * Set the shape to edit.
     * @method setShape
     * @param {Object} inshape The shape to edit.
     */
    this.setShape = function ( inshape ) {
        shape = inshape;
        // reset anchors
        if ( shape ) {
            removeAnchors();
            addAnchors();
        }
    };
    
    /**
     * Get the edited shape.
     * @method getShape
     * @return {Object} The edited shape.
     */
    this.getShape = function () { 
        return shape;
    };
    
    /**
     * Get the active flag.
     * @method isActive
     * @return {Boolean} The active flag.
     */
    this.isActive = function () {
        return isActive;
    };

    /**
     * Enable the editor. Redraws the layer.
     * @method enable
     */
    this.enable = function () {
        isActive = true;
        if ( shape ) {
            setAnchorsVisible( true );
            if ( shape.getLayer() ) {
                shape.getLayer().draw();
            }
        }
    };
    
    /**
     * Disable the editor. Redraws the layer.
     * @method disable
     */
    this.disable = function () {
        isActive = false;
        if ( shape ) {
            setAnchorsVisible( false );
            if ( shape.getLayer() ) {
                shape.getLayer().draw();
            }
        }
    };
    
    /**
     * Reset the anchors.
     * @method resetAnchors
     */
    this.resetAnchors = function () {
        // remove previous controls
        removeAnchors();
        // add anchors
        addAnchors();
        // set them visible
        setAnchorsVisible( true );
    };
    
    /**
     * Apply a function on all anchors.
     * @param {Object} func A f(shape) function.
     */
    function applyFuncToAnchors( func ) {
        if ( shape && shape.getParent() ) {
            var anchors = shape.getParent().find('.anchor');
            anchors.each( func );
        }
    }
    
    /**
     * Set anchors visibility.
     * @method setAnchorsVisible
     * @param {Boolean} flag The visible flag.
     */
    function setAnchorsVisible( flag ) {
        applyFuncToAnchors( function (anchor) {
            anchor.visible( flag );
        });
    }

    /**
     * Set anchors active.
     * @method setAnchorsActive
     * @param {Boolean} flag The active (on/off) flag.
     */
    this.setAnchorsActive = function ( flag ) {
        var func = null;
        if ( flag ) { 
            func = function (anchor) {
                setAnchorOn( anchor );
            };
        }
        else {
            func = function (anchor) {
                setAnchorOff( anchor );
            };
        }
        applyFuncToAnchors( func );
    };

    /**
     * Remove anchors.
     * @method removeAnchors
     */
    function removeAnchors() {
        applyFuncToAnchors( function (anchor) {
            anchor.remove();
        });
    }
    
    /**
     * Add the shape anchors.
     * @method addAnchors
     */
    function addAnchors() {
        // exit if no shape or no layer
        if ( !shape || !shape.getLayer() ) {
            return;
        }
        // get shape group
        var group = shape.getParent();
        // add shape specific anchors to the shape group
        if ( shape instanceof Kinetic.Line ) {
            updateFunction = dwv.tool.UpdateLine;
            var points = shape.points();
            if ( points.length === 4 ) {
                var lineBeginX = points[0] + shape.x();
                var lineBeginY = points[1] + shape.y();
                var lineEndX = points[2] + shape.x();
                var lineEndY = points[3] + shape.y();
                addAnchor(group, lineBeginX, lineBeginY, 'begin');
                addAnchor(group, lineEndX, lineEndY, 'end');
            }
            else {
                updateFunction = dwv.tool.UpdateRoi;
                addAnchor(group, points[0], points[1], 0);
                for ( var i = 0; i < points.length; i=i+2 ) {
                    addAnchor(group, points[i], points[i+1], i);
                }
            }
        }
        else if ( shape instanceof Kinetic.Rect ) {
            updateFunction = dwv.tool.UpdateRect;
            var rectX = shape.x();
            var rectY = shape.y();
            var rectWidth = shape.width();
            var rectHeight = shape.height();
            addAnchor(group, rectX, rectY, 'topLeft');
            addAnchor(group, rectX+rectWidth, rectY, 'topRight');
            addAnchor(group, rectX+rectWidth, rectY+rectHeight, 'bottomRight');
            addAnchor(group, rectX, rectY+rectHeight, 'bottomLeft');
        }
        else if ( shape instanceof Kinetic.Ellipse ) {
            updateFunction = dwv.tool.UpdateEllipse;
            var ellipseX = shape.x();
            var ellipseY = shape.y();
            var radius = shape.radius();
            addAnchor(group, ellipseX-radius.x, ellipseY-radius.y, 'topLeft');
            addAnchor(group, ellipseX+radius.x, ellipseY-radius.y, 'topRight');
            addAnchor(group, ellipseX+radius.x, ellipseY+radius.y, 'bottomRight');
            addAnchor(group, ellipseX-radius.x, ellipseY+radius.y, 'bottomLeft');
        }
        // add group to layer
        shape.getLayer().add( group );
    }
    
    /**
     * Create shape editor controls, i.e. the anchors.
     * @method addAnchor
     * @param {Object} group The group associated with this anchor.
     * @param {Number} x The X position of the anchor.
     * @param {Number} y The Y position of the anchor.
     * @param {Number} id The id of the anchor.
     */
    function addAnchor(group, x, y, id) {
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
        // set anchor on
        setAnchorOn( anchor );
        // add the anchor to the group
        group.add(anchor);
    }
    
    /**
     * Get a simple clone of the input anchor.
     * @param {Object} anchor The anchor to clone.
     */
    function getClone( anchor ) {
        // create closure to properties
        var parent = anchor.getParent();
        var id = anchor.id();
        var x = anchor.x();
        var y = anchor.y();
        // create clone object
        var clone = {};
        clone.getParent = function () {
            return parent;
        };
        clone.id = function () {
            return id;
        };
        clone.x = function () {
            return x;
        };
        clone.y = function () {
            return y;
        };
        return clone;
    }
    
    /**
     * Set the anchor on listeners.
     * @param {Object} anchor The anchor to set on.
     */
    function setAnchorOn( anchor ) {
        var startAnchor = null;
        // drag start listener
        anchor.on('dragstart', function () {
            startAnchor = getClone(this);
        });
        // drag move listener
        anchor.on('dragmove', function () {
            if ( updateFunction ) {
                updateFunction(shape, this);
            }
            if ( this.getLayer() ) {
                this.getLayer().draw();
            }
            else {
                console.warn("No layer to draw the anchor!");
            }
        });
        // drag end listener
        anchor.on('dragend', function () {
            var endAnchor = getClone(this);
            // store the change command
            var chgcmd = new dwv.tool.ChangeShapeCommand(
                    shape, "shape", updateFunction, startAnchor, endAnchor, app);
            chgcmd.execute();
            app.getUndoStack().add(chgcmd);
            // reset start anchor
            startAnchor = endAnchor;
        });
        // mouse down listener
        anchor.on('mousedown touchstart', function () {
            this.moveToTop();
        });
        // mouse over styling
        anchor.on('mouseover', function () {
            document.body.style.cursor = 'pointer';
            this.stroke('#ddd');
            if ( this.getLayer() ) {
                this.getLayer().draw();
            }
            else {
                console.warn("No layer to draw the anchor!");
            }
        });
        // mouse out styling
        anchor.on('mouseout', function () {
            document.body.style.cursor = 'default';
            this.stroke('#999');
            if ( this.getLayer() ) {
                this.getLayer().draw();
            }
            else {
                console.warn("No layer to draw the anchor!");
            }
        });
    }
    
    /**
     * Set the anchor off listeners.
     * @param {Object} anchor The anchor to set off.
     */
    function setAnchorOff( anchor ) {
        anchor.off('dragstart');
        anchor.off('dragmove');
        anchor.off('dragend');
        anchor.off('mousedown touchstart');
        anchor.off('mouseover');
        anchor.off('mouseout');
    }
};
