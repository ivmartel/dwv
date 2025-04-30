import {DicomDataLoader} from './dicomDataLoader.js';
import {JSONTextLoader} from './jsonTextLoader.js';
import {MultipartLoader} from './multipartLoader.js';
import {RawImageLoader} from './rawImageLoader.js';
import {RawVideoLoader} from './rawVideoLoader.js';
import {ZipLoader} from './zipLoader.js';

export const loaderList = [
  DicomDataLoader,
  JSONTextLoader,
  MultipartLoader,
  RawImageLoader,
  RawVideoLoader,
  ZipLoader
];
