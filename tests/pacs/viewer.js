var dwv = dwv || {};
dwv.test = dwv.test || {};

// Image decoders (for web workers)
dwv.image.decoderScripts = {
  'jpeg2000': '../../decoders/pdfjs/decode-jpeg2000.js',
  'jpeg-lossless': '../../decoders/rii-mango/decode-jpegloss.js',
  'jpeg-baseline': '../../decoders/pdfjs/decode-jpegbaseline.js',
  'rle': '../../decoders/dwv/decode-rle.js'
};
// get element
dwv.gui.getElement = dwv.gui.base.getElement;

var _app = null;

/**
 * Setup simple dwv app.
 */
dwv.test.viewerSetup = function () {
  // config
  var config = {
    'containerDivId': 'dwv',
    'tools': {
      'Scroll': {},
      'WindowLevel': {}
    }
  };
  // app
  _app = new dwv.App();
  _app.init(config);

  // bind events
  _app.addEventListener('error', function (event) {
    console.error('load error', event);
  });
  _app.addEventListener('load-end', function () {
    console.log(_app.getMetaData());
  });
  _app.addEventListener('keydown', function (event) {
    _app.defaultOnKeydown(event);
    if (event.keyCode === 83) { // s
      console.log('%c tool: scroll', 'color: teal;');
      _app.setTool('Scroll');
    } else if (event.keyCode === 87) { // w
      console.log('%c tool: windowlevel', 'color: teal;');
      _app.setTool('WindowLevel');
    }
  });

  // select tool
  _app.setTool('Scroll');
  // load from location
  dwv.utils.loadFromUri(window.location.href, _app);
};

/**
 * Last minute.
 */
dwv.test.onDOMContentLoadedViewer = function () {
  // bind app to input files
  const fileinput = document.getElementById('fileinput');
  fileinput.addEventListener('change', function (event) {
    console.log('%c ----------------', 'color: teal;');
    console.log(event.target.files);
    _app.loadFiles(event.target.files);
  });
};
