// Do not warn if these variables were not defined before.
/* global dwv */

// call setup on DOM loaded
document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

let _app = null;
let _tools = null;

// viewer options
const _mode = 0;
const _dicomWeb = false;

/**
 * Setup simple dwv app.
 */
function viewerSetup() {
  // logger level (optional)
  dwv.logger.level = dwv.logger.levels.WARN;

  dwv.decoderScripts.jpeg2000 =
    './decoders/pdfjs/decode-jpeg2000.js';
  dwv.decoderScripts['jpeg-lossless'] =
    './decoders/rii-mango/decode-jpegloss.js';
  dwv.decoderScripts['jpeg-baseline'] =
    './decoders/pdfjs/decode-jpegbaseline.js';
  dwv.decoderScripts.rle =
    './decoders/dwv/decode-rle.js';

  // // example private logic for roi dialog
  // dwv.customUI.openRoiDialog = function (meta, cb) {
  //   console.log('roi dialog', meta);
  //   const textExpr = prompt('[Custom dialog] Label', meta.textExpr);
  //   if (textExpr !== null) {
  //     meta.textExpr = textExpr;
  //     cb(meta);
  //   }
  // };

  // // example private logic for time value retrieval
  // dwv.TagValueExtractor.prototype.getTime = function (elements) {
  //   let value;
  //   const time = elements['ABCD0123'];
  //   if (typeof time !== 'undefined') {
  //     value = parseInt(time.value[0], 10);
  //   }
  //   return value;
  // };

  // stage options
  let dataViewConfigs;
  let viewOnFirstLoadItem = true;

  // use for concurrent load
  const numberOfDataToLoad = 1;

  if (_mode === 0) {
    // simplest: one layer group
    dataViewConfigs = prepareAndGetSimpleDataViewConfig();
  } else if (_mode === 1) {
    // MPR
    viewOnFirstLoadItem = false;
    dataViewConfigs = prepareAndGetMPRDataViewConfig();
  } else if (_mode === 2) {
    // simple side by side
    addLayerGroup('layerGroupA');
    addLayerGroup('layerGroupB');
    dataViewConfigs = {
      0: [
        {
          divId: 'layerGroupA'
        }
      ],
      1: [
        {
          divId: 'layerGroupB'
        }
      ]
    };
  } else if (_mode === 3) {
    // multiple data, multiple layer group
    addLayerGroup('layerGroupA');
    addLayerGroup('layerGroupB');
    dataViewConfigs = {
      0: [
        {
          divId: 'layerGroupA'
        },
        {
          divId: 'layerGroupB'
        }
      ],
      1: [
        {
          divId: 'layerGroupA'
        }
      ],
      2: [
        {
          divId: 'layerGroupB'
        }
      ],
      3: [
        {
          divId: 'layerGroupB'
        }
      ]
    };
  }

  // tools
  _tools = {
    Scroll: {},
    WindowLevel: {},
    ZoomAndPan: {},
    Opacity: {},
    Draw: {options: ['Rectangle']}
  };

  // app config
  const options = new dwv.AppOptions(dataViewConfigs);
  options.tools = _tools;
  options.viewOnFirstLoadItem = viewOnFirstLoadItem;
  // app
  _app = new dwv.App();
  _app.init(options);

  // bind events
  _app.addEventListener('loaderror', function (event) {
    console.error('load error', event);
  });
  _app.addEventListener('loadstart', function (event) {
    console.time('load-data-' + event.loadid);
  });
  const dataLoadProgress = new Array(numberOfDataToLoad);
  const sumReducer = function (sum, value) {
    return sum + value;
  };
  _app.addEventListener('loadprogress', function (event) {
    if (typeof event.lengthComputable !== 'undefined' &&
      event.lengthComputable) {
      dataLoadProgress[event.loadid] =
        Math.ceil((event.loaded / event.total) * 100);
      document.getElementById('loadprogress').value =
        dataLoadProgress.reduce(sumReducer) / numberOfDataToLoad;
    }
  });
  _app.addEventListener('load', function (event) {
    if (!viewOnFirstLoadItem) {
      _app.render(event.loadid);
    }
  });
  _app.addEventListener('loaditem', function (event) {
    if (typeof event.warn !== 'undefined') {
      console.warn('load-warn', event.warn);
    }
  });
  _app.addEventListener('loadend', function (event) {
    console.timeEnd('load-data-' + event.loadid);
  });

  let dataLoad = 0;
  const firstRender = [];
  _app.addEventListener('loadend', function (event) {
    // update UI at first render
    if (!firstRender.includes(event.loadid)) {
      // store data id
      firstRender.push(event.dataid);
      // log meta data
      if (event.loadtype === 'image') {
        console.log('metadata',
          getMetaDataWithNames(_app.getMetaData(event.loadid)));
        // add data row
        addDataRow(event.loadid);
        ++dataLoad;
        // init gui
        if (dataLoad === numberOfDataToLoad) {
          // select tool
          _app.setTool(getSelectedTool());

          const changeLayoutSelect = document.getElementById('changelayout');
          changeLayoutSelect.disabled = false;
          const resetLayoutButton = document.getElementById('resetlayout');
          resetLayoutButton.disabled = false;
        }
      }
    }

    if (event.loadtype === 'image' &&
      typeof _app.getMetaData(event.loadid)['00080060'] !== 'undefined' &&
      _app.getMetaData(event.loadid)['00080060'].value[0] === 'SEG') {
      // log SEG details
      logFramePosPats(_app.getMetaData(event.loadid));

      // example usage of a dicom SEG as data mask
      const useSegAsMask = false;
      if (useSegAsMask) {
        // image to filter
        const imgDataIndex = 0;
        const vls = _app.getViewLayersByDataIndex(imgDataIndex);
        const vc = vls[0].getViewController();
        const img = _app.getImage(imgDataIndex);
        const imgGeometry = img.getGeometry();
        const sliceSize = imgGeometry.getSize().getDimSize(2);
        // SEG image
        const segImage = _app.getImage(event.loadid);
        // calculate slice difference
        const segOrigin0 = segImage.getGeometry().getOrigins()[0];
        const segOrigin0Point = new dwv.Point([
          segOrigin0.getX(), segOrigin0.getY(), segOrigin0.getZ()
        ]);
        const segOriginIndex = imgGeometry.worldToIndex(segOrigin0Point);
        const indexOffset = segOriginIndex.get(2) * sliceSize;
        // set alpha function
        vc.setViewAlphaFunction(function (value, index) {
          // multiply by 3 since SEG is RGB
          const segIndex = 3 * (index - indexOffset);
          if (segIndex >= 0 &&
            segImage.getValueAtOffset(segIndex) === 0 &&
            segImage.getValueAtOffset(segIndex + 1) === 0 &&
            segImage.getValueAtOffset(segIndex + 2) === 0) {
            return 0;
          } else {
            return 0xff;
          }
        });
      }
    }
  });

  _app.addEventListener('positionchange', function (event) {
    const input = document.getElementById('position');
    const values = event.value[1];
    let text = '(index: ' + event.value[0] + ')';
    if (event.value.length > 2) {
      text += ' value: ' + event.value[2];
    }
    input.value = values.map(getPrecisionRound(2));
    // index as small text
    const span = document.getElementById('positionspan');
    span.innerHTML = text;
  });

  // default keyboard shortcuts
  window.addEventListener('keydown', function (event) {
    _app.defaultOnKeydown(event);
    // mask segment related
    if (!isNaN(parseInt(event.key, 10))) {
      const vc =
        _app.getActiveLayerGroup().getActiveViewLayer().getViewController();
      if (!vc.isMask()) {
        return;
      }
      const number = parseInt(event.key, 10);
      const segHelper = vc.getMaskSegmentHelper();
      if (segHelper.hasSegment(number)) {
        const segment = segHelper.getSegment(number);
        if (event.ctrlKey) {
          if (event.altKey) {
            console.log('Delete segment: ' + segment.label);
            // delete
            vc.deleteSegment(number, _app.addToUndoStack);
          } else {
            console.log('Show/hide segment: ' + segment.label);
            // show/hide the selected segment
            if (segHelper.isHidden(number)) {
              segHelper.removeFromHidden(number);
            } else {
              segHelper.addToHidden(number);
            }
            vc.applyHiddenSegments();
          }
        }
      }
    }
  });
  // default on resize
  window.addEventListener('resize', function () {
    _app.onResize();
  });

  const uriOptions = {};
  // special dicom web request header
  if (_dicomWeb) {
    uriOptions.requestHeaders = [{
      name: 'Accept',
      value: 'multipart/related; type="application/dicom"; transfer-syntax=*'
    }];
  }
  // load from window location
  _app.loadFromUri(window.location.href, uriOptions);
}

