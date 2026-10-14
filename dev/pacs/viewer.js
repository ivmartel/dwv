import {logger} from '../../src/utils/logger.js';
import {custom} from '../../src/app/custom.js';
import {
  AppOptions,
  App
} from '../../src/app/application.js';
import {WindowLevel} from '../../src/image/windowLevel.js';
import {getAsSimpleTagValues} from '../../src/dicom/simpleTagValues.js';
import {getSRContent} from '../../src/dicom/dicomSRContent.js';
import {getURLsFromKeyValueUri} from '../../src/utils/uri.js';

import {ViewerUI} from './viewer.ui.js';
import {setupRenderTests} from './viewer.rendertest.js';
import {overlayConfig} from './overlays.js';

// global vars

/**
 * Setup simple dwv app.
 *
 * @returns {App} The created app.
 */
function viewerSetup() {
  // logger level (optional)
  logger.level = logger.levels.DEBUG;

  // example wl preset override
  custom.wlPresets = {
    PT: {
      'suv5-10': new WindowLevel(5, 10),
      'suv6-8': new WindowLevel(6, 8)
    }
  };

  // // example labelText override
  // custom.labelTexts = {
  //   rectangle: {
  //     '*': '{surface}!',
  //     MR: '{surface}!!'
  //   }
  // };

  // // example private logic for roi dialog
  // custom.openRoiDialog = function (meta, cb) {
  //   console.log('roi dialog', meta);
  //   const textExpr = prompt('[Custom dialog] Label', meta.textExpr);
  //   if (textExpr !== null) {
  //     meta.textExpr = textExpr;
  //     cb(meta);
  //   }
  // };

  // // example private logic for volume id value retrieval:
  // // tried first, before the default candidates
  // // (import {defaultVolumeIdCandidates}
  // //   from '../../src/dicom/dicomVolume.js')
  // custom.volumeIdCandidates = [
  //   {
  //     name: 'ABCD0123',
  //     getter: function (elements) {
  //       let value;
  //       const element = elements['ABCD0123'];
  //       if (typeof element !== 'undefined') {
  //         value = parseInt(element.value[0], 10);
  //       }
  //       return value;
  //     },
  //     preLoad: true
  //   },
  //   ...defaultVolumeIdCandidates
  // ];

  // // example private logic for pixel unit value retrieval
  // custom.getTagPixelUnit = function (/*elements*/) {
  //   return 'MyPixelUnit';
  // };

  // stage options
  const viewOnFirstLoadItem = true;

  // tools
  const tools = {
    Scroll: {},
    WindowLevel: {},
    ZoomAndPan: {},
    Opacity: {},
    Draw: {options: [
      'Arrow',
      'Ruler',
      'Circle',
      'Ellipse',
      'Rectangle',
      'Protractor',
      'Roi',
      'Bidimensional'
    ]},
    Brush: {},
    Floodfill: {},
    Livewire: {},
    Filter: {options: [
      'Sharpen'
    ]}
  };

  // app config
  const options = new AppOptions();
  options.tools = tools;
  options.viewOnFirstLoadItem = viewOnFirstLoadItem;
  options.overlayConfig = overlayConfig;
  // app
  const app = new App();
  app.init(options);

  // abort shortcut handler
  const abortShortcut = function (event) {
    if (event.key === 'a') {
      app.abortAllLoads();
    }
  };

  // bind events
  app.addEventListener('error', function (event) {
    console.error('load error', event, event.detail.error);
    const message = event.detail.error.message;
    const isRenderError = typeof message !== 'undefined' &&
      message.startsWith('Render error');
    // abort load
    if (!isRenderError) {
      app.abortLoad(event.detail.dataid);
    }
  });
  app.addEventListener('loadstart', function (event) {
    console.log('%c----------------', 'color: teal;');
    console.log(`load source data:${event.detail.dataid}`, event.detail.source);
    // timer
    console.time(`load-data-${event.detail.dataid}`);
    // add abort shortcut
    window.addEventListener('keydown', abortShortcut);
  });
  app.addEventListener('loaditem', function (event) {
    if (typeof event.detail.warn !== 'undefined') {
      console.warn('load-warn', event.detail.warn);
    }
  });
  app.addEventListener('loadend', function (event) {
    console.timeEnd(`load-data-${event.detail.dataid}`);
    // remove abort shortcut
    window.removeEventListener('keydown', abortShortcut);
  });
  app.addEventListener('load', function (event) {
    // log meta data
    logMetaData(app, event.detail.dataid);
    // render if not done yet
    if (!viewOnFirstLoadItem) {
      app.getStageController().render(event.detail.dataid);
    }
  });

  app.addEventListener('filterrun', function (event) {
    console.log('filterrun', event);
  });
  app.addEventListener('filterundo', function (event) {
    console.log('filterundo', event);
  });
  // labels
  app.addEventListener('labelingstart', function (event) {
    console.time(`label-data-${event.detail.dataid}`);
  });
  app.addEventListener('labelschanged', function (event) {
    console.timeEnd(`label-data-${event.detail.dataid}`);
  });
  // resampling
  app.addEventListener('imageresamplingstart', function (event) {
    console.time(`resample-data-${event.detail.dataid}`);
  });
  app.addEventListener('imageresamplingcomplete', function (event) {
    console.timeEnd(`resample-data-${event.detail.dataid}`);
  });

  app.addEventListener('warn', function (event) {
    console.log('warn', event);
  });

  // default keyboard shortcuts
  window.addEventListener('keydown', function (event) {
    app.defaultOnKeydown(event);
  });
  // default on resize
  window.addEventListener('resize', function () {
    app.onResize();
  });

  // viewer UI (after app listeners: relies on rendered data at load)
  const viewerUI = new ViewerUI(app, tools);
  viewerUI.setup();
  viewerUI.registerListeners();

  const uriOptions = {};
  // uriOptions.batchSize = 100;
  // special dicom web cookie
  if (document.cookie) {
    const cookies = document.cookie.split('; ');
    // accept
    const acceptItem = cookies.find((item) => item.startsWith('accept='));
    if (typeof acceptItem !== 'undefined') {
      // accept is encoded in dcmweb.js (allows for ';')
      const accept = decodeURIComponent(acceptItem.split('=')[1]);
      if (typeof accept !== 'undefined' && accept.length !== 0) {
        uriOptions.requestHeaders = [];
        uriOptions.requestHeaders.push({
          name: 'Accept',
          value: accept
        });
      }
      // clean up
      document.cookie = 'accept=';
    }
    // token
    const tokenItem = cookies.find((item) => item.startsWith('access_token='));
    if (typeof tokenItem !== 'undefined') {
      const token = tokenItem.split('=')[1];
      if (typeof token !== 'undefined' && token.length !== 0) {
        if (typeof uriOptions.requestHeaders === 'undefined') {
          uriOptions.requestHeaders = [];
        }
        uriOptions.requestHeaders.push({
          name: 'Authorization',
          value: `Bearer ${token}`
        });
      }
      // clean up
      document.cookie = 'access_token=';
    }
  }
  // optional load from window location
  const urls = getURLsFromKeyValueUri(window.location.href);
  if (typeof urls !== 'undefined') {
    app.loadURLs(urls, uriOptions);
  }

  return app;
}

