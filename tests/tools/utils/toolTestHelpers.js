import {vi} from 'vitest';

/**
 * Create a minimal Style mock covering all methods used by
 * shape factories and LabelFactory.
 *
 * @returns {object} The style mock.
 */
export function makeStyle() {
  return {
    /** @returns {number} Stroke width. */
    getStrokeWidth: () => 2,
    /** @returns {{x: number, y: number}} Zoom scale. */
    getZoomScale: () => ({x: 1, y: 1}),
    /** @param {number} n Value to scale. @returns {{x: number, y: number}} */
    applyZoomScale: (n) => ({x: n, y: n}),
    /** @returns {number} Font size in pixels. */
    getFontSize: () => 12,
    /** @returns {string} Font family name. */
    getFontFamily: () => 'Arial',
    /** @returns {number} Text padding in pixels. */
    getTextPadding: () => 2,
    /** @returns {string} Shadow line colour. */
    getShadowLineColour: () => '#000',
    /** @returns {{x: number, y: number}} Shadow offset. */
    getShadowOffset: () => ({x: 1, y: 1}),
    /** @returns {number} Tag background opacity. */
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
 * @returns {{group: import('konva').Group, anchors: import('konva').Ellipse[]}}
 *   The Konva group and the anchor list.
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