/**
 * Setup.
 */
function onDOMContentLoaded() {
  // setup
  viewerSetup();

  const positionInput = document.getElementById('position');
  positionInput.addEventListener('change', function () {
    const vls = _app.getViewLayersByDataIndex(0);
    const vc = vls[0].getViewController();
    const values = this.value.split(',');
    vc.setCurrentPosition(new dwv.Point([
      parseFloat(values[0]), parseFloat(values[1]), parseFloat(values[2])
    ])
    );
  });

  const resetLayoutButton = document.getElementById('resetlayout');
  resetLayoutButton.addEventListener('click', function () {
    _app.resetLayout();
  });

  const changeLayoutSelect = document.getElementById('changelayout');
  changeLayoutSelect.addEventListener('change', function (event) {
    let configs;
    const value = event.target.value;
    if (value === 'mpr') {
      configs = prepareAndGetMPRDataViewConfig();
    } else {
      configs = prepareAndGetSimpleDataViewConfig();
    }

    // unbind app to controls
    unbindAppToControls();

    // set config
    _app.setDataViewConfigs(configs);

    clearDataTable();
    for (let i = 0; i < _app.getNumberOfLoadedData(); ++i) {
      _app.render(i);
      // add data row (will bind controls)
      addDataRow(i);
    }

    // need to set tool after config change
    _app.setTool(getSelectedTool());
  });

  setupBindersCheckboxes();

  setupToolsCheckboxes();

  // bind app to input files
  const fileinput = document.getElementById('fileinput');
  fileinput.addEventListener('change', function (event) {
    console.log('%c ----------------', 'color: teal;');
    console.log(event.target.files);
    _app.loadFiles(event.target.files);
  });
}

