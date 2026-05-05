// @vitest-environment jsdom
import {describe, test, assert, vi, beforeEach} from 'vitest';
import {Point2D} from '../../../src/math/point.js';
import {DrawDragBehavior} from
  '../../../src/tools/behaviors/drawDragBehavior.js';
import {RulerFactory} from '../../../src/tools/shapes/ruler.js';
import {
  assertRectangleAnnotationOk,
  createRectangleDrawIntegrationSetup,
  RectangleFactory
} from './rectangleDrawFixture.js';
import {
  makeMockLayerGroup,
  makeMockViewController,
  makeMockViewLayer
} from './utils.js';

/**
 * @returns {object} App stub for {@link DrawDragBehavior}.
 */
function makeDrawDragApp() {
  const style = {
    setLineColour: vi.fn(),
    getLineColour: vi.fn(() => '#ffffff'),
    setZoomScale: vi.fn()
  };
  return {
    getStyle: vi.fn(() => style),
    getData: vi.fn(() => ({
      image: {
        getMeta: vi.fn(() => ({})),
        isResampled: vi.fn(() => false)
      },
      annotationGroup: {
        getMeta: vi.fn(() => ({}))
      }
    }))
  };
}

/**
 * Draw layer stub: selection misses (non-editable group / no hit).
 *
 * @returns {object} Draw layer mock.
 */
function makeMinimalDrawLayerForDrag() {
  return {
    getDataId: vi.fn(() => 'draw'),
    getReferenceLayerId: vi.fn(() => 'ref-id'),
    getDrawController: vi.fn(() => ({
      getAnnotationGroup: vi.fn(() => ({
        isEditable: vi.fn(() => false)
      }))
    })),
    getKonvaStage: vi.fn(() => ({
      getIntersection: vi.fn(() => null)
    }))
  };
}

describe('tools/behaviors/drawDragBehavior', () => {
  let app;
  let shapeHandler;
  let behavior;

  beforeEach(() => {
    app = makeDrawDragApp();
    shapeHandler = {
      disableAndResetEditor: vi.fn()
    };
    behavior = new DrawDragBehavior(app, shapeHandler);
  });

  test('DrawDragBehavior extends DragBehavior / EventTarget', () => {
    assert.ok(behavior instanceof EventTarget);
    assert.equal(typeof behavior.addEventListener, 'function');
  });

  test('canStart is false until a two-point shape is configured', () => {
    assert.equal(behavior.canStart(new Point2D(0, 0), makeMockLayerGroup()),
      false);
    behavior.setOptions({ruler: RulerFactory});
    behavior.setFeatures({shapeName: 'ruler'});
    assert.equal(behavior.canStart(new Point2D(0, 0), makeMockLayerGroup()),
      true);
  });

  test('setOptions / setFeatures forward to preview', () => {
    behavior.setOptions({ruler: RulerFactory});
    behavior.setFeatures({shapeName: 'ruler'});
    assert.ok(behavior.canStart(new Point2D(0, 0), makeMockLayerGroup()));
  });

  test('onStart dispatches warn when placement cannot begin', () => {
    const onWarn = vi.fn();
    behavior.addEventListener('warn', onWarn);
    behavior.setOptions({ruler: RulerFactory});
    behavior.setFeatures({shapeName: 'ruler'});

    const lg = makeMockLayerGroup();
    lg.getActiveDrawLayer = vi.fn(() => undefined);
    lg.getBaseViewLayer = vi.fn(() => ({
      getDataId: vi.fn(() => 'bad-base')
    }));
    app.getData = vi.fn((id) => {
      if (id === 'bad-base') {
        return {
          image: {
            isResampled: vi.fn(() => true)
          }
        };
      }
      return {
        image: {
          getMeta: vi.fn(() => ({})),
          isResampled: vi.fn(() => false)
        },
        annotationGroup: {
          getMeta: vi.fn(() => ({}))
        }
      };
    });

    behavior.onStart(new Point2D(1, 2), lg);
    assert.equal(onWarn.mock.calls.length, 1);
    assert.match(onWarn.mock.calls[0][0].detail.message, /Cannot create draw/);
    assert.equal(behavior.isActive(), false);
  });

  test('onStart calls shapeHandler and activates drag when placement begins',
    () => {
      behavior.setOptions({ruler: RulerFactory});
      behavior.setFeatures({shapeName: 'ruler'});
      const lg = makeMockLayerGroup();
      lg.getActiveDrawLayer = vi.fn(() => makeMinimalDrawLayerForDrag());

      behavior.onStart(new Point2D(10, 20), lg);
      assert.equal(shapeHandler.disableAndResetEditor.mock.calls.length, 1);
      assert.equal(behavior.isActive(), true);
    });

  test('resetPlacement clears drag active state', () => {
    behavior.setOptions({ruler: RulerFactory});
    behavior.setFeatures({shapeName: 'ruler'});
    const lg = makeMockLayerGroup();
    lg.getActiveDrawLayer = vi.fn(() => makeMinimalDrawLayerForDrag());
    behavior.onStart(new Point2D(0, 0), lg);
    assert.ok(behavior.isActive());
    behavior.resetPlacement();
    assert.equal(behavior.isActive(), false);
  });

  test('onDrag skips preview when plane point is invalid', () => {
    const vc = makeMockViewController();
    vc.validatePlanePoint = vi.fn(() => false);
    const viewLayer = makeMockViewLayer(vc);
    const lg = makeMockLayerGroup(viewLayer);
    lg.getActiveDrawLayer = vi.fn(() => makeMinimalDrawLayerForDrag());
    lg.getViewLayerById = vi.fn(() => viewLayer);

    behavior.setOptions({ruler: RulerFactory});
    behavior.setFeatures({shapeName: 'ruler'});

    behavior.onStart(new Point2D(0, 0), lg);
    behavior.onUpdate(new Point2D(50, 40), lg);
    assert.equal(vc.validatePlanePoint.mock.calls.length, 1);
  });

  test('drag session creates a valid rectangle after start, move, end', () => {
    const {app: intApp, layerGroup, addedAnnotations, cleanup} =
      createRectangleDrawIntegrationSetup();
    try {
      const localShapeHandler = {
        disableAndResetEditor: vi.fn()
      };
      const localBehavior = new DrawDragBehavior(intApp, localShapeHandler);
      localBehavior.setOptions({rectangle: RectangleFactory});
      localBehavior.setFeatures({shapeName: 'rectangle'});
      const begin = new Point2D(10, 15);
      const end = new Point2D(70, 85);
      localBehavior.onStart(begin, layerGroup);
      localBehavior.onUpdate(end, layerGroup);
      localBehavior.onEnd();
      assert.equal(addedAnnotations.length, 1);
      assertRectangleAnnotationOk(addedAnnotations[0], begin, end);
      assert.ok(
        /** @type {{quantification: object}} */ (addedAnnotations[0])
          .quantification);
      assert.equal(intApp.addToUndoStack.mock.calls.length, 1);
      assert.equal(
        localShapeHandler.disableAndResetEditor.mock.calls.length, 1);
    } finally {
      cleanup();
    }
  });
});
