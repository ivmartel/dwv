import {describe, test, assert, vi, afterEach} from 'vitest';
import {
  AnnotationGroup,
  annotationGroupEventNames
} from '../../src/image/annotationGroup.js';
import * as loggerModule from '../../src/utils/logger.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal annotation-like stub with a given tracking UID.
 * Stubs out `setViewController` and `updateQuantification` so the group
 * can delegate to them without importing the full Annotation class.
 *
 * @param {string} uid The tracking UID.
 * @returns {object} Annotation stub.
 */
function makeAnnotation(uid) {
  return {
    trackingUid: uid,
    setViewControllerCalls: [],
    updateQuantificationCalls: 0,
    setViewController(vc) {
      this.setViewControllerCalls.push(vc);
    },
    updateQuantification() {
      this.updateQuantificationCalls++;
    }
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('image', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // annotationGroupEventNames
  // -------------------------------------------------------------------------

  /**
   * Tests that {@link annotationGroupEventNames} exports the expected events.
   *
   * @function module:tests/image~annotation-group-event-names
   */
  test('annotationGroupEventNames contains expected event strings', () => {
    assert.include(
      annotationGroupEventNames, 'annotationgroupeditablechange'
    );
    assert.include(annotationGroupEventNames, 'annotationadd');
    assert.include(annotationGroupEventNames, 'annotationupdate');
    assert.include(annotationGroupEventNames, 'annotationremove');
  });

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  /**
   * Tests for {@link AnnotationGroup} constructor with no arguments.
   *
   * @function module:tests/image~annotation-group-ctor-empty
   */
  test('AnnotationGroup constructor creates an empty editable group', () => {
    const group = new AnnotationGroup();
    assert.equal(group.getLength(), 0);
    assert.deepEqual(group.getList(), []);
    assert.isTrue(group.isEditable());
    assert.isUndefined(group.getColour());
  });

  /**
   * Tests for {@link AnnotationGroup} constructor with an initial list.
   *
   * @function module:tests/image~annotation-group-ctor-list
   */
  test('AnnotationGroup constructor accepts a pre-built list', () => {
    const a1 = makeAnnotation('uid-1');
    const a2 = makeAnnotation('uid-2');
    const group = new AnnotationGroup([a1, a2]);
    assert.equal(group.getLength(), 2);
    assert.deepEqual(group.getList(), [a1, a2]);
  });

  // -------------------------------------------------------------------------
  // Editable
  // -------------------------------------------------------------------------

  /**
   * Tests for {@link AnnotationGroup#setEditable} toggling and event firing.
   *
   * @function module:tests/image~annotation-group-editable
   */
  test('AnnotationGroup setEditable updates flag and fires event', () => {
    const group = new AnnotationGroup();
    const events = [];
    group.addEventListener('annotationgroupeditablechange', (e) => {
      events.push(e);
    });

    group.setEditable(false);
    assert.isFalse(group.isEditable());
    assert.equal(events.length, 1);
    assert.equal(events[0].type, 'annotationgroupeditablechange');
    assert.isFalse(events[0].data);

    group.setEditable(true);
    assert.isTrue(group.isEditable());
    assert.equal(events.length, 2);
    assert.isTrue(events[1].data);
  });

  // -------------------------------------------------------------------------
  // Colour
  // -------------------------------------------------------------------------

  /**
   * Tests for {@link AnnotationGroup#setColour} / getColour.
   *
   * @function module:tests/image~annotation-group-colour
   */
  test('AnnotationGroup setColour / getColour round-trip', () => {
    const group = new AnnotationGroup();
    assert.isUndefined(group.getColour());
    group.setColour('#ff0000');
    assert.equal(group.getColour(), '#ff0000');
  });

  // -------------------------------------------------------------------------
  // add
  // -------------------------------------------------------------------------

  /**
   * Tests for {@link AnnotationGroup#add} updating the list and firing events.
   *
   * @function module:tests/image~annotation-group-add
   */
  test('AnnotationGroup add appends annotation and fires annotationadd', () => {
    const group = new AnnotationGroup();
    const events = [];
    group.addEventListener('annotationadd', (e) => events.push(e));

    const ann = makeAnnotation('uid-1');
    group.add(ann);

    assert.equal(group.getLength(), 1);
    assert.equal(group.getList()[0], ann);
    assert.equal(events.length, 1);
    assert.equal(events[0].type, 'annotationadd');
    assert.equal(events[0].data, ann);
  });

  /**
   * Tests that {@link AnnotationGroup#add} forwards the propagate flag.
   *
   * @function module:tests/image~annotation-group-add-propagate
   */
  test('AnnotationGroup add forwards propagate flag in event', () => {
    const group = new AnnotationGroup();
    const events = [];
    group.addEventListener('annotationadd', (e) => events.push(e));

    group.add(makeAnnotation('uid-1'), false);
    assert.isFalse(events[0].propagate);

    group.add(makeAnnotation('uid-2'), true);
    assert.isTrue(events[1].propagate);
  });

  // -------------------------------------------------------------------------
  // find
  // -------------------------------------------------------------------------

  /**
   * Tests for {@link AnnotationGroup#find} by tracking UID.
   *
   * @function module:tests/image~annotation-group-find
   */
  test('AnnotationGroup find returns annotation by UID or undefined', () => {
    const group = new AnnotationGroup();
    const ann = makeAnnotation('uid-42');
    group.add(ann);

    assert.equal(group.find('uid-42'), ann);
    assert.isUndefined(group.find('uid-99'));
  });

  // -------------------------------------------------------------------------
  // update
  // -------------------------------------------------------------------------

  /**
   * Tests for {@link AnnotationGroup#update} replacing the entry and
   * firing annotationupdate.
   *
   * @function module:tests/image~annotation-group-update
   */
  test('AnnotationGroup update replaces annotation and fires event', () => {
    const group = new AnnotationGroup();
    const original = makeAnnotation('uid-1');
    group.add(original);

    const events = [];
    group.addEventListener('annotationupdate', (e) => events.push(e));

    const updated = makeAnnotation('uid-1');
    group.update(updated, ['colour']);

    assert.equal(group.getList()[0], updated, 'list entry replaced');
    assert.equal(events.length, 1);
    assert.equal(events[0].type, 'annotationupdate');
    assert.equal(events[0].data, updated);
    assert.deepEqual(events[0].keys, ['colour']);
  });

  /**
   * Tests that update calls updateQuantification when mathShape changes.
   *
   * @function module:tests/image~annotation-group-update-quantification
   */
  test('AnnotationGroup update triggers quantification for mathShape key',
    () => {
      const group = new AnnotationGroup();
      group.add(makeAnnotation('uid-1'));

      const updated = makeAnnotation('uid-1');
      group.update(updated, ['mathShape']);
      assert.equal(updated.updateQuantificationCalls, 1,
        'quantification updated for mathShape');
    }
  );

  /**
   * Tests that update calls updateQuantification when textExpr changes.
   *
   * @function module:tests/image~annotation-group-update-text-expr
   */
  test('AnnotationGroup update triggers quantification for textExpr key',
    () => {
      const group = new AnnotationGroup();
      group.add(makeAnnotation('uid-1'));

      const updated = makeAnnotation('uid-1');
      group.update(updated, ['textExpr']);
      assert.equal(updated.updateQuantificationCalls, 1,
        'quantification updated for textExpr');
    }
  );

  /**
   * Tests that update does NOT call updateQuantification for unrelated keys.
   *
   * @function module:tests/image~annotation-group-update-no-quantification
   */
  test('AnnotationGroup update skips quantification for unrelated keys',
    () => {
      const group = new AnnotationGroup();
      group.add(makeAnnotation('uid-1'));

      const updated = makeAnnotation('uid-1');
      group.update(updated, ['colour']);
      assert.equal(updated.updateQuantificationCalls, 0,
        'quantification not called for colour key');
    }
  );

  /**
   * Tests that update warns when the annotation is not found.
   *
   * @function module:tests/image~annotation-group-update-not-found
   */
  test('AnnotationGroup update warns when annotation UID is not found', () => {
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});
    const group = new AnnotationGroup();
    group.update(makeAnnotation('uid-missing'), ['colour']);
    assert.equal(warnSpy.mock.calls.length, 1);
  });

  // -------------------------------------------------------------------------
  // remove
  // -------------------------------------------------------------------------

  /**
   * Tests for {@link AnnotationGroup#remove} by UID.
   *
   * @function module:tests/image~annotation-group-remove
   */
  test('AnnotationGroup remove deletes annotation and fires event', () => {
    const group = new AnnotationGroup();
    const ann = makeAnnotation('uid-1');
    group.add(ann);

    const events = [];
    group.addEventListener('annotationremove', (e) => events.push(e));

    group.remove('uid-1');

    assert.equal(group.getLength(), 0);
    assert.equal(events.length, 1);
    assert.equal(events[0].type, 'annotationremove');
    assert.equal(events[0].data, ann);
  });

  /**
   * Tests that remove warns when the annotation is not found.
   *
   * @function module:tests/image~annotation-group-remove-not-found
   */
  test('AnnotationGroup remove warns when annotation UID is not found', () => {
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});
    const group = new AnnotationGroup();
    group.remove('uid-missing');
    assert.equal(warnSpy.mock.calls.length, 1);
  });

  /**
   * Tests that remove only removes the targeted annotation, preserving others.
   *
   * @function module:tests/image~annotation-group-remove-selective
   */
  test('AnnotationGroup remove only removes the targeted annotation', () => {
    const group = new AnnotationGroup();
    const a1 = makeAnnotation('uid-1');
    const a2 = makeAnnotation('uid-2');
    const a3 = makeAnnotation('uid-3');
    group.add(a1);
    group.add(a2);
    group.add(a3);

    group.remove('uid-2');

    assert.equal(group.getLength(), 2);
    assert.equal(group.getList()[0], a1);
    assert.equal(group.getList()[1], a3);
  });

  // -------------------------------------------------------------------------
  // setViewController
  // -------------------------------------------------------------------------

  /**
   * Tests that {@link AnnotationGroup#setViewController} delegates to each
   * annotation and triggers quantification updates.
   *
   * @function module:tests/image~annotation-group-set-view-controller
   */
  test('AnnotationGroup setViewController delegates to all annotations',
    () => {
      const group = new AnnotationGroup();
      const a1 = makeAnnotation('uid-1');
      const a2 = makeAnnotation('uid-2');
      group.add(a1);
      group.add(a2);

      const mockVc = {};
      group.setViewController(mockVc);

      assert.equal(a1.setViewControllerCalls.length, 1);
      assert.equal(a1.setViewControllerCalls[0], mockVc);
      assert.equal(a1.updateQuantificationCalls, 1);
      assert.equal(a2.setViewControllerCalls.length, 1);
      assert.equal(a2.updateQuantificationCalls, 1);
    }
  );

  // -------------------------------------------------------------------------
  // Meta data
  // -------------------------------------------------------------------------

  /**
   * Tests for {@link AnnotationGroup} meta data CRUD.
   *
   * @function module:tests/image~annotation-group-meta
   */
  test('AnnotationGroup meta data set / get / has round-trip', () => {
    const group = new AnnotationGroup();

    assert.isFalse(group.hasMeta('PatientID'));
    assert.isUndefined(group.getMetaValue('PatientID'));
    assert.deepEqual(group.getMeta(), {});

    group.setMetaValue('PatientID', 'P001');
    assert.isTrue(group.hasMeta('PatientID'));
    assert.equal(group.getMetaValue('PatientID'), 'P001');

    group.setMetaValue('StudyDate', {date: '20240101'});
    assert.deepEqual(group.getMeta(), {
      PatientID: 'P001',
      StudyDate: {date: '20240101'}
    });
  });

  // -------------------------------------------------------------------------
  // addEventListener / removeEventListener
  // -------------------------------------------------------------------------

  /**
   * Tests for {@link AnnotationGroup#removeEventListener}.
   *
   * @function module:tests/image~annotation-group-remove-listener
   */
  test('AnnotationGroup removeEventListener stops callback from firing', () => {
    const group = new AnnotationGroup();
    let calls = 0;
    const cb = () => {
      calls++;
    };

    group.addEventListener('annotationadd', cb);
    group.add(makeAnnotation('uid-1'));
    assert.equal(calls, 1, 'fired once after addEventListener');

    group.removeEventListener('annotationadd', cb);
    group.add(makeAnnotation('uid-2'));
    assert.equal(calls, 1, 'not fired after removeEventListener');
  });

});