/**
 * Append a layer div in the root 'dwv' one.
 *
 * @param {string} id The id of the layer.
 */
function addLayerGroup(id) {
  const layerDiv = document.createElement('div');
  layerDiv.id = id;
  layerDiv.className = 'layerGroup';
  const root = document.getElementById('dwv');
  root.appendChild(layerDiv);
}

/**
 * Create simple view config(s).
 *
 * @returns {object} The view config.
 */
function prepareAndGetSimpleDataViewConfig() {
  // clean up
  const dwvDiv = document.getElementById('dwv');
  dwvDiv.innerHTML = '';
  // add div
  addLayerGroup('layerGroupA');
  return {'*': [{divId: 'layerGroupA'}]};
}

/**
 * Create MPR view config(s).
 *
 * @returns {object} The view config.
 */
function prepareAndGetMPRDataViewConfig() {
  // clean up
  const dwvDiv = document.getElementById('dwv');
  dwvDiv.innerHTML = '';
  // add divs
  addLayerGroup('layerGroupA');
  addLayerGroup('layerGroupC');
  addLayerGroup('layerGroupS');
  return {
    '*': [
      {
        divId: 'layerGroupA',
        orientation: 'axial'
      },
      {
        divId: 'layerGroupC',
        orientation: 'coronal'
      },
      {
        divId: 'layerGroupS',
        orientation: 'sagittal'
      }
    ]
  };
}

/**
 * Get the layer groups div ids from the data view configs.
 *
 * @param {object} dataViewConfigs The configs.
 * @returns {Array} The list of ids.
 */
function getLayerGroupDivIds(dataViewConfigs) {
  const divIds = [];
  const keys = Object.keys(dataViewConfigs);
  for (let i = 0; i < keys.length; ++i) {
    const dataViewConfig = dataViewConfigs[keys[i]];
    for (let j = 0; j < dataViewConfig.length; ++j) {
      const divId = dataViewConfig[j].divId;
      if (!divIds.includes(divId)) {
        divIds.push(divId);
      }
    }
  }
  return divIds;
}

/**
 * Get the layer group ids associated to a data.
 *
 * @param {Array} dataViewConfig The data view config.
 * @returns {Array} The list of ids.
 */
function getDataLayerGroupIds(dataViewConfig) {
  const divIds = [];
  for (let j = 0; j < dataViewConfig.length; ++j) {
    divIds.push(dataViewConfig[j].divId);
  }
  return divIds;
}

/**
 * Setup the binders checkboxes
 */
