// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
//external
var Kinetic = Kinetic || {};

/**
 * FreeHand factory.
 * @constructor
 */
dwv.tool.Spline = function (app)
{
    console.log(app.getElement())
    self = this;

    /**
     * Created group
     * @type {Array}
     */
    var shapeGroup = null;

    /**
     * Event listeners.
     * @private
     */
    var listeners = [];

    /**
     * Drawing style.
     * @type Style
     */
    this.style = new dwv.html.Style();

    var getShapeEditor = function(){
        return app.getShapeEditor();
    }

    /**
     * Get (x, y) coordinates referenced to the canvas
     * @param {Object} event The original event.
     */
    var getCoord = function(event){
        return { x: event._x, y: event._y };
    };

    /**
     * Create editable point
     * @param  {Object} event Doom event
     * @return {Anchor}       Kinectic object
     */
    var createAnchor = function (group, coord) {
        // anchor shape
        var anchor = new Kinetic.Circle({
            x: coord.x,
            y: coord.y,
            // stroke: '#999',
            fillRed: 100,
            fillBlue: 100,
            fillGreen: 100,
            fillAlpha: 0.7,
            // strokeWidth: app.getStyle().getScaledStrokeWidth(),
            radius: app.getStyle().scale(10) / app.getScale(),
            name: 'anchor',
            // id: id,
            // listening: true,
            dragOnTop: false,
            draggable: true,
            visible: true
        });
        // console.log('listen', anchor.isListening())
        // anchor.on('mousedown touchstart mouseover', function(evt) {
        //     // evt.preventDefault();
        //     console.log(evt)
        // })
        // .on('xChange', function(evt) {
        //     evt.preventDefault();
        //     console.log(evt)
        // });
        // set anchor on
        // setAnchorOn( anchor );
        // getShapeEditor().setAnchorsActive(true)
        // add the anchor to the group
        group.add(anchor);
        // app.getDrawer().setShapeOn(anchor)
    }

    var removeAnchor = function(anchor){
        anchor.remove();
    }

    var endsCreation = function(){
        shapeGroup = null;

        getShapeEditor().disable();

        command.onExecute = fireEvent;
        command.onUndo = fireEvent;

        // // save it in undo stack
        app.addToUndoStack(command);
    }

    var getCloser = function(point, points){
        // console.log(point, points)
        var d, i;
        var dist = 1000000;
        for(var p=0, pl=points.length; p<pl; p=p+2){
            d = Math.sqrt( Math.pow(point.x - points[p], 2) + Math.pow(point.y - points[p+1], 2));
            if(d < dist){
                i = p;
            }
        }
        console.log(i, i+2)
        return (i+2);
    }


    var layer;
    var line;
    var command;
    // var points;
    var dblclicked;

    this.dblclick = function(event){
        // console.log('dblclick', event)
        var newPoints = line.getPoints();
        if(newPoints.length > 2){
            dblclicked = true
            var point = getCoord(event);

            createAnchor(shapeGroup, point);
            newPoints.splice(getCloser(point, newPoints), 0, point.x, point.y);
            line.setPoints(newPoints);
            layer.draw();
            return
        }
    }

    /**
     * Handle mouse down event.
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        // console.log('click', event)
        
        var point = getCoord(event);

        if(event.which == 3){

            var newPoints = line.getPoints();

            // var anchor = shapeGroup.getChildren().filter(function(anchor){
            //     if(anchor.name() != 'anchor'){
            //         return false
            //     }
            //     var anchoranchor.getPoints() === )
            // });
            removeAnchor(anchor);

            newPoints.pop();
            newPoints.pop();
            line.setPoints(newPoints);
            layer.draw();
            return
        }


        setTimeout(function(){
            if(dblclicked){
                dblclicked = false
                return
            }
            if(shapeGroup){
                createAnchor(shapeGroup, point);

                var newPoints = line.getPoints().concat([point.x, point.y]);
                line.setPoints(newPoints);
                layer.draw();
            }
            else{
                // layer = app.getCurrentDrawLayer();
                // layer.listening(true);
                // layer.hitGraphEnabled(true);
                // layer.getParent().listening(true);
                // console.log(layer);
                // drawLayer.hitGraphEnabled(true);
                // app.getDrawStage().listening( true );

                // create shape
                var factory = new dwv.tool.RoiFactory();
                shapeGroup = factory.create( new dwv.math.Point2D(point.x, point.y), self.style);
                shapeGroup.id( dwv.math.guid() );
                // getShapeEditor().setShape(shapeGroup);
                
                // shapeGroup.on('mousedown', function(e){
                //     console.log(e, this)
                // });
                // shapeGroup.on('click', function(e){
                //     console.log(e, this)
                // });

                line = shapeGroup.getChildren().filter(function(children){
                    return children.getClassName() === 'Line'
                })[0];
                console.log(shapeGroup)
                line.setTension(0.5);

                // line.on('mousedown', function(e){
                //     console.log(e, this)
                // });
                // line.on('click', function(e){
                //     console.log(e, this)
                // });
                createAnchor(shapeGroup, point);
                // app.getDrawer().setShapeOn(line)

                // draw shape command
                command = new dwv.tool.DrawGroupCommand(shapeGroup, "Spline", layer);

                // // // draw
                command.execute();
            }
        }, 350)
    };

    /**
     * Handle mouse move event.
     * @param {Object} event The mouse move event.
     */
    this.mousemove = function(/*event*/){
        // Defaults do nothing
    };

    /**
     * Handle mouse up event.
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function(event){
        // return
        // console.error(event.which)
        // event.stopPropagation();
        // return event.preventDefault();
    };

    /**
     * Handle mouse out event.
     * @param {Object} event The mouse out event.
     */
    this.mouseout =  self.mouseup;

    /**
     * Handle touch start event.
     * @param {Object} event The touch start event.
     */
    this.touchstart = function(event){
        // treat as mouse down
        self.mousedown(event);
    };

    /**
     * Handle touch move event.
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        // treat as mouse move
        self.mousemove(event);
    };

    /**
     * Handle touch end event.
     * @param {Object} event The touch end event.
     */
    this.touchend = function(/*event*/){
        // treat as mouse up
        self.mouseup(/*event*/);
    };

    /**
     * Handle key down event.
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        app.onKeydown(event);
    };

    /**
     * Setup the tool GUI.
     */
    this.setup = function ()
    {
        gui = new dwv.gui.ColourTool(app, "ff");
        gui.setup();
    };

    /**
     * Enable the tool.
     * @param {Boolean} bool The flag to enable or not.
     */
    this.display = function(bool){
        console.log('display')
        if ( gui ) {
            gui.display(bool);
        }

        layer = app.getCurrentDrawLayer();
        // shapeEditor = getShapeEditor();

        // // reset shape display properties
        // shapeEditor.disable();
        // shapeEditor.setShape(null);
        // shapeEditor.setImage(null);
        // document.body.style.cursor = 'default';
        // // make layer listen or not to events
        // app.getDrawStage().listening( flag );
        // // get the current draw layer
        // drawLayer = app.getCurrentDrawLayer();
        // renderDrawLayer(flag);
        // TODO why twice?
        this.init();
    };
// layerContainer
    /**
     * Initialise the tool.
     */
    this.init = function()
    {
        console.log('init')
        if ( gui ) {
            // init with the app window scale
            this.style.setScale(app.getWindowScale());
            // set the default to the first in the list
            this.setLineColour(this.style.getLineColour());
            // init html
            gui.initialise();
        }
        // var layer = app.getElement('layerContainer');
        self.removeEventListener("contextmenu");
        self.removeEventListener("mouseup");
        // console.log(layer)
        return true;
    };

    /**
     * Add an event listener on the app.
     * @param {Object} listener The method associated with the provided event type.
     */
    this.addEventListener = function (listener)
    {
        // console.log(listener)
        listeners.push(listener);
    };

    /**
     * Remove an event listener from the app.
     * @param {Object} listener The method associated with the provided event type.
     */
    this.removeEventListener = function (listener)
    {
        // console.log(listener)
        for ( var i = 0; i < listeners.length; ++i )
        {
            if ( listeners[i] === listener ) {
                listeners.splice(i,1);
            }
        }
    };

    // Private Methods -----------------------------------------------------------

    /**
     * Fire an event: call all associated listeners.
     * @param {Object} event The event to fire.
     */
    function fireEvent (event)
    {
        console.log(event)
        for ( var i=0; i < listeners.length; ++i )
        {
            console.log(listeners)
            listeners[i](event);
        }
    }

}; // Floodfill class

/**
 * Help for this tool.
 * @return {Object} The help content.
 */
dwv.tool.Spline.prototype.getHelp = function()
{
    return {
        'title': dwv.i18n("tool.Floodfill.name"),
        'brief': dwv.i18n("tool.Floodfill.brief"),
        "mouse": {
            "click": dwv.i18n("tool.Floodfill.click")
        },
        "touch": {
            "tap": dwv.i18n("tool.Floodfill.tap")
        }
    };
};

/**
 * Set the line colour of the drawing.
 * @param {String} colour The colour to set.
 */
dwv.tool.Spline.prototype.setLineColour = function(colour)
{
    // set style var
    this.style.setLineColour(colour);
};
