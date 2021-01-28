var dwv = dwv || {};
dwv.test = dwv.test || {};

/**
 * Create the colour map image and add it to the document.
 *
 * @param {string} colourMapName The colour map name.
 * @param {object} colourMap The colour map values.
 */
function createImage(colourMapName, colourMap) {
  // default size
  var height = 40;
  var width = 256;
  // create canvas
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var context = canvas.getContext('2d');
  // fill in the image data
  var imageData = context.createImageData(canvas.width, canvas.height);
  var index = 0;
  for (var j = 0; j < canvas.height; ++j) {
    for (var i = 0; i < canvas.width; ++i) {
      index = (i + j * imageData.width) * 4;
      imageData.data[index] = colourMap.red[i];
      imageData.data[index + 1] = colourMap.green[i];
      imageData.data[index + 2] = colourMap.blue[i];
      imageData.data[index + 3] = 0xff;
    }
  }
  // put the image data in the context
  context.putImageData(imageData, 0, 0);

  // html
  var div = document.createElement('div');
  div.id = colourMapName;
  var paragraph = document.createElement('p');
  var link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.appendChild(document.createTextNode(colourMapName));
  // put all together
  paragraph.appendChild(link);
  div.appendChild(paragraph);
  div.appendChild(canvas);
  // add to the document
  document.body.appendChild(div);
}

/**
 * Last minute.
 */
dwv.test.onDOMContentLoadedColourmap = function (/*event*/) {
  createImage('Plain', dwv.image.lut.plain);
  createImage('InvPlain', dwv.image.lut.invPlain);
  createImage('Rainbow', dwv.image.lut.rainbow);
  createImage('Hot', dwv.image.lut.hot);
  createImage('Hot Iron', dwv.image.lut.hot_iron);
  createImage('Pet', dwv.image.lut.pet);
  createImage('Hot Metal Blue', dwv.image.lut.hot_metal_blue);
  createImage('Pet 20 step', dwv.image.lut.pet_20step);
  createImage('Test', dwv.image.lut.test);
};
