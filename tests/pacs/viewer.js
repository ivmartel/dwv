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

/**
 * Setup simple dwv app.
 */
dwv.test.viewerSetup = function () {
  // stage options
  var dataViewConfigs;
  var viewOnFirstLoadItem = true;

  var mode = 0;
  if (mode === 0) {
    // simplest: one layer group
    dataViewConfigs = prepareAndGetSimpleDataViewConfig();
  } else if (mode === 1) {
    // MPR
    viewOnFirstLoadItem = false;
    dataViewConfigs = prepareAndGetMPRDataViewConfig();
  } else if (mode === 2) {
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
  }

  // app config
  var config = {
    viewOnFirstLoadItem: viewOnFirstLoadItem,
    dataViewConfigs: dataViewConfigs,
    tools: {
      Scroll: {},
      WindowLevel: {},
      ZoomAndPan: {},
      Draw: {options: ['Rectangle'], type: 'factory'}
    }
  };
  // app
  _app = new dwv.App();
  _app.init(config);

  // bind events
  var isFirstRender = null;
  _app.addEventListener('error', function (event) {
    console.error('load error', event);
  });
  _app.addEventListener('loadstart', function () {
    console.time('load-data');
    isFirstRender = true;
  });
  _app.addEventListener('loadprogress', function (event) {
    if (typeof event.lengthComputable !== 'undefined' &&
      event.lengthComputable) {
      var percent = Math.ceil((event.loaded / event.total) * 100);
      document.getElementById('loadprogress').value = percent;
    }
  });
  var dataLoad = 0;
  _app.addEventListener('load', function (event) {
    if (!viewOnFirstLoadItem) {
      _app.render(event.loadid);
    }
    // add data control row
    addDataRow(dataLoad, dataViewConfigs);
    ++dataLoad;
  });
  _app.addEventListener('loadend', function (event) {
    console.timeEnd('load-data');
    console.log(_app.getMetaData(event.loadid));
  });
  _app.addEventListener('renderend', function () {
    if (isFirstRender) {
      isFirstRender = false;
      // select tool
      _app.setTool('Scroll');

      var changeLayoutSelect = document.getElementById('changelayout');
      changeLayoutSelect.disabled = false;
      var resetLayoutButton = document.getElementById('resetlayout');
      resetLayoutButton.disabled = false;
    }
  });

  _app.addEventListener('positionchange', function (event) {
    var input = document.getElementById('position');
    var toFixed2 = function (val) {
      var str = val.toString();
      return str.slice(0, str.indexOf('.') + 2);
    };
    input.value = toFixed2(event.value[1][0]) + ', ' +
      toFixed2(event.value[1][1]) + ', ' +
      toFixed2(event.value[1][2]);
  });

  console.log(
    '%c Available tools: (s)croll, (w)indowlevel, (z)oomandpan, (d)raw.',
    'color: teal;');
  _app.addEventListener('keydown', function (event) {
    _app.defaultOnKeydown(event);
    if (event.keyCode === 83) { // s
      console.log('%c tool: scroll', 'color: teal;');
      _app.setTool('Scroll');
    } else if (event.keyCode === 87) { // w
      console.log('%c tool: windowlevel', 'color: teal;');
      _app.setTool('WindowLevel');
    } else if (event.keyCode === 90) { // z
      console.log('%c tool: zoomandpan', 'color: teal;');
      _app.setTool('ZoomAndPan');
    } else if (event.keyCode === 68) { // d
      console.log('%c tool: draw', 'color: teal;');
      _app.setTool('Draw');
      _app.setDrawShape('Rectangle');
    }
  });

  // load from location
  dwv.utils.loadFromUri(window.location.href, _app);
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

    _app.setTool('Scroll');
  });

  setupBindersCheckboxes();

  // bind app to input files
  var fileinput = document.getElementById('fileinput');
  fileinput.addEventListener('change', function (event) {
    console.log('%c ----------------', 'color: teal;');
    console.log(event.target.files);
    _app.loadFiles(event.target.files);
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
  for (var i = 0; i < propList.length; ++i) {
    var propName = propList[i];

    var input = document.createElement('input');
    input.id = i;
    input.type = 'checkbox';
    input.onchange = getOnInputChange(propName);

    var label = document.createElement('label');
    label.for = i;
    label.appendChild(input);
    label.appendChild(document.createTextNode(propName));

    bindersDiv.appendChild(label);
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
    insertTCell('Width');
    insertTCell('Center');
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

  var dataRange = _app.getImage(vl.getDataIndex()).getRescaledDataRange();

  // cell: data range
  cell = row.insertCell();
  var widthmin = document.createElement('input');
  widthmin.type = 'range';
  widthmin.max = dataRange.max;
  widthmin.min = dataRange.min;
  widthmin.step = (dataRange.max - dataRange.min) * 0.001;
  widthmin.value = dataRange.min;
  var widthmax = document.createElement('input');
  widthmax.type = 'range';
  widthmax.max = widthmin.max;
  widthmax.min = widthmin.min;
  widthmax.step = widthmin.step;
  widthmax.value = dataRange.max;
  cell.appendChild(widthmin);
  cell.appendChild(widthmax);

  var changeAlphaFunc = function (min, max) {
    var func = function (value) {
      if (value > min && value < max) {
        return 255;
      }
      return 0;
    };
    vc.setViewAlphaFunction(func);
  };
  widthmin.oninput = function () {
    changeAlphaFunc(this.value, widthmax.value);
  };
  widthmax.oninput = function () {
    changeAlphaFunc(widthmin.value, this.value);
  };

  // cell: window width
  cell = row.insertCell();
  var widthrange = document.createElement('input');
  widthrange.type = 'range';
  widthrange.max = dataRange.max - dataRange.min;
  widthrange.min = 0;
  widthrange.step = (dataRange.max - dataRange.min) * 0.001;
  widthrange.value = wl.width;
  var widthnumber = document.createElement('input');
  widthnumber.type = 'number';
  widthnumber.max = widthrange.max;
  widthnumber.min = widthrange.min;
  widthnumber.step = widthrange.step;
  widthnumber.value = widthrange.value;
  cell.appendChild(widthrange);
  cell.appendChild(widthnumber);

  // cell: window center
  cell = row.insertCell();
  var centerrange = document.createElement('input');
  centerrange.type = 'range';
  centerrange.max = dataRange.max;
  centerrange.min = dataRange.min;
  centerrange.step = (dataRange.max - dataRange.min) * 0.001;
  centerrange.value = wl.center;
  var centernumber = document.createElement('input');
  centernumber.type = 'number';
  centernumber.max = centerrange.max;
  centernumber.min = centerrange.min;
  centernumber.step = centerrange.step;
  centernumber.value = centerrange.value;
  cell.appendChild(centerrange);
  cell.appendChild(centernumber);

  var changeWidth = function (value) {
    vc.setWindowLevel(centernumber.value, value);
  };
  widthnumber.oninput = function () {
    changeWidth(this.value);
    widthrange.value = this.value;
  };
  widthrange.oninput = function () {
    changeWidth(this.value);
    widthnumber.value = this.value;
  };

  var changeCenter = function (value) {
    vc.setWindowLevel(value, widthnumber.value);
    vl.draw();
  };
  centernumber.oninput = function () {
    changeCenter(this.value);
    centerrange.value = this.value;
  };
  centerrange.oninput = function () {
    changeCenter(this.value);
    centernumber.value = this.value;
  };

  // cell: opactiy
  cell = row.insertCell();
  var changeOpacity = function (value) {
    vl.setOpacity(value);
    vl.draw();
  };
  var opacityrange = document.createElement('input');
  opacityrange.type = 'range';
  opacityrange.max = 1;
  opacityrange.min = 0;
  opacityrange.step = 0.1;
  opacityrange.value = vl.getOpacity();
  var opacitynumber = document.createElement('input');
  opacitynumber.type = 'number';
  opacitynumber.max = opacityrange.max;
  opacitynumber.min = opacityrange.min;
  opacitynumber.step = opacityrange.step;
  opacitynumber.value = opacityrange.value;
  opacitynumber.oninput = function () {
    changeOpacity(this.value);
    opacityrange.value = this.value;
  };
  opacityrange.oninput = function () {
    changeOpacity(this.value);
    opacitynumber.value = this.value;
  };
  cell.appendChild(opacityrange);
  cell.appendChild(opacitynumber);
}
