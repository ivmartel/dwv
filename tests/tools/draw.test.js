// @vitest-environment jsdom
import {describe, test, assert, vi, afterEach} from 'vitest';

vi.mock('../../src/tools/index.js', () => ({
  toolList: {},
  toolOptions: {},
  defaultToolList: {},
  defaultToolOptions: {
    draw: {},
    filter: {}
  }
}));

vi.mock('../../src/app/application.js', () => ({
  App: class App {}
}));

import {Draw} from '../../src/tools/draw.js';
import {DrawDragBehavior} from '../../src/tools/behaviors/drawDragBehavior.js';
import {DrawTapBehavior} from '../../src/tools/behaviors/drawTapBehavior.js';
import {DrawShapeHandler} from '../../src/tools/shapes/drawShapeHandler.js';
import {LayerGroupPointer} from '../../src/tools/layerGroupPointer.js';
import {RectangleFactory} from '../../src/tools/shapes/rectangle.js';

/**
 * @param {object} [overrides] Override app methods.
 * @returns {object} Minimal {@link App} stub for {@link Draw}.
 */
function makeDrawApp(overrides = {}) {
  const stgCtrlKeys = ['getDrawLayers', 'getActiveLayerGroup'];
  const stgCtrlOverrides = {};
  const appOverrides = {};
  for (const [k, v] of Object.entries(overrides)) {
    if (stgCtrlKeys.includes(k)) {
      stgCtrlOverrides[k] = v;
    } else {
      appOverrides[k] = v;
    }
  }
  return {
    getStyle: vi.fn(() => ({
      setLineColour: vi.fn(),
      getLineColour: vi.fn(() => '#ffff80'),
      setZoomScale: vi.fn()
    })),
    getStageController: vi.fn(() => ({
      getDrawLayers: vi.fn(() => []),
      getActiveLayerGroup: vi.fn(),
      ...stgCtrlOverrides
    })),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onKeydown: vi.fn(),
    addToUndoStack: vi.fn((cmd) => {
      cmd.execute();
    }),
    ...appOverrides
  };
}

describe('tools/draw', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Draw extends LayerGroupPointer and EventTarget', () => {
    const draw = new Draw(makeDrawApp());
    assert.ok(draw instanceof LayerGroupPointer);
    assert.ok(draw instanceof EventTarget);
  });

  test('getEventNames, getOptionsType, init', () => {
    const draw = new Draw(makeDrawApp());
    assert.deepEqual(draw.getEventNames(), [
      'annotationupdate',
      'annotationselect',
      'warn'
    ]);
    assert.equal(draw.getOptionsType(), 'factory');
    assert.doesNotThrow(() => draw.init());
  });

  test('setOptions forwards to drag and tap behaviors', () => {
    const dragSpy = vi.spyOn(DrawDragBehavior.prototype, 'setOptions');
    const tapSpy = vi.spyOn(DrawTapBehavior.prototype, 'setOptions');
    const draw = new Draw(makeDrawApp());
    const options = {rectangle: RectangleFactory};
    draw.setOptions(options);
    assert.equal(dragSpy.mock.calls.length, 1);
    assert.equal(tapSpy.mock.calls.length, 1);
    assert.strictEqual(dragSpy.mock.calls[0][0], options);
    assert.strictEqual(tapSpy.mock.calls[0][0], options);
  });

  test('hasShape reflects options on tap behavior', () => {
    const draw = new Draw(makeDrawApp());
    assert.equal(draw.hasShape('rectangle'), false);
    draw.setOptions({rectangle: RectangleFactory});
    assert.ok(draw.hasShape('rectangle'));
  });

  test('setFeatures forwards mouseOverCursor to shape handler', () => {
    const storeSpy = vi.spyOn(
      DrawShapeHandler.prototype, 'storeMouseOverCursor');
    const draw = new Draw(makeDrawApp());
    draw.setFeatures({mouseOverCursor: 'crosshair'});
    assert.equal(storeSpy.mock.calls.length, 1);
    assert.equal(storeSpy.mock.calls[0][0], 'crosshair');
  });

  test('Escape calls resetPlacement on drag and tap behaviors', () => {
    const dragSpy = vi.spyOn(DrawDragBehavior.prototype, 'resetPlacement');
    const tapSpy = vi.spyOn(DrawTapBehavior.prototype, 'resetPlacement');
    const draw = new Draw(makeDrawApp());
    draw.keydown({key: 'Escape'});
    assert.equal(dragSpy.mock.calls.length, 1);
    assert.equal(tapSpy.mock.calls.length, 1);
  });

  test('keydown forwards to app when tap inactive', () => {
    const app = makeDrawApp();
    const draw = new Draw(app);
    const ev = {key: 'a'};
    draw.keydown(ev);
    assert.equal(ev.context, 'Draw');
    assert.equal(app.onKeydown.mock.calls.length, 1);
  });

  test('keydown does not forward to app when tap placement is active', () => {
    vi.spyOn(DrawTapBehavior.prototype, 'isActive').mockReturnValue(true);
    const app = makeDrawApp();
    const draw = new Draw(app);
    draw.keydown({key: 'x'});
    assert.equal(app.onKeydown.mock.calls.length, 0);
  });

  test('activate wires draw layers for shape handler and position listener',
    () => {
      const dl = {
        getId: vi.fn(() => 'layer-a'),
        setShapeHandler: vi.fn(),
        activateCurrentPositionShapes: vi.fn()
      };
      const app = makeDrawApp({
        getDrawLayers: vi.fn(() => [dl])
      });
      const draw = new Draw(app);
      draw.activate(true);
      assert.equal(dl.setShapeHandler.mock.calls.length, 1);
      assert.equal(dl.activateCurrentPositionShapes.mock.calls[0][0], true);
      assert.equal(app.addEventListener.mock.calls.length, 2);
      const types = app.addEventListener.mock.calls.map((c) => c[0]);
      assert.ok(types.includes('positionchange'));
      assert.ok(types.includes('drawlayeradd'));
    });

  test('activate(false) removes position listener and calls shape mouse out',
    () => {
      const mouseOutSpy = vi.spyOn(DrawShapeHandler.prototype,
        'onMouseOutShapeGroup');
      const dl = {
        getId: vi.fn(() => 'layer-b'),
        setShapeHandler: vi.fn(),
        activateCurrentPositionShapes: vi.fn()
      };
      const app = makeDrawApp({
        getDrawLayers: vi.fn(() => [dl])
      });
      const draw = new Draw(app);
      draw.activate(true);
      draw.activate(false);
      assert.equal(mouseOutSpy.mock.calls.length, 1);
      assert.ok(app.removeEventListener.mock.calls.some(
        (c) => c[0] === 'positionchange'));
    });

  test('Delete removes annotation via undo stack', () => {
    vi.spyOn(DrawShapeHandler.prototype, 'getEditorAnnotation')
      .mockReturnValue({
        trackingUid: 'ann-1'
      });
    const removeAnnotation = vi.fn();
    const drawLayer = {
      getDrawController: vi.fn(() => ({
        removeAnnotation
      }))
    };
    const app = makeDrawApp({
      getActiveLayerGroup: vi.fn(() => ({
        getActiveDrawLayer: vi.fn(() => drawLayer)
      })),
      addToUndoStack: vi.fn()
    });
    const draw = new Draw(app);
    draw.keydown({key: 'Delete'});
    assert.equal(removeAnnotation.mock.calls.length, 1);
    assert.equal(removeAnnotation.mock.calls[0][0], 'ann-1');
    assert.equal(app.addToUndoStack.mock.calls.length, 1);
  });
});
