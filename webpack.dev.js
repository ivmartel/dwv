const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    open: '/tests',
    static: [
      {
        directory: './dist',
        publicPath: 'dist'
      },
      {
        directory: './tests',
        publicPath: '/tests'
      },
      {
        directory: './decoders',
        publicPath: '/decoders'
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './tests/pacs/dcmweb.html',
      filename: 'tests/pacs/dcmweb.html',
    }),
    new HtmlWebpackPlugin({
      template: './tests/pacs/viewer.html',
      filename: 'tests/pacs/viewer.html',
    }),
    new HtmlWebpackPlugin({
      template: './tests/visual/index-jpeg.html',
      filename: 'tests/visual/index-jpeg.html',
    }),
    new HtmlWebpackPlugin({
      template: './tests/visual/index-jpeg2000.html',
      filename: 'tests/visual/index-jpeg2000.html',
    }),
    new HtmlWebpackPlugin({
      template: './tests/visual/index-rle.html',
      filename: 'tests/visual/index-rle.html',
    }),
    new HtmlWebpackPlugin({
      template: './tests/visual/index.html',
      filename: 'tests/visual/index.html',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          // babel loader with istanbul
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
            ],
            plugins: ['istanbul']
          }
        }
      },
      {
        test: /\.png/,
        type: 'asset/resource'
      },
      {
        test: /\.json/,
        type: 'asset/source'
      },
      {
        test: /\.dcm/,
        generator: {
          dataUrl: {
            encoding: 'base64',
            mimetype: 'application/dicom',
          },
        },
        type: 'asset/inline'
      },
      {
        test: /\.zip/,
        generator: {
          dataUrl: {
            encoding: 'base64',
            mimetype: 'application/zip',
          },
        },
        type: 'asset/inline'
      },
      {
        test: /DICOMDIR/,
        generator: {
          dataUrl: {
            encoding: 'base64',
            mimetype: 'application/dicom',
          },
        },
        type: 'asset/inline'
      }
    ]
  }
});