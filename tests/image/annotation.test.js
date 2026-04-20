import {describe, test, assert, vi, afterEach} from 'vitest';
import {Annotation} from '../../src/image/annotation.js';
import {DicomCode} from '../../src/dicom/dicomCode.js';
import {Point3D} from '../../src/math/point.js';
import * as loggerModule from '../../src/utils/logger.js';

// ---------------------------------------------------------------------------
// Mock ViewController
// ---------------------------------------------------------------------------

/**
 * Minimal ViewController mock for annotation tests.
 * All methods return safe defaults; individual tests override as needed.
 */
class MockViewController {
  #uid;
  #modality;
  #acquisitionOrientation;
  #planeHelper;

  /**
   * @param {object} opts Configuration options.
   * @param {string} opts.uid Image SOP instance UID.
   * @param {string} [opts.modality] Modality string (default 'CT').
   * @param {boolean} [opts.acquisitionOrientation] Acquisition orientation
   *   flag.
   * @param {object} [opts.planeHelper] Plane helper mock.
   */
  constructor({
    uid = 'uid-test',
    modality = 'CT',
    acquisitionOrientation = true,
    planeHelper = {isAquisitionOrientation: () => true, getCosines: () => []}
  } = {}) {
    this.#uid = uid;
    this.#modality = modality;
    this.#acquisitionOrientation = acquisitionOrientation;
    this.#planeHelper = planeHelper;
  }

  /** @returns {{length: Function, get: Function}} Position-like object. */
  getCurrentPosition() {
    return {length: () => 3, get: () => undefined};
  }

  /** @returns {string} The SOP instance UID. */
  getCurrentImageUid() {
    return this.#uid;
  }

  /** @returns {string} SOP class UID. */
  getSopClassUid() {
    return '1.2.840.10008.5.1.4.1.1.2';
  }

  /**
   * @param {string} _uid The UID to look up.
   * @returns {Point3D} The plane origin.
   */
  getOriginForImageUid(_uid) {
    return new Point3D(0, 0, 0);
  }

  /** @returns {boolean} Whether in acquisition orientation. */
  isAquisitionOrientation() {
    return this.#acquisitionOrientation;
  }

  /**
   * @param {object} _position Current position.
   * @returns {Point3D[]} Plane points.
   */
  getPlanePoints(_position) {
    return [
      new Point3D(0, 0, 0),
      new Point3D(1, 0, 0),
      new Point3D(0, 1, 0)
    ];
  }

  /**
   * @param {string} uid UID to check.
   * @returns {boolean} True if this controller owns that UID.
   */
  includesImageUid(uid) {
    return uid === this.#uid;
  }

  /** @returns {object} The plane helper. */
  getPlaneHelper() {
    return this.#planeHelper;
  }

  /** @returns {string} The modality. */
  getModality() {
    return this.#modality;
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('image', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Constructor / default values
  // -------------------------------------------------------------------------

  /**
   * Tests for {@link Annotation} constructor defaults.
   *
   * @function module:tests/image~annotationConstructor
   */
  test('Annotation constructor sets unique non-empty ids and default values',
    () => {
      const a = new Annotation();

      assert.isString(a.trackingId, 'trackingId is a string');
      assert.isNotEmpty(a.trackingId, 'trackingId is not empty');
      assert.isString(a.trackingUid, 'trackingUid is a string');
      assert.isNotEmpty(a.trackingUid, 'trackingUid is not empty');

      // Default field values
      assert.equal(a.colour, '#ffff80', 'default colour');
      assert.equal(a.textExpr, '', 'default textExpr');
      assert.isUndefined(a.mathShape, 'mathShape starts undefined');
      assert.isUndefined(a.quantification, 'quantification starts undefined');
    }
  );

  /**
   * Tests that each Annotation instance receives unique ids.
   *
   * @function module:tests/image~annotationUniqueIds
   */
  test('Annotation instances have unique tracking ids', () => {
    const a = new Annotation();
    const b = new Annotation();
    assert.notEqual(a.trackingId, b.trackingId, 'trackingId differs');
    assert.notEqual(a.trackingUid, b.trackingUid, 'trackingUid differs');
  });

  // -------------------------------------------------------------------------
  // Meta data CRUD
  // -------------------------------------------------------------------------

  /**
   * Tests for {@link Annotation} meta data add/get/list operations.
   *
   * @function module:tests/image~annotationMetaAddGet
   */
  test('Annotation addMetaItem / getMetaItem / getMetaConceptIds', () => {
    const ann = new Annotation();

    // empty initially
    assert.deepEqual(ann.getMetaConceptIds(), []);
    assert.isUndefined(ann.getMetaItem('C0001'));

    // add one item
    const concept = new DicomCode('Finding');
    concept.value = 'C0001';
    const value = new DicomCode('Lesion');
    ann.addMetaItem(concept, value);

    assert.deepEqual(ann.getMetaConceptIds(), ['C0001']);
    const item = ann.getMetaItem('C0001');
    assert.equal(item.concept, concept, 'stored concept');
    assert.equal(item.value, value, 'stored value');

    // add a second item
    const concept2 = new DicomCode('Quality');
    concept2.value = 'C0002';
    ann.addMetaItem(concept2, 'good');
    assert.deepEqual(
      ann.getMetaConceptIds().sort(), ['C0001', 'C0002']
    );
  });

  /**
   * Tests that {@link Annotation#addMetaItem} warns when overwriting.
   *
   * @function module:tests/image~annotationMetaOverwrite
   */
  test('Annotation addMetaItem warns on duplicate concept id', () => {
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});
    const ann = new Annotation();
    const concept = new DicomCode('Finding');
    concept.value = 'C0001';

    ann.addMetaItem(concept, 'first');
    assert.equal(warnSpy.mock.calls.length, 0, 'no warning on first add');

    ann.addMetaItem(concept, 'second');
    assert.equal(warnSpy.mock.calls.length, 1, 'warning on overwrite');
    assert.ok(warnSpy.mock.calls[0][0].includes('C0001'),
      'warning mentions the concept id');
  });

