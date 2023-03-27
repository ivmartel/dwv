// setup on DOM loaded
document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

/**
 *
 */
function onDOMContentLoaded() {
  var intagsfileInput = document.getElementById('intagsfile');
  intagsfileInput.onchange = onInputTagsFile;
  var jsonlintButton = document.getElementById('jsonlint');
  jsonlintButton.onclick = launchJSONLint;
  var saveButton = document.getElementById('save');
  saveButton.onclick = onSaveTags;
  var inImgfileInput = document.getElementById('inImgfile');
  inImgfileInput.onchange = onInputImageFiles;
  var generateButton = document.getElementById('generate');
  generateButton.onclick = onGenerate;

  var tags = JSON.parse(document.getElementById('tags').value);
  if (tags) {
    // set study date
    var now = new Date();
    tags.StudyDate = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');
    tags.StudyTime = now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');
    // UID
    if (typeof tags.StudyInstanceUID === 'undefined') {
      tags.StudyInstanceUID = dwv.dicom.getUID('StudyInstanceUID');
      tags.StudyID = 10000;
    }
    if (typeof tags.StudyDescription === 'undefined') {
      tags.StudyDescription = 'dwv generated data';
    }
    if (typeof tags.SeriesInstanceUID === 'undefined') {
      tags.SeriesInstanceUID = dwv.dicom.getUID('SeriesInstanceUID');
      tags.SeriesNumber = tags.StudyID + 10;
    }
    if (typeof tags.SeriesDescription === 'undefined') {
      tags.SeriesDescription = 'Test data #0';
    }
    tags.SOPInstanceUID = dwv.dicom.getUID('SOPInstanceUID');
    // write back
    document.getElementById('tags').value = JSON.stringify(tags, null, 2);
  }

  // logger level (optional)
  dwv.logger.level = dwv.logger.levels.DEBUG;
}

var JSZip = JSZip || {};

// tags file
var _tagsFile = null;
var _images = null;
var _generating = false;

/**
 * @returns {string} The name of the selected pixel generator.
 */
function getPixelGeneratorName() {
  var tags = JSON.parse(document.getElementById('tags').value);
  // optional pixel generator (cannot be propagated)
  return tags.PixelData;
}

/**
 * Generate DICOM data
 */
function onGenerate() {
  if (_generating) {
    return;
  }

  // check tags validity
  if (!isValidTags()) {
    return;
  }
  var pixelGeneratorName = getPixelGeneratorName();

  var zip = new JSZip();

  var numberOfSlices = document.getElementById('numberofslices').value;

  console.log('Generating slices...');
  var blob;
  for (var k = 0; k < numberOfSlices; ++k) {
    try {
      blob = generateSlice(pixelGeneratorName, k);
    } catch (error) {
      console.error(error);
      alert(error.message);
      return;
    }
    zip.file('dwv-generated-slice' + k + '.dcm', blob);
  }

  zip.generateAsync({type: 'blob'}).then(function (blob) {
    console.log('Zipping data...');
    var element = document.getElementById('generate');
    element.download = 'dwv-generated.zip';
    element.href = URL.createObjectURL(blob);

    // simultate a click event to trigger download
    // (avoid infinte loop with generating flag)
    // see: https://github.com/eligrey/FileSaver.js
    _generating = true;
    element.dispatchEvent(new MouseEvent('click'));
    _generating = false;
    // revoke url to not download it twice
    setTimeout(function () {
      URL.revokeObjectURL(element.href);
    }, 2E3); // 2s
  }, function (error) {
    console.error(error);
    alert(error.message);
  });
}

/**
 *
 * @param {string} pixelGeneratorName The name of the pixel generator.
 * @param {number} sliceNumber The slice to generate.
 * @returns {Blob} A blob with the slice DICOM data.
 */
