# LookOut (Refactored)<img src="src/icons/LOicon-64.png" width="80" align="left">

LookOut is an add-on for [Thunderbird](https://www.thunderbird.net/) to interface with Microsoft's mail tools by decoding metadata and attachments encapsulated/embedded in a [TNEF (Transport Neutral Encapsulation Format)](https://en.wikipedia.org/wiki/Transport_Neutral_Encapsulation_Format) encoded attachment (aka winmail.dat).

Support: [Thunderbird](https://www.thunderbird.net/)

## New Contributors are Welcome

If you feel you have anything to contribute please feel welcome to open a pull request or an issue.

## About this Add-on

This is **LookOut (Refactored)** — a fully modernised rewrite of the LookOut add-on family, targeting the latest Thunderbird versions and designed for publication on the [official Thunderbird Add-ons site](https://addons.thunderbird.net/).

### History
- Original LookOut by Aron Rubin (abandoned 2011): https://addons.thunderbird.net/addon/lookout/
- LookOut+ 1.2.15 by Attila K. Mergl (last updated 2013): https://addons.thunderbird.net/addon/lookout-1/
- LookOut (fix version) by Oleksandr / Dugite-Code: https://addons.thunderbird.net/addon/lookout-fix-version/
- **LookOut (Refactored)** — this repository: https://github.com/sync667/LookOut-Refactored

Before use, please remove or disable the original LookOut, LookOut+, and LookOut (fix version)!

## What is LookOut?

LookOut is a plugin which allows [Thunderbird](https://www.thunderbird.net/) to interface with Microsoft's mail tools by decoding metadata and attachments encapsulated/embedded in a TNEF encoded attachment (aka winmail.dat).
The TNEF decoding engine was inspired (with permission) by the [TNEF project](https://github.com/verdammelt/tnef). LookOut has a full [MAPI](https://en.wikipedia.org/wiki/MAPI) decoder and the ability to transcode some of those properties to [iCalendar (ics)](https://en.wikipedia.org/wiki/ICalendar) and [vCard (vcf)](https://en.wikipedia.org/wiki/VCard) formats.
As an option all MAPI properties within an email can be viewed so other types of information can be deciphered.

## Key Improvements in the Refactored Version

- Fully modernised codebase using ES6 modules
- Control logic moved to a background script
- Uses dedicated WebExtension Experiment API for attachment manipulation
- Preferences migrated to `browser.storage.local` (no more legacy prefs dependency)
- Compatible with all current and future Thunderbird versions
- Bug fix: attachment removal no longer accidentally removes extra attachments
- Suitable for publication on the official Thunderbird Add-ons site

## Debugging

Debugging can be enabled in the Settings menu. Output will be presented in the Error Console.

Note: Re-opening a message is necessary to see any debug outputs after a settings change.
