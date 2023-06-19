const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.m?js$/,
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
    konva: {
      root: 'Konva',
      commonjs: 'konva',
      commonjs2: 'konva',
      amd: 'konva'
    },
    jszip: {
      root: 'JSZip',
      commonjs: 'jszip',
      commonjs2: 'jszip',
      amd: 'jszip'
    },
    'magic-wand-tool': {
      root: 'MagicWand',
      commonjs: 'magic-wand-tool',
      commonjs2: 'magic-wand-tool',
      amd: 'konmagic-wand-tool',
    }
  }
});