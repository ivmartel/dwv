import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    viewer: './tests/pacs/viewer.js',
  },
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, '../build/demo'),
    clean: true,
  },
};