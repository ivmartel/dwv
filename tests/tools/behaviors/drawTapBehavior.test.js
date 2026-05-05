// @vitest-environment jsdom
import {describe, test, assert, vi, beforeEach} from 'vitest';
import {Point2D} from '../../../src/math/point.js';
import {DrawTapBehavior} from '../../../src/tools/behaviors/drawTapBehavior.js';
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
 * @returns {object} App stub for {@link DrawTapBehavior}.
 */
function makeDrawTapApp() {
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
 * @returns {object} Draw layer mock for tap tests (no hit / non-editable).
 */
function makeMinimalDrawLayer() {
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

describe('tools/behaviors/drawTapBehavior', () => {
  let app;
  let shapeHandler;
  let behavior;

  beforeEach(() => {
    app = makeDrawTapApp();
    shapeHandler = {
      disableAndResetEditor: vi.fn(),
      setEditorShape: vi.fn()
    };
    behavior = new DrawTapBehavior(app, shapeHandler);
  });

  test('DrawTapBehavior extends TapBehavior / EventTarget', () => {
    assert.ok(behavior instanceof EventTarget);
    assert.equal(typeof behavior.addEventListener, 'function');
  });

  test('hasShape reflects DrawPreview options', () => {
    assert.equal(behavior.hasShape('ruler'), false);
    behavior.setOptions({ruler: RulerFactory});
    assert.ok(behavior.hasShape('ruler'));
  });

  test('onTap dispatches warn when draw layer cannot be created', () => {
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

    behavior.onTap(new Point2D(4, 5), lg);
    assert.equal(onWarn.mock.calls.length, 1);
    assert.match(onWarn.mock.calls[0][0].detail.message, /Cannot create draw/);
  });

  test('onTap begins placement and disableAndResetEditor when allowed', () => {
    behavior.setOptions({ruler: RulerFactory});
    behavior.setFeatures({shapeName: 'ruler'});
    const lg = makeMockLayerGroup();
    lg.getActiveDrawLayer = vi.fn(() => makeMinimalDrawLayer());

    behavior.onTap(new Point2D(10, 20), lg);
    assert.equal(shapeHandler.disableAndResetEditor.mock.calls.length, 1);
    assert.ok(behavior.isActive());
  });

  test('resetPlacement clears tap session', () => {
    behavior.setOptions({ruler: RulerFactory});
    behavior.setFeatures({shapeName: 'ruler'});
    const lg = makeMockLayerGroup();
    lg.getActiveDrawLayer = vi.fn(() => makeMinimalDrawLayer());

    behavior.onTap(new Point2D(1, 2), lg);
    assert.ok(behavior.isActive());
    behavior.resetPlacement();
    assert.equal(behavior.isActive(), false);
  });

  test('onUpdate skips preview when plane point is invalid', () => {
    const vc = makeMockViewController();
    vc.validatePlanePoint = vi.fn(() => false);
    const viewLayer = makeMockViewLayer(vc);
    const lg = makeMockLayerGroup(viewLayer);
    lg.getActiveDrawLayer = vi.fn(() => makeMinimalDrawLayer());

    behavior.setOptions({ruler: RulerFactory});
    behavior.setFeatures({shapeName: 'ruler'});
    behavior.onTap(new Point2D(0, 0), lg);

    behavior.onUpdate(new Point2D(99, 88), lg);
    assert.equal(vc.validatePlanePoint.mock.calls.length, 1);
  });

  test('second tap at same coordinates does not duplicate point', () => {
    behavior.setOptions({ruler: RulerFactory});
    behavior.setFeatures({shapeName: 'ruler'});
    const lg = makeMockLayerGroup();
    lg.getActiveDrawLayer = vi.fn(() => makeMinimalDrawLayer());

    const p = new Point2D(7, 8);
    behavior.onTap(p, lg);
    behavior.onTap(p, lg);
    assert.equal(behavior.getPointList().length, 1);
  });

  test('two taps create a valid rectangle annotation end-to-end', () => {
    const {app: intApp, layerGroup, addedAnnotations, cleanup} =
      createRectangleDrawIntegrationSetup();
    try {
      const localShapeHandler = {
        disableAndResetEditor: vi.fn(),
        setEditorShape: vi.fn()
      };
      const localBehavior = new DrawTapBehavior(intApp, localShapeHandler);
      localBehavior.setOptions({rectangle: RectangleFactory});
      localBehavior.setFeatures({shapeName: 'rectangle'});
      const begin = new Point2D(8, 16);
      const end = new Point2D(72, 48);
      localBehavior.onTap(begin, layerGroup);
      localBehavior.onTap(end, layerGroup);
      assert.equal(addedAnnotations.length, 1);
      assertRectangleAnnotationOk(addedAnnotations[0], begin, end);
      assert.ok(
        /** @type {{quantification: object}} */ (addedAnnotations[0])
          .quantification);
      assert.equal(intApp.addToUndoStack.mock.calls.length, 1);
    } finally {
      cleanup();
    }
  });
});