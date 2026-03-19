import {vi} from 'vitest';

/**
 * Create a minimal Style mock covering all methods used by
 * shape factories and LabelFactory.
 *
 * @returns {object} The style mock.
 */
export function makeStyle() {
  return {
    getStrokeWidth: () => 2,
    getZoomScale: () => ({x: 1, y: 1}),
    applyZoomScale: (n) => ({x: n, y: n}),
    getFontSize: () => 12,
    getFontFamily: () => 'Arial',
    getTextPadding: () => 2,
    getShadowLineColour: () => '#000',
    getShadowOffset: () => ({x: 1, y: 1}),
    getTagOpacity: () => 0.5,
  };
}

/**
 * Create a minimal Annotation-like mock for factory tests.
 *
 * The returned object has all standard annotation fields; pass any
 * math shape as `mathShape`.  For factories that require extra fields
 * (e.g. ArrowFactory's `referencePoints`) extend the object at the
 * call site.
 *
 * @param {object} [mathShape] The math shape to assign.
 * @returns {object} The annotation mock.
 */
export function makeAnnotation(mathShape) {
  return {
    mathShape,
    colour: '#ffff80',
    trackingUid: 'test-uid',
    labelPosition: undefined,
    textExpr: '',
    quantification: {},
    setTextExpr: vi.fn(),
    updateQuantification: vi.fn(),
    getText: () => '',
  };
}

/**
 * Build a full Konva group for an annotation and attach the factory
 * anchors to it, mirroring the real draw-controller setup so that
 * `updateAnnotationOnAnchorMove` and `updateShapeGroupOnAnchorMove` work.
 *
 * @param {object} factory The shape factory under test.
 * @param {object} ann The annotation mock.
 * @param {object} style The style mock.
 * @returns {object} The Konva group and anchor list.
 */
export function makeShapeGroupWithAnchors(factory, ann, style) {
  const group = factory.createShapeGroup(ann, style);
  const shape = group.getChildren((n) => n.name() === 'shape')[0];
  const anchors = factory.getAnchors(shape, style);
  for (const anchor of anchors) {
    group.add(anchor);
  }
  return {group, anchors};
}
