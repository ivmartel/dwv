import {logger} from '../../src/utils/logger.js';
import {precisionRound} from '../../src/utils/string.js';
import {custom} from '../../src/app/custom.js';
import {
  AppOptions,
  App
} from '../../src/app/application.js';
import {WindowLevel} from '../../src/image/windowLevel.js';
import {getAsSimpleElements} from '../../src/dicom/dicomTag.js';
import {getSRContent} from '../../src/dicom/dicomSRContent.js';
import {getDwvVersion} from '../../src/dicom/dicomParser.js';
import {Point} from '../../src/math/point.js';

import {
  getViewConfig,
  getLayerGroupDivIds
} from './viewer.ui.js';
import {DataTableUI} from './viewer.ui.datatable.js';
import {setupRenderTests} from './viewer.rendertest.js';
import {AnnotationUI} from './viewer.ui.annot.js';
import {SegmentationUI} from './viewer.ui.segment.js';
import {DrawToolUI} from './viewer.ui.draw.js';
import {BrushToolUI} from './viewer.ui.brush.js';

// global vars

/**
 * @type {App}
 */
let _app;

let _tools;
const _toolFeaturesUI = {};
let _layout = 'one';

/**
 * Setup simple dwv app.
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

  // // example private logic for time value retrieval
  // custom.getTagTime = function (elements) {
  //   let value;
  //   const element = elements['ABCD0123'];
  //   if (typeof element !== 'undefined') {
  //     value = parseInt(element.value[0], 10);
  //   }
  //   return value;
  // };

  // // example private logic for pixel unit value retrieval
  // custom.getTagPixelUnit = function (/*elements*/) {
  //   return 'MyPixelUnit';
  // };

  // stage options
  let viewOnFirstLoadItem = true;

  // load counters
  let numberOfDataToLoad = 0;
  let numberOfLoadendData = 0;
  const dataLoadProgress = [];

  // add layer groups div
  const numberOfLayerGroups = getNumberOfLayerGroups();
  addLayerGroupsDiv(numberOfLayerGroups);

  // special MPR
  if (_layout === 'mpr') {
    viewOnFirstLoadItem = false;
  }

  // tools
  _tools = {
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
      'Roi'
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
  options.tools = _tools;
  options.viewOnFirstLoadItem = viewOnFirstLoadItem;
  // app
  _app = new App();
  _app.init(options);

  // abort shortcut handler
  const abortShortcut = function (event) {
    if (event.key === 'a') {
      _app.abortAllLoads();
    }
  };

  // bind events
  _app.addEventListener('error', function (event) {
    console.error('load error', event, event.error);
    // abort load
    _app.abortLoad(event.dataid);
  });
  _app.addEventListener('loadstart', function (event) {
    console.time('load-data-' + event.dataid);
    // update load counters
    if (numberOfDataToLoad === numberOfLoadendData) {
      numberOfDataToLoad = 0;
      numberOfLoadendData = 0;
      // reset progress array
      dataLoadProgress.length = 0;
    }
    ++numberOfDataToLoad;
    // add abort shortcut
    window.addEventListener('keydown', abortShortcut);
    // remove post-load listeners
    if (_app.getDataIds().length !== 0) {
      removePostLoadListeners();
    }
    // add new data view config
    addDataViewConfig(event.dataid);
  });
  const sumReducer = function (sum, value) {
    return sum + value;
  };
  _app.addEventListener('loadprogress', function (event) {
    if (typeof event.lengthComputable !== 'undefined' &&
      event.lengthComputable) {
      dataLoadProgress[event.dataid] =
        Math.ceil((event.loaded / event.total) * 100);
      const progressElement = document.getElementById('loadprogress');
      progressElement.value =
        dataLoadProgress.reduce(sumReducer) / numberOfDataToLoad;
    }
  });
  _app.addEventListener('loaditem', function (event) {
    if (typeof event.warn !== 'undefined') {
      console.warn('load-warn', event.warn);
    }
  });
  _app.addEventListener('loadend', function (event) {
    console.timeEnd('load-data-' + event.dataid);
    // update load counter
    ++numberOfLoadendData;
    // remove abort shortcut
    window.removeEventListener('keydown', abortShortcut);
  });
  _app.addEventListener('load', function (event) {
    // render if not done yet
    if (!viewOnFirstLoadItem) {
      _app.render(event.dataid);
    }
    // update sliders with new data info
    // (has to be after full load)
    initSliders();
    // add post-load listeners
    addPostLoadListeners();
    // log meta data
    logMetaData(event.dataid, event.loadtype);
  });

  // update UI at first render of first data
  const onRenderEnd = function (/*event*/) {
    if (_app.getDataIds().length === 1) {
      // set app tool
      setAppTool();
      // update html
      const toolsFieldset = document.getElementById('tools');
      toolsFieldset.disabled = false;
      const changeLayoutSelect = document.getElementById('changelayout');
      changeLayoutSelect.disabled = false;
      const resetLayoutButton = document.getElementById('resetlayout');
      resetLayoutButton.disabled = false;
      const smoothingChk = document.getElementById('changesmoothing');
      smoothingChk.disabled = false;
      // remove handler
      _app.removeEventListener('renderend', onRenderEnd);
    }
  };
  // add handler (will be removed at first success)
  _app.addEventListener('renderend', onRenderEnd);

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
    if (span) {
      span.innerHTML = text;
    }
    // update sliders' value
    updateSliders();
  });

  _app.addEventListener('filterrun', function (event) {
    console.log('filterrun', event);
  });
  _app.addEventListener('filterundo', function (event) {
    console.log('filterundo', event);
  });

  _app.addEventListener('warn', function (event) {
    console.log('warn', event);
  });

  // default keyboard shortcuts
  window.addEventListener('keydown', function (event) {
    _app.defaultOnKeydown(event);
    // use ctrl to avoid html input events
    if (event.ctrlKey) {
      // mask segment related: has to be number
      if (!isNaN(parseInt(event.key, 10))) {
        const lg = _app.getActiveLayerGroup();
        const vl = lg.getActiveViewLayer();
        if (typeof vl === 'undefined') {
          return;
        }
        const vc = vl.getViewController();
        if (!vc.isMask()) {
          return;
        }
        const number = parseInt(event.key, 10);
        const segHelper = vc.getMaskSegmentHelper();
        if (segHelper.hasSegment(number)) {
          const segment = segHelper.getSegment(number);
          if (event.altKey) {
            // CTRL + ALT + number
            console.log('Delete segment: ' + segment.label);
            // delete
            vc.deleteSegment(number, _app.addToUndoStack);
          } else {
            // CTRL + number
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
    // filter
    if (getSelectedToolName() === 'Filter' &&
      event.altKey && event.key === 'r') {
      // run the sharpen filter
      _app.setToolFeatures({
        filterName: 'Sharpen',
        runArgs: {
          dataId: _app.getDataIds()[0]
        },
        run: true
      });
    }
  });
  // default on resize
  window.addEventListener('resize', function () {
    _app.onResize();
  });

  // tool features UI
  const toolsUI = {
    Draw: DrawToolUI,
    Brush: BrushToolUI
  };

  for (const toolName in _tools) {
    if (typeof toolsUI[toolName] !== 'undefined') {
      const toolUI = new toolsUI[toolName](_app, _tools[toolName]);
      _toolFeaturesUI[toolName] = toolUI;
    }
  }

  // data model UI
  const dataModelUI = {
    annotation: AnnotationUI,
    segmentation: SegmentationUI
  };

  for (const dmName in dataModelUI) {
    const dmUI = new dataModelUI[dmName](_app);
    dmUI.registerListeners();
  }

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
          value: 'Bearer ' + token
        });
      }
      // clean up
      document.cookie = 'access_token=';
    }
  }
  // load from window location
  _app.loadFromUri(window.location.href, uriOptions);
}

