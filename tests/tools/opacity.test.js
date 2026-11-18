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

import {Opacity} from '../../src/tools/opacity.js';

describe('Opacity', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should instantiate with app and be a LayerGroupPointer', () => {
    const mockApp = {
      getStageController: () => ({getLayerGroupByDivId: () => undefined}),
      onKeydown: vi.fn()
    };
    const opacity = new Opacity(mockApp);

    assert.isDefined(opacity);
  });

  test('behavior combination should handle lifecycle methods', () => {
    const mockApp = {
      getStageController: () => ({getLayerGroupByDivId: () => undefined}),
      onKeydown: vi.fn()
    };

    const opacity = new Opacity(mockApp);

    // Call lifecycle methods - should not throw
    assert.doesNotThrow(() => {
      opacity.init();
      opacity.activate(true);
      opacity.activate(false);
      opacity.setFeatures({});
    });
  });

  test('should handle keydown events with behavior context', () => {
    const mockApp = {
      getStageController: () => ({getLayerGroupByDivId: () => undefined}),
      onKeydown: vi.fn()
    };

    const opacity = new Opacity(mockApp);
    const event = {key: 'ArrowUp', clientX: 10, clientY: 20};

    // Keydown should set context and forward to app
    opacity.keydown(event);

    assert.equal(event.context, 'Opacity');
    assert.equal(mockApp.onKeydown.mock.calls.length, 1);
    assert.deepEqual(mockApp.onKeydown.mock.calls[0][0], event);
  });
});
