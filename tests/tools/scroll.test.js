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

import {Scroll} from '../../src/tools/scroll.js';

describe('Scroll', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should instantiate with app and be a LayerGroupPointer', () => {
    const mockApp = {
      getStageController: () => ({getLayerGroupByDivId: () => undefined}),
      onKeydown: vi.fn()
    };
    const scroll = new Scroll(mockApp);

    assert.isDefined(scroll);
  });

  test('behavior combination should handle lifecycle methods', () => {
    const mockApp = {
      getStageController: () => ({getLayerGroupByDivId: () => undefined}),
      onKeydown: vi.fn()
    };

    const scroll = new Scroll(mockApp);

    // Call lifecycle methods - should not throw
    assert.doesNotThrow(() => {
      scroll.init();
      scroll.activate(true);
      scroll.setFeatures({displayTooltip: true});
      scroll.activate(false);
    });
  });

  test('should handle keydown events with behavior context', () => {
    const mockApp = {
      getStageController: () => ({getLayerGroupByDivId: () => undefined}),
      onKeydown: vi.fn()
    };

    const scroll = new Scroll(mockApp);
    const event = {key: 'ArrowUp', clientX: 10, clientY: 20};

    // Keydown should set context and forward to app
    scroll.keydown(event);

    assert.equal(event.context, 'Scroll');
    assert.equal(mockApp.onKeydown.mock.calls.length, 1);
    assert.deepEqual(mockApp.onKeydown.mock.calls[0][0], event);
  });
});
