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
    // 
    var shape = null;
    var isActive = false;
    
    /**
     * Set the shape to edit.
     * @method setShape
     * param {Object} inshape The shape to edit.
     */
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
     * Enable the editor.
     * @method enable
     */
    this.enable = function () {
        isActive = true;
        var anchors = shape.getLayer().find('.anchor');
        anchors.each( function (anchor) {
            anchor.visible(true);
        });
        shape.getLayer().draw();
    };
    
    /**
     * Disable the editor.
     * @method disable
     */
    this.disable = function () {
        isActive = false;
        var anchors = shape.getLayer().find('.anchor');
        anchors.each( function (anchor) {
            anchor.visible(false);
        });
        shape.getLayer().draw();
        shape = null;
    };
    
    /**
     * Create shape editor controls, i.e. the anchors.
     * @method createControls
     * @param {Object} inshape The shape to edit.
     */
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
        // dragmove listener
        anchor.on('dragmove', function () {
            updateMethod(shape, this);
            this.getLayer().draw();
        });
        // mousedown listener
        anchor.on('mousedown touchstart', function () {
            this.moveToTop();
        });
        // dragend listener
        anchor.on('dragend', function () {
            this.getLayer().draw();
        });
        // hover styling
        anchor.on('mouseover', function () {
            document.body.style.cursor = 'pointer';
            this.stroke('#ddd');
            this.getLayer().draw();
        });
        // not hover styling
        anchor.on('mouseout', function () {
            document.body.style.cursor = 'default';
            this.stroke('#999');
            this.getLayer().draw();
        });
        // add the anchor to the group
        group.add(anchor);
    }
};
