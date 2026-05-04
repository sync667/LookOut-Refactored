/**
 * Creates a [LookOut] prefixed logger that respects the debug level.
 *
 * @param {number} debugLevel - Messages with level <= debugLevel are printed.
 *   Use 0 to suppress all output; use a large value (e.g. 15) to print everything.
 * @returns {{ log: (msg: string, level?: number) => void, warn: (msg: string) => void, error: (msg: string) => void }}
 */
export function createLogger(debugLevel) {
  return {
    debugLevel,
    log(msg, level = 9) {
      if (level <= debugLevel) {
        console.log(`[LookOut] ${msg}`);
      }
    },
    warn(msg) {
      console.warn(`[LookOut] ${msg}`);
    },
    error(msg) {
      console.error(`[LookOut] ${msg}`);
    },
  };
}
