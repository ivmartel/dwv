import Konva from 'konva';
import {BidimensionalLine} from '../math/bidimensionalLine.js';
import {getPerpendicularLine} from '../math/line.js';
import {Point2D} from '../math/point.js';
import {LabelFactory} from './labelFactory.js';
import {
  getDefaultAnchor,
  getAnchorShape,
  defaultLabelTexts,
} from './drawBounds.js';
import {custom} from '../app/custom.js';
// doc imports
/* eslint-disable no-unused-vars */
import {Style} from '../gui/style.js';
import {Annotation} from '../image/annotation.js';

/**
 * Bidimensional (long/short axis) annotation factory.
 */
export class BidimensionalFactory {
  /**
   * The name of the factory.
   * @type {string}
   */
  #name = 'bidimensional';

  /**
   * The associated label factory.
   * @type {LabelFactory}
   */
  #labelFactory = new LabelFactory(this.#getDefaultLabelPosition);

  /**
   * Does this factory support the input math shape.
   * @param {object} mathShape The mathematical shape.
   * @returns {boolean} True if supported.
   */
  static supports(mathShape) {
    return mathShape instanceof BidimensionalLine;
  }

  /**
   * Get the name of the factory.
   * @returns {string} The name.
   */
  getName() {
    return this.#name;
  }

  /**
   * Get the name of the shape group.
   * @returns {string} The name.
   */
  getGroupName() {
    return this.#name + '-group';
  }

  /**
   * Get the number of points needed to build the shape.
   * @returns {number} The number of points.
   */
  getNPoints() {
    return 2;
  }

  /**
   * Get the timeout between point storage.
   * @returns {number} The timeout in milliseconds.
   */
  getTimeout() {
    return 0;
  }

