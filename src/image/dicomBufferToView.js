// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Create a dwv.image.View from a DICOM buffer.
 *
 * @class
 */
dwv.image.DicomBufferToView = function () {
  // closure to self
  var self = this;

  /**
   * Converter options.
   *
   * @private
   * @type {object}
   */
  var options;

  /**
   * Set the converter options.
   *
   * @param {object} opt The input options.
   */
  this.setOptions = function (opt) {
    options = opt;
  };

  /**
   * Pixel buffer decoder.
   * Define only once to allow optional asynchronous mode.
   *
   * @private
   * @type {object}
   */
  var pixelDecoder = null;

  // local tmp storage
  var dicomParserStore = [];
  var finalBufferStore = [];
  var decompressedSizes = [];

  /**
   * Generate the image object.
   *
   * @param {number} index The data index.
   * @param {string} origin The data origin.
   */
  function generateImage(index, origin) {
    // create the image
    try {
      var imageFactory = new dwv.ImageFactory();
      var image = imageFactory.create(
        dicomParserStore[index].getDicomElements(),
        finalBufferStore[index],
        options.numberOfFiles);
      // call onloaditem
      self.onloaditem({
        data: {
          image: image,
          info: dicomParserStore[index].getRawDicomElements()
        },
        source: origin
      });
    } catch (error) {
      self.onerror({
        error: error,
        source: origin
      });
      self.onloadend({
        source: origin
      });
    }
  }

  /**
   * Handle a decoded item event.
   *
   * @param {object} event The decoded item event.
   */
  function onDecodedItem(event) {
    // send progress
    self.onprogress({
      lengthComputable: true,
      loaded: event.itemNumber + 1,
      total: event.numberOfItems,
      index: event.dataIndex,
      source: origin
    });

    var dataIndex = event.dataIndex;

    // store decoded data
    var decodedData = event.data[0];
    if (event.numberOfItems !== 1) {
      // allocate buffer if not done yet
      if (typeof decompressedSizes[dataIndex] === 'undefined') {
        decompressedSizes[dataIndex] = decodedData.length;
        // TODO Handle max allocation size
        finalBufferStore[dataIndex] = new decodedData.constructor(
          event.numberOfItems * decompressedSizes[dataIndex]);
      }
      // hoping for all items to have the same size...
      if (decodedData.length !== decompressedSizes[dataIndex]) {
        dwv.logger.warn('Unsupported varying decompressed data size: ' +
          decodedData.length + ' != ' + decompressedSizes[dataIndex]);
      }
      // set buffer item data
      finalBufferStore[dataIndex].set(
        decodedData, decompressedSizes[dataIndex] * event.itemNumber);
    } else {
      finalBufferStore[dataIndex] = decodedData;
    }

    // create image for the first item
    if (event.itemNumber === 0) {
      generateImage(dataIndex, origin);
    }
  }

  /**
   * Get data from an input buffer using a DICOM parser.
   *
   * @param {Array} buffer The input data buffer.
   * @param {string} origin The data origin.
   * @param {number} dataIndex The data index.
   */
  this.convert = function (buffer, origin, dataIndex) {
    self.onloadstart({
      source: origin,
      dataIndex: dataIndex
    });

    // DICOM parser
    var dicomParser = new dwv.dicom.DicomParser();
    var imageFactory = new dwv.ImageFactory();

    if (typeof options.defaultCharacterSet !== 'undefined') {
      dicomParser.setDefaultCharacterSet(options.defaultCharacterSet);
    }
    // parse the buffer
    try {
      dicomParser.parse(buffer);
      // check elements are good for image
      imageFactory.checkElements(dicomParser.getDicomElements());
    } catch (error) {
      self.onerror({
        error: error,
        source: origin
      });
      self.onloadend({
        source: origin
      });
      return;
    }

    var pixelBuffer = dicomParser.getRawDicomElements().x7FE00010.value;
    // help GC: discard pixel buffer from elements
    dicomParser.getRawDicomElements().x7FE00010.value = [];
    var syntax = dwv.dicom.cleanString(
      dicomParser.getRawDicomElements().x00020010.value[0]);
    var algoName = dwv.dicom.getSyntaxDecompressionName(syntax);
    var needDecompression = (algoName !== null);

    // store
    dicomParserStore[dataIndex] = dicomParser;
    finalBufferStore[dataIndex] = pixelBuffer[0];

    if (needDecompression) {
      // gather pixel buffer meta data
      var bitsAllocated = dicomParser.getRawDicomElements().x00280100.value[0];
      var pixelRepresentation =
        dicomParser.getRawDicomElements().x00280103.value[0];
      var pixelMeta = {
        bitsAllocated: bitsAllocated,
        isSigned: (pixelRepresentation === 1)
      };
      var columnsElement = dicomParser.getRawDicomElements().x00280011;
      var rowsElement = dicomParser.getRawDicomElements().x00280010;
      if (typeof columnsElement !== 'undefined' &&
        typeof rowsElement !== 'undefined') {
        pixelMeta.sliceSize = columnsElement.value[0] * rowsElement.value[0];
      }
      var samplesPerPixelElement = dicomParser.getRawDicomElements().x00280002;
      if (typeof samplesPerPixelElement !== 'undefined') {
        pixelMeta.samplesPerPixel = samplesPerPixelElement.value[0];
      }
      var planarConfigurationElement =
        dicomParser.getRawDicomElements().x00280006;
      if (typeof planarConfigurationElement !== 'undefined') {
        pixelMeta.planarConfiguration = planarConfigurationElement.value[0];
      }

      // number of items
      var numberOfItems = pixelBuffer.length;

      // setup the decoder (one decoder per all converts)
      if (pixelDecoder === null) {
        pixelDecoder = new dwv.image.PixelBufferDecoder(
          algoName, numberOfItems);
        // callbacks
        // pixelDecoder.ondecodestart: nothing to do
        pixelDecoder.ondecodeditem = function (event) {
          onDecodedItem(event);
          // send onload and onloadend when all items have been decoded
          if (event.itemNumber + 1 === event.numberOfItems) {
            self.onload(event);
            self.onloadend(event);
          }
        };
        // pixelDecoder.ondecoded: nothing to do
        // pixelDecoder.ondecodeend: nothing to do
        pixelDecoder.onerror = self.onerror;
        pixelDecoder.onabort = self.onabort;
      }

      // launch decode
      for (var i = 0; i < numberOfItems; ++i) {
        pixelDecoder.decode(pixelBuffer[i], pixelMeta,
          {
            itemNumber: i,
            numberOfItems: numberOfItems,
            dataIndex: dataIndex
          }
        );
      }
    } else {
      // no decompression
      // send progress
      self.onprogress({
        lengthComputable: true,
        loaded: 100,
        total: 100,
        index: dataIndex,
        source: origin
      });
      // generate image
      generateImage(dataIndex, origin);
      // send load events
      self.onload({
        source: origin
      });
      self.onloadend({
        source: origin
      });
    }
  };

  /**
   * Abort a conversion.
   */
  this.abort = function () {
    // abort decoding, will trigger pixelDecoder.onabort
    if (pixelDecoder) {
      pixelDecoder.abort();
    }
  };
};

