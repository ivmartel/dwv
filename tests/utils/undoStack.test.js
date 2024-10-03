import {UndoStack} from '../../src/utils/undoStack';

/**
 * Tests for the 'utils/undoStack' file.
 */

/* global QUnit */
QUnit.module('utils');

class TestCommand00 {
  // extra for test
  testState = '00-init';
  // command api
  getName() {
    return 'command00';
  }
  execute() {
    this.testState = '00-executed';
  }
  undo() {
    this.testState = '00-undone';
  }
}

/**
 * Tests for {@link UndoStack}.
 *
 * @function module:tests/utils~UndoStack
 */
QUnit.test('UndoStack - #DWV-REQ-UI-08-002 Draw action undo/redo',
  function (assert) {
    const cmd00 = new TestCommand00();
    assert.equal(cmd00.testState, '00-init', 'cmd00 init');
    // create stack
    const undoStack00 = new UndoStack();
    assert.equal(undoStack00.getStackSize(), 0, 'undoStack size #00');
    assert.equal(undoStack00.getCurrentStackIndex(), 0, 'undoStack index #00');

    let receivedUndoadd00 = 0;
    undoStack00.addEventListener('undoadd', function () {
      ++receivedUndoadd00;
    });
    let receivedUndoremove00 = 0;
    undoStack00.addEventListener('undoremove', function () {
      ++receivedUndoremove00;
    });
    let receivedUndo00 = 0;
    undoStack00.addEventListener('undo', function () {
      ++receivedUndo00;
    });
    let receivedRedo00 = 0;
    undoStack00.addEventListener('redo', function () {
      ++receivedRedo00;
    });

    // add command to stack
    undoStack00.add(cmd00);
    assert.equal(undoStack00.getStackSize(), 1, 'undoStack size after add #00');
    assert.equal(undoStack00.getCurrentStackIndex(), 1,
      'undoStack index after add #00');
    assert.equal(receivedUndoadd00, 1,
      'undoStack undoadd event after add #00');
    assert.equal(receivedUndoremove00, 0,
      'undoStack undoremove event after add #00');
    assert.equal(receivedUndo00, 0,
      'undoStack undo event after add #00');
    assert.equal(receivedRedo00, 0,
      'undoStack redo event after add #00');

    // undo via stack
    undoStack00.undo();
    assert.equal(cmd00.testState, '00-undone', 'undoStack undo #00');
    assert.equal(undoStack00.getStackSize(), 1,
      'undoStack size after undo #00');
    assert.equal(undoStack00.getCurrentStackIndex(), 0,
      'undoStack index after undo #00');
    assert.equal(receivedUndoadd00, 1,
      'undoStack undoadd event after undo #00');
    assert.equal(receivedUndoremove00, 0,
      'undoStack undoremove event after undo #00');
    assert.equal(receivedUndo00, 1,
      'undoStack undo event after undo #00');
    assert.equal(receivedRedo00, 0,
      'undoStack redo event after undo #00');

    // redo via stack
    undoStack00.redo();
    assert.equal(cmd00.testState, '00-executed', 'undoStack execute #00');
    assert.equal(undoStack00.getStackSize(), 1,
      'undoStack size after redo #00');
    assert.equal(undoStack00.getCurrentStackIndex(), 1,
      'undoStack index after redo #00');
    assert.equal(receivedUndoadd00, 1,
      'undoStack undoadd event after redo #00');
    assert.equal(receivedUndoremove00, 0,
      'undoStack undoremove event after redo #00');
    assert.equal(receivedUndo00, 1,
      'undoStack undo event after redo #00');
    assert.equal(receivedRedo00, 1,
      'undoStack redo event after redo #00');

    // remove wrong commmand from stack
    undoStack00.remove('badname');
    assert.equal(undoStack00.getStackSize(), 1,
      'undoStack size after bad remove #00');
    assert.equal(undoStack00.getCurrentStackIndex(), 1,
      'undoStack index after bad remove #00');
    assert.equal(receivedUndoadd00, 1,
      'undoStack undoadd event after bad remove #00');
    assert.equal(receivedUndoremove00, 0,
      'undoStack undoremove event after bad remove #00');
    assert.equal(receivedUndo00, 1,
      'undoStack undo event after bad remove #00');
    assert.equal(receivedRedo00, 1,
      'undoStack redo event after bad remove #00');

    // remove commmand from stack
    undoStack00.remove(cmd00.getName());
    assert.equal(undoStack00.getStackSize(), 0,
      'undoStack size after remove #00');
    assert.equal(undoStack00.getCurrentStackIndex(), 0,
      'undoStack index after remove #00');
    assert.equal(receivedUndoadd00, 1,
      'undoStack undoadd event after remove #00');
    assert.equal(receivedUndoremove00, 1,
      'undoStack undoremove event after remove #00');
    assert.equal(receivedUndo00, 1,
      'undoStack undo event after remove #00');
    assert.equal(receivedRedo00, 1,
      'undoStack redo event after remove #00');
  }
);
