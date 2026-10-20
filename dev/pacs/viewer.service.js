import {
  AppOptions,
  App
} from '../../src/app/application.js';
import {getAsSimpleTagValues} from '../../src/dicom/simpleTagValues.js';
import {getSRContent} from '../../src/dicom/dicomSRContent.js';
import {custom} from '../../src/app/custom.js';
import {logger} from '../../src/utils/logger.js';
import {WindowLevel} from '../../src/image/windowLevel.js';

import {overlayConfig} from './overlays.js';

/**
 * @import {DataController} from '../../src/app/dataController.js';
 * @import {StageController} from '../../src/app/stageController.js';
 * @import {UndoController} from '../../src/app/undoController.js';
 * @import {ToolboxController} from '../../src/app/toolboxController.js';
 * @import {DicomData} from '../../src/app/dataController.js';
 * @import {Matrix33} from '../../src/math/matrix.js';
 */

// load event types used by the UI: re-dispatched by the service
// after its own handling (other load events are directly the app ones)
const loadEventTypes = [
  'loadstart',
  'loadprogress',
  'loadend',
  'load'
];

// view on first load item flag
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

/**
 * Setup the dwv custom overrides.
 */
function setupCustom() {
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
}

/**
 * Viewer service: facade to the dwv App, the viewer UI
 * should not access the App directly.
 * Load events are re-dispatched by the service after its own handling,
 * other events are directly the App ones.
 */
export class ViewerService extends EventTarget {

  /**
   * The associated application.
   *
   * @type {App}
   */
  #app;

  /**
   * Number of data to load.
   *
   * @type {number}
   */
  #numberOfDataToLoad = 0;

  /**
   * Number of data that finished loading.
   *
   * @type {number}
   */
  #numberOfLoadendData = 0;

  /**
   * Load progress per data id.
   *
   * @type {number[]}
   */
  #dataLoadProgress = [];

  /**
   * Overall load progress, in percent.
   *
   * @type {number}
   */
  #loadProgress = 0;

  /**
   * Create the app with the viewer configuration.
   */
  constructor() {
    super();
    // logger level (optional)
    logger.level = logger.levels.DEBUG;

    // custom overrides
    setupCustom();

    // app config
    const appOptions = new AppOptions();
    appOptions.tools = tools;
    appOptions.viewOnFirstLoadItem = viewOnFirstLoadItem;
    appOptions.overlayConfig = overlayConfig;
    // app
    this.#app = new App();
    this.#app.init(appOptions);
  }

  /**
   * Get the tools configuration.
   *
   * @returns {object} The tools configuration.
   */
  getTools() {
    return tools;
  }

  /**
   * Register the default app listeners: logging, load abort,
   * keyboard shortcuts and window resize.
   */
  registerListeners() {
    this.#registerLoadListeners();
    this.#registerOtherListeners();
  }

  /**
   * Get the overall load progress, averaged over the data
   * of the current load batch.
   *
   * @returns {number} The progress, in percent.
   */
  getLoadProgress() {
    return this.#loadProgress;
  }

