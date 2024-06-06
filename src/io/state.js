import {Index} from '../math/index';
import {colourNameToHex} from '../utils/colour';
import {WindowLevel} from '../image/windowLevel';

// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application';
/* eslint-enable no-unused-vars */

/**
 * State class.
 * Saves: data url/path, display info.
 *
 * History:
 * - v0.5 (dwv 0.30.0, 12/2021):
 *   - store position as array,
 *   - new draw position group key.
 * - v0.4 (dwv 0.29.0, 06/2021):
 *   - move drawing details into meta property,
 *   - remove scale center and translation, add offset.
 * - v0.3 (dwv v0.23.0, 03/2018):
 *   - new drawing structure, drawings are now the full layer object and
 *     using toObject to avoid saving a string representation,
 *   - new details structure: simple array of objects referenced by draw ids.
 * - v0.2 (dwv v0.17.0, 12/2016):
 *   - adds draw details: array [nslices][nframes] of detail objects.
 * - v0.1 (dwv v0.15.0, 07/2016):
 *   - adds version,
 *   - drawings: array [nslices][nframes] with all groups.
 * - initial release (dwv v0.10.0, 05/2015), no version number:
 *   - content: window-center, window-width, position, scale,
 *       scaleCenter, translation, drawings,
 *   - drawings: array [nslices] with all groups.
 */
export class State {
  /**
   * Save the application state as JSON.
   *
   * @param {App} app The associated application.
   * @returns {string} The state as a JSON string.
   */
  toJSON(app) {
    const layerGroup = app.getActiveLayerGroup();
    const viewController =
      layerGroup.getActiveViewLayer().getViewController();
    const position = viewController.getCurrentIndex();
    const drawLayer = layerGroup.getActiveDrawLayer();
    const drawController = drawLayer.getDrawController();
    const wl = viewController.getWindowLevel();
    // return a JSON string
    return JSON.stringify({
      version: '0.5',
      'window-center': wl.center,
      'window-width': wl.width,
      position: position.getValues(),
      scale: app.getAddedScale(),
      offset: app.getOffset(),
      drawings: drawLayer.getKonvaLayer().toObject(),
      drawingsDetails: drawController.getDrawStoreDetails()
    });
  }

  /**
   * Load an application state from JSON.
   *
   * @param {string} json The state as a JSON string.
   * @returns {object} The state object.
   */
  fromJSON(json) {
    const data = JSON.parse(json);
    let res = null;
    if (data.version === '0.1') {
      res = this.#readV01(data);
    } else if (data.version === '0.2') {
      res = this.#readV02(data);
    } else if (data.version === '0.3') {
      res = this.#readV03(data);
    } else if (data.version === '0.4') {
      res = this.#readV04(data);
    } else if (data.version === '0.5') {
      res = this.#readV05(data);
    } else {
      throw new Error('Unknown state file format version: \'' +
        data.version + '\'.');
    }
    return res;
  }

  /**
   * Load an application state from JSON.
   *
   * @param {App} app The app to apply the state to.
   * @param {object} data The state data.
   */
  apply(app, data) {
    const layerGroup = app.getActiveLayerGroup();
    const viewController =
      layerGroup.getActiveViewLayer().getViewController();
    // display
    const wl = new WindowLevel(data['window-center'], data['window-width']);
    viewController.setWindowLevel(wl);
    // position is index...
    viewController.setCurrentIndex(new Index(data.position));
    // apply saved scale on top of current base one
    const baseScale = app.getActiveLayerGroup().getBaseScale();
    let scale = null;
    let offset = null;
    if (typeof data.scaleCenter !== 'undefined') {
      scale = {
        x: data.scale * baseScale.x,
        y: data.scale * baseScale.y,
        z: 1
      };
      // ---- transform translation (now) ----
      // Tx = -offset.x * scale.x
      // => offset.x = -Tx / scale.x
      // ---- transform translation (before) ----
      // origin.x = centerX - (centerX - origin.x) * (newZoomX / zoom.x);
      // (zoom.x -> initial zoom = base scale, origin.x = 0)
      // Tx = origin.x + (trans.x * zoom.x)
      const originX = data.scaleCenter.x - data.scaleCenter.x * data.scale;
      const originY = data.scaleCenter.y - data.scaleCenter.y * data.scale;
      const oldTx = originX + data.translation.x * scale.x;
      const oldTy = originY + data.translation.y * scale.y;
      offset = {
        x: -oldTx / scale.x,
        y: -oldTy / scale.y,
        z: 0
      };
    } else {
      scale = {
        x: data.scale.x * baseScale.x,
        y: data.scale.y * baseScale.y,
        z: baseScale.z
      };
      offset = {
        x: data.offset.x,
        y: data.offset.y,
        z: 0
      };
    }
    app.getActiveLayerGroup().setScale(scale);
    app.getActiveLayerGroup().setOffset(offset);
    // render to draw the view layer
    app.render(app.getDataIds()[0]); //todo: fix
    // drawings (will draw the draw layer)
    app.setDrawings(data.drawings, data.drawingsDetails);
  }

