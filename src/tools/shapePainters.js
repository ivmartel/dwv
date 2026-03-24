import Konva from 'konva';
import {
  Line,
  getAngle,
  getPerpendicularLine,
  getPerpendicularLineAtDistance
} from '../math/line.js';
import {setLineHitFunc} from './lineHitFunc.js';
import {logger} from '../utils/logger.js';

// doc imports
/* eslint-disable no-unused-vars */
import {Style} from '../gui/style.js';
import {Annotation} from '../image/annotation.js';
/* eslint-enable no-unused-vars */

// ---------------------------------------------------------------------------
// Base class
// ---------------------------------------------------------------------------

/**
 * Base class for Konva shape entries.
 *
 * Provides default no-op implementations of `createExtras` and `updateExtras`
 * so that subclasses only override what they need.
 */
class KonvaShapePainter {

  /**
   * Create the main Konva shape node for an annotation.
   * Must be overridden by subclasses.
   *
   * @param {Annotation} _annotation The annotation.
   * @param {Style} _style The drawing style.
   * @returns {Konva.Shape} The created shape.
   */
  createShape(_annotation, _style) {
    throw new Error('KonvaShapePainter.createShape not implemented');
  }

  /**
   * Update the main Konva shape node in-place.
   * Must be overridden by subclasses.
   *
   * @param {Konva.Node} _node The existing Konva node.
   * @param {Annotation} _annotation The updated annotation.
   * @param {Style} _style The drawing style.
   */
  updateShape(_node, _annotation, _style) {
    throw new Error('KonvaShapePainter.updateShape not implemented');
  }

  /**
   * Create auxiliary Konva nodes (ticks, arrowhead, arc, …).
   * Default: no extras.
   *
   * @param {Annotation} _annotation The annotation.
   * @param {Style} _style The drawing style.
   * @returns {Konva.Shape[]} Empty array.
   */
  createExtras(_annotation, _style) {
    return [];
  }

  /**
   * Update auxiliary Konva nodes in-place.
   * Default: nothing to update.
   *
   * @param {Konva.Group} _group The shape group.
   * @param {Annotation} _annotation The updated annotation.
   * @param {Style} _style The drawing style.
   */
  updateExtras(_group, _annotation, _style) {
    // nothing
  }
}

// ---------------------------------------------------------------------------
// Concrete entries
// ---------------------------------------------------------------------------

/**
 * Konva entry for a rectangle annotation.
 */
class RectangleKonvaPainter extends KonvaShapePainter {

  /**
   * @param {Annotation} annotation The annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Rect} The Konva node.
   */
  createShape(annotation, style) {
    const r = annotation.mathShape;
    return new Konva.Rect({
      x: r.getBegin().getX(),
      y: r.getBegin().getY(),
      width: r.getWidth(),
      height: r.getHeight(),
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape'
    });
  }

  /**
   * @param {Konva.Rect} node The Konva node.
   * @param {Annotation} annotation The updated annotation.
   */
  updateShape(node, annotation) {
    const r = annotation.mathShape;
    node.position({x: r.getBegin().getX(), y: r.getBegin().getY()});
    node.size({width: r.getWidth(), height: r.getHeight()});
  }
}

/**
 * Konva entry for a circle annotation.
 */
class CircleKonvaPainter extends KonvaShapePainter {

  /**
   * @param {Annotation} annotation The annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Circle} The Konva node.
   */
  createShape(annotation, style) {
    const c = annotation.mathShape;
    return new Konva.Circle({
      x: c.getCenter().getX(),
      y: c.getCenter().getY(),
      radius: c.getRadius(),
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape'
    });
  }

  /**
   * @param {Konva.Circle} node The Konva node.
   * @param {Annotation} annotation The updated annotation.
   */
  updateShape(node, annotation) {
    node.radius(annotation.mathShape.getRadius());
  }
}

/**
 * Konva entry for an ellipse annotation.
 */
class EllipseKonvaPainter extends KonvaShapePainter {

  /**
   * @param {Annotation} annotation The annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Ellipse} The Konva node.
   */
  createShape(annotation, style) {
    const e = annotation.mathShape;
    const center = e.getCenter();
    const radius = {x: e.getA(), y: e.getB()};
    return new Konva.Ellipse({
      x: center.getX(),
      y: center.getY(),
      radius,
      radiusX: radius.x,
      radiusY: radius.y,
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape'
    });
  }

