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

  // stage options
  var dataViewConfigs;
  var nSimultaneousData = 1;
  var viewOnFirstLoadItem = true;

  var mode = 0; // simplest, multi, mpr
  if (mode === 0) {
    // simplest
    dataViewConfigs = {0: [{divId: 'layerGroup0'}]};
  } else if (mode === 1) {
    // multiple data, multiple layer group
    nSimultaneousData = 2;
    addLayer('layerGroup1');
    dataViewConfigs = {
      0: [{divId: 'layerGroup0'}],
      1: [{divId: 'layerGroup1'}]
    };
  } else if (mode === 2) {
    // single data, multiple layer groups -> MPR
    viewOnFirstLoadItem = false;
    addLayer('layerGroup1');
    addLayer('layerGroup2');
    dataViewConfigs = {
      0: [
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
  _app.addEventListener('load', function () {
    if (!viewOnFirstLoadItem) {
      _app.render();
    }
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

  // alpha range
  var alpharange = document.getElementById('alpharange');
  var alphanumber = document.getElementById('alphanumber');
  alpharange.oninput = function () {
    _app.setOpacity(this.value);
    alphanumber.value = this.value;
  };
  alphanumber.oninput = function () {
    _app.setOpacity(this.value);
    alpharange.value = this.value;
  };

};