  /**
   * Read an application state from an Object in v0.1 format.
   *
   * @param {object} data The Object representation of the state.
   * @returns {object} The state object.
   */
  #readV01(data) {
    // v0.1 -> v0.2
    const v02DAndD = v01Tov02DrawingsAndDetails(data.drawings);
    // v0.2 -> v0.3, v0.4
    data.drawings = v02Tov03Drawings(v02DAndD.drawings).toObject();
    data.drawingsDetails = v03Tov04DrawingsDetails(
      v02DAndD.drawingsDetails);
    // v0.4 -> v0.5
    data = v04Tov05Data(data);
    data.drawings = v04Tov05Drawings(data.drawings);
    return data;
  }

  /**
   * Read an application state from an Object in v0.2 format.
   *
   * @param {object} data The Object representation of the state.
   * @returns {object} The state object.
   */
  #readV02(data) {
    // v0.2 -> v0.3, v0.4
    data.drawings = v02Tov03Drawings(data.drawings).toObject();
    data.drawingsDetails = v03Tov04DrawingsDetails(
      v02Tov03DrawingsDetails(data.drawingsDetails));
    // v0.4 -> v0.5
    data = v04Tov05Data(data);
    data.drawings = v04Tov05Drawings(data.drawings);
    return data;
  }

  /**
   * Read an application state from an Object in v0.3 format.
   *
   * @param {object} data The Object representation of the state.
   * @returns {object} The state object.
   */
  #readV03(data) {
    // v0.3 -> v0.4
    data.drawingsDetails = v03Tov04DrawingsDetails(data.drawingsDetails);
    // v0.4 -> v0.5
    data = v04Tov05Data(data);
    data.drawings = v04Tov05Drawings(data.drawings);
    return data;
  }

  /**
   * Read an application state from an Object in v0.4 format.
   *
   * @param {object} data The Object representation of the state.
   * @returns {object} The state object.
   */
  #readV04(data) {
    // v0.4 -> v0.5
    data = v04Tov05Data(data);
    data.drawings = v04Tov05Drawings(data.drawings);
    return data;
  }
  /**
   * Read an application state from an Object in v0.5 format.
   *
   * @param {object} data The Object representation of the state.
   * @returns {object} The state object.
   */
  #readV05(data) {
    return data;
  }

} // State class

/**
 * Convert drawings from v0.2 to v0.3:
 * - v0.2: one layer per slice/frame,
 * - v0.3: one layer, one group per slice. `setDrawing` expects the full stage.
 *
 * @param {Array} drawings An array of drawings.
 * @returns {object} The layer with the converted drawings.
 */
