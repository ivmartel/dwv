/**
 * Detect if the network is up (do we have connectivity?)
 * @return {boolean}
 */
module.exports = function () {
  return !!navigator.onLine
}