function setupBindersCheckboxes() {
  const bindersDiv = document.getElementById('binders');
  const propList = [
    'WindowLevel',
    'Position',
    'Zoom',
    'Offset',
    'Opacity'
  ];
  const binders = [];
  // add all binders at startup
  for (let b = 0; b < propList.length; ++b) {
    binders.push(propList[b] + 'Binder');
  }
  _app.setLayerGroupsBinders(binders);

  /**
   * Add a binder.
   *
   * @param {string} propName The name of the property to bind.
   */
  function addBinder(propName) {
    binders.push(propName + 'Binder');
    _app.setLayerGroupsBinders(binders);
  }
  /**
   * Remove a binder.
   *
   * @param {string} propName The name of the property to bind.
   */
  function removeBinder(propName) {
    const index = binders.indexOf(propName + 'Binder');
    if (index !== -1) {
      binders.splice(index, 1);
    }
    _app.setLayerGroupsBinders(binders);
  }
  /**
   * Get the input change handler for a binder.
   *
   * @param {string} propName The name of the property to bind.
   * @returns {object} The handler.
   */
  function getOnInputChange(propName) {
    return function (event) {
      if (event.target.checked) {
        addBinder(propName);
      } else {
        removeBinder(propName);
      }
    };
  }
  // individual binders
  for (let i = 0; i < propList.length; ++i) {
    const propName = propList[i];

    const input = document.createElement('input');
    input.id = 'binder-' + i;
    input.type = 'checkbox';
    input.checked = true;
    input.onchange = getOnInputChange(propName);

    const label = document.createElement('label');
    label.htmlFor = input.id;
    label.appendChild(document.createTextNode(propName));

    bindersDiv.appendChild(input);
    bindersDiv.appendChild(label);
  }

  // check all
  const allInput = document.createElement('input');
  allInput.id = 'binder-all';
  allInput.type = 'checkbox';
  allInput.checked = true;
  allInput.onchange = function () {
    for (let j = 0; j < propList.length; ++j) {
      document.getElementById('binder-' + j).click();
    }
  };
  const allLabel = document.createElement('label');
  allLabel.htmlFor = allInput.id;
  allLabel.appendChild(document.createTextNode('all'));
  bindersDiv.appendChild(allInput);
  bindersDiv.appendChild(allLabel);
}

/**
 * Setup the tools checkboxes
 */
function setupToolsCheckboxes() {
  const toolsDiv = document.getElementById('tools');
  const keys = Object.keys(_tools);

  const getChangeTool = function (tool) {
    return function () {
      _app.setTool(tool);
      if (tool === 'Draw') {
        _app.setToolFeatures({shapeName: 'Rectangle'});
      }
    };
  };

  const getKeyCheck = function (char, input) {
    return function (event) {
      if (!event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        event.key === char) {
        input.click();
      }
    };
  };

  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];

    const input = document.createElement('input');
    input.id = 'tool-' + i;
    input.name = 'tools';
    input.type = 'radio';
    input.onchange = getChangeTool(key);

    if (key === 'Scroll') {
      input.checked = true;
    }

    const label = document.createElement('label');
    label.htmlFor = input.id;
    label.appendChild(document.createTextNode(key));

    toolsDiv.appendChild(input);
    toolsDiv.appendChild(label);

    // keyboard shortcut
    window.addEventListener(
      'keydown', getKeyCheck(key[0].toLowerCase(), input));
  }
}

/**
 * Get the selected tool
 *
 * @returns {string} The tool name.
 */
function getSelectedTool() {
  const toolsInput = document.getElementsByName('tools');
  let toolIndex = null;
  for (let j = 0; j < toolsInput.length; ++j) {
    if (toolsInput[j].checked) {
      toolIndex = j;
      break;
    }
  }
  return Object.keys(_tools)[toolIndex];
}

/**
 * Bind app to controls.
 */
function bindAppToControls() {
  _app.addEventListener('wlchange', onWLChange);
  _app.addEventListener('opacitychange', onOpacityChange);
}

/**
 * Unbind app to controls.
 */
function unbindAppToControls() {
  _app.removeEventListener('wlchange', onWLChange);
  _app.removeEventListener('opacitychange', onOpacityChange);
}

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
 * Clear the data table.
 */
function clearDataTable() {
  const detailsDiv = document.getElementById('layersdetails');
  detailsDiv.innerHTML = '';
}