  /**
   * @param {Konva.Ellipse} node The Konva node.
   * @param {Annotation} annotation The updated annotation.
   */
  updateShape(node, annotation) {
    const e = annotation.mathShape;
    node.radius({x: e.getA(), y: e.getB()});
  }
}

/**
 * Konva entry for a ruler annotation (line + end ticks).
 */
class RulerKonvaPainter extends KonvaShapePainter {

  /**
   * @param {Annotation} annotation The annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Line} The Konva node.
   */
  createShape(annotation, style) {
    const line = annotation.mathShape;
    const kshape = new Konva.Line({
      points: [
        line.getBegin().getX(),
        line.getBegin().getY(),
        line.getEnd().getX(),
        line.getEnd().getY()
      ],
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape'
    });
    setLineHitFunc(kshape, line, style.getZoomScale());
    return kshape;
  }

  /**
   * @param {Konva.Line} node The Konva node.
   * @param {Annotation} annotation The updated annotation.
   * @param {Style} style The drawing style.
   */
  updateShape(node, annotation, style) {
    const line = annotation.mathShape;
    node.position({x: 0, y: 0});
    node.points([
      line.getBegin().getX(),
      line.getBegin().getY(),
      line.getEnd().getX(),
      line.getEnd().getY()
    ]);
    setLineHitFunc(node, line, style.getZoomScale());
  }

  /**
   * @param {Annotation} annotation The annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Shape[]} The tick lines at begin and end.
   */
  createExtras(annotation, style) {
    const line = annotation.mathShape;
    const tickLen = 20;
    const zoom = style.getZoomScale();
    const perp0 = getPerpendicularLine(line, line.getBegin(), tickLen, zoom);
    const perp1 = getPerpendicularLine(line, line.getEnd(), tickLen, zoom);
    return [
      new Konva.Line({
        points: [
          perp0.getBegin().getX(),
          perp0.getBegin().getY(),
          perp0.getEnd().getX(),
          perp0.getEnd().getY()
        ],
        stroke: annotation.colour,
        strokeWidth: style.getStrokeWidth(),
        strokeScaleEnabled: false,
        name: 'shape-tick0'
      }),
      new Konva.Line({
        points: [
          perp1.getBegin().getX(),
          perp1.getBegin().getY(),
          perp1.getEnd().getX(),
          perp1.getEnd().getY()
        ],
        stroke: annotation.colour,
        strokeWidth: style.getStrokeWidth(),
        strokeScaleEnabled: false,
        name: 'shape-tick1'
      })
    ];
  }

  /**
   * @param {Konva.Group} group The shape group.
   * @param {Annotation} annotation The updated annotation.
   * @param {Style} style The drawing style.
   */
  updateExtras(group, annotation, style) {
    const line = annotation.mathShape;
    const tickLen = 20;
    const zoom = style.getZoomScale();
    const perp0 = getPerpendicularLine(line, line.getBegin(), tickLen, zoom);
    const perp1 = getPerpendicularLine(line, line.getEnd(), tickLen, zoom);
    const ktick0 = group.getChildren((n) => n.name() === 'shape-tick0')[0];
    const ktick1 = group.getChildren((n) => n.name() === 'shape-tick1')[0];
    if (ktick0 instanceof Konva.Line) {
      ktick0.position({x: 0, y: 0});
      ktick0.points([
        perp0.getBegin().getX(),
        perp0.getBegin().getY(),
        perp0.getEnd().getX(),
        perp0.getEnd().getY()
      ]);
    }
    if (ktick1 instanceof Konva.Line) {
      ktick1.position({x: 0, y: 0});
      ktick1.points([
        perp1.getBegin().getX(),
        perp1.getBegin().getY(),
        perp1.getEnd().getX(),
        perp1.getEnd().getY()
      ]);
    }
  }
}

/**
 * Konva entry for an arrow annotation (line + filled arrowhead).
 */
class ArrowKonvaPainter extends KonvaShapePainter {

  /**
   * @param {Annotation} annotation The annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Line} The Konva node.
   */
  createShape(annotation, style) {
    const tip = annotation.mathShape;
    const tail = annotation.referencePoints[0];
    const line = new Line(tip, tail);
    const kshape = new Konva.Line({
      points: [
        tip.getX(),
        tip.getY(),
        tail.getX(),
        tail.getY()
      ],
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape'
    });
    setLineHitFunc(kshape, line, style.getZoomScale());
    return kshape;
  }

