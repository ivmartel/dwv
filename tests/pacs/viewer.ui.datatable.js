// Do not warn if these variables were not defined before.
/* global dwv */

// namespace
// eslint-disable-next-line no-var
var test = test || {};
test.ui = test.ui || {};

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
 *
 * @param {object} app The associated application.
 */
test.ui.DataTable = function (app) {

  /**
   * Bind app to ui.
   *
   * @param {string} layout The layout.
   */
  this.registerListeners = function (layout) {
    // add data row on layer creation
    app.addEventListener('viewlayeradd', function (event) {
      clearDataTableRow(event.dataid);
      addDataRow(event.dataid, layout);
    });
    app.addEventListener('drawlayeradd', function (event) {
      clearDataTableRow(event.dataid);
      addDataRow(event.dataid, layout);
    });

    app.addEventListener('wlchange', onWLChange);
    app.addEventListener('opacitychange', onOpacityChange);
  };

  /**
   * Unbind app to controls.
   */
  this.unregisterListeners = function () {
    app.removeEventListener('wlchange', onWLChange);
    app.removeEventListener('opacitychange', onOpacityChange);
  };

  /**
   * Handle app wl change.
   *
   * @param {object} event The change event.
   */
  function onWLChange(event) {
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
      const ids = getDataLayerGroupDivIds(event.dataid);
      const lg = app.getLayerGroupByDivId(ids[0]);
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
  }

  /**
   * Handle app opacity change.
   *
   * @param {object} event The change event.
   */
  function onOpacityChange(event) {
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
  }

  /**
   * Get the layer group div ids associated to a data id.
   *
   * @param {string} dataId The data id.
   * @returns {Array} The list of div ids.
   */
  function getDataLayerGroupDivIds(dataId) {
    const dataViewConfigs = app.getDataViewConfigs();
    let viewConfig = dataViewConfigs[dataId];
    if (typeof viewConfig === 'undefined') {
      viewConfig = dataViewConfigs['*'];
    }
    return getDivIds(viewConfig);
  }

  /**
   * Clear the data table.
   */
  this.clearDataTable = function () {
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
  function clearDataTableRow(dataId) {
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
  function getLayersTable(numberOfLayerGroups) {
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
      insertTCell('Alpha Range');
      insertTCell('Contrast');
      insertTCell('Preset');
      insertTCell('Alpha');
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
   * @param {string} layout The layout.
   */
  function addDataRow(dataId, layout) {
    // bind app to controls on first id
    // if (dataId === '0') {
    //   this.registerListeners();
    // }

    const image = app.getData(dataId).image;
    const dataIsImage = typeof image !== 'undefined';
    const canAlpha = dataIsImage;
    const isMonochrome = dataIsImage && image.isMonochrome();

    const dataViewConfigs = app.getDataViewConfigs();
    const allLayerGroupDivIds = test.getLayerGroupDivIds(dataViewConfigs);

    const table = getLayersTable(allLayerGroupDivIds.length);
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
    const getLayerRadio = function (index, divId) {
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'layerselect-' + index;
      radio.id = 'layerselect-' + divId + '-' + dataId;
      radio.checked = true;
      radio.onchange = function (event) {
        const element = event.target;
        const fullId = element.id;
        const split = fullId.split('-');
        const groupDivId = split[1];
        const dataId = split[2];
        const lg = app.getLayerGroupByDivId(groupDivId);
        if (dataIsImage) {
          lg.setActiveViewLayerByDataId(dataId);
          lg.setActiveDrawLayer(undefined);
        } else {
          lg.setActiveDrawLayerByDataId(dataId);
        }
      };
      return radio;
    };

    // get a layer add button
    const getLayerAdd = function (index, divId) {
      const button = document.createElement('button');
      button.name = 'layeradd-' + index;
      button.id = 'layeradd-' + divId + '-' + dataId;
      button.title = 'Add layer';
      button.appendChild(document.createTextNode('+'));
      button.onclick = function () {
        // update app
        app.addDataViewConfig(dataId, test.getViewConfig(layout, divId));
        // update html
        const parent = button.parentElement;
        if (parent) {
          parent.replaceChildren();
          parent.appendChild(getLayerRadio(index, divId));
          parent.appendChild(getLayerRem(index, divId));
          parent.appendChild(
            getLayerUpdate(index, divId, dwv.Orientation.Axial));
          parent.appendChild(
            getLayerUpdate(index, divId, dwv.Orientation.Coronal));
          parent.appendChild(
            getLayerUpdate(index, divId, dwv.Orientation.Sagittal));
        }
      };
      return button;
    };

    // get a layer remove button
    const getLayerRem = function (index, divId) {
      const button = document.createElement('button');
      button.name = 'layerrem-' + index;
      button.id = 'layerrem-' + divId + '-' + dataId;
      button.title = 'Remove layer';
      button.appendChild(document.createTextNode('-'));
      button.onclick = function () {
        // update app
        app.removeDataViewConfig(dataId, divId);
        // update html
        const parent = button.parentElement;
        parent.replaceChildren();
        parent.appendChild(getLayerAdd(index, divId));
      };
      return button;
    };

    // get a layer update button
    const getLayerUpdate = function (index, divId, orientation) {
      const button = document.createElement('button');
      const letter = orientation[0].toUpperCase();
      button.name = 'layerupd-' + index + '_' + letter;
      button.id = 'layerupd-' + divId + '-' + dataId + '_' + letter;
      button.title = 'Change layer orientation to ' + orientation;
      button.style.borderStyle = 'outset';
      button.appendChild(document.createTextNode(letter));
      button.onclick = function () {
        // update app
        const config = test.getViewConfig(layout, divId);
        config.orientation = orientation;
        app.updateDataViewConfig(dataId, divId, config);
      };
      return button;
    };

    // cell: id
    cell = row.insertCell();
    cell.appendChild(document.createTextNode(dataId));

    const orientations = [
      dwv.Orientation.Axial,
      dwv.Orientation.Coronal,
      dwv.Orientation.Sagittal
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
    const initialVls = app.getViewLayersByDataId(dataId);
    const initialDls = app.getDrawLayersByDataId(dataId);
    let initialLayer;
    if (initialVls.length !== 0) {
      initialLayer = initialVls[0];
    } else if (initialDls.length !== 0) {
      initialLayer = initialDls[0];
    }

    const floatPrecision = 4;

    // cell: alpha range
    cell = row.insertCell();
    const minId = 'value-min-' + dataId;
    const maxId = 'value-max-' + dataId;
    // callback
    const changeAlphaFunc = function () {
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
        const lg = app.getLayerGroupByDivId(lgIds[i]);
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
      cell.appendChild(test.getControlDiv(minId, 'min',
        dataRange.min, dataRange.max, dataRange.min,
        changeAlphaFunc, floatPrecision));
      cell.appendChild(test.getControlDiv(maxId, 'max',
        dataRange.min, dataRange.max, dataRange.max,
        changeAlphaFunc, floatPrecision));
    }

    // cell: contrast
    cell = row.insertCell();
    const widthId = 'width-' + dataId;
    const centerId = 'center-' + dataId;
    // callback
    const changeContrast = function () {
      const wElement = document.getElementById(widthId + '-number');
      const width = parseFloat(wElement.value);
      const cElement = document.getElementById(centerId + '-number');
      const center = parseFloat(cElement.value);
      // update selected layers
      const lgIds = getSelectedLayerGroupIds();
      for (let i = 0; i < lgIds.length; ++i) {
        const lg = app.getLayerGroupByDivId(lgIds[i]);
        const vl = lg.getActiveViewLayer();
        if (typeof vl !== 'undefined') {
          const vc = vl.getViewController();
          vc.setWindowLevel(new dwv.WindowLevel(center, width));
        }
      }
    };
    // add controls
    if (isMonochrome) {
      const initialVc = initialLayer.getViewController();
      const rescaledDataRange = image.getRescaledDataRange();
      cell.appendChild(test.getControlDiv(widthId, 'width',
        0,
        rescaledDataRange.max - rescaledDataRange.min,
        initialVc.getWindowLevel().width,
        changeContrast, floatPrecision));
      cell.appendChild(test.getControlDiv(centerId, 'center',
        rescaledDataRange.min,
        rescaledDataRange.max,
        initialVc.getWindowLevel().center,
        changeContrast, floatPrecision));
    }

    // cell: presets
    cell = row.insertCell();

    // window level preset
    // callback
    const changePreset = function (event) {
      const element = event.target;
      // update selected layers
      const lgIds = getSelectedLayerGroupIds();
      for (let i = 0; i < lgIds.length; ++i) {
        const lg = app.getLayerGroupByDivId(lgIds[i]);
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
      selectPreset.onchange = changePreset;
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
    const changeColourMap = function (event) {
      const element = event.target;
      // update selected layers
      const lgIds = getSelectedLayerGroupIds();
      for (let i = 0; i < lgIds.length; ++i) {
        const lg = app.getLayerGroupByDivId(lgIds[i]);
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
      const colourMaps = Object.keys(dwv.luts);
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
      selectColourMap.onchange = changeColourMap;
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
    const changeOpacity = function (value) {
      // update selected layers
      const lgIds = getSelectedLayerGroupIds();
      for (let i = 0; i < lgIds.length; ++i) {
        const lg = app.getLayerGroupByDivId(lgIds[i]);
        let layer;
        if (dataIsImage) {
          layer = lg.getActiveViewLayer();
        } else {
          layer = lg.getActiveDrawLayer();
        }
        if (typeof layer !== 'undefined') {
          layer.setOpacity(value);
          layer.draw();
        }
      }
    };
    // add controls
    cell.appendChild(test.getControlDiv(opacityId, 'opacity',
      0, 1, initialLayer.getOpacity(), changeOpacity, floatPrecision));
  }

}; // test.DataTable