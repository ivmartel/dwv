import {
  initDwv,
  addDataLines
} from './appgui.js';

const _data = [
  {
    fileroot: 'osirix-cerebrix',
    origin: 'Osirix',
    path: 'CEREBRIX/Neuro Crane/Axial_T1 - 5352/IM-0001-0100.dcm',
    't-syntax': '1.2.840.10008.1.2.4.91 (jpeg2000)',
    modality: 'SC',
    photo: 'MONOCHROME2',
    bits: '16-16-15',
    'pixel-vr': 'OW',
  },
  {
    fileroot: 'nema-ct1_j2ki',
    origin: 'Nema WG04',
    path: 'compsamples_j2k/IMAGES/J2KI/CT1_J2KI',
    't-syntax': '1.2.840.10008.1.2.4.91 (jpeg2000)',
    modality: 'CT',
    photo: 'MONOCHROME2',
    bits: '16-16-15',
    'pixel-vr': 'OB',
  },
  {
    fileroot: 'nema-us1_j2ki',
    origin: 'Nema WG04',
    path: 'compsamples_j2k/IMAGES/J2KI/US1_J2KI',
    't-syntax': '1.2.840.10008.1.2.4.91 (jpeg2000)',
    modality: 'US',
    photo: 'YBR_ICT (planar=0)',
    bits: '8-8-7',
    'pixel-vr': 'OB',
  },
  {
    fileroot: 'nema-nm1_j2kr',
    origin: 'Nema WG04',
    path: 'compsamples_j2k/IMAGES/J2KR/NM1_J2KR',
    't-syntax': '1.2.840.10008.1.2.4.90 (jpeg2000)',
    modality: 'NM',
    photo: 'MONOCHROME2',
    bits: '16-16-15',
    'pixel-vr': 'OB',
  },
  {
    fileroot: 'nema-vl2_j2kr',
    origin: 'Nema WG04',
    path: 'compsamples_j2k/IMAGES/J2KR/VL2_J2KR',
    't-syntax': '1.2.840.10008.1.2.4.90 (jpeg2000)',
    modality: 'OT',
    photo: 'YBR_RCT (planar=0)',
    bits: '8-8-7',
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
  li0.innerHTML = 'Osirix <a href="http://www.osirix-viewer.com/datasets/">datasets</a>';
  ulSources.appendChild(li0);
  const li1 = document.createElement('li');
  li1.innerHTML = 'Nema WG04 (jpeg2000) <a href="ftp://medical.nema.org/MEDICAL/Dicom/DataSets/WG04/">dataSets</a>';
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
