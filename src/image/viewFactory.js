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

  // window level presets
  var windowPresets = {};
  // image presets
  if (typeof image.getMeta().windowPresets !== 'undefined') {
    windowPresets = image.getMeta().windowPresets;
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

  // set the initial position
  view.setInitialPosition();

  return view;
};
