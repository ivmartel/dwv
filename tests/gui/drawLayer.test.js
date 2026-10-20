// @vitest-environment jsdom
import {describe, test, assert, vi, beforeEach, afterEach} from 'vitest';
import {DrawLayer} from '../../src/gui/drawLayer.js';
import {custom} from '../../src/app/custom.js';
import {Annotation} from '../../src/image/annotation.js';
import {AnnotationGroup} from '../../src/image/annotationGroup.js';
import {Circle} from '../../src/math/circle.js';
import {Index} from '../../src/math/index.js';
import {Point, Point2D, Point3D} from '../../src/math/point.js';

// external
import Konva from 'konva';

/**
 * Tests for the 'gui/drawLayer.js' file.
 */

/**
 * Create a draw layer with shape groups.
 *
 * @param {string[]} ids The shape group ids.
 * @returns {DrawLayer} The draw layer.
 */
function createDrawLayer(ids) {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const drawLayer = new DrawLayer(div);
  drawLayer.initialise({x: 100, y: 100}, {x: 1, y: 1}, 'ref');
  vi.spyOn(drawLayer, 'draw').mockImplementation(() => {});
  const posGroup = new Konva.Group({name: 'position-group'});
  for (const id of ids) {
    const group = new Konva.Group({id});
    group.add(new Konva.Line({name: 'shape', stroke: '#ff0000'}));
    group.add(new Konva.Text({name: 'label-text'}));
    posGroup.add(group);
  }
  drawLayer.getKonvaLayer().add(posGroup);
  return drawLayer;
}

/**
 * Get the opacity of a group.
 *
 * @param {DrawLayer} drawLayer The draw layer.
 * @param {string} id The group id.
 * @returns {number} The group opacity.
 */
function getOpacity(drawLayer, id) {
  return drawLayer.getKonvaLayer().findOne(`#${id}`).opacity();
}

describe('gui', () => {

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    // flush pending animation frames: konva keeps a per window frame queue
    vi.runAllTimers();
    vi.useRealTimers();
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  test('DrawLayer highlightAnnotation unknown id', () => {
    const drawLayer = createDrawLayer(['a0']);
    assert.notOk(drawLayer.highlightAnnotation('unknown'));
  });

  test('DrawLayer highlightAnnotation dim and reset', () => {
    const drawLayer = createDrawLayer(['a0']);

    assert.ok(drawLayer.highlightAnnotation('a0', 500));

    // one pulse: minimum opacity at half duration
    vi.advanceTimersByTime(125);
    const quarter = getOpacity(drawLayer, 'a0');
    assert.isBelow(quarter, 1);
    vi.advanceTimersByTime(125);
    assert.closeTo(getOpacity(drawLayer, 'a0'), 0.2, 0.05);
    vi.advanceTimersByTime(125);
    assert.isAbove(getOpacity(drawLayer, 'a0'), 0.2);
    vi.advanceTimersByTime(175);
    // original opacity is restored
    assert.equal(getOpacity(drawLayer, 'a0'), 1);
  });

  test('DrawLayer highlightAnnotation one at a time', () => {
    const drawLayer = createDrawLayer(['a0', 'a1']);

    assert.ok(drawLayer.highlightAnnotation('a0'));
    vi.advanceTimersByTime(100);
    assert.isBelow(getOpacity(drawLayer, 'a0'), 1);
    assert.ok(drawLayer.highlightAnnotation('a1'));
    assert.equal(getOpacity(drawLayer, 'a0'), 1);
    vi.advanceTimersByTime(100);
    assert.isBelow(getOpacity(drawLayer, 'a1'), 1);

    // default duration
    vi.advanceTimersByTime(1000);
    assert.equal(getOpacity(drawLayer, 'a1'), 1);

    // unknown id also resets the previous highlight
    assert.ok(drawLayer.highlightAnnotation('a0'));
    vi.advanceTimersByTime(100);
    assert.isBelow(getOpacity(drawLayer, 'a0'), 1);
    assert.notOk(drawLayer.highlightAnnotation('unknown'));
    assert.equal(getOpacity(drawLayer, 'a0'), 1);
  });

  test('DrawLayer highlightAnnotation custom', () => {
    const drawLayer = createDrawLayer(['a0', 'a1']);
    const reset = vi.fn();
    const highlight = vi.fn(() => reset);
    custom.highlightAnnotation = highlight;
    try {
      assert.ok(drawLayer.highlightAnnotation('a0', 500));
      assert.equal(highlight.mock.calls.length, 1);
      const [group, layer, duration] = highlight.mock.calls[0];
      assert.equal(group.id(), 'a0');
      assert.equal(layer, drawLayer.getKonvaLayer());
      assert.equal(duration, 500);
      // default highlight is not used
      vi.advanceTimersByTime(250);
      assert.equal(getOpacity(drawLayer, 'a0'), 1);

      // a new highlight resets the previous one
      assert.ok(drawLayer.highlightAnnotation('a1'));
      assert.equal(reset.mock.calls.length, 1);
      assert.equal(highlight.mock.calls[1][2], 500);
    } finally {
      custom.highlightAnnotation = undefined;
    }
  });

});

