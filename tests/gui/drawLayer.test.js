// @vitest-environment jsdom
import {describe, test, assert, vi, beforeEach, afterEach} from 'vitest';
import {DrawLayer} from '../../src/gui/drawLayer.js';
import {custom} from '../../src/app/custom.js';

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
