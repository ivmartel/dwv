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
     * Set anchors visibility.
     * @method setAnchorsVisible
     * @param {Boolean} flag The visible flag.
     */
    function setAnchorsVisible( flag ) {
        if ( shape && shape.getParent() ) {
            var anchors = shape.getParent().find('.anchor');
            anchors.each( function (anchor) {
                anchor.visible( flag );
            });
        }
    }

    /**
     * Remove anchors.
     * @method removeAnchors
     */
    function removeAnchors() {
        if ( shape && shape.getParent() ) {
            var anchors = shape.getParent().find('.anchor');
            anchors.each( function (anchor) {
                anchor.remove();
            });
        }
    }
    
    /**
     * Add the shape anchors.
     * @method addAnchors
     */
    function addAnchors() {
        // exit if no shape
        if ( !shape ) {
            return;
        }
        // get shape group
        var group = shape.getParent();
        // add shape specific anchors to the shape group
        if ( shape instanceof Kinetic.Line ) {
            var points = shape.points();
            if ( points.length === 4 ) {
                var lineBeginX = points[0] + shape.x();
                var lineBeginY = points[1] + shape.y();
                var lineEndX = points[2] + shape.x();
                var lineEndY = points[3] + shape.y();
                addAnchor(group, lineBeginX, lineBeginY, 'begin', dwv.tool.UpdateLine);
                addAnchor(group, lineEndX, lineEndY, 'end', dwv.tool.UpdateLine);
            }
            else {
                addAnchor(group, points[0], points[1], 0, dwv.tool.UpdateRoi);
                for ( var i = 0; i < points.length; i=i+2 ) {
                    addAnchor(group, points[i], points[i+1], i, dwv.tool.UpdateRoi);
                }
            }
        }
        else if ( shape instanceof Kinetic.Rect ) {
            var rectX = shape.x();
            var rectY = shape.y();
            var rectWidth = shape.width();
            var rectHeight = shape.height();
            addAnchor(group, rectX, rectY, 'topLeft', dwv.tool.UpdateRect);
            addAnchor(group, rectX+rectWidth, rectY, 'topRight', dwv.tool.UpdateRect);
            addAnchor(group, rectX+rectWidth, rectY+rectHeight, 'bottomRight', dwv.tool.UpdateRect);
            addAnchor(group, rectX, rectY+rectHeight, 'bottomLeft', dwv.tool.UpdateRect);
        }
        else if ( shape instanceof Kinetic.Ellipse ) {
            var ellipseX = shape.x();
            var ellipseY = shape.y();
            var radius = shape.radius();
            addAnchor(group, ellipseX-radius.x, ellipseY-radius.y, 'topLeft', dwv.tool.UpdateEllipse);
            addAnchor(group, ellipseX+radius.x, ellipseY-radius.y, 'topRight', dwv.tool.UpdateEllipse);
            addAnchor(group, ellipseX+radius.x, ellipseY+radius.y, 'bottomRight', dwv.tool.UpdateEllipse);
            addAnchor(group, ellipseX-radius.x, ellipseY+radius.y, 'bottomLeft', dwv.tool.UpdateEllipse);
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
     * @param {Object} updateMethod The method used to update the associated shape.
     */
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
        // drag move listener
        anchor.on('dragmove', function () {
            updateMethod(shape, this);
            this.getLayer().draw();
        });
        // mouse down listener
        anchor.on('mousedown touchstart', function () {
            this.moveToTop();
        });
        // mouse over styling
        anchor.on('mouseover', function () {
            document.body.style.cursor = 'pointer';
            this.stroke('#ddd');
            this.getLayer().draw();
        });
        // mouse out styling
        anchor.on('mouseout', function () {
            document.body.style.cursor = 'default';
            this.stroke('#999');
            this.getLayer().draw();
        });
        // add the anchor to the group
        group.add(anchor);
    }
};