function generateSlice(pixelGeneratorName, sliceNumber) {
  var numberOfSlices = document.getElementById('numberofslices').value;

  // get tags from the textarea
  var tags = JSON.parse(document.getElementById('tags').value);
  // remove extra
  delete tags.PixelData;
  // image position
  var spacing = 1;
  if (typeof tags.PixelSpacing !== 'undefined') {
    spacing = tags.PixelSpacing[0];
  }
  var orientationName =
    dwv.dicom.getOrientationName(tags.ImageOrientationPatient);
  if (orientationName === 'axial') {
    tags.ImagePositionPatient = [0, 0, sliceNumber * spacing];
  } else if (orientationName === 'coronal') {
    tags.ImagePositionPatient = [0, sliceNumber * spacing, 0];
  } else if (orientationName === 'sagittal') {
    tags.ImagePositionPatient = [sliceNumber * spacing, 0, 0];
  }
  // instance number
  tags.SOPInstanceUID = tags.SOPInstanceUID + '.' + sliceNumber;
  tags.InstanceNumber = sliceNumber.toString();
  // convert JSON to DICOM element object
  var dicomElements = dwv.dicom.getElementsFromJSONTags(tags);
  // pixels
  dicomElements.x7FE00010 = dwv.dicom.generatePixelDataFromJSONTags(
    tags, pixelGeneratorName, sliceNumber, _images, numberOfSlices);

  // create writer
  var writer = new dwv.dicom.DicomWriter();
  var dicomBuffer = writer.getBuffer(dicomElements);

  // view as Blob to allow download
  var blob = new Blob([dicomBuffer], {type: 'application/dicom'});
  return blob;
}

/**
 * Save the tags as a JSON file.
 */
function onSaveTags() {
  // check validity
  if (!isValidTags()) {
    return;
  }
  // get text from the textarea
  var text = document.getElementById('tags').value;
  // view as Blob to allow download
  var blob = new Blob([text], {type: 'text/plain'});
  // update save button
  var element = document.getElementById('save');
  element.download = (_tagsFile === null ? 'tags.json' : _tagsFile.name);
  element.href = URL.createObjectURL(blob);
}

/**
 * Is the JSON valid?
 *
 * @returns {boolean} True if the tags are a valid JSON.
 */
function isValidTags() {
  try {
    JSON.parse(document.getElementById('tags').value);
  } catch (error) {
    /* eslint-disable-next-line no-alert */
    alert('The JSON is not valid, please check it with JSONLint.');
    return false;
  }
  return true;
}

/**
 * Open JSONLint to check the tags.
 */
function launchJSONLint() {
  var text = document.getElementById('tags').value;
  var link = 'http://jsonlint.com/?json=' + encodeURIComponent(text);
  window.open(link);
}

/**
 * Handle input tags file.
 *
 * @param {object} event The input field event.
 */
function onInputTagsFile(event) {
  if (event.target.files.length === 0) {
    return;
  }
  _tagsFile = event.target.files[0];
  var reader = new FileReader();
  reader.onload = function (event) {
    document.getElementById('tags').value = event.target.result;
  };
  reader.readAsText(_tagsFile);
}

/**
 * Handle input image file
 *
 * @param {object} event The input field event.
 */
function onInputImageFiles(event) {
  if (event.target.files.length === 0) {
    return;
  }
  var files = event.target.files;

  // update number of slices field
  document.getElementById('numberofslices').value = files.length;

  var checkTags = function (/*tags, image*/) {
    return false;
  };
  var pixGeneratorName = getPixelGeneratorName();
  if (typeof dwv.dicom.pixelGenerators[pixGeneratorName] !== 'undefined') {
    checkTags = dwv.dicom.pixelGenerators[pixGeneratorName].checkTags;
  }

  /**
   * Handle a reader load event.
   *
   * @param {object} event The reader load event.
   */
  function onReaderLoad(event) {
    var image = new Image();
    image.origin = file.name;
    // check size
    image.onload = function () {
      if (_images.length === 0) {
        // update tags if needed at first image load
        var tags = JSON.parse(document.getElementById('tags').value);
        if (checkTags(tags, this)) {
          /* eslint-disable-next-line no-alert */
          alert('Updating tags to input image meta data.');
          document.getElementById('tags').value = JSON.stringify(tags, null, 2);
        }
      } else {
        // check all images have equal sizes
        var message;
        if (this.width !== _images[0].width) {
          message = 'Image width mismatch between input files: ' +
              this.width + ' != ' + _images[0].width;
          console.error(message);
          alert(message);
          return;
        }
        if (this.height !== _images[0].height) {
          message = 'Image height mismatch between input files: ' +
              this.height + ' != ' + _images[0].height;
          console.error(message);
          alert(message);
          return;
        }
      }
      // save image
      _images.push(this);
    };
    // set src (triggers load)
    image.src = event.target.result;
  }

  _images = [];
  for (var i = 0; i < files.length; ++i) {
    var file = files[i];
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsDataURL(file);
  }
}
