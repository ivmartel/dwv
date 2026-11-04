import {logger} from '../../src/utils/logger.js';
import {
  ViewConfig,
  AppOptions,
  App
} from '../../src/app/application.js';
import {Point} from '../../src/math/point.js';
import {getPixelDataTag} from '../../src/dicom/dicomTag.js';
import {
  getElementsFromSimpleTagValues
} from '../../src/dicom/simpleTagValues.js';
import {DicomWriter} from '../../src/dicom/dicomWriter.js';

/**
 * Orientation check: display a synthetic volume written with all the
 * 24 axis aligned orientations and compare with the expected views.
 *
 * The volume is defined in LPS world coordinates, voxel (x, y, z) at
 * position (x, y, z) mm. Three labelled images are extruded through
 * the whole volume in separate quadrants so that each plane shows its
 * own label (and only stripes of the other ones):
 * - axial label: right, anterior quadrant, extruded along z,
 * - coronal label: left, inferior quadrant, extruded along y,
 * - sagittal label: posterior, superior quadrant, extruded along x.
 * The right, posterior, inferior and left, anterior, superior octants
 * are background.
 */

/**
 * Volume size (number of voxels along each axis).
 */
const size = 96;

/**
 * Half volume size: label image size.
 */
const half = size / 2;

/**
 * Background value.
 */
const background = 64;

/**
 * Check world position: centre of the right, anterior, inferior octant.
 * Any position shows one label per plane.
 */
const checkPosition = [half / 2, half / 2, half / 2];

/**
 * Target orientations, undefined first for the acquisition one.
 */
const targetOrientations = [undefined, 'axial', 'coronal', 'sagittal'];

/**
 * Label images definition: text at the top, bottom, left, right
 *   and centre of the image as displayed.
 */
const labelDefinitions = {
  axial: {top: 'A', bottom: 'P', left: 'R', right: 'L', centre: 'A'},
  coronal: {top: 'S', bottom: 'I', left: 'R', right: 'L', centre: 'C'},
  sagittal: {top: 'S', bottom: 'I', left: 'A', right: 'P', centre: 'S'}
};

/**
 * Create a label image: white square, a dark marker at the top left
 *   corner, black text.
 *
 * @param {object} definition The label definition.
 * @returns {Uint8Array} The label values (half x half).
 */
function createLabel(definition) {
  const canvas = document.createElement('canvas');
  canvas.width = half;
  canvas.height = half;
  const context = canvas.getContext('2d');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, half, half);
  context.fillStyle = '#000';
  context.fillRect(0, 0, 6, 6);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = 'bold 10px Arial';
  context.fillText(definition.top, half / 2, 6);
  context.fillText(definition.bottom, half / 2, half - 6);
  context.fillText(definition.left, 6, half / 2);
  context.fillText(definition.right, half - 6, half / 2);
  context.font = 'bold 24px Arial';
  context.fillText(definition.centre, half / 2, half / 2);

  const rgba = context.getImageData(0, 0, half, half).data;
  const values = new Uint8Array(half * half);
  for (let i = 0; i < values.length; ++i) {
    values[i] = rgba[4 * i];
  }
  return values;
}

/**
 * Get the synthetic volume value at a world voxel position.
 *
 * @param {object} labels The label images.
 * @param {number} x The x position.
 * @param {number} y The y position.
 * @param {number} z The z position.
 * @returns {number} The value.
 */
function getVolumeValue(labels, x, y, z) {
  let value = background;
  if (x < half && y < half) {
    // axial: displayed x to the right, y down
    value = labels.axial[y * half + x];
  } else if (x >= half && z < half) {
    // coronal: displayed x to the right, z up
    value = labels.coronal[(half - 1 - z) * half + (x - half)];
  } else if (y >= half && z >= half) {
    // sagittal: displayed y to the right, z up
    value = labels.sagittal[(size - 1 - z) * half + (y - half)];
  }
  return value;
}

/**
 * Get the expected view of a plane at the check position,
 *   in the standard display.
 *
 * @param {object} labels The label images.
 * @param {string} plane The plane name.
 * @returns {Uint8Array} The view values (size x size).
 */
function getExpectedView(labels, plane) {
  const [px, py, pz] = checkPosition;
  const values = new Uint8Array(size * size);
  for (let v = 0; v < size; ++v) {
    for (let u = 0; u < size; ++u) {
      let value;
      if (plane === 'axial') {
        value = getVolumeValue(labels, u, v, pz);
      } else if (plane === 'coronal') {
        value = getVolumeValue(labels, u, py, size - 1 - v);
      } else {
        value = getVolumeValue(labels, px, u, size - 1 - v);
      }
      values[v * size + u] = value;
    }
  }
  return values;
}

/**
 * Get a canvas showing grey values.
 *
 * @param {Uint8Array} values The values (size x size).
 * @returns {HTMLCanvasElement} The canvas.
 */
