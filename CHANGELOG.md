# Changelog

All notable changes to LookOut (Refactored) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [8.0.0] - 2025

### Changed
- Fully modernised codebase using ES6 modules
- Control logic moved to a background script
- Uses dedicated WebExtension Experiment API for attachment manipulation
- Preferences migrated to `browser.storage.local` (no more legacy prefs dependency)
- Options page redesigned with modern UI
- Locale directory renamed from `en-US` to `en_US` for Thunderbird compatibility

### Fixed
- Attachment removal no longer accidentally removes extra attachments

### Removed
- LegacyPrefs experiment API (replaced by `browser.storage.local`)

### Added
- 128px icon for high-DPI displays
- Unit test suite (Jest)
- CI pipeline (GitHub Actions): lint, test, build, and release
- ESLint configuration for code quality
- Locale linting script

## Prior History

For earlier versions, see the original projects:
- [LookOut](https://addons.thunderbird.net/addon/lookout/) by Aron Rubin
- [LookOut+](https://addons.thunderbird.net/addon/lookout-1/) by Attila K. Mergl
- [LookOut (fix version)](https://addons.thunderbird.net/addon/lookout-fix-version/) by Oleksandr / Dugite-Code
