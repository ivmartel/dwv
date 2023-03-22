const path = require('path');

module.exports = {
  output: {
    filename: 'dwv.min.js',
    library: 'dwv',
    libraryTarget: 'umd',
    globalObject: 'this',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
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
};