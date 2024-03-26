// import {defaults} from '../app/defaults';

// doc imports
/* eslint-disable no-unused-vars */
import {ViewController} from '../app/viewController';
import {Style} from '../gui/style';
/* eslint-enable no-unused-vars */

/**
 * Arrow factory.
 */
export class Select {
  /**
   * Get the name of the shape group.
   *
   * @returns {string} The name.
   */
  getGroupName() {
    return 'select-group';
  }

  /**
   * Get the number of points needed to build the shape.
   *
   * @returns {number} The number of points.
   */
  getNPoints() {
    return 2;
  }

  /**
   * Is the input group a group of this factory?
   *
   * @param {Konva.Group} group The group to test.
   * @returns {boolean} True if the group is from this fcatory.
   */
  isFactoryGroup(group) {
    return this.getGroupName() === group.name();
  }

  /**
   * Create an arrow shape to be displayed.
   *
   * @param {Point2D[]} points The points from which to extract the line.
   * @param {Style} style The drawing style.
   * @param {ViewController} viewController The associated view controller.
   * @returns {Konva.Group} The Konva group.
   */
  create(_points, _style, _viewController) {
    // const group = new Konva.Group();
    // group.name(this.getGroupName());
    // group.visible(true); // dont inherit
    return null;
  }

  /**
   * Update an arrow shape.
   *
   * @param {Konva.Ellipse} anchor The active anchor.
   * @param {Style} style The app style.
   * @param {ViewController} _viewController The associated view controller.
   */
  update(_anchor, _style, _viewController) {
    // does nothing
  }

} // class Select
