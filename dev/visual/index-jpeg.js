import {
  initDwv,
  addDataLines
} from './appgui.js';

const _data = [
  {
    fileroot: 'leadtools-8BitsJpegLossyGrayScale',
    origin: 'LeadTools',
    path: '8BitsJpegLossyGrayScale.zip',
    't-syntax': '1.2.840.10008.1.2.4.50 (jpeg baseline)',
    modality: 'OT',
    photo: 'MONOCHROME2',
    bits: '8-8-7',
    'pixel-vr': 'OW',
  },
  {
    fileroot: 'nema-mr1_jply',
    origin: 'Nema WG04',
    path: 'compsamples_jpeg/IMAGES/JPLY/MR1_JPLY',
    't-syntax': '1.2.840.10008.1.2.4.51 (jpeg baseline)',
    modality: 'MR',
    photo: 'MONOCHROME2',
    bits: '16-12-11',
    'pixel-vr': 'OB',
  },
  {
    fileroot: 'nema-nm1_jply',
    origin: 'Nema WG04',
    path: 'compsamples_jpeg/IMAGES/JPLY/NM1_JPLY',
    't-syntax': '1.2.840.10008.1.2.4.51 (jpeg baseline)',
    modality: 'NM',
    photo: 'MONOCHROME2',
    bits: '16-12-11',
    'pixel-vr': 'OB',
  },
  {
    fileroot: 'nema-ct1_jpll',
    origin: 'Nema WG04',
    path: 'compsamples_jpeg/IMAGES/JPLL/CT1_JPLL',
    't-syntax': '1.2.840.10008.1.2.4.70 (jpeg lossless)',
    modality: 'CT',
    photo: 'MONOCHROME2',
    bits: '16-16-15',
    'pixel-vr': 'OB',
  },
  {
    fileroot: 'nema-nm1_jpll',
    origin: 'Nema WG04',
    path: 'compsamples_jpeg/IMAGES/JPLL/NM1_JPLL',
    't-syntax': '1.2.840.10008.1.2.4.70 (jpeg lossless)',
    modality: 'NM',
    photo: 'MONOCHROME2',
    bits: '16-16-15',
    'pixel-vr': 'OB',
  }
];

/**
 * Add footer.
 */
function addFooter() {
  const pMissing = document.createElement('p');
  pMissing.innerHTML = '<b>Missing data</b>: ' +
    'JPEG Lossless, Nonhierarchical (Processes 14) (1.2.840.10008.1.2.4.57) ' +
    'and JPEG-LS (not supported)';

  const pSources = document.createElement('p');
  pSources.innerHTML = 'Data sources:';

  const ulSources = document.createElement('ul');
  const li0 = document.createElement('li');
  li0.innerHTML = 'Nema WG04 (jpeg) <a href="ftp://medical.nema.org/MEDICAL/Dicom/DataSets/WG04/">dataSets</a>';
  ulSources.appendChild(li0);
  const li1 = document.createElement('li');
  li1.innerHTML = 'Leadtools datasets hosted at ' +
    '<a href="http://www.creatis.insa-lyon.fr/~jpr/PUBLIC/gdcm/gdcmSampleData/ColorDataSetLeadTool/">creatis</a>';
  ulSources.appendChild(li1);

  const pCreated = document.createElement('p');
  pCreated.innerHTML = 'The left image is created with DWV,' +
    'the right one is a snapshot generated using' +
    ' <a href="https://www.synedra.com">Synedra</a> View Personnal.';

  const div = document.getElementById('footer');
  div.appendChild(pMissing);
  div.appendChild(pSources);
  div.appendChild(ulSources);
  div.appendChild(pCreated);
}

/**
 * Setup.
 */
function setup() {
  initDwv();
  addDataLines(_data);
  addFooter();
}

// ---------------------------------------------

// launch
setup();
