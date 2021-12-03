'use strict';

const path = require('path');
const webpack = require('webpack');


module.exports = {
    env : process.env.NODE_ENV,
    entry: {
        app: path.resolve(path.resolve(__dirname, 'examples'), 'bootstrap.js')
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js',
        publicPath: '/'
    },
    stats: {
        colors: true,
        reasons: true
    },
    resolve: {
        extensions: ['', '.js']
    },
    module: {
        loaders: [
            {
                exclude: /(node_modules)/,
                test: /\.js?$/,
                loaders: ['babel']
            }
        ]
    },
    plugins: [
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
            __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
        }),
        new webpack.optimize.OccurenceOrderPlugin()
    ],
    devServer: {
        contentBase: path.resolve(__dirname, 'examples'),
        port: 3000
    },
    devtool: 'eval'
};