  /**
   * Get the default label template for the annotation.
   * Returns the draft label if the short axis is not yet set.
   * @param {Annotation} annotation The annotation.
   * @returns {object} The label template object.
   */
  #getDefaultLabel(annotation) {
    if (
      typeof custom.labelTexts !== 'undefined' &&
      typeof custom.labelTexts[this.#name] !== 'undefined'
    ) {
      return custom.labelTexts[this.#name];
    } else {
      if (
        annotation.hasShortAxisInteraction === true &&
        annotation.quantification?.shortAxis?.value !== null
      ) {
        return defaultLabelTexts[this.#name].finalized;
      }
      return defaultLabelTexts[this.#name].drawing;
    }
  }

  /**
   * Set an annotation math shape from input points.
   * Initializes the short axis and related properties if needed.
   * @param {Annotation} annotation The annotation.
   * @param {Point2D[]} points The points.
   */
  setAnnotationMathShape(annotation, points) {
    const line = new BidimensionalLine(points[0], points[1]);
    const totalLength = line.getLength();

    // Initialize individual side lengths to half of the long axis (default)
    if (typeof annotation.shortAxisL1 !== 'number') {
      annotation.shortAxisL1 = totalLength / 2;
      annotation.shortAxisL2 = totalLength / 2;
    }

    if (typeof annotation.shortAxisT !== 'number') {
      annotation.shortAxisT = 0.5;
    }

    // NEW: Store the absolute world position of short axis center
    if (!annotation.shortAxisCenter) {
      const mid = this.getPointAlongLine(line, annotation.shortAxisT);
      annotation.shortAxisCenter = {
        x: mid.getX(),
        y: mid.getY()
      };
    }

    // Keep total length synced for quantification/labels
    annotation.shortAxisLength =
      annotation.shortAxisL1 + annotation.shortAxisL2;

    // Sync model
    line.shortAxisLength = annotation.shortAxisLength;
    line.shortAxisT = annotation.shortAxisT;
    annotation.mathShape = line;

    annotation.setTextExpr(this.#getDefaultLabel(annotation));
    annotation.updateQuantification();
  }

  /**
   * Create a Konva group for the bidimensional annotation.
   * @param {Annotation} annotation The annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Group} The Konva group.
   */
  createShapeGroup(annotation, style) {
    const group = new Konva.Group();
    group.name(this.getGroupName());
    group.visible(true);
    group.id(annotation.trackingUid);

    // Main axis line
    const shape = this.#createShape(annotation, style);
    group.add(shape);

    // Extras: ticks and short axis
    const extras = this.#createShapeExtras(annotation, style);
    for (const extra of extras) {
      group.add(extra);
    }

    // Label
    const label = this.#labelFactory.create(annotation, style);
    group.add(label);

    // Connector
    const connectorsPos = this.#getConnectorsPositions(shape);
    group.add(this.#labelFactory.getConnector(connectorsPos, label, style));

    // Mouse events for solid/dashed short axis
    group.on('mouseenter', () => {
      group.getLayer()?.draw();
      this.updateShortAxisToSolid(group);
    });
    group.on('mouseleave', () => {
      group.getLayer()?.draw();
      this.updateShortAxisToSolid(group);
    });

    // Attach annotation to group for anchor logic
    group?.setAttr('annotation', annotation);
    group.on('dragend', () => {
      const pos = group.position();
      if (pos.x !== 0 || pos.y !== 0) {
        // Apply translation to the model (WORLD space)
        this.updateAnnotationOnTranslation(group.getAttr('annotation'), pos);
        group.position({x: 0, y: 0});
        group.getLayer()?.draw();
      }
    });

    // Highlight short axis and ticks on mouse enter
    const shortAxis = group.findOne('.bidimensional-short-axis');
    const saTick0 = group.findOne('.short-axis-tick0');
    const saTick1 = group.findOne('.short-axis-tick1');
    const setShortAxisOpacity = (opacity) => {
      if (shortAxis) {
        shortAxis.opacity(opacity);
      }
      if (saTick0) {
        saTick0.opacity(opacity);
      }
      if (saTick1) {
        saTick1.opacity(opacity);
      }
      group.getLayer()?.draw();
    };
    [shortAxis, saTick0, saTick1].forEach((line) => {
      if (line) {
        line.on('mouseenter', () => setShortAxisOpacity(1));
      }
    });

    return group;
  }

  /**
   * Create the main axis line shape.
   * @param {Annotation} annotation The annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Line} The Konva line.
   */
  #createShape(annotation, style) {
    const line = annotation.mathShape;
    return new Konva.Line({
      points: [
        line.getBegin().getX(),
        line.getBegin().getY(),
        line.getEnd().getX(),
        line.getEnd().getY(),
      ],
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      opacity: 1,
      name: 'shape',
    });
  }

  /**
   * Create extra shapes: main axis ticks, short axis, and short axis ticks.
   * @param {Annotation} annotation The annotation.
   * @param {Style} style The drawing style.
   * @returns {Array} The Konva shape extras.
   */
  #createShapeExtras(annotation, style) {
    const line = annotation.mathShape;
    const shortAxisTickLen = 10;
    const longAxisTickLen = 20;
    const zoom = style.getZoomScale ? style.getZoomScale() : 1;

    // Main axis ticks
    const linePerp0 = getPerpendicularLine(
      line,
      line.getBegin(),
      longAxisTickLen,
      zoom,
    );
    const ktick0 = new Konva.Line({
      points: [
        linePerp0.getBegin().getX(),
        linePerp0.getBegin().getY(),
        linePerp0.getEnd().getX(),
        linePerp0.getEnd().getY(),
      ],
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape-tick0',
    });

    const linePerp1 = getPerpendicularLine(
      line,
      line.getEnd(),
      longAxisTickLen,
      zoom,
    );
    const ktick1 = new Konva.Line({
      points: [
        linePerp1.getBegin().getX(),
        linePerp1.getBegin().getY(),
        linePerp1.getEnd().getX(),
        linePerp1.getEnd().getY(),
      ],
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape-tick1',
    });

    // 2. Short axis - NOW USING INDEPENDENT ENDPOINTS
    // This ensures the line length matches the anchor positions exactly
    const [sa1, sa2] = this.getShortAxisEndpoints(annotation, style);

    const shortAxis = new Konva.Line({
      points: [sa1.getX(), sa1.getY(), sa2.getX(), sa2.getY()],
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      dash: annotation.hasShortAxisInteraction
        ? []
        : [8, 8],
      opacity: 0.5,
      name: 'bidimensional-short-axis',
    });

    // 3. Short axis ticks (perpendicular to the short axis line)
    const dx = sa2.getX() - sa1.getX();
    const dy = sa2.getY() - sa1.getY();
    const len = Math.sqrt(dx * dx + dy * dy);

    let nx, ny;
    if (len === 0) {
      nx = 1;
      ny = 0;
    } else {
      nx = -dy / len;
      ny = dx / len;
    }

    // Tick at sa1
    const saTick0 = new Konva.Line({
      points: [
        sa1.getX() - (nx * shortAxisTickLen) / 2,
        sa1.getY() - (ny * shortAxisTickLen) / 2,
        sa1.getX() + (nx * shortAxisTickLen) / 2,
        sa1.getY() + (ny * shortAxisTickLen) / 2,
      ],
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      opacity: 0.5,
      name: 'short-axis-tick0',
    });
    const saTick1 = new Konva.Line({
      points: [
        sa2.getX() - (nx * shortAxisTickLen) / 2,
        sa2.getY() - (ny * shortAxisTickLen) / 2,
        sa2.getX() + (nx * shortAxisTickLen) / 2,
        sa2.getY() + (ny * shortAxisTickLen) / 2,
      ],
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      opacity: 0.5,
      name: 'short-axis-tick1',
    });

    return [ktick0, ktick1, shortAxis, saTick0, saTick1];
  }

  /**
   * Get the connector positions for the label.
   * @param {Konva.Line} shape The main axis shape.
   * @returns {Point2D[]} The connector positions.
   */
  #getConnectorsPositions(shape) {
    const points = shape.points();
    const sx = shape.x();
    const sy = shape.y();
    const centerX = (points[0] + points[2]) / 2 + sx;
    const centerY = (points[1] + points[3]) / 2 + sy;
    return [new Point2D(centerX, centerY)];
  }

  /**
   * Get the anchor positions for the shape.
   * @param {Konva.Line} shape The main axis shape.
   * @param {Style} style The drawing style.
   * @returns {Point2D[]} The anchor positions.
   */
  #getAnchorsPositions(shape, style) {
    // Main axis endpoints (from the shape)
    const points = shape.points();
    const sx = shape.x();
    const sy = shape.y();
    const main0 = new Point2D(points[0] + sx, points[1] + sy);
    const main1 = new Point2D(points[2] + sx, points[3] + sy);

    // Short axis endpoints (from the model)
    const group = shape.getParent();
    const annotation = group?.getAttr('annotation');
    if (!annotation || !annotation.mathShape) {
      return [main0, main1, main0, main1];
    }

    // Always use the model to get the current short axis endpoints
    const [sa1, sa2] = this.getShortAxisEndpoints(annotation, style);

    // Return all four anchor positions
    return [main0, main1, sa1, sa2];
  }

  /**
   * Get anchors for the shape.
   * @param {Konva.Line} shape The main axis shape.
   * @param {Style} style The drawing style.
   * @returns {Konva.Ellipse[]} The anchors.
   */
  getAnchors(shape, style) {
    const positions = this.#getAnchorsPositions(shape, style);
    const anchors = [];
    for (let i = 0; i < positions.length; ++i) {
      anchors.push(
        getDefaultAnchor(
          positions[i].getX(),
          positions[i].getY(),
          'anchor' + i, // anchor0, anchor1, anchor2, anchor3
          style,
          4,
        ),
      );
    }
    return anchors;
  }

  /**
   * Constrain anchor movement for short axis anchors.
   * @param {Konva.Ellipse} anchor The active anchor.
   */
  constrainAnchorMove(anchor) {
    const group = anchor.getParent();
    const annotation = group?.getAttr('annotation');
    const mathShape = annotation.mathShape;

    // Handle SHORT AXIS anchors (anchor2 and anchor3)
    if (anchor.id() === 'anchor2' || anchor.id() === 'anchor3') {
      const begin = mathShape.getBegin();
      const end = mathShape.getEnd();
      const dx = end.getX() - begin.getX();
      const dy = end.getY() - begin.getY();
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len === 0) {
        return;
      }

      const ux = dx / len;
      const uy = dy / len;
      const px = -uy; // Perpendicular unit vector
      const py = ux;

      const vx = anchor.x() - begin.getX();
      const vy = anchor.y() - begin.getY();

      // 1. Update position along the long axis (T)
      const tWorld = vx * ux + vy * uy;
      annotation.shortAxisT = Math.max(0, Math.min(1, tWorld / len));

      // NEW: Update absolute center position
      const center = this.getPointAlongLine(mathShape, annotation.shortAxisT);
      annotation.shortAxisCenter = {
        x: center.getX(),
        y: center.getY()
      };

      // 2. Update specific side length with CLAMPING
      const distFromLongAxis = vx * px + vy * py;

      if (anchor.id() === 'anchor2') {
        annotation.shortAxisL1 = Math.max(0.1, distFromLongAxis);
      } else {
        annotation.shortAxisL2 = Math.max(0.1, -distFromLongAxis);
      }

      // Update total length for labels/quantification
      annotation.shortAxisLength =
        annotation.shortAxisL1 + annotation.shortAxisL2;

      // 3. Re-lock anchor position to the clamped value
      const finalDist =
        (anchor.id() === 'anchor2')
          ? annotation.shortAxisL1
          : -annotation.shortAxisL2;
      anchor.x(center.getX() + px * finalDist);
      anchor.y(center.getY() + py * finalDist);
    }
  }
  /**
   * Update shape and label on anchor move.
   * @param {Annotation} annotation The annotation.
   * @param {Konva.Ellipse} anchor The active anchor.
   * @param {Style} style The drawing style.
   * @param {ViewController} viewController The view controller.
   */
  updateShapeGroupOnAnchorMove(annotation, anchor, style, viewController) {
    const group = anchor.getParent();
    if (!(group instanceof Konva.Group)) {
      return;
    }

    // Update shape and anchors
    this.#updateShape(annotation, anchor, style, viewController);

    // Update label
    this.updateLabelContent(annotation, group, style);

    // Update label position if default position
    if (typeof annotation.labelPosition === 'undefined') {
      this.#labelFactory.updatePosition(annotation, group);
    }

    // Update connector
    this.updateConnector(group);
  }

