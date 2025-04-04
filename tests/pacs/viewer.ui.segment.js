// Do not warn if these variables were not defined before.
/* global dwv */

// namespace
// eslint-disable-next-line no-var
var test = test || {};
test.dataModelUI = test.dataModelUI || {};

//
const _colours = [
  {r: 255, g: 0, b: 0},
  {r: 0, g: 255, b: 0},
  {r: 0, g: 0, b: 255},
  {r: 0, g: 255, b: 255},
  {r: 255, g: 0, b: 255},
  {r: 255, g: 255, b: 0},
  {r: 255, g: 255, b: 255},
  {r: 255, g: 128, b: 128},
  {r: 128, g: 255, b: 128},
  {r: 128, g: 128, b: 255},
  {r: 128, g: 255, b: 255},
  {r: 255, g: 128, b: 255},
  {r: 255, g: 255, b: 128},
  {r: 128, g: 128, b: 128},
  {r: 255, g: 64, b: 64},
  {r: 64, g: 255, b: 64},
  {r: 64, g: 64, b: 255},
  {r: 64, g: 255, b: 255},
  {r: 255, g: 64, b: 255},
  {r: 255, g: 255, b: 64},
  {r: 64, g: 64, b: 64},
];
// colour array to pick from
let _coloursPick = _colours.slice();

const _segmentations = [];

/**
 * Get a segment from a segment list.
 *
 * @param {number} segmentNumber The segment number.
 * @param {object[]} segments The list to search.
 * @returns {object|undefined} The found segment.
 */
function getSegment(segmentNumber, segments) {
  return segments.find(function (item) {
    return item.number === segmentNumber;
  });
}

/**
 * Get the next available colour from the colour list.
 *
 * @returns {object} The colour as {r,g,b}.
 */
function nextColour() {
  // recreate if empty
  if (_coloursPick.length === 0) {
    console.log('Regenerating colours...');
    _coloursPick = _colours.slice();
  }
  // pick first in list
  const colour = _coloursPick[0];
  // remove picked
  _coloursPick.splice(0, 1);
  // return first
  return colour;
}

/**
 * Get a new segment.
 *
 * @param {number} number The segment number.
 * @returns {object} The new segment.
 */
function getNewSegment(number) {
  return {
    number,
    algorithmType: 'MANUAL',
    algorithmName: undefined,
    label: 's' + number,
    displayRGBValue: nextColour(),
    displayValue: undefined,
    propertyCategoryCode: dwv.getSegmentationCode(),
    propertyTypeCode: dwv.getSegmentationCode(),
    trackingId: undefined,
    trackingUid: undefined
  };
}

/**
 * HTML element id prefixes.
 */
const prefixes = {
  segmentation: 'segmentation',
  segment: 'segment',
  span: 'span-',
  select: 'select-',
  colour: 'colour-',
  view: 'view-',
  delete: 'delete-',
  addSegment: 'add-segment-',
  selectEraser: 'select-eraser-',
  save: 'save-',
  volumes: 'span-volumes'
};

/**
 * Get the HTML id of a segmentation.
 *
 * @param {number} segmentationIndex The segmentation index.
 * @returns {string} The segmentation HTML id.
 */
function getSegmentationHtmlId(segmentationIndex) {
  return test.getHtmlId(prefixes.segmentation, segmentationIndex);
}

/**
 * Get a segmentation index from an HTML id.
 *
 * @param {string} segmentationName The segmentation HTML id.
 * @returns {number} The segmentation index.
 */
function splitSegmentationHtmlId(segmentationName) {
  const indexStr = test.getRootFromHtmlId(
    prefixes.segmentation, segmentationName);
  return parseInt(indexStr, 10);
}

/**
 * Get the HTML id of a segment.
 *
 * @param {number} segmentNumber The segment number.
 * @param {number} segmentationIndex The segmentation index.
 * @returns {string} The segment HTML id.
 */
