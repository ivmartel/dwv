import {logger} from '../utils/logger';
import {
  DicomParser,
  cleanString,
  getSyntaxDecompressionName
} from '../dicom/dicomParser';
import {ImageFactory} from './imageFactory';
import {MaskFactory} from './maskFactory';
import {PixelBufferDecoder} from './decoder';

/**
 * Create a View from a DICOM buffer.
 */
export class DicomBufferToView {

  /**
   * Converter options.
   *
   * @private
   * @type {object}
   */
  #options;

  /**
   * Set the converter options.
   *
   * @param {object} opt The input options.
   */
  setOptions(opt) {
    this.#options = opt;
  }

  /**
   * Pixel buffer decoder.
   * Define only once to allow optional asynchronous mode.
   *
   * @private
   * @type {object}
   */
  #pixelDecoder = null;

  // local tmp storage
  #dicomParserStore = [];
  #finalBufferStore = [];
  #decompressedSizes = [];

  /**
   * Generate the image object.
   *
   * @param {number} index The data index.
   * @param {string} origin The data origin.
   */
  #generateImage(index, origin) {
    const dicomElements = this.#dicomParserStore[index].getRawDicomElements();

    const modality = cleanString(dicomElements['x00080060'].value[0]);
    let factory;
    if (modality && modality === 'SEG') {
      factory = new MaskFactory();
    } else {
      factory = new ImageFactory();
    }

    // create the image
    try {
      const image = factory.create(
        dicomElements,
        this.#finalBufferStore[index],
        this.#options.numberOfFiles);
      // call onloaditem
      this.onloaditem({
        data: {
          image: image,
          info: this.#dicomParserStore[index].getRawDicomElements()
        },
        source: origin
      });
    } catch (error) {
      this.onerror({
        error: error,
        source: origin
      });
      this.onloadend({
        source: origin
      });
    }
  }

  /**
   * Handle a decoded item event.
   *
   * @param {object} event The decoded item event.
   */
  #onDecodedItem(event) {
    // send progress
    this.onprogress({
      lengthComputable: true,
      loaded: event.itemNumber + 1,
      total: event.numberOfItems,
      index: event.dataIndex,
      source: origin
    });

    const dataIndex = event.dataIndex;

    // store decoded data
    const decodedData = event.data[0];
    if (event.numberOfItems !== 1) {
      // allocate buffer if not done yet
      if (typeof this.#decompressedSizes[dataIndex] === 'undefined') {
        this.#decompressedSizes[dataIndex] = decodedData.length;
        const fullSize = event.numberOfItems *
          this.#decompressedSizes[dataIndex];
        try {
          this.#finalBufferStore[dataIndex] =
            new decodedData.constructor(fullSize);
        } catch (error) {
          if (error instanceof RangeError) {
            const powerOf2 = Math.floor(Math.log(fullSize) / Math.log(2));
            logger.error('Cannot allocate ' +
              decodedData.constructor.name +
              ' of size: ' +
              fullSize + ' (>2^' + powerOf2 + ') for decompressed data.');
          }
          // abort
          this.#pixelDecoder.abort();
          // send events
          this.onerror({
            error: error,
            source: origin
          });
          this.onloadend({
            source: origin
          });
          // exit
          return;
        }
      }
      // hoping for all items to have the same size...
      if (decodedData.length !== this.#decompressedSizes[dataIndex]) {
        logger.warn('Unsupported varying decompressed data size: ' +
          decodedData.length + ' != ' + this.#decompressedSizes[dataIndex]);
      }
      // set buffer item data
      this.#finalBufferStore[dataIndex].set(
        decodedData, this.#decompressedSizes[dataIndex] * event.itemNumber);
    } else {
      this.#finalBufferStore[dataIndex] = decodedData;
    }

    // create image for the first item
    if (event.itemNumber === 0) {
      this.#generateImage(dataIndex, origin);
    }
  }

