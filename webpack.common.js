const path = require('path');

module.exports = {
  output: {
    filename: 'dwv.min.js',
    library: 'dwv',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
};