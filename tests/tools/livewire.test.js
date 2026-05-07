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

/**
 * Minimal app stub for {@link Livewire} and {@link LayerGroupPointer}.
 *
 * @returns {object} Mock application.
 */
function makeLivewireAppMock() {
  return {
    getLayerGroupByDivId: vi.fn(() => undefined),
    onKeydown: vi.fn(),
    getBaseScale: vi.fn(() => 1)
  };
}

describe('Livewire', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('constructs as Livewire / LayerGroupPointer / EventTarget', () => {
    const mockApp = makeLivewireAppMock();
    const livewire = new Livewire(mockApp);

    assert.ok(livewire instanceof Livewire);
    assert.ok(livewire instanceof LayerGroupPointer);
    assert.ok(livewire instanceof EventTarget);
  });

  test('tap + wheel stack handles lifecycle without throwing', () => {
    const mockApp = makeLivewireAppMock();

    const livewire = new Livewire(mockApp);

    assert.doesNotThrow(() => {
      livewire.init();
      livewire.activate(true);
      assert.equal(mockApp.getBaseScale.mock.calls.length, 1);
      livewire.setFeatures({shapeColour: '#00FF00'});
      livewire.activate(false);
    });
  });

  test('keydown sets tool context and forwards to app', () => {
    const mockApp = makeLivewireAppMock();

    const livewire = new Livewire(mockApp);
    const event = {key: 'Escape', clientX: 10, clientY: 20};

    livewire.keydown(event);

    assert.equal(event.context, 'Livewire');
    assert.equal(mockApp.onKeydown.mock.calls.length, 1);
    assert.deepEqual(mockApp.onKeydown.mock.calls[0][0], event);
  });

});
