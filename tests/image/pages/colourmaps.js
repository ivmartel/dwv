
import {luts} from '../../../src/image/luts.js';

/**
 * Setup.
 */
function setup() {
  createImage('Plain', luts.plain);
  createImage('InvPlain', luts.invPlain);
  createImage('Rainbow', luts.rainbow);
  createImage('Hot', luts.hot);
  createImage('Hot Iron', luts.hot_iron);
  createImage('Pet', luts.pet);
  createImage('Hot Metal Blue', luts.hot_metal_blue);
  createImage('Pet 20 step', luts.pet_20step);
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

// ---------------------------------------------

// launch
setup();
