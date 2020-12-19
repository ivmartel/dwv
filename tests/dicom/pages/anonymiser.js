var dwv = dwv || {};
dwv.test = dwv.test || {};

// rules file
var _rulesFile = null;
// dicom file
var _dicomFile = null;
// DICOM elements
var _dicomElements = null;

/**
 * Handle DICOM file load
 *
 * @param {object} event The onload event.
 */
function onLoadDICOMFile(event) {
  // parse DICOM
  var parser = new dwv.dicom.DicomParser();
  parser.parse(event.target.result);
  // store elements
  _dicomElements = parser.getRawDicomElements();
  // activate generate button
  var element = document.getElementById('generate');
  element.className = 'button button-active';
}

/**
 * Generate DICOM data
 */
dwv.test.generate = function () {
  // check validity
  if (!isValidRules()) {
    return;
  }
  // create writer with textarea rules
  var writer = new dwv.dicom.DicomWriter();
  writer.rules = JSON.parse(document.getElementById('rules').value);
  var dicomBuffer = null;
  try {
    dicomBuffer = writer.getBuffer(_dicomElements);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
  // view as Blob to allow download
  var blob = new Blob([dicomBuffer], {type: 'application/dicom'});
  // update generate button
  var element = document.getElementById('generate');
  element.href = URL.createObjectURL(blob);
  element.download = 'anonym-' + _dicomFile.name;
};

/**
 * Save the rules as a JSON file.
 */
dwv.test.saveRules = function () {
  // check validity
  if (!isValidRules()) {
    return;
  }
  // get text from the textarea
  var text = document.getElementById('rules').value;
  // view as Blob to allow download
  var blob = new Blob([text], {type: 'text/plain'});
  // update save button
  var element = document.getElementById('save');
  element.download = (_rulesFile === null ? 'rules.json' : _rulesFile.name);
  element.href = URL.createObjectURL(blob);
};

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
 * open JSONLint to check the rules
 */
dwv.test.launchJSONLint = function () {
  var text = document.getElementById('rules').value;
  var link = 'http://jsonlint.com/?json=' + encodeURIComponent(text);
  window.open(link);
};

/**
 * handle input DICOM file
 *
 * @param {object} event The input field event.
 */
dwv.test.onInputDICOMFile = function (event) {
  if (event.target.files.length === 0) {
    return;
  }
  _dicomFile = event.target.files[0];
  var reader = new FileReader();
  reader.onload = onLoadDICOMFile;
  reader.readAsArrayBuffer(_dicomFile);
};

/**
 *  handle input rules file
 *
 * @param {object} event The input field event.
 */
dwv.test.onInputRulesFile = function (event) {
  if (event.target.files.length === 0) {
    return;
  }
  _rulesFile = event.target.files[0];
  var reader = new FileReader();
  reader.onload = function (event) {
    document.getElementById('rules').value = event.target.result;
  };
  reader.readAsText(_rulesFile);
};
