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

  /**
   * Append a layer div in the root 'dwv' one.
   *
   * @param {string} id The id of the layer.
   */
  function addLayer(id) {
    var layer = document.createElement('div');
    layer.id = id;
    layer.className = 'layerGroup';
    var root = document.getElementById('dwv');
    root.appendChild(layer);
  }

  /**
   * Create simple view config(s).
   *
   * @param {number} numberOfData The number of data.
   * @param {boolean} sameDiv If all data go in the same div.
   * @returns {object} The view config.
   */
  function createSimpleDataViewConfig(numberOfData, sameDiv) {
    if (typeof sameDiv === 'undefined') {
      sameDiv = false;
    }
    var configs = {};
    for (var i = 0; i < numberOfData; ++i) {
      var divName = 'layerGroup0';
      if (!sameDiv) {
        divName = 'layerGroup' + i;
      }
      configs[i] = [{divId: divName}];
    }
    return configs;
  }

  /**
   * Create MPR view config(s).
   *
   * @param {number} numberOfData The number of data.
   * @returns {object} The view config.
   */
  function createMPRDataViewConfig(numberOfData) {
    var configs = {};
    for (var i = 0; i < numberOfData; ++i) {
      configs[i] = [
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
      ];
    }
    return configs;
  }

  // stage options
  var dataViewConfigs;
  var nSimultaneousData = 1;
  var viewOnFirstLoadItem = true;

  var mode = 3;
  addLayer('layerGroup0');
  if (mode === 0) {
    // simplest: one data, one layer group
    dataViewConfigs = createSimpleDataViewConfig(nSimultaneousData);
  } else if (mode === 1) {
    // multiple data, multiple layer group
    nSimultaneousData = 2;
    addLayer('layerGroup1');
    dataViewConfigs = createSimpleDataViewConfig(nSimultaneousData);
    console.log(dataViewConfigs);
  } else if (mode === 2) {
    // multiple data, one layer group
    nSimultaneousData = 2;
    dataViewConfigs = createSimpleDataViewConfig(nSimultaneousData, true);
  } else if (mode === 3) {
    // single data, multiple layer groups -> MPR
    viewOnFirstLoadItem = false;
    nSimultaneousData = 2;
    addLayer('layerGroup1');
    addLayer('layerGroup2');
    dataViewConfigs = createMPRDataViewConfig(nSimultaneousData);
  }

  // layer group binders
  var binders = [
    new dwv.gui.WindowLevelBinder(),
    new dwv.gui.PositionBinder(),
    new dwv.gui.ZoomBinder(),
    new dwv.gui.OffsetBinder(),
    new dwv.gui.OpacityBinder()
  ];

  // app config
  var config = {
    viewOnFirstLoadItem: viewOnFirstLoadItem,
    nSimultaneousData: nSimultaneousData,
    dataViewConfigs: dataViewConfigs,
    binders: binders,
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
  _app.addEventListener('load', function () {
    if (!viewOnFirstLoadItem) {
      _app.render();
    }
    // update active layer
    dwv.test.addLayerRow(dataLoad);
    ++dataLoad;
  });
  _app.addEventListener('loadend', function () {
    console.timeEnd('load-data');
    console.log(_app.getMetaData());
  });
  // _app.addEventListener('renderstart', function (event) {
  //   console.time('render-data ' + event.layerid);
  // });
  // _app.addEventListener('renderend', function (event) {
  //   console.timeEnd('render-data ' + event.layerid);
  // });
  _app.addEventListener('renderend', function () {
    if (isFirstRender) {
      isFirstRender = false;
      // select tool
      _app.setTool('Scroll');
    }
  });

  _app.addEventListener('positionchange', function (event) {
    var input = document.getElementById('position');
    input.value = event.value[0];
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

dwv.test.addLayerRow = function (id) {
  var lg = _app.getActiveLayerGroup();
  var vl = lg.getActiveViewLayer();
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
    insertTCell('Active');
    insertTCell('Id');
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
  var radio = document.createElement('input');
  radio.type = 'radio';
  radio.name = 'layerselect';
  radio.id = id;
  radio.checked = true;
  radio.onchange = function (event) {
    for (var i = 0; i < _app.getNumberOfLayerGroups(); ++i) {
      _app.getLayerGroupById(i).setActiveViewLayer(2 * event.srcElement.id);
    }
  };
  cell = row.insertCell();
  cell.appendChild(radio);

  var dataRange = _app.getImage().getRescaledDataRange();

  // cell: window width
  cell = row.insertCell();
  var widthrange = document.createElement('input');
  widthrange.type = 'range';
  widthrange.max = dataRange.max - dataRange.min;
  widthrange.min = 0;
  widthrange.step = (dataRange.max - dataRange.min) * 0.1;
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
    vl.draw();
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
  opacityrange.value = 1;
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
};

/**
 * Last minute.
 */
dwv.test.onDOMContentLoadedViewer = function () {
  // setup
  dwv.test.viewerSetup();

  var resetButton = document.getElementById('reset');
  resetButton.addEventListener('click', function () {
    _app.resetLayout();
  });

  // bind app to input files
  var fileinput = document.getElementById('fileinput');
  fileinput.addEventListener('change', function (event) {
    console.log('%c ----------------', 'color: teal;');
    console.log(event.target.files);
    _app.loadFiles(event.target.files);
  });
};
