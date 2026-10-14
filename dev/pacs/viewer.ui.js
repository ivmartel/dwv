import {ViewConfig} from '../../src/app/application.js';
import {precisionRound} from '../../src/math/number.js';
import {getDwvVersion} from '../../src/dicom/dicomParser.js';
import {Point} from '../../src/math/point.js';
import {Matrix33} from '../../src/math/matrix.js';

import {DataTableUI} from './viewer.ui.datatable.js';
import {AnnotationUI} from './viewer.ui.annot.js';
import {SegmentationUI} from './viewer.ui.segment.js';
import {DrawToolUI} from './viewer.ui.draw.js';
import {BrushToolUI} from './viewer.ui.brush.js';

/**
 * @import {ViewerService} from './viewer.service.js';
 */

/**
 * Layout protocol class.
 */
export class LayoutProtocol {
  /**
   * @type {string}
   */
  #id;
  /**
   * @type {object[]}
   */
  #displaySets;

  /**
   * @param {object} config As
   *   {id, displaySets: [{divId, dataSelector, orientation}]}.
   */
  constructor(config) {
    this.#id = config.id;
    this.#displaySets = config.displaySets;
  }

  /**
   * Get the layout id.
   *
   * @returns {string} The id.
   */
  getId() {
    return this.#id;
  }

  /**
   * Get the layer groups div ids from this layout.
   *
   * @returns {string[]} The ids.
   */
  getLayerGroupDivIds() {
    const ids = [];
    for (const set of this.#displaySets) {
      const id = set.divId;
      if (!ids.includes(id)) {
        ids.push(id);
      }
    }
    return ids;
  }

  /**
   * Convert a display set into a view config.
   *
   * @param {object} set The display set.
   * @returns {ViewConfig} The view config.
   */
  #displaySetToViewConfig(set) {
    const config = new ViewConfig(set.divId);
    config.orientation = set.orientation;
    return config;
  }
  /**
   * Get the first view config for the given div id.
   *
   * @param {string} divId The div id.
   * @returns {ViewConfig} The config.
   */
  getViewConfigsByDivId(divId) {
    const set = this.#displaySets.find((elem) => elem.divId === divId);
    return this.#displaySetToViewConfig(set);
  }

  /**
   * Get the view configs for the given data id.
   *
   * @param {string} dataId The data id.
   * @returns {ViewConfig[]} The view configs.
   */
  getViewConfigsByDataId(dataId) {
    const sets =
      this.#displaySets.filter((elem) => elem.dataSelector(dataId));
    if (sets.length === 0) {
      console.warn(`Data not selected for display: ${dataId}`);
    }
    const res = [];
    for (const set of sets) {
      res.push(this.#displaySetToViewConfig(set));
    }
    return res;
  }

  /**
   * Get the data view configs for the given data ids.
   *
   * @param {string[]} dataIds The data id.
   * @returns {Record<string, ViewConfig[]>} The data view configs.
   */
  getDataViewConfigs(dataIds) {
    const res = {};
    for (const dataId of dataIds) {
      res[dataId] = this.getViewConfigsByDataId(dataId);
    }
    return res;
  }
}

// layout related

/**
 * Select all: returns true.
 *
 * @returns {boolean} True if selected.
 */
function selectAll(/*id*/) {
  return true;
}
/**
 * Select event ids.
 *
 * @param {string} id The id to check.
 * @returns {boolean} True if selected.
 */
function selectEven(id) {
  return parseInt(id, 10) % 2 === 0;
}
/**
 * Select odd ids.
 *
 * @param {string} id The id to check.
 * @returns {boolean} True if selected.
 */
function selectOdd(id) {
  return parseInt(id, 10) % 2 !== 0;
}
/**
 * Get the viewer layouts.
 *
 * @param {ViewerService} _service The associated viewer service
 *   (used by the commented modality selectors).
 * @returns {LayoutProtocol[]} The layouts.
 */
