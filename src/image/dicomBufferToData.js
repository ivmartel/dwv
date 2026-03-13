import {logger} from '../utils/logger.js';
import {safeGet} from '../dicom/dataElement.js';
import {
  DicomParser,
  getSyntaxDecompressionName
} from '../dicom/dicomParser.js';
import {getAnyPixelDataElement} from '../dicom/dicomTag.js';
import {PixelBufferDecoder} from './decoder.js';
import {DicomData} from '../app/dataController.js';

/**
 * List of compatible typed arrays.
 *
 * @typedef {(
 *   Uint8Array | Int8Array |
 *   Uint16Array | Int16Array |
 *   Uint32Array | Int32Array
 * )} TypedArray
 */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  TransferSyntaxUID: '00020010',
  SamplesPerPixel: '00280002',
  PlanarConfiguration: '00280006',
  Rows: '00280010',
  Columns: '00280011',
  BitsAllocated: '00280100',
  PixelRepresentation: '00280103'
};

/**
 * Create a DicomData from a DICOM buffer: parses it, stores the meta data and
 * the image buffer if pixel data is present. Buffer is decoded if needed,
 * only necessary tags for decompression are checked.
 */
export class DicomBufferToData {

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
   * @type {PixelBufferDecoder|undefined}
   */
  #pixelDecoder;

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

  /**
   * Local buffer storage.
   *
   * @type {TypedArray[]}
   */
  #finalBufferStore = [];

  /**
   * Abort flag.
   *
   * @type {boolean}
   */
  #aborted = false;

  /**
   * Generate the data object.
   *
   * @param {number} index The data index.
   * @param {string} origin The data origin.
   */
  #generateData(index, origin) {
    const dataElements = this.#dicomParserStore[index].getDicomElements();
    // create data
    const data = new DicomData(dataElements);
    if (typeof this.#finalBufferStore[index] !== 'undefined') {
      data.buffer = this.#finalBufferStore[index];
    }
    data.numberOfFiles = this.#options.numberOfFiles;

