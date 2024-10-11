import {Point2D} from '../math/point';

// doc imports
/* eslint-disable no-unused-vars */
import {Scalar2D} from '../math/scalar';
import {Style} from '../gui/style';
// external
import Konva from 'konva';
/* eslint-enable no-unused-vars */

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
 * Get the minimum position in a groups' anchors.
 *
 * @param {Konva.Group} group The group that contains anchors.
 * @returns {Point2D|undefined} The minimum position.
 */
function getAnchorMin(group) {
  const anchors = group.find('.anchor');
  if (anchors.length === 0) {
    return undefined;
  }
  let minX = anchors[0].x();
  let minY = anchors[0].y();
  for (let i = 0; i < anchors.length; ++i) {
    minX = Math.min(minX, anchors[i].x());
    minY = Math.min(minY, anchors[i].y());
  }

  return new Point2D(minX, minY);
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
 * Validate a group position.
 *
 * @param {Scalar2D} stageSize The stage size {x,y}.
 * @param {Konva.Group} group The group to evaluate.
 * @returns {boolean} True if the position was corrected.
 */
export function validateGroupPosition(stageSize, group) {
  // if anchors get mixed, width/height can be negative
  const shape = group.getChildren(isNodeNameShape)[0];
  const anchorMin = getAnchorMin(group);
  // handle no anchor: when dragging the label, the editor does
  //   not activate
  if (typeof anchorMin === 'undefined') {
    return null;
  }

  const min = new Point2D(
    -anchorMin.getX(),
    -anchorMin.getY()
  );
  const max = new Point2D(
    stageSize.x - (anchorMin.getX() + Math.abs(shape.width())),
    stageSize.y - (anchorMin.getY() + Math.abs(shape.height()))
  );

  return boundNodePosition(group, min, max);
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