function getLayouts(_service) {
  /**
   * Select CT modality data.
   *
   * @param {string} id The id to check.
   * @returns {boolean} True if selected.
   */
  // function selectCT(id) {
  //   const dataCtrl = _service.getDataController();
  //   const modality = dataCtrl.get(id).meta['00080060'].value[0];
  //   return modality === 'CT';
  // }
  /**
   * Select PET modality data.
   *
   * @param {string} id The id to check.
   * @returns {boolean} True if selected.
   */
  // function selectPET(id) {
  //   const dataCtrl = _service.getDataController();
  //   const modality = dataCtrl.get(id).meta['00080060'].value[0];
  //   return modality === 'PT';
  // }

  // single div
  const layoutConfig0 = {
    id: '1*1',
    displaySets: [
      {
        divId: 'layerGroup0',
        dataSelector: selectAll,
      }
    ]
  };
  // one line, two columns
  const layoutConfig1 = {
    id: '1*2',
    displaySets: [
      {
        divId: 'layerGroup0',
        dataSelector: selectEven,
      },
      {
        divId: 'layerGroup1',
        dataSelector: selectOdd,
      }
    ]
  };
  // MPR
  const layoutConfig2 = {
    id: 'mpr',
    displaySets: [
      {
        divId: 'layerGroup0',
        orientation: 'axial',
        dataSelector: selectAll,
      },
      {
        divId: 'layerGroup1',
        orientation: 'coronal',
        dataSelector: selectAll,
      },
      {
        divId: 'layerGroup2',
        orientation: 'sagittal',
        dataSelector: selectAll,
      }
    ]
  };

  return [
    new LayoutProtocol(layoutConfig0),
    new LayoutProtocol(layoutConfig1),
    new LayoutProtocol(layoutConfig2)
  ];
}

/**
 * Viewer UI: creates the main viewer HTML elements
 * and binds them to the app.
 */
export class ViewerUI {

  /**
   * The associated viewer service.
   *
   * @type {ViewerService}
   */
  #service;

  /**
   * The available layouts.
   *
   * @type {LayoutProtocol[]}
   */
  #layouts;

  /**
   * The selected layout index.
   *
   * @type {number}
   */
  #selectedLayoutIndex = 0;

  /**
   * The tools configuration.
   *
   * @type {object}
   */
  #tools;

  /**
   * The tool features UIs, indexed by tool name.
   *
   * @type {object}
   */
  #toolFeaturesUI = {};

  /**
   * The data table UI.
   *
   * @type {DataTableUI}
   */
  #dataTable;

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
   * @param {ViewerService} service The associated viewer service.
   */
  constructor(service) {
    this.#service = service;
    this.#layouts = getLayouts(service);
    this.#tools = service.getTools();
  }