/**
 * Get a control div: label, range and number field.
 *
 * @param {string} id The control id.
 * @param {string} name The control name.
 * @param {number} min The control minimum value.
 * @param {number} max The control maximum value.
 * @param {number} value The control value.
 * @param {Function} callback The callback on control value change.
 * @param {number} precision Optional number field float precision.
 * @returns {object} The control div.
 */
function getControlDiv(id, name, min, max, value, callback, precision) {
  const range = document.createElement('input');
  range.id = id + '-range';
  range.className = 'ctrl-range';
  range.type = 'range';
  range.min = min.toPrecision(precision);
  range.max = max.toPrecision(precision);
  range.step = ((max - min) * 0.01).toPrecision(precision);
  range.value = value;

  const label = document.createElement('label');
  label.id = id + '-label';
  label.className = 'ctrl-label';
  label.htmlFor = range.id;
  label.appendChild(document.createTextNode(name));

  const number = document.createElement('input');
  number.id = id + '-number';
  number.className = 'ctrl-number';
  number.type = 'number';
  number.min = range.min;
  number.max = range.max;
  number.step = range.step;
  number.value = parseFloat(value).toPrecision(precision);

  // callback and bind range and number
  number.oninput = function () {
    range.value = this.value;
    callback(this.value);
  };
  range.oninput = function () {
    number.value = parseFloat(this.value).toPrecision(precision);
    callback(this.value);
  };

  const div = document.createElement('div');
  div.id = id + '-ctrl';
  div.className = 'ctrl';
  div.appendChild(label);
  div.appendChild(range);
  div.appendChild(number);

  return div;
}

/**
 * Add a data row.
 *
 * @param {number} id The data index.
 */
function addDataRow(id) {
  // bind app to controls on first id
  if (id === 0) {
    bindAppToControls();
  }

  const dataViewConfigs = _app.getDataViewConfigs();
  const allLayerGroupDivIds = getLayerGroupDivIds(dataViewConfigs);
  // use first view layer
  const vls = _app.getViewLayersByDataIndex(id);
  const vl = vls[0];
  const vc = vl.getViewController();
  const wl = vc.getWindowLevel();

  let table = document.getElementById('layerstable');
  let body;
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
    for (let j = 0; j < allLayerGroupDivIds.length; ++j) {
      insertTCell('LG' + j);
    }
    insertTCell('Alpha Range');
    insertTCell('Contrast');
    insertTCell('Alpha');
    body = table.createTBody();
    const div = document.getElementById('layersdetails');
    div.appendChild(table);
  } else {
    body = table.getElementsByTagName('tbody')[0];
  }

  // add new layer row
  const row = body.insertRow();
  let cell;

  // cell: id
  cell = row.insertCell();
  cell.appendChild(document.createTextNode(id));

  // cell: radio
  let viewConfig = dataViewConfigs[id];
  if (typeof viewConfig === 'undefined') {
    viewConfig = dataViewConfigs['*'];
  }
  const dataLayerGroupsIds = getDataLayerGroupIds(viewConfig);
  for (let l = 0; l < allLayerGroupDivIds.length; ++l) {
    const layerGroupDivId = allLayerGroupDivIds[l];
    cell = row.insertCell();
    if (!dataLayerGroupsIds.includes(layerGroupDivId)) {
      continue;
    }
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'layerselect-' + l;
    radio.id = 'layerselect-' + layerGroupDivId + '-' + id;
    radio.checked = true;
    radio.onchange = function (event) {
      const fullId = event.target.id;
      const split = fullId.split('-');
      const groupDivId = split[1];
      const dataId = split[2];
      const lg = _app.getLayerGroupByDivId(groupDivId);
      lg.setActiveViewLayerByDataIndex(parseInt(dataId, 10));
    };
    cell.appendChild(radio);
  }

  const image = _app.getImage(vl.getDataIndex());
  const dataRange = image.getDataRange();
  const rescaledDataRange = image.getRescaledDataRange();
  const floatPrecision = 4;

  // cell: alpha range
  cell = row.insertCell();
  const minId = 'value-min-' + id;
  const maxId = 'value-max-' + id;
  // callback
  const changeAlphaFunc = function () {
    const min = parseFloat(document.getElementById(minId + '-number').value);
    const max = parseFloat(document.getElementById(maxId + '-number').value);
    const func = function (value) {
      if (value >= min && value <= max) {
        return 255;
      }
      return 0;
    };
    for (let i = 0; i < vls.length; ++i) {
      vls[i].getViewController().setViewAlphaFunction(func);
    }
  };
  // add controls
  cell.appendChild(getControlDiv(minId, 'min',
    dataRange.min, dataRange.max, dataRange.min,
    changeAlphaFunc, floatPrecision));
  cell.appendChild(getControlDiv(maxId, 'max',
    dataRange.min, dataRange.max, dataRange.max,
    changeAlphaFunc, floatPrecision));

  // cell: contrast
  cell = row.insertCell();
  const widthId = 'width-' + id;
  const centerId = 'center-' + id;
  // callback
  const changeContrast = function () {
    const width =
      parseFloat(document.getElementById(widthId + '-number').value);
    const center =
      parseFloat(document.getElementById(centerId + '-number').value);
    vc.setWindowLevel(center, width);
  };
  // add controls
  cell.appendChild(getControlDiv(widthId, 'width',
    0, rescaledDataRange.max - rescaledDataRange.min, wl.width,
    changeContrast, floatPrecision));
  cell.appendChild(getControlDiv(centerId, 'center',
    rescaledDataRange.min, rescaledDataRange.max, wl.center,
    changeContrast, floatPrecision));

  // cell: opactiy
  cell = row.insertCell();
  const opacityId = 'opacity-' + id;
  // callback
  const changeOpacity = function (value) {
    vl.setOpacity(value);
    vl.draw();
  };
  // add controls
  cell.appendChild(getControlDiv(opacityId, 'opacity',
    0, 1, vl.getOpacity(), changeOpacity, floatPrecision));
}

