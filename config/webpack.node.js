import {merge} from 'webpack-merge';

import {webpackCommon} from './webpack.common.js';

export default merge(webpackCommon, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: '[name].node.min.js',
    clean: false,
  },
  target: 'node',
  externals: {
    konva: 'konva',
    jszip: 'jszip',
    'magic-wand-tool': 'magic-wand-tool',
  }
});