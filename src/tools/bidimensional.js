import Konva from 'konva';
import {BidimensionalLine} from '../math/bidimensionalLine.js';
import {getPerpendicularLine} from '../math/line.js';
import {Point2D} from '../math/point.js';
import {LabelFactory} from './labelFactory.js';
import {setLineHitFunc} from './lineHitFunc.js';
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
   *
   * @type {string}
   */
  #name = 'bidimensional';

  /**
   * The associated label factory.
   *
   * @type {LabelFactory}
   */
  #labelFactory = new LabelFactory(this.#getDefaultLabelPosition);

  /**
   * Does this factory support the input math shape.
   *
   * @param {object} mathShape The mathematical shape.
   * @returns {boolean} True if supported.
   */
  static supports(mathShape) {
    return mathShape instanceof BidimensionalLine;
  }

  /**
   * Get the name of the factory.
   *
   * @returns {string} The name.
   */
  getName() {
    return this.#name;
  }

  /**
   * Get the name of the shape group.
   *
   * @returns {string} The name.
   */
  getGroupName() {
    return `${this.#name}-group`;
  }

  /**
   * Get the number of points needed to build the shape.
   *
   * @returns {number} The number of points.
   */
  getNPoints() {
    return 2;
  }

  /**
   * Get the timeout between point storage.
   *
   * @returns {number} The timeout in milliseconds.
   */
  getTimeout() {
    return 0;
  }

  /**
   * Get the default label template for the annotation.
   * Returns the draft label if the short axis is not yet set.
   *
   * @param {Annotation} annotation The annotation.
   * @returns {object} The label template object.
   */
  #getDefaultLabel(annotation) {
    if (
      custom.labelTexts !== undefined &&
      custom.labelTexts[this.#name] !== undefined
    ) {
      return custom.labelTexts[this.#name];
    }
    if (
      annotation.mathShape.hasShortAxisInteraction === true &&
      annotation.quantification?.shortAxis?.value !== null
    ) {
      return defaultLabelTexts[this.#name];
    }
    return defaultLabelTexts[`${this.#name}Drawing`];
  }

  /**
   * Set an annotation math shape from input points.
   * Initializes the short axis and related properties if needed.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Point2D[]} points The points.
   */
  setAnnotationMathShape(annotation, points) {
    const line = new BidimensionalLine(points[0], points[1]);
    const totalLength = line.getLength();

    // Initialize individual side lengths to half of the long axis (default)
    if (typeof line.shortAxisL1 !== 'number') {
      line.shortAxisL1 = totalLength / 2;
      line.shortAxisL2 = totalLength / 2;
    }

    if (typeof line.shortAxisT !== 'number') {
      line.shortAxisT = 0.5;
    }

    // Store the absolute world position of short axis center
    if (!line.shortAxisCenter) {
      const mid = this.getPointAlongLine(line, line.shortAxisT);
      line.shortAxisCenter = mid;
    }

    // Keep total length synced for quantification/labels
    line.shortAxisLength = line.shortAxisL1 + line.shortAxisL2;

    annotation.mathShape = line;
    annotation.setTextExpr(this.#getDefaultLabel(annotation));
    annotation.updateQuantification();
  }

  /**
   * Create a Konva group for the bidimensional annotation.
   *
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
   *
   * @param {Annotation} annotation The annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Line} The Konva line.
   */
  #createShape(annotation, style) {
    const line = annotation.mathShape;
    const kline = new Konva.Line({
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

    // larger hitfunc
    setLineHitFunc(
      kline, line,
      style.getZoomScale ? style.getZoomScale() : {x: 1, y: 1}
    );

    return kline;
  }

  /**
   * Create extra shapes: main axis ticks, short axis, and short axis ticks.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Style} style The drawing style.
   * @returns {Array} The Konva shape extras.
   */
  #createShapeExtras(annotation, style) {
    const line = annotation.mathShape;
    const shortAxisTickLen = 10;
    const longAxisTickLen = 20;
    const zoom = style.getZoomScale ? style.getZoomScale() : {x: 1, y: 1};

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
    const [sa1, sa2] = this.getShortAxisEndpoints(annotation);

    const shortAxis = new Konva.Line({
      points: [sa1.getX(), sa1.getY(), sa2.getX(), sa2.getY()],
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      dash: annotation.mathShape.hasShortAxisInteraction
        ? []
        : [8, 8],
      opacity: 0.5,
      name: 'bidimensional-short-axis',
    });

    // 3. Short axis ticks (perpendicular to the short axis line)
    const dx = sa2.getX() - sa1.getX();
    const dy = sa2.getY() - sa1.getY();
    const len = Math.hypot(dx, dy);

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
   *
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
   *
   * @param {Konva.Line} shape The main axis shape.
   * @returns {Point2D[]} The anchor positions.
   */
  #getAnchorsPositions(shape) {
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
    const [sa1, sa2] = this.getShortAxisEndpoints(annotation);

    // Return all four anchor positions
    return [main0, main1, sa1, sa2];
  }

  /**
   * Get anchors for the shape.
   *
   * @param {Konva.Line} shape The main axis shape.
   * @param {Style} style The drawing style.
   * @returns {Konva.Ellipse[]} The anchors.
   */
  getAnchors(shape, style) {
    const positions = this.#getAnchorsPositions(shape);
    const anchors = [];
    for (let i = 0; i < positions.length; ++i) {
      anchors.push(
        getDefaultAnchor(
          positions[i].getX(),
          positions[i].getY(),
          `anchor${i}`, // anchor0, anchor1, anchor2, anchor3
          style
        )
      );
    }
    return anchors;
  }

  /**
   * Constrain anchor movement for short axis anchors.
   *
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
      const len = Math.hypot(dx, dy);

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
      mathShape.shortAxisT = Math.max(0, Math.min(1, tWorld / len));

      // NEW: Update absolute center position
      const center = this.getPointAlongLine(mathShape, mathShape.shortAxisT);
      mathShape.shortAxisCenter = center;

      // 2. Update specific side length with CLAMPING
      const distFromLongAxis = vx * px + vy * py;

      if (anchor.id() === 'anchor2') {
        mathShape.shortAxisL1 = Math.max(0.1, distFromLongAxis);
      } else {
        mathShape.shortAxisL2 = Math.max(0.1, -distFromLongAxis);
      }

      // Update total length for labels/quantification
      mathShape.shortAxisLength =
        mathShape.shortAxisL1 + mathShape.shortAxisL2;

      // 3. Re-lock anchor position to the clamped value
      const finalDist =
        (anchor.id() === 'anchor2')
          ? mathShape.shortAxisL1
          : -mathShape.shortAxisL2;
      anchor.x(center.getX() + px * finalDist);
      anchor.y(center.getY() + py * finalDist);
    }
  }
  /**
   * Update shape and label on anchor move.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Konva.Ellipse} anchor The active anchor.
   * @param {Style} style The drawing style.
   */
  updateShapeGroupOnAnchorMove(annotation, anchor, style) {
    const group = anchor.getParent();
    if (!(group instanceof Konva.Group)) {
      return;
    }

    // Update shape and anchors
    this.#updateShape(annotation, anchor, style);

    // Update label
    this.updateLabelContent(annotation, group, style);

    // Update label position if default position
    if (annotation.labelPosition === undefined) {
      this.#labelFactory.updatePosition(annotation, group);
    }

    // Update connector
    this.updateConnector(group);
  }

  /**
   * Update the shape and anchors after anchor move.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Konva.Ellipse} anchor The active anchor.
   * @param {Style} style The drawing style.
   */
  #updateShape(annotation, anchor, style) {
    const line = annotation.mathShape;
    const group = anchor.getParent();
    if (!(group instanceof Konva.Group)) {
      return;
    }

    // 1. Update Main Axis Line
    const kline = group.findOne('.shape');
    if (kline && kline instanceof Konva.Line) {
      kline.position({x: 0, y: 0});
      kline.points([
        line.getBegin().getX(),
        line.getBegin().getY(),
        line.getEnd().getX(),
        line.getEnd().getY(),
      ]);
      // keep hit area in sync with the updated line position
      setLineHitFunc(
        kline, line,
        style.getZoomScale ? style.getZoomScale() : {x: 1, y: 1}
      );
    }

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
    if (ktick0 && ktick0 instanceof Konva.Line) {
      ktick0.position({x: 0, y: 0});
      ktick0.points([
        linePerp0.getBegin().getX(),
        linePerp0.getBegin().getY(),
        linePerp0.getEnd().getX(),
        linePerp0.getEnd().getY(),
      ]);
    }

    const linePerp1 = getPerpendicularLine(line, line.getEnd(), tickLen, zoom);
    if (ktick1 && ktick1 instanceof Konva.Line) {
      ktick1.position({x: 0, y: 0});
      ktick1.points([
        linePerp1.getBegin().getX(),
        linePerp1.getBegin().getY(),
        linePerp1.getEnd().getX(),
        linePerp1.getEnd().getY(),
      ]);
    }

    // 3. Handle Anchor interaction
    if (anchor.id() === 'anchor2' || anchor.id() === 'anchor3') {
      line.shortAxisLength = annotation.mathShape.shortAxisLength;
      line.shortAxisT = annotation.mathShape.shortAxisT;
    }

    // 4. Get the Independent Endpoints
    const [sa1, sa2] = this.getShortAxisEndpoints(annotation);

    // 5. Update Short Axis Line
    const shortAxis = group.findOne('.bidimensional-short-axis');
    if (shortAxis && shortAxis instanceof Konva.Line) {
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

    annotation.mathShape.hasShortAxisInteraction = true;
    annotation.setTextExpr(this.#getDefaultLabel(annotation));
    annotation.updateQuantification?.();
    group.getLayer()?.draw();
  }

  /**
   * Update the label content.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Konva.Group} group The shape group.
   * @param {Style} _style The drawing style.
   */
  updateLabelContent(annotation, group, _style) {
    this.#labelFactory.updateContent(annotation, group);
  }

  /**
   * Update the label connector.
   *
   * @param {Konva.Group} group The shape group.
   */
  updateConnector(group) {
    const kshape = group.findOne('.shape');
    if (kshape && kshape instanceof Konva.Line) {
      const connectorsPos = this.#getConnectorsPositions(kshape);
      this.#labelFactory.updateConnector(group, connectorsPos);
    }
  }

  /**
   * Get the default label position (lowest point).
   *
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
   *
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

    newLine.shortAxisLength = line.shortAxisLength;
    newLine.shortAxisT = line.shortAxisT;
    newLine.shortAxisL1 = line.shortAxisL1;
    newLine.shortAxisL2 = line.shortAxisL2;
    if (
      line.shortAxisCenter instanceof Object &&
      'getX' in line.shortAxisCenter &&
      'getY' in line.shortAxisCenter
    ) {
      newLine.shortAxisCenter = new Point2D(
        line.shortAxisCenter.getX() + translation.x,
        line.shortAxisCenter.getY() + translation.y
      );
    }
    newLine.hasShortAxisInteraction = line.hasShortAxisInteraction;

    annotation.mathShape = newLine;
    annotation.updateQuantification();
  }

  /**
   * Update annotation on anchor move.
   *
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
    const oldLine = annotation.mathShape;

    if (oldLine.shortAxisCenter instanceof Point2D) {
      const center = oldLine.shortAxisCenter;

      // 2. Project the existing center onto the NEW long axis to find the new T
      const dx = pointEnd.getX() - pointBegin.getX();
      const dy = pointEnd.getY() - pointBegin.getY();
      const lenSq = dx * dx + dy * dy;

      if (lenSq > 0) {
        const vx = center.getX() - pointBegin.getX();
        const vy = center.getY() - pointBegin.getY();
        // Vector projection formula: (V dot U) / |U|^2
        const t = (vx * dx + vy * dy) / lenSq;

        // Clamp t between 0 and 1 so short axis doesn't slide off the line
        newLine.shortAxisT = Math.max(0, Math.min(1, t));

        // Re-sync the center to the clamped T on the new line
        newLine.shortAxisCenter = new Point2D(
          pointBegin.getX() + dx * newLine.shortAxisT,
          pointBegin.getY() + dy * newLine.shortAxisT
        );
      } else {
        newLine.shortAxisT = 0.5;
        newLine.shortAxisCenter = center;
      }
    } else {
      newLine.shortAxisT = oldLine.shortAxisT ?? 0.5;
    }

    // Preserve the perpendicular lengths
    newLine.shortAxisL1 = oldLine.shortAxisL1;
    newLine.shortAxisL2 = oldLine.shortAxisL2;
    newLine.shortAxisLength = oldLine.shortAxisLength;
    newLine.hasShortAxisInteraction = oldLine.hasShortAxisInteraction;

    annotation.mathShape = newLine;
    annotation.updateQuantification();
  }

  /**
   * Set the short axis to solid (remove dash).
   *
   * @param {Konva.Group} group The shape group.
   */
  updateShortAxisToSolid(group) {
    const shortAxis = group.findOne('.bidimensional-short-axis');
    if (shortAxis && shortAxis instanceof Konva.Line) {
      shortAxis.dash([]); // Always set to solid
      shortAxis.getLayer()?.draw();
    }
  }

  /**
   * Update the short axis ticks.
   *
   * @param {Konva.Group} group The shape group.
   * @param {Point2D} sa1 The first short axis endpoint.
   * @param {Point2D} sa2 The second short axis endpoint.
   */
  updateShortAxisTicks(group, sa1, sa2) {

    const tickLen = 10;
    const dx = sa2.getX() - sa1.getX();
    const dy = sa2.getY() - sa1.getY();
    const len = Math.hypot(dx, dy);

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
    if (saTick0 && saTick0 instanceof Konva.Line) {
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
    if (saTick1 && saTick1 instanceof Konva.Line) {
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
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D[]} The endpoints as an array of two Point2D objects.
   */
  getShortAxisEndpoints(annotation) {
    const line = annotation.mathShape;
    // Use absolute center position if available and valid
    let mid;
    if (annotation.mathShape.shortAxisCenter instanceof Point2D) {
      // Project the absolute center onto the current long axis
      const begin = line.getBegin();
      const end = line.getEnd();
      const dx = end.getX() - begin.getX();
      const dy = end.getY() - begin.getY();
      const len = Math.hypot(dx, dy);
      if (len === 0) {
        mid = annotation.mathShape.shortAxisCenter;
      } else {
        const ux = dx / len;
        const uy = dy / len;
        // Vector from begin to absolute center
        const vx = annotation.mathShape.shortAxisCenter.getX() - begin.getX();
        const vy = annotation.mathShape.shortAxisCenter.getY() - begin.getY();
        // Project onto long axis
        const projection = vx * ux + vy * uy;
        const t = Math.max(0, Math.min(1, projection / len));
        // Update T to match the projection
        annotation.mathShape.shortAxisT = t;
        mid = this.getPointAlongLine(line, t);
      }
    } else {
      // Fallback to T-based positioning
      const t =
        typeof annotation.mathShape.shortAxisT === 'number'
          ? annotation.mathShape.shortAxisT
          : 0.5;
      mid = this.getPointAlongLine(line, t);
    }
    const begin = line.getBegin();
    const end = line.getEnd();
    const dx = end.getX() - begin.getX();
    const dy = end.getY() - begin.getY();
    const len = Math.hypot(dx, dy);
    if (
      len === 0 ||
      Number.isNaN(mid.getX()) ||
      Number.isNaN(mid.getY())
    ) {
      return [mid, mid];
    }
    // Perpendicular unit vector
    const px = -dy / len;
    const py = dx / len;
    // Fallback to half length if L1/L2 aren't set yet (defensive coding)
    let l1;
    if (typeof annotation.mathShape.shortAxisL1 === 'number') {
      l1 = annotation.mathShape.shortAxisL1;
    } else if (typeof annotation.mathShape.shortAxisLength === 'number') {
      l1 = annotation.mathShape.shortAxisLength / 2;
    } else {
      l1 = 0;
    }
    let l2;
    if (typeof annotation.mathShape.shortAxisL2 === 'number') {
      l2 = annotation.mathShape.shortAxisL2;
    } else if (typeof annotation.mathShape.shortAxisLength === 'number') {
      l2 = annotation.mathShape.shortAxisLength / 2;
    } else {
      l2 = 0;
    }
    if (Number.isNaN(l1) || Number.isNaN(l2)) {
      return [mid, mid];
    }
    return [
      new Point2D(mid.getX() + px * l1, mid.getY() + py * l1),
      new Point2D(mid.getX() - px * l2, mid.getY() - py * l2)
    ];
  }

  /**
   * Get a point along the main axis line.
   *
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