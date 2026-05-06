// @vitest-environment jsdom
import {describe, test, assert, vi, afterEach} from 'vitest';

vi.mock('../../src/tools/index.js', () => ({
  toolList: {},
  toolOptions: {},
  defaultToolList: {},
  defaultToolOptions: {
    draw: {},
    filter: {}
  }
}));

vi.mock('../../src/app/application.js', () => ({
  App: class App {}
}));

vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}));

import {Livewire} from '../../src/tools/livewire.js';
import {LayerGroupPointer} from '../../src/tools/layerGroupPointer.js';

describe('Livewire', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('instantiates with app and extends LayerGroupPointer', () => {
    const mockApp = {onKeydown: vi.fn(), getBaseScale: vi.fn(() => 1)};
    const livewire = new Livewire(mockApp);

    assert.isDefined(livewire);
    assert.ok(livewire instanceof LayerGroupPointer);
    assert.ok(livewire instanceof EventTarget);
  });

  test('lifecycle methods do not throw', () => {
    const mockApp = {
      getLayerGroupByDivId: () => undefined,
      onKeydown: vi.fn(),
      getBaseScale: vi.fn(() => 1)
    };

    const livewire = new Livewire(mockApp);

    assert.doesNotThrow(() => {
      livewire.init();
      livewire.activate(true);
      livewire.setFeatures({shapeColour: '#00FF00'});
      livewire.activate(false);
    });
  });

  test('keydown sets context and forwards to app', () => {
    const mockApp = {
      getLayerGroupByDivId: () => undefined,
      onKeydown: vi.fn(),
      getBaseScale: vi.fn(() => 1)
    };

    const livewire = new Livewire(mockApp);
    const event = {key: 'Escape', clientX: 10, clientY: 20};

    livewire.keydown(event);

    assert.equal(event.context, 'Livewire');
    assert.equal(mockApp.onKeydown.mock.calls.length, 1);
    assert.deepEqual(mockApp.onKeydown.mock.calls[0][0], event);
  });

});
