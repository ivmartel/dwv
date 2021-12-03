var path = require('path')

function createPattern (pattern) {
  return {
    pattern: pattern,
    included: true,
    served: true,
    watched: false
  }
}

function initQUnit (files) {
  files.unshift(createPattern(path.join(__dirname, 'adapter.js')))
  files.unshift(createPattern(require.resolve('qunit')))
  files.unshift(createPattern(require.resolve('qunit/qunit/qunit.css')))
}

initQUnit.$inject = ['config.files']

module.exports = {
  'framework:qunit': ['factory', initQUnit]
}