    // call onloaditem
    this.onloaditem({
      data,
      source: origin
    });
  }

  /**
   * Send final events for a succesfull load.
   *
   * @param {number} index The data index.
   * @param {string} origin The data origin.
   */
  #sendFinalEvents(index, origin) {
    if (this.#aborted) {
      return;
    }
    // send 100% progress
    this.onprogress({
      lengthComputable: true,
      loaded: 100,
      total: 100,
      index,
      source: origin
    });
    // send load event
    this.onload({
      source: origin
    });
    // allways send loadend
    this.onloadend({
      source: origin
    });
  }

  /**
   * Setup the pixel decoder.
   *
   * @param {string} algoName The algorithm name.
   */
  #setupPixelDecoder(algoName) {
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

  /**
   * Get the dicom meta used by decoders.
   *
   * @param {number} dataIndex The data index.
   * @returns {object} The DICOM meta data.
   */
  #getPixelMeta(dataIndex) {
    const dataElements = this.#dicomParserStore[dataIndex].getDicomElements();
    const pixelMeta = {missing: []};
    // bits allocated
    const bitsAllocated = safeGet(dataElements, TagKeys.BitsAllocated);
    if (typeof bitsAllocated !== 'undefined') {
      pixelMeta.bitsAllocated = bitsAllocated;
    } else {
      pixelMeta.missing.push('bitsAllocated');
    }
    // pixel reprensentation
    const pixelRepresentation =
      safeGet(dataElements, TagKeys.PixelRepresentation);
    if (typeof pixelRepresentation !== 'undefined') {
      pixelMeta.isSigned = (pixelRepresentation === 1);
    } else {
      pixelMeta.missing.push('pixelRepresentation');
    }
    // slice size
    const columns = safeGet(dataElements, TagKeys.Columns);
    const rows = safeGet(dataElements, TagKeys.Rows);
    if (typeof columns !== 'undefined' &&
      typeof rows !== 'undefined') {
      pixelMeta.sliceSize = columns * rows;
    } else {
      if (typeof columns !== 'undefined') {
        pixelMeta.missing.push('columns');
      }
      if (typeof rows !== 'undefined') {
        pixelMeta.missing.push('rows');
      }
    }
    // samples per pixel
    const samplesPerPixel =
      safeGet(dataElements, TagKeys.SamplesPerPixel);
    if (typeof samplesPerPixel !== 'undefined') {
      pixelMeta.samplesPerPixel = samplesPerPixel;
      // planar configuration
      if (samplesPerPixel !== 1) {
        const planarConfiguration =
          safeGet(dataElements, TagKeys.PlanarConfiguration);
        if (typeof planarConfiguration !== 'undefined') {
          pixelMeta.planarConfiguration = planarConfiguration;
        } else {
          pixelMeta.missing.push('planarConfiguration');
        }
      }
    } else {
      pixelMeta.missing.push('samplesPerPixel');
    }

    return pixelMeta;
  }

  /**
   * Decode and generate data for a compressed buffer.
   *
   * @param {number} dataIndex The data index.
   * @param {string} origin The data origin.
   * @param {TypedArray[]} pixelBuffer The pixel buffer.
   */
  #decodeAndGenerateData(dataIndex, origin, pixelBuffer) {
    // get pixel meta
    const pixelMeta = this.#getPixelMeta(dataIndex);
    // abort if missing data
    if (pixelMeta.missing.length !== 0) {
      // abort
      this.#pixelDecoder.abort();
      // send events
      this.onerror({
        error: new Error(`Missing tags to decompress data:${
          pixelMeta.missing.toString() }`),
        source: origin
      });
      this.onloadend({
        source: origin
      });
      return;
    }

    const numberOfItems = pixelBuffer.length;

    // launch decode
    for (let i = 0; i < numberOfItems; ++i) {
      this.#pixelDecoder.decode(pixelBuffer[i], pixelMeta,
        {
          itemNumber: i,
          numberOfItems,
          index: dataIndex,
          indexOrigin: origin
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
    const dataIndex = event.index;
    const origin = event.indexOrigin;

    // send progress
    this.onprogress({
      lengthComputable: true,
      loaded: event.itemNumber + 1,
      total: event.numberOfItems,
      index: event.index,
      source: origin
    });

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
            logger.error(`Cannot allocate ${
              decodedData.constructor.name
            } of size: ${
              fullSize } (>2^${powerOf2}) for decompressed data.`);
          }
          // abort
          this.#pixelDecoder.abort();
          // send events
          this.onerror({
            error,
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
        logger.warn(`Unsupported varying decompressed data size: ${
          decodedData.length } != ${this.#decompressedSizes[dataIndex]}`);
      }
      // set buffer item data
      this.#finalBufferStore[dataIndex].set(
        decodedData, this.#decompressedSizes[dataIndex] * event.itemNumber);
    } else {
      this.#finalBufferStore[dataIndex] = decodedData;
    }

    // create data for the first item
    if (event.itemNumber === 0) {
      this.#generateData(dataIndex, origin);
    }
  }

  /**
   * Convert an input buffer into DicomData using a DICOM parser. Asynchronous
   * method in case of possible buffer decompression. Get the data
   * from the 'onload' event.
   *
   * @param {TypedArray} buffer The input data buffer.
   * @param {string} origin The data origin.
   * @param {number} dataIndex The data index.
   */
  convert(buffer, origin, dataIndex) {
    this.#aborted = false;
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
    try {
      dicomParser.parse(buffer);
      // check elements
    } catch (error) {
      this.onerror({
        error,
        source: origin
      });
      this.onloadend({
        source: origin
      });
      return;
    }

    // store parser
    this.#dicomParserStore[dataIndex] = dicomParser;

    const elements = dicomParser.getDicomElements();
    const pixelDataElement = getAnyPixelDataElement(elements);
    if (typeof pixelDataElement !== 'undefined') {
      const rawBuffer = pixelDataElement.value;
      // transfer syntax (always there)
      const transferSyntax = safeGet(elements, TagKeys.TransferSyntaxUID);
      const algoName = getSyntaxDecompressionName(transferSyntax);
      if (typeof algoName !== 'undefined') {
        // setup the decoder (one decoder per all converts)
        // TODO check constant algo name?
        if (typeof this.#pixelDecoder === 'undefined') {
          this.#setupPixelDecoder(algoName);
        }
        // decode and generate data (asynchronous)
        this.#decodeAndGenerateData(dataIndex, origin, rawBuffer);
      } else {
        // store buffer
        this.#finalBufferStore[dataIndex] = rawBuffer[0];
        // generate data
        this.#generateData(dataIndex, origin);
        this.#sendFinalEvents(dataIndex, origin);
      }
    } else {
      // non image data -> no buffer
      // generate data
      this.#generateData(dataIndex, origin);
      this.#sendFinalEvents(dataIndex, origin);
    }
  }

  /**
   * Abort a conversion.
   */
  abort() {
    this.#aborted = true;
    // abort decoding, will trigger pixelDecoder.onabort
    if (typeof this.#pixelDecoder !== 'undefined') {
      this.#pixelDecoder.abort();
    } else {
      this.onabort({});
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
