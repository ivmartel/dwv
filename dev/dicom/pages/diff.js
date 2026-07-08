import {DicomParser} from '../../../src/dicom/dicomParser.js';
import {dcmdump} from '../../../src/dicom/dicomElementsWrapper.js';
import {createTwoFilesPatch} from 'diff';
import {Diff2HtmlUI} from 'diff2html/lib-esm/ui/js/diff2html-ui-base.js';

// dcmdump of file 1
let _dump0 = null;
// dcmdump of file 2
let _dump1 = null;
// name of file 1
let _fileName0 = 'file1.dcm';
// name of file 2
let _fileName1 = 'file2.dcm';

/**
 * Setup.
 */
function setup() {
  const infile0Input = document.getElementById('infile0');
  infile0Input.onchange = (event) => onInputDICOMFile(event, 0);
  const infile1Input = document.getElementById('infile1');
  infile1Input.onchange = (event) => onInputDICOMFile(event, 1);
}

/**
 * Handle input DICOM file.
 *
 * @param {object} event The input field event.
 * @param {number} index The file index (0 or 1).
 */
function onInputDICOMFile(event, index) {
  if (event.target.files.length === 0) {
    return;
  }
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (readerEvent) =>
    onLoadDICOMFile(readerEvent, index, file.name);
  reader.readAsArrayBuffer(file);
}

/**
 * Handle DICOM file load.
 *
 * @param {object} event The onload event.
 * @param {number} index The file index (0 or 1).
 * @param {string} fileName The name of the loaded file.
 */
function onLoadDICOMFile(event, index, fileName) {
  const parser = new DicomParser();
  try {
    parser.parse(event.target.result);
  } catch (error) {
    console.error(error);
    alert(`Error parsing DICOM file "${fileName}": ${error.message}`);
    return;
  }
  const dump = dcmdump(parser.getDicomElements());
  if (index === 0) {
    _dump0 = dump;
    _fileName0 = fileName;
  } else {
    _dump1 = dump;
    _fileName1 = fileName;
  }
  updateDiff();
}

/**
 * Update the diff output using the two loaded dumps.
 */
function updateDiff() {
  const output = document.getElementById('output');
  output.innerHTML = '';
  if (_dump0 === null || _dump1 === null) {
    return;
  }
  // use a context covering the full dumps so unchanged tags are shown too
  const maxLines = Math.max(
    _dump0.split('\n').length, _dump1.split('\n').length);
  const patch = createTwoFilesPatch(
    _fileName0, _fileName1, _dump0, _dump1, '', '',
    {context: maxLines});
  const diff2htmlUi = new Diff2HtmlUI(output, patch, {
    drawFileList: false,
    matching: 'none',
    outputFormat: 'side-by-side',
    // no highlight.js instance provided, disable syntax highlighting
    highlight: false
  });
  diff2htmlUi.draw();
}

// ---------------------------------------------

// launch
setup();
