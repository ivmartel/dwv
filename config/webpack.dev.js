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
    viewer: './dev/pacs/viewer.js',
    dcmweb: './dev/pacs/dcmweb.js',
    raw: './dev/visual/index.js',
    jpeg: './dev/visual/index-jpeg.js',
    jpeg2000: './dev/visual/index-jpeg2000.js',
    rle: './dev/visual/index-rle.js',
    anonymiser: './dev/dicom/pages/anonymiser.js',
    generator: './dev/dicom/pages/generator.js',
    synthetic: './dev/dicom/pages/synthetic-data.js',
    colourmaps: './dev/image/pages/colourmaps.js'
  },
  devServer: {
    open: '/dev',
    proxy: [
      {
        context: ['/dicom-web'],
        target: 'http://localhost:8042',
        changeOrigin: true,
        auth: 'orthanc:orthanc', // Orthanc username:password
      },
    ],
    static: [
      {
        directory: './dev',
        publicPath: '/dev'
      },
      {
        directory: './tests/data',
        publicPath: '/tests/data'
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
      template: './dev/dicom/pages/anonymiser.html',
      filename: 'dev/dicom/pages/anonymiser.html',
      scriptLoading: 'module',
      chunks: ['anonymiser']
    }),
    new HtmlWebpackPlugin({
      template: './dev/dicom/pages/generator.html',
      filename: 'dev/dicom/pages/generator.html',
      scriptLoading: 'module',
      chunks: ['generator']
    }),
    new HtmlWebpackPlugin({
      template: './dev/dicom/pages/synthetic-data.html',
      filename: 'dev/dicom/pages/synthetic-data.html',
      scriptLoading: 'module',
      chunks: ['synthetic']
    }),
    new HtmlWebpackPlugin({
      template: './dev/image/pages/colourmaps.html',
      filename: 'dev/image/pages/colourmaps.html',
      scriptLoading: 'module',
      chunks: ['colourmaps']
    }),
    new HtmlWebpackPlugin({
      template: './dev/pacs/dcmweb.html',
      filename: 'dev/pacs/dcmweb.html',
      scriptLoading: 'module',
      chunks: ['dcmweb']
    }),
    new HtmlWebpackPlugin({
      template: './dev/pacs/viewer.html',
      filename: 'dev/pacs/viewer.html',
      scriptLoading: 'module',
      chunks: ['viewer'],
    }),
    new HtmlWebpackPlugin({
      title: 'DWV jpeg DICOM check',
      template: './dev/visual/index.html',
      filename: 'dev/visual/index-jpeg.html',
      scriptLoading: 'module',
      chunks: ['jpeg']
    }),
    new HtmlWebpackPlugin({
      title: 'DWV jpeg2000 DICOM check',
      template: './dev/visual/index.html',
      filename: 'dev/visual/index-jpeg2000.html',
      scriptLoading: 'module',
      chunks: ['jpeg2000']
    }),
    new HtmlWebpackPlugin({
      title: 'DWV rle DICOM check',
      template: './dev/visual/index.html',
      filename: 'dev/visual/index-rle.html',
      scriptLoading: 'module',
      chunks: ['rle']
    }),
    new HtmlWebpackPlugin({
      title: 'DWV raw DICOM check',
      template: './dev/visual/index.html',
      filename: 'dev/visual/index.html',
      scriptLoading: 'module',
      chunks: ['raw'],
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