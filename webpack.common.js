import path from 'path';
import {fileURLToPath} from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const webpackCommon = {
  entry: {
    dwv: './src/index.js'
  },
  output: {
    filename: '[name].min.js',
    chunkFilename: 'assets/workers/[name].min.js',
    library: {
      type: 'module'
    },
    environment: {
      module: true
    },
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  experiments: {
    outputModule: true
  }
};