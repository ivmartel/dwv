import {mergeGeometries} from './geometry';

// doc imports
/* eslint-disable no-unused-vars */
import {Point} from '../math/point';
import {Index} from '../math/index';
import {View} from './view';
import {Geometry} from './geometry';
/* eslint-enable no-unused-vars */

class ViewPositionAccessor {
  /**
   * @type {View}
   */
  #view;
  /**
   * @param {View} view The view.
   */
  constructor(view) {
    this.#view = view;
  }
  /**
   * Get the current position.
   *
   * @returns {Point} The position.
   */
  getCurrentPosition() {
    return this.#view.getCurrentPosition();
  }
  /**
   * Set the current position.
   *
   * @param {Point} position The position.
   * @param {boolean} [silent] Flag to fire event or not.
   * @returns {boolean} True if possible and in bounds.
   */
  setCurrentPosition(position, silent) {
    let res = false;
    if (typeof position !== 'undefined') {
      res = this.#view.setCurrentPosition(position, silent);
    }
    return res;
  }
}

/**
 * Position helper.
 */
export class PositionHelper {

  /**
   * @type {ViewPositionAccessor}
   */
  #positionAccessor;

  /**
   * @type {Geometry}
   */
  #geometry;

  /**
   * @type {number}
   */
  #scrollDimIndex;

  /**
   * @param {View} view The associated view.
   */
  constructor(view) {
    this.#positionAccessor = new ViewPositionAccessor(view);
    this.#geometry = view.getImage().getGeometry();
    this.#scrollDimIndex = view.getScrollDimIndex();
  }

  /**
   * Get the geometry.
   *
   * @returns {Geometry} The geometry.
   */
  getGeometry() {
    return this.#geometry;
  }

  /**
   * Get the scroll index.
   *
   * @returns {number} The scroll index.
   */
  getScrollDimIndex() {
    return this.#scrollDimIndex;
  }

  /**
   * Get the maximum scroll index.
   *
   * @returns {number} The maximum index.
   */
  getMaximumScrollIndex() {
    return this.#geometry.getSize().get(this.#scrollDimIndex) - 1;
  }

  /**
   * Get the current position.
   *
   * @returns {Point} The current position.
   */
  getCurrentPosition() {
    return this.#positionAccessor.getCurrentPosition();
  }

  /**
   * Get the scroll index for the current position.
   *
   * @returns {number} The index.
   */
  getCurrentPositionScrollIndex() {
    const values = this.getCurrentIndex().getValues();
    return values[this.#scrollDimIndex];
  }

  /**
   * Get the current position updated at the provided scroll index.
   *
   * @param {number} index The scroll index.
   * @returns {Point} The position.
   */
  getCurrentPositionAtScrollIndex(index) {
    const values = this.getCurrentIndex().getValues();
    values[this.#scrollDimIndex] = index;
    return this.#geometry.indexToWorld(new Index(values));
  }

  /**
   * Get the current index.
   *
   * @returns {Index} The current index.
   */
  getCurrentIndex() {
    return this.#geometry.worldToIndex(this.getCurrentPosition());
  }

  /**
   * Set the current position.
   *
   * @param {Point} position The position.
   * @param {boolean} [silent] Flag to fire event or not.
   * @returns {boolean} True if possible and in bounds.
   */
  setCurrentPositon(position, silent) {
    let res = false;
    if (typeof position !== 'undefined') {
      res = this.#positionAccessor.setCurrentPosition(position, silent);
    }
    return res;
  }

  /**
   * Set the current position only if it is in the geometry bounds.
   *
   * @param {Point} position The position.
   * @param {boolean} [silent] Flag to fire event or not.
   * @returns {boolean} True if possible and in bounds.
   */
  setCurrentPositonSafe(position, silent) {
    let res = false;
    if (this.isPositionInBounds(position)) {
      res = this.setCurrentPositon(position, silent);
    }
    return res;
  }

  /**
   * Merge with another helper.
   *
   * @param {PositionHelper} rhs The helper to merge with this one.
   */
  merge(rhs) {
    // check compatibility
    if (this.#scrollDimIndex !== rhs.getScrollDimIndex()) {
      throw new Error(
        'Cannot merge helper of a view with different orientation'
      );
    }
    // merge geometries
    this.#geometry = mergeGeometries(this.#geometry, rhs.getGeometry());
  }

  /**
   * Check if the current position (default) or
   * the provided position is in bounds.
   *
   * @param {Point} position Optional position.
   * @returns {boolean} True is the position is in bounds.
   */
  isPositionInBounds(position) {
    const index = this.#geometry.worldToIndex(position);
    const dirs = [this.#scrollDimIndex];
    if (index.length() === 4) {
      dirs.push(3);
    }
    return this.#geometry.isIndexInBounds(index, dirs);
  }

  /**
   * Get the current position incremented in the input direction.
   *
   * @param {number} dim The direction in which to increment.
   * @returns {Point} The resulting point.
   */
  getIncrementPosition(dim) {
    const nextIndex = this.getCurrentIndex().next(dim);
    return this.#geometry.indexToWorld(nextIndex);
  }

  /**
   * Get the current position decremented in the input direction.
   *
   * @param {number} dim The direction in which to decrement.
   * @returns {Point} The resulting point.
   */
  getDecrementPosition(dim) {
    const previousIndex = this.getCurrentIndex().previous(dim);
    return this.#geometry.indexToWorld(previousIndex);
  }

  /**
   * Increment the current position along the provided dim.
   *
   * @param {number} dim The direction in which to increment.
   * @returns {boolean} True if possible and in bounds.
   */
  incrementPosition(dim) {
    return this.setCurrentPositonSafe(this.getIncrementPosition(dim));
  }

  /**
   * Decrement the current position along the provided dim.
   *
   * @param {number} dim The direction in which to decrement.
   * @returns {boolean} True if possible and in bounds.
   */
  decrementPosition(dim) {
    return this.setCurrentPositonSafe(this.getDecrementPosition(dim));
  }

  /**
   * Increment the current position along the scroll dimension.
   *
   * @returns {boolean} True if possible and in bounds.
   */
  incrementPositionAlongScroll() {
    return this.incrementPosition(this.#scrollDimIndex);
  }

  /**
   * Decrement the current position along the scroll dimension.
   *
   * @returns {boolean} True if possible and in bounds.
   */
  decrementPositionAlongScroll() {
    return this.decrementPosition(this.#scrollDimIndex);
  }

}