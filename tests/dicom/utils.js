/**
 * Convert a base64 url to an ArrayBuffer.
 * Something like: 'data:application/dicom;base64,SGVsbG8sIFdvcmxkIQ=='
 * The function is independent from the mime type.
 *
 * @param {string} str Base64 url string.
 * @returns {ArrayBuffer} The corresponding buffer.
 */
export function b64urlToArrayBuffer(str) {
  const parts = str.split(';base64,');
  const byteChars = window.atob(parts[1]);
  const buf = new ArrayBuffer(byteChars.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = byteChars.length; i < strLen; i++) {
    bufView[i] = byteChars.charCodeAt(i);
  }
  return buf;
}
