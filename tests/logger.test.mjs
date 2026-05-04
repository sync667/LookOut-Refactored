/**
 * Unit tests for src/scripts/logger.mjs
 *
 * Run with: node --experimental-vm-modules node_modules/.bin/jest tests/logger.test.mjs
 */

import { createLogger } from "../src/scripts/logger.mjs";

describe("createLogger", () => {
  let originalLog, originalWarn, originalError;
  let logCalls, warnCalls, errorCalls;

  beforeEach(() => {
    logCalls = [];
    warnCalls = [];
    errorCalls = [];
    originalLog = console.log;
    originalWarn = console.warn;
    originalError = console.error;
    console.log = (...args) => logCalls.push(args);
    console.warn = (...args) => warnCalls.push(args);
    console.error = (...args) => errorCalls.push(args);
  });

  afterEach(() => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  });

  test("log() prints when level <= debugLevel", () => {
    const log = createLogger(7);
    log.log("hello", 5);
    expect(logCalls.length).toBe(1);
    expect(logCalls[0][0]).toContain("[LookOut]");
    expect(logCalls[0][0]).toContain("hello");
  });

  test("log() is silent when level > debugLevel", () => {
    const log = createLogger(4);
    log.log("hidden", 5);
    expect(logCalls.length).toBe(0);
  });

  test("log() uses default level 9 when none provided", () => {
    const log = createLogger(10);
    log.log("default level");
    expect(logCalls.length).toBe(1);
  });

  test("log() is silent at default level when debugLevel is low", () => {
    const log = createLogger(5);
    log.log("should be hidden"); // default level 9 > debugLevel 5
    expect(logCalls.length).toBe(0);
  });

  test("warn() always prints", () => {
    const log = createLogger(0);
    log.warn("something unusual");
    expect(warnCalls.length).toBe(1);
    expect(warnCalls[0][0]).toContain("[LookOut]");
  });

  test("error() always prints", () => {
    const log = createLogger(0);
    log.error("something broke");
    expect(errorCalls.length).toBe(1);
    expect(errorCalls[0][0]).toContain("[LookOut]");
  });

  test("debugLevel property is accessible", () => {
    const log = createLogger(8);
    expect(log.debugLevel).toBe(8);
  });
});
