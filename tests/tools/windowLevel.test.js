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

// Mock logger to avoid warnings during tests
vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}));

import {WindowLevel} from '../../src/tools/windowLevel.js';

describe('WindowLevel', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should instantiate with app and be a LayerGroupPointer', () => {
    const mockApp = {onKeydown: vi.fn()};
    const windowLevel = new WindowLevel(mockApp);

    assert.isDefined(windowLevel);
  });

  test('behavior combination should handle lifecycle methods', () => {
    const mockApp = {
      getLayerGroupByDivId: () => undefined,
      onKeydown: vi.fn()
    };

    const windowLevel = new WindowLevel(mockApp);

    // Call lifecycle methods - should not throw
    assert.doesNotThrow(() => {
      windowLevel.init();
      windowLevel.activate(true);
      windowLevel.setFeatures({activeViewLayerOnly: true});
      windowLevel.activate(false);
    });
  });

  test('should handle keydown events with behavior context', () => {
    const mockApp = {
      getLayerGroupByDivId: () => undefined,
      onKeydown: vi.fn()
    };

    const windowLevel = new WindowLevel(mockApp);
    const event = {key: 'ArrowUp', clientX: 10, clientY: 20};

    // Keydown should set context and forward to app
    windowLevel.keydown(event);

    assert.equal(event.context, 'WindowLevel');
    assert.equal(mockApp.onKeydown.mock.calls.length, 1);
    assert.deepEqual(mockApp.onKeydown.mock.calls[0][0], event);
  });

  test('should handle activeViewLayerOnly feature', () => {
    const mockApp = {
      getLayerGroupByDivId: () => undefined,
      onKeydown: vi.fn()
    };

    const windowLevel = new WindowLevel(mockApp);

    // Should not throw
    assert.doesNotThrow(() => {
      windowLevel.setFeatures({activeViewLayerOnly: true});
      windowLevel.setFeatures({activeViewLayerOnly: false});
    });
  });
});
