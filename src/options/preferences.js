/* global i18n */
import * as storage from "../scripts/storage.mjs";

const USER_OPTIONS = [
  "attach_raw_mapi",
  "direct_to_calendar",
  "disable_filename_character_set",
  "remove_winmail_dat",
  "strict_contenttype",
  "debug_enabled",
]


async function update(event) {
  const name = event.target.dataset.preference;
  const value = event.target.checked;
  await browser.storage.local.set({ [name]: value })
}

async function init() {
  // Set the document language to the active UI locale so assistive
  // technologies and spell-checkers see the correct language.
  document.documentElement.lang = browser.i18n.getUILanguage();

  i18n.updateDocument();
  const prefs = await storage.getPrefs();

  for (const name of USER_OPTIONS) {
    const value = prefs[name]; 
    const element = document.getElementById(`${name}_check`);
    element.checked = value;
    element.dataset.preference = name;
    element.addEventListener("change", update);
  }
}

init();
