import {describe, test, assert, beforeEach} from 'vitest';
import {
  UndoController,
  undoEventNames
} from '../../src/app/undoController.js';

/**
 * Tests for the 'app/undoController.js' file.
 */
/** @module tests/app */

/**
 * Test command that records its execute/undo calls.
 */
class TestCommand {
  #name;
  calls = [];

  /**
   * @param {string} name The command name.
   */
  constructor(name) {
    this.#name = name;
  }

  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  getName() {
    return this.#name;
  }

  /**
   * Execute the command.
   */
  execute() {
    this.calls.push('execute');
  }

  /**
   * Undo the command.
   */
  undo() {
    this.calls.push('undo');
  }
}

/**
 * Listen to all undo events of a controller.
 *
 * @param {UndoController} controller The controller.
 * @returns {Array} The list of received {type, detail}, filled on the go.
 */
function recordEvents(controller) {
  const events = [];
  for (const name of undoEventNames) {
    controller.addEventListener(name, (event) => {
      events.push({
        type: event.type,
        detail: /** @type {CustomEvent} */ (event).detail
      });
    });
  }
  return events;
}

describe('app', () => {

  /**
   * Tests for {@link UndoController}.
   */
  describe('UndoController', () => {

    let controller;
    let events;

    beforeEach(() => {
      controller = new UndoController();
      events = recordEvents(controller);
    });

    test('undoEventNames', () => {
      assert.deepEqual(undoEventNames, [
        'undoadd',
        'undoremove',
        'undo',
        'redo'
      ]);
    });

    test('initial state', () => {
      assert.equal(controller.getStackSize(), 0);
      assert.equal(controller.getCurrentStackIndex(), 0);
    });

    test('addToUndoStack', () => {
      const cmd0 = new TestCommand('cmd0');
      const cmd1 = new TestCommand('cmd1');
      controller.addToUndoStack(cmd0);
      controller.addToUndoStack(cmd1);

      assert.equal(controller.getStackSize(), 2);
      assert.equal(controller.getCurrentStackIndex(), 2);
      // adding does not execute
      assert.deepEqual(cmd0.calls, []);
      assert.deepEqual(cmd1.calls, []);
      assert.deepEqual(events.map((e) => e.type), ['undoadd', 'undoadd']);
    });

    test('undo and redo', () => {
      const cmd0 = new TestCommand('cmd0');
      const cmd1 = new TestCommand('cmd1');
      controller.addToUndoStack(cmd0);
      controller.addToUndoStack(cmd1);

      controller.undo();
      assert.deepEqual(cmd1.calls, ['undo']);
      assert.deepEqual(cmd0.calls, []);
      assert.equal(controller.getCurrentStackIndex(), 1);
      assert.equal(controller.getStackSize(), 2);

      controller.undo();
      assert.deepEqual(cmd0.calls, ['undo']);
      assert.equal(controller.getCurrentStackIndex(), 0);

      controller.redo();
      assert.deepEqual(cmd0.calls, ['undo', 'execute']);
      assert.equal(controller.getCurrentStackIndex(), 1);

      controller.redo();
      assert.deepEqual(cmd1.calls, ['undo', 'execute']);
      assert.equal(controller.getCurrentStackIndex(), 2);

      assert.deepEqual(events.map((e) => e.type), [
        'undoadd',
        'undoadd',
        'undo',
        'undo',
        'redo',
        'redo'
      ]);
    });

    test('undo/redo at stack limits are no-ops', () => {
      controller.undo();
      controller.redo();
      assert.equal(controller.getCurrentStackIndex(), 0);

      const cmd0 = new TestCommand('cmd0');
      controller.addToUndoStack(cmd0);
      // nothing to redo
      controller.redo();
      assert.equal(controller.getCurrentStackIndex(), 1);
      controller.undo();
      // nothing to undo
      controller.undo();
      assert.equal(controller.getCurrentStackIndex(), 0);

      assert.deepEqual(cmd0.calls, ['undo']);
      assert.deepEqual(events.map((e) => e.type), ['undoadd', 'undo']);
    });

    test('add after undo drops redo history', () => {
      const cmd0 = new TestCommand('cmd0');
      const cmd1 = new TestCommand('cmd1');
      const cmd2 = new TestCommand('cmd2');
      controller.addToUndoStack(cmd0);
      controller.addToUndoStack(cmd1);
      controller.undo();
      controller.addToUndoStack(cmd2);

      assert.equal(controller.getStackSize(), 2);
      assert.equal(controller.getCurrentStackIndex(), 2);
      // cmd1 is gone: redo does nothing, undo goes to cmd2 then cmd0
      controller.redo();
      controller.undo();
      controller.undo();
      assert.deepEqual(cmd2.calls, ['undo']);
      assert.deepEqual(cmd1.calls, ['undo']);
      assert.deepEqual(cmd0.calls, ['undo']);
    });

    test('removeFromUndoStack', () => {
      controller.addToUndoStack(new TestCommand('cmd0'));
      controller.addToUndoStack(new TestCommand('cmd1'));

      assert.isTrue(controller.removeFromUndoStack('cmd0'));
      assert.equal(controller.getStackSize(), 1);
      assert.equal(controller.getCurrentStackIndex(), 1);

      const removeEvents = events.filter((e) => e.type === 'undoremove');
      assert.equal(removeEvents.length, 1);
      assert.deepEqual(removeEvents[0].detail, {commandName: 'cmd0'});
    });

    test('removeFromUndoStack unknown name', () => {
      controller.addToUndoStack(new TestCommand('cmd0'));

      assert.isFalse(controller.removeFromUndoStack('unknown'));
      assert.equal(controller.getStackSize(), 1);
      assert.equal(controller.getCurrentStackIndex(), 1);
      assert.equal(events.filter((e) => e.type === 'undoremove').length, 0);
    });

    test('forwarded events are CustomEvents from the controller', () => {
      const received = [];
      for (const name of undoEventNames) {
        controller.addEventListener(name, (event) => {
          received.push(event);
        });
      }
      const cmd0 = new TestCommand('cmd0');
      controller.addToUndoStack(cmd0);
      controller.undo();
      controller.redo();
      controller.removeFromUndoStack('cmd0');

      assert.equal(received.length, 4);
      for (const event of received) {
        assert.instanceOf(event, CustomEvent);
        assert.equal(event.target, controller);
        assert.isObject(event.detail);
      }
      // stack events without detail are forwarded with an empty one
      assert.deepEqual(received[0].detail, {});
    });

    test('reset', () => {
      const cmd0 = new TestCommand('cmd0');
      controller.addToUndoStack(cmd0);
      controller.addToUndoStack(new TestCommand('cmd1'));
      controller.undo();

      controller.reset();
      assert.equal(controller.getStackSize(), 0);
      assert.equal(controller.getCurrentStackIndex(), 0);
      // old history is gone
      controller.redo();
      controller.undo();
      assert.deepEqual(cmd0.calls, []);

      // events are still forwarded, only once, after reset
      events.length = 0;
      controller.addToUndoStack(new TestCommand('cmd2'));
      controller.undo();
      assert.deepEqual(events.map((e) => e.type), ['undoadd', 'undo']);
    });

  });

});
