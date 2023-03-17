/**
 * Convert a base64 url to an ArrayBuffer.
 * Something like: 'data:application/dicom;base64,SGVsbG8sIFdvcmxkIQ=='
 * The function is independent from the mime type.
 *
 * @param {String} str Base64 url string.
 * @returns {ArrayBuffer} The corresponding buffer.
 */
export function b64urlToArrayBuffer(str) {
  const parts = str.split(';base64,');
  const byteChars = window.atob(parts[1]);
  var buf = new ArrayBuffer(byteChars.length);
  var bufView = new Uint8Array(buf);
  for (var i = 0, strLen = byteChars.length; i < strLen; i++) {
    bufView[i] = byteChars.charCodeAt(i);
  }
  return buf;
}
