// @vitest-environment jsdom
import {describe, test, assert, vi, beforeEach, afterEach} from 'vitest';
import {ViewLayer} from '../../src/gui/viewLayer.js';
import {View} from '../../src/image/view.js';
import {Image} from '../../src/image/image.js';
import {MaskImage} from '../../src/image/maskImage.js';
import {Geometry} from '../../src/image/geometry.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Point3D} from '../../src/math/point.js';
import {getIdentityMat33} from '../../src/math/matrix.js';
import {custom} from '../../src/app/custom.js';

/**
 * Tests for the 'gui/viewLayer.js' file.
 */

/**
 * Create a view layer.
 *
 * @param {boolean} isMask True to create a mask view layer.
 * @returns {ViewLayer} The view layer.
 */
function createViewLayer(isMask) {
  const size = new Size([2, 2, 1]);
  const geometry = new Geometry(
    [new Point3D(0, 0, 0)], size, new Spacing([1, 1, 1]));
  const buffer = new Uint8Array([0, 1, 2, 1]);
  let image;
  if (isMask) {
    image = new MaskImage(geometry, buffer, ['0']);
  } else {
    image = new Image(geometry, buffer, ['0']);
  }
  const div = document.createElement('div');
  document.body.appendChild(div);
  const viewLayer = new ViewLayer(div);
  vi.spyOn(viewLayer, 'draw').mockImplementation(() => {});
  const view = new View(image);
  view.setOrientation(getIdentityMat33());
  viewLayer.setView(view, 'data0');
  return viewLayer;
}

/**
 * Get the highlight opacity of a segment.
 *
 * @param {ViewLayer} viewLayer The view layer.
 * @param {number} segmentNumber The segment number.
 * @returns {number} The segment highlight opacity.
 */
function getOpacity(viewLayer, segmentNumber) {
  const highlight = viewLayer.getViewController().getSegmentHighlight();
  if (typeof highlight === 'undefined' ||
    highlight.segmentNumber !== segmentNumber) {
    return 1;
  }
  return highlight.opacity;
}

describe('gui', () => {

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  test('ViewLayer highlightSegment not a mask', () => {
    const viewLayer = createViewLayer(false);
    assert.notOk(viewLayer.highlightSegment(1));
  });

  test('ViewLayer highlightSegment dim and reset', () => {
    const viewLayer = createViewLayer(true);

    assert.ok(viewLayer.highlightSegment(1, 500));

    // one pulse: minimum opacity at half duration
    vi.advanceTimersByTime(125);
    assert.isBelow(getOpacity(viewLayer, 1), 1);
    // highlight changes redraw the layer
    assert.isAbove(vi.mocked(viewLayer.draw).mock.calls.length, 0);
    vi.advanceTimersByTime(125);
    assert.closeTo(getOpacity(viewLayer, 1), 0.2, 0.05);
    vi.advanceTimersByTime(125);
    assert.isAbove(getOpacity(viewLayer, 1), 0.2);
    vi.advanceTimersByTime(175);
    // highlight is removed
    assert.isUndefined(viewLayer.getViewController().getSegmentHighlight());
  });

  test('ViewLayer highlightSegment one at a time', () => {
    const viewLayer = createViewLayer(true);

    assert.ok(viewLayer.highlightSegment(1));
    vi.advanceTimersByTime(100);
    assert.isBelow(getOpacity(viewLayer, 1), 1);
    assert.ok(viewLayer.highlightSegment(2));
    assert.equal(getOpacity(viewLayer, 1), 1);
    vi.advanceTimersByTime(100);
    assert.isBelow(getOpacity(viewLayer, 2), 1);

    // default duration (750ms): still highlighted at 600ms
    vi.advanceTimersByTime(500);
    assert.isBelow(getOpacity(viewLayer, 2), 1);
    vi.advanceTimersByTime(200);
    assert.isUndefined(viewLayer.getViewController().getSegmentHighlight());
  });

  test('ViewLayer highlightSegment custom', () => {
    const viewLayer = createViewLayer(true);
    const reset = vi.fn();
    const highlight = vi.fn(() => reset);
    custom.highlightSegment = highlight;
    try {
      assert.ok(viewLayer.highlightSegment(1, 300));
      assert.equal(highlight.mock.calls.length, 1);
      const [layer, segmentNumber, duration] = highlight.mock.calls[0];
      assert.equal(layer, viewLayer);
      assert.equal(segmentNumber, 1);
      assert.equal(duration, 300);
      // default highlight is not used
      vi.advanceTimersByTime(150);
      assert.equal(getOpacity(viewLayer, 1), 1);

      // a new highlight resets the previous one
      assert.ok(viewLayer.highlightSegment(2));
      assert.equal(reset.mock.calls.length, 1);
      assert.equal(highlight.mock.calls[1][2], 750);
    } finally {
      custom.highlightSegment = undefined;
    }
  });

});
