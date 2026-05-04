<p align="center">
  <img src="src/icons/LOicon-128.png" alt="LookOut logo" width="128">
</p>

<h1 align="center">LookOut (Refactored)</h1>

<p align="center">
  A Thunderbird add-on that decodes TNEF (winmail.dat) attachments from Microsoft mail clients.
</p>

<p align="center">
  <a href="https://github.com/sync667/LookOut-Refactored/actions"><img src="https://github.com/sync667/LookOut-Refactored/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MPL--2.0-blue.svg" alt="License: MPL 2.0"></a>
  <img src="https://img.shields.io/badge/Thunderbird-140%2B-blue?logo=thunderbird" alt="Thunderbird 140+">
</p>

---

## What is LookOut?

LookOut allows [Thunderbird](https://www.thunderbird.net/) to interface with Microsoft mail tools by decoding metadata and attachments encapsulated in a [TNEF (Transport Neutral Encapsulation Format)](https://en.wikipedia.org/wiki/Transport_Neutral_Encapsulation_Format) encoded attachment (aka **winmail.dat**).

The TNEF decoding engine was inspired (with permission) by the [TNEF project](https://github.com/verdammelt/tnef). LookOut includes a full [MAPI](https://en.wikipedia.org/wiki/MAPI) decoder and can transcode properties to [iCalendar (.ics)](https://en.wikipedia.org/wiki/ICalendar) and [vCard (.vcf)](https://en.wikipedia.org/wiki/VCard) formats. Optionally, all MAPI properties within an email can be viewed for further analysis.

## Key Features

- Fully modernised ES6 module codebase
- Background-script-based control logic
- Dedicated WebExtension Experiment API for attachment manipulation
- Preferences via `browser.storage.local` (no legacy dependency)
- Compatible with Thunderbird 140+
- Bug fix: attachment removal no longer accidentally removes extra attachments
- Ready for the [official Thunderbird Add-ons site](https://addons.thunderbird.net/)

## Installation

### From Thunderbird Add-ons (recommended)

Visit the [Thunderbird Add-ons page](https://addons.thunderbird.net/) and search for **LookOut (Refactored)**.

### Manual Install

1. Download the latest `.xpi` from [Releases](https://github.com/sync667/LookOut-Refactored/releases)
2. In Thunderbird: **Add-ons Manager** > gear icon > **Install Add-on From File**
3. Select the downloaded `.xpi`

> **Important:** Disable or remove the original LookOut, LookOut+, and LookOut (fix version) before installing.

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
git clone https://github.com/sync667/LookOut-Refactored.git
cd LookOut-Refactored
npm install
```

### Commands

| Command | Description |
|---|---|
| `npm run lint` | Lint sources with ESLint |
| `npm run lint:locales` | Validate locale files |
| `npm test` | Run unit tests |
| `npm run build` | Build `.xpi` package |

### Loading for Development

1. Open Thunderbird
2. **Add-ons Manager** > **Extensions** > gear icon > **Debug Add-ons**
3. Click **Load Temporary Add-on** and select `src/manifest.json`

## Debugging

Enable debugging in **Settings** (the add-on options page). Output appears in Thunderbird's Error Console (**Tools > Error Console**).

> Note: Re-open the message after changing debug settings to see output.

## History

| Project | Author | Status |
|---|---|---|
| [LookOut](https://addons.thunderbird.net/addon/lookout/) | Aron Rubin | Abandoned 2011 |
| [LookOut+ 1.2.15](https://addons.thunderbird.net/addon/lookout-1/) | Attila K. Mergl | Last updated 2013 |
| [LookOut (fix version)](https://addons.thunderbird.net/addon/lookout-fix-version/) | Oleksandr / Dugite-Code | Maintained |
| **LookOut (Refactored)** | [sync667](https://github.com/sync667) | Active |

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

## License

This project is licensed under the [Mozilla Public License 2.0](LICENSE).
