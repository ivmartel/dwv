/**
 * Framework-agnostic anchor point.
 *
 * Carries the anchor's id and (x, y) position.  Annotators receive Anchor
 * objects and therefore have no dependency on Konva.
 *
 * The id convention ('anchor0', 'anchor1', …) is owned by this class via
 * the static {@link Anchor.idFromIndex}, {@link Anchor.indexFromId}, and
 * {@link Anchor.fromIndex} helpers.  All callers that need to create or
 * look up anchors by numeric index should use these helpers rather than
 * building the string themselves.
 */
export class Anchor {

  /**
   * @type {string}
   */
  #id;

  /**
   * @type {number}
   */
  #x;

  /**
   * @type {number}
   */
  #y;

  /**
   * @param {string} id Anchor id (e.g. 'anchor0').
   * @param {number} x X coordinate.
   * @param {number} y Y coordinate.
   */
  constructor(id, x, y) {
    this.#id = id;
    this.#x = x;
    this.#y = y;
  }

  // -------------------------------------------------------------------------
  // Static id helpers — single place that owns the 'anchor<N>' convention
  // -------------------------------------------------------------------------

  /**
   * Return the standard anchor id for a numeric index.
   *
   * @param {number} index The anchor index (0-based).
   * @returns {string} The anchor id (e.g. 'anchor0').
   */
  static idFromIndex(index) {
    return `anchor${index}`;
  }

  /**
   * Parse the numeric index from a standard anchor id.
   *
   * @param {string} id The anchor id (e.g. 'anchor2').
   * @returns {number} The numeric index.
   */
  static indexFromId(id) {
    return parseInt(id.replace('anchor', ''), 10);
  }

  /**
   * Create an anchor using the standard indexed id convention.
   *
   * @param {number} index The anchor index.
   * @param {number} x X coordinate.
   * @param {number} y Y coordinate.
   * @returns {Anchor} A new Anchor.
   */
  static fromIndex(index, x, y) {
    return new Anchor(Anchor.idFromIndex(index), x, y);
  }

  // -------------------------------------------------------------------------
  // Instance API
  // -------------------------------------------------------------------------

  /**
   * Get the anchor id.
   *
   * @returns {string} The id.
   */
  getId() {
    return this.#id;
  }

  /**
   * Get the x coordinate.
   *
   * @returns {number} The x coordinate.
   */
  getX() {
    return this.#x;
  }

  /**
   * Get the y coordinate.
   *
   * @returns {number} The y coordinate.
   */
  getY() {
    return this.#y;
  }

  /**
   * Set the x coordinate.
   *
   * @param {number} x The new x coordinate.
   */
  setX(x) {
    this.#x = x;
  }

  /**
   * Set the y coordinate.
   *
   * @param {number} y The new y coordinate.
   */
  setY(y) {
    this.#y = y;
  }

} // Anchor