  /**
   * Get data from an input buffer using a DICOM parser.
   *
   * @param {Array} buffer The input data buffer.
   * @param {string} origin The data origin.
   * @param {number} dataIndex The data index.
   */
  convert(buffer, origin, dataIndex) {

    this.onloadstart({
      source: origin,
      dataIndex: dataIndex
    });

    // DICOM parser
    const dicomParser = new DicomParser();
    const imageFactory = new ImageFactory();

    if (typeof this.#options.defaultCharacterSet !== 'undefined') {
      dicomParser.setDefaultCharacterSet(this.#options.defaultCharacterSet);
    }
    // parse the buffer
    try {
      dicomParser.parse(buffer);
      // check elements are good for image
      imageFactory.checkElements(dicomParser.getRawDicomElements());
    } catch (error) {
      this.onerror({
        error: error,
        source: origin
      });
      this.onloadend({
        source: origin
      });
      return;
    }

    const pixelBuffer = dicomParser.getRawDicomElements()['x7FE00010'].value;
    // help GC: discard pixel buffer from elements
    dicomParser.getRawDicomElements()['x7FE00010'].value = [];
    const syntax = cleanString(
      dicomParser.getRawDicomElements()['x00020010'].value[0]);
    const algoName = getSyntaxDecompressionName(syntax);
    const needDecompression = (algoName !== null);

    // store
    this.#dicomParserStore[dataIndex] = dicomParser;
    this.#finalBufferStore[dataIndex] = pixelBuffer[0];

    if (needDecompression) {
      // gather pixel buffer meta data
      const bitsAllocated =
        dicomParser.getRawDicomElements()['x00280100'].value[0];
      const pixelRepresentation =
        dicomParser.getRawDicomElements()['x00280103'].value[0];
      const pixelMeta = {
        bitsAllocated: bitsAllocated,
        isSigned: (pixelRepresentation === 1)
      };
      const columnsElement = dicomParser.getRawDicomElements()['x00280011'];
      const rowsElement = dicomParser.getRawDicomElements()['x00280010'];
      if (typeof columnsElement !== 'undefined' &&
        typeof rowsElement !== 'undefined') {
        pixelMeta.sliceSize = columnsElement.value[0] * rowsElement.value[0];
      }
      const samplesPerPixelElement =
        dicomParser.getRawDicomElements()['x00280002'];
      if (typeof samplesPerPixelElement !== 'undefined') {
        pixelMeta.samplesPerPixel = samplesPerPixelElement.value[0];
      }
      const planarConfigurationElement =
        dicomParser.getRawDicomElements()['x00280006'];
      if (typeof planarConfigurationElement !== 'undefined') {
        pixelMeta.planarConfiguration = planarConfigurationElement.value[0];
      }

      // number of items
      const numberOfItems = pixelBuffer.length;

      // setup the decoder (one decoder per all converts)
      if (this.#pixelDecoder === null) {
        this.#pixelDecoder = new PixelBufferDecoder(
          algoName, numberOfItems);
        // callbacks
        // pixelDecoder.ondecodestart: nothing to do
        this.#pixelDecoder.ondecodeditem = (event) => {
          this.#onDecodedItem(event);
          // send onload and onloadend when all items have been decoded
          if (event.itemNumber + 1 === event.numberOfItems) {
            this.onload(event);
            this.onloadend(event);
          }
        };
        // pixelDecoder.ondecoded: nothing to do
        // pixelDecoder.ondecodeend: nothing to do
        this.#pixelDecoder.onerror = this.onerror;
        this.#pixelDecoder.onabort = this.onabort;
      }

      // launch decode
      for (let i = 0; i < numberOfItems; ++i) {
        this.#pixelDecoder.decode(pixelBuffer[i], pixelMeta,
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
      this.onprogress({
        lengthComputable: true,
        loaded: 100,
        total: 100,
        index: dataIndex,
        source: origin
      });
      // generate image
      this.#generateImage(dataIndex, origin);
      // send load events
      this.onload({
        source: origin
      });
      this.onloadend({
        source: origin
      });
    }
  }

  /**
   * Abort a conversion.
   */
  abort() {
    // abort decoding, will trigger pixelDecoder.onabort
    if (this.#pixelDecoder) {
      this.#pixelDecoder.abort();
    }
  }

  /**
   * Handle a load start event.
   * Default does nothing.
   *
   * @param {object} _event The load start event.
   */
  onloadstart(_event) {}

  /**
   * Handle a load item event.
   * Default does nothing.
   *
   * @param {object} _event The load item event.
   */
  onloaditem(_event) {}

  /**
   * Handle a load progress event.
   * Default does nothing.
   *
   * @param {object} _event The progress event.
   */
  onprogress(_event) {}

  /**
   * Handle a load event.
   * Default does nothing.
   *
   * @param {object} _event The load event fired
   *   when a file has been loaded successfully.
   */
  onload(_event) {}
  /**
   * Handle a load end event.
   * Default does nothing.
   *
   * @param {object} _event The load end event fired
   *  when a file load has completed, successfully or not.
   */
  onloadend(_event) {}

  /**
   * Handle an error event.
   * Default does nothing.
   *
   * @param {object} _event The error event.
   */
  onerror(_event) {}

  /**
   * Handle an abort event.
   * Default does nothing.
   *
   * @param {object} _event The abort event.
   */
  onabort(_event) {}

} // class DicomBufferToView
