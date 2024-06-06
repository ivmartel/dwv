import {logger} from '../utils/logger';
import {
  DicomParser,
  getSyntaxDecompressionName
} from '../dicom/dicomParser';
import {ImageFactory} from './imageFactory';
import {MaskFactory} from './maskFactory';
import {PixelBufferDecoder} from './decoder';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from '../dicom/dataElement';
/* eslint-enable no-unused-vars */

/**
 * Create a View from a DICOM buffer.
 */
export class DicomBufferToView {

  /**
   * Converter options.
   *
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
   * @type {object}
   */
  #pixelDecoder = null;

  // local tmp storage
  #dicomParserStore = [];
  #finalBufferStore = [];
  #decompressedSizes = [];
  #factories = [];

  /**
   * Get the factory associated to input DICOM elements.
   *
   * @param {Object<string, DataElement>} elements The DICOM elements.
   * @returns {ImageFactory|MaskFactory} The associated factory.
   */
  #getFactory(elements) {
    let factory;
    // mask factory for DICOM SEG
    const element = elements['00080060'];
    if (typeof element !== 'undefined') {
      const modality = element.value[0];
      if (modality === 'SEG') {
        factory = new MaskFactory();
      }
    }
    // default image factory
    if (typeof factory === 'undefined') {
      factory = new ImageFactory();
    }
    return factory;
  }

  /**
   * Generate the image object.
   *
   * @param {number} index The data index.
   * @param {string} origin The data origin.
   */
  #generateImage(index, origin) {
    const dataElements = this.#dicomParserStore[index].getDicomElements();
    const factory = this.#factories[index];
    // create the image
    try {
      const image = factory.create(
        dataElements,
        this.#finalBufferStore[index],
        this.#options.numberOfFiles);
      // call onloaditem
      this.onloaditem({
        data: {
          image: image,
          info: dataElements
        },
        source: origin,
        warn: factory.getWarning()
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
      index: event.index,
      source: origin
    });

    const dataIndex = event.index;

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
   * @param {ArrayBuffer} buffer The input data buffer.
   * @param {string} origin The data origin.
   * @param {number} dataIndex The data index.
   */
  convert(buffer, origin, dataIndex) {

    this.onloadstart({
      source: origin,
      index: dataIndex
    });

    // DICOM parser
    const dicomParser = new DicomParser();

    if (typeof this.#options.defaultCharacterSet !== 'undefined') {
      dicomParser.setDefaultCharacterSet(this.#options.defaultCharacterSet);
    }
    // parse the buffer
    let factory;
    try {
      dicomParser.parse(buffer);
      // check elements
      factory = this.#getFactory(dicomParser.getDicomElements());
      factory.checkElements(dicomParser.getDicomElements());
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


    const pixelBuffer = dicomParser.getDicomElements()['7FE00010'].value;
    // help GC: discard pixel buffer from elements
    dicomParser.getDicomElements()['7FE00010'].value = [];
    const syntax = dicomParser.getDicomElements()['00020010'].value[0];
    const algoName = getSyntaxDecompressionName(syntax);
    const needDecompression = (algoName !== null);

    // store
    this.#dicomParserStore[dataIndex] = dicomParser;
    this.#finalBufferStore[dataIndex] = pixelBuffer[0];
    this.#factories[dataIndex] = factory;

    if (needDecompression) {
      // gather pixel buffer meta data
      const bitsAllocated =
        dicomParser.getDicomElements()['00280100'].value[0];
      const pixelRepresentation =
        dicomParser.getDicomElements()['00280103'].value[0];
      const pixelMeta = {
        bitsAllocated: bitsAllocated,
        isSigned: (pixelRepresentation === 1)
      };
      const columnsElement = dicomParser.getDicomElements()['00280011'];
      const rowsElement = dicomParser.getDicomElements()['00280010'];
      if (typeof columnsElement !== 'undefined' &&
        typeof rowsElement !== 'undefined') {
        pixelMeta.sliceSize = columnsElement.value[0] * rowsElement.value[0];
      }
      const samplesPerPixelElement =
        dicomParser.getDicomElements()['00280002'];
      if (typeof samplesPerPixelElement !== 'undefined') {
        pixelMeta.samplesPerPixel = samplesPerPixelElement.value[0];
      }
      const planarConfigurationElement =
        dicomParser.getDicomElements()['00280006'];
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
            index: dataIndex
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