  /**
   * Update the shape and anchors after anchor move.
   * @param {Annotation} annotation The annotation.
   * @param {Konva.Ellipse} anchor The active anchor.
   * @param {Style} style The drawing style.
   * @param {ViewController} viewController The view controller.
   */
  #updateShape(annotation, anchor, style, viewController) {
    const line = annotation.mathShape;
    const group = anchor.getParent();
    if (!(group instanceof Konva.Group)) {
      return;
    }

    // 1. Update Main Axis Line
    const kline = group.findOne('.shape');
    kline.position({x: 0, y: 0});
    kline.points([
      line.getBegin().getX(),
      line.getBegin().getY(),
      line.getEnd().getX(),
      line.getEnd().getY(),
    ]);

    // 2. Update Main Axis Ticks (Ends of the long axis)
    const ktick0 = group.findOne('.shape-tick0');
    const ktick1 = group.findOne('.shape-tick1');
    const tickLen = 20;
    const zoom = style.getZoomScale();

    const linePerp0 = getPerpendicularLine(
      line,
      line.getBegin(),
      tickLen,
      zoom,
    );
    ktick0.position({x: 0, y: 0});
    ktick0.points([
      linePerp0.getBegin().getX(),
      linePerp0.getBegin().getY(),
      linePerp0.getEnd().getX(),
      linePerp0.getEnd().getY(),
    ]);

