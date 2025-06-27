import {Point2D} from '../math/point.js';

// doc imports
/* eslint-disable no-unused-vars */
import {Scalar2D} from '../math/scalar.js';
import {Style} from '../gui/style.js';
// external
import Konva from 'konva';
/* eslint-enable no-unused-vars */

/**
 * List of default label texts.
 *
 * @type {Object.<string, Object.<string, string>>}
 */
export const defaultLabelTexts = {
  arrow: {
    '*': ''
  },
  circle: {
    '*': '{surface}'
  },
  ellipse: {
    '*': '{surface}'
  },
  protractor: {
    '*': '{angle}'
  },
  rectangle: {
    '*': '{surface}'
  },
  roi: {
    '*': ''
  },
  ruler: {
    '*': '{length}'
  }
};

/**
 * Is an input node's name 'label'.
 *
 * @param {Konva.Node} node A Konva node.
 * @returns {boolean} True if the node's name is 'label'.
 */
export function isNodeNameLabel(node) {
  return node.name() === 'label';
}

/**
 * Is an input node's name 'shape'.
 *
 * @param {Konva.Node} node A Konva node.
 * @returns {boolean} True if the node's name is 'shape'.
 */
export function isNodeNameShape(node) {
  return node.name() === 'shape';
}

/**
 * Is an input node a position node.
 *
 * @param {Konva.Node} node A Konva node.
 * @returns {boolean} True if the node's name is 'position-group'.
 */
export function isPositionNode(node) {
  return node.name() === 'position-group';
}

/**
 * Get a Konva.Line shape from a group.
 *
 * @param {Konva.Group} group The group to look into.
 * @returns {Konva.Line|undefined} The shape.
 */
export function getLineShape(group) {
  const kshape = group.getChildren(isNodeNameShape)[0];
  if (!(kshape instanceof Konva.Line)) {
    return;
  }
  return kshape;
}

/**
 * Get a Konva.Ellipse anchor shape from a group.
 *
 * @param {Konva.Group} group The group to look into.
 * @param {number} index The anchor index.
 * @returns {Konva.Ellipse|undefined} The anchor shape.
 */
export function getAnchorShape(group, index) {
  const kshape = group.getChildren(function (node) {
    return node.id() === 'anchor' + index;
  })[0];
  if (!(kshape instanceof Konva.Ellipse)) {
    return;
  }
  return kshape;
}

/**
 * @callback testFn
 * @param {Konva.Node} node The node.
 * @returns {boolean} True if the node passes the test.
 */

/**
 * Get a lambda to check a node's id.
 *
 * @param {string} id The id to check.
 * @returns {testFn} A function to check a node's id.
 */
export function isNodeWithId(id) {
  return function (node) {
    return node.id() === id;
  };
}

/**
 * Draw Debug flag.
 */
export const DRAW_DEBUG = false;

/**
 * Get the default anchor shape.
 *
 * @param {number} x The X position.
 * @param {number} y The Y position.
 * @param {string} id The shape id.
 * @param {Style} style The application style.
 * @returns {Konva.Ellipse} The default anchor shape.
 */
export function getDefaultAnchor(x, y, id, style) {
  const radius = style.applyZoomScale(6);
  const absRadius = {
    x: Math.abs(radius.x),
    y: Math.abs(radius.y)
  };
  return new Konva.Ellipse({
    x: x,
    y: y,
    stroke: '#999',
    fill: 'rgba(100,100,100,0.7',
    strokeWidth: style.getStrokeWidth(),
    strokeScaleEnabled: false,
    radius: absRadius,
    radiusX: absRadius.x,
    radiusY: absRadius.y,
    name: 'anchor',
    id: id.toString(),
    dragOnTop: false,
    draggable: true,
    visible: false
  });
}

/**
 * Get an anchor index from its id.
 *
 * @param {string} id The anchor id as 'anchor#'.
 * @returns {number} The anchor index.
 */
export function getAnchorIndex(id) {
  // 'anchor'.length = 6
  return parseInt(id.substring(6), 10);
}

/**
 * Bound a node position.
 *
 * @param {Konva.Node} node The node to bound the position.
 * @param {Point2D} min The minimum position.
 * @param {Point2D} max The maximum position.
 * @returns {boolean} True if the position was corrected.
 */
function boundNodePosition(node, min, max) {
  let changed = false;
  if (node.x() < min.getX()) {
    node.x(min.getX());
    changed = true;
  } else if (node.x() > max.getX()) {
    node.x(max.getX());
    changed = true;
  }
  if (node.y() < min.getY()) {
    node.y(min.getY());
    changed = true;
  } else if (node.y() > max.getY()) {
    node.y(max.getY());
    changed = true;
  }
  return changed;
}

/**
 * Get a shape top left position range.
 *
 * @param {Scalar2D} stageSize The stage size as {x,y}.
 * @param {Konva.Shape} shape The shape to evaluate.
 * @returns {object} The range as {min, max}.
 */
export function getShapePositionRange(stageSize, shape) {
  const min = new Point2D(0, 0);
  const max = new Point2D(
    stageSize.x - Math.abs(shape.width()),
    stageSize.y - Math.abs(shape.height())
  );

  return {min: min, max: max};
}

/**
 * Is an input shape top left position in the input range.
 *
 * @param {Konva.Shape} shape The shape to evaluate.
 * @param {Point2D} min The minimum top left position.
 * @param {Point2D} max The maximum top left position.
 * @returns {boolean} True if in range.
 */
export function isShapeInRange(shape, min, max) {
  // use client rect to get the shape's top left position
  const boundRect = shape.getClientRect({relativeTo: shape.getParent()});
  return boundRect.x > min.getX() &&
    boundRect.x < max.getX() &&
    boundRect.y > min.getY() &&
    boundRect.y < max.getY();
}

/**
 * Validate an anchor position.
 *
 * @param {Scalar2D} stageSize The stage size {x,y}.
 * @param {Konva.Shape} anchor The anchor to evaluate.
 * @returns {boolean} True if the position was corrected.
 */
export function validateAnchorPosition(stageSize, anchor) {
  const group = anchor.getParent();

  const min = new Point2D(
    -group.x(),
    -group.y()
  );
  const max = new Point2D(
    stageSize.x - group.x(),
    stageSize.y - group.y()
  );

  return boundNodePosition(anchor, min, max);
}