  /**
   * Get the selected layout.
   *
   * @returns {LayoutProtocol} The layout.
   */
  #getSelectedLayout() {
    return this.#layouts[this.#selectedLayoutIndex];
  }

  /**
   * Create the HTML and the associated UIs.
   */
  setup() {
    // add layer groups div
    this.#addLayerGroupsDivs(this.#getSelectedLayout());

    // data table
    this.#dataTable = new DataTableUI(this.#service);
    this.#dataTable.registerListeners();
    this.#dataTable.registerLayerAddListeners(this.#getSelectedLayout());

    // tool features UI
    const toolsUI = {
      Draw: DrawToolUI,
      Brush: BrushToolUI
    };
    for (const toolName in this.#tools) {
      if (typeof toolsUI[toolName] !== 'undefined') {
        const toolUI =
          new toolsUI[toolName](this.#service, this.#tools[toolName]);
        toolUI.registerListeners();
        this.#toolFeaturesUI[toolName] = toolUI;
      }
    }

    // data model UI
    const dataModelUI = {
      annotation: AnnotationUI,
      segmentation: SegmentationUI
    };
    for (const dmName in dataModelUI) {
      const dmUI = new dataModelUI[dmName](this.#service);
      dmUI.registerListeners();
    }

    // lines
    this.#setupFileLine();
    this.#setupPositionLine();
    this.#setupLayoutLine();
    this.#setupRotateLine();
    this.#setupBindersCheckboxes();
    this.#setupToolsCheckboxes();
    this.#addAbout(getDwvVersion());
  }

  /**
   * Bind app to ui.
   */
  registerListeners() {
    this.#service.addEventListener('loadstart', (event) => {
      // update load counters
      if (this.#numberOfDataToLoad === this.#numberOfLoadendData) {
        this.#numberOfDataToLoad = 0;
        this.#numberOfLoadendData = 0;
        // reset progress array
        this.#dataLoadProgress.length = 0;
      }
      ++this.#numberOfDataToLoad;
      // remove post-load listeners
      const dataCtrl = this.#service.getDataController();
      if (dataCtrl.getDataIds().length !== 0) {
        this.#removePostLoadListeners();
      }
      // add new data view config for new data
      this.#addNewDataViewConfig(event.detail.dataid);
    });
    this.#service.addEventListener('loadprogress', (event) => {
      if (event.detail.total > 0) {
        this.#dataLoadProgress[event.detail.dataid] =
          Math.ceil((event.detail.loaded / event.detail.total) * 100);
        const sumReducer = function (sum, value) {
          return sum + value;
        };
        const progressElement = document.getElementById('loadprogress');
        progressElement.value =
          this.#dataLoadProgress.reduce(sumReducer) /
          this.#numberOfDataToLoad;
      }
    });
    this.#service.addEventListener('loadend', () => {
      // update load counter
      ++this.#numberOfLoadendData;
    });
    this.#service.addEventListener('load', () => {
      // update sliders with new data info
      // (has to be after full load)
      this.#initSliders(this.#getSelectedLayout());
      // add post-load listeners
      this.#addPostLoadListeners();
    });

    // update UI at first render of first data
    const onRenderEnd = () => {
      // set app tool
      this.#setAppTool();
      // enable html
      const elementIds = [
        'tools',
        'changelayout',
        'resetviews',
        'changesmoothing',
        'rotate-x',
        'rotate-y',
        'rotate-z',
        'rotate-match',
        'rotate-reset'
      ];
      for (const elementId of elementIds) {
        const element = document.getElementById(elementId);
        if (element) {
          element.disabled = false;
        }
      }
      // remove handler
      this.#service.removeEventListener('renderend', onRenderEnd);
    };
    // add handler (will be removed at first success)
    this.#service.addEventListener('renderend', onRenderEnd);

    this.#service.addEventListener('positionchange', (event) => {
      const input = document.getElementById('position');
      const values = event.detail.value[1];
      let text = `(index: ${event.detail.value[0]})`;
      if (event.detail.value.length > 2) {
        text += ` value: ${event.detail.value[2]}`;
      }
      input.value = values.map(getPrecisionRound(2));
      // index as small text
      const span = document.getElementById('positionspan');
      if (span) {
        span.innerHTML = text;
      }
      // update sliders' value
      this.#updateSliders(this.#getSelectedLayout());
    });

    // filter shortcut
    window.addEventListener('keydown', (event) => {
      if (this.#getSelectedToolName() === 'Filter' &&
        event.altKey && event.key === 'r') {
        // run the sharpen filter
        const dataCtrl = this.#service.getDataController();
        this.#service.setToolFeatures({
          filterName: 'Sharpen',
          runArgs: {
            dataId: dataCtrl.getDataIds()[0]
          },
          run: true
        });
      }
    });
  }

  /**
   * Init individual slider on layer related event.
   * WARNING: needs to be called with the final geometry.
   *
   * @param {CustomEvent} event The layer event.
   */
  #initSliderOnEvent = (event) => {
    this.#initSlider(event.detail.layergroupid);
  };

  /**
   * Add post-load event listeners.
   */
  #addPostLoadListeners() {
    // post-load since sliders need the full geometry
    this.#service.addEventListener('viewlayeradd', this.#initSliderOnEvent);
    this.#service.addEventListener('drawlayeradd', this.#initSliderOnEvent);
    this.#service.addEventListener('layerremove', this.#initSliderOnEvent);
  }

  /**
   * Remove post-load event listeners.
   */
  #removePostLoadListeners() {
    this.#service.removeEventListener('viewlayeradd', this.#initSliderOnEvent);
    this.#service.removeEventListener('drawlayeradd', this.#initSliderOnEvent);
    this.#service.removeEventListener('layerremove', this.#initSliderOnEvent);
  }

  /**
   * Merge with first app config.
   *
   * @param {Record<string, ViewConfig[]>} dataViewConfigs A list
   *   of data view configs.
   */
  #mergeAppConfig(dataViewConfigs) {
    const stgCtrl = this.#service.getStageController();
    for (const dataId in dataViewConfigs) {
      const configs = dataViewConfigs[dataId];
      const appConfigs = stgCtrl.getViewConfigs(dataId);
      if (appConfigs.length !== 0) {
        // use first as base
        for (const config of configs) {
          mergeConfigs(config, appConfigs[0]);
        }
      }
    }
  }

  /**
   * Update the app position on slider input.
   *
   * @param {string} layerGroupDivId The layer group div id.
   * @param {string} value The slider value.
   */
  #onSliderInput(layerGroupDivId, value) {
    const stgCtrl = this.#service.getStageController();
    const lg = stgCtrl.getLayerGroupByDivId(layerGroupDivId);
    const ph = lg.getPositionHelper();
    const pos = ph.getCurrentPositionAtScrollValue(value);
    ph.setCurrentPosition(pos);
  }

  /**
   * Init sliders: show them and set max.
   *
   * @param {LayoutProtocol} layout The current layout.
   */
  #initSliders(layout) {
    for (const divId of layout.getLayerGroupDivIds()) {
      this.#initSlider(divId);
    }
  }

  /**
   * Init individual slider.
   * WARNING: needs to be called with the final geometry.
   *
   * @param {string} layerGroupId The id of the layer group.
   */
  #initSlider(layerGroupId) {
    const slider = document.getElementById(`${layerGroupId}-slider`);
    if (slider) {
      // disabled by default
      slider.disabled = true;
      // init if possible
      const stgCtrl = this.#service.getStageController();
      const lg = stgCtrl.getLayerGroupByDivId(layerGroupId);
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
   *
   * @param {LayoutProtocol} layout The current layout.
   */
  #updateSliders(layout) {
    for (const divId of layout.getLayerGroupDivIds()) {
      const slider = document.getElementById(`${divId}-slider`);
      if (slider) {
        const stgCtrl = this.#service.getStageController();
        const lg = stgCtrl.getLayerGroupByDivId(divId);
        if (typeof lg !== 'undefined') {
          const ph = lg.getPositionHelper();
          slider.value = ph.getCurrentPositionScrollValue();
        }
      }
    }
  }

  /**
   * Get a vertical slider for a given layer group.
   *
   * @param {string} layerGroupDivId The layer group div id.
   * @returns {HTMLInputElement} The slider as html range.
   */
  #getSlider(layerGroupDivId) {
    const range = document.createElement('input');
    range.type = 'range';
    range.className = 'vertical-slider';
    range.id = `${layerGroupDivId}-slider`;
    range.min = '0';
    range.max = '0';
    range.disabled = true;
    // update app on slider change
    range.oninput = () => {
      this.#onSliderInput(layerGroupDivId, range.value);
    };
    return range;
  }

  /**
   * Replace the content of the root 'dwv' div with the layout
   * layer group divs and their sliders.
   *
   * @param {LayoutProtocol} layout The layout.
   */
  #addLayerGroupsDivs(layout) {
    const root = document.getElementById('dwv');
    // clean up
    root.innerHTML = '';
    // add divs
    for (const divId of layout.getLayerGroupDivIds()) {
      const layerDiv = document.createElement('div');
      layerDiv.id = divId;
      layerDiv.className = 'layerGroup';

      root.appendChild(layerDiv);
      root.appendChild(this.#getSlider(divId));
    }
  }

  /**
   * Add data view config for the input data.
   *
   * @param {string} dataId The data ID.
   */
  #addNewDataViewConfig(dataId) {
    const configs = this.#getSelectedLayout().getViewConfigsByDataId(dataId);
    const stgCtrl = this.#service.getStageController();
    for (const config of configs) {
      stgCtrl.addDataViewConfig(dataId, config, false);
    }
  }

  /**
   * Setup file line.
   */
  #setupFileLine() {
    // bind app to input files
    const fileinput = document.getElementById('fileinput');
    fileinput.addEventListener('change', (event) => {
      const files = event.target.files;
      if (files.length !== 0) {
        this.#service.loadFiles(files);
      } else {
        throw new Error('No files to load');
      }
    });
  }

  /**
   * Setup position line.
   */
  #setupPositionLine() {
    const positionInput = document.getElementById('position');
    positionInput.addEventListener('change', (event) => {
      const vls = this.#service.getStageController().getViewLayersByDataId('0');
      const vc = vls[0].getViewController();
      const element = event.target;
      const values = element.value.split(',');
      const point = new Point(values.map(parseFloat));
      vc.setCurrentPosition(point);
    });
  }

  /**
   * Setup layout line.
   */
  #setupLayoutLine() {
    const resetViewsButton = document.getElementById('resetviews');
    resetViewsButton.disabled = true;
    resetViewsButton.addEventListener('click', () => {
      this.#service.getStageController().resetZoomPan();
    });

    const changeLayoutSelect = document.getElementById('changelayout');
    changeLayoutSelect.disabled = true;
    for (const layout of this.#layouts) {
      const layoutId = layout.getId();
      const option = document.createElement('option');
      option.value = layoutId;
      if (layoutId === this.#getSelectedLayout().getId()) {
        option.selected = true;
      }
      option.appendChild(document.createTextNode(layoutId));
      changeLayoutSelect.appendChild(option);
    }
    changeLayoutSelect.addEventListener('change', (event) => {
      const selectElement = event.target;
      const layoutId = selectElement.value;
      const layoutIndex = this.#layouts.findIndex(
        (elem) => elem.getId() === layoutId
      );
      if (layoutIndex === -1) {
        throw new Error(`Unknown layout: ${layoutId}`);
      } else {
        this.#selectedLayoutIndex = layoutIndex;
      }
      const selectedLayout = this.#getSelectedLayout();

      // add layer groups div
      this.#addLayerGroupsDivs(selectedLayout);

      // get configs
      const dataCtrl = this.#service.getDataController();
      const dataIds = dataCtrl.getDataIds();
      const dataViewConfigs = selectedLayout.getDataViewConfigs(dataIds);

      // merge app configs for possible extras (like window level)
      this.#mergeAppConfig(dataViewConfigs);

      // clear data table
      this.#dataTable.unRegisterViewListeners();
      this.#dataTable.clearDataTable();

      // update layout for data table
      this.#dataTable.unRegisterLayerAddListeners();
      this.#dataTable.registerLayerAddListeners(selectedLayout);

      // set config (deletes previous layers)
      const stgCtrl = this.#service.getStageController();
      stgCtrl.setDataViewConfigs(dataViewConfigs);

      // render data (creates layers)
      for (let i = 0; i < dataIds.length; ++i) {
        stgCtrl.render(dataIds[i]);
      }

      // listen to view changes
      this.#dataTable.registerViewListeners();

      // need to set tool after config change
      this.#setAppTool();
    });

    const smoothingChk = document.getElementById('changesmoothing');
    smoothingChk.checked = false;
    smoothingChk.disabled = true;
    smoothingChk.addEventListener('change', (event) => {
      const inputElement = event.target;
      this.#service.getStageController().setImageSmoothing(
        inputElement.checked);
    });
  }

  /**
   * Resample the data of the first layer group with a rotation.
   *
   * @param {Matrix33} rotation The rotation matrix.
   */
  #rotateFirstData(rotation) {
    const lg = this.#service.getStageController().getLayerGroupByDivId(
      'layerGroup0');
    const dataId = lg.getBaseViewLayer().getDataId();
    const image = this.#service.getDataController().get(dataId).image;
    const geometry = image.getGeometry();
    const newOrientation = rotation.multiply(geometry.getOrientation());
    this.#service.resample(dataId, newOrientation);
  }

  /**
   * Setup rotate line.
   */
  #setupRotateLine() {
    const dataCtrl = this.#service.getDataController();
    const stgCtrl = this.#service.getStageController();

    const angle = (Math.PI / 180) * 20;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    /* eslint-disable @stylistic/js/array-element-newline */
    const rotations = {
      'rotate-x': new Matrix33([
        1, 0, 0,
        0, cos, -sin,
        0, sin, cos
      ]),
      'rotate-y': new Matrix33([
        cos, 0, -sin,
        0, 1, 0,
        sin, 0, cos
      ]),
      'rotate-z': new Matrix33([
        cos, -sin, 0,
        sin, cos, 0,
        0, 0, 1
      ])
    };
    /* eslint-enable @stylistic/js/array-element-newline */

    for (const buttonId in rotations) {
      const button = document.getElementById(buttonId);
      button.disabled = true;
      button.addEventListener('click', () => {
        this.#rotateFirstData(rotations[buttonId]);
      });
    }

    const rotateMatchButton = document.getElementById('rotate-match');
    rotateMatchButton.disabled = true;
    rotateMatchButton.addEventListener('click', () => {
      const dataIds = dataCtrl.getDataIds();
      if (dataIds.length < 2) {
        console.log('Not enough datas to match geometries');
      }
      // log geometries if resample is needed
      const geometry0 = dataCtrl.get(dataIds[0]).image.getGeometry();
      const geometry1 = dataCtrl.get(dataIds[1]).image.getGeometry();
      if (!geometry0.getOrientation().equals(geometry1.getOrientation())) {
        console.log('Resample match');
        console.log('geometry0', geometry0.toString());
        console.log('geometry1', geometry1.toString());
      }
      // resample match data 0 and 1
      this.#service.resampleMatch(dataIds[0], dataIds[1]);
    });

    const rotateResetButton = document.getElementById('rotate-reset');
    rotateResetButton.disabled = true;
    rotateResetButton.addEventListener('click', () => {
      const lg = stgCtrl.getLayerGroupByDivId('layerGroup0');
      const vl = lg.getBaseViewLayer();
      const dataId = vl.getDataId();

      this.#service.revertResample(dataId);
    });
  }

  /**
   * Setup the binders checkboxes.
   */
  #setupBindersCheckboxes() {
    const propList = [
      'WindowLevel',
      'Position',
      'Zoom',
      'Offset',
      'Opacity',
      'ColourMap',
      'MaskView'
    ];
    const binders = [];
    // add all binders at startup
    for (let b = 0; b < propList.length; ++b) {
      binders.push(`${propList[b]}Binder`);
    }
    this.#service.setLayerGroupsBinders(binders);

    const onBinderChange = (propName, checked) => {
      const binderName = `${propName}Binder`;
      if (checked) {
        binders.push(binderName);
      } else {
        const index = binders.indexOf(binderName);
        if (index !== -1) {
          binders.splice(index, 1);
        }
      }
      this.#service.setLayerGroupsBinders(binders);
    };

    const fieldset = document.getElementById('binders');

    // individual binders
    for (let i = 0; i < propList.length; ++i) {
      const propName = propList[i];

      const input = document.createElement('input');
      input.id = `binder-${i}`;
      input.type = 'checkbox';
      input.checked = true;
      input.onchange = function () {
        onBinderChange(propName, input.checked);
      };

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
        document.getElementById(`binder-${j}`).click();
      }
    };
    const allLabel = document.createElement('label');
    allLabel.htmlFor = allInput.id;
    allLabel.appendChild(document.createTextNode('all'));
    fieldset.appendChild(allInput);
    fieldset.appendChild(allLabel);
  }

  /**
   * Setup the tools radio buttons (first one checked) and
   * the tool options div.
   */
  #setupToolsCheckboxes() {
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
    const keys = Object.keys(this.#tools);
    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i];

      const input = document.createElement('input');
      input.name = 'tools';
      input.type = 'radio';
      input.id = `tool-${i}`;
      input.title = key;
      input.onchange = () => {
        this.#setAppTool(key);
      };

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
   * @param {string} [toolName] The tool to set, defaults
   *   to the selected one.
   */
  #setAppTool(toolName) {
    // find the tool name if not provided
    if (typeof toolName === 'undefined') {
      toolName = this.#getSelectedToolName();
      if (typeof toolName === 'undefined') {
        console.warn('Cannot find tool to set the app with...');
        return;
      }
    }

    // set tool for app
    this.#service.setTool(toolName);

    // force window level non strict mode
    if (toolName === 'WindowLevel') {
      this.#service.setToolFeatures({
        activeViewLayerOnly: false
      });
    }

    // clear options html
    const toolOptionsEl = document.getElementById('toolOptions');
    if (toolOptionsEl !== null) {
      toolOptionsEl.innerHTML = '';
    }
    // tool features
    const featuresUI = this.#toolFeaturesUI[toolName];
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
        this.#service.setToolFeatures(features);
      }
    }
  }

  /**
   * Get the selected tool name.
   *
   * @returns {string|undefined} The tool name.
   */
  #getSelectedToolName() {
    let res;
    const element = document.querySelector('input[name="tools"]:checked');
    if (element) {
      res = element.title;
    }
    return res;
  }

  /**
   * Add the about line content.
   *
   * @param {string} version The dwv version.
   */
  #addAbout(version) {
    const aboutDiv = document.getElementById('about');
    const link = document.createElement('a');
    link.href = 'https://github.com/ivmartel/dwv';
    link.appendChild(document.createTextNode('dwv'));
    const text = document.createTextNode(
      ` v${version} on ${navigator.userAgent}`);

    aboutDiv.appendChild(link);
    aboutDiv.appendChild(text);
  }
}

/**
 * Merge a data config into the first input one.
 * Copies all but the divId and orientation property.
 *
 * @param {ViewConfig} config The config where to merge.
 * @param {ViewConfig} configToMerge The config to merge.
 * @returns {ViewConfig} The updated config.
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
