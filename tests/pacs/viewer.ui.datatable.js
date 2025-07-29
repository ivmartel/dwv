import {Orientation} from '../../src/math/orientation.js';
import {WindowLevel} from '../../src/image/windowLevel.js';
import {luts} from '../../src/image/luts.js';

import {getControlDiv} from './viewer.ui.js';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../../src/app/application.js';
import {LayoutProtocol} from './viewer.ui.js';
/* eslint-enable no-unused-vars */

/**
 * Get the layer group div ids associated to a view config.
 *
 * @param {Array} dataViewConfig The data view config.
 * @returns {Array} The list of div ids.
 */
function getDivIds(dataViewConfig) {
  const divIds = [];
  for (let j = 0; j < dataViewConfig.length; ++j) {
    divIds.push(dataViewConfig[j].divId);
  }
  return divIds;
}

/**
 * Data table UI.
 */
export class DataTableUI {

  /**
   * @type {App}
   */
  #app;

  /**
   * @type {boolean}
   */
  #registeredViewListeners = false;

  /**
   * @type {Function}
   */
  #layerAddListener;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
  }

  /**
   * Register view change listeners.
   */
  registerViewListeners() {
    if (!this.#registeredViewListeners) {
      this.#app.addEventListener('wlchange', this.#onWLChange);
      this.#app.addEventListener('opacitychange', this.#onOpacityChange);
      this.#registeredViewListeners = true;
    }
  }

  /**
   * Unregister view change listeners.
   */
  unRegisterViewListeners() {
    if (this.#registeredViewListeners) {
      this.#app.removeEventListener('wlchange', this.#onWLChange);
      this.#app.removeEventListener('opacitychange', this.#onOpacityChange);
      this.#registeredViewListeners = false;
    }
  }

  /**
   * Bind layer add to ui.
   *
   * @param {LayoutProtocol} layout The layout.
   */
  registerLayerAddListeners(layout) {
    // add data row on layer creation
    this.#layerAddListener = (event) => {
      this.#clearDataTableRow(event.dataid);
      this.#addDataRow(event.dataid, layout);
    };

    this.#app.addEventListener('viewlayeradd', this.#layerAddListener);
    this.#app.addEventListener('drawlayeradd', this.#layerAddListener);
  }

  /**
   * Unbind layer add from ui.
   */
  unRegisterLayerAddListeners() {
    this.#app.removeEventListener('viewlayeradd', this.#layerAddListener);
    this.#app.removeEventListener('drawlayeradd', this.#layerAddListener);
    this.#layerAddListener = undefined;
  }

  /**
   * Bind app to ui.
   */
  registerListeners() {
    // control listeners (pause during load)
    this.#app.addEventListener('loadstart', (/*event*/) => {
      this.unRegisterViewListeners();
    });
    this.#app.addEventListener('loadend', (/*event*/) => {
      this.registerViewListeners();
    });
  };

  /**
   * Handle app wl change.
   *
   * @param {object} event The change event.
   */
  #onWLChange = (event) => {
    // width number
    let elemId = 'width-' + event.dataid + '-number';
    let elem = document.getElementById(elemId);
    if (elem) {
      elem.value = event.value[1];
    } else {
      console.warn('wl change: HTML not ready?');
    }
    // width range
    elemId = 'width-' + event.dataid + '-range';
    elem = document.getElementById(elemId);
    if (elem) {
      elem.value = event.value[1];
    }
    // center number
    elemId = 'center-' + event.dataid + '-number';
    elem = document.getElementById(elemId);
    if (elem) {
      elem.value = event.value[0];
    }
    // center range
    elemId = 'center-' + event.dataid + '-range';
    elem = document.getElementById(elemId);
    if (elem) {
      elem.value = event.value[0];
    }
    // preset select
    elemId = 'preset-' + event.dataid + '-select';
    const selectElem = document.getElementById(elemId);
    if (selectElem) {
      const ids = this.#getDataLayerGroupDivIds(event.dataid);
      const lg = this.#app.getLayerGroupByDivId(ids[0]);
      const vls = lg.getViewLayersByDataId(event.dataid);
      if (typeof vls !== 'undefined' && vls.length !== 0) {
        const vl = vls[0];
        const vc = vl.getViewController();
        const presetName = vc.getCurrentWindowPresetName();
        const optName = 'manual';
        if (presetName === optName) {
          const options = selectElem.options;
          const optId = 'preset-manual';
          let manualOpt = options.namedItem(optId);
          if (!manualOpt) {
            const opt = document.createElement('option');
            opt.id = optId;
            opt.value = optName;
            opt.appendChild(document.createTextNode(optName));
            manualOpt = selectElem.appendChild(opt);
          }
          selectElem.selectedIndex = manualOpt.index;
        }
      }
    }
  };

  /**
   * Handle app opacity change.
   *
   * @param {object} event The change event.
   */
  #onOpacityChange = (event) => {
    const value = parseFloat(event.value[0]).toPrecision(3);
    // number
    let elemId = 'opacity-' + event.dataid + '-number';
    let elem = document.getElementById(elemId);
    if (elem) {
      elem.value = value;
    } else {
      console.warn('opacity change: HTML not ready?');
    }
    // range
    elemId = 'opacity-' + event.dataid + '-range';
    elem = document.getElementById(elemId);
    if (elem) {
      elem.value = value;
    }
  };

  /**
   * Get the layer group div ids associated to a data id.
   *
   * @param {string} dataId The data id.
   * @returns {Array} The list of div ids.
   */
  #getDataLayerGroupDivIds(dataId) {
    const dataViewConfigs = this.#app.getDataViewConfigs();
    let viewConfig = dataViewConfigs[dataId];
    if (typeof viewConfig === 'undefined') {
      viewConfig = dataViewConfigs['*'];
    }
    return getDivIds(viewConfig);
  }

  /**
   * Clear the data table.
   */
  clearDataTable() {
    const detailsDiv = document.getElementById('layersdetails');
    if (detailsDiv) {
      detailsDiv.innerHTML = '';
    }
  };

  /**
   * Clear a layer details table row.
   *
   * @param {string} dataId The associated data id.
   */
  #clearDataTableRow(dataId) {
    const row = document.getElementById('data-' + dataId);
    if (row) {
      row.remove();
    }
  }

  /**
   *
   * @param {number} [numberOfLayerGroups] The number of layer groups
   *   used to create the table.
   * @returns {HTMLTableElement} The table element.
   */
  #getLayersTable(numberOfLayerGroups) {
    let table = document.getElementById('layerstable');
    // create table if not present
    if (!table) {
      table = document.createElement('table');
      table.id = 'layerstable';
      const header = table.createTHead();
      const trow = header.insertRow(0);
      const insertTCell = function (text) {
        const th = document.createElement('th');
        th.innerHTML = text;
        trow.appendChild(th);
      };
      insertTCell('Id');
      for (let j = 0; j < numberOfLayerGroups; ++j) {
        insertTCell('LG' + j);
      }
      insertTCell('Contrast');
      insertTCell('Preset');
      insertTCell('Alpha');
      insertTCell('Alpha Range');
      table.createTBody();
      const div = document.getElementById('layersdetails');
      div.appendChild(table);
    }
    return table;
  }

  /**
   * Add a data row.
   *
   * @param {string} dataId The data id.
   * @param {LayoutProtocol} layout The layout.
   */
  #addDataRow(dataId, layout) {
    const image = this.#app.getData(dataId).image;
    const dataIsImage = typeof image !== 'undefined';
    const canAlpha = dataIsImage;
    const isMonochrome = dataIsImage && image.isMonochrome();

    const dataViewConfigs = this.#app.getDataViewConfigs();
    const allLayerGroupDivIds = layout.getLayerGroupDivIds();

    const table = this.#getLayersTable(allLayerGroupDivIds.length);
    const body = table.tBodies[0];

    // add new layer row
    const row = body.insertRow();
    row.id = 'data-' + dataId;

    let cell;

    // get the selected layer group ids
    const getSelectedLayerGroupIds = function () {
      const res = [];
      for (const divId of allLayerGroupDivIds) {
        const elemId = 'layerselect-' + divId + '-' + dataId;
        const elem = document.getElementById(elemId);
        if (elem && elem.checked) {
          res.push(divId);
        }
      }
      return res;
    };

    // get a layer radio button
    const getLayerRadio = (index, divId) => {
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'layerselect-' + index;
      radio.id = 'layerselect-' + divId + '-' + dataId;
      radio.checked = true;
      radio.onchange = (event) => {
        const element = event.target;
        const fullId = element.id;
        const split = fullId.split('-');
        const groupDivId = split[1];
        const dataId = split[2];
        const lg = this.#app.getLayerGroupByDivId(groupDivId);
        lg.setActiveLayerByDataId(dataId);
      };
      return radio;
    };

    // get a layer add button
    const getLayerAdd = (index, divId) => {
      const button = document.createElement('button');
      button.name = 'layeradd-' + index;
      button.id = 'layeradd-' + divId + '-' + dataId;
      button.title = 'Add layer';
      button.appendChild(document.createTextNode('+'));
      button.onclick = () => {
        // update app
        const config = layout.getViewConfigsByDivId(divId);
        this.#app.addDataViewConfig(dataId, config);
        // update html
        const parent = button.parentElement;
        if (parent) {
          parent.replaceChildren();
          parent.appendChild(getLayerRadio(index, divId));
          parent.appendChild(getLayerRem(index, divId));
          parent.appendChild(
            getLayerUpdate(index, divId, Orientation.Axial));
          parent.appendChild(
            getLayerUpdate(index, divId, Orientation.Coronal));
          parent.appendChild(
            getLayerUpdate(index, divId, Orientation.Sagittal));
        }
      };
      return button;
    };

    // get a layer remove button
    const getLayerRem = (index, divId) => {
      const button = document.createElement('button');
      button.name = 'layerrem-' + index;
      button.id = 'layerrem-' + divId + '-' + dataId;
      button.title = 'Remove layer';
      button.appendChild(document.createTextNode('-'));
      button.onclick = () => {
        // update app
        this.#app.removeDataViewConfig(dataId, divId);
        // update html
        const parent = button.parentElement;
        parent.replaceChildren();
        parent.appendChild(getLayerAdd(index, divId));
      };
      return button;
    };

    // get a layer update button
    const getLayerUpdate = (index, divId, orientation) => {
      const button = document.createElement('button');
      const letter = orientation[0].toUpperCase();
      button.name = 'layerupd-' + index + '_' + letter;
      button.id = 'layerupd-' + divId + '-' + dataId + '_' + letter;
      button.title = 'Change layer orientation to ' + orientation;
      button.style.borderStyle = 'outset';
      button.appendChild(document.createTextNode(letter));
      button.onclick = () => {
        // update app
        const config = layout.getViewConfigsByDivId(divId);
        config.orientation = orientation;
        this.#app.updateDataViewConfig(dataId, divId, config);
      };
      return button;
    };

    // cell: id
    cell = row.insertCell();
    cell.appendChild(document.createTextNode(dataId));

    const orientations = [
      Orientation.Axial,
      Orientation.Coronal,
      Orientation.Sagittal
    ];

    // cell: radio
    let viewConfigs = dataViewConfigs[dataId];
    if (typeof viewConfigs === 'undefined') {
      viewConfigs = dataViewConfigs['*'];
    }

    const dataLayerGroupsIds = getDivIds(viewConfigs);
    for (let i = 0; i < allLayerGroupDivIds.length; ++i) {
      const layerGroupDivId = allLayerGroupDivIds[i];
      const viewConfig =
        viewConfigs.find(element => element.divId === layerGroupDivId);
      cell = row.insertCell();
      if (dataLayerGroupsIds.includes(layerGroupDivId)) {
        cell.appendChild(getLayerRadio(i, layerGroupDivId));
        cell.appendChild(getLayerRem(i, layerGroupDivId));
        for (const orientation of orientations) {
          const button = getLayerUpdate(i, layerGroupDivId, orientation);
          if (orientation === viewConfig.orientation) {
            button.style.borderStyle = 'inset';
          }
          cell.appendChild(button);
        }
      } else {
        cell.appendChild(getLayerAdd(i, layerGroupDivId));
      }
    }

    // use first layer
    const initialVls = this.#app.getViewLayersByDataId(dataId);
    const initialDls = this.#app.getDrawLayersByDataId(dataId);
    let initialLayer;
    if (initialVls.length !== 0) {
      initialLayer = initialVls[0];
    } else if (initialDls.length !== 0) {
      initialLayer = initialDls[0];
    }

    const floatPrecision = 4;

    // cell: contrast
    cell = row.insertCell();
    const widthId = 'width-' + dataId;
    const centerId = 'center-' + dataId;
    // callback
    const onChangeContrast = () => {
      const wElement = document.getElementById(widthId + '-number');
      const width = parseFloat(wElement.value);
      const cElement = document.getElementById(centerId + '-number');
      const center = parseFloat(cElement.value);
      // update selected layers
      const lgIds = getSelectedLayerGroupIds();
      for (let i = 0; i < lgIds.length; ++i) {
        const lg = this.#app.getLayerGroupByDivId(lgIds[i]);
        const vl = lg.getActiveViewLayer();
        if (typeof vl !== 'undefined') {
          const vc = vl.getViewController();
          vc.setWindowLevel(new WindowLevel(center, width));
        }
      }
    };
    // add controls
    if (isMonochrome) {
      const initialVc = initialLayer.getViewController();
      const rescaledDataRange = image.getRescaledDataRange();
      cell.appendChild(getControlDiv(widthId, 'width',
        0,
        rescaledDataRange.max - rescaledDataRange.min,
        initialVc.getWindowLevel().width,
        onChangeContrast, floatPrecision));
      cell.appendChild(getControlDiv(centerId, 'center',
        rescaledDataRange.min,
        rescaledDataRange.max,
        initialVc.getWindowLevel().center,
        onChangeContrast, floatPrecision));
    }

    // cell: presets
    cell = row.insertCell();

    // window level preset
    // callback
    const onChangePreset = (event) => {
      const element = event.target;
      // update selected layers
      const lgIds = getSelectedLayerGroupIds();
      for (let i = 0; i < lgIds.length; ++i) {
        const lg = this.#app.getLayerGroupByDivId(lgIds[i]);
        const vl = lg.getActiveViewLayer();
        if (typeof vl !== 'undefined') {
          const vc = vl.getViewController();
          vc.setWindowLevelPreset(element.value);
        }
      }
    };
    if (isMonochrome) {
      const selectPreset = document.createElement('select');
      selectPreset.id = 'preset-' + dataId + '-select';
      const initialVc = initialLayer.getViewController();
      const presets = initialVc.getWindowLevelPresetsNames();
      const currentPresetName = initialVc.getCurrentWindowPresetName();
      for (const preset of presets) {
        const option = document.createElement('option');
        option.value = preset;
        if (preset === currentPresetName) {
          option.selected = true;
        }
        option.appendChild(document.createTextNode(preset));
        selectPreset.appendChild(option);
      }
      selectPreset.onchange = onChangePreset;
      const labelPreset = document.createElement('label');
      labelPreset.htmlFor = selectPreset.id;
      labelPreset.appendChild(document.createTextNode('wl: '));
      cell.appendChild(labelPreset);
      cell.appendChild(selectPreset);
    }

    // break line
    const br = document.createElement('br');
    cell.appendChild(br);

    // colour map
    // callback
    const onChangeColourMap = (event) => {
      const element = event.target;
      // update selected layers
      const lgIds = getSelectedLayerGroupIds();
      for (let i = 0; i < lgIds.length; ++i) {
        const lg = this.#app.getLayerGroupByDivId(lgIds[i]);
        const vl = lg.getActiveViewLayer();
        if (typeof vl !== 'undefined') {
          const vc = vl.getViewController();
          vc.setColourMap(element.value);
        }
      }
    };
    if (isMonochrome) {
      const selectColourMap = document.createElement('select');
      selectColourMap.id = 'colourmap-' + dataId + '-select';
      const initialVc = initialLayer.getViewController();
      const colourMaps = Object.keys(luts);
      const currentColourMap = initialVc.getColourMap();
      for (const colourMap of colourMaps) {
        const option = document.createElement('option');
        option.value = colourMap;
        if (colourMap === currentColourMap) {
          option.selected = true;
        }
        option.appendChild(document.createTextNode(colourMap));
        selectColourMap.appendChild(option);
      }
      selectColourMap.onchange = onChangeColourMap;
      const labelColourMap = document.createElement('label');
      labelColourMap.htmlFor = selectColourMap.id;
      labelColourMap.appendChild(document.createTextNode('cm: '));
      cell.appendChild(labelColourMap);
      cell.appendChild(selectColourMap);
    }

    // cell: opactiy
    cell = row.insertCell();
    const opacityId = 'opacity-' + dataId;
    // callback
    const onChangeOpacity = (value) => {
      // update selected layers
      const lgIds = getSelectedLayerGroupIds();
      for (let i = 0; i < lgIds.length; ++i) {
        const lg = this.#app.getLayerGroupByDivId(lgIds[i]);
        const layer = lg.getActiveLayer();
        if (typeof layer !== 'undefined') {
          layer.setOpacity(value);
          layer.draw();
        }
      }
    };
    // add controls
    cell.appendChild(getControlDiv(opacityId, 'opacity',
      0, 1, initialLayer.getOpacity(), onChangeOpacity, floatPrecision));

    // cell: alpha range
    cell = row.insertCell();
    const minId = 'value-min-' + dataId;
    const maxId = 'value-max-' + dataId;
    // callback
    const onChangeAlphaFunc = () => {
      const minElement = document.getElementById(minId + '-number');
      const min = parseFloat(minElement.value);
      const maxElement = document.getElementById(maxId + '-number');
      const max = parseFloat(maxElement.value);
      const func = function (value, _index) {
        if (value >= min && value <= max) {
          return 255;
        }
        return 0;
      };
      // update selected layers
      const lgIds = getSelectedLayerGroupIds();
      for (let i = 0; i < lgIds.length; ++i) {
        const lg = this.#app.getLayerGroupByDivId(lgIds[i]);
        const vl = lg.getActiveViewLayer();
        if (typeof vl !== 'undefined') {
          const vc = vl.getViewController();
          vc.setViewAlphaFunction(func);
        }
      }
    };
    // add controls
    if (canAlpha) {
      const dataRange = image.getDataRange();
      cell.appendChild(getControlDiv(minId, 'min',
        dataRange.min, dataRange.max, dataRange.min,
        onChangeAlphaFunc, floatPrecision));
      cell.appendChild(getControlDiv(maxId, 'max',
        dataRange.min, dataRange.max, dataRange.max,
        onChangeAlphaFunc, floatPrecision));
    }
  }

}; // test.DataTable