  /**
   * Tests for {@link Annotation#removeMetaItem}.
   *
   * @function module:tests/image~annotationMetaRemove
   */
  test('Annotation removeMetaItem deletes an existing entry silently', () => {
    const ann = new Annotation();
    const concept = new DicomCode('Finding');
    concept.value = 'C0001';
    ann.addMetaItem(concept, 'val');

    ann.removeMetaItem('C0001');
    assert.isUndefined(ann.getMetaItem('C0001'));
    assert.deepEqual(ann.getMetaConceptIds(), []);

    // removing a non-existent id is a no-op
    assert.doesNotThrow(() => ann.removeMetaItem('no-such-id'));
  });

  // -------------------------------------------------------------------------
  // canView
  // -------------------------------------------------------------------------

  /**
   * Tests for {@link Annotation#canView} initial state.
   *
   * @function module:tests/image~annotationCanView
   */
  test('Annotation canView returns false before init', () => {
    const ann = new Annotation();
    assert.isFalse(ann.canView());
  });

  // -------------------------------------------------------------------------
  // getText
  // -------------------------------------------------------------------------

  /**
   * Tests for {@link Annotation#getText} with no quantification.
   *
   * @function module:tests/image~annotationGetTextPlain
   */
  test('Annotation getText returns plain textExpr when no quantification',
    () => {
      const ann = new Annotation();
      ann.textExpr = 'Hello world';
      assert.equal(ann.getText(), 'Hello world');
    });

  /**
   * Tests for {@link Annotation#getText} with flag substitution.
   *
   * @function module:tests/image~annotationGetTextFlags
   */
  test('Annotation getText replaces {flags} from quantification', () => {
    const ann = new Annotation();
    ann.textExpr = 'Area: {area} mm²';
    ann.quantification = {area: {value: 12.345, unit: 'mm²'}};
    const text = ann.getText();
    // replaceFlags uses toPrecision(4) → '12.35'
    assert.ok(text.includes('12.35'), `text includes formatted value: ${text}`);
  });

  /**
   * Tests for {@link Annotation#getText} with empty textExpr.
   *
   * @function module:tests/image~annotationGetTextEmpty
   */
  test('Annotation getText returns empty string for default textExpr', () => {
    const ann = new Annotation();
    assert.equal(ann.getText(), '');
  });

  // -------------------------------------------------------------------------
  // isCompatibleView
  // -------------------------------------------------------------------------

  /**
   * Tests for {@link Annotation#isCompatibleView} without planePoints.
   *
   * @function module:tests/image~annotationCompatibleViewNoPlane
   */
  test('Annotation isCompatibleView delegates to planeHelper ' +
    'when no planePoints',
  () => {
    const ann = new Annotation();
    assert.isUndefined(ann.planePoints);

    assert.isTrue(
      ann.isCompatibleView({isAquisitionOrientation: () => true}),
      'compatible with acquisition-orientation view'
    );
    assert.isFalse(
      ann.isCompatibleView({isAquisitionOrientation: () => false}),
      'incompatible with non-acquisition-orientation view'
    );
  }
  );

