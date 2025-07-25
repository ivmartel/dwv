import {merge} from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import {webpackCommon} from './webpack.common.js';

export default merge(webpackCommon, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    // web workers public path
    // (generated at root for dev)
    workerPublicPath: '/'
  },
  entry: {
    viewer: './tests/pacs/viewer.js',
    dcmweb: './tests/pacs/dcmweb.js',
    raw: './tests/visual/index.js',
    jpeg: './tests/visual/index-jpeg.js',
    jpeg2000: './tests/visual/index-jpeg2000.js',
    rle: './tests/visual/index-rle.js',
    anonymiser: './tests/dicom/pages/anonymiser.js',
    generator: './tests/dicom/pages/generator.js',
    synthetic: './tests/dicom/pages/synthetic-data.js',
    colourmaps: './tests/image/pages/colourmaps.js'
  },
  devServer: {
    open: '/tests',
    static: [
      {
        directory: './tests',
        publicPath: '/tests'
      },
      {
        directory: './node_modules/jszip',
        publicPath: '/node_modules/jszip'
      },
      {
        directory: './node_modules/lodash',
        publicPath: '/node_modules/lodash'
      },
      {
        directory: './node_modules/benchmark',
        publicPath: '/node_modules/benchmark'
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './tests/dicom/pages/anonymiser.html',
      filename: 'tests/dicom/pages/anonymiser.html',
      scriptLoading: 'module',
      chunks: ['dwv', 'anonymiser']
    }),
    new HtmlWebpackPlugin({
      template: './tests/dicom/pages/generator.html',
      filename: 'tests/dicom/pages/generator.html',
      scriptLoading: 'module',
      chunks: ['dwv', 'generator']
    }),
    new HtmlWebpackPlugin({
      template: './tests/dicom/pages/synthetic-data.html',
      filename: 'tests/dicom/pages/synthetic-data.html',
      scriptLoading: 'module',
      chunks: ['dwv', 'synthetic']
    }),
    new HtmlWebpackPlugin({
      template: './tests/image/pages/colourmaps.html',
      filename: 'tests/image/pages/colourmaps.html',
      scriptLoading: 'module',
      chunks: ['dwv', 'colourmaps']
    }),
    new HtmlWebpackPlugin({
      template: './tests/pacs/dcmweb.html',
      filename: 'tests/pacs/dcmweb.html',
      scriptLoading: 'module',
      chunks: ['dwv', 'dcmweb']
    }),
    new HtmlWebpackPlugin({
      template: './tests/pacs/viewer.html',
      filename: 'tests/pacs/viewer.html',
      scriptLoading: 'module',
      chunks: ['dwv', 'viewer'],
    }),
    new HtmlWebpackPlugin({
      title: 'DWV jpeg DICOM check',
      template: './tests/visual/index.html',
      filename: 'tests/visual/index-jpeg.html',
      scriptLoading: 'module',
      chunks: ['dwv', 'jpeg']
    }),
    new HtmlWebpackPlugin({
      title: 'DWV jpeg2000 DICOM check',
      template: './tests/visual/index.html',
      filename: 'tests/visual/index-jpeg2000.html',
      scriptLoading: 'module',
      chunks: ['dwv', 'jpeg2000']
    }),
    new HtmlWebpackPlugin({
      title: 'DWV rle DICOM check',
      template: './tests/visual/index.html',
      filename: 'tests/visual/index-rle.html',
      scriptLoading: 'module',
      chunks: ['dwv', 'rle']
    }),
    new HtmlWebpackPlugin({
      title: 'DWV raw DICOM check',
      template: './tests/visual/index.html',
      filename: 'tests/visual/index.html',
      scriptLoading: 'module',
      chunks: ['dwv', 'raw'],
    }),
  ],
  module: {
    rules: [
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