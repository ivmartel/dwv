import {DicomDataLoader} from './dicomDataLoader.js';
import {JSONTextLoader} from './jsonTextLoader.js';
import {MultipartLoader} from './multipartLoader.js';
import {RawImageLoader} from './rawImageLoader.js';
import {RawVideoLoader} from './rawVideoLoader.js';
import {ZipLoader} from './zipLoader.js';

/**
 * Singleton loader list, lazily initialised to break the circular dependency:
 * MultipartLoader → MemoryLoader → loaderList → MultipartLoader.
 * The array is created on the first call to getLoaderList(), at which point
 * all modules have been fully evaluated and every class is defined.
 *
 * @type {Array|null}
 */
let _loaderList = null;

/**
 * Get the list of available data-loader constructors.
 * Always returns the same array instance so callers can mutate it (for
 * example in tests) and have those mutations visible to all consumers.
 *
 * @returns {Array} The list of loader constructors.
 */
export function getLoaderList() {
  if (_loaderList === null) {
    _loaderList = [
      DicomDataLoader,
      JSONTextLoader,
      MultipartLoader,
      RawImageLoader,
      RawVideoLoader,
      ZipLoader
    ];
  }
  return _loaderList;
}
