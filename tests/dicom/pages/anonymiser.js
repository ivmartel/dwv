// Do not warn if these variables were not defined before.
/* global dwv */

// call setup on DOM loaded
document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

/**
 * Setup.
 */
function onDOMContentLoaded() {
  const infileInput = document.getElementById('infile');
  infileInput.onchange = onInputDICOMFile;
  const inrulesfileInput = document.getElementById('inrulesfile');
  inrulesfileInput.onchange = onInputRulesFile;
  const jsonlintButton = document.getElementById('jsonlint');
  jsonlintButton.onclick = launchJSONLint;
  const saveButton = document.getElementById('save');
  saveButton.onclick = saveRules;
  const generateButton = document.getElementById('generate');
  generateButton.onclick = generate;

  // logger level (optional)
  dwv.logger.level = dwv.logger.levels.DEBUG;
}

// rules file
let _rulesFile = null;
// dicom file
let _dicomFile = null;
// DICOM elements
let _dicomElements = null;

/**
 * Handle DICOM file load.
 *
 * @param {object} event The onload event.
 */
function onLoadDICOMFile(event) {
  // parse DICOM
  const parser = new dwv.DicomParser();
  parser.parse(event.target.result);
  // store elements
  _dicomElements = parser.getDicomElements();
  // activate generate button
  const element = document.getElementById('generate');
  element.className = 'button button-active';
}

/**
 * Generate DICOM data.
 */
function generate() {
  // check validity
  if (!isValidRules()) {
    return;
  }
  // create writer with textarea rules
  const writer = new dwv.DicomWriter();
  const addMissingTags = true;
  writer.setRules(
    JSON.parse(document.getElementById('rules').value),
    addMissingTags);
  let dicomBuffer = null;
  try {
    dicomBuffer = writer.getBuffer(_dicomElements);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
  // view as Blob to allow download
  const blob = new Blob([dicomBuffer], {type: 'application/dicom'});
  // update generate button
  const element = document.getElementById('generate');
  element.href = URL.createObjectURL(blob);
  element.download = 'anonym-' + _dicomFile.name;
}

/**
 * Save the rules as a JSON file.
 */
function saveRules() {
  // check validity
  if (!isValidRules()) {
    return;
  }
  // get text from the textarea
  const text = document.getElementById('rules').value;
  // view as Blob to allow download
  const blob = new Blob([text], {type: 'text/plain'});
  // update save button
  const element = document.getElementById('save');
  element.download = (_rulesFile === null ? 'rules.json' : _rulesFile.name);
  element.href = URL.createObjectURL(blob);
}

/**
 * Is the JSON valid?
 *
 * @returns {boolean} True if the input JSON is valid.
 */
function isValidRules() {
  try {
    JSON.parse(document.getElementById('rules').value);
  } catch (error) {
    alert('The JSON is not valid, please check it with JSONLint.');
    return false;
  }
  return true;
}

/**
 * Open JSONLint to check the rules.
 */
function launchJSONLint() {
  const text = document.getElementById('rules').value;
  const link = 'http://jsonlint.com/?json=' + encodeURIComponent(text);
  window.open(link);
}

/**
 * Handle input DICOM file.
 *
 * @param {object} event The input field event.
 */
function onInputDICOMFile(event) {
  if (event.target.files.length === 0) {
    return;
  }
  _dicomFile = event.target.files[0];
  const reader = new FileReader();
  reader.onload = onLoadDICOMFile;
  reader.readAsArrayBuffer(_dicomFile);
}

/**
 * Handle input rules file.
 *
 * @param {object} event The input field event.
 */
function onInputRulesFile(event) {
  if (event.target.files.length === 0) {
    return;
  }
  _rulesFile = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (event) {
    document.getElementById('rules').value = event.target.result;
  };
  reader.readAsText(_rulesFile);
}
