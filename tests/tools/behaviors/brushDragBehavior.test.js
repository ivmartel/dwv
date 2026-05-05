// @vitest-environment jsdom
import {describe, test, assert, vi, beforeEach} from 'vitest';

const maskState = vi.hoisted(() => ({
  selectedSegmentNumber: /** @type {number|undefined} */ (1),
  offsets: /** @type {number[]} */ ([1, 2, 3]),
  brushMode: 'add'
}));

vi.mock('../../../src/gui/viewLayer.js', () => ({
  ViewLayer: class ViewLayer {}
}));

vi.mock('../../../src/tools/behaviors/brushMaskPaint.js', () => {
  const BrushMode = {Del: 'del', Add: 'add'};
  /**
   * Lightweight stand-in used only by {@link BrushDragBehavior} tests.
   */
  class BrushMaskPaint extends EventTarget {
    /**
     * @param {{ app: object }} opts Options with mocked `app` reference.
     */
    constructor(opts) {
      super();
      this.app = opts.app;
    }

    /**
     * @param {object} features Brush feature fields (segment, mode).
     */
    setFeatures(features) {
      if (typeof features.selectedSegmentNumber !== 'undefined') {
        maskState.selectedSegmentNumber = features.selectedSegmentNumber;
      }
      if (typeof features.brushMode !== 'undefined') {
        maskState.brushMode = features.brushMode;
      }
    }

    getBrushSize() {
      return 10;
    }

    getBrushMode() {
      return maskState.brushMode;
    }

    getSelectedSegmentNumber() {
      return maskState.selectedSegmentNumber;
    }

    getMaskOffsets() {
      return maskState.offsets;
    }

    applyTemporaryPaint() {
      return undefined;
    }

    finalizeStroke() {}

    /**
     * @param {string} mode Add vs delete brush mode (`add` / `del`).
     */
    setBrushMode(mode) {
      maskState.brushMode = mode;
    }
  }
  return {BrushMode, BrushMaskPaint};
});

import {Point2D} from '../../../src/math/point.js';
import {BrushDragBehavior} from
  '../../../src/tools/behaviors/brushDragBehavior.js';
import {ViewLayer} from '../../../src/gui/viewLayer.js';
import {MouseEventButtons} from '../../../src/tools/layerGroupPointer.js';
import * as loggerModule from '../../../src/utils/logger.js';

describe('BrushDragBehavior', () => {
  /**
   * Minimal app stub with `getData` for series metadata.
   *
   * @returns {object} App-like object for {@link BrushDragBehavior}.
   */
  function makeApp() {
    return {
      getData: vi.fn(() => ({
        image: {
          getMeta: () => ({SeriesInstanceUID: 'series-a'})
        }
      }))
    };
  }

  /**
   * Layer group mock wired to the given active layer.
   *
   * @param {unknown} activeLayer Value returned by `getActiveLayer`.
   * @returns {object} Layer group stub for `canStart` / drag tests.
   */
  function makeLayerGroup(activeLayer) {
    return {
      getActiveLayer: vi.fn(() => activeLayer),
      getActiveDrawLayer: vi.fn(() => undefined),
      getActiveViewLayer: vi.fn(() => ({
        getDataId: () => 'ref-id',
        getMeta: () => ({SeriesInstanceUID: 'series-a'})
      }))
    };
  }

  beforeEach(() => {
    maskState.selectedSegmentNumber = 1;
    maskState.offsets = [1, 2, 3];
    maskState.brushMode = 'add';
    vi.restoreAllMocks();
  });

  test('canStart is false when active layer is not a ViewLayer', () => {
    const behavior = new BrushDragBehavior(makeApp());
    const lg = makeLayerGroup({});

    assert.notOk(behavior.canStart(new Point2D(0, 0), lg));
  });

  test('canStart is false when selected segment is undefined', () => {
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});
    maskState.selectedSegmentNumber = undefined;
    const behavior = new BrushDragBehavior(makeApp());
    const lg = makeLayerGroup(new ViewLayer());

    assert.notOk(behavior.canStart(new Point2D(0, 0), lg));
    assert.ok(warnSpy.mock.calls.length >= 1);
  });

  test('canStart is false when series is blacklisted', () => {
    const behavior = new BrushDragBehavior(makeApp());
    behavior.setFeatures({blacklist: ['series-a']});
    const lg = makeLayerGroup(new ViewLayer());

    assert.notOk(behavior.canStart(new Point2D(0, 0), lg));
  });

  test('canStart is true with ViewLayer, segment, not blacklisted', () => {
    const behavior = new BrushDragBehavior(makeApp());
    const lg = makeLayerGroup(new ViewLayer());

    assert.ok(behavior.canStart(new Point2D(0, 0), lg));
  });

  test('setFeatures forwards blacklist used by canStart', () => {
    const behavior = new BrushDragBehavior(makeApp());
    behavior.setFeatures({blacklist: ['other']});
    const lg = makeLayerGroup(new ViewLayer());

    assert.ok(behavior.canStart(new Point2D(0, 0), lg));

    behavior.setFeatures({blacklist: ['series-a']});
    assert.notOk(behavior.canStart(new Point2D(0, 0), lg));
  });

  test('onStart with right button fires erasingactivated', () => {
    const behavior = new BrushDragBehavior(makeApp());
    const fired = [];
    behavior.addEventListener('erasingactivated', () => fired.push(true));

    const lg = makeLayerGroup(new ViewLayer());
    behavior.onStart(
      new Point2D(5, 5),
      lg,
      {mouseDownButton: MouseEventButtons.right}
    );

    assert.equal(fired.length, 1);
    behavior.onEnd();
  });

  test('onEnd after right-button stroke fires erasingdeactivated', () => {
    const behavior = new BrushDragBehavior(makeApp());
    const events = [];
    behavior.addEventListener('erasingactivated', () => events.push('act'));
    behavior.addEventListener('erasingdeactivated', () => events.push('deact'));

    const lg = makeLayerGroup(new ViewLayer());
    behavior.onStart(
      new Point2D(5, 5),
      lg,
      {mouseDownButton: MouseEventButtons.right}
    );
    behavior.onEnd();

    assert.include(events, 'act');
    assert.include(events, 'deact');
  });
});