function getSegmentHtmlId(segmentNumber, segmentationIndex) {
  const segmentName = test.getHtmlId(prefixes.segment, segmentNumber);
  const segmentationName = getSegmentationHtmlId(segmentationIndex);
  return segmentName + '-' + segmentationName;
}

/**
 * Get a segment index and number from an HTML id.
 *
 * @param {string} segmentId The segment id.
 * @returns {object} The segment index and number.
 */
function splitSegmentHtmlId(segmentId) {
  const split = segmentId.split('-');
  const numberStr = test.getRootFromHtmlId(prefixes.segment, split[0]);
  return {
    segmentNumber: parseInt(numberStr, 10),
    segmentationIndex: splitSegmentationHtmlId(split[1])
  };
}

/**
 * Segmentation UI.
 *
 * @param {object} app The associated application.
 */
test.dataModelUI.Segmentation = function (app) {

  const _volumes = new dwv.Volumes(app);

  // Watch for volume calculations
  _volumes.onVolumeCalculation = ((event) => {
    const segmentation =
      _segmentations.find(
        (seg) => {
          return seg.dataId = event.data.dataId;
        }
      );

    if (typeof segmentation !== 'undefined') {
      segmentation.volumes = event.data.volumes;
      updateVolumesSpan(segmentation);
    }
  });

  // Watch for sementation volume changes
  const brushTool = app.getToolboxController().getToolList()['Brush'];
  if (typeof brushTool !== 'undefined') {
    brushTool.addEventListener(
      'volumeschanged',
      ((event) => {
        _volumes.calculateVolumes(event.detail.dataId);
      })
    );
  }

  /**
   * Bind app to ui.
   */
  this.registerListeners = function () {
    app.addEventListener('dataadd', onDataAdd);
  };

  /**
   * Add a segment HTML to the main HTML.
   *
   * @param {object} segmentation The segmentation.
   */
  function addSegmentationHtml(segmentation) {
    // segmentation as html
    const item = getSegmentationHtml(segmentation, _segmentations.length - 1);

    // add segmentation item
    const addItem = document.getElementById('addsegmentationitem');
    // remove and add after to make it last item
    addItem.remove();

    // update list
    const segList = document.getElementById('segmentation-list');
    segList.appendChild(item);
    segList.appendChild(addItem);
  }

  /**
   * Handle a dataadd event.
   *
   * @param {object} event The dataadd event.
   */
  function onDataAdd(event) {
    const dataId = event.dataid;
    const maskImage = app.getData(dataId).image;

    if (typeof maskImage !== 'undefined' &&
      maskImage.getMeta().Modality === 'SEG') {
      // setup html if needed
      if (!document.getElementById('segmentation-list')) {
        setupHtml();
      }

      const segHelper = new dwv.MaskSegmentHelper(maskImage);
      if (segHelper.getNumberOfSegments() === 0) {
        // manually created segmentation with no segments
        const selectSegmentCheckedId = getSelectSegmentCheckedId();
        if (typeof selectSegmentCheckedId === 'undefined') {
          // default segment created at first brush
          const segmentNumber = 1;
          const segment = getNewSegment(segmentNumber);
          segHelper.addSegment(segment);
          // default segmentation
          const segmentation = {
            dataId: dataId,
            volumes: [],
            hasNewSegments: false,
            segments: [segment],
            selectedSegmentNumber: segmentNumber,
            viewHelper: new dwv.MaskSegmentViewHelper()
          };
          _volumes.calculateVolumes(dataId);
          // add to list
          _segmentations.push(segmentation);
          // add to html
          addSegmentationHtml(segmentation);
        } else {
          const indices = splitSegmentHtmlId(
            test.getRootFromHtmlId(prefixes.select, selectSegmentCheckedId));
          const segmentation = _segmentations[indices.segmentationIndex];
          // segmentation created with add segmentation
          if (typeof segmentation.dataId === 'undefined') {
            segmentation.dataId = dataId;
            _volumes.calculateVolumes(dataId);
            for (const segment of segmentation.segments) {
              segHelper.addSegment(segment);
            }
          }
          segmentation.hasNewSegments = false;
        }
      } else {
        // segmentation from loaded file, pass segments to ui
        const imgMeta = maskImage.getMeta();
        if (typeof imgMeta !== 'undefined') {
          // loaded segmentation
          const segmentation = {
            dataId: dataId,
            volumes: [],
            hasNewSegments: true,
            segments: imgMeta.custom.segments,
            viewHelper: new dwv.MaskSegmentViewHelper()
          };
          _volumes.calculateVolumes(dataId);
          // add to list
          _segmentations.push(segmentation);
          // add to html
          addSegmentationHtml(segmentation);

          // remove colour from colour pick
          for (const segment of imgMeta.custom.segments) {
            const index = _coloursPick.findIndex((item) =>
              item.r === segment.displayRGBValue.r &&
              item.g === segment.displayRGBValue.g &&
              item.b === segment.displayRGBValue.b);
            if (index !== -1) {
              _coloursPick.splice(index, 1);
            }
          }
        }
      }
    }
  }

  /**
   * Setup the html for the segmentation list.
   */
  function setupHtml() {
    // segmentation list
    const segList = document.createElement('ul');
    segList.id = 'segmentation-list';

    // loop on segmentations
    for (let i = 0; i < _segmentations.length; ++i) {
      const segmentationItem = getSegmentationHtml(_segmentations[i], i);
      segList.appendChild(segmentationItem);
    }

    // extra item for add segmentation button
    const addItem = document.createElement('li');
    addItem.id = 'addsegmentationitem';
    const addSegmentationButton = document.createElement('button');
    addSegmentationButton.appendChild(
      document.createTextNode('Add segmentation'));
    addSegmentationButton.onclick = function (/*event*/) {
      // new segmentation
      const segmentation = {
        dataId: undefined,
        volumes: [],
        hasNewSegments: true,
        segments: [getNewSegment(1)],
        viewHelper: new dwv.MaskSegmentViewHelper()
      };
      // add to list
      _segmentations.push(segmentation);
      // add to html
      addSegmentationHtml(segmentation);
    };
    addItem.appendChild(addSegmentationButton);

    segList.appendChild(addItem);

    // fieldset
    const legend = document.createElement('legend');
    legend.appendChild(document.createTextNode('Segmentations'));
    const fieldset = document.createElement('fieldset');
    fieldset.appendChild(legend);
    fieldset.appendChild(segList);

    // main div
    const line = document.createElement('div');
    line.id = 'segmentations-line';
    line.className = 'line';
    line.appendChild(fieldset);

    // insert
    const detailsEl = document.getElementById('layersdetails');
    detailsEl.parentElement.insertBefore(line, detailsEl);
  }

  /**
   * Select a segment in the brush tool.
   *
   * @param {number} segmentNumber The segment number.
   * @param {object} segmentation The segmentation.
   */
  function appSelectSegment(segmentNumber, segmentation) {
    segmentation.selectedSegmentNumber = segmentNumber;

    // add segment if not present
    const data = app.getData(segmentation.dataId);
    if (typeof data !== 'undefined') {
      const maskImage = data.image;
      const segHelper = new dwv.MaskSegmentHelper(maskImage);
      // add segment to mask
      if (!segHelper.hasSegment(segmentNumber)) {
        console.log('Add segment', segmentNumber);
        segHelper.addSegment(getSegment(
          segmentNumber, segmentation.segments
        ));
      }
    }

    // app features
    const features = {
      brushMode: 'add',
      selectedSegmentNumber: segmentNumber,
      maskDataId: undefined,
      createMask: false
    };
    if (typeof segmentation.dataId !== 'undefined') {
      features.maskDataId = segmentation.dataId;
    } else {
      features.createMask = true;
    }
    console.log('set tool features [add]', features);
    app.setToolFeatures(features);
  }

  /**
   * Select the erase in the brush tool.
   *
   * @param {object} segmentation The segmentation.
   */
  function appSelectEraser(segmentation) {
    // app features
    const features = {
      brushMode: 'del',
      maskDataId: undefined
    };
    if (typeof segmentation.dataId !== 'undefined') {
      features.maskDataId = segmentation.dataId;
    }
    console.log('set tool features [del]', features);
    app.setToolFeatures(features);
  }

  /**
   * Handle a segment select from UI.
   *
   * @param {Event} event HTML event.
   */
  function onSegmentSelect(event) {
    const target = event.target;
    // get segment
    const indices = splitSegmentHtmlId(
      test.getRootFromHtmlId(prefixes.select, target.id));
    const segmentation = _segmentations[indices.segmentationIndex];
    // select it
    appSelectSegment(indices.segmentNumber, segmentation);
  }

  /**
   * Handle a segment colour change from UI.
   *
   * @param {Event} event HTML event.
   */
  function onSegmentColourChange(event) {
    const target = event.target;
    const newHexColour = target.value;
    // get segment
    const indices = splitSegmentHtmlId(
      test.getRootFromHtmlId(prefixes.colour, target.id));
    const segmentation = _segmentations[indices.segmentationIndex];
    const segment = getSegment(indices.segmentNumber, segmentation.segments);
    const segmentHexColour = dwv.rgbToHex(segment.displayRGBValue);

    if (newHexColour !== segmentHexColour) {
      // update colours
      const newRgbColour = dwv.hexToRgb(newHexColour);
      // get segment and mask
      const maskData = app.getData(segmentation.dataId);
      // change if possible
      if (typeof maskData !== 'undefined') {
        // create change colour command
        const previousColour = segment.displayRGBValue;
        const chgCmd = new dwv.ChangeSegmentColourCommand(
          maskData.image, segment, newRgbColour);
        chgCmd.onExecute = function (/*event*/) {
          // not needed the first time but on undo/redo
          target.value = newHexColour;
        };
        chgCmd.onUndo = function () {
          // not needed the first time but on undo/redo
          target.value = dwv.rgbToHex(previousColour);
        };
        // execute command
        if (chgCmd.isValid()) {
          chgCmd.execute();
          app.addToUndoStack(chgCmd);
        }
      }

      // update segment
      segment.displayRGBValue = newRgbColour;
      // pass updated color to brush
      appSelectSegment(indices.segmentNumber, segmentation);
    }
  }

  /**
   * Handle a segment view change from UI.
   *
   * @param {MouseEvent} event HTML event.
   */
  function onSegmentViewChange(event) {
    const target = event.target;
    // get segment
    const indices = splitSegmentHtmlId(
      test.getRootFromHtmlId(prefixes.view, target.id));
    const segmentation = _segmentations[indices.segmentationIndex];
    const segment = getSegment(indices.segmentNumber, segmentation.segments);
    // toggle hidden
    const segViewHelper = segmentation.viewHelper;
    const isPressed = target.style.borderStyle === 'inset';
    if (isPressed) {
      target.style.borderStyle = 'outset';
      segViewHelper.removeFromHidden(segment.number);
    } else {
      target.style.borderStyle = 'inset';
      segViewHelper.addToHidden(segment.number);
    }
    // apply hidden
    const vls = app.getViewLayersByDataId(segmentation.dataId);
    if (vls.length === 0) {
      console.warn('No layers to show/hide seg');
    }
    for (const vl of vls) {
      const vc = vl.getViewController();
      vc.setViewAlphaFunction(segViewHelper.getAlphaFunc());
    }
  }

  /**
   * Handle a segment delete from UI.
   *
   * @param {MouseEvent} event HTML event.
   */
  function onSegmentDelete(event) {
    const target = event.target;
    // get segment
    const indices = splitSegmentHtmlId(
      test.getRootFromHtmlId(prefixes.delete, target.id));
    const segmentation = _segmentations[indices.segmentationIndex];
    const segmentId = getSegmentHtmlId(
      indices.segmentNumber, indices.segmentationIndex);

    // get segment divs
    const segmentSpan = document.getElementById(
      test.getHtmlId(prefixes.span, segmentId)
    );
    if (!segmentSpan) {
      throw new Error('No delete span');
    }
    const spanParent = segmentSpan.parentNode;
    if (!spanParent) {
      throw new Error('No delete span parent');
    }
    const spanNext = segmentSpan.nextSibling;

    // get mask
    const data = app.getData(segmentation.dataId);
    // delete if possible
    if (typeof data !== 'undefined') {
      const segment =
        getSegment(indices.segmentNumber, segmentation.segments);
      // create delete command
      const delCmd = new dwv.DeleteSegmentCommand(data.image, segment);
      delCmd.onExecute = function () {
        segmentSpan.remove();
        if (segmentation.viewHelper.isHidden(segment.number)) {
          segmentation.viewHelper.removeFromHidden(segment);
        }
      };
      delCmd.onUndo = function () {
        spanParent.insertBefore(segmentSpan, spanNext);
      };
      // execute command
      if (delCmd.isValid()) {
        delCmd.execute();
        app.addToUndoStack(delCmd);
      }
    } else {
      segmentSpan.remove();
    }
    // select first segment
    const spanChildren = spanParent.childNodes;
    for (const spanNode of spanChildren) {
      if (spanNode.nodeName === 'SPAN') {
        const spanNodeChildren = spanNode.childNodes;
        for (const node of spanNodeChildren) {
          if (node.nodeName === 'INPUT') {
            const input = node;
            input.checked = true;
            break;
          }
        }
        break;
      }
    }
  }

  /**
   * Get the id of the select segment checked input.
   *
   * @returns {string} The input id.
   */
  function getSelectSegmentCheckedId() {
    let id;
    const selectInputs = document.querySelectorAll(
      'input[type=\'radio\'][name=\'select-segment\']'
    );
    for (const input of selectInputs) {
      if (input.checked) {
        id = input.id;
        break;
      }
    }
    return id;
  }

  /**
   * Get the HTML span element for a segment.
   *
   * @param {object} segment The segment.
   * @param {number} segmentationIndex The segmentation index.
   * @returns {HTMLSpanElement} THe HTML element.
   */
  function getSegmentHtml(segment, segmentationIndex) {
    const segmentId = getSegmentHtmlId(segment.number, segmentationIndex);

    // segment select
    const selectInput = document.createElement('input');
    selectInput.type = 'radio';
    selectInput.name = 'select-segment';
    selectInput.id = test.getHtmlId(prefixes.select, segmentId);
    selectInput.title = segmentId;
    selectInput.onchange = onSegmentSelect;

    if (segment.number === 1) {
      selectInput.checked = true;
      appSelectSegment(segment.number, _segmentations[segmentationIndex]);
    }

    const selectLabel = document.createElement('label');
    selectLabel.htmlFor = selectInput.id;
    selectLabel.title = selectInput.title;
    selectLabel.appendChild(document.createTextNode(segment.label));

    // segment colour
    const colourInput = document.createElement('input');
    colourInput.type = 'color';
    colourInput.title = 'Change segment colour';
    colourInput.id = test.getHtmlId(prefixes.colour, segmentId);
    colourInput.value = dwv.rgbToHex(segment.displayRGBValue);
    colourInput.onchange = onSegmentColourChange;

    // segment view
    const viewButton = document.createElement('button');
    viewButton.style.borderStyle = 'outset';
    viewButton.id = test.getHtmlId(prefixes.view, segmentId);
    viewButton.title = 'Show/hide segment';
    viewButton.appendChild(document.createTextNode('\u{1F441}\u{FE0F}'));
    viewButton.onclick = onSegmentViewChange;

    // segment delete
    const deleteButton = document.createElement('button');
    deleteButton.id = test.getHtmlId(prefixes.delete, segmentId);
    deleteButton.title = 'Delete segment';
    deleteButton.appendChild(document.createTextNode('\u{274C}'));
    deleteButton.onclick = onSegmentDelete;

    // segment span
    const span = document.createElement('span');
    span.id = test.getHtmlId(prefixes.span, segmentId);
    span.appendChild(selectInput);
    span.appendChild(selectLabel);
    span.appendChild(colourInput);
    span.appendChild(viewButton);
    span.appendChild(deleteButton);

    return span;
  }

  /**
   * Handle an eraser select from UI.
   *
   * @param {Event} event HTML event.
   */
  function onEraserSelect(event) {
    const target = event.target;
    // get segmentation
    const segmentationIndex = splitSegmentationHtmlId(
      test.getRootFromHtmlId(prefixes.selectEraser, target.id));
    const segmentation = _segmentations[segmentationIndex];
    // select eraser
    appSelectEraser(segmentation);
  }

  /**
   * Handle a segment add from UI.
   *
   * @param {MouseEvent} event HTML event.
   */
  function onSegmentAdd(event) {
    const target = event.target;
    // get segmentation
    const segmentationIndex = splitSegmentationHtmlId(
      test.getRootFromHtmlId(prefixes.addSegment, target.id));
    const segmentation = _segmentations[segmentationIndex];
    const segments = segmentation.segments;

    // create new segment
    const newSegment = getNewSegment(segments.length + 1);
    // add to list
    segments.push(newSegment);
    // update flag
    segmentation.hasNewSegments = true;

    // update UI
    const actionGroup = target.parentElement;
    const list = actionGroup.parentElement;
    // remove action group
    actionGroup.remove();
    // add segment to list
    list.appendChild(
      getSegmentHtml(newSegment, segmentationIndex)
    );
    // put back action group
    list.appendChild(actionGroup);
  }

  /**
   * Handle a segmentation save from UI.
   *
   * @param {MouseEvent} event HTML event.
   */
  function onSegmentationSave(event) {
    const target = event.target;
    // get segmentation
    const segmentationIndex = splitSegmentationHtmlId(
      test.getRootFromHtmlId(prefixes.save, target.id));
    const segmentationName = getSegmentationHtmlId(segmentationIndex);
    const segmentation = _segmentations[segmentationIndex];
    const dataId = segmentation.dataId;

    // get data
    const maskData = app.getData(dataId);
    if (typeof maskData === 'undefined') {
      throw new Error('Cannot save without mask image');
    }
    // TODO: find better way...
    const sourceId = dataId - 1;
    const sourceData = app.getData(sourceId.toString());
    if (typeof sourceData === 'undefined') {
      throw new Error('Cannot save without source image');
    }
    // dicom elements
    const fac = new dwv.MaskFactory();
    const dicomElements = fac.toDicom(
      maskData.image,
      maskData.image.getMeta().custom.segments,
      sourceData.image,
      {
        MediaStorageSOPInstanceUID: '1.2.3.4.5.6',
        SeriesInstanceUID: '1.2.3.4.5.6',
        SeriesNumber: '1',
        SOPInstanceUID: '1.2.3.4.5.6.1000',
      }
    );
    // create writer with default rules
    const writer = new dwv.DicomWriter();
    let dicomBuffer;
    try {
      dicomBuffer = writer.getBuffer(dicomElements);
    } catch (error) {
      dwv.logger.error(error);
      alert(error.message);
    }
    if (dicomBuffer !== undefined) {
      // view as Blob to allow download
      const blob = new Blob([dicomBuffer], {type: 'application/dicom'});
      // update generate button
      const element = document.createElement('a');
      element.href = window.URL.createObjectURL(blob);
      element.download = segmentationName + '.dcm';
      // trigger download
      element.click();
      URL.revokeObjectURL(element.href);
    }
  }

  /**
   * Convert the volumes of a segmentation into a displayable string.
   *
   * @param {object} segmentation The segmentation.
   * @returns {string} The display string of volumes.
   */
  function createVolumesString(segmentation) {
    const mlStrings = segmentation.volumes.map((volume) => volume + 'ml');
    return 'Volumes: ' + mlStrings.join(', ');
  }

  /**
   * Updates teh text of the volumes diplay for a segmentation.
   *
   * @param {object} segmentation The segmentation.
   */
  function updateVolumesSpan(segmentation) {
    const segmentationIndex =
      _segmentations.findIndex(
        (seg) => {
          return seg === segmentation;
        }
      );

    if (segmentationIndex >= 0) {
      const segmentationName = getSegmentationHtmlId(segmentationIndex);
      const elementName = test.getHtmlId(prefixes.volumes, segmentationName);

      const element = document.getElementById(elementName);
      if (element) {
        element.innerText = createVolumesString(segmentation);
      }
    }
  }

  /**
   * Get the HTML list element for a segmentation.
   *
   * @param {object} segmentation The segmentation.
   * @param {number} segmentationIndex The segmentation index.
   * @returns {HTMLLIElement} The HTML element.
   */
  function getSegmentationHtml(segmentation, segmentationIndex) {
    const segmentationName = getSegmentationHtmlId(segmentationIndex);

    // segmentation item
    const segmentationItem = document.createElement('li');

    // save segmentation
    const saveButton = document.createElement('button');
    saveButton.appendChild(document.createTextNode('\u{1F4BE}'));
    saveButton.title = 'Save segmentation';
    saveButton.id = test.getHtmlId(prefixes.save, segmentationName);
    saveButton.onclick = onSegmentationSave;

    segmentationItem.appendChild(saveButton);

    // segmentation name
    segmentationItem.appendChild(document.createTextNode(segmentationName));

    // add segments
    const segments = segmentation.segments;
    for (let j = 0; j < segments.length; ++j) {
      segmentationItem.appendChild(
        getSegmentHtml(segments[j], segmentationIndex)
      );
    }

    // segment eraser
    const eraserInput = document.createElement('input');
    eraserInput.type = 'radio';
    eraserInput.name = 'select-segment';
    eraserInput.title = 'Eraser';
    eraserInput.id = test.getHtmlId(prefixes.selectEraser, segmentationName);
    eraserInput.onchange = onEraserSelect;

    const eraserLabel = document.createElement('label');
    eraserLabel.htmlFor = eraserInput.id;
    eraserLabel.title = eraserInput.title;
    eraserLabel.appendChild(document.createTextNode('Eraser'));

    // add segment
    const addSegmentButton = document.createElement('button');
    addSegmentButton.appendChild(document.createTextNode('\u2795'));
    addSegmentButton.title = 'Add segment';
    addSegmentButton.id = test.getHtmlId(prefixes.addSegment, segmentationName);
    addSegmentButton.onclick = onSegmentAdd;

    // action span
    const actionSpan = document.createElement('span');
    actionSpan.id = 'span-action-' + segmentationName;
    actionSpan.appendChild(eraserInput);
    actionSpan.appendChild(eraserLabel);
    actionSpan.appendChild(addSegmentButton);

    // volumes display
    const volumesSpan = document.createElement('span');
    volumesSpan.id = test.getHtmlId(prefixes.volumes, segmentationName);
    volumesSpan.innerText = createVolumesString(segmentation);
    actionSpan.appendChild(volumesSpan);

    // append span to item
    segmentationItem.appendChild(actionSpan);

    return segmentationItem;
  }

}; // test.dataModelUI.Segmentation
