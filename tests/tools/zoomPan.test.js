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

import {ZoomAndPan} from '../../src/tools/zoomPan.js';

describe('ZoomAndPan', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should instantiate with app and be a LayerGroupPointer', () => {
    const mockApp = {
      getStageController: () => ({getLayerGroupByDivId: () => undefined}),
      onKeydown: vi.fn()
    };
    const zoomPan = new ZoomAndPan(mockApp);

    assert.isDefined(zoomPan);
  });

  test('behavior combination should handle lifecycle methods', () => {
    const mockApp = {
      getStageController: () => ({getLayerGroupByDivId: () => undefined}),
      onKeydown: vi.fn()
    };

    const zoomPan = new ZoomAndPan(mockApp);

    // Call lifecycle methods - should not throw
    assert.doesNotThrow(() => {
      zoomPan.init();
      zoomPan.activate(true);
      zoomPan.setFeatures({});
      zoomPan.activate(false);
    });
  });

  test('should handle keydown events with behavior context', () => {
    const mockApp = {
      getStageController: () => ({getLayerGroupByDivId: () => undefined}),
      onKeydown: vi.fn()
    };

    const zoomPan = new ZoomAndPan(mockApp);
    const event = {key: 'ArrowUp', clientX: 10, clientY: 20};

    // Keydown should set context and forward to app
    zoomPan.keydown(event);

    assert.equal(event.context, 'ZoomAndPan');
    assert.equal(mockApp.onKeydown.mock.calls.length, 1);
    assert.deepEqual(mockApp.onKeydown.mock.calls[0][0], event);
  });

  test('should call cancel when deactivated', () => {
    const mockApp = {
      getStageController: () => ({getLayerGroupByDivId: () => undefined}),
      onKeydown: vi.fn()
    };

    const zoomPan = new ZoomAndPan(mockApp);
    const cancelSpy = vi.spyOn(zoomPan, 'cancel').mockImplementation(() => {});

    zoomPan.activate(false);

    assert.equal(cancelSpy.mock.calls.length, 1);
    cancelSpy.mockRestore();
  });
});
