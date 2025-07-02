import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const webpackCommon = {
  entry: {
    dwv: './src/index.js'
  },
  output: {
    // main bundle output
    filename: '[name].min.js',
    // web workers output
    chunkFilename: 'assets/workers/[name].min.js',
    library: {
      type: 'module'
    },
    environment: {
      module: true
    },
    path: path.resolve(__dirname, '../dist'),
    // clean output folder at each build
    clean: true,
    // web workers public path
    // (otherwise clients use file:// scheme creating CORS error)
    workerPublicPath: './'
  },
  experiments: {
    // module is still experimental
    outputModule: true
  }
};