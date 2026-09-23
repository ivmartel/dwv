import {describe, test, assert, vi, afterEach} from 'vitest';
import {DrawController} from '../../src/app/drawController.js';
import {AnnotationGroup} from '../../src/image/annotationGroup.js';
import {
  RemoveAnnotationCommand,
  UpdateAnnotationCommand
} from '../../src/command/drawCommands.js';
import * as loggerModule from '../../src/utils/logger.js';

/**
 * Tests for the 'app/drawController.js' file.
 */
/** @module tests/app */

/**
 * Build a minimal annotation-like stub with a given tracking UID.
 *
 * @param {string} uid The tracking UID.
 * @returns {object} Annotation stub.
 */
function makeAnnotation(uid) {
  return {
    trackingUid: uid,
    textExpr: 'text',
    updateQuantificationCalls: 0,
    updateQuantification() {
      this.updateQuantificationCalls++;
    }
  };
}

/**
 * Listen to the annotation events of a group.
 *
 * @param {AnnotationGroup} group The annotation group.
 * @returns {Array} The list of received {type, detail}, filled on the go.
 */
function recordEvents(group) {
  const events = [];
  const names = [
    'annotationadd',
    'annotationupdate',
    'annotationremove',
    'annotationgroupeditablechange'
  ];
  for (const name of names) {
    group.addEventListener(name, (event) => {
      events.push({
        type: event.type,
        detail: /** @type {CustomEvent} */ (event).detail
      });
    });
  }
  return events;
}

