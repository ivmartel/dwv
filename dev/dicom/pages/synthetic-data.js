import {
  isMultiSliceModality,
  zipBuffers
} from '../dicomGenerator.js';
import {
  dataStructures,
  getStructureBuffers,
  getStructureNumberOfFiles,
  singleSliceStructure
} from '../dataStructures.js';

/**
 * Setup.
 */
function setup() {
  // create lists
  getFileConfigsHtmlList([
    'synthetic-img',
    'synthetic-seg',
    'synthetic-rtss',
    'synthetic-kos'
  ]);
}

/**
 * Get the object URL of a DICOM buffer.
 *
 * @param {ArrayBuffer} buffer The DICOM buffer.
 * @returns {string} The object URL.
 */
function getDicomObjectUrl(buffer) {
  const blob = new Blob([buffer], {type: 'application/dicom'});
  return URL.createObjectURL(blob);
}

/**
 * Get the test viewer url of DICOM buffers.
 *
 * The viewer runs in the page iframe (named 'dwv-viewer') and loads
 * the object URLs of the buffers, which stay valid as long as this
 * page is open.
 *
 * @param {ArrayBuffer[]} buffers The DICOM buffers.
 * @returns {string} The viewer url.
 */
function getViewUrl(buffers) {
  const urls = buffers.map(getDicomObjectUrl);
  // viewer input, see decodeKeyValueUri in src/utils/uri.js:
  // single url or '?file=url0&file=url1' with a void replace mode
  let input;
  if (urls.length === 1) {
    input = encodeURIComponent(urls[0]);
  } else {
    const query = urls.map((url) => `file=${url}`).join('&');
    input = `${encodeURIComponent(`?${query}`)}&dwvReplaceMode=void`;
  }
  return `../../viewer/viewer.html?input=${input}`;
}

/**
 * Append the links of a data structure to a list element.
 *
 * For viewable images (not SEG, which needs its referenced image),
 * the structure short name (for ex 'mf') opens the data
 * in the test viewer and is followed by a download link; otherwise
 * the structure file name (for ex 'ss.dcm') is the download link.
 * The download is a dcm file for single file structures, a zip file
 * otherwise.
 *
 * @param {HTMLLIElement} li The list element.
 * @param {object} config The data configuration.
 * @param {object} structure The data structure, see
 *   {@link singleSliceStructure} and {@link dataStructures}.
 */
function appendStructureLinks(li, config, structure) {
  const isZip = getStructureNumberOfFiles(structure) !== 1;
  const linkText = `${structure.short}.${isZip ? 'zip' : 'dcm'}`;
  const fileName = `dwv-generated-${config.name}-${linkText}`;

  const downloadLink = document.createElement('a');
  downloadLink.download = fileName;
  downloadLink.title = `Download ${fileName}`;

  let buffers;
  try {
    buffers = getStructureBuffers(
      config, config.tags.TransferSyntaxUID, structure);
    if (isZip) {
      zipBuffers(buffers, function (zipBlob) {
        downloadLink.href = URL.createObjectURL(zipBlob);
      });
    } else {
      downloadLink.href = getDicomObjectUrl(buffers[0]);
    }
  } catch (error) {
    console.log('data:', config.name);
    console.error(error);
  }

  if (typeof buffers !== 'undefined' &&
    isMultiSliceModality(config.tags.Modality)) {
    const viewLink = document.createElement('a');
    viewLink.href = getViewUrl(buffers);
    viewLink.target = 'dwv-viewer';
    viewLink.title = 'Open in the viewer';
    viewLink.appendChild(document.createTextNode(structure.short));
    downloadLink.className = 'icon';
    downloadLink.appendChild(document.createTextNode('\u{1F4BE}'));
    li.append(viewLink, ' ', downloadLink);
  } else {
    downloadLink.appendChild(document.createTextNode(linkText));
    li.append(downloadLink);
  }
}

/**
 * Create list from configs.
 *
 * @param {Array} configs An array of data cofiguration.
 * @returns {HTMLUListElement} The html list element.
 */
