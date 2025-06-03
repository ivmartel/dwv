import {logger} from '../utils/logger.js';
import {
  DicomParser,
  getSyntaxDecompressionName
} from '../dicom/dicomParser.js';
import {ImageFactory} from './imageFactory.js';
import {MaskFactory} from './maskFactory.js';
import {PixelBufferDecoder} from './decoder.js';
import {AnnotationGroupFactory} from './annotationGroupFactory.js';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from '../dicom/dataElement.js';
import {DicomData} from '../app/dataController.js';
/* eslint-enable no-unused-vars */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  TransferSyntaxUID: '00020010',
  FloatPixelData: '7FE00008',
  DoubleFloatPixelData: '7FE00009',
  PixelData: '7FE00010'
};

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
   * @type {PixelBufferDecoder}
   */
  #pixelDecoder = null;

  /**
   * List of dicom parsers.
   *
   * @type {DicomParser[]}
   */
  #dicomParserStore = [];

  /**
   * List of decompressed data sizes.
   *
   * @type {number[]}
   */
  #decompressedSizes = [];

  // local tmp storage
  #finalBufferStore = [];
  #factories = [];

  /**
   * Get the factory associated to input DICOM elements.
   *
   * @param {Object<string, DataElement>} elements The DICOM elements.
   * @returns {ImageFactory|MaskFactory|AnnotationGroupFactory}
   *   The associated factory.
   */
  #getFactory(elements) {
    let factory;

    // mask or annotation
    const modalityElement = elements['00080060'];
    if (typeof modalityElement !== 'undefined') {
      const modality = modalityElement.value[0];
      if (modality === 'SEG') {
        // mask factory for DICOM SEG
        factory = new MaskFactory();
      } else if (modality === 'SR') {
        // annotation factory for DICOM SR
        factory = new AnnotationGroupFactory();
      }
    }

    // default
    if (typeof factory === 'undefined') {
      factory = new ImageFactory();
    }

    return factory;
  }

  /**
   * Generate the data object.
   *
   * @param {number} index The data index.
   * @param {string} origin The data origin.
   * @returns {boolean} True if the generation went ok.
   */
  #generateData(index, origin) {
    const dataElements = this.#dicomParserStore[index].getDicomElements();
    const factory = this.#factories[index];
    // exit if no factory
    if (typeof factory === 'undefined') {
      return false;
    }
    // create data
    try {
      const data = new DicomData(dataElements);
      if (factory instanceof AnnotationGroupFactory) {
        if (typeof factory.checkElements(dataElements) === 'undefined') {
          data.annotationGroup = factory.create(dataElements);
        }
      } else if (factory instanceof MaskFactory) {
        // image creation will be done in data controller
        // if it has access to reference data
        data.buffer = this.#finalBufferStore[index];
      } else {
        data.image = factory.create(
          dataElements,
          this.#finalBufferStore[index],
          this.#options.numberOfFiles);
      }
      // call onloaditem
      this.onloaditem({
        data: data,
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
      // false for error
      return false;
    }

    // all good
    return true;
  }

  /**
   * Generate a single data object.
   *
   * @param {number} index The data index.
   * @param {string} origin The data origin.
   */
  #generateSingleData(index, origin) {
    // generate image
    if (this.#generateData(index, origin)) {
      // send load event
      this.onload({
        source: origin
      });
    }
    // allways send loadend
    this.onloadend({
      source: origin
    });
  }

  /**
   * Generate the image object from an uncompressed buffer.
   *
   * @param {number} index The data index.
   * @param {string} origin The data origin.
   */
  #generateImageUncompressed(index, origin) {
    // send 100% progress
    this.onprogress({
      lengthComputable: true,
      loaded: 100,
      total: 100,
      index: index,
      source: origin
    });
    // generate single data
    this.#generateSingleData(index, origin);
  }

  /**
   * Generate the image object from an compressed buffer.
   *
   * @param {number} index The data index.
   * @param {Array} pixelBuffer The dicom parser.
   * @param {string} algoName The compression algorithm name.
   */
  #generateImageCompressed(index, pixelBuffer, algoName) {
    const dicomParser = this.#dicomParserStore[index];

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

    const numberOfItems = pixelBuffer.length;

    // setup the decoder (one decoder per all converts)
    if (this.#pixelDecoder === null) {
      this.#pixelDecoder = new PixelBufferDecoder(algoName);
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
          index: index
        }
      );
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
      this.#generateData(dataIndex, origin);
    }
  }

  /**
   * Handle non image data.
   *
   * @param {number} index The data index.
   * @param {string} origin The data origin.
   */
  #handleNonImageData(index, origin) {
    // generate single data
    this.#generateSingleData(index, origin);
  }

  /**
   * Handle image data.
   *
   * @param {number} index The data index.
   * @param {string} origin The data origin.
   */
  #handleImageData(index, origin) {
    const dicomParser = this.#dicomParserStore[index];
    const elements = dicomParser.getDicomElements();

    let pixelDataEl = elements[TagKeys.PixelData];
    // maybe float data
    if (typeof pixelDataEl === 'undefined') {
      pixelDataEl = elements[TagKeys.FloatPixelData];
    }
    // maybe double float data
    if (typeof pixelDataEl === 'undefined') {
      pixelDataEl = elements[TagKeys.DoubleFloatPixelData];
    }

    const pixelBuffer = pixelDataEl.value;
    this.#finalBufferStore[index] = pixelBuffer[0];

    // transfer syntax (always there)
    const syntax = elements[TagKeys.TransferSyntaxUID].value[0];
    const algoName = getSyntaxDecompressionName(syntax);
    const needDecompression = typeof algoName !== 'undefined';

    if (needDecompression) {
      // generate image
      this.#generateImageCompressed(
        index,
        pixelBuffer,
        algoName);
    } else {
      this.#generateImageUncompressed(index, origin);
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
    // start event
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

    // store
    this.#dicomParserStore[dataIndex] = dicomParser;
    this.#factories[dataIndex] = factory;

    // handle parsed data
    if (factory instanceof AnnotationGroupFactory) {
      this.#handleNonImageData(dataIndex, origin);
    } else {
      this.#handleImageData(dataIndex, origin);
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
