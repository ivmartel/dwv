var dwv = dwv || {};
dwv.test = dwv.test || {};

var _githubRaw = 'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/';
var _dataDicom = [
  {
    title: 'Baby MRI',
    uri: {
      type: 'dwvtest',
      file: '?file=bbmri-53323851.dcm&file=bbmri-53323707.dcm' +
      '&file=bbmri-53323563.dcm&file=bbmri-53323419.dcm' +
      '&file=bbmri-53323275.dcm&file=bbmri-53323131.dcm',
      args: '&dwvReplaceMode=void'
    },
    img: 'babymri.png',
    desc: 'Brain MR, 256*256*5, ' +
      'LittleEndianExplicit [1.2.840.10008.1.2.1], bits: 16-12-11'
  },
  {
    title: 'Toutatix',
    uri: {
      type: 'dwvtest',
      file: '?file=osirix-toutatix-100.dcm&file=osirix-toutatix-101.dcm',
      args: '&dwvReplaceMode=void'
    },
    img: 'toutatix.png',
    desc: 'Chest CT(A), 512*512*1, LittleEndianExplicit' +
      ' [1.2.840.10008.1.2.1], bits: 16-12-11,' +
      ' from the Osirix examples, hosted on the dwv github.'
  },
  {
    title: 'Goudurix',
    uri: {
      type: 'dwvtest',
      file: 'osirix-goudurix.dcm'
    },
    img: 'goudurix.png',
    desc: 'Chest CT(A), 512*512*1, LittleEndianImplicit' +
      ' [1.2.840.10008.1.2], bits: 16-12-11,' +
      ' from the Osirix examples, hosted on the dwv github.',
  },
  {
    title: 'US',
    uri: {
      type: 'dwvtest',
      file: 'gdcm-US-RGB-8-epicard.dcm'
    },
    img: 'us.png',
    desc: 'US, 640*480*1, BigEndianExplicit' +
      ' [1.2.840.10008.1.2.2], bits: 8-8-7,' +
      ' from the GDCM examples, hosted on the dwv github.',
  },
  {
    title: 'Cerebrix',
    uri: {
      type: 'dwvtest',
      file: 'osirix-cerebrix.dcm'
    },
    img: 'cerebrix.png',
    desc: 'Brain SC (Secondary Capture), 176*224*1,' +
      ' JPEG2000 [1.2.840.10008.1.2.4.91], bits: 16-16-15,' +
      ' from the Osirix examples, hosted on the dwv github.',
  },
  {
    title: 'Multiframe',
    uri: {
      type: 'dwvtest',
      file: 'multiframe-test1.dcm'
    },
    img: 'multiframe-test1.png',
    desc: 'Heart MR, 256*256*1*16, LittleEndianExplicit' +
      ' [1.2.840.10008.1.2.1], bits: 8-8-7,' +
      ' contributed by @yulia-tue, hosted on the dwv github.',
  }
];

var _dataImg = [
  {
    title: 'JPEG',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c6/PET-image.jpg',
    img: 'brainpet-jpg.png',
    desc: 'Brain PET from wikipedia' +
      ' (https://en.wikipedia.org/wiki/File:PET-image.jpg), 531*600*1.'
  },
  {
    title: 'PNG',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Brain_MRI_112010_rgbca.png',
    img: 'brainmri-png.png',
    desc: 'Brain MRI from wikipedia' +
      ' (https://en.wikipedia.org/wiki/File:Brain_MRI_112010_rgbca.png), 389*504*1.'
  },
  {
    title: 'JPG',
    uri: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Acute_leukemia-ALL.jpg',
    img: 'acute_leukemia.png',
    desc: 'Acute Leukimia from wikipedia' +
      ' (https://en.wikipedia.org/wiki/File:Acute_leukemia-ALL.jpg), 347*395*1.'
  }
];

/**
 * Get the dwv url from a data input uri.
 *
 * @param {*} uri The dwv input uri.
 * @returns {string} The full dwv url.
 */
function getDwvUrl(uri) {
  var uricomp = null;
  if (typeof uri.type !== 'undefined') {
    uricomp = uri.file;
    if (uri.type === 'dwvtest') {
      var localChk = document.getElementById('islocal');
      var islocal = localChk ? localChk.checked : true;
      var uriroot = '';
      if (islocal) {
        uriroot = '../';
      } else {
        uriroot = _githubRaw;
      }
      uricomp = uriroot + 'data/' + uri.file;
    }
  } else {
    uricomp = uri;
  }

  var uriargs = '';
  if (typeof uri.args !== 'undefined') {
    uriargs = uri.args;
  }

  var url = 'viewer.html';
  if (typeof uri !== 'undefined') {
    url += '?input=' + encodeURIComponent(uricomp) + uriargs;
  }
  return url;
}

/**
 * Create and append html.
 *
 * @param {object} data Data configuration object.
 * @param {string} id The html list element.
 */
function createAndPutHtml(data, id) {
  for (var i = 0; i < data.length; ++i) {
    // image
    var image = document.createElement('img');
    image.src = './images/' + data[i].img;
    // title
    var title = document.createElement('h2');
    title.appendChild(document.createTextNode(data[i].title));
    // description
    var desc = document.createElement('p');
    desc.appendChild(document.createTextNode(data[i].desc));
    if (data[i].comment) {
      var comment = document.createElement('b');
      comment.appendChild(document.createTextNode(' ' + data[i].comment));
      desc.appendChild(comment);
    }

    // link
    var link = document.createElement('a');
    link.href = getDwvUrl(data[i].uri);
    link.id = i;
    link.className = 'dwvlink ' + id;
    link.appendChild(image);

    // list item
    var li = document.createElement('li');
    li.appendChild(link);
    li.appendChild(title);
    li.appendChild(desc);
    var ul = document.getElementById('ul_' + id);
    ul.appendChild(li);
  }
}

/**
 * Update dicom links on checkbox change.
 */
function onLocalChkChange() {
  var links = document.getElementsByClassName('datadicom');
  for (var i = 0; i < links.length; ++i) {
    links[i].href = getDwvUrl(_dataDicom[links[i].id].uri);
  }
}

/**
 * Last minute
 */
dwv.test.onDOMContentLoadedPacs = function () {
  createAndPutHtml(_dataDicom, 'datadicom');
  createAndPutHtml(_dataImg, 'dataimg');

  var localChk = document.getElementById('islocal');
  localChk.addEventListener('change', onLocalChkChange);
};
