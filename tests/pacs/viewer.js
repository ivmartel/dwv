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
  // single data, multiple layer group
  var dataViewConfigs = {
    0: [
      {
        divId: 'layerGroup',
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
  // multiple data, multiple layer group
  // -> set nSimultaneousData to 2 in app config
  // var containerDivIds = {
  //   0: [{divId: 'layerGroup'}],
  //   1: [{divId: 'layerGroup'}]
  // };
  var binders = [
    new dwv.gui.PositionBinder(),
    new dwv.gui.ZoomBinder(),
    new dwv.gui.OffsetBinder(),
    //new dwv.gui.OpacityBinder()
  ];

  // app config
  var viewOnFirstLoadItem = false;
  var config = {
    viewOnFirstLoadItem: viewOnFirstLoadItem,
    //nSimultaneousData: 2,
    dataViewConfigs: dataViewConfigs,
    binders: binders,
    tools: {
      Scroll: {},
      WindowLevel: {},
      ZoomAndPan: {}
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
  _app.addEventListener('renderstart', function () {
    console.time('render-data');
  });
  _app.addEventListener('renderend', function () {
    console.timeEnd('render-data');
    if (isFirstRender) {
      isFirstRender = false;
      // select tool
      _app.setTool('Scroll');
    }
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

  // bind app to input files
  const fileinput = document.getElementById('fileinput');
  fileinput.addEventListener('change', function (event) {
    console.log('%c ----------------', 'color: teal;');
    console.log(event.target.files);
    _app.loadFiles(event.target.files);
  });

  // zoom range
  var zoomrange = document.getElementById('zoomrange');
  var zoomnumber = document.getElementById('zoomnumber');
  zoomrange.oninput = function () {
    var scale = {x: this.value, y: this.value};
    _app.getActiveLayerGroup().setScale(scale);
    _app.getActiveLayerGroup().draw();
    zoomnumber.value = this.value;
  };
  zoomnumber.oninput = function () {
    var scale = {x: this.value, y: this.value};
    _app.getActiveLayerGroup().setScale(scale);
    _app.getActiveLayerGroup().draw();
    zoomnumber.value = this.value;
  };

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