  /**
   * Tests for {@link Annotation#isCompatibleView} with planePoints set.
   *
   * @function module:tests/image~annotationCompatibleViewPlane
   */
  test('Annotation isCompatibleView compares cosines when planePoints set',
    () => {
      const ann = new Annotation();
      ann.planePoints = [
        new Point3D(0, 0, 0),
        new Point3D(1, 0, 0), // cosine row-direction
        new Point3D(0, 1, 0) // cosine column-direction
      ];

      const matchingHelper = {getCosines: () => [1, 0, 0, 0, 1, 0]};
      assert.isTrue(ann.isCompatibleView(matchingHelper),
        'matches when cosines are equal');

      const nonMatchingHelper = {getCosines: () => [0, 1, 0, 0, 0, 1]};
      assert.isFalse(ann.isCompatibleView(nonMatchingHelper),
        'does not match when cosines differ');
    }
  );

  // -------------------------------------------------------------------------
  // getOrientationName
  // -------------------------------------------------------------------------

  /**
   * Tests for {@link Annotation#getOrientationName} without planePoints.
   *
   * @function module:tests/image~annotationOrientationUndefined
   */
  test('Annotation getOrientationName returns undefined without planePoints',
    () => {
      const ann = new Annotation();
      assert.isUndefined(ann.getOrientationName());
    }
  );

  /**
   * Tests for {@link Annotation#getOrientationName} with axial planePoints.
   *
   * @function module:tests/image~annotationOrientationAxial
   */
  test('Annotation getOrientationName returns a string when planePoints set',
    () => {
      const ann = new Annotation();
      // Axial orientation cosines: row=[1,0,0] col=[0,1,0]
      ann.planePoints = [
        new Point3D(0, 0, 0),
        new Point3D(1, 0, 0),
        new Point3D(0, 1, 0)
      ];
      const name = ann.getOrientationName();
      assert.isString(name, 'returns a string');
      assert.isNotEmpty(name, 'name is not empty');
    }
  );

  // -------------------------------------------------------------------------
  // init
  // -------------------------------------------------------------------------

  /**
   * Tests for {@link Annotation#init} setting annotation fields.
   *
   * @function module:tests/image~annotationInit
   */
  test('Annotation init sets referencedSopInstanceUID and enables canView',
    () => {
      const ann = new Annotation();
      const vc = new MockViewController({uid: 'sop-001'});
      ann.init(vc);

      assert.equal(ann.referencedSopInstanceUID, 'sop-001');
      assert.isDefined(ann.referencedSopClassUID);
      assert.isTrue(ann.canView(), 'canView is true after init');
      assert.isUndefined(ann.referencedFrameNumber,
        'no frame number for 3D position');
    }
  );

  /**
   * Tests that a second {@link Annotation#init} call is a no-op.
   *
   * @function module:tests/image~annotationInitTwice
   */
  test('Annotation init is a no-op when called a second time', () => {
    const debugSpy = vi.spyOn(loggerModule.logger, 'debug')
      .mockImplementation(() => {});
    const ann = new Annotation();
    const vc = new MockViewController({uid: 'sop-001'});
    ann.init(vc);

    const vc2 = new MockViewController({uid: 'sop-002'});
    ann.init(vc2);

    // UID must stay from first init, debug must have been called
    assert.equal(ann.referencedSopInstanceUID, 'sop-001');
    assert.equal(debugSpy.mock.calls.length, 1);
  });

  /**
   * Tests that init stores planePoints for non-acquisition orientation.
   *
   * @function module:tests/image~annotationInitOriented
   */
  test('Annotation init stores planePoints for oblique orientation', () => {
    const ann = new Annotation();
    const vc = new MockViewController({acquisitionOrientation: false});
    ann.init(vc);

    assert.isDefined(ann.planePoints,
      'planePoints set for non-acquisition orientation');
    assert.equal(ann.planePoints.length, 3);
  });

  // -------------------------------------------------------------------------
  // setViewController
  // -------------------------------------------------------------------------

  /**
   * Tests that {@link Annotation#setViewController} warns on unknown UID.
   *
   * @function module:tests/image~annotationSetVcUnknownUid
   */
  test('Annotation setViewController warns when UID does not match', () => {
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});
    const ann = new Annotation();
    ann.referencedSopInstanceUID = 'sop-001';

