import {logger} from '../../../src/utils/logger.js';
import {
  getUID,
} from '../../../src/dicom/dicomWriter.js';

import {
  _pixelGenerators,
  generateSlice,
  addDates
} from '../dicomGenerator.js';

// importing directly in generator.html seems to work...
// import {JSZip} from 'JSZip';

// global vars
let _tagsFile = null;
let _images = null;
let _generating = false;

/**
 * Setup.
 */
function setup() {
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

  const tags = JSON.parse(getTagsText());
  if (tags) {
    // dates
    addDates(tags);
    // UID
    if (typeof tags.StudyInstanceUID === 'undefined') {
      tags.StudyInstanceUID = getUID('StudyInstanceUID');
      tags.StudyID = 10000;
    }
    if (typeof tags.StudyDescription === 'undefined') {
      tags.StudyDescription = 'dwv generated study';
    }
    if (typeof tags.SeriesInstanceUID === 'undefined') {
      tags.SeriesInstanceUID = getUID('SeriesInstanceUID');
      tags.SeriesNumber = tags.StudyID + 10;
    }
    if (typeof tags.SeriesDescription === 'undefined') {
      tags.SeriesDescription = 'dwv generated series';
    }
    tags.SOPInstanceUID = getUID('SOPInstanceUID');
    // write back
    document.getElementById('tags').value = JSON.stringify(tags, null, 2);
  }

  // logger level (optional)
  logger.level = logger.levels.DEBUG;
}

/**
 * @returns {string} The name of the selected pixel generator.
 */
function getPixelGeneratorName() {
  return document.getElementById('pixgenerator').value;
}

/**
 * @returns {string} The tags.
 */
function getTagsText() {
  return document.getElementById('tags').value;
}

/**
 * @returns {number} The number of slices.
 */
function getNumberOfSlices() {
  return parseInt(document.getElementById('numberofslices').value, 10);
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

  // get tags from the textarea
  const tags = JSON.parse(getTagsText());

  const pixelGeneratorName = getPixelGeneratorName();

  // imported directly in generator.html, seems to work...
  // eslint-disable-next-line no-undef
  const zip = new JSZip();

  const numberOfSlices = getNumberOfSlices();

  console.log('Generating slices...');
  let blob;
  for (let k = 0; k < numberOfSlices; ++k) {
    try {
      blob = generateSlice(
        tags, pixelGeneratorName, numberOfSlices, k, _images
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
      return;
    }
    zip.file(`dwv-generated-slice${k}.dcm`, blob);
  }

  zip.generateAsync({type: 'blob'}).then(function (zipBlob) {
    console.log('Zipping data...');
    const element = document.getElementById('generate');
    element.download = 'dwv-generated.zip';
    element.href = URL.createObjectURL(zipBlob);

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
 * Save the tags as a JSON file.
 */
function onSaveTags() {
  // check validity
  if (!isValidTags()) {
    return;
  }
  // get text from the textarea
  const tagsText = getTagsText();
  // view as Blob to allow download
  const blob = new Blob([tagsText], {type: 'text/plain'});
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
    JSON.parse(getTagsText());
  } catch {
    alert('The JSON is not valid, please check it with JSONLint.');
    return false;
  }
  return true;
}

/**
 * Open JSONLint to check the tags.
 */
function launchJSONLint() {
  const tagsText = getTagsText();
  const link = `http://jsonlint.com/?json=${encodeURIComponent(tagsText)}`;
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
  reader.onload = function (readerEvent) {
    document.getElementById('tags').value = readerEvent.target.result;
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
  if (typeof _pixelGenerators[pixGeneratorName] !== 'undefined') {
    checkTags = _pixelGenerators[pixGeneratorName].checkTags;
  }

  /**
   * Get a reader load event handler.
   *
   * @param {File} file The file that was loaded.
   * @returns {Function} The load handler.
   */
  function getOnReaderLoad(file) {
    return function (loadEvent) {
      const image = new Image();
      image.origin = file.name;
      // check size
      image.onload = function () {
        if (_images.length === 0) {
          // update tags if needed at first image load
          const tags = JSON.parse(getTagsText());
          if (checkTags(tags, this)) {
            alert('Updating tags to input image meta data.');
            document.getElementById('tags').value =
              JSON.stringify(tags, null, 2);
          }
        } else {
          // check all images have equal sizes
          let message;
          if (this.width !== _images[0].width) {
            message = `Image width mismatch between input files: ${
              this.width } != ${_images[0].width}`;
            console.error(message);
            alert(message);
            return;
          }
          if (this.height !== _images[0].height) {
            message = `Image height mismatch between input files: ${
              this.height } != ${_images[0].height}`;
            console.error(message);
            alert(message);
            return;
          }
        }
        // save image
        _images.push(this);
      };
      // set src (triggers load)
      image.src = loadEvent.target.result;
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

// ---------------------------------------------

// launch
setup();
