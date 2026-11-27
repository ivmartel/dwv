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
  setupSplitter();
  // create lists
  getFileConfigsHtmlList([
    'synthetic-img',
    'synthetic-seg',
    'synthetic-rtss',
    'synthetic-kos',
    'synthetic-sr'
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
 * For viewable data, the structure short name (for ex 'mf') opens
 * the data in the test viewer and is followed by a download link;
 * otherwise the structure file name (for ex 'ss.dcm') is the
 * download link. Images are viewable; derived data
 * (SEG, RTSTRUCT, SR) are viewable with the buffers of their
 * referenced image, loaded with them in a single load: the app waits
 * for the referenced image before creating SEG and RTSTRUCT data.
 * The download is a dcm file for single file structures, a zip file
 * otherwise. It only contains the data, not its reference.
 *
 * @param {HTMLLIElement} li The list element.
 * @param {object} config The data configuration.
 * @param {object} structure The data structure, see
 *   {@link singleSliceStructure} and {@link dataStructures}.
 * @param {ArrayBuffer[]} [refBuffers] The buffers of the referenced
 *   image of a derived data.
 */
function appendStructureLinks(li, config, structure, refBuffers) {
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

  const isViewable = isMultiSliceModality(config.tags.Modality) ||
    typeof refBuffers !== 'undefined';
  if (typeof buffers !== 'undefined' && isViewable) {
    const viewBuffers = typeof refBuffers !== 'undefined'
      ? refBuffers.concat(buffers) : buffers;
    const viewLink = document.createElement('a');
    viewLink.href = getViewUrl(viewBuffers);
    viewLink.target = 'dwv-viewer';
    viewLink.title = typeof refBuffers !== 'undefined'
      ? 'Open in the viewer with its referenced image'
      : 'Open in the viewer';
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
 * Get the referenced series instance UID of a derived data
 * (SEG, RTSTRUCT or SR) configuration.
 *
 * @param {object} config The data configuration.
 * @returns {string|undefined} The referenced series UID, undefined
 *   for non derived data.
 */
function getReferencedSeriesUid(config) {
  const tags = config.tags;
  let res;
  if (tags.Modality === 'SEG') {
    res = tags.ReferencedSeriesSequence?.value[0]?.SeriesInstanceUID;
  } else if (tags.Modality === 'RTSTRUCT') {
    res = tags.ReferencedFrameOfReferenceSequence?.value[0]
      ?.RTReferencedStudySequence?.value[0]
      ?.RTReferencedSeriesSequence?.value[0]
      ?.SeriesInstanceUID;
  } else if (tags.Modality === 'SR') {
    res = tags.CurrentRequestedProcedureEvidenceSequence?.value[0]
      ?.ReferencedSeriesSequence?.value[0]
      ?.SeriesInstanceUID;
  }
  return res;
}

/**
 * Get the single slice buffers of the image referenced by a derived
 * data (SEG, RTSTRUCT or SR) configuration.
 *
 * @param {object} config The data configuration.
 * @param {Array} configs The list of configurations to search the
 *   referenced image in.
 * @returns {ArrayBuffer[]|undefined} The buffers of the referenced
 *   image, undefined if not found or not derived data.
 */
function getReferencedBuffers(config, configs) {
  const refUid = getReferencedSeriesUid(config);
  if (typeof refUid === 'undefined') {
    return undefined;
  }
  const refConfig = configs.find((item) =>
    isMultiSliceModality(item.tags.Modality) &&
    item.tags.SeriesInstanceUID === refUid);
  if (typeof refConfig === 'undefined') {
    console.warn(`No referenced image for ${config.name}`);
    return undefined;
  }
  let res;
  try {
    res = getStructureBuffers(
      refConfig, refConfig.tags.TransferSyntaxUID, singleSliceStructure);
  } catch (error) {
    console.log('data:', refConfig.name);
    console.error(error);
  }
  return res;
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
    appendStructureLinks(li, config, singleSliceStructure,
      getReferencedBuffers(config, configs));
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

/**
 * Setup the splitter bar that resizes the data list / viewer split.
 */
function setupSplitter() {
  const splitter = document.getElementById('splitter');
  const layout = splitter.parentElement;
  const data = layout.querySelector('.data');
  const minWidth = 100;

  splitter.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    splitter.setPointerCapture(event.pointerId);
    splitter.classList.add('dragging');
    layout.classList.add('resizing');
  });
  splitter.addEventListener('pointermove', (event) => {
    if (!splitter.hasPointerCapture(event.pointerId)) {
      return;
    }
    const layoutRect = layout.getBoundingClientRect();
    const maxWidth = layoutRect.width - splitter.offsetWidth - minWidth;
    const width = Math.min(
      Math.max(event.clientX - layoutRect.left, minWidth), maxWidth);
    data.style.flexBasis = `${width}px`;
  });
  const stopDrag = (event) => {
    splitter.releasePointerCapture(event.pointerId);
    splitter.classList.remove('dragging');
    layout.classList.remove('resizing');
  };
  splitter.addEventListener('pointerup', stopDrag);
  splitter.addEventListener('pointercancel', stopDrag);
}

// launch
setup();