/**
 * Compare two pos pat keys.
 *
 * @param {string} a The key of the first item.
 * @param {string} b The key of the second item.
 * @returns {number} Negative if a<b, positive if a>b.
 */
function comparePosPat(a, b) {
  const za = parseFloat(a.split('\\').at(-1));
  const zb = parseFloat(b.split('\\').at(-1));
  return za - zb;
}

/**
 * Sort an object with pos pat string keys.
 *
 * @param {object} obj The object to sort
 * @returns {object} The sorted object.
 */
function sortByPosPatKey(obj) {
  const keys = Object.keys(obj);
  keys.sort(comparePosPat);
  const sorted = new Map();
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    sorted.set(key, obj[key]);
  }
  return sorted;
}

/**
 * Get a rounding function for a specific precision.
 *
 * @param {number} precision The rounding precision.
 * @returns {Function} The rounding function.
 */
function getPrecisionRound(precision) {
  return function (x) {
    return dwv.precisionRound(x, precision);
  };
}

/**
 * Log the DICCOM seg segments ordered by frame position patients.
 *
 * @param {object} elements The DICOM seg elements.
 */
function logFramePosPats(elements) {
  // PerFrameFunctionalGroupsSequence
  const perFrame = elements['52009230'].value;
  const perPos = {};
  for (let i = 0; i < perFrame.length; ++i) {
    // PlanePositionSequence
    const posSq = perFrame[i]['00209113'].value;
    // ImagePositionPatient
    const pos = posSq[0]['00200032'].value;
    if (typeof perPos[pos] === 'undefined') {
      perPos[pos] = [];
    }
    // FrameContentSequence
    const frameSq = perFrame[i]['00209111'].value;
    // DimensionIndexValues
    const dim = frameSq[0]['00209157'].value;
    perPos[pos].push(dim);
  }
  console.log('DICOM SEG Segments', sortByPosPatKey(perPos));
}

/**
 * Get the meta data with names instead of tag keys.
 *
 * @param {object} metaData The initial meta data.
 * @returns {object} The list of meta data.
 */
function getMetaDataWithNames(metaData) {
  let meta = metaData;
  if (typeof meta['00020010'] !== 'undefined') {
    // replace tag key with tag name for dicom
    meta = Object.keys(meta).reduce((accumulator, currentValue) => {
      const tag = dwv.getTagFromKey(currentValue);
      let key = tag.getNameFromDictionary();
      if (typeof key === 'undefined') {
        // add 'x' to help sorting
        key = 'x' + tag.getKey();
      }
      accumulator[key] = meta[currentValue];
      return accumulator;
    }, {});
  }
  return meta;
}