    const linePerp1 = getPerpendicularLine(line, line.getEnd(), tickLen, zoom);
    ktick1.position({x: 0, y: 0});
    ktick1.points([
      linePerp1.getBegin().getX(),
      linePerp1.getBegin().getY(),
      linePerp1.getEnd().getX(),
      linePerp1.getEnd().getY(),
    ]);

    // 3. Handle Anchor interaction
    if (anchor.id() === 'anchor2' || anchor.id() === 'anchor3') {
      line.shortAxisLength = annotation.shortAxisLength;
      line.shortAxisT = annotation.shortAxisT;
    }

    // 4. Get the Independent Endpoints
    const [sa1, sa2] = this.getShortAxisEndpoints(annotation, style);

    // 5. Update Short Axis Line
    const shortAxis = group.findOne('.bidimensional-short-axis');
    if (shortAxis) {
      shortAxis.position({x: 0, y: 0});
      shortAxis.points([sa1.getX(), sa1.getY(), sa2.getX(), sa2.getY()]);
    }

    // 6. Update Short Axis Ticks and Anchor Positions
    this.updateShortAxisTicks(group, sa1, sa2);

    const a2 = getAnchorShape(group, 2);
    const a3 = getAnchorShape(group, 3);
    if (a2 && a3) {
      a2.x(sa1.getX());
      a2.y(sa1.getY());
      a3.x(sa2.getX());
      a3.y(sa2.getY());
    }

