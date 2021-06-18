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

  /**
   * Get data from an input buffer using a DICOM parser.
   *
   * @param {Array} buffer The input data buffer.
   * @param {string} origin The data origin.
   * @param {number} dataIndex The data index.
   */
  this.convert = function (buffer, origin, dataIndex) {
    self.onloadstart({
      source: origin
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

    // default
    var finalBuffer = pixelBuffer[0];

    // generate the image
    var generateImage = function (/*event*/) {
      // create the image
      try {
        var image = imageFactory.create(
          dicomParser.getDicomElements(),
          finalBuffer, options.numberOfFiles);
        // call onload
        self.onloaditem({
          data: {
            image: image,
            info: dicomParser.getRawDicomElements()
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
    };

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
      var decompressedSize = null;

      // decoder callback
      var countDecodedItems = 0;
      var onDecodedItem = function (event) {
        ++countDecodedItems;
        // send progress
        self.onprogress({
          lengthComputable: true,
          loaded: (countDecodedItems * 100 / numberOfItems),
          total: 100,
          index: dataIndex,
          source: origin
        });
        // store data
        var itemNb = event.index;
        if (numberOfItems !== 1) {
          // allocate buffer if not done yet
          if (decompressedSize === null) {
            decompressedSize = event.data[0].length;
            finalBuffer = new event.data[0].constructor(
              numberOfItems * decompressedSize);
          }
          // hoping for all items to have the same size...
          if (event.data[0].length !== decompressedSize) {
            dwv.logger.warn('Unsupported varying decompressed data size: ' +
              event.data[0].length + ' != ' + decompressedSize);
          }
          // set buffer item data
          finalBuffer.set(event.data[0], decompressedSize * itemNb);
        } else {
          finalBuffer = event.data[0];
        }
        // create image for the first item
        if (itemNb === 0) {
          generateImage();
        }
      };

      // setup the decoder (one decoder per convert)
      // TODO check if it is ok to create a worker pool per file...
      pixelDecoder = new dwv.image.PixelBufferDecoder(
        algoName, numberOfItems);
      // callbacks
      // pixelDecoder.ondecodestart: nothing to do
      pixelDecoder.ondecodeditem = onDecodedItem;
      pixelDecoder.ondecoded = self.onload;
      pixelDecoder.ondecodeend = self.onloadend;
      pixelDecoder.onerror = self.onerror;
      pixelDecoder.onabort = self.onabort;

      // launch decode
      for (var i = 0; i < numberOfItems; ++i) {
        pixelDecoder.decode(pixelBuffer[i], pixelMeta, i);
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
      generateImage();
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
