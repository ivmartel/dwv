// namespaces
var dwv = dwv || {};
dwv.dicom = dwv.dicom || {};

// List of pixel generators
dwv.dicom.pixelGenerators = dwv.dicom.pixelGenerators || {};

/**
 * Get the DICOM element from a DICOM tags object.
 *
 * @param {object} tags The DICOM tags object.
 * @returns {object} The DICOM elements and the end offset.
 */
dwv.dicom.getElementsFromJSONTags = function (tags) {
  // transfer syntax
  var isImplicit = dwv.dicom.isImplicitTransferSyntax(tags.TransferSyntaxUID);
  // convert JSON to DICOM element object
  var keys = Object.keys(tags);
  var dicomElements = {};
  var dicomElement;
  var name;
  var offset = 128 + 4; // preamble
  var size;
  for (var k = 0, len = keys.length; k < len; ++k) {
    // get the DICOM element definition from its name
    dicomElement = dwv.dicom.getDicomElement(keys[k]);
    // set its value
    size = dwv.dicom.setElementValue(dicomElement, tags[keys[k]], isImplicit);
    // set offsets
    offset += dwv.dicom.getDataElementPrefixByteSize(
      dicomElement.vr, isImplicit);
    dicomElement.startOffset = offset;
    offset += size;
    dicomElement.endOffset = offset;
    // create the tag group/element key
    name = dwv.dicom.getGroupElementKey(
      dicomElement.tag.group, dicomElement.tag.element);
    // store
    dicomElements[name] = dicomElement;
  }
  // return
  return {'elements': dicomElements, 'offset': offset};
};

/**
 * Get the DICOM pixel data from a DICOM tags object.
 *
 * @param {object} tags The DICOM tags object.
 * @param {object} startOffset The start offset of the pixel data.
 * @param {string} pixGeneratorName The name of a pixel generator.
 * @param {number} sliceNumber The slice number.
 * @param {Array} images The images to pass to the generator.
 * @param {number} numberOfSlices The result number of slices.
 * @returns {object} The DICOM pixel data element.
 */
dwv.dicom.generatePixelDataFromJSONTags = function (
  tags, startOffset, pixGeneratorName, sliceNumber, images, numberOfSlices) {

  // default generator
  if (typeof pixGeneratorName === 'undefined') {
    pixGeneratorName = 'gradSquare';
  }

  // check tags
  if (typeof tags.TransferSyntaxUID === 'undefined') {
    throw new Error('Missing transfer syntax for pixel generation.');
  } else if (typeof tags.Rows === 'undefined') {
    throw new Error('Missing number of rows for pixel generation.');
  } else if (typeof tags.Columns === 'undefined') {
    throw new Error('Missing number of columns for pixel generation.');
  } else if (typeof tags.BitsAllocated === 'undefined') {
    throw new Error('Missing BitsAllocated for pixel generation.');
  } else if (typeof tags.PixelRepresentation === 'undefined') {
    throw new Error('Missing PixelRepresentation for pixel generation.');
  } else if (typeof tags.SamplesPerPixel === 'undefined') {
    throw new Error('Missing SamplesPerPixel for pixel generation.');
  } else if (typeof tags.PhotometricInterpretation === 'undefined') {
    throw new Error('Missing PhotometricInterpretation for pixel generation.');
  }

  // extract info from tags
  var isImplicit = dwv.dicom.isImplicitTransferSyntax(tags.TransferSyntaxUID);
  var numberOfRows = tags.Rows;
  var numberOfColumns = tags.Columns;
  var bitsAllocated = tags.BitsAllocated;
  var pixelRepresentation = tags.PixelRepresentation;
  var samplesPerPixel = tags.SamplesPerPixel;
  // trim in case config contains padding
  var photometricInterpretation = tags.PhotometricInterpretation.trim();

  var sliceLength = numberOfRows * numberOfColumns;
  var dataLength = sliceLength * samplesPerPixel;

  // check values
  if (samplesPerPixel !== 1 && samplesPerPixel !== 3) {
    throw new Error(
      'Unsupported SamplesPerPixel for pixel generation: ' +
      samplesPerPixel);
  }
  if ((samplesPerPixel === 1 && !(photometricInterpretation === 'MONOCHROME1' ||
        photometricInterpretation === 'MONOCHROME2')) ||
        (samplesPerPixel === 3 && photometricInterpretation !== 'RGB')) {
    throw new Error(
      'Unsupported PhotometricInterpretation for pixel generation: ' +
      photometricInterpretation + ' with SamplesPerPixel: ' + samplesPerPixel);
  }

  var numberOfSamples = 1;
  var numberOfColourPlanes = 1;
  if (samplesPerPixel === 3) {
    if (typeof tags.PlanarConfiguration === 'undefined') {
      throw new Error('Missing PlanarConfiguration for pixel generation.');
    }
    var planarConfiguration = tags.PlanarConfiguration;
    if (planarConfiguration !== 0 && planarConfiguration !== 1) {
      throw new Error(
        'Unsupported PlanarConfiguration for pixel generation: ' +
        planarConfiguration);
    }
    if (planarConfiguration === 0) {
      numberOfSamples = 3;
    } else {
      numberOfColourPlanes = 3;
    }
  }

  // create pixel array
  var pixels = dwv.dicom.getTypedArray(
    bitsAllocated, pixelRepresentation, dataLength);

  // pixels generator
  if (typeof dwv.dicom.pixelGenerators[pixGeneratorName] === 'undefined') {
    throw new Error('Unknown PixelData generator: ' + pixGeneratorName);
  }
  var GeneratorClass = dwv.dicom.pixelGenerators[pixGeneratorName].generator;
  var generator = new GeneratorClass({
    numberOfColumns: numberOfColumns,
    numberOfRows: numberOfRows,
    numberOfSamples: numberOfSamples,
    numberOfColourPlanes: numberOfColourPlanes,
    photometricInterpretation: photometricInterpretation
  });
  if (typeof generator.setImages !== 'undefined') {
    generator.setImages(images);
  }
  if (typeof generator.setNumberOfSlices !== 'undefined') {
    generator.setNumberOfSlices(numberOfSlices);
  }
  generator.generate(pixels, sliceNumber);

  // create and return the DICOM element
  var vr = 'OW';
  if (bitsAllocated === 8) {
    vr = 'OB';
  }
  var pixVL = dwv.dicom.getDataElementPrefixByteSize(vr, isImplicit) +
       (pixels.BYTES_PER_ELEMENT * dataLength);
  return {
    'tag': {'group': '0x7FE0', 'element': '0x0010'},
    'vr': vr,
    'vl': pixVL,
    'value': pixels,
    'startOffset': startOffset,
    'endOffset': startOffset + pixVL
  };
};

/**
 * Extract the image data from an image.
 *
 * @param {Image} image The image to get the data from.
 * @returns {object} The image data buffer.
 */
dwv.dicom.getImageDataData = function (image) {
  // draw the image in the canvas in order to get its data
  var canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  // get the image data
  var imageData = ctx.getImageData(0, 0, image.width, image.height);
  // data.data
  return imageData.data;
};
