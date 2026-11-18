import path from 'path';
import {fileURLToPath} from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    viewer: './dev/viewer/viewer.js',
  },
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, '../build/demo'),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './dev/viewer/viewer.html',
      filename: 'viewer.html',
      favicon: './dev/favicon.ico',
      chunks: ['viewer'],
    }),
  ],
};