  /**
   * @param {Konva.Line} node The Konva node.
   * @param {Annotation} annotation The updated annotation.
   * @param {Style} style The drawing style.
   */
  updateShape(node, annotation, style) {
    const tip = annotation.mathShape;
    const tail = annotation.referencePoints[0];
    const line = new Line(tip, tail);
    node.position({x: 0, y: 0});
    node.points([
      tip.getX(),
      tip.getY(),
      tail.getX(),
      tail.getY()
    ]);
    setLineHitFunc(node, line, style.getZoomScale());
  }

  /**
   * @param {Annotation} annotation The annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Shape[]} The arrowhead triangle.
   */
  createExtras(annotation, style) {
    const tip = annotation.mathShape;
    const tail = annotation.referencePoints[0];
    const line = new Line(tip, tail);
    const tickLen = 20;
    const perpLine = getPerpendicularLineAtDistance(
      line, 2 * tickLen, tickLen, style.getZoomScale());
    return [
      new Konva.Line({
        points: [
          tip.getX(),
          tip.getY(),
          perpLine.getBegin().getX(),
          perpLine.getBegin().getY(),
          perpLine.getEnd().getX(),
          perpLine.getEnd().getY()
        ],
        fill: annotation.colour,
        strokeWidth: style.getStrokeWidth(),
        strokeScaleEnabled: false,
        closed: true,
        name: 'shape-triangle'
      })
    ];
  }

  /**
   * @param {Konva.Group} group The shape group.
   * @param {Annotation} annotation The updated annotation.
   * @param {Style} style The drawing style.
   */
  updateExtras(group, annotation, style) {
    const tip = annotation.mathShape;
    const tail = annotation.referencePoints[0];
    const line = new Line(tip, tail);
    const tickLen = 20;
    const perpLine = getPerpendicularLineAtDistance(
      line, 2 * tickLen, tickLen, style.getZoomScale());
    const ktriangle = group.getChildren(
      (n) => n.name() === 'shape-triangle')[0];
    if (ktriangle instanceof Konva.Line) {
      ktriangle.position({x: 0, y: 0});
      ktriangle.points([
        tip.getX(),
        tip.getY(),
        perpLine.getBegin().getX(),
        perpLine.getBegin().getY(),
        perpLine.getEnd().getX(),
        perpLine.getEnd().getY()
      ]);
    }
  }
}

/**
 * Konva entry for an ROI (region of interest) annotation.
 */
class RoiKonvaPainter extends KonvaShapePainter {

  /**
   * @param {Annotation} annotation The annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Line} The Konva node.
   */
  createShape(annotation, style) {
    const roi = annotation.mathShape;
    const pts = [];
    for (let i = 0; i < roi.getLength(); ++i) {
      pts.push(roi.getPoint(i).getX(), roi.getPoint(i).getY());
    }
    return new Konva.Line({
      points: pts,
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      closed: true,
      name: 'shape'
    });
  }

  /**
   * @param {Konva.Line} node The Konva node.
   * @param {Annotation} annotation The updated annotation.
   */
  updateShape(node, annotation) {
    const roi = annotation.mathShape;
    const pts = [];
    // force Line position to 0 to store position with points
    node.position({x: 0, y: 0});
    // update points
    for (let i = 0; i < roi.getLength(); ++i) {
      pts.push(roi.getPoint(i).getX(), roi.getPoint(i).getY());
    }
    node.points(pts);
  }
}

/**
 * Konva entry for a protractor annotation (two-segment angle + arc).
 */
class ProtractorKonvaPainter extends KonvaShapePainter {

  /**
   * @param {Annotation} annotation The annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Line} The Konva node.
   */
  createShape(annotation, style) {
    const protractor = annotation.mathShape;
    const pts = [];
    for (let i = 0; i < protractor.getLength(); ++i) {
      pts.push(protractor.getPoint(i).getX(), protractor.getPoint(i).getY());
    }
    const kshape = new Konva.Line({
      points: pts,
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape'
    });
    if (protractor.getLength() === 3) {
      applyProtractorHitFunc(kshape, protractor);
    }
    return kshape;
  }

  /**
   * @param {Konva.Line} node The Konva node.
   * @param {Annotation} annotation The updated annotation.
   */
  updateShape(node, annotation) {
    const protractor = annotation.mathShape;
    node.position({x: 0, y: 0});
    node.points([
      protractor.getPoint(0).getX(),
      protractor.getPoint(0).getY(),
      protractor.getPoint(1).getX(),
      protractor.getPoint(1).getY(),
      protractor.getPoint(2).getX(),
      protractor.getPoint(2).getY()
    ]);
    applyProtractorHitFunc(node, protractor);
  }

