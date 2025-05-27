import {merge} from 'webpack-merge';
import {webpackCommon} from './webpack.common.js';

export default merge(webpackCommon, {
  mode: 'production',
  devtool: 'source-map',
  // using 'web' target since it creates a bundle
  //   that does not reference 'Document', as opposed to
  //   undefined target (that then uses browserlist)
  target: 'web',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  useBuiltIns: false
                }
              ]
            ]
          }
        }
      }
    ]
  },
  externals: {
    konva: 'konva',
    jszip: 'jszip',
    'magic-wand-tool': 'magic-wand-tool',
  }
});