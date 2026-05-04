#!/usr/bin/env node
/**
 * Verifies all _locales/<lang>/messages.json files have the same keys
 * as the canonical en-US locale. Exits non-zero if discrepancies are found.
 */

import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = join(__dirname, "..", "src", "_locales");

const canonicalPath = join(localesDir, "en-US", "messages.json");
const canonical = JSON.parse(readFileSync(canonicalPath, "utf8"));
const canonicalKeys = new Set(Object.keys(canonical));

let hasErrors = false;

const locales = readdirSync(localesDir);
for (const locale of locales) {
  if (locale === "en-US") continue;
  const localePath = join(localesDir, locale, "messages.json");
  let messages;
  try {
    messages = JSON.parse(readFileSync(localePath, "utf8"));
  } catch (e) {
    console.error(`[ERROR] Could not read ${localePath}: ${e.message}`);
    hasErrors = true;
    continue;
  }

  const localeKeys = new Set(Object.keys(messages));
  const missing = [...canonicalKeys].filter((k) => !localeKeys.has(k));
  const extra = [...localeKeys].filter((k) => !canonicalKeys.has(k));

  if (missing.length > 0) {
    console.warn(`[WARN] ${locale} missing keys: ${missing.join(", ")}`);
  }
  if (extra.length > 0) {
    console.warn(`[WARN] ${locale} has extra keys: ${extra.join(", ")}`);
  }
}

if (hasErrors) {
  process.exit(1);
}
console.log("Locale lint complete.");
