import {vi} from 'vitest';
import {Point2D} from '../../../src/math/point.js';
import {Vector3D} from '../../../src/math/vector.js';

/**
 * Create a minimal View Controller mock.
 *
 * @returns {object} The view controller mock.
 */
export function makeMockViewController() {
  return {
    isMonochrome: vi.fn(() => true),
    getImageRescaledDataRange: vi.fn(() => ({min: 0, max: 100})),
    getWindowLevel: vi.fn(() => ({center: 50, width: 100})),
    setWindowLevel: vi.fn(),
    getPlanePositionFromPlanePoint: vi.fn(() => ({x: 10, y: 20})),
    displayToMainPlanePos: vi.fn(() => ({x: 5, y: 5})),
    getCurrentIndex: vi.fn(() => ({
      getX: vi.fn(() => 0),
      getY: vi.fn(() => 0),
      getWithNew2D: vi.fn(() => ({x: 10, y: 20}))
    })),
    getPositionFromPlanePoint: vi.fn(() => ({
      getX: vi.fn(() => 10),
      getY: vi.fn(() => 20),
      getWithNew2D: vi.fn(() => ({x: 10, y: 20}))
    })),
    getOffset3DFromPlaneOffset: vi.fn(() => (new Vector3D(0, 1, 2))),
    setCurrentPosition: vi.fn(),
    play: vi.fn()
  };
}

/**
 * Create a minimal View Layer mock.
 *
 * @param {object} [viewController] The view controller mock (optional).
 * @returns {object} The view layer mock.
 */
export function makeMockViewLayer(viewController = null) {
  const vc = viewController || makeMockViewController();
  return {
    getViewController: vi.fn(() => vc),
    displayToPlanePos: vi.fn(() => ({x: 5, y: 5})),
    displayToMainPlanePos: vi.fn(() => ({x: 5, y: 5})),
    displayToPlaneIndex: vi.fn(() => ({
      get: vi.fn((i) => i === 0 ? 10 : 20)
    })),
    displayToPlaneScale: vi.fn(() => (new Point2D(0.5, 0.5))),
    getDataId: vi.fn(() => 'test-data-id')
  };
}

/**
 * Create a minimal Layer mock.
 *
 * @returns {object} The layer mock.
 */
export function makeMockLayer() {
  return {
    getOpacity: vi.fn(() => 0.5),
    setOpacity: vi.fn(),
    getReferenceLayerId: vi.fn(() => 'test-ref-layer-id'),
    draw: vi.fn()
  };
}

/**
 * Create a minimal Position Helper mock.
 *
 * @returns {object} The position helper mock.
 */
export function makeMockPositionHelper() {
  return {
    incrementPositionAlongScroll: vi.fn(),
    decrementPositionAlongScroll: vi.fn(),
    incrementPosition: vi.fn(),
    decrementPosition: vi.fn()
  };
}

/**
 * Create a minimal Layer Group mock.
 *
 * @param {object} [viewLayer] The view layer mock (optional).
 * @param {object} [layer] The active layer mock (optional).
 * @returns {object} The layer group mock.
 */
export function makeMockLayerGroup(viewLayer = null, layer = null) {
  const posHelper = makeMockPositionHelper();
  const vl = viewLayer || makeMockViewLayer();
  return {
    getActiveViewLayer: vi.fn(() => vl),
    getActiveDrawLayer: vi.fn(() => undefined),
    getActiveLayer: vi.fn(() => layer || makeMockLayer()),
    getViewLayerById: vi.fn(() => vl),
    getViewLayersFromActive: vi.fn(() => [vl]),
    getPositionHelper: vi.fn(() => posHelper),
    canScroll: vi.fn(() => false),
    moreThanOne: vi.fn(() => false),
    addScale: vi.fn(),
    addTranslation: vi.fn(),
    draw: vi.fn(),
    showTooltip: vi.fn(),
    removeTooltipDiv: vi.fn()
  };
}

/**
 * Create a minimal App mock.
 *
 * @returns {object} The app mock.
 */
export function makeMockApp() {
  return {
    getData: vi.fn(() => ({
      image: {
        getRescaledValueAtIndex: vi.fn(() => 50)
      }
    }))
  };
}

/**
 * Create a minimal Wheel Event mock.
 *
 * @param {number} [deltaY=120] The deltaY value.
 * @param {number} [wheelDeltaY=120] The wheelDeltaY value.
 * @returns {object} The wheel event mock.
 */
export function makeMockWheelEvent(deltaY = 120, wheelDeltaY = 120) {
  return {
    deltaY,
    wheelDeltaY,
    preventDefault: vi.fn(),
    clientX: 0,
    clientY: 0
  };
}
