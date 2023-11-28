import {Style} from '../gui/style';
import {
  getMousePoint,
  getTouchPoints
} from '../gui/generic';
import {Point2D} from '../math/point';
import {Path} from '../math/path';
import {Scissors} from '../math/scissors';
import {guid} from '../math/stats';
import {getLayerDetailsFromEvent} from '../gui/layerGroup';
import {ListenerHandler} from '../utils/listen';
import {RoiFactory} from '../tools/roi';
import {DrawGroupCommand} from '../tools/drawCommands';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application';
/* eslint-enable no-unused-vars */

/**
 * Livewire painting tool.
 */
export class Livewire {
  /**
   * Associated app.
   *
   * @type {App}
   */
  #app;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
  }

  /**
   * Interaction start flag.
   *
   * @type {boolean}
   */
  #started = false;

  /**
   * Start point.
   *
   * @type {Point2D}
   */
  #startPoint;

  /**
   * Draw command.
   *
   * @type {object}
   */
  #command = null;

  /**
   * Current shape group.
   *
   * @type {object}
   */
  #shapeGroup = null;

  /**
   * Drawing style.
   *
   * @type {Style}
   */
  #style = new Style();

  /**
   * Path storage. Paths are stored in reverse order.
   *
   * @type {Path}
   */
  #path = new Path();

  /**
   * Current path storage. Paths are stored in reverse order.
   *
   * @type {Path}
   */
  #currentPath = new Path();

  /**
   * List of parent points.
   *
   * @type {Array}
   */
  #parentPoints = [];

  /**
   * Tolerance.
   *
   * @type {number}
   */
  #tolerance = 5;

  /**
   * Listener handler.
   *
   * @type {ListenerHandler}
   */
  #listenerHandler = new ListenerHandler();

  /**
   * Clear the parent points list.
   *
   * @param {object} imageSize The image size.
   */
  #clearParentPoints(imageSize) {
    const nrows = imageSize.get(1);
    for (let i = 0; i < nrows; ++i) {
      this.#parentPoints[i] = [];
    }
  }

  /**
   * Clear the stored paths.
   */
  #clearPaths() {
    this.#path = new Path();
    this.#currentPath = new Path();
  }

  /**
   * Scissor representation.
   *
   * @type {Scissors}
   */
  #scissors = new Scissors();

  /**
   * Start tool interaction.
   *
   * @param {Point2D} point The start point.
   * @param {string} divId The layer group divId.
   */
  #start(point, divId) {
    const layerGroup = this.#app.getLayerGroupByDivId(divId);
    const viewLayer = layerGroup.getActiveViewLayer();
    const imageSize = viewLayer.getViewController().getImageSize();
    const index = viewLayer.displayToPlaneIndex(point);

    // first time
    if (!this.#started) {
      this.#started = true;
      this.#startPoint = new Point2D(index.get(0), index.get(1));
      // clear vars
      this.#clearPaths();
      this.#clearParentPoints(imageSize);
      this.#shapeGroup = null;
      // update zoom scale
      const drawLayer = layerGroup.getActiveDrawLayer();
      this.#style.setZoomScale(
        drawLayer.getKonvaLayer().getAbsoluteScale());
      // do the training from the first point
      const p = {x: index.get(0), y: index.get(1)};
      this.#scissors.doTraining(p);
      // add the initial point to the path
      const p0 = new Point2D(index.get(0), index.get(1));
      this.#path.addPoint(p0);
      this.#path.addControlPoint(p0);
    } else {
      const diffX = Math.abs(index.get(0) - this.#startPoint.getX());
      const diffY = Math.abs(index.get(1) - this.#startPoint.getY());
      // final point: at 'tolerance' of the initial point
      if (diffX < this.#tolerance &&
        diffY < this.#tolerance) {
        // finish
        this.#finishShape();
      } else {
        // anchor point
        this.#path = this.#currentPath;
        this.#clearParentPoints(imageSize);
        const pn = {x: index.get(0), y: index.get(1)};
        this.#scissors.doTraining(pn);
        this.#path.addControlPoint(this.#currentPath.getPoint(0));
      }
    }
  }

  /**
   * Update tool interaction.
   *
   * @param {Point2D} point The update point.
   * @param {string} divId The layer group divId.
   */
  #update(point, divId) {
    if (!this.#started) {
      return;
    }
    const layerGroup = this.#app.getLayerGroupByDivId(divId);
    const viewLayer = layerGroup.getActiveViewLayer();
    const index = viewLayer.displayToPlaneIndex(point);

    // set the point to find the path to
    let p = {x: index.get(0), y: index.get(1)};
    this.#scissors.setPoint(p);
    // do the work
    let results = [];
    let stop = false;
    while (!this.#parentPoints[p.y][p.x] && !stop) {
      results = this.#scissors.doWork();

      if (results.length === 0) {
        stop = true;
      } else {
        // fill parents
        for (let i = 0; i < results.length - 1; i += 2) {
          const _p = results[i];
          const _q = results[i + 1];
          this.#parentPoints[_p.y][_p.x] = _q;
        }
      }
    }

    // get the path
    this.#currentPath = new Path();
    stop = false;
    while (p && !stop) {
      this.#currentPath.addPoint(new Point2D(p.x, p.y));
      if (!this.#parentPoints[p.y]) {
        stop = true;
      } else {
        if (!this.#parentPoints[p.y][p.x]) {
          stop = true;
        } else {
          p = this.#parentPoints[p.y][p.x];
        }
      }
    }
    this.#currentPath.appenPath(this.#path);

    // remove previous draw
    if (this.#shapeGroup) {
      this.#shapeGroup.destroy();
    }
    // create shape
    const factory = new RoiFactory();
    this.#shapeGroup = factory.create(
      this.#currentPath.pointArray, this.#style);
    this.#shapeGroup.id(guid());

    const drawLayer = layerGroup.getActiveDrawLayer();
    const drawController = drawLayer.getDrawController();

    // get the position group
    const posGroup = drawController.getCurrentPosGroup();
    // add shape group to position group
    posGroup.add(this.#shapeGroup);

    // draw shape command
    this.#command = new DrawGroupCommand(
      this.#shapeGroup,
      'livewire',
      drawLayer
    );
    // draw
    this.#command.execute();
  }

  /**
   * Finish a livewire (roi) shape.
   */
  #finishShape() {
    // fire creation event (was not propagated during draw)
    this.#fireEvent({
      type: 'drawcreate',
      id: this.#shapeGroup.id()
    });
    // listen
    this.#command.onExecute = this.#fireEvent;
    this.#command.onUndo = this.#fireEvent;
    // save command in undo stack
    this.#app.addToUndoStack(this.#command);
    // set flag
    this.#started = false;
  }

  /**
   * Handle mouse down event.
   *
   * @param {object} event The mouse down event.
   */
  mousedown = (event) => {
    const mousePoint = getMousePoint(event);
    const layerDetails = getLayerDetailsFromEvent(event);
    this.#start(mousePoint, layerDetails.groupDivId);
  };

  /**
   * Handle mouse move event.
   *
   * @param {object} event The mouse move event.
   */
  mousemove = (event) => {
    const mousePoint = getMousePoint(event);
    const layerDetails = getLayerDetailsFromEvent(event);
    this.#update(mousePoint, layerDetails.groupDivId);
  };

  /**
   * Handle mouse up event.
   *
   * @param {object} _event The mouse up event.
   */
  mouseup(_event) {
    // nothing to do
  }

  /**
   * Handle mouse out event.
   *
   * @param {object} _event The mouse out event.
   */
  mouseout = (_event) => {
    // nothing to do
  };

  /**
   * Handle double click event.
   *
   * @param {object} _event The double click event.
   */
  dblclick = (_event) => {
    this.#finishShape();
  };

  /**
   * Handle touch start event.
   *
   * @param {object} event The touch start event.
   */
  touchstart = (event) => {
    const touchPoints = getTouchPoints(event);
    const layerDetails = getLayerDetailsFromEvent(event);
    this.#start(touchPoints[0], layerDetails.groupDivId);
  };

  /**
   * Handle touch move event.
   *
   * @param {object} event The touch move event.
   */
  touchmove = (event) => {
    const touchPoints = getTouchPoints(event);
    const layerDetails = getLayerDetailsFromEvent(event);
    this.#update(touchPoints[0], layerDetails.groupDivId);
  };

  /**
   * Handle touch end event.
   *
   * @param {object} _event The touch end event.
   */
  touchend = (_event) => {
    // nothing to do
  };

  /**
   * Handle key down event.
   *
   * @param {object} event The key down event.
   */
  keydown = (event) => {
    event.context = 'Livewire';
    this.#app.onKeydown(event);
  };

  /**
   * Activate the tool.
   *
   * @param {boolean} bool The flag to activate or not.
   */
  activate(bool) {
    // start scissors if displayed
    if (bool) {
      const layerGroup = this.#app.getActiveLayerGroup();
      const viewLayer = layerGroup.getActiveViewLayer();

      //scissors = new Scissors();
      const imageSize = viewLayer.getViewController().getImageSize();
      this.#scissors.setDimensions(
        imageSize.get(0),
        imageSize.get(1));
      this.#scissors.setData(viewLayer.getImageData().data);

      // init with the app window scale
      this.#style.setBaseScale(this.#app.getBaseScale());
      // set the default to the first in the list
      this.setFeatures({shapeColour: this.#style.getLineColour()});
    }
  }

  /**
   * Initialise the tool.
   */
  init() {
    // does nothing
  }

  /**
   * Get the list of event names that this tool can fire.
   *
   * @returns {Array} The list of event names.
   */
  getEventNames() {
    return ['drawcreate', 'drawchange', 'drawmove', 'drawdelete'];
  }

  /**
   * Add an event listener to this class.
   *
   * @param {string} type The event type.
   * @param {Function} callback The function associated with the provided
   *    event type, will be called with the fired event.
   */
  addEventListener(type, callback) {
    this.#listenerHandler.add(type, callback);
  }

  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {Function} callback The function associated with the provided
   *   event type.
   */
  removeEventListener(type, callback) {
    this.#listenerHandler.remove(type, callback);
  }

  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   */
  #fireEvent = (event) => {
    this.#listenerHandler.fireEvent(event);
  };

  /**
   * Set the tool live features: shape colour.
   *
   * @param {object} features The list of features.
   */
  setFeatures(features) {
    if (typeof features.shapeColour !== 'undefined') {
      this.#style.setLineColour(features.shapeColour);
    }
  }

} // Livewire class
