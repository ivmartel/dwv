// @vitest-environment jsdom
import {describe, test, assert, vi, beforeEach, afterEach} from 'vitest';

// Import chain hits `tools/index` → tool `windowLevel` → `layerGroupPointer`
// before export completes.
vi.mock('../../src/tools/index.js', () => ({
  toolList: {},
  toolOptions: {},
  defaultToolList: {},
  defaultToolOptions: {
    draw: {},
    filter: {}
  }
}));

// `behaviors/doubleClickBehavior.js` imports `app/application.js` (same graph).
vi.mock('../../src/app/application.js', () => ({
  App: class App {}
}));

import {Point2D} from '../../src/math/point.js';
import {LayerGroupPointer} from '../../src/tools/layerGroupPointer.js';
import {DragBehavior} from '../../src/tools/behaviors/dragBehavior.js';
import {TwoTouchBehavior} from '../../src/tools/behaviors/twoTouchBehavior.js';
import * as generic from '../../src/gui/generic.js';

/**
 * Minimal layer DOM: canvas inside `.layer` div
 * (see {@link getLayerDetailsFromEvent}).
 *
 * @param {string} groupDivId Layer group id (e.g. `layerGroup0`).
 * @returns {{canvas: HTMLCanvasElement, groupDivId: string}} Canvas and id.
 */
function setupLayerCanvas(groupDivId = 'layerGroupPtrTest') {
  const layer = document.createElement('div');
  layer.className = 'layer';
  layer.id = `${groupDivId}-layer-0`;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  layer.appendChild(canvas);
  document.body.appendChild(layer);
  return {canvas, groupDivId};
}

/**
 * @param {string} type The DOM event type.
 * @param {EventTarget} target The event target node.
 * @param {number} offsetX Horizontal offset on the target.
 * @param {number} offsetY Vertical offset on the target.
 * @returns {MouseEvent} Synthetic mouse event for tests.
 */
function mouseEvent(type, target, offsetX, offsetY) {
  const ev = new MouseEvent(type, {bubbles: true, cancelable: true});
  Object.defineProperty(ev, 'target', {value: target, enumerable: true});
  Object.defineProperty(ev, 'offsetX', {value: offsetX});
  Object.defineProperty(ev, 'offsetY', {value: offsetY});
  return ev;
}

/**
 * @param {string} type Touch event type.
 * @param {EventTarget} target Usually the canvas under `.layer`.
 * @returns {TouchEvent} Synthetic touch event for tests.
 */
function touchEvent(type, target) {
  const ev = new TouchEvent(type, {bubbles: true, cancelable: true});
  Object.defineProperty(ev, 'target', {value: target, enumerable: true});
  return ev;
}

/**
 * @param {EventTarget} target The event target, usually the canvas under a
 *   `.layer` div.
 * @param {object} [opts] Optional deltaY and wheelDeltaY for tick shaping.
 * @returns {WheelEvent} Synthetic wheel event for tests.
 */
function wheelEvent(target, opts = {}) {
  const deltaY = opts.deltaY ?? 0;
  const {wheelDeltaY} = opts;
  const ev = new WheelEvent('wheel', {bubbles: true, cancelable: true, deltaY});
  Object.defineProperty(ev, 'target', {value: target, enumerable: true});
  if (typeof wheelDeltaY === 'number') {
    Object.defineProperty(ev, 'wheelDeltaY', {value: wheelDeltaY});
  }
  return ev;
}