  /**
   * Re-dispatch an app event as a service event.
   *
   * @param {CustomEvent} event The app event.
   */
  #redispatch = (event) => {
    this.dispatchEvent(new CustomEvent(event.type, {detail: event.detail}));
  };

  /**
   * Get the layer group div id.
   *
   * @returns {string} The div id.
   */
  getMainLayerGroupDivId() {
    // TODO: hard coded, find a better way
    return 'layerGroup0';
  }

  /**
   * Register the load listeners: logging, load counters and progress,
   * load abort (on error or via keyboard shortcut) and render
   * if not done at first load item.
   * The UI used load events are re-dispatched after handling.
   */
  #registerLoadListeners() {
    // abort shortcut handler
    const abortShortcut = (event) => {
      if (event.key === 'a') {
        this.#app.abortAllLoads();
      }
    };

    this.#app.addEventListener('error', (event) => {
      console.error('load error', event, event.detail.error);
      const message = event.detail.error.message;
      const isRenderError = typeof message !== 'undefined' &&
        message.startsWith('Render error');
      // abort load
      if (!isRenderError) {
        this.#app.abortLoad(event.detail.dataid);
      }
    });
    this.#app.addEventListener('loadstart', (event) => {
      // log
      console.log('%c----------------', 'color: teal;');
      console.log(
        `load source data:${event.detail.dataid}`, event.detail.source);
      // timer
      console.time(`load-data-${event.detail.dataid}`);
      // update load counters
      if (this.#numberOfDataToLoad === this.#numberOfLoadendData) {
        this.#numberOfDataToLoad = 0;
        this.#numberOfLoadendData = 0;
        // reset progress
        this.#dataLoadProgress.length = 0;
        this.#loadProgress = 0;
      }
      ++this.#numberOfDataToLoad;
      // add abort shortcut
      window.addEventListener('keydown', abortShortcut);
      this.#redispatch(event);
    });
    this.#app.addEventListener('loadprogress', (event) => {
      if (event.detail.total > 0) {
        this.#dataLoadProgress[event.detail.dataid] =
          Math.ceil((event.detail.loaded / event.detail.total) * 100);
        const sumReducer = function (sum, value) {
          return sum + value;
        };
        this.#loadProgress =
          this.#dataLoadProgress.reduce(sumReducer) /
          this.#numberOfDataToLoad;
      }
      this.#redispatch(event);
    });
    this.#app.addEventListener('loaditem', (event) => {
      if (typeof event.detail.warn !== 'undefined') {
        console.warn('load-warn', event.detail.warn);
      }
    });
    this.#app.addEventListener('loadend', (event) => {
      // update load counter
      ++this.#numberOfLoadendData;
      console.timeEnd(`load-data-${event.detail.dataid}`);
      // remove abort shortcut
      window.removeEventListener('keydown', abortShortcut);
      this.#redispatch(event);
    });
    this.#app.addEventListener('load', (event) => {
      // log meta data
      this.#logMetaData(event.detail.dataid);
      // render if not done yet
      if (!viewOnFirstLoadItem) {
        this.#app.getStageController().render(event.detail.dataid);
      }
      this.#redispatch(event);
    });
  }

  /**
   * Register the other listeners: filter, labeling and resampling
   * logging, warnings, keyboard shortcuts and window resize.
   */
  #registerOtherListeners() {
    // filter
    this.#app.addEventListener('filterrun', (event) => {
      console.log('filterrun', event);
    });
    this.#app.addEventListener('filterundo', (event) => {
      console.log('filterundo', event);
    });
    // labels
    this.#app.addEventListener('labelingstart', (event) => {
      console.time(`label-data-${event.detail.dataid}`);
    });
    this.#app.addEventListener('labelschanged', (event) => {
      console.timeEnd(`label-data-${event.detail.dataid}`);
    });
    // resampling
    this.#app.addEventListener('imageresamplingstart', (event) => {
      console.time(`resample-data-${event.detail.dataid}`);
    });
    this.#app.addEventListener('imageresamplingcomplete', (event) => {
      console.timeEnd(`resample-data-${event.detail.dataid}`);
    });

    this.#app.addEventListener('warn', (event) => {
      console.log('warn', event);
    });

    // default keyboard shortcuts
    window.addEventListener('keydown', (event) => {
      this.#app.defaultOnKeydown(event);
    });
    // default on resize
    window.addEventListener('resize', () => {
      this.#app.onResize();
    });
  }

  // events

  /**
   * Add an event listener: load events are listened to on the service,
   * other events directly on the app.
   *
   * @param {string} type The event type.
   * @param {Function} callback The event callback.
   */
  addEventListener(type, callback) {
    if (loadEventTypes.includes(type)) {
      super.addEventListener(type, callback);
    } else {
      this.#app.addEventListener(type, callback);
    }
  }

  /**
   * Remove an event listener.
   *
   * @param {string} type The event type.
   * @param {Function} callback The event callback.
   */
  removeEventListener(type, callback) {
    if (loadEventTypes.includes(type)) {
      super.removeEventListener(type, callback);
    } else {
      this.#app.removeEventListener(type, callback);
    }
  }

  // controllers

  /**
   * Get the data controller.
   *
   * @returns {DataController} The controller.
   */
  getDataController() {
    return this.#app.getDataController();
  }

  /**
   * Get the stage controller.
   *
   * @returns {StageController} The controller.
   */
  getStageController() {
    return this.#app.getStageController();
  }

  /**
   * Get the undo controller.
   *
   * @returns {UndoController} The controller.
   */
  getUndoController() {
    return this.#app.getUndoController();
  }

  /**
   * Get the toolbox controller.
   *
   * @returns {ToolboxController} The controller.
   */
  getToolboxController() {
    return this.#app.getToolboxController();
  }

  // load

  /**
   * Load a list of files.
   *
   * @param {File[]} files The list of files to load.
   * @returns {string} The data ID, '-1' if problem.
   */
  loadFiles(files) {
    return this.#app.loadFiles(files);
  }

  /**
   * Load a list of URLs.
   *
   * @param {string[]} urls The list of urls to load.
   * @param {object} [options] The load options.
   * @returns {string} The data ID, '-1' if problem.
   */
  loadURLs(urls, options) {
    return this.#app.loadURLs(urls, options);
  }

  // tools

  /**
   * Set the tool.
   *
   * @param {string} tool The tool name.
   */
  setTool(tool) {
    this.#app.setTool(tool);
  }

  /**
   * Set the tool live features.
   *
   * @param {object} list The list of features.
   */
  setToolFeatures(list) {
    this.#app.setToolFeatures(list);
  }

  // stage

  /**
   * Set the layer groups binders.
   *
   * @param {string[]} list The list of binder names.
   */
  setLayerGroupsBinders(list) {
    this.#app.setLayerGroupsBinders(list);
  }

  // resample

  /**
   * Resample an image to an arbitrary orientation.
   *
   * @param {string} dataIdTarget The target image id to resample.
   * @param {Matrix33} orientation The orientation to resample to.
   */
  resample(dataIdTarget, orientation) {
    this.#app.resample(dataIdTarget, orientation);
  }

  /**
   * Resample one image to match the orientation of another.
   *
   * @param {string} dataIdTarget The target image id to resample.
   * @param {string} dataIdSource The source image id to copy the
   *   orientation from.
   */
  resampleMatch(dataIdTarget, dataIdSource) {
    this.#app.resampleMatch(dataIdTarget, dataIdSource);
  }

  /**
   * Revert an image resampling.
   *
   * @param {string} dataIdTarget The target image id.
   */
  revertResample(dataIdTarget) {
    this.#app.revertResample(dataIdTarget);
  }

  // annotation

  /**
   * Create new annotation data.
   *
   * @param {string} refDataId The reference data id.
   * @returns {DicomData} The new data.
   */
  createAnnotationData(refDataId) {
    return this.#app.createAnnotationData(refDataId);
  }

  /**
   * Add and render annotation data.
   *
   * @param {DicomData} data The data to add.
   * @param {string} divId The div where to draw.
   * @param {string} refDataId The reference data id.
   */
  addAndRenderAnnotationData(data, divId, refDataId) {
    this.#app.addAndRenderAnnotationData(data, divId, refDataId);
  }

  // logging

  /**
   * Log meta data.
   *
   * @param {string} dataId The data ID.
   */
  #logMetaData(dataId) {
    const meta = this.#app.getDataController().get(dataId).meta;

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

} // class ViewerService

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
