// @vitest-environment jsdom
import {describe, test, assert, vi, afterEach, beforeEach} from 'vitest';
import {Point2D} from '../../../src/math/point.js';
import {DrawPreview} from '../../../src/tools/behaviors/drawPreview.js';
import {RulerFactory} from '../../../src/tools/shapes/ruler.js';
import {RectangleFactory} from '../../../src/tools/shapes/rectangle.js';
import {
  assertRectangleAnnotationOk,
  createRectangleDrawIntegrationSetup
} from './rectangleDrawFixture.js';
import {makeMockLayerGroup, makeMockViewLayer} from './utils.js';
import * as loggerModule from '../../../src/utils/logger.js';

/**
 * @returns {object} Minimal app stub for {@link DrawPreview}.
 */
function makeDrawPreviewApp() {
  const style = {
    setLineColour: vi.fn(),
    getLineColour: vi.fn(() => '#ffffff'),
    setZoomScale: vi.fn()
  };
  return {
    getStyle: vi.fn(() => style),
    getDataController: vi.fn(() => ({
      get: vi.fn((dataId) => ({
        image: {
          getMeta: vi.fn(() => ({})),
          isResampled: vi.fn(() => false)
        },
        annotationGroup: {
          getMeta: vi.fn(() => ({}))
        },
        dataId
      }))
    }))
  };
}

describe('tools/behaviors/drawPreview', () => {
  let app;
  let preview;

  beforeEach(() => {
    app = makeDrawPreviewApp();
    preview = new DrawPreview(app);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('hasShape is false before setOptions', () => {
    assert.equal(preview.hasShape('ruler'), false);
  });

  test('setOptions and setFeatures register shape and getNPoints', () => {
    preview.setOptions({ruler: RulerFactory});
    assert.ok(preview.hasShape('ruler'));
    preview.setFeatures({shapeName: 'ruler'});
    assert.equal(preview.getNPoints(), 2);
  });

  test('setFeatures throws for unknown shape name', () => {
    preview.setOptions({ruler: RulerFactory});
    assert.throws(() => {
      preview.setFeatures({shapeName: 'unknown'});
    }, /Unknown shape/);
  });

  test('tryBeginPlacement returns false when shape is not configured', () => {
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});
    const lg = makeMockLayerGroup();
    lg.getActiveDrawLayer = vi.fn(() => ({
      getDataId: vi.fn(() => 'draw-1')
    }));
    preview.setOptions({ruler: RulerFactory});
    assert.equal(preview.tryBeginPlacement(lg), false);
    assert.equal(warnSpy.mock.calls.length, 1, 'warning on trybegin');
  });

  test('tryBeginPlacement returns true when draw layer exists and shape is set',
    () => {
      const lg = makeMockLayerGroup();
      lg.getActiveDrawLayer = vi.fn(() => ({
        getDataId: vi.fn(() => 'draw-1')
      }));
      preview.setOptions({ruler: RulerFactory});
      preview.setFeatures({shapeName: 'ruler'});
      assert.equal(preview.tryBeginPlacement(lg), true);
    });

  test('getCannotCreateReason mentions base data when base image is resampled',
    () => {
      app.getDataController = vi.fn(() => ({
        get: vi.fn((id) => {
          if (id === 'base-data') {
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
            }
          };
        })
      }));
      const baseViewLayer = {getDataId: vi.fn(() => 'base-data')};
      const refViewLayer = makeMockViewLayer();
      const lg = {
        ...makeMockLayerGroup(refViewLayer),
        getBaseViewLayer: vi.fn(() => baseViewLayer)
      };
      const reason = preview.getCannotCreateReason(lg);
      assert.match(reason, /base data/i);
    });

  test('getCannotCreateReason mentions reference when ref validator fails',
    () => {
      preview.setFeatures({
        refMetaValidator: () => false
      });
      const lg = {
        ...makeMockLayerGroup(),
        getBaseViewLayer: vi.fn(() => ({
          getDataId: vi.fn(() => 'base-data')
        }))
      };
      const reason = preview.getCannotCreateReason(lg);
      assert.match(reason, /reference/i);
    });

  test('resetPlacement does not throw when no preview exists', () => {
    preview.resetPlacement();
    assert.ok(true);
  });

  test('RectangleFactory registers via setOptions', () => {
    preview.setOptions({rectangle: RectangleFactory});
    assert.ok(preview.hasShape('rectangle'));
  });

  test('onFinalPoints creates a valid rectangle annotation end-to-end', () => {
    const {app: intApp, layerGroup, addedAnnotations, cleanup} =
      createRectangleDrawIntegrationSetup();
    try {
      const localPreview = new DrawPreview(intApp);
      localPreview.setOptions({rectangle: RectangleFactory});
      localPreview.setFeatures({shapeName: 'rectangle'});
      const begin = new Point2D(12, 24);
      const end = new Point2D(88, 96);
      localPreview.onFinalPoints([begin, end], layerGroup);
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
