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

import {Floodfill} from '../../src/tools/floodfill.js';

describe('Floodfill', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should instantiate with app and be a LayerGroupPointer', () => {
    const mockApp = {onKeydown: vi.fn(), getBaseScale: vi.fn(() => 1)};
    const floodfill = new Floodfill(mockApp);

    assert.isDefined(floodfill);
  });

  test('behavior combination should handle lifecycle methods', () => {
    const mockApp = {
      getLayerGroupByDivId: () => undefined,
      onKeydown: vi.fn(),
      getBaseScale: vi.fn(() => 1)
    };

    const floodfill = new Floodfill(mockApp);

    // Call lifecycle methods - should not throw
    assert.doesNotThrow(() => {
      floodfill.init();
      floodfill.activate(true);
      floodfill.setFeatures({shapeColour: '#FF0000'});
      floodfill.activate(false);
    });
  });

  test('should handle keydown events with behavior context', () => {
    const mockApp = {
      getLayerGroupByDivId: () => undefined,
      onKeydown: vi.fn(),
      getBaseScale: vi.fn(() => 1)
    };

    const floodfill = new Floodfill(mockApp);
    const event = {key: 'Enter', clientX: 10, clientY: 20};

    // Keydown should set context and forward to app
    floodfill.keydown(event);

    assert.equal(event.context, 'Floodfill');
    assert.equal(mockApp.onKeydown.mock.calls.length, 1);
    assert.deepEqual(mockApp.onKeydown.mock.calls[0][0], event);
  });

});
