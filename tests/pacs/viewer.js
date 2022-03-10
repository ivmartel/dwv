var dwv = dwv || {};
dwv.test = dwv.test || {};

// Image decoders (for web workers)
dwv.image.decoderScripts = {
  jpeg2000: '../../decoders/pdfjs/decode-jpeg2000.js',
  'jpeg-lossless': '../../decoders/rii-mango/decode-jpegloss.js',
  'jpeg-baseline': '../../decoders/pdfjs/decode-jpegbaseline.js',
  rle: '../../decoders/dwv/decode-rle.js'
};
// logger level (optional)
dwv.logger.level = dwv.utils.logger.levels.DEBUG;

var _app = null;
var _tools = null;

// viewer options
var _mode = 0;
var _dicomWeb = false;

/**
 * Setup simple dwv app.
 */
dwv.test.viewerSetup = function () {
  // stage options
  var dataViewConfigs;
  var viewOnFirstLoadItem = true;

  // use for concurrent load
  var numberOfDataToLoad = 1;

  if (_mode === 0) {
    // simplest: one layer group
    dataViewConfigs = prepareAndGetSimpleDataViewConfig();
  } else if (_mode === 1) {
    // MPR
    viewOnFirstLoadItem = false;
    dataViewConfigs = prepareAndGetMPRDataViewConfig();
  } else if (_mode === 2) {
    // multiple data, multiple layer group
    addLayerGroup('layerGroup0');
    addLayerGroup('layerGroup1');
    dataViewConfigs = {
      0: [
        {
          divId: 'layerGroup0'
        },
        {
          divId: 'layerGroup1'
        }
      ],
      1: [
        {
          divId: 'layerGroup0'
        }
      ],
      2: [
        {
          divId: 'layerGroup1'
        }
      ],
      3: [
        {
          divId: 'layerGroup1'
        }
      ]
    };
  } else if (_mode === 3) {
    // timepoint mode
    dataViewConfigs = prepareAndGetSimpleDataViewConfig();
  }

  // tools
  _tools = {
    Scroll: {},
    WindowLevel: {},
    ZoomAndPan: {},
    Draw: {options: ['Rectangle'], type: 'factory'}
  };

  // app config
  var config = {
    viewOnFirstLoadItem: viewOnFirstLoadItem,
    dataViewConfigs: dataViewConfigs,
    tools: _tools
  };
  // app
  _app = new dwv.App();
  _app.init(config);

  // bind events
  _app.addEventListener('error', function (event) {
    console.error('load error', event);
  });
  _app.addEventListener('loadstart', function (event) {
    console.time('load-data-' + event.loadid);
  });
  var dataLoadProgress = new Array(numberOfDataToLoad);
  var sumReducer = function (sum, value) {
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
  var dataLoad = 0;
  _app.addEventListener('load', function (event) {
    console.log(_app.getMetaData(event.loadid));
    if (!viewOnFirstLoadItem) {
      _app.render(event.loadid);
    }
    // add data control row
    if (_mode !== 3) {
      addDataRow(dataLoad, dataViewConfigs);
    }
    ++dataLoad;
    // init gui
    if (dataLoad === numberOfDataToLoad) {
      // select tool
      _app.setTool('Scroll');

      var changeLayoutSelect = document.getElementById('changelayout');
      changeLayoutSelect.disabled = false;
      var resetLayoutButton = document.getElementById('resetlayout');
      resetLayoutButton.disabled = false;
    }
  });
  _app.addEventListener('loadend', function (event) {
    console.timeEnd('load-data-' + event.loadid);
  });

  _app.addEventListener('positionchange', function (event) {
    var input = document.getElementById('position');
    var toFixed2 = function (val) {
      var str = val.toString();
      var value = null;
      var dotIndex = str.indexOf('.');
      if (dotIndex === -1) {
        value = str;
      } else {
        value = str.slice(0, Math.min(dotIndex + 2, str.length));
      }
      return value;
    };
    var values = event.value[1];
    var text = '(index: ' + event.value[0] + ')';
    if (event.value.length > 2) {
      text += ' value: ' + event.value[2];
    }
    input.value = values.map(toFixed2);
    // index as small text
    var span = document.getElementById('positionspan');
    span.innerHTML = text;
  });

  // default keyboard shortcuts
  _app.addEventListener('keydown', function (event) {
    _app.defaultOnKeydown(event);
  });

  var options = {};
  // special dicom web request header
  if (_dicomWeb) {
    options.requestHeaders = [{
      name: 'Accept',
      value: 'multipart/related; type="application/dicom"; transfer-syntax=*'
    }];
  }
  // load from window location
  dwv.utils.loadFromUri(window.location.href, _app, options);
};

/**
 * Last minute.
 */
dwv.test.onDOMContentLoadedViewer = function () {
  // setup
  dwv.test.viewerSetup();

  var positionInput = document.getElementById('position');
  positionInput.addEventListener('change', function () {
    var vls = _app.getViewLayersByDataIndex(0);
    var vc = vls[0].getViewController();
    var values = this.value.split(',');
    vc.setCurrentPosition(new dwv.math.Point3D(
      parseFloat(values[0]), parseFloat(values[1]), parseFloat(values[2]))
    );
  });

  var resetLayoutButton = document.getElementById('resetlayout');
  resetLayoutButton.addEventListener('click', function () {
    _app.resetLayout();
  });

  var changeLayoutSelect = document.getElementById('changelayout');
  changeLayoutSelect.addEventListener('change', function (event) {
    var configs;
    var value = event.target.value;
    if (value === 'mpr') {
      configs = prepareAndGetMPRDataViewConfig();
    } else {
      configs = prepareAndGetSimpleDataViewConfig();
    }

    _app.setDataViewConfig(configs);

    clearDataTable();
    for (var i = 0; i < _app.getNumberOfLoadedData(); ++i) {
      _app.render(i);
      addDataRow(i, configs);
    }

    // need to set tool after config change
    var toolsInput = document.getElementsByName('tools');
    var toolIndex = null;
    for (var j = 0; j < toolsInput.length; ++j) {
      if (toolsInput[j].checked) {
        toolIndex = j;
        break;
      }
    }
    _app.setTool(Object.keys(_tools)[toolIndex]);
  });

  setupBindersCheckboxes();

  setupToolsCheckboxes();

  // bind app to input files
  var timeId = -1;
  var fileinput = document.getElementById('fileinput');
  fileinput.addEventListener('change', function (event) {
    ++timeId;
    console.log('%c ----------------', 'color: teal;');
    console.log(event.target.files);
    var options = {};
    if (_mode === 3) {
      options = {timepoint: {id: timeId, dataId: 0}};
    }
    _app.loadFiles(event.target.files, options);
  });
};

/**
 * Append a layer div in the root 'dwv' one.
 *
 * @param {string} id The id of the layer.
 */
function addLayerGroup(id) {
  var layerDiv = document.createElement('div');
  layerDiv.id = id;
  layerDiv.className = 'layerGroup';
  var root = document.getElementById('dwv');
  root.appendChild(layerDiv);
}

/**
 * Create simple view config(s).
 *
 * @returns {object} The view config.
 */
function prepareAndGetSimpleDataViewConfig() {
  // clean up
  var dwvDiv = document.getElementById('dwv');
  dwvDiv.innerHTML = '';
  // add div
  addLayerGroup('layerGroup0');
  return {'*': [{divId: 'layerGroup0'}]};
}

/**
 * Create MPR view config(s).
 *
 * @returns {object} The view config.
 */
function prepareAndGetMPRDataViewConfig() {
  // clean up
  var dwvDiv = document.getElementById('dwv');
  dwvDiv.innerHTML = '';
  // add divs
  addLayerGroup('layerGroup0');
  addLayerGroup('layerGroup1');
  addLayerGroup('layerGroup2');
  return {
    '*': [
      {
        divId: 'layerGroup0',
        orientation: 'axial'
      },
      {
        divId: 'layerGroup1',
        orientation: 'coronal'
      },
      {
        divId: 'layerGroup2',
        orientation: 'sagittal'
      }
    ]
  };
}

/**
 * Get the layer groups ids from the data view configs.
 *
 * @param {object} dataViewConfigs The configs.
 * @returns {Array} The list of ids.
 */
function getLayerGroupIds(dataViewConfigs) {
  var divIds = [];
  var keys = Object.keys(dataViewConfigs);
  for (var i = 0; i < keys.length; ++i) {
    var dataViewConfig = dataViewConfigs[keys[i]];
    for (var j = 0; j < dataViewConfig.length; ++j) {
      var divId = dataViewConfig[j].divId;
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
  var divIds = [];
  for (var j = 0; j < dataViewConfig.length; ++j) {
    divIds.push(dataViewConfig[j].divId);
  }
  return divIds;
}

/**
 * Setup the binders checkboxes
 */
function setupBindersCheckboxes() {
  var bindersDiv = document.getElementById('binders');
  var propList = [
    'WindowLevel',
    'Position',
    'Zoom',
    'Offset',
    'Opacity'
  ];
  var binders = [];
  /**
   * Add a binder.
   *
   * @param {string} propName The name of the property to bind.
   */
  function addBinder(propName) {
    binders.push(new dwv.gui[propName + 'Binder']);
    _app.setLayerGroupsBinders(binders);
  }
  /**
   * Remove a binder.
   *
   * @param {string} propName The name of the property to bind.
   */
  function removeBinder(propName) {
    for (var i = 0; i < binders.length; ++i) {
      if (binders[i] instanceof dwv.gui[propName + 'Binder']) {
        binders.splice(i, 1);
      }
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
  for (var i = 0; i < propList.length; ++i) {
    var propName = propList[i];

    var input = document.createElement('input');
    input.id = 'binder-' + i;
    input.type = 'checkbox';
    input.onchange = getOnInputChange(propName);

    var label = document.createElement('label');
    label.htmlFor = input.id;
    label.appendChild(document.createTextNode(propName));

    bindersDiv.appendChild(input);
    bindersDiv.appendChild(label);
  }

  // check all
  var allInput = document.createElement('input');
  allInput.id = 'binder-all';
  allInput.type = 'checkbox';
  allInput.onchange = function () {
    for (var j = 0; j < propList.length; ++j) {
      document.getElementById('binder-' + j).click();
    }
  };
  var allLabel = document.createElement('label');
  allLabel.htmlFor = allInput.id;
  allLabel.appendChild(document.createTextNode('all'));
  bindersDiv.appendChild(allInput);
  bindersDiv.appendChild(allLabel);
}

/**
 * Setup the tools checkboxes
 */
function setupToolsCheckboxes() {
  var toolsDiv = document.getElementById('tools');
  var keys = Object.keys(_tools);

  var getChangeTool = function (tool) {
    return function () {
      _app.setTool(tool);
      if (tool === 'Draw') {
        _app.setDrawShape('Rectangle');
      }
    };
  };

  var getKeyCheck = function (char, input) {
    return function (event) {
      if (event.keyCode === char) {
        input.click();
      }
    };
  };

  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];

    var input = document.createElement('input');
    input.id = 'tool-' + i;
    input.name = 'tools';
    input.type = 'radio';
    input.onchange = getChangeTool(key);

    if (key === 'Scroll') {
      input.checked = true;
    }

    var label = document.createElement('label');
    label.htmlFor = input.id;
    label.appendChild(document.createTextNode(key));

    toolsDiv.appendChild(input);
    toolsDiv.appendChild(label);

    // keyboard shortcut
    window.addEventListener('keydown', getKeyCheck(key.charCodeAt(0), input));
  }
}

/**
 * Clear the data table.
 */
function clearDataTable() {
  var detailsDiv = document.getElementById('layersdetails');
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
  var range = document.createElement('input');
  range.id = id + '-range';
  range.className = 'ctrl-range';
  range.type = 'range';
  range.min = min;
  range.max = max;
  range.step = (max - min) * 0.01;
  range.value = value;

  var label = document.createElement('label');
  label.id = id + '-label';
  label.className = 'ctrl-label';
  label.htmlFor = range.id;
  label.appendChild(document.createTextNode(name));

  var number = document.createElement('input');
  number.id = id + '-number';
  number.className = 'ctrl-number';
  number.type = 'number';
  number.min = range.min;
  number.max = range.max;
  number.step = range.step;
  number.value = parseFloat(range.value).toPrecision(precision);

  // callback and bind range and number
  number.oninput = function () {
    range.value = this.value;
    callback(this.value);
  };
  range.oninput = function () {
    number.value = parseFloat(this.value).toPrecision(precision);
    callback(this.value);
  };

  var div = document.createElement('div');
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
 * @param {object} dataViewConfigs The view configurations.
 */
function addDataRow(id, dataViewConfigs) {
  var layerGroupIds = getLayerGroupIds(dataViewConfigs);
  // use first view layer
  var vls = _app.getViewLayersByDataIndex(id);
  var vl = vls[0];
  var vc = vl.getViewController();
  var wl = vc.getWindowLevel();

  var table = document.getElementById('layerstable');
  var body;
  // create table if not present
  if (!table) {
    table = document.createElement('table');
    table.id = 'layerstable';
    var header = table.createTHead();
    var trow = header.insertRow(0);
    var insertTCell = function (text) {
      var th = document.createElement('th');
      th.innerHTML = text;
      trow.appendChild(th);
    };
    insertTCell('Id');
    for (var j = 0; j < layerGroupIds.length; ++j) {
      insertTCell('LG' + j);
    }
    insertTCell('Alpha Range');
    insertTCell('Contrast');
    insertTCell('Alpha');
    body = table.createTBody();
    var div = document.getElementById('layersdetails');
    div.appendChild(table);
  } else {
    body = table.getElementsByTagName('tbody')[0];
  }

  // add new layer row
  var row = body.insertRow();
  var cell;

  // cell: id
  cell = row.insertCell();
  cell.appendChild(document.createTextNode(id));

  // cell: radio
  var viewConfig = dataViewConfigs[id];
  if (typeof viewConfig === 'undefined') {
    viewConfig = dataViewConfigs['*'];
  }
  var dataLayerGroupsIds = getDataLayerGroupIds(viewConfig);
  for (var l = 0; l < layerGroupIds.length; ++l) {
    var layerGroupId = layerGroupIds[l];
    cell = row.insertCell();
    if (!dataLayerGroupsIds.includes(layerGroupId)) {
      continue;
    }
    var radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'layerselect-' + l;
    radio.id = l + '-' + id;
    radio.checked = true;
    radio.onchange = function (event) {
      var fullId = event.srcElement.id;
      var groupId = fullId.substring(0, fullId.indexOf('-'));
      var dataId = fullId.substring(fullId.indexOf('-') + 1);
      var lg = _app.getLayerGroupById(groupId);
      lg.setActiveViewLayerByDataIndex(parseInt(dataId, 10));
    };
    cell.appendChild(radio);
  }

  var image = _app.getImage(vl.getDataIndex());
  var dataRange = image.getDataRange();
  var rescaledDataRange = image.getRescaledDataRange();
  var floatPrecision = 4;

  // cell: alpha range
  cell = row.insertCell();
  var minId = 'value-min-' + id;
  var maxId = 'value-max-' + id;
  // calback
  var changeAlphaFunc = function () {
    var min = parseFloat(document.getElementById(minId + '-number').value);
    var max = parseFloat(document.getElementById(maxId + '-number').value);
    var func = function (value) {
      if (value >= min && value <= max) {
        return 255;
      }
      return 0;
    };
    vc.setViewAlphaFunction(func);
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
  var widthId = 'width-' + id;
  var centerId = 'center-' + id;
  // calback
  var changeContrast = function () {
    var width = parseFloat(document.getElementById(widthId + '-number').value);
    var center =
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
  var opacityId = 'opactiy-' + id;
  // calback
  var changeOpacity = function (value) {
    vl.setOpacity(value);
    vl.draw();
  };
  // add controls
  cell.appendChild(getControlDiv(opacityId, 'opacity',
    0, 1, vl.getOpacity(), changeOpacity));
}
