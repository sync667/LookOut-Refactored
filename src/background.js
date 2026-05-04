import { TnefExtractor } from "/scripts/lookout.mjs";
import * as storage from "./scripts/storage.mjs";
import { createLogger } from "./scripts/logger.mjs";

// Will be re-created once prefs are loaded; use a default until then.
let log = createLogger(5);

/** @type {Set<number>} tabs currently being processed */
const processingTabs = new Set();

/**
 * Pending message per tab — set when a new displayedMessage event arrives
 * while the tab is still being processed. After the current run finishes we
 * pick this up so fast message switches are never silently dropped.
 * @type {Map<number, { junk: boolean }>}
 */
const pendingMessages = new Map();

/**
 * Handle a single displayed message in a tab.
 * If the tab is already being processed, the new message is queued and
 * will be processed once the current run completes.
 *
 * @param {{ id: number }} tab
 * @param {{ junk: boolean }} message
 */
async function handleMessage(tab, message) {
  if (message.junk) {
    return;
  }

  // If this tab is already being processed, remember the latest message and
  // bail out — the finally-block below will pick it up after the current run.
  if (processingTabs.has(tab.id)) {
    log.log(`Tab ${tab.id} busy — queuing latest message`, 7);
    pendingMessages.set(tab.id, message);
    return;
  }
  processingTabs.add(tab.id);

  try {
    // Read attachments of the message
    const attachments = await browser.Attachment.listAttachments(tab.id);
    if (!attachments || attachments.length === 0) {
      return;
    }

    // Get the current prefs — fall back to documented defaults on error.
    let prefs;
    try {
      prefs = await storage.getPrefs();
    } catch (err) {
      log.error(`Failed to load prefs, using defaults: ${err.message}`);
      prefs = storage.PREF_DEFAULTS;
    }

    // Re-create logger with actual debug level.
    log = createLogger(prefs["debug_enabled"] ? 10 : 5);

    const removedParts = [];
    const tnefAttachments = [];

    for (const attachment of attachments) {
      if (
        attachment.name !== "winmail.dat" &&
        attachment.contentType !== "application/ms-tnef" &&
        prefs["strict_contenttype"]
      ) {
        continue;
      }

      log.log(`Processing TNEF attachment: ${attachment.name}`, 6);

      let file;
      try {
        file = await browser.Attachment.getAttachmentFile(tab.id, attachment.partName);
      } catch (err) {
        log.warn(`Could not read attachment "${attachment.name}": ${err.message}`);
        continue;
      }

      const tnefExtractor = new TnefExtractor();
      const tnefFiles = await tnefExtractor.parse(file, null, prefs);

      for (let i = 0; i < tnefFiles.length; i++) {
        const partName = `${attachment.partName}.${i + 1}`;
        // Skip if we have added that attachment already.
        if (attachments.find((a) => a.partName === partName)) {
          continue;
        }

        const tnefAttachment = {
          contentType: tnefFiles[i].type,
          name: tnefFiles[i].name,
          size: tnefFiles[i].size,
          partName,
          file: tnefFiles[i],
        };
        tnefAttachments.push(tnefAttachment);
        log.log(`Extracted: ${tnefFiles[i].name} (${tnefFiles[i].type})`, 6);
      }

      if (tnefFiles.length > 0 && prefs["remove_winmail_dat"]) {
        removedParts.push(attachment.partName);
      }
    }

    if (removedParts.length > 0) {
      try {
        await browser.Attachment.removeAttachments(tab.id, removedParts);
      } catch (err) {
        log.warn(`removeAttachments failed (tab may be closed): ${err.message}`);
      }
    }
    if (tnefAttachments.length > 0) {
      try {
        await browser.Attachment.addAttachments(tab.id, tnefAttachments);
      } catch (err) {
        log.warn(`addAttachments failed (tab may be closed): ${err.message}`);
      }
    }
  } catch (err) {
    log.error(`handleMessage error for tab ${tab.id}: ${err.message}`);
  } finally {
    processingTabs.delete(tab.id);
    // If a newer message arrived while we were busy, process it now.
    const queued = pendingMessages.get(tab.id);
    if (queued) {
      pendingMessages.delete(tab.id);
      handleMessage(tab, queued);
    }
  }
}

// --- Startup: process all already-open message tabs ---
try {
  const tabs = (await browser.tabs.query({})).filter((t) =>
    ["messageDisplay", "mail"].includes(t.type)
  );
  for (const tab of tabs) {
    const message = await browser.messageDisplay.getDisplayedMessage(tab.id);
    if (message) {
      handleMessage(tab, message);
    }
  }
} catch (err) {
  log.error(`Startup tab scan failed: ${err.message}`);
}

// --- Listeners ---

// onMessageDisplayed fires when a single message is shown.
browser.messageDisplay.onMessageDisplayed.addListener(handleMessage);

// onMessagesDisplayed fires for multi-message displays (TB ≥ 128 unified inbox etc.).
// Use it when available; each call provides the first message in the set.
if (browser.messageDisplay.onMessagesDisplayed) {
  browser.messageDisplay.onMessagesDisplayed.addListener(async (tab, messages) => {
    if (messages && messages.length > 0) {
      await handleMessage(tab, messages[0]);
    }
  });
}
