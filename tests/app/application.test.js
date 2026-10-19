// @vitest-environment jsdom
import {describe, test, assert, vi, afterEach} from 'vitest';
import {App} from '../../src/app/application.js';
import {ImageFactory} from '../../src/image/imageFactory.js';
import {binderList} from '../../src/gui/binders.js';
import {Point} from '../../src/math/point.js';
import {
  dataStructures,
  getStructureBuffers
} from '../../dev/dicom/dataStructures.js';

import syntheticImgData from '/tests/data/synthetic-img.json';

/**
 * Tests for the 'app/application.js' file.
 */

describe('app', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Tests for {@link App} load with a data creation error.
   *
   * @function module:tests/app~appLoadDataCreationError
   */
  test('App load stops at data creation error', () => {
    // image creation fails, as for an unsupported geometry
    vi.spyOn(ImageFactory.prototype, 'create').mockImplementation(() => {
      throw new Error('Unsupported geometry');
    });

    const app = new App();
    app.init({});

    const events = [];
    for (const type of ['loaditem', 'error', 'abort', 'load', 'loadend']) {
      app.addEventListener(type, () => {
        events.push(type);
      });
    }

    // uncompressed multi-frame: frames are sent synchronously
    const buffer = getStructureBuffers(
      syntheticImgData[0],
      '1.2.840.10008.1.2.1',
      dataStructures.multiframe
    )[0];
    const dataId = app.loadImageObject([{data: buffer, filename: 'mf.dcm'}]);

    assert.deepEqual(
      events, ['error', 'abort', 'loadend'],
      'one error, then abort and loadend');
    assert.isUndefined(
      app.getDataController().get(dataId), 'no data left');
  });

  /**
   * Tests for {@link App#setLayerGroupsBinders}: binders get the data
   * controller timepoint lookups.
   *
   * @function module:tests/app~appSetLayerGroupsBinders
   */
  test('App setLayerGroupsBinders passes the timepoint lookups', () => {
    const app = new App();
    app.init({});
    const dc = app.getDataController();
    const table = [{timepointIndex: 0, tagValue: 1}];
    const tableSpy =
      vi.spyOn(dc, 'getTimepointSyncTable').mockReturnValue(table);
    const tagSpy =
      vi.spyOn(dc, 'getTimepointTag').mockReturnValue('TriggerTime');

    let binderArgs;
    const OriginalBinder = binderList.PositionBinder;
    binderList.PositionBinder = class extends OriginalBinder {
      constructor(...args) {
        super(...args);
        binderArgs = args;
      }
    };
    try {
      app.setLayerGroupsBinders(['PositionBinder']);
    } finally {
      binderList.PositionBinder = OriginalBinder;
    }

    assert.equal(binderArgs.length, 2, 'two lookups');
    const [getTimepointSyncTable, getTimepointTag] = binderArgs;
    assert.equal(getTimepointSyncTable('data0'), table, 'sync table lookup');
    assert.deepEqual(tableSpy.mock.calls, [['data0']],
      'sync table asked for the data id');
    assert.equal(getTimepointTag('data0'), 'TriggerTime',
      'timepoint tag lookup');
    assert.deepEqual(tagSpy.mock.calls, [['data0']],
      'timepoint tag asked for the data id');
  });


  /**
   * Tests for {@link App#setLayerGroupsBinders}: the position binder
   * does not propagate an unchanged position.
   *
   * @function module:tests/app~appPositionBinderUnchanged
   */
  test('App position binder ignores an unchanged position', () => {
    const app = new App();
    app.init({});
    let binder;
    const OriginalBinder = binderList.PositionBinder;
    binderList.PositionBinder = class extends OriginalBinder {
      constructor(...args) {
        super(...args);
        binder = this;
      }
    };
    try {
      app.setLayerGroupsBinders(['PositionBinder']);
    } finally {
      binderList.PositionBinder = OriginalBinder;
    }

    const vc = {
      getCurrentPosition: () => new Point([0, 0, 1]),
      moreThanOne: () => true,
      getScrollDimIndex: () => 2,
      setCurrentPosition: vi.fn()
    };
    const vl = {getViewController: () => vc, getDataId: () => 'data0'};
    const callback = binder.getCallback({
      getViewLayersByDataId: () => [vl],
      getBaseViewLayer: () => vl
    });
    const event = (diffDims) => new CustomEvent('positionchange', {
      detail: {dataid: 'data0', value: [[], [1, 1, 3]], diffDims}
    });

    callback(event([]));
    assert.equal(vc.setCurrentPosition.mock.calls.length, 0,
      'unchanged position not synced');
    callback(event([2]));
    assert.equal(vc.setCurrentPosition.mock.calls.length, 1,
      'changed position synced');
  });

});