function getConfigsHtmlList(configs) {
  const ul = document.createElement('ul');
  for (const config of configs) {
    // list element
    const li = document.createElement('li');
    li.appendChild(document.createTextNode(
      `${config.name}: ${config.tags.SeriesDescription}: `));
    appendStructureLinks(li, config, singleSliceStructure);
    if (isMultiSliceModality(config.tags.Modality)) {
      for (const structure of Object.values(dataStructures)) {
        li.appendChild(document.createTextNode(', '));
        appendStructureLinks(li, config, structure);
      }
    }
    // append to list
    ul.append(li);
  }
  return ul;
}

/**
 * Fetch a single JSON config file.
 *
 * @param {string} fileName The input file name (without extension).
 * @returns {Promise<Array>} The parsed configs.
 */
function fetchFileConfigs(fileName) {
  const url = `/tests/data/${fileName}.json`;
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onerror = function (event) {
      reject(event);
    };
    request.onload = function (/*event*/) {
      resolve(JSON.parse(this.responseText));
    };
    request.send(null);
  });
}

/**
 * Get the list of configs from several files and display them
 * with a download link.
 *
 * @param {string[]} fileNames The input file names (without extension).
 */
function getFileConfigsHtmlList(fileNames) {
  Promise.all(fileNames.map(fetchFileConfigs))
    .then(function (configsPerFile) {
      displayConfigs(configsPerFile.flat());
    })
    .catch(function (error) {
      console.error(error);
    });
}

/**
 * Rename and set the transfer syntax of a clone of the input configs
 * for a given data group, then create their html list.
 *
 * @param {object} configs Synthetic data configuration.
 * @param {object} dataGroup The data group (name, short, syntax,
 *   optional filter).
 * @returns {HTMLUListElement} The html list element.
 */
function renderDataGroup(configs, dataGroup) {
  const groupConfigs = structuredClone(configs);
  for (const config of groupConfigs) {
    // name in json is 'test-img-##', replace test
    //   with the short string of the group
    config.name = dataGroup.short +
      config.name.substring(4);
    // set transfer syntax
    config.tags.TransferSyntaxUID = dataGroup.syntax;
  }
  // optional group filter
  let finalConfigs = groupConfigs;
  if (typeof dataGroup.filter !== 'undefined') {
    finalConfigs = groupConfigs.filter(dataGroup.filter);
  }
  return getConfigsHtmlList(finalConfigs);
}

/**
 * @param {object} configs Synthetic data configuration.
 */
function displayConfigs(configs) {
  const dataGroups = [
    {
      name: 'Synthetic data Implicit VR Little Endian (SILE)',
      short: 'sile',
      syntax: '1.2.840.10008.1.2'
    },
    {
      name: 'Synthetic data Explicit VR Little Endian (SELE)',
      short: 'sele',
      syntax: '1.2.840.10008.1.2.1'
    },
    {
      name: 'Synthetic data Explicit VR Big Endian (SEBE)',
      short: 'sebe',
      syntax: '1.2.840.10008.1.2.2'
    },
    {
      name: 'Synthetic data RLE Lossless (SRLE)',
      short: 'srle',
      syntax: '1.2.840.10008.1.2.5',
      // RLE encoder only supports 8 and 16 bits allocated
      filter(config) {
        return isMultiSliceModality(config.tags.Modality) && (
          config.tags.BitsAllocated === 8 ||
          config.tags.BitsAllocated === 16);
      }
    }
  ];

  // transfer syntax select: one option per data group
  const label = document.createElement('label');
  label.appendChild(document.createTextNode('Transfer syntax: '));
  const select = document.createElement('select');
  for (let index = 0; index < dataGroups.length; ++index) {
    const option = document.createElement('option');
    option.value = index.toString();
    option.appendChild(document.createTextNode(dataGroups[index].name));
    select.append(option);
  }
  label.append(select);

  const list = document.createElement('div');
  const content = document.getElementById('content');
  content.append(label, list);

  // only generate a group when it is selected, to avoid the upfront
  // cost of creating data that may not be needed; keep the generated
  // lists so that switching back does not regenerate them
  const groupLists = new Map();
  /**
   * Show the list of the selected data group.
   */
  function showSelectedGroup() {
    const index = parseInt(select.value, 10);
    if (!groupLists.has(index)) {
      groupLists.set(index, renderDataGroup(configs, dataGroups[index]));
    }
    list.replaceChildren(groupLists.get(index));
  }
  select.addEventListener('change', showSelectedGroup);
  showSelectedGroup();
}

// ---------------------------------------------

// launch
setup();
