/**
 * Mouse wheel handling for tools that forward `wheel` into a layer-group
 * pointer (see `LayerGroupPointer.handleWheel`).
 */
export class WheelBehavior {

  /**
   * @param {WheelEvent} _event The wheel event.
   */
  wheel(_event) {
    // override in subclass
  }

}
