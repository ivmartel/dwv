const path = require('path');

module.exports = {
  entry: {
    dwv: './src/index.js'
  },
  output: {
    filename: '[name].min.js',
    library: '[name]',
    libraryTarget: 'umd',
    globalObject: 'this',
    path: path.resolve(__dirname, 'build/dist'),
    clean: true,
  }
};