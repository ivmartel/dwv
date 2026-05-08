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

import {Brush} from '../../src/tools/brush.js';
import {BrushMode} from '../../src/tools/behaviors/brushMaskPaint.js';
import {BrushDragBehavior} from
  '../../src/tools/behaviors/brushDragBehavior.js';

describe('Brush', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  test('exposes expected tool events, help, and init', () => {
    const app = {
      onKeydown: vi.fn(),
      getDataViewConfigs: () => ({})
    };
    const brush = new Brush(app);

    assert.deepEqual(brush.getEventNames(), [
      'brushdraw',
      'brushremove',
      'brushsizechange',
      'erasingactivated',
      'erasingdeactivated'
    ]);
    assert.doesNotThrow(() => brush.init());
  });

  test('keydown forwards to app with Brush context', () => {
    const app = {
      onKeydown: vi.fn(),
      getDataViewConfigs: () => ({})
    };
    const brush = new Brush(app);
    const event = {key: 'Escape', ctrlKey: false, altKey: false};

    brush.keydown(event);

    assert.equal(event.context, 'Brush');
    assert.equal(app.onKeydown.mock.calls.length, 1);
  });

  test('keydown adjusts brush size and mode via BrushDragBehavior', () => {
    const setFeaturesSpy = vi.spyOn(BrushDragBehavior.prototype, 'setFeatures');
    const app = {
      onKeydown: vi.fn(),
      getDataViewConfigs: () => ({})
    };
    const brush = new Brush(app);

    brush.keydown({key: '+', ctrlKey: false, altKey: false});
    assert.ok(setFeaturesSpy.mock.calls.some((c) => c[0].brushSizeAdd === 1));

    brush.keydown({key: '-', ctrlKey: false, altKey: false});
    assert.ok(setFeaturesSpy.mock.calls.some((c) => c[0].brushSizeAdd === -1));

    brush.keydown({key: 'a', ctrlKey: false, altKey: false});
    assert.ok(setFeaturesSpy.mock.calls.some(
      (c) => c[0].brushMode === BrushMode.Add
    ));

    brush.keydown({key: 'd', ctrlKey: false, altKey: false});
    assert.ok(setFeaturesSpy.mock.calls.some(
      (c) => c[0].brushMode === BrushMode.Del
    ));

    const callsBefore = setFeaturesSpy.mock.calls.length;
    brush.keydown({key: '+', ctrlKey: true, altKey: false});
    assert.equal(setFeaturesSpy.mock.calls.length, callsBefore);
  });

  test('activate(true) prevents default contextmenu on configured divs', () => {
    const div = document.createElement('div');
    div.id = 'brush-view-test';
    document.body.appendChild(div);

    const app = {
      onKeydown: vi.fn(),
      getDataViewConfigs: () => ({
        group0: [{divId: 'brush-view-test'}]
      })
    };
    const brush = new Brush(app);
    brush.activate(true);

    const ev = new MouseEvent('contextmenu', {bubbles: true, cancelable: true});
    div.dispatchEvent(ev);

    assert.ok(ev.defaultPrevented);
  });

  test('setFeatures forwards to brush drag behavior', () => {
    const setFeaturesSpy = vi.spyOn(BrushDragBehavior.prototype, 'setFeatures');
    const app = {
      onKeydown: vi.fn(),
      getDataViewConfigs: () => ({})
    };
    const brush = new Brush(app);

    brush.setFeatures({brushSize: 12});

    assert.ok(setFeaturesSpy.mock.calls.some((c) => c[0].brushSize === 12));
  });
});