/**
 * Create a draw layer at a current position with circle annotations.
 *
 * @param {object[]} circles The circles as {id, x, y, r}.
 * @returns {DrawLayer} The draw layer.
 */
function createPositionedDrawLayer(circles) {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const drawLayer = new DrawLayer(div);
  drawLayer.initialise({x: 100, y: 100}, {x: 1, y: 1}, 'ref');
  vi.spyOn(drawLayer, 'draw').mockImplementation(() => {});
  drawLayer.setPlaneHelper(/** @type {object} */ ({
    getPlanePoints: () => [new Point3D(0, 0, 0)],
    isAquisitionOrientation: () => true
  }));
  const annotations = [];
  for (const circle of circles) {
    const annotation = new Annotation();
    annotation.trackingUid = circle.id;
    annotation.mathShape =
      new Circle(new Point2D(circle.x, circle.y), circle.r);
    annotations.push(annotation);
  }
  drawLayer.setAnnotationGroup(
    new AnnotationGroup(annotations), 'data0', () => {});
  drawLayer.setCurrentPosition(new Point([0, 0, 0]), new Index([0, 0, 0]));
  // creates the current position group
  drawLayer.activateCurrentPositionShapes(true);
  const posGroup = drawLayer.getKonvaLayer().findOne('.position-group');
  for (const circle of circles) {
    posGroup.add(new Konva.Group({id: circle.id}));
  }
  return drawLayer;
}

describe('gui DrawLayer getAnnotationAt', () => {

  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  test('returns the top most annotation containing the point', () => {
    const drawLayer = createPositionedDrawLayer([
      {id: 'a0', x: 10, y: 10, r: 5},
      {id: 'a1', x: 14, y: 10, r: 5}
    ]);
    assert.equal(
      drawLayer.getAnnotationAt(new Point2D(7, 10))?.trackingUid, 'a0',
      'only a0');
    assert.equal(
      drawLayer.getAnnotationAt(new Point2D(12, 10))?.trackingUid, 'a1',
      'overlap: last drawn wins');
    assert.isUndefined(
      drawLayer.getAnnotationAt(new Point2D(50, 50)), 'no annotation');
    assert.equal(
      drawLayer.getAnnotationAt(new Point2D(21, 10), 2)?.trackingUid, 'a1',
      'within tolerance');
  });

  test('skips hidden annotations', () => {
    const drawLayer = createPositionedDrawLayer([
      {id: 'a0', x: 10, y: 10, r: 5},
      {id: 'a1', x: 10, y: 10, r: 5}
    ]);
    drawLayer.setAnnotationVisibility('a1', false);
    assert.equal(
      drawLayer.getAnnotationAt(new Point2D(10, 10))?.trackingUid, 'a0',
      'hidden a1 skipped');
  });

  test('undefined without current position', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const drawLayer = new DrawLayer(div);
    drawLayer.initialise({x: 100, y: 100}, {x: 1, y: 1}, 'ref');
    assert.isUndefined(drawLayer.getAnnotationAt(new Point2D(0, 0)));
  });

});