/**
 * Log meta data.
 *
 * @param {App} app The associated application.
 * @param {string} dataId The data ID.
 */
function logMetaData(app, dataId) {
  // meta data
  const dataCtrl = app.getDataController();
  const meta = dataCtrl.get(dataId).meta;

  // log tags for data with transfer syntax (dicom)
  if (typeof meta['00020010'] !== 'undefined') {
    console.log(`metadata data:${dataId}`, getAsSimpleTagValues(meta));
  } else {
    console.log(`metadata data:${dataId}`, meta);
  }

  // get modality
  let modality;
  if (typeof meta['00080060'] !== 'undefined') {
    modality = meta['00080060'].value[0];
  }
  // log DICOM SEG
  if (modality === 'SEG') {
    logFramePosPats(meta);
  }
  // log DICOM SR
  if (modality === 'SR') {
    console.log('DICOM SR');
    const srContent = getSRContent(meta);
    console.log(srContent.toString());
  }
}

/**
 * Compare two pos pat keys.
 *
 * @param {string} a The key of the first item.
 * @param {string} b The key of the second item.
 * @returns {number} Negative if a<b, positive if a>b.
 */
function comparePosPat(a, b) {
  const za = a.split('\\').at(-1);
  const zb = b.split('\\').at(-1);
  let res = 0;
  if (typeof za !== 'undefined' &&
    typeof zb !== 'undefined') {
    res = parseFloat(za) - parseFloat(zb);
  }
  return res;
}

/**
 * Sort an object with pos pat string keys.
 *
 * @param {object} obj The object to sort.
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

// ---------------------------------------------

/**
 * Main setup.
 */
function setup() {
  // viewer setup: creates app and UI
  const app = viewerSetup();
  // render tests
  setupRenderTests(app);
}

// launch
setup();
