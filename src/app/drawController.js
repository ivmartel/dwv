import {getIndexFromStringId} from '../math/index';
import {logger} from '../utils/logger';
import {replaceFlags} from '../utils/string';
import {getShadowColour} from '../utils/colour';
import {
  getShapeDisplayName,
  DrawGroupCommand,
  DeleteGroupCommand
} from '../tools/drawCommands';

// doc imports
/* eslint-disable no-unused-vars */
import {Index} from '../math/index';
import {DrawLayer} from '../gui/drawLayer';
/* eslint-enable no-unused-vars */

/**
 * Konva.
 *
 * Ref: {@link https://konvajs.org/}.
 *
 * @external Konva
 */
import Konva from 'konva';

/**
 * Draw meta data.
 */
export class DrawMeta {
  /**
   * Draw quantification.
   *
   * @type {object}
   */
  quantification;

  /**
   * Draw text expression. Can contain variables surrounded with '{}' that will
   * be extracted from the quantification object.
   *
   * @type {string}
   */
  textExpr;
}

/**
 * Draw details.
 */
export class DrawDetails {
  /**
   * The draw ID.
   *
   * @type {number}
   */
  id;

  /**
   * The draw position: an Index converted to string.
   *
   * @type {string}
   */
  position;

  /**
   * The draw type.
   *
   * @type {string}
   */
  type;

  /**
   * The draw color: for example 'green', '#00ff00' or 'rgb(0,255,0)'.
   *
   * @type {string}
   */
  color;

  /**
   * The draw meta.
   *
   * @type {DrawMeta}
   */
  meta;
}

/**
 * Is an input node's name 'shape'.
 *
 * @param {Konva.Node} node A Konva node.
 * @returns {boolean} True if the node's name is 'shape'.
 */
export function isNodeNameShape(node) {
  return node.name() === 'shape';
}

/**
 * Is a node an extra shape associated with a main one.
 *
 * @param {Konva.Node} node A Konva node.
 * @returns {boolean} True if the node's name starts with 'shape-'.
 */
export function isNodeNameShapeExtra(node) {
  return node.name().startsWith('shape-');
}

/**
 * Is an input node's name 'label'.
 *
 * @param {Konva.Node} node A Konva node.
 * @returns {boolean} True if the node's name is 'label'.
 */
export function isNodeNameLabel(node) {
  return node.name() === 'label';
}

/**
 * Is an input node a position node.
 *
 * @param {Konva.Node} node A Konva node.
 * @returns {boolean} True if the node's name is 'position-group'.
 */
export function isPositionNode(node) {
  return node.name() === 'position-group';
}

/**
 * @callback testFn
 * @param {Konva.Node} node The node.
 * @returns {boolean} True if the node passes the test.
 */

/**
 * Get a lambda to check a node's id.
 *
 * @param {string} id The id to check.
 * @returns {testFn} A function to check a node's id.
 */
export function isNodeWithId(id) {
  return function (node) {
    return node.id() === id;
  };
}

/**
 * Is the input node a node that has the 'stroke' method.
 *
 * @param {Konva.Node} node A Konva node.
 * @returns {boolean} True if the node's name is 'anchor' and 'label'.
 */
export function canNodeChangeColour(node) {
  return node.name() !== 'anchor' && node.name() !== 'label';
}

/**
 * Debug function to output the layer hierarchy as text.
 *
 * @param {object} layer The Konva layer.
 * @param {string} prefix A display prefix (used in recursion).
 * @returns {string} A text representation of the hierarchy.
 */
export function getHierarchyLog(layer, prefix) {
  if (typeof prefix === 'undefined') {
    prefix = '';
  }
  const kids = layer.getChildren();
  let log = prefix + '|__ ' + layer.name() + ': ' + layer.id() + '\n';
  for (let i = 0; i < kids.length; ++i) {
    log += getHierarchyLog(kids[i], prefix + '    ');
  }
  return log;
}

/**
 * Draw controller.
 */
export class DrawController {

  /**
   * The draw layer.
   *
   * @type {DrawLayer}
   */
  #drawLayer;