describe('app', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Tests for {@link DrawController} construction and group access.
   */
  describe('DrawController group', () => {

    test('constructor without group creates an empty one', () => {
      const controller = new DrawController();
      const group = controller.getAnnotationGroup();
      assert.instanceOf(group, AnnotationGroup);
      assert.equal(group.getLength(), 0);
      assert.isTrue(controller.isAnnotationGroupEditable());
    });

    test('constructor with group uses it', () => {
      const ann0 = makeAnnotation('uid0');
      const group = new AnnotationGroup([ann0]);
      const controller = new DrawController(group);
      assert.equal(controller.getAnnotationGroup(), group);
      assert.equal(controller.getAnnotation('uid0'), ann0);
      assert.isUndefined(controller.getAnnotation('unknown'));
    });

    test('editable flag', () => {
      const controller = new DrawController();
      const events = recordEvents(controller.getAnnotationGroup());
      controller.setAnnotationGroupEditable(false);
      assert.isFalse(controller.isAnnotationGroupEditable());
      assert.isFalse(controller.getAnnotationGroup().isEditable());
      controller.setAnnotationGroupEditable(true);
      assert.isTrue(controller.isAnnotationGroupEditable());
      assert.deepEqual(events.map((e) => e.type), [
        'annotationgroupeditablechange',
        'annotationgroupeditablechange'
      ]);
    });

    test('meta data', () => {
      const controller = new DrawController();
      assert.isFalse(controller.hasAnnotationMeta('Modality'));
      controller.setAnnotationMeta('Modality', 'SR');
      assert.isTrue(controller.hasAnnotationMeta('Modality'));
      assert.equal(
        controller.getAnnotationGroup().getMetaValue('Modality'), 'SR');
    });

  });

  /**
   * Tests for {@link DrawController} direct annotation edits.
   */
  describe('DrawController annotations', () => {

    test('add, update and remove', () => {
      const controller = new DrawController();
      const group = controller.getAnnotationGroup();
      const events = recordEvents(group);
      const ann0 = makeAnnotation('uid0');

      controller.addAnnotation(ann0);
      assert.equal(group.getLength(), 1);
      assert.equal(controller.getAnnotation('uid0'), ann0);

      controller.updateAnnotation(ann0, ['textExpr'], false);
      // textExpr change triggers a quantification update
      assert.equal(ann0.updateQuantificationCalls, 1);

      controller.removeAnnotation('uid0');
      assert.equal(group.getLength(), 0);
      assert.isUndefined(controller.getAnnotation('uid0'));

      assert.deepEqual(events.map((e) => e.type), [
        'annotationadd',
        'annotationupdate',
        'annotationremove'
      ]);
      assert.equal(events[1].detail.data, ann0);
      assert.deepEqual(events[1].detail.keys, ['textExpr']);
      assert.isFalse(events[1].detail.propagate);
      assert.equal(events[2].detail.data, ann0);
    });

  });

  /**
   * Tests for {@link DrawController} command based annotation edits.
   */
  describe('DrawController commands', () => {

    test('removeAnnotationWithCommand', () => {
      const ann0 = makeAnnotation('uid0');
      const controller = new DrawController(new AnnotationGroup([ann0]));
      const events = recordEvents(controller.getAnnotationGroup());
      const callback = vi.fn();

      controller.removeAnnotationWithCommand('uid0', callback);

      // command given to the callback then executed
      assert.equal(callback.mock.calls.length, 1);
      const command = callback.mock.calls[0][0];
      assert.instanceOf(command, RemoveAnnotationCommand);
      assert.equal(command.getName(), 'RemoveAnnotation-uid0');
      assert.isUndefined(controller.getAnnotation('uid0'));
      assert.deepEqual(events.map((e) => e.type), ['annotationremove']);

      // undo adds it back
      command.undo();
      assert.equal(controller.getAnnotation('uid0'), ann0);
    });

    test('removeAnnotationWithCommand unknown uid', () => {
      const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
        .mockImplementation(() => {});
      const controller = new DrawController();
      const callback = vi.fn();

      controller.removeAnnotationWithCommand('unknown', callback);

      assert.equal(callback.mock.calls.length, 0);
      assert.equal(warnSpy.mock.calls.length, 1);
      assert.include(warnSpy.mock.calls[0][0], 'unknown');
    });

    test('updateAnnotationWithCommand', () => {
      const ann0 = makeAnnotation('uid0');
      const controller = new DrawController(new AnnotationGroup([ann0]));
      const events = recordEvents(controller.getAnnotationGroup());
      const callback = vi.fn();

      controller.updateAnnotationWithCommand(
        'uid0', {textExpr: 'text'}, {textExpr: 'new text'}, callback);

      assert.equal(callback.mock.calls.length, 1);
      const command = callback.mock.calls[0][0];
      assert.instanceOf(command, UpdateAnnotationCommand);
      assert.equal(command.getName(), 'UpdateAnnotation-uid0');
      assert.equal(ann0.textExpr, 'new text');
      assert.equal(events.length, 1);
      assert.equal(events[0].type, 'annotationupdate');
      assert.deepEqual(events[0].detail.keys, ['textExpr']);

      // undo restores the original props
      command.undo();
      assert.equal(ann0.textExpr, 'text');
      assert.equal(events.length, 2);
    });

    test('updateAnnotationWithCommand unknown uid', () => {
      const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
        .mockImplementation(() => {});
      const controller = new DrawController();
      const callback = vi.fn();

      controller.updateAnnotationWithCommand('unknown', {}, {}, callback);

      assert.equal(callback.mock.calls.length, 0);
      assert.equal(warnSpy.mock.calls.length, 1);
      assert.include(warnSpy.mock.calls[0][0], 'unknown');
    });

    test('removeAllAnnotationsWithCommand', () => {
      const anns = [
        makeAnnotation('uid0'),
        makeAnnotation('uid1'),
        makeAnnotation('uid2')
      ];
      const controller = new DrawController(new AnnotationGroup(anns));
      const callback = vi.fn();

      controller.removeAllAnnotationsWithCommand(callback);

      assert.equal(callback.mock.calls.length, 3);
      assert.deepEqual(
        callback.mock.calls.map((call) => call[0].getName()), [
          'RemoveAnnotation-uid0',
          'RemoveAnnotation-uid1',
          'RemoveAnnotation-uid2'
        ]);
      assert.equal(controller.getAnnotationGroup().getLength(), 0);
    });

    test('removeAllAnnotationsWithCommand empty group', () => {
      const controller = new DrawController();
      const callback = vi.fn();
      controller.removeAllAnnotationsWithCommand(callback);
      assert.equal(callback.mock.calls.length, 0);
    });

  });

});
