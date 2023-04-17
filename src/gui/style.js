import {getShadowColour} from '../utils/colour';

/**
 * Style class.
 */
export class Style {
  /**
   * Font size.
   *
   * @private
   * @type {number}
   */
  #fontSize = 10;

  /**
   * Font family.
   *
   * @private
   * @type {string}
   */
  #fontFamily = 'Verdana';

  /**
   * Text colour.
   *
   * @private
   * @type {string}
   */
  #textColour = '#fff';

  /**
   * Line colour.
   *
   * @private
   * @type {string}
   */
  #lineColour = '#ffff80';

  /**
   * Base scale.
   *
   * @private
   * @type {object}
   */
  #baseScale = {x: 1, y: 1};

  /**
   * Zoom scale.
   *
   * @private
   * @type {object}
   */
  #zoomScale = {x: 1, y: 1};

  /**
   * Stroke width.
   *
   * @private
   * @type {number}
   */
  #strokeWidth = 2;

  /**
   * Shadow offset.
   *
   * @private
   * @type {object}
   */
  #shadowOffset = {x: 0.25, y: 0.25};

  /**
   * Tag opacity.
   *
   * @private
   * @type {number}
   */
  #tagOpacity = 0.2;

  /**
   * Text padding.
   *
   * @private
   * @type {number}
   */
  #textPadding = 3;

  /**
   * Get the font family.
   *
   * @returns {string} The font family.
   */
  getFontFamily() {
    return this.#fontFamily;
  }

  /**
   * Get the font size.
   *
   * @returns {number} The font size.
   */
  getFontSize() {
    return this.#fontSize;
  }

  /**
   * Get the stroke width.
   *
   * @returns {number} The stroke width.
   */
  getStrokeWidth() {
    return this.#strokeWidth;
  }

  /**
   * Get the text colour.
   *
   * @returns {string} The text colour.
   */
  getTextColour() {
    return this.#textColour;
  }

  /**
   * Get the line colour.
   *
   * @returns {string} The line colour.
   */
  getLineColour() {
    return this.#lineColour;
  }

  /**
   * Set the line colour.
   *
   * @param {string} colour The line colour.
   */
  setLineColour(colour) {
    this.#lineColour = colour;
  }

  /**
   * Set the base scale.
   *
   * @param {number} scale The scale as {x,y}.
   */
  setBaseScale(scale) {
    this.#baseScale = scale;
  }

  /**
   * Set the zoom scale.
   *
   * @param {object} scale The scale as {x,y}.
   */
  setZoomScale(scale) {
    this.#zoomScale = scale;
  }

  /**
   * Get the base scale.
   *
   * @returns {number} The scale as {x,y}.
   */
  getBaseScale() {
    return this.#baseScale;
  }

  /**
   * Get the zoom scale.
   *
   * @returns {object} The scale as {x,y}.
   */
  getZoomScale() {
    return this.#zoomScale;
  }

  /**
   * Scale an input value using the base scale.
   *
   * @param {number} value The value to scale.
   * @returns {number} The scaled value.
   */
  scale(value) {
    // TODO: 2D?
    return value / this.#baseScale.x;
  }

  /**
   * Apply zoom scale on an input value.
   *
   * @param {number} value The value to scale.
   * @returns {object} The scaled value as {x,y}.
   */
  applyZoomScale(value) {
    // times 2 so that the font size 10 looks like a 10...
    // (same logic as in the DrawController::updateLabelScale)
    return {
      x: 2 * value / this.#zoomScale.x,
      y: 2 * value / this.#zoomScale.y
    };
  }

  /**
   * Get the shadow offset.
   *
   * @returns {object} The offset as {x,y}.
   */
  getShadowOffset() {
    return this.#shadowOffset;
  }

  /**
   * Get the tag opacity.
   *
   * @returns {number} The opacity.
   */
  getTagOpacity() {
    return this.#tagOpacity;
  }

  /**
   * Get the text padding.
   *
   * @returns {number} The padding.
   */
  getTextPadding() {
    return this.#textPadding;
  }

  /**
   * Get the font definition string.
   *
   * @returns {string} The font definition string.
   */
  getFontStr() {
    return ('normal ' + this.getFontSize() + 'px sans-serif');
  }

  /**
   * Get the line height.
   *
   * @returns {number} The line height.
   */
  getLineHeight() {
    return (this.getFontSize() + this.getFontSize() / 5);
  }

  /**
   * Get the font size scaled to the display.
   *
   * @returns {number} The scaled font size.
   */
  getScaledFontSize() {
    return this.scale(this.getFontSize());
  }

  /**
   * Get the stroke width scaled to the display.
   *
   * @returns {number} The scaled stroke width.
   */
  getScaledStrokeWidth() {
    return this.scale(this.getStrokeWidth());
  }

  /**
   * Get the shadow line colour.
   *
   * @returns {string} The shadow line colour.
   */
  getShadowLineColour() {
    return getShadowColour(this.getLineColour());
  }

} // class Style