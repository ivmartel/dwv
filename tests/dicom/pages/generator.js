// Do not warn if these variables were not defined before.
/* global dwv */

// namespaces
// eslint-disable-next-line no-var
var test = test || {};
// eslint-disable-next-line no-var
var JSZip = JSZip || {};

// call setup on DOM loaded
document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

/**
 * Setup.
 */
function onDOMContentLoaded() {
  const intagsfileInput = document.getElementById('intagsfile');
  intagsfileInput.onchange = onInputTagsFile;
  const jsonlintButton = document.getElementById('jsonlint');
  jsonlintButton.onclick = launchJSONLint;
  const saveButton = document.getElementById('save');
  saveButton.onclick = onSaveTags;
  const inImgfileInput = document.getElementById('inImgfile');
  inImgfileInput.onchange = onInputImageFiles;
  const generateButton = document.getElementById('generate');
  generateButton.onclick = onGenerate;

  const tags = JSON.parse(document.getElementById('tags').value);
  if (tags) {
    // set study date
    const now = new Date();
    tags.StudyDate = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');
    tags.StudyTime = now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');
    // UID
    if (typeof tags.StudyInstanceUID === 'undefined') {
      tags.StudyInstanceUID = dwv.getUID('StudyInstanceUID');
      tags.StudyID = 10000;
    }
    if (typeof tags.StudyDescription === 'undefined') {
      tags.StudyDescription = 'dwv generated data';
    }
    if (typeof tags.SeriesInstanceUID === 'undefined') {
      tags.SeriesInstanceUID = dwv.getUID('SeriesInstanceUID');
      tags.SeriesNumber = tags.StudyID + 10;
    }
    if (typeof tags.SeriesDescription === 'undefined') {
      tags.SeriesDescription = 'Test data #0';
    }
    tags.SOPInstanceUID = dwv.getUID('SOPInstanceUID');
    // write back
    document.getElementById('tags').value = JSON.stringify(tags, null, 2);
  }

  // logger level (optional)
  dwv.logger.level = dwv.logger.levels.DEBUG;
}

// tags file
let _tagsFile = null;
let _images = null;
let _generating = false;

/**
 * @returns {string} The name of the selected pixel generator.
 */
function getPixelGeneratorName() {
  const tags = JSON.parse(document.getElementById('tags').value);
  // optional pixel generator (cannot be propagated)
  return tags.PixelData;
}

/**
 * Generate DICOM data.
 */
function onGenerate() {
  if (_generating) {
    return;
  }

  // check tags validity
  if (!isValidTags()) {
    return;
  }
  const pixelGeneratorName = getPixelGeneratorName();

  const zip = new JSZip();

  const numberOfSlices = document.getElementById('numberofslices').value;

  console.log('Generating slices...');
  let blob;
  for (let k = 0; k < numberOfSlices; ++k) {
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
    const element = document.getElementById('generate');
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
  const numberOfSlices = document.getElementById('numberofslices').value;

  // get tags from the textarea
  const tags = JSON.parse(document.getElementById('tags').value);
  // remove extra
  delete tags.PixelData;
  // image position
  let spacing = 1;
  if (typeof tags.PixelSpacing !== 'undefined') {
    spacing = tags.PixelSpacing[0];
  }
  const orientationName =
    dwv.getOrientationName(tags.ImageOrientationPatient);
  if (orientationName === dwv.Orientation.Axial) {
    tags.ImagePositionPatient = [0, 0, sliceNumber * spacing];
  } else if (orientationName === dwv.Orientation.Coronal) {
    tags.ImagePositionPatient = [0, sliceNumber * spacing, 0];
  } else if (orientationName === dwv.Orientation.Sagittal) {
    tags.ImagePositionPatient = [sliceNumber * spacing, 0, 0];
  }
  // instance number
  tags.SOPInstanceUID = tags.SOPInstanceUID + '.' + sliceNumber;
  tags.InstanceNumber = sliceNumber.toString();
  // convert JSON to DICOM element object
  const dicomElements = dwv.getElementsFromJSONTags(tags);
  // pixels
  dicomElements['7FE00010'] = test.generatePixelDataFromJSONTags(
    tags, pixelGeneratorName, sliceNumber, _images, numberOfSlices);

  // create writer
  const writer = new dwv.DicomWriter();
  const dicomBuffer = writer.getBuffer(dicomElements);

  // view as Blob to allow download
  const blob = new Blob([dicomBuffer], {type: 'application/dicom'});
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
  const text = document.getElementById('tags').value;
  // view as Blob to allow download
  const blob = new Blob([text], {type: 'text/plain'});
  // update save button
  const element = document.getElementById('save');
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
  const text = document.getElementById('tags').value;
  const link = 'http://jsonlint.com/?json=' + encodeURIComponent(text);
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
  const reader = new FileReader();
  reader.onload = function (event) {
    document.getElementById('tags').value = event.target.result;
  };
  reader.readAsText(_tagsFile);
}

/**
 * Handle input image file.
 *
 * @param {object} event The input field event.
 */
function onInputImageFiles(event) {
  if (event.target.files.length === 0) {
    return;
  }
  const files = event.target.files;

  // update number of slices field
  document.getElementById('numberofslices').value = files.length;

  let checkTags = function (/*tags, image*/) {
    return false;
  };
  const pixGeneratorName = getPixelGeneratorName();
  if (typeof test.pixelGenerators[pixGeneratorName] !== 'undefined') {
    checkTags = test.pixelGenerators[pixGeneratorName].checkTags;
  }

  /**
   * Get a reader load event handler.
   *
   * @param {File} file The file that was loaded.
   * @returns {Function} The load handler.
   */
  function getOnReaderLoad(file) {
    return function (event) {
      const image = new Image();
      image.origin = file.name;
      // check size
      image.onload = function () {
        if (_images.length === 0) {
          // update tags if needed at first image load
          const tags = JSON.parse(document.getElementById('tags').value);
          if (checkTags(tags, this)) {
            /* eslint-disable-next-line no-alert */
            alert('Updating tags to input image meta data.');
            document.getElementById('tags').value =
              JSON.stringify(tags, null, 2);
          }
        } else {
          // check all images have equal sizes
          let message;
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
    };
  }

  _images = [];
  for (let i = 0; i < files.length; ++i) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = getOnReaderLoad(file);
    reader.readAsDataURL(file);
  }
}
