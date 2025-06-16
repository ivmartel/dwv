import {merge} from 'webpack-merge';

import {webpackCommon} from './webpack.common.js';

export default merge(webpackCommon, {
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  externals: {
    konva: 'konva',
    jszip: 'jszip',
    'magic-wand-tool': 'magic-wand-tool',
  }
});