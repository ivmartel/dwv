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
                  useBuiltIns: 'entry',
                  corejs: '3.22'
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
      commonjs: 'konva',
      commonjs2: 'konva',
      amd: 'konva'
    },
    jszip: {
      commonjs: 'jszip',
      commonjs2: 'jszip',
      amd: 'jszip'
    }
  }
});