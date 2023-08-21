// Do not warn if these variables were not defined before.
/* global dwv */

// call setup on DOM loaded
document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

/**
 * Setup.
 */
function onDOMContentLoaded() {
  createImage('Plain', dwv.luts.plain);
  createImage('InvPlain', dwv.luts.invPlain);
  createImage('Rainbow', dwv.luts.rainbow);
  createImage('Hot', dwv.luts.hot);
  createImage('Hot Iron', dwv.luts.hot_iron);
  createImage('Pet', dwv.luts.pet);
  createImage('Hot Metal Blue', dwv.luts.hot_metal_blue);
  createImage('Pet 20 step', dwv.luts.pet_20step);
}

/**
 * Create the colour map image and add it to the document.
 *
 * @param {string} colourMapName The colour map name.
 * @param {object} colourMap The colour map values.
 */
function createImage(colourMapName, colourMap) {
  // default size
  const height = 40;
  const width = 256;
  // create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  // fill in the image data
  const imageData = context.createImageData(canvas.width, canvas.height);
  let index = 0;
  for (let j = 0; j < canvas.height; ++j) {
    for (let i = 0; i < canvas.width; ++i) {
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
  const div = document.createElement('div');
  div.id = colourMapName;
  const paragraph = document.createElement('p');
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.appendChild(document.createTextNode(colourMapName));
  // put all together
  paragraph.appendChild(link);
  div.appendChild(paragraph);
  div.appendChild(canvas);
  // add to the document
  document.body.appendChild(div);
}