  /**
   * The Konva layer.
   *
   * @type {Konva.Layer}
   */
  #konvaLayer;

  /**
   * Current position group id.
   *
   * @type {string}
   */
  #currentPosGroupId = null;

  /**
   * @param {DrawLayer} drawLayer The draw layer.
   */
  constructor(drawLayer) {
    this.#drawLayer = drawLayer;
    this.#konvaLayer = drawLayer.getKonvaLayer();
  }

  /**
   * Get the current position group.
   *
   * @returns {Konva.Group|undefined} The Konva.Group.
   */
  getCurrentPosGroup() {
    // get position groups
    const posGroups = this.#konvaLayer.getChildren((node) => {
      return node.id() === this.#currentPosGroupId;
    });
    // if one group, use it
    // if no group, create one
    let posGroup;
    if (posGroups.length === 1) {
      if (posGroups[0] instanceof Konva.Group) {
        posGroup = posGroups[0];
      }
    } else if (posGroups.length === 0) {
      posGroup = new Konva.Group();
      posGroup.name('position-group');
      posGroup.id(this.#currentPosGroupId);
      posGroup.visible(true); // dont inherit
      // add new group to layer
      this.#konvaLayer.add(posGroup);
    } else {
      logger.warn('Unexpected number of draw position groups.');
    }
    // return
    return posGroup;
  }

  /**
   * Reset: clear the layers array.
   */
  reset() {
    this.#konvaLayer = null;
  }

  /**
   * Get a Konva group using its id.
   *
   * @param {string} id The group id.
   * @returns {object|undefined} The Konva group.
   */
  getGroup(id) {
    const group = this.#konvaLayer.findOne('#' + id);
    if (typeof group === 'undefined') {
      logger.warn('Cannot find node with id: ' + id
      );
    }
    return group;
  }

  /**
   * Activate the current draw layer.
   *
   * @param {Index} index The current position.
   * @param {number} scrollIndex The scroll index.
   */
  activateDrawLayer(index, scrollIndex) {
    // TODO: add layer info
    // get and store the position group id
    const dims = [scrollIndex];
    for (let j = 3; j < index.length(); ++j) {
      dims.push(j);
    }
    this.#currentPosGroupId = index.toStringId(dims);

    // get all position groups
    const posGroups = this.#konvaLayer.getChildren(isPositionNode);
    // reset or set the visible property
    let visible;
    for (let i = 0, leni = posGroups.length; i < leni; ++i) {
      visible = false;
      if (posGroups[i].id() === this.#currentPosGroupId) {
        visible = true;
      }
      // group members inherit the visible property
      posGroups[i].visible(visible);
    }

    // show current draw layer
    this.#konvaLayer.draw();
  }

  /**
   * Get a list of drawing display details.
   *
   * @returns {DrawDetails[]} A list of draw details.
   */
  getDrawDisplayDetails() {
    const list = [];
    const groups = this.#konvaLayer.getChildren();
    for (let j = 0, lenj = groups.length; j < lenj; ++j) {
      const position = getIndexFromStringId(groups[j].id());
      // @ts-ignore
      const collec = groups[j].getChildren();
      for (let i = 0, leni = collec.length; i < leni; ++i) {
        const shape = collec[i].getChildren(isNodeNameShape)[0];
        const label = collec[i].getChildren(isNodeNameLabel)[0];
        const text = label.getChildren()[0];
        let type = shape.className;
        if (type === 'Line') {
          const shapeExtrakids = collec[i].getChildren(
            isNodeNameShapeExtra);
          if (shape.closed()) {
            type = 'Roi';
          } else if (shapeExtrakids.length !== 0) {
            const extraName0 = shapeExtrakids[0].name();
            if (extraName0.indexOf('triangle') !== -1) {
              type = 'Arrow';
            } else if (extraName0.indexOf('arc') !== -1) {
              type = 'Protractor';
            } else {
              type = 'Ruler';
            }
          }
        }
        if (type === 'Rect') {
          type = 'Rectangle';
        }
        list.push({
          id: collec[i].id(),
          position: position.toString(),
          type: type,
          color: shape.stroke(),
          meta: text.meta
        });
      }
    }
    return list;
  }

  /**
   * Get a list of drawing store details. Used in state.
   *
   * @returns {object} A list of draw details including id, text, quant...
   * TODO Unify with getDrawDisplayDetails?
   */
  getDrawStoreDetails() {
    const drawingsDetails = {};

    // get all position groups
    const posGroups = this.#konvaLayer.getChildren(isPositionNode);

    let posKids;
    let group;
    for (let i = 0, leni = posGroups.length; i < leni; ++i) {
      // @ts-ignore
      posKids = posGroups[i].getChildren();
      for (let j = 0, lenj = posKids.length; j < lenj; ++j) {
        group = posKids[j];
        // remove anchors
        const anchors = group.find('.anchor');
        for (let a = 0; a < anchors.length; ++a) {
          anchors[a].remove();
        }
        // get text
        const texts = group.find('.text');
        if (texts.length !== 1) {
          logger.warn('There should not be more than one text per shape.');
        }
        // get meta (non konva vars)
        drawingsDetails[group.id()] = {
          meta: texts[0].meta
        };
      }
    }
    return drawingsDetails;
  }

  /**
   * Set the drawings on the current stage.
   *
   * @param {Array} drawings An array of drawings.
   * @param {DrawDetails[]} drawingsDetails An array of drawings details.
   * @param {object} cmdCallback The DrawCommand callback.
   * @param {object} exeCallback The callback to call once the
   *   DrawCommand has been executed.
   */
  setDrawings(
    drawings, drawingsDetails, cmdCallback, exeCallback) {
    // regular Konva deserialize
    const stateLayer = Konva.Node.create(drawings);

    // get all position groups
    const statePosGroups = stateLayer.getChildren(isPositionNode);

    for (let i = 0, leni = statePosGroups.length; i < leni; ++i) {
      const statePosGroup = statePosGroups[i];

      // Get or create position-group if it does not exist and
      // append it to konvaLayer
      let posGroup = this.#konvaLayer.getChildren(
        isNodeWithId(statePosGroup.id()))[0];
      if (typeof posGroup === 'undefined') {
        posGroup = new Konva.Group({
          id: statePosGroup.id(),
          name: 'position-group',
          visible: false
        });
        this.#konvaLayer.add(posGroup);
      }

      const statePosKids = statePosGroup.getChildren();
      for (let j = 0, lenj = statePosKids.length; j < lenj; ++j) {
        // shape group (use first one since it will be removed from
        // the group when we change it)
        const stateGroup = statePosKids[0];
        // add group to posGroup (switches its parent)
        // @ts-ignore
        posGroup.add(stateGroup);
        // shape
        const shape = stateGroup.getChildren(isNodeNameShape)[0];
        // create the draw command
        const cmd = new DrawGroupCommand(
          stateGroup,
          shape.className,
          this.#drawLayer
        );
        // draw command callbacks
        cmd.onExecute = cmdCallback;
        cmd.onUndo = cmdCallback;
        // details
        if (drawingsDetails) {
          const details = drawingsDetails[stateGroup.id()];
          const label = stateGroup.getChildren(isNodeNameLabel)[0];
          const text = label.getText();
          // store details
          text.meta = details.meta;
          // reset text (it was not encoded)
          text.setText(replaceFlags(
            text.meta.textExpr, text.meta.quantification
          ));
        }
        // execute
        cmd.execute();
        exeCallback(cmd);
      }
    }
  }

  /**
   * Update a drawing from its details.
   *
   * @param {DrawDetails} drawDetails Details of the drawing to update.
   */
  updateDraw(drawDetails) {
    // get the group
    const group = this.#konvaLayer.findOne('#' + drawDetails.id);
    if (typeof group === 'undefined') {
      logger.warn(
        '[updateDraw] Cannot find group with id: ' + drawDetails.id
      );
      return;
    }
    // shape
    // @ts-ignore
    const shapes = group.getChildren(isNodeNameShape);
    for (let i = 0; i < shapes.length; ++i) {
      shapes[i].stroke(drawDetails.color);
    }
    // shape extra
    // @ts-ignore
    const shapesExtra = group.getChildren(isNodeNameShapeExtra);
    for (let j = 0; j < shapesExtra.length; ++j) {
      if (typeof shapesExtra[j].stroke() !== 'undefined') {
        shapesExtra[j].stroke(drawDetails.color);
      } else if (typeof shapesExtra[j].fill() !== 'undefined') {
        // for example text
        shapesExtra[j].fill(drawDetails.color);
      }
    }
    // label
    // @ts-ignore
    const label = group.getChildren(isNodeNameLabel)[0];
    const shadowColor = getShadowColour(drawDetails.color);
    const kids = label.getChildren();
    for (let k = 0; k < kids.length; ++k) {
      const kid = kids[k];
      kid.fill(drawDetails.color);
      if (kids[k].className === 'Text') {
        const text = kids[k];
        text.shadowColor(shadowColor);
        if (typeof drawDetails.meta !== 'undefined') {
          text.meta = drawDetails.meta;
          text.setText(replaceFlags(
            text.meta.textExpr, text.meta.quantification
          ));
          label.setVisible(text.meta.textExpr.length !== 0);
        }
      }
    }

    // udpate current layer
    this.#konvaLayer.draw();
  }

  /**
   * Delete a Draw from the stage.
   *
   * @param {Konva.Group} group The group to delete.
   * @param {object} cmdCallback The DeleteCommand callback.
   * @param {object} exeCallback The callback to call once the
   *  DeleteCommand has been executed.
   */
  deleteDrawGroup(group, cmdCallback, exeCallback) {
    const shape = group.getChildren(isNodeNameShape)[0];
    if (!(shape instanceof Konva.Shape)) {
      return;
    }
    const shapeDisplayName = getShapeDisplayName(shape);
    const delcmd = new DeleteGroupCommand(
      group,
      shapeDisplayName,
      this.#drawLayer
    );
    delcmd.onExecute = cmdCallback;
    delcmd.onUndo = cmdCallback;
    delcmd.execute();
    // callback
    if (typeof exeCallback !== 'undefined') {
      exeCallback(delcmd);
    }
  }

  /**
   * Delete a Draw from the stage.
   *
   * @param {string} id The id of the group to delete.
   * @param {Function} cmdCallback The DeleteCommand callback.
   * @param {Function} exeCallback The callback to call once the
   *  DeleteCommand has been executed.
   * @returns {boolean} False if the group cannot be found.
   */
  deleteDraw(id, cmdCallback, exeCallback) {
    // get the group
    const group = this.getGroup(id);
    if (typeof group === 'undefined') {
      return false;
    }
    // delete
    this.deleteDrawGroup(group, cmdCallback, exeCallback);

    return true;
  }

  /**
   * Delete all Draws from the stage.
   *
   * @param {Function} cmdCallback The DeleteCommand callback.
   * @param {Function} exeCallback The callback to call once the
   *  DeleteCommand has been executed.
   */
  deleteDraws(cmdCallback, exeCallback) {
    const posGroups = this.#konvaLayer.getChildren();
    for (const posGroup of posGroups) {
      if (posGroup instanceof Konva.Group) {
        const shapeGroups = posGroup.getChildren();
        while (shapeGroups.length) {
          if (shapeGroups[0] instanceof Konva.Group) {
            this.deleteDrawGroup(shapeGroups[0], cmdCallback, exeCallback);
          }
        }
      } else {
        logger.warn('Found non group in layer while deleting');
      }
    }
  }

  /**
   * Get the total number of draws
   * (at all positions).
   *
   * @returns {number} The total number of draws.
   */
  getNumberOfDraws() {
    const posGroups = this.#konvaLayer.getChildren();
    let count = 0;
    for (const posGroup of posGroups) {
      if (posGroup instanceof Konva.Group) {
        count += posGroup.getChildren().length;
      }
    }
    return count;
  }

} // class DrawController
