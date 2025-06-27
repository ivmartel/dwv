/**
 * RLE (Run-length encoding) decoder class.
 */
export class RleDecoder {

  /**
   * Decode a RLE buffer.
   * Ref: {@link http://dicom.nema.org/dicom/2013/output/chtml/part05/sect_G.3.html}.
   *
   * @param {Array} buffer The buffer to decode.
   * @param {number} bitsAllocated The bits allocated per element in the buffer.
   * @param {boolean} isSigned Is the data signed.
   * @param {number} sliceSize The size of a slice
   *  (number of rows per number of columns).
   * @param {number} samplesPerPixel The number of samples
   *  per pixel (3 for RGB).
   * @param {number} planarConfiguration The planar configuration.
   * @returns {Array} The decoded buffer as a typed array.
   */
  decode(
    buffer,
    bitsAllocated,
    isSigned,
    sliceSize,
    samplesPerPixel,
    planarConfiguration) {

    // bytes per element
    const bpe = bitsAllocated / 8;

    // input
    const inputDataView = new DataView(buffer.buffer, buffer.byteOffset);
    const inputArray = new Int8Array(buffer.buffer, buffer.byteOffset);
    // output
    const outputBuffer = new ArrayBuffer(sliceSize * samplesPerPixel * bpe);
    const outputArray = new Int8Array(outputBuffer);

    // first value of the RLE header is the number of segments
    const numberOfSegments = inputDataView.getInt32(0, true);

    // index increment in output array
    let outputIndexIncrement = 1;
    let incrementFactor = 1;
    if (samplesPerPixel !== 1 && planarConfiguration === 0) {
      incrementFactor *= samplesPerPixel;
    }
    if (bpe !== 1) {
      incrementFactor *= bpe;
    }
    outputIndexIncrement *= incrementFactor;

    // loop on segments
    let outputIndex = 0;
    let inputIndex = 0;
    let remainder = 0;
    let maxOutputIndex = 0;
    let groupOutputIndex = 0;
    for (let segment = 0; segment < numberOfSegments; ++segment) {
      // handle special cases:
      // - more than one sample per pixel: one segment per channel
      // - 16bits: sort high and low bytes
      if (incrementFactor !== 1) {
        remainder = segment % incrementFactor;
        if (remainder === 0) {
          groupOutputIndex = maxOutputIndex;
        }
        outputIndex = groupOutputIndex + remainder;
        // 16bits data
        if (bpe === 2) {
          outputIndex += (remainder % bpe ? -1 : 1);
        }
      }

      // RLE header: list of segment sizes
      const segmentStartIndex =
        inputDataView.getInt32((segment + 1) * 4, true);
      let nextSegmentStartIndex =
        inputDataView.getInt32((segment + 2) * 4, true);
      if (segment === numberOfSegments - 1 || nextSegmentStartIndex === 0) {
        nextSegmentStartIndex = buffer.length;
      }
      // decode segment
      inputIndex = segmentStartIndex;
      let count = 0;
      while (inputIndex < nextSegmentStartIndex) {
        // get the count value
        count = inputArray[inputIndex];
        ++inputIndex;
        // store according to count
        if (count >= 0 && count <= 127) {
          // output the next count+1 bytes literally
          for (let i = 0; i < count + 1; ++i) {
            // store
            outputArray[outputIndex] = inputArray[inputIndex];
            // increment indexes
            ++inputIndex;
            outputIndex += outputIndexIncrement;
          }
        } else if (count <= -1 && count >= -127) {
          // output the next byte -count+1 times
          const value = inputArray[inputIndex];
          ++inputIndex;
          for (let j = 0; j < -count + 1; ++j) {
            // store
            outputArray[outputIndex] = value;
            // increment index
            outputIndex += outputIndexIncrement;
          }
        }
      }

      if (outputIndex > maxOutputIndex) {
        maxOutputIndex = outputIndex;
      }
    }

    let decodedBuffer = null;
    if (bitsAllocated === 8) {
      if (isSigned) {
        decodedBuffer = new Int8Array(outputBuffer);
      } else {
        decodedBuffer = new Uint8Array(outputBuffer);
      }
    } else if (bitsAllocated === 16) {
      if (isSigned) {
        decodedBuffer = new Int16Array(outputBuffer);
      } else {
        decodedBuffer = new Uint16Array(outputBuffer);
      }
    }

    return decodedBuffer;
  };

}
