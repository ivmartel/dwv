// @vitest-environment jsdom
import Konva from 'konva';
import {assert, vi} from 'vitest';
import {Index} from '../../../src/math/index.js';
import {Point2D, Point3D} from '../../../src/math/point.js';
import {Rectangle} from '../../../src/math/rectangle.js';
import {RectangleFactory} from '../../../src/tools/shapes/rectangle.js';
import {makeStyle} from '../shapes/utils.js';

/**
 * Konva stage + layer group + app mocks for rectangle finalization tests.
 *
 * @returns {object} Fixture: app, layerGroup, konvaLayer, stage,
 *   addedAnnotations, cleanup.
 */
export function createRectangleDrawIntegrationSetup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const stage = new Konva.Stage({
    container,
    width: 512,
    height: 512
  });
  const konvaLayer = new Konva.Layer();
  stage.add(konvaLayer);

  /** @type {unknown[]} */
  const addedAnnotations = [];

  const mockVc = {
    getCurrentPosition: vi.fn(() => ({
      length: () => 3,
      get: () => 0
    })),
    getCurrentImageUid: vi.fn(() => 'uid-test'),
    getSopClassUid: vi.fn(() => '1.2.840'),
    getModality: vi.fn(() => 'CT'),
    isAquisitionOrientation: vi.fn(() => true),
    getOriginForImageUid: vi.fn(() => new Point3D(0, 0, 0)),
    getIndexFromPosition: vi.fn(() => new Index([0, 0, 0])),
    get2DSpacing: vi.fn(() => ({x: 1, y: 1})),
    getLengthUnit: vi.fn(() => 'unit.mm'),
    canQuantifyImage: vi.fn(() => false),
    validatePlanePoint: vi.fn(() => true)
  };

  const viewLayer = {
    getViewController: vi.fn(() => mockVc),
    displayToPlanePos: vi.fn((p) => new Point2D(p.getX(), p.getY())),
    getDataId: vi.fn(() => 'vl-data')
  };

  const drawController = {
    addAnnotation: vi.fn((ann) => {
      addedAnnotations.push(ann);
    }),
    getAnnotationGroup: vi.fn(() => ({
      getColour: vi.fn(() => undefined),
      isEditable: vi.fn(() => false)
    }))
  };

  const drawLayer = {
    getDataId: vi.fn(() => 'draw-data'),
    getReferenceLayerId: vi.fn(() => 'ref-layer'),
    getKonvaStage: vi.fn(() => stage),
    getKonvaLayer: vi.fn(() => konvaLayer),
    getDrawController: vi.fn(() => drawController),
    setLabelVisibility: vi.fn()
  };

  const layerGroup = {
    getActiveDrawLayer: vi.fn(() => drawLayer),
    getViewLayerById: vi.fn(() => viewLayer)
  };

  const factoryStyle = makeStyle();
  const appStyle = {
    ...factoryStyle,
    getLineColour: vi.fn(() => '#ffff80'),
    setLineColour: vi.fn(),
    setZoomScale: vi.fn()
  };

  const addToUndoStack = vi.fn();
  const app = {
    getStyle: vi.fn(() => appStyle),
    getData: vi.fn(() => ({
      image: {
        getMeta: vi.fn(() => ({})),
        isResampled: vi.fn(() => false)
      },
      annotationGroup: {
        getMeta: vi.fn(() => ({}))
      }
    })),
    getUndoController: vi.fn(() => ({addToUndoStack})),
    addToUndoStack
  };

  const cleanup = () => {
    container.remove();
  };

  return {
    app,
    layerGroup,
    konvaLayer,
    stage,
    addedAnnotations,
    cleanup
  };
}

/**
 * Assert a finalized annotation is a rectangle with expected display corners.
 *
 * @param {unknown} annotation Annotation passed to
 *   {@link DrawController#addAnnotation}.
 * @param {Point2D} begin Expected begin (plane / display in fixture).
 * @param {Point2D} end Expected end.
 */
export function assertRectangleAnnotationOk(annotation, begin, end) {
  const ann = /** @type {{mathShape: Rectangle}} */ (annotation);
  assert.ok(ann.mathShape instanceof Rectangle);
  assert.equal(ann.mathShape.getBegin().getX(), begin.getX());
  assert.equal(ann.mathShape.getBegin().getY(), begin.getY());
  assert.equal(ann.mathShape.getEnd().getX(), end.getX());
  assert.equal(ann.mathShape.getEnd().getY(), end.getY());
}

export {RectangleFactory};
