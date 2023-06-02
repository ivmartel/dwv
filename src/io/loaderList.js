import {DicomDataLoader} from './dicomDataLoader';
import {JSONTextLoader} from './jsonTextLoader';
import {MultipartLoader} from './multipartLoader';
import {RawImageLoader} from './rawImageLoader';
import {RawVideoLoader} from './rawVideoLoader';
import {ZipLoader} from './zipLoader';

export const loaderList = [
  DicomDataLoader,
  JSONTextLoader,
  MultipartLoader,
  RawImageLoader,
  RawVideoLoader,
  ZipLoader
];
