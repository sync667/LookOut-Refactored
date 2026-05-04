/**
 * Binary stream reader backed by an ArrayBuffer / DataView.
 * Replaces the old PseudoInputStream string-based approach with direct
 * DataView access so that out-of-bounds reads throw immediately rather
 * than silently producing garbage values.
 *
 * This module has no browser-specific dependencies so it can be imported
 * by both the extension runtime and the Jest unit-test suite.
 */
export class TnefReader {
  constructor() {
    /** @type {ArrayBuffer|null} */
    this.buffer = null;
    /** @type {DataView|null} */
    this.view = null;
    /** @type {number} */
    this.offset = 0;
  }

  /**
   * Load a raw ArrayBuffer into the reader (used in tests and internally).
   * @param {ArrayBuffer} arrayBuffer
   */
  loadBuffer(arrayBuffer) {
    this.buffer = arrayBuffer;
    this.view = new DataView(arrayBuffer);
    this.offset = 0;
  }

  /** @returns {number} bytes remaining */
  available() {
    return this.buffer.byteLength - this.offset;
  }

  /**
   * Assert at least `bytes` bytes remain.
   * @param {number} bytes
   */
  test(bytes) {
    if (this.available() < bytes) {
      throw new Error(
        `TnefReader: tried to read ${bytes} bytes but only ${this.available()} remain`
      );
    }
  }

  /**
   * Read n bytes as a plain JS array of unsigned integers.
   * @param {number} bytes
   * @returns {number[]}
   */
  readByteArray(bytes) {
    this.test(bytes);
    const result = [];
    for (let i = 0; i < bytes; i++) {
      result[i] = this.view.getUint8(this.offset + i);
    }
    this.offset += bytes;
    return result;
  }

  /**
   * Read a single byte.
   * @returns {number}
   */
  read8() {
    this.test(1);
    const val = this.view.getUint8(this.offset);
    this.offset += 1;
    return val;
  }

  /**
   * Read n bytes as a binary string (one char per byte, charCode == byte value).
   * The downstream TNEF parser still operates on binary strings.
   * @param {number} bytes
   * @returns {string}
   */
  readBytes(bytes) {
    const arr = this.readByteArray(bytes);
    let s = "";
    for (const b of arr) {
      s += String.fromCharCode(b);
    }
    return s;
  }

  close() {
    // no-op — GC handles the ArrayBuffer
  }
}