function v02Tov03Drawings(drawings) {
  // Auxiliar variables
  let group, groupShapes, parentGroup;
  // Avoid errors when dropping multiple states
  //drawLayer.getChildren().each(function(node){
  //    node.visible(false);
  //});

  /**
   * Get the draw group id for a given position.
   *
   * @param {Index} currentPosition The current position.
   * @returns {string} The group id.
   */
  function getDrawPositionGroupId(currentPosition) {
    const sliceNumber = currentPosition.get(2);
    const frameNumber = currentPosition.length() === 4
      ? currentPosition.get(3) : 0;
    return 'slice-' + sliceNumber + '_frame-' + frameNumber;
  }

  const drawLayer = new Konva.Layer({
    listening: false,
    visible: true
  });

  // Get the positions-groups data
  const groupDrawings = typeof drawings === 'string'
    ? JSON.parse(drawings) : drawings;
  // Iterate over each position-groups
  for (let k = 0, lenk = groupDrawings.length; k < lenk; ++k) {
    // Iterate over each frame
    for (let f = 0, lenf = groupDrawings[k].length; f < lenf; ++f) {
      groupShapes = groupDrawings[k][f];
      if (groupShapes.length !== 0) {
        // Create position-group set as visible and append it to drawLayer
        parentGroup = new Konva.Group({
          id: getDrawPositionGroupId(new Index([1, 1, k, f])),
          name: 'position-group',
          visible: false
        });

        // Iterate over shapes-group
        for (let g = 0, leng = groupShapes.length; g < leng; ++g) {
          // create the konva group
          group = Konva.Node.create(groupShapes[g]);
          // enforce draggable: only the shape was draggable in v0.2,
          // now the whole group is.
          group.draggable(true);
          group.getChildren().forEach(function (gnode) {
            gnode.draggable(false);
          });
          // add to position group
          parentGroup.add(group);
        }
        // add to layer
        drawLayer.add(parentGroup);
      }
    }
  }

  return drawLayer;
}

/**
 * Convert drawings from v0.1 to v0.2:
 * - v0.1: text on its own,
 * - v0.2: text as part of label.
 *
 * @param {Array} inputDrawings An array of drawings.
 * @returns {object} The converted drawings.
 */
function v01Tov02DrawingsAndDetails(inputDrawings) {
  const newDrawings = [];
  const drawingsDetails = {};

  let drawGroups;
  let drawGroup;
  // loop over each slice
  for (let k = 0, lenk = inputDrawings.length; k < lenk; ++k) {
    // loop over each frame
    newDrawings[k] = [];
    for (let f = 0, lenf = inputDrawings[k].length; f < lenf; ++f) {
      // draw group
      drawGroups = inputDrawings[k][f];
      const newFrameDrawings = [];
      // Iterate over shapes-group
      for (let g = 0, leng = drawGroups.length; g < leng; ++g) {
        // create konva group from input
        drawGroup = Konva.Node.create(drawGroups[g]);
        // force visible (not set in state)
        drawGroup.visible(true);
        // label position
        let pos = {x: 0, y: 0};
        // update shape colour
        const kshape = drawGroup.getChildren(function (node) {
          return node.name() === 'shape';
        })[0];
        kshape.stroke(colourNameToHex(kshape.stroke()));
        // special line case
        if (drawGroup.name() === 'line-group') {
          // update name
          drawGroup.name('ruler-group');
          // add ticks
          const ktick0 = new Konva.Line({
            points: [kshape.points()[0],
              kshape.points()[1],
              kshape.points()[0],
              kshape.points()[1]],
            name: 'shape-tick0'
          });
          drawGroup.add(ktick0);
          const ktick1 = new Konva.Line({
            points: [kshape.points()[2],
              kshape.points()[3],
              kshape.points()[2],
              kshape.points()[3]],
            name: 'shape-tick1'
          });
          drawGroup.add(ktick1);
        }
        // special protractor case: update arc name
        const karcs = drawGroup.getChildren(function (node) {
          return node.name() === 'arc';
        });
        if (karcs.length === 1) {
          karcs[0].name('shape-arc');
        }
        // get its text
        const ktexts = drawGroup.getChildren(function (node) {
          return node.name() === 'text';
        });
        // update text: move it into a label
        let ktext = new Konva.Text({
          name: 'text',
          text: ''
        });
        if (ktexts.length === 1) {
          pos.x = ktexts[0].x();
          pos.y = ktexts[0].y();
          // remove it from the group
          ktexts[0].remove();
          // use it
          ktext = ktexts[0];
        } else {
          // use shape position if no text
          if (kshape.points().length !== 0) {
            pos = {x: kshape.points()[0],
              y: kshape.points()[1]};
          }
        }
        // create new label with text and tag
        const klabel = new Konva.Label({
          x: pos.x,
          y: pos.y,
          name: 'label'
        });
        klabel.add(ktext);
        klabel.add(new Konva.Tag());
        // add label to group
        drawGroup.add(klabel);
        // add group to list
        newFrameDrawings.push(JSON.stringify(drawGroup.toObject()));

        // create details (v0.3 format)
        let textExpr = ktext.text();
        const txtLen = textExpr.length;
        let quant = null;
        // adapt to text with flag
        if (drawGroup.name() === 'ruler-group') {
          quant = {
            length: {
              value: parseFloat(textExpr.substring(0, txtLen - 2)),
              unit: textExpr.substring(-2)
            }
          };
          textExpr = '{length}';
        } else if (drawGroup.name() === 'ellipse-group' ||
                    drawGroup.name() === 'rectangle-group') {
          quant = {
            surface: {
              value: parseFloat(textExpr.substring(0, txtLen - 3)),
              unit: textExpr.substring(-3)
            }
          };
          textExpr = '{surface}';
        } else if (drawGroup.name() === 'protractor-group' ||
                    drawGroup.name() === 'rectangle-group') {
          quant = {
            angle: {
              value: parseFloat(textExpr.substring(0, txtLen - 1)),
              unit: textExpr.substring(-1)
            }
          };
          textExpr = '{angle}';
        }
        // set details
        drawingsDetails[drawGroup.id()] = {
          textExpr: textExpr,
          longText: '',
          quant: quant
        };

      }
      newDrawings[k].push(newFrameDrawings);
    }
  }

  return {drawings: newDrawings, drawingsDetails: drawingsDetails};
}