function getValuesCanvas(values) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  const imageData = context.createImageData(size, size);
  for (let i = 0; i < values.length; ++i) {
    imageData.data[4 * i] = values[i];
    imageData.data[4 * i + 1] = values[i];
    imageData.data[4 * i + 2] = values[i];
    imageData.data[4 * i + 3] = 255;
  }
  context.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Get the LPS letter of a unit axis vector.
 *
 * @param {number[]} vector The vector.
 * @returns {string} The letter.
 */
function getLetter(vector) {
  const letters = [['R', 'L'], ['A', 'P'], ['I', 'S']];
  const axis = vector.findIndex((value) => value !== 0);
  return letters[axis][vector[axis] > 0 ? 1 : 0];
}

/**
 * Get the cross product of two vectors.
 *
 * @param {number[]} a The first vector.
 * @param {number[]} b The second vector.
 * @returns {number[]} The cross product.
 */
function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

/**
 * Get the list of the 24 axis aligned orientations, grouped by
 *   acquisition plane, the ones with rows along the usual row axis
 *   of the plane first.
 *
 * @returns {object[]} The orientations as {code, plane, row, column,
 *   normal}.
 */
function getOrientations() {
  /* eslint-disable @stylistic/js/array-element-newline */
  const axes = [
    [1, 0, 0], [-1, 0, 0],
    [0, 1, 0], [0, -1, 0],
    [0, 0, 1], [0, 0, -1]
  ];
  /* eslint-enable @stylistic/js/array-element-newline */
  const planes = ['sagittal', 'coronal', 'axial'];
  // usual row axis per plane: x for axial and coronal, y for sagittal
  const usualRowAxis = {axial: 0, coronal: 0, sagittal: 1};
  const orientations = [];
  for (const row of axes) {
    for (const column of axes) {
      const normal = cross(row, column);
      if (normal.every((value) => value === 0)) {
        continue;
      }
      const plane = planes[normal.findIndex((value) => value !== 0)];
      orientations.push({
        code: getLetter(row) + getLetter(column) + getLetter(normal),
        plane,
        isUsual: row[usualRowAxis[plane]] !== 0,
        row,
        column,
        normal
      });
    }
  }
  const planeOrder = ['axial', 'coronal', 'sagittal'];
  orientations.sort((a, b) =>
    planeOrder.indexOf(a.plane) - planeOrder.indexOf(b.plane) ||
    Number(b.isUsual) - Number(a.isUsual) ||
    a.code.localeCompare(b.code));
  return orientations;
}

/**
 * Generate the DICOM buffers of the volume written with
 *   an orientation, one buffer per slice.
 *
 * @param {object} labels The label images.
 * @param {object} orientation The orientation.
 * @param {number} index The series index.
 * @returns {object[]} The list of {data, filename}.
 */
function generateSeries(labels, orientation, index) {
  const {row, column, normal} = orientation;
  // origin: corner of the volume from which all the axes are positive
  const origin = [0, 1, 2].map((axis) =>
    (row[axis] < 0 || column[axis] < 0 || normal[axis] < 0) ? size - 1 : 0);
  const uidRoot = '1.2.826.0.1.3680043.9.7278.1.4444.20261104';
  const writer = new DicomWriter();
  const series = [];
  for (let k = 0; k < size; ++k) {
    const position = origin.map((value, axis) => value + k * normal[axis]);
    const pixels = new Uint8Array(size * size);
    for (let j = 0; j < size; ++j) {
      for (let i = 0; i < size; ++i) {
        const world = position.map((value, axis) =>
          value + i * row[axis] + j * column[axis]);
        pixels[j * size + i] =
          getVolumeValue(labels, world[0], world[1], world[2]);
      }
    }
    const instanceUid = `${uidRoot}.${index}.${k}`;
    const elements = getElementsFromSimpleTagValues({
      TransferSyntaxUID: '1.2.840.10008.1.2.1',
      SOPClassUID: '1.2.840.10008.5.1.4.1.1.4',
      MediaStorageSOPClassUID: '1.2.840.10008.5.1.4.1.1.4',
      SOPInstanceUID: instanceUid,
      MediaStorageSOPInstanceUID: instanceUid,
      StudyInstanceUID: `${uidRoot}.1`,
      SeriesInstanceUID: `${uidRoot}.2.${index}`,
      FrameOfReferenceUID: `${uidRoot}.3`,
      Modality: 'MR',
      PatientName: 'dwv^Orientation',
      PatientID: 'dwv-orientation',
      SeriesDescription: `orientation ${orientation.code}`,
      InstanceNumber: (k + 1).toString(),
      ImageOrientationPatient: row.concat(column),
      ImagePositionPatient: position,
      PixelSpacing: [1, 1],
      SamplesPerPixel: 1,
      PhotometricInterpretation: 'MONOCHROME2',
      Rows: size,
      Columns: size,
      BitsAllocated: 8,
      BitsStored: 8,
      HighBit: 7,
      PixelRepresentation: 0,
      WindowCenter: 128,
      WindowWidth: 256
    });
    const pixelTag = getPixelDataTag();
    elements[pixelTag.getKey()] = {
      tag: pixelTag,
      vr: 'OB',
      vl: pixels.byteLength,
      value: pixels
    };
    series.push({
      data: writer.getBuffer(elements),
      filename: `${orientation.code}-${k}.dcm`
    });
  }
  return series;
}

