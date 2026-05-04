import { tnef_parse } from "/scripts/tnef.mjs";
import { createLogger } from "/scripts/logger.mjs";

/**
 * Binary stream reader backed by an ArrayBuffer / DataView.
 * Replaces the old PseudoInputStream string-based approach with direct DataView access.
 */
class TnefReader {
  constructor() {
    /** @type {File|null} */
    this.file = null;
    /** @type {ArrayBuffer|null} */
    this.buffer = null;
    /** @type {DataView|null} */
    this.view = null;
    /** @type {number} */
    this.offset = 0;
  }

  /**
   * Load a File into the reader.
   * @param {File} file
   */
  async setFile(file) {
    this.file = file;
    this.buffer = await this.file.arrayBuffer();
    this.view = new DataView(this.buffer);
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
      throw new Error(`TnefReader: tried to read ${bytes} bytes but only ${this.available()} remain`);
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
   * The downstream TNEF parser still operates on binary strings, so we keep this
   * interface while using DataView internally.
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

/** @typedef {import("/scripts/tnef.mjs").TnefPrefs} TnefPrefs */

export class TnefExtractor {
  constructor() {
    this.mStream = new TnefReader();
    this.files = [];
    this.mPartId = 0;
  }

  /**
   * Parse a winmail.dat File and return an array of extracted File objects.
   * @param {File} file
   * @param {*} msgHdr  - legacy parameter, currently unused
   * @param {TnefPrefs} prefs
   * @returns {Promise<File[]>}
   */
  async parse(file, msgHdr, prefs) {
    this.mMsgHdr = msgHdr;

    // The TNEF parser uses debug_level.
    prefs["debug_level"] = prefs["debug_enabled"] ? 10 : 5;

    const log = createLogger(prefs["debug_level"]);

    try {
      await this.mStream.setFile(file);
      tnef_parse(
        this.mStream,
        this.mMsgHdr,
        this,
        prefs
      );
    } catch (err) {
      log.error(`Failed to parse TNEF file "${file.name}": ${err.message}`);
    }

    return this.files;
  }

  /**
   * Called by the TNEF parser for each extracted file.
   * @param {string} data      - binary string of file contents
   * @param {string} filename
   * @param {string} content_type
   * @param {number} length
   * @param {Date}   date
   */
  onTnefFile(data, filename, content_type, length, date) {
    // Strip away path.
    filename = filename.split("\\").pop().split("/").pop();

    if (!content_type) {
      content_type = "application/octet-stream";
    }

    // Convert binary string → Uint8Array so we never trigger UTF-8 re-interpretation.
    const bytes = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      bytes[i] = data.charCodeAt(i) & 0xff;
    }
    this.files.push(new File([bytes], filename, { type: content_type }));
    this.mPartId++;
  }
}
