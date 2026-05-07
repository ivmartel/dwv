// @vitest-environment jsdom
import {describe, test, assert, vi, afterEach} from 'vitest';

// Mock tools/index to prevent circular dependency
vi.mock('../../src/tools/index.js', () => ({
  toolList: {},
  toolOptions: {},
  defaultToolList: {},
  defaultToolOptions: {
    draw: {},
    filter: {}
  }
}));

// Mock app/application.js
vi.mock('../../src/app/application.js', () => ({
  App: class App {}
}));

// Mock magic-wand-tool
vi.mock('magic-wand-tool', () => ({
  default: {
    floodFill: vi.fn(),
    gaussBlurOnlyBorder: vi.fn(),
    traceContours: vi.fn(),
    simplifyContours: vi.fn()
  }
}));

import {LayerGroupPointer} from '../../src/tools/layerGroupPointer.js';
import {Floodfill} from '../../src/tools/floodfill.js';

/**
 * Minimal app stub for {@link Floodfill} and {@link LayerGroupPointer}.
 *
 * @returns {object} Mock application.
 */
function makeFloodfillAppMock() {
  return {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onKeydown: vi.fn(),
    getBaseScale: vi.fn(() => 1),
    getDrawLayers: vi.fn(() => []),
    getActiveLayerGroup: vi.fn()
  };
}

describe('Floodfill', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('constructs as Floodfill / LayerGroupPointer / EventTarget', () => {
    const mockApp = makeFloodfillAppMock();
    const floodfill = new Floodfill(mockApp);

    assert.ok(floodfill instanceof Floodfill);
    assert.ok(floodfill instanceof LayerGroupPointer);
    assert.ok(floodfill instanceof EventTarget);
  });

  test('drag + wheel stack handles lifecycle without throwing', () => {
    const mockApp = makeFloodfillAppMock();

    const floodfill = new Floodfill(mockApp);

    assert.doesNotThrow(() => {
      floodfill.init();
      floodfill.activate(true);
      assert.equal(mockApp.getBaseScale.mock.calls.length, 1);
      floodfill.setFeatures({shapeColour: '#FF0000'});
      floodfill.activate(false);
    });
  });

  test('keydown sets tool context and forwards to app', () => {
    const mockApp = makeFloodfillAppMock();

    const floodfill = new Floodfill(mockApp);
    const event = {key: 'Enter', clientX: 10, clientY: 20};

    floodfill.keydown(event);

    assert.equal(event.context, 'Floodfill');
    assert.equal(mockApp.onKeydown.mock.calls.length, 1);
    assert.deepEqual(mockApp.onKeydown.mock.calls[0][0], event);
  });

});
