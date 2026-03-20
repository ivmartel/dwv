import {getPerpendicularLine} from '../math/line.js';

// doc imports
/* eslint-disable no-unused-vars */
import Konva from 'konva';
import {Line} from '../math/line.js';
import {Scalar2D} from '../math/scalar.js';
/* eslint-enable no-unused-vars */

/**
 * Apply a wider quadrilateral hit area to an open Konva.Line.
 *
 * The hit zone is a rectangle whose sides are the perpendicular half-widths
 * drawn at each endpoint of the line. This makes thin lines much easier to
 * click without changing their visual appearance.
 *
 * @param {Konva.Line} kline The Konva line shape to update.
 * @param {Line} line The mathematical line (provides begin/end points).
 * @param {Scalar2D} zoomScale The current zoom scale {x, y}.
 * @param {number} [hitWidth] Half-width of the hit quad in pixels (default 20).
 */
export function setLineHitFunc(kline, line, zoomScale, hitWidth = 20) {
  const linePerp0 = getPerpendicularLine(
    line, line.getBegin(), hitWidth, zoomScale);
  const linePerp1 = getPerpendicularLine(
    line, line.getEnd(), hitWidth, zoomScale);
  kline.hitFunc(function (context) {
    context.beginPath();
    context.moveTo(linePerp0.getBegin().getX(), linePerp0.getBegin().getY());
    context.lineTo(linePerp0.getEnd().getX(), linePerp0.getEnd().getY());
    context.lineTo(linePerp1.getEnd().getX(), linePerp1.getEnd().getY());
    context.lineTo(linePerp1.getBegin().getX(), linePerp1.getBegin().getY());
    context.closePath();
    context.fillStrokeShape(kline);
  });
}
