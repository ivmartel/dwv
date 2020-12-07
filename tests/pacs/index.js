var dwv = dwv || {};
dwv.test = dwv.test || {};

var _githubRaw = 'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/';
var _dataDicom = [
  {
    title: 'Baby MRI',
    uri: _githubRaw +
      '?file=bbmri-53323851.dcm&file=bbmri-53323707.dcm' +
      '&file=bbmri-53323563.dcm&file=bbmri-53323419.dcm' +
      '&file=bbmri-53323275.dcm&file=bbmri-53323131.dcm',
    uriargs: '&dwvReplaceMode=void',
    img: 'babymri.png',
    desc: 'Brain MR, 256*256*5, ' +
      'LittleEndianExplicit [1.2.840.10008.1.2.1], bits: 16-12-11'
  },
  {
    title: 'Toutatix',
    uri: _githubRaw +
     '?file=osirix-toutatix-100.dcm&file=osirix-toutatix-101.dcm',
    uriargs: '&dwvReplaceMode=void',
    img: 'toutatix.png',
    desc: 'Chest CT(A), 512*512*1, LittleEndianExplicit' +
      ' [1.2.840.10008.1.2.1], bits: 16-12-11,' +
      ' from the Osirix examples, hosted on the dwv github.'
  },
  {
    title: 'Goudurix',
    uri: _githubRaw + 'osirix-goudurix.dcm',
    img: 'goudurix.png',
    desc: 'Chest CT(A), 512*512*1, LittleEndianImplicit' +
      ' [1.2.840.10008.1.2], bits: 16-12-11,' +
      ' from the Osirix examples, hosted on the dwv github.',
  },
  {
    title: 'US',
    uri: _githubRaw + 'gdcm-US-RGB-8-epicard.dcm',
    img: 'us.png',
    desc: 'US, 640*480*1, BigEndianExplicit' +
      ' [1.2.840.10008.1.2.2], bits: 8-8-7,' +
      ' from the GDCM examples, hosted on the dwv github.',
  },
  {
    title: 'Cerebrix',
    uri: _githubRaw + 'osirix-cerebrix.dcm',
    img: 'cerebrix.png',
    desc: 'Brain SC (Secondary Capture), 176*224*1,' +
      ' JPEG2000 [1.2.840.10008.1.2.4.91], bits: 16-16-15,' +
      ' from the Osirix examples, hosted on the dwv github.',
  },
  {
    title: 'Multiframe',
    uri: _githubRaw + 'multiframe-test1.dcm',
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
 * @param {string} uri The dwv input uri.
 * @returns {string} The full dwv url.
 */
function getDwvUrl(uri) {
  var url = 'viewer.html';
  if (typeof uri !== 'undefined') {
    url += '?input=' + encodeURIComponent(uri);
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
    if (data[i].uriargs) {
      link.href += data[i].uriargs;
    }
    link.className = 'dwvlink';
    link.appendChild(image);

    // list item
    var li = document.createElement('li');
    li.appendChild(link);
    li.appendChild(title);
    li.appendChild(desc);
    var ul = document.getElementById(id);
    ul.appendChild(li);
  }
}

/**
 * Last minute
 */
dwv.test.onDOMContentLoadedPacs = function () {
  createAndPutHtml(_dataDicom, 'ul_datadicom');
  createAndPutHtml(_dataImg, 'ul_dataimg');
};
