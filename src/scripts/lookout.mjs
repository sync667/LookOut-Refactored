import { tnef_parse } from "/scripts/tnef.mjs";
import { createLogger } from "/scripts/logger.mjs";
import { TnefReader } from "/scripts/tnef-reader.mjs";

/**
 * Extend TnefReader with the ability to load a browser File object.
 * The base class (in tnef-reader.mjs) is dependency-free and testable
 * in Node.js / Jest; this thin subclass adds the browser File API.
 */
class FileTnefReader extends TnefReader {
  constructor() {
    super();
    /** @type {File|null} */
    this.file = null;
  }

  /**
   * Load a File into the reader.
   * @param {File} file
   */
  async setFile(file) {
    this.file = file;
    this.loadBuffer(await file.arrayBuffer());
  }
}

/** @typedef {import("/scripts/tnef.mjs").TnefPrefs} TnefPrefs */

export class TnefExtractor {
  constructor() {
    this.mStream = new FileTnefReader();
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
  onTnefFile(data, filename, content_type, _length, _date) {
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
