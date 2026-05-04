/**
 * Unit tests for TnefReader (src/scripts/tnef-reader.mjs).
 *
 * Run with: node --experimental-vm-modules node_modules/.bin/jest tests/tnef-reader.test.mjs
 *
 * These tests import the production module so they will catch regressions
 * if the implementation in tnef-reader.mjs ever changes.
 */

import { TnefReader } from "../src/scripts/tnef-reader.mjs";

function makeBuffer(...bytes) {
  return new Uint8Array(bytes).buffer;
}

describe("TnefReader", () => {
  test("available() returns full size on fresh buffer", () => {
    const r = new TnefReader();
    r.loadBuffer(makeBuffer(0x01, 0x02, 0x03, 0x04));
    expect(r.available()).toBe(4);
  });

  test("read8() reads a single byte and advances offset", () => {
    const r = new TnefReader();
    r.loadBuffer(makeBuffer(0xAB, 0xCD));
    expect(r.read8()).toBe(0xAB);
    expect(r.offset).toBe(1);
    expect(r.read8()).toBe(0xCD);
    expect(r.offset).toBe(2);
  });

  test("read8() throws at end of buffer", () => {
    const r = new TnefReader();
    r.loadBuffer(makeBuffer(0x01));
    r.read8();
    expect(() => r.read8()).toThrow();
  });

  test("readByteArray() returns correct array", () => {
    const r = new TnefReader();
    r.loadBuffer(makeBuffer(0x01, 0x02, 0x03, 0x04));
    expect(r.readByteArray(3)).toEqual([0x01, 0x02, 0x03]);
    expect(r.available()).toBe(1);
  });

  test("readBytes() returns binary string", () => {
    const r = new TnefReader();
    r.loadBuffer(makeBuffer(65, 66, 67)); // "ABC"
    expect(r.readBytes(3)).toBe("ABC");
  });

  test("readByteArray() interprets TNEF signature bytes correctly", () => {
    // TNEF_SIGNATURE = 0x223e9f78 in little-endian: 78 9f 3e 22
    const r = new TnefReader();
    r.loadBuffer(makeBuffer(0x78, 0x9f, 0x3e, 0x22));
    const bytes = r.readByteArray(4);
    // Reconstruct LE uint32
    const val = bytes[0] + bytes[1] * 256 + bytes[2] * 65536 + bytes[3] * 16777216;
    expect(val).toBe(0x223e9f78);
  });

  test("available() decrements correctly after reads", () => {
    const r = new TnefReader();
    r.loadBuffer(makeBuffer(1, 2, 3, 4, 5));
    r.read8();
    expect(r.available()).toBe(4);
    r.readByteArray(2);
    expect(r.available()).toBe(2);
    r.readBytes(2);
    expect(r.available()).toBe(0);
  });
});
