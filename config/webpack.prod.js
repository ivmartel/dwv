import {merge} from 'webpack-merge';

import {webpackCommon} from './webpack.common.js';

export default merge(webpackCommon, {
  mode: 'production',
  devtool: 'source-map',
  externals: {
    konva: 'konva',
    jszip: 'jszip',
    'magic-wand-tool': 'magic-wand-tool',
  }
});