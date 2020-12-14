// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * View factory.
 *
 * @class
 */
dwv.image.ViewFactory = function () {};

/**
 * Get an View object from the read DICOM file.
 *
 * @param {object} dicomElements The DICOM tags.
 * @param {object} image The associated image.
 * @returns {dwv.image.View} The new View.
 */
dwv.image.ViewFactory.prototype.create = function (dicomElements, image) {
  // view
  var view = new dwv.image.View(image);

  // default color map
  if (image.getPhotometricInterpretation() === 'MONOCHROME1') {
    view.setDefaultColourMap(dwv.image.lut.invPlain);
  } else if (image.getPhotometricInterpretation() === 'PALETTE COLOR') {
    var paletteLut = image.getMeta().paletteLut;
    if (typeof (paletteLut) !== 'undefined') {
      view.setDefaultColourMap(paletteLut);
    }
  }

  // presets
  var windowPresets = {};

  // DICOM presets
  var windowCenter = dicomElements.getFromKey('x00281050', true);
  var windowWidth = dicomElements.getFromKey('x00281051', true);
  var windowCWExplanation = dicomElements.getFromKey('x00281055', true);
  if (windowCenter && windowWidth) {
    var name;
    for (var j = 0; j < windowCenter.length; ++j) {
      var center = parseFloat(windowCenter[j], 10);
      var width = parseFloat(windowWidth[j], 10);
      if (center && width && width !== 0) {
        name = '';
        if (windowCWExplanation) {
          name = dwv.dicom.cleanString(windowCWExplanation[j]);
        }
        if (name === '') {
          name = 'Default' + j;
        }
        windowPresets[name] = {
          wl: [new dwv.image.WindowLevel(center, width)],
          name: name,
          perslice: true
        };
      }
      if (width === 0) {
        console.warn('Zero window width found in DICOM.');
      }
    }
  }

  // min/max
  // Not filled yet since it is stil too costly to calculate min/max
  // for each slice... It will be filled at first use
  // (see view.setWindowLevelPreset).
  // Order is important, if no wl from DICOM, this will be the default.
  windowPresets.minmax = {name: 'minmax'};

  // optional modality presets
  if (typeof dwv.tool !== 'undefined' &&
    typeof dwv.tool.defaultpresets !== 'undefined') {
    var modality = image.getMeta().Modality;
    for (var key in dwv.tool.defaultpresets[modality]) {
      var preset = dwv.tool.defaultpresets[modality][key];
      windowPresets[key] = {
        wl: new dwv.image.WindowLevel(preset.center, preset.width),
        name: key
      };
    }
  }

  // store
  view.setWindowPresets(windowPresets);

  return view;
};