/**
 * Log meta data.
 *
 * @param {string} dataId The data ID.
 * @param {string} loadType The load type.
 */
function logMetaData(dataId, loadType) {
  // meta data
  const meta = _app.getMetaData(dataId);

  // log tags for data with transfer syntax (dicom)
  if (typeof meta['00020010'] !== 'undefined') {
    console.log('metadata', getAsSimpleElements(meta));
  } else {
    console.log('metadata', meta);
  }

  // get modality
  let modality;
  if (loadType === 'image' &&
    typeof meta['00080060'] !== 'undefined') {
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
 * Init individual slider on layer related event.
 * WARNING: needs to be called with the final geometry.
 *
 * @param {object} event The layer event.
 */
function initSliderOnEvent(event) {
  initSlider(event.layergroupid);
}

/**
 * Add post-load event listeners.
 */
function addPostLoadListeners() {
  // post-load since sliders need the full geometry
  _app.addEventListener('viewlayeradd', initSliderOnEvent);
  _app.addEventListener('drawlayeradd', initSliderOnEvent);
  _app.addEventListener('layerremove', initSliderOnEvent);
}

/**
 * Remove post-load event listeners.
 */
function removePostLoadListeners() {
  _app.removeEventListener('viewlayeradd', initSliderOnEvent);
  _app.removeEventListener('drawlayeradd', initSliderOnEvent);
  _app.removeEventListener('layerremove', initSliderOnEvent);
}

/**
 * Get the number of layer groups according to layout.
 *
 * @returns {nunmber} The number.
 */
function getNumberOfLayerGroups() {
  let number;
  if (_layout === 'one') {
    number = 1;
  } else if (_layout === 'side') {
    number = 2;
  } else if (_layout === 'mpr') {
    number = 3;
  }
  return number;
}

/**
 * Setup.
 */
function setup() {
  // setup
  viewerSetup();

  const dataTable = new DataTableUI(_app);
  dataTable.registerListeners(_layout);

  const positionInput = document.getElementById('position');
  positionInput.addEventListener('change', function (event) {
    const vls = _app.getViewLayersByDataId('0');
    const vc = vls[0].getViewController();
    const element = event.target;
    const values = element.value.split(',');
    vc.setCurrentPosition(new Point([
      parseFloat(values[0]), parseFloat(values[1]), parseFloat(values[2])
    ])
    );
  });

  const resetLayoutButton = document.getElementById('resetlayout');
  resetLayoutButton.disabled = true;
  resetLayoutButton.addEventListener('click', function () {
    _app.resetLayout();
  });

  const changeLayoutSelect = document.getElementById('changelayout');
  changeLayoutSelect.disabled = true;
  changeLayoutSelect.addEventListener('change', function (event) {
    const selectElement = event.target;
    const layout = selectElement.value;
    if (layout !== 'one' &&
      layout !== 'side' &&
      layout !== 'mpr') {
      throw new Error('Unknown layout: ' + layout);
    }
    _layout = layout;

    // add layer groups div
    const numberOfLayerGroups = getNumberOfLayerGroups();
    addLayerGroupsDiv(numberOfLayerGroups);

    // get configs
    let configs;
    const dataIds = _app.getDataIds();
    if (layout === 'one') {
      configs = getOnebyOneDataViewConfig(dataIds);
    } else if (layout === 'side') {
      configs = getOnebyTwoDataViewConfig(dataIds);
    } else if (layout === 'mpr') {
      configs = getMPRDataViewConfig(dataIds);
    }
    if (typeof configs === 'undefined') {
      return;
    }

    // clear data table
    dataTable.clearDataTable();

    // set config (deletes previous layers)
    _app.setDataViewConfigs(configs);

    // render data (creates layers)
    for (let i = 0; i < dataIds.length; ++i) {
      _app.render(dataIds[i]);
    }

    // show crosshair depending on layout
    if (layout !== 'one') {
      const divIds = getLayerGroupDivIds(configs);
      for (const divId of divIds) {
        _app.getLayerGroupByDivId(divId).setShowCrosshair(true);
      }
    }

    // need to set tool after config change
    setAppTool();
  });

  const smoothingChk = document.getElementById('changesmoothing');
  smoothingChk.checked = false;
  smoothingChk.disabled = true;
  smoothingChk.addEventListener('change', function (event) {
    const inputElement = event.target;
    _app.setImageSmoothing(inputElement.checked);
  });

  // setup
  setupBindersCheckboxes();
  setupToolsCheckboxes();
  setupRenderTests(_app);
  setupAbout();

  // bind app to input files
  const fileinput = document.getElementById('fileinput');
  fileinput.addEventListener('change', function (event) {
    console.log('%c ----------------', 'color: teal;');
    const fileElement = event.target;
    console.log(fileElement.files);
    _app.loadFiles(fileElement.files);
  });
}

/**
 * Get the slider for a given layer group.
 *
 * @param {number} layerGroupDivId The div id.
 * @returns {HTMLInputElement} The slider as html range.
 */
function getSlider(layerGroupDivId) {
  const range = document.createElement('input');
  range.type = 'range';
  range.className = 'vertical-slider';
  range.id = layerGroupDivId + '-slider';
  range.min = 0;
  range.max = 0;
  range.disabled = true;
  // update app on slider change
  range.oninput = function () {
    const lg = _app.getLayerGroupByDivId(layerGroupDivId);
    const ph = lg.getPositionHelper();
    const pos = ph.getCurrentPositionAtScrollValue(this.value);
    ph.setCurrentPosition(pos);
  };
  return range;
}

/**
 * Init sliders: show them and set max.
 */
function initSliders() {
  const numberOfLayerGroups = getNumberOfLayerGroups();
  for (let i = 0; i < numberOfLayerGroups; ++i) {
    initSlider('layerGroup' + i);
  }
}

/**
 * Init individual slider.
 * WARNING: needs to be called with the final geometry.
 *
 * @param {string} layerGroupId The id of the layer group.
 */
function initSlider(layerGroupId) {
  const slider = document.getElementById(layerGroupId + '-slider');
  if (slider) {
    // disabled by default
    slider.disabled = true;
    // init if possible
    const lg = _app.getLayerGroupByDivId(layerGroupId);
    if (typeof lg !== 'undefined') {
      const ph = lg.getPositionHelper();
      if (typeof ph !== 'undefined') {
        const max = ph.getMaximumScrollValue();
        if (max !== 0) {
          slider.disabled = false;
          slider.max = max;
          slider.value = ph.getCurrentPositionScrollValue();
        }
      }
    }
  }
}

/**
 * Update sliders: set the slider value to the current scroll index.
 */
function updateSliders() {
  const numberOfLayerGroups = getNumberOfLayerGroups();
  for (let i = 0; i < numberOfLayerGroups; ++i) {
    const lgId = 'layerGroup' + i;
    const slider = document.getElementById(lgId + '-slider');
    if (slider) {
      const lg = _app.getLayerGroupByDivId(lgId);
      if (typeof lg !== 'undefined') {
        const ph = lg.getPositionHelper();
        slider.value = ph.getCurrentPositionScrollValue();
      }
    }
  }
}

/**
 * Append a layer div in the root 'dwv' one.
 *
 * @param {string} id The id of the layer.
 */
function addLayerGroupDiv(id) {
  const layerDiv = document.createElement('div');
  layerDiv.id = id;
  layerDiv.className = 'layerGroup';

  const root = document.getElementById('dwv');
  root.appendChild(layerDiv);
  root.appendChild(getSlider(id));
}

/**
 * Add Layer Groups div.
 */
function addLayerGroupsDiv() {
  // clean up
  const dwvDiv = document.getElementById('dwv');
  if (dwvDiv) {
    dwvDiv.innerHTML = '';
  }
  // add div
  const numberOfLayerGroups = getNumberOfLayerGroups();
  for (let i = 0; i < numberOfLayerGroups; ++i) {
    addLayerGroupDiv('layerGroup' + i);
  }
}

/**
 * Add data view config for the input data.
 *
 * @param {string} dataId The data ID.
 */
function addDataViewConfig(dataId) {
  const dataIds = [dataId];
  let configs;
  if (_layout === 'one') {
    configs = getOnebyOneDataViewConfig(dataIds);
  } else if (_layout === 'side') {
    configs = getOnebyTwoDataViewConfig(dataIds);
  } else if (_layout === 'mpr') {
    configs = getMPRDataViewConfig(dataIds);
  }
  const viewConfigs = configs[dataId];
  for (let i = 0; i < viewConfigs.length; ++i) {
    _app.addDataViewConfig(dataId, viewConfigs[i]);
  }
}

/**
 * Merge a data config into the first input one.
 * Copies all but the divId and orientation property.
 *
 * @param {object} config The config where to merge.
 * @param {object} configToMerge The config to merge.
 * @returns {object} The updated config.
 */
function mergeConfigs(config, configToMerge) {
  for (const key in configToMerge) {
    if (key !== 'divId' &&
      key !== 'orientation') {
      config[key] = configToMerge[key];
    }
  }
  return config;
}

/**
 * Get the first view config for a data id.
 *
 * @param {string} dataId The data id.
 * @returns {object} The view config.
 */
function getAppViewConfig(dataId) {
  let res;
  const appConfigs = _app.getViewConfigs(dataId);
  if (appConfigs.length !== 0) {
    res = appConfigs[0];
  }
  return res;
}

/**
 * Get the orientation of the first view config for a div id.
 *
 * @param {string} divId The div id.
 * @returns {object} The orientation.
 */
function getAppViewConfigOrientation(divId) {
  let orientation;
  const appDataViewConfigs = _app.getDataViewConfigs();
  let appDivIdConfig;
  for (const key in appDataViewConfigs) {
    const dataViewConfigs = appDataViewConfigs[key];
    appDivIdConfig = dataViewConfigs.find(function (item) {
      return item.divId === divId;
    });
    if (typeof appDivIdConfig !== 'undefined') {
      orientation = appDivIdConfig.orientation;
      break;
    }
  }
  return orientation;
}

/**
 * Create 1*1 view config(s).
 *
 * @param {Array} dataIds The list of dataIds.
 * @returns {object} The view config.
 */
function getOnebyOneDataViewConfig(dataIds) {
  const orientation = getAppViewConfigOrientation('layerGroup0');
  const configs = {};
  for (const dataId of dataIds) {
    const newConfig = getViewConfig('one', 'layerGroup0');
    // merge possibly existing app config with the new one to
    // keed window level for example
    const appConfig = getAppViewConfig(dataId);
    if (typeof appConfig !== 'undefined') {
      mergeConfigs(newConfig, appConfig);
    }
    // if available use first orientation for all
    if (typeof orientation !== 'undefined') {
      newConfig.orientation = orientation;
    }
    // store
    configs[dataId] = [newConfig];
  }
  return configs;
}

/**
 * Create 1*2 view config(s).
 *
 * @param {Array} dataIds The list of dataIds.
 * @returns {object} The view config.
 */
function getOnebyTwoDataViewConfig(dataIds) {
  const configs = {};
  for (let i = 0; i < dataIds.length; ++i) {
    const dataId = dataIds[i];
    let newConfig;
    if (i % 2 === 0) {
      newConfig = getViewConfig('side', 'layerGroup0');
    } else {
      newConfig = getViewConfig('side', 'layerGroup1');
    }
    // merge possibly existing app config with the new one to
    // keed window level for example
    const appConfig = getAppViewConfig(dataId);
    if (typeof appConfig !== 'undefined') {
      mergeConfigs(newConfig, appConfig);
    }
    // store
    configs[dataIds[i]] = [newConfig];
  }
  return configs;
}

/**
 * Get MPR view config(s).
 *
 * @param {Array} dataIds The list of dataIds.
 * @returns {object} The view config.
 */
function getMPRDataViewConfig(dataIds) {
  const configs = {};
  for (const dataId of dataIds) {
    const newConfig0 = getViewConfig('mpr', 'layerGroup0');
    const newConfig1 = getViewConfig('mpr', 'layerGroup1');
    const newConfig2 = getViewConfig('mpr', 'layerGroup2');
    // merge possibly existing app config with the new one to
    // keed window level for example
    const appConfig = getAppViewConfig(dataId);
    if (typeof appConfig !== 'undefined') {
      mergeConfigs(newConfig0, appConfig);
      mergeConfigs(newConfig1, appConfig);
      mergeConfigs(newConfig2, appConfig);
    }
    // store
    configs[dataId] = [newConfig0, newConfig1, newConfig2];
  }
  return configs;
}

/**
 * Setup the binders checkboxes.
 */
function setupBindersCheckboxes() {
  const propList = [
    'WindowLevel',
    'Position',
    'Zoom',
    'Offset',
    'Opacity',
    'ColourMap'
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
      const inputElement = event.target;
      if (inputElement.checked) {
        addBinder(propName);
      } else {
        removeBinder(propName);
      }
    };
  }

  const fieldset = document.getElementById('binders');

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

    fieldset.appendChild(input);
    fieldset.appendChild(label);
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
  fieldset.appendChild(allInput);
  fieldset.appendChild(allLabel);
}

/**
 * Setup the tools checkboxes.
 */
function setupToolsCheckboxes() {
  const getChangeTool = function (tool) {
    return function () {
      setAppTool(tool);
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

  const fieldset = document.getElementById('tools');
  const keys = Object.keys(_tools);
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];

    const input = document.createElement('input');
    input.name = 'tools';
    input.type = 'radio';
    input.id = 'tool-' + i;
    input.title = key;
    input.onchange = getChangeTool(key);

    // select first one
    if (i === 0) {
      input.checked = true;
    }

    const label = document.createElement('label');
    label.htmlFor = input.id;
    label.title = input.title;
    label.appendChild(document.createTextNode(input.title));

    fieldset.appendChild(input);
    fieldset.appendChild(label);

    // keyboard shortcut
    const shortcut = key[0].toLowerCase();
    window.addEventListener('keydown', getKeyCheck(shortcut, input));
  }

  // tool options
  const div = document.createElement('div');
  div.id = 'toolOptions';
  fieldset.appendChild(div);
}

/**
 * Set the app tool.
 *
 * @param {string} [toolName] The tool to set.
 */
function setAppTool(toolName) {
  // find the tool name if not provided
  if (typeof toolName === 'undefined') {
    const toolsInput = document.getElementsByName('tools');
    for (let j = 0; j < toolsInput.length; ++j) {
      const toolInput = toolsInput[j];
      if (toolInput.checked) {
        toolName = toolInput.title;
        break;
      }
    }
    if (typeof toolName === 'undefined') {
      console.warn('Cannot find tool to set the app with...');
      return;
    }
  }

  // set tool for app
  _app.setTool(toolName);

  // force window level non strict mode
  if (toolName === 'WindowLevel') {
    _app.setToolFeatures({
      strictViewLayer: false
    });
  }

  // clear options html
  const toolOptionsEl = document.getElementById('toolOptions');
  if (toolOptionsEl !== null) {
    toolOptionsEl.innerHTML = '';
  }
  // tool features
  const featuresUI = _toolFeaturesUI[toolName];
  if (toolOptionsEl !== null &&
    typeof featuresUI !== 'undefined') {
    // setup html
    const featuresHtml = featuresUI.getHtml();
    if (typeof featuresHtml !== 'undefined') {
      toolOptionsEl.appendChild(featuresHtml);
    }
    // pass value to app
    const features = featuresUI.getValue();
    if (typeof features !== 'undefined') {
      _app.setToolFeatures(features);
    }
  }
}

/**
 * Get the selected tool name.
 *
 * @returns {string|undefined} The tool name.
 */
function getSelectedToolName() {
  let res;
  const element = document.querySelector('input[name="tools"]:checked');
  if (element) {
    res = element.title;
  }
  return res;
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
 * Get a rounding function for a specific precision.
 *
 * @param {number} precision The rounding precision.
 * @returns {Function} The rounding function.
 */
function getPrecisionRound(precision) {
  return function (x) {
    return precisionRound(x, precision);
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
 * Setup about line.
 */
function setupAbout() {
  const testsDiv = document.getElementById('about');
  const link = document.createElement('a');
  link.href = 'https://github.com/ivmartel/dwv';
  link.appendChild(document.createTextNode('dwv'));
  const text = document.createTextNode(
    ' v' + getDwvVersion() +
    ' on ' + navigator.userAgent);

  testsDiv.appendChild(link);
  testsDiv.appendChild(text);
}

// ---------------------------------------------

// launch
setup();