    const vc = new MockViewController({uid: 'sop-999'});
    ann.setViewController(vc);

    assert.equal(warnSpy.mock.calls.length, 1, 'warning emitted');
    assert.isFalse(ann.canView(), 'canView still false');
  });

  /**
   * Tests that {@link Annotation#setViewController} is rejected for
   * incompatible views.
   *
   * @function module:tests/image~annotationSetVcIncompatible
   */
  test('Annotation setViewController is ignored for incompatible view', () => {
    const ann = new Annotation();
    ann.referencedSopInstanceUID = 'sop-001';
    // Set planePoints so isCompatibleView checks cosines
    ann.planePoints = [
      new Point3D(0, 0, 0),
      new Point3D(1, 0, 0),
      new Point3D(0, 1, 0)
    ];

    const incompatibleHelper = {getCosines: () => [0, 1, 0, 0, 0, 1]};
    const vc = new MockViewController({
      uid: 'sop-001',
      planeHelper: incompatibleHelper
    });
    ann.setViewController(vc);

    assert.isFalse(ann.canView(), 'canView still false for incompatible view');
  });

  /**
   * Tests that {@link Annotation#setViewController} succeeds for
   * a compatible view.
   *
   * @function module:tests/image~annotationSetVcCompatible
   */
  test('Annotation setViewController enables canView for compatible view',
    () => {
      const ann = new Annotation();
      ann.referencedSopInstanceUID = 'sop-001';
      // No planePoints → compatible with any acquisition-orientation view
      const vc = new MockViewController({
        uid: 'sop-001',
        planeHelper: {isAquisitionOrientation: () => true}
      });
      ann.setViewController(vc);

      assert.isTrue(ann.canView());
    });

  // -------------------------------------------------------------------------
  // setTextExpr
  // -------------------------------------------------------------------------

  /**
   * Tests for {@link Annotation#setTextExpr} without a view controller.
   *
   * @function module:tests/image~annotationSetTextNoVc
   */
  test('Annotation setTextExpr warns when no view controller is set', () => {
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});
    const ann = new Annotation();
    ann.setTextExpr({'*': 'fallback'});

    assert.equal(warnSpy.mock.calls.length, 1);
    assert.equal(ann.textExpr, '', 'textExpr unchanged');
  });

  /**
   * Tests for {@link Annotation#setTextExpr} using modality-specific text.
   *
   * @function module:tests/image~annotationSetTextModality
   */
  test('Annotation setTextExpr uses modality-specific text when available',
    () => {
      const ann = new Annotation();
      const vc = new MockViewController({uid: 'sop-001', modality: 'MR'});
      ann.init(vc);

      ann.setTextExpr({MR: 'MR label', CT: 'CT label', '*': 'default'});
      assert.equal(ann.textExpr, 'MR label');
    }
  );

  /**
   * Tests for {@link Annotation#setTextExpr} falling back to '*'.
   *
   * @function module:tests/image~annotationSetTextFallback
   */
  test('Annotation setTextExpr falls back to "*" key for unknown modality',
    () => {
      const ann = new Annotation();
      const vc = new MockViewController({uid: 'sop-001', modality: 'PT'});
      ann.init(vc);

      ann.setTextExpr({CT: 'CT label', '*': 'default label'});
      assert.equal(ann.textExpr, 'default label');
    }
  );

  // -------------------------------------------------------------------------
  // getFactory
  // -------------------------------------------------------------------------

  /**
   * Tests for {@link Annotation#getFactory} when no mathShape is set.
   *
   * @function module:tests/image~annotationGetFactoryNoShape
   */
  test('Annotation getFactory returns undefined when mathShape is not set',
    () => {
      const ann = new Annotation();
      assert.isUndefined(ann.getFactory());
    }
  );

  /**
   * Tests for {@link Annotation#getFactory} when no factory supports
   * the given shape.
   *
   * @function module:tests/image~annotationGetFactoryNoMatch
   */
  test('Annotation getFactory warns and returns undefined ' +
    'for unsupported shape',
  () => {
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});
    const ann = new Annotation();
    // Plain object — no registered factory will call supports() → true
    ann.mathShape = {};

    assert.isUndefined(ann.getFactory());
    assert.equal(warnSpy.mock.calls.length, 1, 'warning emitted');
    assert.ok(warnSpy.mock.calls[0][0].includes('factory'),
      'warning mentions factory');
  }
  );

});