  /**
   * Creates the arc indicating the angle (only when complete).
   *
   * @param {Annotation} annotation The annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Shape[]} The arc node (or empty when incomplete).
   */
  createExtras(annotation, style) {
    const protractor = annotation.mathShape;
    if (protractor.getLength() !== 3) {
      return [];
    }
    return [buildProtractorArc(protractor, annotation.colour, style)];
  }

  /**
   * @param {Konva.Group} group The shape group.
   * @param {Annotation} annotation The updated annotation.
   * @param {Style} _style The drawing style (unused).
   */
  updateExtras(group, annotation, _style) {
    const protractor = annotation.mathShape;
    if (protractor.getLength() !== 3) {
      return;
    }
    const karc = group.getChildren((n) => n.name() === 'shape-arc')[0];
    if (!(karc instanceof Konva.Arc)) {
      return;
    }
    const {radius, angle, inclination} = protractorArcParams(protractor);
    const mid = protractor.getPoint(1);
    karc.innerRadius(radius);
    karc.outerRadius(radius);
    karc.angle(angle);
    karc.rotation(-inclination);
    karc.position({x: mid.getX(), y: mid.getY()});
  }
}

// ---------------------------------------------------------------------------
// Protractor helpers
// ---------------------------------------------------------------------------

/**
 * Compute the arc parameters for a complete protractor.
 *
 * @param {object} protractor The Protractor math shape.
 * @returns {{radius: number, angle: number, inclination: number}} Params.
 */
function protractorArcParams(protractor) {
  const line0 = new Line(protractor.getPoint(0), protractor.getPoint(1));
  const line1 = new Line(protractor.getPoint(1), protractor.getPoint(2));
  let angle = getAngle(line0, line1);
  let inclination = line0.getInclination();
  if (angle > 180) {
    angle = 360 - angle;
    inclination += angle;
  }
  const radius =
    Math.min(line0.getLength(), line1.getLength()) * 33 / 100;
  return {radius, angle, inclination};
}

/**
 * Build the arc Konva node for a protractor.
 *
 * @param {object} protractor The Protractor math shape.
 * @param {string} colour The stroke colour.
 * @param {Style} style The drawing style.
 * @returns {Konva.Arc} The arc node.
 */
function buildProtractorArc(protractor, colour, style) {
  const {radius, angle, inclination} = protractorArcParams(protractor);
  const mid = protractor.getPoint(1);
  return new Konva.Arc({
    innerRadius: radius,
    outerRadius: radius,
    stroke: colour,
    strokeWidth: style.getStrokeWidth(),
    strokeScaleEnabled: false,
    angle,
    rotation: -inclination,
    x: mid.getX(),
    y: mid.getY(),
    name: 'shape-arc'
  });
}

/**
 * Apply the triangle hit area to the protractor's Konva.Line shape.
 *
 * @param {Konva.Line} kshape The Konva line node.
 * @param {object} protractor The Protractor math shape.
 */
function applyProtractorHitFunc(kshape, protractor) {
  kshape.hitFunc(function (context) {
    context.beginPath();
    context.moveTo(
      protractor.getPoint(0).getX(), protractor.getPoint(0).getY());
    context.lineTo(
      protractor.getPoint(1).getX(), protractor.getPoint(1).getY());
    context.lineTo(
      protractor.getPoint(2).getX(), protractor.getPoint(2).getY());
    context.closePath();
    context.fillStrokeShape(kshape);
  });
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

/**
 * Registry mapping annotator names to their Konva rendering entry.
 *
 * @type {Object.<string, KonvaShapePainter>}
 */
const MAP = {
  rectangle: new RectangleKonvaPainter(),
  circle: new CircleKonvaPainter(),
  ellipse: new EllipseKonvaPainter(),
  ruler: new RulerKonvaPainter(),
  arrow: new ArrowKonvaPainter(),
  roi: new RoiKonvaPainter(),
  protractor: new ProtractorKonvaPainter()
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get the Konva shape entry for a factory name.
 *
 * @param {string} name The factory / annotator name.
 * @returns {KonvaShapePainter} The entry.
 */
export function getPainter(name) {
  const entry = MAP[name];
  if (!entry) {
    logger.error(`shapePainters: no painter for shape '${name}'`);
  }
  return entry;
}