/**
 * Get a table header cell.
 *
 * @param {string} text The cell text.
 * @returns {HTMLTableCellElement} The cell.
 */
function getHeaderCell(text) {
  const th = document.createElement('th');
  th.appendChild(document.createTextNode(text));
  return th;
}

/**
 * Add the header and expected views rows.
 *
 * @param {HTMLTableElement} table The table.
 * @param {object} labels The label images.
 */
function addExpectedRows(table, labels) {
  const header = document.createElement('tr');
  header.appendChild(getHeaderCell('orientation'));
  for (const target of targetOrientations) {
    header.appendChild(getHeaderCell(target ?? 'no orientation'));
  }
  table.appendChild(header);

  const expected = document.createElement('tr');
  const nameCell = document.createElement('td');
  nameCell.appendChild(document.createTextNode('expected'));
  expected.appendChild(nameCell);
  for (const target of targetOrientations) {
    const td = document.createElement('td');
    if (typeof target !== 'undefined') {
      const div = document.createElement('div');
      div.className = 'reference';
      div.appendChild(getValuesCanvas(getExpectedView(labels, target)));
      td.appendChild(div);
    }
    expected.appendChild(td);
  }
  table.appendChild(expected);
}

/**
 * Add a series row: one app with a layer group per target orientation.
 *
 * @param {HTMLTableElement} table The table.
 * @param {object} labels The label images.
 * @param {object} orientation The orientation.
 * @param {number} index The series index.
 * @param {boolean} viewOnFirstLoadItem The app option.
 */
function addSeriesRow(table, labels, orientation, index,
  viewOnFirstLoadItem) {
  const tr = document.createElement('tr');
  const nameCell = document.createElement('td');
  nameCell.className = 'name';
  nameCell.appendChild(document.createTextNode(
    `${orientation.code} (${orientation.plane})`));
  nameCell.appendChild(document.createElement('br'));
  nameCell.appendChild(document.createTextNode(
    orientation.row.concat(orientation.column).join('\\')));
  tr.appendChild(nameCell);

  const viewConfigs = [];
  for (let t = 0; t < targetOrientations.length; ++t) {
    const td = document.createElement('td');
    const div = document.createElement('div');
    div.id = `layerGroup-${index}-${t}`;
    div.className = 'layerGroup';
    td.appendChild(div);
    tr.appendChild(td);
    const viewConfig = new ViewConfig(div.id);
    viewConfig.orientation = targetOrientations[t];
    viewConfigs.push(viewConfig);
  }
  table.appendChild(tr);

  const options = new AppOptions({'*': viewConfigs});
  options.viewOnFirstLoadItem = viewOnFirstLoadItem;
  const app = new App();
  app.init(options);
  app.addEventListener('load', function (event) {
    if (!viewOnFirstLoadItem) {
      app.getStageController().render(event.detail.dataid);
    }
    // go to check position
    for (const viewConfig of viewConfigs) {
      const viewController = app.getLayerGroupByDivId(viewConfig.divId)
        ?.getActiveViewLayer()?.getViewController();
      viewController?.setCurrentPosition(new Point(checkPosition));
    }
  });
  app.loadImageObject(generateSeries(labels, orientation, index));
}

/**
 * Setup.
 */
function setup() {
  logger.level = logger.levels.WARN;

  const params = new URLSearchParams(window.location.search);
  const viewOnFirstLoadItem = params.get('viewOnFirstLoadItem') !== 'false';
  const checkbox = document.getElementById('viewOnFirstLoadItem');
  checkbox.checked = viewOnFirstLoadItem;
  checkbox.addEventListener('change', function () {
    params.set('viewOnFirstLoadItem', checkbox.checked.toString());
    window.location.search = params.toString();
  });

  const labels = {};
  for (const [plane, definition] of Object.entries(labelDefinitions)) {
    labels[plane] = createLabel(definition);
  }

  const table = document.getElementById('views');
  addExpectedRows(table, labels);
  const orientations = getOrientations();
  for (let i = 0; i < orientations.length; ++i) {
    addSeriesRow(table, labels, orientations[i], i, viewOnFirstLoadItem);
  }
}

// launch
setup();