    annotation.hasShortAxisInteraction = true;
    annotation.setTextExpr(this.#getDefaultLabel(annotation));
    annotation.updateQuantification?.(viewController);
    group.getLayer()?.draw();
  }

  /**
   * Update the label content.
   * @param {Annotation} annotation The annotation.
   * @param {Konva.Group} group The shape group.
   * @param {Style} _style The drawing style.
   */
  updateLabelContent(annotation, group, _style) {
    this.#labelFactory.updateContent(annotation, group);
  }

  /**
   * Update the label connector.
   * @param {Konva.Group} group The shape group.
   */
  updateConnector(group) {
    const kshape = group.findOne('.shape');
    const connectorsPos = this.#getConnectorsPositions(kshape);
    this.#labelFactory.updateConnector(group, connectorsPos);
  }

  /**
   * Get the default label position (lowest point).
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D} The label position.
   */
  #getDefaultLabelPosition(annotation) {
    const line = annotation.mathShape;
    const begin = line.getBegin();
    const end = line.getEnd();
    let res = begin;
    if (begin.getY() < end.getY()) {
      res = end;
    }
    return res;
  }

  /**
   * Update annotation on translation (shape move).
   * @param {Annotation} annotation The annotation.
   * @param {object} translation The translation.
   */
  updateAnnotationOnTranslation(annotation, translation) {
    const line = annotation.mathShape;
    const begin = line.getBegin();
    const end = line.getEnd();

    // Calculate new world positions for long axis
    const newBegin = new Point2D(
      begin.getX() + translation.x,
      begin.getY() + translation.y,
    );
    const newEnd = new Point2D(
      end.getX() + translation.x,
      end.getY() + translation.y,
    );
    const newLine = new BidimensionalLine(newBegin, newEnd);

    newLine.shortAxisLength = annotation.shortAxisLength;
    newLine.shortAxisT = annotation.shortAxisT;

    if (annotation.shortAxisCenter) {
      annotation.shortAxisCenter = {
        x: annotation.shortAxisCenter.x + translation.x,
        y: annotation.shortAxisCenter.y + translation.y
      };
    }

    annotation.mathShape = newLine;
    annotation.updateQuantification();
  }
  /**
  * Update annotation on anchor move.
  * @param {Annotation} annotation The annotation.
  * @param {Konva.Shape} anchor The anchor.
  */
  updateAnnotationOnAnchorMove(annotation, anchor) {
    const group = anchor.getParent();
    if (!(group instanceof Konva.Group)) {
      return;
    }

    const kline = group.findOne('.shape');
    const anchor0 = getAnchorShape(group, 0);
    const anchor1 = getAnchorShape(group, 1);

    // Get the positions compensating for group/shape translation
    const pointBegin = new Point2D(
      anchor0.x() - kline.x(),
      anchor0.y() - kline.y(),
    );
    const pointEnd = new Point2D(
      anchor1.x() - kline.x(),
      anchor1.y() - kline.y()
    );
    const newLine = new BidimensionalLine(pointBegin, pointEnd);

    // Preserve all custom independent properties
    newLine.shortAxisLength = annotation.shortAxisLength;
    newLine.shortAxisT = annotation.shortAxisT;
    annotation.mathShape = newLine;
    annotation.updateQuantification();
  }

  /**
   * Set the short axis to solid (remove dash).
   * @param {Konva.Group} group The shape group.
   */
  updateShortAxisToSolid(group) {
    const shortAxis = group.findOne('.bidimensional-short-axis');
    if (!shortAxis) {
      return;
    }
    shortAxis.dash([]); // Always set to solid
    shortAxis.getLayer()?.draw();
  }

  /**
   * Update the short axis ticks.
   * @param {Konva.Group} group The shape group.
   * @param {Point2D} sa1 The first short axis endpoint.
   * @param {Point2D} sa2 The second short axis endpoint.
   */
  updateShortAxisTicks(group, sa1, sa2) {

    const tickLen = 10;
    const dx = sa2.getX() - sa1.getX();
    const dy = sa2.getY() - sa1.getY();
    const len = Math.sqrt(dx * dx + dy * dy);

    let nx, ny;
    if (len === 0) {
      nx = 1;
      ny = 0;
    } else {
      nx = -dy / len;
      ny = dx / len;
    }
    // Tick at sa1
    const tickSA1Start = new Point2D(
      sa1.getX() - (nx * tickLen) / 2,
      sa1.getY() - (ny * tickLen) / 2,
    );
    const tickSA1End = new Point2D(
      sa1.getX() + (nx * tickLen) / 2,
      sa1.getY() + (ny * tickLen) / 2,
    );
    const saTick0 = group.findOne('.short-axis-tick0');
    if (saTick0) {
      saTick0.position({x: 0, y: 0});
      saTick0.points([
        tickSA1Start.getX(),
        tickSA1Start.getY(),
        tickSA1End.getX(),
        tickSA1End.getY(),
      ]);
      saTick0.opacity(0.5);
    }

    // Tick at sa2
    const tickSA2Start = new Point2D(
      sa2.getX() - (nx * tickLen) / 2,
      sa2.getY() - (ny * tickLen) / 2,
    );
    const tickSA2End = new Point2D(
      sa2.getX() + (nx * tickLen) / 2,
      sa2.getY() + (ny * tickLen) / 2,
    );
    const saTick1 = group.findOne('.short-axis-tick1');
    if (saTick1) {
      saTick1.position({x: 0, y: 0});
      saTick1.points([
        tickSA2Start.getX(),
        tickSA2Start.getY(),
        tickSA2End.getX(),
        tickSA2End.getY(),
      ]);
      saTick1.opacity(0.5);
    }
  }

  /**
   * Get the endpoints of the short axis.
   * @param {Annotation} annotation The annotation.
   * @returns {[Point2D, Point2D]} The endpoints.
   */
  getShortAxisEndpoints(annotation) {
    const line = annotation.mathShape;

    // Use absolute center position if available
    let mid;
    if (annotation.shortAxisCenter) {
      // Project the absolute center onto the current long axis
      const begin = line.getBegin();
      const end = line.getEnd();
      const dx = end.getX() - begin.getX();
      const dy = end.getY() - begin.getY();
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len === 0) {
        const centerX = annotation.shortAxisCenter.x;
        const centerY = annotation.shortAxisCenter.y;
        mid = new Point2D(centerX, centerY);
      } else {
        const ux = dx / len;
        const uy = dy / len;

        // Vector from begin to absolute center
        const vx = annotation.shortAxisCenter.x - begin.getX();
        const vy = annotation.shortAxisCenter.y - begin.getY();

        // Project onto long axis
        const projection = vx * ux + vy * uy;
        const t = Math.max(0, Math.min(1, projection / len));

        // Update T to match the projection
        annotation.shortAxisT = t;

        mid = this.getPointAlongLine(line, t);
      }
    } else {
      // Fallback to T-based positioning
      mid = this.getPointAlongLine(line, annotation.shortAxisT ?? 0.5);
    }

    const begin = line.getBegin();
    const end = line.getEnd();
    const dx = end.getX() - begin.getX();
    const dy = end.getY() - begin.getY();
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len === 0) {
      return [mid, mid];
    }

    // Perpendicular unit vector
    const px = -dy / len;
    const py = dx / len;

    // Fallback to half length if L1/L2 aren't set yet (defensive coding)
    const l1 = typeof annotation.shortAxisL1 === 'number'
      ? annotation.shortAxisL1 : annotation.shortAxisLength / 2;
    const l2 = typeof annotation.shortAxisL2 === 'number'
      ? annotation.shortAxisL2 : annotation.shortAxisLength / 2;

    return [
      new Point2D(mid.getX() + px * l1, mid.getY() + py * l1),
      new Point2D(mid.getX() - px * l2, mid.getY() - py * l2)
    ];
  }

  /**
   * Get a point along the main axis line.
   * @param {BidimensionalLine} line The main axis line.
   * @param {number} t The interpolation parameter [0, 1].
   * @returns {Point2D} The point along the line.
   */
  getPointAlongLine(line, t) {
    const b = line.getBegin();
    const e = line.getEnd();

    return new Point2D(
      b.getX() + (e.getX() - b.getX()) * t,
      b.getY() + (e.getY() - b.getY()) * t,
    );
  }
}