/**
 * Handle a load start event.
 * Default does nothing.
 *
 * @param {object} _event The load start event.
 */
dwv.image.DicomBufferToView.prototype.onloadstart = function (_event) {};
/**
 * Handle a load item event.
 * Default does nothing.
 *
 * @param {object} _event The load item event.
 */
dwv.image.DicomBufferToView.prototype.onloaditem = function (_event) {};
/**
 * Handle a load progress event.
 * Default does nothing.
 *
 * @param {object} _event The progress event.
 */
dwv.image.DicomBufferToView.prototype.onprogress = function (_event) {};
/**
 * Handle a load event.
 * Default does nothing.
 *
 * @param {object} _event The load event fired
 *   when a file has been loaded successfully.
 */
dwv.image.DicomBufferToView.prototype.onload = function (_event) {};
/**
 * Handle a load end event.
 * Default does nothing.
 *
 * @param {object} _event The load end event fired
 *  when a file load has completed, successfully or not.
 */
dwv.image.DicomBufferToView.prototype.onloadend = function (_event) {};
/**
 * Handle an error event.
 * Default does nothing.
 *
 * @param {object} _event The error event.
 */
dwv.image.DicomBufferToView.prototype.onerror = function (_event) {};
/**
 * Handle an abort event.
 * Default does nothing.
 *
 * @param {object} _event The abort event.
 */
dwv.image.DicomBufferToView.prototype.onabort = function (_event) {};
