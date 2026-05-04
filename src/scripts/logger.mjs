/**
 * Creates a [LookOut] prefixed logger that respects the debug level.
 *
 * @param {number} debugLevel - Controls verbosity for `log()` calls.
 *   A `log(msg, level)` call is printed only when `level <= debugLevel`.
 *   Use 0 to suppress all `log()` output; use a large value (e.g. 15) to
 *   print everything.
 *   NOTE: `warn()` and `error()` are always emitted regardless of this
 *   value — they represent conditions that should never be silenced.
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
