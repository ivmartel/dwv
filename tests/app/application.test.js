// @vitest-environment jsdom
import {describe, test, assert, vi, afterEach} from 'vitest';
import {App} from '../../src/app/application.js';
import {ImageFactory} from '../../src/image/imageFactory.js';
import {binderList} from '../../src/gui/binders.js';
import {StageController} from '../../src/app/stageController.js';
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
   * Tests for {@link App#defaultOnKeydown}: ctrl-shift-left/right move
   *   the timepoints of a time series only.
   *
   * @function module:tests/app~appKeydownTimepoints
   */
  test('App keydown moves the timepoints of a time series only', () => {
    let canScrollTimepoints = false;
    const positionHelper = {
      incrementPosition: vi.fn(),
      decrementPosition: vi.fn()
    };
    vi.spyOn(StageController.prototype, 'getActiveLayerGroup')
      .mockReturnValue({
        getPositionHelper: () => positionHelper,
        canScrollTimepoints: () => canScrollTimepoints
      });
    const app = new App();
    app.init({});
    const keydown = (key) => app.defaultOnKeydown(
      new KeyboardEvent('keydown', {key, ctrlKey: true, shiftKey: true}));

    // not a time series
    keydown('ArrowRight');
    keydown('ArrowLeft');
    assert.equal(positionHelper.incrementPosition.mock.calls.length, 0,
      'no increment for a non time series');
    assert.equal(positionHelper.decrementPosition.mock.calls.length, 0,
      'no decrement for a non time series');

    // time series
    canScrollTimepoints = true;
    keydown('ArrowRight');
    keydown('ArrowLeft');
    assert.deepEqual(positionHelper.incrementPosition.mock.calls, [[3]],
      'increment timepoint');
    assert.deepEqual(positionHelper.decrementPosition.mock.calls, [[3]],
      'decrement timepoint');
  });

});
