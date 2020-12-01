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

/**
 * Setup simple dwv app.
 */
dwv.test.viewerSetup = function () {
  // config
  var config = {
    'containerDivId': 'dwv',
    'tools': {
      'Scroll': {}
    }
  };
  // app
  var app = new dwv.App();
  app.init(config);
  // select tool
  app.setTool('Scroll');
  // load from location
  dwv.utils.loadFromUri(window.location.href, app);
};