/**
 * Convert drawing details from v0.2 to v0.3:
 * - v0.2: array [nslices][nframes] with all,
 * - v0.3: simple array of objects referenced by draw ids.
 *
 * @param {Array} details An array of drawing details.
 * @returns {object} The converted drawings.
 */
function v02Tov03DrawingsDetails(details) {
  const res = {};
  // Get the positions-groups data
  const groupDetails = typeof details === 'string'
    ? JSON.parse(details) : details;
  // Iterate over each position-groups
  for (let k = 0, lenk = groupDetails.length; k < lenk; ++k) {
    // Iterate over each frame
    for (let f = 0, lenf = groupDetails[k].length; f < lenf; ++f) {
      // Iterate over shapes-group
      for (let g = 0, leng = groupDetails[k][f].length; g < leng; ++g) {
        const group = groupDetails[k][f][g];
        res[group.id] = {
          textExpr: group.textExpr,
          longText: group.longText,
          quant: group.quant
        };
      }
    }
  }
  return res;
}

/**
 * Convert drawing details from v0.3 to v0.4:
 * - v0.3: properties at group root,
 * - v0.4: properties in group meta object.
 *
 * @param {Array} details An array of drawing details.
 * @returns {object} The converted drawings.
 */
function v03Tov04DrawingsDetails(details) {
  const res = {};
  const keys = Object.keys(details);
  // Iterate over each position-groups
  for (let k = 0, lenk = keys.length; k < lenk; ++k) {
    const detail = details[keys[k]];
    res[keys[k]] = {
      meta: {
        textExpr: detail.textExpr,
        longText: detail.longText,
        quantification: detail.quant
      }
    };
  }
  return res;
}

/**
 * Convert drawing from v0.4 to v0.5:
 * - v0.4: position as object,
 * - v0.5: position as array.
 *
 * @param {object} data An array of drawing.
 * @returns {object} The converted drawings.
 */
function v04Tov05Data(data) {
  const pos = data.position;
  data.position = [pos.i, pos.j, pos.k];
  return data;
}

/**
 * Convert drawing from v0.4 to v0.5:
 * - v0.4: draw id as 'slice-0_frame-1',
 * - v0.5: draw id as '#2-0_#3-1'.
 *
 * @param {object} inputDrawings An array of drawing.
 * @returns {object} The converted drawings.
 */
function v04Tov05Drawings(inputDrawings) {
  // Iterate over each position-groups
  const posGroups = inputDrawings.children;
  for (let k = 0, lenk = posGroups.length; k < lenk; ++k) {
    const posGroup = posGroups[k];
    const id = posGroup.attrs.id;
    const ids = id.split('_');
    const sliceNumber = parseInt(ids[0].substring(6), 10); // 'slice-0'
    const frameNumber = parseInt(ids[1].substring(6), 10); // 'frame-0'
    let newId = '#2-';
    if (sliceNumber === 0 && frameNumber !== 0) {
      newId += frameNumber;
    } else {
      newId += sliceNumber;
    }
    posGroup.attrs.id = newId;
  }
  return inputDrawings;
}