describe('tools/layerGroupPointer', () => {
  let getTouchPointsSpy;

  beforeEach(() => {
    getTouchPointsSpy = vi.spyOn(generic, 'getTouchPoints');
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  test('LayerGroupPointer extends EventTarget', () => {
    const pointer = new LayerGroupPointer({
      app: {getLayerGroupByDivId: () => ({})},
      dragBehavior: new DragBehavior()
    });
    assert.ok(pointer instanceof EventTarget);
    assert.equal(typeof pointer.addEventListener, 'function');
    assert.equal(typeof pointer.dispatchEvent, 'function');
  });

  test('mousedown starts drag when canStart; mousemove updates drag', () => {
    const {canvas, groupDivId} = setupLayerCanvas();
    const layerGroup = {};
    const onStart = vi.fn();
    const onUpdate = vi.fn();
    const onEnd = vi.fn();

    class T extends DragBehavior {
      onStart(p, lg) {
        onStart(p, lg);
        super.onStart(p, lg);
      }
      onUpdate(p, lg) {
        onUpdate(p, lg);
        super.onUpdate(p, lg);
      }
      onEnd() {
        onEnd();
        super.onEnd();
      }
    }

    const drag = new T();
    const pointer = new LayerGroupPointer({
      app: {
        getLayerGroupByDivId: (id) =>
          (id === groupDivId ? layerGroup : undefined)
      },
      dragBehavior: drag
    });

    pointer.mousedown(mouseEvent('mousedown', canvas, 4, 5));
    assert.equal(onStart.mock.calls.length, 1);
    assert.ok(drag.isActive());

    pointer.mousemove(mouseEvent('mousemove', canvas, 10, 12));
    assert.equal(onUpdate.mock.calls.length, 1);

    pointer.mouseup(mouseEvent('mouseup', canvas, 10, 12));
    assert.equal(onEnd.mock.calls.length, 1);
    assert.equal(drag.isActive(), false);
  });

  test('mouseout ends active drag and calls hoverBehavior.onEnd', () => {
    const {canvas, groupDivId} = setupLayerCanvas();
    const onDragEnd = vi.fn();
    const onHoverEnd = vi.fn();

    class T extends DragBehavior {
      onEnd() {
        onDragEnd();
        super.onEnd();
      }
    }

    const drag = new T();
    const pointer = new LayerGroupPointer({
      app: {
        getLayerGroupByDivId: (id) =>
          (id === groupDivId ? {} : undefined)
      },
      dragBehavior: drag,
      hoverBehavior: {
        onUpdate: vi.fn(),
        onEnd: onHoverEnd
      }
    });

    pointer.mousedown(mouseEvent('mousedown', canvas, 2, 3));
    assert.ok(drag.isActive());

    pointer.mouseout(new MouseEvent('mouseout', {bubbles: true}));
    assert.equal(onDragEnd.mock.calls.length, 1);
    assert.equal(onHoverEnd.mock.calls.length, 1);
    assert.equal(drag.isActive(), false);
  });

  test('mouseout calls hoverBehavior.onEnd when drag is inactive', () => {
    const {groupDivId} = setupLayerCanvas();
    const onHoverEnd = vi.fn();
    const drag = new DragBehavior();
    const pointer = new LayerGroupPointer({
      app: {
        getLayerGroupByDivId: (id) =>
          (id === groupDivId ? {} : undefined)
      },
      dragBehavior: drag,
      hoverBehavior: {
        onUpdate: vi.fn(),
        onEnd: onHoverEnd
      }
    });

    pointer.mouseout(new MouseEvent('mouseout', {bubbles: true}));
    assert.equal(onHoverEnd.mock.calls.length, 1);
    assert.equal(drag.isActive(), false);
  });

  test('mouseout calls tapBehavior.cancel when tap is active', () => {
    const {groupDivId} = setupLayerCanvas();
    const onTapCancel = vi.fn();
    const tap = {
      isActive: () => true,
      onTap() {
        // no-op
      },
      onUpdate() {
        // no-op
      },
      onEnd: onTapCancel
    };
    const pointer = new LayerGroupPointer({
      app: {
        getLayerGroupByDivId: (id) =>
          (id === groupDivId ? {} : undefined)
      },
      tapBehavior: tap
    });

    pointer.mouseout(new MouseEvent('mouseout', {bubbles: true}));
    assert.equal(onTapCancel.mock.calls.length, 1);
  });

  test('touchstart, touchmove, touchend drive drag lifecycle', () => {
    vi.useFakeTimers();
    const {canvas, groupDivId} = setupLayerCanvas();
    getTouchPointsSpy.mockReturnValue([new Point2D(4, 5)]);
    const onStart = vi.fn();
    const onUpdate = vi.fn();
    const onEnd = vi.fn();

    class T extends DragBehavior {
      onStart(p, lg) {
        onStart(p, lg);
        super.onStart(p, lg);
      }
      onUpdate(p, lg) {
        onUpdate(p, lg);
        super.onUpdate(p, lg);
      }
      onEnd() {
        onEnd();
        super.onEnd();
      }
    }

    const drag = new T();
    const pointer = new LayerGroupPointer({
      app: {
        getLayerGroupByDivId: (id) =>
          (id === groupDivId ? {} : undefined)
      },
      dragBehavior: drag,
      longTouchToDblClickMs: 500
    });

    pointer.touchstart(touchEvent('touchstart', canvas));
    assert.equal(onStart.mock.calls.length, 1);
    assert.ok(drag.isActive());

    getTouchPointsSpy.mockReturnValue([new Point2D(10, 12)]);
    pointer.touchmove(touchEvent('touchmove', canvas));
    assert.equal(onUpdate.mock.calls.length, 1);

    pointer.touchend(touchEvent('touchend', canvas));
    assert.equal(onEnd.mock.calls.length, 1);
    assert.equal(drag.isActive(), false);

    vi.advanceTimersByTime(600);
    vi.useRealTimers();
  });

  test('two-touch events drive TwoTouchBehavior lifecycle', () => {
    const {canvas, groupDivId} = setupLayerCanvas();
    const layerGroup = {};
    const p1 = new Point2D(1, 2);
    const p2 = new Point2D(3, 4);
    const p1m = new Point2D(5, 6);
    const p2m = new Point2D(7, 8);

    const onStart = vi.fn();
    const onUpdate = vi.fn();
    const onEnd = vi.fn();

    class T extends TwoTouchBehavior {
      #active = false;
      isActive() {
        return this.#active;
      }
      onStart(points) {
        onStart(points);
        this.#active = true;
      }
      onUpdate(points, lg) {
        onUpdate(points, lg);
        return true;
      }
      onEnd() {
        onEnd();
        this.#active = false;
      }
    }

    const twoTouch = new T();
    const pointer = new LayerGroupPointer({
      app: {
        getLayerGroupByDivId: (id) =>
          (id === groupDivId ? layerGroup : undefined)
      },
      dragBehavior: new DragBehavior(),
      twoTouchBehavior: twoTouch
    });

    getTouchPointsSpy.mockReturnValue([p1, p2]);
    pointer.touchstart(touchEvent('touchstart', canvas));
    assert.equal(onStart.mock.calls.length, 1);
    assert.deepEqual(onStart.mock.calls[0][0], [p1, p2]);
    assert.ok(twoTouch.isActive());

    getTouchPointsSpy.mockReturnValue([p1m, p2m]);
    pointer.touchmove(touchEvent('touchmove', canvas));
    assert.equal(onUpdate.mock.calls.length, 1);
    assert.deepEqual(onUpdate.mock.calls[0][0], [p1m, p2m]);
    assert.equal(onUpdate.mock.calls[0][1], layerGroup);

    pointer.touchend(touchEvent('touchend', canvas));
    assert.equal(onEnd.mock.calls.length, 1);
    assert.equal(twoTouch.isActive(), false);
  });

  test('cancel ends active TwoTouchBehavior', () => {
    const {canvas, groupDivId} = setupLayerCanvas();
    getTouchPointsSpy.mockReturnValue([
      new Point2D(0, 0),
      new Point2D(10, 10)
    ]);
    const reset = vi.fn();

    class T extends TwoTouchBehavior {
      #active = false;
      isActive() {
        return this.#active;
      }
      onStart() {
        this.#active = true;
      }
      reset() {
        this.#active = false;
        reset();
      }
      onEnd() {
        this.reset();
      }
    }

    const twoTouch = new T();
    const pointer = new LayerGroupPointer({
      app: {
        getLayerGroupByDivId: (id) =>
          (id === groupDivId ? {} : undefined)
      },
      dragBehavior: new DragBehavior(),
      twoTouchBehavior: twoTouch
    });

    pointer.touchstart(touchEvent('touchstart', canvas));
    assert.ok(twoTouch.isActive());

    pointer.cancel();
    assert.equal(reset.mock.calls.length, 1);
    assert.equal(twoTouch.isActive(), false);
  });

  test('mousedown does not start drag when canStart returns false', () => {
    const {canvas} = setupLayerCanvas();
    const onStart = vi.fn();

    class NoDrag extends DragBehavior {
      canStart() {
        return false;
      }
      onStart(p, lg) {
        onStart(p, lg);
        super.onStart(p, lg);
      }
    }

    const drag = new NoDrag();
    const pointer = new LayerGroupPointer({
      app: {getLayerGroupByDivId: () => ({})},
      dragBehavior: drag
    });

    pointer.mousedown(mouseEvent('mousedown', canvas, 1, 1));
    assert.equal(onStart.mock.calls.length, 0);
    assert.equal(drag.isActive(), false);
  });

  test('undefined dragBehavior skips drag; hover and tap still work', () => {
    const {canvas, groupDivId} = setupLayerCanvas();
    const onHoverUpdate = vi.fn();
    const onHoverEnd = vi.fn();
    const onTap = vi.fn();

    const pointer = new LayerGroupPointer({
      app: {
        getLayerGroupByDivId: (id) =>
          (id === groupDivId ? {} : undefined)
      },
      dragBehavior: undefined,
      hoverBehavior: {
        reset() {},
        onUpdate: onHoverUpdate,
        onEnd: onHoverEnd
      },
      tapBehavior: {
        onTap,
        isActive() {
          return false;
        },
        onUpdate() {
          // no-op
        },
        cancel() {
          // no-op
        }
      }
    });

    pointer.mousemove(mouseEvent('mousemove', canvas, 1, 1));
    assert.equal(onHoverUpdate.mock.calls.length, 1);

    pointer.mousedown(mouseEvent('mousedown', canvas, 1, 1));
    pointer.mousemove(mouseEvent('mousemove', canvas, 2, 2));
    assert.equal(onHoverUpdate.mock.calls.length, 1);
    assert.equal(onHoverEnd.mock.calls.length, 1);

    pointer.mouseup(mouseEvent('mouseup', canvas, 2, 2));

    pointer.mousedown(mouseEvent('mousedown', canvas, 0, 0));
    pointer.mouseup(mouseEvent('mouseup', canvas, 0, 0));
    assert.equal(onTap.mock.calls.length, 1);

    pointer.mouseout(new MouseEvent('mouseout', {bubbles: true}));
    assert.equal(onHoverEnd.mock.calls.length, 2);

    pointer.cancel();
  });

  test('mousemove calls hoverBehavior.onUpdate when drag is inactive', () => {
    const {canvas, groupDivId} = setupLayerCanvas();
    const onHoverUpdate = vi.fn();
    const pointer = new LayerGroupPointer({
      app: {
        getLayerGroupByDivId: (id) =>
          (id === groupDivId ? {} : undefined)
      },
      dragBehavior: new DragBehavior(),
      hoverBehavior: {
        onUpdate: onHoverUpdate,
        onEnd: vi.fn()
      }
    });

    pointer.mousemove(mouseEvent('mousemove', canvas, 7, 8));
    assert.equal(onHoverUpdate.mock.calls.length, 1);
  });

  test('wheel calls onWheel, preventDefault, and onWheelTick on tick', () => {
    const {canvas, groupDivId} = setupLayerCanvas();
    const layerGroup = {};
    const onWheel = vi.fn();
    const onWheelTick = vi.fn();
    const pointer = new LayerGroupPointer({
      app: {
        getLayerGroupByDivId: (id) =>
          (id === groupDivId ? layerGroup : undefined)
      },
      dragBehavior: new DragBehavior(),
      wheelBehavior: {onWheel, onWheelTick}
    });

    const ev = wheelEvent(canvas, {wheelDeltaY: 120});
    pointer.wheel(ev);
    assert.ok(ev.defaultPrevented);
    assert.equal(onWheel.mock.calls.length, 1);
    assert.equal(onWheel.mock.calls[0][0], ev);
    assert.equal(onWheel.mock.calls[0][1], layerGroup);
    assert.equal(onWheelTick.mock.calls.length, 1);
    assert.equal(onWheelTick.mock.calls[0][0], true);
    assert.equal(onWheelTick.mock.calls[0][1], layerGroup);
  });

  test('wheel without wheelBehavior does not prevent default', () => {
    const {canvas, groupDivId} = setupLayerCanvas();
    const pointer = new LayerGroupPointer({
      app: {
        getLayerGroupByDivId: (id) =>
          (id === groupDivId ? {} : undefined)
      },
      dragBehavior: new DragBehavior()
    });

    const ev = wheelEvent(canvas, {wheelDeltaY: 120});
    pointer.wheel(ev);
    assert.equal(ev.defaultPrevented, false);
  });

  test('wheel onWheel each move; onWheelTick when tick threshold met', () => {
    const {canvas, groupDivId} = setupLayerCanvas();
    const onWheel = vi.fn();
    const onWheelTick = vi.fn();
    const pointer = new LayerGroupPointer({
      app: {
        getLayerGroupByDivId: (id) =>
          (id === groupDivId ? {} : undefined)
      },
      dragBehavior: new DragBehavior(),
      wheelBehavior: {onWheel, onWheelTick}
    });

    pointer.wheel(wheelEvent(canvas, {deltaY: 0.5}));
    assert.equal(onWheel.mock.calls.length, 1);
    assert.equal(onWheelTick.mock.calls.length, 0);

    pointer.wheel(wheelEvent(canvas, {deltaY: 0.5}));
    assert.equal(onWheel.mock.calls.length, 2);
    assert.equal(onWheelTick.mock.calls.length, 1);
    assert.equal(onWheelTick.mock.calls[0][0], false);
  });

  test('mouseup invokes tap when there was no move', () => {
    const {canvas, groupDivId} = setupLayerCanvas();
    const onTap = vi.fn();
    class NoStartDrag extends DragBehavior {
      canStart() {
        return false;
      }
    }
    const pointer = new LayerGroupPointer({
      app: {getLayerGroupByDivId: (id) => (id === groupDivId ? {} : undefined)},
      dragBehavior: new NoStartDrag(),
      tapBehavior: {
        onTap,
        isActive() {
          return false;
        },
        onUpdate() {
          // no-op
        },
        cancel() {
          // no-op
        }
      }
    });

    pointer.mousedown(mouseEvent('mousedown', canvas, 2, 3));
    pointer.mouseup(mouseEvent('mouseup', canvas, 2, 3));
    assert.equal(onTap.mock.calls.length, 1);
  });

  test('mouseup does not end active drag if pointer did not move', () => {
    const {canvas, groupDivId} = setupLayerCanvas();
    const onEnd = vi.fn();
    class T extends DragBehavior {
      onEnd() {
        onEnd();
        super.onEnd();
      }
    }
    const drag = new T();
    const pointer = new LayerGroupPointer({
      app: {getLayerGroupByDivId: (id) => (id === groupDivId ? {} : undefined)},
      dragBehavior: drag
    });

    pointer.mousedown(mouseEvent('mousedown', canvas, 1, 1));
    assert.ok(drag.isActive());

    pointer.mouseup(mouseEvent('mouseup', canvas, 1, 1));
    assert.equal(onEnd.mock.calls.length, 0);
    assert.equal(drag.isActive(), true);
  });

  test('mouseup does not tap after mousemove', () => {
    const {canvas, groupDivId} = setupLayerCanvas();
    const onTap = vi.fn();
    const pointer = new LayerGroupPointer({
      app: {getLayerGroupByDivId: (id) => (id === groupDivId ? {} : undefined)},
      dragBehavior: new DragBehavior(),
      tapBehavior: {
        onTap,
        isActive() {
          return false;
        },
        onUpdate() {
          // no-op
        },
        cancel() {
          // no-op
        }
      }
    });

    pointer.mousedown(mouseEvent('mousedown', canvas, 0, 0));
    pointer.mousemove(mouseEvent('mousemove', canvas, 1, 1));
    pointer.mouseup(mouseEvent('mouseup', canvas, 1, 1));
    assert.equal(onTap.mock.calls.length, 0);
  });

  test('mouseup invokes tap when tap is active even after mousemove', () => {
    const {canvas, groupDivId} = setupLayerCanvas();
    const onTap = vi.fn();
    class NoStartDrag extends DragBehavior {
      canStart() {
        return false;
      }
    }
    const pointer = new LayerGroupPointer({
      app: {getLayerGroupByDivId: (id) => (id === groupDivId ? {} : undefined)},
      dragBehavior: new NoStartDrag(),
      tapBehavior: {
        onTap,
        isActive() {
          return true;
        },
        onUpdate() {
          // no-op
        },
        cancel() {
          // no-op
        }
      }
    });

    pointer.mousedown(mouseEvent('mousedown', canvas, 0, 0));
    pointer.mousemove(mouseEvent('mousemove', canvas, 4, 4));
    pointer.mouseup(mouseEvent('mouseup', canvas, 4, 4));
    assert.equal(onTap.mock.calls.length, 1);
  });

  test('cancel clears long-touch timer', () => {
    vi.useFakeTimers();
    const {canvas} = setupLayerCanvas();
    getTouchPointsSpy.mockReturnValue([new Point2D(1, 1)]);
    const reset = vi.fn();
    class T extends DragBehavior {
      reset() {
        reset();
        super.reset();
      }
    }
    const drag = new T();
    const pointer = new LayerGroupPointer({
      app: {getLayerGroupByDivId: () => ({})},
      dragBehavior: drag
    });

    pointer.mousedown(mouseEvent('mousedown', canvas, 0, 0));
    assert.ok(drag.isActive());

    pointer.touchstart(touchEvent('touchstart', canvas));
    pointer.cancel();
    assert.equal(reset.mock.calls.length, 1);
    assert.equal(drag.isActive(), false);

    vi.advanceTimersByTime(600);
    vi.useRealTimers();
  });

  test('touchstart schedules dblclick after default delay', () => {
    vi.useFakeTimers();
    const {canvas} = setupLayerCanvas();
    getTouchPointsSpy.mockReturnValue([new Point2D(1, 1)]);
    const onDoubleClick = vi.fn();
    const pointer = new LayerGroupPointer({
      app: {getLayerGroupByDivId: () => ({})},
      dragBehavior: new DragBehavior(),
      doubleClickBehavior: {onDoubleClick}
    });

    pointer.touchstart(touchEvent('touchstart', canvas));
    vi.advanceTimersByTime(499);
    assert.equal(onDoubleClick.mock.calls.length, 0);
    vi.advanceTimersByTime(2);
    assert.equal(onDoubleClick.mock.calls.length, 1);
    vi.useRealTimers();
  });

  test('touchmove clears long-touch dblclick timer', () => {
    vi.useFakeTimers();
    const {canvas} = setupLayerCanvas();
    getTouchPointsSpy.mockReturnValue([new Point2D(1, 1)]);
    const onDoubleClick = vi.fn();
    const pointer = new LayerGroupPointer({
      app: {getLayerGroupByDivId: () => ({})},
      dragBehavior: new DragBehavior(),
      doubleClickBehavior: {onDoubleClick}
    });

    pointer.touchstart(touchEvent('touchstart', canvas));
    pointer.touchmove(touchEvent('touchmove', canvas));
    vi.advanceTimersByTime(600);
    assert.equal(onDoubleClick.mock.calls.length, 0);
    vi.useRealTimers();
  });
});
